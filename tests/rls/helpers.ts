import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { brandsSeedSchema, buildBrandRows } from "@/lib/brands/schema";
import { parseJourneySeed } from "@/lib/journey/schema";
import { buildJourneyRows, withBrandIds, withNodeIds } from "@/lib/journey/rows";
import { brandBookSeedSchema, buildBrandProfileUpdates } from "@/lib/brandbook/schema";
import { buildProductRows, productsSeedSchema } from "@/lib/products/seed";

const root = resolve(import.meta.dirname, "../..");
const readJson = (file: string): unknown => JSON.parse(readFileSync(resolve(root, file), "utf8"));

// Mô phỏng phần Supabase mà migration phụ thuộc: các vai trò, schema auth, auth.uid()
// và quyền mặc định trên bảng mới (Supabase cấp cho anon, authenticated, service_role).
const SUPABASE_STUB = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (
    id uuid primary key default gen_random_uuid(),
    email text,
    raw_user_meta_data jsonb not null default '{}'::jsonb,
    raw_app_meta_data jsonb not null default '{}'::jsonb
  );
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant usage on schema public, auth to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
`;

export const USERS = {
  admin: "00000000-0000-4000-8000-000000000001",
  editor: "00000000-0000-4000-8000-000000000002",
  staff: "00000000-0000-4000-8000-000000000003",
  backoffice: "00000000-0000-4000-8000-000000000004",
  inactive: "00000000-0000-4000-8000-000000000005",
  guest: "00000000-0000-4000-8000-000000000006",
  owner: "00000000-0000-4000-8000-000000000007",
} as const;

const JSONB_COLUMNS = new Set(["outcomes", "sublanes", "timed_notes", "extra", "value", "voice_profile", "data", "profile"]);

function toParam(column: string, value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (JSONB_COLUMNS.has(column)) return JSON.stringify(value);
  if (Array.isArray(value)) return `{${value.map((v) => `"${String(v).replaceAll('"', '\\"')}"`).join(",")}}`;
  return value;
}

export async function insertRows(db: PGlite, table: string, rows: Record<string, unknown>[]): Promise<void> {
  for (const row of rows) {
    const columns = Object.keys(row);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
    await db.query(
      `insert into public.${table} (${columns.join(", ")}) values (${placeholders})`,
      columns.map((c) => toParam(c, row[c])),
    );
  }
}

export async function applyMigrations(db: PGlite): Promise<void> {
  await db.exec(SUPABASE_STUB);
  const dir = resolve(root, "supabase/migrations");
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(resolve(dir, file), "utf8"));
  }
}

/** Nạp brands rồi journey_* bằng đúng bộ ánh xạ của script seed. */
export async function seedAll(db: PGlite): Promise<void> {
  const brands = buildBrandRows(brandsSeedSchema.parse(readJson("seed/brands.json")));
  await insertRows(
    db,
    "brands",
    brands.map(({ row, release_status }) => ({ ...row, release_status })),
  );
  await db.exec(`update public.brands set parent_id = (select id from public.brands where slug = 'vmg') where kind = 'member'`);
  const brandIds = new Map(
    (await db.query<{ id: string; slug: string }>(`select id, slug from public.brands`)).rows.map((b) => [b.slug, b.id]),
  );

  await insertRows(db, "products", buildProductRows(productsSeedSchema.parse(readJson("seed/products.json")), brandIds));

  const book = brandBookSeedSchema.parse(readJson("seed/brand-book.json"));
  for (const u of buildBrandProfileUpdates(book)) {
    await db.query(`update public.brands set role_summary = $2, voice_profile = $3, profile = $4 where slug = $1`, [
      u.slug,
      u.role_summary,
      JSON.stringify(u.voice_profile),
      JSON.stringify(u.profile),
    ]);
  }

  const rows = buildJourneyRows(parseJourneySeed(readJson("seed/journey.json")));
  await insertRows(db, "journey_stages", rows.stages);
  await insertRows(db, "journey_lines", rows.lines);
  await insertRows(db, "journey_nodes", withBrandIds(rows.nodes, brandIds));
  const nodeIds = new Map(
    (await db.query<{ id: string; code: string }>(`select id, code from public.journey_nodes`)).rows.map((n) => [n.code, n.id]),
  );
  await insertRows(db, "journey_edges", withNodeIds(rows.edges, nodeIds));
  await insertRows(
    db,
    "journey_node_products",
    rows.nodeProducts.map((p) => ({ node_id: nodeIds.get(p.node_code), product_code_hint: p.product_code_hint })),
  );
}

export async function createUsers(db: PGlite): Promise<void> {
  const make = (id: string, name: string, role?: string) =>
    db.query(`insert into auth.users (id, email, raw_app_meta_data) values ($1, $2, $3)`, [
      id,
      `${name}@example.test`,
      JSON.stringify(role ? { brand_lab_role: role } : {}),
    ]);
  await make(USERS.admin, "admin", "admin");
  await make(USERS.editor, "editor", "editor");
  await make(USERS.staff, "staff"); // không có vai trò trong metadata: mặc định staff
  await make(USERS.backoffice, "backoffice", "backoffice");
  await make(USERS.inactive, "inactive", "staff");
  await make(USERS.guest, "guest", "guest");
  await make(USERS.owner, "owner", "staff");
  await db.exec(`update public.profiles set active = false where id = '${USERS.inactive}'`);
}

/** Chạy fn với vai trò authenticated và JWT của userId (null = anon). */
export async function as<T>(db: PGlite, userId: string | null, fn: () => Promise<T>): Promise<T> {
  await db.exec(`set role ${userId ? "authenticated" : "anon"}`);
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [userId ?? ""]);
  try {
    return await fn();
  } finally {
    await db.exec(`reset role`);
    await db.query(`select set_config('request.jwt.claim.sub', '', false)`);
  }
}

export async function count(db: PGlite, relation: string): Promise<number> {
  const res = await db.query<{ n: number }>(`select count(*)::int as n from ${relation}`);
  return res.rows[0]!.n;
}
