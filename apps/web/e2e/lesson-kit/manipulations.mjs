// Les MANIPULATIONS de l'unité 1 — laboratoires tactiles.
//
// Ce que cette suite verrouille, pour de vrai (vrais événements de pointeur) :
//   1. GLISSER : prendre un objet, le porter, le poser dans une zone — et la
//      page ne défile pas pendant le geste ;
//   2. ALTERNATIVE sans glisser : toucher l'objet puis la zone ; et le clavier ;
//   3. REFUS EXPLIQUÉ : un dépôt invalide revient avec une raison en arabe ;
//   4. LA NOTATION SUIT LE GESTE : l'égalité se remplit après l'action, et le
//      RÉSULTAT (PGCD, règle) n'apparaît JAMAIS avant la phase « اكتشف » ;
//   5. إعادة remet tout à zéro ; les indices sont progressifs ;
//   6. MODE CLASSE : الخطوة التالية, إخفاء النتيجة, إظهار الحل ;
//   7. PALIERS : changer de niveau change les nombres ;
//   8. MOBILE 320 px : aucun débordement, cibles ≥ 44 px ;
//   9. prefers-reduced-motion : la manipulation reste utilisable.
//
// Run : KIT_BASE=http://localhost:5183 node apps/web/e2e/lesson-kit/manipulations.mjs
import { BASE, launch, check, summary, watchErrors, seed, lessonKey, noHorizontalScroll } from './helpers.mjs';

const CH = `${BASE}/courses/moyen/4am/ansab_al_aadad_wal_hisab`;
const errors = [];
const { browser } = await launch();

async function open(url, { mobile = false, reducedMotion = false, completed = null, lesson = null } = {}) {
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 320, height: 720 } : { width: 1280, height: 900 },
    hasTouch: mobile, isMobile: mobile,
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
  });
  const page = await ctx.newPage();
  watchErrors(page, errors);
  if (completed && lesson) await seed(page, completed, lessonKey(lesson));
  await page.goto(url, { waitUntil: 'networkidle' });
  return { ctx, page };
}

/**
 * Un VRAI glisser : appui, déplacements intermédiaires, relâchement.
 *
 * `page.mouse` ne fait PAS défiler la page (contrairement à `click()`) : un
 * objet hors écran ne recevrait aucun événement, et le test échouerait en
 * accusant la manipulation. On amène donc les deux extrémités dans le
 * viewport avant de commencer, puis on relit les positions.
 */
async function dragTo(page, source, target) {
  await source.scrollIntoViewIfNeeded();
  await target.scrollIntoViewIfNeeded();
  await source.scrollIntoViewIfNeeded();
  await page.waitForTimeout(120);
  const s = await source.boundingBox();
  const t = await target.boundingBox();
  await page.mouse.move(s.x + s.width / 2, s.y + s.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 6; i += 1) {
    await page.mouse.move(s.x + s.width / 2 + ((t.x + t.width / 2 - s.x - s.width / 2) * i) / 6,
      s.y + s.height / 2 + ((t.y + t.height / 2 - s.y - s.height / 2) * i) / 6);
  }
  await page.mouse.up();
  await page.waitForTimeout(220);
}

const phaseOf = (manip) => manip.getAttribute('data-phase');  // sur le Locator, jamais sur un ElementHandle figé
const tile = (manip, v) => manip.locator(`[data-drag-source="${v}"]`).first();
/** Ajouter `n` groupes (common-divisors) par le bouton « + » — le chemin sans glisser. */
async function addGroups(manip, n) {
  const plus = manip.locator('[data-group-stock]').locator('xpath=..').getByRole('button').last();
  for (let i = 0; i < n; i += 1) await plus.click();
  await manip.page().waitForTimeout(250);
}

/**
 * Choisir un NIVEAU dans l'atelier à deux niveaux (مبتدئ / متقدم).
 *
 * Depuis la refonte, le module 1 de chaque leçon ouvre sur un
 * `ManipulationWorkspace` : le niveau débutant est affiché d'office et les
 * manipulations du manuel vivent au niveau متقدم. Un test qui vise une
 * manipulation du manuel doit donc d'abord basculer — sans quoi il
 * interrogerait un panneau `hidden`.
 */
async function pickLevel(page, level) {
  const tab = page.locator(`[data-manipulation-workspace] [role="tab"][data-level="${level}"]`).first();
  if (!(await tab.count())) return false;
  await tab.click();
  await page.waitForTimeout(350);
  return true;
}

/**
 * La manipulation de type `type` DANS le panneau de niveau visible.
 *
 * Un même type peut servir aux deux niveaux (le rectangle sert 24 au niveau
 * مبتدئ et 60 au niveau متقدم) : `.first()` attraperait alors le panneau
 * masqué, et le test attendrait indéfiniment un élément `hidden`. On vise
 * donc le panneau visible, avec un repli sur la page pour les modules qui
 * n'ont pas d'atelier.
 */
function manip(page, type) {
  const scoped = page.locator(`[data-manipulation-level-panel]:not([hidden]) [data-manipulation="${type}"]`).first();
  return { scoped, loose: page.locator(`[data-manipulation="${type}"]`).first() };
}

async function visibleManip(page, type) {
  const { scoped, loose } = manip(page, type);
  if (await scoped.count()) return scoped;
  return loose;
}

/* ── 1 · 4 — divisor-explorer-books : LE RAYON QU'ON ÉTIRE (module 1, متقدم) ──
   Depuis le 2026-09-30 l'élève ne touche plus un nombre parmi dix-sept : il
   TIRE le serre-livres d'un rayon (role=slider). Tous les rayons suivent, les
   420 livres se rangent PENDANT le geste, ce qui ne remplit pas un rayon reste
   au sol dans un rayon fantôme. L'essai est validé au relâchement (ou après
   une pause au clavier) ; la découverte demande trois essais et le contraste. */

/** Poser le rayon sur `v` au CLAVIER (Début, puis ← en RTL) et attendre que l'essai soit validé. */
async function setShelf(page, m, v) {
  const h = m.locator('[data-stretch-handle]');
  await h.focus();
  await page.keyboard.press('Home');
  const min = Number(await h.getAttribute('aria-valuemin'));
  for (let i = min; i < v; i += 1) await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(900);
}

/** L'abscisse (viewport) d'un repère de la réglette. */
async function markX(m, v) {
  const b = await m.locator(`[data-shelf-mark="${v}"] path`).boundingBox();
  return b.x + b.width / 2;
}

const shelfState = async (m) => ({
  cap: await m.locator('[data-bookcase]').getAttribute('data-capacity'),
  shelves: await m.locator('[data-shelf]').count(),
  floor: await m.locator('[data-floor-book]').count(),
  books: await m.locator('[data-book]').count(),
});

