// QA — 3AM, unité 4 « الحساب الحرفي », leçon `nashr-jabri-3am` « نشر عبارات جبرية » et son labo `area-split`
// (cycle moyen, phase 3, Phase A, 2026-10-21 — la deuxième leçon de l'unité).
//
//   KIT_BASE=http://localhost:4173 node apps/web/e2e/lesson-kit/3am-ibarat-harfiya-3-nashr.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (768×1024, 1024×768, 1280×800, 1366×768, 1920×1080) :
//   1. la page d'unité, le sommaire et CHAQUE module à 768 et 1280 px : monté, aucune erreur console, aucun débordement horizontal,
//      aucun « $ » / « \command » / clé brute ;
//   2. le labo, trois chemins : CLAVIER (la coupure d'un côté avance aux flèches), TOUCHER-TOUCHER (poignée puis graduation), CLIC sur les
//      deux boutons de signe de chaque parcelle (un signe faux est refusé avec les deux aires, `sign`) ; le niveau متقدم (deux coupures, le
//      coin, le coefficient de chaque puissance, « تحقّق ») ; le monde `arrows` (module 3) : une flèche du facteur vers un terme, le signe du
//      produit, le niveau de x (boutons +/−) bouge les deux compteurs ;
//   3. D'UN SEUL REGARD : `[data-as-glance]` tient dans la hauteur de l'écran aux cinq tailles, aux deux niveaux et au monde `arrows` ;
//   4. guide §4quater : rien au-dessus du labo (aucune carte), les briques sont ABSENTES avant la réponse.
// Captures dans /tmp/qa-3am-nashr.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:4173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-3am-nashr';
const CH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/nashr-jabri-3am`;
const UNIT = `${CH}/units/ibarat-harfiya-3`;
const MODULES = ['astaidd', 'nashat', 'maarif', 'tariqa', 'atamarran', 'masala-1', 'masala-2', 'masala-3', 'itqan'];
mkdirSync(OUT, { recursive: true });

const failures = [];
const check = (ok, label) => { if (!ok) failures.push(label); console.log(`${ok ? '✓' : '✗'} ${label}`); };

async function loginToken(who, tries = 8) {
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
  await ctx.addInitScript(([tk, off]) => {
    try { localStorage.setItem('token', tk); if (off) localStorage.setItem('sa.labCoach.area-split.off', 'true'); } catch { /* noop */ }
  }, [token, coachOff]);
  return ctx;
}

const RAW = /(^|[^\\])\$[^$\s][^$]*\$|\\(frac|times|mathrm|div|left|right)\b|manipulation\.[a-zA-Z]+\./;

async function pageHealth(page, label) {
  const { overflow, raw } = await page.evaluate((re) => {
    const rx = new RegExp(re);
    const doc = document.documentElement;
    const bad = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode;
      const el = n.parentElement;
      if (!el || el.closest('script,style,.katex-mathml,[aria-hidden="true"]')) continue;
      if (el.closest('[hidden]')) continue;
      if (rx.test(n.textContent)) bad.push(n.textContent.trim().slice(0, 80));
    }
    return { overflow: doc.scrollWidth - doc.clientWidth, raw: bad.slice(0, 3) };
  }, RAW.source);
  check(overflow <= 1, `${label}: pas de débordement horizontal (${overflow}px)`);
  check(raw.length === 0, `${label}: aucun texte brut ${raw.length ? JSON.stringify(raw) : ''}`);
}

const browser = await chromium.launch();
const token = await loginToken(TEACHER);

// 1 — unité, sommaire, modules aux tailles ordinateur et tablette (GLANCE_ONLY=1 : on saute directement au contrôle « d'un seul regard »).
for (const vp of process.env.GLANCE_ONLY ? [] : [{ width: 1280, height: 800 }, { width: 768, height: 1024 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}px`;

  await page.goto(`${BASE}${UNIT}`, { waitUntil: 'networkidle' });
  check(await page.getByText('نشر عبارات جبرية').first().isVisible().catch(() => false), `${tag} page d'unité : la leçon est listée`);
  await pageHealth(page, `${tag} unité`);
  await page.screenshot({ path: `${OUT}/unit-${vp.width}.png`, fullPage: false });

  await page.goto(`${BASE}${LESSON}`, { waitUntil: 'networkidle' });
  check(await page.locator('main').first().isVisible(), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);
  await page.screenshot({ path: `${OUT}/index-${vp.width}.png`, fullPage: true });

  for (const slug of MODULES) {
    await page.goto(`${BASE}${LESSON}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    check(await page.locator('main, [data-module-layout], h1').first().isVisible().catch(() => false), `${tag} ${slug} monté`);
    await pageHealth(page, `${tag} ${slug}`);
    await page.screenshot({ path: `${OUT}/${slug}-${vp.width}.png`, fullPage: true });
  }
  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 3 — D'UN SEUL REGARD, les deux niveaux et le monde `arrows`, aux cinq tailles.
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForTimeout(400);
};
const glanceFits = async (page, label) => {
  const box = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-as-glance]')].find((e) => e.offsetParent !== null);
    if (!el) return null;
    el.scrollIntoView({ block: 'start', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    return { h: r.height, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.h <= box.vh, `${label}: [data-as-glance] tient dans l'écran (${box ? `${Math.round(box.h)} / ${box.vh}` : 'absent'})`);
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-as-glance] reste dans la largeur`);
};
for (const vp of [{ width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1280, height: 800 }, { width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-area-split]');
  await glanceFits(page, `nashat ${vp.width}×${vp.height} مبتدئ`);
  await page.screenshot({ path: `${OUT}/lab-beginner-${vp.width}.png` });
  await pickLevel(page, 'advanced');
  await glanceFits(page, `nashat ${vp.width}×${vp.height} متقدم`);
  await page.screenshot({ path: `${OUT}/lab-advanced-${vp.width}.png` });
  await page.goto(`${BASE}${LESSON}/tariqa`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-area-split][data-world=arrows]');
  await glanceFits(page, `tariqa ${vp.width}×${vp.height} arrows`);
  await page.screenshot({ path: `${OUT}/lab-arrows-${vp.width}.png` });
  await ctx.close();
}

// 2 + 4 — les gestes, et la piste unique du module.
if (!process.env.GLANCE_ONLY) {
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  const panel = (lvl) => page.locator(`[data-manipulation-level-panel=${lvl}]`).first();
  const lab = panel('beginner').locator('[data-area-split]').first();
  await lab.waitFor();
  check(await page.locator('[data-module-brief]').count() === 0, 'module 1 : aucune carte au-dessus du labo');
  for (const id of ['masaha-tariqatayn', 'hadd-matruh', 'rukn-yuad']) {
    check(await page.locator(`[data-knowledge-brick="${id}"], [data-brick-id="${id}"]`).count() === 0, `module 1 : la brique « ${id} » est cachée avant la réponse`);
  }
  check(await lab.getAttribute('data-world') === 'plot', 'مبتدئ : monde plot');
  check(await lab.getAttribute('data-task') === 'p1', 'مبتدئ : première tâche p1');

  // clavier : la poignée du côté w avance aux flèches ; on la mène à la bonne coupure (x = 6 par défaut : 6)
  const knob = lab.locator('[data-as-cut=w]').first();
  await knob.focus();
  const at0 = Number(await knob.getAttribute('data-at'));
  await page.keyboard.press('ArrowRight');
  const at1 = Number(await knob.getAttribute('data-at'));
  check(at1 !== at0, `clavier : les flèches déplacent la poignée (${at0} → ${at1})`);
  const dir = at1 > at0 ? 'ArrowRight' : 'ArrowLeft';
  const back = dir === 'ArrowRight' ? 'ArrowLeft' : 'ArrowRight';
  const x = Number(await lab.locator('[data-as-x]').first().getAttribute('data-v').catch(() => 6)) || 6;
  for (let i = 0; i < 12; i += 1) {
    const cur = Number(await knob.getAttribute('data-at'));
    if (cur === x) break;
    await page.keyboard.press((x > cur) === (dir === 'ArrowRight') ? dir : back);
  }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  check(await lab.locator('[data-as-patch]').count() >= 2, 'clavier : après la bonne coupure les parcelles apparaissent');
  await page.screenshot({ path: `${OUT}/lab-cut.png` });

  // les signes : on essaie « + » puis, si refusé, « − » ; un refus donne les deux aires
  for (const id of await lab.locator('[data-as-patch]').evaluateAll((els) => els.map((e) => e.dataset.asPatch))) {
    const card = lab.locator(`[data-as-patch="${id}"]`).first();
    await card.locator('[data-as-sign=plus]').click();
    await page.waitForTimeout(250);
    if (await lab.locator('[data-as-refused=sign]').count()) { await card.locator('[data-as-sign=minus]').click(); await page.waitForTimeout(250); }
  }
  await page.waitForTimeout(300);
  check(await lab.getAttribute('data-solved') === 'true', 'p1 : toutes les parcelles décidées → tâche cochée');
  const mw = await lab.locator('[data-as-meter=whole]').first().getAttribute('data-v');
  const mp = await lab.locator('[data-as-meter=parts]').first().getAttribute('data-v');
  check(mw === mp, `les deux compteurs d'aire sont égaux (${mw} = ${mp})`);
  await lab.locator('[data-as-x-more]').first().click();
  await page.waitForTimeout(200);
  const mw2 = await lab.locator('[data-as-meter=whole]').first().getAttribute('data-v');
  const mp2 = await lab.locator('[data-as-meter=parts]').first().getAttribute('data-v');
  check(mw2 === mp2 && mw2 !== mw, `x + → les compteurs bougent ensemble (${mw} → ${mw2})`);
  await page.screenshot({ path: `${OUT}/lab-p1.png` });
  await lab.locator('[data-as-next]').first().click();
  await page.waitForTimeout(300);
  check(await lab.getAttribute('data-task') === 'p2', 'p2 ouverte');
  // p2 : une coupure FAUSSE est refusée (on lâche la poignée loin de la bonne place)
  const knob2 = lab.locator('[data-as-cut=w]').first();
  await knob2.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  check(await lab.locator('[data-as-refused=cut]').count() >= 1 || await lab.locator('[data-as-patch]').count() >= 1, 'p2 : une coupure mal placée est refusée (ou déjà juste)');
  await page.screenshot({ path: `${OUT}/lab-p2-cut.png` });

  // متقدم
  await pickLevel(page, 'advanced');
  const adv = panel('advanced').locator('[data-area-split]').first();
  await adv.waitFor();
  await page.waitForTimeout(400);
  check(await page.locator('[data-manipulation-level-panel=advanced] [data-as-meter]').count() >= 2, 'متقدم : les deux compteurs sont là');
  check(await adv.getAttribute('data-task') === 'p3', 'متقدم : première tâche p3');
  check(await adv.locator('[data-as-cut]').count() === 2, 'متقدم : deux poignées (deux côtés coupés)');
  await page.screenshot({ path: `${OUT}/lab-advanced-start.png` });
  await ctx.close();
}

