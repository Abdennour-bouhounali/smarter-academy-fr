// « Grandeurs composées » (4e) — suite navigateur.
//
//   cd apps/web && (setsid nohup npx vite --port 5411 --strictPort > e2e/lesson-kit/shots/vite-5411.log 2>&1 </dev/null &)
//   KIT_BASE=http://localhost:5411 node apps/web/e2e/lesson-kit/4e-grandeurs.mjs
//
// Ce que cette suite vérifie et qu'aucune garde de source ne voit :
//   · la leçon rend, et chaque module rend (une leçon non routée retombe sur
//     la page d'accueil SANS erreur — invisible autrement) ;
//   · le tableau de bord signature est manipulable, et le reste APRÈS
//     validation ;
//   · les TROIS cadrans ne se contredisent jamais : le calculé suit toujours,
//     et il n'y a jamais qu'UN seul curseur de réglage ;
//   · l'aha est atteignable : les deux réponses à « si je double » diffèrent ;
//   · un chemin FAUX-EXPRÈS progresse quand même (invariant non bloquant) ;
//   · la carte des connaissances grandit en cours de module, sans fuite ;
//   · le boss va jusqu'à la synthèse ;
//   · rien ne déborde à 375 px, et la console reste vide.
import {
  launch, open, check, summary, errs, settle, body, noHScroll,
  layoutAudit, aspectAudit, domOverflow, smallTargets, sweepSliders, tapOption, runBoss,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5411';
const LESSON = '/courses/college/4e/proportionnalite_fonctions/grandeurs-composees-4e';
const KEY = 'u_anon_smarter_lesson_grandeurs-composees-4e';
const SLUGS = [
  'mission-de-depart', 'le-tableau-de-bord', 'par-ou-fois', 'le-robinet',
  'mille-metres-en-trois-mille-six-cents-secondes', 'lire-une-formule',
  'le-carnet-de-route', 'mission-finale-le-grand-trajet',
];
const TOUS = ['0', '1', '2', '3', '4', '5', '6', '7', '00', '01', '02', '03', '04', '05', '06', '07'];

const browser = await launch();
const issues = [];

/**
 * `open()` attend la disparition du texte de chargement, mais PAS celle du
 * spinner racine — et plusieurs sessions concurrentes éditent le dépôt pendant
 * que cette suite tourne, ce qui provoque des rechargements HMR au milieu d'une
 * navigation. On attend donc que le contenu du module soit RÉELLEMENT monté
 * avant de mesurer quoi que ce soit.
 */
async function ouvrir(url, opts = {}) {
  for (let essai = 0; essai < 3; essai += 1) {
    const { ctx, page } = await open(browser, url, opts);
    await page.waitForFunction(
      () => !document.querySelector('.root-spinner') && document.querySelector('main'),
      null, { timeout: 15000 },
    ).catch(() => {});
    const t = await body(page);
    if (t.length > 400 && !/root-spinner/.test(t)) return { ctx, page };
    await ctx.close();
  }
  return open(browser, url, opts);
}

/* ── 1. L'index et les huit modules rendent ─────────────────────────── */
{
  const { ctx, page } = await ouvrir(BASE + LESSON, { tag: 'index' });
  const t = await body(page);
  check('index : le titre de la leçon est rendu', /Grandeurs composées/.test(t), t.slice(0, 200));
  check('index : les 8 modules sont annoncés',
    /Le tableau de bord/.test(t) && /Le robinet/.test(t) && /Mission finale/.test(t));
  await ctx.close();

  for (const slug of SLUGS) {
    const { ctx: c, page: p } = await ouvrir(`${BASE}${LESSON}/${slug}`, {
      key: KEY, completedModules: TOUS, tag: slug,
    });
    const b = await body(p);
    // Une leçon non branchée dans App.jsx rend la LANDING PAGE sans erreur.
    check(`${slug} : rend un vrai module`,
      b.length > 400 && !/Page introuvable/.test(b) && !/Découvre les maths autrement/.test(b),
      b.slice(0, 150));
    check(`${slug} : au moins deux commandes`, (await p.locator('main button').count()) >= 2);
    await c.close();
  }
}

/* ── 2. Le tableau de bord signature (M1) ───────────────────────────── */
{
  const { ctx, page } = await ouvrir(`${BASE}${LESSON}/le-tableau-de-bord`, { tag: 'M1' });
  check('M1 : le labo est un groupe nommé',
    (await page.getByRole('group', { name: /Tableau de bord du cycliste/ }).count()) >= 1);

  // LES TROIS CADRANS SONT LÀ, et un seul est « calculé ». Le labo est rendu
  // à plusieurs étapes : on compte PAR INSTANCE, via le premier groupe.
  const labo1 = page.getByRole('group', { name: /Tableau de bord du cycliste/ }).first();
  check('M1 : les trois cadrans sont montés',
    (await labo1.locator('[data-cadran]').count()) === 3);
  check('M1 : exactement un cadran est calculé',
    (await labo1.locator('[data-role="calcule"]').count()) === 1);
  check('M1 : exactement un cadran est fixé',
    (await labo1.locator('[data-role="fixe"]').count()) === 1);

  // UN SEUL curseur PAR INSTANCE de labo : le cadran calculé n'est pas
  // réglable (il est ABSENT, pas grisé — un `disabled` serait une
  // manipulation gelée). Les identifiants viennent de useId : ils sont donc
  // uniques même quand le labo est rendu à plusieurs étapes.
  const ids = await page.locator('main input[type="range"]').evaluateAll(
    (els) => els.map((e) => e.id)
  );
  check('M1 : chaque curseur a un identifiant UNIQUE',
    new Set(ids).size === ids.length, ids.join(','));
  check('M1 : un seul curseur par instance du labo',
    ids.length === (await page.getByRole('group', { name: /Tableau de bord du cycliste/ }).count()),
    ids.join(','));

  // Le curseur de l'étape courante, balayé aux deux bornes.
  const range = page.locator('main input[type="range"]').first();
  // Le curseur ouvre sur la DURÉE : bornes 0,25 h à 6 h, pas de 0,25.
  for (const v of ['0.25', '6', '1.5']) {
    await range.fill(v);
    await settle(page, 250);
    issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  }
  await sweepSliders(page, issues);

  // Quatre réglages valident l'étape 1.
  for (const v of ['0.5', '3', '2', '1.5']) {
    await range.fill(v);
    await settle(page, 200);
  }
  let b = await body(page);
  check('M1 : quatre réglages valident l’étape', /Deux cadrans suffisent/.test(b), b.slice(0, 300));

  // L'AHA : les deux réponses à « si je double » sont affichées, et DIFFÈRENT.
  check('M1 : l’encadré « si je double » apparaît',
    (await page.locator('[data-doublement]').count()) >= 1);
  // L'AHA : le MÊME geste, deux fixations, deux effets OPPOSÉS. Le labo ouvre
  // sur « je règle la durée » précisément parce que c'est là que le contraste
  // existe — régler la distance donnerait ×2 des deux côtés.
  const encadre = (await page.locator('[data-doublement]').first().textContent()).replace(/\s+/g, ' ');
  const facteurs = [...encadre.matchAll(/×\s*([\d,]+)/g)].map((m) => m[1]);
  check('M1 : l’encadré donne DEUX facteurs, et ils diffèrent',
    facteurs.length === 2 && facteurs[0] !== facteurs[1], encadre.slice(0, 300));
  check('M1 : le labo se DÉCLARE en contraste au réglage par défaut',
    (await page.locator('[data-doublement]').first().getAttribute('data-contraste')) === 'true',
    encadre.slice(0, 300));
  check('M1 : la phrase de l’aha est atteignable',
    /deux effets opposés/.test(encadre), encadre.slice(0, 300));

  // …et quand le contraste N'EXISTE PAS (régler la distance), le labo le DIT
  // au lieu de faire semblant : c'est l'invariant « la figure ne ment jamais ».
  // La rangée « Je règle : » est le conteneur du texte ; on y prend le bouton
  // « Distance » plutôt qu'un index global, qui attraperait la rangée « fixe ».
  const rangeeReglage = page.locator('div').filter({ hasText: /^Je règle :/ }).last();
  const reglerDistance = rangeeReglage.locator('button').filter({ hasText: /^Distance$/ }).first();
  if (await reglerDistance.count()) {
    await reglerDistance.click({ force: true });
    await settle(page, 600);
    const e2 = (await page.locator('[data-doublement]').first().textContent()).replace(/\s+/g, ' ');
    check('M1 : sans contraste, le labo l’avoue au lieu de mentir',
      /les deux réponses coïncident/i.test(e2)
      || (await page.locator('[data-doublement]').first().getAttribute('data-contraste')) === 'false',
      e2.slice(0, 300));
    // on revient au réglage qui porte l'aha
    const reglerDuree = rangeeReglage.locator('button').filter({ hasText: /^Durée$/ }).first();
    if (await reglerDuree.count()) { await reglerDuree.click({ force: true }); await settle(page, 400); }
  }

  // APRÈS validation, le labo reste manipulable (bug class « gelée »).
  await range.fill('2.5');
  await settle(page, 250);
  check('M1 : le curseur reste vivant après validation', await range.isEnabled());
  const boutonsFixe = page.locator('main button').filter({ hasText: /^(Distance|Durée|Vitesse)$/ });
  check('M1 : les boutons de choix restent actifs',
    await boutonsFixe.first().isEnabled());

  // CHANGER LA GRANDEUR FIXÉE : le troisième cadran change de rôle, et il
  // n'y a toujours qu'un seul calculé — les cadrans ne peuvent pas se
  // contredire.
  const rangeeFixe = page.locator('div').filter({ hasText: /^Quelle grandeur tiens-tu fixe \?/ }).last();
  const fixerVitesse = rangeeFixe.locator('button').filter({ hasText: /^Vitesse$/ }).first();
  if (await fixerVitesse.count()) { await fixerVitesse.click({ force: true }); }
  await settle(page, 600);
  check('M1 : après changement, toujours UN seul cadran calculé',
    (await labo1.locator('[data-role="calcule"]').count()) === 1);
  const ids2 = await page.locator('main input[type="range"]').evaluateAll(
    (els) => els.map((e) => e.id)
  );
  check('M1 : les identifiants restent uniques après changement',
    new Set(ids2).size === ids2.length, ids2.join(','));

  // Les durées s'écrivent en heures et minutes, jamais « 1,5 h » tout seul.
  b = await body(page);
  check('M1 : les durées sont écrites en h et min', /\d+\s*h\s*\d{2}\s*min|\d+\s*min\b|\d+\s*h\b/.test(b), b.slice(0, 400));
  check('M1 : aucune durée absurde « 60 min »', !/\b60 min/.test(b), b.slice(0, 400));

  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 3. Le trieur d'unités (M2) et le robinet (M3) ──────────────────── */
{
  const { ctx, page } = await ouvrir(`${BASE}${LESSON}/par-ou-fois`, {
    key: KEY, completedModules: ['0', '1'], tag: 'M2',
  });
  check('M2 : le trieur est un groupe nommé',
    (await page.getByRole('group', { name: /Trier les unités composées/ }).count()) >= 1);
  check('M2 : les deux bacs existent', (await page.locator('[data-bac]').count()) === 2);

  // Ranger une étiquette : choisir puis poser.
  const etiquette = page.locator('main button').filter({ hasText: /km\/h/ }).first();
  if (await etiquette.count()) {
    await etiquette.click({ force: true });
    await settle(page, 250);
    const poser = page.locator('main button').filter({ hasText: /Poser .* ici/ }).first();
    if (await poser.count()) { await poser.click({ force: true }); await settle(page, 300); }
  }
  check('M2 : l’étiquette rejoint un bac',
    (await page.locator('[data-etiquette]').count()) >= 1);
  // La LECTURE apparaît : c'est elle qui enseigne, pas un verdict.
  const b = await body(page);
  check('M2 : la lecture à voix haute est affichée',
    /des kilomètres par heure/.test(b), b.slice(-400));
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}
{
  const { ctx, page } = await ouvrir(`${BASE}${LESSON}/le-robinet`, {
    key: KEY, completedModules: ['0', '1', '2'], tag: 'M3',
  });
  check('M3 : le robinet est un groupe nommé',
    (await page.getByRole('group', { name: /Robinet et réservoir/ }).count()) >= 1);
  const rangesM3 = page.locator('main input[type="range"]');
  const idsM3 = await rangesM3.evaluateAll((els) => els.map((e) => e.id));
  check('M3 : les curseurs ont des identifiants UNIQUES',
    idsM3.length >= 2 && new Set(idsM3).size === idsM3.length, idsM3.join(','));
  const debit = rangesM3.nth(0);
  const duree = rangesM3.nth(1);
  check('M3 : les deux curseurs existent', (await rangesM3.count()) >= 2);

  // Le volume est CALCULÉ : jamais de curseur pour lui.
  await debit.fill('30'); await duree.fill('30'); await settle(page, 300);
  let b = await body(page);
  check('M3 : le débordement est ANNONCÉ, jamais caché',
    /déborde/.test(b), b.slice(-400));
  await debit.fill('12'); await duree.fill('25'); await settle(page, 300);
  b = await body(page);
  check('M3 : 12 L/min pendant 25 min donnent exactement 300 L',
    /300 L/.test(b), b.slice(-400));
  await sweepSliders(page, issues);
  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 4. Chemin FAUX-EXPRÈS : l'invariant non bloquant ───────────────── */
{
  const { ctx, page } = await ouvrir(`${BASE}${LESSON}/par-ou-fois`, {
    key: KEY, completedModules: ['0', '1'], tag: 'M2-faux',
  });
  // L'étape 2 est verrouillée tant que les cinq étiquettes ne sont pas
  // rangées : on les range d'abord (peu importe le bac — rien ne bloque),
  // PUIS on répond faux à la question de l'étape 2.
  for (let i = 0; i < 5; i += 1) {
    const et = page.locator('main button').filter({ hasText: /^(km\/h|kWh|L\/min|ouvriers·jours|g\/cm³)/ }).first();
    if (!(await et.count())) break;
    await et.click({ force: true });
    await settle(page, 200);
    const poser = page.locator('main button').filter({ hasText: /Poser .* ici/ }).first();
    if (await poser.count()) { await poser.click({ force: true }); await settle(page, 250); }
  }
  await settle(page, 400);
  check('M2 : les cinq étiquettes sont rangées, l’étape 1 est validée',
    (await page.locator('[data-etiquette]').count()) === 5,
    String(await page.locator('[data-etiquette]').count()));
  // On répond FAUX à la question de l'étape 2 (option d'index 1).
  await tapOption(page, 'main', 1);
  await settle(page, 500);
  const main = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M2 : une réponse fausse affiche la correction',
    /le mot « par » annonce toujours/.test(main), main.slice(-500));
  // Non bloquant : l'étape est validée malgré l'erreur, donc la brique
  // suivante (posée sous la question) est rendue.
  check('M2 : et l’étape se valide quand même (non bloquant)',
    /data-knowledge-brick/.test(await page.locator('main').first().innerHTML()), main.slice(-300));
  await ctx.close();
}

/* ── 5. La carte des connaissances ──────────────────────────────────── */
{
  // Avant tout geste : la carte ne doit RIEN contenir de la leçon.
  const { ctx, page } = await ouvrir(BASE + LESSON, { tag: 'carte-vide' });
  const trigger = page.locator('button[data-km-trigger]');
  check('carte : le déclencheur est monté', (await trigger.count()) >= 1);
  if (await trigger.count()) {
    await trigger.first().click();
    await settle(page);
    const items = await page.locator('#km-root [data-km-item]').count();
    check('carte : vide avant tout module validé', items === 0, `items=${items}`);
  }
  await ctx.close();
}
{
  // Modules 1 à 4 semés : la carte contient leurs items, et RIEN du module 5.
  const { ctx, page } = await ouvrir(`${BASE}${LESSON}/mille-metres-en-trois-mille-six-cents-secondes`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4'], tag: 'carte-4',
  });
  const trigger = page.locator('button[data-km-trigger]');
  if (await trigger.count()) {
    await trigger.first().click();
    await settle(page);
    const ids = await page.locator('#km-root [data-km-item]').evaluateAll(
      (els) => els.map((e) => e.getAttribute('data-km-item'))
    );
    check('carte : contient les acquis des modules 1 à 4',
      ids.includes('trois-grandeurs-liees') && ids.includes('grandeur-quotient')
      && ids.includes('debit') && ids.includes('changer-unite'),
      ids.join(','));
    check('carte : AUCUNE fuite du module 5 (lire une formule)',
      !ids.includes('lire-une-formule'), ids.join(','));
  }
  await ctx.close();
}

/* ── 6. La formule retournée (M5) ───────────────────────────────────── */
{
  const { ctx, page } = await ouvrir(`${BASE}${LESSON}/lire-une-formule`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4'], tag: 'M5',
  });
  check('M5 : le labo est un groupe nommé',
    (await page.getByRole('group', { name: /Retourner la formule/ }).count()) >= 1);
  // Les trois écritures se succèdent, et la vérification ne ment jamais.
  for (const nom of ['la durée', 'la vitesse', 'la distance']) {
    const btn = page.locator('main button').filter({ hasText: new RegExp(`^${nom}$`) }).first();
    if (await btn.count()) { await btn.click({ force: true }); await settle(page, 400); }
    const b = await body(page);
    check(`M5 : l’écriture pour ${nom} est cohérente avec la vérification`,
      /On retombe bien dessus/.test(b), b.slice(-400));
    issues.push(...(await domOverflow(page)));
  }
  await ctx.close();
}

