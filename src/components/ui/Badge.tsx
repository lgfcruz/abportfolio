import type { ReactNode } from 'react';

/**
 * Le os tokens de SUPERFICIE, nao os globais. Na pagina de superficie clara os
 * tokens escuros davam 2,02:1 no texto e a badge era praticamente invisivel.
 */
export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'accent' }) {
  const cls =
    tone === 'accent'
      ? 'bg-(--surface-accent) text-(--surface-accent-on)'
      : 'border border-(--surface-border-strong) text-(--surface-fg-2)';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[0.7rem] tracking-wide uppercase ${cls}`}>
      {children}
    </span>
  );
}
