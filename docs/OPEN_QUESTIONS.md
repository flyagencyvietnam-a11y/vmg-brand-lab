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
| N1 | **Cam kết đầu ra có thể lộ qua `duration_text`.** Spec 6.1.1 yêu cầu người dùng thường không thấy câu "cam kết đầu ra từng cấp" của IE1-IE7 cho đến khi R&D xác nhận (Q23). Chuỗi này nằm trong `duration_text` (ví dụ "3 tháng, 36 giờ · cam kết đầu ra từng cấp"), và view `v_usable_journey_nodes` đang trả nguyên cột đó. | Giai đoạn 1: tách cam kết ra khỏi `duration_text` bằng một cột riêng (hoặc cờ che) và che trong view khi ô còn `verify_note`. **Trước khi chuyển bất kỳ ô IE nào sang `effective` phải xử lý.** |
| N2 | Phụ lục A.1 ghi `vmg-ielts` là `effective` nhưng không nêu ngày hiệu lực; `is_usable` yêu cầu `effective_from`. | Đang seed `draft`. Admin đặt `release_status = effective` và `effective_from` khi Ban Giám Đốc phê duyệt Nền tảng (xem DECISIONS D-004). |
| N3 | File nguồn chưa có trong `docs/source/`: Nền tảng v3 (.docx), Kế hoạch triển khai v3 (.docx), Brand Identity Context, Product Portfolio 2026, PDF Hành trình, hai file rule của Marketing, `centers.csv`. | Nhờ chủ sản phẩm đặt vào. Chưa seed được: `products`, `centers`, nội dung Brand Hub, `voice_profile`, `role_summary`. |
| N4 | Quản trị đầu tiên không tự có. Hồ sơ mới mặc định `staff`. | Nâng quyền bằng SQL một lần (README, mục Quản trị đầu tiên). Cần chốt ai là hai `admin` (R12). |
| N5 | Thông báo lỗi đăng nhập gộp lỗi sai mật khẩu và lỗi mất kết nối tới Supabase thành "chưa đúng". | Tách hai trường hợp khi có môi trường Supabase thật để thử. |
| N6 | Thiết lập Google Drive (Shared Drive, tài khoản dịch vụ, `lib/drive/`) thuộc Giai đoạn 0 nhưng chưa làm. Cần Q17, Q18, Q19 và quyền tạo Shared Drive. | Làm sau khi có Shared Drive; `.env.example` đã chừa biến. |
