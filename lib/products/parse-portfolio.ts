// Đọc VMG_Product_Portfolio_2026.md (file R&D, đặt ở docs/source/) thành danh sách sản phẩm. Không gõ lại bằng tay
// (spec Phụ lục A.2): mọi chữ của sản phẩm đến từ file nguồn; ở đây chỉ tách cấu trúc và gán thương hiệu theo bảng A.2.
//
// Hai kiểu mục trong file nguồn:
//   - Mục chi tiết: "#### 1. KINDY - E-PIONEER" kèm bảng "Thuộc tính | Nội dung".
//   - Bảng nhóm: mỗi dòng một sản phẩm, có cột "Mã SP" (SAT, TESOL, VSTEP, Du học, Khảo thí, A01-D01).
// Dòng "> ..." và "**Mô hình doanh thu:** ..." dưới tiêu đề nhóm là thông tin chung của cả nhóm.

export type PortfolioProduct = {
  code: string;
  /** Tên chuẩn trong danh mục (vế sau dấu gạch ở mục chi tiết, hoặc ô đầu của dòng trong bảng nhóm). */
  name: string;
  /** Tên hiển thị: tên chuẩn, hoặc "nhóm con · tên" cho dòng bảng nhóm đứng một mình ("Mỹ" -> "DU HỌC DÀI HẠN · Mỹ"). */
  title: string;
  /** Phân khúc đứng trước dấu gạch ở mục chi tiết (KINDY, KIDS, TEENS...). */
  segment: string | null;
  /** Nhóm lớn ("NGÔN NGỮ") và nhóm con ("ENGLISH AS A SECOND LANGUAGE (ESL)"). */
  group: string;
  groupOrder: number;
  subgroup: string;
  description: string | null;
  audience: string[];
  formats: string[];
  decider: string[];
  revenueModel: string | null;
  category: string | null;
  lifecycle: string | null;
  kpiOwner: string | null;
  marketingRole: string | null;
  /** Ghi chú riêng của mục (nội bộ). */
  note: string | null;
  /** Ghi chú chung của nhóm con ("Tất cả: ..."). */
  groupNote: string | null;
  /** Cột khác của bảng nhóm (Thời lượng, Điểm nổi bật...). */
  extra: Record<string, string>;
  sort: number;
};

const clean = (s: string) => s.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
const splitList = (s: string) =>
  clean(s)
    .split(/,\s*/)
    .map((x) => x.trim())
    .filter(Boolean);

function tableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => clean(c));
}
const isTableLine = (l: string) => l.trim().startsWith("|");

/** "02. LUYỆN THI - HƯỚNG NGHIỆP" -> { order: 2, title: "LUYỆN THI - HƯỚNG NGHIỆP" }; bỏ phần "(Brand: VMP)". */
function groupTitle(raw: string): { order: number; title: string } {
  const m = /^(\d+)\.\s*(.+)$/.exec(raw.trim());
  const order = m ? Number(m[1]) : 0;
  const title = (m ? m[2]! : raw).replace(/\s*\([^)]*\)\s*$/, "").trim();
  return { order, title };
}

