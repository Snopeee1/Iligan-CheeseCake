import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { get, type Member, type Staff } from "./db";

const COOKIE = "ich_session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET must be set (32+ chars)");
    return "dev-only-secret-change-me-dev-only-secret";
  }
  return s;
}

/* ---------- hashing ---------- */
export function hashSecret(plain: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}
export function verifySecret(plain: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const a = Buffer.from(hash, "hex");
  const b = scryptSync(plain, salt, 32);
  return a.length === b.length && timingSafeEqual(a, b);
}

/* ---------- signed session cookie ---------- */
type Session = { sub: string; role: "member" | "staff"; exp: number };

function sign(data: string) {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}
function encode(s: Session) {
  const body = Buffer.from(JSON.stringify(s)).toString("base64url");
  return `${body}.${sign(body)}`;
}
function decode(token?: string): Session | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const s = JSON.parse(Buffer.from(body, "base64url").toString()) as Session;
    return s.exp > Date.now() ? s : null;
  } catch {
    return null;
  }
}

export async function startSession(sub: string, role: Session["role"]) {
  (await cookies()).set(COOKIE, encode({ sub, role, exp: Date.now() + MAX_AGE * 1000 }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}
export async function endSession() {
  (await cookies()).delete(COOKIE);
}

const getSession = cache(async () => {
  const token = (await cookies()).get(COOKIE)?.value;
  await connection(); // session expiry depends on the current time: request-time only
  return decode(token);
});

export const getMember = cache(async (): Promise<Member | null> => {
  const s = await getSession();
  if (!s || s.role !== "member") return null;
  const m = await get("members", s.sub);
  return m && m.status === "active" ? m : null;
});

export const getStaff = cache(async (): Promise<Staff | null> => {
  const s = await getSession();
  if (!s || s.role !== "staff") return null;
  return get("staff", s.sub);
});

export async function requireMember() {
  const m = await getMember();
  if (!m) redirect("/account/login");
  return m;
}
export async function requireStaff() {
  const s = await getStaff();
  if (!s) redirect("/admin/login");
  return s;
}

/* ---------- login throttling (per identifier, in memory) ---------- */
const attempts = new Map<string, { n: number; until: number }>();
export function throttled(key: string) {
  const a = attempts.get(key);
  return !!a && a.until > Date.now();
}
export function recordFailure(key: string) {
  const a = attempts.get(key) ?? { n: 0, until: 0 };
  a.n += 1;
  if (a.n >= 5) {
    a.until = Date.now() + 15 * 60 * 1000;
    a.n = 0;
  }
  attempts.set(key, a);
}
export function clearFailures(key: string) {
  attempts.delete(key);
}

/* ---------- rotating member QR (changes every 30 s) ---------- */
const WINDOW = 30_000;
function qrToken(cardNo: string, w: number) {
  return createHmac("sha256", secret()).update(`${cardNo}:${w}`).digest("base64url").slice(0, 10);
}
export function memberQrPayload(cardNo: string) {
  return `ICH1|${cardNo}|${qrToken(cardNo, Math.floor(Date.now() / WINDOW))}`;
}
/** Accepts a scanned QR payload or a typed card number. Returns the card number and whether the QR was live. */
export function parseScan(input: string): { cardNo: string; verified: boolean } | null {
  const v = input.trim();
  const m = /^ICH1\|([A-Z0-9-]+)\|([A-Za-z0-9_-]{10})$/.exec(v);
  if (m) {
    const w = Math.floor(Date.now() / WINDOW);
    const ok = [w, w - 1].some((x) => qrToken(m[1], x) === m[2]);
    return { cardNo: m[1], verified: ok };
  }
  const card = v.toUpperCase().replace(/\s+/g, "");
  const digits = /^(?:ICH-?BC-?)?(\d{1,5})$/.exec(card);
  if (digits) return { cardNo: `ICH-BC-${digits[1].padStart(4, "0")}`, verified: false };
  return null;
}

export function normalizeMobile(v: string) {
  const d = v.replace(/\D/g, "");
  if (d.startsWith("63") && d.length === 12) return `0${d.slice(2)}`;
  if (d.length === 10 && d.startsWith("9")) return `0${d}`;
  return d;
}
