import type { BrandProfile } from "@/lib/brandbook/model";
import { matchesHint } from "./parse-portfolio";

// Mô hình thương hiệu và sản phẩm dùng cho giao diện. Hai nguồn (Supabase, seed thử cục bộ) đều đi qua đây.

export type PortfolioBrand = {
  slug: string;
  name: string;
  kind: "parent" | "member";
  domain: string | null;
  delivery: string | null;
  vimiLevel: string | null;
  colorPrimary: string | null;
  colorSecondary: string | null;
  colorNote: string | null;
  /** false: thương hiệu còn là đề xuất (ví dụ VMG e-Academy), chưa xác nhận là thương hiệu thành viên. */
  confirmed: boolean;
  releaseStatus: string;
  releaseCondition: string | null;
  note: string | null;
  sort: number;
  /** Hồ sơ định vị từ VMG Brand Book (dự thảo); null khi chưa nạp. */
  profile: BrandProfile | null;
};

/** Phần nội bộ của sản phẩm (vòng đời, KPI owner...): chỉ editor, admin thấy (tầng ứng dụng bỏ khỏi dữ liệu của staff). */
export type ProductInternal = {
  lifecycle: string | null;
  category: string | null;
  kpiOwner: string | null;
  revenueModel: string | null;
  marketingRole: string | null;
  note: string | null;
};

export type PortfolioProduct = {
  code: string;
  slug: string;
  name: string;
  title: string;
  segment: string | null;
  group: string;
  groupOrder: number;
  subgroup: string;
  description: string | null;
  audience: string[];
  formats: string[];
  decider: string[];
  groupNote: string | null;
  extra: Record<string, string>;
  brandSlug: string | null;
  /** false: thương hiệu của sản phẩm là gợi ý, chờ xác nhận (Phụ lục A.2). */
  brandConfirmed: boolean;
  sort: number;
  internal: ProductInternal | null;
  /** true: một phần mô tả bị ẩn vì nhắc cam kết đầu ra chưa được R&D thống nhất (spec 6.1.1, Q23). Chỉ có với staff. */
  commitmentWithheld: boolean;
};

export type Portfolio = {
  audience: "staff" | "editor";
  brands: PortfolioBrand[];
  products: PortfolioProduct[];
};

/** Các sản phẩm khớp với mã gợi ý của một ô hành trình. */
export function productsForHints(products: PortfolioProduct[], hints: string[]): PortfolioProduct[] {
  return products.filter((p) => hints.some((h) => matchesHint(p.code, h)));
}

export function productsOfBrand(portfolio: Portfolio, slug: string): PortfolioProduct[] {
  return portfolio.products.filter((p) => p.brandSlug === slug).sort((a, b) => a.sort - b.sort);
}

export type ProductGroup = { group: string; order: number; subgroups: { name: string; products: PortfolioProduct[] }[] };

/** Nhóm sản phẩm theo nhóm lớn rồi nhóm con, đúng thứ tự file nguồn. */
export function groupProducts(products: PortfolioProduct[]): ProductGroup[] {
  const groups = new Map<string, ProductGroup>();
  for (const p of [...products].sort((a, b) => a.sort - b.sort)) {
    let g = groups.get(p.group);
    if (!g) {
      g = { group: p.group, order: p.groupOrder, subgroups: [] };
      groups.set(p.group, g);
    }
    let sg = g.subgroups.find((s) => s.name === p.subgroup);
    if (!sg) {
      sg = { name: p.subgroup, products: [] };
      g.subgroups.push(sg);
    }
    sg.products.push(p);
  }
  return [...groups.values()].sort((a, b) => a.order - b.order);
}

const COMMITMENT = /cam kết/i;

/**
 * Với người dùng thường: bỏ các đoạn mô tả nhắc cam kết đầu ra (ví dụ "cam kết đầu ra IELTS 5.5, 6.5"), vì con số chỉ
 * hiển thị khi R&D thống nhất (spec 6.1.1, R15, Q23). Cả đoạn bị bỏ chứ không cắt chữ giữa chừng. Editor, admin thấy đủ.
 */
export function redactCommitments(p: PortfolioProduct, audience: "staff" | "editor"): PortfolioProduct {
  if (audience === "editor") return p;
  const hit = (t: string | null) => t !== null && COMMITMENT.test(t);
  const extra = Object.fromEntries(Object.entries(p.extra).filter(([k, v]) => !COMMITMENT.test(k) && !COMMITMENT.test(v)));
  const withheld = hit(p.description) || hit(p.groupNote) || Object.keys(extra).length !== Object.keys(p.extra).length;
  if (!withheld) return p;
  return {
    ...p,
    description: hit(p.description) ? null : p.description,
    groupNote: hit(p.groupNote) ? null : p.groupNote,
    extra,
    commitmentWithheld: true,
  };
}
