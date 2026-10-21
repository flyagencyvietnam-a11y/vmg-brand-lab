import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": import.meta.dirname },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    // Migration chạy trên PGlite (Postgres trong tiến trình) nên khởi tạo mất vài giây.
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
