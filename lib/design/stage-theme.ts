// Màu theo chặng của hành trình: mỗi chặng một dải nền phẳng, đường dọc và cột mốc cùng tông (giống dòng thời gian
// trên website VMG), không họa tiết. Chặng thứ n lấy theme thứ n; hành trình có nhiều hơn 5 chặng thì lặp lại.
// Class viết đầy đủ để Tailwind quét được. Mọi cặp chữ và nền ở đây có trong lib/design/tokens.ts (test tương phản).

export type StageTheme = {
  /** Nền dải của chặng. */
  band: string;
  /** Chữ chính, chữ phụ, chú thích trên nền dải. */
  text: string;
  muted: string;
  faint: string;
  /** Đường dọc và cột mốc số. */
  spine: string;
  node: string;
  /** Số chặng, tuổi: màu nhấn trên nền dải. */
  accent: string;
  /** Viền thẻ nằm trên dải. */
  edge: string;
  /** Dải nền tối: liên kết và nút phải đổi sang chữ trắng. */
  dark: boolean;
};

export const STAGE_THEMES: readonly StageTheme[] = [
  {
    band: "bg-lemon-soft",
    text: "text-ink",
    muted: "text-ink-2",
    faint: "text-ink-3",
    spine: "bg-lemon",
    node: "border-lemon bg-paper text-ink",
    accent: "text-ink",
    edge: "border-lemon",
    dark: false,
  },
  {
    band: "bg-plum-soft",
    text: "text-ink",
    muted: "text-ink-2",
    faint: "text-ink-3",
    spine: "bg-plum",
    node: "border-plum bg-paper text-plum",
    accent: "text-plum",
    edge: "border-plum/30",
    dark: false,
  },
  {
    band: "bg-brand-soft",
    text: "text-ink",
    muted: "text-ink-2",
    faint: "text-ink-3",
    spine: "bg-brand",
    node: "border-brand bg-paper text-brand",
    accent: "text-brand",
    edge: "border-brand-tint",
    dark: false,
  },
  {
    band: "bg-plum",
    text: "text-on-brand",
    muted: "text-plum-soft",
    faint: "text-plum-soft",
    spine: "bg-lemon",
    node: "border-lemon bg-lemon text-ink",
    accent: "text-lemon",
    edge: "border-white/25",
    dark: true,
  },
  {
    band: "bg-gold-soft",
    text: "text-ink",
    muted: "text-ink-2",
    faint: "text-ink-2",
    spine: "bg-gold-mark",
    node: "border-gold-mark bg-paper text-ink",
    accent: "text-ink",
    edge: "border-gold-mark/50",
    dark: false,
  },
];

export function stageTheme(index: number): StageTheme {
  return STAGE_THEMES[((index % STAGE_THEMES.length) + STAGE_THEMES.length) % STAGE_THEMES.length]!;
}
