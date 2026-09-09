// « Probabilités » (4e) — suite navigateur.
//
//   cd apps/web && (setsid nohup npx vite --port 5404 --strictPort > e2e/lesson-kit/shots/vite-5404.log 2>&1 </dev/null &)
//   KIT_BASE=http://localhost:5404 node apps/web/e2e/lesson-kit/4e-probabilites.mjs
//
// Ce que cette suite vérifie et qu'aucune garde de source ne voit :
//   · chaque module rend (une leçon non routée retombe sur l'accueil SANS erreur) ;
//   · le simulateur tourne, et la roue reste manipulable après validation ;
//   · RETIRER TOUS LES SECTEURS ne fait pas planter la page (le noyau refuse
//     une expérience vide : l'interface doit inviter, pas casser) ;
//   · l'écart entre séries DIMINUE quand on passe à 10 000 tours ;
//   · le sac montre bien que « rouge OU grande » ne fait pas 8 ;
//   · un chemin faux progresse quand même ; la carte grandit sans fuite ;
//   · la continuité : la roue du module 1 revient au module 6 ;
//   · rien ne déborde à 375 px, et la console reste vide.
import {
  launch, open, check, summary, errs, settle, body, noHScroll,
  layoutAudit, aspectAudit, domOverflow, smallTargets, tapOption, runBoss,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5404';
const LESSON = '/courses/college/4e/donnees_probabilites/probabilites-4e';
const KEY = 'u_anon_smarter_lesson_probabilites-4e';
const SLUGS = [
  'mission-de-depart', 'dix-mille-tours', 'jamais-deux-fois-pareil', 'tout-ce-qui-reste',
  'et-ou-bien-ou', 'du-jamais-au-toujours', 'le-labo-du-hasard', 'mission-finale-la-fete-foraine',
];
const TOUS = ['0', '1', '2', '3', '4', '5', '6', '7', '00', '01', '02', '03', '04', '05', '06', '07'];

const browser = await launch();
const issues = [];

/* ── 1. L'index et les huit modules rendent ─────────────────────────── */
{
  const { ctx, page } = await open(browser, BASE + LESSON, { tag: 'index' });
  const t = await body(page);
  check('index : le titre de la leçon est rendu', /Probabilités/.test(t), t.slice(0, 200));
  check('index : les modules sont annoncés', /Dix mille tours/.test(t) && /Mission finale/.test(t));
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

/* ── 2. Le simulateur (M1) ──────────────────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/dix-mille-tours`, { tag: 'M1' });
  check('M1 : le labo est un groupe nommé', (await page.getByRole('group', { name: /Roue de la fête/ }).count()) >= 1);

  // Lancer la plus petite série, puis la plus grande, et lire les deux écarts.
  const lire = async () => {
    const t = await page.locator('main').first().textContent();
    const m = t.match(/Écart entre la plus petite et la plus grande\s*([\d,]+)\s*%/);
    return m ? Number(m[1].replace(',', '.')) : null;
  };
  await page.locator('main button').filter({ hasText: '10 tours' }).first().click();
  await settle(page, 700);
  const petit = await lire();
  check('M1 : une série de 10 tours affiche un écart', petit !== null, `écart=${petit}`);
  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));

  await page.locator('main button').filter({ hasText: '10 000 tours' }).first().click();
  await settle(page, 1400);
  const grand = await lire();
  check('M1 : L’ÉCART DIMINUE en passant à 10 000 tours', petit !== null && grand !== null && grand < petit, `10 tours: ${petit}% → 10 000 tours: ${grand}%`);
  check('M1 : et il ne tombe pas à zéro', grand === null || grand > 0, `écart=${grand}`);

  // Le labo reste manipulable après validation.
  const plus = page.locator('main button[aria-label^="Ajouter un secteur"]').first();
  check('M1 : la composition reste réglable après le lancer', await plus.isEnabled());

  // RETIRER TOUS LES SECTEURS ne doit pas casser la page.
  const moins = page.locator('main button[aria-label^="Retirer un secteur"]');
  const n = await moins.count();
  for (let k = 0; k < n; k += 1) {
    for (let i = 0; i < 9; i += 1) await moins.nth(k).click({ force: true }).catch(() => {});
  }
  await settle(page, 800);
  const vide = await body(page);
  check('M1 : une roue SANS secteur n’écrase pas la page', /Ajoute au moins un secteur/.test(vide), vide.slice(0, 200));
  await ctx.close();
}

/* ── 3. Le sac : « rouge OU grande » ne fait pas 8 ──────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/et-ou-bien-ou`, {
    key: KEY, completedModules: ['0', '1', '2', '3'], tag: 'M4',
  });
  check('M4 : le sac est un groupe nommé', (await page.getByRole('group', { name: /Sac de billes/ }).count()) >= 1);
  const t = await page.locator('main').first().textContent();
  check('M4 : le compte du croisement ET est affiché', /2 billes sur 8/.test(t.replace(/\s+/g, ' ')), t.slice(0, 300));

  await page.locator('main button').filter({ hasText: /^OU$/ }).first().click({ force: true });
  await settle(page, 600);
  const t2 = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M4 : « rouge OU grande » donne 6 billes, pas 8', /6 billes sur 8/.test(t2), t2.slice(0, 300));
  issues.push(...(await domOverflow(page)));
  await ctx.close();
}

/* ── 4. Chemin FAUX-EXPRÈS : l'invariant non bloquant ───────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/tout-ce-qui-reste`, {
    key: KEY, completedModules: ['0', '1', '2', '3'], tag: 'M3-faux',
  });
  // Étape 1 : deux bascules pour valider, puis on répond FAUX à l'étape 2.
  await page.locator('main button').filter({ hasText: 'son contraire' }).first().click({ force: true });
  await settle(page, 300);
  await page.locator('main button').filter({ hasText: 'bleue' }).first().click({ force: true });
  await settle(page, 300);
  await page.locator('main button').filter({ hasText: 'son contraire' }).first().click({ force: true });
  await settle(page, 400);
  // On vise la question PAR SON TEXTE : les filtres du sac partagent le
  // sélecteur `aria-pressed`, donc un simple nth() atteindrait un filtre.
  const piege = page.locator('main button').filter({ hasText: 'La bille est bleue' }).first();
  await piege.click({ force: true });
  await settle(page, 700);
  const html = await page.locator('main').first().innerHTML();
  check('M3 : une réponse fausse affiche la correction', /vertes/.test(html), html.slice(0, 200));
  check('M3 : et l’étape se valide quand même (non bloquant)', /data-knowledge-brick/.test(html), '');
  await ctx.close();
}

/* ── 5. La carte des connaissances ──────────────────────────────────── */
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
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/et-ou-bien-ou`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4'], tag: 'carte-4',
  });
  const trigger = page.locator('button[data-km-trigger]');
  if (await trigger.count()) {
    await trigger.first().click();
    await settle(page);
    const ids = await page.locator('#km-root [data-km-item]').evaluateAll((els) => els.map((e) => e.getAttribute('data-km-item')));
    check('carte : contient les acquis des modules 1 à 4',
      ids.includes('fluctuation') && ids.includes('evenement-contraire') && ids.includes('intersection'), ids.join(','));
    check('carte : AUCUNE fuite du module 5 (impossible / certain)',
      !ids.includes('impossible-certain'), ids.join(','));
  }
  await ctx.close();
}

/* ── 6. Continuité : la roue du module 1 revient au module 6 ────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1600 } });
  const page = await ctx.newPage();
  await page.addInitScript(([k, m]) => {
    if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify({ completedModules: m, completedExercises: [] }));
  }, [KEY, TOUS]);
  await page.goto(`${BASE}${LESSON}/dix-mille-tours`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  // On modifie la roue : trois clics « + » sur le rose.
  const plusRose = page.locator('main button[aria-label="Ajouter un secteur Rose"]').first();
  for (let i = 0; i < 3; i += 1) { await plusRose.click({ force: true }); await page.waitForTimeout(150); }
  await page.waitForTimeout(500);
  // Puis on va au module 6, dans le MÊME contexte (même localStorage).
  await page.goto(`${BASE}${LESSON}/le-labo-du-hasard`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1600);
  const t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('continuité : le module 6 reprend la roue composée au module 1',
    /roue que tu avais composée au module 1/.test(t), t.slice(0, 300));
  await ctx.close();
}

/* ── 7. Le boss, jusqu'à la synthèse ────────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/mission-finale-la-fete-foraine`, {
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
  check('boss : la carte complète porte les 8 connaissances', (await page.locator('[data-km-item]').count()) === 8, `items=${await page.locator('[data-km-item]').count()}`);
  await ctx.close();
}

/* ── 8. Mobile 375 px ───────────────────────────────────────────────── */
{
  for (const slug of ['dix-mille-tours', 'et-ou-bien-ou']) {
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
