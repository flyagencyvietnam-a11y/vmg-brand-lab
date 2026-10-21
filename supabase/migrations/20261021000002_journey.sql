-- Hành trình khách hàng (spec 6.1.1, 7.2, 7.3, Phụ lục G). Seed từ seed/journey.json.
-- Mọi dòng nạp từ file nguồn ở trạng thái 'proposed' cho đến khi Marketing và R&D xác nhận.

create table public.journey_stages (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  age_label text not null,
  title text not null,
  lead_product text,
  decider text,
  outcomes jsonb not null default '[]'::jsonb,
  note text,
  sort integer not null default 0,
  status public.content_status not null default 'proposed',
  layer public.content_layer not null default 'core',
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

-- Spec cho phép gộp journey_lanes vào journey_lines.sublanes: dùng cách gộp.
create table public.journey_lines (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  description text,
  kind text not null check (kind in ('primary', 'secondary', 'goal_tier')),
  color_proposed text,
  sublanes jsonb not null default '[]'::jsonb,
  sort integer not null default 0,
  status public.content_status not null default 'proposed',
  layer public.content_layer not null default 'core',
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

create table public.journey_nodes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  line_key text not null references public.journey_lines (key),
  stage_key text not null references public.journey_stages (key),
  lane_key text,
  kind text not null check (kind in (
    'level', 'exam', 'support_product', 'product', 'program_header',
    'branch_label', 'goal_group', 'gap_note'
  )),
  brand_id uuid references public.brands (id),
  product_name text not null,
  item_name text,
  duration_text text,
  description text,
  group_code text,
  stage_span text[],
  attach_to text,
  row_hint text,
  timed_notes jsonb not null default '[]'::jsonb,
  brand_confirmed boolean not null default false,
  decision_pending boolean not null default false,
  verify_note text,
  brand_note text,
  -- Trường của file nguồn chưa có cột riêng (program, same_product_as, name_note): giữ nguyên, không mất dữ liệu.
  extra jsonb not null default '{}'::jsonb,
  sort integer not null default 0,
  status public.content_status not null default 'proposed',
  layer public.content_layer not null default 'core',
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
create index journey_nodes_line_stage_idx on public.journey_nodes (line_key, stage_key);
create index journey_nodes_brand_id_idx on public.journey_nodes (brand_id);

-- Mã sản phẩm gợi ý của ô. Chưa có bảng products thật nên lưu mã gợi ý; product_id điền sau khi chủ sản phẩm xác nhận.
create table public.journey_node_products (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references public.journey_nodes (id) on delete cascade,
  product_id uuid references public.products (id),
  product_code_hint text not null,
  confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (node_id, product_code_hint)
);

create table public.journey_edges (
  id uuid primary key default gen_random_uuid(),
  from_node_id uuid not null references public.journey_nodes (id) on delete cascade,
  to_node_id uuid not null references public.journey_nodes (id) on delete cascade,
  kind text not null check (kind in (
    'sequence', 'side', 'side_group', 'branch', 'b2g_link', 'same_program', 'ea_link', 'zh_link'
  )),
  label text,
  proposed boolean not null default false,
  two_way boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (from_node_id, to_node_id, kind)
);
create index journey_edges_to_idx on public.journey_edges (to_node_id);

-- Thông tin phiên bản và danh sách cần xác nhận của file nguồn (meta), cùng dấu "đã seed".
create table public.journey_meta (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

do $$
declare
  t text;
begin
  foreach t in array array[
    'journey_stages', 'journey_lines', 'journey_nodes', 'journey_node_products', 'journey_edges'
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
-- RLS: bảng gốc chỉ editor, admin (và brand_owner với ô thuộc thương hiệu được gán).
-- Người dùng thường đọc qua các view v_usable_journey_* (spec 7.3).
-- Ghi: chỉ admin ở giai đoạn 0; luồng biên tập, hồ sơ thay đổi lớp lõi làm ở giai đoạn 1 (spec 6.3).
-- ---------------------------------------------------------------------------
alter table public.journey_stages enable row level security;
alter table public.journey_lines enable row level security;
alter table public.journey_nodes enable row level security;
alter table public.journey_node_products enable row level security;
alter table public.journey_edges enable row level security;
alter table public.journey_meta enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'journey_stages', 'journey_lines', 'journey_nodes', 'journey_node_products', 'journey_edges', 'journey_meta'
  ] loop
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.app_is_editor())',
      t || '_select_editor', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.app_is_admin()) with check (public.app_is_admin())',
      t || '_write_admin', t);
  end loop;
