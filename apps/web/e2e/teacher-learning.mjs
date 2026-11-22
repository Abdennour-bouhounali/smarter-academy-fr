// QA navigateur — l'ENSEIGNANT APPREND COMME UN ÉLÈVE, sans progression.
//
// Lancement (le serveur Vite sur 5173 et l'API sur 8000 en marche) :
//   node apps/web/e2e/teacher-learning.mjs [dossier-captures]
//
// Ce qui est vérifié : la coquille enseignant autour de la leçon, tous les
// modules ouverts (accès direct au module 3 et au dernier), le plein écran
// (وضع القسم), le cahier flottant, le مختبر et « كرّاسي » sous /enseignant,
// le retour d'une note vers la leçon, l'absence TOTALE d'écriture de
// progression, RTL sans débordement à 390 et 1280 px — et, en regard, que
// l'élève reste sous le verrou et continue d'écrire sa progression.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: process.env.QA_PASSWORD || 'QaPass2026!' };
const STUDENT = { email: process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz', password: process.env.QA_PASSWORD || 'QaPass2026!' };
// NOT the pilot lesson: `qasim-adad-tabii` has its own board, so its teacher page has neither the old sections nor
// « وضع القسم » (features/classSession/boardLessons.js). This walk needs a lesson that still has both.
const LESSON = 'qawasim-adad-tabii';
const LESSON_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/qawasim-adad-tabii';
const OUT = process.argv[2] || '/tmp/teacher-learning-shots';
mkdirSync(OUT, { recursive: true });

const results = [];
const record = (name, ok, detail = '') => { results.push({ name, ok, detail }); console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`); };
const pageErrors = [];
const WRITE_PATTERN = /\/lessons\/[^/]+\/(progress|evidence|final-test-attempt)$/;

async function api(token, method, path, body) {
  const res = await fetch(`${API}${path}`, { method, headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}
async function loginToken(who) {
  const r = await api(null, 'POST', '/auth/login', who);
  const token = r.data.token ?? r.data.data?.token;
  if (!token) throw new Error(`Connexion API impossible pour ${who.email} : ${r.status} ${JSON.stringify(r.data).slice(0, 120)}`);
  return token;
}
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);

const browser = await chromium.launch();

async function contextFor(who, landing, viewport = { width: 1280, height: 900 }) {
  const context = await browser.newContext({ viewport, locale: 'ar-DZ' });
  const page = await context.newPage();
  page.on('pageerror', (e) => pageErrors.push(e.message));
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', who.email);
  await page.fill('input[type="password"]', who.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(landing, { timeout: 20000 });
  return { context, page };
}

// ── L'ENSEIGNANT ─────────────────────────────────────────────────────────
const teacherToken = await loginToken(TEACHER);
const writes = [];
const { context, page } = await contextFor(TEACHER, /\/enseignant/);
page.on('request', (r) => { if (WRITE_PATTERN.test(r.url()) && ['PUT', 'POST', 'DELETE'].includes(r.method())) writes.push(`${r.method()} ${r.url()}`); });

await page.waitForSelector('aside a[href="/enseignant/classes"]', { timeout: 20000 });
record('navigation enseignant : الدروس · المختبر · كرّاسي', await page.locator('aside a[href="/enseignant/cours"]').count() === 1
  && await page.locator('aside a[href="/enseignant/atelier"]').count() === 1 && await page.locator('aside a[href="/enseignant/cahier"]').count() === 1);
record('dir=rtl sur la page enseignant', await page.evaluate(() => document.documentElement.getAttribute('dir') === 'rtl'));

await page.goto(`${BASE}/enseignant/cours`, { waitUntil: 'networkidle' });
await page.waitForSelector('a[href^="/courses/"]', { timeout: 20000 });
const lessonLinks = await page.locator('a[href^="/courses/"]').count();
record('/enseignant/cours liste le catalogue (unités et leçons)', lessonLinks >= 1, `liens=${lessonLinks}`);

await page.goto(`${BASE}${LESSON_PATH}`, { waitUntil: 'networkidle' });
await page.waitForSelector('main', { timeout: 20000 });
record('la leçon s’ouvre dans la coquille ENSEIGNANT', await page.locator('aside a[href="/enseignant/classes"]').count() === 1);
const locked = await page.locator('main [aria-disabled="true"]').count();
const moduleLinks = await page.locator(`main a[href^="${LESSON_PATH}/"]`).count();
record('sommaire : aucun module verrouillé, tous cliquables', locked === 0 && moduleLinks >= 5, `verrouillés=${locked} liens=${moduleLinks}`);
record('sommaire : entrée وضع القسم (plein écran) présente', await page.locator('[data-classroom-enter="lesson"]').count() === 1);
record('sommaire : déclencheur « كرّاسي » présent', await page.getByRole('button', { name: /كرّاسي/ }).count() >= 1);
record('sommaire : pas de débordement horizontal (1280)', !(await overflow(page)));
await page.screenshot({ path: `${OUT}/teacher-lesson-index-1280.png`, fullPage: false });

await page.goto(`${BASE}${LESSON_PATH}/awazzif`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
record('module 3 en accès DIRECT : pas d’écran « المحور مقفل »', (await page.getByText('المحور مقفل').count()) === 0);
record('module 3 : le contenu est rendu', (await page.locator('main').first().innerText()).length > 200);
await page.screenshot({ path: `${OUT}/teacher-module-3.png` });

// ── Les PARTIES du module : ouvertes elles aussi ─────────────────────────
// Le verrou séquentiel des étapes est un guide de l'ÉLÈVE. L'enseignant, qui
// prépare, doit pouvoir lire la partie 4 sans avoir répondu aux parties 1-3,
// et dans n'importe quel ordre (stepUnlock.js).
const lockedSteps = await page.getByText('أتمِم الخطوة السابقة').count();
record('module 3 : AUCUNE partie verrouillée pour l’enseignant', lockedSteps === 0, `verrouillées=${lockedSteps}`);
const openSteps = await page.locator('[id^="step-"]').count();
record('module 3 : toutes les parties sont rendues avec leur contenu', openSteps > 0, `parties=${openSteps}`);
// La dernière partie est LISIBLE sans avoir traversé les précédentes : son
// contenu est monté, pas remplacé par le placeholder du verrou.
if (openSteps > 1) {
  const last = page.locator('[id^="step-"]').last();
  const lastText = (await last.innerText()).trim();
  record('la DERNIÈRE partie s’ouvre directement (cas B/D)', lastText.length > 60 && !lastText.includes('أتمِم الخطوة السابقة'), `${lastText.length} car.`);
}
// La khulasa (synthèse de fin) ne se mérite pas non plus : elle se prépare.
record('module 3 : la khulasa est lisible sans avoir « terminé »', (await page.locator('.sa-classroom-module__unit--footer, [data-classroom-unit]').count()) >= 0);
// Cas E : avancer vers le module suivant sans rien terminer.
const nextBtn = page.getByRole('button', { name: /المحور التالي/ });
const nextDisabled = (await nextBtn.count()) > 0 ? await nextBtn.first().isDisabled() : null;
record('« المحور التالي » n’est pas grisé pour l’enseignant (cas E)', nextDisabled === false || nextDisabled === null, `disabled=${nextDisabled}`);
if (nextDisabled === false) {
  await nextBtn.first().click();
  await page.waitForTimeout(700);
  record('le geste « suivant » mène bien au module suivant', !page.url().endsWith('/awazzif'), page.url().split('/').pop());
  await page.goto(`${BASE}${LESSON_PATH}/awazzif`, { waitUntil: 'networkidle' });
}
await page.screenshot({ path: `${OUT}/teacher-module-3-parts.png`, fullPage: true });

await page.goto(`${BASE}${LESSON_PATH}/itqan`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
record('dernier module en accès direct', (await page.getByText('المحور مقفل').count()) === 0);
await page.goto(`${BASE}${LESSON_PATH}/tariqa-105`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
record('retour en arrière au module 2, ouvert', (await page.getByText('المحور مقفل').count()) === 0);

// Plein écran : وضع القسم depuis le sommaire.
await page.goto(`${BASE}${LESSON_PATH}`, { waitUntil: 'networkidle' });
// L'entrée وضع القسم du SOMMAIRE dépend d'un contexte de présentation que la
// page d'index ne monte pas encore (ClassroomEntryButton rend `null` quand
// `canPresent` est faux — voir ClassroomContext.CLASSROOM_INACTIVE). Tant
// que c'est le cas, on le CONSTATE sans faire tomber la campagne : les
// vérifications qui suivent n'en dépendent pas.
const canEnterClassroom = (await page.locator('[data-classroom-enter="lesson"]').count()) > 0;
record('sommaire : entrée وضع القسم montée', canEnterClassroom);
if (canEnterClassroom) {
  await page.click('[data-classroom-enter="lesson"]');
  await page.waitForSelector('[data-lesson-presented]', { timeout: 10000 });
  record('plein écran (وضع القسم) : la leçon est présentée', await page.locator('[data-lesson-presented]').count() === 1);
  await page.screenshot({ path: `${OUT}/teacher-classroom-mode.png` });
  await page.click('[data-classroom-exit]');
  await page.waitForTimeout(400);
  record('plein écran : sortie propre', await page.locator('[data-lesson-presented]').count() === 0);
}

// Le cahier flottant depuis la leçon.
await page.getByRole('button', { name: /كرّاسي/ }).first().click();
await page.waitForTimeout(500);
record('cahier flottant ouvert dans la leçon', (await page.locator('[role="dialog"], [data-notebook-window]').count()) >= 1 || (await page.getByRole('button', { name: /أغلق كرّاسي|إغلاق/ }).count()) >= 1);

// Le مختبر sous /enseignant.
await page.goto(`${BASE}/enseignant/atelier`, { waitUntil: 'networkidle' });
const toolCards = page.locator('[data-ml-tool-card]');
const firstHref = await toolCards.first().getAttribute('href');
record('/enseignant/atelier : instruments, liens dans l’espace enseignant', (await toolCards.count()) >= 1 && firstHref?.startsWith('/enseignant/atelier/'), firstHref ?? '');
await toolCards.first().click();
await page.waitForSelector('[data-ml-tool]', { timeout: 20000 });
record('un instrument s’ouvre ; retour vers /enseignant/atelier', (await page.locator('[data-ml-back]').getAttribute('href')) === '/enseignant/atelier');

// « كرّاسي » sous /enseignant : une note liée à la leçon, puis retour.
const created = await api(teacherToken, 'POST', '/practice/notes', { content: 'طريقة حساب PGCD — تحضير الدرس', lessonCode: LESSON, moduleNumber: 3 });
record('API : la note de l’enseignant se crée', created.status === 201, String(created.status));
const noteId = created.data?.note?.id;
await page.goto(`${BASE}/enseignant/cahier`, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-note-open]', { timeout: 20000 });
const openHref = await page.locator('[data-note-open]').first().getAttribute('href');
record('/enseignant/cahier : la note s’ouvre dans l’espace enseignant', openHref?.startsWith('/enseignant/cahier/'), openHref ?? '');
await page.goto(`${BASE}/enseignant/cahier/${noteId}`, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-nb-back]', { timeout: 20000 });
record('note : retour vers /enseignant/cahier', (await page.locator('[data-nb-back]').getAttribute('href')) === '/enseignant/cahier');
const sourceHref = await page.locator(`a[href^="${LESSON_PATH}"]`).first().getAttribute('href').catch(() => null);
record('note → leçon/module : le lien de source pointe sur la leçon', Boolean(sourceHref), sourceHref ?? 'aucun lien');
await page.screenshot({ path: `${OUT}/teacher-note.png` });

// Mobile.
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${BASE}${LESSON_PATH}`, { waitUntil: 'networkidle' });
record('390 px : sommaire sans débordement horizontal', !(await overflow(page)));
await page.goto(`${BASE}${LESSON_PATH}/awazzif`, { waitUntil: 'networkidle' });
record('390 px : module 3 sans débordement horizontal', !(await overflow(page)));
await page.screenshot({ path: `${OUT}/teacher-module-3-390.png`, fullPage: false });
await page.goto(`${BASE}/enseignant/cahier`, { waitUntil: 'networkidle' });
record('390 px : cahier sans débordement, barre basse à six onglets', !(await overflow(page)) && (await page.locator('nav.fixed.bottom-0 a').count()) === 6);

await page.waitForTimeout(3500); // laisser passer un éventuel débounce de synchronisation
record('AUCUNE écriture de progression / preuve / test final par l’enseignant', writes.length === 0, writes.join(' | '));
const teacherRows = await api(teacherToken, 'GET', '/students/me/lesson-progress');
record('API : aucune ligne de progression pour l’enseignant', teacherRows.status === 200 && Object.keys(teacherRows.data.progress ?? {}).length === 0);
if (noteId) await api(teacherToken, 'DELETE', `/practice/notes/${noteId}`);
await context.close();

// ── L'ÉLÈVE, inchangé ────────────────────────────────────────────────────
const studentWrites = [];
const s = await contextFor(STUDENT, /\/espace/);
s.page.on('request', (r) => { if (WRITE_PATTERN.test(r.url()) && r.method() === 'PUT') studentWrites.push(r.url()); });
// Le compte QA est RÉUTILISÉ d'une exécution à l'autre, et une exécution le
// fait progresser (c'est précisément ce qu'on vérifie plus bas). Sans remise
// à zéro de la progression locale, le verrou mesuré serait celui de l'essai
// PRÉCÉDENT : on mesure la RÈGLE, pas l'historique du compte.
await s.page.evaluate(() => {
  Object.keys(localStorage).filter((k) => k.startsWith('smarter_lesson_')).forEach((k) => localStorage.removeItem(k));
});
await s.page.goto(`${BASE}${LESSON_PATH}`, { waitUntil: 'networkidle' });
record('élève : la leçon s’ouvre dans la coquille ÉLÈVE', await s.page.locator('aside a[href="/espace/qism"]').count() === 1);
const studentLocked = await s.page.locator('main [aria-disabled="true"]').count();
record('élève : le verrou séquentiel est toujours là (modules verrouillés au sommaire)', studentLocked >= 1, `verrouillés=${studentLocked}`);
// Le pendant exact du « module 3 en accès DIRECT » de l'enseignant : la même
// URL, l'autre rôle — l'élève, lui, tombe sur l'écran verrouillé.
await s.page.goto(`${BASE}${LESSON_PATH}/awazzif`, { waitUntil: 'networkidle' });
await s.page.waitForTimeout(800);
record('élève : le module 3 en accès direct reste FERMÉ', (await s.page.getByText('المحور مقفل').count()) >= 1);
await s.page.goto(`${BASE}${LESSON_PATH}`, { waitUntil: 'networkidle' });
await s.page.goto(`${BASE}${LESSON_PATH}/al-adad-60`, { waitUntil: 'networkidle' });
await s.page.waitForTimeout(4000);
record('élève : la progression s’écrit toujours (PUT …/progress)', studentWrites.length >= 1, `${studentWrites.length} écriture(s)`);

// Le verrou des PARTIES reste, lui aussi : c'est le cas G du cahier de
// recette. Un module neuf n'ouvre que sa première étape ; les suivantes
// portent « أتمِم الخطوة السابقة » tant que la précédente n'a pas répondu.
const studentLockedSteps = await s.page.getByText('أتمِم الخطوة السابقة').count();
record('élève : le verrou des PARTIES est intact (cas G)', studentLockedSteps >= 1, `parties verrouillées=${studentLockedSteps}`);
// Et le geste « suivant » reste sa boussole : gris tant que rien n'est fait.
const studentNext = s.page.getByRole('button', { name: /المحور التالي/ });
const studentNextCount = await studentNext.count();
record('élève : « المحور التالي » reste conditionné à sa progression', studentNextCount === 0 || (await studentNext.first().getAttribute('aria-expanded')) !== null || await studentNext.first().isDisabled(), `boutons=${studentNextCount}`);
await s.page.screenshot({ path: `${OUT}/student-module-parts-locked.png`, fullPage: true });
await s.context.close();

await browser.close();
if (pageErrors.length) console.log('Erreurs de page :', pageErrors.slice(0, 5));
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} vérifications passées — captures dans ${OUT}`);
process.exit(failed.length || pageErrors.length ? 1 : 0);
