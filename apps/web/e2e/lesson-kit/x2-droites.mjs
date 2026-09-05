// Droites et segments (6e) — suite e2e.
// Run: node apps/web/e2e/lesson-kit/x2-droites.mjs   (vite sur :5183, lancé depuis apps/web/)
import { BASE, check, summary, launch, newCtx, watchErrors, lessonKey, noHorizontalScroll, SHOT_DIR } from './helpers.mjs';

const LESSON = `${BASE}/courses/college/6e/espace_geometrie/droites-segments`;
const KEY = lessonKey('droites-segments');
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
  check('index: titre', (await page.getByText('Droites et segments').first().count()) > 0);
  check('index: modules listés', (await page.getByText(/Jusqu’où ça va/).count()) > 0);

  await page.goto(`${LESSON}/mission-finale-le-skatepark`); await settle(page);
  check('boss: ouvert sans progression', (await page.getByText(/Épreuve 1/).first().count()) > 0);

  await page.goto(`${LESSON}/mission-de-depart`); await settle(page);
  check('diagnostic: rendu et silencieux',
    (await page.getByText(/Mission de départ/).first().count()) > 0 &&
    (await page.getByText(/Bonne réponse/).count()) === 0);
  await ctx.close();
}

/* ── 2. Module 1 — signature ExtentPuller : bloque / continue ────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0']);
  await page.goto(`${LESSON}/jusqu-ou-ca-va`); await settle(page);

  // Étape 1 : le SEGMENT doit finir par bloquer.
  const prolonger = page.getByRole('button', { name: /Prolonger/ }).first();
  check('m1: bouton tap « Prolonger » présent (glisser non obligatoire)', (await prolonger.count()) > 0);
  for (let i = 0; i < 14 && (await page.getByText(/Ça bloque/).count()) === 0; i += 1) {
    await prolonger.click({ force: true }); await page.waitForTimeout(120);
  }
  check('m1: le segment BLOQUE à son extrémité', (await page.getByText(/Ça bloque/).count()) > 0);
  check('m1: étape 1 complétée par l’objectif réel',
    (await page.getByText(/c’est un .{0,3}segment|Il a deux bouts/).count()) > 0);
  await page.screenshot({ path: `${SHOT_DIR}x2-m1-blocked.png` });

  // Étape 2 : la DROITE doit continuer (dézoom).
  const prolonger2 = page.getByRole('button', { name: /Prolonger/ }).nth(1);
  if (await prolonger2.count()) {
    for (let i = 0; i < 14 && (await page.getByText(/Ça continue/).count()) === 0; i += 1) {
      await prolonger2.click({ force: true }); await page.waitForTimeout(140);
    }
    check('m1: la droite CONTINUE (vue dézoomée)', (await page.getByText(/Ça continue/).count()) > 0);
    check('m1: étape 2 complétée', (await page.getByText(/aucun bout/).count()) > 0);
  }

  // Étape 3 : mauvaise réponse volontaire → progression maintenue.
  const wrong = page.getByRole('button', { name: /la droite est simplement plus longue/ });
  if (await wrong.count()) {
    await wrong.first().click({ force: true }); await page.waitForTimeout(400);
    check('m1: mauvaise réponse → correction visible', (await page.getByText(/Bonne réponse :/).count()) > 0);
    check('m1: mauvaise réponse → pas de blocage', (await page.getByText(/n’est pas « un segment très long »/).count()) > 0);
  }
  await ctx.close();
}

/* ── 3. Module 3 — KindMorph : 3 types, mêmes points ─────────────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2']);
  await page.goto(`${LESSON}/le-tri-des-traits`); await settle(page);

  for (const label of ['demi-droite', 'droite']) {
    const b = page.getByRole('button', { name: new RegExp(`^${label}`, 'i') }).first();
    if (await b.count()) { await b.click({ force: true }); await page.waitForTimeout(250); }
  }
  const seen = page.getByRole('button', { name: /J’ai vu les trois/ });
  check('m3: validation offerte après les 3 types', (await seen.count()) > 0);
  if (await seen.count()) {
    await seen.click({ force: true }); await page.waitForTimeout(400);
    check('m3: étape complétée — A et B n’ont pas bougé',
      (await page.getByText(/n’ont jamais bougé/).count()) > 0);
  }
  await page.screenshot({ path: `${SHOT_DIR}x2-m3-kindmorph.png` });
  await ctx.close();
}

/* ── 4. Module 4 — alignement au clavier + échappatoire ──────────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2', '3']);
  await page.goto(`${LESSON}/les-points-sur-la-droite`); await settle(page);

  const handle = page.locator('svg [role="slider"]').first();
  check('m4: le point M est focusable au clavier', (await handle.count()) > 0);
  await handle.focus();
  for (let i = 0; i < 6; i += 1) { await page.keyboard.press('ArrowUp'); await page.waitForTimeout(90); }
  check('m4: la jauge chiffre l’écart', (await page.getByText(/distance de M à la droite/).count()) > 0);

  // Échappatoire : 3 demandes d'indice, puis révélation.
  for (let i = 0; i < 3; i += 1) {
    const hint = page.getByRole('button', { name: /Un indice/ }).first();
    if (await hint.count()) { await hint.click({ force: true }); await page.waitForTimeout(200); }
  }
  const esc = page.getByRole('button', { name: /montre-moi/ });
  check('m4: échappatoire après 3 indices', (await esc.count()) > 0);
  if (await esc.count()) {
    await esc.click({ force: true }); await page.waitForTimeout(500);
    check('m4: échappatoire complète l’étape', (await page.getByText(/Pas grave, on te le montre/).count()) > 0);
  }
  await ctx.close();
}

/* ── 5. Module 6 — atelier : validation sémantique + erreur diagnostiquée */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2', '3', '4', '5']);
  await page.goto(`${LESSON}/l-atelier-de-trace`); await settle(page);

  // Cibler les groupes ARIA : les pastilles de points portent un nom
  // accessible d'une seule lettre, trop ambigu pour getByRole(name).
  const pts = page.locator('[aria-label="Choisir les points"] button');
  const kinds = page.locator('[aria-label="Choisir le type d’objet"] button');
  const tracer = page.getByRole('button', { name: 'Tracer', exact: true });

  // Volontairement FAUX : bons points (A, B), mauvais type (droite).
  await pts.nth(0).click({ force: true });
  await pts.nth(1).click({ force: true });
  await kinds.nth(2).click({ force: true });
  await tracer.click({ force: true });
  await page.waitForTimeout(600);
  check('m6: l’erreur de TYPE est diagnostiquée nommément',
    (await page.getByText(/mais on demandait/).count()) > 0);

  // Puis correct : A, B, segment.
  const reset = page.getByRole('button', { name: /Effacer et recommencer/ }).first();
  if (await reset.count()) { await reset.click({ force: true }); await page.waitForTimeout(300); }
  await pts.nth(0).click({ force: true });
  await pts.nth(1).click({ force: true });
  await kinds.nth(0).click({ force: true });
  await tracer.click({ force: true });
  await page.waitForTimeout(600);
  check('m6: construction correcte validée', (await page.getByText(/On demandait/).count()) > 0);
  await page.screenshot({ path: `${SHOT_DIR}x2-m6-atelier.png` });
  await ctx.close();
}

