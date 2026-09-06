// T1 — desktop: lesson index, Module 0 diagnostic, Module 1 (no auto-scroll / no auto-advance).
import { LESSON, launch, newCtx, watchErrors, check, summary, getProgress, SHOT_DIR } from './helpers.mjs';
const errors = [];
const { browser } = await launch();
const ctx = await newCtx(browser);
const page = await ctx.newPage();
watchErrors(page, errors);

await page.goto(LESSON, { waitUntil: 'networkidle' });
check('index: Mission de départ card', await page.getByText('Mission de départ').first().isVisible().catch(() => false));
check('index: module 1 card', await page.getByText('Le coffre aux nombres').first().isVisible().catch(() => false));
await page.screenshot({ path: SHOT_DIR + 'v2-index.png', fullPage: true });

await page.goto(`${LESSON}/0`, { waitUntil: 'networkidle' });
await page.waitForSelector('text=Mission de départ', { timeout: 10000 });
check('m0: nav Module suivant clickable pre-submit', await page.getByRole('button', { name: /Module suivant/ }).last().isEnabled().catch(() => false));
check('m0: 6 question counter', await page.getByText('Question 1 / 6').isVisible().catch(() => false));
check('m0: submit disabled before answers', await page.getByRole('button', { name: 'Voir mon résultat' }).isDisabled().catch(() => false));
await page.getByRole('button', { name: 'Chiffre 5, position Centaines' }).click();
check('m0: silent after q1', !(await page.getByText(/Bonne réponse/).first().isVisible().catch(() => false)));
await page.getByRole('button', { name: '300', exact: true }).click();
await page.getByRole('button', { name: 'Centaines', exact: true }).click();
await page.getByRole('button', { name: /^4.026$/ }).click();
await page.getByRole('button', { name: 'huit mille quatre cent cinq' }).click();
await page.getByRole('button', { name: /^12.500$/ }).click();
const submitBtn = page.getByRole('button', { name: 'Voir mon résultat' });
check('m0: submit enabled after all answered', await submitBtn.isEnabled());
await submitBtn.click();
await page.waitForSelector('text=Ta correction', { timeout: 5000 });
check('m0: score 8 / 10 shown', await page.getByText('8 / 10').first().isVisible().catch(() => false));
check('m0: skill bar Numération', await page.getByText('Numération décimale').first().isVisible().catch(() => false));
check('m0: correction shows Bonne réponse for wrong q', await page.getByText(/Bonne réponse :/).first().isVisible().catch(() => false));
check('m0: CTA pret', await page.getByRole('button', { name: /Je suis prêt/ }).isVisible().catch(() => false));
check('m0: redo button', await page.getByRole('button', { name: 'Refaire le diagnostic' }).isVisible().catch(() => false));
await page.screenshot({ path: SHOT_DIR + 'v2-m0-result.png', fullPage: true });
await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector('text=Ta correction', { timeout: 8000 });
check('m0: result persists after reload', await page.getByText('8 / 10').first().isVisible().catch(() => false));
await page.getByRole('button', { name: 'Refaire le diagnostic' }).click();
check('m0: redo returns to questions', await page.getByRole('button', { name: 'Voir mon résultat' }).isDisabled().catch(() => false));

await page.goto(`${LESSON}/1`, { waitUntil: 'networkidle' });
await page.waitForSelector('text=Le laboratoire des cartes', { timeout: 10000 });
const S1 = (n) => page.locator(`#step-${n}`);
check('m1: step 2 locked initially', (await page.getByText("termine l'étape précédente").count()) === 2);
await page.getByRole('button', { name: /Module suivant/ }).last().click();
await page.waitForTimeout(400);
check('m1: popover lists steps', await page.getByText('À terminer avant de continuer').isVisible().catch(() => false));
check('m1: popover step 1 entry', await page.getByRole('button', { name: /Étape 1 —/ }).isVisible().catch(() => false));
await page.screenshot({ path: SHOT_DIR + 'v2-m1-popover.png' });
await page.getByRole('button', { name: /Module suivant/ }).last().click();

/* Étape 1 — le laboratoire des cartes : poser, échanger, atteindre 9 321 puis 1 239. */
for (const d of [3, 9, 1, 2]) await S1(1).getByRole('button', { name: `Poser la carte ${d}` }).click();
await page.waitForTimeout(250);
check('m1 lab: number derives from the arrangement (3 912)', await S1(1).getByText(/^3.912$/).first().isVisible().catch(() => false));
check('m1 lab: a wrong arrangement does NOT solve the step', (await page.getByText("termine l'étape précédente").count()) === 2);
// échange milliers ↔ centaines (3 ↔ 9), puis dizaines ↔ unités (1 ↔ 2) → 9 321
await S1(1).getByRole('button', { name: 'Case des milliers : 3' }).click();
await S1(1).getByRole('button', { name: 'Case des centaines : 9' }).click();
await S1(1).getByRole('button', { name: 'Case des dizaines : 1' }).click();
await S1(1).getByRole('button', { name: 'Case des unités : 2' }).click();
await page.waitForTimeout(400);
check('m1 lab: max reached → défi 2', await S1(1).getByText(/Défi 2/).isVisible().catch(() => false));
check('m1 lab: max feedback names the left slot', await S1(1).getByText(/Plus grand possible/).isVisible().catch(() => false));
check('m1 lab: step 1 still not done (min missing)', (await page.getByText("termine l'étape précédente").count()) === 2);
// 9 321 → 1 329 → 1 239
await S1(1).getByRole('button', { name: 'Case des milliers : 9' }).click();
await S1(1).getByRole('button', { name: 'Case des unités : 1' }).click();
await S1(1).getByRole('button', { name: 'Case des centaines : 3' }).click();
await S1(1).getByRole('button', { name: 'Case des dizaines : 2' }).click();
await page.waitForTimeout(400);
check('m1 lab: min reached', await S1(1).getByText(/Plus petit possible/).isVisible().catch(() => false));
check('m1 lab: step 1 done → step 2 unlocked', (await page.getByText("termine l'étape précédente").count()) === 1);
check('m1 lab: replayable (nouvelles cartes)', await S1(1).getByRole('button', { name: /Nouvelles cartes/ }).isVisible().catch(() => false));

