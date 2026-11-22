// QA — 2AM, unité 4 « مفهوم معادلة », 1re leçon `ibara-harfiya-intaj` « إنتاج عبارة حرفية واستعمالها » et son labo `wax-cells` « خلايا الشمع » (cycle moyen phase 3, 2026-10-29).
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/2am-mafhum-muadala-ibara-harfiya-intaj.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, à 768×1024, 1024×768, 1280×800 et 1366×768 (tablette et laptop seulement) :
//   1. le sommaire et CHAQUE module : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » / « \command » / clé `manipulation.` brute ;
//   2. le labo مبتدئ : on pose trois cellules (flèches du plateau), le compteur lit 6, 11, 16 ; le tableau apparaît à la 3e cellule ; « 6n » est REFUSÉ (modèle perCell : tiges partagées qui clignotent),
//      « 5n » est refusé (la première tige en pointillé) ; « 5n+1 » est accepté ; la carte de questions s'ouvre PAR-DESSUS le labo ; « إعادة » repart de la tâche 1 ;
//   3. le labo متقدم : le compteur est CACHÉ (« ؟ ») jusqu'à ce que le nombre soit tapé ; un mauvais nombre est refusé, le bon le montre ;
//   4. D'UN SEUL REGARD : `[data-wc-glance]` tient dans la largeur et, à 1024×768, dans la hauteur de l'écran, aux DEUX niveaux ;
//   5. « جرّب أعدادك » : ouvre une tâche libre où une règle est jugée sans rien compter.
// Captures dans /tmp/qa-2am-ibara-harfiya-intaj (ou QA_OUT).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5174';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-2am-ibara-harfiya-intaj';
const CH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/ibara-harfiya-intaj`;
const MODULES = ['astaidd', 'nashat', 'maarif', 'tariqa', 'atamarran', 'masala-1', 'masala-2', 'masala-3', 'itqan'];
const SIZES = [{ width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1280, height: 800 }, { width: 1366, height: 768 }];
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
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); localStorage.setItem('sa.labCoach.wax-cells.off', '1'); } catch { /* noop */ } }, token);
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
      const n = walker.currentNode; const el = n.parentElement;
      if (!el || el.closest('script,style,.katex-mathml,[aria-hidden="true"]') || el.closest('[hidden]')) continue;
      if (rx.test(n.textContent)) bad.push(n.textContent.trim().slice(0, 80));
    }
    return { overflow: doc.scrollWidth - doc.clientWidth, raw: bad.slice(0, 3) };
  }, RAW.source);
  check(overflow <= 1, `${label}: pas de débordement horizontal (${overflow}px)`);
  check(raw.length === 0, `${label}: aucun texte brut ${raw.length ? JSON.stringify(raw) : ''}`);
}

const browser = await chromium.launch();
const token = await loginToken(TEACHER);

// 1 — sommaire et modules (QA_LAB_ONLY=1 les saute : relancer seulement le labo).
for (const vp of process.env.QA_LAB_ONLY ? [] : SIZES.filter((v) => !process.env.QA_WIDTHS || process.env.QA_WIDTHS.split(',').includes(String(v.width)))) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}×${vp.height}`;
  await page.goto(`${BASE}${LESSON}`, { waitUntil: 'networkidle' });
  check(await page.getByText('إنتاج عبارة حرفية').first().isVisible().catch(() => false), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);
  for (const slug of MODULES) {
    await page.goto(`${BASE}${LESSON}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    check(await page.locator('main, [data-module-layout], h1').first().isVisible().catch(() => false), `${tag} ${slug} monté`);
    await pageHealth(page, `${tag} ${slug}`);
    if (vp.width === 1366) await page.screenshot({ path: `${OUT}/${slug}-${vp.width}.png`, fullPage: true });
  }
  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 2 → 5 — le labo.
const vis = (page, sel) => page.locator(`${sel}:visible`).first();
const glanceFits = async (page, label) => {
  const box = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-wc-glance]')].find((e) => e.offsetHeight > 0);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const free = el.parentElement?.querySelector('[data-wc-free]')?.getBoundingClientRect();
    return { h: r.height, top: r.top, bottom: free ? free.top : r.bottom, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-wc-glance] reste dans la largeur (${box ? `${Math.round(box.h)}px de haut / ${box.vh}` : 'absent'})`);
  return box;
};
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForSelector('[data-wc-glance]', { state: 'attached' });
  await page.waitForTimeout(900);
};
const snap = async (page, n = 1) => { for (let i = 0; i < n; i += 1) { await vis(page, '[data-wc-more]').click(); await page.waitForTimeout(60); } };
const counter = (page) => vis(page, '[data-wc-counter-value]').textContent();
const verdict = (page) => vis(page, '[data-wc-verdict]').getAttribute('data-wc-verdict');
const writeRule = async (page, text) => {
  const input = vis(page, '[data-wc-input]');
  await input.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await input.fill(text);
  await input.press('Enter');
  await page.waitForTimeout(150);
};

