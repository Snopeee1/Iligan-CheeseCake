import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminTitle, Card } from "@/components/AdminBits";
import { MenuRowEditor } from "@/components/AdminClient";
import { requireStaff } from "@/lib/auth";
import { list } from "@/lib/db";
import { MENU } from "@/lib/content";

export const metadata: Metadata = { title: "Menu" };

export default function MenuAdmin() {
  return (
    <>
      <AdminTitle title="Menu" sub="Update dine-in prices, mark items sold out for today, or hide them. Changes show on the website right away." />
      <Suspense fallback={<div className="skeleton h-96" />}>
        <Inner />
      </Suspense>
    </>
  );
}

async function Inner() {
  await requireStaff();
  const o = new Map((await list("menu_overrides")).map((r) => [r.key, r]));
  return (
    <>
      <p className="ok-msg">
        Prices loaded from the delivery-app menu. Sir Angelo confirmed in-store prices are different — enter the dine-in prices from the calling-card menu here. Chef VIP Special Menu prices are only shown to signed-in Black Card members.
      </p>
      {MENU.map((c) => (
        <Card key={c.id} title={c.name}>
          {c.groups.map((g) => (
            <div key={g.name}>
              {c.groups.length > 1 ? (
                <h3 className={`px-4 pt-3 pb-1 text-xs font-semibold tracking-[.14em] uppercase ${g.membersOnly ? "text-berry" : "text-muted"}`}>
                  {g.name}
                  {g.membersOnly ? " · members-only prices" : ""}
                </h3>
              ) : null}
              {g.items.map((i) => {
                const ov = o.get(i.key);
                return <MenuRowEditor key={i.key} itemKey={i.key} name={i.name} basePrice={i.price} price={ov?.price ?? i.price} available={ov?.available ?? true} hidden={ov?.hidden ?? false} />;
              })}
            </div>
          ))}
        </Card>
      ))}
    </>
  );
}
