/**
 * Suite e2e — « Opérations sur les nombres relatifs » (4e).
 *
 * Vérifie ce que les contrôles de source ne peuvent pas voir : que chaque
 * module REND, que les manipulations réagissent et restent REJOUABLES, qu'il
 * n'y a ni collision d'étiquette ni défilement horizontal à 375 px, et que le
 * test final se monte (contrat `badges[].test`).
 *
 * Lancer : vite détaché depuis apps/web/, puis
 *   KIT_BASE=http://localhost:5302 node apps/web/e2e/lesson-kit/4e-nombres-relatifs.mjs
 */
import {
  launch, open, settle, body, check, summary, errs, layoutAudit, noHScroll,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5302';
const L = '/courses/college/4e/nombres_calculs/nombres-relatifs-4e';
// Clé PORTÉE PAR UTILISATEUR (utils/storage.js `scopedStorage`).
const KEY = 'u_anon_smarter_lesson_nombres-relatifs-4e';
const ALL = ['0', '1', '2', '3', '4', '5'];

const browser = await launch();

/* ── 1. Accueil de la leçon ───────────────────────────────────────────── */
{
  const { ctx, page } = await open(browser, BASE + L, { tag: 'index' });
  const t = await body(page);
  check('index : la leçon rend son titre', /Opérations sur les nombres relatifs/.test(t), t.slice(0, 200));
  check('index : ce n’est pas une page verrouillée ni l’accueil', !/Module verrouillé/.test(t));
  check('index : les modules sont annoncés', /Prolonger la table/.test(t) && /Mission finale/.test(t));
  await ctx.close();
}

/* ── 2. Module 1 — prolonger la table (manipulation signature) ────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/prolonger-la-table`, { key: KEY, tag: 'm1' });
  const t = await body(page);
  check('M1 : la colonne de −3 est affichée', /−3 × 3/.test(t), t.slice(0, 250));
  check('M1 : la colonne « Écart » est présente', /Écart/.test(t));

  // Un mauvais choix ne doit ni bloquer ni faire disparaître la manipulation.
  const boutons = page.locator('[role="group"][aria-label="Choisir la valeur suivante"] button');
  const n0 = await boutons.count();
  check('M1 : des choix sont proposés', n0 >= 2, `${n0} boutons`);

  // Le bon choix pour −3 × 2 est −6 ; on clique le mauvais d'abord.
  await boutons.first().click(); await settle(page, 400);
  check('M1 : après un choix, la manipulation est toujours là (non bloquante)',
    (await page.locator('[role="group"][aria-label="Choisir la valeur suivante"] button').count()) >= 2
    || /Écart/.test(await body(page)));
  check('M1 : aucune collision d’étiquette', (await layoutAudit(page)).length === 0);
  await ctx.close();
}

/* ── 3. Module 3 — la manipulation des signes ─────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/plusieurs-facteurs`, {
    key: KEY, completedModules: ['0', '1', '2'], tag: 'm3',
  });
  const t = await body(page);
  check('M3 : le module est déverrouillé', !/Module verrouillé/.test(t), t.slice(0, 200));

  const facteurs = page.locator('[role="group"][aria-label="Facteurs du produit"] button');
  const nf = await facteurs.count();
  check('M3 : les quatre facteurs sont cliquables', nf === 4, `${nf} facteurs`);

  const lire = async () => (await body(page)).match(/Produit\s*(−?\d+)/)?.[1] ?? null;
  const avant = await lire();
  await facteurs.nth(1).click(); await settle(page, 350);
  const apres = await lire();
  check('M3 : changer un signe fait basculer le produit', avant !== apres, `${avant} → ${apres}`);

  // La manipulation doit rester vivante même après validation de l'étape.
  await facteurs.nth(0).click(); await settle(page, 300);
  await facteurs.nth(2).click(); await settle(page, 350);
  const encore = await page.locator('[role="group"][aria-label="Facteurs du produit"] button').first().isEnabled();
  check('M3 : la manipulation n’est pas gelée après validation', encore);
  await ctx.close();
}

/* ── 4. Module 6 — le test final se monte ─────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/mission-finale-la-table`, {
    key: KEY, completedModules: ALL, tag: 'boss',
  });
  const t = await body(page);
  check('M6 : le test final rend ses épreuves', /Épreuve|Mission finale|Deux négatifs/i.test(t), t.slice(0, 250));
  check('M6 : le registre de rappel est affiché', /pair → \+, impair → −/.test(t) || /produit positif/.test(t));
  await ctx.close();
}

/* ── 5. Mobile 375 px ─────────────────────────────────────────────────── */
for (const [name, path, done] of [
  ['M1', '/prolonger-la-table', ['0']],
  ['M3', '/plusieurs-facteurs', ['0', '1', '2']],
  ['M5', '/enchainer-les-operations', ['0', '1', '2', '3', '4']],
]) {
  const { ctx, page } = await open(browser, BASE + L + path, {
    key: KEY, completedModules: done, mobile: true, tag: `mob-${name}`,
  });
  check(`${name} @375 : aucun défilement horizontal`, await noHScroll(page));
  check(`${name} @375 : aucune collision d’étiquette`, (await layoutAudit(page)).length === 0);
  await ctx.close();
}

check('aucune erreur console ni exception sur toute la leçon', errs.length === 0, errs.slice(0, 4).join(' || '));

await browser.close();
process.exit(summary());
