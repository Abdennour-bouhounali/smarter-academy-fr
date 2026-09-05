// Figures planes (6e) — suite e2e.
// Run: node apps/web/e2e/lesson-kit/x4-figures.mjs   (vite sur :5183, lancé depuis apps/web/)
import { BASE, check, summary, launch, newCtx, watchErrors, lessonKey, noHorizontalScroll, SHOT_DIR } from './helpers.mjs';

const LESSON = `${BASE}/courses/college/6e/espace_geometrie/figures-planes`;
const KEY = lessonKey('figures-planes');
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
  check('index: titre', (await page.getByText('Figures planes').first().count()) > 0);
  check('index: modules listés', (await page.getByText(/Le faux carré/).count()) > 0
    && (await page.getByText(/L’enquête géométrique/).count()) > 0);

  await page.goto(`${LESSON}/mission-finale-le-vitrail`); await settle(page);
  check('boss: ouvert sans progression', (await page.getByText(/Épreuve 1/).first().count()) > 0);

  await page.goto(`${LESSON}/mission-de-depart`); await settle(page);
  check('diagnostic: rendu et silencieux',
    (await page.getByText(/Mission de départ/).first().count()) > 0 &&
    (await page.getByText(/Bonne réponse/).count()) === 0);
  await ctx.close();
}

