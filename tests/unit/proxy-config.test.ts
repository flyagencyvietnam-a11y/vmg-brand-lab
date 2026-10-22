import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi as vitest } from "vitest";
import { GET } from "@/app/config-error/route";
import { vi } from "@/lib/i18n/vi";
import { CONFIG_ERROR_PATH, updateSession } from "@/lib/supabase/proxy";

const req = (path: string) => new NextRequest(new URL(path, "https://brand-lab.example"));

beforeEach(() => {
  vitest.stubEnv("BRAND_LAB_DEV_SEED", "");
  vitest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vitest.unstubAllEnvs();
  vitest.restoreAllMocks();
});

describe("thiếu cấu hình Supabase: đóng cửa và báo lỗi rõ ràng", () => {
  beforeEach(() => {
    vitest.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vitest.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
  });

  it.each(["/", "/login", "/brand/journey", "/design-system", "/brand/journey/stage/s2"])(
    "%s được chuyển sang trang báo lỗi",
    async (path) => {
      const res = await updateSession(req(path));
      expect(res.headers.get("x-middleware-rewrite")).toContain(CONFIG_ERROR_PATH);
    },
  );

  it("không bao giờ cho vào trang nào mà không đăng nhập (không có phản hồi next ngoài trang báo lỗi)", async () => {
    for (const path of ["/", "/brand/journey", "/design-system"]) {
      const res = await updateSession(req(path));
      expect(res.headers.get("x-middleware-next")).toBeNull();
    }
  });

  it("chính trang báo lỗi được phục vụ, không lặp vô hạn", async () => {
    const res = await updateSession(req(CONFIG_ERROR_PATH));
    expect(res.headers.get("x-middleware-next")).toBe("1");
    expect(res.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("ghi chi tiết vào log máy chủ", async () => {
    await updateSession(req("/"));
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("NEXT_PUBLIC_SUPABASE_URL"));
  });

  it("thiếu chỉ một trong hai biến cũng coi là chưa cấu hình", async () => {
    vitest.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://x.supabase.co");
    const res = await updateSession(req("/"));
    expect(res.headers.get("x-middleware-rewrite")).toContain(CONFIG_ERROR_PATH);
  });
});

describe("đã cấu hình đủ", () => {
  it("trang báo lỗi chuyển về trang chủ", async () => {
    vitest.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://x.supabase.co");
    vitest.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    const res = await updateSession(req(CONFIG_ERROR_PATH));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/");
  });
});

describe("trang báo lỗi /config-error", () => {
  it("trả mã 503 thật, không lưu đệm, kèm Retry-After", () => {
    const res = GET();
    expect(res.status).toBe(503);
    expect(res.headers.get("content-type")).toContain("text/html");
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.headers.get("retry-after")).toBe("300");
  });

  it("nội dung tiếng Việt, tự chứa, không nêu tên biến hay hạ tầng", async () => {
    const body = await GET().text();
    expect(body).toContain('lang="vi"');
    expect(body).toContain(vi.configError.title);
    expect(body).toContain(vi.configError.lead);
    expect(body).not.toMatch(/NEXT_PUBLIC|SUPABASE|Supabase|Vercel|\.env/);
  });

  it("chỉ dùng hai tệp tĩnh có sẵn trong public/brand, không gọi tài nguyên nào khác", async () => {
    const body = await GET().text();
    const urls = new Set([...body.matchAll(/(?:src="|url\()(\/[\w./-]+)/g)].map((m) => m[1]));
    expect(urls).toEqual(new Set(["/brand/vmg-pattern.svg", "/brand/vmg-symbol.svg"]));
  });
});
