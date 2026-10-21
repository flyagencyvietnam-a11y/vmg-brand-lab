-- Giai đoạn 0: nền móng. Spec mục 3, 4.2, 7.1-7.3.
-- Mọi bảng bật RLS. Hàm is_usable là nơi DUY NHẤT quyết định "dùng được hôm nay" (spec 4.2, 8.1).

-- ---------------------------------------------------------------------------
-- Kiểu liệt kê (spec 7.1)
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('admin', 'editor', 'staff', 'backoffice', 'guest');
create type public.content_status as enum (
  'draft', 'in_review', 'proposed', 'effective', 'withheld', 'superseded', 'expired', 'archived'
);
create type public.content_layer as enum ('core', 'creative', 'campaign');
create type public.evidence_status as enum ('verified', 'pending', 'retired');
create type public.visibility as enum ('public', 'internal_only');
create type public.vimi_level as enum ('primary', 'selective', 'limited');
create type public.severity as enum ('block', 'warn', 'info');
create type public.submission_status as enum ('pending', 'approved', 'changes_requested', 'rejected');

-- ---------------------------------------------------------------------------
-- Hàm dùng chung
-- ---------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function public.today_vn()
returns date
language sql
stable
as $$
  select (now() at time zone 'Asia/Ho_Chi_Minh')::date
$$;

-- Quy tắc "dùng được hôm nay" (spec 4.2): trạng thái effective VÀ effective_from <= hôm nay
-- VÀ (effective_to rỗng HOẶC >= hôm nay) VÀ (not_before rỗng HOẶC <= hôm nay).
-- effective_from rỗng thì KHÔNG dùng được. p_today chỉ để kiểm thử.
create function public.is_usable(
  p_status public.content_status,
  p_effective_from date,
  p_effective_to date,
  p_not_before date,
  p_today date default public.today_vn()
)
returns boolean
language sql
stable
as $$
  select coalesce(
    p_status = 'effective'
    and p_effective_from <= p_today
    and (p_effective_to is null or p_effective_to >= p_today)
    and (p_not_before is null or p_not_before <= p_today),
    false
  )
$$;

-- ---------------------------------------------------------------------------
-- Người dùng và tổ chức (spec 7.2)
-- ---------------------------------------------------------------------------
create table public.centers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_display text not null,
  region text,
  address text,
  hotline text,
  email text,
  opening_hours text,
  zalo_oa_url text,
  facebook_url text,
  google_profile_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'staff',
  center_id uuid references public.centers (id),
  job_title text,
  is_approver boolean not null default false,
  is_center_manager boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_center_id_idx on public.profiles (center_id);

-- Chuẩn chung cho thực thể nội dung có vòng đời (spec 7.1) được lặp lại ở từng bảng nội dung.
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_public text not null,
  name_short text,
  kind text not null check (kind in ('parent', 'member')),
  domain text check (domain in ('system', 'language', 'study_career')),
  delivery text check (delivery in ('offline', 'online', 'mixed')),
  parent_id uuid references public.brands (id),
  role_summary text,
  vimi_level public.vimi_level,
  color_primary text check (color_primary ~ '^#[0-9A-Fa-f]{6}$'),
  color_secondary text check (color_secondary ~ '^#[0-9A-Fa-f]{6}$'),
  color_note text,
  confirmed boolean not null default true,
  voice_profile jsonb not null default '{}'::jsonb,
  deprecated_names text[] not null default '{}',
  note text,
  release_status public.content_status not null default 'draft',
  release_condition text,
  not_before date,
  layer public.content_layer not null default 'core',
  sort integer not null default 0,
  effective_from date,
  effective_to date,
  owner_id uuid references public.profiles (id),
  review_due date,
  needs_review boolean not null default false,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  brand_id uuid references public.brands (id),
  brand_confirmed boolean not null default false,
  name text not null,
  description text,
  audience text[] not null default '{}',
  formats text[] not null default '{}',
  lifecycle text,
  category text,
  kpi_owner text,
  status public.content_status not null default 'draft',
  layer public.content_layer not null default 'creative',
  effective_from date,
  effective_to date,
  owner_id uuid references public.profiles (id),
  review_due date,
  needs_review boolean not null default false,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index products_brand_id_idx on public.products (brand_id);

