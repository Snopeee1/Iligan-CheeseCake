import "server-only";
import { list, type MenuOverride } from "./db";
import { MENU, type MenuCategory, type MenuItem } from "./content";

export type LiveItem = MenuItem & { available: boolean };
export type LiveCategory = Omit<MenuCategory, "groups"> & { groups: { name: string; note?: string; membersOnly?: boolean; items: LiveItem[] }[] };

/** Menu from content/menu.json with the admin's price / availability / visibility edits applied. */
export async function getLiveMenu(): Promise<LiveCategory[]> {
  const rows = await list("menu_overrides");
  const o = new Map<string, MenuOverride>(rows.map((r) => [r.key, r]));
  return MENU.map((c) => ({
    ...c,
    groups: c.groups.map((g) => ({
      ...g,
      items: g.items
        .filter((i) => !o.get(i.key)?.hidden)
        .map((i) => {
          const ov = o.get(i.key);
          return { ...i, price: ov && ov.price !== undefined && ov.price !== null ? ov.price : i.price, available: ov?.available ?? true };
        }),
    })),
  }));
}

export async function getLiveItems() {
  return (await getLiveMenu()).flatMap((c) => c.groups.flatMap((g) => g.items));
}
