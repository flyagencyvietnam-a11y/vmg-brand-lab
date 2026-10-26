// Màu thẻ trên bản đồ hành trình toàn cảnh. Lấy mẫu từ poster "Hành trình khách hàng VMG" (bản 20/10/2026), nơi mỗi
// sản phẩm có một màu riêng. Đây là màu của poster (đề xuất, chưa phải màu thương hiệu chính thức, xem OPEN_QUESTIONS N15);
// màu chính thức chỉ có TESOL, VMP (spec 4.4) và hai mã đỏ, vàng đồng của VMG. Chữ trên mỗi nền được test tương phản.

import type { JourneyNode } from "@/lib/journey/model";

export type NodeLook = { bg: string; fg: string; border: string; dashed?: boolean };

const INK = "#2a2420";
const WHITE = "#ffffff";
const RED = "#be202f"; // Pantone 200C
const GOLD = "#8b672a"; // Pantone 871C

/** Màu của từng line (tiêu đề cột, đường nối). */
export const LINE_COLORS: Record<string, string> = {
  l1: RED,
  eacademy: "#0e7c86", // Brand Book v0.2, mục 4.2 (dự thảo)
  b2g: "#45546a",
  zh: "#a7472f",
  goals: GOLD,
};
export const LINE_COLOR_FALLBACK = "#6b635d";

export function lineColor(lineKey: string): string {
  return LINE_COLORS[lineKey] ?? LINE_COLOR_FALLBACK;
}

const BY_PRODUCT: Record<string, NodeLook> = {
  "E-PIONEER": { bg: "#d9c08a", fg: INK, border: "#d9c08a" },
  "E-CONTENDER & E-GENIUS": { bg: GOLD, fg: WHITE, border: GOLD },
  "NEXTGEN IELTS": { bg: RED, fg: WHITE, border: RED },
  "IELTS EXPRESS": { bg: "#7a1622", fg: WHITE, border: "#7a1622" },
  "IELTS EXAM FOCUS": { bg: "#f3d9dc", fg: INK, border: RED },
  "IELTS MOCK TEST": { bg: WHITE, fg: INK, border: GOLD },
  VSTEP: { bg: "#c9b07a", fg: INK, border: "#c9b07a" },
  "EPLUS VÀ FLEXTRACK": { bg: "#8d5a3d", fg: WHITE, border: "#8d5a3d" },
  SAT: { bg: "#5e5e5e", fg: WHITE, border: "#5e5e5e" },
};

const BY_BRAND: Record<string, NodeLook> = {
  "vmg-tesol": { bg: "#012a9e", fg: WHITE, border: "#012a9e" },
  vmp: { bg: "#29328d", fg: WHITE, border: "#29328d" },
  uplearn: { bg: "#703fa4", fg: WHITE, border: "#703fa4" },
  edunext: { bg: "#a9b569", fg: INK, border: "#a9b569" },
};

const BY_LINE: Record<string, NodeLook> = {
  eacademy: { bg: "#0e7c86", fg: WHITE, border: "#0e7c86" },
  b2g: { bg: "#45546a", fg: WHITE, border: "#45546a" },
  zh: { bg: "#a7472f", fg: WHITE, border: "#a7472f" },
};

/** Mọi bộ màu chữ/nền dùng ở trên, để test tương phản chạy qua tất cả. */
export function allLooks(): { name: string; look: NodeLook }[] {
  return [
    ...Object.entries(BY_PRODUCT).map(([name, look]) => ({ name, look })),
    ...Object.entries(BY_BRAND).map(([name, look]) => ({ name, look })),
    ...Object.entries(BY_LINE).map(([name, look]) => ({ name, look })),
    { name: "exam", look: EXAM },
    { name: "header", look: HEADER },
    { name: "banner", look: BANNER },
    { name: "note", look: NOTE },
    { name: "default", look: DEFAULT },
  ];
}

const EXAM: NodeLook = { bg: WHITE, fg: INK, border: GOLD };
const HEADER: NodeLook = { bg: WHITE, fg: "#45546a", border: "#45546a" };
const BANNER: NodeLook = { bg: "#f1ebe4", fg: INK, border: GOLD, dashed: true };
const NOTE: NodeLook = { bg: "transparent", fg: "#4a433e", border: "#cdbfae", dashed: true };
const DEFAULT: NodeLook = { bg: WHITE, fg: INK, border: "#cdbfae" };

/** Màu thẻ của một ô: cột mốc thi và sản phẩm đi kèm theo kiểu riêng, còn lại theo line rồi theo sản phẩm. */
export function nodeLook(node: JourneyNode): NodeLook {
  const product = node.productName.trim().toUpperCase();
  if (node.kind === "exam") return EXAM;
  if (node.kind === "gap_note") return NOTE;
  if (node.kind === "branch_label") return BANNER;
  if (node.kind === "program_header") return HEADER;
  if (node.kind === "support_product") return BY_PRODUCT[product] ?? DEFAULT;
  if (node.lineKey === "goals" && node.kind === "goal_group") return { bg: GOLD, fg: WHITE, border: GOLD };
  if (node.lineKey in BY_LINE) return BY_LINE[node.lineKey]!;
  if (node.brandSlug && node.brandSlug in BY_BRAND) return BY_BRAND[node.brandSlug]!;
  return BY_PRODUCT[product] ?? DEFAULT;
}

/** Màu đường nối theo loại: nét liền theo màu line của ô nguồn, nét đứt theo loại liên kết. */
export function edgeColor(kind: string, fromLineKey: string): string {
  switch (kind) {
    case "b2g_link":
      return lineColor("b2g");
    case "ea_link":
    case "same_program":
      return lineColor("eacademy");
    case "zh_link":
      return lineColor("zh");
    case "branch":
      return GOLD;
    case "side":
    case "side_group":
      return GOLD;
    default:
      return lineColor(fromLineKey);
  }
}
