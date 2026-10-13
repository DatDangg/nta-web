'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import { useTranslations } from 'next-intl';

export type LightboxItem = { src: string; alt: string };

type Props = {
  items: LightboxItem[];
  /** Ảnh đang xem; `null` = lightbox đóng. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

const SWIPE_THRESHOLD_PX = 50;
const CONTROL_CLASS = 'flex size-11 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

/**
 * Xem ảnh phóng to bằng `<dialog>` native + `showModal()`: top layer, nền inert (Tab không ra ngoài),
 * Esc đóng qua sự kiện `close`. Trước/sau vòng lặp đầu↔cuối (nút, ←/→, vuốt ngang).
 * Trả focus về phần tử mở lightbox là việc của component cha (nó biết nút nào đã bấm).
 */
export function Lightbox({ items, index, onIndexChange, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const swipeStartX = useRef<number | null>(null);
  const suppressNextClick = useRef(false);
  const [entered, setEntered] = useState(false);
  const captionId = useId();
  const t = useTranslations('common.lightbox');
  const isOpen = index !== null;
  const total = items.length;
  const current = index === null ? undefined : items[index];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return;
    if (!dialog.open) dialog.showModal();
    closeButtonRef.current?.focus();
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => {
      cancelAnimationFrame(frame);
      setEntered(false);
      root.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, [isOpen]);

  const go = (step: 1 | -1) => {
    if (index === null || total < 2) return;
    onIndexChange((index + step + total) % total);
  };

  // Sự kiện `close` được queue bất đồng bộ: nếu dialog đã mở lại (StrictMode remount) thì bỏ qua.
  const handleNativeClose = () => {
    if (!dialogRef.current?.open) onClose();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); go(1); }
  };

  // Bấm vùng nền (không phải ảnh / nút / chú thích) → đóng.
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (suppressNextClick.current) { suppressNextClick.current = false; return; }
    if (!(event.target as HTMLElement).closest('[data-lightbox-content]')) onClose();
  };

  const handlePointerDown = (event: PointerEvent<HTMLDialogElement>) => {
    swipeStartX.current = event.clientX;
    // Vuốt bằng touch có thể không sinh `click` → không để cờ chặn click treo sang lần bấm sau.
    suppressNextClick.current = false;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDialogElement>) => {
    const startX = swipeStartX.current;
    swipeStartX.current = null;
    if (startX === null) return;
    const deltaX = event.clientX - startX;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    suppressNextClick.current = true;
    go(deltaX < 0 ? 1 : -1);
  };

  return (
    <dialog
      aria-describedby={current?.alt ? captionId : undefined}
      aria-label={t('label')}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none touch-pan-y bg-transparent p-0 text-white backdrop:bg-black/85"
      onClick={handleClick}
      onClose={handleNativeClose}
      onKeyDown={handleKeyDown}
      onPointerCancel={() => { swipeStartX.current = null; }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      ref={dialogRef}
    >
      {current && (
        <div className={`flex h-full w-full flex-col items-center justify-center gap-3 px-4 py-16 motion-safe:transition motion-safe:duration-base motion-safe:ease-out ${entered ? 'opacity-100 motion-safe:scale-100' : 'opacity-0 motion-safe:scale-95'}`}>
          <div className="relative h-[min(78dvh,900px)] w-[min(92vw,1400px)]" data-lightbox-content>
            <Image alt={current.alt} className="select-none object-contain" draggable={false} fill key={current.src} sizes="92vw" src={current.src} />
          </div>
          <p className="max-w-[min(92vw,1400px)] text-center text-sm text-white/90" data-lightbox-content>
            {total > 1 && <span className="font-semibold tabular-nums">{t('counter', { current: (index ?? 0) + 1, total })}</span>}
            {total > 1 && current.alt && <span aria-hidden="true"> · </span>}
            {current.alt && <span id={captionId}>{current.alt}</span>}
          </p>
          <button aria-label={t('close')} className={`absolute right-3 top-3 sm:right-5 sm:top-5 ${CONTROL_CLASS}`} data-lightbox-content onClick={onClose} ref={closeButtonRef} type="button">
            <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          {total > 1 && <>
            <button aria-label={t('prev')} className={`absolute left-2 top-1/2 -translate-y-1/2 sm:left-5 ${CONTROL_CLASS}`} data-lightbox-content onClick={() => go(-1)} type="button">
              <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            <button aria-label={t('next')} className={`absolute right-2 top-1/2 -translate-y-1/2 sm:right-5 ${CONTROL_CLASS}`} data-lightbox-content onClick={() => go(1)} type="button">
              <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </>}
        </div>
      )}
    </dialog>
  );
}
