import Link from "next/link";
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
import { Badge, BrandBadge, PendingBadges } from "./badges";

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
              {t.needsConfirm ? <span className="text-vmg-muted"> ({vi.journey.notConfirmed})</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {span ? <p className="mt-2 text-vmg-muted">{`${vi.journey.spans}: ${span}`}</p> : null}

      {node.verifyNote || node.brandNote ? (
        <details className="mt-2 rounded-md border border-dashed border-vmg-gold px-3 py-2">
          <summary className="cursor-pointer font-medium">{vi.journey.editorNotes}</summary>
          {node.verifyNote ? <p className="mt-2">{`${vi.journey.verifyNote}: ${node.verifyNote}`}</p> : null}
          {node.brandNote ? <p className="mt-2">{`${vi.journey.brandNote}: ${node.brandNote}`}</p> : null}
        </details>
      ) : null}

      {links.length > 0 ? (
        <details className="mt-2 rounded-md border border-dashed border-vmg-faint px-3 py-2">
          <summary className="cursor-pointer text-vmg-muted">{`${vi.journey.proposedLinks} (${links.length})`}</summary>
          <p className="mt-2 text-sm text-vmg-muted">{vi.journey.proposedHint}</p>
          <ul className="mt-2 flex flex-col gap-1">
            {links.map(({ other, edge, outgoing }) => {
              const target = ctx.byCode.get(other);
              if (!target) return null;
              return (
                <li key={`${edge.from}>${edge.to}:${edge.kind}`}>
                  <Link href={anchor(target)} className="inline-flex min-h-11 flex-col justify-center text-vmg-red underline">
                    <span>
                      <span aria-hidden>{edge.twoWay ? "↔" : outgoing ? "→" : "←"}</span> {nodeLabel(target)}
                      <span className="text-vmg-muted no-underline"> ({ctx.stageAge.get(target.stageKey)})</span>
                    </span>
                    {edge.label ? <span className="text-sm text-vmg-muted no-underline">{edge.label}</span> : null}
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
    <li id={node.code} className="relative scroll-mt-24 pb-6 pl-11 last:pb-0 target:rounded-md target:bg-surface">
      {last ? null : <span aria-hidden className="absolute bottom-0 left-[11px] top-7 w-0.5 bg-vmg-faint" />}
      {isExam ? (
        <span aria-hidden className="absolute left-[3px] top-1 size-[18px] rotate-45 rounded-sm border-2 border-vmg-gold bg-surface-card" />
      ) : (
        <span
          aria-hidden
          className="absolute left-0 top-0.5 flex size-6 items-center justify-center rounded-full bg-vmg-red text-sm font-bold text-white"
        >
          {number}
        </span>
      )}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {isExam ? <Badge tone="gold">{vi.journey.examTag}</Badge> : null}
        <h5 className="text-base font-bold">{heading}</h5>
        {node.durationText ? <span className="text-vmg-muted">· {node.durationText}</span> : null}
      </div>
      {showProduct ? <p className="text-sm uppercase text-vmg-muted">{node.productName}</p> : null}
      {node.description ? <p className="mt-1">{node.description}</p> : null}
      <NodeExtras node={node} ctx={ctx} />
    </li>
  );
}

function PathCard({ block, ctx }: { block: PathBlock; ctx: JourneyCtx }) {
  const brand = block.brandSlug ? ctx.brandBySlug.get(block.brandSlug) : undefined;
  const first = block.nodes.find((n) => n.kind !== "exam") ?? block.nodes[0]!;

  return (
    <section className="rounded-xl border border-vmg-faint bg-surface-card p-5">
      <header className="flex flex-wrap items-center gap-2">
        <h4 className="text-lg font-bold uppercase leading-tight">{block.title}</h4>
        {brand ? <BrandBadge brand={brand} /> : null}
        <PendingBadges node={first} />
      </header>
      <ol className="mt-5 flex flex-col">
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
    </section>
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
    <article
      id={node.code}
      className="scroll-mt-24 rounded-xl border border-vmg-faint bg-surface-card p-5 target:border-vmg-red"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-lg font-bold uppercase leading-tight">{node.productName}</h4>
        {brand ? <BrandBadge brand={brand} /> : null}
        <PendingBadges node={node} />
      </div>
      {node.itemName ? <p className="mt-1 text-base">{node.itemName}</p> : null}
      {node.durationText ? <p className="text-vmg-muted">{node.durationText}</p> : null}
      {node.description ? <p className="mt-2">{node.description}</p> : null}
      {attachedTo.length > 0 ? (
        <p className="mt-2">
          <span className="text-vmg-muted">{vi.journey.attachedTo}: </span>
          {attachedTo.map((a, i) => (
            <span key={a.code}>
              {i > 0 ? ", " : null}
              <Link href={anchor(a)} className="text-vmg-red underline">
                {nodeLabel(a)}
              </Link>
            </span>
          ))}
        </p>
      ) : null}
      {/* Mốc neo cho các ô đã gộp, để liên kết và kết quả tìm kiếm tới ô đó vẫn đúng chỗ. */}
      {duplicates.map((d) => (
        <span key={d.code} id={d.code} className="scroll-mt-24" />
      ))}
      <NodeExtras node={node} ctx={ctx} />
    </article>
  );
}

function GoalGroup({ block, ctx }: { block: GoalBlock; ctx: JourneyCtx }) {
  return (
    <div id={block.header.code} className="flex scroll-mt-24 flex-col gap-3">
      <div>
        <h3 className="text-base font-bold uppercase text-vmg-gold">{block.header.productName}</h3>
        {block.header.itemName ? <p className="text-vmg-muted">{block.header.itemName}</p> : null}
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
        <div id={block.node.code} className="rounded-xl border border-vmg-faint bg-surface p-4">
          <p className="font-bold uppercase">{block.node.productName}</p>
          {block.node.itemName ? <p>{block.node.itemName}</p> : null}
          {block.node.description ? <p className="mt-1 text-vmg-muted">{block.node.description}</p> : null}
        </div>
      );
    case "note":
      return (
        <p className="flex gap-2 rounded-lg border border-dashed border-vmg-faint p-3 text-vmg-muted">
          <span aria-hidden>ⓘ</span>
          {block.node.productName}
        </p>
      );
    case "banner":
      return <p className="rounded-lg bg-vmg-charcoal px-4 py-3 font-bold uppercase text-white">{block.node.productName}</p>;
  }
}

function Lane({ lane, showLabel, ctx }: { lane: LaneSection; showLabel: boolean; ctx: JourneyCtx }) {
  const hasPath = lane.blocks.some((b) => b.kind === "path");
  const special = lane.lane === null && lane.blocks.every((b) => b.kind === "intro" || b.kind === "note" || b.kind === "banner");
  return (
    <div className={`flex flex-col gap-3 ${hasPath ? "" : "lg:col-span-2"}`}>
      {showLabel && lane.lane ? (
        <h3 className="text-sm font-bold uppercase tracking-wide text-vmg-gold">{lane.lane.label}</h3>
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
    <section className="flex flex-col gap-4">
      <header>
        <h2 className="text-xl font-bold">{lineShortName(section.line)}</h2>
        {section.line.description ? <p className="text-vmg-muted">{section.line.description}</p> : null}
      </header>
      <div className="grid items-start gap-x-6 gap-y-5 lg:grid-cols-2">
        {section.lanes.map((lane, i) => (
          <Lane key={lane.lane?.key ?? `special-${i}`} lane={lane} showLabel={labelled} ctx={ctx} />
        ))}
      </div>
    </section>
  );
}
