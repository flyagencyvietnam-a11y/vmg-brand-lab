import { vi } from "@/lib/i18n/vi";
import { BrandSymbol } from "./ui/brand-art";

/** Chân trang: dải vàng chanh nhạt bo lớn ở hai góc trên, ngang với khối màu của trang. */
export function AppFooter() {
  return (
    <footer className="mt-16 w-full rounded-t-hero bg-lemon-soft">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-6 text-small text-ink-2">
        <BrandSymbol className="size-6 shrink-0" />
        <p>{vi.app.footer}</p>
      </div>
    </footer>
  );
}
