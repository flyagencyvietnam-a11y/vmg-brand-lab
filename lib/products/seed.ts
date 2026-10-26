import { z } from "zod";
import { parsePortfolio, productBrand, productSlug } from "./parse-portfolio";

// Cấu trúc seed/products.json (sinh từ file R&D, spec Phụ lục A.2). Tên trường theo cột cơ sở dữ liệu.

export const productSeedRowSchema = z
  .object({
    code: z.string(),
    slug: z.string(),
    name: z.string(),
    title: z.string(),
    segment: z.string().nullable(),
    group: z.string(),
    group_order: z.number().int(),
    subgroup: z.string(),
    description: z.string().nullable(),
    audience: z.array(z.string()),
    formats: z.array(z.string()),
    decider: z.array(z.string()),
    revenue_model: z.string().nullable(),
    category: z.string().nullable(),
    lifecycle: z.string().nullable(),
    kpi_owner: z.string().nullable(),
    marketing_role: z.string().nullable(),
    note: z.string().nullable(),
    group_note: z.string().nullable(),
    extra: z.record(z.string(), z.string()),
    brand_slug: z.string().nullable(),
    brand_confirmed: z.boolean(),
    sort: z.number().int(),
  })
  .strict();

export const productsSeedSchema = z
  .object({ _source: z.string(), _note: z.string(), products: z.array(productSeedRowSchema) })
  .strict();

export type ProductSeedRow = z.infer<typeof productSeedRowSchema>;
export type ProductsSeed = z.infer<typeof productsSeedSchema>;

/**
 * Từ điển thương hiệu (Brand Book 4.6): "Du học nghề" thay cho "xuất khẩu lao động" từ 10/2026. Chỉ áp cho tên hiển thị
 * (title, nhóm); mô tả và mã sản phẩm giữ nguyên như file R&D.
 */
export const NAMING_RULES: [RegExp, string][] = [[/XUẤT KHẨU LAO ĐỘNG/g, "DU HỌC NGHỀ"]];
const applyNaming = (s: string): string => NAMING_RULES.reduce((t, [from, to]) => t.replace(from, to), s);

export function buildProductsSeed(markdown: string): ProductsSeed {
  const products = parsePortfolio(markdown).map((p): ProductSeedRow => {
    const brand = productBrand(p.code);
    return {
      code: p.code,
      slug: productSlug(p.code),
      name: p.name,
      title: applyNaming(p.title),
      segment: p.segment,
      group: applyNaming(p.group),
      group_order: p.groupOrder,
      subgroup: applyNaming(p.subgroup),
      description: p.description,
      audience: p.audience,
      formats: p.formats,
      decider: p.decider,
      revenue_model: p.revenueModel,
      category: p.category,
      lifecycle: p.lifecycle,
      kpi_owner: p.kpiOwner,
      marketing_role: p.marketingRole,
      note: p.note,
      group_note: p.groupNote,
      extra: p.extra,
      brand_slug: brand?.slug ?? null,
      brand_confirmed: brand?.confirmed ?? false,
      sort: p.sort,
    };
  });
  return {
    _source: "docs/source/VMG_Product_Portfolio_2026.md (file R&D 07/05/2026, Nghiêm tổng hợp). Sinh bằng `npm run seed:products`, không sửa tay.",
    _note:
      "Thương hiệu gán theo spec Phụ lục A.2 (gợi ý, chủ sản phẩm xác nhận); brand_confirmed = false là tạm xếp. Mọi sản phẩm nạp ở trạng thái draft, chưa phát hành cho nhân viên (spec 9.1).",
    products,
  };
}

export type ProductDbRow = {
  code: string;
  slug: string;
  name: string;
  title: string;
  segment: string | null;
  group_name: string;
  group_order: number;
  subgroup: string;
  description: string | null;
  audience: string[];
  formats: string[];
  decider: string[];
  revenue_model: string | null;
  category: string | null;
  lifecycle: string | null;
  kpi_owner: string | null;
  marketing_role: string | null;
  note: string | null;
  group_note: string | null;
  extra: Record<string, string>;
  brand_id: string | null;
  brand_confirmed: boolean;
  sort: number;
};

/** Dòng cho bảng products. `status` cố ý không có: nạp lại không được ghi đè trạng thái phát hành (mặc định draft). */
export function buildProductRows(seed: ProductsSeed, brandIdBySlug: Map<string, string>): ProductDbRow[] {
  return seed.products.map((p) => {
    if (p.brand_slug && !brandIdBySlug.has(p.brand_slug)) throw new Error(`products: thiếu thương hiệu '${p.brand_slug}' cho ${p.code}`);
    return {
      code: p.code,
      slug: p.slug,
      name: p.name,
      title: applyNaming(p.title),
      segment: p.segment,
      group_name: p.group,
      group_order: p.group_order,
      subgroup: applyNaming(p.subgroup),
      description: p.description,
      audience: p.audience,
      formats: p.formats,
      decider: p.decider,
      revenue_model: p.revenue_model,
      category: p.category,
      lifecycle: p.lifecycle,
      kpi_owner: p.kpi_owner,
      marketing_role: p.marketing_role,
      note: p.note,
      group_note: p.group_note,
      extra: p.extra,
      brand_id: p.brand_slug ? (brandIdBySlug.get(p.brand_slug) ?? null) : null,
      brand_confirmed: p.brand_confirmed,
      sort: p.sort,
    };
  });
}
