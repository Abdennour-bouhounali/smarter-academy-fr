// QA — « الاسم و اللقب » : l'étape d'accueil, le profil, l'inscription et
// l'écran de confirmation Google.
//
// Lancement (Vite sur 5173 et l'API sur 8000, comptes QA importés) :
//   node apps/web/e2e/person-name.mjs
//
// PRÉALABLE : vider le لقب des deux comptes QA, pour que chaque espace le
// redemande :
//   php artisan tinker --execute="App\\Models\\User::whereIn('email',
//     ['qa-eleve@smarter.dz','qa-prof@smarter.dz'])->update(['last_name'=>null]);"
// Il RESTAURE « تلميذ تجريبي » / « أستاذ تجريبي » à la fin (les noms sont en
// lettres arabes depuis 2026-09-29 : un nom latin renverrait le compte QA vers
// l'étape du nom dans tous les autres scripts). Deux connexions
// API seulement (/auth/login est limité à 6/min). Captures dans
// /tmp/person-name-qa.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const STUDENT = { email: process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/person-name-qa';
mkdirSync(OUT, { recursive: true });

let passed = 0;
let failed = 0;
const check = (ok, label) => {
  if (ok) { passed += 1; console.log(`  ✓ ${label}`); } else { failed += 1; console.log(`  ✗ ${label}`); }
};

async function loginToken(who) {
  const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(who) });
  const data = await res.json().catch(() => ({}));
  if (!data.token) throw new Error(`login ${who.email}: ${res.status} ${JSON.stringify(data).slice(0, 120)}`);
  return data.token;
}

