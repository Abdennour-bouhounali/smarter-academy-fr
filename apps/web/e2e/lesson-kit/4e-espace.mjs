// « Représentation de l'espace » (4e) — suite navigateur.
//
//   cd apps/web && (setsid nohup npx vite --port 5409 --strictPort > e2e/lesson-kit/shots/vite-5409.log 2>&1 </dev/null &)
//   KIT_BASE=http://localhost:5409 node apps/web/e2e/lesson-kit/4e-espace.mjs
//
// Ce que cette suite vérifie et qu'aucune garde de source ne voit :
//   · chaque module rend (une leçon non routée retombe sur l'accueil sans erreur) ;
//   · le labo signature VERSE vraiment, et la jauge se remplit au troisième ;
//   · changer une dimension remet le prisme à zéro (les solides restent jumeaux) ;
//   · les trois longueurs du M2 changent, et gardent leur ordre ;
//   · le patron du M3 REFUSE de se refermer avec la hauteur, et se referme
//     avec la bonne longueur — c'est le cœur pédagogique du module ;
//   · le cône du M4 naît d'une rotation, et le rapport affiché reste 3 ;
//   · un chemin faux progresse quand même ; la carte grandit sans fuite ;
//   · rien ne déborde à 375 px, et la console reste vide.
import {
  launch, open, check, summary, errs, settle, body, noHScroll,
  layoutAudit, aspectAudit, domOverflow, smallTargets, runBoss,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5409';
const LESSON = '/courses/college/4e/espace_geometrie/representations-espace-4e';
const KEY = 'u_anon_smarter_lesson_representations-espace-4e';
const SLUGS = [
  'mission-de-depart', 'trois-versements', 'la-pointe-et-le-plancher',
  'deplier-la-pyramide', 'le-cone-tourne-dun-triangle', 'les-deux-formules',
  'la-tente-et-le-cornet', 'mission-finale-lentrepot',
];
const TOUS = ['0', '1', '2', '3', '4', '5', '6', '7', '00', '01', '02', '03', '04', '05', '06', '07'];

const browser = await launch();
const issues = [];

/**
 * `open` avec UNE nouvelle tentative.
 *
 * Le serveur de développement est partagé : quand plusieurs leçons sont
 * écrites en parallèle, une recompilation peut faire dépasser les 30 s de
 * `page.goto`. Une seule navigation ratée faisait alors tomber toute la suite
 * — un défaut du HARNAIS, pas de la leçon. On réessaie une fois.
 */
async function ouvrir(url, opts = {}) {
  try {
    return await open(browser, url, opts);
  } catch {
    await new Promise((r) => setTimeout(r, 3000));
    return open(browser, url, opts);
  }
}
const texte = async (page) => (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');

/**
 * Balayage des curseurs, avec audit de mise en page à chaque butée.
 *
 * `sweepSliders` du kit cible `[role="slider"]` — un sélecteur CSS d'ATTRIBUT,
 * qui ne voit pas le rôle IMPLICITE d'un `<input type="range">`. Sur les labos
 * de cette leçon il ne trouvait donc aucun curseur et ne balayait rien : la
 * garde était silencieusement vide. On balaie ici les vrais éléments.
 */
async function balayer(page, issues) {
  const sliders = page.locator('main input[type="range"]');
  const n = await sliders.count();
  for (let i = 0; i < n; i += 1) {
    for (const [key, times] of [['End', 1], ['Home', 1], ['ArrowRight', 3]]) {
      await sliders.nth(i).focus().catch(() => {});
      for (let k = 0; k < times; k += 1) await page.keyboard.press(key);
      await page.waitForTimeout(250);
      issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)));
    }
  }
  return n;
}

