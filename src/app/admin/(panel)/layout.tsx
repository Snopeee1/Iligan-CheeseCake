import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { AdminSidebar, AdminTabs } from "@/components/AdminNav";
import { PinRevealHost } from "@/components/AdminClient";
import { Dust } from "@/components/motion";
import { staffLogout } from "@/app/actions/admin";
import { getStaff } from "@/lib/auth";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · ICH Admin" }, robots: { index: false, follow: false } };

async function Who() {
  const s = await getStaff();
  if (!s) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 place-items-center rounded-full bg-gold font-serif font-semibold text-espresso">{s.name[0]}</span>
      <div className="text-sm leading-tight">
        <b className="block">{s.name}</b>
        <span className="text-xs capitalize opacity-70">{s.role}</span>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#F6F1E8] lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="glow-dark sticky top-0 hidden h-dvh flex-col gap-8 overflow-hidden p-5 lg:flex">
        <Dust />
        <div className="relative"><Logo href="/admin" /></div>
        <div className="relative"><AdminSidebar /></div>
        <div className="relative mt-auto grid gap-4">
          <Suspense fallback={null}>
            <Who />
          </Suspense>
          <div className="flex gap-2">
            <Link href="/" target="_blank" className="btn btn-outline btn-sm flex-1 !px-3">
              <Icon name="eye" /> Site
            </Link>
            <form action={staffLogout} className="flex-1">
              <button className="btn btn-outline btn-sm w-full !px-3">
                <Icon name="logout" /> Out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="glow-dark flex h-16 items-center justify-between px-4 lg:hidden">
          <Logo href="/admin" />
          <form action={staffLogout}>
            <button className="btn btn-outline btn-sm" aria-label="Sign out">
              <Icon name="logout" />
            </button>
          </form>
        </header>
        <AdminTabs />
        <main className="mx-auto grid max-w-[1280px] gap-6 p-4 md:p-8">{children}</main>
        <PinRevealHost />
      </div>
    </div>
  );
}