/* ── 6. Boss complet ─────────────────────────────────────────────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2', '3', '4', '5', '6', '7']);
  await page.goto(`${LESSON}/mission-finale-le-skatepark`); await settle(page);

  check('boss: 10 épreuves', (await page.getByText(/Épreuve 10/).first().count()) > 0);
  check('boss: silencieux avant submit', (await page.getByText(/Bonne réponse :/).count()) === 0);

  const ANSWERS = [
    /^Une droite$/, /^Un segment$/, /Une demi-droite d’origine A/,
    /Leur étendue/, /Rien : le bord de la feuille/, /1 seule : son origine/,
    /Non : sa distance à la droite/, /Non : le milieu doit aussi/,
    /La demi-droite d’origine A passant par B/, /Non : elles ont des origines différentes/,
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
    check('boss: synthèse rejoue les trois objets',
      (await page.getByText(/Les trois objets, une seule idée/).count()) > 0);
    await page.screenshot({ path: `${SHOT_DIR}x2-boss-synthese.png`, fullPage: true });

    await page.reload(); await settle(page);
    check('boss: rechargement → correction sauvegardée',
      (await page.getByText(/Résultat du défi/).count()) > 0);
  }
  await ctx.close();
}

/* ── 7. Mobile ───────────────────────────────────────────────────────── */
{
  const ctx = await newCtx(browser, { mobile: true });
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2', '3', '4', '5']);
  for (const slug of ['', '/jusqu-ou-ca-va', '/les-points-sur-la-droite', '/l-atelier-de-trace']) {
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
  await page.screenshot({ path: `${SHOT_DIR}x2-mobile.png` });
  await ctx.close();
}

check(`aucune erreur console/page (${errors.length})`, errors.length === 0, errors.slice(0, 5).join(' | '));

await browser.close();
process.exit(summary());
