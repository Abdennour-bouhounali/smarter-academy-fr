// Le MODE CLASSE (وضع القسم) sur toute la hiérarchie d'apprentissage.
//
// Ce que cette suite verrouille, sur le vrai serveur de développement :
//   1. PERMISSIONS : un visiteur ne voit AUCUN bouton de présentation (leçon,
//      module, exercice, manipulation) ; un présentateur les voit tous.
//   2. LEÇON : 🎓 depuis le sommaire → mdkhal → module 0 → module 1 (unités)
//      → … ; le plein écran natif SURVIT à la navigation entre modules ;
//      jamais de défilement de page ; pas de bouton mort.
//   3. UNE SEULE SESSION : la manipulation et l'exercice, dans un module
//      présenté, sont passe-plat (aucun second plein écran, aucun bouton).
//   4. DEPUIS UN محور : 🎓 وضع القسم (flottant) ouvre une séance de LEÇON.
//   5. EXERCICE : ⛶ عرض التمرين ; la réponse et la correction survivent.
//   6. ÉTAT : entrer/sortir ne remonte rien (livres, réponses, unité).
//   7. NETTOYAGE : quitter la leçon rend html/body et ne laisse rien.
//   8. TAILLES : 1366×768, 1024×768, 390×844.
//   9. PRATIQUE (compte QA réel, si l'API répond) : l'exercice du moteur
//      d'exercices se présente, réponse et rendu mathématique intacts.
//
// Le présentateur est simulé par /auth/me (rôle admin) + un jeton local :
// aucune écriture en base. Run :
//   KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/classroom.mjs
import { BASE, launch, check, summary, watchErrors } from './helpers.mjs';

const CH = `${BASE}/courses/moyen/4am/ansab_al_aadad_wal_hisab`;
const LESSON = `${CH}/qasim-adad-tabii`;
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const errors = [];
const { browser } = await launch();

const ADMIN = { id: 9001, role: 'admin', email: 'qa-admin@smarter.dz', first_name: 'QA', last_name: 'Admin', grade: null, account_status: 'active' };

// `completed` : les modules déjà terminés sur le compte présentateur (clé de
// progression LOCALE du compte 9001). Le verrou séquentiel de la page NORMALE
// s'applique au présentateur comme à tout compte : pour voir le module 3 en
// page, il faut avoir terminé 0, 1 et 2. En PRÉSENTATION le verrou est ignoré.
async function openAs(url, { presenter = true, viewport = { width: 1366, height: 768 }, mobile = false, noFullscreenApi = false, completed = ['0'] } = {}) {
  const ctx = await browser.newContext({ viewport, hasTouch: mobile, isMobile: mobile });
  if (presenter) {
    await ctx.route('**/api/v1/auth/me', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, user: ADMIN }) }));
    await ctx.addInitScript(([noApi, done, uid]) => {
      localStorage.setItem('token', 'e2e-presenter-token');
      const key = `u_${uid}_smarter_lesson_qasim-adad-tabii`;
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ completedModules: done, completedExercises: [] }));
      if (noApi) {
        Object.defineProperty(document, 'fullscreenEnabled', { get: () => false, configurable: true });
        Object.defineProperty(document, 'webkitFullscreenEnabled', { get: () => false, configurable: true });
      }
    }, [noFullscreenApi, completed, ADMIN.id]);
  }
  const page = await ctx.newPage();
  watchErrors(page, errors);
  // `load` + la coquille de présentation dans le DOM : `networkidle` n'arrive
  // pas toujours (polices, requêtes longues) et ferait échouer un test pour
  // une raison qui n'est pas la fonctionnalité.
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForSelector('[data-classroom-scope]', { timeout: 20000 });
  await page.waitForTimeout(400);
  return { ctx, page };
}

