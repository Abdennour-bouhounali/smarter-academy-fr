// End-to-end test for the 5e lesson « Les parallélogrammes ».
// Run: node apps/web/e2e/lesson-kit/5e-parallelogrammes.mjs   (vite on :5261)
//
// Ce que cette suite protège, au-delà du « ça charge » :
//
//  1. LA DÉCOUVERTE DU MODULE 1 — les quatre témoins s'allument ENSEMBLE. Si
//     un jour l'égalité des longueurs cessait d'accompagner le parallélisme,
//     la leçon perdrait sa raison d'être et le test le dirait.
//  2. L'INVARIANT DU MODULE 7 — le côté oblique s'allonge, l'aire ne bouge
//     pas. C'est la misconception « aire = base × côté », détruite par un
//     geste : le test rejoue ce geste et compare les nombres affichés.
//  3. AUCUNE COLLISION SUR TOUT L'ÉTAT ATTEIGNABLE (§17bis « sweep, don't
//     sample ») : les sommets sont traînés dans les coins et sur les bords,
//     et le détecteur de l'audit tourne à chaque étape.
//  4. LE TEST FINAL est silencieux jusqu'à la soumission unique, puis rend
//     10/10 quand toutes les bonnes réponses sont cochées.
//  5. LA PORTE DE PROGRESSION reste non bloquante et l'évaluation ouverte.
import {
  launch, open, check, summary, errs, body, settle, layoutAudit, domOverflow,
  noHScroll, smallTargets, runBoss,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5261';
const LESSON = `${BASE}/courses/college/5e/espace_geometrie/parallelogrammes-5e`;
const KEY = 'u_anon_smarter_lesson_parallelogrammes-5e';
const SEED = ['0', '1', '2', '3', '4', '5', '6', '7'];

const M = {
  diag: `${LESSON}/mission-de-depart`,
  m1: `${LESSON}/le-portail-qui-souvre`,
  m2: `${LESSON}/la-quatrieme-place`,
  m3: `${LESSON}/ce-que-les-cotes-promettent`,
  m4: `${LESSON}/le-point-ou-tout-se-croise`,
  m5: `${LESSON}/quelle-propriete-conclut`,
  m6: `${LESSON}/la-famille`,
  m7: `${LESSON}/l-aire-et-la-hauteur`,
  boss: `${LESSON}/mission-finale-le-parallelogramme`,
};

const o = (browser, url, seed = SEED, extra = {}) =>
  open(browser, url, { key: KEY, completedModules: seed, ...extra });

/**
 * Traîne la poignée d'indice `i` vers un point donné EN COORDONNÉES viewBox.
 *
 * Passer par le viewBox plutôt que par des pixels d'écran est ce qui rend le
 * test indépendant de la largeur : la même cible mathématique est visée à
 * 375 px comme à 1280 px.
 */
async function dragTo(page, i, vx, vy) {
  const h = page.locator('g[role="button"]').nth(i);
  if (!(await h.count())) return false;
  await h.scrollIntoViewIfNeeded();
  const svg = page.locator('svg').filter({ has: page.locator('g[role="button"]') }).first();
  const sb = await svg.boundingBox();
  const vb = (await svg.getAttribute('viewBox')).split(' ').map(Number);
  const bb = await h.boundingBox();
  if (!bb || !sb) return false;
  await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await page.mouse.down();
  await page.mouse.move(sb.x + (vx / vb[2]) * sb.width, sb.y + (vy / vb[3]) * sb.height, { steps: 16 });
  await page.mouse.up();
  await page.waitForTimeout(120);
  return true;
}

/** Les quatre cases de mesure du laboratoire d'aire, lues dans le DOM. */
const casesAire = (page) => page.evaluate(() => {
  const out = {};
  document.querySelectorAll('div.rounded-xl').forEach((d) => {
    const l = [...d.children].map((c) => c.textContent.trim());
    if (l.length === 3 && ['La base AB', 'La hauteur', 'Le côté AD', 'L’aire'].includes(l[0])) out[l[0]] = l[1];
  });
  return out;
});

const browser = await launch();

/* ── Index et diagnostic ────────────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, LESSON, null, { tag: 'index' });
  const b = await body(page);
  check('index: titre de la leçon', b.includes('Les parallélogrammes'));
  check('index: les 9 modules sont listés', b.includes('Le portail qui s’ouvre') && b.includes('Mission finale'));
  await ctx.close();
}
{
  const { ctx, page } = await o(browser, M.diag, null, { tag: 'diag' });
  const b = await body(page);
  check('module 0: mesure des prérequis de 6e', b.includes('quadrilatère') && b.includes('parallèles'));
  /* Le module 0 MESURE des prérequis et n'enseigne rien de la leçon. On lit
     donc le CONTENU des questions, pas le body entier : le fil d'Ariane et le
     titre de la leçon portent légitimement le mot « parallélogramme ». */
  const enonces = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    return [...main.querySelectorAll('p, button, li')].map((e) => e.textContent).join(' ');
  });
  check('module 0: aucune question ne porte sur la matière de la leçon',
    !/parall[ée]logramme/i.test(enonces));
  await ctx.close();
}

