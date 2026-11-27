"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { randomInt } from "crypto";
import { findOne, get, insert, list, update, upsert, type Booking, type Member } from "@/lib/db";
import { clearFailures, endSession, getStaff, hashSecret, normalizeMobile, parseScan, recordFailure, startSession, throttled, verifySecret } from "@/lib/auth";
import { ALL_ITEMS } from "@/lib/content";

export type Result = { ok?: boolean; error?: string; message?: string; data?: Record<string, unknown> };

async function staff() {
  const s = await getStaff();
  if (!s) redirect("/admin/login");
  return s;
}
const str = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);
const oneYear = (from = new Date()) => new Date(from.getFullYear() + 1, from.getMonth(), from.getDate()).toISOString();
const tempPin = () => {
  let p = "";
  do p = String(randomInt(1000, 10000));
  while (/^(\d)\1{3}$/.test(p) || p === "1234");
  return p;
};
async function nextCardNo() {
  const all = await list("members");
  const max = all.reduce((n, m) => Math.max(n, Number(m.cardNo.replace(/\D/g, "")) || 0), 0);
  return `ICH-BC-${String(max + 1).padStart(4, "0")}`;
}

/* ---------- auth ---------- */
export async function staffLogin(_: Result, f: FormData): Promise<Result> {
  const email = str(f, "email", 120).toLowerCase();
  const password = String(f.get("password") ?? "");
  const key = `s:${email}`;
  if (!email || !password) return { error: "Enter your email and password." };
  if (throttled(key)) return { error: "Too many tries. Please wait 15 minutes." };
  const s = await findOne("staff", { email });
  if (!s || !verifySecret(password, s.passwordHash)) {
    recordFailure(key);
    return { error: "Email or password is incorrect." };
  }
  clearFailures(key);
  await startSession(s.id, "staff");
  redirect("/admin");
}
export async function staffLogout() {
  await endSession("staff");
  redirect("/admin/login");
}

/* ---------- reservations ---------- */
export async function setBookingStatus(id: string, status: Booking["status"], staffNote?: string): Promise<Result> {
  const s = await staff();
  const b = await get("bookings", id);
  if (!b) return { error: "Booking not found." };
  if (status === "confirmed") {
    const clash = (await list("bookings", { eq: { room: b.room, date: b.date, time: b.time, status: "confirmed" } })).filter((x) => x.id !== id);
    if (clash.length) return { error: "Another booking is already confirmed for that room and time." };
  }
  await update("bookings", id, { status, staffNote: staffNote?.slice(0, 500) || b.staffNote || null });
  if (status === "confirmed" && b.memberId) await insert("activity", { memberId: b.memberId, type: "booking", label: `Booking confirmed · ${b.room} · ${b.date} ${b.time}`, at: new Date().toISOString(), by: s.name });
  refresh();
  return { ok: true };
}

/* ---------- inquiries ---------- */
export async function setInquiryStatus(id: string, status: "open" | "done"): Promise<Result> {
  await staff();
  await update("inquiries", id, { status });
  refresh();
  return { ok: true };
}

/* ---------- members ---------- */
async function createMember(input: { name: string; mobile: string; email?: string | null; birthday?: string | null }, by: string) {
  const pin = tempPin();
  const now = new Date();
  const m = await insert("members", {
    cardNo: await nextCardNo(),
    name: input.name,
    mobile: input.mobile,
    email: input.email || null,
    birthday: input.birthday || null,
    pinHash: hashSecret(pin),
    joinedAt: now.toISOString(),
    expiresAt: oneYear(now),
    vouchersLeft: 3,
    visits: 0,
    status: "active",
  } as Omit<Member, "id" | "createdAt">);
  await insert("activity", { memberId: m.id, type: "registration", label: "Black Card registered · ₱2,200 paid · 3 × ₱400 vouchers added", amount: 1200, at: now.toISOString(), by });
  return { m, pin };
}

export async function approveApplication(id: string): Promise<Result> {
  const s = await staff();
  const a = await get("applications", id);
  if (!a || a.status !== "new") return { error: "Application not found or already handled." };
  if (await findOne("members", { mobile: a.mobile })) return { error: "A member with this mobile number already exists." };
  const { m, pin } = await createMember(a, s.name);
  await update("applications", id, { status: "approved", memberId: m.id });
  refresh();
  return { ok: true, message: `Approved. Card ${m.cardNo} is active.`, data: { cardNo: m.cardNo, pin, name: m.name, mobile: m.mobile } };
}
export async function declineApplication(id: string): Promise<Result> {
  await staff();
  await update("applications", id, { status: "declined" });
  refresh();
  return { ok: true };
}

