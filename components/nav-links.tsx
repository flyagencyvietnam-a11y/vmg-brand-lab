"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type NavItem = {
  href: string;
  label: string;
  /** Đang chọn khi đường dẫn bắt đầu bằng tiền tố này. */
  match: string;
  /** ...trừ khi cũng bắt đầu bằng một trong các tiền tố này (ví dụ /brand/<slug> là thương hiệu, không phải hành trình). */
  exclude?: string[];
};

const LINK =
  "inline-flex min-h-11 items-center rounded-full px-3.5 text-small font-medium whitespace-nowrap transition-colors duration-200";

function NavList({
  items,
  label,
  isActive,
}: {
  items: NavItem[];
  label: string;
  isActive: (item: NavItem) => boolean;
}): ReactNode {
  return (
    <nav aria-label={label} className="min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <ul className="flex gap-0.5">
        {items.map((item) => {
          const active = isActive(item);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`${LINK} ${active ? "bg-brand-soft text-brand" : "text-ink-2 hover:bg-sunken hover:text-ink"}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Đánh dấu mục đang chọn theo đường dẫn. Phải đặt trong Suspense (Cache Components); xem NavFallback. */
export function NavLinks({ items, label }: { items: NavItem[]; label: string }) {
  const pathname = usePathname();
  return (
    <NavList items={items} label={label} isActive={(item) =>
        item.match === "/"
          ? pathname === "/"
          : pathname.startsWith(item.match) && !(item.exclude ?? []).some((x) => pathname.startsWith(x))
      } />
  );
}

/** Hiển thị trong lúc chờ đường dẫn: cùng giao diện, chưa đánh dấu mục đang chọn. */
export function NavFallback({ items, label }: { items: NavItem[]; label: string }) {
  return <NavList items={items} label={label} isActive={() => false} />;
}
