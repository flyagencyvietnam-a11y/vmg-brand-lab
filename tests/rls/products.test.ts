import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { applyMigrations, as, count, createUsers, seedAll, USERS } from "./helpers";

// products dùng RLS products_select_usable (đã có từ migration 1); v_usable_journey_node_products là view mới.

let db: PGlite;

beforeAll(async () => {
  db = new PGlite();
  await applyMigrations(db);
  await createUsers(db);
  await seedAll(db);
});

afterAll(async () => {
  await db.close();
});

describe("danh mục sản phẩm và RLS", () => {
  it("nạp đủ 44 sản phẩm ở trạng thái draft, đủ cột mới", async () => {
    expect(await count(db, "public.products")).toBe(44);
    const r = await db.query<{ n: number }>(
      `select count(*)::int as n from public.products where status = 'draft' and slug is not null and group_name is not null`,
    );
    expect(r.rows[0]!.n).toBe(44);
  });

  it("staff không thấy sản phẩm chưa phát hành, editor thấy hết", async () => {
    expect(await as(db, USERS.staff, () => count(db, "public.products"))).toBe(0);
    expect(await as(db, USERS.editor, () => count(db, "public.products"))).toBe(44);
  });

  it("phát hành thì staff thấy; cờ brand_confirmed đi cùng", async () => {
    await db.exec(`update public.products set status = 'effective', effective_from = public.today_vn() - 1`);
    expect(await as(db, USERS.staff, () => count(db, "public.products"))).toBe(44);
    const unconfirmed = await as(
      db,
      USERS.staff,
      async () =>
        (await db.query<{ n: number }>(`select count(*)::int as n from public.products where brand_confirmed = false`)).rows[0]!.n,
    );
    expect(unconfirmed).toBeGreaterThan(0);
  });

  it("view mã gợi ý: staff chỉ thấy của ô đã phát hành, khách chưa đăng nhập không thấy", async () => {
    expect(await as(db, USERS.staff, () => count(db, "public.v_usable_journey_node_products"))).toBe(0);
    await db.exec(`update public.journey_nodes set status = 'effective', effective_from = public.today_vn() - 1`);
    const staff = await as(db, USERS.staff, () => count(db, "public.v_usable_journey_node_products"));
    expect(staff).toBe(await count(db, "public.journey_node_products"));
    const anon = await as(db, null, async () => {
      try {
        await db.query(`select 1 from public.v_usable_journey_node_products`);
        return "ok";
      } catch {
        return "denied";
      }
    });
    expect(anon).toBe("denied");
  });
});

describe("Hồ sơ thương hiệu (Brand Book) và RLS", () => {
  it("nạp hồ sơ cho 10 thương hiệu", async () => {
    const r = await db.query<{ n: number }>(
      `select count(*)::int as n from public.brands where profile <> '{}'::jsonb and role_summary is not null`,
    );
    expect(r.rows[0]!.n).toBe(10);
  });

  it("hồ sơ theo cổng phát hành của brands: staff chưa thấy khi còn draft, thấy khi đã phát hành", async () => {
    await db.exec(`update public.brands set release_status = 'draft', effective_from = null`);
    expect(await as(db, USERS.staff, () => count(db, "public.brands"))).toBe(0);
    await db.exec(`update public.brands set release_status = 'effective', effective_from = public.today_vn() - 1`);
    const withProfile = await as(
      db,
      USERS.staff,
      async () => (await db.query<{ n: number }>(`select count(*)::int as n from public.brands where profile <> '{}'::jsonb`)).rows[0]!.n,
    );
    expect(withProfile).toBe(10);
  });
});
