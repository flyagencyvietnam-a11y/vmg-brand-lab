"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { vi } from "@/lib/i18n/vi";
import {
  nodeMatches,
  nodesByCode,
  proposedLinks,
  sequenceNeighbours,
  type JourneyBrand,
  type JourneyLine,
  type JourneyMap,
  type JourneyNode,
} from "@/lib/journey/model";

type Ctx = {
  selected: string | null;
  onSelect: (code: string) => void;
  isDimmed: (node: JourneyNode) => boolean;
  brandBySlug: Map<string, JourneyBrand>;
  showProposed: boolean;
  hasProposed: Set<string>;
  sequencePairs: Set<string>;
};

export function JourneyExplorer({ map, initialSelected }: { map: JourneyMap; initialSelected: string | null }) {
  const byCode = useMemo(() => nodesByCode(map), [map]);
  const brandBySlug = useMemo(() => new Map(map.brands.map((b) => [b.slug, b])), [map.brands]);
  const lineByKey = useMemo(() => new Map(map.lines.map((l) => [l.key, l])), [map.lines]);
  const stageByKey = useMemo(() => new Map(map.stages.map((s) => [s.key, s])), [map.stages]);

  const [selected, setSelected] = useState<string | null>(initialSelected && byCode.has(initialSelected) ? initialSelected : null);
  const [query, setQuery] = useState("");
  const [focusBrand, setFocusBrand] = useState<string | null>(null);
  const [focusLine, setFocusLine] = useState<string | null>(null);
  const [mobileLine, setMobileLine] = useState<string>(() => {
    const start = initialSelected ? byCode.get(initialSelected)?.lineKey : undefined;
    return start ?? map.lines[0]?.key ?? "";
  });
  const [showProposed, setShowProposed] = useState(true);

  const matches = useMemo(
    () => (query.trim() === "" ? null : new Set(map.nodes.filter((n) => nodeMatches(n, query)).map((n) => n.code))),
    [map.nodes, query],
  );

  const sequencePairs = useMemo(
    () => new Set(map.edges.filter((e) => e.kind === "sequence").map((e) => `${e.from}>${e.to}`)),
    [map.edges],
  );
  const hasProposed = useMemo(() => {
    const set = new Set<string>();
    for (const e of map.edges) {
      if (!e.proposed) continue;
      set.add(e.from);
      set.add(e.to);
    }
    return set;
  }, [map.edges]);

  const legendBrands = useMemo(() => {
    const used = new Set(map.nodes.flatMap((n) => (n.brandSlug ? [n.brandSlug] : [])));
    return map.brands.filter((b) => used.has(b.slug));
  }, [map.nodes, map.brands]);

  const scrollToNode = useCallback((code: string) => {
    // Có hai bản bố cục (máy tính, điện thoại); chỉ bản đang hiển thị mới có offsetParent.
    const el = [...document.querySelectorAll<HTMLElement>(`[data-node="${code}"]`)].find((e) => e.offsetParent !== null);
    el?.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
  }, []);

  const select = useCallback(
    (code: string | null) => {
      setSelected(code);
      const url = new URL(window.location.href);
      if (code) url.searchParams.set("node", code);
      else url.searchParams.delete("node");
      window.history.replaceState(null, "", url);
      if (code) {
        const node = byCode.get(code);
        if (node) setMobileLine(node.lineKey);
      }
    },
    [byCode],
  );

  // Nhảy tới ô khác từ ngăn xem nhanh: cuộn bản đồ tới ô đó khi bố cục đã cập nhật.
  const jump = useCallback(
    (code: string) => {
      select(code);
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToNode(code)));
    },
    [select, scrollToNode],
  );

  // Gõ tìm kiếm: cuộn tới ô khớp đầu tiên (và chuyển sang line của ô đó trên điện thoại).
  const onQueryChange = (value: string) => {
    setQuery(value);
    const first = map.nodes.find((n) => nodeMatches(n, value));
    if (!first) return;
    setMobileLine(first.lineKey);
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToNode(first.code)));
  };

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") select(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, select]);

  const isDimmed = (node: JourneyNode) => {
    if (matches && matches.size > 0 && !matches.has(node.code)) return true;
    if (focusBrand && node.brandSlug !== focusBrand) return true;
    return false;
  };

  const ctx: Ctx = { selected, onSelect: (c) => select(c), isDimmed, brandBySlug, showProposed, hasProposed, sequencePairs };
  const selectedNode = selected ? byCode.get(selected) : undefined;

  if (map.nodes.length === 0) {
    return <p className="rounded-lg bg-surface-card p-4 text-vmg-muted">{vi.journey.empty}</p>;
  }

  const nodesIn = (lineKey: string, stageKey: string) =>
    map.nodes.filter((n) => n.lineKey === lineKey && n.stageKey === stageKey).sort((a, b) => a.sort - b.sort);

  return (
    <div className="flex flex-col gap-4">
      {map.audience === "editor" ? (
        <p className="rounded-md border border-vmg-gold bg-surface-card p-3 text-sm text-vmg-charcoal">{vi.journey.editorBanner}</p>
      ) : null}

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={vi.journey.search}
            aria-label={vi.journey.search}
            className="min-h-11 w-full max-w-sm rounded-md border border-vmg-faint bg-surface-card px-3 text-base focus:outline-2 focus:outline-vmg-red"
          />
          <label className="flex min-h-11 items-center gap-2">
            <input
              type="checkbox"
              checked={showProposed}
              onChange={(e) => setShowProposed(e.target.checked)}
              className="size-5 accent-vmg-red"
            />
            <span>{vi.journey.showProposed}</span>
          </label>
        </div>
        {matches && matches.size === 0 ? <p className="text-vmg-muted">{vi.journey.searchNone}</p> : null}
        {showProposed ? <p className="text-sm text-vmg-muted">{vi.journey.proposedHint}</p> : null}

        {legendBrands.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2" aria-label={vi.journey.brands}>
            {legendBrands.map((b) => (
              <button
                key={b.slug}
                type="button"
                aria-pressed={focusBrand === b.slug}
                onClick={() => setFocusBrand(focusBrand === b.slug ? null : b.slug)}
                className={`min-h-9 rounded-full border px-3 text-sm ${focusBrand === b.slug ? "border-vmg-red bg-vmg-red text-white" : "border-vmg-faint bg-surface-card"}`}
              >
                <BrandDot brand={b} /> {b.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Chọn line: trên điện thoại là thẻ chuyển line, trên máy tính là làm nổi line. */}
      <nav aria-label={vi.journey.lines} className="md:hidden">
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {map.lines.map((l) => (
            <li key={l.key} className="shrink-0">
              <button
                type="button"
                aria-pressed={mobileLine === l.key}
                onClick={() => setMobileLine(l.key)}
                className={`min-h-11 rounded-md border px-3 text-sm font-medium ${mobileLine === l.key ? "border-vmg-red bg-vmg-red text-white" : "border-vmg-faint bg-surface-card"}`}
              >
                {shortLineLabel(l)}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Máy tính: lưới line theo chặng */}
      <div className="hidden overflow-x-auto md:block">
        <div
          className="grid w-max gap-x-3 gap-y-3"
          style={{ gridTemplateColumns: `150px ${map.lines.map((l) => (l.sublanes.length > 1 ? `${l.sublanes.length * 220 + (l.sublanes.length - 1) * 12}px` : "260px")).join(" ")}` }}
        >
          <div />
          {map.lines.map((l) => (
            <button
              key={l.key}
              type="button"
              aria-pressed={focusLine === l.key}
              onClick={() => setFocusLine(focusLine === l.key ? null : l.key)}
              className={`rounded-md border p-2 text-left ${focusLine === l.key ? "border-vmg-red bg-surface-card" : "border-vmg-faint bg-surface-card"} ${focusLine && focusLine !== l.key ? "opacity-50" : ""}`}
            >
              <span className="block text-xs font-bold uppercase tracking-wide text-vmg-gold">{l.label}</span>
              {l.description ? <span className="mt-1 block text-sm text-vmg-muted">{l.description}</span> : null}
            </button>
          ))}

          {map.stages.map((s) => (
            <StageRow key={s.key}>
              <div className="pt-1">
                <Link href={`/brand/journey/stage/${s.key}`} className="block rounded-md p-1 hover:bg-surface-card">
                  <span className="block text-sm font-bold text-vmg-red">{s.ageLabel}</span>
                  <span className="block text-sm font-bold uppercase">{s.title}</span>
                  {s.decider ? <span className="mt-1 block text-xs text-vmg-muted">{s.decider}</span> : null}
                </Link>
              </div>
              {map.lines.map((l) => (
                <div key={l.key} className={`flex flex-col gap-2 ${focusLine && focusLine !== l.key ? "opacity-40" : ""}`}>
                  <Cell line={l} nodes={nodesIn(l.key, s.key)} stageByKey={stageByKey} ctx={ctx} sideBySide />
                </div>
              ))}
            </StageRow>
          ))}
        </div>
        <p className="mt-3 text-sm text-vmg-muted">{vi.journey.ageNote}</p>
      </div>

      {/* Điện thoại: một line mỗi lần, chặng là mục gập */}
      <div className="flex flex-col gap-3 md:hidden">
        {(() => {
          const line = lineByKey.get(mobileLine);
          if (!line) return null;
          return (
            <>
              {line.description ? <p className="text-sm text-vmg-muted">{line.description}</p> : null}
              {map.stages.map((s) => {
                const nodes = nodesIn(line.key, s.key);
                if (nodes.length === 0) return null;
                return (
                  <details key={s.key} open className="rounded-lg bg-surface-card p-3">
                    <summary className="min-h-11 cursor-pointer py-2 font-bold">
                      <span className="text-vmg-red">{s.ageLabel}</span> · <span className="uppercase">{s.title}</span>
                    </summary>
                    <div className="mt-2 flex flex-col gap-2">
                      <Cell line={line} nodes={nodes} stageByKey={stageByKey} ctx={ctx} />
                      <Link href={`/brand/journey/stage/${s.key}`} className="text-sm text-vmg-red underline">
                        {vi.journey.openStage}
                      </Link>
                    </div>
                  </details>
                );
              })}
              <p className="text-sm text-vmg-muted">{vi.journey.ageNote}</p>
            </>
          );
        })()}
      </div>

      {selectedNode ? (
        <QuickView
          node={selectedNode}
          map={map}
          byCode={byCode}
          lineByKey={lineByKey}
          stageByKey={stageByKey}
          brandBySlug={brandBySlug}
          showProposed={showProposed}
          onJump={jump}
          onClose={() => select(null)}
        />
      ) : null}
    </div>
  );
}

// Mỗi chặng là một hàng của lưới; fragment để các ô nằm trực tiếp trên lưới.
function StageRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function shortLineLabel(line: JourneyLine): string {
  return line.label.replace(/^LINE (PHỤ|1 \(CHÍNH\)|2) · /, "").replace(/^TẦNG ĐÍCH.*/, "ĐÍCH");
}

function BrandDot({ brand }: { brand: JourneyBrand }) {
  return (
    <span
      aria-hidden
      className="mr-1 inline-block size-2.5 rounded-full border border-vmg-faint align-middle"
      style={brand.colorPrimary ? { backgroundColor: brand.colorPrimary } : undefined}
    />
  );
}

function Cell({
  line,
  nodes,
  stageByKey,
  ctx,
  sideBySide = false,
}: {
  line: JourneyLine;
  nodes: JourneyNode[];
  stageByKey: Map<string, { ageLabel: string }>;
  ctx: Ctx;
  /** Máy tính: các cột con của line đặt cạnh nhau, đúng thứ tự trong file nguồn. */
  sideBySide?: boolean;
}) {
  if (nodes.length === 0) return null;

  // Tầng đích: mỗi nhóm đích có tiêu đề rồi các sản phẩm của nhóm.
  if (line.kind === "goal_tier") {
    const groups = nodes.filter((n) => n.kind === "goal_group");
    return (
      <div className="flex flex-col gap-3">
        {groups.map((g) => (
          <div key={g.code} className="flex flex-col gap-2 rounded-md border border-vmg-faint p-2">
            <NodeCard node={g} stageByKey={stageByKey} ctx={ctx} />
            {nodes
              .filter((n) => n.groupCode === g.code)
              .map((n) => (
                <NodeCard key={n.code} node={n} stageByKey={stageByKey} ctx={ctx} />
              ))}
          </div>
        ))}
      </div>
    );
  }

  // Line có cột con (Line 1): ghi nhãn cột con khi ô có nhiều cột con.
  const lanes = line.sublanes.length > 0 ? line.sublanes.filter((l) => nodes.some((n) => n.laneKey === l.key)) : [];
  if (sideBySide && line.sublanes.length > 1) {
    return (
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${line.sublanes.length}, minmax(0, 1fr))` }}>
        {line.sublanes.map((lane) => {
          const laneNodes = nodes.filter((n) => n.laneKey === lane.key);
          return (
            <div key={lane.key} className="flex flex-col gap-2">
              {laneNodes.length > 0 && lanes.length > 1 ? (
                <p className="text-xs font-bold uppercase tracking-wide text-vmg-gold">{lane.label}</p>
              ) : null}
              <NodeList nodes={laneNodes} stageByKey={stageByKey} ctx={ctx} />
            </div>
          );
        })}
      </div>
    );
  }
  if (lanes.length > 1) {
    return (
      <div className="flex flex-col gap-3">
        {lanes.map((lane) => (
          <div key={lane.key} className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-wide text-vmg-gold">{lane.label}</p>
            <NodeList nodes={nodes.filter((n) => n.laneKey === lane.key)} stageByKey={stageByKey} ctx={ctx} />
          </div>
        ))}
      </div>
    );
  }
  return <NodeList nodes={nodes} stageByKey={stageByKey} ctx={ctx} />;
}

function NodeList({
  nodes,
  stageByKey,
  ctx,
}: {
  nodes: JourneyNode[];
  stageByKey: Map<string, { ageLabel: string }>;
  ctx: Ctx;
}) {
  return (
    <>
      {nodes.map((n, i) => {
        const prev = nodes[i - 1];
        const linked = prev && ctx.sequencePairs.has(`${prev.code}>${n.code}`);
        return (
          <div key={n.code} className="flex flex-col gap-2">
            {linked ? (
              <span aria-hidden className="text-center text-vmg-faint">
                ↓
              </span>
            ) : null}
            <NodeCard node={n} stageByKey={stageByKey} ctx={ctx} />
          </div>
        );
      })}
    </>
  );
}

function NodeCard({
  node,
  stageByKey,
  ctx,
}: {
  node: JourneyNode;
  stageByKey: Map<string, { ageLabel: string }>;
  ctx: Ctx;
}) {
  const dim = ctx.isDimmed(node) ? "opacity-35" : "";

  if (node.kind === "gap_note") {
    return (
      <p data-node={node.code} className={`rounded-md border border-dashed border-vmg-faint p-2 text-sm italic text-vmg-muted ${dim}`}>
        {node.productName}
      </p>
    );
  }
  if (node.kind === "branch_label") {
    return (
      <p data-node={node.code} className={`rounded-md bg-vmg-charcoal p-2 text-center text-sm font-bold uppercase text-white ${dim}`}>
        {node.productName}
      </p>
    );
  }

  const brand = node.brandSlug ? ctx.brandBySlug.get(node.brandSlug) : undefined;
  const isExam = node.kind === "exam";
  const isHeader = node.kind === "goal_group" || node.kind === "program_header";
  const uncertain = !node.brandConfirmed || node.decisionPending;
  const selected = ctx.selected === node.code;

  const border = selected
    ? "border-2 border-vmg-red"
    : isExam
      ? "border-2 border-vmg-gold"
      : uncertain
        ? "border border-dashed border-vmg-charcoal"
        : "border border-vmg-faint";

  const span = node.stageSpan && node.stageSpan.length > 1 ? node.stageSpan.map((s) => stageByKey.get(s)?.ageLabel ?? s) : null;

  return (
    <button
      type="button"
      data-node={node.code}
      aria-pressed={selected}
      onClick={() => ctx.onSelect(node.code)}
      className={`flex w-full flex-col gap-1 rounded-md bg-surface-card p-3 text-left ${border} ${isHeader ? "bg-surface" : ""} ${dim}`}
    >
      <span className="text-base font-bold uppercase leading-tight">{node.productName}</span>
      {node.itemName ? <span className="text-base leading-snug">{node.itemName}</span> : null}
      {node.durationText ? <span className="text-sm text-vmg-muted">{node.durationText}</span> : null}
      <span className="mt-1 flex flex-wrap items-center gap-1.5">
        {brand ? (
          <span className="rounded-full border border-vmg-faint px-2 py-0.5 text-xs">
            <BrandDot brand={brand} />
            {brand.name}
          </span>
        ) : null}
        {!node.brandConfirmed && node.kind !== "goal_group" ? (
          <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-vmg-muted">{vi.journey.brandPending}</span>
        ) : null}
        {node.decisionPending ? (
          <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-vmg-muted">{vi.journey.decisionPending}</span>
        ) : null}
        {ctx.showProposed && ctx.hasProposed.has(node.code) ? (
          <span aria-label={vi.journey.proposedLinks} className="rounded-full border border-dashed border-vmg-charcoal px-2 py-0.5 text-xs">
            ⇢
          </span>
        ) : null}
      </span>
      {span ? <span className="text-xs text-vmg-muted">{`${vi.journey.spans}: ${span.join(", ")}`}</span> : null}
    </button>
  );
}

function QuickView({
  node,
  map,
  byCode,
  lineByKey,
  stageByKey,
  brandBySlug,
  showProposed,
  onJump,
  onClose,
}: {
  node: JourneyNode;
  map: JourneyMap;
  byCode: Map<string, JourneyNode>;
  lineByKey: Map<string, JourneyLine>;
  stageByKey: Map<string, { ageLabel: string; title: string }>;
  brandBySlug: Map<string, JourneyBrand>;
  showProposed: boolean;
  onJump: (code: string) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => closeRef.current?.focus(), [node.code]);

  const brand = node.brandSlug ? brandBySlug.get(node.brandSlug) : undefined;
  const { previous, next } = sequenceNeighbours(map, node.code);
  const links = showProposed ? proposedLinks(map, node.code) : [];
  const stage = stageByKey.get(node.stageKey);
  const line = lineByKey.get(node.lineKey);

  const label = (code: string) => {
    const n = byCode.get(code);
    return n ? [n.productName, n.itemName].filter(Boolean).join(" · ") : code;
  };

  return (
    <aside
      role="dialog"
      aria-label={node.productName}
      className="fixed inset-x-0 bottom-0 z-20 max-h-[75vh] overflow-y-auto rounded-t-xl border-t border-vmg-faint bg-surface-card p-4 shadow-lg md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-96 md:rounded-none md:border-l md:border-t-0"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold uppercase leading-tight">{node.productName}</h2>
          {node.itemName ? <p className="mt-1">{node.itemName}</p> : null}
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="min-h-11 shrink-0 rounded-md border border-vmg-charcoal px-3 font-medium"
        >
          {vi.journey.close}
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <p className="text-sm text-vmg-muted">
          {[line?.label, stage ? `${stage.ageLabel} · ${stage.title}` : null].filter(Boolean).join(" · ")}
        </p>
        {brand ? (
          <p>
            <span className="rounded-full border border-vmg-faint px-2 py-0.5 text-sm">
              <BrandDot brand={brand} />
              {brand.name}
            </span>
          </p>
        ) : null}
        {node.durationText ? <p>{node.durationText}</p> : null}
        {node.commitmentText ? (
          <p>
            <strong>{vi.journey.commitment}:</strong> {node.commitmentText}
          </p>
        ) : null}
        {node.description ? <p>{node.description}</p> : null}

        {node.timedNotes.length > 0 ? (
          <ul className="list-disc pl-5">
            {node.timedNotes.map((t) => (
              <li key={t.text}>
                {t.text}
                {t.needsConfirm ? <span className="text-vmg-muted"> ({vi.journey.notConfirmed})</span> : null}
              </li>
            ))}
          </ul>
        ) : null}

        {!node.brandConfirmed && node.kind !== "goal_group" ? <p className="text-vmg-muted">{vi.journey.brandPending}.</p> : null}
        {node.decisionPending ? <p className="text-vmg-muted">{vi.journey.decisionPending}.</p> : null}

        {node.verifyNote || node.brandNote ? (
          <div className="rounded-md border border-dashed border-vmg-gold p-3 text-sm">
            <p className="font-bold">{vi.journey.editorOnly}</p>
            {node.verifyNote ? <p className="mt-1">{`${vi.journey.verifyNote}: ${node.verifyNote}`}</p> : null}
            {node.brandNote ? <p className="mt-1">{`${vi.journey.brandNote}: ${node.brandNote}`}</p> : null}
          </div>
        ) : null}

        {previous.length > 0 || next.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {previous.map((c) => (
              <button key={c} type="button" onClick={() => onJump(c)} className="min-h-11 rounded-md border border-vmg-faint px-3 text-left text-sm">
                ← {vi.journey.previous}: {label(c)}
              </button>
            ))}
            {next.map((c) => (
              <button key={c} type="button" onClick={() => onJump(c)} className="min-h-11 rounded-md border border-vmg-faint px-3 text-left text-sm">
                {vi.journey.next}: {label(c)} →
              </button>
            ))}
          </div>
        ) : null}

        {links.length > 0 ? (
          <div>
            <p className="font-bold">{vi.journey.proposedLinks}</p>
            <ul className="mt-1 flex flex-col gap-2">
              {links.map(({ other, edge, outgoing }) => (
                <li key={`${edge.from}>${edge.to}:${edge.kind}`}>
                  <button
                    type="button"
                    onClick={() => onJump(other)}
                    className="min-h-11 w-full rounded-md border border-dashed border-vmg-charcoal px-3 text-left text-sm"
                  >
                    <span aria-hidden>{edge.twoWay ? "↔" : outgoing ? "→" : "←"}</span> {label(other)}
                    {edge.label ? <span className="block text-vmg-muted">{edge.label}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <Link href={`/brand/journey/stage/${node.stageKey}`} className="text-vmg-red underline">
          {vi.journey.openStage}
        </Link>
      </div>
    </aside>
  );
}
