import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { BrandProfile } from "./model";
import { profileFromStored } from "./profile";
import { brandBookSeedSchema, buildBrandProfileUpdates } from "./schema";

/** Hồ sơ từng thương hiệu từ seed (chế độ thử cục bộ), theo slug. */
export function loadSeedBrandProfiles(): Map<string, BrandProfile> {
  const file = resolve(/*turbopackIgnore: true*/ process.cwd(), "seed/brand-book.json");
  const seed = brandBookSeedSchema.parse(JSON.parse(readFileSync(file, "utf8")));
  const out = new Map<string, BrandProfile>();
  for (const u of buildBrandProfileUpdates(seed)) {
    const p = profileFromStored(u.profile);
    if (p) out.set(u.slug, p);
  }
  return out;
}
