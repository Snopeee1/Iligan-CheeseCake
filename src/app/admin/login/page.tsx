import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Logo } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { StaffLoginForm } from "@/components/AdminClient";
import { getStaff } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function AdminLogin() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#F6F1E8] px-5 py-12">
      <div className="grid w-full max-w-md gap-7">
        <div className="glow-dark grid gap-5 rounded-3xl p-7">
          <Logo href="/" />
          <div>
            <div className="eyebrow">Staff &amp; owner</div>
            <h1 className="mt-2 font-serif text-4xl font-medium">ICH Admin</h1>
            <p className="mt-1 text-sm text-cream/70">Reservations, Black Card members, the counter, inquiries and the menu.</p>
          </div>
        </div>
        <div className="panel">
          <Suspense fallback={<div className="skeleton h-60" />}>
            <Gate />
          </Suspense>
        </div>
        <p className="flex items-center justify-center gap-2 text-xs text-muted">
          <Icon name="shield" size={14} /> Staff only. Activity is recorded.{" "}
          <Link href="/" className="font-semibold text-berry">
            Back to website
          </Link>
        </p>
      </div>
    </main>
  );
}

async function Gate() {
  if (await getStaff()) redirect("/admin");
  return <StaffLoginForm />;
}