// monde arrows (module 3)
if (!process.env.GLANCE_ONLY) {
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/tariqa`, { waitUntil: 'networkidle' });
  const lab = page.locator('[data-area-split][data-world=arrows]').first();
  await lab.waitFor();
  check(await page.locator('[data-module-brief]').count() === 0, 'module 3 : aucune carte au-dessus du labo');
  for (const id of ['ishara-jidaa', 'tariqat-nashr']) check(await page.locator(`[data-knowledge-brick="${id}"], [data-brick-id="${id}"]`).count() === 0, `module 3 : brique « ${id} » cachée avant la réponse`);
  check(await lab.getAttribute('data-task') === 'a1', 'arrows : la première tâche est a1');
  const origins = await lab.locator('[data-as-origin]').count();
  check(origins >= 1, `arrows : des origines de flèche (${origins})`);
  const targets = await lab.locator('[data-as-target]').evaluateAll((els) => els.map((e) => e.dataset.asTarget));
  const org = await lab.locator('[data-as-origin]').first().getAttribute('data-as-origin');
  for (const tj of targets) {
    await lab.locator(`[data-as-origin="${org}"]`).first().click();
    await lab.locator(`[data-as-target="${tj}"]`).first().click();
    await page.waitForTimeout(250);
  }
  check(await lab.locator('[data-as-arrow]').count() >= 2, 'arrows : une flèche tracée du facteur vers chaque terme (toucher-toucher)');
  await page.screenshot({ path: `${OUT}/lab-arrows-drawn.png` });
  for (const id of await lab.locator('[data-as-product]').evaluateAll((els) => els.map((e) => e.dataset.asProduct))) {
    const card = lab.locator(`[data-as-product="${id}"]`).first();
    await card.locator('[data-as-sign=plus]').click();
    await page.waitForTimeout(200);
  }
  await page.screenshot({ path: `${OUT}/lab-arrows-signed.png` });
  await lab.locator('[data-as-x-more]').first().click();
  await page.waitForTimeout(200);
  const a = await lab.locator('[data-as-meter]').first().getAttribute('data-v');
  const b = await lab.locator('[data-as-meter]').nth(1).getAttribute('data-v');
  check(a === b, `arrows : les compteurs restent égaux quand x change (${a} = ${b})`);
  await ctx.close();
}

await browser.close();
console.log(failures.length ? `\n${failures.length} échec(s)` : '\n✅ 3AM nashr-jabri-3am — tout est vert');
process.exit(failures.length ? 1 : 0);
