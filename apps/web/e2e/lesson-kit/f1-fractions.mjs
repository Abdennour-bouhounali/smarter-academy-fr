// F1 — desktop: fractions V2 (kit port) — all 11 modules (0-10), wrong answers on purpose, boss full flow.
import { BASE, launch, newCtx, watchErrors, check, summary, getProgress, getXp, seed, lessonKey, SHOT_DIR } from './helpers.mjs';
const L = `${BASE}/courses/college/6e/nombres_calculs/fractions`;
const KEY = lessonKey('fractions');
const P = {
  0: 'mission-de-depart', 1: 'partage-impossible', 2: 'construire-une-fraction', 3: 'numerateur-denominateur',
  4: 'lire-et-representer', 5: 'station-quantite', 6: 'fraction-quotient', 7: 'fractions-simples',
  8: 'sur-la-droite-graduee', 9: 'fractions-decimales', 10: 'la-mission-du-partage',
};
const errors = [];
const { browser } = await launch();
async function freshPage(completed) { const ctx = await newCtx(browser); const page = await ctx.newPage(); watchErrors(page, errors); if (completed) await seed(page, completed, KEY); return { ctx, page }; }
const S = (page, n) => page.locator(`#step-${n}`);
const locked = (page) => page.getByText("termine l'étape précédente").count();
const nextEnabled = (page) => page.getByRole('button', { name: /Module suivant/ }).last().isEnabled().catch(() => false);
async function block(name, fn) {
  try { await fn(); } catch (e) { check(`${name}: block crashed — ${String(e.message || e).split('\n')[0].slice(0, 140)}`, false); }
}
// NumberLine (mode="read") click-interception quirk (see nombres-decimaux d1's clickTick note):
// the invisible <rect role="button"> paints over the visible tick's vertical midpoint. Click near
// the rect's top edge instead of its center to land on the rect, not on something under it.
async function clickTick(scope, label) {
  const rectLoc = scope.getByRole('button', { name: label });
  await rectLoc.scrollIntoViewIfNeeded();
  const box = await rectLoc.boundingBox();
  await scope.page().mouse.click(box.x + box.width / 2, box.y + 6);
}

