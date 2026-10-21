import { createVerify, generateKeyPairSync } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import {
  checkLink,
  checkRegistration,
  createGoogleDriveClient,
  createServiceAccountTokenProvider,
  DownloadError,
  DriveError,
  driveErrorMessage,
  isInTree,
  loadDriveConfig,
  loadServiceAccountCredentials,
  openPinnedDownload,
  parseDriveFileId,
  pinForPublish,
  PublishError,
  type DriveConfig,
} from "@/lib/drive";
import { MockDrive, readAll } from "@/lib/drive/mock";

let drive: MockDrive;
let official: string;
let draft: string;
let ieltsFolder: string;
let config: DriveConfig;

beforeEach(() => {
  drive = new MockDrive();
  official = drive.addFolder("_CHINH_THUC");
  draft = drive.addFolder("_NHAP");
  ieltsFolder = drive.addFolder("IELTS", drive.addFolder("VMG IELTS", official));
  config = {
    sharedDriveId: drive.driveId,
    officialRootId: official,
    draftRootId: draft,
    proxyMaxBytes: 50 * 1024 * 1024,
    canPin: true,
  };
});

const noExisting = { fileIds: new Set<string>(), md5s: new Set<string>() };

describe("parseDriveFileId", () => {
  const id = "1AbCdEfGhIjKlMnOpQrStUvWxYz_-0123";
  it.each([
    [`https://drive.google.com/file/d/${id}/view?usp=sharing`],
    [`https://drive.google.com/open?id=${id}`],
    [`https://drive.google.com/uc?export=download&id=${id}`],
    [`https://docs.google.com/presentation/d/${id}/edit#slide=id.p`],
    [`  ${id}  `],
  ])("rút id từ %s", (input) => {
    expect(parseDriveFileId(input)).toBe(id);
  });

  it.each([["https://example.com/file/d/" + id], ["không phải liên kết"], [""], ["https://drive.google.com/drive/folders/"], ["ab"]])(
    "từ chối %s",
    (input) => {
      expect(parseDriveFileId(input)).toBeNull();
    },
  );
});

describe("loadDriveConfig", () => {
  const env = { DRIVE_SHARED_DRIVE_ID: "s", DRIVE_OFFICIAL_ROOT_ID: "o", DRIVE_DRAFT_ROOT_ID: "d" };

  it("mặc định 50 MB và có quyền ghim", () => {
    expect(loadDriveConfig(env)).toEqual({
      sharedDriveId: "s",
      officialRootId: "o",
      draftRootId: "d",
      proxyMaxBytes: 50 * 1024 * 1024,
      canPin: true,
    });
  });

  it("đọc giới hạn MB và cờ không ghim (Q18)", () => {
    const c = loadDriveConfig({ ...env, DOWNLOAD_PROXY_MAX_MB: "10", DRIVE_SERVICE_ACCOUNT_CAN_PIN: "false" });
    expect(c.proxyMaxBytes).toBe(10 * 1024 * 1024);
    expect(c.canPin).toBe(false);
  });

  it("báo thiếu cấu hình bằng tiếng Việt", () => {
    expect(() => loadDriveConfig({})).toThrow(/Cấu hình Google Drive chưa đủ/);
  });

  it("khôi phục xuống dòng trong khóa riêng", () => {
    const creds = loadServiceAccountCredentials({
      GOOGLE_SERVICE_ACCOUNT_EMAIL: "sa@x.iam.gserviceaccount.com",
      GOOGLE_PRIVATE_KEY: "-----BEGIN-----\\nabc\\n-----END-----",
    });
    expect(creds.privateKey).toBe("-----BEGIN-----\nabc\n-----END-----");
  });
});

describe("isInTree", () => {
  it("nhận tệp nằm sâu trong _CHINH_THUC", async () => {
    const file = drive.addFile({ name: "a.pdf", parentId: ieltsFolder, content: "x" });
    expect(await isInTree(drive, file, official)).toBe(true);
  });

  it("không nhận tệp ở _NHAP hoặc đã bị chuyển ra ngoài", async () => {
    const inDraft = drive.addFile({ name: "a.pdf", parentId: draft, content: "x" });
    expect(await isInTree(drive, inDraft, official)).toBe(false);

    const file = drive.addFile({ name: "b.pdf", parentId: ieltsFolder, content: "x" });
    drive.moveFile(file, draft);
    expect(await isInTree(drive, file, official)).toBe(false);
  });

  it("ném lỗi quota thay vì trả false", async () => {
    const file = drive.addFile({ name: "a.pdf", parentId: ieltsFolder, content: "x" });
    drive.setQuotaExceeded(true);
    await expect(isInTree(drive, file, official)).rejects.toMatchObject({ code: "quota" });
  });
});

