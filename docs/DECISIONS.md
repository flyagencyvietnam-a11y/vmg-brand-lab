# Nhật ký quyết định kỹ thuật

Theo spec 8.8. Mỗi dòng: quyết định, lý do, hệ quả.

**D-001. Next.js 16.4 với `proxy.ts` và Cache Components.** Scaffold hiện tại (`create-next-app@latest`) cho Next 16.4.2, đã bật `cacheComponents`. Tệp `middleware` đổi tên thành `proxy` (xem `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`). Component đọc `cookies()` phải nằm trong `<Suspense>`. Hệ quả: trang chủ là "Partial Prerender"; trang mới cần đọc phiên thì bọc Suspense. Spec 8.1 ghi "Next.js App Router", không chỉ định phiên bản.

**D-002. npm thay vì pnpm.** Máy dựng không có pnpm; spec không ràng buộc trình quản lý gói. Hệ quả: `package-lock.json`, CI dùng `npm ci`.

**D-003. `@types/node` 24.** Scaffold đặt `^20` nhưng Vitest 5 yêu cầu `>=22`. Máy dùng Node 24.18, CI dùng Node 24.

**D-004. Thương hiệu nạp `draft`, không phải `effective`.** Spec 9.1: không phát hành nội dung mới cho nhân viên trước khi Ban Giám Đốc phê duyệt Nền tảng (dự kiến 11/2026). `is_usable` cần `effective_from`, mà spec không cho ngày; tôi không tự bịa ngày. Ngoại lệ so với Phụ lục A.1: `vmg-ielts` được ghi `effective` nhưng cũng nạp `draft` (OPEN_QUESTIONS N2). `vmg-e-academy` nạp `proposed` đúng spec.

**D-005. Seed không ghi đè chỉnh sửa của quản trị.** Mặc định bỏ qua phần đã nạp (`journey_meta.seed`); `--force` chỉ cập nhật trường nguồn, không đụng `status`, `effective_*`, cờ tính năng. Lý do: spec yêu cầu seed idempotent, nhưng chạy lại trên bản đã xác nhận không được đưa trạng thái về `proposed`. Hệ quả: dòng nạp mới có `status` lấy từ giá trị mặc định của cột.

**D-006. Gộp `journey_lanes` vào `journey_lines.sublanes`.** Spec 7.2 cho phép. Ít bảng hơn; cột con chỉ có ở Line 1.

**D-007. `journey_node_products` lưu mã gợi ý (`product_code_hint`), `product_id` để trống.** Bảng `products` chưa có dữ liệu (cần Product Portfolio). Mã có ký tự đại diện như `A01-D01_*` nên không thể khớp một-một. `confirmed = false` cho đến khi chủ sản phẩm xác nhận (spec G.5).

**D-008. `journey_nodes.extra jsonb` giữ `program`, `same_product_as`, `name_note`.** Ba trường có trong `journey.json` nhưng không có cột trong spec 7.2. Schema seed dùng `.strict()` nên khóa mới của file nguồn sẽ báo lỗi thay vì bị bỏ lặng lẽ.

**D-009. `sort` của ô = thứ tự mảng của file nguồn.** File nguồn chỉ có `sort` ở bốn ô nhóm đích (trùng thứ tự mảng). Không tự đặt thứ tự khác (spec 6.1.1 "Không tự suy ra").

**D-010. Người dùng thường đọc hành trình qua view `v_usable_journey_*`.** View chạy với quyền chủ sở hữu (bỏ qua RLS bảng gốc) và tự kiểm `app_is_member()` cùng `is_usable`; ẩn `verify_note`, `brand_note`, mốc thời gian chưa xác nhận hoặc hết hạn. Bảng gốc chỉ editor, admin, brand_owner. Hệ quả: view mới phải luôn có điều kiện `app_is_member()`.

**D-011. Ghi vào `journey_*` chỉ admin ở Giai đoạn 0.** Ma trận 3.2 cho editor và brand_owner quyền có điều kiện (gửi, đề xuất, lớp `core` cần hồ sơ thay đổi); cơ chế đó cần `change_requests` (Gđ 1).

**D-012. Vai trò của người dùng mới lấy từ `raw_app_meta_data.brand_lab_role`, mặc định `staff`.** `app_metadata` chỉ máy chủ ghi được (khác `user_metadata`). Khóa riêng `brand_lab_role` để không nhầm với claim `role` của JWT. Quyền thấp nhất khi thiếu.

**D-013. Kiểm thử migration và RLS bằng PGlite.** Máy dựng không có Docker nên không chạy được Supabase cục bộ. `tests/rls/helpers.ts` mô phỏng vai trò `anon`, `authenticated`, `service_role`, schema `auth`, `auth.uid()` và quyền mặc định. Đáp ứng một phần mục 8.7 (migration trên cơ sở trống, RLS theo vai trò). Giới hạn: PGlite không phải Supabase; cần chạy lại migration trên Supabase thật trước khi tin.

**D-015. Tách cam kết đầu ra khỏi `duration_text` khi seed (migration 3).** Spec 6.1.1 cấm hiện cam kết IE1-IE7 trước khi R&D xác nhận, nhưng file nguồn gộp chúng vào `duration_text`. Không sửa file nguồn; `splitCommitment` cắt tại " · cam kết" và kiểm thử ghép lại bằng " · " ra đúng văn bản gốc. `commitment_confirmed` mặc định false và `--force` không đụng tới. Dùng migration mới thay vì sửa migration 2 để lịch sử không bị viết lại.

**D-016. Drive qua REST với `fetch`, không dùng `googleapis`; JWT ký bằng `node:crypto`.** Spec 8.1 chỉ cần bốn thao tác (đọc siêu dữ liệu, tải, tải bản sửa, ghim). Ít phụ thuộc, `fetch` và đồng hồ truyền vào được nên kiểm thử không cần mạng. Nếu sau này cần thao tác Drive phức tạp (Picker, liệt kê thư mục hàng loạt), cân nhắc lại.

**D-017. `lib/drive` là cửa duy nhất; `DriveClient` cố ý hẹp.** Không có hàm tạo, sửa, xóa tệp (spec 8.1). `MockDrive` mô phỏng các cách hỏng của Drive thật (sửa tại chỗ, đổi tên, xóa, thùng rác, mất quyền, hết hạn mức, Drive dọn bản sửa chưa ghim). `server.ts` là chỗ duy nhất dùng `server-only` để các module còn lại kiểm thử được.

**D-018. `drift` theo đúng spec: md5 HOẶC modifiedTime khác bản đã ghim.** Hệ quả: chỉ đổi tên tệp trên Drive cũng thành `drift` (Drive cập nhật modifiedTime khi đổi tên). Chấp nhận vì người dùng thường vẫn tải đúng bản đã ghim; quản trị bấm "Xác nhận" là xong. Nếu gây nhiễu thì cân nhắc chỉ so md5 với tệp nhị phân.

**D-014. Font Arial theo spec 4.4, không dùng Geist của scaffold.** Font thương hiệu chưa có giấy phép (Q3).
