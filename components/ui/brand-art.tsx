import Image from "next/image";

// Biểu tượng hoa lấy nguyên vẹn từ file logo Marketing cung cấp (public/brand/vmg-symbol.svg).
// Chỉ dùng làm dấu hiệu nhỏ (header, footer, đăng nhập). Không dùng làm họa tiết hay hình nền: nền luôn trơn.

export function BrandSymbol({ className = "size-8" }: { className?: string }) {
  return <Image src="/brand/vmg-symbol.svg" alt="" width={133} height={127} unoptimized aria-hidden className={className} />;
}
