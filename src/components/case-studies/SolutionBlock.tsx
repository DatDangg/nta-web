type ContentBlockProps = { title: string; content: string };

export function SolutionBlock({ title, content }: ContentBlockProps) {
  return <section className="border-y border-border bg-background-alt px-6 py-8 sm:px-8"><h2 className="text-h2 font-bold">{title}</h2><p className="mt-4 max-w-[65ch] leading-relaxed text-text-secondary">{content}</p></section>;
}
