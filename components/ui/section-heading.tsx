import type { ReactNode } from "react";

/** Tiêu đề mục: chữ vừa, viết hoa kiểu câu, đường kẻ đỏ ngắn phía trên làm điểm nhấn duy nhất. */
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
    <div className="flex flex-col gap-1.5">
      {level === 2 ? <span aria-hidden className="mb-1 block h-0.5 w-8 rounded-full bg-brand" /> : null}
      <Tag id={id} className={`${level === 2 ? "text-h2" : "text-h3"} text-ink`}>
        {title}
      </Tag>
      {lead ? <p className="max-w-3xl text-ink-2">{lead}</p> : null}
    </div>
  );
}

/** Nhãn nhỏ IN HOA phía trên tiêu đề (IN HOA chỉ dùng cho nhãn, spec 4.4). */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-small font-medium uppercase tracking-caps text-gold">{children}</p>;
}
