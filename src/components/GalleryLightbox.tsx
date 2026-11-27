"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "./Icon";
import { Photo } from "./ui";

export type GItem = { img: string; cap: string; cls?: string };

export function GalleryLightbox({ items }: { items: GItem[] }) {
  const [i, setI] = useState<number | null>(null);
  const close = useCallback(() => setI(null), []);
  const go = useCallback((d: number) => setI((x) => (x === null ? x : (x + d + items.length) % items.length)), [items.length]);
  useEffect(() => {
    if (i === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", k);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", k);
    };
  }, [i, close, go]);

  return (
    <>
      <div className="grid grid-cols-2 grid-rows-[220px_160px_160px] gap-4 md:grid-cols-[1.6fr_1fr_1fr] md:grid-rows-[280px_280px]">
        {items.map((x, n) => (
          <button
            type="button"
            key={x.img}
            onClick={() => setI(n)}
            data-reveal="clip"
            style={{ "--d": `${n * 120}ms` } as React.CSSProperties}
            className={`group relative overflow-hidden rounded-[18px] text-left ${x.cls ?? ""}`}
            aria-label={`Open photo: ${x.cap}`}
          >
            <Photo name={x.img} alt={x.cap} sizes="(max-width:768px) 50vw, 500px" className="zoom-img !absolute inset-0" />
            <span className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-transparent to-transparent opacity-60 transition duration-500 group-hover:opacity-90" />
            <span className="pill absolute bottom-3.5 left-3.5 transition duration-500 group-hover:-translate-y-1">{x.cap}</span>
            <span className="absolute top-3.5 right-3.5 grid size-10 scale-75 place-items-center rounded-full bg-cream/90 text-espresso opacity-0 transition duration-500 group-hover:scale-100 group-hover:opacity-100">
              <Icon name="plus" size={18} />
            </span>
          </button>
        ))}
      </div>
      {i !== null ? (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={items[i].cap} onClick={close}>
          <div className="relative h-[78vh] w-[92vw] max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <Image src={`/images/${items[i].img}.webp`} alt={items[i].cap} fill sizes="92vw" className="object-contain" />
          </div>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 font-serif text-xl text-gold-light italic">
            {items[i].cap} · {i + 1}/{items.length}
          </p>
          <button className="absolute top-5 right-5 grid size-12 place-items-center rounded-full border border-gold/50 text-gold-light hover:bg-gold hover:text-espresso" onClick={close} aria-label="Close">
            <Icon name="x" />
          </button>
          <button className="absolute top-1/2 left-4 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-gold/50 text-gold-light hover:bg-gold hover:text-espresso" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous photo">
            <Icon name="back" />
          </button>
          <button className="absolute top-1/2 right-4 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-gold/50 text-gold-light hover:bg-gold hover:text-espresso" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next photo">
            <Icon name="chevron" />
          </button>
        </div>
      ) : null}
    </>
  );
}
