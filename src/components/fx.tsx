import { Fragment, useId } from "react";

/** Infinite marquee. Content is duplicated so the loop is seamless. */
export function Marquee({ children, speed = 38, gap = 28, reverse = false, className = "" }: { children: React.ReactNode; speed?: number; gap?: number; reverse?: boolean; className?: string }) {
  return (
    <div className={`marquee ${reverse ? "reverse" : ""} ${className}`} style={{ "--speed": `${speed}s`, "--gap": `${gap}px` } as React.CSSProperties}>
      <div className="marquee__track">{children}</div>
      <div className="marquee__track" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}

/**
 * Word-by-word reveal. Pass parts; parts with em: true render in <em>.
 * e.g. <Words as="h2" className="h2" parts={[{ t: "Made fresh," }, { t: "served with love", em: true }]} />
 */
export function Words({ parts, as: Tag = "h2", className = "", delay = 0, auto = false }: { parts: { t: string; em?: boolean }[]; as?: "h1" | "h2" | "h3" | "p"; className?: string; delay?: number; auto?: boolean }) {
  let i = 0;
  return (
    <Tag className={`words ${auto ? "auto" : ""} ${className}`} style={{ "--d": `${delay}ms` } as React.CSSProperties}>
      {parts.map((p, pi) => {
        const words = p.t.split(" ").filter(Boolean);
        const inner = words.map((w, wi) => (
          <Fragment key={wi}>
            <span className="w">
              <span style={{ "--i": i++ } as React.CSSProperties}>{w}</span>
            </span>{" "}
          </Fragment>
        ));
        return p.em ? <em key={pi}>{inner}</em> : <Fragment key={pi}>{inner}</Fragment>;
      })}
    </Tag>
  );
}

/** Rotating circular text badge. */
export function SpinBadge({ text, center, className = "" }: { text: string; center: React.ReactNode; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <div className={`relative grid place-items-center ${className}`}>
      <svg viewBox="0 0 200 200" className="spin-slow absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <path id={`c${id}`} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text fill="currentColor" fontSize="15" fontWeight="600" letterSpacing="5" fontFamily="var(--font-dm), sans-serif">
          <textPath href={`#c${id}`}>{text}</textPath>
        </text>
      </svg>
      <div className="relative">{center}</div>
    </div>
  );
}

/** Section head with ornament + word reveal. */
export function RevealHead({ eyebrow, parts, lead, align = "center", className = "" }: { eyebrow: string; parts: { t: string; em?: boolean }[]; lead?: React.ReactNode; align?: "center" | "left"; className?: string }) {
  return (
    <div className={`head ${align === "left" ? "left" : ""} ${className}`}>
      <div className="orn" data-reveal="scale">
        <i />
      </div>
      <div className="eyebrow" data-reveal="up">
        {eyebrow}
      </div>
      <Words parts={parts} className="h2" />
      {lead ? (
        <p className="lead" data-reveal="up" style={{ "--d": "200ms" } as React.CSSProperties}>
          {lead}
        </p>
      ) : null}
    </div>
  );
}

export const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;
