/**
 * LE TRAJET D'APPRENTISSAGE des leçons de l'unité 2 « الحساب على الجذور »,
 * de bout en bout, avec un VRAI compte élève et la VRAIE API (aucun stub).
 *
 * Pour chaque leçon de l'unité (lues depuis leurs lesson.config.js) :
 *   1. « أستعدّ » (module 0) : l'élève répond à tout et clique « عرض نتيجتي » —
 *      le client écrit la progression (PUT /lessons/{code}/progress → 200) ;
 *   2. le test final (module `evaluation`), les modules précédents marqués faits
 *      dans le stockage local de CET élève : il répond à tout et envoie —
 *      chaque réponse part comme PREUVE (POST /lessons/{code}/evidence → 2xx,
 *      jamais 422 « unknown item ») et la tentative est enregistrée
 *      (PUT /lessons/{code}/final-test-attempt → 2xx) ;
 *   3. côté serveur : GET /students/me/lesson-progress contient la leçon avec
 *      ses modules, et GET /students/me/learning-profile donne un état à CHAQUE
 *      point d'apprentissage de la leçon (plus aucun « non évalué »).
 *
 * Écrit dans la base LOCALE du compte QA (qa-eleve@smarter.dz) : c'est voulu,
 * c'est le trajet réel. Prérequis : web 5173, API 8000.
 *
 *   node apps/web/e2e/learning-progress-hisab-judhur.mjs
 */
