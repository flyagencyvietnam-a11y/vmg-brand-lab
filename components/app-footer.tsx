import { vi } from "@/lib/i18n/vi";
import { BrandSymbol } from "./ui/brand-art";

export function AppFooter() {
  return (
    <footer className="mx-auto mt-16 w-full max-w-6xl px-4 pb-8">
      <div className="flex items-center gap-2.5 border-t border-line pt-5 text-small text-ink-3">
        <BrandSymbol className="size-5 shrink-0" />
        <p>{vi.app.footer}</p>
      </div>
    </footer>
  );
}