end;
$$;

create policy journey_nodes_select_owner on public.journey_nodes
  for select to authenticated using (brand_id is not null and public.app_is_brand_owner(brand_id));

-- ---------------------------------------------------------------------------
-- View cho người dùng thường. View chạy với quyền chủ sở hữu (bỏ qua RLS của bảng gốc),
-- nên điều kiện thành viên và is_usable nằm ngay trong view.
-- ---------------------------------------------------------------------------
create view public.v_usable_journey_stages as
select s.id, s.key, s.age_label, s.title, s.lead_product, s.decider, s.outcomes, s.note, s.sort
from public.journey_stages s
where public.app_is_member()
  and s.deleted_at is null
  and public.is_usable(s.status, s.effective_from, s.effective_to, null);

create view public.v_usable_journey_lines as
select l.id, l.key, l.label, l.description, l.kind, l.color_proposed, l.sublanes, l.sort
from public.journey_lines l
where public.app_is_member()
  and l.deleted_at is null
  and public.is_usable(l.status, l.effective_from, l.effective_to, null);

-- Ẩn verify_note, brand_note và mốc thời gian chưa xác nhận hoặc hết hạn (spec 6.1.1, 7.3).
-- brand_confirmed và decision_pending giữ lại để giao diện hiện chú thích "chờ xác nhận".
create view public.v_usable_journey_nodes as
select
  n.id, n.code, n.line_key, n.stage_key, n.lane_key, n.kind, n.brand_id,
  n.product_name, n.item_name, n.duration_text, n.description, n.group_code,
  n.stage_span, n.attach_to, n.row_hint,
  coalesce((
    select jsonb_agg(tn order by ord)
    from jsonb_array_elements(n.timed_notes) with ordinality as x(tn, ord)
    where coalesce((tn ->> 'needs_confirm')::boolean, false) = false
      and (tn ->> 'valid_from' is null or (tn ->> 'valid_from')::date <= public.today_vn())
      and (tn ->> 'valid_to' is null or (tn ->> 'valid_to')::date >= public.today_vn())
  ), '[]'::jsonb) as timed_notes,
  n.brand_confirmed, n.decision_pending, n.extra, n.sort
from public.journey_nodes n
where public.app_is_member()
  and n.deleted_at is null
  and public.is_usable(n.status, n.effective_from, n.effective_to, null);

-- Đường nối chỉ hiện khi cả hai đầu mút đều dùng được.
create view public.v_usable_journey_edges as
select e.id, e.from_node_id, e.to_node_id, e.kind, e.label, e.proposed, e.two_way
from public.journey_edges e
where public.app_is_member()
  and exists (
    select 1 from public.journey_nodes n
    where n.id = e.from_node_id and n.deleted_at is null
      and public.is_usable(n.status, n.effective_from, n.effective_to, null))
  and exists (
    select 1 from public.journey_nodes n
    where n.id = e.to_node_id and n.deleted_at is null
      and public.is_usable(n.status, n.effective_from, n.effective_to, null));

revoke all on public.journey_stages, public.journey_lines, public.journey_nodes,
  public.journey_node_products, public.journey_edges, public.journey_meta,
  public.v_usable_journey_stages, public.v_usable_journey_lines,
  public.v_usable_journey_nodes, public.v_usable_journey_edges
  from anon;
grant select on public.v_usable_journey_stages, public.v_usable_journey_lines,
  public.v_usable_journey_nodes, public.v_usable_journey_edges
  to authenticated;
