type Metric = { value: string; label: string };
type ResultBlockProps = { title: string; content: string; metrics: Metric[] };

export function ResultBlock({ title, content, metrics }: ResultBlockProps) {
  return <section className="py-8"><h2 className="text-h2 font-bold">{title}</h2><p className="mt-4 max-w-[65ch] leading-relaxed text-text-secondary">{content}</p>{metrics.length > 0 && <ul className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">{metrics.slice(0, 4).map((metric) => <li key={`${metric.value}-${metric.label}`}><p className="text-display font-bold text-primary">{metric.value}</p><p className="mt-2 text-sm text-text-secondary">{metric.label}</p></li>)}</ul>}</section>;
}
