// QA — 1AM, unité 6, 2e leçon générée `tatbiq-qaida-harfiya` « تطبيق قاعدة حرفية » et son labo `letter-dial` « قرص الحروف » (cycle moyen phase 3, 2026-10-30)
//
//   KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/1am-tatbiq-qaida-harfiya.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, à 768×1024, 1024×768, 1280×800 et 1366×768 (tablette et laptop seulement) :
//   1. le sommaire et CHAQUE module : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » brut / commande LaTeX / clé `manipulation.`, fiche mémo sans chevauchement ;
//   2. le labo مبتدئ b1 : le cadran tourné À LA SOURIS jusqu'à 12 ne termine rien avant le LÂCHER ; la bande dit « 5 × 12 + 20 → 60 + 20 → 80 » (jamais 512) ; passer par 12 puis lâcher sur 20 ne termine pas ; les questions s'ouvrent PAR-DESSUS le labo ;
//   3. b2 : le cadran lâché sur 15 donne 95 ; b3 : n tombe dans les DEUX fentes (5 × 10 + 20 − 10 = 60) ;
//   4. le labo متقدم : deux cadrans (15 et 8 : 2 × (15 + 8) = 46), les valeurs échangées, puis « a + b = a × b » : (2 ; 2) tient (4 = 4), (3 ; 4) réfute (7 ≠ 12) ;
//   5. D'UN SEUL REGARD : `[data-ld-glance]` tient dans la largeur et, à 1024×768, dans 760 px de haut, aux DEUX niveaux ;
//   6. « جرّب قاعدتك أنت » : une règle libre (« 2x » lu 2 × x, jamais 23) qui n'est jamais comptée.
// Captures dans /tmp/qa-1am-tatbiq-qaida-harfiya (ou QA_OUT).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://127.0.0.1:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-1am-tatbiq-qaida-harfiya';
const LESSON = '/courses/moyen/1am/ansab_al_aadad_wal_hisab/tatbiq-qaida-harfiya';
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
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); localStorage.setItem('sa.labCoach.letter-dial.off', '1'); } catch { /* noop */ } }, token);
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
  check(await page.getByText('تطبيق قاعدة حرفية').first().isVisible().catch(() => false), `${tag} sommaire monté`);
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
    const el = [...document.querySelectorAll('[data-ld-glance]')].find((e) => e.offsetHeight > 0);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { h: r.height, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-ld-glance] reste dans la largeur (${box ? `${Math.round(box.h)}px de haut / ${box.vh}` : 'absent'})`);
  return box;
};
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForSelector('[data-ld-glance]', { state: 'attached' });
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
const task = (page) => vis(page, '[data-letter-dial]').getAttribute('data-task');
const phase = (page) => vis(page, '[data-letter-dial]').getAttribute('data-phase');
/** Tourne un cadran À LA SOURIS : l'aiguille suit le pointeur (angle absolu de −150° à +150°) ; `release` lâche. */
const dialTo = async (page, letter, v, max, release = true) => {
  const el = vis(page, `[data-ld-dial="${letter}"]`);
  await el.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(120);
  const box = await el.boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + (box.height * 82) / 160;
  const r = box.width * 0.34;
  const at = (val) => { const a = ((-150 + (300 * val) / max) * Math.PI) / 180; return [cx + r * Math.sin(a), cy - r * Math.cos(a)]; };
  const [x0, y0] = at(0);
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  const steps = 10;
  for (let i = 1; i <= steps; i += 1) { const [x, y] = at((v * i) / steps); await page.mouse.move(x, y); }
  if (release) { await page.mouse.up(); await page.waitForTimeout(250); }
};
const dialValue = (page, letter) => vis(page, `[data-ld-dial="${letter}"]`).getAttribute('data-value');
const rows = async (page) => (await page.locator('[data-ld-tape]:visible [data-ld-row]').allTextContents()).map((t) => t.replace(/\s+/g, ' ').replace(/[⁦⁩=]/g, '').trim());
const register = (page) => vis(page, '[data-ld-register-text]').textContent();

for (const vp of SIZES) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}×${vp.height}`;
  const shot = async (n, wait = 0) => { if (wait) await page.waitForTimeout(wait); await page.locator('[data-ld-glance]:visible').first().evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' })).catch(() => {}); await page.waitForTimeout(150); await page.screenshot({ path: `${OUT}/${n}-${vp.width}x${vp.height}.png` }); };
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-letter-dial]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  const bx = await glanceFits(page, `${tag} مبتدئ`);
  await shot('lab-beginner-init');
  check((await task(page)) === 'b1' && (await dialValue(page, 'n')) === '0', `${tag} b1 : le cadran de n est à 0`);
  // le cadran est tourné à 12 SANS être lâché : rien n'est terminé, la bande montre 5 × 12 + 20
  await dialTo(page, 'n', 12, 30, false);
  check((await dialValue(page, 'n')) === '12', `${tag} b1 : la souris amène le cadran à 12`);
  const live = await rows(page);
  check(live[0]?.replace(/\s/g, '') === '5×12+20' && live.at(-1)?.replace(/\s/g, '') === '80', `${tag} b1 : la valeur tombe dans la fente : « ${live.join(' → ')} » (jamais 512)`);
  check((await phase(page)) === 'turn', `${tag} b1 : avant le LÂCHER la tâche n'est pas terminée`);
  await shot('lab-beginner-mid');
  await page.mouse.up();
  await page.waitForTimeout(300);
  check((await phase(page)) === 'done', `${tag} b1 : lâché sur 12, la tâche est faite`);
  check((await register(page)).replace(/[⁦⁩\s]/g, '') === '80', `${tag} b1 : l'écran de la caisse affiche 80`);
  const questions = await answerCheckpoints(page);
  check(questions >= 2, `${tag} b1 : la suite de questions s'ouvre PAR-DESSUS le labo (${questions} questions)`);
  check((await page.locator('[data-ld-next]:visible').count()) > 0, `${tag} b1 : « المهمة التالية » apparaît après les questions`);
  await shot('lab-beginner-done');
  await vis(page, '[data-ld-next]').click();
  await page.waitForTimeout(500);
  // b2 : passer par 15 puis lâcher sur 20 ne termine pas ; lâcher sur 15 donne 95
  await dialTo(page, 'n', 20, 30);
  check((await task(page)) === 'b2' && (await phase(page)) === 'turn', `${tag} b2 : lâché sur 20 (le client n'a pas payé 100) la tâche reste ouverte`);
  check(((await vis(page, '[data-ld-verdict]').textContent()) ?? '').includes('أكثر'), `${tag} b2 : la carte dit que 120 est plus que 95 sans dire la valeur`);
  await dialTo(page, 'n', 15, 30);
  check((await phase(page)) === 'done' && (await register(page)).replace(/[⁦⁩\s]/g, '') === '95', `${tag} b2 : lâché sur 15, la carte affiche 95`);
  await answerCheckpoints(page);
  await vis(page, '[data-ld-next]').click();
  await page.waitForTimeout(500);
  // b3 : n tombe dans les DEUX fentes
  await dialTo(page, 'n', 10, 30, false);
  const slots = await page.locator('[data-ld-tape]:visible [data-ld-row="0"] [data-ld-slot][data-filled="true"]').count();
  check(slots === 2, `${tag} b3 : la valeur tombe dans les DEUX fentes de n (${slots})`);
  const r3 = await rows(page);
  check(r3.at(-1)?.replace(/\s/g, '') === '60', `${tag} b3 : « ${r3.join(' → ')} » donne 60`);
  await page.mouse.up();
  await page.waitForTimeout(300);
  check((await phase(page)) === 'done', `${tag} b3 : tâche faite`);
  await shot('lab-beginner-promo');
  await answerCheckpoints(page);
  // clavier : une flèche tourne d'un cran (après « إعادة » ... on la teste sur le niveau متقدم)

  await pickLevel(page, 'advanced');
  const ax = await glanceFits(page, `${tag} متقدم`);
  await shot('lab-advanced-init');
  if (vp.width === 1024) {
    for (const [lv, b] of [['مبتدئ', bx], ['متقدم', ax]]) {
      console.log(`  ${tag} ${lv} : hauteur de [data-ld-glance] = ${b ? Math.round(b.h) : '?'} px (écran ${vp.height})`);
      check(b && b.h <= 760, `${tag} ${lv} : [data-ld-glance] ≤ 760 px de haut (${b ? Math.round(b.h) : '?'})`);
    }
  }
  // a1 : deux cadrans, 15 et 8 → 2 × (15 + 8) = 46
  await dialTo(page, 'a', 15, 30);
  await dialTo(page, 'b', 8, 30, false);
  const r4 = await rows(page);
  check(r4.length === 3 && r4.at(-1)?.replace(/\s/g, '') === '46', `${tag} a1 : « ${r4.join(' → ')} » (les parenthèses d'abord)`);
  await shot('lab-advanced-mid');
  await page.mouse.up();
  await page.waitForTimeout(300);
  check((await phase(page)) === 'done', `${tag} a1 : tâche faite`);
  await answerCheckpoints(page);
  await vis(page, '[data-ld-next]').click();
  await page.waitForTimeout(500);
  // clavier : les flèches tournent d'un cran, PageUp de cinq
  await vis(page, '[data-ld-dial="a"]').focus();
  await page.keyboard.press('ArrowUp');
  check((await dialValue(page, 'a')) === '1', `${tag} a2 : la flèche haut tourne le cadran d'un cran`);
  await page.keyboard.press('PageUp');
  check((await dialValue(page, 'a')) === '6', `${tag} a2 : PageUp tourne de cinq crans`);
  await dialTo(page, 'a', 8, 30);
  await dialTo(page, 'b', 15, 30);
  check((await phase(page)) === 'done' && (await register(page)).replace(/[⁦⁩\s]/g, '') === '46', `${tag} a2 : les valeurs échangées donnent encore 46`);
  await answerCheckpoints(page);
  await vis(page, '[data-ld-next]').click();
  await page.waitForTimeout(500);
  // a3 : « a + b = a × b » : (2 ; 2) tient, (3 ; 4) réfute
  check((await vis(page, '[data-ld-compare]').getAttribute('data-eq')) === 'true', `${tag} a3 : au départ (2 ; 2) le comparateur affiche = (4 = 4)`);
  await shot('lab-advanced-claim-init');
  await dialTo(page, 'a', 2, 12);
  check((await phase(page)) === 'turn', `${tag} a3 : (2 ; 2) ne réfute rien : la tâche reste ouverte`);
  await dialTo(page, 'a', 3, 12);
  await dialTo(page, 'b', 4, 12, false);
  check((await vis(page, '[data-ld-compare]').getAttribute('data-eq')) === 'false', `${tag} a3 : (3 ; 4) le comparateur affiche ≠ (7 ≠ 12)`);
  await shot('lab-advanced-claim-mid');
  await page.mouse.up();
  await page.waitForTimeout(300);
  check((await phase(page)) === 'done', `${tag} a3 : UN contre-exemple termine la tâche`);
  const nQ = await answerCheckpoints(page);
  check(nQ >= 3, `${tag} a3 : les trois questions (une valeur suffit ? ; une valeur qui tient ? ; la règle) (${nQ})`);
  await shot('lab-advanced-claim-done', 400);

  // « جرّب قاعدتك أنت »
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-letter-dial]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  check((await page.locator('[data-ld-free]:visible').count()) > 0, `${tag} libre : le panneau « جرّب قاعدتك أنت » est ouvert`);
  await vis(page, '[data-ld-free-input]').fill('2x');
  await page.waitForTimeout(300);
  check((await vis(page, '[data-letter-dial]').getAttribute('data-task')) === 'free', `${tag} libre : la règle libre ouvre le mode libre`);
  await vis(page, '[data-ld-free-dial="x"]').focus();
  await page.keyboard.press('PageUp');
  await page.waitForTimeout(250);
  const fr = await rows(page);
  check(fr[0]?.replace(/\s/g, '') === '2×5' && fr.at(-1)?.replace(/\s/g, '') === '10', `${tag} libre : « 2x » est lu 2 × x : « ${fr.join(' → ')} » (jamais 25)`);
  await shot('lab-free');
  check((await vis(page, '[data-letter-dial]').getAttribute('data-solved')) === 'false', `${tag} libre : un essai libre n'avance jamais la tâche`);
  check(errors.length === 0, `${tag} aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 2)) : ''}`);
  await ctx.close();
}

await browser.close();
if (failures.length) { console.log(`\n${failures.length} échec(s)`); process.exit(1); }
console.log('\nTout est vert.');
