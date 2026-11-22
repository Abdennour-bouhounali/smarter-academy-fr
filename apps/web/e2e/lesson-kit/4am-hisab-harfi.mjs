// 4AM — الوحدة 3 « الحساب الحرفي » (2026-10-01).
//
// Ce que ce fichier garde :
//   1. la page d'UNITÉ liste les 3 leçons dans l'ordre du manuel, puis la synthèse ;
//   2. CHAQUE module de CHAQUE leçon se monte sans erreur console, en RTL, sans
//      débordement horizontal (1280 et 320 px), sans clé i18n brute ;
//   3. les deux laboratoires de l'unité répondent au VRAI geste :
//        pitch-expansion  3(x + 5) : deux zones portées (toucher puis toucher, et un
//                         vrai glisser), vérifiée pour deux x → la découverte s'ouvre ;
//                         (3x − 1)(3 + x) : quatre zones, 9x et −x réunis en 8x,
//                         x² refuse de se réunir avec 9x ; une zone oubliée s'allume ;
//        turf-factoring   rows 6x² + 4x : 3 rangées refusées, 2 rangées → 2x(3x + 2) ;
//                         square x² + 6x + 9 : 2 | 4 refusé, 3 | 3 ferme (x + 3)².
//
// Run : KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/4am-hisab-harfi.mjs
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE, launch, newCtx, watchErrors, check, summary, noHorizontalScroll, seed, lessonKey } from './helpers.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const UNIT_DIR = resolve(here, '../../src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/hisab-harfi');
const LESSONS = ['nashr-tabsit', 'mutatabiqat-shahira', 'tahlil-ibara', 'wadiya-idmajiya-harfi'];
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
const text = async (loc) => ((await loc.textContent()) ?? '').replace(/\s/g, '');
/** Toucher la source puis la zone : le chemin non-glisser du moteur de port. */
async function tapCarry(page, m, source, zone) {
  await m.locator(`[data-drag-source="${source}"]`).last().click();
  await page.waitForTimeout(120);
  await m.locator(`[data-drop-zone="${zone}"]`).first().click({ position: { x: 6, y: 6 } });
  await page.waitForTimeout(200);
}
/** Le x du terrain : un pas avec le bouton +, puis la pause de validation de la réglette. */
async function bumpX(page, m) {
  const plus = m.locator('[data-pitch-more]');
  await plus.click();
  await page.waitForTimeout(900);
}

// ── 1. La page d'unité ────────────────────────────────────────────────────
{
  const { ctx, page } = await fresh();
  await go(page, `${CH}/units/hisab-harfi`);
  await page.waitForSelector('[data-unit="hisab-harfi"]');
  const ids = await page.$$eval('[data-unit-lesson]', (els) => els.map((e) => e.getAttribute('data-unit-lesson')));
  check('unité 3 : 3 leçons dans l’ordre du manuel, puis la synthèse « أدمج تعلّماتي »', JSON.stringify(ids) === JSON.stringify(LESSONS), ids.join(','));
  check('unité 3 : le défi d’ouverture (المثلث) est affiché', await page.$('[data-unit-challenge]') !== null);
  check('unité 3 : aucun débordement horizontal', await noHorizontalScroll(page));
  await ctx.close();
}

