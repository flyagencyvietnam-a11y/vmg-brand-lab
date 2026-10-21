import { DriveError, type DriveClient } from "./types";

const MAX_DEPTH = 32;

/**
 * Tệp có nằm dưới thư mục gốc rootId không (spec 6.4.1: chỉ xuất bản tệp trong cây _CHINH_THUC).
 * Đi ngược chuỗi thư mục cha bằng API. Lỗi Drive (quota, gián đoạn) được ném ra, không trả false,
 * để lỗi tạm thời không bị hiểu là "ngoài cây".
 */
export async function isInTree(client: DriveClient, fileId: string, rootId: string): Promise<boolean> {
  const seen = new Set<string>();
  let frontier = [fileId];

  for (let depth = 0; depth < MAX_DEPTH && frontier.length > 0; depth++) {
    const next: string[] = [];
    for (const id of frontier) {
      if (seen.has(id)) continue;
      seen.add(id);
      let parents: string[];
      try {
        parents = (await client.getFile(id)).parents;
      } catch (err) {
        // Không đọc được một thư mục cha giữa chừng nghĩa là không chứng minh được thuộc cây.
        if (err instanceof DriveError && (err.code === "not_found" || err.code === "no_access") && id !== fileId) {
          continue;
        }
        throw err;
      }
      if (parents.includes(rootId)) return true;
      next.push(...parents);
    }
    frontier = next;
  }
  return false;
}
