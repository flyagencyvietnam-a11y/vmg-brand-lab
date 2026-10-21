import { z } from "zod";

// Cấu trúc seed/brands.json (spec Phụ lục A.1 và 7.4 bước 1).

const brandSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    name_public: z.string(),
    kind: z.enum(["parent", "member"]),
    domain: z.enum(["system", "language", "study_career"]),
    delivery: z.enum(["offline", "online", "mixed"]),
    vimi_level: z.enum(["primary", "selective", "limited"]),
    color_primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    color_secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    color_note: z.string().optional(),
    confirmed: z.boolean().optional(),
    release_status: z.enum(["draft", "proposed"]),
    release_condition: z.string().optional(),
    note: z.string().optional(),
  })
  .strict();

const flagSchema = z
  .object({ key: z.string(), value: z.boolean(), note: z.string() })
  .strict();

export const brandsSeedSchema = z
  .object({
    _source: z.string(),
    _release_note: z.string(),
    feature_flags: z.array(flagSchema),
    brands: z.array(brandSchema),
  })
  .strict();

export type BrandsSeed = z.infer<typeof brandsSeedSchema>;

export type BrandRow = {
  slug: string;
  name_public: string;
  kind: "parent" | "member";
  domain: string;
  delivery: string;
  vimi_level: string;
  color_primary: string | null;
  color_secondary: string | null;
  color_note: string | null;
  confirmed: boolean;
  release_condition: string | null;
  note: string | null;
  sort: number;
};

/** release_status cố ý không có trong dòng này: seed lại không được ghi đè trạng thái đã xác nhận. */
export function buildBrandRows(
  seed: BrandsSeed,
): { row: BrandRow; parent_slug: string | null; release_status: "draft" | "proposed" }[] {
  const parent = seed.brands.find((b) => b.kind === "parent");
  return seed.brands.map((b, index) => ({
    release_status: b.release_status,
    parent_slug: b.kind === "member" ? (parent?.slug ?? null) : null,
    row: {
      slug: b.slug,
      name_public: b.name_public,
      kind: b.kind,
      domain: b.domain,
      delivery: b.delivery,
      vimi_level: b.vimi_level,
      color_primary: b.color_primary ?? null,
      color_secondary: b.color_secondary ?? null,
      color_note: b.color_note ?? null,
      confirmed: b.confirmed ?? true,
      release_condition: b.release_condition ?? null,
      note: b.note ?? null,
      sort: index + 1,
    },
  }));
}
