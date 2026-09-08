/**
 * Suite e2e — « Opérations » (5e).
 *
 * Ce que cette suite vérifie, et que les contrôles de source ne peuvent pas
 * voir (ils lisent des fichiers, jamais l'application) :
 *
 *   1. chaque module REND (une leçon non branchée dans App.jsx retombe sur la
 *      page d'accueil sans la moindre erreur — cf. scripts/check-routes.mjs) ;
 *   2. la manipulation signature RÉAGIT : poser une parenthèse réécrit le
 *      total à l'instant, et le laboratoire reste REJOUABLE après validation
 *      de l'étape (frozen-manipulation bug class) ;
 *   3. le laboratoire de division CONSERVE le quotient quand on multiplie les
 *      deux termes — l'invariant même que le module 6 fait découvrir ;
 *   4. aucune étiquette SVG ne sort de son cadre ni n'en chevauche une autre ;
 *   5. pas de défilement horizontal à 375 px ;
 *   6. le test final se monte (le contrat `badges[].test` est une fonction —
 *      un `{skill}` y provoquait « b.test is not a function »).
 *
 * Lancer : démarrer vite depuis apps/web/ en détaché, puis
 *   KIT_BASE=http://localhost:5302 node apps/web/e2e/lesson-kit/5e-operations.mjs
 */
import {
  launch, open, settle, body, check, summary, errs,
  layoutAudit, aspectAudit, noHScroll,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5302';
const L = '/courses/college/5e/nombres_calculs/operations-5e';
// Les clés de progression sont PORTÉES PAR UTILISATEUR (utils/storage.js
// `scopedStorage` : `u_<id|anon>_<clé>`). Semer `smarter_lesson_…` nu ne
// déverrouille rien — le module reste « verrouillé » et la suite échoue sur
// une manipulation absente qui ressemble à un bug du composant.
const KEY = 'u_anon_smarter_lesson_operations-5e';
// `completedModules` porte des chaînes NON rembourrées (piège relevé en 6e).
const ALL_DONE = ['0', '1', '2', '3', '4', '5', '6', '7'];

const browser = await launch();

/* ── 1. La page d'accueil de la leçon ─────────────────────────────────── */
{
  const { ctx, page } = await open(browser, BASE + L, { tag: 'index' });
  const t = await body(page);
  check('index : la leçon rend son propre titre', /Opérations/.test(t), t.slice(0, 200));
  check('index : ce n’est pas la page d’accueil commerciale', !/Apprendre les maths autrement/.test(t));
  check('index : les modules sont annoncés', /Mission finale/.test(t) && /caisses/i.test(t));
  await ctx.close();
}

/* ── 2. Module 1 — la manipulation signature ──────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/les-deux-caisses`, { key: KEY, tag: 'm1' });

  const total = () => page.getAttribute('output[data-total]', 'data-total');
  check('M1 : le ticket rend son total', await page.locator('output[data-total]').count() > 0);
  check('M1 : sans parenthèse, les priorités donnent 14', (await total()) === '14', `total=${await total()}`);

  // Poser (2 + 3) doit faire basculer le total à 20 : c'est LE phénomène.
  await page.click('button[data-term="0"]'); await settle(page, 200);
  await page.click('button[data-term="1"]'); await settle(page, 400);
  check('M1 : poser (2 + 3) réécrit le total à 20', (await total()) === '20', `total=${await total()}`);

  const t = await body(page);
  check('M1 : l’étape 1 se valide sur le phénomène', /Ta prédiction était la bonne|Tu viens de le voir/.test(t));
  check('M1 : l’étape 2 s’ouvre alors', /autre caisse/i.test(t));

  // REJOUABILITÉ : le laboratoire répond encore après validation de l'étape.
  await page.click('button[data-term="0"]'); await settle(page, 350);
  check('M1 : la manipulation reste rejouable après validation',
    (await total()) !== '20', `total=${await total()}`);

  // Cibles tactiles : 44 px minimum sur les termes du ticket.
  const petits = await page.evaluate(() => [...document.querySelectorAll('button[data-term]')]
    .filter((b) => { const r = b.getBoundingClientRect(); return r.width < 44 || r.height < 44; }).length);
  check('M1 : toutes les cibles tactiles font au moins 44 px', petits === 0, `${petits} trop petites`);

  const bad = [...(await layoutAudit(page)), ...(await aspectAudit(page))];
  check('M1 : aucune collision ni débordement SVG', bad.length === 0, bad.join(' | '));
  await ctx.close();
}

/* ── 3. Module 6 — l'invariant du quotient ────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/diviser-par-un-decimal`,
    { key: KEY, completedModules: ['0', '1', '2', '3', '4', '5'], tag: 'm6' });

  const avant = await page.innerText('output[data-role="quotient"]');
  const dividendeAvant = await page.innerText('[data-role="dividende"]');

  await page.click('[data-role="fois-dix"]'); await settle(page, 400);
  const apres = await page.innerText('output[data-role="quotient"]');
  const dividendeApres = await page.innerText('[data-role="dividende"]');

  check('M6 : × 10 change bien le dividende', dividendeAvant !== dividendeApres,
    `${dividendeAvant} → ${dividendeApres}`);
  check('M6 : … mais le quotient ne bouge PAS (l’invariant de la leçon)',
    avant === apres, `${avant} → ${apres}`);
  check('M6 : le diviseur devient entier', /entier/.test(await body(page)));

  // Rejouable dans les deux sens : rien ne se fige.
  await page.click('[data-role="fois-dix"]'); await settle(page, 350);
  check('M6 : le laboratoire répond encore après validation',
    (await page.innerText('[data-role="dividende"]')) !== dividendeApres);
  await ctx.close();
}

/* ── 4. Module 3 — les rectangles de 24 ───────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/multiples-et-diviseurs`,
    { key: KEY, completedModules: ['0', '1', '2'], tag: 'm3' });

  await page.click('button[data-largeur="6"]'); await settle(page, 300);
  check('M3 : une largeur qui divise 24 remplit le rectangle',
    (await page.getAttribute('[data-complet]', 'data-complet')) === '1');

  await page.click('button[data-largeur="5"]'); await settle(page, 300);
  check('M3 : une largeur qui ne divise pas 24 laisse un reste',
    (await page.getAttribute('[data-complet]', 'data-complet')) === '0');
  await ctx.close();
}

/* ── 5. Le test final se monte ────────────────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/mission-finale-le-calcul-juste`,
    { key: KEY, completedModules: ALL_DONE, tag: 'boss' });
  const t = await body(page);
  check('Boss : le test final se monte', /Mission finale|calcul juste/i.test(t));
  check('Boss : les épreuves sont rendues', /recette|carburant|ruban|facture|salades|jardinier/i.test(t));
  await ctx.close();
}

/* ── 6. Mobile 375 px, sur toute la leçon ─────────────────────────────── */
{
  const SLUGS = ['les-deux-caisses', 'l-ordre-cache', 'multiples-et-diviseurs',
    'enchainer-les-operations', 'le-calcul-malin', 'diviser-par-un-decimal',
    'la-note-du-traiteur', 'mission-finale-le-calcul-juste'];
  for (const slug of SLUGS) {
    const { ctx, page } = await open(browser, `${BASE}${L}/${slug}`,
      { key: KEY, completedModules: ALL_DONE, mobile: true, tag: `m-${slug}` });
    check(`${slug} @375 : aucun défilement horizontal`, await noHScroll(page));
    await ctx.close();
  }
}

await browser.close();
summary('5e — Opérations');
