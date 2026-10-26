import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { brandsSeedSchema } from "@/lib/brands/schema";
import { buildJourneyRows } from "./rows";
import { parseJourneySeed } from "./schema";
import { toNode, withProductHints, type Audience, type JourneyMap } from "./model";

const root = process.cwd();

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(resolve(/*turbopackIgnore: true*/ root, file), "utf8"));
}

/** Bản đồ dựng từ file seed (chế độ thử cục bộ, và để so sánh tương đương với view trong kiểm thử). */
export function loadSeedJourneyMap(audience: Audience, today: string): JourneyMap {
  const rows = buildJourneyRows(parseJourneySeed(readJson("seed/journey.json")));
  const brands = brandsSeedSchema.parse(readJson("seed/brands.json")).brands;
  return withProductHints(buildSeedJourneyMap(rows, brands, audience, today), rows.nodeProducts);
}

export function buildSeedJourneyMap(
  rows: ReturnType<typeof buildJourneyRows>,
  brands: { slug: string; name_public: string; color_primary?: string; confirmed?: boolean }[],
  audience: Audience,
  today: string,
): JourneyMap {
  return {
    audience,
    stages: rows.stages
      .map((s) => ({
        key: s.key,
        ageLabel: s.age_label,
        title: s.title,
        leadProduct: s.lead_product,
        decider: s.decider,
        outcomes: s.outcomes,
        note: s.note,
        sort: s.sort,
      }))
      .sort((a, b) => a.sort - b.sort),
    lines: rows.lines
      .map((l) => ({
        key: l.key,
        label: l.label,
        description: l.description,
        kind: l.kind,
        sublanes: l.sublanes,
        sort: l.sort,
      }))
      .sort((a, b) => a.sort - b.sort),
    nodes: rows.nodes.map((n) => toNode(n, audience, today)),
    edges: rows.edges.map((e) => ({
      from: e.from_code,
      to: e.to_code,
      kind: e.kind,
      label: e.label,
      proposed: e.proposed,
      twoWay: e.two_way,
    })),
    brands: brands.map((b) => ({
      slug: b.slug,
      name: b.name_public,
      colorPrimary: b.color_primary ?? null,
      confirmed: b.confirmed ?? true,
    })),
  };
}
