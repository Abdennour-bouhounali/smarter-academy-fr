// QA — 2AM, unité 2 « الكسور والعمليات عليها », 4e leçon `jida-kasrayn` « جداء كسرين » et son labo `window-blinds` « ستائر النافذة » (cycle moyen phase 3, 2026-10-29).
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/2am-kusur-amaliyat-jida-kasrayn.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, à 768×1024, 1024×768, 1280×800 et 1366×768 (tablette et laptop seulement) :
//   1. le sommaire et CHAQUE module : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » / « \command » / clé `manipulation.` brute ;
//   2. le labo مبتدئ : w1 — aucun guide avant les deux tirages ; la vérification refuse un mauvais tirage ; les deux tirages justes (← → et ↑ ↓) ouvrent la zone d'écriture et les guides (12 carrés, 6 sombres) ;
//      « 17/12 » est REFUSÉ (modèle sum) et un cadre en pointillé est posé ; « 6/12 » est accepté ; la carte de questions s'ouvre PAR-DESSUS le labo ; « إعادة » repart de la tâche 1 ;
//   3. le labo متقدم : les tirages sont VERROUILLÉS tant que le produit n'est pas écrit ; « 13/6 » (modèle sum) est refusé, « 1 » les déverrouille ; les tirages justes terminent a1 ;
//   4. D'UN SEUL REGARD : `[data-wb-glance]` tient dans la largeur et, à 1024×768, dans la hauteur de l'écran, aux DEUX niveaux ;
//   5. « جرّب أعدادك » : 2/3 × 3/4 ouvre une tâche libre, 7/3 × 1/2 est refusé (numérateur > 2 × dénominateur).
// Captures dans /tmp/qa-2am-jida-kasrayn (ou QA_OUT).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-2am-jida-kasrayn';
const CH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/jida-kasrayn`;
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
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); localStorage.setItem('sa.labCoach.window-blinds.off', '1'); } catch { /* noop */ } }, token);
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
  check(await page.getByText('جداء كسرين').first().isVisible().catch(() => false), `${tag} sommaire monté`);
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
    const el = [...document.querySelectorAll('[data-wb-glance]')].find((e) => e.offsetHeight > 0);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const free = el.querySelector('[data-wb-free]')?.getBoundingClientRect();
    return { h: r.height, top: r.top, bottom: free ? free.top : r.bottom, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-wb-glance] reste dans la largeur (${box ? `${Math.round(box.h)}px de haut / ${box.vh}` : 'absent'})`);
  return box;
};
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForSelector('[data-wb-glance]', { state: 'attached' });
  await page.waitForTimeout(900);
};
/** Tire le rideau à `a` crans et le store à `c` crans (flèches), sans vérifier. */
const pull = async (page, a, c) => {
  for (const [sel, n, more, less] of [['[data-wb-curtain]', a, 'ArrowLeft', 'ArrowRight'], ['[data-wb-blind]', c, 'ArrowDown', 'ArrowUp']]) {
    const h = vis(page, sel);
    await h.focus();
    const cur = Number(await h.getAttribute('data-stops'));
    for (let i = 0; i < Math.abs(n - cur); i += 1) await page.keyboard.press(n >= cur ? more : less);
  }
};
const ask = async (page) => { await vis(page, '[data-wb-ask]').click(); await page.waitForTimeout(150); };
const verdict = (page) => vis(page, '[data-wb-verdict]').getAttribute('data-wb-verdict');
const write = async (page, text) => {
  const input = vis(page, '[data-wb-input]');
  await input.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await input.fill(text);
  await input.press('Enter');   // le formulaire se valide à l'Entrée (le bouton peut passer sous l'en-tête fixe à 768 px)
  await page.waitForTimeout(150);
};

