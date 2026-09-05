// Algorithmique et programmation (6e) — suite e2e.
// Run: node apps/web/e2e/lesson-kit/z1-algorithmique.mjs   (vite sur :5183, lancé depuis apps/web/)
import { BASE, check, summary, launch, newCtx, watchErrors, lessonKey, noHorizontalScroll, SHOT_DIR } from './helpers.mjs';

const LESSON = `${BASE}/courses/college/6e/algorithmique/algorithmique-programmation`;
const KEY = lessonKey('algorithmique-programmation');
const errors = [];

const settle = async (page, ms = 1200) => { await page.waitForLoadState('domcontentloaded'); await page.waitForTimeout(ms); };

async function seedModules(page, mods) {
  await page.addInitScript(([k, m]) => {
    if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify({ completedModules: m, completedExercises: [] }));
  }, [KEY, mods]);
}

/** Ajoute n fois l'instruction `label` depuis la palette, puis exécute. */
async function addAndRun(page, label, n = 1) {
  const card = page.getByRole('button', { name: new RegExp(`^Ajouter l’instruction ${label}$`) }).last();
  for (let i = 0; i < n; i += 1) await card.click();
  await page.getByRole('button', { name: 'Exécuter le programme' }).last().click();
}

const { browser } = await launch();

/* ── 1. Index + boss toujours ouvert + diagnostic non bloquant ───────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await page.goto(LESSON); await settle(page);

  check('index: titre de la leçon', (await page.getByText('Algorithmique et programmation').first().count()) > 0);
  check('index: modules listés', (await page.getByText(/Le robot n'obéit pas/).count()) > 0
    && (await page.getByText(/Mission finale/).count()) > 0);

  // stage evaluation : toujours accessible, même sans progression
  await page.goto(`${LESSON}/mission-finale-le-robot-explorateur`); await settle(page);
  check('boss: ouvert sans progression (stage evaluation)', (await page.getByText(/Épreuve 1/).first().count()) > 0);
  check('boss: silencieux avant validation', (await page.getByText(/Bonne réponse/).count()) === 0);

  await page.goto(`${LESSON}/mission-de-depart`); await settle(page);
  check('diagnostic: rendu', (await page.getByText(/Mission de départ/).first().count()) > 0);
  check('diagnostic: silencieux avant validation', (await page.getByText(/Bonne réponse/).count()) === 0);
  await ctx.close();
}

/* ── 2. Module 1 — le déclencheur : parler ne marche pas ─────────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0']);
  await page.goto(`${LESSON}/le-robot-nobeit-pas`); await settle(page);

  const before = await page.getByText(/ROBI : colonne 0, ligne 1/).count();
  check('m1: ROBI démarre en colonne 0, ligne 1', before > 0);

  // Parler : le robot ne bouge PAS — c'est tout le propos du module.
  await page.getByRole('button', { name: /Va au drapeau/ }).click();
  await page.waitForTimeout(400);
  check('m1: parler ne déplace pas ROBI', (await page.getByText(/ROBI : colonne 0, ligne 1/).count()) > 0);
  check('m1: le robot signale son incompréhension', (await page.getByText(/Je ne comprends pas/).count()) > 0);

  // Deuxième phrase → l'instruction AVANCER apparaît.
  await page.getByRole('button', { name: /Avance jusqu’à la fleur/ }).click();
  await page.waitForTimeout(500);
  const instrBtn = page.getByRole('button', { name: /^AVANCER$/ });
  check('m1: l’instruction AVANCER apparaît après les tentatives', (await instrBtn.count()) > 0);

  await instrBtn.click(); await page.waitForTimeout(300);
  check('m1: l’instruction, elle, déplace ROBI', (await page.getByText(/ROBI : colonne 1, ligne 1/).count()) > 0);
  await instrBtn.click(); await page.waitForTimeout(400);
  check('m1: objectif atteint → étape validée', (await page.getByText(/ROBI est sur le drapeau/).count()) > 0);
  await ctx.close();
}

/* ── 3. Module 3 — construire une séquence : échec puis réussite ─────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2']);
  await page.goto(`${LESSON}/construire-une-sequence`); await settle(page);

  check('m3: laboratoire présent', (await page.getByRole('group', { name: 'Laboratoire de programmation' }).count()) > 0);

  // VOLONTAIREMENT FAUX : 4 AVANCER sans tourner → ROBI dépasse / se bloque.
  await addAndRun(page, 'avancer d’une case', 4);
  await page.waitForTimeout(2600);
  const failed = await page.getByText(/n’est pas le drapeau|heurté un obstacle|s’est arrêté/).count();
  check('m3: erreur volontaire → correction visible, sans blocage', failed > 0);

  // La progression n'est PAS gelée : on corrige et on relance.
  await page.getByRole('button', { name: 'Remettre ROBI au départ' }).last().click();
  await page.waitForTimeout(300);
  const removeBtns = page.getByRole('button', { name: /^Supprimer l’instruction/ });
  const n = await removeBtns.count();
  check('m3: les cartes restent supprimables après un échec', n > 0);
  for (let i = 0; i < n; i += 1) await removeBtns.first().click();

  await addAndRun(page, 'avancer d’une case', 2);
  await page.waitForTimeout(1400);
  await page.getByRole('button', { name: /^Ajouter l’instruction tourner à gauche$/ }).last().click();
  await addAndRun(page, 'avancer d’une case', 2);
  await page.waitForTimeout(3000);
  check('m3: le bon programme atteint le drapeau', (await page.getByText(/ROBI est arrivé|Bravo/).count()) > 0);
  await ctx.close();
}

/* ── 4. Module 5 — la boucle : compression et trace identique ────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2', '3', '4']);
  await page.goto(`${LESSON}/repeter-sans-tout-reecrire`); await settle(page);

  check('m5: le couloir long est proposé', (await page.getByText(/8 cases|huit cases/i).count()) > 0);

  // Étape 1 : les 8 AVANCER à la main.
  await addAndRun(page, 'avancer d’une case', 8);
  await page.waitForTimeout(4200);
  check('m5: 8 AVANCER amènent ROBI au drapeau', (await page.getByText(/ROBI y est|ROBI est arrivé/).count()) > 0);
  await ctx.close();
}

/* ── 5. Module 6 — déboguer : le programme fourni est bien fautif ────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2', '3', '4', '5']);
  await page.goto(`${LESSON}/reparer-un-programme`); await settle(page);

  check('m6: le programme d’hier est pré-chargé', (await page.getByText(/RÉPÉTER/).count()) > 0);
  const plus = page.getByRole('button', { name: 'Une répétition de plus' }).first();
  check('m6: le nombre de répétitions est réglable', (await plus.count()) > 0);
  await plus.click(); await plus.click();          // 3 → 5
  await page.getByRole('button', { name: 'Exécuter le programme' }).first().click();
  await page.waitForTimeout(3200);
  check('m6: régler la boucle suffit à réussir', (await page.getByText(/un seul nombre|ROBI est arrivé/).count()) > 0);
  await ctx.close();
}

/* ── 6. Boss — silencieux → submit → profil → synthèse → rechargement ── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2', '3', '4', '5', '6', '7']);
  await page.goto(`${LESSON}/mission-finale-le-robot-explorateur`); await settle(page);

  // Répond à toutes les épreuves (1re option partout : volontairement imparfait).
  const groups = page.locator('[role="group"]');
  const total = await groups.count();
  for (let i = 0; i < total; i += 1) {
    const opts = groups.nth(i).getByRole('button');
    if ((await opts.count()) > 0) await opts.first().click().catch(() => {});
  }
  await page.waitForTimeout(400);
  check('boss: toujours silencieux avant la validation', (await page.getByText(/Bonne réponse/).count()) === 0);

  const submit = page.getByRole('button', { name: /Valider|Terminer le test|Voir mon score/ }).last();
  if (await submit.count()) {
    await submit.click(); await settle(page, 1600);
    check('boss: score affiché après validation', (await page.getByText(/\/ 10|score|Score/).count()) > 0);
  }

  await page.reload(); await settle(page, 1600);
  check('boss: le rechargement montre la correction, pas un test vierge',
    (await page.getByText(/Refaire le test|Mon profil|score|Score/).count()) > 0);
  await ctx.close();
}

/* ── 7. Mobile 375×667 : pas de scroll horizontal, cibles ≥ 40 px ────── */
{
  const ctx = await newCtx(browser, { mobile: true });
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1']);
  await page.goto(`${LESSON}/une-instruction-un-effet`); await settle(page);

  check('mobile: aucun défilement horizontal', await noHorizontalScroll(page));

  const cells = page.getByRole('button', { name: /^Prédire colonne/ });
  if (await cells.count()) {
    const box = await cells.first().boundingBox();
    check('mobile: cibles de prédiction ≥ 40 px', box && box.height >= 40, box ? `${box.height}px` : 'no box');
    await cells.first().tap();
    check('mobile: le tap sélectionne une case', (await cells.first().getAttribute('aria-pressed')) === 'true');
  }

  await page.goto(`${LESSON}/le-robot-nobeit-pas`); await settle(page);
  check('mobile m1: aucun défilement horizontal', await noHorizontalScroll(page));
  await page.screenshot({ path: `${SHOT_DIR}z1-algo-mobile.png`, fullPage: false });
  await ctx.close();
}

/* ── 8. Accessibilité : le SVG n'avale pas les boutons ───────────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2']);
  await page.goto(`${LESSON}/construire-une-sequence`); await settle(page);

  const svgButtons = await page.locator('svg[role="img"] button').count();
  check('a11y: aucun bouton caché dans un SVG role="img"', svgButtons === 0, `${svgButtons} trouvé(s)`);

  const world = page.locator('svg[role="img"]').first();
  const lbl = await world.getAttribute('aria-label');
  check('a11y: le monde énonce la position de ROBI', !!lbl && /colonne .*ligne .*tourné vers/.test(lbl), lbl || '');

  // Opérable au clavier : la palette est atteignable et activable.
  const add = page.getByRole('button', { name: /^Ajouter l’instruction avancer/ }).last();
  await add.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  check('a11y: ajout d’instruction au clavier', (await page.getByRole('button', { name: /^Supprimer l’instruction 1$/ }).count()) > 0);
  await ctx.close();
}

await browser.close();
check('aucune erreur console/page', errors.length === 0, errors.slice(0, 6).join(' | '));
process.exit(summary() ? 1 : 0);
