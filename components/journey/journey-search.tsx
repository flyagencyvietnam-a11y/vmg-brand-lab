"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { vi } from "@/lib/i18n/vi";
import { normalizeVi } from "@/lib/journey/model";
import type { SearchItem } from "@/lib/journey/views";

/** Tìm không phân biệt dấu ("du hoc" ra "DU HỌC"); kết quả dẫn thẳng tới ô trên trang chặng. Đặt trên nền đỏ. */
export function JourneySearch({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState("");
  const q = normalizeVi(query.trim());

  const results = useMemo(() => {
    if (q === "") return [];
    return items.filter((i) => normalizeVi(`${i.code} ${i.label}`).includes(q)).slice(0, 8);
  }, [items, q]);

  return (
    <div className="mt-2 flex max-w-xl flex-col gap-2">
      <label htmlFor="journey-search" className="text-small font-semibold text-on-brand-2">
        {vi.journey.searchLabel}
      </label>
      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-3" />
        <input
          id="journey-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={vi.journey.searchPlaceholder}
          autoComplete="off"
          className="min-h-14 w-full rounded-ctl border border-transparent bg-paper pr-4 pl-12 text-body text-ink placeholder:text-ink-3"
        />
      </div>
      {q !== "" ? (
        results.length > 0 ? (
          <ul className="flex flex-col overflow-hidden rounded-ctl bg-paper text-ink">
            {results.map((r) => (
              <li key={r.code} className="border-b border-line last:border-b-0">
                <Link
                  href={`/brand/journey/stage/${r.stageKey}#${r.code}`}
                  className="flex min-h-14 items-center justify-between gap-3 px-4 py-2 hover:bg-brand-soft"
                >
                  <span className="min-w-0">
                    <span className="block font-semibold">{r.label}</span>
                    <span className="block text-small text-ink-2">
                      {r.stageAge} · {r.lineName}
                    </span>
                  </span>
                  <Icon name="arrow-right" className="size-5 shrink-0 text-brand" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-ctl bg-paper px-4 py-3 text-ink-2">{vi.journey.searchNone}</p>
        )
      ) : null}
    </div>
  );
}
