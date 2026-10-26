# Design system VMG Brand Lab

Trang sống: `/design-system` (màu, chữ, họa tiết, thành phần, nên và không nên). Tài liệu này là bản cho người viết mã.

## Nguồn

| Nguồn | Dùng cho |
|---|---|
| `VMG BRAND IDENTITY SYSTEM-ENGLISH.pdf` (bản cuối, 04/2021, 112 trang) | Màu (tr. 22 đến 26), họa tiết (tr. 28), kiểu chữ (tr. 29 đến 35), ảnh (tr. 36 đến 38), logo (tr. 8 đến 20), cách dùng ở không gian (tr. 83 đến 112) |
| `LOGO VMG/Logo VMG.pdf` (vector) | Biểu tượng hoa trong `public/brand/vmg-symbol.svg` |
| Spec Brand Lab v0.4, mục 4.4 | Chữ tối thiểu 16 px, tương phản 4,5:1, không tô kín đỏ diện tích lớn |

Bộ nhận diện này là bản 2021 của VMG English. Bản cho hệ thống VMG sẽ thay khi Bộ chuẩn 1.0 ban hành (dự kiến 01/2027).

## Token (một nguồn: `app/globals.css`)

- **Màu thô** ở `:root` (`--vmg-red-600`...). **Vai trò** ở `@theme static` (`--color-brand`...). Giao diện chỉ dùng vai trò: `bg-brand`, `text-ink-2`, `border-line`, `bg-paper`, `bg-surface`... **Không dùng mã hex trong component.**
- Hai mã chính thức: đỏ Pantone 200C `#be202f`, vàng đồng Pantone 871C `#8b672a`. Các sắc nhạt đo từ PDF trang 24 và 2; vàng biểu tượng `#b6924d` đo từ file logo. Sắc đậm `#921824` (hover) và thang mực là suy ra, nhãn "Suy ra" trên trang tài liệu.
- Chữ: Montserrat Variable (xem "Điều chưa chốt"). Thang: `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-lead`, `text-body`, `text-small`, `text-caption`; tiêu đề đã gắn độ đậm (700 cho Display và H1, 600 cho H2 và H3) và khoảng cách chữ âm nhẹ trong token; lớn nhất khoảng 44 px. Bo góc: `rounded-ctl` (16 px), `rounded-card` (28 px), `rounded-hero` (40 px), `rounded-full` (viên thuốc). Cỡ `text-mega` (tối đa 80 px) chỉ cho tiêu đề đầu trang và con số nổi bật.
- Nền thẻ mặc định là `paper` (trắng). Tông nhạt (`brand-soft` hồng nhạt, `sunken`, `surface` kem) chỉ làm điểm nhấn hiếm hoặc nền trạng thái.
- Muốn thêm hoặc sửa token: sửa `app/globals.css` **và** `lib/design/tokens.ts`. `tests/unit/design-tokens.test.ts` báo lỗi nếu hai nơi lệch nhau, hoặc nếu một cặp chữ và nền dưới 4,5:1.

## Ngôn ngữ thiết kế: nhẹ, mảnh, nền trơn

Bản trước (thân thiện: bo 24 px, thẻ tông xen kẽ, hình tròn mờ, họa tiết hoa) bị phản hồi là thô và họa tiết xấu. Bản này bỏ trang trí, thu nhỏ chữ và thành phần:

| Trước | Nay |
|---|---|
| Họa tiết hoa lặp, biểu tượng cắt góc, hình tròn mờ, biểu tượng mờ ở góc thẻ | Không có. Nền trơn. Biểu tượng hoa chỉ ở header, trang đăng nhập, trang báo lỗi, một lần mỗi màn hình |
| Display tới 72 px, ExtraBold; tên sản phẩm IN HOA đậm | Lớn nhất khoảng 44 px, Bold cho tiêu đề trang, SemiBold cho phần còn lại; tên sản phẩm viết hoa kiểu câu |
| Thẻ bo 24 px, nền tông xen kẽ, số chặng trong hình tròn | Thẻ bo 16 px, viền 1 px, nền trắng; chỉ thẻ đích đến hồng nhạt; không bong bóng số |
| Khối mở trang bo 32 px, trang chặng cũng khối đỏ | Khối đỏ gọn bo 24 px ở trang chủ hành trình và đăng nhập; trang chặng dùng đầu trang không nền |
| Mục đang chọn là viên đỏ đặc | Mục đang chọn là viên hồng nhạt chữ đỏ |
| Ô nhập cao 56 px, viền 2 px; điểm đánh số lớn có viền | Ô nhập cao 48 px, viền 1 px; điểm đánh số 28 px không viền, đường nối 1 px |

**Ngoại lệ có chủ đích: màu theo chặng** (D-034). Hành trình dùng dải nền phẳng theo chặng (`lib/design/stage-theme.ts`): vàng chanh, tím nhạt, hồng nhạt, tím đậm, kem; đường dọc và cột mốc cùng tông. Vẫn không họa tiết và không ảnh trang trí. Hai màu mới (`lemon`, `plum`) từ bộ màu website, ghi N14; vàng chanh chỉ làm đường dọc và cột mốc, không làm chữ trên nền trắng.

