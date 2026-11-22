// QA — 2AM, unité 3 « الأعداد النسبية », 6e leçon (3e du pair 3) `majmu-jabri` « حساب مجموع جبري » et son labo `tug-rope` « شدّ الحبل » (cycle moyen phase 3, 2026-10-29).
//
//   KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/2am-adad-nisbiya-2-jam-tarh-nisbiya.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, à 768×1024, 1024×768, 1280×800 et 1366×768 (tablette et laptop seulement) :
//   1. le sommaire et CHAQUE module : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » / « \command » / clé `manipulation.` brute ;
//   2. le labo مبتدئ : le coup de sifflet est fermé tant que tous les enfants ne sont pas placés ; t1 donne +3 (12 / 9) ; t2 SANS retourner : ruban fantôme `noTurn` ; retourner puis placer donne −12 ;
//      t3 : les paires opposées ; les cartes de questions s'ouvrent PAR-DESSUS le labo ; « إعادة » repart de la tâche 1 ;
//   3. le labo متقدم : la position est écrite AVANT (« −7,5 » refusé + fantôme `flipSign`, « 7,5 » ouvre les gestes) ; a2 : « 17 » (`bracketDrop`), le petit équipage se règle d'abord (+5) puis le ruban à +7 ; a3 : 0 ;
//   4. D'UN SEUL REGARD : `[data-tr-glance]` ≤ 700 px de haut à 1024×768, aux DEUX niveaux ;
//   5. « جرّب أعدادك » : « −5 − 3 + 2 » ouvre la chaîne libre.
// Captures dans /tmp/qa-2am-majmu-jabri (ou QA_OUT).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-2am-majmu-jabri';
const CH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/majmu-jabri`;
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
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); localStorage.setItem('sa.labCoach.tug-rope.off', '1'); } catch { /* noop */ } }, token);
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
  check(await page.getByText('حساب مجموع جبري').first().isVisible().catch(() => false), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);
  for (const slug of MODULES) {
    await page.goto(`${BASE}${LESSON}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    check(await page.locator('main, [data-module-layout], h1').first().isVisible().catch(() => false), `${tag} ${slug} monté`);
    await pageHealth(page, `${tag} ${slug}`);
    await page.screenshot({ path: `${OUT}/${slug}-${vp.width}x${vp.height}.png`, fullPage: true });
    const memo = await page.evaluate(() => {
      const bad = [];
      for (const card of document.querySelectorAll('[data-memo-card]')) {
        const cr = card.getBoundingClientRect();
        if (!cr.width) continue;
        const fs = [...card.querySelectorAll('.katex')].filter((e) => !e.parentElement.closest('.katex') && e.getBoundingClientRect().width > 0).map((e) => ({ r: e.getBoundingClientRect(), s: e.textContent.slice(0, 20) }));
        fs.forEach((a, i) => {
          if (a.r.left < cr.left - 1 || a.r.right > cr.right + 1) bad.push(`hors carte: ${a.s}`);
          fs.slice(i + 1).forEach((b) => { if (a.r.left < b.r.right - 1 && b.r.left < a.r.right - 1 && a.r.top < b.r.bottom - 1 && b.r.top < a.r.bottom - 1) bad.push(`chevauche: ${a.s} / ${b.s}`); });
        });
      }
      return bad.slice(0, 4);
    });
    check(memo.length === 0, `${tag} ${slug}: aucune formule de la fiche mémo ne chevauche une autre ni ne dépasse sa carte ${memo.length ? JSON.stringify(memo) : ''}`);
  }
  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 2 → 5 — le labo.
