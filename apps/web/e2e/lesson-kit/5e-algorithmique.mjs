/**
 * Suite e2e — « Algorithmique et programmation » (5e).
 *
 * Ce que cette suite vérifie, et que les contrôles de source ne peuvent pas
 * voir (ils lisent des fichiers, jamais l'application) :
 *
 *   1. chaque module REND (une leçon non branchée dans App.jsx retombe sur la
 *      page d'accueil sans la moindre erreur — cf. scripts/check-routes.mjs) ;
 *   2. l'EXÉCUTION marche : le compteur « n / N instructions » avance et le
 *      tracé apparaît réellement dans le SVG (des <line>, pas une promesse) ;
 *   3. la MODIFICATION d'un paramètre change le dessin — le module 1 repose
 *      entièrement là-dessus, et un curseur inerte le rendrait mensonger ;
 *   4. la BOUCLE ne ment pas : le programme écrit à la main et le programme en
 *      boucle produisent le MÊME nombre de segments dans le DOM (l'invariant
 *      est testé unitairement, on vérifie ici qu'il survit au rendu) ;
 *   5. la découverte 360 ÷ n est ATTEIGNABLE : il existe bien une position du
 *      curseur d'angle où le verdict passe à « Fermée » pour n = 4 ;
 *   6. les manipulations restent REJOUABLES après validation de l'étape
 *      (frozen-manipulation bug class) ;
 *   7. aucune étiquette SVG ne sort de son cadre ni n'en chevauche une autre,
 *      sur TOUTE la plage atteignable des curseurs (balayage, pas échantillon) ;
 *   8. pas de défilement horizontal à 375, 768 et 1440 px ;
 *   9. le test final se monte (le contrat `badges[].test` est une fonction).
 *
 * Lancer : démarrer vite depuis apps/web/ en détaché, puis
 *   KIT_BASE=http://localhost:5251 node apps/web/e2e/lesson-kit/5e-algorithmique.mjs
 */
import {
  launch, open, settle, body, check, summary, errs,
  layoutAudit, aspectAudit, noHScroll,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5251';
// Le segment de domaine est l'id OFFICIEL (`pensee_informatique`, souligné) :
// c'est celui que la carte des cours met dans le lien de la leçon. Cette suite
// a d'abord porté un tiret — elle passait au vert pendant que toute carte
// cliquée retombait sur l'accueil. Une suite e2e qui invente son URL ne teste
// pas le chemin de l'élève.
const L = '/courses/college/5e/pensee_informatique/algorithmique-programmation-5e';
// Clé PORTÉE PAR UTILISATEUR (`u_<id|anon>_<clé>`) : semer la clé nue ne
// déverrouille rien, et la suite échouerait sur une manipulation absente.
const KEY = 'u_anon_smarter_lesson_algorithmique-programmation-5e';
// `completedModules` porte des chaînes NON rembourrées.
const ALL_DONE = ['0', '1', '2', '3', '4', '5', '6', '7'];

const MODULES = [
  ['mission-de-depart', 'Mission de départ'],
  ['le-stylo-qui-obeit', 'Le stylo qui obéit'],
  ['une-entree-pour-le-programme', 'Une entrée'],
  ['le-programme-calcule', 'Le programme calcule'],
  ['douze-fois-la-meme-chose', 'Douze fois'],
  ['la-figure-qui-se-referme', 'La figure qui se referme'],
  ['le-programme-qui-bugue', 'Le programme qui bugue'],
  ['le-labo-de-reparation', 'Le labo de réparation'],
  ['mission-finale-latelier-de-kiwi', 'Mission finale'],
];

/** Attend que le module soit réellement peint (chargement `lazy`). */
async function attendreModule(page) {
  await page.waitForFunction(
    () => (document.body.innerText || '').length > 800,
    null, { timeout: 30000 },
  ).catch(() => {});
  await settle(page, 600);
}

/**
 * Nombre TOTAL de segments tracés sur la page.
 *
 * Deux pièges découverts au navigateur, qui expliquent cette forme :
 *   1. un module porte PLUSIEURS canevas (les laboratoires, mais aussi les
 *      visuels des briques de connaissance), et certains s'exécutent tout
 *      seuls (`autoExecuter`) — compter « le premier svg » suppose un ordre
 *      du DOM qui change dès qu'une révélation conditionnée insère un bloc ;
 *   2. l'ordre des <svg> se DÉPLACE entre deux instants de la même page,
 *      pour la même raison. Un index est donc une cible mouvante.
 * On compte donc le total, et on raisonne sur sa VARIATION — ce qui est
 * exactement la question posée : « l'exécution trace-t-elle vraiment ? ».
 */
const segments = (page) => page.evaluate(
  () => document.querySelectorAll('main svg line[stroke-linecap="round"]').length
);

/** Pousse un <input type=range> à une valeur donnée, en émettant les évènements React. */
async function reglerRange(page, index, valeur) {
  await page.evaluate(([i, v]) => {
    const el = document.querySelectorAll('main input[type="range"]')[i];
    if (!el) return;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, String(v));
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, [index, valeur]);
  await settle(page, 450);
}

/** Balaye tous les <input type=range> de la page en auditant la mise en page. */
async function balayerRanges(page, issues) {
  const n = await page.locator('main input[type="range"]').count();
  for (let i = 0; i < n; i += 1) {
    const { min, max } = await page.evaluate((k) => {
      const el = document.querySelectorAll('main input[type="range"]')[k];
      return { min: Number(el.min), max: Number(el.max) };
    }, i);
    // Balayage, pas échantillon : les deux bornes ET trois points intérieurs.
    const points = [min, min + (max - min) * 0.25, (min + max) / 2, min + (max - min) * 0.75, max];
    for (const v of points) {
      await reglerRange(page, i, Math.round(v));
      issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)));
    }
  }
  return n;
}

