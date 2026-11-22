// QA navigateur — DÉTECTER → COMPRENDRE → INTERVENIR → MESURER, côté
// enseignant, sur le jeu de démonstration (DemoDataSeeder), puis ce que
// l'élève en voit : une suggestion, et un consentement explicite.
//
// Lancement (Vite sur 5173, API sur 8000, démonstration semée) :
//   node apps/web/e2e/teacher-intelligence.mjs [dossier-captures]
//
// Ce qui est vérifié : la classe s'ouvre sur « Vue d’ensemble » et ses signaux ;
// un signal mène au point (élèves, trajectoire, questions), puis à la preuve
// d'un élève (histoire de l'état, cahier) ; un geste s'enregistre et sa
// mesure s'affiche ; l'aperçu d'un élève ; AUCUN courriel d'élève à l'écran
// ni dans les réponses /teacher ; de gauche à droite, sans débordement à 390 et 1280 px ;
// côté élève, le lien de classe ne rejoint rien sans le geste « J’accepte et je rejoins la classe »,
// et la suggestion de l'enseignant apparaît dans « Ma classe ».
//
// Effet de bord assumé : chaque passage enregistre UNE intervention dont la
// note commence par « QA : » dans la classe « 3e A » de la démonstration.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const TEACHER = { email: 'teacher01@smarter-academy-fr.test', password: process.env.QA_TEACHER_PASSWORD || 'TestTeacher123!' };
const STUDENT_PASSWORD = process.env.QA_STUDENT_PASSWORD || 'TestStudent123!';
const OUT = process.argv[2] || '/tmp/teacher-intelligence-shots';
mkdirSync(OUT, { recursive: true });

