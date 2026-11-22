// QA — 1AM, unité 5, 3e leçon `talim-fi-mustawi` « التعليم في المستوي » et son labo `courtyard-drone` « مسيّرة الساحة » (cycle moyen phase 3, 2026-10-30)
//
//   KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/1am-talim-fi-mustawi.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, à 768×1024, 1024×768, 1280×800 et 1366×768 (tablette et laptop seulement) :
//   1. le sommaire et CHAQUE module : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » brut / commande LaTeX / clé `manipulation.`, fiche mémo sans chevauchement ;
//   2. le labo مبتدئ b1 : le drone REFUSE la diagonale (touche de l'autre axe, geste qui sort de l'axe) ; l'ordre échangé (−2 ; 3) est JUGÉ, pas corrigé ; (3 ; −2) est juste ; les questions s'ouvrent PAR-DESSUS le labo ;
//   3. b2 : deux points d'un axe (une coordonnée nulle) ; b3 : lire la porte et le kiosque (la pastille lit (x ; y) à la volée) ;
//   4. le labo متقدم a1 : demi-cases ; a2 / a3 : papier SANS carreaux (pas de grille, les deux parallèles en pointillés) ;
//   5. D'UN SEUL REGARD : `[data-cd-glance]` tient dans la largeur et, à 1024×768, dans 760 px de haut, aux DEUX niveaux ;
//   6. « جرّب أعدادك » : un couple libre qui n'est jamais compté.
// Captures dans /tmp/qa-1am-talim-fi-mustawi (ou QA_OUT).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://127.0.0.1:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-1am-talim-fi-mustawi';
const LESSON = '/courses/moyen/1am/ansab_al_aadad_wal_hisab/talim-fi-mustawi';
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
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); localStorage.setItem('sa.labCoach.courtyard-drone.off', '1'); } catch { /* noop */ } }, token);
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
  check(await page.getByText('التعليم في المستوي').first().isVisible().catch(() => false), `${tag} sommaire monté`);
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
  check(await page.getByText('التعليم في المستوي').first().isVisible().catch(() => false), `${tag} sommaire monté`);
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
    const el = [...document.querySelectorAll('[data-cd-glance]')].find((e) => e.offsetHeight > 0);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { h: r.height, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-cd-glance] reste dans la largeur (${box ? `${Math.round(box.h)}px de haut / ${box.vh}` : 'absent'})`);
  return box;
};
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForSelector('[data-cd-glance]', { state: 'attached' });
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
/** Conduit le drone au clavier sur l'axe actif (flèches) puis laisse la scène se redessiner. */
const press = async (page, key, n = 1) => {
  const knob = vis(page, '[data-cd-knob]');
  await knob.focus();
  for (let i = 0; i < n; i += 1) await page.keyboard.press(key);
  await page.waitForTimeout(120);
};
const at = async (page) => { const k = vis(page, '[data-cd-knob]'); return [Number(await k.getAttribute('data-x')), Number(await k.getAttribute('data-y'))]; };
const phase = async (page) => vis(page, '[data-courtyard-drone]').getAttribute('data-phase');
const lock = async (page) => { await vis(page, '[data-cd-lock]').click(); await page.waitForTimeout(150); };
const record = async (page) => { await vis(page, '[data-cd-record]').click(); await page.waitForTimeout(250); };
/** Une lecture complète : x (nombre de touches signées), fixer, y (nombre de touches signées), photo. */
const photo = async (page, xk, yk) => {
  if (xk) await press(page, xk > 0 ? 'ArrowRight' : 'ArrowLeft', Math.abs(xk));
  await lock(page);
  if (yk) await press(page, yk > 0 ? 'ArrowUp' : 'ArrowDown', Math.abs(yk));
  await record(page);
};
/** « المهمة التالية » : on attend qu'elle apparaisse (la fête d'étape et la suite de questions passent d'abord). */
const clickNext = async (page) => { await page.waitForSelector('[data-cd-next]', { state: 'visible', timeout: 15000 }); await vis(page, '[data-cd-next]').click(); await page.waitForTimeout(600); };
const verdict = async (page) => vis(page, '[data-cd-verdict]').getAttribute('data-cd-verdict');
/** Un point de la scène (unités du viewBox 640×442) → pixels de la page. */
const toClient = async (page, vx, vy) => {
  const b = await vis(page, '[data-cd-svg]').boundingBox();
  return { x: b.x + (vx / 640) * b.width, y: b.y + (vy / 442) * b.height };
};

for (const vp of SIZES) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}×${vp.height}`;
  const shot = async (n, wait = 0) => { if (wait) await page.waitForTimeout(wait); await page.locator('[data-cd-glance]:visible').first().evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' })).catch(() => {}); await page.waitForTimeout(120); await page.screenshot({ path: `${OUT}/${n}-${vp.width}x${vp.height}.png` }); };
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-courtyard-drone]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  const bx = await glanceFits(page, `${tag} مبتدئ`);
  check((await phase(page)) === 'x' && (await at(page)).join() === '0,0', `${tag} b1 : le drone part du mât, sur l'axe horizontal`);
  check((await page.locator('[data-cd-thing]:visible').count()) === 0, `${tag} b1 : le lieu à photographier n'est pas dessiné d'avance`);
  await shot('lab-beginner-init');
  // le drone REFUSE la diagonale : une touche de l'autre axe ne le déplace pas
  await press(page, 'ArrowUp', 1);
  check((await at(page)).join() === '0,0' && (await verdict(page)) === 'refused' && (await page.locator('[data-cd-refused]:visible').count()) === 1, `${tag} b1 : ↑ en phase horizontale est REFUSÉ (le drone ne bouge pas)`);
  await shot('lab-beginner-refused');
  // le geste qui sort de l'axe est lui aussi refusé (un glissé vers un lieu en diagonale)
  const target = await toClient(page, 320 + 3 * 46, 222 + 2 * 46);
  const from = await toClient(page, 320, 222);
  await page.mouse.move(from.x, from.y); await page.mouse.down(); await page.mouse.move(target.x, target.y, { steps: 6 }); await page.mouse.up();
  await page.waitForTimeout(150);
  check((await at(page))[1] === 0 && (await verdict(page)) === 'refused', `${tag} b1 : un glissé qui sort de l'axe est refusé : le drone reste sur l'axe horizontal (${(await at(page)).join()})`);
  // le glissé SUR l'axe déplace le drone d'une case par case
  const along = await toClient(page, 320 + 2 * 46, 222);
  await page.mouse.move(from.x, from.y); await page.mouse.down(); await page.mouse.move(along.x, along.y, { steps: 6 }); await page.mouse.up();
  await page.waitForTimeout(150);
  check((await at(page)).join() === '20,0', `${tag} b1 : le glissé sur l'axe horizontal conduit le drone à l'abscisse 2 (${(await at(page)).join()})`);
  await press(page, 'ArrowRight', 1);
  check((await at(page)).join() === '30,0', `${tag} b1 : (3 ; 0) sur l'axe horizontal`);
  check((await page.locator('[data-cd-reading="(3 ; 0)"]:visible').count()) === 1, `${tag} b1 : la pastille lit (3 ; 0) en direct`);
  await shot('lab-beginner-mid');
  // l'ordre échangé : −2 d'abord sur l'axe horizontal puis 3 sur la verticale mène à (−2 ; 3), un AUTRE lieu
  await press(page, 'ArrowLeft', 5);
  await lock(page);
  check((await phase(page)) === 'y', `${tag} b1 : « ثبّت الأفقي » ouvre la phase verticale`);
  await press(page, 'ArrowRight', 1);
  check((await verdict(page)) === 'refused', `${tag} b1 : → en phase verticale est REFUSÉ`);
  await press(page, 'ArrowUp', 3);
  check((await at(page)).join() === '-20,30', `${tag} b1 : (−2 ; 3) (${(await at(page)).join()})`);
  await record(page);
  check((await verdict(page)) === 'wrong', `${tag} b1 : l'ordre échangé est JUGÉ (autre lieu), pas corrigé`);
  check((await page.locator('[data-cd-read="0"][data-state="current"]:visible').count()) === 1, `${tag} b1 : rien n'avance après une photo fausse`);
  await shot('lab-beginner-swap');
  // revenir à l'axe, mettre 3 puis −2
  await vis(page, '[data-cd-unlock]').click(); await page.waitForTimeout(150);
  check((await phase(page)) === 'x' && (await at(page)).join() === '-20,0', `${tag} b1 : « عُد للأفقي » ramène le drone sur l'axe`);
  await photo(page, 5, -2);
  check((await verdict(page)) === 'right', `${tag} b1 : (3 ; −2) est juste`);
  check((await phase(page)) === 'x' && (await at(page)).join() === '0,0', `${tag} b1 : le drone retourne au mât pour la lecture suivante`);
  check((await page.locator('[data-cd-thing="fountain"]:visible').count()) === 1, `${tag} b1 : la fontaine apparaît une fois photographiée`);
  await photo(page, -4, 1);
  await shot('lab-beginner-checkpoint', 2800);
  const questions = await answerCheckpoints(page);
  check(questions >= 2, `${tag} b1 : la suite de questions s'ouvre PAR-DESSUS le labo (${questions} questions)`);
  check((await page.locator('[data-cd-next]:visible').count()) > 0, `${tag} b1 : « المهمة التالية » apparaît après les questions`);
  await shot('lab-beginner-done');
  await clickNext(page);
  // b2 : deux points d'un axe
  await photo(page, 4, 0);
  check((await verdict(page)) === 'right', `${tag} b2 : (4 ; 0) sans aucun mouvement vertical`);
  await photo(page, 0, -3);
  check((await verdict(page)) === 'right', `${tag} b2 : (0 ; −3) sans aucun mouvement horizontal`);
  await answerCheckpoints(page);
  await clickNext(page);
  // b3 : lire — les objets sont dessinés, la cible est entourée
  check((await vis(page, '[data-courtyard-drone]').getAttribute('data-kind')) === 'read', `${tag} b3 : lire`);
  check((await page.locator('[data-cd-thing]:visible').count()) === 2 && (await page.locator('[data-cd-thing][data-state="target"]:visible').count()) === 1, `${tag} b3 : deux objets dessinés, la cible entourée`);
  await press(page, 'ArrowLeft', 3);
  await lock(page);
  await press(page, 'ArrowUp', 2);
  check((await page.locator('[data-cd-reading="(−3 ; 2)"]:visible').count()) === 1, `${tag} b3 : la pastille lit (−3 ; 2) (le signe seulement sous le zéro)`);
  await shot('lab-beginner-read', 2600);
  await record(page);
  check((await verdict(page)) === 'right', `${tag} b3 : la porte est lue`);
  await photo(page, 2, -4);
  await answerCheckpoints(page);

  await pickLevel(page, 'advanced');
  const ax = await glanceFits(page, `${tag} متقدم`);
  await shot('lab-advanced-init');
  if (vp.width === 1024) {
    for (const [lv, b] of [['مبتدئ', bx], ['متقدم', ax]]) {
      console.log(`  ${tag} ${lv} : hauteur de [data-cd-glance] = ${b ? Math.round(b.h) : '?'} px (écran ${vp.height})`);
      check(b && b.h <= 760, `${tag} ${lv} : [data-cd-glance] ≤ 760 px de haut (${b ? Math.round(b.h) : '?'})`);
    }
  }
  // a1 : demi-cases
  check((await page.locator('[data-cd-grid]:visible').count()) === 1, `${tag} a1 : papier quadrillé`);
  await press(page, 'ArrowRight', 3);
  check((await at(page)).join() === '15,0', `${tag} a1 : le pas est une demi-case (1,5)`);
  await lock(page);
  await press(page, 'ArrowDown', 6);
  check((await page.locator('[data-cd-reading="(1,5 ; −3)"]:visible').count()) === 1, `${tag} a1 : la pastille lit (1,5 ; −3)`);
  await record(page);
  check((await verdict(page)) === 'right', `${tag} a1 : le premier objet est lu`);
  await photo(page, -5, 3);
  await answerCheckpoints(page);
  await clickNext(page);
  // a2 : papier SANS carreaux
  check((await vis(page, '[data-courtyard-drone]').getAttribute('data-paper')) === 'plain' && (await page.locator('[data-cd-grid]:visible').count()) === 0, `${tag} a2 : papier sans carreaux`);
  check((await page.locator('[data-cd-guide]').count()) === 1, `${tag} a2 : le drone projette ses parallèles en pointillés`);
  await press(page, 'ArrowLeft', 8); await lock(page); await press(page, 'ArrowUp', 6);
  await shot('lab-advanced-plain', 2600);
  await record(page);
  check((await verdict(page)) === 'right', `${tag} a2 : (−4 ; 3) lu sans carreaux`);
  await photo(page, 7, -4);
  await answerCheckpoints(page);
  await clickNext(page);
  await photo(page, 5, -3);
  check((await verdict(page)) === 'right', `${tag} a3 : (2,5 ; −1,5) photographié sans carreaux`);
  await photo(page, -2, 1);
  const rules = await answerCheckpoints(page);
  check(rules >= 2, `${tag} a3 : la règle clôt le niveau (${rules} questions)`);

  // « جرّب أعدادك »
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-courtyard-drone]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  check((await page.locator('[data-cd-free]:visible').count()) > 0, `${tag} libre : le panneau « جرّب أعدادك » est ouvert`);
  await vis(page, '[data-cd-free-x]').fill('-2');
  await vis(page, '[data-cd-free-y]').fill('3');
  await page.waitForTimeout(300);
  check((await page.locator('[data-cd-free-info]:visible').count()) > 0, `${tag} libre : le plan dit l'échangé (3 ; −2) et l'axe`);
  check((await page.locator('[data-cd-reading="(−2 ; 3)"]:visible').count()) === 1, `${tag} libre : la pastille lit (−2 ; 3)`);
  await shot('lab-free');
  check((await vis(page, '[data-courtyard-drone]').getAttribute('data-solved')) === 'false', `${tag} libre : un essai libre n'avance jamais la tâche`);
  check(errors.length === 0, `${tag} aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 2)) : ''}`);
  await ctx.close();
}

await browser.close();
if (failures.length) { console.log(`\n${failures.length} échec(s)`); process.exit(1); }
console.log('\nTout est vert.');
