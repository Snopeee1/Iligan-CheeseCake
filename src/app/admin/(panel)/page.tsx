import Link from "next/link";
import { Suspense } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { Empty } from "@/components/ui";
import { statusTone } from "@/components/AdminBits";
import { BookingActions } from "@/components/AdminClient";
import { Count, Dust, Tilt } from "@/components/motion";
import { d } from "@/components/fx";
import { Bars, LiveTime, Meter, Ring } from "@/components/DashFx";
import { RouteLoader } from "@/components/RouteLoader";
import { requireStaff } from "@/lib/auth";
import { list } from "@/lib/db";
import { ROOMS } from "@/lib/content";
import { dayLabel, fmtDate, fmtTime, todayPH, nowMs } from "@/lib/format";

export default function AdminHome() {
  return (
    <Suspense fallback={<RouteLoader label="Opening the admin panel…" />}>
      <Inner />
    </Suspense>
  );
}

const roomName = (id: string) => ROOMS.find((r) => r.id === id)?.short ?? id;
const ACT: Record<string, IconName> = { registration: "card", voucher: "receipt", perk: "coffee", birthday: "gift", booking: "cal", visit: "check" };

async function Inner() {
  const s = await requireStaff();
  const [bookings, inquiries, apps, members, activity] = await Promise.all([
    list("bookings", { order: ["date", "asc"] }),
    list("inquiries", { order: ["createdAt", "desc"] }),
    list("applications", { eq: { status: "new" }, order: ["createdAt", "desc"] }),
    list("members"),
    list("activity", { order: ["at", "desc"], limit: 200 }),
  ]);
  const now = nowMs();
  const today = todayPH();
  const pending = bookings.filter((b) => b.status === "pending");
  const upcoming = bookings.filter((b) => b.date >= today && ["pending", "confirmed"].includes(b.status)).slice(0, 6);
  const todays = bookings.filter((b) => b.date === today && b.status === "confirmed");
  const open = inquiries.filter((i) => i.status === "open");
  const active = members.filter((m) => m.status === "active" && new Date(m.expiresAt).getTime() > now);
  const vouchersOut = active.reduce((n, m) => n + m.vouchersLeft, 0);
  const vouchersTotal = active.length * 3;
  const month = today.slice(0, 7);
  const usedThisMonth = activity.filter((a) => a.type === "voucher" && a.at.slice(0, 7) === month).length;
  const drinksThisMonth = activity.filter((a) => a.type === "perk" && a.at.slice(0, 7) === month).length;
  const expiring = active.filter((m) => new Date(m.expiresAt).getTime() - now < 30 * 86400_000);
  const hour = new Date(now + 8 * 3600_000).getUTCHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const days = Array.from({ length: 7 }, (_, i) => new Date(now + 8 * 3600_000 + i * 86400_000).toISOString().slice(0, 10));
  const perDay = days.map((day) => ({
    label: fmtDate(`${day}T12:00:00+08:00`, { weekday: "short" }),
    sub: fmtDate(`${day}T12:00:00+08:00`, { day: "numeric" }),
    value: bookings.filter((b) => b.date === day && ["pending", "confirmed"].includes(b.status)).length,
  }));
  const statusCounts = (["pending", "confirmed", "completed", "declined"] as const).map((k) => [k, bookings.filter((b) => b.status === k).length] as const);
  const totalBookings = bookings.length;

  const stats: { label: string; value: number; hint: string; icon: IconName; href: string; warn: boolean }[] = [
    { label: "Booking requests", value: pending.length, hint: pending.length ? "Waiting for you" : "All handled", icon: "cal", href: "/admin/reservations?f=pending", warn: pending.length > 0 },
    { label: "Open inquiries", value: open.length, hint: open.length ? "Reply on Messenger or phone" : "Inbox zero", icon: "inbox", href: "/admin/inquiries", warn: open.length > 0 },
    { label: "Active Black Cards", value: active.length, hint: `${apps.length} new application${apps.length === 1 ? "" : "s"}`, icon: "card", href: "/admin/members", warn: apps.length > 0 },
    { label: "Vouchers used", value: usedThisMonth, hint: `this month · ${drinksThisMonth} free drinks`, icon: "receipt", href: "/admin/members", warn: false },
  ];

  return (
    <>
      {/* HERO */}
      <section className="glow-dark spotlight relative -mx-4 -mt-4 overflow-hidden px-6 py-8 md:-mx-8 md:-mt-8 md:px-10 md:py-10">
        <span className="blob top-[-140px] right-[-80px] size-[420px] bg-gold/30" />
        <span className="blob bottom-[-160px] left-[10%] size-[380px] bg-sage/40" style={{ animationDelay: "-5s" }} />
        <Dust />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="eyebrow fade-up flex items-center gap-2">
              {fmtDate(new Date(now).toISOString(), { weekday: "long", day: "numeric", month: "long" })} · <LiveTime />
            </div>
            <h1 className="fade-up mt-3 font-serif text-[40px] leading-[44px] font-medium text-cream md:text-[52px] md:leading-[56px]" style={{ animationDelay: "100ms" }}>
              {greet}, <em className="gold-text">{s.name.split(" ")[0]}</em>
            </h1>
            <p className="fade-up mt-2 text-cream/70" style={{ animationDelay: "200ms" }}>
              {pending.length || open.length || apps.length
                ? `You have ${[pending.length && `${pending.length} booking request${pending.length > 1 ? "s" : ""}`, open.length && `${open.length} inquir${open.length > 1 ? "ies" : "y"}`, apps.length && `${apps.length} Black Card application${apps.length > 1 ? "s" : ""}`].filter(Boolean).join(", ")} waiting.`
                : "Everything is handled. Enjoy a calm service today."}
            </p>
          </div>
          <div className="fade-up flex flex-wrap gap-3" style={{ animationDelay: "300ms" }}>
            <Link href="/admin/counter" className="btn btn-gold pulse-ring">
              <Icon name="scan" /> Open counter
            </Link>
            <Link href="/admin/reservations" className="btn btn-outline">
              <Icon name="cal" /> Reservations
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((x, i) => (
          <Tilt key={x.label} max={8} className="rounded-[20px]">
            <Link href={x.href} data-reveal="up" style={d(i * 90)} className="panel lift group relative grid h-full gap-1 overflow-hidden !p-5">
              <span className="absolute -top-10 -right-10 size-28 rounded-full bg-gold/10 transition duration-700 group-hover:scale-150" />
              <div className="relative flex items-center justify-between text-[13px] font-semibold text-muted">
                {x.label}
                <span className={`grid size-9 place-items-center rounded-xl transition duration-500 group-hover:rotate-[-8deg] ${x.warn ? "bg-berry text-cream" : "bg-cheesecake text-gold-deep"}`}>
                  <Icon name={x.icon} size={17} />
                </span>
              </div>
              <b className="relative font-serif text-[44px] leading-[48px] font-semibold">
                <Count value={String(x.value)} />
              </b>
              <small className={`relative flex items-center gap-1.5 text-xs ${x.warn ? "font-semibold text-gold-deep" : "text-sage"}`}>
                {x.warn ? <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-70" /><span className="relative inline-flex size-2 rounded-full bg-gold" /></span> : <Icon name="check" size={13} />}
                {x.hint}
              </small>
            </Link>
          </Tilt>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="panel" data-reveal="up">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold">Room bookings · next 7 days</h2>
              <p className="text-xs text-muted">Requests and confirmed bookings per day</p>
            </div>
            <Link href="/admin/reservations" className="link !text-sm">
              Calendar →
            </Link>
          </div>
          <Bars data={perDay} />
        </section>
        <section className="glow-dark spotlight relative grid gap-5 overflow-hidden rounded-[20px] p-6 shadow-[var(--shadow-deep)]" data-reveal="up" style={d(120)}>
          <Dust />
          <div className="relative flex items-center justify-between">
            <h2 className="font-serif text-2xl font-semibold text-cream">Black Card vouchers</h2>
            <span className="pill">{active.length} active</span>
          </div>
          <div className="relative flex items-center gap-6">
            <Ring value={vouchersTotal - vouchersOut} max={vouchersTotal || 1} size={140}>
              <b className="font-serif text-3xl leading-none text-gold-light">{vouchersTotal ? Math.round(((vouchersTotal - vouchersOut) / vouchersTotal) * 100) : 0}%</b>
              <span className="text-[10px] tracking-widest text-cream/60 uppercase">used</span>
            </Ring>
            <dl className="grid flex-1 gap-3 text-sm text-cream/80">
              <div className="flex justify-between border-b border-gold/15 pb-2">
                <dt>Still out</dt>
                <dd className="font-semibold text-gold-light">{vouchersOut} · ₱{(vouchersOut * 400).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between border-b border-gold/15 pb-2">
                <dt>Used this month</dt>
                <dd className="font-semibold text-gold-light">{usedThisMonth}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Expiring in 30 days</dt>
                <dd className="font-semibold text-gold-light">{expiring.length}</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>

      {/* LISTS */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="panel !p-0" data-reveal="up">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h2 className="font-serif text-2xl font-semibold">Upcoming bookings</h2>
            <Link href="/admin/reservations" className="link !text-sm">
              All →
            </Link>
          </div>
          {totalBookings ? (
            <div className="grid grid-cols-4 gap-2 px-5 pb-3">
              {statusCounts.map(([k, n]) => (
                <div key={k} className="grid gap-1.5">
                  <span className="flex justify-between text-[11px] font-semibold text-muted capitalize">
                    {k} <b className="text-ink">{n}</b>
                  </span>
                  <Meter value={n} max={totalBookings} color={k === "pending" ? "var(--color-gold)" : k === "confirmed" ? "var(--color-berry)" : k === "completed" ? "var(--color-sage)" : "var(--color-muted)"} />
                </div>
              ))}
            </div>
          ) : null}
          {upcoming.length ? (
            <ul className="divide-y divide-line">
              {upcoming.map((b, i) => (
                <li key={b.id} data-reveal="left" style={d(i * 70)} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-cheesecake/30">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="grid w-12 flex-none rounded-xl bg-espresso py-1.5 text-center text-cream">
                      <b className="font-serif text-xl leading-5">{fmtDate(`${b.date}T12:00:00+08:00`, { day: "numeric" })}</b>
                      <span className="text-[10px] tracking-widest text-gold-light uppercase">{fmtDate(`${b.date}T12:00:00+08:00`, { month: "short" })}</span>
                    </span>
                    <span>
                      <b>
                        {b.name} · {roomName(b.room)}
                      </b>
                      {b.memberId ? <span className="st info ml-2">Black Card</span> : null}
                      <span className="block text-xs text-muted">
                        {dayLabel(b.date)} · {fmtTime(b.time)} · {b.guests} guests · {b.occasion}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`st ${statusTone[b.status]}`}>{b.status}</span>
                    <BookingActions id={b.id} status={b.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty icon="cal" title="No upcoming bookings">New requests from the website appear here.</Empty>
          )}
        </section>

        <div className="grid content-start gap-6">
          <section className="panel !p-0" data-reveal="right">
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h2 className="font-serif text-2xl font-semibold">Counter activity</h2>
              <Link href="/admin/counter" className="link !text-sm">
                Counter →
              </Link>
            </div>
            {activity.length ? (
              <ol className="relative px-5 pb-4">
                <span className="absolute top-3 bottom-6 left-[37px] w-px bg-line" aria-hidden="true" />
                {activity.slice(0, 6).map((a, i) => {
                  const m = members.find((x) => x.id === a.memberId);
                  return (
                    <li key={a.id} data-reveal="left" style={d(i * 60)} className="relative flex items-center gap-3 py-2.5 text-sm">
                      <span className="relative z-10 grid size-9 flex-none place-items-center rounded-full bg-cheesecake text-berry ring-4 ring-white">
                        <Icon name={ACT[a.type] ?? "check"} size={15} />
                      </span>
                      <span className="flex-1">
                        <b className="font-medium">{m?.name ?? "Member"}</b> <span className="text-muted">· {a.label}</span>
                        <span className="block text-xs text-muted">
                          {fmtDate(a.at, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                          {a.by ? ` · by ${a.by}` : ""}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="px-5 pb-5 text-sm text-muted">No counter activity yet.</p>
            )}
          </section>

          <section className="panel !p-0" data-reveal="right" style={d(100)}>
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h2 className="font-serif text-2xl font-semibold">Latest inquiries</h2>
              <Link href="/admin/inquiries" className="link !text-sm">
                Inbox →
              </Link>
            </div>
            {open.length ? (
              <ul className="divide-y divide-line">
                {open.slice(0, 4).map((i) => (
                  <li key={i.id} className="flex items-start gap-3 px-5 py-3 text-sm transition hover:bg-cheesecake/30">
                    <span className="grid size-9 flex-none place-items-center rounded-full bg-gold font-serif font-semibold text-espresso">{i.name[0]}</span>
                    <span className="min-w-0">
                      <b>{i.name}</b> <span className="chip !py-0.5 !text-xs">{i.topic}</span>
                      <span className="line-clamp-1 block text-xs text-muted">{i.message || "No message"}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="grid justify-items-center gap-2 px-5 pb-6 text-center">
                <span className="float-y grid size-12 place-items-center rounded-full bg-[#eef1e8] text-sage">
                  <Icon name="check" />
                </span>
                <p className="text-sm text-muted">Inbox zero — nothing waiting.</p>
              </div>
            )}
          </section>

          {todays.length ? (
            <section className="panel" data-reveal="right">
              <h2 className="mb-2 font-serif text-2xl font-semibold">Today in the rooms</h2>
              <ul className="divide-y divide-line">
                {todays.map((b) => (
                  <li key={b.id} className="flex justify-between py-2.5 text-sm">
                    <span>
                      <b>{fmtTime(b.time)}</b> · {roomName(b.room)}
                    </span>
                    <span className="text-muted">
                      {b.name} · {b.guests}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}
