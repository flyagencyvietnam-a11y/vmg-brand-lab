import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { brandsSeedSchema, buildBrandRows } from "@/lib/brands/schema";
import { parseJourneySeed, type JourneySeed } from "@/lib/journey/schema";
import { buildJourneyRows, withBrandIds, withNodeIds } from "@/lib/journey/rows";
import { EXPECTED_JOURNEY_COUNTS, validateJourney } from "@/lib/journey/validate";

const root = resolve(import.meta.dirname, "../..");
const read = (file: string): unknown => JSON.parse(readFileSync(resolve(root, file), "utf8"));

const brands = brandsSeedSchema.parse(read("seed/brands.json"));
const brandSlugs = new Set(brands.brands.map((b) => b.slug));
const loadSeed = (): JourneySeed => parseJourneySeed(read("seed/journey.json"));

describe("seed/journey.json", () => {
  it("khớp số lượng spec G.1: 61 ô, 5 chặng, 5 line, 51 đường nối, 14 đề xuất", () => {
    const seed = loadSeed();
    expect(seed.nodes).toHaveLength(61);
    expect(seed.stages).toHaveLength(5);
    expect(seed.lines).toHaveLength(5);
    expect(seed.edges).toHaveLength(51);
    expect(seed.edges.filter((e) => e.proposed)).toHaveLength(14);
    expect(EXPECTED_JOURNEY_COUNTS).toEqual({ stages: 5, lines: 5, nodes: 61, edges: 51, proposedEdges: 14 });
  });

  it("khớp phân loại đường nối ở G.1", () => {
    const byKind = new Map<string, number>();
    for (const e of loadSeed().edges) byKind.set(e.kind, (byKind.get(e.kind) ?? 0) + 1);
    expect(Object.fromEntries(byKind)).toEqual({
      sequence: 32,
      side: 3,
      side_group: 1,
      branch: 3,
      b2g_link: 4,
      ea_link: 3,
      same_program: 2,
      zh_link: 3,
    });
  });

  it("hợp lệ theo G.5 và mọi brand_slug có trong seed/brands.json", () => {
    expect(validateJourney(loadSeed(), { brandSlugs })).toEqual([]);
  });

  it("ô chưa chắc chắn mang cờ đúng như spec 6.1.1", () => {
    const nodes = loadSeed().nodes;
    expect(nodes.filter((n) => n.decision_pending).map((n) => n.code)).toEqual(["z01", "z02", "z03"]);
    expect(nodes.filter((n) => n.line === "eacademy" && n.kind === "level").every((n) => !n.brand_confirmed)).toBe(true);
    expect(nodes.filter((n) => n.line === "b2g").every((n) => !n.brand_confirmed)).toBe(true);
  });
});

describe("validateJourney", () => {
  it("báo trùng mã ô", () => {
    const seed = loadSeed();
    seed.nodes.push({ ...seed.nodes[0]! });
    expect(validateJourney(seed).some((e) => e.includes("Trùng mã ô: n01"))).toBe(true);
  });

  it("báo đường nối trỏ tới ô không tồn tại", () => {
    const seed = loadSeed();
    seed.edges.push({ from_code: "n01", to_code: "zzz", kind: "sequence", proposed: false, two_way: false });
    expect(validateJourney(seed).some((e) => e.includes("đầu mút không tồn tại (zzz)"))).toBe(true);
  });

  it("báo sai số lượng", () => {
    const seed = loadSeed();
    seed.edges.pop();
    expect(validateJourney(seed).some((e) => e.includes("Số edges là 50"))).toBe(true);
  });

  it("báo thương hiệu chưa có trong seed", () => {
    const seed = loadSeed();
    expect(validateJourney(seed, { brandSlugs: new Set(["vmg"]) }).some((e) => e.includes("không có trong seed/brands.json"))).toBe(true);
  });

  it("báo chặng và cột con không tồn tại", () => {
    const seed = loadSeed();
    seed.nodes[0] = { ...seed.nodes[0]!, stage: "s9", lane: "nope" };
    const errors = validateJourney(seed);
    expect(errors.some((e) => e.includes("chặng không tồn tại (s9)"))).toBe(true);
    expect(errors.some((e) => e.includes("cột con không tồn tại (nope)"))).toBe(true);
  });
});