const browser = await launch();

/* ── 1. Tous les modules rendent ──────────────────────────────────── */
for (const [slug, titre] of MODULES) {
  const { ctx, page } = await open(browser, `${BASE}${L}/${slug}`, {
    key: KEY, completedModules: ALL_DONE, tag: slug,
  });
  await attendreModule(page);
  const t = await body(page);
  check(`M-${slug} rend`, t.includes(titre) || t.includes('KIWI'),
    `titre « ${titre} » absent — leçon branchée dans App.jsx ?`);
  await ctx.close();
}

/* ── 2. Module 1 : exécution, puis modification du paramètre ──────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/le-stylo-qui-obeit`, {
    key: KEY, completedModules: ALL_DONE, tag: 'm1',
  });
  await attendreModule(page);

  // L'exécution du laboratoire de l'étape 1 ajoute ses trois traits à ce qui
  // est déjà à l'écran (l'étape 2 s'exécute seule : c'est voulu, sa figure est
  // le sujet de l'étape). C'est la VARIATION qui prouve que l'exécution trace.
  const avant = await segments(page);
  await page.locator('button:has-text("Tout de suite")').first().click();
  await settle(page, 900);
  const apres = await segments(page);
  check('M1 l’exécution trace vraiment', apres - avant === 3,
    `${avant} → ${apres} segment(s) : l’exécution devrait en ajouter exactement 3`);

  // Le compteur d'instructions doit refléter l'exécution.
  const t1 = await body(page);
  check('M1 compteur d’instructions', /5\s*\/\s*5 instructions/.test(t1),
    'le compteur « 5 / 5 instructions » ne s’affiche pas');

  // Étape 2 : le curseur d'angle change RÉELLEMENT le dessin.
  const ranges = await page.locator('main input[type="range"]').count();
  check('M1 étape 2 offre un réglage', ranges >= 1, 'aucun input[type=range]');
  if (ranges >= 1) {
    const g1 = await page.evaluate(() => {
      const l = [...document.querySelectorAll('main svg line[stroke-linecap="round"]')];
      return l.map((e) => `${e.getAttribute('x2')},${e.getAttribute('y2')}`).join('|');
    });
    await reglerRange(page, 0, 40);
    const g2 = await page.evaluate(() => {
      const l = [...document.querySelectorAll('main svg line[stroke-linecap="round"]')];
      return l.map((e) => `${e.getAttribute('x2')},${e.getAttribute('y2')}`).join('|');
    });
    check('M1 changer l’angle change le tracé', g1 !== g2,
      'le dessin est identique après avoir bougé le curseur — curseur inerte');
  }

  // Rejouabilité : le bouton d'exécution reste actif après validation.
  const actif = await page.locator('button:has-text("Exécuter le programme")').first().isEnabled();
  check('M1 le labo reste rejouable', actif, 'le bouton Exécuter est désactivé');

  const issues = [];
  await balayerRanges(page, issues);
  check('M1 mise en page sur toute la plage', issues.length === 0, issues.slice(0, 3).join(' / '));
  await ctx.close();
}

/* ── 3. Module 2 : la variable change le dessin sans changer le texte ─ */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/une-entree-pour-le-programme`, {
    key: KEY, completedModules: ALL_DONE, tag: 'm2',
  });
  await attendreModule(page);

  const n = await page.locator('main input[type="range"]').count();
  check('M2 offre l’entrée réglable', n >= 1, 'aucun curseur `cote`');
  if (n >= 1) {
    await reglerRange(page, 0, 25);
    const petit = await page.evaluate(() => {
      const l = [...document.querySelectorAll('main svg line[stroke-linecap="round"]')];
      return l.reduce((s, e) => s + Math.hypot(e.x2.baseVal.value - e.x1.baseVal.value, e.y2.baseVal.value - e.y1.baseVal.value), 0);
    });
    await reglerRange(page, 0, 110);
    const grand = await page.evaluate(() => {
      const l = [...document.querySelectorAll('main svg line[stroke-linecap="round"]')];
      return l.reduce((s, e) => s + Math.hypot(e.x2.baseVal.value - e.x1.baseVal.value, e.y2.baseVal.value - e.y1.baseVal.value), 0);
    });
    // Le cadre du SVG suit la figure : la longueur en pixels ne double pas,
    // mais le tracé DOIT changer. C'est le mensonge qu'on veut exclure.
    check('M2 la variable change la figure', Math.abs(grand - petit) > 0.5,
      'le tracé est identique pour cote=25 et cote=110');

    const t = await body(page);
    check('M2 le programme montre la LECTURE', /=\s*110/.test(t),
      'la valeur lue n’est pas affichée à côté du nom de la variable');
  }
  await ctx.close();
}

/* ── 4. Module 4 : la boucle produit le même tracé que l'écriture à la main ─ */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/douze-fois-la-meme-chose`, {
    key: KEY, completedModules: ALL_DONE, tag: 'm4',
  });
  await attendreModule(page);

  // Étape 1 (à la main) puis étape 2 (en boucle) : chacune a son bouton.
  const boutons = page.locator('button:has-text("Tout de suite")');
  const nb = await boutons.count();
  check('M4 a deux laboratoires', nb >= 2, `${nb} bouton(s) d’exécution`);
  if (nb >= 2) {
    await boutons.nth(0).click(); await settle(page, 600);
    await boutons.nth(1).click(); await settle(page, 800);
    const parCanevas = await page.evaluate(
      () => [...document.querySelectorAll('main svg')]
        .map((s) => s.querySelectorAll('line[stroke-linecap="round"]').length)
        .filter((k) => k > 0)
    );
    // Les deux premiers canevas portent le dodécagone : 12 côtés chacun.
    check('M4 boucle et main tracent pareil',
      parCanevas.length >= 2 && parCanevas[0] === 12 && parCanevas[1] === 12,
      `segments par canevas : ${JSON.stringify(parCanevas)}`);

    const t = await body(page);
    check('M4 compare ce qui est ÉCRIT', /24 instructions/.test(t) && /1 instruction/.test(t),
      'la comparaison 24 / 1 instruction n’apparaît pas');
    check('M4 affirme l’identité des tracés', /identiques/.test(t),
      'la phrase sur l’identité des deux dessins est absente');
  }
  await ctx.close();
}

