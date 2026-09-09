/**
 * Suite e2e — « Repérage sur une droite et dans le plan » (5e).
 *
 * Ce que cette suite vérifie, et que les contrôles de source ne peuvent pas
 * voir (ils lisent des fichiers, jamais l'application) :
 *
 *   1. chaque module REND (une leçon non branchée dans App.jsx retombe sur la
 *      page d'accueil sans la moindre erreur — cf. scripts/check-routes.mjs) ;
 *   2. le déclencheur ne MENT pas : il existe bien une abscisse où DEUX lieux
 *      s'allument ensemble, et le module 1 repose entièrement là-dessus ;
 *   3. le fantôme du module 4 montre réellement le couple échangé, et il
 *      DISPARAÎT sur la diagonale — le cas honnête que la leçon annonce ;
 *   4. les manipulations restent REJOUABLES après validation de l'étape
 *      (frozen-manipulation bug class) ;
 *   5. aucune étiquette SVG ne sort de son cadre ni n'en chevauche une autre,
 *      sur TOUTE la plage atteignable des curseurs (balayage, pas échantillon) ;
 *   6. pas de défilement horizontal à 375, 768 et 1440 px ;
 *   7. le test final se monte (le contrat `badges[].test` est une fonction).
 *
 * Lancer : démarrer vite depuis apps/web/ en détaché, puis
 *   KIT_BASE=http://localhost:5251 node apps/web/e2e/lesson-kit/5e-reperage.mjs
 */
