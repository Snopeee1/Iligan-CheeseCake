import { Dust } from "./motion";

/** The gold ring + ICH monogram + wordmark used by the opening screen and page loaders. */
export function IntroMark({ tagline = "Because Life is so Cheesy!", loop = false }: { tagline?: string; loop?: boolean }) {
  return (
    <div className={`intro-mark relative grid justify-items-center gap-6 px-6 text-center ${loop ? "loop" : ""}`}>
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r="70" fill="none" stroke="rgba(201,162,75,.18)" strokeWidth="1" />
        <circle className="ring" cx="75" cy="75" r="70" fill="none" stroke="#C9A24B" strokeWidth="1.5" strokeLinecap="round" transform="rotate(-90 75 75)" />
        <g className="mono" style={{ transformOrigin: "75px 75px" }}>
          <circle cx="75" cy="75" r="56" fill="#14110F" stroke="rgba(201,162,75,.45)" />
          <text x="75" y="87" textAnchor="middle" fontFamily="var(--font-cormorant), Georgia, serif" fontSize="34" fontWeight="600" fill="#E6C987" letterSpacing="3">
            ICH
          </text>
        </g>
      </svg>
      <div className="tag grid gap-2 text-cream">
        <span className="text-[11px] font-semibold tracking-[.4em] text-gold uppercase">Iligan</span>
        <span className="font-serif text-4xl font-semibold">Cheesecake House</span>
        <span className="font-serif text-lg text-gold-light italic">{tagline}</span>
      </div>
      <div className="bar">
        <i />
      </div>
    </div>
  );
}

/** Opening screen. Pure CSS — plays on every full page load, then lifts away like a curtain. */
export function Intro() {
  return (
    <div className="intro" aria-hidden="true">
      <Dust />
      <IntroMark />
    </div>
  );
}

export const INTRO_SCRIPT = `document.documentElement.classList.add('motion');setTimeout(function(){document.documentElement.classList.add('intro-done')},3400);`;
