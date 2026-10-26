"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { edgeColor, lineColor, nodeLook } from "@/lib/design/journey-palette";
import { stageTheme } from "@/lib/design/stage-theme";
import { pf } from "@/lib/i18n/portfolio";
import { vi } from "@/lib/i18n/vi";
import { edgePath, type Rect } from "@/lib/journey/map-edges";
import { buildMapLayout, cellKey, edgesOf, type MapLayout } from "@/lib/journey/map-layout";
import { lineShortName, nodeLabel } from "@/lib/journey/views";
import type { JourneyMap, JourneyNode } from "@/lib/journey/model";
import { BrandDot } from "@/components/portfolio/brand-chip";
import { profileValue } from "@/lib/brandbook/model";
import { productsForHints, type Portfolio, type PortfolioBrand, type PortfolioProduct } from "@/lib/products/model";
import { NodeExtras } from "./node-extras";

const AGE_W = "9rem";
const COL_W: Record<string, string> = {
  b2g: "12rem",
  "l1:support": "12rem",
  "l1:main": "14rem",
  "l1:parallel": "13rem",
  eacademy: "14rem",
  zh: "13rem",
};
const colWidth = (key: string) => COL_W[key] ?? "13rem";
const GRID_GAP = "2rem";

type EdgeDraw = { key: string; from: string; to: string; d: string; color: string; proposed: boolean; twoWay: boolean };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function NodeCard({
  node,
  brandName,
  selected,
  dim,
  onSelect,
}: {
  node: JourneyNode;
  brandName: string | null;
  selected: boolean;
  dim: boolean;
  onSelect: (code: string) => void;
}) {
  const look = nodeLook(node);
  const pending = (!node.brandConfirmed && node.kind !== "goal_group") || node.decisionPending;

  if (node.kind === "gap_note") {
    return (
      <p
        data-node={node.code}
        className={`flex gap-2 rounded-2xl border border-dashed px-3 py-2 text-small transition-opacity ${dim ? "opacity-35" : ""}`}
        style={{ color: look.fg, borderColor: look.border }}
      >
        <Icon name="info" className="mt-0.5 size-4 shrink-0" />
        {node.productName}
      </p>
    );
  }

  return (
    <button
      type="button"
      data-node={node.code}
      aria-pressed={selected}
      onClick={() => onSelect(node.code)}
      className={`block w-full rounded-2xl border px-3 py-2.5 text-left transition-opacity duration-200 ${dim ? "opacity-35" : ""} ${
        selected ? "outline-2 outline-offset-2 outline-ink" : ""
      }`}
      style={{
        backgroundColor: look.bg,
        color: look.fg,
        borderColor: look.border,
        borderStyle: look.dashed ? "dashed" : "solid",
      }}
    >
      {brandName ? (
        <span className="mb-1 inline-block rounded-full border border-current px-2 text-caption leading-5">{brandName}</span>
      ) : null}
      <span className="block text-small leading-snug font-semibold">{node.productName}</span>
      {node.itemName ? <span className="mt-0.5 block text-caption leading-snug">{node.itemName}</span> : null}
      {node.durationText ? <span className="mt-1 block text-caption leading-snug font-medium">{node.durationText}</span> : null}
      {pending ? <span className="mt-1 block text-caption leading-snug">{vi.journey.pending}</span> : null}
    </button>
  );
}

function label<T extends Record<string, string>>(labels: T, key: string | null): string | null {
  return key && key in labels ? labels[key as keyof T] : null;
}

const linkBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line-strong px-5 text-small font-medium text-brand hover:border-brand";

/** Khối nhỏ trong ngăn chi tiết: nhãn, rồi nội dung. */
function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 border-t border-line pt-4">
      <h3 className="text-small font-semibold tracking-caps text-gold uppercase">{title}</h3>
      <div className="mt-2 flex flex-col gap-3">{children}</div>
    </section>
  );
}

