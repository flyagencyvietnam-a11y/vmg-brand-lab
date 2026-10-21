import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicEnv } from "./env";

/** Client theo phiên người dùng (khóa anon, chịu RLS). Dùng trong Server Component, Server Action, Route Handler. */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabasePublicEnv();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Gọi từ Server Component không ghi được cookie; proxy.ts đã làm mới phiên.
        }
      },
    },
  });
}
