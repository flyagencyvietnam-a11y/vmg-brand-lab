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

## Cơ sở dữ liệu

Migration ở `supabase/migrations/` (áp dụng bằng Supabase CLI: `supabase db push` hoặc `supabase db reset` cục bộ). Sau khi có dự án Supabase, tắt tự đăng ký (đã đặt `enable_signup = false` trong `supabase/config.toml`) và tạo người dùng bằng lời mời.

```bash
npm run seed -- --dry-run   # kiểm tra seed/journey.json và seed/brands.json, không cần Supabase
npm run seed                # nạp feature_flags, brands, journey_* (trạng thái proposed)
npm run seed -- --force     # nạp lại trường nguồn; không đổi trạng thái đã xác nhận
```

### Quản trị đầu tiên

Hồ sơ mới mặc định là `staff`. Sau khi tạo tài khoản đầu tiên trong Supabase Auth, nâng quyền một lần bằng SQL Editor:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'email-cua-admin@...');
```

Spec R12 yêu cầu tối thiểu hai `admin`.

## Kiểm thử

```bash
npm run typecheck
npm run lint
npm test
```

`npm test` gồm kiểm thử seed so khớp số lượng spec G.1 (61 ô, 51 đường nối, 14 đề xuất) và kiểm thử migration cùng RLS theo vai trò trên Postgres trong tiến trình (PGlite), không cần Docker.

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
| Google Drive: Shared Drive, tài khoản dịch vụ, `lib/drive/` kèm bản mô phỏng | Chưa, xem [docs/OPEN_QUESTIONS.md](docs/OPEN_QUESTIONS.md) N6 |
| `products`, nội dung Brand Hub từ file nguồn | Chưa, file nguồn chưa có trong `docs/source/` |
