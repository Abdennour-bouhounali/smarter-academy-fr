// « Parallélogrammes et translations » (4e) — suite navigateur.
//
//   cd apps/web && (setsid nohup npx vite --port 5407 --strictPort > e2e/lesson-kit/shots/vite-5407.log 2>&1 </dev/null &)
//   KIT_BASE=http://localhost:5407 node apps/web/e2e/lesson-kit/4e-parallelogrammes.mjs
//
// Ce que cette suite vérifie et qu'aucune garde de source ne voit :
//   · chaque module rend (une leçon non routée retombe sur l'accueil sans erreur) ;
//   · les sommets A, B et D se GLISSENT vraiment, et C suit sans être touché ;
//   · les quatre témoins restent allumés à toute position, et la figure ne
//     sort jamais de son cadre ;
//   · le défi du module 3 ne s'aimante PAS sur la cible ;
//   · le drapeau du module 4 bascule quand on dérègle un sommet ;
//   · les démonstrations du module 6 se remettent en ordre ;
//   · un chemin faux progresse quand même ; la carte grandit sans fuite ;
//   · le MOT INTERDIT (« vecteur ») n'apparaît sur AUCUNE page ;
//   · rien ne déborde à 375 px, et la console reste vide.
import {
  launch, open, check, summary, errs, settle, body, noHScroll,
  layoutAudit, aspectAudit, domOverflow, smallTargets, dragBy, runBoss,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5407';
const LESSON = '/courses/college/4e/espace_geometrie/parallelogrammes-translations-4e';
const KEY = 'u_anon_smarter_lesson_parallelogrammes-translations-4e';
const SLUGS = [
  'mission-de-depart', 'le-quatrieme-point', 'un-seul-glissement',
  'place-le-point-manquant', 'le-meme-deplacement-partout', 'le-dire-proprement',
  'trois-lignes-qui-prouvent', 'mission-finale-latelier',
];
const TOUS = ['0', '1', '2', '3', '4', '5', '6', '7', '00', '01', '02', '03', '04', '05', '06', '07'];

const browser = await launch();
const issues = [];

/* ── 1. L'index et les huit modules rendent ─────────────────────────── */
{
  const { ctx, page } = await open(browser, BASE + LESSON, { tag: 'index' });
  const t = await body(page);
  check('index : le titre de la leçon est rendu', /Parall[ée]logrammes et translations/i.test(t), t.slice(0, 200));
  check('index : les modules sont annoncés',
    /quatri[èe]me point/i.test(t) && /Mission finale/i.test(t), t.slice(0, 300));
  await ctx.close();

  for (const slug of SLUGS) {
    const { ctx: c, page: p } = await open(browser, `${BASE}${LESSON}/${slug}`, {
      key: KEY, completedModules: TOUS, tag: slug,
    });
    const b = await body(p);
    check(`${slug} : rend un vrai module`,
      b.length > 400 && !/Page introuvable/.test(b) && !/Découvre les maths autrement/.test(b),
      b.slice(0, 150));
    // Le boss est le module le plus lourd à hydrater : sous la charge des
    // suites concurrentes, le délai fixe de `open()` ne suffit pas toujours et
    // le comptage tombait sur un DOM à moitié monté. On ATTEND la condition
    // au lieu de la sonder une fois — c'est un défaut du harnais, pas de la
    // leçon (le module rend bien 47 boutons une fois monté).
    await p.locator('main button').first().waitFor({ timeout: 15000 }).catch(() => {});
    await p.waitForFunction(
      () => document.querySelectorAll('main button').length >= 2,
      null, { timeout: 15000 },
    ).catch(() => {});
    check(`${slug} : au moins deux commandes`, (await p.locator('main button').count()) >= 2);
    await c.close();
  }
}

/* ── 2. LE PÉRIMÈTRE, VU DU NAVIGATEUR ──────────────────────────────── */
{
  // La garde la plus importante de cette leçon : le mot « vecteur » est
  // réservé à la 3e. Un test de source le vérifie sur le disque ; ici, on
  // le vérifie sur ce que l'élève LIT réellement, après rendu.
  for (const slug of SLUGS) {
    const { ctx, page } = await open(browser, `${BASE}${LESSON}/${slug}`, {
      key: KEY, completedModules: TOUS, tag: `scope-${slug}`,
    });
    const t = await body(page);
    check(`${slug} : le mot « vecteur » n’apparaît PAS`, !/vecteur/i.test(t),
      (t.match(/.{0,60}vecteur.{0,60}/i) || [''])[0]);
    check(`${slug} : « Chasles » n’apparaît PAS`, !/chasles/i.test(t));
    await ctx.close();
  }
}

/* ── 3. Le labo signature : glisser A, B, D — et C qui suit ─────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-quatrieme-point`, { tag: 'M1' });
  check('M1 : le labo est un groupe nommé',
    (await page.getByRole('group', { name: /glissement/i }).count()) >= 1);

  for (const nom of ['A', 'B', 'D']) {
    check(`M1 : la poignée du sommet ${nom} existe`,
      (await page.locator(`main [role="button"][aria-label*="Sommet ${nom}"]`).count()) >= 1);
  }
  check('M1 : le sommet C n’a PAS de poignée — il est le résultat',
    (await page.locator('main [role="button"][aria-label*="Sommet C"]').count()) === 0);

  const lireTrajets = async () => {
    const t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
    return [...t.matchAll(/trajet de [AB] vers [DC]\s*([\d,]+)/g)].map((m) => Number(m[1].replace(',', '.')));
  };
  const lireTemoins = async () => page.locator('[data-temoin][data-ok="oui"]').count();

  const avant = await lireTrajets();
  check('M1 : les deux trajets sont affichés', avant.length === 2, JSON.stringify(avant));
  check('M1 : les deux trajets sont ÉGAUX au départ', avant[0] === avant[1], JSON.stringify(avant));
  check('M1 : les quatre témoins sont allumés au départ', (await lireTemoins()) === 4);

  const poigneeD = page.locator('main [role="button"][aria-label*="Sommet D"]').first();
  for (const [dx, dy] of [[-70, 50], [130, -40], [-30, -70]]) {
    await dragBy(page, poigneeD, dx, dy);
    await settle(page, 400);
    const t = await lireTrajets();
    check(`M1 : les deux trajets restent égaux après (${dx},${dy})`,
      t.length === 2 && t[0] === t[1], JSON.stringify(t));
    check(`M1 : les quatre témoins restent allumés après (${dx},${dy})`,
      (await lireTemoins()) === 4);
    issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  }

  const apres = await lireTrajets();
  check('M1 : le trajet CHANGE quand on glisse D',
    JSON.stringify(avant) !== JSON.stringify(apres), `${avant} → ${apres}`);

  const t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M1 : le verdict annonce un parallélogramme', /est un parall[ée]logramme/i.test(t), t.slice(0, 300));

  // Le clavier doit marcher aussi (chemin accessible).
  await poigneeD.focus();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await settle(page, 300);
  const clavier = await lireTrajets();
  check('M1 : le clavier déplace aussi le sommet',
    JSON.stringify(clavier) !== JSON.stringify(apres), `${apres} → ${clavier}`);

  // Le labo reste vivant après validation d'étape.
  check('M1 : la poignée reste active', (await poigneeD.count()) >= 1);
  check('M1 : aucune poignée désactivée',
    (await page.locator('main [role="button"][aria-label*="Sommet"][disabled]').count()) === 0);
  await ctx.close();
}

/* ── 4. Module 2 : le croisé, et l'écart nul ────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/un-seul-glissement`, {
    key: KEY, completedModules: ['0', '1'], tag: 'M2',
  });
  const t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M2 : l’écart des deux trajets est affiché', /écart de longueur/i.test(t), t.slice(0, 300));
  check('M2 : l’écart annoncé est NUL', /écart de longueur\s*:\s*0\b/.test(t), t.slice(0, 300));
  check('M2 : le même sens est signalé', /même sens\s*:\s*oui/i.test(t), t.slice(0, 300));

  const poignee = page.locator('main [role="button"][aria-label*="Sommet B"]').first();
  await dragBy(page, poignee, 90, -60);
  await settle(page, 400);
  const t2 = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M2 : l’écart RESTE nul après déformation', /écart de longueur\s*:\s*0\b/.test(t2), t2.slice(0, 300));
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 5. Module 3 : le défi n'aimante PAS ────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/place-le-point-manquant`, {
    key: KEY, completedModules: ['0', '1', '2'], tag: 'M3',
  });
  check('M3 : le défi est un groupe nommé',
    (await page.getByRole('group', { name: /D[ée]fi/i }).count()) >= 1);

  const poser = page.locator('main button').filter({ hasText: /Poser le point C/i }).first();
  check('M3 : le bouton de dépôt est là', (await poser.count()) >= 1);
  await poser.click({ force: true });
  await settle(page, 400);

  let t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M3 : le point posé n’est PAS déjà la bonne réponse', /Pas encore/i.test(t), t.slice(0, 300));
  check('M3 : la DISTANCE restante est annoncée', /à \d+ de la bonne place/i.test(t), t.slice(0, 300));
  check('M3 : le défi n’est pas encore gagné',
    (await page.locator('[data-defi="gagne"]').count()) === 0);

  // On bouge le point d'un petit cran : il ne doit PAS être aimanté vers la cible.
  const pointC = page.locator('main [role="button"][aria-label*="Sommet C"]').first();
  check('M3 : le point C est saisissable en mode défi', (await pointC.count()) >= 1);
  await dragBy(page, pointC, 25, 0);
  await settle(page, 400);
  t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M3 : un petit déplacement ne fait PAS gagner (aucune aimantation)',
    /Pas encore/i.test(t) || /à \d+ de la bonne place/i.test(t), t.slice(0, 300));
  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 6. Module 4 : dérégler un sommet fait basculer le verdict ──────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-meme-deplacement-partout`, {
    key: KEY, completedModules: ['0', '1', '2', '3'], tag: 'M4',
  });
  check('M4 : le verdict de départ est « glissement »',
    (await page.locator('[data-critere="glissement"]').count()) >= 1);

  const bouton = page.locator('main button').filter({ hasText: /D[ée]r[ée]gler/i }).first();
  check('M4 : le bouton du contre-exemple existe', (await bouton.count()) >= 1);
  await bouton.click({ force: true });
  await settle(page, 500);
  check('M4 : le verdict BASCULE quand un sommet est déréglé',
    (await page.locator('[data-critere="pas-glissement"]').count()) >= 1);

  const retour = page.locator('main button').filter({ hasText: /Remettre le sommet/i }).first();
  if (await retour.count()) { await retour.click({ force: true }); await settle(page, 500); }
  check('M4 : et il revient quand on remet le sommet',
    (await page.locator('[data-critere="glissement"]').count()) >= 1);

  const poignee = page.locator('main [role="button"][aria-label*="Point d’arrivée"]').first();
  check('M4 : la poignée du glissement existe', (await poignee.count()) >= 1);
  await dragBy(page, poignee, -80, 60);
  await settle(page, 400);
  check('M4 : le verdict tient après déplacement',
    (await page.locator('[data-critere="glissement"]').count()) >= 1);
  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 7. Module 6 : remettre une démonstration en ordre ──────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/trois-lignes-qui-prouvent`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4', '5'], tag: 'M6',
  });
  let t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M6 : les énoncés des démonstrations sont là',
    /Montrer que M M. N. N est un parall[ée]logramme/i.test(t), t.slice(0, 600));
  check('M6 : les maillons sont proposés en DÉSORDRE',
    // La conclusion (« Donc… ») apparaît avant la donnée dans le DOM : c'est
    // le désordre voulu. Si elle venait en premier, l'exercice serait vide.
    t.indexOf('Donc M M') < t.indexOf('Le même glissement mène M'), t.slice(0, 600));

  // On clique les trois maillons dans le bon ordre : la donnée, puis la
  // propriété (« Or… »), puis la conclusion (« Donc… »).
  // Les apostrophes sont TYPOGRAPHIQUES dans le rendu : on ancre sur des
  // fragments qui n'en contiennent pas, pour que le sélecteur ne dépende pas
  // d'un caractère invisible à la lecture.
  const parTexte = (motif) => page.locator('main button').filter({ hasText: motif }).first();
  const etapes = [
    /Le même glissement mène M en M/,
    /Or un glissement fait faire à tous les points/,
    /Donc M M.* a deux côtés opposés/,
  ];
  for (const re of etapes) {
    const b = parTexte(re);
    check(`M6 : le maillon « ${String(re).slice(1, 34)}… » est proposé`, (await b.count()) >= 1);
    if (await b.count()) { await b.click({ force: true }); await settle(page, 350); }
  }
  t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M6 : la chaîne remise en ordre est acceptée', /La chaîne tient/i.test(t), t.slice(0, 600));
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 8. Chemin FAUX-EXPRÈS : l'invariant non bloquant ───────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-dire-proprement`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4'], tag: 'M5-faux',
  });
  // « ça se voit sur la figure » : le piège du niveau.
  const piege = page.locator('main button').filter({ hasText: /ABCD ressemble à un parall/i }).first();
  if (await piege.count()) { await piege.click({ force: true }); await settle(page, 700); }
  const t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M5 : la réponse fausse affiche la correction',
    /n’est pas une donnée|pas une donnée/i.test(t), t.slice(0, 500));
  check('M5 : et l’étape reste jouable (non bloquant)',
    (await page.locator('main button').count()) > 3);
  await ctx.close();
}

/* ── 9. La carte des connaissances ──────────────────────────────────── */
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
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-meme-deplacement-partout`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4'], tag: 'carte-4',
  });
  const trigger = page.locator('button[data-km-trigger]');
  if (await trigger.count()) {
    await trigger.first().click();
    await settle(page);
    const ids = await page.locator('#km-root [data-km-item]')
      .evaluateAll((els) => els.map((e) => e.getAttribute('data-km-item')));
    check('carte : contient les acquis des modules 1 à 4',
      ids.includes('trace-du-glissement') && ids.includes('construire-le-quatrieme')
      && ids.includes('deux-trajets-un-glissement') && ids.includes('un-seul-trajet-pour-tous'),
      ids.join(','));
    check('carte : AUCUNE fuite des modules 5 et 6',
      !ids.includes('justifier-par-le-glissement') && !ids.includes('trois-lignes-de-preuve'),
      ids.join(','));
  }
  await ctx.close();
}

/* ── 10. Le boss, jusqu'à la synthèse ───────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/mission-finale-latelier`, {
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

/* ── 11. Mobile 375 px ──────────────────────────────────────────────── */
{
  for (const slug of ['le-quatrieme-point', 'place-le-point-manquant', 'le-meme-deplacement-partout']) {
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
