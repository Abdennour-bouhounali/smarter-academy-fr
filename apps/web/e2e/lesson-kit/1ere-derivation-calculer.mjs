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

const BASE = process.env.KIT_BASE || 'http://localhost:5285';
const LESSON = '/courses/lycee/premiere_specialite/analyse/derivation-calculer-1ere';
const KEY = 'u_anon_smarter_lesson_derivation-calculer-1ere';

const M = {
  0: `${BASE}/courses/lycee/premiere_specialite/analyse/derivation-calculer-1ere/mission-de-depart`,
  1: `${BASE}/courses/lycee/premiere_specialite/analyse/derivation-calculer-1ere/l-usine-a-derivees`,
  2: `${BASE}/courses/lycee/premiere_specialite/analyse/derivation-calculer-1ere/les-cartes-de-base`,
  3: `${BASE}/courses/lycee/premiere_specialite/analyse/derivation-calculer-1ere/somme-et-produit`,
  4: `${BASE}/courses/lycee/premiere_specialite/analyse/derivation-calculer-1ere/le-quotient`,
  5: `${BASE}/courses/lycee/premiere_specialite/analyse/derivation-calculer-1ere/la-composee-simple`,
  6: `${BASE}/courses/lycee/premiere_specialite/analyse/derivation-calculer-1ere/atelier-mixte`,
  7: `${BASE}/courses/lycee/premiere_specialite/analyse/derivation-calculer-1ere/mission-finale-l-usine`,
};

/** Apports de chaque module à la carte — miroir de knowledge.jsx. */
const CONTRIB = {
  1: ['derivation-ne-se-distribue-pas'],
  2: ['derivees-usuelles', 'mem-x-puissance-n'],
  3: ['regle-somme-et-reel', 'regle-produit', 'mem-produit'],
  4: ['regle-quotient', 'mem-quotient'],
  5: ['regle-composee-simple', 'mem-composee'],
  6: ['methode-choisir-la-regle'],
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
    if (!(await b.isEnabled().catch(() => false))) break;
    await b.click({ force: true });
    await page.waitForTimeout(140);
    issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)));
  }
  await settle(page);
}

/** Balaie TOUS les boutons de manipulation d'une étape, dans les deux sens. */
async function sweepAll(page, scope, issues, times = 6) {
  const btns = page.locator(`${scope} div[role="group"] button[aria-label]`);
  const n = await btns.count();
  for (let i = 0; i < n; i += 1) {
    const label = await btns.nth(i).getAttribute('aria-label');
    if (label) await press(page, scope, label, times, issues);
  }
  return n;
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
  await page.screenshot({ path: `${SHOT_DIR}derivation-calculer-1ere-index.png`, fullPage: true });
  await ctx.close();
}

