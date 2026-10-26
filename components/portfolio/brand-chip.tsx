import Link from "next/link";
import { pf } from "@/lib/i18n/portfolio";
import type { PortfolioBrand } from "@/lib/products/model";

/** Chấm màu thương hiệu: chỉ có khi mã màu đã chính thức; chưa có thì chấm rỗng, không tự đặt màu. */
export function BrandDot({ color, className = "size-2.5" }: { color: string | null; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 rounded-full border border-line-strong ${className}`}
      style={color ? { backgroundColor: color, borderColor: color } : undefined}
    />
  );
}

/** Nhãn thương hiệu; `href` đưa tới trang thương hiệu. `pending`: thương hiệu của sản phẩm chỉ là gợi ý. */
export function BrandChip({ brand, link = false, pending = false }: { brand: PortfolioBrand; link?: boolean; pending?: boolean }) {
  const body = (
    <>
      <BrandDot color={brand.colorPrimary} />
      {brand.name}
      {pending ? <span className="text-ink-3">· {pf.product.brandPending}</span> : null}
    </>
  );
  const base = "inline-flex items-center gap-2 rounded-xl border border-line bg-paper px-2.5 py-0.5 text-small leading-snug text-ink-2";
  return link ? (
    <Link href={`/brand/${brand.slug}`} className={`${base} min-h-11 hover:border-brand hover:text-brand`}>
      {body}
    </Link>
  ) : (
    <span className={base}>{body}</span>
  );
}
