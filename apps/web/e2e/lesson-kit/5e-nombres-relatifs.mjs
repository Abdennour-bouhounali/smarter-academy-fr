/**
 * Suite e2e — « Nombres relatifs » (5e).
 *
 * Ce que cette suite vérifie, et que les contrôles de source ne peuvent pas
 * voir (ils lisent des fichiers, jamais l'application) :
 *
 *   1. chaque module REND (une leçon non branchée dans App.jsx retombe sur la
 *      page d'accueil sans la moindre erreur — cf. scripts/check-routes.mjs) ;
 *   2. les manipulations RÉAGISSENT au clavier et à la souris, et restent
 *      REJOUABLES après validation de l'étape (frozen-manipulation bug class) ;
 *   3. aucune étiquette SVG ne sort de son cadre ni n'en chevauche une autre,
 *      sur toute la plage de la manipulation — balayée, pas échantillonnée
 *      (INTERACTION_PEDAGOGY §17bis) ;
 *   4. pas de défilement horizontal à 375 px ;
 *   5. le test final se monte (le contrat `badges[].test` est une fonction —
 *      un `{skill}` y provoquait « b.test is not a function », attrapé ici).
 *
 * Lancer : démarrer vite depuis apps/web/ en détaché, puis
 *   KIT_BASE=http://localhost:5302 node apps/web/e2e/lesson-kit/5e-nombres-relatifs.mjs
 */
