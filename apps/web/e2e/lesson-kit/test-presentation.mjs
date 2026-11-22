// LA PRÉSENTATION D'UN TEST (وضع القسم) — module 0 « أستعدّ » et test final
// « إتقان », par le MÊME moteur de présentation (kit/TestPresentation.jsx).
//
// Ce que cette suite verrouille, sur le vrai serveur de développement :
//   1. UNE QUESTION À LA FOIS : la présentation ne montre pas le test en
//      colonne ; السابق / التالي passent d'une question à l'autre.
//   2. L'ÉTAT SURVIT à la navigation : répondre à Q1, aller à Q2, revenir —
//      la réponse de Q1 est toujours là (brief §5).
//   3. « تحقّق من الإجابة » ne valide QUE la question courante : les voisines
//      restent muettes, et le test ne se termine pas (brief §6, §8).
//   4. ÉTATS : unanswered → answered → correct/incorrect, jamais confondus
//      (brief §13) ; répondre ne révèle rien.
//   5. « كشف النتائج » révèle tout avec le MÊME correcteur, puis la revue
//      question par question reste possible (brief §9, §10).
//   6. La page NORMALE est inchangée : pas de validation par question hors
//      présentation — le test final y reste silencieux jusqu'à son envoi.
//   7. Pas de défilement de page, pas de débordement horizontal, en 1366×768
//      et en 390×844.
//
// Le présentateur est simulé par /auth/me (rôle admin) + un jeton local :
// aucune écriture en base. Run :
//   KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/test-presentation.mjs
import { BASE, launch, check, summary, watchErrors } from './helpers.mjs';

const CH = `${BASE}/courses/moyen/4am/ansab_al_aadad_wal_hisab`;
const LESSON = `${CH}/qasim-adad-tabii`;
const DIAGNOSTIC = `${LESSON}/astaidd`;      // module 0 — PrerequisiteDiagnostic
const FINAL = `${LESSON}/itqan`;             // module 7 — BossFinal (4–6 : مسائل)
const errors = [];
const { browser } = await launch();

const ADMIN = { id: 9001, role: 'admin', email: 'qa-admin@smarter.dz', first_name: 'QA', last_name: 'Admin', grade: null, account_status: 'active' };

async function openAs(url, { presenter = true, viewport = { width: 1366, height: 768 }, mobile = false, completed = ['0', '1', '2', '3'] } = {}) {
  const ctx = await browser.newContext({ viewport, hasTouch: mobile, isMobile: mobile });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort()); // hors ligne, elles retiennent « load » (helpers.mjs › newCtx)
  if (presenter) {
    await ctx.route('**/api/v1/auth/me', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, user: ADMIN }) }));
    // Aucune evidence ne doit partir : le test final en émet à son envoi, et
    // cette suite l'envoie. On absorbe l'appel plutôt que de polluer l'API.
    await ctx.route('**/api/v1/lessons/**/evidence', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }));
    await ctx.route('**/api/v1/lessons/**/final-test-attempt', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }));
    await ctx.addInitScript(([done, uid]) => {
      localStorage.setItem('token', 'e2e-presenter-token');
      const key = `u_${uid}_smarter_lesson_qasim-adad-tabii`;
      localStorage.setItem(key, JSON.stringify({ completedModules: done, completedExercises: [] }));
    }, [completed, ADMIN.id]);
  }
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForSelector('[data-classroom-scope]', { timeout: 20000 });
  await page.waitForTimeout(400);
  return { ctx, page };
}

const active = (page) => page.locator('[data-classroom-active="true"]').first();
const nextQ = (page) => active(page).locator('[data-classroom-nav] [data-classroom-nav-unit="next"]').click();
const prevQ = (page) => active(page).locator('[data-classroom-nav] [data-classroom-nav-unit="previous"]').click();

/** Entrer en présentation depuis le bouton flottant du module. */
async function present(page) {
  await page.locator('[data-classroom-enter="lesson"]').first().click();
  await page.waitForSelector('[data-test-presentation]', { timeout: 10000 });
  await page.waitForTimeout(500);
}

