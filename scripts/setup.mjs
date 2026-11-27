// One-time setup: creates .env.local (secrets + demo logins) and seeds the data store.
//   npm run setup             seed (Supabase if SUPABASE_URL + SUPABASE_SECRET_KEY are set, else data/db.json)
//   npm run setup -- --reset  wipe and re-seed the local data/db.json
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { randomBytes, randomInt, randomUUID, scryptSync } from "crypto";
import path from "path";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const dbPath = path.join(root, "data", "db.json");
const reset = process.argv.includes("--reset");

const hash = (plain) => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(plain, salt, 32).toString("hex")}`;
};

if (!existsSync(envPath)) {
  writeFileSync(
    envPath,
    [
      "# Local secrets and demo logins (never commit this file)",
      `SESSION_SECRET=${randomBytes(32).toString("base64url")}`,
      "ADMIN_NAME=Owner",
      "ADMIN_EMAIL=owner@iligancheesecakehouse.test",
      `ADMIN_PASSWORD=${randomBytes(9).toString("base64url")}`,
      "DEMO_MEMBER_NAME=Demo Member",
      "DEMO_MEMBER_MOBILE=09170000042",
      `DEMO_MEMBER_PIN=${String(randomInt(1000, 9999))}`,
      "NEXT_PUBLIC_SITE_URL=http://localhost:3000",
      "# Supabase (Project Settings → API keys). The secret key stays on the server.",
      "SUPABASE_URL=",
      "SUPABASE_SECRET_KEY=",
      "",
    ].join("\n"),
  );
  console.log("Created .env.local with new secrets and demo logins.");
}

const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);

const now = new Date();
const memberId = randomUUID();
const staff = { id: randomUUID(), name: env.ADMIN_NAME || "Owner", email: env.ADMIN_EMAIL.toLowerCase(), password_hash: hash(env.ADMIN_PASSWORD), role: "owner" };
const member = {
  id: memberId,
  card_no: "ICH-BC-0001",
  name: env.DEMO_MEMBER_NAME || "Demo Member",
  mobile: env.DEMO_MEMBER_MOBILE,
  pin_hash: hash(env.DEMO_MEMBER_PIN),
  joined_at: now.toISOString(),
  expires_at: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString(),
  vouchers_left: 3,
  visits: 0,
  status: "active",
};
const activity = { id: randomUUID(), member_id: memberId, type: "registration", label: "Black Card registered · ₱2,200 paid · 3 × ₱400 vouchers added", amount: 1200, at: now.toISOString(), by: "Setup" };

if (env.SUPABASE_URL && env.SUPABASE_SECRET_KEY) {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
  const { data: existing } = await sb.from("staff").select("id").eq("email", staff.email);
  if (!existing?.length) {
    const r1 = await sb.from("staff").insert(staff);
    if (r1.error) throw r1.error;
    console.log("Supabase: owner account created.");
  } else console.log("Supabase: owner account already exists.");
  const { data: m } = await sb.from("members").select("id").eq("mobile", member.mobile);
  if (!m?.length) {
    const r2 = await sb.from("members").insert(member);
    if (r2.error) throw r2.error;
    await sb.from("activity").insert(activity);
    console.log("Supabase: demo member created.");
  } else console.log("Supabase: demo member already exists.");
  process.exit(0);
}

if (existsSync(dbPath) && !reset) {
  console.log("data/db.json already exists — leaving it alone (use --reset to re-seed).");
  process.exit(0);
}
const camel = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()), v]));
mkdirSync(path.dirname(dbPath), { recursive: true });
writeFileSync(
  dbPath,
  JSON.stringify(
    { members: [camel(member)], applications: [], bookings: [], inquiries: [], activity: [camel(activity)], staff: [camel(staff)], menu_overrides: [], settings: [] },
    null,
    2,
  ),
);
console.log("Seeded data/db.json with one owner account and one demo member (logins are in .env.local).");
