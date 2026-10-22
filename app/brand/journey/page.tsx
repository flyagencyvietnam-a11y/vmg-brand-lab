import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { JourneySearch } from "@/components/journey/journey-search";
import { Overview } from "@/components/journey/overview";
import { Badge } from "@/components/ui/badge";
import { Hero } from "@/components/ui/hero";
import { vi } from "@/lib/i18n/vi";
import { loadJourneyMap } from "@/lib/journey/load";
import { buildSearchItems } from "@/lib/journey/views";

export const metadata: Metadata = { title: `${vi.journey.title} · ${vi.app.name}` };

export default function JourneyPage() {
  return (
    <>
      <AppHeader />
      <main className="flex-1">
        <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-10 text-ink-2">{vi.home.loading}</p>}>
          <Journey />
        </Suspense>
      </main>
    </>
  );
}

// Đọc phiên lúc có yêu cầu, nên nằm trong Suspense (Cache Components).
async function Journey() {
  const map = await loadJourneyMap();
  return (
    <>
      <Hero
        eyebrow={
          <span className="flex flex-wrap items-center gap-3">
            {vi.nav.brand}
            {map.audience === "editor" ? <Badge tone="on-brand">{vi.journey.editorBadge}</Badge> : null}
          </span>
        }
        title={vi.journey.title}
        lead={vi.journey.intro}
      >
        {map.nodes.length > 0 ? <JourneySearch items={buildSearchItems(map)} /> : null}
      </Hero>
      {map.nodes.length === 0 ? (
        <p className="mx-auto my-10 max-w-6xl rounded-card bg-paper p-5 text-ink-2">{vi.journey.empty}</p>
      ) : (
        <Overview map={map} />
      )}
    </>
  );
}
