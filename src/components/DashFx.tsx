"use client";

import { useEffect, useRef, useState } from "react";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Fires once when the element scrolls into view. */
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
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen || reduced()] as const;
}

/** Animated progress ring. */
export function Ring({ value, max, size = 132, stroke = 10, color = "#C9A24B", track = "rgba(201,162,75,.18)", children }: { value: number; max: number; size?: number; stroke?: number; color?: string; track?: string; children?: React.ReactNode }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <div ref={ref} className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={seen ? c * (1 - pct) : c}
          style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(.2,.8,.2,1)", filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">{children}</div>
    </div>
  );
}

/** Vertical bar chart that grows in. Values are real counts. */
export function Bars({ data, height = 150, color = "linear-gradient(180deg,#E6C987,#C29A43)", highlightLast = false }: { data: { label: string; value: number; sub?: string }[]; height?: number; color?: string; highlightLast?: boolean }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div ref={ref} className="grid items-end gap-2" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0,1fr))`, height: height + 44 }}>
      {data.map((d, i) => (
        <div key={d.label} className="group grid h-full grid-rows-[1fr_auto] justify-items-center gap-2">
          <div className="relative flex w-full items-end justify-center">
            <span className="absolute -top-6 rounded-md bg-espresso px-1.5 py-0.5 text-[11px] font-semibold text-gold-light opacity-0 transition group-hover:opacity-100">{d.value}</span>
            <div
              className={`w-full max-w-[38px] rounded-t-lg transition-[height] duration-1000 ${highlightLast && i === data.length - 1 ? "ring-2 ring-berry/60" : ""}`}
              style={{
                height: seen ? `${Math.max(4, (d.value / max) * height)}px` : "4px",
                background: d.value ? color : "rgba(201,162,75,.18)",
                transitionDelay: `${i * 70}ms`,
                transitionTimingFunction: "cubic-bezier(.2,.8,.2,1)",
              }}
            />
          </div>
          <span className="text-center text-[11px] leading-tight text-muted">
            {d.label}
            {d.sub ? <span className="block opacity-70">{d.sub}</span> : null}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Thin progress line that fills in. */
export function Meter({ value, max, color = "var(--color-gold)" }: { value: number; max: number; color?: string }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  return (
    <div ref={ref} className="h-2 overflow-hidden rounded-full bg-black/10">
      <div className="h-full rounded-full transition-[width] duration-[1400ms] ease-out" style={{ width: seen ? `${max ? Math.min(100, (value / max) * 100) : 0}%` : "0%", background: color }} />
    </div>
  );
}

/** Live clock text for headers (client only). */
export function LiveTime() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString("en-PH", { timeZone: "Asia/Manila", hour: "numeric", minute: "2-digit" }));
    const a = setTimeout(tick, 0);
    const b = setInterval(tick, 15000);
    return () => {
      clearTimeout(a);
      clearInterval(b);
    };
  }, []);
  return <span className="tabular-nums">{t}</span>;
}
