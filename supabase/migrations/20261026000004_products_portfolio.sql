-- Danh mục sản phẩm cho trang /brand/products (spec 6.1.1 Thẻ sản phẩm, Phụ lục A.2).
--
-- Bảng products đã có từ migration 1. Ở đây thêm các cột mà file R&D (VMG_Product_Portfolio_2026.md) có
-- nhưng bảng chưa chứa: nhóm danh mục, người quyết định, mô hình doanh thu, vai trò marketing, ghi chú.
-- Người dùng thường đọc products trực tiếp qua RLS (products_select_usable); phần nội bộ (vòng đời, KPI owner,
-- mô hình doanh thu, vai trò marketing, ghi chú) do tầng ứng dụng chỉ hiển thị cho editor, admin.

alter table public.products
  add column slug text unique,
  add column title text,
  add column segment text,
  add column group_name text,
  add column group_order integer not null default 0,
  add column subgroup text,
  add column decider text[] not null default '{}',
  add column revenue_model text,
  add column marketing_role text,
  add column note text,
  add column group_note text,
  add column extra jsonb not null default '{}'::jsonb,
  add column sort integer not null default 0;

-- Mã sản phẩm gợi ý của từng ô hành trình, cho người dùng thường (bảng gốc journey_node_products chỉ editor đọc).
-- Giống các view v_usable_journey_*: chạy với quyền chủ sở hữu, nên điều kiện thành viên và is_usable nằm trong view.
create view public.v_usable_journey_node_products as
select np.node_id, n.code as node_code, np.product_code_hint, np.product_id
from public.journey_node_products np
join public.journey_nodes n on n.id = np.node_id
where public.app_is_member()
  and n.deleted_at is null
  and public.is_usable(n.status, n.effective_from, n.effective_to, null);

revoke all on public.v_usable_journey_node_products from anon;
grant select on public.v_usable_journey_node_products to authenticated;
