"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { vi } from "@/lib/i18n/vi";

export default function JourneyError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start gap-5 px-4 py-16">
      <p role="alert" className="flex items-start gap-3 text-h3">
        <Icon name="info" className="mt-1 size-6 shrink-0 text-brand" />
        {vi.journey.loadError}
      </p>
      <Button type="button" onClick={reset}>
        {vi.journey.retry}
      </Button>
    </main>
  );
}
