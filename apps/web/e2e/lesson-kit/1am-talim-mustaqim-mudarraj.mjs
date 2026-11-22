// QA — 1AM, unité 5, 2e leçon `talim-mustaqim-mudarraj` « التعليم على مستقيم مدرّج » et son labo `stride-stamp` « خطوة الطابع » (cycle moyen phase 3, 2026-10-30)
//
//   KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/1am-talim-mustaqim-mudarraj.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, à 768×1024, 1024×768, 1280×800 et 1366×768 (tablette et laptop seulement) :
//   1. le sommaire et CHAQUE module : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » brut / commande LaTeX / clé `manipulation.`, fiche mémo sans chevauchement ;
//   2. le labo مبتدئ b1 : avec la foulée longue le bâton s'arrête à −2 et la lecture −3 est JUGÉE (« edge »), la foulée moyenne l'atteint, les ticks −1, −2, −3 n'existent qu'une fois tamponnés ;
//   3. b2 : le jumeau est placé de l'autre côté de O (cotes de distance) ; b3 : trois maisons à leur abscisse (grain d'un dixième) ;
//   4. le labo متقدم a1 : le drapeau de l'origine sur la droite à graduations écrites (une graduation écrite prise pour l'origine est JUGÉE), a3 : le cadre d'une foulée (−1,5 entre −2 et −1) ;
//   5. D'UN SEUL REGARD : `[data-ss-glance]` tient dans la largeur et, à 1024×768, dans 700 px de haut, aux DEUX niveaux ;
//   6. « جرّب أعدادك » : un nombre libre qui n'est jamais compté.
// Captures dans /tmp/qa-1am-talim-mustaqim-mudarraj (ou QA_OUT).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://127.0.0.1:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-1am-talim-mustaqim-mudarraj';
const LESSON = '/courses/moyen/1am/ansab_al_aadad_wal_hisab/talim-mustaqim-mudarraj';
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
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); localStorage.setItem('sa.labCoach.stride-stamp.off', '1'); } catch { /* noop */ } }, token);
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

