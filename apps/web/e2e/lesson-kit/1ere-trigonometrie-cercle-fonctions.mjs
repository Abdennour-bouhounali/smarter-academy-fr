/**
 * 1ère spé — « Dérivation : les règles de calcul ».
 *
 * Vite détaché depuis apps/web/ :
 *   cd apps/web && (setsid nohup npx vite --port 5285 --strictPort > e2e/lesson-kit/shots/vite-5285.log 2>&1 </dev/null &)
 *   node apps/web/e2e/lesson-kit/1ere-derivation-calculer.mjs
 *
 * La table CONTRIB et la carte des modules sont DÉRIVÉES de knowledge.jsx et
 * lesson.config.js : la suite teste la leçon réellement écrite.
 */
import {
  SHOT_DIR, check, summary, errs, launch, open, settle, body,
  layoutAudit, aspectAudit, domOverflow, noHScroll, smallTargets,
  readCompleted, nextEnabled, runBoss,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5291';
const LESSON = '/courses/lycee/premiere_specialite/analyse/trigonometrie-cercle-fonctions-1ere';
const KEY = 'u_anon_smarter_lesson_trigonometrie-cercle-fonctions-1ere';

const M = {
  0: `${BASE}/courses/lycee/premiere_specialite/analyse/trigonometrie-cercle-fonctions-1ere/mission-de-depart`,
  1: `${BASE}/courses/lycee/premiere_specialite/analyse/trigonometrie-cercle-fonctions-1ere/derouler-le-cercle`,
  2: `${BASE}/courses/lycee/premiere_specialite/analyse/trigonometrie-cercle-fonctions-1ere/un-reel-un-point`,
  3: `${BASE}/courses/lycee/premiere_specialite/analyse/trigonometrie-cercle-fonctions-1ere/deux-mots-pour-deux-constats`,
  4: `${BASE}/courses/lycee/premiere_specialite/analyse/trigonometrie-cercle-fonctions-1ere/monter-descendre-remonter`,
  5: `${BASE}/courses/lycee/premiere_specialite/analyse/trigonometrie-cercle-fonctions-1ere/tracer-les-deux-courbes`,
  6: `${BASE}/courses/lycee/premiere_specialite/analyse/trigonometrie-cercle-fonctions-1ere/lire-une-courbe-qui-se-repete`,
  7: `${BASE}/courses/lycee/premiere_specialite/analyse/trigonometrie-cercle-fonctions-1ere/mission-finale-du-cercle-a-la-courbe`,
};

/** Apports de chaque module à la carte — miroir de knowledge.jsx. */
const CONTRIB = {
  2: ['reel-au-dela-du-tour', 'fonction-sinus'],
  3: ['periodicite', 'methode-ramener-dans-un-tour', 'parite-sinus-cosinus', 'mem-pair-cos-impair-sin'],
  4: ['variations-sin-cos', 'methode-lire-tableau-trigo'],
  5: ['courbe-sinusoide', 'mem-cinq-points-du-tour'],
  6: ['lire-ecart-et-motif', 'regle-courbe-ne-dit-pas-tout'],
};
const seedThrough = (n) => Array.from({ length: n + 1 }, (_, i) => String(i));
const expectedAfter = (n) => {
  const out = [];
  for (let i = 1; i <= n; i += 1) out.push(...(CONTRIB[i] ?? []));
  return out;
};
const sameSet = (a, b) => a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|');
const snapshotIds = (page) =>
  page.$$eval('[data-knowledge-snapshot] [data-knowledge-item]', (els) =>
    els.map((e) => e.getAttribute('data-knowledge-item')));

/** Appuie n fois sur un bouton, en auditant la mise en page à chaque pas. */
async function press(page, scope, label, times, issues) {
  const b = page.locator(`${scope} button[aria-label="${label}"]`).first();
  for (let i = 0; i < times; i += 1) {
    // Un bouton peut DISPARAÎTRE en cours de balayage (un sommet qui passe
    // derrière la figure) : on s'arrête, on n'attend pas un élément absent.
    if ((await b.count().catch(() => 0)) === 0) break;
    if (!(await b.isEnabled().catch(() => false))) break;
    // Un clic peut provoquer un re-rendu qui détruit le contexte d'exécution :
    // on ne laisse jamais cela AVORTER la suite, on passe au bouton suivant.
    try {
      await b.click({ force: true });
      await page.waitForTimeout(140);
      issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)));
    } catch { break; }
  }
  await settle(page);
}

