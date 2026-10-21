import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Client dùng service role: BỎ QUA RLS. Chỉ dùng phía máy chủ cho tác vụ hệ thống (spec 7.3, 8.3). */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY (xem .env.example).");
  }
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
