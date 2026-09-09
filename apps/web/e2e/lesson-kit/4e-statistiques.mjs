// « Statistiques » (4e) — suite navigateur.
//
//   cd apps/web && (setsid nohup npx vite --port 5403 --strictPort > e2e/lesson-kit/shots/vite-5403.log 2>&1 </dev/null &)
//   KIT_BASE=http://localhost:5403 node apps/web/e2e/lesson-kit/4e-statistiques.mjs
//
// Ce que cette suite vérifie et qu'aucune garde de source ne voit :
//   · la leçon rend, et chaque module rend (une leçon non routée retombe sur
//     la page d'accueil SANS erreur — invisible autrement) ;
//   · le laboratoire signature est manipulable AU CLAVIER ET AU POINTEUR, et
//     il reste vivant APRÈS validation de l'étape ;
//   · la découverte centrale se PRODUIT vraiment dans le navigateur : la
//     pastille poussée au bout de l'axe laisse le cadre « médiane » intact et
//     déplace les deux autres ;
//   · la coupure du module 3 atteint la position gagnante, et le module 7
//     n'explose sur aucun réglage du départ d'axe ;
//   · un chemin FAUX-EXPRÈS progresse quand même (invariant non bloquant) ;
//   · la carte des connaissances grandit en cours de leçon, sans fuite ;
//   · le boss va jusqu'à la synthèse, qui porte les 9 connaissances ;
//   · rien ne déborde à 375 px, et la console reste vide.
import {
  launch, open, check, summary, errs, settle, body, noHScroll,
  layoutAudit, aspectAudit, domOverflow, smallTargets, sweepSliders, tapOption, runBoss,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5403';
const LESSON = '/courses/college/4e/donnees_probabilites/statistiques-4e';
const KEY = 'u_anon_smarter_lesson_statistiques-4e';
const SLUGS = [
  'mission-de-depart', 'lobservatoire', 'tous-les-devoirs-ne-pesent-pas-pareil',
  'couper-le-groupe-en-deux', 'du-plus-petit-au-plus-grand',
  'deux-groupes-une-seule-moyenne', 'deux-villes-un-seul-milieu',
  'le-graphique-qui-ment', 'mission-finale-lobservatoire',
];
const TOUS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '00', '01', '02', '03', '04', '05', '06', '07', '08'];

/** Le texte d'un cadre de résumé du laboratoire, par son `data-repere`. */
const repere = (page, cle) =>
  page.locator(`[data-repere="${cle}"]`).first().textContent().then((t) => t.replace(/\s+/g, ' '));

const browser = await launch();
const issues = [];