const active = (page) => page.locator('[data-classroom-active="true"]').first();
const fits = (page) => page.evaluate(() => {
  const r = document.querySelector('[data-classroom-active="true"]');
  if (!r) return { active: false };
  const c = r.querySelector('.sa-classroom-content');
  return {
    active: true,
    native: r.getAttribute('data-classroom-native'),
    scope: r.getAttribute('data-classroom-scope'),
    pageX: document.scrollingElement.scrollWidth <= window.innerWidth + 1,
    rootX: r.scrollWidth <= r.clientWidth + 1,
    contentY: c.scrollHeight <= c.clientHeight + 1,
    contentX: c.scrollWidth <= c.clientWidth + 1,
    locked: document.documentElement.style.overflow === 'hidden' && document.body.style.overflow === 'hidden',
    title: r.querySelector('[data-classroom-title]')?.textContent ?? '',
    badge: r.querySelector('[data-classroom-toolbar] span')?.textContent ?? '',
    position: r.querySelector('[data-classroom-position]')?.textContent ?? '',
    prev: !!r.querySelector('[data-classroom-nav] [data-classroom-nav-unit="previous"]'),
    next: !!r.querySelector('[data-classroom-nav] [data-classroom-nav-unit="next"]'),
    prevModule: r.querySelector('[data-classroom-nav] [data-classroom-nav-module="previous"]')?.textContent?.trim() ?? null,
    nextModule: r.querySelector('[data-classroom-nav] [data-classroom-nav-module="next"]')?.textContent?.trim() ?? null,
    enters: r.querySelectorAll('[data-classroom-enter]').length,
    nested: r.querySelectorAll('[data-classroom-nested]').length,
    fullscreenEl: document.fullscreenElement?.getAttribute('data-classroom-scope') ?? null,
    current: r.querySelector('[data-classroom-current]')?.getAttribute('data-classroom-current') ?? null,
    units: r.querySelector('[data-classroom-units]')?.getAttribute('data-classroom-units') ?? null,
  };
});
const next = (page) => active(page).locator('[data-classroom-nav] [data-classroom-nav-unit="next"]').click();
const prev = (page) => active(page).locator('[data-classroom-nav] [data-classroom-nav-unit="previous"]').click();
const nextModule = (page) => active(page).locator('[data-classroom-nav] [data-classroom-nav-module="next"]').click();
const prevModule = (page) => active(page).locator('[data-classroom-nav] [data-classroom-nav-module="previous"]').click();
const exit = (page) => active(page).getByRole('button', { name: 'الخروج من وضع القسم' }).click();
const settle = (page, ms = 500) => page.waitForTimeout(ms);
// Le moteur d'ajustement décide sur une mise en page stable : on attend que
// le contenu tienne (ou 2,5 s), plutôt qu'une durée arbitraire.
async function settled(page) {
  let f = await fits(page);
  for (let i = 0; i < 25 && f.active && !(f.contentY && f.contentX); i += 1) { await page.waitForTimeout(100); f = await fits(page); }
  return f;
}

/* ── 1 — PERMISSIONS ──────────────────────────────────────────────────────── */
{
  const { ctx, page } = await openAs(LESSON, { presenter: false });
  check('P : visiteur — aucun bouton de présentation sur le sommaire', (await page.locator('[data-classroom-enter]').count()) === 0);
  await page.goto(`${LESSON}/al-maktaba`, { waitUntil: 'networkidle' });
  check('P : visiteur — aucun bouton sur un module (ni module, ni manipulation)', (await page.locator('[data-classroom-enter]').count()) === 0);
  await ctx.close();
}
{
  const { ctx, page } = await openAs(LESSON);
  check('P : présentateur — 🎓 وضع القسم sur le sommaire', (await page.locator('[data-classroom-enter="lesson"]').count()) === 1
    && (await page.locator('[data-classroom-enter="lesson"]').textContent()).includes('وضع القسم'));
  await page.goto(`${LESSON}/al-maktaba`, { waitUntil: 'networkidle' });
  check('P : présentateur — 🎓 وضع القسم et ⛶ عرض المناولة sur le module 1', (await page.locator('[data-classroom-enter="lesson"]').count()) === 1
    && (await page.locator('[data-classroom-enter="manipulation"]').count()) === 1);
  // Le bouton d'un محور est FLOTTANT (colonne de « كرّاسي » / « بطاقتي ») et
  // ouvre une séance de LEÇON : il dit donc « وضع القسم », comme celui du
  // sommaire — un seul mode, un seul nom, où qu'on l'ouvre. Ce test garde
  // aussi la RÈGLE DE VOCABULAIRE : jamais le mot « الوحدة » pour un محور
  // (LESSON_DEVELOPMENT_GUIDE §2).
  {
    const moduleBtn = page.locator('[data-classroom-enter="lesson"]');
    const text = (await moduleBtn.textContent()).trim();
    check('P : le bouton d’un محور dit « وضع القسم » et jamais « الوحدة »',
      (await moduleBtn.count()) === 1 && text === 'وضع القسم' && !text.includes('الوحدة'), text);
    check('P : ce bouton vit dans la rangée de repères du محور, à côté de « المختبر » — pas dans la colonne flottante',
      await moduleBtn.evaluate((el) => getComputedStyle(el).position !== 'fixed'
        && !!el.parentElement.querySelector('[data-ml-overlay-trigger]')));
  }
  await ctx.close();
}
{
  const { ctx, page } = await openAs(`${LESSON}/awazzif`, { completed: ['0', '1', '2'] });
  // Les étapes 2 et 3 sont verrouillées tant que l'exercice 1 n'est pas fait : un seul exercice est rendu.
  check('P : présentateur — ⛶ عرض التمرين sur l’exercice rendu du module 3 (l’admin lit en navigation libre : les 3 étapes sont ouvertes)', (await page.locator('[data-classroom-enter="exercise"]').count()) === 3);
  await ctx.close();
}