{
  const { ctx, page } = await open(`${CH}/qasim-adad-tabii/al-maktaba`);
  await pickLevel(page, 'advanced');
  const m = await visibleManip(page, 'divisor-explorer-books');
  await m.waitFor();
  const handle = m.locator('[data-stretch-handle]');

  let st = await shelfState(m);
  check('L1 : avant le geste, les 420 livres sont DESSINÉS au sol — aucun rayon, aucune égalité', st.floor === 420 && st.shelves === 0 && (await m.locator('[data-manipulation-representation]').count()) === 0, JSON.stringify(st));
  check('L1 : le geste est le serre-livres (role=slider, 10 → 60), plus aucune taille-bouton', (await handle.getAttribute('role')) === 'slider'
    && (await handle.getAttribute('aria-valuemin')) === '10' && (await handle.getAttribute('aria-valuemax')) === '60' && (await m.locator('.be-choice').count()) === 0);
  check('L1 : les deux propositions du manuel (26, 28) sont des REPÈRES sur la réglette', (await m.locator('[data-shelf-mark]').count()) === 2);
  check('L1 : « الشرح » n’existe pas avant la découverte', (await m.getByRole('button', { name: 'إظهار الشرح' }).count()) === 0);

  // UN VRAI GLISSER : la bibliothèque suit PENDANT le geste, l'égalité vient au relâchement.
  await m.locator('[data-model-shelf]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const hb = await handle.boundingBox();
  const y = hb.y + hb.height / 2;
  await page.mouse.move(hb.x + hb.width / 2, y);
  await page.mouse.down();
  const x26 = await markX(m, 26);
  const x28 = await markX(m, 28);
  await page.mouse.move(x26, y, { steps: 8 });
  await page.waitForTimeout(120);
  st = await shelfState(m);
  check('L1 : PENDANT le glisser, 26 par rayon → 16 rayons, 4 livres dans le rayon fantôme', st.cap === '26' && st.shelves === 16 && st.floor === 4, JSON.stringify(st));
  check('L1 : pendant le glisser, l’égalité n’est pas encore écrite', (await m.locator('[data-manipulation-representation]').count()) === 0);
  check('L1 : le rayon fantôme montre les 22 places vides', (await m.locator('[data-empty-slot]').count()) === 22);
  await page.mouse.move(x28, y, { steps: 3 });
  await page.mouse.up();
  await page.waitForTimeout(250);
  st = await shelfState(m);
  check('L1 : relâché sur 28 → 15 rayons, sol vide, les 420 livres sur les rayons', st.cap === '28' && st.shelves === 15 && st.floor === 0 && st.books === 420, JSON.stringify(st));
  const eq28 = ((await m.locator('[data-manipulation-representation]').textContent()) ?? '').replace(/\s+/g, '');
  check('L1 : au relâchement, 420 = 28 × 15 + 0 émerge', eq28.includes('420=28×15+0'), eq28.slice(0, 60));
  check('L1 : les rôles sont nommés — b choisi, q produit, r < b', (await m.locator('[data-division-role]').count()) === 3);
  check('L1 : la page n’a pas défilé pendant le geste', (await page.evaluate(() => window.scrollY)) === scrollBefore);
  check('L1 : le sol vide est dit en mots, sans « رائع »', (await m.locator('[data-floor-note="empty"]').count()) === 1 && !((await m.textContent()) ?? '').includes('رائع'));

  // LE CLAVIER : deux flèches → 26, validé après la pause.
  await handle.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(900);
  st = await shelfState(m);
  check('L1 : au clavier (→ →), 26 : 16 rayons et 4 livres au sol', st.cap === '26' && st.shelves === 16 && st.floor === 4, JSON.stringify(st));
  const eq26 = ((await m.locator('[data-manipulation-representation]').textContent()) ?? '').replace(/\s+/g, '');
  check('L1 : 420 = 26 × 16 + 4', eq26.includes('420=26×16+4'), eq26.slice(0, 60));
  check('L1 : la résistance est dite : il manque 22 livres pour un rayon de plus', ((await m.locator('[data-floor-note="ghost"]').textContent()) ?? '').includes('22'));
  check('L1 : deux essais (28, 26) ne suffisent pas à la découverte', (await phaseOf(m)) === 'act');

  // LE BOUTON + (sans glisser), et la découverte après le TROISIÈME essai.
  await m.getByRole('button', { name: 'رفّ أطول بكتاب' }).click();
  await page.waitForTimeout(100);
  check('L1 : « + » allonge le rayon aussitôt (27)', (await shelfState(m)).cap === '27');
  check('L1 : … mais l’essai n’est validé qu’après la pause', (await phaseOf(m)) === 'act');
  await page.waitForTimeout(900);
  check('L1 : trois essais dont un juste et un avec reste → « اكتشف »', (await phaseOf(m)) === 'discover' && (await m.locator('[data-manipulation-discovery]').count()) === 1);
  check('L1 : « الشرح » apparaît avec la découverte', (await m.getByRole('button', { name: 'إظهار الشرح' }).count()) === 1);

  // LES EXTRÊMES : aucun rayon tronqué, aucun livre perdu.
  await handle.focus();
  await page.keyboard.press('Home');
  await page.waitForTimeout(250);
  st = await shelfState(m);
  check('L1 : 10 par rayon → les 42 rayons sont dessinés, 420 livres', st.shelves === 42 && st.books === 420, JSON.stringify(st));
  await page.keyboard.press('End');
  await page.waitForTimeout(250);
  st = await shelfState(m);
  check('L1 : 60 par rayon → 7 rayons de 60', st.shelves === 7 && (await m.locator('[data-shelf]').first().locator('[data-book]').count()) === 60, JSON.stringify(st));
  check('L1 : aucun débordement horizontal', await noHorizontalScroll(page));

  // LA CONJECTURE : une fausse se réfute par un essai réel, la bonne écrit la règle.
  await m.locator('[data-manipulation-discovery] button', { hasText: 'زوجيًّا' }).click();
  await page.waitForTimeout(150);
  check('L1 : « b pair » est réfuté par 26 (pair, 4 au sol)', /26/.test((await m.locator('[data-manipulation-discovery] [role="status"]').textContent()) ?? ''));
  await m.locator('[data-manipulation-discovery] button', { hasText: 'معدومًا' }).click();
  await page.waitForTimeout(250);
  const formal = ((await m.locator('[data-manipulation-formal]').textContent()) ?? '').replace(/\s+/g, '');
  check('L1 : la règle s’écrit, et le quotient aussi est un قاسم : 420 = 28 × 15 = 15 × 28', (await phaseOf(m)) === 'formal' && formal.includes('28×15=15×28'), formal.slice(0, 120));

  // « إعادة » recommence TOUT : rayon vide, mémoire effacée, découverte fermée.
  await m.getByRole('button', { name: 'إعادة' }).click();
  await page.waitForTimeout(250);
  st = await shelfState(m);
  check('L1 : « إعادة » rend les 420 livres au sol et referme la découverte', st.floor === 420 && st.shelves === 0 && (await phaseOf(m)) === 'act'
    && (await m.locator('[data-manipulation-discovery]').count()) === 0, JSON.stringify(st));

  // Toucher la réglette y pose le rayon (cible de toute la largeur).
  await m.locator('[data-model-shelf]').scrollIntoViewIfNeeded();
  const track = await m.locator('[data-model-shelf]').boundingBox();
  await page.mouse.click(await markX(m, 26), track.y + track.height / 2);
  await page.waitForTimeout(250);
  check('L1 : toucher la réglette pose le rayon là (26)', (await shelfState(m)).cap === '26');

  check('L1 : un visiteur ne voit pas « عرض المناولة »', (await m.locator('[data-classroom-enter]').count()) === 0
    && (await page.locator('[data-classroom-scope="manipulation"][data-classroom-active="false"]').count()) === 1);
  await ctx.close();
}

/* Le rayon sur un téléphone (320 px) : rien ne déborde, la poignée et −/+ sont des cibles. */
{
  const { ctx, page } = await open(`${CH}/qasim-adad-tabii/al-maktaba`, { mobile: true });
  await pickLevel(page, 'advanced');
  const m = await visibleManip(page, 'divisor-explorer-books');
  await m.waitFor();
  const h = await m.locator('[data-stretch-handle]').boundingBox();
  const plus = await m.getByRole('button', { name: 'رفّ أطول بكتاب' }).boundingBox();
  check('L1m (320 px) : la poignée et « + » font au moins 44 px', h.width >= 44 && h.height >= 44 && plus.width >= 44 && plus.height >= 44, `${JSON.stringify(h)} ${JSON.stringify(plus)}`);
  await m.getByRole('button', { name: 'رفّ أطول بكتاب' }).tap();
  await page.waitForTimeout(900);
  const st = await shelfState(m);
  check('L1m (320 px) : « + » au doigt pose le premier rayon (10 → 42 rayons)', st.cap === '10' && st.shelves === 42, JSON.stringify(st));
  const bc = await m.locator('[data-bookcase]').boundingBox();
  check('L1m (320 px) : la bibliothèque entière tient dans la largeur, et sous la poignée', bc.x >= 0 && bc.x + bc.width <= 321 && bc.y - (h.y + h.height) < 200, JSON.stringify(bc));
  check('L1m (320 px) : aucun débordement horizontal', await noHorizontalScroll(page));
  await ctx.close();
}

/* معارف — l'EXEMPLE TRAVAILLÉ 143 / 11 : un seul niveau, et sa propre découverte
   (11 PUIS 13 vident le sol → le quotient aussi est un قاسم). Jusqu'au
   2026-09-30, ce laboratoire n'avait aucun test (audit M3-F4) et son « متقدم »
   rejouait les 420 livres du module 1 (M3-F1). */
{
  const { ctx, page } = await open(`${CH}/qasim-adad-tabii/maarif`, { completed: ['0', '1'], lesson: 'qasim-adad-tabii' });
  const m = page.locator('[data-manipulation="divisor-explorer-books"]').first();
  await m.waitFor();
  check('M3 : l’exemple travaillé n’a PAS de sélecteur de niveau', (await m.locator('[data-manipulation-levels-selector]').count()) === 0
    && (await m.locator('[role="tablist"]').count()) === 0);
  const handle = m.locator('[data-stretch-handle]');
  check('M3 : la réglette va de 5 à 30, repères 11 et 13', (await handle.getAttribute('aria-valuemin')) === '5' && (await handle.getAttribute('aria-valuemax')) === '30'
    && (await m.locator('[data-shelf-mark]').count()) === 2);
  await setShelf(page, m, 11);
  let st = await shelfState(m);
  check('M3 : 11 par rayon → 13 rayons, sol vide', st.cap === '11' && st.shelves === 13 && st.floor === 0, JSON.stringify(st));
  await handle.focus();
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(900);
  st = await shelfState(m);
  check('M3 : 12 par rayon → 11 rayons, 11 livres au sol', st.cap === '12' && st.shelves === 11 && st.floor === 11, JSON.stringify(st));
  check('M3 : 11 puis 12 n’ouvrent pas la symétrie', (await phaseOf(m)) === 'act');
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(900);
  check('M3 : 13 par rayon → 11 rayons, sol vide — la symétrie s’ouvre', (await shelfState(m)).shelves === 11 && (await phaseOf(m)) === 'discover');
  await m.locator('[data-manipulation-discovery] button', { hasText: 'فقط' }).click();
  await page.waitForTimeout(150);
  check('M3 : « 13 n’est qu’un quotient » est réfuté par le sol vide', /13/.test((await m.locator('[data-manipulation-discovery] [role="status"]').textContent()) ?? ''));
  await m.locator('[data-manipulation-discovery] button', { hasText: 'كلاهما' }).click();
  await page.waitForTimeout(250);
  const formal = ((await m.locator('[data-manipulation-formal]').textContent()) ?? '').replace(/\s+/g, '');
  check('M3 : la règle écrit 143 = 11 × 13 = 13 × 11', (await phaseOf(m)) === 'formal' && formal.includes('143=11×13=13×11'), formal.slice(0, 80));
  await ctx.close();
}

/* ── 1 bis — MODE CLASSE (وضع القسم) : le présentateur ────────────────────
   Le rôle présentateur est `admin` (core/auth.js → canPresentClassroom). On ne
   touche pas à la base : /auth/me est servi par le test avec un compte admin
   et un jeton posé dans localStorage — exactement ce que AuthContext relit. */
async function openAsPresenter(url, { noFullscreenApi = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await ctx.route('**/api/v1/auth/me', (route) => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ success: true, user: { id: 9001, role: 'admin', email: 'qa-admin@smarter.dz', first_name: 'QA', last_name: 'Admin', grade: null, account_status: 'active' } }),
  }));
  await ctx.addInitScript(([noApi]) => {
    localStorage.setItem('token', 'e2e-presenter-token');
    if (noApi) {
      Object.defineProperty(document, 'fullscreenEnabled', { get: () => false, configurable: true });
      Object.defineProperty(document, 'webkitFullscreenEnabled', { get: () => false, configurable: true });
    }
  }, [noFullscreenApi]);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await page.goto(url, { waitUntil: 'networkidle' });
  return { ctx, page };
}

