import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';

export function MissionBlock({ mission, title }: { mission: string; title: string }) {
  return (
    <Section variant="alt">
      <Reveal>
        <div className="mx-auto max-w-[48ch] text-center">
          <h2 className="text-h2 font-semibold text-text-secondary">{title}</h2>
          <p className="mt-6 text-h2 font-semibold leading-tight text-text-primary">{mission}</p>
        </div>
      </Reveal>
    </Section>
  );
}
