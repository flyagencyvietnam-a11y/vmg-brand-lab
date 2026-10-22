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
- Chữ: Montserrat Variable (xem "Điều chưa chốt"). Thang: `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-small`, `text-caption`. Bo góc: `rounded-ctl` (10 px), `rounded-card` (16 px).
- Muốn thêm hoặc sửa token: sửa `app/globals.css` **và** `lib/design/tokens.ts`. `tests/unit/design-tokens.test.ts` báo lỗi nếu hai nơi lệch nhau, hoặc nếu một cặp chữ và nền dưới 4,5:1.

## Quy tắc (từ PDF và spec)

1. Đỏ và vàng đồng là điểm nhấn; nền đọc là trắng và kem. Dải mở trang (`Hero`) là nền đỏ, giữ chiều cao vừa phải.
2. **Phẳng:** không bóng đổ, không chữ viền, không phản chiếu, không 3D. Phân lớp bằng viền (`border-line`) và nền.
3. Căn trái. IN HOA chỉ cho tiêu đề trang và nhãn nhỏ; tiêu đề mục và nội dung viết hoa kiểu câu.
4. **Chữ trên nền đỏ là chữ trắng.** Vàng đồng không đủ tương phản làm chữ trên đỏ (khoảng 2:1) và vàng biểu tượng không đủ trên trắng; vàng chỉ làm họa tiết, hoặc chữ `text-gold` (871C) trên trắng và kem. Không đặt `text-gold` lên `bg-sunken` (4,4:1). Test ghi lại các cặp này.
5. Họa tiết: chỉ dùng biểu tượng hoa (`BrandSymbol`, `Ornament`, `PatternLayer`). Họa tiết lặp dùng chế độ Overlay, độ mờ từ 15% đến 100% (PDF trang 28).
6. Vùng chạm tối thiểu 44 px (`min-h-11`); chữ nội dung từ 16 px; vòng focus luôn hiện (trắng trên nền đỏ nhờ lớp `.on-brand`).
7. Cho nền đỏ, thêm class `on-brand` lên phần tử cha để vòng focus đổi sang trắng.

## Thành phần (`components/ui`)

`Button`/`ButtonLink` (primary, secondary, ghost, inverse), `Card`/`CardLink`, `Badge` (neutral, pending, gold, brand, on-brand), `Hero`, `SectionHeading`/`Eyebrow`, `Icon` (bộ nét đều 24 px), `BrandSymbol`/`Ornament`/`PatternLayer`. Thành phần riêng của hành trình ở `components/journey`.

## Nguồn gốc tệp thương hiệu trong `public/brand`

- `vmg-symbol.svg`: trích nguyên vẹn các đường vector của biểu tượng hoa từ `Logo VMG.pdf` (bằng PyMuPDF), không vẽ lại, không sửa hình; màu `#b6924d` của file gốc.
- `vmg-pattern.svg`: lát gạch 160 px từ chính biểu tượng đó, xen kẽ xoay 36 độ.
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
