import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Empty } from "@/components/ui";
import { AdminTitle, Card, statusTone } from "@/components/AdminBits";
import { BookingActions } from "@/components/AdminClient";
import { requireStaff } from "@/lib/auth";
import { list } from "@/lib/db";
import { ROOMS } from "@/lib/content";
import { dayLabel, fmtDate, fmtTime, todayPH, nowMs } from "@/lib/format";

export const metadata: Metadata = { title: "Reservations" };

const FILTERS = [
  ["upcoming", "Upcoming"],
  ["pending", "Requests"],
  ["confirmed", "Confirmed"],
  ["past", "Past & closed"],
  ["all", "All"],
] as const;

export default function Reservations({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  return (
    <>
      <AdminTitle title="Reservations" sub="VIP Rooms and exclusive bookings. Confirm a request, then message the guest on Messenger or by phone." />
      <Suspense fallback={<div className="skeleton h-96" />}>
        <Inner searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Inner({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  await requireStaff();
  const { f = "upcoming" } = await searchParams;
  const all = await list("bookings", { order: ["date", "asc"] });
  const today = todayPH();
  const rows = all.filter((b) =>
    f === "pending" ? b.status === "pending" : f === "confirmed" ? b.status === "confirmed" && b.date >= today : f === "past" ? b.date < today || ["declined", "cancelled", "completed"].includes(b.status) : f === "all" ? true : b.date >= today && ["pending", "confirmed"].includes(b.status),
  );
  if (f === "past" || f === "all") rows.reverse();
  const count = (k: string) => (k === "pending" ? all.filter((b) => b.status === "pending").length : null);

  // Next 7 days, by room
  const days = Array.from({ length: 7 }, (_, i) => new Date(nowMs() + 8 * 3600_000 + i * 86400_000).toISOString().slice(0, 10));

  return (
    <>
      <Card title="Next 7 days">
        <div className="overflow-x-auto px-5 pb-5">
          <table className="w-full min-w-[720px] border-separate border-spacing-1 text-xs">
            <thead>
              <tr>
                <th className="w-32" />
                {days.map((d) => (
                  <th key={d} className={`rounded-lg py-2 font-semibold ${new Date(`${d}T12:00:00+08:00`).getUTCDay() === 1 ? "bg-[#efeae2] text-muted" : "bg-cream"}`}>
                    {dayLabel(d)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROOMS.map((r) => (
                <tr key={r.id}>
                  <th className="pr-2 text-left text-[13px] font-semibold">{r.short}</th>
                  {days.map((d) => {
                    const b = all.filter((x) => x.room === r.id && x.date === d && ["pending", "confirmed"].includes(x.status));
                    const closed = new Date(`${d}T12:00:00+08:00`).getUTCDay() === 1;
                    return (
                      <td key={d} className={`h-14 rounded-lg align-top ${closed ? "bg-[#efeae2]" : "bg-white ring-1 ring-line"}`}>
                        {b.map((x) => (
                          <span key={x.id} className={`m-1 block rounded-md px-1.5 py-1 font-semibold ${x.status === "confirmed" ? "bg-berry text-cream" : "bg-gold/30 text-gold-deep"}`}>
                            {fmtTime(x.time)} · {x.name.split(" ")[0]}
                          </span>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 flex gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5"><i className="size-3 rounded bg-berry" /> Confirmed</span>
            <span className="flex items-center gap-1.5"><i className="size-3 rounded bg-gold/40" /> Request</span>
            <span className="flex items-center gap-1.5"><i className="size-3 rounded bg-[#efeae2]" /> Monday (rest day)</span>
          </p>
        </div>
      </Card>

      <div className="rail flex gap-2">
        {FILTERS.map(([k, label]) => (
          <Link key={k} href={`?f=${k}`} className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold ${f === k ? "border-ink bg-ink text-cream" : "border-line bg-white"}`}>
            {label}
            {count(k) ? <span className="rounded-full bg-gold px-1.5 text-xs text-espresso">{count(k)}</span> : null}
          </Link>
        ))}
      </div>

      <Card>
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="tbl min-w-[900px]">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Date &amp; time</th>
                  <th className="num">Guests</th>
                  <th>Occasion</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => {
                  const r = ROOMS.find((x) => x.id === b.room);
                  return (
                    <tr key={b.id}>
                      <td>
                        <b>{b.name}</b>
                        {b.memberId ? <span className="st info ml-2">Black Card</span> : null}
                        <span className="block text-xs text-muted">{b.contact}</span>
                        {b.notes ? <span className="block max-w-[260px] text-xs text-muted italic">“{b.notes}”</span> : null}
                      </td>
                      <td>
                        {r?.short ?? b.room}
                        <span className="block text-xs text-muted">
                          {r && r.id !== "exclusive" ? `₱${(b.memberId ? r.member! : r.consumable).toLocaleString()} consumable` : "₱40–45k promo"}
                          {b.useVoucher ? " · uses voucher" : ""}
                        </span>
                      </td>
                      <td>
                        {dayLabel(b.date)} · {fmtTime(b.time)}
                        <span className="block text-xs text-muted">Requested {fmtDate(b.createdAt, { day: "numeric", month: "short" })}</span>
                      </td>
                      <td className="num">{b.guests}</td>
                      <td>{b.occasion}</td>
                      <td>
                        <span className={`st ${statusTone[b.status]}`}>{b.status}</span>
                      </td>
                      <td>
                        <BookingActions id={b.id} status={b.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon="cal" title="Nothing here">No bookings match this filter.</Empty>
        )}
      </Card>
    </>
  );
}
