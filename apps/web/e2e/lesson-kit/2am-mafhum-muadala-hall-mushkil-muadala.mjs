// QA — 2AM, unité 4 « مفهوم معادلة », 2e leçon `hall-mushkil-muadala` « حلّ مشكل باستعمال معادلة » et son labo `juice-line` « خطّ العصير » (cycle moyen phase 3, 2026-10-29).
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/2am-mafhum-muadala-hall-mushkil-muadala.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, à 768×1024, 1024×768, 1280×800 et 1366×768 (tablette et laptop seulement) :
//   1. le sommaire et CHAQUE module : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » / « \command » / clé `manipulation.` brute ;
//   2. le labo مبتدئ : deux essais (1,4 L → 12 bouteilles et 1,2 L restent ; 1,6 L → 11 bouteilles et une partielle), l'ardoise s'ouvre au 2e essai, 18×12 est REFUSÉ (le moule déborde),
//      12÷18 est refusé, 18÷12 est accepté (remplissage de contrôle exact), puis les cartes : une seule bonne carte est refusée, les deux sont acceptées ; la carte de questions s'ouvre PAR-DESSUS le labo ; « إعادة » repart de la tâche 1 ;
//   3. le labo متقدم : l'ardoise d'abord ; 24÷0,25 est refusé ; 24×0,25 accepté ; le réservoir réglé à 6 L et rempli résout la tâche ;
//   4. D'UN SEUL REGARD : `[data-jl-glance]` tient dans la largeur et, à 1024×768, dans la hauteur de l'écran, aux DEUX niveaux ;
//   5. « جرّب أعدادك » : un remplissage libre qui n'est jamais compté.
// Captures dans /tmp/qa-2am-hall-mushkil-muadala (ou QA_OUT).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5174';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-2am-hall-mushkil-muadala';
const CH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/hall-mushkil-muadala`;
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
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); localStorage.setItem('sa.labCoach.juice-line.off', '1'); } catch { /* noop */ } }, token);
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
  check(await page.getByText('حلّ مشكل باستعمال معادلة').first().isVisible().catch(() => false), `${tag} sommaire monté`);
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
    const el = [...document.querySelectorAll('[data-jl-glance]')].find((e) => e.offsetHeight > 0);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const free = el.parentElement?.querySelector('[data-jl-free]')?.getBoundingClientRect();
    return { h: r.height, top: r.top, bottom: free ? free.top : r.bottom, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-jl-glance] reste dans la largeur (${box ? `${Math.round(box.h)}px de haut / ${box.vh}` : 'absent'})`);
  return box;
};
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForSelector('[data-jl-glance]', { state: 'attached' });
  await page.waitForTimeout(900);
};
const bump = async (page, n, sel = '[data-jl-more-btn]') => { for (let i = 0; i < n; i += 1) { await vis(page, sel).click(); await page.waitForTimeout(40); } };
const verdict = (page) => vis(page, '[data-jl-verdict]').getAttribute('data-jl-verdict');
const write = async (page, text) => {
  const input = vis(page, '[data-jl-input]');
  await input.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await input.fill(text);
  await input.press('Enter');
  await page.waitForTimeout(200);
};
const bottles = (page, state) => page.locator(`[data-jl-bottle][data-level=${state}]:visible`).count();

