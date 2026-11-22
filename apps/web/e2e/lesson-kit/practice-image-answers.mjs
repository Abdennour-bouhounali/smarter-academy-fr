// PHOTOS DE COPIE et CORRECTION PAR L'ENSEIGNANT — toute leçon au format BEM (LESSON=<code>, défaut bahth-pgcd)
// (décisions du propriétaire 2026-10-06 ; EXERCISE_CONTRACT.md § « Image
// answers and teacher validation »). Compagnon de practice-exam-sheet.mjs.
//
// Ce que cette suite verrouille, dans le VRAI navigateur, contre la vraie API :
//   1. l'élève joint une photo (compteur « 1 / 3 ») et répond SANS rien saisir ;
//   2. en « تصحيح الأستاذ » : la copie part en attente — message « أُرسلت إجابتك
//      إلى أستاذك », AUCUN corrigé type, et « التالي » reste ouvert ;
//   3. l'enseignant la trouve dans « تصحيح الإجابات » (pastille du menu),
//      l'annote au stylo rouge, la juge avec un commentaire ; elle quitte la file ;
//   4. l'élève voit la cloche (1 non lue), l'ouvre, arrive sur EXACTEMENT
//      l'exercice et l'étape, en lecture seule : verdict, commentaire, photo
//      « مصحّحة », corrigé type ;
//   5. en « مستقل » : une copie en photo seule ouvre le corrigé type et
//      « مطابق / غير مطابق » ;
//   6. aucun défilement horizontal à 360 px (correction, file de l'enseignant).
//
// Préparation (tinker) : une classe de qa-prof contenant qa-eleve, réglée
// `practice_validation = teacher` ; un jeton pour chacun. Nettoyer ensuite.
// Run : KIT_BASE=http://localhost:5173 LESSON=<code> STUDENT_TOKEN=… TEACHER_TOKEN=… CLASS_ID=… STUDENT_ID=… \
//       node apps/web/e2e/lesson-kit/practice-image-answers.mjs
import { chromium } from 'playwright';

const B = process.env.KIT_BASE || 'http://localhost:5173';
const API = process.env.KIT_API || 'http://localhost:8000/api/v1';
const STUDENT = process.env.STUDENT_TOKEN;
const TEACHER = process.env.TEACHER_TOKEN;
const CLASS_ID = process.env.CLASS_ID;
const STUDENT_ID = process.env.STUDENT_ID;
// N'importe quelle leçon listée dans content/practice/exam-style.json (défaut : la première convertie).
const LESSON = process.env.LESSON || 'bahth-pgcd';
const SHOTS = process.env.SHOTS_DIR || '/tmp';

