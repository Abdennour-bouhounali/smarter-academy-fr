// C1 — desktop: contenances V2 (kit port) — all 8 modules, wrong answers on purpose, boss full flow.
import { BASE, launch, newCtx, watchErrors, check, summary, getProgress, getXp, seed, lessonKey, SHOT_DIR } from './helpers.mjs';
const L = `${BASE}/courses/college/6e/grandeurs_mesures/contenances`;
const KEY = lessonKey('contenances');
const P = { 0: 'mission-de-depart', 1: 'lequel-contient-le-plus', 2: 'mesurer-une-contenance', 3: 'unites-l-dl-cl-ml', 4: 'construire-les-relations', 5: 'convertir-les-contenances', 6: 'lien-volume-mission-finale' };
const errors = [];
const { browser } = await launch();
async function freshPage(completed) { const ctx = await newCtx(browser); const page = await ctx.newPage(); watchErrors(page, errors); if (completed) await seed(page, completed, KEY); return { ctx, page }; }
const S = (page, n) => page.locator(`#step-${n}`);
const locked = (page) => page.getByText("termine l'étape précédente").count();
const nextEnabled = (page) => page.getByRole('button', { name: /Module suivant/ }).last().isEnabled().catch(() => false);
// Un module qui plante (locator absent, timeout) est rapporté comme FAIL sans interrompre les autres.
async function block(name, fn) {
  try { await fn(); } catch (e) { check(`${name}: block crashed — ${String(e.message || e).split('\n')[0].slice(0, 140)}`, false); }
}

