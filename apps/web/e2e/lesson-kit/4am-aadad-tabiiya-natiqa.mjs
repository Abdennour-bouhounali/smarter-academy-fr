// 4AM — الوحدة 1 « الأعداد الطبيعيّة والأعداد النّاطقة » (phase 8).
//
// Ce que ce fichier garde :
//   1. la page d'UNITÉ liste les 8 leçons du manuel dans son ordre, puis la
//      synthèse « أدمج تعلّماتي » à part ;
//   2. la RÈGLE DURE du laboratoire d'ouverture (INTERACTION_PEDAGOGY §6bis) :
//      en arrivant sur le module 1 de la leçon 1, la manipulation est
//      utilisable IMMÉDIATEMENT ;
//   3. les manipulations RÉPONDENT au geste de l'élève (poser un objet dans
//      une zone) — le détail du geste, du refus expliqué, de l'absence de
//      bascule de mode et de l'accessibilité vit dans manipulations.mjs ;
//   4. rien ne déborde horizontalement sur un téléphone (RTL).
//
// Run : KIT_BASE=http://localhost:5183 node apps/web/e2e/lesson-kit/4am-aadad-tabiiya-natiqa.mjs
import { BASE, launch, newCtx, watchErrors, check, summary, noHorizontalScroll, seed, lessonKey } from './helpers.mjs';

const CH = `${BASE}/courses/moyen/4am/ansab_al_aadad_wal_hisab`;
const UNIT = `${CH}/units/aadad-tabiiya-natiqa`;
const LESSONS = ['qasim-adad-tabii', 'qawasim-adad-tabii', 'khawass-qawasim', 'qasim-mushtarak-akbar', 'tayin-pgcd', 'bahth-pgcd', 'awwaliyan-fima-baynahuma', 'ikhtizal-kasr'];
const errors = [];
const { browser } = await launch();

// `completed` : les modules déjà faits (déverrouillage séquentiel) — une
// visite directe d'un module verrouillé n'affiche pas la manipulation.
async function fresh({ mobile = false, completed = null, lesson = null } = {}) {
  const ctx = await newCtx(browser, { mobile });
  const page = await ctx.newPage();
  watchErrors(page, errors);
  if (completed && lesson) await seed(page, completed, lessonKey(lesson));
  return { ctx, page };
}

// ── 1. La page d'unité ────────────────────────────────────────────────────
{
  const { ctx, page } = await fresh();
  await page.goto(UNIT, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-unit="aadad-tabiiya-natiqa"]');
  const ids = await page.$$eval('[data-unit-lesson]', (els) => els.map((e) => e.getAttribute('data-unit-lesson')));
  check('unité : 8 leçons + 1 synthèse, dans l’ordre du manuel', JSON.stringify(ids) === JSON.stringify([...LESSONS, 'wadiya-idmajiya-aadad']), ids.join(','));
  check('unité : le défi d’ouverture est affiché', await page.$('[data-unit-challenge]') !== null);
  check('unité : la première leçon est ouvrable', (await page.$$(`a[href="${new URL(`${CH}/qasim-adad-tabii`).pathname}"]`)).length > 0);
  check('unité : aucun débordement horizontal', await noHorizontalScroll(page));
  await ctx.close();
}

/**
 * Choisir un niveau dans l'atelier à deux niveaux (MANIPULATION_CONTRACT
 * §7bis-levels) : les manipulations du manuel vivent au niveau متقدم.
 */
/**
 * La manipulation de `type` DANS le panneau de niveau visible. Un même type
 * peut servir les deux niveaux (les différences servent 21/14 et 252/140) :
 * `.first()` attraperait alors le panneau masqué.
 */
async function visibleManip(page, type) {
  const scoped = page.locator(`[data-manipulation-level-panel]:not([hidden]) [data-manipulation="${type}"]`).first();
  if (await scoped.count()) return scoped;
  return page.locator(`[data-manipulation="${type}"]`).first();
}

async function pickLevel(page, level = 'advanced') {
  const tab = page.locator(`[data-manipulation-workspace] [role="tab"][data-level="${level}"]`).first();
  if (!(await tab.count())) return false;
  await tab.click();
  await page.waitForTimeout(350);
  return true;
}

// ── 2. Leçon 1, module 1 : l'atelier à deux niveaux est là dès l'entrée ───
//    مبتدئ (les équipes) est offert d'office ; la bibliothèque du manuel est
//    le niveau متقدم. Voir MANIPULATION_CONTRACT §7bis-levels.
{
  const { ctx, page } = await fresh();
  await page.goto(`${CH}/qasim-adad-tabii/al-maktaba`, { waitUntil: 'networkidle' });
  const ws = page.locator('[data-manipulation-workspace]').first();
  await ws.waitFor();
  check('L1 M1 : l’atelier ouvre sur le niveau مبتدئ, utilisable aussitôt',
    (await ws.getAttribute('data-level')) === 'beginner'
    && await page.locator('[data-manipulation="team-builder"]').first().isVisible());
  await ws.locator('[role="tab"][data-level="advanced"]').click();
  await page.waitForTimeout(350);
  await page.waitForSelector('[data-manipulation="divisor-explorer-books"]');
  const manip = page.locator('[data-manipulation="divisor-explorer-books"]').first();
  check('L1 M1 : le niveau متقدم donne la bibliothèque du manuel — un rayon à étirer', await manip.locator('[data-stretch-handle][role="slider"]').isVisible());
  // Étirer le rayon EST l'expérience (glisser, toucher et −/+ : manipulations.mjs).
  const handle = manip.locator('[data-stretch-handle]');
  await handle.focus();
  await page.keyboard.press('Home');
  for (let i = 10; i < 28; i += 1) await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(900);
  check('L1 M1 : un rayon de 28 range les 420 livres sans reste (15 rayons)', ((await manip.locator('[data-manipulation-representation]').textContent()) ?? '').replace(/\s/g, '').includes('420=28×15+0') && (await manip.locator('[data-shelf]').count()) === 15);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(900);
  check('L1 M1 : un rayon de 26 laisse 4 livres, dessinés au sol', (await manip.locator('[data-floor-book]').count()) === 4);
  // Les PREUVES de l'élève remontent dans l'étape 1 — rien de ce qu'il n'a pas essayé.
  check('L1 M1 : l’étape 1 relit les essais de l’élève (26 et 28 essayés)', (await page.locator('[data-activity-evidence] [data-tried="true"]').count()) === 2);
  check('L1 M1 : pas de débordement', await noHorizontalScroll(page));
  await ctx.close();
}

