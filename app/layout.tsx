import type { Metadata } from "next";
import { vi } from "@/lib/i18n/vi";
import "./globals.css";

export const metadata: Metadata = {
  title: vi.app.name,
  description: vi.app.description,
  // Công cụ nội bộ: không cho công cụ tìm kiếm lập chỉ mục.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-surface text-vmg-charcoal">{children}</body>
    </html>
  );
}
