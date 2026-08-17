/**
 * Camada unica de leitura de conteudo.
 *
 * REGRA DO PROJETO: nenhum componente le ficheiros JSON directamente e nenhum
 * componente contem texto de projeto. Tudo entra por aqui. Para manter o site,
 * edita-se `content/**.json` e nada mais.
 */
import 'server-only';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Locale } from '@/i18n/routing';

const CONTENT_DIR = join(process.cwd(), 'content');

/* ------------------------------------------------------------------ tipos */

/** Campo bilingue. Pelo menos uma das linguas tem de estar preenchida. */
export type I18nText = Partial<Record<Locale, string>>;
export type I18nList = Partial<Record<Locale, string[]>>;

export type MediaImage = {
  type?: 'image';
  src: string;
  width: number;
  height: number;
  alt: I18nText;
};

export type VideoProvider = 'youtube' | 'vimeo';

export type MediaVideo = {
  type: 'video';
  provider: VideoProvider;
  id: string;
  hash?: string;
  title: I18nText;
  durationSeconds?: number;
  poster?: MediaImage;
};

export type Media = MediaImage | MediaVideo;

export type ProjectVideo = {
  provider: VideoProvider;
  id: string;
  hash?: string;
  title?: I18nText;
  durationSeconds?: number;
};

export type Download = {
  label: I18nText;
  url: string;
  host: 'drive' | 'site' | 'other';
  sizeMb?: number;
  placeholder?: boolean;
};

export type ExternalLink = {
  kind: string;
  label: string;
  url: string;
  placeholder?: boolean;
};

export type Spec = { label: I18nText; value: string | number | I18nText };

export type BreakdownStep = {
  step: number;
  label: I18nText;
  note?: I18nText;
  media: Media[];
};

export type BodyBlock = { heading?: string; text: string };

export type TeamCredit = { name: string; role: I18nText; isMe: boolean };

export type Project = {
  slug: string;
  status: 'published' | 'draft';
  featured: boolean;
  order: number;
  surface: 'dark' | 'mid' | 'light';
  title: string;
  subtitle: I18nText;
  year: number;
  date: string;
  durationLabel: I18nText | null;
  author: string;
  context: 'individual' | 'group';
  institution: string | null;
  team: {
    size: number;
    label: I18nText;
    myRole: I18nText;
    credits: TeamCredit[];
  } | null;
  category: string;
  subcategories: string[];
  roles: string[];
  software: string[];
  summary: I18nText;
  body: Partial<Record<Locale, BodyBlock[]>> | null;
  cover: MediaImage;
  hero: MediaImage | null;
  og: string | null;
  video: ProjectVideo | null;
  poster: MediaImage | null;
  specs: Spec[];
  breakdown: BreakdownStep[];
  gallery: Media[];
  downloads: Download[];
  links: ExternalLink[];
  seo: { title?: I18nText; description?: I18nText; noindex?: boolean };
};

export type Category = {
  slug: string;
  order: number;
  label: I18nText;
  short: I18nText;
  description: I18nText;
  subcategories: { slug: string; label: I18nText }[];
};

export type Taxonomy = {
  categories: Category[];
  roles: { slug: string; label: I18nText }[];
  software: { slug: string; label: string; url?: string }[];
};

export type Site = {
  site: { url: string; name: string; locales: Locale[]; defaultLocale: Locale; launchYear: number };
  author: {
    name: string;
    shortName: string;
    jobTitle: I18nText;
    tagline: I18nText;
    location: I18nText;
    timezone: string;
    email: string;
    phone: string;
    phoneDisplay: string;
    portrait: MediaImage;
    availability: {
      open: boolean;
      label: I18nText;
      from: string;
      detail: I18nText;
      lookingFor: I18nText[];
    };
    languages: { code: string; name: I18nText; level: I18nText }[];
  };
  social: { kind: string; label: string; url: string; primary: boolean; placeholder: boolean }[];
  cv: Record<Locale, { url: string; updated: string; sizeKb: number; placeholder: boolean }>;
  analytics: { provider: string; domain: string; enabled: boolean };
  seo: {
    defaultOgImage: MediaImage;
    twitterHandle: string | null;
    keywords: I18nList;
  };
  education: {
    institution: string;
    url?: string;
    location: I18nText;
    degree: I18nText;
    start: string;
    end: string;
    current: boolean;
  }[];
};

export type Showreel = {
  status: string;
  title: I18nText;
  year: number;
  date: string;
  durationSeconds: number;
  author: string;
  summary: I18nText;
  primary: { provider: VideoProvider; id: string; hash?: string };
  mirrors: { provider: VideoProvider; id: string; label: string; placeholder?: boolean; note?: string }[];
  poster: MediaImage;
  music: { title: string; artist: string; licence: string; placeholder?: boolean };
  captions: { src: string; placeholder?: boolean } | null;
  download: Download | null;
  shots: { at: number; label: I18nText; project: string | null; roles: string[] }[];
};

export type About = {
  bio: I18nList;
  skills: {
    tier: 'primary' | 'secondary' | 'exploring';
    label: I18nText;
    groups: { label: I18nText; items: I18nText[] }[];
  }[];
  tools: { software: string; tier: string; level: I18nText | null }[];
  strengths: I18nText[];
};

