import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "inverse";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand text-on-brand hover:bg-brand-hover",
  secondary: "border border-line-strong bg-paper text-ink hover:border-brand hover:text-brand",
  ghost: "text-brand hover:bg-brand-soft",
  // Trên nền đỏ: nút trắng chữ đỏ.
  inverse: "bg-paper text-brand hover:bg-brand-soft",
};

/** Vùng chạm tối thiểu 44 px (spec 8.5); không bóng đổ (PDF trang 35). */
export function buttonClass(variant: ButtonVariant = "primary", extra = ""): string {
  return `inline-flex min-h-11 items-center justify-center gap-2 rounded-ctl px-5 text-small font-semibold transition-colors disabled:opacity-60 ${VARIANTS[variant]} ${extra}`.trim();
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: { variant?: ButtonVariant } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: { variant?: ButtonVariant } & ComponentProps<typeof Link>) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}
