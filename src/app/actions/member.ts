"use server";

import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { findOne, update } from "@/lib/db";
import { clearFailures, endSession, getMember, hashSecret, memberQrPayload, normalizeMobile, recordFailure, startSession, throttled, verifySecret } from "@/lib/auth";

export type AuthState = { error?: string; ok?: boolean; message?: string };

const safeNext = (n: unknown, fallback: string) => {
  const s = String(n ?? "");
  return s.startsWith("/") && !s.startsWith("//") ? s : fallback;
};

export async function memberLogin(_: AuthState, f: FormData): Promise<AuthState> {
  const raw = String(f.get("id") ?? "").trim();
  const pin = String(f.get("pin") ?? "").trim();
  if (!raw || !/^\d{4,6}$/.test(pin)) return { error: "Enter your mobile number (or card number) and your 4-digit PIN." };
  const isCard = /^ich/i.test(raw) || /^\d{1,4}$/.test(raw);
  const key = `m:${raw.toLowerCase()}`;
  if (throttled(key)) return { error: "Too many tries. Please wait 15 minutes, or ask our staff to reset your PIN." };
  const member = isCard
    ? await findOne("members", { cardNo: `ICH-BC-${raw.replace(/\D/g, "").padStart(4, "0")}` })
    : await findOne("members", { mobile: normalizeMobile(raw) });
  if (!member || member.status !== "active" || !verifySecret(pin, member.pinHash)) {
    recordFailure(key);
    return { error: "That number and PIN don’t match. Please try again." };
  }
  clearFailures(key);
  await startSession(member.id, "member");
  redirect(safeNext(f.get("next"), "/account"));
}

export async function memberLogout() {
  await endSession();
  redirect("/account/login");
}

/** Fresh rotating QR (SVG) for the signed-in member. */
export async function myQr(): Promise<{ svg: string; at: number } | null> {
  const m = await getMember();
  if (!m) return null;
  const svg = await QRCode.toString(memberQrPayload(m.cardNo), { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#14110F", light: "#FFFFFF" } });
  return { svg, at: Date.now() };
}

export async function changePin(_: AuthState, f: FormData): Promise<AuthState> {
  const m = await getMember();
  if (!m) redirect("/account/login");
  const current = String(f.get("current") ?? "");
  const next = String(f.get("next") ?? "");
  const confirm = String(f.get("confirm") ?? "");
  if (!verifySecret(current, m.pinHash)) return { error: "Your current PIN is not correct." };
  if (!/^\d{4}$/.test(next)) return { error: "Your new PIN must be 4 digits." };
  if (/^(\d)\1{3}$/.test(next) || ["1234", "4321", "0000"].includes(next)) return { error: "Please choose a PIN that’s harder to guess." };
  if (next !== confirm) return { error: "The new PINs don’t match." };
  await update("members", m.id, { pinHash: hashSecret(next) });
  return { ok: true, message: "Your PIN has been changed." };
}

export async function updateProfile(_: AuthState, f: FormData): Promise<AuthState> {
  const m = await getMember();
  if (!m) redirect("/account/login");
  const email = String(f.get("email") ?? "").trim().slice(0, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "That email doesn’t look right." };
  await update("members", m.id, { email: email || null });
  return { ok: true, message: "Saved." };
}
