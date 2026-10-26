// Mô tả token cho trang /design-system. Giá trị thật nằm ở app/globals.css; test
// tests/unit/design-tokens.test.ts đảm bảo hai nơi khớp nhau và các cặp màu chữ đủ tương phản.

/** official: mã ghi trong tài liệu. measured: đo từ trang PDF hoặc file logo. derived: suy ra, chưa có mã chính thức. */
export type Provenance = "official" | "measured" | "derived";

export type Swatch = {
  /** Tên biến CSS ở :root. */
  token: string;
  hex: string;
  label: string;
  source: Provenance;
  note?: string;
};

export const redScale: Swatch[] = [
  { token: "--vmg-red-700", hex: "#921824", label: "Đỏ 700", source: "derived", note: "Trạng thái hover" },
  { token: "--vmg-red-600", hex: "#be202f", label: "Đỏ 600", source: "official", note: "Pantone 200C" },
  { token: "--vmg-red-500", hex: "#d62233", label: "Đỏ 500", source: "measured" },
  { token: "--vmg-red-400", hex: "#e03343", label: "Đỏ 400", source: "measured" },
  { token: "--vmg-red-300", hex: "#e44959", label: "Đỏ 300", source: "measured" },
  { token: "--vmg-red-200", hex: "#e6a8ad", label: "Đỏ 200", source: "measured" },
  { token: "--vmg-red-100", hex: "#f7e1e3", label: "Đỏ 100", source: "measured" },
  { token: "--vmg-red-50", hex: "#fcf1f2", label: "Đỏ 50", source: "measured" },
];

export const goldScale: Swatch[] = [
  { token: "--vmg-gold-700", hex: "#8b672a", label: "Vàng đồng 700", source: "official", note: "Pantone 871C" },
  { token: "--vmg-gold-500", hex: "#ac872f", label: "Vàng đồng 500", source: "measured" },
  { token: "--vmg-gold-400", hex: "#b6924d", label: "Vàng đồng 400", source: "measured", note: "Màu biểu tượng trong file logo" },
  { token: "--vmg-gold-300", hex: "#cda537", label: "Vàng đồng 300", source: "measured" },
  { token: "--vmg-gold-200", hex: "#d1bb96", label: "Vàng đồng 200", source: "measured" },
  { token: "--vmg-gold-100", hex: "#f1ebe4", label: "Nền ấm", source: "measured" },
  { token: "--vmg-gold-50", hex: "#fbf9f5", label: "Nền kem", source: "measured" },
];

export const inkScale: Swatch[] = [
  { token: "--vmg-ink-900", hex: "#2a2420", label: "Mực 900", source: "official", note: "Màu chữ chính, spec 4.4" },
  { token: "--vmg-ink-700", hex: "#4a433e", label: "Mực 700", source: "derived" },
  { token: "--vmg-ink-500", hex: "#6b635d", label: "Mực 500", source: "derived" },
  { token: "--vmg-ink-300", hex: "#cdbfae", label: "Đường kẻ đậm", source: "derived" },
  { token: "--vmg-ink-200", hex: "#e3d9cc", label: "Đường kẻ", source: "derived" },
];

/** Màu theo chặng: từ bộ màu website VMG (vàng chanh, tím), chưa có trong Brand Identity PDF. Xem OPEN_QUESTIONS. */
export const stageScale: Swatch[] = [
  { token: "--vmg-lemon-400", hex: "#e9e24a", label: "Vàng chanh", source: "derived", note: "Từ bộ màu website. Chỉ trang trí" },
  { token: "--vmg-lemon-100", hex: "#fbf9d6", label: "Vàng chanh nhạt", source: "derived", note: "Nền dải chặng" },
  { token: "--vmg-plum-700", hex: "#3d2a6d", label: "Tím", source: "derived", note: "Từ bộ màu website" },
  { token: "--vmg-plum-100", hex: "#e7e0f5", label: "Tím nhạt", source: "derived", note: "Nền dải chặng" },
];

export type Role = { name: string; cssVar: string; usage: string };

