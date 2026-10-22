import Link from "next/link";
import { Suspense } from "react";
import { isDevSeedMode } from "@/lib/dev-seed";
import { vi } from "@/lib/i18n/vi";
import { BrandSymbol } from "./ui/brand-art";
import { NavFallback, NavLinks, type NavItem } from "./nav-links";

const ITEMS: NavItem[] = [
  { href: "/", label: vi.nav.home, match: "/" },
  { href: "/brand/journey", label: vi.nav.brand, match: "/brand" },
  { href: "/design-system", label: vi.nav.designSystem, match: "/design-system" },
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper">
      {isDevSeedMode() ? (
        <p role="status" className="bg-ink px-4 py-1 text-center text-small text-on-brand">
          {vi.nav.devSeed}
        </p>
      ) : null}
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-8 px-4">
        <Link href="/" className="flex items-center gap-3 py-2" aria-label={vi.app.name}>
          <BrandSymbol className="size-9" />
          <span className="text-h3 leading-none font-bold tracking-caps text-brand uppercase">
            VMG
            <span className="mt-1 block text-caption font-semibold tracking-caps text-gold">Brand Lab</span>
          </span>
        </Link>
        <Suspense fallback={<NavFallback items={ITEMS} label={vi.nav.label} />}>
          <NavLinks items={ITEMS} label={vi.nav.label} />
        </Suspense>
      </div>
    </header>
  );
}