// ── 3. Leçon 6 : différences successives — poser le petit sur le grand ───
{
  const { ctx, page } = await fresh();
  await page.goto(`${CH}/bahth-pgcd/al-furuq`, { waitUntil: 'networkidle' });
  await pickLevel(page);
  const manip = await visibleManip(page, 'pgcd-differences');
  await manip.waitFor();
  check('L6 M1 : la manipulation démarre en وضع التلميذ', (await manip.getAttribute('data-manipulation-mode')) === 'student');
  const big = manip.locator('[data-drop-zone="big"]');
  await manip.locator('[data-drag-source="num:small"]').first().click();
  await big.click();
  await page.waitForTimeout(200);
  check('L6 M1 : le premier geste écrit 252 − 140 = 112', (await manip.locator('[data-difference-chain]').textContent()).includes('112'));
  await manip.locator('[data-drag-source="num:small"]').first().click();
  await big.click();
  await page.waitForTimeout(200);
  const rows = await manip.locator('[data-difference-chain] > li').count();
  check('L6 M1 : chaque geste ajoute un maillon à la chaîne', rows === 2, String(rows));
  await manip.getByRole('button', { name: 'إعادة' }).click();
  await page.waitForTimeout(250);
  check('L6 M1 : « إعادة » remet la chaîne à zéro', (await manip.locator('[data-difference-chain]').count()) === 0);
  await ctx.close();
}

// ── 4. Leçon 6 : Euclide 765/135 — les copies, puis 3 divisions ──────────
{
  const { ctx, page } = await fresh({ completed: ['1', '2'], lesson: 'bahth-pgcd' });
  await page.goto(`${CH}/bahth-pgcd/khwarizmiyat-iqlidus`, { waitUntil: 'networkidle' });
  await pickLevel(page);
  const manip = await visibleManip(page, 'euclidean-algorithm');
  await manip.waitFor();
  // وضع التلميذ seul : l'élève pose les copies du diviseur lui-même.
  check('L6 M3 : aucune bascule « وضع القسم »', (await manip.getByRole('button', { name: 'وضع القسم' }).count()) === 0);
  for (let i = 0; i < 5; i += 1) {
    await manip.locator('[data-drag-source="copy"]').first().click();
    await manip.locator('[data-drop-zone="dividend"]').click();
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(300);
  const text = await manip.textContent();
  check('L6 M3 : 5 copies de 135 tiennent dans 765, le reste est 90', text.includes('5') && text.includes('90'));
  await ctx.close();
}

// ── 5. Leçon 8 : la réduction de سمير, mobile ─────────────────────────────
{
  const { ctx, page } = await fresh({ mobile: true, completed: ['0'], lesson: 'ikhtizal-kasr' });
  await page.goto(`${CH}/ikhtizal-kasr/samir`, { waitUntil: 'networkidle' });
  await pickLevel(page);
  const manip = await visibleManip(page, 'fraction-reduction');
  await manip.waitFor();
  const fraction = manip.locator('[data-drop-zone="fraction"]');
  await manip.locator('[data-drag-source="k:4"]').first().click();
  await fraction.click();
  await page.waitForTimeout(200);
  await manip.locator('[data-drag-source="k:3"]').first().click();
  await fraction.click();
  await page.waitForTimeout(250);
  // C'est l'ÉLÈVE qui déclare le kasr irréductible (2026-09-30) ; la scène ne l'annonce plus.
  check('L8 M1 : à 7/4, rien n’est annoncé d’office', !(await manip.textContent()).includes('كسر غير قابل للاختزال'));
  await manip.locator('[data-claim-irreducible]').click();
  await page.waitForTimeout(250);
  const text = await manip.textContent();
  check('L8 M1 : ÷4 puis ÷3, puis « لا يمكن الاختزال أكثر » → kasr irréductible (7/4)', text.includes('كسر غير قابل للاختزال'));
  check('L8 M1 (mobile) : aucun débordement horizontal', await noHorizontalScroll(page));
  await ctx.close();
}

// ── 6. Chaque leçon a une page d'index qui rend ───────────────────────────
for (const code of [...LESSONS, 'wadiya-idmajiya-aadad']) {
  const { ctx, page } = await fresh();
  const res = await page.goto(`${CH}/${code}`, { waitUntil: 'networkidle' });
  const ok = res?.ok() && (await page.$('[data-lesson-structure]')) !== null;
  check(`index de « ${code} » : rend la structure (points d’apprentissage)`, ok);
  await ctx.close();
}

await browser.close();
check('aucune erreur console/page sur le parcours', errors.length === 0, errors.slice(0, 3).join(' | '));
summary();
