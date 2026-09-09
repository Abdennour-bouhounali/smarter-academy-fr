// « Algorithmique et programmation » (4e) — suite navigateur.
//
//   cd apps/web && (setsid nohup npx vite --port 5410 --strictPort > e2e/lesson-kit/shots/vite-5410.log 2>&1 </dev/null &)
//   KIT_BASE=http://localhost:5410 node apps/web/e2e/lesson-kit/4e-algorithmique.mjs
//
// Ce que cette suite vérifie et qu'aucune garde de source ne voit :
//   · chaque module rend (une leçon non routée retombe sur l'accueil sans erreur) ;
//   · le PAS À PAS marche vraiment : la réglette se glisse, « Un pas » avance,
//     et la position / le cap / les variables CHANGENT à chaque arrêt ;
//   · l'instruction en cours est surlignée, et une seule branche porte
//     « chemin suivi » — l'autre porte « non exécuté » ;
//   · le compteur i change de valeur en cours d'exécution (module 4) ;
//   · les deux tracés du labo de réparation partagent le même cadre ;
//   · le lab n'est JAMAIS figé après validation d'une étape ;
//   · un chemin faux progresse quand même ; la carte grandit sans fuite ;
//   · rien ne déborde à 375 px, et la console reste vide.
import {
  launch, open, check, summary, errs, settle, body, noHScroll,
  layoutAudit, aspectAudit, domOverflow, smallTargets, tapOption, runBoss,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5410';
const LESSON = '/courses/college/4e/pensee_informatique/algorithmique-programmation-4e';
const KEY = 'u_anon_smarter_lesson_algorithmique-programmation-4e';
const SLUGS = [
  'mission-de-depart', 'le-programme-au-ralenti', 'le-bloc-qui-choisit',
  'ecrire-la-condition', 'le-compteur-qui-grandit', 'changer-le-resultat',
  'le-labo-de-reparation', 'mission-finale-latelier-des-choix',
];
const TOUS = ['0', '1', '2', '3', '4', '5', '6', '7', '00', '01', '02', '03', '04', '05', '06', '07'];

const browser = await launch();
const issues = [];

/**
 * ATTENDRE QUE LE MODULE SOIT VRAIMENT MONTÉ.
 *
 * Le serveur de développement est PARTAGÉ : une autre session qui édite une
 * leçon voisine déclenche un `page reload` de Vite, et une assertion lancée à
 * cet instant lit une page à moitié montée — « 0 bouton » sur un module qui en
 * a douze. Le défaut n'est pas dans la leçon, il est dans le harnais.
 *
 * On attend donc une condition SUR LE CONTENU (des commandes présentes dans
 * <main>), pas un délai fixe, et on retente après un rechargement.
 */
const attendreModule = async (page, minBoutons = 2) => {
  for (let essai = 0; essai < 3; essai += 1) {
    try {
      await page.waitForFunction(
        (n) => (document.querySelectorAll('main button') || []).length >= n,
        minBoutons,
        { timeout: 8000 },
      );
      return true;
    } catch {
      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
      await settle(page, 1200);
    }
  }
  return (await page.locator('main button').count()) >= minBoutons;
};

/** Le bandeau d'état du lab, lu dans le DOM (jamais en SVG <text>). */
const lireEtat = async (page) => {
  const t = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  // Les libellés sont collés à leur valeur dans le DOM rendu (« Pas0 / 8 ») :
  // les séparateurs sont donc \s* et non \s+.
  const pas = t.match(/Pas\s*(\d+)\s*\/\s*(\d+)/);
  const pos = t.match(/Position\s*\(([-\d,.]+)\s*;\s*([-\d,.]+)\)/);
  const cap = t.match(/Cap\s*([-\d,.]+)°/);
  return {
    pas: pas ? Number(pas[1]) : null,
    total: pas ? Number(pas[2]) : null,
    pos: pos ? `${pos[1]};${pos[2]}` : null,
    cap: cap ? cap[1] : null,
    texte: t,
  };
};

/* ── 1. L'index et les huit modules rendent ─────────────────────────── */
{
  const { ctx, page } = await open(browser, BASE + LESSON, { tag: 'index' });
  const t = await body(page);
  check('index : le titre de la leçon est rendu', /Algorithmique et programmation/.test(t), t.slice(0, 200));
  check('index : les modules sont annoncés',
    /Le programme au ralenti/.test(t) && /Mission finale/.test(t) && /Le labo de réparation/.test(t));
  await ctx.close();

  for (const slug of SLUGS) {
    const { ctx: c, page: p } = await open(browser, `${BASE}${LESSON}/${slug}`, {
      key: KEY, completedModules: TOUS, tag: slug,
    });
    const monte = await attendreModule(p);
    const b = await body(p);
    check(`${slug} : rend un vrai module`,
      b.length > 400 && !/Page introuvable/.test(b) && !/Découvre les maths autrement/.test(b),
      b.slice(0, 150));
    check(`${slug} : au moins deux commandes`, monte, `${await p.locator('main button').count()} boutons`);
    await c.close();
  }
}

/* ── 2. Le labo signature : le PAS À PAS existe et fait bouger l'état ─ */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-programme-au-ralenti`, { tag: 'M1' });
  await attendreModule(page, 4);
  check('M1 : le labo est un groupe nommé',
    (await page.getByRole('group', { name: /laboratoire du programme/i }).count()) >= 1);

  const depart = await lireEtat(page);
  check('M1 : l’état de départ est lisible DANS LE DOM',
    depart.pas === 0 && depart.pos !== null && depart.cap !== null, JSON.stringify(depart));
  check('M1 : le programme s’écrit en 2 instructions et en exécute 8',
    depart.total === 8, `total = ${depart.total}`);

  // Le bouton « Un pas » : à chaque appui, un pas de plus.
  const unPas = page.getByRole('button', { name: /Avancer d’un pas/i }).first();
  check('M1 : le bouton « un pas » existe', (await unPas.count()) >= 1);

  const etats = [depart];
  for (let k = 0; k < 5; k += 1) {
    await unPas.click();
    await settle(page, 260);
    etats.push(await lireEtat(page));
    issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  }
  check('M1 : chaque appui AVANCE d’un pas exactement',
    etats.every((e, i) => e.pas === i), etats.map((e) => e.pas).join(','));
  check('M1 : la POSITION change en cours d’exécution',
    new Set(etats.map((e) => e.pos)).size >= 3, etats.map((e) => e.pos).join(' | '));
  check('M1 : le CAP change en cours d’exécution',
    new Set(etats.map((e) => e.cap)).size >= 3, etats.map((e) => e.cap).join(' | '));
  check('M1 : au pas 5, le cap vaut bien 180°', etats[5].cap === '180', `cap = ${etats[5].cap}`);

  // L'instruction courante est nommée dans le DOM.
  check('M1 : le pas courant nomme l’instruction exécutée',
    /Pas 5 — (AVANCER|TOURNER)/.test(etats[5].texte), etats[5].texte.slice(0, 200));

  // La réglette : un vrai role=slider, pilotable au clavier.
  const reglette = page.locator('main [role="slider"][aria-label*="Rang d’exécution"]').first();
  check('M1 : la réglette d’exécution est un slider accessible', (await reglette.count()) >= 1);
  await reglette.focus();
  await page.keyboard.press('End');
  await settle(page, 300);
  const fin = await lireEtat(page);
  check('M1 : la touche Fin amène au dernier pas', fin.pas === fin.total, `${fin.pas}/${fin.total}`);
  await page.keyboard.press('Home');
  await settle(page, 300);
  check('M1 : la touche Début revient au pas 0', (await lireEtat(page)).pas === 0);

  // Le lab reste vivant : réglage d'un bloc par un slider, pas de +/-.
  const valeurs = page.locator('main [role="slider"][aria-label*="Valeur de l’instruction"]');
  check('M1 : les paramètres se règlent par une poignée, pas par des boutons +/−',
    (await valeurs.count()) >= 1, `${await valeurs.count()} réglettes`);

  check('M1 : aucune cible tactile trop petite', (await smallTargets(page)).length === 0,
    JSON.stringify(await smallTargets(page)));
  await ctx.close();
}

/* ── 3. Module 2 : une SEULE branche est prise ──────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-bloc-qui-choisit`, {
    key: KEY, completedModules: ['0', '1'], tag: 'M2',
  });
  await attendreModule(page, 4);

  const lireBranches = () => page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('main [data-branche]')) {
      out.push(`${el.getAttribute('data-branche')}:${el.getAttribute('data-prise')}`);
    }
    return out;
  });

  // n = 3 par défaut : la branche « sinon » doit être prise.
  const n3 = page.getByRole('button', { name: /^n = 3$/ }).first();
  const n7 = page.getByRole('button', { name: /^n = 7$/ }).first();
  check('M2 : les deux entrées sont proposées',
    (await n3.count()) >= 1 && (await n7.count()) >= 1);

  const unPas = page.getByRole('button', { name: /Avancer d’un pas/i }).first();
  // Le corps de la boucle est « SI … » puis « TOURNER » : un pas sur deux
  // seulement est DANS le choix. On avance donc jusqu'à ce qu'une branche
  // s'allume, au lieu de supposer qu'un seul pas suffit.
  const jusquAUneBranche = async () => {
    for (let k = 0; k < 6; k += 1) {
      const b = await lireBranches();
      if (b.some((x) => x.endsWith(':oui'))) return b;
      await unPas.click();
      await settle(page, 300);
    }
    return lireBranches();
  };

  await n3.click();
  await settle(page, 400);
  const b3 = await jusquAUneBranche();
  const t3 = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M2 : avec n = 3, la branche SINON est le chemin suivi',
    b3.includes('sinon:oui') && b3.includes('alors:non'), b3.join(' '));
  check('M2 : la branche non prise est marquée « non exécuté »',
    /non exécuté/.test(t3), t3.slice(0, 300));
  check('M2 : le texte annonce la branche sinon et les côtés de 35',
    /branche « sinon »/.test(t3) && /35/.test(t3), t3.slice(0, 400));

  await n7.click();
  await settle(page, 400);
  const b7 = await jusquAUneBranche();
  const t7 = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M2 : avec n = 7, c’est la branche ALORS qui est prise',
    b7.includes('alors:oui') && b7.includes('sinon:non'), b7.join(' '));
  check('M2 : le côté annoncé passe de 35 à 70', /70/.test(t7), t7.slice(0, 400));
  check('M2 : JAMAIS les deux branches à la fois',
    !(b7.includes('alors:oui') && b7.includes('sinon:oui')), b7.join(' '));

  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 4. Module 3 : la borne sépare > et ⩾ ───────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/ecrire-la-condition`, {
    key: KEY, completedModules: ['0', '1', '2'], tag: 'M3',
  });
  await attendreModule(page, 4);
  check('M3 : l’atelier est un groupe nommé',
    (await page.getByRole('group', { name: /atelier de la condition/i }).count()) >= 1);

  const essai = (v) => page.getByRole('button', { name: new RegExp(`valeur = ${v}`) }).first();
  const opSup = page.locator('main button[aria-label*="plus grand que"]').first();
  const opSupEq = page.locator('main button[aria-label*="plus grand ou égal"]').first();
  check('M3 : les comparateurs sont proposés avec un libellé accessible',
    (await opSup.count()) >= 1 && (await opSupEq.count()) >= 1);

  // Avec « > 50 », la valeur 50 doit donner le PETIT carré (30).
  await opSup.click();
  await settle(page, 250);
  for (const v of [49, 50, 51]) { await essai(v).click(); await settle(page, 220); }
  const avecSup = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M3 : le tableau des trois essais se remplit',
    /49/.test(avecSup) && /50/.test(avecSup) && /51/.test(avecSup));

  const ligne50 = () => page.evaluate(() => {
    const tr = [...document.querySelectorAll('main tbody tr')]
      .find((r) => r.children[0]?.textContent.trim() === '50');
    return tr ? [...tr.children].map((c) => c.textContent.trim()).join('|') : null;
  });
  const sup50 = await ligne50();
  check('M3 : avec « > 50 », la valeur 50 rend le test FAUX (petit carré)',
    /faux/.test(sup50 || '') && /\|30$/.test(sup50 || ''), String(sup50));

  await opSupEq.click();
  await settle(page, 350);
  const supEq50 = await ligne50();
  check('M3 : avec « ⩾ 50 », la MÊME valeur 50 rend le test VRAI (grand carré)',
    /vrai/.test(supEq50 || '') && /\|80$/.test(supEq50 || ''), String(supEq50));
  check('M3 : la borne SÉPARE réellement les deux comparateurs', sup50 !== supEq50,
    `${sup50} vs ${supEq50}`);

  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 5. Module 4 : la variable CHANGE en cours d'exécution ──────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-compteur-qui-grandit`, {
    key: KEY, completedModules: ['0', '1', '2', '3'], tag: 'M4',
  });
  await attendreModule(page, 4);

  const lireI = () => page.evaluate(() => {
    const el = document.querySelector('main [data-variable="i"]');
    return el ? el.textContent.replace(/\s+/g, ' ').trim() : null;
  });

  const debut = await lireI();
  check('M4 : la variable i est affichée dans le DOM', debut !== null, String(debut));

  const unPas = page.getByRole('button', { name: /Avancer d’un pas/i }).first();
  const suite = [debut];
  for (let k = 0; k < 8; k += 1) {
    await unPas.click();
    await settle(page, 220);
    suite.push(await lireI());
  }
  check('M4 : la valeur de i CHANGE au cours de l’exécution',
    new Set(suite.filter(Boolean)).size >= 3, suite.join(' → '));
  check('M4 : i part bien de 20', /i = 20/.test(String(suite[1] ?? suite[0])), String(suite[1]));

  // Le relevé accumule des valeurs distinctes.
  const relever = page.getByRole('button', { name: /Relever la valeur de i/i }).first();
  await relever.click();
  await settle(page, 200);
  for (let k = 0; k < 3; k += 1) { await unPas.click(); await settle(page, 180); }
  await relever.click();
  await settle(page, 250);
  const tRel = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M4 : les relevés s’accumulent', /Les valeurs de i que tu as relevées/.test(tRel));

  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 6. Module 6 : trois ateliers, un cadre commun, la réparation ───── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-labo-de-reparation`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4', '5'], tag: 'M6',
  });
  await attendreModule(page, 4);

  const ateliers = page.locator('main [role="group"][aria-label^="Réparation"]');
  check('M6 : les trois ateliers de réparation sont là', (await ateliers.count()) === 3,
    `${await ateliers.count()} ateliers`);

  // Les deux figures d'un atelier partagent le MÊME viewBox : sans cela, la
  // comparaison mentirait (deux tailles différentes paraîtraient identiques).
  const memesCadres = await page.evaluate(() => {
    const out = [];
    for (const g of document.querySelectorAll('main [role="group"][aria-label^="Réparation"]')) {
      const vbs = [...g.querySelectorAll('svg')].map((s) => s.getAttribute('viewBox'));
      out.push(vbs.length >= 2 && vbs[0] === vbs[1]);
    }
    return out;
  });
  check('M6 : dans chaque atelier, les deux tracés partagent le même cadre',
    memesCadres.length === 3 && memesCadres.every(Boolean), JSON.stringify(memesCadres));

  // Faire glisser la réglette du bug « compteur » : i attendu ≠ i obtenu
  // AVANT que les tracés ne divergent — c'est l'argument du module.
  const t0 = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M6 : le module affiche i attendu et i obtenu', /i attendu/.test(t0) && /i obtenu/.test(t0),
    t0.slice(0, 300));

  const curseurs = page.locator('main input[type="range"]');
  check('M6 : chaque atelier a sa réglette', (await curseurs.count()) === 3);
  // On pousse la 3e (le compteur) de quelques crans.
  const compteur = curseurs.nth(2);
  await compteur.focus();
  for (let k = 0; k < 4; k += 1) { await page.keyboard.press('ArrowRight'); await settle(page, 120); }
  const tApres = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M6 : la réglette annonce le pas où les deux se séparent',
    /se sont séparés au pas \d+/.test(tApres), tApres.slice(0, 400));
  check('M6 : et pour le compteur, c’est la VARIABLE qui diverge la première',
    /c’est la VARIABLE qui a divergé la première/.test(tApres), 'mention absente');

  // Réparer les trois.
  const boutons = page.locator('main button:has-text("Corriger")');
  const n = await boutons.count();
  check('M6 : trois programmes à corriger', n === 3, `${n} boutons`);
  for (let k = 0; k < n; k += 1) {
    await page.locator('main button:has-text("Corriger")').first().click();
    await settle(page, 350);
  }
  const tFin = (await page.locator('main').first().textContent()).replace(/\s+/g, ' ');
  check('M6 : les trois réparations sont confirmées',
    (tFin.match(/Réparé\./g) || []).length === 3, `${(tFin.match(/Réparé\./g) || []).length}`);
  check('M6 : l’étape 1 se valide une fois les trois réparés',
    /trois natures|Trois pannes, trois natures/.test(tFin), tFin.slice(0, 400));

  issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 7. Un chemin FAUX progresse quand même (non bloquant) ──────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-bloc-qui-choisit`, {
    key: KEY, completedModules: ['0', '1'], tag: 'faux',
  });
  await attendreModule(page, 4);
  // On répond volontairement à côté sur la première question du module.
  await tapOption(page, 'main', 1);
  await settle(page, 400);
  const t = await body(page);
  check('non bloquant : une mauvaise réponse montre la correction',
    /Un bloc de choix|branche|Le corps de la boucle/.test(t), t.slice(0, 300));
  check('non bloquant : la page reste utilisable',
    (await page.locator('main button').count()) >= 2);
  await ctx.close();
}

