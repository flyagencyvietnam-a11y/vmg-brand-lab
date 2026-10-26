import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { CopyButton } from "@/components/brandbook/copy-button";
import { BrandDot } from "@/components/portfolio/brand-chip";
import { BrandLogo } from "@/components/portfolio/brand-logo";
import { ProductCard } from "@/components/portfolio/product-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { pf } from "@/lib/i18n/portfolio";
import { vi } from "@/lib/i18n/vi";
import { loadJourneyMap } from "@/lib/journey/load";
import { loadPortfolio } from "@/lib/products/load";
import { nodesOfBrand } from "@/lib/products/journey";
import { profileValue } from "@/lib/brandbook/model";
import { productsOfBrand } from "@/lib/products/model";

export const metadata: Metadata = { title: `${pf.brands.title} · ${vi.app.name}` };

export default function BrandPage(props: PageProps<"/brand/[slug]">) {
  return (
    <>
      <AppHeader />
      <main className="flex-1">
        <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-10 text-ink-2">{vi.home.loading}</p>}>
          <Brand params={props.params} />
        </Suspense>
      </main>
    </>
  );
}

function label<T extends Record<string, string>>(labels: T, key: string | null): string | null {
  return key && key in labels ? labels[key as keyof T] : null;
}

function Fact({ label: name, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-line py-3 last:border-b-0 sm:grid sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-small text-ink-3">{name}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden className="size-5 rounded-md border border-line-strong" style={{ backgroundColor: hex }} />
      {name}: <code>{hex.toUpperCase()}</code>
    </span>
  );
}

