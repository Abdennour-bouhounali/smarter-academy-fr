// QA — 1AM, unité 1, leçon `masahat-muhit-sath` « الكسور العشرية والكتابة العشرية » et son labo `ruler-compare`
// (cycle moyen, phase 3, batch 4, 2026-10-15).
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/1am-masahat-muhit-sath.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (768×1024, 1024×768, 1280×800, 1366×768, 1920×1080 — pas de téléphone) :
//   1. le sommaire et CHAQUE module : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » / « \command » / clé brute ;
//   2. le labo, monde `yard` : déplacer une dalle (clavier) change la clôture et PAS le nombre de dalles ; une marche autour de la clôture ;
//   3. D'UN SEUL REGARD : `[data-ty-glance]` tient dans la hauteur de l'écran aux deux niveaux et au monde `floor` ;
//   4. guide §4quater : rien au-dessus du labo, les briques sont ABSENTES avant la réponse.
// Captures dans /tmp/qa-1am-masahat.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-1am-masahat';
const CH = '/courses/moyen/1am/handasa';
const LESSON = `${CH}/masahat-muhit-sath`;
const UNIT = `${CH}/units/sutuh-masahat-muhitat`;
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

async function contextFor(browser, token, viewport) {
  const ctx = await browser.newContext({ viewport, locale: 'ar' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); } catch { /* noop */ } }, token);
  return ctx;
}

const RAW = /(^|[^\\])\$[^$\s][^$]*\$|\\(frac|times|mathrm|div|square|bigcirc|triangle)\b|manipulation\.[a-zA-Z]+\./;

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

