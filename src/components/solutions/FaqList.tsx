import { Section } from '@/components/ui/Section';

type SolutionFaq = { question: string; answer: string };

export function FaqList({ faq, title }: { faq: SolutionFaq[]; title: string }) {
  if (faq.length === 0) return null;

  return (
    <Section>
      <h2 className="text-h2 font-semibold">{title}</h2>
      <div className="mt-6 space-y-6">
        {faq.map(({ question, answer }) => (
          <article className="border-t border-border pt-4" key={question}>
            <h3 className="text-h3 font-semibold">{question}</h3>
            <p className="mt-2 text-body">{answer}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
