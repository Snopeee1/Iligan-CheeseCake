import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Icon } from "@/components/Icon";
import { Empty } from "@/components/ui";
import { AdminTitle, Card } from "@/components/AdminBits";
import { InquiryToggle } from "@/components/AdminClient";
import { requireStaff } from "@/lib/auth";
import { list } from "@/lib/db";
import { dayLabel, fmtDate } from "@/lib/format";

export const metadata: Metadata = { title: "Inquiries" };

export default function Inquiries({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  return (
    <>
      <AdminTitle title="Inquiries" sub="Messages from the website and the calling-card page. Reply on Messenger or by phone, then mark them replied." />
      <Suspense fallback={<div className="skeleton h-96" />}>
        <Inner searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Inner({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  await requireStaff();
  const { f = "open" } = await searchParams;
  const all = await list("inquiries", { order: ["createdAt", "desc"] });
  const rows = f === "all" ? all : all.filter((i) => i.status === (f === "done" ? "done" : "open"));
  const telLink = (c: string) => (/^[\d\s+()-]{7,}$/.test(c) ? `tel:${c.replace(/[^\d+]/g, "")}` : null);
  return (
    <>
      <div className="flex gap-2">
        {[
          ["open", `Open · ${all.filter((i) => i.status === "open").length}`],
          ["done", "Replied"],
          ["all", "All"],
        ].map(([k, l]) => (
          <Link key={k} href={`?f=${k}`} className={`rounded-full border px-4 py-2 text-sm font-semibold ${f === k ? "border-ink bg-ink text-cream" : "border-line bg-white"}`}>
            {l}
          </Link>
        ))}
      </div>
      <Card>
        {rows.length ? (
          <ul className="divide-y divide-line">
            {rows.map((i) => {
              const tel = telLink(i.contact);
              return (
                <li key={i.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto] md:items-start">
                  <div className="grid gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="grid size-9 place-items-center rounded-full bg-cheesecake font-serif font-semibold text-berry">{i.name[0]}</span>
                      <b>{i.name}</b>
                      <span className="chip !py-0.5 !text-xs">{i.topic}</span>
                      {i.source === "card" ? <span className="st info">Calling card</span> : null}
                      <span className="text-xs text-muted">{fmtDate(i.createdAt, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
                    </div>
                    <p className="text-[15px]">{i.message || <span className="text-muted">No message</span>}</p>
                    <p className="flex flex-wrap gap-3 text-xs text-muted">
                      <span>{i.contact}</span>
                      {i.date ? <span>For {dayLabel(i.date)}</span> : null}
                      {i.guests ? <span>{i.guests} guests</span> : null}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tel ? (
                      <a href={tel} className="btn btn-white btn-sm !px-3 !py-1.5">
                        <Icon name="phone" /> Call
                      </a>
                    ) : null}
                    <InquiryToggle id={i.id} status={i.status} />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty title={f === "open" ? "Inbox zero" : "Nothing here"}>New messages from the website will appear here.</Empty>
        )}
      </Card>
    </>
  );
}
