"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icon";

export const ADMIN_ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Dashboard", icon: "grid" },
  { href: "/admin/counter", label: "Counter", icon: "scan" },
  { href: "/admin/reservations", label: "Reservations", icon: "cal" },
  { href: "/admin/members", label: "Black Card", icon: "card" },
  { href: "/admin/inquiries", label: "Inquiries", icon: "inbox" },
  { href: "/admin/menu", label: "Menu", icon: "book" },
  { href: "/admin/settings", label: "Website & staff", icon: "megaphone" },
];

const isOn = (path: string, href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));

export function AdminSidebar() {
  const path = usePathname();
  return (
    <nav className="grid gap-1" aria-label="Admin">
      {ADMIN_ITEMS.map((i) => (
        <Link key={i.href} href={i.href} aria-current={isOn(path, i.href) ? "page" : undefined} className={`group relative flex items-center gap-3 overflow-hidden rounded-xl px-3.5 py-2.5 text-sm font-semibold transition duration-300 ${isOn(path, i.href) ? "bg-gradient-to-r from-gold-light to-gold text-espresso shadow-[0_10px_24px_-12px_rgba(201,162,75,.8)]" : "text-cream/75 hover:translate-x-1 hover:bg-white/5 hover:text-gold-light"}`}>
          <Icon name={i.icon} size={18} className="transition duration-300 group-hover:scale-110" />
          {i.label}
          {isOn(path, i.href) ? <span className="ml-auto size-1.5 rounded-full bg-espresso" /> : null}
        </Link>
      ))}
    </nav>
  );
}

export function AdminTabs() {
  const path = usePathname();
  return (
    <nav className="rail flex gap-2 border-b border-line bg-white px-4 py-2.5 lg:hidden" aria-label="Admin">
      {ADMIN_ITEMS.map((i) => (
        <Link key={i.href} href={i.href} className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold ${isOn(path, i.href) ? "bg-ink text-cream" : "bg-cream text-ink"}`}>
          <Icon name={i.icon} size={15} />
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