for (const vp of SIZES) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}×${vp.height}`;
  const shot = async (n) => { await page.locator('[data-jl-glance]:visible').first().evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' })).catch(() => {}); await page.waitForTimeout(150); await page.screenshot({ path: `${OUT}/${n}-${vp.width}x${vp.height}.png` }); };
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-juice-line]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  const bx = await glanceFits(page, `${tag} مبتدئ`);
  await shot('lab-beginner-init');
  check((await page.locator('[data-jl-test][data-left=true]:visible').count()) === 2, `${tag} t1 : deux essais disponibles`);
  // essai 1 : 1,4 L → 12 bouteilles pleines et du jus qui reste
  await bump(page, 8);
  await vis(page, '[data-jl-fill]').click();
  await page.waitForTimeout(250);
  check((await bottles(page, 'full')) === 12, `${tag} t1 : 1,4 L → 12 bouteilles pleines`);
  check(await vis(page, '[data-jl-left]').count() > 0, `${tag} t1 : le jus resté dans le réservoir est écrit`);
  await shot('lab-beginner-leftover');
  // essai 2 : 1,6 L → 11 bouteilles et une 12e partielle
  await bump(page, 4);
  await vis(page, '[data-jl-fill]').click();
  await page.waitForTimeout(250);
  check((await bottles(page, 'full')) === 11 && (await bottles(page, 'partial')) === 1, `${tag} t1 : 1,6 L → 11 bouteilles pleines et une partielle`);
  await shot('lab-beginner-partial');
  check(await page.locator('[data-jl-slate]:visible').count() > 0, `${tag} t1 : après deux essais l'ardoise s'ouvre`);
  // l'ardoise : opérations fausses refusées ET dessinées
  await write(page, '18*12');
  check((await verdict(page)) === 'bad' && await page.locator('[data-jl-overflow]').count() > 0, `${tag} t1 : « 18×12 » est refusé et le moule déborde`);
  await shot('lab-beginner-mult');
  await write(page, '12/18');
  check((await verdict(page)) === 'bad', `${tag} t1 : « 12÷18 » est refusé`);
  await write(page, '18/12');
  await page.waitForTimeout(250);
  check((await verdict(page)) === 'good' && (await bottles(page, 'full')) === 12 && (await bottles(page, 'partial')) === 0, `${tag} t1 : « 18÷12 » est accepté, le remplissage de contrôle est exact`);
  await shot('lab-beginner-exact');
  // les cartes : TOUTES les bonnes équations
  await vis(page, '[data-jl-card=times]').click();
  await vis(page, '[data-jl-cards-check]').click();
  await page.waitForTimeout(200);
  check((await verdict(page)) === 'bad', `${tag} t1 : une seule bonne carte est refusée`);
  await vis(page, '[data-jl-card=under]').click();
  await vis(page, '[data-jl-cards-check]').click();
  await page.waitForTimeout(700);
  check(await page.locator('[data-lab-checkpoint]').count() > 0, `${tag} t1 : les deux cartes sont acceptées et la carte de questions s'ouvre PAR-DESSUS le labo`);
  await shot('lab-beginner-card');
  // « إعادة » : tout repart
  await vis(page, 'button:has-text("إعادة")').click().catch(() => {});
  await page.waitForTimeout(600);
  check((await vis(page, '[data-juice-line]').getAttribute('data-task')) === '0' && (await vis(page, '[data-juice-line]').getAttribute('data-tests')) === '2', `${tag} « إعادة » repart de la tâche 1`);

  await pickLevel(page, 'advanced');
  const ax = await glanceFits(page, `${tag} متقدم`);
  await shot('lab-advanced-init');
  if (vp.width === 1024) {
    // D'UN SEUL REGARD : le labo (consigne, scène, commandes, verdict) tient dans l'écran de 768 px aux DEUX niveaux (≤ 700 px)
    for (const [lv, b] of [['مبتدئ', bx], ['متقدم', ax]]) {
      console.log(`  ${tag} ${lv} : hauteur de [data-jl-glance] = ${b ? Math.round(b.h) : '?'} px (écran ${vp.height})`);
      check(b && b.h <= 700, `${tag} ${lv} : [data-jl-glance] ≤ 700 px de haut (${b ? Math.round(b.h) : '?'}) : un seul écran`);
    }
  }
  check(await page.locator('[data-jl-slate]:visible').count() > 0, `${tag} متقدم : l'ardoise s'ouvre d'abord`);
  await write(page, '24/0,25');
  check((await verdict(page)) === 'bad', `${tag} متقدم : « 24÷0,25 » est refusé`);
  await shot('lab-advanced-divide');
  await write(page, '24*0,25');
  check((await verdict(page)) === 'good' && await page.locator('[data-jl-tank]:visible').count() > 0, `${tag} متقدم : « 24×0,25 » est accepté, le réservoir se règle`);
  await bump(page, 11);
  await vis(page, '[data-jl-fill]').click();
  await page.waitForTimeout(250);
  check((await verdict(page)) === 'bad', `${tag} متقدم : 5,5 L ne suffit pas`);
  await bump(page, 1);
  await vis(page, '[data-jl-fill]').click();
  await page.waitForTimeout(700);
  check(await page.locator('[data-lab-checkpoint]').count() > 0, `${tag} متقدم : 6 L résout la tâche (carte de questions)`);
  await shot('lab-advanced-solved');

  // « جرّب أعدادك »
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-juice-line]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  await vis(page, '[data-jl-free-start]').click();
  await page.waitForTimeout(200);
  await vis(page, '[data-jl-free-fill]').click();
  await page.waitForTimeout(200);
  check(await vis(page, '[data-jl-free-result]').count() > 0, `${tag} libre : un remplissage donne son résultat`);
  await shot('lab-free');
  check(errors.length === 0, `${tag} aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 2)) : ''}`);
  await ctx.close();
}

await browser.close();
if (failures.length) { console.log(`\n${failures.length} échec(s)`); process.exit(1); }
console.log('\nTout est vert.');