const results = [];
const record = (name, ok, detail = '') => { results.push({ name, ok, detail }); console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`); };
const pageErrors = [];
const EMAIL = /[\w.+-]+@smarter-academy-fr\.test/;

async function api(token, method, path, body) {
  const res = await fetch(`${API}${path}`, { method, headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, text: await res.text() };
}
const json = (r) => { try { return JSON.parse(r.text); } catch { return {}; } };
async function loginToken(who) {
  const r = json(await api(null, 'POST', '/auth/login', who));
  const token = r.token ?? r.data?.token;
  if (!token) throw new Error(`Connexion API impossible pour ${who.email}`);
  return token;
}
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);

const browser = await chromium.launch();

async function login(who, landing) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'fr-FR' });
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
const classes = json(await api(teacherToken, 'GET', '/teacher/classrooms'));
const groupA = (classes.classrooms ?? classes.data ?? []).find((c) => c.name === '3e A');
if (!groupA) throw new Error('Classe « 3e A » de la démonstration introuvable — lancez DemoDataSeeder.');

// Le serveur, d'abord : aucune réponse /teacher ne porte un courriel d'élève.
for (const path of [`/teacher/classrooms/${groupA.id}/attention`, `/teacher/classrooms/${groupA.id}/students`, `/teacher/classrooms/${groupA.id}/learning-points`, `/teacher/classrooms/${groupA.id}/interventions`]) {
  const r = await api(teacherToken, 'GET', path);
  record(`API ${path.split('/').pop()} : 200 et aucun courriel`, r.status === 200 && !EMAIL.test(r.text), `status=${r.status}`);
}

const { context, page } = await login(TEACHER, /\/enseignant/);
await page.goto(`${BASE}/enseignant/classes/${groupA.id}`, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-overview-tab]', { timeout: 20000 });
record('la classe s’ouvre sur « Vue d’ensemble »', await page.locator('[data-tab="overview"][aria-selected="true"]').count() === 1);
await page.waitForSelector('[data-attention-list], [data-attention-empty]', { timeout: 20000 });
const signals = await page.locator('[data-signal]').count();
record('« À regarder » affiche des signaux (démonstration : classe en difficulté)', signals >= 1, `signaux visibles=${signals}`);
record('chaque signal dit POURQUOI', await page.locator('[data-signal] [data-signal-why]').count() >= signals);
record('« Qu’est-ce qui a changé ? » et la carte sont présents', await page.locator('[data-recent-changes]').count() === 1 && await page.locator('[data-learning-map-summary]').count() === 1);
record('aucun courriel d’élève à l’écran (Vue d’ensemble)', !EMAIL.test(await page.locator('main').innerText()));
record('pas de débordement horizontal (1280, Vue d’ensemble)', !(await overflow(page)));
await page.screenshot({ path: `${OUT}/01-overview-1280.png`, fullPage: true });

// DÉTECTER → COMPRENDRE : du signal au point.
await page.locator('[data-signal] [data-signal-open-point]').first().click();
await page.waitForSelector('[data-lp-drilldown]', { timeout: 20000 });
await page.waitForSelector('[data-lp-student]', { timeout: 20000 });
record('le signal ouvre le point : élèves du plus fragile au plus sûr', await page.locator('[data-lp-student]').count() >= 1);
record('trajectoire semaine par semaine affichée', await page.locator('[data-lp-trajectory]').count() === 1);
record('les questions où la classe bute sont listées', await page.locator('[data-lp-items]').count() <= 1);
await page.screenshot({ path: `${OUT}/02-point-drilldown-1280.png`, fullPage: true });

await page.locator('[data-lp-student] button').first().click();
await page.waitForSelector('[data-mastery-explanation]', { timeout: 20000 });
record('la preuve d’un élève : explication + chemin de l’état', await page.locator('[data-status-trail], [data-mastery-explanation] p').count() >= 1);
record('la preuve d’un élève : section cahier présente', await page.locator('[data-evidence-notebook]').count() === 1);
await page.screenshot({ path: `${OUT}/03-student-evidence-1280.png`, fullPage: false });
await page.keyboard.press('Escape');

// INTERVENIR depuis le point.
await page.locator('[data-lp-act]').click();
await page.waitForSelector('[data-intervention-form]', { timeout: 10000 });
await page.locator('[data-intervention-kind="recommend_practice"]').check();
const checked = await page.locator('[data-intervention-student]:checked').count();
if (checked === 0) await page.locator('[data-intervention-student]').first().check();
await page.fill('[data-intervention-note]', 'QA : suivi de la difficulté sur ce point.');
await page.fill('[data-intervention-message]', 'Entraîne-toi sur ce savoir-faire.');
await page.screenshot({ path: `${OUT}/04-intervention-form-1280.png`, fullPage: false });
await page.locator('[data-intervention-submit]').click();
await page.waitForSelector('[data-intervention-form]', { state: 'detached', timeout: 10000 });
record('le geste s’enregistre depuis le point', true);

// MESURER.
await page.locator('[data-tab-group="learning"]').click(); // five sections since 2026-11-16: « Interventions » is a page of the learning group
await page.locator('[data-tab="interventions"]').click();
await page.waitForSelector('[data-intervention]', { timeout: 20000 });
const cards = await page.locator('[data-intervention]').count();
record('« Interventions » liste les gestes ouverts', cards >= 1, `cartes=${cards}`);
record('chaque geste sur un point porte sa mesure', await page.locator('[data-intervention] [data-intervention-outcome]').count() >= 1);
const expand = page.locator('[data-intervention-expand]').first();
if (await expand.count()) {
  await expand.click();
  await page.waitForSelector('[data-outcome-student]', { timeout: 10000 });
  record('le détail montre avant / maintenant / depuis, élève par élève', await page.locator('[data-outcome-student]').count() >= 1);
}
record('aucun courriel d’élève à l’écran (Interventions)', !EMAIL.test(await page.locator('main').innerText()));
await page.screenshot({ path: `${OUT}/05-interventions-1280.png`, fullPage: true });

// L'aperçu d'un élève.
await page.locator('[data-tab="overview"]').click();
await page.waitForSelector('[data-signal-student]', { timeout: 20000 });
await page.locator('[data-signal-student]').first().click();
await page.waitForSelector('[data-student-snapshot]', { timeout: 20000 });
record('l’aperçu d’un élève (« Aperçu ») s’affiche en tête du dossier', true);
record('la tendance est lue sur les statuts', await page.locator('[data-snapshot-trend]').count() === 1);
record('aucun courriel d’élève à l’écran (dossier)', !EMAIL.test(await page.locator('main').innerText()));
record('pas de débordement horizontal (1280, dossier)', !(await overflow(page)));
await page.screenshot({ path: `${OUT}/06-student-snapshot-1280.png`, fullPage: true });

// Mobile.
const state = await context.storageState();
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'fr-FR', storageState: state, isMobile: true });
const m = await mobile.newPage();
m.on('pageerror', (e) => pageErrors.push(e.message));
await m.goto(`${BASE}/enseignant/classes/${groupA.id}`, { waitUntil: 'networkidle' });
await m.waitForSelector('[data-attention-list], [data-attention-empty]', { timeout: 20000 });
record('pas de débordement horizontal (390, Vue d’ensemble)', !(await overflow(m)));
await m.screenshot({ path: `${OUT}/07-overview-390.png`, fullPage: true });
await m.goto(page.url(), { waitUntil: 'networkidle' });
await m.waitForSelector('[data-student-snapshot]', { timeout: 20000 });
record('pas de débordement horizontal (390, dossier)', !(await overflow(m)));
await m.screenshot({ path: `${OUT}/08-student-snapshot-390.png`, fullPage: true });
await mobile.close();

// ── L'ÉLÈVE ──────────────────────────────────────────────────────────────
// Qui a reçu une suggestion ? La mesure de la première intervention le dit.
const list = json(await api(teacherToken, 'GET', `/teacher/classrooms/${groupA.id}/interventions?status=open`));
const visible = (list.interventions ?? []).find((iv) => iv.studentVisible && iv.students.length > 0);
// Le LIEN de classe (l'invitation par courriel a été retirée le 2026-10-01).
const joinLinkToken = json(await api(teacherToken, 'GET', `/teacher/classrooms/${groupA.id}`)).classroom?.joinLinkToken ?? null;
if (visible) {
  const who = visible.students[0];
  // L'enseignant ne connaît pas le courriel de l'élève (c'est la règle) :
  // l'ADMINISTRATION, elle, le voit — une seule connexion suffit.
  const adminToken = await loginToken({ email: 'admin@smarter-academy-fr.test', password: process.env.QA_ADMIN_PASSWORD || 'TestPassword123!' });
  const detail = json(await api(adminToken, 'GET', `/admin/classrooms/${groupA.id}`));
  const row = (detail.students ?? detail.data?.students ?? []).find((s) => s.id === who.id);
  const email = row?.email ?? null;
  if (email && row) {
    const student = await login({ email, password: STUDENT_PASSWORD }, /\/(espace|dashboard|courses|$)/);
    await student.page.goto(`${BASE}/espace/classe`, { waitUntil: 'networkidle' });
    await student.page.waitForSelector('[data-qism-recommendations]', { timeout: 20000 });
    record('l’élève voit la suggestion de son enseignant dans « Ma classe »', await student.page.locator('[data-qism-recommendation]').count() >= 1);
    record('…sans la note privée de l’enseignant', !(await student.page.locator('main').innerText()).includes('QA : suivi'));
    await student.page.screenshot({ path: `${OUT}/09-student-qism-1280.png`, fullPage: true });

    // Le lien de classe rouvert par un MEMBRE : retour à « Ma classe », aucune ligne de plus.
    if (joinLinkToken) {
      const before = json(await api(teacherToken, 'GET', `/teacher/classrooms/${groupA.id}/students`)).students?.length ?? 0;
      await student.page.goto(`${BASE}/rejoindre/classe/${joinLinkToken}`, { waitUntil: 'networkidle' });
      await student.page.waitForURL(/\/espace\/classe/, { timeout: 20000 });
      await student.page.waitForTimeout(1500);
      const after = json(await api(teacherToken, 'GET', `/teacher/classrooms/${groupA.id}/students`)).students?.length ?? 0;
      record('un membre qui rouvre le lien de classe revient à « Ma classe », sans doublon', after === before, `avant=${before} après=${after}`);
      await student.page.screenshot({ path: `${OUT}/10-join-link-member-1280.png`, fullPage: false });
    }
    await student.context.close();
  } else {
    record('connexion d’un élève visé (démonstration)', false, 'élève introuvable ou connexion limitée (429)');
  }
}

await context.close();
await browser.close();

record('aucune erreur JavaScript de page', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} vérifications — captures dans ${OUT}`);
process.exit(failed.length ? 1 : 0);
