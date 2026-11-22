// QA — « Prénom et nom » : l'étape d'accueil, le profil, l'inscription et
// l'écran de confirmation Google.
//
// Lancement (Vite sur 5173 et l'API sur 8000, comptes QA importés) :
//   node apps/web/e2e/person-name.mjs
//
// PRÉALABLE : vider le nom des deux comptes QA, pour que chaque espace le
// redemande :
//   php artisan tinker --execute="App\\Models\\User::whereIn('email',
//     ['qa-eleve@exemple.fr','qa-prof@exemple.fr'])->update(['last_name'=>null]);"
// Il RESTAURE « Élève Démo » / « Professeur Démo » à la fin (un nom est fait de
// lettres latines, accents compris — utils/personName.js : un nom refusé
// renverrait le compte QA vers l'étape du nom dans tous les autres scripts). Deux connexions
// API seulement (/auth/login est limité à 6/min). Captures dans
// /tmp/person-name-qa.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@exemple.fr', password: PASSWORD };
const STUDENT = { email: process.env.QA_STUDENT_EMAIL || 'qa-eleve@exemple.fr', password: PASSWORD };
// auth:name.errors.invalid (locales/fr/auth.json) — le refus d'un caractère.
const INVALID = 'Utilisez des lettres, des espaces, des traits d’union ou des apostrophes.';
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
  const context = await browser.newContext({ viewport, locale: 'fr-FR' });
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

  // ── 1. Élève sans nom → étape « Prénom et nom », AVANT tout le reste ─────
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
  check(await spage.locator('#onboarding-firstName-error').isVisible(), 'champ vide : message sous « Prénom »');
  // Validation EN DIRECT, sans soumettre : une autre écriture (l'arabe, écrit
  // en échappements), puis un chiffre. Message : auth:name.errors.invalid.
  await spage.fill('#onboarding-lastName', '');
  await spage.locator('#onboarding-firstName').fill('');
  await spage.locator('#onboarding-firstName').pressSequentially('\u0623\u0645\u064A\u0646');
  check((await spage.locator('#onboarding-firstName-error').textContent())?.includes(INVALID), 'en direct : un nom en lettres arabes est refusé');
  await spage.screenshot({ path: `${OUT}/1-live-other-script.png` });
  await spage.fill('#onboarding-firstName', 'Léo3');
  check((await spage.locator('#onboarding-firstName-error').textContent())?.includes(INVALID), 'en direct : un chiffre est refusé');
  await spage.fill('#onboarding-firstName', 'Léo');
  check(await spage.locator('#onboarding-firstName-error').count() === 0, 'en direct : un nom en lettres latines accentuées efface l’erreur');
  await spage.fill('#onboarding-firstName', '  Léo ');
  await spage.fill('#onboarding-lastName', 'Dupont   Martin');
  await spage.click('button[type="submit"]');
  await spage.waitForURL(/\/espace\/progression$/, { timeout: 8000 }).catch(() => {});
  check(spage.url().endsWith('/espace/progression'), 'après l’étape : retour à la page visée');

  // ── 2. Accueil : le prénom dans le message d'accueil ──────────────────────────────
  console.log('\n2. Accueil élève');
  await spage.goto(`${BASE}/espace`, { waitUntil: 'networkidle' });
  const home = await spage.locator('main').innerText();
  check(home.includes('Léo'), 'le tableau de bord salue par le prénom');
  await spage.screenshot({ path: `${OUT}/2-home.png` });

  // ── 3. Profil : lecture puis modification ────────────────────────────────
  console.log('\n3. Profil élève');
  await spage.goto(`${BASE}/espace/profil`, { waitUntil: 'networkidle' });
  check((await spage.locator('main').innerText()).includes('Léo Dupont Martin'), 'le profil affiche le nom complet normalisé');
  await spage.getByRole('button', { name: 'Modifier' }).click();
  await spage.fill('#profile-lastName', 'Dupont-Martin d’Arc');
  await spage.screenshot({ path: `${OUT}/3-profile-edit.png`, fullPage: true });
  await spage.getByRole('button', { name: 'Enregistrer' }).click();
  await spage.getByRole('status').waitFor({ timeout: 5000 }).catch(() => {});
  check((await spage.locator('main').innerText()).includes('Dupont-Martin d’Arc'), 'l’élève modifie son nom depuis le profil');
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
  await tpage.fill('#onboarding-firstName', 'Claire');
  await tpage.fill('#onboarding-lastName', 'Rousseau');
  await tpage.click('button[type="submit"]');
  await tpage.waitForURL(/\/enseignant\/classes$/, { timeout: 8000 }).catch(() => {});
  check(tpage.url().endsWith('/enseignant/classes'), 'après l’étape : retour à « Mes classes »');

  // ── 5. L'enseignant lit ses élèves par leur NOM, jamais leur courriel ────
  const classes = await api(teacherToken, '/teacher/classrooms');
  let seen = false;
  for (const c of classes.data.classrooms ?? []) {
    await tpage.goto(`${BASE}/enseignant/classes/${c.id}?tab=students`, { waitUntil: 'networkidle' });
    await tpage.waitForTimeout(400);
    const text = await tpage.locator('main').innerText();
    if (text.includes('Léo Dupont-Martin d’Arc')) {
      seen = true;
      check(!text.includes(STUDENT.email), 'aucune adresse d’élève dans la page de la classe');
      await tpage.screenshot({ path: `${OUT}/5-teacher-members.png`, fullPage: true });
      break;
    }
  }
  // Le fixture QA peut n'avoir AUCUNE adhésion active (classes archivées) :
  // on le dit plutôt que d'échouer — la forme élève-vue-par-l'enseignant est
  // tenue côté serveur par TeacherPrivacyContractTest (jamais le courriel).
  if (seen) check(true, 'l’enseignant voit « Léo Dupont-Martin d’Arc » dans sa classe');
  else console.log('  – ignoré : l’élève QA n’est membre actif d’aucune classe de l’enseignant QA');
  await tpage.goto(`${BASE}/enseignant/profil`, { waitUntil: 'networkidle' });
  check((await tpage.locator('main').innerText()).includes('Rousseau'), 'le profil enseignant montre son nom');
  await tpage.screenshot({ path: `${OUT}/5-teacher-profile.png` });
  await tctx.close();

  // ── 6. Visiteur : inscription et confirmation Google ─────────────────────
  console.log('\n6. Inscription & Google');
  for (const [label, viewport] of [['mobile', { width: 390, height: 844 }], ['desktop', { width: 1440, height: 900 }]]) {
    const vctx = await contextFor(browser, null, viewport);
    const vpage = await vctx.newPage();
    watch(vpage);
    await vpage.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
    check(await vpage.locator('#register-firstName').isVisible(), `${label} : l’inscription demande le prénom`);
    await vpage.fill('#email', 'nouveau@exemple.fr');
    await vpage.fill('#password', 'password123');
    await vpage.click('form button[type="submit"]');
    check(await vpage.locator('#register-lastName-error').isVisible(), `${label} : l’inscription refuse sans nom`);
    await vpage.screenshot({ path: `${OUT}/6-register-${label}.png`, fullPage: true });

    await vpage.goto(`${BASE}/auth/google?etape=consentement&handoff=x&email=lea%40gmail.com&type=student&prenom=${encodeURIComponent('Léa')}&nom=${encodeURIComponent('Martin2')}`, { waitUntil: 'networkidle' });
    check(await vpage.inputValue('#google-firstName') === 'Léa', `${label} : Google pré-remplit un prénom accentué`);
    check(await vpage.inputValue('#google-lastName') === '', `${label} : un nom refusé (un chiffre) de Google n’est pas pré-rempli`);
    await vpage.screenshot({ path: `${OUT}/6-google-${label}.png`, fullPage: true });
    await vctx.close();
  }
} finally {
  // Restaure les comptes QA.
  await api(studentToken, '/auth/profile', { method: 'PATCH', body: JSON.stringify({ firstName: 'Élève', lastName: 'Démo' }) });
  await api(teacherToken, '/auth/profile', { method: 'PATCH', body: JSON.stringify({ firstName: 'Professeur', lastName: 'Démo' }) });
  await browser.close();
}

if (errors.length) console.log('\nErreurs page :\n  ' + errors.join('\n  '));
console.log(`\n${passed} ✓  ${failed} ✗  — captures : ${OUT}`);
process.exit(failed || errors.length ? 1 : 0);