/* ── 7. Le boss, jusqu'à la synthèse ────────────────────────────────── */
{
  const { ctx, page } = await ouvrir(`${BASE}${LESSON}/mission-finale-le-grand-trajet`, {
    key: KEY, completedModules: TOUS, tag: 'boss',
  });
  await page.waitForFunction(
    () => document.querySelectorAll('main div[role="group"]').length >= 8,
    null, { timeout: 15000 },
  ).catch(() => {});
  let b = await body(page);
  check('boss : les dix épreuves sont là',
    /Épreuve|épreuve/.test(b) && (await page.locator('main div[role="group"]').count()) >= 8,
    `groupes=${await page.locator('main div[role="group"]').count()}`);
  check('boss : aucune correction avant la soumission',
    !/Bonne réponse|Réponse juste/.test(b), b.slice(0, 200));

  await runBoss(page);
  const submit = page.locator('main button').filter({ hasText: /Valider mes \d+ réponses|Soumettre/ }).first();
  if (await submit.count()) { await submit.click({ force: true }); await settle(page, 1400); }
  b = await body(page);
  check('boss : le score apparaît après soumission', /\/\s*10|score|Profil|profil/i.test(b), b.slice(-400));

  const profil = page.locator('main button').filter({ hasText: /Voir mon profil/i }).first();
  if (await profil.count()) { await profil.click({ force: true }); await settle(page, 1200); }
  const synth = page.locator('main button').filter({ hasText: /Passer à la synthèse/i }).first();
  if (await synth.count()) { await synth.click({ force: true }); await settle(page, 1400); }
  const complete = await page.locator('[data-knowledge-snapshot="complete"]').count();
  const items = await page.locator('[data-km-item]').count();
  check('boss : la synthèse rend la carte COMPLÈTE', complete >= 1, `snapshots=${complete}`);
  check('boss : la carte complète porte les 6 connaissances de la leçon', items === 6, `items=${items}`);
  await ctx.close();
}

/* ── 8. Mobile 375 px ───────────────────────────────────────────────── */
{
  for (const slug of ['le-tableau-de-bord', 'le-robinet', 'lire-une-formule']) {
    const { ctx, page } = await ouvrir(`${BASE}${LESSON}/${slug}`, {
      key: KEY, completedModules: TOUS, mobile: true, tag: `mob-${slug}`,
    });
    check(`mobile ${slug} : aucun défilement horizontal`, await noHScroll(page));
    const petits = await smallTargets(page);
    check(`mobile ${slug} : cibles tactiles ≥ 40 px`, petits.length === 0, petits.join(', '));
    issues.push(...(await domOverflow(page)));
    await ctx.close();
  }
}

/* ── 9. Verdicts globaux ────────────────────────────────────────────── */
check('mise en page : aucun débordement ni chevauchement', issues.length === 0, issues.slice(0, 6).join(' | '));
check('console : aucune erreur sur tout le parcours', errs.length === 0, errs.slice(0, 5).join(' | '));

await browser.close();
process.exit(summary());
