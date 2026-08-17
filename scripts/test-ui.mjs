#!/usr/bin/env node
/**
 * Testes de UI num browser real: responsividade, navegacao e alvos de toque.
 *
 * Estes testes existem porque apanharam tres bugs que nenhuma verificacao
 * estatica apanha: o "voltar" que ia para a pagina errada, a perda da posicao
 * de scroll, e os tokens de cor da superficie clara a ficarem ilegiveis.
 *
 * Nao esta nas devDependencies de propósito — sao 67 MB de browser que nao
 * fazem falta a um `npm install` normal. Para correr:
 *
 *   npm run build && npm start          (noutro terminal)
 *   npm i --no-save puppeteer-core @sparticuz/chromium
 *   node scripts/test-ui.mjs
 *
 * Em Windows/macOS, `npx playwright install chromium` tambem serve, trocando o
 * `executablePath` abaixo.
 */
import chromiumMod from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const chromium = chromiumMod.default ?? chromiumMod;
const BASE = process.env.BASE ?? 'http://localhost:3000';

const VIEWPORTS = [
  ['320 (iPhone SE)', 320, 568], ['390 (iPhone 14)', 390, 844], ['412 (Android)', 412, 915],
  ['768 (tablet)', 768, 1024], ['1024 (tablet paisagem)', 1024, 768],
  ['1440 (laptop)', 1440, 900], ['2560 (1440p)', 2560, 1440],
];
const ROUTES = [
  '/pt', '/pt/work', '/pt/work/criatura-quadrupede', '/pt/work/ambiente-toon-grupo',
  '/pt/showreel', '/pt/showreel/breakdown', '/pt/about', '/pt/contact', '/pt/cv', '/pt/privacy',
];

let failures = 0;
const check = (ok, label, detail = '') => {
  if (!ok) failures += 1;
  console.log(`  ${ok ? '\x1b[32mok   \x1b[0m' : '\x1b[31mFALHA\x1b[0m'} ${label}${detail ? ` — ${detail}` : ''}`);
};

const browser = await puppeteer.launch({
  executablePath: await chromium.executablePath(),
  args: [...chromium.args, '--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'],
  headless: true,
});

/* ------------------------------------------------------- 1. responsividade */
console.log('\n\x1b[1mRESPONSIVIDADE\x1b[0m  (7 larguras x 10 rotas)');
const overflow = [];
const consoleErrors = [];
for (const [vpName, w, h] of VIEWPORTS) {
  for (const route of ROUTES) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    page.on('console', (m) => m.type() === 'error' && consoleErrors.push(`${vpName} ${route}: ${m.text().slice(0, 90)}`));
    page.on('pageerror', (e) => consoleErrors.push(`${vpName} ${route}: ${e.message.slice(0, 90)}`));
    await page.goto(BASE + route, { waitUntil: 'networkidle0', timeout: 45000 });
    const r = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const over = [];
      for (const el of document.querySelectorAll('body *')) {
        const b = el.getBoundingClientRect();
        if (b.width === 0 && b.height === 0) continue;
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') continue;
        if (b.right > vw + 1 || b.left < -1) over.push(el.tagName.toLowerCase());
      }
      return { hScroll: document.documentElement.scrollWidth > vw + 1, over: [...new Set(over)], h1: document.querySelectorAll('h1').length };
    });
    if (r.hScroll || r.over.length) overflow.push(`${vpName} ${route}: ${r.over.join(', ')}`);
    if (r.h1 !== 1) overflow.push(`${vpName} ${route}: ${r.h1} elementos <h1> (deve ser 1)`);
    await page.close();
  }
}
check(overflow.length === 0, 'sem overflow horizontal em 70 combinacoes', overflow.slice(0, 3).join(' | '));
check(consoleErrors.length === 0, 'sem erros de consola', [...new Set(consoleErrors)].slice(0, 2).join(' | '));

/* ----------------------------------------------------------- 2. navegacao */
console.log('\n\x1b[1mNAVEGACAO\x1b[0m');
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const clickBack = () => page.evaluate(() => [...document.querySelectorAll('a, button')].find((x) => /Voltar|Back/.test(x.textContent)).click());

// home -> projeto -> voltar deve regressar a HOME, nao ao indice
await page.goto(`${BASE}/pt`, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.querySelector('#work')?.scrollIntoView());
await new Promise((r) => setTimeout(r, 300));
const scrollBefore = await page.evaluate(() => Math.round(window.scrollY));
await page.evaluate(() => document.querySelector('article a[href*="/work/"]').click());
await page.waitForFunction(() => location.pathname.includes('/work/'), { timeout: 10000 });
await new Promise((r) => setTimeout(r, 500));
await clickBack();
await new Promise((r) => setTimeout(r, 900));
check(new URL(page.url()).pathname === '/pt', 'voltar da home regressa a home', new URL(page.url()).pathname);

