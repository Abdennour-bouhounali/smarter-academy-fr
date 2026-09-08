/**
 * Suite e2e — « Calcul littéral et algébrique » (5e).
 *
 * Ce que cette suite vérifie, et que les contrôles de source ne peuvent pas
 * voir (ils lisent des fichiers, jamais l'application) :
 *
 *   1. chaque module REND (une leçon non branchée dans App.jsx retombe sur la
 *      page d'accueil sans la moindre erreur — cf. scripts/check-routes.mjs) ;
 *   2. la manipulation signature RÉAGIT : avancer d'une étape ajoute toujours
 *      le MÊME nombre de carreaux, ce qui est la régularité dont naît la
 *      formule ; le laboratoire reste REJOUABLE après validation de l'étape
 *      (frozen-manipulation bug class) ;
 *   3. le laboratoire de substitution ne MENT pas : la recette affichée ne
 *      change jamais, seul le résultat change — c'est tout le propos du
 *      module 2 ;
 *   4. le rectangle du module 5 vérifie l'égalité qu'il illustre : l'aire d'un
 *      bloc égale la somme des deux morceaux, pour chaque valeur ;
 *   5. pas de défilement horizontal à 375 px ;
 *   6. le test final se monte (le contrat `badges[].test` est une fonction).
 *
 * Lancer : démarrer vite depuis apps/web/ en détaché, puis
 *   KIT_BASE=http://localhost:5302 node apps/web/e2e/lesson-kit/5e-calcul-litteral.mjs
 */
