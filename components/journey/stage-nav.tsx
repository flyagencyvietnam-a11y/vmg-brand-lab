import Link from "next/link";
import { vi } from "@/lib/i18n/vi";
import type { JourneyStage } from "@/lib/journey/model";

/** Chuyển nhanh giữa các chặng: cột bên trái trên máy tính, hàng cuộn ngang trên điện thoại. */
export function StageNav({ stages, current }: { stages: JourneyStage[]; current: string }) {
  return (
    <nav aria-label={vi.journey.stageNav} className="md:sticky md:top-4">
      <ol className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:gap-1 md:overflow-visible">
        {stages.map((s) => {
          const active = s.key === current;
          return (
            <li key={s.key} className="shrink-0">
              <Link
                href={`/brand/journey/stage/${s.key}`}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 flex-col justify-center rounded-lg border px-3 py-1.5 md:border-0 md:border-l-4 md:rounded-l-none ${
                  active
                    ? "border-vmg-red bg-surface-card md:bg-surface-card"
                    : "border-vmg-faint bg-surface-card md:border-transparent md:bg-transparent md:hover:bg-surface-card"
                }`}
              >
                <span className={`font-bold ${active ? "text-vmg-red" : ""}`}>{s.ageLabel}</span>
                <span className="hidden text-sm uppercase text-vmg-muted md:block">{s.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
