// 4AM — الوحدة 10 « حساب المثلثات في المثلث القائم » (2026-10-04), la deuxième unité de « ميدان الهندسة ».
//
// Ce que ce fichier garde :
//   1. la page d'UNITÉ liste les 4 leçons dans l'ordre du propriétaire, puis la synthèse, sous « ميدان الهندسة » ;
//   2. CHAQUE module de CHAQUE leçon se monte sans erreur console, en RTL, sans débordement
//      horizontal (1280 et 320 px), sans clé i18n brute ;
//   3. chaque laboratoire de l'unité (ramp-ratios, trig-calculator, angle-compass, clinometer, et clinometer réutilisé
//      par la synthèse en mode « align »)
//      tient dans UN écran avec ses commandes, aux deux niveaux, à 1280×800, 1366×768, 390×844, 320×640
//      (MANIPULATION_CONTRACT §8bis).
//
// Run : KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/4am-hisab-muthallathat.mjs
//   LABS_ONLY=1 saute les sections 1–2 ; MOUNT_ONLY=1 saute la section 3 ; MOUNT_LESSONS=a,b limite la section 2.
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { BASE, launch, newCtx, watchErrors, check, summary, noHorizontalScroll, seed, lessonKey } from './helpers.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const UNIT_DIR = resolve(here, '../../src/lessons/moyen/4am/handasa/hisab-muthallathat');
const LESSONS = ['nisab-muthallathiya', 'hasiba-muthallathiya', 'alaqat-muthallathiya', 'tarrid-muthallathiya', 'wadiya-idmajiya-muthallathat'];
const CONFIGS = Object.fromEntries(await Promise.all(LESSONS.map(async (id) => [id, (await import(pathToFileURL(`${UNIT_DIR}/${id}/lesson.config.js`).href)).LESSON_CONFIG])));
const CH = `${BASE}/courses/moyen/4am/handasa`;
const errors = [];
const { browser } = await launch();

async function fresh({ mobile = false, lesson = null, viewport = null } = {}) {
  const ctx = await newCtx(browser, { mobile });
  const page = await ctx.newPage();
  if (viewport) await page.setViewportSize({ width: viewport[0], height: viewport[1] });
  watchErrors(page, errors);
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  if (lesson) await seed(page, CONFIGS[lesson].modules.map((m) => String(m.number)), lessonKey(lesson));
  return { ctx, page };
}
async function go(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  } catch (e) {
    if (!/Timeout/.test(String(e))) throw e;
    await page.waitForLoadState('load');
    await page.waitForTimeout(1500);
  }
}
const modulePath = (lesson, number) => CONFIGS[lesson].modules.find((m) => m.number === number).path;
async function pickLevel(page, level) {
  const tab = page.locator(`[data-manipulation-workspace] [role="tab"][data-level="${level}"]`).first();
  if (!(await tab.count())) return false;
  await tab.click();
  await page.waitForTimeout(400);
  return true;
}

// ── 1. La page d'unité ────────────────────────────────────────────────────
if (!process.env.LABS_ONLY) {
  const { ctx, page } = await fresh();
  await go(page, `${CH}/units/hisab-muthallathat`);
  await page.waitForSelector('[data-unit="hisab-muthallathat"]');
  const ids = await page.$$eval('[data-unit-lesson]', (els) => els.map((e) => e.getAttribute('data-unit-lesson')));
  check('unité 10 : 4 leçons dans l’ordre, puis la synthèse « أدمج تعلّماتي »', JSON.stringify(ids) === JSON.stringify(LESSONS), ids.join(','));
  check('unité 10 : le تحدّ d’ouverture (l’échelle) est affiché', await page.$('[data-unit-challenge]') !== null);
  check('unité 10 : aucun débordement horizontal', await noHorizontalScroll(page));
  const body = await page.evaluate(() => document.body.innerText);
  check('unité 10 : rangée sous « ميدان الهندسة »', body.includes('الهندسة'));
  await ctx.close();
}