/* ── 2 — LEÇON : du sommaire au dernier module, une seule session ─────────── */
{
  const { ctx, page } = await openAs(LESSON);
  const bodyOverflowBefore = await page.evaluate(() => document.body.style.overflow);
  await page.locator('[data-classroom-enter="lesson"]').click();
  await page.waitForSelector('[data-classroom-active="true"]', { timeout: 5000 });
  await settle(page);
  let f = await fits(page);
  check('L : 🎓 ouvre la présentation de la LEÇON en plein écran natif', f.active && f.native === 'true' && f.scope === 'lesson' && f.fullscreenEl === 'lesson', JSON.stringify(f));
  check('L : barre — badge « وضع القسم », titre de la leçon, repère « مدخل الدرس »', f.badge.includes('وضع القسم') && f.title.includes('قاسم') && f.position.includes('مدخل'), `${f.badge} | ${f.title} | ${f.position}`);
  check('L : mdkhal — mission et مسار الدرس visibles, chrome de page absent de la présentation', (await active(page).locator('[data-lesson-roadmap]').count()) === 1
    && (await active(page).locator('nav[aria-label]').count()) === 0 && (await active(page).locator('footer').count()) === 0);
  check('L : mdkhal — « التالي » seulement (pas de السابق mort)', f.next && !f.prev);
  check('L : mdkhal — saut « المحور التالي » nommé (المحور 0), aucun saut en arrière', f.nextModule?.includes('المحور') && f.prevModule === null, `${f.prevModule} | ${f.nextModule}`);
  check('L : mdkhal — aucun défilement, verrou posé', f.pageX && f.contentY && f.contentX && f.locked, JSON.stringify(f));

  // → module 0 (le diagnostic : une QUESTION à la fois, voir §5 « Test »)
  await next(page);
  await page.waitForURL(/\/astaidd$/, { timeout: 5000 });
  await settle(page, 900);
  f = await fits(page);
  const testQuestions = await active(page).locator('[data-test-question]').count();
  check('L : التالي → module 0, TOUJOURS en plein écran natif (la session survit à la route)', page.url().endsWith('/astaidd') && f.active && f.native === 'true' && f.fullscreenEl === 'lesson', JSON.stringify(f));
  check('L : module 0 — titre « أستعدّ », repère « المحور 1 من 5 », السابق et التالي', f.title.includes('أستعدّ') && f.position.includes('1') && f.position.includes('5') && f.prev && f.next, `${f.title} | ${f.position}`);
  check('L : module 0 — une QUESTION à la fois, les autres rendues mais cachées', testQuestions > 1
    && (await active(page).locator('[data-test-question]:not([hidden])').count()) === 1, `questions=${testQuestions}`);
  check('L : module 0 — chaque question est cadrée et agrandie', (await active(page).locator('[data-classroom-frame]').count()) >= 1);
  check('L : module 0 — les DEUX échelles sont offertes : pas d’unité ET saut de محور, chacun nommé', f.prev && f.next
    && f.prevModule !== null && f.nextModule?.includes('المحور'), `${f.prevModule} | ${f.nextModule}`);
  check('L : module 0 — aucun défilement de page', f.pageX && f.contentX, JSON.stringify(f));

  // → module 1 : « التالي » traverse d'abord les questions du test, puis
  // franchit le bord du module — exactement comme les unités d'un ContentModule.
  for (let i = 0; i < testQuestions; i += 1) {
    await next(page);
    await settle(page, 350);
  }
  await page.waitForURL(/\/al-maktaba$/, { timeout: 5000 });
  await settle(page, 900);
  f = await fits(page);
  check('L : التالي → module 1, unité 1 = المدخل (titre + ce qu’on y apprend)', page.url().endsWith('/al-maktaba') && f.active && f.native === 'true'
    && f.current === '0' && Number(f.units) >= 4 && f.position.startsWith('1 /'), JSON.stringify(f));
  check('L : module 1 — la page d’entrée (titre du محور + points « ماذا سنتعلّم ») est seule visible', await page.evaluate(() => {
    const units = [...document.querySelectorAll('[data-classroom-unit]')];
    const visible = units.filter((u) => !u.hidden);
    return visible.length === 1 && visible[0].classList.contains('sa-classroom-module__unit--overview')
      && !!visible[0].querySelector('[data-classroom-overview] h2') && visible[0].querySelectorAll('[data-classroom-overview-point]').length >= 1;
  }));
  check('L : module 1 — السابق existe (retour au module 0) et التالي', f.prev && f.next);

  await next(page);
  await settle(page, 600);
  check('L : unité 2 = المهمة (MissionBrief)', await page.evaluate(() => {
    const visible = [...document.querySelectorAll('[data-classroom-unit]')].filter((u) => !u.hidden);
    return visible.length === 1 && visible[0].classList.contains('sa-classroom-module__unit--brief');
  }));

  await next(page);
  await settle(page, 900);
  f = await fits(page);
  // La bibliothèque vit au niveau متقدم de l'atelier : on y bascule, dans la
  // présentation elle-même (le module présenté garde ses onglets).
  const advTab = active(page).locator('[data-manipulation-workspace] [role="tab"][data-level="advanced"]').first();
  if (await advTab.count()) { await advTab.click(); await page.waitForTimeout(350); }
  const m = active(page).locator('[data-manipulation="divisor-explorer-books"]').first();
  check('L : unité 3 = la manipulation, passe-plat (coquille imbriquée, AUCUN second plein écran, aucun bouton d’entrée)', f.current === '2'
    && (await m.locator('[data-bookshelf]').getAttribute('data-presentation')) === 'true' && f.nested >= 1 && f.enters === 0 && f.fullscreenEl === 'lesson', JSON.stringify(f));
  await m.locator('[data-stretch-handle]').focus();
  await page.keyboard.press('Home');
  for (let i = 10; i < 26; i += 1) await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(900);
  f = await settled(page);
  check('L : la bibliothèque JOUE dans la leçon présentée — 26 → 16 rayons + 4 au sol, 420 = 26 × 16 + 4', (await m.locator('[data-shelf]').count()) === 16
    && (await m.locator('[data-floor-book]').count()) === 4 && ((await m.locator('[data-manipulation-representation]').textContent()) ?? '').replace(/\s/g, '').includes('26×16+4'));
  check('L : manipulation présentée — aucun défilement de page', f.pageX && f.contentX && f.contentY, JSON.stringify(f));

  await next(page);
  await settle(page, 700);
  f = await fits(page);
  const step1 = active(page).locator('[data-classroom-unit]:not([hidden]) #step-1');
  check('L : unité 4 = l’étape 1 (StepCard cadrée, agrandie)', f.current === '3' && (await step1.count()) === 1 && (await active(page).locator('[data-classroom-unit]:not([hidden]) [data-classroom-frame]').count()) === 1);
  check('L : étape 1 — aucun défilement de page', f.pageX && f.contentX, JSON.stringify(f));
  // Répondre à la question de l'étape 1 (la 2e option est la bonne) — l'état doit survivre à la sortie.
  await step1.locator('button', { hasText: /28 كتابًا في كل رفّ/ }).first().click();
  await settle(page, 500);
  const feedbackInside = await step1.locator('[class*="border-emerald"], [class*="bg-emerald"]').count();
  check('L : répondre dans la présentation fonctionne (correction affichée)', feedbackInside > 0, `${feedbackInside}`);

  await next(page);
  await settle(page, 700);
  f = await fits(page);
  check('L : unité 5 = l’étape 2, débloquée par la réponse (le verrou pédagogique reste)', f.current === '4' && (await active(page).locator('[data-classroom-unit]:not([hidden]) #step-2').count()) === 1
    && (await active(page).locator('[data-classroom-unit]:not([hidden])').getByText('أتمِم الخطوة السابقة').count()) === 0);

  // → module 2 : VERROUILLÉ pour ce compte (module 1 non terminé) — présenté quand même.
  await next(page); await settle(page, 200);
  f = await fits(page);
  let guard = 0;
  while (f.next && !page.url().endsWith('/maarif') && guard < 6) { await next(page); await settle(page, 300); f = await fits(page); guard += 1; }
  await page.waitForURL(/\/maarif$/, { timeout: 5000 }).catch(() => {});
  await settle(page, 800);
  f = await fits(page);
  check('L : التالي au bout du module 1 → module 2, verrouillé pour ce compte mais PRÉSENTÉ (le verrou séquentiel ne s’applique pas à la présentation)', page.url().endsWith('/maarif')
    && f.active && f.native === 'true' && (await page.getByText('المحور مقفل').count()) === 0 && f.current === '0', JSON.stringify(f));
  await prev(page);
  await page.waitForURL(/\/al-maktaba$/, { timeout: 5000 });
  await settle(page, 700);
  f = await fits(page);
  // Changer de route remonte la page (comme en navigation normale) : c'est la
  // POSITION qui est préservée par la session, pas l'état d'une page quittée.
  check('L : السابق depuis le module 2 → module 1 par sa DERNIÈRE unité', page.url().endsWith('/al-maktaba') && Number(f.current) === Number(f.units) - 1, JSON.stringify(f));
  // السابق jusqu'à la mission, puis السابق → module 0 (pas de reset)
  guard = 0;
  while (f.current !== '0' && guard < 8) { await prev(page); await settle(page, 300); f = await fits(page); guard += 1; }
  check('L : السابق ramène à l’unité 1', f.current === '0');
  await prev(page);
  await page.waitForURL(/\/astaidd$/, { timeout: 5000 });
  await settle(page, 700);
  f = await fits(page);
  check('L : السابق depuis la 1re unité → module 0, session intacte', f.active && f.native === 'true' && f.title.includes('أستعدّ'));

  // Sortie explicite : tout est rendu, la page normale revient.
  await exit(page);
  await settle(page, 600);
  check('L : « خروج » — plus de plein écran, verrou rendu, page normale du module 0 (fil d’Ariane, pied de page)', await page.evaluate(() => !document.fullscreenElement)
    && (await page.evaluate(() => document.body.style.overflow)) === bodyOverflowBefore
    && (await page.locator('[data-classroom-active="true"]').count()) === 0
    && (await page.locator('footer').count()) >= 1);
  await ctx.close();
}

