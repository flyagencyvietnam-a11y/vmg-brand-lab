import Link from "next/link";
import { vi } from "@/lib/i18n/vi";
import type { JourneyStage } from "@/lib/journey/model";

/** Chuyển nhanh giữa các chặng: cột bên trái trên máy tính, hàng cuộn ngang trên điện thoại. */
export function StageNav({ stages, current }: { stages: JourneyStage[]; current: string }) {
  return (
    <nav aria-label={vi.journey.stageNav} className="md:sticky md:top-24 md:self-start">
      <ol className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
        {stages.map((s, i) => {
          const active = s.key === current;
          return (
            <li key={s.key} className="shrink-0">
              <Link
                href={`/brand/journey/stage/${s.key}`}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-full px-3 py-2 transition-colors duration-200 md:rounded-xl md:py-2.5 ${
                  active ? "bg-brand-soft text-brand" : "text-ink hover:bg-sunken"
                }`}
              >
                <span className={`w-5 shrink-0 text-caption font-medium ${active ? "text-brand" : "text-ink-3"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex flex-col">
                  <span className="font-semibold whitespace-nowrap">{s.ageLabel}</span>
                  <span className={`hidden text-caption md:block ${active ? "text-brand" : "text-ink-3"}`}>{s.title}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
