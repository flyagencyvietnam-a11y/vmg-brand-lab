import type { ReactNode } from "react";
import { Ornament, PatternLayer } from "./brand-art";

/**
 * Dải mở trang trên nền đỏ VMG (mô phỏng trang mở chương của bộ nhận diện).
 * Tiêu đề trắng: chữ vàng trên nền đỏ không đủ tương phản, vàng chỉ làm họa tiết.
 */
export function Hero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="on-brand relative isolate overflow-hidden bg-brand text-on-brand">
      <PatternLayer />
      <Ornament />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 md:py-14">
        {eyebrow ? <div className="text-small font-semibold uppercase tracking-caps text-on-brand-2">{eyebrow}</div> : null}
        <h1 className="max-w-3xl text-display font-bold uppercase">{title}</h1>
        {lead ? <p className="max-w-2xl text-body text-on-brand-2 md:text-h3">{lead}</p> : null}
        {children}
      </div>
    </section>
  );
}
