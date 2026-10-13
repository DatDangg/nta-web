import { ListingIcon } from '@/components/listing/icons';

const arrowButtonBase =
  'flex size-12 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-40';

type HomeScrollArrowsProps = {
  previousLabel: string;
  nextLabel: string;
  canPrev: boolean;
  canNext: boolean;
  onScroll: (direction: -1 | 1) => void;
};

/** Cặp nút tròn ←/→ của các dải thẻ trang chủ (mockup CR-016): nút trái viền trắng, nút phải nền brand nhạt. */
export function HomeScrollArrows({ previousLabel, nextLabel, canPrev, canNext, onScroll }: HomeScrollArrowsProps) {
  return (
    <>
      <button
        aria-label={previousLabel}
        className={`${arrowButtonBase} border border-border bg-surface text-text-primary enabled:hover:bg-background-alt`}
        disabled={!canPrev}
        onClick={() => onScroll(-1)}
        type="button"
      >
        <ListingIcon className="size-5 rotate-180" name="arrow" strokeWidth={2} />
      </button>
      <button
        aria-label={nextLabel}
        className={`${arrowButtonBase} bg-primary-light text-primary-active enabled:hover:bg-primary enabled:hover:text-white`}
        disabled={!canNext}
        onClick={() => onScroll(1)}
        type="button"
      >
        <ListingIcon className="size-5" name="arrow" strokeWidth={2} />
      </button>
    </>
  );
}