/** Vai trò màu dùng trong giao diện (class Tailwind dạng bg-brand, text-ink-2...). */
export const roles: Role[] = [
  { name: "brand", cssVar: "--color-brand", usage: "Hành động chính, tiêu đề nhấn, dải hero" },
  { name: "brand-hover", cssVar: "--color-brand-hover", usage: "Hover của nút chính" },
  { name: "brand-soft", cssVar: "--color-brand-soft", usage: "Nền hồng nhạt của thẻ, chữ phụ trên nền đỏ" },
  { name: "brand-tint", cssVar: "--color-brand-tint", usage: "Nền hồng đậm hơn, viền hồng" },
  { name: "gold", cssVar: "--color-gold", usage: "Chữ vàng đồng trên nền sáng (nhãn, tiêu đề nhỏ)" },
  { name: "gold-mark", cssVar: "--color-gold-mark", usage: "Chỉ trang trí: biểu tượng, đường kẻ nhấn. Không dùng cho chữ" },
  { name: "gold-soft", cssVar: "--color-gold-soft", usage: "Nền ấm (vàng nhạt) của thẻ" },
  { name: "lemon", cssVar: "--color-lemon", usage: "Chỉ trang trí: đường dọc và cột mốc của chặng. Không dùng cho chữ trên nền trắng" },
  { name: "lemon-soft", cssVar: "--color-lemon-soft", usage: "Nền dải của chặng đầu (4 đến 6 tuổi)" },
  { name: "plum", cssVar: "--color-plum", usage: "Nền dải chặng 16+, đường dọc chặng 6 đến 11 tuổi" },
  { name: "plum-soft", cssVar: "--color-plum-soft", usage: "Nền dải chặng 6 đến 11 tuổi; chữ phụ trên nền tím" },
  { name: "ink", cssVar: "--color-ink", usage: "Chữ chính" },
  { name: "ink-2", cssVar: "--color-ink-2", usage: "Chữ phụ" },
  { name: "ink-3", cssVar: "--color-ink-3", usage: "Chú thích, chữ mờ" },
  { name: "paper", cssVar: "--color-paper", usage: "Thẻ, bảng, ô nhập" },
  { name: "surface", cssVar: "--color-surface", usage: "Nền trang" },
  { name: "sunken", cssVar: "--color-sunken", usage: "Nền lõm, vùng nhóm" },
  { name: "line", cssVar: "--color-line", usage: "Đường viền mảnh" },
  { name: "line-strong", cssVar: "--color-line-strong", usage: "Viền ô nhập, đường nối" },
  { name: "on-brand", cssVar: "--color-on-brand", usage: "Chữ trên nền đỏ" },
  { name: "on-brand-2", cssVar: "--color-on-brand-2", usage: "Chữ phụ trên nền đỏ" },
];

/** Mã hex của từng vai trò (để trang tài liệu tính tương phản). Test đối chiếu với app/globals.css. */
export const roleHex: Record<string, string> = {
  brand: "#be202f",
  "brand-hover": "#921824",
  "brand-soft": "#fcf1f2",
  "brand-tint": "#f7e1e3",
  gold: "#8b672a",
  "gold-mark": "#b6924d",
  "gold-soft": "#f1ebe4",
  lemon: "#e9e24a",
  "lemon-soft": "#fbf9d6",
  plum: "#3d2a6d",
  "plum-soft": "#e7e0f5",
  ink: "#2a2420",
  "ink-2": "#4a433e",
  "ink-3": "#6b635d",
  paper: "#ffffff",
  surface: "#fbf9f5",
  sunken: "#f1ebe4",
  line: "#e3d9cc",
  "line-strong": "#cdbfae",
  "on-brand": "#ffffff",
  "on-brand-2": "#fcf1f2",
};

export type ContrastPair = { fg: string; bg: string; min: number; use: string };

/** Các cặp chữ và nền thật sự dùng trong giao diện. Chữ thường 4,5:1; chữ lớn (>= 24 px) hoặc in đậm >= 18,66 px 3:1. */
/** Cặp KHÔNG đạt 4,5:1, không được dùng cho chữ. Ghi ở đây để trang tài liệu và test cùng nói một điều. */
export const avoidPairs: { fg: string; bg: string; why: string }[] = [
  { fg: "gold", bg: "sunken", why: "Vàng đồng 871C trên nền ấm chỉ đạt khoảng 4,4:1; dùng chữ mực (ink) trên nền lõm" },
  { fg: "gold", bg: "brand-tint", why: "Vàng đồng 871C trên nền hồng đậm chỉ đạt khoảng 4,1:1; dùng chữ mực hoặc chữ đỏ" },
  { fg: "lemon", bg: "paper", why: "Vàng chanh trên nền trắng gần như không đọc được; chỉ làm đường dọc, cột mốc" },
  { fg: "gold-mark", bg: "paper", why: "Vàng biểu tượng chỉ để trang trí, không đủ tương phản cho chữ" },
  { fg: "gold-mark", bg: "brand", why: "Vàng trên đỏ (tiêu đề vàng trong PDF) không đủ tương phản; dùng chữ trắng, vàng chỉ làm họa tiết" },
];

