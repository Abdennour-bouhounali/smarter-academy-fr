/**
 * QA navigateur — le cahier DANS LA LEÇON : un compagnon qui sait où l'élève
 * est, et qui rattache chaque note à cet endroit.
 *
 * Lancement (dev server sur 5173, API sur 8000, élève QA existant) :
 *   node apps/web/e2e/notebook-lesson.mjs [dossier-captures]
 *
 * Scénarios (numérotation du cahier des charges) :
 *   1. Ouverture depuis l'accueil de la leçon → contexte = leçon seule.
 *   2. Ouverture depuis un module → contexte = leçon + module (pas de point
 *      inventé quand le module en enseigne plusieurs).
 *   4. Ouvrir sans écrire ne crée RIEN ; écrire et enregistrer crée UNE note
 *      portant le contexte capturé.
 *   5. Naviguer pendant que le cahier est ouvert : la fenêtre reste, le texte
 *      reste, le contexte de la note en cours ne bouge pas ; une NOUVELLE note
 *      prise ailleurs reçoit le nouveau contexte.
 *   6. Rouvrir une ancienne note depuis « Mon cahier » : son contexte
 *      d'origine s'affiche, et « عرض في الدرس » ramène au module exact.
 *   7. « أضف إلى كرّاسي » sur une brique : la connaissance devient un DÉPART
 *      éditable ; la carte des connaissances n'a pas bougé.
 *   9. Sécurité : un contexte incohérent est refusé par le serveur.
 *   + non-modal : la leçon reste cliquable derrière le cahier ; mobile : les
 *     deux déclencheurs flottants ne se recouvrent pas.
 *
 * Les notes créées sont supprimées à la fin.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const EMAIL = process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const LESSON = 'qasim-mushtarak-akbar';
const LESSON_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/qasim-mushtarak-akbar';
const MODULE1_PATH = `${LESSON_PATH}/baqat`;
const MODULE1_TITLE = 'نشاط 4 — باقات متماثلة';
const OUT = process.argv[2] || '/tmp/nb-lesson-shots';
mkdirSync(OUT, { recursive: true });

const results = [];
const record = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const pageErrors = [];
const consoleErrors = [];
const createdNoteIds = new Set();
const EXPECTED_HTTP = /status of (401|404|422)/;

async function api(token, method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });

  return { status: res.status, data: await res.json().catch(() => ({})) };
}

const login = await fetch(`${API}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
}).then((r) => r.json());
const TOKEN = login.token ?? login.data?.token;
if (!TOKEN) {
  console.error('Connexion API impossible :', login);
  process.exit(1);
}

const browser = await chromium.launch();
let authState = null;
async function authedContext(options) {
  const c = await browser.newContext({ ...options, ...(authState ? { storageState: authState } : {}) });
  if (!authState) {
    const p = await c.newPage();
    await p.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await p.fill('input[type="email"]', EMAIL);
    await p.fill('input[type="password"]', PASSWORD);
    await p.click('button[type="submit"]');
    await p.waitForURL(/\/espace/, { timeout: 20000 });
    authState = await c.storageState();
    await p.close();
  }

  return c;
}

let postCount = 0;
function attach(page) {
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    if (EXPECTED_HTTP.test(m.text())) return;
    consoleErrors.push(m.text());
  });
  page.on('request', (r) => {
    if (r.url().includes('/practice/notes') && r.method() === 'POST') postCount += 1;
  });
  page.on('response', (r) => {
    if (r.url().includes('/practice/notes') && r.request().method() === 'POST' && r.status() === 201) {
      r.json().then((d) => d?.note?.id && createdNoteIds.add(d.note.id)).catch(() => {});
    }
  });
}

const dialog = (page) => page.locator('section[role="dialog"].sa-nb-window');
const editor = (page) => page.locator('.sa-nb-editor');
const trigger = (page) => page.locator('[data-nb-trigger="lesson"]');
const contextLine = (page) => page.locator('.sa-nb-context');

const ctx = await authedContext({ viewport: { width: 1440, height: 900 }, locale: 'ar-DZ' });
const page = await ctx.newPage();
attach(page);

try {
  // ── 1. Accueil de la leçon ───────────────────────────────────────────
  await page.goto(`${BASE}${LESSON_PATH}`, { waitUntil: 'networkidle' });
  await trigger(page).waitFor({ state: 'visible', timeout: 15000 });
  record('le déclencheur « 📓 كرّاسي » est présent sur l’accueil de la leçon', true);
  const mapTrigger = page.locator('[data-km-trigger="true"]');
  const tb = await trigger(page).boundingBox();
  const mb = await mapTrigger.boundingBox();
  record('il ne recouvre pas « 🧠 بطاقتي »', tb && mb && (tb.y + tb.height <= mb.y || mb.y + mb.height <= tb.y), `cahier y=${Math.round(tb?.y)} carte y=${Math.round(mb?.y)}`);

  await trigger(page).click();
  await dialog(page).waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForTimeout(450);
  {
    const b = await dialog(page).boundingBox();
    const vp = page.viewportSize();
    record('le cahier s’ouvre en grand', (await dialog(page).getAttribute('data-size')) === 'large');
    record('le cahier s’ouvre centré dans l’écran', Math.abs(b.x + b.width / 2 - vp.width / 2) < 2 && Math.abs(b.y + b.height / 2 - vp.height / 2) < 2,
      `centre (${Math.round(b.x + b.width / 2)}, ${Math.round(b.y + b.height / 2)}) / (${vp.width / 2}, ${vp.height / 2})`);
  }
  const ctxText1 = await contextLine(page).innerText();
  record('1 · contexte = la leçon, sans module ni point', ctxText1.includes('القاسم المشترك الأكبر') && !ctxText1.includes(MODULE1_TITLE), ctxText1.replace(/\n/g, ' '));
  record('1 · page blanche : l’élève est l’auteur', (await editor(page).getAttribute('data-empty')) === 'true');
  record('ouvrir ne crée AUCUNE note (4)', postCount === 0);
  await page.screenshot({ path: `${OUT}/01-lesson-home.png` });

  // Non-modal : la leçon derrière reste cliquable pendant que le cahier est ouvert.
  const hero = page.locator('h1').first();
  await hero.click({ trial: true }).then(() => record('la leçon reste cliquable derrière le cahier (non modal)', true))
    .catch((e) => record('la leçon reste cliquable derrière le cahier (non modal)', false, e.message.split('\n')[0]));
  const scrollable = await page.evaluate(() => getComputedStyle(document.body).overflow !== 'hidden');
  record('le défilement de la page n’est pas gelé', scrollable);

  // Échap depuis la LEÇON ne ferme pas le cahier ; depuis le cahier, oui.
  await hero.click();
  await page.keyboard.press('Escape');
  record('Échap tapé dans la leçon ne ferme pas le cahier', await dialog(page).isVisible());
  await editor(page).click();
  await page.keyboard.press('Escape');
  await dialog(page).waitFor({ state: 'hidden', timeout: 3000 });
  record('Échap tapé dans le cahier le ferme', true);
  record('aria-pressed du déclencheur suit l’état', (await trigger(page).getAttribute('aria-pressed')) === 'false');

  // ── 2 & 4. Module 1 ───────────────────────────────────────────────────
  await page.goto(`${BASE}${MODULE1_PATH}`, { waitUntil: 'networkidle' });
  await trigger(page).waitFor({ state: 'visible', timeout: 15000 });
  await trigger(page).click();
  await dialog(page).waitFor({ state: 'visible' });
  const ctxText2 = await contextLine(page).innerText();
  record('2 · contexte = leçon + module 1', ctxText2.includes(MODULE1_TITLE), ctxText2.replace(/\n/g, ' '));
  await editor(page).click();
  await page.keyboard.type('لاحظت أن 9 يقسم 90 و 54 معًا');
  const [createRes] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/practice/notes') && r.request().method() === 'POST'),
    page.click('.sa-nb-footer button.sa-nb-btn--primary'),
  ]);
  const created = await createRes.json();
  const sent = JSON.parse(createRes.request().postData() || '{}');
  record('4 · enregistrer crée UNE note (201) avec le contexte capturé',
    createRes.status() === 201 && sent.lessonCode === LESSON && sent.moduleNumber === 1 && !('learningPointCode' in sent) && !('exerciseId' in sent),
    JSON.stringify({ lessonCode: sent.lessonCode, moduleNumber: sent.moduleNumber, lp: sent.learningPointCode ?? null }));
  record('2 · le module enseigne 2 points → aucun point inventé', created.note?.learningPointCode == null && created.note?.moduleNumber === 1 && created.note?.moduleTitle === MODULE1_TITLE);
  record('la réponse nomme le module (titre, slug) pour l’affichage', created.note?.moduleSlug === 'baqat' && !!created.note?.lessonTitle);
  await page.screenshot({ path: `${OUT}/02-module1-saved.png` });

  // ── 5. Naviguer avec le cahier ouvert ─────────────────────────────────
  await editor(page).click();
  await page.keyboard.press('End');
  await page.keyboard.type(' — أكمل لاحقًا');
  await page.waitForSelector('.sa-nb-status[data-state="dirty"]');
  // Le fil d'Ariane de la leçon, DERRIÈRE le cahier ouvert.
  await page.locator(`nav a[href="${LESSON_PATH}"]`).first().click();
  await page.waitForURL((u) => u.pathname === LESSON_PATH, { timeout: 15000 });
  await page.waitForTimeout(400);
  record('5 · la fenêtre reste ouverte après la navigation', await dialog(page).isVisible());
  record('5 · le texte en cours survit à la navigation', (await editor(page).innerText()).includes('أكمل لاحقًا'));
  const ctxAfterNav = await contextLine(page).innerText();
  record('5 · la note en cours garde le contexte du module 1', ctxAfterNav.includes(MODULE1_TITLE), ctxAfterNav.replace(/\n/g, ' '));
  const [patchRes] = await Promise.all([
    page.waitForResponse((r) => r.url().includes(`/practice/notes/${created.note.id}`) && r.request().method() === 'PATCH'),
    page.click('.sa-nb-footer button.sa-nb-btn--primary'),
  ]);
  const patched = await patchRes.json();
  record('5 · enregistrer depuis l’accueil ne déplace pas la note (PATCH, module 1 conservé)', patchRes.status() === 200 && patched.note?.moduleNumber === 1);
  await page.screenshot({ path: `${OUT}/03-open-after-nav.png` });

  // Fermer, rouvrir ICI : nouvelle note, contexte = accueil de la leçon.
  await editor(page).click();
  await page.keyboard.press('Escape');
  await dialog(page).waitFor({ state: 'hidden' });
  await trigger(page).click();
  await dialog(page).waitFor({ state: 'visible' });
  const ctxNew = await contextLine(page).innerText();
  record('5 · une NOUVELLE note prise ici reçoit le contexte de l’accueil', !ctxNew.includes(MODULE1_TITLE) && (await editor(page).getAttribute('data-empty')) === 'true', ctxNew.replace(/\n/g, ' '));
  await editor(page).click();
  await page.keyboard.type('ملاحظة من صفحة الدرس');
  const [createRes2] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/practice/notes') && r.request().method() === 'POST'),
    page.click('.sa-nb-footer button.sa-nb-btn--primary'),
  ]);
  const created2 = await createRes2.json();
  record('5 · …et le serveur l’enregistre sans module', createRes2.status() === 201 && created2.note?.moduleNumber == null && created2.note?.lessonCode === LESSON);
  await editor(page).click();
  await page.keyboard.press('Escape');
  await dialog(page).waitFor({ state: 'hidden' });

  // ── 7. « أضف إلى كرّاسي » sur une brique du module 1 ───────────────────
  await page.goto(`${BASE}${MODULE1_PATH}`, { waitUntil: 'networkidle' });
  const addBtn = page.locator('[data-nb-add="qawasim-mushtaraka"]').first();
  await addBtn.scrollIntoViewIfNeeded();
  const itemsBefore = await page.locator('[data-knowledge-item]').count();
  await addBtn.click();
  await dialog(page).waitFor({ state: 'visible' });
  const starter = await editor(page).innerHTML();
  record('7 · la brique ouvre le cahier avec la connaissance comme DÉPART', starter.includes('data-nb="knowledge"') && starter.includes('القواسم المشتركة لعددين'), starter.slice(0, 120));
  record('7 · le contexte est celui du module', (await contextLine(page).innerText()).includes(MODULE1_TITLE));
  await editor(page).click();
  await page.keyboard.press('End');
  await page.keyboard.type('بكلماتي: العدد الذي يقسم الاثنين معًا.');
  const [createRes3] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/practice/notes') && r.request().method() === 'POST'),
    page.click('.sa-nb-footer button.sa-nb-btn--primary'),
  ]);
  const created3 = await createRes3.json();
  record('7 · la note est de l’élève (éditée), rattachée au module', createRes3.status() === 201 && created3.note?.content.includes('بكلماتي') && created3.note?.moduleNumber === 1);
  const itemsAfter = await page.locator('[data-knowledge-item]').count();
  record('7 · la carte des connaissances n’a pas bougé', itemsAfter === itemsBefore, `${itemsBefore} → ${itemsAfter}`);
  await page.screenshot({ path: `${OUT}/04-from-brick.png` });
  await editor(page).click();
  await page.keyboard.press('Escape');
  await dialog(page).waitFor({ state: 'hidden' });

  // ── 6. Rouvrir depuis « Mon cahier » : contexte d'origine + retour ─────
  await page.goto(`${BASE}/espace/cahier`, { waitUntil: 'networkidle' });
  const noteCard = page.locator(`[data-note-card="${created.note.id}"]`);
  await noteCard.waitFor({ state: 'visible', timeout: 15000 });
  record('6 · la note du module 1 est dans le cahier', (await noteCard.innerText()).includes('لاحظت أن 9'));
  const originText = await noteCard.locator('.sa-ns-trail').innerText();
  record('6 · le cahier affiche son origine (module 1)', originText.includes(MODULE1_TITLE), originText.replace(/\n/g, ' '));
  const link = noteCard.locator('[data-note-source="lesson"]');
  record('6 · « عرض في الدرس » pointe vers le module exact', (await link.getAttribute('href')) === MODULE1_PATH, await link.getAttribute('href'));
  await noteCard.locator(`[data-note-open="${created.note.id}"]`).click();
  await page.waitForSelector('[data-nb-detail]');
  const detailText = await page.locator('[data-nb-detail] aside').innerText();
  record('6 · rouverte hors de la leçon, la note garde son contexte d’origine', detailText.includes(MODULE1_TITLE), detailText.replace(/\n/g, ' ').slice(0, 120));
  await page.screenshot({ path: `${OUT}/05-cahier-reopen.png` });
  await page.click('[data-nb-source]');
  await page.waitForURL((u) => u.pathname === MODULE1_PATH, { timeout: 15000 });
  record('6 · le lien ramène dans le module 1', true);

  // ── 9. Sécurité : le serveur refuse un contexte incohérent ─────────────
  const bad1 = await api(TOKEN, 'POST', '/practice/notes', { content: 'x', lessonCode: LESSON, moduleNumber: 9 });
  const bad2 = await api(TOKEN, 'POST', '/practice/notes', { content: 'x', lessonCode: LESSON, learningPointCode: '4am_qawasim-adad-tabii_P1' });
  const bad3 = await api(TOKEN, 'POST', '/practice/notes', { content: 'x', lessonCode: LESSON, exerciseId: 'ex-4am-qasim-mushtarak-akbar-l1-001', questionId: 'q7' });
  record('9 · module hors leçon → 422', bad1.status === 422, String(bad1.status));
  record('9 · point d’une autre leçon → 422', bad2.status === 422, String(bad2.status));
  record('9 · question inconnue de l’exercice → 422', bad3.status === 422, String(bad3.status));
  const other = await api(TOKEN, 'PATCH', `/practice/notes/${created.note.id}`, { content: 'déplacée ?', lessonCode: 'qawasim-adad-tabii', moduleNumber: 3 });
  record('9 · PATCH ne peut pas déplacer une note (contexte figé)', other.status === 200 && other.data.note?.moduleNumber === 1 && other.data.note?.lessonCode === LESSON);
} catch (e) {
  record('scénario principal', false, e.message);
  await page.screenshot({ path: `${OUT}/error-main.png` }).catch(() => {});
}
await ctx.close();

// ── Mobile : les deux déclencheurs flottants restent atteignables ────────
const m = await authedContext({ viewport: { width: 390, height: 844 }, locale: 'ar-DZ', hasTouch: true, isMobile: true });
const mp = await m.newPage();
attach(mp);
try {
  await mp.goto(`${BASE}${MODULE1_PATH}`, { waitUntil: 'networkidle' });
  await trigger(mp).waitFor({ state: 'visible', timeout: 15000 });
  const tb = await trigger(mp).boundingBox();
  const mb = await mp.locator('[data-km-trigger="true"]').boundingBox();
  const disjoint = tb && mb && (tb.y + tb.height <= mb.y || mb.y + mb.height <= tb.y || tb.x + tb.width <= mb.x || mb.x + mb.width <= tb.x);
  const inside = tb.x >= 0 && tb.y >= 0 && tb.x + tb.width <= 390 && tb.y + tb.height <= 844 && tb.height >= 44;
  record('mobile · les déclencheurs cahier/carte ne se recouvrent pas et restent dans l’écran', disjoint && inside, `cahier (${Math.round(tb.x)},${Math.round(tb.y)}) carte (${Math.round(mb.x)},${Math.round(mb.y)})`);
  await trigger(mp).tap();
  await dialog(mp).waitFor({ state: 'visible' });
  record('mobile · le cahier s’ouvre au doigt avec le contexte du module', (await contextLine(mp).innerText()).includes(MODULE1_TITLE));
  await mp.screenshot({ path: `${OUT}/06-mobile-module.png` });
} catch (e) {
  record('mobile', false, e.message);
  await mp.screenshot({ path: `${OUT}/error-mobile.png` }).catch(() => {});
}
await m.close();

for (const id of createdNoteIds) await api(TOKEN, 'DELETE', `/practice/notes/${id}`);
console.log(`\n🧹 ${createdNoteIds.size} notes de test supprimées`);
await browser.close();

record('aucune erreur de page (exception JS)', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
record('aucune erreur console inattendue', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} vérifications passées — captures dans ${OUT}`);
process.exit(failed.length ? 1 : 0);
