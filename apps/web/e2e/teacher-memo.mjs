// QA — la recherche de leçon, « مذكرة الدرس » et le pointeur de « وضع القسم ».
//
// Lancement (Vite sur 5173 et l'API sur 8000 en marche, comptes QA importés) :
//   node apps/web/e2e/teacher-memo.mjs
//
// Deux connexions API seulement (l'API limite /auth/login à 6/min) : le jeton
// est ensuite posé dans localStorage. Captures dans /tmp/teacher-memo-qa.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const STUDENT = { email: process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/teacher-memo-qa';
const LESSON = 'qasim-mushtarak-akbar';
const LESSON_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/qasim-mushtarak-akbar';
const UNIT_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/units/aadad-tabiiya-natiqa';
mkdirSync(OUT, { recursive: true });

let passed = 0;
let failed = 0;
const check = (ok, label) => {
  if (ok) { passed += 1; console.log(`  ✓ ${label}`); } else { failed += 1; console.log(`  ✗ ${label}`); }
};

async function loginToken(who) {
  const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(who) });
  const data = await res.json().catch(() => ({}));
  const token = data.token ?? data.access_token ?? data.data?.token;
  if (!token) throw new Error(`login ${who.email}: ${res.status} ${JSON.stringify(data).slice(0, 120)}`);
  return token;
}

async function contextFor(browser, token, viewport = { width: 1440, height: 900 }) {
  const context = await browser.newContext({ viewport, locale: 'ar-DZ' });
  await context.addInitScript((tk) => { try { localStorage.setItem('token', tk); } catch { /* noop */ } }, token);
  return context;
}

const teacherToken = await loginToken(TEACHER);
const studentToken = await loginToken(STUDENT);
const browser = await chromium.launch();
const errors = [];

