// 4AM — الوحدة 5 « جمل معادلتين من الدرجة الأولى بمجهولين » (2026-10-01).
//
// Ce que ce fichier garde :
//   1. la page d'UNITÉ liste les 3 leçons dans l'ordre du manuel, puis la synthèse ;
//   2. CHAQUE module de CHAQUE leçon se monte sans erreur console, en RTL, sans
//      débordement horizontal (1280 et 320 px), sans clé i18n brute ;
//   3. les trois laboratoires de l'unité répondent au VRAI geste (section 3) ;
//   4. leur couche décorative est aria-hidden et hors du parcours clavier.
//
// Run : KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/4am-jumal-muadalatayn.mjs
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE, launch, newCtx, watchErrors, check, summary, noHorizontalScroll, seed, lessonKey } from './helpers.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const UNIT_DIR = resolve(here, '../../src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/jumal-muadalatayn');
const LESSONS = ['mafhum-jumla', 'hall-jabri', 'mushkilat-jumla', 'wadiya-idmajiya-jumal'];
const CONFIGS = Object.fromEntries(await Promise.all(LESSONS.map(async (id) => [id, (await import(pathToFileURL(`${UNIT_DIR}/${id}/lesson.config.js`).href)).LESSON_CONFIG])));
const CH = `${BASE}/courses/moyen/4am/ansab_al_aadad_wal_hisab`;
const errors = [];
const { browser } = await launch();

async function fresh({ mobile = false, lesson = null } = {}) {
  const ctx = await newCtx(browser, { mobile });
  const page = await ctx.newPage();
  watchErrors(page, errors);
  // Les polices Google ne jugent rien ici ; hors ligne, elles bloquent l'événement « load ».
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  if (lesson) await seed(page, CONFIGS[lesson].modules.map((m) => String(m.number)), lessonKey(lesson));
  return { ctx, page };
}
/**
 * Aller à une page : « networkidle » jusqu'à 45 s ; une page CHARGÉE dont le réseau ne
 * se tait pas (le serveur PHP de développement traite une requête à la fois) n'est pas
 * un échec de la leçon — on continue sur l'état « load », et les vérifications jugent.
 */
async function go(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  } catch (e) {
    if (!/Timeout/.test(String(e))) throw e;
    await page.waitForLoadState('load');
    await page.waitForTimeout(1500);
  }
}
// Depuis le 2026-10-13 la synthèse « wadiya-idmajiya-* » s'ouvre sur six وضعيات d'entraînement (practice_lab) : son
// module d'entrée n'est plus un `trigger`, c'est « al-wadiya » (module 7).
const modulePath = (lesson, stage) => (CONFIGS[lesson].modules.find((m) => m.stage === stage)
  ?? CONFIGS[lesson].modules.find((m) => m.slug === 'al-wadiya')).path;
async function pickLevel(page, level) {
  const tab = page.locator(`[data-manipulation-workspace] [role="tab"][data-level="${level}"]`).first();
  if (!(await tab.count())) return false;
  await tab.click();
  await page.waitForTimeout(350);
  return true;
}
async function visibleManip(page, type) {
  const scoped = page.locator(`[data-manipulation-level-panel]:not([hidden]) [data-manipulation="${type}"]`).first();
  if (await scoped.count()) return scoped;
  return page.locator(`[data-manipulation="${type}"]`).first();
}
/** Toucher la source puis la zone : le chemin non-glisser du moteur de port. */
async function tapCarry(page, m, source, zone) {
  await m.locator(`[data-drag-source="${source}"]`).last().click();
  await page.waitForTimeout(120);
  await m.locator(`[data-drop-zone="${zone}"]`).first().click({ position: { x: 6, y: 6 } });
  await page.waitForTimeout(200);
}

