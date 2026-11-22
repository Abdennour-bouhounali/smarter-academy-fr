// QA — 1AM, unité 6, 1re leçon générée `bahth-adad-naqisa` « البحث عن أعداد ناقصة » et son labo `rewind-belt` « الحزام المعاكس » (cycle moyen phase 3, 2026-10-30)
//
//   KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/1am-bahth-adad-naqisa.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, à 768×1024, 1024×768, 1280×800 et 1366×768 (tablette et laptop seulement) :
//   1. le sommaire et CHAQUE module : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » brut / commande LaTeX / clé `manipulation.`, fiche mémo sans chevauchement ;
//   2. le labo مبتدئ b1 : sans carte la caisse ne bouge pas ; « + » (la carte de la machine) rate la contre-épreuve et est JUGÉE (« جرّب بطاقة أخرى ») ; « − » tirée À LA SOURIS donne 45 puis 54 ;
//      les questions de la suite s'ouvrent PAR-DESSUS le labo ;
//   3. b4 : la carte « 80 − » : « + » ne la remonte pas (134 puis −54), « 80 − » donne 26 ;
//   4. le labo متقدم a3 : 20 ÷ 7 ne s'arrête pas, la caisse porte 20/7 et la contre-épreuve donne 20 ;
//   5. D'UN SEUL REGARD : `[data-rb-glance]` tient dans la largeur et, à 1024×768, dans 760 px de haut, aux DEUX niveaux ;
//   6. « جرّب آلتك أنت » : une machine libre qui n'est jamais comptée.
// Captures dans /tmp/qa-1am-bahth-adad-naqisa (ou QA_OUT).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://127.0.0.1:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-1am-bahth-adad-naqisa';
const LESSON = '/courses/moyen/1am/ansab_al_aadad_wal_hisab/bahth-adad-naqisa';
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
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); localStorage.setItem('sa.labCoach.rewind-belt.off', '1'); } catch { /* noop */ } }, token);
  return ctx;
}
const RAW = /(^|[^\\])\$[^$\s][^$]*\$|\\(frac|times|mathrm|ldots|le|div|square)\b|manipulation\.[a-zA-Z]+\./;
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

// 1 — sommaire et modules (QA_LAB_ONLY=1 les saute).
for (const vp of process.env.QA_LAB_ONLY ? [] : SIZES) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}×${vp.height}`;
  await page.goto(`${BASE}${LESSON}`, { waitUntil: 'networkidle' });
  check(await page.getByText('البحث عن أعداد ناقصة').first().isVisible().catch(() => false), `${tag} sommaire monté`);
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

// 2 → 6 — le labo.
const vis = (page, sel) => page.locator(`${sel}:visible`).first();
const glanceFits = async (page, label) => {
  const box = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-rb-glance]')].find((e) => e.offsetHeight > 0);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { h: r.height, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-rb-glance] reste dans la largeur (${box ? `${Math.round(box.h)}px de haut / ${box.vh}` : 'absent'})`);
  return box;
};
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForSelector('[data-rb-glance]', { state: 'attached' });
  await page.waitForTimeout(900);
};
/** Répond à la suite de questions posée PAR-DESSUS le labo : essaie les options jusqu'à la bonne, puis « suivant ». */
const answerCheckpoints = async (page, max = 12) => {
  let answered = 0;
  for (let i = 0; i < max; i += 1) {
    await page.waitForTimeout(350);
    if ((await page.locator('[data-lab-checkpoint]:visible').count()) === 0) break;
    for (let o = 0; o < 4; o += 1) {
      const opt = page.locator(`[data-lab-checkpoint-option="${o}"]:visible`).first();
      if (!(await opt.count())) break;
      if ((await opt.getAttribute('data-state')) !== 'idle') continue;
      await opt.click();
      await page.waitForTimeout(250);
      if ((await page.locator('[data-lab-checkpoint-feedback="right"]:visible').count()) > 0) break;
    }
    const next = page.locator('[data-lab-checkpoint-next]:visible').first();
    if (await next.count()) { await next.click(); answered += 1; }
  }
  return answered;
};
const phase = (page) => vis(page, '[data-rewind-belt]').getAttribute('data-phase');
const card = async (page, kind) => { await vis(page, `[data-rb-card="${kind}"]`).click(); await page.waitForTimeout(150); };
const run = async (page) => { await vis(page, '[data-rb-run]').click(); await page.waitForTimeout(250); };
/** Tire la caisse À LA SOURIS d'une position à l'autre (0 : sortie, 1 : entrée) sur le SVG. */
const dragCrate = async (page, from, to) => {
  const svg = vis(page, '[data-rb-svg]');
  await svg.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(150);
  const box = await svg.boundingBox();
  const xOf = (p) => box.x + ((530 - 418 * p) / 640) * box.width;
  const y = box.y + (180 / 330) * box.height;
  await page.mouse.move(xOf(from), y);
  await page.mouse.down();
  const steps = 14;
  for (let i = 1; i <= steps; i += 1) await page.mouse.move(xOf(from + ((to - from) * i) / steps), y);
  await page.mouse.up();
  await page.waitForTimeout(250);
};
const crateValue = (page) => vis(page, '[data-rb-crate]').getAttribute('data-value');