/* ── 2 bis — SAUTS DE MODULE : « المحور السابق » / « المحور التالي » ──────
   Le pas d'unité et le saut de محور coexistent : sauter ne traverse PAS les
   unités du module quitté, et entre par le bon bout du module visé. */
{
  const { ctx, page } = await openAs(LESSON);
  await page.locator('[data-classroom-enter="lesson"]').click();
  await page.waitForSelector('[data-classroom-active="true"]', { timeout: 5000 });
  await settle(page, 600);
  // Sommaire → module 0 par le SAUT (pas par le pas d'unité).
  await nextModule(page);
  await page.waitForURL(/\/astaidd$/, { timeout: 5000 });
  await settle(page, 800);
  let f = await fits(page);
  check('S : « المحور التالي » depuis le mdkhal ouvre le module 0, session et plein écran intacts', page.url().endsWith('/astaidd')
    && f.active && f.native === 'true' && f.fullscreenEl === 'lesson', JSON.stringify(f));

  // Module 0 → module 1 par le saut, puis avancer d'une unité pour prouver
  // que l'on est bien ENTRÉ au début du module visé.
  await nextModule(page);
  await page.waitForURL(/\/al-maktaba$/, { timeout: 5000 });
  await settle(page, 900);
  f = await fits(page);
  check('S : « المحور التالي » saute au module 1 et y entre par sa PREMIÈRE unité', page.url().endsWith('/al-maktaba')
    && f.current === '0' && Number(f.units) >= 4, JSON.stringify(f));

  // Depuis la première unité, le saut en arrière ne recule pas d'une unité :
  // il quitte le module pour le précédent, par sa dernière unité.
  await nextModule(page);
  await page.waitForURL(/\/maarif$/, { timeout: 5000 });
  await settle(page, 900);
  await prevModule(page);
  await page.waitForURL(/\/al-maktaba$/, { timeout: 5000 });
  await settle(page, 900);
  f = await fits(page);
  check('S : « المحور السابق » revient au module 1 par sa DERNIÈRE unité', page.url().endsWith('/al-maktaba')
    && Number(f.current) === Number(f.units) - 1, JSON.stringify(f));

  // Au dernier module : plus de saut en avant, et pas de bouton mort.
  for (let i = 0; i < 6 && !page.url().endsWith('/itqan'); i += 1) {
    if (!(await fits(page)).nextModule) break;
    await nextModule(page);
    await settle(page, 700);
  }
  f = await fits(page);
  check('S : au dernier محور, aucun saut en avant (jamais de bouton mort)', page.url().endsWith('/itqan') && f.nextModule === null && f.prevModule !== null, `${page.url()} | ${f.nextModule}`);
  check('S : les sauts ne dérèglent rien — toujours en plein écran, sans défilement', f.active && f.native === 'true' && f.pageX && f.contentX, JSON.stringify(f));
  await exit(page);
  await settle(page, 500);
  await ctx.close();
}

