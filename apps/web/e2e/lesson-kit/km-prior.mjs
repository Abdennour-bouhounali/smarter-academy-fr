// Carte des connaissances — MODE COLONNE (« prior »).
//
// L'invariant que cette suite verrouille, et qui définit le mode à lui seul :
//
//     barre comprimée + contenu + carte  ==  la fenêtre, sans recouvrement
//     ┌────┬────────────────────────────┬────────────┐
//     │ S  │        CONTENU             │  MA CARTE  │
//     └────┴────────────────────────────┴────────────┘
//
// Autrement dit la carte ne se POSE PAS sur la leçon : la leçon lui fait de la
// place. On mesure donc les trois rectangles, et on vérifie qu'ils pavent la
// fenêtre — c'est ce qui distingue une colonne d'un panneau flottant, et
// aucune capture d'écran ne peut le prouver à notre place (§23).
//
// Couvre les scénarios A–G du cahier des charges : leçon, module, index des
// leçons, navigation en mode colonne, fermeture, points de rupture, et
// préservation de l'état (défilement, réponses saisies).
//
// Run: node apps/web/e2e/lesson-kit/km-prior.mjs   (vite sur :5261)
import { chromium } from 'playwright';

const B = process.env.KIT_BASE || 'http://localhost:5261';
// fonctions-3e monte la carte depuis son routes.jsx (le provider enveloppe
// l'index ET les modules) : c'est donc la leçon qui exerce la coquille sur
// les deux types de page.
const LESSON = '/courses/college/3e/donnees_probabilites/fonctions-3e';
const MODULE = `${LESSON}/le-tableau-de-valeurs`;
// La progression est SCOPÉE par utilisateur (utils/storage.js) : l'élève mocké
// a l'id 1, d'où le préfixe `u_1_`. On sème aussi la clé anonyme pour les
// scénarios visiteur.
const LESSON_ID = 'fonctions-3e';
const KEYS = [`u_1_smarter_lesson_${LESSON_ID}`, `u_anon_smarter_lesson_${LESSON_ID}`];

let pass = 0, fail = 0;
const check = (n, c, d = '') => { c ? pass++ : fail++; console.log((c ? '  ok  ' : 'FAIL  ') + n + (c ? '' : '   << ' + d)); };

const browser = await chromium.launch({ args: ['--no-sandbox'] });

/** Les trois rectangles de l'espace de travail, tels que le navigateur les rend. */
const regions = (page) => page.evaluate(() => {
  const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x, w: r.width, right: r.right }; };
  // ModuleLayout rend son PROPRE <main> imbriqué : celui de la coquille est le
  // premier, et c'est lui qui porte la réservation (comme useLessonViewport).
  const main = document.querySelector('main');
  const cs = main ? getComputedStyle(main) : null;
  const r = main?.getBoundingClientRect();
  return {
    sidebar: box(document.querySelector('aside')),
    // Boîte de PADDING de <main> : le rectangle réellement offert à la leçon.
    content: main ? {
      x: r.left + (parseFloat(cs.paddingLeft) || 0),
      right: r.right - (parseFloat(cs.paddingRight) || 0),
      w: r.width - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0),
    } : null,
    map: box(document.getElementById('km-root')),
    vw: window.innerWidth,
    hScroll: document.scrollingElement.scrollWidth > window.innerWidth + 1,
  };
});

async function newPage(ctx, url) {
  const page = await ctx.newPage();
  await page.route('**/auth/me', (r) => r.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ success: true, user: { id: 1, name: 'T', email: 't@t.fr', role: 'student', grade: { id: 11, name: '2nde', slug: 'seconde' } } }),
  }));
  await page.goto(B + url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2400);
  return page;
}

const context = (vp, auth = true) => browser.newContext({ viewport: vp, hasTouch: vp.width < 500, isMobile: vp.width < 500 })
  .then(async (ctx) => {
    await ctx.addInitScript(([keys, a]) => {
      const done = JSON.stringify({ completedModules: ['0', '1', '2', '3', '4', '5', '6'], completedExercises: [] });
      keys.forEach((k) => localStorage.setItem(k, done));
      if (a) localStorage.setItem('token', 'fake');
      localStorage.removeItem('knowledgeMapExpanded');
      localStorage.removeItem('knowledgeMapPrior');
    }, [KEYS, auth]);
    return ctx;
  });

