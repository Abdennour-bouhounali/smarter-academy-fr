// QA — 3AM, unité 4 « الحساب الحرفي », leçon `muqaranat-natiqayn` « مقارنة عددين ناطقين » et son labo `difference-meter`
// (cycle moyen, phase 3, Phase 0 « priorité du propriétaire », 2026-10-26 — la quatrième leçon de l'unité).
//
//   KIT_BASE=http://localhost:5173 QA_STUB=1 node apps/web/e2e/lesson-kit/3am-unit4-muqaranat-natiqayn.mjs
//   QA_STUB=1 : sans API — les appels /api/v1 sont simulés (enveloppe réelle { success, user } pour /auth/me), un enseignant factice.
//   SHOTS=1   : écrit les captures du labo (état initial, sondes branchées, refus, échange, perles qui se recouvrent, volet, rideau, race, règle) dans QA_OUT.
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (768×1024, 1024×768, 1280×800, 1366×768) :
//   1. le sommaire et CHAQUE module à 768 et 1280 px : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » brut, RTL ;
//   2. guide §4quater : rien au-dessus du labo au module 1, le labo avant la première question, les briques ABSENTES avant la réponse ;
//   3. le labo au POINTEUR (glisser la sonde sur une perle) et au CLAVIER / toucher-toucher : d1 (rouge sur a, noire sur b : +1/2, la carte juste), d2 (l'aiguille va à GAUCHE :
//      −1 ; une carte fausse est refusée avec les deux faits ; « بدّل المجسّين » exigé, la lecture devient 1 et la carte reste), d3 (les perles se recouvrent : UNE étiquette
//      et la loupe ; +1/176), la découverte, « جرّب أعدادك », متقدم (le volet, une différence fausse refusée, la bonne lève le volet ; le rideau : « لا نستطيع الحكم » refusé),
//      le monde `race` (x au curseur et aux boutons, A − B simplifié refusé puis juste, les cartes par région) ;
//   4. le bloc `[data-dm-glance]` : la consigne, la paillasse, les cartes et le verdict tiennent dans la hauteur de l'écran aux quatre tailles (monde rail) ;
//   5. les identifiants de pas du guide (LabCoach) : plug → plug2 → verdict ; race : x → coef → cards.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-3am-muqaranat';
const STUB = !!process.env.QA_STUB;
const SHOTS = !!process.env.SHOTS;
const CH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/muqaranat-natiqayn`;
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
  await ctx.addInitScript(([tk, off]) => { try { localStorage.setItem('token', tk); if (off) localStorage.setItem('sa.labCoach.difference-meter.off', '1'); } catch { /* noop */ } }, [token, coachOff]);
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
const lab = (page) => page.locator('[data-difference-meter]:visible').first();
const banner = async (page) => ({ reason: await page.locator('[data-dm-banner]:visible').first().getAttribute('data-dm-refused').catch(() => null), code: await page.locator('[data-dm-banner]:visible').first().getAttribute('data-code').catch(() => null), text: (await page.locator('[data-dm-banner]:visible').first().textContent().catch(() => '')) ?? '' });
const reading = async (page) => ({ value: await vis(page, '[data-dm-needle]').getAttribute('data-reading'), side: await vis(page, '[data-dm-needle]').getAttribute('data-side') });
const task = (page) => lab(page).getAttribute('data-task');
const shot = async (page, name, w) => { if (SHOTS) await page.locator('[data-manipulation="difference-meter"]:visible').first().screenshot({ path: `${OUT}/${name}-${w}.png` }); };

/** Le glisser au pointeur : la sonde jusqu'à la perle. */
async function dragProbe(page, which, bead) {
  await scrollTo(page, '[data-dm-scene]');
  const p = await vis(page, `[data-dm-probe="${which}"]`).boundingBox();
  const b = await vis(page, `[data-dm-bead="${bead}"]`).boundingBox();
  await page.mouse.move(p.x + p.width / 2, p.y + p.height / 2);
  await page.mouse.down();
  await page.mouse.move(p.x + p.width / 2 + 8, p.y + p.height / 2 - 16, { steps: 3 });
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(450);
}
/** Toucher-toucher : la sonde puis la perle. */
async function tapProbe(page, which, bead) {
  await scrollTo(page, '[data-dm-scene]');
  await vis(page, `[data-dm-probe="${which}"]`).click();
  await vis(page, `[data-dm-bead="${bead}"]`).click();
  await page.waitForTimeout(450);
}
const card = (page, c) => vis(page, `[data-dm-card="${c}"]`);
const next = async (page) => { await scrollTo(page, '[data-dm-next]'); await vis(page, '[data-dm-next]').click(); await page.waitForTimeout(500); };
const stepper = async (page, which, times, sel = '[data-dm-write]') => { const btn = page.locator(`${sel}:visible [data-dm-stepper="${which}"] button`); for (let i = 0; i < Math.abs(times); i += 1) await btn.nth(times > 0 ? 1 : 0).click(); };

async function main() {
  const token = await loginToken(TEACHER);
  const browser = await chromium.launch();
  const SIZES = [[768, 1024], [1024, 768], [1280, 800], [1366, 768]];

  // 1. le sommaire et chaque module — 768 et 1280 px
  for (const [w, h] of [[768, 1024], [1280, 800]]) {
    const ctx = await contextFor(browser, token, { width: w, height: h });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR|Failed to load resource|401|403|404/.test(m.text())) errors.push(m.text().slice(0, 160)); });
    page.on('pageerror', (e) => errors.push(`PAGEERR ${e.message.slice(0, 160)}`));
    await goto(page, `${BASE}${LESSON}`);
    check((await page.locator('body').textContent()).includes('مقارنة عددين ناطقين'), `${w}: le sommaire de la leçon s'affiche`);
    check((await page.locator('body').textContent()).includes('مسابقة القسمين'), `${w}: la مسألة الدرس est montrée dès le sommaire`);
    await pageHealth(page, `${w}: sommaire`);
    for (const slug of MODULES) {
      await goto(page, `${BASE}${LESSON}/${slug}`);
      check((await page.locator('main, body').first().textContent()).length > 200, `${w}: module ${slug} monté`);
      await pageHealth(page, `${w}: ${slug}`);
    }
    await goto(page, `${BASE}${UNIT}`);
    check((await page.locator('body').textContent()).includes('مقارنة عددين ناطقين'), `${w}: la leçon figure dans l'unité`);
    check(errors.length === 0, `${w}: aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
    await ctx.close();
  }

  // 2 + 3. le module 1 : le labo à deux niveaux — 1024×768 (guide §4quater) puis les captures aux quatre tailles
  for (const [w, h] of SIZES) {
    const ctx = await contextFor(browser, token, { width: w, height: h });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/nashat`);
    const order = await page.evaluate(() => {
      const labEl = document.querySelector('[data-manipulation="difference-meter"]');
      const q = document.querySelector('[data-activity-evidence]');
      const brick = document.querySelector('[data-knowledge-brick]');
      return { lab: !!labEl, before: !!(labEl && q && (labEl.compareDocumentPosition(q) & Node.DOCUMENT_POSITION_FOLLOWING)), brick: !!brick };
    });
    check(order.lab && order.before, `${w}: le labo précède la première question`);
    check(!order.brick, `${w}: aucune brique avant la réponse`);
    check((await lab(page).getAttribute('data-world')) === 'rail', `${w}: monde rail, tâche ${await task(page)}`);
    const ctxText = await page.locator('[data-lab-context]:visible').first().textContent();
    check(/المجسّ الأحمر ناقص عدد المجسّ الأسود/.test(ctxText) && (await page.locator('[data-lab-question]:visible').count()) === 1, `${w}: contexte puis UNE question`);
    check(!/[A-Za-z]{3,}/.test(await page.locator('[data-dm-glance]:visible').first().evaluate((el) => el.cloneNode(true)).then(() => '').catch(() => '')), `${w}: pas de prose latine`);
    // l'aiguille n'est pas lue avant le branchement
    check((await vis(page, '[data-dm-window]').getAttribute('data-dm-window-text')) === '— —', `${w}: fenêtre vide avant le branchement`);
    await shot(page, '01-initial', w);
    // le bloc d'un seul regard tient dans la hauteur de l'écran
    await scrollTo(page, '[data-dm-glance]');
    const gh = await vis(page, '[data-dm-glance]').evaluate((el) => el.getBoundingClientRect().height);
    check(gh <= h, `${w}×${h}: [data-dm-glance] tient dans l'écran (${Math.round(gh)} ≤ ${h})`);

    // d1 : au pointeur
    await dragProbe(page, 'red', 'a');
    check((await vis(page, '[data-dm-probe="red"]').getAttribute('data-on')) === 'a', `${w}: la sonde rouge est sur la perle a (glisser)`);
    await dragProbe(page, 'black', 'b');
    let r = await reading(page);
    check(r.value === '1/2' && r.side === '1', `${w}: d1 — l'aiguille lit +1/2 à droite (${JSON.stringify(r)})`);
    check((await vis(page, '[data-dm-window]').getAttribute('data-dm-window-text')) === '1/2', `${w}: la fenêtre affiche 1/2`);
    await shot(page, '02-plugged', w);
    await card(page, 'lt').click();
    let b = await banner(page);
    check(b.reason === 'verdict' && /الإبرة عند/.test(b.text) && /المجسّ الأحمر على a/.test(b.text), `${w}: une carte fausse est refusée avec les deux faits (${b.reason})`);
    await shot(page, '03-refused', w);
    await card(page, 'gt').click();
    check((await lab(page).getAttribute('data-solved')) === 'false' && (await page.locator('[data-dm-next]:visible').count()) === 1, `${w}: d1 résolue, « الزوج التالي » proposé`);
    await next(page);
    check((await task(page)) === '1', `${w}: tâche 2`);

    // d2 : au toucher-toucher ; l'échange exigé
    await tapProbe(page, 'red', 'a'); await tapProbe(page, 'black', 'b');
    r = await reading(page);
    check(r.value === '-1' && r.side === '-1', `${w}: d2 — l'aiguille va à GAUCHE : −3/2 − (−1/2) = −1 (${JSON.stringify(r)})`);
    await card(page, 'lt').click();
    check((await page.locator('[data-dm-next]:visible').count()) === 0, `${w}: d2 attend encore « بدّل المجسّين »`);
    await scrollTo(page, '[data-dm-swap]');
    await vis(page, '[data-dm-swap]').click(); await page.waitForTimeout(500);
    r = await reading(page);
    check(r.value === '1' && r.side === '1', `${w}: l'échange fait traverser l'aiguille (${JSON.stringify(r)}) et la carte reste`);
    check((await card(page, 'lt').getAttribute('aria-pressed')) === 'true', `${w}: la carte « a < b » reste enfoncée après l'échange`);
    await shot(page, '04-swapped', w);
    check((await page.locator('[data-dm-next]:visible').count()) === 1, `${w}: d2 résolue`);
    await next(page);

    // d3 : les perles se recouvrent
    check((await page.locator('[data-dm-tag="merged"]:visible').count()) === 1 && (await page.locator('[data-dm-lens]:visible').count()) === 1, `${w}: d3 — UNE étiquette fusionnée et la loupe`);
    await tapProbe(page, 'red', 'a'); await tapProbe(page, 'black', 'b');
    r = await reading(page);
    check(r.value === '1/176' && r.side === '1', `${w}: d3 — +1/176 : l'aiguille tranche (${JSON.stringify(r)})`);
    await shot(page, '05-overlap', w);
    await card(page, 'gt').click();
    check((await lab(page).getAttribute('data-solved')) === 'true', `${w}: les trois paires faites`);
    check((await page.locator('[data-manipulation-discovery]:visible').count()) === 1, `${w}: la découverte s'ouvre`);
    await ctx.close();
  }

  // la découverte, la règle, « جرّب أعدادك », متقدم, race — 1024×768
  {
    const ctx = await contextFor(browser, token, { width: 1024, height: 768 });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/nashat`);
    for (const [bead, red] of [['a', 'a'], ['a', 'a'], ['a', 'a']]) { void bead; void red; await dragProbe(page, 'red', 'a'); await dragProbe(page, 'black', 'b'); const t = await task(page); const right = { 0: 'gt', 1: 'lt', 2: 'gt' }[t]; await card(page, right).click(); if (t === '1') { await vis(page, '[data-dm-swap]').click(); await page.waitForTimeout(300); } if (t !== '2') await next(page); }
    const disc = vis(page, '[data-manipulation-discovery]');
    await disc.scrollIntoViewIfNeeded();
    const optionsText = await disc.locator('button').allTextContents();
    check(optionsText.length === 3, 'la découverte propose trois formulations');
    await disc.locator('button').nth(0).click();
    check(/جرّب/.test(await disc.textContent()), 'une formulation fausse est réfutée par un fait');
    await disc.locator('button').nth(1).click();
    await page.waitForTimeout(500);
    check((await page.locator('[data-dm-formal]:visible').count()) === 1, 'la règle formelle (a > b معناه a − b > 0) ne vient qu\'après la bonne réponse');
    await shot(page, '06-formal', 1024);

    // « جرّب أعدادك » : toujours ouvert
    let r;
    await scrollTo(page, '[data-dm-free]');
    await vis(page, '[data-dm-free-a]').fill('٠٫٥'); await vis(page, '[data-dm-free-b]').fill('-1/3');
    await vis(page, '[data-dm-free-add]').click(); await page.waitForTimeout(500);
    r = await reading(page);
    check(r.value === '5/6', `« جرّب أعدادك » : 0,5 − (−1/3) = 5/6 (${JSON.stringify(r)})`);
    check((await lab(page).getAttribute('data-solved')) === 'true', '« جرّب أعدادك » ne défait rien de ce qui est résolu');
    await vis(page, '[data-dm-free-a]').fill('10'); await vis(page, '[data-dm-free-add]').click();
    check((await page.locator('[data-dm-free-refusal]:visible').count()) === 1, '« جرّب أعدادك » refuse un nombre trop grand');
    await vis(page, '[data-dm-free-back]').click();
    await ctx.close();
  }

  // متقدم : le volet et le rideau — 1280×800
  {
    const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/nashat`);
    await pickLevel(page, 'advanced');
    check((await lab(page).getAttribute('data-world')) === 'rail', 'متقدم : monde rail');
    await tapProbe(page, 'red', 'a'); await tapProbe(page, 'black', 'b');
    check((await page.locator('[data-dm-shutter-art]:visible').count()) === 1 && (await vis(page, '[data-dm-window]').getAttribute('data-dm-window-text')) === '— —', 'متقدم : le volet couvre l\'aiguille tant que la différence n\'est pas écrite');
    check((await card(page, 'lt').isDisabled()), 'متقدم : les cartes sont inertes derrière le volet');
    await shot(page, '07-shutter', 1280);
    // fausse : −7/5 (les termes soustraits)
    await vis(page, '[data-dm-write-sign]').click();
    await stepper(page, 'num', 7); await stepper(page, 'den', 4);
    await vis(page, '[data-dm-write-check]').click(); await page.waitForTimeout(300);
    let b = await banner(page);
    check(b.reason === 'write' && /كتبتَ/.test(b.text) && /الإبرة عند/.test(b.text), `متقدم : une différence écrite fausse est refusée avec les deux nombres (${b.reason})`);
    await shot(page, '08-write-refused', 1280);
    // juste : −1/84
    await stepper(page, 'num', -6); await stepper(page, 'den', 79);
    await vis(page, '[data-dm-write-check]').click(); await page.waitForTimeout(600);
    check((await page.locator('[data-dm-shutter-art]:visible').count()) === 0 && (await reading(page)).value === '-1/84', 'متقدم : la bonne différence lève le volet, l\'aiguille lit −1/84');
    await card(page, 'lt').click();
    check((await page.locator('[data-dm-next]:visible').count()) === 1, 'متقدم : d4 résolue');
    await next(page);
    await tapProbe(page, 'red', 'a'); await tapProbe(page, 'black', 'b');
    await vis(page, '[data-dm-write-sign]').click(); await stepper(page, 'num', 1); await stepper(page, 'den', 23);
    await vis(page, '[data-dm-write-check]').click(); await page.waitForTimeout(500);
    await card(page, 'lt').click();
    check((await page.locator('[data-dm-next]:visible').count()) === 1, 'متقدم : d5 résolue');
    await next(page);
    // d6 : le rideau
    check((await page.locator('[data-dm-curtain]:visible').count()) === 1 && (await page.locator('[data-dm-bead]:visible').count()) === 0, 'متقدم : d6 — le rideau cache les perles');
    check((await reading(page)).value === '-3/10', 'متقدم : d6 — l\'aiguille est à −3/10');
    await shot(page, '09-curtain', 1280);
    await vis(page, '[data-dm-card="nojudge"]').click();
    b = await banner(page);
    check(b.reason === 'verdict', 'متقدم : « لا نستطيع الحكم » est refusée (l\'aiguille suffit)');
    await card(page, 'lt').click();
    check((await lab(page).getAttribute('data-solved')) === 'true', 'متقدم : les trois tâches faites');
    check((await page.locator('[data-manipulation-discovery]:visible').count()) === 1, 'متقدم : la seconde découverte s\'ouvre');
    await ctx.close();
  }

  // le monde `race` du module 3 — 1280×800 puis 768×1024
  for (const [w, h] of [[1280, 800], [768, 1024]]) {
    const ctx = await contextFor(browser, token, { width: w, height: h });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/tariqa`);
    check((await lab(page).getAttribute('data-world')) === 'race', `${w}: race — monde posé seul`);
    check(await page.evaluate(() => { const l = document.querySelector('[data-manipulation="difference-meter"]'); const first = document.querySelector('[data-activity-evidence]'); return !!(l && first && (l.compareDocumentPosition(first) & Node.DOCUMENT_POSITION_FOLLOWING)); }), `${w}: race — le labo précède la première question`);
    check((await reading(page)).value === '-4', `${w}: e1 en x = 0 : A − B = 5 − 9 = −4`);
    check((await page.locator('[data-dm-coef-panel]:visible').count()) === 0, `${w}: les coefficients ne s'ouvrent pas avant d'avoir bougé x`);
    await scrollTo(page, '[data-dm-x-more]');
    await vis(page, '[data-dm-x-more]').click(); await vis(page, '[data-dm-x-more]').click(); await vis(page, '[data-dm-x-more]').click(); await vis(page, '[data-dm-x-more]').click(); await page.waitForTimeout(500);
    check((await reading(page)).value === '0' && (await vis(page, '[data-dm-x-value]').textContent()) === '4', `${w}: à x = 4 l'aiguille est à 0 (les perles se rencontrent)`);
    await shot(page, '10-race-cross', w);
    check((await page.locator('[data-dm-coef-panel]:visible').count()) === 1, `${w}: les coefficients s'ouvrent`);
    // faux : 5x + 14 (B ajoutée)
    await stepper(page, 'p', 5, '[data-dm-coef-panel]'); await stepper(page, 'q', 14, '[data-dm-coef-panel]');
    await vis(page, '[data-dm-coef-check]').click(); await page.waitForTimeout(300);
    let b = await banner(page);
    check(b.reason === 'coef' && /الإبرة/.test(b.text), `${w}: race — un A − B faux est refusé avec les deux faits`);
    await shot(page, '11-coef-refused', w);
    await stepper(page, 'p', -4, '[data-dm-coef-panel]'); await stepper(page, 'q', -18, '[data-dm-coef-panel]');
    await vis(page, '[data-dm-coef-check]').click(); await page.waitForTimeout(500);
    check((await page.locator('[data-dm-regions]:visible').count()) === 1 && (await page.locator('[data-dm-region]:visible').count()) === 3, `${w}: race — trois régions après A − B = x − 4`);
    await vis(page, '[data-dm-region="0"] [data-dm-rcard="gt"]').click(); await vis(page, '[data-dm-region="1"] [data-dm-rcard="eq"]').click(); await vis(page, '[data-dm-region="2"] [data-dm-rcard="gt"]').click();
    await vis(page, '[data-dm-regions-check]').click(); await page.waitForTimeout(400);
    b = await banner(page);
    check(b.reason === 'regions', `${w}: race — une carte de région fausse est refusée (${b.reason})`);
    await shot(page, '12-region-refused', w);
    await vis(page, '[data-dm-region="0"] [data-dm-rcard="lt"]').click();
    await vis(page, '[data-dm-regions-check]').click(); await page.waitForTimeout(400);
    check((await page.locator('[data-dm-next]:visible').count()) === 1, `${w}: e1 résolue`);
    await next(page);
    // e2 : une seule région
    await scrollTo(page, '[data-dm-x-more]'); await vis(page, '[data-dm-x-more]').click(); await vis(page, '[data-dm-x-more]').click();
    await stepper(page, 'p', 0, '[data-dm-coef-panel]'); await stepper(page, 'q', 5, '[data-dm-coef-panel]');
    await vis(page, '[data-dm-coef-check]').click(); await page.waitForTimeout(400);
    check((await page.locator('[data-dm-region]:visible').count()) === 1, `${w}: e2 — une seule région « لكل قيم x »`);
    await ctx.close();
  }

  // 5. le guide (LabCoach) : plug → plug2 → verdict
  {
    const ctx = await contextFor(browser, token, { width: 1024, height: 768 }, { coachOff: false });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/nashat`);
    const step = async () => page.locator('[data-lab-coach]:visible').first().getAttribute('data-step').catch(() => null);
    check((await step()) === 'plug', 'LabCoach : plug');
    await tapProbe(page, 'red', 'a');
    check((await step()) === 'plug2', 'LabCoach : plug2');
    await tapProbe(page, 'black', 'b');
    check((await step()) === 'verdict', 'LabCoach : verdict');
    await ctx.close();
  }

  await browser.close();
  console.log(failures.length ? `\n${failures.length} échec(s):\n- ${failures.join('\n- ')}` : '\nTout est vert.');
  process.exit(failures.length ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
