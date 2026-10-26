import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { LineSectionView, makeCtx } from "@/components/journey/blocks";
import { StageNav } from "@/components/journey/stage-nav";
import { Badge } from "@/components/ui/badge";
import { Card, CardLink } from "@/components/ui/card";
import { Hero } from "@/components/ui/hero";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { vi } from "@/lib/i18n/vi";
import { loadJourneyMap } from "@/lib/journey/load";
import { buildStageSections, lineShortName, nodeLabel, stageTransitions } from "@/lib/journey/views";

export const metadata: Metadata = { title: `${vi.journey.title} · ${vi.app.name}` };

export default function StagePage(props: PageProps<"/brand/journey/stage/[key]">) {
  return (
    <>
      <AppHeader />
      <main className="flex-1">
        <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-10 text-ink-2">{vi.home.loading}</p>}>
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
    <>
      <Hero
        tone="plain"
        eyebrow={
          <span className="flex flex-wrap items-center gap-3">
            <Link href="/brand/journey" className="inline-flex min-h-11 items-center gap-2 underline-offset-4 hover:underline">
              <Icon name="arrow-left" className="size-4" />
              {vi.journey.backToOverview}
            </Link>
            <span aria-hidden>·</span>
            <span>{`${vi.journey.stageOf} ${index + 1}/${stages.length}`}</span>
            {map.audience === "editor" ? <Badge tone="gold">{vi.journey.editorBadge}</Badge> : null}
          </span>
        }
        title={stage.ageLabel}
        lead={stage.title}
      >
        {stage.decider ? (
          <p>
            <Badge tone="neutral">
              <Icon name="user" className="mt-0.5 size-4 shrink-0" />
              {stage.decider}
            </Badge>
          </p>
        ) : null}
        {stage.note ? <p className="max-w-2xl text-small text-ink-2">{stage.note}</p> : null}
      </Hero>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:gap-10">
        <StageNav stages={stages} current={stage.key} />

        <div className="flex min-w-0 flex-col gap-14">
          {stage.outcomes.length > 0 ? (
            <section aria-labelledby="outcomes-heading" className="flex flex-col gap-5">
              <SectionHeading id="outcomes-heading" title={vi.journey.outcomes} />
              <ul className="grid gap-3 md:grid-cols-2">
                {stage.outcomes.map((o, i) => (
                  <li key={o} className="animate-rise" style={{ animationDelay: `${i * 60}ms` }}>
                    <Card tone="blush" className="flex h-full gap-3 p-4">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-on-brand">
                        <Icon name="check" className="size-4" />
                      </span>
                      <span>{o}</span>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {sections.map((s) => (
            <LineSectionView key={s.line.key} section={s} ctx={ctx} />
          ))}

          {transitions.length > 0 ? (
            <section aria-labelledby="next-heading" className="flex flex-col gap-5">
              <SectionHeading id="next-heading" title={vi.journey.nextSteps} />
              <ul className="flex flex-col gap-3">
                {transitions.map((t) => (
                  <li key={`${t.from.code}>${t.to.code}`}>
                    <CardLink
                      href={`/brand/journey/stage/${t.toStage}#${t.to.code}`}
                      className="flex items-center justify-between gap-4 p-5"
                    >
                      <span className="flex flex-col">
                        <span className="text-small text-ink-3">{lineShortName(t.line)}</span>
                        <span>
                          <span className="font-medium">{nodeLabel(t.from)}</span>{" "}
                          <Icon name="arrow-right" className="mx-1 inline size-4 text-brand" />{" "}
                          <span className="font-bold">{nodeLabel(t.to)}</span>
                        </span>
                      </span>
                      <Icon name="arrow-right" className="size-5 shrink-0 text-brand" />
                    </CardLink>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <Card tone="champagne" className="flex items-start gap-3 p-4 text-small text-ink-2">
            <Badge tone="pending">{vi.journey.pending}</Badge>
            <span className="pt-0.5">{vi.journey.legend}</span>
          </Card>

          <nav className="flex items-stretch justify-between gap-3 border-t border-line pt-6" aria-label="Chuyển chặng">
            {previous ? (
              <CardLink href={`/brand/journey/stage/${previous.key}`} className="flex min-h-14 flex-col justify-center px-4 py-2">
                <span className="text-small text-ink-3">← {vi.journey.previousStage}</span>
                <span className="font-bold text-brand">{previous.ageLabel}</span>
              </CardLink>
            ) : (
              <span />
            )}
            {next ? (
              <CardLink href={`/brand/journey/stage/${next.key}`} className="flex min-h-14 flex-col items-end justify-center px-4 py-2">
                <span className="text-small text-ink-3">{vi.journey.nextStage} →</span>
                <span className="font-bold text-brand">{next.ageLabel}</span>
              </CardLink>
            ) : null}
          </nav>
        </div>
      </div>
    </>
  );
}