// ── 2. Chaque module de chaque leçon se monte (1280 px puis 320 px) ───────
for (const mobile of (process.env.LABS_ONLY ? [] : [false, true])) {
  for (const lesson of LESSONS.filter((l) => !process.env.MOUNT_LESSONS || process.env.MOUNT_LESSONS.split(',').includes(l))) {
    const { ctx, page } = await fresh({ mobile, lesson });
    const before = errors.length;
    await go(page, `${CH}/${lesson}`);
    check(`${lesson}${mobile ? ' (320)' : ''} : sommaire sans débordement`, await noHorizontalScroll(page));
    for (const m of CONFIGS[lesson].modules) {
      await go(page, `${BASE}${m.path}`);
      await page.waitForTimeout(400);
      const dir = await page.evaluate(() => document.documentElement.dir);
      const bodyText = await page.evaluate(() => document.body.innerText);
      check(`${lesson} M${m.number}${mobile ? ' (320)' : ''} : monté en RTL, sans débordement`, dir === 'rtl' && await noHorizontalScroll(page) && bodyText.length > 200);
      check(`${lesson} M${m.number}${mobile ? ' (320)' : ''} : aucune clé i18n ni undefined`, !/manipulation\.|undefined|NaN/.test(bodyText), (bodyText.match(/manipulation\.[a-zA-Z.]+|undefined|NaN/) ?? [''])[0]);
    }
    check(`${lesson}${mobile ? ' (320)' : ''} : aucune erreur console`, errors.length === before, errors.slice(before).join(' | '));
    await ctx.close();
  }
}

// ── 3. Un seul écran : chaque lab, ses commandes et sa lecture (§8bis) ─────
/**
 * Le bloc INSTRUMENT (l'objet, ses commandes et sa lecture — ce que chaque lab marque « glance ») de la
 * manipulation VISIBLE, amené à l'écran, tient-il dans la hauteur disponible (moins la barre du haut) ?
 * Le titre, la consigne, le sélecteur de niveau et les blocs repliables (LabFold) restent au-dessus / en dessous.
 */
const GLANCE = {
  'ramp-ratios': '[data-rr-glance]', 'trig-calculator': '[data-tc-glance]', 'angle-compass': '[data-ac-glance]', clinometer: '[data-cl-glance]',
};
async function fitsOneScreen(page, type) {
  return page.evaluate(async ([t, g]) => {
    const roots = [...document.querySelectorAll(`[data-manipulation="${t}"]`)].filter((e) => e.offsetParent !== null);
    const el = roots.map((r) => r.querySelector(g)).find((e) => e && e.offsetParent !== null);
    if (!el) return { ok: false, why: 'introuvable' };
    el.scrollIntoView({ block: 'start' });
    await new Promise((r) => setTimeout(r, 250));
    const r = el.getBoundingClientRect();
    const header = document.querySelector('header')?.getBoundingClientRect().height ?? 0;
    const avail = innerHeight - Math.min(header, 72);
    return { ok: r.height <= avail + 1, why: `${Math.round(r.height)} px pour ${Math.round(avail)} px` };
  }, [type, GLANCE[type]]);
}
const VIEWPORTS = [[1280, 800], [1366, 768], [390, 844], [320, 640]];
// [leçon, type par niveau, numéro du module qui monte le lab]. LAB_MODULES=lecon:N,… corrige un numéro de module.
const LAB_MODULE = Object.fromEntries((process.env.LAB_MODULES ?? '').split(',').filter(Boolean).map((p) => p.split(':')).map(([l, n]) => [l, Number(n)]));
const LABS = [
  ['nisab-muthallathiya', { beginner: 'ramp-ratios', advanced: 'ramp-ratios' }, 1],
  ['hasiba-muthallathiya', { beginner: 'trig-calculator', advanced: 'trig-calculator' }, 1],
  ['alaqat-muthallathiya', { beginner: 'angle-compass', advanced: 'angle-compass' }, 1],
  ['tarrid-muthallathiya', { beginner: 'clinometer', advanced: 'clinometer' }, 1],
  ['wadiya-idmajiya-muthallathat', { beginner: 'clinometer', advanced: 'clinometer' }, 7],
].map(([l, t, n]) => [l, t, LAB_MODULE[l] ?? n]);
for (const [lesson, types, number] of (process.env.MOUNT_ONLY ? [] : LABS)) {
  for (const vp of VIEWPORTS) {
    const { ctx, page } = await fresh({ lesson, viewport: vp, mobile: vp[0] < 500 });
    await go(page, `${BASE}${modulePath(lesson, number)}`);
    for (const level of ['beginner', 'advanced']) {
      await pickLevel(page, level);
      const type = types[level];
      const fit = await fitsOneScreen(page, type);
      check(`${lesson} · ${type} ${level} ${vp[0]}×${vp[1]} : un seul écran`, fit.ok, fit.why);
    }
    await ctx.close();
  }
}

await browser.close();
summary();
