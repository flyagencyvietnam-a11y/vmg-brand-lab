/* Sinh seed/products.json từ docs/source/VMG_Product_Portfolio_2026.md (spec Phụ lục A.2).
 *
 *   npm run seed:products
 *
 * Không gõ lại bằng tay: chạy lại khi file nguồn đổi. Test tests/unit/products.test.ts kiểm tra seed khớp nguồn.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildProductsSeed } from "../../lib/products/seed";

const root = resolve(__dirname, "../..");
const md = readFileSync(resolve(root, "docs/source/VMG_Product_Portfolio_2026.md"), "utf8");
const seed = buildProductsSeed(md);
writeFileSync(resolve(root, "seed/products.json"), `${JSON.stringify(seed, null, 2)}\n`, "utf8");
console.log(`seed/products.json: ${seed.products.length} sản phẩm`);
