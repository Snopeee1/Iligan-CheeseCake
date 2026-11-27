import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { Logo } from "@/components/ui";
import { Coupon, LiveCoupon } from "@/components/Offer";
import { LINKS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Quick links",
  description: "One tap to everything at Iligan Cheesecake House — menu, offer, Black Card, VIP Rooms, Messenger and directions.",
};

const TILES: { href: string; icon: IconName; t: string; d: string; ext?: boolean; gold?: boolean }[] = [
  { href: "/menu", icon: "book", t: "Menu", d: "Cheesecakes, pasta, meals & drinks", gold: true },
  { href: "/events#book", icon: "home", t: "Book a VIP Room", d: "Family · Corporate · Seminar" },
  { href: "/black-card", icon: "card", t: "Black Card", d: "₱2,200 · ₱1,200 back in vouchers" },
  { href: "/account", icon: "lock", t: "Member sign in", d: "Your digital card & QR" },
  { href: LINKS.messenger, icon: "chat", t: "Messenger", d: "Order or ask us anything", ext: true },
  { href: LINKS.phone, icon: "phone", t: "Call", d: "(063) 302 3635", ext: true },
  { href: LINKS.maps, icon: "map", t: "Directions", d: "San Miguel Village, Pala-o", ext: true },
  { href: LINKS.facebook, icon: "fb", t: "Facebook", d: "Daily specials & news", ext: true },
];

/** The page the calling-card QR opens: "One Tap, Whole Access". */
export default function CardPage() {
  return (
    <main className="glow-dark min-h-dvh pb-12">
      <div className="mx-auto grid max-w-[560px] gap-6 px-5 pt-8">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="pill">One tap · whole access</span>
        </div>
        <div className="fade-up">
          <p className="eyebrow">Welcome to</p>
          <h1 className="mt-2 font-serif text-[44px] leading-[48px] font-medium">
            Iligan Cheesecake <em className="text-gold-light">House</em>
          </h1>
          <p className="mt-2 text-cream/75">Because Life is so Cheesy! · Tue–Sun 11:30am–9:30pm</p>
        </div>
        <Suspense fallback={<Coupon />}>
          <LiveCoupon />
        </Suspense>
        <div className="grid grid-cols-2 gap-3">
          {TILES.map((t) => {
            const cls = `group grid content-start gap-2 rounded-2xl border p-4 transition active:scale-[.98] ${t.gold ? "border-gold bg-gold text-espresso" : "border-gold/25 bg-white/[.04] hover:border-gold"}`;
            const inner = (
              <>
                <span className={`grid size-11 place-items-center rounded-xl ${t.gold ? "bg-espresso/10" : "bg-gold/15 text-gold-light"}`}>
                  <Icon name={t.icon} size={22} />
                </span>
                <b className="font-serif text-xl leading-6 font-semibold">{t.t}</b>
                <span className={`text-xs ${t.gold ? "text-espresso/75" : "text-cream/65"}`}>{t.d}</span>
              </>
            );
            return t.ext ? (
              <a key={t.t} href={t.href} target={t.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={cls}>
                {inner}
              </a>
            ) : (
              <Link key={t.t} href={t.href} className={cls}>
                {inner}
              </Link>
            );
          })}
        </div>
        <Link href="/" className="btn btn-outline">
          Visit the full website <Icon name="arrow" />
        </Link>
        <p className="text-center text-xs text-cream/50">Bauhina St. cor. Champaca St., San Miguel Village, Pala-o, Iligan City · Pork-free kitchen</p>
      </div>
    </main>
  );
}
