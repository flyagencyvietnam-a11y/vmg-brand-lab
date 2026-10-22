// Mô hình hành trình dùng cho giao diện. Hai nguồn (Supabase, seed thử cục bộ) đều đi qua các hàm
// chuyển đổi ở đây để hình dạng dữ liệu và quy tắc ẩn hiện chỉ có một bản.

export type Audience = "staff" | "editor";

export type JourneyBrand = {
  slug: string;
  name: string;
  /** Chỉ có khi mã màu đã chính thức (TESOL, VMP, VMG...). Không tự suy ra màu. */
  colorPrimary: string | null;
  confirmed: boolean;
};

export type JourneyStage = {
  key: string;
  ageLabel: string;
  title: string;
  leadProduct: string | null;
  decider: string | null;
  outcomes: string[];
  note: string | null;
  sort: number;
};

export type JourneyLine = {
  key: string;
  label: string;
  description: string | null;
  kind: "primary" | "secondary" | "goal_tier";
  sublanes: { key: string; label: string }[];
  sort: number;
};

export type TimedNote = {
  text: string;
  validFrom: string | null;
  validTo: string | null;
  needsConfirm: boolean;
};

export type JourneyNode = {
  code: string;
  lineKey: string;
  stageKey: string;
  laneKey: string | null;
  kind: string;
  brandSlug: string | null;
  productName: string;
  itemName: string | null;
  durationText: string | null;
  commitmentText: string | null;
  description: string | null;
  groupCode: string | null;
  stageSpan: string[] | null;
  attachTo: string | null;
  timedNotes: TimedNote[];
  brandConfirmed: boolean;
  decisionPending: boolean;
  extra: Record<string, string>;
  sort: number;
  /** Chỉ audience "editor" mới có hai trường dưới (spec 6.1.1, 7.3). */
  verifyNote: string | null;
  brandNote: string | null;
};

export type JourneyEdge = {
  from: string;
  to: string;
  kind: string;
  label: string | null;
  proposed: boolean;
  twoWay: boolean;
};

export type JourneyMap = {
  audience: Audience;
  stages: JourneyStage[];
  lines: JourneyLine[];
  nodes: JourneyNode[];
  edges: JourneyEdge[];
  brands: JourneyBrand[];
};

/** Hàng nguồn của một ô, dạng cột cơ sở dữ liệu. `brand_slug` đã được phân giải từ brand_id. */
export type NodeSourceRow = {
  code: string;
  line_key: string;
  stage_key: string;
  lane_key: string | null;
  kind: string;
  brand_slug: string | null;
  product_name: string;
  item_name: string | null;
  duration_text: string | null;
  commitment_text?: string | null;
  commitment_confirmed?: boolean;
  description: string | null;
  group_code: string | null;
  stage_span: string[] | null;
  attach_to: string | null;
  timed_notes: unknown;
  brand_confirmed: boolean;
  decision_pending: boolean;
  verify_note?: string | null;
  brand_note?: string | null;
  extra: unknown;
  sort: number;
};

type RawTimedNote = {
  text: string;
  valid_from: string | null;
  valid_to: string | null;
  needs_confirm: boolean;
};

/** Ngày hôm nay theo múi giờ Asia/Ho_Chi_Minh, dạng YYYY-MM-DD (khớp public.today_vn()). */
export function todayVn(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(now);
}

/**
 * Staff chỉ thấy mốc đã xác nhận và còn trong thời hạn (giống view v_usable_journey_nodes).
 * Editor thấy tất cả, kèm cờ needsConfirm để rà soát.
 */
export function visibleTimedNotes(raw: unknown, audience: Audience, today: string): TimedNote[] {
  const notes = (Array.isArray(raw) ? raw : []) as RawTimedNote[];
  return notes
    .filter((n) => {
      if (audience === "editor") return true;
      if (n.needs_confirm) return false;
      if (n.valid_from !== null && n.valid_from > today) return false;
      if (n.valid_to !== null && n.valid_to < today) return false;
      return true;
    })
    .map((n) => ({ text: n.text, validFrom: n.valid_from, validTo: n.valid_to, needsConfirm: n.needs_confirm }));
}

export function toNode(row: NodeSourceRow, audience: Audience, today: string): JourneyNode {
  const confirmed = row.commitment_confirmed === true;
  const commitment = row.commitment_text ?? null;
  return {
    code: row.code,
    lineKey: row.line_key,
    stageKey: row.stage_key,
    laneKey: row.lane_key,
    kind: row.kind,
    brandSlug: row.brand_slug,
    productName: row.product_name,
    itemName: row.item_name,
    durationText: row.duration_text,
    // Cam kết đầu ra chỉ hiện khi R&D đã xác nhận (N1, Q23); editor thấy để rà soát.
    commitmentText: audience === "editor" || confirmed ? commitment : null,
    description: row.description,
    groupCode: row.group_code,
    stageSpan: row.stage_span,
    attachTo: row.attach_to,
    timedNotes: visibleTimedNotes(row.timed_notes, audience, today),
    brandConfirmed: row.brand_confirmed,
    decisionPending: row.decision_pending,
    extra: (row.extra ?? {}) as Record<string, string>,
    sort: row.sort,
    verifyNote: audience === "editor" ? (row.verify_note ?? null) : null,
    brandNote: audience === "editor" ? (row.brand_note ?? null) : null,
  };
}

// --- Tra cứu trên bản đồ ---

export function nodesByCode(map: JourneyMap): Map<string, JourneyNode> {
  return new Map(map.nodes.map((n) => [n.code, n]));
}

/** Ô trước và ô sau theo đường nối thứ tự (`sequence`). Không dùng đường nối đề xuất. */
export function sequenceNeighbours(map: JourneyMap, code: string): { previous: string[]; next: string[] } {
  const previous: string[] = [];
  const next: string[] = [];
  for (const e of map.edges) {
    if (e.kind !== "sequence") continue;
    if (e.to === code) previous.push(e.from);
    if (e.from === code) next.push(e.to);
  }
  return { previous, next };
}

/** Các đường nối đề xuất (nét đứt) đi qua ô, cả hai chiều. */
export function proposedLinks(map: JourneyMap, code: string): { other: string; edge: JourneyEdge; outgoing: boolean }[] {
  const result: { other: string; edge: JourneyEdge; outgoing: boolean }[] = [];
  for (const e of map.edges) {
    if (!e.proposed) continue;
    if (e.from === code) result.push({ other: e.to, edge: e, outgoing: true });
    else if (e.to === code) result.push({ other: e.from, edge: e, outgoing: false });
  }
  return result;
}

/** Bỏ dấu và hạ chữ thường để tìm không phân biệt dấu ("du hoc" khớp "DU HỌC"). */
export function normalizeVi(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase();
}

export function nodeMatches(node: JourneyNode, query: string): boolean {
  const q = normalizeVi(query.trim());
  if (q === "") return false;
  return normalizeVi([node.code, node.productName, node.itemName ?? ""].join(" ")).includes(q);
}
