// « Fonctions » (4e) — suite navigateur.
//
//   cd apps/web && (setsid nohup npx vite --port 5402 --strictPort > e2e/lesson-kit/shots/vite-5402.log 2>&1 </dev/null &)
//   KIT_BASE=http://localhost:5402 node apps/web/e2e/lesson-kit/4e-fonctions.mjs
//
// Ce que cette suite vérifie et qu'aucune garde de source ne voit :
//   · la leçon rend, et chaque module rend (une leçon non routée retombe sur
//     la page d'accueil SANS erreur — invisible autrement) ;
//   · le labo signature est manipulable aux DEUX bornes du curseur, et reste
//     vivant APRÈS validation (classe de bug « manipulation gelée ») ;
//   · la chaîne se RETOURNE vraiment quand on demande la remontée, et
//     l'aller-retour referme sur le nombre de départ ;
//   · la chaîne « ×0 » affiche sa raison de non-inversibilité ;
//   · un chemin FAUX-EXPRÈS progresse quand même (invariant non bloquant) ;
//   · le testeur de formule NOMME les couples qui démentent une candidate ;
//   · le repère du module 5 ne s'étire pas en colonne (garde d'aspect) ;
//   · la carte des connaissances grandit en cours de leçon, sans fuite ;
//   · le boss va jusqu'à la synthèse, qui porte les 9 connaissances ;
//   · rien ne déborde à 375 px, et la console reste vide.
import {
  launch, open, check, summary, errs, settle, body, noHScroll,
  layoutAudit, aspectAudit, domOverflow, smallTargets, sweepSliders, tapOption, runBoss,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5402';
const LESSON = '/courses/college/4e/proportionnalite_fonctions/fonctions-4e';
const KEY = 'u_anon_smarter_lesson_fonctions-4e';
const SLUGS = [
  'mission-de-depart', 'la-chaine', 'plusieurs-entrees', 'dire-la-machine-en-une-ligne',
  'le-tableau-muet', 'la-formule-devient-un-dessin', 'lenclos-et-la-citerne',
  'mission-finale-latelier',
];
const TOUS = ['0', '1', '2', '3', '4', '5', '6', '7', '00', '01', '02', '03', '04', '05', '06', '07'];

const browser = await launch();
const issues = [];

/* ── 1. L'index et les huit modules rendent ─────────────────────────── */
{
  const { ctx, page } = await open(browser, BASE + LESSON, { tag: 'index' });
  const t = await body(page);
  check('index : le titre de la leçon est rendu', /Fonctions/.test(t), t.slice(0, 200));
  check('index : les 8 modules sont annoncés', /La chaîne/.test(t) && /Mission finale/.test(t));
  await ctx.close();

  for (const slug of SLUGS) {
    const { ctx: c, page: p } = await open(browser, `${BASE}${LESSON}/${slug}`, {
      key: KEY, completedModules: TOUS, tag: slug,
    });
    await p.waitForLoadState('networkidle').catch(() => {});
    await settle(p, 1200);
    const b = await body(p);
    // Une leçon non branchée dans App.jsx rend la LANDING PAGE sans erreur.
    check(`${slug} : rend un vrai module`, b.length > 400 && !/Page introuvable/.test(b) && !/Découvre les maths autrement/.test(b), b.slice(0, 150));
    check(`${slug} : au moins deux commandes`, (await p.locator('main button').count()) >= 2);
    await c.close();
  }
}

/* ── 2. Le labo signature (M1) ───────────────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/la-chaine`, { tag: 'M1' });
  check('M1 : le labo est un groupe nommé', (await page.getByRole('group', { name: /Chaîne de calcul/ }).count()) >= 1);

  // Le curseur, balayé aux DEUX bornes : la mise en page doit tenir partout,
  // y compris pour une entrée négative (sortie à deux chiffres et un moins).
  const range = page.locator('input[type="range"]').first();
  check('M1 : le curseur d’entrée existe', (await range.count()) >= 1);
  for (const v of ['-10', '20', '0', '7']) {
    await range.fill(v);
    await settle(page, 250);
    issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  }
  await sweepSliders(page, issues);

  // Trois entrées distinctes → l'étape 1 se valide.
  for (const v of ['3', '9', '15']) {
    await range.fill(v);
    await settle(page, 220);
  }
  let b = await body(page);
  check('M1 : trois entrées essayées valident l’étape', /La chaîne ne change pas/.test(b), b.slice(0, 400));

  // APRÈS validation, le labo reste manipulable (bug class « gelée »).
  await range.fill('5');
  await settle(page, 250);
  check('M1 : le labo reste vivant après validation', await range.isEnabled());

  // La remontée : la chaîne se retourne, et l'aller-retour referme.
  const remonter = page.locator('main button').filter({ hasText: /Remonter la chaîne/ }).first();
  check('M1 : le bouton « Remonter » existe', (await remonter.count()) >= 1);
  if (await remonter.count()) {
    await remonter.first().click({ force: true });
    await settle(page, 350);
  }
  b = await body(page);
  check('M1 : la remontée affiche l’ordre RETOURNÉ (−2 puis ÷3)',
    /soustraire 2/.test(b) && /diviser par 3/.test(b), b.slice(0, 600));
  check('M1 : l’aller-retour referme sur le nombre de départ',
    /exactement le nombre du départ/.test(b), b.slice(-600));
  check('M1 : le bouton « Remonter » reste actif', await remonter.first().isEnabled());
  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 3. La chaîne « ×0 » dit POURQUOI elle ne se remonte pas ────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/la-chaine`, {
    key: KEY, completedModules: TOUS, tag: 'M1-zero',
  });
  const b = await body(page);
  check('M1 : la chaîne « ×0 » donne sa raison, pas un simple refus',
    /multiplie par 0/.test(b) && /on ne peut plus remonter/.test(b), b.slice(-800));
  // Les deux curseurs (chaîne normale et chaîne ×0) coexistent sans se marcher dessus.
  const ranges = page.locator('input[type="range"]');
  check('M1 : les deux chaînes ont chacune leur curseur', (await ranges.count()) >= 2);
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 4. Chemin FAUX-EXPRÈS : l'invariant non bloquant ───────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/plusieurs-entrees`, {
    key: KEY, completedModules: ['0', '1', '2'], tag: 'M2-faux',
  });
  await settle(page, 700);
  // On répond FAUX à la question de l'étape 3 (option 1 au lieu de 0). On la
  // vise par son ÉNONCÉ : `tapOption` balaie depuis la fin de la page et
  // toucherait la question de l'étape 5, ou les chips du labo — qui portent
  // eux aussi `aria-pressed`.
  const q3 = page.locator('main div[role="group"]')
    .filter({ hasText: 'Une sortie différente, car la chaîne a déjà servi' })
    .last();
  check('M2 : la question de l’étape 3 est atteignable', (await q3.count()) >= 1);
  if (await q3.count()) {
    await q3.locator('button[aria-pressed]').nth(1).click({ force: true });
    await settle(page, 600);
  }
  const main = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M2 : une réponse fausse affiche la correction',
    /Une chaîne est une règle/.test(main), main.slice(-600));
  // Non bloquant : l'étape est validée malgré l'erreur, donc la brique
  // suivante (posée sous la question) est rendue.
  check('M2 : et l’étape se valide quand même (non bloquant)',
    /data-knowledge-brick/.test(await page.locator('main').first().innerHTML()), main.slice(-400));
  await ctx.close();
}

/* ── 5. Le testeur de formule NOMME ce qui dément (M4) ──────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-tableau-muet`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4'], tag: 'M4',
  });
  check('M4 : le testeur est un groupe nommé',
    (await page.getByRole('group', { name: /Tester une écriture/ }).count()) >= 1);

  // On choisit une candidate FAUSSE : le rapport doit nommer les couples.
  const candidates = page.locator('main button').filter({ hasText: /x/ });
  const n = await candidates.count();
  check('M4 : des candidates sont proposées', n >= 4, `n=${n}`);
  // La première candidate du premier testeur est « 5x », qui est fausse.
  await candidates.first().click({ force: true });
  await settle(page, 350);
  let b = await body(page);
  check('M4 : le rapport NOMME les couples qui démentent',
    /le tableau dit/.test(b) && /ta règle dit/.test(b), b.slice(-800));
  check('M4 : le verdict est chiffré (accord / total)', /\d\s*\/\s*4/.test(b), b.slice(-500));
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 6. Le repère du module 5 : cadre dérivé, aspect sain ───────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/la-formule-devient-un-dessin`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4', '5'], tag: 'M5',
  });
  await settle(page, 1000);
  // Poser tous les points de la première machine.
  for (let i = 0; i < 6; i += 1) {
    const poser = page.locator('main button').filter({ hasText: /Poser le point suivant/ }).first();
    if (!(await poser.count())) break;
    await poser.click({ force: true });
    await settle(page, 300);
  }
  await settle(page, 400);
  const b = await body(page);
  check('M5 : les six points sont posés et le trait apparaît',
    /points sont posés/.test(b), b.slice(0, 700));
  // Le pas cité par le module vient du MÊME calcul que le repère.
  check('M5 : le pas du repère est affiché', /pas vertical/.test(b), b.slice(0, 700));
  // Garde d'aspect : un CoordPlane sans unitY s'étire en colonne.
  issues.push(...(await aspectAudit(page)), ...(await layoutAudit(page)), ...(await domOverflow(page)));
  // Rejouable : on peut tout recommencer.
  const rejouer = page.locator('main button').filter({ hasText: /Recommencer/ }).first();
  check('M5 : la manipulation est rejouable', (await rejouer.count()) >= 1);
  if (await rejouer.count()) {
    check('M5 : le bouton « Recommencer » est actif', await rejouer.isEnabled());
  }
  await ctx.close();
}

/* ── 7. La carte des connaissances ──────────────────────────────────── */
{
  // Avant tout geste : la carte ne doit RIEN contenir de la leçon.
  const { ctx, page } = await open(browser, BASE + LESSON, { tag: 'carte-vide' });
  await settle(page, 600);
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
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-tableau-muet`, {
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
      ids.includes('chaine-orientee') && ids.includes('remonter-la-chaine')
      && ids.includes('formule-qui-resume') && ids.includes('du-tableau-a-la-formule'),
      ids.join(','));
    check('carte : AUCUNE fuite du module 5 (le dessin)',
      !ids.includes('formule-en-dessin'), ids.join(','));
    check('carte : AUCUNE fuite du module 6 (la modélisation)',
      !ids.includes('modeliser-une-situation') && !ids.includes('dependance-qui-diminue'),
      ids.join(','));
  }
  await ctx.close();
}

/* ── 8. Le boss, jusqu'à la synthèse ────────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/mission-finale-latelier`, {
    key: KEY, completedModules: TOUS, tag: 'boss',
  });
  let b = await body(page);
  check('boss : les dix épreuves sont là', /Épreuve|épreuve/.test(b) && (await page.locator('main div[role="group"]').count()) >= 8);
  check('boss : aucune correction avant la soumission', !/Bonne réponse|Réponse juste/.test(b), b.slice(0, 200));

  await runBoss(page);
  // Le libellé porte le NOMBRE d'épreuves (« Valider mes 10 réponses »).
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
  check('boss : la carte complète porte les 9 connaissances de la leçon', items === 9, `items=${items}`);
  await ctx.close();
}

