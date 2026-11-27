import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Empty } from "@/components/ui";
import { AdminTitle, Card, Stat, statusTone } from "@/components/AdminBits";
import { AddMemberForm, ApplicationActions, MemberActions } from "@/components/AdminClient";
import { requireStaff } from "@/lib/auth";
import { list } from "@/lib/db";
import { fmtDate, nowMs } from "@/lib/format";

export const metadata: Metadata = { title: "Black Card members" };

export default function Members({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return (
    <>
      <AdminTitle title="Black Card members" sub="₱2,200 a year · 3 × ₱400 vouchers · digital card with live QR" />
      <Suspense fallback={<div className="skeleton h-96" />}>
        <Inner searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Inner({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireStaff();
  const { q = "" } = await searchParams;
  const [members, apps, activity] = await Promise.all([list("members", { order: ["cardNo", "desc"] }), list("applications", { eq: { status: "new" }, order: ["createdAt", "desc"] }), list("activity", { eq: { type: "voucher" } })]);
  const query = q.trim().toLowerCase();
  const shown = query ? members.filter((m) => [m.name, m.mobile, m.cardNo].some((v) => v.toLowerCase().includes(query))) : members;
  const active = members.filter((m) => m.status === "active" && new Date(m.expiresAt).getTime() > nowMs());
  const month = new Date(nowMs() + 8 * 3600_000).toISOString().slice(0, 7);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Active members" value={active.length} icon="card" />
        <Stat label="Vouchers outstanding" value={active.reduce((n, m) => n + m.vouchersLeft, 0)} hint={`₱${(active.reduce((n, m) => n + m.vouchersLeft, 0) * 400).toLocaleString()} in ₱400 vouchers`} icon="coffee" />
        <Stat label="Vouchers used this month" value={activity.filter((a) => a.at.slice(0, 7) === month).length} icon="receipt" />
        <Stat label="Applications" value={apps.length} hint={apps.length ? "Waiting for payment" : "None waiting"} tone={apps.length ? "warn" : undefined} icon="user" />
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <form className="flex flex-wrap items-center gap-3 px-5 pt-4 pb-3">
            <input name="q" defaultValue={q} className="input !h-11 max-w-xs" placeholder="Search name, mobile or card no." aria-label="Search members" />
            <button className="btn btn-ink btn-sm">Search</button>
            {q ? (
              <Link href="/admin/members" className="text-sm text-berry">
                Clear
              </Link>
            ) : null}
          </form>
          {shown.length ? (
            <div className="overflow-x-auto">
              <table className="tbl min-w-[820px]">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Card no.</th>
                    <th>Valid until</th>
                    <th className="num">Vouchers</th>
                    <th className="num">Visits</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {shown.map((m) => {
                    const expired = new Date(m.expiresAt).getTime() < nowMs();
                    return (
                      <tr key={m.id}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <span className="grid size-9 flex-none place-items-center rounded-full bg-cheesecake font-serif font-semibold text-berry">{m.name[0]}</span>
                            <span>
                              <b>{m.name}</b>
                              <span className="block text-xs text-muted">{m.mobile}</span>
                            </span>
                          </div>
                        </td>
                        <td className="font-semibold">{m.cardNo}</td>
                        <td>{fmtDate(m.expiresAt)}</td>
                        <td className="num font-semibold">{m.vouchersLeft} of 3</td>
                        <td className="num">{m.visits}</td>
                        <td>{expired ? <span className="st bad">Expired</span> : <span className={`st ${statusTone[m.status]}`}>{m.status}</span>}</td>
                        <td>
                          <MemberActions id={m.id} status={m.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty icon="card" title={q ? "No match" : "No members yet"}>{q ? "Try another name or number." : "Approve an application or register a member in store."}</Empty>
          )}
        </Card>
        <div className="grid gap-6">
          <Card title={`Applications · ${apps.length}`}>
            {apps.length ? (
              <ul className="divide-y divide-line">
                {apps.map((a) => (
                  <li key={a.id} className="grid gap-2 px-5 py-3.5">
                    <div className="text-sm">
                      <b>{a.name}</b>
                      <span className="block text-xs text-muted">
                        {a.mobile} · pays by {a.payment === "bank" ? "bank transfer" : a.payment} · {fmtDate(a.createdAt, { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <ApplicationActions id={a.id} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 pb-5 text-sm text-muted">No applications waiting.</p>
            )}
          </Card>
          <div className="panel">
            <AddMemberForm />
          </div>
        </div>
      </div>
    </>
  );
}
