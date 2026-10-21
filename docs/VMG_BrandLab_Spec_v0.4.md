# VMG BRAND LAB - ĐẶC TẢ SẢN PHẨM VÀ KỸ THUẬT

> Phiên bản: 0.4 (bản nháp để xây dựng) | Ngày: 21/10/2026
> Thay đổi của 0.4 so với 0.3: cập nhật theo sơ đồ **Hành trình khách hàng VMG theo các line sản phẩm** (bản mới 20/10/2026, thay bản 15/10/2026). Bản đồ nay có **bốn line** (Line 1 ESL B2C chính; VMG e-Academy; hai line phụ B2G và Tiếng Trung) và một **tầng đích** cuối nối với nhiều line; **B2G quay lại hành trình** (bản 0.3 loại B2G); A01-D01 đổi thành K-12 trên e-Academy; thêm đường nối đề xuất (nét đứt); dữ liệu hành trình thành 61 ô và 51 đường nối. Sửa mục 6.1.1, 7.2, 8.7, 10 và các Phụ lục A, F, G cho khớp.
> Thay đổi của 0.3 so với 0.2: thêm **Hành trình khách hàng và Thẻ sản phẩm** làm mặt tiền của kiến thức thương hiệu và sản phẩm (mục 6.1.1, Phụ lục G); thêm **module M9 Kế hoạch nội dung chung** (mục 6.8, Phụ lục H) thành trụ thứ năm; cập nhật tên VMT (dịch vụ khảo thí), ánh xạ thương hiệu theo hành trình; sửa mục 1, 3, 4, 7, 8, 9, 10 cho khớp.
> Thay đổi của 0.2 so với 0.1: chuyển sang mô hình lưu trữ **Drive là kho tệp gốc, Brand Lab là sổ đăng ký** (mục 6.4.1); sửa mục 6.4, 7.2, 7.3, 8.1, 8.3 đến 8.5, 9, 10 cho khớp.
> Đơn vị sở hữu: Phòng Marketing, VMG
> Người đọc chính: Claude Code (tác tử lập trình) và Trưởng phòng Marketing (chủ sản phẩm)
> Trạng thái phê duyệt: phương án và dự toán Brand Lab sẽ trình Ban Giám Đốc trong tháng 12/2026. Spec này mô tả phương án (A): tự xây nội bộ.

---

## 0. CÁCH DÙNG TÀI LIỆU NÀY (DÀNH CHO CLAUDE CODE)

### 0.1 Quy tắc làm việc

1. Đọc toàn bộ spec trước khi viết dòng code đầu tiên. Xây theo từng giai đoạn ở mục 9. Mỗi giai đoạn có tiêu chí hoàn thành; chưa đạt thì chưa sang giai đoạn sau.
2. **Không tự viết nội dung thương hiệu.** Mọi câu chữ thương hiệu (ý tưởng, sứ mệnh, lời hứa, giá trị, thông điệp, headline, câu giới thiệu) phải nạp từ file nguồn ở mục 0.2 bằng script seed, không gõ lại bằng tay, không diễn đạt lại.
3. **Không hardcode nội dung thương hiệu trong code.** Tên thương hiệu, tagline, mã màu, quy tắc kiểm tra, danh sách từ cấm, câu mẫu đều nằm trong cơ sở dữ liệu và sửa được qua trang quản trị.
4. Gặp ký hiệu **[CẦN XÁC NHẬN]**: dừng, ghi vào file `docs/OPEN_QUESTIONS.md` kèm lựa chọn đề xuất, rồi dùng giá trị tạm có cờ `confirmed=false`. Không tự điền giá trị như thể đã chắc chắn.
5. Giao diện và mọi thông báo bằng tiếng Việt có dấu, nhất quán một ngôn ngữ. Không chêm tiếng Anh vào chuỗi giao diện, trừ tên riêng (IELTS, TESOL, UpLearn, EduNext, VIMI, THE INK...).
6. Mức ưu tiên: **[BẮT BUỘC]** phải có ở giai đoạn đó; **[NÊN CÓ]** làm nếu không chặn tiến độ; **[SAU]** chỉ thiết kế chỗ cắm, chưa xây.
7. Khi spec mâu thuẫn với file nguồn, file nguồn thắng; ghi mâu thuẫn vào `docs/OPEN_QUESTIONS.md`.
8. **Lưu trữ tệp theo mô hình Drive-first (mục 6.4.1).** Không lưu tệp gốc của thư viện vào Supabase Storage. Chỉ lưu ở đó ba bucket nhỏ đã liệt kê ở mục 8.1 (`thumbs`, `render_cache`, `generations`). Mọi thao tác Google Drive đi qua một module duy nhất `lib/drive/`.

### 0.2 File nguồn (đặt vào thư mục `docs/source/` của repo)

| File | Dùng cho |
|---|---|
| `VMG_Nen_tang_thuong_hieu_va_pham_vi_rebrand_v3.docx` | Nền tảng thương hiệu, kiến trúc thương hiệu, thông điệp, VIMI, THE INK, quản trị thương hiệu. Nguồn chính cho Brand Hub và Guideline. |
| `VMG_Ke_hoach_trien_khai_thuong_hieu_2026_2030_v3.docx` | Mục 10 (VMG Brand Lab), lộ trình, chỉ số nghiệm thu, danh mục kiểm kê tài sản, chiến dịch 2027. |
| `VMG_Brand_Identity_Context.md` | Bộ nhận diện 2021: logo, màu, tỷ lệ màu, kiểu chữ, quy tắc cấm, ứng dụng. |
| `VMG_Product_Portfolio_2026.md` | Danh mục sản phẩm, mã sản phẩm, đối tượng, vòng đời. |
| `Hanh_trinh_khach_hang_VMG_theo_line.pdf` | Hành trình khách hàng của hệ sinh thái VMG theo các line sản phẩm (bản cập nhật 20/10/2026, thay bản 15/10/2026): nguồn của bản đồ hành trình (mục 6.1.1), thứ tự chặng, line, quy ước ô. |
| `seed/journey.json` | Dữ liệu hành trình đã trích từ file PDF trên (Phụ lục G); script seed nạp vào `journey_*`. Không tự gõ lại bằng tay. |
| File lịch nội dung đang dùng của Marketing (Excel "Master Content & Media", nếu có) | Đối chiếu cột để làm mẫu nhập kế hoạch tháng (Phụ lục H). Nếu chưa có trong repo, hỏi chủ sản phẩm. |
| Các file rule hiện có của Marketing: `VMG Design Language Rules`, `VMG_Content_Rules` (.md) | Nạp làm Rule Set ban đầu (mục 7.4). Nếu chưa có trong repo, hỏi chủ sản phẩm. |

Chuyển docx sang markdown bằng `pandoc -t markdown` để đọc và để script seed trích xuất theo tiêu đề mục.

### 0.3 Thuật ngữ dùng trong spec

| Thuật ngữ | Nghĩa |
|---|---|
| Brand Lab | Tên sản phẩm: thư viện, chuẩn và công cụ thương hiệu nội bộ của VMG |
| Thương hiệu mẹ | VMG (bảo chứng toàn hệ thống) |
| Thương hiệu thành viên | VMG English, VMG IELTS, VMG TESOL, VMG Tiếng Trung, VMP, UpLearn by VMG, EduNext; VMT (dịch vụ khảo thí, tên đã đổi, chưa có nhận diện riêng). **VMG e-Academy** xuất hiện trên hành trình nhưng chưa có trong file Nền tảng: ghi nhận ở trạng thái đề xuất (Q25) |
| Hành trình khách hàng | Sơ đồ hệ sinh thái VMG: trục tuổi theo chiều dọc, các line sản phẩm (ESL B2C, e-Academy, B2G, Tiếng Trung) theo chiều ngang, tầng đích cuối (mục 6.1.1) |
| Line | Một dòng sản phẩm chạy dọc theo tuổi trên hành trình (`journey_lines`) |
| Đường nối đề xuất | Mũi tên nét đứt trên hành trình: gợi ý liên kết để thảo luận, chưa phải điều kiện hay cam kết (`journey_edges.proposed`) |
| Kế hoạch nội dung chung | Kế hoạch nội dung toàn hệ thống theo tháng do Marketing HO công bố, kèm nguồn; trung tâm bám theo (mục 6.8) |
| Nguồn (source) | Tài sản đi kèm một mục kế hoạch: ảnh, video, mẫu, caption, POSM |
| Sản phẩm | Một dòng sản phẩm trong danh mục (có mã, ví dụ `ESL_KIDS`), thuộc một thương hiệu |
| Tài sản (asset) | Một file hoặc bộ file thương hiệu có mã, phiên bản, ngày hiệu lực |
| Bộ tài liệu (bundle) | Tập hợp tài sản theo một mục đích, ví dụ "Bộ tư vấn VMG IELTS" |
| Điểm chạm | Nơi khách hàng hoặc nhân viên tiếp xúc với thương hiệu |
| Lớp lõi | Phần thương hiệu dùng lâu dài, chỉ Ban Giám Đốc quyết định thay đổi |
| Bằng chứng | Căn cứ kiểm chứng cho một thông tin hoặc cam kết (số liệu, kết quả, chứng nhận) |
| Trung tâm | Một trong 10 trung tâm kinh doanh, cộng Trung tâm Kinh doanh TMĐT và đơn vị VMP |
| HO | Khối văn phòng (Marketing HO là đơn vị sở hữu Brand Lab) |

---

## 1. TỔNG QUAN SẢN PHẨM

### 1.1 Brand Lab là gì

Một nơi để người VMG **hiểu thương hiệu, tìm đúng tài liệu và tự làm ra hình ảnh, nội dung đúng chuẩn trong vài phút**, không cần nhờ Marketing HO.

### 1.2 Vấn đề cần giải quyết (trích từ hồ sơ rebrand)

- Mỗi trung tâm tự làm hoặc dùng bản cũ; tên gọi và thông tin không thống nhất giữa các kênh.
- Thiếu một nguồn tài sản chuẩn dùng chung; tốn công làm lại.
- Mỗi trung tâm tự nghĩ nội dung và hỏi lẻ Marketing; thiếu một kế hoạch nội dung chung kèm nguồn để cả hệ thống truyền thông thống nhất theo tháng.
- Nhân viên khó thấy cả hệ sinh thái sản phẩm như một hành trình nối tiếp của học viên, nên tư vấn từng sản phẩm riêng lẻ.
- Marketing HO cần giảm các việc thiết kế nhỏ lẻ cho chi nhánh để tập trung vào thương hiệu tổng.
- Khối Trung tâm đang vận hành đồng thời nhiều việc kinh doanh: công cụ phải **tiết kiệm thời gian ngay từ lần dùng đầu**, nếu không sẽ không được dùng.

### 1.3 Năm mục đích sản phẩm (năm trụ)

| Trụ | Mục đích | Module chính |
|---|---|---|
| **T1. Hiểu và cảm thụ** | Nơi nội bộ vào đọc, hiểu, cảm được thương hiệu VMG và từng thương hiệu sản phẩm, trình bày như **một hành trình khách hàng nối tiếp**: thấy trọn hành trình, bấm vào phần nào thì đi vào chi tiết phần đó | M1 Brand Hub (gồm Hành trình và Thẻ sản phẩm), M6 Học |
| **T2. Chuẩn thương hiệu** | Đầy đủ guideline: ai dùng thương hiệu ra sao, từ thông điệp, hình ảnh, màu sắc | M2 Chuẩn thương hiệu |
| **T3. Thư viện tài liệu** | Thư viện đầy đủ sale kit theo từng thương hiệu và sản phẩm, luôn ở bản có hiệu lực | M3 Thư viện |
| **T4. Xưởng sản xuất** | Công cụ, thư viện nguồn, mẫu để bất kỳ ai cũng làm được hình ảnh và nội dung chuẩn thương hiệu: điền thông tin, bấm nút, ra kết quả dùng được, đúng quy tắc, đúng dữ kiện; có kết nối API AI | M4 Công cụ, M5 Tri thức và quy tắc |
| **T5. Kế hoạch nội dung chung** | Marketing HO công bố hằng tháng kế hoạch nội dung toàn hệ thống cùng nguồn; trung tâm coi đó là nguồn chính thức để bám theo, giúp truyền thông thống nhất | M9 Kế hoạch nội dung |

Hai module nền tảng phục vụ cả năm trụ: M7 Phản hồi và thông báo, M8 Quản trị và đo lường.

Danh sách module: **M1** Brand Hub, **M2** Chuẩn thương hiệu, **M3** Thư viện, **M4** Công cụ (Xưởng), **M5** Tri thức, quy tắc và quản trị theo lớp, **M6** Học và kiểm tra, **M7** Phản hồi và thông báo, **M8** Quản trị người dùng và đo lường, **M9** Kế hoạch nội dung chung. Công cụ trong M4 đánh số T01 đến T09 (mục 5.1).

### 1.4 Người dùng

| Nhóm | Ví dụ | Nhu cầu chính |
|---|---|---|
| Nhân viên Trung tâm (front office) | Tư vấn viên, lễ tân, quản lý trung tâm, giáo viên | Giới thiệu VMG đúng; thấy trọn hành trình sản phẩm khi tư vấn; tìm tài liệu tư vấn; biết tháng này cần đăng gì và lấy nguồn ở đâu; làm bài đăng hằng ngày; chọn đúng logo |
| Marketing HO | Trưởng phòng, nhân sự marketing, thiết kế | Quản lý chuẩn; công bố kế hoạch nội dung và nguồn hằng tháng; duyệt bài; xem mức áp dụng; giảm việc thiết kế nhỏ lẻ |
| Chủ chuyên môn (R&D, chủ sản phẩm) | Chủ sản phẩm IELTS, TESOL, UpLearn... | Xác nhận thông tin và bằng chứng của sản phẩm mình |
| Khối backoffice | Hành chính, nhân sự, tài chính... | Nắm thương hiệu cơ bản; dùng mẫu văn phòng, chữ ký email, slide |
| Ban Giám Đốc | | Xem mức áp dụng, báo cáo nghiệm thu |
| Đối tác bên ngoài (nhà in, agency) | | Nhận bộ tài liệu có thời hạn **[SAU]** |

### 1.5 Phạm vi

**Trong phạm vi:** năm trụ ở 1.3.

**Ngoài phạm vi (không xây trong spec này):**

- Kiểm kê và theo dõi thay tài sản vật lý (Phụ lục A của Kế hoạch): thuộc quy trình riêng của Vận hành. Chỉ chừa khả năng liên kết mã tài sản.
- Theo dõi hồ sơ nhãn hiệu và pháp lý.
- Quản lý campaign, giao việc, task cá nhân và lập kế hoạch nội bộ của Marketing: thuộc Marketing OS (MKT OS). Brand Lab giữ **bản công bố chính thức của kế hoạch nội dung chung** để trung tâm bám theo (M9, mục 6.8); không thay MKT OS ở phần lập kế hoạch và giao việc nội bộ. Chỉ thiết kế chỗ liên kết (mục 8.4).
- Đăng bài tự động lên fanpage, Zalo OA. Bản đầu chỉ xuất file và nội dung để người dùng tự đăng sau khi được duyệt.
- Website công khai của VMG, nền tảng học UpLearn, hệ thống quản lý học viên.
- Âm nhạc VMG Musical, phim hoạt hình và trò chơi VIMI (đề án riêng).
- Lưu dữ liệu khách hàng, học viên cá nhân. Brand Lab không chứa dữ liệu cá nhân của học viên.

### 1.6 Thước đo thành công

Lấy từ mục 10.4 và mục 14 của Kế hoạch, bổ sung chỉ số cho công cụ:

| Chỉ số | Ngưỡng đề xuất | Nguồn đo |
|---|---|---|
| Tìm đúng tài liệu | Ít nhất 90% tác vụ thử tìm được bản có hiệu lực trong tối đa 2 phút | Bài thử tác vụ theo quý; nhật ký tìm kiếm |
| Đầy đủ của bộ tài liệu | 100% bộ trong phạm vi có đủ file, hướng dẫn, ngày hiệu lực, chủ nội dung | Báo cáo sức khỏe nội dung (M8) |
| Đúng phiên bản | Bản hết hiệu lực không xuất hiện trong kết quả tìm kiếm mặc định | Kiểm thử tự động |
| Giảm hỗ trợ thủ công | Số lần trung tâm hỏi Marketing để lấy tài liệu và nhờ thiết kế nhỏ giảm so với số liệu nền quý I/2027 | Phiếu yêu cầu (M7) so với số liệu nền |
| Thời gian ra một bài đăng | Dưới 3 phút từ lúc mở công cụ đến lúc có ảnh và caption sẵn gửi duyệt | Nhật ký công cụ |
| Bài qua kiểm tra tự động ngay lần đầu | Mục tiêu ban đầu 80%, hiệu chỉnh sau 1 tháng dùng thật | Nhật ký kiểm tra |
| Hiểu thương hiệu của đội ngũ | Ít nhất 90% người học đạt từ 80/100 ở bài kiểm tra tình huống trước chiến dịch hè 2027 | M6 |
| Thấy trọn hành trình | Từ trang chủ đến bộ tư vấn của một sản phẩm tối đa 3 lần bấm; ít nhất 90% nhân viên thử trả lời đúng 5 câu hỏi vị trí trên hành trình trong 3 phút | Bài thử; nhật ký điều hướng |
| Trung tâm bám kế hoạch chung | Ít nhất 80% mục `must` được trung tâm đánh dấu đã đăng đúng hạn (ngưỡng đề xuất, hiệu chỉnh sau 2 tháng dùng thật; là chỉ báo mức áp dụng) | Báo cáo thực hiện kế hoạch (M9) |
| Marketing công bố đúng nhịp | Kế hoạch tháng kế tiếp được công bố trước hoặc đúng mốc 04 (ngày 20) | `content_plans.published_at` |

Lưu ý diễn giải (theo Kế hoạch mục 14): lượt truy cập, lượt đăng nhập, số bài tạo ra chỉ là chỉ báo mức áp dụng, **không dùng để kết luận hiệu quả kinh doanh hay tiến bộ học tập**. Báo cáo trong M8 phải ghi chú này.

---

## 2. NGUYÊN TẮC THIẾT KẾ

1. **Một nguồn chuẩn.** Mọi thông tin thương hiệu có đúng một bản gốc trong cơ sở dữ liệu. Tài liệu, mẫu, công cụ chỉ tham chiếu, không sao chép thành bản riêng.
2. **Chỉ thấy bản có hiệu lực.** Mặc định mọi danh sách, tìm kiếm, công cụ chỉ dùng nội dung ở trạng thái "có hiệu lực" và trong thời hạn. Bản cũ chỉ mở được khi chủ động chọn và có cảnh báo.
3. **AI sáng tạo, mã nguồn chịu trách nhiệm chính xác.** Phần nào sai là hỏng thương hiệu (logo, tagline, tên thương hiệu, màu, số điện thoại, địa chỉ, ngày giờ, giá và ưu đãi, điều kiện) do mã nguồn đặt vào, người dùng không sửa được và AI không được tự sinh. AI chỉ đảm nhiệm phần mềm dẻo: diễn đạt caption, gợi ý headline, ảnh nền minh họa không chứa chữ. Chi tiết ở mục 5.2.
4. **Không bịa dữ kiện.** Công cụ chỉ được nêu thông tin có trong Kho dữ kiện đã xác nhận hoặc do người dùng tự nhập. Thông tin chưa có bằng chứng ([CẦN XÁC NHẬN]) bị khóa, không đưa vào nội dung.
5. **Mọi kết quả đều được kiểm tra trước khi giao.** Trình kiểm tra thương hiệu (mục 5.5) chạy tự động trên mọi nội dung và hình công cụ tạo ra, nêu lý do và cách sửa.
6. **Làm nhanh trên điện thoại.** Thiết kế ưu tiên màn hình điện thoại (nhân viên trung tâm dùng điện thoại là chính). Một tác vụ phổ biến không quá ba bước chạm sau khi chọn mục đích.
7. **Có chủ và có hạn.** Mỗi tài sản, mỗi câu chữ, mỗi dữ kiện có người chịu trách nhiệm và ngày rà soát. Nội dung quá hạn rà soát bị gắn cờ, vì chất lượng thư viện phụ thuộc vào việc luôn mới chứ không chỉ vào phần mềm.
8. **Thay đổi lan truyền.** Khi một câu chữ, logo hoặc dữ kiện đổi phiên bản, mọi tài sản và mẫu đang dùng nó được gắn cờ "cần cập nhật" cùng lúc (theo mục 7.3 của Kế hoạch).
9. **Tôn trọng ba lớp quản trị.** Lớp lõi (Ban Giám Đốc quyết định), tài sản sáng tạo (Marketing quản lý), truyền thông theo dịp (phát triển trong khuôn khổ). Hệ thống phản ánh đúng phân quyền này (mục 6.3).
10. **Có dấu vết.** Mọi nội dung do công cụ tạo ra đều lưu lại đầu vào, phiên bản quy tắc, mô hình AI đã dùng, kết quả kiểm tra, người tạo, người duyệt.
11. **Kế thừa trước, thay mới sau.** Logo, màu, tagline kế thừa từ bộ nhận diện 2021 vẫn dùng được; dòng mô tả mới và phần hình logo thay theo ngày hiệu lực và kết luận pháp lý (mục 4.2).

---

## 3. NGƯỜI DÙNG, VAI TRÒ VÀ PHÂN QUYỀN

### 3.1 Vai trò

Mỗi người dùng có đúng một vai trò chính (`profiles.role`), cộng các cờ bổ sung.

| Vai trò | Mã | Ai | Ghi chú |
|---|---|---|---|
| Quản trị | `admin` | Trưởng phòng Marketing và người được giao | Toàn quyền; là người xuất bản nội dung lớp lõi sau khi có quyết định của Ban Giám Đốc |
| Biên tập | `editor` | Nhân sự Marketing HO, thiết kế | Tạo, sửa tài sản, trang, mẫu; gửi xuất bản |
| Nhân viên trung tâm | `staff` | Tư vấn viên, lễ tân, quản lý trung tâm, giáo viên | Gắn với một trung tâm (`center_id`); xem, tải, dùng công cụ |
| Backoffice | `backoffice` | Hành chính, nhân sự, tài chính... | Không gắn trung tâm; dùng bộ công cụ rút gọn |
| Khách | `guest` | Nhà in, agency | **[SAU]** truy cập qua liên kết có hạn, chỉ xem bộ tài liệu được chia sẻ |

Cờ bổ sung:

- `is_approver` (bool): thuộc nhóm duyệt của HO, được duyệt bài do trung tâm gửi.
- `brand_owner`: bảng liên kết người dùng với thương hiệu hoặc sản phẩm mà họ là chủ chuyên môn (R&D, chủ sản phẩm). Chủ chuyên môn xác nhận dữ kiện và bằng chứng của đúng thương hiệu được gán, không cần vai trò `editor`.
- `is_center_manager` (bool): quản lý trung tâm, thấy báo cáo mức dùng của trung tâm mình.

Đăng ký theo lời mời, không mở đăng ký tự do. Giới hạn theo tên miền email công ty **[CẦN XÁC NHẬN: tên miền, và có dùng Google Workspace để đăng nhập một lần không]**.

### 3.2 Ma trận quyền

Ký hiệu: X = có; C = có điều kiện (ghi chú); - = không.

| Hành động | admin | editor | brand_owner | approver | staff | backoffice |
|---|---|---|---|---|---|---|
| Xem Brand Hub, Chuẩn thương hiệu (bản có hiệu lực) | X | X | X | X | X | X |
| Xem thư viện, tải tài sản có hiệu lực | X | X | X | X | X | C (chỉ nhóm tài sản gắn nhãn backoffice) |
| Xem bản nháp, bản hết hiệu lực | X | X | C (thương hiệu được gán) | - | - | - |
| Tạo, sửa tài sản, trang, mẫu | X | X | C (nội dung chuyên môn của thương hiệu được gán, ở dạng đề xuất) | - | - | - |
| Xuất bản tài sản, trang, mẫu | X | C (nội dung không thuộc lớp lõi, qua hai bước: biên tập gửi, quản trị xuất bản) | - | - | - | - |
| Sửa nội dung lớp lõi | C (chỉ khi có hồ sơ thay đổi đã được phê duyệt, mục 6.3) | - | - | - | - | - |
| Xác nhận dữ kiện và bằng chứng | X | - | C (thương hiệu được gán) | - | - | - |
| Dùng T01, T02 | X | X | X | X | X | C (T02 loại nội bộ) |
| Dùng T03 Chữ ký email | X | X | X | X | X | X |
| Dùng T04, T05, T06 | X | X | X | X | C (T04, T06) | C (T04) |
| Gửi bài duyệt | X | X | X | X | X | - |
| Duyệt bài | X | - | - | X | - | - |
| Xem nhật ký tạo nội dung của người khác | X | - | - | C (bài gửi duyệt) | C (quản lý: chỉ trung tâm mình) | - |
| Xem Kế hoạch nội dung đã công bố thuộc phạm vi | X | X | X | X | X (trung tâm mình) | - |
| Tạo, sửa kế hoạch tháng và mục nội dung | X | X | C (đề xuất) | - | - | - |
| Công bố, sửa, hủy mục kế hoạch sau công bố | X | C (gửi, admin công bố) | - | - | - | - |
| Đánh dấu đã đăng, bỏ qua mục kế hoạch | - | - | - | - | X (trung tâm mình) | - |
| Sửa hành trình khách hàng (ô, đường nối) | C (cấu trúc cần hồ sơ thay đổi) | C (gửi, mô tả và ghi chú) | C (đề xuất cho thương hiệu được gán) | - | - | - |
| Quản lý người dùng, trung tâm | X | - | - | - | - | - |
| Cấu hình AI, hạn mức, cờ tính năng | X | - | - | - | - | - |
| Xem báo cáo mức áp dụng | X | C (nội dung) | - | - | C (quản lý: trung tâm mình) | - |

Thực thi bằng chính sách bảo mật mức hàng (RLS) của cơ sở dữ liệu, không chỉ ở giao diện (mục 7.3).

### 3.3 Hồ sơ trung tâm (nguồn dữ liệu cho công cụ)

Công cụ tự điền thông tin liên hệ từ hồ sơ trung tâm của người dùng để thông tin luôn đúng, người dùng không phải gõ lại và không được sửa trong công cụ.

Trường: mã trung tâm, tên hiển thị đúng (theo chuẩn tên hiển thị trên Google), địa chỉ đầy đủ, hotline, email, giờ mở cửa, đường dẫn Zalo OA, fanpage, hồ sơ doanh nghiệp trên Google, thương hiệu và sản phẩm trung tâm đang cung cấp, khu vực, trạng thái hoạt động.

Chỉ `admin` sửa hồ sơ trung tâm. Nhân viên phát hiện sai thì dùng nút "Báo lỗi" (M7). Danh sách và dữ liệu 10 trung tâm cùng Trung tâm Kinh doanh TMĐT và đơn vị VMP do chủ sản phẩm cung cấp qua `seed/centers.csv` **[CẦN XÁC NHẬN]**.

---

## 4. KIẾN TRÚC THÔNG TIN VÀ QUY TẮC NỘI DUNG CHUNG

### 4.1 Sơ đồ trang

Đường dẫn dùng tiếng Anh cho nhất quán mã nguồn; nhãn hiển thị bằng tiếng Việt.

| Đường dẫn | Nhãn | Module | Ghi chú |
|---|---|---|---|
| `/` | Trang chủ | - | Tìm kiếm, lối tắt theo vai trò, mới cập nhật, việc của bạn |
| `/brand` | Hiểu về VMG | M1 | Tổng quan nền tảng thương hiệu |
| `/brand/foundation/[key]` | (mục nền tảng) | M1 | idea, purpose, vision, mission, promise, values, personality, story, csr |
| `/brand/journey` | Hành trình khách hàng | M1 | Bản đồ hành trình; điểm vào mặc định khi tìm hiểu sản phẩm (mục 6.1.1) |
| `/brand/journey/stage/[key]` | (trang chặng) | M1 | Mục tiêu đầu ra, người quyết định, các ô trong chặng |
| `/brand/products/[code]` | (thẻ sản phẩm) | M1 | Trang chi tiết sản phẩm, mở từ ô trên bản đồ |
| `/brand/architecture` | Kiến trúc thương hiệu | M1 | Sơ đồ tương tác theo thương hiệu |
| `/brand/[slug]` | (trang thương hiệu) | M1 | `vmg-english`, `vmg-ielts`, `vmg-tesol`, `vmg-chinese`, `vmp`, `uplearn`, `edunext` |
| `/brand/messages` | Thông điệp và cách giới thiệu | M1 | Tagline, thông điệp chủ đạo, bốn trụ nội dung, câu giới thiệu mẫu, thứ bậc thông điệp |
| `/brand/vimi-ink` | VIMI và THE INK | M1 | Thư viện nhân vật và nét mực, mức dùng theo đối tượng |
| `/guidelines` | Chuẩn thương hiệu | M2 | Danh sách bộ chuẩn |
| `/guidelines/[set]/[page]` | (trang chuẩn) | M2 | logo, color, typography, photography, layout, vimi, ink, messaging, voice, social-center... |
| `/guidelines/for/[role]` | Dành cho vai trò của bạn | M2 | Lộ trình đọc theo vai trò |
| `/guidelines/logo-picker` | Chọn đúng logo | M2 | Trình hướng dẫn chọn logo |
| `/guidelines/changelog` | Có gì mới | M2 | Lịch sử thay đổi bộ chuẩn |
| `/library` | Thư viện | M3 | Tìm kiếm và lọc tài sản |
| `/library/assets/[code]` | (chi tiết tài sản) | M3 | Xem trước, phiên bản, tải |
| `/library/bundles/[slug]` | (bộ tài liệu) | M3 | Tải lần lượt |
| `/plan` | Kế hoạch nội dung | M9 | Tháng này của trung tâm bạn; lịch và danh sách |
| `/plan/[YYYY-MM]` | (kế hoạch tháng) | M9 | Lịch và danh sách theo tháng, gồm tháng sau (xem trước) |
| `/plan/items/[id]` | (chi tiết mục) | M9 | Nội dung chính thức, nguồn, làm bài trong Xưởng, đánh dấu đã đăng |
| `/plan/report` | Tình hình thực hiện | M9 | Marketing HO và quản lý trung tâm |
| `/studio` | Công cụ | M4 | Danh mục công cụ |
| `/studio/social-post` | Làm bài mạng xã hội | M4 | T01 |
| `/studio/copywriter` | Viết nội dung | M4 | T02 |
| `/studio/email-signature` | Chữ ký email | M4 | T03 |
| `/studio/print` | Poster, standee, ấn phẩm | M4 | T05 **[NÊN CÓ]**, giai đoạn 3 |
| `/studio/kit-customizer` | Điền thông tin vào bộ tư vấn | M4 | T06 **[NÊN CÓ]**, giai đoạn 3 |
| `/studio/checker` | Kiểm tra thương hiệu | M4 | T04 |
| `/studio/history` | Lịch sử của tôi | M4 | Bài đã tạo, trạng thái duyệt |
| `/studio/review` | Bài chờ duyệt | M4 | Chỉ nhóm duyệt |
| `/learn` | Học | M6 | Lộ trình và bài kiểm tra tình huống |
| `/feedback` | Phản hồi | M7 | Báo lỗi, đề xuất mẫu, yêu cầu thiết kế |
| `/admin/*` | Quản trị | M5, M8, M9 | Người dùng, trung tâm, thương hiệu, sản phẩm, hành trình (`/admin/journey`), kế hoạch nội dung (`/admin/plan`), dữ kiện, thông điệp, quy tắc, mẫu, tài sản, báo cáo, cấu hình |

Điều hướng điện thoại (thanh dưới): Trang chủ, Hiểu về VMG (mở bản đồ hành trình), Kế hoạch, Thư viện, Công cụ; Học, Phản hồi và Tài khoản nằm ở menu hồ sơ. Điều hướng máy tính: thanh bên trái với cùng các mục và mục Quản trị cho vai trò phù hợp.

### 4.2 Trạng thái nội dung, ngày hiệu lực và cổng phát hành

Quy tắc này dùng chung cho tài sản, trang, thông điệp, dữ kiện, mẫu, quy tắc. Cài đặt tại **một nơi** (hàm cơ sở dữ liệu `is_usable(...)` và các view `v_usable_*`), mọi truy vấn dùng lại, có kiểm thử riêng.

**Trạng thái vòng đời:**

