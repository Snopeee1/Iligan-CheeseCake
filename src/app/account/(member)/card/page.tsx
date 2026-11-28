import type { Metadata } from "next";
import { Suspense } from "react";
import { BlackCard3D, Dust } from "@/components/motion";
import { LiveQr } from "@/components/LiveQr";
import { requireMember } from "@/lib/auth";
import { fmtDate } from "@/lib/format";
import { FairyLights } from "@/components/decor";

export const metadata: Metadata = { title: "My card", robots: { index: false } };

export default function CardPage() {
  return (
    <Suspense fallback={<div className="wrap py-10"><div className="skeleton mx-auto h-[560px] max-w-md" /></div>}>
      <Inner />
    </Suspense>
  );
}

async function Inner() {
  const m = await requireMember();
  return (
    <div className="glow-dark relative min-h-[calc(100dvh-72px)] overflow-hidden py-8">
      <FairyLights drape className="absolute inset-x-0 top-0 opacity-90" swags={4} />
      <Dust />
      <div className="relative mx-auto grid max-w-md gap-6 px-5">
        <BlackCard3D name={m.name.toUpperCase()} sub={m.cardNo} />
        <div className="grid justify-items-center gap-3 rounded-3xl bg-cream p-6 text-ink">
          <div className="eyebrow">Show this to our staff</div>
          <LiveQr size={230} />
          <b className="text-xl tracking-[3px]">{m.cardNo}</b>
          <div className="grid w-full grid-cols-3 divide-x divide-line rounded-2xl border border-line text-center text-sm">
            <div className="p-3">
              <b className="block font-serif text-2xl">{m.vouchersLeft}</b>
              <span className="text-xs text-muted">vouchers left</span>
            </div>
            <div className="p-3">
              <b className="block font-serif text-2xl">10%</b>
              <span className="text-xs text-muted">you + 4</span>
            </div>
            <div className="p-3">
              <b className="block font-serif text-2xl">25%</b>
              <span className="text-xs text-muted">Chef VIP</span>
            </div>
          </div>
          <p className="text-center text-xs text-muted">Valid until {fmtDate(m.expiresAt)}. The code changes every 25 seconds, so screenshots won’t work — open this page at the counter.</p>
        </div>
      </div>
    </div>
  );
}
