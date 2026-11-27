import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { Empty } from "@/components/ui";
import { BlackCard3D } from "@/components/motion";
import { LiveQr } from "@/components/LiveQr";
import { fmtDate, fmtTime, nowMs } from "@/lib/format";
import { requireMember } from "@/lib/auth";
import { list } from "@/lib/db";
import { ROOMS } from "@/lib/content";

export const metadata: Metadata = { title: "My Black Card", robots: { index: false } };

export default function Dashboard() {
  return (
    <Suspense fallback={<Skeleton />}>
      <DashboardInner />
    </Suspense>
  );
}

function Skeleton() {
  return (
    <div className="wrap grid gap-6 py-10">
      <div className="skeleton h-14 w-80" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="skeleton h-64" />
        <div className="skeleton h-64" />
      </div>
    </div>
  );
}

async function DashboardInner() {
  const m = await requireMember();
  const [bookings, activity] = await Promise.all([list("bookings", { eq: { memberId: m.id }, order: ["date", "asc"] }), list("activity", { eq: { memberId: m.id }, order: ["at", "desc"], limit: 8 })]);
  const today = new Date(nowMs() + 8 * 3600_000).toISOString().slice(0, 10);
  const upcoming = bookings.filter((b) => b.date >= today && ["pending", "confirmed"].includes(b.status));
  const hour = new Date(nowMs() + 8 * 3600_000).getUTCHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const month = new Date(nowMs() + 8 * 3600_000).toISOString().slice(5, 7);
  const birthdayMonth = m.birthday?.slice(0, 2) === month;
  const daysLeft = Math.ceil((new Date(m.expiresAt).getTime() - nowMs()) / 86400_000);
  const first = m.name.split(" ")[0];

  return (
    <div className="wrap grid gap-6 py-8 md:py-10 lg:grid-cols-[1fr_360px] lg:items-start">
      <div className="grid gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="eyebrow">Black Card member since {fmtDate(m.joinedAt, { month: "short", year: "numeric" })}</div>
            <h1 className="mt-2 font-serif text-[38px] leading-[42px] font-medium md:text-5xl md:leading-[52px]">
              {greet}, <em className="text-berry">{first}</em>
            </h1>
          </div>
          <Link href="/account/card" className="btn btn-dark btn-sm">
            <Icon name="qr" /> Show my card
          </Link>
        </div>

        {birthdayMonth ? (
          <div className="flex items-center gap-4 rounded-2xl border border-gold bg-gold/15 p-4">
            <span className="grid size-11 flex-none place-items-center rounded-full bg-gold text-espresso">
              <Icon name="gift" />
            </span>
            <p className="text-sm">
              <b>Happy birthday month!</b> Your free slice of cheesecake is waiting — any flavour. Show your card at the counter{m.birthdaySliceClaimedYear === new Date().getFullYear() ? " (already claimed this year)" : ""}.
            </p>
          </div>
        ) : null}
        {daysLeft <= 30 ? (
          <div className="bad-msg">
            <Icon name="clock" size={18} /> Your Black Card {daysLeft > 0 ? `expires in ${daysLeft} days` : "has expired"} ({fmtDate(m.expiresAt)}). Ask our team to renew.
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="glow-dark spotlight relative grid gap-4 overflow-hidden rounded-[20px] p-6">
            <BlackCard3D name={m.name.toUpperCase()} sub={m.cardNo} hint={false} />
            <div className="flex justify-between text-[13px] text-cream/75">
              <span>Valid until {fmtDate(m.expiresAt)}</span>
              <span>10% regular · 25% Chef VIP</span>
            </div>
          </div>
          <div className="relative grid content-center gap-2 overflow-hidden rounded-[20px] border border-gold/30 p-6 text-cream shadow-[var(--shadow-deep)]" style={{ background: "radial-gradient(400px 200px at 100% 0%, rgba(201,162,75,.28), transparent), var(--color-ink)" }}>
            <div className="eyebrow !text-gold-light">Food &amp; drink vouchers</div>
            <b className="font-serif text-5xl leading-[56px] font-semibold text-gold-light">
              {m.vouchersLeft} × ₱400
            </b>
            <span className="opacity-80">₱{(m.vouchersLeft * 400).toLocaleString()} left · one voucher per dine-in</span>
            <div className="mt-1.5 flex gap-2" aria-label={`${m.vouchersLeft} of 3 vouchers left`}>
              {[0, 1, 2].map((i) => (
                <span key={i} className={`h-2.5 flex-1 rounded-full ${i < 3 - m.vouchersLeft ? "bg-cream/25" : "bg-gold"}`} />
              ))}
            </div>
            <span className="text-[13px] opacity-75">{3 - m.vouchersLeft} of 3 used · your PIN is asked before each use</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {(
            [
              ["/account/book", "home", "Book a VIP Room", "₱2,000 less consumable"],
              ["/menu", "book", "Chef VIP Menu", "See member prices"],
              ["/account/card", "qr", "Show my QR", "At the counter"],
              ["/account/profile", "user", "Profile & PIN", "Keep it safe"],
            ] as [string, IconName, string, string][]
          ).map(([href, icon, t, d]) => (
            <Link key={href} href={href} className="panel lift group grid gap-1.5 !p-5">
              <span className="grid size-11 place-items-center rounded-xl bg-cheesecake text-berry">
                <Icon name={icon} size={22} />
              </span>
              <b className="mt-1 text-[15px]">{t}</b>
              <span className="text-xs text-muted">{d}</span>
            </Link>
          ))}
        </div>

        <div className="panel !p-0">
          <h2 className="flex items-center justify-between px-6 pt-5 font-serif text-2xl font-semibold">Activity</h2>
          {activity.length ? (
            <ul className="divide-y divide-line px-6 pb-2">
              {activity.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 py-3.5 text-sm">
                  <div>
                    <b className="font-medium">{a.label}</b>
                    <span className="block text-xs text-muted">{fmtDate(a.at, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                  </div>
                  <span className={`num font-semibold ${a.type === "voucher" ? "text-berry" : a.type === "registration" ? "text-sage" : "text-muted"}`}>
                    {a.type === "voucher" ? `−₱${a.amount ?? 400}` : a.type === "registration" ? `+₱${(a.amount ?? 1200).toLocaleString()}` : a.type === "perk" || a.type === "birthday" ? "Perk" : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="No activity yet">Your visits, vouchers and perks will show here.</Empty>
          )}
        </div>
      </div>

      <aside className="grid gap-6">
        <div className="panel hidden justify-items-center gap-3 text-center md:grid">
          <div className="eyebrow">Show at the counter</div>
          <LiveQr size={180} />
          <b className="text-lg tracking-[2px]">{m.cardNo}</b>
          <span className="text-[13px] text-muted">Staff scan this to apply your discount, free drink or voucher.</span>
        </div>
        <div className="panel">
          <h2 className="mb-2 flex items-center justify-between font-serif text-2xl font-semibold">
            Upcoming
            <Link href="/account/book" className="text-sm font-semibold text-berry">
              + Book
            </Link>
          </h2>
          {upcoming.length ? (
            <ul className="divide-y divide-line">
              {upcoming.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="text-sm">
                    <b>{ROOMS.find((r) => r.id === b.room)?.short ?? b.room} · {b.guests} guests</b>
                    <span className="block text-xs text-muted">
                      {fmtDate(`${b.date}T12:00:00+08:00`, { weekday: "short", day: "numeric", month: "short" })} · {fmtTime(b.time)} · {b.occasion}
                    </span>
                  </div>
                  <span className={`st ${b.status === "confirmed" ? "ok" : "pend"}`}>{b.status === "confirmed" ? "Confirmed" : "Pending"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-3 text-sm text-muted">No bookings yet. Your next celebration is a tap away.</p>
          )}
        </div>
        <div className="panel">
          <h2 className="mb-2 font-serif text-2xl font-semibold">Member perks</h2>
          <ul className="grid gap-3 text-sm">
            {(
              [
                ["tag", "Member discounts", "25% Chef VIP Menu · 10% regular, you + 4"],
                ["coffee", "Free every visit", "Americano or Fruitea · no minimum spend"],
                ["home", "VIP Rooms", "₱2,000 less consumable"],
                ["gift", "Birthday month", "A free slice of cheesecake"],
                ["clock", "No-waiting service", "We bring your order to you"],
              ] as [IconName, string, string][]
            ).map(([i, t, d]) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid size-9 flex-none place-items-center rounded-full bg-cheesecake text-berry">
                  <Icon name={i} size={16} />
                </span>
                <span>
                  <b className="block">{t}</b>
                  <span className="text-xs text-muted">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
