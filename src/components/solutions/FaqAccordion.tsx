import type { SectionVariant } from '@/components/ui/Section';
import { Section } from '@/components/ui/Section';

export type FaqItem = { question: string; answer: string };

type FaqAccordionProps = { title: string; items: FaqItem[]; variant?: SectionVariant };

/** Chevron tự vẽ, xoay 180° khi mở. KHÔNG dùng ký tự `+`/`−`. */
function Chevron() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0 text-text-secondary transition-transform duration-fast group-open:rotate-180"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

/**
 * FAQ dạng accordion bằng `<details>`/`<summary>` native — không cần JS.
 *
 * `<summary>` là button native nên Enter/Space đã hoạt động, `aria-expanded` do browser quản lý.
 * Mũi tên `aria-hidden="true"` vì thông tin đã có ở text của `summary`.
 *
 * Dùng `Section size="prose"` — FAQ là **chữ thuần 1 cột**, đúng dùng `prose`.
 * Padding dọc do `<Section>` bên trong lo, component KHÔNG tự thêm `py-*` (tránh cộng dồn).
 *
 * ⚠ Component **tự gọi `<Section>`** — KHÔNG bọc thêm `<Section>`/`<Container>` ở ngoài.
 */
export function FaqAccordion({ title, items, variant = 'alt' }: FaqAccordionProps) {
  return (
    <Section size="prose" variant={variant}>
      <h2 className="text-h2 font-bold">{title}</h2>
      <div className="mt-6">
        {items.map((item) => (
          <details className="group border-b border-border py-5" key={item.question}>
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-h3 font-medium [&::-webkit-details-marker]:hidden">
              {item.question}
              <Chevron />
            </summary>
            <p className="max-w-[65ch] pb-5 text-body text-text-secondary">{item.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}