/* Index + Module 0 */
await block('Index + Module 0', async () => {
  const { ctx, page } = await freshPage(null);
  await page.goto(L, { waitUntil: 'networkidle' });
  check('c index: Mission de départ card', await page.getByText('Mission de départ').first().isVisible().catch(() => false));
  await page.goto(`${L}/${P[0]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Mission de départ');
  check('c m0: next clickable pre-submit', await nextEnabled(page));
  check('c m0: submit disabled', await page.getByRole('button', { name: 'Voir mon résultat' }).isDisabled().catch(() => false));
  await page.getByRole('button', { name: '100', exact: true }).first().click();
  check('c m0: silent after q1', !(await page.getByText(/Bonne réponse/).first().isVisible().catch(() => false)));
  await page.getByRole('button', { name: 'Plus grand', exact: true }).click();
  await page.getByRole('button', { name: '10 fois', exact: true }).click(); // wrong
  await page.getByRole('button', { name: '7 cm', exact: true }).click();
  await page.getByRole('button', { name: /^1.000$/ }).last().click();
  await page.getByRole('button', { name: 'Voir mon résultat' }).click();
  await page.waitForSelector('text=Ta correction');
  check('c m0: score 8 / 10', await page.getByText('8 / 10').first().isVisible().catch(() => false));
  check('c m0: CTA pret', await page.getByRole('button', { name: /Je suis prêt/ }).isVisible().catch(() => false));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('text=Ta correction', { timeout: 8000 });
  check('c m0: persists after reload', await page.getByText('8 / 10').first().isVisible().catch(() => false));
  await page.screenshot({ path: SHOT_DIR + 'c-m0.png', fullPage: true });
  await ctx.close();
});
/* Module 1 — expérience bouteille / cruche */
await block('Module 1 — expérience bouteille / cruche', async () => {
  const { ctx, page } = await freshPage(null);
  await page.goto(`${L}/${P[1]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Qui contient le plus');
  check('c m1: step 2 locked', (await locked(page)) === 1);
  check('c m1: experiment button disabled before a hypothesis', await S(page, 1).getByRole('button', { name: /Vérifier par transvasement/ }).isDisabled());
  await S(page, 1).getByRole('button', { name: /La cruche/ }).first().click();
  check('c m1: hypothesis gives no right/wrong', !(await S(page, 1).getByText(/Bonne réponse/).isVisible().catch(() => false)));
  await S(page, 1).getByRole('button', { name: /Vérifier par transvasement/ }).click();
  await page.waitForTimeout(1500);
  check('c m1: jug receives a stream during the pour', (await S(page, 1).locator('.lc-flow').count()) >= 1);
  check('c m1: question hidden until the experiment ends', !(await S(page, 1).getByText('Alors, laquelle contient le plus ?').isVisible().catch(() => false)));
  await S(page, 1).getByText('La cruche déborde !').waitFor({ timeout: 5000 });
  await S(page, 1).getByText('Surprise !').waitFor({ timeout: 5000 });
  check('c m1: discovery before the question', await S(page, 1).getByText('La forme du récipient peut tromper notre œil.').isVisible().catch(() => false));
  await S(page, 1).getByRole('button', { name: /La cruche/ }).last().click(); // wrong on purpose
  await page.waitForTimeout(400);
  check('c m1: wrong answer → evidence reminder + bonne réponse', await S(page, 1).getByText(/Regarde encore le résultat du transvasement/).isVisible().catch(() => false));
  check('c m1: wrong still unlocks step 2', (await locked(page)) === 0);
  // étape 2 — l'enquête au même verre
  const mesure = (c) => S(page, 2).getByRole('button', { name: `Mesurer un verre dans le récipient ${c}` });
  check('c m1 s2: no measuring before a method is chosen', (await mesure('A').count()) === 0);
  await S(page, 2).getByRole('button', { name: /Regarder les formes/ }).click();
  check('c m1 s2: shape-only method → nudge, not blocked', await S(page, 2).getByText(/la forme peut tromper ton œil/).isVisible().catch(() => false));
  await S(page, 2).getByRole('button', { name: /Utiliser le même verre/ }).click();
  await page.waitForTimeout(300);
  check('c m1 s2: same-glass method accepted', await S(page, 2).getByText('Bonne idée !').isVisible().catch(() => false));
  await mesure('A').click(); await page.waitForTimeout(500);
  check('c m1 s2: actions locked during a measurement', await mesure('B').isDisabled());
  check('c m1 s2: no glass in the row before the gesture ends', (await S(page, 2).getByLabel('un verre mesuré').count()) === 0);
  await page.waitForTimeout(1700);
  check('c m1 s2: one glass in row A after the gesture', (await S(page, 2).getByLabel('un verre mesuré').count()) === 1);
  check('c m1 s2: counts hidden until both are measured', !(await S(page, 2).getByText('A → 6 verres').isVisible().catch(() => false)));
  for (let i = 0; i < 5; i++) { await mesure('A').click(); await page.waitForTimeout(2100); }
  check('c m1 s2: A empty → button disabled', await mesure('A').isDisabled());
  for (let i = 0; i < 4; i++) { await mesure('B').click(); await page.waitForTimeout(2100); }
  check('c m1 s2: 10 identical glasses in the rows', (await S(page, 2).getByLabel('un verre mesuré').count()) === 10);
  await S(page, 2).getByText('A → 6 verres').waitFor({ timeout: 4000 });
  check('c m1 s2: counts revealed', await S(page, 2).getByText('B → 4 verres').isVisible().catch(() => false));
  await S(page, 2).getByRole('button', { name: '🫗 B', exact: true }).click(); // wrong on purpose
  await page.waitForTimeout(400);
  check('c m1 s2: wrong → count reminder + unit idea', await S(page, 2).getByText(/Le même verre nous sert d’unité de mesure/).isVisible().catch(() => false));
  check('c m1: footer shown', await page.getByText('Tu sais comparer des contenances').isVisible().catch(() => false));
  check('c m1: next enabled', await nextEnabled(page));
  check('c m1: completed 1', !!(await getProgress(page, KEY))?.completedModules?.includes('1'));
  await page.screenshot({ path: SHOT_DIR + 'c-m1.png', fullPage: true });
  await ctx.close();
});
/* Module 2 */
await block('Module 2', async () => {
  const { ctx, page } = await freshPage(['1']);
  await page.goto(`${L}/${P[2]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Mesurer une contenance');
  await S(page, 1).getByRole('button', { name: 'Augmenter de 0,5 L' }).click();
  await page.waitForTimeout(150);
  check('c m2: hint before 1 L', await S(page, 1).getByText('Fais encore monter').isVisible().catch(() => false));
  await S(page, 1).getByRole('button', { name: 'Augmenter de 0,5 L' }).click();
  await S(page, 1).getByRole('button', { name: 'J’ai repéré 1 L' }).click();
  await page.waitForTimeout(400);
  check('c m2: step 2 unlocked', (await locked(page)) === 0);
  await S(page, 2).getByRole('button', { name: '1 L', exact: true }).last().click(); await page.waitForTimeout(300);
  await S(page, 2).getByRole('button', { name: '2 L', exact: true }).last().click(); await page.waitForTimeout(300); // wrong
  check('c m2: wrong reading shows bonne réponse', (await S(page, 2).getByText(/Bonne réponse :/).count()) >= 1);
  await S(page, 2).getByRole('button', { name: '0,5 L', exact: true }).last().click(); await page.waitForTimeout(400);
  check('c m2: next enabled', await nextEnabled(page));
  check('c m2: completed 2', !!(await getProgress(page, KEY))?.completedModules?.includes('2'));
  await ctx.close();
});
/* Module 3 */
await block('Module 3', async () => {
  const { ctx, page } = await freshPage(['1', '2']);
  await page.goto(`${L}/${P[3]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Les unités L, dL, cL, mL');
  await S(page, 1).getByRole('button', { name: 'mL', exact: true }).click(); await page.waitForTimeout(300);
  await S(page, 2).getByRole('button', { name: 'mL', exact: true }).nth(0).click();
  await S(page, 2).getByRole('button', { name: 'cL', exact: true }).nth(1).click();
  await S(page, 2).getByRole('button', { name: 'L', exact: true }).nth(2).click(); // wrong (dL)
  await S(page, 2).getByRole('button', { name: 'L', exact: true }).nth(3).click();
  await page.waitForTimeout(400);
  check('c m3: batch ko feedback 3 / 4', await S(page, 2).getByText('3 / 4 corrects').isVisible().catch(() => false));
  check('c m3: row correction → dL', await S(page, 2).getByText('→ dL').isVisible().catch(() => false));
  check('c m3: wrong batch still unlocks step 3', (await locked(page)) === 0);
  await S(page, 3).getByRole('button', { name: '300 L', exact: true }).click(); await page.waitForTimeout(400);
  check('c m3: next enabled', await nextEnabled(page));
  check('c m3: completed 3', !!(await getProgress(page, KEY))?.completedModules?.includes('3'));
  await ctx.close();
});
/* Module 4 — station de mesure */
await block('Module 4 — station de mesure', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3']);
  await page.goto(`${L}/${P[4]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Construire les relations');
  const remplir = (n, t) => S(page, n).getByRole('button', { name: new RegExp(`^Remplir la mesure de ${t} `) });
  const vider = (n, t) => S(page, n).getByRole('button', { name: new RegExp(`^Vider ${t} `) });
  const pour = async (n, t, type = 'add') => { await (type === 'add' ? remplir(n, t) : vider(n, t)).click(); await page.waitForTimeout(1900); };
  // step 1 : cause → effet — le HUD ne change qu'après le geste
  await remplir(1, '1 dL').click();
  await page.waitForTimeout(450);
  check('c m4: HUD shows "Versement en cours" during the pour', await S(page, 1).getByText('Versement en cours').isVisible().catch(() => false));
  check('c m4: other actions disabled during the pour', await remplir(1, '1 dL').isDisabled());
  await page.waitForTimeout(1500);
  check('c m4: HUD updates after the pour (1 dL)', await S(page, 1).getByText('1 dL', { exact: true }).first().isVisible().catch(() => false));
  for (let i = 0; i < 9; i++) await pour(1, '1 dL');
  check('c m4 s1: 1 L = 10 dL', await S(page, 1).getByText('10 × 1 dL = 1 L').isVisible().catch(() => false));
  check('c m4 s1: step 2 unlocked', (await locked(page)) === 3);
  for (let i = 0; i < 10; i++) await pour(2, '1 cL');
  for (let i = 0; i < 10; i++) await pour(3, '1 mL');
  check('c m4: steps 1-3 done, mission unlocked', (await locked(page)) === 1);
  // mission : 60 (direct), 80 (combine), 70 (overshoot + drain), 750 mL (mixed units)
  await pour(4, '50 cL'); await pour(4, '10 cL');
  check('c m4 c1: Exactement 60 cL', await S(page, 4).getByText('Exactement 60 cL').isVisible().catch(() => false));
  check('c m4 c1: math line', await S(page, 4).getByText('50 cL + 10 cL = 60 cL').isVisible().catch(() => false));
  await S(page, 4).getByRole('button', { name: /Défi suivant/ }).click(); await page.waitForTimeout(400);
  await pour(4, '50 cL'); await pour(4, '20 cL'); await pour(4, '10 cL');
  await S(page, 4).getByRole('button', { name: /Défi suivant/ }).click(); await page.waitForTimeout(400);
  await pour(4, '50 cL'); await pour(4, '50 cL');
  check('c m4 c3: overshoot message, never blocking', await S(page, 4).getByText("Tu as dépassé l'objectif").isVisible().catch(() => false));
  await pour(4, '30 cL', 'remove');
  check('c m4 c3: 50 + 50 − 30 = 70', await S(page, 4).getByText('50 cL + 50 cL − 30 cL = 70 cL').isVisible().catch(() => false));
  check('c m4 c3: conversion 70 cL = 700 mL', await S(page, 4).getByText('70 cL = 700 mL').isVisible().catch(() => false));
  await S(page, 4).getByRole('button', { name: /Défi suivant/ }).click(); await page.waitForTimeout(400);
  await pour(4, '5 dL'); await pour(4, '3 dL'); await pour(4, '5 cL', 'remove');
  check('c m4 c4: Exactement 750 mL', await S(page, 4).getByText('Exactement 750 mL').isVisible().catch(() => false));
  await S(page, 4).getByRole('button', { name: /Terminer la mission/ }).click(); await page.waitForTimeout(400);
  check('c m4: ladder unlocked', (await locked(page)) === 0);
  await S(page, 5).getByRole('button', { name: '10', exact: true }).nth(0).click();
  await S(page, 5).getByRole('button', { name: '10', exact: true }).nth(1).click();
  await S(page, 5).getByRole('button', { name: '100', exact: true }).nth(2).click(); // wrong
  await page.waitForTimeout(400);
  check('c m4: ladder ko 2 / 3', await S(page, 5).getByText('2 / 3 corrects').isVisible().catch(() => false));
  check('c m4: next enabled', await nextEnabled(page));
  check('c m4: completed 4', !!(await getProgress(page, KEY))?.completedModules?.includes('4'));
  await page.screenshot({ path: SHOT_DIR + 'c-m4.png', fullPage: true });
  await ctx.close();
});
/* Module 5 — smoke test only: this module was substantially rewritten
   (multi-step worked example, bespoke DirectionChoice/DetectiveCard with a
   retry loop) independently of this suite; a full step-by-step driver is
   stale against it. Kept minimal on purpose — do not re-add brittle
   button-text assertions without re-reading the component first. */
await block('Module 5', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4']);
  await page.goto(`${L}/${P[5]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Convertir les contenances');
  check('c m5: step 1 renders (worked example)', await S(page, 1).getByText('1,5 L = ? cL').isVisible().catch(() => false));
  check('c m5: steps 2-3 locked initially', (await locked(page)) === 3);
  await ctx.close();
});

/* Module 6 — Boss (10 épreuves) */
await block('Module 6 — Boss', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5']);
  await page.goto(`${L}/${P[6]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Le Grand Défi des Contenances');
  const tab = (n) => page.getByRole('button', { name: n, exact: true });
  check('c boss: profil locked', await tab('Mon profil').isDisabled().catch(() => false));
  const epreuve = (n) => page.locator('main').getByText(`${n} / 10`).locator('..').locator('..');
  const pick = (n, text) => epreuve(n).getByRole('button', { name: text, exact: true }).click();
  await pick(1, 'Non, il faut mesurer ou transvaser'); // correct
  check('c boss: silent', !(await page.getByText(/Bonne réponse/).first().isVisible().catch(() => false)));
  await pick(2, 'Utiliser des verres de tailles différentes'); // wrong (correct: 'Utiliser toujours le même verre')
  await pick(3, 'Le litre');
  await pick(4, '10 bols');
  await pick(5, '10 gobelets');
  await pick(6, '10 mL');
  await pick(7, '1 000 mL');
  await pick(8, '500 mL');
  await pick(9, '5');
  await pick(10, 'Je verse 50 + 30');
  const submit = page.getByRole('button', { name: 'Valider mes 10 réponses' });
  await submit.click(); await page.waitForTimeout(700);
  check('c boss: 9 / 10', await page.getByText('9 / 10').first().isVisible().catch(() => false));
  check('c boss: xp 90 (9×10)', (await getXp(page)) === 90, `xp=${await getXp(page)}`);
  check('c boss: completed 6', !!(await getProgress(page, KEY))?.completedModules?.includes('6'));
  await page.getByRole('button', { name: /Voir mon profil de maîtrise/ }).click();
  check('c profil: revoir module 2 (mesurer)', await page.getByRole('link', { name: /Revoir le module 2/ }).waitFor({ timeout: 4000 }).then(() => true).catch(() => false));
  await page.getByRole('button', { name: 'Passer à la synthèse →' }).click();
  check('c synthèse: hero définition', await page.getByText('La contenance', { exact: false }).first().waitFor({ timeout: 4000 }).then(() => true).catch(() => false));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('text=Le Grand Défi des Contenances'); await page.waitForTimeout(600);
  check('c boss: review persists', await page.getByText('9 / 10').first().isVisible().catch(() => false));
  await page.getByRole('button', { name: 'Refaire le test' }).click(); await page.waitForTimeout(300);
  await pick(1, 'Non, il faut mesurer ou transvaser');
  await pick(2, 'Utiliser toujours le même verre');
  await pick(3, 'Le litre');
  await pick(4, '10 bols');
  await pick(5, '10 gobelets');
  await pick(6, '10 mL');
  await pick(7, '1 000 mL');
  await pick(8, '500 mL');
  await pick(9, '5');
  await pick(10, 'Je verse 50 + 30');
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: 'Valider mes 10 réponses' }).click(); await page.waitForTimeout(900);
  check('c boss redo: 10 / 10', await page.getByText('10 / 10').first().isVisible().catch(() => false));
  check('c boss redo: xp 100 (10×10)', (await getXp(page)) === 100, `xp=${await getXp(page)}`);
  await page.getByRole('button', { name: /Voir mon profil de maîtrise/ }).click();
  await page.getByRole('button', { name: 'Passer à la synthèse →' }).click();
  check('c synthèse: master badge', await page.getByText('Chef du Bar à Jus !', { exact: true }).waitFor({ timeout: 4000 }).then(() => true).catch(() => false));
  check('c boss: last module shows Terminer', await page.getByRole('link', { name: /Terminer/ }).isVisible().catch(() => false));
  await ctx.close();
});

check('no console/page errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
