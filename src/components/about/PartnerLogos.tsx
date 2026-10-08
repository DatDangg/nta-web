import { HomeImage } from '@/components/shared/HomeImage';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import type { AboutData } from '@/content/types';

type Partner = AboutData['partners'][number];

export function PartnerLogos({ partners, title }: { partners: Partner[]; title: string }) {
  const visiblePartners = partners.filter((partner) => partner.logo);
  if (visiblePartners.length === 0) return null;
  return (
    <Section variant="default">
      <Reveal>
        <h2 className="text-h2 font-semibold">{title}</h2>
        <ul className="mt-8 grid grid-cols-3 items-center gap-6 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6">
          {visiblePartners.map((partner, index) => (
            <li className="flex justify-center" key={`${partner.logo ?? partner.name}-${index}`}>
              <Logo partner={partner} />
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}

function Logo({ partner }: { partner: Partner }) {
  return <HomeImage alt={partner.name} className="h-12 w-auto max-w-full object-contain grayscale transition-[filter] duration-[250ms] hover:grayscale-0" sizes="(min-width: 1024px) 16vw, 33vw" src={partner.logo ?? ''} />;
}
