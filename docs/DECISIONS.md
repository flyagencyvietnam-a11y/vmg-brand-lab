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

**D-019. Chế độ thử cục bộ `BRAND_LAB_DEV_SEED=1`.** Để xem giao diện khi chưa có Supabase. Bỏ qua đăng nhập và đọc `seed/journey.json` ở góc nhìn editor. An toàn: `isDevSeedMode()` đòi `NODE_ENV !== "production"` (có kiểm thử), nên bản build production bỏ qua biến dù được đặt (đã kiểm chứng bằng `next start`: vẫn chuyển về /login, không có biểu ngữ). Có biểu ngữ "Chế độ thử" trên mọi trang. Một kiểm thử so khớp từng trường giữa đường seed (TypeScript) và view SQL của staff (`tests/rls/journey-parity.test.ts`) để chế độ thử không nói sai điều staff thấy.

**D-020. Nguồn dữ liệu theo vai trò.** Editor, admin đọc bảng gốc (thấy ghi chú chờ xác nhận, cam kết chưa xác nhận); vai trò khác đọc view `v_usable_journey_*`. Lựa chọn ở tầng ứng dụng chỉ để chọn nguồn đúng, RLS của cơ sở dữ liệu mới là lớp bảo vệ. Mọi cách hiển thị đi qua `lib/journey/model.ts` (`toNode`) để quy tắc ẩn hiện chỉ có một bản.

**D-021. Ngày hôm nay tính lúc có yêu cầu.** Cache Components cấm `new Date()` khi prerender; `loadJourneyMap` gọi `await connection()` trước khi tính `todayVn()`. Phát hiện khi chạy thử (build production sẽ báo lỗi).

**D-022. Trình bày hành trình theo câu hỏi của nhân viên, không sao chép sơ đồ gốc.** Bản đầu bê nguyên lưới 61 ô × 5 cột lên web: chật, phải cuộn ngang, phải biết trước mình cần tìm gì (nhân viên phản hồi UI/UX tệ). Brand Lab là chỗ để hiểu, không phải bản sao của poster. Thiết kế mới: (1) tổng quan 5 chặng tuổi trong một màn hình, mỗi chặng trả lời "ai quyết định, sản phẩm chính, học ở đâu, học xong đi tiếp đâu"; (2) trang chặng là nơi học, gộp 61 ô thành lộ trình theo bước; (3) hướng học song song (online, trường học, tiếng Trung) là mục riêng, kèm những chặng chúng phủ. Hệ quả: gần như toàn bộ là server component (chỉ ô tìm kiếm là client), dùng liên kết và `<details>` thay vì ngăn trượt; bỏ công tắc "Hiện liên kết đề xuất" (liên kết đề xuất mặc định gập, ghi rõ chưa xác nhận); không còn vẽ mũi tên giữa các cột.

**D-023. Gộp ô thành lộ trình chỉ bằng cấu trúc có sẵn.** `lib/journey/views.ts`: chuỗi ô nối nhau bằng đường nối `sequence` thành một lộ trình (cột mốc thi VMT xen giữa đúng vị trí), ô lẻ thành thẻ, `lane_key` quyết định cột con, `group_code` quyết định nhóm đích, `same_product_as` gộp ô vẽ trùng (IELTS EXAM FOCUS) kèm "đi kèm" lấy từ `attach_to`. Không thêm ô, không đổi thứ tự, không dùng đường nối đề xuất để dựng lộ trình. Có kiểm thử: mỗi trong 61 ô xuất hiện đúng một lần trên các trang chặng.

**D-024. Design system theo bộ nhận diện VMG (PDF 04/2021).** Token ở `app/globals.css` (màu thô ở `:root`, vai trò ở `@theme static`), mô tả ở `lib/design/tokens.ts`, trang sống `/design-system`, thành phần ở `components/ui`. Hai mã chính thức Pantone 200C `#be202f` và 871C `#8b672a`; các sắc nhạt đo từ PDF và file logo, nhãn rõ nguồn (chính thức, đo, suy ra). Test đối chiếu tài liệu với CSS và kiểm tra tương phản; test cũng ghi lại các cặp KHÔNG đạt để không ai dùng nhầm. Chi tiết: `docs/DESIGN_SYSTEM.md`.

**D-025. Biểu tượng hoa trích từ file logo, không dùng logo đầy đủ.** `public/brand/vmg-symbol.svg` là các đường vector nguyên vẹn từ `Logo VMG.pdf`; họa tiết lặp dựng từ chính nó (PDF trang 28 cho phép). Không dùng logo VMG ENGLISH: logo cấp hệ thống không có chữ ENGLISH (spec 4.3) và phần hình chờ kết luận nhãn hiệu (spec 4.2). Header là biểu tượng hoa cùng chữ "VMG Brand Lab". Đây là giải pháp tạm cho đến khi M3 Thư viện có logo dạng dữ liệu có phiên bản (`logo_ref`).

