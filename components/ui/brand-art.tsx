import Image from "next/image";

// Họa tiết thương hiệu (PDF mục Brand Elements, trang 28): biểu tượng hoa lặp lại hoặc phóng to cắt góc,
// độ mờ 15% đến 100%. Tệp lấy nguyên vẹn từ file logo Marketing cung cấp (public/brand/).

/** Biểu tượng nhỏ, dùng ở đầu trang như các trang trong PDF. */
export function BrandSymbol({ className = "size-8" }: { className?: string }) {
  return <Image src="/brand/vmg-symbol.svg" alt="" width={133} height={127} unoptimized aria-hidden className={className} />;
}

/**
 * Biểu tượng khổng lồ cắt góc phải trên nền đỏ (kiểu trang mở chương trong PDF).
 * Chỉ đậm từ màn hình xl: ở màn hình hẹp nó nằm dưới chữ nên phải mờ để chữ trắng vẫn đủ tương phản.
 */
export function Ornament() {
  return (
    <Image
      src="/brand/vmg-symbol.svg"
      alt=""
      width={133}
      height={127}
      unoptimized
      aria-hidden
      className="pointer-events-none absolute -right-20 -top-14 -z-10 w-72 max-w-none rotate-12 opacity-25 md:-right-28 md:-top-24 md:w-[30rem] xl:opacity-90"
    />
  );
}

/** Họa tiết lặp phủ kín một vùng. Bộ nhận diện: chế độ Overlay, độ mờ từ 15% đến 100% (PDF trang 28). */
export function PatternLayer({ opacity = "opacity-50", size = 120 }: { opacity?: string; size?: number }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 bg-[url('/brand/vmg-pattern.svg')] mix-blend-overlay ${opacity}`}
      style={{ backgroundSize: `${size}px` }}
    />
  );
}
