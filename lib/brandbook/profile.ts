import type { BrandProfile } from "./model";
import type { BrandProfileStored } from "./schema";

/** Hồ sơ thương hiệu từ dạng lưu (cột brands.profile, hoặc seed): rỗng thì không có hồ sơ. */
export function profileFromStored(raw: unknown): BrandProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Partial<BrandProfileStored>;
  const items = Array.isArray(p.profile) ? p.profile : [];
  if (items.length === 0 && !p.architecture_role && !p.persona_role && !p.one_liner) return null;
  return {
    oneLiner: p.one_liner ?? null,
    architectureRole: p.architecture_role ?? null,
    spelling: p.spelling ?? null,
    personaRole: p.persona_role ?? null,
    personaVoice: p.persona_voice ?? null,
    cardColour: p.card_colour ?? null,
    items: items.map((i) => ({ label: i.label, value: i.value })),
  };
}
