import { describe, expect, it } from "vitest";
import { todayVn, type JourneyMap } from "@/lib/journey/model";
import { loadSeedJourneyMap } from "@/lib/journey/seed-source";
import {
  buildOverview,
  buildStageSections,
  lineShortName,
  mainLine,
  orderedLines,
  parallelLines,
  stageTransitions,
  type Block,
  type CardBlock,
  type LineSection,
  type PathBlock,
} from "@/lib/journey/views";

const map: JourneyMap = loadSeedJourneyMap("editor", todayVn());

const codes = (nodes: { code: string }[]) => nodes.map((n) => n.code);
const sections = (stage: string) => buildStageSections(map, stage);
const section = (stage: string, line: string): LineSection => sections(stage).find((s) => s.line.key === line)!;
const allBlocks = (s: LineSection): Block[] => s.lanes.flatMap((l) => l.blocks);

function blockNodes(b: Block): string[] {
  switch (b.kind) {
    case "path":
      return codes(b.nodes);
    case "goal":
      return [b.header.code, ...codes(b.products)];
    case "card":
      return [b.node.code, ...codes(b.duplicates)];
    default:
      return [b.node.code];
  }
}

describe("buildStageSections", () => {
  it("mỗi ô xuất hiện đúng một lần trên các trang chặng (không mất, không trùng)", () => {
    const seen = map.stages.flatMap((s) => sections(s.key).flatMap((sec) => sec.lanes.flatMap((l) => l.blocks.flatMap(blockNodes))));
    expect(seen).toHaveLength(61);
    expect(new Set(seen).size).toBe(61);
    expect(new Set(seen)).toEqual(new Set(map.nodes.map((n) => n.code)));
  });

  it("tiểu học (Line 1): một lộ trình theo đúng thứ tự, kèm cột mốc thi VMT xen giữa", () => {
    const blocks = allBlocks(section("s2", "l1"));
    expect(blocks).toHaveLength(1);
    const path = blocks[0] as PathBlock;
    expect(path.kind).toBe("path");
    expect(path.title).toBe("E-CONTENDER & E-GENIUS");
    expect(codes(path.nodes)).toEqual(["n04", "n05", "n06", "n07", "n08", "n09", "n10"]);
    expect(path.nodes.filter((n) => n.kind === "exam").map((n) => n.itemName)).toEqual(["Starters", "Movers", "Flyers"]);
  });

  it("chặng 16+ (Line 1): lộ trình NextGen, lộ trình IE1 đến IE7 rồi các sản phẩm bổ trợ", () => {
    const lanes = section("s4", "l1").lanes;
    expect(lanes.map((l) => l.lane?.key)).toEqual(["main", "parallel", "support"]);

    const support = lanes[2]!.blocks;
    expect(support.every((b) => b.kind === "card")).toBe(true);
    expect(support.flatMap(blockNodes)).toEqual(["n27", "n28", "n29"]);
    // IELTS EXAM FOCUS được vẽ hai lần ở nguồn nhưng là một sản phẩm: một thẻ, đi kèm hai cột mốc thi.
    expect(support).toHaveLength(2);
    const examFocus = support[1] as CardBlock;
    expect(codes(examFocus.duplicates)).toEqual(["n29"]);
    expect(codes(examFocus.attachedTo)).toEqual(["n15", "n19"]);
    expect(codes((support[0] as CardBlock).attachedTo)).toEqual(["n15"]);

    const main = lanes[0]!.blocks[0] as PathBlock;
    expect(codes(main.nodes)).toEqual(["n13", "n14", "n15", "n16", "n17", "n18", "n19"]);
    expect(main.title).toBe("NEXTGEN IELTS");

    const parallel = lanes[1]!.blocks[0] as PathBlock;
    expect(codes(parallel.nodes)).toEqual(["n20", "n21", "n22", "n23", "n24", "n25", "n26"]);
    expect(parallel.title).toBe("IELTS EXPRESS");
  });

  it("mầm non: tiêu đề chương trình B2G thành phần giới thiệu, ô cấp học là thẻ", () => {
    const b2g = section("s1", "b2g");
    expect(b2g.lanes[0]!.blocks[0]).toMatchObject({ kind: "intro", node: { code: "b00" } });
    expect(blockNodes(b2g.lanes[1]!.blocks[0]!)).toEqual(["b01"]);
  });

  it("ghi chú khoảng trống không bị coi là sản phẩm", () => {
    const ea = section("s1", "eacademy");
    expect(allBlocks(ea).map((b) => b.kind)).toEqual(["note"]);
  });

  it("tầng đích: bốn nhóm, mỗi nhóm kèm đúng sản phẩm", () => {
    const goals = allBlocks(section("s5", "goals"));
    expect(goals.map((g) => (g.kind === "goal" ? g.header.code : "?"))).toEqual(["gd1", "gd2", "gd3", "gd4"]);
    const byGroup = Object.fromEntries(goals.map((g) => (g.kind === "goal" ? [g.header.code, codes(g.products)] : [])));
    expect(byGroup).toEqual({ gd1: ["p01", "p02"], gd2: ["p03"], gd3: ["p04", "p05"], gd4: ["p06", "p07", "p08"] });
  });

  it("nhãn rẽ nhánh từ 18 tuổi thành banner", () => {
    expect(allBlocks(section("s5", "l1"))).toEqual([expect.objectContaining({ kind: "banner" })]);
  });

  it("e-Academy: các ô không nối thứ tự nên là thẻ riêng", () => {
    expect(allBlocks(section("s3", "eacademy")).every((b) => b.kind === "card")).toBe(true);
  });

  it("line chính hiện trước, tầng đích hiện cuối", () => {
    expect(sections("s5").map((s) => s.line.key)).toEqual(["l1", "goals"]);
    expect(orderedLines(map).map((l) => l.key)).toEqual(["l1", "eacademy", "b2g", "zh", "goals"]);
  });
});

