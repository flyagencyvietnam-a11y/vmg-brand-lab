import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { brandsSeedSchema } from "@/lib/brands/schema";
import { loadSeedBrandProfiles } from "@/lib/brandbook/seed-source";
import { redactCommitments, type Portfolio, type PortfolioBrand, type PortfolioProduct } from "./model";
import { productsSeedSchema, type ProductSeedRow } from "./seed";

const root = process.cwd();

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(resolve(/*turbopackIgnore: true*/ root, file), "utf8"));
}

export function seedProductToModel(p: ProductSeedRow, audience: "staff" | "editor"): PortfolioProduct {
  return redactCommitments(
    {
    code: p.code,
    slug: p.slug,
    name: p.name,
    title: p.title,
    segment: p.segment,
    group: p.group,
    groupOrder: p.group_order,
    subgroup: p.subgroup,
    description: p.description,
    audience: p.audience,
    formats: p.formats,
    decider: p.decider,
    groupNote: p.group_note,
    extra: p.extra,
    brandSlug: p.brand_slug,
    brandConfirmed: p.brand_confirmed,
    sort: p.sort,
    internal:
      audience === "editor"
        ? {
            lifecycle: p.lifecycle,
            category: p.category,
            kpiOwner: p.kpi_owner,
            revenueModel: p.revenue_model,
            marketingRole: p.marketing_role,
            note: p.note,
          }
        : null,
    commitmentWithheld: false,
    },
    audience,
  );
}

/** Danh mục dựng từ seed (chế độ thử cục bộ). */
export function loadSeedPortfolio(audience: "staff" | "editor"): Portfolio {
  const brands = brandsSeedSchema.parse(readJson("seed/brands.json")).brands;
  const products = productsSeedSchema.parse(readJson("seed/products.json")).products;
  const profiles = loadSeedBrandProfiles();
  return {
    audience,
    brands: brands.map(
      (b, i): PortfolioBrand => ({
        slug: b.slug,
        name: b.name_public,
        kind: b.kind,
        domain: b.domain,
        delivery: b.delivery,
        vimiLevel: b.vimi_level,
        colorPrimary: b.color_primary ?? null,
        colorSecondary: b.color_secondary ?? null,
        colorNote: b.color_note ?? null,
        confirmed: b.confirmed ?? true,
        releaseStatus: b.release_status,
        releaseCondition: b.release_condition ?? null,
        note: b.note ?? null,
        sort: i + 1,
        profile: profiles.get(b.slug) ?? null,
      }),
    ),
    products: products.map((p) => seedProductToModel(p, audience)),
  };
}
