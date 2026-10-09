import { Section } from '@/components/ui/Section';

type SolutionHighlight = { value: string; label: string };

export function SolutionHighlights({ highlights, title }: { highlights: SolutionHighlight[]; title: string }) {
  if (highlights.length === 0) return null;

  return (
    <Section variant="alt">
      <h2 className="text-h2 font-semibold">{title}</h2>
      <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map(({ value, label }) => (
          <div className="border-t border-border pt-4" key={`${value}-${label}`}>
            <dt className="text-body">{label}</dt>
            <dd className="mt-2 text-h3 font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
