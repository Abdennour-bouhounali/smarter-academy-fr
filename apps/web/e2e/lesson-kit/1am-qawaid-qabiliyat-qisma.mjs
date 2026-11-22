// QA — 1AM, unité 3 « الضرب والقسمة » (cycle moyen, phase 3, 2026-10-14). Leçon `qawaid-qabiliyat-qisma` et son labo `digit-cards`.
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/1am-qawaid-qabiliyat-qisma.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur :
//   1. le sommaire et CHAQUE محور à 1280 et 320 px : monté, aucune erreur console, aucun débordement horizontal,
//      aucun « $ » / « \command » / clé `manipulation.` brute dans le texte visible ;
//   2. le labo, مبتدئ (tableau 0..48, 7 colonnes) : un multiple de 2 colorié, un non-multiple refusé (le reste écrit) ;
//   3. le labo, متقدم (cartes 4, 5, 9, 3) : 9534 posé, la lampe 2 ouverte ;
//   4. D'UN SEUL REGARD : `[data-dc-glance]` tient dans la hauteur de l'écran à 1280×800, 1366×768, 390×844 et 320×640,
//      aux deux niveaux ;
//   5. la page d'unité et la carte de la leçon.
// Captures dans /tmp/qa-1am-qawaid.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-1am-qawaid';
const CH = '/courses/moyen/1am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/qawaid-qabiliyat-qisma`;
const MODULES = ['astaidd', 'nashat', 'maarif', 'tariqa', 'atamarran', 'sana-kabisa', 'masala-1', 'masala-2', 'masala-3', 'itqan'];
const UNIT = `${CH}/units/darb-qisma-ashriya`;
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
  check(await page.getByText('قواعد قابلية القسمة').first().isVisible().catch(() => false), `${tag} page d'unité : la leçon est listée`);
  await pageHealth(page, `${tag} unité`);
  await page.screenshot({ path: `${OUT}/unit-${vp.width}.png`, fullPage: false });

  await page.goto(`${BASE}${LESSON}`, { waitUntil: 'networkidle' });
  check(await page.getByText('قواعد قابلية القسمة').first().isVisible(), `${tag} sommaire monté`);
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
    const el = [...document.querySelectorAll('[data-dc-glance]')].find((e) => e.offsetParent !== null);
    if (!el) return null;
    el.scrollIntoView({ block: 'start', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    return { h: r.height, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.h <= box.vh, `${label}: [data-dc-glance] tient dans l'écran (${box ? `${Math.round(box.h)} / ${box.vh}` : 'absent'})`);
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-dc-glance] reste dans la largeur`);
};
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForTimeout(300);
};

for (const vp of [{ width: 1280, height: 800 }, { width: 1366, height: 768 }, { width: 390, height: 844 }, { width: 320, height: 640 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-digit-cards]');
  await glanceFits(page, `${vp.width}×${vp.height} مبتدئ`);
  await page.screenshot({ path: `${OUT}/lab-beginner-${vp.width}.png` });
  await pickLevel(page, 'advanced');
  await glanceFits(page, `${vp.width}×${vp.height} متقدم`);
  await page.screenshot({ path: `${OUT}/lab-advanced-${vp.width}.png` });
  await ctx.close();
}

{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  const lab = page.locator('[data-manipulation-level-panel=beginner] [data-digit-cards]');
  await lab.waitFor();
  await lab.locator('[data-dc-colouring="2"]').click();
  await page.waitForTimeout(200);
  await lab.locator('[data-dc-cell="14"]').click();
  await page.waitForTimeout(300);
  check(((await lab.locator('[data-dc-cell="14"]').getAttribute('data-colour')) || '').trim().length > 0, 'مبتدئ : 14 colorié pour 2');
  await lab.locator('[data-dc-cell="15"]').click();
  await page.waitForTimeout(300);
  check(await lab.locator('[data-dc-refused=remainder]').count() > 0, 'مبتدئ : 15 refusé pour 2, le reste écrit');
  check(await page.locator('[data-evidence="grid-2"][data-tried=true]').count() === 1, 'module 1 : la case 14 est listée à l\'étape 1');
  await page.screenshot({ path: `${OUT}/lab-beginner-trials.png` });

  await pickLevel(page, 'advanced');
  const adv = page.locator('[data-manipulation-level-panel=advanced] [data-digit-cards]');
  await adv.waitFor();
  for (const [i, dgt] of [[0, 9], [1, 5], [2, 3], [3, 4]]) {
    await adv.locator(`[data-dc-card="${dgt}"]`).click();
    await adv.locator(`[data-dc-slot="${i}"]`).click();
    await page.waitForTimeout(150);
  }
  const digits = await adv.locator('[data-dc-slot]').evaluateAll((els) => els.map((e) => e.getAttribute('data-digit')).join(''));
  check(digits === '9534', `متقدم : 9534 posé par tap-tap (${digits})`);
  await adv.locator('[data-dc-claim="2"][data-claim=yes]').first().click().catch(() => {});
  await page.waitForTimeout(300);
  const lamp = await adv.locator('[data-dc-lamp="2"]').getAttribute('data-state');
  check(lamp === 'yes', `متقدم : la lampe 2 s'ouvre « نعم » (${lamp})`);
  await page.screenshot({ path: `${OUT}/lab-advanced-9534.png` });
  await ctx.close();
}

await browser.close();
console.log(failures.length ? `\n${failures.length} échec(s)` : '\n✅ 1AM qawaid-qabiliyat-qisma — tout est vert');
process.exit(failures.length ? 1 : 0);
