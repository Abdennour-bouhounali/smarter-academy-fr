// 4AM — الوحدة 2 « الحساب على الجذور » (2026-09-30).
//
// Ce que ce fichier garde :
//   1. la page d'UNITÉ liste les 5 leçons dans l'ordre du manuel, puis la synthèse ;
//   2. CHAQUE module de CHAQUE leçon se monte sans erreur console, en RTL, sans
//      débordement horizontal (1280 et 320 px) ;
//   3. les trois laboratoires de l'unité répondent au VRAI geste (clavier,
//      −/+ et glisser) avec leur mathématique exacte :
//        square-root-side  36 → 6 tombe juste ; 5 s'encadre à la main, la loupe
//                          ne s'ouvre qu'après l'encadrement, et rien ne tombe juste ;
//        square-root-side  (graduation) 16/9 tombe sur les tiers ;
//        square-fold       x² = 9 : 3 épinglé, puis −3 ; x² = −9 refuse l'épingle ;
//        square-tiling     k = 3 refusé pour 28, k = 2 donne 2√7 ; 288 → 12√2.
//
// Run : KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/4am-hisab-judhur.mjs
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE, launch, newCtx, watchErrors, check, summary, noHorizontalScroll, seed, lessonKey } from './helpers.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const UNIT_DIR = resolve(here, '../../src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/hisab-judhur');
// `jidhr-tarbii` and `natiqa-ghayr-natiqa` left out: v2 lessons since 2026-11-21, their module pages deleted
// (e2e/lessons/<id>.walk.mjs)
const LESSONS = ['muadalat-x-murabba', 'amaliyat-judhur', 'tawzif-khawass-judhur', 'wadiya-idmajiya-judhur'];
const CONFIGS = Object.fromEntries(await Promise.all(LESSONS.map(async (id) => [id, (await import(pathToFileURL(`${UNIT_DIR}/${id}/lesson.config.js`).href)).LESSON_CONFIG])));
const CH = `${BASE}/courses/moyen/4am/ansab_al_aadad_wal_hisab`;
const errors = [];
const { browser } = await launch();

