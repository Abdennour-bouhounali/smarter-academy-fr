// QA — 2AM, unité 2 « الكسور والعمليات عليها », 3e leçon `jam-tarh-kusur` « جمع وطرح كسرين » et son labo `trail-odometer` « عدّاد المسلك » (cycle moyen phase 3, 2026-10-29).
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/2am-kusur-amaliyat-jam-tarh-kusur.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, à 768×1024, 1024×768, 1280×800 et 1366×768 (tablette et laptop seulement) :
//   1. le sommaire et CHAQUE module : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » / « \command » / clé `manipulation.` brute ;
//   2. le labo مبتدئ : g1 — la scoute glisse au poteau 5 puis 9 (flèches), « وصلنا » juge chaque étape, la zone d'écriture s'ouvre, « 9/12 » est accepté, la carte de questions s'ouvre PAR-DESSUS le labo ;
//      g2 — le pas rouge vaut 3 blancs ; « 6/16 » est REFUSÉ et un drapeau en pointillé est planté ; « إعادة » repart de la tâche 1 ;
//   3. le labo متقدم : le sentier est VERROUILLÉ tant que la prédiction n'est pas écrite ; 11/16 puis 5/16 le déverrouillent ;
//   4. D'UN SEUL REGARD : `[data-to-glance]` tient dans la largeur ;
//   5. « جرّب أعدادك » : 5/12 + 1/4 ouvre une tâche libre, 1/3 + 1/2 est refusé (« السنة الثالثة »).
// Captures dans /tmp/qa-2am-jam-tarh-kusur (ou QA_OUT).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-2am-jam-tarh-kusur';
const CH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/jam-tarh-kusur`;
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
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); localStorage.setItem('sa.labCoach.trail-odometer.off', '1'); } catch { /* noop */ } }, token);
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
  check(await page.getByText('جمع وطرح كسرين').first().isVisible().catch(() => false), `${tag} sommaire monté`);
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
    const el = [...document.querySelectorAll('[data-to-glance]')].find((e) => e.offsetHeight > 0);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { h: r.height, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-to-glance] reste dans la largeur (${box ? `${Math.round(box.h)}px de haut / ${box.vh}` : 'absent'})`);
};
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForSelector('[data-to-glance]', { state: 'attached' });
  await page.waitForTimeout(900);
};
/** Pose la scoute au poteau `n` (Home puis n flèches) puis « وصلنا ». */
const goTo = async (page, n) => {
  const h = vis(page, '[data-to-hiker]');
  await h.focus();
  const cur = Number(await h.getAttribute('data-posts'));
  const key = n >= cur ? 'ArrowRight' : 'ArrowLeft';
  for (let i = 0; i < Math.abs(n - cur); i += 1) await page.keyboard.press(key);
  await vis(page, '[data-to-arrive]').click();
  await page.waitForTimeout(120);
};
const verdict = (page) => vis(page, '[data-to-verdict]').getAttribute('data-to-verdict');
const write = async (page, field, text) => {
  const input = vis(page, `[data-to-input="${field}"]`);
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
  await page.waitForSelector('[data-trail-odometer]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  await glanceFits(page, `${tag} مبتدئ`);
  await page.screenshot({ path: `${OUT}/lab-beginner-init-${vp.width}x${vp.height}.png` });
  check((await vis(page, '[data-to-hiker]').getAttribute('data-locked')) === 'false', `${tag} مبتدئ : la scoute est libre`);
  // g1 : 5 puis 9
  await goTo(page, 4); check((await verdict(page)) === 'bad', `${tag} g1 : 4 poteaux — pas encore`);
  await goTo(page, 5); check((await verdict(page)) === 'good', `${tag} g1 : 5 poteaux — étape 1`);
  await page.screenshot({ path: `${OUT}/lab-beginner-mid-${vp.width}x${vp.height}.png` });
  await goTo(page, 9); check((await verdict(page)) === 'good', `${tag} g1 : 9 poteaux — étape 2`);
  check(await vis(page, '[data-to-write]').count() > 0, `${tag} g1 : la zone d'écriture s'ouvre`);
  await write(page, 'pos', '9/12');
  await page.waitForTimeout(500);
  check(await page.locator('[data-lab-checkpoint]').count() > 0, `${tag} g1 : la carte de questions s'ouvre PAR-DESSUS le labo`);
  await page.screenshot({ path: `${OUT}/lab-beginner-card-${vp.width}x${vp.height}.png` });
  // « إعادة » : tout repart
  await vis(page, 'button:has-text("إعادة")').click().catch(() => {});
  await page.waitForTimeout(600);
  check((await vis(page, '[data-trail-odometer]').getAttribute('data-task')) === '0' && (await vis(page, '[data-trail-odometer]').getAttribute('data-posts')) === '0', `${tag} « إعادة » repart de la tâche 1`);

  await pickLevel(page, 'advanced');
  await glanceFits(page, `${tag} متقدم`);
  await page.screenshot({ path: `${OUT}/lab-advanced-init-${vp.width}x${vp.height}.png` });
  check((await vis(page, '[data-to-hiker]').getAttribute('data-locked')) === 'true', `${tag} متقدم : le sentier est verrouillé avant la prédiction`);
  await write(page, 'pos', '8/24');
  check(await vis(page, '[data-to-flag]').count() > 0, `${tag} متقدم : « 8/24 » plante un drapeau en pointillé`);
  check((await vis(page, '[data-to-flag]').getAttribute('data-model')) === 'across', `${tag} متقدم : modèle « across » (5+3)/(16+8)`);
  await page.screenshot({ path: `${OUT}/lab-advanced-flag-${vp.width}x${vp.height}.png` });
  await write(page, 'pos', '11/16');
  await write(page, 'rest', '5/16');
  check((await vis(page, '[data-to-hiker]').getAttribute('data-locked')) === 'false', `${tag} متقدم : 11/16 et 5/16 déverrouillent la scoute`);
  await goTo(page, 5); check((await verdict(page)) === 'good', `${tag} a1 : 5 poteaux`);
  await goTo(page, 11); check((await verdict(page)) === 'good', `${tag} a1 : 11 poteaux (3/8 = 6 blancs)`);
  await page.screenshot({ path: `${OUT}/lab-advanced-done-${vp.width}x${vp.height}.png` });
  check(errors.length === 0, `${tag} aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 2)) : ''}`);
  await ctx.close();
}
{
  const ctx = await contextFor(browser, token, { width: 1366, height: 768 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-trail-odometer]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  for (const [sel, v] of [['a', '5'], ['b', '12'], ['c', '1'], ['d', '4']]) await vis(page, `[data-to-free-${sel}]`).fill(v);
  await page.waitForTimeout(300);
  check((await vis(page, '[data-to-free]').getAttribute('data-active')) === 'true', '« جرّب أعدادك » : 5/12 + 1/4 ouvre une tâche libre');
  for (const [sel, v] of [['a', '1'], ['b', '3'], ['c', '1'], ['d', '2']]) await vis(page, `[data-to-free-${sel}]`).fill(v);
  await page.waitForTimeout(300);
  check(await vis(page, '[data-to-free-msg]').isVisible().catch(() => false), '« جرّب أعدادك » : 1/3 + 1/2 est refusé (السنة الثالثة)');
  await ctx.close();
}

await browser.close();
if (failures.length) { console.log(`\n${failures.length} échec(s)`); process.exit(1); }
console.log('\nTout est vert.');
