import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { JourneySearch } from "@/components/journey/journey-search";
import { MapCanvas } from "@/components/journey/map-canvas";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/ui/hero";
import { vi } from "@/lib/i18n/vi";
import { loadJourneyMap } from "@/lib/journey/load";
import { buildSearchItems } from "@/lib/journey/views";
import { loadPortfolio } from "@/lib/products/load";

export const metadata: Metadata = { title: `${vi.journey.title} · ${vi.app.name}` };

type SearchParams = Promise<{ chon?: string | string[]; "thuong-hieu"?: string | string[] }>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default function JourneyPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <AppHeader />
      <main className="flex-1">
        <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-10 text-ink-2">{vi.home.loading}</p>}>
          <Journey searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

// Đọc phiên và tham số lúc có yêu cầu, nên nằm trong Suspense (Cache Components).
// ?chon=<mã ô>: mở sẵn ngăn chi tiết của ô; ?thuong-hieu=<slug>: làm nổi các ô của thương hiệu.
async function Journey({ searchParams }: { searchParams: SearchParams }) {
  const [map, portfolio, params] = await Promise.all([loadJourneyMap(), loadPortfolio(), searchParams]);
  const chon = first(params.chon);
  const brandParam = first(params["thuong-hieu"]);
  const selected = chon && map.nodes.some((n) => n.code === chon) ? chon : null;
  const highlight = brandParam && portfolio.brands.some((b) => b.slug === brandParam) ? brandParam : null;
  return (
    <>
      <PageHero
        tone="red"
        eyebrow={
          <span className="flex flex-wrap items-center gap-3">
            {vi.nav.brand}
            {map.audience === "editor" ? <Badge tone="on-brand">{vi.journey.editorBadge}</Badge> : null}
          </span>
        }
        title={vi.journey.title}
        lead={vi.journey.intro}
      >
        {map.nodes.length > 0 ? (
          <div className="mt-2 flex w-full flex-col gap-5">
            <JourneySearch items={buildSearchItems(map)} onBrand />
          </div>
        ) : null}
      </PageHero>
      {map.nodes.length === 0 ? (
        <p className="mx-auto my-10 max-w-6xl rounded-card bg-paper p-5 text-ink-2">{vi.journey.empty}</p>
      ) : (
        <div className="mt-8">
          <MapCanvas key={`${selected ?? ""}|${highlight ?? ""}`} map={map} portfolio={portfolio} initialSelected={selected} highlightBrand={highlight} />
        </div>
      )}
    </>
  );
}
