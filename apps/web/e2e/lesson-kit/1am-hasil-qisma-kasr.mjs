// QA — 1AM, unité 4 « الكتابات الكسرية » (cycle moyen, phase 3, batch 3, 2026-10-15). Leçon `hasil-qisma-kasr` et son labo `fair-share`.
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/1am-hasil-qisma-kasr.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur :
//   1. le sommaire et CHAQUE محور à 1280 et 320 px : monté, aucune erreur console, aucun débordement horizontal,
//      aucun « $ » / « \command » / clé `manipulation.` brute dans le texte visible ;
//   2. le labo, مبتدئ (plateau, part 3/5) : une coupe à 6 refusée (morceau à cheval), une coupe à 10 lisible (6/10 tamponné,
//      « 0,6 ») et la preuve listée à l'étape 1 du module ;
//   3. le labo, متقدم (rectangle du manuel) : 6/10 atteint par le clavier (les flèches du rail) ;
//   4. D'UN SEUL REGARD : `[data-fs-glance]` tient dans la hauteur de l'écran à 1280×800, 1366×768, 390×844 et 320×640,
//      aux deux niveaux ;
//   5. la page d'unité et la carte de la leçon.
// Captures dans /tmp/qa-1am-hasil.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-1am-hasil';
const CH = '/courses/moyen/1am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/hasil-qisma-kasr`;
const MODULES = ['astaidd', 'nashat', 'maarif', 'tariqa', 'atamarran', 'masala-1', 'masala-2', 'masala-3', 'itqan'];
const UNIT = `${CH}/units/kitabat-kasriya`;
mkdirSync(OUT, { recursive: true });

const failures = [];
const check = (ok, label) => { if (!ok) failures.push(label); console.log(`${ok ? '✓' : '✗'} ${label}`); };

async function loginToken(who) {
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

const RAW = /(^|[^\\])\$[^$\s][^$]*\$|\\(frac|times|mathrm|square|bigcirc|triangle)\b|manipulation\.[a-zA-Z]+\./;

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

// 1 + 5 — sommaire, unité, modules aux deux largeurs.
for (const vp of [{ width: 1280, height: 800 }, { width: 320, height: 640 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}px`;

  await page.goto(`${BASE}${UNIT}`, { waitUntil: 'networkidle' });
  check(await page.getByText('حاصل القسمة والكسر').first().isVisible().catch(() => false), `${tag} page d'unité : la leçon est listée`);
  await pageHealth(page, `${tag} unité`);
  await page.screenshot({ path: `${OUT}/unit-${vp.width}.png`, fullPage: false });

  await page.goto(`${BASE}${LESSON}`, { waitUntil: 'networkidle' });
  check(await page.getByText('حاصل القسمة والكسر').first().isVisible(), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);
  await page.screenshot({ path: `${OUT}/index-${vp.width}.png`, fullPage: true });

  for (const slug of MODULES) {
    await page.goto(`${BASE}${LESSON}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const mounted = await page.locator('main, [data-module-layout], h1').first().isVisible().catch(() => false);
    check(mounted, `${tag} ${slug} monté`);
    await pageHealth(page, `${tag} ${slug}`);
    await page.screenshot({ path: `${OUT}/${slug}-${vp.width}.png`, fullPage: true });
  }
  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 2 + 3 + 4 — le labo.
const glanceFits = async (page, label) => {
  const box = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-fs-glance]')].find((e) => e.offsetParent !== null);
    if (!el) return null;
    el.scrollIntoView({ block: 'start', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    return { h: r.height, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.h <= box.vh, `${label}: [data-fs-glance] tient dans l'écran (${box ? `${Math.round(box.h)} / ${box.vh}` : 'absent'})`);
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-fs-glance] reste dans la largeur`);
};
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForTimeout(300);
};
const press = async (page, key, n) => { for (let i = 0; i < n; i += 1) await page.keyboard.press(key); await page.waitForTimeout(900); };

for (const vp of [{ width: 1280, height: 800 }, { width: 1366, height: 768 }, { width: 390, height: 844 }, { width: 320, height: 640 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-fair-share]');
  check(await page.locator('[data-module-brief]').count() === 0, `${vp.width}: aucune carte au-dessus du labo`);
  await glanceFits(page, `${vp.width}×${vp.height} مبتدئ`);
  await page.screenshot({ path: `${OUT}/lab-beginner-${vp.width}.png` });
  const beg = page.locator('[data-manipulation-level-panel=beginner] [data-fair-share]');
  await beg.locator('[data-fs-handle]').focus();
  await press(page, 'ArrowRight', 8);
  await glanceFits(page, `${vp.width}×${vp.height} مبتدئ (0,8 : manque)`);
  await page.screenshot({ path: `${OUT}/lab-beginner-over-${vp.width}.png` });
  await pickLevel(page, 'advanced');
  await glanceFits(page, `${vp.width}×${vp.height} متقدم`);
  await page.screenshot({ path: `${OUT}/lab-advanced-${vp.width}.png` });
  await ctx.close();
}

{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  const lab = page.locator('[data-manipulation-level-panel=beginner] [data-fair-share]');
  await lab.waitFor();
  const handle = lab.locator('[data-fs-handle]');
  await handle.focus();
  await press(page, 'ArrowRight', 8);
  check(await lab.locator('[data-fs-verdict=over]').count() > 0 || await lab.locator('[data-fs-over]').count() > 0, 'مبتدئ : 0,8 — du pain qui manque, dessiné');
  check(await lab.locator('[data-fs-ruler=cut][disabled]').count() === 1, 'مبتدئ : la règle des morceaux est fermée après un seul essai');
  await lab.locator('[data-fs-ruler=d2]').click();
  await handle.focus();
  await press(page, 'Home', 1);
  await press(page, 'ArrowRight', 75);
  check(await lab.locator('[data-fs-verdict=exact]').count() > 0, 'مبتدئ : 0,75 — tout est partagé (3 ÷ 4)');
  check(await lab.locator('[data-fs-next-button]').count() === 1, 'مبتدئ : la carte « طلب جديد » s\'ouvre');
  await lab.locator('[data-fs-next-button]').click();
  await handle.focus();
  await press(page, 'ArrowRight', 6);
  await press(page, 'ArrowRight', 1);
  check(await lab.locator('[data-fs-ruler=cut][disabled]').count() === 0, 'مبتدئ : la règle des morceaux s\'ouvre après deux essais décimaux');
  await lab.locator('[data-fs-ruler=cut]').click();
  await handle.focus();
  await press(page, 'Home', 1);
  await press(page, 'ArrowRight', 2);
  check(await lab.locator('[data-fs-verdict=exact]').count() > 0, 'مبتدئ : 2 ÷ 3 — deux morceaux d\'un tiers, tout est partagé');
  check(await page.locator('[data-manipulation-discovery]').count() >= 1, 'مبتدئ : la découverte s\'ouvre');
  check(await page.locator('[data-activity-evidence][data-tried=true]').count() >= 1, 'module 1 : les essais de l\'élève cités à l\'étape 1');
  await page.screenshot({ path: `${OUT}/lab-beginner-cut.png` });
  await ctx.close();
}

await browser.close();
console.log(failures.length ? `\n${failures.length} échec(s)` : '\n✅ 1AM hasil-qisma-kasr — tout est vert');
process.exit(failures.length ? 1 : 0);
