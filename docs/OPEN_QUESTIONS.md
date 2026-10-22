# Điều cần chốt

Theo spec 0.1 quy tắc 4: gặp `[CẦN XÁC NHẬN]` thì ghi vào đây kèm lựa chọn đề xuất, dùng giá trị tạm có cờ `confirmed = false`. Danh sách đầy đủ Q1 đến Q26 nằm ở spec mục 10.2 ([VMG_BrandLab_Spec_v0.4.md](VMG_BrandLab_Spec_v0.4.md)); dưới đây là các mục đã chạm tới khi dựng Giai đoạn 0.

## Từ spec (đã chạm tới)

| # | Câu hỏi | Đang dùng tạm | Chặn |
|---|---|---|---|
| Q1 | Tên miền email, có đăng nhập Google Workspace không | `ALLOWED_EMAIL_DOMAINS` để trống, chưa kiểm tra tên miền; đăng ký tắt (`enable_signup = false`), chỉ mời | Gđ 0 |
| Q2 | Nền tảng triển khai | Giả định Vercel, vùng Singapore (CI và build không phụ thuộc Vercel) | Gđ 0 |
| Q4 | Mã màu UpLearn, EduNext; CMYK, Pantone | `color_primary` để trống, ghi `color_note` trong `seed/brands.json` | Gđ 1 |
| Q5 | Tên gọi thống nhất của VMP | Dùng "VMP - VMG Global Pathways" theo bảng 4.1; `deprecated_names` chưa nạp | Gđ 1 |
| Q23 | R&D xác nhận IE1 đến IE7, thương hiệu SAT, VSTEP, EPlus, FlexTrack, B2G; thống nhất cam kết đầu ra | Mọi ô `journey_*` ở `proposed` | Gđ 1 |
| Q24 | Ngày dùng tên VMT công khai | Thương hiệu `vmt` có `release_condition` ghi cổng `vmt_public_name`; bảng `release_gates` làm ở Gđ 1 | Gđ 2 |
| Q25 | VMG e-Academy có là thương hiệu thành viên không; tuổi các khóa; K-12 | `vmg-e-academy` ở `proposed`, `confirmed = false` | Gđ 1 |
| Q26 | Đường nối đề xuất; Tiếng Trung lớp 3-12 | `proposed = true` nạp nguyên vẹn; ba ô `decision_pending = true` | Gđ 1 |

## Danh sách xác nhận của hành trình (`meta.verify_list`, spec G.4)

Nạp nguyên văn vào `journey_meta` (khóa `meta`). Bản gốc nằm ở `seed/journey.json`.

1. e-Academy: tuổi các khóa (file nguồn chỉ chia Juniors và Prep); Tiếng Anh Phản Xạ và Cambridge ESL tạm ở tiểu học; K-12 tạm ở THCS và THPT; Juniors và Prep chồng nhau ở 11-16.
2. K-12 là tên mới của A01-D01, chỉ triển khai trên e-Academy, không dạy offline.
3. NextGen IELTS (Prep) và Cambridge ESL online nối với bản offline theo nguyên tắc cùng chương trình: R&D xác nhận; IELTS Lab có thể đổi theo đề án VMG IELTS 2026-2027 (CORE và THE IELTS LAB, dự kiến 03/2027).
4. e-Plus Pro thay thế hay song song với EPlus offline; đối tượng e-Plus Pro.
5. Thương hiệu: VMG e-Academy chưa có trong file Nền tảng (màu xanh ngọc là đề xuất); B2G tạm thẻ VMG English (xám xanh đề xuất); SAT, VSTEP, EPlus, FlexTrack tạm VMG English.
6. B2G: chưa có giá, mô hình hợp đồng, người trực tiếp dạy, giáo trình mầm non; số liệu hơn 200 trường và khoảng 42.000 học sinh chưa rõ gắn chương trình nào nên không đưa lên sơ đồ.
7. Tiếng Trung lớp 3-12 (file nguồn ghi cả 8-15 và 8-18 tuổi): chờ Ban Giám Đốc quyết định; không có mũi tên từ lớp 3-12 sang HSK; mũi tên từ lớp 12 sang tiếng Trung giao tiếp 16+ là đề xuất.
8. IE1 đến IE7 (band 4.0 đến 6.5+, 3 tháng 36 giờ mỗi cấp): R&D xác nhận.
9. Cam kết đầu ra trong danh mục sản phẩm khác cách chia cấp trong hành trình (ví dụ NextGen 5.5 và 6.5; IELTS Express 0 lên 6.0 trong 1 năm).
10. Mốc ngày trong `timed_notes`: xác nhận còn hiệu lực trước khi hiển thị.

