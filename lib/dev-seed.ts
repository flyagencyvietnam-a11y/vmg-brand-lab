/**
 * Chế độ thử cục bộ: đọc hành trình thẳng từ seed/journey.json, không cần Supabase và không đăng nhập,
 * để xem giao diện khi chưa có dự án Supabase. TUYỆT ĐỐI không hoạt động ở môi trường production:
 * chế độ này bỏ qua đăng nhập, RLS và cổng phát hành (spec 9.1).
 */
export function isDevSeedMode(): boolean {
  return process.env.BRAND_LAB_DEV_SEED === "1" && process.env.NODE_ENV !== "production";
}