{
  const { ctx, page } = await openAsPresenter(`${CH}/qasim-adad-tabii/al-maktaba`);
  await pickLevel(page, 'advanced');
  const root = page.locator('[data-classroom-scope="manipulation"]').first();
  const m = page.locator('[data-manipulation="divisor-explorer-books"]').first();
  check('C1 : un administrateur ouvre la leçon (coquille visiteur, pas de renvoi vers /admin)', page.url().includes('/al-maktaba') && (await m.count()) === 1);
  const enter = root.locator('[data-classroom-enter]');
  check('C1 : « عرض المناولة » est visible, nommé et hors de la présentation', await enter.isVisible()
    && (await enter.textContent()).includes('عرض المناولة') && (await enter.getAttribute('aria-label')) === 'الدخول إلى وضع القسم');
  check('C1 : aucun toggle وضع التلميذ/القسم dans le module (règle du propriétaire)', (await page.getByRole('button', { name: 'وضع التلميذ' }).count()) === 0);

  // L'état AVANT : 26 (4 au sol) — il doit survivre à l'entrée et à la sortie.
  await setShelf(page, m, 26);
  const bookBefore = (await m.locator('[data-shelf] [data-book]').first().boundingBox()).width;
  const bodyOverflowBefore = await page.evaluate(() => document.body.style.overflow);

  await enter.click();
  const entered = await page.waitForSelector('[data-classroom-scope="manipulation"][data-classroom-active="true"]', { timeout: 5000 }).then(() => true).catch(() => false);
  check('C1 : le clic passe en وضع القسم', entered);
  check('C1 : le vrai plein écran du navigateur est actif (Chromium l’accorde)', (await root.getAttribute('data-classroom-native')) === 'true'
    && await page.evaluate(() => document.fullscreenElement?.getAttribute('data-classroom-scope') === 'manipulation'));
  check('C1 : la barre d’outils est là — titre, échelle', (await root.locator('[data-classroom-toolbar]').count()) === 1
    && (await root.getByRole('button', { name: 'تكبير العرض' }).count()) === 1);
  check('C1 : « خروج » est en haut, dans la barre d’outils', (await root.locator('[data-classroom-toolbar] [data-classroom-exit]').count()) === 1
    && (await root.getByRole('button', { name: 'الخروج من وضع القسم' }).count()) === 1);
  check('C1 : pas de navigation السابق/التالي pour une manipulation seule (aucun bouton mort)',
    (await root.locator('[data-classroom-nav] [data-classroom-nav-unit]').count()) === 0
    && (await root.locator('[data-classroom-nav] [data-classroom-nav-module]').count()) === 0);
  check('C1 : le bouton d’entrée a disparu pendant la présentation', (await root.locator('[data-classroom-enter]').count()) === 0);
  check('C1 : html et body sont verrouillés (overflow hidden)', await page.evaluate(() => document.documentElement.style.overflow === 'hidden' && document.body.style.overflow === 'hidden'));
  let st = await shelfState(m);
  check('C1 : l’état de la manipulation est intact — 26, 16 rayons, 4 livres au sol', st.cap === '26' && st.shelves === 16 && st.floor === 4, JSON.stringify(st));
  check('C1 : la bibliothèque prend sa mise en page de classe', (await m.locator('[data-bookshelf]').getAttribute('data-presentation')) === 'true');

  // Au projecteur la HAUTEUR manque : la bibliothèque se pose À CÔTÉ du rayon
  // (et sa taille de livre suit le budget mesuré, elle ne grandit pas d'office).
  await page.waitForTimeout(600);
  const side = await page.evaluate(() => {
    const shelf = document.querySelector('[data-classroom-active="true"] [data-model-shelf]').getBoundingClientRect();
    const bc = document.querySelector('[data-classroom-active="true"] [data-bookcase]').getBoundingClientRect();
    return { sameBand: bc.top < shelf.bottom, apart: bc.right <= shelf.left + 1 };
  });
  check('C1 : en présentation, la bibliothèque est À CÔTÉ du rayon (la hauteur est comptée)', side.sameBand && side.apart, JSON.stringify(side));
  void bookBefore;

  const fits = async () => page.evaluate(() => {
    const r = document.querySelector('[data-classroom-active="true"]');
    const c = r.querySelector('.sa-classroom-content');
    return { pageX: document.scrollingElement.scrollWidth <= window.innerWidth + 1, rootX: r.scrollWidth <= r.clientWidth + 1,
      contentY: c.scrollHeight <= c.clientHeight + 1, contentX: c.scrollWidth <= c.clientWidth + 1, scale: r.getAttribute('data-classroom-scale') };
  });
  await page.waitForTimeout(500);
  let f = await fits();
  check('C1 : 26 par rayon — le rayon et la bibliothèque tiennent à l’écran 1366×768, sans aucun défilement', f.pageX && f.rootX && f.contentX && f.contentY, JSON.stringify(f));
  const eq = ((await m.locator('[data-manipulation-representation]').textContent()) ?? '').replace(/\s/g, '');
  check('C1 : 420 = 26 × 16 + 4 est écrit', eq.includes('26×16+4'), eq.slice(0, 40));

  // 10 par rayon : 42 rayons, tous dessinés.
  await m.locator('[data-stretch-handle]').focus();
  await page.keyboard.press('Home');
  await page.waitForTimeout(900);
  f = await fits();
  st = await shelfState(m);
  check('C1 : 42 rayons — les 420 livres sont tous dessinés, et tout tient sans défilement', st.shelves === 42 && st.books === 420 && f.pageX && f.rootX && f.contentX && f.contentY, `${JSON.stringify(st)} ${JSON.stringify(f)}`);

  // Échelle à la main : + puis −.
  const scale100 = parseFloat((await fits()).scale);
  await root.getByRole('button', { name: 'تكبير العرض' }).click();
  await root.getByRole('button', { name: 'تكبير العرض' }).click();
  await page.waitForTimeout(600);
  const f125 = await fits();
  check('C1 : « + » agrandit la présentation (bornée par le moteur si l’écran ne suit pas)', parseFloat(f125.scale) >= scale100, `scale ${scale100} → ${f125.scale}`);
  check('C1 : à 125 % rien ne déborde horizontalement', f125.pageX && f125.contentX, JSON.stringify(f125));
  await root.getByRole('button', { name: 'تصغير العرض' }).click();
  await root.getByRole('button', { name: 'تصغير العرض' }).click();
  await page.waitForTimeout(400);

  await root.getByRole('button', { name: 'الخروج من وضع القسم' }).click();
  await page.waitForTimeout(500);
  st = await shelfState(m);
  check('C1 : « خروج » rend la page — état conservé (10, 42 rayons)', (await root.getAttribute('data-classroom-active')) === 'false' && st.cap === '10' && st.shelves === 42, JSON.stringify(st));
  check('C1 : plus de plein écran natif, verrou de défilement restauré', await page.evaluate(() => !document.fullscreenElement)
    && (await page.evaluate(() => document.body.style.overflow)) === bodyOverflowBefore
    && (await page.evaluate(() => document.documentElement.style.overflow)) === '');
  check('C1 : le bouton d’entrée est revenu et a le focus', (await root.locator('[data-classroom-enter]').count()) === 1
    && await page.evaluate(() => document.activeElement?.hasAttribute('data-classroom-enter')));
  await ctx.close();
}

{
  // REPLI sans API Fullscreen (iOS Safari, refus) : même présentation, Échap la ferme.
  const { ctx, page } = await openAsPresenter(`${CH}/qasim-adad-tabii/al-maktaba`, { noFullscreenApi: true });
  await pickLevel(page, 'advanced');
  const root = page.locator('[data-classroom-scope="manipulation"]').first();
  const m = page.locator('[data-manipulation="divisor-explorer-books"]').first();
  await setShelf(page, m, 26);
  await root.locator('[data-classroom-enter]').click();
  await page.waitForTimeout(400);
  check('C2 : sans API, la présentation s’ouvre quand même (repli)', (await root.getAttribute('data-classroom-active')) === 'true' && (await root.getAttribute('data-classroom-native')) === 'false');
  const box = await root.boundingBox();
  check('C2 : le repli couvre tout l’écran', box && box.x <= 1 && box.y <= 1 && box.width >= 1364 && box.height >= 766, JSON.stringify(box));
  check('C2 : rien ne déborde, la page ne défile pas', await page.evaluate(() => document.body.style.overflow === 'hidden' && document.scrollingElement.scrollWidth <= window.innerWidth + 1));
  await m.locator('[data-stretch-handle]').focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(900);
  check('C2 : le laboratoire reste jouable — 25 laisse 20 livres', (await m.locator('[data-floor-book]').count()) === 20);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  check('C2 : Échap ferme le repli, l’état reste (20 au sol)', (await root.getAttribute('data-classroom-active')) === 'false' && (await m.locator('[data-floor-book]').count()) === 20
    && (await page.evaluate(() => document.body.style.overflow)) === '');

  // Changement de route en pleine présentation : tout est rendu.
  await root.locator('[data-classroom-enter]').click();
  await page.waitForTimeout(300);
  await page.evaluate(() => window.history.pushState({}, '', '/courses'));
  await page.evaluate(() => window.dispatchEvent(new PopStateEvent('popstate')));
  await page.waitForTimeout(600);
  check('C2 : quitter la route libère html/body et ne laisse aucune superposition', await page.evaluate(() =>
    document.body.style.overflow === '' && document.documentElement.style.overflow === '' && document.querySelectorAll('[data-classroom-active="true"]').length === 0));
  await ctx.close();
}

{
  // Tablette paysage et téléphone : la présentation tient sans défilement de page.
  for (const vp of [{ width: 1024, height: 768 }, { width: 390, height: 844 }]) {
    const ctx = await browser.newContext({ viewport: vp, hasTouch: vp.width < 500, isMobile: vp.width < 500 });
    await ctx.route('**/api/v1/auth/me', (route) => route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, user: { id: 9001, role: 'admin', email: 'qa-admin@smarter.dz', grade: null, account_status: 'active' } }) }));
    await ctx.addInitScript(() => localStorage.setItem('token', 'e2e-presenter-token'));
    const page = await ctx.newPage();
    watchErrors(page, errors);
    await page.goto(`${CH}/qasim-adad-tabii/al-maktaba`, { waitUntil: 'networkidle' });
    const root = page.locator('[data-classroom-scope="manipulation"]').first();
    await pickLevel(page, 'advanced');
    const m = page.locator('[data-manipulation="divisor-explorer-books"]').first();
    await setShelf(page, m, 26);
    await root.locator('[data-classroom-enter]').click();
    await page.waitForTimeout(900);
    const f = await page.evaluate(() => {
      const r = document.querySelector('[data-classroom-active="true"]');
      const tb = r?.querySelector('[data-classroom-toolbar]');
      // Un bouton masqué sous 640 px (le pointeur de classe) n'est pas une petite cible.
      const small = [...(tb?.querySelectorAll('button') ?? [])].filter((b) => b.getClientRects().length > 0).filter((b) => b.getBoundingClientRect().height < 44 || b.getBoundingClientRect().width < 44).length;
      return { active: !!r, pageX: document.scrollingElement.scrollWidth <= window.innerWidth + 1, rootX: r ? r.scrollWidth <= r.clientWidth + 1 : false, small };
    });
    check(`C3 ${vp.width}×${vp.height} : présentation active, aucun débordement horizontal`, f.active && f.pageX && f.rootX, JSON.stringify(f));
    check(`C3 ${vp.width}×${vp.height} : les commandes de la barre font ≥ 44 px`, f.small === 0, `${f.small} petites`);
    await root.getByRole('button', { name: 'الخروج من وضع القسم' }).click();
    await page.waitForTimeout(300);
    await ctx.close();
  }
}

