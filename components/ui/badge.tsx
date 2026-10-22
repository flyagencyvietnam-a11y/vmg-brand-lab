import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "pending" | "gold" | "brand" | "on-brand";

const TONES: Record<BadgeTone, string> = {
  neutral: "border-line-strong bg-paper text-ink-2",
  pending: "border-dashed border-line-strong bg-sunken text-ink-2",
  gold: "border-gold bg-paper text-gold",
  brand: "border-brand-tint bg-brand-soft text-brand",
  "on-brand": "border-white/50 bg-white/10 text-on-brand",
};

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-small leading-snug font-medium ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