/**
 * Ouvre la carte (si elle ne l'est pas déjà) puis bascule en mode colonne.
 * Le déclencheur est une BASCULE : sur une page où la préférence a déjà
 * rouvert la carte, cliquer dessus la refermerait — d'où le test préalable.
 */
async function openMap(page) {
  // Après une navigation, le panneau de la page précédente peut encore être
  // en cours d'animation de sortie : on attend qu'il ait disparu avant de
  // décider s'il faut cliquer, sinon on referme une carte qu'on croyait
  // ouverte (le déclencheur est une bascule).
  await page.waitForTimeout(600);
  if ((await page.locator('#km-root').count()) === 0) {
    await page.locator('[data-km-trigger]').click();
  }
  await page.waitForTimeout(900);
}

async function enterPrior(page) {
  await openMap(page);
  const col = page.locator('#km-root [data-km-view="prior"]');
  if (!(await col.count())) return false;
  await col.click();
  await page.waitForTimeout(900); // transition 300ms + ressort framer-motion
  return true;
}

/* ── A / B — la coquille normale, puis la coquille en colonne ─────────────── */
{
  console.log('\n=== A+B: lesson page, normal → prior (1440) ===');
  const ctx = await context({ width: 1440, height: 900 });
  const page = await newPage(ctx, MODULE);

  const before = await regions(page);
  check('A: sidebar déployée (256)', Math.abs(before.sidebar.w - 256) < 2, JSON.stringify(before.sidebar));
  check('A: aucune carte montée', before.map === null);

  check('B: le contrôle « Colonne » existe', await enterPrior(page));
  const after = await regions(page);

  check('B: la barre latérale se comprime (80)', Math.abs(after.sidebar.w - 80) < 2, JSON.stringify(after.sidebar));
  check('B: le contenu RÉTRÉCIT vraiment', after.content.w < before.content.w - 100, `${before.content.w} -> ${after.content.w}`);
  check('B: la carte occupe sa propre colonne', after.map && after.map.w >= 300, JSON.stringify(after.map));
  // Le cœur du mode : les trois zones pavent la fenêtre.
  check('B: barre + contenu + carte == fenêtre',
    Math.abs(after.sidebar.w + after.content.w + after.map.w - after.vw) < 4,
    JSON.stringify({ s: after.sidebar.w, c: after.content.w, m: after.map.w, vw: after.vw }));
  check('B: la carte ne recouvre PAS le contenu', after.map.x >= after.content.right - 2,
    `map.x=${after.map.x} content.right=${after.content.right}`);
  check('B: la carte touche le bord droit', Math.abs(after.map.right - after.vw) < 2, JSON.stringify(after.map));
  check('B: aucun défilement horizontal', !after.hScroll);

  // §19 — icônes seules, mais la navigation reste nommée et cliquable.
  const nav = await page.locator('aside a[aria-label]').first();
  check('B: le lien de nav garde son nom accessible', !!(await nav.getAttribute('aria-label')));
  const navBox = await nav.boundingBox();
  check('B: la zone de clic reste >= 44px', navBox.height >= 43, JSON.stringify(navBox));

  // §17 — la carte défile pour son compte.
  check('B: la carte a son propre défilement', (await page.locator('#km-root [data-km-scroll]').count()) === 1);

  await page.screenshot({ path: new URL('./shots/km-prior-1440.png', import.meta.url).pathname });
  await ctx.close();
}