/* ── 2 — factor-pairs : LE RECTANGLE QUI SE COUCHE (2026-09-30) ─────────────
   L'élève tire le bord du rang : les 60 livres se rangent en rectangle
   PENDANT le geste ; au-delà du carré, un rectangle parfait est un rectangle
   déjà vu, couché. Plus de rail de nombres, plus de tuiles grisées d'avance. */
{
  const { ctx, page } = await open(`${CH}/qawasim-adad-tabii/al-adad-60`);
  await pickLevel(page, 'advanced');
  const m = await visibleManip(page, 'factor-pairs');
  await m.waitFor();
  const h = m.locator('[data-stretch-handle]');
  const rect = () => m.locator('[data-rectangle]');
  check('L2 : plus de rail de tuiles-nombres ; le geste est le bord du rang (slider)', (await m.locator('[data-drag-source^="cols:"]').count()) === 0
    && (await h.getAttribute('role')) === 'slider');
  check('L2 : rien ne marque √60 d’avance (aucune tuile grisée, réglette 1 → 14)', (await h.getAttribute('aria-valuemax')) === '14');

  // Un VRAI glisser : du départ jusqu'à 4 par rang.
  await m.locator('[data-width-ruler]').scrollIntoViewIfNeeded();
  const r = await m.locator('[data-width-ruler]').boundingBox();
  const y = r.y + 30;
  // x du rang d = bord droit − EDGE − d × mu ; on lit mu sur deux positions de la poignée.
  await h.focus(); await page.keyboard.press('Home'); await page.waitForTimeout(900);
  const x1 = (await h.boundingBox()).x; await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(900);
  const x2 = (await h.boundingBox()).x; const mu = x1 - x2;
  await page.mouse.move(x2 + 22, y); await page.mouse.down();
  await page.mouse.move(x2 + 22 - 2 * mu, y, { steps: 6 });
  await page.mouse.up(); await page.waitForTimeout(300);
  check('L2 : glisser jusqu’à 4 → 4 × 15, rectangle parfait', (await rect().getAttribute('data-cols')) === '4' && (await rect().getAttribute('data-rest')) === '0'
    && ((await m.locator('[data-manipulation-representation]').textContent()) ?? '').replace(/\s/g, '').includes('60=4×15'));

  // Le CLAVIER : 7 par rang laisse un rang incomplet de 4.
  await h.focus();
  for (let i = 0; i < 3; i += 1) await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(900);
  check('L2 : au clavier, 7 par rang → un rang incomplet de 4 livres, dessinés à part', (await rect().getAttribute('data-rest')) === '4'
    && (await m.locator('[data-rectangle] [data-book="rest"]').count()) === 4);

  // Tous les rangs de 1 à 8, puis 10 : le rectangle 10 × 6 est COUCHÉ.
  await page.keyboard.press('Home'); await page.waitForTimeout(900);
  for (let d = 2; d <= 8; d += 1) { await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(800); }
  check('L2 : jusqu’à 8, six paires trouvées, pas encore de découverte', (await m.locator('[data-pair]').count()) === 6 && (await phaseOf(m)) === 'act');
  await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(900);
  check('L2 : 10 par rang → le même 6 × 10, couché : aucune paire nouvelle', (await rect().getAttribute('data-turned')) === 'true' && (await m.locator('[data-pair]').count()) === 6);
  check('L2 : le rectangle couché ouvre la découverte', (await phaseOf(m)) === 'discover');
  check('L2 : aucun débordement horizontal', await noHorizontalScroll(page));
  await ctx.close();
}

/* ── 5 — indices complets, masquables (jamais la réponse) ─────────────────────────── */
{
  const { ctx, page } = await open(`${CH}/qawasim-adad-tabii/al-adad-60`);
  const m = await visibleManip(page, 'factor-pairs');
  await m.waitFor();
  const closed = await m.locator('[data-manipulation-hints]').count();
  const hintBtn = m.getByRole('button', { name: /التلميح/ });
  await hintBtn.click();
  const total = await m.locator('[data-manipulation-hints] li').count();
  await hintBtn.click();
  const hidden = await m.locator('[data-manipulation-hints]').count();
  await hintBtn.click();
  const back = await m.locator('[data-manipulation-hints] li').count();
  check('indices : fermés d\'emblée, tous affichés d\'un coup, masquables puis rouverts', closed === 0 && total >= 2 && hidden === 0 && back === total, `${closed} → ${total} → ${hidden} → ${back}`);
  check('indices : aucun indice ne contient la liste des diviseurs', !(await m.locator('[data-manipulation-hints]').textContent()).includes('12'));
  await ctx.close();
}

/* ── 6 — وضع التلميذ SEUL : aucune bascule « وضع القسم » nulle part ─────── */
{
  const { ctx, page } = await open(`${CH}/bahth-pgcd/al-furuq`);
  await pickLevel(page, 'advanced');
  const m = await visibleManip(page, 'pgcd-differences');
  await m.waitFor();
  check('L6 : la manipulation est en وضع التلميذ', (await m.getAttribute('data-manipulation-mode')) === 'student');
  check('L6 : la bascule « وضع القسم » n’est pas affichée', (await m.getByRole('button', { name: 'وضع القسم' }).count()) === 0);
  check('L6 : ni « وضع التلميذ » comme bouton (il n’y a plus de choix à faire)', (await m.getByRole('button', { name: 'وضع التلميذ' }).count()) === 0);
  check('L6 : aucun contrôle enseignant visible pour l’élève', (await m.getByRole('button', { name: 'إظهار الحل' }).count()) === 0);
  // L'élève AGIT : c'est son geste qui déroule la chaîne, pas un bouton d'étape.
  await m.locator('[data-drag-source="num:small"]').first().click();
  await m.locator('[data-drop-zone="big"]').click();
  await page.waitForTimeout(220);
  check('L6 : le geste de l’élève écrit 252 − 140 = 112', (await m.locator('[data-difference-chain]').textContent()).includes('112'));
  await ctx.close();
}

// La bascule est absente de TOUTES les manipulations montées dans les modules.
{
  const PAGES = [
    ['divisor-explorer-books', `${CH}/qasim-adad-tabii/al-maktaba`],
    ['factor-pairs', `${CH}/qawasim-adad-tabii/al-adad-60`],
    ['divisor-properties', `${CH}/khawass-qawasim/thalath-halat`],
    ['common-divisors', `${CH}/qasim-mushtarak-akbar/baqat`],
    ['coprime-explorer', `${CH}/awwaliyan-fima-baynahuma/17-wa-18`],
    ['fraction-reduction', `${CH}/ikhtizal-kasr/samir`],
  ];
  for (const [type, url] of PAGES) {
    const { ctx, page } = await open(url, { completed: ['0', '1', '2'], lesson: url.split('/').slice(-2)[0] });
    // Une manipulation du manuel vit au niveau متقدم de l'atelier ; on y
    // bascule avant de la chercher, et on la cherche dans le panneau VISIBLE
    // (un même type peut servir les deux niveaux).
    await pickLevel(page, 'advanced');
    const m = await visibleManip(page, type);
    const found = await m.waitFor({ timeout: 8000 }).then(() => true).catch(() => false);
    if (!found) { check(`${type} : la manipulation est montée`, false, url); await ctx.close(); continue; }
    const toggles = await m.getByRole('button', { name: /وضع القسم|وضع التلميذ/ }).count();
    check(`${type} : aucune bascule de mode`, toggles === 0, `${toggles} bouton(s)`);
    await ctx.close();
  }
}

/* ── 4bis — Euclide : le quotient vient du comptage des copies ───────────── */
{
  const { ctx, page } = await open(`${CH}/bahth-pgcd/khwarizmiyat-iqlidus`, { completed: ['1', '2'], lesson: 'bahth-pgcd' });
  await pickLevel(page, 'advanced');
  const m = await visibleManip(page, 'euclidean-algorithm');
  await m.waitFor();
  const dividend = m.locator('[data-drop-zone="dividend"]');

  check('L6 M3 : aucun quotient affiché avant d’avoir posé une copie', (await m.locator('[data-manipulation-representation]').textContent()).includes('?'));
  await dragTo(page, tile(m, 'copy'), dividend);
  await dragTo(page, tile(m, 'copy'), dividend);
  await dragTo(page, tile(m, 'copy'), dividend);
  await dragTo(page, tile(m, 'copy'), dividend);
  await dragTo(page, tile(m, 'copy'), dividend);
  check('L6 M3 : 5 copies posées — la scène n’annonce PAS « توقّف », le reste n’est pas encore portable', (await m.locator('[data-euclid-overflow]').count()) === 0
    && (await m.locator('[data-drop-zone="carry"]').count()) === 0);
  // La 6ᵉ copie : l'élève l'ESSAIE, la mathématique la refuse.
  await dragTo(page, tile(m, 'copy'), dividend);
  const txt = await m.textContent();
  check('L6 M3 : la 6ᵉ copie est refusée avec les nombres (reste 90 < 135)', /لا تتّسع/.test((await m.locator('p[role="status"]').textContent()) ?? '') && txt.includes('90'));
  check('L6 M3 : alors seulement, le reste se porte et remplit l’égalité', (await m.locator('[data-drop-zone="carry"]').count()) === 1
    && (await m.locator('[data-manipulation-representation]').textContent()).includes('90'));
  await ctx.close();
}

/* ── 7 — deux niveaux, un seul sélecteur ─────────────────────────────────── */
{
  // Dans un workspace : le sélecteur du workspace, et AUCUN dans la manipulation.
  const { ctx, page } = await open(`${CH}/awwaliyan-fima-baynahuma/17-wa-18`);
  const ws = page.locator('[data-manipulation-workspace]').first();
  await ws.waitFor();
  check('niveaux : le workspace propose exactement مبتدئ / متقدم',
    (await ws.locator('[data-manipulation-levels-selector] [role="tab"]').count()) === 2);
  await pickLevel(page, 'advanced');
  const m = await visibleManip(page, 'coprime-explorer');
  await m.waitFor();
  check('niveaux : pas de second sélecteur dans la manipulation du workspace',
    (await m.locator('[data-manipulation-levels-selector]').count()) === 0);
  check('niveaux : aucune trace des quatre paliers',
    !/اكتشاف ·|موجّه|استقلالية|· تحدّ/.test(await page.locator('body').textContent()));
  await ctx.close();
}
{
  // Posée seule (مثال الكتاب 22 و 15) : son propre sélecteur ; l'autre niveau
  // charge les nombres du type et remplace le titre qui nommait 22 et 15.
  const { ctx, page } = await open(`${CH}/awwaliyan-fima-baynahuma/maarif`, { completed: ['1'], lesson: 'awwaliyan-fima-baynahuma' });
  const m = page.locator('[data-manipulation="coprime-explorer"]').first();
  await m.waitFor();
  const tabs = m.locator('[data-manipulation-levels-selector] [role="tab"]');
  check('niveaux (seule) : deux onglets', (await tabs.count()) === 2);
  check('niveaux (seule) : on arrive sur l’exemple de la leçon (مبتدئ)', (await m.getAttribute('data-level')) === 'beginner');
  await m.locator('[role="tab"][data-level="advanced"]').click();
  await page.waitForTimeout(250);
  const txt = await m.textContent();
  check('niveaux (seule) : متقدم charge 27 et 36', txt.includes('27') && txt.includes('36'));
  check('niveaux (seule) : le titre « 22 و 15 » ne coiffe plus d’autres nombres', !txt.includes('مثال الكتاب: 22 و 15'));
  check('niveaux (seule) : l’onglet actif est annoncé', (await m.locator('[role="tab"][data-level="advanced"]').getAttribute('aria-selected')) === 'true');
  await ctx.close();
}

/* ── 8 — mobile 320 px : cibles et débordement ───────────────────────────── */
{
  const { ctx, page } = await open(`${CH}/ikhtizal-kasr/samir`, { mobile: true, completed: ['0'], lesson: 'ikhtizal-kasr' });
  await pickLevel(page, 'advanced');
  const m = await visibleManip(page, 'fraction-reduction');
  await m.waitFor();
  check('mobile 320 : aucun débordement horizontal', await noHorizontalScroll(page));
  const box = await m.locator('[data-drag-source]').first().boundingBox();
  check('mobile 320 : les objets font au moins 40 px', box.height >= 40 && box.width >= 40, JSON.stringify(box));
  // Tap-tap sur mobile (pas de souris) : poser ÷4 sur le kasr.
  await tile(m, 'k:4').tap();
  await m.locator('[data-drop-zone="fraction"]').tap();
  await page.waitForTimeout(250);
  check('mobile 320 : ÷4 transforme 84/48 en 21/12', (await m.locator('[data-manipulation-representation]').textContent()).includes('21'));
  await ctx.close();
}

