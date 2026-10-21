// Cửa vào duy nhất cho mọi thao tác Google Drive (spec 0.1 quy tắc 8, 8.8): không gọi Drive ngoài thư mục này.
// MockDrive nằm ở ./mock và chỉ dùng trong kiểm thử.

export * from "./types";
export { loadDriveConfig, loadServiceAccountCredentials } from "./config";
export type { ServiceAccountCredentials } from "./config";
export { parseDriveFileId } from "./file-id";
export { isInTree } from "./tree";
export { checkLink, type LinkCheck, type LinkStatus, type PinnedState } from "./health";
export { pinForPublish, PublishError, type PinResult } from "./pin";
export { openPinnedDownload, DownloadError, type PublishedFileRef } from "./download";
export {
  checkRegistration,
  ALLOWED_EXTENSIONS,
  type ExistingRegistrations,
  type RegistrationCheck,
  type RegistrationIssue,
} from "./register";
export {
  createGoogleDriveClient,
  createServiceAccountTokenProvider,
  DRIVE_SCOPE_FULL,
  DRIVE_SCOPE_READONLY,
} from "./google-client";
