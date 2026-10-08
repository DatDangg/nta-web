import { Section } from '@/components/ui/Section';

export function FeatureList({ features, title }: { features: string[]; title: string }) {
  return (
    <Section>
      <h2 className="text-h2 font-semibold">{title}</h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {features.map((feature) => (
          <li className="flex items-start gap-3 border-t border-border py-4" key={feature}>
            <span aria-hidden="true" className="mt-1 text-primary">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
