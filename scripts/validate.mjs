#!/usr/bin/env node
/**
 * Validacao de conteudo e de tokens. Corre ANTES do `next build` (ver netlify.toml),
 * por isso um erro aqui falha o deploy e o deploy anterior mantem-se em producao.
 *
 *   npm run validate
 *
 * Verifica:
 *   1. estrutura de cada content/projects/*.json
 *   2. slugs unicos e coerentes com o nome do ficheiro
 *   3. categorias, subcategorias, papeis e software existem na taxonomia
 *   4. cada imagem referenciada existe em disco E as dimensoes declaradas batem
 *      com o ficheiro real (--fix reescreve as dimensoes)
 *   5. paridade de chaves entre messages/pt.json e messages/en.json
 *   6. contraste dos tokens de cor contra os limiares WCAG AA
 *
 * Avisa (sem falhar) sobre conteudo marcado com "placeholder": true.
 * Sem dependencias: propositadamente, para poder ser corrido daqui a dois anos.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, openSync, readSync, closeSync } from 'node:fs';
import { join, basename } from 'node:path';

const ROOT = process.cwd();
const FIX = process.argv.includes('--fix');
const errors = [];
const warnings = [];
const notes = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

/* ------------------------------------------------- dimensoes de imagem, sem deps */

const SIZEABLE = /\.(jpe?g|png)$/i; // formatos cujas dimensoes sabemos ler aqui

function imageSize(file) {
  // 1 MB: um JPEG com perfil ICC grande pode ter o marcador SOF muito para
  // dentro do ficheiro, e ler so 64 KB devolvia null em silencio.
  const fd = openSync(file, 'r');
  const buf = Buffer.alloc(1_048_576);
  const len = readSync(fd, buf, 0, buf.length, 0);
  closeSync(fd);

  // PNG: IHDR width/height nos bytes 16..24
  if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // JPEG: percorrer marcadores ate um SOFn
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let o = 2;
    while (o < len - 9) {
      if (buf[o] !== 0xff) { o++; continue; }
      // bytes de preenchimento FF FF: avancar um, senao o salto descarrila
      if (buf[o + 1] === 0xff) { o++; continue; }
      const marker = buf[o + 1];
      const size = buf.readUInt16BE(o + 2);
      if (size < 2) break;
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { height: buf.readUInt16BE(o + 5), width: buf.readUInt16BE(o + 7) };
      }
      o += 2 + size;
    }
  }
  return null;
}

/* ------------------------------------------------------------------- taxonomia */

const taxonomy = read('content/taxonomy.json');
const CATS = new Map(taxonomy.categories.map((c) => [c.slug, new Set(c.subcategories.map((s) => s.slug))]));
const ROLES = new Set(taxonomy.roles.map((r) => r.slug));
const SOFTWARE = new Set(taxonomy.software.map((s) => s.slug));
const SURFACES = new Set(['dark', 'mid', 'light']);
const LOCALES = ['pt', 'en'];

/* --------------------------------------------------------------------- helpers */

function checkI18n(where, field, name, { required = true } = {}) {
  if (field == null) {
    if (required) err(where, `falta o campo bilingue "${name}"`);
    return;
  }
  if (typeof field !== 'object') return err(where, `"${name}" tem de ser um objeto { pt, en }`);
  const filled = LOCALES.filter((l) => typeof field[l] === 'string' && field[l].trim());
  if (filled.length === 0) err(where, `"${name}" nao tem texto em nenhum idioma`);
  else if (filled.length < LOCALES.length) {
    const missing = LOCALES.filter((l) => !filled.includes(l));
    notes.push(`${where}: "${name}" sem traducao em ${missing.join(', ')} (usara fallback)`);
  }
}