{
  // En portée MODULE (pas de session leçon), aucun saut de محور n'est offert.
  const { ctx, page } = await openAs(`${LESSON}/al-maktaba`);
  await page.locator('[data-classroom-enter="lesson"]').click();
  await page.waitForSelector('[data-classroom-active="true"]', { timeout: 5000 });
  await settle(page, 700);
  const f = await fits(page);
  check('S : depuis un محور la séance est de portée LEÇON — les deux sauts de محور sont offerts', f.scope === 'lesson' && f.prevModule !== null && f.nextModule !== null && f.next, JSON.stringify(f));
  await exit(page);
  await settle(page, 300);
  await ctx.close();
}

/* ── 3 — DEPUIS UN محور : 🎓 وضع القسم (bouton flottant) ──────────────────
   Le bouton flottant d'un محور ouvre une séance de LEÇON, pas une séance
   bornée à ce seul محور : c'est le même mode que depuis le sommaire, donc
   « التالي » sait aller au محور suivant au lieu de mourir au bout de
   celui-ci. Seul le point d'entrée diffère. */
{
  const { ctx, page } = await openAs(`${LESSON}/awazzif`, { completed: ['0', '1', '2'] });
  // LA COLONNE FLOTTANTE, du bas vers le haut : « ⛶ عرض » se pose JUSTE
  // SOUS la carte des connaissances, qui est elle-même sous le cahier. Les
  // trois partagent le bord physique gauche et ne se recouvrent jamais.
  {
    await page.waitForSelector('[data-classroom-enter="lesson"]', { timeout: 10000 });
    await page.waitForSelector('[data-km-trigger]', { timeout: 10000 });
    await page.waitForSelector('.sa-nb-lesson-trigger', { timeout: 10000 });
    const col = await page.evaluate(() => {
      const box = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x), top: Math.round(b.top), bottom: Math.round(b.bottom), gapBottom: Math.round(window.innerHeight - b.bottom) }; };
      return { enter: box('[data-classroom-enter="lesson"]'), kmap: box('[data-km-trigger]'), nb: box('.sa-nb-lesson-trigger'), ctrlk: box('#command-palette-trigger') };
    });
    check('M : « وضع القسم » est dans la rangée du haut, hors colonne ; « بطاقتي » est SOUS « كرّاسي », même bord, aucun recouvrement',
      col.enter && col.kmap && col.nb
      && col.enter.bottom <= col.nb.top
      && col.kmap.top >= col.nb.bottom && Math.abs(col.kmap.x - col.nb.x) < 3,
      JSON.stringify(col));
    check('M : « بطاقتي » est au ras du coin — écart au bas = écart à gauche',
      col.kmap && Math.abs(col.kmap.x - col.kmap.gapBottom) <= 2, JSON.stringify(col.kmap));
    // Le coin ne peut l'être que parce que la pastille « Ctrl+K » a été
    // retirée : sous RTL elle tombait exactement là (`end-6`).
    check('M : plus de pastille « Ctrl+K » pour disputer le coin', col.ctrlk === null);
  }

  await page.locator('[data-classroom-enter="lesson"]').click();
  await page.waitForSelector('[data-classroom-active="true"]', { timeout: 5000 });
  await settle(page, 800);
  let f = await fits(page);
  check('M : 🎓 وضع القسم depuis un محور → séance de LEÇON (portée lesson), pas une séance bornée au محور', f.active && f.scope === 'lesson', JSON.stringify(f));

  // « خروج » vit EN HAUT, dans la barre d'outils, avec les commandes de la
  // séance — plus dans la barre de navigation, qui ne porte que les pas du
  // contenu. On vérifie qu'il est bien au-dessus d'eux.
  {
    const exitBtn = page.locator('[data-classroom-toolbar] [data-classroom-exit]');
    const exitBox = await exitBtn.first().boundingBox();
    const nextBox = await page.locator('[data-classroom-nav] [data-classroom-nav-unit="next"]').first().boundingBox();
    check('M : « خروج » est DANS la barre d’outils du haut', (await exitBtn.count()) === 1
      && (await page.locator('[data-classroom-nav] [data-classroom-exit]').count()) === 0);
    check('M : « خروج » est AU-DESSUS des pas du contenu',
      exitBox && nextBox && exitBox.y + exitBox.height <= nextBox.y,
      `next=${JSON.stringify(nextBox)} exit=${JSON.stringify(exitBox)}`);
    // Le chrome flottant de la page n'a pas sa place sur un projecteur.
    check('M : « كرّاسي » et « بطاقتي » disparaissent pendant la séance',
      !(await page.locator('.sa-nb-lesson-trigger').first().isVisible().catch(() => false))
      && !(await page.locator('[data-km-trigger]').first().isVisible().catch(() => false)));
  }
  check('M : unités du محور ouvert = المدخل + المهمة + 3 exercices + الخلاصة (navigation libre), on entre à la première', f.units === '6' && f.current === '0' && f.next, JSON.stringify(f));
  // LA raison du changement : en portée leçon, la séance connaît ses voisins.
  check('M : le saut « المحور » est offert — ce qu’une séance de portée module ne donnait pas',
    f.nextModule !== null || f.prevModule !== null, `${f.prevModule} | ${f.nextModule}`);
  check('M : les boutons ⛶ عرض التمرين des exercices sont ABSENTS pendant la présentation (une seule session)', f.enters === 0);
  await next(page); await settle(page, 600);
  f = await fits(page);
  check('M : unité 2 = exercice 1 du manuel, cadré une seule fois (pas de double agrandissement)', f.current === '1'
    && (await active(page).locator('[data-classroom-unit]:not([hidden]) [data-textbook-exercise]').count()) === 1
    && (await active(page).locator('[data-classroom-unit]:not([hidden]) [data-classroom-frame]').count()) === 1);
  check('M : exercice présenté — aucun défilement de page', f.pageX && f.contentX, JSON.stringify(f));
  await next(page); await settle(page, 400); await next(page); await settle(page, 400);
  f = await fits(page);
  check('M : dernière unité du محور — التالي ne meurt plus, il mène au محور suivant', f.current === '3' && f.prev);
  await exit(page); await settle(page, 500);
  check('M : sortie → page normale du محور', (await page.locator('[data-classroom-active="true"]').count()) === 0 && (await page.locator('[data-classroom-enter="lesson"]').count()) === 1);
  await ctx.close();
}