create table public.center_brands (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers (id) on delete cascade,
  brand_id uuid not null references public.brands (id),
  product_id uuid references public.products (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index center_brands_unique_idx
  on public.center_brands (center_id, brand_id, coalesce(product_id, '00000000-0000-0000-0000-000000000000'::uuid));

create table public.brand_owners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  brand_id uuid not null references public.brands (id),
  product_id uuid references public.products (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index brand_owners_unique_idx
  on public.brand_owners (user_id, brand_id, coalesce(product_id, '00000000-0000-0000-0000-000000000000'::uuid));

create table public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  diff jsonb,
  at timestamptz not null default now()
);
create index audit_log_entity_idx on public.audit_log (entity_type, entity_id);
create index audit_log_at_idx on public.audit_log (at desc);

-- ---------------------------------------------------------------------------
-- Hàm vai trò (SECURITY DEFINER để RLS của profiles không đệ quy).
-- Tài khoản bị khóa (active = false) mất quyền ngay: các hàm trả về null/false.
-- ---------------------------------------------------------------------------
create function public.app_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role from public.profiles p where p.id = auth.uid() and p.active
$$;

create function public.app_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.app_user_role() = 'admin', false)
$$;

create function public.app_is_editor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.app_user_role() in ('admin', 'editor'), false)
$$;

-- Thành viên nội bộ: mọi vai trò trừ guest (guest là [SAU], chỉ xem qua liên kết có hạn).
create function public.app_is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.app_user_role() in ('admin', 'editor', 'staff', 'backoffice'), false)
$$;

create function public.app_center_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.center_id from public.profiles p where p.id = auth.uid() and p.active
$$;

create function public.app_is_brand_owner(p_brand_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.brand_owners bo
    join public.profiles p on p.id = bo.user_id and p.active
    where bo.user_id = auth.uid() and bo.brand_id = p_brand_id
  )
$$;

-- ---------------------------------------------------------------------------
-- Hồ sơ tự tạo khi Supabase Auth tạo người dùng (đăng ký chỉ theo lời mời).
-- Vai trò lấy từ raw_app_meta_data (chỉ máy chủ ghi được), mặc định staff (quyền thấp nhất).
-- Quản trị đầu tiên phải được nâng quyền thủ công bằng SQL (xem README).
-- ---------------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    coalesce((new.raw_app_meta_data ->> 'brand_lab_role')::public.user_role, 'staff')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Nhật ký kiểm toán: chỉ thêm, không sửa, không xóa (spec 8.6).
-- ---------------------------------------------------------------------------
create function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.audit_log (actor_id, action, entity_type, entity_id, diff)
    values (auth.uid(), 'insert', tg_table_name, new.id, jsonb_build_object('new', to_jsonb(new)));
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.audit_log (actor_id, action, entity_type, entity_id, diff)
    values (auth.uid(), 'update', tg_table_name, new.id,
            jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new)));
    return new;
  else
    insert into public.audit_log (actor_id, action, entity_type, entity_id, diff)
    values (auth.uid(), 'delete', tg_table_name, old.id, jsonb_build_object('old', to_jsonb(old)));
    return old;
  end if;
end;
$$;

create function public.audit_log_append_only()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_log chỉ được thêm, không được sửa hoặc xóa';
end;
$$;

create trigger audit_log_no_update_delete
  before update or delete on public.audit_log
  for each row execute function public.audit_log_append_only();
create trigger audit_log_no_truncate
  before truncate on public.audit_log
  for each statement execute function public.audit_log_append_only();

-- updated_at và audit cho các bảng nền
do $$
declare
  t text;