describe("tổng quan và chuyển chặng", () => {
  it("line chính là ESL B2C, tên ngắn lấy từ nhãn nguồn", () => {
    expect(lineShortName(mainLine(map)!)).toBe("ESL B2C");
    expect(lineShortName(map.lines.find((l) => l.key === "eacademy")!)).toBe("VMG e-ACADEMY");
  });

  it("học xong chặng thì đi tiếp đâu (Line 1, dòng chính)", () => {
    const overview = buildOverview(map);
    expect(overview.map((o) => o.stage.key)).toEqual(["s1", "s2", "s3", "s4", "s5"]);
    expect(overview.map((o) => (o.next ? [o.next.from.code, o.next.to.code] : null))).toEqual([
      ["n03", "n04"],
      ["n10", "n11"],
      ["n12", "n13"],
      ["n19", "n30"],
      null,
    ]);
  });

  it("chặng cuối liệt kê bốn nhóm đích, các chặng khác thì không", () => {
    const overview = buildOverview(map);
    expect(overview[4]!.goals).toEqual(["NGHỀ GIÁO VÀ GIÁO VIÊN", "BẰNG CẤP VÀ CHỨNG CHỈ", "GIAO TIẾP VÀ CHUYÊN MÔN", "DU HỌC"]);
    expect(overview.slice(0, 4).every((o) => o.goals.length === 0)).toBe(true);
  });

  it("chặng 4-6 tuổi chỉ có Line 1 và B2G; chưa có sản phẩm online hay tiếng Trung", () => {
    const first = buildOverview(map)[0]!;
    expect(first.lines.map((l) => l.key).sort()).toEqual(["b2g", "l1"]);
    expect(first.gaps).toEqual([
      { line: "VMG e-ACADEMY", text: "Chưa có sản phẩm online cho lứa tuổi này" },
      { line: "TIẾNG TRUNG", text: "Chưa có sản phẩm tiếng Trung dưới 8 tuổi" },
    ]);
  });

  it("ba hướng học song song và các chặng chúng phủ", () => {
    const result = parallelLines(map).map((p) => [p.line.key, p.stages.map((s) => s.key)]);
    expect(result).toEqual([
      ["eacademy", ["s2", "s3", "s4"]],
      ["b2g", ["s1", "s2", "s3", "s4"]],
      ["zh", ["s2", "s3", "s4"]],
    ]);
  });

  it("chuyển chặng chỉ lấy đường nối thứ tự, không lấy liên kết đề xuất", () => {
    const t = stageTransitions(map);
    expect(t.every((x) => x.fromStage !== x.toStage)).toBe(true);
    expect(t.map((x) => `${x.from.code}>${x.to.code}`)).not.toContain("z03>z04");
    expect(t.map((x) => `${x.from.code}>${x.to.code}`)).toContain("b02>b03");
  });
});
