import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { vi } from "@/lib/i18n/vi";
import { loadJourneyMap } from "@/lib/journey/load";

export const metadata: Metadata = { title: `${vi.journey.stageHeader} · ${vi.app.name}` };

export default function StagePage(props: PageProps<"/brand/journey/stage/[key]">) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-6">
        <Link href="/brand/journey" className="text-vmg-red underline">
          {vi.journey.backToMap}
        </Link>
        <Suspense fallback={<p className="text-vmg-muted">{vi.home.loading}</p>}>
          <Stage params={props.params} />
        </Suspense>
      </main>
    </>
  );
}

async function Stage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const map = await loadJourneyMap();
  const stage = map.stages.find((s) => s.key === key);
  if (!stage) notFound();

  const brandName = new Map(map.brands.map((b) => [b.slug, b.name]));
  const lines = map.lines
    .map((line) => ({
      line,
      nodes: map.nodes.filter((n) => n.stageKey === stage.key && n.lineKey === line.key).sort((a, b) => a.sort - b.sort),
    }))
    .filter((g) => g.nodes.length > 0);

  const index = map.stages.findIndex((s) => s.key === key);
  const previous = map.stages[index - 1];
  const next = map.stages[index + 1];

  return (
    <>
      <header className="flex flex-col gap-1">
        <p className="font-bold text-vmg-red">{stage.ageLabel}</p>
        <h1 className="text-2xl font-bold uppercase">{stage.title}</h1>
        {stage.decider ? (
          <p className="text-vmg-muted">
            {vi.journey.decider}: {stage.decider}
          </p>
        ) : null}
        {stage.note ? <p className="text-sm text-vmg-muted">{stage.note}</p> : null}
      </header>

      {stage.outcomes.length > 0 ? (
        <section className="rounded-lg bg-surface-card p-4">
          <h2 className="font-bold">{vi.journey.outcomes}</h2>
          <ul className="mt-2 list-disc pl-5">
            {stage.outcomes.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        <h2 className="font-bold">{vi.journey.stageNodes}</h2>
        {lines.length === 0 ? <p className="text-vmg-muted">{vi.journey.noNodes}</p> : null}
        {lines.map(({ line, nodes }) => (
          <div key={line.key} className="flex flex-col gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wide text-vmg-gold">{line.label}</h3>
            <ul className="flex flex-col gap-2">
              {nodes.map((n) => (
                <li key={n.code}>
                  <Link
                    href={`/brand/journey?node=${n.code}`}
                    className="flex min-h-11 flex-col gap-0.5 rounded-md border border-vmg-faint bg-surface-card p-3 hover:border-vmg-red"
                  >
                    <span className="font-bold uppercase">{n.productName}</span>
                    {n.itemName ? <span>{n.itemName}</span> : null}
                    {n.durationText ? <span className="text-sm text-vmg-muted">{n.durationText}</span> : null}
                    {n.brandSlug && brandName.has(n.brandSlug) ? (
                      <span className="text-sm text-vmg-muted">{brandName.get(n.brandSlug)}</span>
                    ) : null}
                    {!n.brandConfirmed && n.kind !== "goal_group" ? (
                      <span className="text-sm text-vmg-muted">{vi.journey.brandPending}</span>
                    ) : null}
                    {n.decisionPending ? <span className="text-sm text-vmg-muted">{vi.journey.decisionPending}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <nav className="flex justify-between gap-3" aria-label="Chuyển chặng">
        {previous ? (
          <Link href={`/brand/journey/stage/${previous.key}`} className="inline-flex min-h-11 items-center rounded-md border border-vmg-faint px-3">
            ← {previous.ageLabel}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/brand/journey/stage/${next.key}`} className="inline-flex min-h-11 items-center rounded-md border border-vmg-faint px-3">
            {next.ageLabel} →
          </Link>
        ) : null}
      </nav>
    </>
  );
}
