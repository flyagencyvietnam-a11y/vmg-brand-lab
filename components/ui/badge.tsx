import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "pending" | "gold" | "brand" | "soft" | "on-brand";

const TONES: Record<BadgeTone, string> = {
  neutral: "border-line bg-paper text-ink-2",
  pending: "border-dashed border-line-strong bg-sunken text-ink-2",
  gold: "border-gold/40 bg-paper text-gold",
  brand: "border-transparent bg-brand-tint text-brand",
  soft: "border-transparent bg-sunken text-ink-2",
  "on-brand": "border-white/30 bg-white/10 text-on-brand",
};

/** Nhãn gọn, bo 12 px: nhãn một dòng trông như viên thuốc, nhiều dòng vẫn là khối chữ nhật bo tròn. */
export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span className={`inline-flex items-start gap-1.5 rounded-xl border px-2.5 py-0.5 text-small leading-snug ${TONES[tone]}`}>
      {children}
    </span>
  );
}
