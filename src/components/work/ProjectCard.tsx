import { Link } from '@/i18n/navigation';
import { categoryOf, text, type Project } from '@/lib/content';
import type { Locale } from '@/i18n/routing';
import { Picture } from '@/components/media/Picture';

/**
 * Cartao inteiro clicavel com UM SO tab stop. O link vive no <h3> e a area
 * clicavel vem do ::after (.card-hit). Evita o antipadrao da div clicavel e o
 * do link aninhado. Metadados ficam FORA do link.
 */
export function ProjectCard({
  project,
  locale,
  sizes,
  priority = false,
  large = false,
}: {
  project: Project;
  locale: Locale;
  sizes: string;
  priority?: boolean;
  large?: boolean;
}) {
  const category = categoryOf(project.category);

  return (
    <article className="group relative isolate">
      <div className="overflow-hidden bg-(--color-surface)">
        <Picture
          image={project.cover}
          locale={locale}
          sizes={sizes}
          priority={priority}
          className="h-auto w-full transition-[transform,filter] duration-500 ease-out group-hover:scale-[1.02] group-hover:brightness-105 motion-reduce:transform-none"
        />
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className={large ? 'text-2xl md:text-3xl' : 'text-xl'}>
            <Link href={`/work/${project.slug}`} className="card-hit">
              {project.title}
            </Link>
          </h3>
          <p className="mt-1 max-w-prose text-sm text-(--color-fg-2)">{text(project.subtitle, locale)}</p>
        </div>
        <p className="meta shrink-0 pt-1">{project.year}</p>
      </div>

      <p className="meta mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
        {category ? <span className="text-(--color-accent)">{text(category.short, locale)}</span> : null}
        {project.video ? (
          <>
            <span aria-hidden="true">·</span>
            <span>video</span>
          </>
        ) : null}
        {project.context === 'group' ? (
          <>
            <span aria-hidden="true">·</span>
            <span>{text(project.team?.label, locale)}</span>
          </>
        ) : null}
      </p>
    </article>
  );
}
