import { Icon, type IconName } from "./icon";

export type BubbleTone = "brand" | "gold" | "paper" | "on-brand";

const TONES: Record<BubbleTone, string> = {
  brand: "bg-brand-tint text-brand",
  gold: "bg-sunken text-gold",
  paper: "bg-paper text-ink-3",
  "on-brand": "bg-white/15 text-on-brand",
};

/** Icon trong khối bo tròn nhỏ, dùng ở đầu thẻ. */
export function IconBubble({ name, tone = "brand", className = "" }: { name: IconName; tone?: BubbleTone; className?: string }) {
  return (
    <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${TONES[tone]} ${className}`}>
      <Icon name={name} className="size-5" />
    </span>
  );
}