export const contrastPairs: ContrastPair[] = [
  { fg: "ink", bg: "paper", min: 4.5, use: "Chữ chính trên thẻ" },
  { fg: "ink", bg: "surface", min: 4.5, use: "Chữ chính trên nền trang" },
  { fg: "ink", bg: "sunken", min: 4.5, use: "Chữ chính trên nền lõm" },
  { fg: "ink-2", bg: "paper", min: 4.5, use: "Chữ phụ trên thẻ" },
  { fg: "ink-2", bg: "surface", min: 4.5, use: "Chữ phụ trên nền trang" },
  { fg: "ink-3", bg: "paper", min: 4.5, use: "Chú thích trên thẻ" },
  { fg: "ink-3", bg: "surface", min: 4.5, use: "Chú thích trên nền trang" },
  { fg: "brand", bg: "paper", min: 4.5, use: "Liên kết, tiêu đề đỏ trên thẻ" },
  { fg: "brand", bg: "surface", min: 4.5, use: "Liên kết, tiêu đề đỏ trên nền trang" },
  { fg: "brand", bg: "brand-soft", min: 4.5, use: "Chữ đỏ trên nền đỏ nhạt" },
  { fg: "brand-hover", bg: "paper", min: 4.5, use: "Hover của liên kết" },
  { fg: "gold", bg: "paper", min: 4.5, use: "Nhãn vàng đồng trên thẻ" },
  { fg: "gold", bg: "surface", min: 4.5, use: "Nhãn vàng đồng trên nền trang" },
  { fg: "ink", bg: "brand-soft", min: 4.5, use: "Chữ chính trên thẻ hồng nhạt" },
  { fg: "ink", bg: "brand-tint", min: 4.5, use: "Chữ chính trên thẻ hồng đậm" },
  { fg: "ink-2", bg: "brand-soft", min: 4.5, use: "Chữ phụ trên thẻ hồng nhạt" },
  { fg: "ink-2", bg: "brand-tint", min: 4.5, use: "Chữ phụ trên thẻ hồng đậm" },
  { fg: "ink-3", bg: "brand-tint", min: 4.5, use: "Chú thích trên thẻ hồng đậm" },
  { fg: "ink-2", bg: "sunken", min: 4.5, use: "Chữ phụ trên thẻ vàng nhạt" },
  { fg: "brand", bg: "brand-tint", min: 4.5, use: "Chữ đỏ trên thẻ hồng đậm" },
  { fg: "brand", bg: "sunken", min: 4.5, use: "Chữ đỏ trên thẻ vàng nhạt" },
  { fg: "gold", bg: "brand-soft", min: 4.5, use: "Nhãn vàng đồng trên thẻ hồng nhạt" },
  { fg: "on-brand", bg: "brand", min: 4.5, use: "Chữ trắng trên nền đỏ" },
  { fg: "on-brand", bg: "brand-hover", min: 4.5, use: "Chữ trắng trên nút chính khi hover" },
  { fg: "on-brand-2", bg: "brand", min: 4.5, use: "Chữ phụ trên nền đỏ" },
  { fg: "brand", bg: "on-brand", min: 4.5, use: "Nút nghịch (chữ đỏ trên nền trắng)" },
  { fg: "ink", bg: "lemon-soft", min: 4.5, use: "Chữ chính trên dải chặng vàng chanh" },
  { fg: "ink-2", bg: "lemon-soft", min: 4.5, use: "Chữ phụ trên dải chặng vàng chanh" },
  { fg: "ink-3", bg: "lemon-soft", min: 4.5, use: "Chú thích trên dải chặng vàng chanh" },
  { fg: "ink", bg: "plum-soft", min: 4.5, use: "Chữ chính trên dải chặng tím nhạt" },
  { fg: "ink-2", bg: "plum-soft", min: 4.5, use: "Chữ phụ trên dải chặng tím nhạt" },
  { fg: "ink-3", bg: "plum-soft", min: 4.5, use: "Chú thích trên dải chặng tím nhạt" },
  { fg: "plum", bg: "plum-soft", min: 4.5, use: "Số chặng tím trên dải tím nhạt" },
  { fg: "plum", bg: "paper", min: 4.5, use: "Chữ tím trên thẻ trắng" },
  { fg: "ink-2", bg: "gold-soft", min: 4.5, use: "Chữ phụ trên dải chặng cuối" },
  { fg: "on-brand", bg: "plum", min: 4.5, use: "Chữ trắng trên dải chặng 16+" },
  { fg: "plum-soft", bg: "plum", min: 4.5, use: "Chữ phụ trên dải chặng 16+" },
  { fg: "ink", bg: "lemon", min: 4.5, use: "Số chặng trên cột mốc vàng chanh" },
  { fg: "ink-2", bg: "lemon", min: 4.5, use: "Chữ phụ trên khối vàng chanh" },
  { fg: "on-brand", bg: "gold", min: 4.5, use: "Chữ trắng trên khối vàng đồng" },
  { fg: "on-brand-2", bg: "gold", min: 4.5, use: "Chữ phụ trên khối vàng đồng" },
  { fg: "lemon", bg: "plum", min: 4.5, use: "Tuổi của chặng 16+ (chữ vàng chanh trên nền tím)" },
];
