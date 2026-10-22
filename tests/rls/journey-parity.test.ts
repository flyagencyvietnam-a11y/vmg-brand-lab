import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { brandsSeedSchema } from "@/lib/brands/schema";
import { toNode, todayVn, type NodeSourceRow } from "@/lib/journey/model";
import { buildJourneyRows } from "@/lib/journey/rows";
import { parseJourneySeed } from "@/lib/journey/schema";
import { buildSeedJourneyMap } from "@/lib/journey/seed-source";
import { applyMigrations, as, createUsers, seedAll, USERS } from "./helpers";

// Chế độ thử cục bộ dựng bản đồ từ seed bằng TypeScript; người dùng thật nhận kết quả từ view SQL.
// Hai đường này phải cho cùng một kết quả cho staff, nếu không chế độ thử sẽ nói dối về những gì staff thấy.

const root = resolve(import.meta.dirname, "../..");
const readJson = (file: string): unknown => JSON.parse(readFileSync(resolve(root, file), "utf8"));

let db: PGlite;

beforeAll(async () => {
  db = new PGlite();
  await applyMigrations(db);
  await createUsers(db);
  await seedAll(db);
  await db.exec(`
    update public.journey_stages set status = 'effective', effective_from = public.today_vn() - 1;
    update public.journey_lines set status = 'effective', effective_from = public.today_vn() - 1;
    update public.journey_nodes set status = 'effective', effective_from = public.today_vn() - 1;
  `);
});

afterAll(async () => {
  await db.close();
});

describe("seed (chế độ thử) tương đương view SQL cho staff", () => {
  const today = todayVn();
  const rows = buildJourneyRows(parseJourneySeed(readJson("seed/journey.json")));
  const brands = brandsSeedSchema.parse(readJson("seed/brands.json")).brands;
  const seedMap = buildSeedJourneyMap(rows, brands, "staff", today);

  it("cùng ngày hôm nay ở TypeScript và SQL", async () => {
    const res = await db.query<{ d: string }>(`select public.today_vn()::text as d`);
    expect(res.rows[0]!.d).toBe(today);
  });

  it("các ô giống nhau từng trường", async () => {
    const slugs = new Map(
      (await db.query<{ id: string; slug: string }>(`select id, slug from public.brands`)).rows.map((b) => [b.id, b.slug]),
    );
    const viewRows = await as(db, USERS.staff, async () =>
      (await db.query<Record<string, unknown>>(`select * from public.v_usable_journey_nodes order by sort`)).rows,
    );

    const fromView = viewRows.map((r) =>
      toNode(
        {
          ...r,
          brand_slug: r.brand_id ? (slugs.get(r.brand_id as string) ?? null) : null,
          commitment_confirmed: r.commitment_text != null,
        } as unknown as NodeSourceRow,
        "staff",
        today,
      ),
    );

    expect(fromView).toHaveLength(61);
    expect(fromView).toEqual(seedMap.nodes);
  });

  it("chặng và line giống nhau", async () => {
    const stages = await as(db, USERS.staff, async () =>
      (await db.query<Record<string, unknown>>(`select * from public.v_usable_journey_stages order by sort`)).rows,
    );
    expect(stages.map((s) => [s.key, s.age_label, s.title, s.lead_product, s.decider, s.outcomes, s.note ?? null])).toEqual(
      seedMap.stages.map((s) => [s.key, s.ageLabel, s.title, s.leadProduct, s.decider, s.outcomes, s.note]),
    );

    const lines = await as(db, USERS.staff, async () =>
      (await db.query<Record<string, unknown>>(`select * from public.v_usable_journey_lines order by sort`)).rows,
    );
    expect(lines.map((l) => [l.key, l.label, l.description, l.kind, l.sublanes])).toEqual(
      seedMap.lines.map((l) => [l.key, l.label, l.description, l.kind, l.sublanes]),
    );
  });

  it("đường nối giống nhau", async () => {
    const codes = new Map(
      (await db.query<{ id: string; code: string }>(`select id, code from public.journey_nodes`)).rows.map((n) => [n.id, n.code]),
    );
    const edges = await as(db, USERS.staff, async () =>
      (await db.query<Record<string, unknown>>(`select * from public.v_usable_journey_edges`)).rows,
    );
    const key = (e: { from: string; to: string; kind: string; label: string | null; proposed: boolean; twoWay: boolean }) =>
      JSON.stringify([e.from, e.to, e.kind, e.label, e.proposed, e.twoWay]);
    const fromView = edges
      .map((e) =>
        key({
          from: codes.get(e.from_node_id as string)!,
          to: codes.get(e.to_node_id as string)!,
          kind: e.kind as string,
          label: (e.label as string | null) ?? null,
          proposed: e.proposed as boolean,
          twoWay: e.two_way as boolean,
        }),
      )
      .sort();
    expect(fromView).toHaveLength(51);
    expect(fromView).toEqual(seedMap.edges.map(key).sort());
  });

  it("staff không thấy ghi chú chờ xác nhận, cam kết chưa xác nhận hay mốc chưa xác nhận", () => {
    for (const n of seedMap.nodes) {
      expect(n.verifyNote).toBeNull();
      expect(n.brandNote).toBeNull();
      expect(n.commitmentText).toBeNull();
      expect(n.timedNotes.every((t) => !t.needsConfirm)).toBe(true);
    }
  });

  it("editor thấy đủ ghi chú và cam kết", () => {
    const editorMap = buildSeedJourneyMap(rows, brands, "editor", today);
    const ie1 = editorMap.nodes.find((n) => n.code === "n20")!;
    expect(ie1.commitmentText).toBe("cam kết đầu ra từng cấp");
    expect(ie1.verifyNote).toContain("IE1 đến IE7");
    expect(editorMap.nodes.find((n) => n.code === "e01")!.brandNote).toContain("Q25");
  });
});
