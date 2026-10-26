// Logo thương hiệu thành viên do Marketing cung cấp (26/10/2026), đặt ở public/brand/logos. Chỉ có 5 trong 10 thương hiệu;
// các thương hiệu còn lại hiện tên chữ cho tới khi có file logo. Không vẽ lại hay dựng logo (Brand Book 4.1, spec 4.2).
// Kích thước là kích thước thật của file, để trình duyệt giữ đúng tỷ lệ.

export type BrandLogo = { src: string; width: number; height: number };

export const BRAND_LOGOS: Record<string, BrandLogo> = {
  "vmg-english": { src: "/brand/logos/vmg-english.png", width: 1326, height: 701 },
  "vmg-ielts": { src: "/brand/logos/vmg-ielts.webp", width: 2000, height: 272 },
  "vmg-e-academy": { src: "/brand/logos/vmg-e-academy.webp", width: 2000, height: 166 },
  edunext: { src: "/brand/logos/edunext.webp", width: 2000, height: 561 },
  uplearn: { src: "/brand/logos/uplearn.png", width: 683, height: 200 },
};

export function brandLogo(slug: string): BrandLogo | null {
  return BRAND_LOGOS[slug] ?? null;
}