| Trạng thái | Ý nghĩa | Ai thấy |
|---|---|---|
| `draft` | Đang soạn | Người tạo, editor, admin |
| `in_review` | Đã gửi xuất bản, chờ duyệt | editor, admin, chủ chuyên môn liên quan |
| `proposed` | Đề xuất, chờ chủ chuyên môn xác nhận bằng chứng (dùng cho thông điệp, dữ kiện) | editor, admin, chủ chuyên môn |
| `effective` | Có hiệu lực | Mọi người dùng được phép |
| `withheld` | Đã duyệt nhưng chưa được dùng vì điều kiện phát hành (ghi trong `release_condition`, có thể kèm `not_before`) | editor, admin |
| `superseded` | Đã có bản mới thay thế | editor, admin (người dùng khác thấy cảnh báo nếu đã tải bản này) |
| `expired` | Hết hạn hiệu lực | editor, admin |
| `archived` | Lưu trữ | admin |

**Quy tắc "dùng được hôm nay"** (`is_usable`): trạng thái `effective` **và** `effective_from <= hôm nay` **và** (`effective_to` rỗng **hoặc** `>= hôm nay`) **và** (`not_before` rỗng **hoặc** `<= hôm nay`). Công cụ AI và trình kiểm tra chỉ được dùng nội dung thỏa quy tắc này.

**Cổng phát hành cần nạp sẵn từ hồ sơ** (lưu trong `release_gates` để sửa được, không viết cứng trong mã):

| Nội dung | Điều kiện | Nguồn |
|---|---|---|
| Dòng mô tả logo mới "NGOẠI NGỮ - DU HỌC - HƯỚNG NGHIỆP" | Dùng trên kênh số từ ngày ban hành Bộ chuẩn 1.0 (dự kiến 01/2027). Trước đó logo 2021 là bản có hiệu lực | Nền tảng 6.1; Kế hoạch 4.2 |
| Phần hình logo | Chờ kết luận tra cứu nhãn hiệu; gắn `legal_review = pending`. Bản in và đặt sản xuất số lượng lớn bị cảnh báo cho đến khi `admin` bật cờ `trademark_clear` | Nền tảng 7; Kế hoạch 4.2 |
| Thông điệp chủ đạo "Cùng bạn viết tương lai." | Kiểm chứng với khách hàng trong 12/2026, ban hành cùng Bộ chuẩn 1.0 | Kế hoạch 7.2 |
| Bản tiếng Anh của tagline và thông điệp chủ đạo | Chưa chốt (sau kiểm chứng 12/2026 và tra cứu nhãn hiệu). Công cụ **không được tự dịch** | Nền tảng 5.1 |
| Thông điệp VMG IELTS mới (CORE, THE IELTS LAB) | Chỉ phát hành sau khi chương trình được nghiệm thu (dự kiến 03/2027) | Nền tảng 5.4; Kế hoạch 3.3 |
| VMT (dịch vụ khảo thí) | Tên VMT đã được xác định và dùng trong nội bộ, kể cả Hành trình khách hàng. **Chưa có nhận diện riêng; ngày dùng tên VMT trên truyền thông bên ngoài chờ xác nhận** (cổng `vmt_public_name`, mặc định chưa mở: T01, T02 không cho dùng tên VMT trong nội dung công khai). Hồ sơ Nền tảng 4.1 còn ghi "tên chính thức chưa công bố": cần cập nhật (mục 10.3) | Hành trình khách hàng; Nền tảng 4.1 |
| Headline, nội dung chính của từng thương hiệu | Ở trạng thái `proposed` cho đến khi chủ chuyên môn xác nhận bằng chứng | Nền tảng 5.4 |
| Câu định vị thương hiệu | `visibility = internal_only`: là chuẩn nội bộ, không đưa nguyên văn lên ấn phẩm | Nền tảng 3.3 |
| Số năm hoạt động, số cơ sở, số học viên | Dữ kiện chưa xác nhận ([CẦN XÁC NHẬN]) bị khóa, không đưa vào nội dung công khai | Nền tảng 3.3; 1.2 |

**Lan truyền thay đổi (dependency):** khi phiên bản của một thông điệp, dữ kiện, logo hoặc bộ quy tắc được xuất bản, mọi tài sản, mẫu, trang đang tham chiếu nó (bảng `dependencies`) tự động chuyển cờ `needs_review = true`, thông báo cho chủ nội dung (M7) và hiện trong báo cáo sức khỏe nội dung (M8). Tài sản chỉ gỡ cờ khi chủ nội dung xác nhận đã cập nhật hoặc không bị ảnh hưởng.

### 4.3 Logo là dữ liệu có phiên bản

Mọi mẫu và công cụ tham chiếu logo bằng khóa `logo_ref`, không nhúng file:

```
logo_ref = { brand: 'vmg' | 'vmg-english' | ..., variant: 'full' | 'symbol' | 'wordmark' | 'with_tagline' | 'endorsed_lockup', bg: 'positive' | 'reversed' }
```

Khi dựng ảnh, hệ thống phân giải `logo_ref` thành file của phiên bản đang `is_usable`. Nhờ vậy khi logo đổi (dòng mô tả mới, điều chỉnh phần hình do pháp lý), mọi mẫu tự dùng bản mới sau khi xuất bản logo mới, không phải sửa từng mẫu.

Quy tắc logo kế thừa từ bộ nhận diện 2021, lưu thành quy tắc kiểm tra (mục 5.5, Phụ lục B):

- Kích thước tối thiểu 10 mm chiều rộng (bản in); bản số: tối thiểu theo cấu hình mẫu.
- Vùng trống tối thiểu bằng kích thước biểu tượng (symbol) quanh logo.
- Nền tối dùng bản reversed; nền sáng dùng bản positive.
- Logo đối tác khi đặt cạnh phải bằng hoặc nhỏ hơn chiều cao logo VMG.
- Cấm: bóp méo, đổi màu, hiệu ứng bevel, emboss, gradient, outline, đặt trên nền tương phản thấp hoặc nền ảnh quá rối.
- Không đưa chữ ENGLISH trở lại logo cấp hệ thống; logo VMG English giữ chữ ENGLISH; logo VMG TESOL giữ nền xanh, không ép đổi sang đỏ.
- Bố cục dấu bảo chứng VMG đặt cạnh logo thương hiệu thành viên: theo Bộ chuẩn 1.0 **[CẦN XÁC NHẬN: chưa có bố cục chính thức]**.

### 4.4 Ngôn ngữ thiết kế của chính Brand Lab

Brand Lab phải tuân thủ chuẩn mà nó phân phối. Dùng bộ token sau (khai báo tại một file, sửa được):

| Token | Giá trị | Ghi chú |
|---|---|---|
| `--vmg-red` | `#BE202F` | Màu chủ đạo; dùng cho hành động chính, điểm nhấn. Không tô kín diện tích lớn trong giao diện |
| `--vmg-gold` | `#8B672A` | Màu bổ trợ; dùng cho tiêu đề phụ, đường kẻ nhấn |
| `--vmg-charcoal` | `#2A2420` | Màu chữ chính |
| `--vmg-black-80`, `--vmg-black-50` | đen 80%, 50% | Chữ phụ, chú thích |
| `--surface` | `#FBF7F0` | Nền kem ấm **[đề xuất, lấy theo tông nền trong hình tham chiếu VIMI và THE INK; không phải mã chuẩn]** |
| `--surface-card` | `#FFFFFF` | Thẻ, bảng |
| Màu riêng thương hiệu thành viên | TESOL `#012A9E`; VMP `#29338D` và `#F69220`; UpLearn: tím **[CẦN XÁC NHẬN mã]**; EduNext **[CẦN XÁC NHẬN mã]** | Dùng làm thẻ nhận diện trên trang thương hiệu |

Kiểu chữ: font thương hiệu (gốc "Brown", đổi tên thành VMG Headline, Medium, Regular, Light) **chưa có file bản quyền để dùng cho ứng dụng**. Tạm dùng `Arial`, sau đó `system-ui`, sau đó `sans-serif`; tiêu đề lớn dùng chữ in hoa đậm theo bộ nhận diện. Mọi font dùng cho dựng ảnh phía máy chủ phải **hỗ trợ đầy đủ dấu tiếng Việt** và có giấy phép dùng trong ứng dụng **[CẦN XÁC NHẬN: giấy phép font Brown]**. Mã nguồn đọc tên font từ cấu hình để thay font mà không sửa mẫu.

Quy tắc áp dụng cho giao diện: căn trái mặc định; tiêu đề chữ in hoa dùng tiết chế; nội dung thân bài viết hoa kiểu câu; không bóng đổ, chữ viền, hiệu ứng 3D, phản chiếu; logo ở đầu trang bản positive trên nền sáng; chữ nội dung tối thiểu 16 px trên điện thoại; tương phản chữ tối thiểu 4,5:1.

### 4.5 Thành phần giao diện dùng chung

- **Tìm kiếm toàn cục** trên thanh đầu trang: một ô, kết quả gom theo loại (Tài liệu, Chuẩn, Thông điệp, Công cụ, Sản phẩm). Không phân biệt dấu ("du hoc" tìm ra "du học"), chịu lỗi gõ nhẹ, có từ đồng nghĩa (mục 7.5).
- **Thẻ trạng thái** nhất quán: Có hiệu lực, Sắp hết hạn (30 ngày), Cần cập nhật (`needs_review`), Đề xuất, Chưa được phát hành, Chuẩn nội bộ.
- **Chuông thông báo** và số việc cần làm.
- **Trạng thái rỗng, đang tải, lỗi** có nội dung hướng dẫn tiếng Việt rõ ràng; không để màn hình trắng.
- **Nút "Báo lỗi trang này"** cố định ở mọi trang nội dung (M7).
- Điểm ngắt giao diện: 360, 768, 1280 px. Thiết kế điện thoại trước.

---

## 5. XƯỞNG CÔNG CỤ (M4) VÀ LÕI TẠO NỘI DUNG

Đây là phần phức tạp và có rủi ro cao nhất của Brand Lab. Đọc kỹ mục 5.2 trước khi thiết kế.

### 5.1 Danh mục công cụ

| Mã | Công cụ | Việc làm được | Đầu ra | Ưu tiên | Giai đoạn |
|---|---|---|---|---|---|
| T01 | Làm bài mạng xã hội | Chọn mục đích, điền thông tin, nhận ảnh đúng chuẩn và caption | Ảnh PNG/JPG (một ảnh hoặc nhiều ảnh), caption | BẮT BUỘC | 2 |
| T02 | Viết nội dung | Viết caption, tin Zalo OA, tin nhắn tư vấn, kịch bản video ngắn, email tư vấn, bài giới thiệu giáo viên, bài sự kiện | Văn bản (3 phương án) | BẮT BUỘC | 2 |
| T03 | Chữ ký email | Điền họ tên, chức vụ, trung tâm để có chữ ký đúng chuẩn | Mã HTML và ảnh | NÊN CÓ | 2 |
| T04 | Kiểm tra thương hiệu | Dán văn bản hoặc tải bài đã có để kiểm tra theo quy tắc | Danh sách lỗi và cách sửa | NÊN CÓ | 3 |
| T05 | Poster, standee, ấn phẩm in | Dựng ấn phẩm in đúng khổ, có lề xén | PDF vector | NÊN CÓ | 3 |
| T06 | Điền thông tin vào bộ tư vấn | Thay thông tin trung tâm, lịch khai giảng vào mẫu có sẵn | PPTX hoặc PDF | NÊN CÓ | 3 |
| T07 | Ảnh nền AI | Sinh ảnh nền minh họa (không chữ, không người thật) cho T01 | Ảnh nền | NÊN CÓ | 3 |
| T08 | Hỏi Brand Lab | Hỏi đáp có dẫn nguồn trên dữ kiện đã xác nhận | Câu trả lời kèm nguồn | SAU | 4 |
| T09 | Ảnh AI toàn bộ (thử nghiệm) | Cho AI vẽ cả ảnh có chữ, theo cách trung tâm đang làm bằng công cụ AI bên ngoài | Ảnh thử nghiệm bắt buộc kiểm tra thủ công | SAU | 4 |

T07 (ảnh nền AI) không có trang riêng: là tùy chọn bên trong T01, tính vào hạn mức AI (mục 5.11).

### 5.2 Phân vai giữa AI và mã nguồn (quyết định kiến trúc quan trọng nhất)

**Vấn đề.** Mô hình sinh ảnh hiện nay hay sai dấu tiếng Việt, sai chính tả, vẽ lại logo méo, tự bịa số điện thoại hoặc ưu đãi. Một bài đăng sai logo hoặc sai thông tin liên hệ là sai thương hiệu, không sửa được bằng cách "viết prompt tốt hơn". Nếu để AI vẽ cả ảnh thành phẩm, Brand Lab không thể bảo đảm điều đã cam kết: "đã đảm bảo rule thương hiệu, thông tin chuẩn xác".

**Quyết định.** Ảnh thành phẩm được **dựng bằng mã nguồn** từ mẫu (template) có khung cố định. AI chỉ làm phần mềm dẻo.

| Thành phần | Ai làm | Người dùng sửa được? |
|---|---|---|
| Logo, dòng mô tả, tagline | Mã nguồn (từ `logo_ref`, bản đang hiệu lực) | Không |
| Tên thương hiệu và sản phẩm | Mã nguồn (từ Kho dữ liệu) | Chọn, không gõ |
| Màu, font, lưới bố cục, vùng an toàn, tỷ lệ khung | Mã nguồn (từ mẫu và token thương hiệu) | Không |
| Số điện thoại, địa chỉ, giờ mở cửa, đường dẫn | Mã nguồn (từ hồ sơ trung tâm) | Không (báo lỗi nếu sai) |
| Ngày giờ, địa điểm sự kiện, giá, % ưu đãi, điều kiện, hạn | Người dùng nhập; mã nguồn kiểm tra định dạng và chính sách | Có, trong khuôn khổ kiểm tra |
| Nét THE INK, biểu tượng, VIMI | Mã nguồn lấy từ thư viện nguồn đã duyệt (VIMI không bị AI vẽ lại) | Chọn tư thế được phép |
| Headline | AI gợi ý từ ngân hàng thông điệp, người dùng chọn hoặc sửa | Có |
| Caption, nội dung văn bản | AI viết trong khuôn quy tắc và dữ kiện đã xác nhận | Có, sau đó kiểm tra lại |
| Ảnh nền minh họa (không chữ, không logo, không người thật) | AI (T07), giai đoạn 3 | Chọn, tạo lại |
| Ảnh người thật (học viên, giáo viên, hoạt động) | Người dùng tải lên hoặc chọn từ thư viện ảnh có quyền sử dụng | Có |

**Quy tắc cứng cho ảnh AI:**

1. Ảnh do AI sinh **không được chứa chữ, logo, số điện thoại** (mã nguồn chèn lên sau).
2. Ảnh do AI sinh **không được thể hiện người như thể là học viên, giáo viên hoặc cựu học viên có thật.** Các loại bài "câu chuyện học viên", "kết quả", "giới thiệu giáo viên" bị **khóa ảnh AI** và yêu cầu ảnh thật (hồ sơ nhấn mạnh "dấu ấn thật", "học viên thật").
3. VIMI chỉ dùng tư thế trong bộ quy chuẩn nhân vật đã duyệt. Cho đến khi bộ quy chuẩn được hoàn thiện (kế hoạch 11-12/2026), cờ `vimi_enabled = false`.
4. Mọi ảnh AI lưu cùng lời nhắc, tên mô hình, thời điểm, người tạo (truy vết nguồn gốc).
5. Có ghi chú "ảnh minh họa" hay không khi đăng là chính sách của công ty **[CẦN XÁC NHẬN]**; hệ thống hỗ trợ cờ `ai_disclosure` trên bài.

**Ghi nhận về khác biệt với quy trình hiện tại.** Hướng dẫn trung tâm đang chốt cách tạo ảnh thành phẩm có sẵn chữ và logo ngay trong lời nhắc bằng công cụ AI bên ngoài. Brand Lab mặc định dùng cách dựng bằng mã nguồn để bảo đảm chính xác. Cách cũ giữ lại ở T09 (giai đoạn 4, thử nghiệm) cho người muốn ảnh sáng tạo tự do, với điều kiện bắt buộc kiểm tra thủ công chữ và logo trước khi gửi duyệt. **[CẦN XÁC NHẬN với chủ sản phẩm: chấp nhận thay quy trình mặc định.]**

### 5.3 Luồng xử lý chung của một công cụ

```
1. Chọn công cụ và loại nội dung (post_type)
2. Điền biểu mẫu động (schema theo post_type; xác thực bằng zod ở cả giao diện và máy chủ)
3. Máy chủ dựng ngữ cảnh (Context Builder): chọn quy tắc, dữ kiện, thông điệp đang dùng được
4. Gọi AI (nếu cần) qua Cổng AI, nhận kết quả có cấu trúc (JSON theo schema)
5. Kiểm tra bằng Trình kiểm tra (mục 5.5)
6. Nếu có lỗi mức "chặn": tự sinh lại tối đa 2 lần kèm lỗi làm ràng buộc; nếu vẫn lỗi, trả lỗi rõ ràng cho người dùng
7. Dựng ảnh từ mẫu (nếu là công cụ ảnh) bằng bộ dựng xác định (mục 5.6)
8. Xem trước; người dùng sửa phần được phép sửa; mỗi lần sửa chạy lại bước 5 và 7
9. Xuất file; ghi bản ghi `generations`
10. Gửi duyệt (mục 5.10) nếu loại nội dung bắt buộc duyệt
```

Mọi bước 3 đến 9 chạy phía máy chủ. Khóa API không bao giờ xuống trình duyệt.

**Dựng ngữ cảnh (Context Builder)** lắp lời nhắc theo lớp, mỗi lớp có giới hạn độ dài và nguồn từ cơ sở dữ liệu:

| Lớp | Nội dung | Nguồn |
|---|---|---|
| L0 | Vai trò, giới hạn an toàn, định dạng đầu ra, nguyên tắc "chỉ dùng dữ kiện được cấp" | `prompt_templates` (có phiên bản) |
| L1 | Bộ quy tắc nội dung toàn hệ thống | `rule_sets` (kind = content_rules) đang hiệu lực |
| L2 | Giọng nói của thương hiệu được chọn (nhân cách, nên, tránh) | `brands.voice_profile` |
| L3 | Dữ kiện được phép dùng của sản phẩm (chỉ `verified`, `is_usable`, `public_ok`), kèm mã dữ kiện | `product_facts` |
| L4 | Thông điệp đang dùng được: tagline, thông điệp chủ đạo, headline, trụ nội dung, quy tắc thứ bậc | `messages`, `pillars` |
| L5 | Tác vụ: loại bài, mục đích, trụ nội dung, các trường người dùng nhập (đưa vào dưới dạng dữ liệu có dấu phân cách, không phải chỉ thị) | Đầu vào |
| L6 | Schema đầu ra bắt buộc | Mã nguồn |

Bắt buộc: AI trả về `used_fact_ids` (các dữ kiện đã dựa vào). Trình kiểm tra đối chiếu mọi con số, tỷ lệ, cam kết trong văn bản với dữ kiện đã cấp và dữ liệu người dùng nhập; thứ gì không có nguồn bị gắn lỗi.

**Phòng chống chèn chỉ thị (prompt injection):** trường người dùng nhập luôn nằm trong khối dữ liệu có dấu phân cách; lời nhắc nêu rõ không làm theo chỉ thị trong khối đó; kết quả vẫn qua Trình kiểm tra nên chỉ thị độc hại không vượt được quy tắc cứng.

### 5.4 Cổng AI (AI Gateway)

Một mô-đun duy nhất (`lib/ai`) bao mọi lời gọi tới nhà cung cấp AI.

- **Trừu tượng hóa nhà cung cấp:** hai giao diện `TextProvider` và `ImageProvider`. Mỗi nhà cung cấp là một bộ chuyển đổi (adapter). Thêm hoặc đổi nhà cung cấp không sửa mã công cụ.
- **Không hardcode tên mô hình.** Bảng `ai_models` (mục đích, nhà cung cấp, mã mô hình, tham số, thứ tự dự phòng, bật/tắt) quyết định mô hình nào dùng cho mục đích nào (`copy_generate`, `copy_check`, `headline_suggest`, `image_background`, `qa_answer`). Quản trị đổi được trên giao diện khi nhà cung cấp ngừng một mô hình cũ.
- **Khuyến nghị ban đầu:** văn bản dùng API của Claude (Anthropic) với đầu ra có cấu trúc; ảnh nền dùng một mô hình sinh ảnh qua adapter **[CẦN XÁC NHẬN: chọn nhà cung cấp ảnh và chính sách ghi nhãn]**.
- **Độ bền:** thời gian chờ (văn bản 30 giây, ảnh 90 giây), thử lại có lùi dần, chuyển sang mô hình dự phòng, trả lỗi thân thiện bằng tiếng Việt khi hết cách.
- **Sinh ảnh bất đồng bộ:** tạo bản ghi tác vụ, giao diện hỏi trạng thái; không giữ kết nối dài.
- **Hạn mức và chi phí (mục 5.11).**
- **Nhật ký:** mỗi lời gọi ghi mục đích, mã mô hình, số token vào và ra, chi phí ước tính, thời gian, kết quả. Không ghi dữ liệu cá nhân thừa.
- **Khóa API:** chỉ có ở biến môi trường phía máy chủ. Có công tắc ngắt khẩn cấp (kill switch) trong quản trị để tắt toàn bộ AI.

### 5.5 Trình kiểm tra thương hiệu (Brand Checker)

Là lõi bảo đảm chất lượng. Chạy trên mọi nội dung công cụ tạo ra, cũng là công cụ độc lập T04.

**Cấu trúc.** Bảng `checker_rules` lưu từng quy tắc; mỗi quy tắc có:

- `code`, `scope` (`text`, `visual`, `promo`, `all`), `applies_to` (`public`, `internal`)
- `severity`: `block` (chặn, không cho xuất), `warn` (cảnh báo, phải bấm xác nhận đã hiểu), `info` (gợi ý)
- `kind`: `term_list` (danh sách từ, cụm từ), `regex`, `fn` (hàm mã nguồn có tên, ví dụ kiểm tra số liệu so với dữ kiện), `llm` (nhờ mô hình đánh giá, dùng tiết kiệm)
- `params` (JSON), `message_vi`, `fix_hint_vi`, `enabled`, phiên bản

**Thứ tự chạy:** quy tắc tất định (term_list, regex, fn) trước; chỉ chạy `llm` khi cần và đã bật. Quy tắc tất định phải đủ để chặn các lỗi nghiêm trọng, không phụ thuộc mô hình.

**Đầu ra chuẩn:**

```json
{
  "passed": false,
  "summary": { "block": 1, "warn": 2, "info": 0 },
  "findings": [
    {
      "rule": "TERM_BANNED_THI_DIEM",
      "severity": "block",
      "message": "Không dùng từ 'thí điểm' trong nội dung gửi khách hàng.",
      "fix_hint": "Bỏ từ này hoặc thay bằng cách diễn đạt trung tính.",
      "span": { "field": "caption", "start": 120, "end": 128 },
      "rule_version": 3
    }
  ],
  "checked_at": "2026-10-14T10:00:00+07:00",
  "ruleset_versions": { "content_rules": 4, "checker": 12 }
}
```

**Yêu cầu giao diện:** hiển thị lỗi gắn đúng vị trí trong văn bản, nút "sửa giúp" cho lỗi có thể sửa tự động (thay từ), người dùng phải xử lý hết lỗi `block` mới xuất được; lỗi `warn` phải xác nhận.

**Bộ quy tắc khởi tạo** ở Phụ lục B. Chủ sản phẩm thêm bớt quy tắc qua quản trị mà không cần lập trình viên.

**Kiểm thử bắt buộc:** mỗi quy tắc đi kèm tối thiểu 3 câu đúng và 3 câu sai trong bộ kiểm thử tự động (golden tests). Thay đổi quy tắc phải qua kiểm thử mới xuất bản được.

### 5.6 Hệ mẫu và bộ dựng ảnh

**Nguyên tắc.** Một mẫu là một khung thiết kế có các **khe (slot)** cố định. Mẫu **không** nhân bản theo từng thương hiệu: một mẫu dùng bộ token màu và logo của thương hiệu được chọn (màu riêng thương hiệu thành viên giữ theo logo hiện hữu).

**Nguồn tệp khi dựng.** Bộ dựng ảnh chỉ đọc logo, VIMI, THE INK, hoa văn, mẫu SVG, font và ảnh thư viện từ bản làm việc `render_cache` (mục 6.4.1), không gọi Drive lúc dựng. Tệp gốc nằm trên Drive; khi tài sản liên quan được xuất bản hoặc phát hiện đổi bản sửa, hệ thống làm mới `render_cache` rồi mới dùng. Dựng ảnh phải từ chối (mã lỗi `ASSET_NOT_CACHED`) nếu tệp cần thiết chưa có bản làm việc hợp lệ, thay vì dùng tạm một bản khác.

**Hợp đồng với nhà thiết kế.** Mẫu do thiết kế viên tạo trong công cụ vector (Figma hoặc Illustrator), xuất SVG với quy ước đặt tên lớp:

| Tên lớp (id) | Loại khe | Ý nghĩa |
|---|---|---|
| `slot:headline` | text | Tiêu đề; thuộc tính `data-max-lines`, `data-min-size`, `data-max-size`, `data-align` |
| `slot:subhead` | text | Dòng phụ |
| `slot:body` | text | Nội dung ngắn |
| `slot:offer` | text/badge | Ưu đãi (có kiểm tra chính sách) |
| `slot:info` | text block | Thời gian, địa điểm (nhiều dòng có nhãn) |
| `slot:cta` | text | Lời kêu gọi (chọn từ thư viện CTA) |
| `slot:photo` | image | Ảnh chính; `data-fit="cover"`, `data-focus` |
| `slot:logo` | logo | Có `data-logo-ref` (brand, variant, bg) hoặc `auto` theo thương hiệu |
| `slot:contact` | text block | Hotline, địa chỉ từ hồ sơ trung tâm (khóa) |
| `slot:vimi` | vimi | Chọn tư thế được phép; tùy chọn |
| `slot:ink` | ink | Nét THE INK cố định theo mẫu |
| `zone:safe`, `zone:protected` | vùng | Vùng an toàn; vùng cấm che (logo, mặt người, thông tin khóa học, CTA) |

Trình nhập mẫu đọc SVG và sinh `spec` JSON (lưu ở `templates.spec`). Giai đoạn 2 cho phép viết `spec` bằng tay để bắt đầu sớm; trình nhập SVG làm ở giai đoạn 3 **[NÊN CÓ]**.

**Cấu trúc `spec` (rút gọn):**

```json
{
  "code": "POST_ENROLL_4x5_V1",
  "format": "post_4x5",
  "size": { "w": 1080, "h": 1350 },
  "post_types": ["enrollment", "event"],
  "audience": ["kids", "parents", "teens", "adults"],
  "brand_scope": ["*"],
  "allow_vimi": true,
  "slots": [
    { "id": "headline", "type": "text", "required": true, "max_chars": 60, "max_lines": 3, "font_size": { "min": 44, "max": 96 }, "style": "headline" },
    { "id": "photo", "type": "image", "required": false, "fit": "cover" },
    { "id": "logo", "type": "logo", "logo_ref": "auto", "locked": true },
    { "id": "contact", "type": "contact", "locked": true }
  ],
  "constraints": { "text_contrast_min": 4.5, "min_logo_width_px": 160, "ink_main_max": 1 },
  "locked": ["logo", "contact", "footer"]
}
```

**Yêu cầu bộ dựng ảnh:**

- **Xác định:** cùng đầu vào cho cùng ảnh. Dựng phía máy chủ dùng cùng thành phần với bản xem trước ở trình duyệt, để "xem gì ra nấy". Gợi ý: dựng bằng SVG (React → SVG) và rasterize bằng thư viện phía máy chủ (ví dụ Satori kèm resvg, hoặc phương án tương đương mà Claude Code đánh giá phù hợp). Chấp nhận phương án khác nếu giữ được tính xác định và hỗ trợ đủ font tiếng Việt.
- **Vừa chữ (text fitting):** đo chữ bằng số liệu font thật; thu nhỏ dần từ cỡ tối đa xuống cỡ tối thiểu; ngắt dòng theo từ tiếng Việt, tránh để dòng cuối chỉ một từ ngắn; nếu đến cỡ tối thiểu vẫn tràn thì trả lỗi `TEXT_OVERFLOW` kèm gợi ý rút gọn (có thể nhờ AI rút gọn nhưng không đổi dữ kiện).
- **Tương phản:** chữ trên ảnh nền tự thêm lớp phủ tối theo độ sáng vùng chữ để đạt tối thiểu 4,5:1; nếu không đạt, báo lỗi.
- **Vùng cấm che:** nét THE INK, VIMI, ảnh không được đè lên `zone:protected`. Kiểm tra khi xuất bản mẫu (lint mẫu), không phải mỗi lần người dùng tạo.
- **Quy tắc THE INK (từ hồ sơ 6.4):** mỗi bố cục một nét chính, nét phụ chỉ để nhấn; màu nét là đỏ VMG và vàng đồng; giữ khoảng trống quanh logo, khuôn mặt, thông tin khóa học, lời kêu gọi; không che hay biến đổi logo; chữ viết tay chỉ ở điểm nhấn.
- **Khổ xuất mặc định (cấu hình được):** `post_4x5` 1080x1350 (bài một ảnh); `post_1x1` 1080x1080 (ảnh đầu của bài nhiều ảnh, là ảnh thiết kế đồ họa); `story_9x16` 1080x1920 (vùng an toàn: chừa mặc định 250 px trên, 340 px dưới); `cover_16x9` 1920x1080.
- **Ảnh đầu vào:** giới hạn dung lượng và cạnh tối đa; xóa dữ liệu vị trí (EXIF GPS); chuyển về sRGB; cảnh báo nếu cạnh ngắn dưới 1080 px; không phóng quá 150%.
- **Định dạng đầu ra:** PNG (mặc định, giữ nét chữ) và JPG (chất lượng 90); bài nhiều ảnh xuất thêm tệp ZIP đánh số thứ tự.
- **Bộ kiểm thử hình:** ảnh chuẩn (snapshot) cho từng mẫu với chuỗi thử có dấu chồng nhiều tầng (ví dụ "Nguyễn Thị Quỳnh", "TIẾNG ANH ĐỂ CẤT TIẾNG RIÊNG", "Ước mơ lớn - Bước đi nhỏ") và chuỗi rất dài, để bắt lỗi vỡ dấu và tràn chữ.

### 5.7 T01 - Làm bài mạng xã hội

Công cụ quan trọng nhất của khối Trung tâm vì nội dung đăng hằng ngày là việc chính. Bài ưu đãi và tuyển sinh là việc chính của trung tâm, hệ thống không được coi đó là "sai tinh thần thương hiệu".

**Bước 1. Chọn mục đích bài (post_type).** Thẻ lớn dễ chạm. Danh sách khởi tạo (chi tiết trường ở Phụ lục C):

`enrollment` (khai giảng, tuyển sinh), `promotion` (ưu đãi), `event` (sự kiện), `student_story` (câu chuyện học viên), `teacher_spotlight` (giới thiệu giáo viên), `learning_tip` (kiến thức, mẹo học), `notice` (thông báo, lịch), `monthly_theme` (chủ đề tháng của Marketing), `ecosystem` (giới thiệu hệ sinh thái và chặng học tiếp theo).

**Bước 2. Chọn thương hiệu và sản phẩm.** Chỉ hiện thương hiệu và sản phẩm trung tâm đang cung cấp (hồ sơ trung tâm). Chọn xong, hệ thống nạp dữ kiện đã xác nhận của sản phẩm. Nếu sản phẩm chưa có dữ kiện nào ở trạng thái `verified`, công cụ vẫn cho làm bài dạng thông báo thuần (ngày giờ, địa điểm do người dùng nhập) nhưng khóa mọi câu nói về lợi ích, kết quả, cam kết, và hiển thị lý do.

**Bước 3. Điền thông tin.** Biểu mẫu động theo `post_type`. Nguyên tắc: ít trường nhất có thể; trường nào lấy được từ hồ sơ thì tự điền và khóa.

| Trường | Cách nhập |
|---|---|
| Tiêu đề | Gõ, hoặc "Gợi ý giúp tôi" cho 5 phương án lấy từ ngân hàng thông điệp và dữ kiện |
| Ngày giờ, địa điểm | Bộ chọn ngày giờ; địa điểm mặc định là trung tâm, đổi được sang "tại trường đối tác" hoặc địa điểm khác (nhập tay) |
| Ưu đãi | Loại (giảm %, tặng quà, miễn phí...), giá trị, điều kiện, hạn áp dụng. Bắt buộc có hạn và điều kiện |
| Lời kêu gọi | Chọn từ thư viện CTA của thương hiệu (Phụ lục D) |
| Liên hệ | Tự điền từ hồ sơ trung tâm, khóa |
| Ảnh | Tải từ điện thoại hoặc chọn từ thư viện ảnh VMG; ảnh có người thì bắt buộc tích xác nhận đã có đồng ý sử dụng hình ảnh (với học viên nhỏ tuổi là của phụ huynh) |
| Đối tượng đọc | Phụ huynh, học viên, người đi làm, giáo viên (ảnh hưởng giọng nói và mẫu) |

