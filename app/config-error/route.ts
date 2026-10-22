import { roleHex } from "@/lib/design/tokens";
import { vi } from "@/lib/i18n/vi";

// Trang báo lỗi cấu hình (thiếu biến môi trường). Proxy chuyển mọi yêu cầu về đây.
// Là Route Handler để trả được mã 503 thật (page không đặt được mã trạng thái, và rewrite từ proxy bỏ qua status).
// HTML tự chứa, không phụ thuộc cấu hình, cơ sở dữ liệu hay gói CSS; chỉ dùng hai tệp tĩnh trong public/brand.
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
  body{font-family:"Montserrat Variable",Arial,system-ui,sans-serif;background:${roleHex.brand};color:${roleHex["on-brand"]};line-height:1.65;text-align:left}
  main{position:relative;isolation:isolate;overflow:hidden;min-height:100%;display:flex;align-items:center;background:${roleHex.brand}}
  .pattern{position:absolute;inset:0;z-index:-1;background:url(/brand/vmg-pattern.svg) 0 0/120px;mix-blend-mode:overlay;opacity:.5;pointer-events:none}
  .ornament{position:absolute;z-index:-1;right:-5rem;top:-3.5rem;width:18rem;transform:rotate(12deg);opacity:.25;pointer-events:none}
  .box{position:relative;width:100%;max-width:72rem;margin:0 auto;padding:4rem 1rem;display:flex;flex-direction:column;align-items:flex-start;gap:1.25rem}
  .symbol{width:3.5rem;height:auto}
  .eyebrow{margin:0;font-size:.875rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${roleHex["on-brand-2"]}}
  h1{margin:0;max-width:48rem;font-size:clamp(2.25rem,1.6rem + 2.6vw,3.75rem);line-height:1.05;font-weight:700;text-transform:uppercase}
  .lead{margin:0;max-width:36rem;font-size:1.125rem;color:${roleHex["on-brand-2"]}}
  .btn{display:inline-flex;align-items:center;min-height:2.75rem;padding:0 1.25rem;border-radius:.625rem;background:${roleHex["on-brand"]};color:${roleHex.brand};font-size:.875rem;font-weight:600;text-decoration:none}
  .btn:hover{background:${roleHex["brand-soft"]}}
  .btn:focus-visible{outline:2px solid ${roleHex["on-brand"]};outline-offset:2px}
  .admin{margin:0;max-width:36rem;font-size:.875rem;color:${roleHex["on-brand-2"]}}
  @media (min-width:768px){.ornament{right:-7rem;top:-6rem;width:30rem}}
  @media (min-width:1280px){.ornament{opacity:.9}}
</style>
</head>
<body>
<main>
  <div class="pattern" aria-hidden="true"></div>
  <img class="ornament" src="/brand/vmg-symbol.svg" alt="" aria-hidden="true">
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
