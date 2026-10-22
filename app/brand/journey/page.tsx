import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { JourneyExplorer } from "@/components/journey/journey-explorer";
import { vi } from "@/lib/i18n/vi";
import { loadJourneyMap } from "@/lib/journey/load";

export const metadata: Metadata = { title: `${vi.journey.title} · ${vi.app.name}` };

export default function JourneyPage(props: PageProps<"/brand/journey">) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-vmg-red">{vi.journey.title}</h1>
          <p className="text-vmg-muted">{vi.journey.intro}</p>
        </div>
        <Suspense fallback={<p className="text-vmg-muted">{vi.home.loading}</p>}>
          <Journey searchParams={props.searchParams} />
        </Suspense>
      </main>
    </>
  );
}

// Đọc phiên và tham số truy vấn lúc có yêu cầu, nên nằm trong Suspense (Cache Components).
async function Journey({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const node = typeof params.node === "string" ? params.node : null;
  const map = await loadJourneyMap();
  return <JourneyExplorer map={map} initialSelected={node} />;
}
