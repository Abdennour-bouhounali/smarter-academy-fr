// QA — 2AM, unité 2 « الكسور والعمليات عليها » (cycle moyen, phase 3, 2026-10-14) — la PREMIÈRE leçon de 2AM,
// `qisma-iqlidiya-hasr`, et son labo `egg-trays` (MANIPULATION_CONTRACT §2unvicies).
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/2am-kusur-amaliyat.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur :
//   1. la page d'unité 2AM, le sommaire et CHAQUE محور à 1280 et 320 px : monté, aucune erreur console, aucun débordement
//      horizontal, aucun « $ » / « \command » / clé `manipulation.` brute dans le texte visible ;
//   2. le module 1 : la « تذكّر » renvoie à la leçon 1AM publiée (lien) ;
//   3. le labo, مبتدئ (50 œufs, boîtes de 12) : le cadre posé sur [4 ; 5] par ses pas, le remplissage par les pas (4 boîtes +
//      2 œufs), le cadre jugé juste ; متقدم monté sur la commande du manuel (2145, plateaux de 30) ;
//   4. D'UN SEUL REGARD : `[data-et-glance]` tient dans la hauteur de l'écran à 1280×800, 1366×768, 390×844 et 320×640,
//      aux deux niveaux.
// Captures dans /tmp/qa-2am-hasr (ou QA_OUT).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-2am-hasr';
const CH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/qisma-iqlidiya-hasr`;
const MODULES = ['astaidd', 'nashat', 'maarif', 'tariqa', 'atamarran', 'masala-1', 'masala-2', 'masala-3', 'itqan'];
const UNIT = `${CH}/units/kusur-amaliyat`;
mkdirSync(OUT, { recursive: true });

const failures = [];
const check = (ok, label) => { if (!ok) failures.push(label); console.log(`${ok ? '✓' : '✗'} ${label}`); };

async function loginToken(who) {
  if (process.env.QA_TOKEN) return process.env.QA_TOKEN;
  const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(who) });
  const data = await res.json().catch(() => ({}));
  const token = data.token ?? data.access_token ?? data.data?.token;
  if (!token) throw new Error(`login ${who.email}: ${res.status}`);
  return token;
}

async function contextFor(browser, token, viewport) {
  const ctx = await browser.newContext({ viewport, locale: 'ar' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); } catch { /* noop */ } }, token);
  return ctx;
}

const RAW = /(^|[^\\])\$[^$\s][^$]*\$|\\(frac|times|mathrm|ldots|le|div)\b|manipulation\.[a-zA-Z]+\./;

async function pageHealth(page, label) {
  const { overflow, raw } = await page.evaluate((re) => {
    const rx = new RegExp(re);
    const doc = document.documentElement;
    const bad = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode;
      const el = n.parentElement;
      if (!el || el.closest('script,style,.katex-mathml,[aria-hidden="true"]')) continue;
      if (el.closest('[hidden]')) continue;
      if (rx.test(n.textContent)) bad.push(n.textContent.trim().slice(0, 80));
    }
    return { overflow: doc.scrollWidth - doc.clientWidth, raw: bad.slice(0, 3) };
  }, RAW.source);
  check(overflow <= 1, `${label}: pas de débordement horizontal (${overflow}px)`);
  check(raw.length === 0, `${label}: aucun texte brut ${raw.length ? JSON.stringify(raw) : ''}`);
}

const browser = await chromium.launch();
const token = await loginToken(TEACHER);
const ONLY_LAB = process.env.LAB_ONLY === '1';

// 1 + 2 — unité, sommaire, modules aux deux largeurs.
if (!ONLY_LAB) for (const vp of [{ width: 1280, height: 800 }, { width: 320, height: 640 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}px`;

  await page.goto(`${BASE}${UNIT}`, { waitUntil: 'networkidle' });
  check(await page.getByText('القسمة الإقليدية وحصر حاصل القسمة').first().isVisible().catch(() => false), `${tag} page d'unité 2AM : la leçon est listée`);
  await pageHealth(page, `${tag} unité`);
  await page.screenshot({ path: `${OUT}/unit-${vp.width}.png`, fullPage: false });

  await page.goto(`${BASE}${LESSON}`, { waitUntil: 'networkidle' });
  check(await page.getByText('القسمة الإقليدية وحصر حاصل القسمة').first().isVisible().catch(() => false), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);
  await page.screenshot({ path: `${OUT}/index-${vp.width}.png`, fullPage: true });

  for (const slug of MODULES) {
    await page.goto(`${BASE}${LESSON}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const mounted = await page.locator('main, [data-module-layout], h1').first().isVisible().catch(() => false);
    check(mounted, `${tag} ${slug} monté`);
    if (slug === 'nashat') check(await page.locator('[data-recall-link]').count() === 0 && await page.locator('[data-module-brief]').count() === 0, `${tag} nashat : le labo en tête, la « تذكّر » vient après la réponse`);
    await pageHealth(page, `${tag} ${slug}`);
    await page.screenshot({ path: `${OUT}/${slug}-${vp.width}.png`, fullPage: true });
  }
  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 3 + 4 — le labo.
const glanceFits = async (page, label) => {
  const box = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-et-glance]')].find((e) => e.offsetParent !== null);
    if (!el) return null;
    el.scrollIntoView({ block: 'start', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    return { h: r.height, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.h <= box.vh, `${label}: [data-et-glance] tient dans l'écran (${box ? `${Math.round(box.h)} / ${box.vh}` : 'absent'})`);
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-et-glance] reste dans la largeur`);
};
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForTimeout(400);
};

for (const vp of [{ width: 1280, height: 800 }, { width: 1366, height: 768 }, { width: 390, height: 844 }, { width: 320, height: 640 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-egg-trays]', { timeout: 15000 }).catch(() => {});
  // Le module s'ouvre sur l'activité du manuel (متقدم).
  await glanceFits(page, `${vp.width}×${vp.height} متقدم`);
  await page.screenshot({ path: `${OUT}/lab-advanced-${vp.width}.png` });
  await pickLevel(page, 'beginner');
  await glanceFits(page, `${vp.width}×${vp.height} مبتدئ`);
  await page.screenshot({ path: `${OUT}/lab-beginner-${vp.width}.png` });
  await ctx.close();
}

{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  const adv = page.locator('[data-manipulation-level-panel=advanced] [data-egg-trays]');
  await adv.waitFor({ timeout: 15000 }).catch(() => {});
  check(await adv.getAttribute('data-world').catch(() => null) === 'tray', 'متقدم : monde « tray », 2145 œufs en plateaux de 30');
  check((await adv.getAttribute('data-a').catch(() => null)) === '2145' && (await adv.getAttribute('data-b').catch(() => null)) === '30', 'متقدم : la commande du manuel, 2145 œufs et plateaux de 30');

  await pickLevel(page, 'beginner');
  const lab = page.locator('[data-manipulation-level-panel=beginner] [data-egg-trays]');
  await lab.waitFor({ timeout: 15000 }).catch(() => {});
  // Le cadre : ses pas (±1) jusqu'à n = 4, puis il se pose de lui-même (relâchement).
  const frame = lab.locator('[data-et-frame]').first();
  for (let i = 0; i < 4; i += 1) { await lab.locator('[data-et-frame-step="1"][data-dir=more]').first().click().catch(() => {}); await page.waitForTimeout(120); }
  await page.waitForTimeout(1200);
  check((await frame.getAttribute('data-n').catch(() => null)) === '4', `مبتدئ : le cadre posé sur [4 ; 5] (${await frame.getAttribute('data-n').catch(() => null)})`);
  // Le remplissage : 4 boîtes (+12) puis 2 œufs (+1).
  for (let i = 0; i < 4; i += 1) { await lab.locator('[data-et-step=tray][data-dir=more]').first().click().catch(() => {}); await page.waitForTimeout(120); }
  for (let i = 0; i < 2; i += 1) { await lab.locator('[data-et-step=egg][data-dir=more]').first().click().catch(() => {}); await page.waitForTimeout(120); }
  await page.waitForTimeout(800);
  check((await lab.getAttribute('data-count').catch(() => null)) === '50', `مبتدئ : 50 œufs posés par les pas (${await lab.getAttribute('data-count').catch(() => null)})`);
  const marker = lab.locator('[data-et-marker]').first();
  check((await marker.getAttribute('data-q').catch(() => null)) === '4' && (await marker.getAttribute('data-r').catch(() => null)) === '2', 'مبتدئ : le repère à 4 + 2/12');
  check((await frame.getAttribute('data-state').catch(() => null)) === 'right', `مبتدئ : le cadre [4 ; 5] jugé juste (${await frame.getAttribute('data-state').catch(() => null)})`);
  await page.screenshot({ path: `${OUT}/lab-beginner-filled.png` });
  await ctx.close();
}

await browser.close();
console.log(failures.length ? `\n${failures.length} échec(s)` : '\n✅ 2AM qisma-iqlidiya-hasr — tout est vert');
process.exit(failures.length ? 1 : 0);
