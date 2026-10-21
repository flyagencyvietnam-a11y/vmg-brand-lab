-- Sửa N1 (docs/OPEN_QUESTIONS.md): cam kết đầu ra không được lộ cho người dùng thường
-- cho đến khi R&D xác nhận (spec 6.1.1, R15, Q23).
--
-- File nguồn gộp cam kết vào duration_text ("3 tháng, 36 giờ · cam kết đầu ra từng cấp").
-- Seed tách phần cam kết sang commitment_text; commitment_confirmed mặc định false.
-- View chỉ trả commitment_text khi commitment_confirmed = true. editor, admin đọc bảng gốc nên vẫn thấy.

alter table public.journey_nodes
  add column commitment_text text,
  add column commitment_confirmed boolean not null default false;

drop view public.v_usable_journey_nodes;

create view public.v_usable_journey_nodes as
select
  n.id, n.code, n.line_key, n.stage_key, n.lane_key, n.kind, n.brand_id,
  n.product_name, n.item_name, n.duration_text,
  case when n.commitment_confirmed then n.commitment_text end as commitment_text,
  n.description, n.group_code,
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

revoke all on public.v_usable_journey_nodes from anon;
grant select on public.v_usable_journey_nodes to authenticated;