/* ── 4 — EXERCICE : ⛶ عرض التمرين, la réponse survit ─────────────────────── */
{
  const { ctx, page } = await openAs(`${LESSON}/awazzif`, { completed: ['0', '1', '2'] });
  const ex = page.locator('[data-textbook-exercise]').first();
  // Répondre AVANT d'entrer : l'exercice 1 est un QCM (TapQuestion).
  const options = ex.locator('button[aria-pressed]');
  const optionCount = await options.count();
  await options.nth(0).click();
  await settle(page, 400);
  const answeredBefore = await ex.locator('[class*="border-emerald"], [class*="border-rose"], [class*="bg-emerald"], [class*="bg-rose"]').count();
  await ex.locator('[data-classroom-enter="exercise"]').click();
  await page.waitForSelector('[data-classroom-active="true"]', { timeout: 5000 });
  await settle(page, 800);
  let f = await fits(page);
  check('E : ⛶ عرض التمرين → présentation de l’EXERCICE seul, badge « التمرين », titre « تمرين 1 »', f.active && f.scope === 'exercise' && f.badge.includes('التمرين') && f.title.includes('تمرين'), JSON.stringify(f));
  check('E : pas de navigation (un exercice seul n’en a pas)', !f.prev && !f.next);
  const answeredDuring = await active(page).locator('[data-textbook-exercise] [class*="border-emerald"], [data-textbook-exercise] [class*="border-rose"], [data-textbook-exercise] [class*="bg-emerald"], [data-textbook-exercise] [class*="bg-rose"]').count();
  check('E : la réponse et sa correction SURVIVENT à l’entrée', optionCount > 1 && answeredBefore > 0 && answeredDuring >= answeredBefore, `${answeredBefore} → ${answeredDuring}`);
  check('E : le rendu mathématique (KaTeX) est là, en LTR', await page.evaluate(() => { const k = document.querySelector('[data-classroom-active="true"] .katex'); return !!k && getComputedStyle(k.closest('.sa-math-inline, .sa-math-block') ?? k).direction === 'ltr'; }));
  check('E : exercice cadré et agrandi (zoom > 1), aucun défilement de page', Number(await active(page).locator('[data-classroom-frame]').first().getAttribute('data-classroom-frame')) > 1 && f.pageX && f.contentX, JSON.stringify(f));
  await exit(page); await settle(page, 500);
  const answeredAfter = await ex.locator('[class*="border-emerald"], [class*="border-rose"], [class*="bg-emerald"], [class*="bg-rose"]').count();
  check('E : sortie → la réponse est toujours là', (await page.locator('[data-classroom-active="true"]').count()) === 0 && answeredAfter >= answeredBefore, `${answeredBefore} → ${answeredAfter}`);
  await ctx.close();
}