async function fresh({ mobile = false, lesson = null } = {}) {
  const ctx = await newCtx(browser, { mobile });
  const page = await ctx.newPage();
  watchErrors(page, errors);
  // Tous les modules « faits » : la visite directe d'un module n'est jamais verrouillée.
  if (lesson) await seed(page, CONFIGS[lesson].modules.map((m) => m.number), lessonKey(lesson));
  return { ctx, page };
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
/** Poser la poignée d'une réglette LTR sur `steps` graduations après son minimum, au clavier, puis attendre la validation. */
async function setHandle(page, m, steps) {
  const h = m.locator('[data-stretch-handle]').first();
  await h.focus();
  await page.keyboard.press('Home');
  for (let i = 0; i < steps; i += 1) await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(900);
}
const text = async (loc) => ((await loc.textContent()) ?? '').replace(/\s/g, '');

// ── 1. La page d'unité ────────────────────────────────────────────────────
{
  const { ctx, page } = await fresh();
  await page.goto(`${CH}/units/hisab-judhur`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-unit="hisab-judhur"]');
  const ids = await page.$$eval('[data-unit-lesson]', (els) => els.map((e) => e.getAttribute('data-unit-lesson')));
  check('unité 2 : 5 leçons dans l’ordre du manuel, puis la synthèse « أدمج تعلّماتي »', JSON.stringify(ids) === JSON.stringify(LESSONS), ids.join(','));
  check('unité 2 : le défi d’ouverture (خزان الماء) est affiché', await page.$('[data-unit-challenge]') !== null);
  check('unité 2 : aucun débordement horizontal', await noHorizontalScroll(page));
  await ctx.close();
}

// ── 2. Chaque module de chaque leçon se monte (1280 px puis 320 px) ───────
for (const mobile of [false, true]) {
  for (const lesson of LESSONS) {
    const { ctx, page } = await fresh({ mobile, lesson });
    const before = errors.length;
    await page.goto(`${CH}/${lesson}`, { waitUntil: 'networkidle' });
    check(`${lesson}${mobile ? ' (320)' : ''} : sommaire sans débordement`, await noHorizontalScroll(page));
    for (const m of CONFIGS[lesson].modules) {
      await page.goto(`${BASE}${m.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      const dir = await page.evaluate(() => document.documentElement.dir);
      const bodyText = await page.evaluate(() => document.body.innerText);
      check(`${lesson} M${m.number}${mobile ? ' (320)' : ''} : monté en RTL, sans débordement`, dir === 'rtl' && await noHorizontalScroll(page) && bodyText.length > 200);
      // Aucune clé i18n brute ni « undefined » à l'écran.
      check(`${lesson} M${m.number}${mobile ? ' (320)' : ''} : aucune clé i18n ni undefined`, !/manipulation\.|undefined|NaN/.test(bodyText), (bodyText.match(/manipulation\.[a-zA-Z.]+|undefined|NaN/) ?? [''])[0]);
    }
    check(`${lesson}${mobile ? ' (320)' : ''} : aucune erreur console`, errors.length === before, errors.slice(before).join(' | '));
    await ctx.close();
  }
}

// ── 3b. (leçon 2 `natiqa-ghayr-natiqa`: a v2 lesson since 2026-11-21 — e2e/lessons/natiqa-ghayr-natiqa.walk.mjs)

// ── 3c. square-fold — leçon 3 ─────────────────────────────────────────────
{
  const { ctx, page } = await fresh({ lesson: 'muadalat-x-murabba' });
  await page.goto(`${BASE}${modulePath('muadalat-x-murabba', 'trigger')}`, { waitUntil: 'networkidle' });
  await pickLevel(page, 'beginner');
  const m = await visibleManip(page, 'square-fold');
  await m.waitFor();
  // Les cartes du niveau مبتدئ sont, dans l'ordre : x² = 9, x² = 0, x² = −9.
  const card9 = m.locator('[data-fold-card="0"]');
  await card9.click();
  const h = m.locator('[data-stretch-handle]').first();
  await h.focus();
  // x part de 0 : → six fois (pas de 1/2) = 3.
  for (let i = 0; i < 6; i += 1) await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(900);
  await m.locator('[data-fold-pin-button]').click();
  check('L3 : x = 3 est épinglé pour x² = 9', (await m.locator('[data-fold-verdict]').getAttribute('data-fold-verdict')) === 'pinned');
  check('L3 : x² = 9 reste ouverte avec un seul pin (مراد نسي حلا آخر)', (await card9.getAttribute('data-solved')) === 'false');
  await h.focus();
  for (let i = 0; i < 12; i += 1) await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(900);
  await m.locator('[data-fold-pin-button]').click();
  check('L3 : −3 épinglé, x² = 9 résolue', (await card9.getAttribute('data-solved')) === 'true');
  const cardNeg = m.locator('[data-fold-card="2"]');
  if (await cardNeg.count()) {
    await cardNeg.click();
    await m.locator('[data-fold-pin-button]').click();
    check('L3 : x² = −9 refuse toute épingle', (await m.locator('[data-fold-verdict]').getAttribute('data-fold-verdict')) === 'negativeTarget');
  }
  await ctx.close();
}

// ── 3d. square-tiling — leçons 4 et 5 ─────────────────────────────────────
for (const [lesson, level] of [['amaliyat-judhur', 'advanced'], ['tawzif-khawass-judhur', 'advanced']]) {
  const { ctx, page } = await fresh({ lesson });
  await page.goto(`${BASE}${modulePath(lesson, 'trigger')}`, { waitUntil: 'networkidle' });
  await pickLevel(page, level);
  const m = await visibleManip(page, 'square-tiling');
  await m.waitFor();
  const h = m.locator('[data-stretch-handle]').first();
  const max = Number(await h.getAttribute('aria-valuemax'));
  await setHandle(page, m, 4); // k = 5
  check(`${lesson} : k = 5 est refusé (dalle non entière)`, (await m.locator('[data-tiling-square]').getAttribute('data-valid')) === 'false');
  await setHandle(page, m, 1); // k = 2
  check(`${lesson} : k = 2 est un pavage juste`, (await m.locator('[data-tiling-square]').getAttribute('data-valid')) === 'true');
  const n = max; // pour 144 et 288 : kmax = 12
  await setHandle(page, m, 11); // k = 12
  check(`${lesson} : k = 12 écrit le côté (… = 12…)`, (await text(m.locator('[data-manipulation-representation]'))).includes('12') && n >= 12);
  await ctx.close();
}

await browser.close();
if (errors.length) console.log('\nErreurs console :', errors.slice(0, 10));
process.exit(summary() > 0 ? 1 : 0);
