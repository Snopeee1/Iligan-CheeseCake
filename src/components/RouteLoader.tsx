/** Branded loading state shown while a page streams in. */
export function RouteLoader({ dark = false, label = "Preparing something sweet…" }: { dark?: boolean; label?: string }) {
  return (
    <div className={`grid min-h-[60vh] place-items-center ${dark ? "glow-dark" : ""}`} role="status" aria-live="polite">
      <div className="grid justify-items-center gap-5">
        <div className="relative grid place-items-center">
          <div className="loader-slice" />
          <span className="absolute font-serif text-sm font-semibold tracking-widest text-gold-deep">ICH</span>
        </div>
        <p className={`font-serif text-lg italic ${dark ? "text-gold-light" : "text-muted"}`}>{label}</p>
      </div>
    </div>
  );
}