// ── 2. Chaque module de chaque leçon se monte (1280 px puis 320 px) ───────
for (const mobile of [false, true]) {
  for (const lesson of LESSONS) {
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

// ── 3a. pitch-expansion 3(x + 5) — toucher-toucher, glisser, deux x ──────
{
  const { ctx, page } = await fresh({ lesson: 'nashr-tabsit' });
  await go(page, `${BASE}${modulePath('nashr-tabsit', 'trigger')}`);
  await pickLevel(page, 'beginner');
  const m = await visibleManip(page, 'pitch-expansion');
  await m.waitFor();
  check('L1 مبتدئ : 3(x + 5) est un produit « distributive »', (await m.locator('[data-pitch-expansion]').getAttribute('data-kind')) === 'distributive');
  await tapCarry(page, m, 'z:0-0', 'sum');
  await m.locator('[data-pitch-check]').click();
  await page.waitForTimeout(250);
  check('L1 مبتدئ : une zone oubliée → vérification refusée, la zone s’allume', (await m.locator('[data-pitch-trials] [data-ok="false"]').count()) === 1
    && (await m.locator('[data-pitch-zone][data-missing="true"]').count()) === 1);
  // Le second terme par un VRAI glisser (pointeur), de la grille vers la somme.
  const src = m.locator('[data-pitch-grid] [data-drag-source="z:0-1"]');
  const dst = m.locator('[data-drop-zone="sum"]');
  await src.scrollIntoViewIfNeeded();
  const a = await src.boundingBox(); const b = await dst.boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 10; i += 1) await page.mouse.move(a.x + a.width / 2 + ((b.x + 20 - a.x - a.width / 2) * i) / 10, a.y + a.height / 2 + ((b.y + b.height / 2 - a.y - a.height / 2) * i) / 10);
  await page.mouse.up();
  await page.waitForTimeout(300);
  check('L1 مبتدئ : le glisser porte la zone 15 dans la somme', (await m.locator('[data-tray-chip]').count()) === 2);
  await m.locator('[data-pitch-check]').click();
  await page.waitForTimeout(250);
  await bumpX(page, m);
  await m.locator('[data-pitch-check]').click();
  await page.waitForTimeout(400);
  check('L1 مبتدئ : vérifiée pour deux valeurs de x → la découverte s’ouvre', (await m.locator('[data-pitch-trials] [data-ok="true"]').count()) >= 2 && (await m.getAttribute('data-phase')) === 'discover');
  await ctx.close();
}

// ── 3b. pitch-expansion (3x − 1)(3 + x) — réunir les semblables ───────────
{
  const { ctx, page } = await fresh({ lesson: 'nashr-tabsit' });
  await go(page, `${BASE}${modulePath('nashr-tabsit', 'trigger')}`);
  await pickLevel(page, 'advanced');
  const m = await visibleManip(page, 'pitch-expansion');
  await m.waitFor();
  for (const id of ['0-0', '1-0', '0-1', '1-1']) await tapCarry(page, m, `z:${id}`, 'sum');
  check('L1 متقدم : quatre termes dans la somme', (await m.locator('[data-tray-chip]').count()) === 4);
  // x² (zone 0-1) refuse 9x (zone 0-0) ; 9x reçoit −x (zone 1-1).
  await tapCarry(page, m, 'c:t0-1', 'chip:t0-0');
  check('L1 متقدم : 3x² et 9x ne se réunissent pas', (await m.locator('[data-tray-chip]').count()) === 4 && (await text(m.locator('[data-pitch-notice]'))).length > 0);
  await page.keyboard.press('Escape');
  await tapCarry(page, m, 'c:t1-1', 'chip:t0-0');
  const sum = await text(m.locator('[data-pitch-sum]'));
  check('L1 متقدم : 9x et −x réunis en 8x', (await m.locator('[data-tray-chip]').count()) === 3 && sum.includes('8x'), sum);
  await ctx.close();
}

// ── 3c. turf-factoring rows 6x² + 4x ───────────────────────────────────────
{
  const { ctx, page } = await fresh({ lesson: 'tahlil-ibara' });
  await go(page, `${BASE}${modulePath('tahlil-ibara', 'trigger')}`);
  await pickLevel(page, 'advanced');
  const m = await visibleManip(page, 'turf-factoring');
  await m.waitFor();
  const h = m.locator('[data-stretch-handle]').first();
  await h.focus();
  await page.keyboard.press('Home');
  for (let i = 0; i < 2; i += 1) await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(900);
  check('L3 rows : 3 rangées refusées pour 6x² + 4x', (await m.locator('[data-turf-field]').getAttribute('data-valid')) === 'false' && await m.locator('[data-turf-leftover]').count() === 1);
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(900);
  const rep = await text(m.locator('[data-manipulation-representation]'));
  check('L3 rows : 2 rangées → 2x(3x + 2)', (await m.locator('[data-turf-field]').getAttribute('data-valid')) === 'true' && rep.includes('2x(3x+2)'), rep);
  check('L3 rows : découverte ouverte (PGCD essayé et un refus)', (await m.getAttribute('data-phase')) === 'discover');
  await ctx.close();
}

// ── 3d. turf-factoring square x² + 6x + 9 ──────────────────────────────────
{
  const { ctx, page } = await fresh({ lesson: 'tahlil-ibara' });
  await go(page, `${BASE}${modulePath('tahlil-ibara', 'trigger')}`);
  const sq = page.locator('[data-manipulation="turf-factoring"]:has([data-turf-factoring][data-mode="square"])').first();
  await sq.waitFor({ timeout: 15000 }).catch(() => {});   // posé dans une étape, chargé à la demande
  if (await sq.count()) {
    await sq.scrollIntoViewIfNeeded();
    for (let i = 0; i < 2; i += 1) await tapCarry(page, sq, 'strip:stock', 'right');
    for (let i = 0; i < 4; i += 1) await tapCarry(page, sq, 'strip:stock', 'bottom');
    await sq.locator('[data-turf-close]').click();
    await page.waitForTimeout(250);
    check('L3 square : 2 | 4 refusé (le coin exige 8)', (await sq.locator('[data-turf-square]').getAttribute('data-closed')) === 'false');
    await tapCarry(page, sq, 'strip:bottom', 'right');
    await sq.locator('[data-turf-close]').click();
    await page.waitForTimeout(250);
    const rep = await text(sq.locator('[data-manipulation-representation]'));
    check('L3 square : 3 | 3 ferme (x + 3)²', (await sq.locator('[data-turf-square]').getAttribute('data-closed')) === 'true' && rep.includes('(x+3)'), rep);
  } else {
    check('L3 square : le laboratoire carré est posé dans le module d’activité', false);
  }
  await ctx.close();
}

// ── 4. Le ballon est un décor : hors clavier, aria-hidden ─────────────────
{
  const { ctx, page } = await fresh({ lesson: 'nashr-tabsit' });
  await go(page, `${BASE}${modulePath('nashr-tabsit', 'trigger')}`);
  const ball = page.locator('[data-decor-ball]').first();
  check('décor : le ballon est aria-hidden et hors du parcours clavier', (await ball.getAttribute('aria-hidden')) === 'true' && (await ball.getAttribute('tabindex')) === '-1');
  await ctx.close();
}

await browser.close();
if (errors.length) console.log('\nErreurs console :', errors.slice(0, 10));
process.exit(summary() > 0 ? 1 : 0);
