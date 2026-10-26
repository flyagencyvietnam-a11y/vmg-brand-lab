import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { Icon } from "./icon";

export type ButtonVariant = "primary" | "secondary" | "soft" | "ghost" | "inverse";
export type ButtonSize = "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand text-on-brand hover:bg-brand-hover",
  secondary: "border border-line-strong bg-paper text-ink hover:border-brand hover:text-brand",
  soft: "bg-brand-soft text-brand hover:bg-brand-tint",
  ghost: "text-brand hover:bg-brand-soft",
  // Trên nền đỏ: nút trắng chữ đỏ.
  inverse: "bg-paper text-brand hover:bg-brand-soft",
};

const SIZES: Record<ButtonSize, string> = {
  md: "min-h-11 px-5 text-small",
  lg: "min-h-12 px-6 text-body",
};

/** Nút dạng viên thuốc, gọn. Vùng chạm tối thiểu 44 px (spec 8.5); không bóng đổ (spec 4.4). */
export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra = ""): string {
  return `group inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 disabled:opacity-60 ${SIZES[size]} ${VARIANTS[variant]} ${extra}`.trim();
}

function Arrow() {
  return <Icon name="arrow-right" className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />;
}

type Common = { variant?: ButtonVariant; size?: ButtonSize; /** Thêm mũi tên ở cuối, trượt khi di chuột. */ arrow?: boolean };

export function Button({
  variant = "primary",
  size = "md",
  arrow = false,
  className = "",
  children,
  ...props
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClass(variant, size, className)} {...props}>
      {children as ReactNode}
      {arrow ? <Arrow /> : null}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  arrow = false,
  className = "",
  children,
  ...props
}: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {children}
      {arrow ? <Arrow /> : null}
    </Link>
  );
}