describe("checkRegistration", () => {
  it("chấp nhận tệp hợp lệ trong _CHINH_THUC để xuất bản", async () => {
    const file = drive.addFile({ name: "VMG_IELTS_KIT_tu-van_1.0.pdf", parentId: ieltsFolder, content: "x" });
    const check = await checkRegistration(drive, file, config, noExisting, "publish");
    expect(check).toMatchObject({ ok: true, inOfficialTree: true, issues: [] });
  });

  it("tệp ở _NHAP chỉ đăng ký được dạng nháp", async () => {
    const file = drive.addFile({ name: "a.pdf", parentId: draft, content: "x" });
    expect((await checkRegistration(drive, file, config, noExisting, "draft")).ok).toBe(true);
    const publish = await checkRegistration(drive, file, config, noExisting, "publish");
    expect(publish.ok).toBe(false);
    expect(publish.issues.map((i) => i.code)).toEqual(["draft_only_outside_official"]);
  });

  it("từ chối tệp ngoài cả hai cây và tệp ngoài Shared Drive", async () => {
    const stray = drive.addFolder("Khác");
    const outside = drive.addFile({ name: "a.pdf", parentId: stray, content: "x" });
    expect((await checkRegistration(drive, outside, config, noExisting, "draft")).issues.map((i) => i.code)).toEqual([
      "not_in_draft_or_official",
    ]);

    const personal = drive.addFile({ name: "a.pdf", parentId: ieltsFolder, content: "x", sharedDrive: false });
    expect((await checkRegistration(drive, personal, config, noExisting, "draft")).issues.map((i) => i.code)).toContain(
      "wrong_drive",
    );
  });

  it("từ chối định dạng không cho phép, thư mục, thùng rác", async () => {
    const exe = drive.addFile({ name: "setup.exe", parentId: ieltsFolder, content: "x" });
    expect((await checkRegistration(drive, exe, config, noExisting, "draft")).issues.map((i) => i.code)).toEqual([
      "format_not_allowed",
    ]);

    expect((await checkRegistration(drive, ieltsFolder, config, noExisting, "draft")).issues.map((i) => i.code)).toContain(
      "folder",
    );

    const trashed = drive.addFile({ name: "a.pdf", parentId: ieltsFolder, content: "x" });
    drive.trash(trashed);
    expect((await checkRegistration(drive, trashed, config, noExisting, "draft")).issues.map((i) => i.code)).toContain(
      "trashed",
    );
  });

  it("cảnh báo tệp Google gốc nhưng không chặn", async () => {
    const doc = drive.addFile({
      name: "Kịch bản",
      parentId: ieltsFolder,
      content: "",
      mimeType: "application/vnd.google-apps.document",
    });
    const check = await checkRegistration(drive, doc, config, noExisting, "draft");
    expect(check.ok).toBe(true);
    expect(check.issues).toEqual([expect.objectContaining({ code: "google_native", severity: "warning" })]);
  });

  it("phát hiện trùng id và trùng nội dung", async () => {
    const file = drive.addFile({ name: "a.pdf", parentId: ieltsFolder, content: "noi dung" });
    const meta = await drive.getFile(file);
    const dupId = await checkRegistration(drive, file, config, { fileIds: new Set([file]), md5s: new Set() }, "draft");
    expect(dupId.issues.map((i) => i.code)).toContain("duplicate_file");
    const dupMd5 = await checkRegistration(drive, file, config, { fileIds: new Set(), md5s: new Set([meta.md5Checksum!]) }, "draft");
    expect(dupMd5.issues.map((i) => i.code)).toContain("duplicate_md5");
  });

  it("báo không đọc được khi mất quyền, ném lỗi khi hết hạn mức", async () => {
    const file = drive.addFile({ name: "a.pdf", parentId: ieltsFolder, content: "x" });
    drive.revokeAccess(file);
    expect((await checkRegistration(drive, file, config, noExisting, "draft")).issues.map((i) => i.code)).toEqual([
      "unreadable",
    ]);
    const other = drive.addFile({ name: "b.pdf", parentId: ieltsFolder, content: "y" });
    drive.setQuotaExceeded(true);
    await expect(checkRegistration(drive, other, config, noExisting, "draft")).rejects.toMatchObject({ code: "quota" });
  });
});

