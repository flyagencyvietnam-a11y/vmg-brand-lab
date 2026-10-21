# VMG Brand Lab

@AGENTS.md

Web app nội bộ của Marketing VMG: thư viện, chuẩn, hành trình khách hàng, kế hoạch nội dung chung và xưởng công cụ thương hiệu. **Nguồn sự thật: [docs/VMG_BrandLab_Spec_v0.4.md](docs/VMG_BrandLab_Spec_v0.4.md).** Khi spec mâu thuẫn với file nguồn trong `docs/source/`, file nguồn thắng và ghi vào [docs/OPEN_QUESTIONS.md](docs/OPEN_QUESTIONS.md).

> `C:\Users\Admin\Downloads\CLAUDE.md` (thư mục cha) là của dự án **website công khai** VMG, không phải Brand Lab. Hai dự án khác nhau (ví dụ website cấm hiện "B2G" và "3S", Brand Lab là nội bộ nên được dùng). Khi hai bên lệch, làm theo file này và spec Brand Lab.

## Quy tắc không được phá (spec 0.1, 8.8)

- Không tự viết nội dung thương hiệu, không hardcode: câu chữ, tên, màu, quy tắc nằm trong cơ sở dữ liệu, nạp từ file nguồn bằng script seed.
- Không bịa dữ kiện, số liệu, tên người, số điện thoại giống thật. Chưa xác nhận thì dùng giá trị tạm có cờ (`confirmed`, `brand_confirmed`, `status = proposed`) và ghi `docs/OPEN_QUESTIONS.md`.
- Ô `brand_confirmed = false` hoặc `decision_pending = true`, và đường nối `proposed`, không được dùng để sinh nội dung (T01, T02).
- "Dùng được hôm nay" chỉ quyết định ở hàm SQL `is_usable`. RLS bật trên mọi bảng, không có chính sách "cho phép tất cả".
- Khóa API và service role chỉ phía máy chủ; không commit khóa thật. Không gọi AI thật trong kiểm thử tự động.
- Tệp gốc thư viện nằm ở Google Drive, không lưu vào Supabase Storage; mọi thao tác Drive đi qua `lib/drive/`.
- Giao diện chỉ tiếng Việt có dấu, chuỗi nằm trong `lib/i18n/vi.ts`. Không đưa nội dung thương hiệu mới ra cho nhân viên trước khi có phê duyệt (spec 9.1).

## Lệnh

```bash
npm run typecheck   # next typegen + tsc
npm run lint
npm test            # đơn vị + migration/RLS trên PGlite
npm run seed -- --dry-run
npm run build
```

## Cấu trúc

`app/` trang; `lib/` logic (supabase, journey, brands, i18n); `supabase/migrations` và `supabase/seed`; `seed/` JSON nguồn (không gõ lại bằng tay); `tests/unit`, `tests/rls`; `docs/` spec, quyết định, câu hỏi mở.
