// Q2 — mobile 375×667 touch: quatre-opérations V2 — index, M0 (diagnostic tap flow), M1 (tap flow),
// M5 (diviser — click-to-advance manips + TapQuestion), boss submit.
import { BASE, launch, newCtx, watchErrors, check, summary, getProgress, seed, lessonKey, noHorizontalScroll, SHOT_DIR } from './helpers.mjs';
const L = `${BASE}/courses/college/6e/nombres_calculs/quatre-operations`;
const KEY = lessonKey('quatre-operations');
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
  check('qm index: no horizontal scroll', await noHorizontalScroll(page));
  await page.goto(`${L}/mission-de-depart`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Mission de départ');
  check('qm m0: no horizontal scroll', await noHorizontalScroll(page));
  const diagQ = (n) => page.locator('main div.border-2.border-slate-200.bg-white.rounded-2xl.p-5').filter({ hasText: `${n} / 5` });
  await diagQ(1).getByRole('button', { name: '4 milliers', exact: true }).tap();
  await diagQ(2).getByRole('button', { name: '2 987', exact: true }).tap();
  await diagQ(3).getByRole('button', { name: '12 306', exact: true }).tap();
  await diagQ(4).getByRole('button', { name: '56', exact: true }).tap();
  await diagQ(5).getByRole('button', { name: '54', exact: true }).tap();
  const submit = page.getByRole('button', { name: 'Voir mon résultat' });
  await submit.scrollIntoViewIfNeeded();
  await submit.tap();
  await page.waitForSelector('text=Ta correction');
  check('qm m0: score 10 / 10 via taps', await page.getByText('10 / 10').first().isVisible().catch(() => false));
  check('qm m0: no horizontal scroll on result', await noHorizontalScroll(page));
  await page.screenshot({ path: SHOT_DIR + 'qm-m0.png', fullPage: true });
  await ctx.close();
});

/* Module 1 — tap flow (4 independent TapQuestion situations, all-correct) */
await block('Module 1', async () => {
  const { ctx, page } = await freshPage(null);
  await page.goto(`${L}/le-calculateur-malin`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Mission : Le calculateur malin');
  check('qm m1: no horizontal scroll', await noHorizontalScroll(page));
  const t = await tapTargetsOk(page);
  check('qm m1: tap targets ≥ 40px', t.ok, JSON.stringify(t.small));
  // All 4 situation cards share identical option text — scope taps to each card by its
  // "Situation N" label (same technique as the desktop suite).
  const sitCard = (n) => S(page, 1).locator('div.border-2.rounded-2xl').filter({ hasText: `Situation ${n}` });
  await sitCard(1).getByRole('button', { name: 'On en rajoute', exact: true }).tap();
  await page.waitForTimeout(150);
  await sitCard(2).getByRole('button', { name: 'On en enlève', exact: true }).tap();
  await page.waitForTimeout(150);
  await sitCard(3).getByRole('button', { name: 'On les groupe par paquets', exact: true }).tap();
  await page.waitForTimeout(150);
  await sitCard(4).getByRole('button', { name: 'On les répartit', exact: true }).tap();
  await page.waitForTimeout(300);
  check('qm m1: completed via taps', await page.getByRole('button', { name: /Module suivant/ }).last().isEnabled().catch(() => false));
  await page.screenshot({ path: SHOT_DIR + 'qm-m1.png', fullPage: true });
  check('qm m1: no horizontal scroll after', await noHorizontalScroll(page));
  await ctx.close();
});

/* Module 5 — Diviser: click-to-advance manips (tap) + TapQuestion sens du reste */
await block('Module 5', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4']);
  await page.goto(`${L}/diviser`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Diviser : partager et regrouper');
  check('qm m5: no horizontal scroll', await noHorizontalScroll(page));
  const t = await tapTargetsOk(page);
  check('qm m5: tap targets ≥ 40px', t.ok, JSON.stringify(t.small));
  // step 1 — SharingManip: 24 billes / 6 amis, tap each "ami" 4 times
  const amis = S(page, 1).locator('div.grid.grid-cols-3 button');
  for (let round = 0; round < 4; round++) {
    for (let i = 0; i < 6; i++) await amis.nth(i).tap();
  }
  await page.waitForTimeout(200);
  const continue1 = S(page, 1).getByRole('button', { name: 'Continuer →' });
  await continue1.scrollIntoViewIfNeeded();
  await continue1.tap();
  await page.waitForTimeout(300);
  check('qm m5: step 2 reached via taps', (await page.getByText("termine l'étape précédente").count()) === 2);
  await page.screenshot({ path: SHOT_DIR + 'qm-m5.png', fullPage: true });
  check('qm m5: no horizontal scroll after', await noHorizontalScroll(page));
  await ctx.close();
});

/* Boss — mobile QCM tap flow (13 épreuves — see desktop suite's note on the "Douze épreuves"
 * brief-text vs actual-array-length mismatch; this mobile pass reuses the real count). */
await block('Boss (mobile)', async () => {
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
  await page.goto(`${L}/boss-final-mission-fete`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=🏆 Boss Final : Mission Fête');
  check('mobile boss: no horizontal scroll', await noHorizontalScroll(page));
  const t = await tapTargetsOk(page);
  check('mobile boss: tap targets ≥ 40px', t.ok, JSON.stringify(t.small));
  const N = 13;
  const epreuve = (n) => page.locator('main').getByText(`${n} / ${N}`).locator('..').locator('..');
  const tapPick = async (n, text) => { const b = epreuve(n).getByRole('button', { name: text, exact: true }); await b.scrollIntoViewIfNeeded(); await b.tap(); };
  const CORRECT = [
    '130,00 €', '15', '48', '17 pizzas (16 pleines + 1 pour les 4 parts restantes)', '204 €', '166 €',
    '5', '6 rangées de 7 chaises = ?', '3', '7 + 10 − 1 = 16', '6',
    "On écrit 5 et on retient 1 pour les dizaines", 'Calcul posé',
  ];
  for (let i = 0; i < CORRECT.length; i++) {
    await tapPick(i + 1, CORRECT[i]);
    await page.waitForTimeout(80);
  }
  const submit = page.getByRole('button', { name: `Valider mes ${N} réponses` });
  await submit.scrollIntoViewIfNeeded();
  await submit.tap();
  await page.waitForTimeout(700);
  check(`mobile boss: review ${N} / ${N}`, await page.getByText(`${N} / ${N}`).first().isVisible().catch(() => false));
  check('mobile boss: no horizontal scroll on review', await noHorizontalScroll(page));
  await page.screenshot({ path: SHOT_DIR + 'qm-boss-review.png', fullPage: true });
  const profilBtn = page.getByRole('button', { name: /Voir mon profil de maîtrise/ });
  await profilBtn.scrollIntoViewIfNeeded();
  await profilBtn.tap();
  await page.waitForTimeout(300);
  const syntheseBtn = page.getByRole('button', { name: 'Passer à la synthèse →' });
  await syntheseBtn.scrollIntoViewIfNeeded();
  await syntheseBtn.tap();
  await page.waitForTimeout(400);
  check('mobile boss: synthèse no horizontal scroll', await noHorizontalScroll(page));
  await page.screenshot({ path: SHOT_DIR + 'qm-boss-synthese.png', fullPage: true });
  const p = await getProgress(page, KEY);
  check('mobile boss: completedModules has 10', !!p?.completedModules?.includes('10'));
  await ctx.close();
});

check('no console/page errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
