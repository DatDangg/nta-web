import { Link } from '@/i18n/navigation';
import type { Solution } from '@/content/types';

export function RelatedSolutions({ solutions, title }: { solutions: Solution[]; title: string }) {
  if (solutions.length === 0) return null;

  return (
    <aside aria-labelledby="related-solutions-title" className="self-start lg:sticky lg:top-24">
      <h2 className="text-h3 font-semibold" id="related-solutions-title">{title}</h2>
      <ul className="mt-4 space-y-3">
        {solutions.map((solution) => (
          <li key={solution.slug}>
            <Link className="inline-flex min-h-11 items-center text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus" href={`/solutions/enterprise/${solution.slug}`}>
              {solution.title}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
