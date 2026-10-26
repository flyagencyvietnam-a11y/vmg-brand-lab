/** Hồ sơ thương hiệu cho giao diện (từ Brand Book mục 1.3, 2.5, 3.x, 4.2). */
export type BrandProfile = {
  oneLiner: string | null;
  architectureRole: string | null;
  spelling: string | null;
  personaRole: string | null;
  personaVoice: string | null;
  cardColour: string | null;
  /** Bảng định vị mục 3.x: nhãn và các đoạn nội dung, đúng thứ tự nguồn. */
  items: { label: string; value: string[] }[];
};

/** Giá trị một dòng của hồ sơ theo nhãn, ví dụ profileValue(p, "Lời hứa"). */
export function profileValue(profile: BrandProfile | null, label: string): string[] | null {
  return profile?.items.find((i) => i.label === label)?.value ?? null;
}
