/**
 * QA navigateur — « Mon cahier » (/espace/cahier) : retrouver, ranger,
 * réviser toutes ses notes.
 *
 * Lancement (dev server sur 5173, API sur 8000, élève QA existant) :
 *   node apps/web/e2e/notebook-space.mjs [dossier-captures]
 *
 * Ce qu'on vérifie :
 *   - la progression ne liste plus les notes et n'y renvoie plus (le cahier a son entrée de navigation) ;
 *   - l'entrée de navigation existe (bureau et barre basse mobile) ;
 *   - en-tête : compteurs justes ; vues : les mêmes notes filtrées ;
 *   - la recherche (différée) porte sur le texte nu, pas les balises ;
 *   - filtre par leçon (colonne), tri, « تحميل المزيد » ;
 *   - une carte : type, aperçu, fil de contexte, source, menu ⋮ (importante,
 *     à revoir, archiver, supprimer AVEC confirmation) ;
 *   - la page d'une note : même éditeur, titre/type modifiés → PATCH ;
 *   - sélection multiple + archivage groupé ; impression = un document ;
 *   - la révision active : rappel → révéler → « أعرفها » sort de la file ;
 *   - états vides guidants ; mobile : feuille de filtres, pas de débordement.
 *
 * Les notes de test sont supprimées à la fin.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const EMAIL = process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const LESSON = 'qasim-mushtarak-akbar';
const OUT = process.argv[2] || '/tmp/nb-space-shots';
mkdirSync(OUT, { recursive: true });

const results = [];
const record = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const pageErrors = [];
const consoleErrors = [];
const created = [];

async function api(token, method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

const login = await fetch(`${API}/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
}).then((r) => r.json());
const TOKEN = login.token ?? login.data?.token;
if (!TOKEN) { console.error('Connexion API impossible :', login); process.exit(1); }

// ── Les notes de l'élève QA pour ce scénario ─────────────────────────────
const seed = async (body) => {
  const r = await api(TOKEN, 'POST', '/practice/notes', body);
  if (r.status !== 201) throw new Error(`seed ${r.status} ${JSON.stringify(r.data).slice(0, 160)}`);
  created.push(r.data.note.id);
  return r.data.note;
};
// Vingt notes de remplissage D'ABORD : les quatre notes du scénario sont
// ainsi les plus récentes, donc sur la première page.
for (let i = 0; i < 20; i += 1) await seed({ content: `<p>ملاحظة تعبئة رقم ${i + 1}</p>`, review: false });
const nLesson = await seed({ content: '<p>القواسم المشتركة هي التي <strong>تقسم العددين</strong> معًا.</p>', lessonCode: LESSON, moduleNumber: 1, title: 'قاعدة القواسم المشتركة' });
const nError = await seed({ content: '<p>أخلط بين <strong>PGCD</strong> و PPCM.</p>', lessonCode: LESSON, learningPointCode: '4am_qasim-mushtarak-akbar_P1', exerciseId: 'ex-4am-qasim-mushtarak-akbar-l1-001', questionId: 'q1', mistakeType: 'methode' });
const nQuestion = await seed({ content: '<p>لماذا PGCD(12 ; 18) = 6 ؟</p>', lessonCode: LESSON, noteType: 'question', review: false });
const nLegacy = await seed({ content: 'ملاحظة قديمة بنصّ عادي و $x^2$', lessonCode: LESSON, review: false });
// Un « <span> » dans le HTML seulement : chercher « span » ne doit rien trouver.
const seeded = created.length;

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
  // window.print() n'existe pas en headless : on le remplace, et on émet
  // `afterprint` pour laisser la feuille se replier — le DOCUMENT, lui, est réel.
  await c.addInitScript(() => {
    window.__printed = 0;
    window.print = () => { window.__printed += 1; setTimeout(() => window.dispatchEvent(new Event('afterprint')), 50); };
  });
  return c;
}
function attach(page) {
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/status of (401|404|422)/.test(m.text())) consoleErrors.push(m.text()); });
}

const ctx = await authedContext({ viewport: { width: 1440, height: 900 }, locale: 'ar-DZ' });
const page = await ctx.newPage();
attach(page);
const cards = () => page.locator('[data-note-card]');
// On attend la RÉPONSE de la liste, puis que les cartes (ou l'état vide) soient posées.
const isList = (r) => r.url().includes('/practice/notes?') && r.request().method() === 'GET';
const settle = () => page.waitForFunction(() => !document.querySelector('[aria-busy="true"]') && document.querySelector('[data-note-card], [data-nb-empty], [data-nb-space] .text-rose-700'), null, { timeout: 15000 });
const waitLoaded = async () => { await settle(); };
const act = async (fn) => { const [res] = await Promise.all([page.waitForResponse(isList, { timeout: 15000 }), fn()]); await settle(); return res; };

try {
  // ── Progression ≠ cahier ───────────────────────────────────────────────
  await page.goto(`${BASE}/espace/progression`, { waitUntil: 'networkidle' });
  record('la progression ne liste plus les notes', (await page.locator('.sa-nb-content').count()) === 0);
  record('…et ne contient aucun raccourci vers le cahier', (await page.locator('[data-progression-page] a[href="/espace/cahier"]').count()) === 0);
  const navEntry = page.locator('nav a[href="/espace/cahier"], aside a[href="/espace/cahier"]').first();
  record('l’entrée « كرّاسي » est dans la navigation', (await navEntry.count()) >= 1);
  await act(() => navEntry.click());
  await page.waitForURL(/\/espace\/cahier$/);

  // ── En-tête, compteurs, vues ───────────────────────────────────────────
  const counts = (await api(TOKEN, 'GET', '/practice/notes?view=all&page=1&perPage=1')).data.counts;
  const statVals = await page.locator('[data-nb-stats] p.font-space').allInnerTexts();
  record('les compteurs de l’en-tête = ceux du serveur', statVals[0] === String(counts.all) && statVals[1] === String(counts.review) && statVals[2] === String(counts.errors) && statVals[3] === String(counts.questions), statVals.join(' / '));
  record('20 notes par page, puis « تحميل المزيد »', (await cards().count()) === 20 && (await page.locator('[data-nb-load-more]').count()) === 1, `${await cards().count()} cartes`);
  await act(() => page.click('[data-nb-load-more]'));
  record('la page suivante s’ajoute sans remplacer', (await cards().count()) === counts.all, `${await cards().count()} / ${counts.all}`);
  await page.screenshot({ path: `${OUT}/01-space.png`, fullPage: false });

  await act(() => page.click('[data-nb-view="errors"]'));
  record('vue « أخطائي » : la note d’exercice avec type d’erreur', (await cards().count()) === counts.errors && (await cards().first().getAttribute('data-type')) === 'erreur');
  const trail = await page.locator('[data-note-card] .sa-ns-trail').first().innerText();
  record('la carte dit d’où elle vient : leçon › point › exercice › question', trail.includes('القاسم المشترك') && trail.includes('تمرين') && trail.includes('السؤال 1'), trail.replace(/\n/g, ' '));
  record('« عرض التمرين » mène au hub de pratique de la leçon', (await page.locator('[data-note-source="exercise"]').first().getAttribute('href')) === `/espace/pratique/${LESSON}`);
  record('l’URL porte la vue', page.url().includes('view=errors'));

  await act(() => page.click('[data-nb-view="questions"]'));
  record('vue « أسئلتي »', (await cards().count()) === counts.questions && (await cards().first().getAttribute('data-type')) === 'question');

  // ── Recherche ─────────────────────────────────────────────────────────
  await act(() => page.click('[data-nb-view="all"]'));
  await act(() => page.fill('[data-nb-search]', 'PGCD'));
  const found = await cards().count();
  record('la recherche « PGCD » trouve les deux notes qui en parlent', found === 2, `${found}`);
  await act(() => page.fill('[data-nb-search]', 'strong'));
  record('chercher une balise (« strong ») ne trouve rien : le texte nu, pas le HTML', (await page.locator('[data-nb-empty="search"]').count()) === 1);
  await act(() => page.click('[aria-label="مسح البحث"]'));

  // ── Filtre par leçon (colonne) et tri ─────────────────────────────────
  await act(() => page.click(`[data-nb-filter-lesson="${LESSON}"]`));
  record('le filtre « par leçon » ne garde que les notes de la leçon', (await cards().count()) === 4, `${await cards().count()}`);
  await act(() => page.selectOption('[data-nb-sort]', 'oldest'));
  const firstTitle = await page.locator('[data-note-card] .sa-ns-card-title').first().innerText();
  record('tri « الأقدم » : la première note créée d’abord', firstTitle.includes('قاعدة القواسم'), firstTitle);
  await act(() => page.click(`[data-nb-filter-lesson="${LESSON}"]`)); // désactive
  await act(() => page.selectOption('[data-nb-sort]', 'newest'));

  // ── Une note brute d'avant se lit ─────────────────────────────────────
  const legacyCard = page.locator(`[data-note-card="${nLegacy.id}"]`);
  record('une ancienne note brute est rendue en paragraphes, formule dessinée', (await legacyCard.locator('.sa-nb-content p').count()) >= 1 && (await legacyCard.locator('.katex').count()) >= 1);

  // ── Menu ⋮ : importante, à revoir, archiver, supprimer ─────────────────
  const qCard = page.locator(`[data-note-card="${nQuestion.id}"]`);
  await qCard.locator('button[aria-haspopup="menu"]').click();
  await qCard.locator('[role="menuitem"]', { hasText: 'علّمها كمهمّة' }).click();
  await page.waitForFunction((id) => document.querySelector(`[data-note-card="${id}"]`)?.dataset.pinned === 'true', nQuestion.id);
  record('« مهمّة » depuis le menu : la carte le montre', true);
  await qCard.locator('button[aria-haspopup="menu"]').click();
  await qCard.locator('[role="menuitem"]', { hasText: 'أضفها للمراجعة' }).click();
  await page.waitForFunction((id) => document.querySelector(`[data-note-card="${id}"] [data-kind="review"]`), nQuestion.id);
  record('« للمراجعة » depuis le menu', true);
  await qCard.locator('button[aria-haspopup="menu"]').click();
  await qCard.locator('[role="menuitem"]', { hasText: 'حذف' }).click();
  const confirm = page.locator('[role="alertdialog"]');
  record('supprimer demande confirmation', await confirm.isVisible());
  await confirm.locator('button', { hasText: 'إلغاء' }).click();
  record('annuler garde la note', (await qCard.count()) === 1);

  // ── Sélection multiple + archivage groupé ─────────────────────────────
  await page.locator('[data-note-card] input[type="checkbox"]').nth(5).check();
  await page.locator('[data-note-card] input[type="checkbox"]').nth(6).check();
  record('la barre des actions groupées apparaît avec le compte', (await page.locator('[data-nb-bulk]').innerText()).includes('محدّدتان'));
  const before = await cards().count();
  await page.click('[data-nb-bulk-archive]');
  await page.waitForFunction((n) => document.querySelectorAll('[data-note-card]').length === n - 2, before);
  record('archiver 2 notes les retire de la vue', true);
  await act(() => page.click('[data-nb-view="archived"]'));
  record('elles sont dans « الأرشيف », pas supprimées', (await cards().count()) === 2);
  await act(() => page.click('[data-nb-view="all"]'));

  // ── Impression : un document ──────────────────────────────────────────
  const lCard = page.locator(`[data-note-card="${nLesson.id}"]`);
  await lCard.locator('button[aria-haspopup="menu"]').click();
  await lCard.locator('[role="menuitem"]', { hasText: 'طباعة' }).click();
  await page.locator('[data-nb-print-go]').click();
  await page.waitForFunction(() => window.__printed > 0);
  const printed = await page.evaluate(() => document.getElementById('nb-print-root')?.innerText ?? '');
  record('l’impression produit un document (titre, contexte, note)', printed.includes('كرّاسي') && printed.includes('قاعدة القواسم') && printed.includes('نشاط 4'), printed.slice(0, 80).replace(/\n/g, ' '));

  // ── La page d'une note ────────────────────────────────────────────────
  await page.locator(`[data-note-open="${nError.id}"]`).click();
  await page.waitForURL(new RegExp(`/espace/cahier/${nError.id}$`));
  await page.waitForSelector('[data-nb-detail]');
  record('la page de la note montre le même éditeur et le contexte', (await page.locator('.sa-nb-editor').count()) === 1 && (await page.locator('[data-nb-source]').getAttribute('href')) === `/espace/pratique/${LESSON}`);
  await page.fill('[data-nb-title]', 'خطأ الخلط بين PGCD و PPCM');
  await page.selectOption('[data-nb-type]', 'erreur');
  await page.locator('.sa-nb-editor').click();
  await page.keyboard.press('End');
  await page.keyboard.type(' — يجب أن أتذكّر: الأكبر يقسم.');
  const [patch] = await Promise.all([
    page.waitForResponse((r) => r.url().includes(`/practice/notes/${nError.id}`) && r.request().method() === 'PATCH'),
    page.click('[data-nb-save]'),
  ]);
  const patched = await patch.json();
  record('modifier titre + contenu → PATCH, contexte inchangé', patch.status() === 200 && patched.note.title === 'خطأ الخلط بين PGCD و PPCM' && patched.note.content.includes('الأكبر يقسم') && patched.note.exerciseId === nError.exerciseId && patched.note.moduleNumber === null);
  await page.click('[data-nb-pin]');
  await page.waitForFunction(() => document.querySelector('[data-nb-pin]')?.getAttribute('aria-pressed') === 'true');
  record('⭐ depuis la page de la note', true);
  await page.screenshot({ path: `${OUT}/02-detail.png` });
  await page.click('[data-nb-delete]');
  record('supprimer depuis la page demande confirmation', await page.locator('[role="alertdialog"]').isVisible());
  await page.keyboard.press('Escape');
  await page.click('[data-nb-back]');
  await page.waitForURL(/\/espace\/cahier$/);

  // ── Révision active ───────────────────────────────────────────────────
  await act(() => page.click('[data-nb-view="review"]'));
  const reviewCount = (await api(TOKEN, 'GET', '/practice/notes?view=review&page=1&perPage=1')).data.meta.total;
  record('vue « للمراجعة » : la file, avec le bouton de révision', (await cards().count()) === Math.min(20, reviewCount) && (await page.locator('[data-nb-review-start]').count()) === 1, `${reviewCount} à revoir`);
  await page.click('[data-nb-review-start]');
  await page.waitForSelector('[data-nb-review]');
  record('la révision présente une question et un champ de rappel', (await page.locator('[data-nb-review-answer]').count()) === 1 && (await page.locator('[data-nb-review-progress]').innerText()).startsWith('1 /'));
  await page.fill('[data-nb-review-answer]', 'أتذكّر أنّها تقسم العددين');
  await page.click('[data-nb-review-reveal]');
  record('« أظهر ملاحظتي » montre la note en face de la réponse', (await page.locator('[data-nb-review-note] .sa-nb-content').count()) === 1);
  await page.screenshot({ path: `${OUT}/03-review.png` });
  const [rev] = await Promise.all([
    page.waitForResponse((r) => /\/practice\/notes\/\d+\/review$/.test(r.url())),
    page.click('[data-nb-review-known]'),
  ]);
  const reviewed = await rev.json();
  record('« أعرفها » sort la note de la file (reviewCount 1, traitée)', rev.status() === 200 && reviewed.note.isToReview === false && reviewed.note.reviewCount === 1);
  record('…et passe à la suivante', (await page.locator('[data-nb-review-progress]').innerText()).startsWith('2 /'));

  // ── États vides guidants ──────────────────────────────────────────────
  await page.goto(`${BASE}/espace/cahier?view=pinned`, { waitUntil: 'networkidle' });
  await waitLoaded();
  // (deux notes sont importantes : on cherche un mot absent pour l'état « recherche »)
  await act(() => page.fill('[data-nb-search]', 'zzzz-introuvable'));
  await page.waitForSelector('[data-nb-empty="search"]', { timeout: 5000 });
  record('l’état vide de recherche propose de réinitialiser', (await page.locator('[data-nb-empty="search"] button').count()) === 1);

  // ── Sécurité : la note d'autrui est introuvable dans le cahier ────────
  const foreign = await api(TOKEN, 'GET', '/practice/notes/1');
  record('une note qui n’est pas à moi → 404', foreign.status === 404, String(foreign.status));
} catch (e) {
  record('scénario principal', false, e.message);
  await page.screenshot({ path: `${OUT}/error-main.png` }).catch(() => {});
}
await ctx.close();

// ── Mobile ────────────────────────────────────────────────────────────────
const m = await authedContext({ viewport: { width: 390, height: 844 }, locale: 'ar-DZ', hasTouch: true, isMobile: true });
const mp = await m.newPage();
attach(mp);
try {
  await mp.goto(`${BASE}/espace/cahier`, { waitUntil: 'networkidle' });
  await mp.waitForFunction(() => !document.querySelector('[aria-busy="true"]'), null, { timeout: 15000 });
  const overflow = await mp.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  record('mobile · pas de débordement horizontal', !overflow);
  const nav = mp.locator('nav.lg\\:hidden a[href="/espace/cahier"]');
  record('mobile · « كرّاسي » est dans la barre basse et visible', (await nav.count()) === 1 && (await nav.boundingBox())?.width > 40);
  await mp.click('[data-nb-filters-open]');
  await mp.waitForSelector('[data-nb-filters-sheet]');
  const sheet = await mp.locator('[data-nb-filters-sheet]').boundingBox();
  record('mobile · les filtres s’ouvrent en feuille basse', sheet && sheet.y + sheet.height <= 845 && (await mp.locator('[data-nb-filters-sheet] [data-nb-filters]').count()) === 1);
  await mp.screenshot({ path: `${OUT}/04-mobile-filters.png` });
  await mp.click('[aria-label="إغلاق التصفية"]');
  const card = await mp.locator('[data-note-card]').first().boundingBox();
  record('mobile · une carte tient dans la largeur', card && card.x >= 0 && card.x + card.width <= 390);
  await mp.screenshot({ path: `${OUT}/05-mobile.png` });
} catch (e) {
  record('mobile', false, e.message);
  await mp.screenshot({ path: `${OUT}/error-mobile.png` }).catch(() => {});
}
await m.close();

for (const id of created) await api(TOKEN, 'DELETE', `/practice/notes/${id}`);
console.log(`\n🧹 ${created.length} notes de test supprimées (${seeded} semées)`);
await browser.close();

record('aucune erreur de page (exception JS)', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
record('aucune erreur console inattendue', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} vérifications passées — captures dans ${OUT}`);
process.exit(failed.length ? 1 : 0);
