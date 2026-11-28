import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { AdminTitle } from "@/components/AdminBits";
import { HBars, SalesForm, StackedBars, type Series } from "@/components/Analytics";
import { Count, Tilt } from "@/components/motion";
import { d } from "@/components/fx";
import { requireStaff } from "@/lib/auth";
import { list } from "@/lib/db";
import { ROOMS } from "@/lib/content";
import { fmtDate, nowMs } from "@/lib/format";

export const metadata: Metadata = { title: "Sales & analytics" };

const SALES: Series[] = [
  { key: "dineIn", name: "Dine-in", color: "#8f3a22" },
  { key: "takeout", name: "Takeout", color: "#C9A24B" },
  { key: "delivery", name: "Delivery apps", color: "#4d6b3c" },
];
const RANGES = [
  ["7", "7 days"],
  ["30", "30 days"],
  ["90", "90 days"],
] as const;

export default function Analytics({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  return (
    <>
      <AdminTitle title="Sales & analytics" sub="Record each day’s sales, then see how the café, bookings and the Black Card are doing." />
      <Suspense fallback={<div className="skeleton h-[700px]" />}>
        <Inner searchParams={searchParams} />
      </Suspense>
    </>
  );
}

const ymd = (ms: number) => new Date(ms + 8 * 3600_000).toISOString().slice(0, 10);
const label = (day: string, o: Intl.DateTimeFormatOptions) => fmtDate(`${day}T12:00:00+08:00`, o);
const peso = (n: number) => `₱${Math.round(n).toLocaleString("en-PH")}`;

async function Inner({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  await requireStaff();
  const { range = "30" } = await searchParams;
  const n = ["7", "30", "90"].includes(range) ? Number(range) : 30;
  const [sales, bookings, members, activity, inquiries] = await Promise.all([list("sales", { order: ["date", "asc"] }), list("bookings"), list("members"), list("activity"), list("inquiries")]);
  const now = nowMs();
  const today = ymd(now);
  const byDate = new Map(sales.map((s) => [s.date, s]));
  const total = (s?: { dineIn: number; takeout: number; delivery: number }) => (s ? s.dineIn + s.takeout + s.delivery : 0);

  // current + previous period
  const days = Array.from({ length: n }, (_, i) => ymd(now - (n - 1 - i) * 86400_000));
  const prevDays = Array.from({ length: n }, (_, i) => ymd(now - (2 * n - 1 - i) * 86400_000));
  const cur = days.map((day) => byDate.get(day));
  const sum = cur.reduce((a, s) => a + total(s), 0);
  const prevSum = prevDays.reduce((a, day) => a + total(byDate.get(day)), 0);
  const recorded = cur.filter(Boolean).length;
  const avg = recorded ? sum / recorded : 0;
  const best = days.map((day) => ({ day, v: total(byDate.get(day)) })).sort((a, b) => b.v - a.v)[0];
  const change = prevSum ? ((sum - prevSum) / prevSum) * 100 : null;
  const orders = cur.reduce((a, s) => a + (s?.orders ?? 0), 0);
  const ordersDays = cur.filter((s) => s?.orders).length;

  const dailyRows = days.map((day) => {
    const s = byDate.get(day);
    return { label: label(day, n > 31 ? { month: "short", day: "numeric" } : { day: "numeric" }), sub: n <= 7 ? label(day, { weekday: "short" }) : n <= 31 ? label(day, { month: "short" }) : undefined, values: { dineIn: s?.dineIn ?? 0, takeout: s?.takeout ?? 0, delivery: s?.delivery ?? 0 } };
  });
  const channel = SALES.map((x) => ({ label: x.name, value: cur.reduce((a, s) => a + ((s?.[x.key as "dineIn"] as number) ?? 0), 0), color: x.color }));

  // weekday averages (all recorded history)
  const wd = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const wdAgg = wd.map(() => ({ v: 0, c: 0 }));
  for (const s of sales) {
    const i = (new Date(`${s.date}T12:00:00+08:00`).getUTCDay() + 6) % 7;
    wdAgg[i].v += total(s);
    wdAgg[i].c += 1;
  }
  const weekdayRows = wd.map((w, i) => ({ label: w, values: { avg: wdAgg[i].c ? Math.round(wdAgg[i].v / wdAgg[i].c) : 0 } }));

  // last 6 months
  const months = Array.from({ length: 6 }, (_, i) => {
    const dt = new Date(now + 8 * 3600_000);
    dt.setUTCDate(1);
    dt.setUTCMonth(dt.getUTCMonth() - (5 - i));
    return dt.toISOString().slice(0, 7);
  });
  const monthRows = months.map((m) => {
    const ms = sales.filter((s) => s.date.startsWith(m));
    return { label: label(`${m}-15`, { month: "short" }), sub: m.slice(2, 4), values: { dineIn: ms.reduce((a, s) => a + s.dineIn, 0), takeout: ms.reduce((a, s) => a + s.takeout, 0), delivery: ms.reduce((a, s) => a + s.delivery, 0) } };
  });
  const memberRows = months.map((m) => ({ label: label(`${m}-15`, { month: "short" }), values: { joined: members.filter((x) => x.joinedAt.slice(0, 7) === m).length, vouchers: activity.filter((a) => a.type === "voucher" && a.at.slice(0, 7) === m).length } }));

  // bookings & inquiries
  const inRange = (iso: string) => iso.slice(0, 10) >= days[0];
  const roomRows = ROOMS.map((r) => ({ label: r.short, value: bookings.filter((b) => b.room === r.id && inRange(b.createdAt) && b.status !== "declined").length }));
  const topics = [...new Set(inquiries.map((i) => i.topic))];
  const topicRows = topics.map((t) => ({ label: t, value: inquiries.filter((i) => i.topic === t && inRange(i.createdAt)).length })).sort((a, b) => b.value - a.value);
  const perkRows = [
    { label: "Free drinks", value: activity.filter((a) => a.type === "perk" && inRange(a.at)).length },
    { label: "₱400 vouchers", value: activity.filter((a) => a.type === "voucher" && inRange(a.at)).length },
    { label: "Birthday slices", value: activity.filter((a) => a.type === "birthday" && inRange(a.at)).length },
  ];

  const recent = [...sales].reverse().slice(0, 10);
  const entries = Object.fromEntries(sales.map((s) => [s.date, { dineIn: s.dineIn, takeout: s.takeout, delivery: s.delivery, orders: s.orders, notes: s.notes }]));

  const kpis: { label: string; value: React.ReactNode; hint: string; icon: IconName; tone?: string }[] = [
    { label: `Sales · last ${n} days`, value: <>₱<Count group value={String(Math.round(sum))} /></>, hint: change === null ? "No earlier period to compare" : `${change >= 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(1)}% vs previous ${n} days`, icon: "trend", tone: change === null ? "text-muted" : change >= 0 ? "text-sage" : "text-berry" },
    { label: "Average per day", value: <>₱<Count group value={String(Math.round(avg))} /></>, hint: `${recorded} of ${n} days recorded`, icon: "chart" },
    { label: "Best day", value: best && best.v ? peso(best.v) : "—", hint: best && best.v ? label(best.day, { weekday: "long", month: "short", day: "numeric" }) : "No sales recorded yet", icon: "star" },
    { label: "Average ticket", value: ordersDays ? peso(cur.reduce((a, s) => a + (s?.orders ? total(s) : 0), 0) / orders) : "—", hint: ordersDays ? `${orders.toLocaleString()} orders` : "Add order counts to see this", icon: "receipt" },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 rounded-full border border-line bg-white p-1">
          {RANGES.map(([k, l]) => (
            <Link key={k} href={`?range=${k}`} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${String(n) === k ? "bg-ink text-cream" : "text-muted hover:text-ink"}`}>
              {l}
            </Link>
          ))}
        </div>
        <span className="text-xs text-muted">
          {label(days[0], { month: "short", day: "numeric" })} – {label(today, { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>

      {!sales.length ? (
        <div className="ok-msg">
          <Icon name="chart" size={18} /> No sales recorded yet. Use “Record daily sales” below. The charts fill in as soon as the first day is saved.
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <Tilt key={k.label} max={7} className="rounded-[20px]">
            <div data-reveal="up" style={d(i * 90)} className="panel lift group relative grid h-full gap-1 overflow-hidden !p-5">
              <span className="absolute -top-10 -right-10 size-28 rounded-full bg-gold/10 transition duration-700 group-hover:scale-150" />
              <div className="relative flex items-center justify-between text-[13px] font-semibold text-muted">
                {k.label}
                <span className="grid size-9 place-items-center rounded-xl bg-cheesecake text-gold-deep">
                  <Icon name={k.icon} size={17} />
                </span>
              </div>
              <b className="relative font-serif text-[34px] leading-[40px] font-semibold md:text-[40px] md:leading-[46px]">{k.value}</b>
              <small className={`relative text-xs ${k.tone ?? "text-muted"}`}>{k.hint}</small>
            </div>
          </Tilt>
        ))}
      </div>

      <section className="panel" data-reveal="up">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-serif text-2xl font-semibold">Daily sales</h2>
            <p className="text-xs text-muted">Hover a bar for the breakdown by channel</p>
          </div>
          <b className="font-serif text-2xl text-berry">{peso(sum)}</b>
        </div>
        <StackedBars rows={dailyRows} series={SALES} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="panel" data-reveal="up">
          <h2 className="font-serif text-2xl font-semibold">Monthly sales</h2>
          <p className="mb-4 text-xs text-muted">Last 6 months</p>
          <StackedBars rows={monthRows} series={SALES} height={200} />
        </section>
        <section className="panel grid content-start gap-4" data-reveal="up" style={d(100)}>
          <div>
            <h2 className="font-serif text-2xl font-semibold">Sales by channel</h2>
            <p className="text-xs text-muted">Last {n} days</p>
          </div>
          <HBars rows={channel} money />
          <div className="mt-2 border-t border-line pt-4">
            <h3 className="font-serif text-xl font-semibold">Busiest days of the week</h3>
            <p className="mb-3 text-xs text-muted">Average sales per weekday · all recorded days</p>
            <StackedBars rows={weekdayRows} series={[{ key: "avg", name: "Average", color: "linear-gradient(180deg,#E6C987,#C29A43)" }]} height={130} />
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="panel grid content-start gap-4" data-reveal="up">
          <div>
            <h2 className="font-serif text-2xl font-semibold">Room bookings</h2>
            <p className="text-xs text-muted">Requests received · last {n} days</p>
          </div>
          <HBars rows={roomRows} />
        </section>
        <section className="panel grid content-start gap-4" data-reveal="up" style={d(100)}>
          <div>
            <h2 className="font-serif text-2xl font-semibold">Black Card</h2>
            <p className="text-xs text-muted">New members and vouchers used per month</p>
          </div>
          <StackedBars
            rows={memberRows}
            series={[
              { key: "joined", name: "New members", color: "#24160f" },
              { key: "vouchers", name: "Vouchers used", color: "#C9A24B" },
            ]}
            height={150}
            money={false}
          />
          <HBars rows={perkRows} />
        </section>
        <section className="panel grid content-start gap-4" data-reveal="up" style={d(200)}>
          <div>
            <h2 className="font-serif text-2xl font-semibold">Inquiries</h2>
            <p className="text-xs text-muted">By topic · last {n} days</p>
          </div>
          {topicRows.some((t) => t.value) ? <HBars rows={topicRows} /> : <p className="text-sm text-muted">No inquiries in this period.</p>}
        </section>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[400px_1fr]">
        <section className="panel" data-reveal="up">
          <SalesForm today={today} entries={entries} />
        </section>
        <section className="panel !p-0" data-reveal="up" style={d(100)}>
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h2 className="font-serif text-2xl font-semibold">Recent entries</h2>
            <span className="text-xs text-muted">Pick a date in the form to edit it</span>
          </div>
          {recent.length ? (
            <div className="overflow-x-auto">
              <table className="tbl min-w-[620px]">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th className="num">Dine-in</th>
                    <th className="num">Takeout</th>
                    <th className="num">Delivery</th>
                    <th className="num">Total</th>
                    <th>By</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <b>{label(s.date, { weekday: "short", month: "short", day: "numeric" })}</b>
                        {s.notes ? <span className="block max-w-[220px] truncate text-xs text-muted">{s.notes}</span> : null}
                      </td>
                      <td className="num">{peso(s.dineIn)}</td>
                      <td className="num">{peso(s.takeout)}</td>
                      <td className="num">{peso(s.delivery)}</td>
                      <td className="num font-semibold text-berry">{peso(total(s))}</td>
                      <td className="text-xs text-muted">{s.updatedBy ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-5 pb-6 text-sm text-muted">Nothing recorded yet.</p>
          )}
        </section>
      </div>
    </>
  );
}
