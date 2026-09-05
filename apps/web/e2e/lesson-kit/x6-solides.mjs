// Solides et patrons (6e) — suite e2e.
import { BASE, check, summary, launch, newCtx, watchErrors, lessonKey, noHorizontalScroll, SHOT_DIR } from './helpers.mjs';

const LESSON = `${BASE}/courses/college/6e/espace_geometrie/solides-patrons`;
const KEY = lessonKey('solides-patrons');
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
  check('index: titre', (await page.getByText('Solides et patrons').first().count()) > 0);
  await page.goto(`${LESSON}/mission-finale-l-emballage`); await settle(page);
  check('boss: ouvert sans progression', (await page.getByText(/Épreuve 1/).first().count()) > 0);
  await page.goto(`${LESSON}/mission-de-depart`); await settle(page);
  check('diagnostic: silencieux', (await page.getByText(/Bonne réponse/).count()) === 0);
  await ctx.close();
}

/* Module 3 — l'interaction signature : dessiner un patron valide. */
{
  const ctx = await newCtx(browser); const page = await ctx.newPage(); watchErrors(page, errors);
  await seed(page, ['0', '1', '2']);
  await page.goto(`${LESSON}/deplier-le-cube`); await settle(page);

  const cells = page.locator('[aria-label="Grille : coche les cases de ton patron"] button');
  check('m3: la grille est faite de vrais boutons', (await cells.count()) > 0);
  check('m3: aucun succès prématuré (grille vide)',
    (await page.getByText(/se replie bien en cube/).count()) === 0);

  // Dessiner le patron en croix sur une grille 3×5 : ligne 1 cols 1-4, plus (0,1) et (2,1).
  const cols = 5;
  const idx = (r, c) => r * cols + c;
  for (const [r, c] of [[1,0],[1,1],[1,2],[1,3],[0,1],[2,1]]) {
    await cells.nth(idx(r, c)).click({ force: true });
    await page.waitForTimeout(70);
  }
  await page.waitForTimeout(400);
  check('m3: le patron en croix est reconnu valide',
    (await page.getByText(/se replie en cube|se replie bien en cube/).count()) > 0);
  await page.screenshot({ path: `${SHOT_DIR}x6-m3-patron.png` });
  await ctx.close();
}

/* Module 4 — prédire, et voir le verdict du simulateur. */
{
  const ctx = await newCtx(browser); const page = await ctx.newPage(); watchErrors(page, errors);
  await seed(page, ['0', '1', '2', '3']);
  await page.goto(`${LESSON}/plier-dans-sa-tete`); await settle(page);
  check('m4: la première prédiction est proposée',
    (await page.getByText(/obtiendra-t-on un cube/).first().count()) > 0);
  // Réponse volontairement fausse : doit progresser quand même.
  const non = page.getByRole('button', { name: /Non, il est impossible/ }).first();
  if (await non.count()) {
    await non.click({ force: true }); await page.waitForTimeout(500);
    check('m4: mauvaise prédiction → correction visible', (await page.getByText(/Bonne réponse :/).count()) > 0);
  }
  await ctx.close();
}

/* Boss */
{
  const ctx = await newCtx(browser); const page = await ctx.newPage(); watchErrors(page, errors);
  await seed(page, ['0', '1', '2', '3', '4', '5', '6']);
  await page.goto(`${LESSON}/mission-finale-l-emballage`); await settle(page);
  check('boss: 10 épreuves', (await page.getByText(/Épreuve 10/).first().count()) > 0);
  check('boss: silencieux avant submit', (await page.getByText(/Bonne réponse :/).count()) === 0);

  const ANSWERS = [
    /^Un pavé droit$/, /^6 faces$/, /^12 arêtes$/, /^8 sommets$/,
    /Les arêtes cachées/, /^Oui$/, /^Onze$/,
    /Non : en pliant, deux cases/, /Deux cases occuperaient la même face/, /^12 morceaux$/,
  ];
  for (const rx of ANSWERS) {
    const b = page.getByRole('button', { name: rx }).first();
    if (await b.count()) { await b.click({ force: true }); await page.waitForTimeout(110); }
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
    check('boss: synthèse', (await page.getByText(/Du volume au plan/).count()) > 0);
    await page.screenshot({ path: `${SHOT_DIR}x6-boss.png`, fullPage: true });
  }
  await ctx.close();
}

/* Mobile */
{
  const ctx = await newCtx(browser, { mobile: true }); const page = await ctx.newPage(); watchErrors(page, errors);
  await seed(page, ['0', '1', '2', '3', '4', '5']);
  for (const slug of ['', '/faces-aretes-sommets', '/deplier-le-cube']) {
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
