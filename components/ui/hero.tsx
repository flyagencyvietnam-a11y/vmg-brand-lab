import type { ReactNode } from "react";
import { Tile, tileText, type TileTone } from "./tile";

/**
 * Đầu trang, nền trơn (không họa tiết). Hai kiểu:
 * - `brand`: khối đỏ VMG gọn, chữ trắng (chữ vàng trên đỏ không đủ tương phản).
 * - `plain`: không khối nền, tiêu đề mực trên nền trang; đỏ chỉ ở nhãn và điểm nhấn.
 */
export function Hero({
  tone = "brand",
  eyebrow,
  title,
  lead,
  children,
}: {
  tone?: "brand" | "plain";
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  const brand = tone === "brand";
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-4">
      <div
        className={
          brand
            ? "on-brand rounded-hero bg-brand px-6 py-9 text-on-brand md:px-10 md:py-11"
            : "px-1 py-6 md:py-8"
        }
      >
        <div className="flex max-w-3xl flex-col items-start gap-3">
          {eyebrow ? (
            <div
              className={`animate-rise flex flex-wrap items-center gap-x-3 gap-y-2 text-small font-medium ${
                brand ? "text-on-brand-2" : "text-gold"
              }`}
            >
              {eyebrow}
            </div>
          ) : null}
          <h1 className="animate-rise text-display" style={{ animationDelay: "60ms" }}>
            {title}
          </h1>
          {lead ? (
            <p
              className={`animate-rise text-lead ${brand ? "text-on-brand-2" : "text-ink-2"}`}
              style={{ animationDelay: "120ms" }}
            >
              {lead}
            </p>
          ) : null}
        </div>
        {children ? (
          <div className="animate-rise mt-5 w-full" style={{ animationDelay: "180ms" }}>
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Đầu trang kiểu khối màu bo lớn: tiêu đề IN HOA cỡ lớn, chữ trắng trên đỏ, tím, vàng đồng; chữ mực trên vàng chanh.
 * `size="mega"` cho trang danh sách; `large` cho tiêu đề dài (tên sản phẩm).
 */
export function PageHero({
  tone = "red",
  size = "mega",
  eyebrow,
  title,
  lead,
  children,
}: {
  tone?: TileTone;
  size?: "mega" | "large";
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  const text = tileText(tone);
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-4">
      <Tile tone={tone} className="rounded-hero px-6 py-10 md:px-12 md:py-14">
        <div className="flex max-w-4xl flex-col items-start gap-4">
          {eyebrow ? (
            <div className={`animate-rise flex flex-wrap items-center gap-x-3 gap-y-2 text-small font-medium ${text.muted}`}>{eyebrow}</div>
          ) : null}
          <h1
            className={`animate-rise uppercase ${size === "mega" ? "text-mega" : "text-display"}`}
            style={{ animationDelay: "60ms" }}
          >
            {title}
          </h1>
          {lead ? (
            <p className={`animate-rise max-w-2xl text-lead ${text.muted}`} style={{ animationDelay: "120ms" }}>
              {lead}
            </p>
          ) : null}
        </div>
        {children ? (
          <div className="animate-rise mt-6 w-full" style={{ animationDelay: "180ms" }}>
            {children}
          </div>
        ) : null}
      </Tile>
    </section>
  );
}
