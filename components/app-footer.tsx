import { vi } from "@/lib/i18n/vi";
import { BrandSymbol } from "./ui/brand-art";

export function AppFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-5 text-small text-ink-3">
        <BrandSymbol className="size-5 shrink-0" />
        <p>{vi.app.footer}</p>
      </div>
    </footer>
  );
}
