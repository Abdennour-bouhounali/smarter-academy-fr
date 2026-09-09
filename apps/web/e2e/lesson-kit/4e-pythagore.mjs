// « Théorème de Pythagore » (4e) — suite navigateur.
//
//   cd apps/web && (setsid nohup npx vite --port 5406 --strictPort > e2e/lesson-kit/shots/vite-5406.log 2>&1 </dev/null &)
//   KIT_BASE=http://localhost:5406 node apps/web/e2e/lesson-kit/4e-pythagore.mjs
//
// Ce que cette suite vérifie et qu'aucune garde de source ne voit :
//   · chaque module rend (une leçon non routée retombe sur l'accueil sans erreur) ;
//   · le sommet C se GLISSE vraiment, et l'angle droit est préservé partout ;
//   · les carrés ne sortent JAMAIS du cadre, à aucune position ;
//   · la balance penche quand on libère C (module 2) ;
//   · le puzzle se remplit et révèle le carré de l'hypoténuse ;
//   · un chemin faux progresse quand même ; la carte grandit sans fuite ;
//   · rien ne déborde à 375 px, et la console reste vide.
import {
  launch, open, check, summary, errs, settle, body, noHScroll,
  layoutAudit, aspectAudit, domOverflow, smallTargets, dragBy, tapOption, runBoss,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5406';
const LESSON = '/courses/college/4e/espace_geometrie/pythagore-4e';
const KEY = 'u_anon_smarter_lesson_pythagore-4e';
const SLUGS = [
  'mission-de-depart', 'les-trois-carres', 'quand-langle-se-casse', 'le-puzzle',
  'ecrire-puis-calculer', 'le-cote-manquant', 'rectangle-ou-pas', 'mission-finale-le-chantier',
];
const TOUS = ['0', '1', '2', '3', '4', '5', '6', '7', '00', '01', '02', '03', '04', '05', '06', '07'];

const browser = await launch();
const issues = [];

/* ── 1. L'index et les huit modules rendent ─────────────────────────── */
{
  const { ctx, page } = await open(browser, BASE + LESSON, { tag: 'index' });
  const t = await body(page);
  check('index : le titre de la leçon est rendu', /Pythagore/.test(t), t.slice(0, 200));
  check('index : les modules sont annoncés', /Les trois carrés/.test(t) && /Mission finale/.test(t));
  await ctx.close();

  for (const slug of SLUGS) {
    const { ctx: c, page: p } = await open(browser, `${BASE}${LESSON}/${slug}`, {
      key: KEY, completedModules: TOUS, tag: slug,
    });
    const b = await body(p);
    check(`${slug} : rend un vrai module`, b.length > 400 && !/Page introuvable/.test(b) && !/Découvre les maths autrement/.test(b), b.slice(0, 150));
    check(`${slug} : au moins deux commandes`, (await p.locator('main button').count()) >= 2);
    await c.close();
  }
}

/* ── 2. Le labo signature : glisser C, sans jamais casser le cadre ──── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/les-trois-carres`, { tag: 'M1' });
  check('M1 : le labo est un groupe nommé', (await page.getByRole('group', { name: /trois carrés/i }).count()) >= 1);

  const poignee = page.locator('main [role="button"][aria-label*="Sommet C"]').first();
  check('M1 : la poignée du sommet C existe', (await poignee.count()) >= 1);

  const lireAires = async () => {
    const t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
    return [...t.matchAll(/carré sur \[[A-Z]{2}\]\s*([\d,]+)/g)].map((m) => Number(m[1].replace(',', '.')));
  };

  const avant = await lireAires();
  check('M1 : les trois aires sont affichées', avant.length === 3, JSON.stringify(avant));

  // On glisse la poignée dans plusieurs directions, en auditant à chaque fois.
  for (const [dx, dy] of [[-90, 40], [140, -30], [-40, -60]]) {
    await dragBy(page, poignee, dx, dy);
    await settle(page, 400);
    issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  }
  const apres = await lireAires();
  check('M1 : les aires CHANGENT quand on glisse C', JSON.stringify(avant) !== JSON.stringify(apres), `${avant} → ${apres}`);

  // L'égalité doit tenir : la balance affiche « = » et le mot « équilibrent ».
  const t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M1 : la balance reste équilibrée après le glissement', /s’équilibrent|s'équilibrent/.test(t), t.slice(0, 300));

  // Le clavier doit marcher aussi (chemin accessible).
  await poignee.focus();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await settle(page, 300);
  const clavier = await lireAires();
  check('M1 : le clavier déplace aussi le sommet', JSON.stringify(clavier) !== JSON.stringify(apres), `${apres} → ${clavier}`);

  // Le labo reste vivant après validation d'étape.
  check('M1 : la poignée reste active', (await poignee.count()) >= 1);
  await ctx.close();
}

/* ── 3. Module 2 : la balance penche quand C est libre ──────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/quand-langle-se-casse`, {
    key: KEY, completedModules: ['0', '1'], tag: 'M2',
  });
  const poignee = page.locator('main [role="button"][aria-label*="Sommet C"]').first();
  check('M2 : le sommet est libre (poignée présente)', (await poignee.count()) >= 1);

  await dragBy(page, poignee, 0, 90); // vers l'intérieur du cercle → obtus
  await settle(page, 500);
  const t1 = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M2 : la balance PENCHE quand on quitte le cercle', /penche/.test(t1), t1.slice(0, 300));
  check('M2 : l’angle affiché n’est plus droit', /obtus|aigu/.test(t1), t1.slice(0, 300));
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 4. Module 3 : le puzzle révèle le carré de l'hypoténuse ────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-puzzle`, {
    key: KEY, completedModules: ['0', '1', '2'], tag: 'M3',
  });
  check('M3 : le puzzle est un groupe nommé', (await page.getByRole('group', { name: /Puzzle/i }).count()) >= 1);
  let t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M3 : le trou est inconnu au départ', /pose les 4 pièces/.test(t), t.slice(0, 300));

  // Les libellés sont « poser bas à gauche », « poser haut à droite »… — on
  // clique les quatre boutons « poser … » restants, quel que soit leur ordre.
  for (let k = 0; k < 4; k += 1) {
    const b = page.locator('main button').filter({ hasText: /^poser / }).first();
    if (await b.count()) { await b.click({ force: true }); await settle(page, 300); }
  }
  t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M3 : les quatre pièces posées révèlent le carré du milieu', /côté 5/.test(t), t.slice(0, 400));
  // Le panneau affiche « le trou du milieu 25 côté 5 » : le texte est
  // concaténé sans espaces, donc pas de limite de mot exploitable.
  check('M3 : et son aire vaut 25', /trou du milieu\s*25/.test(t), t.slice(t.indexOf('trou du milieu') - 40, t.indexOf('trou du milieu') + 60));
  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 5. Chemin FAUX-EXPRÈS : l'invariant non bloquant ───────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/ecrire-puis-calculer`, {
    key: KEY, completedModules: ['0', '1', '2', '3'], tag: 'M4-faux',
  });
  // « 3 + 4 = c » : le piège du niveau.
  const piege = page.locator('main button').filter({ hasText: '3 + 4 = c' }).first();
  if (await piege.count()) { await piege.click({ force: true }); await settle(page, 700); }
  const html = await page.locator('main').first().innerHTML();
  check('M4 : la réponse fausse affiche la correction', /CARRÉS|carrés/.test(html), '');
  check('M4 : et l’étape se valide quand même (non bloquant)', /Combien vaut 3² \+ 4²|L’égalité s’écrit/.test(html.replace(/<[^>]+>/g, ' ')), '');
  await ctx.close();
}

/* ── 6. La carte des connaissances ──────────────────────────────────── */
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
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/ecrire-puis-calculer`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4'], tag: 'carte-4',
  });
  const trigger = page.locator('button[data-km-trigger]');
  if (await trigger.count()) {
    await trigger.first().click();
    await settle(page);
    const ids = await page.locator('#km-root [data-km-item]').evaluateAll((els) => els.map((e) => e.getAttribute('data-km-item')));
    check('carte : contient les acquis des modules 1 à 4',
      ids.includes('hypotenuse') && ids.includes('egalite-des-aires') && ids.includes('theoreme-pythagore'), ids.join(','));
    check('carte : AUCUNE fuite du module 6 (réciproque)',
      !ids.includes('reciproque') && !ids.includes('contraposee'), ids.join(','));
  }
  await ctx.close();
}

/* ── 7. Le boss, jusqu'à la synthèse ────────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/mission-finale-le-chantier`, {
    key: KEY, completedModules: TOUS, tag: 'boss',
  });
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
  check('boss : la carte complète porte les 8 connaissances', items === 8, `items=${items}`);
  await ctx.close();
}

/* ── 8. Mobile 375 px ───────────────────────────────────────────────── */
{
  for (const slug of ['les-trois-carres', 'le-puzzle']) {
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

/* ── 9. Verdicts globaux ────────────────────────────────────────────── */
check('mise en page : aucun débordement ni chevauchement', issues.length === 0, issues.slice(0, 6).join(' | '));
check('console : aucune erreur sur tout le parcours', errs.length === 0, errs.slice(0, 5).join(' | '));

await browser.close();
process.exit(summary());
