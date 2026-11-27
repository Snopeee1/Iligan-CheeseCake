"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LiveCategory, LiveItem } from "@/lib/menu";
import { Icon, type IconName } from "./Icon";
import { Photo } from "./ui";
import { Tilt } from "./motion";

type Meta = Record<string, { icon: string; title: string; em: string; blurb: string }>;
const peso = (n: number) => `₱${n.toLocaleString("en-PH")}`;

const BADGE: Record<string, string> = {
  "Basque Golden Creamy Cheesecake": "Signature",
  "ICH Nutella Cheesecake": "ICH Special",
  "Almond Heaven Chocolate Cake": "Limited slices",
  "ICH Heaven Overload Cheesecake": "ICH Original",
  "ICH Lotus Biscoff Dream Cheesecake": "ICH Original",
  "ICH Special Black Forest Cheesecake": "ICH Special",
};
const IMG: Record<string, string> = {
  "Basque Golden Creamy Cheesecake": "hero-basque-golden-cheesecake",
  "ICH Nutella Cheesecake": "menu-nutella-cheesecake",
  "Oreo Cheesecake": "menu-oreo-cheesecake",
  "Almond Heaven Chocolate Cake": "menu-almond-heaven-chocolate-cake",
  "ICH Creamy Chicken Carbonara": "menu-creamy-chicken-carbonara",
  "Creamy Tuscan Chicken": "menu-creamy-tuscan-chicken",
  "Tonno Alla Griglia": "menu-tonno-alla-griglia",
  "ICH Signature Truffle Mushroom Soup in a Bread Bowl": "menu-truffle-mushroom-soup",
};

export function MenuBrowser({ menu, meta, isMember }: { menu: LiveCategory[]; meta: Meta; isMember: boolean }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const query = q.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      menu
        .filter((c) => cat === "all" || c.id === cat)
        .map((c) => ({
          ...c,
          groups: c.groups
            .map((g) => ({ ...g, items: g.items.filter((i) => !query || i.name.toLowerCase().includes(query) || i.description?.toLowerCase().includes(query)) }))
            .filter((g) => g.items.length),
        }))
        .filter((c) => c.groups.length),
    [menu, cat, query],
  );
  const total = menu.reduce((n, c) => n + c.groups.reduce((m, g) => m + g.items.length, 0), 0);

  return (
    <>
      <div className="sticky top-[68px] z-30 border-b border-line bg-cream/95 backdrop-blur md:top-[84px]">
        <div className="wrap flex flex-col gap-3 py-3 lg:flex-row lg:items-center">
          <div className="rail -mx-[var(--pad)] flex gap-2 px-[var(--pad)] lg:mx-0 lg:px-0">
            <Tab on={cat === "all"} onClick={() => setCat("all")} icon="grid">
              All · {total}
            </Tab>
            {menu.map((c) => (
              <Tab key={c.id} on={cat === c.id} onClick={() => setCat(c.id)} icon={(meta[c.id]?.icon ?? "grid") as IconName}>
                {c.name} · {c.groups.reduce((m, g) => m + g.items.length, 0)}
              </Tab>
            ))}
          </div>
          <label className="relative lg:ml-auto lg:w-72">
            <span className="sr-only">Search the menu</span>
            <Icon name="search" size={18} className="absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cheesecake, pasta, latte…" className="input !h-11 !rounded-full !bg-white !pl-11" type="search" />
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="wrap py-24 text-center">
          <p className="font-serif text-2xl">Nothing matches “{q}”.</p>
          <button className="link mt-3" onClick={() => { setQ(""); setCat("all"); }}>
            Clear search
          </button>
        </div>
      ) : null}

      {filtered.map((c, ci) => {
        const m = meta[c.id];
        return (
          <section key={c.id} id={c.id} className="scroll-mt-40 py-16 md:py-20">
            <div className="wrap">
              <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <div className="eyebrow flex items-center gap-2">
                    <Icon name={(m?.icon ?? "grid") as IconName} size={16} /> {String(menu.findIndex((x) => x.id === c.id) + 1).padStart(2, "0")} · {c.name}
                  </div>
                  <h2 className="h2 mt-2">
                    {m?.title} <em>{m?.em}</em>
                  </h2>
                </div>
                {m?.blurb ? <p className="max-w-md text-muted">{m.blurb}</p> : null}
              </div>
              {c.id === "signature-cheesecakes" ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
                  {c.groups.flatMap((g) => g.items).map((it, n) => (
                    <div key={it.key} className="fade-up" style={{ animationDelay: `${Math.min(n, 8) * 60}ms` }}>
                      <Tilt max={8} className="h-full rounded-[20px]">
                        <CakeCard it={it} />
                      </Tilt>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`grid gap-6 ${c.groups.length > 1 ? "lg:grid-cols-2" : ""}`}>
                  {c.groups.map((g) => (g.membersOnly ? <VipGroup key={g.name} g={g} isMember={isMember} /> : <Group key={g.name} g={g} />))}
                </div>
              )}
            </div>
            {ci < filtered.length - 1 ? <div className="wrap"><div className="mt-16 h-px bg-line md:mt-20" /></div> : null}
          </section>
        );
      })}
    </>
  );
}

