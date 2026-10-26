import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { ArrowCircle, TileLink, tileText, type TileTone } from "@/components/ui/tile";
import { pf } from "@/lib/i18n/portfolio";
import type { PortfolioBrand, PortfolioProduct } from "@/lib/products/model";
import { BrandChip } from "./brand-chip";

void Icon;

/** Thẻ sản phẩm trong danh mục: khối màu bo lớn, tên, thương hiệu, mô tả ngắn, nút mũi tên tròn. Cả thẻ là liên kết. */
export function ProductCard({
  product,
  brand,
  hideBrand = false,
  tone = "paper",
}: {
  product: PortfolioProduct;
  brand: PortfolioBrand | undefined;
  /** Ẩn nhãn thương hiệu khi thẻ nằm trong trang của chính thương hiệu đó (chỉ giữ ghi chú "tạm xếp"). */
  hideBrand?: boolean;
  tone?: TileTone;
}) {
  const text = tileText(tone);
  return (
    <TileLink href={`/brand/products/${product.slug}`} tone={tone} className="flex h-full min-h-[15rem] flex-col gap-4 p-6">
      <div className="flex flex-col items-start gap-2">
        {brand && !hideBrand ? <BrandChip brand={brand} pending={!product.brandConfirmed} /> : null}
        {hideBrand && !product.brandConfirmed ? <Badge tone="pending">{pf.product.brandPending}</Badge> : null}
        <h3 className="text-h2">{product.title}</h3>
      </div>
      {product.description ? <p className={`line-clamp-3 text-small ${text.muted}`}>{product.description}</p> : null}
      <div className="mt-auto flex items-end justify-between gap-3 pt-2">
        <p className={`text-caption ${text.faint}`}>{[...product.formats, ...product.audience].join(" · ")}</p>
        <ArrowCircle tone="ink" />
      </div>
    </TileLink>
  );
}