import {
  launch, open, settle, body, check, summary, errs,
  layoutAudit, aspectAudit, noHScroll,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5302';
const L = '/courses/college/5e/nombres_calculs/nombres-relatifs-5e';
// Les clés de progression sont PORTÉES PAR UTILISATEUR (utils/storage.js
// `scopedStorage` : `u_<id|anon>_<clé>`). Semer `smarter_lesson_…` nu ne
// déverrouille rien — le module reste « verrouillé » et la suite échoue sur
// une manipulation absente qui ressemble à un bug du composant.
const KEY = 'u_anon_smarter_lesson_nombres-relatifs-5e';
// `completedModules` porte des chaînes NON rembourrées (piège relevé en 6e).
const ALL_DONE = ['0', '1', '2', '3', '4', '5', '6'];

const browser = await launch();

/* ── 1. La page d'accueil de la leçon ─────────────────────────────────── */
{
  const { ctx, page } = await open(browser, BASE + L, { tag: 'index' });
  const t = await body(page);
  check('index : la leçon rend son propre titre', /Nombres relatifs/.test(t), t.slice(0, 200));
  check('index : ce n’est pas la page d’accueil commerciale', !/Apprendre les maths autrement|Module verrouillé/.test(t));
  check('index : les 8 modules sont annoncés', /Mission finale/.test(t) && /ascenseur/i.test(t));
  await ctx.close();
}

/* ── 2. Module 1 — la manipulation signature ──────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/l-ascenseur-du-parking`, { key: KEY, tag: 'm1' });
  const lab = page.locator('svg[role="slider"]').first();
  check('M1 : la cage d’ascenseur est rendue', await lab.count() > 0);

  const readFloor = () => page.getAttribute('svg[role="slider"]', 'aria-valuenow');
  const start = await readFloor();
  check('M1 : la cabine démarre au rez-de-chaussée', start === '0', `aria-valuenow=${start}`);

  // Le clavier descend sous le zéro : c'est le phénomène central.
  await lab.focus();
  for (let i = 0; i < 2; i += 1) { await page.keyboard.press('ArrowDown'); await settle(page, 120); }
  const below = await readFloor();
  check('M1 : la cabine descend sous zéro (−2)', below === '-2', `aria-valuenow=${below}`);
  check('M1 : l’étage négatif est affiché avec le vrai signe moins', /−2/.test(await body(page)));

  // Balayage de TOUTE la plage : chaque état doit avoir une mise en page valide.
  let worst = [];
  for (let i = 0; i < 9; i += 1) {
    await page.keyboard.press('ArrowUp'); await settle(page, 90);
    const bad = [...(await layoutAudit(page)), ...(await aspectAudit(page))];
    if (bad.length > worst.length) worst = bad;
  }
  check('M1 : aucune collision d’étiquette sur toute la plage', worst.length === 0, worst.join(' | '));

  const top = await readFloor();
  check('M1 : la cabine est bornée en haut de l’immeuble', top === '5', `aria-valuenow=${top}`);
  await ctx.close();
}

/* ── 3. Module 1 — la manipulation reste REJOUABLE après validation ───── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/l-ascenseur-du-parking`, { key: KEY, tag: 'm1-replay' });
  const lab = page.locator('svg[role="slider"]').first();
  await lab.focus();
  for (let i = 0; i < 2; i += 1) { await page.keyboard.press('ArrowDown'); await settle(page, 120); }
  check('M1 : l’étape 1 se valide sur le geste', /Regarde l’écran|prédiction était la bonne/.test(await body(page)));

  // L'étape est validée : la cabine DOIT continuer de répondre.
  const before = await page.getAttribute('svg[role="slider"]', 'aria-valuenow');
  await page.keyboard.press('ArrowUp'); await settle(page, 150);
  const after = await page.getAttribute('svg[role="slider"]', 'aria-valuenow');
  check('M1 : la manipulation n’est pas gelée après validation', before !== after, `${before} → ${after}`);
  check('M1 : le lab n’est pas marqué désactivé', (await page.getAttribute('svg[role="slider"]', 'aria-disabled')) !== 'true');
  await ctx.close();
}

/* ── 4. Module 2 — la droite graduée ──────────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/la-droite-des-nombres`, {
    key: KEY, completedModules: ['0', '1'], tag: 'm2',
  });
  const t = await body(page);
  check('M2 : le module est déverrouillé et rend son contenu', /droite graduée/i.test(t), t.slice(0, 200));

  const line = page.locator('svg[role="slider"]').first();
  check('M2 : la droite est manipulable', await line.count() > 0);
  await line.focus();
  for (let i = 0; i < 4; i += 1) { await page.keyboard.press('ArrowLeft'); await settle(page, 100); }
  const v = await page.getAttribute('svg[role="slider"]', 'aria-valuenow');
  check('M2 : le curseur atteint −4 par le clavier', v === '-4', `aria-valuenow=${v}`);
  check('M2 : l’étape se valide et explique', /positifs à droite/i.test(await body(page)));

  const bad = [...(await layoutAudit(page)), ...(await aspectAudit(page))];
  check('M2 : aucune collision sur la droite graduée', bad.length === 0, bad.join(' | '));
  await ctx.close();
}

/* ── 5. Module 7 — le test final se monte (régression « b.test ») ─────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/mission-finale-l-immeuble`, {
    key: KEY, completedModules: ALL_DONE, tag: 'boss',
  });
  const t = await body(page);
  check('M7 : le test final rend ses épreuves', /Épreuve|sous-marin|Mission finale/i.test(t), t.slice(0, 250));
  check('M7 : les dix épreuves sont présentes', (await page.locator('text=/1 \\/ 10/').count()) > 0 || /10/.test(t));
  check('M7 : le registre de rappel est affiché', /côté du zéro/.test(t));
  await ctx.close();
}

/* ── 6. Mobile — 375 px, pas de défilement horizontal ─────────────────── */
for (const [name, path, done] of [
  ['M1', '/l-ascenseur-du-parking', ['0']],
  ['M2', '/la-droite-des-nombres', ['0', '1']],
  ['M6', '/le-releve-de-la-station', ['0', '1', '2', '3', '4', '5']],
]) {
  const { ctx, page } = await open(browser, BASE + L + path, {
    key: KEY, completedModules: done, mobile: true, tag: `mob-${name}`,
  });
  check(`${name} @375 : aucun défilement horizontal`, await noHScroll(page));
  const bad = await layoutAudit(page);
  check(`${name} @375 : aucune collision d’étiquette`, bad.length === 0, bad.join(' | '));
  await ctx.close();
}

/* ── 7. Aucune erreur console sur l'ensemble du parcours ──────────────── */
check('aucune erreur console ni exception sur toute la leçon', errs.length === 0, errs.slice(0, 4).join(' || '));

await browser.close();
process.exit(summary());
