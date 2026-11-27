import type { Metadata } from "next";
import { Suspense } from "react";
import { Icon } from "@/components/Icon";
import { PageHero, Photo, PhotoPlaceholder, SectionHead } from "@/components/ui";
import { BookingForm } from "@/components/forms";
import { d } from "@/components/fx";
import { getMember } from "@/lib/auth";
import { list } from "@/lib/db";
import { peso, ROOMS } from "@/lib/content";

export const metadata: Metadata = { title: "VIP Rooms & Events", description: "Private VIP Rooms for 8–30 guests and exclusive bookings for 50–60 at Iligan Cheesecake House. No room fee when you reach the consumable within 4 hours." };

export default function EventsPage() {
  return (
    <>
      <PageHero
        crumb="VIP Rooms & Events"
        eyebrow="Private dining & events"
        title={<>VIP Rooms &amp; <em>Events</em></>}
        lead="Three Premier VIP Rooms for 8–30 guests, and the whole Main Dining + Seminar Room for 50–60. No room fee when you reach the consumable within 4 hours."
        aside={<Photo name="vip-room-family-01" eager sizes="500px" className="ml-auto h-[380px] max-w-[460px] rounded-t-full rounded-b-2xl" />}
      >
        <div className="mt-8 flex flex-wrap gap-3.5">
          <a href="#book" className="btn btn-gold">
            Request a booking <Icon name="arrow" />
          </a>
          <a href="/black-card" className="btn btn-outline">
            Black Card member rates
          </a>
        </div>
      </PageHero>

      <section className="sec">
        <div className="wrap">
          <SectionHead eyebrow="Our spaces" title={<>Choose your <em>room</em></>} lead="The consumable amount goes to your food. Reach it within the first 4 hours and the room is yours at no extra charge; each extra hour is ₱1,500." />
          <div className="grid gap-7">
            {ROOMS.map((r, i) => (
              <article id={r.id} key={r.id} data-reveal={i % 2 ? "right" : "left"} style={d(60)} className={`group lift grid scroll-mt-32 overflow-hidden rounded-3xl border border-line bg-white shadow-[var(--shadow-soft)] lg:grid-cols-2 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                {r.image ? <Photo name={r.image} alt={r.name} sizes="(max-width:1024px) 100vw, 620px" className="zoom-img min-h-[260px] lg:min-h-[400px]" /> : <PhotoPlaceholder className="min-h-[260px] lg:min-h-[400px]" label="Photo coming soon" />}
                <div className="grid content-center gap-3 p-7 md:p-10">
                  <div className="eyebrow">{r.label} · {r.capacity}</div>
                  <h3 className="h3">{r.name}</h3>
                  <p className="text-base leading-[26px] text-muted">{r.use}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className="chip"><Icon name="users" size={16} />{r.capacity}</span>
                    {r.id === "exclusive" ? (
                      <>
                        <span className="chip"><Icon name="tag" size={16} />₱50,000 consumable</span>
                        <span className="chip !border-gold !bg-gold/15"><Icon name="sparkle" size={16} />Promo ₱40,000–45,000</span>
                      </>
                    ) : (
                      <>
                        <span className="chip"><Icon name="tag" size={16} />{peso(r.consumable)} consumable</span>
                        <span className="chip !border-espresso !bg-espresso !text-gold-light"><Icon name="card" size={16} />Black Card {peso(r.member!)}</span>
                        <span className="chip"><Icon name="clock" size={16} />4 hrs · ₱1,500 per extra hour</span>
                      </>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <a href={`?room=${r.id}#book`} className="btn btn-berry">
                      Book this room <Icon name="arrow" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec dots scroll-mt-20" id="book">
        <div className="wrap">
          <SectionHead eyebrow="Booking request" title={<>Request your <em>date</em></>} lead="Pick a room, date and time. We’ll confirm availability by Messenger or phone. Bookings are also welcome through our Facebook page, Messenger or a call." />
          <Suspense fallback={<div className="skeleton h-[640px]" />}>
            <BookingLoader />
          </Suspense>
        </div>
      </section>
    </>
  );
}

async function BookingLoader() {
  const [member, bookings] = await Promise.all([getMember(), list("bookings", { eq: { status: "confirmed" } })]);
  const busy = bookings.map((b) => ({ room: b.room, date: b.date, time: b.time }));
  return <BookingForm member={member ? { name: member.name, mobile: member.mobile, vouchersLeft: member.vouchersLeft } : null} busy={busy} />;
}
