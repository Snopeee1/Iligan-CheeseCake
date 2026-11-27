import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Icon } from "@/components/Icon";
import { PageHero, Photo } from "@/components/ui";
import { MenuBrowser } from "@/components/MenuBrowser";
import { getLiveMenu } from "@/lib/menu";
import { getMember } from "@/lib/auth";
import { CATEGORY_META, LINKS } from "@/lib/content";

export const metadata: Metadata = { title: "Menu", description: "Signature Cheesecakes, Artisan Pastas, Signature Rice Entrées, Coffee & Drinks at Iligan Cheesecake House." };

export default function MenuPage() {
  return (
    <>
      <PageHero
        crumb="Menu"
        eyebrow="Our Menu"
        title={<>The full <em>menu</em></>}
        lead="Signature Cheesecakes, Pasta, Meals, and Coffee & Drinks. Enjoy 5–10% DISCOUNT on selected items on your next dine-in. Chef VIP Special Menu prices are for Black Card members."
        aside={
          <div className="grid grid-cols-2 gap-3.5">
            <Photo name="hero-basque-golden-cheesecake" eager sizes="300px" className="h-[300px] rounded-t-full rounded-b-[14px]" />
            <Photo name="menu-nutella-cheesecake" sizes="300px" className="mt-10 h-[300px] rounded-[14px]" />
          </div>
        }
      />
      <Suspense fallback={<div className="wrap py-16"><div className="skeleton h-[900px]" /></div>}>
        <LiveMenu />
      </Suspense>
      <div className="wrap pb-24">
        <div className="glow-dark flex flex-col items-start justify-between gap-6 rounded-3xl p-7 md:flex-row md:items-center md:p-10">
          <div>
            <div className="eyebrow">Ready to order?</div>
            <h3 className="h3 mt-1.5">
              Dine in, take out, or get it <em className="!text-gold-light">delivered</em>
            </h3>
            <p className="mt-1.5 text-cream/75">Message us to order, or find us on Grab, Maxim and Foodpanda. Prices subject to change; in-store prices may differ from delivery apps.</p>
          </div>
          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
            <a className="btn btn-gold" href={LINKS.messenger} target="_blank" rel="noopener noreferrer">
              Order on Messenger <Icon name="arrow" />
            </a>
            <a className="btn btn-outline" href={LINKS.phone}>
              Call (063) 302 3635
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

async function LiveMenu() {
  const [raw, member] = await Promise.all([getLiveMenu(), getMember()]);
  // Chef VIP prices never leave the server unless a signed-in member is viewing.
  const menu = member ? raw : raw.map((c) => ({ ...c, groups: c.groups.map((g) => (g.membersOnly ? { ...g, items: g.items.map((i) => ({ ...i, price: null })) } : g)) }));
  const meta = CATEGORY_META;
  return (
    <>
      <MenuBrowser menu={menu} meta={meta} isMember={!!member} />
      {!member ? (
        <div className="wrap -mt-6 pb-10">
          <p className="text-center text-sm text-muted">
            Black Card member?{" "}
            <Link href="/account/login?next=/menu" className="link !text-sm">
              Sign in to see Chef VIP prices
            </Link>
          </p>
        </div>
      ) : null}
    </>
  );
}