**Bản đồ toàn cảnh** (D-035) dùng màu thẻ theo poster (`lib/design/journey-palette.ts`, ghi N15): chữ trên mọi nền thẻ đạt 4,5:1 (test), nhãn trong thẻ 12 đến 14 px ở cỡ thật và co theo mức phóng; vì vậy luôn có chế độ "Theo độ tuổi" cỡ chữ đầy đủ cho người đọc trên màn hình nhỏ.

**Vẫn không bóng đổ** (spec 4.4, PDF trang 35). Khoảng trắng, cỡ chữ và đường kẻ mảnh tạo nhịp thay cho trang trí.

## Quy tắc (từ PDF và spec)

1. Đỏ và vàng đồng là điểm nhấn; nền đọc là trắng và kem. Khối mở trang gọn (`Hero tone="brand"`) là nền đỏ; trang chi tiết dùng `Hero tone="plain"`.
2. **Phẳng:** không bóng đổ, không chữ viền, không phản chiếu, không 3D. Phân lớp bằng viền (`border-line`) và tông nền.
3. Căn trái. Tiêu đề viết hoa kiểu câu; IN HOA chỉ cho nhãn nhỏ; nội dung viết hoa kiểu câu.
4. **Chữ trên nền đỏ là chữ trắng.** Vàng đồng không đủ tương phản làm chữ trên đỏ (khoảng 2:1) và vàng biểu tượng không đủ trên trắng; vàng chỉ làm nhãn nhỏ và biểu tượng, hoặc chữ `text-gold` (871C) trên trắng và kem. Không đặt `text-gold` lên `bg-sunken` (4,4:1) hay `bg-brand-tint` (4,1:1). Test ghi lại các cặp này.
5. **Không họa tiết.** Bộ nhận diện có họa tiết hoa lặp (PDF trang 28) nhưng Brand Lab không dùng: nền trơn. Biểu tượng hoa (`BrandSymbol`) chỉ xuất hiện ở header, đăng nhập, trang báo lỗi; không lặp, không làm hình nền.
6. Vùng chạm tối thiểu 44 px (`min-h-11`); chữ nội dung từ 16 px; vòng focus luôn hiện (trắng trên nền đỏ nhờ lớp `.on-brand`).
7. Cho nền đỏ, thêm class `on-brand` lên phần tử cha để vòng focus đổi sang trắng.

## Thành phần (`components/ui`)

`Button`/`ButtonLink` (primary, secondary, soft, ghost, inverse; cỡ md, lg; `arrow`), `Card`/`CardLink` (`tone`: paper, blush, champagne, cream, brand; mặc định paper), `Badge` (neutral, pending, gold, brand, soft, on-brand), `Hero` (`tone`: brand, plain), `SectionHeading`/`Eyebrow`, `IconBubble`, `Icon` (bộ nét đều 24 px), `BrandSymbol`. Hoạt ảnh: class `animate-rise` (kèm `animationDelay` để lần lượt) và `lift` (nâng 2 px khi di chuột), cả hai tắt khi giảm chuyển động. Thành phần riêng của hành trình ở `components/journey`.

## Nguồn gốc tệp thương hiệu trong `public/brand`

- `vmg-symbol.svg`: trích nguyên vẹn các đường vector của biểu tượng hoa từ `Logo VMG.pdf` (bằng PyMuPDF), không vẽ lại, không sửa hình; màu `#b6924d` của file gốc.
- Logo đầy đủ (kèm chữ ENGLISH) **không dùng** trong giao diện.

## Điều khác với bộ nhận diện, và vì sao

| Điều | Bộ nhận diện | Brand Lab | Lý do |
|---|---|---|---|
| Họ chữ | Brown | Montserrat Variable (OFL) | Brown chưa có giấy phép dùng trong ứng dụng (Q3). Montserrat hình học, đủ dấu tiếng Việt. Đổi bằng một dòng `--font-sans` |
| Tiêu đề trên nền đỏ | Chữ vàng đồng | Chữ trắng | Vàng trên đỏ không đạt tương phản (spec 4.4) |
| Logo | VMG ENGLISH | Biểu tượng hoa + chữ "VMG Brand Lab" | Logo cấp hệ thống không có chữ ENGLISH, phần hình logo chờ kết luận nhãn hiệu (spec 4.2, 4.3) |
| Màu chữ phụ | Đen 80% và 50% | Mực `#4a433e`, `#6b635d` | Đen 50% chỉ 3,9:1 trên trắng; các mực này đạt 4,5:1 |
| Tỷ lệ màu 60/30/5/5 | Cho ấn phẩm và không gian | Chỉ áp ở dải mở trang | Giao diện đọc cần nền trắng, kem (spec 4.4) |

## Điều chưa chốt

- Giấy phép font Brown (Q3). Khi có, đổi `--font-sans` trong `app/globals.css` và bỏ gói `@fontsource-variable/montserrat`.
- Mã màu UpLearn, EduNext (Q4): chưa có, giao diện không tự đặt màu. Chỉ TESOL, VMP có mã chính thức (`--brand-tesol`, `--brand-vmp-*`).
- Logo là dữ liệu có phiên bản (spec 4.3, `logo_ref`) sẽ thay `public/brand` khi M3 Thư viện có.
