import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';

type Milestone = { year: number; description: string };

export function MilestoneTimeline({ milestones, title }: { milestones: Milestone[]; title: string }) {
  if (milestones.length === 0) return null;
  return (
    <Section>
      <Reveal>
        <h2 className="text-h2 font-semibold">{title}</h2>
        <ol className="mt-8 space-y-6 border-s border-border ps-6 lg:flex lg:space-y-0 lg:border-s-0 lg:border-t lg:ps-0">
          {milestones.map((milestone, index) => (
            <li className="relative lg:flex-1 lg:border-s lg:border-border lg:px-5 lg:pt-6" key={`${milestone.year}-${index}`}>
              <span aria-hidden="true" className="absolute -start-[1.95rem] top-1 h-3 w-3 rounded-full bg-primary lg:-top-[0.4rem] lg:start-5" />
              <time className="text-h3 font-semibold" dateTime={String(milestone.year)}>{milestone.year}</time>
              <p className="mt-2 text-text-secondary">{milestone.description}</p>
            </li>
          ))}
        </ol>
      </Reveal>
    </Section>
  );
}
