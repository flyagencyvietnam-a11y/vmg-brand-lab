import Image from "next/image";
import { brandLogo } from "@/lib/brands/logos";

/**
 * Logo thương hiệu trên nền trắng bo tròn (logo màu đỏ, vàng đồng không đọc được trên nền màu). Trả về null khi
 * thương hiệu chưa có file logo: nơi dùng tự hiện tên chữ.
 */
export function BrandLogo({ slug, name, className = "h-14" }: { slug: string; name: string; className?: string }) {
  const logo = brandLogo(slug);
  if (!logo) return null;
  return (
    <span className="inline-flex rounded-2xl bg-paper px-4 py-3">
      <Image src={logo.src} width={logo.width} height={logo.height} alt={name} unoptimized className={`w-auto ${className}`} />
    </span>
  );
}
