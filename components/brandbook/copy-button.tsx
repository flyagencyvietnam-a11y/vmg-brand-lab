"use client";

import { useState } from "react";

/** Nút sao chép một câu chuẩn (ví dụ "Giới thiệu chuẩn"). Báo kết quả bằng chữ, không chỉ bằng màu. */
export function CopyButton({ text, label, doneLabel }: { text: string; label: string; doneLabel: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          setDone(false);
        }
      }}
      className="inline-flex min-h-11 items-center rounded-full border border-line-strong bg-paper px-5 text-small font-medium text-ink hover:border-brand hover:text-brand"
    >
      <span aria-live="polite">{done ? doneLabel : label}</span>
    </button>
  );
}