**Bước 4. Chọn kiểu hình.** Thư viện mẫu lọc sẵn theo thương hiệu, đối tượng, loại bài, khổ ảnh; mẫu gợi ý đầu tiên được chọn sẵn. Tùy chọn VIMI chỉ hiện khi thương hiệu cho phép (mục 6.1, mức dùng VIMI) và `vimi_enabled`.

**Bước 5. Tạo.** Máy chủ trả: tối đa 3 phương án caption (khác nhau về góc tiếp cận) và ảnh đã dựng. Xem trước trong khung giả lập bài đăng. Người dùng sửa chữ trực tiếp ở các khe được phép; mỗi lần sửa dựng lại ảnh và chạy lại kiểm tra.

**Bước 6. Kiểm tra tự động.** Bảng kiểm hiển thị kết quả (mục 5.5) và các mục tự động như: logo đúng bản, thông tin liên hệ khớp hồ sơ, chữ đạt độ tương phản, ưu đãi có hạn và điều kiện, đúng chính sách phê duyệt ưu đãi (mục 5.11 và Phụ lục B).

**Bước 7. Xuất và gửi duyệt.**

- Tải ảnh, sao chép caption.
- Mọi bài đăng của trung tâm **bắt buộc gửi nhóm duyệt của HO trước khi đăng**. Nút chính là "Gửi duyệt". Trước khi được duyệt, bài mang nhãn "Chưa được duyệt, chưa đăng".
- Nút phụ "Sao chép gói gửi duyệt" cho trường hợp nhóm duyệt đang làm việc trên kênh chat có sẵn: sinh một khối văn bản gồm liên kết xem ảnh, caption, kết quả kiểm tra, người gửi, trung tâm. **[CẦN XÁC NHẬN: nhóm duyệt hiện dùng kênh nào (Zalo, nhóm chat khác), để quyết định tích hợp thông báo.]**

**Bài nhiều ảnh:** ảnh đầu là ảnh thiết kế đồ họa (thường 1:1) theo mẫu; các ảnh sau là ảnh thật hoặc ảnh nội dung theo mẫu "slide". Giai đoạn 2 hỗ trợ tối đa 5 ảnh.

**Điểm vào từ kế hoạch nội dung (từ giai đoạn 2).** Nút "Làm bài trong Xưởng" ở một mục kế hoạch (mục 6.8) mở T01 hoặc T02 với loại bài, thương hiệu, sản phẩm, mẫu, thông điệp, ưu đãi và caption chủ đã điền sẵn và **khóa** theo `do_not_change`; người dùng chỉ điền phần địa phương (thông tin trung tâm tự điền, chọn ảnh thật, chữ trong khe được phép). Bản ghi `generations` lưu `plan_item_id`. Bài này được hiển thị cạnh mục kế hoạch với trạng thái duyệt.

**Tiêu chí hoàn thành T01** (kiểm bằng kịch bản kiểm thử đầu cuối):

- Người dùng mới, không hướng dẫn, ra được bài khai giảng hoàn chỉnh trong dưới 3 phút trên điện thoại cỡ 360 px.
- Ảnh luôn có logo đúng bản, thông tin liên hệ đúng hồ sơ trung tâm, không thể sửa các khe khóa.
- Nhập "giảm 40%" thì hệ thống cho biết cấp phê duyệt ưu đãi cần thiết và chặn gửi duyệt nếu thiếu thông tin điều kiện.
- Nhập tên "Nguyễn Thị Quỳnh" dài, tiêu đề dài 80 ký tự: không vỡ dấu, không tràn khung; quá dài thì báo lỗi rõ.
- Loại bài `student_story` và `teacher_spotlight` không cho dùng ảnh AI.

### 5.8 T02 - Viết nội dung

**Định dạng đầu ra (cấu hình trong `content_formats`):**

| Mã | Định dạng | Ràng buộc mặc định (sửa được) |
|---|---|---|
| `fb_caption` | Caption bài Facebook | Ngắn 60-120 từ hoặc vừa 150-250 từ; số hashtag tối đa 5 |
| `zalo_oa_message` | Tin Zalo OA | Tối đa 500 ký tự, không hashtag |
| `video_script` | Kịch bản video ngắn | 30-45 giây; có gợi ý hình |
| `consult_message` | Tin nhắn tư vấn một-một | Ngắn, hỏi trước khi đề xuất (theo giá trị Thấu hiểu) |
| `consult_email` | Email tư vấn | Có chủ đề thư |
| `event_announcement` | Thông báo sự kiện | Đủ thời gian, địa điểm, cách đăng ký |
| `teacher_intro` | Giới thiệu giáo viên | Chỉ dùng thông tin người dùng nhập và đã được xác nhận |
| `student_story_text` | Câu chuyện học viên | Chỉ chạy khi người dùng nhập câu chuyện thật và tích xác nhận đồng ý |

**Đầu vào:** định dạng, thương hiệu, sản phẩm, mục đích, trụ nội dung (một trong bốn trụ: Học có chiều sâu; Kiến thức có nơi ứng dụng; Lựa chọn có cơ sở; Cơ hội học có người đồng hành), đối tượng đọc, các trường dữ kiện người dùng nhập, tùy chọn "Gợi ý liên kết hệ sinh thái" (mặc định bật cho bài thương hiệu).

**Liên kết hệ sinh thái.** Ban Giám Đốc muốn truyền thông thể hiện hệ sinh thái, đầu ra người học và chặng học tiếp theo, không chỉ từng sản phẩm đơn lẻ. Khi bật, công cụ dùng các đường nối `journey_edges` (ô này dẫn tới ô nào trên Hành trình khách hàng, mục 6.1.1) để thêm một câu nối hợp lý, với điều kiện ô tiếp theo có `brand_confirmed = true` và đã có dữ kiện `verified`. Không tự suy ra chặng tiếp theo ngoài các đường nối đã nạp. **[CẦN XÁC NHẬN, Q12 và Q23.]** **Chỉ dùng đường nối `proposed = false`.** Đường nối đề xuất (nét đứt) và ô `decision_pending` không được dùng để sinh câu nối trong nội dung.

**Đầu ra:** JSON có cấu trúc `{ variants: [{ angle, text, hashtags[] }], headline_options[], used_fact_ids[], used_message_ids[] }`. Ba phương án khác nhau về góc tiếp cận: (a) lợi ích và đầu ra; (b) tình huống, câu chuyện; (c) ngắn gọn, đi thẳng. Người dùng chọn một, sửa, chạy lại kiểm tra.

**Quy tắc thứ bậc thông điệp (từ hồ sơ 5.5):** một nội dung chỉ có một tagline; không đặt hai câu khẩu hiệu dài hạn cạnh nhau; tagline "Dẫn Lối Tương Lai" đặt ở vị trí nhận diện hoặc câu kết (cấu hình theo `post_type`); thông điệp chủ đạo "Cùng bạn viết tương lai." dùng làm câu dẫn hoặc tiêu đề của nội dung cấp hệ thống, không dùng cho nội dung bán một sản phẩm cụ thể.

**Tiêu chí hoàn thành T02:**

- Mọi con số và cam kết trong văn bản truy được về một dữ kiện `verified` hoặc trường người dùng nhập; ngược lại bị chặn.
- Không có từ cấm, không có ®, không có cam kết tuyệt đối (Phụ lục B).
- Thương hiệu có giọng nói khác nhau cho ra sắc thái khác nhau (kiểm thử với VMG English và VMG TESOL: giọng vui khích lệ so với giọng chuyên nghiệp).

### 5.9 Các công cụ còn lại (tóm tắt đủ để thiết kế chỗ cắm)

**T03 Chữ ký email [NÊN CÓ, giai đoạn 2].** Trường: họ tên, chức vụ, trung tâm hoặc phòng ban, điện thoại, email. Bố cục khóa theo bộ nhận diện 2021: Tên, Chức vụ, Email, Địa chỉ, Điện thoại, Website, mạng xã hội. Xuất mã HTML tương thích Gmail và Outlook (dùng bảng, ảnh logo hosted, có chữ thay thế) kèm ảnh xem trước. Thông tin công ty lấy từ hồ sơ, người dùng không sửa.

**T04 Kiểm tra thương hiệu [NÊN CÓ, giai đoạn 3].** Dán văn bản, chọn thương hiệu, chọn công khai hoặc nội bộ; trả danh sách lỗi theo mục 5.5. Có nút "viết lại giúp tôi để đạt chuẩn" (AI sửa đúng các lỗi, không thêm dữ kiện). Chế độ ảnh (tải ảnh lên, kiểm tra bằng thị giác máy) là **[SAU]**.

**T05 Poster, standee, ấn phẩm in [NÊN CÓ, giai đoạn 3].** Khổ lấy từ bộ nhận diện (A4, A5, A3, A2 nội quy, pull-up 800x2000 mm...) cấu hình được. Xuất PDF vector, nhúng font, lề xén 3 mm kèm dấu cắt. Màu xuất RGB kèm cảnh báo "nhà in chuyển CMYK, kiểm tra bản proof trước khi in hàng loạt". Khi cờ `trademark_clear` chưa bật, nút xuất bản in số lượng lớn hiện cảnh báo bắt buộc xác nhận (mục 4.2).

**T06 Điền thông tin vào bộ tư vấn [NÊN CÓ, giai đoạn 3].** Tài sản có khai báo `editable_parts` (khe thay thế) cho phép điền thông tin trung tâm, lịch khai giảng, ưu đãi đã được duyệt. PPTX dùng khe dạng `{{center.name}}`, PDF dùng trường biểu mẫu. Chỉ các khe khai báo mới sửa được; phần còn lại khóa. Kết quả chạy qua Trình kiểm tra.

**T07 Ảnh nền AI [NÊN CÓ, giai đoạn 3].** Chọn phong cách từ danh sách tinh gọn (theo ngôn ngữ thiết kế VMG), chủ đề, tông màu; hệ thống tự thêm các ràng buộc cứng (không chữ, không logo, không người như thật) vào lời nhắc và kiểm tra đầu ra. Bộ quy tắc "VMG Design Language Rules" hiện có là đầu vào của lớp lời nhắc ảnh. Nguyên tắc từ dự án hướng dẫn trung tâm: không quy định cứng nhắc quá mức, chỉ cần một ngôn ngữ thiết kế chung để mỗi người không tạo ra kết quả khác biệt.

**T08 Hỏi Brand Lab [SAU, giai đoạn 4].** Hỏi đáp trên nội dung đã xác nhận (trang Brand Hub, chuẩn, dữ kiện, thông điệp) bằng truy hồi (RAG), luôn dẫn nguồn; khi không có nguồn `verified` thì trả lời "chưa có thông tin đã xác nhận" và chỉ tới chủ chuyên môn. Không trả lời về giá, học phí, lịch cụ thể nếu không có dữ kiện.

**T09 Ảnh AI toàn bộ [SAU, thử nghiệm].** Như mô tả ở mục 5.2.

### 5.10 Quy trình duyệt bài

Bảng `submissions` theo dõi: `pending` (chờ duyệt) → `approved` / `changes_requested` / `rejected`.

- Người gửi chọn người duyệt hoặc để hệ thống gán cho nhóm duyệt (mọi người có `is_approver`).
- Màn hình duyệt (`/studio/review`): ảnh và caption cạnh nhau, bảng kiểm tự động, cờ "ảnh có người đã xác nhận đồng ý", cờ ưu đãi và cấp phê duyệt cần có; nút Duyệt, Yêu cầu sửa (bắt buộc ghi lý do), Từ chối.
- Thông báo cho người gửi khi có kết quả; nhắc người duyệt nếu quá thời hạn xử lý (cấu hình, mặc định 4 giờ làm việc).
- Bài đã duyệt hiện "Đã duyệt, có thể đăng" kèm gói đăng bài (ảnh, caption, thời gian duyệt, người duyệt).
- Nếu sau khi duyệt, người gửi sửa nội dung thì trạng thái quay về `pending`.
- Bài dựng từ mục kế hoạch mà không sửa phần khóa có thể duyệt nhanh hoặc tự động theo cấu hình (mục 6.8, Q21). Mọi bài khác vẫn bắt buộc gửi duyệt.
- Duyệt ưu đãi: nếu mức ưu đãi vượt quyền của người duyệt theo ma trận phê duyệt khuyến mại (mục 5.11) thì công cụ báo "cần cấp phê duyệt cao hơn" và không cho duyệt tại đây; nhóm duyệt chỉ xác nhận phần thương hiệu, phần thẩm quyền ưu đãi nằm ngoài Brand Lab.

### 5.11 Chính sách ưu đãi, hạn mức và chi phí AI

**Ma trận phê duyệt khuyến mại.** Cấu hình trong bảng `promo_policy` (quản trị sửa được, có ngày hiệu lực). Giá trị khởi tạo lấy từ ma trận nội bộ đang áp dụng: ưu đãi đến 10% do Giám đốc trung tâm phê duyệt; trên 10% đến 20% do Giám đốc khu vực; trên 20% đến 30% do Tổng Giám đốc; trên 30% do Ban Giám Đốc. **[CẦN XÁC NHẬN: đối chiếu lại ma trận hiện hành trước khi dùng.]** Công cụ dùng bảng này để (1) hiển thị cấp phê duyệt cần có khi người dùng nhập ưu đãi, (2) bắt người dùng xác nhận đã có phê duyệt, (3) ghi vào hồ sơ bài. Brand Lab **không thay thế** quy trình phê duyệt khuyến mại, chỉ nhắc và ghi nhận.

**Hạn mức mặc định (sửa được trong quản trị):**

| Phạm vi | Hạn mức khởi tạo |
|---|---|
| Mỗi người dùng, mỗi ngày | 30 lượt sinh văn bản; 5 lượt sinh ảnh nền AI |
| Mỗi trung tâm, mỗi tháng | Theo chi phí ước tính, **[CẦN XÁC NHẬN con số]** |
| Toàn hệ thống, mỗi tháng | Ngưỡng chi phí tối đa, **[CẦN XÁC NHẬN con số]**; chạm 80% thì cảnh báo quản trị, chạm 100% thì dừng gọi AI (công cụ dựng ảnh từ mẫu và thư viện vẫn chạy) |

Người dùng thấy số lượt còn lại. Hết hạn mức thì công cụ vẫn mở được phần không dùng AI. Báo cáo chi phí AI theo tháng, theo trung tâm, theo công cụ nằm ở M8. Chi phí ước tính mỗi lượt do hệ thống ghi nhận từ số token và đơn giá cấu hình, **không ghi cứng đơn giá của nhà cung cấp trong mã nguồn**.

---

## 6. CÁC MODULE NỀN

### 6.1 M1 - Brand Hub (hiểu và cảm thụ thương hiệu)

**Mục đích.** Người VMG vào đọc xong thì hiểu VMG là gì, từng thương hiệu thành viên là gì, nói thế nào cho đúng, và **cảm được** tinh thần thương hiệu chứ không chỉ thuộc câu chữ.

**Điểm vào theo hành trình.** Phần kiến thức **sản phẩm** của M1 được trình bày theo Hành trình khách hàng (mục 6.1.1); phần kiến thức **thương hiệu** theo các trang nền tảng và kiến trúc thương hiệu dưới đây.

**Nguồn nội dung.** Nạp từ hồ sơ Nền tảng (các mục 3 đến 6). Mỗi mục là một trang gồm các khối (block) có kiểu. Nội dung nằm trong `page_versions.blocks` (JSON), sửa qua quản trị, tuân theo trạng thái ở mục 4.2.

**Các trang nền tảng** (`/brand/foundation/[key]`): `idea` (ý tưởng thương hiệu), `purpose_vision_mission`, `positioning` (đặt nhãn "Chuẩn nội bộ, không đưa nguyên văn lên ấn phẩm"), `promise` (lời hứa ba vế kèm "bằng chứng người học thấy được"), `values` (năm giá trị cùng hành vi của đội ngũ), `personality` (nhân cách và giọng nói), `story` (câu chuyện thương hiệu), `csr` (trách nhiệm xã hội và ba nguyên tắc).

**Lớp "cảm thụ"** (khác với đọc văn bản thuần):

| Tính năng | Mô tả | Ưu tiên |
|---|---|---|
| Chế độ đọc câu chuyện | Trang `story` dạng cuộn từng đoạn, có hình VIMI và nét THE INK minh họa, thời gian đọc ước tính, nút "Đã đọc" | BẮT BUỘC |
| Cùng một nhân cách, bảy sắc thái | Bộ chuyển thương hiệu: chọn một thương hiệu thì hiện sắc thái giao tiếp, ví dụ câu "nên" và "tránh" tương ứng (từ mục 3.6 hồ sơ) | BẮT BUỘC |
| Nên và Tránh | Cặp câu so sánh theo bốn đặc tính: có chuyên môn, gần gũi, khích lệ tiến bộ, có trách nhiệm | BẮT BUỘC |
| Kiến trúc thương hiệu tương tác | Sơ đồ **sinh từ dữ liệu** (không phải ảnh tĩnh): bấm vào nút thương hiệu để mở vai trò, quy tắc thể hiện, logo, sản phẩm, bộ tài liệu | BẮT BUỘC |
| Giá trị thành hành vi | Năm thẻ giá trị, lật thẻ thấy "hành vi của đội ngũ" và một tình huống ví dụ | NÊN CÓ |
| Lời hứa và bằng chứng | Ba vế của lời hứa, mỗi vế kèm dạng bằng chứng người học thấy; ghi rõ vế nào đã có bằng chứng, vế nào chờ | NÊN CÓ |
| Cách giới thiệu VMG | Bốn câu giới thiệu mẫu (một câu, ngắn, sự kiện hệ thống, EduNext với đối tác trường) kèm nút sao chép và ghi chú dùng khi nào | BẮT BUỘC |
| Thư viện VIMI | Tám biểu cảm tham chiếu (Vui vẻ, Tinh nghịch, Khám phá, Tập trung, Cổ vũ, Suy nghĩ, Nhiệt huyết, Thân thiện); bảng mức dùng theo đối tượng. Khi bộ quy chuẩn nhân vật chưa xuất bản thì hiện nhãn "Hình tham chiếu hướng sáng tạo, chưa phải quy chuẩn chính thức" | NÊN CÓ |
| Thư viện THE INK | Bốn nhóm nét (dẫn hướng, ghi dấu, mở khung, biểu đạt) với quy tắc dùng | NÊN CÓ |
| Luyện giới thiệu | Mini bài tập: tình huống khách hỏi, chọn câu trả lời đúng tinh thần; kết quả đưa vào M6 | SAU |

**Mức dùng VIMI theo đối tượng** (từ hồ sơ 6.3; lưu ở `brands.vimi_level`): VMG English: `primary` (trẻ em và gia đình: học liệu, góc lớp, sự kiện, quà tặng, nội dung mạng xã hội, sticker). VMG IELTS, VMG Tiếng Trung: `selective` (thanh thiếu niên, chọn lọc, phù hợp độ tuổi). VMG TESOL, VMP, UpLearn by VMG, EduNext: `limited` (người trưởng thành và giáo viên: hạn chế, ưu tiên ảnh thật kết hợp nét THE INK). VMG cấp hệ thống: theo ngữ cảnh, mặc định `selective`.

**Trang thương hiệu thành viên** (`/brand/[slug]`), cùng một bố cục cho cả bảy thương hiệu:

1. Đầu trang: logo (từ `logo_ref`), thẻ màu thương hiệu, dòng vai trò, lĩnh vực, khách hàng mục tiêu.
2. Vai trò trong hệ sinh thái và quy tắc thể hiện (từ bảng 4.1 hồ sơ).
3. Giọng nói: sắc thái giao tiếp, nên và tránh.
4. Thông điệp: headline, nội dung chính, bằng chứng cần có, lời kêu gọi (từ bảng 5.4). Mỗi dòng có thẻ trạng thái (`proposed`, `effective`, `withheld`) và, khi chưa phát hành, hiển thị đúng điều kiện (ví dụ "Chỉ phát hành sau khi chương trình mới được nghiệm thu, dự kiến 03/2027").
5. Sản phẩm thuộc thương hiệu (từ bảng `products`), mỗi sản phẩm bấm vào mở Thẻ sản phẩm; vị trí của thương hiệu trên bản đồ hành trình (nút "Xem trên hành trình"); dữ kiện đã xác nhận.
6. Bộ tài liệu tư vấn và tài sản của thương hiệu (liên kết thẳng sang M3).
7. Nút "Làm bài cho thương hiệu này" (mở T01 với thương hiệu đã chọn).
8. Dòng "Chủ chuyên môn" và ngày rà soát gần nhất.

**Theo dõi đọc:** `reading_progress` ghi người dùng đã đọc trang nào ở phiên bản nào. Khi trang đổi phiên bản lớn, người đã đọc thấy biểu ngữ "Có thay đổi từ lần bạn đọc trước" kèm tóm tắt.

**Tiêu chí hoàn thành M1:**

- Mọi câu chữ hiển thị trùng khớp từng ký tự với file nguồn (kiểm thử so sánh tự động giữa dữ liệu seed và trích xuất từ docx).
- Sơ đồ kiến trúc thương hiệu tự cập nhật khi thêm bớt thương hiệu trong quản trị.
- Nội dung ở trạng thái `withheld` hoặc `proposed` không bao giờ xuất hiện trong danh sách "câu có thể dùng" ở công cụ.
- Trên điện thoại 360 px, mọi trang đọc được không cuộn ngang; thời gian tải trang đầu dưới 2,5 giây trên 4G.

### 6.1.1 Hành trình khách hàng và Thẻ sản phẩm (mặt tiền của kiến thức thương hiệu và sản phẩm)

**Yêu cầu của Ban Giám Đốc [BẮT BUỘC].** Toàn bộ kiến thức thương hiệu và sản phẩm được trình bày như **một hệ sinh thái nối tiếp theo hành trình của một học viên tiêu biểu**, đúng tinh thần file nguồn "Hành trình khách hàng VMG" (đặt ở `docs/source/`). Nhân viên nhìn thấy trọn hành trình trước, rồi **bấm vào phần nào mới đi vào chi tiết phần đó**. Bản đồ hành trình là điểm vào mặc định của mục "Hiểu về VMG" khi tìm hiểu sản phẩm. Kiến trúc thương hiệu (mục 6.1) là cách nhìn thứ hai, theo thương hiệu; hai cách nhìn dùng chung dữ liệu và chuyển qua lại bằng thẻ thương hiệu.

**Nguyên tắc dữ liệu.** Một nguồn duy nhất: hành trình nằm trong cơ sở dữ liệu (`journey_*`, mục 7.2), nạp lần đầu từ `seed/journey.json` (Phụ lục G, đã trích từ file nguồn). Giao diện **vẽ từ dữ liệu**, không dùng ảnh tĩnh, sửa được qua quản trị. Cùng dữ liệu này phục vụ Brand Lab, bản xuất cho Ban Giám Đốc, và về sau website, sale kit **[SAU: API đọc, mục 8.4]**.

**Bố cục bản đồ** (theo file nguồn bản 20/10/2026):

- **Trục dọc theo tuổi, 5 chặng** (`journey_stages`): 4-6 tuổi (Mầm non); 6-11 tuổi (Tiểu học); 11-16 tuổi (THCS và tiền THPT); 16+ (từ band 4.0, không giới hạn tuổi đích); từ 18 tuổi (sau phổ thông và đi làm). Mỗi chặng có mục tiêu đầu ra, **người quyết định** (phụ huynh; phụ huynh và học sinh cùng quyết định; người học tự quyết định) và các ô. Mốc 16+ và từ 18 tuổi là mốc tham chiếu theo cấp học, **không phải điều kiện đầu vào**; giao diện ghi chú này.
- **Trục ngang là các line** (`journey_lines`), từ trái sang phải:
  1. **Line phụ B2G** (trường học): ENHANCED ENGLISH, tạm thẻ VMG English, từ mầm non đến THPT.
  2. **Line 1 (chính) ESL B2C**: học offline tại trung tâm, kèm khảo thí Cambridge và IELTS do VMT tổ chức; giữ ba cột con (`journey_lines.sublanes`): Học thuật bổ trợ; Dòng ngoại ngữ, một học viên tiêu biểu; Nhánh song song (IELTS Express).
  3. **Line 2 VMG e-Academy**: học trực tuyến có giáo viên, hai nhóm **Juniors** (học sinh) và **Prep** (teens và người lớn) đặt chồng nhau ở tuổi 11-16, không phải hai chặng nối tiếp. Ô ghi chú khoảng trống (`gap_note`): chưa có sản phẩm online cho lứa tuổi 4-6, chưa có khóa Prep cho lứa tiểu học.
  4. **Line phụ Tiếng Trung**: lớp 3-5, 6-9, 10-12 (chờ Ban Giám Đốc quyết định) và từ 16 tuổi (tiếng Trung giao tiếp, luyện thi HSK đến HSK4).
  5. **Tầng đích cuối** (`kind = goal_tier`, chặng "Từ 18 tuổi"): bốn nhóm, từ trái sang phải **Nghề giáo và giáo viên; Bằng cấp và chứng chỉ; Giao tiếp và chuyên môn; Du học**, nối với nhiều line.
- **Loại ô** (`journey_nodes.kind`): `program_header` (tiêu đề chương trình, B2G); `level` (cấp học); `exam` (cột mốc thi do VMT tổ chức, nền trắng viền vàng); `support_product` (IELTS Mock Test, IELTS Exam Focus); `product` (sản phẩm lẻ ở line Tiếng Trung và tầng đích); `branch_label` (nhãn rẽ nhánh "Từ 18 tuổi: mỗi người chọn đích đến riêng"); `goal_group` (bốn nhóm đích); `gap_note` (ghi chú khoảng trống, không phải sản phẩm).
- **Quy ước ô:** thẻ nhỏ góc phải là thương hiệu thành viên (VMG bảo chứng); dòng đầu là tên sản phẩm chuẩn trong danh mục (không rút gọn: E-PIONEER, E-CONTENDER & E-GENIUS, NEXTGEN IELTS); dòng sau là khóa nhỏ trong sản phẩm; ô mang màu thương hiệu; khung viền xanh ngọc bao hai nhóm Juniors và Prep; **không** gắn tag vòng đời (CORE, TĂNG TRƯỞNG...) lên ô.
- **Đường nối** (`journey_edges.kind`):
  - Nét liền, màu theo line: `sequence` (thứ tự trong một line, chỉ ở cặp có thứ tự rõ ràng), `side` và `side_group` (sản phẩm phụ gắn cạnh cột mốc thi), `branch` (rẽ sang tầng đích).
  - Nét đứt, **đề xuất** (`proposed = true`): `b2g_link` (kênh trường học, cross-sell sang trung tâm, giáo viên trường đối tác); `same_program` (e-Academy cùng chương trình với bản offline; **hai chiều**, `two_way = true`); `ea_link` (liên kết trong e-Academy và sang nhóm đích); `zh_link` (liên kết của line Tiếng Trung); và các nhánh sang tầng đích.
  - Nét đứt chỉ là **gợi ý liên kết để thảo luận**, không phải điều kiện, cam kết hay lộ trình bắt buộc. Giao diện ghi chú "liên kết đề xuất" và bật tắt được bằng công tắc "Hiện liên kết đề xuất".
  - IELTS Express chạy song song với NextGen IELTS và được xếp theo hàng, **không khớp từng band**.
- **Hai line nội dung nhưng không phải thương hiệu mới:** B2G tạm dùng thẻ VMG English; e-Academy là thẻ đề xuất `vmg-e-academy` (Phụ lục A.1, Q25). Sản phẩm chưa phải sản phẩm thương mại (FuturePath) không có trên bản đồ.
- **Số liệu B2G** (hơn 200 trường, khoảng 42.000 học sinh) trong file nguồn chưa rõ gắn với chương trình nào, nên **không** đưa lên bản đồ.

**Tương tác:**

| Hành động | Kết quả |
|---|---|
| Bấm một ô | Ngăn xem nhanh (bên phải ở máy tính; tờ trượt từ dưới ở điện thoại): tên, thương hiệu, thời lượng, mô tả, ô trước và ô sau; nút "Mở thẻ sản phẩm", "Bộ tư vấn", "Làm bài cho sản phẩm này" |
| Bấm tiêu đề chặng | Trang chặng `/brand/journey/stage/[key]`: mục tiêu đầu ra, người quyết định, các ô trong chặng, và "khi khách ở chặng này, nói gì về chặng kế tiếp" (chỉ từ dữ kiện `verified`) |
| Bấm thẻ thương hiệu hoặc ô chú giải màu | Làm nổi mọi ô của thương hiệu; bấm lần nữa mở trang thương hiệu |
| Bấm tên line | Làm nổi riêng line đó và mờ các line khác; hiện đường nối đề xuất của line |
| Công tắc "Hiện liên kết đề xuất" | Bật tắt các mũi tên nét đứt; mặc định bật, kèm chú giải "đề xuất, chưa xác nhận" |
| "Đi theo hành trình" | Chọn độ tuổi, line hoặc mục tiêu (nghề giáo, bằng cấp, giao tiếp và chuyên môn, du học) thì bản đồ cuộn tới chặng và làm nổi đường đi gợi ý, kèm nút Trước, Tiếp **[NÊN CÓ]** |
| Tìm kiếm | Tìm tên sản phẩm, cấp, mã; kết quả cuộn tới ô và làm nổi |
| Xuất | Tải bản đồ dạng PDF hoặc ảnh khổ dọc dựng từ dữ liệu, để trình bày **[NÊN CÓ]** |

**Điện thoại 360 px.** Bản đồ bốn line không thu nhỏ được, nên chuyển thành **thẻ theo line**: thanh tab ở đầu trang chọn line ("ESL B2C", "e-Academy", "B2G", "Tiếng Trung", "Đích"); trong mỗi line, các chặng là thẻ gập theo thứ tự tuổi; riêng Line 1 có thêm ba tab con "Dòng chính", "Bổ trợ", "Song song". Đường nối cùng line thể hiện bằng mũi tên dọc và nút "Tiếp theo"; đường nối **giữa các line** (nét đứt) hiện thành dòng "Liên kết đề xuất: ..." ở cuối ô, bấm để nhảy sang ô đích. Không cuộn ngang.

**Thẻ sản phẩm** (`/brand/products/[code]`): trang chi tiết, mỗi khối gập mở được; nội dung lấy từ `products`, `product_facts`, `journey_nodes`, thư viện và kế hoạch nội dung:

1. Định vị: tên chuẩn, thương hiệu thành viên (logo từ `logo_ref`), đối tượng (tuổi, người quyết định), hình thức học.
2. Vị trí trên hành trình: bản đồ thu nhỏ làm nổi sản phẩm, kèm "đến từ đâu" và "đi tiếp đâu" (đường nối đề xuất ghi rõ là đề xuất). Sản phẩm có bản offline và bản e-Academy cùng chương trình thì Thẻ hiện cả hai hình thức, nhưng chỉ khi quan hệ "cùng chương trình" đã xác nhận.
3. Các cấp hoặc khóa trong sản phẩm (các ô cùng sản phẩm): tên, thời lượng, mô tả.
4. Cam kết và dữ kiện đã xác nhận: mỗi dòng có nguồn và trạng thái; dữ kiện `pending` ghi rõ "chưa dùng được trong nội dung công khai".
5. Thông điệp và cách nói: headline, câu giới thiệu, nên và tránh (từ M1, M5).
6. Bộ tư vấn và tài sản của sản phẩm (M3).
7. Nội dung tháng này của sản phẩm (M9: các mục kế hoạch thuộc sản phẩm).
8. Câu hỏi thường gặp (lấy từ bộ tư vấn).
9. Nút "Làm bài cho sản phẩm này" (T01), "Báo lỗi", dòng chủ chuyên môn và ngày rà soát.

**Dữ kiện theo thời gian.** Các mốc như "Ra mắt mềm 28/10/2026", "Trải nghiệm miễn phí cho trường đối tác 09 đến 11/2026", "Bán chung một nhóm từ quý 4/2026" lưu ở `journey_nodes.timed_notes` kèm `valid_from`, `valid_to`. Hết hạn thì tự ẩn và gắn `needs_review`; mốc chưa xác nhận (`needs_confirm`) chỉ editor thấy.

**Ô chưa chắc chắn.** Ba nhóm ô được đánh dấu và hiển thị viền nét đứt kèm chú thích; cả ba **không được chọn trong T01, T02** (Phụ lục A.2):

