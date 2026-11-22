// QA — 2AM, unité 2 « الكسور والعمليات عليها », 2e leçon `kasr-hasil-qisma` « الكسر: نسبة وحاصل قسمة وقيم مقرّبة » et son labo `mooring-lines` « حبال المرسى » (cycle moyen phase 3, 2026-10-28).
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/2am-kusur-amaliyat-kasr-hasil-qisma.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, à 768×1024, 1024×768, 1280×800 et 1366×768 (tablette et laptop seulement) :
//   1. le sommaire et CHAQUE module : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » / « \command » / clé `manipulation.` brute ;
//   2. le labo مبتدئ : le curseur verrouillé à aucun moment, le cadran fermé (0,1 et 0,01 verrouillés), « ضع القطع » juge 2 (يكفي) puis 3 (لا يكفي), l'encadrement ouvre 0,1, la fenêtre zoome sur [2,0 ; 3,0],
//      2,6 puis 2,7, 2,66 puis 2,67 : la tâche est faite, la carte de questions s'ouvre PAR-DESSUS le labo ; « إعادة » repart de la tâche 1 au rang 0 ;
//   3. le labo متقدم : le curseur est VERROUILLÉ tant que l'unité n'est pas choisie, « dm » l'ouvre ;
//   4. D'UN SEUL REGARD : `[data-ml-glance]` tient dans la hauteur de l'écran (aux deux niveaux) et dans la largeur ;
//   5. « جرّب أعدادك » : un hasard libre (a = 10, b = 7) ouvre une tâche libre.
// Captures dans /tmp/qa-2am-kasr (ou QA_OUT).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-2am-kasr';
const CH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/kasr-hasil-qisma`;
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
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); localStorage.setItem('sa.labCoach.mooring-lines.off', '1'); } catch { /* noop */ } }, token);
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

// 1 — sommaire et modules.
for (const vp of SIZES) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}×${vp.height}`;
  await page.goto(`${BASE}${LESSON}`, { waitUntil: 'networkidle' });
  check(await page.getByText('الكسر: نسبة وحاصل قسمة وقيم مقرّبة').first().isVisible().catch(() => false), `${tag} sommaire monté`);
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
    const el = [...document.querySelectorAll('[data-ml-glance]')].find((e) => e.offsetHeight > 0);
    if (!el) return null;
    el.scrollIntoView({ block: 'start', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    return { h: r.height, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.h <= box.vh + 1, `${label}: [data-ml-glance] tient dans l'écran (${box ? `${Math.round(box.h)} / ${box.vh}` : 'absent'})`);
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-ml-glance] reste dans la largeur`);
};
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForSelector('[data-ml-glance]', { state: 'attached' });
  await page.waitForTimeout(900);
};
const lay = async (page, qn) => {
  const clip = vis(page, '[data-ml-clip]');
  await clip.focus();
  await page.keyboard.press('Home');
  for (let i = 0; i < qn; i += 1) await page.keyboard.press('ArrowRight');
  await vis(page, '[data-ml-lay]').click();
  await page.waitForTimeout(150);
};
const verdict = (page) => vis(page, '[data-ml-gap]').getAttribute('data-verdict');

for (const vp of SIZES) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}×${vp.height}`;
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-mooring-lines]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  await glanceFits(page, `${tag} مبتدئ`);
  await page.screenshot({ path: `${OUT}/lab-beginner-init-${vp.width}x${vp.height}.png` });
  check(await vis(page, '[data-ml-rank="1"]').isDisabled() && await vis(page, '[data-ml-rank="2"]').isDisabled(), `${tag} مبتدئ : le cadran n'ouvre que le rang 0`);
  await lay(page, 2);
  check((await verdict(page)) === 'fits', `${tag} مبتدئ : 2 m — la corde suffit`);
  check(await vis(page, '[data-ml-rank="1"]').isDisabled(), `${tag} مبتدئ : encadrement incomplet, le cadran reste fermé`);
  await page.screenshot({ path: `${OUT}/lab-beginner-fit-${vp.width}x${vp.height}.png` });
  await lay(page, 3);
  check((await verdict(page)) === 'over', `${tag} مبتدئ : 3 m — la corde ne suffit pas`);
  check(!(await vis(page, '[data-ml-rank="1"]').isDisabled()), `${tag} مبتدئ : encadrement trouvé, le rang 0,1 s'ouvre`);
  await page.screenshot({ path: `${OUT}/lab-beginner-over-${vp.width}x${vp.height}.png` });
  await vis(page, '[data-ml-rank="1"]').click();
  await page.waitForTimeout(200);
  check((await vis(page, '[data-mooring-lines]').getAttribute('data-rank')) === '1', `${tag} مبتدئ : rang 0,1`);
  await lay(page, 6); check((await verdict(page)) === 'fits', `${tag} 2,6 suffit`);
  await lay(page, 7); check((await verdict(page)) === 'over', `${tag} 2,7 ne suffit pas`);
  await vis(page, '[data-ml-rank="2"]').click();
  await page.waitForTimeout(200);
  await lay(page, 6);
  await page.screenshot({ path: `${OUT}/lab-beginner-cm-${vp.width}x${vp.height}.png` });
  // au rang 0,01 la fenêtre est [2,60 ; 2,70] : 2,66 = Home + 6 pas ; 2,67 = 7 pas
  check((await vis(page, '[data-ml-clip]').getAttribute('data-q')) === '2,66', `${tag} 2,66 : la fenêtre a zoomé`);
  check((await verdict(page)) === 'fits', `${tag} 2,66 suffit (il reste 0,02 m)`);
  await lay(page, 7); check((await verdict(page)) === 'over', `${tag} 2,67 ne suffit pas`);
  await page.waitForTimeout(500);
  check(await page.locator('[data-lab-checkpoint]').count() > 0, `${tag} la carte de questions s'ouvre PAR-DESSUS le labo`);
  await page.screenshot({ path: `${OUT}/lab-beginner-card-${vp.width}x${vp.height}.png` });
  // « إعادة » : tout repart (tâche 1, rang 0)
  await vis(page, 'button:has-text("إعادة")').click().catch(() => {});
  await page.waitForTimeout(600);
  check((await vis(page, '[data-mooring-lines]').getAttribute('data-rank')) === '0' && (await vis(page, '[data-mooring-lines]').getAttribute('data-task')) === '0', `${tag} « إعادة » repart de la tâche 1 au rang 0`);

  await pickLevel(page, 'advanced');
  await glanceFits(page, `${tag} متقدم`);
  await page.screenshot({ path: `${OUT}/lab-advanced-init-${vp.width}x${vp.height}.png` });
  check((await vis(page, '[data-ml-clip]').getAttribute('data-locked')) === 'true', `${tag} متقدم : le curseur est verrouillé avant le choix de l'unité`);
  await vis(page, '[data-ml-unit-opt="dm"]').click();
  await page.waitForTimeout(250);
  check((await vis(page, '[data-ml-clip]').getAttribute('data-locked')) === 'false', `${tag} متقدم : « dm » ouvre le curseur`);
  await lay(page, 6);
  await page.screenshot({ path: `${OUT}/lab-advanced-lay-${vp.width}x${vp.height}.png` });
  check(errors.length === 0, `${tag} aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 2)) : ''}`);
  // « جرّب أعدادك »
  await vis(page, '[data-ml-free-a]').scrollIntoViewIfNeeded().catch(() => {});
  await ctx.close();
}
{
  const ctx = await contextFor(browser, token, { width: 1366, height: 768 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-mooring-lines]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  await vis(page, '[data-ml-free-a]').fill('10');
  await vis(page, '[data-ml-free-b]').fill('7');
  await page.waitForTimeout(300);
  check((await vis(page, '[data-ml-free]').getAttribute('data-active')) === 'true', '« جرّب أعدادك » : 10 ÷ 7 ouvre une tâche libre');
  await ctx.close();
}

await browser.close();
if (failures.length) { console.log(`\n${failures.length} échec(s)`); process.exit(1); }
console.log('\nTout est vert.');
