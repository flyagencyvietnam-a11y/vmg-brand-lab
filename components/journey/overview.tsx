import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardLink } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { vi } from "@/lib/i18n/vi";
import type { JourneyMap } from "@/lib/journey/model";
import { buildOverview, lineShortName, parallelLines } from "@/lib/journey/views";

/** Tổng quan: cả hành trình trong một màn hình, chọn chặng của khách để đi vào chi tiết. */
export function Overview({ map }: { map: JourneyMap }) {
  const overview = buildOverview(map);
  const parallels = parallelLines(map);

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-4 py-12" aria-labelledby="stages-heading">
        <SectionHeading id="stages-heading" title={vi.journey.chooseStage} />
        <ol className="mt-8 flex flex-col xl:flex-row xl:items-stretch">
          {overview.map((o, i) => (
            <li key={o.stage.key} className="contents">
              {i > 0 ? (
                <span aria-hidden className="flex items-center justify-center py-2 text-ink-3 xl:px-1.5 xl:py-0">
                  <Icon name="arrow-down" className="size-6 xl:hidden" />
                  <Icon name="arrow-right" className="hidden size-6 xl:block" />
                </span>
              ) : null}
              <CardLink
                href={`/brand/journey/stage/${o.stage.key}`}
                className="group flex min-w-0 flex-1 flex-col gap-5 p-5 md:grid md:grid-cols-[11rem_minmax(0,1fr)_minmax(0,1fr)] md:gap-8 xl:flex xl:flex-col xl:gap-5"
              >
                <div className="flex flex-col items-start gap-3">
                  <p className="text-small font-bold tracking-caps text-gold">{String(i + 1).padStart(2, "0")}</p>
                  <div>
                    <p className="text-h1 leading-none font-bold whitespace-nowrap text-brand xl:text-h2">{o.stage.ageLabel}</p>
                    <p className="mt-2 text-small font-semibold uppercase leading-snug text-ink-2">{o.stage.title}</p>
                  </div>
                  {o.stage.decider ? (
                    <Badge>
                      <Icon name="user" className="size-4" />
                      {o.stage.decider}
                    </Badge>
                  ) : null}
                </div>

                <div>
                  <p className="text-small text-ink-3">{o.goals.length > 0 ? vi.journey.goals : vi.journey.mainProduct}</p>
                  {o.goals.length > 0 ? (
                    <ul className="mt-1 flex flex-col gap-1 font-semibold">
                      {o.goals.map((g) => (
                        <li key={g} className="first-letter:uppercase">
                          {g.toLowerCase()}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-h3 font-bold">{o.stage.leadProduct}</p>
                  )}
                </div>

                <div className="flex min-w-0 flex-col gap-4">
                  {o.lines.length > 0 ? (
                    <div>
                      <p className="text-small text-ink-3">{vi.journey.studyAt}</p>
                      <ul className="mt-1.5 flex flex-wrap gap-1.5">
                        {o.lines.map((l) => (
                          <li key={l.key}>
                            <Badge>{l.name}</Badge>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {o.gaps.length > 0 ? (
                    <ul className="flex flex-col gap-1.5 text-small text-ink-2">
                      {o.gaps.map((g) => (
                        <li key={g.line + g.text} className="flex gap-2">
                          <Icon name="info" className="mt-0.5 size-4 shrink-0 text-ink-3" />
                          <span>
                            <span className="font-semibold">{g.line}:</span> {g.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="mt-auto flex flex-col gap-3 border-t border-line pt-4">
                    {o.next ? (
                      <p className="text-small">
                        <span className="text-ink-3">{vi.journey.then}:</span>{" "}
                        <span className="font-semibold">{o.next.to.productName}</span>
                      </p>
                    ) : null}
                    <span className="inline-flex items-center gap-1.5 text-small font-semibold text-brand">
                      {vi.journey.viewDetail}
                      <Icon name="arrow-right" className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </CardLink>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-small text-ink-3">{vi.journey.ageNote}</p>
      </section>

      {parallels.length > 0 ? (
        <section className="border-y border-line bg-paper" aria-labelledby="parallel-heading">
          <div className="mx-auto w-full max-w-6xl px-4 py-12">
            <SectionHeading id="parallel-heading" title={vi.journey.parallelTitle} lead={vi.journey.parallelIntro} />
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {parallels.map(({ line, stages }) => (
                <li key={line.key}>
                  <Card className="flex h-full flex-col gap-4 bg-surface p-5">
                    <div>
                      <h3 className="text-h3 font-bold">{lineShortName(line)}</h3>
                      {line.description ? <p className="mt-1 text-ink-2">{line.description}</p> : null}
                    </div>
                    <ul className="mt-auto flex flex-wrap gap-2">
                      {stages.map((s) => (
                        <li key={s.key}>
                          <Link
                            href={`/brand/journey/stage/${s.key}`}
                            className="inline-flex min-h-11 items-center rounded-ctl border border-line-strong bg-paper px-3 text-small font-semibold hover:border-brand hover:text-brand"
                          >
                            {s.ageLabel}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="mx-auto w-full max-w-6xl px-4 py-8">
        <p className="flex items-start gap-3 text-small text-ink-2">
          <Badge tone="pending">{vi.journey.pending}</Badge>
          <span className="pt-0.5">{vi.journey.legend}</span>
        </p>
      </section>
    </>
  );
}