- Ô có `brand_confirmed = false`: SAT, VSTEP, EPlus và FlexTrack (tạm xếp VMG English); toàn bộ ô B2G (tạm VMG English); toàn bộ ô e-Academy (thương hiệu VMG e-Academy chưa có trong file Nền tảng, Q25). Chú thích: "Thương hiệu tạm xếp, chờ xác nhận".
- Ô có `decision_pending = true`: ba ô Tiếng Trung lớp 3-5, 6-9, 10-12. Chú thích: "Chờ Ban Giám Đốc quyết định". Không có mũi tên từ các ô này sang HSK.
- Ô có `verify_note`: K-12 (tên mới của A01-D01, tuổi chưa rõ), IELTS Lab, e-Plus Pro, các cấp IE1 đến IE7 (band 4.0 đến 6.5+, 3 tháng 36 giờ mỗi cấp). Chỉ editor thấy nhãn "chờ xác nhận"; người dùng thường thấy ô nhưng **không** thấy câu "cam kết đầu ra từng cấp" cho đến khi R&D xác nhận (Q23).

**Không tự suy ra.** Claude Code không tự thêm ô, đổi thứ tự, thêm cam kết đầu ra, thời lượng hay giá. Lưu ý: cam kết trong danh mục sản phẩm (ví dụ NextGen 5.5 và 6.5; IELTS Express từ 0 lên 6.0 trong một năm) **khác** cách chia cấp trong hành trình. Con số chỉ được hiển thị khi R&D thống nhất (Q23). Cũng không tự suy ra: tuổi của các khóa e-Academy (file nguồn chỉ chia Juniors và Prep), việc e-Academy "cùng chương trình" với bản offline, và việc K-12 có bao gồm cấp tiểu học hay không.

**Quản trị** (`/admin/journey`): thêm, sửa, sắp xếp ô và đường nối bằng bảng (kéo thả là **[NÊN CÓ]**). Đổi một ô gắn cờ `needs_review` cho thẻ sản phẩm, bộ tư vấn và mục kế hoạch liên quan (qua `dependencies`). Phân lớp quản trị (mục 6.3): thêm bớt chặng, thêm bớt line, thêm bớt ô sản phẩm, đổi thương hiệu của ô, chuyển đường nối đề xuất thành chính thức thuộc lớp `core` và cần hồ sơ thay đổi; sửa mô tả, thời lượng, ghi chú thuộc lớp `creative`. **[CẦN XÁC NHẬN, Q23.]**

**Tiêu chí hoàn thành hành trình:**

- Bản đồ vẽ từ `seed/journey.json` đủ 61 ô (gồm 3 ô ghi chú khoảng trống và 1 nhãn rẽ nhánh), 5 line (kể cả tầng đích) và 51 đường nối, trong đó 14 đường nối đề xuất nét đứt; tên và chữ khớp từng ký tự với file nguồn (kiểm thử đối chiếu).
- Đường nối đề xuất vẽ nét đứt có chú giải; hai chiều (`two_way`) có mũi tên hai đầu; công tắc "Hiện liên kết đề xuất" hoạt động.
- Ô `decision_pending = true` hiển thị chú thích "Chờ Ban Giám Đốc quyết định" và không xuất hiện trong T01, T02.
- Từ trang chủ đến bộ tư vấn của một sản phẩm bất kỳ tối đa 3 lần bấm.
- Thêm một ô trong quản trị thì bản đồ và thẻ sản phẩm cập nhật mà không cần triển khai lại.
- Điện thoại 360 px: không cuộn ngang; thanh tab chọn line hoạt động; bấm ô mở tờ trượt dưới 300 ms.
- Ô `brand_confirmed = false` hiển thị chú thích và không xuất hiện trong danh sách chọn của T01, T02.
- Bài thử 5 câu hỏi vị trí trên hành trình (do Marketing soạn, ví dụ "học viên học xong Flyers thì đi tiếp sản phẩm nào", "học sinh e-Academy muốn luyện IELTS thì ở line nào"): ít nhất 90% nhân viên thử trả lời đúng trong 3 phút.

### 6.2 M2 - Chuẩn thương hiệu (guideline theo vai trò)

**Mục đích.** Trả lời "Tôi là ai, tôi được dùng thương hiệu thế nào": từ thông điệp, hình ảnh, màu sắc đến cách làm việc hằng ngày, theo đúng vai trò.

**Cấu trúc.** `guideline_sets` (bộ chuẩn, có phiên bản và ngày hiệu lực) chứa các trang. Ba bộ khởi tạo:

| Bộ | Đối tượng | Trang khởi tạo |
|---|---|---|
| **Bộ chuẩn thương hiệu VMG** (lõi) | Mọi người, nhất là Marketing và thiết kế | Logo; Màu sắc và tỷ lệ màu; Kiểu chữ; Hình ảnh và nhiếp ảnh; Bố cục và lưới; Thông điệp và giọng nói; VIMI; THE INK; Kiến trúc thương hiệu và quy tắc thể hiện; Quy tắc ký hiệu và bảo hộ (không dùng ® khi chưa được cấp văn bằng) |
| **Hướng dẫn khối Trung tâm** (front office) | Nhân viên trung tâm | Giới thiệu VMG đúng; Chọn đúng tài liệu và logo; Làm nội dung mạng xã hội hằng ngày bằng công cụ AI (quy trình, ảnh chụp thao tác từng bước); Quy trình duyệt bài; Hoạt động marketing địa phương (ví dụ tradeshow, ngoại khóa); Khi khách hỏi về chặng học tiếp theo (cross-sell hệ sinh thái) |
| **Hướng dẫn khối backoffice** | Hành chính, nhân sự, tài chính... | Giới thiệu VMG cơ bản; Mẫu văn phòng, hợp đồng, phiếu thu; Chữ ký email; Slide và tài liệu nội bộ |

**Khối nội dung (block) hỗ trợ:** văn bản, ô lưu ý, cặp Nên và Tránh (hình và chú thích), bảng màu (bấm sao chép HEX, RGB, CMYK, Pantone), mẫu chữ, tài sản tải về nhúng ngay trong trang, các bước kèm ảnh chụp thao tác, danh sách kiểm, bộ ví dụ minh họa, nhúng công cụ (hiện trực tiếp T01 hay T03 trong trang hướng dẫn).

**Nguyên tắc viết hướng dẫn** (kiểm thành checklist trong trình soạn): cô đọng, mỗi trang một việc; nhiều ví dụ trực quan, ảnh ví dụ chỉ để minh họa thế nào là đẹp; quy trình mô tả bằng ảnh chụp thao tác từng bước; **không đưa ghi chú tiến độ, bản tạm hay nội dung trao đổi nội bộ vào trang**.

**Lộ trình theo vai trò** (`/guidelines/for/[role]`): hệ thống dựng danh sách đọc theo vai trò. Ánh xạ khởi tạo:

| Vai trò công việc | Trang nên đọc |
|---|---|
| Tư vấn viên | Giới thiệu VMG đúng; Thông điệp theo thương hiệu; Chọn tài liệu tư vấn; Quan hệ giữa các thương hiệu |
| Lễ tân | Giới thiệu VMG đúng; Logo và biển hiệu; Khi khách hỏi |
| Quản lý trung tâm | Tất cả trang của tư vấn viên, cộng: Làm nội dung mạng xã hội; Quy trình duyệt bài; Hồ sơ doanh nghiệp trên Google |
| Giáo viên | Giới thiệu VMG; VIMI trong lớp trẻ em; Giá trị và hành vi |
| Marketing HO, thiết kế | Toàn bộ Bộ chuẩn lõi |
| Backoffice | Hướng dẫn backoffice |

**Trình chọn logo** (`/guidelines/logo-picker`): cây câu hỏi lưu trong `decision_trees`, trả về đúng file logo, kèm quy tắc và ví dụ sai.

1. "Bạn đang làm tài liệu về điều gì?" (VMG nói chung / một thương hiệu thành viên / một khóa học phân phối qua UpLearn)
2. "Dùng ở đâu?" (kênh số / in ấn / biển hiệu / sự kiện / văn bản hành chính)
3. "Nền là gì?" (sáng / tối / ảnh)
4. Kết quả: logo cần dùng, bản positive hoặc reversed, vùng trống, kích thước tối thiểu, nút tải, lỗi thường gặp.

Quy tắc ràng buộc nạp sẵn: mỗi tài sản xác định rõ đang nói về VMG hay thương hiệu thành viên trước khi chọn logo ("một tài sản, một chủ thể"); logo cấp hệ thống không dùng cho tài liệu tuyển sinh của một sản phẩm cụ thể; không đưa ENGLISH trở lại logo hệ thống; logo VMG TESOL giữ nền xanh; khóa học phân phối qua UpLearn giữ tên và nhận diện của chính khóa đó, UpLearn thể hiện vai trò nền tảng.

**Phiên bản và thay đổi:** mỗi lần xuất bản bộ chuẩn tạo phiên bản (ví dụ 1.0 có hiệu lực dự kiến 01/2027), có ngày hiệu lực và tóm tắt thay đổi; trang `changelog` liệt kê; bản cũ giữ read-only với biểu ngữ "Hết hiệu lực". **Xuất PDF** từng trang hoặc cả bộ **[NÊN CÓ]**, để gửi nhà in cùng artwork (quy tắc cũ của bộ nhận diện: cung cấp bản copy trang guideline liên quan cho nhà in).

**Tiêu chí hoàn thành M2:**

- Một nhân viên mới chọn vai trò thì thấy đúng danh sách đọc và đánh dấu được đã đọc.
- Trình chọn logo trả đúng kết quả cho 12 tình huống kiểm thử do chủ sản phẩm cung cấp (gồm ít nhất: tài liệu chung VMG; tờ rơi VMG IELTS; biển TESOL nền tối; khóa TESOL qua UpLearn; tài liệu VMP).
- Chuyển bộ chuẩn sang phiên bản mới không làm mất lịch sử đọc.

### 6.3 M5 - Tri thức, quy tắc và quản trị theo lớp

M5 là phần quản trị làm cho các module khác "sống" mà không cần lập trình viên: dữ liệu thương hiệu, sản phẩm, dữ kiện, thông điệp, quy tắc.

**Ba lớp quản trị** (từ hồ sơ Nền tảng, mục 8.1; lưu cờ `layer` trên mọi thực thể nội dung):

| Lớp | Thực thể | Ai quyết định | Cách thay đổi trong hệ thống |
|---|---|---|---|
| `core` (lõi) | Tên VMG, biểu tượng, cấu trúc logo, màu chủ đạo, định vị, lời hứa, giá trị, kiến trúc thương hiệu, tagline | Ban Giám Đốc | Chỉ qua **Hồ sơ thay đổi** (`change_requests`) |
| `creative` (tài sản sáng tạo) | VIMI, THE INK, bộ mẫu thiết kế, thư viện ảnh và video, âm nhạc | Phòng Marketing quản lý chuẩn | `editor` gửi, `admin` xuất bản |
| `campaign` (truyền thông theo dịp) | Chủ đề tháng, chiến dịch theo mùa, câu chữ, bố cục, sự kiện | Phát triển trong khuôn khổ bộ chuẩn | `editor` được xuất bản; không được mở lại quyết định về lõi |

**Hồ sơ thay đổi lớp lõi** (theo mục 8.2 hồ sơ): bắt buộc nêu vấn đề kinh doanh cần giải quyết, hạng mục cần thay, lý do tài sản hiện tại chưa đáp ứng, chi phí chuyển đổi, cách bảo toàn khả năng nhận biết, **số và ngày văn bản phê duyệt của Ban Giám Đốc** (`approval_ref`). Thiếu một trường thì không xuất bản được nội dung lớp lõi. Ngoại lệ có quy trình riêng: điều chỉnh phần hình logo vì lý do pháp lý (đính kèm mẫu so sánh, lý do pháp lý, mức ảnh hưởng đến khả năng nhận biết, chi phí chuyển đổi).

**Các màn hình quản trị:**

| Màn hình | Nội dung chính |
|---|---|
| Thương hiệu | Thông tin, màu, `vimi_level`, giọng nói, tên đã bỏ (để cảnh báo), trạng thái phát hành, điều kiện phát hành |
| Sản phẩm | Nhập từ `VMG_Product_Portfolio_2026.md`; gán thương hiệu; cờ `brand_confirmed`; vòng đời, đối tượng, hình thức |
| Kho dữ kiện | Dữ kiện theo thương hiệu hoặc sản phẩm; trạng thái bằng chứng; chủ chuyên môn xác nhận; ngày hết hạn của dữ kiện có thời hạn |
| Bảng thiếu bằng chứng | Danh sách dữ kiện `pending` theo thương hiệu và người phụ trách; **seed sẵn các mục "Bằng chứng cần bổ sung"** từ hồ sơ (số học viên đã theo học, câu chuyện cựu học viên có thể kiểm chứng, tỷ lệ học tiếp chặng sau, thời gian học trung bình, số giáo viên thực học EduNext, số suất học đã trao và kết quả đạt được) |
| Ngân hàng thông điệp | Tagline, thông điệp chủ đạo, headline, slogan chiến dịch, câu giới thiệu; theo dõi nơi đang dùng |
| Trụ nội dung, loại bài, CTA | Bốn trụ nội dung, các `post_type` và trường biểu mẫu, thư viện lời kêu gọi |
| Bộ quy tắc | Soạn, nhập từ file `.md`, so sánh phiên bản, chọn bản hiệu lực, **Phòng thử quy tắc** |
| Quy tắc kiểm tra | CRUD `checker_rules`, kèm bộ câu thử |
| Chính sách ưu đãi | Bảng `promo_policy` |
| Hành trình khách hàng (`journey_*`) | Chặng, ô, đường nối; mục 6.1.1 |
| Hồ sơ trung tâm | Mục 3.3 |
| Cổng phát hành, cờ tính năng, mẫu lời nhắc | `release_gates`, `feature_flags` (trong đó `vimi_enabled`, `trademark_clear`, `ai_enabled`), `prompt_templates` |

**Ngân hàng thông điệp** (theo mục 7.3 hồ sơ Kế hoạch): mỗi câu chữ khi phát hành có **chủ thể** (VMG hay thương hiệu thành viên), **loại câu** (tagline, thông điệp chủ đạo, headline, slogan chiến dịch, câu giới thiệu, lời kêu gọi), **người xác nhận bằng chứng**, **ngày hiệu lực** và **ngày hết hiệu lực** nếu có. Câu đổi thì bản cũ chuyển `superseded`, mọi nơi dùng bị gắn cờ `needs_review`.

**Phòng thử quy tắc [NÊN CÓ]:** quản trị chọn một bản nháp của bộ quy tắc, nhập một tình huống mẫu, chạy sinh nội dung và kiểm tra để xem kết quả trước khi xuất bản quy tắc. Đây là chỗ tinh chỉnh chất lượng đầu ra của AI mà không cần triển khai lại.

**Nạp bộ quy tắc hiện có:** hai file quy tắc của Marketing (rule ngôn ngữ thiết kế cho ảnh và rule viết caption) được nhập nguyên văn làm Bộ quy tắc phiên bản đầu (`rule_sets`), sau đó tách dần các điều có thể kiểm tra tự động thành `checker_rules`. Hai bộ có tính chất khác nhau: bộ viết nội dung cần cho AI ra kết quả ổn định, bộ ngôn ngữ thiết kế tránh quy định quá cứng, chỉ cần một ngôn ngữ chung để mọi người không tạo ra kết quả khác biệt.

**Tiêu chí hoàn thành M5:**

- Marketing thêm một thương hiệu hoặc sản phẩm mới, một quy tắc cấm mới, một dữ kiện mới mà không cần sửa mã.
- Nội dung `core` không xuất bản được khi thiếu `approval_ref`.
- Đổi một thông điệp đang được ba tài sản dùng thì cả ba hiện cờ `needs_review` trong vòng một phút.

### 6.4 M3 - Thư viện tài liệu (sale kit và tài sản)

**Mục đích.** Mọi nhân viên tìm đúng, tải đúng, dùng đúng tài liệu thương hiệu, luôn ở phiên bản có hiệu lực. Giải quyết tình trạng mỗi trung tâm tự làm hoặc dùng bản cũ.

**Loại tài sản** (`assets.type`): `logo_pack`, `guideline_pdf`, `intro_deck` (hồ sơ giới thiệu VMG), `sales_kit_item` (bảng giới thiệu sản phẩm, brochure, FAQ, phiếu tư vấn, kịch bản tư vấn, bảng so sánh phương án), `social_template`, `posm` (standee, poster, backdrop, tờ rơi), `office_template` (chữ ký email, slide, văn bản, hợp đồng và phiếu thu mẫu), `campaign_kit`, `visual_asset` (VIMI, THE INK, biểu tượng, hoa văn, ảnh nền), `photo` (ảnh có quyền sử dụng), `video`, `audio` (nhạc thương hiệu, trạng thái thử nghiệm), `other`.

**Siêu dữ liệu bắt buộc** (từ mục 10.2 hồ sơ Kế hoạch): mã, phiên bản, ngày hiệu lực, chủ nội dung, phần được phép chỉnh sửa. Bổ sung: thương hiệu, sản phẩm (tùy chọn), đối tượng, chiến dịch, nhãn, ghi chú dùng ("Không dùng cho..."), ngày rà soát kế tiếp, định dạng có sẵn.

**Quy ước mã tài sản:** `VMG-{THUONGHIEU}-{LOAI}-{SO}` ví dụ `VMG-IELTS-KIT-0012`; phiên bản dạng `1.0`, `1.1`, `2.0` (số đầu tăng khi đổi nội dung chính hoặc thông tin thương mại; số sau tăng khi sửa nhỏ).

**Vòng đời:** `draft` → `in_review` → `effective` → `superseded` hoặc `expired` → `archived` (mục 4.2). Người dùng thường chỉ thấy `effective` và trong thời hạn.

**Tìm kiếm và lọc:** theo thương hiệu, sản phẩm, loại, đối tượng, chiến dịch, định dạng, nhãn, "mới cập nhật 30 ngày". Chi tiết tìm kiếm ở mục 7.5.

**Trang chi tiết tài sản:** xem trước bằng ảnh thu nhỏ (thumbnail) lưu trong Brand Lab, tối đa 6 ảnh cho tài liệu nhiều trang (bìa, các trang tiêu biểu), tất cả định dạng đều dùng cách này, không nhúng trình xem của Drive; nút "Tải về" (mục 6.4.1); phiên bản hiện hành và ngày hiệu lực, chủ nội dung, **phần được phép chỉnh sửa**, ghi chú dùng, tệp tải về theo định dạng, liên kết "đang dùng ở đâu", nút Theo dõi, nút Báo lỗi. Người dùng đã tải một phiên bản cũ nhận thông báo khi có bản mới (dựa trên `downloads`).

**Bộ tài liệu (bundle).** Một bộ gom các tài sản theo mục đích, ví dụ "Bộ tư vấn VMG IELTS". `bundle_templates` định nghĩa các ngăn bắt buộc, từ đó tính **độ đầy đủ** (chỉ số nghiệm thu 100%).

Mẫu ngăn khởi tạo cho **bộ tư vấn sản phẩm**: hồ sơ giới thiệu; bảng giới thiệu sản phẩm; câu hỏi thường gặp; kịch bản tư vấn; bảng so sánh phương án; phiếu tư vấn; bằng chứng và kết quả (khi có); mẫu bài mạng xã hội; vật phẩm tại điểm bán; hướng dẫn sử dụng bộ. Một bộ được tính đầy đủ khi mọi ngăn bắt buộc có tài sản `effective`, và mỗi tài sản có tệp, hướng dẫn, ngày hiệu lực, chủ nội dung.

Trang bộ tài liệu có danh sách tệp kèm nút "Tải lần lượt" (trình duyệt tải từng tệp theo thứ tự) và nút "Sao chép danh sách" (mã, tên, phiên bản, ngày hiệu lực dạng văn bản để dán vào nhóm chat). **Không làm ZIP trọn bộ ở bản đầu [SAU]**: nếu phản hồi người dùng cho thấy cần, làm dạng truyền luồng từ Drive qua máy chủ, không lưu tạm.

**Bộ ưu tiên đầu tiên** (mục 10.2 hồ sơ): logo và bộ chuẩn; hồ sơ giới thiệu VMG; bộ tư vấn các chương trình cốt lõi (sản phẩm nhãn CORE trong danh mục: ESL Kindy, ESL Kids, ESL NextGen, IELTS Express, B2G ESL, Du học dài hạn); mẫu bài mạng xã hội thường dùng; vật phẩm phổ biến; bộ tài liệu chiến dịch gần nhất.

**Thư viện ảnh và kho nguồn cho người làm nội dung.** Hai nhánh đặc biệt của thư viện:

- `photo`: ảnh có **quyền sử dụng** (`usage_rights`, nguồn hoặc người chụp, `rights_expiry`), cờ `has_people`, cờ `people_consent` (đã có đồng ý sử dụng hình ảnh; với trẻ em là của phụ huynh), trung tâm hoặc sự kiện liên quan. T01 chỉ cho chọn ảnh có người khi `people_consent = true`.
- `visual_asset`: tư thế VIMI, nét THE INK, biểu tượng, hoa văn nền (biểu tượng VMG chế độ hòa trộn Overlay, độ mờ 15% đến 100% theo bộ nhận diện), ảnh nền. Dạng vector khi có thể.

**Nhập tài sản (quy trình):** xem mục 6.4.1 (đăng ký từ Drive). Định dạng chấp nhận đăng ký: PDF, PPTX, DOCX, XLSX, PNG, JPG, SVG, AI, PSD, MP4, ZIP; tệp Google gốc (Docs, Slides, Sheets) chỉ cho vai trò `source` hoặc kèm cảnh báo (mục 6.4.1, quy tắc phiên bản).

**Chia sẻ có hạn cho đối tác ngoài [SAU]:** liên kết hết hạn, chỉ xem hoặc tải bộ được chọn, ghi nhật ký. Làm qua đường tải máy chủ (proxy) có mã thông báo hết hạn, không chia sẻ trực tiếp thư mục Drive.

### 6.4.1 Mô hình lưu trữ: Drive là kho, Brand Lab là sổ đăng ký [BẮT BUỘC]

**Quyết định của chủ sản phẩm:** toàn bộ tệp nặng nằm trên Google Drive của VMG; Brand Lab chỉ giữ liên kết, siêu dữ liệu và ảnh thu nhỏ để xem trước, nhằm không phải vận hành hạ tầng lưu trữ riêng.

**Ba lớp lưu trữ:**

| Lớp | Nơi lưu | Nội dung | Ai thấy |
|---|---|---|---|
| A. Tệp gốc | Google Drive (Shared Drive của VMG) | Mọi tệp để tải về: PDF, PPTX, AI, PSD, video, ảnh gốc, ZIP | Người có quyền tải qua Brand Lab |
| B. Ảnh thu nhỏ | Supabase Storage, bucket `thumbs` | Mỗi tài sản tối đa 6 ảnh WebP, cạnh dài 480 px, mỗi ảnh dưới 80 KB (PDF và bản trình chiếu: bìa và một số trang tiêu biểu; video: một khung hình; ảnh: bản thu nhỏ) | Mọi người có quyền xem tài sản |
| C. Bản làm việc cho bộ dựng ảnh | Supabase Storage, bucket `render_cache` (riêng tư, **ngoại lệ có giới hạn**) | Chỉ các tệp mà công cụ phải đọc lúc dựng ảnh: logo (vector hoặc PNG), tư thế VIMI, nét THE INK, hoa văn, biểu tượng, mẫu SVG, font, ảnh trong thư viện ảnh đã duyệt dùng cho T01. Mỗi tệp tối đa 10 MB, tổng tối đa 500 MB (cấu hình được) | Chỉ máy chủ, không hiển thị và không tải từ đây |

Lý do có lớp C: bộ dựng ảnh phải xác định và nhanh (dưới 5 giây), nên không gọi Drive mỗi lần dựng. Gọi Drive từng lần chậm, dính hạn mức API, và sẽ hỏng ngay khi ai đó xóa hoặc đổi tên tệp trên Drive. Lớp C là **bản sao đồng bộ tự động từ Drive** (không ai tải lên tay), có `drive_md5` để biết khi nào lỗi thời. Tệp kết quả của công cụ (`generations`, ảnh người dùng đưa vào T01) lưu ở bucket `generations`, tự xóa sau 90 ngày (cấu hình `GENERATION_RETENTION_DAYS`), người dùng tải về máy ngay sau khi tạo. Dung lượng dự kiến cả ba lớp ở giai đoạn đầu dưới 1 GB.

**Cấu trúc Drive (do Marketing thiết lập, giai đoạn 0):**

- Một Shared Drive "VMG Brand Library" (tệp thuộc tổ chức, không thuộc cá nhân, để không mất khi nhân sự rời công ty).
- Hai nhánh gốc: `_NHAP` (Marketing soạn thảo, thử nghiệm) và `_CHINH_THUC` (chỉ tệp đã xuất bản). Trong mỗi nhánh chia theo `{Thương hiệu}/{Loại tài sản}/`.
- Quyền Drive: Marketing là Content manager; **nhân viên không cần được cấp quyền Drive** khi dùng chế độ tải qua máy chủ (bên dưới); tài khoản dịch vụ của Brand Lab (service account) được thêm vào Shared Drive.
- Quy ước tên tệp: `VMG_{THUONGHIEU}_{LOAI}_{ten-ngan}_{phienban}.{duoi}` để nhập hàng loạt tự gợi ý siêu dữ liệu.
- Hệ thống **chỉ cho xuất bản** tài sản có tệp nằm trong cây `_CHINH_THUC` (kiểm tra chuỗi thư mục cha qua API khi xuất bản và khi đồng bộ). Tệp ở `_NHAP` chỉ đăng ký được ở trạng thái `draft`.

**Đăng ký tài sản (thay cho bước tải lên):**

1. Người có quyền `editor` dán liên kết Drive (hoặc chọn bằng Google Picker **[NÊN CÓ]**). Hệ thống rút `drive_file_id`, gọi Drive API lấy tên, `mimeType`, kích thước, `md5Checksum`, `modifiedTime`, `headRevisionId`, thư mục cha.
2. Kiểm tra: tệp thuộc Shared Drive đã cấu hình; tài khoản dịch vụ đọc được; định dạng thuộc danh sách cho phép; không trùng (`drive_md5` hoặc `drive_file_id` đã đăng ký).
3. Sinh ảnh thu nhỏ: tải tệp về tạm trên máy chủ, tạo tối đa 6 ảnh WebP, ghi vào `thumbs`, xóa tệp tạm. Không dùng `thumbnailLink` của Drive để hiển thị (liên kết hết hạn và cần quyền). Với video lớn dùng khung hình do Drive cung cấp hoặc ảnh bìa do người đăng ký tải lên (ảnh nhỏ).
4. Nếu loại tài sản thuộc nhóm dựng ảnh (`logo_pack`, `visual_asset`, mẫu SVG, `photo` được đánh dấu `render_ready`) và tệp ≤ 10 MB: tạo bản làm việc ở `render_cache`.
5. Điền siêu dữ liệu (mục 6.4), hệ thống sinh mã tài sản, gửi xuất bản theo vòng đời.
6. Khi xuất bản, hệ thống **ghim phiên bản**: lưu `drive_revision_id`, `drive_md5`, `drive_modified_time` và đặt `keepForever = true` cho bản sửa đó trên Drive (Drive tự xóa bản sửa cũ sau một thời gian nếu không ghim). Chỉ áp dụng cho tệp nhị phân (PDF, PPTX, ảnh, video...). Nếu tài khoản dịch vụ không có quyền ghi, bỏ qua bước ghim và chỉ dựa vào phát hiện lệch (bên dưới).

**Nhập hàng loạt [NÊN CÓ, giai đoạn 1]:** chọn một thư mục Drive, hệ thống tạo bản nháp tài sản cho từng tệp, gợi ý thương hiệu, loại, phiên bản từ quy ước tên tệp và cây thư mục; người dùng rà soát từng dòng trước khi xuất bản.

**Quy tắc phiên bản (kiểm soát bằng quy trình cộng phát hiện lệch):**

- Phiên bản mới của tài sản **nên là tệp mới** trên Drive trong `_CHINH_THUC` (giữ tệp cũ để lưu vết), đăng ký thành `asset_versions` mới; bản cũ chuyển `superseded`.
- Nếu Marketing sửa trực tiếp tệp cũ trên Drive (cùng `drive_file_id`), công việc nền phát hiện `modifiedTime` hoặc `md5Checksum` khác bản đã ghim (trạng thái `drift`): tài sản gắn cờ `needs_review`, quản trị nhận thông báo, và chọn một trong hai: **Xác nhận là phiên bản mới** (tăng phiên bản, ghim bản sửa mới, làm mới thumbnail và `render_cache`) hoặc **Khôi phục** (hướng dẫn quay lại bản sửa đã ghim trên Drive; với tệp tải qua máy chủ thì hệ thống vẫn tải đúng bản sửa đã ghim cho đến khi xử lý xong).
- Người dùng thường tải qua máy chủ luôn nhận **bản sửa đã ghim**, không phải bản mới nhất trên Drive. Nhờ vậy sửa nháp trên Drive không lọt ra nhân viên trước khi xuất bản.
- Tệp Google gốc (Docs, Slides, Sheets) không ghim được bản sửa theo cách trên. Chỉ cho dùng làm vai trò `source`; tệp chính (`primary`) phải là định dạng tải về (PDF, PPTX, XLSX, PNG...). Nếu vẫn cần đăng ký tệp Google gốc làm `primary`, hiển thị cảnh báo và chỉ phát hiện lệch theo `modifiedTime`.

**Tải về (hai chế độ, `download_mode`):**

| Chế độ | Khi dùng | Cách hoạt động |
|---|---|---|
| `proxy` (mặc định) | Tệp ≤ `DOWNLOAD_PROXY_MAX_MB` (mặc định 50 MB) | Máy chủ kiểm tra quyền người dùng, ghi `downloads`, truyền luồng tệp từ Drive (bản sửa đã ghim) về trình duyệt, đặt tên tệp theo mục 8.5. Nhân viên không cần tài khoản Google, không cần được chia sẻ thư mục |
| `redirect` | Tệp lớn (video, nguồn thiết kế nặng) | Máy chủ kiểm tra quyền, ghi `downloads`, rồi chuyển người dùng tới liên kết Drive. Quyền thực tế do Drive quyết định. **[CẦN XÁC NHẬN Q17: nhân viên dùng email Google Workspace của VMG hay email cá nhân]**; nếu không dùng Workspace thì cần chia sẻ "bất kỳ ai có liên kết" và chấp nhận rằng liên kết đó có thể bị chuyển tiếp ra ngoài |

Mọi lỗi tải (hết hạn mức Drive, tệp bị xóa, mất quyền) hiện thông báo tiếng Việt thân thiện, không lộ lỗi kỹ thuật, và tạo cảnh báo cho quản trị.

**Kiểm tra sức khỏe liên kết (công việc nền):**

- Mỗi 6 giờ và có nút "Kiểm tra ngay": với mọi tài sản `effective`, gọi Drive API đọc siêu dữ liệu (không tải nội dung), cập nhật `link_status`: `ok`, `drift`, `missing` (không tìm thấy), `trashed` (vào thùng rác), `no_access` (mất quyền của tài khoản dịch vụ).
- `missing`, `trashed`, `no_access`: ẩn nút tải, hiện "Tài liệu tạm thời không tải được, đã báo Marketing", gắn `needs_review`, thông báo `admin` và chủ nội dung ngay. `drift`: xử lý như trên.
- Trang quản trị "Sức khỏe liên kết" liệt kê tài sản theo `link_status`, kèm ngày kiểm tra gần nhất. Hạn mức gọi Drive API được kiểm soát bằng gom nhóm yêu cầu và giãn cách; lỗi do hạn mức không được hiểu nhầm là tệp mất.

**Hệ quả đã chấp nhận khi chọn Drive-first (ghi rõ để tránh hiểu nhầm):**

1. Lời hứa "chỉ thấy bản có hiệu lực" được bảo đảm cho người dùng thường nhờ tải đúng bản sửa đã ghim; nhưng **ai có quyền sửa Drive vẫn có thể sửa hoặc xóa tệp**. Giữ quyền sửa ở `_CHINH_THUC` chỉ cho một nhóm nhỏ trong Marketing là biện pháp bắt buộc, không phải gợi ý.
2. Phụ thuộc Google: Drive gián đoạn hoặc đổi chính sách hạn mức thì tải tệp bị ảnh hưởng, trong khi xem thumbnail, tìm kiếm, hướng dẫn thương hiệu và công cụ dựng ảnh từ mẫu vẫn chạy (nhờ lớp B và C).
3. Drive không phải bản sao lưu. Bật chống xóa vĩnh viễn cho Shared Drive, và sao lưu định kỳ thư mục `_CHINH_THUC` ra nơi khác **[CẦN XÁC NHẬN Q19]**.
4. Đổi tên hoặc di chuyển tệp trên Drive không làm hỏng liên kết (dùng `drive_file_id`), nhưng chuyển ra ngoài Shared Drive hoặc xóa thì hỏng.
5. Trình duyệt tích hợp của Zalo có thể không mở được liên kết Drive hoặc không tải được tệp; chế độ `proxy` và hướng dẫn "Mở bằng trình duyệt" (mục 8.5) giảm vấn đề này, chế độ `redirect` thì không.

