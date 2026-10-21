// Giao diện duy nhất giữa Brand Lab và Google Drive (spec 6.4.1, 8.1).
// Cố ý hẹp: chỉ đọc siêu dữ liệu, tải nội dung, tải bản sửa cụ thể và ghim bản sửa.
// Không có hàm tạo, sửa, xóa tệp.

export type DriveFileMeta = {
  id: string;
  name: string;
  mimeType: string;
  /** Rỗng với tệp Google gốc (Docs, Slides, Sheets) và thư mục. */
  size: number | null;
  /** Rỗng với tệp Google gốc và thư mục. */
  md5Checksum: string | null;
  /** ISO 8601. */
  modifiedTime: string;
  /** Rỗng với tệp Google gốc và thư mục. */
  headRevisionId: string | null;
  parents: string[];
  /** Id Shared Drive chứa tệp; rỗng nếu tệp không thuộc Shared Drive. */
  driveId: string | null;
  trashed: boolean;
};

export type DriveDownload = {
  stream: ReadableStream<Uint8Array>;
  contentLength: number | null;
};

/**
 * not_found: không tìm thấy (Drive cũng trả 404 khi tài khoản dịch vụ không thấy tệp).
 * no_access: mất quyền.
 * quota: hết hạn mức gọi API. KHÔNG được hiểu là tệp mất (spec 6.4.1).
 * unavailable: Drive gián đoạn hoặc lỗi mạng.
 */
export type DriveErrorCode = "not_found" | "no_access" | "quota" | "unavailable";

export class DriveError extends Error {
  constructor(
    readonly code: DriveErrorCode,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "DriveError";
  }
}

export interface DriveClient {
  getFile(fileId: string): Promise<DriveFileMeta>;
  /** Nội dung bản mới nhất. Chỉ dành cho đăng ký (sinh thumbnail), không dùng cho người dùng thường. */
  downloadHead(fileId: string): Promise<DriveDownload>;
  downloadRevision(fileId: string, revisionId: string): Promise<DriveDownload>;
  /** Đặt keepForever cho bản sửa. Chỉ áp dụng cho tệp nhị phân. */
  pinRevision(fileId: string, revisionId: string): Promise<void>;
}

export const GOOGLE_FOLDER_MIME = "application/vnd.google-apps.folder";

export function isGoogleNative(mimeType: string): boolean {
  return mimeType.startsWith("application/vnd.google-apps.");
}

export type DriveConfig = {
  sharedDriveId: string;
  officialRootId: string;
  draftRootId: string;
  proxyMaxBytes: number;
  /** Q18: tài khoản dịch vụ có quyền ghi để ghim bản sửa hay không (service_account_can_pin). */
  canPin: boolean;
};

/** Thông báo thân thiện cho người dùng, không lộ lỗi kỹ thuật (spec 6.4.1). */
export function driveErrorMessage(code: DriveErrorCode): string {
  switch (code) {
    case "quota":
      return "Hệ thống tạm thời quá tải, vui lòng thử lại sau ít phút.";
    case "unavailable":
      return "Chưa kết nối được kho tài liệu, vui lòng thử lại sau ít phút.";
    case "not_found":
    case "no_access":
      return "Tài liệu tạm thời không tải được, đã báo Marketing.";
  }
}
