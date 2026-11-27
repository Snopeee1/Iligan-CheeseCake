import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import "./motion.css";
import { MotionRoot } from "@/components/motion";
import { INTRO_SCRIPT } from "@/components/Intro";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });
const sans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-dm", display: "swap" });

const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: "Iligan Cheesecake House — Because Life is so Cheesy!", template: "%s · Iligan Cheesecake House" },
  description:
    "Cheesecake café & restaurant in San Miguel Village, Pala-o, Iligan City. Signature Cheesecakes, Artisan Pastas, Signature Rice Entrées, VIP Rooms and the ICH Black Card.",
  openGraph: { type: "website", siteName: "Iligan Cheesecake House", images: ["/images/hero-basque-golden-cheesecake.webp"] },
};

export const viewport: Viewport = { themeColor: "#14110F" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      </head>
      <body>
        <MotionRoot />
        {children}
      </body>
    </html>
  );
}
