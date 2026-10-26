import { isDevSeedMode } from "@/lib/dev-seed";
import { getViewer } from "@/lib/auth/viewer";
import { profileFromStored } from "@/lib/brandbook/profile";
import { createClient } from "@/lib/supabase/server";
import { redactCommitments, type Portfolio, type PortfolioBrand, type PortfolioProduct } from "./model";
import { loadSeedPortfolio } from "./seed-source";

type Row = Record<string, unknown>;

function must<T>(result: { data: T | null; error: { message: string } | null }, what: string): T {
  if (result.error) throw new Error(`Không đọc được ${what}: ${result.error.message}`);
  return result.data ?? ([] as unknown as T);
}

const str = (v: unknown): string | null => (typeof v === "string" ? v : null);
const strs = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);

/**
 * Tải danh mục thương hiệu và sản phẩm cho người dùng hiện tại.
 * RLS của brands và products là lớp bảo vệ thật: người dùng thường chỉ thấy bản đã phát hành (is_usable);
 * editor, admin thấy tất cả. Phần nội bộ của sản phẩm (vòng đời, KPI owner...) chỉ đưa vào dữ liệu của editor, admin.
 */
export async function loadPortfolio(): Promise<Portfolio> {
  if (isDevSeedMode()) return loadSeedPortfolio("editor");

  const viewer = await getViewer();
  if (!viewer) throw new Error("Chưa đăng nhập hoặc tài khoản không còn hoạt động.");
  const audience = viewer.audience;

  const supabase = await createClient();
  const [brands, products] = await Promise.all([
    supabase.from("brands").select("*").is("deleted_at", null).order("sort"),
    supabase.from("products").select("*, brand:brands(slug)").is("deleted_at", null).order("sort"),
  ]);
  const brandRows = must(brands, "thương hiệu") as Row[];
  const productRows = must(products, "sản phẩm") as Row[];

  return {
    audience,
    brands: brandRows.map(
      (b): PortfolioBrand => ({
        slug: b.slug as string,
        name: b.name_public as string,
        kind: b.kind as "parent" | "member",
        domain: str(b.domain),
        delivery: str(b.delivery),
        vimiLevel: str(b.vimi_level),
        colorPrimary: str(b.color_primary),
        colorSecondary: str(b.color_secondary),
        colorNote: str(b.color_note),
        confirmed: (b.confirmed as boolean) ?? true,
        releaseStatus: b.release_status as string,
        releaseCondition: str(b.release_condition),
        note: str(b.note),
        sort: b.sort as number,
        profile: profileFromStored(b.profile),
      }),
    ),
    products: productRows.map((p): PortfolioProduct =>
      redactCommitments(
        {
        code: p.code as string,
        slug: (p.slug as string | null) ?? (p.code as string),
        name: p.name as string,
        title: str(p.title) ?? (p.name as string),
        segment: str(p.segment),
        group: str(p.group_name) ?? "",
        groupOrder: (p.group_order as number) ?? 0,
        subgroup: str(p.subgroup) ?? "",
        description: str(p.description),
        audience: strs(p.audience),
        formats: strs(p.formats),
        decider: strs(p.decider),
        groupNote: str(p.group_note),
        extra: (p.extra as Record<string, string>) ?? {},
        brandSlug: (p.brand as { slug?: string } | null)?.slug ?? null,
        brandConfirmed: (p.brand_confirmed as boolean) ?? false,
        sort: (p.sort as number) ?? 0,
        internal:
          audience === "editor"
            ? {
                lifecycle: str(p.lifecycle),
                category: str(p.category),
                kpiOwner: str(p.kpi_owner),
                revenueModel: str(p.revenue_model),
                marketingRole: str(p.marketing_role),
                note: str(p.note),
              }
            : null,
        commitmentWithheld: false,
        },
        audience,
      ),
    ),
  };
}
