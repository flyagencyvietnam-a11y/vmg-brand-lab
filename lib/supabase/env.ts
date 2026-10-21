// Biến NEXT_PUBLIC_* phải được tham chiếu tĩnh để Next.js nhúng giá trị vào mã trình duyệt.
export function getSupabasePublicEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY (xem .env.example).");
  }
  return { url, anonKey };
}
