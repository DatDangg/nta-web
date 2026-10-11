/**
 * Khung "Trợ lý nhận xét" dựng bằng HTML/CSS thay cho ảnh chụp.
 *
 * **Vì sao không dùng ảnh:** ảnh crop có nền trắng bao quanh — đặt trên nền tối `ink` thì
 * lóa lên thành hộp trắng lơ lửng, lệch với text căn trái, và ở 375px thu nhỏ lại không
 * đọc được (crop gốc là dải 1223×284, tỉ lệ 4.31). Dựng bằng DOM thì:
 *   - nền, bo góc, chữ đều theo token của dự án, không lệch hệ màu
 *   - co lại vẫn đọc được ở mobile
 *   - responsive theo nội dung thay vì theo tỉ lệ ảnh cứng
 *
 * Màu lấy đúng từ ảnh gốc: nền thẻ `#047857`, viền trong `#059669`.
 *
 * ⚠ CONTRAST trên nền `#047857` (đo thật, WCAG 2.1 AA ngưỡng 4.5:1 cho chữ thường):
 * - `text-white`      = 4.97:1 ✅
 * - `text-white/90`   = 4.77:1 ✅
 * - `text-white/85`   = 4.43:1 ❌
 * - `text-white/80`   = 4.11:1 ❌
 * → Mọi chữ trên nền xanh này PHẢI dùng `text-white` hoặc `text-white/90`, không thấp hơn.
 */
const PANEL_BG = 'bg-[#047857]';
const PANEL_RING = 'ring-[#059669]';

export type AiSuggestion = { label: string; text: string };

type AiAssistantPanelProps = {
  /** Nhãn nhỏ trên cùng. */
  label: string;
  /** Tên học sinh — dòng tiêu đề chính. */
  student: string;
  /** Dòng meta bên phải (số lượng, ngữ cảnh). */
  meta?: string;
  /** Nhãn nút. */
  action: string;
  /** Mô tả ngắn dưới tiêu đề. */
  description?: string;
  /** 1–2 gợi ý mẫu, hiện dưới khung. */
  suggestions?: AiSuggestion[];
};

export function AiAssistantPanel({
  label,
  student,
  meta,
  action,
  description,
  suggestions = [],
}: AiAssistantPanelProps) {
  return (
    <figure className="max-w-full">
      <div className={`rounded-xl ${PANEL_BG} p-5 shadow-lg ring-1 ring-inset ${PANEL_RING} sm:p-6`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/90">{label}</p>
            <p className="mt-1 text-lg font-semibold text-white sm:text-xl">{student}</p>
          </div>

          {meta ? (
            <p className="shrink-0 text-sm text-white/90 sm:pt-1">{meta}</p>
          ) : null}
        </div>

        {/* Nút: static, không phải control thật — đây là minh hoạ giao diện, không phải UI
            dùng được. Không dùng <button> để tránh hành vi giả (bấm không làm gì). */}
        <span className="mt-4 inline-flex items-center rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold text-white">
          {action}
        </span>

        {description ? (
          <p className="mt-4 text-sm leading-relaxed text-white/90">{description}</p>
        ) : null}
      </div>

      {suggestions.length ? (
        // `<div>` chứ không phải `<figcaption>` — đây là NỘI DUNG của panel, không phải
        // chú thích cho figure cha (figcaption bọc suggestions là semantics lỏng).
        <div className="mt-4 space-y-2">
          {suggestions.map((item) => (
            <div
              className="rounded-lg border border-ink-border bg-ink-surface px-4 py-3"
              key={item.label}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-accent-ink">
                {item.label}
              </p>
              <p className="mt-1 text-sm text-ink-text">{item.text}</p>
            </div>
          ))}
        </div>
      ) : null}
    </figure>
  );
}