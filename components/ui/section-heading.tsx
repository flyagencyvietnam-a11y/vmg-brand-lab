import type { ReactNode } from "react";

/** Tiêu đề mục: đường kẻ vàng đồng ngắn phía trên, chữ đậm, viết hoa kiểu câu (PDF: tiêu đề phụ đỏ đậm). */
export function SectionHeading({
  id,
  title,
  lead,
  level = 2,
}: {
  id?: string;
  title: ReactNode;
  lead?: ReactNode;
  level?: 2 | 3;
}) {
  const Tag = level === 2 ? "h2" : "h3";
  return (
    <div>
      <span aria-hidden className="mb-3 block h-0.5 w-10 bg-gold-mark" />
      <Tag id={id} className={`${level === 2 ? "text-h2" : "text-h3"} font-bold text-ink`}>
        {title}
      </Tag>
      {lead ? <p className="mt-1 max-w-3xl text-ink-2">{lead}</p> : null}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-small font-semibold uppercase tracking-caps text-gold">{children}</p>;
}