/* ── 9. Périmètre : rien de la 3e à l'écran ─────────────────────────── */
{
  const interdits = /\bf\s*\(\s*x\s*\)|antécédent|fonction affine|fonction linéaire|coefficient directeur|ordonnée à l’origine/i;
  for (const slug of SLUGS) {
    const { ctx, page } = await open(browser, `${BASE}${LESSON}/${slug}`, {
      key: KEY, completedModules: TOUS, tag: `scope-${slug}`,
    });
    const b = await body(page);
    const fuite = b.match(interdits);
    check(`${slug} : aucune notion de 3e à l’écran`, !fuite, fuite ? fuite[0] : '');
    await ctx.close();
  }
}

/* ── 10. Mobile 375 px ──────────────────────────────────────────────── */
{
  for (const slug of ['la-chaine', 'la-formule-devient-un-dessin', 'lenclos-et-la-citerne']) {
    const { ctx, page } = await open(browser, `${BASE}${LESSON}/${slug}`, {
      key: KEY, completedModules: TOUS, mobile: true, tag: `mob-${slug}`,
    });
    check(`mobile ${slug} : aucun défilement horizontal`, await noHScroll(page));
    const petits = await smallTargets(page);
    check(`mobile ${slug} : cibles tactiles ≥ 40 px`, petits.length === 0, petits.join(', '));
    issues.push(...(await domOverflow(page)), ...(await aspectAudit(page)));
    await ctx.close();
  }
}

/* ── 11. Verdicts globaux ───────────────────────────────────────────── */
check('mise en page : aucun débordement ni chevauchement', issues.length === 0, issues.slice(0, 6).join(' | '));
check('console : aucune erreur sur tout le parcours', errs.length === 0, errs.slice(0, 5).join(' | '));

await browser.close();
process.exit(summary());
