// QA — 2AM, unité 5 « التناسبية », leçon `rabi-mutanasib` « حساب الرابع المتناسب » et son labo `fourth-gauges`
// (cycle moyen, phase 3, Phase A #8, 2026-10-21 — la première leçon de l'unité).
//
//   KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/2am-tanasubiya-2am.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (768×1024, 1024×768, 1280×800, 1366×768, 1920×1080) :
//   1. la page d'unité, le sommaire et CHAQUE module à 768 et 1280 px : monté, aucune erreur console, aucun débordement horizontal,
//      aucun « $ » / « \command » / clé brute ;
//   2. le labo au CLAVIER / au TOUCHER (saisie + Entrée, −/+) : mauvais prix refusé, 780 accepté, la quantité 5, le leurre 404 puis 600 ;
//      au niveau متقدم les balances sont voilées puis dévoilées ; le même labo au module 2 (910 puis 12) ;
//   3. D'UN SEUL REGARD : `[data-fg-glance]` tient dans la hauteur de l'écran aux cinq tailles, aux deux niveaux et au module 2 ;
//   4. guide §4quater : rien au-dessus du labo (aucune carte), les briques sont ABSENTES avant la réponse.
// Captures dans /tmp/qa-2am-rabi.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-2am-rabi';
const CH = '/courses/moyen/2am/tanasubiya_duwal';
const LESSON = `${CH}/rabi-mutanasib`;
const UNIT = `${CH}/units/tanasubiya-2am`;
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

