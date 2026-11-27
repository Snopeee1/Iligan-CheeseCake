import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getSettings } from "@/lib/db";
import { Intro } from "@/components/Intro";
import { BackToTop } from "@/components/motion";

async function Announcement() {
  const s = await getSettings();
  if (!s.announcementActive || !s.announcement) return null;
  return <div className="bg-gold px-4 py-2 text-center text-[13px] font-semibold text-espresso">{s.announcement}</div>;
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:text-espresso">
        Skip to content
      </a>
      <Suspense fallback={null}>
        <Announcement />
      </Suspense>
      <Intro />
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <BackToTop />
    </>
  );
}
