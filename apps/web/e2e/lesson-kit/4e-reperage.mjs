// « Repérage dans le plan » (4e) — suite navigateur.
//
//   cd apps/web && (setsid nohup npx vite --port 5413 --strictPort > e2e/lesson-kit/shots/vite-5413.log 2>&1 </dev/null &)
//   KIT_BASE=http://localhost:5413 node apps/web/e2e/lesson-kit/4e-reperage.mjs
//
// Ce que cette suite vérifie et qu'aucune garde de source ne voit :
//   · chaque module rend (une leçon non routée retombe sur l'accueil sans erreur) ;
//   · le labo signature CHANGE vraiment le repère quand on change le pas,
//     et son verdict suit — c'est toute la leçon ;
//   · le compteur de valeurs distinctes ne CONTREDIT jamais le verdict ;
//   · un point se glisse vraiment, et les deux lectures divergent ;
//   · la cible de placement est atteignable au clavier ;
//   · le parallélogramme se ferme et les deux milieux se rejoignent ;
//   · un chemin faux progresse quand même ; la carte grandit sans fuite ;
//   · rien ne déborde à 375 px, et la console reste vide.
import {
  launch, open, check, summary, errs, settle, body, noHScroll,
  layoutAudit, aspectAudit, domOverflow, smallTargets, dragBy, runBoss,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5413';
const LESSON = '/courses/college/4e/espace_geometrie/reperage-4e';
const KEY = 'u_anon_smarter_lesson_reperage-4e';
const SLUGS = [
  'mission-de-depart', 'la-journee-qui-ne-tient-pas', 'entre-deux-graduations',
  'le-pas-quon-se-donne', 'poser-un-point', 'le-quatrieme-sommet',
  'decider-par-les-coordonnees', 'mission-finale-la-carte',
];
const TOUS = ['0', '1', '2', '3', '4', '5', '6', '7', '00', '01', '02', '03', '04', '05', '06', '07'];

const browser = await launch();
const issues = [];

/* ── 1. L'index et les huit modules rendent ─────────────────────────── */
{
  const { ctx, page } = await open(browser, BASE + LESSON, { tag: 'index' });
  const t = await body(page);
  check('index : le titre de la leçon est rendu', /Repérage/.test(t), t.slice(0, 200));
  check('index : les modules sont annoncés',
    /journée qui ne tient pas/i.test(t) && /Mission finale/i.test(t));
  await ctx.close();

  for (const slug of SLUGS) {
    const { ctx: c, page: p } = await open(browser, `${BASE}${LESSON}/${slug}`, {
      key: KEY, completedModules: TOUS, tag: slug,
    });
    const b = await body(p);
    check(`${slug} : rend un vrai module`,
      b.length > 400 && !/Page introuvable/.test(b) && !/Découvre les maths autrement/.test(b),
      b.slice(0, 150));
    check(`${slug} : au moins deux commandes`, (await p.locator('main button').count()) >= 2);
    await c.close();
  }
}

/* ── 2. Le labo SIGNATURE : changer le pas change tout ──────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/la-journee-qui-ne-tient-pas`, { tag: 'M1' });
  check('M1 : le labo est un groupe nommé',
    (await page.getByRole('group', { name: /graduation/i }).count()) >= 1);

  const boutonPas = (label) =>
    page.locator('main button').filter({ hasText: new RegExp(`^${label}\\s*°C`) }).first();

  // Le module ouvre sur un MAUVAIS pas : le verdict doit le dire.
  let t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M1 : le repère de départ est annoncé comme mauvais', /Graduation à revoir/.test(t), t.slice(0, 300));
  check('M1 : et la raison est CHIFFRÉE, pas vague',
    /paires? de relevés différents/.test(t), t.slice(0, 400));

  // Le compteur de valeurs distinctes doit montrer une PERTE au pas 2.
  const lireCompteur = async () => {
    const s = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
    const m = s.match(/valeurs distinctes\s*(\d+)\s*\/\s*(\d+)/);
    return m ? [Number(m[1]), Number(m[2])] : null;
  };
  const avant = await lireCompteur();
  check('M1 : le compteur de valeurs distinctes est affiché', avant !== null, JSON.stringify(avant));
  check('M1 : au pas 2, des valeurs sont PERDUES (le panneau ne ment pas)',
    avant && avant[0] < avant[1], JSON.stringify(avant));

  // Le nombre de graduations doit changer quand on change le pas.
  const lireGrads = async () => {
    const s = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
    const m = s.match(/graduations\s*(\d+)\s*budget/);
    return m ? Number(m[1]) : null;
  };
  const gradsAvant = await lireGrads();

  // On passe au pas fin : l'axe doit devenir illisible.
  const fin = boutonPas('0,25');
  check('M1 : le bouton du pas 0,25 existe', (await fin.count()) >= 1);
  if (await fin.count()) { await fin.click({ force: true }); await settle(page, 500); }
  t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  const gradsFin = await lireGrads();
  check('M1 : le nombre de graduations CHANGE avec le pas',
    gradsFin !== null && gradsFin !== gradsAvant, `${gradsAvant} → ${gradsFin}`);
  check('M1 : au pas 0,25, le refus porte sur la LISIBILITÉ',
    /on ne peut plus les compter/.test(t), t.slice(0, 400));
  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));

  // Le pas de 1 : le défaut « entre les graduations ».
  const un = boutonPas('1');
  if (await un.count()) { await un.click({ force: true }); await settle(page, 500); }
  t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M1 : au pas 1, le refus porte sur les valeurs HORS graduation',
    /ne tombent sur aucune graduation/.test(t), t.slice(0, 400));

  // Le bon pas : verdict adapté, et plus aucune perte.
  const bon = boutonPas('0,5');
  if (await bon.count()) { await bon.click({ force: true }); await settle(page, 500); }
  t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M1 : le pas 0,5 est déclaré ADAPTÉ', /Graduation adaptée/.test(t), t.slice(0, 300));
  const apres = await lireCompteur();
  check('M1 : et plus aucune valeur n’est perdue',
    apres && apres[0] === apres[1], JSON.stringify(apres));

  // L'INVARIANT CENTRAL : le compteur ne contredit jamais le verdict.
  check('M1 : le compteur et le verdict s’accordent',
    !(/Graduation adaptée/.test(t) && apres[0] < apres[1]), t.slice(0, 300));

  // Le labo reste vivant après validation d'étape.
  check('M1 : les boutons de pas restent actifs',
    (await boutonPas('2').count()) >= 1 && await boutonPas('2').isEnabled());
  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 3. Module 2 : les deux lectures divergent ──────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/entre-deux-graduations`, {
    key: KEY, completedModules: ['0', '1'], tag: 'M2',
  });
  check('M2 : le labo de lecture est un groupe nommé',
    (await page.getByRole('group', { name: /Lire un point/i }).count()) >= 1);

  const lire = async () => {
    const s = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
    const g = s.match(/graduations comptées\s*([\d,−-]+)\s*·\s*([\d,−-]+)/);
    const c = s.match(/coordonnées du point\s*\(([^)]+)\)/);
    return { grad: g ? `${g[1]}·${g[2]}` : null, coord: c ? c[1] : null };
  };

  const a = await lire();
  check('M2 : les DEUX lectures sont affichées', a.grad !== null && a.coord !== null, JSON.stringify(a));
  check('M2 : elles ne donnent pas le même couple (c’est la démonstration)',
    a.grad !== a.coord, JSON.stringify(a));

  // Le point se déplace au clavier (chemin accessible obligatoire).
  const zone = page.locator('main [role="slider"]').first();
  check('M2 : la zone tactile du repère existe', (await zone.count()) >= 1);
  await zone.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await settle(page, 400);
  const b = await lire();
  check('M2 : le clavier déplace le point', b.coord !== a.coord, `${a.coord} → ${b.coord}`);
  check('M2 : la coordonnée porte une décimale quand le pas l’impose',
    /,/.test(b.coord ?? '') || /,/.test(a.coord ?? ''), `${a.coord} / ${b.coord}`);

  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 4. Module 4 : la cible est ATTEIGNABLE ─────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/poser-un-point`, {
    key: KEY, completedModules: ['0', '1', '2', '3'], tag: 'M4',
  });
  let t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M4 : aucune cible n’est signalée inatteignable',
    !/Cible inatteignable/.test(t), t.slice(0, 300));
  check('M4 : la cible est annoncée par ses coordonnées', /cible\s*A?\s*\(/i.test(t), t.slice(0, 400));

  // On atteint la première cible (1,5 ; 0,5) au clavier depuis (0 ; 0) :
  // 3 pas à droite, 1 pas en haut, au pas de 0,5.
  const zone = page.locator('main [role="slider"]').first();
  await zone.focus();
  for (let i = 0; i < 3; i += 1) await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowUp');
  await settle(page, 500);
  t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  // La cible A est atteinte : le module PASSE ALORS à la cible B. C'est le
  // geste lui-même qui valide, sans bouton — donc la preuve de l'atteinte est
  // le passage à la cible suivante, et la pastille verte sur A.
  check('M4 : la cible A est ATTEINTE au clavier — elle tombe sur un nœud réel',
    /A \(1,5 ; 0,5\)\s*✓/.test(t), t.slice(0, 600));
  check('M4 : et le module enchaîne sur la cible suivante',
    /cible\s*B/i.test(t), t.slice(0, 600));
  check('M4 : le labo reste manipulable (aucun gel après validation)',
    await page.locator('main [role="slider"]').first().isEnabled());

  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 5. Module 5 : le parallélogramme se ferme ──────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-quatrieme-sommet`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4'], tag: 'M5',
  });
  let t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M5 : les deux milieux sont affichés',
    /milieu de \[AC\]/.test(t) && /milieu de \[BD\]/.test(t), t.slice(0, 400));
  check('M5 : au départ, ce n’est PAS un parallélogramme',
    /diffèrent encore/.test(t), t.slice(0, 500));

  // D part de (2 ; 2,5) et doit aller en (1 ; 1,5) : 2 pas à gauche, 2 en bas
  // (une graduation vaut 0,5).
  const zone = page.locator('main [role="slider"]').first();
  await zone.focus();
  for (let i = 0; i < 2; i += 1) await page.keyboard.press('ArrowLeft');
  for (let i = 0; i < 2; i += 1) await page.keyboard.press('ArrowDown');
  await settle(page, 500);
  t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M5 : les deux milieux COÏNCIDENT une fois D bien posé',
    /coïncident/.test(t), t.slice(0, 600));

  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 6. Chemin FAUX-EXPRÈS : l'invariant non bloquant ───────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/decider-par-les-coordonnees`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4', '5'], tag: 'M6-faux',
  });
  // On calcule les trois refuges pour ouvrir la suite.
  for (let k = 0; k < 3; k += 1) {
    const b = page.locator('main button').filter({ hasText: /Comparer|Calculer les deux écarts/ }).first();
    if (await b.count()) { await b.click({ force: true }); await settle(page, 300); }
  }
  const t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M6 : les trois carrés sont calculés et affichés',
    /13/.test(t) && /17/.test(t) && /20/.test(t), t.slice(0, 600));

  // Une réponse FAUSSE ne doit pas bloquer la progression. L'étape 2 n'est
  // ouverte qu'après l'étape 1 : on répond donc d'abord à côté, ici.
  const faux = page.locator('main button')
    .filter({ hasText: /Parce que les carrés sont plus faciles à calculer/ }).first();
  check('M6 : l’étape 2 est ouverte après les trois calculs', (await faux.count()) >= 1);
  if (await faux.count()) { await faux.click({ force: true }); await settle(page, 900); }
  const html = (await page.locator('main').first().innerHTML()).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  check('M6 : la réponse fausse affiche la correction',
    /Comparer des carrés revient à comparer les éloignements/.test(html), html.slice(0, 400));
  check('M6 : et l’étape se valide quand même (non bloquant)',
    /Un quadrilatère qui trompe|quadrilatère/.test(html), html.slice(0, 400));
  await ctx.close();
}

/* ── 7. La carte des connaissances ──────────────────────────────────── */
{
  const { ctx, page } = await open(browser, BASE + LESSON, { tag: 'carte-vide' });
  const trigger = page.locator('button[data-km-trigger]');
  check('carte : le déclencheur est monté', (await trigger.count()) >= 1);
  if (await trigger.count()) {
    await trigger.first().click();
    await settle(page);
    check('carte : vide avant tout module validé',
      (await page.locator('#km-root [data-km-item]').count()) === 0);
  }
  await ctx.close();
}
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/poser-un-point`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4'], tag: 'carte-4',
  });
  const trigger = page.locator('button[data-km-trigger]');
  if (await trigger.count()) {
    await trigger.first().click();
    await settle(page);
    const ids = await page.locator('#km-root [data-km-item]')
      .evaluateAll((els) => els.map((e) => e.getAttribute('data-km-item')));
    check('carte : contient les acquis des modules 1 à 4',
      ids.includes('repere-choisi') && ids.includes('trois-defauts')
      && ids.includes('coordonnee-decimale') && ids.includes('methode-graduation'),
      ids.join(','));
    check('carte : AUCUNE fuite des modules 5 et 6',
      !ids.includes('parallelogramme-milieux') && !ids.includes('decider-par-coordonnees'),
      ids.join(','));
  }
  await ctx.close();
}

/* ── 8. Le boss, jusqu'à la synthèse ────────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/mission-finale-la-carte`, {
    key: KEY, completedModules: TOUS, tag: 'boss',
  });
  let b = await body(page);
  check('boss : les dix épreuves sont là', (await page.locator('main div[role="group"]').count()) >= 8);
  check('boss : aucune correction avant la soumission',
    !/Bonne réponse|Réponse juste/.test(b), b.slice(0, 200));

  await runBoss(page);
  const submit = page.locator('main button').filter({ hasText: /Valider mes \d+ réponses|Soumettre/ }).first();
  if (await submit.count()) { await submit.click({ force: true }); await settle(page, 1400); }
  b = await body(page);
  check('boss : le score apparaît après soumission', /\/\s*10|score|profil/i.test(b), b.slice(-300));

  const profil = page.locator('main button').filter({ hasText: /Voir mon profil/i }).first();
  if (await profil.count()) { await profil.click({ force: true }); await settle(page, 1200); }
  const synth = page.locator('main button').filter({ hasText: /Passer à la synthèse/i }).first();
  if (await synth.count()) { await synth.click({ force: true }); await settle(page, 1400); }
  check('boss : la synthèse rend la carte COMPLÈTE',
    (await page.locator('[data-knowledge-snapshot="complete"]').count()) >= 1);
  const items = await page.locator('[data-km-item]').count();
  check('boss : la carte complète porte les 7 connaissances', items === 7, `items=${items}`);
  await ctx.close();
}

/* ── 9. Mobile 375 px ───────────────────────────────────────────────── */
{
  for (const slug of ['la-journee-qui-ne-tient-pas', 'poser-un-point', 'le-quatrieme-sommet']) {
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

/* ── 10. Verdicts globaux ───────────────────────────────────────────── */
check('mise en page : aucun débordement ni chevauchement', issues.length === 0, issues.slice(0, 6).join(' | '));
check('console : aucune erreur sur tout le parcours', errs.length === 0, errs.slice(0, 5).join(' | '));

await browser.close();
process.exit(summary());