const vis = (page, sel) => page.locator(`${sel}:visible`).first();
const glanceBox = async (page) => page.evaluate(() => {
  const el = [...document.querySelectorAll('[data-tr-glance]')].find((e) => e.offsetHeight > 0);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { h: r.height, left: r.left, right: r.right, vw: window.innerWidth };
});
const glanceFits = async (page, label, maxH) => {
  const box = await glanceBox(page);
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-tr-glance] reste dans la largeur (${box ? Math.round(box.h) : 'absent'} px de haut)`);
  if (maxH) check(box && box.h <= maxH, `${label}: [data-tr-glance] ≤ ${maxH} px (${box ? Math.round(box.h) : '?'})`);
  return box;
};
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForSelector('[data-tr-glance]', { state: 'attached' });
  await page.waitForTimeout(900);
};
const type = async (page, v) => { const i = vis(page, '[data-tr-answer]'); await i.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' })); await i.fill(v); await i.press('Enter'); await page.waitForTimeout(250); };
/** Place chaque enfant de la file : retourne ceux que précède « − » (sauf `skipTurn`), puis l'envoie du côté de son signe. */
const placeAll = async (page, { skipTurn = false } = {}) => {
  for (let guard = 0; guard < 12; guard += 1) {
    const kid = vis(page, '[data-tr-queue] [data-tr-child]');
    if (!(await kid.count().catch(() => 0)) || !(await kid.isVisible().catch(() => false))) break;
    const turn = kid.locator('[data-tr-turn]');
    if (!skipTurn && (await turn.count()) && (await kid.getAttribute('data-turned')) === 'false') { await turn.click(); await page.waitForTimeout(80); }
    const bib = await kid.getAttribute('data-bib');
    await kid.locator('button').first().click();
    await page.waitForTimeout(60);
    await vis(page, `[data-tr-send=${bib.startsWith('-') ? 'left' : 'right'}]`).click();
    await page.waitForTimeout(80);
  }
};
const whistle = async (page) => { await vis(page, '[data-tr-whistle]').click(); await page.waitForTimeout(900); };
const passCheckpoint = async (page) => {
  for (let q = 0; q < 6; q += 1) {
    await page.waitForTimeout(500);
    if (!(await page.locator('[data-lab-checkpoint]').count())) return;
    for (let i = 0; i < 3; i += 1) {
      const opt = page.locator(`[data-lab-checkpoint-option="${i}"]`).first();
      if (!(await opt.count())) break;
      await opt.click().catch(() => {});
      await page.waitForTimeout(250);
      if (await page.locator('[data-lab-checkpoint-feedback="right"]').count()) break;
    }
    const next = page.locator('[data-lab-checkpoint-next]').first();
    if (await next.count()) await next.click().catch(() => {});
    await page.waitForTimeout(350);
  }
};

for (const vp of SIZES.filter((v) => !process.env.QA_WIDTHS || process.env.QA_WIDTHS.split(',').includes(String(v.width)))) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}×${vp.height}`;
  const shot = async (name) => { await vis(page, '[data-tr-glance]').screenshot({ path: `${OUT}/lab-${name}-${vp.width}x${vp.height}.png` }).catch(() => page.screenshot({ path: `${OUT}/lab-${name}-${vp.width}x${vp.height}.png` })); };
  const maxH = vp.width === 1024 ? 700 : null;
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-tug-rope]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  await glanceFits(page, `${tag} مبتدئ`, maxH);
  await shot('beginner-init');
  check(await vis(page, '[data-tr-whistle]').isDisabled(), `${tag} t1 : le coup de sifflet est fermé tant que les enfants ne sont pas placés`);
  await placeAll(page);
  check((await vis(page, '[data-tr-team=right]').getAttribute('data-total')) === '12' && (await vis(page, '[data-tr-team=left]').getAttribute('data-total')) === '9', `${tag} t1 : les équipes tirent 12 et 9`);
  await shot('beginner-placed');
  await whistle(page);
  check((await vis(page, '[data-tr-ribbon]').getAttribute('data-value')) === '3', `${tag} t1 : le ruban s'arrête à +3`);
  await shot('beginner-whistle');
  await type(page, '7');
  check(await page.locator('[data-lab-checkpoint]').count() === 0 && (await vis(page, '[data-tr-verdict]').getAttribute('data-tr-verdict')) === 'wrong', `${tag} t1 : « 7 » est refusé`);
  await type(page, '3');
  await page.waitForTimeout(600);
  check(await page.locator('[data-lab-checkpoint]').count() > 0, `${tag} t1 : la carte de questions s'ouvre PAR-DESSUS le labo`);
  await shot('beginner-card');
  await passCheckpoint(page);
  await vis(page, '[data-tr-next]').click();
  await page.waitForTimeout(500);
  check((await vis(page, '[data-tug-rope]').getAttribute('data-task')) === '1', `${tag} la deuxième chaîne s'ouvre`);
  await placeAll(page, { skipTurn: true });
  await shot('t2-noturn-placed');
  await whistle(page);
  check(await page.locator('[data-tr-ghost][data-model="noTurn"]').count() > 0, `${tag} t2 : sans retourner, le ruban fantôme noTurn est posé`);
  await shot('t2-noturn-ghost');
  await glanceFits(page, `${tag} t2 (pire phase : fantôme + verdict)`, maxH);
  const order = await vis(page, '[data-tr-board-bracket]').evaluate((e) => [...e.querySelectorAll('span')].map((s) => Math.round(s.getBoundingClientRect().left)));
  const words = await vis(page, '[data-tr-board-bracket]').evaluate((e) => [...e.querySelectorAll('span')].map((s) => s.textContent.trim()).join('|'));
  check(order.every((x, i) => i === 0 || x > order[i - 1]) && words.startsWith('(−8)'), `${tag} t2 : le tableau s'écrit de gauche à droite dans l'ordre de la chaîne (${words} @ ${order.join(',')})`);
  for (let i = 0; i < 4; i += 1) { const k = vis(page, '[data-tr-team] [data-tr-child]'); if (!(await k.count())) break; await k.locator('button').first().click(); await page.waitForTimeout(80); }
  await placeAll(page);
  await shot('t2-turned-placed');
  await whistle(page);
  check((await vis(page, '[data-tr-ribbon]').getAttribute('data-value')) === '-12', `${tag} t2 : le ruban s'arrête à −12`);
  await type(page, '-12');
  await passCheckpoint(page);
  await vis(page, '[data-tr-next]').click();
  await page.waitForTimeout(500);
  await placeAll(page);
  await whistle(page);
  check((await vis(page, '[data-tr-ribbon]').getAttribute('data-value')) === '-3', `${tag} t3 : le ruban s'arrête à −3`);
  await shot('t3-whistle');
  await type(page, '-3');
  await passCheckpoint(page);
  await shot('beginner-done');
  await vis(page, 'button:has-text("إعادة")').click().catch(() => {});
  await page.waitForTimeout(600);
  check((await vis(page, '[data-tug-rope]').getAttribute('data-task')) === '0', `${tag} « إعادة » repart de la tâche 1`);

  await pickLevel(page, 'advanced');
  await glanceFits(page, `${tag} متقدم`, maxH);
  await shot('advanced-init');
  check(await vis(page, '[data-tr-whistle]').isDisabled(), `${tag} متقدم : le sifflet est fermé avant la prédiction`);
  await type(page, '-7,5');
  check(await page.locator('[data-tr-ghost][data-model="flipSign"]').count() > 0, `${tag} a1 : « −7,5 » est refusé (flipSign) avec un ruban fantôme`);
  await shot('advanced-ghost');
  await glanceFits(page, `${tag} a1 (pire phase : prédiction refusée)`, maxH);
  await type(page, '7,5');
  await placeAll(page);
  await shot('advanced-placed');
  await whistle(page);
  check((await vis(page, '[data-tr-ribbon]').getAttribute('data-value')) === '7.5' || (await vis(page, '[data-tr-ribbon]').getAttribute('data-value')) === '7,5', `${tag} a1 : le ruban s'arrête à +7,5`);
  await shot('advanced-whistle');
  await page.waitForTimeout(700);
  await passCheckpoint(page);
  await vis(page, '[data-tr-next]').click();
  await page.waitForTimeout(500);
  await type(page, '17');
  check(await page.locator('[data-tr-ghost][data-model="bracketDrop"]').count() > 0, `${tag} a2 : « 17 » est refusé (bracketDrop)`);
  await type(page, '7');
  check(await page.locator('[data-tr-queue] [data-tr-child]:visible').count() === 3, `${tag} a2 : le petit équipage (3 enfants) se règle d'abord`);
  await shot('a2-minitrain');
  await glanceFits(page, `${tag} a2 (petit équipage)`, maxH);
  await placeAll(page);
  await whistle(page);
  check(await page.locator('[data-tr-queue] [data-tr-child]:visible').count() === 2, `${tag} a2 : le résultat (+5) devient un enfant de la file`);
  await shot('a2-stage1');
  await placeAll(page);
  await whistle(page);
  check((await vis(page, '[data-tr-ribbon]').getAttribute('data-value')) === '7', `${tag} a2 : le ruban s'arrête à +7`);
  await shot('a2-done');
  await glanceFits(page, `${tag} a2 (fin : verdict + suivant)`, maxH);
  await passCheckpoint(page);
  check(errors.length === 0, `${tag} aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 2)) : ''}`);
  await ctx.close();
}
{
  const ctx = await contextFor(browser, token, { width: 1366, height: 768 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-tug-rope]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  await vis(page, '[data-tr-free-chain]').fill('-5 - 3 + 2');
  await page.waitForTimeout(300);
  check((await vis(page, '[data-tr-free]').getAttribute('data-active')) === 'true', '« جرّب أعدادك » : « −5 − 3 + 2 » ouvre la chaîne libre');
  await placeAll(page);
  await whistle(page);
  check((await vis(page, '[data-tr-ribbon]').getAttribute('data-value')) === '-6', '« جرّب أعدادك » : le ruban s\'arrête à −6');
  await page.screenshot({ path: `${OUT}/lab-free-1366x768.png` });
  await ctx.close();
}

await browser.close();
if (failures.length) { console.log(`\n${failures.length} échec(s)`); process.exit(1); }
console.log('\nTout est vert.');
