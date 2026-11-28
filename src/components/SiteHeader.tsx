"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { Logo } from "./ui";

const NAV = [
  { href: "/menu", label: "Menu" },
  { href: "/black-card", label: "Black Card" },
  { href: "/events", label: "VIP & Events" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const path = usePathname();
  // Menu belongs to the page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === path;
  const setOpen = (v: boolean) => setOpenOn(v ? path : null);
  const hdr = useRef<HTMLElement>(null);
  useEffect(() => {
    let last = scrollY;
    const on = () => {
      const el = hdr.current;
      if (!el) return;
      const y = scrollY;
      el.dataset.scrolled = String(y > 20);
      el.dataset.hidden = String(y > 400 && y > last + 4);
      if (y < last - 4 || y < 400) el.dataset.hidden = "false";
      last = y;
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="hidden bg-[#0B0908] text-[13px] font-medium text-cream/70 lg:block">
        <div className="wrap flex h-10 items-center justify-between">
          <div className="flex gap-7">
            <span className="inline-flex items-center gap-2">
              <Icon name="pin" size={15} className="text-gold" />
              San Miguel Village, Pala-o, Iligan City
            </span>
            <span className="inline-flex items-center gap-2">
              <Icon name="clock" size={15} className="text-gold" />
              Tue–Sun · 11:30am–9:30pm · Closed Mondays
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="tel:+63633023635" className="inline-flex items-center gap-2 hover:text-gold-light">
              <Icon name="phone" size={15} className="text-gold" />
              (063) 302 3635
            </a>
            <Link href="/account" className="inline-flex items-center gap-2 hover:text-gold-light">
              <Icon name="card" size={15} className="text-gold" />
              Member sign in
            </Link>
          </div>
        </div>
      </div>
      <header ref={hdr} className="hdr sticky top-0 z-40 border-b border-gold/20 bg-espresso/90 backdrop-blur-xl">
        <div className="wrap flex h-[68px] items-center justify-between md:h-[84px]">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-9 text-[15px] font-semibold text-cream lg:flex">
            {NAV.map((n) => {
              const on = n.href === path || (n.href !== "/" && !n.href.includes("#") && path.startsWith(n.href));
              return (
                <Link key={n.href} href={n.href} className="navlink py-1.5 transition-colors hover:text-gold-light" aria-current={on ? "page" : undefined}>
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/contact#inquire" className="btn btn-gold pulse-ring hidden !px-5 !py-3 sm:inline-flex">
              <Icon name="chat" />
              Order or Ask Us
            </Link>
            <button type="button" onClick={() => setOpen(true)} className="grid size-[42px] place-items-center rounded-xl border border-gold/40 text-gold-light lg:hidden" aria-label="Open menu" aria-expanded={open}>
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 bg-black/60" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="glow-dark absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col gap-6 p-6 shadow-2xl fade-up">
            <div className="flex items-center justify-between">
              <Logo />
              <button onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-xl border border-gold/40 text-gold-light" aria-label="Close menu">
                <Icon name="x" />
              </button>
            </div>
            <nav className="grid gap-1 text-lg font-semibold">
              {[{ href: "/", label: "Home" }, { href: "/#how-it-works", label: "How it works" }, ...NAV, { href: "/card", label: "Quick links" }].map((n, i) => (
                <Link key={n.href} href={n.href} style={{ animationDelay: `${80 + i * 50}ms` }} className="fade-up flex items-center justify-between rounded-xl px-3 py-3 font-serif text-2xl hover:bg-white/5">
                  {n.label}
                  <Icon name="chevron" size={18} className="text-gold" />
                </Link>
              ))}
            </nav>
            <div className="mt-auto grid gap-3">
              <Link href="/contact#inquire" className="btn btn-gold">
                Order or Ask Us
              </Link>
              <Link href="/account" className="btn btn-outline">
                <Icon name="card" />
                Member sign in
              </Link>
              <a href="tel:+63633023635" className="text-center text-sm text-cream/70">
                Call (063) 302 3635
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