import {
  launch, open, settle, body, check, summary, errs,
  layoutAudit, aspectAudit, noHScroll,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5302';
const L = '/courses/college/5e/nombres_calculs/calcul-litteral-5e';
// Clé PORTÉE PAR UTILISATEUR (`u_<id|anon>_<clé>`) : semer la clé nue ne
// déverrouille rien, et la suite échouerait sur une manipulation absente.
const KEY = 'u_anon_smarter_lesson_calcul-litteral-5e';
// `completedModules` porte des chaînes NON rembourrées.
const ALL_DONE = ['0', '1', '2', '3', '4', '5', '6'];

const browser = await launch();

/* ── 1. La page d'accueil de la leçon ─────────────────────────────────── */
{
  const { ctx, page } = await open(browser, BASE + L, { tag: 'index' });
  const t = await body(page);
  check('index : la leçon rend son propre titre', /Calcul littéral/.test(t), t.slice(0, 200));
  check('index : ce n’est pas la page d’accueil commerciale', !/Apprendre les maths autrement/.test(t));
  check('index : les modules sont annoncés', /Mission finale/.test(t) && /motif/i.test(t));
  await ctx.close();
}

/* ── 2. Module 1 — la manipulation signature ──────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/le-motif-qui-grandit`, { key: KEY, tag: 'm1' });

  const total = () => page.getAttribute('output[data-total]', 'data-total');
  check('M1 : le motif rend son compte de carreaux', await page.locator('output[data-total]').count() > 0);
  check('M1 : l’étape 1 compte 3 carreaux', (await total()) === '3', `total=${await total()}`);

  // L'ajout doit être CONSTANT : c'est la régularité dont naîtra la formule.
  const comptes = [Number(await total())];
  for (let i = 0; i < 3; i += 1) {
    await page.locator('[data-role="etape-suivante"]').first().click(); await settle(page, 250);
    comptes.push(Number(await total()));
  }
  const ecarts = comptes.slice(1).map((v, i) => v - comptes[i]);
  check('M1 : chaque étape ajoute toujours le même nombre de carreaux',
    new Set(ecarts).size === 1 && ecarts[0] === 2, `comptes=${comptes} écarts=${ecarts}`);
  check('M1 : l’étape 4 compte 9 carreaux', comptes[3] === 9, `total=${comptes[3]}`);
  check('M1 : l’étape 1 se valide sur la régularité', /augmente toujours de la même quantité/.test(await body(page)));

  // REJOUABILITÉ : le laboratoire répond encore après validation de l'étape.
  await page.locator('[data-role="etape-suivante"]').first().click(); await settle(page, 300);
  check('M1 : la manipulation reste rejouable après validation',
    (await total()) === '11', `total=${await total()}`);

  const bad = [...(await layoutAudit(page)), ...(await aspectAudit(page))];
  check('M1 : aucune collision ni débordement SVG', bad.length === 0, bad.join(' | '));
  await ctx.close();
}

/* ── 3. Module 2 — la recette ne change jamais ────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/la-lettre-est-un-emplacement`,
    { key: KEY, completedModules: ['0', '1'], tag: 'm2' });

  const resultat = () => page.getAttribute('output[data-resultat]', 'data-resultat');
  const recette = () => page.locator('text=/2n \\+ 1/').first().count();

  const vus = [];
  for (const v of [2, 4, 10]) {
    await page.locator(`button[data-valeur="${v}"]`).first().click(); await settle(page, 300);
    vus.push(Number(await resultat()));
    check(`M2 : la recette 2n + 1 est toujours affichée (n = ${v})`, (await recette()) > 0);
  }
  check('M2 : … mais le résultat change à chaque valeur',
    JSON.stringify(vus) === JSON.stringify([5, 9, 21]), `résultats=${vus}`);
  await ctx.close();
}

/* ── 4. Module 5 — le rectangle vérifie son égalité ───────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/le-rectangle-qu-on-coupe`,
    { key: KEY, completedModules: ['0', '1', '2', '3', '4'], tag: 'm5' });

  for (const v of [2, 4]) {
    await page.locator(`button[data-valeur="${v}"]`).first().click(); await settle(page, 300);
    const aire = Number(await page.getAttribute('output[data-aire]', 'data-aire'));
    // Le rectangle est 3 × (n + 2) : son aire doit valoir 3n + 6.
    check(`M5 : avec n = ${v}, l’aire vaut bien 3n + 6 = ${3 * v + 6}`,
      aire === 3 * v + 6, `aire=${aire}`);
  }
  await ctx.close();
}

/* ── 5. Module 6 — la bordure compte ce que la formule annonce ────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/la-formule-du-carrelage`,
    { key: KEY, completedModules: ['0', '1', '2', '3', '4', '5'], tag: 'm6' });

  for (const v of [2, 4]) {
    await page.locator(`button[data-cote="${v}"]`).first().click(); await settle(page, 300);
    const bordure = Number(await page.getAttribute('output[data-bordure]', 'data-bordure'));
    check(`M6 : côté ${v} → bordure de ${4 * v + 4} carreaux (4n + 4)`,
      bordure === 4 * v + 4, `bordure=${bordure}`);
  }
  await ctx.close();
}

/* ── 6. Le test final se monte ────────────────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/mission-finale-la-bonne-recette`,
    { key: KEY, completedModules: ALL_DONE, tag: 'boss' });
  const t = await body(page);
  check('Boss : le test final se monte', /Mission finale|bonne recette/i.test(t));
  check('Boss : les épreuves sont rendues', /taxi|cantine|timbres|gradin|champ/i.test(t));
  await ctx.close();
}

/* ── 7. Mobile 375 px, sur toute la leçon ─────────────────────────────── */
{
  const SLUGS = ['le-motif-qui-grandit', 'la-lettre-est-un-emplacement', 'ecrire-la-recette',
    'remplacer-par-un-nombre', 'le-rectangle-qu-on-coupe', 'la-formule-du-carrelage',
    'mission-finale-la-bonne-recette'];
  for (const slug of SLUGS) {
    const { ctx, page } = await open(browser, `${BASE}${L}/${slug}`,
      { key: KEY, completedModules: ALL_DONE, mobile: true, tag: `m-${slug}` });
    check(`${slug} @375 : aucun défilement horizontal`, await noHScroll(page));
    await ctx.close();
  }
}

await browser.close();
summary('5e — Calcul littéral');