## Phát sinh khi dựng (chưa có trong spec)

| # | Vấn đề | Đề xuất |
|---|---|---|
| N1 | **ĐÃ XỬ LÝ.** Cam kết đầu ra IE1-IE7 từng lộ qua `duration_text` (spec 6.1.1, Q23). Nay seed tách phần cam kết sang `journey_nodes.commitment_text`; view chỉ trả khi `commitment_confirmed = true` (mặc định false). Khi R&D xác nhận Q23, admin bật cờ cho từng ô. | Không còn việc. Xem DECISIONS D-015. |
| N2 | Phụ lục A.1 ghi `vmg-ielts` là `effective` nhưng không nêu ngày hiệu lực; `is_usable` yêu cầu `effective_from`. | Đang seed `draft`. Admin đặt `release_status = effective` và `effective_from` khi Ban Giám Đốc phê duyệt Nền tảng (xem DECISIONS D-004). |
| N3 | File nguồn chưa có trong `docs/source/`: Nền tảng v3 (.docx), Kế hoạch triển khai v3 (.docx), Brand Identity Context, Product Portfolio 2026, PDF Hành trình, hai file rule của Marketing, `centers.csv`. | Nhờ chủ sản phẩm đặt vào. Chưa seed được: `products`, `centers`, nội dung Brand Hub, `voice_profile`, `role_summary`. |
| N4 | Quản trị đầu tiên không tự có. Hồ sơ mới mặc định `staff`. | Nâng quyền bằng SQL một lần (README, mục Quản trị đầu tiên). Cần chốt ai là hai `admin` (R12). |
| N5 | Thông báo lỗi đăng nhập gộp lỗi sai mật khẩu và lỗi mất kết nối tới Supabase thành "chưa đúng". | Tách hai trường hợp khi có môi trường Supabase thật để thử. |
| N6 | `lib/drive/` đã xong và kiểm thử với bản mô phỏng, nhưng **chưa chạy với Drive thật**: chưa có Shared Drive `VMG Brand Library`, cây `_NHAP` và `_CHINH_THUC`, tài khoản dịch vụ. Cần Q17, Q18, Q19. | Marketing tạo Shared Drive, thêm tài khoản dịch vụ, điền các biến `DRIVE_*` và `GOOGLE_*`; sau đó chạy thử bằng một tệp thật. |
| N9 | Khi thương hiệu còn `draft`, staff không đọc được bảng `brands` (RLS) nên ô không có chip thương hiệu; chỉ xuất hiện sau khi admin đưa thương hiệu sang `effective`. Cùng lúc đó mọi ô cũng còn `proposed` nên staff chưa thấy bản đồ. | Khi phát hành, đưa thương hiệu và ô sang `effective` cùng đợt. Cân nhắc view `v_usable_brands` nếu cần tách. |
| N10 | Trang chặng với khóa không tồn tại trả mã 200 kèm giao diện "không tìm thấy" (nội dung được truyền theo luồng trong Suspense nên mã trạng thái đã gửi). | Chấp nhận ở MVP vì là công cụ nội bộ; sửa nếu cần theo dõi 404. |
| N11 | Chưa quản trị được hành trình trên giao diện (`/admin/journey`): chuyển ô sang `effective`, xác nhận cam kết (`commitment_confirmed`), đổi thương hiệu phải làm bằng SQL. | Làm ở Giai đoạn 1 kế tiếp. |
| N7 | Ô `z05` (Luyện thi HSK) có `description` "cam kết đầu ra theo từng level" và `brand_confirmed = true`. Spec 6.1.1 chỉ gác cam kết của IE1-IE7 nên tôi không che, nhưng R15 nói chung là không hiển thị cam kết chưa thống nhất. | Chủ sản phẩm xác nhận cam kết HSK đã thống nhất; nếu chưa, tách `commitment_text` cho ô này như IE. |
| N8 | Drive trả 404 cả khi tài khoản dịch vụ không thấy tệp (mất quyền) lẫn khi tệp bị xóa, nên `missing` và `no_access` có thể lẫn nhau. | Quản trị xử lý cả hai cùng cách (ẩn nút tải, báo Marketing), đúng spec 6.4.1. Không cần làm gì thêm. |