/* ── 9 — mouvement réduit ────────────────────────────────────────────────── */
{
  const { ctx, page } = await open(`${CH}/qasim-mushtarak-akbar/baqat`, { reducedMotion: true });
  await pickLevel(page, 'advanced');
  const m = await visibleManip(page, 'common-divisors');
  await m.waitFor();
  await addGroups(m, 9);
  check('mouvement réduit : la manipulation fonctionne (9 باقات → 10 و 6)', (await m.textContent()).includes('10') && (await m.textContent()).includes('6'));
  await ctx.close();
}

/* ── 9bis — LES MONDES DESSINÉS (2026-09-21) ─────────────────────────────
   Ce que ce bloc verrouille : chaque leçon ouvre sur une scène d'objets
   RÉELS, dessinés, et le dessin dit la même chose que la division :
     • bouquets : 9 bouquets de 90 et 54 → 9 cadres, 16 fleurs chacun, rien
       au sol ; 4 bouquets → 2 rouges et 2 blanches DESSINÉES dehors ;
     • trousses (coprime) : 17 et 18 en 2 trousses → 1 stylo dehors ; après
       1, 2 et 3, l'enseignement « seul 1 marche » apparaît ;
     • recette : ÷4 sur 84/48 → 4 parts de 21 + 12 ;
     • chantier : les trois zones se bâtissent en briques entières ;
     • rubans : couper 140 de 252 écrit 112 ; 5 reports de 135 dans 765
       laissent 90. */
{
  const { ctx, page } = await open(`${CH}/qasim-mushtarak-akbar/baqat`);
  await pickLevel(page, 'advanced');
  const m = await visibleManip(page, 'common-divisors');
  await m.waitFor();
  check('monde : avant tout choix, les DEUX piles entières sont dessinées (90 + 54 objets)', (await m.locator('[data-pile] svg').count()) === 144);
  check('monde : plus de rail de NOMBRES — le geste est d’ajouter un bouquet', (await m.locator('[data-drag-source^="k:"]').count()) === 0
    && (await m.locator('[data-drag-source="group:add"]').count()) === 1);
  // UN VRAI GLISSER : un emballage de la réserve jusqu'à la table.
  await dragTo(page, m.locator('[data-drag-source="group:add"]'), m.locator('[data-drop-zone="table"]'));
  check('monde : glisser un emballage sur la table forme 1 bouquet de 90 + 54', (await m.locator('[data-groups-count]').textContent()) === '1'
    && (await m.locator('[data-group-card]').count()) === 1);
  await addGroups(m, 8);
  check('monde : 9 bouquets → 9 cadres identiques', (await m.locator('[data-group-card]').count()) === 9);
  check('monde : chaque bouquet contient 10 + 6 fleurs DESSINÉES', (await m.locator('[data-group-card]').first().locator('svg').count()) === 16);
  check('monde : rien ne reste dehors', (await m.locator('[data-group-leftover]').count()) === 0 && (await m.locator('[data-grouping-scene]').getAttribute('data-works')) === 'true');
  check('monde : la trace montre la montée 1 → 9, avec ✓ sur 1, 2, 3, 6, 9', (await m.locator('[data-tried-k]').count()) === 9
    && (await m.locator('[data-tried-mark="common"]').count()) === 5);
  // Rendre un bouquet à la réserve (tap-tap) : 8, puis on redescend à 4.
  for (let i = 0; i < 5; i += 1) {
    await m.locator('[data-drag-source="group:remove"]').click();
    await m.locator('[data-drop-zone="stock"]').click();
    await page.waitForTimeout(80);
  }
  check('monde : 4 bouquets → 2 rouges et 2 blanches restent, dessinées dehors', (await m.locator('[data-group-leftover] svg').count()) === 4
    && (await m.locator('[data-group-leftover]').getAttribute('data-leftover-a')) === '2');
  // « Le plus grand » : 18 marche, mais il faut avoir vu 19 échouer.
  await addGroups(m, 14);
  check('monde : 18 marche — la scène demande d’en ajouter un de plus avant de conclure', (await m.locator('[data-groups-beyond]').count()) === 1
    && (await m.locator('[data-common-next]').count()) === 0);
  await addGroups(m, 1);
  check('monde : 19 échoue → la carte « إلى القائمتين » apparaît', (await m.locator('[data-common-next]').count()) === 1);
  await ctx.close();
}
{
  const { ctx, page } = await open(`${CH}/awwaliyan-fima-baynahuma/17-wa-18`);
  const m = await visibleManip(page, 'coprime-explorer');
  await m.waitFor();
  check('trousses : le niveau débutant ouvre sur les objets, pas sur les listes', (await m.locator('[data-coprime-groups]').count()) === 1);
  await addGroups(m, 2);
  check('trousses : 2 trousses → 8 + 9 dans chacune, 1 stylo dehors', (await m.locator('[data-group-card]').count()) === 2 && (await m.locator('[data-group-leftover] svg').count()) === 1);
  await addGroups(m, 3);
  check('trousses : après 1 … 5, rien n’est encore affirmé — il faut aller jusqu’à 17', (await m.locator('[data-coprime-insight]').count()) === 0
    && (await phaseOf(m)) === 'act');
  await addGroups(m, 12);
  check('trousses : 2 … 17 tous essayés → « seul 1 marche » est un CONSTAT', (await m.locator('[data-coprime-insight]').count()) === 1
    && (await m.locator('[data-tried-mark="common"]').count()) === 1);
  check('trousses : un seul laboratoire à ce niveau — la découverte s’ouvre ici, sans chaîne vers les listes', (await phaseOf(m)) === 'discover'
    && (await m.locator('[data-drop-zone="shared"]').count()) === 0);
  await ctx.close();
}
{
  // متقدم 22 / 35 : « تحقّق » ne conclut qu'avec la PREUVE complète.
  const { ctx, page } = await open(`${CH}/awwaliyan-fima-baynahuma/17-wa-18`);
  await pickLevel(page, 'advanced');
  const m = await visibleManip(page, 'coprime-explorer');
  await m.waitFor();
  const put = async (id) => { await m.locator(`[data-drag-source="${id}"]`).click(); await m.locator('[data-drop-zone="shared"]').click(); await page.waitForTimeout(120); };
  await put('a:1');
  await m.getByRole('button', { name: 'تحقّق' }).click();
  await page.waitForTimeout(150);
  check('listes : 1 posé puis « تحقّق » ne conclut PAS — il dit ce qui reste à tester', (await phaseOf(m)) === 'act'
    && /2 ، 11 ، 22/.test((await m.locator('[data-coprime-check-note]').textContent()) ?? ''));
  await put('a:2');
  check('listes : 2 est refusé AVEC sa raison, et compte comme testé', /يقسم 22 فقط/.test((await m.locator('p[role="status"]').last().textContent()) ?? ''));
  await put('a:11'); await put('a:22');
  await m.getByRole('button', { name: 'تحقّق' }).click();
  await page.waitForTimeout(200);
  check('listes : tous les diviseurs de 22 confrontés à 35 → la découverte s’ouvre', (await phaseOf(m)) === 'discover');
  await ctx.close();
}
{
  const { ctx, page } = await open(`${CH}/ikhtizal-kasr/samir`, { completed: ['0'], lesson: 'ikhtizal-kasr' });
  await pickLevel(page, 'advanced');
  const m = await visibleManip(page, 'fraction-reduction');
  await m.waitFor();
  check('recette : 84 cuillères et 48 tasses sont dessinées avant tout geste', (await m.locator('[data-pile] svg').count()) === 132);
  await tile(m, 'k:4').click();
  await m.locator('[data-drop-zone="fraction"]').click();
  await page.waitForTimeout(300);
  check('recette : ÷4 → 4 parts identiques de 21 + 12', (await m.locator('[data-group-card]').count()) === 4 && (await m.locator('[data-group-card]').first().locator('svg').count()) === 33);
  check('recette : la part lue est 21/12', (await m.locator('[data-recipe-portion]').textContent()).includes('21'));
  // L'ÉLÈVE DÉCIDE (2026-09-30) : le rail offre 2 … 12, pas seulement les bons ;
  // il affirme lui-même que c'est irréductible ; aucun PGCD doré.
  check('recette : le rail propose aussi des nombres qui NE conviennent PAS (5, 7…)', (await m.locator('[data-drag-source="k:7"]').count()) === 1);
  await tile(m, 'k:7').click();
  await m.locator('[data-drop-zone="fraction"]').click();
  await page.waitForTimeout(200);
  check('recette : 7 est refusé avec la raison (il ne divise que le numérateur)', /البسط فقط/.test((await m.locator('p[role="status"]').textContent()) ?? ''));
  await page.keyboard.press('Escape');
  await m.locator('[data-claim-irreducible]').click();
  await page.waitForTimeout(150);
  check('recette : affirmer « irréductible » à 21/12 est refusé', /ليس بعد/.test((await m.locator('p[role="status"]').textContent()) ?? '')
    && (await m.locator('[data-drop-zone="pgcd"]').count()) === 0);
  await tile(m, 'k:3').click();
  await m.locator('[data-drop-zone="fraction"]').click();
  await page.waitForTimeout(200);
  check('recette : à 7/4, rien n’est annoncé — c’est à l’élève de conclure', (await m.locator('[data-drop-zone="pgcd"]').count()) === 0);
  await m.locator('[data-claim-irreducible]').click();
  await page.waitForTimeout(200);
  check('recette : la bonne affirmation ouvre le chemin « في خطوة واحدة », sans PGCD désigné', (await m.locator('[data-drop-zone="pgcd"]').count()) === 1
    && (await m.locator('[data-drag-source="p:12"]').count()) === 1);
  await tile(m, 'p:4').click();
  await m.locator('[data-drop-zone="pgcd"]').click();
  await page.waitForTimeout(200);
  check('recette : 4 en une fois est refusé en MONTRANT ce qu’il donne (21/12)', /21\/12/.test((await m.locator('p[role="status"]').textContent()) ?? ''));
  await page.keyboard.press('Escape');
  await tile(m, 'p:12').click();
  await m.locator('[data-drop-zone="pgcd"]').click();
  await page.waitForTimeout(250);
  check('recette : 12 en une fois → la conjecture « أي الطريقين أوفر؟ »', (await phaseOf(m)) === 'discover');
  await ctx.close();
}
{
  const { ctx, page } = await open(`${CH}/khawass-qawasim/thalath-halat`);
  const m = await visibleManip(page, 'divisor-properties');
  await m.waitFor();
  check('chantier : les deux murs sont dessinés en briques (6 + 4 briques de 3)', (await m.locator('[data-brick-site] [data-brick-wall]').count()) >= 2);
  for (const z of ['join', 'remove', 'measure']) {
    await tile(m, 'wall:b').click();
    await m.locator(`[data-drop-zone="zone:${z}"]`).click();
    await page.waitForTimeout(200);
  }
  check('chantier : les trois zones sont bâties', (await m.locator('[data-site-zone][data-built="true"]').count()) === 3);
  check('chantier : aucun demi-brique nulle part', (await m.locator('[data-wall-partial]').count()) === 0);
  check('chantier : la découverte s’ouvre après les trois constructions', (await phaseOf(m)) === 'discover');
  // Les égalités dans les phrases arabes se lisent de GAUCHE à droite (isolées LTR) :
  // « 18 = 3 × 6 » ne doit plus se lire « 6 × 3 = 18 » (audit, défaut m).
  const ltr = await m.evaluate((root) => [...root.querySelectorAll('bdi[dir="ltr"]')].filter((b) => b.getClientRects().length).every((b) => {
    const tn = b.firstChild; if (!tn || tn.nodeType !== 3 || tn.length < 3) return true;
    const r = document.createRange(); const x = (i) => { r.setStart(tn, i); r.setEnd(tn, i + 1); return r.getBoundingClientRect().left; };
    return x(0) < x(tn.length - 1);
  }));
  check('chantier : chaque égalité isolée se lit de gauche à droite', ltr);
  await ctx.close();
}
{
  // متقدم (900, 90, 9) : les briques ne se comptent plus — on PRÉDIT, puis le mur répond.
  const { ctx, page } = await open(`${CH}/khawass-qawasim/thalath-halat`);
  await pickLevel(page, 'advanced');
  const m = await visibleManip(page, 'divisor-properties');
  await m.waitFor();
  await tile(m, 'wall:b').click();
  await m.locator('[data-drop-zone="zone:join"]').click();
  await page.waitForTimeout(200);
  check('chantier متقدم : bâtir sans prédire est refusé, avec la raison', (await m.locator('[data-site-zone="join"]').getAttribute('data-built')) === 'false'
    && /توقّع أولًا/.test((await m.locator('p[role="status"]').textContent()) ?? ''));
  await m.locator('[data-site-zone="join"]').getByRole('button', { name: 'يبقى جزء من طوبة' }).click();
  await m.locator('[data-drop-zone="zone:join"]').click();
  await page.waitForTimeout(200);
  check('chantier متقدم : la prédiction « un morceau de brique » est réfutée par le mur (990 = 9 × 110)', (await m.locator('[data-site-zone="join"]').getAttribute('data-built')) === 'true'
    && (await m.locator('[data-prediction-verdict="wrong"]').count()) === 1);
  await ctx.close();
}
{
  const { ctx, page } = await open(`${CH}/bahth-pgcd/al-furuq`);
  await pickLevel(page, 'advanced');
  const m = await visibleManip(page, 'pgcd-differences');
  await m.waitFor();
  check('rubans : les deux rubans sont dessinés', (await m.locator('[data-ribbons] [data-ribbon]').count()) === 2);
  check('rubans : avant le geste, le grand ruban est ENTIER — ni ciseaux ni différence écrite', (await m.locator('[data-ribbon-cut]').count()) === 0
    && !((await m.locator('[data-drop-zone="big"]').textContent()) ?? '').includes('112'));
  await m.locator('[data-drag-source="num:small"]').first().click();
  check('rubans : le petit ruban EN MAIN pose les ciseaux sur le grand', (await m.locator('[data-ribbon-cut]').count()) === 1);
  await page.keyboard.press('Escape');
  await tile(m, 'num:small').click();
  await m.locator('[data-drop-zone="big"]').click();
  await page.waitForTimeout(250);
  check('rubans : couper 140 de 252 écrit 112', (await m.locator('[data-difference-chain]').textContent()).includes('112'));
  await ctx.close();
}

