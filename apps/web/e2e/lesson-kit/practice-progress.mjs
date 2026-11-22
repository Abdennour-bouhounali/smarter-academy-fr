// L'ESPACE D'EXERCICES — se repérer, et tout lire en arabe.
//
// Ce que cette suite verrouille :
//   1. À TOUT MOMENT l'élève sait OÙ il est : quel exercice du niveau, quelle
//      question de l'exercice ;
//   2. et ce qu'il lui RESTE : questions de l'exercice courant, puis exercices
//      du niveau — jamais un nombre négatif, et « آخر… » sur le dernier ;
//   3. les deux compteurs AVANCENT quand il répond ;
//   4. aucun texte français ne subsiste dans le parcours (verdicts compris) ;
//   5. le bandeau tient sur un téléphone de 360 px ;
//   6. l'HISTORIQUE : à la question 2, la question 1 et la réponse de l'élève
//      restent affichées (carte « السؤال السابق »), sans rien dévoiler de la
//      question courante ; la colonne « سياق السؤال » sur grand écran.
//
// Cette suite a besoin de l'API (jeton élève). Elle vise donc le SERVEUR DE
// DÉVELOPPEMENT (5173) : la préversion (5183) est construite sans
// .env.production et pointe vers un port où rien n'écoute.
//
// Run : KIT_BASE=http://localhost:5173 PRACTICE_TOKEN=… node apps/web/e2e/lesson-kit/practice-progress.mjs
import { chromium } from 'playwright';

const B = process.env.KIT_BASE || 'http://localhost:5173';
const TOKEN = process.env.PRACTICE_TOKEN;
const LESSON = process.env.PRACTICE_LESSON || 'qasim-adad-tabii';

const results = [];
const check = (name, cond, detail = '') => {
  results.push({ name, pass: !!cond });
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail && !cond ? ` — ${detail}` : ''}`);
};

if (!TOKEN) {
  console.log('SKIP practice-progress : PRACTICE_TOKEN absent (jeton élève requis).');
  process.exit(0);
}

// Tout mot français qui atteindrait l'élève dans ce parcours.
const FR = /\b(Juste|Pas encore|À moitié|Réponse illisible|Question passée|Ta réponse|Abscisse|Ordonnée|Borne|Coefficient|Crochet|Exercice \d|Niveau \d|exercices?|conseillé|terminé|restants?|juste)\b/;

const browser = await chromium.launch({ args: ['--no-sandbox'] });

const readBanner = (page) => page.evaluate(() => {
  const b = document.querySelector('[data-session-progress]');
  if (!b) return null;
  return {
    exercise: b.querySelector('[data-exercise-position]')?.innerText.trim() ?? null,
    question: b.querySelector('[data-question-position]')?.innerText.trim() ?? null,
    remaining: b.querySelector('[data-remaining]')?.innerText.trim() ?? null,
    exerciseIndex: Number(b.getAttribute('data-exercise-index')),
    questionIndex: Number(b.getAttribute('data-question-index')),
  };
});

/** Répond à la question courante et passe à la suivante. Renvoie false à la fin. */
async function answerAndAdvance(page) {
  // Un choix (QCM) : les boutons `aria-pressed` de la carte courante — plus de
  // lettre latine devant les choix (ARABIC_RTL_CONTRACT §4). Sinon un champ.
  const opt = page.locator('[data-current-question] button[aria-pressed]:not([disabled])').first();
  if (await opt.count()) { await opt.click(); await page.waitForTimeout(250); } else {
    const field = page.locator('[data-current-question] input:not([disabled]), [data-current-question] textarea:not([disabled])').first();
    if (await field.count()) await field.fill('1');
  }
  const chk = page.locator('[data-validate]').first();
  if (await chk.count() && await chk.isEnabled().catch(() => false)) { await chk.click(); await page.waitForTimeout(1500); }
  const next = page.locator('[data-next]').first();
  if (await next.count() && await next.isEnabled().catch(() => false)) { await next.click(); await page.waitForTimeout(2200); return true; }
  return false;
}

async function open({ mobile = false, lesson = LESSON, width = 1280 } = {}) {
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 360, height: 780 } : { width, height: 900 },
    isMobile: mobile, hasTouch: mobile,
  });
  await ctx.addInitScript((tok) => { localStorage.setItem('token', tok); }, TOKEN);
  const page = await ctx.newPage();
  await page.goto(`${B}/espace/pratique/${lesson}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1600);
  const level = page.locator('[data-practice-level="1"]');
  if (await level.count()) { await level.first().click(); await page.waitForTimeout(3000); }
  return { ctx, page };
}

