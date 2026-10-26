import { vi } from "@/lib/i18n/vi";
import type { JourneyBrand, JourneyNode } from "@/lib/journey/model";
import { Badge } from "@/components/ui/badge";

export function BrandBadge({ brand }: { brand: JourneyBrand }) {
  return (
    <Badge>
      <span
        aria-hidden
        className="mt-1.5 inline-block size-2.5 shrink-0 rounded-full border border-line-strong"
        style={brand.colorPrimary ? { backgroundColor: brand.colorPrimary } : undefined}
      />
      {brand.name}
    </Badge>
  );
}

/** Nhãn "chờ xác nhận": một nhãn cho mỗi vấn đề, giải thích ở chú giải cuối trang. */
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
