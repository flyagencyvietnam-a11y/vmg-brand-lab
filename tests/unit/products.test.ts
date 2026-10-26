import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { matchesHint, parsePortfolio, productBrand, productSlug } from "@/lib/products/parse-portfolio";
import { redactCommitments } from "@/lib/products/model";
import { seedProductToModel } from "@/lib/products/seed-source";
import { buildProductsSeed, productsSeedSchema } from "@/lib/products/seed";

const root = resolve(import.meta.dirname, "../..");
const md = readFileSync(resolve(root, "docs/source/VMG_Product_Portfolio_2026.md"), "utf8");
const seed = productsSeedSchema.parse(JSON.parse(readFileSync(resolve(root, "seed/products.json"), "utf8")));
const journey = JSON.parse(readFileSync(resolve(root, "seed/journey.json"), "utf8")) as {
  nodes: { code: string; product_code_hints: string[] }[];
};

describe("danh mục sản phẩm 2026", () => {
  it("seed/products.json khớp file nguồn (chạy `npm run seed:products` nếu lệch)", () => {
    expect(seed).toEqual(buildProductsSeed(md));
  });

  it("có đủ 44 sản phẩm, mã và địa chỉ không trùng", () => {
    const products = parsePortfolio(md);
    expect(products).toHaveLength(44);
    expect(new Set(products.map((p) => p.code)).size).toBe(44);
    expect(new Set(seed.products.map((p) => p.slug)).size).toBe(44);
    for (const p of products) {
      expect(p.name, p.code).not.toBe("");
      expect(p.group, p.code).not.toBe("");
    }
  });

  it("tách đúng mục chi tiết: tên chuẩn, đối tượng, hình thức, người quyết định", () => {
    const kids = seed.products.find((p) => p.code === "ESL_KIDS")!;
    expect(kids.name).toBe("E-CONTENDER & E-GENIUS");
    expect(kids.segment).toBe("KIDS");
    expect(kids.audience).toEqual(["Kids"]);
    expect(kids.formats).toEqual(["Offline"]);
    expect(kids.decider).toEqual(["Adults (phụ huynh)"]);
    expect(kids.lifecycle).toBe("Optimization");
    const nextgen = seed.products.find((p) => p.code === "ESL_NEXTGEN")!;
    expect(nextgen.formats).toEqual(["Offline", "Online"]);
    expect(nextgen.decider).toEqual(["Adults", "Teens"]);
  });

  it("tách đúng bảng nhóm: SAT, TESOL, Du học, thông tin chung của nhóm", () => {
    const sat = seed.products.filter((p) => p.code.startsWith("SAT_"));
    expect(sat.map((p) => p.code)).toEqual(["SAT_1050", "SAT_1250", "SAT_1400", "SAT_1550+"]);
    expect(sat.every((p) => p.revenue_model?.includes("Học phí theo kỳ"))).toBe(true);
    const tesol = seed.products.find((p) => p.code === "TESOL_EPATH")!;
    expect(tesol.formats).toEqual(["MOOC/Automation"]);
    expect(tesol.kpi_owner).toBe("TMĐT");
    const dhdh = seed.products.find((p) => p.code === "DHDH_MỸ")!;
    expect(dhdh.title).toBe("DU HỌC DÀI HẠN · Mỹ");
    expect(dhdh.group_note).toContain("Teens + Adults");
  });

  it("thương hiệu theo Phụ lục A.2", () => {
    expect(productBrand("ESL_NEXTGEN")).toEqual({ slug: "vmg-ielts", confirmed: true });
    expect(productBrand("ESL_EPLUS")).toEqual({ slug: "vmg-english", confirmed: false });
    expect(productBrand("A01-D01_TOÁN")).toEqual({ slug: "vmg-e-academy", confirmed: false });
    expect(productBrand("DHDH_ĐÀI LOAN")).toEqual({ slug: "vmp", confirmed: true });
    expect(productBrand("KHẢO THÍ_IELTS")).toEqual({ slug: "vmt", confirmed: true });
    expect(seed.products.every((p) => p.brand_slug !== null)).toBe(true);
  });

  it("mọi mã gợi ý của ô hành trình trỏ tới ít nhất một sản phẩm", () => {
    for (const n of journey.nodes)
      for (const hint of n.product_code_hints)
        expect(
          seed.products.some((p) => matchesHint(p.code, hint)),
          `${n.code}: ${hint}`,
        ).toBe(true);
  });

  it("địa chỉ sản phẩm không dấu, an toàn cho URL", () => {
    expect(productSlug("TIẾNG TRUNG_GIAO TIẾP")).toBe("tieng-trung-giao-tiep");
    expect(productSlug("SAT_1550+")).toBe("sat-1550-plus");
    expect(productSlug("XKLĐ_HÀN")).toBe("xkld-han");
    expect(productSlug("EAP_IELTS SPEAKING BOOSTER 1.5")).toBe("eap-ielts-speaking-booster-1-5");
  });

  it("staff không thấy mô tả nhắc cam kết đầu ra, editor thấy đủ (Q23)", () => {
    const row = seed.products.find((p) => p.code === "ESL_NEXTGEN")!;
    expect(row.description).toContain("cam kết");
    const staff = seedProductToModel(row, "staff");
    expect(staff.description).toBeNull();
    expect(staff.commitmentWithheld).toBe(true);
    expect(staff.internal).toBeNull();
    const editor = seedProductToModel(row, "editor");
    expect(editor.description).toContain("cam kết");
    expect(editor.commitmentWithheld).toBe(false);
    expect(editor.internal?.lifecycle).toBe("Expansion/Scale");
    // Sản phẩm không nhắc cam kết giữ nguyên mô tả cho staff.
    const plain = seedProductToModel(seed.products.find((p) => p.code === "ESL_KINDY")!, "staff");
    expect(plain.description).not.toBeNull();
    expect(plain.commitmentWithheld).toBe(false);
    expect(redactCommitments(plain, "staff")).toBe(plain);
  });

  it("không sản phẩm nào lộ phần nội bộ hay cam kết cho staff", () => {
    for (const row of seed.products) {
      const staff = seedProductToModel(row, "staff");
      expect(staff.internal, row.code).toBeNull();
      expect(JSON.stringify([staff.description, staff.groupNote, staff.extra]), row.code).not.toMatch(/cam kết/i);
    }
  });

  it("từ điển thương hiệu: tên hiển thị dùng \"Du học nghề\", mô tả và mã giữ nguyên nguồn", () => {
    const kr = seed.products.find((p) => p.code === "XKLĐ_HÀN")!;
    expect(kr.title).toBe("DU HỌC NGHỀ · Hàn Quốc");
    expect(kr.subgroup).toBe("DU HỌC NGHỀ");
    expect(JSON.stringify(seed.products.map((p) => [p.title, p.group, p.subgroup]))).not.toContain("XUẤT KHẨU");
  });

  it("mã gợi ý có dấu sao khớp theo tiền tố", () => {
    expect(matchesHint("DHDH_MỸ", "DHDH_*")).toBe(true);
    expect(matchesHint("DHH_MỸ", "DHDH_*")).toBe(false);
    expect(matchesHint("ESL_KIDS", "ESL_KIDS")).toBe(true);
  });
});