/* Index + Module 0 (diagnostic) */
await block('Index + Module 0', async () => {
  const { ctx, page } = await freshPage(null);
  await page.goto(L, { waitUntil: 'networkidle' });
  check('f index: Mission de départ card', await page.getByText('Mission de départ').first().isVisible().catch(() => false));
  await page.goto(`${L}/${P[0]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Mission de départ');
  check('f m0: next clickable pre-submit', await nextEnabled(page));
  check('f m0: submit disabled', await page.getByRole('button', { name: 'Voir mon résultat' }).isDisabled().catch(() => false));
  // All 5 diagnostic questions render simultaneously (ungated) — several share identical option
  // text ('3' appears in both q1 and q5), so scope each click to its own question card. Each card
  // is a `div.border-2.border-slate-200.bg-white.rounded-2xl.p-5` containing a "N / 5" badge — but
  // a top progress line ("Question N / 5") outside the cards renders the same text, so filter the
  // card wrapper directly instead of walking up from the badge text.
  const diagQ = (n) => page.locator('main div.border-2.border-slate-200.bg-white.rounded-2xl.p-5').filter({ hasText: `${n} / 5` });
  await diagQ(1).getByRole('button', { name: '3', exact: true }).click(); // q1 correct (12÷4)
  check('f m0: silent after q1', !(await page.getByText(/Bonne réponse/).first().isVisible().catch(() => false)));
  await diagQ(2).getByRole('button', { name: 'Oui, ça tombe juste', exact: true }).click(); // q2 wrong (correct: non, ça ne tombe pas juste)
  await diagQ(3).getByRole('button', { name: '4', exact: true }).click(); // q3 correct (20÷5)
  await diagQ(4).getByRole('button', { name: 'Donner à chacun une part de la même taille', exact: true }).click(); // q4 correct
  await diagQ(5).getByRole('button', { name: '3', exact: true }).click(); // q5 wrong (correct: 6 paquets)
  await page.getByRole('button', { name: 'Voir mon résultat' }).click();
  await page.waitForSelector('text=Ta correction');
  check('f m0: score 6 / 10', await page.getByText('6 / 10').first().isVisible().catch(() => false));
  check('f m0: CTA pret/progres', await page.getByRole('button', { name: /Commencer/ }).isVisible().catch(() => false));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('text=Ta correction', { timeout: 8000 });
  check('f m0: persists after reload', await page.getByText('6 / 10').first().isVisible().catch(() => false));
  await page.screenshot({ path: SHOT_DIR + 'f-m0.png', fullPage: true });
  await ctx.close();
});

/* Module 1 — Le partage impossible */
await block('Module 1', async () => {
  const { ctx, page } = await freshPage(null);
  await page.goto(`${L}/${P[1]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Mission : Le partage impossible');
  check('f m1: step 2 locked', (await locked(page)) === 2);
  // step 1: PartageAtelier — tap 3 of the 4 parts (any 3 works; no "wrong" state exists here)
  const cellsS1 = S(page, 1).locator('[aria-label^="Part "]');
  await cellsS1.nth(0).click(); await cellsS1.nth(1).click(); await cellsS1.nth(2).click();
  await page.waitForTimeout(300);
  check('f m1: step 1 solved (3/4 selected)', await S(page, 1).getByText('Tu as pris 3 parts sur les 4.').isVisible().catch(() => false));
  check('f m1: step 2 unlocked', (await locked(page)) === 1);
  // step 2: TapQuestion — wrong on purpose (correct: index 0)
  await S(page, 2).getByRole('button', { name: '« 3 », le nombre de parts prises suffit', exact: true }).click();
  await page.waitForTimeout(300);
  check('f m1 s2: wrong shows bonne réponse', await S(page, 2).getByText(/Bonne réponse/).isVisible().catch(() => false));
  check('f m1: step 3 unlocked despite wrong', (await locked(page)) === 0);
  // step 3: reveal completes the step by itself (no separate confirm button here)
  await S(page, 3).getByRole('button', { name: /Découvrir la notation/ }).click();
  await page.waitForTimeout(300);
  check('f m1: footer/next enabled', await nextEnabled(page));
  check('f m1: completed 1', !!(await getProgress(page, KEY))?.completedModules?.includes('1'));
  await page.screenshot({ path: SHOT_DIR + 'f-m1.png', fullPage: true });
  await ctx.close();
});

/* Module 2 — Construire une fraction */
await block('Module 2', async () => {
  const { ctx, page } = await freshPage(['1']);
  await page.goto(`${L}/${P[2]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Construire une fraction');
  check('f m2: step 2 locked', (await locked(page)) === 1);
  // Construction 1/4: target 1/2 — pick WRONG denominator on purpose (3 instead of 2), then correct it
  await S(page, 1).getByRole('button', { name: '3', exact: true }).click();
  await page.waitForTimeout(200);
  check('f m2 c1: wrong denominator nudge shown', await S(page, 1).getByText(/Essaie un autre nombre de parts/).isVisible().catch(() => false));
  await S(page, 1).getByRole('button', { name: '2', exact: true }).click(); // correct denominator
  await page.waitForTimeout(200);
  // Only the ACTIVE (unsolved) construction ever shows a "Valider ma fraction" button — once
  // solved, its own denominator/count controls stay in the DOM (disabled) but the Valider button
  // disappears, so there is always exactly one to click (no .nth() needed across constructions).
  const cellsC1 = S(page, 1).locator('[aria-label^="Part "]');
  await cellsC1.nth(0).click();
  await page.waitForTimeout(150);
  await S(page, 1).getByRole('button', { name: 'Valider ma fraction' }).click();
  await page.waitForTimeout(300);
  check('f m2 c1: solved', await S(page, 1).getByText('1 part prise sur 2 parts égales', { exact: false }).first().isVisible().catch(() => false));
  // Construction 2/4: target 2/3 — its denominator picker is the 2nd "3" button on page (the 1st
  // now belongs to construction 1's solved, disabled picker).
  await S(page, 1).getByRole('button', { name: '3', exact: true }).nth(1).click();
  await page.waitForTimeout(200);
  const partsC2 = S(page, 1).locator('[role="group"]').last().locator('[aria-label^="Part "]');
  await partsC2.nth(0).click(); await partsC2.nth(1).click();
  await page.waitForTimeout(150);
  await S(page, 1).getByRole('button', { name: 'Valider ma fraction' }).click();
  await page.waitForTimeout(300);
  // Construction 3/4: target 3/4 — 3rd "4" button on page overall (den options list repeats per
  // construction; construction 3's own picker is the only enabled one).
  await S(page, 1).getByRole('button', { name: '4', exact: true }).nth(2).click();
  await page.waitForTimeout(200);
  const partsC3 = S(page, 1).locator('[role="group"]').last().locator('[aria-label^="Part "]');
  await partsC3.nth(0).click(); await partsC3.nth(1).click(); await partsC3.nth(2).click();
  await page.waitForTimeout(150);
  await S(page, 1).getByRole('button', { name: 'Valider ma fraction' }).click();
  await page.waitForTimeout(300);
  // Construction 4/4: target 7/10
  await S(page, 1).getByRole('button', { name: '10', exact: true }).nth(3).click();
  await page.waitForTimeout(200);
  const partsC4 = S(page, 1).locator('[role="group"]').last().locator('[aria-label^="Part "]');
  for (let i = 0; i < 7; i++) await partsC4.nth(i).click();
  await page.waitForTimeout(150);
  await S(page, 1).getByRole('button', { name: 'Valider ma fraction' }).click();
  await page.waitForTimeout(300);
  check('f m2: step 2 unlocked after 4 constructions', (await locked(page)) === 0);
  // step 2: BatchChoiceQuestion (3 rows) — pick wrong on the LAST row on purpose (reveals only then)
  await S(page, 2).getByRole('button', { name: 'Valide', exact: true }).nth(0).click(); // row a correct
  await page.waitForTimeout(150);
  await S(page, 2).getByRole('button', { name: 'Valide', exact: true }).nth(1).click(); // row b wrong on purpose (correct: Non valide)
  await page.waitForTimeout(150);
  check('f m2 s2: no reveal before last row', !(await S(page, 2).getByText(/Seule la figure A/).isVisible().catch(() => false)));
  await S(page, 2).getByRole('button', { name: 'Non valide', exact: true }).nth(2).click(); // row c correct — last pick, triggers reveal
  await page.waitForTimeout(300);
  check('f m2 s2: reveal only after last row answered', await S(page, 2).getByText(/Seule la figure A/).isVisible().catch(() => false));
  check('f m2: next enabled despite wrong row', await nextEnabled(page));
  check('f m2: completed 2', !!(await getProgress(page, KEY))?.completedModules?.includes('2'));
  await ctx.close();
});

/* Module 3 — Numérateur et dénominateur */
await block('Module 3', async () => {
  const { ctx, page } = await freshPage(['1', '2']);
  await page.goto(`${L}/${P[3]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Numérateur et dénominateur');
  check('f m3: step 2 locked', (await locked(page)) === 2);
  // step 1 — 3 HighlightExplorer items, each: see numerator then denominator, then "J'ai compris les deux"
  for (let i = 0; i < 3; i++) {
    await S(page, 1).getByRole('button', { name: /Voir le NUMÉRATEUR/ }).last().click();
    await page.waitForTimeout(150);
    await S(page, 1).getByRole('button', { name: /Voir le DÉNOMINATEUR/ }).last().click();
    await page.waitForTimeout(150);
    await S(page, 1).getByRole('button', { name: "J'ai compris les deux" }).last().click();
    await page.waitForTimeout(200);
  }
  check('f m3: step 2 unlocked', (await locked(page)) === 1);
  // step 2 — 2 LectureItem, each a 2-row BatchChoiceQuestion (num row, then den row). BatchChoiceQuestion
  // renders each row's options inside a `role="group"` div — scope clicks to each row's group by
  // index (0 = numerator row, 1 = denominator row) rather than by option text, since the two rows'
  // option sets overlap (e.g. item 1: num options [3,5,8], den options [5,8,10] — '5' and '8' appear
  // in both rows).
  // Item 1: num=5, den=8 → numOptions sorted [3,5,8] (correct='5'), denOptions sorted [5,8,10] (correct='8').
  const groupsItem1 = S(page, 2).locator('[role="group"]');
  await groupsItem1.nth(0).getByRole('button', { name: '3', exact: true }).click(); // numerator row, wrong on purpose (correct: 5)
  await page.waitForTimeout(150);
  check('f m3 s2 item1: no reveal before den row answered', !(await S(page, 2).getByText(/Recompte|Exact :/).first().isVisible().catch(() => false)));
  await groupsItem1.nth(1).getByRole('button', { name: '8', exact: true }).click(); // denominator row, correct — last pick, triggers reveal
  await page.waitForTimeout(300);
  check('f m3 s2 item1: reveal after last row (wrong num included)', await S(page, 2).getByText(/Recompte/).first().isVisible().catch(() => false));
  // Item 2: num=4, den=6 — numOptions sorted [2,4,6] (correct='4'), denOptions sorted [4,6,8] (correct='6').
  const groups = S(page, 2).locator('[role="group"]');
  await groups.nth(2).getByRole('button', { name: '4', exact: true }).click(); // numerator row, correct
  await page.waitForTimeout(150);
  await groups.nth(3).getByRole('button', { name: '6', exact: true }).click(); // denominator row, correct — reveal
  await page.waitForTimeout(300);
  check('f m3: step 3 unlocked', (await locked(page)) === 0);
  // step 3 — piège quiz, wrong on purpose (correct: index 1)
  await S(page, 3).getByRole('button', { name: "C'est vrai : plus le dénominateur est grand, plus la fraction est grande", exact: true }).click();
  await page.waitForTimeout(300);
  check('f m3 s3: wrong shows bonne réponse', await S(page, 3).getByText(/Bonne réponse/).isVisible().catch(() => false));
  check('f m3: next enabled despite wrong', await nextEnabled(page));
  check('f m3: completed 3', !!(await getProgress(page, KEY))?.completedModules?.includes('3'));
  await page.screenshot({ path: SHOT_DIR + 'f-m3.png', fullPage: true });
  await ctx.close();
});

/* Module 4 — Lire et représenter */
await block('Module 4', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3']);
  await page.goto(`${L}/${P[4]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Lire et représenter');
  // step 1 — direction A: fraction → dessin. Item 1: 3/5 — color exactly 3 cells (no "wrong" state,
  // Valider gated). Once item 1 solves, its own (now-disabled) part cells stay in the DOM alongside
  // item 2's fresh ones — scope each item's cells to its own [role="group"] (PartitionShape's
  // interactive wrapper), not the flat cross-item pool, or the click count lands on the wrong item.
  const groupsA = S(page, 1).locator('[role="group"]');
  const cellsA1 = groupsA.nth(0).locator('[aria-label^="Part "]');
  await cellsA1.nth(0).click(); await cellsA1.nth(1).click(); await cellsA1.nth(2).click();
  await page.waitForTimeout(150);
  await S(page, 1).getByRole('button', { name: 'Valider', exact: true }).click();
  await page.waitForTimeout(300);
  // Item 2: 5/8
  const cellsA2 = groupsA.nth(1).locator('[aria-label^="Part "]');
  for (let i = 0; i < 5; i++) await cellsA2.nth(i).click();
  await page.waitForTimeout(150);
  await S(page, 1).getByRole('button', { name: 'Valider', exact: true }).click();
  await page.waitForTimeout(300);
  check('f m4: step 2 unlocked', (await locked(page)) === 1);
  // step 2 — direction B: dessin → fraction, via FractionBuilder. Item 1: 4/6 (denOptions [4,6,10])
  // Wrong denominator on purpose first, then correct.
  const plusNum1 = S(page, 2).getByRole('button', { name: 'Augmenter le numérateur' }).first();
  await plusNum1.click(); await plusNum1.click(); await plusNum1.click(); await plusNum1.click();
  await S(page, 2).getByRole('button', { name: '10', exact: true }).first().click(); // wrong denominator on purpose
  await S(page, 2).getByRole('button', { name: /Valider ma fraction/ }).first().click();
  await page.waitForTimeout(300);
  check('f m4 s2 item1: wrong den shows hint (not solved yet)', await S(page, 2).getByText(/Compte les parts coloriées/).first().isVisible().catch(() => false));
  await S(page, 2).getByRole('button', { name: '6', exact: true }).first().click(); // correct denominator
  await S(page, 2).getByRole('button', { name: /Valider ma fraction/ }).first().click();
  await page.waitForTimeout(300);
  check('f m4 s2 item1: solved after correcting', await S(page, 2).getByText('4 parts sur 6.', { exact: false }).first().isVisible().catch(() => false));
  // Item 2: 2/3 (denOptions [2,3,5])
  const plusNum2 = S(page, 2).getByRole('button', { name: 'Augmenter le numérateur' }).last();
  await plusNum2.click(); await plusNum2.click();
  await S(page, 2).getByRole('button', { name: '3', exact: true }).last().click();
  await S(page, 2).getByRole('button', { name: /Valider ma fraction/ }).last().click();
  await page.waitForTimeout(300);
  check('f m4: step 3 unlocked', (await locked(page)) === 0);
  // step 3 — equivalence bonus, pure reveal
  await S(page, 3).getByRole('button', { name: /Repartager chaque moitié en 2/ }).click();
  await page.waitForTimeout(300);
  await S(page, 3).getByRole('button', { name: "J'ai compris", exact: true }).click();
  await page.waitForTimeout(300);
  check('f m4: next enabled', await nextEnabled(page));
  check('f m4: completed 4', !!(await getProgress(page, KEY))?.completedModules?.includes('4'));
  await page.screenshot({ path: SHOT_DIR + 'f-m4.png', fullPage: true });
  await ctx.close();
});

/* Module 5 — Station Quantité */
await block('Module 5', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4']);
  await page.goto(`${L}/${P[5]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Fraction d\'une quantité');
  // step 1 — CollectionAtelier x2, both {total:12, groups:3} so BOTH items render identical
  // "Groupe N sur 3" labels once item 1 solves and stays in the DOM — scope each item's group
  // buttons to its own bordered wrapper div (one per CollectionAtelier instance) by index.
  const itemWrap = (i) => S(page, 1).locator('div.space-y-3.border-t').nth(i);
  await itemWrap(0).getByRole('button', { name: /^Groupe 1 sur 3/ }).click();
  await page.waitForTimeout(150);
  await itemWrap(0).getByRole('button', { name: 'Valider', exact: true }).click();
  await page.waitForTimeout(300);
  await itemWrap(1).getByRole('button', { name: /^Groupe 1 sur 3/ }).click();
  await itemWrap(1).getByRole('button', { name: /^Groupe 2 sur 3/ }).click();
  await page.waitForTimeout(150);
  await itemWrap(1).getByRole('button', { name: 'Valider', exact: true }).click();
  await page.waitForTimeout(300);
  check('f m5: step 2 unlocked', (await locked(page)) === 0);
  // step 2 — select 3 groups of 4 (target group set), then answer TapQuestion correctly
  const grp2 = (g) => S(page, 2).getByRole('button', { name: new RegExp(`^Groupe ${g} sur 4`) });
  await grp2(1).click(); await grp2(2).click(); await grp2(3).click();
  await page.waitForTimeout(200);
  await S(page, 2).getByRole('button', { name: 'Non : ce sont deux fractions différentes', exact: true }).click(); // wrong on purpose
  await page.waitForTimeout(300);
  check('f m5 s2: wrong shows bonne réponse', await S(page, 2).getByText(/Bonne réponse/).isVisible().catch(() => false));
  check('f m5: next enabled despite wrong', await nextEnabled(page));
  check('f m5: completed 5', !!(await getProgress(page, KEY))?.completedModules?.includes('5'));
  await page.screenshot({ path: SHOT_DIR + 'f-m5.png', fullPage: true });
  await ctx.close();
});

/* Module 6 — Fraction et quotient */
await block('Module 6', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5']);
  await page.goto(`${L}/${P[6]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Fraction et quotient');
  // step 1 — pick any 1 part on each of 3 pizzas
  for (let p = 0; p < 3; p++) {
    const pizza = S(page, 1).locator('svg[role="img"]').nth(p);
    await pizza.locator('path[role="button"]').first().click();
  }
  await page.waitForTimeout(150);
  await S(page, 1).getByRole('button', { name: 'Valider ma part' }).click();
  await page.waitForTimeout(300);
  check('f m6: step 2 unlocked', (await locked(page)) === 2);
  // step 2 — MathText fraction options don't resolve via text; select by position.
  // options: ['2/3','3/2','1/3','5'] → correct index 0. Pick wrong on purpose (index 1 = 3/2).
  await S(page, 2).getByRole('button').nth(1).click();
  await page.waitForTimeout(300);
  check('f m6 s2: wrong shows bonne réponse', await S(page, 2).getByText(/Bonne réponse/).isVisible().catch(() => false));
  check('f m6: step 3 unlocked despite wrong', (await locked(page)) === 1);
  // step 3 — BatchChoiceQuestion, 2 rows (partage/regroupement) — wrong on the last row on purpose
  await S(page, 3).getByRole('button', { name: 'Partage', exact: true }).nth(0).click(); // row 1 correct
  await page.waitForTimeout(150);
  await S(page, 3).getByRole('button', { name: 'Partage', exact: true }).nth(1).click(); // row 2 wrong on purpose (correct: Regroupement)
  await page.waitForTimeout(300);
  check('f m6 s3: reveal after last row (wrong included)', await S(page, 3).getByText(/Une fraction apparaît quand/).isVisible().catch(() => false));
  check('f m6: step 4 unlocked despite wrong row', (await locked(page)) === 0);
  // step 4 — erreur à corriger, wrong on purpose (correct index 1)
  await S(page, 4).getByRole('button', { name: "C'est correct : diviser en groupes et partager, c'est pareil.", exact: true }).click();
  await page.waitForTimeout(300);
  check('f m6 s4: wrong shows bonne réponse', await S(page, 4).getByText(/Bonne réponse/).isVisible().catch(() => false));
  check('f m6: next enabled despite wrong', await nextEnabled(page));
  check('f m6: completed 6', !!(await getProgress(page, KEY))?.completedModules?.includes('6'));
  await page.screenshot({ path: SHOT_DIR + 'f-m6.png', fullPage: true });
  await ctx.close();
});

/* Module 7 — Fractions simples du quotidien */
await block('Module 7', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6']);
  await page.goto(`${L}/${P[7]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Fractions simples');
  check('f m7: step 2 locked', (await locked(page)) === 1);
  // step 1 — 4 ContexteCard, each: tap the single correct-count cell (no "wrong" state, Valider gated on isRight)
  const cards = S(page, 1).locator('.border-2.border-slate-200.rounded-2xl');
  const count = await cards.count();
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    await card.locator('[aria-label^="Part "]').first().click();
    await page.waitForTimeout(100);
    await card.getByRole('button', { name: 'Valider', exact: true }).click();
    await page.waitForTimeout(150);
  }
  check('f m7: step 2 unlocked', (await locked(page)) === 0);
  // step 2 — JeuAssociation: tap a shape, then its WRONG name on purpose, verify no unlock/crash, then correct match
  await S(page, 2).locator('button').first().click(); // select first figure (un quart)
  await page.waitForTimeout(150);
  // Names column is mixed order; click the second name button (likely wrong for figure 0)
  const nameButtons = S(page, 2).locator('button').nth(4); // 4 figure buttons precede the names column
  await nameButtons.click();
  await page.waitForTimeout(900); // wrong flashes red for 700ms then resets
  check('f m7 s2: still on step, no crash after wrong match attempt', await S(page, 2).isVisible());
  // Now match all 4 pairs correctly using known PAIRS/NAME_ORDER mapping:
  // PAIRS = [quart(0), deux-tiers(1), trois-dixiemes(2), un-demi(3)], NAME_ORDER = [3,0,2,1]
  // figure buttons are in PAIRS order (0..3); name buttons render in NAME_ORDER (3,0,2,1)
  const figureBtn = (i) => S(page, 2).locator('button').nth(i);
  const nameBtnAt = (slot) => S(page, 2).locator('button').nth(4 + slot); // slot 0..3 in NAME_ORDER position
  const NAME_ORDER = [3, 0, 2, 1];
  for (let pairIdx = 0; pairIdx < 4; pairIdx++) {
    const slot = NAME_ORDER.indexOf(pairIdx);
    await figureBtn(pairIdx).click();
    await page.waitForTimeout(150);
    await nameBtnAt(slot).click();
    await page.waitForTimeout(150);
  }
  check('f m7: association game solved', await S(page, 2).getByText('Bien joué !', { exact: false }).isVisible().catch(() => false));
  check('f m7: next enabled', await nextEnabled(page));
  check('f m7: completed 7', !!(await getProgress(page, KEY))?.completedModules?.includes('7'));
  await ctx.close();
});

/* Module 8 — Sur la demi-droite graduée */
await block('Module 8', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6', '7']);
  await page.goto(`${L}/${P[8]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Sur la demi-droite graduée');
  // step 1 — PlacerFraction (mode="place"): the draggable cursor is an SVG <g role="slider">
  // (NOT role="button" — that role belongs to the outer read-only SVG wrapper), and its
  // aria-label ("Curseur : place le nombre") is identical across every PlacerFraction instance on
  // the page. Once solved, earlier instances stay mounted (their own slider still in the DOM), so
  // always target .last() — the newest, still-active one — never the aria-label text.
  const slider = () => S(page, 1).getByRole('slider').last();
  await slider().focus();
  await page.keyboard.press('ArrowRight'); // move off 0 — wrong on purpose vs target 1/2
  await page.waitForTimeout(150);
  await S(page, 1).getByRole('button', { name: 'Valider ma position' }).click();
  await page.waitForTimeout(300);
  check('f m8 s1a: reveals result regardless of correctness', await S(page, 1).getByText(/1\/2 est exactement au milieu/).isVisible().catch(() => false));
  // 1/3
  await slider().focus();
  await page.keyboard.press('ArrowRight');
  await S(page, 1).getByRole('button', { name: 'Valider ma position' }).click();
  await page.waitForTimeout(300);
  // 2/3
  await slider().focus();
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
  await S(page, 1).getByRole('button', { name: 'Valider ma position' }).click();
  await page.waitForTimeout(300);
  check('f m8: step 2 unlocked', (await locked(page)) === 2);
  // step 2 — LirePosition (mode="read"): click WRONG tick on purpose (target 3/4), verify reveal never blocks
  await clickTick(S(page, 2), 'Graduation 1/4'); // wrong on purpose (correct: 3/4)
  await page.waitForTimeout(150);
  await S(page, 2).getByRole('button', { name: 'Valider', exact: true }).click();
  await page.waitForTimeout(300);
  check('f m8 s2: wrong tick still reveals correct position (never blocks)', await S(page, 2).getByText(/Compte les graduations depuis 0/).isVisible().catch(() => false));
  await S(page, 2).getByRole('button', { name: /Que vaut la 4/ }).click();
  await page.waitForTimeout(300);
  check('f m8: step 3 unlocked', (await locked(page)) === 1);
  // step 3 — PlacerFraction 5/4 on a 0-2 line (step is 0.25, target 1.25 → 5 ArrowRight from 0)
  await S(page, 3).getByRole('slider').focus();
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
  await S(page, 3).getByRole('button', { name: 'Valider ma position' }).click();
  await page.waitForTimeout(300);
  check('f m8 s3: 5/4 = 1 + 1/4 revealed', await S(page, 3).getByText('5/4 = 1 + 1/4', { exact: false }).first().isVisible().catch(() => false));
  // step 4 — piège TapQuestion, wrong on purpose (correct index 1)
  await S(page, 4).getByRole('button', { name: 'Vrai : 3 est presque 4, donc la fraction est presque un entier de plus', exact: true }).click();
  await page.waitForTimeout(300);
  check('f m8 s4: wrong shows bonne réponse', await S(page, 4).getByText(/Bonne réponse/).isVisible().catch(() => false));
  check('f m8: next enabled despite wrong', await nextEnabled(page));
  check('f m8: completed 8', !!(await getProgress(page, KEY))?.completedModules?.includes('8'));
  await page.screenshot({ path: SHOT_DIR + 'f-m8.png', fullPage: true });
  await ctx.close();
});

/* Module 9 — Fractions décimales */
await block('Module 9', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6', '7', '8']);
  await page.goto(`${L}/${P[9]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Fractions décimales');
  // step 1 — FractionBuilder target 5/10, wrong denominator on purpose then correct
  const plusNum1 = S(page, 1).getByRole('button', { name: 'Augmenter le numérateur' });
  for (let i = 0; i < 5; i++) await plusNum1.click();
  await S(page, 1).getByRole('button', { name: '100', exact: true }).click(); // wrong denominator on purpose
  await S(page, 1).getByRole('button', { name: /Valider ma fraction/ }).click();
  await page.waitForTimeout(300);
  check('f m9 s1: wrong den shows hint (not yet solved)', await S(page, 1).getByText(/5 parts coloriées sur 10/).first().isVisible().catch(() => false));
  await S(page, 1).getByRole('button', { name: '10', exact: true }).click(); // correct denominator
  await S(page, 1).getByRole('button', { name: /Valider ma fraction/ }).click();
  await page.waitForTimeout(300);
  await S(page, 1).getByRole('button', { name: "J'ai compris", exact: true }).click();
  await page.waitForTimeout(300);
  check('f m9: step 2 unlocked', (await locked(page)) === 1);
  // step 2 — FractionBuilder target 25/100
  const plusNum2 = S(page, 2).getByRole('button', { name: 'Augmenter le numérateur' });
  for (let i = 0; i < 25; i++) await plusNum2.click();
  await S(page, 2).getByRole('button', { name: '100', exact: true }).click();
  await S(page, 2).getByRole('button', { name: /Valider ma fraction/ }).click();
  await page.waitForTimeout(300);
  await S(page, 2).getByRole('button', { name: "J'ai compris", exact: true }).click();
  await page.waitForTimeout(300);
  check('f m9: step 3 unlocked', (await locked(page)) === 0);
  // step 3 — règle générale TapQuestion, wrong on purpose (correct index 0)
  await S(page, 3).getByRole('button', { name: 'Toutes les fractions peuvent devenir des nombres décimaux', exact: true }).click();
  await page.waitForTimeout(300);
  check('f m9 s3: wrong shows bonne réponse', await S(page, 3).getByText(/Bonne réponse/).isVisible().catch(() => false));
  check('f m9: next enabled despite wrong', await nextEnabled(page));
  check('f m9: completed 9', !!(await getProgress(page, KEY))?.completedModules?.includes('9'));
  await page.screenshot({ path: SHOT_DIR + 'f-m9.png', fullPage: true });
  await ctx.close();
});

/* Module 10 — Boss Final (La Mission du Partage), 12 épreuves */
await block('Module 10 — Boss', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
  await page.goto(`${L}/${P[10]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=La Mission du Partage');
  const tab = (n) => page.getByRole('button', { name: n, exact: true });
  check('f boss: profil locked', await tab('Mon profil').isDisabled().catch(() => false));
  check('f boss: synthese locked', await tab('Synthèse').isDisabled().catch(() => false));
  const epreuve = (n) => page.locator('main').getByText(`${n} / 12`).locator('..').locator('..');
  const pick = (n, text) => epreuve(n).getByRole('button', { name: text, exact: true }).click();
  await pick(1, '3 parts'); // correct
  check('f boss: silent', !(await page.getByText(/Bonne réponse/).first().isVisible().catch(() => false)));
  // e2 renders MathText fraction options ['1/6','5/6','6/5'] — select by position (correct index 1)
  await epreuve(2).getByRole('button').nth(0).click(); // wrong on purpose: 1/6 (correct: 5/6)
  await pick(3, 'Le nombre total de parts égales');
  await pick(4, 'Le nombre de parts prises (numérateur)');
  await pick(5, '10 pièces');
  // e6 renders MathText for fraction options only (3/5, 5/3), '3 × 5' stays plain text — select by position (correct index 0)
  await epreuve(6).getByRole('button').nth(0).click();
  await pick(7, 'À 3 graduations de 0');
  await pick(8, 'Oui : 1/2 = 3/6, même surface coloriée');
  await pick(9, '75/100');
  await pick(10, '3 carrés');
  await pick(11, '750 m');
  // e12 renders MathText for all 3 options — select by position (correct index 0 = 5/4)
  await epreuve(12).getByRole('button').nth(0).click();
  const submit = page.getByRole('button', { name: 'Valider mes 12 réponses' });
  await submit.click(); await page.waitForTimeout(700);
  check('f boss: 11 / 12', await page.getByText('11 / 12').first().isVisible().catch(() => false));
  check('f boss: xp 220 (11×20)', (await getXp(page)) === 220, `xp=${await getXp(page)}`);
  check('f boss: completed 10', !!(await getProgress(page, KEY))?.completedModules?.includes('10'));
  await page.screenshot({ path: SHOT_DIR + 'f-boss-review.png', fullPage: true });
  await page.getByRole('button', { name: /Voir mon profil de maîtrise/ }).click();
  check('f profil: revoir module 4 (lire)', await page.getByRole('link', { name: /Revoir le module 4/ }).waitFor({ timeout: 4000 }).then(() => true).catch(() => false));
  await page.getByRole('button', { name: 'Passer à la synthèse →' }).click();
  check('f synthèse: concept central FRACTION', await page.getByText('FRACTION', { exact: true }).first().waitFor({ timeout: 4000 }).then(() => true).catch(() => false));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('text=La Mission du Partage'); await page.waitForTimeout(600);
  check('f boss: review persists', await page.getByText('11 / 12').first().isVisible().catch(() => false));
  await page.getByRole('button', { name: 'Refaire le test' }).click(); await page.waitForTimeout(300);
  await pick(1, '3 parts');
  await epreuve(2).getByRole('button').nth(1).click(); // now correct: 5/6
  await pick(3, 'Le nombre total de parts égales');
  await pick(4, 'Le nombre de parts prises (numérateur)');
  await pick(5, '10 pièces');
  await epreuve(6).getByRole('button').nth(0).click();
  await pick(7, 'À 3 graduations de 0');
  await pick(8, 'Oui : 1/2 = 3/6, même surface coloriée');
  await pick(9, '75/100');
  await pick(10, '3 carrés');
  await pick(11, '750 m');
  await epreuve(12).getByRole('button').nth(0).click();
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: 'Valider mes 12 réponses' }).click(); await page.waitForTimeout(900);
  check('f boss redo: 12 / 12', await page.getByText('12 / 12').first().isVisible().catch(() => false));
  check('f boss redo: xp 240 (12×20)', (await getXp(page)) === 240, `xp=${await getXp(page)}`);
  await page.getByRole('button', { name: /Voir mon profil de maîtrise/ }).click();
  await page.getByRole('button', { name: 'Passer à la synthèse →' }).click();
  check('f synthèse: master badge', await page.getByText('Maître des fractions !', { exact: true }).waitFor({ timeout: 4000 }).then(() => true).catch(() => false));
  check('f boss: last module shows Terminer', await page.getByRole('link', { name: /Terminer/ }).isVisible().catch(() => false));
  await page.screenshot({ path: SHOT_DIR + 'f-boss-synthese.png', fullPage: true });
  await ctx.close();
});

check('no console/page errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
