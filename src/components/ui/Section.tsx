import type { ReactNode } from 'react';

export function Section({
  id,
  children,
  className = '',
  bleed = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  bleed?: boolean;
}) {
  return (
    <section id={id} className={`py-20 md:py-28 ${className}`}>
      {bleed ? children : <div className="container-page">{children}</div>}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  children,
  action,
}: {
  eyebrow?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-(--color-border) pb-5">
      <div>
        {eyebrow ? <p className="meta mb-2">{eyebrow}</p> : null}
        <h2 className="text-3xl md:text-4xl">{children}</h2>
      </div>
      {action}
    </div>
  );
}