/* ── C / D — la coquille survit à la navigation, sur toutes les pages ────── */
{
  console.log('\n=== C+D: navigation while prior stays active ===');
  const ctx = await context({ width: 1440, height: 900 });
  const page = await newPage(ctx, MODULE);
  await enterPrior(page);

  // C — un autre module.
  await page.goto(B + LESSON, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2400);
  await openMap(page);
  await page.waitForTimeout(500);
  const idx = await regions(page);
  check('C: l\'index de la leçon retrouve le mode colonne', Math.abs(idx.sidebar.w - 80) < 2 && idx.map && idx.map.w >= 300,
    JSON.stringify({ s: idx.sidebar?.w, m: idx.map?.w }));
  check('C: pas de défilement horizontal sur l\'index', !idx.hScroll);

  // D — le catalogue des leçons, qui n'a pas de carte : la coquille redéploie.
  await page.goto(B + '/courses', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const cat = await regions(page);
  check('D: une page sans carte redéploie la barre', Math.abs(cat.sidebar.w - 256) < 2, JSON.stringify(cat.sidebar));
  check('D: aucune gouttière vide', cat.map === null && !cat.hScroll);
  await ctx.close();
}

/* ── E — fermeture : tout revient ────────────────────────────────────────── */
{
  console.log('\n=== E: closing restores the normal shell ===');
  const ctx = await context({ width: 1440, height: 900 });
  const page = await newPage(ctx, MODULE);
  const before = await regions(page);
  await enterPrior(page);
  await page.locator('#km-root button[aria-label="Fermer la carte"]').click();
  await page.waitForTimeout(900);
  const after = await regions(page);
  check('E: la barre se redéploie', Math.abs(after.sidebar.w - 256) < 2, JSON.stringify(after.sidebar));
  check('E: le contenu retrouve sa largeur', Math.abs(after.content.w - before.content.w) < 3, `${before.content.w} -> ${after.content.w}`);
  check('E: la carte a disparu', after.map === null);
  await ctx.close();
}

/* ── F — points de rupture ───────────────────────────────────────────────── */
for (const vp of [{ width: 1600, height: 900 }, { width: 1280, height: 800 }, { width: 1024, height: 800 }]) {
  console.log(`\n=== F: prior at ${vp.width} ===`);
  const ctx = await context(vp);
  const page = await newPage(ctx, MODULE);
  const ok = await enterPrior(page);
  check(`F(${vp.width}): mode colonne disponible`, ok);
  if (ok) {
    const r = await regions(page);
    check(`F(${vp.width}): les trois zones pavent la fenêtre`,
      Math.abs(r.sidebar.w + r.content.w + r.map.w - r.vw) < 4,
      JSON.stringify({ s: r.sidebar.w, c: r.content.w, m: r.map.w, vw: r.vw }));
    check(`F(${vp.width}): le contenu reste utilisable (>= 480px)`, r.content.w >= 480, `${r.content.w}`);
    check(`F(${vp.width}): aucun défilement horizontal`, !r.hScroll);
  }
  await ctx.close();
}

// Sous 1024 : le mode colonne n'est PAS proposé, l'expérience mobile est intacte.
for (const vp of [{ width: 820, height: 1180 }, { width: 375, height: 667 }]) {
  console.log(`\n=== F: mobile/tablet ${vp.width} keeps the existing behaviour ===`);
  const ctx = await context(vp);
  const page = await newPage(ctx, MODULE);
  await openMap(page);
  check(`F(${vp.width}): pas de contrôle « Colonne »`, (await page.locator('#km-root [data-km-view="prior"]').count()) === 0);
  const r = await regions(page);
  check(`F(${vp.width}): la carte reste le tiroir habituel (bord droit fixe)`, Math.abs(r.map.right - r.vw) < 2, JSON.stringify(r.map));
  check(`F(${vp.width}): aucun défilement horizontal`, !r.hScroll);
  await ctx.close();
}

/* ── G + §15/§16 — l'état de la leçon survit à la bascule ────────────────── */
{
  console.log('\n=== G: lesson state + scroll survive the transition ===');
  const ctx = await context({ width: 1440, height: 900 });
  const page = await newPage(ctx, MODULE);

  // On saisit une réponse et on descend dans la page.
  const input = page.locator('input[type="text"], input[type="number"]').first();
  let typed = false;
  if (await input.count()) { await input.fill('7'); typed = true; }
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(300);
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const urlBefore = page.url();

  await enterPrior(page);

  const scrollAfter = await page.evaluate(() => window.scrollY);
  check('G: le défilement est préservé', Math.abs(scrollAfter - scrollBefore) < 40, `${scrollBefore} -> ${scrollAfter}`);
  check('G: aucune navigation', page.url() === urlBefore);
  if (typed) check('G: la réponse saisie est intacte', (await input.inputValue()) === '7');

  // §12 — les SVG interactifs suivent le rétrécissement sans déborder.
  const overflow = await page.evaluate(() => {
    const main = document.querySelector('main');
    const cs = getComputedStyle(main);
    const r = main.getBoundingClientRect();
    const right = r.right - (parseFloat(cs.paddingRight) || 0);
    return [...main.querySelectorAll('svg')].filter((s) => s.getBoundingClientRect().right > right + 2).length;
  });
  check('G: aucun SVG ne déborde du contenu rétréci', overflow === 0, `${overflow} svg`);
  const r = await regions(page);
  check('G: aucun défilement horizontal', !r.hScroll);
  await ctx.close();
}

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