function Tab({ on, onClick, icon, children }: { on: boolean; onClick: () => void; icon: IconName; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${on ? "border-ink bg-ink text-cream" : "border-line bg-white hover:border-gold"}`}>
      <Icon name={icon} size={16} />
      {children}
    </button>
  );
}

function PriceTag({ it, unit = "" }: { it: LiveItem; unit?: string }) {
  if (!it.available) return <span className="st bad">Sold out today</span>;
  if (it.price === null) return <span className="tbd">Ask for price</span>;
  return (
    <>
      {it.from ? <small className="mr-1 font-medium text-muted">from</small> : null}
      {peso(it.price)}
      {unit ? <small className="ml-0.5 text-[11px] font-medium opacity-80">{unit}</small> : null}
    </>
  );
}

function CakeCard({ it }: { it: LiveItem }) {
  const img = IMG[it.name];
  return (
    <article className={`group lift flex h-full flex-col overflow-hidden rounded-[20px] border border-line/60 bg-white shadow-[var(--shadow-soft)] ${!it.available ? "opacity-70" : ""}`}>
      <div className="relative">
        {img ? (
          <Photo name={img} alt={it.name} sizes="(max-width:768px) 50vw, 300px" className="zoom-img aspect-[4/3.1]" />
        ) : (
          <div className="grid aspect-[4/3.1] place-content-center bg-[radial-gradient(circle_at_30%_20%,#F7EDD8,#EBDCBC)] text-center">
            <b className="font-serif text-3xl text-gold-deep">ICH</b>
            <span className="text-[10px] font-semibold tracking-[.2em] text-gold-deep/70 uppercase">Photo soon</span>
          </div>
        )}
        {BADGE[it.name] ? <span className="pill light absolute top-3 left-3 !text-[10px]">{BADGE[it.name]}</span> : null}
        <span className={`absolute right-3 -bottom-4 rounded-xl px-3 py-1.5 text-[15px] font-bold shadow-[0_10px_20px_-8px_rgba(142,27,46,.7)] ${it.price && it.available ? "bg-berry text-cream" : "bg-white text-berry"}`}>
          <PriceTag it={it} unit="/slice" />
        </span>
      </div>
      <div className="grid flex-1 content-start gap-1.5 px-4 pt-6 pb-4 md:px-[22px] md:pb-[22px]">
        <h3 className="font-serif text-lg leading-6 font-semibold md:text-2xl md:leading-[30px]">{it.name}</h3>
        {it.description ? <p className="text-[13px] leading-5 text-muted md:text-sm md:leading-[21px]">{it.description}</p> : null}
      </div>
    </article>
  );
}

function Group({ g }: { g: { name: string; note?: string; items: LiveItem[] } }) {
  return (
    <div className="fade-up lift rounded-[20px] border border-line bg-white p-6 shadow-[var(--shadow-soft)] md:p-7">
      <h3 className="h4 flex items-center gap-2.5">{g.name}</h3>
      {g.note ? <p className="mt-1 text-[13px] text-muted">{g.note}</p> : null}
      <div className="mt-2">
        {g.items.map((i) => (
          <div key={i.key} className={`mi -mx-2 rounded-lg px-2 transition hover:bg-cheesecake/40 ${!i.available ? "opacity-60" : ""}`}>
            <span className="n">
              {i.name}
              {i.description ? <small>{i.description}</small> : null}
            </span>
            <span className="dots-line" />
            <b>
              <PriceTag it={i} />
            </b>
          </div>
        ))}
      </div>
    </div>
  );
}

function VipGroup({ g, isMember }: { g: { name: string; note?: string; items: LiveItem[] }; isMember: boolean }) {
  return (
    <div className="glow-dark spotlight fade-up relative overflow-hidden rounded-[20px] p-6 shadow-[var(--shadow-deep)] md:p-7">
      <h3 className="h4 flex items-center gap-2.5 text-gold-light">
        <Icon name="card" size={22} /> Chef VIP Special Menu
      </h3>
      <p className="mt-1 text-[13px] text-gold-light/90">{isMember ? "Your member prices · 25% off is applied at the counter" : "Prices shown to signed-in Black Card members · members get 25% off"}</p>
      <div className="mt-2">
        {g.items.map((i) => (
          <div key={i.key} className="mi">
            <span className="n">{i.name}</span>
            <span className="dots-line !border-gold/40" />
            <b className="!text-gold-light">
              {isMember ? (
                i.price !== null ? peso(i.price) : <span className="tbd">Ask staff</span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="lock" size={14} /> Members
                </span>
              )}
            </b>
          </div>
        ))}
      </div>
      {!isMember ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/account/login?next=/menu" className="btn btn-gold btn-sm">
            <Icon name="lock" /> Sign in to see prices
          </Link>
          <Link href="/black-card" className="btn btn-outline btn-sm">
            Get a Black Card
          </Link>
        </div>
      ) : null}
    </div>
  );
}
