import { Section } from '@/components/ui/Section';
import { AiAssistantPanel } from './AiAssistantPanel';

export type AiSuggestionItem = { label: string; text: string };

type AiSectionProps = {
  title: string;
  description: string;
  /** Danh sách gợi ý — dạng danh sách có nhãn, KHÔNG phải icon + chữ. */
  suggestions: string[];
  /** Nội dung khung "Trợ lý nhận xét" dựng bằng HTML/CSS (không dùng ảnh). */
  panel: {
    label: string;
    student: string;
    meta?: string;
    action: string;
    description?: string;
    suggestions?: AiSuggestionItem[];
  };
};

/**
 * Section AI — nền tối (spec §5.3).
 *
 * ⚠ Trên nền `ink`, KHÔNG dùng `text-primary` (#009e87 — dù đạt ~5.3:1 so với #111827,
 * ưu tiên nhóm token `ink-*` và `accent-ink` #21d9ad ≈9.8:1 cho link/CTA nổi bật).
 *
 * **Sai lệch so với spec §5.3 (đã chốt 2026-11):** spec bảo ảnh crop AI đặt ở cột phải,
 * 2 cột bằng nhau. Thực tế crop là **1223×284, tỉ lệ 4.31** — dải rất ngang, rất thấp:
 * ở cột 608px chỉ còn 608×141px, chữ không đọc được; và **nền trắng bao quanh lóa lên
 * trên nền tối**, lệch với text căn trái, co ở 375px là vô dụng.
 *
 * → Thay ảnh bằng component HTML/CSS `AiAssistantPanel`: cùng nội dung và màu, nhưng nền
 * đúng màu `ink`, **căn mép trái như text**, và co lại vẫn đọc được ở 375px.
 */
export function AiSection({ title, description, suggestions, panel }: AiSectionProps) {
  return (
    <Section spacing="large" variant="ink">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
        <div className="max-w-[52ch]">
          <h2 className="text-h2 font-bold text-ink-text">{title}</h2>
          <p className="mt-4 text-body-lg text-ink-text-secondary">{description}</p>

          <ul className="mt-8 space-y-3">
            {suggestions.map((suggestion) => (
              <li
                className="border-l-2 border-accent-ink bg-ink-surface py-3 pl-4 pr-4 text-body text-ink-text"
                key={suggestion}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        <AiAssistantPanel {...panel} />
      </div>
    </Section>
  );
}