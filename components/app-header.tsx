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

/** Thanh điều hướng mảnh, nền trắng, viền mảnh; dính đầu trang. */
export function AppHeader() {
  return (
    <>
      {isDevSeedMode() ? (
        <p role="status" className="bg-ink px-4 py-1 text-center text-small text-on-brand">
          {vi.nav.devSeed}
        </p>
      ) : null}
      <header className="pointer-events-none sticky top-0 z-30 px-3 pt-3 md:px-5">
        <div className="pointer-events-auto mx-auto flex w-full max-w-6xl items-center justify-between gap-3 rounded-full border border-line bg-paper py-1.5 pr-1.5 pl-4">
          <Link href="/" className="flex min-h-11 shrink-0 items-center gap-2.5" aria-label={vi.app.name}>
            <BrandSymbol className="size-7" />
            <span className="hidden text-small leading-tight font-semibold text-ink sm:block">
              VMG <span className="font-normal text-ink-3">Brand Lab</span>
            </span>
          </Link>
          <Suspense fallback={<NavFallback items={ITEMS} label={vi.nav.label} />}>
            <NavLinks items={ITEMS} label={vi.nav.label} />
          </Suspense>
        </div>
      </header>
    </>
  );
}