/* ── 1. L'index et les huit modules rendent ─────────────────────────── */
{
  const { ctx, page } = await ouvrir(BASE + LESSON, { tag: 'index' });
  const t = await body(page);
  check('index : le titre de la leçon est rendu', /Représentation de l’espace|Représentation de l'espace/.test(t), t.slice(0, 200));
  check('index : les modules sont annoncés', /Trois versements/.test(t) && /Mission finale/.test(t));
  await ctx.close();

  for (const slug of SLUGS) {
    const { ctx: c, page: p } = await ouvrir(`${BASE}${LESSON}/${slug}`, {
      key: KEY, completedModules: TOUS, tag: slug,
    });
    // Le fallback d'une route paresseuse est un div VIDE : `open` ne peut pas
    // l'attendre, et un chunk froid (les labos SVG) met plus d'une seconde à
    // se compiler. On attend donc un contenu de module réel, pas juste <main>.
    await p.waitForFunction(
      () => (document.querySelector('main')?.innerText ?? '').length > 400,
      null, { timeout: 25000 }
    ).catch(() => {});
    await settle(p, 700);
    const b = await body(p);
    check(`${slug} : rend un vrai module`,
      b.length > 400 && !/Page introuvable/.test(b) && !/Découvre les maths autrement/.test(b),
      b.slice(0, 150));
    check(`${slug} : au moins deux commandes`, (await p.locator('main button').count()) >= 2);
    await c.close();
  }
}

/* ── 2. Le labo signature : verser jusqu'au troisième ───────────────── */
{
  const { ctx, page } = await ouvrir(`${BASE}${LESSON}/trois-versements`, { tag: 'M1' });
  check('M1 : le labo est un groupe nommé',
    (await page.getByRole('group', { name: /même base et même hauteur/i }).count()) >= 1);

  const verser = page.locator('main button').filter({ hasText: /^Verser une pyramide$/ }).first();
  check('M1 : le bouton « verser » existe', (await verser.count()) >= 1);

  let t = await texte(page);
  check('M1 : le prisme est vide au départ', /Le prisme est vide/.test(t), t.slice(0, 200));

  await verser.click({ force: true }); await settle(page, 350);
  t = await texte(page);
  check('M1 : un versement ne remplit PAS le prisme', /1 versement — il en manque encore/.test(t), t.slice(0, 300));

  await verser.click({ force: true }); await settle(page, 350);
  t = await texte(page);
  check('M1 : deux versements ne suffisent toujours pas', /2 versements — il en manque encore/.test(t), t.slice(0, 300));

  await verser.click({ force: true }); await settle(page, 500);
  t = await texte(page);
  check('M1 : le TROISIÈME versement remplit exactement', /3 versements — il est plein/.test(t), t.slice(0, 300));
  check('M1 : et la leçon le dit sans une goutte de trop', /Exactement 3 versements/.test(t), t.slice(0, 400));

  // Changer une dimension doit VIDER : sinon les deux solides ne seraient plus
  // jumeaux et la jauge mentirait.
  const sliders = page.locator('main input[type="range"]');
  check('M1 : deux réglages sont présents', (await sliders.count()) >= 2);
  await sliders.first().focus();
  await page.keyboard.press('ArrowRight');
  await settle(page, 400);
  t = await texte(page);
  check('M1 : changer une dimension REMET le prisme à zéro', /Le prisme est vide/.test(t), t.slice(0, 300));

  // Et il en faut encore exactement trois aux nouvelles dimensions.
  for (let k = 0; k < 3; k += 1) { await verser.click({ force: true }); await settle(page, 300); }
  t = await texte(page);
  check('M1 : trois versements suffisent AUX NOUVELLES dimensions', /3 versements — il est plein/.test(t), t.slice(0, 300));

  check('M1 : le labo reste actif (aucun gel après validation)', await verser.isEnabled());
  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 3. Module 2 : trois longueurs, un ordre qui ne bouge pas ───────── */
{
  const { ctx, page } = await ouvrir(`${BASE}${LESSON}/la-pointe-et-le-plancher`, {
    key: KEY, completedModules: ['0', '1'], tag: 'M2',
  });
  await page.waitForSelector('main input[type="range"]', { timeout: 20000 }).catch(() => {});
  await settle(page, 900);
  check('M2 : le labo des longueurs est un groupe nommé',
    (await page.getByRole('group', { name: /trois longueurs/i }).count()) >= 1);

  const lire = async () => {
    const t = await texte(page);
    return [...t.matchAll(/([\d]+(?:,[\d]+)?) cm/g)].map((m) => Number(m[1].replace(',', '.')));
  };
  const avant = await lire();
  check('M2 : au moins trois mesures sont affichées', avant.length >= 3, JSON.stringify(avant.slice(0, 6)));

  // L'ordre annoncé : la première ligne (hauteur) est la plus courte des trois.
  const troisPremieres = avant.slice(0, 3);
  check('M2 : l’ordre affiché est hauteur < deuxième < troisième',
    troisPremieres[0] < troisPremieres[1] && troisPremieres[1] < troisPremieres[2],
    JSON.stringify(troisPremieres));

  const sliders = page.locator('main input[type="range"]');
  await sliders.nth(1).focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await settle(page, 400);
  const apres = await lire();
  check('M2 : les longueurs CHANGENT quand on règle la hauteur',
    JSON.stringify(avant.slice(0, 3)) !== JSON.stringify(apres.slice(0, 3)),
    `${avant.slice(0, 3)} → ${apres.slice(0, 3)}`);
  check('M2 : l’ordre tient encore après réglage',
    apres[0] < apres[1] && apres[1] < apres[2], JSON.stringify(apres.slice(0, 3)));

  // Balayage complet des deux curseurs, avec audit à chaque butée.
  const n = await balayer(page, issues);
  check('M2 : les deux curseurs se pilotent au clavier', n >= 2, `n=${n}`);
  issues.push(...(await domOverflow(page)));
  await ctx.close();
}

/* ── 4. Module 3 : le patron REFUSE de se refermer avec la hauteur ──── */
{
  const { ctx, page } = await ouvrir(`${BASE}${LESSON}/deplier-la-pyramide`, {
    key: KEY, completedModules: ['0', '1', '2'], tag: 'M3',
  });
  check('M3 : le patron est un groupe nommé',
    (await page.getByRole('group', { name: /Patron/i }).count()) >= 1);

  const poser = async () => {
    for (let k = 0; k < 4; k += 1) {
      const b = page.locator('main button').filter({ hasText: /^poser / }).first();
      if (await b.count()) { await b.click({ force: true }); await settle(page, 250); }
    }
  };

  // Le choix par défaut est la HAUTEUR de la pyramide — le piège du niveau.
  await poser();
  let verdict = page.locator('[data-patron-verdict]').first();
  check('M3 : un verdict est rendu une fois les quatre triangles posés', (await verdict.count()) >= 1);
  check('M3 : avec la HAUTEUR, le patron reste OUVERT',
    (await verdict.getAttribute('data-patron-verdict')) === 'ouvert',
    await verdict.textContent());
  let t = await texte(page);
  check('M3 : et la leçon dit quelle longueur il aurait fallu', /Il aurait fallu 7,21 cm/.test(t), t.slice(0, 400));

  // On change pour la bonne longueur : le patron doit se refermer.
  const radios = page.locator('main input[name="patron-longueur-e1"]');
  check('M3 : les trois candidates sont proposées', (await radios.count()) === 3, `n=${await radios.count()}`);
  await radios.nth(1).check({ force: true });
  await settle(page, 400);
  // Le labo est rendu dans DEUX étapes : « à zéro » veut dire qu'aucun
  // triangle n'est marqué posé (aucun bouton « ✓ triangle … » nulle part).
  check('M3 : changer de longueur REMET le patron à zéro',
    (await page.locator('main button').filter({ hasText: /^✓ triangle / }).count()) === 0,
    `posés = ${await page.locator('main button').filter({ hasText: /^✓ triangle / }).count()}`);
  check('M3 : aucun verdict tant que le patron n’est pas reconstruit',
    (await page.locator('[data-patron-verdict]').count()) === 0);

  await poser();
  verdict = page.locator('[data-patron-verdict]').first();
  check('M3 : avec la longueur du MILIEU, le patron se REFERME',
    (await verdict.getAttribute('data-patron-verdict')) === 'ferme',
    await verdict.textContent());

  // La troisième candidate — l'arête — doit échouer elle aussi.
  await radios.nth(2).check({ force: true });
  await settle(page, 400);
  await poser();
  verdict = page.locator('[data-patron-verdict]').first();
  check('M3 : avec l’ARÊTE, le patron reste OUVERT lui aussi',
    (await verdict.getAttribute('data-patron-verdict')) === 'ouvert',
    await verdict.textContent());

  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 5. Module 4 : le cône naît d'une rotation, et le tiers revient ─── */
{
  const { ctx, page } = await ouvrir(`${BASE}${LESSON}/le-cone-tourne-dun-triangle`, {
    key: KEY, completedModules: ['0', '1', '2', '3'], tag: 'M4',
  });
  check('M4 : le labo de révolution est un groupe nommé',
    (await page.getByRole('group', { name: /rotation/i }).count()) >= 1);

  let t = await texte(page);
  check('M4 : le solide n’est pas encore fermé au départ', /à parcourir pour fermer le solide/.test(t), t.slice(0, 300));

  // Le premier curseur est la rotation : End le pousse à 360°.
  const rotation = page.locator('main input[type="range"]').first();
  await rotation.focus();
  await page.keyboard.press('End');
  await settle(page, 500);
  t = await texte(page);
  check('M4 : le tour complet ferme le solide', /Le tour est complet/.test(t), t.slice(0, 400));

  const rapport = page.locator('[data-rev-rapport]').first();
  check('M4 : le rapport cône / cylindre est publié', (await rapport.count()) >= 1);
  check('M4 : et il vaut 3', Number(await rapport.getAttribute('data-rev-rapport')) === 3,
    await rapport.getAttribute('data-rev-rapport'));

  // Changer les dimensions ne doit PAS déplacer le 3.
  for (const i of [1, 2]) {
    await page.locator('main input[type="range"]').nth(i).focus();
    await page.keyboard.press('End');
    await settle(page, 350);
    issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)));
  }
  check('M4 : le rapport reste 3 aux dimensions extrêmes',
    Number(await page.locator('[data-rev-rapport]').first().getAttribute('data-rev-rapport')) === 3,
    await page.locator('[data-rev-rapport]').first().getAttribute('data-rev-rapport'));

  issues.push(...(await domOverflow(page)));
  await ctx.close();
}