const results = [];
const check = (name, cond, detail = '') => {
  results.push({ name, pass: !!cond });
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail && !cond ? ` — ${detail}` : ''}`);
};

if (!STUDENT || !TEACHER || !CLASS_ID || !STUDENT_ID) {
  console.log('SKIP practice-image-answers : STUDENT_TOKEN, TEACHER_TOKEN, CLASS_ID, STUDENT_ID requis.');
  process.exit(0);
}

const setValidation = (value) => fetch(`${API}/teacher/classrooms/${CLASS_ID}/students/${STUDENT_ID}/settings`, {
  method: 'PATCH',
  headers: { Authorization: `Bearer ${TEACHER}`, 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({ practiceValidation: value }),
}).then((r) => r.json());

const browser = await chromium.launch({ args: ['--no-sandbox'] });

async function contextFor(token, { mobile = false } = {}) {
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 360, height: 780 } : { width: 1280, height: 900 },
    isMobile: mobile, hasTouch: mobile,
  });
  await ctx.addInitScript((tok) => { localStorage.setItem('token', tok); }, token);
  return ctx;
}

const noHorizontalScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

/** Ouvre un niveau et répond à l'étape courante par une PHOTO seule. */
async function answerWithPhotoOnly(page, level, photo, expect = '[data-review-status], [data-self-mark]') {
  await page.goto(`${B}/espace/pratique/${LESSON}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(`[data-practice-level="${level}"]`, { timeout: 60000 });
  await page.waitForTimeout(800);
  await page.locator(`[data-practice-level="${level}"]`).first().click();
  await page.waitForSelector('[data-exam-sheet]', { timeout: 15000 });
  const start = page.locator('[data-step-start]');
  if (await start.count()) {
    await page.waitForSelector('[data-step-start]:not([disabled])', { timeout: 15000 });
    await start.click();
    await page.waitForTimeout(600);
  }
  const cur = '[data-exam-step="current"]';
  check('le sélecteur de photos est sous la question', await page.locator(`${cur} [data-answer-image-picker]`).count() === 1);
  check('« تحقّق » fermé sans saisie ni photo', !(await page.locator('[data-validate]').first().isEnabled()));
  await page.locator(`${cur} [data-image-input="file"]`).setInputFiles({ name: 'copie.png', mimeType: 'image/png', buffer: photo });
  await page.waitForSelector(`${cur} [data-answer-image]`, { timeout: 15000 });
  await page.waitForSelector(`${cur} [data-answer-image] img`, { timeout: 15000 }).catch(() => {});
  check('la photo apparaît en vignette, compteur 1 / 3', (await page.locator(`${cur} [data-image-count]`).innerText()).includes('1 / 3'));
  check('la vignette se charge (image privée lue avec le jeton)', await page.locator(`${cur} [data-answer-image] img`).count() === 1);
  check('« تحقّق » s\'ouvre avec une photo seule', await page.locator('[data-validate]').first().isEnabled());
  const questionId = await page.locator(`${cur} [data-exam-question]`).first().getAttribute('data-exam-question');
  await page.locator('[data-validate]').first().click();
  // Le verdict du serveur : en attente de l'enseignant, ou l'auto-évaluation.
  // Rien ne s'affiche avant le verdict du serveur (pas de prédiction locale).
  check('rien n\'est révélé pendant que le serveur juge', await page.locator(`${cur} [data-solution-panel]`).count() === 0
    || await page.locator(`${cur} [data-review-status], ${cur} [data-self-mark]`).count() > 0);
  await page.waitForSelector(expect.split(',').map((x) => `${cur} ${x.trim()}`).join(', '), { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(500);
  return questionId;
}

// Une « photo de copie » : une capture PNG d'une page quelconque.
const scratch = await (await contextFor(STUDENT)).newPage();
await scratch.setContent('<body style="background:#fff;font:32px serif;padding:40px">PGCD(117 ; 91) = 13<br>117 − 91 = 26</body>');
const PHOTO = await scratch.screenshot();

// ── 1–2. L'élève en « تصحيح الأستاذ » ─────────────────────────────────────────
await setValidation('teacher');
const sctx = await contextFor(STUDENT);
const spage = await sctx.newPage();
const reviewedQuestion = await answerWithPhotoOnly(spage, 1, PHOTO, '[data-review-status="pending"]');
const cur = '[data-exam-step="current"]';
check('teacher : copie en attente — message « أُرسلت إجابتك إلى أستاذك »', await spage.locator(`${cur} [data-review-status="pending"]`).count() === 1);
check('teacher : aucun corrigé type tant que l\'enseignant n\'a pas jugé', await spage.locator(`${cur} [data-solution-panel]`).count() === 0);
check('teacher : ni auto-évaluation', await spage.locator(`${cur} [data-self-mark]`).count() === 0);
check('teacher : la photo est verrouillée avec la réponse', await spage.locator(`${cur} [data-answer-images-locked]`).count() === 1 && await spage.locator(`${cur} [data-remove-image]`).count() === 0);
check('teacher : « التالي » reste ouvert (l\'élève continue)', await spage.locator('[data-next]').first().isEnabled());
await spage.screenshot({ path: `${SHOTS}/image-answer-pending.png`, fullPage: true });

// ── 3. L'enseignant corrige ───────────────────────────────────────────────────
const tctx = await contextFor(TEACHER);
const tpage = await tctx.newPage();
await tpage.goto(`${B}/enseignant/tashih`, { waitUntil: 'domcontentloaded' });
await tpage.waitForSelector('[data-review-queue]', { timeout: 60000 });
await tpage.waitForTimeout(1200);
check('menu : pastille du nombre de copies en attente', await tpage.locator('[data-nav-badge="reviews"]').count() > 0);
const item = tpage.locator('[data-review-item]').first();
check('file : la copie de l\'élève est là, avec sa photo', await tpage.locator('[data-review-item]').count() >= 1 && await item.locator('[data-answer-image]').count() >= 1);
check('file : l\'énoncé de l\'étape est relu dans le contenu', (await item.innerText()).length > 40);
await item.locator('[data-answer-image]').first().click();
await tpage.waitForSelector('[data-image-viewer]');
await tpage.locator('[data-annotate-image]').click();
await tpage.waitForSelector('[data-annotation-canvas]:not(.hidden)', { timeout: 15000 });
await tpage.waitForTimeout(400);
const box = await tpage.locator('[data-annotation-canvas]').boundingBox();
await tpage.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.3);
await tpage.mouse.down();
for (let i = 1; i <= 10; i += 1) await tpage.mouse.move(box.x + box.width * (0.2 + i * 0.05), box.y + box.height * (0.3 + (i % 2) * 0.1));
await tpage.mouse.up();
check('annotation : « احفظ » s\'ouvre après un trait', await tpage.locator('[data-annotation-save]').isEnabled());
await tpage.locator('[data-annotation-save]').click();
await tpage.waitForSelector('[data-annotation-editor]', { state: 'detached', timeout: 15000 });
await tpage.waitForTimeout(800);
check('annotation : la vignette devient « مصحّحة »', await item.locator('[data-image-annotated]').count() >= 1);
await item.locator('[data-review-verdict="correct"]').click();
await item.locator('[data-review-comment-input]').fill('عمل جيّد، النتيجة صحيحة.');
await tpage.screenshot({ path: `${SHOTS}/image-answer-teacher-queue.png`, fullPage: true });
const before = await tpage.locator('[data-review-item]').count();
await item.locator('[data-review-send]').click();
await tpage.waitForTimeout(1500);
check('file : la copie jugée quitte la file', await tpage.locator('[data-review-item]').count() === before - 1);

