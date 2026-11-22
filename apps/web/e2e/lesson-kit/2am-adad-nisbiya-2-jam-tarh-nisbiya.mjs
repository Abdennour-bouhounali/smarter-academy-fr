// QA — 2AM, unité 3 « الأعداد النسبية », 1re leçon `jam-tarh-nisbiya` « جمع وطرح عددين نسبيين » et son labo `balloon-ballast` « مسطرة الكورنيش » (cycle moyen phase 3, 2026-10-29).
//
//   KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/2am-adad-nisbiya-2-jam-tarh-nisbiya.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, à 768×1024, 1024×768, 1280×800 et 1366×768 (tablette et laptop seulement) :
//   1. le sommaire et CHAQUE module : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » / « \command » / clé `manipulation.` brute ;
//   2. le labo مبتدئ : répondre avant d'exécuter la carte est refusé (journal rouge) ; attacher quatre sacs (t1) verrouille quatre paires ; « 10 » (somme des distances) est refusé et un montgolfière fantôme est posé ;
//      « 2 » ouvre la carte de questions PAR-DESSUS le labo ; « إعادة » repart de la tâche 1 ;
//   3. le labo متقدم : l'altitude est écrite AVANT d'exécuter (« −10 » refusé + fantôme, « −4 » ouvre les gestes), jeter trois sacs termine a1 ;
//   4. D'UN SEUL REGARD : `[data-bb-glance]` reste dans la largeur, aux DEUX niveaux ;
//   5. « جرّب أعدادك » : « −5 − 3 » ouvre la carte libre.
// Captures dans /tmp/qa-2am-jam-tarh-nisbiya (ou QA_OUT).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-2am-jam-tarh-nisbiya';
const CH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/jam-tarh-nisbiya`;
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
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); localStorage.setItem('sa.labCoach.balloon-ballast.off', '1'); } catch { /* noop */ } }, token);
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
  check(await page.getByText('جمع وطرح عددين نسبيين').first().isVisible().catch(() => false), `${tag} sommaire monté`);
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
    const el = [...document.querySelectorAll('[data-bb-glance]')].find((e) => e.offsetHeight > 0);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { h: r.height, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-bb-glance] reste dans la largeur (${box ? Math.round(box.h) : 'absent'} px de haut)`);
  return box;
};
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForSelector('[data-bb-glance]', { state: 'attached' });
  await page.waitForTimeout(900);
};
const type = async (page, v) => { const i = vis(page, '[data-bb-answer]'); await i.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' })); await i.fill(v); await i.press('Enter'); await page.waitForTimeout(200); };
const click = async (page, sel, n = 1) => { for (let i = 0; i < n; i += 1) { await vis(page, sel).click(); await page.waitForTimeout(80); } };

for (const vp of SIZES.filter((v) => !process.env.QA_WIDTHS || process.env.QA_WIDTHS.split(',').includes(String(v.width)))) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}×${vp.height}`;
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-balloon-ballast]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  await glanceFits(page, `${tag} مبتدئ`);
  await page.screenshot({ path: `${OUT}/lab-beginner-init-${vp.width}x${vp.height}.png` });
  await type(page, '2');
  check((await vis(page, '[data-bb-verdict]').getAttribute('data-bb-verdict')) === 'wrong' && (await vis(page, '[data-bb-log]').getAttribute('data-wrong')) === 'true', `${tag} t1 : répondre avant d'exécuter la carte est refusé (journal rouge)`);
  await click(page, '[data-bb-tie="bag"]', 4);
  check(await page.locator('[data-bb-bag][data-paired="true"]:visible').count() === 4, `${tag} t1 : quatre paires verrouillées`);
  await page.screenshot({ path: `${OUT}/lab-beginner-pairs-${vp.width}x${vp.height}.png` });
  await type(page, '10');
  await page.waitForSelector('[data-bb-ghost]', { state: 'attached', timeout: 3000 }).catch(() => {});
  check(await page.locator('[data-bb-ghost][data-model="addDist"]').count() > 0, `${tag} t1 : « 10 » est refusé (addDist) et un montgolfière fantôme est posé`);
  await page.screenshot({ path: `${OUT}/lab-beginner-ghost-${vp.width}x${vp.height}.png` });
  await type(page, '2');
  await page.waitForTimeout(600);
  check(await page.locator('[data-lab-checkpoint]').count() > 0, `${tag} t1 : la carte de questions s'ouvre PAR-DESSUS le labo`);
  await page.screenshot({ path: `${OUT}/lab-beginner-card-${vp.width}x${vp.height}.png` });
  await vis(page, 'button:has-text("إعادة")').click().catch(() => {});
  await page.waitForTimeout(600);
  check((await vis(page, '[data-balloon-ballast]').getAttribute('data-task')) === '0' && (await vis(page, '[data-balloon-ballast]').getAttribute('data-altitude')) === '6', `${tag} « إعادة » repart de la tâche 1`);

  await pickLevel(page, 'advanced');
  await glanceFits(page, `${tag} متقدم`);
  await page.screenshot({ path: `${OUT}/lab-advanced-init-${vp.width}x${vp.height}.png` });
  check(await vis(page, '[data-bb-tie="bag"]').isDisabled(), `${tag} متقدم : les gestes sont fermés avant d'écrire la prédiction`);
  await type(page, '-10');
  check(await page.locator('[data-bb-ghost][data-model="subNoFlip"]').count() > 0, `${tag} a1 : « −10 » est refusé (subNoFlip) avec un fantôme`);
  await page.screenshot({ path: `${OUT}/lab-advanced-ghost-${vp.width}x${vp.height}.png` });
  await type(page, '-4');
  check(!(await vis(page, '[data-bb-throw="bag"]').isDisabled()), `${tag} a1 : la bonne prédiction ouvre les gestes`);
  await click(page, '[data-bb-throw="bag"]', 3);
  await page.screenshot({ path: `${OUT}/lab-advanced-done-${vp.width}x${vp.height}.png` });
  await page.waitForTimeout(900);
  check(await page.locator('[data-lab-checkpoint]').count() > 0, `${tag} a1 : jeter trois sacs termine la tâche et ouvre la carte de questions`);
  check(errors.length === 0, `${tag} aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 2)) : ''}`);
  await ctx.close();
}
{
  const ctx = await contextFor(browser, token, { width: 1366, height: 768 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-balloon-ballast]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  await vis(page, '[data-bb-free-a]').fill('-5');
  await vis(page, '[data-bb-free-op]').click();
  await vis(page, '[data-bb-free-b]').fill('3');
  await page.waitForTimeout(300);
  check((await vis(page, '[data-bb-free]').getAttribute('data-active')) === 'true', '« جرّب أعدادك » : « −5 − 3 » ouvre la carte libre');
  await ctx.close();
}

await browser.close();
if (failures.length) { console.log(`\n${failures.length} échec(s)`); process.exit(1); }
console.log('\nTout est vert.');
