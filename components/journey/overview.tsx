import Link from "next/link";
import { vi } from "@/lib/i18n/vi";
import type { JourneyMap } from "@/lib/journey/model";
import { buildOverview, lineShortName, nodeLabel, parallelLines } from "@/lib/journey/views";
import { Badge } from "./badges";
import { JourneySearch, type SearchItem } from "./journey-search";

const SEARCHABLE_KINDS = new Set(["level", "exam", "support_product", "product", "goal_group", "program_header"]);

/** Trang tổng quan: cả hành trình trong một màn hình, chọn chặng của khách để đi vào chi tiết. */
export function Overview({ map }: { map: JourneyMap }) {
  const overview = buildOverview(map);
  const parallels = parallelLines(map);
  const lineName = new Map(map.lines.map((l) => [l.key, lineShortName(l)]));
  const stageAge = new Map(map.stages.map((s) => [s.key, s.ageLabel]));

  const items: SearchItem[] = map.nodes
    .filter((n) => SEARCHABLE_KINDS.has(n.kind) && !n.extra.same_product_as)
    .map((n) => ({
      code: n.code,
      label: nodeLabel(n),
      stageKey: n.stageKey,
      stageAge: stageAge.get(n.stageKey) ?? "",
      lineName: lineName.get(n.lineKey) ?? "",
    }));

  return (
    <div className="flex flex-col gap-12">
      <JourneySearch items={items} />

      <section className="flex flex-col gap-4" aria-labelledby="stages-heading">
        <h2 id="stages-heading" className="text-xl font-bold">
          {vi.journey.chooseStage}
        </h2>
        <ol className="flex flex-col xl:flex-row xl:items-stretch">
          {overview.map((o, i) => (
            <li key={o.stage.key} className="contents">
              {i > 0 ? (
                <span aria-hidden className="flex items-center justify-center py-1 text-2xl text-vmg-faint xl:px-1 xl:py-0">
                  <span className="xl:hidden">↓</span>
                  <span className="hidden xl:inline">›</span>
                </span>
              ) : null}
              <Link
                href={`/brand/journey/stage/${o.stage.key}`}
                className="group flex min-w-0 flex-1 flex-col gap-4 rounded-xl border border-vmg-faint bg-surface-card p-5 hover:border-vmg-red md:grid md:grid-cols-[11rem_minmax(0,1fr)_minmax(0,1fr)] md:gap-6 xl:flex xl:flex-col xl:gap-4 xl:p-4"
              >
                <div className="flex flex-col items-start gap-3">
                  <div>
                    <p className="whitespace-nowrap text-3xl font-bold leading-none text-vmg-red xl:text-2xl">{o.stage.ageLabel}</p>
                    <p className="mt-2 text-sm font-bold uppercase leading-snug">{o.stage.title}</p>
                  </div>
                  {o.stage.decider ? <Badge>{o.stage.decider}</Badge> : null}
                </div>

                <div>
                  <p className="text-sm text-vmg-muted">{o.goals.length > 0 ? vi.journey.goals : vi.journey.mainProduct}</p>
                  {o.goals.length > 0 ? (
                    <ul className="mt-1 flex flex-col gap-0.5 font-medium">
                      {o.goals.map((g) => (
                        <li key={g} className="first-letter:uppercase">
                          {g.toLowerCase()}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 font-bold">{o.stage.leadProduct}</p>
                  )}
                </div>

                <div className="flex min-w-0 flex-col gap-3">
                  {o.lines.length > 0 ? (
                    <div>
                      <p className="text-sm text-vmg-muted">{vi.journey.studyAt}</p>
                      <ul className="mt-1 flex flex-wrap gap-1.5">
                        {o.lines.map((l) => (
                          <li key={l.key}>
                            <Badge>{l.name}</Badge>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {o.gaps.length > 0 ? (
                    <ul className="flex flex-col gap-1 text-sm text-vmg-muted">
                      {o.gaps.map((g) => (
                        <li key={g.line + g.text}>
                              <span className="font-medium">{g.line}:</span> {g.text}
                            </li>
                      ))}
                    </ul>
                  ) : null}

                  {o.next ? (
                    <p className="mt-auto border-t border-vmg-faint pt-3 text-sm">
                      <span className="text-vmg-muted">{vi.journey.then}:</span>{" "}
                      <span className="font-medium">{o.next.to.productName}</span>
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ol>
        <p className="text-sm text-vmg-muted">{vi.journey.ageNote}</p>
      </section>

      {parallels.length > 0 ? (
        <section className="flex flex-col gap-4" aria-labelledby="parallel-heading">
          <div>
            <h2 id="parallel-heading" className="text-xl font-bold">
              {vi.journey.parallelTitle}
            </h2>
            <p className="text-vmg-muted">{vi.journey.parallelIntro}</p>
          </div>
          <ul className="grid gap-4 md:grid-cols-3">
            {parallels.map(({ line, stages }) => (
              <li key={line.key} className="flex flex-col gap-3 rounded-xl border border-vmg-faint bg-surface-card p-4">
                <div>
                  <h3 className="text-lg font-bold">{lineShortName(line)}</h3>
                  {line.description ? <p className="text-vmg-muted">{line.description}</p> : null}
                </div>
                <ul className="mt-auto flex flex-wrap gap-2">
                  {stages.map((s) => (
                    <li key={s.key}>
                      <Link
                        href={`/brand/journey/stage/${s.key}`}
                        className="inline-flex min-h-11 items-center rounded-full border border-vmg-faint px-3 font-medium hover:border-vmg-red hover:text-vmg-red"
                      >
                        {s.ageLabel}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-sm text-vmg-muted">{vi.journey.legend}</p>
    </div>
  );
}
