'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

export type LightboxImage = { src: string; width: number; height: number; alt: string };

/**
 * <dialog> nativo: top-layer, ESC nativo, foco contido pelo browser.
 * A imagem grande so e pedida ao abrir. Ao fechar, o foco volta ao gatilho.
 */
export function Lightbox({ images }: { images: LightboxImage[] }) {
  const t = useTranslations('media');
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [index, setIndex] = useState<number | null>(null);

  const open = useCallback((i: number, from: HTMLElement) => {
    trigger.current = from;
    setIndex(i);
  }, []);

  // showModal() DEPOIS de o conteudo existir: chamado no mesmo tick do
  // setIndex, o dialogo abriria vazio e o foco ficaria no proprio <dialog>.
  useEffect(() => {
    if (index === null) return;
    if (!dialog.current?.open) dialog.current?.showModal();
    closeBtn.current?.focus();
  }, [index]);

  const close = useCallback(() => {
    dialog.current?.close();
  }, []);

  const step = useCallback(
    (delta: number) => setIndex((i) => (i === null ? null : (i + delta + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onClose = () => {
      setIndex(null);
      trigger.current?.focus();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    el.addEventListener('close', onClose);
    el.addEventListener('keydown', onKey);
    return () => {
      el.removeEventListener('close', onClose);
      el.removeEventListener('keydown', onKey);
    };
  }, [step]);

  const current = index === null ? null : images[index];

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {images.map((img, i) => (
          <li key={img.src}>
            <button
              type="button"
              onClick={(e) => open(i, e.currentTarget)}
              className="block w-full cursor-pointer overflow-hidden"
            >
              <Image
                src={img.src}
                width={img.width}
                height={img.height}
                alt={img.alt}
                sizes="(max-width: 640px) 100vw, (max-width: 1424px) 50vw, 616px"
                quality={75}
                loading="lazy"
                className="h-auto w-full transition-transform duration-300 hover:scale-[1.02] motion-reduce:transform-none"
              />
              <span className="sr-only">{t('openImage')}</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label={t('galleryViewer')}
        className="max-h-[100dvh] max-w-[100vw] bg-transparent backdrop:bg-black/90"
      >
        {current ? (
          <div className="flex h-[100dvh] w-screen flex-col">
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <p aria-live="polite" className="meta text-(--color-fg-2)">
                {t('imageOf', { index: (index ?? 0) + 1, total: images.length })}
              </p>
              <button
                ref={closeBtn}
                type="button"
                onClick={close}
                className="min-h-11 min-w-11 cursor-pointer rounded border border-(--color-border-strong) px-3 text-(--color-fg)"
              >
                {t('closeLightbox')}
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-2">
              <Image
                key={current.src}
                src={current.src}
                width={current.width}
                height={current.height}
                alt={current.alt}
                sizes="100vw"
                quality={90}
                className="max-h-full w-auto object-contain"
              />
            </div>
            <div className="flex items-center justify-center gap-3 px-4 py-4">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-keyshortcuts="ArrowLeft"
                className="min-h-11 cursor-pointer rounded border border-(--color-border-strong) px-4 text-(--color-fg)"
              >
                {t('previousImage')}
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-keyshortcuts="ArrowRight"
                className="min-h-11 cursor-pointer rounded border border-(--color-border-strong) px-4 text-(--color-fg)"
              >
                {t('nextImage')}
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
