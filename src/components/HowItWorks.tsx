"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon, type IconName } from "./Icon";

/* A plain-language, step-by-step guide to the café. Short sentences and big
   numbers so first-time guests (and kids) can follow it at a glance. Every fact
   here is already confirmed elsewhere on the site. */

type Step = { icon: IconName; t: string; d: string; link?: [string, string] };
type Flow = { id: string; icon: IconName; tab: string; title: string; steps: Step[]; cta: [string, string] };

const FLOWS: Flow[] = [
  {
    id: "eat",
    icon: "cake",
    tab: "Eat with us",
    title: "Coming to eat? Here’s how.",
    steps: [
      { icon: "clock", t: "Come visit", d: "We’re open Tuesday to Sunday, 11:30 AM to 9:30 PM. We’re closed on Mondays.", link: ["Find us on the map", "/contact"] },
      { icon: "book", t: "Pick your food", d: "Choose from cheesecakes, pasta, rice meals, coffee and other drinks.", link: ["See the menu", "/menu"] },
      { icon: "truck", t: "Eat here or take it home", d: "Dine in with us, take it out, or get it delivered by Grab, Maxim or Foodpanda." },
      { icon: "sparkle", t: "Enjoy every bite!", d: "Have a Black Card? Show your QR code for a discount and a free drink." },
    ],
    cta: ["See the menu", "/menu"],
  },
  {
    id: "room",
    icon: "home",
    tab: "Book a private room",
    title: "Having a party or meeting? Book a room.",
    steps: [
      { icon: "users", t: "Pick a room", d: "Family Room (up to 10 people), Corporate Room (up to 16), Seminar Room (up to 30), or the whole place for 50 to 60.", link: ["Look at the rooms", "/events"] },
      { icon: "cal", t: "Send a booking request", d: "Choose the room, the date and the time on our website. It only takes a minute.", link: ["Request a date", "/events#book"] },
      { icon: "chat", t: "Wait for our message", d: "We check that the room is free, then confirm with you by Messenger or phone." },
      { icon: "gift", t: "Celebrate!", d: "There’s no room fee. Your group just spends the room’s amount on food and drinks within 4 hours." },
    ],
    cta: ["Request a date", "/events#book"],
  },
  {
    id: "card",
    icon: "card",
    tab: "Get the Black Card",
    title: "Come often? Get the Black Card.",
    steps: [
      { icon: "edit", t: "Sign up", d: "Fill out the short form on our website, or ask us at the store.", link: ["Open the form", "/black-card#apply"] },
      { icon: "receipt", t: "Pay ₱2,200 for one year", d: "Pay by cash, card or bank transfer. You get ₱1,200 back as 3 food vouchers of ₱400 each." },
      { icon: "qr", t: "Open your card on your phone", d: "Sign in with your mobile number and 4-digit PIN to see your Black Card and its QR code.", link: ["Member sign in", "/account/login"] },
      { icon: "star", t: "Show your QR at the counter", d: "Get member discounts, a free Americano or Fruitea every visit, and use your vouchers." },
    ],
    cta: ["Get your Black Card", "/black-card#apply"],
  },
];

export function HowItWorks({ initial = "eat", title = true }: { initial?: string; title?: boolean }) {
  const [on, setOn] = useState(FLOWS.some((f) => f.id === initial) ? initial : "eat");
  const flow = FLOWS.find((f) => f.id === on)!;
  return (
    <div>
      {title ? (
        <div className="head">
          <div className="orn"><i /></div>
          <div className="eyebrow">How it works</div>
          <h2 className="h2">Easy as <em>1, 2, 3, 4</em></h2>
          <p className="lead">What would you like to do today? Tap one to see the steps.</p>
        </div>
      ) : null}

      <div role="tablist" aria-label="What would you like to do?" className="mx-auto mb-8 grid max-w-[860px] gap-3 sm:grid-cols-3">
        {FLOWS.map((f) => {
          const sel = f.id === on;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              id={`hiw-tab-${f.id}`}
              aria-selected={sel}
              aria-controls={`hiw-panel-${f.id}`}
              onClick={() => setOn(f.id)}
              className={`flex items-center justify-center gap-3 rounded-2xl border-2 px-5 py-4 text-base font-semibold transition duration-300 ${sel ? "border-espresso bg-espresso text-gold-light shadow-[var(--shadow-soft)]" : "border-line bg-[#fffaf0] text-ink hover:border-gold"}`}
            >
              <span className={`grid size-10 flex-none place-items-center rounded-full ${sel ? "bg-gold text-espresso" : "bg-cheesecake text-berry"}`}>
                <Icon name={f.icon} size={20} />
              </span>
              {f.tab}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`hiw-panel-${flow.id}`} aria-labelledby={`hiw-tab-${flow.id}`} key={flow.id} className="fade-up">
        <h3 className="h4 mb-6 text-center">{flow.title}</h3>
        <ol className="relative grid gap-4 md:grid-cols-4 md:gap-5">
          <span aria-hidden="true" className="absolute top-[34px] right-[12%] left-[12%] hidden border-t-2 border-dashed border-gold/50 md:block" />
          {flow.steps.map((s, i) => (
            <li key={s.t} className="relative grid grid-cols-[64px_1fr] items-start gap-4 rounded-[20px] border border-line bg-[#fffaf0] p-5 shadow-[var(--shadow-soft)] md:grid-cols-1 md:justify-items-center md:text-center">
              <span className="relative grid size-16 place-items-center rounded-full bg-espresso text-gold-light ring-4 ring-cream">
                <Icon name={s.icon} size={26} />
                <b className="absolute -top-1 -right-1 grid size-7 place-items-center rounded-full bg-gold font-sans text-sm text-espresso">{i + 1}</b>
              </span>
              <div>
                <b className="block font-serif text-[22px] leading-7 font-semibold">{s.t}</b>
                <p className="mt-1 text-[15px] leading-6 text-muted">{s.d}</p>
                {s.link ? (
                  <Link href={s.link[1]} className="link mt-2 !text-[14px]">
                    {s.link[0]} <Icon name="arrow" size={16} />
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex justify-center">
          <Link href={flow.cta[1]} className="btn btn-berry">
            {flow.cta[0]} <Icon name="arrow" />
          </Link>
        </div>
      </div>
    </div>
  );
}