try {
  // ── 1. Recherche : enseignant ───────────────────────────────────────────
  console.log('\n1. Recherche — /enseignant/cours');
  const tctx = await contextFor(browser, teacherToken);
  const page = await tctx.newPage();
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  await page.goto(`${BASE}/enseignant/cours`, { waitUntil: 'networkidle' });
  const search = page.locator('[data-lesson-search]');
  check(await search.isVisible(), 'le champ de recherche est affiché');
  check(await page.locator('[data-unit-group]').count() > 0, 'sans recherche : les cartes de وحدة (structure inchangée)');
  await search.fill('القاسم');
  await page.waitForTimeout(250);
  const hits = await page.locator(`a[href="${LESSON_PATH}"]`).count();
  check(hits > 0 && await page.locator('[data-unit-group]').count() === 0, 'en tapant : les leçons trouvées, à plat, sans Entrée');
  await search.fill('PGCD');
  await page.waitForTimeout(900);
  const upper = await page.locator('main a[href^="/courses/moyen/4am"]').count();
  await search.fill('pgcd');
  await page.waitForTimeout(900);
  check(upper > 0 && upper === await page.locator('main a[href^="/courses/moyen/4am"]').count(), 'PGCD / pgcd : mêmes résultats');
  await search.fill('zzzz-rien');
  await page.waitForTimeout(250);
  check(await page.locator('[data-lesson-search-empty]').isVisible(), 'aucun résultat : état vide');
  await page.screenshot({ path: `${OUT}/01-teacher-search-empty.png` });
  await search.fill('');
  await page.waitForTimeout(250);
  check(await page.locator('[data-unit-group]').count() > 0, 'effacer : la structure en وحدات revient');

  // ── 2. Page d'unité : محاور + gestes enseignant ─────────────────────────
  console.log('\n2. Page d’unité — enseignant');
  await page.goto(`${BASE}${UNIT_PATH}`, { waitUntil: 'networkidle' });
  const block = page.locator(`[data-unit-lesson="${LESSON}"]`);
  check(await block.locator('[data-module-chip]').count() === 4, 'les 4 محاور de la leçon, dans l’ordre du config');
  check(await block.locator(`[data-lesson-memo-link="${LESSON}"]`).isVisible(), '« مذكرة الدرس » visible');
  check(await block.locator(`[data-lesson-classroom-link="${LESSON}"]`).isVisible(), '« وضع القسم » visible à côté');
  await block.screenshot({ path: `${OUT}/02-unit-lesson-teacher.png` });

  // ── 3. مذكرة الدرس ─────────────────────────────────────────────────────
  console.log('\n3. مذكرة الدرس');
  await block.locator(`[data-lesson-memo-link="${LESSON}"]`).click();
  await page.waitForURL(`**/enseignant/cours/${LESSON}/memoire`);
  await page.waitForSelector('[data-memo-rail]', { timeout: 15000 }); await page.click('[data-memo-go="all"]'); await page.waitForSelector('[data-memo-rail]'); await page.click('[data-memo-go="all"]'); await page.waitForSelector('[data-memo-timeline]'); // one part at a time since 2026-11-18: these checks read the WHOLE memo
  check(await page.locator('[data-memo-phase]').count() === 4, 'une phase par محور');
  for (const id of ['overview', 'objectives', 'start', 'timeline', 'errors', 'trace', 'evaluation', 'next']) {
    check(await page.locator(`[data-memo-section="${id}"]`).count() === 1, `section ${id}`);
  }
  check(await page.locator('[data-memo-vigilance]').count() > 0, 'points de vigilance tirés des exercices');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(overflow <= 1, `pas de défilement horizontal (${overflow}px)`);
  await page.screenshot({ path: `${OUT}/03-memo-desktop.png`, fullPage: true });

  // Notes : créer, persister, supprimer.
  console.log('\n4. كرّاسي dans la مذكرة');
  const stamp = `ملاحظة QA ${Date.now()}`;
  await page.locator('[data-memo-note-input]').fill(stamp);
  await page.waitForSelector('[data-memo-save-status="saved"]', { timeout: 10000 });
  check(true, 'enregistrement automatique : « ✓ حُفظ »');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-memo-notes-count]');
  const note = page.locator('[data-memo-note]', { hasText: stamp });
  check(await note.count() === 1, 'la note revient après rafraîchissement (une seule, pas de doublon)');
  await page.locator('[data-memo-notes]').screenshot({ path: `${OUT}/04-memo-notes.png` });
  page.once('dialog', (d) => d.accept());
  await note.locator('button[aria-label]').last().click();
  await page.waitForTimeout(800);
  check(await page.locator('[data-memo-note]', { hasText: stamp }).count() === 0, 'suppression');

  // Retour : vers la page d'unité d'où l'on vient.
  await page.goto(`${BASE}${UNIT_PATH}`, { waitUntil: 'networkidle' });
  await page.locator(`[data-lesson-memo-link="${LESSON}"]`).click();
  await page.waitForSelector('[data-memo-back]');
  await page.locator('[data-memo-back]').click();
  await page.waitForURL(`**${UNIT_PATH}`);
  check(true, '« رجوع » ramène à la page d’unité');

  // Une leçon dont le contenu porte des $…$ : KaTeX, isolé en ltr.
  await page.goto(`${BASE}/enseignant/cours/ikhtizal-kasr/memoire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-memo-rail]'); await page.click('[data-memo-go="all"]'); await page.waitForSelector('[data-memo-timeline]');
  check(await page.locator('.sa-math-inline .katex').count() > 0, 'les mathématiques passent par KaTeX (ltr isolé)');
  await page.screenshot({ path: `${OUT}/03b-memo-ikhtizal.png`, fullPage: true });

  // Mobile.
  const mctx = await contextFor(browser, teacherToken, { width: 390, height: 844 });
  const mobile = await mctx.newPage();
  await mobile.goto(`${BASE}/enseignant/cours/${LESSON}/memoire`, { waitUntil: 'networkidle' });
  await mobile.waitForSelector('[data-memo-rail]'); await mobile.click('[data-memo-go="all"]'); await mobile.waitForSelector('[data-memo-timeline]');
  const mOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(mOverflow <= 1, `mobile 390 : pas de défilement horizontal (${mOverflow}px)`);
  await mobile.screenshot({ path: `${OUT}/05-memo-mobile.png`, fullPage: false });
  await mobile.emulateMedia({ media: 'print' });
  check(!(await mobile.locator('[data-memo-toolbar]').isVisible()), 'impression : la barre d’outils disparaît');
  await mctx.close();

  // ── 5. وضع القسم depuis la carte + pointeur ──────────────────────────────
  console.log('\n5. وضع القسم + pointeur');
  await page.goto(`${BASE}${UNIT_PATH}`, { waitUntil: 'networkidle' });
  await page.locator(`[data-lesson-classroom-link="${LESSON}"]`).click();
  await page.waitForSelector('[data-classroom-active="true"]', { timeout: 15000 });
  check(true, 'la carte ouvre la leçon directement en وضع القسم');
  check(await page.locator('[data-classroom-pointer-layer]').count() === 0, 'pointeur éteint par défaut');
  await page.keyboard.press('p');
  await page.waitForSelector('[data-classroom-pointer-layer]');
  check(await page.locator('[data-classroom-pointer-toggle][aria-pressed="true"]').count() === 1, 'P active le pointeur');
  await page.mouse.move(700, 450);
  await page.waitForTimeout(100);
  const box = await page.locator('[data-classroom-pointer]').boundingBox();
  check(box && Math.abs(box.x + box.width / 2 - 700) < 3 && Math.abs(box.y + box.height / 2 - 450) < 3, 'le disque suit la souris');
  check(box && box.width >= 72, `taille L par défaut, visible (${box && Math.round(box.width)}px)`);
  const pe = await page.locator('[data-classroom-pointer-layer]').evaluate((el) => getComputedStyle(el).pointerEvents);
  check(pe === 'none', 'pointer-events: none — il ne prend aucun clic');
  // Un clic sous le pointeur atteint bien la page : « التالي » avance.
  const next = page.locator('[data-classroom-nav-unit="next"], [data-classroom-nav-module="next"]').first();
  const before = page.url();
  const nb = await next.boundingBox();
  await page.mouse.move(nb.x + nb.width / 2, nb.y + nb.height / 2);
  await page.mouse.click(nb.x + nb.width / 2, nb.y + nb.height / 2);
  await page.waitForTimeout(600);
  check(page.url() !== before || await page.locator('[data-classroom-active="true"]').count() === 1, 'le clic traverse le pointeur');
  await page.screenshot({ path: `${OUT}/06-classroom-pointer.png` });
  await page.locator('[data-classroom-pointer-size="s"]').click();
  const small = await page.locator('[data-classroom-pointer]').boundingBox();
  check(small.width < box.width, 'taille S plus petite');
  await page.locator('[data-classroom-pointer-size="l"]').click();
  await page.keyboard.press('Shift+P');
  check(await page.locator('[data-classroom-spotlight]').count() === 1, 'Maj+P : éclairage');
  await page.mouse.move(600, 400);
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${OUT}/07-classroom-spotlight.png` });
  await page.keyboard.press('p');
  check(await page.locator('[data-classroom-pointer-layer]').count() === 0, 'P le désactive');
  await page.locator('[data-classroom-exit]').click();
  await page.waitForSelector('[data-classroom-active="false"]');

  // 1080p (projecteur) : un contexte à cette taille, le pointeur suit l'écran.
  const pctx = await contextFor(browser, teacherToken, { width: 1920, height: 1080 });
  const proj = await pctx.newPage();
  await proj.goto(`${BASE}${UNIT_PATH}`, { waitUntil: 'networkidle' });
  await proj.locator(`[data-lesson-classroom-link="${LESSON}"]`).click();
  await proj.waitForSelector('[data-classroom-active="true"]');
  await proj.locator('[data-classroom-pointer-toggle]').click();
  await proj.mouse.move(960, 540);
  await proj.waitForTimeout(150);
  const big = await proj.locator('[data-classroom-pointer]').boundingBox();
  check(big && Math.round(big.width) === 108, `1080p : diamètre 108px (${big && Math.round(big.width)}px)`);
  await proj.screenshot({ path: `${OUT}/08-classroom-pointer-1080p.png` });
  await pctx.close();
  await tctx.close();

  // ── 6. Élève : recherche oui, مذكرة non ─────────────────────────────────
  console.log('\n6. Élève');
  const sctx = await contextFor(browser, studentToken);
  const sp = await sctx.newPage();
  for (const path of ['/espace/cours', '/espace/explorer']) {
    await sp.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
    const field = sp.locator('[data-lesson-search]');
    check(await field.isVisible(), `${path} : champ de recherche`);
    await field.fill('كسر');
    await sp.waitForTimeout(250);
    check(await sp.locator('main a[href*="ikhtizal-kasr"]').count() > 0, `${path} : résultat en temps réel`);
  }
  await sp.goto(`${BASE}${UNIT_PATH}`, { waitUntil: 'networkidle' });
  check(await sp.locator('[data-lesson-memo-link]').count() === 0, 'page d’unité : aucun bouton مذكرة pour l’élève');
  check(await sp.locator('[data-module-chip]').count() === 0, 'page d’unité élève inchangée');
  await sp.goto(`${BASE}/enseignant/cours/${LESSON}/memoire`, { waitUntil: 'networkidle' });
  check(!sp.url().includes('/memoire') && await sp.locator('[data-lesson-memo]').count() === 0, `URL directe refusée à l’élève (→ ${new URL(sp.url()).pathname})`);
  await sctx.close();

  // Visiteur.
  const vctx = await browser.newContext();
  const vp = await vctx.newPage();
  await vp.goto(`${BASE}/enseignant/cours/${LESSON}/memoire`, { waitUntil: 'networkidle' });
  check(await vp.locator('[data-lesson-memo]').count() === 0, `URL directe refusée au visiteur (→ ${new URL(vp.url()).pathname})`);
  await vctx.close();
} finally {
  await browser.close();
}

if (errors.length) { console.log('\nErreurs de page :'); errors.forEach((e) => console.log(`  ${e}`)); }
console.log(`\n${passed} ✓ · ${failed} ✗ — captures : ${OUT}`);
process.exit(failed || errors.length ? 1 : 0);