**Tiêu chí hoàn thành M3:**

- Tìm "ielts tu van" (không dấu) trả bộ tư vấn VMG IELTS trong 3 kết quả đầu.
- Tài sản `superseded` hoặc `expired` không xuất hiện trong tìm kiếm mặc định (kiểm thử tự động).
- Ít nhất 90% tác vụ thử (30 tác vụ do Marketing soạn) tìm được bản có hiệu lực trong tối đa 2 phút.
- Tải tệp qua `proxy` bắt đầu trong 3 giây với tệp 50 MB, và không tăng bộ nhớ máy chủ theo kích thước tệp (truyền luồng).
- Sửa trực tiếp một tệp đã xuất bản trên Drive thì trong tối đa 6 giờ (hoặc ngay khi bấm "Kiểm tra ngay") tài sản hiện `drift` và `needs_review`, trong khi người dùng thường vẫn tải đúng bản sửa đã ghim (kiểm thử với Drive thật hoặc mô phỏng).
- Xóa một tệp trên Drive thì tài sản chuyển `trashed` hoặc `missing`, nút tải ẩn, quản trị nhận thông báo.
- Đăng ký 40 tệp tổng 300 MB (nhập hàng loạt) không làm máy chủ quá tải bộ nhớ và không lưu tệp gốc vào Supabase Storage (kiểm tra dung lượng bucket).

### 6.5 M6 - Học và kiểm tra tình huống

**Mục đích.** Chuyển nền tảng thương hiệu thành hiểu biết và hành vi của đội ngũ; đo chỉ tiêu "ít nhất 90% người được hướng dẫn đạt từ 80/100 điểm ở bài kiểm tra tình huống trước chiến dịch mùa hè".

- **Lộ trình học theo vai trò** (`learning_paths`): chuỗi bước, mỗi bước là một trang M1 hoặc M2 cần đọc, hoặc một bài kiểm tra. Có lộ trình hội nhập cho nhân viên mới (phục vụ Nhân sự đưa nội dung thương hiệu vào chương trình hội nhập).
- **Bài kiểm tra tình huống** (`quizzes`): loại câu hỏi: một lựa chọn, nhiều lựa chọn, chọn đúng logo (đáp án là hình), tìm lỗi trong một đoạn nội dung (người học chọn các câu sai), ghép thương hiệu với vai trò. Mỗi câu có giải thích bắt buộc và gắn thẻ chủ đề.
- **Chấm điểm:** thang 100; ngưỡng đạt 80; cho làm lại, lưu mọi lần; câu hỏi và đáp án xáo trộn.
- **Báo cáo:** tỷ lệ hoàn thành và đạt theo trung tâm, vai trò; câu hỏi sai nhiều nhất; xuất CSV cho Nhân sự. Quản lý trung tâm thấy trung tâm mình.
- **Học lại khi đổi lớn:** khi bộ chuẩn đổi phiên bản chính, người dùng được giao bài cập nhật ngắn **[NÊN CÓ]**.
- **Nhắc việc** qua thông báo (M7) trước hạn.

Ngân hàng câu hỏi do Marketing soạn (khởi đầu khoảng 30 câu); Phụ lục E nêu định dạng và bốn câu mẫu. Giai đoạn 2 đủ cho lộ trình đọc và một bài kiểm tra; các loại câu hỏi tương tác và báo cáo đầy đủ ở giai đoạn 3.

### 6.6 M7 - Phản hồi và thông báo

**Phản hồi** (`feedback`): bốn loại.

| Loại | Dùng khi | Gửi tới |
|---|---|---|
| `error` (báo lỗi) | Tài liệu, trang, hồ sơ trung tâm hoặc kết quả công cụ sai | Chủ nội dung của đối tượng bị báo; mặc định `admin` |
| `template_request` (đề xuất mẫu mới) | Cần một mẫu chưa có | Marketing |
| `design_request` (yêu cầu thiết kế) | Việc vượt khả năng tự làm trong công cụ | Marketing; **[CẦN XÁC NHẬN: hợp nhất với ghi nhận request hằng ngày đang dùng (Request Order) hay tạo kênh riêng]** |
| `question` | Hỏi về cách dùng chuẩn | Marketing |

Trạng thái: mới, đang xử lý, đã xử lý, từ chối (có lý do). Người gửi thấy tiến trình. Đo số yêu cầu để so với số liệu nền của quý I/2027 (chỉ số "giảm hỗ trợ thủ công").

**Thông báo** (`notifications`): sự kiện: có tài sản mới hoặc cập nhật ở thương hiệu đang theo dõi; tài sản bạn đã tải có bản mới; tài sản sắp hết hạn hoặc quá hạn rà soát (gửi chủ nội dung); tài sản bị gắn `needs_review` (gửi chủ nội dung); bài gửi duyệt có kết quả; có bài chờ bạn duyệt; được giao bài học; yêu cầu phản hồi của bạn có cập nhật. Kênh: trong ứng dụng và thư điện tử (bản tóm tắt hằng tuần, tắt được). Zalo OA **[SAU]**.

### 6.7 M8 - Quản trị người dùng và đo lường

**Quản trị:** mời người dùng, gán vai trò, trung tâm, thương hiệu phụ trách; khóa tài khoản; nhật ký kiểm toán (`audit_log`) mọi thao tác thay đổi nội dung và cấu hình.

**Bảng điều khiển (admin):**

| Nhóm | Chỉ số |
|---|---|
| Sức khỏe nội dung | Số tài sản theo trạng thái; tài sản không chủ; quá hạn rà soát; sắp hết hạn; `needs_review`; bộ chưa đầy đủ; thông điệp `proposed` chưa xác nhận; dữ kiện `pending` (bảng thiếu bằng chứng) |
| Tìm kiếm | Truy vấn nhiều nhất; truy vấn không có kết quả (20 đầu); truy vấn không được bấm; thời gian từ tìm đến mở tài sản |
| Mức áp dụng | Người dùng hoạt động theo trung tâm; tài liệu tải nhiều nhất; tỷ lệ trung tâm dùng công cụ; hoàn thành học và kiểm tra |
| Công cụ | Số lượt tạo theo công cụ và trung tâm; thời gian trung bình ra bài; tỷ lệ qua kiểm tra lần đầu; lỗi `block` hay gặp nhất; thời gian duyệt trung bình; tỷ lệ bài bị yêu cầu sửa |
| Kế hoạch nội dung | Kế hoạch tháng công bố đúng mốc hay trễ; tỷ lệ trung tâm đã mở kế hoạch; tỷ lệ mục `must` đã đăng đúng hạn theo trung tâm; mục bị bỏ qua và lý do; tỷ lệ bài bám kế hoạch và bài ngoài kế hoạch; phủ theo chặng hành trình và thương hiệu |
| Hành trình | Ô được bấm nhiều nhất; thẻ sản phẩm được mở; ô `needs_review`; ô `brand_confirmed = false` |
| Chi phí AI | Chi phí theo ngày, tháng, công cụ, trung tâm; so với hạn mức; lời gọi lỗi |

**Quy tắc đọc số liệu:** mọi trang báo cáo hiển thị chú thích "Các chỉ số này đo mức áp dụng, không dùng để kết luận hiệu quả kinh doanh hay tiến bộ học tập." Báo cáo xuất CSV. Nhật ký theo từng cá nhân chỉ `admin` thấy; quản lý trung tâm chỉ thấy số liệu gộp của trung tâm mình.

**Cấu hình:** mô hình AI, hạn mức, cờ tính năng, giữ dữ liệu (nhật ký tạo nội dung giữ 12 tháng **[CẦN XÁC NHẬN]**, nhật ký tìm kiếm 6 tháng), bảo trì.

### 6.8 M9 - Kế hoạch nội dung chung (Content Hub)

**Mục đích [BẮT BUỘC, bản gọn ở giai đoạn 1].** Mỗi tháng, Marketing HO chủ động đưa lên Brand Lab **kế hoạch nội dung toàn hệ thống cùng nguồn (source) đi kèm**. Các trung tâm coi đây là **nguồn chính thức** để bám theo khi truyền thông, nhờ đó cả hệ thống nói cùng một thông điệp, cùng thời điểm, cùng ưu đãi và cùng hình ảnh, thay vì mỗi nơi tự nghĩ rồi hỏi lẻ Marketing.

**Ranh giới với MKT OS.** MKT OS là nơi Marketing HO lập kế hoạch, giao việc, quản campaign nội bộ (bản nháp, công việc). Content Hub là **bản công bố chính thức hướng ra trung tâm**: chỉ những gì Marketing đã duyệt và công bố mới hiện cho nhân viên. Bản đầu **không** đồng bộ hai chiều: Marketing nhập hoặc nhập từ bảng tính vào Hub; MKT OS và Hub liên kết với nhau bằng đường dẫn ổn định (mục 8.4).

**Khớp nhịp điều phối hằng tháng** (cơ chế Brand Campaign do Giám đốc Khối R&D ban hành từ 08/2026; ngày cấu hình ở `cadence_milestones`, không viết cứng):

| Mốc | Nội dung theo cơ chế hiện hành | Vai trò của Content Hub |
|---|---|---|
| 01 | Họp thống nhất Brand Theme tháng với Ban Điều Hành | Marketing tạo "Kế hoạch tháng kế tiếp" ở trạng thái `draft` với chủ đề đã chốt |
| 02 (ngày 10) | Gửi email Brand Campaign bản nháp cho GĐKV | Ngoài Hub ở bản đầu (vẫn theo email); Hub chỉ lưu liên kết tài liệu nếu cần |
| 03 (ngày 15) | GĐKV gửi Brief chương trình bán hàng theo chủ đề | Ngoài Hub ở bản đầu; Marketing dùng làm đầu vào cho các mục kế hoạch |
| 04 (ngày 20) | Marketing ban hành Brand Kit chính thức cho trung tâm | **Công bố Kế hoạch nội dung chung của tháng kế tiếp cùng bộ nguồn tháng** (gói tài liệu ở M3). Trung tâm nhận thông báo và thấy bản xem trước |
| 05 (ngày 25) | Trung tâm gửi Content Plan về Marketing | **[NÊN CÓ, giai đoạn 3]** Trung tâm gửi kế hoạch địa phương ngay trên Hub, dựa trên kế hoạch chung |
| 06 (ngày 29) | Phê duyệt và triển khai Content Plan | **[NÊN CÓ, giai đoạn 3]** Duyệt kế hoạch địa phương; tháng mới bắt đầu theo kế hoạch đã công bố |

**[CẦN XÁC NHẬN, Q20]:** Hub thay thế hay chạy cạnh email và bảng tính ở các mốc 04 đến 06. Mặc định: chạy cạnh ở giai đoạn 1 (Marketing vẫn gửi thông báo qua kênh quen thuộc kèm đường dẫn Hub), chỉ thay thế khi trung tâm đã quen.

#### Đơn vị dữ liệu

- **Kế hoạch tháng** (`content_plans`): tháng, chủ đề (liên kết chiến dịch), mục tiêu, trạng thái `draft` → `in_review` → `published` → `closed`, phiên bản, nhật ký thay đổi.
- **Mục nội dung** (`plan_items`): một bài hoặc một đầu việc truyền thông có ngày. Gồm:
  - **Khi nào, ở đâu:** ngày đăng, khung giờ, số ngày chấp nhận được lệch (`window_days`), kênh (`channels`: fanpage, Zalo OA, TikTok, YouTube, hồ sơ Google, email, POSM tại điểm bán; danh sách cấu hình được), cờ `do_not_post_before` khi có hạn chế ("không đăng trước ngày...").
  - **Cái gì:** loại bài (`post_type`, Phụ lục C), thương hiệu, sản phẩm, **chặng hành trình** (mục 6.1.1), trụ nội dung, chiến dịch.
  - **Nội dung chủ:** thông điệp hoặc headline (tham chiếu ngân hàng thông điệp), `caption_master` có chỗ trống cho thông tin trung tâm (`{TEN_TRUNG_TAM}`, `{HOTLINE}`, `{DIA_CHI}`), hashtag, lời kêu gọi (`cta_library`), ưu đãi (loại, giá trị, điều kiện, hạn, tham chiếu `promo_policy`; **khóa**), dữ kiện đã dùng (`fact_ids`).
  - **Mức bắt buộc** (`obligation`): `must` (toàn hệ thống phải đăng, ví dụ chiến dịch thương hiệu), `recommended` (nên đăng), `optional` (tùy trung tâm; nguồn có sẵn).
  - **Phạm vi** (`audience_scope`): tất cả; theo thương hiệu hoặc sản phẩm (chỉ trung tâm đang cung cấp thấy, theo hồ sơ trung tâm, mục 3.3); theo khu vực; hoặc danh sách trung tâm.
  - **Nguồn đi kèm** (`plan_item_assets`): tài sản hoặc bộ tài liệu từ thư viện (M3): ảnh, video, mẫu thiết kế, tệp caption, POSM; đăng ký theo mô hình Drive-first (mục 6.4.1). Dán liên kết Drive khi nhập thì hệ thống đăng ký tài sản nháp để rà soát.
  - **Hướng dẫn cho trung tâm:** ghi chú (nên đăng giờ nào, lưu ý), phần được sửa (`editable_parts`: thường chỉ thông tin trung tâm, ảnh thật), phần **không được sửa** (`do_not_change`).
  - **Mẫu để làm bài:** mẫu thiết kế gợi ý (`template_id`) để mở thẳng trong Xưởng.
- **Bộ nguồn tháng:** một bộ tài liệu (mục 6.4) dựng từ mẫu bộ "Bộ nội dung tháng" (ví dụ: tóm tắt chủ đề, hình ảnh chủ đạo, gói caption, video, POSM, hỏi đáp tư vấn), tính độ đầy đủ như mọi bộ khác.
- **Lịch quay chụp và bàn giao nguồn** (`media_batches`) **[NÊN CÓ, giai đoạn 3]**: các đợt quay, chụp định kỳ (khoảng hai tuần một lần theo kế hoạch sản xuất media hiện hành), trạng thái `planned` → `shot` → `edited` → `delivered`; trung tâm thấy "nguồn mới sắp có" và biết khi nào tải được.

#### Trải nghiệm của trung tâm (`/plan`)

- **Màn hình chính "Tháng này của trung tâm bạn":** vòng tiến độ (số mục `must` đã đăng trên tổng), danh sách "Hôm nay", "Tuần này", "Sắp tới"; bộ lọc kênh, thương hiệu, trạng thái; hai chế độ xem lịch tháng và danh sách. Sau ngày công bố (mốc 04) có thêm tab "Tháng sau (xem trước)". Bản đầu chỉ hiện mục thuộc phạm vi trung tâm của người dùng.
- **Chi tiết mục:** đủ nội dung chính thức; nguồn tải về (qua M3); nút "Sao chép caption" (hệ thống điền sẵn thông tin trung tâm từ hồ sơ); nút "Làm bài trong Xưởng" (mở T01 hoặc T02 với dữ liệu điền sẵn, mục 5.7); nút "Đánh dấu đã đăng" (ngày, đường dẫn bài đăng nếu muốn); nút "Bỏ qua" với lý do chọn sẵn (không áp dụng; thiếu nguồn; lý do khác), bắt buộc với mục `must`.
- **Khi kế hoạch thay đổi sau công bố:** mỗi thay đổi tạo phiên bản mới (`plan_item_versions`). Trung tâm chưa đăng mục đó nhận thông báo và thấy so sánh "bản cũ khác bản mới ở đâu". Với mục `must`, trung tâm phải bấm xác nhận đã đọc. Mục bị hủy hiện gạch ngang kèm lý do. Nếu trung tâm đã đăng bản cũ, hệ thống nhắc "bản đã đăng khác bản mới" để tự quyết định sửa hay giữ.
- **Bài ngoài kế hoạch:** trung tâm vẫn được làm bài riêng bằng T01, T02; bản ghi tạo nội dung không gắn `plan_item_id`. Báo cáo hiển thị tỷ lệ bài bám kế hoạch và bài ngoài kế hoạch dưới dạng số liệu trung tính (không phải điểm đánh giá).
- **Thông báo (M7):** khi công bố kế hoạch; khi mục thay đổi hoặc hủy; nhắc trước hạn một ngày với mục `must` chưa đăng; bản tóm tắt đầu tuần cho nhân viên và quản lý trung tâm.

#### Trải nghiệm của Marketing HO (`/admin/plan`)

- **Tạo kế hoạch tháng:** chọn tháng và chủ đề; thêm mục bằng biểu mẫu hoặc **nhập từ bảng tính** (mẫu CSV hoặc XLSX ở Phụ lục H: kiểm tra giá trị, báo lỗi theo dòng, tạo mục ở trạng thái `draft`, ghi `plan_import_runs`); sao chép kế hoạch tháng trước; nhân bản mục; tạo chuỗi lặp (ví dụ chuyên mục hằng tuần). Cột của mẫu nhập đối chiếu với file lịch nội dung đang dùng của Marketing **[CẦN XÁC NHẬN, Q22]**.
- **Gắn nguồn:** chọn từ thư viện hoặc dán liên kết Drive; kiểm tra mọi mục `must` đều có nguồn.
- **Bảng cân bằng:** lịch tháng của HO có thêm bảng tỷ lệ theo bốn trụ nội dung, theo thương hiệu, theo kênh, và **bản đồ phủ theo hành trình** (chặng × thương hiệu, và theo line: tháng này chưa có nội dung cho chặng, line, thương hiệu nào) **[NÊN CÓ]**. Đây là chỗ hành trình (mục 6.1.1) và kế hoạch gặp nhau.
- **Kiểm tra trước khi công bố:** mỗi `caption_master`, headline, ưu đãi chạy qua Trình kiểm tra (mục 5.5); mọi thông điệp, dữ kiện, mẫu, logo, tài sản được tham chiếu phải `is_usable` vào ngày đăng. Không công bố được kế hoạch còn mục bị `block`, hoặc dùng nội dung `withheld`, `proposed`, dữ kiện `pending`, hoặc ưu đãi hết hạn trước ngày đăng.
- **Công bố hai bước:** `editor` gửi, `admin` công bố; kế hoạch tháng thuộc lớp `campaign` (mục 6.3). Công bố ghi phiên bản, thời điểm, người công bố; thông báo tới các trung tâm trong phạm vi.
- **Tình hình thực hiện** (`/plan/report`): tỷ lệ trung tâm đã mở kế hoạch; tỷ lệ mục `must` đã đánh dấu đăng đúng hạn theo trung tâm, theo tuần, theo mục; mục bị bỏ qua nhiều và lý do (thường chỉ ra thiếu nguồn); xuất CSV. Số liệu là **tự khai của trung tâm**, bản đầu không tự kiểm tra bài đã lên fanpage thật; kiểm tra đường dẫn bài là **[SAU]**. Báo cáo mang chú thích mục 6.7: đo mức áp dụng, không kết luận hiệu quả kinh doanh.

#### Liên kết với các module khác

- **Xưởng (M4):** nút "Làm bài trong Xưởng" điền sẵn loại bài, thương hiệu, sản phẩm, mẫu, thông điệp, ưu đãi (khóa), caption chủ; người dùng chỉ điền phần địa phương (thông tin trung tâm đã tự điền, chọn ảnh thật). Bản ghi tạo nội dung lưu `plan_item_id`.
- **Duyệt bài (mục 5.10):** bài dựng từ mục kế hoạch mà **không sửa phần khóa** có thể được duyệt nhanh hoặc tự động theo cấu hình, vì nội dung đã được duyệt ở cấp kế hoạch. Mặc định: áp dụng khi bài không dùng ảnh tải lên riêng và không có chữ do người dùng nhập ngoài khe cho phép. **[CẦN XÁC NHẬN, Q21.]**
- **Thư viện (M3):** bộ nguồn tháng và nguồn từng mục là tài sản trong thư viện, theo vòng đời và hiệu lực chung; tải qua máy chủ (mục 6.4.1).
- **Hành trình và Thẻ sản phẩm (mục 6.1.1):** mỗi mục kế hoạch gắn chặng và sản phẩm; Thẻ sản phẩm hiện "nội dung tháng này"; trang chặng hiện nội dung tháng này theo chặng.
- **Tri thức (M5) và lan truyền thay đổi (mục 4.2):** thông điệp hoặc dữ kiện đổi phiên bản, ưu đãi hết hạn, tài sản hết hiệu lực thì mục kế hoạch tham chiếu tự gắn `needs_review` và thông báo Marketing; mục đã công bố chuyển trạng thái cảnh báo để Marketing quyết định đổi hoặc hủy.
- **Tìm kiếm (mục 7.5):** tìm được mục kế hoạch đã công bố trong phạm vi người dùng.

#### Phân quyền

| Hành động | admin | editor | brand_owner | approver | staff | backoffice |
|---|---|---|---|---|---|---|
| Tạo, sửa kế hoạch tháng và mục ở `draft` | X | X | C (đề xuất cho thương hiệu được gán) | - | - | - |
| Công bố, sửa, hủy mục sau công bố | X | C (gửi, admin công bố) | - | - | - | - |
| Xem kế hoạch đã công bố thuộc phạm vi | X | X | X | X | X (phạm vi trung tâm mình) | - |
| Đánh dấu đã đăng, bỏ qua | - | - | - | - | X (trung tâm mình) | - |
| Xem tình hình thực hiện | X | X | - | - | C (quản lý: trung tâm mình) | - |

**Tiêu chí hoàn thành M9:**

- Marketing nhập 30 mục từ file mẫu trong không quá 15 phút; lỗi hiển thị theo từng dòng và sửa được trước khi tạo.
- Nhân viên trung tâm A chỉ thấy mục thuộc phạm vi trung tâm A (kiểm thử RLS theo vai trò); kế hoạch `draft` hoặc `in_review` không lọt tới nhân viên.
- Đổi một mục đã công bố: trong vòng một phút, các trung tâm chưa đăng mục đó nhận thông báo và thấy so sánh phiên bản.
- Đổi hoặc thay thế một thông điệp đang được dùng trong ba mục kế hoạch: cả ba mục hiện `needs_review` trong vòng một phút; kế hoạch không công bố được khi còn mục bị chặn.
- "Làm bài trong Xưởng" mở đúng công cụ với dữ liệu điền sẵn khớp mục kế hoạch (kiểm thử đầu cuối); phần khóa không sửa được.
- Báo cáo thực hiện khớp số đánh dấu của trung tâm; xuất CSV đúng.
- Trên điện thoại 360 px, trung tâm xem "Hôm nay" và đánh dấu đã đăng trong không quá 3 lần bấm.

---

## 7. MÔ HÌNH DỮ LIỆU

Cơ sở dữ liệu PostgreSQL (qua Supabase). Quản lý bằng migration trong repo. Tên bảng và cột dùng tiếng Anh, `snake_case`. Dưới đây là mô hình khái niệm đủ để Claude Code sinh migration; được phép bổ sung cột phụ trợ khi cần, không được bỏ các cột và ràng buộc nêu ở đây.

### 7.1 Quy ước chung

- Khóa chính `id uuid default gen_random_uuid()`. Mọi bảng có `created_at`, `updated_at` (múi giờ `timestamptz`); bảng nội dung có `created_by`.
- Cột chung cho thực thể nội dung có vòng đời: `status content_status`, `layer content_layer`, `effective_from date`, `effective_to date`, `owner_id uuid`, `review_due date`, `needs_review boolean default false`.
- Kiểu liệt kê (enum): `user_role` (admin, editor, staff, backoffice, guest); `content_status` (draft, in_review, proposed, effective, withheld, superseded, expired, archived); `content_layer` (core, creative, campaign); `evidence_status` (verified, pending, retired); `visibility` (public, internal_only); `vimi_level` (primary, selective, limited); `severity` (block, warn, info); `submission_status` (pending, approved, changes_requested, rejected).
- Xóa mềm cho nội dung (không xóa cứng); bản cũ luôn truy hồi được cho `admin`.
- Cột "Gđ" là giai đoạn cần có bảng (mục 9).

### 7.2 Các bảng

**Người dùng và tổ chức**

| Bảng | Cột chính | Gđ |
|---|---|---|
| `profiles` | `id` (= `auth.users.id`), `full_name`, `role`, `center_id`, `job_title`, `is_approver`, `is_center_manager`, `active` | 0 |
| `centers` | `code`, `name_display`, `region`, `address`, `hotline`, `email`, `opening_hours`, `zalo_oa_url`, `facebook_url`, `google_profile_url`, `active` | 0 |
| `center_brands` | `center_id`, `brand_id`, `product_id` (tùy chọn): thương hiệu, sản phẩm trung tâm cung cấp | 0 |
| `brand_owners` | `user_id`, `brand_id`, `product_id` (tùy chọn): chủ chuyên môn | 0 |

**Thương hiệu, sản phẩm, tri thức**

| Bảng | Cột chính | Gđ |
|---|---|---|
| `brands` | `slug`, `name_public`, `name_short`, `kind` (parent, member), `domain` (system, language, study_career), `delivery` (offline, online, mixed), `parent_id`, `role_summary`, `vimi_level`, `color_primary`, `color_secondary`, `voice_profile jsonb` (persona, do[], dont[]), `deprecated_names text[]`, `release_status`, `release_condition`, `not_before date`, `layer`, `sort` | 0 |
| `products` | `code` (ví dụ `ESL_KIDS`), `brand_id`, `brand_confirmed bool`, `name`, `description`, `audience text[]` (kids, parents, teens, adults, teachers), `formats text[]` (offline, online, hybrid, mooc), `lifecycle`, `category`, `kpi_owner`, `status` | 0 |
| `product_facts` | `brand_id`, `product_id`, `kind` (feature, outcome, condition, proof, schedule_policy, price_policy), `statement`, `value jsonb`, `evidence_status`, `evidence_ref`, `public_ok bool`, `verified_by`, `verified_at`, `expires_at` | 1 |
| `messages` | `brand_id` (rỗng nếu cấp hệ thống), `kind` (tagline, key_message, headline, campaign_slogan, intro, cta, story), `text`, `explainer`, `usage_notes`, `visibility`, `evidence_owner_id`, `release_condition`, `not_before`, `version`, `supersedes_id`, chuẩn chung của nội dung | 1 |
| `pillars` | `key`, `label`, `guiding_sentence`, `examples` (bốn trụ nội dung) | 1 |
| `post_types` | `key`, `label`, `fields_schema jsonb`, `requires_real_photo bool`, `ai_visual_allowed bool`, `requires_approval bool`, `sign_off_tagline bool`, `checker_profile` | 2 |
| `content_formats` | `key`, `label`, `constraints jsonb` | 2 |
| `cta_library` | `brand_id`, `text`, `status` | 2 |
| `decision_trees` | `key`, `tree jsonb`, `version`, `status` (trình chọn logo) | 1 |

**Trang nội dung và chuẩn**

| Bảng | Cột chính | Gđ |
|---|---|---|
| `guideline_sets` | `slug`, `title`, `audience_roles text[]`, `version`, `status`, `effective_from`, `effective_to`, `changelog` | 1 |
| `pages` | `slug`, `kind` (brand_hub, guideline), `set_id`, `parent_id`, `title`, `audience_roles text[]`, `sort`, `current_version_id` | 1 |
| `page_versions` | `page_id`, `version`, `blocks jsonb`, `status`, `effective_from`, `change_note`, `author_id`, `published_by`, `published_at` | 1 |

**Thư viện**

| Bảng | Cột chính | Gđ |
|---|---|---|
| `assets` | `code` (duy nhất), `title`, `type`, `brand_id`, `product_id`, `audience text[]`, `campaign_id`, `tags text[]`, `description`, `usage_notes`, `do_not_use_for`, `editable_parts`, `current_version_id`, `search_tsv`, chuẩn chung của nội dung | 1 |
| `asset_versions` | `asset_id`, `version` (ví dụ `1.0`), `status`, `effective_from`, `effective_to`, `change_note`, `published_by` | 1 |
| `asset_files` | `asset_version_id`, `file_kind` (drive, external_url), `role` (primary, source, preview, guide), `format`, `mime_type`, `size_bytes`, `drive_file_id`, `drive_revision_id` (bản sửa đã ghim), `drive_md5`, `drive_modified_time` (lúc ghim), `drive_in_official_tree bool`, `drive_url`, `external_url` (cho liên kết không phải Drive, ví dụ video đăng nơi khác; không kiểm tra phiên bản), `download_mode` (proxy, redirect), `link_status` (ok, drift, missing, trashed, no_access, unchecked), `last_checked_at`, `thumb_paths text[]` (bucket `thumbs`), `render_cache_path` (rỗng nếu không thuộc nhóm dựng ảnh), `render_cache_md5` | 1 |
| `drive_config` | `shared_drive_id`, `official_root_folder_id`, `draft_root_folder_id`, `proxy_max_mb`, `render_cache_max_mb`, `sync_interval_hours`, `service_account_can_pin bool` (một dòng cấu hình, sửa được trong trang quản trị) | 1 |
| `logo_variants` | `asset_file_id`, `brand_id`, `variant` (full, symbol, wordmark, with_tagline, endorsed_lockup), `bg` (positive, reversed), `legal_review` (cleared, pending) | 1 |
| `photo_meta` | `asset_id`, `usage_rights`, `source`, `rights_expiry`, `has_people`, `people_consent`, `center_id`, `event` | 1 |
| `bundle_templates` | `name`, `slots jsonb` (key, label, required, allowed_types) | 1 |
| `bundles` | `slug`, `title`, `brand_id`, `product_id`, `template_id`, `status`, `description` | 1 |
| `bundle_items` | `bundle_id`, `asset_id`, `slot_key`, `sort` | 1 |
| `campaigns` | `slug`, `title`, `season`, `date_from`, `date_to`, `theme` | 1 |
| `dependencies` | `from_type`, `from_id`, `to_type` (message, fact, logo_variant, rule_set, brand), `to_id`, `to_version` | 1 |
| `downloads` | `user_id`, `asset_version_id`, `asset_file_id`, `mode` (proxy, redirect), `drive_revision_id`, `result` (ok, failed), `at` | 1 |
| `search_logs` | `user_id`, `query`, `filters jsonb`, `result_count`, `clicked_asset_id`, `time_to_click_ms`, `at` | 1 |
| `search_synonyms` | `term`, `synonyms text[]` | 1 |

**Hành trình khách hàng** (mục 6.1.1; thay cho bảng `product_journeys` ở bản 0.1; cấu trúc theo bản 0.4: có `journey_lines`)

| Bảng | Cột chính | Gđ |
|---|---|---|
| `journey_stages` | `key`, `age_label`, `title`, `lead_product`, `decider`, `outcomes jsonb`, `note`, `sort`, chuẩn chung của nội dung | 1 |
| `journey_lines` | `key`, `label`, `description`, `kind` (primary, secondary, goal_tier), `color_proposed`, `sublanes jsonb` (cột con của Line 1), `sort` | 1 |
| `journey_lanes` | `key`, `label`, `line_key`, `sort` (cột con của Line 1; có thể gộp vào `journey_lines.sublanes`) | 1 |
| `journey_nodes` | `code`, `line_key`, `stage_key`, `lane_key`, `kind` (level, exam, support_product, product, program_header, branch_label, goal_group, gap_note), `brand_id`, `product_name`, `item_name`, `duration_text`, `description`, `group_code` (Juniors, Prep, hoặc mã nhóm đích), `stage_span text[]` (ô trải nhiều chặng, ví dụ K-12), `attach_to`, `row_hint`, `timed_notes jsonb` (văn bản, `valid_from`, `valid_to`, `needs_confirm`), `brand_confirmed bool`, `decision_pending bool`, `verify_note`, `brand_note`, `sort`, chuẩn chung | 1 |
| `journey_node_products` | `node_id`, `product_id` (một ô có thể ứng với nhiều mã sản phẩm; mã gợi ý lấy từ `product_code_hints` trong seed, chủ sản phẩm xác nhận) | 1 |
| `journey_edges` | `from_node_id`, `to_node_id`, `kind` (sequence, side, side_group, branch, b2g_link, same_program, ea_link, zh_link), `label`, `proposed bool` (nét đứt, chưa xác nhận), `two_way bool` | 1 |

**Kế hoạch nội dung chung** (mục 6.8)