// ── 4. La cloche de l'élève et la correction en lecture seule ────────────────
await spage.goto(`${B}/espace`, { waitUntil: 'domcontentloaded' });
await spage.waitForSelector('[data-notification-bell]', { timeout: 60000 });
await spage.waitForTimeout(1500);
const bell = spage.locator('[data-notification-bell]').first();
check('cloche : une notification non lue', await spage.locator('[data-unread-count]').count() >= 1);
await bell.click();
await spage.waitForSelector('[data-notification-panel]');
await spage.locator('[data-notification]').first().click();
await spage.waitForSelector('[data-answer-review-page]', { timeout: 15000 });
await spage.waitForTimeout(1500);
check('cloche → /espace/tashih/:id', /\/espace\/tashih\/\d+/.test(spage.url()));
check('correction : EXACTEMENT l\'étape corrigée', await spage.locator(`[data-reviewed-step="${reviewedQuestion}"]`).count() === 1);
check('correction : verdict « صحيحة » et commentaire', await spage.locator('[data-review-status="correct"]').count() >= 1 && (await spage.locator('[data-review-comment]').first().innerText()).includes('عمل جيّد'));
check('correction : photo annotée par l\'enseignant', await spage.locator('[data-reviewed-step] [data-image-annotated]').count() >= 1);
check('correction : corrigé type ouvert', await spage.locator('[data-reviewed-step] [data-solution-body]').count() === 1);
check('correction : lecture seule (aucun champ, aucun bouton تحقّق)', await spage.locator('[data-answer-review-page] [data-validate], [data-answer-review-page] math-field').count() === 0);
await spage.waitForFunction(() => document.querySelectorAll('[data-unread-count]').length === 0, null, { timeout: 10000 }).catch(() => {});
check('cloche : plus de non lue (toutes les cloches montées)', await spage.locator('[data-unread-count]').count() === 0);
await spage.screenshot({ path: `${SHOTS}/image-answer-review-page.png`, fullPage: true });

// ── 6. Téléphone 360 px ──────────────────────────────────────────────────────
const mctx = await contextFor(STUDENT, { mobile: true });
const mpage = await mctx.newPage();
await mpage.goto(spage.url(), { waitUntil: 'domcontentloaded' });
await mpage.waitForSelector('[data-answer-review-page]', { timeout: 15000 });
await mpage.waitForTimeout(1000);
check('360 px : correction sans défilement horizontal', await noHorizontalScroll(mpage));
await mpage.screenshot({ path: `${SHOTS}/image-answer-review-mobile.png`, fullPage: true });
const mtctx = await contextFor(TEACHER, { mobile: true });
const mtpage = await mtctx.newPage();
await mtpage.goto(`${B}/enseignant/tashih`, { waitUntil: 'domcontentloaded' });
await mtpage.waitForSelector('[data-review-queue]', { timeout: 15000 });
check('360 px : file de l\'enseignant sans défilement horizontal', await noHorizontalScroll(mtpage));

// ── 5. L'élève redevenu « مستقل » ─────────────────────────────────────────────
await setValidation('self');
const s2 = await (await contextFor(STUDENT)).newPage();
await answerWithPhotoOnly(s2, 1, PHOTO, '[data-self-mark]');
await s2.screenshot({ path: `${SHOTS}/image-answer-self-before.png`, fullPage: true });
check('مستقل : le corrigé type s\'ouvre après la photo', await s2.locator(`${cur} [data-image-self-check] [data-solution-panel], ${cur} [data-self-check] [data-solution-panel]`).count() >= 1);
check('مستقل : « مطابق / غير مطابق » proposé', await s2.locator(`${cur} [data-self-mark="correct"]`).count() === 1);
await s2.locator(`${cur} [data-self-mark="incorrect"]`).click();
await s2.waitForTimeout(1200);
// La note enregistrée se voit de deux façons selon l'étape : sur une « بيّن أن » (selfCheck), le choix
// reste affiché et pressé ; sur une étape à valeur (rational…), les boutons cèdent la place au verdict
// « ليس بعد » (le même que pour une réponse saisie), corrigé type à côté.
check('مستقل : la note est enregistrée', await s2.locator(`${cur} [data-self-mark="incorrect"][aria-pressed="true"]`).count() === 1
  || (await s2.locator(`${cur} [data-image-self-check]`).count() === 0 && await s2.locator(`${cur} [data-feedback="incorrect"]`).count() === 1));
await s2.screenshot({ path: `${SHOTS}/image-answer-self.png`, fullPage: true });

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} PASS`);
process.exit(failed.length ? 1 : 0);
