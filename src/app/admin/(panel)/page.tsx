import Link from "next/link";
import { Suspense } from "react";
import { Icon } from "@/components/Icon";
import { Empty } from "@/components/ui";
import { AdminTitle, Card, Stat, statusTone } from "@/components/AdminBits";
import { BookingActions } from "@/components/AdminClient";
import { requireStaff } from "@/lib/auth";
import { list } from "@/lib/db";
import { ROOMS } from "@/lib/content";
import { dayLabel, fmtDate, fmtTime, todayPH, nowMs } from "@/lib/format";

export default function AdminHome() {
  return (
    <Suspense fallback={<div className="grid gap-6"><div className="skeleton h-12 w-72" /><div className="skeleton h-32" /><div className="skeleton h-96" /></div>}>
      <Inner />
    </Suspense>
  );
}

const roomName = (id: string) => ROOMS.find((r) => r.id === id)?.short ?? id;

async function Inner() {
  const s = await requireStaff();
  const [bookings, inquiries, apps, members, activity] = await Promise.all([
    list("bookings", { order: ["date", "asc"] }),
    list("inquiries", { order: ["createdAt", "desc"] }),
    list("applications", { eq: { status: "new" }, order: ["createdAt", "desc"] }),
    list("members"),
    list("activity", { order: ["at", "desc"], limit: 200 }),
  ]);
  const today = todayPH();
  const pending = bookings.filter((b) => b.status === "pending");
  const upcoming = bookings.filter((b) => b.date >= today && ["pending", "confirmed"].includes(b.status)).slice(0, 6);
  const todays = bookings.filter((b) => b.date === today && b.status === "confirmed");
  const open = inquiries.filter((i) => i.status === "open");
  const active = members.filter((m) => m.status === "active" && new Date(m.expiresAt).getTime() > nowMs());
  const vouchersOut = active.reduce((n, m) => n + m.vouchersLeft, 0);
  const month = today.slice(0, 7);
  const usedThisMonth = activity.filter((a) => a.type === "voucher" && a.at.slice(0, 7) === month).length;
  const expiring = active.filter((m) => new Date(m.expiresAt).getTime() - nowMs() < 30 * 86400_000);
  const hour = new Date(nowMs() + 8 * 3600_000).getUTCHours();

  return (
    <>
      <AdminTitle title={`${hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"}, ${s.name.split(" ")[0]}`} sub={fmtDate(new Date().toISOString(), { weekday: "long", day: "numeric", month: "long", year: "numeric" })}>
        <Link href="/admin/counter" className="btn btn-berry btn-sm">
          <Icon name="scan" /> Open counter
        </Link>
      </AdminTitle>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Booking requests" value={pending.length} hint={pending.length ? "Waiting for you" : "All handled"} tone={pending.length ? "warn" : "ok"} icon="cal" href="/admin/reservations" />
        <Stat label="Open inquiries" value={open.length} hint={open.length ? "Reply on Messenger or phone" : "Inbox zero"} tone={open.length ? "warn" : "ok"} icon="inbox" href="/admin/inquiries" />
        <Stat label="Active Black Cards" value={active.length} hint={`${apps.length} new application${apps.length === 1 ? "" : "s"}`} tone={apps.length ? "warn" : undefined} icon="card" href="/admin/members" />
        <Stat label="Vouchers used" value={usedThisMonth} hint={`this month · ${vouchersOut} still out (₱${(vouchersOut * 400).toLocaleString()})`} icon="receipt" href="/admin/members" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Upcoming bookings" action={<Link href="/admin/reservations" className="text-sm font-semibold text-berry">All →</Link>}>
          {upcoming.length ? (
            <ul className="divide-y divide-line">
              {upcoming.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                  <div className="text-sm">
                    <b>
                      {b.name} · {roomName(b.room)}
                    </b>
                    {b.memberId ? <span className="st info ml-2">Black Card</span> : null}
                    <span className="block text-xs text-muted">
                      {dayLabel(b.date)} · {fmtTime(b.time)} · {b.guests} guests · {b.occasion}
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
        </Card>
        <div className="grid content-start gap-6">
          <Card title="Today in the rooms">
            {todays.length ? (
              <ul className="divide-y divide-line">
                {todays.map((b) => (
                  <li key={b.id} className="flex justify-between px-5 py-3 text-sm">
                    <span>
                      <b>{fmtTime(b.time)}</b> · {roomName(b.room)}
                    </span>
                    <span className="text-muted">
                      {b.name} · {b.guests}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 pb-5 text-sm text-muted">No confirmed room bookings today.</p>
            )}
          </Card>
          <Card title="Latest inquiries" action={<Link href="/admin/inquiries" className="text-sm font-semibold text-berry">Inbox →</Link>}>
            {open.length ? (
              <ul className="divide-y divide-line">
                {open.slice(0, 4).map((i) => (
                  <li key={i.id} className="px-5 py-3 text-sm">
                    <b>{i.name}</b> <span className="chip !py-0.5 !text-xs">{i.topic}</span>
                    <span className="line-clamp-1 block text-xs text-muted">{i.message || "No message"}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 pb-5 text-sm text-muted">Nothing waiting.</p>
            )}
          </Card>
          {expiring.length ? (
            <Card title="Cards expiring within 30 days">
              <ul className="divide-y divide-line">
                {expiring.map((m) => (
                  <li key={m.id} className="flex justify-between px-5 py-3 text-sm">
                    <b>{m.name}</b>
                    <span className="text-muted">{fmtDate(m.expiresAt)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
