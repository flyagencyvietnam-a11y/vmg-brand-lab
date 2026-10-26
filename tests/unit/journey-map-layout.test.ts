import { describe, expect, it } from "vitest";
import { allLooks, nodeLook } from "@/lib/design/journey-palette";
import { contrastRatio } from "@/lib/design/contrast";
import { edgePath } from "@/lib/journey/map-edges";
import { buildMapLayout, cellKey, edgesOf } from "@/lib/journey/map-layout";
import { loadSeedJourneyMap } from "@/lib/journey/seed-source";

const map = loadSeedJourneyMap("editor", "2026-10-26");
const layout = buildMapLayout(map);

describe("bố cục bản đồ toàn cảnh", () => {
  it("đặt đủ 61 ô, mỗi ô đúng một lần", () => {
    expect(layout.nodes).toHaveLength(map.nodes.length);
    const inCells = [...layout.cells.values()].flat().map((n) => n.code);
    const inGoals = layout.goalGroups.flatMap((g) => [g.header.code, ...g.products.map((p) => p.code)]);
    const all = [...inCells, ...inGoals];
    expect(new Set(all).size).toBe(all.length);
    expect(all.sort()).toEqual(map.nodes.map((n) => n.code).sort());
  });

  it("cột theo thứ tự poster: B2G, ba cột con của ESL B2C, e-Academy, Tiếng Trung", () => {
    expect(layout.columns.map((c) => c.key)).toEqual(["b2g", "l1:support", "l1:main", "l1:parallel", "eacademy", "zh"]);
    expect(layout.lineHeaders.map((h) => [h.lineKey, h.span])).toEqual([
      ["b2g", 1],
      ["l1", 3],
      ["eacademy", 1],
      ["zh", 1],
    ]);
  });

  it("tầng đích có 4 nhóm ở chặng cuối, mọi sản phẩm đích thuộc một nhóm", () => {
    expect(layout.goalGroups).toHaveLength(4);
    expect(layout.goalStageKey).toBe(layout.stages.at(-1)!.key);
    expect(layout.goalGroups.reduce((n, g) => n + g.products.length, 0)).toBe(map.nodes.filter((n) => n.lineKey === "goals" && n.kind !== "goal_group").length);
  });

  it("giữ cả 51 đường nối và hai đầu đều là ô trên bản đồ", () => {
    expect(layout.edges).toHaveLength(map.edges.length);
    const codes = new Set(layout.nodes.map((n) => n.code));
    for (const e of layout.edges) {
      expect(codes.has(e.from), e.from).toBe(true);
      expect(codes.has(e.to), e.to).toBe(true);
    }
  });

  it("ô trong cùng chặng và cột được sắp theo thứ tự nguồn", () => {
    const cell = layout.cells.get(cellKey("s1", "l1:main"));
    expect(cell?.map((n) => n.sort)).toEqual([...(cell ?? [])].map((n) => n.sort).sort((a, b) => a - b));
  });

  it("liệt kê đường nối của một ô theo cả hai chiều", () => {
    const links = edgesOf(layout, "n15");
    expect(links.some((l) => !l.outgoing)).toBe(true);
    expect(links.every((l) => l.other !== "n15")).toBe(true);
  });
});

describe("màu thẻ", () => {
  it.each(allLooks().filter((l) => l.look.bg !== "transparent"))("chữ trên nền $name đạt 4,5:1", ({ look }) => {
    expect(contrastRatio(look.fg, look.bg)).toBeGreaterThanOrEqual(4.5);
  });

  it("mọi ô đều có màu", () => {
    for (const n of layout.nodes) expect(nodeLook(n).fg).toBeTruthy();
  });

  it("chữ trắng trên màu tiêu đề của các line đạt 4,5:1", async () => {
    const { LINE_COLORS } = await import("@/lib/design/journey-palette");
    for (const hex of Object.values(LINE_COLORS)) expect(contrastRatio("#ffffff", hex)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("đường nối", () => {
  const a = { x: 0, y: 0, w: 100, h: 40 };
  it("B nằm dưới A: đi từ đáy A tới đỉnh B", () => {
    expect(edgePath(a, { x: 200, y: 140, w: 100, h: 40 })).toMatch(/^M50,40 C50,90 250,90 250,140$/);
  });
  it("B nằm trên A: đi từ đỉnh A tới đáy B", () => {
    expect(edgePath({ x: 0, y: 200, w: 100, h: 40 }, { x: 0, y: 0, w: 100, h: 40 })).toMatch(/^M50,200 C50,120 50,120 50,40$/);
  });
  it("hai ô ngang hàng: đi từ cạnh bên", () => {
    expect(edgePath(a, { x: 200, y: 5, w: 100, h: 40 })).toMatch(/^M100,20 C150,20 150,25 200,25$/);
    expect(edgePath({ x: 200, y: 5, w: 100, h: 40 }, a)).toMatch(/^M200,25 C150,25 150,20 100,20$/);
  });
});