/* ── 1. L'index et les neuf modules rendent ─────────────────────────── */
{
  const { ctx, page } = await open(browser, BASE + LESSON, { tag: 'index' });
  const t = await body(page);
  check('index : le titre de la leçon est rendu', /Statistiques/.test(t), t.slice(0, 200));
  check('index : les 9 modules sont annoncés',
    /L’observatoire/.test(t) && /Mission finale/.test(t) && /Le graphique qui ment/.test(t));
  await ctx.close();

  for (const slug of SLUGS) {
    const { ctx: c, page: p } = await open(browser, `${BASE}${LESSON}/${slug}`, {
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

/* ── 2. Le périmètre 4e, dans le NAVIGATEUR ─────────────────────────── */
{
  // Une garde de source vérifie que le noyau n'exporte pas les quartiles ;
  // seule une lecture du rendu vérifie qu'aucun texte ne les nomme.
  for (const slug of SLUGS) {
    const { ctx, page } = await open(browser, `${BASE}${LESSON}/${slug}`, {
      key: KEY, completedModules: TOUS, tag: `scope-${slug}`,
    });
    const b = await body(page);
    check(`${slug} : aucun mot de 3e (quartile / boîte à moustaches / écart type)`,
      !/quartile/i.test(b) && !/boîte à moustaches/i.test(b) && !/écart[- ]type/i.test(b),
      b.slice(0, 200));
    await ctx.close();
  }
}

/* ── 3. Le labo SIGNATURE (M1) : la découverte se produit vraiment ──── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/lobservatoire`, { tag: 'M1' });
  check('M1 : le labo est un groupe nommé',
    (await page.getByRole('group', { name: /Observatoire des trajets/ }).count()) >= 1);

  const poignee = page.locator('[role="slider"][aria-label*="Soline"]').first();
  check('M1 : la poignée de Soline existe et est focalisable', (await poignee.count()) >= 1);

  // Les trois cadres AVANT tout geste — les nombres du noyau, dans le DOM.
  const moy0 = await repere(page, 'moyenne');
  const med0 = await repere(page, 'mediane');
  const et0 = await repere(page, 'etendue');
  check('M1 : la moyenne de départ est 16 min', /16/.test(moy0), moy0);
  check('M1 : la médiane de départ est 12,5 min', /12,5/.test(med0), med0);
  check('M1 : l’étendue de départ est 44 min', /44/.test(et0), et0);

  // LE GESTE, au clavier : Fin pousse Soline au bout du domaine (90 min).
  await poignee.focus();
  await page.keyboard.press('End');
  await settle(page, 350);
  const moy1 = await repere(page, 'moyenne');
  const med1 = await repere(page, 'mediane');
  const et1 = await repere(page, 'etendue');
  check('M1 : LA DÉCOUVERTE — la médiane n’a PAS bougé au bout de l’axe',
    /12,5/.test(med1) && /n’a pas bougé/.test(med1), med1);
  check('M1 : …tandis que la moyenne a bougé', /a bougé de/.test(moy1), moy1);
  check('M1 : …et l’étendue aussi', /a bougé de/.test(et1), et1);

  // Le domaine balayé aux DEUX bornes : la mise en page doit tenir partout.
  for (const key of ['Home', 'End', 'PageDown', 'PageUp']) {
    await poignee.focus();
    await page.keyboard.press(key);
    await settle(page, 250);
    issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  }
  await sweepSliders(page, issues);

  // Trois positions distinctes dont une ≥ 70 → l'étape 1 se valide.
  await poignee.focus();
  await page.keyboard.press('End');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await settle(page, 900);
  // On attend la phrase plutôt que de lire une fois : le balayage au clavier
  // qui précède déclenche une rafale de rendus, et une lecture trop précoce
  // attrape la coquille de chargement au lieu du module.
  await page.waitForFunction(
    () => /Deux cadres sur trois ont bougé/.test(document.body.innerText), null, { timeout: 8000 },
  ).catch(() => {});
  let b = await body(page);
  check('M1 : le balayage valide l’étape 1', /Deux cadres sur trois ont bougé/.test(b), b.slice(0, 300));

  // APRÈS validation, le labo reste manipulable (bug class « gelée »).
  await poignee.focus();
  await page.keyboard.press('ArrowLeft');
  await settle(page, 300);
  const apres = await page.locator('[data-poignee]').first().textContent();
  check('M1 : le labo reste VIVANT après validation',
    (await poignee.getAttribute('aria-disabled')) === null && /min/.test(apres), apres);
  check('M1 : la poignée garde son tabindex après validation',
    (await poignee.getAttribute('tabindex')) === '0');

  // Le geste au POINTEUR aussi : la pastille suit le doigt.
  const svg = page.locator('svg[role="img"]').first();
  const box = await svg.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.75);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.75, { steps: 10 });
    await page.mouse.up();
    await settle(page, 300);
    check('M1 : le glisser au pointeur déplace bien la pastille',
      (await page.locator('[data-poignee]').first().textContent()) !== apres,
      await page.locator('[data-poignee]').first().textContent());
  }
  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 4. M2 : les deux moyennes coïncident au réglage « tout à 1 » ───── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/tous-les-devoirs-ne-pesent-pas-pareil`, {
    key: KEY, completedModules: ['0', '1'], tag: 'M2',
  });
  const pond = () => page.locator('[data-moyenne-ponderee]').first().textContent();
  const simple = () => page.locator('[data-moyenne-simple]').first().textContent();
  check('M2 : la moyenne pondérée de départ est 11,2', /11,2/.test(await pond()), await pond());
  check('M2 : la moyenne simple affichée est 12,5', /12,5/.test(await simple()), await simple());

  // Les quatre curseurs à 1 : la cible de l'étape 2 doit être ATTEIGNABLE.
  const curseurs = page.locator('input[type="range"]');
  const n = await curseurs.count();
  check('M2 : les quatre coefficients sont réglables', n >= 4, `n=${n}`);
  for (let i = 0; i < n; i += 1) await curseurs.nth(i).fill('1');
  await settle(page, 400);
  check('M2 : à tous les coefficients égaux, les deux nombres COÏNCIDENT',
    (await pond()).trim() === (await simple()).trim(), `${await pond()} / ${await simple()}`);
  const b = await body(page);
  check('M2 : et l’étape 2 se valide', /Les deux nombres coïncident/.test(b), b.slice(0, 300));

  // Le labo reste vivant : on repart sur le vrai bulletin.
  await curseurs.nth(2).fill('3');
  await curseurs.nth(3).fill('5');
  await settle(page, 350);
  check('M2 : le labo reste vivant après validation', /11,2/.test(await pond()), await pond());
  check('M2 : aucun curseur n’est désactivé', (await page.locator('input[type="range"]:disabled').count()) === 0);
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 5. M3 : la coupure atteint sa position gagnante ────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/couper-le-groupe-en-deux`, {
    key: KEY, completedModules: ['0', '1', '2'], tag: 'M3',
  });
  const coupure = page.locator('[role="slider"][aria-label*="coupure"]').first();
  check('M3 : la coupure est saisissable', (await coupure.count()) >= 1);

  // ATTEIGNABILITÉ, dans le navigateur : la seule position gagnante est 12,5
  // et elle doit être atteinte par une suite de gestes réels.
  await coupure.focus();
  await page.keyboard.press('Home');
  await settle(page, 200);
  let atteint = false;
  for (let k = 0; k < 40 && !atteint; k += 1) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(40);
    atteint = /Équilibré/.test((await page.locator('[data-verdict]').first().textContent()) || '');
  }
  check('M3 : la position d’équilibre est ATTEIGNABLE à la flèche', atteint,
    await page.locator('[data-coupe]').first().textContent());
  const coupe = await page.locator('[data-coupe]').first().textContent();
  check('M3 : et cette position est 12,5 min', /12,5/.test(coupe), coupe);
  check('M3 : les deux compteurs affichent 6 et 6',
    (await page.locator('[data-gauche]').first().textContent()).trim() === '6'
    && (await page.locator('[data-droite]').first().textContent()).trim() === '6');

  // Après validation, la coupure reste mobile.
  await page.keyboard.press('ArrowRight');
  await settle(page, 250);
  check('M3 : la coupure reste vivante après validation',
    (await page.locator('[data-coupe]').first().textContent()) !== coupe);
  await sweepSliders(page, issues);
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 6. M4 : l'étendue ignore l'intérieur, suit les bouts ───────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/du-plus-petit-au-plus-grand`, {
    key: KEY, completedModules: ['0', '1', '2', '3'], tag: 'M4',
  });
  const et = () => repere(page, 'etendue');
  const avant = await et();
  check('M4 : l’étendue de départ est 18 °C', /18/.test(avant), avant);

  const interieur = page.locator('[role="slider"][aria-label*="mercredi"]').first();
  await interieur.focus();
  await page.keyboard.press('End');
  await settle(page, 300);
  check('M4 : pousser mercredi au bout NE change PAS l’étendue',
    /18/.test(await et()) && /n’a pas bougé/.test(await et()), await et());
  await page.keyboard.press('Home');
  await settle(page, 300);
  check('M4 : …ni dans l’autre sens', /18/.test(await et()), await et());
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 7. M7 : aucun réglage de l'axe ne fait exploser le calcul ──────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-graphique-qui-ment`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4', '5', '6'], tag: 'M7',
  });
  const facteur = () => page.locator('[data-facteur]').first().textContent();
  const curseur = page.locator('#axe-depart').first();
  check('M7 : le curseur du départ d’axe existe', (await curseur.count()) >= 1);
  check('M7 : l’axe part de zéro, facteur × 1', /1,00|× 1\b/.test(await facteur()), await facteur());

  // Balayage COMPLET du domaine : `exagerationAxe` lève au-delà de 47, et la
  // borne du curseur doit l'en empêcher. Une console vide le prouve.
  for (const v of ['0', '20', '40', '44', '45', '46', '47']) {
    await curseur.fill(v);
    await settle(page, 200);
    const f = await facteur();
    check(`M7 : départ ${v} → un facteur fini est affiché`, /×\s*\d/.test(f) && !/NaN|Infinity/.test(f), f);
    issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  }
  await curseur.fill('45');
  await settle(page, 250);
  check('M7 : à un départ de 45, le facteur affiché est 2,15', /2,15/.test(await facteur()), await facteur());
  check('M7 : les deux valeurs du sondage n’ont JAMAIS changé',
    /48/.test(await body(page)) && /52/.test(await body(page)));
  await ctx.close();
}

/* ── 8. Chemin FAUX-EXPRÈS : l'invariant non bloquant ───────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/deux-groupes-une-seule-moyenne`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4'], tag: 'M5-faux',
  });
  // On dévoile les trois lignes pour ouvrir l'étape 2, puis on répond FAUX.
  for (const nom of ['Moyenne', 'Médiane', 'Étendue']) {
    await page.locator('main button').filter({ hasText: new RegExp(`^✓?\\s*${nom}$`) }).first()
      .click({ force: true }).catch(() => {});
    await settle(page, 200);
  }
  await tapOption(page, 'main', 1);
  const main = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M5 : une réponse fausse affiche la correction',
    /Même moyenne veut dire même total/.test(main), main.slice(-500));
  // Non bloquant : l'étape est validée malgré l'erreur, donc la question
  // suivante est rendue.
  check('M5 : et l’étape se valide quand même (non bloquant)',
    /Le seul résumé qui parle/.test(main), main.slice(-400));
  await ctx.close();
}

/* ── 9. La carte des connaissances ──────────────────────────────────── */
{
  // Avant tout geste : la carte ne doit RIEN contenir de la leçon.
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
  // Modules 1 à 4 semés : la carte porte leurs acquis, et RIEN des modules 5+.
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/du-plus-petit-au-plus-grand`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4'], tag: 'carte-4',
  });
  const trigger = page.locator('button[data-km-trigger]');
  if (await trigger.count()) {
    await trigger.first().click();
    await settle(page);
    const ids = await page.locator('#km-root [data-km-item]').evaluateAll(
      (els) => els.map((e) => e.getAttribute('data-km-item')),
    );
    check('carte : contient les acquis des modules 1 à 4',
      ids.includes('indicateur-stat') && ids.includes('moyenne-ponderee')
      && ids.includes('mediane-stat') && ids.includes('etendue'),
      ids.join(','));
    check('carte : AUCUNE fuite des modules 5 à 7',
      !ids.includes('comparer-series') && !ids.includes('choisir-indicateur')
      && !ids.includes('axe-tronque'),
      ids.join(','));
  }
  await ctx.close();
}

/* ── 10. Le boss, jusqu'à la synthèse ───────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/mission-finale-lobservatoire`, {
    key: KEY, completedModules: TOUS, tag: 'boss',
  });
  let b = await body(page);
  check('boss : les dix épreuves sont là',
    /Épreuve|épreuve/.test(b) && (await page.locator('main div[role="group"]').count()) >= 8);
  check('boss : aucune correction avant la soumission',
    !/Bonne réponse|Réponse juste/.test(b), b.slice(0, 200));

  await runBoss(page);
  const submit = page.locator('main button').filter({ hasText: /Valider mes \d+ réponses|Soumettre/ }).first();
  if (await submit.count()) { await submit.click({ force: true }); await settle(page, 1800); }
  b = await body(page);
  check('boss : le score apparaît après soumission', /\/\s*10|score|Profil|profil/i.test(b), b.slice(-400));

  // Le parcours réel : « Voir mon profil de maîtrise » → « Passer à la
  // synthèse → ». On ATTEND chaque bouton au lieu de supposer qu'il est déjà
  // là : la correction du boss remonte tout l'arbre et le rendu peut prendre
  // plus d'une seconde sur une machine chargée.
  const profil = page.locator('main button').filter({ hasText: /Voir mon profil/i }).first();
  await profil.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
  if (await profil.count()) { await profil.click({ force: true }); await settle(page, 1500); }
  const synth = page.locator('main button').filter({ hasText: /Passer à la synthèse/i }).first();
  await synth.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
  if (await synth.count()) { await synth.click({ force: true }); await settle(page, 1800); }
  await page.locator('[data-knowledge-snapshot="complete"]').first()
    .waitFor({ state: 'attached', timeout: 8000 }).catch(() => {});
  const complete = await page.locator('[data-knowledge-snapshot="complete"]').count();
  const items = await page.locator('[data-km-item]').count();
  check('boss : la synthèse rend la carte COMPLÈTE', complete >= 1, `snapshots=${complete}`);
  check('boss : la carte complète porte les 9 connaissances de la leçon', items === 9, `items=${items}`);
  await ctx.close();
}

/* ── 11. Mobile 375 px ──────────────────────────────────────────────── */
{
  for (const slug of ['lobservatoire', 'couper-le-groupe-en-deux', 'le-graphique-qui-ment']) {
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

/* ── 12. Verdicts globaux ───────────────────────────────────────────── */
check('mise en page : aucun débordement ni chevauchement', issues.length === 0, issues.slice(0, 6).join(' | '));
check('console : aucune erreur sur tout le parcours', errs.length === 0, errs.slice(0, 5).join(' | '));

await browser.close();
process.exit(summary());