/* ── 6. Chemin FAUX-EXPRÈS : l'invariant non bloquant ───────────────── */
{
  const { ctx, page } = await ouvrir(`${BASE}${LESSON}/les-deux-formules`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4'], tag: 'M5-faux',
  });
  await page.waitForSelector('main button[aria-pressed]', { timeout: 15000 }).catch(() => {});
  await settle(page, 700);
  // L'étape 2 (celle qui porte le piège) est verrouillée tant que l'étape 1
  // n'a pas été répondue : on ouvre d'abord le chemin.
  const etape1 = page.locator('main button[aria-pressed]')
    .filter({ hasText: /Seulement la façon de calculer/ }).first();
  if (await etape1.count()) { await etape1.click({ force: true }); await settle(page, 900); }

  // « B × h » : le tiers oublié, le piège central de la leçon.
  const piege = page.locator('main button[aria-pressed]').filter({ hasText: /^B × h$/ }).first();
  check('M5 : le piège « B × h » est proposé à l’étape 2', (await piege.count()) >= 1);
  if (await piege.count()) { await piege.click({ force: true }); await settle(page, 900); }
  const t = await texte(page);
  check('M5 : la réponse fausse affiche la correction chiffrée', /prisme jumeau/.test(t), t.slice(0, 500));
  check('M5 : et l’étape se valide quand même (non bloquant)',
    /Applique-la à la pyramide/.test(t), t.slice(0, 600));
  await ctx.close();
}

