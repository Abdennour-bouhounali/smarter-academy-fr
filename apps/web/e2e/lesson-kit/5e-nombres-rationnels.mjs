/**
 * Suite e2e — « Nombres rationnels » (5e).
 *
 * Ce que cette suite vérifie, et que les contrôles de source ne peuvent pas
 * voir (ils lisent des fichiers, jamais l'application) :
 *
 *   1. chaque module REND (une leçon non branchée dans App.jsx retombe sur la
 *      page d'accueil sans la moindre erreur — cf. scripts/check-routes.mjs) ;
 *   2. l'INVARIANT SIGNATURE de la leçon : changer le découpage réécrit la
 *      fraction (3/4 → 6/8) SANS déplacer le curseur d'un pixel. C'est tout le
 *      propos du module 1, et c'est vérifié en mesurant la position réelle ;
 *   3. le laboratoire reste REJOUABLE après validation de l'étape
 *      (frozen-manipulation bug class) ;
 *   4. aucune étiquette SVG ne sort de son cadre ni n'en chevauche une autre ;
 *   5. pas de défilement horizontal à 375 px ;
 *   6. le test final se monte (le contrat `badges[].test` est une fonction).
 *
 * Lancer : démarrer vite depuis apps/web/ en détaché, puis
 *   KIT_BASE=http://localhost:5302 node apps/web/e2e/lesson-kit/5e-nombres-rationnels.mjs
 */
