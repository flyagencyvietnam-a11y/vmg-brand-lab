import type { DriveClient, DriveConfig, DriveDownload } from "./types";

/** Thông tin cần để tải một tệp đã xuất bản (từ asset_files). */
export type PublishedFileRef = {
  driveFileId: string;
  pinnedRevisionId: string | null;
  sizeBytes: number | null;
};

export class DownloadError extends Error {
  constructor(
    readonly code: "use_redirect" | "not_downloadable",
    message: string,
  ) {
    super(message);
    this.name = "DownloadError";
  }
}

/**
 * Chế độ `proxy` (spec 6.4.1): luôn tải ĐÚNG bản sửa đã ghim, kể cả khi tệp trên Drive đã bị sửa (drift),
 * để bản nháp trên Drive không lọt ra nhân viên. Trả về luồng, không đọc cả tệp vào bộ nhớ.
 * Việc kiểm tra quyền người dùng và ghi `downloads` do tầng gọi làm trước khi gọi hàm này.
 */
export async function openPinnedDownload(
  client: DriveClient,
  file: PublishedFileRef,
  config: DriveConfig,
): Promise<DriveDownload> {
  if (file.pinnedRevisionId === null) {
    throw new DownloadError("not_downloadable", "Tệp này chưa có bản sửa đã ghim nên không tải qua máy chủ được.");
  }
  if (file.sizeBytes !== null && file.sizeBytes > config.proxyMaxBytes) {
    throw new DownloadError("use_redirect", "Tệp lớn hơn giới hạn tải qua máy chủ, dùng chế độ redirect.");
  }

  const download = await client.downloadRevision(file.driveFileId, file.pinnedRevisionId);
  // Kích thước thật do Drive báo mới là căn cứ cuối cùng (siêu dữ liệu đã lưu có thể cũ).
  if (download.contentLength !== null && download.contentLength > config.proxyMaxBytes) {
    await download.stream.cancel();
    throw new DownloadError("use_redirect", "Tệp lớn hơn giới hạn tải qua máy chủ, dùng chế độ redirect.");
  }
  return download;
}
