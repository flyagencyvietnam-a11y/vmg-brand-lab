import type { JourneyEdge, JourneyLine, JourneyMap, JourneyNode, JourneyStage } from "./model";
import { lineShortName } from "./views";

// Bố cục bản đồ toàn cảnh (poster hành trình): hàng là chặng tuổi, cột là line (và cột con của line). Chỉ dùng cấu trúc
// đã có trong dữ liệu (line, lane, stage, sort, đường nối); không thêm ô, không suy ra quan hệ mới (spec 6.1.1).
// Tầng đích (line `goal_tier`) không có cột: các nhóm đích nằm thành một khối trải ngang ở chặng cuối.

export type MapColumn = { key: string; lineKey: string; laneKey: string | null; laneLabel: string | null };
export type MapLineHeader = { lineKey: string; label: string; short: string; description: string | null; span: number };
export type GoalGroup = { header: JourneyNode; products: JourneyNode[] };

export type MapLayout = {
  stages: JourneyStage[];
  columns: MapColumn[];
  lineHeaders: MapLineHeader[];
  /** Ô theo chặng và cột, sắp theo thứ tự nguồn. Khóa: cellKey(stageKey, columnKey). */
  cells: Map<string, JourneyNode[]>;
  goalStageKey: string | null;
  goalGroups: GoalGroup[];
  edges: JourneyEdge[];
  /** Mọi ô có mặt trên bản đồ, kể cả ô trong nhóm đích. */
  nodes: JourneyNode[];
};

export const cellKey = (stageKey: string, columnKey: string): string => `${stageKey}|${columnKey}`;

const columnKeyOf = (line: JourneyLine, lane: string | null) => (lane ? `${line.key}:${lane}` : line.key);

export function buildMapLayout(map: JourneyMap): MapLayout {
  const stages = [...map.stages].sort((a, b) => a.sort - b.sort);
  const lines = [...map.lines].sort((a, b) => a.sort - b.sort);
  const goalLine = lines.find((l) => l.kind === "goal_tier") ?? null;

  const columns: MapColumn[] = [];
  const lineHeaders: MapLineHeader[] = [];
  const cells = new Map<string, JourneyNode[]>();

  for (const line of lines) {
    if (line.kind === "goal_tier") continue;
    const nodes = map.nodes.filter((n) => n.lineKey === line.key);
    if (nodes.length === 0) continue;

    const defs = line.sublanes.length > 0 ? line.sublanes : [{ key: "", label: "" }];
    const first = defs[0]!.key;
    const known = new Set(defs.map((d) => d.key));
    const used = new Map<string, JourneyNode[]>();
    for (const n of nodes) {
      // Ô không thuộc cột con nào vẫn phải hiện: xếp vào cột con đầu tiên.
      const lane = n.laneKey && known.has(n.laneKey) ? n.laneKey : first;
      used.set(lane, [...(used.get(lane) ?? []), n]);
    }
    let span = 0;
    for (const def of defs) {
      const inLane = used.get(def.key);
      if (!inLane) continue;
      const lane = def.key === "" ? null : def.key;
      const col: MapColumn = { key: columnKeyOf(line, lane), lineKey: line.key, laneKey: lane, laneLabel: lane ? def.label : null };
      columns.push(col);
      span += 1;
      for (const n of inLane) {
        const k = cellKey(n.stageKey, col.key);
        cells.set(k, [...(cells.get(k) ?? []), n]);
      }
    }
    lineHeaders.push({ lineKey: line.key, label: line.label, short: lineShortName(line), description: line.description, span });
  }
  for (const list of cells.values()) list.sort((a, b) => a.sort - b.sort);

  const goalNodes = goalLine ? map.nodes.filter((n) => n.lineKey === goalLine.key).sort((a, b) => a.sort - b.sort) : [];
  const goalGroups: GoalGroup[] = goalNodes
    .filter((n) => n.kind === "goal_group")
    .map((header) => ({ header, products: goalNodes.filter((n) => n.groupCode === header.code) }));
  const goalStageKey = goalNodes[0]?.stageKey ?? null;

  const placed = new Set<string>();
  for (const list of cells.values()) for (const n of list) placed.add(n.code);
  for (const n of goalNodes) placed.add(n.code);
  const nodes = map.nodes.filter((n) => placed.has(n.code));

  return { stages, columns, lineHeaders, cells, goalStageKey, goalGroups, edges: map.edges, nodes };
}

/** Các đường nối chạm vào một ô, kèm ô ở đầu kia và chiều đi. */
export function edgesOf(layout: MapLayout, code: string): { edge: JourneyEdge; other: string; outgoing: boolean }[] {
  return layout.edges
    .filter((e) => e.from === code || e.to === code)
    .map((edge) => ({ edge, other: edge.from === code ? edge.to : edge.from, outgoing: edge.from === code }));
}
