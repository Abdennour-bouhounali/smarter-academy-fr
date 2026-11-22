// LA FEUILLE D'EXAMEN — pratique au format BEM (toute leçon de content/practice/exam-style.json ; LESSON=<code>).
//
// Ce que cette suite verrouille :
//   1. un exercice qui porte `metadata.exam` s'affiche en feuille : en-tête
//      « التمرين …:(… ن) », numéros d'étape encadrés ;
//   2. PROGRESSIF : seule l'étape courante et les étapes faites sont affichées —
//      la 02 s'ajoute sous la 01, la 01 reste ;
//   3. après une réponse, l'étape passée rappelle la réponse de l'élève et le
//      corrigé type « الحل النموذجي » (replié) ;
//   4. « بيّن أن » (selfCheck) : texte écrit → « سجّل إجابتي » → texte verrouillé,
//      corrigé type affiché, puis la note « مطابق / غير مطابق » ;
//   5. aucune barre de défilement horizontal sur un téléphone de 360 px ;
//   7. « التمرين السابق » rouvre l'exercice terminé en lecture seule ;
//   8. « مراحل الحساب » : requises quand l'énoncé les demande ;
//   9. chaque étape a son chrono, qui décompte ;
//   6. le corrigé type se MÉRITE : rien avant une tentative, rien sur une saisie
//      illisible, et une démonstration trop courte ne s'enregistre pas.
//
// Photos de copie et correction par l'enseignant (2026-10-06) : suite compagnon
// practice-image-answers.mjs (deux jetons + une classe de test, voir son en-tête).
//
// Besoin de l'API (jeton élève) : serveur de développement (5173).
// Run : KIT_BASE=http://localhost:5173 LESSON=<code> PRACTICE_TOKEN=… node apps/web/e2e/lesson-kit/practice-exam-sheet.mjs
import { chromium } from 'playwright';

const B = process.env.KIT_BASE || 'http://localhost:5173';
const TOKEN = process.env.PRACTICE_TOKEN;
// N'importe quelle leçon listée dans content/practice/exam-style.json (défaut : la première convertie).
const LESSON = process.env.LESSON || 'bahth-pgcd';
const SHOTS = process.env.SHOTS_DIR || '/tmp';

const results = [];
const check = (name, cond, detail = '') => {
  results.push({ name, pass: !!cond });
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail && !cond ? ` — ${detail}` : ''}`);
};

if (!TOKEN) {
  console.log('SKIP practice-exam-sheet : PRACTICE_TOKEN absent (jeton élève requis).');
  process.exit(0);
}

const browser = await chromium.launch({ args: ['--no-sandbox'] });

async function openLevel(level, { mobile = false } = {}) {
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 360, height: 780 } : { width: 1280, height: 900 },
    isMobile: mobile, hasTouch: mobile,
  });
  await ctx.addInitScript((tok) => { localStorage.setItem('token', tok); }, TOKEN);
  const page = await ctx.newPage();
  await page.goto(`${B}/espace/pratique/${LESSON}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-practice-level]', { timeout: 20000 }).catch(() => {});
  const btn = page.locator(`[data-practice-level="${level}"]`);
  if (await btn.count()) { await btn.first().click(); await page.waitForTimeout(3000); }
  await page.waitForSelector('[data-exam-sheet]', { timeout: 15000 }).catch(() => {});
  return { ctx, page };
}

const sheetState = (page) => page.evaluate(() => {
  const s = document.querySelector('[data-exam-sheet]');
  if (!s) return null;
  return {
    kind: s.getAttribute('data-exam-sheet'),
    heading: document.getElementById('exam-sheet-heading')?.innerText.trim(),
    steps: s.querySelectorAll('[data-exam-question]').length,
    boxes: s.querySelectorAll('[data-exam-step-box]').length,
    current: s.querySelectorAll('[data-exam-step="current"]').length,
    done: s.querySelectorAll('[data-exam-step="done"]').length,
    formInCurrent: !!s.querySelector('[data-exam-step="current"] [data-answer-form]'),
    badge: s.querySelector('[data-exam-badge]')?.innerText.trim() ?? null,
    url: location.href,
    bodyLen: document.body.innerText.length,
  };
});