/* ── 7. La carte des connaissances ──────────────────────────────────── */
{
  const { ctx, page } = await ouvrir(BASE + LESSON, { tag: 'carte-vide' });
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
  const { ctx, page } = await ouvrir(`${BASE}${LESSON}/le-cone-tourne-dun-triangle`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4'], tag: 'carte-4',
  });
  await page.waitForSelector('button[data-km-trigger]', { timeout: 15000 }).catch(() => {});
  await settle(page, 800);
  const trigger = page.locator('button[data-km-trigger]');
  if (await trigger.count()) {
    await trigger.first().click();
    await settle(page);
    const ids = await page.locator('#km-root [data-km-item]').evaluateAll((els) => els.map((e) => e.getAttribute('data-km-item')));
    check('carte : contient les acquis des modules 1 à 4',
      ids.includes('tiers-pyramide') && ids.includes('base-et-hauteur')
      && ids.includes('patron-pyramide') && ids.includes('cone-de-revolution'), ids.join(','));
    check('carte : AUCUNE fuite des modules 5 et 6',
      !ids.includes('volume-pyramide') && !ids.includes('volume-cone')
      && !ids.includes('methode-probleme-volume'), ids.join(','));
  }
  await ctx.close();
}

/* ── 8. Le boss, jusqu'à la synthèse ────────────────────────────────── */
{
  const { ctx, page } = await ouvrir(`${BASE}${LESSON}/mission-finale-lentrepot`, {
    key: KEY, completedModules: TOUS, tag: 'boss',
  });
  await page.waitForSelector('main div[role="group"]', { timeout: 20000 }).catch(() => {});
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
  if (await synth.count()) { await synth.click({ force: true }); await settle(page, 1400); }
  check('boss : la synthèse rend la carte COMPLÈTE', (await page.locator('[data-knowledge-snapshot="complete"]').count()) >= 1);
  const items = await page.locator('[data-km-item]').count();
  check('boss : la carte complète porte les 9 connaissances', items === 9, `items=${items}`);
  await ctx.close();
}

/* ── 9. Mobile 375 px ───────────────────────────────────────────────── */
{
  for (const slug of ['trois-versements', 'la-pointe-et-le-plancher', 'deplier-la-pyramide', 'le-cone-tourne-dun-triangle']) {
    const { ctx, page } = await ouvrir(`${BASE}${LESSON}/${slug}`, {
      key: KEY, completedModules: TOUS, mobile: true, tag: `mob-${slug}`,
    });
    // Le chunk paresseux du labo peut encore naviguer : mesurer avant qu'il
    // soit monté détruit le contexte d'exécution (défaut vu ici même).
    await page.waitForSelector('main [role="group"]', { timeout: 20000 }).catch(() => {});
    await settle(page, 900);
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
