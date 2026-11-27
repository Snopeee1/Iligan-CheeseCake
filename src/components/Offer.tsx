import { getSettings, DEFAULT_SETTINGS } from "@/lib/db";
import { Icon } from "./Icon";

const CATS = [
  { icon: "cake" as const, label: "Signature Cheesecakes" },
  { icon: "pasta" as const, label: "Pasta" },
  { icon: "meal" as const, label: "Meals" },
  { icon: "coffee" as const, label: "Coffee & Drinks" },
];

export function Coupon({ headline = DEFAULT_SETTINGS.offerHeadline, body = DEFAULT_SETTINGS.offerBody }: { headline?: string; body?: string }) {
  return (
    <div className="relative grid overflow-hidden rounded-3xl bg-berry text-cream shadow-[var(--shadow-deep)] md:rounded-[28px] lg:grid-cols-[260px_1fr_420px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_100%_0%,rgba(230,201,135,.18),transparent_60%)]" />
      <div className="relative grid place-content-center border-b-2 border-dashed border-cream/35 bg-black/10 px-6 py-8 text-center lg:border-r-2 lg:border-b-0 lg:py-10">
        <b className="font-serif text-[72px] leading-[66px] font-medium tracking-tight text-gold-light lg:text-[88px] lg:leading-[80px]">
          5–10<sup className="text-[40px] align-[28px]">%</sup>
        </b>
        <span className="mt-2 text-[13px] font-semibold tracking-[.3em] uppercase">Off · Selected</span>
      </div>
      <div className="relative grid content-center gap-2.5 px-6 pt-7 pb-2 lg:px-11 lg:py-10">
        <div className="eyebrow !text-gold-light">Exclusive Customer Offer</div>
        <h3 className="font-serif text-[28px] leading-[34px] font-semibold lg:text-[36px] lg:leading-[42px]">{headline}</h3>
        <p className="text-[15px] opacity-85">{body}</p>
      </div>
      <div className="relative grid grid-cols-2 content-center gap-2.5 px-6 pt-4 pb-7 lg:py-8 lg:pr-9 lg:pl-0">
        {CATS.map((c) => (
          <div key={c.label} className="flex items-center gap-3 rounded-[14px] border border-gold-light/35 bg-white/[.07] px-3.5 py-3 text-[13px] leading-[18px] font-semibold lg:text-sm">
            <Icon name={c.icon} size={22} className="text-gold-light" />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export async function LiveCoupon() {
  const s = await getSettings();
  if (!s.offerActive) return null;
  return <Coupon headline={s.offerHeadline} body={s.offerBody} />;
}