let syntaxProbed = false;
// Un vrai clic souris (le <math-field> de MathLive se focalise mal avec locator.click).
async function mclick(page, loc) {
  // Au centre de l'écran d'abord : la barre « السؤال التالي » collée en bas couvrirait le champ.
  await loc.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(150);
  const bb = await loc.boundingBox();
  await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await page.waitForTimeout(200);
}
// « ابدأ » : l'étape est cachée tant que l'élève n'a pas lancé son chrono.
async function startStep(page) {
  const start = page.locator('[data-step-start]');
  if (await start.count()) {
    check('étape cachée avant « ابدأ »', await page.locator('[data-exam-step="current"] [data-exam-question]').count() === 0);
    await page.waitForSelector('[data-step-start]:not([disabled])', { timeout: 15000 });
    await start.click();
    await page.waitForTimeout(700);
    check('« ابدأ » révèle la question et lance le chrono', await page.locator('[data-exam-step="current"] [data-exam-question]').count() === 1
      && await page.locator('[data-exam-step="current"] [data-step-timer="running"], [data-exam-step="current"] [data-step-timer="warning"]').count() === 1);
  }
}
async function typeMath(page, loc, text) {
  await mclick(page, loc);
  await page.keyboard.type(text);
  await page.waitForTimeout(250);
}
async function answerCurrent(page) {
  await startStep(page);
  check('aucun corrigé type avant une tentative', await page.locator('[data-exam-step="current"] [data-solution-panel]').count() === 0);
  const cur = '[data-exam-step="current"]';
  // « بيّن أن » : la démonstration en lignes (texte arabe / formules).
  if (await page.locator(`${cur} [data-self-check]`).count() === 0 && await page.locator(`${cur} [data-lines-editor]`).count() && await page.locator(`${cur} [data-work-area]`).count() === 0) {
    const firstText = page.locator(`${cur} [data-line-text]`).first();
    await firstText.fill('لأن');
    check('بيّن أن : une démonstration trop courte ne s\'enregistre pas', !(await page.locator('[data-validate]').first().isEnabled()) && await page.locator('[data-proof-too-short]').count() === 1);
    await firstText.fill('لدينا 21 − 14 = 7 وبالتالي');
    await page.locator(`${cur} [data-add-line="math"]`).click();
    await typeMath(page, page.locator(`${cur} [data-lines-editor] math-field`).last(), 'PGCD(21;14)=PGCD(14;7)');
    await page.locator('[data-validate]').first().click();
    await page.waitForTimeout(1500);
    check('بيّن أن : le texte enregistré est verrouillé', await page.locator('[data-self-check-saved]').count() === 1 && await page.locator(`${cur} [data-lines-editor]`).count() === 0);
    check('بيّن أن : le corrigé type est affiché après l\'enregistrement', await page.locator(`${cur} [data-solution-panel]`).count() > 0);
    await page.screenshot({ path: `${SHOTS}/exam-sheet-selfcheck-saved.png`, fullPage: true });
    await page.locator('[data-self-mark="correct"]').scrollIntoViewIfNeeded();
    await page.locator('[data-self-mark="correct"]').click();
    await page.waitForTimeout(1200);
    check('بيّن أن : la note est enregistrée', await page.locator('[data-self-mark="correct"][aria-pressed="true"]').count() === 1);
    return;
  }
  const field = page.locator(`${cur} [data-answer-box] math-field`).first();
  // « مراحل الحساب » requises : « تحقّق » reste inactif tant qu'elles manquent.
  if (await page.locator(`${cur} [data-work-area]`).count()) {
    if (await page.locator(`${cur} [data-work-area="required"]`).count() && await field.count()) {
      await typeMath(page, field, '1');
      check('مراحل الحساب requises : « تحقّق » inactif sans elles', !(await page.locator('[data-validate]').first().isEnabled()));
    }
    await typeMath(page, page.locator(`${cur} [data-lines-editor] math-field`).first(), '1215=945*1+270');
    await page.keyboard.press('Enter');
    await page.keyboard.type('945=270*3+135');
    await page.waitForTimeout(250);
  }
  if (!syntaxProbed && await field.count()) {
    syntaxProbed = true;
    await typeMath(page, field, 'abc');
    if (await page.locator('[data-validate]').first().isEnabled()) {
      await page.locator('[data-validate]').first().click();
      await page.waitForTimeout(1200);
      check('saisie illisible : le corrigé type reste caché', await page.locator(`${cur} [data-solution-panel]`).count() === 0);
      check('saisie illisible : non envoyée, le champ reste modifiable', await page.locator('[data-unreadable]').count() === 1 && await page.locator('[data-validate]').count() === 1);
    }
    await mclick(page, field);
    for (let k = 0; k < 6; k += 1) await page.keyboard.press('Backspace');
  }
  const opt = page.locator(`${cur} button[aria-pressed]:not([disabled])`).first();
  // Ensemble d'entiers (« عيّن قواسم … », `integerSet`) : un textarea, pas un champ MathLive.
  const setBox = page.locator(`${cur} [data-answer-form] textarea:not([disabled]):not([data-work-area] textarea):not([data-lines-editor] textarea)`).first();
  if (await opt.count()) await opt.click();
  else if (await field.count()) await typeMath(page, field, '1');
  else if (await setBox.count()) await setBox.fill('1 ؛ 2');
  // Couple (x ; y) (`point`, unité 5) : deux champs texte.
  else if (await page.locator(`${cur} [data-point-input] input:not([disabled])`).count()) {
    for (const inp of await page.locator(`${cur} [data-point-input] input:not([disabled])`).all()) await inp.fill('1');
  }
  await page.locator('[data-validate]').first().click();
  await page.waitForTimeout(1500);
}

