import { vi } from "@/lib/i18n/vi";
import type { JourneyBrand, JourneyNode } from "@/lib/journey/model";

export function Badge({ children, tone = "plain" }: { children: React.ReactNode; tone?: "plain" | "pending" | "gold" }) {
  const tones = {
    plain: "border-vmg-faint text-vmg-charcoal",
    pending: "border-dashed border-vmg-faint bg-surface text-vmg-muted",
    gold: "border-vmg-gold text-vmg-gold",
  } as const;
  return <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-sm leading-snug ${tones[tone]}`}>{children}</span>;
}

export function BrandBadge({ brand }: { brand: JourneyBrand }) {
  return (
    <Badge>
      <span
        aria-hidden
        className="mr-1.5 inline-block size-2.5 rounded-full border border-vmg-faint"
        style={brand.colorPrimary ? { backgroundColor: brand.colorPrimary } : undefined}
      />
      {brand.name}
    </Badge>
  );
}

/** Nhãn "chờ xác nhận": một nhãn duy nhất cho mỗi vấn đề, giải thích ở chú giải đầu trang. */
export function PendingBadges({ node }: { node: JourneyNode }) {
  const brandPending = !node.brandConfirmed && node.kind !== "goal_group";
  if (!brandPending && !node.decisionPending) return null;
  return (
    <>
      {brandPending ? <Badge tone="pending">{vi.journey.pending}</Badge> : null}
      {node.decisionPending ? <Badge tone="pending">{vi.journey.decisionPending}</Badge> : null}
    </>
  );
}