async function api(token, path, init = {}) {
  const res = await fetch(`${API}${path}`, { ...init, headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}`, ...(init.headers || {}) } });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

async function contextFor(browser, token, viewport = { width: 1440, height: 900 }) {
  const context = await browser.newContext({ viewport, locale: 'ar-DZ' });
  if (token) await context.addInitScript((tk) => { try { localStorage.setItem('token', tk); } catch { /* noop */ } }, token);
  return context;
}

const studentToken = await loginToken(STUDENT);
const teacherToken = await loginToken(TEACHER);
const browser = await chromium.launch();
const errors = [];
const watch = (page) => page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

try {
  const me = await api(studentToken, '/auth/me');
  check(me.data.user?.nameComplete === false, 'précondition : le compte élève QA n’a pas de nom complet');

  // ── 1. Élève sans nom → étape « عرّفنا بنفسك », AVANT tout le reste ─────
  console.log('\n1. Élève — étape d’accueil');
  for (const [label, viewport] of [['mobile', { width: 390, height: 844 }], ['desktop', { width: 1440, height: 900 }]]) {
    const ctx = await contextFor(browser, studentToken, viewport);
    const page = await ctx.newPage();
    watch(page);
    await page.goto(`${BASE}/espace/progression`, { waitUntil: 'networkidle' });
    check(page.url().endsWith('/espace/bienvenue/nom'), `${label} : /espace redirige vers /espace/bienvenue/nom`);
    await page.screenshot({ path: `${OUT}/1-step-${label}.png`, fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    check(!overflow, `${label} : pas de défilement horizontal`);
    await ctx.close();
  }

  const sctx = await contextFor(browser, studentToken);
  const spage = await sctx.newPage();
  watch(spage);
  await spage.goto(`${BASE}/espace/progression`, { waitUntil: 'networkidle' });
  await spage.fill('#onboarding-firstName', '');
  await spage.fill('#onboarding-lastName', '');
  await spage.click('button[type="submit"]');
  check(await spage.locator('#onboarding-firstName-error').isVisible(), 'champ vide : message arabe sous الاسم');
  // Validation EN DIRECT, sans soumettre : le latin, puis un chiffre.
  await spage.fill('#onboarding-lastName', '');
  await spage.locator('#onboarding-firstName').fill('');
  await spage.locator('#onboarding-firstName').pressSequentially('Amine');
  check((await spage.locator('#onboarding-firstName-error').textContent())?.includes('بالحروف العربية'), 'en direct : un nom latin demande les lettres arabes');
  await spage.screenshot({ path: `${OUT}/1-live-latin.png` });
  await spage.fill('#onboarding-firstName', 'أمين3');
  check((await spage.locator('#onboarding-firstName-error').textContent())?.includes('حروف عربية'), 'en direct : un chiffre est refusé');
  await spage.fill('#onboarding-firstName', 'أمين');
  check(await spage.locator('#onboarding-firstName-error').count() === 0, 'en direct : un nom arabe efface l’erreur');
  await spage.fill('#onboarding-firstName', '  أمين ');
  await spage.fill('#onboarding-lastName', 'بن   علي');
  await spage.click('button[type="submit"]');
  await spage.waitForURL(/\/espace\/progression$/, { timeout: 8000 }).catch(() => {});
  check(spage.url().endsWith('/espace/progression'), 'après l’étape : retour à la page visée');

  // ── 2. Accueil : le prénom dans le ترحيب ─────────────────────────────────
  console.log('\n2. Accueil élève');
  await spage.goto(`${BASE}/espace`, { waitUntil: 'networkidle' });
  const home = await spage.locator('main').innerText();
  check(home.includes('أمين'), 'le tableau de bord salue par le prénom');
  await spage.screenshot({ path: `${OUT}/2-home.png` });

  // ── 3. Profil : lecture puis modification ────────────────────────────────
  console.log('\n3. Profil élève');
  await spage.goto(`${BASE}/espace/profil`, { waitUntil: 'networkidle' });
  check((await spage.locator('main').innerText()).includes('أمين بن علي'), 'le profil affiche le nom complet normalisé');
  await spage.getByRole('button', { name: 'تعديل' }).click();
  await spage.fill('#profile-lastName', 'بن علي الجزائري');
  await spage.screenshot({ path: `${OUT}/3-profile-edit.png`, fullPage: true });
  await spage.getByRole('button', { name: 'حفظ' }).click();
  await spage.getByRole('status').waitFor({ timeout: 5000 }).catch(() => {});
  check((await spage.locator('main').innerText()).includes('بن علي الجزائري'), 'l’élève modifie son لقب depuis le profil');
  await spage.screenshot({ path: `${OUT}/3-profile-saved.png`, fullPage: true });
  await sctx.close();

  // ── 4. Enseignant sans nom → /enseignant/bienvenue ───────────────────────
  console.log('\n4. Enseignant');
  const tctx = await contextFor(browser, teacherToken);
  const tpage = await tctx.newPage();
  watch(tpage);
  await tpage.goto(`${BASE}/enseignant/classes`, { waitUntil: 'networkidle' });
  check(tpage.url().endsWith('/enseignant/bienvenue'), 'l’espace enseignant demande aussi le nom');
  await tpage.screenshot({ path: `${OUT}/4-teacher-step.png` });
  await tpage.fill('#onboarding-firstName', 'كريمة');
  await tpage.fill('#onboarding-lastName', 'بوزيد');
  await tpage.click('button[type="submit"]');
  await tpage.waitForURL(/\/enseignant\/classes$/, { timeout: 8000 }).catch(() => {});
  check(tpage.url().endsWith('/enseignant/classes'), 'après l’étape : retour à « أقسامي »');

  // ── 5. L'enseignant lit ses élèves par leur NOM, jamais leur courriel ────
  const classes = await api(teacherToken, '/teacher/classrooms');
  let seen = false;
  for (const c of classes.data.classrooms ?? []) {
    await tpage.goto(`${BASE}/enseignant/classes/${c.id}?tab=students`, { waitUntil: 'networkidle' });
    await tpage.waitForTimeout(400);
    const text = await tpage.locator('main').innerText();
    if (text.includes('أمين بن علي الجزائري')) {
      seen = true;
      check(!text.includes(STUDENT.email), 'aucune adresse d’élève dans la page du قسم');
      await tpage.screenshot({ path: `${OUT}/5-teacher-members.png`, fullPage: true });
      break;
    }
  }
  // Le fixture QA peut n'avoir AUCUNE adhésion active (classes archivées) :
  // on le dit plutôt que d'échouer — la forme élève-vue-par-l'enseignant est
  // tenue côté serveur par TeacherPrivacyContractTest (jamais le courriel).
  if (seen) check(true, 'l’enseignant voit « أمين بن علي الجزائري » dans son قسم');
  else console.log('  – ignoré : l’élève QA n’est membre actif d’aucun قسم de l’enseignant QA');
  await tpage.goto(`${BASE}/enseignant/profil`, { waitUntil: 'networkidle' });
  check((await tpage.locator('main').innerText()).includes('بوزيد'), 'le profil enseignant montre son لقب');
  await tpage.screenshot({ path: `${OUT}/5-teacher-profile.png` });
  await tctx.close();

  // ── 6. Visiteur : inscription et confirmation Google ─────────────────────
  console.log('\n6. Inscription & Google');
  for (const [label, viewport] of [['mobile', { width: 390, height: 844 }], ['desktop', { width: 1440, height: 900 }]]) {
    const vctx = await contextFor(browser, null, viewport);
    const vpage = await vctx.newPage();
    watch(vpage);
    await vpage.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
    check(await vpage.locator('#register-firstName').isVisible(), `${label} : l’inscription demande الاسم`);
    await vpage.fill('#email', 'nouveau@example.dz');
    await vpage.fill('#password', 'password123');
    await vpage.click('form button[type="submit"]');
    check(await vpage.locator('#register-lastName-error').isVisible(), `${label} : l’inscription refuse sans لقب`);
    await vpage.screenshot({ path: `${OUT}/6-register-${label}.png`, fullPage: true });

    await vpage.goto(`${BASE}/auth/google?etape=consentement&handoff=x&email=lea%40gmail.com&type=student&prenom=${encodeURIComponent('ليلى')}&nom=M`, { waitUntil: 'networkidle' });
    check(await vpage.inputValue('#google-firstName') === 'ليلى', `${label} : Google pré-remplit un prénom arabe`);
    check(await vpage.inputValue('#google-lastName') === '', `${label} : un nom latin de Google n’est pas pré-rempli`);
    await vpage.screenshot({ path: `${OUT}/6-google-${label}.png`, fullPage: true });
    await vctx.close();
  }
} finally {
  // Restaure les comptes QA.
  await api(studentToken, '/auth/profile', { method: 'PATCH', body: JSON.stringify({ firstName: 'تلميذ', lastName: 'تجريبي' }) });
  await api(teacherToken, '/auth/profile', { method: 'PATCH', body: JSON.stringify({ firstName: 'أستاذ', lastName: 'تجريبي' }) });
  await browser.close();
}

if (errors.length) console.log('\nErreurs page :\n  ' + errors.join('\n  '));
console.log(`\n${passed} ✓  ${failed} ✗  — captures : ${OUT}`);
process.exit(failed || errors.length ? 1 : 0);
