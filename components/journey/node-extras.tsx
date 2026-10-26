import { Icon } from "@/components/ui/icon";
import { vi } from "@/lib/i18n/vi";
import type { JourneyNode } from "@/lib/journey/model";

/** Thông tin phụ của một ô: cam kết, mốc thời gian, tuổi các chặng ô trải qua, ghi chú biên tập (chỉ editor có). */
export function NodeExtras({ node, stageAge }: { node: JourneyNode; stageAge: Map<string, string> }) {
  const span =
    node.stageSpan && node.stageSpan.length > 1 ? node.stageSpan.map((s) => stageAge.get(s) ?? s).join(", ") : null;

  return (
    <>
      {node.commitmentText ? (
        <p className="mt-3">
          <strong>{vi.journey.commitment}:</strong> {node.commitmentText}
        </p>
      ) : null}
      {node.timedNotes.length > 0 ? (
        <ul className="mt-3 list-disc pl-5">
          {node.timedNotes.map((t) => (
            <li key={t.text}>
              {t.text}
              {t.needsConfirm ? <span className="text-ink-2"> ({vi.journey.notConfirmed})</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {span ? <p className="mt-3 text-small text-ink-2">{`${vi.journey.spans}: ${span}`}</p> : null}

      {node.verifyNote || node.brandNote ? (
        <details className="group/notes mt-3 rounded-ctl border border-dashed border-gold px-3 py-2">
          <summary className="flex min-h-9 cursor-pointer items-center justify-between gap-2 text-small font-semibold text-gold">
            {vi.journey.editorNotes}
            <Icon name="chevron-down" className="size-4 transition-transform group-open/notes:rotate-180" />
          </summary>
          {node.verifyNote ? <p className="mt-2 text-small">{`${vi.journey.verifyNote}: ${node.verifyNote}`}</p> : null}
          {node.brandNote ? <p className="mt-2 text-small">{`${vi.journey.brandNote}: ${node.brandNote}`}</p> : null}
        </details>
      ) : null}
    </>
  );
}
