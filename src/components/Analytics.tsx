"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveSale, type Result } from "@/app/actions/admin";
import { Icon } from "./Icon";

const peso = (n: number) => `₱${Math.round(n).toLocaleString("en-PH")}`;
const short = (n: number) => (n >= 1_000_000 ? `₱${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `₱${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k` : `₱${n}`);
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function useSeen<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setSeen(true);
        io.disconnect();
      }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen || reduced()] as const;
}

export type Series = { key: string; name: string; color: string };
export type StackRow = { label: string; sub?: string; values: Record<string, number> };

/** Stacked vertical bar chart with y-axis gridlines and a hover breakdown. */
export function StackedBars({ rows, series, height = 240, money = true }: { rows: StackRow[]; series: Series[]; height?: number; money?: boolean }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const totals = rows.map((r) => series.reduce((n, s) => n + (r.values[s.key] ?? 0), 0));
  const rawMax = Math.max(1, ...totals);
  const step = niceStep(rawMax / 4);
  const max = Math.ceil(rawMax / step) * step;
  const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step);
  const fmt = (n: number) => (money ? short(n) : String(n));
  const dense = rows.length > 16;

  return (
    <div ref={ref} className="grid gap-3">
      <div className="flex flex-wrap gap-4 text-xs">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5 font-semibold text-muted">
            <i className="size-2.5 rounded-sm" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
      <div className="relative grid grid-cols-[52px_1fr] gap-2">
        <div className="relative" style={{ height }}>
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2 text-[10px] text-muted tabular-nums" style={{ bottom: `${(t / max) * 100}%` }}>
              {fmt(t)}
            </span>
          ))}
        </div>
        <div className="relative" style={{ height }}>
          {ticks.map((t) => (
            <span key={t} className="absolute inset-x-0 border-t border-dashed border-line" style={{ bottom: `${(t / max) * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end gap-[3px] sm:gap-1.5">
            {rows.map((r, i) => (
              <div
                key={r.label + i}
                className="group relative flex h-full flex-1 cursor-default flex-col justify-end"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={`${r.label}${r.sub ? " " + r.sub : ""}: ${fmt(totals[i])}`}
              >
                <div className={`mx-auto flex w-full max-w-[44px] flex-col-reverse overflow-hidden rounded-t-md transition-[height,opacity] duration-1000 ${hover !== null && hover !== i ? "opacity-50" : ""}`} style={{ height: seen ? `${(totals[i] / max) * 100}%` : "0%", transitionDelay: `${Math.min(i, 30) * 25}ms`, transitionTimingFunction: "cubic-bezier(.2,.8,.2,1)" }}>
                  {series.map((s) => (
                    <span key={s.key} style={{ height: totals[i] ? `${((r.values[s.key] ?? 0) / totals[i]) * 100}%` : 0, background: s.color }} />
                  ))}
                </div>
                {hover === i ? (
                  <div className={`pointer-events-none absolute bottom-full z-20 mb-2 w-44 rounded-xl bg-espresso p-3 text-xs text-cream shadow-xl ${i > rows.length / 2 ? "right-0" : "left-0"}`}>
                    <b className="block font-serif text-sm text-gold-light">
                      {r.label} {r.sub}
                    </b>
                    {series.map((s) => (
                      <span key={s.key} className="mt-1 flex justify-between">
                        <span className="inline-flex items-center gap-1.5">
                          <i className="size-2 rounded-sm" style={{ background: s.color }} />
                          {s.name}
                        </span>
                        <b>{money ? peso(r.values[s.key] ?? 0) : r.values[s.key] ?? 0}</b>
                      </span>
                    ))}
                    <span className="mt-1.5 flex justify-between border-t border-gold/25 pt-1.5 font-semibold">
                      Total <b className="text-gold-light">{money ? peso(totals[i]) : totals[i]}</b>
                    </span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-[52px_1fr] gap-2">
        <span />
        <div className="flex gap-[3px] sm:gap-1.5">
          {rows.map((r, i) => (
            <span key={r.label + i} className={`flex-1 text-center text-[10px] leading-tight text-muted ${dense && i % Math.ceil(rows.length / 10) !== 0 ? "invisible" : ""}`}>
              {r.label}
              {r.sub ? <span className="block opacity-70">{r.sub}</span> : null}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function niceStep(raw: number) {
  if (raw <= 1) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

/** Horizontal bars with share percentages. */
export function HBars({ rows, money = false }: { rows: { label: string; value: number; color?: string }[]; money?: boolean }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const max = Math.max(1, ...rows.map((r) => r.value));
  const total = rows.reduce((n, r) => n + r.value, 0);
  return (
    <div ref={ref} className="grid gap-3">
      {rows.map((r, i) => (
        <div key={r.label} className="grid gap-1.5">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{r.label}</span>
            <span className="text-muted tabular-nums">
              <b className="text-ink">{money ? peso(r.value) : r.value}</b> · {total ? Math.round((r.value / total) * 100) : 0}%
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-cheesecake/70">
            <div className="h-full rounded-full transition-[width] duration-1000" style={{ width: seen ? `${(r.value / max) * 100}%` : "0%", background: r.color ?? "linear-gradient(90deg,#C29A43,#E6C987)", transitionDelay: `${i * 90}ms` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Daily sales entry. Picking a date that already has an entry loads it for editing. */
export function SalesForm({ today, entries }: { today: string; entries: Record<string, { dineIn: number; takeout: number; delivery: number; orders?: number | null; notes?: string | null }> }) {
  const [date, setDate] = useState(today);
  const cur = entries[date];
  const [state, action, pending] = useActionState(saveSale, {} as Result);
  return (
    <form action={action} key={date} className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-2xl font-semibold">Record daily sales</h2>
        {cur ? <span className="st pend">Editing saved day</span> : <span className="st mute">New entry</span>}
      </div>
      <label className="label">
        Date
        <input type="date" name="date" max={today} value={date} onChange={(e) => setDate(e.target.value)} className="input" required />
      </label>
      <div className="grid grid-cols-3 gap-3">
        {(
          [
            ["dineIn", "Dine-in"],
            ["takeout", "Takeout"],
            ["delivery", "Delivery apps"],
          ] as const
        ).map(([k, l]) => (
          <label key={k} className="label !text-[13px]">
            {l}
            <span className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted">₱</span>
              <input name={k} inputMode="numeric" defaultValue={cur ? String(cur[k]) : ""} placeholder="0" className="input !pl-7" />
            </span>
          </label>
        ))}
      </div>
      <div className="grid grid-cols-[120px_1fr] gap-3">
        <label className="label !text-[13px]">
          Orders <span className="hint">optional</span>
          <input name="orders" inputMode="numeric" defaultValue={cur?.orders ?? ""} placeholder="—" className="input" />
        </label>
        <label className="label !text-[13px]">
          Notes <span className="hint">optional</span>
          <input name="notes" defaultValue={cur?.notes ?? ""} placeholder="e.g. rainy day, birthday rush" className="input" />
        </label>
      </div>
      {state.error ? <p className="bad-msg">{state.error}</p> : null}
      {state.ok ? <p className="ok-msg">{state.message}</p> : null}
      <button className="btn btn-berry justify-self-start" disabled={pending}>
        <Icon name="check" /> {pending ? "Saving…" : cur ? "Update day" : "Save day"}
      </button>
      <p className="text-xs text-muted">Enter totals from the POS or the cash count at closing. Charts update right away.</p>
    </form>
  );
}
