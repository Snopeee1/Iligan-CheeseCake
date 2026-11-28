import { biz } from "@/lib/content";

const site = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/**
 * Structured data so Google can show the address, hours and contact details.
 * Only confirmed facts from business.json: no ratings or reviews (Google ignores
 * self-published review markup) and nothing marked TBD.
 */
export function RestaurantJsonLd() {
  const a = biz.address;
  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: biz.name,
    slogan: biz.tagline,
    url: site,
    image: `${site}/images/hero-basque-golden-cheesecake.webp`,
    telephone: "+63 63 302 3635",
    email: biz.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: a.street,
      addressLocality: `${a.barangay}, ${a.city}`,
      addressRegion: a.province,
      addressCountry: "PH",
    },
    geo: { "@type": "GeoCoordinates", latitude: a.geo.lat, longitude: a.geo.lng },
    hasMap: a.googleMaps,
    // Tuesday–Sunday 11:30 AM – 9:30 PM; Monday is the rest day
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "11:30",
        closes: "21:30",
      },
    ],
    servesCuisine: ["Cheesecakes", "Pasta", "Rice meals", "Coffee"],
    menu: `${site}/menu`,
    acceptsReservations: true,
    sameAs: [biz.socials.facebook, biz.socials.instagram, biz.socials.tiktok],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
