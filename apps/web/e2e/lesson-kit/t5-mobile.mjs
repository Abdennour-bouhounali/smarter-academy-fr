// T5 — mobile 375×667, touch: index, module 1, module 4 (wide table), module 8 (slider), boss.
import { LESSON, launch, newCtx, watchErrors, check, summary, getProgress, seed, noHorizontalScroll, SHOT_DIR } from './helpers.mjs';
const errors = [];
const { browser } = await launch();
async function freshPage(completed) { const ctx = await newCtx(browser, { mobile: true }); const page = await ctx.newPage(); watchErrors(page, errors); if (completed) await seed(page, completed); return { ctx, page }; }
const S = (page, n) => page.locator(`#step-${n}`);
async function tapTargetsOk(page, scope) {
  const boxes = await scope.getByRole('button').evaluateAll((els) =>
    els.filter((e) => !e.disabled && e.offsetParent !== null).map((e) => { const r = e.getBoundingClientRect(); return [r.width, r.height, e.textContent.trim().slice(0, 30)]; }));
  const small = boxes.filter(([w, h]) => h < 40 || w < 40);
  return { ok: small.length === 0, small: small.slice(0, 5) };
}
{
  const { ctx, page } = await freshPage(null);
  await page.goto(LESSON, { waitUntil: 'networkidle' });
  check('mobile index: no horizontal scroll', await noHorizontalScroll(page));
  check('mobile index: Mission de départ visible', await page.getByText('Mission de départ').first().isVisible().catch(() => false));
  await page.screenshot({ path: SHOT_DIR + 'mob-index.png', fullPage: true });
  await ctx.close();
}
{
  const { ctx, page } = await freshPage(null);
  await page.goto(`${LESSON}/1`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Le laboratoire des cartes');
  check('mobile m1: no horizontal scroll', await noHorizontalScroll(page));
  const t = await tapTargetsOk(page, page.locator('main'));
  check('mobile m1: all tap targets ≥ 40px', t.ok, JSON.stringify(t.small));
  // Step 1 — cartes-chiffres : poser (tap), échanger (tap), max puis min.
  for (const d of [3, 9, 1, 2]) await S(page, 1).getByRole('button', { name: `Poser la carte ${d}` }).tap();
  await S(page, 1).getByRole('button', { name: 'Case des milliers : 3' }).tap();
  await S(page, 1).getByRole('button', { name: 'Case des centaines : 9' }).tap();
  await S(page, 1).getByRole('button', { name: 'Case des dizaines : 1' }).tap();
  await S(page, 1).getByRole('button', { name: 'Case des unités : 2' }).tap();
  await page.waitForTimeout(300);
  check('mobile m1: max reached via tap', await S(page, 1).getByText(/Défi 2/).isVisible().catch(() => false));
  await S(page, 1).getByRole('button', { name: 'Case des milliers : 9' }).tap();
  await S(page, 1).getByRole('button', { name: 'Case des unités : 1' }).tap();
  await S(page, 1).getByRole('button', { name: 'Case des centaines : 3' }).tap();
  await S(page, 1).getByRole('button', { name: 'Case des dizaines : 2' }).tap();
  await page.waitForTimeout(400);
  check('mobile m1: step1 solved via tap', (await page.getByText("termine l'étape précédente").count()) === 1);
  // Step 2 — le duel : prédiction (tap), B rangé au plus petit, question de fin.
  await S(page, 2).getByRole('button', { name: 'B, avec ses 5 cartes' }).tap();
  for (const d of [5, 4, 3, 2, 1]) await S(page, 2).getByRole('button', { name: `B — Poser la carte ${d}` }).tap();
  await S(page, 2).getByRole('button', { name: 'B — Case des dizaines de milliers : 5' }).tap();
  await S(page, 2).getByRole('button', { name: 'B — Case des unités : 1' }).tap();
  await S(page, 2).getByRole('button', { name: 'B — Case des milliers : 4' }).tap();
  await S(page, 2).getByRole('button', { name: 'B — Case des dizaines : 2' }).tap();
  await page.waitForTimeout(400);
  await S(page, 2).getByRole('button', { name: 'Avec une carte de plus, B gagne toujours, même avec des cartes plus faibles.' }).tap();
  await page.waitForTimeout(400);
  check('mobile m1: tap = answer (prediction quoted)', await S(page, 2).getByText(/Ta prédiction/).first().isVisible().catch(() => false));
  // Step 3 — transfert : les six étiquettes, puis le piège.
  for (const v of ['8', '42', '307', '2.450', '18.700', '305.000']) await S(page, 3).getByRole('button', { name: new RegExp(`^Placer ${v}$`) }).tap();
  await S(page, 3).getByRole('button', { name: 'Vérifier mon rangement' }).tap();
  await page.waitForTimeout(500);
  await S(page, 3).getByRole('button', { name: /12.000 est le plus grand/ }).tap();
  await page.waitForTimeout(500);
  check('mobile m1: all done, next enabled', await page.getByRole('button', { name: /Module suivant/ }).last().isEnabled().catch(() => false));
  check('mobile m1: no horizontal scroll after completion', await noHorizontalScroll(page));
  await page.screenshot({ path: SHOT_DIR + 'mob-m1-done.png', fullPage: true });
  await page.getByRole('button', { name: 'Activer les effets sonores' }).tap();
  await page.waitForTimeout(200);
  check('mobile m1: effects toggle tap works', await page.getByRole('button', { name: 'Désactiver les effets sonores' }).isVisible().catch(() => false));
  await ctx.close();
}
{
  const { ctx, page } = await freshPage(['1', '2', '3']);
  await page.goto(`${LESSON}/4`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Déplace le chiffre 8');
  check('mobile m4: no horizontal scroll on DigitMover', await noHorizontalScroll(page));
  await S(page, 1).getByRole('button', { name: 'Déplacer le chiffre vers la gauche' }).tap();
  await S(page, 1).getByRole('button', { name: 'Déplacer le chiffre vers la gauche' }).tap();
  await S(page, 1).getByRole('button', { name: 'Déplacer le chiffre vers la gauche' }).tap();
  await page.waitForTimeout(300);
  check('mobile m4: 4 cases visited via tap', await S(page, 1).getByText(/8 000/).first().isVisible().catch(() => false));
  check('mobile m4: step 2 unlocked', (await page.getByText("termine l'étape précédente").count()) === 2);
  await page.screenshot({ path: SHOT_DIR + 'mob-m4-mover.png', fullPage: true });
  check('mobile m4: no page horizontal scroll with 7-col table', await noHorizontalScroll(page));
  const cell = S(page, 2).getByRole('button', { name: 'Chiffre 8, position Dizaines de milliers' }).last();
  await cell.scrollIntoViewIfNeeded(); await cell.tap(); await page.waitForTimeout(200);
  await S(page, 2).getByRole('button', { name: /^80.000$/ }).last().tap(); await page.waitForTimeout(300);
  check('mobile m4: digit hunt via tap', await S(page, 2).getByText('Chasse 2 / 3').isVisible().catch(() => false));
  await page.screenshot({ path: SHOT_DIR + 'mob-m4.png', fullPage: true });
  await ctx.close();
}
{
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6', '7', '8']);
  await page.goto(`${LESSON}/8`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=La demi-droite graduée');
  check('mobile m8: no horizontal scroll', await noHorizontalScroll(page));
  const slider = S(page, 3).getByRole('slider').first();
  await slider.scrollIntoViewIfNeeded();
  const svg = S(page, 3).locator('svg').filter({ has: page.getByRole('slider') }).first();
  const sb = await svg.boundingBox();
  const before = await slider.getAttribute('aria-valuenow');
  // (a) touch tap on the track, far right
  await svg.tap({ position: { x: sb.width * 0.8, y: sb.height * 0.55 } }); // real touch (pointerType=touch)
  await page.waitForTimeout(300);
  const afterTap = await slider.getAttribute('aria-valuenow');
  check('mobile m8: touch tap on track moves slider', before !== afterTap, `${before} → ${afterTap}`);
  // (b) touch DRAG starting on the handle itself (pointer events, as a finger would)
  const hb = await slider.boundingBox();
  const cx = hb.x + hb.width / 2, cy = hb.y + hb.height / 2;
  const init = (x) => ({ clientX: x, clientY: cy, pointerId: 7, pointerType: 'touch', isPrimary: true, bubbles: true, button: 0, buttons: 1 });
  await slider.dispatchEvent('pointerdown', init(cx));
  await svg.dispatchEvent('pointermove', init(cx - sb.width * 0.3));
  await svg.dispatchEvent('pointerup', init(cx - sb.width * 0.3));
  await page.waitForTimeout(300);
  const afterDrag = await slider.getAttribute('aria-valuenow');
  check('mobile m8: drag from handle moves slider', afterDrag !== afterTap, `${afterTap} → ${afterDrag}`);
  await page.screenshot({ path: SHOT_DIR + 'mob-m8.png' });
  await ctx.close();
}
{
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
  await page.goto(`${LESSON}/11`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Le Grand Défi des Nombres');
  check('mobile boss: no horizontal scroll', await noHorizontalScroll(page));
  const t = await tapTargetsOk(page, page.locator('main'));
  check('mobile boss: tap targets ≥ 40px', t.ok, JSON.stringify(t.small));
  for (const n of ['48 275', '5 000', '6 000 + 300 + 7', '105 300 > 105 030', '2 450 < 6 307 < 8 099 < 12 450', '6 300', 'La première est vraie, la seconde est fausse']) {
    const b = page.getByRole('button', { name: n, exact: true }); await b.scrollIntoViewIfNeeded(); await b.tap();
  }
  await page.getByRole('button', { name: 'Valider mes 7 réponses' }).tap();
  await page.waitForTimeout(600);
  check('mobile boss: review 7 / 7', await page.getByText('7 / 7').first().isVisible().catch(() => false));
  check('mobile boss: no horizontal scroll on review', await noHorizontalScroll(page));
  await page.screenshot({ path: SHOT_DIR + 'mob-boss-review.png', fullPage: true });
  await page.getByRole('button', { name: /Voir mon profil de maîtrise/ }).tap(); await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Passer à la synthèse →' }).tap(); await page.waitForTimeout(400);
  check('mobile boss: synthèse no horizontal scroll', await noHorizontalScroll(page));
  await page.screenshot({ path: SHOT_DIR + 'mob-boss-synthese.png', fullPage: true });
  const p = await getProgress(page);
  check('mobile boss: completedModules has 11', !!p?.completedModules?.includes('11'));
  await ctx.close();
}
check('no console/page errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
