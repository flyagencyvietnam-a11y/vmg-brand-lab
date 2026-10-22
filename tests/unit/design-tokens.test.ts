import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/design/contrast";
import { avoidPairs, contrastPairs, goldScale, inkScale, redScale, roleHex as documentedRoleHex, roles } from "@/lib/design/tokens";

const css = readFileSync(resolve(import.meta.dirname, "../../app/globals.css"), "utf8");

/** Giá trị thô ở :root, ví dụ --vmg-red-600 -> #be202f. */
const raw = new Map<string, string>();
for (const m of css.matchAll(/(--vmg-[a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)) raw.set(m[1]!, m[2]!.toLowerCase());

/** Vai trò trong @theme: --color-brand -> #be202f (đi qua var(--vmg-...) nếu có). */
const roleHex = new Map<string, string>();
for (const m of css.matchAll(/--color-([a-z0-9-]+):\s*(var\((--vmg-[a-z0-9-]+)\)|#[0-9a-fA-F]{6})/g)) {
  const value = m[3] ? raw.get(m[3]) : m[2]!.toLowerCase();
  if (value) roleHex.set(m[1]!, value);
}

describe("token màu khớp tài liệu", () => {
  it.each([...redScale, ...goldScale, ...inkScale])("$token = $hex", ({ token, hex }) => {
    expect(raw.get(token)).toBe(hex);
  });

  it("không có màu thô nào trong CSS mà trang tài liệu không liệt kê", () => {
    const documented = new Set([...redScale, ...goldScale, ...inkScale].map((s) => s.token));
    const undocumented = [...raw.keys()].filter((t) => !documented.has(t));
    expect(undocumented).toEqual([]);
  });

  it("hai mã chính thức đúng như PDF trang 24: Pantone 200C và 871C", () => {
    expect(raw.get("--vmg-red-600")).toBe("#be202f");
    expect(raw.get("--vmg-gold-700")).toBe("#8b672a");
    // Đối chiếu RGB ghi trong PDF: 200C = 190 32 47, 871C = 139 103 42.
    expect([0xbe, 0x20, 0x2f]).toEqual([190, 32, 47]);
    expect([0x8b, 0x67, 0x2a]).toEqual([139, 103, 42]);
  });

  it.each(Object.entries(documentedRoleHex))("vai trò %s = %s khớp CSS", (name, hex) => {
    expect(roleHex.get(name)).toBe(hex);
  });

  it("mọi vai trò khai báo trong CSS đều có mô tả, và ngược lại", () => {
    expect([...roleHex.keys()].sort()).toEqual(roles.map((r) => r.name).sort());
  });
});

describe("tương phản chữ (WCAG, spec 4.4)", () => {
  it.each(contrastPairs)("$fg trên $bg đạt $min:1 ($use)", ({ fg, bg, min }) => {
    const f = roleHex.get(fg);
    const b = roleHex.get(bg);
    expect(f, `thiếu vai trò ${fg}`).toBeDefined();
    expect(b, `thiếu vai trò ${bg}`).toBeDefined();
    expect(contrastRatio(f!, b!)).toBeGreaterThanOrEqual(min);
  });

  it.each(avoidPairs)("cặp $fg trên $bg đúng là KHÔNG đạt 4,5:1 ($why)", ({ fg, bg }) => {
    expect(contrastRatio(roleHex.get(fg)!, roleHex.get(bg)!)).toBeLessThan(4.5);
  });

  it("hàm tương phản đúng với giá trị đã biết", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
  });
});