| Bảng | Cột chính | Gđ |
|---|---|---|
| `content_plans` | `month` (`YYYY-MM`, duy nhất), `title`, `theme`, `campaign_id`, `objectives`, `status` (draft, in_review, published, closed), `version`, `published_at`, `published_by`, `changelog` | 1 |
| `plan_items` | `plan_id`, `code` (dạng `2027-02-014`), `publish_date`, `time_slot`, `window_days`, `do_not_post_before`, `channel`, `post_type`, `brand_id`, `product_id`, `journey_stage_key`, `pillar_key`, `campaign_id`, `obligation` (must, recommended, optional), `audience_scope jsonb`, `headline_message_id`, `caption_master`, `hashtags`, `cta_id`, `offer jsonb`, `fact_ids uuid[]`, `center_notes`, `editable_parts`, `do_not_change`, `template_id`, `status` (draft, ready, cancelled), `needs_review`, `version`, `checker_result jsonb`, `sort` | 1 |
| `plan_item_assets` | `plan_item_id`, `asset_id` hoặc `bundle_id`, `role` (visual, video, template, doc, source) | 1 |
| `plan_progress` | `plan_item_id`, `center_id`, `user_id`, `status` (not_started, in_progress, posted, skipped), `skip_reason`, `posted_at`, `posted_url`, `generation_id`, `acknowledged_version`, `updated_at` | 1 |
| `plan_import_runs` | `plan_id`, `file_name`, `row_count`, `ok_count`, `errors jsonb`, `by`, `at` | 1 |
| `plan_item_versions` | `plan_item_id`, `version`, `snapshot jsonb`, `change_note`, `changed_by`, `at` (để hiển thị so sánh phiên bản) | 2 |
| `cadence_milestones` | `key` (m01 đến m06), `label`, `day_of_month`, `description`, `owner_role`, `enabled` (khởi tạo từ cơ chế điều phối hiện hành) | 1 |
| `channels` | `key`, `label`, `enabled` | 1 |
| `media_batches` | `date`, `theme`, `status` (planned, shot, edited, delivered), `bundle_id`, `note` | 3 |
| `center_plan_items` (kế hoạch địa phương, mốc 05 và 06) | thiết kế chi tiết ở giai đoạn 3 | 3 |

**Quy tắc, mẫu, công cụ**

| Bảng | Cột chính | Gđ |
|---|---|---|
| `rule_sets` | `kind` (content_rules, design_language, ecosystem_rules), `title`, `body_md`, `version`, `status`, `effective_from`, `source_file` | 1 |
| `checker_rules` | `code` (duy nhất), `scope`, `applies_to`, `severity`, `kind` (term_list, regex, fn, llm), `params jsonb`, `message_vi`, `fix_hint_vi`, `enabled`, `version`, `test_cases jsonb` | 2 |
| `promo_policy` | `min_pct`, `max_pct`, `approver_level`, `note`, `effective_from`, `status` | 2 |
| `prompt_templates` | `key`, `body`, `version`, `status` | 2 |
| `templates` | `code`, `name`, `format`, `spec jsonb`, `svg_source_asset_id`, `brand_scope uuid[]`, `post_types text[]`, `audience text[]`, `status`, `version`, `preview_file_id` | 2 |
| `release_gates` | `key`, `description`, `condition_text`, `not_before`, `target_type`, `target_id`, `cleared bool` | 1 |
| `feature_flags` | `key`, `value jsonb`, `note` (gồm `vimi_enabled`, `trademark_clear`, `ai_enabled`) | 0 |
| `change_requests` | `target_type`, `target_id`, `layer`, `business_problem`, `item_to_change`, `reason`, `transition_cost`, `recognition_plan`, `approval_ref`, `approval_date`, `status`, `requested_by`, `decided_by` | 1 |

**AI và nội dung do công cụ tạo**

| Bảng | Cột chính | Gđ |
|---|---|---|
| `ai_models` | `purpose`, `provider`, `model_id`, `params jsonb`, `fallback_order`, `enabled` | 2 |
| `ai_quotas` | `scope` (user, center, global), `scope_id`, `period` (day, month), `limit_type` (text_calls, image_calls, cost), `limit_value` | 2 |
| `ai_usage_log` | `user_id`, `center_id`, `purpose`, `provider`, `model_id`, `tokens_in`, `tokens_out`, `cost_estimate`, `duration_ms`, `result`, `at` | 2 |
| `generations` | `user_id`, `center_id`, `tool_key`, `plan_item_id` (rỗng nếu bài ngoài kế hoạch), `post_type`, `template_id`, `input jsonb`, `context_snapshot jsonb` (phiên bản quy tắc, mã dữ kiện, mã thông điệp đã dùng), `text_outputs jsonb`, `image_files jsonb`, `ai_disclosure bool`, `consent_confirmed bool`, `promo jsonb` (loại, giá trị, cấp phê duyệt đã xác nhận), `checker_result jsonb`, `status`, `created_at` | 2 |
| `submissions` | `generation_id`, `submitted_by`, `center_id`, `status`, `reviewer_id`, `reviewed_at`, `comment` | 2 |
| `jobs` | `type`, `payload`, `status`, `attempts`, `result`, `run_after` (cho sinh ảnh bất đồng bộ, nhắc việc, quét hết hạn) | 2 |

**Học, phản hồi, thông báo, kiểm toán**

| Bảng | Cột chính | Gđ |
|---|---|---|
| `learning_paths` | `role`, `title`, `steps jsonb` | 2 |
| `reading_progress` | `user_id`, `page_id`, `page_version_id`, `read_at` | 1 |
| `quizzes`, `quiz_questions`, `quiz_attempts` | bài (ngưỡng đạt), câu (loại, nội dung, lựa chọn, đáp án, giải thích, thẻ chủ đề), lượt làm (điểm, câu trả lời, đạt hay không) | 2 |
| `feedback` | `user_id`, `kind`, `target_type`, `target_id`, `body`, `status`, `assignee_id`, `resolution` | 1 |
| `notifications`, `follows` | thông báo trong ứng dụng; theo dõi thương hiệu, tài sản, bộ | 2 |
| `audit_log` | `actor_id`, `action`, `entity_type`, `entity_id`, `diff jsonb`, `at` | 0 |

### 7.3 Chính sách bảo mật mức hàng (RLS) và hàm dùng chung

- Bật RLS trên **mọi** bảng. Không bảng nào dùng chính sách "cho phép tất cả".
- Hàm `is_usable(status, effective_from, effective_to, not_before)` và các view `v_usable_assets`, `v_usable_messages`, `v_usable_facts`, `v_usable_templates` (mục 4.2). Người dùng thường chỉ đọc qua view; cấm đọc bảng gốc trừ vai trò `editor`, `admin`, `brand_owner` (theo phạm vi).
- `staff` đọc/ghi `generations` và `submissions` của chính mình; quản lý trung tâm đọc tổng hợp của trung tâm mình; `approver` đọc `submissions` ở trạng thái chờ và đã xử lý; `admin` đọc tất cả.
- `product_facts`: `brand_owner` chỉ chuyển `verified` cho thương hiệu và sản phẩm được gán.
- `content_plans`, `plan_items`: nhân viên chỉ đọc qua view `v_plan_items_for_center` (kế hoạch `published`, mục không `draft`, đúng phạm vi `audience_scope` của trung tâm người dùng, đúng thời điểm hiển thị); `draft` và `in_review` chỉ `editor`, `admin`. `plan_progress`: nhân viên ghi cho trung tâm của mình; quản lý trung tâm đọc tổng hợp trung tâm mình; `admin`, `editor` đọc tất cả.
- `journey_*`: người dùng thường đọc qua view chỉ gồm bản `is_usable` và ẩn `verify_note`, `brand_note`, `timed_notes.needs_confirm`; `editor`, `admin` đọc đủ.
- Mọi lời gọi AI và dựng ảnh đi qua tầng máy chủ dùng khóa dịch vụ (service role); trình duyệt không có quyền ghi vào `generations` trực tiếp.
- Tệp gốc nằm trên Drive và chỉ được lấy qua máy chủ bằng tài khoản dịch vụ: `proxy` truyền luồng sau khi kiểm tra quyền; `redirect` chỉ sau khi kiểm tra quyền và ghi `downloads`. Trình duyệt chỉ nhận liên kết Drive (chế độ `redirect`) sau khi qua kiểm tra quyền; ở chế độ `proxy` trình duyệt không bao giờ thấy `drive_file_id`.
- Các bucket Storage đều riêng tư. `thumbs` truy cập bằng liên kết ký ngắn hạn (10 phút) sau khi kiểm tra quyền xem tài sản; `render_cache` chỉ máy chủ đọc; `generations` chỉ chủ bài và người duyệt đọc.
- Khóa tài khoản dịch vụ Google chỉ nằm ở biến môi trường phía máy chủ, không ghi log, không đi vào lỗi trả về trình duyệt.
- Có bộ kiểm thử RLS tự động chạy theo từng vai trò (mục 8.7).

### 7.4 Bộ quy tắc khởi tạo và nạp dữ liệu

Script seed **idempotent** (chạy lại nhiều lần không nhân đôi dữ liệu), chạy theo thứ tự:

1. `brands`, `products` (Phụ lục A), `centers` (từ `seed/centers.csv`), `feature_flags` (`vimi_enabled=false`, `trademark_clear=false`, `ai_enabled=true`).
2. Nền tảng thương hiệu: trích từ docx theo tiêu đề mục vào `pages`, `page_versions`, `messages`, `pillars` (trạng thái `proposed` hoặc `draft` cho đến khi Ban Giám Đốc phê duyệt và Bộ chuẩn 1.0 ban hành).
3. `product_facts` ở trạng thái `pending` cho các mục "bằng chứng cần bổ sung" của hồ sơ (bảng thiếu bằng chứng).
4. `release_gates` (mục 4.2), `cadence_milestones`, `channels`.
5. `checker_rules` (Phụ lục B), `post_types` (Phụ lục C), `cta_library` (Phụ lục D), `promo_policy`.
6. `rule_sets` từ hai file quy tắc Marketing (nếu có).
7. `bundle_templates` (mục 6.4, gồm mẫu "Bộ nội dung tháng"), `decision_trees` (trình chọn logo), `learning_paths` khởi tạo.
8. `journey_*` từ `seed/journey.json` (Phụ lục G), trạng thái `proposed` cho đến khi Marketing và R&D xác nhận danh sách `verify_list`; mã sản phẩm gợi ý đưa vào `journey_node_products` với cờ chưa xác nhận.

Kiểm thử "đối chiếu nguồn": một test so sánh nội dung đã seed với văn bản trích từ docx (bỏ định dạng), báo lỗi nếu lệch. Với hành trình: so sánh `journey_*` đã seed với `seed/journey.json` và văn bản trích từ file PDF nguồn.

### 7.5 Tìm kiếm

- Postgres full-text search với `unaccent` và cấu hình `simple`; thêm `pg_trgm` cho lỗi gõ nhẹ. Tìm không phân biệt dấu và hoa thường.
- Phạm vi tìm kiếm gồm cả **thẻ sản phẩm và ô hành trình** (tìm "flyers", "ielts 5.0" thì cuộn tới ô) và **mục kế hoạch đã công bố** trong phạm vi người dùng, ngoài tài sản.
- `assets.search_tsv` gộp có trọng số: tiêu đề và mã (A), tên thương hiệu, sản phẩm, nhãn (B), mô tả, ghi chú dùng (C). Cập nhật bằng trigger.
- Mở rộng từ đồng nghĩa từ `search_synonyms` (khởi tạo: "khai giảng" = "tuyển sinh"; "poster" = "áp phích"; "sale kit" = "bộ tư vấn" = "tài liệu tư vấn"; "standee" = "bảng đứng"). Danh sách do chủ sản phẩm duyệt và bổ sung dần từ các truy vấn không có kết quả.
- Xếp hạng: chỉ `is_usable`; điểm văn bản, cộng điểm khớp thương hiệu đang chọn, cộng điểm mới cập nhật. Có phân nhóm kết quả và số đếm theo bộ lọc.
- Ghi `search_logs` để cải thiện (truy vấn không kết quả là đầu vào bổ sung nhãn và từ đồng nghĩa).
- Tìm theo ngữ nghĩa bằng vector là **[SAU]** (giai đoạn 4, phục vụ T08).

---

## 8. KIẾN TRÚC KỸ THUẬT

### 8.1 Công nghệ đề xuất

Đây là đề xuất mặc định phù hợp với hệ công cụ người dùng đã quen (Claude Code, Supabase, Vercel). Claude Code được phép đổi một thành phần nếu nêu lý do bằng văn bản và giữ các ràng buộc ở cuối mục.

| Lớp | Đề xuất |
|---|---|
| Giao diện | Next.js (App Router), TypeScript chế độ nghiêm ngặt, Tailwind CSS, shadcn/ui, react-hook-form kèm zod, TanStack Query |
| Máy chủ | Route Handlers và Server Actions của Next.js; logic nghiệp vụ trong thư mục `lib/` tách khỏi lớp giao diện |
| Cơ sở dữ liệu | PostgreSQL (Supabase), migration bằng Supabase CLI |
| Xác thực | Supabase Auth: thư điện thoại kèm mật khẩu hoặc liên kết đăng nhập; Google OAuth nếu công ty dùng Google Workspace; chỉ mời, giới hạn tên miền |
| Kho tệp gốc | Google Drive (Shared Drive của VMG), truy cập qua Google Drive API v3 bằng tài khoản dịch vụ (service account), gói trong `lib/drive/`. Phạm vi quyền cần dùng: `drive` (cần để ghim bản sửa); trình bao bọc chỉ cho phép các hàm đọc siêu dữ liệu, tải nội dung, tải bản sửa cụ thể, và ghim bản sửa |
| Lưu trữ nhỏ | Supabase Storage, bucket riêng tư, **chỉ ba bucket**: `thumbs` (ảnh thu nhỏ), `render_cache` (bản làm việc cho bộ dựng ảnh), `generations` (kết quả công cụ và ảnh người dùng đưa vào công cụ, tự xóa sau 90 ngày). Không có bucket chứa tệp gốc của thư viện |
| Tác vụ nền | Bảng `jobs` cùng bộ chạy định kỳ (cron của nền tảng triển khai hoặc `pg_cron`): sinh ảnh bất đồng bộ, nhắc việc, quét hết hạn và quá hạn rà soát, gửi bản tóm tắt tuần |
| Dựng ảnh | SVG kèm rasterize phía máy chủ (Satori với resvg, hoặc `sharp` kèm bộ dựng SVG); font TTF nhúng |
| Xuất PDF | `pdf-lib` hoặc dựng từ SVG; lề xén và dấu cắt |
| Nén ZIP | Không dùng ở bản đầu (mục 6.4). Nếu làm sau: `archiver` dạng luồng từ Drive, không lưu tạm |
| AI | SDK chính thức của nhà cung cấp, sau lớp Cổng AI (mục 5.4) |
| Thư điện tử | Dịch vụ gửi thư giao dịch **[CẦN XÁC NHẬN: dịch vụ nào, địa chỉ gửi]** |
| Giám sát lỗi | Sentry hoặc tương đương |
| Triển khai | Vercel (khuyến nghị, vùng Singapore cho gần người dùng). Nếu công ty muốn triển khai chung nền tảng đang dùng cho công cụ nội bộ khác, kiểm tra trước khả năng chạy máy chủ Next.js và hạn mức tệp **[CẦN XÁC NHẬN]** |
| Phân tích sử dụng | Tự ghi vào cơ sở dữ liệu; không dùng công cụ theo dõi bên thứ ba |

**Ràng buộc bắt buộc giữ nguyên dù đổi công nghệ:** (0) tệp gốc thư viện ở Drive, Brand Lab chỉ giữ liên kết, siêu dữ liệu và ảnh thu nhỏ (mục 6.4.1); (1) RLS trên mọi bảng; (2) bộ dựng ảnh xác định, giống nhau giữa xem trước và xuất; (3) khóa API chỉ phía máy chủ; (4) mô hình AI lấy từ cấu hình, không hardcode; (5) nội dung thương hiệu nằm trong cơ sở dữ liệu, không nằm trong mã; (6) hàm `is_usable` là nơi duy nhất quyết định "dùng được hôm nay".

### 8.2 Cấu trúc kho mã gợi ý

```
brand-lab/
  app/                      # trang và route (theo mục 4.1)
  components/               # thành phần giao diện dùng chung
  lib/
    ai/                     # Cổng AI, adapter nhà cung cấp, context builder
    checker/                # Trình kiểm tra, các hàm quy tắc 'fn'
    render/                 # Bộ dựng mẫu SVG, vừa chữ, tương phản
    content/                # is_usable, dependency, versioning
    drive/                  # Mọi thao tác Google Drive: đăng ký, ghim, tải, đồng bộ, kiểm tra liên kết
    search/
    auth/
  supabase/
    migrations/
    seed/                   # script seed idempotent
  seed/                     # CSV và JSON do chủ sản phẩm cung cấp
  docs/
    source/                 # file nguồn (mục 0.2)
    OPEN_QUESTIONS.md
    DECISIONS.md            # nhật ký quyết định kỹ thuật
  tests/
    unit/ rls/ e2e/ visual/
  .env.example
```

### 8.3 Biến môi trường (`.env.example`)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (chỉ máy chủ), `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` (chỉ máy chủ), `DRIVE_SHARED_DRIVE_ID`, `DRIVE_OFFICIAL_ROOT_ID`, `DRIVE_DRAFT_ROOT_ID`, `DOWNLOAD_PROXY_MAX_MB` (mặc định 50), `RENDER_CACHE_MAX_MB` (mặc định 500), `GENERATION_RETENTION_DAYS` (mặc định 90), `APP_BASE_URL`, `ALLOWED_EMAIL_DOMAINS`, `AI_TEXT_PROVIDER`, `ANTHROPIC_API_KEY`, `AI_IMAGE_PROVIDER`, `AI_IMAGE_API_KEY`, `EMAIL_API_KEY`, `EMAIL_FROM`, `SENTRY_DSN`, `CRON_SECRET`. Mọi khóa chỉ có giá trị mẫu rỗng trong repo. **Không commit khóa thật.**

### 8.4 Tích hợp

| Hệ thống | Cách tích hợp | Giai đoạn |
|---|---|---|
| Marketing OS (MKT OS) | `campaigns` dùng chung mã chiến dịch; task trong MKT OS có thể gắn liên kết tới tài sản, mục kế hoạch hoặc kết quả công cụ qua URL ổn định (`/library/assets/[code]`, `/plan/items/[id]`, `/studio/history/[id]`); API đọc tối thiểu cho MKT OS. Không đồng bộ hai chiều ở bản đầu: Marketing nhập kế hoạch vào Hub hoặc nhập từ bảng tính (Phụ lục H) | 1 (liên kết), 4 (API) |
| Website và sale kit | API đọc (chỉ đọc, chỉ dữ liệu `effective`) của hành trình khách hàng để website mới và sale kit dùng cùng một nguồn **[SAU]** | 4 |
| Google Drive (kho tệp gốc) | Theo mục 6.4.1: đăng ký tài sản, ghim bản sửa, tải qua máy chủ, đồng bộ và kiểm tra liên kết mỗi 6 giờ, nhập hàng loạt từ thư mục. Cần Shared Drive, một tài khoản dịch vụ được thêm vào Shared Drive, và bật Drive API | 0 (thiết lập), 1 (dùng) |
| Kênh nhóm duyệt hiện có | Gói gửi duyệt dạng văn bản sao chép; tích hợp thông báo tự động khi xác định được kênh | 2, 4 |
| Zalo OA | Thông báo; **không** đăng bài tự động | SAU |
| Đăng nhập một lần công ty | Google Workspace OAuth nếu phù hợp | 1 |

### 8.5 Yêu cầu phi chức năng

| Hạng mục | Yêu cầu |
|---|---|
| Hiệu năng | Trang đầu dưới 2,5 giây (4G trung bình); ảnh thu nhỏ hiện dưới 1 giây; tải tệp qua `proxy` bắt đầu dưới 3 giây (tệp 50 MB); tìm kiếm dưới 500 ms; sinh văn bản dưới 15 giây; dựng ảnh từ mẫu dưới 5 giây; sinh ảnh nền AI dưới 60 giây (bất đồng bộ) |
| Sẵn sàng | 99% trong giờ làm việc; sao lưu cơ sở dữ liệu hằng ngày, lưu 30 ngày; tệp gốc ở Drive có kế hoạch sao lưu riêng (Q19); các bucket nhỏ có thể dựng lại từ Drive (`thumbs`, `render_cache`) |
| Thiết bị | Điện thoại là chính (Chrome, Safari hai phiên bản gần nhất); máy tính để quản trị. Kiểm thử trên trình duyệt tích hợp trong ứng dụng Zalo, nơi tải tệp có thể bị hạn chế: nếu phát hiện, hiển thị hướng dẫn "Mở bằng trình duyệt" |
| Truy cập | Tương phản tối thiểu 4,5:1; vùng chạm tối thiểu 44 px; thao tác bàn phím được ở máy tính; có nhãn cho ảnh |
| Ngôn ngữ và định dạng | Chỉ tiếng Việt. Chuỗi giao diện nằm trong một tệp từ điển. Ngày `dd/mm/yyyy`, múi giờ `Asia/Ho_Chi_Minh`, tiền `1.000.000 đ` |
| Đặt tên tệp tải về | Tài sản: `VMG_{thuonghieu}_{ma-tai-san}_{phienban}.{duoi}`; ảnh công cụ: `VMG_{trungtam}_{loaibai}_{yyyymmdd}_{so}.png` (không dấu, không khoảng trắng) |

### 8.6 Bảo mật và dữ liệu cá nhân

- Mã hóa khi truyền (HTTPS) và khi lưu (mặc định của nền tảng). Giới hạn tần suất gọi API; bảo vệ CSRF; kiểm tra loại và dung lượng tệp đăng ký và tệp người dùng đưa vào công cụ; tệp tải tạm từ Drive để sinh thumbnail xóa ngay sau khi xử lý; quét mã độc nếu nền tảng hỗ trợ.
- Brand Lab **không lưu dữ liệu cá nhân của học viên hoặc khách hàng**. Dữ liệu cá nhân duy nhất: họ tên, email, vai trò, trung tâm của nhân viên. Trình kiểm tra có quy tắc phát hiện số điện thoại, email, số định danh lạ trong nội dung công khai (ngoài hồ sơ trung tâm).
- Ảnh có người, nhất là trẻ em: bắt buộc cờ xác nhận đã có đồng ý sử dụng hình ảnh (của phụ huynh với trẻ em), lưu cùng bản ghi tạo nội dung. **[CẦN XÁC NHẬN với đầu mối pháp lý: mẫu văn bản đồng ý, thời hạn lưu, và quy định bảo vệ dữ liệu cá nhân áp dụng.]**
- Khi gọi AI không gửi dữ liệu cá nhân; ưu tiên cấu hình không lưu trữ dữ liệu phía nhà cung cấp nếu có. Quyền sử dụng thương mại đối với nội dung do AI tạo ra phụ thuộc điều khoản từng nhà cung cấp; ghi lại nhà cung cấp và phiên bản điều khoản được chấp nhận **[CẦN XÁC NHẬN với đầu mối pháp lý]**. Hồ sơ đã nêu cần rà soát quyền sử dụng thương mại của nhạc tạo bằng AI; cùng nguyên tắc áp dụng cho ảnh.
- Nhật ký kiểm toán không xóa được. Khóa tài khoản có hiệu lực ngay.

### 8.7 Kiểm thử và chất lượng

| Loại | Nội dung bắt buộc |
|---|---|
| Đơn vị | `is_usable` (mọi tổ hợp trạng thái và ngày); Trình kiểm tra: golden test (3 câu đúng, 3 câu sai mỗi quy tắc); Context Builder (so khớp ảnh chụp lời nhắc dựng được, không gọi AI); vừa chữ; phân giải `logo_ref` |
| RLS | Bộ kiểm thử theo từng vai trò chứng minh: `staff` không đọc được nháp, không đọc được bài của người khác; `approver` đọc được bài chờ duyệt; `brand_owner` chỉ sửa đúng thương hiệu được gán; `backoffice` không thấy tài sản không gắn nhãn backoffice |
| Drive | Lớp bao `lib/drive/` có bản mô phỏng (mock) dùng trong CI; kiểm thử: đăng ký tệp, ghim bản sửa, phát hiện lệch, tệp bị xóa, mất quyền, vượt hạn mức (không bị hiểu nhầm là mất tệp), tệp ngoài cây `_CHINH_THUC` bị từ chối xuất bản, tải `proxy` đúng bản sửa đã ghim. Một nhóm kiểm thử "khói" chạy tay với Shared Drive thử |
| Đầu cuối (Playwright) | Luồng T01 trọn vẹn trên khung 360 px; duyệt và yêu cầu sửa; tìm và tải bộ tài liệu; đổi một thông điệp thì tài sản phụ thuộc có cờ; nội dung `withheld` không lọt ra công cụ |
| Hành trình và kế hoạch | Bản đồ vẽ đủ 61 ô, 5 line và 51 đường nối từ seed (14 đường đề xuất vẽ nét đứt); ô `brand_confirmed=false` hoặc `decision_pending=true` không xuất hiện trong lựa chọn của T01, T02; đường nối `proposed` không được dùng để sinh câu nối hệ sinh thái; nhập 30 mục từ file mẫu và báo lỗi theo dòng; RLS phạm vi trung tâm; đổi thông điệp thì mục kế hoạch hiện `needs_review`; thay đổi mục đã công bố tạo phiên bản và thông báo; kế hoạch có mục bị chặn không công bố được |
| Hình ảnh | Ảnh chuẩn từng mẫu với chuỗi thử có dấu chồng tầng và chuỗi cực dài |
| AI | Mọi bài kiểm thử dùng mô phỏng (mock); riêng một nhóm kiểm thử "khói" nhỏ chạy tay có đánh dấu, gọi AI thật, kiểm tra kết quả qua Trình kiểm tra |
| Nội dung | Đối chiếu nguồn (mục 7.4) |
| CI | Kiểm tra kiểu, lint, kiểm thử, chạy thử migration trên cơ sở dữ liệu trống, triển khai xem trước cho mỗi nhánh |

### 8.8 Quy ước lập trình

TypeScript chặt, cấm `any`; kiểm tra dữ liệu bằng zod tại mọi ranh giới (biểu mẫu, API, đầu ra AI); danh mục mã lỗi thống nhất (`TEXT_OVERFLOW`, `FACT_NOT_VERIFIED`, `QUOTA_EXCEEDED`, `CHECK_BLOCKED`...) với thông báo tiếng Việt thân thiện; ghi quyết định kỹ thuật quan trọng vào `docs/DECISIONS.md`; commit nhỏ, mô tả rõ.

**Những điều Claude Code không được làm:** đưa khóa thật hoặc dữ liệu cá nhân vào repo; tạo dữ liệu mẫu giả giống thật (tên học viên, số liệu kết quả, số điện thoại trông như thật); tự đặt số liệu thương hiệu (số năm, số học viên, tỷ lệ...); gọi AI thật trong kiểm thử tự động; lưu tệp gốc của thư viện vào Supabase Storage; để lộ khóa tài khoản dịch vụ Google; gọi Drive trực tiếp ngoài `lib/drive/`; dựng ảnh bằng cách tải từ Drive tại thời điểm dựng thay vì dùng `render_cache`; sửa nội dung seed lớp lõi; xuất bản nội dung thương hiệu mới ra môi trường dành cho nhân viên khi chưa có phê duyệt (mục 9.1).

---

## 9. GIAI ĐOẠN TRIỂN KHAI

### 9.1 Nguyên tắc

- Brand Lab được xây và thử trong môi trường kiểm thử với dữ liệu ở trạng thái nháp. **Không phát hành nội dung thương hiệu mới cho nhân viên trước khi Ban Giám Đốc phê duyệt Nền tảng thương hiệu** (dự kiến 11/2026) và ban hành Bộ chuẩn 1.0 (dự kiến 01/2027). Hệ thống trạng thái ở mục 4.2 cho phép nạp sẵn nội dung ở `draft` hoặc `proposed` rồi chuyển `effective` đúng ngày hiệu lực.
- Phương án và dự toán Brand Lab trình Ban Giám Đốc trong tháng 12/2026. Spec này là cơ sở cho phương án (A) tự xây nội bộ.
- Thứ tự giai đoạn đặt thư viện và chuẩn trước, công cụ AI sau, khớp tinh thần Kế hoạch (trợ lý AI và tự tạo hình chỉ mở khi thư viện vận hành tốt). Mốc thời gian dưới đây là **khung đối chiếu** với lộ trình mục 10.3 của Kế hoạch, không ràng buộc nếu tiến độ thực tế khác.

### 9.2 Các giai đoạn

| Gđ | Tên | Phạm vi | Khung thời gian đối chiếu |
|---|---|---|---|
| 0 | Nền móng | Kho mã, môi trường, CI, Supabase, xác thực mời, vai trò và RLS nền, token giao diện, hồ sơ trung tâm, `audit_log`, `feature_flags`, khung seed; **thiết lập Google Drive: Shared Drive, cấu trúc `_NHAP` và `_CHINH_THUC`, tài khoản dịch vụ, `lib/drive/` kèm bản mô phỏng** | Q4/2026 |
| 1 | Thư viện và Chuẩn (bản đầu) | M1 Brand Hub; M2 Chuẩn thương hiệu (trang, vai trò, trình chọn logo, changelog); M3 Thư viện (loại tài sản, siêu dữ liệu, đăng ký từ Drive, ghim phiên bản, thumbnail, tải qua máy chủ, kiểm tra sức khỏe liên kết, phiên bản, bộ tài liệu, tìm kiếm); **M1 Hành trình khách hàng và Thẻ sản phẩm (bản đồ vẽ từ dữ liệu, ngăn xem nhanh, trang chặng, thẻ sản phẩm, quản trị hành trình); M9 bản gọn (kế hoạch tháng, mục nội dung, nhập từ bảng tính, gắn nguồn từ M3, công bố, xem theo phạm vi trung tâm, đánh dấu đã đăng, thông báo cơ bản)**; M5 quản trị cơ bản (thương hiệu, sản phẩm, dữ kiện, thông điệp, trang, tài sản, hồ sơ thay đổi lớp lõi); M7 báo lỗi; M8 người dùng, nhật ký, báo cáo sức khỏe nội dung và tìm kiếm | 01-03/2027 |
| 2 | Xưởng | Cổng AI, hạn mức; Context Builder; Trình kiểm tra và bộ quy tắc khởi tạo; T01 (mẫu dựng bằng mã nguồn), T02, T03; hệ mẫu và bộ dựng ảnh; duyệt bài (gồm duyệt nhanh bài bám kế hoạch); thông báo; **M9: "Làm bài trong Xưởng" từ mục kế hoạch, kiểm tra bằng Trình kiểm tra trước khi công bố, so sánh phiên bản khi đổi sau công bố, nhắc việc**; M6 lộ trình đọc và một bài kiểm tra; áp dụng tại hai trung tâm | 04-06/2027 |
| 3 | Mở rộng | T04 độc lập, T05, T06, T07 (ảnh nền AI), trình nhập mẫu từ SVG, M6 đầy đủ, M8 báo cáo công cụ và chi phí AI, phòng thử quy tắc, xuất PDF trang chuẩn, **M9 báo cáo thực hiện đầy đủ, bản đồ phủ theo hành trình, kế hoạch địa phương (mốc 05 và 06), lịch quay chụp và bàn giao nguồn, xuất bản đồ hành trình và "Đi theo hành trình"**, mở cho các trung tâm còn lại | 07-09/2027 |
| 4 | Nâng cao | T08 hỏi đáp có dẫn nguồn (RAG), T09 ảnh AI toàn bộ thử nghiệm, kiểm tra ảnh bằng thị giác máy, liên kết MKT OS, thông báo Zalo, chia sẻ có hạn cho đối tác, tìm kiếm ngữ nghĩa | Q4/2027 trở đi, theo kết quả nghiệm thu |

### 9.3 Tiêu chí hoàn thành từng giai đoạn

**Giai đoạn 0:** triển khai được bản trắng lên môi trường kiểm thử; đăng nhập theo lời mời; bộ kiểm thử RLS chạy xanh cho các vai trò; migration chạy lại từ trống thành công; tài khoản dịch vụ đọc được siêu dữ liệu và tải được một tệp thử trong Shared Drive.

**Giai đoạn 1 (nghiệm thu theo Kế hoạch mục 10.4):**