/* ── 5 — REPLI + ÉCHAP + changement de route hors leçon (session leçon) ───── */
{
  const { ctx, page } = await openAs(LESSON, { noFullscreenApi: true });
  await page.locator('[data-classroom-enter="lesson"]').click();
  await settle(page, 500);
  let f = await fits(page);
  check('R : sans API Fullscreen, la leçon se présente en repli (couvre l’écran)', f.active && f.native === 'false' && f.locked && f.pageX);
  await next(page);
  await page.waitForURL(/\/astaidd$/, { timeout: 5000 });
  await settle(page, 600);
  f = await fits(page);
  check('R : en repli, التالي change de module et la session reste', f.active && page.url().endsWith('/astaidd'));
  await page.keyboard.press('Escape');
  await settle(page, 400);
  check('R : Échap ferme le repli', (await page.locator('[data-classroom-active="true"]').count()) === 0 && (await page.evaluate(() => document.body.style.overflow)) === '');
  await page.locator('[data-classroom-enter="lesson"]').click();
  await settle(page, 400);
  await page.evaluate(() => { window.history.pushState({}, '', '/courses'); window.dispatchEvent(new PopStateEvent('popstate')); });
  await settle(page, 700);
  check('R : quitter la leçon (route hors de sa portée) libère html/body et ne laisse aucune superposition', await page.evaluate(() =>
    document.body.style.overflow === '' && document.documentElement.style.overflow === '' && document.querySelectorAll('[data-classroom-active="true"]').length === 0));
  await ctx.close();
}

