'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

export type NavItem = { href: string; label: string };

export function Nav({ items, cta }: { items: NavItem[]; cta: { href: string; label: string } }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  // Estado + rota em que foi definido: permite fechar o menu ao navegar
  // ajustando o estado DURANTE o render, sem setState dentro de um efeito.
  const [state, setState] = useState({ open: false, path: pathname });
  const panel = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  if (state.path !== pathname) setState({ open: false, path: pathname });
  const open = state.open && state.path === pathname;
  const setOpen = useCallback(
    (next: boolean | ((v: boolean) => boolean)) =>
      setState((s) => ({ open: typeof next === 'function' ? next(s.open) : next, path: s.path })),
    [],
  );

  // ESC fecha e devolve o foco ao botao; sem scroll do body enquanto aberto
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    // Passar para desktop esconde o painel (md:hidden) mas deixaria o scroll
    // bloqueado e o foco preso — fechar explicitamente.
    const desktop = window.matchMedia('(min-width: 768px)');
    const onResize = () => desktop.matches && setOpen(false);

    // `inert` no resto da pagina: sem isto o Tab sai do painel para o conteudo
    // por baixo, que esta visualmente escondido.
    const outside = Array.from(document.querySelectorAll('main, footer'));
    for (const el of outside) el.setAttribute('inert', '');

    document.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onResize);
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLAnchorElement>('a')?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onResize);
      document.body.style.overflow = '';
      for (const el of outside) el.removeAttribute('inert');
    };
  }, [open, setOpen]);

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

  return (
    <>
      {/* Desktop */}
      <nav aria-label={t('menu')} className="hidden items-center gap-1 md:flex">
        {items.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            aria-current={isActive(i.href) ? 'page' : undefined}
            className={`min-h-11 px-3 py-2 text-sm transition-colors ${
              isActive(i.href) ? 'text-(--color-accent)' : 'text-(--color-fg-2) hover:text-(--color-fg)'
            }`}
          >
            {i.label}
          </Link>
        ))}
        <Link
          href={cta.href}
          className="ml-2 inline-flex min-h-11 items-center rounded-full bg-(--color-accent) px-4 text-sm font-medium text-(--color-accent-on) transition-transform hover:scale-[1.02] motion-reduce:transform-none"
        >
          {cta.label}
        </Link>
      </nav>

      {/* Mobile */}
      <button
        ref={toggle}
        type="button"
        aria-expanded={open}
        aria-controls="nav-mobile"
        aria-label={open ? t('closeMenu') : t('menu')}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 w-11 cursor-pointer items-center justify-center md:hidden"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open ? (
        <nav
          id="nav-mobile"
          ref={panel}
          aria-label={t('menu')}
          className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto border-t border-(--color-border) bg-(--color-bg) px-5 py-6 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {[...items, cta].map((i) => (
              <li key={i.href}>
                <Link
                  href={i.href}
                  aria-current={isActive(i.href) ? 'page' : undefined}
                  className={`block border-b border-(--color-border) py-4 font-display text-2xl ${
                    isActive(i.href) ? 'text-(--color-accent)' : 'text-(--color-fg)'
                  }`}
                >
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </>
  );
}
