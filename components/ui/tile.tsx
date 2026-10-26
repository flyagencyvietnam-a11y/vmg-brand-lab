import Link from "next/link";
import type { ComponentProps, HTMLAttributes } from "react";
import { Icon } from "./icon";

/**
 * Khối màu bo lớn (kiểu bento): nền phẳng một màu, chữ đúng cặp tương phản đã test. Không bóng đổ, không họa tiết.
 * Dùng các vai trò sẵn có: đỏ, tím, vàng chanh, vàng đồng và các sắc nhạt.
 */
export type TileTone = "red" | "plum" | "lemon" | "gold" | "blush" | "lilac" | "cream" | "sand" | "paper";

const TONES: Record<TileTone, { box: string; muted: string; faint: string; dark: boolean }> = {
  red: { box: "bg-brand text-on-brand", muted: "text-on-brand-2", faint: "text-on-brand-2", dark: true },
  plum: { box: "bg-plum text-on-brand", muted: "text-plum-soft", faint: "text-plum-soft", dark: true },
  gold: { box: "bg-gold text-on-brand", muted: "text-on-brand-2", faint: "text-on-brand-2", dark: true },
  lemon: { box: "bg-lemon text-ink", muted: "text-ink-2", faint: "text-ink-2", dark: false },
  blush: { box: "bg-brand-soft text-ink", muted: "text-ink-2", faint: "text-ink-3", dark: false },
  lilac: { box: "bg-plum-soft text-ink", muted: "text-ink-2", faint: "text-ink-3", dark: false },
  cream: { box: "bg-lemon-soft text-ink", muted: "text-ink-2", faint: "text-ink-3", dark: false },
  sand: { box: "bg-sunken text-ink", muted: "text-ink-2", faint: "text-ink-3", dark: false },
  paper: { box: "border border-line bg-paper text-ink", muted: "text-ink-2", faint: "text-ink-3", dark: false },
};

/** Class chữ phụ và chữ mờ khớp với nền của tone (để chữ con trong khối luôn đủ tương phản). */
export function tileText(tone: TileTone): { muted: string; faint: string } {
  return { muted: TONES[tone].muted, faint: TONES[tone].faint };
}

export function Tile({
  tone = "paper",
  className = "",
  ...props
}: { tone?: TileTone } & HTMLAttributes<HTMLDivElement>) {
  const t = TONES[tone];
  return <div className={`rounded-card ${t.box} ${t.dark ? "on-brand" : ""} ${className}`} {...props} />;
}

/** Khối là liên kết: nâng nhẹ và nút mũi tên tròn xoay khi di chuột hoặc tập trung bàn phím. */
export function TileLink({
  tone = "paper",
  className = "",
  ...props
}: { tone?: TileTone } & ComponentProps<typeof Link>) {
  const t = TONES[tone];
  return <Link className={`lift group block rounded-card ${t.box} ${t.dark ? "on-brand" : ""} ${className}`} {...props} />;
}

/**
 * Nút mũi tên tròn (44 px, hoặc 56 px cỡ lớn). Là trang trí bên trong một liên kết nên không phải điều khiển riêng:
 * đặt trong TileLink hoặc Link. Vàng chanh làm điểm nhấn trên nền tối, nền đỏ.
 */
export function ArrowCircle({
  tone = "lemon",
  size = "md",
  className = "",
}: {
  tone?: "lemon" | "ink" | "paper" | "brand";
  size?: "md" | "lg";
  className?: string;
}) {
  const TONE = {
    lemon: "bg-lemon text-ink",
    ink: "bg-ink text-on-brand",
    paper: "bg-paper text-ink",
    brand: "bg-brand text-on-brand",
  }[tone];
  const SIZE = size === "lg" ? "size-14" : "size-11";
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-[-45deg] ${SIZE} ${TONE} ${className}`}
    >
      <Icon name="arrow-right" className={size === "lg" ? "size-6" : "size-5"} />
    </span>
  );
}
