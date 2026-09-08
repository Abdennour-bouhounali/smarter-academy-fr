/**
 * Suite e2e — « Puissances » (5e).
 *
 * Ce que cette suite vérifie, et que les contrôles de source ne peuvent pas
 * voir (ils lisent des fichiers, jamais l'application) :
 *
 *   1. chaque module REND (une leçon non branchée dans App.jsx retombe sur la
 *      page d'accueil sans la moindre erreur — cf. scripts/check-routes.mjs) ;
 *   2. la manipulation signature RÉAGIT : avancer d'une case double le nombre
 *      de grains ET allonge le produit écrit, ce qui est tout le propos du
 *      module 1 ; elle reste REJOUABLE après validation de l'étape
 *      (frozen-manipulation bug class) ;
 *   3. le laboratoire du carré et du cube ne MENT pas : le nombre de cases
 *      affiché est bien le carré du côté choisi, et le volume son cube ;
 *   4. aucune étiquette SVG ne sort de son cadre ni n'en chevauche une autre ;
 *   5. pas de défilement horizontal à 375 px ;
 *   6. le test final se monte (le contrat `badges[].test` est une fonction —
 *      un `{skill}` y provoquait « b.test is not a function »).
 *
 * Lancer : démarrer vite depuis apps/web/ en détaché, puis
 *   KIT_BASE=http://localhost:5302 node apps/web/e2e/lesson-kit/5e-puissances.mjs
 */
