"use server";

import { insert, list } from "@/lib/db";
import { getMember, normalizeMobile } from "@/lib/auth";
import { ROOMS, TIME_SLOTS } from "@/lib/content";

export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string>; values?: Record<string, string> };

const str = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);
const values = (f: FormData) => Object.fromEntries([...f.entries()].filter(([, v]) => typeof v === "string").map(([k, v]) => [k, String(v)]));
const validMobile = (m: string) => /^09\d{9}$/.test(m);
const isClosedDay = (d: string) => new Date(`${d}T12:00:00+08:00`).getUTCDay() === 1;
const todayPH = () => new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 10);

/* simple per-IP-less spam guard: honeypot field "company" must be empty */
const isBot = (f: FormData) => str(f, "company") !== "";

export async function submitInquiry(_: FormState, f: FormData): Promise<FormState> {
  if (isBot(f)) return { ok: true, message: "Thanks!" };
  const topic = str(f, "topic", 40) || "General";
  const name = str(f, "name", 80);
  const contact = str(f, "contact", 120);
  const message = str(f, "message", 1500);
  const date = str(f, "date", 10);
  const guests = Number(str(f, "guests", 3)) || null;
  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Please enter your name.";
  if (contact.length < 5) errors.contact = "Please enter a mobile number or Messenger name.";
  if (date && date < todayPH()) errors.date = "Please choose today or a later date.";
  if (guests !== null && (guests < 1 || guests > 60)) errors.guests = "Guests must be between 1 and 60.";
  if (Object.keys(errors).length) return { errors, values: values(f) };
  await insert("inquiries", { topic, name, contact, message, date: date || null, guests, source: str(f, "source") === "card" ? "card" : "website", status: "open" });
  return { ok: true, message: `Thank you, ${name.split(" ")[0]}! We received your message and will get back to you on Messenger or by phone.` };
}

export async function requestBooking(_: FormState, f: FormData): Promise<FormState> {
  if (isBot(f)) return { ok: true, message: "Thanks!" };
  const room = str(f, "room", 20);
  const date = str(f, "date", 10);
  const time = str(f, "time", 5);
  const guests = Number(str(f, "guests", 3));
  const occasion = str(f, "occasion", 60);
  const name = str(f, "name", 80);
  const contact = str(f, "contact", 120);
  const notes = str(f, "notes", 1000);
  const useVoucher = f.get("useVoucher") === "on";
  const r = ROOMS.find((x) => x.id === room);
  const errors: Record<string, string> = {};
  if (!r) errors.room = "Please choose a room.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.date = "Please choose a date.";
  else if (date < todayPH()) errors.date = "Please choose today or a later date.";
  else if (isClosedDay(date)) errors.date = "We’re closed on Mondays. Please pick another day (or message us for special occasions).";
  if (!(TIME_SLOTS as readonly string[]).includes(time)) errors.time = "Please choose a time.";
  if (!guests || guests < 1) errors.guests = "How many guests?";
  else if (r && guests > r.max) errors.guests = `${r.short} fits up to ${r.max} guests.`;
  if (name.length < 2) errors.name = "Please enter your name.";
  if (contact.length < 5) errors.contact = "Please enter a mobile number or Messenger name.";
  if (Object.keys(errors).length) return { errors, values: values(f) };

  const taken = await list("bookings", { eq: { room, date, time } });
  if (taken.some((b) => b.status === "confirmed")) return { errors: { time: "That slot is already booked. Please pick another time." }, values: values(f) };

  const member = await getMember();
  await insert("bookings", { room, date, time, guests, occasion, name, contact, notes: notes || null, memberId: member?.id ?? null, useVoucher: !!member && useVoucher, status: "pending" });
  return { ok: true, message: `Request sent! We’ll message you to confirm ${r!.short} on ${new Date(`${date}T12:00:00+08:00`).toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric" })}.` };
}

export async function applyBlackCard(_: FormState, f: FormData): Promise<FormState> {
  if (isBot(f)) return { ok: true, message: "Thanks!" };
  const name = str(f, "name", 80);
  const mobile = normalizeMobile(str(f, "mobile", 20));
  const email = str(f, "email", 120);
  const birthday = str(f, "birthday", 5);
  const payment = str(f, "payment", 10) as "cash" | "card" | "bank";
  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Please enter your full name.";
  if (!validMobile(mobile)) errors.mobile = "Use an 11-digit mobile number, e.g. 0917 123 4567.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "That email doesn’t look right.";
  if (birthday && !/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(birthday)) errors.birthday = "Choose your birth month and day.";
  if (!["cash", "card", "bank"].includes(payment)) errors.payment = "Choose how you’ll pay.";
  if (f.get("agree") !== "on") errors.agree = "Please agree so we can contact you.";
  if (Object.keys(errors).length) return { errors, values: values(f) };
  const existing = await list("applications", { eq: { mobile, status: "new" } });
  if (!existing.length) await insert("applications", { name, mobile, email: email || null, birthday: birthday || null, payment, source: "website", status: "new" });
  return { ok: true, message: `Thank you, ${name.split(" ")[0]}! Your Black Card application is in. Our team will contact you at ${mobile} to complete your ₱2,200 payment and activate your digital card.` };
}
