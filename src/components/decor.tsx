/* Decorations taken from the café itself: fairy-light strings with hanging white
   blossoms (the dining-hall ceiling) and ivy garlands with small white flowers
   (the garlands along every wall). Pure SVG, server-rendered, decorative only. */

const W = 1200;

/** Swagged fairy-light string. `drape` adds hanging white blossom strands. */
export function FairyLights({ className = "", swags = 6, sag = 26, drape = false }: { className?: string; swags?: number; sag?: number; drape?: boolean }) {
  const seg = W / swags;
  const top = 6;
  let wire = `M0 ${top}`;
  const bulbs: { x: number; y: number; i: number }[] = [];
  const strands: { x: number; y: number; len: number; i: number }[] = [];
  for (let s = 0; s < swags; s++) {
    const x0 = s * seg;
    const cx = x0 + seg / 2;
    const cy = top + sag * 2; // control point → lowest point of the swag is top + sag
    wire += ` Q${cx} ${cy} ${x0 + seg} ${top}`;
    for (let k = 1; k <= 5; k++) {
      const t = k / 6;
      const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * (x0 + seg);
      const y = (1 - t) ** 2 * top + 2 * (1 - t) * t * cy + t ** 2 * top;
      bulbs.push({ x, y, i: s * 5 + k });
      if (drape && k % 2 === 1) strands.push({ x, y, len: 22 + ((s * 7 + k * 5) % 4) * 9, i: s * 5 + k });
    }
  }
  const h = top + sag + (drape ? 70 : 14);
  return (
    <svg aria-hidden="true" focusable="false" viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="xMidYMin slice" className={`pointer-events-none block w-full ${className}`} style={{ height: drape ? "clamp(64px, 9vw, 110px)" : "clamp(30px, 4vw, 48px)" }}>
      <path d={wire} fill="none" stroke="#5a4630" strokeWidth="1.4" opacity=".8" />
      {strands.map((st) => (
        <g key={`s${st.i}`} opacity=".92">
          <path d={`M${st.x} ${st.y} q ${st.i % 2 ? 3 : -3} ${st.len / 2} 0 ${st.len}`} fill="none" stroke="#6f8a52" strokeWidth="1" />
          {Array.from({ length: 5 }, (_, j) => (
            <circle key={j} cx={st.x + (j % 2 ? 2.4 : -2.4)} cy={st.y + 6 + (j * st.len) / 5} r={2.6 - j * 0.3} fill="#fbf4e6" />
          ))}
        </g>
      ))}
      {bulbs.map((b) => (
        <g key={b.i} className="bulb" style={{ animationDelay: `${-((b.i * 0.53) % 3.2)}s` }}>
          <circle cx={b.x} cy={b.y + 3} r="9" fill="#ffd27a" opacity=".22" />
          <circle cx={b.x} cy={b.y + 3} r="3.2" fill="#fff1c4" />
        </g>
      ))}
    </svg>
  );
}

/** Horizontal ivy garland with small white blossoms, as a section divider. */
export function IvyGarland({ className = "" }: { className?: string }) {
  const leaves: { x: number; y: number; r: number; c: string }[] = [];
  const flowers: { x: number; y: number }[] = [];
  const vineY = (x: number) => 22 + Math.sin(x / 70) * 6;
  for (let x = 10; x < W; x += 26) {
    const up = Math.round(x / 26) % 2 === 0;
    leaves.push({ x, y: vineY(x), r: up ? -38 : 142, c: Math.round(x / 13) % 3 === 0 ? "#6b8a4f" : "#4d6b3c" });
    if (Math.round(x / 26) % 5 === 0) flowers.push({ x: x + 9, y: vineY(x + 9) + (up ? 6 : -6) });
  }
  let vine = `M0 ${vineY(0)}`;
  for (let x = 20; x <= W; x += 20) vine += ` L${x} ${vineY(x).toFixed(1)}`;
  return (
    <svg aria-hidden="true" focusable="false" viewBox={`0 0 ${W} 44`} preserveAspectRatio="xMidYMid slice" className={`pointer-events-none block h-[34px] w-full md:h-[44px] ${className}`}>
      <path d={vine} fill="none" stroke="#5a4630" strokeWidth="1.6" />
      {leaves.map((l, i) => (
        <path key={i} d="M0 0 C 5 -7, 14 -7, 18 0 C 14 6, 5 6, 0 0 Z" fill={l.c} transform={`translate(${l.x} ${l.y.toFixed(1)}) rotate(${l.r})`} />
      ))}
      {flowers.map((f, i) => (
        <g key={i} transform={`translate(${f.x.toFixed(1)} ${f.y.toFixed(1)})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 3.2} cy={Math.sin((a * Math.PI) / 180) * 3.2} r="2.6" fill="#fbf4e6" />
          ))}
          <circle r="1.6" fill="#e6c987" />
        </g>
      ))}
    </svg>
  );
}
