import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { Empty } from "@/components/ui";
import { BlackCard3D, Count, Dust, Tilt } from "@/components/motion";
import { Marquee, d } from "@/components/fx";
import { Meter, Ring } from "@/components/DashFx";
import { LiveQr } from "@/components/LiveQr";
import { RouteLoader } from "@/components/RouteLoader";
import { fmtDate, fmtTime, nowMs } from "@/lib/format";
import { requireMember } from "@/lib/auth";
import { list } from "@/lib/db";
import { ROOMS } from "@/lib/content";

export const metadata: Metadata = { title: "My Black Card", robots: { index: false } };

export default function Dashboard() {
  return (
    <Suspense fallback={<RouteLoader label="Opening your Black Card…" />}>
      <DashboardInner />
    </Suspense>
  );
}

const ACT: Record<string, { icon: IconName; tone: string }> = {
  registration: { icon: "card", tone: "bg-sage/15 text-sage" },
  voucher: { icon: "receipt", tone: "bg-berry/10 text-berry" },
  perk: { icon: "coffee", tone: "bg-gold/20 text-gold-deep" },
  birthday: { icon: "gift", tone: "bg-gold/20 text-gold-deep" },
  booking: { icon: "cal", tone: "bg-espresso/10 text-espresso" },
  visit: { icon: "check", tone: "bg-sage/15 text-sage" },
};

