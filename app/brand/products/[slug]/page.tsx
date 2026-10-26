import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { BrandChip } from "@/components/portfolio/brand-chip";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHero } from "@/components/ui/hero";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { pf } from "@/lib/i18n/portfolio";
import { vi } from "@/lib/i18n/vi";
import { loadJourneyMap } from "@/lib/journey/load";
import { lineShortName, nodeLabel } from "@/lib/journey/views";
import { profileValue } from "@/lib/brandbook/model";
import { loadPortfolio } from "@/lib/products/load";
import { connectionsOf, nodesOfProduct, type Connection } from "@/lib/products/journey";

export const metadata: Metadata = { title: `${pf.products.title} · ${vi.app.name}` };

export default function ProductPage(props: PageProps<"/brand/products/[slug]">) {
  return (
    <>
      <AppHeader />
      <main className="flex-1">
        <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-10 text-ink-2">{vi.home.loading}</p>}>
          <Product params={props.params} />
        </Suspense>
      </main>
    </>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-line py-3 last:border-b-0 sm:grid sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-small text-ink-3">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function ConnectionList({ title, items, stageAge, lineName }: { title: string; items: Connection[]; stageAge: Map<string, string>; lineName: Map<string, string> }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="text-h3">{title}</h3>
      <ul className="mt-2 flex flex-col">
        {items.map(({ edge, node }) => (
          <li key={`${edge.from}>${edge.to}`}>
            <Link
              href={`/brand/journey?chon=${node.code}`}
              className="flex min-h-11 flex-col justify-center text-small text-brand hover:text-brand-hover"
            >
              <span className="font-medium underline">{nodeLabel(node)}</span>
              <span className="text-ink-2">
                {stageAge.get(node.stageKey)} · {lineName.get(node.lineKey)}
                {edge.label ? ` · ${edge.label}` : ""}
                {edge.proposed ? ` (${pf.product.proposed})` : ""}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Đọc phiên lúc có yêu cầu, nên nằm trong Suspense (Cache Components).
async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [portfolio, map] = await Promise.all([loadPortfolio(), loadJourneyMap()]);
  const product = portfolio.products.find((p) => p.slug === slug);
  if (!product) notFound();

  const brand = portfolio.brands.find((b) => b.slug === product.brandSlug);
  const nodes = nodesOfProduct(map, product);
  const { from, next } = connectionsOf(map, nodes);
  const stageAge = new Map(map.stages.map((s) => [s.key, s.ageLabel]));
  const lineName = new Map(map.lines.map((l) => [l.key, lineShortName(l)]));
  const commitments = [...new Set(nodes.flatMap((n) => (n.commitmentText ? [n.commitmentText] : [])))];
  const internal = product.internal;

  return (
    <>
      <PageHero
        tone="plum"
        size="large"
        eyebrow={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Link href="/brand/products" className="inline-flex min-h-11 items-center gap-2 underline-offset-4 hover:underline">
              <Icon name="arrow-left" className="size-4" />
              {pf.product.back}
            </Link>
            <span aria-hidden>·</span>
            <span>{product.group}</span>
            {portfolio.audience === "editor" ? <Badge tone="on-brand">{vi.journey.editorBadge}</Badge> : null}
          </span>
        }
        title={product.title}
        lead={product.description ?? undefined}
      >
        <div className="flex flex-wrap items-center gap-2">
          {brand ? <BrandChip brand={brand} link pending={!product.brandConfirmed} /> : null}
          <span className="text-small text-plum-soft">
            {pf.product.code}: <code>{product.code}</code>
          </span>
        </div>
      </PageHero>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pt-6 pb-14">
        <section aria-labelledby="pos-heading" className="flex flex-col gap-4">
          <SectionHeading id="pos-heading" title={pf.product.positioning} lead={product.commitmentWithheld ? pf.product.withheld : undefined} />
          <Card className="px-5 py-2">
            <dl>
              {product.audience.length > 0 ? <Fact label={pf.product.audience}>{product.audience.join(", ")}</Fact> : null}
              {product.formats.length > 0 ? <Fact label={pf.product.formats}>{product.formats.join(", ")}</Fact> : null}
              {product.decider.length > 0 ? <Fact label={pf.product.decider}>{product.decider.join(", ")}</Fact> : null}
              <Fact label={pf.product.group}>{[product.group, product.subgroup].filter(Boolean).join(" · ")}</Fact>
              {Object.entries(product.extra).map(([k, v]) => (
                <Fact key={k} label={k}>
                  {v}
                </Fact>
              ))}
              {product.groupNote ? <Fact label={pf.product.groupNote}>{product.groupNote}</Fact> : null}
            </dl>
          </Card>
        </section>

        {brand?.profile && (profileValue(brand.profile, "Thông điệp chính") || profileValue(brand.profile, "Cần lưu ý khi nói")) ? (
          <section aria-labelledby="guidance-heading" className="flex flex-col gap-4">
            <SectionHeading id="guidance-heading" title={pf.profile.guidance} lead={`${brand.name}. ${pf.profile.guidanceLead}`} />
            <Card className="px-5 py-2">
              <dl>
                {profileValue(brand.profile, "Thông điệp chính") ? <Fact label="Thông điệp chính">{profileValue(brand.profile, "Thông điệp chính")![0]}</Fact> : null}
                {brand.profile.spelling ? <Fact label={pf.profile.spelling}>{brand.profile.spelling}</Fact> : null}
                {profileValue(brand.profile, "Cần lưu ý khi nói") ? <Fact label="Cần lưu ý khi nói">{profileValue(brand.profile, "Cần lưu ý khi nói")![0]}</Fact> : null}
              </dl>
            </Card>
            <p className="text-small text-ink-3">{pf.profile.source}</p>
          </section>
        ) : null}

        <section aria-labelledby="journey-heading" className="flex flex-col gap-4">
          <SectionHeading id="journey-heading" title={pf.product.journey} lead={nodes.length > 0 ? pf.product.journeyLead : undefined} />
          {nodes.length === 0 ? (
            <p className="rounded-card border border-line bg-paper p-5 text-ink-2">{pf.product.journeyNone}</p>
          ) : (
            <Card className="p-5">
              <ul className="flex flex-col">
                {nodes.map((n) => (
                  <li key={n.code} className="border-b border-line py-1 last:border-b-0">
                    <Link
                      href={`/brand/journey?chon=${n.code}`}
                      className="flex min-h-11 flex-col justify-center gap-0.5 hover:text-brand sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <span>
                        <span className="font-medium">{nodeLabel(n)}</span>
                        {n.durationText ? <span className="text-small text-ink-2"> · {n.durationText}</span> : null}
                      </span>
                      <span className="text-small text-ink-2">
                        {stageAge.get(n.stageKey)} · {lineName.get(n.lineKey)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {commitments.length > 0 ? (
                <ul className="mt-3 flex flex-col gap-1 text-small">
                  {commitments.map((text) => (
                    <li key={text}>
                      <strong>{pf.product.commitment}:</strong> {text}
                    </li>
                  ))}
                </ul>
              ) : null}
              <Link
                href={`/brand/journey?chon=${nodes[0]!.code}`}
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong px-5 text-small font-medium text-brand hover:border-brand"
              >
                {pf.product.openOnMap}
                <Icon name="arrow-right" className="size-4" />
              </Link>
            </Card>
          )}
          {from.length > 0 || next.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              <ConnectionList title={pf.product.from} items={from} stageAge={stageAge} lineName={lineName} />
              <ConnectionList title={pf.product.next} items={next} stageAge={stageAge} lineName={lineName} />
            </div>
          ) : null}
        </section>

        {internal ? (
          <section aria-labelledby="internal-heading" className="flex flex-col gap-4">
            <SectionHeading id="internal-heading" title={pf.product.internal} lead={pf.product.internalLead} />
            <Card tone="champagne" className="px-5 py-2">
              <dl>
                {internal.lifecycle ? <Fact label={pf.product.lifecycle}>{internal.lifecycle}</Fact> : null}
                {internal.category ? <Fact label={pf.product.category}>{internal.category}</Fact> : null}
                {internal.kpiOwner ? <Fact label={pf.product.kpiOwner}>{internal.kpiOwner}</Fact> : null}
                {internal.revenueModel ? <Fact label={pf.product.revenueModel}>{internal.revenueModel}</Fact> : null}
                {internal.marketingRole ? <Fact label={pf.product.marketingRole}>{internal.marketingRole}</Fact> : null}
                {internal.note ? <Fact label={pf.product.note}>{internal.note}</Fact> : null}
              </dl>
            </Card>
          </section>
        ) : null}
      </div>
    </>
  );
}
