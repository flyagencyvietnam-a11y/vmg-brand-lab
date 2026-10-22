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
    loading: "Đang tải...",
    noProfile: "Tài khoản chưa có hồ sơ. Vui lòng liên hệ quản trị viên.",
    phase: "Bản MVP: hiện có Hành trình khách hàng. Chuẩn, Thư viện, Kế hoạch và Công cụ sẽ mở ở các giai đoạn sau.",
    signOut: "Đăng xuất",
  },
  nav: {
    home: "Trang chủ",
    brand: "Hiểu về VMG",
    devSeed: "Chế độ thử: dữ liệu seed, không đăng nhập",
  },
  journey: {
    title: "Hành trình khách hàng",
    intro: "Toàn bộ hệ sinh thái VMG theo hành trình của một học viên. Bấm vào một ô để xem chi tiết.",
    ageNote: "Mốc 16+ và từ 18 tuổi là mốc tham chiếu theo cấp học, không phải điều kiện đầu vào.",
    editorBanner:
      "Bạn đang xem bản biên tập: gồm nội dung chưa phát hành và ghi chú chờ xác nhận. Nhân viên chỉ thấy bản đã được phê duyệt.",
    empty: "Hành trình chưa được phát hành. Marketing đang chờ phê duyệt nội dung.",
    loadError: "Chưa tải được hành trình. Vui lòng thử lại sau ít phút.",
    retry: "Thử lại",
    search: "Tìm sản phẩm, cấp, mã",
    searchNone: "Không tìm thấy ô nào khớp.",
    showProposed: "Hiện liên kết đề xuất",
    proposedHint: "Liên kết đề xuất chỉ là gợi ý để thảo luận, chưa xác nhận và không phải điều kiện bắt buộc.",
    allLines: "Tất cả",
    brands: "Thương hiệu",
    stageHeader: "Chặng",
    openStage: "Xem trang chặng",
    backToMap: "Về bản đồ hành trình",
    close: "Đóng",
    previous: "Ô trước",
    next: "Ô sau",
    proposedLinks: "Liên kết đề xuất (chưa xác nhận)",
    brandPending: "Thương hiệu tạm xếp, chờ xác nhận",
    decisionPending: "Chờ Ban Giám Đốc quyết định",
    editorOnly: "Chỉ biên tập thấy",
    verifyNote: "Cần xác nhận",
    brandNote: "Ghi chú thương hiệu",
    notConfirmed: "chưa xác nhận",
    commitment: "Cam kết",
    spans: "Trải dài các chặng",
    outcomes: "Mục tiêu đầu ra",
    decider: "Người quyết định",
    stageNodes: "Các ô trong chặng",
    noNodes: "Chưa có ô nào trong chặng này.",
    lines: "Line",
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
