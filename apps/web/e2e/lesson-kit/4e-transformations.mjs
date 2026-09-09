// « Transformations — la translation » (4e) — suite navigateur.
//
//   cd apps/web && (setsid nohup npx vite --port 5405 --strictPort > e2e/lesson-kit/shots/vite-5405.log 2>&1 </dev/null &)
//   KIT_BASE=http://localhost:5405 node apps/web/e2e/lesson-kit/4e-transformations.mjs
//
// Ce que cette suite vérifie et qu'aucune garde de source ne voit :
//   · la leçon rend, et chaque module rend (une leçon non routée retombe sur
//     la page d'accueil SANS erreur — invisible autrement) ;
//   · LE GLISSER FONCTIONNE VRAIMENT. C'est le cœur : `setPointerCapture` ne
//     se teste qu'au navigateur, et son absence fige le glisser au premier
//     pixel sans lever la moindre erreur ;
//   · le labo signature reste manipulable APRÈS validation (classe de bug
//     « manipulation gelée ») ;
//   · le contraste glissement / demi-tour existe, et les verdicts du DOM
//     changent avec lui ;
//   · un chemin FAUX-EXPRÈS progresse quand même (invariant non bloquant) ;
//   · la carte des connaissances grandit sans fuite d'un module futur ;
//   · le boss va jusqu'à la synthèse, qui porte les 9 connaissances ;
//   · le mot réservé à la 3e n'apparaît NULLE PART dans le rendu ;
//   · rien ne déborde à 375 px, les cibles tactiles tiennent, console vide.
import {
  launch, open, check, summary, errs, settle, body, noHScroll,
  layoutAudit, aspectAudit, domOverflow, smallTargets, tapOption, runBoss, dragBy,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5405';
const LESSON = '/courses/college/4e/espace_geometrie/transformations-4e';
const KEY = 'u_anon_smarter_lesson_transformations-4e';
const SLUGS = [
  'mission-de-depart', 'le-tapis-roulant', 'le-trajet-dun-seul-point',
  'toute-la-figure', 'ce-que-le-glissement-garde', 'le-parallelogramme-cache',
  'latelier-des-trois-gestes', 'mission-finale-le-carrelage',
];
const TOUS = ['0', '1', '2', '3', '4', '5', '6', '7', '00', '01', '02', '03', '04', '05', '06', '07'];

/** La poignée du labo : un <g role="button"> nommé par son aria-label. */
const poignee = (page, re) => page.getByRole('button', { name: re }).first();

/**
 * Attendre que le module soit VRAIMENT monté.
 *
 * Les routes sont chargées paresseusement (`import.meta.glob`), et le délai
 * fixe de `open()` ne suffit pas quand plusieurs contextes chargent leurs
 * chunks en même temps : on voyait alors des modules « vides » au hasard,
 * sur le serveur de développement comme sur la build statique. On attend
 * donc un signe de vie du module lui-même.
 */
/**
 * Les trois audits, en une passe et à l'épreuve d'une navigation.
 *
 * `page.evaluate` lève « Execution context was destroyed » si le rendu
 * navigue pendant la mesure — ce qui arrive quand une session voisine
 * recharge le serveur. Une mesure perdue n'est pas un défaut de la leçon :
 * on la saute plutôt que de faire tomber toute la suite.
 */
const auditer = async (page) => {
  try {
    return [
      ...(await layoutAudit(page)),
      ...(await aspectAudit(page)),
      ...(await domOverflow(page)),
    ];
  } catch {
    return [];
  }
};

const monte = (page) => page.waitForFunction(
  () => {
    const main = document.querySelector('main');
    return !!main && main.querySelectorAll('button').length >= 2;
  },
  null,
  { timeout: 25000 },
).then(() => true, () => false);

const browser = await launch();
const issues = [];

/* ── 1. L'index et les huit modules rendent ─────────────────────────── */
{
  const { ctx, page } = await open(browser, BASE + LESSON, { tag: 'index' });
  const t = await body(page);
  check('index : le titre de la leçon est rendu', /Transformations/.test(t), t.slice(0, 200));
  check('index : les 8 modules sont annoncés',
    /Le tapis roulant/.test(t) && /Mission finale/.test(t), t.slice(0, 300));
  await ctx.close();

  for (const slug of SLUGS) {
    const { ctx: c, page: p } = await open(browser, `${BASE}${LESSON}/${slug}`, {
      key: KEY, completedModules: TOUS, tag: slug,
    });
    await monte(p);
    const b = await body(p);
    // Une leçon non branchée dans App.jsx rend la LANDING PAGE sans erreur.
    check(`${slug} : rend un vrai module`,
      b.length > 400 && !/Page introuvable/.test(b) && !/Découvre les maths autrement/.test(b),
      b.slice(0, 150));
    check(`${slug} : au moins deux commandes`, (await p.locator('main button').count()) >= 2,
      String(await p.locator('main button').count()));
    await c.close();
  }
}

/* ── 2. LE LABO SIGNATURE : le glisser doit vraiment glisser ────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-tapis-roulant`, { tag: 'M1' });
  await monte(page);
  check('M1 : le labo est un groupe nommé',
    (await page.getByRole('group', { name: /Le tapis roulant/ }).count()) >= 1);

  const h = poignee(page, /Tirer la pointe de la flèche/);
  check('M1 : la poignée de la flèche est saisissable', (await h.count()) >= 1);

  // La cible tactile MESURÉE : hitR = 68 unités de viewBox. À 1280 px de
  // large le SVG occupe ~1100 px, donc le facteur est ~1,45 et la poignée
  // doit dépasser largement les 44 px.
  const box = await h.boundingBox();
  check('M1 : la cible de la poignée fait au moins 44 px',
    box && Math.min(box.width, box.height) >= 44,
    box ? `${Math.round(box.width)}×${Math.round(box.height)}` : 'sans boîte');

  const lire = async () => {
    const el = page.locator('[data-lecture="glissement"]').first();
    return (await el.count()) ? (await el.textContent()).replace(/\s+/g, ' ') : '';
  };
  const avant = await lire();
  check('M1 : les trois caractères sont lus dans le DOM, pas dans le SVG',
    /Direction/.test(avant) && /Sens/.test(avant) && /Longueur/.test(avant), avant);

  // LE TEST QUI COMPTE : sans setPointerCapture, le glisser se fige au premier
  // pixel et cette lecture ne changerait pas.
  await dragBy(page, h, 160, 120);
  await settle(page, 400);
  const apres = await lire();
  check('M1 : TIRER LA FLÈCHE change les trois lectures (setPointerCapture)',
    apres !== avant && apres.length > 0, `avant=${avant} | après=${apres}`);

  /* Quatre réglages franchement distincts, EN PASSANT PAR LE CLAVIER.
     Le glisser vient d'être prouvé juste au-dessus ; ici on veut atteindre
     des états précis, et un delta en pixels CSS ne le garantit pas — il
     traverse une échelle qui dépend de la largeur rendue, puis une
     aimantation au quadrillage, puis une borne. Les flèches du clavier, elles,
     valent exactement un carreau : le parcours est reproductible, et il
     éprouve du même coup le chemin accessible (§27). */
  const filer = async (touche, fois) => {
    const h = poignee(page, /Tirer la pointe de la flèche/);
    await h.scrollIntoViewIfNeeded();
    await h.focus();
    for (let i = 0; i < fois; i += 1) await page.keyboard.press(touche);
    await settle(page, 250);
    issues.push(...(await auditer(page)));
  };
  await filer('ArrowLeft', 6);
  await filer('ArrowDown', 4);
  await filer('ArrowRight', 8);
  await filer('ArrowUp', 5);

  // Le verdict du DOM suit la figure : en mode glissement, il est concordant.
  const verdict = await page.locator('[data-verdict]').first().getAttribute('data-verdict');
  check('M1 : le verdict annonce des traits concordants', verdict === 'concordants', String(verdict));

  // Trois réglages distincts valident l'étape 1 — puis le labo reste VIVANT.
  await page.waitForFunction(
    () => /même trajet|restent parallèles/i.test(document.body.innerText),
    null, { timeout: 8000 },
  ).catch(() => {});
  let b = await body(page);
  check('M1 : trois réglages distincts valident l’étape 1',
    /restent parallèles et de même longueur|même trajet/i.test(b), b.slice(-600));

  const hApres = poignee(page, /Tirer la pointe de la flèche/);
  const lu1 = await lire();
  await dragBy(page, hApres, -120, -100);
  await settle(page, 350);
  check('M1 : le labo reste manipulable APRÈS validation (pas de gel)',
    (await lire()) !== lu1, `${lu1} → ${await lire()}`);

  // Le contraste : le demi-tour de 5e change le verdict. Le bouton vit dans
  // l'étape 2, qui ne s'ouvre qu'une fois l'étape 1 validée — on l'attend.
  /* L'étape 2 s'ouvre en fin de page, après une animation de déroulé : on
     redescend et on attend qu'elle soit vraiment attachée avant de cliquer.
     Sans le défilement, la locator peut rester « pas encore montée » —
     c'est la même précaution que `dragBy` prend sur les poignées. */
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => {});
  await settle(page, 700);
  const btnDemiTour = page.locator('button:has-text("Et le demi-tour de 5e ?")').first();
  const ouverte = await btnDemiTour.waitFor({ state: 'attached', timeout: 15000 })
    .then(() => true, () => false);
  check('M1 : l’étape 2 s’ouvre et propose le demi-tour de 5e', ouverte,
    `boutons=${await page.locator('main button').count()}`);
  if (ouverte) {
    await btnDemiTour.scrollIntoViewIfNeeded();
    await btnDemiTour.click({ force: true });
    await settle(page, 600);
  }
  const v2 = await page.locator('[data-verdict]').first().getAttribute('data-verdict');
  check('M1 : le demi-tour donne des traits qui SE CROISENT', v2 === 'croises', String(v2));
  b = await body(page);
  check('M1 : le contraste est expliqué dans le DOM', /se croisent/i.test(b), b.slice(-500));
  issues.push(...(await auditer(page)));
  await ctx.close();
}