describe("pinForPublish", () => {
  it("ghim bản sửa và trả md5, modifiedTime tại thời điểm xuất bản", async () => {
    const file = drive.addFile({ name: "a.pdf", parentId: ieltsFolder, content: "v1" });
    const meta = await drive.getFile(file);
    const pin = await pinForPublish(drive, file, config);
    expect(pin).toEqual({ revisionId: "rev1", md5: meta.md5Checksum, modifiedTime: meta.modifiedTime, pinned: true });
    expect(drive.revisionPinned(file, "rev1")).toBe(true);
  });

  it("từ chối tệp ngoài _CHINH_THUC, trong thùng rác, ngoài Shared Drive", async () => {
    const inDraft = drive.addFile({ name: "a.pdf", parentId: draft, content: "x" });
    await expect(pinForPublish(drive, inDraft, config)).rejects.toMatchObject({ code: "not_in_official_tree" });

    const trashed = drive.addFile({ name: "b.pdf", parentId: ieltsFolder, content: "x" });
    drive.trash(trashed);
    await expect(pinForPublish(drive, trashed, config)).rejects.toBeInstanceOf(PublishError);

    const personal = drive.addFile({ name: "c.pdf", parentId: ieltsFolder, content: "x", sharedDrive: false });
    await expect(pinForPublish(drive, personal, config)).rejects.toMatchObject({ code: "wrong_drive" });
  });

  it("không có quyền ghi thì bỏ qua ghim nhưng vẫn lưu bản sửa (Q18)", async () => {
    const file = drive.addFile({ name: "a.pdf", parentId: ieltsFolder, content: "x" });
    drive.setWriteDenied(true);
    expect(await pinForPublish(drive, file, config)).toMatchObject({ pinned: false, skipped: "no_write_access", revisionId: "rev1" });
  });

  it("canPin = false thì không gọi ghim", async () => {
    const file = drive.addFile({ name: "a.pdf", parentId: ieltsFolder, content: "x" });
    const result = await pinForPublish(drive, file, { ...config, canPin: false });
    expect(result).toMatchObject({ pinned: false, skipped: "pin_disabled" });
    expect(drive.calls.some((c) => c.startsWith("pinRevision"))).toBe(false);
  });

  it("tệp Google gốc không ghim được", async () => {
    const doc = drive.addFile({ name: "Doc", parentId: ieltsFolder, content: "", mimeType: "application/vnd.google-apps.document" });
    expect(await pinForPublish(drive, doc, config)).toMatchObject({ pinned: false, skipped: "google_native", revisionId: null });
  });

  it("ném lỗi khi hết hạn mức thay vì xuất bản không ghim", async () => {
    const file = drive.addFile({ name: "a.pdf", parentId: ieltsFolder, content: "x" });
    drive.setQuotaExceeded(true);
    await expect(pinForPublish(drive, file, config)).rejects.toMatchObject({ code: "quota" });
  });
});

