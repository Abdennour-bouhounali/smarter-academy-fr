// Repérage dans le plan (6e) — suite e2e.
// Run: node apps/web/e2e/lesson-kit/x1-reperage.mjs   (vite sur :5183, lancé depuis apps/web/)
import { BASE, check, summary, launch, newCtx, watchErrors, lessonKey, noHorizontalScroll, SHOT_DIR } from './helpers.mjs';

const LESSON = `${BASE}/courses/college/6e/espace_geometrie/reperage-plan`;
const KEY = lessonKey('reperage-plan');
const errors = [];

const settle = async (page, ms = 1200) => { await page.waitForLoadState('domcontentloaded'); await page.waitForTimeout(ms); };

async function seedModules(page, mods) {
  await page.addInitScript(([k, m]) => {
    if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify({ completedModules: m, completedExercises: [] }));
  }, [KEY, mods]);
}

const { browser } = await launch();

/* ── 1. Index + boss toujours ouvert + diagnostic ────────────────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await page.goto(LESSON); await settle(page);

  check('index: titre de la leçon', (await page.getByText('Repérage dans le plan').first().count()) > 0);
  check('index: modules listés', (await page.getByText(/Le trésor perdu/).count()) > 0
    && (await page.getByText(/Mission finale/).count()) > 0);

  await page.goto(`${LESSON}/mission-finale-le-parc`); await settle(page);
  check('boss: ouvert sans progression (stage evaluation)', (await page.getByText(/Épreuve 1/).first().count()) > 0);

  await page.goto(`${LESSON}/mission-de-depart`); await settle(page);
  check('diagnostic: rendu', (await page.getByText(/Mission de départ/).first().count()) > 0);
  check('diagnostic: silencieux avant validation', (await page.getByText(/Bonne réponse/).count()) === 0);
  await ctx.close();
}

/* ── 2. Module 2 — interaction signature (SwapLab), clavier ──────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1']);
  await page.goto(`${LESSON}/les-deux-nombres`); await settle(page);

  const slider = page.locator('svg [role="slider"]').first();
  check('m2: zone tactile unique et focusable', (await slider.count()) === 1);

  await slider.focus();
  await page.keyboard.press('Home'); await page.keyboard.press('PageDown');
  for (const seq of [['ArrowRight', 'ArrowUp'], ['ArrowRight'], ['ArrowUp']]) {
    for (const k of seq) { await page.keyboard.press(k); }
    await page.waitForTimeout(200);
  }
  check('m2: le clavier pilote le point (pas de glisser obligatoire)',
    (await page.getByText(/Nombres échangés/).count()) > 0);

  const compris = page.getByRole('button', { name: /compris ce qui se passe/ });
  check('m2: validation offerte après 3 explorations', (await compris.count()) > 0);
  if (await compris.count()) { await compris.click({ force: true }); await page.waitForTimeout(500); }
  check('m2: étape 1 complétée', (await page.getByText(/de l’autre côté de la diagonale/).count()) > 0);
  await page.screenshot({ path: `${SHOT_DIR}x1-m2-swaplab.png` });

  const wrong = page.getByRole('button', { name: /^De combien on monte$/ });
  if (await wrong.count()) {
    await wrong.first().click({ force: true }); await page.waitForTimeout(500);
    check('m2: mauvaise réponse → bonne réponse révélée', (await page.getByText(/Bonne réponse :/).count()) > 0);
    check('m2: mauvaise réponse → l’étape suivante s’ouvre quand même',
      (await page.getByText(/Même point, ou pas/).count()) > 0);
  }
  await ctx.close();
}

/* ── 3. Module 3 — lecture par croisement des guides ─────────────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2']);
  await page.goto(`${LESSON}/lire-un-point`); await settle(page);

  const slider = page.locator('svg [role="slider"]').first();
  await slider.focus();
  await page.keyboard.press('Home'); await page.keyboard.press('PageDown');
  for (let i = 0; i < 4; i += 1) await page.keyboard.press('ArrowRight');
  for (let i = 0; i < 2; i += 1) await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(600);
  check('m3: guides croisés sur T → étape complétée',
    (await page.getByText(/Les guides se croisent sur T/).count()) > 0);
  await page.screenshot({ path: `${SHOT_DIR}x1-m3-guides.png` });
  await ctx.close();
}

/* ── 4. Module 4 — erreur chiffrée + échappatoire ────────────────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2', '3']);
  await page.goto(`${LESSON}/placer-un-point`); await settle(page);

  const slider = page.locator('svg [role="slider"]').first();
  await slider.focus();
  await page.keyboard.press('Home'); await page.keyboard.press('PageDown');
  for (let t = 0; t < 3; t += 1) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(250); }
  check('m4: l’écart restant est chiffré', (await page.getByText(/il faudrait encore/).count()) > 0);

  const escape = page.getByRole('button', { name: /montre-moi/ });
  check('m4: échappatoire après 3 essais', (await escape.count()) > 0);
  if (await escape.count()) {
    await escape.click({ force: true }); await page.waitForTimeout(500);
    check('m4: échappatoire → complétion sans blocage',
      (await page.getByText(/Pas grave, on te le montre/).count()) > 0);
  }
  await ctx.close();
}

/* ── 5. Module 5 — le robot atteint le drapeau ───────────────────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2', '3', '4']);
  await page.goto(`${LESSON}/le-parcours-du-robot`); await settle(page);

  const right = page.getByRole('button', { name: /Ajouter un pas vers la droite/ }).first();
  const up = page.getByRole('button', { name: /Ajouter un pas vers le haut/ }).first();
  check('m5: palette de pas présente', (await right.count()) > 0 && (await up.count()) > 0);
  for (let i = 0; i < 4; i += 1) { await right.click({ force: true }); await page.waitForTimeout(70); }
  for (let i = 0; i < 3; i += 1) { await up.click({ force: true }); await page.waitForTimeout(70); }
  await page.getByRole('button', { name: /Lancer le robot/ }).first().click({ force: true });
  await page.waitForTimeout(3500);
  check('m5: le robot atteint le drapeau', (await page.getByText(/des deux écarts/).count()) > 0);
  await page.screenshot({ path: `${SHOT_DIR}x1-m5-robot.png` });
  await ctx.close();
}

/* ── 6. Boss complet ─────────────────────────────────────────────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2', '3', '4', '5', '6', '7']);
  await page.goto(`${LESSON}/mission-finale-le-parc`); await settle(page);

  check('boss: 10 épreuves', (await page.getByText(/Épreuve 10/).first().count()) > 0);
  check('boss: silencieux avant submit', (await page.getByText(/Bonne réponse :/).count()) === 0);
  check('boss: registre de contexte affiché', (await page.getByText(/Grande roue/).first().count()) > 0);

  // Bonnes réponses (index 0 partout dans ce boss) : on clique la 1re option
  // de chaque épreuve en ciblant leurs libellés exacts.
  const ANSWERS = [
    /Parce que plusieurs endroits/,
    /De combien on se déplace horizontalement/,
    /Non : les deux nombres n’ont pas le même rôle/,
    /^\(4 ; 2\)$/,
    /Ils sont sur la même verticale/,
    /Le point ①/,
    /^5 pas$/,
    /^2 pas vers le bas$/,
    /Le poteau est au nœud/,
    /Ils sont alignés sur une même ligne horizontale/,
  ];
  for (const rx of ANSWERS) {
    const b = page.getByRole('button', { name: rx }).first();
    if (await b.count()) { await b.click({ force: true }); await page.waitForTimeout(120); }
  }

  const validate = page.getByRole('button', { name: /Valider mes 10 réponses/ });
  check('boss: un seul bouton de validation', (await validate.count()) > 0);
  const enabled = (await validate.count()) ? await validate.isEnabled() : false;
  check('boss: validation activée une fois tout répondu', enabled);

  if (enabled) {
    await validate.click({ force: true }); await page.waitForTimeout(1500);
    check('boss: correction après submit', (await page.getByText(/Résultat du défi/).count()) > 0);
    check('boss: score 10 / 10', (await page.getByText(/10 \/ 10/).first().count()) > 0);

    const profil = page.getByRole('button', { name: /Voir mon profil de maîtrise/ });
    if (await profil.count()) { await profil.click({ force: true }); await page.waitForTimeout(800); }
    check('boss: profil de maîtrise', (await page.getByText(/Ton profil de maîtrise/).count()) > 0);

    const synth = page.getByRole('button', { name: /Passer à la synthèse/ });
    if (await synth.count()) { await synth.click({ force: true }); await page.waitForTimeout(800); }
    check('boss: synthèse rejoue la manipulation de la leçon',
      (await page.getByText(/Ce que tu as construit/).count()) > 0);
    check('boss: synthèse rappelle les pièges', (await page.getByText(/Les pièges à éviter/).count()) > 0);
    await page.screenshot({ path: `${SHOT_DIR}x1-boss-synthese.png`, fullPage: true });

    await page.reload(); await settle(page);
    check('boss: rechargement → correction sauvegardée, pas un quiz vierge',
      (await page.getByText(/Résultat du défi/).count()) > 0);
    check('boss: « Refaire le test » proposé',
      (await page.getByRole('button', { name: /Refaire le test/ }).count()) > 0);
  }
  await ctx.close();
}

/* ── 7. Mobile 375×667 ───────────────────────────────────────────────── */
{
  const ctx = await newCtx(browser, { mobile: true });
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2', '3', '4']);

  for (const slug of ['', '/les-deux-nombres', '/le-parcours-du-robot', '/mission-finale-le-parc']) {
    await page.goto(`${LESSON}${slug}`); await settle(page);
    check(`mobile${slug || '/index'}: aucun défilement horizontal`, await noHorizontalScroll(page));
  }

  await page.goto(`${LESSON}/le-parcours-du-robot`); await settle(page);
  // Chrome applicatif partagé (menu mobile, palette de commandes) exclu : il
  // est hors du périmètre de la leçon et porte des cibles < 40 px de longue date.
  const boxes = await page.locator('main button:visible').evaluateAll((els) =>
    els.map((e) => { const r = e.getBoundingClientRect(); return { h: r.height, t: (e.textContent || '').slice(0, 20) }; })
      .filter((b) => b.h > 0)
  );
  const tooSmall = boxes.filter((b) => b.h < 40);
  check(`mobile: cibles tactiles ≥ 40 px (${tooSmall.length} trop petites / ${boxes.length})`,
    tooSmall.length === 0, JSON.stringify(tooSmall.slice(0, 3)));
  await page.screenshot({ path: `${SHOT_DIR}x1-mobile.png` });
  await ctx.close();
}

check(`aucune erreur console/page (${errors.length})`, errors.length === 0, errors.slice(0, 5).join(' | '));

await browser.close();
process.exit(summary());
