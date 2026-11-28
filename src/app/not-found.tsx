import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/ui";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="glow-dark grid min-h-dvh place-items-center px-4 py-16 text-cream">
      <div className="grid max-w-lg justify-items-center gap-6 text-center">
        <Logo />
        <p className="eyebrow">Error 404</p>
        <h1 className="h2">
          This slice is <em className="text-gold-light">missing</em>
        </h1>
        <p className="text-cream/75">The page you’re looking for has moved or doesn’t exist. Let’s get you back to the good stuff.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-berry">
            <Icon name="arrow" className="rotate-180" /> Back to home
          </Link>
          <Link href="/menu" className="btn btn-outline">
            See the menu
          </Link>
        </div>
      </div>
    </main>
  );
}
