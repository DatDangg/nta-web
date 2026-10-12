import type { CSSProperties } from 'react';

type SplitTextProps = {
  text: string;
  /** Trễ trước từ đầu tiên (ms). */
  delay?: number;
  /** Khoảng trễ giữa 2 từ (ms). */
  step?: number;
  className?: string;
};

/**
 * Tách tiêu đề thành từng từ, mỗi từ hiện lần lượt (fade + up + blur) khi trang tải —
 * tương đương `animation_type_char/line` của trang tham chiếu nhưng thuần CSS (không cần JS,
 * không layout shift, chạy lại mỗi lần đổi route vì component mount lại).
 *
 * Dùng BÊN TRONG thẻ heading: `<h1 data-motion-off><SplitText text={title} /></h1>`
 * (`data-motion-off` để auto-motion không áp thêm lần nữa lên chính heading).
 * Khoảng trắng giữ nguyên dạng text node → trình đọc màn hình đọc liền mạch, xuống dòng tự nhiên.
 */
export function SplitText({ text, delay = 0, step = 45, className = '' }: SplitTextProps) {
  let index = 0;
  return (
    <span className={`split-text ${className}`.trim()}>
      {text.split(/(\s+)/).map((part, i) => {
        if (part === '' || /^\s+$/.test(part)) return part;
        const style = { '--split-delay': `${delay + index * step}ms` } as CSSProperties;
        index += 1;
        return (
          <span className="split-word" key={i} style={style}>
            {part}
          </span>
        );
      })}
    </span>
  );
}