function ProductBlock({ products }: { products: PortfolioProduct[] }) {
  if (products.length === 0) return <p className="text-small text-ink-2">{pf.map.noProduct}</p>;
  return (
    <>
      {products.length > 1 ? <p className="text-small text-ink-2">{pf.map.moreProducts}</p> : null}
      <ul className="flex flex-col gap-3">
        {products.map((p) => (
          <li key={p.code} className="rounded-2xl border border-line p-3">
            <p className="font-medium">{p.title}</p>
            {p.description ? <p className="mt-1 line-clamp-3 text-small text-ink-2">{p.description}</p> : null}
            {[...p.formats, ...p.audience].length > 0 ? <p className="mt-1 text-caption text-ink-3">{[...p.formats, ...p.audience].join(" · ")}</p> : null}
            <Link href={`/brand/products/${p.slug}`} className={`mt-2 ${linkBtn}`}>
              {pf.map.openProduct}
              <Icon name="arrow-right" className="size-4" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function BrandBlock({ brand, pending }: { brand: PortfolioBrand | undefined; pending: boolean }) {
  if (!brand) return <p className="text-small text-ink-2">{pf.map.noBrand}</p>;
  const domain = label(pf.brand.domainLabels, brand.domain);
  const delivery = label(pf.brand.deliveryLabels, brand.delivery);
  return (
    <div className="rounded-2xl border border-line p-3">
      <p className="flex items-center gap-2 font-medium">
        <BrandDot color={brand.colorPrimary} className="size-3" />
        {brand.name}
      </p>
      <p className="mt-1 text-small text-ink-2">{[domain, delivery].filter(Boolean).join(" · ")}</p>
      {brand.profile?.oneLiner ? <p className="mt-2 text-small">{brand.profile.oneLiner}</p> : null}
      {profileValue(brand.profile, "Cần lưu ý khi nói") ? (
        <p className="mt-2 text-small text-ink-2">
          <span className="font-medium">{pf.profile.guidance}:</span> {profileValue(brand.profile, "Cần lưu ý khi nói")![0]}
        </p>
      ) : null}
      {pending || !brand.confirmed ? <p className="mt-1 text-small text-ink-2">{pf.map.brandUnconfirmed}</p> : null}
      <Link href={`/brand/${brand.slug}`} className={`mt-2 ${linkBtn}`}>
        {pf.map.openBrand}
        <Icon name="arrow-right" className="size-4" />
      </Link>
    </div>
  );
}

function DetailPanel({
  node,
  layout,
  map,
  portfolio,
  onSelect,
  onClose,
}: {
  node: JourneyNode;
  layout: MapLayout;
  map: JourneyMap;
  portfolio: Portfolio;
  onSelect: (code: string, scroll?: boolean) => void;
  onClose: () => void;
}) {
  const stageAge = useMemo(() => new Map(map.stages.map((s) => [s.key, s.ageLabel])), [map]);
  const stage = map.stages.find((s) => s.key === node.stageKey);
  const line = map.lines.find((l) => l.key === node.lineKey);
  const lane = line?.sublanes.find((l) => l.key === node.laneKey);
  const brand = node.brandSlug ? portfolio.brands.find((b) => b.slug === node.brandSlug) : undefined;
  const products = productsForHints(portfolio.products, node.productHints);
  const links = edgesOf(layout, node.code);
  const byCode = new Map(layout.nodes.map((n) => [n.code, n]));
  const isThing = node.kind !== "gap_note";

  return (
    <aside
      aria-label={vi.journey.mapDetail}
      className="fixed inset-x-3 bottom-3 z-30 max-h-[70vh] overflow-y-auto rounded-card border border-line-strong bg-paper p-5 md:inset-x-auto md:top-24 md:right-4 md:bottom-4 md:max-h-none md:w-[24rem]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-small text-ink-2">
          {stage?.ageLabel} · {line ? lineShortName(line) : ""}
          {lane ? ` · ${lane.label}` : ""}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label={vi.journey.mapClose}
          className="-mt-2 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-sunken hover:text-ink"
        >
          <span aria-hidden className="text-h2 leading-none">
            ×
          </span>
        </button>
      </div>
      <h2 className="mt-1 text-h2">{node.productName}</h2>
      {node.itemName ? <p className="mt-1 font-medium">{node.itemName}</p> : null}
      {node.durationText ? <p className="mt-1 text-small text-ink-2">{node.durationText}</p> : null}
      {node.description ? <p className="mt-3 text-ink-2">{node.description}</p> : null}
      <NodeExtras node={node} stageAge={stageAge} />

      {isThing && node.kind !== "branch_label" ? (
        <>
          <Block title={pf.map.product}>
            <ProductBlock products={products} />
          </Block>
          <Block title={pf.map.brand}>
            <BrandBlock brand={brand} pending={!node.brandConfirmed} />
          </Block>
        </>
      ) : null}

      {links.length > 0 ? (
        <Block title={vi.journey.mapConnections}>
          <ul className="-mt-1 flex flex-col">
            {links.map(({ edge, other, outgoing }) => {
              const target = byCode.get(other);
              if (!target) return null;
              return (
                <li key={`${edge.from}>${edge.to}:${edge.kind}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(other, true)}
                    className="flex min-h-11 w-full flex-col justify-center text-left text-small text-brand hover:text-brand-hover"
                  >
                    <span className="font-medium underline">
                      <span aria-hidden className="no-underline">
                        {edge.twoWay ? "↔" : outgoing ? "→" : "←"}{" "}
                      </span>
                      {nodeLabel(target)}
                    </span>
                    {edge.label ? <span className="text-ink-2">{edge.label}</span> : null}
                    {edge.proposed ? <span className="text-ink-3">{vi.journey.mapProposed}</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </Block>
      ) : null}
    </aside>
  );
}

/**
 * Bản đồ toàn cảnh: cả hành trình trong một bức tranh (hàng là độ tuổi, cột là line, mũi tên là đường nối), theo poster.
 * Tự co vừa khung; có phóng to, thu nhỏ. Bấm một thẻ để xem chi tiết và làm nổi các đường nối của nó.
 */
export function MapCanvas({
  map,
  portfolio,
  initialSelected = null,
  highlightBrand = null,
}: {
  map: JourneyMap;
  portfolio: Portfolio;
  initialSelected?: string | null;
  highlightBrand?: string | null;
}) {
  const layout = useMemo(() => buildMapLayout(map), [map]);
  const nodeByCode = useMemo(() => new Map(layout.nodes.map((n) => [n.code, n])), [layout]);
  const brandName = useMemo(() => new Map(map.brands.map((b) => [b.slug, b.name])), [map]);
  const lineKeyOf = useMemo(() => new Map(layout.nodes.map((n) => [n.code, n.lineKey])), [layout]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [natural, setNatural] = useState({ w: 1600, h: 1400 });
  const [containerW, setContainerW] = useState(0);
  const [selected, setSelected] = useState<string | null>(initialSelected);
  const [showProposed, setShowProposed] = useState(true);
  const [paths, setPaths] = useState<EdgeDraw[]>([]);

  const scale = fit ? clamp(containerW > 0 ? containerW / natural.w : 1, 0.55, 1.25) : zoom;

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const measure = () => {
      setNatural({ w: canvas.offsetWidth, h: canvas.offsetHeight });
      setContainerW(wrap.clientWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(canvas);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // Đo vị trí từng thẻ rồi vẽ đường nối. Đo theo tỷ lệ thực tế nên đúng ở mọi mức phóng.
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cr = canvas.getBoundingClientRect();
    const ratio = canvas.offsetWidth > 0 ? cr.width / canvas.offsetWidth : 1;
    const rectOf = (code: string): Rect | null => {
      const el = canvas.querySelector<HTMLElement>(`[data-node="${code}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: (r.left - cr.left) / ratio, y: (r.top - cr.top) / ratio, w: r.width / ratio, h: r.height / ratio };
    };
    const next: EdgeDraw[] = [];
    for (const e of layout.edges) {
      const a = rectOf(e.from);
      const b = rectOf(e.to);
      if (!a || !b) continue;
      next.push({
        key: `${e.from}>${e.to}:${e.kind}`,
        from: e.from,
        to: e.to,
        d: edgePath(a, b),
        color: edgeColor(e.kind, lineKeyOf.get(e.from) ?? ""),
        proposed: e.proposed,
        twoWay: e.twoWay,
      });
    }
    setPaths(next);
  }, [layout, natural.w, natural.h, scale, lineKeyOf]);

  // Mở từ liên kết (kết quả tìm kiếm, trang sản phẩm): cuộn tới ô được chọn.
  useEffect(() => {
    if (!initialSelected) return;
    const id = requestAnimationFrame(() => {
      canvasRef.current?.querySelector(`[data-node="${initialSelected}"]`)?.scrollIntoView({ block: "center", inline: "center" });
    });
    return () => cancelAnimationFrame(id);
  }, [initialSelected]);

  useEffect(() => {
    if (!selected) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const select = useCallback((code: string, scroll = false) => {
    setSelected(code);
    if (scroll) {
      requestAnimationFrame(() => {
        canvasRef.current?.querySelector(`[data-node="${code}"]`)?.scrollIntoView({ block: "center", inline: "center" });
      });
    }
  }, []);

  const toggle = useCallback((code: string) => setSelected((cur) => (cur === code ? null : code)), []);

  const connected = useMemo(() => {
    if (!selected) {
      if (!highlightBrand) return null;
      return new Set(layout.nodes.filter((n) => n.brandSlug === highlightBrand).map((n) => n.code));
    }
    const set = new Set<string>([selected]);
    for (const l of edgesOf(layout, selected)) set.add(l.other);
    return set;
  }, [layout, selected, highlightBrand]);

  const colors = useMemo(() => [...new Set(paths.map((p) => p.color))], [paths]);
  const template = `${AGE_W} ${layout.columns.map((c) => colWidth(c.key)).join(" ")}`;
  const selectedNode = selected ? nodeByCode.get(selected) : undefined;
  const lineList = layout.lineHeaders;

  const setManual = (v: number) => {
    setFit(false);
    setZoom(clamp(Math.round(v * 100) / 100, 0.4, 1.5));
  };

  const btn =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line-strong bg-paper px-3 text-small font-medium text-ink hover:border-brand hover:text-brand";

  return (
    <section className="w-full px-4 pb-12" aria-label={vi.journey.viewMap}>
      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <p className="max-w-xl text-small text-ink-2">{vi.journey.mapHint}</p>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={btn} onClick={() => setManual(scale - 0.1)} aria-label={vi.journey.zoomOut}>
            −
          </button>
          <span className="min-w-12 text-center text-small tabular-nums text-ink-2" aria-live="polite">
            {Math.round(scale * 100)}%
          </span>
          <button type="button" className={btn} onClick={() => setManual(scale + 0.1)} aria-label={vi.journey.zoomIn}>
            +
          </button>
          <button type="button" className={btn} onClick={() => setFit(true)} aria-pressed={fit}>
            {vi.journey.zoomFit}
          </button>
          <label className="ml-2 inline-flex min-h-11 cursor-pointer items-center gap-2 text-small text-ink-2">
            <input type="checkbox" checked={showProposed} onChange={(e) => setShowProposed(e.target.checked)} className="size-4 accent-brand" />
            {vi.journey.mapShowProposed}
          </label>
        </div>
      </div>

      {highlightBrand ? (
        <p className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-2 text-small">
          <BrandDot color={portfolio.brands.find((b) => b.slug === highlightBrand)?.colorPrimary ?? null} className="size-3" />
          {vi.journey.mapHighlight(portfolio.brands.find((b) => b.slug === highlightBrand)?.name ?? highlightBrand)}
          <Link href="/brand/journey" className="inline-flex min-h-11 items-center font-medium text-brand underline hover:text-brand-hover">
            {vi.journey.mapHighlightClear}
          </Link>
        </p>
      ) : null}

      <ul className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-small text-ink-2" aria-label={vi.journey.mapLegend}>
        {lineList.map((h) => (
          <li key={h.lineKey} className="inline-flex items-center gap-2">
            <span aria-hidden className="inline-block h-3 w-6 rounded-full" style={{ backgroundColor: lineColor(h.lineKey) }} />
            {h.short}
          </li>
        ))}
        <li className="inline-flex items-center gap-2">
          <svg aria-hidden width="28" height="8">
            <line x1="0" y1="4" x2="28" y2="4" stroke="#6b635d" strokeWidth="2" />
          </svg>
          {vi.journey.mapLegendSolid}
        </li>
        <li className="inline-flex items-center gap-2">
          <svg aria-hidden width="28" height="8">
            <line x1="0" y1="4" x2="28" y2="4" stroke="#6b635d" strokeWidth="2" strokeDasharray="5 4" />
          </svg>
          {vi.journey.mapLegendDashed}
        </li>
      </ul>

      <div ref={wrapRef} className="overflow-x-auto rounded-card border border-line bg-paper">
        <div style={{ width: natural.w * scale, height: natural.h * scale }}>
          <div style={{ width: natural.w, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
            <div ref={canvasRef} className="relative w-max px-4 pb-6">
              <svg aria-hidden className="pointer-events-none absolute inset-0 z-0" width={natural.w} height={natural.h} viewBox={`0 0 ${natural.w} ${natural.h}`}>
                <defs>
                  {colors.map((c) => (
                    <marker key={c} id={`arrow-${c.slice(1)}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
                      <path d="M0,1 L9,5 L0,9 z" fill={c} />
                    </marker>
                  ))}
                </defs>
                {paths.map((p) => {
                  if (p.proposed && !showProposed) return null;
                  const involved = selected !== null && (p.from === selected || p.to === selected);
                  const faded = selected !== null && !involved;
                  return (
                    <path
                      key={p.key}
                      d={p.d}
                      fill="none"
                      stroke={p.color}
                      strokeWidth={involved ? 3 : p.proposed ? 1.75 : 2.25}
                      strokeDasharray={p.proposed ? "7 5" : undefined}
                      strokeLinecap="round"
                      opacity={faded ? 0.1 : involved ? 1 : 0.8}
                      markerEnd={`url(#arrow-${p.color.slice(1)})`}
                      markerStart={p.twoWay ? `url(#arrow-${p.color.slice(1)})` : undefined}
                    />
                  );
                })}
              </svg>

              <div className="relative z-10">
                {/* Tiêu đề cột: line, rồi cột con */}
                <div className="grid pt-5" style={{ gridTemplateColumns: template, columnGap: GRID_GAP }}>
                  <div />
                  {layout.lineHeaders.map((h) => (
                    <div
                      key={h.lineKey}
                      className="rounded-2xl px-3 py-2 text-on-brand"
                      style={{ gridColumn: `span ${h.span}`, backgroundColor: lineColor(h.lineKey) }}
                    >
                      <p className="text-small leading-snug font-semibold">{h.label}</p>
                      {h.description ? <p className="mt-0.5 text-caption leading-snug">{h.description}</p> : null}
                    </div>
                  ))}
                </div>
                <div className="grid pt-2 pb-2" style={{ gridTemplateColumns: template, columnGap: GRID_GAP }}>
                  <div />
                  {layout.columns.map((c) => (
                    <p key={c.key} className="min-h-4 text-caption leading-snug font-semibold tracking-caps text-ink-2 uppercase">
                      {c.laneLabel}
                    </p>
                  ))}
                </div>

                {layout.stages.map((s, i) => {
                  const t = stageTheme(i);
                  return (
                    <div key={s.key} className="-mx-4 border-t border-line px-4 py-7">
                      <div className="grid items-start" style={{ gridTemplateColumns: template, columnGap: GRID_GAP }}>
                        <div className={`self-stretch rounded-2xl p-3 ${t.band} ${t.text}`}>
                          <Link href={`/brand/journey/stage/${s.key}`} className={`inline-flex min-h-11 items-center text-h2 hover:underline ${t.accent}`}>
                            {s.ageLabel}
                          </Link>
                          <p className={`text-caption leading-snug ${t.muted}`}>{s.title}</p>
                        </div>
                        {layout.columns.map((col) => (
                          <div key={col.key} className="flex flex-col gap-3">
                            {(layout.cells.get(cellKey(s.key, col.key)) ?? []).map((n) => (
                              <NodeCard
                                key={n.code}
                                node={n}
                                brandName={n.brandSlug ? (brandName.get(n.brandSlug) ?? null) : null}
                                selected={selected === n.code}
                                dim={connected !== null && !connected.has(n.code)}
                                onSelect={toggle}
                              />
                            ))}
                          </div>
                        ))}
                      </div>

                      {s.key === layout.goalStageKey && layout.goalGroups.length > 0 ? (
                        <div
                          className="mt-9 grid gap-4"
                          style={{ marginLeft: `calc(${AGE_W} + ${GRID_GAP})`, gridTemplateColumns: `repeat(${layout.goalGroups.length}, minmax(0, 1fr))` }}
                        >
                          {layout.goalGroups.map((g) => (
                            <div key={g.header.code} className="flex flex-col gap-3">
                              <NodeCard
                                node={g.header}
                                brandName={null}
                                selected={selected === g.header.code}
                                dim={connected !== null && !connected.has(g.header.code)}
                                onSelect={toggle}
                              />
                              {g.products.map((p) => (
                                <NodeCard
                                  key={p.code}
                                  node={p}
                                  brandName={p.brandSlug ? (brandName.get(p.brandSlug) ?? null) : null}
                                  selected={selected === p.code}
                                  dim={connected !== null && !connected.has(p.code)}
                                  onSelect={toggle}
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedNode ? (
        <DetailPanel node={selectedNode} layout={layout} map={map} portfolio={portfolio} onSelect={select} onClose={() => setSelected(null)} />
      ) : null}
    </section>
  );
}
