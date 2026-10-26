# VMG Brand Lab

Thư viện, chuẩn và công cụ thương hiệu nội bộ của VMG. Đặc tả: [docs/VMG_BrandLab_Spec_v0.4.md](docs/VMG_BrandLab_Spec_v0.4.md). Quy ước làm việc cho Claude Code: [CLAUDE.md](CLAUDE.md).

Next.js 16 (App Router) · TypeScript · Tailwind 4 · Supabase (Postgres, Auth, RLS) · Vitest.

## Chạy cục bộ

```bash
npm ci
cp .env.example .env.local   # điền NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

Thiếu hai biến `NEXT_PUBLIC_SUPABASE_*` thì ứng dụng báo lỗi thay vì mở cửa không cần đăng nhập.

## Xem thử khi chưa có Supabase (chế độ thử)

Để xem giao diện hành trình ngay trên máy, không cần Supabase và không cần đăng nhập, thêm vào `.env.local`:

```
BRAND_LAB_DEV_SEED=1
```

rồi `npm run dev` và mở **http://localhost:3000/brand/journey** (cũng có /brand/brands và /brand/products) (dùng `localhost`, không dùng `127.0.0.1`: Next dev chặn nguồn khác). Trang hiển thị dữ liệu từ `seed/journey.json`, `seed/brands.json`, `seed/products.json` ở góc nhìn biên tập, kèm biểu ngữ "Chế độ thử". Chế độ này **tự tắt ở bản build production** (`NODE_ENV=production`), dù biến có được đặt, vì nó bỏ qua đăng nhập, RLS và cổng phát hành.

## Cơ sở dữ liệu

Migration ở `supabase/migrations/` (áp dụng bằng Supabase CLI: `supabase db push` hoặc `supabase db reset` cục bộ). Sau khi có dự án Supabase, tắt tự đăng ký (đã đặt `enable_signup = false` trong `supabase/config.toml`) và tạo người dùng bằng lời mời.

```bash
npm run seed -- --dry-run   # kiểm tra seed/journey.json, brands.json, products.json, không cần Supabase
npm run seed                # nạp feature_flags, brands, products, brand_book (draft), journey_* (proposed)
npm run seed:products        # sinh lại seed/products.json từ docs/source/VMG_Product_Portfolio_2026.md
npm run seed:brandbook       # sinh lại hồ sơ thương hiệu seed/brand-book.json từ docs/source/VMG_Brand_Book_2026_v0.2_final.docx (cần uv)
npm run seed -- --force     # nạp lại trường nguồn; không đổi trạng thái đã xác nhận
```

### Quản trị đầu tiên

Hồ sơ mới mặc định là `staff`. Sau khi tạo tài khoản đầu tiên trong Supabase Auth, nâng quyền một lần bằng SQL Editor:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'email-cua-admin@...');
```

Spec R12 yêu cầu tối thiểu hai `admin`.

## Triển khai (Vercel và Supabase)

Dự án Vercel kết nối GitHub: mỗi lần push lên `main` tự triển khai. [vercel.json](vercel.json) đặt vùng chạy hàm là `sin1` (Singapore) cho gần người dùng Việt Nam.

