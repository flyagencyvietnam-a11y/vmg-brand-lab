import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/journey/badges";
import { LineSectionView, makeCtx } from "@/components/journey/blocks";
import { StageNav } from "@/components/journey/stage-nav";
import { vi } from "@/lib/i18n/vi";
import { loadJourneyMap } from "@/lib/journey/load";
import { buildStageSections, lineShortName, nodeLabel, stageTransitions } from "@/lib/journey/views";

export const metadata: Metadata = { title: `${vi.journey.title} · ${vi.app.name}` };

export default function StagePage(props: PageProps<"/brand/journey/stage/[key]">) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
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
  const stages = [...map.stages].sort((a, b) => a.sort - b.sort);
  const index = stages.findIndex((s) => s.key === key);
  if (index === -1) notFound();
  const stage = stages[index]!;
  const previous = stages[index - 1];
  const next = stages[index + 1];

  const ctx = makeCtx(map);
  const sections = buildStageSections(map, stage.key);
  const transitions = stageTransitions(map).filter((t) => t.fromStage === stage.key);

  return (
    <div className="flex flex-col gap-6 md:grid md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10">
      <StageNav stages={stages} current={stage.key} />

      <div className="flex min-w-0 flex-col gap-10">
        <nav aria-label="Đường dẫn" className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-vmg-muted">
          <span>
            <Link href="/brand/journey" className="text-vmg-red underline">
              {vi.journey.title}
            </Link>{" "}
            / {stage.ageLabel}
          </span>
          {map.audience === "editor" ? <Badge tone="gold">{vi.journey.editorBadge}</Badge> : null}
        </nav>

        <header className="flex flex-col gap-4">
          <div>
            <h1 className="text-4xl font-bold leading-none text-vmg-red">{stage.ageLabel}</h1>
            <p className="mt-2 text-xl font-bold uppercase">{stage.title}</p>
          </div>
          {stage.decider ? (
            <p>
              <Badge>{stage.decider}</Badge>
            </p>
          ) : null}
          {stage.note ? <p className="text-vmg-muted">{stage.note}</p> : null}
          {stage.outcomes.length > 0 ? (
            <section className="rounded-xl border border-vmg-faint bg-surface-card p-5" aria-labelledby="outcomes-heading">
              <h2 id="outcomes-heading" className="font-bold">
                {vi.journey.outcomes}
              </h2>
              <ul className="mt-3 grid gap-x-8 gap-y-2 md:grid-cols-2">
                {stage.outcomes.map((o) => (
                  <li key={o} className="flex gap-2">
                    <span aria-hidden className="text-vmg-red">
                      ✓
                    </span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </header>

        {sections.map((s) => (
          <LineSectionView key={s.line.key} section={s} ctx={ctx} />
        ))}

        {transitions.length > 0 ? (
          <section className="flex flex-col gap-3 rounded-xl bg-surface-card p-5" aria-labelledby="next-heading">
            <h2 id="next-heading" className="text-xl font-bold">
              {vi.journey.nextSteps}
            </h2>
            <ul className="flex flex-col gap-3">
              {transitions.map((t) => (
                <li key={`${t.from.code}>${t.to.code}`}>
                  <Link
                    href={`/brand/journey/stage/${t.toStage}#${t.to.code}`}
                    className="flex min-h-12 flex-col justify-center rounded-lg border border-vmg-faint px-4 py-2 hover:border-vmg-red"
                  >
                    <span className="text-sm text-vmg-muted">{lineShortName(t.line)}</span>
                    <span>
                      <span className="font-medium">{nodeLabel(t.from)}</span> <span aria-hidden>→</span>{" "}
                      <span className="font-bold">{nodeLabel(t.to)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="text-sm text-vmg-muted">{vi.journey.legend}</p>

        <nav className="flex justify-between gap-3 border-t border-vmg-faint pt-5" aria-label="Chuyển chặng">
          {previous ? (
            <Link href={`/brand/journey/stage/${previous.key}`} className="inline-flex min-h-12 flex-col justify-center">
              <span className="text-sm text-vmg-muted">← {vi.journey.previousStage}</span>
              <span className="font-bold text-vmg-red">{previous.ageLabel}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/brand/journey/stage/${next.key}`} className="inline-flex min-h-12 flex-col items-end justify-center">
              <span className="text-sm text-vmg-muted">{vi.journey.nextStage} →</span>
              <span className="font-bold text-vmg-red">{next.ageLabel}</span>
            </Link>
          ) : null}
        </nav>
      </div>
    </div>
  );
}
