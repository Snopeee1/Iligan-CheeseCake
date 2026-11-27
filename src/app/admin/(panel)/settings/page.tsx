import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminTitle } from "@/components/AdminBits";
import { AddStaffForm, CallingCardQr, SettingsForm, StaffPasswordForm } from "@/components/AdminClient";
import { requireStaff } from "@/lib/auth";
import { getSettings, list, usingSupabase } from "@/lib/db";

export const metadata: Metadata = { title: "Website & staff" };

export default function SettingsPage() {
  return (
    <>
      <AdminTitle title="Website & staff" sub="The customer offer, the announcement bar, the calling-card QR and staff accounts." />
      <Suspense fallback={<div className="skeleton h-96" />}>
        <Inner />
      </Suspense>
    </>
  );
}

async function Inner() {
  const me = await requireStaff();
  const [s, staff] = await Promise.all([getSettings(), list("staff")]);
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <div className="panel">
        {me.role === "owner" ? <SettingsForm s={s} /> : <p className="text-sm text-muted">Only the owner can change the offer and announcement.</p>}
      </div>
      <div className="grid gap-6">
        <div className="panel">
          <CallingCardQr url={`${site.replace(/\/$/, "")}/card`} />
        </div>
        <div className="panel grid gap-3">
          <h2 className="h4">Staff accounts</h2>
          <ul className="divide-y divide-line text-sm">
            {staff.map((x) => (
              <li key={x.id} className="flex justify-between py-2.5">
                <span>
                  <b>{x.name}</b> <span className="text-muted">· {x.email}</span>
                </span>
                <span className="st mute capitalize">{x.role}</span>
              </li>
            ))}
          </ul>
          {me.role === "owner" ? <AddStaffForm /> : null}
        </div>
        <div className="panel">
          <StaffPasswordForm />
        </div>
        <p className="text-xs text-muted">Data store: {usingSupabase() ? "Supabase (live database)" : "local file (development) — add the Supabase secret key to go live"}.</p>
      </div>
    </div>
  );
}