export async function addMember(_: Result, f: FormData): Promise<Result> {
  const s = await staff();
  const name = str(f, "name", 80);
  const mobile = normalizeMobile(str(f, "mobile", 20));
  const birthday = str(f, "birthday", 5);
  if (name.length < 2) return { error: "Enter the member’s full name." };
  if (!/^09\d{9}$/.test(mobile)) return { error: "Use an 11-digit mobile number, e.g. 09171234567." };
  if (birthday && !/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(birthday)) return { error: "Birthday must be MM-DD, e.g. 03-27." };
  if (f.get("paid") !== "on") return { error: "Confirm the ₱2,200 payment was received." };
  if (await findOne("members", { mobile })) return { error: "A member with this mobile number already exists." };
  const { m, pin } = await createMember({ name, mobile, email: str(f, "email", 120) || null, birthday: birthday || null }, s.name);
  refresh();
  return { ok: true, message: `Card ${m.cardNo} created.`, data: { cardNo: m.cardNo, pin, name, mobile } };
}

export async function resetPin(memberId: string): Promise<Result> {
  await staff();
  const pin = tempPin();
  const m = await update("members", memberId, { pinHash: hashSecret(pin) });
  if (!m) return { error: "Member not found." };
  return { ok: true, message: "New temporary PIN created.", data: { pin, cardNo: m.cardNo, name: m.name } };
}

export async function renewMember(memberId: string): Promise<Result> {
  const s = await staff();
  const m = await get("members", memberId);
  if (!m) return { error: "Member not found." };
  const base = new Date(Math.max(Date.now(), new Date(m.expiresAt).getTime()));
  await update("members", memberId, { expiresAt: oneYear(base), vouchersLeft: 3, status: "active" });
  await insert("activity", { memberId, type: "registration", label: "Black Card renewed · ₱2,200 paid · 3 × ₱400 vouchers added", amount: 1200, at: new Date().toISOString(), by: s.name });
  refresh();
  return { ok: true, message: "Renewed for 1 year with 3 fresh vouchers." };
}

export async function setMemberStatus(memberId: string, status: "active" | "suspended"): Promise<Result> {
  await staff();
  await update("members", memberId, { status });
  refresh();
  return { ok: true };
}

/* ---------- counter: scan & redeem ---------- */
export type ScanMember = { id: string; name: string; cardNo: string; mobile: string; vouchersLeft: number; expiresAt: string; status: string; visits: number; birthdayMonth: boolean; birthdayClaimed: boolean; verified: boolean; expired: boolean };

export async function lookupCard(input: string): Promise<Result & { member?: ScanMember }> {
  await staff();
  const parsed = parseScan(input);
  let m: Member | null = null;
  let verified = false;
  if (parsed) {
    m = await findOne("members", { cardNo: parsed.cardNo });
    verified = parsed.verified;
  } else if (/^0?9\d{9}$/.test(input.replace(/\D/g, ""))) {
    m = await findOne("members", { mobile: normalizeMobile(input) });
  }
  if (!m) return { error: "No member found for that code, card number or mobile." };
  const month = new Date(Date.now() + 8 * 3600_000).toISOString().slice(5, 7);
  return {
    ok: true,
    member: {
      id: m.id,
      name: m.name,
      cardNo: m.cardNo,
      mobile: m.mobile.replace(/^(\d{4})\d{4}(\d{3})$/, "$1•••$2"),
      vouchersLeft: m.vouchersLeft,
      expiresAt: m.expiresAt,
      status: m.status,
      visits: m.visits,
      birthdayMonth: m.birthday?.slice(0, 2) === month,
      birthdayClaimed: m.birthdaySliceClaimedYear === new Date().getFullYear(),
      verified,
      expired: new Date(m.expiresAt).getTime() < Date.now(),
    },
  };
}