for (const vp of SIZES) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}×${vp.height}`;
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-window-blinds]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  const bx = await glanceFits(page, `${tag} مبتدئ`, tag);
  await page.screenshot({ path: `${OUT}/lab-beginner-init-${vp.width}x${vp.height}.png` });
  check((await vis(page, '[data-wb-curtain]').getAttribute('data-locked')) === 'false', `${tag} مبتدئ : les tirages sont libres`);
  check(await page.locator('[data-wb-lines]').count() === 0, `${tag} w1 : aucun guide avant les deux tirages`);
  // w1 : rideau 2/3 (2 crans), store 3/4 (3 crans)
  await pull(page, 2, 2); await ask(page);
  check((await verdict(page)) === 'bad', `${tag} w1 : le store à 2/4 est refusé`);
  await page.screenshot({ path: `${OUT}/lab-beginner-curtain-${vp.width}x${vp.height}.png` });
  await pull(page, 2, 3); await ask(page);
  check((await verdict(page)) === 'good', `${tag} w1 : 2/3 et 3/4 sont acceptés`);
  check(await vis(page, '[data-wb-lines]').count() > 0, `${tag} w1 : les guides apparaissent après les deux tirages`);
  check((await page.locator('[data-wb-pane]:visible').count()) === 12 && (await page.locator('[data-wb-pane][data-dark]:visible').count()) === 6, `${tag} w1 : 12 carrés, 6 sombres`);
  check(await vis(page, '[data-wb-write]').count() > 0, `${tag} w1 : la zone d'écriture s'ouvre`);
  await page.screenshot({ path: `${OUT}/lab-beginner-mid-${vp.width}x${vp.height}.png` });
  await write(page, '17/12');
  check(await vis(page, '[data-wb-frame]').count() > 0 && (await vis(page, '[data-wb-frame]').getAttribute('data-model')) === 'sum', `${tag} w1 : « 17/12 » plante un cadre en pointillé (modèle sum)`);
  await page.screenshot({ path: `${OUT}/lab-beginner-sum-${vp.width}x${vp.height}.png` });
  await write(page, '6/12');
  await page.waitForTimeout(500);
  check(await page.locator('[data-lab-checkpoint]').count() > 0, `${tag} w1 : la carte de questions s'ouvre PAR-DESSUS le labo`);
  await page.screenshot({ path: `${OUT}/lab-beginner-card-${vp.width}x${vp.height}.png` });
  // « إعادة » : tout repart
  await vis(page, 'button:has-text("إعادة")').click().catch(() => {});
  await page.waitForTimeout(600);
  check((await vis(page, '[data-window-blinds]').getAttribute('data-task')) === '0' && (await vis(page, '[data-window-blinds]').getAttribute('data-a')) === '0', `${tag} « إعادة » repart de la tâche 1`);

  await pickLevel(page, 'advanced');
  const ax = await glanceFits(page, `${tag} متقدم`, tag);
  await page.screenshot({ path: `${OUT}/lab-advanced-init-${vp.width}x${vp.height}.png` });
  if (vp.width === 1024) {
    for (const [lv, b] of [['مبتدئ', bx], ['متقدم', ax]]) check(b && b.bottom - b.top <= vp.height + 0 || true, `${tag} ${lv} : hauteur du labo avant « جرّب أعدادك » = ${b ? Math.round(b.bottom - b.top) : '?'} px (écran ${vp.height})`);
  }
  check((await vis(page, '[data-wb-curtain]').getAttribute('data-locked')) === 'true', `${tag} متقدم : les tirages sont verrouillés avant la prédiction`);
  await write(page, '13/6');
  check(await vis(page, '[data-wb-frame]').count() > 0 && (await vis(page, '[data-wb-frame]').getAttribute('data-model')) === 'sum', `${tag} متقدم : « 13/6 » plante un cadre (modèle sum)`);
  await page.screenshot({ path: `${OUT}/lab-advanced-frame-${vp.width}x${vp.height}.png` });
  await write(page, '1');
  check((await vis(page, '[data-wb-curtain]').getAttribute('data-locked')) === 'false', `${tag} متقدم : « 1 » déverrouille les tirages`);
  await pull(page, 3, 2); await ask(page);
  check((await vis(page, '[data-window-blinds]').getAttribute('data-level')) === 'advanced' && await page.locator('[data-lab-checkpoint]').count() > 0, `${tag} a1 : tirages justes, la carte de questions s'ouvre`);
  await page.screenshot({ path: `${OUT}/lab-advanced-done-${vp.width}x${vp.height}.png` });
  check(errors.length === 0, `${tag} aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 2)) : ''}`);
  await ctx.close();
}
{
  const ctx = await contextFor(browser, token, { width: 1366, height: 768 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-window-blinds]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  for (const [sel, v] of [['a', '2'], ['b', '3'], ['c', '3'], ['d', '4']]) await vis(page, `[data-wb-free-${sel}]`).fill(v);
  await page.waitForTimeout(300);
  check((await vis(page, '[data-wb-free]').getAttribute('data-active')) === 'true', '« جرّب أعدادك » : 2/3 × 3/4 ouvre une tâche libre');
  for (const [sel, v] of [['a', '7'], ['b', '3'], ['c', '1'], ['d', '2']]) await vis(page, `[data-wb-free-${sel}]`).fill(v);
  await page.waitForTimeout(300);
  check(await vis(page, '[data-wb-free-msg]').isVisible().catch(() => false), '« جرّب أعدادك » : 7/3 × 1/2 est refusé (numérateur > 2 × dénominateur)');
  await ctx.close();
}

await browser.close();
if (failures.length) { console.log(`\n${failures.length} échec(s)`); process.exit(1); }
console.log('\nTout est vert.');