/* ── M1 : les quatre témoins s'allument ENSEMBLE ────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m1, null, { tag: 'm1' });
  const issues = [];
  let b = await body(page);
  check('M1: l’étape n’est pas résolue au montage', !b.includes('égalités de longueurs'));
  check('M1: les quatre témoins sont éteints au départ', (b.match(/il s’en faut/g) || []).length === 4);

  // La place de D : quatrieme sommet de A(190,390) B(470,390) C(560,190).
  await dragTo(page, 0, 280, 190);
  b = await body(page);
  const eteints = (b.match(/il s’en faut/g) || []).length;
  check('M1: LES QUATRE témoins s’allument au même instant', eteints === 0, `${eteints} encore éteint(s)`);
  check('M1: la découverte est énoncée après le geste', b.includes('égalités de longueurs'));
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  check('M1: aucune collision ni débordement', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}

/* ── M3 : le contre-exemple introuvable ─────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m3, SEED, { tag: 'm3' });
  // Le sommet D est ASSERVI : quoi qu'on traîne, les côtés opposés restent
  // égaux. C'est ce que le module demande à l'élève de constater.
  const lire = () => page.evaluate(() => {
    const t = document.body.innerText;
    const m = [...t.matchAll(/(AB|DC|AD|BC)\s+([\d,]+)\s*cm/g)].map((x) => [x[1], x[2]]);
    return Object.fromEntries(m);
  });
  let egal = true;
  for (const [vx, vy] of [[300, 150], [600, 420], [120, 430], [700, 120]]) {
    await dragTo(page, 0, vx, vy);
    const v = await lire();
    if (v.AB && v.DC && v.AB !== v.DC) egal = false;
    if (v.AD && v.BC && v.AD !== v.BC) egal = false;
  }
  check('M3: aucun contre-exemple n’existe — les côtés opposés restent égaux', egal);
  check('M3: aucune erreur JS', errs.length === 0);
  await ctx.close();
}

/* ── M4 : milieu commun ≠ même longueur ─────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m4, SEED, { tag: 'm4' });
  const b = await body(page);
  check('M4: le milieu des deux diagonales est affiché', b.includes('milieu de [AC]') && b.includes('milieu de [BD]'));
  check('M4: le contraste avec la longueur des diagonales est montré', b.includes('Et les diagonales entières'));
  await ctx.close();
}

/* ── M6 : la famille, sans jamais quitter le parallélogramme ────────────── */
{
  const { ctx, page } = await o(browser, M.m6, SEED, { tag: 'm6' });
  await dragTo(page, 2, 470, 170);
  const b = await body(page);
  check('M6: un rectangle se fabrique en traînant un sommet', b.includes('rectangle'));
  check('M6: le bandeau « toujours un parallélogramme » reste allumé', b.includes('toujours un parallélogramme'));
  await ctx.close();
}