/** Valida uma lista de Media (imagem ou video), venha do breakdown ou da galeria. */
function checkMedia(where, list) {
  for (const m of list) {
    if (m?.type === 'video') {
      if (!['youtube', 'vimeo'].includes(m.provider)) err(where, `provider de video invalido: "${m.provider}"`);
      if (!m.id) err(where, 'video sem "id"');
      else if (/^https?:/.test(String(m.id))) err(where, `"id" do video tem de ser so o identificador, nao o URL: ${m.id}`);
      if (!m.poster) err(where, `video ${m.id} sem "poster" — a fachada clicavel precisa dele, e sem ele o video NAO APARECE`);
      checkI18n(where, m.title, 'title do video');
    } else if (m && !m.src) {
      err(where, 'item de media sem "src" nem "type": "video"');
    }
  }
}

/** So https absoluto ou caminho interno. Bloqueia javascript: e data:. */
function checkUrl(where, url, name) {
  if (typeof url !== 'string' || !/^(https:\/\/|\/)/.test(url)) {
    err(where, `${name} tem de comecar por "https://" ou "/" — recebido: ${JSON.stringify(url)}`);
  }
}

const seenImages = new Map(); // src -> {width,height}
function collectImages(where, node, patch) {
  if (Array.isArray(node)) return node.forEach((n) => collectImages(where, n, patch));
  if (!node || typeof node !== 'object') return;
  if (typeof node.src === 'string' && node.src.startsWith('/media/') && !/\.vtt$/i.test(node.src)) {
    const file = join(ROOT, 'public', node.src);
    if (!existsSync(file)) {
      err(where, `imagem inexistente em disco: ${node.src}`);
    } else if (!SIZEABLE.test(node.src)) {
      notes.push(`${where}: ${node.src} — dimensoes nao verificadas (so JPEG e PNG sao lidos)`);
    } else {
      const real = imageSize(file);
      if (!real) {
        warn(where, `${node.src}: nao foi possivel ler as dimensoes do ficheiro`);
      } else if (node.width !== real.width || node.height !== real.height) {
        if (FIX) {
          node.width = real.width;
          node.height = real.height;
          patch.changed = true;
        } else {
          err(where, `${node.src}: declarado ${node.width}x${node.height}, ficheiro tem ${real.width}x${real.height} (corrige com: npm run validate -- --fix)`);
        }
      }
      if (real) seenImages.set(node.src, real);
    }
    checkI18n(`${where} › ${node.src}`, node.alt, 'alt');
  }
  for (const [k, v] of Object.entries(node)) {
    if (k === 'alt') continue;
    collectImages(where, v, patch);
  }
}

function countPlaceholders(node, acc = { n: 0 }) {
  if (Array.isArray(node)) { node.forEach((n) => countPlaceholders(n, acc)); return acc; }
  if (!node || typeof node !== 'object') return acc;
  if (node.placeholder === true) acc.n++;
  for (const v of Object.values(node)) countPlaceholders(v, acc);
  return acc;
}

/* -------------------------------------------------------------------- projetos */

const files = readdirSync(join(ROOT, 'content/projects')).filter((f) => f.endsWith('.json'));
if (files.length === 0) err('content/projects', 'nao ha nenhum projeto');

const slugs = new Set();
let published = 0;

