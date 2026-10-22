"use client";

import { vi } from "@/lib/i18n/vi";

export default function JourneyError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-10">
      <p role="alert">{vi.journey.loadError}</p>
      <button type="button" onClick={reset} className="min-h-11 self-start rounded-md bg-vmg-red px-4 font-bold text-white">
        {vi.journey.retry}
      </button>
    </main>
  );
}
