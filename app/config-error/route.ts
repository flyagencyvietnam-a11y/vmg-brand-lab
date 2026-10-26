import { roleHex } from "@/lib/design/tokens";
import { vi } from "@/lib/i18n/vi";

// Trang báo lỗi cấu hình (thiếu biến môi trường). Proxy chuyển mọi yêu cầu về đây.
// Là Route Handler để trả được mã 503 thật (page không đặt được mã trạng thái, và rewrite từ proxy bỏ qua status).
// HTML tự chứa, không phụ thuộc cấu hình, cơ sở dữ liệu hay gói CSS; chỉ dùng một tệp tĩnh trong public/brand (biểu tượng).
// Công khai nên không nêu tên biến hay hạ tầng; chi tiết nằm ở log máy chủ.

const c = vi.configError;

const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${c.title} · ${vi.app.name}</title>
<style>
  *{box-sizing:border-box}
  html,body{height:100%;margin:0}
  body{font-family:"Montserrat Variable",Arial,system-ui,sans-serif;background:${roleHex.surface};color:${roleHex["on-brand"]};line-height:1.65;text-align:left}
  main{margin:.75rem;min-height:calc(100% - 1.5rem);border-radius:1.5rem;display:flex;align-items:center;background:${roleHex.brand}}
  .box{width:100%;max-width:72rem;margin:0 auto;padding:3rem 1.5rem;display:flex;flex-direction:column;align-items:flex-start;gap:1rem}
  .symbol{width:2.5rem;height:auto}
  .eyebrow{margin:0;font-size:.875rem;font-weight:500;color:${roleHex["on-brand-2"]}}
  h1{margin:0;max-width:48rem;font-size:clamp(1.875rem,1.4rem + 1.9vw,2.75rem);line-height:1.12;font-weight:700;letter-spacing:-.02em;text-wrap:balance}
  .lead{margin:0;max-width:36rem;font-size:1.0625rem;color:${roleHex["on-brand-2"]}}
  .btn{display:inline-flex;align-items:center;min-height:3rem;padding:0 1.5rem;border-radius:999px;background:${roleHex["on-brand"]};color:${roleHex.brand};font-size:.875rem;font-weight:500;text-decoration:none}
  .btn:hover{background:${roleHex["brand-soft"]}}
  .btn:focus-visible{outline:2px solid ${roleHex["on-brand"]};outline-offset:2px}
  .admin{margin:0;max-width:36rem;font-size:.875rem;color:${roleHex["on-brand-2"]}}
</style>
</head>
<body>
<main>
  <div class="box">
    <img class="symbol" src="/brand/vmg-symbol.svg" alt="" aria-hidden="true">
    <p class="eyebrow">${c.eyebrow}</p>
    <h1>${c.title}</h1>
    <p class="lead" role="status">${c.lead}</p>
    <a class="btn" href="/">${c.retry}</a>
    <p class="admin">${c.admin}</p>
  </div>
</main>
</body>
</html>
`;

export function GET(): Response {
  return new Response(html, {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Retry-After": "300",
    },
  });
}
