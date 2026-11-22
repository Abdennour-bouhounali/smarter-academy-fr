// QA — le LIEN DE CLASSE (« رابط الانضمام ») et le code, de bout en bout.
//
//   A. l'enseignant crée un قسم, voit le LIEN au-dessus du CODE, copie le lien ;
//      un visiteur l'ouvre, consent, s'inscrit, vérifie son adresse → il est
//      dans le قسم, sur « قسمي », sans avoir tapé de code
//   B. un élève existant ouvre le lien, consent, se connecte → rejoint → قسمي
//   C. le même élève rouvre le lien → aucun doublon, retour à قسمي
//   D. un élève rejoint par l'ancien CODE → même adhésion
//   +  adhésions fermées, lien renouvelé, lien invalide ; desktop et mobile
//
// Lancement (Vite sur 5173 et l'API sur 8000, comptes QA importés, migration
// 2026_10_01_000002 appliquée) :
//   node apps/web/e2e/class-join-link.mjs
//
// Appels à /auth/login + /auth/register (limités ENSEMBLE à 6/min) : 4. Les
// liens de vérification d'adresse sont signés par `php artisan tinker`
// (EmailVerificationLink::for), comme le courriel les porterait. À la fin :
// le قسم de test est archivé et les deux comptes créés sont supprimés.
// Captures dans /tmp/class-join-link-qa.
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const STUDENT = { email: process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/class-join-link-qa';
const API_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../api');
mkdirSync(OUT, { recursive: true });

const STAMP = Date.now().toString(36);
const NEW_A = `qa-link-a-${STAMP}@example.dz`;
const NEW_D = `qa-link-d-${STAMP}@example.dz`;
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

let passed = 0;
let failed = 0;
const check = (ok, label) => {
  if (ok) { passed += 1; console.log(`  ✓ ${label}`); } else { failed += 1; console.log(`  ✗ ${label}`); }
};

async function api(token, path, init = {}) {
  const res = await fetch(`${API}${path}`, { ...init, headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers || {}) } });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

async function loginToken(who) {
  const { status, data } = await api(null, '/auth/login', { method: 'POST', body: JSON.stringify(who) });
  if (!data.token) throw new Error(`login ${who.email}: ${status}`);
  return data.token;
}

function tinker(code) {
  // APP_URL = l'hôte réel de l'API : la signature d'un lien couvre l'hôte.
  return execFileSync('php', ['artisan', 'tinker', `--execute=${code}`], { cwd: API_DIR, encoding: 'utf8', env: { ...process.env, APP_URL: new URL(API).origin } }).trim();
}

/**
 * Soumettre un formulaire d'authentification. /auth/login et /auth/register
 * partagent une limite de 6/min avec d'autres clients locaux : sur un 429,
 * on attend la fenêtre suivante (même boucle que daily-challenge.mjs).
 */
async function submitAuth(page, endpoint) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = page.waitForResponse((r) => r.url().endsWith(endpoint), { timeout: 15000 }).catch(() => null);
    await page.click('form button[type="submit"]');
    if ((await response)?.status() !== 429) return;
    console.log(`  … 429 sur ${endpoint}, nouvelle tentative dans 65 s`);
    await page.waitForTimeout(65000);
  }
}

/** Le lien que le courriel de vérification porterait. */
const verificationUrl = (email) => tinker(`echo App\\Domain\\Identity\\EmailVerificationLink::for(App\\Models\\User::where('email','${email}')->firstOrFail());`);

async function contextFor(browser, { token = null, viewport = DESKTOP, clipboard = false } = {}) {
  const context = await browser.newContext({ viewport, locale: 'ar-DZ', ...(clipboard ? { permissions: ['clipboard-read', 'clipboard-write'] } : {}) });
  if (token) await context.addInitScript((tk) => { try { localStorage.setItem('token', tk); } catch { /* noop */ } }, token);
  return context;
}

const noHorizontalScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

const teacherToken = await loginToken(TEACHER);
const browser = await chromium.launch();
const errors = [];
const watch = (page) => page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
let classroom = null;

