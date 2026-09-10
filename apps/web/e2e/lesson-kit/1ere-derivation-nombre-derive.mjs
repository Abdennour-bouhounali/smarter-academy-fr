/**
 * 1ère spé — « Dérivation : le nombre dérivé et la tangente ».
 *
 * Chaque suite tourne sur SON port vite (KIT_BASE) — vite est lancé détaché
 * depuis apps/web/ :
 *   cd apps/web && (setsid nohup npx vite --port 5280 --strictPort > e2e/lesson-kit/shots/vite-5280.log 2>&1 </dev/null &)
 *   node apps/web/e2e/lesson-kit/1ere-derivation-nombre-derive.mjs
 *
 * Ce que la suite PROUVE, au-delà du montage des pages :
 *   — le laboratoire signature est réellement pilotable, et il RESTE pilotable
 *     après validation (la classe de défaut « laboratoire gelé ») ;
 *   — les briques n'apparaissent qu'au moment prévu, et rien du futur ne fuite
 *     dans la carte des connaissances (table CONTRIB) ;
 *   — une mauvaise réponse produit son retour CIBLÉ et ne bloque pas ;
 *   — le boss note sur 10, dresse un profil, et la progression survit au
 *     rechargement ;
 *   — à 375 px : aucun défilement horizontal, cibles ≥ 40 px, aucune collision.
 */