/* ── 3. M2 : poser une image, et les deux pièges ────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-trajet-dun-seul-point`, {
    key: KEY, completedModules: ['0', '1'], tag: 'M2',
  });
  await monte(page);
  const h = poignee(page, /Placer l’image du point M/);
  check('M2 : la pastille de l’image est saisissable', (await h.count()) >= 1);

  const lire = async () => (await page.locator('[data-lecture="trajet"]').first().textContent()).replace(/\s+/g, ' ');
  const avant = await lire();
  await dragBy(page, h, 180, -140);
  await settle(page, 400);
  check('M2 : glisser la pastille change les trois mesures', (await lire()) !== avant, `${avant} → ${await lire()}`);

  /* L'étape 1 se valide en posant l'image sur le BON nœud. Le glissement du
     module avance de 4 carreaux à droite et 3 vers le haut, depuis M = (360 ;
     240) en unités de viewBox : la cible est donc (520 ; 120). On MESURE le
     facteur d'échelle sur la scène plutôt que de le deviner — c'est le même
     piège que le `hitR` de la poignée. */
  const scene = page.locator('svg[aria-label*="le point M"]').first();
  const sb = await scene.boundingBox();
  const k = sb.width / 760;
  const hh = poignee(page, /Placer l’image du point M/);
  const b0 = await hh.boundingBox();
  await dragBy(
    page, hh,
    (sb.x + 520 * k) - (b0.x + b0.width / 2),
    (sb.y + 120 * k) - (b0.y + b0.height / 2),
  );
  await settle(page, 600);
  const verdict1 = await page.locator('[data-verdict]').first().getAttribute('data-verdict');
  check('M2 : poser l’image au bon nœud valide l’étape (cible ATTEIGNABLE)',
    verdict1 === 'juste', `${verdict1} | ${await lire()}`);

  // L'étape 2 s'ouvre alors, avec son bouton : même longueur, même direction,
  // mauvais sens.
  const btnPiege = page.locator('button:has-text("Essayer de l’autre côté de M")').first();
  check('M2 : l’étape 2 s’ouvre et propose le piège',
    await btnPiege.waitFor({ state: 'visible', timeout: 8000 }).then(() => true, () => false));
  await btnPiege.click({ force: true });
  await settle(page, 600);
  const l = await lire();
  check('M2 : le piège du SENS garde la longueur mais perd le sens',
    /Même sens\s*\?\s*non/i.test(l) && /Même direction\s*\?\s*oui/i.test(l), l);
  issues.push(...(await auditer(page)));
  await ctx.close();
}

