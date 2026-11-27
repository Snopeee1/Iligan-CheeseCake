import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Data access. Uses Supabase when SUPABASE_URL + SUPABASE_SECRET_KEY are set
 * (production), otherwise a local JSON file at data/db.json (offline dev).
 * App code uses camelCase; Supabase columns are snake_case.
 */

export type Member = {
  id: string;
  cardNo: string;
  name: string;
  mobile: string;
  email?: string | null;
  birthday?: string | null; // MM-DD
  pinHash: string;
  joinedAt: string;
  expiresAt: string;
  vouchersLeft: number;
  visits: number;
  status: "active" | "suspended";
  birthdaySliceClaimedYear?: number | null;
  createdAt?: string;
};

export type Application = {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  birthday?: string | null;
  payment: "cash" | "card" | "bank";
  source: "website" | "in-store";
  status: "new" | "approved" | "declined";
  memberId?: string | null;
  createdAt: string;
};

export type Booking = {
  id: string;
  room: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  guests: number;
  occasion: string;
  name: string;
  contact: string;
  notes?: string | null;
  memberId?: string | null;
  useVoucher: boolean;
  status: "pending" | "confirmed" | "declined" | "completed" | "cancelled";
  staffNote?: string | null;
  createdAt: string;
};

export type Inquiry = {
  id: string;
  topic: string;
  name: string;
  contact: string;
  date?: string | null;
  guests?: number | null;
  message: string;
  source: "website" | "card";
  status: "open" | "done";
  createdAt: string;
};

export type Activity = {
  id: string;
  memberId: string;
  type: "registration" | "voucher" | "perk" | "booking" | "visit" | "birthday";
  label: string;
  amount?: number | null;
  at: string;
  by?: string | null;
};

export type Staff = { id: string; name: string; email: string; passwordHash: string; role: "owner" | "staff"; createdAt?: string };

export type MenuOverride = { key: string; price?: number | null; available: boolean; hidden: boolean; updatedAt?: string };

export type Settings = {
  id: number;
  offerHeadline: string;
  offerBody: string;
  offerActive: boolean;
  announcement: string;
  announcementActive: boolean;
};

type Rows = {
  members: Member;
  applications: Application;
  bookings: Booking;
  inquiries: Inquiry;
  activity: Activity;
  staff: Staff;
  menu_overrides: MenuOverride;
  settings: Settings;
};
export type Table = keyof Rows;
const PK: Record<Table, string> = { members: "id", applications: "id", bookings: "id", inquiries: "id", activity: "id", staff: "id", menu_overrides: "key", settings: "id" };

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  offerHeadline: "Enjoy 5–10% DISCOUNT on selected favorites",
  offerBody: "Our thank-you for coming back: show our calling card on your next dine-in visit. Selected items only — ask our team for today’s selection.",
  offerActive: true,
  announcement: "Open Tuesday–Sunday, 11:30 AM – 9:30 PM. Closed Mondays.",
  announcementActive: false,
};

export type Query = { eq?: Record<string, unknown>; order?: [string, "asc" | "desc"]; limit?: number };

/* ---------- case mapping ---------- */
const toSnake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const toCamel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
const mapKeys = (o: Record<string, unknown>, f: (s: string) => string) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => [f(k), v]));

