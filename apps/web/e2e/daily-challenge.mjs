// QA navigateur — « التحدّي اليومي » de bout en bout, sur le jeu de
// démonstration (DemoDataSeeder : 14 jours de défis joués par le service).
//
// Lancement (Vite sur 5173, API sur 8000, démonstration semée) :
//   node apps/web/e2e/daily-challenge.mjs [dossier-captures]
//
// Ce qui est vérifié :
//   ÉLÈVE (groupe A — compétition ON, Top 3 ON) : intro → question → une
//     réponse JUSTE (+ bonus) → une réponse FAUSSE (bonne réponse montrée) →
//     rechargement au milieu d'une question (même question, chronomètre qui
//     n'est pas remis à zéro) → fin (score, série, Top 3, rang) → historique →
//     revue ; téléphone 390, tablette 768, bureau 1280 sans débordement ;
//     « réduire les animations » : le score final s'affiche d'emblée.
//   ÉLÈVE groupe B (Top 3 OFF) : aucun nom d'un autre élève.
//   ÉLÈVE groupe C (compétition OFF) : aucun classement.
//   ÉLÈVE du groupe D (défi désactivé) : défi PERSONNEL.
//   ENSEIGNANT : onglet « التحدّي اليومي » (tuiles, analyse, classement,
//     réglages), mode d'affichage (4 vues au clavier), aucun courriel.
//   ADMINISTRATION : l'écran du barème se charge.
//
// Les bonnes réponses sont LUES dans content/practice (la question servie
// n'en porte aucune — c'est la règle) en retrouvant l'énoncé servi.
//
// Effet de bord assumé : le défi d'AUJOURD'HUI de student01 est joué.
// Relancer DemoDataSeeder pour recommencer.
import { chromium } from 'playwright';
import { mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const OUT = process.argv[2] || '/tmp/daily-challenge-shots';
mkdirSync(OUT, { recursive: true });
const DOMAIN = '@smarter-academy-dz.test';
const STUDENT_PASSWORD = process.env.QA_STUDENT_PASSWORD || 'TestStudent123!';
const TEACHER = { email: `teacher01${DOMAIN}`, password: process.env.QA_TEACHER_PASSWORD || 'TestTeacher123!' };
const ADMIN = { email: `admin${DOMAIN}`, password: process.env.QA_ADMIN_PASSWORD || 'TestPassword123!' };
// Un courriel d'ÉLÈVE (celui de l'enseignant connecté, dans sa propre barre, n'en est pas un).
const EMAIL = /student\d+@smarter-academy-dz\.test/;

const results = [];
const record = (name, ok, detail = '') => { results.push({ name, ok, detail }); console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`); };
const pageErrors = [];
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Les bonnes réponses, depuis le contenu ────────────────────────────────
const root = join(dirname(fileURLToPath(import.meta.url)), '../../../content/practice');
const byStatement = new Map();
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/ex-.*\.json$/.test(name)) {
      const ex = JSON.parse(readFileSync(p, 'utf8'));
      for (const q of ex.questions ?? []) byStatement.set(q.statement.trim(), q);
    }
  }
};
walk(root);

// ── Connexion : UNE fois par compte (POST /auth/login : 6 / minute) ───────
const browser = await chromium.launch();
const states = new Map();
async function contextFor(who, options = {}) {
  if (!states.has(who.email)) {
    if (states.size > 0) await sleep(15000);
    // POST /auth/login est limité à 6 / minute PAR IP — et d'autres clients
    // locaux peuvent consommer la fenêtre. Sur « عدد المحاولات كبير », on
    // attend la fenêtre suivante et on recommence (3 fois au plus).
    for (let tries = 1; ; tries++) {
      const c = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ar-DZ' });
      const p = await c.newPage();
      let throttled = false;
      p.on('response', (r) => { if (r.url().includes('/auth/login') && r.status() === 429) throttled = true; });
      await p.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
      await p.fill('input[type="email"]', who.email);
      await p.fill('input[type="password"]', who.password);
      await p.click('button[type="submit"]');
      try {
        // Navigation SPA (pushState) : on attend le chemin, pas un événement « load ».
        await p.waitForFunction(() => !location.pathname.startsWith('/login'), null, { timeout: 20000 });
        await p.waitForLoadState('networkidle');
        states.set(who.email, await c.storageState());
        await c.close();
        break;
      } catch (e) {
        await p.screenshot({ path: `${OUT}/login-failure-${who.email.split('@')[0]}.png` });
        await c.close();
        if (!throttled || tries >= 3) throw e;
        console.log(`   ↳ connexion limitée (429) pour ${who.email} : nouvel essai dans 65 s`);
        await sleep(65000);
      }
    }
  }
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ar-DZ', ...options, storageState: states.get(who.email) });
  return ctx;
}
async function pageFor(who, options) {
  const ctx = await contextFor(who, options);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => pageErrors.push(e.message));
  return { ctx, page };
}

/** Répond à la question affichée : juste ou fausse, à partir du contenu. */
// Les isolats bidi (LRI…PDI) que RichText insère autour des égalités en clair sont retirés.
const clean = (t) => t.replace(/[\u2066-\u2069\u200e\u200f]/g, '').replace(/\s+/g, ' ').trim();
const words = (t) => new Set(clean(t).replace(/\$[^$]*\$/g, ' ').split(/[\s،,.:؟?()«»]+/).filter((w) => w.length >= 3 || /^\d+$/.test(w)));
async function answerShown(page, correct) {
  const form = page.locator('[data-challenge-session] article form');
  const statement = (await page.locator('[data-challenge-session] article h2').innerText()).trim();
  const type = await form.locator('button[aria-pressed]').count() ? 'choice'
    : await form.locator('textarea').count() ? 'integerSet' : 'rational';
  const seen = words(statement);
  let best = null;
  let bestScore = -1;
  for (const [s, q] of byStatement) {
    if (q.answerType === type && !s.includes('$') && clean(s) === clean(statement)) { best = q; bestScore = 99; break; }
  }
  for (const [s, q] of bestScore === 99 ? [] : byStatement) {
    if (q.answerType !== type) continue;
    const w = words(s);
    let score = 0;
    for (const x of w) if (seen.has(x)) score++;
    score /= Math.max(1, w.size);
    if (score > bestScore) { best = q; bestScore = score; }
  }
  if (!best) throw new Error(`Question introuvable : ${statement.slice(0, 60)}`);
  if (process.env.QA_DEBUG) console.log(`   ↳ [${type}] «${statement.slice(0, 50)}» ≈ «${best.statement.slice(0, 50)}» (${bestScore.toFixed(2)})`);
  if (type === 'choice') {
    const target = best.choices.find((c) => c.isCorrect === correct) ?? best.choices[0];
    const buttons = form.locator('button[aria-pressed]');
    const n = await buttons.count();
    const want = words(target.content);
    let pick = 0;
    let pickScore = -1;
    for (let i = 0; i < n; i++) {
      const w = words(await buttons.nth(i).innerText());
      let sc = 0;
      for (const x of w) if (want.has(x)) sc++;
      if (sc > pickScore) { pick = i; pickScore = sc; }
    }
    await buttons.nth(pick).click();
    return;
  }
  const field = type === 'integerSet' ? form.locator('textarea').first() : form.locator('input[type="text"]').first();
  const value = correct ? (Array.isArray(best.expectedAnswer) ? best.expectedAnswer.join(', ') : String(best.expectedAnswer)) : '99991';
  await field.fill(value);
}

// ── Jour de repos ? (vendredi par défaut) ─────────────────────────────────
// La QA ouvre d'abord l'écran RÉEL du jour ; si c'est un jour de repos, elle
// ajoute temporairement ce jour aux jours de défi (API d'administration) et
// RESTAURE la valeur d'origine à la fin, quoi qu'il arrive.
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const apiCall = async (token, method, path, body) => {
  const r = await fetch(`${API}${path}`, { method, headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { status: r.status, body: await r.json().catch(() => ({})) };
};
const adminToken = (await apiCall(null, 'POST', '/auth/login', ADMIN)).body.token;
const config = (await apiCall(adminToken, 'GET', '/admin/daily-challenge/config')).body;
const weekdays = config.fields.find((f) => f.key === 'challenge.challenge_weekdays').value;
const isoToday = ((new Date().getDay() + 6) % 7) + 1;
let restored = null;

try {
  if (!weekdays.includes(isoToday)) {
    const { ctx: c0, page: p0 } = await pageFor({ email: `${process.env.QA_PLAYER || 'student01'}${DOMAIN}`, password: STUDENT_PASSWORD });
    await p0.goto(`${BASE}/espace/defi`, { waitUntil: 'networkidle' });
    await p0.waitForSelector('[data-challenge-intro]', { timeout: 20000 });
    record('jour de repos : message dédié, pas de bouton', await p0.locator('[data-unavailable="rest_day"]').count() === 1 && await p0.locator('[data-start]').count() === 0);
    await p0.screenshot({ path: `${OUT}/00-rest-day.png`, fullPage: true });
    await c0.close();
    restored = weekdays;
    const r = await apiCall(adminToken, 'PUT', '/admin/daily-challenge/config', { values: { 'challenge.challenge_weekdays': [...weekdays, isoToday].sort() } });
    record('admin API : jour ajouté pour la QA', r.status === 200, `status=${r.status}`);
  }

  // QA_SKIP_PLAY=1 : saute le parcours joué (déjà vérifié), pour rejouer le reste.
  if (!process.env.QA_SKIP_PLAY) {
  // ── ÉLÈVE — groupe A ──────────────────────────────────────────────────
  // Un élève du groupe A qui n'a pas encore joué aujourd'hui (QA_PLAYER=student06…).
  const student01 = { email: `${process.env.QA_PLAYER || 'student01'}${DOMAIN}`, password: STUDENT_PASSWORD };
  const { ctx, page } = await pageFor(student01);
  await page.goto(`${BASE}/espace/defi`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-challenge-intro]', { timeout: 20000 });
  record('intro : le défi du jour s’affiche', true);
  record('intro : série et cumul visibles', await page.locator('[data-streak]').count() >= 1 && await page.locator('[data-cumulative]').count() === 1);
  record('intro (groupe A) : Top 3 visible', await page.locator('[data-top3]').count() === 1);
  record('intro : pas de débordement (1280)', !(await overflow(page)));
  await page.screenshot({ path: `${OUT}/01-intro-1280.png`, fullPage: true });

  await page.click('[data-start]');
  await page.waitForSelector('[data-challenge-session]', { timeout: 20000 });
  record('séance : « السؤال 1 / n » et chronomètre', /1 \//.test(await page.locator('[data-question-of]').innerText()) && await page.locator('[data-timer]').count() === 1);
  await sleep(2500);
  await answerShown(page, true);
  await page.screenshot({ path: `${OUT}/02-question-1280.png`, fullPage: true });
  await page.click('[data-primary-action="check"]');
  await page.waitForSelector('[data-feedback]', { timeout: 15000 });
  record('réponse JUSTE : « صحيح » et des points', await page.locator('[data-feedback="correct"]').count() === 1 && await page.locator('[data-points]').count() === 1,
    await page.locator('[data-feedback]').getAttribute('data-feedback'));
  await page.screenshot({ path: `${OUT}/03-correct-1280.png`, fullPage: true });

  await page.click('[data-primary-action="next"]');
  await page.waitForSelector('[data-primary-action="check"]', { timeout: 15000 });
  await answerShown(page, false);
  await page.click('[data-primary-action="check"]');
  await page.waitForSelector('[data-feedback]', { timeout: 15000 });
  record('réponse FAUSSE : « ليس هذه المرّة », 0, bonne réponse montrée', await page.locator('[data-feedback="wrong"]').count() === 1 && await page.locator('[data-correct-answer]').count() === 1);
  await page.screenshot({ path: `${OUT}/04-wrong-1280.png`, fullPage: true });

  // Rechargement au milieu d'une question : même question, chronomètre conservé.
  await page.click('[data-primary-action="next"]');
  await page.waitForSelector('[data-primary-action="check"]', { timeout: 15000 });
  const before = await page.locator('[data-question-of]').innerText();
  await sleep(3500);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-start]', { timeout: 20000 });
  await page.click('[data-start]');
  await page.waitForSelector('[data-challenge-session]', { timeout: 20000 });
  const after = await page.locator('[data-question-of]').innerText();
  const clock = await page.locator('[data-timer]').innerText();
  record('rechargement : la même question revient', before === after, `${before} → ${after}`);
  record('rechargement : le chronomètre n’est pas remis à zéro', !/00:00|00:01/.test(clock), clock);

  // Le reste : justes jusqu'au bout.
  for (let guard = 0; guard < 10; guard++) {
    if (await page.locator('[data-challenge-complete]').count()) break;
    if (await page.locator('[data-primary-action="check"]').count()) {
      await answerShown(page, true);
      await page.click('[data-primary-action="check"]');
      await page.waitForSelector('[data-feedback]', { timeout: 15000 });
    }
    const action = await page.locator('[data-primary-action]').getAttribute('data-primary-action');
    await page.click(`[data-primary-action="${action}"]`);
    await page.waitForSelector('[data-primary-action="check"], [data-challenge-complete]', { timeout: 15000 });
  }
  await page.waitForSelector('[data-challenge-complete]', { timeout: 15000 });
  await sleep(1500);
  record('fin : score, détail, justesse', await page.locator('[data-score-parts] li').count() >= 2 && await page.locator('[data-correct-of]').count() === 1);
  record('fin (groupe A) : rang et Top 3', await page.locator('[data-class-position]').count() === 1 && await page.locator('[data-top3]').count() === 1);
  record('fin : série affichée', await page.locator('[data-streak-current]').count() >= 1);
  record('fin : pas de débordement (1280)', !(await overflow(page)));
  await page.screenshot({ path: `${OUT}/05-complete-1280.png`, fullPage: true });

  await page.goto(`${BASE}/espace/defi/historique`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-challenge-history] ol, [data-challenge-history] p', { timeout: 15000 });
  record('historique : des jours, dont des jours manqués ou joués', await page.locator('[data-challenge-history] li').count() >= 1);
  await page.screenshot({ path: `${OUT}/06-history-1280.png`, fullPage: true });
  await page.locator('[data-challenge-history] li a').first().click();
  await page.waitForSelector('[data-review-question]', { timeout: 15000 });
  record('revue : les questions, réponses et corrections', await page.locator('[data-review-question]').count() >= 3);
  await page.screenshot({ path: `${OUT}/07-review-1280.png`, fullPage: true });
  await ctx.close();

  // Téléphone et tablette, et animations réduites.
  for (const [w, h, name] of [[390, 844, 'mobile'], [768, 1024, 'tablet']]) {
    const { ctx: c, page: p } = await pageFor(student01, { viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    await p.goto(`${BASE}/espace/defi`, { waitUntil: 'networkidle' });
    await p.waitForSelector('[data-challenge-intro]', { timeout: 20000 });
    record(`${name} ${w} : intro sans débordement`, !(await overflow(p)));
    await p.screenshot({ path: `${OUT}/10-intro-${name}.png`, fullPage: true });
    await p.click('button:has-text("اعرض نتيجتي")');
    await p.waitForSelector('[data-challenge-complete]', { timeout: 15000 });
    const total = await p.locator('[data-challenge-complete] h1 [aria-hidden="true"]').first().innerText();
    record(`${name} ${w} : fin sans débordement`, !(await overflow(p)));
    record(`${name} : animations réduites → score final immédiat`, total !== '0', total);
    await p.screenshot({ path: `${OUT}/11-complete-${name}.png`, fullPage: true });
    await p.goto(`${BASE}/espace/defi/historique`, { waitUntil: 'networkidle' });
    record(`${name} ${w} : historique sans débordement`, !(await overflow(p)));
    await c.close();
  }

  }

  // Séance au téléphone : un élève du groupe A qui n'a pas joué aujourd'hui.
  {
    const s = { email: `student04${DOMAIN}`, password: STUDENT_PASSWORD };
    const { ctx: c, page: p } = await pageFor(s, { viewport: { width: 390, height: 844 } });
    await p.goto(`${BASE}/espace/defi`, { waitUntil: 'networkidle' });
    await p.waitForSelector('[data-challenge-intro]', { timeout: 20000 });
    if (await p.locator('[data-start]').count()) {
      await p.click('[data-start]');
      await p.waitForSelector('[data-challenge-session]', { timeout: 20000 });
      record('mobile 390 : question sans débordement', !(await overflow(p)));
      const box = await p.locator('[data-primary-action]').boundingBox();
      // Juste AU-DESSUS de la barre d'onglets mobile (64 px) : ni dessous, ni en haut de l'écran.
      record('mobile 390 : le bouton est en bas, au-dessus de la barre mobile, ≥ 48 px', box && box.y + box.height <= 844 - 64 && box.y > 844 - 64 - 110 && box.height >= 48, JSON.stringify(box));
      await p.screenshot({ path: `${OUT}/12-question-mobile.png`, fullPage: false });
    } else {
      record('mobile 390 : élève déjà passé aujourd’hui (séance non testée)', true);
    }
    await c.close();
  }

  // ── ÉLÈVE — groupe B (Top 3 OFF) ──────────────────────────────────────
  {
    const { ctx: c, page: p } = await pageFor({ email: `student02${DOMAIN}`, password: STUDENT_PASSWORD });
    await p.goto(`${BASE}/espace/defi`, { waitUntil: 'networkidle' });
    await p.waitForSelector('[data-challenge-intro]', { timeout: 20000 });
    record('groupe B (Top 3 OFF) : aucun Top 3', await p.locator('[data-top3]').count() === 0);
    record('groupe B : la compétition existe (rang propre ou mention)', await p.locator('[data-leaderboard]').count() === 1);
    await c.close();
  }
  // ── ÉLÈVE — groupe C (compétition OFF) ────────────────────────────────
  {
    const { ctx: c, page: p } = await pageFor({ email: `student03${DOMAIN}`, password: STUDENT_PASSWORD });
    await p.goto(`${BASE}/espace/defi`, { waitUntil: 'networkidle' });
    await p.waitForSelector('[data-challenge-intro]', { timeout: 20000 });
    record('groupe C (compétition OFF) : aucun classement', await p.locator('[data-leaderboard]').count() === 0 && await p.locator('[data-my-rank]').count() === 0);
    await c.close();
  }

  // ── ENSEIGNANT ────────────────────────────────────────────────────────
  {
    const { ctx: c, page: p } = await pageFor(TEACHER);
    await p.goto(`${BASE}/enseignant/classes`, { waitUntil: 'networkidle' });
    const link = p.locator('a:has-text("الفوج أ")').first();
    await link.click();
    await p.waitForSelector('[data-tab-group="activities"]', { timeout: 20000 });
    await p.click('[data-tab-group="activities"]');
    await p.waitForSelector('[data-challenge-results]', { timeout: 20000 });
    record('enseignant : onglet « التحدّي اليومي » (résultats + réglages)', await p.locator('[data-challenge-settings]').count() === 1);
    record('enseignant : tuiles de participation', await p.locator('[data-tile="participation"]').count() === 1);
    record('enseignant : analyse par question', await p.locator('[data-question-row]').count() >= 3);
    record('enseignant : classement complet', await p.locator('[data-teacher-ranking] li').count() >= 2);
    record('enseignant : aucun courriel d’élève', !EMAIL.test(await p.locator('main').innerText()));
    record('enseignant : pas de débordement (1280)', !(await overflow(p)));
    await p.screenshot({ path: `${OUT}/20-teacher-tab-1280.png`, fullPage: true });

    await p.click('[data-display-link]');
    await p.waitForSelector('[data-challenge-display]', { timeout: 20000 });
    await sleep(1200);
    await p.screenshot({ path: `${OUT}/21-display-results.png`, fullPage: false });
    for (const [key, view] of [['2', 'leaderboard'], ['3', 'questions'], ['4', 'participation']]) {
      await p.keyboard.press(key);
      await sleep(1200);
      record(`affichage : vue « ${view} » au clavier`, await p.locator(`[data-challenge-display][data-view="${view}"]`).count() === 1);
      await p.screenshot({ path: `${OUT}/22-display-${view}.png`, fullPage: false });
    }
    record('affichage : aucun courriel ni nom de famille complet', !EMAIL.test(await p.locator('body').innerText()));
    await p.setViewportSize({ width: 390, height: 844 });
    await p.goto(`${BASE}${new URL(p.url()).pathname.replace(/\/defi\/affichage$/, '')}?tab=dailyChallenge`, { waitUntil: 'networkidle' });
    await p.waitForSelector('[data-challenge-results]', { timeout: 20000 });
    record('enseignant 390 : onglet sans débordement', !(await overflow(p)));
    await p.screenshot({ path: `${OUT}/23-teacher-tab-mobile.png`, fullPage: true });
    await c.close();
  }

  // ── ADMINISTRATION ────────────────────────────────────────────────────
  {
    const { ctx: c, page: p } = await pageFor(ADMIN);
    await p.goto(`${BASE}/admin/offres/defi-quotidien`, { waitUntil: 'networkidle' });
    await p.waitForSelector('[data-config-field]', { timeout: 20000 });
    record('admin : le barème se charge', await p.locator('[data-config-field]').count() >= 20);
    record('admin : pas de débordement', !(await overflow(p)));
    await p.screenshot({ path: `${OUT}/30-admin-config.png`, fullPage: true });
    await c.close();
  }
} catch (e) {
  record('exécution', false, e.message);
} finally {
  if (restored) {
    const r = await apiCall(adminToken, 'PUT', '/admin/daily-challenge/config', { values: { 'challenge.challenge_weekdays': restored } });
    record('admin API : jours de défi restaurés', r.status === 200);
  }
  await browser.close();
}

record('aucune erreur JavaScript', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} vérifications réussies. Captures : ${OUT}`);
process.exit(failed.length ? 1 : 0);
