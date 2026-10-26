import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { BrandLogo } from "@/components/portfolio/brand-logo";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/ui/hero";
import { ArrowCircle } from "@/components/ui/tile";
import { SectionHeading } from "@/components/ui/section-heading";
import { pf } from "@/lib/i18n/portfolio";
import { vi } from "@/lib/i18n/vi";
import { productsOfBrand, type Portfolio, type PortfolioBrand } from "@/lib/products/model";
import { loadPortfolio } from "@/lib/products/load";

export const metadata: Metadata = { title: `${pf.brands.title} · ${vi.app.name}` };

export default function BrandsPage() {
  return (
    <>
      <AppHeader />
      <main className="flex-1">
        <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-10 text-ink-2">{vi.home.loading}</p>}>
          <Brands />
        </Suspense>
      </main>
    </>
  );
}

function label<T extends Record<string, string>>(labels: T, key: string | null): string | null {
  return key && key in labels ? labels[key as keyof T] : null;
}

/** Thẻ thương hiệu: khối màu của thương hiệu (chỉ khi mã màu đã chính thức), chữ trắng; chưa có màu thì khối vàng chanh nhạt. */
function BrandCard({ brand, portfolio }: { brand: PortfolioBrand; portfolio: Portfolio }) {
  const n = productsOfBrand(portfolio, brand.slug).length;
  const domain = label(pf.brand.domainLabels, brand.domain);
  const delivery = label(pf.brand.deliveryLabels, brand.delivery);
  const coloured = brand.colorPrimary !== null;
  return (
    <Link
      href={`/brand/${brand.slug}`}
      className={`lift group flex h-full min-h-[16rem] flex-col justify-between gap-6 rounded-card p-6 ${coloured ? "on-brand text-on-brand" : "bg-lemon-soft text-ink"}`}
      style={coloured ? { backgroundColor: brand.colorPrimary! } : undefined}
    >
      <div className="flex flex-col items-start gap-2">
        <BrandLogo slug={brand.slug} name={brand.name} className="h-8" />
        <h3 className="text-h1 uppercase">{brand.name}</h3>
        <p className="text-small">{[domain, delivery].filter(Boolean).join(" · ")}</p>
        {!brand.confirmed ? <span><Badge tone={coloured ? "on-brand" : "pending"}>{vi.journey.pending}</Badge></span> : null}
      </div>
      <div className="flex items-end justify-between gap-3">
        <p className="text-small">{brand.kind === "member" ? (n > 0 ? `${n} ${pf.brands.products}` : pf.brands.noProducts) : ""}</p>
        <ArrowCircle tone="lemon" size="lg" />
      </div>
    </Link>
  );
}

// Đọc phiên lúc có yêu cầu, nên nằm trong Suspense (Cache Components).
async function Brands() {
  const portfolio = await loadPortfolio();
  const parents = portfolio.brands.filter((b) => b.kind === "parent");
  const members = portfolio.brands.filter((b) => b.kind === "member");
  return (
    <>
      <PageHero
        tone="lemon"
        eyebrow={
          <span className="flex flex-wrap items-center gap-3">
            {pf.eyebrow}
            {portfolio.audience === "editor" ? <Badge tone="gold">{vi.journey.editorBadge}</Badge> : null}
          </span>
        }
        title={pf.brands.title}
        lead={pf.brands.lead}
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pt-6 pb-14">
        {portfolio.brands.length === 0 ? (
          <p className="rounded-card border border-line bg-paper p-5 text-ink-2">{pf.brands.empty}</p>
        ) : null}
        {parents.length > 0 ? (
          <section aria-labelledby="b-parent" className="flex flex-col gap-4">
            <SectionHeading id="b-parent" title={pf.brands.parentTitle} />
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {parents.map((b) => (
                <li key={b.slug}>
                  <BrandCard brand={b} portfolio={portfolio} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {members.length > 0 ? (
          <section aria-labelledby="b-member" className="flex flex-col gap-4">
            <SectionHeading id="b-member" title={pf.brands.memberTitle} />
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((b) => (
                <li key={b.slug}>
                  <BrandCard brand={b} portfolio={portfolio} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <p className="text-small text-ink-2">
          <Link href="/brand/products" className="inline-flex min-h-11 items-center font-medium text-brand underline hover:text-brand-hover">
            {pf.products.title}
          </Link>
        </p>
      </div>
    </>
  );
}
