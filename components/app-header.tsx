import Link from "next/link";
import { isDevSeedMode } from "@/lib/dev-seed";
import { vi } from "@/lib/i18n/vi";

export function AppHeader() {
  return (
    <header className="border-b border-vmg-faint bg-surface-card">
      {isDevSeedMode() ? (
        <p role="status" className="bg-vmg-charcoal px-4 py-1 text-center text-sm text-white">
          {vi.nav.devSeed}
        </p>
      ) : null}
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2">
        <Link href="/" className="font-bold uppercase tracking-wide text-vmg-red">
          {vi.app.name}
        </Link>
        <nav aria-label="Điều hướng chính">
          <ul className="flex gap-1">
            <li>
              <Link href="/" className="inline-flex min-h-11 items-center rounded-md px-3 hover:bg-surface">
                {vi.nav.home}
              </Link>
            </li>
            <li>
              <Link href="/brand/journey" className="inline-flex min-h-11 items-center rounded-md px-3 hover:bg-surface">
                {vi.nav.brand}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
