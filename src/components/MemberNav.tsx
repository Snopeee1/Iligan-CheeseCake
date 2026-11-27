"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icon";

const ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: "/account", label: "Dashboard", icon: "home" },
  { href: "/account/card", label: "My card", icon: "qr" },
  { href: "/account/book", label: "Book a room", icon: "cal" },
  { href: "/account/profile", label: "Profile", icon: "user" },
];

export function MemberNav() {
  const path = usePathname();
  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Member">
      {ITEMS.map((i) => (
        <Link key={i.href} href={i.href} aria-current={path === i.href ? "page" : undefined} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${path === i.href ? "bg-gold/15 text-gold-light" : "text-cream/80 hover:text-gold-light"}`}>
          {i.label}
        </Link>
      ))}
      <Link href="/menu" className="rounded-full px-4 py-2 text-sm font-semibold text-cream/80 hover:text-gold-light">
        Menu
      </Link>
    </nav>
  );
}

export function MemberTabs() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-gold/30 bg-espresso px-2 pt-3 pb-[calc(14px+env(safe-area-inset-bottom,0px))] text-center text-[11px] font-semibold text-cream/70 md:hidden" aria-label="Member">
      {ITEMS.map((i) => (
        <Link key={i.href} href={i.href} className={`grid justify-items-center gap-1 ${path === i.href ? "text-gold-light" : ""}`} aria-current={path === i.href ? "page" : undefined}>
          <Icon name={i.icon} size={20} />
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
