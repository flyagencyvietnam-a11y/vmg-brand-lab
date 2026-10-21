import type { JourneySeed } from "./schema";

// Số lượng theo spec Phụ lục G.1: sửa ở đây khi file nguồn chốt bản mới.
export const EXPECTED_JOURNEY_COUNTS = {
  stages: 5,
  lines: 5,
  nodes: 61,
  edges: 51,
  proposedEdges: 14,
} as const;

export type ExpectedCounts = Record<keyof typeof EXPECTED_JOURNEY_COUNTS, number>;

export type ValidateOptions = {
  expected?: ExpectedCounts;
  /** Danh sách slug thương hiệu hợp lệ (seed/brands.json). Bỏ qua kiểm tra nếu không truyền. */
  brandSlugs?: ReadonlySet<string>;
};

function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const v of values) {
    if (seen.has(v)) dup.add(v);
    seen.add(v);
  }
  return [...dup];
}

/** Kiểm tra theo spec G.5. Trả về danh sách lỗi (rỗng nếu hợp lệ). */
export function validateJourney(seed: JourneySeed, options: ValidateOptions = {}): string[] {
  const errors: string[] = [];
  const expected = options.expected ?? EXPECTED_JOURNEY_COUNTS;

  const stageKeys = new Set(seed.stages.map((s) => s.key));
  const lineKeys = new Set(seed.lines.map((l) => l.key));
  const nodeCodes = new Set(seed.nodes.map((n) => n.code));

  for (const d of duplicates(seed.stages.map((s) => s.key))) errors.push(`Trùng khóa chặng: ${d}`);
  for (const d of duplicates(seed.lines.map((l) => l.key))) errors.push(`Trùng khóa line: ${d}`);
  for (const d of duplicates(seed.nodes.map((n) => n.code))) errors.push(`Trùng mã ô: ${d}`);

  for (const node of seed.nodes) {
    if (!stageKeys.has(node.stage)) errors.push(`Ô ${node.code}: chặng không tồn tại (${node.stage})`);
    if (!lineKeys.has(node.line)) errors.push(`Ô ${node.code}: line không tồn tại (${node.line})`);
    for (const s of node.stage_span ?? []) {
      if (!stageKeys.has(s)) errors.push(`Ô ${node.code}: stage_span chứa chặng không tồn tại (${s})`);
    }
    if (node.lane !== undefined) {
      const line = seed.lines.find((l) => l.key === node.line);
      const laneKeys = new Set((line?.sublanes ?? []).map((l) => l.key));
      if (!laneKeys.has(node.lane)) errors.push(`Ô ${node.code}: cột con không tồn tại (${node.lane})`);
    }
    for (const field of ["attach_to", "row_hint", "same_product_as"] as const) {
      const ref = node[field];
      if (ref !== undefined && !nodeCodes.has(ref)) {
        errors.push(`Ô ${node.code}: ${field} trỏ tới ô không tồn tại (${ref})`);
      }
    }
    if (options.brandSlugs && node.brand_slug !== null && !options.brandSlugs.has(node.brand_slug)) {
      errors.push(`Ô ${node.code}: thương hiệu không có trong seed/brands.json (${node.brand_slug})`);
    }
  }

  for (const edge of seed.edges) {
    for (const end of [edge.from_code, edge.to_code]) {
      if (!nodeCodes.has(end)) {
        errors.push(`Đường nối ${edge.from_code} -> ${edge.to_code}: đầu mút không tồn tại (${end})`);
      }
    }
  }
  const edgeKeys = seed.edges.map((e) => `${e.from_code}>${e.to_code}:${e.kind}`);
  for (const d of duplicates(edgeKeys)) errors.push(`Trùng đường nối: ${d}`);

  const counts = {
    stages: seed.stages.length,
    lines: seed.lines.length,
    nodes: seed.nodes.length,
    edges: seed.edges.length,
    proposedEdges: seed.edges.filter((e) => e.proposed).length,
  };
  for (const key of Object.keys(counts) as (keyof typeof counts)[]) {
    if (counts[key] !== expected[key]) {
      errors.push(`Số ${key} là ${counts[key]}, spec G.1 yêu cầu ${expected[key]}`);
    }
  }

  return errors;
}
