import { connection } from "next/server";
import { isDevSeedMode } from "@/lib/dev-seed";
import { getViewer } from "@/lib/auth/viewer";
import { createClient } from "@/lib/supabase/server";
import { toNode, todayVn, type JourneyMap, type NodeSourceRow } from "./model";
import { loadSeedJourneyMap } from "./seed-source";

type Row = Record<string, unknown>;

function must<T>(result: { data: T | null; error: { message: string } | null }, what: string): T {
  if (result.error) throw new Error(`Không đọc được ${what}: ${result.error.message}`);
  return result.data ?? ([] as unknown as T);
}

/**
 * Tải bản đồ hành trình cho người dùng hiện tại.
 * - editor, admin: đọc bảng gốc (thấy cả nội dung chưa phát hành, ghi chú chờ xác nhận).
 * - vai trò khác: chỉ đọc view v_usable_journey_* (bản có hiệu lực, đã ẩn ghi chú và cam kết chưa xác nhận).
 * RLS của cơ sở dữ liệu là lớp bảo vệ thật; lựa chọn ở đây chỉ để chọn đúng nguồn.
 */
export async function loadJourneyMap(): Promise<JourneyMap> {
  // Ngày hôm nay quyết định mốc thời gian nào hiện ra, nên phải tính lúc có yêu cầu, không lúc prerender.
  await connection();
  const today = todayVn();
  if (isDevSeedMode()) return loadSeedJourneyMap("editor", today);

  const viewer = await getViewer();
  if (!viewer) throw new Error("Chưa đăng nhập hoặc tài khoản không còn hoạt động.");
  const audience = viewer.audience;
  const asEditor = audience === "editor";

  const supabase = await createClient();
  const from = (table: string, view: string) => {
    const query = supabase.from(asEditor ? table : view).select("*");
    return asEditor ? query.is("deleted_at", null) : query;
  };

  const [stages, lines, nodes, edges, brands] = await Promise.all([
    from("journey_stages", "v_usable_journey_stages").order("sort"),
    from("journey_lines", "v_usable_journey_lines").order("sort"),
    from("journey_nodes", "v_usable_journey_nodes").order("sort"),
    asEditor
      ? supabase.from("journey_edges").select("*")
      : supabase.from("v_usable_journey_edges").select("*"),
    // RLS của brands: staff chỉ thấy thương hiệu đã phát hành.
    supabase.from("brands").select("id, slug, name_public, color_primary, confirmed").order("sort"),
  ]);

  const stageRows = must(stages, "chặng") as Row[];
  const lineRows = must(lines, "line") as Row[];
  const nodeRows = must(nodes, "ô hành trình") as Row[];
  const edgeRows = must(edges, "đường nối") as Row[];
  const brandRows = must(brands, "thương hiệu") as Row[];

  const slugById = new Map(brandRows.map((b) => [b.id as string, b.slug as string]));
  const codeById = new Map(nodeRows.map((n) => [n.id as string, n.code as string]));

  return {
    audience,
    stages: stageRows.map((s) => ({
      key: s.key as string,
      ageLabel: s.age_label as string,
      title: s.title as string,
      leadProduct: (s.lead_product as string | null) ?? null,
      decider: (s.decider as string | null) ?? null,
      outcomes: (s.outcomes as string[]) ?? [],
      note: (s.note as string | null) ?? null,
      sort: s.sort as number,
    })),
    lines: lineRows.map((l) => ({
      key: l.key as string,
      label: l.label as string,
      description: (l.description as string | null) ?? null,
      kind: l.kind as "primary" | "secondary" | "goal_tier",
      sublanes: (l.sublanes as { key: string; label: string }[]) ?? [],
      sort: l.sort as number,
    })),
    nodes: nodeRows.map((n) => {
      const source = {
        ...n,
        brand_slug: n.brand_id ? (slugById.get(n.brand_id as string) ?? null) : null,
        // View chỉ trả commitment_text khi đã xác nhận, nên có giá trị nghĩa là đã xác nhận.
        commitment_confirmed: asEditor ? n.commitment_confirmed === true : n.commitment_text != null,
      } as unknown as NodeSourceRow;
      return toNode(source, audience, today);
    }),
    edges: edgeRows.flatMap((e) => {
      const from = codeById.get(e.from_node_id as string);
      const to = codeById.get(e.to_node_id as string);
      // Đầu mút không có trong kết quả (ví dụ ô chưa phát hành) thì bỏ đường nối.
      if (!from || !to) return [];
      return [
        {
          from,
          to,
          kind: e.kind as string,
          label: (e.label as string | null) ?? null,
          proposed: e.proposed as boolean,
          twoWay: e.two_way as boolean,
        },
      ];
    }),
    brands: brandRows.map((b) => ({
      slug: b.slug as string,
      name: b.name_public as string,
      colorPrimary: (b.color_primary as string | null) ?? null,
      confirmed: (b.confirmed as boolean) ?? true,
    })),
  };
}