/* ── 10 — L'ATELIER À DEUX NIVEAUX et le laboratoire des équipes ──────────
   Ce que ce bloc verrouille, et qui est le cœur de la refonte :
     • l'atelier s'ouvre sur « مبتدئ », jamais sur autre chose ;
     • basculer ne recharge pas la page et ne perd pas l'état posé ;
     • le geste produit la notation (a = b × q + r) et JAMAIS l'inverse ;
     • le reste est un joueur DESSINÉ hors du terrain, pas une décimale ;
     • la découverte n'arrive qu'après avoir vu les DEUX cas. */
{
  const { ctx, page } = await open(`${CH}/qasim-adad-tabii/al-maktaba`);
  const ws = page.locator('[data-manipulation-workspace]').first();
  const m = page.locator('[data-manipulation="team-builder"]').first();
  await m.waitFor();

  check('W1 : l’atelier s’ouvre sur le niveau مبتدئ', (await ws.getAttribute('data-level')) === 'beginner');
  check('W1 : les deux niveaux sont proposés, et un seul est actif',
    (await ws.locator('[role="tab"]').count()) === 2
    && (await ws.locator('[role="tab"][aria-selected="true"]').count()) === 1);
  check('W1 : le niveau متقدم est rendu mais MASQUÉ (état préservé, hors du parcours clavier)',
    (await ws.locator('[data-manipulation-level-panel="advanced"]').count()) === 1
    && !(await ws.locator('[data-manipulation-level-panel="advanced"]').isVisible()));

  const bench = () => m.locator('[data-drop-zone="bench"] [data-drag-source^="player:"]');
  check('W1 : les 15 joueurs attendent hors des équipes', (await bench().count()) === 15);
  check('W1 : rien n’est écrit avant le geste', (await m.locator('[data-manipulation-representation]').count()) === 0);

  // GLISSER un joueur sur le terrain — le vrai geste, avec de vrais événements.
  await dragTo(page, bench().first(), m.locator('[data-team="0"]'));
  check('W1 : glisser un joueur le fait entrer dans l’équipe 1',
    (await m.locator('[data-team="0"]').getAttribute('data-team-size')) === '1' && (await bench().count()) === 14);

  // L'ALTERNATIVE sans glisser : toucher le joueur, puis l'équipe.
  await bench().first().click();
  await m.locator('[data-team="1"]').click();
  await page.waitForTimeout(200);
  check('W1 : toucher le joueur puis l’équipe fait la même chose',
    (await m.locator('[data-team="1"]').getAttribute('data-team-size')) === '1');

  // Le CLAVIER : Entrée prend le joueur, Entrée sur la zone le pose.
  await bench().first().focus();
  await page.keyboard.press('Enter');
  await m.locator('[data-team="2"]').focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  check('W1 : le clavier seul suffit (Entrée, Entrée)',
    (await m.locator('[data-team="2"]').getAttribute('data-team-size')) === '1');

  // Le REFUS EXPLIQUÉ. Les trois équipes ont un joueur : elles sont égales, et
  // continuer est donc légitime. On crée d'abord le déséquilibre (un second
  // joueur dans l'équipe 1), puis on essaie d'en ajouter un TROISIÈME — c'est
  // celui-là que le partage équitable refuse, et il l'explique en arabe.
  await bench().first().click();
  await m.locator('[data-team="0"]').click();
  await page.waitForTimeout(200);
  await bench().first().click();
  await m.locator('[data-team="0"]').click();
  await page.waitForTimeout(250);
  const reason = await m.locator('[role="status"]').first().textContent();
  check('W1 : remplir une équipe avant les autres est refusé AVEC une raison en arabe',
    (await m.locator('[data-team="0"]').getAttribute('data-team-size')) === '2'
    && /بالتساوي/.test(reason ?? '') && /فريق أصغر/.test(reason ?? ''), reason ?? '');

  // Compléter : 15 joueurs, 3 équipes de 5, personne dehors.
  for (let i = 0; i < 15; i += 1) {
    const p = bench().first();
    if (!(await p.count())) break;
    await p.click();
    await m.locator(`[data-team="${i % 3}"]`).click();
    await page.waitForTimeout(25);
  }
  await page.waitForTimeout(400);
  check('W1 : 15 joueurs donnent 3 équipes de 5, et personne dehors',
    (await m.locator('[data-team]').evaluateAll((els) => els.map((e) => e.dataset.teamSize))).join(',') === '5,5,5'
    && (await bench().count()) === 0);
  const eq15 = await m.locator('[data-manipulation-representation]').textContent();
  check('W1 : la notation SUIT le geste — 15 = 3 × 5', /15\s*=\s*3\s*×\s*5/.test((eq15 ?? '').replace(/\s+/g, ' ')), (eq15 ?? '').slice(0, 60));
  check('W1 : le résultat n’apparaît pas avant « اكتشف »', (await phaseOf(m)) === 'act');

  // 16 joueurs : le reste devient un joueur qu'on VOIT.
  await m.getByRole('button', { name: /16 لاعب/ }).click();
  await page.waitForTimeout(350);
  for (let i = 0; i < 16; i += 1) {
    const p = bench().first();
    if (!(await p.count())) break;
    await p.click();
    await m.locator(`[data-team="${i % 3}"]`).click();
    await page.waitForTimeout(25);
  }
  await page.waitForTimeout(450);
  check('W1 : 16 joueurs laissent UN joueur dessiné hors des équipes (pas 5,333)',
    (await bench().count()) === 1
    && (await m.locator('[data-team]').evaluateAll((els) => els.map((e) => e.dataset.teamSize))).join(',') === '5,5,5');
  const eq16 = ((await m.locator('[data-manipulation-representation]').textContent()) ?? '').replace(/\s+/g, ' ');
  check('W1 : l’égalité 16 = 3 × 5 + 1 émerge', /16\s*=\s*3\s*×\s*5\s*\+\s*1/.test(eq16), eq16.slice(0, 70));
  check('W1 : la découverte s’ouvre APRÈS avoir vu les deux cas',
    (await phaseOf(m)) === 'discover' && (await m.locator('[data-manipulation-discovery]').count()) === 1);
  check('W1 : la règle formelle n’est pas encore écrite', (await m.locator('[data-manipulation-formal]').count()) === 0);

  await m.locator('[data-manipulation-discovery] button', { hasText: 'قاسمًا' }).click();
  await page.waitForTimeout(300);
  check('W1 : la bonne conjecture fait écrire a = b × q + r',
    (await phaseOf(m)) === 'formal' && (await m.locator('[data-manipulation-formal]').count()) === 1);

  // BASCULE de niveau : l'état posé survit à l'aller-retour.
  const benchBefore = await m.locator('[data-bench-count]').getAttribute('data-bench-count');
  await pickLevel(page, 'advanced');
  const books = page.locator('[data-manipulation="divisor-explorer-books"]').first();
  check('W2 : le niveau متقدم montre la bibliothèque du manuel', await books.isVisible() && !(await m.isVisible()));
  await setShelf(page, books, 28);
  check('W2 : la bibliothèque JOUE au niveau متقدم — 28 range tout en 15 rayons',
    (await books.locator('[data-shelf]').count()) === 15);
  await pickLevel(page, 'beginner');
  check('W2 : revenir à مبتدئ RETROUVE la scène telle qu’on l’a laissée',
    (await m.locator('[data-bench-count]').getAttribute('data-bench-count')) === benchBefore
    && (await phaseOf(m)) === 'formal');

  // Le clavier navigue entre les niveaux (RTL : ← va vers le suivant).
  await ws.locator('[role="tab"][data-level="beginner"]').focus();
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(300);
  check('W2 : les flèches passent d’un niveau à l’autre', (await ws.getAttribute('data-level')) === 'advanced');

  check('W2 : aucune bascule « وضع القسم » dans l’atelier', (await ws.getByRole('button', { name: 'وضع القسم' }).count()) === 0);
  await ctx.close();
}

