import type { JourneyEdge, JourneyMap, JourneyNode } from "@/lib/journey/model";
import { matchesHint } from "./parse-portfolio";
import type { PortfolioProduct } from "./model";

// Cầu nối giữa sản phẩm và hành trình: ô nào của bản đồ thuộc sản phẩm nào (qua mã gợi ý của ô), và đi từ đâu, đi tiếp đâu.
// Chỉ dùng dữ liệu đã có; không suy ra quan hệ mới (spec 6.1.1).

/** Các ô của hành trình có mã gợi ý khớp mã sản phẩm, theo thứ tự chặng rồi thứ tự nguồn. */
export function nodesOfProduct(map: JourneyMap, product: Pick<PortfolioProduct, "code">): JourneyNode[] {
  const stageSort = new Map(map.stages.map((s) => [s.key, s.sort]));
  return map.nodes
    .filter((n) => n.productHints.some((h) => matchesHint(product.code, h)))
    .sort((a, b) => (stageSort.get(a.stageKey) ?? 0) - (stageSort.get(b.stageKey) ?? 0) || a.sort - b.sort);
}

/** Các ô của hành trình thuộc một thương hiệu. */
export function nodesOfBrand(map: JourneyMap, brandSlug: string): JourneyNode[] {
  return map.nodes.filter((n) => n.brandSlug === brandSlug && n.kind !== "gap_note");
}

export type Connection = { edge: JourneyEdge; node: JourneyNode; via: JourneyNode };

/**
 * Đường nối đi vào ("đến từ đâu") và đi ra ("đi tiếp đâu") của một tập ô, bỏ các đường nối giữa chính các ô đó.
 * Mỗi ô ở đầu kia chỉ xuất hiện một lần.
 */
export function connectionsOf(map: JourneyMap, nodes: JourneyNode[]): { from: Connection[]; next: Connection[] } {
  const own = new Set(nodes.map((n) => n.code));
  const byCode = new Map(map.nodes.map((n) => [n.code, n]));
  const from: Connection[] = [];
  const next: Connection[] = [];
  const seenFrom = new Set<string>();
  const seenNext = new Set<string>();
  for (const e of map.edges) {
    if (own.has(e.to) && !own.has(e.from) && !seenFrom.has(e.from)) {
      const node = byCode.get(e.from);
      const via = byCode.get(e.to);
      if (node && via) {
        seenFrom.add(e.from);
        from.push({ edge: e, node, via });
      }
    }
    if (own.has(e.from) && !own.has(e.to) && !seenNext.has(e.to)) {
      const node = byCode.get(e.to);
      const via = byCode.get(e.from);
      if (node && via) {
        seenNext.add(e.to);
        next.push({ edge: e, node, via });
      }
    }
    // Đường nối hai chiều đi vào cũng là đường đi ra.
    if (e.twoWay && own.has(e.to) && !own.has(e.from) && !seenNext.has(e.from)) {
      const node = byCode.get(e.from);
      const via = byCode.get(e.to);
      if (node && via) {
        seenNext.add(e.from);
        next.push({ edge: e, node, via });
      }
    }
  }
  return { from, next };
}
