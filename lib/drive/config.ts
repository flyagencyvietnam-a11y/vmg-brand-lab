import { z } from "zod";
import type { DriveConfig } from "./types";

const envSchema = z.object({
  DRIVE_SHARED_DRIVE_ID: z.string().min(1),
  DRIVE_OFFICIAL_ROOT_ID: z.string().min(1),
  DRIVE_DRAFT_ROOT_ID: z.string().min(1),
  DOWNLOAD_PROXY_MAX_MB: z.coerce.number().positive().default(50),
  DRIVE_SERVICE_ACCOUNT_CAN_PIN: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
});

export function loadDriveConfig(env: Record<string, string | undefined> = process.env): DriveConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Cấu hình Google Drive chưa đủ hoặc sai: ${missing} (xem .env.example).`);
  }
  const e = parsed.data;
  return {
    sharedDriveId: e.DRIVE_SHARED_DRIVE_ID,
    officialRootId: e.DRIVE_OFFICIAL_ROOT_ID,
    draftRootId: e.DRIVE_DRAFT_ROOT_ID,
    proxyMaxBytes: Math.floor(e.DOWNLOAD_PROXY_MAX_MB * 1024 * 1024),
    canPin: e.DRIVE_SERVICE_ACCOUNT_CAN_PIN,
  };
}

export type ServiceAccountCredentials = { clientEmail: string; privateKey: string };

export function loadServiceAccountCredentials(
  env: Record<string, string | undefined> = process.env,
): ServiceAccountCredentials {
  const clientEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = env.GOOGLE_PRIVATE_KEY;
  if (!clientEmail || !rawKey) {
    throw new Error("Thiếu GOOGLE_SERVICE_ACCOUNT_EMAIL hoặc GOOGLE_PRIVATE_KEY (xem .env.example).");
  }
  // Biến môi trường thường chứa \n dạng chuỗi.
  return { clientEmail, privateKey: rawKey.replace(/\\n/g, "\n") };
}
