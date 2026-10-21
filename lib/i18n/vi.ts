// Từ điển chuỗi giao diện: chỉ tiếng Việt, một tệp duy nhất (spec 0.1 quy tắc 5, 8.5).

export const vi = {
  app: {
    name: "VMG Brand Lab",
    description: "Thư viện, chuẩn và công cụ thương hiệu nội bộ của VMG.",
  },
  login: {
    title: "Đăng nhập",
    intro: "Tài khoản được cấp theo lời mời của Marketing HO.",
    email: "Thư điện tử",
    password: "Mật khẩu",
    submit: "Đăng nhập",
    pending: "Đang đăng nhập...",
    invalid: "Thư điện tử hoặc mật khẩu chưa đúng.",
    invalidForm: "Vui lòng nhập đủ thư điện tử và mật khẩu.",
  },
  home: {
    greeting: "Xin chào",
    loading: "Đang tải thông tin tài khoản...",
    noProfile: "Tài khoản chưa có hồ sơ. Vui lòng liên hệ quản trị viên.",
    phase: "Giai đoạn 0 (nền móng): các mục Hiểu về VMG, Chuẩn, Thư viện, Kế hoạch và Công cụ sẽ mở ở các giai đoạn sau.",
    signOut: "Đăng xuất",
  },
  roles: {
    admin: "Quản trị",
    editor: "Biên tập",
    staff: "Nhân viên trung tâm",
    backoffice: "Backoffice",
    guest: "Khách",
  },
} as const;

export type Role = keyof typeof vi.roles;

export function roleLabel(role: string): string {
  return role in vi.roles ? vi.roles[role as Role] : role;
}
