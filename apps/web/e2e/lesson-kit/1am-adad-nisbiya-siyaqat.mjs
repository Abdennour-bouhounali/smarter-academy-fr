// QA — 1AM, unité 5, 1re leçon `adad-nisbiya-siyaqat` « الأعداد النسبية وسياقات استعمالها » et son labo `frost-gauge` « ميزان الصقيع » (cycle moyen phase 3, 2026-10-30)
//
//   KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/1am-adad-nisbiya-siyaqat.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, à 768×1024, 1024×768, 1280×800 et 1366×768 (tablette et laptop seulement) :
//   1. le sommaire et CHAQUE module : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » brut / commande LaTeX / clé `manipulation.`, fiche mémo sans chevauchement ;
//   2. le labo مبتدئ b1 : une lecture enregistrée fausse est JUGÉE (la carte « presque »), les cinq lectures justes ouvrent la suite de questions PAR-DESSUS le labo ;
//   3. b3 : l'ombre du niveau est dessinée de l'autre côté du zéro à la même distance ;
//   4. le labo متقدم a1 : deux lectures à 6 du zéro, la seconde identique à la première est refusée ;
//   5. D'UN SEUL REGARD : `[data-fg-glance]` tient dans la largeur et, à 1024×768, dans 700 px de haut, aux DEUX niveaux ;
//   6. « جرّب أعدادك » : un nombre libre qui n'est jamais compté.
// Captures dans /tmp/qa-1am-adad-nisbiya-siyaqat (ou QA_OUT).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://127.0.0.1:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-1am-adad-nisbiya-siyaqat';
const LESSON = '/courses/moyen/1am/ansab_al_aadad_wal_hisab/adad-nisbiya-siyaqat';
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
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); localStorage.setItem('sa.labCoach.frost-gauge.off', '1'); } catch { /* noop */ } }, token);
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
  check(await page.getByText('الأعداد النسبية وسياقات استعمالها').first().isVisible().catch(() => false), `${tag} sommaire monté`);
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
    const el = [...document.querySelectorAll('[data-fg-glance]')].find((e) => e.offsetHeight > 0);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { h: r.height, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-fg-glance] reste dans la largeur (${box ? `${Math.round(box.h)}px de haut / ${box.vh}` : 'absent'})`);
  return box;
};
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForSelector('[data-fg-glance]', { state: 'attached' });
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
/** Amène le niveau à la graduation `g` au clavier (flèches sur le curseur), puis enregistre. */
const setLevel = async (page, g) => {
  const knob = vis(page, '[data-fg-knob]');
  await knob.focus();
  const now = Number(await knob.getAttribute('data-grad'));
  const key = g > now ? 'ArrowUp' : 'ArrowDown';
  for (let i = 0; i < Math.abs(g - now); i += 1) await page.keyboard.press(key);
  await page.waitForTimeout(120);
};
const record = async (page) => { await vis(page, '[data-fg-record]').click(); await page.waitForTimeout(250); };

for (const vp of SIZES) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}×${vp.height}`;
  const shot = async (n, wait = 0) => { if (wait) await page.waitForTimeout(wait); await page.locator('[data-fg-glance]:visible').first().evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' })).catch(() => {}); await page.waitForTimeout(150); await page.screenshot({ path: `${OUT}/${n}-${vp.width}x${vp.height}.png` }); };
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-frost-gauge]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  const bx = await glanceFits(page, `${tag} مبتدئ`);
  await shot('lab-beginner-init');
  // b1 : la première lecture demande 5 ; on enregistre 2 → jugée, rien n'avance
  await setLevel(page, 2);
  await shot('lab-beginner-mid');
  await record(page);
  check((await vis(page, '[data-fg-verdict]').getAttribute('data-fg-verdict')) === 'wrong', `${tag} b1 : une lecture fausse est JUGÉE (pas corrigée)`);
  check((await page.locator('[data-fg-read="0"]:visible').first().getAttribute('data-state')) === 'current', `${tag} b1 : la lecture reste en cours après un refus`);
  await shot('lab-beginner-wrong');
  for (const g of [5, -2, -3, 0, 2]) { await setLevel(page, g); await record(page); }
  const questions = await answerCheckpoints(page);
  check(questions >= 3, `${tag} b1 : la suite de questions s'ouvre PAR-DESSUS le labo (${questions} questions)`);
  check((await page.locator('[data-fg-next]:visible').count()) > 0, `${tag} b1 : « المهمة التالية » apparaît après les questions`);
  await shot('lab-beginner-done');
  await vis(page, '[data-fg-next]').click();
  await page.waitForTimeout(600);
  check((await vis(page, '[data-frost-gauge]').getAttribute('data-scene')) === 'altitude', `${tag} b2 : le décor d'altitude`);
  await shot('lab-beginner-altitude', 2600);
  for (const g of [-4, 3, 0]) { await setLevel(page, g); await record(page); }
  await answerCheckpoints(page);
  await vis(page, '[data-fg-next]').click();
  await page.waitForTimeout(600);
  await setLevel(page, -4);
  check((await page.locator('[data-fg-shadow]:visible').count()) > 0, `${tag} b3 : l'ombre du niveau est dessinée`);
  const sh = await vis(page, '[data-fg-shadow]').getAttribute('data-fg-shadow');
  check(sh === '4', `${tag} b3 : à −4 l'ombre lit 4 (${sh})`);
  await shot('lab-beginner-mirror', 2600);

  await pickLevel(page, 'advanced');
  const ax = await glanceFits(page, `${tag} متقدم`);
  await shot('lab-advanced-init');
  if (vp.width === 1024) {
    for (const [lv, b] of [['مبتدئ', bx], ['متقدم', ax]]) {
      console.log(`  ${tag} ${lv} : hauteur de [data-fg-glance] = ${b ? Math.round(b.h) : '?'} px (écran ${vp.height})`);
      check(b && b.h <= 700, `${tag} ${lv} : [data-fg-glance] ≤ 700 px de haut (${b ? Math.round(b.h) : '?'}) : un seul écran`);
    }
  }
  // a1 : deux lectures à 6 du zéro (pas 2 : 3 graduations) ; la seconde identique à la première est refusée
  await setLevel(page, 3); await record(page);
  await setLevel(page, 3); await record(page);
  check((await vis(page, '[data-fg-verdict]').getAttribute('data-fg-verdict')) === 'wrong', `${tag} a1 : la même lecture deux fois est refusée`);
  await setLevel(page, -3); await record(page);
  await shot('lab-advanced-pair', 2600);
  await answerCheckpoints(page);
  await vis(page, '[data-fg-next]').click();
  await page.waitForTimeout(600);
  check((await vis(page, '[data-frost-gauge]').getAttribute('data-scene')) === 'floors', `${tag} a2 : le décor des étages`);
  await shot('lab-advanced-floors', 2600);

  // « جرّب أعدادك »
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-frost-gauge]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  check((await page.locator('[data-fg-free]:visible').count()) > 0, `${tag} libre : le panneau « جرّب أعدادك » est ouvert`);
  const input = page.locator('[data-fg-free-input]:visible').first();
  if (await input.count()) { await input.fill('-4'); await page.waitForTimeout(300); }
  check((await page.locator('[data-fg-free-info]:visible').count()) > 0, `${tag} libre : la jauge dit côté, distance et opposé`);
  await shot('lab-free');
  check((await vis(page, '[data-frost-gauge]').getAttribute('data-solved')) === 'false', `${tag} libre : un essai libre n'avance jamais la tâche`);
  check(errors.length === 0, `${tag} aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 2)) : ''}`);
  await ctx.close();
}

await browser.close();
if (failures.length) { console.log(`\n${failures.length} échec(s)`); process.exit(1); }
console.log('\nTout est vert.');