/* ── M7 : le côté grandit, l'aire ne bouge pas ──────────────────────────── */
{
  const { ctx, page } = await o(browser, M.m7, SEED, { tag: 'm7' });
  const avant = await casesAire(page);
  await dragTo(page, 0, 400, 180);
  const apres = await casesAire(page);
  const num = (s) => parseFloat(String(s).replace(/[^\d,]/g, '').replace(',', '.'));
  check('M7: le côté AD s’allonge', num(apres['Le côté AD']) > num(avant['Le côté AD']),
    `${avant['Le côté AD']} → ${apres['Le côté AD']}`);
  check('M7: L’AIRE NE BOUGE PAS', avant['L’aire'] === apres['L’aire'],
    `${avant['L’aire']} → ${apres['L’aire']}`);
  check('M7: la base et la hauteur ne bougent pas',
    avant['La base AB'] === apres['La base AB'] && avant['La hauteur'] === apres['La hauteur']);
  await ctx.close();
}

/* ── Balayage anti-collision sur tout l'état atteignable ────────────────── */
{
  const CIBLES = [[40, 40], [720, 40], [40, 480], [720, 480], [380, 30], [380, 495], [30, 260], [730, 260]];
  const PAGES = [[M.m1, [0]], [M.m3, [0, 1, 2]], [M.m6, [0, 1, 2]], [M.m7, [0]]];
  let hits = 0;
  let etats = 0;
  for (const [url, poignees] of PAGES) {
    const { ctx, page } = await o(browser, url, SEED, { tag: 'sweep' });
    for (const i of poignees) {
      for (const [vx, vy] of CIBLES) {
        if (!(await dragTo(page, i, vx, vy))) continue;
        etats += 1;
        hits += (await layoutAudit(page)).length + (await domOverflow(page)).length;
      }
    }
    await ctx.close();
  }
  check(`balayage: ${etats} états atteignables, aucune collision`, hits === 0, `${hits} collision(s)`);
}

/* ── Mobile 375 px ──────────────────────────────────────────────────────── */
{
  for (const [nom, url] of [['M1', M.m1], ['M5', M.m5], ['M7', M.m7]]) {
    const { ctx, page } = await o(browser, url, SEED, { mobile: true, tag: `mob-${nom}` });
    await settle(page);
    check(`mobile ${nom}: aucun scroll horizontal`, await noHScroll(page));
    const small = (await smallTargets(page)).filter((t) => !/Ctrl\+K/.test(t.text || ''));
    check(`mobile ${nom}: cibles tactiles ≥ 40 px`, small.length === 0, JSON.stringify(small.slice(0, 2)));
    await ctx.close();
  }
}

/* ── Test final : silencieux, puis 10/10 ────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.boss, SEED, { tag: 'boss' });
  let b = await body(page);
  check('boss: accessible même sans avoir tout fait (chemin « je maîtrise déjà »)', !b.includes('verrouillé'));
  check('boss: silencieux avant la soumission unique', !/\d+\s*\/\s*10\s*(bonnes|justes)/i.test(b));
  const titres = await page.locator('h3').count();
  check('boss: dix épreuves', titres === 10, `${titres} trouvée(s)`);
  for (let i = 0; i < titres; i += 1) {
    const card = page.locator('h3').nth(i).locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]');
    const opt = card.locator('button').first();
    if (await opt.count()) { await opt.scrollIntoViewIfNeeded(); await opt.click().catch(() => {}); }
  }
  await runBoss(page).catch(() => {});
  const valider = page.locator('button', { hasText: /valider|terminer|soumettre|résultat/i }).first();
  if (await valider.count()) { await valider.scrollIntoViewIfNeeded(); await valider.click().catch(() => {}); }
  await settle(page, 1200);
  b = await body(page);
  check('boss: la bonne réponse est en position 0 partout → 10/10', /10\s*\/\s*10/.test(b), b.match(/\d+\s*\/\s*10/)?.[0] ?? 'aucun score');
  await ctx.close();
}

check('aucune erreur JS sur toute la leçon', errs.length === 0, errs.slice(0, 3).join(' | '));
await browser.close();
summary();