/* ── 2. Module 1 — le faux carré : mesurer bat regarder ──────────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0']);
  await page.goto(`${LESSON}/le-faux-carre`); await settle(page);

  // Prédiction volontairement FAUSSE → doit progresser quand même.
  const wrong = page.getByRole('button', { name: /^La figure B$/ });
  if (await wrong.count()) {
    await wrong.first().click({ force: true }); await page.waitForTimeout(500);
    check('m1: mauvaise prédiction → correction visible', (await page.getByText(/Bonne réponse :/).count()) > 0);
    check('m1: mauvaise prédiction → étape 2 ouverte', (await page.getByText(/Affiche les mesures/).count()) > 0);
  }

  const reveal = page.getByRole('button', { name: /Afficher les longueurs/ });
  check('m1: bouton de révélation présent', (await reveal.count()) > 0);
  if (await reveal.count()) {
    await reveal.click({ force: true }); await page.waitForTimeout(700);
    check('m1: la figure B est démasquée comme non-carré',
      (await page.getByText(/quadrilatère quelconque|n’est qu’un/).count()) > 0);
    await page.screenshot({ path: `${SHOT_DIR}x4-m1-fauxcarre.png` });
    const seen = page.getByRole('button', { name: /J’ai vu la différence/ });
    if (await seen.count()) { await seen.click({ force: true }); await page.waitForTimeout(400); }
  }
  await ctx.close();
}

/* ── 3. Module 3 — signature ShapeLab : déformer change le nom ───────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2']);
  await page.goto(`${LESSON}/le-laboratoire-des-quadrilateres`); await settle(page);

  const handles = page.locator('svg [role="slider"]');
  const shapeName = () => page.locator('.font-space.font-extrabold.text-lg').first().innerText();
  check('m3: les sommets sont focusables au clavier', (await handles.count()) >= 4);
  check('m3: la figure de départ est un carré', (await shapeName()).trim() === 'carré');

  // RÉGRESSION : aucun succès ne doit s'afficher avant que l'élève ait
  // réellement construit un rectangle (bug constaté : la figure traversait
  // l'état « rectangle » dès le premier pixel et validait la mission).
  check('m3: aucun succès prématuré au chargement',
    (await page.getByText(/Le nom a changé tout seul/).count()) === 0);

  await handles.nth(0).focus();
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(250);
  check('m3: un seul pas ne valide PAS la mission (garde-fou minGap)',
    (await page.getByText(/Le nom a changé tout seul/).count()) === 0);

  // RÉGRESSION : le verrou d'axe empêche de casser les angles droits.
  const before = await shapeName();
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(250);
  check('m3: le verrou d’axe neutralise les flèches verticales', (await shapeName()) === before);

  // Allonger franchement : un SEUL sommet suffit, son partenaire suit.
  for (let i = 0; i < 9; i += 1) { await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(60); }
  await page.waitForTimeout(400);
  check('m3: tirer un seul sommet produit un vrai rectangle',
    (await shapeName()).trim() === 'rectangle');
  check('m3: les 4 angles droits ont survécu à la déformation',
    (await page.getByText('4 angles droits').first().count()) > 0);
  check('m3: la mission se valide une fois le rectangle franc',
    (await page.getByText(/Le nom a changé tout seul/).count()) > 0);

  // ── Mission 2 : la cassure des angles doit être VISIBLE ─────────────
  await page.waitForTimeout(400);
  check('m3/m2: la jauge de cassure des angles est affichée',
    (await page.getByText(/Écart au plus grand angle/).count()) > 0);
  check('m3/m2: les 4 angles droits sont annoncés au départ',
    (await page.getByText(/Les 4 angles valent encore 90°/).count()) > 0);
  check('m3/m2: aucun succès prématuré',
    (await page.getByText(/plus aucun n’est droit/).count()) === 0);

  const all = page.locator('svg [role="slider"]');
  const nH = await all.count();
  await all.nth(nH - 2).focus();
  for (let i = 0; i < 2; i += 1) { await page.keyboard.press('ArrowUp'); await page.waitForTimeout(60); }
  await page.waitForTimeout(350);
  // RÉGRESSION : 8 px suffisaient à valider alors que rien n'était visible.
  check('m3/m2: une déformation discrète ne valide PAS la mission',
    (await page.getByText(/plus aucun n’est droit/).count()) === 0);
  check('m3/m2: la jauge dit combien de degrés il reste',
    (await page.getByText(/Encore \d+° : continue/).count()) > 0);

  for (let i = 0; i < 10; i += 1) { await page.keyboard.press('ArrowUp'); await page.waitForTimeout(55); }
  for (let i = 0; i < 6; i += 1) { await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(55); }
  await page.waitForTimeout(600);
  check('m3/m2: une déformation franche valide la mission',
    (await page.getByText(/plus aucun n’est droit|perdu .{0,20}toutes/).count()) > 0);
  await page.screenshot({ path: `${SHOT_DIR}x4-m3-mission2.png`, fullPage: true });
  await page.screenshot({ path: `${SHOT_DIR}x4-m3-shapelab.png` });
  await ctx.close();
}

/* ── 4. Module 4 — triangles : deux caractères cumulables ────────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2', '3']);
  await page.goto(`${LESSON}/la-famille-des-triangles`); await settle(page);
  check('m4: la mission isocèle est proposée', (await page.getByText(/ISOCÈLE/).count()) > 0);

  // RÉGRESSION : le triangle était annoncé « isocèle » avec 143 et 141
  // affichés. Deux côtés déclarés égaux DOIVENT porter le même nombre.
  const figSvg = page.locator('svg:has([role="slider"])').first();
  const lens = async () => figSvg.evaluate((svg) =>
    Array.from(svg.querySelectorAll('text'))
      .map((t) => (t.textContent || '').trim())
      .filter((t) => /^\d+$/.test(t))
      .map(Number));
  const L0 = await lens();
  check('m4: au départ les 3 longueurs sont distinctes',
    L0.length === 3 && new Set(L0).size === 3, JSON.stringify(L0));

  // RÉGRESSION : la consigne doit NOMMER les côtés à égaliser, et la base
  // [AB] rester verrouillée — sinon l'élève ne sait pas quelle paire viser.
  check('m4: la consigne nomme [AC] et [BC]',
    (await page.getByText(/\[AC\] et \[BC\]/).count()) > 0);
  const th = page.locator('svg [role="slider"]');
  check('m4: seul le sommet C est déplaçable', (await th.count()) === 1);
  let snapped = false;
  for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']) {
    for (let i = 0; i < 18 && !snapped; i += 1) {
      await th.first().focus();
      await page.keyboard.press(key);
      await page.waitForTimeout(55);
      const L = await lens();
      if (L.length && L.length !== new Set(L).size) snapped = true;
    }
    if (snapped) break;
  }
  const L1 = await lens();
  check('m4: l’aimantation rend DEUX longueurs affichées identiques',
    L1.length !== new Set(L1).size, JSON.stringify(L1));
  check('m4: la mission isocèle se valide alors',
    (await page.getByText(/le triangle est .{0,12}isocèle/i).count()) > 0);
  check('m4: le retour nomme bien [AC] = [BC]',
    (await page.getByText(/\[AC\] = \[BC\]/).count()) > 0);
  await page.screenshot({ path: `${SHOT_DIR}x4-m4-isocele.png` });
  const hint = page.getByRole('button', { name: /Un indice/ }).first();
  if (await hint.count()) {
    for (let i = 0; i < 3; i += 1) { await hint.click({ force: true }); await page.waitForTimeout(200); }
  }
  const esc = page.getByRole('button', { name: /montre-moi/ });
  check('m4: échappatoire après 3 indices', (await esc.count()) > 0);
  if (await esc.count()) {
    await esc.click({ force: true }); await page.waitForTimeout(500);
    check('m4: échappatoire complète l’étape', (await page.getByText(/Pas grave, on te le montre/).count()) > 0);
  }
  await ctx.close();
}

/* ── 5. Module 6 — l'enquête : indices révélés un par un ─────────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2', '3', '4', '5']);
  await page.goto(`${LESSON}/l-enquete-geometrique`); await settle(page);

  check('m6: un seul indice affiché au départ', (await page.getByText(/Indices \(1 \/ 3\)/).count()) > 0);
  check('m6: on ne peut pas conclure trop tôt',
    (await page.getByText(/Continue à découvrir les indices/).count()) > 0);
  const next = page.getByRole('button', { name: /Indice suivant/ }).first();
  for (let i = 0; i < 2 && (await next.count()); i += 1) {
    await next.click({ force: true }); await page.waitForTimeout(300);
  }
  check('m6: tous les indices révélés → la question apparaît',
    (await page.getByText(/De quelle figure s’agit-il/).count()) > 0);
  await page.screenshot({ path: `${SHOT_DIR}x4-m6-enquete.png` });
  await ctx.close();
}

/* ── 6. Module 7 — construire : chaque contrainte est contrôlée ──────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2', '3', '4', '5', '6']);
  await page.goto(`${LESSON}/construire-sous-contraintes`); await settle(page);
  check('m7: les contraintes sont listées séparément',
    (await page.getByText(/4 angles droits/).first().count()) > 0);
  check('m7: la contrainte de dimensions est explicite',
    (await page.getByText(/Largeur et hauteur nettement différentes/).count()) > 0);

  // RÉGRESSION : la figure pouvait être déclarée « rectangle » avec des côtés
  // opposés de 140 et 146. L'outil largeur/hauteur rend cela impossible.
  check('m7: les réglages largeur/hauteur sont présents',
    (await page.getByRole('slider').count()) >= 2);
  const mesures = async () => page.evaluate(() => {
    for (const svg of document.querySelectorAll('svg')) {
      const nums = Array.from(svg.querySelectorAll('text'))
        .map((t) => (t.textContent || '').trim())
        .filter((t) => /^\d+$/.test(t)).map(Number);
      if (nums.length >= 4) return nums;
    }
    return [];
  });
  const M0 = await mesures();
  check('m7: les côtés opposés sont TOUJOURS égaux (vrai rectangle)',
    M0.length === 4 && M0[0] === M0[2] && M0[1] === M0[3], JSON.stringify(M0));
  check('m7: le départ est un carré — rien n’est validé d’avance',
    M0[0] === M0[1] && (await page.getByText(/Toutes les contraintes sont vérifiées/).count()) === 0);

  const sl = page.getByRole('slider');
  await sl.first().focus();
  for (let i = 0; i < 12; i += 1) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(35); }
  await page.waitForTimeout(350);
  check('m7: un écart discret ne valide PAS le rectangle',
    (await page.getByText(/Toutes les contraintes sont vérifiées/).count()) === 0);

  for (let i = 0; i < 26; i += 1) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(30); }
  await page.waitForTimeout(450);
  const M1 = await mesures();
  check('m7: un allongement franc donne un vrai rectangle non carré',
    M1[0] === M1[2] && M1[1] === M1[3] && Math.abs(M1[0] - M1[1]) >= 25, JSON.stringify(M1));
  check('m7: le chantier se valide alors',
    (await page.getByText(/Toutes les contraintes sont vérifiées/).count()) > 0);
  await page.screenshot({ path: `${SHOT_DIR}x4-m7-rectangle.png` });
  await ctx.close();
}

/* ── 7. Boss complet ─────────────────────────────────────────────────── */
{
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await seedModules(page, ['0', '1', '2', '3', '4', '5', '6', '7']);
  await page.goto(`${LESSON}/mission-finale-le-vitrail`); await settle(page);

  check('boss: 10 épreuves', (await page.getByText(/Épreuve 10/).first().count()) > 0);
  check('boss: silencieux avant submit', (await page.getByText(/Bonne réponse :/).count()) === 0);

  const ANSWERS = [
    /Non : un carré a ses quatre côtés exactement égaux/,
    /^5 sommets$/,
    /Celui de 110°/,
    /4 côtés égaux ET 4 angles droits/,
    /Oui : il a 4 angles droits/,
    /Isocèle rectangle/,
    /Un quadrilatère dont les 4 côtés sont égaux/,
    /^Quatre angles droits$/,
    /^Un losange$/,
    /Un rectangle qui ne soit pas un carré/,
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
    check('boss: synthèse rejoue les fiches de propriétés',
      (await page.getByText(/Une figure, une liste de propriétés/).count()) > 0);
    await page.screenshot({ path: `${SHOT_DIR}x4-boss-synthese.png`, fullPage: true });
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
  for (const slug of ['', '/le-faux-carre', '/le-laboratoire-des-quadrilateres', '/l-enquete-geometrique']) {
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
  await page.screenshot({ path: `${SHOT_DIR}x4-mobile.png` });
  await ctx.close();
}

check(`aucune erreur console/page (${errors.length})`, errors.length === 0, errors.slice(0, 5).join(' | '));

await browser.close();
process.exit(summary());
