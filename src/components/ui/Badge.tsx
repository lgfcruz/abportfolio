import type { ReactNode } from 'react';

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'accent' }) {
  const cls =
    tone === 'accent'
      ? 'bg-(--color-accent) text-(--color-accent-on)'
      : 'border border-(--color-border-strong) text-(--color-fg-2)';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[0.7rem] tracking-wide uppercase ${cls}`}>
      {children}
    </span>
  );
}