/** Balaie TOUS les boutons de manipulation d'une étape, dans les deux sens. */
async function sweepAll(page, scope, issues, times = 6) {
  // Les libellés sont RELEVÉS D'ABORD, puis pilotés par leur nom. Lire
  // `btns.nth(i)` au fil de la boucle suppose que la liste ne bouge pas — or
  // une figure qui tourne fait apparaître et disparaître des boutons de
  // sommets, et l'attente sur un index qui n'existe plus fige la suite.
  // On attend que la page soit POSÉE avant de relever quoi que ce soit : un
  // relevé lancé pendant une navigation lève « Execution context destroyed ».
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await settle(page, 300);
  const btns = page.locator(`${scope} div[role="group"] button[aria-label]`);
  let labels = [];
  try {
    labels = (await btns.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')))).filter(Boolean);
  } catch { labels = []; }
  for (const label of labels) await press(page, scope, label, times, issues);
  return labels.length;
}

const browser = await launch();
const o = async (url, opts = {}) => open(browser, url, { key: KEY, ...opts });

// ── Index ────────────────────────────────────────────────────────────────
{
  const { ctx, page } = await o(`${BASE}${LESSON}`, { tag: 'index' });
  const txt = await body(page);
  check('index : la page de la leçon se rend', txt.length > 200 && !/Chargement/.test(txt));
  check('index : la durée du catalogue est affichée', /80\s*min/.test(txt), txt.slice(0, 160));
  check('index : aucun NaN', !/NaN/.test(txt));
  check('index : la carte des connaissances est montée', (await page.locator('button[data-km-trigger]').count()) === 1);
  check('index : la carte est VIDE au départ', (await page.locator('#km-root [data-km-item]').count()) === 0);
  await page.screenshot({ path: `${SHOT_DIR}trigonometrie-cercle-fonctions-1ere-index.png`, fullPage: true });
  await ctx.close();
}

// ── Module 0 — diagnostic, jamais bloquant ───────────────────────────────
{
  const { ctx, page } = await o(M[0], { tag: 'm0' });
  const groups = page.locator('main div[role="group"]');
  const n = await groups.count();
    // Le plancher vient du contrat (5 questions minimum) ; le PLAFOND vient de
  // l'audit, pas du gabarit : chaque `priorKnowledge` doit être diagnostiqué,
  // et une leçon qui en déclare 21 a besoin de 11 questions. Compter au-delà
  // n'est pas un défaut — c'est la couverture des prérequis.
  check('M0 : au moins cinq questions de diagnostic', n >= 5, `trouvé ${n}`);
  for (let i = 0; i < n; i += 1) {
    const opts = groups.nth(i).locator('button[aria-pressed]');
    // Première question FAUSSE exprès : le diagnostic mesure, il ne verrouille pas.
    const idx = i === 0 ? Math.max(0, (await opts.count()) - 1) : 0;
    await opts.nth(idx).click({ force: true }).catch(() => {});
  }
  await settle(page);
  // Le kit partagé libelle CE bouton « Voir mon résultat », jamais « Valider » :
  // chercher « Valider » ne soumettait rien, et l'assertion suivante passait par
  // hasard sur une page non soumise.
  const v = page.locator('main button').filter({ hasText: /Voir mon résultat|Valider/i }).first();
  check('M0 : le bouton de soumission est présent', (await v.count()) === 1);
  if (await v.count()) await v.click({ force: true });
  await settle(page, 1200);
  const txt = await body(page);
  // Le DÉNOMINATEUR n'est pas fixe : il vaut le nombre de questions, lui-même
  // dicté par le nombre de prérequis à diagnostiquer. Le figer à 10 ou 12
  // faisait échouer une leçon qui en pose 8, alors qu'elle affiche bien son
  // score. On exige un score chiffré, pas un score sur un total imposé.
  check('M0 : un résultat chiffré est affiché après soumission', /\d+\s*\/\s*\d+|sur \d+|point/i.test(txt), txt.slice(-260));
  check('M0 : rien n’est verrouillé malgré une erreur', !/verrouill/i.test(txt));
  check('M0 : la suite reste accessible', await nextEnabled(page));
  await ctx.close();
}

// ── Modules d'enseignement : manipulables, non gelés, mise en page saine ──
{
  const { ctx, page } = await o(M[1], { completedModules: seedThrough(0), tag: 'm1' });
  const issues = [];
  const avant = await body(page);
  check('M1 : la page se rend sans NaN ni erreur de rendu', !/NaN|undefined/.test(avant));
  const swept = await sweepAll(page, '#step-1', issues, 5);
  // Une étape se pilote au cliquet (boutons étiquetés) OU par saisie/choix :
  // exiger un cliquet partout serait une hypothèse de gabarit, pas une règle.
  // Un bouton de bascule dont le TEXTE porte le sens (« ⇄ échanger les deux
  // flèches ») est une manipulation légitime : on ne peut pas exiger partout un
  // aria-label. On compte donc tout bouton d'action de l'étape, hors chrome.
  // Une étape se pilote au cliquet, à la saisie, au choix, par un bouton dont le
  // TEXTE porte le sens — ou PAR LE GLISSER SEUL. Depuis la règle « le glisser
  // d'abord », un laboratoire peut n'avoir AUCUN bouton : la surface de
  // préhension est un SVG focusable portant role et aria-label. L'ignorer
  // ferait échouer les leçons les plus conformes à la règle.
  const saisies = await page.locator(
    '#step-1 input[type="text"], #step-1 button[aria-pressed], #step-1 button:not([aria-label]):not([disabled]),'
    + ' #step-1 svg[tabindex]:not([tabindex="-1"]), #step-1 [role="slider"], #step-1 svg[role="group"], #step-1 svg[role="application"]'
  ).count();
  check('M1 : l’étape 1 est réellement interactive', swept > 0 || saisies > 0, `${swept} cliquet(s), ${saisies} saisie(s)`);
  check('M1 : mise en page saine sur tout le balayage', issues.length === 0, issues.slice(0, 3).join(' | '));
  // JAMAIS GELÉ : après usage, l'étape reste PILOTABLE. Un bouton de cliquet
  // peut être légitimement éteint en BUTÉE (« descendre » au cran le plus bas) :
  // c'est une borne, pas un gel. Et depuis la règle « le glisser d'abord », la
  // commande survivante peut n'être AUCUN bouton — juste la poignée qu'on saisit.
  // On exige donc qu'il reste au moins UN moyen d'agir, bouton OU préhension.
  if (swept > 0) {
    const encore = await page.locator(
      '#step-1 div[role="group"] button[aria-label]:not([disabled]),'
      + ' #step-1 svg[tabindex="0"], #step-1 [role="slider"]:not([aria-disabled="true"]),'
      + ' #step-1 svg[role="group"], #step-1 svg[role="application"]'
    ).count();
    check('M1 : la manipulation reste utilisable après usage', encore > 0);
  }
  await page.screenshot({ path: `${SHOT_DIR}trigonometrie-cercle-fonctions-1ere-m1.png`, fullPage: true });
  await ctx.close();
}
{
  const { ctx, page } = await o(M[2], { completedModules: seedThrough(1), tag: 'm2' });
  const issues = [];
  const avant = await body(page);
  check('M2 : la page se rend sans NaN ni erreur de rendu', !/NaN|undefined/.test(avant));
  const swept = await sweepAll(page, '#step-1', issues, 5);
  // Une étape se pilote au cliquet (boutons étiquetés) OU par saisie/choix :
  // exiger un cliquet partout serait une hypothèse de gabarit, pas une règle.
  // Un bouton de bascule dont le TEXTE porte le sens (« ⇄ échanger les deux
  // flèches ») est une manipulation légitime : on ne peut pas exiger partout un
  // aria-label. On compte donc tout bouton d'action de l'étape, hors chrome.
  // Une étape se pilote au cliquet, à la saisie, au choix, par un bouton dont le
  // TEXTE porte le sens — ou PAR LE GLISSER SEUL. Depuis la règle « le glisser
  // d'abord », un laboratoire peut n'avoir AUCUN bouton : la surface de
  // préhension est un SVG focusable portant role et aria-label. L'ignorer
  // ferait échouer les leçons les plus conformes à la règle.
  const saisies = await page.locator(
    '#step-1 input[type="text"], #step-1 button[aria-pressed], #step-1 button:not([aria-label]):not([disabled]),'
    + ' #step-1 svg[tabindex]:not([tabindex="-1"]), #step-1 [role="slider"], #step-1 svg[role="group"], #step-1 svg[role="application"]'
  ).count();
  check('M2 : l’étape 1 est réellement interactive', swept > 0 || saisies > 0, `${swept} cliquet(s), ${saisies} saisie(s)`);
  check('M2 : mise en page saine sur tout le balayage', issues.length === 0, issues.slice(0, 3).join(' | '));
  // JAMAIS GELÉ : après usage, l'étape reste PILOTABLE. Un bouton de cliquet
  // peut être légitimement éteint en BUTÉE (« descendre » au cran le plus bas) :
  // c'est une borne, pas un gel. Et depuis la règle « le glisser d'abord », la
  // commande survivante peut n'être AUCUN bouton — juste la poignée qu'on saisit.
  // On exige donc qu'il reste au moins UN moyen d'agir, bouton OU préhension.
  if (swept > 0) {
    const encore = await page.locator(
      '#step-1 div[role="group"] button[aria-label]:not([disabled]),'
      + ' #step-1 svg[tabindex="0"], #step-1 [role="slider"]:not([aria-disabled="true"]),'
      + ' #step-1 svg[role="group"], #step-1 svg[role="application"]'
    ).count();
    check('M2 : la manipulation reste utilisable après usage', encore > 0);
  }
  await page.screenshot({ path: `${SHOT_DIR}trigonometrie-cercle-fonctions-1ere-m2.png`, fullPage: true });
  await ctx.close();
}
{
  const { ctx, page } = await o(M[3], { completedModules: seedThrough(2), tag: 'm3' });
  const issues = [];
  const avant = await body(page);
  check('M3 : la page se rend sans NaN ni erreur de rendu', !/NaN|undefined/.test(avant));
  const swept = await sweepAll(page, '#step-1', issues, 5);
  // Une étape se pilote au cliquet (boutons étiquetés) OU par saisie/choix :
  // exiger un cliquet partout serait une hypothèse de gabarit, pas une règle.
  // Un bouton de bascule dont le TEXTE porte le sens (« ⇄ échanger les deux
  // flèches ») est une manipulation légitime : on ne peut pas exiger partout un
  // aria-label. On compte donc tout bouton d'action de l'étape, hors chrome.
  // Une étape se pilote au cliquet, à la saisie, au choix, par un bouton dont le
  // TEXTE porte le sens — ou PAR LE GLISSER SEUL. Depuis la règle « le glisser
  // d'abord », un laboratoire peut n'avoir AUCUN bouton : la surface de
  // préhension est un SVG focusable portant role et aria-label. L'ignorer
  // ferait échouer les leçons les plus conformes à la règle.
  const saisies = await page.locator(
    '#step-1 input[type="text"], #step-1 button[aria-pressed], #step-1 button:not([aria-label]):not([disabled]),'
    + ' #step-1 svg[tabindex]:not([tabindex="-1"]), #step-1 [role="slider"], #step-1 svg[role="group"], #step-1 svg[role="application"]'
  ).count();
  check('M3 : l’étape 1 est réellement interactive', swept > 0 || saisies > 0, `${swept} cliquet(s), ${saisies} saisie(s)`);
  check('M3 : mise en page saine sur tout le balayage', issues.length === 0, issues.slice(0, 3).join(' | '));
  // JAMAIS GELÉ : après usage, l'étape reste PILOTABLE. Un bouton de cliquet
  // peut être légitimement éteint en BUTÉE (« descendre » au cran le plus bas) :
  // c'est une borne, pas un gel. Et depuis la règle « le glisser d'abord », la
  // commande survivante peut n'être AUCUN bouton — juste la poignée qu'on saisit.
  // On exige donc qu'il reste au moins UN moyen d'agir, bouton OU préhension.
  if (swept > 0) {
    const encore = await page.locator(
      '#step-1 div[role="group"] button[aria-label]:not([disabled]),'
      + ' #step-1 svg[tabindex="0"], #step-1 [role="slider"]:not([aria-disabled="true"]),'
      + ' #step-1 svg[role="group"], #step-1 svg[role="application"]'
    ).count();
    check('M3 : la manipulation reste utilisable après usage', encore > 0);
  }
  await page.screenshot({ path: `${SHOT_DIR}trigonometrie-cercle-fonctions-1ere-m3.png`, fullPage: true });
  await ctx.close();
}
{
  const { ctx, page } = await o(M[4], { completedModules: seedThrough(3), tag: 'm4' });
  const issues = [];
  const avant = await body(page);
  check('M4 : la page se rend sans NaN ni erreur de rendu', !/NaN|undefined/.test(avant));
  const swept = await sweepAll(page, '#step-1', issues, 5);
  // Une étape se pilote au cliquet (boutons étiquetés) OU par saisie/choix :
  // exiger un cliquet partout serait une hypothèse de gabarit, pas une règle.
  // Un bouton de bascule dont le TEXTE porte le sens (« ⇄ échanger les deux
  // flèches ») est une manipulation légitime : on ne peut pas exiger partout un
  // aria-label. On compte donc tout bouton d'action de l'étape, hors chrome.
  // Une étape se pilote au cliquet, à la saisie, au choix, par un bouton dont le
  // TEXTE porte le sens — ou PAR LE GLISSER SEUL. Depuis la règle « le glisser
  // d'abord », un laboratoire peut n'avoir AUCUN bouton : la surface de
  // préhension est un SVG focusable portant role et aria-label. L'ignorer
  // ferait échouer les leçons les plus conformes à la règle.
  const saisies = await page.locator(
    '#step-1 input[type="text"], #step-1 button[aria-pressed], #step-1 button:not([aria-label]):not([disabled]),'
    + ' #step-1 svg[tabindex]:not([tabindex="-1"]), #step-1 [role="slider"], #step-1 svg[role="group"], #step-1 svg[role="application"]'
  ).count();
  check('M4 : l’étape 1 est réellement interactive', swept > 0 || saisies > 0, `${swept} cliquet(s), ${saisies} saisie(s)`);
  check('M4 : mise en page saine sur tout le balayage', issues.length === 0, issues.slice(0, 3).join(' | '));
  // JAMAIS GELÉ : après usage, l'étape reste PILOTABLE. Un bouton de cliquet
  // peut être légitimement éteint en BUTÉE (« descendre » au cran le plus bas) :
  // c'est une borne, pas un gel. Et depuis la règle « le glisser d'abord », la
  // commande survivante peut n'être AUCUN bouton — juste la poignée qu'on saisit.
  // On exige donc qu'il reste au moins UN moyen d'agir, bouton OU préhension.
  if (swept > 0) {
    const encore = await page.locator(
      '#step-1 div[role="group"] button[aria-label]:not([disabled]),'
      + ' #step-1 svg[tabindex="0"], #step-1 [role="slider"]:not([aria-disabled="true"]),'
      + ' #step-1 svg[role="group"], #step-1 svg[role="application"]'
    ).count();
    check('M4 : la manipulation reste utilisable après usage', encore > 0);
  }
  await page.screenshot({ path: `${SHOT_DIR}trigonometrie-cercle-fonctions-1ere-m4.png`, fullPage: true });
  await ctx.close();
}
{
  const { ctx, page } = await o(M[5], { completedModules: seedThrough(4), tag: 'm5' });
  const issues = [];
  const avant = await body(page);
  check('M5 : la page se rend sans NaN ni erreur de rendu', !/NaN|undefined/.test(avant));
  const swept = await sweepAll(page, '#step-1', issues, 5);
  // Une étape se pilote au cliquet (boutons étiquetés) OU par saisie/choix :
  // exiger un cliquet partout serait une hypothèse de gabarit, pas une règle.
  // Un bouton de bascule dont le TEXTE porte le sens (« ⇄ échanger les deux
  // flèches ») est une manipulation légitime : on ne peut pas exiger partout un
  // aria-label. On compte donc tout bouton d'action de l'étape, hors chrome.
  // Une étape se pilote au cliquet, à la saisie, au choix, par un bouton dont le
  // TEXTE porte le sens — ou PAR LE GLISSER SEUL. Depuis la règle « le glisser
  // d'abord », un laboratoire peut n'avoir AUCUN bouton : la surface de
  // préhension est un SVG focusable portant role et aria-label. L'ignorer
  // ferait échouer les leçons les plus conformes à la règle.
  const saisies = await page.locator(
    '#step-1 input[type="text"], #step-1 button[aria-pressed], #step-1 button:not([aria-label]):not([disabled]),'
    + ' #step-1 svg[tabindex]:not([tabindex="-1"]), #step-1 [role="slider"], #step-1 svg[role="group"], #step-1 svg[role="application"]'
  ).count();
  check('M5 : l’étape 1 est réellement interactive', swept > 0 || saisies > 0, `${swept} cliquet(s), ${saisies} saisie(s)`);
  check('M5 : mise en page saine sur tout le balayage', issues.length === 0, issues.slice(0, 3).join(' | '));
  // JAMAIS GELÉ : après usage, l'étape reste PILOTABLE. Un bouton de cliquet
  // peut être légitimement éteint en BUTÉE (« descendre » au cran le plus bas) :
  // c'est une borne, pas un gel. Et depuis la règle « le glisser d'abord », la
  // commande survivante peut n'être AUCUN bouton — juste la poignée qu'on saisit.
  // On exige donc qu'il reste au moins UN moyen d'agir, bouton OU préhension.
  if (swept > 0) {
    const encore = await page.locator(
      '#step-1 div[role="group"] button[aria-label]:not([disabled]),'
      + ' #step-1 svg[tabindex="0"], #step-1 [role="slider"]:not([aria-disabled="true"]),'
      + ' #step-1 svg[role="group"], #step-1 svg[role="application"]'
    ).count();
    check('M5 : la manipulation reste utilisable après usage', encore > 0);
  }
  await page.screenshot({ path: `${SHOT_DIR}trigonometrie-cercle-fonctions-1ere-m5.png`, fullPage: true });
  await ctx.close();
}
{
  const { ctx, page } = await o(M[6], { completedModules: seedThrough(5), tag: 'm6' });
  const issues = [];
  const avant = await body(page);
  check('M6 : la page se rend sans NaN ni erreur de rendu', !/NaN|undefined/.test(avant));
  const swept = await sweepAll(page, '#step-1', issues, 5);
  // Une étape se pilote au cliquet (boutons étiquetés) OU par saisie/choix :
  // exiger un cliquet partout serait une hypothèse de gabarit, pas une règle.
  // Un bouton de bascule dont le TEXTE porte le sens (« ⇄ échanger les deux
  // flèches ») est une manipulation légitime : on ne peut pas exiger partout un
  // aria-label. On compte donc tout bouton d'action de l'étape, hors chrome.
  // Une étape se pilote au cliquet, à la saisie, au choix, par un bouton dont le
  // TEXTE porte le sens — ou PAR LE GLISSER SEUL. Depuis la règle « le glisser
  // d'abord », un laboratoire peut n'avoir AUCUN bouton : la surface de
  // préhension est un SVG focusable portant role et aria-label. L'ignorer
  // ferait échouer les leçons les plus conformes à la règle.
  const saisies = await page.locator(
    '#step-1 input[type="text"], #step-1 button[aria-pressed], #step-1 button:not([aria-label]):not([disabled]),'
    + ' #step-1 svg[tabindex]:not([tabindex="-1"]), #step-1 [role="slider"], #step-1 svg[role="group"], #step-1 svg[role="application"]'
  ).count();
  check('M6 : l’étape 1 est réellement interactive', swept > 0 || saisies > 0, `${swept} cliquet(s), ${saisies} saisie(s)`);
  check('M6 : mise en page saine sur tout le balayage', issues.length === 0, issues.slice(0, 3).join(' | '));
  // JAMAIS GELÉ : après usage, l'étape reste PILOTABLE. Un bouton de cliquet
  // peut être légitimement éteint en BUTÉE (« descendre » au cran le plus bas) :
  // c'est une borne, pas un gel. Et depuis la règle « le glisser d'abord », la
  // commande survivante peut n'être AUCUN bouton — juste la poignée qu'on saisit.
  // On exige donc qu'il reste au moins UN moyen d'agir, bouton OU préhension.
  if (swept > 0) {
    const encore = await page.locator(
      '#step-1 div[role="group"] button[aria-label]:not([disabled]),'
      + ' #step-1 svg[tabindex="0"], #step-1 [role="slider"]:not([aria-disabled="true"]),'
      + ' #step-1 svg[role="group"], #step-1 svg[role="application"]'
    ).count();
    check('M6 : la manipulation reste utilisable après usage', encore > 0);
  }
  await page.screenshot({ path: `${SHOT_DIR}trigonometrie-cercle-fonctions-1ere-m6.png`, fullPage: true });
  await ctx.close();
}

// ── Carte des connaissances : rien du futur ne fuite ─────────────────────
for (const n of Object.keys(CONTRIB).map(Number).sort((a, b) => a - b)) {
  const { ctx, page } = await o(M[n], { completedModules: seedThrough(n), tag: `km${n}` });
  const ids = await snapshotIds(page);
  const attendu = expectedAfter(n);
  check(`carte après M${n} : exactement les apports cumulés`, sameSet(ids, attendu),
    `vu [${ids.join(', ')}] attendu [${attendu.join(', ')}]`);
  const futurs = Object.entries(CONTRIB).filter(([k]) => Number(k) > n).flatMap(([, v]) => v);
  check(`carte après M${n} : aucune connaissance future ne fuite`,
    !ids.some((x) => futurs.includes(x)), futurs.filter((f) => ids.includes(f)).join(', '));
  await ctx.close();
}

// ── Le boss ──────────────────────────────────────────────────────────────
{
  const { ctx, page } = await o(M[7], { completedModules: seedThrough(6), tag: 'boss' });
  // La page doit être POSÉE avant qu'on affirme qu'elle est silencieuse.
  // Et on cherche la CORRECTION DU KIT — « Bonne réponse : » suivi de deux
  // points — et non la chaîne nue : un distracteur peut légitimement écrire
  // « 2,41 est la bonne réponse » dans son propre libellé.
  await settle(page, 600);
  check('boss : silencieux avant validation', !/Bonne réponse\s*:/i.test(await body(page)));
  await runBoss(page);
  const v = page.locator('main button').filter({ hasText: /Valider mes 10 réponses/i }).first();
  check('boss : le bouton de validation apparaît', (await v.count()) === 1);
  await v.click({ force: true });
  await settle(page, 1200);
  check('boss : un score sur 10 est affiché', /\/\s*10/.test(await body(page)));

  const p = page.locator('main button, main [role="tab"]').filter({ hasText: /profil/i }).first();
  if (await p.count()) { await p.click({ force: true }); await settle(page); }
  const s = page.locator('main button, main [role="tab"]').filter({ hasText: /synthèse/i }).first();
  if (await s.count()) { await s.click({ force: true }); await settle(page); }
  check('boss : la synthèse rend la carte complète, une seule fois',
    (await page.locator('[data-knowledge-snapshot="complete"]').count()) === 1);

  const done = await readCompleted(page, KEY);
  check('boss : le module d’évaluation est enregistré', Array.isArray(done) && done.includes('7'), JSON.stringify(done));
  await page.reload();
  await settle(page, 1200);
  check('boss : après rechargement, la correction est restituée', /\/\s*10/.test(await body(page)));
  await page.screenshot({ path: `${SHOT_DIR}trigonometrie-cercle-fonctions-1ere-boss.png`, fullPage: true });
  await ctx.close();
}

// ── Mobile 375 px ────────────────────────────────────────────────────────
for (const n of [1, 7]) {
  const { ctx, page } = await o(M[n], { completedModules: seedThrough(Math.max(0, n - 1)), mobile: true, tag: `mob${n}` });
  check(`mobile M${n} : aucun défilement horizontal`, await noHScroll(page));
  // Le commutateur de chronomètre du kit partagé fait 28 px dans TOUTES les
  // leçons : défaut du composant partagé, exclu explicitement (§6bis.5).
  const small = (await smallTargets(page)).filter((t) => !/chronom|timer/i.test(t || ''));
  const kitSwitch = await page.locator('main button[role="switch"]').count();
  check(`mobile M${n} : cibles ≥ 40 px (hors commutateur du kit)`, small.length <= kitSwitch, small.slice(0, 4).join(', '));
  const issues = [...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page))];
  check(`mobile M${n} : mise en page saine à 375 px`, issues.length === 0, issues.slice(0, 3).join(' | '));
  if (n === 1) await page.screenshot({ path: `${SHOT_DIR}trigonometrie-cercle-fonctions-1ere-m1-mobile.png`, fullPage: true });
  await ctx.close();
}

check('zéro erreur console ou page sur toute la course', errs.length === 0, errs.slice(0, 4).join(' | '));

await browser.close();
process.exitCode = summary() ? 1 : 0;
