import { createHash } from "node:crypto";
import {
  DriveError,
  GOOGLE_FOLDER_MIME,
  type DriveClient,
  type DriveDownload,
  type DriveFileMeta,
} from "./types";

// Bản mô phỏng Drive trong bộ nhớ cho kiểm thử và CI (spec 8.7). Cố ý mô phỏng cả các cách hỏng
// của Drive thật: sửa tại chỗ (drift), xóa, thùng rác, mất quyền, hết hạn mức, Drive dọn bản sửa chưa ghim.

type Revision = { id: string; content: Uint8Array; md5: string; modifiedTime: string; keepForever: boolean };

type Entry = {
  id: string;
  name: string;
  mimeType: string;
  parents: string[];
  driveId: string | null;
  trashed: boolean;
  revisions: Revision[];
};

export class MockDrive implements DriveClient {
  readonly driveId = "mock-shared-drive";
  /** Nhật ký lời gọi để kiểm thử khẳng định "chỉ đọc siêu dữ liệu, không tải nội dung". */
  readonly calls: string[] = [];

  private entries = new Map<string, Entry>();
  private revokedFiles = new Set<string>();
  private nextId = 1;
  private clock = Date.UTC(2027, 0, 1);
  private quotaExceeded = false;
  private down = false;
  private writeDenied = false;

  /** Tạo thư mục. parentId null nghĩa là gốc của Shared Drive. */
  addFolder(name: string, parentId: string | null = null): string {
    const id = `folder${this.nextId++}${"x".repeat(8)}`;
    this.entries.set(id, {
      id,
      name,
      mimeType: GOOGLE_FOLDER_MIME,
      parents: parentId ? [parentId] : [this.driveId],
      driveId: this.driveId,
      trashed: false,
      revisions: [],
    });
    return id;
  }

  addFile(opts: { name: string; parentId: string; content: string | Uint8Array; mimeType?: string; sharedDrive?: boolean }): string {
    const id = `file${this.nextId++}${"x".repeat(8)}`;
    const mimeType = opts.mimeType ?? "application/pdf";
    const native = mimeType.startsWith("application/vnd.google-apps.");
    this.entries.set(id, {
      id,
      name: opts.name,
      mimeType,
      parents: [opts.parentId],
      driveId: opts.sharedDrive === false ? null : this.driveId,
      trashed: false,
      revisions: native ? [] : [this.makeRevision(opts.content, 1)],
    });
    if (native) this.touch(id);
    return id;
  }

  /** Mô phỏng Marketing sửa trực tiếp tệp trên Drive: tạo bản sửa mới, đổi md5 và modifiedTime. */
  updateFile(id: string, content: string | Uint8Array): void {
    const entry = this.mustGet(id);
    entry.revisions.push(this.makeRevision(content, entry.revisions.length + 1));
  }

  /** Đổi tên: không đổi nội dung, nhưng Drive thật cập nhật modifiedTime. */
  renameFile(id: string, name: string): void {
    this.mustGet(id).name = name;
    this.touch(id);
  }

  moveFile(id: string, newParentId: string): void {
    this.mustGet(id).parents = [newParentId];
  }

  trash(id: string): void {
    this.mustGet(id).trashed = true;
  }

  remove(id: string): void {
    this.entries.delete(id);
  }

  revokeAccess(id: string): void {
    this.revokedFiles.add(id);
  }

  setQuotaExceeded(on: boolean): void {
    this.quotaExceeded = on;
  }

  setUnavailable(on: boolean): void {
    this.down = on;
  }

  /** Tài khoản dịch vụ chỉ có quyền đọc: ghim bản sửa bị từ chối. */
  setWriteDenied(on: boolean): void {
    this.writeDenied = on;
  }

  /** Mô phỏng Drive tự xóa bản sửa cũ chưa ghim. Bản mới nhất luôn được giữ. */
  pruneUnpinnedRevisions(id: string): void {
    const entry = this.mustGet(id);
    const head = entry.revisions.at(-1);
    entry.revisions = entry.revisions.filter((r) => r.keepForever || r === head);
  }

