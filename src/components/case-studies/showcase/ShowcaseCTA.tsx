import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { buttonStyles } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import type { CaseStudyShowcase } from '@/content/types';
import { ArrowRight } from './icons';

type Props = { cta: CaseStudyShowcase['cta'] };

/** Thẻ CTA bo góc (khác dải CTABanner full-bleed): nền ảnh di tích phủ gradient teal đậm. */
export function ShowcaseCTA({ cta }: Props) {
  // Link ngoài (vd FridayAI → fridayaix.com) mở tab mới như nút chính ở hero.
  const isExternal = /^https?:\/\//i.test(cta.href);
  const buttonClass = `${buttonStyles('inverse', 'lg')} shrink-0 gap-2 whitespace-nowrap`;
  return (
    <section className="pb-14 md:pb-20">
      <Container>
        <div className="relative isolate overflow-hidden rounded-3xl bg-[#0b5e4f] px-6 py-10 text-white shadow-lg sm:px-10 md:py-12 lg:px-14">
          {cta.image && <Image alt="" aria-hidden className="-z-10 object-cover" fill sizes="(min-width: 1280px) 1216px, 100vw" src={cta.image} />}
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0a5c4d] via-[#0b6b58]/90 to-[#0b6b58]/30" />
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-[clamp(1.5rem,1.2rem+1.2vw,2.125rem)] font-bold leading-tight">{cta.title}</h2>
              <p className="mt-3 leading-relaxed text-white/90">{cta.description}</p>
            </div>
            {isExternal ? (
              <a className={buttonClass} href={cta.href} rel="noopener noreferrer" target="_blank">
                {cta.label}
                <ArrowRight />
              </a>
            ) : (
              <Link className={buttonClass} href={cta.href}>
                {cta.label}
                <ArrowRight />
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
