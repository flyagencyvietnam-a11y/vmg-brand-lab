import { isDevSeedMode } from "@/lib/dev-seed";
import { createClient } from "@/lib/supabase/server";
import type { Audience } from "@/lib/journey/model";

export type Viewer = {
  fullName: string;
  role: string;
  audience: Audience;
  /** True khi đang ở chế độ thử cục bộ (không đăng nhập, dữ liệu seed). */
  devSeed: boolean;
};

/** Editor và admin xem được nội dung chưa phát hành; vai trò khác chỉ thấy bản đã phát hành (spec 3.2). */
export function audienceForRole(role: string): Audience {
  return role === "admin" || role === "editor" ? "editor" : "staff";
}

/** Người dùng hiện tại và hồ sơ. Trả về null nếu chưa đăng nhập hoặc chưa có hồ sơ. */
export async function getViewer(): Promise<Viewer | null> {
  if (isDevSeedMode()) {
    return { fullName: "Chế độ thử", role: "editor", audience: "editor", devSeed: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, active")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || !profile.active) return null;

  return {
    fullName: profile.full_name,
    role: profile.role,
    audience: audienceForRole(profile.role),
    devSeed: false,
  };
}
