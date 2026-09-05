// Constructions géométriques (6e) — suite e2e.
import { BASE, check, summary, launch, newCtx, watchErrors, lessonKey, noHorizontalScroll, SHOT_DIR } from './helpers.mjs';

const LESSON = `${BASE}/courses/college/6e/espace_geometrie/constructions-geometriques`;
const KEY = lessonKey('constructions-geometriques');
const errors = [];
const settle = async (p, ms = 1200) => { await p.waitForLoadState('domcontentloaded'); await p.waitForTimeout(ms); };
async function seed(page, mods) {
  await page.addInitScript(([k, m]) => {
    if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify({ completedModules: m, completedExercises: [] }));
  }, [KEY, mods]);
}
const { browser } = await launch();

{
  const ctx = await newCtx(browser); const page = await ctx.newPage(); watchErrors(page, errors);
  await page.goto(LESSON); await settle(page);
  check('index: titre', (await page.getByText('Constructions géométriques').first().count()) > 0);
  await page.goto(`${LESSON}/mission-finale-l-atelier`); await settle(page);
  check('boss: ouvert sans progression', (await page.getByText(/Épreuve 1/).first().count()) > 0);
  await page.goto(`${LESSON}/mission-de-depart`); await settle(page);
  check('diagnostic: silencieux', (await page.getByText(/Bonne réponse/).count()) === 0);
  await ctx.close();
}

/* Module 3 — le compas : régler l'écartement. */
{
  const ctx = await newCtx(browser); const page = await ctx.newPage(); watchErrors(page, errors);
  await seed(page, ['0', '1', '2']);
  await page.goto(`${LESSON}/le-compas`); await settle(page);
  const slider = page.getByRole('slider').first();
  check('m3: le réglage d’écartement est présent', (await slider.count()) > 0);
  check('m3: aucun succès prématuré', (await page.getByText(/Le compas est réglé/).count()) === 0);
  const plus = page.getByRole('button', { name: /Ouvrir le compas/ }).first();
  let ok = false;
  for (let i = 0; i < 30 && !ok; i += 1) {
    await plus.click({ force: true }); await page.waitForTimeout(45);
    ok = (await page.getByText(/Le compas est réglé/).count()) > 0;
  }
  check('m3: l’écartement s’ajuste au segment', ok);
  await page.screenshot({ path: `${SHOT_DIR}x7-m3-compas.png` });
  await ctx.close();
}

/* Module 5 — le programme : l'ordre a un sens. */
{
  const ctx = await newCtx(browser); const page = await ctx.newPage(); watchErrors(page, errors);
  await seed(page, ['0', '1', '2', '3', '4']);
  await page.goto(`${LESSON}/le-programme-de-construction`); await settle(page);
  check('m5: les étapes mélangées sont proposées',
    (await page.getByText(/Quelle étape vient ensuite/).count()) > 0);

  // Choisir une étape qui dépend d'une autre : doit être refusée en la nommant.
  const perp = page.getByRole('button', { name: /Tracer la perpendiculaire/ }).first();
  if (await perp.count()) {
    await perp.click({ force: true }); await page.waitForTimeout(400);
    check('m5: une étape trop tôt est refusée ET expliquée',
      (await page.getByText(/arrive trop tôt/).count()) > 0);
  }
  // Puis la bonne première étape.
  const seg = page.getByRole('button', { name: /Tracer un segment \[AB\]/ }).first();
  if (await seg.count()) {
    await seg.click({ force: true }); await page.waitForTimeout(400);
    check('m5: la bonne première étape est acceptée',
      (await page.getByText(/Quelle étape vient ensuite/).count()) > 0);
  }
  await ctx.close();
}

/* Boss */
{
  const ctx = await newCtx(browser); const page = await ctx.newPage(); watchErrors(page, errors);
  await seed(page, ['0', '1', '2', '3', '4', '5', '6']);
  await page.goto(`${LESSON}/mission-finale-l-atelier`); await settle(page);
  check('boss: 10 épreuves', (await page.getByText(/Épreuve 10/).first().count()) > 0);

  const ANSWERS = [
    /7 unités/,
    /Placer A sur la graduation 0/,
    /L’égalité de deux longueurs/,
    /On règle le compas sur le segment/,
    /Un côté de l’angle droit le long/,
    /Utiliser l’équerre/,
    /Le compas — il reporte/,
    /Non : chaque étape s’appuie/,
    /^L’équerre$/,
    /En contrôlant ses 4 angles droits/,
  ];
  // « L’équerre » apparaît dans DEUX épreuves : on clique la dernière
  // occurrence pour celle-là, sinon la 9e resterait sans réponse.
  for (const rx of ANSWERS) {
    const all = page.getByRole('button', { name: rx });
    const n = await all.count();
    if (!n) continue;
    await all.nth(n - 1).click({ force: true });
    await page.waitForTimeout(110);
  }
  // Rattraper les épreuves encore sans réponse (une option cliquée deux fois
  // par la boucle laisse la première épreuve vide).
  for (const rx of ANSWERS) {
    const all = page.getByRole('button', { name: rx });
    if ((await all.count()) > 1) {
      await all.first().click({ force: true });
      await page.waitForTimeout(110);
    }
  }
  const v = page.getByRole('button', { name: /Valider mes 10 réponses/ });
  const enabled = (await v.count()) ? await v.isEnabled() : false;
  check('boss: validation activée', enabled);
  if (enabled) {
    await v.click({ force: true }); await page.waitForTimeout(1500);
    check('boss: score 10 / 10', (await page.getByText(/10 \/ 10/).first().count()) > 0);
    const pr = page.getByRole('button', { name: /Voir mon profil/ });
    if (await pr.count()) { await pr.click({ force: true }); await page.waitForTimeout(700); }
    const sy = page.getByRole('button', { name: /Passer à la synthèse/ });
    if (await sy.count()) { await sy.click({ force: true }); await page.waitForTimeout(700); }
    check('boss: synthèse — trois instruments', (await page.getByText(/Trois instruments, trois garanties/).count()) > 0);
    check('boss: clôture du chapitre annoncée', (await page.getByText(/chapitre/).first().count()) > 0);
    await page.screenshot({ path: `${SHOT_DIR}x7-boss.png`, fullPage: true });
  }
  await ctx.close();
}

/* Mobile */
{
  const ctx = await newCtx(browser, { mobile: true }); const page = await ctx.newPage(); watchErrors(page, errors);
  await seed(page, ['0', '1', '2', '3', '4', '5']);
  for (const slug of ['', '/le-compas', '/l-equerre', '/le-programme-de-construction']) {
    await page.goto(`${LESSON}${slug}`); await settle(page);
    check(`mobile${slug || '/index'}: aucun défilement horizontal`, await noHorizontalScroll(page));
  }
  const boxes = await page.locator('main button:visible').evaluateAll((els) =>
    els.map((e) => { const r = e.getBoundingClientRect(); return { h: r.height, t: (e.textContent || '').slice(0, 18) }; }).filter((b) => b.h > 0));
  const small = boxes.filter((b) => b.h < 40);
  check(`mobile: cibles ≥ 40 px (${small.length} / ${boxes.length})`, small.length === 0, JSON.stringify(small.slice(0, 3)));
  await ctx.close();
}

check(`aucune erreur console/page (${errors.length})`, errors.length === 0, errors.slice(0, 4).join(' | '));
await browser.close();
process.exit(summary());