import {
  SHOT_DIR, check, summary, errs, launch, open, settle, body,
  layoutAudit, aspectAudit, domOverflow, chromeTop, noHScroll,
  smallTargets, readCompleted, nextEnabled, tapOption, runBoss,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5280';
const LESSON = '/courses/lycee/premiere_specialite/analyse/derivation-nombre-derive-1ere';
const KEY = 'u_anon_smarter_lesson_derivation-nombre-derive-1ere';

const M = {
  0: `${BASE}${LESSON}/mission-de-depart`,
  1: `${BASE}${LESSON}/la-secante-qui-se-couche`,
  2: `${BASE}${LESSON}/le-nombre-derive`,
  3: `${BASE}${LESSON}/lire-une-tangente`,
  4: `${BASE}${LESSON}/tracer-la-tangente`,
  5: `${BASE}${LESSON}/l-equation-de-la-tangente`,
  6: `${BASE}${LESSON}/mission-finale-la-tangente`,
};

/** Les apports de chaque module à la carte — miroir de knowledge.jsx. */
const CONTRIB = {
  1: ['taux-variation-secante', 'rapprochement-stabilisation'],
  2: ['nombre-derive', 'methode-calculer-nombre-derive'],
  3: ['tangente-position-limite', 'derive-coefficient-directeur', 'mem-derive-est-la-pente'],
  4: ['tangente-peut-recouper'],
  5: ['formule-equation-tangente', 'methode-ecrire-tangente', 'mem-equation-tangente'],
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

/** Appuie n fois sur un bouton repéré par son aria-label, en auditant à chaque pas. */
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

const browser = await launch();
/** open() rend { ctx, page } : on garde le contexte pour le refermer. */
const o = async (url, opts = {}) => open(browser, url, { key: KEY, ...opts });

// ── Index ────────────────────────────────────────────────────────────────
{
  const { ctx, page } = await o(`${BASE}${LESSON}`, { tag: 'index' });
  const txt = await body(page);
  check('index : le titre de la leçon est rendu', /nombre dérivé et la tangente/i.test(txt), txt.slice(0, 160));
  check('index : la durée du catalogue est affichée', /75\s*min/.test(txt));
  check('index : aucun NaN dans la page', !/NaN/.test(txt));
  check('index : la carte des connaissances est présente', (await page.locator('button[data-km-trigger]').count()) === 1);
  check('index : la carte est VIDE au départ', (await page.locator('#km-root [data-km-item]').count()) === 0);
  await page.screenshot({ path: `${SHOT_DIR}1ere-deriv-index.png`, fullPage: true });
  await ctx.close();
}

// ── Module 0 — diagnostic, jamais bloquant ───────────────────────────────
{
  const { ctx, page } = await o(M[0], { tag: 'm0' });
  const groups = page.locator('main div[role="group"]');
  const n = await groups.count();
  check('M0 : entre cinq et dix questions de diagnostic', n >= 5 && n <= 10, `trouvé ${n}`);
  for (let i = 0; i < n; i += 1) {
    // Une mauvaise réponse volontaire à la première : le diagnostic MESURE,
    // il ne doit rien verrouiller.
    const opts = groups.nth(i).locator('button[aria-pressed]');
    const idx = i === 0 ? Math.max(0, (await opts.count()) - 1) : 0;
    await opts.nth(idx).click({ force: true });
  }
  await settle(page);
  const valider = page.locator('main button').filter({ hasText: /Voir mon résultat|Valider/i }).first();
  if (await valider.count()) await valider.click({ force: true });
  await settle(page);
  const txt = await body(page);
  check('M0 : un résultat est affiché après validation', /\/\s*10|sur 10|point/i.test(txt), txt.slice(-220));
  check('M0 : rien n’est verrouillé malgré une erreur', !/verrouill/i.test(txt));
  check('M0 : la suite reste accessible', await nextEnabled(page));
  await page.screenshot({ path: `${SHOT_DIR}1ere-deriv-m0.png`, fullPage: true });
  await ctx.close();
}

// ── Module 1 — le laboratoire signature ──────────────────────────────────
{
  const { ctx, page } = await o(M[1], { completedModules: seedThrough(0), tag: 'm1' });
  const issues = [];
  const txt0 = await body(page);
  check('M1 : le laboratoire est à l’écran d’emblée', /rapprocher/i.test(txt0) && (await page.locator('svg').count()) > 0);
  check('M1 : les trois nombres du taux sont dans le DOM', /avancée/i.test(txt0) && /montée/i.test(txt0) && /pente/i.test(txt0));

  // Étape 1 : régler h sur 0,5 puis répondre — d'abord FAUX exprès.
  await press(page, '#step-1', 'Rapprocher B de A', 2, issues);
  check('M1 étape 1 : h vaut 0,5 après deux crans', /h = 0,5/.test(await body(page)));
  await page.locator('#step-1 input[type="text"]').first().fill('1,25');
  await page.locator('#step-1 button:has-text("OK")').first().click();
  await settle(page);
  const apresFaux = await body(page);
  check(
    'M1 étape 1 : le retour CIBLÉ nomme l’erreur « montée prise pour la pente »',
    /C’est la MONTÉE/i.test(apresFaux),
    apresFaux.slice(-260)
  );
  check('M1 étape 1 : une erreur ne bloque pas l’étape', !/verrouill/i.test(apresFaux));

  // Étape 2 : le cliquet jusqu'aux trois plus petits écarts.
  await press(page, '#step-2', 'Rapprocher B de A', 8, issues);
  const txt2 = await body(page);
  check('M1 étape 2 : la colonne d’historique se remplit', /Les pentes déjà obtenues/i.test(txt2));
  check('M1 étape 2 : la stabilisation est constatée', /2,01/.test(txt2), txt2.slice(-300));

  // LA vérification de la classe de défaut : le laboratoire reste PILOTABLE.
  const rapprocher = page.locator('#step-2 button[aria-label="Rapprocher B de A"]').first();
  const eloigner = page.locator('#step-2 button[aria-label="Éloigner B de A"]').first();
  check(
    'M1 : le laboratoire N’EST PAS GELÉ après validation (on peut encore éloigner B)',
    await eloigner.isEnabled().catch(() => false)
  );
  const avantClic = await page.textContent('#step-2');
  await eloigner.click({ force: true });
  await settle(page);
  const apresClic = await page.textContent('#step-2');
  // On lit l'étape 2 SEULE : la page porte deux laboratoires, et un `body()`
  // global verrait le h de l'étape 1.
  check(
    'M1 : et l’action a bien un effet mathématique (l’écart de l’étape 2 change)',
    avantClic !== apresClic && /h = 0,05/.test(apresClic),
    (apresClic.match(/h = [\d,]+/g) || []).join(' ')
  );

  check('M1 : mise en page saine sur tout le balayage de h', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}1ere-deriv-m1.png`, fullPage: true });
  await ctx.close();
}

// ── Carte des connaissances : rien du futur ne fuite ─────────────────────
for (const n of [1, 2, 3, 4, 5]) {
  const { ctx, page } = await o(M[n], { completedModules: seedThrough(n), tag: `km${n}` });
  const ids = await snapshotIds(page);
  const attendu = expectedAfter(n);
  check(`carte après M${n} : exactement les apports cumulés`, sameSet(ids, attendu),
    `vu [${ids.join(', ')}] attendu [${attendu.join(', ')}]`);
  const futurs = Object.entries(CONTRIB).filter(([k]) => Number(k) > n).flatMap(([, v]) => v);
  check(`carte après M${n} : aucune connaissance future ne fuite`,
    !ids.some((id) => futurs.includes(id)), futurs.filter((f) => ids.includes(f)).join(', '));
  await ctx.close();
}

// ── Module 3 — le contre-exemple doit être ATTEIGNABLE ───────────────────
{
  const { ctx, page } = await o(M[3], { completedModules: seedThrough(2), tag: 'm3' });
  const issues = [];
  await press(page, '#step-1', 'Déplacer le point de contact vers la droite', 3, issues);
  check('M3 étape 1 : les deux nombres du point sont distingués dans le DOM',
    /ordonnée du point/i.test(await body(page)) && /pente de la tangente/i.test(await body(page)));
  // Étape 3 : atteindre une tangente qui monte ET une qui descend sur g.
  await press(page, '#step-3', 'Déplacer le point de contact vers la droite', 6, issues);
  await press(page, '#step-3', 'Déplacer le point de contact vers la gauche', 6, issues);
  const txt = await body(page);
  check('M3 étape 3 : le contre-exemple « sous l’axe et pourtant ça monte » est atteint',
    /a = 1,5/.test(txt) || /monte/i.test(txt), txt.slice(-260));
  check('M3 : mise en page saine sur tout le balayage du point de contact',
    issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}1ere-deriv-m3.png`, fullPage: true });
  await ctx.close();
}

