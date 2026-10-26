/* Seed Giai đoạn 0 (spec 7.4 bước 1 và 8, Phụ lục G.5).
 *
 *   npm run seed -- --dry-run   kiểm tra file seed, không cần Supabase
 *   npm run seed                nạp feature_flags, brands (kèm hồ sơ Brand Book), products, journey_*
 *   npm run seed -- --force     nạp lại (ghi đè trường nguồn của brands, journey_*)
 *
 * Idempotent: chạy lại không nhân đôi dữ liệu. Mặc định bỏ qua phần đã nạp để không ghi đè
 * chỉnh sửa của quản trị; --force chỉ cập nhật trường nguồn và không đụng tới status,
 * effective_*, cờ tính năng. Cần NEXT_PUBLIC_SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { brandsSeedSchema, buildBrandRows } from "../../lib/brands/schema";
import { parseJourneySeed } from "../../lib/journey/schema";
import { buildJourneyRows, withBrandIds, withNodeIds } from "../../lib/journey/rows";
import { validateJourney } from "../../lib/journey/validate";
import { brandBookSeedSchema, buildBrandProfileUpdates } from "../../lib/brandbook/schema";
import { matchesHint } from "../../lib/products/parse-portfolio";
import { buildProductRows, productsSeedSchema } from "../../lib/products/seed";

const root = resolve(__dirname, "../..");
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const force = args.has("--force");

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(resolve(root, file), "utf8"));
}

function must<T>(result: { data: T | null; error: { message: string } | null }, what: string): T {
  if (result.error) throw new Error(`${what}: ${result.error.message}`);
  return result.data as T;
}

async function seedFlags(db: SupabaseClient, flags: { key: string; value: boolean; note: string }[]) {
  // Chỉ thêm cờ còn thiếu: không bao giờ ghi đè giá trị admin đã đặt.
  must(
    await db.from("feature_flags").upsert(flags, { onConflict: "key", ignoreDuplicates: true }),
    "feature_flags",
  );
  console.log(`feature_flags: ${flags.length} cờ (chỉ thêm cờ còn thiếu)`);
}

async function seedBrands(db: SupabaseClient, brandsRaw: unknown) {
  const brands = buildBrandRows(brandsSeedSchema.parse(brandsRaw));
  const existing = must(await db.from("brands").select("slug"), "brands (đọc)") as { slug: string }[];
  const existingSlugs = new Set(existing.map((b) => b.slug));

  // Thương hiệu mới: kèm release_status. Thương hiệu đã có: chỉ cập nhật khi --force và không đổi trạng thái.
  const fresh = brands
    .filter((b) => !existingSlugs.has(b.row.slug))
    .map(({ row, release_status }) => ({ ...row, release_status }));
  if (fresh.length > 0) must(await db.from("brands").insert(fresh), "brands (thêm)");
  if (force) {
    const current = brands
      .filter((b) => existingSlugs.has(b.row.slug))
      .map(({ row }) => row);
    if (current.length > 0) must(await db.from("brands").upsert(current, { onConflict: "slug" }), "brands (cập nhật)");
  }

  const all = must(await db.from("brands").select("id, slug"), "brands (đọc id)") as { id: string; slug: string }[];
  const idBySlug = new Map(all.map((b) => [b.slug, b.id]));
  for (const { row, parent_slug } of brands) {
    if (!parent_slug) continue;
    const parentId = idBySlug.get(parent_slug);
    if (!parentId) throw new Error(`brands: thiếu thương hiệu mẹ '${parent_slug}'`);
    must(await db.from("brands").update({ parent_id: parentId }).eq("slug", row.slug).is("parent_id", null), "brands (mẹ)");
  }
  console.log(`brands: thêm ${fresh.length}, đã có ${brands.length - fresh.length}${force ? " (đã cập nhật)" : ""}`);
  return idBySlug;
}

async function seedProducts(db: SupabaseClient, productsRaw: unknown, brandIdBySlug: Map<string, string>) {
  const rows = buildProductRows(productsSeedSchema.parse(productsRaw), brandIdBySlug);
  const existing = must(await db.from("products").select("code"), "products (đọc)") as { code: string }[];
  const have = new Set(existing.map((p) => p.code));

  // Sản phẩm mới vào ở trạng thái draft (mặc định của cột). Sản phẩm đã có chỉ cập nhật khi --force
  // và chỉ trường nguồn: không đụng status, effective_*, owner (spec 9.1).
  const fresh = rows.filter((r) => !have.has(r.code));
  if (fresh.length > 0) must(await db.from("products").insert(fresh), "products (thêm)");
  if (force) {
    const current = rows.filter((r) => have.has(r.code));
    if (current.length > 0) must(await db.from("products").upsert(current, { onConflict: "code" }), "products (cập nhật)");
  }
  console.log(`products: thêm ${fresh.length}, đã có ${rows.length - fresh.length}${force ? " (đã cập nhật)" : ""}`);
}

async function seedBrandProfiles(db: SupabaseClient, raw: unknown) {
  const seed = brandBookSeedSchema.parse(raw);
  // Hồ sơ thương hiệu: chỉ điền thương hiệu chưa có hồ sơ, trừ khi --force (không ghi đè chỉnh sửa của quản trị).
  const brands = must(await db.from("brands").select("slug, profile"), "brands (đọc hồ sơ)") as { slug: string; profile: Record<string, unknown> }[];
  const hasProfile = new Map(brands.map((b) => [b.slug, Object.keys(b.profile ?? {}).length > 0]));
  let updated = 0;
  for (const u of buildBrandProfileUpdates(seed)) {
    if (!hasProfile.has(u.slug)) throw new Error(`brand_book: thương hiệu '${u.slug}' không có trong brands`);
    if (hasProfile.get(u.slug) && !force) continue;
    must(await db.from("brands").update({ role_summary: u.role_summary, voice_profile: u.voice_profile, profile: u.profile }).eq("slug", u.slug), `brands.profile (${u.slug})`);
    updated += 1;
  }
  console.log(`brand_book: cập nhật hồ sơ ${updated} thương hiệu`);
}

async function seedJourney(db: SupabaseClient, journeyRaw: unknown, brandIdBySlug: Map<string, string>) {
  const seeded = must(await db.from("journey_meta").select("value").eq("key", "seed").maybeSingle(), "journey_meta");
  if (seeded && !force) {
    console.log("journey_*: đã nạp trước đó, bỏ qua (dùng --force để nạp lại)");
    return;
  }

  const seed = parseJourneySeed(journeyRaw);
  const rows = buildJourneyRows(seed);

  must(await db.from("journey_stages").upsert(rows.stages, { onConflict: "key" }), "journey_stages");
  must(await db.from("journey_lines").upsert(rows.lines, { onConflict: "key" }), "journey_lines");
  must(
    await db.from("journey_nodes").upsert(withBrandIds(rows.nodes, brandIdBySlug), { onConflict: "code" }),
    "journey_nodes",
  );

  const nodeRows = must(await db.from("journey_nodes").select("id, code"), "journey_nodes (đọc id)") as {
    id: string;
    code: string;
  }[];
  const nodeIdByCode = new Map(nodeRows.map((n) => [n.code, n.id]));

  must(
    await db
      .from("journey_edges")
      .upsert(withNodeIds(rows.edges, nodeIdByCode), { onConflict: "from_node_id,to_node_id,kind" }),
    "journey_edges",
  );

  const nodeProducts = rows.nodeProducts.map((p) => {
    const nodeId = nodeIdByCode.get(p.node_code);
    if (!nodeId) throw new Error(`journey_node_products: thiếu ô ${p.node_code}`);
    return { node_id: nodeId, product_code_hint: p.product_code_hint };
  });
  must(
    await db.from("journey_node_products").upsert(nodeProducts, { onConflict: "node_id,product_code_hint" }),
    "journey_node_products",
  );

  must(await db.from("journey_meta").upsert({ key: "meta", value: rows.meta }, { onConflict: "key" }), "journey_meta");
  must(
    await db.from("journey_meta").upsert(
      {
        key: "seed",
        value: {
          at: new Date().toISOString(),
          source_version: (seed.meta as { version?: unknown }).version ?? null,
          counts: {
            stages: rows.stages.length,
            lines: rows.lines.length,
            nodes: rows.nodes.length,
            edges: rows.edges.length,
            node_products: rows.nodeProducts.length,
          },
        },
      },
      { onConflict: "key" },
    ),
    "journey_meta (seed)",
  );
  console.log(
    `journey_*: ${rows.stages.length} chặng, ${rows.lines.length} line, ${rows.nodes.length} ô, ` +
      `${rows.edges.length} đường nối, ${rows.nodeProducts.length} mã sản phẩm gợi ý (trạng thái proposed)`,
  );
}

async function main() {
  const brandsRaw = readJson("seed/brands.json");
  const journeyRaw = readJson("seed/journey.json");
  const productsRaw = readJson("seed/products.json");
  const brandBookRaw = readJson("seed/brand-book.json");

  const brandsSeed = brandsSeedSchema.parse(brandsRaw);
  const brandSlugs = new Set(brandsSeed.brands.map((b) => b.slug));
  const errors = validateJourney(parseJourneySeed(journeyRaw), { brandSlugs });
  if (errors.length > 0) {
    console.error(`seed/journey.json không hợp lệ:\n- ${errors.join("\n- ")}`);
    process.exit(1);
  }
  // Kiểm tra seed sản phẩm: đúng cấu trúc, thương hiệu có thật, và mọi mã gợi ý của ô hành trình trỏ tới ít nhất một sản phẩm.
  const productsSeed = productsSeedSchema.parse(productsRaw);
  const productErrors = [
    ...productsSeed.products.flatMap((p) => (p.brand_slug && !brandSlugs.has(p.brand_slug) ? [`${p.code}: thương hiệu '${p.brand_slug}' không có`] : [])),
    ...parseJourneySeed(journeyRaw).nodes.flatMap((n) =>
      n.product_code_hints.flatMap((hint) =>
        productsSeed.products.some((p) => matchesHint(p.code, hint)) ? [] : [`ô ${n.code}: mã gợi ý '${hint}' không có trong danh mục sản phẩm`],
      ),
    ),
  ];
  if (productErrors.length > 0) {
    console.error(`seed/products.json không hợp lệ:\n- ${productErrors.join("\n- ")}`);
    process.exit(1);
  }
  const brandBookSeed = brandBookSeedSchema.parse(brandBookRaw);
  const bookErrors = Object.keys(brandBookSeed.brands).filter((s) => !brandSlugs.has(s)).map((s) => `brand-book: thương hiệu '${s}' không có trong seed/brands.json`);
  if (bookErrors.length > 0) {
    console.error(`seed/brand-book.json không hợp lệ:\n- ${bookErrors.join("\n- ")}`);
    process.exit(1);
  }
  console.log(`seed/journey.json, brands.json, products.json (${productsSeed.products.length} sản phẩm), brand-book.json (${Object.keys(brandBookSeed.brands).length} hồ sơ thương hiệu) hợp lệ`);
  if (dryRun) return;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY (xem .env.example).");
    process.exit(1);
  }
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  await seedFlags(db, brandsSeed.feature_flags);
  const brandIdBySlug = await seedBrands(db, brandsRaw);
  await seedProducts(db, productsRaw, brandIdBySlug);
  await seedBrandProfiles(db, brandBookRaw);
  await seedJourney(db, journeyRaw, brandIdBySlug);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
