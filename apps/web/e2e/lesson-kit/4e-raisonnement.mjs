// « Raisonnement et résolution de problèmes » (4e) — suite navigateur.
//
//   cd apps/web && (setsid nohup npx vite --port 5412 --strictPort > e2e/lesson-kit/shots/vite-5412.log 2>&1 </dev/null &)
//   KIT_BASE=http://localhost:5412 node apps/web/e2e/lesson-kit/4e-raisonnement.mjs
//
// Ce que cette suite vérifie et qu'aucune garde de source ne voit :
//   · chaque module rend (une leçon non routée retombe sur l'accueil sans erreur) ;
//   · le LABO SIGNATURE accepte les nombres de l'élève, montre les colonnes du
//     milieu CHANGER et la dernière rester à 6 ;
//   · le verdict refuse de conclure après DIX essais réussis — c'est l'invariant
//     central de la leçon, et il ne peut se vérifier qu'à l'écran ;
//   · un contre-exemple bascule le verdict en « réfutée » d'un seul essai ;
//   · le trieur de données range utile / inutile ;
//   · les laboratoires restent VIVANTS après validation d'étape ;
//   · un chemin faux progresse quand même ; la carte grandit sans fuite ;
//   · rien ne déborde à 375 px, et la console reste vide.
import {
  launch, open, check, summary, errs, settle, body, noHScroll,
  layoutAudit, aspectAudit, domOverflow, smallTargets, runBoss,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5412';
const LESSON = '/courses/college/4e/nombres_calculs/raisonnement-problemes-4e';
const KEY = 'u_anon_smarter_lesson_raisonnement-problemes-4e';
const SLUGS = [
  'mission-de-depart', 'le-programme-mystere', 'ce-que-l-enonce-raconte',
  'dessiner-puis-estimer', 'deux-chemins-une-reponse', 'le-contre-exemple',
  'l-enquete-complete', 'mission-finale-le-dossier',
];
const TOUS = ['0', '1', '2', '3', '4', '5', '6', '7', '00', '01', '02', '03', '04', '05', '06', '07'];

const browser = await launch();
const issues = [];

/**
 * Attend que le module soit VRAIMENT monté.
 *
 * Les modules sont chargés paresseusement (`import.meta.glob` + `lazy`) : le
 * délai fixe de 900 ms du helper partagé suffit d'ordinaire, mais pas quand
 * plusieurs contextes navigateur travaillent en parallèle sur une machine
 * chargée. Sans cette attente, une assertion mesure un `<main>` encore vide et
 * échoue une fois sur trois — un flake du HARNAIS, pas de la leçon (observé
 * les 2026-09-09).
 */
async function monte(page) {
  await page.locator('main button').first().waitFor({ state: 'attached', timeout: 20000 }).catch(() => {});
  await settle(page, 250);
  return page;
}

/** Saisit un nombre dans le premier champ d'un labo et lance l'essai. */
async function essayer(page, valeur, boutonRe) {
  const champ = page.locator('main input[type="text"]').first();
  await champ.scrollIntoViewIfNeeded();
  await champ.fill(String(valeur));
  await page.locator('main button').filter({ hasText: boutonRe }).first().click({ force: true });
  await settle(page, 220);
}

/* ── 1. L'index et les huit modules rendent ─────────────────────────── */
{
  const { ctx, page } = await open(browser, BASE + LESSON, { tag: 'index' });
  const t = await body(page);
  check('index : le titre de la leçon est rendu', /Raisonnement et résolution de problèmes/.test(t), t.slice(0, 200));
  check('index : les modules sont annoncés', /Le programme mystère/.test(t) && /Mission finale/.test(t));
  await ctx.close();

  for (const slug of SLUGS) {
    const { ctx: c, page: p } = await open(browser, `${BASE}${LESSON}/${slug}`, {
      key: KEY, completedModules: TOUS, tag: slug,
    });
    await monte(p);
    const b = await body(p);
    check(`${slug} : rend un vrai module`, b.length > 400 && !/Page introuvable/.test(b) && !/Découvre les maths autrement/.test(b), b.slice(0, 150));
    const nbBoutons = await p.locator('main button').count();
    check(`${slug} : au moins une commande`, nbBoutons >= 1, `boutons=${nbBoutons}`);
    await c.close();
  }
}

/* ── 2. Le labo signature : les nombres de l'élève, et le refus de conclure ─ */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-programme-mystere`, { tag: 'M1' });
  await monte(page);
  check('M1 : le labo est un groupe nommé', (await page.getByRole('group', { name: /Programme mystère/i }).count()) >= 1);
  check('M1 : le tableau est vide au départ', /Aucun essai pour l’instant/.test(await body(page)));

  // Trois essais très éloignés, dont un négatif et un zéro.
  for (const n of [7, 0, -5]) await essayer(page, n, /Lancer le programme/);

  const lignes = await page.locator('main table tbody tr').count();
  check('M1 : les trois essais sont versés au tableau', lignes === 3, `lignes=${lignes}`);

  // Les colonnes du MILIEU doivent changer, la dernière rester à 6.
  const grille = await page.locator('main table tbody tr').evaluateAll(
    (trs) => trs.map((tr) => [...tr.querySelectorAll('td')].map((td) => td.textContent.trim()))
  );
  const milieux = grille.map((r) => r[2]);
  const finales = grille.map((r) => r[3]);
  check('M1 : les colonnes du milieu CHANGENT d’un essai à l’autre',
    new Set(milieux).size === milieux.length, milieux.join(' | '));
  check('M1 : la dernière colonne vaut 6 à chaque fois',
    finales.every((v) => v === '6'), finales.join(' | '));

  // L'INVARIANT : dix essais réussis, et toujours « ne prouvent rien ».
  for (const n of [1, 2, 3, 12, 40, 100, 999]) await essayer(page, n, /Lancer le programme/);
  const verdict = page.locator('main [data-verdict]').first();
  check('M1 : après dix essais, le verdict reste « non prouvée »',
    (await verdict.getAttribute('data-verdict')) === 'non-prouvee');
  const tv = (await verdict.textContent()).replace(/\s+/g, ' ');
  check('M1 : et le mot « prouvée » n’apparaît JAMAIS comme conclusion positive',
    /ne prouvent rien/.test(tv) && !/est prouvée/.test(tv), tv);

  // Le champ borne les entrées, sans jamais planter.
  await page.locator('main input[type="text"]').first().fill('99999');
  await settle(page, 200);
  check('M1 : une valeur hors bornes est refusée par un message, pas par une erreur',
    /entier entre/.test(await body(page)));

  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 3. Le labo reste VIVANT après validation d'étape ───────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-programme-mystere`, {
    key: KEY, completedModules: TOUS, tag: 'M1-vivant',
  });
  await monte(page);
  // Le module rend le MÊME labo dans deux étapes (l'élève garde ses essais
  // sous les yeux en répondant) : on compte les lignes d'UN seul tableau.
  const tableau = page.locator('main table').first();
  for (const n of [2, 3, 4, 5]) await essayer(page, n, /Lancer le programme/);
  const avant = await tableau.locator('tbody tr').count();
  await essayer(page, 60, /Lancer le programme/);
  const apres = await tableau.locator('tbody tr').count();
  check('M1 : le labo accepte encore des essais après la validation de l’étape',
    apres === avant + 1, `${avant} → ${apres}`);

  // Et le bouton « vider » rejoue depuis zéro.
  const vider = page.locator('main button[aria-label*="Vider"]').first();
  if (await vider.count()) {
    await vider.click({ force: true });
    await settle(page, 300);
    check('M1 : le tableau se vide et le labo repart à neuf', /Aucun essai pour l’instant/.test(await body(page)));
  }
  await ctx.close();
}

