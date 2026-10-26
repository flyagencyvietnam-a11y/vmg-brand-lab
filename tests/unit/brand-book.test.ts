import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { brandsSeedSchema } from "@/lib/brands/schema";
import { profileFromStored } from "@/lib/brandbook/profile";
import { brandBookSeedSchema, buildBrandProfileUpdates } from "@/lib/brandbook/schema";

const root = resolve(import.meta.dirname, "../..");
const read = (f: string): unknown => JSON.parse(readFileSync(resolve(root, f), "utf8"));
const seed = brandBookSeedSchema.parse(read("seed/brand-book.json"));
const brandSlugs = new Set(brandsSeedSchema.parse(read("seed/brands.json")).brands.map((b) => b.slug));

// Brand Book là nguồn cho các mục đã có (trang thương hiệu, trang sản phẩm, bản đồ), không phải một mục riêng.
describe("VMG Brand Book v0.2 (seed sinh từ docx)", () => {
  it("thông tin bìa khớp tài liệu", () => {
    expect(seed.meta.title).toBe("VMG Brand Book 2026");
    expect(seed.meta.tagline).toBe("VMG - Dẫn Lối Tương Lai");
    expect(seed.meta.version_line).toBe("Bản dự thảo v0.2 | 26/10/2026");
  });

  it("đủ 10 thương hiệu, đều có trong seed/brands.json; chín thương hiệu thành viên có hồ sơ 13 dòng", () => {
    expect(Object.keys(seed.brands)).toHaveLength(10);
    for (const slug of Object.keys(seed.brands)) expect(brandSlugs.has(slug), slug).toBe(true);
    for (const [slug, b] of Object.entries(seed.brands)) {
      if (slug === "vmg") continue;
      expect(b.profile.map((i) => i.label), slug).toEqual([
        "Định vị",
        "Người học và người quyết định",
        "Vấn đề của người học",
        "Lời hứa",
        "Lý do tin",
        "Sản phẩm",
        "Thông điệp chính",
        "Vai trong hành trình",
        "Vai nhân cách",
        "Cách viết tên",
        "Nhận diện thị giác",
        "Cần lưu ý khi nói",
        "Giới thiệu chuẩn (khoảng 25 từ)",
      ]);
      expect(b.one_liner, slug).toBeTruthy();
      expect(b.persona_role, slug).toBeTruthy();
      expect(b.architecture_role, slug).toBeTruthy();
    }
  });

  it("giữ nguyên chữ của nguồn (kiểm vài câu then chốt)", () => {
    const text = JSON.stringify(seed.brands);
    for (const phrase of [
      "Bắt đầu tiếng Anh đúng cách ngay từ nhỏ, với lộ trình nối tiếp theo từng độ tuổi.",
      "Không cam kết kết quả visa, học bổng hay hồ sơ.",
      "Dùng \"Du học nghề\" thay cho \"xuất khẩu lao động\".",
      "Phân biệt với VMG e-Academy: UpLearn là học tự chủ chuyên ngành; e-Academy là lớp có giáo viên.",
    ])
      expect(text, phrase).toContain(phrase.replaceAll('"', '\\"'));
  });

  it("màu thẻ khớp mục 4.2: e-Academy #0E7C86, TESOL #012A9E, VMP #29338D kèm #F69220", () => {
    expect(seed.brands["vmg-e-academy"]!.card_colour).toContain("#0E7C86");
    expect(seed.brands["vmg-tesol"]!.card_colour).toContain("#012A9E");
    expect(seed.brands.vmp!.card_colour).toContain("#29338D");
    expect(seed.brands.vmp!.card_colour).toContain("#F69220");
  });

  it("cập nhật cho bảng brands: hồ sơ, vai trò, giọng nói", () => {
    const updates = buildBrandProfileUpdates(seed);
    expect(updates).toHaveLength(10);
    const english = updates.find((u) => u.slug === "vmg-english")!;
    expect(english.role_summary).toContain("Tiếng Anh tại trung tâm");
    expect(english.voice_profile).toMatchObject({ role: "Người khai lối" });
    const profile = profileFromStored(english.profile)!;
    expect(profile.personaRole).toBe("Người khai lối");
    expect(profile.items).toHaveLength(13);
    expect(profileFromStored({})).toBeNull();
  });
});
