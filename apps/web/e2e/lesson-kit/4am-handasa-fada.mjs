// 4AM — الوحدة 14 « الهندسة في الفضاء » (2026-10-05), unité de « ميدان الهندسة » (généré depuis l'e2e de l'unité 13).
//
// Ce que ce fichier garde :
//   1. la page d'UNITÉ liste les 4 leçons dans l'ordre du propriétaire, puis la synthèse, sous « ميدان الهندسة » ;
//   2. CHAQUE module de CHAQUE leçon se monte sans erreur console, en RTL, sans débordement
//      horizontal (1280 et 320 px), sans clé i18n brute ;
//   3. chaque laboratoire de l'unité (sphere-probe, orange-peel, section-slicer, scale-blocks, bucket-fill)
//      tient dans UN écran avec ses commandes, aux deux niveaux, à 1280×800, 1366×768, 390×844, 320×640
//      (MANIPULATION_CONTRACT §8bis) ; sa scène 3D (Stage3D) est née dans le navigateur (WebGL) et non restée au repli.
//
// Run : KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/4am-handasa-fada.mjs
//   LABS_ONLY=1 saute les sections 1–2 ; MOUNT_ONLY=1 saute la section 3 ; MOUNT_LESSONS=a,b limite la section 2.
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { BASE, launch, newCtx, watchErrors, check, summary, noHorizontalScroll, seed, lessonKey } from './helpers.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const UNIT_DIR = resolve(here, '../../src/lessons/moyen/4am/handasa/handasa-fada');
const LESSONS = ['kura-julla', 'misaha-hajm-kura', 'maqati-mustawiya', 'takbir-tasghir', 'wadiya-idmajiya-fada'];
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
// La page reprend à l'étape en cours par un défilement doux (utils/scrollToStep.js) : on attend qu'il se pose avant de
// cliquer un onglet, sinon le clic tombe sur le bloc au-dessus en plein défilement (vu à 320×640 sur la synthèse).
async function settled(page) {
  let last = -1;
  for (let i = 0; i < 20; i += 1) {
    const y = await page.evaluate(() => scrollY);
    if (y === last) return;
    last = y;
    await page.waitForTimeout(150);
  }
}
async function pickLevel(page, level) {
  await settled(page);
  const tab = page.locator(`[data-manipulation-workspace] [role="tab"][data-level="${level}"]`).first();
  if (!(await tab.count())) return false;
  // Le site défile en douceur (scroll-behavior: smooth) : sous charge, l'animation dure plus d'une seconde et le clic de
  // Playwright tombe en plein mouvement (« element is not stable »). On centre l'onglet INSTANTANÉMENT, puis on attend.
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await settled(page);
  // Le tap réel atteint l'onglet à toute position (vérifié par elementFromPoint au début, au centre et en bas, 320×640) ;
  // le test d'actionnabilité de Playwright, lui, échouait sous charge. Le clic est donc déclenché dans la page.
  await tab.evaluate((el) => el.click());
  await page.waitForTimeout(400);
  return true;
}

// ── 1. La page d'unité ────────────────────────────────────────────────────
if (!process.env.LABS_ONLY) {
  const { ctx, page } = await fresh();
  await go(page, `${CH}/units/handasa-fada`);
  await page.waitForSelector('[data-unit="handasa-fada"]');
  const ids = await page.$$eval('[data-unit-lesson]', (els) => els.map((e) => e.getAttribute('data-unit-lesson')));
  check('unité 14 : 4 leçons dans l’ordre, puis la synthèse « أدمج تعلّماتي »', JSON.stringify(ids) === JSON.stringify(LESSONS), ids.join(','));
  check('unité 14 : le تحدّ d’ouverture (le seau) est affiché', await page.$('[data-unit-challenge]') !== null);
  check('unité 14 : aucun débordement horizontal', await noHorizontalScroll(page));
  const body = await page.evaluate(() => document.body.innerText);
  check('unité 14 : rangée sous « ميدان الهندسة »', body.includes('الهندسة'));
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
  'sphere-probe': '[data-sp-glance]', 'orange-peel': '[data-op-glance]', 'section-slicer': '[data-sl-glance]', 'scale-blocks': '[data-sb-glance]', 'bucket-fill': '[data-bf-glance]',
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
    // la scène 3D du lab (Stage3D) doit être NÉE (WebGL) : un lab resté sur son repli SVG n'est pas le lab
    const stages = [...el.querySelectorAll('[data-stage3d]')];
    const live = stages.length > 0 && stages.every((s) => s.hasAttribute('data-stage3d-ready'));
    return { ok: r.height <= avail + 1 && live, why: `${Math.round(r.height)} px pour ${Math.round(avail)} px${live ? '' : ' — scène 3D absente ou au repli'}` };
  }, [type, GLANCE[type]]);
}
const VIEWPORTS = [[1280, 800], [1366, 768], [390, 844], [320, 640]];
// [leçon, type par niveau, numéro du module qui monte le lab]. LAB_MODULES=lecon:N,… corrige un numéro de module.
const LAB_MODULE = Object.fromEntries((process.env.LAB_MODULES ?? '').split(',').filter(Boolean).map((p) => p.split(':')).map(([l, n]) => [l, Number(n)]));
const LABS = [
  ['kura-julla', { beginner: 'sphere-probe', advanced: 'sphere-probe' }, 1],
  ['misaha-hajm-kura', { beginner: 'orange-peel', advanced: 'orange-peel' }, 1],
  ['maqati-mustawiya', { beginner: 'section-slicer', advanced: 'section-slicer' }, 1],
  ['takbir-tasghir', { beginner: 'scale-blocks', advanced: 'scale-blocks' }, 1],
  ['wadiya-idmajiya-fada', { beginner: 'bucket-fill', advanced: 'bucket-fill' }, 7],
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