import { chromium } from 'playwright';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { existsSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const EMAIL = process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const here = dirname(fileURLToPath(import.meta.url));
const UNIT_DIR = resolve(here, '../src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/hisab-judhur');
// `jidhr-tarbii` and `natiqa-ghayr-natiqa` are v2 lessons since 2026-11-21 (their modules' pages are deleted): walked by
// e2e/lessons/<id>.walk.mjs
const CODES = ['muadalat-x-murabba', 'amaliyat-judhur', 'tawzif-khawass-judhur', 'wadiya-idmajiya-judhur']
  .filter((c) => existsSync(`${UNIT_DIR}/${c}/lesson.config.js`));

const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail && !ok ? ` — ${detail}` : ''}`); };
const errors = [];

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 }, locale: 'ar-DZ' });
const page = await ctx.newPage();
page.on('pageerror', (e) => errors.push(e.message));

// ── Connexion : /auth/login de la vraie API (limité à 6/min), puis le jeton
// remis à l'application là où AuthContext le lit (`token`).
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
const login = await page.evaluate(async ([u, e, p]) => {
  const r = await fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email: e, password: p }) });
  return r.json();
}, [`${API}/auth/login`, EMAIL, PASSWORD]);
const token = login?.token;
await page.evaluate((t) => localStorage.setItem('token', t), token);
await page.goto(`${BASE}/espace`, { waitUntil: 'networkidle' });
check('connexion de l’élève QA', !!token);
const api = (path) => page.evaluate(async ([u, t]) => {
  const r = await fetch(u, { headers: { Authorization: `Bearer ${t}`, Accept: 'application/json' } });
  return { status: r.status, body: await r.json().catch(() => null) };
}, [`${API}${path}`, token]);
const me = await api('/auth/me');
const userId = me.body?.user?.id;
check('identité de l’élève lue sur /auth/me', Number.isInteger(userId), JSON.stringify(me.body)?.slice(0, 120));

// Toutes les réponses de l'API d'apprentissage, par leçon.
const calls = [];
page.on('response', (r) => {
  const m = r.url().match(/\/lessons\/([^/]+)\/(progress|evidence|final-test-attempt)$/);
  if (m && r.request().method() !== 'GET') calls.push({ lesson: decodeURIComponent(m[1]), kind: m[2], status: r.status() });
});
const callsOf = (lesson, kind) => calls.filter((c) => c.lesson === lesson && c.kind === kind);

/** Répondre à chaque question visible (le premier choix de chaque groupe). */
async function answerAll(scope) {
  const groups = page.locator(`${scope} [role="group"]`);
  const n = await groups.count();
  for (let i = 0; i < n; i += 1) {
    const btn = groups.nth(i).locator('button[aria-pressed]').first();
    if (await btn.count() && await btn.isEnabled()) { await btn.scrollIntoViewIfNeeded(); await btn.click(); }
  }
  return n;
}

for (const code of CODES) {
  const cfg = (await import(pathToFileURL(`${UNIT_DIR}/${code}/lesson.config.js`).href)).LESSON_CONFIG;
  const diag = cfg.modules.find((m) => m.stage === 'prerequisite_check');
  const evalM = cfg.modules.find((m) => m.stage === 'evaluation');
  const lps = [...new Set(cfg.modules.flatMap((m) => m.teachesLearningPointIds ?? []))];

  // 1. « أستعدّ »
  await page.goto(`${BASE}${diag.path}`, { waitUntil: 'networkidle' });
  await answerAll('main');
  const see = page.getByRole('button', { name: /عرض نتيجتي/ });
  await see.scrollIntoViewIfNeeded();
  const put0 = page.waitForResponse((r) => r.url().endsWith(`/lessons/${code}/progress`) && r.request().method() === 'PUT', { timeout: 15000 }).catch(() => null);
  await see.click();
  await put0;
  await page.waitForTimeout(500);
  const p0 = callsOf(code, 'progress');
  check(`${code} « أستعدّ » : progression écrite (PUT progress 2xx)`, p0.length > 0 && p0.every((c) => c.status < 300), JSON.stringify(p0));

  // 2. Le test final — les modules d'apprentissage marqués faits pour CET élève.
  const done = cfg.modules.filter((m) => m.number !== evalM.number).map((m) => String(m.number));
  await page.evaluate(([k, d]) => {
    const cur = JSON.parse(localStorage.getItem(k) || '{"completedModules":[],"completedExercises":[]}');
    cur.completedModules = [...new Set([...cur.completedModules, ...d])];
    localStorage.setItem(k, JSON.stringify(cur));
  }, [`u_${userId}_smarter_lesson_${code}`, done]);
  // Une tentative antérieure (un passage précédent de ce test) ouvre la page sur
  // ses résultats : l'élève la « refait » par la route prévue pour ça.
  await page.evaluate(async ([u, t]) => { await fetch(u, { method: 'DELETE', headers: { Authorization: `Bearer ${t}`, Accept: 'application/json' } }); }, [`${API}/lessons/${code}/final-test-attempt`, token]);
  await page.goto(`${BASE}${evalM.path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const answered = await answerAll('main');
  const send = page.getByRole('button', { name: /أرسِل إجاباتي/ });
  const canSend = await send.count() && await send.isEnabled();
  check(`${code} test final : ${answered} question(s) répondue(s), envoi possible`, canSend);
  if (canSend) { await send.scrollIntoViewIfNeeded(); await send.click(); }
  await page.waitForTimeout(4000);
  const ev = callsOf(code, 'evidence');
  check(`${code} test final : chaque réponse acceptée comme preuve (POST evidence 2xx, aucune 422)`, ev.length > 0 && ev.every((c) => c.status < 300), JSON.stringify(ev));
  const at = callsOf(code, 'final-test-attempt');
  check(`${code} test final : tentative enregistrée (PUT final-test-attempt 2xx)`, at.length > 0 && at.every((c) => c.status < 300), JSON.stringify(at));

  // 3. Ce que le serveur sait maintenant.
  const lp = await api('/students/me/lesson-progress');
  const rows = lp.body?.progress ?? lp.body?.data ?? lp.body;
  const row = Array.isArray(rows) ? rows.find((r) => r.lessonCode === code || r.lesson_code === code || r.code === code) : rows?.[code];
  check(`${code} serveur : la leçon a une progression`, !!row, JSON.stringify(rows)?.slice(0, 200));
  const prof = await api(`/students/me/learning-profile?lessonCode=${encodeURIComponent(code)}`);
  const text = JSON.stringify(prof.body ?? {});
  const missing = lps.filter((id) => !text.includes(id));
  check(`${code} serveur : chaque point d’apprentissage a un état (${lps.length})`, prof.status === 200 && missing.length === 0, `status ${prof.status}, manquants ${missing.join(',')}`);
}

check('aucune erreur de page', errors.length === 0, errors.slice(0, 3).join(' | '));
await browser.close();
const fails = results.filter((r) => !r.ok);
console.log(`\n== ${results.length - fails.length}/${results.length} passed ==`);
process.exit(fails.length ? 1 : 0);