async function DashboardInner() {
  const m = await requireMember();
  const [bookings, activity] = await Promise.all([list("bookings", { eq: { memberId: m.id }, order: ["date", "asc"] }), list("activity", { eq: { memberId: m.id }, order: ["at", "desc"], limit: 8 })]);
  const now = nowMs();
  const today = new Date(now + 8 * 3600_000).toISOString().slice(0, 10);
  const upcoming = bookings.filter((b) => b.date >= today && ["pending", "confirmed"].includes(b.status));
  const hour = new Date(now + 8 * 3600_000).getUTCHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const month = new Date(now + 8 * 3600_000).toISOString().slice(5, 7);
  const birthdayMonth = m.birthday?.slice(0, 2) === month;
  const totalDays = Math.max(1, Math.round((new Date(m.expiresAt).getTime() - new Date(m.joinedAt).getTime()) / 86400_000));
  const daysLeft = Math.max(0, Math.ceil((new Date(m.expiresAt).getTime() - now) / 86400_000));
  const first = m.name.split(" ")[0];
  const drinks = activity.filter((a) => a.type === "perk").length;

  return (
    <>
      {/* HERO BAND */}
      <section className="glow-dark spotlight relative overflow-hidden">
        <span className="blob top-[-160px] right-[-100px] size-[460px] bg-gold/30" />
        <span className="blob bottom-[-180px] left-[-120px] size-[420px] bg-berry/45" style={{ animationDelay: "-6s" }} />
        <Dust />
        <div className="wrap relative grid items-center gap-10 py-10 md:py-14 lg:grid-cols-[1fr_440px]">
          <div>
            <div className="eyebrow fade-up">Black Card member since {fmtDate(m.joinedAt, { month: "long", year: "numeric" })}</div>
            <h1 className="fade-up mt-3 font-serif text-[44px] leading-[48px] font-medium text-cream md:text-[60px] md:leading-[64px]" style={{ animationDelay: "120ms" }}>
              {greet}, <em className="gold-text">{first}</em>
            </h1>
            <p className="fade-up mt-3 max-w-md text-cream/70" style={{ animationDelay: "240ms" }}>
              Show your live QR at the counter for your free drink, member discount and vouchers.
            </p>
            <div className="fade-up mt-7 grid max-w-xl grid-cols-3 gap-3" style={{ animationDelay: "360ms" }}>
              {(
                [
                  [String(m.vouchersLeft), "", "vouchers left"],
                  [String(m.visits), "", "visits"],
                  [String(daysLeft), "", "days left on card"],
                ] as [string, string, string][]
              ).map(([v, suf, l]) => (
                <div key={l} className="rounded-2xl border border-gold/25 bg-white/[.05] px-4 py-3 backdrop-blur transition hover:border-gold/60">
                  <b className="block font-serif text-3xl font-semibold text-gold-light">
                    <Count value={v} suffix={suf} />
                  </b>
                  <span className="text-xs text-cream/60">{l}</span>
                </div>
              ))}
            </div>
            <div className="fade-up mt-7 flex flex-wrap gap-3" style={{ animationDelay: "480ms" }}>
              <Link href="/account/card" className="btn btn-gold pulse-ring">
                <Icon name="qr" /> Show my card
              </Link>
              <Link href="/account/book" className="btn btn-outline">
                Book a VIP Room <Icon name="arrow" />
              </Link>
            </div>
          </div>
          <div className="fade-up float-y" style={{ animationDelay: "200ms" }}>
            <BlackCard3D name={m.name.toUpperCase()} sub={m.cardNo} />
          </div>
        </div>
        <div className="relative border-t border-gold/20 bg-black/20 py-3 text-gold-light/80">
          <Marquee speed={45}>
            {["25% off Chef VIP Special Menu", "10% off regular menu · you + 4", "Free Americano or Fruitea every visit", "₱2,000 off every VIP Room", "Free birthday slice", "No minimum spend", "No-waiting service"].map((t) => (
              <span key={t} className="flex items-center gap-7 text-xs font-semibold tracking-[.25em] whitespace-nowrap uppercase">
                {t} <span className="text-gold">✦</span>
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      <div className="wrap grid gap-6 py-8 md:py-10 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="grid gap-6">
          {birthdayMonth ? (
            <div data-reveal="up" className="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-gold bg-gold/15 p-4">
              <span className="float-y grid size-12 flex-none place-items-center rounded-full bg-gold text-espresso">
                <Icon name="gift" />
              </span>
              <p className="text-sm">
                <b>Happy birthday month!</b> Your free slice of cheesecake is waiting — any flavour.{m.birthdaySliceClaimedYear === new Date(now).getFullYear() ? " (Already claimed this year.)" : " Show your card at the counter."}
              </p>
            </div>
          ) : null}
          {daysLeft <= 30 ? (
            <div className="bad-msg" data-reveal="up">
              <Icon name="clock" size={18} /> Your Black Card {daysLeft > 0 ? `expires in ${daysLeft} days` : "has expired"} ({fmtDate(m.expiresAt)}). Ask our team to renew.
            </div>
          ) : null}

          {/* VOUCHERS + VALIDITY */}
          <div className="grid gap-6 md:grid-cols-2">
            <Tilt max={6} className="rounded-[22px]">
              <div data-reveal="up" className="spotlight relative grid h-full grid-cols-[auto_1fr] items-center gap-6 overflow-hidden rounded-[22px] border border-gold/30 p-6 text-cream shadow-[var(--shadow-deep)]" style={{ background: "radial-gradient(400px 200px at 100% 0%, rgba(201,162,75,.28), transparent), var(--color-ink)" }}>
                <Ring value={m.vouchersLeft} max={3} size={128}>
                  <b className="font-serif text-4xl leading-none text-gold-light">{m.vouchersLeft}</b>
                  <span className="text-[10px] tracking-widest text-cream/60 uppercase">of 3</span>
                </Ring>
                <div className="grid gap-1.5">
                  <div className="eyebrow !text-gold-light">Food &amp; drink vouchers</div>
                  <b className="font-serif text-3xl font-semibold">₱{(m.vouchersLeft * 400).toLocaleString()} left</b>
                  <span className="text-sm text-cream/70">One ₱400 voucher per dine-in. Your PIN is asked before each use.</span>
                  <div className="mt-1 flex gap-1.5" aria-hidden="true">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className={`h-1.5 flex-1 rounded-full ${i < m.vouchersLeft ? "bg-gold" : "bg-cream/20"}`} />
                    ))}
                  </div>
                </div>
              </div>
            </Tilt>
            <Tilt max={6} className="rounded-[22px]">
              <div data-reveal="up" style={d(120)} className="panel grid h-full gap-4 !rounded-[22px]">
                <div className="flex items-center justify-between">
                  <div className="eyebrow">Membership</div>
                  <span className="st ok">Active</span>
                </div>
                <div>
                  <b className="font-serif text-3xl font-semibold">
                    <Count value={String(daysLeft)} /> days
                  </b>
                  <span className="block text-sm text-muted">left · valid until {fmtDate(m.expiresAt)}</span>
                </div>
                <Meter value={daysLeft} max={totalDays} color="linear-gradient(90deg,#8E1B2E,#C9A24B)" />
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {[
                    ["10%", "regular · you + 4"],
                    ["25%", "Chef VIP"],
                    [String(drinks), "free drinks so far"],
                  ].map(([a, b]) => (
                    <div key={b} className="rounded-xl bg-cheesecake/60 px-2 py-2.5">
                      <b className="block font-serif text-xl">{a}</b>
                      <span className="text-muted">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Tilt>
          </div>

          {/* QUICK ACTIONS */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {(
              [
                ["/account/book", "home", "Book a VIP Room", "₱2,000 less consumable"],
                ["/menu", "book", "Chef VIP Menu", "See member prices"],
                ["/account/card", "qr", "Show my QR", "At the counter"],
                ["/account/profile", "user", "Profile & PIN", "Keep it safe"],
              ] as [string, IconName, string, string][]
            ).map(([href, icon, t, desc], i) => (
              <Link key={href} href={href} data-reveal="up" style={d(i * 90)} className="panel lift group relative grid gap-1.5 overflow-hidden !p-5">
                <span className="absolute -top-8 -right-8 size-24 rounded-full bg-gold/10 transition duration-500 group-hover:scale-150" />
                <span className="relative grid size-11 place-items-center rounded-xl bg-cheesecake text-berry transition duration-500 group-hover:rotate-[-8deg] group-hover:bg-berry group-hover:text-cream">
                  <Icon name={icon} size={22} />
                </span>
                <b className="relative mt-1 text-[15px]">{t}</b>
                <span className="relative flex items-center justify-between text-xs text-muted">
                  {desc}
                  <Icon name="arrow" size={14} className="-translate-x-2 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                </span>
              </Link>
            ))}
          </div>

          {/* ACTIVITY TIMELINE */}
          <div className="panel !p-0" data-reveal="up">
            <h2 className="flex items-center justify-between px-6 pt-5 font-serif text-2xl font-semibold">
              Activity
              <span className="text-xs font-normal text-muted">Latest {activity.length}</span>
            </h2>
            {activity.length ? (
              <ol className="relative px-6 pt-3 pb-4">
                <span className="absolute top-6 bottom-6 left-[43px] w-px bg-line" aria-hidden="true" />
                {activity.map((a, i) => {
                  const k = ACT[a.type] ?? ACT.visit;
                  return (
                    <li key={a.id} data-reveal="left" style={d(i * 70)} className="relative flex items-center gap-4 rounded-xl px-1 py-3 transition hover:bg-cheesecake/30">
                      <span className={`relative z-10 grid size-10 flex-none place-items-center rounded-full ring-4 ring-white ${k.tone}`}>
                        <Icon name={k.icon} size={17} />
                      </span>
                      <div className="flex-1 text-sm">
                        <b className="font-medium">{a.label}</b>
                        <span className="block text-xs text-muted">{fmtDate(a.at, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                      </div>
                      <span className={`num text-sm font-semibold ${a.type === "voucher" ? "text-berry" : a.type === "registration" ? "text-sage" : "text-muted"}`}>
                        {a.type === "voucher" ? `−₱${a.amount ?? 400}` : a.type === "registration" ? `+₱${(a.amount ?? 1200).toLocaleString()}` : a.type === "perk" || a.type === "birthday" ? "Perk" : ""}
                      </span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <Empty title="No activity yet">Your visits, vouchers and perks will show here.</Empty>
            )}
          </div>
        </div>

        <aside className="grid gap-6 lg:sticky lg:top-24">
          <div data-reveal="right" className="glow-dark relative hidden justify-items-center gap-3 overflow-hidden rounded-[22px] p-6 text-center shadow-[var(--shadow-deep)] md:grid">
            <Dust />
            <div className="eyebrow relative">Show at the counter</div>
            <div className="relative rounded-3xl bg-gradient-to-br from-gold-light via-gold to-gold-deep p-[2px]">
              <div className="rounded-[22px] bg-cream p-3">
                <LiveQr size={170} />
              </div>
            </div>
            <b className="relative text-lg tracking-[3px] text-gold-light">{m.cardNo}</b>
            <span className="relative text-[13px] text-cream/60">Staff scan this for your discount, free drink or voucher.</span>
          </div>
          <div className="panel" data-reveal="right" style={d(100)}>
            <h2 className="mb-2 flex items-center justify-between font-serif text-2xl font-semibold">
              Upcoming
              <Link href="/account/book" className="link !text-sm">
                + Book
              </Link>
            </h2>
            {upcoming.length ? (
              <ul className="divide-y divide-line">
                {upcoming.map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="grid w-12 flex-none rounded-xl bg-espresso py-1.5 text-center text-cream">
                        <b className="font-serif text-xl leading-5">{fmtDate(`${b.date}T12:00:00+08:00`, { day: "numeric" })}</b>
                        <span className="text-[10px] tracking-widest text-gold-light uppercase">{fmtDate(`${b.date}T12:00:00+08:00`, { month: "short" })}</span>
                      </span>
                      <span>
                        <b>{ROOMS.find((r) => r.id === b.room)?.short ?? b.room}</b>
                        <span className="block text-xs text-muted">
                          {fmtTime(b.time)} · {b.guests} guests · {b.occasion}
                        </span>
                      </span>
                    </div>
                    <span className={`st ${b.status === "confirmed" ? "ok" : "pend"}`}>{b.status === "confirmed" ? "Confirmed" : "Pending"}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="grid justify-items-center gap-2 py-4 text-center">
                <span className="float-y grid size-12 place-items-center rounded-full bg-cheesecake text-berry">
                  <Icon name="cal" />
                </span>
                <p className="text-sm text-muted">No bookings yet. Your next celebration is a tap away.</p>
              </div>
            )}
          </div>
          <div className="panel" data-reveal="right" style={d(200)}>
            <h2 className="mb-3 font-serif text-2xl font-semibold">Member perks</h2>
            <ul className="grid gap-2">
              {(
                [
                  ["tag", "Member discounts", "25% Chef VIP Menu · 10% regular, you + 4"],
                  ["coffee", "Free every visit", "Americano or Fruitea · no minimum spend"],
                  ["home", "VIP Rooms", "₱2,000 less consumable"],
                  ["gift", "Birthday month", "A free slice of cheesecake"],
                  ["clock", "No-waiting service", "We bring your order to you"],
                ] as [IconName, string, string][]
              ).map(([i, t, desc]) => (
                <li key={t} className="group flex items-center gap-3 rounded-xl p-2 text-sm transition hover:bg-cheesecake/40">
                  <span className="grid size-9 flex-none place-items-center rounded-full bg-cheesecake text-berry transition group-hover:scale-110 group-hover:bg-gold group-hover:text-espresso">
                    <Icon name={i} size={16} />
                  </span>
                  <span>
                    <b className="block">{t}</b>
                    <span className="text-xs text-muted">{desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
