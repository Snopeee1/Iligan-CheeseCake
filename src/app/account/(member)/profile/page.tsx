import type { Metadata } from "next";
import { Suspense } from "react";
import { ChangePinForm, ProfileForm } from "@/components/AuthForms";
import { requireMember } from "@/lib/auth";
import { fmtDate } from "@/lib/format";

export const metadata: Metadata = { title: "Profile", robots: { index: false } };

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function ProfilePage() {
  return (
    <div className="wrap grid gap-6 py-8 md:py-10">
      <h1 className="font-serif text-[38px] leading-[42px] font-medium md:text-5xl">Profile</h1>
      <Suspense fallback={<div className="skeleton h-96" />}>
        <Inner />
      </Suspense>
    </div>
  );
}

async function Inner() {
  const m = await requireMember();
  const bday = m.birthday ? `${MONTHS[Number(m.birthday.slice(0, 2)) - 1]} ${Number(m.birthday.slice(3))}` : "Not set — ask our staff";
  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <div className="panel grid gap-5">
        <h2 className="h4">Your details</h2>
        <dl className="grid grid-cols-[140px_1fr] gap-y-3 text-sm">
          <dt className="text-muted">Name</dt>
          <dd className="font-semibold">{m.name}</dd>
          <dt className="text-muted">Mobile</dt>
          <dd className="font-semibold">{m.mobile}</dd>
          <dt className="text-muted">Card number</dt>
          <dd className="font-semibold">{m.cardNo}</dd>
          <dt className="text-muted">Birthday</dt>
          <dd className="font-semibold">{bday}</dd>
          <dt className="text-muted">Member since</dt>
          <dd className="font-semibold">{fmtDate(m.joinedAt)}</dd>
          <dt className="text-muted">Valid until</dt>
          <dd className="font-semibold">{fmtDate(m.expiresAt)}</dd>
        </dl>
        <p className="text-xs text-muted">To change your name, mobile number or birthday, please ask our staff — they’re tied to your card.</p>
        <ProfileForm email={m.email} />
      </div>
      <div className="panel">
        <ChangePinForm />
      </div>
    </div>
  );
}
