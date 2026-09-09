// « Triangles : démontrer » (4e) — suite navigateur.
//
//   cd apps/web && (setsid nohup npx vite --port 5408 --strictPort > e2e/lesson-kit/shots/vite-5408.log 2>&1 </dev/null &)
//   KIT_BASE=http://localhost:5408 node apps/web/e2e/lesson-kit/4e-triangles.mjs
//
// Ce que cette suite vérifie et qu'aucune garde de source ne voit :
//   · chaque module rend (une leçon non routée retombe sur l'accueil sans erreur) ;
//   · le sommet C se GLISSE vraiment, et les deux témoins bougent ensemble ;
//   · la cible « angle droit » est réellement ATTEIGNABLE au navigateur, à la
//     souris comme au clavier — c'est le cœur du module 1 ;
//   · la figure ne sort jamais de son cadre, à aucune position ;
//   · le point K du module 4 glisse le long de [AC] et le trait devient parallèle ;
//   · le tri du module 5 rend son verdict, et la preuve du module 6 s'assemble ;
//   · un chemin faux progresse quand même ; la carte grandit sans fuite ;
//   · rien ne déborde à 375 px, et la console reste vide.
import {
  launch, open, check, summary, errs, settle, body, noHScroll,
  layoutAudit, aspectAudit, domOverflow, smallTargets, dragBy, runBoss,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5408';
const LESSON = '/courses/college/4e/espace_geometrie/triangles-4e';
const KEY = 'u_anon_smarter_lesson_triangles-4e';
const SLUGS = [
  'mission-de-depart', 'le-cercle-qui-trahit', 'le-demi-tour-du-detective',
  'deux-milieux-une-droite', 'et-dans-lautre-sens', 'le-tri-du-detective',
  'rediger-la-preuve', 'mission-finale-le-dossier',
];
const TOUS = ['0', '1', '2', '3', '4', '5', '6', '7', '00', '01', '02', '03', '04', '05', '06', '07'];

const browser = await launch();
const issues = [];

/** Le texte de <main>, normalisé — les espaces fines de fr-FR cassent les littéraux. */
const texte = async (page) => (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');

/* ── 1. L'index et les huit modules rendent ─────────────────────────── */
{
  const { ctx, page } = await open(browser, BASE + LESSON, { tag: 'index' });
  const t = await body(page);
  check('index : le titre de la leçon est rendu', /Triangles/.test(t), t.slice(0, 200));
  check('index : les modules sont annoncés', /Le cercle qui trahit/.test(t) && /Mission finale/.test(t));
  await ctx.close();

  for (const slug of SLUGS) {
    const { ctx: c, page: p } = await open(browser, `${BASE}${LESSON}/${slug}`, {
      key: KEY, completedModules: TOUS, tag: slug,
    });
    await settle(p, 500);
    const b = await body(p);
    check(`${slug} : rend un vrai module`, b.length > 400 && !/Page introuvable/.test(b) && !/Découvre les maths autrement/.test(b), b.slice(0, 150));
    check(`${slug} : au moins deux commandes`, (await p.locator('main button').count()) >= 2);
    await c.close();
  }
}

/* ── 2. Le labo signature : glisser C, et ATTEINDRE la cible ────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-cercle-qui-trahit`, { tag: 'M1' });
  check('M1 : le labo est un groupe nommé', (await page.getByRole('group', { name: /cercle circonscrit/i }).count()) >= 1);

  const poignee = page.locator('main [role="button"][aria-label*="Sommet C"]').first();
  check('M1 : la poignée du sommet C existe', (await poignee.count()) >= 1);

  const lire = async (nom) => {
    const el = page.locator(`main [data-lab="${nom}"]`).first();
    if (!(await el.count())) return null;
    return Number((await el.textContent()).replace('°', '').replace(',', '.').trim());
  };

  const angleAvant = await lire('angle-c');
  const ecartAvant = await lire('ecart-om');
  check('M1 : l’angle en C est affiché dans le DOM', angleAvant !== null, String(angleAvant));
  check('M1 : l’écart O—M est affiché dans le DOM', ecartAvant !== null, String(ecartAvant));
  check('M1 : la position de DÉPART n’est pas déjà la solution',
    angleAvant !== null && Math.abs(angleAvant - 90) > 5, `angle de départ ${angleAvant}°`);

  // On glisse dans plusieurs directions, en auditant la mise en page à chaque fois.
  for (const [dx, dy] of [[-70, 30], [120, -40], [-50, -50]]) {
    await dragBy(page, poignee, dx, dy);
    await settle(page, 400);
    issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  }
  const angleApres = await lire('angle-c');
  check('M1 : l’angle CHANGE quand on glisse C', angleApres !== angleAvant, `${angleAvant}° → ${angleApres}°`);

  // LES DEUX TÉMOINS NE SE CONTREDISENT JAMAIS — le message de garde du lab.
  check('M1 : les deux témoins ne se contredisent jamais', !/se contredisent/.test(await texte(page)));

  // LA CIBLE EST ATTEIGNABLE AU CLAVIER. C'est LE test du module : le pas de
  // 4 unités doit permettre de traverser la bande gagnante sans l'enjamber.
  // Même précaution qu'au module 4 : on refocalise à chaque tour.
  let gagne = false;
  for (let i = 0; i < 90 && !gagne; i += 1) {
    const a = await lire('angle-c');
    if (a === null) break;
    if (Math.abs(a - 90) <= 1.2) { gagne = true; break; }
    await poignee.focus();
    await page.keyboard.press(a > 90 ? 'ArrowUp' : 'ArrowDown');
    await settle(page, 45);
  }
  // Le texte est relu APRÈS stabilisation : la boucle sort dès qu'un rendu
  // annonce la réussite, et les cartes de lecture peuvent encore être d'un
  // rendu de retard.
  await settle(page, 700);
  const tFinal = await texte(page);
  check('M1 : la cible « angle droit » est ATTEIGNABLE au clavier',
    gagne || /Angle droit trouvé/.test(tFinal), `angle final ${await lire('angle-c')}°`);
  // L'écart affiché n'est pas forcément « 0,0 » : la tolérance laisse à l'élève
  // le droit d'être imprécis, et l'honnêteté de la figure exige d'afficher ce
  // qu'on mesure. Ce qui doit basculer, c'est le VERDICT — « O est sur M » — et
  // c'est lui qu'on vérifie, ainsi qu'un écart devenu négligeable.
  const ecartFinal = await lire('ecart-om');
  check('M1 : au but, l’écart O—M devient négligeable', ecartFinal !== null && ecartFinal <= 0.5, String(ecartFinal));
  check('M1 : et le verdict bascule sur « O est sur M »', /O est sur M/.test(tFinal), tFinal.slice(0, 400));
  check('M1 : le message annonce que les deux témoins sont d’accord',
    /les deux témoins sont d’accord|O est venu se poser exactement/.test(tFinal), tFinal.slice(0, 400));

  // Le labo reste vivant après validation d'étape.
  check('M1 : la poignée reste active après la réussite', (await poignee.count()) >= 1);
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 3. Module 2 : 90° partout sur le cercle ────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-demi-tour-du-detective`, {
    key: KEY, completedModules: ['0', '1'], tag: 'M2',
  });
  for (const label of ['Tout en haut', 'Près de A', 'Près de B']) {
    const b = page.locator('main button').filter({ hasText: label }).first();
    if (await b.count()) { await b.click({ force: true }); await settle(page, 300); }
  }
  const t = await texte(page);
  check('M2 : les trois positions donnent toutes 90,0°',
    (t.match(/90,0°/g) || []).length >= 3, t.slice(0, 400));
  check('M2 : le constat « 90° partout » est annoncé', /90° partout/.test(t), t.slice(0, 400));
  check('M2 : le rapport CM ÷ AB vaut 0,50', /0,50/.test(t), t.slice(0, 400));
  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 4. Module 3 : les deux nombres qui ne bougent pas ──────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/deux-milieux-une-droite`, {
    key: KEY, completedModules: ['0', '1', '2'], tag: 'M3',
  });
  check('M3 : le labo est un groupe nommé', (await page.getByRole('group', { name: /droite des milieux/i }).count()) >= 1);
  const poignee = page.locator('main [role="button"][aria-label*="Sommet A"]').first();
  check('M3 : la poignée du sommet A existe', (await poignee.count()) >= 1);

  const lireAngle = async () => (await page.locator('main [data-lab="angle-milieux"]').first().textContent()).trim();
  const lireRapport = async () => (await page.locator('main [data-lab="rapport-milieux"]').first().textContent()).trim();

  const releve = async () => {
    const b = page.locator('main button').filter({ hasText: /Relever cette forme/ }).first();
    if (await b.count()) { await b.click({ force: true }); await settle(page, 250); }
  };
  await releve();
  for (const [dx, dy] of [[-100, 40], [180, -20], [-60, 60]]) {
    await dragBy(page, poignee, dx, dy);
    await settle(page, 350);
    check(`M3 : l’angle reste 0,0° après un glissement de (${dx},${dy})`, (await lireAngle()) === '0,0°', await lireAngle());
    check(`M3 : le rapport reste 0,50 après ce glissement`, (await lireRapport()) === '0,50', await lireRapport());
    await releve();
    issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  }
  const t = await texte(page);
  check('M3 : le tableau de relevés annonce la constance', /0,0° et 0,50|refusent de bouger|ne bougent pas/.test(t), t.slice(0, 400));
  await ctx.close();
}

/* ── 5. Module 4 : le point K, et la cible étroite ──────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/et-dans-lautre-sens`, {
    key: KEY, completedModules: ['0', '1', '2', '3'], tag: 'M4',
  });
  const poignee = page.locator('main [role="button"][aria-label*="Point K"]').first();
  check('M4 : la poignée du point K existe', (await poignee.count()) >= 1);

  const lireT = async () => Number((await page.locator('main [data-lab="t-de-k"]').first().textContent()).replace(',', '.'));
  const lireAngle = async () => Number((await page.locator('main [data-lab="angle-milieux"]').first().textContent()).replace('°', '').replace(',', '.'));

  check('M4 : la position de départ n’est PAS parallèle', (await lireAngle()) > 1, `${await lireAngle()}°`);
  check('M4 : le côté [AC] ne porte AUCUNE marque de milieu au départ',
    !/K est le milieu de \[AC\]/.test(await texte(page)));

  // On cherche la cible au clavier : c'est le chemin le plus reproductible, et
  // c'est celui qui a révélé le défaut de pas trop grand en test unitaire.
  // On REFOCALISE à chaque tour : un rendu de React peut remonter la poignée et
  // lui faire perdre le focus, auquel cas les flèches partiraient dans le vide
  // et l'échec ressemblerait à un défaut du composant.
  let trouve = false;
  for (let i = 0; i < 90 && !trouve; i += 1) {
    const t = await lireT();
    if (!Number.isFinite(t)) break;
    await poignee.focus();
    await page.keyboard.press(t < 0.5 ? 'ArrowRight' : 'ArrowLeft');
    await settle(page, 45);
    if ((await lireAngle()) === 0) trouve = true;
  }
  await settle(page, 700);
  check('M4 : la position parallèle est ATTEIGNABLE au clavier', trouve || (await lireAngle()) === 0, `t=${await lireT()} angle=${await lireAngle()}°`);
  const t4 = await texte(page);
  check('M4 : au but, K est déclaré milieu de [AC]', /K est le milieu de \[AC\]/.test(t4), t4.slice(0, 400));
  check('M4 : et le rapport y affiche 0,50', /0,50/.test(t4), t4.slice(0, 400));
  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 6. Module 5 : le tri, et le contre-exemple ─────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-tri-du-detective`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4'], tag: 'M5',
  });
  const boutons = page.locator('main button').filter({ hasText: /^(Définition|Propriété|Caractérisation)$/ });
  // Le compte est lu APRÈS stabilisation, et une seule fois : sous charge, les
  // huit cartes n'apparaissent pas toutes dans le même rendu, et compter deux
  // fois donnerait un verdict et un détail contradictoires.
  await settle(page, 800);
  const nbBoutons = await boutons.count();
  check('M5 : les huit énoncés portent leurs trois boutons (8 × 3)', nbBoutons === 24, String(nbBoutons));

  // On classe tout en « Propriété » : c'est un chemin volontairement FAUX pour
  // trois cartes, et l'étape doit malgré tout progresser (invariant non bloquant).
  for (let i = 0; i < nbBoutons; i += 1) {
    const b = boutons.nth(i);
    if ((await b.textContent()).trim() === 'Propriété') { await b.click({ force: true }); await settle(page, 60); }
  }
  await settle(page, 400);
  const t = await texte(page);
  check('M5 : chaque carte rend son verdict', /C’est bien une|Non : c’est une/.test(t), t.slice(0, 300));
  check('M5 : le tri annonce le décompte, même avec des erreurs', /classements justes sur 8/.test(t), t.slice(-400));
  check('M5 : les réciproques FAUSSES sont signalées', /Réciproque : FAUSSE/.test(t), t.slice(0, 600));
  check('M5 : une définition dit « sans objet », jamais « fausse »', /Réciproque : sans objet/.test(t), t.slice(0, 600));
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 7. Module 6 : la preuve s'assemble, et refuse l'incomplet ──────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/rediger-la-preuve`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4', '5'], tag: 'M6',
  });
  const carte = (motif) => page.locator('main button').filter({ hasText: motif }).first();

  // CHEMIN FAUX D'ABORD : donnée puis conclusion, sans propriété. Le verdict
  // doit NOMMER ce qui manque, et l'étape ne doit pas se bloquer.
  await carte(/On sait que les points R, S et T/).click({ force: true });
  await settle(page, 250);
  await carte(/Donc le triangle RST est rectangle en S\.$/).click({ force: true });
  await settle(page, 400);
  let t = await texte(page);
  check('M6 : une conclusion sans propriété est REFUSÉE', /Charpente incomplète/.test(t), t.slice(0, 500));
  check('M6 : …et le verdict nomme la propriété manquante', /aucune propriété du cours/.test(t), t.slice(0, 500));

  // On retire la conclusion, on pose la propriété, puis on reconclut.
  await page.locator('main button').filter({ hasText: /Retirer la dernière étape/ }).first().click({ force: true });
  await settle(page, 250);
  await carte(/Or, si un triangle est inscrit dans un cercle dont un côté est un diamètre/).click({ force: true });
  await settle(page, 250);
  await carte(/Donc le triangle RST est rectangle en S\.$/).click({ force: true });
  await settle(page, 500);
  t = await texte(page);
  check('M6 : la preuve complète est acceptée', /Démonstration complète/.test(t), t.slice(0, 600));
  check('M6 : la jauge montre les trois rôles', /Donnée.*Propriété.*Conclusion/.test(t), t.slice(0, 400));
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 8. La carte des connaissances ──────────────────────────────────── */
{
  const { ctx, page } = await open(browser, BASE + LESSON, { tag: 'carte-vide' });
  await settle(page, 700);
  const trigger = page.locator('button[data-km-trigger]');
  check('carte : le déclencheur est monté', (await trigger.count()) >= 1);
  if (await trigger.count()) {
    await trigger.first().click();
    await settle(page, 900);
    check('carte : vide avant tout module validé', (await page.locator('#km-root [data-km-item]').count()) === 0);
  }
  await ctx.close();
}
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/deux-milieux-une-droite`, {
    key: KEY, completedModules: ['0', '1', '2', '3'], tag: 'carte-3',
  });
  await settle(page, 700);
  const trigger = page.locator('button[data-km-trigger]');
  if (await trigger.count()) {
    await trigger.first().click();
    await settle(page, 900);
    const ids = await page.locator('#km-root [data-km-item]').evaluateAll((els) => els.map((e) => e.getAttribute('data-km-item')));
    check('carte : contient les acquis des modules 1 à 3',
      ids.includes('hypotenuse-diametre') && ids.includes('cercle-circonscrit-rectangle')
      && ids.includes('caracterisation-rectangle') && ids.includes('droite-des-milieux'), ids.join(','));
    check('carte : AUCUNE fuite des modules 4 à 6',
      !ids.includes('reciproque-milieux') && !ids.includes('propriete-et-reciproque')
      && !ids.includes('charpente-demonstration'), ids.join(','));
  }
  await ctx.close();
}

/* ── 9. Le boss, jusqu'à la synthèse ────────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/mission-finale-le-dossier`, {
    key: KEY, completedModules: TOUS, tag: 'boss',
  });
  await settle(page, 900);
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
  if (await synth.count()) { await synth.click({ force: true }); await settle(page, 2000); }
  check('boss : la synthèse rend la carte COMPLÈTE', (await page.locator('[data-knowledge-snapshot="complete"]').count()) >= 1);
  const items = await page.locator('[data-km-item]').count();
  check('boss : la carte complète porte les 8 connaissances', items === 8, `items=${items}`);
  await ctx.close();
}

/* ── 10. Mobile 375 px ──────────────────────────────────────────────── */
{
  for (const slug of ['le-cercle-qui-trahit', 'et-dans-lautre-sens', 'rediger-la-preuve']) {
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

/* ── 11. Verdicts globaux ───────────────────────────────────────────── */
check('mise en page : aucun débordement ni chevauchement', issues.length === 0, issues.slice(0, 6).join(' | '));
check('console : aucune erreur sur tout le parcours', errs.length === 0, errs.slice(0, 5).join(' | '));

await browser.close();
process.exit(summary());