for (const f of files) {
  const where = `content/projects/${f}`;
  const p = read(`content/projects/${f}`);
  const patch = { changed: false };

  if (typeof p.slug !== 'string' || !/^[a-z0-9-]+$/.test(p.slug)) err(where, 'slug ausente ou invalido (so a-z, 0-9 e hifen)');
  else {
    if (p.slug !== basename(f, '.json')) err(where, `o slug "${p.slug}" nao corresponde ao nome do ficheiro`);
    if (slugs.has(p.slug)) err(where, `slug duplicado: ${p.slug}`);
    slugs.add(p.slug);
  }

  // BLOQUEADOR se faltar: as paginas desreferenciam estas listas sem guarda.
  // Apagar `"gallery": []` do JSON dava um TypeError no log da Netlify.
  for (const k of ['subcategories', 'roles', 'software', 'specs', 'breakdown', 'gallery', 'downloads', 'links']) {
    if (!Array.isArray(p[k])) err(where, `"${k}" tem de ser uma lista — usar [] se estiver vazia`);
  }
  for (const k of ['cover', 'hero', 'poster', 'video', 'team', 'body', 'durationLabel', 'institution', 'og', 'seo']) {
    if (!(k in p)) err(where, `falta a chave "${k}" — copiar de rascunho-exemplo.json e usar null se nao se aplica`);
  }
  if (p.seo != null && typeof p.seo !== 'object') err(where, '"seo" tem de ser um objeto (pode ser {})');

  if (!['published', 'draft'].includes(p.status)) err(where, 'status tem de ser "published" ou "draft"');
  if (!SURFACES.has(p.surface)) err(where, `surface invalida: "${p.surface}" (usar dark, mid ou light)`);
  if (typeof p.title !== 'string' || !p.title.trim()) err(where, 'falta o title');
  if (!Number.isInteger(p.year)) err(where, 'year tem de ser um numero inteiro');
  if (typeof p.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(p.date)) err(where, 'date tem de estar em AAAA-MM-DD');
  if (!['individual', 'group'].includes(p.context)) err(where, 'context tem de ser "individual" ou "group"');
  if (p.context === 'group' && !p.team) err(where, 'projeto de grupo sem bloco "team" — os creditos tem de ser declarados');

  if (!CATS.has(p.category)) err(where, `categoria desconhecida: "${p.category}"`);
  else for (const s of p.subcategories ?? []) {
    if (!CATS.get(p.category).has(s)) err(where, `subcategoria "${s}" nao pertence a categoria "${p.category}"`);
  }
  for (const r of p.roles ?? []) if (!ROLES.has(r)) err(where, `papel desconhecido: "${r}"`);
  for (const s of p.software ?? []) if (!SOFTWARE.has(s)) err(where, `software desconhecido: "${s}"`);

  checkI18n(where, p.subtitle, 'subtitle');
  checkI18n(where, p.summary, 'summary');
  if (p.durationLabel != null) checkI18n(where, p.durationLabel, 'durationLabel');
  for (const sp of p.specs ?? []) {
    checkI18n(where, sp.label, 'specs[].label');
    if (sp.value == null || (typeof sp.value === 'object' && !Object.keys(sp.value).length)) {
      err(where, 'specs[] com "value" vazio');
    } else if (typeof sp.value === 'object') {
      checkI18n(where, sp.value, 'specs[].value');
    }
  }
  if (p.team) {
    checkI18n(where, p.team.label, 'team.label');
    checkI18n(where, p.team.myRole, 'team.myRole');
    if (!Array.isArray(p.team.credits) || p.team.credits.length === 0) err(where, 'team sem "credits"');
    else {
      for (const c of p.team.credits) {
        if (!c.name) err(where, 'credito de equipa sem "name"');
        checkI18n(where, c.role, `team.credits[${c.name}].role`);
      }
      if (!p.team.credits.some((c) => c.isMe === true)) err(where, 'nenhum credito de equipa com "isMe": true');
    }
  }
  for (const k of ['title', 'description']) {
    if (p.seo?.[k] != null) checkI18n(where, p.seo[k], `seo.${k}`);
  }

  if (p.status === 'published') {
    published++;
    if (!p.cover) err(where, 'projeto publicado sem "cover"');
    if (p.video && !p.poster) err(where, 'tem "video" mas nao tem "poster" — a fachada clicavel precisa dele');
    if (p.video && !['youtube', 'vimeo'].includes(p.video.provider)) err(where, `provider de video invalido: "${p.video?.provider}"`);
    if (p.featured && !p.cover) err(where, 'projeto em destaque sem "cover"');
  }

  for (const step of p.breakdown ?? []) {
    const w = `${where} › etapa ${step.step}`;
    if (!Number.isInteger(step.step)) err(w, 'etapa sem "step" numerico');
    checkI18n(w, step.label, 'label');
    if (step.note != null) checkI18n(w, step.note, 'note');
    if (!Array.isArray(step.media)) err(w, '"media" tem de ser uma lista');
    checkMedia(w, step.media ?? []);
  }
  // A galeria aceita imagens E videos. Um video de galeria sem poster nao dava
  // erro e simplesmente NAO APARECIA no site (MediaBlock devolve null).
  checkMedia(`${where} › galeria`, p.gallery ?? []);

  for (const d of p.downloads ?? []) {
    checkI18n(where, d.label, 'downloads[].label');
    checkUrl(where, d.url, 'downloads[].url');
  }
  for (const l of p.links ?? []) {
    if (!l.label) err(where, 'links[] sem "label"');
    checkUrl(where, l.url, 'links[].url');
  }

  collectImages(where, p, patch);
  if (patch.changed) {
    writeFileSync(join(ROOT, where), `${JSON.stringify(p, null, 2)}\n`);
    notes.push(`${where}: dimensoes de imagem corrigidas (o ficheiro foi reformatado)`);
  }

  const ph = countPlaceholders(p).n;
  if (ph > 0) warn(where, `${ph} item(ns) marcados "placeholder": true — substituir por conteudo real`);
}

