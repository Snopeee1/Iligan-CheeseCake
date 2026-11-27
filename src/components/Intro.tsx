import { Dust } from "./motion";

/** Opening screen. Pure CSS: plays once per visit (an inline script marks return visits as "seen" before paint). */
export function Intro() {
  return (
    <div className="intro" aria-hidden="true">
      <Dust />
      <div className="relative grid justify-items-center gap-6 px-6 text-center">
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
        <div className="tag grid gap-2">
          <span className="text-[11px] font-semibold tracking-[.4em] text-gold uppercase">Iligan</span>
          <span className="font-serif text-4xl font-semibold">Cheesecake House</span>
          <span className="font-serif text-lg text-gold-light italic">Because Life is so Cheesy!</span>
        </div>
        <div className="bar">
          <i />
        </div>
      </div>
    </div>
  );
}

export const INTRO_SCRIPT = `document.documentElement.classList.add('motion');try{if(sessionStorage.getItem('ich-intro')){document.documentElement.classList.add('seen')}else{sessionStorage.setItem('ich-intro','1')}}catch(e){document.documentElement.classList.add('seen')}`;
