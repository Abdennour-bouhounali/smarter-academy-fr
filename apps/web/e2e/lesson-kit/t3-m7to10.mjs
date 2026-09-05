// T3 — desktop: modules 7–10 full fresh flows.
import { LESSON, launch, newCtx, watchErrors, check, summary, getProgress, seed, SHOT_DIR } from './helpers.mjs';
const errors = [];
const { browser } = await launch();
async function freshPage(completed) { const ctx = await newCtx(browser); const page = await ctx.newPage(); watchErrors(page, errors); await seed(page, completed); return { ctx, page }; }
const S = (page, n) => page.locator(`#step-${n}`);
{
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6']);
  await page.goto(`${LESSON}/7`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Ranger et encadrer');
  for (const v of ['5.020', '4.502', '4.250', '3.999', '4.999']) await S(page, 1).getByRole('button', { name: new RegExp(`^Placer ${v}$`) }).click();
  await S(page, 1).getByRole('button', { name: 'Vérifier mon rangement' }).click(); await page.waitForTimeout(500);
  check('m7 s1: formative wrong order still completes', (await page.getByText("termine l'étape précédente").count()) === 1);
  await page.screenshot({ path: SHOT_DIR + 'v2-m7-s1-formative.png' });
  for (const v of ['5.020', '4.999', '4.502', '4.250', '3.999']) await S(page, 2).getByRole('button', { name: new RegExp(`^Placer ${v}$`) }).click();
  await S(page, 2).getByRole('button', { name: 'Vérifier mon rangement' }).click(); await page.waitForTimeout(500);
  check('m7 s2: done, s3 unlocked', (await page.getByText("termine l'étape précédente").count()) === 0);
  const low = () => S(page, 3).getByRole('textbox', { name: 'Borne inférieure' }).last();
  const high = () => S(page, 3).getByRole('textbox', { name: 'Borne supérieure' }).last();
  await low().fill('4000'); await high().fill('5000');
  await S(page, 3).getByRole('button', { name: "Valider l'encadrement" }).last().click(); await page.waitForTimeout(400);
  await low().fill('4000'); await high().fill('4600');
  await S(page, 3).getByRole('button', { name: "Valider l'encadrement" }).last().click(); await page.waitForTimeout(400);
  check('m7 s3 n2: wrong shows ta réponse + bonne réponse', await S(page, 3).getByText('Ta réponse :').isVisible().catch(() => false));
  await low().fill('4580'); await high().fill('4590');
  await S(page, 3).getByRole('button', { name: "Valider l'encadrement" }).last().click(); await page.waitForTimeout(400);
  check('m7 s3: recap 3 encadrements', await S(page, 3).getByText('Trois encadrements du même nombre').isVisible().catch(() => false));
  await S(page, 3).getByRole('button', { name: '9 000 et 10 000', exact: true }).click(); await page.waitForTimeout(400);
  check('m7: next enabled', await page.getByRole('button', { name: /Module suivant/ }).last().isEnabled().catch(() => false));
  const p = await getProgress(page);
  check('m7: completedModules has 7', !!p?.completedModules?.includes('7'));
  await ctx.close();
}
{
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6', '7']);
  await page.goto(`${LESSON}/8`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=La demi-droite graduée');
  const input1 = () => S(page, 1).getByRole('textbox').last();
  await input1().fill('30'); await S(page, 1).getByRole('button', { name: 'OK' }).last().click(); await page.waitForTimeout(300);
  await input1().fill('7000'); await S(page, 1).getByRole('button', { name: 'OK' }).last().click(); await page.waitForTimeout(300);
  check('m8 s1: wrong shows ta réponse/bonne réponse', await S(page, 1).getByText('Ta réponse :').isVisible().catch(() => false));
  check('m8 s1: done, s2 unlocked', (await page.getByText("termine l'étape précédente").count()) === 2);
  await S(page, 2).getByRole('button', { name: '100', exact: true }).last().click(); await page.waitForTimeout(300);
  await S(page, 2).getByRole('button', { name: '50', exact: true }).last().click(); await page.waitForTimeout(300);
  const slider = () => S(page, 3).getByRole('slider').last();
  await slider().focus(); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
  await S(page, 3).getByRole('button', { name: 'Valider ma position' }).last().click(); await page.waitForTimeout(300);
  check('m8 s3 p1: position exacte', await S(page, 3).getByText('Position exacte !').isVisible().catch(() => false));
  await slider().focus(); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
  await S(page, 3).getByRole('button', { name: 'Valider ma position' }).last().click(); await page.waitForTimeout(300);
  check('m8 s3 p2: écart feedback on wrong', await S(page, 3).getByText(/un écart de/).isVisible().catch(() => false));
  await S(page, 4).getByRole('button', { name: /5 graduations, soit 2.500/ }).click(); await page.waitForTimeout(400);
  check('m8: next enabled', await page.getByRole('button', { name: /Module suivant/ }).last().isEnabled().catch(() => false));
  const p = await getProgress(page);
  check('m8: completedModules has 8', !!p?.completedModules?.includes('8'));
  await ctx.close();
}
{
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6', '7', '8']);
  await page.goto(`${LESSON}/9`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Les nombres dans le monde réel');
  await S(page, 1).getByRole('button', { name: /Habitants d'une ville/ }).click(); await page.waitForTimeout(400);
  check('m9 s1: wrong shows correctionLabel', await S(page, 1).getByText('la distance Terre – Lune (384 400 km)').isVisible().catch(() => false));
  check('m9 s1: wrong still completes', (await page.getByText("termine l'étape précédente").count()) === 1);
  check('m9 s1: spellFr footer after done', await S(page, 1).getByText(/6 chiffres —/).first().isVisible().catch(() => false));
  await S(page, 2).getByRole('button', { name: '650', exact: true }).click(); await page.waitForTimeout(200);
  await S(page, 2).getByRole('button', { name: /^500.000$/ }).click(); await page.waitForTimeout(200);
  await S(page, 2).getByRole('button', { name: '350', exact: true }).click(); await page.waitForTimeout(300);
  check('m9 s2: ordre de grandeur info', await S(page, 2).getByText('ordre de grandeur', { exact: false }).first().isVisible().catch(() => false));
  await S(page, 3).getByRole('button', { name: /^9.875$/ }).click(); await page.waitForTimeout(400);
  check('m9 s3: village B révélé', await S(page, 3).getByText(/^9.875$/).first().isVisible().catch(() => false));
  check('m9: next enabled', await page.getByRole('button', { name: /Module suivant/ }).last().isEnabled().catch(() => false));
  const p = await getProgress(page);
  check('m9: completedModules has 9', !!p?.completedModules?.includes('9'));
  await ctx.close();
}
{
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
  await page.goto(`${LESSON}/10`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Problèmes : choisir et interpréter');
  await S(page, 1).getByRole('button', { name: /La bibliothèque Centre \(12/ }).click(); await page.waitForTimeout(300);
  await S(page, 1).getByRole('button', { name: /En comparant le nombre de chiffres/ }).click(); await page.waitForTimeout(300);
  await S(page, 1).getByRole('textbox').last().fill('2');
  await S(page, 1).getByRole('button', { name: 'OK' }).last().click(); await page.waitForTimeout(300);
  check('m10 q3: trap-2 targeted feedback', await S(page, 1).getByText('2 est le chiffre des milliers').isVisible().catch(() => false));
  await S(page, 1).getByRole('button', { name: '9 000 et 10 000', exact: true }).click(); await page.waitForTimeout(300);
  check('m10 s1: done', (await page.getByText("termine l'étape précédente").count()) === 1);
  await S(page, 2).getByRole('textbox').last().fill('8500');
  await S(page, 2).getByRole('button', { name: 'OK' }).last().click(); await page.waitForTimeout(300);
  await S(page, 2).getByRole('button', { name: 'Villeneuve < Belleroche < Saint-Amaury' }).click(); await page.waitForTimeout(300);
  await S(page, 2).getByRole('button', { name: /Oui : 47.080 est compris/ }).click(); await page.waitForTimeout(400);
  check('m10 s2: number line recap', await S(page, 2).getByText('B = Belleroche').isVisible().catch(() => false));
  const myst = () => S(page, 3).getByRole('textbox', { name: 'Nombre mystère' });
  for (const g of ['1111', '2222', '3333']) { await myst().fill(g); await S(page, 3).getByRole('button', { name: 'Vérifier', exact: true }).click(); await page.waitForTimeout(300); }
  check('m10 s3: force-reveal after 3 attempts', await S(page, 3).getByText('Pas grave, on te le donne').isVisible().catch(() => false));
  check('m10 s3: place value table shown', await S(page, 3).getByText(/6.307/).first().isVisible().catch(() => false));
  await S(page, 3).getByRole('button', { name: '6 300 et 6 400', exact: true }).click(); await page.waitForTimeout(400);
  check('m10: next enabled', await page.getByRole('button', { name: /Module suivant/ }).last().isEnabled().catch(() => false));
  const p = await getProgress(page);
  check('m10: completedModules has 10', !!p?.completedModules?.includes('10'));
  await page.screenshot({ path: SHOT_DIR + 'v2-m10-done.png', fullPage: true });
  await ctx.close();
}
check('no console/page errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