if (published === 0) err('content/projects', 'nenhum projeto publicado — o site ficaria vazio');

/* ---------------------------------------------- site, taxonomia, showreel, about */

const site = read('content/site.json');
const showreel = read('content/showreel.json');
for (const [where, doc] of [['content/site.json', site], ['content/showreel.json', showreel], ['content/about.json', read('content/about.json')]]) {
  const patch = { changed: false };
  collectImages(where, doc, patch);
  const ph = countPlaceholders(doc).n;
  if (ph > 0) warn(where, `${ph} item(ns) marcados "placeholder": true`);
}
if (!site.site.url?.startsWith('https://')) err('content/site.json', 'site.url tem de ser um URL https absoluto');
for (const soc of site.social ?? []) checkUrl('content/site.json', soc.url, `social[${soc.kind}].url`);
for (const l of LOCALES) if (site.cv?.[l]?.url) checkUrl('content/site.json', site.cv[l].url, `cv.${l}.url`);
if (showreel.download) checkUrl('content/showreel.json', showreel.download.url, 'download.url');
if (!Number.isInteger(showreel.durationSeconds) || showreel.durationSeconds <= 0) {
  err('content/showreel.json', 'durationSeconds tem de ser um inteiro positivo');
}
if (!['youtube', 'vimeo'].includes(showreel.primary?.provider)) err('content/showreel.json', 'primary.provider invalido');
if (!/^Showreel \d{4}$/.test(showreel.title?.en ?? '')) {
  warn('content/showreel.json', 'o titulo devia estar datado ("Showreel 2026") — um reel sem data le-se como negligencia');
}
for (const l of LOCALES) if (!site.cv?.[l]?.url) err('content/site.json', `falta o CV em "${l}"`);
for (const shot of showreel.shots ?? []) {
  if (shot.project && !slugs.has(shot.project)) err('content/showreel.json', `o plano em ${shot.at}s aponta para o projeto inexistente "${shot.project}"`);
  for (const r of shot.roles ?? []) if (!ROLES.has(r)) err('content/showreel.json', `papel desconhecido no showreel: "${r}"`);
}
if (showreel.captions?.src && !existsSync(join(ROOT, 'public', showreel.captions.src))) {
  err('content/showreel.json', `ficheiro de legendas inexistente: ${showreel.captions.src}`);
}

/* --------------------------------------------------------- paridade de mensagens */

const flat = (o, p = '') =>
  Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' ? flat(v, `${p}${k}.`) : [`${p}${k}`]));
