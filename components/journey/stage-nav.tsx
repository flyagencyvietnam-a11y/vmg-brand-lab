import Link from "next/link";
import { vi } from "@/lib/i18n/vi";
import type { JourneyStage } from "@/lib/journey/model";

/** Chuyển nhanh giữa các chặng: cột bên trái trên máy tính, hàng cuộn ngang trên điện thoại. */
export function StageNav({ stages, current }: { stages: JourneyStage[]; current: string }) {
  return (
    <nav aria-label={vi.journey.stageNav} className="md:sticky md:top-24">
      <ol className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:gap-0.5 md:overflow-visible md:pb-0">
        {stages.map((s, i) => {
          const active = s.key === current;
          return (
            <li key={s.key} className="shrink-0">
              <Link
                href={`/brand/journey/stage/${s.key}`}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 flex-col justify-center rounded-ctl px-3 py-2 transition-colors md:rounded-l-none md:border-l-4 ${
                  active
                    ? "bg-brand-soft text-brand md:border-brand"
                    : "bg-paper text-ink hover:bg-brand-soft md:border-transparent md:bg-transparent"
                }`}
              >
                <span className="flex items-center gap-2 font-bold">
                  <span className={`text-caption tracking-caps ${active ? "text-brand" : "text-gold"}`}>{String(i + 1).padStart(2, "0")}</span>
                  {s.ageLabel}
                </span>
                <span className="hidden text-small uppercase text-ink-2 md:block">{s.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