/* ── 1 · 2 — se repérer, et savoir ce qu'il reste ────────────────────────── */
{
  const { ctx, page } = await open();
  const b = await readBanner(page);
  check('le bandeau de progression est présent', b !== null);
  check('il dit QUEL EXERCICE (التمرين n من N)', /التمرين\s+\d+\s+من\s+\d+/.test(b?.exercise ?? ''), b?.exercise);
  check('il dit QUELLE QUESTION (السؤال n من N)', /السؤال\s+\d+\s+من\s+\d+/.test(b?.question ?? ''), b?.question);
  check('il dit CE QU’IL RESTE', /بقي|آخر/.test(b?.remaining ?? ''), b?.remaining);
  check('aucun nombre négatif dans le reste', !/-\d/.test(b?.remaining ?? ''), b?.remaining);
  await ctx.close();
}

/* ── 3 — les deux compteurs avancent ─────────────────────────────────────── */
{
  const { ctx, page } = await open();
  const start = await readBanner(page);
  await answerAndAdvance(page);
  const afterQ = await readBanner(page);
  check('répondre fait avancer la QUESTION', afterQ.questionIndex === start.questionIndex + 1 || afterQ.exerciseIndex === start.exerciseIndex + 1,
    `${start.questionIndex} → ${afterQ.questionIndex}`);

  // Aller jusqu'au changement d'exercice.
  let guard = 0;
  while (guard++ < 8) {
    const before = await readBanner(page);
    const moved = await answerAndAdvance(page);
    const after = await readBanner(page);
    if (!moved || !after) break;
    if (after.exerciseIndex > before.exerciseIndex) {
      check('changer d’exercice remet la question à 1', after.questionIndex === 0, String(after.questionIndex));
      check('le dernier exercice est annoncé « آخر تمرين »',
        after.exerciseIndex < 1 || /آخر تمرين|ثم \d+|ثم تمرين/.test(after.remaining), after.remaining);
      break;
    }
  }
  await ctx.close();
}

/* ── 3bis — le titre est un vrai titre, le numéro est sur la carte ─────── */
// Depuis la refonte (2026-09-24) : le niveau est un surtitre, le titre de
// l'exercice un h1 seul, et « السؤال n من N » (N = les questions de CET
// exercice) est le titre de la carte courante — plus glissé dans le titre.
{
  const { ctx, page } = await open();
  const level = await page.locator('[data-exercise-level]').innerText().catch(() => '');
  const title = await page.locator('h1#practice-exercise-title').innerText().catch(() => '');
  check('le surtitre dit le NIVEAU (المستوى n)', /المستوى\s+\d+/.test(level), level);
  check('le titre de l’exercice est un h1 non vide, sans « السؤال n »', title.trim().length > 0 && !/السؤال\s+\d/.test(title), title);
  const heading = () => page.locator('#practice-question-heading').innerText().catch(() => '');
  const first = await heading();
  check('la carte courante porte « السؤال n من N »', /السؤال\s+\d+\s+من\s+\d+/.test(first), first);
  await answerAndAdvance(page);
  const second = await heading();
  check('le numéro de question suit l’élève', second !== first, `${first} → ${second}`);
  await ctx.close();
}

/* ── 7 — le POINT D'APPRENTISSAGE : nom, étoiles, deux compteurs réels ──── */
{
  const HISTORY_LESSON = process.env.PRACTICE_HISTORY_LESSON || 'wadiya-idmajiya-aadad';
  const API = process.env.API_BASE || 'http://localhost:8000/api/v1';
  const overview = await fetch(`${API}/lessons/${HISTORY_LESSON}/practice/overview`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
  }).then((r) => r.json()).catch(() => null);
  const { ctx, page } = await open({ lesson: HISTORY_LESSON });
  const lp = page.locator('[data-learning-point]');
  check('le module « الكفاءة » est affiché', (await lp.count()) === 1);
  const code = await lp.getAttribute('data-learning-point').catch(() => null);
  const row = overview?.learningPoints?.find((p) => p.code === code);
  const text = (await lp.innerText().catch(() => '')).replace(/\s+/g, ' ');
  check('… avec le NOM du point (titre du serveur)', !!row && text.includes(row.title.slice(0, 15)), `${code}`);
  const metric = async (k) => (await page.locator(`[data-lp-metric="${k}"] bdi`).innerText().catch(() => '')).replace(/\s+/g, '');
  check('… exercices = practice.exercisesCompleted / exercises du serveur',
    !!row && (await metric('exercises')) === `${row.practice.exercisesCompleted}/${row.practice.exercises}`, await metric('exercises'));
  check('… questions = practice.questionsAnswered / questions (questions RÉELLES)',
    !!row && (await metric('questions')) === `${row.practice.questionsAnswered}/${row.practice.questions}`, await metric('questions'));
  const stage = Number(await lp.getAttribute('data-mastery-stage'));
  check('… étoiles = l’état Mastery V2 du serveur', stage === ({ unassessed: 0, gap: 1, reinforce: 2, mastered: 3 }[row?.status] ?? 0), `${row?.status} → ${stage}`);
  await ctx.close();
}