// indice -> projeto -> voltar
await page.goto(`${BASE}/pt/work`, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.querySelector('article a[href*="/work/"]').click());
await page.waitForFunction(() => location.pathname.split('/').length > 3, { timeout: 10000 });
await new Promise((r) => setTimeout(r, 400));
await clickBack();
await new Promise((r) => setTimeout(r, 900));
check(new URL(page.url()).pathname === '/pt/work', 'voltar do indice regressa ao indice', new URL(page.url()).pathname);

// scroll restaurado no voltar do browser
await page.goto(`${BASE}/pt`, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.querySelector('#work')?.scrollIntoView());
await new Promise((r) => setTimeout(r, 300));
const y1 = await page.evaluate(() => Math.round(window.scrollY));
await page.evaluate(() => document.querySelector('article a[href*="/work/"]').click());
await page.waitForFunction(() => location.pathname.includes('/work/'), { timeout: 10000 });
await new Promise((r) => setTimeout(r, 400));
await page.goBack({ waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 700));
const y2 = await page.evaluate(() => Math.round(window.scrollY));
check(Math.abs(y1 - y2) < 80, 'posicao de scroll restaurada ao voltar', `${y1}px -> ${y2}px`);

// seletor de idioma preserva a rota
await page.goto(`${BASE}/pt/work/criatura-quadrupede`, { waitUntil: 'networkidle0' });
await page.evaluate(() => [...document.querySelectorAll('nav a')].find((a) => a.textContent.trim() === 'en').click());
await new Promise((r) => setTimeout(r, 900));
check(new URL(page.url()).pathname === '/en/work/criatura-quadrupede', 'mudar de idioma preserva a rota', new URL(page.url()).pathname);

// entrada directa: nao pode mandar a pessoa para fora do site
const fresh = await browser.newPage();
await fresh.setViewport({ width: 1440, height: 900 });
await fresh.goto(`${BASE}/pt/work/criatura-quadrupede`, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 300));
await Promise.all([
  fresh.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {}),
  fresh.evaluate(() => [...document.querySelectorAll('a, button')].find((x) => /Voltar|Back/.test(x.textContent)).click()),
]).catch(() => {});
await new Promise((r) => setTimeout(r, 1000));
check(new URL(fresh.url()).pathname === '/pt/work', 'entrada directa: voltar fica no site', new URL(fresh.url()).pathname);
await fresh.close();

const vt = await page.evaluate(() => [...document.styleSheets].some((ss) => {
  try { return [...ss.cssRules].some((r) => r.cssText?.includes('view-transition')); } catch { return false; }
}));
check(vt, 'regra @view-transition presente no CSS');

/* --------------------------------------------- 3. alvos de toque efectivos */
console.log('\n\x1b[1mALVOS DE TOQUE\x1b[0m  (area efectiva, nao a caixa do <a>)');
await page.setViewport({ width: 390, height: 844 });
await page.goto(`${BASE}/pt/work`, { waitUntil: 'networkidle0' });
const nCards = await page.evaluate(() => document.querySelectorAll('article').length);
let cardsOk = 0;
for (let i = 0; i < nCards; i++) {
  await page.evaluate((k) => document.querySelectorAll('article')[k].scrollIntoView({ block: 'center' }), i);
  await new Promise((r) => setTimeout(r, 200));
  const hits = await page.evaluate((k) => {
    const art = document.querySelectorAll('article')[k];
    const bb = art.getBoundingClientRect();
    const a = art.querySelector('a[href*="/work/"]');
    return [[0.5, 0.2], [0.5, 0.5], [0.15, 0.35], [0.85, 0.8]].filter(([fx, fy]) => {
      const el = document.elementFromPoint(bb.left + bb.width * fx, bb.top + bb.height * fy);
      return !!el && (el === a || a.contains(el) || el.closest('a') === a);
    }).length;
  }, i);
  if (hits === 4) cardsOk += 1;
}
check(cardsOk === nCards, `os ${nCards} cartoes sao clicaveis em toda a area`, `${cardsOk}/${nCards}`);

const small = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('header a, header button, footer a, a.link-target, nav a')) {
    const b = el.getBoundingClientRect();
    if (b.width === 0 || b.height === 0 || el.classList.contains('sr-only')) continue;
    if (b.height < 24 || b.width < 24) out.push(`${Math.round(b.width)}x${Math.round(b.height)} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24)}"`);
  }
  return out;
});
check(small.length === 0, 'controlos de navegacao com >=24px de alvo', small.slice(0, 4).join(' | '));

await browser.close();
console.log(failures === 0 ? '\n\x1b[32m✓ todos os testes de UI passaram\x1b[0m\n' : `\n\x1b[31m✗ ${failures} teste(s) falharam\x1b[0m\n`);
process.exit(failures === 0 ? 0 : 1);
