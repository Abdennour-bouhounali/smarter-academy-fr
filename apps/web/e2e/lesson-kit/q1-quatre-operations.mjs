// Q1 — desktop: quatre-opérations V2 (kit port) — all 11 modules (0-10), wrong answers on purpose, boss full flow.
import { BASE, launch, newCtx, watchErrors, check, summary, getProgress, getXp, seed, lessonKey, SHOT_DIR } from './helpers.mjs';
const L = `${BASE}/courses/college/6e/nombres_calculs/quatre-operations`;
const KEY = lessonKey('quatre-operations');
const P = {
  0: 'mission-de-depart', 1: 'le-calculateur-malin', 2: 'additionner', 3: 'soustraire', 4: 'multiplier',
  5: 'diviser', 6: 'operations-posees', 7: 'calcul-mental', 8: 'choisir-loutil', 9: 'resoudre-des-problemes',
  10: 'boss-final-mission-fete',
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

/* Index + Module 0 (diagnostic) */
await block('Index + Module 0', async () => {
  const { ctx, page } = await freshPage(null);
  await page.goto(L, { waitUntil: 'networkidle' });
  check('q index: Mission de départ card', await page.getByText('Mission de départ').first().isVisible().catch(() => false));
  await page.goto(`${L}/${P[0]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Mission de départ');
  check('q m0: next clickable pre-submit', await nextEnabled(page));
  check('q m0: submit disabled', await page.getByRole('button', { name: 'Voir mon résultat' }).isDisabled().catch(() => false));
  // All 5 diagnostic questions render simultaneously (ungated) — scope each click to its own
  // question card ('N / 5' badge) since option text like '2 987' could repeat across cards.
  const diagQ = (n) => page.locator('main div.border-2.border-slate-200.bg-white.rounded-2xl.p-5').filter({ hasText: `${n} / 5` });
  await diagQ(1).getByRole('button', { name: '4 milliers', exact: true }).click(); // q1 correct
  check('q m0: silent after q1', !(await page.getByText(/Bonne réponse/).first().isVisible().catch(() => false)));
  await diagQ(2).getByRole('button', { name: '2 879', exact: true }).click(); // q2 wrong (correct: 2 987)
  await diagQ(3).getByRole('button', { name: '12 306', exact: true }).click(); // q3 correct
  await diagQ(4).getByRole('button', { name: '56', exact: true }).click(); // q4 correct (7×8)
  await diagQ(5).getByRole('button', { name: '45', exact: true }).click(); // q5 wrong (correct: 54)
  await page.getByRole('button', { name: 'Voir mon résultat' }).click();
  await page.waitForSelector('text=Ta correction');
  check('q m0: score 6 / 10', await page.getByText('6 / 10').first().isVisible().catch(() => false));
  check('q m0: CTA pret/progres', await page.getByRole('button', { name: /Commencer/ }).isVisible().catch(() => false));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('text=Ta correction', { timeout: 8000 });
  check('q m0: persists after reload', await page.getByText('6 / 10').first().isVisible().catch(() => false));
  await page.screenshot({ path: SHOT_DIR + 'q-m0.png', fullPage: true });
  await ctx.close();
});

/* Module 1 — Le calculateur malin (4 independent TapQuestions, one gated step) */
await block('Module 1', async () => {
  const { ctx, page } = await freshPage(null);
  await page.goto(`${L}/${P[1]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Mission : Le calculateur malin');
  // 4 situations all visible in step 1, no gating between them (free order). All 4 cards share
  // the identical 4-option choice text ('On en rajoute'/'On en enlève'/'On les groupe par
  // paquets'/'On les répartit') — scope every click to its own SituationCard (outer
  // `motion.div.border-2.rounded-2xl`, identified by its "Situation N" label) or the click hits
  // all 4 cards' matching buttons at once.
  const sitCard = (n) => S(page, 1).locator('div.border-2.rounded-2xl').filter({ hasText: `Situation ${n}` });
  await sitCard(1).getByRole('button', { name: 'On en rajoute', exact: true }).click(); // situation 1 correct (ajouter)
  await page.waitForTimeout(150);
  await sitCard(2).getByRole('button', { name: 'On en enlève', exact: true }).click(); // situation 2 correct (retirer)
  await page.waitForTimeout(150);
  // situation 3 (groupes) wrong on purpose: correct is "On les groupe par paquets"
  const grpCard = sitCard(3);
  await grpCard.getByRole('button', { name: 'On les répartit', exact: true }).click();
  await page.waitForTimeout(300);
  check('q m1 sit3: wrong shows correction', await grpCard.getByText(/Pas tout à fait/).isVisible().catch(() => false));
  check('q m1 sit3: symbol revealed despite wrong', await grpCard.getByText('×', { exact: true }).first().isVisible().catch(() => false));
  // situation 4 (repartir) correct
  const reCard = sitCard(4);
  await reCard.getByRole('button', { name: 'On les répartit', exact: true }).click();
  await page.waitForTimeout(300);
  check('q m1: step done, next enabled despite one wrong', await nextEnabled(page));
  check('q m1: completed 1', !!(await getProgress(page, KEY))?.completedModules?.includes('1'));
  await page.screenshot({ path: SHOT_DIR + 'q-m1.png', fullPage: true });
  await ctx.close();
});

/* Module 2 — Additionner (bespoke manips + 3 NumericQuestion practice, wrong on purpose) */
await block('Module 2', async () => {
  const { ctx, page } = await freshPage(['1']);
  await page.goto(`${L}/${P[2]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Additionner : réunir et augmenter');
  check('q m2: step 2 locked', (await locked(page)) === 3);
  // step 1 — ManipObjects: click "Transférer" 7 times (5 + 7 = 12)
  const transferBtn = S(page, 1).getByRole('button', { name: '← Transférer' });
  for (let i = 0; i < 7; i++) await transferBtn.click();
  await page.waitForTimeout(200);
  check('q m2: step 2 unlocked', (await locked(page)) === 2);
  // step 2 — ManipNumberLine: click "+1 pas →" 4 times (7 + 4 = 11)
  const stepBtn = S(page, 2).getByRole('button', { name: '+1 pas →' });
  for (let i = 0; i < 4; i++) await stepBtn.click();
  await page.waitForTimeout(200);
  check('q m2: step 3 unlocked', (await locked(page)) === 1);
  // step 3 — ManipPlaceValue walkthrough (2 "Étape suivante", then "J'ai compris")
  await S(page, 3).getByRole('button', { name: 'Étape suivante →' }).click();
  await page.waitForTimeout(150);
  await S(page, 3).getByRole('button', { name: 'Étape suivante →' }).click();
  await page.waitForTimeout(150);
  await S(page, 3).getByRole('button', { name: "J'ai compris → suite" }).click();
  await page.waitForTimeout(200);
  check('q m2: step 4 unlocked', (await locked(page)) === 0);
  // step 4 — 3 sequential NumericQuestion, wrong on purpose on exercise 2
  await S(page, 4).getByRole('textbox').fill('68'); // 23+45=68 correct
  await S(page, 4).getByRole('button', { name: 'OK', exact: true }).click();
  await page.waitForTimeout(300);
  await S(page, 4).getByRole('textbox').last().fill('999'); // 157+86=243 wrong on purpose
  await S(page, 4).getByRole('button', { name: 'OK', exact: true }).last().click();
  await page.waitForTimeout(300);
  check('q m2 ex2: wrong still reveals correction', await S(page, 4).getByText('243', { exact: false }).first().isVisible().catch(() => false));
  await S(page, 4).getByRole('textbox').last().fill('7,5'); // 4,7+2,8=7,5 correct
  await S(page, 4).getByRole('button', { name: 'OK', exact: true }).last().click();
  await page.waitForTimeout(300);
  check('q m2: next enabled despite wrong ex2', await nextEnabled(page));
  check('q m2: completed 2', !!(await getProgress(page, KEY))?.completedModules?.includes('2'));
  await page.screenshot({ path: SHOT_DIR + 'q-m2.png', fullPage: true });
  await ctx.close();
});

/* Module 3 — Soustraire (3 sens + droite + posée + TapQuestion labo des erreurs) */
await block('Module 3', async () => {
  const { ctx, page } = await freshPage(['1', '2']);
  await page.goto(`${L}/${P[3]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Soustraire : retirer, comparer, compléter');
  check('q m3: step 2 locked', (await locked(page)) === 3);
  // step 1a — MeaningRetirer: click 5 of the 13 jeton buttons
  const jetons = S(page, 1).locator('button').filter({ hasText: '●' });
  for (let i = 0; i < 5; i++) await jetons.nth(0).click(); // always click first remaining one
  await page.waitForTimeout(200);
  await S(page, 1).getByRole('button', { name: 'Compris → Sens suivant' }).click();
  await page.waitForTimeout(200);
  // step 1b — MeaningComparer: NumericQuestion, wrong on purpose (expected 5)
  await S(page, 1).getByRole('textbox').fill('3');
  await S(page, 1).getByRole('button', { name: 'OK', exact: true }).click();
  await page.waitForTimeout(300);
  check('q m3 comparer: wrong reveals correction', await S(page, 1).getByText('Ta réponse', { exact: false }).isVisible().catch(() => false));
  // step 1c — MeaningCompleter: NumericQuestion, correct (expected 5)
  await S(page, 1).getByRole('textbox').last().fill('5');
  await S(page, 1).getByRole('button', { name: 'OK', exact: true }).last().click();
  await page.waitForTimeout(300);
  check('q m3: step 2 unlocked despite wrong comparer', (await locked(page)) === 2);
  // step 2 — SubtractionLine: click "← −1 pas" 6 times (15 - 6 = 9)
  const minusBtn = S(page, 2).getByRole('button', { name: '← −1 pas' });
  for (let i = 0; i < 6; i++) await minusBtn.click();
  await page.waitForTimeout(200);
  check('q m3: step 3 unlocked', (await locked(page)) === 1);
  // step 3 — SubtractionPosed walkthrough
  await S(page, 3).getByRole('button', { name: 'Étape suivante →' }).click();
  await page.waitForTimeout(150);
  await S(page, 3).getByRole('button', { name: 'Étape suivante →' }).click();
  await page.waitForTimeout(150);
  await S(page, 3).getByRole('button', { name: "J'ai compris → suite" }).click();
  await page.waitForTimeout(200);
  check('q m3: step 4 unlocked', (await locked(page)) === 0);
  // step 4 — Labo des erreurs, TapQuestion wrong on purpose (correct index 0)
  await S(page, 4).getByRole('button', { name: "L'élève a mal aligné les chiffres dans le tableau.", exact: true }).click();
  await page.waitForTimeout(300);
  check('q m3 s4: wrong shows Bonne réponse', await S(page, 4).getByText(/Bonne réponse/).isVisible().catch(() => false));
  check('q m3: next enabled despite wrong', await nextEnabled(page));
  check('q m3: completed 3', !!(await getProgress(page, KEY))?.completedModules?.includes('3'));
  await page.screenshot({ path: SHOT_DIR + 'q-m3.png', fullPage: true });
  await ctx.close();
});

/* Module 4 — Multiplier (groups, grid, decomposition, posed, 3 NumericQuestion practice) */
await block('Module 4', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3']);
  await page.goto(`${L}/${P[4]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Multiplier : construire des groupes');
  check('q m4: step 2 locked', (await locked(page)) === 4);
  // step 1 — EqualGroups: click "+" 3 times (1 -> 4 groups)
  const plusBtn = S(page, 1).getByRole('button', { name: '+', exact: true });
  for (let i = 0; i < 3; i++) await plusBtn.click();
  await page.waitForTimeout(200);
  await S(page, 1).getByRole('button', { name: 'Continuer →' }).click();
  await page.waitForTimeout(200);
  check('q m4: step 2 unlocked', (await locked(page)) === 3);
  // step 2 — GridManip: pure exploration, click straight through
  await S(page, 2).getByRole('button', { name: "J'ai exploré la grille → continuer" }).click();
  await page.waitForTimeout(200);
  check('q m4: step 3 unlocked', (await locked(page)) === 2);
  // step 3 — DecompositionManip walkthrough (3 steps, indices 0-2 → 2 "Étape suivante" then "Compris")
  await S(page, 3).getByRole('button', { name: 'Étape suivante →' }).click();
  await page.waitForTimeout(150);
  await S(page, 3).getByRole('button', { name: 'Étape suivante →' }).click();
  await page.waitForTimeout(150);
  await S(page, 3).getByRole('button', { name: 'Compris → suite' }).click();
  await page.waitForTimeout(200);
  check('q m4: step 4 unlocked', (await locked(page)) === 1);
  // step 4 — PosedMultiplication walkthrough (3 "Étape suivante", then "Compris → pratique")
  await S(page, 4).getByRole('button', { name: 'Étape suivante →' }).click();
  await page.waitForTimeout(150);
  await S(page, 4).getByRole('button', { name: 'Étape suivante →' }).click();
  await page.waitForTimeout(150);
  await S(page, 4).getByRole('button', { name: 'Étape suivante →' }).click();
  await page.waitForTimeout(150);
  await S(page, 4).getByRole('button', { name: 'Compris → pratique' }).click();
  await page.waitForTimeout(200);
  check('q m4: step 5 unlocked', (await locked(page)) === 0);
  // step 5 — 3 sequential NumericQuestion, wrong on purpose on exercise 3
  await S(page, 5).getByRole('textbox').fill('42'); // 6×7=42 correct
  await S(page, 5).getByRole('button', { name: 'OK', exact: true }).click();
  await page.waitForTimeout(300);
  await S(page, 5).getByRole('textbox').last().fill('72'); // 8×9=72 correct
  await S(page, 5).getByRole('button', { name: 'OK', exact: true }).last().click();
  await page.waitForTimeout(300);
  await S(page, 5).getByRole('textbox').last().fill('1'); // 4×25=100 wrong on purpose
  await S(page, 5).getByRole('button', { name: 'OK', exact: true }).last().click();
  await page.waitForTimeout(300);
  check('q m4 ex3: wrong still reveals correction', await S(page, 5).getByText('100', { exact: false }).first().isVisible().catch(() => false));
  check('q m4: next enabled despite wrong ex3', await nextEnabled(page));
  check('q m4: completed 4', !!(await getProgress(page, KEY))?.completedModules?.includes('4'));
  await page.screenshot({ path: SHOT_DIR + 'q-m4.png', fullPage: true });
  await ctx.close();
});

/* Module 5 — Diviser (sharing, grouping, euclidean, TapQuestion sens du reste) */
await block('Module 5', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4']);
  await page.goto(`${L}/${P[5]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Diviser : partager et regrouper');
  check('q m5: step 2 locked', (await locked(page)) === 3);
  // step 1 — SharingManip: 24 billes / 6 amis. Click each "ami" button 4 times each (24 total clicks).
  const amis = S(page, 1).locator('div.grid.grid-cols-3 button');
  for (let round = 0; round < 4; round++) {
    for (let i = 0; i < 6; i++) await amis.nth(i).click();
  }
  await page.waitForTimeout(200);
  await S(page, 1).getByRole('button', { name: 'Continuer →' }).click();
  await page.waitForTimeout(200);
  check('q m5: step 2 unlocked', (await locked(page)) === 2);
  // step 2 — GroupingManip: 24 billes, groups of 6 -> 4 groups
  const grpBtn = S(page, 2).getByRole('button', { name: /Faire un groupe de 6/ });
  for (let i = 0; i < 4; i++) await grpBtn.click();
  await page.waitForTimeout(200);
  await S(page, 2).getByRole('button', { name: 'Continuer →' }).click();
  await page.waitForTimeout(200);
  check('q m5: step 3 unlocked', (await locked(page)) === 1);
  // step 3 — EuclideanDivision: 17 billes, groups of 5 -> 3 groups (remaining 2 < 5 stops)
  const formBtn = S(page, 3).getByRole('button', { name: /Former un groupe de 5/ });
  for (let i = 0; i < 3; i++) await formBtn.click();
  await page.waitForTimeout(200);
  await S(page, 3).getByRole('button', { name: 'Continuer →' }).click();
  await page.waitForTimeout(200);
  check('q m5: step 4 unlocked', (await locked(page)) === 0);
  // step 4 — TapQuestion sens du reste, wrong on purpose (correct index 1 = "4 bus")
  await S(page, 4).getByRole('button', { name: '3 bus', exact: true }).click();
  await page.waitForTimeout(300);
  check('q m5 s4: wrong shows Bonne réponse', await S(page, 4).getByText(/Bonne réponse/).isVisible().catch(() => false));
  check('q m5: next enabled despite wrong', await nextEnabled(page));
  check('q m5: completed 5', !!(await getProgress(page, KEY))?.completedModules?.includes('5'));
  await page.screenshot({ path: SHOT_DIR + 'q-m5.png', fullPage: true });
  await ctx.close();
});

/* Module 6 — Les opérations posées (2 walkthroughs + 2 sequential NumericQuestion) */
await block('Module 6', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5']);
  await page.goto(`${L}/${P[6]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Les opérations posées');
  check('q m6: step 2 locked', (await locked(page)) === 2);
  // step 1 — PlaceValueBoard for addition (247+158): 3 "Étape suivante" then "Compris"
  await S(page, 1).getByRole('button', { name: 'Étape suivante →' }).click();
  await page.waitForTimeout(150);
  await S(page, 1).getByRole('button', { name: 'Étape suivante →' }).click();
  await page.waitForTimeout(150);
  await S(page, 1).getByRole('button', { name: 'Étape suivante →' }).click();
  await page.waitForTimeout(150);
  await S(page, 1).getByRole('button', { name: 'Compris → opération suivante' }).click();
  await page.waitForTimeout(200);
  check('q m6: step 2 unlocked', (await locked(page)) === 1);
  // step 2 — PlaceValueBoard for subtraction (543-278): 2 "Étape suivante" then "Compris"
  await S(page, 2).getByRole('button', { name: 'Étape suivante →' }).click();
  await page.waitForTimeout(150);
  await S(page, 2).getByRole('button', { name: 'Étape suivante →' }).click();
  await page.waitForTimeout(150);
  await S(page, 2).getByRole('button', { name: 'Compris → opération suivante' }).click();
  await page.waitForTimeout(200);
  check('q m6: step 3 unlocked', (await locked(page)) === 0);
  // step 3 — 2 sequential NumericQuestion, wrong on purpose on exercise 1
  await S(page, 3).getByRole('textbox').fill('1'); // 346+287=633 wrong on purpose
  await S(page, 3).getByRole('button', { name: 'OK', exact: true }).click();
  await page.waitForTimeout(300);
  check('q m6 ex1: wrong still reveals correction', await S(page, 3).getByText('633', { exact: false }).first().isVisible().catch(() => false));
  check('q m6: exercise 2 unlocked despite wrong ex1', await S(page, 3).getByText('501 − 248', { exact: false }).isVisible().catch(() => false));
  await S(page, 3).getByRole('textbox').last().fill('253'); // 501-248=253 correct
  await S(page, 3).getByRole('button', { name: 'OK', exact: true }).last().click();
  await page.waitForTimeout(300);
  check('q m6: next enabled despite wrong ex1', await nextEnabled(page));
  check('q m6: completed 6', !!(await getProgress(page, KEY))?.completedModules?.includes('6'));
  await page.screenshot({ path: SHOT_DIR + 'q-m6.png', fullPage: true });
  await ctx.close();
});

/* Module 7 — Le laboratoire du calcul malin (5 strategy steps + 1 challenge step) */
await block('Module 7', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6']);
  await page.goto(`${L}/${P[7]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Le laboratoire du calcul malin');
  check('q m7: step 2 locked', (await locked(page)) === 5);
  // Each strategy's animated example (StrategyExample) must be walked to its LAST step ("Étape
  // suivante" click count = example.steps.length - 1) before the quiz NumericQuestion mounts —
  // it only renders once `atLastStep` is true. Step counts per strategy (from STRATEGIES data):
  // plus10=2, moins10=2, fois5=2, double=1, decompose=3.
  // step 1 — strategy +9=+10-1 (2 example steps → 1 "Étape suivante" click)
  await S(page, 1).getByRole('button', { name: 'Étape suivante →' }).click();
  await page.waitForTimeout(150);
  await S(page, 1).getByRole('textbox').fill('999'); // 63+9=72 wrong on purpose
  await S(page, 1).getByRole('button', { name: 'OK', exact: true }).click();
  await page.waitForTimeout(300);
  check('q m7 s1: wrong still reveals correction', await S(page, 1).getByText('72', { exact: false }).first().isVisible().catch(() => false));
  check('q m7: step 2 unlocked despite wrong', (await locked(page)) === 4);
  // step 2 — strategy -9=-10+1 (2 example steps → 1 click)
  await S(page, 2).getByRole('button', { name: 'Étape suivante →' }).click();
  await page.waitForTimeout(150);
  await S(page, 2).getByRole('textbox').fill('74'); // 83-9=74 correct
  await S(page, 2).getByRole('button', { name: 'OK', exact: true }).click();
  await page.waitForTimeout(300);
  check('q m7: step 3 unlocked', (await locked(page)) === 3);
  // step 3 — strategy ×5=×10÷2 (2 example steps → 1 click)
  await S(page, 3).getByRole('button', { name: 'Étape suivante →' }).click();
  await page.waitForTimeout(150);
  await S(page, 3).getByRole('textbox').fill('130'); // 26×5=130 correct
  await S(page, 3).getByRole('button', { name: 'OK', exact: true }).click();
  await page.waitForTimeout(300);
  check('q m7: step 4 unlocked', (await locked(page)) === 2);
  // step 4 — strategy double/moitié (1 example step → quiz shows immediately, no click needed)
  await S(page, 4).getByRole('textbox').fill('12'); // 24÷2=12 correct
  await S(page, 4).getByRole('button', { name: 'OK', exact: true }).click();
  await page.waitForTimeout(300);
  check('q m7: step 5 unlocked', (await locked(page)) === 1);
  // step 5 — strategy décomposer (3 example steps → 2 clicks)
  await S(page, 5).getByRole('button', { name: 'Étape suivante →' }).click();
  await page.waitForTimeout(150);
  await S(page, 5).getByRole('button', { name: 'Étape suivante →' }).click();
  await page.waitForTimeout(150);
  await S(page, 5).getByRole('textbox').fill('83'); // 48+35=83 correct
  await S(page, 5).getByRole('button', { name: 'OK', exact: true }).click();
  await page.waitForTimeout(300);
  check('q m7: step 6 unlocked', (await locked(page)) === 0);
  // step 6 — Défi stratège: 2 ChallengeBlock, each TapQuestion (strategy) then NumericQuestion (result)
  // Challenge 1: 39+27 — strategy options are all-correct-eligible except index2; pick wrong on purpose (index 2)
  const ch1 = S(page, 6).locator('div.bg-white.border.border-slate-200.rounded-2xl').first();
  await ch1.getByRole('button', { name: 'Poser le calcul', exact: true }).click(); // wrong on purpose
  await page.waitForTimeout(300);
  check('q m7 ch1: wrong strategy still reveals correction', await ch1.getByText(/Bonne réponse/).isVisible().catch(() => false));
  await ch1.getByRole('textbox').fill('66'); // correct result
  await ch1.getByRole('button', { name: 'OK', exact: true }).click();
  await page.waitForTimeout(300);
  // Challenge 2: 199×5
  const ch2 = S(page, 6).locator('div.bg-white.border.border-slate-200.rounded-2xl').nth(1);
  await ch2.getByRole('button', { name: '200 × 5 − 5', exact: true }).click(); // correct
  await page.waitForTimeout(200);
  await ch2.getByRole('textbox').fill('995'); // correct result
  await ch2.getByRole('button', { name: 'OK', exact: true }).click();
  await page.waitForTimeout(300);
  check('q m7: next enabled despite wrong challenge strategy', await nextEnabled(page));
  check('q m7: completed 7', !!(await getProgress(page, KEY))?.completedModules?.includes('7'));
  await page.screenshot({ path: SHOT_DIR + 'q-m7.png', fullPage: true });
  await ctx.close();
});

/* Module 8 — Choisir l'outil de calcul (5 challenge steps, each TapQuestion then NumericQuestion) */
await block('Module 8', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6', '7']);
  await page.goto(`${L}/${P[8]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector("text=Choisir l'outil de calcul");
  check('q m8: step 2 locked', (await locked(page)) === 4);
  // step 1 — 25+100, bestIndex 0 (Mental). Wrong on purpose (index 2 = Posé), then answer.
  await S(page, 1).getByRole('button', { name: '📐 Posé', exact: true }).click();
  await page.waitForTimeout(300);
  check('q m8 s1: wrong tool still reveals correction', await S(page, 1).getByText(/Bonne réponse/).isVisible().catch(() => false));
  await S(page, 1).getByRole('textbox').fill('125'); // correct
  await S(page, 1).getByRole('button', { name: 'OK', exact: true }).click();
  await page.waitForTimeout(300);
  check('q m8: step 2 unlocked despite wrong tool pick', (await locked(page)) === 3);
  // step 2 — 398+487, bestIndex 2 (Posé)
  await S(page, 2).getByRole('button', { name: '📐 Posé', exact: true }).click();
  await page.waitForTimeout(200);
  await S(page, 2).getByRole('textbox').fill('885');
  await S(page, 2).getByRole('button', { name: 'OK', exact: true }).click();
  await page.waitForTimeout(300);
  check('q m8: step 3 unlocked', (await locked(page)) === 2);
  // step 3 — 83-9, bestIndex 0 (Mental)
  await S(page, 3).getByRole('button', { name: '🧠 Mental', exact: true }).click();
  await page.waitForTimeout(200);
  await S(page, 3).getByRole('textbox').fill('74');
  await S(page, 3).getByRole('button', { name: 'OK', exact: true }).click();
  await page.waitForTimeout(300);
  check('q m8: step 4 unlocked', (await locked(page)) === 1);
  // step 4 — 199×5, bestIndex 0 (Mental)
  await S(page, 4).getByRole('button', { name: '🧠 Mental', exact: true }).click();
  await page.waitForTimeout(200);
  await S(page, 4).getByRole('textbox').fill('995');
  await S(page, 4).getByRole('button', { name: 'OK', exact: true }).click();
  await page.waitForTimeout(300);
  check('q m8: step 5 unlocked', (await locked(page)) === 0);
  // step 5 — 49,7+12,38, bestIndex 2 (Posé), NumericQuestion expects 62.08 (displayAnswer '62,08')
  await S(page, 5).getByRole('button', { name: '📐 Posé', exact: true }).click();
  await page.waitForTimeout(200);
  await S(page, 5).getByRole('textbox').fill('62,08');
  await S(page, 5).getByRole('button', { name: 'OK', exact: true }).click();
  await page.waitForTimeout(300);
  check('q m8: next enabled', await nextEnabled(page));
  check('q m8: completed 8', !!(await getProgress(page, KEY))?.completedModules?.includes('8'));
  await page.screenshot({ path: SHOT_DIR + 'q-m8.png', fullPage: true });
  await ctx.close();
});

/* Module 9 — Résoudre des problèmes (3 ProblemBlocks with mixed step types: check/operation/calc/choice) */
await block('Module 9', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6', '7', '8']);
  await page.goto(`${L}/${P[9]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Résoudre des problèmes');
  check('q m9: step 2 locked', (await locked(page)) === 2);
  // step 1 — Problem p1 "La classe de 6°A": check (3 useful data) -> operation (×) -> calc (36) -> choice (Oui)
  const p1useful = ['28 élèves', '3 minibus', '12 places par minibus'];
  for (const label of p1useful) {
    await S(page, 1).getByRole('button', { name: label, exact: true }).click();
    await page.waitForTimeout(100);
  }
  await S(page, 1).getByRole('button', { name: 'Valider →', exact: true }).click();
  await page.waitForTimeout(300);
  // operation step — wrong on purpose (correct: ×)
  await S(page, 1).getByRole('button', { name: '+', exact: true }).click();
  await page.waitForTimeout(300);
  check('q m9 p1 op: wrong still reveals correction', await S(page, 1).getByText(/Bonne réponse/).first().isVisible().catch(() => false));
  // calc step — 3×12=36
  await S(page, 1).getByRole('textbox').last().fill('36');
  await S(page, 1).getByRole('button', { name: 'OK', exact: true }).last().click();
  await page.waitForTimeout(300);
  // choice step
  await S(page, 1).getByRole('button', { name: 'Oui, il y a assez de places.', exact: true }).click();
  await page.waitForTimeout(300);
  check('q m9: step 2 unlocked despite wrong operation pick', (await locked(page)) === 1);
  // step 2 — Problem p2 "Le goûter du club": operation(×) -> calc(15) -> calc(3) -> calc(18) -> calc(2)
  await S(page, 2).getByRole('button', { name: '×', exact: true }).click();
  await page.waitForTimeout(200);
  await S(page, 2).getByRole('textbox').fill('15');
  await S(page, 2).getByRole('button', { name: 'OK', exact: true }).click();
  await page.waitForTimeout(200);
  await S(page, 2).getByRole('textbox').last().fill('999'); // wrong on purpose (4×0,75=3)
  await S(page, 2).getByRole('button', { name: 'OK', exact: true }).last().click();
  await page.waitForTimeout(300);
  check('q m9 p2 calc2: wrong still reveals correction', await S(page, 2).getByText('3,00', { exact: false }).first().isVisible().catch(() => false));
  await S(page, 2).getByRole('textbox').last().fill('18');
  await S(page, 2).getByRole('button', { name: 'OK', exact: true }).last().click();
  await page.waitForTimeout(200);
  await S(page, 2).getByRole('textbox').last().fill('2');
  await S(page, 2).getByRole('button', { name: 'OK', exact: true }).last().click();
  await page.waitForTimeout(300);
  check('q m9: step 3 unlocked despite wrong calc', (await locked(page)) === 0);
  // step 3 — Problem p3 "La bibliothèque": operation(÷) -> calc(16) -> choice(17 pizzas... i.e. étagères)
  await S(page, 3).getByRole('button', { name: '÷', exact: true }).click();
  await page.waitForTimeout(200);
  await S(page, 3).getByRole('textbox').fill('16');
  await S(page, 3).getByRole('button', { name: 'OK', exact: true }).click();
  await page.waitForTimeout(200);
  // choice — wrong on purpose (correct index 1 = "Il faut 17 étagères...")
  await S(page, 3).getByRole('button', { name: '16 étagères suffisent pour tous les livres.', exact: true }).click();
  await page.waitForTimeout(300);
  check('q m9 p3 choice: wrong still reveals correction', await S(page, 3).getByText(/Bonne réponse/).first().isVisible().catch(() => false));
  check('q m9: next enabled despite wrong choice', await nextEnabled(page));
  check('q m9: completed 9', !!(await getProgress(page, KEY))?.completedModules?.includes('9'));
  await page.screenshot({ path: SHOT_DIR + 'q-m9.png', fullPage: true });
  await ctx.close();
});

/* Module 10 — Boss Final : Mission Fête. EPREUVES has 13 entries
 * (boss-ballons, boss-gobelets, boss-pizzas-1, boss-pizzas-2, boss-budget-1,
 * boss-budget-2, flash-01..05, boss-posees, boss-outil); the brief copy was
 * fixed to say "Treize épreuves" to match the real rendered/scored count. */
await block('Module 10 — Boss', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
  await page.goto(`${L}/${P[10]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=🏆 Boss Final : Mission Fête');
  const tab = (n) => page.getByRole('button', { name: n, exact: true });
  check('q boss: profil locked', await tab('Mon profil').isDisabled().catch(() => false));
  check('q boss: synthese locked', await tab('Synthèse').isDisabled().catch(() => false));
  check('q boss: brief says "Treize épreuves" matching the real count',
    await page.getByText('Treize épreuves', { exact: false }).isVisible().catch(() => false));
  const N = 13;
  const epreuve = (n) => page.locator('main').getByText(`${n} / ${N}`).locator('..').locator('..');
  const pick = (n, text) => epreuve(n).getByRole('button', { name: text, exact: true }).click();
  await pick(1, '130,00 €'); // correct
  check('q boss: silent', !(await page.getByText(/Bonne réponse/).first().isVisible().catch(() => false)));
  await pick(2, '14'); // wrong on purpose (correct: 15)
  await pick(3, '48'); // correct
  await pick(4, '17 pizzas (16 pleines + 1 pour les 4 parts restantes)'); // correct
  await pick(5, '204 €'); // correct
  await pick(6, '166 €'); // correct
  await pick(7, '5'); // correct (flash-01)
  await pick(8, '6 rangées de 7 chaises = ?'); // correct (flash-02)
  await pick(9, '3'); // correct (flash-03)
  await pick(10, '7 + 10 − 1 = 16'); // correct (flash-04)
  await pick(11, '6'); // correct (flash-05)
  await pick(12, "On écrit 5 et on retient 1 pour les dizaines"); // correct (boss-posees)
  await pick(13, 'Calcul mental'); // wrong on purpose (boss-outil, correct: Calcul posé)
  const submit = page.getByRole('button', { name: `Valider mes ${N} réponses` });
  await submit.click(); await page.waitForTimeout(700);
  check('q boss: 11 / 13', await page.getByText(`11 / ${N}`).first().isVisible().catch(() => false));
  check('q boss: xp 165 (11×15)', (await getXp(page)) === 165, `xp=${await getXp(page)}`);
  check('q boss: completed 10', !!(await getProgress(page, KEY))?.completedModules?.includes('10'));
  await page.screenshot({ path: SHOT_DIR + 'q-boss-review.png', fullPage: true });
  await page.getByRole('button', { name: /Voir mon profil de maîtrise/ }).click();
  check('q profil: revoir module 8 (choisirOutil)', await page.getByRole('link', { name: /Revoir le module 8/ }).waitFor({ timeout: 4000 }).then(() => true).catch(() => false));
  await page.getByRole('button', { name: 'Passer à la synthèse →' }).click();
  check('q synthèse: vocab card Addition', await page.getByText('Addition', { exact: true }).first().waitFor({ timeout: 4000 }).then(() => true).catch(() => false));
  check('q synthèse: vocab card Division reste', await page.getByText('reste', { exact: false }).first().waitFor({ timeout: 4000 }).then(() => true).catch(() => false));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('text=🏆 Boss Final : Mission Fête'); await page.waitForTimeout(600);
  check('q boss: review persists', await page.getByText(`11 / ${N}`).first().isVisible().catch(() => false));
  await page.getByRole('button', { name: 'Refaire le test' }).click(); await page.waitForTimeout(300);
  await pick(1, '130,00 €');
  await pick(2, '15'); // now correct
  await pick(3, '48');
  await pick(4, '17 pizzas (16 pleines + 1 pour les 4 parts restantes)');
  await pick(5, '204 €');
  await pick(6, '166 €');
  await pick(7, '5');
  await pick(8, '6 rangées de 7 chaises = ?');
  await pick(9, '3');
  await pick(10, '7 + 10 − 1 = 16');
  await pick(11, '6');
  await pick(12, "On écrit 5 et on retient 1 pour les dizaines");
  await pick(13, 'Calcul posé'); // now correct
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: `Valider mes ${N} réponses` }).click(); await page.waitForTimeout(900);
  check('q boss redo: 13 / 13', await page.getByText(`13 / ${N}`).first().isVisible().catch(() => false));
  check('q boss redo: xp 195 (13×15)', (await getXp(page)) === 195, `xp=${await getXp(page)}`);
  await page.getByRole('button', { name: /Voir mon profil de maîtrise/ }).click();
  await page.getByRole('button', { name: 'Passer à la synthèse →' }).click();
  check('q synthèse: master badge', await page.getByText('Organisateur parfait !', { exact: true }).waitFor({ timeout: 4000 }).then(() => true).catch(() => false));
  check('q boss: last module shows Terminer', await page.getByRole('link', { name: /Terminer/ }).isVisible().catch(() => false));
  await page.screenshot({ path: SHOT_DIR + 'q-boss-synthese.png', fullPage: true });
  await ctx.close();
});

check('no console/page errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