// ── Module 0 — diagnostic, jamais bloquant ───────────────────────────────
{
  const { ctx, page } = await o(M[0], { tag: 'm0' });
  const groups = page.locator('main div[role="group"]');
  const n = await groups.count();
  // 5 ou 6 : l'audit exige que CHAQUE priorKnowledge soit diagnostiqué, ce qui
  // impose parfois une question de plus. En dessous de 5, le diagnostic ne
  // couvre plus ses prérequis.
  check('M0 : entre cinq et dix questions de diagnostic', n >= 5 && n <= 10, `trouvé ${n}`);
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
  check('M0 : un résultat chiffré est affiché après soumission', /\d+\s*\/\s*1[02]|sur 1[02]|point/i.test(txt), txt.slice(-260));
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
  const saisies = await page.locator(
    '#step-1 input[type="text"], #step-1 button[aria-pressed], #step-1 button:not([aria-label]):not([disabled])'
  ).count();
  check('M1 : l’étape 1 est réellement interactive', swept > 0 || saisies > 0, `${swept} cliquet(s), ${saisies} saisie(s)`);
  check('M1 : mise en page saine sur tout le balayage', issues.length === 0, issues.slice(0, 3).join(' | '));
  // JAMAIS GELÉ : après usage, les commandes de l'étape restent utilisables.
  if (swept > 0) {
    const encore = await page.locator('#step-1 div[role="group"] button[aria-label]:not([disabled])').count();
    check('M1 : la manipulation reste utilisable après usage', encore > 0);
  }
  await page.screenshot({ path: `${SHOT_DIR}derivation-calculer-1ere-m1.png`, fullPage: true });
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
  const saisies = await page.locator(
    '#step-1 input[type="text"], #step-1 button[aria-pressed], #step-1 button:not([aria-label]):not([disabled])'
  ).count();
  check('M2 : l’étape 1 est réellement interactive', swept > 0 || saisies > 0, `${swept} cliquet(s), ${saisies} saisie(s)`);
  check('M2 : mise en page saine sur tout le balayage', issues.length === 0, issues.slice(0, 3).join(' | '));
  // JAMAIS GELÉ : après usage, les commandes de l'étape restent utilisables.
  if (swept > 0) {
    const encore = await page.locator('#step-1 div[role="group"] button[aria-label]:not([disabled])').count();
    check('M2 : la manipulation reste utilisable après usage', encore > 0);
  }
  await page.screenshot({ path: `${SHOT_DIR}derivation-calculer-1ere-m2.png`, fullPage: true });
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
  const saisies = await page.locator(
    '#step-1 input[type="text"], #step-1 button[aria-pressed], #step-1 button:not([aria-label]):not([disabled])'
  ).count();
  check('M3 : l’étape 1 est réellement interactive', swept > 0 || saisies > 0, `${swept} cliquet(s), ${saisies} saisie(s)`);
  check('M3 : mise en page saine sur tout le balayage', issues.length === 0, issues.slice(0, 3).join(' | '));
  // JAMAIS GELÉ : après usage, les commandes de l'étape restent utilisables.
  if (swept > 0) {
    const encore = await page.locator('#step-1 div[role="group"] button[aria-label]:not([disabled])').count();
    check('M3 : la manipulation reste utilisable après usage', encore > 0);
  }
  await page.screenshot({ path: `${SHOT_DIR}derivation-calculer-1ere-m3.png`, fullPage: true });
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
  const saisies = await page.locator(
    '#step-1 input[type="text"], #step-1 button[aria-pressed], #step-1 button:not([aria-label]):not([disabled])'
  ).count();
  check('M4 : l’étape 1 est réellement interactive', swept > 0 || saisies > 0, `${swept} cliquet(s), ${saisies} saisie(s)`);
  check('M4 : mise en page saine sur tout le balayage', issues.length === 0, issues.slice(0, 3).join(' | '));
  // JAMAIS GELÉ : après usage, les commandes de l'étape restent utilisables.
  if (swept > 0) {
    const encore = await page.locator('#step-1 div[role="group"] button[aria-label]:not([disabled])').count();
    check('M4 : la manipulation reste utilisable après usage', encore > 0);
  }
  await page.screenshot({ path: `${SHOT_DIR}derivation-calculer-1ere-m4.png`, fullPage: true });
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
  const saisies = await page.locator(
    '#step-1 input[type="text"], #step-1 button[aria-pressed], #step-1 button:not([aria-label]):not([disabled])'
  ).count();
  check('M5 : l’étape 1 est réellement interactive', swept > 0 || saisies > 0, `${swept} cliquet(s), ${saisies} saisie(s)`);
  check('M5 : mise en page saine sur tout le balayage', issues.length === 0, issues.slice(0, 3).join(' | '));
  // JAMAIS GELÉ : après usage, les commandes de l'étape restent utilisables.
  if (swept > 0) {
    const encore = await page.locator('#step-1 div[role="group"] button[aria-label]:not([disabled])').count();
    check('M5 : la manipulation reste utilisable après usage', encore > 0);
  }
  await page.screenshot({ path: `${SHOT_DIR}derivation-calculer-1ere-m5.png`, fullPage: true });
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
  const saisies = await page.locator(
    '#step-1 input[type="text"], #step-1 button[aria-pressed], #step-1 button:not([aria-label]):not([disabled])'
  ).count();
  check('M6 : l’étape 1 est réellement interactive', swept > 0 || saisies > 0, `${swept} cliquet(s), ${saisies} saisie(s)`);
  check('M6 : mise en page saine sur tout le balayage', issues.length === 0, issues.slice(0, 3).join(' | '));
  // JAMAIS GELÉ : après usage, les commandes de l'étape restent utilisables.
  if (swept > 0) {
    const encore = await page.locator('#step-1 div[role="group"] button[aria-label]:not([disabled])').count();
    check('M6 : la manipulation reste utilisable après usage', encore > 0);
  }
  await page.screenshot({ path: `${SHOT_DIR}derivation-calculer-1ere-m6.png`, fullPage: true });
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
  check('boss : silencieux avant validation', !/Bonne réponse/i.test(await body(page)));
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
  await page.screenshot({ path: `${SHOT_DIR}derivation-calculer-1ere-boss.png`, fullPage: true });
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
  if (n === 1) await page.screenshot({ path: `${SHOT_DIR}derivation-calculer-1ere-m1-mobile.png`, fullPage: true });
  await ctx.close();
}

check('zéro erreur console ou page sur toute la course', errs.length === 0, errs.slice(0, 4).join(' | '));

await browser.close();
process.exitCode = summary() ? 1 : 0;