- Nhân viên thử tìm, tải và dùng được các tài liệu thường dùng; **ít nhất 90% tác vụ thử tìm được bản có hiệu lực trong tối đa 2 phút**.
- **100% bộ tài liệu trong phạm vi** (bộ ưu tiên đầu tiên) có đủ tệp, hướng dẫn, ngày hiệu lực, chủ nội dung.
- Bản hết hiệu lực không xuất hiện trong kết quả mặc định (kiểm thử tự động xanh).
- Hành trình khách hàng đạt các tiêu chí ở mục 6.1.1; Marketing công bố được ít nhất một kế hoạch tháng thử và hai trung tâm xem đúng phạm vi (tiêu chí M9, mục 6.8, phần giai đoạn 1).
- Các kiểm thử Drive ở mục 6.4 (lệch, xóa, ghim bản sửa, tải đúng bản đã ghim) xanh; trang "Sức khỏe liên kết" hoạt động.
- Nội dung Brand Hub khớp nguồn từng ký tự; cổng phát hành hoạt động (kiểm thử `withheld`, `proposed`).
- Đổi một thông điệp thì tài sản phụ thuộc có cờ `needs_review`.

**Giai đoạn 2:**

- T01 đạt các tiêu chí ở mục 5.7; T02 đạt mục 5.8; Trình kiểm tra có bộ quy tắc khởi tạo cùng kiểm thử golden đầy đủ.
- Hai trung tâm áp dụng trước dùng thật trong ít nhất 4 tuần; có số liệu thời gian ra bài, tỷ lệ qua kiểm tra lần đầu, thời gian duyệt trung bình; có danh sách vấn đề và đã xử lý các vấn đề chặn.
- Chi phí AI trong hạn mức; hạn mức và công tắc ngắt khẩn cấp đã thử.
- Ít nhất một chu kỳ tháng chạy trọn trên Hub tại hai trung tâm: Marketing công bố ở mốc 04, trung tâm bám theo, có báo cáo thực hiện; ghi nhận số mục bị bỏ qua và lý do để cải thiện nguồn.

**Giai đoạn 3:** các công cụ mới đạt tiêu chí riêng; ít nhất 90% người học đạt từ 80/100 ở bài kiểm tra tình huống trước chiến dịch hè (chỉ tiêu của Kế hoạch); báo cáo mức áp dụng theo trung tâm dùng được.

**Giai đoạn 4:** theo đề án riêng sau nghiệm thu giai đoạn 3.

### 9.4 Đầu vào cần từ chủ sản phẩm (Marketing) theo giai đoạn

Phần lớn nút thắt của Brand Lab là **nội dung và dữ liệu**, không phải mã nguồn. Chuẩn bị song song:

| Cần cho | Đầu vào | Người chuẩn bị |
|---|---|---|
| Gđ 0 | Danh sách trung tâm và dữ liệu liên hệ (`seed/centers.csv`); tên miền email; chọn nền tảng triển khai; **Shared Drive "VMG Brand Library" cùng cây thư mục `_NHAP` và `_CHINH_THUC`, quyền sửa giới hạn trong Marketing, thêm tài khoản dịch vụ (Claude Code hướng dẫn tạo), bật Drive API** | Marketing, Vận hành |
| Gđ 1 | **File Hành trình khách hàng bản chốt cùng danh sách xác nhận (Phụ lục G); kế hoạch nội dung của ít nhất một tháng (đủ để nhập thử) kèm nguồn trên Drive; mẫu cột lịch nội dung đang dùng; danh sách kênh truyền thông áp dụng**; File logo nguồn (vector) mọi thương hiệu, bản positive và reversed; màu CMYK, Pantone của thương hiệu thành viên; ánh xạ sản phẩm với thương hiệu (Phụ lục A); chủ nội dung của từng thương hiệu; bộ ưu tiên đầu tiên (các tệp thật); 30 tác vụ thử tìm kiếm; 12 tình huống thử trình chọn logo | Marketing, R&D |
| Gđ 1 | Xác nhận bằng chứng cho các dữ kiện `pending` (hoặc chấp nhận khóa) | Chủ chuyên môn |
| Gđ 2 | Hai file quy tắc (nội dung, ngôn ngữ thiết kế); mẫu thiết kế SVG cho ít nhất 6 loại bài; thư viện ảnh có quyền sử dụng và có đồng ý; bộ quy chuẩn VIMI và THE INK; ma trận phê duyệt khuyến mại hiện hành; bản đồ chặng học; chọn nhà cung cấp ảnh AI; kênh nhóm duyệt; hai trung tâm áp dụng trước | Marketing, Vận hành, R&D, Pháp lý |
| Gđ 3 | Ngân hàng khoảng 30 câu hỏi tình huống; mẫu in và khổ in chuẩn; mẫu bộ tư vấn có khe thay thế | Marketing |

---

## 10. RỦI RO VÀ ĐIỀU CẦN CHỐT

### 10.1 Rủi ro chính

| # | Rủi ro | Biện pháp trong spec |
|---|---|---|
| R1 | AI sinh chữ tiếng Việt sai dấu, vẽ sai logo, bịa thông tin | Dựng ảnh bằng mã nguồn; AI không vẽ chữ và logo; Trình kiểm tra; ràng buộc dữ kiện (mục 5.2, 5.5) |
| R2 | Thiếu bằng chứng và dữ kiện đã xác nhận, công cụ chỉ chạy được phần khung | Bảng thiếu bằng chứng; khóa câu nói chưa có nguồn; kế hoạch xác nhận theo giai đoạn (mục 9.4) |
| R3 | Trung tâm đang bận nhiều việc nên không dùng công cụ | Ưu tiên điện thoại, dưới 3 phút ra bài, điền sẵn từ hồ sơ, gợi ý mẫu; đo thời gian ra bài; áp dụng trước tại hai trung tâm |
| R4 | Thư viện chết dần vì không ai cập nhật | Chủ nội dung bắt buộc; ngày rà soát; nhắc việc; báo cáo sức khỏe nội dung; tính công cập nhật vào kế hoạch vận hành |
| R5 | Logo thay đổi do kết luận nhãn hiệu | Logo là dữ liệu có phiên bản, mẫu tham chiếu `logo_ref`; cờ `trademark_clear`; cảnh báo khi xuất in số lượng lớn |
| R6 | Phạm vi quá lớn (năm mục đích tương đương năm sản phẩm) | Chia giai đoạn; thư viện, chuẩn, hành trình và kế hoạch nội dung bản gọn trước; công cụ AI sau; mỗi giai đoạn có tiêu chí hoàn thành |
| R7 | Chi phí AI vượt kiểm soát | Hạn mức theo người, trung tâm, toàn hệ thống; công tắc ngắt; chi phí ghi từng lượt; công cụ dựng từ mẫu vẫn chạy khi hết hạn mức AI |
| R8 | Quyền sử dụng ảnh người, ảnh AI, nhạc AI | Cờ đồng ý bắt buộc; khóa ảnh AI cho loại bài "người thật"; ghi nguồn gốc; chờ ý kiến pháp lý |
| R9 | Nội dung chưa được phê duyệt bị phát hành sớm | Hệ thống trạng thái và cổng phát hành; không xuất bản ra nhân viên trước phê duyệt (mục 9.1) |
| R10 | Kế hoạch trình Ban Giám Đốc đang mô tả Brand Lab hẹp hơn spec (xem 10.3) | Cập nhật câu chữ mục 10 của Kế hoạch trước khi trình tháng 12/2026 |
| R11 | Nhiều thương hiệu và sản phẩm chưa ánh xạ chắc chắn (SAT, VSTEP, K-12, B2G, e-Academy, khảo thí, FlexTrack) | Cờ `brand_confirmed`; không dùng công cụ tạo nội dung cho sản phẩm chưa xác nhận thương hiệu |
| R12 | Phụ thuộc vào một người quản trị | Tối thiểu hai `admin`; nhật ký kiểm toán; tài liệu quyết định kỹ thuật |
| R13 | Chọn Drive-first: tệp bị sửa, xóa, đổi quyền trên Drive; Drive gián đoạn hoặc hết hạn mức; bản sửa đã ghim bị Drive dọn | Shared Drive; quyền sửa `_CHINH_THUC` chỉ nhóm nhỏ; ghim `keepForever`; so `md5` và `modifiedTime` mỗi 6 giờ; trạng thái `link_status`; thumbnail và `render_cache` giúp phần xem và dựng ảnh vẫn chạy; sao lưu `_CHINH_THUC` (Q19) |
| R14 | Trung tâm không dùng kế hoạch chung vì vẫn nhận nội dung qua email, nhóm chat; hoặc Marketing không đưa lên đúng nhịp | Hub thay dần kênh cũ (Q20); thông báo kèm đường dẫn Hub; nguồn luôn đủ ở mục `must`; chỉ số công bố đúng mốc 04; bản gọn ở giai đoạn 1 để Marketing làm được trong thời gian thực tế |
| R15 | Hành trình hiển thị cam kết hoặc ánh xạ thương hiệu chưa xác nhận (IE1 đến IE7, SAT, VSTEP, EPlus, FlexTrack, thương hiệu và tuổi các khóa e-Academy, K-12, Tiếng Trung lớp 3-12, đường nối đề xuất; số cam kết khác nhau giữa danh mục và hành trình) | Cờ `brand_confirmed`, `verify_note`, `timed_notes`; không hiển thị cam kết đầu ra khi chưa thống nhất; `status = proposed` cho đến khi xác nhận (mục 6.1.1, Q23) |

### 10.2 Điều cần chốt (ghi vào `docs/OPEN_QUESTIONS.md`)

| # | Câu hỏi | Đề xuất mặc định | Chặn giai đoạn |
|---|---|---|---|
| Q1 | Tên miền email và có đăng nhập Google Workspace không | Mời qua email, giới hạn tên miền, thêm Google khi có | 0 |
| Q2 | Nền tảng triển khai: Vercel hay nền tảng đang dùng cho công cụ nội bộ | Vercel, vùng Singapore | 0 |
| Q3 | Giấy phép font thương hiệu (gốc "Brown") để dùng trong ứng dụng và dựng ảnh phía máy chủ | Dùng Arial kèm font hỗ trợ dấu cho đến khi có giấy phép | 2 |
| Q4 | Mã màu UpLearn, EduNext; màu in CMYK, Pantone của thương hiệu thành viên | Lấy từ file logo nguồn | 1 |
| Q5 | Tên gọi thống nhất của VMP trên mọi kênh ("VMP", "VMG Global Pathways" hay "VMP - VMG Global Pathways") | Theo bảng 4.1 hồ sơ: "VMP - VMG Global Pathways"; tên còn lại vào `deprecated_names` sau khi chốt | 1 |
| Q6 | Bố cục dấu bảo chứng VMG đặt cạnh logo thương hiệu thành viên | Chờ Bộ chuẩn 1.0 | 1 |
| Q7 | Ánh xạ thương hiệu cho sản phẩm chưa có trong hồ sơ rebrand (Phụ lục A) | Xuất CSV gợi ý để chủ sản phẩm xác nhận | 1 |
| Q8 | Chủ chuyên môn (người xác nhận bằng chứng) cho từng thương hiệu | Do Marketing và R&D chỉ định | 1 |
| Q9 | Nhà cung cấp ảnh AI; chính sách ghi nhãn "ảnh minh họa"; có dùng ảnh AI hay không | Chỉ ảnh nền, không người như thật; ghi nhãn theo quyết định công ty | 3 |
| Q10 | Kênh nhóm duyệt hiện tại và mong muốn tích hợp | Gói gửi duyệt sao chép; duyệt trong ứng dụng ở giai đoạn 2 | 2 |
| Q11 | Ma trận phê duyệt khuyến mại hiện hành | Giá trị khởi tạo ở mục 5.11, đối chiếu lại | 2 |
| Q12 | Chặng học tiếp theo của từng sản phẩm dùng cho "liên kết hệ sinh thái" | Lấy từ đường nối của Hành trình khách hàng (Phụ lục G) sau khi R&D và Marketing xác nhận; chưa xác nhận thì tắt liên kết cho ô đó | 2 |
| Q13 | Hạn mức và ngân sách AI hằng tháng | Đề xuất sau 4 tuần đo thực tế ở giai đoạn 2 | 2 |
| Q14 | Chính sách lưu nhật ký (12 tháng) và văn bản đồng ý hình ảnh; điều khoản sử dụng nội dung AI | Hỏi đầu mối pháp lý | 2 |
| Q15 | Yêu cầu thiết kế: hợp nhất với Request Order hiện có hay kênh riêng | Kênh riêng đơn giản, liên kết sau | 1 |
| Q16 | Có chấp nhận thay quy trình ảnh mặc định của trung tâm (từ công cụ AI bên ngoài sang dựng bằng mã nguồn) | Có; giữ T09 làm chế độ thử nghiệm | 2 |
| Q17 | Nhân viên các trung tâm dùng email Google Workspace của VMG hay email cá nhân; công ty đã có Google Workspace và Shared Drive chưa | Mặc định mọi tải qua `proxy`, nên không cần cấp quyền Drive cho nhân viên; chỉ video lớn dùng `redirect` | 0 |
| Q18 | Cho tài khoản dịch vụ quyền ghi (Contributor) trên `_CHINH_THUC` để ghim bản sửa `keepForever`, hay chỉ quyền đọc | Cho quyền Contributor, trình bao bọc chỉ gọi hàm đọc và ghim; nếu không đồng ý thì tắt ghim và chỉ dựa vào phát hiện lệch (`service_account_can_pin = false`) | 0 |
| Q19 | Sao lưu thư mục `_CHINH_THUC` ra ngoài Drive (chu kỳ, nơi lưu) và chấp nhận ngoại lệ `render_cache` (bản sao nhỏ trong Supabase) | Chấp nhận `render_cache` tối đa 500 MB; sao lưu hằng tháng vào một ổ lưu trữ khác của công ty | 1 |
| Q20 | Hub thay thế hay chạy cạnh email và bảng tính ở các mốc 04 đến 06 của cơ chế điều phối hằng tháng; ai công bố; GĐKV có cần thấy bản xem trước trên Hub không | Chạy cạnh ở giai đoạn 1 (kèm đường dẫn Hub), thay dần khi trung tâm quen; `admin` công bố; GĐKV nhận vai trò xem | 1 |
| Q21 | Bài dựng từ mục kế hoạch mà không sửa phần khóa có được duyệt nhanh hoặc tự động | Có, khi không dùng ảnh tải lên riêng và không có chữ ngoài khe cho phép; còn lại vẫn qua nhóm duyệt | 2 |
| Q22 | Cột của file lịch nội dung đang dùng (Master Content & Media, Campaign Master); mức bắt buộc áp dụng cho loại nội dung nào; danh sách kênh | Dùng mẫu cột ở Phụ lục H, chỉnh theo file thật khi nhận được; `must` chỉ cho chiến dịch thương hiệu | 1 |
| Q23 | Hành trình khách hàng: R&D xác nhận IE1 đến IE7 (band, thời lượng, cam kết); thương hiệu của SAT, VSTEP, EPlus, FlexTrack, B2G; mã màu thương hiệu; thống nhất cam kết đầu ra giữa danh mục sản phẩm và hành trình; ai duyệt thay đổi cấu trúc hành trình | Giữ `proposed` và ẩn cam kết đầu ra cho đến khi xác nhận; thay đổi cấu trúc thuộc lớp `core` | 1 |
| Q24 | Ngày dùng tên VMT trên truyền thông bên ngoài và có thiết kế nhận diện riêng hay không | Giữ cổng `vmt_public_name` đóng; dùng "dịch vụ khảo thí" ở nội dung công khai cho đến khi có quyết định | 2 |
| Q25 | **VMG e-Academy** có là thương hiệu thành viên chính thức không (file Nền tảng 4.1 chưa có): tên, màu, logo, cách đặt cạnh VMG English và VMG IELTS. Tên "IELTS LAB" của e-Academy có trùng "THE IELTS LAB" trong đề án VMG IELTS 2026-2027 không. Tuổi các khóa Juniors và Prep; K-12 (tên mới của A01-D01) có gồm tiểu học không | Seed `vmg-e-academy` ở trạng thái đề xuất, `brand_confirmed = false`, không cho chọn trong T01, T02; thêm vào kiến trúc thương hiệu bằng hồ sơ thay đổi lớp `core` sau khi chốt | 1 |
| Q26 | Các **đường nối đề xuất** (nét đứt) và **lộ trình Tiếng Trung lớp 3-12**: ai xác nhận, quyết định mở rộng danh mục tiếng Trung lớp 3-12 của Ban Giám Đốc, e-Academy "cùng chương trình" với bản offline, cross-sell B2G sang trung tâm | Hiển thị nét đứt có chú giải "đề xuất"; không dùng đường nối đề xuất cho nội dung; ô lớp 3-12 mang nhãn "chờ Ban Giám Đốc quyết định" | 1 |

### 10.3 Điểm không khớp cần xử lý ngoài mã nguồn

1. **Mục 10.2 của Kế hoạch triển khai** đang viết: bản đầu là thư viện có cấu trúc, còn "trợ lý AI, tự tạo hình hoặc video là giai đoạn sau, chỉ mở khi thư viện vận hành tốt". Spec này đưa công cụ sản xuất (T01, T02, T03) thành một trong bốn mục đích cốt lõi. Hai cách xử lý: (a) giữ nguyên thứ tự giai đoạn của spec (thư viện trước, công cụ sau) và chỉnh câu chữ mục 10 để Ban Giám Đốc thấy đủ bốn mục đích với lộ trình rõ; hoặc (b) giữ nguyên Kế hoạch và coi công cụ là hạng mục tách riêng. Nên chọn (a) và chỉnh Kế hoạch trước khi trình tháng 12/2026 để phạm vi phê duyệt khớp với phạm vi xây.
2. **Dự toán Brand Lab** hiện chưa nằm trong 299,75 triệu đồng và sẽ trình riêng. Phần chi phí AI theo lượt và hạn mức (mục 5.11) cần được đưa vào dự toán vận hành.
3. **Tên "Brand Lab"** cùng lúc là thư viện nội bộ (hồ sơ) và là xưởng công cụ (spec). Thống nhất cách gọi khi trình: "VMG Brand Lab gồm Thư viện, Chuẩn, Hành trình khách hàng, Kế hoạch nội dung chung và Xưởng công cụ".
4. **Tên VMT.** File Hành trình khách hàng dùng "VMT" cho dịch vụ khảo thí; hồ sơ Nền tảng (mục 4.1) và danh mục sản phẩm (cột KPI Owner ghi OSIR) vẫn dùng cách gọi cũ hoặc ghi "tên chính thức chưa công bố". Cập nhật hai hồ sơ này và quyết định ngày dùng tên VMT công khai (Q24).
5. **Số liệu cam kết đầu ra.** Danh mục sản phẩm ghi NextGen IELTS cam kết 5.5 và 6.5, IELTS Express "từ 0 lên 6.0 trong một năm"; Hành trình khách hàng chia NextGen theo cấp 4.0, 5.0, 6.0, 7.0 và IELTS Express thành IE1 đến IE7 (band 4.0 đến 6.5+, mỗi cấp 3 tháng 36 giờ). R&D cần thống nhất một bộ số trước khi đưa vào nội dung (Q23).
6. **Phạm vi lịch nội dung.** Kế hoạch triển khai mục 10 chưa mô tả kế hoạch nội dung chung trong Brand Lab, và spec bản 0.1 đã xếp lịch nội dung vào MKT OS. Bản 0.3 đưa bản công bố chính thức vào Brand Lab (M9) và giữ MKT OS cho lập kế hoạch và giao việc nội bộ. Cần ghi rõ ranh giới này khi trình Ban Giám Đốc và với người phụ trách MKT OS.
7. **Bản cập nhật hành trình 20/10/2026.** (a) B2G quay lại hành trình sau khi bản 15/10/2026 loại ra; các ghi chú đã lưu trước đây "B2G không thuộc hành trình" không còn đúng. (b) VMG e-Academy chưa có trong file Nền tảng thương hiệu (4.1) và danh mục sản phẩm: cần bổ sung hai hồ sơ này hoặc bỏ khỏi hành trình (Q25). (c) K-12 thay A01-D01 và chỉ triển khai trên e-Academy; danh mục sản phẩm còn mã `A01-D01_*`, cần R&D cập nhật. (d) Lộ trình Tiếng Trung lớp 3-12 chưa có trong danh mục sản phẩm. (e) Con số B2G (hơn 200 trường, khoảng 42.000 học sinh) chưa gắn chương trình. (f) Kế hoạch triển khai mục 10 và Nền tảng mục 4 chưa nhắc line e-Academy và tầng đích.

---

## PHỤ LỤC A. DỮ LIỆU KHỞI TẠO: THƯƠNG HIỆU VÀ SẢN PHẨM

### A.1 Thương hiệu

Nguồn: Nền tảng, bảng 4.1 và mục 6.2, 6.3. Mã màu là màu hiển thị số lấy từ tài sản hiện có; quy cách màu in, vùng bảo vệ logo, kiểu chữ xác nhận theo file nguồn của Bộ nhận diện khi ban hành bộ chuẩn.

| `slug` | `name_public` | `kind` | `domain` | `delivery` | `vimi_level` | Màu | Trạng thái và ghi chú |
|---|---|---|---|---|---|---|---|
| `vmg` | VMG (tên mô tả: Hệ thống Giáo dục và Đào tạo Việt Mỹ) | parent | system | mixed | selective (theo ngữ cảnh) | `#BE202F`, `#8B672A` | Tagline "Dẫn Lối Tương Lai" (kế thừa). Dòng mô tả logo mới "NGOẠI NGỮ - DU HỌC - HƯỚNG NGHIỆP" có hiệu lực theo Bộ chuẩn 1.0; phần hình chờ kết luận nhãn hiệu |
| `vmg-english` | VMG English | member | language | offline | primary | đỏ `#BE202F` | Giữ logo hiện hữu có chữ ENGLISH; ngang cấp VMG IELTS; trọng tâm trẻ em và phụ huynh |
| `vmg-ielts` | VMG IELTS | member | language | mixed | selective | đỏ `#BE202F` | Thương hiệu hiện hữu `effective`. Thông điệp chương trình mới (CORE, THE IELTS LAB) `withheld`: chỉ phát hành sau nghiệm thu (dự kiến 03/2027); `not_before = 2027-03-01` **và** phải được `admin` gỡ cổng thủ công |
| `vmg-tesol` | VMG TESOL | member | language | mixed | limited | xanh `#012A9E` | Giữ logo nền xanh, không ép đổi sang đỏ; nêu đúng đơn vị cấp chứng nhận |
| `vmg-chinese` | VMG Tiếng Trung | member | language | mixed | selective | đỏ (hệ màu đỏ của lĩnh vực Ngoại ngữ) | Luyện thi HSK thuộc thương hiệu này |
| `vmp` | VMP - VMG Global Pathways | member | study_career | offline | limited | xanh lam `#29338D`, cam `#F69220` | Hai tuyến Du học, Du học nghề. Tên gọi thống nhất trên mọi kênh **[CẦN XÁC NHẬN, Q5]** |
| `uplearn` | UpLearn by VMG | member | language | online | limited | tím **[CẦN XÁC NHẬN mã]** | Nền tảng học ngoại ngữ chuyên ngành; khóa của thương hiệu khác phân phối qua UpLearn giữ tên và nhận diện của khóa |
| `edunext` | EduNext | member | language | online | limited | **[CẦN XÁC NHẬN mã]** | Tiếng Anh trực tuyến cho giáo viên bộ môn khác; logo riêng, đặt cùng dấu bảo chứng VMG |
| `vmg-e-academy` | VMG e-Academy (**đề xuất, chưa có trong Nền tảng**) | member (đề xuất) | language | online | limited | xanh ngọc (đề xuất, chưa có mã chính thức) | Line 2 trên hành trình: học trực tuyến có giáo viên, nhóm Juniors và Prep. `status = proposed`, `brand_confirmed = false`; không cho chọn trong T01, T02 cho đến khi xác nhận (Q25) |
| `vmt` | VMT (dịch vụ khảo thí; slug cũ `testing` đổi thành `vmt`) | member | language | mixed | limited | không có (ô khảo thí trên hành trình: nền trắng viền vàng) | Tên VMT dùng nội bộ và trong Hành trình khách hàng. Chưa thiết kế nhận diện. Cổng `vmt_public_name` chưa mở: nội dung công khai dùng cách gọi trung tính "dịch vụ khảo thí" (Q24) |

`voice_profile` của từng thương hiệu nạp từ bảng "Một nhân cách chung, sắc thái theo từng thương hiệu" (Nền tảng 3.6) và cặp Nên và Tránh (3.6).

### A.2 Ánh xạ sản phẩm với thương hiệu (gợi ý, cần chủ sản phẩm xác nhận)

Claude Code sinh `seed/products.csv` từ `VMG_Product_Portfolio_2026.md` (mỗi mã sản phẩm một dòng; không gõ lại bằng tay), điền `brand_slug` gợi ý theo bảng dưới và `brand_confirmed` theo cột cuối. Chủ sản phẩm rà soát tệp trước khi nạp.

| Nhóm mã sản phẩm | Thương hiệu gợi ý | `brand_confirmed` | Ghi chú |
|---|---|---|---|
| `ESL_KINDY` (tên chuẩn E-PIONEER), `ESL_KIDS` (tên chuẩn E-CONTENDER & E-GENIUS) | `vmg-english` | true | Trọng tâm trẻ em và phụ huynh. Luôn dùng tên chuẩn trong danh mục, không rút gọn |
| `ESL_SUMMERSCHOOL` | `vmg-english` | true | Sản phẩm theo mùa |
| `ESL_NEXTGEN` (tên chuẩn NEXTGEN IELTS) | `vmg-ielts` | true | Theo Hành trình khách hàng, NEXTGEN IELTS thuộc VMG IELTS. Bản online trên e-Academy (Prep) là ô riêng `e04`, thương hiệu `vmg-e-academy` chưa xác nhận |
| `ESL_EPLUS` | `vmg-english` (tạm) | false | Vòng đời Decline; có thể cần revamp hoặc dừng. Hành trình xếp chung ô "EPLUS VÀ FLEXTRACK", tạm VMG English |
| `TIẾNG TRUNG_GIAO TIẾP`, `TIẾNG TRUNG_HSK` | `vmg-chinese` | true | |
| `EAP_IELTS EXPRESS`, `EAP_IELTS EXAM FOCUS`, `EAP_IELTS SPEAKING BOOSTER 1.5` | `vmg-ielts` | true | Chương trình IELTS mới còn ở trạng thái `withheld` |
| `TESOL_120H`, `TESOL_140H`, `TESOL_EPATH` | `vmg-tesol` | true | `TESOL_EPATH` có thể phân phối qua UpLearn |
| `ESL FLEXTRACK_CÔNG SỞ`, `ESL FLEXTRACK_NGÀNH NGHỀ` | `vmg-english` (tạm, theo hành trình) | false | Do Trung tâm Kinh doanh TMĐT phụ trách |
| `A01-D01_*` (Toán, Lý, Anh, Văn, Đề thi) | `vmg-e-academy` (đề xuất) | false | Hành trình mới gọi là **K-12**, chỉ học online trên e-Academy, không dạy offline. Mã danh mục cũ giữ nguyên cho đến khi R&D đổi. **[CẦN XÁC NHẬN, Q25]** |
| `SAT_1050`, `SAT_1250`, `SAT_1400`, `SAT_1550+` | `vmg-english` (tạm, theo Hành trình khách hàng) | false | Liên kết sang du học VMP; **[CẦN XÁC NHẬN]** |
| `VSTEP_MASTERY`, `VSTEP_EXPRESS`, `VSTEP_EPATH` | `vmg-english` (tạm, theo Hành trình khách hàng) | false | **[CẦN XÁC NHẬN]** |
| `DHH_*`, `DHDH_*`, `DHCG` | `vmp` | true | Du học ngắn hạn, dài hạn |
| `XKLĐ_*` | `vmp` | true | Cách gọi công khai là "Du học nghề" (theo Hành trình khách hàng); mã danh mục cũ giữ nguyên |
| `KHẢO THÍ_*` | `vmt` | true | Tên VMT dùng nội bộ; chưa dùng công khai (Q24) |
| (chưa có mã trong danh mục) Sàn học trực tuyến, Tiếng Anh cho giáo viên | `uplearn`, `edunext` | true | Ô sản phẩm trên hành trình; mã sản phẩm do R&D cấp **[CẦN XÁC NHẬN]** |
| `B2G_ESL` | `vmg-english` | false | Mảng trường học: thiên về quan hệ công chúng thương hiệu, không phải thu hút khách hàng tiềm năng. Nay có trên hành trình như line phụ ENHANCED ENGLISH (ô `b00` đến `b04`); **[CẦN XÁC NHẬN]** |
| (chưa có mã trong danh mục) Tiếng Anh Phản Xạ, Cambridge ESL online, IELTS Lab, e-Plus Pro | `vmg-e-academy` (đề xuất) | false | Ô e-Academy `e01`, `e02`, `e05`, `e06`; mã sản phẩm do R&D cấp **[CẦN XÁC NHẬN, Q25]** |
| (chưa có mã trong danh mục) Tiếng Trung lớp 3-5, 6-9, 10-12 | `vmg-chinese` | true | Ô `z01` đến `z03`, `decision_pending = true`: chờ Ban Giám Đốc quyết định (Q26); không chọn trong T01, T02 |

Quy tắc: công cụ tạo nội dung (T01, T02) **chỉ cho chọn sản phẩm có `brand_confirmed = true`**. Sản phẩm chưa xác nhận hiện ở danh sách nhưng bị làm mờ kèm lý do.

---

## PHỤ LỤC B. BỘ QUY TẮC KIỂM TRA KHỞI TẠO

Nạp vào `checker_rules`. `P` là công khai (nội dung gửi khách hàng, đăng mạng xã hội), `N` là nội bộ, `*` là cả hai. Mỗi quy tắc cần bộ câu thử (mục 5.5). Mọi thông báo bằng tiếng Việt, ngắn gọn, nêu cách sửa.

### B.1 Thuật ngữ và tên gọi

| Mã | Áp dụng | Mức | Cách kiểm | Nội dung thông báo gợi ý |
|---|---|---|---|---|
| `TERM_THI_DIEM` | P | block | `term_list`: "thí điểm" | Không dùng "thí điểm" trong nội dung gửi khách hàng; chỉ dùng trong trao đổi nội bộ chính thức. |
| `TERM_REGISTERED_MARK` | * | block | `regex`: `®` và `(R)`; `admin` tắt quy tắc khi nhãn hiệu được cấp văn bằng | Chưa được cấp văn bằng bảo hộ nên chưa dùng ký hiệu ®. |
| `TERM_VMT_PUBLIC` | P | block | `term_list`: "VMT" (cấu hình được); chỉ áp dụng cho nội dung công khai do T01, T02 tạo và mục kế hoạch công bố; tắt khi cổng `vmt_public_name` được mở | Tên VMT chưa được dùng trên truyền thông bên ngoài; dùng "dịch vụ khảo thí" cho đến khi có thông báo. Trang nội bộ và Hành trình khách hàng vẫn hiển thị VMT. |
| `TERM_BGD_ABBREV` | N | warn | `term_list`: `BOD` | Ghi rõ "Ban Giám Đốc" thay cho viết tắt tiếng Anh. |
| `TERM_DEPRECATED_BRAND` | P | warn | `fn`: so với `brands.deprecated_names` | Tên gọi này không còn dùng; dùng "{tên chuẩn}". |
| `TERM_ENGLISH_ON_SYSTEM` | visual | block | `fn`: logo cấp hệ thống không mang chữ ENGLISH | Không đưa ENGLISH trở lại logo cấp hệ thống. |

### B.2 Cam kết và dữ kiện

| Mã | Áp dụng | Mức | Cách kiểm | Nội dung thông báo gợi ý |
|---|---|---|---|---|
| `CLAIM_VISA_JOB_GUARANTEE` | P | block | `regex`: bảo đảm hoặc cam kết kèm visa, việc làm, đậu, đỗ | Không hứa bảo đảm visa, việc làm hay kết quả tuyệt đối. |
| `CLAIM_OUTCOME_UNVERIFIED` | P | block | `fn`: mọi cụm "cam kết đầu ra", "cam kết band", "cam kết tăng điểm"... phải khớp một dữ kiện `outcome` đã `verified` và `public_ok` của đúng sản phẩm | Cam kết đầu ra này chưa có trong Kho dữ kiện đã xác nhận. |
| `CLAIM_NUMBER_UNGROUNDED` | P | block | `fn`: mọi con số (số năm hoạt động, số học viên, số cơ sở, tỷ lệ, điểm số) phải truy được về dữ kiện `verified` hoặc trường người dùng nhập | Con số này chưa có nguồn xác nhận; bỏ hoặc nhờ chủ chuyên môn xác nhận. |
| `CLAIM_SUPERLATIVE` | P | warn | `term_list`: "số 1", "số một", "hàng đầu", "tốt nhất", "duy nhất", "độc quyền", "phương pháp riêng" | Cách nói tuyệt đối cần bằng chứng kiểm chứng; hồ sơ không cho tự nhận độc quyền khi chưa đủ căn cứ. |
| `CLAIM_YEARS_ACTIVE` | P | warn | `fn`: số năm hoạt động nêu trong nội dung phải khớp năm thành lập trong Kho dữ kiện (tính động theo năm hiện tại) | Số năm hoạt động không khớp năm thành lập đã xác nhận. |
| `MSG_INTERNAL_ONLY_VERBATIM` | P | block | `fn`: nội dung chứa nguyên văn thông điệp có `visibility = internal_only` (ví dụ câu định vị) | Câu này là chuẩn nội bộ, không đưa nguyên văn lên ấn phẩm. |

