"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { vi } from "@/lib/i18n/vi";
import { normalizeVi } from "@/lib/journey/model";

export type SearchItem = {
  code: string;
  label: string;
  stageKey: string;
  stageAge: string;
  lineName: string;
};

/** Tìm không phân biệt dấu ("du hoc" ra "DU HỌC"); kết quả dẫn thẳng tới ô trên trang chặng. */
export function JourneySearch({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState("");
  const q = normalizeVi(query.trim());

  const results = useMemo(() => {
    if (q === "") return [];
    return items.filter((i) => normalizeVi(`${i.code} ${i.label}`).includes(q)).slice(0, 8);
  }, [items, q]);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="journey-search" className="font-medium">
        {vi.journey.searchLabel}
      </label>
      <input
        id="journey-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={vi.journey.searchPlaceholder}
        autoComplete="off"
        className="min-h-12 w-full max-w-xl rounded-lg border border-vmg-faint bg-surface-card px-4 text-base focus:outline-2 focus:outline-vmg-red"
      />
      {q !== "" ? (
        results.length > 0 ? (
          <ul className="flex max-w-xl flex-col overflow-hidden rounded-lg border border-vmg-faint bg-surface-card">
            {results.map((r) => (
              <li key={r.code} className="border-b border-vmg-faint last:border-b-0">
                <Link
                  href={`/brand/journey/stage/${r.stageKey}#${r.code}`}
                  className="flex min-h-12 flex-col justify-center px-4 py-2 hover:bg-surface"
                >
                  <span className="font-medium">{r.label}</span>
                  <span className="text-sm text-vmg-muted">
                    {r.stageAge} · {r.lineName}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-vmg-muted">{vi.journey.searchNone}</p>
        )
      ) : null}
    </div>
  );
}
