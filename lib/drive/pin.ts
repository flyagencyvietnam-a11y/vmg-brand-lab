import { DriveError, isGoogleNative, type DriveClient, type DriveConfig } from "./types";
import { isInTree } from "./tree";

export type PinResult = {
  /** Bản sửa người dùng thường sẽ tải. Rỗng với tệp Google gốc. */
  revisionId: string | null;
  md5: string | null;
  modifiedTime: string;
  /** Đã đặt keepForever trên Drive hay chưa. */
  pinned: boolean;
  /** Lý do không ghim: để giao diện cảnh báo quản trị. */
  skipped?: "google_native" | "pin_disabled" | "no_write_access";
};

export class PublishError extends Error {
  constructor(
    readonly code: "not_in_official_tree" | "trashed" | "wrong_drive",
    message: string,
  ) {
    super(message);
    this.name = "PublishError";
  }
}

/**
 * Chuẩn bị xuất bản một tệp (spec 6.4.1, bước 6): kiểm tra thuộc _CHINH_THUC rồi ghim bản sửa.
 * Lỗi quota hoặc gián đoạn được ném ra (không xuất bản khi chưa chắc đã ghim được).
 * Mất quyền ghi (Q18) thì bỏ qua ghim và chỉ dựa vào phát hiện lệch.
 */
export async function pinForPublish(client: DriveClient, fileId: string, config: DriveConfig): Promise<PinResult> {
  const meta = await client.getFile(fileId);

  if (meta.trashed) throw new PublishError("trashed", "Tệp đang ở thùng rác, không xuất bản được.");
  if (meta.driveId !== config.sharedDriveId) {
    throw new PublishError("wrong_drive", "Tệp không thuộc Shared Drive đã cấu hình.");
  }
  if (!(await isInTree(client, fileId, config.officialRootId))) {
    throw new PublishError("not_in_official_tree", "Chỉ xuất bản được tệp nằm trong thư mục _CHINH_THUC.");
  }

  const base = { md5: meta.md5Checksum, modifiedTime: meta.modifiedTime };

  // Tệp Google gốc không ghim được bản sửa theo cách này; chỉ phát hiện lệch theo modifiedTime.
  if (isGoogleNative(meta.mimeType) || meta.headRevisionId === null) {
    return { ...base, revisionId: null, pinned: false, skipped: "google_native" };
  }
  if (!config.canPin) {
    return { ...base, revisionId: meta.headRevisionId, pinned: false, skipped: "pin_disabled" };
  }

  try {
    await client.pinRevision(fileId, meta.headRevisionId);
  } catch (err) {
    if (err instanceof DriveError && err.code === "no_access") {
      return { ...base, revisionId: meta.headRevisionId, pinned: false, skipped: "no_write_access" };
    }
    throw err;
  }
  return { ...base, revisionId: meta.headRevisionId, pinned: true };
}
