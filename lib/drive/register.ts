import { DriveError, GOOGLE_FOLDER_MIME, isGoogleNative, type DriveClient, type DriveConfig, type DriveFileMeta } from "./types";
import { isInTree } from "./tree";

/** Định dạng chấp nhận đăng ký (spec 6.4). */
export const ALLOWED_EXTENSIONS = ["pdf", "pptx", "docx", "xlsx", "png", "jpg", "jpeg", "svg", "ai", "psd", "mp4", "zip"] as const;

export type RegistrationIssue = {
  code:
    | "unreadable"
    | "trashed"
    | "folder"
    | "wrong_drive"
    | "format_not_allowed"
    | "duplicate_file"
    | "duplicate_md5"
    | "not_in_draft_or_official"
    | "draft_only_outside_official"
    | "google_native";
  severity: "error" | "warning";
  message: string;
};

export type RegistrationCheck = {
  ok: boolean;
  meta?: DriveFileMeta;
  inOfficialTree?: boolean;
  issues: RegistrationIssue[];
};

export type ExistingRegistrations = {
  fileIds: ReadonlySet<string>;
  md5s: ReadonlySet<string>;
};

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

/**
 * Kiểm tra trước khi đăng ký tài sản (spec 6.4.1, bước 2). `intent = 'publish'` đòi tệp nằm trong
 * _CHINH_THUC; `'draft'` cho phép cả _NHAP. Lỗi Drive tạm thời (quota, gián đoạn) được ném ra.
 */
export async function checkRegistration(
  client: DriveClient,
  fileId: string,
  config: DriveConfig,
  existing: ExistingRegistrations,
  intent: "draft" | "publish",
): Promise<RegistrationCheck> {
  const issues: RegistrationIssue[] = [];

  let meta: DriveFileMeta;
  try {
    meta = await client.getFile(fileId);
  } catch (err) {
    if (err instanceof DriveError && (err.code === "not_found" || err.code === "no_access")) {
      issues.push({
        code: "unreadable",
        severity: "error",
        message: "Tài khoản dịch vụ không đọc được tệp này. Kiểm tra tệp nằm trong Shared Drive đã cấu hình.",
      });
      return { ok: false, issues };
    }
    throw err;
  }

  if (meta.trashed) {
    issues.push({ code: "trashed", severity: "error", message: "Tệp đang ở thùng rác." });
  }
  if (meta.mimeType === GOOGLE_FOLDER_MIME) {
    issues.push({ code: "folder", severity: "error", message: "Đây là thư mục, hãy chọn một tệp." });
  }
  if (meta.driveId !== config.sharedDriveId) {
    issues.push({ code: "wrong_drive", severity: "error", message: "Tệp không thuộc Shared Drive đã cấu hình." });
  }

  if (isGoogleNative(meta.mimeType)) {
    issues.push({
      code: "google_native",
      severity: "warning",
      message: "Tệp Google gốc không ghim được bản sửa; chỉ nên dùng làm tệp nguồn, tệp chính cần là PDF, PPTX, XLSX, PNG...",
    });
  } else if (!(ALLOWED_EXTENSIONS as readonly string[]).includes(extensionOf(meta.name))) {
    issues.push({
      code: "format_not_allowed",
      severity: "error",
      message: `Định dạng chưa được chấp nhận. Cho phép: ${ALLOWED_EXTENSIONS.join(", ")}.`,
    });
  }

  if (existing.fileIds.has(meta.id)) {
    issues.push({ code: "duplicate_file", severity: "error", message: "Tệp này đã được đăng ký." });
  }
  if (meta.md5Checksum !== null && existing.md5s.has(meta.md5Checksum)) {
    issues.push({ code: "duplicate_md5", severity: "error", message: "Đã có tệp trùng nội dung được đăng ký." });
  }

  const inOfficialTree = await isInTree(client, fileId, config.officialRootId);
  if (!inOfficialTree) {
    const inDraftTree = await isInTree(client, fileId, config.draftRootId);
    if (!inDraftTree) {
      issues.push({
        code: "not_in_draft_or_official",
        severity: "error",
        message: "Tệp phải nằm trong thư mục _NHAP hoặc _CHINH_THUC của Shared Drive.",
      });
    } else if (intent === "publish") {
      issues.push({
        code: "draft_only_outside_official",
        severity: "error",
        message: "Tệp ở _NHAP chỉ đăng ký được ở trạng thái nháp. Hãy chuyển tệp vào _CHINH_THUC để xuất bản.",
      });
    }
  }

  return { ok: !issues.some((i) => i.severity === "error"), meta, inOfficialTree, issues };
}
