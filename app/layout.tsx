import type { Metadata } from "next";
import "@fontsource-variable/montserrat";
import { AppFooter } from "@/components/app-footer";
import { vi } from "@/lib/i18n/vi";
import "./globals.css";
import "./themes/resortlux.css";

export const metadata: Metadata = {
  title: vi.app.name,
  description: vi.app.description,
  // Công cụ nội bộ: không cho công cụ tìm kiếm lập chỉ mục.
  robots: { index: false, follow: false },
  icons: { icon: "/brand/vmg-symbol.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Thử design system khác: BRAND_LAB_THEME=resortlux (xem app/themes/resortlux.css). Không đặt thì giao diện VMG.
    <html lang="vi" className="h-full" data-theme={process.env.BRAND_LAB_THEME === "resortlux" ? "resortlux" : undefined}>
      <body className="flex min-h-full flex-col bg-surface text-ink">
        <div className="flex flex-1 flex-col">{children}</div>
        <AppFooter />
      </body>
    </html>
  );
}
