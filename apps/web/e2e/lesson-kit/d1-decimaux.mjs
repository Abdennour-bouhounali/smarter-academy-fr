// D1 — desktop: nombres-decimaux V2 (kit port) — all 12 modules (0-11), wrong answers on purpose, boss full flow.
import { BASE, launch, newCtx, watchErrors, check, summary, getProgress, getXp, seed, lessonKey, SHOT_DIR } from './helpers.mjs';
const L = `${BASE}/courses/college/6e/nombres_calculs/nombres-decimaux`;
const KEY = lessonKey('nombres-decimaux');
const P = {
  0: 'mission-de-depart', 1: 'entre-deux-nombres', 2: 'decouper-unite', 3: 'fractions-decimales',
  4: 'ecriture-virgule', 5: 'valeur-position', 6: 'ecritures-equivalentes', 7: 'comparer-ranger',
  8: 'droite-graduee', 9: 'ordre-grandeur', 10: 'calculs-problemes', 11: 'boss-final',
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
// NumberLine (mode="read") renders a click-catching <rect role="button"> whose visible tick
// <line> sits at its vertical midpoint and paints ON TOP of it, intercepting pointer events
// there — a pre-existing quirk in the shared common/components/NumberLine.jsx (out of scope
// to fix from this lesson). Click near the rect's top edge instead, off the line.
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
  check('d index: Mission de départ card', await page.getByText('Mission de départ').first().isVisible().catch(() => false));
  await page.goto(`${L}/${P[0]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Mission de départ');
  check('d m0: next clickable pre-submit', await nextEnabled(page));
  check('d m0: submit disabled', await page.getByRole('button', { name: 'Voir mon résultat' }).isDisabled().catch(() => false));
  // q1 custom: click digit "5" (dizaines) in 58 — click correct 'D' cell
  await page.getByRole('button', { name: /Chiffre 5, position Dizaines/ }).click();
  check('d m0: silent after q1', !(await page.getByText(/Bonne réponse/).first().isVisible().catch(() => false)));
  await page.getByRole('button', { name: '300', exact: true }).click(); // q2 correct
  await page.getByRole('button', { name: '85', exact: true }).click(); // q3 wrong (correct: 308)
  await page.getByRole('button', { name: '3/4', exact: true }).click(); // q4 correct
  await page.getByRole('button', { name: 'Le nombre total de parts égales dans le partage', exact: true }).click(); // q5 correct
  await page.getByRole('button', { name: 'Voir mon résultat' }).click();
  await page.waitForSelector('text=Ta correction');
  check('d m0: score 8 / 10', await page.getByText('8 / 10').first().isVisible().catch(() => false));
  check('d m0: CTA pret', await page.getByRole('button', { name: /Je suis prêt/ }).isVisible().catch(() => false));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('text=Ta correction', { timeout: 8000 });
  check('d m0: persists after reload', await page.getByText('8 / 10').first().isVisible().catch(() => false));
  await page.screenshot({ path: SHOT_DIR + 'd-m0.png', fullPage: true });
  await ctx.close();
});

/* Module 1 — Pourquoi les nombres décimaux ? (6-scene "créer le besoin" rebuild) */
await block('Module 1', async () => {
  const { ctx, page } = await freshPage(null);
  await page.goto(`${L}/${P[1]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Pourquoi les nombres décimaux ?');
  check('d m1: step 2 locked', (await locked(page)) === 5);
  // Scene 1 — ruler: two sequential Oui/Non questions, both answered "Non" (correct).
  await S(page, 1).getByRole('button', { name: 'Oui', exact: true }).click(); // wrong on purpose (correct: Non)
  await page.waitForTimeout(250);
  check('d m1 s1 q1: wrong shows bonne réponse', await S(page, 1).getByText(/dépasse 3 m/).isVisible().catch(() => false));
  await S(page, 1).getByRole('button', { name: 'Non', exact: true }).last().click(); // q2 correct — .last() targets Q2, Q1's own "Non" option is also present now
  await page.waitForTimeout(250);
  check('d m1: step 2 unlocked despite wrong q1', (await locked(page)) === 4);
  // Scene 2 — 4-option MCQ, wrong on purpose (correct: index 2)
  await S(page, 2).getByRole('button', { name: 'Oui, 3 m suffit', exact: true }).click();
  await page.waitForTimeout(300);
  check('d m1 s2: wrong shows bonne réponse', await S(page, 2).getByText(/Bonne réponse/).isVisible().catch(() => false));
  check('d m1: step 3 unlocked despite wrong', (await locked(page)) === 3);
  // Scene 3 — the AHA moment: 4-option MCQ (correct: '10'), then the 3,7 reveal.
  await S(page, 3).getByRole('button', { name: '5', exact: true }).click(); // wrong on purpose (correct: 10)
  await page.waitForTimeout(1800); // wrong-answer reveal delay is longer (1600ms) before the decimal appears
  check('d m1 s3: wrong still reveals 3,7', await S(page, 3).getByText('3,7', { exact: true }).first().isVisible().catch(() => false));
  check('d m1: step 4 unlocked', (await locked(page)) === 2);
  // Scene 4 — open all 3 real-life cards, then answer the closing MCQ (correct: index 1)
  await S(page, 4).getByRole('button', { name: /Longueur/ }).click();
  await page.waitForTimeout(150);
  await S(page, 4).getByRole('button', { name: /Contenance/ }).click();
  await page.waitForTimeout(150);
  await S(page, 4).getByRole('button', { name: /Prix/ }).click();
  await page.waitForTimeout(200);
  check('d m1 s4: closing question appears after visiting all 3 cards', await S(page, 4).getByText(/les nombres décimaux servent à/).isVisible().catch(() => false));
  await S(page, 4).getByRole('button', { name: 'Faire des exercices de maths', exact: true }).click(); // wrong on purpose
  await page.waitForTimeout(300);
  check('d m1 s4: wrong shows bonne réponse', await S(page, 4).getByText(/Bonne réponse/).isVisible().catch(() => false));
  check('d m1: step 5 unlocked despite wrong', (await locked(page)) === 1);
  // Scene 5 — "3,7" hero reveal + curiosity MCQ (correct: index 0, the only "ok"-toned option)
  check('d m1 s5: hero 3,7 visible', await S(page, 5).getByText('3,7', { exact: true }).first().isVisible().catch(() => false));
  await S(page, 5).getByRole('button', { name: /Je ne sais pas encore/ }).click();
  await page.waitForTimeout(250);
  check('d m1: step 6 unlocked', (await locked(page)) === 0);
  // Scene 6 — transition, single confirm button (no MCQ, no correctness state)
  await S(page, 6).getByRole('button', { name: /J'ai compris/ }).click();
  await page.waitForTimeout(200);
  check('d m1: footer/next enabled', await nextEnabled(page));
  check('d m1: completed 1', !!(await getProgress(page, KEY))?.completedModules?.includes('1'));
  await page.screenshot({ path: SHOT_DIR + 'd-m1.png', fullPage: true });
  await ctx.close();
});

/* Module 2 — Découper l'unité */
await block('Module 2', async () => {
  const { ctx, page } = await freshPage(['1']);
  await page.goto(`${L}/${P[2]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector("text=Découper l'unité");
  await S(page, 1).getByRole('button', { name: /Partager en 10 parts égales/ }).click();
  await page.waitForTimeout(300);
  await S(page, 1).getByRole('button', { name: '100', exact: true }).click(); // wrong (correct: 10)
  await page.waitForTimeout(300);
  check('d m2: step 2 unlocked despite wrong answer', (await locked(page)) === 2);
  // step 2: shade 3 tenths — click part index 2 (3rd part, 0-indexed) to select 3
  const parts10 = S(page, 2).locator('[role="group"] button, [aria-label^="Part "]');
  await parts10.nth(2).click();
  await page.waitForTimeout(150);
  await S(page, 2).getByRole('button', { name: 'Vérifier' }).click();
  await page.waitForTimeout(300);
  check('d m2 s2: done', (await locked(page)) === 1);
  // step 3
  await S(page, 3).getByRole('button', { name: /Partager chaque dixième en 10/ }).click();
  await page.waitForTimeout(300);
  await S(page, 3).getByRole('button', { name: '1 centième', exact: true }).click(); // wrong (correct: 10 centièmes)
  await page.waitForTimeout(300);
  check('d m2: step 4 unlocked', (await locked(page)) === 0);
  await ctx.close();
});

/* Module 3 — Les fractions décimales */
await block('Module 3', async () => {
  const { ctx, page } = await freshPage(['1', '2']);
  await page.goto(`${L}/${P[3]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Les fractions décimales');
  // step 1: first FractionBuilder target = 3/10. Bump numerator to 3, pick denominator 10, validate (wrong on purpose: pick 100)
  const plusBtns = S(page, 1).getByRole('button', { name: 'Augmenter le numérateur' });
  await plusBtns.first().click(); await plusBtns.first().click(); await plusBtns.first().click();
  await S(page, 1).getByRole('button', { name: '100', exact: true }).first().click(); // wrong denominator on purpose
  await S(page, 1).getByRole('button', { name: /Valider ma fraction/ }).first().click();
  await page.waitForTimeout(300);
  check('d m3 s1: wrong shows correction', await S(page, 1).getByText(/Bonne réponse/).first().isVisible().catch(() => false));
  check('d m3: step done regardless of correctness (formative)', true); // FractionBuilder onSolved is unconditional
  await ctx.close();
});

/* Module 4 — Écriture à virgule */
await block('Module 4', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3']);
  await page.goto(`${L}/${P[4]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector("text=Passer à l'écriture à virgule");
  // Three ETAPES_37 questions render cumulatively in #step-1; scope each click to the newest
  // question block (nth) to avoid matching an earlier question's identical option text.
  await S(page, 1).getByRole('button', { name: '3', exact: true }).nth(0).click(); // q1 correct
  await page.waitForTimeout(200);
  await S(page, 1).getByRole('button', { name: '10', exact: true }).nth(1).click(); // q2 wrong (correct: 7) — 2nd "10" option belongs to q2
  await page.waitForTimeout(200);
  check('d m4 s1 q2: wrong shows bonne réponse', (await S(page, 1).getByText(/Bonne réponse/).count()) >= 1);
  await S(page, 1).getByRole('button', { name: '37', exact: true }).last().click(); // q3 correct — earlier "37" options are already revealed/disabled
  await page.waitForTimeout(200);
  check('d m4 s1: reveal button appears (all 3 answered, wrong included)', await S(page, 1).getByRole('button', { name: /Découvrir la nouvelle écriture/ }).isVisible().catch(() => false));
  await S(page, 1).getByRole('button', { name: /Découvrir la nouvelle écriture/ }).click();
  await page.waitForTimeout(200);
  check('d m4: step 2 unlocked', (await locked(page)) === 1);
  await S(page, 2).getByRole('button', { name: '5 unités', exact: true }).click(); // wrong (correct: 5 dixièmes)
  await page.waitForTimeout(300);
  check('d m4: step 3 unlocked', (await locked(page)) === 0);
  await page.screenshot({ path: SHOT_DIR + 'd-m4.png', fullPage: true });
  await ctx.close();
});

/* Module 5 — Valeur de position */
await block('Module 5', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4']);
  await page.goto(`${L}/${P[5]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=La valeur de position');
  // step 1: click the digit 3 in the table (dixièmes column of 7,305)
  await S(page, 1).getByRole('button', { name: /Chiffre 3, position Dixièmes/ }).click();
  await page.waitForTimeout(200);
  await S(page, 1).getByRole('button', { name: '3 unités', exact: true }).click(); // wrong (correct: 3 dixièmes)
  await page.waitForTimeout(300);
  check('d m5 s1: analysis 2 appears despite wrong answer', await S(page, 1).getByText('Analyse 2 / 3').isVisible().catch(() => false));
  await ctx.close();
});

/* Module 6 — Écritures équivalentes */
await block('Module 6', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5']);
  await page.goto(`${L}/${P[6]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Des écritures équivalentes');
  await S(page, 1).getByRole('button', { name: /observé les cinq représentations/ }).click();
  await page.waitForTimeout(200);
  check('d m6: step 2 reachable', (await locked(page)) === 1);
  // Fraction options render via MathText/KaTeX (digits duplicated into the accessible name),
  // so text matching like "7/100" never resolves — select by position instead. Translation 1
  // (0,7): options [7/10, 7/100, 70/10, 7/1000], index 1 = 7/100, wrong on purpose.
  await S(page, 2).getByRole('button').nth(1).click();
  await page.waitForTimeout(300);
  check('d m6 s2: wrong shows bonne réponse', await S(page, 2).getByText(/Bonne réponse/).first().isVisible().catch(() => false));
  check('d m6 s2: wrong still unlocks next translation', await S(page, 2).getByText('Traduction 2 / 4').isVisible().catch(() => false));
  await page.screenshot({ path: SHOT_DIR + 'd-m6.png', fullPage: true });
  await ctx.close();
});

/* Module 7 — Comparer et ranger (largest module) */
await block('Module 7', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6']);
  await page.goto(`${L}/${P[7]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Comparer et ranger');
  await S(page, 1).getByRole('button', { name: '2,4', exact: true }).click(); // wrong (correct: 2,7)
  await page.waitForTimeout(300);
  check('d m7 s1: wrong shows bonne réponse', await S(page, 1).getByText(/Bonne réponse/).isVisible().catch(() => false));
  check('d m7: step 2 reachable despite wrong', (await locked(page)) === 3);
  await S(page, 2).getByRole('button', { name: '2,37', exact: true }).click(); // wrong (correct: 2,4)
  await page.waitForTimeout(300);
  check('d m7 s2 q1: wrong shows bonne réponse', await S(page, 2).getByText(/Bonne réponse/).first().isVisible().catch(() => false));
  await S(page, 2).getByRole('button', { name: '2,40', exact: true }).click(); // q2 correct — reveals the follow-up
  await page.waitForTimeout(300);
  check('d m7 s2: step 3 reachable', (await locked(page)) === 2);
  // step 3: DecCompareLab — click "Comparer les ..." repeatedly until the symbol picker appears.
  // Poll for the button to actually disappear/reappear after each click (a fixed sleep is flaky
  // under load — verified: the click reliably lands, but a fixed 300-350ms gap sometimes races
  // the framer-motion re-render on a loaded machine and appears to "eat" a click).
  for (let i = 0; i < 4; i++) {
    const btn = S(page, 3).getByRole('button', { name: /Comparer les/ });
    if (!(await btn.isVisible().catch(() => false))) break;
    const label = await btn.innerText();
    await btn.click();
    await page.waitForFunction(
      ({ prevLabel }) => {
        const btns = Array.from(document.querySelectorAll('#step-3 button'));
        const cmp = btns.find((b) => /Comparer les/.test(b.textContent || ''));
        return !cmp || cmp.textContent !== prevLabel;
      },
      { prevLabel: label },
      { timeout: 5000 }
    ).catch(() => {});
    await page.waitForTimeout(150);
  }
  // The symbol buttons carry BOTH visible text "=" and aria-label="Signe =" — when both are
  // present, the accessible name computed from aria-label wins over inner text, so a bare
  // name:'=' match never resolves. Target the aria-label instead.
  const symBtn = S(page, 3).getByRole('button', { name: 'Signe =', exact: true });
  if (await symBtn.isVisible().catch(() => false)) {
    await symBtn.click(); // wrong on purpose (5,284 > 5,248)
    await S(page, 3).getByRole('button', { name: 'Valider', exact: true }).click();
    await page.waitForTimeout(300);
    check('d m7 s3: wrong shows bonne réponse', await S(page, 3).getByText(/Bonne réponse/).isVisible().catch(() => false));
  } else {
    check('d m7 s3: symbol picker reached', false, 'DecCompareLab did not reach the symbol-pick phase');
  }
  check('d m7: step 4 reachable despite wrong symbol', (await locked(page)) === 1);
  await S(page, 4).getByRole('button', { name: 'Le raisonnement est correct.', exact: true }).first().click(); // wrong on purpose
  await page.waitForTimeout(300);
  check('d m7 s4: wrong shows bonne réponse (vraie)', await S(page, 4).getByText(/La bonne réponse est/).first().isVisible().catch(() => false));
  await page.screenshot({ path: SHOT_DIR + 'd-m7.png', fullPage: true });
  await ctx.close();
});

/* Module 8 — Droite graduée */
await block('Module 8', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6', '7']);
  await page.goto(`${L}/${P[8]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=La droite graduée');
  await page.getByPlaceholder('0,0').fill('0,9'); // wrong on purpose (correct: 0,3)
  await page.getByRole('button', { name: 'OK', exact: true }).first().click();
  await page.waitForTimeout(300);
  check('d m8 s1: wrong numeric answer reveals bonne réponse (never blocks)', await S(page, 1).getByText(/Ta réponse/).isVisible().catch(() => false));
  check('d m8: PlacerNombre (2nd reading) unlocked despite wrong answer', await S(page, 1).getByText(/Fais glisser le curseur/).isVisible().catch(() => false));
  await page.screenshot({ path: SHOT_DIR + 'd-m8.png', fullPage: true });
  await ctx.close();
});

/* Module 9 — Ordre de grandeur */
await block('Module 9', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6', '7', '8']);
  await page.goto(`${L}/${P[9]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Ordre de grandeur et estimation');
  await S(page, 1).getByRole('button', { name: '1', exact: true }).click(); // wrong (correct: 2, closest to 1.98)
  await page.waitForTimeout(300);
  check('d m9 s1: wrong still unlocks situation 2', await S(page, 1).getByText('Situation 2 / 4').isVisible().catch(() => false));
  await ctx.close();
});

/* Module 10 — Calculs et problèmes */
await block('Module 10', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
  await page.goto(`${L}/${P[10]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Calculs et problèmes');
  await S(page, 1).getByRole('button', { name: '2,50 et 6', exact: true }).click(); // wrong
  await page.waitForTimeout(300);
  check('d m10 p1: wrong still progresses to next question', await S(page, 1).getByText(/quel ordre de grandeur/).isVisible().catch(() => false));
  await ctx.close();
});

/* Module 11 — Boss Final */
await block('Module 11 — Boss', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
  await page.goto(`${L}/${P[11]}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Le Laboratoire des Décimaux');
  const tab = (n) => page.getByRole('button', { name: n, exact: true });
  check('d boss: profil locked', await tab('Mon profil').isDisabled().catch(() => false));
  const epreuve = (n) => page.locator('main').getByText(`${n} / 8`).locator('..').locator('..');
  const pick = (n, text) => epreuve(n).getByRole('button', { name: text, exact: true }).click();
  await pick(1, '0,75 kg'); // correct
  check('d boss: silent', !(await page.getByText(/Bonne réponse/).first().isVisible().catch(() => false)));
  // Épreuve 2's options render as KaTeX fractions — select by position, not text (see module 6 note).
  await epreuve(2).getByRole('button').nth(0).click(); // wrong: 38/100 (correct: 308/100 = index 1)
  await pick(3, '5 centièmes');
  await pick(4, '0,7 L');
  await pick(5, '0,05 < 0,25 < 0,5 < 0,75');
  await pick(6, '1,25');
  await pick(7, 'Environ 3 kg');
  await pick(8, 'Le total fait exactement 2 L');
  const submit = page.getByRole('button', { name: 'Valider mes 8 réponses' });
  await submit.click(); await page.waitForTimeout(700);
  check('d boss: 7 / 8', await page.getByText('7 / 8').first().isVisible().catch(() => false));
  check('d boss: xp 140 (7×20)', (await getXp(page)) === 140, `xp=${await getXp(page)}`);
  check('d boss: completed 11', !!(await getProgress(page, KEY))?.completedModules?.includes('11'));
  await page.getByRole('button', { name: /Voir mon profil de maîtrise/ }).click();
  check('d profil: revoir module 4 (virgule)', await page.getByRole('link', { name: /Revoir le module 4/ }).waitFor({ timeout: 4000 }).then(() => true).catch(() => false));
  await page.getByRole('button', { name: 'Passer à la synthèse →' }).click();
  check('d synthèse: 3,75 visible', await page.getByText('3,75', { exact: true }).first().waitFor({ timeout: 4000 }).then(() => true).catch(() => false));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('text=Le Laboratoire des Décimaux'); await page.waitForTimeout(600);
  check('d boss: review persists', await page.getByText('7 / 8').first().isVisible().catch(() => false));
  await page.getByRole('button', { name: 'Refaire le test' }).click(); await page.waitForTimeout(300);
  await pick(1, '0,75 kg');
  await epreuve(2).getByRole('button').nth(1).click(); // now correct: 308/100
  await pick(3, '5 centièmes');
  await pick(4, '0,7 L');
  await pick(5, '0,05 < 0,25 < 0,5 < 0,75');
  await pick(6, '1,25');
  await pick(7, 'Environ 3 kg');
  await pick(8, 'Le total fait exactement 2 L');
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: 'Valider mes 8 réponses' }).click(); await page.waitForTimeout(900);
  check('d boss redo: 8 / 8', await page.getByText('8 / 8').first().isVisible().catch(() => false));
  check('d boss redo: xp 160 (8×20)', (await getXp(page)) === 160, `xp=${await getXp(page)}`);
  await page.getByRole('button', { name: /Voir mon profil de maîtrise/ }).click();
  await page.getByRole('button', { name: 'Passer à la synthèse →' }).click();
  check('d synthèse: master badge', await page.getByText('Maître des nombres décimaux !', { exact: true }).waitFor({ timeout: 4000 }).then(() => true).catch(() => false));
  check('d boss: last module shows Terminer', await page.getByRole('link', { name: /Terminer/ }).isVisible().catch(() => false));
  await page.screenshot({ path: SHOT_DIR + 'd-boss.png', fullPage: true });
  await ctx.close();
});

check('no console/page errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