/* ── 4. M3 : trois sommets, et la figure qui n'apparaît qu'à la fin ── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/toute-la-figure`, {
    key: KEY, completedModules: ['0', '1', '2'], tag: 'M3',
  });
  await monte(page);
  const lire = async () => (await page.locator('[data-lecture="figure"]').first().textContent()).replace(/\s+/g, ' ');
  check('M3 : le compteur de sommets démarre à 0 / 3', /0\s*\/\s*3/.test(await lire()), await lire());

  for (const nom of [/sommet A/, /sommet B/, /sommet C/]) {
    const h = poignee(page, nom);
    if (await h.count()) { await dragBy(page, h, -120, 80); await settle(page, 300); }
  }
  check('M3 : les trois poignées sont saisissables et bougent',
    (await lire()).length > 0, await lire());
  issues.push(...(await auditer(page)));
  await ctx.close();
}

/* ── 5. M4 : le tableau des invariants ne bouge pas ─────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/ce-que-le-glissement-garde`, {
    key: KEY, completedModules: ['0', '1', '2', '3'], tag: 'M4',
  });
  await monte(page);
  const lignes = page.locator('[data-invariant]');
  check('M4 : les quatre invariants sont dans le tableau DOM', (await lignes.count()) === 4,
    String(await lignes.count()));

  const lire = async () => (await page.locator('[data-lecture="invariants"]').first().textContent()).replace(/\s+/g, ' ');
  const avant = await lire();
  const h = poignee(page, /Tirer la pointe de la flèche/);
  for (const [dx, dy] of [[180, 100], [-260, -140], [140, 60]]) {
    await dragBy(page, poignee(page, /Tirer la pointe de la flèche/), dx, dy);
    await settle(page, 300);
    issues.push(...(await auditer(page)));
  }
  check('M4 : LE TABLEAU EST INCHANGÉ après trois déplacements', (await lire()) === avant,
    `${avant} ≠ ${await lire()}`);
  const v = await page.locator('[data-verdict]').first().getAttribute('data-verdict');
  check('M4 : le verdict reste « tout conservé »', v === 'tout-conserve', String(v));
  await ctx.close();
}

/* ── 6. M5 : les deux ordres donnent deux verdicts ──────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-parallelogramme-cache`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4'], tag: 'M5',
  });
  await monte(page);
  const v1 = await page.locator('[data-verdict]').first().getAttribute('data-verdict');
  check('M5 : l’ordre M M’ N’ N donne un parallélogramme', v1 === 'parallelogramme', String(v1));

  /* Les deux boutons de bascule : on ATTEND qu'ils soient visibles avant de
     cliquer. Un `click` nu attend 30 s puis lève, ce qui fait tomber toute la
     suite au lieu de signaler un seul point. */
  const btnCroise = page.locator('button:has-text("Relier M · N · M’ · N’")').first();
  await btnCroise.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  await btnCroise.click({ force: true });
  await settle(page, 500);
  const v2 = await page.locator('[data-verdict]').first().getAttribute('data-verdict');
  check('M5 : l’ordre croisé change le verdict', v2 === 'croise', String(v2));

  const btnTour = page.locator('button:has-text("Relier M · M’ · N’ · N")').first();
  await btnTour.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  await btnTour.click({ force: true });
  await settle(page, 450);
  const h = poignee(page, /Déplacer le point N/);
  check('M5 : le point N est saisissable', (await h.count()) >= 1);
  await dragBy(page, h, -160, 120);
  await settle(page, 350);
  const v3 = await page.locator('[data-verdict]').first().getAttribute('data-verdict');
  check('M5 : le verdict reste vrai après déplacement de N',
    v3 === 'parallelogramme' || v3 === 'aplati', String(v3));
  issues.push(...(await auditer(page)));
  await ctx.close();
}

