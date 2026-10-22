"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ReactNode } from "react";

export type NavItem = { href: string; label: string; /** Đang chọn khi đường dẫn bắt đầu bằng tiền tố này. */ match: string };

const LINK = "relative inline-flex min-h-16 items-center px-3 text-small font-semibold transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5";

function NavList({ items, label, isActive }: { items: NavItem[]; label: string; isActive: (item: NavItem) => boolean }): ReactNode {
  return (
    <nav aria-label={label} className="-mx-1 overflow-x-auto">
      <ul className="flex">
        {items.map((item) => {
          const active = isActive(item);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`${LINK} ${active ? "text-brand after:bg-brand" : "text-ink-2 hover:text-brand after:bg-transparent"}`}
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
  return <NavList items={items} label={label} isActive={(item) => (item.match === "/" ? pathname === "/" : pathname.startsWith(item.match))} />;
}

/** Hiển thị trong lúc chờ đường dẫn: cùng giao diện, chưa đánh dấu mục đang chọn. */
export function NavFallback({ items, label }: { items: NavItem[]; label: string }) {
  return <NavList items={items} label={label} isActive={() => false} />;
}