export async function recordVisit(_: Result, f: FormData): Promise<Result> {
  const s = await staff();
  const memberId = str(f, "memberId", 60);
  const useVoucher = f.get("voucher") === "on";
  const freeDrink = str(f, "drink", 40);
  const birthday = f.get("birthday") === "on";
  const pin = str(f, "pin", 6);
  const m = await get("members", memberId);
  if (!m) return { error: "Member not found." };
  if (m.status !== "active") return { error: "This card is suspended." };
  if (new Date(m.expiresAt).getTime() < Date.now()) return { error: "This card has expired. Renew it first." };
  const notes: string[] = [];
  if (useVoucher) {
    const key = `pin:${m.id}`;
    if (throttled(key)) return { error: "Too many wrong PINs for this card. Try again in 15 minutes." };
    if (!verifySecret(pin, m.pinHash)) {
      recordFailure(key);
      return { error: "The member’s PIN is incorrect. The voucher was not used." };
    }
    clearFailures(key);
    if (m.vouchersLeft < 1) return { error: "No vouchers left on this card." };
    const ok = await update("members", m.id, { vouchersLeft: m.vouchersLeft - 1 }, { vouchersLeft: m.vouchersLeft });
    if (!ok) return { error: "The card changed while you were working. Scan it again." };
    await insert("activity", { memberId: m.id, type: "voucher", label: `₱400 voucher used (${m.vouchersLeft - 1} left)`, amount: 400, at: new Date().toISOString(), by: s.name });
    notes.push("₱400 voucher deducted");
  }
  if (freeDrink) {
    await insert("activity", { memberId: m.id, type: "perk", label: `Free ${freeDrink}`, at: new Date().toISOString(), by: s.name });
    notes.push(`free ${freeDrink}`);
  }
  if (birthday) {
    const y = new Date().getFullYear();
    if (m.birthdaySliceClaimedYear === y) return { error: "The birthday slice was already claimed this year." };
    await update("members", m.id, { birthdaySliceClaimedYear: y });
    await insert("activity", { memberId: m.id, type: "birthday", label: "Free birthday slice of cheesecake", at: new Date().toISOString(), by: s.name });
    notes.push("birthday slice");
  }
  const fresh = await get("members", m.id);
  await update("members", m.id, { visits: (fresh?.visits ?? m.visits) + 1 });
  if (!notes.length) await insert("activity", { memberId: m.id, type: "visit", label: "Dine-in visit · member discount applied", at: new Date().toISOString(), by: s.name });
  refresh();
  return { ok: true, message: `Saved for ${m.name}: ${notes.length ? notes.join(", ") : "visit with member discount"}.` };
}

/* ---------- menu ---------- */
export async function saveMenuItem(_: Result, f: FormData): Promise<Result> {
  await staff();
  const key = str(f, "key", 160);
  if (!ALL_ITEMS.some((i) => i.key === key)) return { error: "Unknown item." };
  const raw = str(f, "price", 8);
  const price = raw === "" ? null : Number(raw);
  if (price !== null && (!Number.isInteger(price) || price < 0 || price > 100000)) return { error: "Price must be a whole number of pesos." };
  await upsert("menu_overrides", { key, price, available: f.get("available") === "on", hidden: f.get("hidden") === "on", updatedAt: new Date().toISOString() });
  refresh();
  return { ok: true, message: "Saved." };
}
export async function toggleAvailable(key: string, available: boolean): Promise<Result> {
  await staff();
  const cur = await get("menu_overrides", key);
  await upsert("menu_overrides", { key, price: cur?.price ?? null, hidden: cur?.hidden ?? false, available, updatedAt: new Date().toISOString() });
  refresh();
  return { ok: true };
}

/* ---------- site settings ---------- */
export async function saveSettings(_: Result, f: FormData): Promise<Result> {
  const s = await staff();
  if (s.role !== "owner") return { error: "Only the owner can change site settings." };
  const offerHeadline = str(f, "offerHeadline", 120);
  if (!/5–10%|5-10%/.test(offerHeadline) || !/selected/i.test(offerHeadline)) return { error: "Keep “5–10%” and “selected” in the offer headline, as agreed with the client." };
  await upsert("settings", {
    id: 1,
    offerHeadline,
    offerBody: str(f, "offerBody", 400),
    offerActive: f.get("offerActive") === "on",
    announcement: str(f, "announcement", 200),
    announcementActive: f.get("announcementActive") === "on",
  });
  refresh();
  return { ok: true, message: "Website updated." };
}

/* ---------- staff accounts (owner) ---------- */
export async function addStaff(_: Result, f: FormData): Promise<Result> {
  const s = await staff();
  if (s.role !== "owner") return { error: "Only the owner can add staff." };
  const name = str(f, "name", 80);
  const email = str(f, "email", 120).toLowerCase();
  const password = String(f.get("password") ?? "");
  if (name.length < 2) return { error: "Enter a name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email." };
  if (password.length < 10) return { error: "Password must be at least 10 characters." };
  if (await findOne("staff", { email })) return { error: "That email already has an account." };
  await insert("staff", { name, email, passwordHash: hashSecret(password), role: "staff" });
  refresh();
  return { ok: true, message: `${name} can now sign in.` };
}

export async function changeStaffPassword(_: Result, f: FormData): Promise<Result> {
  const s = await staff();
  const current = String(f.get("current") ?? "");
  const next = String(f.get("next") ?? "");
  if (!verifySecret(current, s.passwordHash)) return { error: "Current password is incorrect." };
  if (next.length < 10) return { error: "New password must be at least 10 characters." };
  await update("staff", s.id, { passwordHash: hashSecret(next) });
  return { ok: true, message: "Password changed." };
}