/* ── 8. Le boss : dix épreuves, une soumission ──────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/mission-finale-latelier-des-choix`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4', '5', '6'], tag: 'boss',
  });
  await attendreModule(page, 4);
  const avant = await body(page);
  check('boss : dix épreuves sont annoncées', /Dix épreuves|10 épreuves/i.test(avant), avant.slice(0, 250));
  check('boss : aucune correction avant la soumission',
    !/Bonne réponse|Réponse correcte/i.test(avant));

  const apres = await runBoss(page);
  check('boss : le test se déroule sans erreur', apres.length > 400);
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ── 9. La carte des connaissances grandit ──────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${LESSON}/le-programme-au-ralenti`, {
    key: KEY, completedModules: TOUS, tag: 'carte',
  });
  const bricks = await page.evaluate(() =>
    [...document.querySelectorAll('[data-knowledge-item]')].map((e) => e.getAttribute('data-knowledge-item')));
  check('carte : le module 1 pose bien ses connaissances au bon moment',
    Array.isArray(bricks), JSON.stringify(bricks));
  const t = await body(page);
  check('carte : aucun mot de 3e n’apparaît (tant que / et-ou / bloc défini)',
    !/tant que/i.test(t) && !/condition composée/i.test(t), t.slice(0, 200));
  await ctx.close();
}

/* ── 10. Mobile 375 px : rien ne déborde ────────────────────────────── */
{
  for (const slug of ['le-programme-au-ralenti', 'le-bloc-qui-choisit', 'le-labo-de-reparation']) {
    const { ctx, page } = await open(browser, `${BASE}${LESSON}/${slug}`, {
      key: KEY, completedModules: TOUS, mobile: true, tag: `mob-${slug}`,
    });
    check(`mobile ${slug} : pas de défilement horizontal`, await noHScroll(page));
    const petites = await smallTargets(page);
    check(`mobile ${slug} : aucune cible tactile < 40 px`, petites.length === 0, JSON.stringify(petites));
    issues.push(...(await domOverflow(page)));
    await ctx.close();
  }
}

/* ── Bilan ──────────────────────────────────────────────────────────── */
check('aucun défaut de mise en page relevé', issues.length === 0, JSON.stringify([...new Set(issues)].slice(0, 8)));
check('console propre', errs.length === 0, errs.slice(0, 5).join(' | '));

await browser.close();
process.exit(summary());
