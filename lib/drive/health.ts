import { DriveError, type DriveClient, type DriveConfig, type DriveFileMeta } from "./types";
import { isInTree } from "./tree";

/** Giá trị `link_status` của asset_files (spec 7.2). */
export type LinkStatus = "ok" | "drift" | "missing" | "trashed" | "no_access" | "unchecked";

/** Bản đã ghim lúc xuất bản. */
export type PinnedState = {
  driveFileId: string;
  pinnedMd5: string | null;
  pinnedModifiedTime: string | null;
};

export type LinkCheck = {
  status: LinkStatus;
  /** True khi lỗi do hạn mức hoặc Drive gián đoạn: giữ trạng thái cũ, thử lại sau. */
  retryable: boolean;
  meta?: DriveFileMeta;
  inOfficialTree?: boolean;
};

/**
 * Kiểm tra sức khỏe một liên kết: CHỈ đọc siêu dữ liệu, không tải nội dung (spec 6.4.1).
 * - quota và unavailable trả `unchecked` kèm retryable: không được hiểu nhầm là tệp mất.
 * - drift: md5 hoặc modifiedTime khác bản đã ghim (đúng như spec; đổi tên cũng đổi modifiedTime trên Drive).
 */
export async function checkLink(client: DriveClient, file: PinnedState, config: DriveConfig): Promise<LinkCheck> {
  let meta: DriveFileMeta;
  try {
    meta = await client.getFile(file.driveFileId);
  } catch (err) {
    if (err instanceof DriveError) {
      if (err.code === "not_found") return { status: "missing", retryable: false };
      if (err.code === "no_access") return { status: "no_access", retryable: false };
      return { status: "unchecked", retryable: true };
    }
    throw err;
  }

  if (meta.trashed) return { status: "trashed", retryable: false, meta };

  let inOfficialTree: boolean;
  try {
    inOfficialTree = await isInTree(client, file.driveFileId, config.officialRootId);
  } catch (err) {
    if (err instanceof DriveError && (err.code === "quota" || err.code === "unavailable")) {
      return { status: "unchecked", retryable: true, meta };
    }
    throw err;
  }

  const md5Changed = meta.md5Checksum !== file.pinnedMd5;
  const timeChanged = meta.modifiedTime !== file.pinnedModifiedTime;
  return { status: md5Changed || timeChanged ? "drift" : "ok", retryable: false, meta, inOfficialTree };
}
