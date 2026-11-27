import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminTitle } from "@/components/AdminBits";
import { CounterScanner } from "@/components/AdminClient";
import { requireStaff } from "@/lib/auth";

export const metadata: Metadata = { title: "Counter" };

export default function Counter() {
  return (
    <>
      <AdminTitle title="Counter" sub="Scan a member’s live QR to apply discounts, free drinks, vouchers and the birthday slice." />
      <Suspense fallback={<div className="skeleton h-96" />}>
        <Gate />
      </Suspense>
    </>
  );
}

async function Gate() {
  await requireStaff();
  return <CounterScanner />;
}