/** L'état visible de la présentation du test. */
const state = (page) => page.evaluate(() => {
  const r = document.querySelector('[data-classroom-active="true"]');
  if (!r) return { active: false };
  const p = r.querySelector('[data-test-presentation]');
  const shown = [...r.querySelectorAll('[data-test-question]')].filter((q) => !q.hasAttribute('hidden'));
  const c = r.querySelector('.sa-classroom-content');
  return {
    active: true,
    total: Number(p?.getAttribute('data-test-questions')),
    current: Number(p?.getAttribute('data-test-current')),
    shownCount: shown.length,
    shownIndex: shown[0]?.getAttribute('data-test-question') ?? null,
    states: [...r.querySelectorAll('[data-test-question]')].map((q) => q.getAttribute('data-test-state')),
    position: r.querySelector('[data-test-position]')?.textContent?.trim() ?? '',
    hasValidate: !!shown[0]?.querySelector('[data-test-validate], button'),
    validateLabel: [...(shown[0]?.querySelectorAll('button') ?? [])].map((b) => b.textContent.trim()).find((x) => x.includes('تحقّق')) ?? null,
    hasRevealAll: !!r.querySelector('[data-test-reveal-all]'),
    hasSummary: !!r.querySelector('[data-test-summary]'),
    tally: r.querySelector('[data-test-tally]')?.textContent?.trim() ?? null,
    navDots: r.querySelectorAll('[data-test-nav]').length,
    // L'ÉNONCÉ de la question visible. Il a manqué une fois (la présentation
    // ne rendait que la zone de réponse) : on le mesure, on ne le suppose pas.
    promptText: (shown[0]?.querySelector('[data-test-body]')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
    prev: !!r.querySelector('[data-classroom-nav] [data-classroom-nav-unit="previous"]'),
    next: !!r.querySelector('[data-classroom-nav] [data-classroom-nav-unit="next"]'),
    pageX: document.scrollingElement.scrollWidth <= window.innerWidth + 1,
    contentX: c ? c.scrollWidth <= c.clientWidth + 1 : true,
    // La réponse cochée de la question VISIBLE (aria-pressed du ChoiceGrid).
    picked: [...(shown[0]?.querySelectorAll('button[aria-pressed]') ?? [])].findIndex((b) => b.getAttribute('aria-pressed') === 'true'),
  };
});

/** Cocher la i-ème option de la question visible. */
async function pick(page, i = 0) {
  const shown = active(page).locator('[data-test-question]:not([hidden])').first();
  await shown.locator('button[aria-pressed]').nth(i).click();
  await page.waitForTimeout(250);
}

/** « تحقّق من الإجابة » sur la question visible. */
async function validateCurrent(page) {
  const shown = active(page).locator('[data-test-question]:not([hidden])').first();
  await shown.getByRole('button', { name: /تحقّق من الإجابة/ }).click();
  await page.waitForTimeout(350);
}

/* ── 1 — MODULE 0 : une question à la fois ────────────────────────────────── */
{
  const { ctx, page } = await openAs(DIAGNOSTIC);
  await present(page);
  let s = await state(page);

  check('D1 : le diagnostic se présente en une question à la fois', s.active && s.total > 1 && s.shownCount === 1 && s.current === 0, JSON.stringify({ total: s.total, shown: s.shownCount }));
  check('D1 : le repère « السؤال 1 من N » est affiché', /1/.test(s.position) && s.position.includes('السؤال'), s.position);
  check('D1 : en séance de leçon, « السابق » sur la première question sort du محور (jamais de bouton mort)', s.prev);
  check('D1 : « التالي » existe', s.next);
  check('D1 : toutes les questions commencent « unanswered »', s.states.every((x) => x === 'unanswered'), JSON.stringify(s.states));
  check('D1 : aucun débordement (page ni contenu)', s.pageX && s.contentX);
  // L'ÉNONCÉ est projeté, pas seulement les choix : le corps doit contenir
  // nettement plus que « صحيح / خطأ ».
  check('D1 : l’énoncé de la question est affiché', s.promptText.length > 25, `« ${s.promptText.slice(0, 80)} »`);

  // ── 2 — L'état survit à la navigation (brief §5)
  await pick(page, 0);
  s = await state(page);
  check('D2 : répondre marque « answered » — et NON « correct »', s.states[0] === 'answered', JSON.stringify(s.states));
  check('D2 : répondre ne révèle rien (pas de résultat affiché)', !s.tally);

  await nextQ(page);
  await pick(page, 1);
  await prevQ(page);
  s = await state(page);
  check('D2 : revenir à Q1 conserve la réponse cochée', s.current === 0 && s.picked === 0, `current=${s.current} picked=${s.picked}`);
  check('D2 : la réponse de Q2 est conservée aussi', s.states[1] === 'answered', JSON.stringify(s.states));

  // ── 3 — « تحقّق » ne valide QUE la question courante (brief §6)
  await validateCurrent(page);
  s = await state(page);
  const q1Revealed = s.states[0] === 'correct' || s.states[0] === 'incorrect';
  check('D3 : valider Q1 révèle Q1', q1Revealed, JSON.stringify(s.states));
  check('D3 : valider Q1 ne révèle PAS Q2', s.states[1] === 'answered', JSON.stringify(s.states));
  check('D3 : valider Q1 ne révèle aucune autre question', s.states.slice(2).every((x) => x === 'unanswered'), JSON.stringify(s.states));
  check('D3 : valider ne termine pas le test (pas de synthèse)', !s.hasSummary);
  check('D3 : valider ne force pas à avancer — on reste sur Q1', s.current === 0, `current=${s.current}`);
  check('D3 : la question validée reste consultable et navigable', s.next);

  await ctx.close();
}

/* ── 4 — « كشف النتائج » et la revue une à une ────────────────────────────── */
{
  const { ctx, page } = await openAs(DIAGNOSTIC);
  await present(page);
  let s = await state(page);
  const total = s.total;

  // Répondre à toutes les questions, sans en valider aucune.
  for (let i = 0; i < total; i += 1) {
    await pick(page, 0);
    if (i < total - 1) await nextQ(page);
  }
  s = await state(page);
  check('D4 : à la dernière question, « التالي » mène au محور suivant (séance de leçon)', s.next, `next=${s.next}`);
  check('D4 : toutes les questions sont « answered », aucune révélée', s.states.every((x) => x === 'answered'), JSON.stringify(s.states));
  check('D4 : le geste final « كشف النتائج » est offert', s.hasRevealAll);

  await active(page).locator('[data-test-reveal-all]').click();
  await page.waitForTimeout(700);
  s = await state(page);
  const revealedAll = s.states.every((x) => x === 'correct' || x === 'incorrect');
  check('D5 : « كشف النتائج » révèle TOUTES les questions', revealedAll, JSON.stringify(s.states));
  check('D5 : le décompte apparaît sur la barre d’outils', !!s.tally, String(s.tally));
  check('D5 : la synthèse (résultat du diagnostic) est montrée', s.hasSummary);

  // ── La revue une à une reste possible (brief §10)
  await prevQ(page);
  s = await state(page);
  check('D6 : après révélation, « السابق » ramène à la question précédente', s.current === total - 2, `current=${s.current}`);
  check('D6 : la revue montre une seule question à la fois', s.shownCount === 1);
  check('D6 : la question revue porte son résultat', ['correct', 'incorrect'].includes(s.states[total - 2]), JSON.stringify(s.states));
  check('D6 : la synthèse ne remplace pas la revue (elle n’est pas là ici)', !s.hasSummary);
  check('D6 : aucun débordement en revue', s.pageX && s.contentX);

  await ctx.close();
}

/* ── 7 — LE TEST FINAL : le même moteur de présentation ───────────────────── */
{
  const { ctx, page } = await openAs(FINAL);
  await present(page);
  let s = await state(page);

  check('B1 : le test final se présente en une épreuve à la fois', s.active && s.total > 1 && s.shownCount === 1, JSON.stringify({ total: s.total, shown: s.shownCount }));
  check('B1 : le repère « السؤال 1 من N » est affiché', s.position.includes('السؤال'), s.position);
  check('B1 : toutes les épreuves commencent « unanswered »', s.states.every((x) => x === 'unanswered'), JSON.stringify(s.states));
  check('B1 : un navigateur compact est offert (≤ 12 questions)', s.navDots === s.total, `dots=${s.navDots} total=${s.total}`);
  check('B1 : l’énoncé de l’épreuve est affiché', s.promptText.length > 25, `« ${s.promptText.slice(0, 80)} »`);

  await pick(page, 0);
  await validateCurrent(page);
  s = await state(page);
  check('B2 : « تحقّق » révèle l’épreuve courante seulement', ['correct', 'incorrect'].includes(s.states[0]) && s.states[1] === 'unanswered', JSON.stringify(s.states));
  check('B2 : valider une épreuve ne termine pas le test final', !s.hasSummary);

  // Répondre au reste, puis révéler tout — c'est le submit du moteur.
  for (let i = 1; i < s.total; i += 1) {
    await nextQ(page);
    await pick(page, 0);
  }
  s = await state(page);
  check('B3 : le geste final est offert à la dernière épreuve', s.hasRevealAll);
  await active(page).locator('[data-test-reveal-all]').click();
  await page.waitForTimeout(900);
  s = await state(page);
  check('B4 : « كشف النتائج » révèle toutes les épreuves', s.states.every((x) => x === 'correct' || x === 'incorrect'), JSON.stringify(s.states));
  check('B4 : le profil de maîtrise / la synthèse sont montrés', s.hasSummary);
  check('B4 : le décompte du test final apparaît', !!s.tally, String(s.tally));
  check('B4 : aucun débordement', s.pageX && s.contentX);

  await prevQ(page);
  s = await state(page);
  check('B5 : la revue épreuve par épreuve reste possible après la révélation', s.shownCount === 1 && ['correct', 'incorrect'].includes(s.states[s.current]), JSON.stringify(s.states));

  await ctx.close();
}

/* ── 8 — LA PAGE NORMALE EST INCHANGÉE ────────────────────────────────────── */
{
  const { ctx, page } = await openAs(FINAL);
  const onPage = await page.evaluate(() => ({
    presentation: document.querySelectorAll('[data-test-presentation]').length,
    checkButtons: [...document.querySelectorAll('button')].filter((b) => b.textContent.includes('تحقّق من الإجابة')).length,
    // La page garde son envoi global unique.
    submit: [...document.querySelectorAll('button')].some((b) => b.textContent.includes('أرسِل إجاباتي')),
  }));
  check('N1 : hors présentation, aucune présentation de test n’est rendue', onPage.presentation === 0, String(onPage.presentation));
  check('N1 : hors présentation, aucun « تحقّق من الإجابة » par question', onPage.checkButtons === 0, String(onPage.checkButtons));
  check('N1 : la page garde son envoi global unique « أرسِل إجاباتي »', onPage.submit);
  await ctx.close();
}

/* ── 9 — TÉLÉPHONE ────────────────────────────────────────────────────────── */
{
  const { ctx, page } = await openAs(DIAGNOSTIC, { viewport: { width: 390, height: 844 }, mobile: true });
  await present(page);
  await pick(page, 0);
  await validateCurrent(page);
  const s = await state(page);
  check('M1 : 390×844 — une question à la fois, validée, sans débordement', s.shownCount === 1 && s.pageX && s.contentX, JSON.stringify({ shown: s.shownCount, pageX: s.pageX, contentX: s.contentX }));
  check('M1 : 390×844 — السابق / التالي restent atteignables', s.next || s.prev);
  await ctx.close();
}

check('Aucune erreur console', errors.length === 0, errors.slice(0, 3).join(' | '));
await browser.close();
summary();