/* Étape 2 — le duel : prédiction sans verdict, B rangé au plus petit, la question de fin. */
await S1(2).getByRole('button', { name: 'Moi, avec mes 4 cartes' }).click();
check('m1 duel: prediction has no verdict', !(await S1(2).getByText(/Bonne réponse/).first().isVisible().catch(() => false)));
for (const d of [5, 4, 3, 2, 1]) await S1(2).getByRole('button', { name: `B — Poser la carte ${d}` }).click();
await page.waitForTimeout(300);
check('m1 duel: 54 321 gets a hint, not a verdict', await S1(2).getByText(/Peux-tu le ranger encore plus petit/).isVisible().catch(() => false));
await S1(2).getByRole('button', { name: 'B — Case des dizaines de milliers : 5' }).click();
await S1(2).getByRole('button', { name: 'B — Case des unités : 1' }).click();
await S1(2).getByRole('button', { name: 'B — Case des milliers : 4' }).click();
await S1(2).getByRole('button', { name: 'B — Case des dizaines : 2' }).click();
await page.waitForTimeout(400);
check('m1 duel: 12 345 > 9 321 stated', await S1(2).getByText(/le plus PETIT nombre que B/).isVisible().catch(() => false));
await S1(2).getByRole('button', { name: /J'aurais pu gagner/ }).click(); // wrong on purpose
await page.waitForTimeout(400);
check('m1 duel: wrong shows bonne réponse', await S1(2).getByText(/Bonne réponse/).first().isVisible().catch(() => false));
check('m1 duel: feedback quotes the prediction', await S1(2).getByText(/Ta prédiction/).isVisible().catch(() => false));
check('m1 duel: wrong answer still unlocks step 3', (await page.getByText("termine l'étape précédente").count()) === 0);

/* Étape 3 — transfert : les six étiquettes, puis le piège relu en cartes. */
for (const v of ['305.000', '8', '42', '307', '2.450', '18.700']) await S1(3).getByRole('button', { name: new RegExp(`^Placer ${v}$`) }).click();
await S1(3).getByRole('button', { name: 'Vérifier mon rangement' }).click();
await page.waitForTimeout(500);
check('m1: wrong order does NOT solve step3 (discovery mode)', (await page.getByText("termine l'étape précédente").count()) === 0 && !(await S1(3).getByText(/Étiquette A/).isVisible().catch(() => false)));
for (const v of ['305.000', '8', '42', '307', '2.450', '18.700']) {
  const btn = S1(3).getByRole('button', { name: new RegExp(`^Retirer ${v}$`) }).first();
  if (await btn.isVisible().catch(() => false)) await btn.click();
}
for (const v of ['8', '42', '307', '2.450', '18.700', '305.000']) await S1(3).getByRole('button', { name: new RegExp(`^Placer ${v}$`) }).click();
// Le rangement correct termine l'étape : on vérifie qu'AUCUN scroll
// PROGRAMMATIQUE n'a lieu après le rendu du feedback (Playwright lui-même
// scrolle la cible d'un .click() dans la vue avant de cliquer — on mesure
// donc à partir de juste après le clic, pas avant).
await S1(3).getByRole('button', { name: 'Vérifier mon rangement' }).click();
await page.waitForTimeout(50);
const yBefore = await page.evaluate(() => window.scrollY);
await page.waitForTimeout(600);
const yAfter = await page.evaluate(() => window.scrollY);
check('m1: NO auto-scroll on step completion', Math.abs(yAfter - yBefore) < 5, `scrollY ${yBefore} → ${yAfter}`);
await S1(3).getByRole('button', { name: /3.900 est le plus grand/ }).click(); // wrong on purpose
await page.waitForTimeout(600);
check('m1: trap wrong shows bonne réponse', await S1(3).getByText(/Bonne réponse/).first().isVisible().catch(() => false));
check('m1: trap read back as 4 cards vs 5', await S1(3).getByText(/Quatre cases contre cinq/).isVisible().catch(() => false));
check('m1: NO auto-advance countdown', !(await page.getByText(/Passage automatique|Rester ici|dans \d+ s/).first().isVisible().catch(() => false)));
check('m1: nav next enabled after allDone', await page.getByRole('button', { name: /Module suivant/ }).last().isEnabled().catch(() => false));
await page.waitForTimeout(6000);
check('m1: still on module 1 after 6s (no auto-navigate)', page.url().endsWith('/1'));
await page.screenshot({ path: SHOT_DIR + 'v2-m1-done.png', fullPage: true });
const prog = await getProgress(page);
check('m1: completedModules includes "1"', !!prog?.completedModules?.includes('1'), JSON.stringify(prog));
await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector('text=Le coffre aux nombres', { timeout: 8000 });
check('m1 revisit: all steps unlocked', (await page.getByText("termine l'étape précédente").count()) === 0);
check('m1 revisit: nav next enabled', await page.getByRole('button', { name: /Module suivant/ }).last().isEnabled().catch(() => false));
check('no console/page errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