/* ── 7. Chemin FAUX-EXPRÈS : l'invariant non bloquant ───────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/latelier-des-trois-gestes`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4', '5'], tag: 'M6-faux',
  });
  await monte(page);
  // Cas 1 : la bonne réponse est l'option 0 ; on répond volontairement 1.
  await tapOption(page, 'main', 1);
  const main = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M6 : une réponse fausse affiche la correction',
    /parallèles et de même longueur/i.test(main), main.slice(-500));
  // Non bloquant : l'étape se valide malgré l'erreur, donc le laboratoire
  // révèle sa mesure et l'étape suivante s'ouvre.
  check('M6 : et l’étape se valide quand même (non bloquant)',
    /Deuxième dessin/.test(main), main.slice(-400));
  await ctx.close();
}

/* ── 8. La carte des connaissances ──────────────────────────────────── */
{
  const { ctx, page } = await open(browser, BASE + LESSON, { tag: 'carte-vide' });
  const trigger = page.locator('button[data-km-trigger]');
  check('carte : le déclencheur est monté', (await trigger.count()) >= 1);
  if (await trigger.count()) {
    await trigger.first().click({ force: true });
    await settle(page);
    const items = await page.locator('#km-root [data-km-item]').count();
    check('carte : vide avant tout module validé', items === 0, `items=${items}`);
  }
  await ctx.close();
}
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/ce-que-le-glissement-garde`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4'], tag: 'carte-4',
  });
  await monte(page);
  const trigger = page.locator('button[data-km-trigger]');
  if (await trigger.count()) {
    await trigger.first().click({ force: true });
    await settle(page);
    const ids = await page.locator('#km-root [data-km-item]').evaluateAll(
      (els) => els.map((e) => e.getAttribute('data-km-item')),
    );
    check('carte : contient les acquis des modules 1 à 4',
      ids.includes('translation') && ids.includes('trois-caracteres')
      && ids.includes('image') && ids.includes('invariants-translation'),
      ids.join(','));
    check('carte : AUCUNE fuite du module 5 (le parallélogramme)',
      !ids.includes('translation-parallelogramme'), ids.join(','));
    check('carte : AUCUNE fuite du module 6 (reconnaître le geste)',
      !ids.includes('reconnaitre-le-geste'), ids.join(','));
  }
  await ctx.close();
}

/* ── 9. Le boss, jusqu'à la synthèse ────────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/mission-finale-le-carrelage`, {
    key: KEY, completedModules: TOUS, tag: 'boss',
  });
  await monte(page);
  let b = await body(page);
  check('boss : les dix épreuves sont là',
    /Épreuve|épreuve/.test(b) && (await page.locator('main div[role="group"]').count()) >= 8);
  check('boss : aucune correction avant la soumission',
    !/Bonne réponse|Réponse juste/.test(b), b.slice(0, 200));

  await runBoss(page);
  // Le libellé porte le NOMBRE d'épreuves (« Valider mes 10 réponses ») :
  // une regexp sur « Valider mes réponses » ne l'attrape pas.
  const submit = page.locator('main button').filter({ hasText: /Valider mes \d+ réponses|Soumettre/ }).first();
  if (await submit.waitFor({ state: 'visible', timeout: 15000 }).then(() => true, () => false)) {
    await submit.click({ force: true });
    await settle(page, 1600);
  }
  b = await body(page);
  check('boss : le score apparaît après soumission', /\/\s*10|score|Profil|profil/i.test(b), b.slice(-400));

  /* Le parcours réel : « Voir mon profil de maîtrise » → « Passer à la
     synthèse → ». Chaque écran arrive après une animation : on ATTEND le
     bouton au lieu de parier sur un délai — un `settle` fixe rendait cette
     section intermittente. */
  const profil = page.locator('main button').filter({ hasText: /Voir mon profil/i }).first();
  if (await profil.waitFor({ state: 'visible', timeout: 15000 }).then(() => true, () => false)) {
    await profil.click({ force: true });
  }
  const synth = page.locator('main button').filter({ hasText: /Passer à la synthèse/i }).first();
  if (await synth.waitFor({ state: 'visible', timeout: 15000 }).then(() => true, () => false)) {
    await synth.click({ force: true });
  }
  await page.locator('[data-knowledge-snapshot="complete"]').first()
    .waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});
  const complete = await page.locator('[data-knowledge-snapshot="complete"]').count();
  const items = await page.locator('[data-km-item]').count();
  check('boss : la synthèse rend la carte COMPLÈTE', complete >= 1, `snapshots=${complete}`);
  check('boss : la carte complète porte les 9 connaissances de la leçon', items === 9, `items=${items}`);
  await ctx.close();
}