begin
  foreach t in array array[
    'centers', 'profiles', 'brands', 'products', 'center_brands', 'brand_owners', 'feature_flags'
  ] loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      t || '_set_updated_at', t);
    execute format(
      'create trigger %I after insert or update or delete on public.%I for each row execute function public.audit_row_change()',
      t || '_audit', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS (spec 7.3): bật trên mọi bảng, không có chính sách "cho phép tất cả".
-- Máy chủ dùng service role (bỏ qua RLS) cho thao tác hệ thống như seed.
-- ---------------------------------------------------------------------------
alter table public.centers enable row level security;
alter table public.profiles enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.center_brands enable row level security;
alter table public.brand_owners enable row level security;
alter table public.feature_flags enable row level security;
alter table public.audit_log enable row level security;

-- profiles: xem hồ sơ của mình; admin xem và sửa tất cả. Không ai tự sửa vai trò của mình.
create policy profiles_select_self on public.profiles
  for select to authenticated using (id = auth.uid());
create policy profiles_select_admin on public.profiles
  for select to authenticated using (public.app_is_admin());
create policy profiles_update_admin on public.profiles
  for update to authenticated using (public.app_is_admin()) with check (public.app_is_admin());

-- centers: thành viên nội bộ xem; chỉ admin sửa (spec 3.3).
create policy centers_select_member on public.centers
  for select to authenticated using (public.app_is_member());
create policy centers_write_admin on public.centers
  for all to authenticated using (public.app_is_admin()) with check (public.app_is_admin());

-- brands và products: người dùng thường chỉ thấy bản is_usable; editor, admin thấy tất cả;
-- brand_owner thấy thương hiệu được gán.
create policy brands_select_usable on public.brands
  for select to authenticated
  using (
    public.app_is_member()
    and deleted_at is null
    and public.is_usable(release_status, effective_from, effective_to, not_before)
  );
create policy brands_select_editor on public.brands
  for select to authenticated using (public.app_is_editor());
create policy brands_select_owner on public.brands
  for select to authenticated using (public.app_is_brand_owner(id));
create policy brands_write_admin on public.brands
  for all to authenticated using (public.app_is_admin()) with check (public.app_is_admin());

create policy products_select_usable on public.products
  for select to authenticated
  using (
    public.app_is_member()
    and deleted_at is null
    and public.is_usable(status, effective_from, effective_to, null)
  );
create policy products_select_editor on public.products
  for select to authenticated using (public.app_is_editor());
create policy products_select_owner on public.products
  for select to authenticated using (brand_id is not null and public.app_is_brand_owner(brand_id));
create policy products_write_admin on public.products
  for all to authenticated using (public.app_is_admin()) with check (public.app_is_admin());

create policy center_brands_select_member on public.center_brands
  for select to authenticated using (public.app_is_member());
create policy center_brands_write_admin on public.center_brands
  for all to authenticated using (public.app_is_admin()) with check (public.app_is_admin());

create policy brand_owners_select_self on public.brand_owners
  for select to authenticated using (user_id = auth.uid());
create policy brand_owners_select_editor on public.brand_owners
  for select to authenticated using (public.app_is_editor());
create policy brand_owners_write_admin on public.brand_owners
  for all to authenticated using (public.app_is_admin()) with check (public.app_is_admin());

-- Cờ tính năng không chứa bí mật; thành viên đọc để giao diện biết bật/tắt.
create policy feature_flags_select_member on public.feature_flags
  for select to authenticated using (public.app_is_member());
create policy feature_flags_write_admin on public.feature_flags
  for all to authenticated using (public.app_is_admin()) with check (public.app_is_admin());

-- Nhật ký: chỉ admin đọc; ghi qua trigger (SECURITY DEFINER) hoặc service role.
create policy audit_log_select_admin on public.audit_log
  for select to authenticated using (public.app_is_admin());

-- anon không có quyền gì trên các bảng này.
revoke all on public.centers, public.profiles, public.brands, public.products,
  public.center_brands, public.brand_owners, public.feature_flags, public.audit_log
  from anon;