describe("checkLink: sức khỏe liên kết (spec 6.4.1)", () => {
  let file: string;
  let pinned: { driveFileId: string; pinnedMd5: string | null; pinnedModifiedTime: string | null };

  beforeEach(async () => {
    file = drive.addFile({ name: "a.pdf", parentId: ieltsFolder, content: "ban-da-xuat-ban" });
    const pin = await pinForPublish(drive, file, config);
    pinned = { driveFileId: file, pinnedMd5: pin.md5, pinnedModifiedTime: pin.modifiedTime };
    drive.calls.length = 0;
  });

  it("ok khi chưa ai sửa, và chỉ đọc siêu dữ liệu (không tải nội dung)", async () => {
    expect(await checkLink(drive, pinned, config)).toMatchObject({ status: "ok", inOfficialTree: true });
    expect(drive.calls.every((c) => c.startsWith("getFile:"))).toBe(true);
  });

  it("drift khi sửa trực tiếp tệp đã xuất bản", async () => {
    drive.updateFile(file, "ban-nhap-bi-sua-tren-drive");
    expect((await checkLink(drive, pinned, config)).status).toBe("drift");
  });

  it("drift cả khi chỉ đổi tên (modifiedTime đổi, đúng như spec)", async () => {
    drive.renameFile(file, "ten-moi.pdf");
    expect((await checkLink(drive, pinned, config)).status).toBe("drift");
  });

  it("trashed, missing, no_access", async () => {
    drive.trash(file);
    expect((await checkLink(drive, pinned, config)).status).toBe("trashed");

    const gone = drive.addFile({ name: "b.pdf", parentId: ieltsFolder, content: "x" });
    const goneState = { driveFileId: gone, pinnedMd5: null, pinnedModifiedTime: null };
    drive.remove(gone);
    expect((await checkLink(drive, goneState, config)).status).toBe("missing");

    const locked = drive.addFile({ name: "c.pdf", parentId: ieltsFolder, content: "x" });
    drive.revokeAccess(locked);
    expect((await checkLink(drive, { ...goneState, driveFileId: locked }, config)).status).toBe("no_access");
  });

  it("hết hạn mức hoặc Drive gián đoạn KHÔNG bị hiểu là tệp mất", async () => {
    drive.setQuotaExceeded(true);
    expect(await checkLink(drive, pinned, config)).toEqual({ status: "unchecked", retryable: true });
    drive.setQuotaExceeded(false);
    drive.setUnavailable(true);
    expect(await checkLink(drive, pinned, config)).toEqual({ status: "unchecked", retryable: true });
  });

  it("báo tệp đã bị chuyển ra ngoài _CHINH_THUC", async () => {
    drive.moveFile(file, draft);
    expect(await checkLink(drive, pinned, config)).toMatchObject({ inOfficialTree: false });
  });
});

describe("openPinnedDownload: người dùng thường luôn nhận bản đã ghim", () => {
  it("vẫn trả bản đã ghim sau khi Marketing sửa nháp trên Drive", async () => {
    const file = drive.addFile({ name: "a.pdf", parentId: ieltsFolder, content: "ban-chinh-thuc" });
    const pin = await pinForPublish(drive, file, config);
    drive.updateFile(file, "ban-nhap-chua-duyet");
    drive.pruneUnpinnedRevisions(file);

    const download = await openPinnedDownload(
      drive,
      { driveFileId: file, pinnedRevisionId: pin.revisionId, sizeBytes: 14 },
      config,
    );
    expect(await readAll(download.stream)).toBe("ban-chinh-thuc");
  });

  it("không ghim được thì bản cũ có thể bị Drive dọn và việc tải báo lỗi rõ ràng", async () => {
    const file = drive.addFile({ name: "a.pdf", parentId: ieltsFolder, content: "v1" });
    drive.setWriteDenied(true);
    const pin = await pinForPublish(drive, file, config);
    drive.updateFile(file, "v2");
    drive.pruneUnpinnedRevisions(file);
    await expect(
      openPinnedDownload(drive, { driveFileId: file, pinnedRevisionId: pin.revisionId, sizeBytes: 2 }, config),
    ).rejects.toMatchObject({ code: "not_found" });
  });

  it("truyền luồng theo từng khối, không đọc cả tệp vào bộ nhớ", async () => {
    const file = drive.addFile({ name: "a.pdf", parentId: ieltsFolder, content: "0123456789ab" });
    const pin = await pinForPublish(drive, file, config);
    const download = await openPinnedDownload(
      drive,
      { driveFileId: file, pinnedRevisionId: pin.revisionId, sizeBytes: 12 },
      config,
    );
    const reader = download.stream.getReader();
    const sizes: number[] = [];
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      sizes.push(value.byteLength);
    }
    expect(sizes).toEqual([4, 4, 4]);
  });

  it("tệp lớn hơn giới hạn thì chuyển sang redirect, theo siêu dữ liệu và theo kích thước Drive báo", async () => {
    const file = drive.addFile({ name: "a.pdf", parentId: ieltsFolder, content: "0123456789" });
    const small = { ...config, proxyMaxBytes: 5 };
    await expect(
      openPinnedDownload(drive, { driveFileId: file, pinnedRevisionId: "rev1", sizeBytes: 10 }, small),
    ).rejects.toMatchObject({ code: "use_redirect" });
    // Siêu dữ liệu đã lưu sai (nhỏ hơn thật): vẫn chặn theo Content-Length của Drive.
    await expect(
      openPinnedDownload(drive, { driveFileId: file, pinnedRevisionId: "rev1", sizeBytes: 1 }, small),
    ).rejects.toBeInstanceOf(DownloadError);
  });

  it("không có bản sửa đã ghim thì không tải qua máy chủ", async () => {
    const file = drive.addFile({ name: "a.pdf", parentId: ieltsFolder, content: "x" });
    await expect(
      openPinnedDownload(drive, { driveFileId: file, pinnedRevisionId: null, sizeBytes: 1 }, config),
    ).rejects.toMatchObject({ code: "not_downloadable" });
  });

  it("thông báo cho người dùng không lộ chi tiết kỹ thuật", () => {
    for (const code of ["not_found", "no_access", "quota", "unavailable"] as const) {
      expect(driveErrorMessage(code)).not.toMatch(/HTTP|API|Drive|quota|403|404/i);
    }
  });
});

