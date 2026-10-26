import Link from "next/link";
import type { ComponentProps, HTMLAttributes } from "react";

/**
 * Thẻ phẳng, viền mảnh, bo 16 px. Phân lớp bằng tông nền nhạt (hồng nhạt, kem, vàng nhạt), không bóng đổ (spec 4.4).
 * Tone `brand` là nền đỏ, chữ trong thẻ phải là chữ trắng; chỉ dùng cho điểm nhấn hiếm.
 */
export type CardTone = "paper" | "blush" | "champagne" | "cream" | "brand";

const TONES: Record<CardTone, string> = {
  paper: "border border-line bg-paper",
  blush: "border border-brand-tint bg-brand-soft",
  champagne: "border border-line bg-sunken",
  cream: "border border-line bg-surface",
  brand: "on-brand border border-brand bg-brand text-on-brand",
};

const HOVER: Record<CardTone, string> = {
  paper: "hover:border-brand",
  blush: "hover:border-brand",
  champagne: "hover:border-brand",
  cream: "hover:border-brand",
  brand: "hover:bg-brand-hover",
};

export function Card({
  tone = "paper",
  className = "",
  ...props
}: { tone?: CardTone } & HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-card ${TONES[tone]} ${className}`} {...props} />;
}

/** Thẻ liên kết: nâng 2 px và đổi viền khi di chuột hoặc tập trung bàn phím. */
export function CardLink({
  tone = "paper",
  className = "",
  ...props
}: { tone?: CardTone } & ComponentProps<typeof Link>) {
  return <Link className={`lift block rounded-card ${TONES[tone]} ${HOVER[tone]} ${className}`} {...props} />;
}