/* ── 4. Module 2 : le trieur range utile / inutile ──────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/ce-que-l-enonce-raconte`, {
    key: KEY, completedModules: ['0', '1'], tag: 'M2',
  });
  await monte(page);
  let t = await body(page);
  check('M2 : l’énoncé du club est affiché', /3 ballons et 2 filets pour 74/.test(t), t.slice(0, 300));
  check('M2 : les deux données inutiles sont bien présentes',
    /28 adhérents/.test(t) && /trois jours/.test(t));

  // Chemin tap (aussi le chemin clavier) : prendre une carte, la poser.
  const cartes = page.locator('main button').filter({ hasText: /Le club achète 3 ballons/ });
  const bacUtile = page.locator('main [role="button"]').filter({ hasText: /Données utiles/ }).first();
  if (await cartes.count() && await bacUtile.count()) {
    await cartes.first().click({ force: true });
    await settle(page, 200);
    await bacUtile.click({ force: true });
    await settle(page, 300);
    const dansLeBac = await bacUtile.textContent();
    check('M2 : une carte se range dans le bac « utiles »', /3 ballons/.test(dansLeBac), dansLeBac.slice(0, 120));
  }
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 5. Module 3 : le schéma se construit et se rejoue ──────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/dessiner-puis-estimer`, {
    key: KEY, completedModules: ['0', '1', '2'], tag: 'M3',
  });
  await monte(page);
  const bouton = page.locator('main button').filter({ hasText: /Ajouter la phrase suivante|Recommencer le schéma/ }).first();
  for (let k = 0; k < 2; k += 1) { await bouton.click({ force: true }); await settle(page, 300); }
  let t = await body(page);
  check('M3 : le schéma complet annonce 5 parts et 12 €', /5 parts identiques/.test(t), t.slice(0, 400));
  check('M3 : le bouton rejoue le schéma au lieu de se figer',
    /Recommencer le schéma/.test(t), t.slice(0, 200));
  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 6. Module 5 : un seul contre-exemple réfute ────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-contre-exemple`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4'], tag: 'M5',
  });
  await monte(page);
  // Étape 1 — la conjecture VRAIE résiste à cinq essais.
  for (const n of [1, 8, 25, 100, 3]) await essayer(page, n, /^Tester$/);
  const v1 = page.locator('main [data-verdict]').first();
  check('M5 : la conjecture vraie reste « non prouvée » après cinq essais',
    (await v1.getAttribute('data-verdict')) === 'non-prouvee');

  // Étape 2 — la conjecture FAUSSE tombe sur un seul essai pair.
  const bancs = page.locator('main [role="group"][aria-label^="Banc d’essai"]');
  const nb = await bancs.count();
  check('M5 : le second banc d’essai est monté', nb >= 2, `bancs=${nb}`);
  if (nb >= 2) {
    const banc2 = bancs.nth(1);
    await banc2.locator('input[type="text"]').first().fill('6');
    await banc2.locator('button').filter({ hasText: /^Tester$/ }).first().click({ force: true });
    await settle(page, 400);
    const v2 = await banc2.locator('[data-verdict]').first().getAttribute('data-verdict');
    check('M5 : UN SEUL contre-exemple bascule le verdict en « réfutée »', v2 === 'refutee', String(v2));
    const t2 = (await banc2.textContent()).replace(/\s+/g, ' ');
    check('M5 : et le contre-exemple est nommé', /6 est un contre-exemple/.test(t2), t2.slice(-200));
  }
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 7. Chemin FAUX-EXPRÈS : l'invariant non bloquant ───────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/l-enquete-complete`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4', '5'], tag: 'M6-faux',
  });
  await monte(page);
  // 14,8 € : le piège « partager 74 sans retirer les 12 ».
  const champ = page.locator('main input[type="text"]').first();
  await champ.fill('14,8');
  await page.locator('main button:has-text("OK")').first().click({ force: true });
  await settle(page, 800);
  const t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M6 : la réponse fausse déclenche la correction ciblée',
    /retirer les 12/.test(t), t.slice(0, 400));
  check('M6 : et l’étape se valide quand même (non bloquant)',
    /est-il un prix possible|prix possible pour un filet/.test(t), t.slice(0, 500));

  // La vérification DANS L'HISTOIRE affiche les deux contrôles au vert.
  const verif = page.locator('main button').filter({ hasText: /Remettre 12,4 € dans l’énoncé/ }).first();
  if (await verif.count()) {
    await verif.scrollIntoViewIfNeeded();
    await verif.click({ force: true });
    await settle(page, 500);
    const t2 = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
    check('M6 : la vérification revient à l’énoncé, pas au dernier calcul',
      /prix d’un ballon/.test(t2) && /total payé/.test(t2), t2.slice(-400));
    check('M6 : et tout retombe sur l’énoncé', /Tout retombe sur l’énoncé/.test(t2), t2.slice(-300));
  }
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 8. La carte des connaissances ──────────────────────────────────── */
{
  const { ctx, page } = await open(browser, BASE + LESSON, { tag: 'carte-vide' });
  const trigger = page.locator('button[data-km-trigger]');
  check('carte : le déclencheur est monté', (await trigger.count()) >= 1);
  if (await trigger.count()) {
    await trigger.first().click();
    await settle(page);
    check('carte : vide avant tout module validé', (await page.locator('#km-root [data-km-item]').count()) === 0);
  }
  await ctx.close();
}
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/dessiner-puis-estimer`, {
    key: KEY, completedModules: ['0', '1', '2', '3'], tag: 'carte-3',
  });
  await monte(page);
  const trigger = page.locator('button[data-km-trigger]');
  if (await trigger.count()) {
    await trigger.first().click();
    await settle(page);
    const ids = await page.locator('#km-root [data-km-item]').evaluateAll((els) => els.map((e) => e.getAttribute('data-km-item')));
    check('carte : contient les acquis des modules 1 à 3',
      ids.includes('conjecture') && ids.includes('essais-ne-prouvent-pas') && ids.includes('donnees-utiles'), ids.join(','));
    check('carte : AUCUNE fuite des modules 5 et 6',
      !ids.includes('contre-exemple') && !ids.includes('phrase-reponse'), ids.join(','));
  }
  await ctx.close();
}

/* ── 9. Le boss, jusqu'à la synthèse ────────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/mission-finale-le-dossier`, {
    key: KEY, completedModules: TOUS, tag: 'boss',
  });
  await monte(page);
  let b = await body(page);
  check('boss : les dix épreuves sont là', (await page.locator('main div[role="group"]').count()) >= 8);
  check('boss : aucune correction avant la soumission', !/Bonne réponse|Réponse juste/.test(b), b.slice(0, 200));

  await runBoss(page);
  const submit = page.locator('main button').filter({ hasText: /Valider mes \d+ réponses|Soumettre/ }).first();
  if (await submit.count()) { await submit.click({ force: true }); await settle(page, 1400); }
  b = await body(page);
  check('boss : le score apparaît après soumission', /\/\s*10|score|profil/i.test(b), b.slice(-300));

  const profil = page.locator('main button').filter({ hasText: /Voir mon profil/i }).first();
  if (await profil.count()) { await profil.click({ force: true }); await settle(page, 1200); }
  const synth = page.locator('main button').filter({ hasText: /Passer à la synthèse/i }).first();
  if (await synth.count()) { await synth.click({ force: true }); await settle(page, 1400); }
  check('boss : la synthèse rend la carte COMPLÈTE', (await page.locator('[data-knowledge-snapshot="complete"]').count()) >= 1);
  const items = await page.locator('[data-km-item]').count();
  check('boss : la carte complète porte les 12 connaissances', items === 12, `items=${items}`);
  await ctx.close();
}