describe("createGoogleDriveClient (fetch giả lập)", () => {
  type Call = { url: string; init?: RequestInit };

  function client(handler: (call: Call) => Response | Promise<Response>) {
    const calls: Call[] = [];
    const fetchImpl = (async (url: string | URL | Request, init?: RequestInit) => {
      const call = { url: String(url), init };
      calls.push(call);
      return handler(call);
    }) as typeof fetch;
    return { calls, drive: createGoogleDriveClient({ getAccessToken: async () => "tok-secret", fetchImpl }) };
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

  it("getFile gọi đúng trường, kèm Bearer và supportsAllDrives, rồi ánh xạ kết quả", async () => {
    const { calls, drive } = client(() =>
      json({ id: "f1", name: "a.pdf", mimeType: "application/pdf", size: "2048", md5Checksum: "abc", modifiedTime: "2027-01-01T00:00:00.000Z", headRevisionId: "r9", parents: ["p1"], driveId: "d1" }),
    );
    const meta = await drive.getFile("f1");
    expect(meta).toEqual({
      id: "f1", name: "a.pdf", mimeType: "application/pdf", size: 2048, md5Checksum: "abc",
      modifiedTime: "2027-01-01T00:00:00.000Z", headRevisionId: "r9", parents: ["p1"], driveId: "d1", trashed: false,
    });
    expect(calls[0]!.url).toContain("/drive/v3/files/f1?fields=");
    expect(calls[0]!.url).toContain("supportsAllDrives=true");
    expect((calls[0]!.init!.headers as Record<string, string>).Authorization).toBe("Bearer tok-secret");
  });

  it("tệp Google gốc: size, md5, revision rỗng", async () => {
    const { drive } = client(() =>
      json({ id: "g1", name: "Doc", mimeType: "application/vnd.google-apps.document", modifiedTime: "2027-01-01T00:00:00.000Z" }),
    );
    expect(await drive.getFile("g1")).toMatchObject({ size: null, md5Checksum: null, headRevisionId: null, parents: [], driveId: null });
  });

  it("tải bản sửa cụ thể và ghim bằng keepForever", async () => {
    const { calls, drive } = client((call) =>
      call.init?.method === "PATCH"
        ? json({ id: "r1", keepForever: true })
        : new Response("noi-dung", { headers: { "content-length": "8" } }),
    );
    const download = await drive.downloadRevision("f1", "r1");
    expect(download.contentLength).toBe(8);
    expect(await readAll(download.stream)).toBe("noi-dung");
    expect(calls[0]!.url).toBe("https://www.googleapis.com/drive/v3/files/f1/revisions/r1?alt=media");

    await drive.pinRevision("f1", "r1");
    expect(calls[1]!.init!.method).toBe("PATCH");
    expect(calls[1]!.init!.body).toBe(JSON.stringify({ keepForever: true }));
  });

  it("mã hóa id trong URL", async () => {
    const { calls, drive } = client(() => json({ id: "x", name: "n", mimeType: "m", modifiedTime: "t" }));
    await drive.getFile("a/b?c");
    expect(calls[0]!.url).toContain("/files/a%2Fb%3Fc?");
  });

  it.each([
    [404, {}, "not_found"],
    [403, { error: { errors: [{ reason: "rateLimitExceeded" }] } }, "quota"],
    [403, { error: { errors: [{ reason: "dailyLimitExceeded" }] } }, "quota"],
    [429, {}, "quota"],
    [403, { error: { errors: [{ reason: "forbidden" }] } }, "no_access"],
    [401, {}, "no_access"],
    [500, {}, "unavailable"],
    [503, {}, "unavailable"],
  ])("HTTP %i %j -> %s", async (status, body, code) => {
    const { drive } = client(() => json(body, status));
    await expect(drive.getFile("f1")).rejects.toMatchObject({ code });
  });

  it("lỗi mạng thành unavailable, và thông báo lỗi không chứa token", async () => {
    const drive = createGoogleDriveClient({
      getAccessToken: async () => "tok-secret",
      fetchImpl: (async () => {
        throw new TypeError("fetch failed");
      }) as typeof fetch,
    });
    const err = await drive.getFile("f1").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(DriveError);
    expect((err as DriveError).code).toBe("unavailable");
    expect((err as DriveError).message).not.toContain("tok-secret");
  });
});

describe("createServiceAccountTokenProvider", () => {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
  const pubPem = publicKey.export({ type: "spki", format: "pem" }).toString();

  function setup(overrides: { status?: number; key?: string } = {}) {
    let nowMs = Date.UTC(2027, 0, 1);
    const requests: URLSearchParams[] = [];
    const fetchImpl = (async (_url: string | URL | Request, init?: RequestInit) => {
      requests.push(new URLSearchParams(init!.body as URLSearchParams));
      if (overrides.status && overrides.status !== 200) return new Response("{}", { status: overrides.status });
      return new Response(JSON.stringify({ access_token: `token-${requests.length}`, expires_in: 3600 }));
    }) as typeof fetch;
    const provider = createServiceAccountTokenProvider({
      clientEmail: "sa@proj.iam.gserviceaccount.com",
      privateKey: overrides.key ?? pem,
      scope: "https://www.googleapis.com/auth/drive",
      fetchImpl,
      now: () => nowMs,
    });
    return { provider, requests, advance: (ms: number) => (nowMs += ms) };
  }

  it("ký JWT RS256 hợp lệ với đúng iss, scope, aud và hạn 1 giờ", async () => {
    const { provider, requests } = setup();
    expect(await provider()).toBe("token-1");

    const body = requests[0]!;
    expect(body.get("grant_type")).toBe("urn:ietf:params:oauth:grant-type:jwt-bearer");
    const [header, claims, signature] = body.get("assertion")!.split(".") as [string, string, string];
    expect(JSON.parse(Buffer.from(header, "base64url").toString())).toEqual({ alg: "RS256", typ: "JWT" });
    const payload = JSON.parse(Buffer.from(claims, "base64url").toString());
    expect(payload).toMatchObject({
      iss: "sa@proj.iam.gserviceaccount.com",
      scope: "https://www.googleapis.com/auth/drive",
      aud: "https://oauth2.googleapis.com/token",
    });
    expect(payload.exp - payload.iat).toBe(3600);
    const verifier = createVerify("RSA-SHA256").update(`${header}.${claims}`);
    expect(verifier.verify(pubPem, Buffer.from(signature, "base64url"))).toBe(true);
  });

  it("lưu đệm token, xin lại khi gần hết hạn", async () => {
    const { provider, requests, advance } = setup();
    await provider();
    advance(30 * 60_000);
    expect(await provider()).toBe("token-1");
    expect(requests).toHaveLength(1);
    advance(30 * 60_000); // còn dưới 60 giây
    expect(await provider()).toBe("token-2");
    expect(requests).toHaveLength(2);
  });

  it("khóa hỏng: lỗi no_access và không lộ nội dung khóa", async () => {
    const { provider } = setup({ key: "khong-phai-khoa-pem-bi-mat" });
    const err = (await provider().catch((e: unknown) => e)) as DriveError;
    expect(err.code).toBe("no_access");
    expect(err.message).not.toContain("khong-phai-khoa-pem-bi-mat");
  });

  it("Google từ chối thì no_access, Google lỗi máy chủ thì unavailable", async () => {
    await expect(setup({ status: 401 }).provider()).rejects.toMatchObject({ code: "no_access" });
    await expect(setup({ status: 503 }).provider()).rejects.toMatchObject({ code: "unavailable" });
  });
});
