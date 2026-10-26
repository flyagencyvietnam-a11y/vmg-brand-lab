import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { ProductBrowser } from "@/components/portfolio/product-browser";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/ui/hero";
import { pf } from "@/lib/i18n/portfolio";
import { vi } from "@/lib/i18n/vi";
import { loadPortfolio } from "@/lib/products/load";

export const metadata: Metadata = { title: `${pf.products.title} · ${vi.app.name}` };

export default function ProductsPage() {
  return (
    <>
      <AppHeader />
      <main className="flex-1">
        <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-10 text-ink-2">{vi.home.loading}</p>}>
          <Products />
        </Suspense>
      </main>
    </>
  );
}

// Đọc phiên lúc có yêu cầu, nên nằm trong Suspense (Cache Components).
async function Products() {
  const portfolio = await loadPortfolio();
  return (
    <>
      <PageHero
        tone="plum"
        eyebrow={
          <span className="flex flex-wrap items-center gap-3">
            {pf.eyebrow}
            {portfolio.audience === "editor" ? <Badge tone="on-brand">{vi.journey.editorBadge}</Badge> : null}
          </span>
        }
        title={pf.products.title}
        lead={pf.products.lead}
      />
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-14">
        {portfolio.products.length === 0 ? (
          <p className="rounded-card border border-line bg-paper p-5 text-ink-2">{pf.products.empty}</p>
        ) : (
          <ProductBrowser products={portfolio.products} brands={portfolio.brands} />
        )}
      </div>
    </>
  );
}