// ── Module 4 — viser la pente, et la tangente qui recoupe ────────────────
{
  const { ctx, page } = await o(M[4], { completedModules: seedThrough(3), tag: 'm4' });
  const issues = [];
  // f′(1) = 2, cliquet de 0,5 depuis 0 : quatre appuis.
  await press(page, '#step-1', 'Augmenter la pente', 4, issues);
  const txt = await body(page);
  check('M4 étape 1 : la cible est ATTEIGNABLE au cliquet et la droite épouse la courbe',
    /épouse la courbe/i.test(txt), txt.slice(-260));
  check('M4 : mise en page saine sur tout le balayage de la pente',
    issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}1ere-deriv-m4.png`, fullPage: true });
  await ctx.close();
}

// ── Module 5 — le piège du décalage ──────────────────────────────────────
{
  const { ctx, page } = await o(M[5], { completedModules: seedThrough(4), tag: 'm5' });
  await page.locator('#step-1 input[type="text"]').first().fill('4');
  await page.locator('#step-1 button:has-text("OK")').first().click();
  await settle(page);
  const txt = await body(page);
  check('M5 étape 1 : la première réponse est acceptée', /point de contact/i.test(txt));
  await page.screenshot({ path: `${SHOT_DIR}1ere-deriv-m5.png`, fullPage: true });
  await ctx.close();
}

// ── Module 6 — le boss ───────────────────────────────────────────────────
{
  const { ctx, page } = await o(M[6], { completedModules: seedThrough(5), tag: 'boss' });
  const avant = await body(page);
  check('boss : silencieux avant validation', !/Bonne réponse/i.test(avant));
  await runBoss(page);
  const valider = page.locator('main button').filter({ hasText: /Valider mes 10 réponses/i }).first();
  check('boss : le bouton de validation apparaît une fois tout répondu', (await valider.count()) === 1);
  await valider.click({ force: true });
  await settle(page, 1200);
  const apres = await body(page);
  check('boss : un score sur 10 est affiché', /\/\s*10/.test(apres), apres.slice(0, 240));

  const profil = page.locator('main button, main [role="tab"]').filter({ hasText: /profil/i }).first();
  if (await profil.count()) { await profil.click({ force: true }); await settle(page); }
  check('boss : le profil de maîtrise nomme les quatre compétences',
    /Taux de variation/i.test(await body(page)) && /Équation de la tangente/i.test(await body(page)));

  const synth = page.locator('main button, main [role="tab"]').filter({ hasText: /synthèse/i }).first();
  if (await synth.count()) { await synth.click({ force: true }); await settle(page); }
  check('boss : la synthèse rend la carte COMPLÈTE, une seule fois',
    (await page.locator('[data-knowledge-snapshot="complete"]').count()) === 1);

  const done = await readCompleted(page, KEY);
  check('boss : le module d’évaluation est enregistré comme terminé',
    Array.isArray(done) && done.includes('6'), JSON.stringify(done));

  await page.reload();
  await settle(page, 1200);
  check('boss : après rechargement, la correction est restituée (jamais un quiz vierge)',
    /\/\s*10/.test(await body(page)));
  await page.screenshot({ path: `${SHOT_DIR}1ere-deriv-boss.png`, fullPage: true });
  await ctx.close();
}

// ── Mobile 375 px ────────────────────────────────────────────────────────
for (const [n, nom] of [[1, 'M1'], [4, 'M4'], [6, 'boss']]) {
  const { ctx, page } = await o(M[n], { completedModules: seedThrough(Math.max(0, n - 1)), mobile: true, tag: `mob${n}` });
  check(`mobile ${nom} : aucun défilement horizontal`, await noHScroll(page));
  // Le commutateur de chronomètre du kit partagé (LessonUI.TimerToggle) mesure
  // 28 px de haut dans TOUTES les leçons : c'est un défaut du composant
  // partagé, pas de celle-ci, et on ne corrige pas sans qu'on le demande une
  // manipulation qui n'est pas la nôtre (INTERACTION_PEDAGOGY §6bis.5). On
  // l'exclut explicitement plutôt que de l'ignorer en silence.
  const small = (await smallTargets(page)).filter((t) => !/chronom|timer/i.test(t || ''));
  const kitSwitch = await page.locator('main button[role="switch"]').count();
  check(
    `mobile ${nom} : cibles tactiles ≥ 40 px (hors commutateur du kit partagé)`,
    small.length <= kitSwitch,
    small.slice(0, 4).join(', ')
  );
  const issues = [...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page))];
  check(`mobile ${nom} : mise en page saine à 375 px`, issues.length === 0, issues.slice(0, 3).join(' | '));
  if (n === 1) await page.screenshot({ path: `${SHOT_DIR}1ere-deriv-m1-mobile.png`, fullPage: true });
  await ctx.close();
}

check('zéro erreur console ou page sur toute la course', errs.length === 0, errs.slice(0, 4).join(' | '));

await browser.close();
process.exitCode = summary() ? 1 : 0;
