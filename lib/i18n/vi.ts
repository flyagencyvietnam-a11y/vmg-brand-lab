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
    intro: "Một học viên VMG đi qua những sản phẩm nào theo từng độ tuổi. Chọn chặng của khách để xem cách tư vấn.",
    editorBadge: "Bản biên tập: gồm cả nội dung chưa phát hành",
    empty: "Hành trình chưa được phát hành. Marketing đang chờ phê duyệt nội dung.",
    loadError: "Chưa tải được hành trình. Vui lòng thử lại sau ít phút.",
    retry: "Thử lại",
    chooseStage: "Khách của bạn đang ở chặng nào?",
    mainProduct: "Sản phẩm chính",
    goals: "Đích đến",
    studyAt: "Có thể học",
    then: "Sau đó",
    parallelTitle: "Các hướng học khác",
    parallelIntro: "Chạy song song với hành trình chính. Bấm vào chặng để xem chi tiết.",
    searchLabel: "Tìm nhanh sản phẩm, cấp học, mã",
    searchPlaceholder: "Ví dụ: flyers, ielts 5.0, du hoc",
    searchNone: "Không tìm thấy kết quả nào.",
    legend: "Chờ xác nhận: thông tin này chưa được R&D hoặc Ban Giám Đốc chốt.",
    pending: "Chờ xác nhận",
    decisionPending: "Chờ Ban Giám Đốc quyết định",
    examTag: "Cột mốc thi",
    attachedTo: "Đi kèm",
    commitment: "Cam kết",
    spans: "Trải dài các chặng",
    steps: "Lộ trình học",
    outcomes: "Học viên đạt được",
    decider: "Người quyết định",
    stageNav: "Các chặng",
    backToOverview: "Tất cả các chặng",
    nextSteps: "Học xong chặng này thì đi tiếp đâu",
    proposedLinks: "Liên kết đề xuất",
    proposedHint: "Gợi ý để thảo luận, chưa xác nhận và không phải điều kiện bắt buộc.",
    editorNotes: "Ghi chú cho biên tập",
    verifyNote: "Cần xác nhận",
    brandNote: "Ghi chú thương hiệu",
    notConfirmed: "chưa xác nhận",
    previousStage: "Chặng trước",
    nextStage: "Chặng sau",
    ageNote: "Mốc 16+ và từ 18 tuổi là mốc tham chiếu theo cấp học, không phải điều kiện đầu vào.",
    goalLine: "Đích đến",
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
