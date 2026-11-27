"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ */
/* MotionRoot: scroll reveals, count-ups, cursor spotlight, progress   */
/* ------------------------------------------------------------------ */
export function MotionRoot() {
  const path = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("motion");
    let io: IntersectionObserver | null = null;
    let mo: MutationObserver | null = null;
    let fail = 0;
    let catchUp: (() => void) | null = null;
    // Start after hydration so we never touch markup React is still adopting.
    const start = () => {
      io = new IntersectionObserver(
        (entries) => {
          for (const en of entries) {
            if (!en.isIntersecting) continue;
            en.target.classList.add("in");
            io?.unobserve(en.target);
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
      );
      const scan = () => document.querySelectorAll("[data-reveal]:not(.in), .words:not(.in):not(.auto)").forEach((el) => io?.observe(el));
      scan();
      mo = new MutationObserver(scan);
      mo.observe(document.body, { childList: true, subtree: true });
      // safety net for fast scrolls / anchor jumps: reveal anything already passed
      let ticking = false;
      catchUp = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          document.querySelectorAll("[data-reveal]:not(.in), .words:not(.in):not(.auto)").forEach((el) => {
            if (el.getBoundingClientRect().top < innerHeight * 0.9) el.classList.add("in");
          });
        });
      };
      window.addEventListener("scroll", catchUp, { passive: true });
      fail = window.setTimeout(() => {
        document.querySelectorAll("[data-reveal]:not(.in), .words:not(.in)").forEach((el) => {
          if (el.getBoundingClientRect().top < innerHeight) el.classList.add("in");
        });
      }, 2500);
    };
    const t = window.setTimeout(() => (document.readyState === "complete" ? start() : window.addEventListener("load", start, { once: true })), 60);

    // cursor spotlight + scroll progress live on <html> (not React-managed)
    const onMove = (e: PointerEvent) => {
      root.style.setProperty("--mx", `${e.clientX}px`);
      root.style.setProperty("--my", `${e.clientY}px`);
    };
    const onScroll = () => {
      const h = root.scrollHeight - innerHeight;
      root.style.setProperty("--p", String(h > 0 ? scrollY / h : 0));
    };
    onScroll();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      clearTimeout(fail);
      if (catchUp) window.removeEventListener("scroll", catchUp);
      window.removeEventListener("load", start);
      io?.disconnect();
      mo?.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [path]);
  return <div className="progress" aria-hidden="true" />;
}

/* ------------------------------------------------------------------ */
/* Count-up number (React-owned, animates once it scrolls into view)   */
/* ------------------------------------------------------------------ */
export function Count({ value, suffix = "" }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const target = parseFloat(value);
  const dec = value.split(".")[1]?.length ?? 0;
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    let raf = 0;
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / 1600);
        setShown((target * (1 - Math.pow(1 - k, 4))).toFixed(dec));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, dec]);
  return (
    <span ref={ref} className="tabular-nums">
      {shown}
      {suffix}
    </span>
  );
}

