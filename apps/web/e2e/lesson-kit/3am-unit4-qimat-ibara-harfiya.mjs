// QA — 3AM, unité 4 « الحساب الحرفي », leçon `qimat-ibara-harfiya` « حساب قيمة عبارة حرفية » et son labo `marble-run`
// (cycle moyen, phase 3, Phase 0 « priorité du propriétaire », 2026-10-26 — la troisième leçon de l'unité).
//
//   KIT_BASE=http://localhost:5173 QA_STUB=1 node apps/web/e2e/lesson-kit/3am-unit4-qimat-ibara-harfiya.mjs
//   QA_STUB=1 : sans API — les appels /api/v1 sont simulés (enveloppe réelle { success, user } pour /auth/me), un enseignant factice.
//   SHOTS=1   : écrit les captures du labo (état initial, refus `fused`, refus `unbracketed`, prédiction, `twins`, règle) dans QA_OUT.
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (768×1024, 1024×768, 1280×800, 1366×768) :
//   1. le sommaire et CHAQUE module à 768 et 1280 px : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » brut, RTL ;
//   2. guide §4quater : rien au-dessus du labo au module 1, le labo avant la première question, les briques ABSENTES avant la réponse ;
//   3. le labo au POINTEUR (glisser une bille au réservoir) et au CLAVIER / toucher-toucher : r1 (le × manquant → 43 → refus `fused`, la presse allumée,
//      puis la ligne juste), r2 (refus `syntax`), r3 (refus `unbracketed` : la copieuse allumée, 2 contre 10), la découverte, « جرّب أعدادك »,
//      متقدم (la prédiction avant le lancement, deux réservoirs, une bille dans le mauvais réservoir est un essai libre), le monde `twins` (le
//      contre-exemple refusé à 0, accepté à 1 ; « متساويتان » refusé avant « انشر », accepté après) ;
//   4. le bloc `[data-mr-glance]` : la consigne, le mur, la ligne et la glissière tiennent dans la hauteur de l'écran aux quatre tailles ;
//   5. les identifiants de pas du guide (LabCoach) : rack → slots → times → run.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-3am-qimat';
const STUB = !!process.env.QA_STUB;
const SHOTS = !!process.env.SHOTS;
const CH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/qimat-ibara-harfiya`;
const UNIT = `${CH}/units/ibarat-harfiya-3`;
const MODULES = ['astaidd', 'nashat', 'maarif', 'tariqa', 'atamarran', 'masala-1', 'masala-2', 'masala-3', 'itqan'];
mkdirSync(OUT, { recursive: true });

const failures = [];
const check = (ok, label) => { if (!ok) failures.push(label); console.log(`${ok ? '✓' : '✗'} ${label}`); };

async function loginToken(who, tries = 8) {
  if (STUB) return 'qa-fake-token';
  const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(who) });
  const data = await res.json().catch(() => ({}));
  const token = data.token ?? data.access_token ?? data.data?.token;
  if (!token && res.status === 429 && tries > 0) { await new Promise((r) => setTimeout(r, 15000)); return loginToken(who, tries - 1); }
  if (!token) throw new Error(`login ${who.email}: ${res.status}`);
  return token;
}

async function contextFor(browser, token, viewport, { coachOff = true } = {}) {
  const ctx = await browser.newContext({ viewport, locale: 'ar' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  if (STUB) {
    const user = { id: 9102, role: 'teacher', firstName: 'أمينة', lastName: 'سعدي', email: 'qa-prof@example.dz', emailVerified: true, emailVerifiedAt: '2026-01-01' };
    await ctx.route(/\/api\/v1\//, (route) => {
      const body = route.request().url().includes('/auth/me') ? { success: true, user } : { success: true, data: [] };
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
  }
  await ctx.addInitScript(([tk, off]) => { try { localStorage.setItem('token', tk); if (off) localStorage.setItem('sa.labCoach.marble-run.off', '1'); } catch { /* noop */ } }, [token, coachOff]);
  return ctx;
}

const RAW = /(^|[^\\])\$[^$\s][^$]*\$|\\(frac|times|mathrm|sqrt|neq|approx|div|pi)\b|manipulation\.[a-zA-Z]+\./;

async function pageHealth(page, label) {
  const { overflow, raw, dir } = await page.evaluate((re) => {
    const rx = new RegExp(re);
    const doc = document.documentElement;
    const bad = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode; const el = n.parentElement;
      if (!el || el.closest('script,style,.katex-mathml,[aria-hidden="true"]') || el.closest('[hidden]')) continue;
      if (rx.test(n.textContent)) bad.push(n.textContent.trim().slice(0, 80));
    }
    return { overflow: doc.scrollWidth - doc.clientWidth, raw: bad.slice(0, 3), dir: document.documentElement.dir || document.body.dir };
  }, RAW.source);
  check(overflow <= 1, `${label}: pas de débordement horizontal (${overflow}px)`);
  check(raw.length === 0, `${label}: aucun texte brut ${raw.length ? JSON.stringify(raw) : ''}`);
  check(dir === 'rtl', `${label}: page RTL`);
}

async function goto(page, url) {
  try { await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }); } catch (e) { if (!/Timeout/.test(String(e))) throw e; await page.waitForLoadState('load'); }
  await page.waitForTimeout(900);
}
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForTimeout(500);
};
const vis = (page, sel) => page.locator(`${sel}:visible`).first();
const scrollTo = (page, sel) => vis(page, sel).evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
const lab = (page) => page.locator('[data-marble-run]:visible').first();
const banner = async (page) => ({ reason: await page.locator('[data-mr-banner]:visible').first().getAttribute('data-mr-refused').catch(() => null), text: (await page.locator('[data-mr-banner]:visible').first().textContent().catch(() => '')) ?? '' });
const waitRun = async (page) => { await page.waitForFunction(() => [...document.querySelectorAll('[data-marble-run]')].find((e) => e.offsetParent !== null)?.getAttribute('data-running') === 'false', null, { timeout: 8000 }); await page.waitForTimeout(150); };
const task = (page) => lab(page).getAttribute('data-task');
const shot = async (page, name, w) => { if (SHOTS) await page.locator('[data-manipulation="marble-run"]:visible').first().screenshot({ path: `${OUT}/${name}-${w}.png` }); };

/** Tap-tap : la bille puis le réservoir. */
async function dropMarble(page, id, letter = 'x') {
  await scrollTo(page, '[data-mr-rack]');
  await vis(page, `[data-mr-marble="${id}"]`).click();
  await vis(page, `[data-mr-reservoir="${letter}"]`).click();
  await page.waitForTimeout(120);
}
/** Le glisser au pointeur : la bille jusqu'au réservoir. */
async function dragMarble(page, id, letter = 'x') {
  await scrollTo(page, '[data-mr-rack]');
  const m = await vis(page, `[data-mr-marble="${id}"]`).boundingBox();
  const r = await vis(page, `[data-mr-reservoir="${letter}"]`).boundingBox();
  await page.mouse.move(m.x + m.width / 2, m.y + m.height / 2);
  await page.mouse.down();
  await page.mouse.move(m.x + m.width / 2 + 10, m.y + m.height / 2 - 20, { steps: 3 });
  await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(150);
}
const run = async (page) => { await scrollTo(page, '[data-mr-run]'); await vis(page, '[data-mr-run]').click(); await waitRun(page); };
const slot = (page, i) => vis(page, `[data-mr-slot="${i}"]`);
const times = (page, i) => vis(page, `[data-mr-times="${i}"]`);

const browser = await chromium.launch();
const token = await loginToken(TEACHER);

// 1 + 2 — sommaire, modules ; rien au-dessus du labo ; briques absentes avant la réponse.
for (const vp of process.env.LAB_ONLY ? [] : [{ width: 1280, height: 800 }, { width: 768, height: 1024 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}px`;

  await goto(page, `${BASE}${UNIT}`);
  check(await page.getByText('حساب قيمة عبارة حرفية').first().isVisible().catch(() => false), `${tag} page d'unité : la leçon est listée`);
  await pageHealth(page, `${tag} unité`);
  await goto(page, `${BASE}${LESSON}`);
  check(await page.locator('main').first().isVisible(), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);

  for (const slug of MODULES) {
    await goto(page, `${BASE}${LESSON}/${slug}`);
    check(await page.locator('main, [data-module-layout], h1').first().isVisible().catch(() => false), `${tag} ${slug} monté`);
    await pageHealth(page, `${tag} ${slug}`);
    if (slug === 'nashat') {
      const order = await page.evaluate(() => {
        const labEl = document.querySelector('[data-marble-run]');
        const ctxEl = document.querySelector('[data-lab-context]');
        const q = document.querySelector('[data-lab-question]');
        const firstQ = document.querySelector('[data-activity-evidence]');
        const pos = (e) => (e ? e.getBoundingClientRect().top + window.scrollY : null);
        return { lab: pos(labEl), ctx: pos(ctxEl), q: pos(q), firstQ: pos(firstQ), bricks: document.querySelectorAll('[data-knowledge-brick]').length };
      });
      check(order.ctx != null && order.q != null && order.ctx < order.q, `${tag} nashat : le contexte précède la question du labo`);
      check(order.firstQ == null || order.firstQ > order.lab, `${tag} nashat : la première question suit le labo`);
      check(order.bricks === 0, `${tag} nashat : aucune brique avant la réponse`);
    }
    if (slug === 'maarif') check((await page.locator('[data-knowledge-brick]').count()) === 0, `${tag} maarif : aucune brique avant la réponse`);
    if (slug === 'tariqa') check((await page.locator('[data-marble-run][data-world="twins"]').count()) === 1, `${tag} tariqa : le labo en monde twins ouvre le module`);
  }
  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 3 — le labo à chaque taille (tablette et ordinateur).
