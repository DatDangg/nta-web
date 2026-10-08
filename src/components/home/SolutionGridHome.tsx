import { SolutionCard } from '@/components/cards/SolutionCard';
import { Reveal } from '@/components/ui/Reveal';

type SolutionItem = {
  title: string;
  description: string;
  href: string;
  image: string;
  alt: string;
};

export async function SolutionGridHome({ solutions, title }: { solutions: SolutionItem[]; title: string }) {
  return (
    <section className="bg-background-alt py-12 md:py-16 xl:py-24">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-h2 font-bold leading-tight">{title}</h2>
        </Reveal>
        <Reveal className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" stagger>
          {solutions.map((solution) => (
            <SolutionCard
              imageAlt={solution.alt}
              imageSrc={solution.image}
              key={solution.href}
              href={solution.href.replace(/^\/en(?=\/)/, '')}
              solution={{ ...solution, slug: solution.href.split('/').at(-1) ?? solution.href, category: 'enterprise', features: [], benefits: [] }}
            />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