// 1 — sommaire, unité, modules aux tailles tablette et ordinateur.
for (const vp of [{ width: 1280, height: 800 }, { width: 768, height: 1024 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}px`;

  await page.goto(`${BASE}${UNIT}`, { waitUntil: 'networkidle' });
  check(await page.getByText('مساحة سطح مستو ومحيطه').first().isVisible().catch(() => false), `${tag} page d'unité : la leçon est listée`);
  await pageHealth(page, `${tag} unité`);
  await page.screenshot({ path: `${OUT}/unit-${vp.width}.png`, fullPage: false });

  await page.goto(`${BASE}${LESSON}`, { waitUntil: 'networkidle' });
  check(await page.getByText('مساحة سطح مستو ومحيطه').first().isVisible(), `${tag} sommaire monté`);
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

// 3 — D'UN SEUL REGARD, tous les mondes et niveaux.
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForTimeout(400);
};
const glanceFits = async (page, label) => {
  const box = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-ty-glance]')].find((e) => e.offsetParent !== null);
    if (!el) return null;
    el.scrollIntoView({ block: 'start', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    return { h: r.height, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.h <= box.vh, `${label}: [data-ty-glance] tient dans l'écran (${box ? `${Math.round(box.h)} / ${box.vh}` : 'absent'})`);
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-ty-glance] reste dans la largeur`);
};
for (const vp of [{ width: 1024, height: 768 }, { width: 1280, height: 800 }, { width: 1366, height: 768 }, { width: 768, height: 1024 }, { width: 1920, height: 1080 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-tile-yard]');
  await glanceFits(page, `nashat ${vp.width}×${vp.height} مبتدئ`);
  await page.screenshot({ path: `${OUT}/lab-yard-beginner-${vp.width}.png` });
  await pickLevel(page, 'advanced');
  await glanceFits(page, `nashat ${vp.width}×${vp.height} متقدم`);
  await page.screenshot({ path: `${OUT}/lab-yard-advanced-${vp.width}.png` });
  await page.goto(`${BASE}${LESSON}/tariqa`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-tile-yard][data-world=floor]');
  await glanceFits(page, `tariqa ${vp.width}×${vp.height} floor`);
  await page.screenshot({ path: `${OUT}/lab-floor-${vp.width}.png` });
  await ctx.close();
}

// 2 + 4 — les gestes (clavier : flèches + Entrée).
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  const lab = page.locator('[data-manipulation-level-panel=beginner] [data-tile-yard]').first();
  await lab.waitFor();
  check(await page.locator('[data-module-brief]').count() === 0, 'module 1 : aucune carte au-dessus du labo');
  for (const id of ['masaha-adad', 'mahit-hadd', 'wahdat-tul-masaha', 'naql-baqat-masaha']) {
    check(await page.locator(`[data-knowledge-brick="${id}"], [data-brick-id="${id}"]`).count() === 0, `module 1 : la brique « ${id} » est cachée avant la réponse`);
  }
  const num = async (sel) => Number(await page.locator(sel).first().textContent().then((t) => (t ?? '').replace(/[^0-9]/g, '')));
  const tiles0 = await num('[data-ty-area]'); const fence0 = await num('[data-ty-fence]');
  check(tiles0 === 12 && fence0 === 16, `مبتدئ : départ 12 dalles et 16 éléments de clôture (${tiles0}/${fence0})`);
  // le LabCoach montre une bulle sur le premier geste : on la ferme (« إيقاف الإرشاد ») avant de glisser
  const stop = page.getByText('إيقاف الإرشاد').first();
  check(await stop.isVisible().catch(() => false), 'مبتدئ : le LabCoach propose le premier geste');
  await stop.click().catch(() => {});
  await page.waitForTimeout(300);
  // prendre la dalle d'un bout de la rangée du haut et la poser sous la rangée du bas (glisser à la souris)
  const ids = await page.locator('[data-ty-tile]').evaluateAll((els) => els.map((e) => e.getAttribute('data-ty-tile')));
  const rows = ids.map((i) => i.split('-').map(Number));
  const maxR = Math.max(...rows.map((r) => r[0])); const minC = Math.min(...rows.map((r) => r[1]));
  const minR = Math.min(...rows.map((r) => r[0]));
  const src = rows.find((r) => r[0] === minR && r[1] === Math.max(...rows.filter((x) => x[0] === minR).map((x) => x[1])));
  await page.locator('[data-ty-glance]').first().evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  const box = async (sel) => page.locator(sel).first().boundingBox();
  const from = await box(`[data-ty-tile="${src[0]}-${src[1]}"]`);
  const to = await box(`[data-ty-cell="${maxR + 1}-${minC}"]`);
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  const tiles1 = await num('[data-ty-area]'); const fence1 = await num('[data-ty-fence]');
  check(tiles1 === 12, `مبتدئ : après un déplacement, toujours 12 dalles (${tiles1})`);
  check(fence1 !== fence0 || await page.locator('[data-ty-refused]').count() > 0, `مبتدئ : la clôture change (${fence0} → ${fence1}) ou le geste est refusé`);
  await page.locator('[data-ty-walk]').first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/lab-yard-walk.png` });

  await page.goto(`${BASE}${LESSON}/tariqa`, { waitUntil: 'networkidle' });
  const floor = page.locator('[data-tile-yard][data-world=floor]').first();
  await floor.waitFor();
  check(await page.locator('[data-module-brief]').count() === 0, 'module 3 : le labo est en haut, sans carte');
  for (const id of ['tariqat-rasf', 'wahdatan-adad']) check(await page.locator(`[data-knowledge-brick="${id}"], [data-brick-id="${id}"]`).count() === 0, `module 3 : brique « ${id} » cachée avant la réponse`);

  await page.goto(`${BASE}${LESSON}/maarif`, { waitUntil: 'networkidle' });
  check(await page.locator('[data-knowledge-brick="thalath-hallat"], [data-brick-id="thalath-hallat"]').count() === 0, 'module 2 : « thalath-hallat » cachée avant la réponse');
  await ctx.close();
}

await browser.close();
console.log(failures.length ? `\n${failures.length} échec(s)` : '\n✅ 1AM masahat-muhit-sath — tout est vert');
process.exit(failures.length ? 1 : 0);
