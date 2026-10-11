import { Container } from '@/components/ui/Container';

type ContentBlockProps = { title: string; content: string };

export function ChallengeBlock({ title, content }: ContentBlockProps) {
  return (
    <section className="py-8">
      <Container size="prose">
        <h2 className="text-h2 font-bold">{title}</h2>
        <p className="mt-4 leading-relaxed text-text-secondary">{content}</p>
      </Container>
    </section>
  );
}