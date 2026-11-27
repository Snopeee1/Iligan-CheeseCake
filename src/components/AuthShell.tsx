"use client";

import { useEffect, useState } from "react";
import { Icon, type IconName } from "./Icon";

/** Text input with a leading icon, used on both sign-in pages. */
export function IconInput({ icon, id, children }: { icon: IconName; id: string; children: React.ReactNode }) {
  return (
    <div className="group relative">
      <span data-for={id} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted transition group-focus-within:text-gold-deep">
        <Icon name={icon} size={18} />
      </span>
      {children}
    </div>
  );
}

/** Password field with show/hide and a Caps Lock warning. */
export function SecretInput({ id, name, placeholder, autoComplete, numeric = false, maxLength }: { id: string; name: string; placeholder?: string; autoComplete?: string; numeric?: boolean; maxLength?: number }) {
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  return (
    <div className="grid gap-1.5">
      <IconInput icon="lock" id={id}>
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          inputMode={numeric ? "numeric" : undefined}
          maxLength={maxLength}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          onKeyUp={(e) => setCaps(e.getModifierState("CapsLock"))}
          className={`input !h-14 !pr-20 !pl-12 ${numeric ? "tracking-[.5em]" : ""}`}
        />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-berry transition hover:bg-cheesecake" aria-label={show ? "Hide" : "Show"}>
          <span className="inline-flex items-center gap-1">
            <Icon name="eye" size={14} /> {show ? "Hide" : "Show"}
          </span>
        </button>
      </IconInput>
      {caps ? <span className="text-xs font-semibold text-gold-deep">Caps Lock is on</span> : null}
    </div>
  );
}

/** Live Manila clock + greeting (client only, so no time is read during prerender). */
export function ManilaClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 1000 * 15);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);
  if (!now) return <span className="opacity-0">.</span>;
  const opts = { timeZone: "Asia/Manila" } as const;
  const h = Number(now.toLocaleString("en-US", { ...opts, hour: "numeric", hour12: false }));
  const greet = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  const day = now.toLocaleDateString("en-PH", { ...opts, weekday: "long", month: "long", day: "numeric" });
  const time = now.toLocaleTimeString("en-PH", { ...opts, hour: "numeric", minute: "2-digit" });
  const isMonday = now.toLocaleDateString("en-US", { ...opts, weekday: "short" }) === "Mon";
  const open = !isMonday && (h > 11 || (h === 11 && now.getUTCMinutes() >= 30)) && h < 21;
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span>
        {greet} · {day} · {time}
      </span>
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${open ? "bg-sage/25 text-[#cfe0bf]" : "bg-white/10 text-cream/70"}`}>
        <span className={`size-1.5 rounded-full ${open ? "bg-[#9fc28a]" : "bg-cream/50"}`} />
        {isMonday ? "Rest day" : open ? "Café open now" : "Café closed now"}
      </span>
    </span>
  );
}