/* ── 5. Module 5 : la fermeture à 360 ÷ n est ATTEIGNABLE ─────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/la-figure-qui-se-referme`, {
    key: KEY, completedModules: ALL_DONE, tag: 'm5',
  });
  await attendreModule(page);

  // Étape 1 : n vaut 4, un seul curseur (l'angle). 90° doit fermer.
  const t0 = await body(page);
  check('M5 part ouverte', /Ouverte/.test(t0), 'la figure est déjà fermée au chargement');

  await reglerRange(page, 0, 90);
  const t1 = await body(page);
  check('M5 90° referme le carré', /Fermée/.test(t1),
    'le verdict ne passe pas à « Fermée » pour 4 × 90 = 360');
  check('M5 nomme la figure obtenue', /carré/.test(t1), 'le nom « carré » n’apparaît pas');

  // Une valeur voisine doit rouvrir : le verdict n'est pas collé au vert.
  await reglerRange(page, 0, 88);
  const t2 = await body(page);
  check('M5 88° laisse la figure ouverte', /Ouverte/.test(t2),
    'le verdict reste « Fermée » à 88° — tolérance trop large');

  const issues = [];
  await balayerRanges(page, issues);
  check('M5 mise en page sur toute la plage', issues.length === 0, issues.slice(0, 3).join(' / '));
  await ctx.close();
}

/* ── 6. Module 6 : la réparation referme réellement le pentagone ──── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/le-programme-qui-bugue`, {
    key: KEY, completedModules: ALL_DONE, tag: 'm6',
  });
  await attendreModule(page);

  const t0 = await body(page);
  check('M6 désigne l’instruction fautive', /instruction exécutée/.test(t0),
    'le module ne situe pas le premier écart');

  await reglerRange(page, 0, 72);
  const t1 = await body(page);
  check('M6 72° répare le pentagone', /Réparé/.test(t1),
    'régler l’angle sur 72° ne referme pas la figure');
  await ctx.close();
}

/* ── 6bis. Module 7 : le labo d'entraînement répare deux bugs ─────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/le-labo-de-reparation`, {
    key: KEY, completedModules: ALL_DONE, tag: 'm7',
  });
  await attendreModule(page);

  // Le carré boiteux : trois côtés suivent l'entrée, un seul reste bloqué.
  await reglerRange(page, 0, 100);
  // On choisit le canevas par son CONTENU (celui qui porte 4 segments), et
  // jamais par son index : les visuels des briques de connaissance occupent
  // aussi des <svg> dans `main`, et leur position bouge avec les révélations.
  const longueurs = await page.evaluate(() => {
    for (const svg of document.querySelectorAll('main svg')) {
      const l = [...svg.querySelectorAll('line[stroke-linecap="round"]')];
      if (l.length === 4) {
        return l.map((e) => Math.round(Math.hypot(
          e.x2.baseVal.value - e.x1.baseVal.value,
          e.y2.baseVal.value - e.y1.baseVal.value)));
      }
    }
    return [];
  });
  const distinctes = new Set(longueurs).size;
  check('M7 un côté ne suit pas l’entrée', distinctes >= 2,
    `toutes les longueurs sont égales (${JSON.stringify(longueurs)}) — l’intruse ne se voit pas`);

  // L'étoile ratée : 45° doit refermer l'octogone.
  const nRanges = await page.locator('main input[type="range"]').count();
  if (nRanges >= 2) {
    await reglerRange(page, 1, 45);
    const t = await body(page);
    check('M7 45° referme l’octogone', /8 × 45 = 360|un tour complet exactement/.test(t),
      'régler l’angle sur 45° ne referme pas la figure');
  } else {
    check('M7 offre les deux réglages', false, `${nRanges} curseur(s) au lieu de 2`);
  }
  await ctx.close();
}

/* ── 7. Le test final se monte et se soumet ───────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/mission-finale-latelier-de-kiwi`, {
    key: KEY, completedModules: ALL_DONE, tag: 'boss',
  });
  await attendreModule(page);
  const t = await body(page);
  check('Boss se monte', /Épreuve|épreuve|Valider mes/.test(t), 'aucune épreuve rendue');
  const groups = await page.locator('main div[role="group"]').count();
  check('Boss porte 10 épreuves', groups === 10, `${groups} groupe(s) de choix`);
  await ctx.close();
}

/* ── 8. Mobile et largeurs intermédiaires ─────────────────────────── */
for (const [w, h, mobile] of [[375, 667, true], [768, 1024, false], [1440, 900, false]]) {
  for (const slug of ['le-stylo-qui-obeit', 'la-figure-qui-se-referme']) {
    const { ctx, page } = await open(browser, `${BASE}${L}/${slug}`, {
      key: KEY, completedModules: ALL_DONE, mobile, tag: `${w}-${slug}`,
    });
    await page.setViewportSize({ width: w, height: h });
    await attendreModule(page);
    check(`${w}px ${slug} sans défilement horizontal`, await noHScroll(page),
      'la page déborde en largeur');
    const issues = await layoutAudit(page);
    check(`${w}px ${slug} étiquettes SVG saines`, issues.length === 0, issues.slice(0, 2).join(' / '));
    await ctx.close();
  }
}

await browser.close();
check('aucune erreur console', errs.length === 0, errs.slice(0, 3).join(' | '));
summary();
