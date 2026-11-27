import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { BlackCard, Logo } from "@/components/ui";
import { MemberLoginForm } from "@/components/AuthForms";
import { getMember } from "@/lib/auth";

export const metadata: Metadata = { title: "Member sign in", robots: { index: false } };

export default function MemberLogin({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1fr_560px]">
      <div className="glow-dark relative hidden flex-col justify-between overflow-hidden p-14 lg:flex">
        <Logo />
        <BlackCard className="-rotate-[4deg]" />
        <div>
          <p className="font-serif text-[34px] leading-[42px] font-medium text-gold-light italic">“Because Life is so Cheesy!”</p>
          <p className="mt-2.5 max-w-[420px] text-cream/70">Your Black Card account: your digital card, ₱400 vouchers, member discounts and VIP Room bookings at member rates.</p>
        </div>
      </div>
      <div className="grid content-center gap-8 px-6 py-12 sm:px-14">
        <div className="lg:hidden">
          <div className="glow-dark -mx-6 -mt-12 mb-2 grid gap-6 px-6 pt-8 pb-10 sm:-mx-14 sm:px-14">
            <Logo />
            <BlackCard className="max-w-[320px] -rotate-[3deg]" />
          </div>
        </div>
        <div>
          <div className="eyebrow">Black Card members</div>
          <h1 className="mt-2.5 font-serif text-[44px] leading-[48px] font-medium">Welcome back</h1>
          <p className="mt-1 text-muted">Sign in to see your card, vouchers and bookings.</p>
        </div>
        <Suspense fallback={<div className="skeleton h-72" />}>
          <LoginInner searchParams={searchParams} />
        </Suspense>
        <p className="text-sm text-muted">
          Not a member yet?{" "}
          <Link href="/black-card#apply" className="link !text-sm">
            Get a Black Card →
          </Link>
          <span className="mx-2">·</span>
          <Link href="/" className="hover:text-berry">
            Back to website
          </Link>
        </p>
      </div>
    </main>
  );
}

async function LoginInner({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, member] = await Promise.all([searchParams, getMember()]);
  if (member) redirect(next && next.startsWith("/") && !next.startsWith("//") ? next : "/account");
  return <MemberLoginForm next={next} />;
}