import {
  launch, open, settle, body, check, summary, errs,
  layoutAudit, aspectAudit, noHScroll,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5302';
const L = '/courses/college/5e/nombres_calculs/nombres-rationnels-5e';
// Clé PORTÉE PAR UTILISATEUR (`u_<id|anon>_<clé>`) : semer la clé nue ne
// déverrouille rien, et la suite échouerait sur une manipulation absente.
const KEY = 'u_anon_smarter_lesson_nombres-rationnels-5e';
// `completedModules` porte des chaînes NON rembourrées.
const ALL_DONE = ['0', '1', '2', '3', '4', '5', '6'];

/** Position du curseur d'un laboratoire, en % de la droite — pas en pixels. */
const cursorPct = (page, idx) => page.evaluate((i) => {
  const svg = [...document.querySelectorAll('svg[role="slider"]')][i];
  const c = [...svg.querySelectorAll('circle')].pop();
  const r = c.getBoundingClientRect();
  const b = svg.getBoundingClientRect();
  return Math.round(((r.x - b.x) / b.width) * 10000) / 100;
}, idx);

/** Lecture « num/den » du laboratoire d'indice idx. */
const reading = (page, idx) => page.evaluate((i) => {
  const o = [...document.querySelectorAll('output[data-num]')][i];
  return `${o.dataset.num}/${o.dataset.den}`;
}, idx);

const browser = await launch();

/* ── 1. La page d'accueil de la leçon ─────────────────────────────────── */
{
  const { ctx, page } = await open(browser, BASE + L, { tag: 'index' });
  const t = await body(page);
  check('index : la leçon rend son propre titre', /Nombres rationnels/.test(t), t.slice(0, 200));
  check('index : ce n’est pas la page d’accueil commerciale', !/Apprendre les maths autrement/.test(t));
  check('index : les modules sont annoncés', /Mission finale/.test(t) && /graduation/i.test(t));
  await ctx.close();
}

/* ── 2. Module 1 — la manipulation signature ──────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/la-graduation-manquante`, { key: KEY, tag: 'm1' });

  check('M1 : la règle graduée est rendue', await page.locator('svg[role="slider"]').count() > 0);

  // Couper en quarts, puis atteindre 3/4 au clavier.
  await page.locator('button[data-den="4"]').first().click(); await settle(page, 250);
  await page.locator('svg[role="slider"]').first().focus();
  for (let i = 0; i < 3; i += 1) { await page.keyboard.press('ArrowRight'); await settle(page, 120); }
  await settle(page, 500);

  check('M1 : le curseur lit bien 3/4', (await reading(page, 0)) === '3/4', await reading(page, 0));
  const t1 = await body(page);
  check('M1 : l’étape 1 se valide sur le phénomène', /a une place, et une seule/.test(t1));

  // L'INVARIANT : re-couper en huitièmes réécrit la fraction sans bouger le point.
  const avantLecture = await reading(page, 1);
  const avantPos = await cursorPct(page, 1);
  await page.locator('button[data-den="8"]').nth(1).click(); await settle(page, 500);
  const apresLecture = await reading(page, 1);
  const apresPos = await cursorPct(page, 1);

  check('M1 : couper en 8 RÉÉCRIT la fraction', avantLecture !== apresLecture,
    `${avantLecture} → ${apresLecture}`);
  check('M1 : … et 3/4 devient bien 6/8', apresLecture === '6/8', apresLecture);
  check('M1 : … sans que le curseur bouge (l’invariant de la leçon)',
    Math.abs(avantPos - apresPos) < 0.5, `${avantPos}% → ${apresPos}%`);
  check('M1 : l’étape 2 se valide sur cet invariant',
    /n’a pas bougé d’un pixel/.test(await body(page)));

  const bad = [...(await layoutAudit(page)), ...(await aspectAudit(page))];
  check('M1 : aucune collision ni débordement SVG', bad.length === 0, bad.join(' | '));
  await ctx.close();
}

/* ── 3. Module 1 — rejouabilité après validation ──────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/la-graduation-manquante`, { key: KEY, tag: 'm1-replay' });
  await page.locator('button[data-den="4"]').first().click(); await settle(page, 250);
  await page.locator('svg[role="slider"]').first().focus();
  for (let i = 0; i < 3; i += 1) { await page.keyboard.press('ArrowRight'); await settle(page, 120); }
  await settle(page, 500);
  const valide = await reading(page, 0);
  // L'étape est validée : la manipulation doit RESTER vivante.
  await page.keyboard.press('ArrowLeft'); await settle(page, 350);
  check('M1 : la manipulation reste rejouable après validation',
    (await reading(page, 0)) !== valide, `${valide} → ${await reading(page, 0)}`);
  await ctx.close();
}

/* ── 4. Module 3 — simplifier refuse un regroupement impossible ───────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/remonter-la-machine`,
    { key: KEY, completedModules: ['0', '1', '2'], tag: 'm3' });

  // 12/18 ne se regroupe pas par 5 : le laboratoire doit le DIRE, pas l'ignorer.
  await page.click('button[data-regroupe="5"]'); await settle(page, 400);
  check('M3 : un regroupement impossible est nommé, pas ignoré',
    /Impossible de regrouper/.test(await body(page)));

  // Puis par 6 : 12/18 devient 2/3, et il n'y a plus rien à regrouper.
  await page.click('button[data-regroupe="6"]'); await settle(page, 400);
  check('M3 : regrouper par 6 mène à la forme la plus simple',
    /plus rien à regrouper/.test(await body(page)));
  await ctx.close();
}

/* ── 5. Le test final se monte ────────────────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/mission-finale-le-bon-nombre`,
    { key: KEY, completedModules: ALL_DONE, tag: 'boss' });
  const t = await body(page);
  check('Boss : le test final se monte', /Mission finale|bon nombre/i.test(t));
  check('Boss : les épreuves sont rendues', /piste|mur|livre|terrain|gâteaux/i.test(t));
  await ctx.close();
}

/* ── 6. Mobile 375 px, sur toute la leçon ─────────────────────────────── */
{
  const SLUGS = ['la-graduation-manquante', 'deux-ecritures-un-nombre', 'remonter-la-machine',
    'qui-est-le-plus-grand', 'ajouter-des-parts', 'la-recette-pour-six',
    'mission-finale-le-bon-nombre'];
  for (const slug of SLUGS) {
    const { ctx, page } = await open(browser, `${BASE}${L}/${slug}`,
      { key: KEY, completedModules: ALL_DONE, mobile: true, tag: `m-${slug}` });
    check(`${slug} @375 : aucun défilement horizontal`, await noHScroll(page));
    await ctx.close();
  }
}

await browser.close();
summary('5e — Nombres rationnels');