describe("parseJourneySeed", () => {
  it("từ chối khóa lạ để không mất dữ liệu nguồn", () => {
    const raw = read("seed/journey.json") as { nodes: Record<string, unknown>[] };
    raw.nodes[0]!.unexpected = true;
    expect(() => parseJourneySeed(raw)).toThrow();
  });
});

describe("buildJourneyRows", () => {
  const seed = loadSeed();
  const rows = buildJourneyRows(seed);

  it("giữ nguyên văn các trường chữ của file nguồn", () => {
    seed.nodes.forEach((n, i) => {
      const row = rows.nodes[i]!;
      expect(row.code).toBe(n.code);
      expect(row.product_name).toBe(n.product_name);
      expect(row.item_name).toBe(n.item_name);
      expect(row.duration_text).toBe(n.duration_text);
      expect(row.description).toBe(n.description);
      expect(row.verify_note).toBe(n.verify_note ?? null);
      expect(row.brand_note).toBe(n.brand_note ?? null);
    });
  });

  it("giữ các trường chưa có cột riêng trong extra", () => {
    const byCode = new Map(rows.nodes.map((n) => [n.code, n]));
    expect(byCode.get("b01")!.extra).toEqual({ program: "ENHANCED ENGLISH" });
    expect(byCode.get("n29")!.extra).toEqual({ same_product_as: "n28" });
    expect(byCode.get("p08")!.extra).toEqual({ name_note: "Cách gọi công khai là Du học nghề" });
    expect(byCode.get("e03")!.stage_span).toEqual(["s3", "s4"]);
  });

  it("giữ mốc thời gian chưa xác nhận để view ẩn đi", () => {
    const p04 = rows.nodes.find((n) => n.code === "p04")!;
    expect(p04.timed_notes).toEqual([
      { text: "Bán chung một nhóm từ quý 4/2026", valid_from: "2026-10-01", valid_to: null, needs_confirm: true },
    ]);
  });

  it("tạo mã sản phẩm gợi ý cho từng ô", () => {
    const total = seed.nodes.reduce((sum, n) => sum + n.product_code_hints.length, 0);
    expect(rows.nodeProducts).toHaveLength(total);
    expect(rows.nodeProducts.filter((p) => p.node_code === "p02").map((p) => p.product_code_hint)).toEqual([
      "TESOL_120H",
      "TESOL_140H",
      "TESOL_EPATH",
    ]);
  });

  it("withBrandIds báo lỗi khi thiếu thương hiệu", () => {
    expect(() => withBrandIds(rows.nodes, new Map())).toThrow(/chưa có thương hiệu/);
  });

  it("withNodeIds báo lỗi khi thiếu ô", () => {
    expect(() => withNodeIds(rows.edges, new Map())).toThrow(/thiếu ô/);
  });
});

describe("seed/brands.json", () => {
  const rows = buildBrandRows(brands);

  it("có đủ 10 thương hiệu của Phụ lục A.1", () => {
    expect(rows.map((b) => b.row.slug)).toEqual([
      "vmg", "vmg-english", "vmg-ielts", "vmg-tesol", "vmg-chinese",
      "vmp", "uplearn", "edunext", "vmg-e-academy", "vmt",
    ]);
  });

  it("chỉ e-Academy ở trạng thái đề xuất và chưa xác nhận", () => {
    const proposed = rows.filter((b) => b.release_status === "proposed").map((b) => b.row.slug);
    expect(proposed).toEqual(["vmg-e-academy"]);
    expect(rows.filter((b) => !b.row.confirmed).map((b) => b.row.slug)).toEqual(["vmg-e-academy"]);
  });

  it("chỉ dùng mã màu chính thức đã nêu ở spec (TESOL, VMP, VMG)", () => {
    const colors = Object.fromEntries(
      rows.filter((b) => b.row.color_primary).map((b) => [b.row.slug, [b.row.color_primary, b.row.color_secondary]]),
    );
    expect(colors["vmg-tesol"]).toEqual(["#012A9E", null]);
    expect(colors["vmp"]).toEqual(["#29338D", "#F69220"]);
    expect(colors["uplearn"]).toBeUndefined();
    expect(colors["edunext"]).toBeUndefined();
    expect(colors["vmg-e-academy"]).toBeUndefined();
  });

  it("thương hiệu thành viên có thương hiệu mẹ là vmg", () => {
    for (const { row, parent_slug } of rows) expect(parent_slug).toBe(row.kind === "member" ? "vmg" : null);
  });
});
