// Rút drive_file_id từ liên kết Drive người dùng dán vào (spec 6.4.1, bước 1).

const ID_PATTERN = /^[A-Za-z0-9_-]{10,}$/;

/** Trả về id tệp, hoặc null nếu không nhận ra. Chấp nhận cả id trần. */
export function parseDriveFileId(input: string): string | null {
  const text = input.trim();
  if (ID_PATTERN.test(text)) return text;

  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  if (url.hostname !== "drive.google.com" && url.hostname !== "docs.google.com") return null;

  // /file/d/{id}/view, /document/d/{id}/edit, /presentation/d/{id}, /spreadsheets/d/{id}
  const pathMatch = url.pathname.match(/\/d\/([A-Za-z0-9_-]+)/);
  if (pathMatch?.[1] && ID_PATTERN.test(pathMatch[1])) return pathMatch[1];

  // /open?id={id}, /uc?id={id}
  const queryId = url.searchParams.get("id");
  if (queryId && ID_PATTERN.test(queryId)) return queryId;

  return null;
}
