import { createSign } from "node:crypto";
import { DriveError, type DriveClient, type DriveDownload, type DriveFileMeta } from "./types";

// Drive API v3 qua REST bằng tài khoản dịch vụ (spec 8.1). Không phụ thuộc thư viện googleapis.
// fetch và đồng hồ được truyền vào để kiểm thử mà không gọi mạng.

const API = "https://www.googleapis.com/drive/v3";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const FILE_FIELDS = "id,name,mimeType,size,md5Checksum,modifiedTime,headRevisionId,parents,driveId,trashed";

const QUOTA_REASONS = new Set([
  "userRateLimitExceeded",
  "rateLimitExceeded",
  "dailyLimitExceeded",
  "quotaExceeded",
  "sharingRateLimitExceeded",
]);

export const DRIVE_SCOPE_FULL = "https://www.googleapis.com/auth/drive";
export const DRIVE_SCOPE_READONLY = "https://www.googleapis.com/auth/drive.readonly";

const base64url = (input: string | Buffer) => Buffer.from(input).toString("base64url");

export type TokenProviderOptions = {
  clientEmail: string;
  privateKey: string;
  /** Cần DRIVE_SCOPE_FULL để ghim bản sửa (Q18); chỉ đọc thì DRIVE_SCOPE_READONLY. */
  scope: string;
  fetchImpl?: typeof fetch;
  /** Mili giây. Để kiểm thử. */
  now?: () => number;
  tokenUrl?: string;
};

/** Lấy access token bằng JWT ký RS256, lưu đệm đến lúc sắp hết hạn. */
export function createServiceAccountTokenProvider(opts: TokenProviderOptions): () => Promise<string> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const now = opts.now ?? Date.now;
  const tokenUrl = opts.tokenUrl ?? TOKEN_URL;
  let cached: { token: string; expiresAt: number } | null = null;

  return async () => {
    if (cached && cached.expiresAt - 60_000 > now()) return cached.token;

    const iat = Math.floor(now() / 1000);
    const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const claims = base64url(
      JSON.stringify({ iss: opts.clientEmail, scope: opts.scope, aud: tokenUrl, iat, exp: iat + 3600 }),
    );
    let signature: string;
    try {
      signature = createSign("RSA-SHA256").update(`${header}.${claims}`).sign(opts.privateKey).toString("base64url");
    } catch (err) {
      // Không đưa nội dung khóa vào thông báo lỗi.
      throw new DriveError("no_access", "Không ký được JWT: khóa tài khoản dịch vụ không hợp lệ.", { cause: err });
    }

    let res: Response;
    try {
      res = await fetchImpl(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion: `${header}.${claims}.${signature}`,
        }),
      });
    } catch (err) {
      throw new DriveError("unavailable", "Không kết nối được máy chủ xác thực Google.", { cause: err });
    }
    if (!res.ok) {
      throw new DriveError(res.status >= 500 ? "unavailable" : "no_access", `Google từ chối cấp token (HTTP ${res.status}).`);
    }
    const body = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!body.access_token) throw new DriveError("no_access", "Google không trả access_token.");
    cached = { token: body.access_token, expiresAt: now() + (body.expires_in ?? 3600) * 1000 };
    return cached.token;
  };
}

async function toDriveError(res: Response): Promise<DriveError> {
  let reason = "";
  try {
    const body = (await res.json()) as { error?: { errors?: { reason?: string }[]; status?: string } };
    reason = body.error?.errors?.[0]?.reason ?? body.error?.status ?? "";
  } catch {
    // Thân phản hồi không phải JSON: dựa vào mã HTTP.
  }
  const message = `Drive API HTTP ${res.status}${reason ? ` (${reason})` : ""}`;
  // Drive cũng trả 404 khi tài khoản dịch vụ không thấy tệp, nên not_found có thể là mất quyền.
  if (res.status === 404) return new DriveError("not_found", message);
  if (res.status === 429 || (res.status === 403 && QUOTA_REASONS.has(reason))) return new DriveError("quota", message);
  if (res.status === 401 || res.status === 403) return new DriveError("no_access", message);
  return new DriveError("unavailable", message);
}

type RawFile = {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  md5Checksum?: string;
  modifiedTime: string;
  headRevisionId?: string;
  parents?: string[];
  driveId?: string;
  trashed?: boolean;
};

function toMeta(raw: RawFile): DriveFileMeta {
  return {
    id: raw.id,
    name: raw.name,
    mimeType: raw.mimeType,
    size: raw.size === undefined ? null : Number(raw.size),
    md5Checksum: raw.md5Checksum ?? null,
    modifiedTime: raw.modifiedTime,
    headRevisionId: raw.headRevisionId ?? null,
    parents: raw.parents ?? [],
    driveId: raw.driveId ?? null,
    trashed: raw.trashed ?? false,
  };
}

export function createGoogleDriveClient(opts: {
  getAccessToken: () => Promise<string>;
  fetchImpl?: typeof fetch;
}): DriveClient {
  const fetchImpl = opts.fetchImpl ?? fetch;

  async function request(url: string, init: RequestInit = {}): Promise<Response> {
    const token = await opts.getAccessToken();
    let res: Response;
    try {
      res = await fetchImpl(url, { ...init, headers: { ...init.headers, Authorization: `Bearer ${token}` } });
    } catch (err) {
      throw new DriveError("unavailable", "Không kết nối được Google Drive.", { cause: err });
    }
    if (!res.ok) throw await toDriveError(res);
    return res;
  }

  const toDownload = (res: Response): DriveDownload => {
    if (!res.body) throw new DriveError("unavailable", "Drive không trả nội dung tệp.");
    const length = res.headers.get("content-length");
    return { stream: res.body, contentLength: length === null ? null : Number(length) };
  };

  const fileUrl = (id: string) => `${API}/files/${encodeURIComponent(id)}`;

  return {
    async getFile(fileId) {
      const res = await request(`${fileUrl(fileId)}?fields=${FILE_FIELDS}&supportsAllDrives=true`);
      return toMeta((await res.json()) as RawFile);
    },
    async downloadHead(fileId) {
      return toDownload(await request(`${fileUrl(fileId)}?alt=media&supportsAllDrives=true`));
    },
    async downloadRevision(fileId, revisionId) {
      return toDownload(await request(`${fileUrl(fileId)}/revisions/${encodeURIComponent(revisionId)}?alt=media`));
    },
    async pinRevision(fileId, revisionId) {
      await request(`${fileUrl(fileId)}/revisions/${encodeURIComponent(revisionId)}?fields=id,keepForever`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keepForever: true }),
      });
    },
  };
}