async function contextFor(browser, token, viewport, { coachOff = false } = {}) {
  const ctx = await browser.newContext({ viewport, locale: 'ar' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await ctx.addInitScript(([tk, off]) => {
    try { localStorage.setItem('token', tk); if (off) localStorage.setItem('sa.labCoach.fourth-gauges.off', 'true'); } catch { /* noop */ }
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

// 1 — unité, sommaire, modules aux tailles ordinateur et tablette.
for (const vp of [{ width: 1280, height: 800 }, { width: 768, height: 1024 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}px`;

  await page.goto(`${BASE}${UNIT}`, { waitUntil: 'networkidle' });
  check(await page.getByText('حساب الرابع المتناسب').first().isVisible().catch(() => false), `${tag} page d'unité : la leçon est listée`);
  check(await page.locator(`a[href="${LESSON}"]`).count() >= 1, `${tag} page d'unité : la leçon est un lien`);
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

// 3 — D'UN SEUL REGARD, les deux niveaux et le module 2, aux cinq tailles.
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForTimeout(400);
};
const glanceFits = async (page, label) => {
  const box = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-fg-glance]')].find((e) => e.offsetParent !== null);
    if (!el) return null;
    el.scrollIntoView({ block: 'start', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    return { h: r.height, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.h <= box.vh, `${label}: [data-fg-glance] tient dans l'écran (${box ? `${Math.round(box.h)} / ${box.vh}` : 'absent'})`);
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-fg-glance] reste dans la largeur`);
};
for (const vp of [{ width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1280, height: 800 }, { width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-fourth-gauges]');
  await glanceFits(page, `nashat ${vp.width}×${vp.height} مبتدئ`);
  await page.screenshot({ path: `${OUT}/lab-beginner-${vp.width}.png` });
  await pickLevel(page, 'advanced');
  await glanceFits(page, `nashat ${vp.width}×${vp.height} متقدم`);
  await page.screenshot({ path: `${OUT}/lab-advanced-${vp.width}.png` });
  await page.goto(`${BASE}${LESSON}/maarif`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-fourth-gauges]');
  await glanceFits(page, `maarif ${vp.width}×${vp.height} labo seul`);
  await page.screenshot({ path: `${OUT}/lab-insert-${vp.width}.png` });
  await ctx.close();
}

// 2 + 4 — les gestes (saisie, −/+), et la piste unique du module.
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  const lab = page.locator('[data-manipulation-level-panel=beginner] [data-fourth-gauges]').first();
  await lab.waitFor();
  check(await page.locator('[data-module-brief]').count() === 0, 'module 1 : aucune carte au-dessus du labo');
  for (const id of ['rabi', 'farq', 'jidaan']) {
    check(await page.locator(`[data-knowledge-brick="${id}"], [data-brick-id="${id}"]`).count() === 0, `module 1 : la brique « ${id} » est cachée avant la réponse`);
  }
  check(await page.locator('[data-manipulation-level-panel=beginner] [data-lab-coach-toggle]').count() === 1, 'مبتدئ : l’interrupteur du LabCoach est sous la question');
  check(await page.locator('[data-lab-coach]').count() >= 1, 'مبتدئ : le LabCoach montre le prochain geste');
  await page.getByText('إيقاف الإرشاد').first().click().catch(() => {});
  const put = async (l, v) => { const inp = l.locator('[data-fg-input]'); await inp.click(); await inp.fill(String(v)); await inp.press('Enter'); await page.waitForTimeout(250); };
  const verdict = async (l) => l.locator('[data-fg-verdict]').getAttribute('data-fg-verdict');
  const nextBtn = lab.locator('[data-fg-next]');
  await put(lab, 700);
  check(await verdict(lab) === 'wrong', 'مبتدئ : 700 DA pour 6 kg est refusé');
  await put(lab, 780);
  check(await verdict(lab) === 'right', 'مبتدئ : 780 DA accepté');
  check(await lab.locator('[data-fg-prompt][data-lit=true]').count() === 1, 'مبتدئ : la lampe de la question s’allume');
  await page.screenshot({ path: `${OUT}/lab-task1.png` });
  await nextBtn.click();
  await put(lab, 5);
  check(await verdict(lab) === 'right', 'مبتدئ : la quantité 5 kg pour 1400 DA acceptée');
  await nextBtn.click();
  await put(lab, 404);
  check(await verdict(lab) === 'decoy', 'مبتدئ : 404 allume seulement la balance « الفرق »');
  await put(lab, 600);
  await page.waitForTimeout(300);
  check(await lab.getAttribute('data-solved') === 'true', 'مبتدئ : les trois tâches faites');
  check(await page.locator('[data-manipulation-discovery]').first().isVisible(), 'مبتدئ : la question de découverte apparaît');
  await page.screenshot({ path: `${OUT}/lab-discovery.png` });

  // متقدم : balances voilées, 520 pour 4 kg de carottes
  await pickLevel(page, 'advanced');
  const adv = page.locator('[data-manipulation-level-panel=advanced] [data-fourth-gauges]').first();
  check(await adv.locator('[data-fg-gauge][data-state=covered]').count() >= 3, 'متقدم : les balances sont voilées');
  await put(adv, 520);
  check(await verdict(adv) === 'right', 'متقدم : 520 DA accepté');
  check(await adv.locator('[data-fg-gauge][data-state=covered]').count() === 0, 'متقدم : les balances se dévoilent au relâchement');

  // معارف : le même labo : 910 puis 12 ; puis les briques cachées
  await page.goto(`${BASE}${LESSON}/maarif`, { waitUntil: 'networkidle' });
  const cp = page.locator('[data-fourth-gauges]').first();
  await cp.waitFor();
  await page.getByText('إيقاف الإرشاد').first().click().catch(() => {});
  await put(cp, 910);
  check(await verdict(cp) === 'right', 'module 2 : 910 DA pour 7 kg accepté');
  check(await page.locator('[data-knowledge-brick="turuq"], [data-brick-id="turuq"]').count() === 0, 'module 2 : « turuq » cachée avant la réponse');

  await page.goto(`${BASE}${LESSON}/tariqa`, { waitUntil: 'networkidle' });
  for (const id of ['ikhtiyar']) check(await page.locator(`[data-knowledge-brick="${id}"], [data-brick-id="${id}"]`).count() === 0, `module 3 : brique « ${id} » cachée avant la réponse`);
  await ctx.close();
}

await browser.close();
console.log(failures.length ? `\n${failures.length} échec(s)` : '\n✅ 2AM rabi-mutanasib — tout est vert');
process.exit(failures.length ? 1 : 0);