/* ── 10. Mobile 375 px ──────────────────────────────────────────────── */
{
  for (const slug of ['le-programme-mystere', 'le-contre-exemple', 'dessiner-puis-estimer']) {
    const { ctx, page } = await open(browser, `${BASE}${LESSON}/${slug}`, {
      key: KEY, completedModules: TOUS, mobile: true, tag: `mob-${slug}`,
    });
    // On remplit le labo pour auditer l'état LE PLUS CHARGÉ, pas l'état vide.
    if (slug !== 'dessiner-puis-estimer') {
      for (const n of [123, -45, 7]) {
        await essayer(page, n, slug === 'le-programme-mystere' ? /Lancer le programme/ : /^Tester$/).catch(() => {});
      }
    }
    check(`mobile ${slug} : aucun défilement horizontal`, await noHScroll(page));
    const petits = await smallTargets(page);
    check(`mobile ${slug} : cibles tactiles ≥ 40 px`, petits.length === 0, petits.join(', '));
    issues.push(...(await domOverflow(page)));
    await ctx.close();
  }
}

/* ── 11. Verdicts globaux ───────────────────────────────────────────── */
check('mise en page : aucun débordement ni chevauchement', issues.length === 0, issues.slice(0, 6).join(' | '));
check('console : aucune erreur sur tout le parcours', errs.length === 0, errs.slice(0, 5).join(' | '));

await browser.close();
process.exit(summary());