/* ---------- Supabase driver ---------- */
let sb: SupabaseClient | null = null;
export const usingSupabase = () => !!(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
function supa() {
  if (!sb) sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
  return sb;
}

/* ---------- File driver ---------- */
const FILE = path.join(process.cwd(), "data", "db.json");
type FileDB = { [K in Table]: Rows[K][] };
const emptyFile = (): FileDB => ({ members: [], applications: [], bookings: [], inquiries: [], activity: [], staff: [], menu_overrides: [], settings: [DEFAULT_SETTINGS] });
let queue: Promise<unknown> = Promise.resolve();
async function loadFile(): Promise<FileDB> {
  try {
    return { ...emptyFile(), ...(JSON.parse(await fs.readFile(FILE, "utf8")) as Partial<FileDB>) };
  } catch {
    return emptyFile();
  }
}
function mutateFile<T>(fn: (db: FileDB) => T): Promise<T> {
  const run = queue.then(async () => {
    const db = await loadFile();
    const out = fn(db);
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    const tmp = `${FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
    await fs.rename(tmp, FILE);
    return out;
  });
  queue = run.catch(() => undefined);
  return run;
}
const matches = (row: Record<string, unknown>, eq?: Record<string, unknown>) => !eq || Object.entries(eq).every(([k, v]) => row[k] === v);
function sortRows<T>(rows: T[], order?: [string, "asc" | "desc"], limit?: number) {
  let out = rows;
  if (order) {
    const [k, dir] = order;
    out = [...rows].sort((a, b) => {
      const x = (a as Record<string, unknown>)[k] as string | number, y = (b as Record<string, unknown>)[k] as string | number;
      return (x > y ? 1 : x < y ? -1 : 0) * (dir === "asc" ? 1 : -1);
    });
  }
  return limit ? out.slice(0, limit) : out;
}

/* ---------- public API ---------- */
export async function list<K extends Table>(table: K, q: Query = {}): Promise<Rows[K][]> {
  if (usingSupabase()) {
    let req = supa().from(table).select("*");
    for (const [k, v] of Object.entries(q.eq ?? {})) req = req.eq(toSnake(k), v as string);
    if (q.order) req = req.order(toSnake(q.order[0]), { ascending: q.order[1] === "asc" });
    if (q.limit) req = req.limit(q.limit);
    const { data, error } = await req;
    if (error) throw new Error(`DB list ${table}: ${error.message}`);
    return (data ?? []).map((r) => mapKeys(r, toCamel) as Rows[K]);
  }
  await queue;
  const db = await loadFile();
  return sortRows((db[table] as Rows[K][]).filter((r) => matches(r as Record<string, unknown>, q.eq)), q.order, q.limit);
}

export async function findOne<K extends Table>(table: K, eq: Record<string, unknown>): Promise<Rows[K] | null> {
  return (await list(table, { eq, limit: 1 }))[0] ?? null;
}

export async function get<K extends Table>(table: K, key: string | number): Promise<Rows[K] | null> {
  return findOne(table, { [toCamel(PK[table])]: key });
}

export async function insert<K extends Table>(table: K, row: Omit<Rows[K], "id" | "createdAt"> & { id?: string; createdAt?: string }): Promise<Rows[K]> {
  const full = { ...row } as Record<string, unknown>;
  if (PK[table] === "id" && table !== "settings" && !full.id) full.id = randomUUID();
  if (["members", "applications", "bookings", "inquiries", "staff"].includes(table) && !full.createdAt) full.createdAt = new Date().toISOString();
  if (usingSupabase()) {
    const { data, error } = await supa().from(table).insert(mapKeys(full, toSnake)).select().single();
    if (error) throw new Error(`DB insert ${table}: ${error.message}`);
    return mapKeys(data, toCamel) as Rows[K];
  }
  return mutateFile((db) => {
    (db[table] as unknown as Record<string, unknown>[]).push(full);
    return full as Rows[K];
  });
}

/** Updates one row. With `expect`, only updates if those fields still hold (optimistic lock). Returns null if nothing matched. */
export async function update<K extends Table>(table: K, key: string | number, patch: Partial<Rows[K]>, expect?: Record<string, unknown>): Promise<Rows[K] | null> {
  const pk: string = PK[table];
  if (usingSupabase()) {
    let req = supa().from(table).update(mapKeys(patch as Record<string, unknown>, toSnake)).eq(pk, key);
    for (const [k, v] of Object.entries(expect ?? {})) req = req.eq(toSnake(k), v as string);
    const { data, error } = await req.select();
    if (error) throw new Error(`DB update ${table}: ${error.message}`);
    return data?.[0] ? (mapKeys(data[0], toCamel) as Rows[K]) : null;
  }
  return mutateFile((db) => {
    const rows = db[table] as unknown as Record<string, unknown>[];
    const row = rows.find((r) => r[toCamel(pk)] === key && matches(r, expect));
    if (!row) return null;
    Object.assign(row, patch);
    return row as Rows[K];
  });
}

export async function upsert<K extends Table>(table: K, row: Rows[K]): Promise<Rows[K]> {
  if (usingSupabase()) {
    const { data, error } = await supa().from(table).upsert(mapKeys(row as Record<string, unknown>, toSnake), { onConflict: PK[table] }).select().single();
    if (error) throw new Error(`DB upsert ${table}: ${error.message}`);
    return mapKeys(data, toCamel) as Rows[K];
  }
  return mutateFile((db) => {
    const rows = db[table] as unknown as Record<string, unknown>[];
    const pk = toCamel(PK[table]);
    const i = rows.findIndex((r) => r[pk] === (row as Record<string, unknown>)[pk]);
    if (i >= 0) rows[i] = { ...rows[i], ...row };
    else rows.push(row as Record<string, unknown>);
    return row;
  });
}

export async function getSettings(): Promise<Settings> {
  return (await get("settings", 1)) ?? DEFAULT_SETTINGS;
}