// Đọc phiên lúc có yêu cầu, nên nằm trong Suspense (Cache Components).
async function Brand({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [portfolio, map] = await Promise.all([loadPortfolio(), loadJourneyMap()]);
  const brand = portfolio.brands.find((b) => b.slug === slug);
  if (!brand) notFound();

  const products = productsOfBrand(portfolio, brand.slug);
  const onMap = nodesOfBrand(map, brand.slug);
  const hasColour = brand.colorPrimary !== null;
  const domain = label(pf.brand.domainLabels, brand.domain);
  const delivery = label(pf.brand.deliveryLabels, brand.delivery);
  const vimi = label(pf.brand.vimiLabels, brand.vimiLevel);
  const release = label(pf.brand.releaseLabels, brand.releaseStatus);
  const profile = brand.profile;
  const intro = profileValue(profile, "Giới thiệu chuẩn (khoảng 25 từ)")?.[0] ?? null;

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-4 pt-4">
        <div
          className={`rounded-hero px-6 py-10 md:px-12 md:py-14 ${hasColour ? "on-brand text-on-brand" : "bg-lemon-soft text-ink"}`}
          style={hasColour ? { backgroundColor: brand.colorPrimary! } : undefined}
        >
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="flex max-w-4xl flex-col items-start gap-4">
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-small font-medium">
              <Link href="/brand/brands" className="inline-flex min-h-11 items-center gap-2 underline-offset-4 hover:underline">
                <Icon name="arrow-left" className="size-4" />
                {pf.brand.back}
              </Link>
              {portfolio.audience === "editor" ? <Badge tone={hasColour ? "on-brand" : "gold"}>{vi.journey.editorBadge}</Badge> : null}
            </span>
            <h1 className="animate-rise text-display uppercase">{brand.name}</h1>
            <p className="animate-rise text-lead">{[label(pf.brand.kindLabels, brand.kind), domain, delivery].filter(Boolean).join(" · ")}</p>
          </div>
          <BrandLogo slug={brand.slug} name={brand.name} className="h-16 md:h-20" />
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pt-8 pb-14">
        {profile ? (
          <section aria-labelledby="profile-heading" className="flex flex-col gap-5">
            {profile.oneLiner ? (
              <div className="rounded-card bg-lemon-soft p-6 md:p-8">
                <p className="text-small font-medium text-ink-2">{pf.profile.oneLiner}</p>
                <p className="mt-2 text-h1">{profile.oneLiner}</p>
              </div>
            ) : null}
            <SectionHeading id="profile-heading" title={pf.profile.positioning} lead={pf.profile.positioningLead} />
            <Card className="px-5 py-2">
              <dl>
                {profile.architectureRole ? <Fact label={pf.profile.role}>{profile.architectureRole}</Fact> : null}
                {profile.spelling ? <Fact label={pf.profile.spelling}>{profile.spelling}</Fact> : null}
                {profile.personaRole ? (
                  <Fact label={pf.profile.persona}>
                    <span className="font-medium">{profile.personaRole}</span>
                    {profile.personaVoice ? <span className="block text-ink-2">{profile.personaVoice}</span> : null}
                  </Fact>
                ) : null}
                {profile.items
                  .filter((i) => !(pf.profile.skipLabels as readonly string[]).includes(i.label) && i.label !== "Định vị" && i.label !== "Cách viết tên" && i.label !== "Vai nhân cách")
                  .map((i) => (
                    <Fact key={i.label} label={i.label}>
                      {i.value.length > 1 ? (
                        <ul className="flex list-disc flex-col gap-1 pl-4">
                          {i.value.map((v) => (
                            <li key={v}>{v}</li>
                          ))}
                        </ul>
                      ) : (
                        i.value[0]
                      )}
                    </Fact>
                  ))}
              </dl>
            </Card>
            {intro ? (
              <div className="flex flex-col gap-3 rounded-card border border-line bg-paper p-5 md:p-6">
                <h3 className="text-h3">{pf.profile.standardIntro}</h3>
                <p className="max-w-3xl">{intro}</p>
                <div>
                  <CopyButton text={intro} label={pf.profile.copy} doneLabel={pf.profile.copied} />
                </div>
              </div>
            ) : null}
            <p className="text-small text-ink-3">{pf.profile.source}</p>
          </section>
        ) : null}

        <section aria-labelledby="facts-heading" className="flex flex-col gap-4">
          <SectionHeading id="facts-heading" title={pf.brand.facts} />
          <Card className="px-5 py-2">
            <dl>
              <Fact label={pf.brand.kind}>{label(pf.brand.kindLabels, brand.kind)}</Fact>
              {domain ? <Fact label={pf.brand.domain}>{domain}</Fact> : null}
              {delivery ? <Fact label={pf.brand.delivery}>{delivery}</Fact> : null}
              {vimi ? <Fact label={pf.brand.vimi}>{vimi}</Fact> : null}
              <Fact label={pf.brand.colours}>
                {hasColour ? (
                  <span className="flex flex-wrap gap-x-6 gap-y-2">
                    <Swatch name={pf.brand.primary} hex={brand.colorPrimary!} />
                    {brand.colorSecondary ? <Swatch name={pf.brand.secondary} hex={brand.colorSecondary} /> : null}
                  </span>
                ) : (
                  <span className="text-ink-2">{pf.brand.noColour}</span>
                )}
                {brand.colorNote ? <span className="mt-1 block text-small text-ink-2">{brand.colorNote}</span> : null}
              </Fact>
              {!brand.confirmed ? (
                <Fact label={pf.brand.release}>
                  <Badge tone="pending">{pf.brand.unconfirmed}</Badge>
                </Fact>
              ) : null}
              {portfolio.audience === "editor" && release ? <Fact label={pf.brand.release}>{release}</Fact> : null}
              {brand.releaseCondition ? <Fact label={pf.brand.release}>{brand.releaseCondition}</Fact> : null}
              {brand.note ? <Fact label={pf.brand.note}>{brand.note}</Fact> : null}
            </dl>
          </Card>
          {profile ? null : <p className="text-small text-ink-3">{pf.brand.pendingContent}</p>}
        </section>

        <section aria-labelledby="products-heading" className="flex flex-col gap-4">
          <SectionHeading id="products-heading" title={pf.brand.products} lead={products.length > 0 ? pf.brand.productsLead : undefined} />
          {products.length === 0 ? (
            <p className="rounded-card border border-line bg-paper p-5 text-ink-2">{pf.brands.noProducts}</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <li key={p.code}>
                  <ProductCard product={p} brand={brand} hideBrand />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="journey-heading" className="flex flex-col gap-4">
          <SectionHeading id="journey-heading" title={pf.brand.journey} />
          <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
            <p className="flex items-center gap-3">
              <BrandDot color={brand.colorPrimary} className="size-3" />
              {onMap.length > 0 ? pf.brand.journeyText(onMap.length) : pf.brand.journeyNone}
            </p>
            {onMap.length > 0 ? (
              <Link
                href={`/brand/journey?thuong-hieu=${brand.slug}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong px-5 text-small font-medium text-brand hover:border-brand"
              >
                {pf.brand.journeyOpen}
                <Icon name="arrow-right" className="size-4" />
              </Link>
            ) : null}
          </Card>
        </section>
      </div>
    </>
  );
}