// ── 1. La page d'unité ────────────────────────────────────────────────────
// LABS_ONLY=1 saute les sections 1–2 (montage de chaque module) pour itérer sur les labs.
if (!process.env.LABS_ONLY) {
  const { ctx, page } = await fresh();
  await go(page, `${CH}/units/jumal-muadalatayn`);
  await page.waitForSelector('[data-unit="jumal-muadalatayn"]');
  const ids = await page.$$eval('[data-unit-lesson]', (els) => els.map((e) => e.getAttribute('data-unit-lesson')));
  check('unité 5 : 3 leçons dans l’ordre du manuel, puis la synthèse « أدمج تعلّماتي »', JSON.stringify(ids) === JSON.stringify(LESSONS), ids.join(','));
  check('unité 5 : le défi d’ouverture (37 pièces, 610DA) est affiché', await page.$('[data-unit-challenge]') !== null);
  check('unité 5 : aucun débordement horizontal', await noHorizontalScroll(page));
  await ctx.close();
}

// ── 2. Chaque module de chaque leçon se monte (1280 px puis 320 px) ───────
for (const mobile of (process.env.LABS_ONLY ? [] : [false, true])) {
  // MOUNT_LESSONS=a,b limite la section 2 à ces leçons (reprise d'un passage interrompu).
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

// ── 3. Les laboratoires au vrai geste — écrit après l'intégration des trois types ──
/** Le bloc mesuré tient-il dans la hauteur visible (moins la barre du haut) une fois amené à l'écran ? (MANIPULATION_CONTRACT §8bis) */
async function fitsOneScreen(page, selectors) {
  return page.evaluate((sels) => {
    const els = sels.flatMap((s) => [...document.querySelectorAll(s)]).filter((e) => e.offsetParent !== null);
    if (!els.length) return { ok: false, why: 'introuvable' };
    const top = Math.min(...els.map((e) => e.getBoundingClientRect().top + scrollY));
    const bottom = Math.max(...els.map((e) => e.getBoundingClientRect().bottom + scrollY));
    const header = document.querySelector('header')?.getBoundingClientRect().height ?? 0;
    const avail = innerHeight - Math.min(header, 72);
    return { ok: bottom - top <= avail + 1, why: `${Math.round(bottom - top)} px pour ${Math.round(avail)} px` };
  }, selectors);
}
const VIEWPORTS = [[1280, 800], [1366, 768], [390, 844], [320, 640]];
async function setValue(page, m, which, target) {
  for (let i = 0; i < 90; i += 1) {
    const cur = await m.locator('[data-pair-scoreboard]').getAttribute(`data-${which}`);
    if (cur === String(target)) return true;
    const dir = cur === '' || Number(cur) < target ? 'more' : 'less';
    await m.locator(`[data-pair-${dir}="${which}"]`).click();
    await page.waitForTimeout(40);
  }
  return false;
}

// ── 3a. pair-scoreboard مبتدئ (x + y = 10 ; 3x + y = 22) — une ثنائية qui ne vérifie qu'une équation est refusée ──
{
  const { ctx, page } = await fresh({ lesson: 'mafhum-jumla' });
  await go(page, `${BASE}${modulePath('mafhum-jumla', 'trigger')}`);
  await pickLevel(page, 'beginner');
  const m = await visibleManip(page, 'pair-scoreboard');
  await m.waitFor();
  await setValue(page, m, 'x', 10); await setValue(page, m, 'y', 0);
  await page.waitForTimeout(900);
  check('L1 مبتدئ : (10 ; 0) allume la jauge (1) seulement', (await m.locator('[data-gauge="1"]').getAttribute('data-ok')) === 'true' && (await m.locator('[data-gauge="2"]').getAttribute('data-ok')) === 'false');
  await m.locator('[data-pair-claim]').click(); await page.waitForTimeout(300);
  check('L1 مبتدئ : « حل للجملة » refusé avec une seule équation vérifiée', (await m.locator('[data-pair-refused="onlyOne"]').count()) > 0);
  await setValue(page, m, 'x', 6); await setValue(page, m, 'y', 4);
  await page.waitForTimeout(900);
  await m.locator('[data-pair-claim]').click(); await page.waitForTimeout(400);
  check('L1 مبتدئ : (6 ; 4) vérifie les deux → حل للجملة', (await m.locator('[data-pair-scoreboard]').getAttribute('data-solved')) === 'true');
  const decor = m.locator('[data-deco]').first();
  check('L1 décor : aria-hidden et hors clavier', (await decor.getAttribute('aria-hidden')) === 'true' && ['-1', null].includes(await decor.getAttribute('tabindex')));
  for (const level of ['beginner', 'advanced']) {
    await pickLevel(page, level);
    for (const [w, h] of VIEWPORTS) {
      await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(500);
      const fit = await fitsOneScreen(page, ['[data-manipulation-level-panel]:not([hidden]) [data-pair-glance]']);
      check(`L1 ${level} ${w}×${h} : monde + poignées + jauges + bouton sur un seul écran`, fit.ok, fit.why);
    }
    await page.setViewportSize({ width: 1280, height: 800 });
  }
  await ctx.close();
}

// ── 3b. elimination-cards مبتدئ (x + y = 10 ; x − y = 2) — poser une carte sur l'autre annule les y ──
{
  const { ctx, page } = await fresh({ lesson: 'hall-jabri' });
  await go(page, `${BASE}${modulePath('hall-jabri', 'trigger')}`);
  await pickLevel(page, 'beginner');
  const m = await visibleManip(page, 'elimination-cards');
  await m.waitFor();
  await tapCarry(page, m, 'card:2', 'card:1');
  await page.waitForTimeout(500);
  const root = m.locator('[data-elimination-cards]');
  check('L2 مبتدئ : la carte posée sur l’autre → méthode الجمع, y annulés', (await root.getAttribute('data-method')) === 'add' && (await root.getAttribute('data-stage')) !== 'cards', `${await root.getAttribute('data-method')} / ${await root.getAttribute('data-stage')}`);
  const decor = m.locator('[data-deco]').first();
  check('L2 décor : aria-hidden', (await decor.getAttribute('aria-hidden')) === 'true');
  for (const level of ['beginner', 'advanced']) {
    await pickLevel(page, level);
    for (const [w, h] of VIEWPORTS) {
      await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(500);
      const fit = await fitsOneScreen(page, ['[data-manipulation-level-panel]:not([hidden]) [data-eq-card]', '[data-manipulation-level-panel]:not([hidden]) [data-ec-current]']);
      check(`L2 ${level} ${w}×${h} : les deux cartes et leurs poignées sur un seul écran`, fit.ok, fit.why);
    }
    await page.setViewportSize({ width: 1280, height: 800 });
  }
  await ctx.close();
}

// ── 3c. story-modeller — musée (متقدم), stade (مبتدئ), fête (synthèse) ; chaque étape tient dans un écran ──
for (const [lesson, levels] of [['mushkilat-jumla', [['advanced', 'museum'], ['beginner', 'stadium']]], ['wadiya-idmajiya-jumal', [['advanced', 'party'], ['beginner', 'party']]]]) {
  const { ctx, page } = await fresh({ lesson });
  await go(page, `${BASE}${modulePath(lesson, 'trigger')}`);
  for (const [level, theme] of levels) {
    await pickLevel(page, level);
    const m = await visibleManip(page, 'story-modeller');
    await m.waitFor();
    check(`${lesson} ${level} : le monde « ${theme} »`, (await m.locator('[data-story-modeller]').getAttribute('data-theme')) === theme);
    for (const [w, h] of VIEWPORTS) {
      await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(500);
      const fit = await fitsOneScreen(page, ['[data-manipulation-level-panel]:not([hidden]) [data-sm-core]']);
      check(`${lesson} ${level} ${w}×${h} : l’étape en cours sur un seul écran`, fit.ok, fit.why);
    }
    await page.setViewportSize({ width: 1280, height: 800 });
  }
  await ctx.close();
}

await browser.close();
if (errors.length) console.log('\nErreurs console :', errors.slice(0, 10));
process.exit(summary() > 0 ? 1 : 0);