// Les niveaux se débloquent un à un (un exercice terminé ouvre le suivant) :
// on parcourt 1 → 5 en terminant UN exercice entier par niveau.
for (const level of [1, 2, 3, 4, 5]) {
  const { ctx, page } = await openLevel(level);
  await startStep(page);
  const s = await sheetState(page);
  check(`niveau ${level} : la feuille d'examen est rendue`, s, `url=${page.url()}`);
  if (!s) { await ctx.close(); continue; }
  console.log(`  ${s.kind} · ${s.badge ?? '—'} · « ${s.heading} »`);
  check(`niveau ${level} : en-tête « …:(… ن) »`, /:\s*\(.+ن\)/.test(s.heading ?? ''), s.heading);
  check(`niveau ${level} : numéro d'étape encadré`, s.boxes >= 1);
  // (Une séance reprise peut rouvrir une étape DÉJÀ répondue : verrouillée, sans chrono qui tourne.)
  const alreadyAnswered = await page.locator('[data-exam-step="current"] [data-answer-form] input:disabled, [data-exam-step="current"] [data-answer-form] textarea:disabled').count() > 0;
  check(`niveau ${level} : le chrono de l'étape décompte`, alreadyAnswered || await page.locator('[data-exam-step="current"] [data-step-timer="running"], [data-exam-step="current"] [data-step-timer="warning"]').count() === 1);
  check(`niveau ${level} : progressif — une seule étape au départ, avec sa zone de réponse`, s.steps === 1 && s.current === 1 && s.formInCurrent, `${s.steps} étapes`);
  await page.screenshot({ path: `${SHOTS}/exam-sheet-l${level}.png`, fullPage: true });

  for (let step = 1; step <= 24; step += 1) { // jusqu’à 24 questions (feuilles BEM longues)
    await answerCurrent(page);
    const next = page.locator('[data-next]').first();
    const label = (await next.innerText()).trim();
    if (/السؤال التالي/.test(label)) {
      await next.click();
      await page.waitForTimeout(1500);
      await startStep(page);
      const s2 = await sheetState(page);
      check(`niveau ${level} : l'étape ${step + 1} s'ajoute, les précédentes restent`, s2?.steps === step + 1 && s2?.done === step, `${s2?.steps} étapes, ${s2?.done} faites`);
      continue;
    }
    await page.screenshot({ path: `${SHOTS}/exam-sheet-l${level}-done.png`, fullPage: true });
    check(`niveau ${level} : le corrigé type des étapes faites est disponible`, await page.locator('[data-exam-step="done"] [data-solution-panel], [data-exam-step="current"] [data-solution-panel]').count() >= 1);
    await next.click();
    await page.waitForTimeout(2500);
    // « التمرين السابق » : l'exercice terminé se relit, en lecture seule, puis on revient.
    const prev = page.locator('[data-previous-exercise]');
    if (await prev.count()) {
      await prev.click();
      await page.waitForTimeout(800);
      const review = await page.evaluate(() => ({
        shown: !!document.querySelector('[data-exercise-review]'),
        inputs: document.querySelectorAll('[data-exercise-review] input, [data-exercise-review] textarea').length,
        done: document.querySelectorAll('[data-exercise-review] [data-exam-step="done"]').length,
      }));
      check(`niveau ${level} : « التمرين السابق » rouvre l'exercice terminé, en lecture seule`, review.shown && review.inputs === 0 && review.done >= 1, JSON.stringify(review));
      if (level === 1) await page.screenshot({ path: `${SHOTS}/exam-sheet-review.png`, fullPage: true });
      await page.locator('[data-review-back]').click();
      await page.waitForTimeout(600);
      check(`niveau ${level} : retour à l'exercice courant`, await page.locator('[data-exam-step="current"]').count() === 1);
    } else if (/session/.test(page.url())) {
      check(`niveau ${level} : « التمرين السابق » présent après un exercice terminé`, false);
    }
    break;
  }
  await ctx.close();
}

{
  const { ctx, page } = await openLevel(3, { mobile: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check('téléphone 360 px : pas de défilement horizontal', overflow <= 1, `débord ${overflow}px`);
  await page.screenshot({ path: `${SHOTS}/exam-sheet-mobile.png`, fullPage: true });
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} PASS`);
process.exit(failed ? 1 : 0);
