import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { PageHero, Photo } from "@/components/ui";
import { ContactCards, MapEmbed } from "@/components/Contact";
import { InquiryForm } from "@/components/forms";
import { LINKS } from "@/lib/content";

export const metadata: Metadata = { title: "Contact", description: "Visit Iligan Cheesecake House at Bauhina St. cor. Champaca St., San Miguel Village, Pala-o, Iligan City. Open Tuesday–Sunday, 11:30 AM – 9:30 PM." };

export default function ContactPage() {
  return (
    <>
      <PageHero
        crumb="Contact"
        eyebrow="Visit us"
        title={<>Come <em>say hello</em></>}
        lead="Order, reserve a table, book a VIP Room or ask about packages — we reply on Messenger and by phone."
        aside={<Photo name="storefront-sign-01" eager sizes="560px" className="h-[320px] rounded-3xl" />}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a className="btn btn-gold" href={LINKS.messenger} target="_blank" rel="noopener noreferrer">
            <Icon name="chat" /> Messenger
          </a>
          <a className="btn btn-outline" href={LINKS.phone}>
            <Icon name="phone" /> Call us
          </a>
          <a className="btn btn-outline" href={LINKS.maps} target="_blank" rel="noopener noreferrer">
            <Icon name="map" /> Directions
          </a>
        </div>
      </PageHero>
      <section className="sec dots">
        <div className="wrap grid gap-4 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
          <div data-reveal="left"><MapEmbed /></div>
          <div data-reveal="right"><ContactCards /></div>
          <div id="inquire" data-reveal="up" className="grid scroll-mt-28 overflow-hidden rounded-3xl border border-line bg-white shadow-[var(--shadow-soft)] lg:col-span-2 lg:grid-cols-[320px_1fr]">
            <div className="glow-dark grid content-start gap-4 p-8">
              <div className="eyebrow">Quick inquiry</div>
              <h2 className="h4 text-cream">Tell us what you’re planning</h2>
              <p className="text-sm text-cream/75">Orders, reservations, VIP Rooms, exclusive bookings, packages or the Black Card — we’ll get back to you on Messenger or by phone.</p>
              <ul className="mt-2 grid gap-2 text-sm text-cream/80">
                <li className="flex items-center gap-2"><Icon name="check" size={16} className="text-gold" /> Dine-in · Takeout</li>
                <li className="flex items-center gap-2"><Icon name="truck" size={16} className="text-gold" /> Grab · Maxim · Foodpanda</li>
                <li className="flex items-center gap-2"><Icon name="leaf" size={16} className="text-gold" /> Pork-free kitchen</li>
              </ul>
            </div>
            <InquiryForm defaultTopic="Order" />
          </div>
        </div>
      </section>
    </>
  );
}
