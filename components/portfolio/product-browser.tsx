"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { pf } from "@/lib/i18n/portfolio";
import { normalizeVi } from "@/lib/journey/model";
import { groupProducts, type PortfolioBrand, type PortfolioProduct } from "@/lib/products/model";
import type { TileTone } from "@/components/ui/tile";
import { BrandDot } from "./brand-chip";
import { ProductCard } from "./product-card";

/** Danh mục sản phẩm có tìm (không phân biệt dấu) và lọc theo thương hiệu. Nhóm theo nhóm lớn và nhóm con của file R&D. */
const TONES: TileTone[] = ["paper", "blush", "cream", "lilac"];

export function ProductBrowser({ products, brands }: { products: PortfolioProduct[]; brands: PortfolioBrand[] }) {
  const [query, setQuery] = useState("");
  const [brandSlug, setBrandSlug] = useState<string | null>(null);

  const brandBySlug = useMemo(() => new Map(brands.map((b) => [b.slug, b])), [brands]);
  // Chỉ liệt kê thương hiệu thật sự có sản phẩm.
  const filterBrands = useMemo(
    () => brands.filter((b) => products.some((p) => p.brandSlug === b.slug)),
    [brands, products],
  );
  const q = normalizeVi(query.trim());
  const shown = useMemo(
    () =>
      products.filter(
        (p) =>
          (brandSlug === null || p.brandSlug === brandSlug) &&
          (q === "" || normalizeVi(`${p.code} ${p.title} ${p.name} ${p.description ?? ""} ${p.subgroup}`).includes(q)),
      ),
    [products, brandSlug, q],
  );
  const groups = useMemo(() => groupProducts(shown), [shown]);

  const chip = (active: boolean) =>
    `inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-small font-medium transition-colors ${
      active ? "border-transparent bg-brand-soft text-brand" : "border-line-strong bg-paper text-ink-2 hover:border-brand hover:text-brand"
    }`;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <label className="flex max-w-xl flex-col gap-2">
          <span className="pl-2 text-small font-medium text-ink-2">{pf.products.searchLabel}</span>
          <span className="relative">
            <Icon name="search" className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-ink-3" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={pf.products.searchPlaceholder}
              autoComplete="off"
              className="min-h-14 w-full rounded-full border border-line-strong bg-paper pr-5 pl-12 text-body text-ink placeholder:text-ink-3 hover:border-ink-3 focus:border-brand"
            />
          </span>
        </label>
        <div role="group" aria-label={pf.products.brandFilter} className="flex flex-wrap items-center gap-2">
          <button type="button" className={chip(brandSlug === null)} aria-pressed={brandSlug === null} onClick={() => setBrandSlug(null)}>
            {pf.products.all}
          </button>
          {filterBrands.map((b) => (
            <button
              key={b.slug}
              type="button"
              className={chip(brandSlug === b.slug)}
              aria-pressed={brandSlug === b.slug}
              onClick={() => setBrandSlug(brandSlug === b.slug ? null : b.slug)}
            >
              <BrandDot color={b.colorPrimary} />
              {b.name}
            </button>
          ))}
        </div>
        <p className="text-small text-ink-3" role="status">
          {pf.products.count(shown.length)}
        </p>
      </div>

      {groups.length === 0 ? <p className="rounded-card border border-line bg-paper p-5 text-ink-2">{pf.products.none}</p> : null}

      {groups.map((g) => (
        <section key={g.group} aria-labelledby={`g-${g.order}`} className="flex flex-col gap-6">
          <h2 id={`g-${g.order}`} className="text-h1 uppercase">
            <span className="mr-3 text-ink-3">{String(g.order).padStart(2, "0")}</span>
            {g.group}
          </h2>
          {g.subgroups.map((sg, si) => (
            <div key={sg.name || "none"} className="flex flex-col gap-3">
              {sg.name ? <h3 className="text-small font-semibold tracking-caps text-gold uppercase">{sg.name}</h3> : null}
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sg.products.map((p) => (
                  <li key={p.code}>
                    <ProductCard product={p} brand={p.brandSlug ? brandBySlug.get(p.brandSlug) : undefined} tone={TONES[(si + g.order) % TONES.length]} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