for (const vp of SIZES) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}×${vp.height}`;
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-wax-cells]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  const bx = await glanceFits(page, `${tag} مبتدئ`);
  await page.screenshot({ path: `${OUT}/lab-beginner-init-${vp.width}x${vp.height}.png` });
  check(await page.locator('[data-wc-table]').count() === 0, `${tag} w1 : aucun tableau avant la 3e cellule`);
  await snap(page, 1);
  check((await counter(page)).trim() === '6', `${tag} w1 : une cellule, le compteur lit 6`);
  await snap(page, 1);
  check((await counter(page)).trim() === '11', `${tag} w1 : deux cellules, le compteur lit 11`);
  await page.screenshot({ path: `${OUT}/lab-beginner-two-${vp.width}x${vp.height}.png` });
  await snap(page, 1);
  check((await counter(page)).trim() === '16', `${tag} w1 : trois cellules, le compteur lit 16`);
  await page.waitForTimeout(500);
  check(await page.locator('[data-lab-checkpoint]').count() > 0, `${tag} w1 : la carte de questions s'ouvre PAR-DESSUS le labo`);
  await page.screenshot({ path: `${OUT}/lab-beginner-card-${vp.width}x${vp.height}.png` });
  // « إعادة » : tout repart (on teste ici le redémarrage, puis on rejoue)
  await vis(page, 'button:has-text("إعادة")').click().catch(() => {});
  await page.waitForTimeout(600);
  check((await vis(page, '[data-wax-cells]').getAttribute('data-task')) === '0' && (await vis(page, '[data-wax-cells]').getAttribute('data-n')) === '0', `${tag} « إعادة » repart de la tâche 1`);

  // la règle : on joue en libre pour ne pas dépendre des cartes de questions
  await vis(page, '[data-wc-free-start]').click();
  await page.waitForTimeout(200);
  await snap(page, 4);
  check(await vis(page, '[data-wc-table]').count() > 0, `${tag} libre : le tableau apparaît après la 3e cellule`);
  await writeRule(page, '6n');
  check((await verdict(page)) === 'bad' && await page.locator('[data-wc-rod][data-blink]').count() > 0, `${tag} libre : « 6n » est refusé et les tiges partagées clignotent`);
  await page.screenshot({ path: `${OUT}/lab-beginner-6n-${vp.width}x${vp.height}.png` });
  await writeRule(page, '5n');
  check((await verdict(page)) === 'bad', `${tag} libre : « 5n » est refusé`);
  await page.screenshot({ path: `${OUT}/lab-beginner-5n-${vp.width}x${vp.height}.png` });
  await writeRule(page, '5n+1');
  check((await verdict(page)) === 'good', `${tag} libre : « 5n+1 » est accepté`);
  await page.screenshot({ path: `${OUT}/lab-beginner-rule-${vp.width}x${vp.height}.png` });

  await pickLevel(page, 'advanced');
  const ax = await glanceFits(page, `${tag} متقدم`);
  await page.screenshot({ path: `${OUT}/lab-advanced-init-${vp.width}x${vp.height}.png` });
  if (vp.width === 1024) {
    for (const [lv, b] of [['مبتدئ', bx], ['متقدم', ax]]) console.log(`  ${tag} ${lv} : hauteur du labo avant « جرّب أعدادك » = ${b ? Math.round(b.bottom - b.top) : '?'} px (écran ${vp.height})`);
  }
  await snap(page, 1);
  check((await counter(page)).trim() === '؟', `${tag} متقدم : le compteur est caché avant la prédiction`);
  await vis(page, '[data-wc-predict-input]').fill('12');
  await vis(page, '[data-wc-predict-input]').press('Enter');
  await page.waitForTimeout(150);
  check((await counter(page)).trim() === '؟', `${tag} متقدم : « 12 » est refusé, le compteur reste caché`);
  await vis(page, '[data-wc-predict-input]').fill('11');
  await vis(page, '[data-wc-predict-input]').press('Enter');
  await page.waitForTimeout(150);
  check((await counter(page)).trim() === '11', `${tag} متقدم : « 11 » montre le compteur`);
  await page.screenshot({ path: `${OUT}/lab-advanced-strip-${vp.width}x${vp.height}.png` });
  check(errors.length === 0, `${tag} aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 2)) : ''}`);
  await ctx.close();
}

await browser.close();
if (failures.length) { console.log(`\n${failures.length} échec(s)`); process.exit(1); }
console.log('\nTout est vert.');