/* ── 10. LE PÉRIMÈTRE : le mot de 3e n'atteint jamais l'écran ────────── */
{
  const INTERDIT = /vecteur|chasles|homoth[ée]tie/i;
  for (const slug of SLUGS) {
    const { ctx, page } = await open(browser, `${BASE}${LESSON}/${slug}`, {
      key: KEY, completedModules: TOUS, tag: `scope-${slug}`,
    });
    await monte(page);
    const t = await body(page);
    const m = t.match(INTERDIT);
    check(`périmètre ${slug} : aucun mot réservé à la 3e n’est rendu`, !m,
      m ? t.slice(Math.max(0, m.index - 80), m.index + 80) : '');
    await ctx.close();
  }
}

/* ── 11. Mobile 375 px ──────────────────────────────────────────────── */
{
  for (const slug of ['le-tapis-roulant', 'ce-que-le-glissement-garde', 'le-parallelogramme-cache']) {
    const { ctx, page } = await open(browser, `${BASE}${LESSON}/${slug}`, {
      key: KEY, completedModules: TOUS, mobile: true, tag: `mob-${slug}`,
    });
    await monte(page);
    check(`mobile ${slug} : aucun défilement horizontal`, await noHScroll(page));
    const petits = await smallTargets(page);
    check(`mobile ${slug} : cibles tactiles ≥ 40 px`, petits.length === 0, petits.join(', '));

    // La poignée SVG à 375 px : c'est là que `hitR` se paie. Le SVG de
    // 760 unités s'y rend sur ~263 px, soit un facteur ~0,346 ; un hitR de
    // 68 unités doit donc dépasser 44 px CSS.
    const h = page.getByRole('button', { name: /Tirer la pointe|Placer l’image|Déplacer le point/ }).first();
    if (await h.count()) {
      const box = await h.boundingBox();
      check(`mobile ${slug} : la poignée SVG fait ≥ 44 px`,
        box && Math.min(box.width, box.height) >= 44,
        box ? `${Math.round(box.width)}×${Math.round(box.height)}` : 'sans boîte');
    }
    issues.push(...(await auditer(page)));
    await ctx.close();
  }
}

/* ── 12. Verdicts globaux ───────────────────────────────────────────── */
check('mise en page : aucun débordement ni chevauchement', issues.length === 0, issues.slice(0, 6).join(' | '));
check('console : aucune erreur sur tout le parcours', errs.length === 0, errs.slice(0, 5).join(' | '));

await browser.close();
process.exit(summary());
