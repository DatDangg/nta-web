import { Section } from '@/components/ui/Section';

export function BenefitList({ benefits, title }: { benefits: string[]; title: string }) {
  return (
    <Section variant="alt">
      <h2 className="text-h2 font-semibold">{title}</h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {benefits.map((benefit) => (
          <li className="border-t border-border py-4 text-body-lg" key={benefit}>{benefit}</li>
        ))}
      </ul>
    </Section>
  );
}