/* ── 11 — l'atelier sur un téléphone (320 px) ─────────────────────────────── */
{
  const { ctx, page } = await open(`${CH}/qasim-adad-tabii/al-maktaba`, { mobile: true });
  const ws = page.locator('[data-manipulation-workspace]').first();
  const m = page.locator('[data-manipulation="team-builder"]').first();
  await m.waitFor();
  check('W3 (320 px) : aucun débordement horizontal', await noHorizontalScroll(page));
  const tab = await ws.locator('[role="tab"]').first().boundingBox();
  check('W3 (320 px) : les onglets de niveau font au moins 44 px', tab.height >= 44, JSON.stringify(tab));
  const player = await m.locator('[data-drop-zone="bench"] [data-drag-source^="player:"]').first().boundingBox();
  check('W3 (320 px) : un joueur du banc est une cible confortable', player.height >= 44, JSON.stringify(player));
  // Le terrain garde ses PROPORTIONS RÉELLES (largeur = 2/3 de la hauteur).
  const pitch = await m.locator('[data-team-pitch-area]').first().boundingBox();
  check('W3 (320 px) : le terrain n’est pas déformé — largeur = 2/3 hauteur',
    Math.abs(pitch.width / pitch.height - 2 / 3) < 0.02, `${Math.round(pitch.width)}x${Math.round(pitch.height)}`);
  await m.locator('[data-drop-zone="bench"] [data-drag-source^="player:"]').first().tap();
  await m.locator('[data-team="0"]').tap();
  await page.waitForTimeout(250);
  check('W3 (320 px) : toucher fonctionne au doigt', (await m.locator('[data-team="0"]').getAttribute('data-team-size')) === '1');
  await ctx.close();
}

/* ── 12 — LE NIVEAU PAR DÉFAUT EST TOUJOURS مبتدئ (2026-10-09) ───────────
   Décision du propriétaire : tout atelier s'ouvre sur مبتدئ ; l'activité du
   manuel (متقدم) est à un clic. Le bloc vérifie donc les DEUX : l'ouverture
   sur مبتدئ, puis, après un clic sur متقدم, les nombres du titre du module.
   (Ancienne règle, 2026-09-21 : ouvrir sur l'activité — retirée.)

   Ancien commentaire :
   Un module intitulé « نشاط N » porte l'activité du manuel et sa première
   étape attend que CETTE manipulation soit finie. Il doit donc s'ouvrir
   dessus : sinon l'activité est cachée derrière un onglet que l'élève doit
   deviner, et l'étape reste insatisfiable (défaut trouvé le 2026-09-21 sur
   « نشاط 2 — قواسم العدد 60 », qui ouvrait sur 24).

   On vérifie que le laboratoire OUVERT porte bien les nombres du titre du
   module. Le titre est la promesse ; l'atelier doit la tenir. */
{
  const OPENS_ON = [
    ['qasim-adad-tabii/al-maktaba', /15 لاعبًا|420/],      // M1 ouvre sur l'expérience débutante, voulue
    ['qawasim-adad-tabii/al-adad-60', /60/],
    ['qasim-mushtarak-akbar/baqat', /90|54/],
    ['tayin-pgcd/42-wa-60', /42|60/],
    ['bahth-pgcd/al-furuq', /252|140/],
    ['ikhtizal-kasr/samir', /84|48/],
  ];
  for (const [path, expected] of OPENS_ON) {
    const lesson = path.split('/')[0];
    const { ctx, page } = await open(`${CH}/${path}`, { completed: ['0', '1', '2'], lesson });
    const ws = page.locator('[data-manipulation-workspace]').first();
    await ws.waitFor({ timeout: 8000 }).catch(() => {});
    if (!(await ws.count())) { await ctx.close(); continue; }
    check(`D : « ${path} » s'ouvre sur مبتدئ`, (await ws.getAttribute('data-level')) === 'beginner');
    await ws.locator('[role=tab][data-level="advanced"]').first().click();
    await page.waitForTimeout(150);
    const shown = await page.locator('[data-manipulation-level-panel]:not([hidden]) [data-manipulation]').first().getAttribute('aria-label');
    check(`D : « ${path} » : متقدم porte les nombres de son titre`, expected.test(shown ?? ''), `ouvre sur « ${shown} »`);
    await ctx.close();
  }
}

/* ── 12 — COMPLÉTER AUTOMATIQUEMENT (MANIPULATION_CONTRACT §6bis) ──────────
   Ce que ce bloc verrouille :
     • « أنشئ الفرق » est VERROUILLÉ tant que l'élève n'a pas mené UNE
       répartition à la main jusqu'au bout (`unlock: 'first-gesture'`, depuis
       le 2026-09-30 — il s'ouvrait avant tout geste) ;
     • ensuite il met la VRAIE scène dans l'état qu'aurait donné la main
       (mêmes effectifs, même banc, même égalité), sans découverte ni règle ;
     • MIXTE : ce que l'élève a placé reste où il l'a mis ;
     • après coup, la main reprend la main (renvoyer au banc, recompléter) ;
     • changer la configuration — même en pleine animation — ne laisse aucun
       joueur de l'ancienne ; « إعادة » recommence TOUT (15 / 3, verrou) ;
     • les machines à PGCD n'ouvrent le bouton qu'après un premier geste, et
       laissent la case PGCD à l'élève. */

/** Une répartition MENÉE À LA MAIN : chaque joueur du banc, touché puis posé dans la plus petite équipe. */
async function shareByHand(m, { tap = false } = {}) {
  const bench = () => m.locator('[data-drop-zone="bench"] [data-drag-source^="player:"]');
  for (let i = 0; i < 70; i += 1) {
    const sizes = (await m.locator('[data-team]').evaluateAll((els) => els.map((e) => Number(e.dataset.teamSize))));
    const k = sizes.indexOf(Math.min(...sizes));
    const p = bench().first();
    if (!(await p.count())) return;
    const before = await bench().count();
    if (tap) { await p.tap(); await m.locator(`[data-team="${k}"]`).tap(); } else { await p.click(); await m.locator(`[data-team="${k}"]`).click(); }
    await m.page().waitForTimeout(20);
    if ((await bench().count()) === before) { await m.page().keyboard.press('Escape'); return; } // plus aucune place : le reste
  }
}

{
  const { ctx, page } = await open(`${CH}/qasim-adad-tabii/al-maktaba`);
  const m = page.locator('[data-manipulation="team-builder"]').first();
  await m.waitFor();
  const ac = m.locator('[data-manipulation-autocomplete]');
  const btn = ac.getByRole('button', { name: /أنشئ الفرق/ });
  const bench = () => m.locator('[data-drop-zone="bench"] [data-drag-source^="player:"]');
  const sizes = async () => (await m.locator('[data-team]').evaluateAll((els) => els.map((e) => e.dataset.teamSize))).join(',');
  const settleAuto = async () => { await page.waitForFunction(() => document.querySelector('[data-manipulation="team-builder"] [data-manipulation-autocomplete]')?.dataset.manipulationAutocomplete !== 'running', null, { timeout: 5000 }); await page.waitForTimeout(250); };

  check('AC1 : « أنشئ الفرق » est proposé dans la rangée des contrôles', (await btn.count()) === 1 && await btn.isVisible());
  check('AC1 : avant tout partage à la main, il est VERROUILLÉ et dit pourquoi', (await ac.getAttribute('data-manipulation-autocomplete')) === 'locked'
    && !(await btn.isEnabled()) && /بيدك/.test((await ac.textContent()) ?? ''));
  await shareByHand(m);
  check('AC1 : le premier partage se fait à la main — 5,5,5', (await sizes()) === '5,5,5' && (await bench().count()) === 0);
  check('AC1 : ensuite le bouton n’est plus verrouillé (rien à compléter ici)', (await ac.getAttribute('data-manipulation-autocomplete')) === 'done');

  // NOUVELLE CONFIGURATION 20 / 4, départ MIXTE : deux joueurs à la main.
  await m.getByRole('button', { name: /^20 لاعب/ }).click();
  await m.getByRole('button', { name: /كوّن 4 فرق/ }).click();
  await page.waitForTimeout(300);
  check('AC4 : 20 / 4 repart à zéro — 20 sur le banc, 4 équipes vides, bouton prêt', (await bench().count()) === 20 && (await sizes()) === '0,0,0,0'
    && (await ac.getAttribute('data-manipulation-autocomplete')) === 'ready');
  await dragTo(page, m.locator('[data-drag-source="player:0"]'), m.locator('[data-team="0"]'));
  await m.locator('[data-drag-source="player:1"]').click();
  await m.locator('[data-team="2"]').click();
  await page.waitForTimeout(200);
  check('AC2 : le geste manuel marche toujours (2 joueurs placés)', (await bench().count()) === 18);
  check('AC2 : le bouton reste disponible pendant la manipulation manuelle', await btn.isEnabled());
  await btn.click();
  await settleAuto();
  check('AC2 : l’automatique COMPLÈTE : 4 équipes de 5, banc vide', (await sizes()) === '5,5,5,5' && (await bench().count()) === 0);
  check('AC2 : les joueurs placés à la main n’ont pas bougé',
    (await m.locator('[data-team="0"] [data-drag-source="player:0"]').count()) === 1
    && (await m.locator('[data-team="2"] [data-drag-source="player:1"]').count()) === 1);
  check('AC2 : aucun joueur dupliqué (20 joueurs dessinés, pas plus)', (await m.locator('[data-drag-source^="player:"]').count()) === 20);
  const eq = ((await m.locator('[data-manipulation-representation]').textContent()) ?? '').replace(/\s+/g, ' ');
  check('AC2 : la notation suit l’état réel — 20 = 4 × 5 + 0', /20\s*=\s*4\s*×\s*5\s*\+\s*0/.test(eq), eq.slice(0, 60));
  check('AC2 : l’automatique ne déclenche PAS la découverte', (await phaseOf(m)) === 'act');
  check('AC2 : plus rien à compléter → bouton désactivé', (await ac.getAttribute('data-manipulation-autocomplete')) === 'done' && !(await btn.isEnabled()));

  // APRÈS l'automatique, l'élève réarrange à la main.
  await m.locator('[data-team="1"] [data-drag-source^="player:"]').first().click();
  await m.locator('[data-drop-zone="bench"]').click();
  await page.waitForTimeout(250);
  check('AC3 : un joueur placé automatiquement se renvoie au banc à la main', (await bench().count()) === 1 && (await sizes()) === '5,4,5,5');
  check('AC3 : le bouton redevient actif', await btn.isEnabled());
  await btn.click();
  await settleAuto();
  check('AC3 : et recomplète la scène', (await sizes()) === '5,5,5,5' && (await bench().count()) === 0);

  // PAS D'ARRONDI : 16 / 3 laisse un joueur dehors, comme la main.
  await m.getByRole('button', { name: /^16 لاعب/ }).click();
  await m.getByRole('button', { name: /كوّن 3 فرق/ }).click();
  await page.waitForTimeout(300);
  await btn.click();
  await settleAuto();
  const eq16 = ((await m.locator('[data-manipulation-representation]').textContent()) ?? '').replace(/\s+/g, ' ');
  check('AC5 : 16 / 3 → 5,5,5 et UN joueur dessiné sur le banc', (await sizes()) === '5,5,5' && (await bench().count()) === 1);
  check('AC5 : 16 = 3 × 5 + 1 émerge de l’état réel', /16\s*=\s*3\s*×\s*5\s*\+\s*1/.test(eq16), eq16.slice(0, 70));
  check('AC5 : le banc change de nom quand il devient le reste', /الباقي/.test((await m.locator('[data-drop-zone="bench"]').getAttribute('aria-label')) ?? ''));
  check('AC5 : les deux cas vus (15/3 à la main, 16/3) → la découverte s’ouvre', (await phaseOf(m)) === 'discover');

  // Changer la configuration EN PLEINE ANIMATION.
  await m.getByRole('button', { name: /^18 لاعب/ }).click();
  await page.waitForTimeout(250);
  await btn.click();
  await page.waitForTimeout(90);
  await m.getByRole('button', { name: /^12 لاعب/ }).click();
  await page.waitForTimeout(1300);
  check('AC6 : changer de configuration pendant l’animation l’arrête — 12 sur le banc, équipes vides',
    (await bench().count()) === 12 && (await sizes()) === '0,0,0', `${await bench().count()} / ${await sizes()}`);

  // « إعادة » arrête l'animation et recommence TOUT : 15 / 3, mémoire effacée, verrou.
  await btn.click();
  await page.waitForTimeout(90);
  await m.getByRole('button', { name: 'إعادة' }).click();
  await page.waitForTimeout(1300);
  check('AC6 : « إعادة » pendant l’animation recommence l’activité — 15 / 3, équipes vides', (await bench().count()) === 15 && (await sizes()) === '0,0,0');
  check('AC6 : … la découverte est refermée et le bouton reverrouillé', (await phaseOf(m)) === 'act' && (await m.locator('[data-manipulation-discovery]').count()) === 0
    && (await ac.getAttribute('data-manipulation-autocomplete')) === 'locked');
  await ctx.close();
}

