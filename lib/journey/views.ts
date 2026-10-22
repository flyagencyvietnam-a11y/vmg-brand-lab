import { vi } from "@/lib/i18n/vi";
import type { JourneyEdge, JourneyLine, JourneyMap, JourneyNode, JourneyStage } from "./model";

// Chuyển 61 ô và 51 đường nối thành các khối dễ đọc cho nhân viên: lộ trình theo bước, thẻ đơn,
// nhóm đích. Chỉ dùng cấu trúc đã có trong dữ liệu (đường nối `sequence`, `group_code`, `lane_key`);
// không thêm ô, không đổi thứ tự, không suy ra quan hệ mới (spec 6.1.1 "Không tự suy ra").

/** Tên ngắn của line để hiển thị: phần sau dấu chấm giữa của nhãn nguồn ("LINE 1 (CHÍNH) · ESL B2C" -> "ESL B2C"). */
export function lineShortName(line: JourneyLine): string {
  if (line.kind === "goal_tier") return vi.journey.goalLine;
  const parts = line.label.split(" · ");
  return parts[parts.length - 1] ?? line.label;
}

/** Line chính trước, rồi line phụ theo thứ tự nguồn, tầng đích cuối cùng. */
export function orderedLines(map: JourneyMap): JourneyLine[] {
  const rank = (l: JourneyLine) => (l.kind === "primary" ? 0 : l.kind === "secondary" ? 1 : 2);
  return [...map.lines].sort((a, b) => rank(a) - rank(b) || a.sort - b.sort);
}

/** Line chính của hành trình: line đầu tiên loại `primary` theo thứ tự nguồn (Line 1, ESL B2C). */
export function mainLine(map: JourneyMap): JourneyLine | undefined {
  return orderedLines(map).find((l) => l.kind === "primary");
}

export type PathBlock = {
  kind: "path";
  /** Tên sản phẩm của lộ trình (theo các ô cấp học; ô khảo thí không đặt tên). */
  title: string;
  brandSlug: string | null;
  nodes: JourneyNode[];
};
export type CardBlock = {
  kind: "card";
  node: JourneyNode;
  /** Ô cùng sản phẩm đã được gộp vào thẻ này (nguồn vẽ một sản phẩm nhiều lần, `same_product_as`). */
  duplicates: JourneyNode[];
  /** Các ô (cột mốc thi) mà sản phẩm đi kèm, theo `attach_to` của ô và các bản gộp. */
  attachedTo: JourneyNode[];
};
export type GoalBlock = { kind: "goal"; header: JourneyNode; products: JourneyNode[] };
export type IntroBlock = { kind: "intro"; node: JourneyNode };
export type NoteBlock = { kind: "note"; node: JourneyNode };
export type BannerBlock = { kind: "banner"; node: JourneyNode };
export type Block = PathBlock | CardBlock | GoalBlock | IntroBlock | NoteBlock | BannerBlock;

export type LaneSection = { lane: { key: string; label: string } | null; blocks: Block[] };
export type LineSection = { line: JourneyLine; lanes: LaneSection[] };

function hasSequence(edges: JourneyEdge[], from: string, to: string): boolean {
  return edges.some((e) => e.kind === "sequence" && e.from === from && e.to === to);
}

/** Chia các ô (đã sắp theo thứ tự nguồn) thành chuỗi nối tiếp bằng đường nối `sequence`. */
function chains(nodes: JourneyNode[], edges: JourneyEdge[]): JourneyNode[][] {
  const result: JourneyNode[][] = [];
  for (const node of nodes) {
    const last = result.at(-1);
    const tail = last?.at(-1);
    if (last && tail && hasSequence(edges, tail.code, node.code)) last.push(node);
    else result.push([node]);
  }
  return result;
}

function blocksFor(nodes: JourneyNode[], map: JourneyMap): Block[] {
  const edges = map.edges;
  const byCode = new Map(map.nodes.map((n) => [n.code, n]));
  const inCell = new Set(nodes.map((n) => n.code));

  // Gộp các ô cùng một sản phẩm (extra.same_product_as) vào ô gốc nếu ô gốc nằm cùng chỗ.
  const duplicatesOf = new Map<string, JourneyNode[]>();
  const kept = nodes.filter((n) => {
    const original = n.extra.same_product_as;
    if (!original || !inCell.has(original)) return true;
    duplicatesOf.set(original, [...(duplicatesOf.get(original) ?? []), n]);
    return false;
  });

  const blocks: Block[] = [];
  for (const chain of chains(kept, edges)) {
    if (chain.length === 1) {
      const node = chain[0]!;
      const duplicates = duplicatesOf.get(node.code) ?? [];
      const attachedTo = [node, ...duplicates]
        .flatMap((n) => (n.attachTo ? [byCode.get(n.attachTo)] : []))
        .filter((n): n is JourneyNode => n !== undefined);
      blocks.push({ kind: "card", node, duplicates, attachedTo });
      continue;
    }
    // Tên lộ trình lấy từ ô cấp học đầu tiên; ô khảo thí là cột mốc xen giữa, không đặt tên.
    const first = chain.find((n) => n.kind !== "exam") ?? chain[0]!;
    blocks.push({ kind: "path", title: first.productName, brandSlug: first.brandSlug, nodes: chain });
  }
  return blocks;
}

