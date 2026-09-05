// D2 — mobile 375x667 touch: nombres-decimaux V2 — index, M1 (tap flow), M2 (shade workshop tap),
// M7 (ordering game formative tap), boss.
import { BASE, launch, newCtx, watchErrors, check, summary, getProgress, seed, lessonKey, noHorizontalScroll, SHOT_DIR } from './helpers.mjs';
const L = `${BASE}/courses/college/6e/nombres_calculs/nombres-decimaux`;
const KEY = lessonKey('nombres-decimaux');
const errors = [];
const { browser } = await launch();
async function freshPage(completed) { const ctx = await newCtx(browser, { mobile: true }); const page = await ctx.newPage(); watchErrors(page, errors); if (completed) await seed(page, completed, KEY); return { ctx, page }; }
const S = (page, n) => page.locator(`#step-${n}`);
async function tapTargetsOk(page) {
  const boxes = await page.locator('main').getByRole('button').evaluateAll((els) => els.filter((e) => !e.disabled && e.offsetParent !== null).map((e) => { const r = e.getBoundingClientRect(); return [r.width, r.height, e.textContent.trim().slice(0, 30)]; }));
  const small = boxes.filter(([w, h]) => h < 40 || w < 40);
  return { ok: small.length === 0, small: small.slice(0, 5) };
}
async function block(name, fn) {
  try { await fn(); } catch (e) { check(`${name}: block crashed — ${String(e.message || e).split('\n')[0].slice(0, 140)}`, false); }
}

/* Index + Module 1 (tap flow) */
await block('Index + Module 1', async () => {
  const { ctx, page } = await freshPage(null);
  await page.goto(L, { waitUntil: 'networkidle' });
  check('dm index: no horizontal scroll', await noHorizontalScroll(page));
  await page.goto(`${L}/entre-deux-nombres`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Pourquoi les nombres décimaux ?');
  check('dm m1: no horizontal scroll', await noHorizontalScroll(page));
  const t = await tapTargetsOk(page);
  check('dm m1: tap targets ≥ 40px', t.ok, JSON.stringify(t.small));
  // Scene 1: tap "Non" for both questions (correct — the measure is neither exactly 3 m nor 4 m)
  await S(page, 1).getByRole('button', { name: 'Non', exact: true }).tap();
  await page.waitForTimeout(300);
  await S(page, 1).getByRole('button', { name: 'Non', exact: true }).last().tap();
  await page.waitForTimeout(300);
  check('dm m1: step 2 reached via taps', (await page.getByText("termine l'étape précédente").count()) === 4);
  await page.screenshot({ path: SHOT_DIR + 'dm-m1.png', fullPage: true });
  check('dm m1: no horizontal scroll after', await noHorizontalScroll(page));
  await ctx.close();
});

/* Module 2 — shade workshop via tap */
await block('Module 2', async () => {
  const { ctx, page } = await freshPage(['1']);
  await page.goto(`${L}/decouper-unite`, { waitUntil: 'networkidle' });
  await page.waitForSelector("text=Découper l'unité");
  check('dm m2: no horizontal scroll', await noHorizontalScroll(page));
  await S(page, 1).getByRole('button', { name: /Partager en 10 parts égales/ }).tap();
  await page.waitForTimeout(300);
  await S(page, 1).getByRole('button', { name: '10', exact: true }).tap();
  await page.waitForTimeout(300);
  check('dm m2: step 2 unlocked via tap', (await page.getByText("termine l'étape précédente").count()) === 2);
  // Shade 3 tenths by tapping the 3rd part cell
  const cells = S(page, 2).locator('[aria-label^="Part "]');
  await cells.nth(0).tap();
  await cells.nth(1).tap();
  await cells.nth(2).tap();
  await page.waitForTimeout(150);
  await S(page, 2).getByRole('button', { name: 'Vérifier' }).tap();
  await page.waitForTimeout(300);
  check('dm m2: shade workshop solved via tap', (await page.getByText("termine l'étape précédente").count()) === 1);
  check('dm m2: no horizontal scroll after taps', await noHorizontalScroll(page));
  await page.screenshot({ path: SHOT_DIR + 'dm-m2.png', fullPage: true });
  await ctx.close();
});

/* Module 7 — OrderingGame formative, via tap */
await block('Module 7', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6']);
  await page.goto(`${L}/comparer-ranger`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Comparer et ranger');
  check('dm m7: no horizontal scroll', await noHorizontalScroll(page));
  const t = await tapTargetsOk(page);
  check('dm m7: tap targets ≥ 40px', t.ok, JSON.stringify(t.small));
  await ctx.close();
});

/* Boss — mobile QCM tap flow */
await block('Boss (mobile)', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
  await page.goto(`${L}/boss-final`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Le Laboratoire des Décimaux');
  check('mobile boss: no horizontal scroll', await noHorizontalScroll(page));
  const t = await tapTargetsOk(page);
  check('mobile boss: tap targets ≥ 40px', t.ok, JSON.stringify(t.small));
  const epreuve = (n) => page.locator('main').getByText(`${n} / 8`).locator('..').locator('..');
  const tapPick = async (n, text) => { const b = epreuve(n).getByRole('button', { name: text, exact: true }); await b.scrollIntoViewIfNeeded(); await b.tap(); };
  const CORRECT = ['0,75 kg', null, '5 centièmes', '0,7 L', '0,05 < 0,25 < 0,5 < 0,75', '1,25', 'Environ 3 kg', 'Le total fait exactement 2 L'];
  for (let i = 0; i < CORRECT.length; i++) {
    if (i === 1) {
      // épreuve 2 uses KaTeX fraction options — tap by index (0 = 308/100, the correct one)
      const grp = epreuve(2).getByRole('group').first();
      const b = grp.getByRole('button').nth(1);
      await b.scrollIntoViewIfNeeded();
      await b.tap();
      continue;
    }
    await tapPick(i + 1, CORRECT[i]);
  }
  const submit = page.getByRole('button', { name: 'Valider mes 8 réponses' });
  await submit.scrollIntoViewIfNeeded();
  await submit.tap();
  await page.waitForTimeout(700);
  check('mobile boss: review 8 / 8', await page.getByText('8 / 8').first().isVisible().catch(() => false));
  check('mobile boss: no horizontal scroll on review', await noHorizontalScroll(page));
  await page.screenshot({ path: SHOT_DIR + 'mob-decimaux-boss-review.png', fullPage: true });
  await page.getByRole('button', { name: /Voir mon profil de maîtrise/ }).tap();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Passer à la synthèse →' }).tap();
  await page.waitForTimeout(400);
  check('mobile boss: synthèse no horizontal scroll', await noHorizontalScroll(page));
  await page.screenshot({ path: SHOT_DIR + 'mob-decimaux-boss-synthese.png', fullPage: true });
  const p = await getProgress(page, KEY);
  check('mobile boss: completedModules has 11', !!p?.completedModules?.includes('11'));
  await ctx.close();
});

check('no console/page errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