import {
  launch, open, settle, body, check, summary, errs,
  layoutAudit, aspectAudit, noHScroll,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5302';
const L = '/courses/college/5e/nombres_calculs/puissances-5e';
// Clé PORTÉE PAR UTILISATEUR (`u_<id|anon>_<clé>`) : semer la clé nue ne
// déverrouille rien, et la suite échouerait sur une manipulation absente.
const KEY = 'u_anon_smarter_lesson_puissances-5e';
// `completedModules` porte des chaînes NON rembourrées.
const ALL_DONE = ['0', '1', '2', '3', '4', '5', '6'];

const browser = await launch();

/* ── 1. La page d'accueil de la leçon ─────────────────────────────────── */
{
  const { ctx, page } = await open(browser, BASE + L, { tag: 'index' });
  const t = await body(page);
  check('index : la leçon rend son propre titre', /Puissances/.test(t), t.slice(0, 200));
  check('index : ce n’est pas la page d’accueil commerciale', !/Apprendre les maths autrement/.test(t));
  check('index : les modules sont annoncés', /Mission finale/.test(t) && /échiquier/i.test(t));
  await ctx.close();
}

/* ── 2. Module 1 — la manipulation signature ──────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/l-echiquier-du-roi`, { key: KEY, tag: 'm1' });

  const grains = () => page.getAttribute('output[data-grains]', 'data-grains');
  const produit = () => page.getAttribute('code[data-produit]', 'data-produit');

  check('M1 : l’échiquier rend son compte de grains', await page.locator('output[data-grains]').count() > 0);
  check('M1 : la première case porte 1 grain', (await grains()) === '1', `grains=${await grains()}`);

  // Avancer double les grains ET allonge le produit écrit : LE phénomène.
  const avant = await produit();
  await page.locator('[data-role="case-suivante"]').first().click(); await settle(page, 300);
  check('M1 : avancer d’une case double les grains', (await grains()) === '2', `grains=${await grains()}`);

  for (let i = 0; i < 3; i += 1) {
    await page.locator('[data-role="case-suivante"]').first().click(); await settle(page, 200);
  }
  check('M1 : quatre cases plus loin, on a 16 grains', (await grains()) === '16', `grains=${await grains()}`);
  const apres = await produit();
  check('M1 : … et le produit écrit s’est ALLONGÉ', apres.length > avant.length, `${avant} → ${apres}`);

  // On avance jusqu'au débordement, qui valide l'étape 1.
  for (let i = 0; i < 6; i += 1) {
    await page.locator('[data-role="case-suivante"]').first().click(); await settle(page, 150);
  }
  await settle(page, 400);
  check('M1 : l’étape 1 se valide sur le débordement', /ne tient plus/.test(await body(page)));

  // REJOUABILITÉ : le laboratoire répond encore après validation de l'étape.
  const avantRejeu = await grains();
  await page.locator('[data-role="case-suivante"]').first().click(); await settle(page, 300);
  check('M1 : la manipulation reste rejouable après validation',
    (await grains()) !== avantRejeu, `${avantRejeu} → ${await grains()}`);

  const bad = [...(await layoutAudit(page)), ...(await aspectAudit(page))];
  check('M1 : aucune collision ni débordement SVG', bad.length === 0, bad.join(' | '));
  await ctx.close();
}

/* ── 3. Module 3 — le laboratoire ne ment pas ─────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/le-carre-et-le-cube`,
    { key: KEY, completedModules: ['0', '1', '2'], tag: 'm3' });

  for (const cote of [3, 5]) {
    await page.locator(`button[data-cote="${cote}"]`).first().click(); await settle(page, 300);
    const aire = await page.getAttribute('output[data-aire]', 'data-aire');
    const volume = await page.getAttribute('output[data-volume]', 'data-volume');
    check(`M3 : côté ${cote} → aire ${cote * cote}`, Number(aire) === cote * cote, `aire=${aire}`);
    check(`M3 : côté ${cote} → volume ${cote ** 3}`, Number(volume) === cote ** 3, `volume=${volume}`);
  }
  await ctx.close();
}

/* ── 4. Module 4 — un carré parfait remplit, les autres non ───────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/les-carres-parfaits`,
    { key: KEY, completedModules: ['0', '1', '2', '3'], tag: 'm4' });

  await page.locator('button[data-candidat="36"]').first().click(); await settle(page, 300);
  check('M4 : 36 forme un carré plein',
    (await page.getAttribute('[data-parfait]', 'data-parfait')) === '1');

  await page.locator('button[data-candidat="50"]').first().click(); await settle(page, 300);
  check('M4 : 50 ne forme PAS un carré plein',
    (await page.getAttribute('[data-parfait]', 'data-parfait')) === '0');
  await ctx.close();
}

/* ── 5. Module 5 — autant de zéros que de facteurs ────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/les-puissances-de-dix`,
    { key: KEY, completedModules: ['0', '1', '2', '3', '4'], tag: 'm5' });

  for (const e of [3, 6]) {
    await page.locator(`button[data-exposant="${e}"]`).first().click(); await settle(page, 300);
    const valeur = await page.getAttribute('output[data-valeur]', 'data-valeur');
    const zeros = (valeur.match(/0/g) || []).length;
    check(`M5 : 10 exposant ${e} porte ${e} zéros`, zeros === e, `valeur=${valeur}`);
  }
  await ctx.close();
}

/* ── 6. Le test final se monte ────────────────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/mission-finale-le-grain-de-riz`,
    { key: KEY, completedModules: ALL_DONE, tag: 'boss' });
  const t = await body(page);
  check('Boss : le test final se monte', /Mission finale|grain de riz/i.test(t));
  check('Boss : les épreuves sont rendues', /bactérie|piscine|photo|stade|kilomètre/i.test(t));
  await ctx.close();
}

/* ── 7. Mobile 375 px, sur toute la leçon ─────────────────────────────── */
{
  const SLUGS = ['l-echiquier-du-roi', 'ce-que-compte-l-etage', 'le-carre-et-le-cube',
    'les-carres-parfaits', 'les-puissances-de-dix', 'calculer-avec-une-puissance',
    'mission-finale-le-grain-de-riz'];
  for (const slug of SLUGS) {
    const { ctx, page } = await open(browser, `${BASE}${L}/${slug}`,
      { key: KEY, completedModules: ALL_DONE, mobile: true, tag: `m-${slug}` });
    check(`${slug} @375 : aucun défilement horizontal`, await noHScroll(page));
    await ctx.close();
  }
}

await browser.close();
summary('5e — Puissances');