1. **Tạo dự án Supabase**, nên chọn vùng Singapore.
2. **Biến môi trường** (Vercel, Settings, Environment Variables; Production và Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   Hai biến này được nhúng lúc build, nên **phải triển khai lại (Redeploy) sau khi thêm hoặc sửa**. Không đặt `BRAND_LAB_DEV_SEED`. `SUPABASE_SERVICE_ROLE_KEY` chưa cần trên Vercel: chỉ script seed dùng, chạy trên máy bạn.
3. **Migration:** áp dụng năm file trong `supabase/migrations` theo thứ tự (`supabase db push`, hoặc dán lần lượt vào SQL Editor), rồi `npm run seed`, rồi nâng một tài khoản lên `admin` (mục Quản trị đầu tiên ở trên).
4. **Supabase Auth:** đặt Site URL và Redirect URLs thành tên miền Vercel; tắt tự đăng ký.
5. **Bảo vệ truy cập:** tên miền production là công khai (các URL preview thì được Vercel Authentication chặn). Trong lúc nội dung chưa được Ban Giám Đốc phê duyệt, nên bật Vercel Authentication cho production.

**Khi thiếu biến môi trường**, mọi trang trả mã **503** với trang "Hệ thống chưa sẵn sàng" (`app/config-error/route.ts`), không bao giờ mở cửa không cần đăng nhập. Trang công khai không nêu tên biến; chi tiết nằm ở Runtime Logs của Vercel.

## Kiểm thử

```bash
npm run typecheck
npm run lint
npm test
```

`npm test` gồm kiểm thử seed so khớp số lượng spec G.1 (61 ô, 51 đường nối, 14 đề xuất) và kiểm thử migration cùng RLS theo vai trò trên Postgres trong tiến trình (PGlite), không cần Docker.

## Design system

Theo bộ nhận diện VMG (PDF 04/2021). Trang sống `/design-system`; hướng dẫn cho người viết mã ở [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md). Token ở `app/globals.css`, thành phần ở `components/ui`. Dùng class theo vai trò (`bg-brand`, `text-ink-2`), không dùng mã hex trong component.

## MVP: Hành trình khách hàng (Giai đoạn 1, mục 6.1.1)

Trình bày theo câu hỏi của nhân viên tư vấn ("khách này ở đâu, có những đường học nào, học xong đi tiếp đâu"), không sao chép sơ đồ gốc:

- `/brand/journey`: tổng quan 5 chặng tuổi trong một màn hình (ai quyết định, sản phẩm chính, học ở đâu, học xong đi tiếp đâu), các hướng học song song (online, trường học, tiếng Trung), và tìm nhanh không dấu.
- `/brand/journey/stage/[key]`: trang chặng là nơi học. Mục tiêu đầu ra, rồi từng hướng học với lộ trình theo bước (cấp học đánh số, cột mốc thi xen giữa), sản phẩm bổ trợ, và "học xong chặng này thì đi tiếp đâu". Thanh chuyển chặng bên trái (máy tính) hoặc hàng cuộn ngang (điện thoại).
- 61 ô được gộp thành lộ trình dựa trên đường nối thứ tự có sẵn trong dữ liệu; ô cùng một sản phẩm bị vẽ nhiều lần ở nguồn được gộp thành một thẻ.
- Editor và admin thấy cả nội dung chưa phát hành và ghi chú chờ xác nhận (đọc bảng gốc). Vai trò khác chỉ thấy bản đã phát hành qua view; khi mọi ô còn `proposed` thì thấy thông báo "chưa được phát hành" (đúng spec 9.1).
- Chưa có: thẻ sản phẩm `/brand/products/[code]`, "Đi theo hành trình" theo mục tiêu, xuất PDF, quản trị hành trình (`/admin/journey`), các mục Chuẩn, Thư viện, Kế hoạch, Công cụ.

## Tiến độ Giai đoạn 0 (spec 9.2, 9.3)

| Hạng mục | Trạng thái |
|---|---|
| Kho mã, CI, token giao diện, từ điển tiếng Việt | Xong |
| Supabase: enum, `profiles`, `centers`, `brands`, `products`, `center_brands`, `brand_owners`, `feature_flags`, `audit_log` | Xong, kiểm thử trên PGlite |
| Vai trò và RLS nền; nhật ký kiểm toán chỉ thêm | Xong, kiểm thử trên PGlite |
| `is_usable` và view `v_usable_journey_*` | Xong, kiểm thử trên PGlite |
| Seed hành trình (`journey_*`) và thương hiệu | Xong ở mức kiểm thử PGlite; **chưa chạy trên Supabase thật** |
| Đăng nhập (email, mật khẩu), chuyển hướng người chưa đăng nhập | Khung có, **chưa thử với Supabase thật** (đã thử trang và luồng lỗi) |
| Migration chạy trên Supabase thật, kiểm thử RLS trên Supabase thật | Chưa (không có Docker, chưa có dự án Supabase) |
| Hồ sơ trung tâm (`seed/centers.csv`) | Chưa, cần dữ liệu từ chủ sản phẩm |
| `lib/drive/` (đăng ký, ghim bản sửa, tải đúng bản đã ghim, sức khỏe liên kết) kèm `MockDrive` | Xong, kiểm thử với bản mô phỏng và client Google giả lập |
| Google Drive thật: Shared Drive, cây `_NHAP`/`_CHINH_THUC`, tài khoản dịch vụ | Chưa, Marketing cần tạo; xem [docs/OPEN_QUESTIONS.md](docs/OPEN_QUESTIONS.md) N6 |
| `products`, nội dung Brand Hub từ file nguồn | Chưa, file nguồn chưa có trong `docs/source/` |