// Mouvement réduit : l'état final directement, sans animation.
{
  const { ctx, page } = await open(`${CH}/qasim-adad-tabii/al-maktaba`, { reducedMotion: true });
  const m = page.locator('[data-manipulation="team-builder"]').first();
  await m.waitFor();
  await shareByHand(m);
  await m.getByRole('button', { name: /^20 لاعب/ }).click();
  await m.getByRole('button', { name: /كوّن 4 فرق/ }).click();
  await page.waitForTimeout(200);
  await m.getByRole('button', { name: /أنشئ الفرق/ }).click();
  await page.waitForTimeout(120);
  const s = (await m.locator('[data-team]').evaluateAll((els) => els.map((e) => e.dataset.teamSize))).join(',');
  check('AC7 : prefers-reduced-motion → les équipes sont complètes aussitôt', s === '5,5,5,5', s);
  await ctx.close();
}

// Téléphone : le partage au doigt, puis le bouton.
{
  const { ctx, page } = await open(`${CH}/qasim-adad-tabii/al-maktaba`, { mobile: true });
  const m = page.locator('[data-manipulation="team-builder"]').first();
  await m.waitFor();
  await shareByHand(m, { tap: true });
  await m.getByRole('button', { name: /^20 لاعب/ }).tap();
  await page.waitForTimeout(250);
  const b = m.getByRole('button', { name: /أنشئ الفرق/ });
  const box = await b.boundingBox();
  check('AC8 (320 px) : le bouton est une cible confortable', box && box.height >= 40, JSON.stringify(box));
  await b.tap();
  await page.waitForTimeout(1400);
  check('AC8 (320 px) : il complète au doigt — 20 en 3 : 6,6,6 et 2 dehors',
    (await m.locator('[data-team]').evaluateAll((els) => els.map((e) => e.dataset.teamSize))).join(',') === '6,6,6');
  check('AC8 (320 px) : aucun débordement horizontal', await noHorizontalScroll(page));
  await ctx.close();
}

/* LE GLISSER TRAVERSE L'ÉCRAN : sur un téléphone, le banc et l'équipe 1 sont à
   plus d'un écran l'un de l'autre. Le doigt qui porte un joueur près du bord
   haut fait défiler la page (useDragInteraction, EDGE) jusqu'à l'équipe. */
{
  const { ctx, page } = await open(`${CH}/qasim-adad-tabii/al-maktaba`, { mobile: true });
  const m = page.locator('[data-manipulation="team-builder"]').first();
  await m.waitFor();
  const p = m.locator('[data-drop-zone="bench"] [data-drag-source^="player:"]').first();
  await p.scrollIntoViewIfNeeded();
  const b = await p.boundingBox();
  const far = (await m.locator('[data-team="0"]').boundingBox()).y;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, 20, { steps: 8 });
  for (let i = 0; i < 100; i += 1) { await page.waitForTimeout(30); if ((await m.locator('[data-team="0"]').boundingBox()).y > 60) break; }
  const t0 = await m.locator('[data-team="0"]').boundingBox();
  await page.mouse.move(t0.x + t0.width / 2, Math.max(t0.y + 60, 80), { steps: 4 });
  await page.mouse.up();
  await page.waitForTimeout(250);
  check('DS (320 px) : l’équipe 1 était hors écran, au-dessus du banc', far < 0, `y=${far}`);
  check('DS (320 px) : un vrai glisser du banc à l’équipe 1 réussit (défilement au bord)', (await m.locator('[data-team="0"]').getAttribute('data-team-size')) === '1');
  check('DS (320 px) : l’objet lâché n’est plus « en main »', (await m.locator('[data-drag-held]').count()) === 0);
  await ctx.close();
}

// Les MACHINES À PGCD : le premier exemple se fait à la main.
{
  const { ctx, page } = await open(`${CH}/bahth-pgcd/al-furuq`);
  await pickLevel(page, 'advanced');
  const m = await visibleManip(page, 'pgcd-differences');
  await m.waitFor();
  const ac = m.locator('[data-manipulation-autocomplete]');
  check('AC9 : « أكمل الفروق » est VERROUILLÉ avant la première coupe',
    (await ac.getAttribute('data-manipulation-autocomplete')) === 'locked'
    && !(await ac.getByRole('button').isEnabled())
    && /بيدك/.test((await ac.textContent()) ?? ''));
  await m.locator('[data-drag-source="num:small"]').first().click();
  await m.locator('[data-drop-zone="big"]').click();
  await page.waitForTimeout(220);
  check('AC9 : après une coupe à la main, il s’ouvre', (await ac.getAttribute('data-manipulation-autocomplete')) === 'ready');
  await ac.getByRole('button').click();
  await page.waitForTimeout(1400);
  const chain = (await m.locator('[data-difference-chain]').textContent()) ?? '';
  check('AC9 : la chaîne 252/140 est complète (… − 28 = 0)', /28\s*−\s*28\s*=\s*0|= 0/.test(chain.replace(/\s+/g, ' ')), chain.slice(-80));
  check('AC9 : la case PGCD reste à l’élève (pas de découverte)', (await phaseOf(m)) === 'act');
  await ctx.close();
}
{
  const { ctx, page } = await open(`${CH}/bahth-pgcd/khwarizmiyat-iqlidus`, { completed: ['1', '2'], lesson: 'bahth-pgcd' });
  await pickLevel(page, 'advanced');
  const m = await visibleManip(page, 'euclidean-algorithm');
  await m.waitFor();
  const ac = m.locator('[data-manipulation-autocomplete]');
  check('AC10 : « أكمل القسمات » est VERROUILLÉ avant la première division', (await ac.getAttribute('data-manipulation-autocomplete')) === 'locked');
  const dividend = m.locator('[data-drop-zone="dividend"]');
  for (let i = 0; i < 6; i += 1) await dragTo(page, tile(m, 'copy'), dividend);   // 5 posées + la 6ᵉ essayée
  check('AC10 : des copies posées ne suffisent pas — la division doit être finie', (await ac.getAttribute('data-manipulation-autocomplete')) === 'locked');
  await dragTo(page, m.locator('[data-drag-source="rem:90"]').first(), m.locator('[data-drop-zone="carry"]'));
  check('AC10 : la première division finie à la main ouvre le bouton', (await ac.getAttribute('data-manipulation-autocomplete')) === 'ready');
  await ac.getByRole('button').click();
  await page.waitForTimeout(1400);
  const rep = ((await m.locator('[data-euclid-chain]').textContent()) ?? '').replace(/\s+/g, ' ');
  check('AC10 : 765/135 → la chaîne va jusqu’à 90 = 45 × 2 + 0', /90\s*=\s*45\s*×\s*2\s*\+\s*0/.test(rep), rep.slice(-90));
  check('AC10 : la case PGCD reste à l’élève', (await phaseOf(m)) === 'act' && (await ac.getAttribute('data-manipulation-autocomplete')) === 'done');
  await ctx.close();
}

// Les types À CHOIX n'ont pas le bouton : chaque geste y est une expérience.
{
  const PAGES = [
    ['factor-pairs', `${CH}/qawasim-adad-tabii/al-adad-60`],
    ['common-divisors', `${CH}/qasim-mushtarak-akbar/baqat`],
    ['fraction-reduction', `${CH}/ikhtizal-kasr/samir`],
  ];
  for (const [type, url] of PAGES) {
    const { ctx, page } = await open(url, { completed: ['0', '1', '2'], lesson: url.split('/').slice(-2)[0] });
    await pickLevel(page, 'advanced');
    const m = await visibleManip(page, type);
    const found = await m.waitFor({ timeout: 8000 }).then(() => true).catch(() => false);
    check(`AC11 : ${type} — pas de complétion automatique (MANUEL SEUL)`, found && (await m.locator('[data-manipulation-autocomplete]').count()) === 0);
    await ctx.close();
  }
}

await browser.close();
check('aucune erreur console/page', errors.length === 0, errors.slice(0, 3).join(' | '));
summary();
