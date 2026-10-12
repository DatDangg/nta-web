import { CountUp } from '@/components/motion/CountUp';
import { Container } from '@/components/ui/Container';

type Metric = { value: string; label: string };
type ResultBlockProps = { title: string; content: string; metrics: Metric[] };

// Khối chữ 1 cột + lưới metric 4 cột. Dùng `default` (1280) vì metric grid cần bề rộng;
// phần chữ bên trong tự giới hạn bằng max-w-[65ch].
export function ResultBlock({ title, content, metrics }: ResultBlockProps) {
  return (
    <section className="py-8">
      <Container>
        <h2 className="text-h2 font-bold">{title}</h2>
        <p className="mt-4 max-w-[65ch] leading-relaxed text-text-secondary">{content}</p>
        {metrics.length > 0 && (
          <ul className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
            {metrics.slice(0, 4).map((metric) => (
              <li key={`${metric.value}-${metric.label}`}>
                <p className="text-display font-bold text-primary"><CountUp value={metric.value} /></p>
                <p className="mt-2 text-sm text-text-secondary">{metric.label}</p>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}