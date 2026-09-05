// Symétrie (6e) — suite e2e.
// Run: node apps/web/e2e/lesson-kit/x5-symetrie.mjs   (vite sur :5183, lancé depuis apps/web/)
import { BASE, check, summary, launch, newCtx, watchErrors, lessonKey, noHorizontalScroll, SHOT_DIR } from './helpers.mjs';

const LESSON = `${BASE}/courses/college/6e/espace_geometrie/symetrie`;
const KEY = lessonKey('symetrie');
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
  check('index: titre', (await page.getByText('Symétrie').first().count()) > 0);
  check('index: modules listés', (await page.getByText(/Le pliage/).count()) > 0
    && (await page.getByText(/Compléter une figure/).count()) > 0);

  await page.goto(`${LESSON}/mission-finale-le-papillon`); await settle(page);
  check('boss: ouvert sans progression', (await page.getByText(/Épreuve 1/).first().count()) > 0);

  await page.goto(`${LESSON}/mission-de-depart`); await settle(page);
  check('diagnostic: rendu et silencieux',
    (await page.getByText(/Mission de départ/).first().count()) > 0 &&
    (await page.getByText(/Bonne réponse/).count()) === 0);
  await ctx.close();
}

/* ── 2. Module 1 — le pliage tranche ─────────────────────────────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0']);
  await page.goto(`${LESSON}/le-pliage`); await settle(page);

  const wrong = page.getByRole('button', { name: /^La figure B$/ });
  if (await wrong.count()) {
    await wrong.first().click({ force: true }); await page.waitForTimeout(500);
    check('m1: mauvaise prédiction → correction visible', (await page.getByText(/Bonne réponse :/).count()) > 0);
  }
  const fold = page.getByRole('button', { name: /Plier le long du pointillé/ });
  check('m1: bouton « Plier » présent', (await fold.count()) > 0);
  if (await fold.count()) {
    await fold.click({ force: true }); await page.waitForTimeout(700);
    check('m1: une figure se superpose, l’autre déborde',
      (await page.getByText(/se superposent exactement/).count()) > 0 &&
      (await page.getByText(/ne coïncident pas/).count()) > 0);
    await page.screenshot({ path: `${SHOT_DIR}x5-m1-pliage.png` });
  }
  await ctx.close();
}

/* ── 3. Module 2 — la diagonale du rectangle n'est PAS un axe ────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1']);
  await page.goto(`${LESSON}/trouver-l-axe`); await settle(page);

  const fold = page.getByRole('button', { name: /Plier les deux/ });
  check('m2: bouton de pliage présent', (await fold.count()) > 0);
  if (await fold.count()) {
    await fold.click({ force: true }); await page.waitForTimeout(700);
    check('m2: le pli du milieu marche, la diagonale non',
      (await page.getByText(/se superposent exactement/).count()) > 0 &&
      (await page.getByText(/ne coïncident pas/).count()) > 0);
    check('m2: la correction nomme les 2 axes du rectangle',
      (await page.getByText(/n’a que/).count()) > 0);
    await page.screenshot({ path: `${SHOT_DIR}x5-m2-axes.png` });
  }
  await ctx.close();
}

/* ── 4. Module 3 — signature MirrorLab : l'image suit en direct ──────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2']);
  await page.goto(`${LESSON}/le-point-et-son-image`); await settle(page);

  const h = page.locator('svg [role="slider"]').first();
  check('m3: le point M est focusable au clavier', (await h.count()) > 0);
  check('m3: les deux distances sont affichées',
    (await page.getByText(/M → axe/).count()) > 0 && (await page.getByText(/axe → M′/).count()) > 0);

  // Les deux distances doivent rester ÉGALES quoi qu'il arrive.
  const gauges = async () => page.evaluate(() =>
    Array.from(document.querySelectorAll('.tabular-nums'))
      .map(e => (e.textContent || '').trim()).filter(t => /^\d+$/.test(t)).map(Number));
  await h.focus();
  let egalesPartout = true;
  for (const key of ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown']) {
    for (let i = 0; i < 8; i += 1) { await page.keyboard.press(key); await page.waitForTimeout(40); }
    await page.waitForTimeout(220);
    const g = await gauges();
    if (g.length >= 2 && g[0] !== g[1]) egalesPartout = false;
  }
  check('m3: les deux distances restent TOUJOURS égales', egalesPartout);

  const btn = page.getByRole('button', { name: /J’ai vu la règle/ });
  check('m3: validation offerte après exploration', (await btn.count()) > 0);
  if (await btn.count()) {
    await btn.click({ force: true }); await page.waitForTimeout(500);
    // Le texte est réparti sur plusieurs lignes JSX : on cible un fragment
    // court qui survit au reflow plutôt qu'une phrase entière.
    check('m3: étape complétée', (await page.getByText(/coïncidences/).count()) > 0);
  }
  await page.screenshot({ path: `${SHOT_DIR}x5-m3-mirror.png` });
  await ctx.close();
}

/* ── 5. Module 4 — les DEUX conditions, contrôlées séparément ────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2', '3']);
  await page.goto(`${LESSON}/construire-le-symetrique`); await settle(page);

  check('m4: les deux voyants sont affichés séparément',
    (await page.getByText(/perpendiculaire à l’axe/).first().count()) > 0 &&
    (await page.getByText(/Distances égales à l’axe/).count()) > 0);
  check('m4: aucun succès prématuré',
    (await page.getByText(/Les deux conditions sont réunies/).count()) === 0);

  // Échappatoire après 3 indices.
  const hint = page.getByRole('button', { name: /Un indice/ }).first();
  for (let i = 0; i < 3 && (await hint.count()); i += 1) {
    await hint.click({ force: true }); await page.waitForTimeout(200);
  }
  const esc = page.getByRole('button', { name: /montre-moi/ });
  check('m4: échappatoire après 3 indices', (await esc.count()) > 0);
  if (await esc.count()) {
    await esc.click({ force: true }); await page.waitForTimeout(500);
    check('m4: échappatoire complète l’étape', (await page.getByText(/Pas grave, on te le montre/).count()) > 0);
  }
  await ctx.close();
}

/* ── 6. Module 6 — compléter sommet par sommet ───────────────────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2', '3', '4', '5']);
  await page.goto(`${LESSON}/completer-une-figure`); await settle(page);
  check('m6: le compteur de sommets est affiché',
    (await page.getByText(/0 \/ 3 placés/).count()) > 0);
  check('m6: le sommet courant est nommé',
    (await page.getByText(/Sommet A/).first().count()) > 0);
  await ctx.close();
}

/* ── 7. Boss complet ─────────────────────────────────────────────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2', '3', '4', '5', '6', '7']);
  await page.goto(`${LESSON}/mission-finale-le-papillon`); await settle(page);

  check('boss: 10 épreuves', (await page.getByText(/Épreuve 10/).first().count()) > 0);
  check('boss: silencieux avant submit', (await page.getByText(/Bonne réponse :/).count()) === 0);

  const ANSWERS = [
    /En pliant le long de cette droite/,
    /Non : en pliant sur la diagonale/,
    /^4 axes$/,
    /^6 cm$/,
    /Tracer la perpendiculaire à \(d\) passant par M/,
    /En construisant le symétrique de chacun/,
    /Un angle droit \(90°\)/,
    /Non : il manque la perpendicularité/,
    /La position de la figure dans le plan/,
    /^48 cm²$/,
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
    check('boss: synthèse rejoue le miroir',
      (await page.getByText(/Le miroir, en deux conditions/).count()) > 0);
    await page.screenshot({ path: `${SHOT_DIR}x5-boss-synthese.png`, fullPage: true });
    await page.reload(); await settle(page);
    check('boss: rechargement → correction sauvegardée', (await page.getByText(/Résultat du défi/).count()) > 0);
  }
  await ctx.close();
}

/* ── 8. Mobile ───────────────────────────────────────────────────────── */
{
  const ctx = await newCtx(browser, { mobile: true });
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2', '3', '4', '5', '6']);
  for (const slug of ['', '/le-pliage', '/le-point-et-son-image', '/construire-le-symetrique']) {
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
  await page.screenshot({ path: `${SHOT_DIR}x5-mobile.png` });
  await ctx.close();
}

check(`aucune erreur console/page (${errors.length})`, errors.length === 0, errors.slice(0, 5).join(' | '));

await browser.close();
process.exit(summary());
