import { Section } from '@/components/ui/Section';

export function UseCases({ cases, title }: { cases: string[]; title: string }) {
  if (cases.length === 0) return null;

  return (
    <Section variant="alt">
      <h2 className="text-h2 font-semibold">{title}</h2>
      <ul className="mt-6 grid grid-cols-1 gap-x-8 md:grid-cols-2 lg:grid-cols-3">
        {cases.map((useCase) => (
          <li className="border-t border-border py-4" key={useCase}>{useCase}</li>
        ))}
      </ul>
    </Section>
  );
}
