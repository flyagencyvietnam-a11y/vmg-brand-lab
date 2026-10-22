import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isDevSeedMode } from "@/lib/dev-seed";
import { getSupabasePublicEnv, hasSupabasePublicEnv } from "./env";

const PUBLIC_PATHS = ["/login"];
export const CONFIG_ERROR_PATH = "/config-error";

/**
 * Làm mới phiên Supabase và chuyển người chưa đăng nhập về /login.
 * Thiếu cấu hình thì ĐÓNG cửa: mọi yêu cầu chuyển sang trang báo lỗi (503) (không bao giờ cho vào không cần đăng nhập).
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  // Chế độ thử cục bộ (chỉ ngoài production): không đăng nhập, dữ liệu seed.
  if (isDevSeedMode()) return NextResponse.next({ request });

  const { pathname: currentPath } = request.nextUrl;
  if (!hasSupabasePublicEnv()) {
    // Chi tiết cho người quản trị nằm ở log máy chủ; trang công khai chỉ báo chung (không nêu tên biến).
    console.error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY (xem .env.example và README, mục Triển khai).");
    if (currentPath === CONFIG_ERROR_PATH) return NextResponse.next({ request });
    // Mã 503 và tiêu đề do route handler /config-error đặt (rewrite từ proxy bỏ qua status).
    return NextResponse.rewrite(new URL(CONFIG_ERROR_PATH, request.url));
  }
  // Đã cấu hình đủ thì trang báo lỗi không còn ý nghĩa.
  if (currentPath === CONFIG_ERROR_PATH) return NextResponse.redirect(new URL("/", request.url));

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