**D-026. Chữ trắng trên nền đỏ, vàng chỉ làm họa tiết.** PDF dùng tiêu đề vàng trên đỏ; đo được 2,1:1, không đạt spec 4.4 (4,5:1). Đồng thời vàng đồng 871C trên nền ấm chỉ 4,36:1 nên không đặt chữ vàng lên `bg-sunken`. Họa tiết độ mờ theo PDF (15% đến 100%, Overlay); biểu tượng cắt góc chỉ đậm từ màn hình xl vì ở màn hình hẹp nó nằm dưới chữ.

**D-027. Montserrat thay Brown tạm thời.** Brown chưa có giấy phép dùng trong ứng dụng (Q3). Montserrat Variable (OFL) là họ hình học gần nhất, đủ dấu tiếng Việt, cài qua `@fontsource-variable/montserrat` (không gọi Google Fonts lúc chạy, build không phụ thuộc mạng). Đổi bằng một dòng `--font-sans`.

**D-028. Thanh điều hướng đánh dấu mục đang chọn nằm trong `<Suspense>`.** `usePathname()` trên trang có tham số động bị Cache Components chặn nếu không có Suspense (phát hiện khi chạy thử); có `NavFallback` cùng giao diện.

**D-029. Thiếu cấu hình thì 503 với trang báo lỗi, vẫn đóng cửa.** Dự án Vercel đầu tiên chưa có biến môi trường nên mọi trang trả "Internal Server Error" trần. Giờ proxy chuyển mọi yêu cầu sang `/config-error` (route handler trả HTML tự chứa, mã 503, `Cache-Control: no-store`, `Retry-After: 300`). Dùng route handler vì `page` không đặt được mã trạng thái và `NextResponse.rewrite` bỏ qua `status` (đo thực tế: ra 200). Trang không nêu tên biến hay hạ tầng (có test); chi tiết ghi `console.error` ở máy chủ. Khi đã cấu hình đủ thì `/config-error` chuyển về `/`. Không đổi nguyên tắc: thiếu cấu hình không bao giờ cho vào không cần đăng nhập.

**D-030. `vercel.json` đặt vùng hàm `sin1`.** Mặc định của Vercel là Mỹ; người dùng ở Việt Nam và cơ sở dữ liệu nên ở Singapore (spec 8.1). Nếu gói Vercel không cho chọn vùng thì xóa dòng `regions`.

**D-031. Làm lại ngôn ngữ hình khối cho thân thiện và hiện đại, vẫn đúng nhận diện.** Phản hồi: giao diện "thô". Nguyên nhân là hình khối (thẻ trắng vuông giống nhau, tiêu đề IN HOA cứng), không phải màu. Giữ nguyên màu, chữ hình học, họa tiết hoa; đổi: bo góc 24 px, nút và nhãn dạng viên thuốc, thẻ tông màu xen kẽ (dùng vai trò sẵn có, không thêm màu mới ngoài `brand-glow`), khối mở trang bo 32 px có hình tròn tông-trên-tông, header nổi, tiêu đề viết hoa kiểu câu ExtraBold (PDF trang 31 cho phép), điểm đánh số lớn và dấu mốc thi bằng biểu tượng hoa, chuyển động nhẹ. **Giữ nguyên "không bóng đổ"** (spec 4.4): chiều sâu bằng tông màu. Muốn bóng mềm thì phải sửa spec.

**D-032. Chuyển động nhẹ, luôn tôn trọng giảm chuyển động.** `animate-rise` (hiện dần, trễ lần lượt) và `lift` (nâng 4 px chỉ trên thiết bị có hover). Một khối `prefers-reduced-motion: reduce` tắt mọi hoạt ảnh và chuyển tiếp; cuộn mượt chỉ bật khi không giảm chuyển động.

**D-033. Làm nhẹ giao diện, bỏ họa tiết, nền trơn (điều chỉnh D-031, D-032).** Phản hồi: chữ to thô, thành phần thô, họa tiết logo xấu, "thà để nền trơn". Bỏ `Ornament`, `PatternLayer`, `Glow`, `Watermark`, vai trò `brand-glow` và tệp `vmg-pattern.svg`; biểu tượng hoa chỉ ở header, đăng nhập, trang báo lỗi. Chữ: Display tối đa khoảng 44 px, Bold cho tiêu đề trang, SemiBold cho phần còn lại, tên sản phẩm viết hoa kiểu câu. Thành phần: viền 1 px, bo 10/16/24 px, nút cao 44 hoặc 48 px, thẻ nền trắng, mục đang chọn là viên hồng nhạt. Hoạt ảnh nhẹ hơn (0,5 giây, nâng 2 px). Giữ nguyên "không bóng đổ" và các cặp tương phản.

**D-014. Font Arial theo spec 4.4, không dùng Geist của scaffold.** Font thương hiệu chưa có giấy phép (Q3).
