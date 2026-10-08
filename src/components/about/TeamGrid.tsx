import { HomeImage } from '@/components/shared/HomeImage';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';

type Member = { name: string; role: string; image: string };

function TeamPortrait({ member, fallback }: { member: Member; fallback: string }) {
  return (
    <div className="aspect-[4/3] overflow-hidden rounded-lg bg-surface-sunken">
      <HomeImage alt={member.name || fallback} className="h-full w-full object-cover" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" src={member.image} />
    </div>
  );
}

export function TeamGrid({ members, title, fallback }: { members: Member[]; title: string; fallback: string }) {
  return (
    <Section variant="alt">
      <Reveal>
        <h2 className="text-h2 font-semibold">{title}</h2>
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member, index) => (
            <li key={`${member.name}-${index}`}>
              <TeamPortrait fallback={fallback} member={member} />
              <h3 className="mt-4 text-h3 font-semibold">{member.name}</h3>
              <p className="mt-1 text-text-secondary">{member.role}</p>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
