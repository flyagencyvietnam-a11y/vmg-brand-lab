import { z } from "zod";

// Cấu trúc seed/journey.json (spec Phụ lục G). .strict() để file nguồn thêm khóa mới thì
// seed báo lỗi thay vì lặng lẽ bỏ mất dữ liệu.

export const NODE_KINDS = [
  "level",
  "exam",
  "support_product",
  "product",
  "program_header",
  "branch_label",
  "goal_group",
  "gap_note",
] as const;

export const EDGE_KINDS = [
  "sequence",
  "side",
  "side_group",
  "branch",
  "b2g_link",
  "same_program",
  "ea_link",
  "zh_link",
] as const;

const nullableString = z.string().nullable();

const timedNoteSchema = z
  .object({
    text: z.string(),
    valid_from: nullableString,
    valid_to: nullableString,
    needs_confirm: z.boolean(),
  })
  .strict();

const stageSchema = z
  .object({
    key: z.string(),
    age_label: z.string(),
    title: z.string(),
    lead_product: nullableString,
    decider: z.string(),
    outcomes: z.array(z.string()),
    sort: z.number().int(),
    note: z.string().optional(),
  })
  .strict();

const lineSchema = z
  .object({
    key: z.string(),
    label: z.string(),
    description: z.string(),
    kind: z.enum(["primary", "secondary", "goal_tier"]),
    color_proposed: z.string().optional(),
    sort: z.number().int(),
    sublanes: z.array(z.object({ key: z.string(), label: z.string() }).strict()).optional(),
  })
  .strict();

const nodeSchema = z
  .object({
    code: z.string(),
    stage: z.string(),
    line: z.string(),
    kind: z.enum(NODE_KINDS),
    lane: z.string().optional(),
    brand_slug: nullableString,
    product_name: z.string(),
    item_name: nullableString,
    duration_text: nullableString,
    description: nullableString,
    product_code_hints: z.array(z.string()),
    brand_confirmed: z.boolean(),
    decision_pending: z.boolean().optional(),
    verify_note: nullableString.optional(),
    brand_note: z.string().optional(),
    name_note: z.string().optional(),
    row_hint: z.string().optional(),
    attach_to: z.string().optional(),
    same_product_as: z.string().optional(),
    program: z.string().optional(),
    group: z.string().optional(),
    stage_span: z.array(z.string()).optional(),
    timed_notes: z.array(timedNoteSchema).optional(),
    sort: z.number().int().optional(),
  })
  .strict();

const edgeSchema = z
  .object({
    from_code: z.string(),
    to_code: z.string(),
    kind: z.enum(EDGE_KINDS),
    proposed: z.boolean(),
    two_way: z.boolean(),
    label: z.string().optional(),
  })
  .strict();

export const journeySeedSchema = z
  .object({
    meta: z.record(z.string(), z.unknown()),
    stages: z.array(stageSchema),
    lines: z.array(lineSchema),
    nodes: z.array(nodeSchema),
    edges: z.array(edgeSchema),
  })
  .strict();

export type JourneySeed = z.infer<typeof journeySeedSchema>;
export type JourneySeedNode = JourneySeed["nodes"][number];
export type JourneySeedEdge = JourneySeed["edges"][number];

export function parseJourneySeed(raw: unknown): JourneySeed {
  return journeySeedSchema.parse(raw);
}
