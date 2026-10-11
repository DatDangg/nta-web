import { Section } from '@/components/ui/Section';

type SolutionSectionContent = {
  title: string;
  intro?: string;
  items?: string[];
};

export function SolutionSections({ sections }: { sections: SolutionSectionContent[] }) {
  if (sections.length === 0) return null;

  return (
    <div>
      {sections.map((section) => (
        // `default` (1280) chứ không phải `prose`: `items` là grid 2 cột, ở 720px mỗi cột
        // chỉ còn ~320px (40ch) → chữ bẻ dòng từng từ. Phần chữ 1 cột đã tự giới hạn
        // bằng max-w-[65ch], tương đương mục tiêu độ dài dòng của prose.
        <Section key={section.title}>
          <h2 className="text-h2 font-semibold">{section.title}</h2>
          {section.intro && <p className="mt-4 max-w-[65ch] text-body-lg">{section.intro}</p>}
          {section.items && section.items.length > 0 && (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {section.items.map((item) => (
                <li className="max-w-[65ch] border-t border-border py-4" key={item}>{item}</li>
              ))}
            </ul>
          )}
        </Section>
      ))}
    </div>
  );
}