import "server-only";
import { loadDriveConfig, loadServiceAccountCredentials } from "./config";
import {
  createGoogleDriveClient,
  createServiceAccountTokenProvider,
  DRIVE_SCOPE_FULL,
  DRIVE_SCOPE_READONLY,
} from "./google-client";
import type { DriveClient, DriveConfig } from "./types";

/** Client Drive thật dùng khóa tài khoản dịch vụ từ biến môi trường. Chỉ gọi phía máy chủ. */
export function createDriveFromEnv(): { client: DriveClient; config: DriveConfig } {
  const config = loadDriveConfig();
  const { clientEmail, privateKey } = loadServiceAccountCredentials();
  const getAccessToken = createServiceAccountTokenProvider({
    clientEmail,
    privateKey,
    // Chỉ xin quyền ghi khi thật sự cần ghim bản sửa (Q18).
    scope: config.canPin ? DRIVE_SCOPE_FULL : DRIVE_SCOPE_READONLY,
  });
  return { client: createGoogleDriveClient({ getAccessToken }), config };
}
