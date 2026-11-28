import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Logo } from "@/components/ui";
import { Icon, type IconName } from "@/components/Icon";
import { MemberLoginForm } from "@/components/AuthForms";
import { BlackCard3D, Dust } from "@/components/motion";
import { Words } from "@/components/fx";
import { getMember } from "@/lib/auth";
import { FairyLights } from "@/components/decor";

export const metadata: Metadata = { title: "Member sign in", robots: { index: false } };

const PERKS: [IconName, string][] = [
  ["qr", "Live QR card on your phone"],
  ["coffee", "Free Americano or Fruitea every visit"],
  ["tag", "25% Chef VIP · 10% regular menu"],
  ["home", "₱2,000 off every VIP Room"],
];

export default function MemberLogin({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return (
    <main className="grid min-h-dvh bg-cream lg:grid-cols-[1.2fr_1fr]">
      <section className="glow-dark spotlight relative overflow-hidden">
        <FairyLights drape className="absolute inset-x-0 top-0 z-[1] opacity-90" swags={5} />
        <span className="blob top-[-140px] right-[-80px] size-[480px] bg-gold/30" />
        <span className="blob bottom-[-160px] left-[-120px] size-[440px] bg-sage/50" style={{ animationDelay: "-6s" }} />
        <Dust />
        <div className="relative flex h-full flex-col gap-8 p-6 pb-10 sm:p-10 lg:justify-between lg:p-14">
          <div className="flex items-center justify-between">
            <Logo href="/" />
            <span className="pill">Premium VIP Member</span>
          </div>
          <div className="grid gap-8 xl:grid-cols-[1fr_1fr] xl:items-center">
            <div className="hidden lg:block">
              <div className="eyebrow fade-up">Black Card members</div>
              <Words as="h2" auto delay={150} className="mt-4 font-serif text-[56px] leading-[60px] font-medium text-cream" parts={[{ t: "Your card," }, { t: "your perks.", em: true }]} />
              <ul className="mt-6 grid gap-3">
                {PERKS.map(([i, t], n) => (
                  <li key={t} className="fade-up flex items-center gap-3 text-cream/85" style={{ animationDelay: `${500 + n * 110}ms` }}>
                    <span className="grid size-9 place-items-center rounded-full bg-gold/15 text-gold-light">
                      <Icon name={i} size={17} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="fade-up float-y" style={{ animationDelay: "250ms" }}>
              <BlackCard3D />
            </div>
          </div>
          <p className="gold-text hidden font-serif text-3xl italic lg:block">“Because Life is so Cheesy!”</p>
        </div>
      </section>

      <section className="relative grid content-center overflow-hidden px-6 py-12 sm:px-12 xl:px-20">
        <div className="dots pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full border border-gold/25" />
        <div className="relative mx-auto grid w-full max-w-[440px] gap-8">
          <div className="fade-up">
            <div className="eyebrow">Black Card sign in</div>
            <h1 className="mt-3 font-serif text-[46px] leading-[50px] font-medium">
              Welcome <em className="text-berry">back</em>
            </h1>
            <p className="mt-2 text-muted">See your digital card, vouchers and bookings.</p>
          </div>
          <div className="fade-up rounded-3xl border border-line bg-white p-7 shadow-[0_40px_80px_-40px_rgba(42,34,29,.35)] sm:p-8" style={{ animationDelay: "120ms" }}>
            <Suspense fallback={<div className="skeleton h-72" />}>
              <LoginInner searchParams={searchParams} />
            </Suspense>
          </div>
          <div className="fade-up grid gap-3 text-sm" style={{ animationDelay: "240ms" }}>
            <Link href="/black-card#apply" className="flex items-center justify-between rounded-2xl border border-gold/40 bg-gold/10 px-5 py-4 transition hover:border-gold hover:bg-gold/20">
              <span>
                <b className="block">Not a member yet?</b>
                <span className="text-xs text-muted">₱2,200 a year · ₱1,200 comes back as vouchers</span>
              </span>
              <Icon name="arrow" className="text-berry" />
            </Link>
            <Link href="/" className="u-link inline-flex items-center gap-1.5 justify-self-start text-muted hover:text-berry">
              <Icon name="back" size={16} /> Back to website
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

async function LoginInner({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, member] = await Promise.all([searchParams, getMember()]);
  if (member) redirect(next && next.startsWith("/") && !next.startsWith("//") ? next : "/account");
  return <MemberLoginForm next={next} />;
}
