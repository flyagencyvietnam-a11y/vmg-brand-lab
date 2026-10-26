-- Hồ sơ định vị của từng thương hiệu, từ VMG Brand Book 2026 (docs/source/VMG_Brand_Book_2026_v0.2_final.docx, bản dự thảo
-- chờ Ban Giám Đốc duyệt).
--
-- brands.profile: bảng định vị ở mục 3 của tài liệu (người học, vấn đề, lời hứa, lý do tin, thông điệp, vai trong hành trình,
-- vai nhân cách, cách viết tên, nhận diện, điều cần lưu ý, giới thiệu chuẩn) cùng vai trò, định vị một câu và màu thẻ.
-- role_summary và voice_profile (đã có từ migration 1) cũng được điền. Cột nằm trong bảng brands nên theo đúng cổng phát
-- hành của brands (is_usable): thương hiệu còn draft thì nhân viên chưa thấy hồ sơ (spec 9.1).

alter table public.brands add column profile jsonb not null default '{}'::jsonb;