for (const vp of SIZES) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}×${vp.height}`;
  const shot = async (n, wait = 0) => { if (wait) await page.waitForTimeout(wait); await page.locator('[data-rb-glance]:visible').first().evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' })).catch(() => {}); await page.waitForTimeout(150); await page.screenshot({ path: `${OUT}/${n}-${vp.width}x${vp.height}.png` }); };
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-rewind-belt]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  const bx = await glanceFits(page, `${tag} مبتدئ`);
  await shot('lab-beginner-init');
  // b1 : sans carte, la caisse ne bouge pas
  await dragCrate(page, 0, 0.6);
  check((await crateValue(page)) === '54' && (await phase(page)) === 'rewind', `${tag} b1 : sans carte choisie la caisse ne bouge pas`);
  // « + » (la carte de la machine) : jugée à la contre-épreuve
  await card(page, 'add');
  await run(page);
  check((await phase(page)) === 'check' && (await vis(page, '[data-rb-bin]').getAttribute('data-filled')) === 'true', `${tag} b1 : la caisse arrive au bac d'entrée (63)`);
  await shot('lab-beginner-mid');
  await run(page);
  check((await phase(page)) === 'miss' && (await vis(page, '[data-rb-verdict]').getAttribute('data-rb-verdict')) === 'wrong', `${tag} b1 : « + » rate la contre-épreuve et est JUGÉE (72 au lieu de 54)`);
  check(((await vis(page, '[data-rb-verdict]').textContent()) ?? '').includes('72'), `${tag} b1 : le verdict dit ce qui sort (72)`);
  await shot('lab-beginner-wrong');
  await vis(page, '[data-rb-retry]').click();
  await page.waitForTimeout(250);
  // « − » tirée à la souris : 54 → 45 → 54
  await card(page, 'sub');
  await dragCrate(page, 0, 1);
  check((await phase(page)) === 'check', `${tag} b1 : la caisse tirée à la souris arrive en entrée`);
  check(((await vis(page, '[data-rb-bin]').textContent()) ?? '').includes('45'), `${tag} b1 : le bac d'entrée porte 45`);
  await dragCrate(page, 1, 0);
  check((await phase(page)) === 'done', `${tag} b1 : poussée en arrière à la souris, la contre-épreuve donne 54`);
  const questions = await answerCheckpoints(page);
  check(questions >= 2, `${tag} b1 : la suite de questions s'ouvre PAR-DESSUS le labo (${questions} questions)`);
  check((await page.locator('[data-rb-next]:visible').count()) > 0, `${tag} b1 : « المهمة التالية » apparaît après les questions`);
  await shot('lab-beginner-done');
  await vis(page, '[data-rb-next]').click();
  await page.waitForTimeout(500);
  // b2 « − 14 » → + ; b3 « × 6 » → ÷
  await card(page, 'add'); await run(page); await run(page);
  await answerCheckpoints(page);
  await vis(page, '[data-rb-next]').click();
  await page.waitForTimeout(500);
  await card(page, 'div'); await run(page); await run(page);
  await answerCheckpoints(page);
  await vis(page, '[data-rb-next]').click();
  await page.waitForTimeout(500);
  // b4 « 80 − » : « + » donne 134 puis −54
  check(await page.locator('[data-rb-card="rsub"]:visible').count() > 0, `${tag} b4 : la carte « 80 − » est dans le rang`);
  await card(page, 'add'); await run(page); await run(page);
  check(((await vis(page, '[data-rb-verdict]').textContent()) ?? '').includes('54') && (await phase(page)) === 'miss', `${tag} b4 : « + » ne remonte pas « 80 − » (la contre-épreuve dit -54)`);
  await shot('lab-beginner-trap');
  await vis(page, '[data-rb-retry]').click();
  await page.waitForTimeout(250);
  await card(page, 'rsub'); await run(page);
  check(((await vis(page, '[data-rb-bin]').textContent()) ?? '').includes('26'), `${tag} b4 : « 80 − » donne 26`);
  await run(page);
  check((await phase(page)) === 'done', `${tag} b4 : la contre-épreuve de 80 − 26 donne 54`);

  await pickLevel(page, 'advanced');
  const ax = await glanceFits(page, `${tag} متقدم`);
  await shot('lab-advanced-init');
  if (vp.width === 1024) {
    for (const [lv, b] of [['مبتدئ', bx], ['متقدم', ax]]) {
      console.log(`  ${tag} ${lv} : hauteur de [data-rb-glance] = ${b ? Math.round(b.h) : '?'} px (écran ${vp.height})`);
      check(b && b.h <= 760, `${tag} ${lv} : [data-rb-glance] ≤ 760 px de haut (${b ? Math.round(b.h) : '?'})`);
    }
  }
  // a1 « + 17,5 » → 28,7 ; a2 « 12,5 − » → 7,7 ; a3 « × 7 » → 20/7
  await card(page, 'sub'); await run(page); await run(page);
  await answerCheckpoints(page);
  await vis(page, '[data-rb-next]').click();
  await page.waitForTimeout(500);
  await card(page, 'rsub'); await run(page); await run(page);
  await answerCheckpoints(page);
  await vis(page, '[data-rb-next]').click();
  await page.waitForTimeout(500);
  await card(page, 'div'); await run(page);
  check(((await vis(page, '[data-rb-bin]').textContent()) ?? '').includes('20/7'), `${tag} a3 : la division ne s'arrête pas, la caisse porte 20/7`);
  await shot('lab-advanced-fraction', 600);
  await run(page);
  check((await phase(page)) === 'done', `${tag} a3 : la contre-épreuve de 20/7 × 7 donne 20`);
  await answerCheckpoints(page);

  // « جرّب آلتك أنت »
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-rewind-belt]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  check((await page.locator('[data-rb-free]:visible').count()) > 0, `${tag} libre : le panneau « جرّب آلتك أنت » est ouvert`);
  await vis(page, '[data-rb-free-kind="mul"]').click();
  await vis(page, '[data-rb-free-a]').fill('7');
  await vis(page, '[data-rb-free-b]').fill('20');
  await page.waitForTimeout(300);
  check(((await vis(page, '[data-rb-free-info]').textContent()) ?? '').includes('20/7') || (await page.locator('[data-rb-free-info] .katex:visible').count()) > 0, `${tag} libre : le labo calcule le manquant d'une machine libre`);
  await shot('lab-free');
  check((await vis(page, '[data-rewind-belt]').getAttribute('data-solved')) === 'false', `${tag} libre : un essai libre n'avance jamais la tâche`);
  check(errors.length === 0, `${tag} aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 2)) : ''}`);
  await ctx.close();
}

await browser.close();
if (failures.length) { console.log(`\n${failures.length} échec(s)`); process.exit(1); }
console.log('\nTout est vert.');
