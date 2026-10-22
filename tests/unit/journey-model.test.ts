import { describe, expect, it } from "vitest";
import { isDevSeedMode } from "@/lib/dev-seed";
import { audienceForRole } from "@/lib/auth/viewer";
import {
  nodeMatches,
  normalizeVi,
  proposedLinks,
  sequenceNeighbours,
  todayVn,
  visibleTimedNotes,
  type JourneyMap,
  type JourneyNode,
} from "@/lib/journey/model";

const notes = [
  { text: "đã xác nhận, đang hiệu lực", valid_from: "2026-09-01", valid_to: "2026-11-30", needs_confirm: false },
  { text: "chưa đến ngày", valid_from: "2026-10-28", valid_to: null, needs_confirm: false },
  { text: "đã hết hạn", valid_from: "2026-01-01", valid_to: "2026-02-01", needs_confirm: false },
  { text: "chưa xác nhận", valid_from: "2026-10-01", valid_to: null, needs_confirm: true },
];

describe("visibleTimedNotes", () => {
  it("staff chỉ thấy mốc đã xác nhận và còn trong thời hạn", () => {
    expect(visibleTimedNotes(notes, "staff", "2026-10-21").map((n) => n.text)).toEqual(["đã xác nhận, đang hiệu lực"]);
  });

  it("mốc hiện đúng từ valid_from và đến hết valid_to", () => {
    expect(visibleTimedNotes(notes, "staff", "2026-10-28").map((n) => n.text)).toEqual([
      "đã xác nhận, đang hiệu lực",
      "chưa đến ngày",
    ]);
    expect(visibleTimedNotes(notes, "staff", "2026-12-01").map((n) => n.text)).toEqual(["chưa đến ngày"]);
  });

  it("editor thấy tất cả kèm cờ chưa xác nhận", () => {
    const all = visibleTimedNotes(notes, "editor", "2026-10-21");
    expect(all).toHaveLength(4);
    expect(all[3]).toMatchObject({ text: "chưa xác nhận", needsConfirm: true });
  });

  it("chịu dữ liệu rỗng", () => {
    expect(visibleTimedNotes(null, "staff", "2026-10-21")).toEqual([]);
    expect(visibleTimedNotes("x", "staff", "2026-10-21")).toEqual([]);
  });
});

describe("todayVn", () => {
  it("dùng múi giờ Asia/Ho_Chi_Minh, không phải UTC", () => {
    // 20:00 UTC ngày 31/12 đã là 03:00 ngày 01/01 ở Việt Nam.
    expect(todayVn(new Date("2026-12-31T20:00:00Z"))).toBe("2027-01-01");
    expect(todayVn(new Date("2026-12-31T16:59:00Z"))).toBe("2026-12-31");
  });
});

describe("normalizeVi và nodeMatches", () => {
  const node = { code: "p07", productName: "DU HỌC DÀI HẠN", itemName: null } as JourneyNode;

  it("bỏ dấu và đ", () => {
    expect(normalizeVi("Đầu ra 5.0")).toBe("dau ra 5.0");
    expect(normalizeVi("DU HỌC")).toBe("du hoc");
  });

  it("tìm không dấu theo tên và mã, bỏ qua truy vấn rỗng", () => {
    expect(nodeMatches(node, "du hoc")).toBe(true);
    expect(nodeMatches(node, "P07")).toBe(true);
    expect(nodeMatches(node, "flyers")).toBe(false);
    expect(nodeMatches(node, "   ")).toBe(false);
  });
});

describe("tra cứu đường nối", () => {
  const map = {
    edges: [
      { from: "a", to: "b", kind: "sequence", label: null, proposed: false, twoWay: false },
      { from: "b", to: "c", kind: "sequence", label: null, proposed: false, twoWay: false },
      { from: "b", to: "x", kind: "b2g_link", label: "đề xuất", proposed: true, twoWay: false },
      { from: "y", to: "b", kind: "same_program", label: "cùng chương trình", proposed: true, twoWay: true },
    ],
  } as JourneyMap;

  it("ô trước và sau chỉ theo đường nối thứ tự", () => {
    expect(sequenceNeighbours(map, "b")).toEqual({ previous: ["a"], next: ["c"] });
  });

  it("đường nối đề xuất không lẫn vào thứ tự, và tính cả hai chiều", () => {
    expect(proposedLinks(map, "b").map((l) => [l.other, l.outgoing])).toEqual([
      ["x", true],
      ["y", false],
    ]);
  });
});

describe("vai trò và chế độ thử", () => {
  it("chỉ editor và admin xem nội dung chưa phát hành", () => {
    expect(audienceForRole("admin")).toBe("editor");
    expect(audienceForRole("editor")).toBe("editor");
    for (const role of ["staff", "backoffice", "guest", "khac"]) expect(audienceForRole(role)).toBe("staff");
  });

  it("chế độ thử không bao giờ bật ở production", () => {
    const env = process.env as Record<string, string | undefined>;
    const saved = { dev: env.BRAND_LAB_DEV_SEED, node: env.NODE_ENV };
    try {
      env.BRAND_LAB_DEV_SEED = "1";
      env.NODE_ENV = "production";
      expect(isDevSeedMode()).toBe(false);
      env.NODE_ENV = "development";
      expect(isDevSeedMode()).toBe(true);
      env.BRAND_LAB_DEV_SEED = "true";
      expect(isDevSeedMode()).toBe(false);
      delete env.BRAND_LAB_DEV_SEED;
      expect(isDevSeedMode()).toBe(false);
    } finally {
      env.BRAND_LAB_DEV_SEED = saved.dev;
      env.NODE_ENV = saved.node;
    }
  });
});
