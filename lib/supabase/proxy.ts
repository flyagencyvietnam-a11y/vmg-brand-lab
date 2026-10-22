import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isDevSeedMode } from "@/lib/dev-seed";
import { getSupabasePublicEnv } from "./env";

const PUBLIC_PATHS = ["/login"];

/** Làm mới phiên Supabase và chuyển người chưa đăng nhập về /login. Thiếu cấu hình thì lỗi (không mở cửa). */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  // Chế độ thử cục bộ (chỉ ngoài production): không đăng nhập, dữ liệu seed.
  if (isDevSeedMode()) return NextResponse.next({ request });

  const { url, anonKey } = getSupabasePublicEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  // getUser xác thực với máy chủ Auth, không tin cookie như getSession.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.includes(pathname);

  const redirectTo = (path: string) => {
    const redirect = NextResponse.redirect(new URL(path, request.url));
    // Giữ cookie phiên vừa được làm mới.
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  };

  if (!user && !isPublic) return redirectTo("/login");
  if (user && isPublic) return redirectTo("/");
  return response;
}