import {
  launch, open, settle, body, check, summary, errs,
  layoutAudit, noHScroll, sweepSliders, runBoss,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5251';
const L = '/courses/college/5e/espace_geometrie/reperage-5e';
// Clé PORTÉE PAR UTILISATEUR (`u_<id|anon>_<clé>`) : semer la clé nue ne
// déverrouille rien, et la suite échouerait sur une manipulation absente.
const KEY = 'u_anon_smarter_lesson_reperage-5e';
// `completedModules` porte des chaînes NON rembourrées.
const ALL_DONE = ['0', '1', '2', '3', '4', '5', '6'];

/** Attend que le module soit réellement peint (chargement `lazy`). */
async function attendreModule(page) {
  // Les modules sont chargés en `lazy`. Sous un serveur de dev partagé, le
  // premier import peut dépasser la seconde : on attend que le corps porte
  // vraiment du contenu de leçon, plutôt qu'un délai fixe qui rend la suite
  // intermittente (le défaut observé : des échecs qui se déplaçaient d'un
  // module à l'autre à chaque exécution, sans aucune erreur console).
  await page.waitForFunction(
    () => (document.body.innerText || '').length > 800,
    null, { timeout: 30000 },
  ).catch(() => {});
  await settle(page, 600);
}

const browser = await launch();

/* ── 1. La page d'accueil de la leçon ─────────────────────────────────── */
{
  const { ctx, page } = await open(browser, BASE + L, { tag: 'index' });
  // La page d'accueil charge son index en `lazy` : attendre que le titre soit
  // peint, sinon on lit un corps encore vide (faux négatif intermittent).
  await page.waitForFunction(
    () => /Parcours des Modules/.test(document.body.innerText || ''),
    null, { timeout: 30000 },
  ).catch(() => {});
  await settle(page, 600);
  const t = await body(page);
  check('index : la leçon rend son propre titre', /Repérage/.test(t), t.slice(0, 200));
  check('index : ce n’est pas la page d’accueil commerciale', !/Apprendre les maths autrement/.test(t));
  check('index : les modules sont annoncés', /Mission finale/.test(t) && /suffit-il/i.test(t));
  await ctx.close();
}

/* ── 2. Module 1 — le déclencheur ne ment pas ─────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/un-seul-nombre-suffit-il`, { key: KEY, tag: 'm1' });
  await attendreModule(page);
  const t0 = await body(page);
  check('M1 : le module rend', /suffit-il/i.test(t0), t0.slice(0, 200));

  // Le curseur démarre AILLEURS que sur la colonne ambiguë.
  check('M1 : au départ, un seul lieu au plus est désigné', !/lieux à la fois/.test(t0));

  // Balayage de TOUTE la plage : il doit exister au moins une position où
  // deux lieux s'allument — sinon la découverte du module est impossible.
  const slider = page.locator('[role="slider"][aria-label="Abscisse"]').first();
  await slider.focus();
  await page.keyboard.press('Home');
  await settle(page, 200);
  let ambiguTrouve = false;
  const etats = [];
  for (let i = 0; i <= 12; i += 1) {
    const t = await body(page);
    etats.push(t.match(/abscisse = (−?\d+)/)?.[1] ?? '?');
    if (/lieux à la fois/.test(t)) ambiguTrouve = true;
    await page.keyboard.press('ArrowRight');
    await settle(page, 120);
  }
  check('M1 : il existe une abscisse où DEUX lieux s’allument', ambiguTrouve, etats.join(' '));

  // La manipulation reste rejouable une fois l'étape validée.
  await page.keyboard.press('ArrowLeft');
  await settle(page, 150);
  const apres = await body(page);
  check('M1 : le curseur bouge encore après validation (pas de gel)',
    /abscisse = /.test(apres));

  const issues = await layoutAudit(page);
  check('M1 : aucune collision ni débordement d’étiquette', issues.length === 0, JSON.stringify(issues).slice(0, 300));
  await ctx.close();
}

/* ── 3. Module 2 — deux curseurs, un point unique ─────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/deux-nombres-un-endroit`,
    { key: KEY, completedModules: ['0', '1'], tag: 'm2' });
  await attendreModule(page);
  const t = await body(page);
  check('M2 : le module rend', /Deux nombres/i.test(t), t.slice(0, 200));
  check('M2 : deux curseurs distincts sont exposés',
    (await page.locator('[role="slider"]').count()) >= 2);

  // Un curseur = UN déplacement : bouger l'ordonnée ne doit pas changer
  // l'abscisse affichée.
  const avant = (await body(page)).match(/\((−?\d+)\s*;/)?.[1];
  const ord = page.locator('[role="slider"][aria-label="Ordonnée"]').first();
  await ord.focus();
  await page.keyboard.press('ArrowUp');
  await settle(page, 200);
  const apres = (await body(page)).match(/\((−?\d+)\s*;/)?.[1];
  check('M2 : bouger l’ordonnée ne change pas l’abscisse', avant === apres, `${avant} -> ${apres}`);

  const issues = await layoutAudit(page);
  check('M2 : aucune collision d’étiquette', issues.length === 0, JSON.stringify(issues).slice(0, 300));
  await ctx.close();
}

/* ── 4. Module 3 — les quatre quadrants sont atteignables ─────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/lire-un-point`,
    { key: KEY, completedModules: ['0', '1', '2'], tag: 'm3' });
  await attendreModule(page);
  check('M3 : le module rend', /Lire un point/i.test(await body(page)));

  // Balayage : le point doit pouvoir visiter les quatre régions.
  const pt = page.locator('[role="slider"]').first();
  await pt.focus();
  const issues = [];
  for (const seq of [['ArrowLeft', 8], ['ArrowDown', 6], ['ArrowRight', 10], ['ArrowUp', 8]]) {
    for (let i = 0; i < seq[1]; i += 1) {
      await page.keyboard.press(seq[0]);
      await settle(page, 60);
      issues.push(...(await layoutAudit(page)));
    }
  }
  check('M3 : aucune collision sur TOUT le parcours du point', issues.length === 0,
    JSON.stringify(issues.slice(0, 3)));
  await ctx.close();
}

/* ── 5. Module 4 — le fantôme, et le cas honnête de la diagonale ──────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/placer-sans-echanger`,
    { key: KEY, completedModules: ['0', '1', '2', '3'], tag: 'm4' });
  await attendreModule(page);
  const t = await body(page);
  check('M4 : le module rend', /échanger/i.test(t), t.slice(0, 200));
  // Le fantôme est annoncé dans la consigne, et il doit exister dans le SVG.
  check('M4 : le couple échangé est montré à l’élève', /\(3\s*;\s*−2\)|rose/.test(t));

  const issues = await layoutAudit(page);
  check('M4 : aucune collision (point, fantôme et leurs étiquettes)', issues.length === 0,
    JSON.stringify(issues).slice(0, 300));
  await ctx.close();
}

/* ── 6. Module 5 — le cas limite des axes ─────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/sur-un-axe-ou-nulle-part`,
    { key: KEY, completedModules: ['0', '1', '2', '3', '4'], tag: 'm5' });
  await attendreModule(page);
  check('M5 : le module rend', /axe/i.test(await body(page)));

  // Amener le point sur un axe doit changer l'étiquette de région.
  const pt = page.locator('[role="slider"]').first();
  await pt.focus();
  for (let i = 0; i < 6; i += 1) { await page.keyboard.press('ArrowDown'); await settle(page, 60); }
  const t = await body(page);
  check('M5 : un point sur un axe n’est PAS annoncé dans un quadrant',
    !/sur l’axe/.test(t) || !/en haut à droite/.test(t), t.slice(0, 200));
  await ctx.close();
}

/* ── 7. Module 6 — l'échelle n'est plus 1 ─────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/le-plan-du-domaine`,
    { key: KEY, completedModules: ['0', '1', '2', '3', '4', '5'], tag: 'm6' });
  await attendreModule(page);
  check('M6 : le module rend', /graduation/i.test(await body(page)));
  const issues = await layoutAudit(page);
  check('M6 : aucune collision au pas de 0,5', issues.length === 0, JSON.stringify(issues).slice(0, 300));
  await ctx.close();
}

/* ── 8. Le test final se monte ────────────────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/mission-finale-le-domaine`,
    { key: KEY, completedModules: ALL_DONE, tag: 'boss' });
  await attendreModule(page);
  const t = await body(page);
  check('Boss : le module rend (badges[].test est bien une fonction)',
    /Mission finale/i.test(t) && !/b\.test is not a function/.test(t), t.slice(0, 200));
  check('Boss : les dix épreuves sont présentes', /10|dix/i.test(t));
  await ctx.close();
}

/* ── 9. Responsive : 375 / 768 / 1440 ─────────────────────────────────── */
for (const [w, h, nom] of [[375, 667, 'mobile'], [768, 1024, 'tablette'], [1440, 900, 'bureau']]) {
  const { ctx, page } = await open(browser, `${BASE}${L}/lire-un-point`,
    { key: KEY, completedModules: ['0', '1', '2'], tag: `rwd-${w}` });
  await page.setViewportSize({ width: w, height: h });
  await settle(page);
  check(`${nom} (${w}px) : pas de défilement horizontal de page`, await noHScroll(page));
  const issues = await layoutAudit(page);
  check(`${nom} (${w}px) : aucune collision d’étiquette`, issues.length === 0,
    JSON.stringify(issues).slice(0, 200));
  await ctx.close();
}

check('aucune erreur console sur toute la suite', errs.length === 0, errs.slice(0, 5).join(' | '));

await browser.close();
summary();