/** Tên nhóm con rút gọn dùng làm tiền tố khi tên dòng đơn độc không đủ nghĩa ("Mỹ" -> "DU HỌC DÀI HẠN · Mỹ"). */
function subgroupShort(raw: string): string {
  return raw.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

const FIELD_KEYS: Record<string, keyof PortfolioProduct> = {
  "Mã SP": "code",
  "Mô tả": "description",
  "Đối tượng học": "audience",
  "Hình thức": "formats",
  "Người quyết định": "decider",
  "Mô hình doanh thu": "revenueModel",
  "Phân loại SP": "category",
  "Vòng đời": "lifecycle",
  "KPI Owner": "kpiOwner",
  "Vai trò Marketing": "marketingRole",
  "Ghi chú đặc biệt": "note",
};

function blank(group: string, groupOrder: number, subgroup: string, groupNote: string | null): Omit<PortfolioProduct, "code" | "name" | "title" | "sort"> {
  return {
    segment: null,
    group,
    groupOrder,
    subgroup,
    description: null,
    audience: [],
    formats: [],
    decider: [],
    revenueModel: null,
    category: null,
    lifecycle: null,
    kpiOwner: null,
    marketingRole: null,
    note: null,
    groupNote,
    extra: {},
  };
}

export function parsePortfolio(markdown: string): PortfolioProduct[] {
  const lines = markdown.split(/\r?\n/);
  const products: PortfolioProduct[] = [];

  let group = "";
  let groupOrder = 0;
  let subgroup = "";
  let groupNote: string[] = [];
  let groupFacts: Record<string, string> = {};
  let started = false;

  const add = (p: Omit<PortfolioProduct, "sort">) => products.push({ ...p, sort: products.length + 1 });

  // Dòng "**Mô hình doanh thu:** ..." có thể nằm trước hoặc sau bảng, nên áp cho cả nhóm con khi nhóm kết thúc;
  // chỉ điền chỗ sản phẩm chưa có giá trị riêng.
  let groupStart = 0;
  const flushFacts = () => {
    const marketing = Object.entries(groupFacts).find(([k]) => k.startsWith("Vai trò Marketing"))?.[1] ?? null;
    for (const p of products.slice(groupStart)) {
      p.revenueModel ??= groupFacts["Mô hình doanh thu"] ?? null;
      p.category ??= groupFacts["Phân loại SP"] ?? null;
      p.marketingRole ??= marketing;
    }
    groupStart = products.length;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    const h2 = /^##\s+(.+)$/.exec(line);
    if (h2) {
      const raw = h2[1]!.trim();
      // Chỉ các mục đánh số "01." đến "05." là sản phẩm; các bảng tổng hợp ở cuối không phải.
      if (/^\d+\./.test(raw)) {
        const g = groupTitle(raw);
        group = g.title;
        groupOrder = g.order;
        started = true;
      } else if (started) {
        break;
      }
      flushFacts();
      subgroup = "";
      groupNote = [];
      groupFacts = {};
      continue;
    }
    if (!started) continue;

    const h3 = /^###\s+(.+)$/.exec(line);
    if (h3) {
      flushFacts();
      subgroup = clean(h3[1]!);
      groupNote = [];
      groupFacts = {};
      continue;
    }

    if (line.startsWith(">")) {
      groupNote.push(clean(line.replace(/^>\s*/, "")));
      continue;
    }
    const fact = /^\*\*([^*:]+):\*\*\s*(.+)$/.exec(line.trim());
    if (fact) {
      groupFacts[fact[1]!.trim()] = clean(fact[2]!);
      continue;
    }

    // Mục chi tiết: "#### 1. KINDY - E-PIONEER" hoặc "#### ESL B2G (Trường học)".
    const h4 = /^####\s+(?:\d+\.\s*)?(.+)$/.exec(line);
    if (h4) {
      const heading = clean(h4[1]!);
      const fields: Record<string, string> = {};
      let j = i + 1;
      while (j < lines.length && !isTableLine(lines[j]!) && lines[j]!.trim() === "") j++;
      for (; j < lines.length && isTableLine(lines[j]!); j++) {
        const cells = tableCells(lines[j]!);
        if (cells.length >= 2 && cells[0] !== "Thuộc tính" && !/^:?-+:?$/.test(cells[0]!)) fields[cells[0]!] = cells[1]!;
      }
      const code = fields["Mã SP"];
      if (!code) continue;
      const dash = heading.indexOf(" - ");
      const segment = dash > 0 ? heading.slice(0, dash) : null;
      const name = dash > 0 ? heading.slice(dash + 3) : heading;
      const base = blank(group, groupOrder, subgroup, groupNote.length > 0 ? groupNote.join(" ") : null);
      const p: Omit<PortfolioProduct, "sort"> = { ...base, code, name, title: name, segment };
      for (const [label, value] of Object.entries(fields)) {
        const key = FIELD_KEYS[label];
        if (!key || key === "code") continue;
        if (key === "audience" || key === "formats" || key === "decider") p[key] = splitList(value);
        else (p as Record<string, unknown>)[key] = value;
      }
      add(p);
      i = j - 1;
      continue;
    }

    // Bảng nhóm: tiêu đề cột có "Mã SP".
    if (isTableLine(line)) {
      const header = tableCells(line);
      const codeCol = header.indexOf("Mã SP");
      if (codeCol < 0) {
        // Bảng không phải bảng sản phẩm (ví dụ bảng "Thuộc tính" đã xử lý ở trên): bỏ qua tới hết bảng.
        while (i + 1 < lines.length && isTableLine(lines[i + 1]!)) i++;
        continue;
      }
      let j = i + 1;
      for (; j < lines.length && isTableLine(lines[j]!); j++) {
        const cells = tableCells(lines[j]!);
        if (cells.every((c) => /^:?-+:?$/.test(c)) || cells[codeCol] === undefined) continue;
        const row: Record<string, string> = {};
        header.forEach((h, k) => (row[h] = cells[k] ?? ""));
        const first = header[0 === codeCol ? 1 : 0]!;
        const name = row[first]!;
        const base = blank(group, groupOrder, subgroup, groupNote.length > 0 ? groupNote.join(" ") : null);
        const p: Omit<PortfolioProduct, "sort"> = {
          ...base,
          code: row["Mã SP"]!,
          name,
          title: rowTitle(name, subgroup),
          revenueModel: groupFacts["Mô hình doanh thu"] ?? null,
          category: groupFacts["Phân loại SP"] ?? null,
          marketingRole: Object.entries(groupFacts).find(([k]) => k.startsWith("Vai trò Marketing"))?.[1] ?? null,
        };
        for (const [label, value] of Object.entries(row)) {
          if (label === first || label === "Mã SP" || value === "") continue;
          if (label === "Hình thức") p.formats = splitList(value);
          else if (label === "Phân loại") p.category = value;
          else if (label === "Vòng đời") p.lifecycle = value;
          else if (label === "KPI Owner") p.kpiOwner = value;
          else if (label === "Mô hình doanh thu") p.revenueModel = value;
          else if (label === "Mô tả ngắn" || label === "Mô tả" || label === "Điểm nổi bật" || label === "Ghi chú") {
            p.description = p.description ? `${p.description}. ${value}` : value;
          } else p.extra[label] = value;
        }
        add(p);
      }
      i = j - 1;
    }
  }

  flushFacts();
  return products;
}

/** Dòng bảng nhóm: tên đứng một mình ("Mỹ") được đặt sau tên nhóm con; không lặp khi tên đã chứa nhóm ("TESOL 120H"). */
function rowTitle(name: string, subgroup: string): string {
  const sub = subgroupShort(subgroup);
  if (!sub) return name;
  const lower = name.toLowerCase();
  const subLower = sub.toLowerCase();
  if (lower.includes(subLower.split(" ")[0]!) || subLower.includes(lower)) return name;
  return `${sub} · ${name}`;
}

// Gán thương hiệu theo Phụ lục A.2 của spec (gợi ý, cần chủ sản phẩm xác nhận); `confirmed` theo cột `brand_confirmed`.
const BRAND_RULES: { match: (code: string) => boolean; slug: string; confirmed: boolean }[] = [
  { match: (c) => c === "ESL_KINDY" || c === "ESL_KIDS" || c === "ESL_SUMMERSCHOOL", slug: "vmg-english", confirmed: true },
  { match: (c) => c === "ESL_NEXTGEN", slug: "vmg-ielts", confirmed: true },
  { match: (c) => c === "ESL_EPLUS", slug: "vmg-english", confirmed: false },
  { match: (c) => c.startsWith("TIẾNG TRUNG_"), slug: "vmg-chinese", confirmed: true },
  { match: (c) => c.startsWith("EAP_"), slug: "vmg-ielts", confirmed: true },
  { match: (c) => c.startsWith("TESOL_"), slug: "vmg-tesol", confirmed: true },
  { match: (c) => c.startsWith("ESL FLEXTRACK_"), slug: "vmg-english", confirmed: false },
  { match: (c) => c.startsWith("A01-D01_"), slug: "vmg-e-academy", confirmed: false },
  { match: (c) => c.startsWith("SAT_"), slug: "vmg-english", confirmed: false },
  { match: (c) => c.startsWith("VSTEP_"), slug: "vmg-english", confirmed: false },
  { match: (c) => c.startsWith("DHH_") || c.startsWith("DHDH_") || c === "DHCG" || c.startsWith("XKLĐ_"), slug: "vmp", confirmed: true },
  { match: (c) => c.startsWith("KHẢO THÍ_"), slug: "vmt", confirmed: true },
  { match: (c) => c === "B2G_ESL", slug: "vmg-english", confirmed: false },
];

export function productBrand(code: string): { slug: string; confirmed: boolean } | null {
  const rule = BRAND_RULES.find((r) => r.match(code));
  return rule ? { slug: rule.slug, confirmed: rule.confirmed } : null;
}

/** Địa chỉ trang sản phẩm: mã không dấu, chữ thường, nối bằng gạch ("TIẾNG TRUNG_HSK" -> "tieng-trung-hsk"). */
export function productSlug(code: string): string {
  return code
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .replace(/\+/g, "-plus")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Mã gợi ý của ô hành trình có thể kết thúc bằng "*" ("DHDH_*"): khớp mọi sản phẩm bắt đầu bằng phần trước dấu "*". */
export function matchesHint(code: string, hint: string): boolean {
  return hint.endsWith("*") ? code.startsWith(hint.slice(0, -1)) : code === hint;
}
