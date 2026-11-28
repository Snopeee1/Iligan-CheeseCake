import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Icon } from "@/components/Icon";
import { BookingForm } from "@/components/forms";
import { requireMember } from "@/lib/auth";
import { list } from "@/lib/db";

export const metadata: Metadata = { title: "Book a room", robots: { index: false } };

export default function BookPage() {
  return (
    <div className="wrap grid gap-6 py-8 md:py-10">
      <div>
        <Link href="/account" className="inline-flex items-center gap-1 text-sm font-semibold text-berry">
          <Icon name="back" size={16} /> Dashboard
        </Link>
        <h1 className="mt-2 font-serif text-[38px] leading-[42px] font-medium md:text-5xl md:leading-[52px]">
          Book a room <em className="text-berry">at member rate</em>
        </h1>
        <p className="mt-1 text-muted">Black Card members get ₱2,000 less to spend on every VIP Room.</p>
      </div>
      <Suspense fallback={<div className="skeleton h-[640px]" />}>
        <Inner />
      </Suspense>
    </div>
  );
}

async function Inner() {
  const m = await requireMember();
  const confirmed = await list("bookings", { eq: { status: "confirmed" } });
  return <BookingForm member={{ name: m.name, mobile: m.mobile, vouchersLeft: m.vouchersLeft }} busy={confirmed.map((b) => ({ room: b.room, date: b.date, time: b.time }))} />;
}