### B.3 Thông điệp

| Mã | Áp dụng | Mức | Cách kiểm | Nội dung thông báo gợi ý |
|---|---|---|---|---|
| `MSG_ONE_TAGLINE` | * | block | `fn`: tối đa một tagline trong một tài sản | Một tài sản chỉ có một tagline. |
| `MSG_TAGLINE_ALTERED` | * | warn | `fn`: so khớp tagline với bản chuẩn "Dẫn Lối Tương Lai" | Tagline đã bị sửa so với bản chuẩn. |
| `MSG_ENGLISH_ILLUSTRATIVE` | P | warn | `term_list`: các câu tiếng Anh minh họa trong hình tham chiếu ("Find Your Spark", "Small Steps, Big Futures", "Together Brighter Futures", "Explore the World", "More Language, More Opportunities") | Câu này chỉ minh họa, chưa phải tagline hay slogan đã ban hành. |
| `MSG_NO_TAGLINE_TRANSLATION` | P | block | `fn` và `llm`: phát hiện bản dịch tiếng Anh của tagline hoặc thông điệp chủ đạo khi `release_gates` chưa gỡ | Bản tiếng Anh của tagline và thông điệp chủ đạo chưa được chốt. |
| `MSG_WITHHELD` | P | block | `fn`: nội dung dùng thông điệp, tên chương trình, dữ kiện đang `withheld` (ví dụ "THE IELTS LAB", "IELTS CORE") | Nội dung này chưa được phép phát hành: {điều kiện}. |
| `MSG_KEY_MESSAGE_SCOPE` | P | info | `fn`: "Cùng bạn viết tương lai." trong nội dung bán một sản phẩm cụ thể | Thông điệp chủ đạo dành cho nội dung cấp hệ thống; với sản phẩm, cân nhắc headline của thương hiệu. |

### B.4 Hình ảnh và thương hiệu thị giác

| Mã | Áp dụng | Mức | Cách kiểm | Nội dung thông báo gợi ý |
|---|---|---|---|---|
| `VIS_LOGO_VERSION` | visual | block | `fn`: logo là bản `is_usable` | Logo không phải bản đang có hiệu lực. |
| `VIS_LOGO_MIN_SIZE` | visual | block | `fn`: chiều rộng logo không nhỏ hơn mức tối thiểu của mẫu | Logo quá nhỏ. |
| `VIS_LOGO_CLEARSPACE` | visual | block | `fn` (kiểm khi xuất bản mẫu): vùng trống quanh logo | Thiếu vùng trống quanh logo. |
| `VIS_LOGO_BACKGROUND` | visual | block | `fn`: bản logo phù hợp nền (positive trên nền sáng, reversed trên nền tối), nền không quá rối | Logo đặt trên nền không phù hợp. |
| `VIS_FORBIDDEN_EFFECTS` | visual | block | `fn` (kiểm khi xuất bản mẫu): không gradient, bóng đổ, viền chữ, 3D, phản chiếu trên logo và chữ thương hiệu | Hiệu ứng không được phép theo bộ nhận diện. |
| `VIS_TEXT_CONTRAST` | visual | block | `fn`: tương phản chữ nhỏ hơn 4,5:1 | Chữ khó đọc trên nền này. |
| `VIS_INK_ZONES` | visual | block | `fn` (kiểm khi xuất bản mẫu): nét THE INK không che vùng cấm; tối đa một nét chính | Nét THE INK che vùng cần giữ trống. |
| `VIS_VIMI_DISABLED` | visual | block | `fn`: dùng VIMI khi `vimi_enabled = false` | Bộ quy chuẩn nhân vật VIMI chưa phát hành. |
| `VIS_VIMI_LEVEL` | visual | warn | `fn`: thương hiệu `limited` dùng VIMI | Với người trưởng thành và giáo viên, ưu tiên ảnh thật kết hợp nét THE INK. |
| `VIS_AI_REAL_PERSON` | visual | block | `fn`: loại bài `requires_real_photo` dùng ảnh AI | Loại bài này bắt buộc dùng ảnh người thật. |
| `VIS_AI_NO_TEXT` | visual | block | `fn`: ảnh nền AI chứa chữ hoặc logo (kiểm bằng nhận dạng chữ) | Ảnh nền AI không được chứa chữ hay logo. |
| `VIS_PHOTO_CONSENT` | visual | block | `fn`: ảnh có người chưa xác nhận đồng ý sử dụng hình ảnh | Cần xác nhận đã có đồng ý sử dụng hình ảnh (với trẻ em là của phụ huynh). |

### B.5 Liên hệ, dữ liệu cá nhân, ưu đãi

| Mã | Áp dụng | Mức | Cách kiểm | Nội dung thông báo gợi ý |
|---|---|---|---|---|
| `CONTACT_MATCH_PROFILE` | P | block | `fn`: số điện thoại, địa chỉ, email, đường dẫn trong nội dung phải khớp hồ sơ trung tâm hoặc đầu mối hệ thống | Thông tin liên hệ không khớp hồ sơ trung tâm. |
| `PII_UNKNOWN_CONTACT` | P | block | `regex`: số điện thoại, email, số định danh lạ | Phát hiện thông tin cá nhân hoặc liên hệ không thuộc hồ sơ chuẩn. |
| `PROMO_EXPIRY_CONDITIONS` | P | block | `fn`: bài có ưu đãi phải có hạn áp dụng và điều kiện | Ưu đãi cần ghi rõ hạn và điều kiện. |
| `PROMO_APPROVAL_LEVEL` | P | block | `fn`: tra `promo_policy`; yêu cầu xác nhận đã có phê duyệt đúng cấp | Mức ưu đãi này cần phê duyệt của {cấp}; xác nhận đã có phê duyệt. |
| `PROMO_PERCENT_CONSISTENT` | P | block | `fn`: % trong văn bản phải bằng % người nhập | Phần trăm ưu đãi trong nội dung không khớp số đã nhập. |

### B.6 Phong cách

| Mã | Áp dụng | Mức | Cách kiểm | Nội dung thông báo gợi ý |
|---|---|---|---|---|
| `STYLE_LANGUAGE_CONSISTENT` | P | warn | `fn`: tỷ lệ từ tiếng Anh lẫn trong văn bản tiếng Việt vượt ngưỡng (có danh sách ngoại lệ: tên riêng và thuật ngữ chuyên môn như IELTS, TESOL, HSK, UpLearn, EduNext, VIMI, THE INK) | Nội dung đang trộn nhiều tiếng Anh; nên viết nhất quán một ngôn ngữ. |
| `STYLE_PRESSURE_SELLING` | P | warn | `term_list`: "tụt hậu", "thua kém bạn bè", "bị bỏ lại", "sẽ hối hận" và `llm` tùy chọn | Tránh gây lo lắng hoặc dùng áp lực thành tích để bán hàng. |
| `STYLE_HASHTAG_COUNT` | P | warn | `fn`: quá số hashtag cấu hình | Giảm số hashtag. |
| `STYLE_AUDIENCE_TONE` | P | warn | `llm` tùy chọn: giọng nói không hợp đối tượng (nói với người lớn như với trẻ nhỏ) | Giọng nói chưa phù hợp đối tượng đọc. |

---

## PHỤ LỤC C. LOẠI BÀI VÀ TRƯỜNG BIỂU MẪU

Trường mặc định cho mọi loại bài: thương hiệu, sản phẩm, đối tượng đọc, lời kêu gọi (CTA), thông tin liên hệ (tự điền, khóa). Bảng chỉ nêu phần khác nhau. Cột "AI nền" là có cho dùng ảnh nền AI (T07). Mọi loại bài của người dùng trung tâm đều **bắt buộc gửi duyệt**; ngoại lệ theo vai trò do `admin` cấu hình.

| `post_type` | Trường bắt buộc thêm | Trường tùy chọn | Ảnh thật bắt buộc | AI nền |
|---|---|---|---|---|
| `enrollment` (khai giảng, tuyển sinh) | Ngày khai giảng, hình thức học | Ưu đãi, tiêu đề, ảnh | Không | Có |
| `promotion` (ưu đãi) | Loại ưu đãi, giá trị, điều kiện, hạn áp dụng | Ngày giờ, tiêu đề, ảnh | Không | Có |
| `event` (sự kiện) | Tên sự kiện, ngày giờ, địa điểm, cách đăng ký | Diễn giả, ảnh | Không | Có |
| `student_story` (câu chuyện học viên) | Câu chuyện thật do người dùng nhập, ảnh thật, xác nhận đồng ý | Tên viết tắt | **Có** | **Không** |
| `teacher_spotlight` (giới thiệu giáo viên) | Họ tên, chuyên môn (thông tin đã xác nhận), ảnh thật | Thành tích đã có nguồn | **Có** | **Không** |
| `learning_tip` (kiến thức, mẹo học) | Chủ đề, từ hai đến năm ý nội dung | Ảnh | Không | Có |
| `notice` (thông báo, lịch) | Nội dung, ngày giờ hiệu lực | Ảnh | Không | Có |
| `monthly_theme` (chủ đề tháng) | Chủ đề và bộ tài liệu của Marketing (chọn từ chiến dịch); trung tâm chỉ điền thông tin địa phương | Ảnh thật tại trung tâm | Không | Không (dùng tài sản chiến dịch) |
| `ecosystem` (hệ sinh thái, chặng học tiếp theo) | Thương hiệu xuất phát, chặng tiếp theo (từ `journey_edges`, phải có dữ kiện `verified`) | Ảnh | Không | Có |

---

## PHỤ LỤC D. NGÂN HÀNG THÔNG ĐIỆP VÀ LỜI KÊU GỌI KHỞI TẠO

Nguồn: Nền tảng, mục 5. Script seed trích nguyên văn từ docx; bảng dưới là để Claude Code kiểm chứng kết quả. Headline, nội dung chính ở trạng thái `proposed` cho đến khi chủ chuyên môn xác nhận bằng chứng. Mọi câu cần ngày hiệu lực khi Bộ chuẩn 1.0 ban hành.

### D.1 Tagline và thông điệp chủ đạo

| Loại | Câu | Ghi chú |
|---|---|---|
| tagline (kế thừa) | Dẫn Lối Tương Lai | `layer = core`; đặt ở vị trí nhận diện cạnh logo |
| key_message | Cùng bạn viết tương lai. | `proposed` đến khi kiểm chứng khách hàng 12/2026 và ban hành; dùng làm câu dẫn hoặc tiêu đề cấp hệ thống; không đặt hai câu cùng cỡ chữ lớn cạnh nhau vì cùng lặp từ "tương lai" |

### D.2 Headline và lời kêu gọi của thương hiệu

| Thương hiệu | Headline | Lời kêu gọi |
|---|---|---|
| VMG English | Tiếng Anh để cất tiếng riêng. | Khám phá chương trình tiếng Anh cho trẻ |
| VMG IELTS | Điểm số có nền tảng. | Nhận tư vấn lộ trình IELTS (chỉ phát hành sau khi chương trình mới được nghiệm thu) |
| VMG TESOL | Hiểu cách học. Thiết kế cách dạy. | Khám phá chương trình TESOL |
| VMG Tiếng Trung | Tiếng Trung trong việc bạn làm. | Tìm khóa tiếng Trung phù hợp |
| VMP | Chọn hướng đi, hiểu đường đến. | Đặt lịch tư vấn du học |
| UpLearn by VMG | Chuyên môn theo nhịp của bạn. | Khám phá khóa học trên UpLearn |
| EduNext | Tiếng Anh từ chính môn thầy cô dạy. | Tìm hiểu chương trình EduNext |

VMT (dịch vụ khảo thí): chưa có thông điệp riêng (chờ nhận diện và quyết định về ngày dùng tên VMT công khai).

### D.3 Bốn trụ nội dung

| Trụ | Câu dẫn dắt |
|---|---|
| Học có chiều sâu | Biết mình đang học gì, vì sao học và cần cải thiện ở đâu. |
| Kiến thức có nơi ứng dụng | Đưa điều đã học vào một việc bạn làm được. |
| Lựa chọn có cơ sở | Hiểu năng lực của mình, hiểu phương án trước khi quyết định. |
| Cơ hội học có người đồng hành | Cơ hội được trao đi cùng sự hỗ trợ để người nhận thực sự học được. |

### D.4 Câu giới thiệu VMG mẫu

Bốn tình huống (một câu; giới thiệu ngắn; sự kiện hệ thống; EduNext với đối tác trường): nạp nguyên văn từ Nền tảng mục 5.6. Hiển thị ở `/brand/messages` kèm nút sao chép. Câu "một câu" có số năm hoạt động tính từ năm thành lập; năm thành lập là dữ kiện `pending` đến khi xác nhận **[CẦN XÁC NHẬN]**.

### D.5 Dữ kiện `pending` khởi tạo (bảng thiếu bằng chứng)

Từ bảng "Bằng chứng cần bổ sung" (Nền tảng 3.3) và Phụ lục A hồ sơ: số học viên đã theo học qua các năm; câu chuyện cựu học viên có thể kiểm chứng; tỷ lệ học viên học tiếp chặng sau trong hệ thống; thời gian học trung bình; số giáo viên thực học EduNext; số suất học đã trao và kết quả đạt được; năm thành lập; số cơ sở và số năm hoạt động thống nhất giữa website và tài liệu. Tất cả `evidence_status = pending`, chưa dùng được trong nội dung công khai.

---

## PHỤ LỤC E. BÀI KIỂM TRA TÌNH HUỐNG: ĐỊNH DẠNG VÀ CÂU MẪU

### E.1 Định dạng một câu hỏi (`quiz_questions`)

```json
{
  "type": "single_choice",
  "prompt": "Phụ huynh hỏi: \"VMG chỉ dạy tiếng Anh phải không?\" Câu trả lời nào đúng tinh thần thương hiệu?",
  "options": [
    { "id": "a", "text": "Đúng, VMG là trung tâm tiếng Anh." },
    { "id": "b", "text": "VMG là hệ sinh thái giáo dục Ngoại ngữ, Du học và Hướng nghiệp; bắt đầu từ tiếng Anh và đi tiếp khi mục tiêu thay đổi." },
    { "id": "c", "text": "VMG dạy tiếng Anh và tiếng Trung." }
  ],
  "answer": ["b"],
  "explanation": "Logo và cách giới thiệu cấp hệ thống không gắn với riêng tiếng Anh (Nền tảng 1.2 và 5.6).",
  "topic_tags": ["gioi-thieu-vmg", "he-sinh-thai"],
  "source_ref": "Nền tảng 5.6"
}
```

Các loại khác: `multi_choice`, `logo_choice` (đáp án là hình), `find_errors` (chọn các câu sai trong một đoạn nội dung), `match` (ghép thương hiệu với vai trò).

### E.2 Bốn câu mẫu

| Loại | Tình huống | Đáp án và lý do |
|---|---|---|
| `logo_choice` | Bạn làm tờ rơi tuyển sinh riêng cho VMG IELTS. Dùng logo nào? | Logo VMG IELTS (logo cấp hệ thống không dùng cho tài liệu tuyển sinh của một sản phẩm cụ thể; Nền tảng 6.1) |
| `find_errors` | Đoạn bài đăng có các câu: "VMG đảm bảo 100% có visa"; "Chương trình thí điểm tại hai trung tâm"; "Đặt lịch tư vấn du học" | Hai câu đầu sai: hứa bảo đảm kết quả tuyệt đối; dùng từ "thí điểm" với khách hàng |
| `single_choice` | Một poster đặt hai câu khẩu hiệu lớn cạnh nhau. Điều gì sai? | Vi phạm nguyên tắc "một tài sản, một tagline" (Nền tảng 2) |
| `single_choice` | Học viên nhỏ tuổi trong ảnh lớp học; bạn muốn đăng. Bước bắt buộc trước khi gửi duyệt? | Có đồng ý sử dụng hình ảnh của phụ huynh; tích xác nhận trong công cụ |

---

## PHỤ LỤC F. BẢN ĐỒ TRUY VẾT NGUỒN

| Phần của Brand Lab | Nguồn trong hồ sơ |
|---|---|
| Brand Hub: ý tưởng, mục đích, tầm nhìn, sứ mệnh, định vị, lời hứa, giá trị, nhân cách, câu chuyện, trách nhiệm xã hội | Nền tảng mục 3 |
| Kiến trúc thương hiệu, quy tắc thể hiện, quy tắc mở rộng danh mục | Nền tảng mục 4 |
| Tagline, thông điệp chủ đạo, trụ nội dung, thông điệp từng thương hiệu, thứ bậc, câu giới thiệu | Nền tảng mục 5 |
| Logo, màu, VIMI, THE INK, âm nhạc (thử nghiệm) | Nền tảng mục 6; Bộ nhận diện 2021 |
| Cổng nhãn hiệu, ký hiệu ® | Nền tảng mục 7; Kế hoạch mục 4 |
| Ba lớp quản trị, hồ sơ thay đổi lớp lõi, một nguồn chuẩn, phân vai | Nền tảng mục 8 |
| Mục đích, phạm vi, lộ trình, chỉ số nghiệm thu, chi phí của Brand Lab | Kế hoạch mục 10 |
| Ngân hàng thông điệp có phiên bản và kiểm chứng khách hàng | Kế hoạch mục 7 |
| Bài kiểm tra tình huống, hướng dẫn đội ngũ | Kế hoạch mục 11 |
| Chỉ số đo lường và quy tắc đọc số liệu | Kế hoạch mục 14 |
| Danh mục kiểm kê tài sản (ngoài phạm vi, chừa liên kết mã) | Kế hoạch Phụ lục A |
| Mô tả bốn mục đích mở rộng (hiểu thương hiệu, guideline theo vai trò, thư viện sale kit, công cụ sản xuất có AI) | Yêu cầu bổ sung của chủ sản phẩm ngày 14/10/2026 |
| Danh mục sản phẩm, mã sản phẩm | `VMG_Product_Portfolio_2026.md` |
| Quy tắc logo, màu, chữ, ứng dụng | `VMG_Brand_Identity_Context.md` |
| Hành trình khách hàng, thẻ sản phẩm, quy ước ô, ánh xạ thương hiệu trong hành trình | File "Hành trình khách hàng VMG theo các line sản phẩm" (PDF, bản 20/10/2026); Phụ lục G |
| Kế hoạch nội dung chung, nhịp điều phối hằng tháng (mốc 01 đến 06) | Yêu cầu bổ sung của chủ sản phẩm ngày 15/10/2026; cơ chế điều phối Brand Campaign do Giám đốc Khối R&D ban hành từ 08/2026 |

---

## PHỤ LỤC G. HÀNH TRÌNH KHÁCH HÀNG: DỮ LIỆU KHỞI TẠO

**Tệp:** `seed/journey.json` (kèm spec này, phiên bản 2.0-draft), trích từ file "Hành trình khách hàng VMG theo các line sản phẩm" (bản 20/10/2026). Cấu trúc: `meta` (phiên bản, nguồn, quy ước, màu chính thức, `verify_list`), `stages` (5), `lines` (5, gồm tầng đích; Line 1 có `sublanes`), `nodes` (61), `edges` (51). Mỗi ô có `code`, `line`, `stage`, `kind`, `brand_slug`, `product_name`, `item_name`, `duration_text`, `description`, `product_code_hints`, `brand_confirmed` và các trường tùy chọn (`lane`, `group`, `stage_span`, `attach_to`, `row_hint`, `timed_notes`, `brand_note`, `verify_note`, `decision_pending`). Mỗi đường nối có `from_code`, `to_code`, `kind`, `label`, `proposed`, `two_way`. Claude Code **nạp tệp này, không gõ lại**, và kiểm thử so khớp với file nguồn.

**G.1 Tóm tắt theo line và chặng**

| Line | Các ô | Số ô |
|---|---|---|
| Line phụ B2G (ENHANCED ENGLISH, 2 gói Core 35 tiết hoặc Extended 70 tiết, năm học 2026-2027) | Tiêu đề chương trình; Mầm non (Pre-A1); Tiểu học lớp 1-5 (A1); THCS lớp 6-9 (A1-A2+); THPT lớp 10-11 (B1-B1+) | 5 |
| Line 1 (chính) ESL B2C | 4-6 tuổi: E-PIONEER (Little Seeds, Green Buds, Bright Blooms) = 3. 6-11 tuổi: E-CONTENDER & E-GENIUS (Pre Cambridge, Starters, Movers, Flyers) xen ba cột mốc THI CAMBRIDGE (VMT) = 7. 11-16 tuổi: NEXTGEN IELTS Pre-IELTS (IELTS Onset, IELTS Foundation) = 2. 16+: NEXTGEN IELTS 4.0, 5.0, 6.0, 7.0 xen THI IELTS đầu ra 5.0, 6.0, 7.0 (VMT) = 7; IELTS EXPRESS IE1 đến IE7 = 7; IELTS MOCK TEST, IELTS EXAM FOCUS = 3 (tổng 17). Từ 18 tuổi: nhãn rẽ nhánh "mỗi người chọn đích đến riêng" = 1 | 30 |
| Line 2 VMG e-Academy | Juniors: TIẾNG ANH PHẢN XẠ, CAMBRIDGE ESL, K-12. Prep: NEXTGEN IELTS, IELTS LAB, e-PLUS PRO. Hai ô ghi chú khoảng trống (chưa có sản phẩm online cho 4-6 tuổi; Prep chưa có khóa cho lứa tiểu học) | 8 |
| Line phụ Tiếng Trung | Ghi chú khoảng trống dưới 8 tuổi; TIẾNG TRUNG lớp 3-5, 6-9, 10-12; TIẾNG TRUNG giao tiếp (từ 16 tuổi); LUYỆN THI HSK (đến HSK4) | 6 |
| Tầng đích | **Nghề giáo và giáo viên:** TIẾNG ANH CHO GIÁO VIÊN (EduNext), CHỨNG CHỈ TESOL. **Bằng cấp và chứng chỉ:** VSTEP. **Giao tiếp và chuyên môn:** EPLUS VÀ FLEXTRACK, SÀN HỌC TRỰC TUYẾN (UpLearn). **Du học:** SAT, DU HỌC DÀI HẠN, DU HỌC NGHỀ. Cộng bốn ô tiêu đề nhóm | 12 |
| **Tổng** | | **61** |

Đường nối: 51, gồm 32 `sequence`, 3 `side`, 1 `side_group`, 3 `branch`, 4 `b2g_link`, 3 `ea_link`, 2 `same_program` (hai chiều), 3 `zh_link`; 14 đường là đề xuất (`proposed = true`).

**G.2 Quy ước và nguyên tắc rút từ file nguồn** (nằm trong `meta.conventions`)

- Tên sản phẩm giữ theo danh mục hiện hành, không rút gọn; dòng đầu là tên sản phẩm, dòng sau là khóa nhỏ.
- Mỗi ô mang màu thương hiệu thành viên; không dùng tag trạng thái vòng đời trên ô.
- Ô nền trắng viền vàng là khảo thí do VMT tổ chức; khung viền xanh ngọc là hai nhóm của e-Academy.
- Nét liền là thứ tự trong một line; **nét đứt và các nhánh sang tầng đích là đề xuất liên kết để thảo luận**, không phải điều kiện bắt buộc.
- Juniors và Prep của e-Academy chồng nhau ở tuổi 11-16, không phải hai chặng nối tiếp.
- IELTS Express xếp song song với NextGen IELTS theo hàng, không khớp từng band.
- Mốc 16+ và từ 18 tuổi là mốc tham chiếu, không phải điều kiện đầu vào.
- Học viên e-Academy thi IELTS và Cambridge qua VMT như học viên offline.
- B2G là line phụ trên hành trình (bản trước loại ra); FuturePath chưa phải sản phẩm thương mại nên không có trên hành trình.

**G.3 Màu thương hiệu.** Chính thức (từ file Nền tảng): TESOL `#012A9E`; VMP `#29338D` và cam `#F69220`; UpLearn màu tím (chưa có mã). Các màu còn lại trên file hành trình (VMG English theo từng sản phẩm, VMG IELTS đỏ và đỏ sẫm và hồng nhạt, Tiếng Trung đỏ gạch, EduNext xanh lá nhạt, VMT trắng viền vàng) **là đề xuất, chưa có mã chính thức**. Màu line mới (xám xanh cho B2G, xanh ngọc cho e-Academy) cũng là đề xuất. Claude Code đo từ file nguồn, đặt vào `brands.color_proposed`, đánh dấu chưa xác nhận (Q23, Q25).

**G.4 Danh sách cần xác nhận** (`meta.verify_list`; ghi vào `docs/OPEN_QUESTIONS.md`)

1. e-Academy: tuổi các khóa (file nguồn chỉ chia Juniors và Prep); Tiếng Anh Phản Xạ và Cambridge ESL tạm đặt ở tiểu học; K-12 tạm ở THCS và THPT (Q25).
2. K-12 là tên mới của A01-D01, chỉ triển khai trên e-Academy, không dạy offline (Q25).
3. NextGen IELTS (Prep) và Cambridge ESL online nối với bản offline theo nguyên tắc cùng chương trình: R&D xác nhận; IELTS Lab có thể đổi theo đề án VMG IELTS 2026-2027 (CORE và THE IELTS LAB, dự kiến 03/2027) và cần kiểm tra trùng tên (Q25).
4. e-Plus Pro thay thế hay song song với EPlus offline; đối tượng e-Plus Pro.
5. Thương hiệu: VMG e-Academy chưa có trong file Nền tảng; B2G, SAT, VSTEP, EPlus, FlexTrack tạm xếp VMG English (Q23, Q25).
6. B2G: chưa có giá, mô hình hợp đồng, người trực tiếp dạy, giáo trình mầm non; số liệu hơn 200 trường và khoảng 42.000 học sinh chưa gắn chương trình nên không lên bản đồ.
7. Tiếng Trung lớp 3-12 (file nguồn ghi cả 8-15 và 8-18 tuổi): chờ Ban Giám Đốc quyết định; chưa có sĩ số, offline hay online, giáo viên, học phí; không có mũi tên từ lớp 3-12 sang HSK; mũi tên từ lớp 12 sang tiếng Trung giao tiếp 16+ là đề xuất (Q26).
8. IE1 đến IE7 (band 4.0 đến 6.5+, 3 tháng 36 giờ mỗi cấp): R&D xác nhận (Q23).
9. Cam kết đầu ra trong danh mục sản phẩm khác cách chia cấp trong hành trình (mục 10.3, điểm 5).
10. Các mốc ngày trong `timed_notes` (bán chung EPlus và FlexTrack từ quý 4/2026; UpLearn ra mắt mềm 28/10/2026; EduNext trải nghiệm miễn phí cho trường đối tác 09 đến 11/2026): xác nhận còn hiệu lực trước khi hiển thị.
11. Mã màu các thương hiệu ngoài TESOL, VMP, UpLearn và hai màu line mới.

**G.5 Nạp dữ liệu.** `brand_slug` ánh xạ sang `brands.slug` (gồm `vmt`, `vmg-e-academy`, Phụ lục A.1). Các ô không có thương hiệu (`goal_group`, `branch_label`, `gap_note`) hiển thị màu trung tính. `product_code_hints` đưa vào `journey_node_products` với cờ chưa xác nhận. `proposed` và `two_way` của đường nối nạp nguyên vẹn. Trạng thái nạp: `proposed`; chuyển `effective` khi Marketing và R&D xác nhận. Script nạp phải kiểm tra: mọi đầu mút đường nối tồn tại; mã ô không trùng; số ô, số đường nối và số đường đề xuất khớp mục G.1.

---

## PHỤ LỤC H. KẾ HOẠCH NỘI DUNG CHUNG: MẪU NHẬP VÀ QUY TẮC

**H.1 Cột mẫu nhập kế hoạch tháng** (CSV hoặc XLSX, mỗi dòng một mục; tiêu đề cột không dấu để nhập ổn định; chỉnh theo file lịch nội dung thật khi nhận được, Q22)

| Cột | Bắt buộc | Giá trị |
|---|---|---|
| `ngay_dang` | Có | `dd/mm/yyyy`, thuộc tháng của kế hoạch |
| `khung_gio` | Không | `HH:mm` hoặc `sang`, `trua`, `toi` |
| `ngay_lech_cho_phep` | Không | Số nguyên ngày, mặc định 0 |
| `khong_dang_truoc` | Không | `dd/mm/yyyy` khi có hạn chế |
| `kenh` | Có | Khóa kênh trong `channels` (có thể nhiều, ngăn bằng `;`) |
| `loai_bai` | Có | `post_type` (Phụ lục C) |
| `thuong_hieu` | Có | `brands.slug` |
| `san_pham` | Không | Mã sản phẩm có `brand_confirmed = true`, hoặc để trống nếu bài cấp thương hiệu |
| `chang` | Không | `s1` đến `s5` |
| `tru_noi_dung` | Không | Khóa trụ nội dung |
| `chien_dich` | Không | Mã chiến dịch |
| `muc_bat_buoc` | Có | `must`, `recommended`, `optional` |
| `pham_vi` | Có | `all`; hoặc `brand:{slug}`; hoặc `product:{ma}`; hoặc `region:{khu-vuc}`; hoặc `center:{ma}`; nhiều giá trị ngăn bằng `;` |
| `thong_diep` | Không | Mã câu trong ngân hàng thông điệp (nên dùng); nếu là câu tự do, hệ thống gắn cờ cần kiểm tra |
| `caption_chu` | Có với `must` | Văn bản; chỗ trống `{TEN_TRUNG_TAM}`, `{HOTLINE}`, `{DIA_CHI}` |
| `hashtag` | Không | Ngăn bằng khoảng trắng |
| `ma_cta` | Không | Mã trong `cta_library` |
| `uu_dai_loai`, `uu_dai_gia_tri`, `uu_dai_dieu_kien`, `uu_dai_han` | Có nếu bài có ưu đãi | Theo mục 5.11; bắt buộc có điều kiện và hạn |
| `ma_nguon` | Có với `must` (hoặc `lien_ket_drive`) | Mã tài sản hoặc bộ tài liệu, ngăn bằng `;` |
| `lien_ket_drive` | Không | Liên kết Drive, hệ thống đăng ký tài sản nháp (mục 6.4.1) |
| `ma_mau` | Không | Mã mẫu thiết kế gợi ý |
| `ghi_chu_trung_tam` | Không | Hướng dẫn cho trung tâm |
| `khong_duoc_sua` | Không | Danh sách phần khóa: `uu_dai`, `tieu_de`, `caption`, `hinh` |

**H.2 Quy tắc kiểm tra khi nhập** (hiển thị lỗi theo từng dòng, không tạo dòng lỗi)

- Ngày đăng thuộc tháng của kế hoạch; ưu đãi có hạn không sớm hơn ngày đăng.
- Mục `must` phải có nguồn và caption chủ; `pham_vi` hợp lệ; thương hiệu và sản phẩm tồn tại, sản phẩm `brand_confirmed = true`.
- Thông điệp, dữ kiện, mẫu, tài sản được tham chiếu phải `is_usable` vào ngày đăng; nội dung `withheld`, `proposed` và dữ kiện `pending` không được dùng.
- Caption chủ chạy Trình kiểm tra (mục 5.5); lỗi `block` chặn công bố, không chặn nhập nháp.
- Không tạo dữ liệu mẫu trông như thật khi kiểm thử; dùng bảng tính mẫu có ô giữ chỗ.

**H.3 Trạng thái mục hiển thị cho trung tâm** (tính từ `plan_items` và `plan_progress`): Chưa bắt đầu; Đang làm (đã có bài trong Xưởng); Đã đăng; Đã bỏ qua (kèm lý do); Quá hạn (qua ngày đăng cộng số ngày lệch cho phép mà chưa đăng hoặc bỏ qua); Đã thay đổi (có phiên bản mới chưa xác nhận); Đã hủy.

---

---

*Hết tài liệu. Cập nhật spec: ghi thay đổi vào phần đầu tài liệu và tăng số phiên bản; các câu hỏi chưa chốt ghi ở mục 10.2.*
