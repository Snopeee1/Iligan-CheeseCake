import business from "@/content/business.json";
import menu from "@/content/menu.json";

export const biz = business;

export type MenuItem = {
  key: string;
  name: string;
  price: number | null;
  from?: boolean;
  image?: string | null;
  description?: string;
  category: string;
  categoryId: string;
  group?: string;
  membersOnly?: boolean;
};

export type MenuGroup = { name: string; note?: string; membersOnly?: boolean; items: MenuItem[] };
export type MenuCategory = { id: string; name: string; groups: MenuGroup[]; note?: string };

type RawItem = { name: string; price: number | null; from?: boolean; image?: string | null; description?: string };
type RawGroup = { name: string; note?: string; membersOnlyPrice?: boolean; items: RawItem[] };
type RawCat = { id: string; name: string; items?: RawItem[]; groups?: RawGroup[]; wholeCakes?: string };

export function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const MENU: MenuCategory[] = (menu.categories as RawCat[]).map((c) => {
  const toItem = (it: RawItem, g?: RawGroup): MenuItem => ({
    key: `${c.id}--${slug(it.name)}`,
    name: it.name,
    price: it.price ?? null,
    from: it.from,
    image: it.image ?? null,
    description: it.description,
    category: c.name,
    categoryId: c.id,
    group: g?.name,
    membersOnly: g?.membersOnlyPrice === true,
  });
  const groups: MenuGroup[] = c.groups
    ? c.groups.map((g) => ({ name: g.name, note: g.note, membersOnly: g.membersOnlyPrice === true, items: g.items.map((i) => toItem(i, g)) }))
    : [{ name: c.name, items: (c.items ?? []).map((i) => toItem(i)) }];
  return { id: c.id, name: c.name, groups, note: c.wholeCakes };
});

export const ALL_ITEMS: MenuItem[] = MENU.flatMap((c) => c.groups.flatMap((g) => g.items));

export const CATEGORY_META: Record<string, { icon: "cake" | "pasta" | "meal" | "coffee"; title: string; em: string; blurb: string }> = {
  "signature-cheesecakes": { icon: "cake", title: "Signature", em: "Cheesecakes", blurb: "Handcrafted daily. Whole cakes and 4-in-1 / 8-in-1 assorted boxes available — assorted box from ₱3,800, now ₱3,550 on promo." },
  pasta: { icon: "pasta", title: "Artisan", em: "Pastas", blurb: "Every pasta is served with a golden, toasted garlic baguette." },
  meals: { icon: "meal", title: "Signature", em: "Rice Entrées & Mains", blurb: "Complimentary unlimited Golden Honey Buns with selected ICH rice meals, pastas & cheesecakes." },
  "coffee-drinks": { icon: "coffee", title: "Coffee,", em: "Frappes & Teas", blurb: "Made with 100% Arabica espresso." },
};

/** Photos whose top edge carries the client's logo banner get cropped from the top. */
export const PHOTO_CROP: Record<string, string> = {
  "hero-basque-golden-cheesecake": "32%",
  "menu-oreo-cheesecake": "34%",
  "menu-nutella-cheesecake": "50%",
  "menu-almond-heaven-chocolate-cake": "16%",
  "menu-creamy-tuscan-chicken": "30%",
  "menu-creamy-chicken-carbonara": "14%",
  "menu-tonno-alla-griglia": "34%",
};

export const ROOMS = [
  { id: "family", name: "The Family Room", short: "Family Room", label: "VIP Room 1", capacity: "Good for 8 · max 10", min: 1, max: 10, consumable: 8000, member: 6000, image: "vip-room-family-01", use: "A warm and private space ideal for intimate celebrations, birthdays, reunions and meaningful moments shared with loved ones." },
  { id: "corporate", name: "The Corporate Room", short: "Corporate Room", label: "VIP Room 2", capacity: "Good for 12 · max 16", min: 1, max: 16, consumable: 12000, member: 10000, image: "vip-room-corporate-01", use: "A refined and professional setting for business meetings, presentations, strategy sessions and executive dining." },
  { id: "seminar", name: "The Seminar Room", short: "Seminar Room", label: "VIP Room 3", capacity: "26–30 guests", min: 1, max: 30, consumable: 20000, member: 18000, image: null, use: "A spacious, well-appointed room for team trainings, workshops, orientations and small seminars." },
  { id: "exclusive", name: "Main Dining + Seminar Room", short: "Whole place", label: "Whole place", capacity: "50–60 guests", min: 1, max: 60, consumable: 50000, member: null, promo: "₱40,000–45,000", image: "interior-dining-hall-01", use: "Book the whole house for bigger parties and corporate events. ₱50,000 to spend on food and drinks — now on promo." },
] as const;
export type RoomId = (typeof ROOMS)[number]["id"];

export const TIME_SLOTS = ["11:30", "13:00", "15:00", "17:00", "19:00"] as const;

export const LINKS = {
  messenger: biz.messenger.url,
  phone: "tel:+63633023635",
  phoneLabel: biz.phone,
  email: `mailto:${biz.email}`,
  maps: biz.address.googleMaps,
  mapsEmbed: "https://www.google.com/maps?q=Iligan+Cheesecake+House,+Bauhina+St,+Iligan+City&output=embed",
  facebook: biz.socials.facebook,
  instagram: biz.socials.instagram,
  tiktok: biz.socials.tiktok,
  foodpanda: biz.foodpanda,
};

export const peso = (n: number) => `₱${n.toLocaleString("en-PH")}`;
