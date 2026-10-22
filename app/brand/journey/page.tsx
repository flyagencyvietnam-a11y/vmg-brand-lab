import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/journey/badges";
import { Overview } from "@/components/journey/overview";
import { vi } from "@/lib/i18n/vi";
import { loadJourneyMap } from "@/lib/journey/load";

export const metadata: Metadata = { title: `${vi.journey.title} · ${vi.app.name}` };

export default function JourneyPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8">
        <Suspense fallback={<p className="text-vmg-muted">{vi.home.loading}</p>}>
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
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold uppercase tracking-wide text-vmg-red">{vi.journey.title}</h1>
          {map.audience === "editor" ? <Badge tone="gold">{vi.journey.editorBadge}</Badge> : null}
        </div>
        <p className="max-w-3xl text-lg text-vmg-muted">{vi.journey.intro}</p>
      </header>
      {map.nodes.length === 0 ? (
        <p className="rounded-lg bg-surface-card p-4 text-vmg-muted">{vi.journey.empty}</p>
      ) : (
        <Overview map={map} />
      )}
    </>
  );
}