/** Nội dung một line trong một chặng. Trả về null nếu line không có ô nào trong chặng. */
export function buildLineSection(map: JourneyMap, line: JourneyLine, stageKey: string): LineSection | null {
  const nodes = map.nodes
    .filter((n) => n.lineKey === line.key && n.stageKey === stageKey)
    .sort((a, b) => a.sort - b.sort);
  if (nodes.length === 0) return null;

  // Tầng đích: mỗi nhóm đích kèm các sản phẩm của nhóm.
  if (line.kind === "goal_tier") {
    const goals: GoalBlock[] = nodes
      .filter((n) => n.kind === "goal_group")
      .map((header) => ({ kind: "goal", header, products: nodes.filter((n) => n.groupCode === header.code) }));
    return { line, lanes: [{ lane: null, blocks: goals }] };
  }

  const special: Block[] = [];
  const rest: JourneyNode[] = [];
  for (const n of nodes) {
    if (n.kind === "program_header") special.push({ kind: "intro", node: n });
    else if (n.kind === "gap_note") special.push({ kind: "note", node: n });
    else if (n.kind === "branch_label") special.push({ kind: "banner", node: n });
    else rest.push(n);
  }

  const laneDefs = line.sublanes.length > 0 ? line.sublanes : [];
  const lanes: LaneSection[] = [];
  if (laneDefs.length > 0) {
    for (const def of laneDefs) {
      const inLane = rest.filter((n) => n.laneKey === def.key);
      if (inLane.length > 0) lanes.push({ lane: def, blocks: blocksFor(inLane, map) });
    }
    // Ô không thuộc cột con nào vẫn phải hiện.
    const known = new Set(laneDefs.map((d) => d.key));
    const orphans = rest.filter((n) => n.laneKey === null || !known.has(n.laneKey));
    if (orphans.length > 0) lanes.push({ lane: null, blocks: blocksFor(orphans, map) });
  } else if (rest.length > 0) {
    lanes.push({ lane: null, blocks: blocksFor(rest, map) });
  }

  // Cột con có lộ trình dài nhất đặt trước (cùng độ dài thì giữ thứ tự nguồn); cột chỉ có thẻ đặt sau.
  const weight = (l: LaneSection) => Math.max(0, ...l.blocks.map((b) => (b.kind === "path" ? b.nodes.length : 0)));
  lanes.sort((a, b) => weight(b) - weight(a));

  // Tiêu đề chương trình, ghi chú khoảng trống và nhãn rẽ nhánh đặt lên đầu.
  if (special.length > 0) lanes.unshift({ lane: null, blocks: special });
  return { line, lanes };
}

export function buildStageSections(map: JourneyMap, stageKey: string): LineSection[] {
  return orderedLines(map)
    .map((line) => buildLineSection(map, line, stageKey))
    .filter((s): s is LineSection => s !== null);
}

export type Transition = { line: JourneyLine; from: JourneyNode; to: JourneyNode; fromStage: string; toStage: string };

/** Đường nối thứ tự đi từ chặng này sang chặng khác: "học xong thì đi tiếp đâu". */
export function stageTransitions(map: JourneyMap): Transition[] {
  const byCode = new Map(map.nodes.map((n) => [n.code, n]));
  const lines = new Map(map.lines.map((l) => [l.key, l]));
  const result: Transition[] = [];
  for (const e of map.edges) {
    if (e.kind !== "sequence") continue;
    const from = byCode.get(e.from);
    const to = byCode.get(e.to);
    if (!from || !to || from.stageKey === to.stageKey) continue;
    const line = lines.get(from.lineKey);
    if (line) result.push({ line, from, to, fromStage: from.stageKey, toStage: to.stageKey });
  }
  return result;
}

export function nodeLabel(node: JourneyNode): string {
  return [node.productName, node.itemName].filter(Boolean).join(" · ");
}

export type OverviewStage = {
  stage: JourneyStage;
  /** Tên ngắn của các line có nội dung ở chặng này. */
  lines: { key: string; name: string }[];
  /** Với chặng cuối: các nhóm đích. */
  goals: string[];
  /** Ghi chú khoảng trống của nguồn (ví dụ chưa có sản phẩm online cho lứa tuổi này). */
  gaps: { line: string; text: string }[];
  /** Đường nối của line chính sang chặng kế tiếp. */
  next: Transition | null;
};

export function buildOverview(map: JourneyMap): OverviewStage[] {
  const transitions = stageTransitions(map);
  const lines = orderedLines(map);
  const main = mainLine(map);
  const lineName = new Map(map.lines.map((l) => [l.key, lineShortName(l)]));
  return [...map.stages]
    .sort((a, b) => a.sort - b.sort)
    .map((stage) => ({
      stage,
      lines: lines
        .filter(
          (l) =>
            l.kind !== "goal_tier" &&
            map.nodes.some((n) => n.stageKey === stage.key && n.lineKey === l.key && n.kind !== "gap_note"),
        )
        .map((l) => ({ key: l.key, name: lineShortName(l) })),
      goals: map.nodes.filter((n) => n.stageKey === stage.key && n.kind === "goal_group").map((n) => n.productName),
      gaps: map.nodes
        .filter((n) => n.stageKey === stage.key && n.kind === "gap_note")
        .map((n) => ({ line: lineName.get(n.lineKey) ?? "", text: n.productName })),
      next:
        transitions.find((t) => t.fromStage === stage.key && t.line.key === main?.key && t.from.laneKey === "main") ?? null,
    }));
}

/** Các hướng học chạy song song với line chính (online, trường học, tiếng Trung) và các chặng mà chúng phủ. */
export function parallelLines(map: JourneyMap): { line: JourneyLine; stages: JourneyStage[] }[] {
  const main = mainLine(map);
  return orderedLines(map)
    .filter((l) => l.kind !== "goal_tier" && l.key !== main?.key)
    .map((line) => ({
      line,
      stages: [...map.stages]
        .sort((a, b) => a.sort - b.sort)
        .filter((s) => map.nodes.some((n) => n.lineKey === line.key && n.stageKey === s.key && n.kind !== "gap_note")),
    }));
}
