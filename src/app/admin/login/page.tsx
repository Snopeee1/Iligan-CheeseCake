import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Logo, Photo } from "@/components/ui";
import { Icon, type IconName } from "@/components/Icon";
import { StaffLoginForm } from "@/components/AdminClient";
import { ManilaClock } from "@/components/AuthShell";
import { Dust, Tilt } from "@/components/motion";
import { Words, SpinBadge } from "@/components/fx";
import { getStaff } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

const TILES: { icon: IconName; t: string; d: string; depth: string }[] = [
  { icon: "scan", t: "Counter", d: "Scan the live QR · vouchers with PIN", depth: "float-y" },
  { icon: "cal", t: "Reservations", d: "7-day room grid · confirm in a tap", depth: "float-y d2" },
  { icon: "card", t: "Black Card", d: "Approve · renew · reset PIN", depth: "float-y d3" },
];

export default function AdminLogin() {
  return (
    <main className="grid min-h-dvh bg-cream lg:grid-cols-[1.25fr_1fr]">
      {/* Brand side */}
      <section className="glow-dark spotlight relative hidden overflow-hidden lg:block">
        <Photo name="interior-dining-hall-01" alt="" sizes="60vw" eager className="kenburns !absolute inset-0 opacity-35" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(13,11,10,.96)_25%,rgba(20,17,15,.65)_60%,rgba(142,27,46,.35))]" />
        <span className="blob top-[-140px] right-[-80px] size-[480px] bg-gold/30" />
        <span className="blob bottom-[-160px] left-[-120px] size-[440px] bg-berry/50" style={{ animationDelay: "-6s" }} />
        <Dust />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center justify-between">
            <Logo href="/" />
            <span className="pill">
              <Icon name="shield" size={13} /> Staff area
            </span>
          </div>

          <div className="relative max-w-[560px]">
            <div className="eyebrow fade-up" style={{ animationDelay: "150ms" }}>
              Behind the counter
            </div>
            <Words as="h2" auto delay={200} className="mt-4 font-serif text-[64px] leading-[68px] font-medium text-cream xl:text-[76px] xl:leading-[80px]" parts={[{ t: "Run the House," }, { t: "beautifully.", em: true }]} />
            <p className="fade-up mt-5 max-w-[460px] text-lg leading-8 text-cream/75" style={{ animationDelay: "700ms" }}>
              Reservations, Black Card members, the counter, inquiries and the menu — everything Iligan Cheesecake House needs, in one place.
            </p>
            <div className="fade-up mt-8 text-sm text-gold-light/90" style={{ animationDelay: "900ms" }}>
              <ManilaClock />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {TILES.map((t, i) => (
              <div key={t.t} className={t.depth}>
                <div className="fade-up h-full" style={{ animationDelay: `${1000 + i * 180}ms` }}>
                  <Tilt max={12} className="h-full rounded-2xl">
                    <div className="grid h-full gap-3 rounded-2xl border border-gold/30 bg-[rgba(30,25,22,.72)] p-5 text-cream shadow-[0_30px_60px_-30px_rgba(0,0,0,.8)] backdrop-blur-md transition hover:border-gold">
                      <span className="grid size-11 place-items-center rounded-xl bg-gold text-espresso">
                        <Icon name={t.icon} size={20} />
                      </span>
                      <b className="font-serif text-2xl leading-7">{t.t}</b>
                      <span className="text-xs leading-5 text-cream/65">{t.d}</span>
                    </div>
                  </Tilt>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-end justify-between gap-6">
            <p className="gold-text font-serif text-3xl italic">“Because Life is so Cheesy!”</p>
            <SpinBadge text="ILIGAN CHEESECAKE HOUSE · ADMIN · " className="size-[120px] shrink-0 text-gold-light/80" center={<Icon name="star" size={24} className="text-gold" />} />
          </div>
        </div>

      </section>

      {/* Form side */}
      <section className="relative grid content-center overflow-hidden px-6 py-10 sm:px-12 xl:px-20">
        <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full border border-gold/25" />
        <div className="pointer-events-none absolute -top-10 -right-10 size-44 rounded-full border border-gold/20" />
        <div className="dots pointer-events-none absolute inset-0 opacity-60" />

        <div className="relative mx-auto grid w-full max-w-[440px] gap-8">
          {/* mobile brand header */}
          <div className="glow-dark relative -mx-6 -mt-10 grid gap-5 overflow-hidden px-6 pt-8 pb-9 sm:-mx-12 sm:px-12 lg:hidden">
            <Dust />
            <div className="relative flex items-center justify-between">
              <Logo href="/" />
              <span className="pill">
                <Icon name="shield" size={13} /> Staff
              </span>
            </div>
            <h2 className="relative font-serif text-[40px] leading-[44px] font-medium text-cream">
              Run the House, <em className="text-gold-light">beautifully.</em>
            </h2>
          </div>

          <div className="fade-up">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-espresso text-gold shadow-[var(--shadow-soft)]">
                <Icon name="shield" size={22} />
              </span>
              <div className="eyebrow">Staff &amp; owner sign in</div>
            </div>
            <h1 className="mt-5 font-serif text-[46px] leading-[50px] font-medium">
              Welcome <em className="text-berry">back</em>
            </h1>
            <p className="mt-2 text-muted">Sign in to manage today’s bookings, members and the menu.</p>
          </div>

          <div className="fade-up rounded-3xl border border-line bg-white p-7 shadow-[0_40px_80px_-40px_rgba(42,34,29,.35)] sm:p-8" style={{ animationDelay: "120ms" }}>
            <Suspense fallback={<div className="skeleton h-72" />}>
              <Gate />
            </Suspense>
          </div>

          <div className="fade-up grid gap-4" style={{ animationDelay: "240ms" }}>
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-white/70 px-4 py-3 text-xs text-muted">
              <Icon name="shield" size={16} className="shrink-0 text-sage" />
              Staff only. Sign-in attempts are limited and activity at the counter is recorded with your name.
            </div>
            <div className="flex items-center justify-between text-sm">
              <Link href="/" className="u-link inline-flex items-center gap-1.5 text-muted hover:text-berry">
                <Icon name="back" size={16} /> Back to website
              </Link>
              <Link href="/account/login" className="u-link text-muted hover:text-berry">
                Member sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

async function Gate() {
  if (await getStaff()) redirect("/admin");
  return <StaffLoginForm />;
}
