// F2 — mobile 375×667 touch: fractions V2 — index, M0 (diagnostic tap flow), M1 (tap flow),
// M2 (construct-a-fraction tap), M8 (droite graduée keyboard/tap), boss.
import { BASE, launch, newCtx, watchErrors, check, summary, getProgress, seed, lessonKey, noHorizontalScroll, SHOT_DIR } from './helpers.mjs';
const L = `${BASE}/courses/college/6e/nombres_calculs/fractions`;
const KEY = lessonKey('fractions');
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

/* Index + Module 0 (diagnostic tap flow) */
await block('Index + Module 0', async () => {
  const { ctx, page } = await freshPage(null);
  await page.goto(L, { waitUntil: 'networkidle' });
  check('fm index: no horizontal scroll', await noHorizontalScroll(page));
  await page.goto(`${L}/mission-de-depart`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Mission de départ');
  check('fm m0: no horizontal scroll', await noHorizontalScroll(page));
  const diagQ = (n) => page.locator('main div.border-2.border-slate-200.bg-white.rounded-2xl.p-5').filter({ hasText: `${n} / 5` });
  await diagQ(1).getByRole('button', { name: '3', exact: true }).tap();
  await diagQ(2).getByRole('button', { name: 'Non, ça ne tombe pas juste', exact: true }).tap();
  await diagQ(3).getByRole('button', { name: '4', exact: true }).tap();
  await diagQ(4).getByRole('button', { name: 'Donner à chacun une part de la même taille', exact: true }).tap();
  await diagQ(5).getByRole('button', { name: '6', exact: true }).tap();
  const submit = page.getByRole('button', { name: 'Voir mon résultat' });
  await submit.scrollIntoViewIfNeeded();
  await submit.tap();
  await page.waitForSelector('text=Ta correction');
  check('fm m0: score 10 / 10 via taps', await page.getByText('10 / 10').first().isVisible().catch(() => false));
  check('fm m0: no horizontal scroll on result', await noHorizontalScroll(page));
  await page.screenshot({ path: SHOT_DIR + 'fm-m0.png', fullPage: true });
  await ctx.close();
});

/* Module 1 — tap flow */
await block('Module 1', async () => {
  const { ctx, page } = await freshPage(null);
  await page.goto(`${L}/partage-impossible`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Mission : Le partage impossible');
  check('fm m1: no horizontal scroll', await noHorizontalScroll(page));
  const t = await tapTargetsOk(page);
  check('fm m1: tap targets ≥ 40px', t.ok, JSON.stringify(t.small));
  const cellsS1 = S(page, 1).locator('[aria-label^="Part "]');
  await cellsS1.nth(0).tap(); await cellsS1.nth(1).tap(); await cellsS1.nth(2).tap();
  await page.waitForTimeout(300);
  check('fm m1: step 2 reached via taps', (await page.getByText("termine l'étape précédente").count()) === 1);
  await S(page, 2).getByRole('button', { name: '« 3 sur 4 », en indiquant les deux nombres : les parts prises et le total des parts', exact: true }).tap();
  await page.waitForTimeout(300);
  check('fm m1: step 3 reached via taps', (await page.getByText("termine l'étape précédente").count()) === 0);
  await S(page, 3).getByRole('button', { name: /Découvrir la notation/ }).tap();
  await page.waitForTimeout(300);
  check('fm m1: completed via taps', await page.getByRole('button', { name: /Module suivant/ }).last().isEnabled().catch(() => false));
  await page.screenshot({ path: SHOT_DIR + 'fm-m1.png', fullPage: true });
  check('fm m1: no horizontal scroll after', await noHorizontalScroll(page));
  await ctx.close();
});

/* Module 2 — construct-a-fraction tap */
await block('Module 2', async () => {
  const { ctx, page } = await freshPage(['1']);
  await page.goto(`${L}/construire-une-fraction`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Construire une fraction');
  check('fm m2: no horizontal scroll', await noHorizontalScroll(page));
  // Construction 1/4: target 1/2
  await S(page, 1).getByRole('button', { name: '2', exact: true }).tap();
  await page.waitForTimeout(150);
  await S(page, 1).locator('[aria-label^="Part "]').nth(0).tap();
  await page.waitForTimeout(150);
  await S(page, 1).getByRole('button', { name: 'Valider ma fraction' }).tap();
  await page.waitForTimeout(300);
  check('fm m2: construction 1 solved via taps', await S(page, 1).getByText('1 part prise sur 2 parts égales', { exact: false }).first().isVisible().catch(() => false));
  check('fm m2: no horizontal scroll after taps', await noHorizontalScroll(page));
  await page.screenshot({ path: SHOT_DIR + 'fm-m2.png', fullPage: true });
  await ctx.close();
});

/* Module 8 — droite graduée, keyboard-driven slider + tap validate */
await block('Module 8', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6', '7']);
  await page.goto(`${L}/sur-la-droite-graduee`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Sur la demi-droite graduée');
  check('fm m8: no horizontal scroll', await noHorizontalScroll(page));
  const t = await tapTargetsOk(page);
  check('fm m8: tap targets ≥ 40px', t.ok, JSON.stringify(t.small));
  // The slider handle is keyboard-operable (arrow keys) — focus + arrow keys works the same on
  // mobile viewports (Playwright's mobile emulation still routes keyboard events); the Valider
  // button itself is tapped, matching how a touch user would actually confirm the placement.
  await S(page, 1).getByRole('slider').last().focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(150);
  const validate1 = S(page, 1).getByRole('button', { name: 'Valider ma position' });
  await validate1.scrollIntoViewIfNeeded();
  await validate1.tap();
  await page.waitForTimeout(300);
  check('fm m8: reveals result via tap-validate', await S(page, 1).getByText(/1\/2 est exactement au milieu/).isVisible().catch(() => false));
  check('fm m8: no horizontal scroll after', await noHorizontalScroll(page));
  await page.screenshot({ path: SHOT_DIR + 'fm-m8.png', fullPage: true });
  await ctx.close();
});

/* Boss — mobile QCM tap flow (12 épreuves) */
await block('Boss (mobile)', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
  await page.goto(`${L}/la-mission-du-partage`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=La Mission du Partage');
  check('mobile boss: no horizontal scroll', await noHorizontalScroll(page));
  const t = await tapTargetsOk(page);
  check('mobile boss: tap targets ≥ 40px', t.ok, JSON.stringify(t.small));
  const epreuve = (n) => page.locator('main').getByText(`${n} / 12`).locator('..').locator('..');
  const tapPick = async (n, text) => { const b = epreuve(n).getByRole('button', { name: text, exact: true }); await b.scrollIntoViewIfNeeded(); await b.tap(); };
  const CORRECT = [
    '3 parts', null, 'Le nombre total de parts égales', 'Le nombre de parts prises (numérateur)',
    '10 pièces', null, 'À 3 graduations de 0', 'Oui : 1/2 = 3/6, même surface coloriée',
    '75/100', '3 carrés', '750 m', null,
  ];
  for (let i = 0; i < CORRECT.length; i++) {
    if (CORRECT[i] === null) {
      // e2 (index 1) and e6 (index 5) and e12 (index 11) render MathText fraction options — tap by
      // position within that épreuve's option group (index of the correct option).
      const correctIdx = i === 1 ? 1 : 0; // e2 correct=1 (5/6); e6 correct=0 (3/5); e12 correct=0 (5/4)
      const grp = epreuve(i + 1).getByRole('group').first();
      const b = grp.getByRole('button').nth(correctIdx);
      await b.scrollIntoViewIfNeeded();
      await b.tap();
      continue;
    }
    await tapPick(i + 1, CORRECT[i]);
  }
  const submit = page.getByRole('button', { name: 'Valider mes 12 réponses' });
  await submit.scrollIntoViewIfNeeded();
  await submit.tap();
  await page.waitForTimeout(700);
  check('mobile boss: review 12 / 12', await page.getByText('12 / 12').first().isVisible().catch(() => false));
  check('mobile boss: no horizontal scroll on review', await noHorizontalScroll(page));
  await page.screenshot({ path: SHOT_DIR + 'fm-boss-review.png', fullPage: true });
  const profilBtn = page.getByRole('button', { name: /Voir mon profil de maîtrise/ });
  await profilBtn.scrollIntoViewIfNeeded();
  await profilBtn.tap();
  await page.waitForTimeout(300);
  const syntheseBtn = page.getByRole('button', { name: 'Passer à la synthèse →' });
  await syntheseBtn.scrollIntoViewIfNeeded();
  await syntheseBtn.tap();
  await page.waitForTimeout(400);
  check('mobile boss: synthèse no horizontal scroll', await noHorizontalScroll(page));
  await page.screenshot({ path: SHOT_DIR + 'fm-boss-synthese.png', fullPage: true });
  const p = await getProgress(page, KEY);
  check('mobile boss: completedModules has 10', !!p?.completedModules?.includes('10'));
  await ctx.close();
});

check('no console/page errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
