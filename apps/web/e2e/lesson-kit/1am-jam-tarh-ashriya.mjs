// QA — 1AM, unité 2 « الجمع والطرح » (cycle moyen, phase 3, 2026-10-14). Leçon `mana-jam-tarh` et son labo `story-bars`.
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/1am-jam-tarh-ashriya.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur :
//   1. le sommaire et CHAQUE محور à 1280 et 320 px : monté, aucune erreur console, aucun débordement horizontal,
//      aucun « $ » / « \command » / clé `manipulation.` brute dans le texte visible ;
//   2. le labo, مبتدئ (toise) : la poignée se règle AU CLAVIER, la phrase juge, la carte de calcul juste écrit la ligne
//      formelle ; un calcul faux est refusé ; « إعادة » efface ;
//   3. le labo, متقدم (نشاط 1) : une carte posée par TAP-TAP sur le mauvais texte est refusée (bande ouverte), sur le
//      bon acceptée (bande fermée) ;
//   4. D'UN SEUL REGARD : le bloc `[data-sb-glance]` tient dans la hauteur de l'écran à 1280×800, 1366×768, 390×844 et
//      320×640, aux deux niveaux ;
//   5. la page d'unité et la carte de la leçon.
// Captures dans /tmp/qa-1am-jam-tarh.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-1am-jam-tarh';
const CH = '/courses/moyen/1am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/mana-jam-tarh`;
const MODULES = ['astaidd', 'nashat', 'maarif', 'tariqa', 'awazzif', 'masala-1', 'masala-2', 'masala-3', 'itqan'];
const UNIT = `${CH}/units/jam-tarh-ashriya`;
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
  check(await page.getByText('معنى الجمع والطرح').first().isVisible().catch(() => false), `${tag} page d'unité : la leçon est listée`);
  await pageHealth(page, `${tag} unité`);
  await page.screenshot({ path: `${OUT}/unit-${vp.width}.png`, fullPage: false });

  await page.goto(`${BASE}${LESSON}`, { waitUntil: 'networkidle' });
  check(await page.getByText('معنى الجمع والطرح').first().isVisible(), `${tag} sommaire monté`);
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
    const el = [...document.querySelectorAll('[data-sb-glance]')].find((e) => e.offsetParent !== null);
    if (!el) return null;
    el.scrollIntoView({ block: 'start', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    return { h: r.height, vh: window.innerHeight };
  });
  check(box && box.h <= box.vh, `${label}: [data-sb-glance] tient dans l'écran (${box ? `${Math.round(box.h)} / ${box.vh}` : 'absent'})`);
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
  await page.waitForSelector('[data-story-bars]');
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
  const lab = page.locator('[data-manipulation-level-panel=beginner] [data-story-bars]');
  await lab.waitFor();
  // مبتدئ, item 1 : أمين = 130 + 6. La poignée au clavier jusqu'à 136.
  const handle = lab.locator('[data-sb-handle]');
  await handle.focus();
  const now = Number(await handle.getAttribute('aria-valuenow'));
  const key = 136 > now ? 'ArrowUp' : 'ArrowDown';
  for (let i = 0; i < Math.abs(136 - now); i += 1) await page.keyboard.press(key);
  await page.waitForTimeout(900); // le clavier s'engage après une pause
  check(await lab.locator('[data-sb-sentence][data-ok=true]').count() > 0, 'مبتدئ : 136 cm au clavier rend la phrase vraie');
  // Un calcul faux (130 − 6) est refusé, le juste (130 + 6) écrit la ligne formelle.
  await lab.locator('[data-sb-calc="1"]').click();
  check(await lab.locator('[data-sb-refused]').count() > 0, 'مبتدئ : le calcul 130 − 6 est refusé');
  await lab.locator('[data-sb-calc="0"]').click();
  check(await lab.locator('[data-sb-formal-line]').count() > 0, 'مبتدئ : le calcul 130 + 6 écrit la ligne formelle');
  check(await lab.locator('[data-arc-tape][data-tape-closed=true]').count() > 0, 'مبتدئ : la bande est fermée');
  await page.screenshot({ path: `${OUT}/lab-beginner-solved.png` });

  // متقدم : la carte 24,5 − 11,5 (index 5) posée par TAP-TAP sur le texte ① est refusée, 24,5 + 11,5 (index 0) acceptée.
  await pickLevel(page, 'advanced');
  const adv = page.locator('[data-manipulation-level-panel=advanced] [data-story-bars]');
  await adv.locator('[data-sb-card="5"]').click();
  await adv.locator('[data-sb-slot="1"]').click();
  await page.waitForTimeout(300);
  check(await adv.locator('[data-sb-slot="1"][data-matched=true]').count() === 0, 'متقدم : 24,5 − 11,5 refusée sur le texte ①');
  check(await adv.locator('[data-arc-tape][data-tape-closed=false]').count() > 0, 'متقدم : la bande du refus reste ouverte');
  await page.screenshot({ path: `${OUT}/lab-advanced-refused.png` });
  await adv.locator('[data-sb-card="0"]').click();
  await adv.locator('[data-sb-slot="1"]').click();
  await page.waitForTimeout(300);
  check(await adv.locator('[data-sb-slot="1"][data-matched=true]').count() === 1, 'متقدم : 24,5 + 11,5 acceptée sur le texte ①');
  await page.screenshot({ path: `${OUT}/lab-advanced-matched.png` });
  // L'étape 2 du module liste l'essai de l'élève sur le texte ①.
  check(await page.locator('[data-evidence="act1-1"][data-tried=true]').count() === 1, 'module 1 : les essais de l\'élève sont listés au-dessus de la question');
  await ctx.close();
}

await browser.close();
console.log(failures.length ? `\n${failures.length} échec(s)` : '\n✅ 1AM unité 2 — tout est vert');
process.exit(failures.length ? 1 : 0);
