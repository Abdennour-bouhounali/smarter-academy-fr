// « Proportionnalité » (4e) — suite navigateur.
//
//   cd apps/web && (setsid nohup npx vite --port 5401 --strictPort > e2e/lesson-kit/shots/vite-5401.log 2>&1 </dev/null &)
//   KIT_BASE=http://localhost:5401 node apps/web/e2e/lesson-kit/4e-proportionnalite.mjs
//
// Ce que cette suite vérifie et qu'aucune garde de source ne voit :
//   · la leçon rend, et chaque module rend (une leçon non routée retombe sur
//     la page d'accueil SANS erreur — invisible autrement) ;
//   · le labo signature est manipulable, et le reste APRÈS validation ;
//   · les cinq lectures se dévoilent, et la cinquième existe vraiment ;
//   · un chemin FAUX-EXPRÈS progresse quand même (invariant non bloquant) ;
//   · la carte des connaissances grandit en cours de module, sans fuite ;
//   · le boss va jusqu'à la synthèse ;
//   · rien ne déborde à 375 px, et la console reste vide.
import {
  launch, open, check, summary, errs, settle, body, noHScroll,
  layoutAudit, aspectAudit, domOverflow, smallTargets, sweepSliders, tapOption, runBoss,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5401';
const LESSON = '/courses/college/4e/proportionnalite_fonctions/proportionnalite-4e';
const KEY = 'u_anon_smarter_lesson_proportionnalite-4e';
const SLUGS = [
  'mission-de-depart', 'la-fabrique', 'la-case-vide', 'le-prix-qui-change',
  'revenir-en-arriere', 'le-graphique-decide', 'latelier', 'mission-finale-la-boutique',
];
const TOUS = ['0', '1', '2', '3', '4', '5', '6', '7', '00', '01', '02', '03', '04', '05', '06', '07'];

const browser = await launch();
const issues = [];

/* ── 1. L'index et les huit modules rendent ─────────────────────────── */
{
  const { ctx, page } = await open(browser, BASE + LESSON, { tag: 'index' });
  const t = await body(page);
  check('index : le titre de la leçon est rendu', /Proportionnalité/.test(t), t.slice(0, 200));
  check('index : les 8 modules sont annoncés', /La fabrique/.test(t) && /Mission finale/.test(t));
  await ctx.close();

  for (const slug of SLUGS) {
    const { ctx: c, page: p } = await open(browser, `${BASE}${LESSON}/${slug}`, {
      key: KEY, completedModules: TOUS, tag: slug,
    });
    const b = await body(p);
    // Une leçon non branchée dans App.jsx rend la LANDING PAGE sans erreur.
    check(`${slug} : rend un vrai module`, b.length > 400 && !/Page introuvable/.test(b) && !/Découvre les maths autrement/.test(b), b.slice(0, 150));
    check(`${slug} : au moins deux commandes`, (await p.locator('main button').count()) >= 2);
    await c.close();
  }
}

/* ── 2. Le labo signature (M1) ───────────────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/la-fabrique`, { tag: 'M1' });
  check('M1 : le labo est un groupe nommé', (await page.getByRole('group', { name: /Atelier d’affiches/ }).count()) >= 1);

  // Le curseur, balayé aux deux bornes : la mise en page doit tenir partout.
  const range = page.locator('input[type="range"]').first();
  check('M1 : le curseur d’affiches existe', (await range.count()) >= 1);
  for (const v of ['0', '20', '9']) {
    await range.fill(v);
    await settle(page, 250);
    issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  }
  await sweepSliders(page, issues);

  // Noter trois commandes distinctes → l'étape 1 se valide.
  const slider = page.locator('input[type="range"]').first();
  for (const v of ['3', '7', '12']) {
    await slider.fill(v);
    await settle(page, 200);
    await page.locator('button:has-text("Noter cette commande")').first().click();
    await settle(page, 250);
  }
  let b = await body(page);
  check('M1 : trois commandes notées valident l’étape', /Trois commandes chez/.test(b), b.slice(0, 200));

  // APRÈS validation, le labo reste manipulable (bug class « gelée »).
  await slider.fill('5');
  await settle(page, 250);
  check('M1 : le labo reste vivant après validation', await slider.isEnabled());
  check('M1 : le bouton « Noter » reste actif', await page.locator('button:has-text("Noter cette commande")').first().isEnabled());

  // Les cinq lectures se dévoilent une à une, et la cinquième existe.
  for (let i = 0; i < 5; i += 1) {
    const btn = page.locator('main button').filter({ hasText: /Les affiches|La table|Le prix d’UNE|Le coefficient|Le nuage/ }).nth(i);
    if (await btn.count()) await btn.click({ force: true }).catch(() => {});
    await settle(page, 200);
  }
  b = await body(page);
  check('M1 : la cinquième lecture (le nuage) est atteignable', /nuage de points/i.test(b), b.slice(-400));
  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 3. Chemin FAUX-EXPRÈS : l'invariant non bloquant ───────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-prix-qui-change`, {
    key: KEY, completedModules: ['0', '1', '2'], tag: 'M3-faux',
  });
  // On glisse d'abord dans les deux sens pour valider l'étape 1, puis on
  // répond FAUX à la question de l'étape 2 (option « 0,2 »).
  const sl = page.locator('input[type="range"]').first();
  await sl.fill('30'); await settle(page, 250);
  await sl.fill('-30'); await settle(page, 250);
  await tapOption(page, 'main', 1);
  const main = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M3 : une réponse fausse affiche la correction',
    /Le prix de départ compte pour 1/.test(main), main.slice(-500));
  // Non bloquant : l'étape est validée malgré l'erreur, donc la brique
  // suivante (posée sous la question) est rendue.
  check('M3 : et l’étape se valide quand même (non bloquant)',
    /data-knowledge-brick/.test(await page.locator('main').first().innerHTML()), main.slice(-300));
  await ctx.close();
}

/* ── 4. La carte des connaissances ──────────────────────────────────── */
{
  // Avant tout geste : la carte du module 1 ne doit RIEN contenir de la leçon.
  const { ctx, page } = await open(browser, BASE + LESSON, { tag: 'carte-vide' });
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
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/revenir-en-arriere`, {
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
      ids.includes('cinq-lectures') && ids.includes('produit-en-croix') && ids.includes('coefficient-multiplicateur'),
      ids.join(','));
    check('carte : AUCUNE fuite du module 5 (critère graphique)',
      !ids.includes('critere-graphique'), ids.join(','));
  }
  await ctx.close();
}

/* ── 5. Le boss, jusqu'à la synthèse ────────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/mission-finale-la-boutique`, {
    key: KEY, completedModules: TOUS, tag: 'boss',
  });
  let b = await body(page);
  check('boss : les dix épreuves sont là', /Épreuve|épreuve/.test(b) && (await page.locator('main div[role="group"]').count()) >= 8);
  check('boss : aucune correction avant la soumission', !/Bonne réponse|Réponse juste/.test(b), b.slice(0, 200));

  await runBoss(page);
  // Le libellé porte le NOMBRE d'épreuves (« Valider mes 10 réponses ») :
  // une regexp sur « Valider mes réponses » ne l'attrape pas.
  const submit = page.locator('main button').filter({ hasText: /Valider mes \d+ réponses|Soumettre/ }).first();
  if (await submit.count()) { await submit.click({ force: true }); await settle(page, 1400); }
  b = await body(page);
  check('boss : le score apparaît après soumission', /\/\s*10|score|Profil|profil/i.test(b), b.slice(-400));

  // Le parcours réel : « Voir mon profil de maîtrise » → « Passer à la
  // synthèse → ». Les onglets « Mon profil » / « Synthèse » de l'en-tête
  // existent aussi, mais cliquer l'onglet ne déroule pas le parcours.
  const profil = page.locator('main button').filter({ hasText: /Voir mon profil/i }).first();
  if (await profil.count()) { await profil.click({ force: true }); await settle(page, 1200); }
  const synth = page.locator('main button').filter({ hasText: /Passer à la synthèse/i }).first();
  if (await synth.count()) { await synth.click({ force: true }); await settle(page, 1400); }
  const complete = await page.locator('[data-knowledge-snapshot="complete"]').count();
  const items = await page.locator('[data-km-item]').count();
  check('boss : la synthèse rend la carte COMPLÈTE', complete >= 1, `snapshots=${complete}`);
  check('boss : la carte complète porte les 7 connaissances de la leçon', items === 7, `items=${items}`);
  await ctx.close();
}

/* ── 6. Mobile 375 px ───────────────────────────────────────────────── */
{
  for (const slug of ['la-fabrique', 'le-graphique-decide']) {
    const { ctx, page } = await open(browser, `${BASE}${LESSON}/${slug}`, {
      key: KEY, completedModules: TOUS, mobile: true, tag: `mob-${slug}`,
    });
    check(`mobile ${slug} : aucun défilement horizontal`, await noHScroll(page));
    const petits = await smallTargets(page);
    check(`mobile ${slug} : cibles tactiles ≥ 40 px`, petits.length === 0, petits.join(', '));
    issues.push(...(await domOverflow(page)));
    await ctx.close();
  }
}

/* ── 7. Verdicts globaux ────────────────────────────────────────────── */
check('mise en page : aucun débordement ni chevauchement', issues.length === 0, issues.slice(0, 6).join(' | '));
check('console : aucune erreur sur tout le parcours', errs.length === 0, errs.slice(0, 5).join(' | '));

await browser.close();
process.exit(summary());
