import Link from "next/link";
import { Suspense } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { Photo, PhotoPlaceholder, Stars } from "@/components/ui";
import { Coupon, LiveCoupon } from "@/components/Offer";
import { InquiryForm } from "@/components/forms";
import { ContactCards, MapEmbed } from "@/components/Contact";
import { BC_BENEFITS, CompareTable } from "@/components/BlackCardBits";
import { BlackCard3D, Count, Dust, Parallax, Tilt } from "@/components/motion";
import { d, Marquee, RevealHead, SpinBadge, Words } from "@/components/fx";
import { GalleryLightbox } from "@/components/GalleryLightbox";
import { biz, LINKS, peso, ROOMS } from "@/lib/content";
import { getLiveItems } from "@/lib/menu";
import { RestaurantJsonLd } from "@/components/RestaurantJsonLd";

export default function Home() {
  return (
    <>
      <RestaurantJsonLd />
      <Hero />
      <Ribbons />
      <div className="wrap pt-12 md:pt-20" data-reveal="tilt">
        <Tilt max={4} className="rounded-[28px]">
          <Suspense fallback={<Coupon />}>
            <LiveCoupon />
          </Suspense>
        </Tilt>
      </div>
      <Suspense fallback={<div className="wrap sec"><div className="skeleton h-[640px]" /></div>}>
        <MenuPreview />
      </Suspense>
      <Numbers />
      <BlackCardSection />
      <Venues />
      <Packages />
      <Reviews />
      <section className="sec !pt-0">
        <div className="wrap">
          <div className="head-row">
            <RevealHead align="left" eyebrow="Inside the House" parts={[{ t: "A little piece of" }, { t: "Europe in Iligan", em: true }]} className="!m-0" />
            <a className="btn btn-ink" href={LINKS.facebook} target="_blank" rel="noopener noreferrer" data-reveal="up">
              Follow us on Facebook <Icon name="arrow" />
            </a>
          </div>
          <GalleryLightbox
            items={[
              { img: "interior-dining-hall-01", cap: "Main dining hall", cls: "col-span-2 md:col-span-1 md:row-span-2" },
              { img: "gallery-garden-dining-01", cap: "Garden al fresco" },
              { img: "gallery-cake-display-01", cap: "The cake display", cls: "md:col-start-3 md:row-span-2 md:row-start-1" },
              { img: "gallery-vintage-decor-01", cap: "Vintage details" },
            ]}
          />
        </div>
      </section>
      <About />
      <PhotoStrip />
      <section className="sec dots" id="contact">
        <div className="wrap">
          <RevealHead eyebrow="Visit us" parts={[{ t: "Come" }, { t: "say hello", em: true }]} lead="Order, reserve a table, book a VIP Room or ask about packages — we reply on Messenger and by phone." />
          <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
            <div data-reveal="left">
              <MapEmbed />
            </div>
            <div data-reveal="right">
              <ContactCards />
            </div>
            <div id="inquire" data-reveal="up" className="grid scroll-mt-28 overflow-hidden rounded-3xl border border-line bg-white shadow-[var(--shadow-soft)] lg:col-span-2 lg:grid-cols-[320px_1fr]">
              <div className="glow-dark relative grid content-start gap-4 overflow-hidden p-8">
                <Dust />
                <div className="eyebrow">Quick inquiry</div>
                <h3 className="h4 text-cream">Tell us what you’re planning</h3>
                <p className="text-sm text-cream/75">Orders, reservations, VIP Rooms, exclusive bookings, packages or the Black Card — we’ll get back to you on Messenger or by phone.</p>
                <a href={LINKS.messenger} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-2 justify-self-start !py-3">
                  <Icon name="chat" /> Chat on Messenger
                </a>
              </div>
              <InquiryForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ----------------------------------------------------------------- HERO */
function Hero() {
  return (
    <section className="glow-dark spotlight relative overflow-hidden pt-7 pb-16 md:pt-[88px] md:pb-[120px]">
      <span className="blob top-[-120px] right-[-80px] size-[520px] bg-gold/40" />
      <span className="blob bottom-[-160px] left-[-120px] size-[480px] bg-berry/60" style={{ animationDelay: "-6s" }} />
      <Dust />
      <div className="wrap relative grid items-center gap-7 lg:grid-cols-[minmax(0,600px)_1fr] lg:gap-16">
        <div>
          <div className="eyebrow fade-up flex items-center gap-3 before:h-px before:w-10 before:bg-gold" style={{ animationDelay: "200ms" }}>
            Cheesecake Café &amp; Restaurant · Iligan City
          </div>
          <Words as="h1" auto className="h1 my-4 md:my-[26px]" delay={250} parts={[{ t: "Because Life is so" }, { t: "Cheesy!", em: true }]} />
          <p className="lead fade-up max-w-[540px]" style={{ animationDelay: "700ms" }}>
            Handcrafted Signature Cheesecakes, Artisan Pastas and Signature Rice Entrées — in a European-inspired café made for coffee dates, family bonding and special celebrations.
          </p>
          <div className="fade-up mt-8 flex flex-wrap gap-3.5" style={{ animationDelay: "850ms" }}>
            <Link className="btn btn-gold pulse-ring flex-1 sm:flex-none" href="/menu">
              View Menu <Icon name="arrow" />
            </Link>
            <Link className="btn btn-outline flex-1 sm:flex-none" href="/events">
              Reserve Now <Icon name="arrow" />
            </Link>
          </div>
          <div className="fade-up mt-8 flex border-t border-gold/20 pt-6 md:mt-12" style={{ animationDelay: "1000ms" }}>
            {[
              [<span key="r" className="flex items-baseline gap-2"><Count value={String(biz.rating.google)} /><small className="font-sans text-[13px] tracking-[2px] text-gold">★★★★</small></span>, `${biz.rating.googleCount} Google reviews`],
              [<Count key="v" value="3" />, "Private VIP rooms"],
              [<Count key="a" value="2026" />, "Asian Top Choice"],
            ].map(([b, s], i) => (
              <div key={i} className="mr-4 border-r border-gold/20 pr-4 last:m-0 last:border-0 last:p-0 md:mr-8 md:pr-8">
                <b className="flex items-center gap-2 font-serif text-[21px] leading-8 font-semibold text-gold-light md:text-[26px]">{b}</b>
                <span className="text-xs text-cream/65">{s}</span>
              </div>
            ))}
          </div>
        </div>

        <Parallax className="relative order-first mx-auto h-[440px] w-full max-w-[350px] lg:order-none lg:mr-0 lg:h-[660px] lg:max-w-[580px]">
          <div aria-hidden="true" className="absolute inset-0">
            <div data-depth="0.3" className="absolute top-0 left-[10%] h-[91%] w-[83%] lg:left-[110px] lg:h-[610px] lg:w-[440px]">
              <div className="size-full rounded-t-full border border-gold/50" />
            </div>
            <div data-depth="0.6" className="absolute top-4 left-[6%] h-[89%] w-[83%] lg:top-[26px] lg:left-[90px] lg:h-[590px] lg:w-[420px]">
              <div className="fade-up size-full" style={{ animationDelay: "300ms" }}>
                <Photo name="hero-basque-golden-cheesecake" eager sizes="(max-width: 1024px) 300px, 420px" className="kenburns size-full rounded-t-full rounded-b-[14px] shadow-[var(--shadow-deep)]" />
              </div>
            </div>
            <div data-depth="1.1" className="absolute top-[66%] left-0 lg:top-[440px]">
              <div className="float-y d2">
                <Photo name="interior-dining-hall-01" sizes="250px" className="h-[116px] w-[150px] rounded-[18px] border-4 border-espresso shadow-[var(--shadow-deep)] lg:h-[190px] lg:w-[250px] lg:border-[6px]" />
              </div>
            </div>
            <div data-depth="1.4" className="absolute top-2 right-0 lg:top-6 lg:left-[420px]">
              <SpinBadge
                text="SIGNATURE · BASQUE · ₱515 / SLICE · "
                className="size-[118px] text-gold-light lg:size-[150px]"
                center={
                  <span className="grid size-[86px] place-content-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#F1D9A0,#C29A43)] text-center leading-tight text-espresso shadow-[0_14px_30px_rgba(0,0,0,.45)] ring-1 ring-espresso/20 ring-inset lg:size-[108px]">
                    <small className="text-[10px] font-bold tracking-[.18em] text-espresso/75 uppercase">Signature</small>
                    <b className="font-serif text-xl lg:text-2xl">Basque</b>
                  </span>
                }
              />
            </div>
            <div data-depth="0.9" className="absolute right-0 bottom-0 lg:right-[-6px] lg:bottom-1">
              <div className="float-y d3 grid w-[200px] gap-1.5 rounded-2xl bg-cream px-3.5 py-3 text-ink shadow-[var(--shadow-deep)] lg:w-[250px] lg:px-[18px] lg:py-4">
                <span className="text-[13px]"><Stars /></span>
                <p className="font-serif text-[15px] leading-[19px] font-medium italic lg:text-[17px] lg:leading-[22px]">“one of the best cheesecakes! must visit when in iligan!!”</p>
                <span className="text-xs text-muted">Gyle · Google review</span>
              </div>
            </div>
          </div>
        </Parallax>
      </div>
      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-semibold tracking-[.3em] text-gold-light/70 uppercase lg:flex">
        <span className="scroll-cue" />
        Scroll
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- RIBBONS */
function Ribbons() {
  const a = ["Signature Cheesecakes", "Artisan Pastas", "Signature Rice Entrées", "Coffee & Frappes", "Premier VIP Rooms", "Pork-free kitchen", "Black Card Members"];
  const b = ["Because Life is so Cheesy!", "Asian Top Choice 2026", "Dine-in · Takeout · Grab · Maxim · Foodpanda", "Open Tue–Sun · 11:30am–9:30pm", "Proudly Iligan"];
  return (
    <div className="overflow-hidden">
    <div className="relative -mx-4 -rotate-1 py-3">
      <div className="bg-gold py-4 text-espresso shadow-[0_20px_40px_-20px_rgba(0,0,0,.5)]">
        <Marquee speed={40}>
          {a.map((t) => (
            <span key={t} className="flex items-center gap-7 font-serif text-lg font-semibold whitespace-nowrap italic md:text-[22px]">
              {t} <i className="text-xs not-italic">◆</i>
            </span>
          ))}
        </Marquee>
      </div>
      <div className="mt-2 rotate-2 bg-espresso py-3 text-gold-light">
        <Marquee speed={48} reverse>
          {b.map((t) => (
            <span key={t} className="flex items-center gap-7 text-xs font-semibold tracking-[.3em] whitespace-nowrap uppercase md:text-sm">
              {t} <span className="text-gold">✦</span>
            </span>
          ))}
        </Marquee>
      </div>
    </div>
    </div>
  );
}

/* ----------------------------------------------------------------- MENU */
const FEATURED = [
  { name: "Oreo Cheesecake", img: "menu-oreo-cheesecake", badge: "Classic", eyebrow: "Signature Cheesecake", desc: "Oreo-blended cream cheese on a buttery Oreo crust, crowned with a whole Oreo.", unit: "/slice", foot: "Dine-in · Takeout" },
  { name: "ICH Nutella Cheesecake", img: "menu-nutella-cheesecake", badge: "ICH Special", eyebrow: "Signature Cheesecake", desc: "Nutella-infused cheesecake with pistachios and almonds on an Oreo crust.", unit: "/slice", foot: "Dine-in · Takeout" },
  { name: "Almond Heaven Chocolate Cake", img: "menu-almond-heaven-chocolate-cake", badge: "Limited slices", eyebrow: "Chocolate Cake", desc: "Moist chocolate cake, dark ganache, crunchy almonds and golden flakes.", unit: "/slice", foot: "Dine-in · Takeout" },
  { name: "Creamy Tuscan Chicken", img: "menu-creamy-tuscan-chicken", badge: "A taste of Italy", eyebrow: "Main Course", desc: "Seared chicken in Parmesan cream with sun-dried tomato, garlic and spinach.", unit: "", foot: "With mashed potato" },
];

async function MenuPreview() {
  const items = await getLiveItems();
  const price = (n: string) => items.find((i) => i.name === n)?.price ?? null;
  const lists = [
    { title: "Pasta", sub: "4 artisan pastas · with garlic baguette", img: "menu-creamy-chicken-carbonara", names: ["ICH Creamy Chicken Carbonara", "ICH Signature Four Cheese Lasagna", "ICH Creamy Chicken Pesto", "Filipino Beef Style Spaghetti"] },
    { title: "Meals", sub: "Signature rice entrées & mains", img: "menu-tonno-alla-griglia", names: ["Signature Prime Bulalo Steak", "ICH Golden Baked Salmon", "Tonno Alla Griglia", "ICH Premium Beef Tapa"] },
    { title: "Coffee & Drinks", sub: "Coffee, frappes & fruit teas", img: "menu-truffle-mushroom-soup", names: ["Iced Spanish Latte", "Hot Caramel Macchiato", "Matcha Espresso Frappe", "Blueberry Cheesecake Frappe"] },
  ];
  const basque = price("Basque Golden Creamy Cheesecake");
  return (
    <section className="sec" id="menu">
      <div className="wrap">
        <div className="head-row">
          <RevealHead align="left" eyebrow="Our Menu" parts={[{ t: "Made fresh," }, { t: "served with love", em: true }]} lead="Signature Cheesecakes, Pasta, Meals, and Coffee & Drinks — explore the full menu or message us to order." className="!m-0" />
          <Link className="btn btn-ink" href="/menu" data-reveal="up">
            Full menu · {items.length} items <Icon name="arrow" />
          </Link>
        </div>
        <div className="grid gap-4 md:gap-7 lg:grid-cols-4">
          <Tilt max={5} className="rounded-3xl lg:col-span-2 lg:row-span-2" style={{}}>
            <article data-reveal="clip" className="group relative min-h-[440px] overflow-hidden rounded-3xl text-cream shadow-[var(--shadow-deep)] lg:h-full lg:min-h-[640px]">
              <Photo name="hero-basque-golden-cheesecake" alt="Basque Golden Creamy Cheesecake" sizes="(max-width:1024px) 100vw, 620px" className="zoom-img !absolute inset-0" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,17,15,0)_35%,rgba(20,17,15,.92)_100%)]" />
              <span className="pill absolute top-6 left-6">◆ Signature of the House</span>
              <SpinBadge text="BEST SELLER · HOUSE FAVOURITE · " className="absolute top-5 right-5 size-[104px] text-gold-light" center={<Icon name="star" size={26} className="text-gold" />} />
              <div className="absolute inset-x-6 bottom-6 grid gap-3 lg:inset-x-9 lg:bottom-9">
                <div className="eyebrow !text-gold-light">Signature Cheesecake</div>
                <h3 className="font-serif text-[34px] leading-[38px] font-medium lg:text-[44px] lg:leading-[48px]">Basque Golden Creamy Cheesecake</h3>
                <p className="max-w-[440px] opacity-85">Premium cream cheese baked to a deep golden finish, creating a beautifully caramelized exterior that melts in your mouth.</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
                  <span className="font-serif text-[34px] font-semibold text-gold-light">
                    {basque ? peso(basque) : "—"} <small className="font-sans text-sm text-cream/70">/ slice</small>
                  </span>
                  <Link className="btn btn-gold" href="/contact#inquire">
                    Order this slice <Icon name="arrow" />
                  </Link>
                </div>
              </div>
            </article>
          </Tilt>
          <div className="rail -mx-[var(--pad)] grid auto-cols-[76%] grid-flow-col gap-4 px-[var(--pad)] pb-4 sm:auto-cols-[45%] lg:col-span-2 lg:mx-0 lg:grid-flow-row lg:grid-cols-2 lg:gap-7 lg:overflow-visible lg:p-0">
            {FEATURED.map((f, n) => {
              const p = price(f.name);
              return (
                <div key={f.name} data-reveal="up" style={d(n * 110)}>
                  <Tilt max={8} className="h-full rounded-[20px]">
                    <article className="group lift flex h-full flex-col overflow-hidden rounded-[20px] border border-line/60 bg-white shadow-[var(--shadow-soft)]">
                      <div className="relative">
                        <Photo name={f.img} alt={f.name} sizes="300px" className="zoom-img aspect-[4/3.1]" />
                        <span className="pill light absolute top-3.5 left-3.5">{f.badge}</span>
                        {p ? (
                          <span className="absolute right-3.5 -bottom-[18px] rounded-xl bg-berry px-3.5 py-2 text-base font-bold text-cream shadow-[0_10px_20px_-8px_rgba(142,27,46,.7)] transition duration-500 group-hover:-translate-y-1 group-hover:rotate-[-3deg]">
                            {peso(p)} <small className="text-[11px] font-medium opacity-80">{f.unit}</small>
                          </span>
                        ) : null}
                      </div>
                      <div className="grid flex-1 gap-1.5 px-[22px] pt-[26px] pb-[22px]">
                        <div className="eyebrow !text-[10.5px]">{f.eyebrow}</div>
                        <h3 className="h4">{f.name}</h3>
                        <p className="text-sm leading-[21px] text-muted">{f.desc}</p>
                        <Link href="/contact#inquire" className="mt-2.5 flex items-center justify-between border-t border-dashed border-line pt-3 text-[13px] font-semibold text-berry">
                          <span className="font-medium text-muted">{f.foot}</span>
                          <span className="inline-flex items-center gap-1 transition group-hover:gap-2">Order <Icon name="arrow" size={16} /></span>
                        </Link>
                      </div>
                    </article>
                  </Tilt>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-7">
          {lists.map((l, n) => (
            <div key={l.title} data-reveal="up" style={d(n * 120)} className="group lift overflow-hidden rounded-[20px] border border-line bg-white shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-3.5 bg-espresso px-[22px] py-[18px] text-cream">
                <Photo name={l.img} sizes="56px" className="size-14 flex-none rounded-full border-2 border-gold transition duration-700 group-hover:rotate-[360deg]" />
                <div>
                  <b className="block font-serif text-2xl leading-7 font-semibold">{l.title}</b>
                  <span className="text-xs tracking-wider text-gold-light">{l.sub}</span>
                </div>
              </div>
              <div className="px-[22px] pt-2.5 pb-[18px]">
                {l.names.map((n2) => (
                  <div key={n2} className="mi transition hover:translate-x-1">
                    <span className="n">{n2}</span>
                    <span className="dots-line" />
                    <b>{price(n2) ? peso(price(n2)!) : <span className="tbd">TBD</span>}</b>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div data-reveal="up" className="mt-10 flex flex-col items-start justify-between gap-6 rounded-[20px] bg-cheesecake px-7 py-6 md:flex-row md:items-center">
          <p className="text-[15px]">
            <b>Hungry already?</b> Order for pick-up, dine in, or get it delivered.
            <small className="block text-xs text-muted">Prices subject to change; in-store prices may differ from delivery apps. Available on Grab, Maxim &amp; Foodpanda.</small>
          </p>
          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
            <a className="btn btn-berry" href={LINKS.messenger} target="_blank" rel="noopener noreferrer">
              Order on Messenger
            </a>
            <Link className="btn btn-white" href="/menu">
              View Full Menu
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- NUMBERS */
function Numbers() {
  const n: [string, string, string, IconName][] = [
    ["72", "", "Menu favourites", "book"],
    ["3", "", "Private VIP rooms", "home"],
    [String(biz.rating.google), "★", "Google rating", "star"],
    ["60", "", "Guests for exclusive events", "users"],
  ];
  return (
    <section className="glow-dark spotlight relative overflow-hidden py-16 md:py-20">
      <Dust />
      <div className="wrap grid grid-cols-2 gap-8 md:grid-cols-4">
        {n.map(([v, suf, label, icon], i) => (
          <div key={label} data-reveal="up" style={d(i * 120)} className="group grid justify-items-center gap-2 text-center">
            <span className="grid size-14 place-items-center rounded-full border border-gold/40 text-gold transition duration-500 group-hover:rotate-12 group-hover:bg-gold group-hover:text-espresso">
              <Icon name={icon} size={24} />
            </span>
            <b className="gold-text font-serif text-5xl font-semibold md:text-6xl">
              <Count value={v} suffix={suf} />
            </b>
            <span className="text-sm text-cream/70">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- BLACK CARD */
function BlackCardSection() {
  return (
    <section className="sec glow-dark spotlight relative overflow-hidden" id="black-card">
      <span className="blob top-1/3 left-[-160px] size-[420px] bg-gold/30" />
      <div className="wrap relative grid items-start gap-9 lg:grid-cols-[1fr_560px] lg:gap-[72px]">
        <div>
          <RevealHead align="left" eyebrow="Membership" parts={[{ t: "The ICH" }, { t: "Black Card", em: true }]} lead="For ₱2,200 a year, enjoy member discounts, free coffee or Fruitea every visit, ₱2,000 off every VIP Room — and ₱1,200 of your fee comes back as food & drink vouchers." className="!mb-6" />
          <div data-reveal="scale" className="relative py-6">
            <div className="absolute inset-x-10 top-10 h-48 rounded-full bg-gold/25 blur-[70px]" />
            <div className="float-y">
              <BlackCard3D />
            </div>
          </div>
          <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
            {BC_BENEFITS.map((b, i) => (
              <div key={b.t} data-reveal="up" style={d(i * 100)} className="group grid grid-cols-[44px_1fr] items-start gap-3.5 rounded-2xl border border-gold/20 bg-white/[.04] p-[18px] transition duration-500 hover:-translate-y-1 hover:border-gold/60 hover:bg-white/[.07]">
                <span className="grid size-11 place-items-center rounded-xl bg-gold/15 text-gold-light transition duration-500 group-hover:scale-110 group-hover:bg-gold group-hover:text-espresso">
                  <Icon name={b.icon} />
                </span>
                <p>
                  <b className="block text-base leading-[22px] font-semibold">{b.t}</b>
                  <span className="text-[13px] leading-[19px] text-cream/65">{b.d}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
        <div data-reveal="right">
          <CompareTable />
          <div className="my-6 grid gap-3 sm:grid-cols-3">
            {[
              ["STEP 01", "Fill out the form", "Online or in store, anytime"],
              ["STEP 02", "Pay ₱2,200", "Cash, card or bank transfer"],
              ["STEP 03", "Enjoy perks", "Your digital card is ready on your phone"],
            ].map(([s, b, t], i) => (
              <div key={s} data-reveal="up" style={d(200 + i * 120)} className="relative border-t-2 border-gold/30 pt-3.5">
                <span className="absolute -top-0.5 left-0 h-0.5 w-0 bg-gold transition-all duration-1000 [.in>&]:w-full" />
                <small className="text-[11px] font-semibold tracking-[.2em] text-gold">{s}</small>
                <b className="my-1 block font-serif text-lg leading-[22px] font-semibold">{b}</b>
                <span className="text-[13px] leading-[19px] text-cream/65">{t}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link className="btn btn-gold pulse-ring" href="/black-card#apply">
              Get Your Black Card <Icon name="arrow" />
            </Link>
            <Link href="/account" className="u-link text-sm text-cream/70">
              Already a member? Sign in
            </Link>
          </div>
          <p className="mt-5 border-t border-gold/20 pt-4 text-xs leading-[18px] text-cream/50">Valid for 1 year from the date of registration. One ₱400 voucher per dine-in visit. Full perks, benefits and terms will be published here word for word.</p>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- VENUES */
function Venues() {
  const rooms = ROOMS.slice(0, 3);
  return (
    <section className="sec dots" id="events">
      <div className="wrap">
        <div className="head-row">
          <RevealHead align="left" eyebrow="Private dining & events" parts={[{ t: "Celebrate" }, { t: "in private", em: true }]} lead="From intimate birthdays to executive meetings and small seminars — reserve a private space with personalized service." className="!m-0" />
          <Link className="btn btn-berry" href="/events#book" data-reveal="up">
            Check availability <Icon name="arrow" />
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr] lg:gap-8">
          <article data-reveal="left" className="flex flex-col overflow-hidden rounded-3xl bg-espresso text-cream shadow-[var(--shadow-deep)]">
            <div className="group relative h-[220px] overflow-hidden md:h-[360px]">
              <Photo name="vip-room-family-01" alt="VIP Family Room with round table and arched mirror" sizes="(max-width:1024px) 100vw, 700px" className="zoom-img !absolute inset-0" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(20,17,15,.85))]" />
              <span className="pill absolute top-5 left-5">◆ Premier VIP Rooms</span>
              <div className="absolute bottom-[22px] left-7">
                <div className="eyebrow !text-gold-light">3 private rooms · 8–30 guests · room fee waived</div>
                <h3 className="h3">Your own room at ICH</h3>
              </div>
            </div>
            <div className="grid flex-1 gap-[18px] p-5 md:p-7">
              <div className="rail -mx-5 grid auto-cols-[62%] grid-flow-col gap-3 px-5 md:mx-0 md:grid-flow-row md:grid-cols-3 md:px-0">
                {rooms.map((r) => (
                  <Link href={`/events#${r.id}`} key={r.id} className="group overflow-hidden rounded-2xl border border-gold/30 bg-white/[.03] transition duration-500 hover:-translate-y-1 hover:border-gold">
                    {r.image ? <Photo name={r.image} sizes="220px" className="zoom-img h-24" /> : <PhotoPlaceholder dark label="Photo soon" className="h-24" />}
                    <div className="px-3.5 py-3">
                      <b className="block font-serif text-lg leading-[22px] font-semibold">{r.short}</b>
                      <span className="inline-flex items-center gap-1.5 text-xs text-gold-light">
                        <Icon name="users" size={15} />
                        {r.capacity.replace("Good for ", "")} · {peso(r.consumable)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="note">◆ Consumable on food, first 4 hours · ₱1,500 per extra hour · Black Card: ₱2,000 less</span>
                <Link className="btn btn-gold" href="/events">
                  Inquire <Icon name="arrow" />
                </Link>
              </div>
            </div>
          </article>
          <div className="grid gap-5 lg:grid-rows-[1fr_auto] lg:gap-8">
            <Tilt max={5} className="rounded-3xl">
              <article data-reveal="right" className="group relative h-full min-h-[380px] overflow-hidden rounded-3xl text-cream shadow-[var(--shadow-deep)] lg:min-h-[430px]">
                <Photo name="interior-dining-hall-01" alt="Main dining hall" sizes="(max-width:1024px) 100vw, 520px" className="zoom-img !absolute inset-0" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,17,15,.1)_20%,rgba(20,17,15,.92))]" />
                <span className="pill absolute top-5 left-5">◆ Exclusive booking</span>
                <div className="absolute inset-x-7 bottom-7 grid gap-2.5">
                  <div className="eyebrow !text-gold-light">50–60 guests</div>
                  <h3 className="h3">Main Dining + Seminar Room</h3>
                  <p className="text-[15px] opacity-85">Book the whole house for bigger parties and corporate events. ₱50,000 consumable — now on promo at ₱40,000–45,000.</p>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <span className="note">◆ Promo rate</span>
                    <Link className="btn btn-gold" href="/events#exclusive">
                      Inquire <Icon name="arrow" />
                    </Link>
                  </div>
                </div>
              </article>
            </Tilt>
            <div data-reveal="up" className="grid gap-3.5 rounded-3xl border border-line bg-white px-6 py-6">
              <div className="eyebrow">Every private booking</div>
              <ul className="grid gap-2.5">
                {["Personalized service from our team", "Full menu, cheesecakes & coffee", "Packages for birthdays & celebrations"].map((t, i) => (
                  <li key={t} data-reveal="left" style={d(150 + i * 100)} className="flex items-center gap-2.5 text-[15px]">
                    <span className="grid size-6 place-items-center rounded-full bg-gold/20 text-gold-deep">
                      <Icon name="check" size={14} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- PACKAGES */
function Packages() {
  const pk = [
    { img: "celebrations-table-setting-01", icon: "gift" as const, t: "Birthdays", d: "Make your celebrant’s day with cheesecake, a private room and a beautifully set table." },
    { img: "gallery-garden-dining-01", icon: "users" as const, t: "Family Gatherings", d: "Long tables, garden seating and plates made for sharing — for reunions big and small." },
    { img: "celebrations-place-card-01", icon: "star" as const, t: "Celebrations", d: "Anniversaries, milestones and corporate thank-yous, with personalized service." },
  ];
  return (
    <section className="sec bg-cheesecake">
      <div className="wrap">
        <RevealHead eyebrow="Celebrations & packages" parts={[{ t: "Every occasion," }, { t: "a little sweeter", em: true }]} lead="Ask about special packages for birthdays, family gatherings and celebrations — cakes, private rooms and a table set just for you." />
        <div className="grid gap-4 md:grid-cols-3 md:gap-7">
          {pk.map((p, i) => (
            <div key={p.t} data-reveal="tilt" style={d(i * 140)}>
              <Tilt max={9} className="rounded-3xl">
                <article className="group relative min-h-[380px] overflow-hidden rounded-3xl text-cream shadow-[var(--shadow-deep)] md:min-h-[480px]">
                  <Photo name={p.img} alt="" sizes="(max-width:768px) 100vw, 400px" className="zoom-img !absolute inset-0" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,17,15,0)_30%,rgba(20,17,15,.94))] transition duration-700 group-hover:bg-[linear-gradient(180deg,rgba(142,27,46,.15)_10%,rgba(20,17,15,.96))]" />
                  <span className="absolute top-5 left-5 grid size-[52px] place-items-center rounded-full bg-cream text-berry shadow-lg transition duration-500 group-hover:rotate-[-12deg] group-hover:scale-110">
                    <Icon name={p.icon} size={24} />
                  </span>
                  <div className="absolute inset-x-7 bottom-7 grid gap-2.5 transition duration-500 group-hover:-translate-y-2">
                    <h3 className="h3">{p.t}</h3>
                    <p className="text-[15px] leading-[23px] opacity-85">{p.d}</p>
                    <Link className="link !text-gold-light" href="/contact#inquire">
                      Ask about packages <Icon name="arrow" size={18} />
                    </Link>
                  </div>
                </article>
              </Tilt>
            </div>
          ))}
        </div>
        <div data-reveal="up" className="group mt-10 grid overflow-hidden rounded-3xl bg-espresso text-cream shadow-[var(--shadow-deep)] md:grid-cols-[420px_1fr]">
          <Photo name="gallery-cake-display-01" alt="Display case of whole cheesecakes" sizes="420px" className="zoom-img min-h-[220px] md:min-h-[300px]" />
          <div className="relative grid content-center gap-3.5 overflow-hidden px-6 py-7 md:px-12 md:py-10">
            <Dust />
            <div className="eyebrow">For the table at home</div>
            <h3 className="h3">
              Whole cheesecakes &amp; <em className="!text-gold-light">assorted boxes</em>
            </h3>
            <p className="opacity-80">Take home a whole cake or mix your favorites in one box — perfect for pasalubong and parties.</p>
            <div className="flex flex-wrap gap-3">
              {[
                ["Assorted box", <><s className="opacity-60">₱3,800</s> Promo ₱3,550</>],
                ["Whole cheesecake", "Ask for today’s price"],
                ["4-in-1 / 8-in-1", "Ask for today’s price"],
              ].map(([a, b], i) => (
                <span key={i} className="rounded-[14px] border border-gold/45 px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-gold hover:bg-gold/10">
                  {a}
                  <small className="block text-xs font-medium text-gold-light">{b}</small>
                </span>
              ))}
            </div>
            <div>
              <Link className="btn btn-gold" href="/contact#inquire">
                Inquire Now <Icon name="arrow" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- REVIEWS */
function Reviews() {
  const ago: Record<string, string> = { Riamaika: "6 months ago", Nathan: "5 months ago", Sittie: "a year ago", Jeff: "3 months ago", Gyle: "recently", Vien: "2 years ago" };
  const feat = biz.reviews.find((r) => r.name === "Riamaika")!;
  return (
    <section className="sec overflow-hidden" id="reviews">
      <div className="wrap">
        <RevealHead eyebrow="Loved in Iligan" parts={[{ t: "What our" }, { t: "guests say", em: true }]} />
        <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
          <figure data-reveal="left" className="spotlight relative grid content-between gap-6 overflow-hidden rounded-3xl bg-espresso px-6 py-8 text-cream md:p-12">
            <span className="pointer-events-none absolute -top-10 right-7 font-serif text-[280px] leading-none text-gold/20">“</span>
            <Stars />
            <blockquote className="relative font-serif text-[22px] leading-8 font-medium italic md:text-[26px] md:leading-[38px]">“{feat.text}”</blockquote>
            <figcaption className="flex items-center gap-3.5">
              <span className="grid size-12 flex-none place-items-center rounded-full bg-gold font-serif text-xl font-semibold text-espresso">{feat.name[0]}</span>
              <span>
                <b className="block text-[15px]">{feat.name}</b>
                <span className="text-xs opacity-70">Google review · {ago[feat.name]}</span>
              </span>
            </figcaption>
          </figure>
          <div className="grid content-start gap-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                [String(biz.rating.google), `Google · ${biz.rating.googleCount} reviews`],
                [biz.rating.foodpanda.toFixed(1), `Foodpanda · ${biz.rating.foodpandaCount} reviews`],
              ].map(([b, s], i) => (
                <div key={s} data-reveal="up" style={d(i * 120)} className="lift grid gap-0.5 rounded-[18px] border border-line bg-white px-5 py-[18px]">
                  <b className="font-serif text-[40px] leading-[44px] font-semibold">
                    <Count value={b} />
                  </b>
                  <span className="text-sm"><Stars /></span>
                  <span className="text-xs text-muted">{s}</span>
                </div>
              ))}
            </div>
            <div data-reveal="up" className="relative overflow-hidden rounded-[18px] border border-line bg-white px-6 py-5">
              <Icon name="award" size={28} className="text-gold-deep" />
              <p className="mt-2 font-serif text-2xl font-semibold">Asian Top Choice 2026</p>
              <p className="text-sm text-muted">Recognised among the region’s favourite places — thank you, Iligan!</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 grid gap-4">
        <Marquee speed={60} gap={20}>
          {biz.reviews.map((r) => (
            <figure key={r.name} className="grid w-[340px] shrink-0 content-between gap-3 rounded-[18px] border border-line bg-white px-6 py-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:border-gold md:w-[400px]">
              <Stars />
              <blockquote className="line-clamp-4 text-[15px] leading-[24px]">“{r.text.trim()}”</blockquote>
              <figcaption className="flex items-center gap-3">
                <span className="grid size-9 flex-none place-items-center rounded-full bg-cheesecake font-serif font-semibold text-berry">{r.name[0]}</span>
                <span className="text-sm">
                  <b>{r.name}</b> <span className="text-xs text-muted">· Google · {ago[r.name] ?? ""}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </Marquee>
      </div>
      <div className="mt-8 flex justify-center">
        <a className="link" href={biz.address.googleMaps} target="_blank" rel="noopener noreferrer">
          Read all reviews on Google <Icon name="arrow" size={18} />
        </a>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- ABOUT */
function About() {
  return (
    <section className="sec glow-dark spotlight relative overflow-hidden" id="about">
      <Dust />
      <div className="wrap relative grid items-center gap-9 lg:grid-cols-[500px_1fr] lg:gap-24">
        <Parallax className="relative h-[420px] md:h-[600px]">
          <div data-depth="0.4" className="absolute top-0 left-0">
            <div data-reveal="clip">
              <Photo name="interior-counter-01" alt="Counter with the Iligan Cheesecake House sign" sizes="400px" className="h-[400px] w-[290px] rounded-t-full rounded-b-2xl shadow-[var(--shadow-deep)] md:h-[560px] md:w-[400px]" />
            </div>
          </div>
          <div data-depth="1" className="absolute right-0 bottom-0">
            <div className="float-y d2" data-reveal="scale" style={d(300)}>
              <Photo name="storefront-sign-01" alt="Storefront sign" sizes="230px" className="h-[130px] w-[170px] rounded-[18px] border-[6px] border-espresso shadow-[var(--shadow-deep)] md:h-[180px] md:w-[230px]" />
            </div>
          </div>
          <div data-depth="1.6" className="absolute top-8 right-4 hidden md:block">
            <SpinBadge text="PROUDLY ILIGAN · SINCE DAY ONE · " className="size-[120px] text-gold-light" center={<span className="font-serif text-2xl text-gold">ICH</span>} />
          </div>
        </Parallax>
        <div>
          <div className="orn justify-start [&::before]:hidden" data-reveal="scale">
            <i />
          </div>
          <div className="eyebrow mt-3.5" data-reveal="up">
            Our story
          </div>
          <Words className="h2 mt-4 mb-6" parts={[{ t: "Proudly Iligan," }, { t: "made to be shared", em: true }]} />
          <p className="lead" data-reveal="up">
            Iligan Cheesecake House is a cheesecake café and restaurant in San Miguel Village, Pala-o. We bake handcrafted Signature Cheesecakes and serve Artisan Pastas and Signature Rice Entrées in a European-inspired space — brick walls, paintings and garden seating.
          </p>
          <p className="lead mt-3.5" data-reveal="up" style={d(120)}>
            Whether it’s a simple coffee date, family bonding, or a special celebration, we’re here to make every visit memorable.
          </p>
          <div data-reveal="up" style={d(200)} className="mt-9 grid grid-cols-3 overflow-hidden rounded-[18px] border border-gold/30">
            {[
              ["10", "", "Cakes & cheesecakes"],
              ["3", "", "Private VIP rooms"],
              [String(biz.rating.google), "★", "Google rating"],
            ].map(([b, suf, s]) => (
              <div key={s} className="border-l border-gold/30 px-3 py-4 transition first:border-0 hover:bg-white/[.04] md:px-[22px] md:py-5">
                <b className="block font-serif text-[26px] leading-[38px] font-semibold text-gold-light md:text-[34px]">
                  <Count value={b} suffix={suf} />
                </b>
                <span className="text-[13px] text-cream/70">{s}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3.5">
            {(
              [
                ["check", "Unlimited Golden Honey Buns with selected meals"],
                ["truck", "Dine-in · Takeout · Grab, Maxim & Foodpanda"],
                ["leaf", "Pork-free kitchen"],
                ["award", "Asian Top Choice 2026"],
              ] as [IconName, string][]
            ).map(([i, t], n) => (
              <span key={t} data-reveal="up" style={d(300 + n * 80)} className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-3.5 py-2 text-sm font-medium transition hover:border-gold hover:bg-gold/10">
                <Icon name={i} size={16} className="text-gold" />
                {t}
              </span>
            ))}
          </div>
          <p className="gold-text mt-7 font-serif text-[30px] leading-[38px] font-medium italic" data-reveal="up">
            “Because Life is so Cheesy!”
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- PHOTO STRIP */
function PhotoStrip() {
  const imgs = ["menu-oreo-cheesecake", "gallery-garden-dining-01", "menu-creamy-tuscan-chicken", "celebrations-table-setting-01", "menu-nutella-cheesecake", "vip-room-corporate-01", "menu-tonno-alla-griglia", "gallery-vintage-decor-01", "menu-almond-heaven-chocolate-cake"];
  return (
    <section className="overflow-hidden bg-espresso py-10" aria-label="Photo strip">
      <Marquee speed={55} gap={16}>
        {imgs.map((im, i) => (
          <a key={im} href={LINKS.facebook} target="_blank" rel="noopener noreferrer" className={`group relative block h-56 shrink-0 overflow-hidden rounded-2xl md:h-72 ${i % 2 ? "w-44 md:w-56" : "w-64 md:w-80"}`} aria-label="See more on Facebook">
            <Photo name={im} sizes="320px" className="zoom-img size-full" />
            <span className="absolute inset-0 grid place-items-center bg-espresso/50 opacity-0 transition duration-500 group-hover:opacity-100">
              <Icon name="fb" size={28} className="text-gold-light" />
            </span>
          </a>
        ))}
      </Marquee>
    </section>
  );
}
