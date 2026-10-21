import type { JourneySeed } from "./schema";

// Ánh xạ journey.json sang dòng của bảng journey_* (migration 20261021000002).
// Không điền status/effective_*: cột mặc định 'proposed' (spec G.5) và seed lại không ghi đè
// trạng thái đã được xác nhận.

export type StageRow = {
  key: string;
  age_label: string;
  title: string;
  lead_product: string | null;
  decider: string;
  outcomes: string[];
  note: string | null;
  sort: number;
};

export type LineRow = {
  key: string;
  label: string;
  description: string;
  kind: "primary" | "secondary" | "goal_tier";
  color_proposed: string | null;
  sublanes: { key: string; label: string }[];
  sort: number;
};

export type NodeRow = {
  code: string;
  line_key: string;
  stage_key: string;
  lane_key: string | null;
  kind: string;
  brand_slug: string | null;
  product_name: string;
  item_name: string | null;
  duration_text: string | null;
  commitment_text: string | null;
  description: string | null;
  group_code: string | null;
  stage_span: string[] | null;
  attach_to: string | null;
  row_hint: string | null;
  timed_notes: unknown[];
  brand_confirmed: boolean;
  decision_pending: boolean;
  verify_note: string | null;
  brand_note: string | null;
  extra: Record<string, string>;
  sort: number;
};

export type EdgeRow = {
  from_code: string;
  to_code: string;
  kind: string;
  label: string | null;
  proposed: boolean;
  two_way: boolean;
};

export type NodeProductRow = {
  node_code: string;
  product_code_hint: string;
};

export type JourneyRows = {
  meta: Record<string, unknown>;
  stages: StageRow[];
  lines: LineRow[];
  nodes: NodeRow[];
  edges: EdgeRow[];
  nodeProducts: NodeProductRow[];
};

// File nguồn gộp cam kết đầu ra vào duration_text sau dấu chấm giữa ("3 tháng, 36 giờ · cam kết đầu ra từng cấp").
// Tách riêng để view chỉ hiện cam kết khi R&D đã xác nhận (spec 6.1.1, Q23). Ghép lại bằng " · " ra đúng văn bản gốc.
const COMMITMENT_SEPARATOR = " · ";

export function splitCommitment(durationText: string | null): { duration_text: string | null; commitment_text: string | null } {
  if (durationText === null) return { duration_text: null, commitment_text: null };
  const at = durationText.indexOf(COMMITMENT_SEPARATOR + "cam kết");
  if (at === -1) return { duration_text: durationText, commitment_text: null };
  return {
    duration_text: durationText.slice(0, at),
    commitment_text: durationText.slice(at + COMMITMENT_SEPARATOR.length),
  };
}

export function buildJourneyRows(seed: JourneySeed): JourneyRows {
  const stages = seed.stages.map<StageRow>((s) => ({
    key: s.key,
    age_label: s.age_label,
    title: s.title,
    lead_product: s.lead_product,
    decider: s.decider,
    outcomes: s.outcomes,
    note: s.note ?? null,
    sort: s.sort,
  }));

  const lines = seed.lines.map<LineRow>((l) => ({
    key: l.key,
    label: l.label,
    description: l.description,
    kind: l.kind,
    color_proposed: l.color_proposed ?? null,
    sublanes: l.sublanes ?? [],
    sort: l.sort,
  }));

  const nodes = seed.nodes.map<NodeRow>((n, index) => {
    const extra: Record<string, string> = {};
    if (n.program !== undefined) extra.program = n.program;
    if (n.same_product_as !== undefined) extra.same_product_as = n.same_product_as;
    if (n.name_note !== undefined) extra.name_note = n.name_note;
    return {
      code: n.code,
      line_key: n.line,
      stage_key: n.stage,
      lane_key: n.lane ?? null,
      kind: n.kind,
      brand_slug: n.brand_slug,
      product_name: n.product_name,
      item_name: n.item_name,
      ...splitCommitment(n.duration_text),
      description: n.description,
      group_code: n.group ?? null,
      stage_span: n.stage_span ?? null,
      attach_to: n.attach_to ?? null,
      row_hint: n.row_hint ?? null,
      timed_notes: n.timed_notes ?? [],
      brand_confirmed: n.brand_confirmed,
      decision_pending: n.decision_pending ?? false,
      verify_note: n.verify_note ?? null,
      brand_note: n.brand_note ?? null,
      extra,
      // Thứ tự mảng của file nguồn là thứ tự hiển thị.
      sort: index + 1,
    };
  });

  const edges = seed.edges.map<EdgeRow>((e) => ({
    from_code: e.from_code,
    to_code: e.to_code,
    kind: e.kind,
    label: e.label ?? null,
    proposed: e.proposed,
    two_way: e.two_way,
  }));

  const nodeProducts = seed.nodes.flatMap<NodeProductRow>((n) =>
    n.product_code_hints.map((hint) => ({ node_code: n.code, product_code_hint: hint })),
  );

  return { meta: seed.meta, stages, lines, nodes, edges, nodeProducts };
}

/** Thay brand_slug bằng brand_id. Báo lỗi nếu slug chưa có trong bảng brands. */
export function withBrandIds(
  nodes: NodeRow[],
  brandIdBySlug: ReadonlyMap<string, string>,
): (Omit<NodeRow, "brand_slug"> & { brand_id: string | null })[] {
  return nodes.map(({ brand_slug, ...rest }) => {
    if (brand_slug === null) return { ...rest, brand_id: null };
    const id = brandIdBySlug.get(brand_slug);
    if (!id) throw new Error(`Ô ${rest.code}: chưa có thương hiệu '${brand_slug}' trong bảng brands`);
    return { ...rest, brand_id: id };
  });
}

/** Thay from_code, to_code bằng id ô. */
export function withNodeIds(
  edges: EdgeRow[],
  nodeIdByCode: ReadonlyMap<string, string>,
): { from_node_id: string; to_node_id: string; kind: string; label: string | null; proposed: boolean; two_way: boolean }[] {
  return edges.map((e) => {
    const from = nodeIdByCode.get(e.from_code);
    const to = nodeIdByCode.get(e.to_code);
    if (!from || !to) throw new Error(`Đường nối ${e.from_code} -> ${e.to_code}: thiếu ô trong bảng journey_nodes`);
    return { from_node_id: from, to_node_id: to, kind: e.kind, label: e.label, proposed: e.proposed, two_way: e.two_way };
  });
}
