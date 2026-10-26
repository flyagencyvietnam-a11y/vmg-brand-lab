import { z } from "zod";

// Cấu trúc seed/brand-book.json (sinh từ VMG Brand Book docx bằng supabase/seed/extract_brand_book.py). Brand Book là nguồn
// cho các mục đã có (trang thương hiệu, trang sản phẩm, ngăn chi tiết của bản đồ), không phải một mục riêng.

const metaSchema = z
  .object({
    organisation: z.string(),
    title: z.string(),
    subtitle: z.string(),
    tagline: z.string(),
    version_line: z.string(),
    author: z.string(),
    submitted_to: z.string(),
  })
  .strict();
export type BookMeta = z.infer<typeof metaSchema>;

const profileItem = z.object({ label: z.string(), value: z.array(z.string()) }).strict();

/** Hồ sơ một thương hiệu: bảng định vị mục 3 cùng vai trò, vai nhân cách, định vị một câu, màu thẻ ở các mục khác. */
export const brandProfileSchema = z
  .object({
    name: z.string(),
    profile: z.array(profileItem),
    architecture_role: z.string().nullish(),
    spelling: z.string().nullish(),
    persona_role: z.string().nullish(),
    persona_voice: z.string().nullish(),
    one_liner: z.string().nullish(),
    card_colour: z.string().nullish(),
  })
  .strict();
export type BrandProfileSeed = z.infer<typeof brandProfileSchema>;

export const brandBookSeedSchema = z
  .object({
    _source: z.string(),
    _note: z.string(),
    meta: metaSchema,
    brands: z.record(z.string(), brandProfileSchema),
  })
  .strict();
export type BrandBookSeed = z.infer<typeof brandBookSeedSchema>;

// --- Dòng cơ sở dữ liệu ---

export type BrandProfileStored = Omit<BrandProfileSeed, "name">;

/** Cập nhật cho bảng brands từ hồ sơ trong tài liệu. */
export function buildBrandProfileUpdates(seed: BrandBookSeed): { slug: string; role_summary: string | null; voice_profile: unknown; profile: unknown }[] {
  return Object.entries(seed.brands).map(([slug, b]) => ({
    slug,
    role_summary: b.architecture_role ?? null,
    voice_profile: { role: b.persona_role ?? null, voice: b.persona_voice ?? null },
    profile: {
      profile: b.profile,
      architecture_role: b.architecture_role ?? null,
      spelling: b.spelling ?? null,
      persona_role: b.persona_role ?? null,
      persona_voice: b.persona_voice ?? null,
      one_liner: b.one_liner ?? null,
      card_colour: b.card_colour ?? null,
    } satisfies BrandProfileStored,
  }));
}