const keys = Object.fromEntries(LOCALES.map((l) => [l, new Set(flat(read(`messages/${l}.json`)))]));
for (const a of LOCALES) {
  for (const b of LOCALES) {
    if (a === b) continue;
    for (const k of keys[a]) if (!keys[b].has(k)) err(`messages/${b}.json`, `falta a chave "${k}" (existe em ${a})`);
  }
}

/* ---------------------------------------------------------- contraste dos tokens */

const css = readFileSync(join(ROOT, 'src/app/globals.css'), 'utf8');
const tok = (name) => css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1];

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

// [nome, fg, bg, minimo]. 4.5 = texto normal AA; 3 = texto grande / componente.
const PAIRS = [
  ['fg / bg', 'fg', 'bg', 4.5],
  ['fg / surface', 'fg', 'surface', 4.5],
  ['fg / surface-up', 'fg', 'surface-up', 4.5],
  ['fg-2 / bg', 'fg-2', 'bg', 4.5],
  ['fg-2 / surface-up', 'fg-2', 'surface-up', 4.5],
  ['fg-muted / bg', 'fg-muted', 'bg', 4.5],
  ['fg-muted / surface-up', 'fg-muted', 'surface-up', 4.5],
  ['accent / bg', 'accent', 'bg', 4.5],
  ['accent / surface-up', 'accent', 'surface-up', 4.5],
  ['accent-on / accent (texto sobre o laranja)', 'accent-on', 'accent', 4.5],
  ['light-fg / light-bg', 'light-fg', 'light-bg', 4.5],
  ['accent-dim / light-bg', 'accent-dim', 'light-bg', 4.5],
  ['border-strong / bg (componentes)', 'border-strong', 'bg', 3],
  ['border-strong / surface-up (componentes)', 'border-strong', 'surface-up', 3],
];
const contrast = [];
for (const [label, fg, bg, min] of PAIRS) {
  const a = tok(fg), b = tok(bg);
  if (!a || !b) { err('globals.css', `token nao encontrado: --color-${!a ? fg : bg}`); continue; }
  const r = ratio(a, b);
  contrast.push([label, r, min]);
  if (r < min) err('globals.css', `contraste insuficiente em ${label}: ${r.toFixed(2)}:1 (minimo ${min}:1)`);
}

/* ----------------------------------------------------------------------- saida */

const g = (s) => `\x1b[32m${s}\x1b[0m`, y = (s) => `\x1b[33m${s}\x1b[0m`, r = (s) => `\x1b[31m${s}\x1b[0m`, d = (s) => `\x1b[2m${s}\x1b[0m`;

console.log(`\n${d('conteudo')}  ${files.length} ficheiros de projeto, ${published} publicados, ${seenImages.size} imagens verificadas`);
console.log(`${d('contraste')} ${contrast.filter(([, v, m]) => v >= m).length}/${contrast.length} pares passam AA`);
for (const [label, v, m] of contrast) {
  console.log(`  ${v >= m ? g('ok  ') : r('FALHA')} ${String(v.toFixed(2)).padStart(6)}:1  (min ${m})  ${label}`);
}

if (notes.length) {
  console.log(`\n${d(`notas (${notes.length})`)}`);
  for (const n of notes.slice(0, 12)) console.log(d(`  · ${n}`));
  if (notes.length > 12) console.log(d(`  · … e ${notes.length - 12} mais`));
}
if (warnings.length) {
  console.log(`\n${y(`avisos (${warnings.length}) — nao falham o build`)}`);
  for (const w of warnings) console.log(y(`  ! ${w}`));
}
if (errors.length) {
  console.log(`\n${r(`erros (${errors.length}) — o build vai falhar`)}`);
  for (const e of errors) console.log(r(`  ✗ ${e}`));
  console.log('');
  process.exit(1);
}
console.log(`\n${g('✓ conteudo valido')}\n`);
