import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';

export function CapabilityGrid({ capabilities, title }: { capabilities: string[]; title: string }) {
  return (
    <Section>
      <Reveal>
        <h2 className="text-h2 font-semibold">{title}</h2>
        <ul className="mt-8 grid grid-cols-1 gap-x-8 md:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((capability, index) => (
            <li className="border-t border-border py-5 text-body-lg" key={`${index}-${capability}`}>{capability}</li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
