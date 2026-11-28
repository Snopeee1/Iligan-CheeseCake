import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PageHero, SectionHead } from "@/components/ui";
import { BlackCard3D, Tilt } from "@/components/motion";
import { d } from "@/components/fx";
import { ApplyForm } from "@/components/forms";
import { BC_BENEFITS, CompareTable } from "@/components/BlackCardBits";

export const metadata: Metadata = { title: "Black Card", description: "The ICH Black Card: ₱2,200 a year, ₱1,200 back in vouchers, member discounts, free drinks every visit and ₱2,000 off VIP Rooms." };

const FAQ: [string, string][] = [
  ["How much is the Black Card?", "₱2,200, valid for 1 year from the date you register. Pay by cash, card or bank transfer."],
  ["Does part of the ₱2,200 come back to me?", "Yes — ₱1,200 comes back to you as 3 vouchers of ₱400. You can use one voucher per dine-in visit, and you choose when to use it. Your PIN is asked before each use."],
  ["What do I get every visit?", "A free Hot or Cold Americano or Fruitea (Passion, Green Apple or Lychee), 10% off the regular menu for you and up to 4 companions, and 25% off the Chef VIP Special Menu. There’s no minimum spend."],
  ["Do members get lower VIP Room rates?", "Yes — every VIP Room costs you ₱2,000 less to book: Family ₱6,000, Corporate ₱10,000, Seminar ₱18,000 (spent on food and drinks)."],
  ["What about my birthday?", "You get one free slice of cheesecake, any flavour, during your birthday month."],
  ["Is the Black Card the same as the 5–10% offer?", "No. The 5–10% discount on selected items is our calling-card offer for returning dine-in guests. Black Card members get their own member discounts."],
  ["Is there a physical card?", "We’re starting with a digital card on your phone — sign in with your mobile number and PIN and show your QR at the counter. A physical card may come later."],
];

export default function BlackCardPage() {
  return (
    <>
      <PageHero
        crumb="Black Card"
        eyebrow="Membership"
        title={<>The ICH <em>Black Card</em></>}
        lead="Become a Black Card Premium VIP Member for ₱2,200 a year: member discounts, free coffee or Fruitea every visit, ₱2,000 off every VIP Room — and ₱1,200 of your fee comes back as food & drink vouchers."
        aside={<BlackCard3D className="ml-auto" />}
      >
        <div className="mt-8 flex flex-wrap gap-3.5">
          <a href="#apply" className="btn btn-gold">
            Apply for a Black Card <Icon name="arrow" />
          </a>
          <Link href="/account" className="btn btn-outline">
            <Icon name="lock" /> Member sign in
          </Link>
        </div>
      </PageHero>

      <section className="sec">
        <div className="wrap">
          <SectionHead eyebrow="Member benefits" title={<>Why go <em>Black</em></>} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {BC_BENEFITS.map((b, i) => (
              <Tilt key={b.t} max={8} className="rounded-[20px]"><div data-reveal="up" style={d(i * 110)} className="panel lift group grid h-full content-start gap-3">
                <span className="grid size-[52px] place-items-center rounded-[14px] bg-cheesecake text-berry transition duration-500 group-hover:rotate-[-8deg] group-hover:bg-berry group-hover:text-cream">
                  <Icon name={b.icon} size={24} />
                </span>
                <h3 className="h4">{b.t}</h3>
                <p className="text-[15px] text-muted">{b.d}</p>
              </div></Tilt>
            ))}
          </div>
        </div>
      </section>

      <section className="glow-dark py-20 md:py-24">
        <div className="wrap grid items-center gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <div className="eyebrow">Compare</div>
            <h2 className="h2 mt-3">
              Regular guest vs <em>Black Card member</em>
            </h2>
            <p className="lead mt-4">Member benefits are separate from the 5–10% customer offer on selected items.</p>
          </div>
          <div data-reveal="right"><CompareTable /></div>
        </div>
      </section>

      <section className="sec dots">
        <div className="wrap">
          <SectionHead eyebrow="How it works" title={<>Four steps to <em>membership</em></>} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Fill out the form", "Apply anytime: use the form below or ask our team in store."],
              ["Pay ₱2,200", "By cash, card or bank transfer. ₱1,200 comes back as 3 × ₱400 vouchers."],
              ["Get your digital card", "Sign in with your mobile number and PIN — your card and QR are on your phone. Valid for 1 year."],
              ["Enjoy perks", "Show your QR at the counter for discounts, vouchers and free drinks."],
            ].map(([t, desc], i) => (
              <div key={t} data-reveal="up" style={d(i * 120)} className="panel lift grid content-start gap-2">
                <span className="eyebrow">Step 0{i + 1}</span>
                <h3 className="h4">{t}</h3>
                <p className="text-[15px] text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec !pt-0" id="apply">
        <div className="wrap grid items-start gap-12 lg:grid-cols-2">
          <div>
            <div className="eyebrow">Questions</div>
            <h2 className="h2 mt-3 mb-6">
              Black Card <em>FAQ</em>
            </h2>
            <div data-reveal="up" className="divide-y divide-line overflow-hidden rounded-[20px] border border-line bg-white">
              {FAQ.map(([q, a], i) => (
                <details key={q} className="group px-6 py-5 transition-colors open:bg-cheesecake/40 hover:bg-cheesecake/25" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {q}
                    <Icon name="down" size={18} className="transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-2.5 text-[15px] text-muted">{a}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="grid gap-5 scroll-mt-28" data-reveal="right">
            <ApplyForm />
            <div className="rounded-[20px] border border-dashed border-line p-6">
              <h3 className="h4">Terms &amp; conditions</h3>
              <p className="mt-1 text-sm text-muted">Valid for 1 year from registration · one ₱400 voucher per dine-in · the 10% regular-menu discount covers the member + up to 4 companions. The full perks and terms will be published here word for word.</p>
            </div>
            <p className="text-sm text-muted">
              Already a member?{" "}
              <Link href="/account" className="link !text-sm">
                Sign in to your Black Card account →
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