for (const vp of [{ width: 1024, height: 768 }, { width: 1280, height: 800 }, { width: 1366, height: 768 }, { width: 768, height: 1024 }]) {
  const w = vp.width;
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${w}×${vp.height}`;
  await goto(page, `${BASE}${LESSON}/nashat`);
  await scrollTo(page, '[data-marble-run]');
  check((await task(page)) === 'r1', `${tag} le labo s'ouvre sur r1`);
  check((await page.locator('[data-mr-rack]:visible [data-mr-marble]').count()) === 11, `${tag} le râtelier porte 11 billes (−5 … 5)`);
  check(await vis(page, '[data-mr-run]').isDisabled(), `${tag} la glissière est inerte tant que la lettre n'a pas de bille`);
  check((await vis(page, '[data-mr-free]').count()) === 1, `${tag} « جرّب أعدادك » est ouvert`);
  await shot(page, 'initial', w);

  // d'un seul regard : la consigne, le mur, la ligne, la bannière, le râtelier et la glissière tiennent dans l'écran
  const core = await page.evaluate(() => {
    const g = [...document.querySelectorAll('[data-mr-glance]')].find((e) => e.offsetParent !== null);
    const rack = g.querySelector('[data-mr-rack]');
    const runBtn = g.querySelector('[data-mr-run]');
    const top = g.getBoundingClientRect().top;
    return { height: Math.round(runBtn.getBoundingClientRect().bottom - top), vh: window.innerHeight, rackBottom: Math.round(rack.getBoundingClientRect().bottom - top) };
  });
  check(core.height <= core.vh - 40, `${tag} d'un seul regard : de la consigne à la glissière ${core.height}px ≤ écran ${core.vh}px`);

  // r1 au pointeur : sans × le lecteur lit 43 + 7 = 50, la presse est allumée ; avec × la ligne est juste
  await dragMarble(page, '3');
  check((await vis(page, '[data-mr-reservoir="x"]').getAttribute('data-filled')) === 'true', `${tag} r1 : la bille glissée tombe dans le réservoir`);
  check((await slot(page, 0).textContent()).includes('3'), `${tag} r1 : la case de x porte le 3`);
  await run(page);
  let b = await banner(page);
  check(b.reason === 'fused' && b.text.includes('43'), `${tag} r1 : refus « fused » dit 43`);
  check((await page.locator('[data-mr-station][data-lit="true"]:visible').getAttribute('data-op')) === 'mul', `${tag} r1 : la presse est allumée`);
  check((await page.locator('[data-mr-reader-value]:visible').textContent()).includes('50'), `${tag} r1 : le lecteur lit 50`);
  await shot(page, 'fused', w);
  await times(page, 0).click();
  await run(page);
  b = await banner(page);
  check((await lab(page).getAttribute('data-solved')) === 'true' && b.reason === null, `${tag} r1 : × écrit, la ligne est acceptée`);
  check((await vis(page, '[data-mr-basket]').getAttribute('data-value')).includes('19'), `${tag} r1 : la corbeille dit 19`);

  // r2 : sans parenthèses, deux signes côte à côte (syntax) ; avec, −1
  await vis(page, '[data-mr-next]').click();
  check((await task(page)) === 'r2', `${tag} « التالي » mène à r2`);
  await dropMarble(page, '-2');
  await times(page, 0).click();
  await run(page);
  check((await banner(page)).reason === 'syntax', `${tag} r2 : × −2 sans parenthèses est refusé (syntax)`);
  await slot(page, 0).click();
  await run(page);
  check((await lab(page).getAttribute('data-solved')) === 'true', `${tag} r2 : les parenthèses font accepter la ligne`);

  // r3 : la copieuse
  await vis(page, '[data-mr-next]').click();
  check((await task(page)) === 'r3', `${tag} r3`);
  await dropMarble(page, '-2');
  await times(page, 1).click();
  await slot(page, 1).click();
  await run(page);
  b = await banner(page);
  check(b.reason === 'unbracketed' && b.text.includes('−4'), `${tag} r3 : refus « unbracketed » (le carré lu −4)`);
  check((await page.locator('[data-mr-station][data-lit="true"]:visible').getAttribute('data-op')) === 'pow', `${tag} r3 : la copieuse est allumée`);
  check((await page.locator('[data-mr-reader-value]:visible').textContent()).includes('2'), `${tag} r3 : le lecteur lit 2`);
  await shot(page, 'unbracketed', w);
  await slot(page, 0).click();
  await run(page);
  check((await lab(page).getAttribute('data-solved')) === 'true' && (await vis(page, '[data-mr-basket]').getAttribute('data-value')).includes('10'), `${tag} r3 : parenthèses → 10`);
  // la découverte s'ouvre après les trois tâches et un essai sans parenthèses
  check((await page.locator('[data-manipulation-discovery]:visible').count()) === 1, `${tag} la découverte s'ouvre (3 tâches + un essai nu)`);
  await vis(page, '[data-manipulation-discovery] button').evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.locator('[data-manipulation-discovery]:visible button').nth(0).click();
  check((await page.locator('[data-manipulation-discovery]:visible').textContent()).includes('2'), `${tag} la découverte : le mauvais choix est réfuté par SA course (2 / 10)`);
  await page.locator('[data-manipulation-discovery]:visible button').nth(1).click();
  await page.waitForTimeout(300);
  check((await page.locator('[data-mr-formal]:visible').count()) === 1, `${tag} la règle formelle s'écrit après le bon choix`);
  await shot(page, 'formal', w);

  // « جرّب أعدادك » : une carte, une bille libre, jamais une tâche
  await vis(page, '[data-mr-free-card="x²+1"]').click();
  check((await task(page)) === 'custom', `${tag} libre : la carte ouvre le monde libre`);
  await dropMarble(page, '-3');
  await slot(page, 0).click();
  await run(page);
  check((await banner(page)).reason === null, `${tag} libre : (−3)² + 1 est accepté`);
  check((await vis(page, '[data-mr-basket]').getAttribute('data-value')).includes('10'), `${tag} libre : la corbeille dit 10`);

  // متقدم : prédiction avant le lancement ; deux réservoirs
  await goto(page, `${BASE}${LESSON}/nashat`);
  await pickLevel(page, 'advanced');
  check((await task(page)) === 'r4', `${tag} متقدم s'ouvre sur r4`);
  await dropMarble(page, '-3');
  check(await vis(page, '[data-mr-run]').isDisabled(), `${tag} متقدم : la glissière attend la prédiction`);
  await vis(page, '[data-mr-predict-num]').fill('23');
  await vis(page, '[data-mr-predict-commit]').click();
  await shot(page, 'predict', w);
  await times(page, 0).click();
  await slot(page, 0).click();
  await run(page);
  check((await lab(page).getAttribute('data-solved')) === 'true', `${tag} متقدم r4 : ligne juste (−13)`);
  check((await page.locator('[data-mr-predict-result="wrong"]:visible').count()) === 1, `${tag} متقدم r4 : la prédiction 23 (piège −3²) est dite fausse sans bloquer`);
  check((await page.locator('[data-mr-station]:visible [data-mr-chip]').first().textContent()).includes('×'), `${tag} متقدم : les puces apparaissent après la course`);
  await vis(page, '[data-mr-next]').click();
  check((await task(page)) === 'r5', `${tag} r5`);
  await dropMarble(page, '-1/2');
  await vis(page, '[data-mr-predict-sign]').click();
  await vis(page, '[data-mr-predict-num]').fill('4');
  await vis(page, '[data-mr-predict-commit]').click();
  await times(page, 0).click();
  await slot(page, 0).click();
  await run(page);
  check((await lab(page).getAttribute('data-solved')) === 'true', `${tag} r5 : 6 × (−1/2) − 1 = −4`);
  await vis(page, '[data-mr-next]').click();
  check((await task(page)) === 'r6' && (await page.locator('[data-mr-reservoir]:visible').count()) === 2, `${tag} r6 : deux réservoirs`);
  await dropMarble(page, '4', 'x');
  await dropMarble(page, '-1', 'y');
  await vis(page, '[data-mr-predict-sign]').click();
  await vis(page, '[data-mr-predict-num]').fill('11');
  await vis(page, '[data-mr-predict-commit]').click();
  await times(page, 0).click(); await times(page, 1).click(); await slot(page, 1).click();
  await run(page);
  check((await lab(page).getAttribute('data-solved')) === 'false' && (await vis(page, '[data-mr-basket]').getAttribute('data-value')).includes('14'), `${tag} r6 : x = 4, y = −1 : essai libre (14), la tâche reste ouverte`);
  await dropMarble(page, '-1', 'x'); await dropMarble(page, '4', 'y');
  await vis(page, '[data-mr-predict-sign]').click();
  await vis(page, '[data-mr-predict-num]').fill('11');
  await vis(page, '[data-mr-predict-commit]').click();
  await slot(page, 1).click(); // y : parenthèses retirées (positif) — la ligne reste lisible
  await slot(page, 0).click(); // x : parenthèses
  await run(page);
  check((await lab(page).getAttribute('data-solved')) === 'true', `${tag} r6 : x = −1, y = 4 → −11`);

  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 3bis — le monde `twins` (module 3), à deux tailles.
for (const vp of [{ width: 1280, height: 800 }, { width: 1024, height: 768 }]) {
  const w = vp.width;
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `twins ${w}`;
  await goto(page, `${BASE}${LESSON}/tariqa`);
  await scrollTo(page, '[data-marble-run]');
  check((await task(page)) === 'tw1', `${tag} s'ouvre sur tw1`);
  await dropMarble(page, '0');
  await vis(page, '[data-mr-claim="counter"]').click();
  check((await banner(page)).reason === 'same', `${tag} tw1 : à 0 les deux corbeilles disent 6 — pas un contre-exemple`);
  await vis(page, '[data-mr-claim="equal"]').click();
  check((await banner(page)).reason === 'notenough', `${tag} tw1 : « متساويتان » refusé avant « انشر »`);
  await dropMarble(page, '1');
  await shot(page, 'twins', w);
  await vis(page, '[data-mr-claim="counter"]').click();
  check((await lab(page).getAttribute('data-solved')) === 'true', `${tag} tw1 : à 1 (12 et 7) le contre-exemple est accepté`);
  await vis(page, '[data-mr-next]').click();
  check((await task(page)) === 'tw2', `${tag} tw2`);
  await dropMarble(page, '0'); await dropMarble(page, '1');
  await vis(page, '[data-mr-claim="counter"]').click();
  check((await banner(page)).reason === 'same', `${tag} tw2 : égales en 0 et en 1`);
  await dropMarble(page, '2');
  await vis(page, '[data-mr-claim="counter"]').click();
  check((await lab(page).getAttribute('data-solved')) === 'true', `${tag} tw2 : à 2 (10 et 8) le contre-exemple est accepté`);
  await vis(page, '[data-mr-next]').click();
  check((await task(page)) === 'tw3', `${tag} tw3`);
  for (const m of ['-3', '-2', '-1', '0', '1', '2', '3']) {
    await dropMarble(page, m);
    const same = await page.locator('[data-mr-twin="a"] [data-mr-basket]').getAttribute('data-value') === await page.locator('[data-mr-twin="b"] [data-mr-basket]').getAttribute('data-value');
    if (!same) check(false, `${tag} tw3 : les corbeilles diffèrent à ${m}`);
  }
  await vis(page, '[data-mr-claim="counter"]').click();
  check((await banner(page)).reason === 'same', `${tag} tw3 : aucune bille ne sépare les deux murs`);
  await vis(page, '[data-mr-expand]').click();
  check((await page.locator('[data-mr-reduced]:visible').count()) === 2, `${tag} tw3 : « انشر » écrit la forme réduite des deux murs`);
  await vis(page, '[data-mr-claim="equal"]').click();
  check((await lab(page).getAttribute('data-solved')) === 'true', `${tag} tw3 : « متساويتان » accepté après « انشر »`);
  // une paire libre
  await vis(page, '[data-mr-free-input="a"]').fill('(x+1)(x+2)');
  await vis(page, '[data-mr-free-input="a"]').press('Enter');
  check((await task(page)) === 'custom', `${tag} libre : une paire écrite à la main ouvre le monde libre`);
  check(errors.length === 0, `${tag} aucune erreur JS ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 5 — le guide (LabCoach) : les identifiants de pas, de bout en bout, sur r1.
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 }, { coachOff: false });
  const page = await ctx.newPage();
  await goto(page, `${BASE}${LESSON}/nashat`);
  await scrollTo(page, '[data-marble-run]');
  const step = () => page.locator('[data-lab-coach]').first().getAttribute('data-step').catch(() => null);
  const seen = [];
  await page.waitForTimeout(400); seen.push(await step());
  await dropMarble(page, '3'); await page.waitForTimeout(300); seen.push(await step());
  await slot(page, 0).click(); await page.waitForTimeout(300); seen.push(await step());
  await times(page, 0).click(); await page.waitForTimeout(300); seen.push(await step());
  check(JSON.stringify(seen) === JSON.stringify(['rack', 'slots', 'times', 'run']), `guide : rack → slots → times → run (${JSON.stringify(seen)})`);
  await ctx.close();
}

await browser.close();
if (failures.length) { console.log(`\n✗ ${failures.length} échec(s)`); process.exit(1); }
console.log('\n✓ tout est vert');