/* ── 6 — TAILLES : 1024×768 et 390×844, unité de module ───────────────────── */
for (const vp of [{ width: 1024, height: 768 }, { width: 390, height: 844 }]) {
  const { ctx, page } = await openAs(`${LESSON}/al-maktaba`, { viewport: vp, mobile: vp.width < 500 });
  await page.locator('[data-classroom-enter="lesson"]').click();
  await page.waitForSelector('[data-classroom-active="true"]', { timeout: 5000 });
  await settle(page, 900);
  let f = await fits(page);
  const small = await page.evaluate(() => [...document.querySelectorAll('[data-classroom-active="true"] [data-classroom-toolbar] button, [data-classroom-active="true"] [data-classroom-nav] button')]
    .filter((b) => b.getClientRects().length > 0)
    .filter((b) => b.getBoundingClientRect().height < 44 || b.getBoundingClientRect().width < 44).length);
  check(`V ${vp.width}×${vp.height} : module présenté — aucun débordement horizontal, commandes ≥ 44 px`, f.active && f.pageX && f.rootX && f.contentX && small === 0, `${JSON.stringify(f)} small=${small}`);
  await next(page); await settle(page, 900);
  const advTab2 = active(page).locator('[data-manipulation-workspace] [role="tab"][data-level="advanced"]').first();
  if (await advTab2.count()) { await advTab2.click(); await page.waitForTimeout(350); }
  await active(page).locator('[data-manipulation="divisor-explorer-books"] [data-stretch-handle]').first().focus();
  await page.keyboard.press('Home');
  for (let i = 10; i < 26; i += 1) await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(900);
  f = await settled(page);
  check(`V ${vp.width}×${vp.height} : la manipulation dans le module (26 choisi) — aucun débordement horizontal`, f.pageX && f.rootX && f.contentX, JSON.stringify(f));
  await exit(page); await settle(page, 300);
  await ctx.close();
}

/* ── 7 — PRATIQUE (moteur d'exercices) : compte QA réel, si l'API répond ──── */
{
  const EMAIL = process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz';
  const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
  const PRACTICE_LESSON = 'qasim-mushtarak-akbar';
  let token = null;
  try {
    const login = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email: EMAIL, password: PASSWORD }) }).then((r) => r.json());
    token = login.token ?? login.data?.token ?? null;
  } catch { token = null; }
  const presenterStudent = token ? await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }).then((r) => r.json()).then((d) => d.user).catch(() => null) : null;
  if (!token || !presenterStudent) {
    console.log('SKIP practice : API ou compte QA indisponible (' + (token ? 'me' : 'login') + ')');
  } else {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(([tk]) => localStorage.setItem('token', tk), [token]);
    const page = await ctx.newPage();
    watchErrors(page, errors);
    const sessionId = crypto.randomUUID();
    const start = await fetch(`${API}/lessons/${PRACTICE_LESSON}/practice/sessions`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ sessionId, level: 1 }) });
    if (start.status >= 300) {
      console.log(`SKIP practice : séance refusée (${start.status})`);
    } else {
      await page.goto(`${BASE}/espace/pratique/${PRACTICE_LESSON}/session/${sessionId}`, { waitUntil: 'networkidle' });
      await page.waitForSelector('[data-classroom-scope="exercise"]', { timeout: 20000 });
      const canPresent = (await page.locator('[data-classroom-enter="exercise"]').count()) === 1;
      check(`X : le compte QA (${presenterStudent.role}) voit ⛶ عرض التمرين sur l’exercice de pratique selon canPresentClassroom`, canPresent === ['admin', 'teacher'].includes(presenterStudent.role), `role=${presenterStudent.role} visible=${canPresent}`);
      if (canPresent) {
        // Une réponse en cours AVANT d'entrer (premier choix s'il y en a, sinon rien).
        const choice = page.locator('[data-classroom-scope="exercise"] button[aria-pressed]').first();
        const hasChoice = (await choice.count()) > 0;
        if (hasChoice) { await choice.click(); await settle(page, 300); }
        const katexBefore = await page.locator('[data-classroom-scope="exercise"] .katex').count();
        await page.locator('[data-classroom-enter="exercise"]').click();
        await page.waitForSelector('[data-classroom-active="true"]', { timeout: 5000 });
        await settle(page, 800);
        const f = await fits(page);
        check('X : l’exercice de pratique se présente — badge « التمرين », titre de l’exercice, plein écran', f.active && f.scope === 'exercise' && f.badge.includes('التمرين') && f.title.length > 0, JSON.stringify(f));
        check('X : chrome de séance retiré (retour, progression, cahier, signalement), exercice cadré', (await active(page).locator('nav').count()) === 0
          && (await active(page).getByRole('button', { name: /سجّل/ }).count()) === 0 && (await active(page).locator('[data-classroom-frame]').count()) === 1);
        check('X : réponse en cours conservée, rendu mathématique intact, aucun défilement', (!hasChoice || (await active(page).locator('button[aria-pressed="true"]').count()) >= 1)
          && (await active(page).locator('.katex').count()) === katexBefore && f.pageX && f.contentX, JSON.stringify(f));
        await exit(page); await settle(page, 500);
        check('X : sortie — la page de séance revient, la réponse est toujours là', (await page.locator('[data-classroom-active="true"]').count()) === 0
          && (!hasChoice || (await page.locator('[data-classroom-scope="exercise"] button[aria-pressed="true"]').count()) >= 1));
      }
    }
    await ctx.close();
  }
}

await browser.close();
if (errors.length) { console.log('\nERREURS NAVIGATEUR :'); errors.forEach((e) => console.log(' - ' + e)); }
process.exit(summary() || errors.length ? 1 : 0);
