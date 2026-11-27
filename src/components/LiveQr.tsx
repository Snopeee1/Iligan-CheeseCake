"use client";

import { useEffect, useState } from "react";
import { myQr } from "@/app/actions/member";

/** Member QR that refreshes every 25 s, so a screenshot can't be reused. */
export function LiveQr({ size = 200 }: { size?: number }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [left, setLeft] = useState(25);
  useEffect(() => {
    let alive = true;
    const load = () =>
      myQr().then((r) => {
        if (alive && r) {
          setSvg(r.svg);
          setLeft(25);
        }
      });
    load();
    const refresh = setInterval(load, 25_000);
    const tick = setInterval(() => setLeft((s) => (s > 1 ? s - 1 : 25)), 1000);
    return () => {
      alive = false;
      clearInterval(refresh);
      clearInterval(tick);
    };
  }, []);
  return (
    <div className="grid justify-items-center gap-2">
      <div className="rounded-2xl border border-line bg-white p-3" style={{ width: size + 24, height: size + 24 }}>
        {svg ? <div className="size-full [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: svg }} role="img" aria-label="Your member QR code" /> : <div className="skeleton size-full" />}
      </div>
      <span className="flex items-center gap-2 text-xs text-muted">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-sage opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-sage" />
        </span>
        Live code · refreshes in {left}s
      </span>
    </div>
  );
}