/* ── 6 — l'historique : la question 1 reste là, à la question 2 ───────── */
{
  const HISTORY_LESSON = process.env.PRACTICE_HISTORY_LESSON || 'wadiya-idmajiya-aadad';
  const { ctx, page } = await open({ lesson: HISTORY_LESSON, width: 1536 });
  const total = await page.locator('[data-current-question]').count() && await page.evaluate(() => document.querySelectorAll('[data-context-item]').length);
  if (!total || total < 2) {
    console.log(`SKIP historique : exercice à une question (${HISTORY_LESSON})`);
  } else {
    const field = page.locator('[data-current-question] input:not([disabled]), [data-current-question] textarea:not([disabled])').first();
    const q1 = (await page.locator('[data-question-statement]').innerText()).trim();
    check('avant toute réponse : pas d’historique', (await page.locator('[data-previous-question]').count()) === 0);
    await field.fill('5');
    await field.press('Enter');
    await page.waitForTimeout(1500);
    check('Entrée valide la réponse (formulaire)', (await page.locator('[data-feedback]').count()) === 1);
    check('le verdict a une icône ET un libellé', /ليس بعد|إجابة صحيحة|نصف الطريق/.test(await page.locator('[data-feedback]').innerText()));
    check('« السؤال التالي » est actif après une réponse fausse (non bloquant)', await page.locator('[data-next]').isEnabled());
    await page.locator('[data-retry]').click().catch(() => {});
    check('« أعِد المحاولة » garde la réponse de l’élève', (await field.inputValue().catch(() => '')) === '5');
    await page.locator('[data-validate]').click();
    await page.waitForTimeout(1500);
    await page.locator('[data-next]').click();
    await page.waitForTimeout(2200);
    const prev = page.locator('[data-previous-question]');
    check('question 2 : la carte « السؤال السابق » est là', (await prev.count()) === 1);
    const prevText = (await prev.innerText().catch(() => '')).replace(/\s+/g, ' ');
    check('elle porte l’ÉNONCÉ de la question 1', prevText.includes(q1.replace(/\s+/g, ' ').slice(0, 12)), prevText.slice(0, 80));
    check('… et la RÉPONSE de l’élève (5)', /إجابتك:?\s*5\b/.test(prevText) || prevText.includes(' 5 '), prevText.slice(0, 120));
    check('… et son verdict en toutes lettres', /تحتاج إلى مراجعة|إجابة صحيحة|نصف صحيحة/.test(prevText));
    check('grand écran : « سياق السؤال » montre 1 faite, 1 courante',
      (await page.locator('[data-context-state="done"]').count()) === 1 && (await page.locator('[data-context-state="current"]').count()) === 1);
    const q2 = (await page.locator('[data-question-statement]').innerText()).trim();
    check('la question courante a changé', q2 !== q1);
    check('le focus est sur la nouvelle question (champ ou titre)', await page.evaluate(() => !!document.activeElement?.closest('[data-current-question]')));
    await page.setViewportSize({ width: 360, height: 780 });
    await page.waitForTimeout(400);
    check('mobile : l’historique tient sans débordement', await page.evaluate(() => document.scrollingElement.scrollWidth <= window.innerWidth + 1));
  }
  await ctx.close();
}

/* ── 4 — tout en arabe, verdict compris ──────────────────────────────────── */
{
  const { ctx, page } = await open();
  const opt = page.locator('[data-current-question] button[aria-pressed]:not([disabled])').first();
  if (await opt.count()) { await opt.click(); await page.waitForTimeout(250); }
  const chk = page.locator('[data-validate]').first();
  if (await chk.count() && await chk.isEnabled().catch(() => false)) { await chk.click(); await page.waitForTimeout(1800); }
  const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  check('aucun texte français dans la séance', !FR.test(body), (body.match(FR) || [])[0]);
  check('le verdict est en arabe', /إجابة صحيحة|ليس بعد|نصف الطريق|صحيحة — بكتابة أخرى/.test(body));
  await ctx.close();
}

/* ── 5 — téléphone ───────────────────────────────────────────────────────── */
{
  const { ctx, page } = await open({ mobile: true });
  const b = await readBanner(page);
  check('mobile : le bandeau garde les deux repères', /التمرين/.test(b?.exercise ?? '') && /السؤال/.test(b?.question ?? ''));
  check('mobile : aucun débordement horizontal', await page.evaluate(() => document.scrollingElement.scrollWidth <= window.innerWidth + 1));
  await ctx.close();
}

await browser.close();
const fails = results.filter((r) => !r.pass);
console.log(`\n== ${results.length - fails.length}/${results.length} passed ==`);
if (fails.length) { console.log('FAILED:'); fails.forEach((f) => console.log(` - ${f.name}`)); }