/* ---------------------------------------------------------------- leitura */

function read<T>(file: string): T {
  return JSON.parse(readFileSync(join(CONTENT_DIR, file), 'utf8')) as T;
}

export const site: Site = read<Site>('site.json');
export const taxonomy: Taxonomy = read<Taxonomy>('taxonomy.json');
export const showreel: Showreel = read<Showreel>('showreel.json');
export const about: About = read<About>('about.json');

const allProjects: Project[] = readdirSync(join(CONTENT_DIR, 'projects'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => read<Project>(join('projects', f)))
  .sort((a, b) => a.order - b.order || b.year - a.year);

/** Apenas projetos publicados. Rascunhos nunca chegam ao site nem ao sitemap. */
export const projects: Project[] = allProjects.filter((p) => p.status === 'published');

export const featuredProjects: Project[] = projects.filter((p) => p.featured);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getProjectNeighbours(slug: string): { prev: Project | null; next: Project | null } {
  const i = projects.findIndex((p) => p.slug === slug);
  // Com 0 ou 1 projeto nao ha vizinhos; com 2, prev e next seriam o MESMO
  // projeto — mostrar so um evita dois links iguais lado a lado.
  if (i === -1 || projects.length < 2) return { prev: null, next: null };
  const at = (n: number) => projects[(n + projects.length) % projects.length] ?? null;
  const prev = at(i - 1);
  const next = at(i + 1);
  return { prev, next: next && next.slug === prev?.slug ? null : next };
}

/** Categorias que tem pelo menos um projeto publicado. Categoria vazia nao existe. */
export function activeCategories(): Category[] {
  const used = new Set(projects.map((p) => p.category));
  return taxonomy.categories.filter((c) => used.has(c.slug)).sort((a, b) => a.order - b.order);
}

/* ----------------------------------------------------------- bilinguismo */

/**
 * Escolhe o valor no idioma pedido, com fallback para o outro idioma.
 * `from` diz em que idioma o texto realmente esta, para podermos marcar
 * `lang` no HTML e avisar o leitor (ver componente <Fallback/>).
 */
export function pick(field: I18nText | null | undefined, locale: Locale): { value: string; from: Locale } | null {
  if (!field) return null;
  const own = field[locale];
  if (own) return { value: own, from: locale };
  for (const l of site.site.locales) {
    const v = field[l];
    if (v) return { value: v, from: l };
  }
  return null;
}

/** Como `pick`, mas devolve string vazia em vez de null. Para uso em atributos. */
export function text(field: I18nText | null | undefined, locale: Locale): string {
  return pick(field, locale)?.value ?? '';
}

export function pickList(field: I18nList | null | undefined, locale: Locale): { value: string[]; from: Locale } | null {
  if (!field) return null;
  const own = field[locale];
  if (own?.length) return { value: own, from: locale };
  for (const l of site.site.locales) {
    const v = field[l];
    if (v?.length) return { value: v, from: l };
  }
  return null;
}

/** Corpo longo: por decisao editorial esta em ingles. Devolve tambem o idioma real. */
export function pickBody(
  body: Project['body'],
  locale: Locale,
): { value: BodyBlock[]; from: Locale } | null {
  if (!body) return null;
  const own = body[locale];
  if (own?.length) return { value: own, from: locale };
  for (const l of site.site.locales) {
    const v = body[l];
    if (v?.length) return { value: v, from: l };
  }
  return null;
}

/* -------------------------------------------------------------- etiquetas */

export function categoryOf(slug: string): Category | undefined {
  return taxonomy.categories.find((c) => c.slug === slug);
}

export function subcategoryLabel(categorySlug: string, subSlug: string, locale: Locale): string {
  const sub = categoryOf(categorySlug)?.subcategories.find((s) => s.slug === subSlug);
  return sub ? text(sub.label, locale) : subSlug;
}

export function roleLabel(slug: string, locale: Locale): string {
  const r = taxonomy.roles.find((x) => x.slug === slug);
  return r ? text(r.label, locale) : slug;
}

export function softwareLabel(slug: string): string {
  return taxonomy.software.find((x) => x.slug === slug)?.label ?? slug;
}

export function specValue(value: Spec['value'], locale: Locale): string {
  if (typeof value === 'number') return String(value);
  return typeof value === 'string' ? value : text(value, locale);
}

/* ----------------------------------------------------------------- utils */

export function absolute(path: string): string {
  return new URL(path, site.site.url).toString();
}

/** Duracao em segundos -> ISO 8601 para o schema.org VideoObject. */
export function isoDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `PT${m > 0 ? `${m}M` : ''}${s > 0 || m === 0 ? `${s}S` : ''}`;
}

/** Duracao em segundos -> "1 min 5 s" / "1 min 5 s". */
export function humanDuration(seconds: number, locale: Locale): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return locale === 'pt' ? `${s} s` : `${s}s`;
  return locale === 'pt' ? `${m} min ${s} s` : `${m} min ${s}s`;
}

export function timecode(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function isVideo(m: Media): m is MediaVideo {
  return m.type === 'video';
}
