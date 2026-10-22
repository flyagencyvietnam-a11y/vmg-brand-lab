import Link from "next/link";
import type { ComponentProps, HTMLAttributes } from "react";

const BASE = "rounded-card border border-line bg-paper";

/** Thẻ phẳng: phân lớp bằng viền và nền, không bóng đổ (PDF trang 35). */
export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`${BASE} ${className}`} {...props} />;
}

export function CardLink({ className = "", ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={`${BASE} block transition-colors hover:border-brand focus-visible:border-brand ${className}`}
      {...props}
    />
  );
}