try {
  // ── A. L'enseignant crée un قسم ────────────────────────────────────────
  console.log('\nA1. Enseignant — le lien au-dessus du code');
  const created = await api(teacherToken, '/teacher/classrooms', { method: 'POST', body: JSON.stringify({ name: `قسم الرابط ${STAMP}`, grade: '4am' }) });
  check(created.status === 201, `création du قسم (${created.status})`);
  classroom = created.data.classroom;
  check(/^[A-Za-z0-9]{32}$/.test(classroom?.joinLinkToken ?? ''), 'le قسم naît avec un jeton de 32 symboles');
  const expectedUrl = `${BASE}/rejoindre/classe/${classroom.joinLinkToken}`;

  let copiedUrl = null;
  for (const [label, viewport] of [['desktop', DESKTOP], ['mobile', MOBILE]]) {
    const ctx = await contextFor(browser, { token: teacherToken, viewport, clipboard: true });
    const page = await ctx.newPage();
    watch(page);
    await page.goto(`${BASE}/enseignant/classes/${classroom.id}`, { waitUntil: 'networkidle' });
    const link = page.locator('[data-join-link]');
    const code = page.locator('[data-join-code]');
    await link.waitFor({ timeout: 10000 });
    check((await link.inputValue()) === expectedUrl, `${label} : le champ montre ${expectedUrl.replace(classroom.joinLinkToken, '…')}`);
    const linkBox = await link.boundingBox();
    const codeBox = await code.boundingBox();
    check(linkBox && codeBox && linkBox.y + linkBox.height <= codeBox.y, `${label} : le LIEN est au-dessus du CODE`);
    check((await code.innerText()).trim() === classroom.joinCode, `${label} : le code reste affiché (${classroom.joinCode})`);
    check(linkBox && linkBox.x >= 0 && linkBox.x + linkBox.width <= viewport.width, `${label} : le champ du lien tient dans l’écran`);
    check(await noHorizontalScroll(page), `${label} : pas de défilement horizontal`);
    const copyBtn = page.locator('[data-copy-link]');
    const copyBox = await copyBtn.boundingBox();
    check(copyBox && copyBox.height >= 44, `${label} : bouton « نسخ الرابط » ≥ 44 px (${Math.round(copyBox?.height ?? 0)})`);
    await copyBtn.click();
    const feedback = await page.locator('[data-copy-link]', { hasText: 'تمّ نسخ الرابط' }).waitFor({ timeout: 3000 }).then(() => true).catch(() => false);
    check(feedback, `${label} : retour visible après la copie`);
    copiedUrl = await page.evaluate(() => navigator.clipboard.readText()).catch(() => null);
    check(copiedUrl === expectedUrl, `${label} : le presse-papiers contient le lien`);
    await page.screenshot({ path: `${OUT}/A1-teacher-${label}.png`, fullPage: false });
    await ctx.close();
  }

  // ── A2. Un visiteur ouvre le lien, consent, s'inscrit ───────────────────
  console.log('\nA2. Nouvel élève — lien → inscription → vérification → قسمي');
  const actx = await contextFor(browser, { viewport: MOBILE });
  const apage = await actx.newPage();
  watch(apage);
  await apage.goto(copiedUrl ?? expectedUrl, { waitUntil: 'networkidle' });
  check((await apage.locator('[data-join-link-name]').innerText()).includes(`قسم الرابط ${STAMP}`), 'la page montre le nom du قسم');
  check((await apage.locator('[data-join-link-class]').innerText()).includes('الأستاذ'), 'la page montre l’enseignant');
  check(await apage.locator('[data-qism-sharing]').isVisible(), 'le texte de partage est lu AVANT les boutons');
  check(await noHorizontalScroll(apage), 'mobile : pas de défilement horizontal');
  await apage.screenshot({ path: `${OUT}/A2-join-page-mobile.png`, fullPage: true });
  for (const btn of ['[data-join-link-register]', '[data-join-link-login]']) {
    // Nombre de lignes du LIBELLÉ (et non de la hauteur, qui inclut le padding).
    const lines = await apage.locator(btn).evaluate((el) => {
      // Les lignes du TEXTE seul (l'icône a sa propre boîte, hors compte).
      const tops = new Set();
      for (const node of el.childNodes) {
        if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const r of range.getClientRects()) tops.add(Math.round(r.top));
      }
      return tops.size;
    });
    const height = (await apage.locator(btn).boundingBox())?.height ?? 0;
    check(lines === 1 && height >= 56, `mobile : ${btn} sur une ligne, ${Math.round(height)} px de haut`);
  }
  await apage.click('[data-join-link-register]');
  await apage.waitForURL(/\/register$/);
  check(await apage.locator('[data-class-join-notice]').waitFor({ timeout: 5000 }).then(() => true).catch(() => false), '/register rappelle le قسم à rejoindre');
  await apage.fill('#register-firstName', 'سارة');
  await apage.fill('#register-lastName', 'بن علي');
  await apage.fill('#email', NEW_A);
  await apage.fill('#password', PASSWORD);
  await apage.locator('form input[type="checkbox"]').check();
  await apage.screenshot({ path: `${OUT}/A2-register-mobile.png`, fullPage: true });
  await submitAuth(apage, '/auth/register');
  await apage.waitForURL(/\/verification-email/, { timeout: 10000 });
  check(true, 'inscription → /verification-email');
  const before = tinker(`echo App\\Models\\ClassroomMembership::where('classroom_id', ${classroom.id})->count();`);
  check(before === '0', 'aucune adhésion avant la vérification de l’adresse');
  // Le lien du courriel, ouvert dans le même navigateur.
  await apage.goto(verificationUrl(NEW_A), { waitUntil: 'networkidle' });
  await apage.waitForURL(/\/espace\/qism/, { timeout: 15000 }).catch(() => {});
  check(apage.url().includes('/espace/qism'), `après la vérification : directement « قسمي » (${apage.url().replace(BASE, '')})`);
  check((await apage.locator('[data-qism-joined]').innerText({ timeout: 8000 }).catch(() => '')).includes(`قسم الرابط ${STAMP}`), '« انضممت إلى القسم … »');
  check((await apage.locator('[data-qism-current]').innerText({ timeout: 8000 }).catch(() => '')).includes(`قسم الرابط ${STAMP}`), 'le قسم figure dans « قسمي » (contenu de classe accessible)');
  await apage.screenshot({ path: `${OUT}/A2-qism-after-join-mobile.png`, fullPage: true });
  const aRow = JSON.parse(tinker(`echo json_encode(App\\Models\\ClassroomMembership::where('classroom_id', ${classroom.id})->get(['student_id','status','joined_via','consented_at']));`));
  check(aRow.length === 1 && aRow[0].joined_via === 'join_link' && aRow[0].consented_at, 'une ligne, joined_via = join_link, consentement daté');
  await apage.goto(`${BASE}/espace`, { waitUntil: 'networkidle' });
  check(!apage.url().includes('/bienvenue'), 'l’espace s’ouvre sans détour par le choix de la classe scolaire');
  await actx.close();

  // ── B. Élève existant : lien → connexion → rejoint ─────────────────────
  console.log('\nB. Élève existant — lien → connexion → قسمي');
  const bctx = await contextFor(browser, { viewport: DESKTOP });
  const bpage = await bctx.newPage();
  watch(bpage);
  await bpage.goto(expectedUrl, { waitUntil: 'networkidle' });
  await bpage.screenshot({ path: `${OUT}/B-join-page-desktop.png`, fullPage: false });
  await bpage.click('[data-join-link-login]');
  await bpage.waitForURL(/\/login$/);
  check(await bpage.locator('[data-class-join-notice]').waitFor({ timeout: 5000 }).then(() => true).catch(() => false), '/login rappelle le قسم à rejoindre');
  await bpage.fill('#email', STUDENT.email);
  await bpage.fill('#password', STUDENT.password);
  await submitAuth(bpage, '/auth/login');
  await bpage.waitForURL(/\/espace\/qism/, { timeout: 15000 }).catch(async () => {
    await bpage.screenshot({ path: `${OUT}/B-login-failed.png` });
    console.log(`  (page : ${bpage.url().replace(BASE, '')} — ${(await bpage.locator('[role="alert"]').allInnerTexts()).join(' | ')})`);
  });
  check(bpage.url().includes('/espace/qism'), `connexion → directement « قسمي » (${bpage.url().replace(BASE, '')})`);
  check((await bpage.locator('[data-qism-joined]').innerText().catch(() => '')).includes(`قسم الرابط ${STAMP}`), 'confirmation de l’adhésion, sans code tapé');
  await bpage.screenshot({ path: `${OUT}/B-qism-desktop.png`, fullPage: false });

  // ── C. Le même élève rouvre le lien ────────────────────────────────────
  console.log('\nC. Membre — rouvrir le lien');
  await bpage.goto(expectedUrl, { waitUntil: 'networkidle' });
  await bpage.waitForURL(/\/espace\/qism/, { timeout: 10000 }).catch(() => {});
  check(bpage.url().includes('/espace/qism'), 'rouvrir le lien → « قسمي », sans question');
  check((await bpage.locator('[data-qism-joined]').innerText().catch(() => '')).includes('بالفعل'), '« أنت في هذا القسم بالفعل »');
  const qaId = tinker(`echo App\\Models\\User::where('email','${STUDENT.email}')->value('id');`);
  const bRows = tinker(`echo App\\Models\\ClassroomMembership::where('classroom_id', ${classroom.id})->where('student_id', ${qaId})->count();`);
  check(bRows === '1', 'toujours UNE ligne d’adhésion');
  await bctx.close();

  // ── D. Le code continue de fonctionner ─────────────────────────────────
  console.log('\nD. Nouvel élève — rejoindre par le CODE');
  const reg = await api(null, '/auth/register', { method: 'POST', body: JSON.stringify({ firstName: 'يوسف', lastName: 'قادري', email: NEW_D, password: PASSWORD, accept_legal: true }) });
  check(reg.status === 201, `inscription API (${reg.status})`);
  await fetch(verificationUrl(NEW_D), { redirect: 'manual' });
  tinker(`App\\Models\\User::where('email','${NEW_D}')->update(['grade' => '4am']);`);
  const dctx = await contextFor(browser, { token: reg.data.token, viewport: MOBILE });
  const dpage = await dctx.newPage();
  watch(dpage);
  await dpage.goto(`${BASE}/espace/qism`, { waitUntil: 'networkidle' });
  await dpage.fill('#join-code', classroom.joinCode);
  await dpage.click('form [data-qism-consent-join]');
  await dpage.locator('[data-qism-joined]').waitFor({ timeout: 10000 }).catch(() => {});
  const joinedByCode = await dpage.locator('[data-qism-current]', { hasText: `قسم الرابط ${STAMP}` }).waitFor({ timeout: 8000 }).then(() => true).catch(() => false);
  check(joinedByCode, 'le code fait rejoindre le même قسم');
  await dpage.screenshot({ path: `${OUT}/D-code-mobile.png`, fullPage: true });
  await dctx.close();
  const vias = tinker(`echo App\\Models\\ClassroomMembership::where('classroom_id', ${classroom.id})->orderBy('id')->pluck('joined_via')->implode(',');`);
  check(vias === 'join_link,join_link,join_code', `même table, même adhésion (${vias})`);

  // ── Fermé, renouvelé, invalide ─────────────────────────────────────────
  console.log('\nE. Adhésions fermées, lien renouvelé, lien invalide');
  await api(teacherToken, `/teacher/classrooms/${classroom.id}`, { method: 'PATCH', body: JSON.stringify({ joinCodeEnabled: false }) });
  const ectx = await contextFor(browser, { viewport: MOBILE });
  const epage = await ectx.newPage();
  watch(epage);
  await epage.goto(expectedUrl, { waitUntil: 'networkidle' });
  check(await epage.locator('[data-join-link-closed]').isVisible(), 'adhésions fermées : « الانضمام مغلق »');
  check(await epage.locator('[data-join-link-register]').count() === 0, 'adhésions fermées : aucun bouton d’inscription');
  await epage.screenshot({ path: `${OUT}/E-closed-mobile.png`, fullPage: true });
  const stillMembers = tinker(`echo App\\Models\\ClassroomMembership::where('classroom_id', ${classroom.id})->where('status','active')->count();`);
  check(stillMembers === '3', 'les membres restent membres');
  await api(teacherToken, `/teacher/classrooms/${classroom.id}`, { method: 'PATCH', body: JSON.stringify({ joinCodeEnabled: true }) });
  const rotated = await api(teacherToken, `/teacher/classrooms/${classroom.id}/join-link/rotate`, { method: 'POST' });
  check(rotated.data.classroom?.joinLinkToken && rotated.data.classroom.joinLinkToken !== classroom.joinLinkToken, 'renouveler donne un nouveau jeton');
  await epage.goto(expectedUrl, { waitUntil: 'networkidle' });
  check(await epage.locator('[data-join-link-invalid]').isVisible(), 'l’ancien lien : « رابط غير صالح »');
  const text = await epage.locator('main, body').first().innerText();
  check(!/SQL|Exception|stack|classroom_id/i.test(text), 'aucun détail technique affiché');
  await epage.screenshot({ path: `${OUT}/E-invalid-mobile.png`, fullPage: true });
  await epage.goto(`${BASE}/rejoindre/abc123`, { waitUntil: 'networkidle' });
  check(await epage.locator('[data-join-link-invalid]').isVisible(), 'une ancienne adresse d’invitation : même message');
  await ectx.close();

  check(errors.length === 0, `aucune erreur de page (${errors.join(' | ') || '—'})`);
} catch (err) {
  failed += 1;
  console.error('✗ interruption :', err);
} finally {
  await browser.close();
  // Nettoyage : le قسم de test archivé (ses sièges libérés), les comptes créés supprimés.
  if (classroom?.id) {
    // L'élève QA quitte le قسم de test (retiré par l'enseignant), puis le قسم est archivé.
    try {
      const qa = tinker(`echo App\\Models\\User::where('email','${STUDENT.email}')->value('id');`);
      await api(teacherToken, `/teacher/classrooms/${classroom.id}/students/${qa}`, { method: 'DELETE' });
    } catch { /* déjà parti */ }
    await api(teacherToken, `/teacher/classrooms/${classroom.id}/archive`, { method: 'POST' }).catch(() => {});
  }
  try { tinker(`App\\Models\\User::whereIn('email', ['${NEW_A}', '${NEW_D}'])->delete();`); } catch { /* rien à supprimer */ }
}

console.log(`\n${passed} ✓ · ${failed} ✗ — captures : ${OUT}`);
process.exit(failed === 0 ? 0 : 1);
