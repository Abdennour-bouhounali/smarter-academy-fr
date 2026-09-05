// Parallélisme et perpendicularité (6e) — suite e2e.
// Run: node apps/web/e2e/lesson-kit/x3-parallelisme.mjs   (vite sur :5183, lancé depuis apps/web/)
import { BASE, check, summary, launch, newCtx, watchErrors, lessonKey, noHorizontalScroll, SHOT_DIR } from './helpers.mjs';

const LESSON = `${BASE}/courses/college/6e/espace_geometrie/parallelisme-perpendicularite`;
const KEY = lessonKey('parallelisme-perpendicularite');
const errors = [];

const settle = async (page, ms = 1200) => { await page.waitForLoadState('domcontentloaded'); await page.waitForTimeout(ms); };
async function seedModules(page, mods) {
  await page.addInitScript(([k, m]) => {
    if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify({ completedModules: m, completedExercises: [] }));
  }, [KEY, mods]);
}

const { browser } = await launch();

/* ── 1. Index, boss ouvert, diagnostic ───────────────────────────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await page.goto(LESSON); await settle(page);
  check('index: titre', (await page.getByText('Parallélisme et perpendicularité').first().count()) > 0);
  check('index: 10 modules listés', (await page.getByText(/Les rails qui ne se croisent jamais/).count()) > 0
    && (await page.getByText(/Le chemin le plus court/).count()) > 0);

  await page.goto(`${LESSON}/mission-finale-le-quartier`); await settle(page);
  check('boss: ouvert sans progression', (await page.getByText(/Épreuve 1/).first().count()) > 0);

  await page.goto(`${LESSON}/mission-de-depart`); await settle(page);
  check('diagnostic: rendu et silencieux',
    (await page.getByText(/Mission de départ/).first().count()) > 0 &&
    (await page.getByText(/Bonne réponse/).count()) === 0);
  await ctx.close();
}

/* ── 2. Module 1 — le trigger : prolonger révèle l'intersection ──────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0']);
  await page.goto(`${LESSON}/les-rails-qui-ne-se-croisent-jamais`); await settle(page);

  // Prédiction volontairement FAUSSE → doit progresser quand même.
  const wrong = page.getByRole('button', { name: /^La paire A$/ });
  if (await wrong.count()) {
    await wrong.first().click({ force: true }); await page.waitForTimeout(500);
    check('m1: mauvaise prédiction → correction visible', (await page.getByText(/Bonne réponse :/).count()) > 0);
    check('m1: mauvaise prédiction → étape 2 ouverte',
      (await page.getByText(/Recule la vue et vérifie/).count()) > 0);
  }

  const prolonger = page.getByRole('button', { name: /Prolonger les quatre droites/ });
  check('m1: bouton de prolongement présent', (await prolonger.count()) > 0);
  if (await prolonger.count()) {
    await prolonger.click({ force: true }); await page.waitForTimeout(700);
    check('m1: l’intersection de la paire B apparaît réellement',
      (await page.getByText(/elles se coupent/).count()) > 0);
    await page.screenshot({ path: `${SHOT_DIR}x3-m1-zoom.png` });
    const seen = page.getByRole('button', { name: /J’ai vu ce qui se passe/ });
    if (await seen.count()) { await seen.click({ force: true }); await page.waitForTimeout(400); }
    check('m1: étape 2 complétée', (await page.getByText(/garde le même écart/).count()) > 0);
  }
  await ctx.close();
}

/* ── 3. Module 2 — signature EcartGauge : écart constant vs variable ─── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1']);
  await page.goto(`${LESSON}/l-ecart-constant`); await settle(page);

  const handle = page.locator('svg [role="slider"]').first();
  check('m2: le point P est focusable au clavier', (await handle.count()) > 0);
  await handle.focus();

  // Trois mesures à trois endroits différents.
  for (let i = 0; i < 3; i += 1) {
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(150);
    const stamp = page.getByRole('button', { name: /Noter cette mesure/ }).first();
    if (await stamp.count()) { await stamp.click({ force: true }); await page.waitForTimeout(200); }
  }
  check('m2: les parallèles donnent des mesures IDENTIQUES',
    (await page.getByText(/Toutes identiques/).count()) > 0);
  check('m2: étape 1 complétée sur l’objectif réel',
    (await page.getByText(/même écart partout/).count()) > 0);
  await page.screenshot({ path: `${SHOT_DIR}x3-m2-ecart.png` });
  await ctx.close();
}

/* ── 4. Module 3 — RotateToRight : la marque n'apparaît qu'à 90° ─────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2']);
  await page.goto(`${LESSON}/l-angle-droit`); await settle(page);

  check('m3: la marque d’angle droit est ABSENTE au départ',
    (await page.getByText(/90° pile/).count()) === 0);

  // d1 = 20°, d2 démarre à 55° → il faut atteindre 110°, soit 11 pas de 5°.
  const cw = page.getByRole('button', { name: /Tourner de 5 degrés vers la droite/ }).first();
  check('m3: boutons de rotation présents (pas de glisser obligatoire)', (await cw.count()) > 0);
  for (let i = 0; i < 14 && (await page.getByText(/90° pile/).count()) === 0; i += 1) {
    await cw.click({ force: true }); await page.waitForTimeout(120);
  }
  check('m3: à 90°, la marque apparaît et l’étape se complète',
    (await page.getByText(/90° pile/).count()) > 0);
  check('m3: le verdict est nommé', (await page.getByText(/perpendiculaires/).first().count()) > 0);
  await page.screenshot({ path: `${SHOT_DIR}x3-m3-angledroit.png` });
  await ctx.close();
}

/* ── 5. Module 7 — l'équerre construit ; Tracer refusé si mal posée ──── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2', '3', '4', '5', '6']);
  await page.goto(`${LESSON}/l-atelier-de-construction`); await settle(page);

  const tracer = page.getByRole('button', { name: /Tracer le long de l’équerre/ }).first();
  check('m7: bouton Tracer présent', (await tracer.count()) > 0);
  check('m7: Tracer est DÉSACTIVÉ tant que l’équerre est mal posée',
    (await tracer.count()) > 0 && !(await tracer.isEnabled()));

  // Poser l'équerre correctement au clavier : d est horizontale (0°), A=(200,145).
  const eq = page.locator('svg [role="slider"]').first();
  await eq.focus();
  // Ramener l'angle à 0° : 40° → 0 par pas de 5 (touche '-').
  for (let i = 0; i < 10; i += 1) { await page.keyboard.press('-'); await page.waitForTimeout(60); }
  check('m7: un voyant s’allume quand l’orientation est bonne',
    (await page.getByText(/Côté sur la droite/).count()) > 0);
  await page.screenshot({ path: `${SHOT_DIR}x3-m7-equerre.png` });
  await ctx.close();
}

/* ── 6. Module 8 — le plus court chemin est perpendiculaire ──────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2', '3', '4', '5', '6', '7']);
  await page.goto(`${LESSON}/le-chemin-le-plus-court`); await settle(page);

  const h = page.locator('svg [role="slider"]').first();
  check('m8: le point d’arrivée est focusable', (await h.count()) > 0);
  await h.focus();
  // Chercher le minimum : le pied est à t ≈ 179, on part de t = 40.
  let found = false;
  for (let i = 0; i < 22 && !found; i += 1) {
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(70);
    found = (await page.getByText(/arrive perpendiculairement/).count()) > 0;
  }
  check('m8: au minimum, le trajet est perpendiculaire (marque affichée)', found);
  if (found) {
    const keep = page.getByRole('button', { name: /Garder ce trajet/ }).first();
    if (await keep.count()) { await keep.click({ force: true }); await page.waitForTimeout(500); }
    check('m8: le record perpendiculaire complète l’étape',
      (await page.getByText(/distance du point M à la droite/).count()) > 0);
  }
  await page.screenshot({ path: `${SHOT_DIR}x3-m8-chemin.png` });
  await ctx.close();
}

/* ── 7. Boss complet ─────────────────────────────────────────────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2', '3', '4', '5', '6', '7', '8']);
  await page.goto(`${LESSON}/mission-finale-le-quartier`); await settle(page);

  check('boss: 10 épreuves', (await page.getByText(/Épreuve 10/).first().count()) > 0);
  check('boss: silencieux avant submit', (await page.getByText(/Bonne réponse :/).count()) === 0);

  const ANSWERS = [
    /^Elles sont parallèles$/,
    /Non : elles pourraient se couper au-delà/,
    /Oui : c’est l’angle entre elles qui compte/,
    /^Non : il faut exactement 90°$/,
    /À quoi elle est perpendiculaire/,
    /Mesurer l’écart perpendiculairement/,
    /Rien pour le point A/,
    /Tracer deux perpendiculaires successives/,
    /^Une seule$/,
    /^Perpendiculairement à la route$/,
  ];
  for (const rx of ANSWERS) {
    const b = page.getByRole('button', { name: rx }).first();
    if (await b.count()) { await b.click({ force: true }); await page.waitForTimeout(110); }
  }

  const validate = page.getByRole('button', { name: /Valider mes 10 réponses/ });
  const enabled = (await validate.count()) ? await validate.isEnabled() : false;
  check('boss: validation activée une fois tout répondu', enabled);
  if (enabled) {
    await validate.click({ force: true }); await page.waitForTimeout(1500);
    check('boss: score 10 / 10', (await page.getByText(/10 \/ 10/).first().count()) > 0);

    const profil = page.getByRole('button', { name: /Voir mon profil de maîtrise/ });
    if (await profil.count()) { await profil.click({ force: true }); await page.waitForTimeout(800); }
    check('boss: profil de maîtrise', (await page.getByText(/Ton profil de maîtrise/).count()) > 0);

    const synth = page.getByRole('button', { name: /Passer à la synthèse/ });
    if (await synth.count()) { await synth.click({ force: true }); await page.waitForTimeout(800); }
    check('boss: synthèse rejoue les deux relations',
      (await page.getByText(/Deux relations, deux marques/).count()) > 0);
    await page.screenshot({ path: `${SHOT_DIR}x3-boss-synthese.png`, fullPage: true });

    await page.reload(); await settle(page);
    check('boss: rechargement → correction sauvegardée',
      (await page.getByText(/Résultat du défi/).count()) > 0);
  }
  await ctx.close();
}

/* ── 8. Mobile ───────────────────────────────────────────────────────── */
{
  const ctx = await newCtx(browser, { mobile: true });
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2', '3', '4', '5', '6', '7']);
  for (const slug of ['', '/l-ecart-constant', '/l-angle-droit', '/l-atelier-de-construction', '/le-chemin-le-plus-court']) {
    await page.goto(`${LESSON}${slug}`); await settle(page);
    check(`mobile${slug || '/index'}: aucun défilement horizontal`, await noHorizontalScroll(page));
  }
  const boxes = await page.locator('main button:visible').evaluateAll((els) =>
    els.map((e) => { const r = e.getBoundingClientRect(); return { h: r.height, t: (e.textContent || '').slice(0, 20) }; })
      .filter((b) => b.h > 0)
  );
  const tooSmall = boxes.filter((b) => b.h < 40);
  check(`mobile: cibles tactiles ≥ 40 px (${tooSmall.length} / ${boxes.length})`, tooSmall.length === 0,
    JSON.stringify(tooSmall.slice(0, 3)));
  await page.screenshot({ path: `${SHOT_DIR}x3-mobile.png` });
  await ctx.close();
}

check(`aucune erreur console/page (${errors.length})`, errors.length === 0, errors.slice(0, 5).join(' | '));

await browser.close();
process.exit(summary());