/* deterministic gold dust (same on server and client) */
const DUST = Array.from({ length: 26 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 9301 + n * 49297) + 1) / 2);
  return (
    <i
      key={i}
      style={{ "--x": `${(r(1) * 100).toFixed(1)}%`, "--s": `${(2 + r(2) * 4).toFixed(1)}px`, "--t": `${(10 + r(3) * 12).toFixed(1)}s`, "--dl": `${(-r(4) * 20).toFixed(1)}s`, "--dx": `${((r(5) - 0.5) * 120).toFixed(0)}px` } as React.CSSProperties}
    />
  );
});
export function Dust({ className = "" }: { className?: string }) {
  return (
    <div className={`dust ${className}`} aria-hidden="true">
      {DUST}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3D tilt wrapper with glare                                          */
/* ------------------------------------------------------------------ */
export function Tilt({ children, className = "", max = 10, glare = true, style }: { children: React.ReactNode; className?: string; max?: number; glare?: boolean; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || reduced()) return;
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.classList.add("moving");
    el.style.setProperty("--ry", `${(x - 0.5) * max * 2}deg`);
    el.style.setProperty("--rx", `${(0.5 - y) * max * 2}deg`);
    el.style.setProperty("--gx", `${x * 100}%`);
    el.style.setProperty("--gy", `${y * 100}%`);
  };
  const reset = () => {
    const el = ref.current!;
    el.classList.remove("moving");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };
  return (
    <div ref={ref} className={`tilt relative ${className}`} style={style} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
      {glare ? <span className="glare" /> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Black Card: 3D tilt + tap to flip                                   */
/* ------------------------------------------------------------------ */
export function BlackCard3D({ name = "BLACK CARD", sub = "MEMBER", className = "", hint = true }: { name?: string; sub?: string; className?: string; hint?: boolean }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className={`grid justify-items-center gap-3 ${className}`}>
      <Tilt max={14} className="w-full max-w-[420px] rounded-[20px]" glare>
        <button type="button" onClick={() => setFlipped((f) => !f)} className={`flip block w-full text-left ${flipped ? "flipped" : ""}`} aria-label={flipped ? "Show card front" : "Show member benefits on the back of the card"}>
          <div className="flip__inner">
            <div className="flip__face bcard">
              <span className="sheen" />
              <div className="top">
                <span className="mono">ICH</span>
                <span className="tier">Premium VIP Member</span>
              </div>
              <span className="chipx" />
              <div>
                <div className="name">{name}</div>
                <div className="sub">
                  <span>Iligan Cheesecake House</span>
                  <span>{sub}</span>
                </div>
              </div>
            </div>
            <div className="flip__face flip__back bcard !justify-center gap-[3cqw]">
              <span className="sheen" />
              <div className="top">
                <span className="tier">Member benefits</span>
                <span className="mono !text-[5cqw]">ICH</span>
              </div>
              <ul className="relative grid gap-[1.6cqw] text-[max(11px,3.3cqw)] leading-tight text-cream/90">
                <li>◆ 25% off Chef VIP Special Menu</li>
                <li>◆ 10% off regular menu · you + 4</li>
                <li>◆ ₱1,200 back · 3 × ₱400 vouchers</li>
                <li>◆ Free Americano or Fruitea every visit</li>
                <li>◆ ₱2,000 off every VIP Room</li>
              </ul>
              <div className="sub">
                <span>₱2,200 · valid 1 year</span>
                <span>Tap to flip</span>
              </div>
            </div>
          </div>
        </button>
      </Tilt>
      {hint ? <span className="text-xs tracking-wider text-cream/55">Tap the card to flip it · move your mouse to tilt</span> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mouse parallax for hero layers: children with data-depth move       */
/* ------------------------------------------------------------------ */
export function Parallax({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduced()) return;
    const el = ref.current!;
    const layers = [...el.querySelectorAll<HTMLElement>("[data-depth]")];
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = e.clientX / innerWidth - 0.5;
        const y = e.clientY / innerHeight - 0.5;
        layers.forEach((l) => {
          const d = parseFloat(l.dataset.depth ?? "0");
          l.style.transform = `translate3d(${x * d * -40}px, ${y * d * -40}px, 0)`;
        });
      });
    };
    const onScroll = () => {
      layers.forEach((l) => {
        if (l.dataset.scroll) l.style.translate = `0 ${scrollY * parseFloat(l.dataset.scroll)}px`;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Back to top                                                         */
/* ------------------------------------------------------------------ */
export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(scrollY > 900);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" })}
      className={`fixed right-5 bottom-24 z-30 grid size-12 place-items-center rounded-full border border-gold/50 bg-espresso/90 text-gold-light shadow-xl backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:bg-gold hover:text-espresso md:bottom-8 ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5M6 11l6-6 6 6" />
      </svg>
    </button>
  );
}
