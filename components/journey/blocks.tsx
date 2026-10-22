import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { vi } from "@/lib/i18n/vi";
import { proposedLinks, type JourneyBrand, type JourneyMap, type JourneyNode } from "@/lib/journey/model";
import {
  lineShortName,
  nodeLabel,
  type Block,
  type CardBlock,
  type GoalBlock,
  type LaneSection,
  type LineSection,
  type PathBlock,
} from "@/lib/journey/views";
import { BrandBadge, PendingBadges } from "./badges";

export type JourneyCtx = {
  map: JourneyMap;
  byCode: Map<string, JourneyNode>;
  brandBySlug: Map<string, JourneyBrand>;
  stageAge: Map<string, string>;
};

export function makeCtx(map: JourneyMap): JourneyCtx {
  return {
    map,
    byCode: new Map(map.nodes.map((n) => [n.code, n])),
    brandBySlug: new Map(map.brands.map((b) => [b.slug, b])),
    stageAge: new Map(map.stages.map((s) => [s.key, s.ageLabel])),
  };
}

const anchor = (n: JourneyNode) => `/brand/journey/stage/${n.stageKey}#${n.code}`;

/** Thông tin phụ của một ô: cam kết, mốc thời gian, ghi chú biên tập, liên kết đề xuất. */
function NodeExtras({ node, ctx }: { node: JourneyNode; ctx: JourneyCtx }) {
  const links = proposedLinks(ctx.map, node.code);
  const span =
    node.stageSpan && node.stageSpan.length > 1 ? node.stageSpan.map((s) => ctx.stageAge.get(s) ?? s).join(", ") : null;

  return (
    <>
      {node.commitmentText ? (
        <p className="mt-2">
          <strong>{vi.journey.commitment}:</strong> {node.commitmentText}
        </p>
      ) : null}
      {node.timedNotes.length > 0 ? (
        <ul className="mt-2 list-disc pl-5">
          {node.timedNotes.map((t) => (
            <li key={t.text}>
              {t.text}
              {t.needsConfirm ? <span className="text-ink-2"> ({vi.journey.notConfirmed})</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {span ? <p className="mt-2 text-small text-ink-2">{`${vi.journey.spans}: ${span}`}</p> : null}

      {node.verifyNote || node.brandNote ? (
        <details className="group/notes mt-3 rounded-ctl border border-dashed border-gold px-3 py-2">
          <summary className="flex min-h-9 cursor-pointer items-center justify-between gap-2 text-small font-semibold text-gold">
            {vi.journey.editorNotes}
            <Icon name="chevron-down" className="size-4 transition-transform group-open/notes:rotate-180" />
          </summary>
          {node.verifyNote ? <p className="mt-2 text-small">{`${vi.journey.verifyNote}: ${node.verifyNote}`}</p> : null}
          {node.brandNote ? <p className="mt-2 text-small">{`${vi.journey.brandNote}: ${node.brandNote}`}</p> : null}
        </details>
      ) : null}

      {links.length > 0 ? (
        <details className="group/links mt-3 rounded-ctl border border-dashed border-line-strong px-3 py-2">
          <summary className="flex min-h-9 cursor-pointer items-center justify-between gap-2 text-small font-semibold text-ink-2">
            <span className="inline-flex items-center gap-2">
              <Icon name="link" className="size-4" />
              {`${vi.journey.proposedLinks} (${links.length})`}
            </span>
            <Icon name="chevron-down" className="size-4 transition-transform group-open/links:rotate-180" />
          </summary>
          <p className="mt-2 text-small text-ink-2">{vi.journey.proposedHint}</p>
          <ul className="mt-1 flex flex-col">
            {links.map(({ other, edge, outgoing }) => {
              const target = ctx.byCode.get(other);
              if (!target) return null;
              return (
                <li key={`${edge.from}>${edge.to}:${edge.kind}`}>
                  <Link href={anchor(target)} className="flex min-h-11 flex-col justify-center text-small text-brand hover:text-brand-hover">
                    <span className="font-semibold underline">
                      <span aria-hidden className="no-underline">
                        {edge.twoWay ? "↔" : outgoing ? "→" : "←"}{" "}
                      </span>
                      {nodeLabel(target)}
                      <span className="font-normal text-ink-2 no-underline"> ({ctx.stageAge.get(target.stageKey)})</span>
                    </span>
                    {edge.label ? <span className="text-ink-2">{edge.label}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </details>
      ) : null}
    </>
  );
}

function Step({
  node,
  number,
  last,
  title,
  ctx,
}: {
  node: JourneyNode;
  number: number | null;
  last: boolean;
  title: string;
  ctx: JourneyCtx;
}) {
  const isExam = node.kind === "exam";
  const heading = isExam ? nodeLabel(node) : (node.itemName ?? node.productName);
  const showProduct = !isExam && node.productName !== title && node.itemName !== null;

  return (
    <li id={node.code} className="relative scroll-mt-24 pb-7 pl-12 last:pb-0 target:rounded-ctl target:bg-brand-soft">
      {last ? null : <span aria-hidden className="absolute bottom-0 left-[13px] top-8 w-0.5 bg-line-strong" />}
      {isExam ? (
        <span aria-hidden className="absolute left-[5px] top-1 size-[18px] rotate-45 rounded-[3px] border-2 border-gold-mark bg-paper" />
      ) : (
        <span
          aria-hidden
          className="absolute left-0 top-0.5 flex size-7 items-center justify-center rounded-full bg-brand text-small font-bold text-on-brand"
        >
          {number}
        </span>
      )}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {isExam ? <Badge tone="gold">{vi.journey.examTag}</Badge> : null}
        <h5 className="text-body font-bold">{heading}</h5>
        {node.durationText ? <span className="text-small text-ink-2">· {node.durationText}</span> : null}
      </div>
      {showProduct ? <p className="text-small uppercase text-ink-2">{node.productName}</p> : null}
      {node.description ? <p className="mt-1 text-ink-2">{node.description}</p> : null}
      <NodeExtras node={node} ctx={ctx} />
    </li>
  );
}

function PathCard({ block, ctx }: { block: PathBlock; ctx: JourneyCtx }) {
  const brand = block.brandSlug ? ctx.brandBySlug.get(block.brandSlug) : undefined;
  const first = block.nodes.find((n) => n.kind !== "exam") ?? block.nodes[0]!;

  return (
    <Card className="p-5 md:p-6">
      <header className="flex flex-wrap items-center gap-2">
        <h4 className="text-h3 leading-tight font-bold uppercase">{block.title}</h4>
        {brand ? <BrandBadge brand={brand} /> : null}
        <PendingBadges node={first} />
      </header>
      <ol className="mt-6 flex flex-col">
        {block.nodes.map((n, i) => (
          <Step
            key={n.code}
            node={n}
            // Chỉ ô cấp học được đánh số; cột mốc thi không có số.
            number={n.kind === "exam" ? null : block.nodes.slice(0, i + 1).filter((x) => x.kind !== "exam").length}
            last={i === block.nodes.length - 1}
            title={block.title}
            ctx={ctx}
          />
        ))}
      </ol>
    </Card>
  );
}

function SingleCard({
  node,
  duplicates = [],
  attachedTo = [],
  ctx,
}: {
  node: CardBlock["node"];
  duplicates?: JourneyNode[];
  attachedTo?: JourneyNode[];
  ctx: JourneyCtx;
}) {
  const brand = node.brandSlug ? ctx.brandBySlug.get(node.brandSlug) : undefined;
  return (
    <Card id={node.code} className="scroll-mt-24 p-5 target:border-brand">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-h3 leading-tight font-bold uppercase">{node.productName}</h4>
        {brand ? <BrandBadge brand={brand} /> : null}
        <PendingBadges node={node} />
      </div>
      {node.itemName ? <p className="mt-1 font-medium">{node.itemName}</p> : null}
      {node.durationText ? <p className="text-small text-ink-2">{node.durationText}</p> : null}
      {node.description ? <p className="mt-2 text-ink-2">{node.description}</p> : null}
      {attachedTo.length > 0 ? (
        <div className="mt-2 text-small">
          <p className="text-ink-3">{vi.journey.attachedTo}:</p>
          <ul className="flex flex-wrap gap-x-5">
            {attachedTo.map((a) => (
              <li key={a.code}>
                <Link href={anchor(a)} className="inline-flex min-h-11 items-center font-semibold text-brand underline hover:text-brand-hover">
                  {nodeLabel(a)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {/* Mốc neo cho các ô đã gộp, để liên kết và kết quả tìm kiếm tới ô đó vẫn đúng chỗ. */}
      {duplicates.map((d) => (
        <span key={d.code} id={d.code} className="scroll-mt-24" />
      ))}
      <NodeExtras node={node} ctx={ctx} />
    </Card>
  );
}

function GoalGroup({ block, ctx }: { block: GoalBlock; ctx: JourneyCtx }) {
  return (
    <div id={block.header.code} className="flex scroll-mt-24 flex-col gap-3">
      <div>
        <h3 className="text-small font-bold uppercase tracking-caps text-gold">{block.header.productName}</h3>
        {block.header.itemName ? <p className="text-ink-2">{block.header.itemName}</p> : null}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {block.products.map((p) => (
          <SingleCard key={p.code} node={p} ctx={ctx} />
        ))}
      </div>
    </div>
  );
}

function BlockView({ block, ctx }: { block: Block; ctx: JourneyCtx }) {
  switch (block.kind) {
    case "path":
      return <PathCard block={block} ctx={ctx} />;
    case "card":
      return <SingleCard node={block.node} duplicates={block.duplicates} attachedTo={block.attachedTo} ctx={ctx} />;
    case "goal":
      return <GoalGroup block={block} ctx={ctx} />;
    case "intro":
      return (
        <div id={block.node.code} className="rounded-card border border-brand-tint bg-brand-soft p-5">
          <p className="font-bold uppercase">{block.node.productName}</p>
          {block.node.itemName ? <p className="font-medium">{block.node.itemName}</p> : null}
          {block.node.description ? <p className="mt-1 text-ink-2">{block.node.description}</p> : null}
        </div>
      );
    case "note":
      return (
        <p className="flex gap-3 rounded-card border border-dashed border-line-strong bg-sunken p-4 text-ink-2">
          <Icon name="info" className="mt-0.5 size-5 shrink-0" />
          {block.node.productName}
        </p>
      );
    case "banner":
      return (
        <p className="on-brand rounded-card bg-brand px-5 py-4 font-bold uppercase tracking-caps text-on-brand">
          {block.node.productName}
        </p>
      );
  }
}

function Lane({ lane, showLabel, ctx }: { lane: LaneSection; showLabel: boolean; ctx: JourneyCtx }) {
  const hasPath = lane.blocks.some((b) => b.kind === "path");
  const special = lane.lane === null && lane.blocks.every((b) => b.kind === "intro" || b.kind === "note" || b.kind === "banner");
  return (
    <div className={`flex flex-col gap-3 ${hasPath ? "" : "lg:col-span-2"}`}>
      {showLabel && lane.lane ? (
        <h3 className="text-small font-bold uppercase tracking-caps text-gold">{lane.lane.label}</h3>
      ) : null}
      <div className={hasPath || special ? "flex flex-col gap-4" : "grid gap-4 md:grid-cols-2"}>
        {lane.blocks.map((b, i) => (
          <BlockView key={i} block={b} ctx={ctx} />
        ))}
      </div>
    </div>
  );
}

export function LineSectionView({ section, ctx }: { section: LineSection; ctx: JourneyCtx }) {
  const labelled = section.lanes.filter((l) => l.lane !== null).length > 1;
  return (
    <section className="flex flex-col gap-5">
      <header>
        <span aria-hidden className="mb-3 block h-0.5 w-10 bg-gold-mark" />
        <h2 className="text-h2 font-bold">{lineShortName(section.line)}</h2>
        {section.line.description ? <p className="mt-1 max-w-3xl text-ink-2">{section.line.description}</p> : null}
      </header>
      <div className="grid items-start gap-x-6 gap-y-6 lg:grid-cols-2">
        {section.lanes.map((lane, i) => (
          <Lane key={lane.lane?.key ?? `special-${i}`} lane={lane} showLabel={labelled} ctx={ctx} />
        ))}
      </div>
    </section>
  );
}