// 1 — sommaire et modules (QA_LAB_ONLY=1 les saute).
for (const vp of process.env.QA_LAB_ONLY ? [] : SIZES) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}×${vp.height}`;
  await page.goto(`${BASE}${LESSON}`, { waitUntil: 'networkidle' });
  check(await page.getByText('التعليم على مستقيم مدرّج').first().isVisible().catch(() => false), `${tag} sommaire monté`);
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

// 1 — sommaire et modules (QA_LAB_ONLY=1 les saute).
for (const vp of process.env.QA_LAB_ONLY ? [] : SIZES) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}×${vp.height}`;
  await page.goto(`${BASE}${LESSON}`, { waitUntil: 'networkidle' });
  check(await page.getByText('التعليم على مستقيم مدرّج').first().isVisible().catch(() => false), `${tag} sommaire monté`);
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
    const el = [...document.querySelectorAll('[data-ss-glance]')].find((e) => e.offsetHeight > 0);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { h: r.height, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-ss-glance] reste dans la largeur (${box ? `${Math.round(box.h)}px de haut / ${box.vh}` : 'absent'})`);
  return box;
};
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForSelector('[data-ss-glance]', { state: 'attached' });
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
/** Déplace la main au clavier (flèches : un tick ; PageUp / PageDown : une unité) puis laisse la scène se redessiner. */
const press = async (page, key, n = 1) => {
  const knob = vis(page, '[data-ss-knob]');
  await knob.focus();
  for (let i = 0; i < n; i += 1) await page.keyboard.press(key);
  await page.waitForTimeout(120);
};
const pos = async (page) => Number(await vis(page, '[data-ss-knob]').getAttribute('data-pos'));
const record = async (page) => { await vis(page, '[data-ss-record]').click(); await page.waitForTimeout(250); };
/** Le cran de la foulée : un clic au centre du cran (l'écran est amené d'abord au milieu : l'en-tête fixe ne doit pas couvrir la glissière). */
const pickStride = async (page, i) => {
  await vis(page, '[data-ss-svg]').evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  const box = await vis(page, `[data-ss-stride="${i}"]`).boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(250);
};
/** « المهمة التالية » : on attend qu'elle apparaisse (la fête d'étape et la suite de questions passent d'abord). */
const clickNext = async (page) => { await page.waitForSelector('[data-ss-next]', { state: 'visible', timeout: 15000 }); await vis(page, '[data-ss-next]').click(); await page.waitForTimeout(600); };
const verdict = async (page) => vis(page, '[data-ss-verdict]').getAttribute('data-ss-verdict');

for (const vp of SIZES) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}×${vp.height}`;
  const shot = async (n, wait = 0) => { if (wait) await page.waitForTimeout(wait); await page.locator('[data-ss-glance]:visible').first().evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' })).catch(() => {}); await page.waitForTimeout(150); await page.screenshot({ path: `${OUT}/${n}-${vp.width}x${vp.height}.png` }); };
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-stride-stamp]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  const bx = await glanceFits(page, `${tag} مبتدئ`);
  check((await page.locator('[data-ss-tick]:visible').count()) === 1, `${tag} b1 : la route ne porte que le zéro au départ`);
  await shot('lab-beginner-init');
  // b1 : la foulée longue — l'est d'abord (3), puis l'ouest : le bâton s'arrête à −2
  await press(page, 'ArrowRight', 3);
  check((await pos(page)) === 30, `${tag} b1 : le bâton porté trois foulées à l'est`);
  check((await page.locator('[data-ss-tick]:visible').count()) === 4, `${tag} b1 : les ticks 0 1 2 3 sont tamponnés`);
  await shot('lab-beginner-mid');
  await record(page);
  check((await verdict(page)) === 'right', `${tag} b1 : la lecture 3 est juste`);
  await press(page, 'ArrowLeft', 7);
  check((await pos(page)) === -20, `${tag} b1 : avec la foulée longue la route s'arrête à −2 (${await pos(page)})`);
  check((await page.locator('[data-ss-tick="−1"]:visible').count()) === 1 && (await page.locator('[data-ss-tick="−3"]:visible').count()) === 0, `${tag} b1 : −1 et −2 sont tamponnés, −3 n'existe pas`);
  await record(page);
  check((await verdict(page)) === 'wrong', `${tag} b1 : −3 refusée : la route s'arrête avant (jugée, pas corrigée)`);
  await shot('lab-beginner-edge');
  // la foulée moyenne efface les ticks et atteint −3
  await pickStride(page, 1);
  check((await pos(page)) === 0 && (await page.locator('[data-ss-tick]:visible').count()) === 1, `${tag} b1 : changer de foulée efface les ticks`);
  await press(page, 'ArrowLeft', 3);
  await record(page);
  check((await verdict(page)) === 'right', `${tag} b1 : −3 atteint avec la foulée moyenne`);
  const questions = await answerCheckpoints(page);
  check(questions >= 2, `${tag} b1 : la suite de questions s'ouvre PAR-DESSUS le labo (${questions} questions)`);
  check((await page.locator('[data-ss-next]:visible').count()) > 0, `${tag} b1 : « المهمة التالية » apparaît après les questions`);
  await shot('lab-beginner-done');
  await clickNext(page);
  // b2 : le jumeau de −3 est en 3, puis de 2 en −2
  check((await vis(page, '[data-stride-stamp]').getAttribute('data-kind')) === 'twin', `${tag} b2 : le jumeau`);
  await press(page, 'ArrowRight', 3);
  check((await page.locator('[data-ss-distance]:visible').count()) >= 2, `${tag} b2 : les deux cotes de distance à O sont dessinées`);
  await shot('lab-beginner-twin', 400);
  await record(page);
  check((await verdict(page)) === 'right', `${tag} b2 : le jumeau de −3 est en 3`);
  await press(page, 'ArrowLeft', 5);
  await record(page);
  await answerCheckpoints(page);
  await clickNext(page);
  // b3 : A(−3), B(2,7), C(−1,5) au grain d'un dixième
  check((await vis(page, '[data-stride-stamp]').getAttribute('data-kind')) === 'place', `${tag} b3 : les maisons`);
  await press(page, 'PageDown', 3);
  await shot('lab-beginner-place', 400);
  await record(page);
  await press(page, 'PageUp', 6); await press(page, 'ArrowLeft', 3);
  check((await pos(page)) === 27, `${tag} b3 : B à 2,7 (${await pos(page)})`);
  check((await page.locator('[data-ss-reading="2,7"]:visible').count()) === 1, `${tag} b3 : la pastille lit « 2,7 » en direct`);
  await record(page);
  await press(page, 'PageDown', 4); await press(page, 'ArrowLeft', 2);
  check((await page.locator('[data-ss-reading="−1,5"]:visible').count()) === 1, `${tag} b3 : la pastille lit « −1,5 » (signe seulement à l'ouest)`);
  await record(page);
  check((await vis(page, '[data-stride-stamp]').getAttribute('data-task')) === 'b3', `${tag} b3 : trois maisons posées`);
  await answerCheckpoints(page);

  await pickLevel(page, 'advanced');
  const ax = await glanceFits(page, `${tag} متقدم`);
  await shot('lab-advanced-init');
  if (vp.width === 1024) {
    for (const [lv, b] of [['مبتدئ', bx], ['متقدم', ax]]) {
      console.log(`  ${tag} ${lv} : hauteur de [data-ss-glance] = ${b ? Math.round(b.h) : '?'} px (écran ${vp.height})`);
      check(b && b.h <= 700, `${tag} ${lv} : [data-ss-glance] ≤ 700 px de haut (${b ? Math.round(b.h) : '?'}) : un seul écran`);
    }
  }
  // a1 : une graduation écrite (le tick 2 porte −3) prise pour l'origine est jugée ; l'origine est au tick 5
  check((await page.locator('[data-ss-given]:visible').count()) === 2, `${tag} a1 : deux graduations écrites seulement`);
  await press(page, 'ArrowRight', 2);
  await record(page);
  check((await verdict(page)) === 'wrong', `${tag} a1 : une graduation écrite prise pour l'origine est jugée`);
  await press(page, 'ArrowRight', 3);
  await shot('lab-advanced-origin', 400);
  await record(page);
  check((await verdict(page)) === 'right', `${tag} a1 : l'origine au tick 5`);
  await answerCheckpoints(page);
  await clickNext(page);
  await press(page, 'ArrowRight', 6); await record(page);
  await answerCheckpoints(page);
  await clickNext(page);
  // a3 : le cadre d'une foulée ; −1,5 est entre −2 et −1 (pas entre −1 et 0)
  check((await page.locator('[data-ss-frame]:visible').count()) === 1, `${tag} a3 : le cadre d'une foulée`);
  await press(page, 'ArrowLeft', 1); await record(page);
  check((await verdict(page)) === 'wrong', `${tag} a3 : le cadre entre −1 et 0 ne contient pas −1,5 (jugé)`);
  await press(page, 'ArrowLeft', 1);
  await shot('lab-advanced-bound', 400);
  await record(page);
  check((await verdict(page)) === 'right', `${tag} a3 : −1,5 est entre −2 et −1`);

  // « جرّب أعدادك »
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-stride-stamp]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  check((await page.locator('[data-ss-free]:visible').count()) > 0, `${tag} libre : le panneau « جرّب أعدادك » est ouvert`);
  const input = page.locator('[data-ss-free-input]:visible').first();
  if (await input.count()) { await input.fill('-1,5'); await page.waitForTimeout(300); }
  check((await page.locator('[data-ss-free-info]:visible').count()) > 0, `${tag} libre : la droite dit côté, distance, symétrique et encadrement`);
  await shot('lab-free');
  check((await vis(page, '[data-stride-stamp]').getAttribute('data-solved')) === 'false', `${tag} libre : un essai libre n'avance jamais la tâche`);
  check(errors.length === 0, `${tag} aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 2)) : ''}`);
  await ctx.close();
}

await browser.close();
if (failures.length) { console.log(`\n${failures.length} échec(s)`); process.exit(1); }
console.log('\nTout est vert.');
