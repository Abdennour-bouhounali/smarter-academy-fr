// C2 — mobile 375×667 touch: contenances V2 — index, M1 (pour), M4 (group builder), M6 (InfoSorter two-tap), boss.
import { BASE, launch, newCtx, watchErrors, check, summary, getProgress, seed, lessonKey, noHorizontalScroll, SHOT_DIR } from './helpers.mjs';
const L = `${BASE}/courses/college/6e/grandeurs_mesures/contenances`;
const KEY = lessonKey('contenances');
const errors = [];
const { browser } = await launch();
async function freshPage(completed) { const ctx = await newCtx(browser, { mobile: true }); const page = await ctx.newPage(); watchErrors(page, errors); if (completed) await seed(page, completed, KEY); return { ctx, page }; }
const S = (page, n) => page.locator(`#step-${n}`);
async function tapTargetsOk(page) {
  const boxes = await page.locator('main').getByRole('button').evaluateAll((els) => els.filter((e) => !e.disabled && e.offsetParent !== null).map((e) => { const r = e.getBoundingClientRect(); return [r.width, r.height, e.textContent.trim().slice(0, 30)]; }));
  const small = boxes.filter(([w, h]) => h < 40 || w < 40);
  return { ok: small.length === 0, small: small.slice(0, 5) };
}
{
  const { ctx, page } = await freshPage(null);
  await page.goto(L, { waitUntil: 'networkidle' });
  check('cm index: no horizontal scroll', await noHorizontalScroll(page));
  await page.goto(`${L}/lequel-contient-le-plus`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=lequel contient le plus');
  check('cm m1: no horizontal scroll', await noHorizontalScroll(page));
  const t = await tapTargetsOk(page); check('cm m1: tap targets ≥ 40px', t.ok, JSON.stringify(t.small));
  await S(page, 1).getByRole('button', { name: /La bouteille/ }).first().tap();
  await S(page, 1).getByRole('button', { name: /Vérifier par transvasement/ }).tap();
  await S(page, 1).getByText('Surprise !').waitFor({ timeout: 8000 });
  await S(page, 1).getByRole('button', { name: /La bouteille/ }).last().tap(); await page.waitForTimeout(400);
  const mth = S(page, 2).getByRole('button', { name: /Utiliser le même verre/ }); await mth.scrollIntoViewIfNeeded(); await mth.tap(); await page.waitForTimeout(300);
  for (const [c, n] of [['A', 6], ['B', 4]]) {
    for (let i = 0; i < n; i++) { const b = S(page, 2).getByRole('button', { name: `Mesurer un verre dans le récipient ${c}` }); await b.scrollIntoViewIfNeeded(); await b.tap(); await page.waitForTimeout(2100); }
  }
  const ans = S(page, 2).getByRole('button', { name: '🍶 A', exact: true }); await ans.scrollIntoViewIfNeeded(); await ans.tap(); await page.waitForTimeout(400);
  check('cm m1: done via taps', await page.getByRole('button', { name: /Module suivant/ }).last().isEnabled().catch(() => false));
  check('cm m1: no horizontal scroll after', await noHorizontalScroll(page));
  await page.screenshot({ path: SHOT_DIR + 'cm-m1.png', fullPage: true });
  await ctx.close();
}
{
  const { ctx, page } = await freshPage(['1', '2', '3']);
  await page.goto(`${L}/construire-les-relations`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Construire les relations');
  check('cm m4: no horizontal scroll', await noHorizontalScroll(page));
  for (let i = 0; i < 10; i++) { await S(page, 1).getByRole('button', { name: /^Remplir la mesure de 1 dL / }).tap(); await page.waitForTimeout(1900); }
  check('cm m4: 10 pours via taps → 1 L = 10 dL', await S(page, 1).getByText('10 × 1 dL = 1 L').isVisible().catch(() => false));
  check('cm m4: step 2 unlocked', (await page.getByText("termine l'étape précédente").count()) === 3);
  check('cm m4: no horizontal scroll after pours', await noHorizontalScroll(page));
  await page.screenshot({ path: SHOT_DIR + 'cm-m4.png', fullPage: true });
  await ctx.close();
}
{
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5']);
  await page.goto(`${L}/lien-volume-mission-finale`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Le Grand Défi des Contenances');
  check('mobile boss: no horizontal scroll', await noHorizontalScroll(page));
  const t = await tapTargetsOk(page);
  check('mobile boss: tap targets ≥ 40px', t.ok, JSON.stringify(t.small));
  const epreuve = (n) => page.locator('main').getByText(`${n} / 10`).locator('..').locator('..');
  const tapPick = async (n, text) => { const b = epreuve(n).getByRole('button', { name: text, exact: true }); await b.scrollIntoViewIfNeeded(); await b.tap(); };
  const CORRECT = [
    'Non, il faut mesurer ou transvaser', 'Utiliser toujours le même verre', 'Le litre', '10 bols',
    '10 gobelets', '10 mL', '1 000 mL', '500 mL', '5', 'Je verse 50 + 30',
  ];
  for (let i = 0; i < CORRECT.length; i++) await tapPick(i + 1, CORRECT[i]);
  const submit = page.getByRole('button', { name: 'Valider mes 10 réponses' }); await submit.scrollIntoViewIfNeeded(); await submit.tap();
  await page.waitForTimeout(700);
  check('mobile boss: review 10 / 10', await page.getByText('10 / 10').first().isVisible().catch(() => false));
  check('mobile boss: no horizontal scroll on review', await noHorizontalScroll(page));
  await page.screenshot({ path: SHOT_DIR + 'mob-boss-review.png', fullPage: true });
  await page.getByRole('button', { name: /Voir mon profil de maîtrise/ }).tap(); await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Passer à la synthèse →' }).tap(); await page.waitForTimeout(400);
  check('mobile boss: synthèse no horizontal scroll', await noHorizontalScroll(page));
  await page.screenshot({ path: SHOT_DIR + 'mob-boss-synthese.png', fullPage: true });
  const p = await getProgress(page, KEY);
  check('mobile boss: completedModules has 6', !!p?.completedModules?.includes('6'));
  await ctx.close();
}
check('no console/page errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
