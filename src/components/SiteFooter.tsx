import Link from "next/link";
import { LINKS } from "@/lib/content";
import { Icon } from "./Icon";
import { Logo } from "./ui";
import { FairyLights } from "./decor";

export function SiteFooter() {
  return (
    <>
      <footer className="glow-dark spotlight relative overflow-hidden pb-28 md:pb-10">
        <FairyLights className="absolute inset-x-0 top-0" swags={7} sag={20} />
        <div className="wrap">
          <div className="flex flex-col items-start justify-between gap-8 border-b border-gold/20 pt-14 pb-10 md:flex-row md:items-end md:pt-[72px] md:pb-14">
            <p data-reveal="up" className="gold-text font-serif text-[46px] leading-[54px] font-medium tracking-tight italic md:text-[72px] md:leading-[80px]">
              Because Life
              <br />
              is so Cheesy!
            </p>
            <Link href="/contact#inquire" className="btn btn-gold">
              Order or Ask Us <Icon name="arrow" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-8 border-b border-gold/20 py-12 md:grid-cols-[1.3fr_1fr_1fr_1fr] md:gap-12">
            <div className="col-span-2 md:col-span-1">
              <Logo />
              <p className="mt-4 max-w-[300px] text-sm leading-[22px] text-cream/70">Handcrafted Signature Cheesecakes, Artisan Pastas and Signature Rice Entrées. Exquisite flavors. Premium experience. Proudly Iligan.</p>
              <div className="mt-5 flex gap-2.5">
                {[
                  { href: LINKS.facebook, icon: "fb" as const, label: "Facebook" },
                  { href: LINKS.instagram, icon: "ig" as const, label: "Instagram" },
                  { href: LINKS.tiktok, icon: "tiktok" as const, label: "TikTok" },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="grid size-[42px] place-items-center rounded-full border border-gold/40 text-gold-light transition duration-300 hover:-translate-y-1 hover:rotate-[8deg] hover:bg-gold hover:text-espresso">
                    <Icon name={s.icon} size={18} />
                  </a>
                ))}
              </div>
            </div>
            <FootCol title="Explore" items={[["Menu", "/menu"], ["Black Card", "/black-card"], ["VIP Rooms", "/events"], ["Book the whole place", "/events#exclusive"], ["Quick links", "/card"]]} />
            <FootCol title="Visit" items={[["Bauhina St. cor. Champaca St.", LINKS.maps], ["San Miguel Village, Pala-o", LINKS.maps], ["Tue–Sun · 11:30am–9:30pm", "/contact"], ["Closed Mondays", "/contact"]]} />
            <FootCol title="Contact" items={[["(063) 302 3635", LINKS.phone], ["Messenger", LINKS.messenger], ["iligancheesecakehouse@gmail.com", LINKS.email], ["Member sign in", "/account"]]} />
          </div>
          <div className="flex flex-col justify-between gap-1.5 pt-6 text-[13px] text-cream/60 md:flex-row">
            <span>© {2026} Iligan Cheesecake House. All rights reserved.</span>
            <span>Dine-in · Takeout · Grab · Maxim · Foodpanda</span>
          </div>
        </div>
      </footer>
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2.5 border-t border-gold/30 bg-espresso/95 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] md:hidden">
        <Link href="/contact#inquire" className="btn btn-berry flex-1 !py-3.5">
          Order or Ask Us
        </Link>
        <a href={LINKS.messenger} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-[52px] !p-0" aria-label="Message us on Messenger">
          <Icon name="chat" />
        </a>
        <a href={LINKS.phone} className="btn btn-outline w-[52px] !p-0" aria-label="Call">
          <Icon name="phone" />
        </a>
      </div>
    </>
  );
}

function FootCol({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div>
      <h2 className="mb-4 text-xs font-semibold tracking-[2px] text-gold uppercase">{title}</h2>
      <ul className="grid gap-2.5 text-[15px] text-cream/80">
        {items.map(([label, href]) => (
          <li key={label}>
            {href.startsWith("/") ? (
              <Link href={href} className="u-link hover:text-gold-light">
                {label}
              </Link>
            ) : (
              <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="break-words hover:text-gold-light">
                {label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