  revisionPinned(id: string, revisionId: string): boolean {
    return this.mustGet(id).revisions.find((r) => r.id === revisionId)?.keepForever ?? false;
  }

  // --- DriveClient ---

  async getFile(fileId: string): Promise<DriveFileMeta> {
    this.calls.push(`getFile:${fileId}`);
    const entry = this.access(fileId);
    const head = entry.revisions.at(-1);
    return {
      id: entry.id,
      name: entry.name,
      mimeType: entry.mimeType,
      size: head ? head.content.byteLength : null,
      md5Checksum: head ? head.md5 : null,
      modifiedTime: head ? head.modifiedTime : this.modifiedTimes.get(entry.id) ?? new Date(this.clock).toISOString(),
      headRevisionId: head ? head.id : null,
      parents: [...entry.parents],
      driveId: entry.driveId,
      trashed: entry.trashed,
    };
  }

  async downloadHead(fileId: string): Promise<DriveDownload> {
    this.calls.push(`downloadHead:${fileId}`);
    const entry = this.access(fileId);
    const head = entry.revisions.at(-1);
    if (!head) throw new DriveError("not_found", "Tệp Google gốc không có nội dung nhị phân.");
    return this.stream(head.content);
  }

  async downloadRevision(fileId: string, revisionId: string): Promise<DriveDownload> {
    this.calls.push(`downloadRevision:${fileId}:${revisionId}`);
    const entry = this.access(fileId);
    const revision = entry.revisions.find((r) => r.id === revisionId);
    if (!revision) throw new DriveError("not_found", "Bản sửa không còn trên Drive.");
    return this.stream(revision.content);
  }

  async pinRevision(fileId: string, revisionId: string): Promise<void> {
    this.calls.push(`pinRevision:${fileId}:${revisionId}`);
    const entry = this.access(fileId);
    if (this.writeDenied) throw new DriveError("no_access", "Tài khoản dịch vụ không có quyền ghi.");
    const revision = entry.revisions.find((r) => r.id === revisionId);
    if (!revision) throw new DriveError("not_found", "Bản sửa không còn trên Drive.");
    revision.keepForever = true;
  }

  // --- nội bộ ---

  private modifiedTimes = new Map<string, string>();

  private tick(): string {
    this.clock += 60_000;
    return new Date(this.clock).toISOString();
  }

  private touch(id: string): void {
    const entry = this.mustGet(id);
    const time = this.tick();
    this.modifiedTimes.set(id, time);
    const head = entry.revisions.at(-1);
    if (head) head.modifiedTime = time;
  }

  private makeRevision(content: string | Uint8Array, n: number): Revision {
    const bytes = typeof content === "string" ? new TextEncoder().encode(content) : content;
    return {
      id: `rev${n}`,
      content: bytes,
      md5: createHash("md5").update(bytes).digest("hex"),
      modifiedTime: this.tick(),
      keepForever: false,
    };
  }

  private mustGet(id: string): Entry {
    const entry = this.entries.get(id);
    if (!entry) throw new Error(`MockDrive: không có mục ${id}`);
    return entry;
  }

  private access(id: string): Entry {
    if (this.down) throw new DriveError("unavailable", "Mock: Drive gián đoạn.");
    if (this.quotaExceeded) throw new DriveError("quota", "Mock: hết hạn mức.");
    const entry = this.entries.get(id);
    if (!entry) throw new DriveError("not_found", "Mock: không tìm thấy.");
    if (this.revokedFiles.has(id)) throw new DriveError("no_access", "Mock: mất quyền.");
    return entry;
  }

  private stream(bytes: Uint8Array): DriveDownload {
    // Chia nhỏ để kiểm thử thấy luồng thật, không phải một khối.
    const chunkSize = 4;
    let offset = 0;
    return {
      contentLength: bytes.byteLength,
      stream: new ReadableStream<Uint8Array>({
        pull(controller) {
          if (offset >= bytes.byteLength) return controller.close();
          controller.enqueue(bytes.slice(offset, offset + chunkSize));
          offset += chunkSize;
        },
      }),
    };
  }
}

export async function readAll(stream: ReadableStream<Uint8Array>): Promise<string> {
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}
