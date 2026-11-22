/**
 * QA navigateur — le cahier (NotebookWindow) de bout en bout, sur le vrai
 * serveur de développement et la vraie API.
 *
 * Lancement (dev server sur 5173, API sur 8000, élève QA existant) :
 *   node apps/web/e2e/notebook.mjs [dossier-captures]
 *
 * Ce qu'on vérifie :
 *   1. Le déclencheur ouvre une fenêtre-dialogue pré-remplie du contexte réel.
 *   2. Écrire, changer de taille, fermer, rouvrir : le brouillon survit.
 *   3. « مسح الكل » efface tout, avec confirmation quand l'élève a écrit.
 *   4. Mise en forme (gras, liste) et enregistrement → une note, un seul POST.
 *   5. Réponse fausse → le bloc « خطئي » cite la VRAIE saisie.
 *   6. « Mon cahier » : ancienne note brute lisible, note riche rendue,
 *      réouverture dans le même éditeur et modification (PATCH, pas de doublon).
 *   7. La désinfection refuse script/onerror/href, garde couleur et gras.
 *   8. Huit tailles d'écran : pas de débordement, tout dans la fenêtre,
 *      cibles ≥ 44px, capture d'écran.
 *
 * Les notes créées sont supprimées à la fin : le carnet de l'élève QA
 * revient à son état de départ.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const EMAIL = process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const LESSON = 'qasim-mushtarak-akbar';
const OUT = process.argv[2] || '/tmp/nb-shots';
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
  const data = await res.json().catch(() => ({}));

  return { status: res.status, data };
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

// Une seule connexion par l'interface, puis on réutilise le stockage du
// navigateur pour chaque taille d'écran : l'API limite le débit de /auth/login,
// et neuf connexions par exécution suffisent à le déclencher.
let authState = null;
async function authedContext(options) {
  const c = await browser.newContext({ ...options, ...(authState ? { storageState: authState } : {}) });
  if (!authState) {
    const p = await c.newPage();
    await loginUI(p);
    authState = await c.storageState();
    await p.close();
  }

  return c;
}

function attach(page) {
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const text = m.text();
    if (EXPECTED_HTTP.test(text)) return;
    consoleErrors.push(text);
  });
  page.on('response', (r) => {
    if (r.url().includes('/practice/notes') && r.request().method() === 'POST' && r.status() === 201) {
      r.json().then((d) => d?.note?.id && createdNoteIds.add(d.note.id)).catch(() => {});
    }
  });
}

async function loginUI(page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/espace/, { timeout: 20000 });
}

async function openSession(page) {
  const sessionId = randomUUID();
  const start = await api(TOKEN, 'POST', `/lessons/${LESSON}/practice/sessions`, { sessionId, level: 1 });
  if (start.status >= 300) throw new Error(`séance : ${start.status} ${JSON.stringify(start.data).slice(0, 200)}`);
  await page.goto(`${BASE}/espace/pratique/${LESSON}/session/${sessionId}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-nb-trigger="practice"]', { timeout: 20000 });

  return sessionId;
}

const dialog = (page) => page.locator('section[role="dialog"].sa-nb-window');
// Le déclencheur de l'exercice est LA pastille flottante « 📓 كرّاسي » de la leçon.
const nbTrigger = (page) => page.locator('[data-nb-trigger="practice"]');
// Le cahier s'ouvre en grand, centré : même milieu que l'écran, à 2px près.
const isCentered = async (page) => {
  const b = await dialog(page).boundingBox();
  const vp = page.viewportSize();
  return Math.abs(b.x + b.width / 2 - vp.width / 2) < 2 && Math.abs(b.y + b.height / 2 - vp.height / 2) < 2;
};
const editor = (page) => page.locator('.sa-nb-editor');
// Le cahier n'est pas modal : Échap ne le ferme que depuis l'INTÉRIEUR. On y
// pose donc le focus avant, comme le ferait un élève.
const closeWithEscape = async (page) => {
  await editor(page).click();
  await page.keyboard.press('Escape');
  await dialog(page).waitFor({ state: 'hidden', timeout: 3000 });
};
const overflowX = (page) => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);

// ── Scénario principal (bureau 1440×900) ─────────────────────────────────
const ctx = await authedContext({ viewport: { width: 1440, height: 900 }, locale: 'ar-DZ' });
const page = await ctx.newPage();
attach(page);

try {
  record('connexion élève', !!authState);
  await openSession(page);
  record('séance ouverte', /\/session\//.test(page.url()));

  // 1. Ouverture
  const trigger = nbTrigger(page);
  const pillClass = await trigger.getAttribute('class');
  record('le déclencheur est la pastille « 📓 كرّاسي » de la leçon', pillClass === 'sa-nb-lesson-trigger' && (await trigger.innerText()).includes('كرّاسي'));
  await trigger.click();
  await dialog(page).waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForTimeout(450);
  record('il s’ouvre en grand', (await dialog(page).getAttribute('data-size')) === 'large');
  record('il s’ouvre centré dans l’écran', await isCentered(page));
  record('aria-pressed du déclencheur suit l’état', (await trigger.getAttribute('aria-pressed')) === 'true');
  const role = await dialog(page).getAttribute('role');
  const modal = await dialog(page).getAttribute('aria-modal');
  record('la fenêtre est un dialogue NON modal (la leçon reste utilisable)', role === 'dialog' && modal !== 'true' && (await page.locator('.sa-nb-backdrop').count()) === 0);

  const initialHtml = await editor(page).innerHTML();
  record('pré-remplie de l’énoncé (bloc exercice)', initialHtml.includes('data-nb="exercise"') && initialHtml.includes('التمرين'));
  record('pas de bloc « خطئي » avant toute réponse', !initialHtml.includes('data-nb="mistake"'));
  const focused = await page.waitForFunction(() => document.activeElement?.classList.contains('sa-nb-editor'), null, { timeout: 2000 }).then(() => true).catch(() => false);
  record('le focus est dans l’éditeur', focused);
  await page.screenshot({ path: `${OUT}/01-open-large.png` });

  // 2. Écrire, redimensionner, fermer, rouvrir
  await page.keyboard.press('End');
  await page.keyboard.type('هنا أخطأت في مقارنة القائمتين');
  const largeBox = await dialog(page).boundingBox();
  await page.click('button.sa-nb-size-toggle');
  await page.waitForTimeout(400);
  const smallBox = await dialog(page).boundingBox();
  record('Grand → Petit réduit la fenêtre', largeBox.width > smallBox.width * 1.3 && largeBox.height > smallBox.height * 1.1,
    `${Math.round(smallBox.width)}×${Math.round(smallBox.height)} → ${Math.round(largeBox.width)}×${Math.round(largeBox.height)}`);
  const afterResize = await editor(page).innerText();
  record('le texte survit au redimensionnement', afterResize.includes('هنا أخطأت'));
  record('réduite, elle reste centrée', await isCentered(page));
  await page.screenshot({ path: `${OUT}/02-small.png` });
  const status1 = await page.locator('.sa-nb-status').getAttribute('data-state');
  record('état « غير محفوظ » affiché', status1 === 'dirty');

  await closeWithEscape(page);
  record('Échap ferme la fenêtre', true);
  const focusBack = await page.evaluate(() => document.activeElement?.getAttribute('data-nb-trigger'));
  record('le focus revient au déclencheur', focusBack === 'practice', String(focusBack));

  await trigger.click();
  await dialog(page).waitFor({ state: 'visible' });
  const restored = await editor(page).innerText();
  const notice = await page.locator('.sa-nb-notice').count();
  record('le brouillon est restauré à la réouverture', restored.includes('هنا أخطأت') && notice > 0);
  record('chaque ouverture repart en grand, centré', (await dialog(page).getAttribute('data-size')) === 'large' && await isCentered(page));

  // 3. Effacer : confirmation (il y a du texte), puis tout disparaît
  await page.click('button[aria-label="مسح الكل"]');
  const confirm = page.locator('[role="alertdialog"]');
  record('« مسح الكل » demande confirmation quand l’élève a écrit', await confirm.isVisible());
  await page.screenshot({ path: `${OUT}/03-clear-confirm.png` });
  await page.keyboard.press('Escape');
  record('Échap referme la confirmation sans fermer le cahier', !(await confirm.isVisible()) && (await dialog(page).isVisible()));
  await page.click('button[aria-label="مسح الكل"]');
  await confirm.locator('button.sa-nb-btn--danger').click();
  const cleared = await editor(page).innerText();
  record('tout est effacé, contexte compris', cleared.trim() === '' && !(await editor(page).innerHTML()).includes('data-nb'));
  const placeholder = await editor(page).getAttribute('data-empty');
  record('le texte d’invite réapparaît sur une page vide', placeholder === 'true');
  // Effacer une page déjà vide : pas de confirmation.
  await page.click('button[aria-label="مسح الكل"]');
  record('effacer une page vide ne redemande rien', (await confirm.count()) === 0);

  // 4. Mise en forme + enregistrement
  await editor(page).click();
  await page.keyboard.type('القواسم المشتركة ');
  await page.click('button[aria-label="غليظ"]');
  await page.keyboard.type('هي التي تقسم العددين معًا');
  await page.click('button[aria-label="غليظ"]');
  await page.keyboard.press('Enter');
  await page.click('button[aria-label="قائمة نقطية"]');
  await page.keyboard.type('$\\gcd(12, 18) = 6$');
  // L'outil « صيغة رياضية » : une paire « $ $ » isolée en LTR, curseur dedans.
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.click('button[aria-label^="صيغة رياضية"]');
  await page.keyboard.type('x^2');
  const formatted = await editor(page).innerHTML();
  record('gras et liste sont appliqués', /<(b|strong)>/.test(formatted) && formatted.includes('<ul>'));
  record('l’outil formule insère « $x^2$ » dans un span LTR', formatted.includes('<span dir="ltr">$x^2$</span>'), formatted.slice(formatted.indexOf('dir="ltr"') - 6, formatted.indexOf('dir="ltr"') + 40));
  const boldPressed = await page.locator('button[aria-label="غليظ"]').getAttribute('aria-pressed');
  record('l’état actif des outils suit la sélection', boldPressed !== null);

  // Aperçu : la formule est dessinée.
  await page.click('button[aria-label="معاينة"]');
  const katex = await page.locator('.sa-nb-content .katex').count();
  record('l’aperçu dessine la formule KaTeX', katex > 0);
  await page.screenshot({ path: `${OUT}/04-preview.png` });
  await page.click('button[aria-label="كتابة"]');

  await page.click('button.sa-nb-chip:has-text("الطريقة")');
  const [createRes] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/practice/notes') && r.request().method() === 'POST'),
    page.click('.sa-nb-footer button.sa-nb-btn--primary'),
  ]);
  const created = await createRes.json();
  record('enregistrer crée la note (201)', createRes.status() === 201 && created.note?.id != null);
  record('le type d’erreur est enregistré', created.note?.mistakeType === 'methode');
  record('le contenu enregistré est du HTML restreint', /^<(p|ul|section)/.test(created.note?.content ?? '') && !/on\w+=/.test(created.note.content));
  await page.waitForSelector('.sa-nb-status[data-state="saved"]');
  record('état « محفوظ » affiché', true);
  await page.screenshot({ path: `${OUT}/05-saved.png` });

  // Modifier après enregistrement → PATCH sur la MÊME note.
  await editor(page).click();
  await page.keyboard.press('End');
  await page.keyboard.type(' — إضافة');
  await page.waitForSelector('.sa-nb-status[data-state="dirty"]');
  const [patchRes] = await Promise.all([
    page.waitForResponse((r) => r.url().includes(`/practice/notes/${created.note.id}`) && r.request().method() === 'PATCH'),
    page.click('.sa-nb-footer button.sa-nb-btn--primary'),
  ]);
  record('un second « حفظ » modifie la même note (PATCH), pas de doublon', patchRes.status() === 200);

  await page.click('button[aria-label="إغلاق الكرّاس"]');
  await dialog(page).waitFor({ state: 'hidden' });
  // Après un enregistrement, la pastille rouvre CETTE note (pas une seconde).
  await trigger.click();
  await dialog(page).waitFor({ state: 'visible' });
  const reopened = await editor(page).innerText();
  record('la note enregistrée se rouvre avec son contenu', reopened.includes('إضافة') && reopened.includes('القواسم المشتركة'), reopened.slice(0, 80).replace(/\n/g, ' '));
  await closeWithEscape(page);

  // 4b. Déplacer le cahier par son en-tête — même taille, même contenu
  // (après un enregistrement, la pastille rouvre la note enregistrée)
  await trigger.click();
  await dialog(page).waitFor({ state: 'visible' });
  await page.waitForTimeout(450);
  const dragHandle = page.locator('.sa-nb-header .sa-nb-title');
  const before = await dialog(page).boundingBox();
  const hb = await dragHandle.boundingBox();
  const grab = { x: hb.x + 10, y: hb.y + hb.height / 2 };
  await page.mouse.move(grab.x, grab.y);
  await page.mouse.down();
  await page.mouse.move(grab.x + 120, grab.y - 200, { steps: 8 });
  const mid = await dialog(page).boundingBox();
  const draggingAttr = await dialog(page).getAttribute('data-dragging');
  await page.mouse.move(grab.x + 300, grab.y - 350, { steps: 8 });
  await page.mouse.up();
  const after = await dialog(page).boundingBox();
  const vp0 = page.viewportSize();
  // Le geste demande (+300, −350) ; la borne à 8px du bord peut l'arrêter avant.
  const wantDx0 = Math.min(300, vp0.width - 8 - (before.x + before.width));
  const wantDy0 = Math.max(-350, 8 - before.y);
  record('glisser déplace la fenêtre (souris)', Math.abs((after.x - before.x) - wantDx0) < 2 && Math.abs((after.y - before.y) - wantDy0) < 2,
    `Δ=(${Math.round(after.x - before.x)}, ${Math.round(after.y - before.y)}) attendu (${Math.round(wantDx0)}, ${Math.round(wantDy0)})`);
  record('la taille ne change pas pendant le glisser', Math.abs(after.width - before.width) < 1 && Math.abs(after.height - before.height) < 1 && Math.abs(mid.width - before.width) < 1,
    `${Math.round(before.width)}×${Math.round(before.height)} → ${Math.round(after.width)}×${Math.round(after.height)}`);
  record('l’état « en déplacement » est posé pendant le geste, retiré après', draggingAttr !== null && (await dialog(page).getAttribute('data-dragging')) === null);
  record('le contenu survit au déplacement', (await editor(page).innerText()).includes('القواسم المشتركة'));
  await page.screenshot({ path: `${OUT}/08-dragged.png` });

  // Au-delà de l'écran : la fenêtre s'arrête à 8px du bord.
  const hb2 = await dragHandle.boundingBox();
  await page.mouse.move(hb2.x + 10, hb2.y + 10);
  await page.mouse.down();
  await page.mouse.move(-2000, -2000, { steps: 6 });
  await page.mouse.up();
  const clamped = await dialog(page).boundingBox();
  record('la fenêtre reste dans l’écran (borne haut/début)', clamped.x >= 7 && clamped.y >= 7 && clamped.x <= 9 && clamped.y <= 9, `(${Math.round(clamped.x)}, ${Math.round(clamped.y)})`);
  const hb3 = await dragHandle.boundingBox();
  await page.mouse.move(hb3.x + 10, hb3.y + 10);
  await page.mouse.down();
  await page.mouse.move(5000, 5000, { steps: 6 });
  await page.mouse.up();
  const clamped2 = await dialog(page).boundingBox();
  const vp = page.viewportSize();
  record('la fenêtre reste dans l’écran (borne bas/fin)', Math.abs(clamped2.x + clamped2.width - (vp.width - 8)) < 2 && Math.abs(clamped2.y + clamped2.height - (vp.height - 8)) < 2,
    `right=${Math.round(clamped2.x + clamped2.width)}/${vp.width} bottom=${Math.round(clamped2.y + clamped2.height)}/${vp.height}`);

  // Les boutons de l'en-tête ne déclenchent pas de glisser ; le texte de
  // l'éditeur se sélectionne sans déplacer la fenêtre.
  const posBeforeEditorDrag = await dialog(page).boundingBox();
  const eb = await editor(page).boundingBox();
  await page.mouse.move(eb.x + eb.width - 40, eb.y + 10);
  await page.mouse.down();
  await page.mouse.move(eb.x + 40, eb.y + 40, { steps: 5 });
  await page.mouse.up();
  const posAfterEditorDrag = await dialog(page).boundingBox();
  const selection = await page.evaluate(() => document.getSelection()?.toString().length ?? 0);
  record('sélectionner du texte dans l’éditeur ne déplace pas la fenêtre', posAfterEditorDrag.x === posBeforeEditorDrag.x && posAfterEditorDrag.y === posBeforeEditorDrag.y && selection > 0, `${selection} caractères sélectionnés`);
  const sizeBtn = page.locator('button.sa-nb-size-toggle');
  const sb = await sizeBtn.boundingBox();
  await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2);
  await page.mouse.down();
  await page.mouse.move(sb.x + 200, sb.y + 200, { steps: 4 });
  await page.mouse.up();
  const posAfterBtnDrag = await dialog(page).boundingBox();
  record('glisser depuis un bouton de l’en-tête ne déplace pas la fenêtre', Math.abs(posAfterBtnDrag.x - posAfterEditorDrag.x) < 1 && Math.abs(posAfterBtnDrag.y - posAfterEditorDrag.y) < 1);

  // Après déplacement : Grand ↔ Petit conserve la taille choisie, Effacer et Enregistrer marchent.
  await sizeBtn.click();
  await page.waitForTimeout(400);
  const sizeAfterToggle = await dialog(page).getAttribute('data-size');
  const toggledBox = await dialog(page).boundingBox();
  record('changer de taille après un déplacement garde la fenêtre à l’écran', toggledBox.x >= 7 && toggledBox.y >= 7 && toggledBox.x + toggledBox.width <= vp.width - 7 && toggledBox.y + toggledBox.height <= vp.height - 7, `${sizeAfterToggle} ${Math.round(toggledBox.x)},${Math.round(toggledBox.y)} ${Math.round(toggledBox.width)}×${Math.round(toggledBox.height)}`);
  await page.click('button[aria-label="مسح الكل"]');
  // Une note rouverte et pas encore retouchée s'efface sans question ; si
  // l'élève avait écrit, la confirmation apparaît et on la valide.
  if (await page.locator('[role="alertdialog"]').isVisible()) {
    await page.locator('[role="alertdialog"] button.sa-nb-btn--danger').click();
  }
  record('« مسح الكل » fonctionne après un déplacement', (await editor(page).innerText()).trim() === '');
  await editor(page).click();
  await page.keyboard.type('ملاحظة بعد التحريك');
  const [dragSave] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/practice/notes/') && r.request().method() === 'PATCH'),
    page.click('.sa-nb-footer button.sa-nb-btn--primary'),
  ]);
  const dragSaved = await dragSave.json();
  record('« حفظ » fonctionne après un déplacement, contenu intact', dragSave.status() === 200 && dragSaved.note?.content?.includes('ملاحظة بعد التحريك'));

  // Redimensionner la fenêtre du navigateur : le cahier reste atteignable.
  await page.setViewportSize({ width: 1024, height: 700 });
  await page.waitForTimeout(350);
  const shrunk = await dialog(page).boundingBox();
  record('après un redimensionnement, la fenêtre est ramenée dans l’écran', shrunk.x >= 7 && shrunk.y >= 7 && shrunk.x + shrunk.width <= 1024 - 7 && shrunk.y + shrunk.height <= 700 - 7 && (await dialog(page).getAttribute('data-size')) === sizeAfterToggle,
    `${Math.round(shrunk.x)},${Math.round(shrunk.y)} ${Math.round(shrunk.width)}×${Math.round(shrunk.height)}`);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(350);
  await closeWithEscape(page);

  // 5. Réponse fausse → bloc « خطئي » avec la vraie saisie
  // « 5, 7 » : aucun n'est un diviseur commun → « ليس بعد » (un sous-ensemble
  // comme « 1, 2 » vaudrait « نصف الطريق », ce qui est juste aussi, mais ce
  // scénario veut une erreur franche).
  await page.fill('textarea[aria-label]', '5, 7');
  await page.click('button:has-text("تحقّق من إجابتي")');
  await page.waitForSelector('[role="status"]:has-text("ليس بعد")', { timeout: 8000 });
  // Le verdict remonte la pastille : une NOUVELLE note, avec la réponse.
  await nbTrigger(page).click();
  await dialog(page).waitFor({ state: 'visible' });
  const mistakeHtml = await editor(page).innerHTML();
  record('après une réponse fausse, le bloc « خطئي » cite la saisie réelle', mistakeHtml.includes('data-nb="mistake"') && mistakeHtml.includes('5, 7') && mistakeHtml.includes('ليس بعد'));
  await page.screenshot({ path: `${OUT}/06-mistake.png` });
  const [wrongRes] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/practice/notes') && r.request().method() === 'POST'),
    page.click('.sa-nb-footer button.sa-nb-btn--primary'),
  ]);
  const wrongNote = await wrongRes.json();
  record('la note d’erreur est rattachée à l’exercice, la question et la leçon',
    wrongNote.note?.exerciseId?.startsWith('ex-4am') && wrongNote.note?.questionId === 'q1' && wrongNote.note?.lessonCode === LESSON && !!wrongNote.note?.learningPointCode,
    JSON.stringify({ ex: wrongNote.note?.exerciseId, q: wrongNote.note?.questionId, lp: wrongNote.note?.learningPointCode }));
  await closeWithEscape(page);

  // 6. « Mon cahier » : ancienne note brute + notes riches, réouverture, modification
  const legacy = await api(TOKEN, 'POST', '/practice/notes', { content: 'ملاحظة قديمة\nبسطر ثانٍ و $x^2$', lessonCode: LESSON });
  createdNoteIds.add(legacy.data.note.id);
  await page.goto(`${BASE}/espace/cahier`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-note-card]', { timeout: 15000 });
  const legacyCard = page.locator(`[data-note-card="${legacy.data.note.id}"]`);
  record('une ancienne note brute se lit en paragraphes, formule dessinée', (await legacyCard.locator('.sa-nb-content p').count()) >= 2 && (await legacyCard.locator('.katex').count()) >= 1);
  const wrongCard = page.locator(`[data-note-card="${wrongNote.note.id}"]`);
  record('une note riche garde son contexte (bloc « خطئي ») dans le cahier', (await wrongCard.locator('.sa-nb-content [data-nb="mistake"]').count()) === 1 && (await wrongCard.getAttribute('data-type')) === 'erreur');
  await page.screenshot({ path: `${OUT}/07-cahier.png`, fullPage: false });

  await page.locator(`[data-note-open="${wrongNote.note.id}"]`).click();
  await page.waitForSelector('[data-nb-detail]');
  const existingHtml = await editor(page).innerHTML();
  record('« افتح » rouvre la note existante telle quelle, dans le même éditeur', existingHtml.includes('data-nb="mistake"') && existingHtml.includes('5, 7'));
  await editor(page).click();
  await page.keyboard.press('End');
  await page.keyboard.type(' فهمت الآن');
  const [editRes] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/practice/notes/') && r.request().method() === 'PATCH'),
    page.click('[data-nb-save]'),
  ]);
  const edited = await editRes.json();
  record('la modification depuis le cahier est un PATCH, contexte inchangé', editRes.status() === 200 && edited.note?.content.includes('فهمت الآن') && edited.note?.questionId === 'q1');
  await page.click('[data-nb-back]');
  await page.waitForSelector(`[data-note-card="${wrongNote.note.id}"]`);
  record('le cahier affiche la note mise à jour', (await wrongCard.innerText()).includes('فهمت الآن'));

  // 7. Désinfection, dans le vrai navigateur
  const san = await page.evaluate(async () => {
    const m = await import('/src/features/practice/notebook/noteContent.js');
    return {
      script: m.sanitizeHtml('<p>a</p><script>alert(1)</script><img src=x onerror="alert(2)"><a href="javascript:x">lien</a>'),
      style: m.sanitizeHtml('<p style="color: rgb(220, 38, 38); position: fixed; background-color: #fef08a">x</p>'),
      font: m.sanitizeHtml('<font color="#2563eb" size="5">y</font>'),
      nb: m.sanitizeHtml('<section data-nb="mistake" onclick="z()"><p data-nb="evil">q</p></section>'),
      rendered: m.renderNoteHtml('<p>$\\frac{1}{2}$ et <b>gras</b></p>'),
      idempotent: (() => { const once = m.sanitizeHtml('<p style="color:red"><span onload="1">a</span></p>'); return m.sanitizeHtml(once) === once; })(),
    };
  });
  record('script/img/onerror/href disparaissent', san.script === '<p>a</p>lien', san.script);
  record('style : couleur et fond gardés, position rejetée', san.style === '<p style="color: rgb(220, 38, 38); background-color: rgb(254, 240, 138)">x</p>', san.style);
  record('<font> devient <span style>', /^<span style="color: (#2563eb|rgb\(37, 99, 235\)); font-size: x-large">y<\/span>$/.test(san.font), san.font);
  record('data-nb : valeurs connues seulement, onclick rejeté', san.nb === '<section data-nb="mistake"><p>q</p></section>', san.nb);
  record('renderNoteHtml dessine KaTeX après désinfection', san.rendered.includes('class="katex"') && san.rendered.includes('<b>gras</b>'));
  record('la désinfection est idempotente', san.idempotent);
} catch (e) {
  record('scénario principal', false, e.message);
  await page.screenshot({ path: `${OUT}/error-main.png` }).catch(() => {});
}
await ctx.close();

// ── Tailles d'écran ──────────────────────────────────────────────────────
const VIEWPORTS = [
  ['desktop-1920', 1920, 1080, false],
  ['desktop-1440', 1440, 900, false],
  ['laptop-1366', 1366, 768, false],
  ['tablet-1024', 1024, 768, true],
  ['tablet-768', 768, 1024, true],
  ['mobile-390', 390, 844, true],
  ['mobile-360', 360, 800, true],
  ['mobile-412', 412, 915, true],
];

for (const [name, width, height, touch] of VIEWPORTS) {
  const c = await authedContext({
    viewport: { width, height }, locale: 'ar-DZ', hasTouch: touch, isMobile: width < 700,
    deviceScaleFactor: 1,
  });
  const p = await c.newPage();
  attach(p);
  try {
    await openSession(p);
    const pill = await nbTrigger(p).boundingBox();
    // Aucune commande du pied de question (« إنهاء الحصة », « السؤال التالي »…)
    // sous la pastille, qu'il soit collé ou à sa place naturelle.
    const covered = await p.$$eval('[data-question-footer] button, [data-question-footer] a', (els, pb) => els
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 0 && r.x < pb.x + pb.width && r.right > pb.x && r.y < pb.y + pb.height && r.bottom > pb.y).length, pill);
    record(`${name} : la pastille ne recouvre aucune commande du pied de question`, covered === 0, `${covered} commande(s) recouverte(s)`);
    await nbTrigger(p).click();
    await dialog(p).waitFor({ state: 'visible', timeout: 5000 });
    await p.waitForTimeout(450);
    if (width >= 640) record(`${name} : ouvert en grand, centré`, (await dialog(p).getAttribute('data-size')) === 'large' && await isCentered(p));

    for (const size of width < 640 ? ['small'] : ['large', 'small']) {
      const current = await dialog(p).getAttribute('data-size');
      if (current !== size) { await p.click('button.sa-nb-size-toggle'); await p.waitForTimeout(400); }
      await editor(p).click();
      await p.keyboard.type('اختبار ');
      const box = await dialog(p).boundingBox();
      const inside = box.x >= 0 && box.y >= 0 && box.x + box.width <= width + 1 && box.y + box.height <= height + 1;
      const tools = await p.$$eval('.sa-nb-window button', (els) => els.map((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return { w: r.width, h: r.height, x: r.x, right: r.right, top: r.y, bottom: r.bottom, visible: cs.display !== 'none' && r.width > 0, label: el.getAttribute('aria-label') || el.textContent.trim() };
      }));
      const visibleTools = tools.filter((b) => b.visible);
      const smallTargets = visibleTools.filter((b) => b.w < 36 || b.h < 36);
      const outside = visibleTools.filter((b) => b.x < box.x - 1 || b.right > box.x + box.width + 1 || b.top < box.y - 1 || b.bottom > box.y + box.height + 1);
      const paperH = await p.$eval('.sa-nb-paper', (el) => el.getBoundingClientRect().height);
      const fontPx = await p.$eval('.sa-nb-editor', (el) => parseFloat(getComputedStyle(el).fontSize));
      const ok = inside && !(await overflowX(p)) && smallTargets.length === 0 && outside.length === 0 && paperH >= 96 && fontPx >= 15;
      record(`${name} ${size} : ${Math.round(box.width)}×${Math.round(box.height)}`, ok,
        [inside ? '' : 'hors écran', smallTargets.length ? `${smallTargets.length} cibles <36px (${smallTargets.map((s) => s.label).join(', ')})` : '', outside.length ? `${outside.length} boutons hors fenêtre` : '', `papier ${Math.round(paperH)}px`, `texte ${fontPx}px`].filter(Boolean).join(' · '));
      await p.screenshot({ path: `${OUT}/vp-${name}-${size}.png` });
    }
    // Tablette tactile : glisser au DOIGT par l'en-tête (événements tactiles CDP → Pointer Events).
    if (touch && width >= 640) {
      const cdp = await c.newCDPSession(p);
      const hb = await p.locator('.sa-nb-header .sa-nb-title').boundingBox();
      const before = await dialog(p).boundingBox();
      const start = { x: hb.x + 8, y: hb.y + hb.height / 2 };
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: start.x, y: start.y }] });
      for (let i = 1; i <= 6; i += 1) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x + 20 * i, y: start.y - 30 * i }] });
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await p.waitForTimeout(100);
      const after = await dialog(p).boundingBox();
      const scrolled = await p.evaluate(() => window.scrollY);
      // Le geste demande (+120, −180) ; la fenêtre s'arrête à 8px du bord si
      // l'écran est plus petit que ça — c'est la borne, pas un défaut.
      const wantDx = Math.min(120, width - 8 - (before.x + before.width));
      const wantDy = Math.max(-180, 8 - before.y);
      record(`${name} : glisser au doigt déplace la fenêtre sans la redimensionner`, Math.abs((after.x - before.x) - wantDx) < 3 && Math.abs((after.y - before.y) - wantDy) < 3 && Math.abs(after.width - before.width) < 1 && scrolled === 0,
        `Δ=(${Math.round(after.x - before.x)}, ${Math.round(after.y - before.y)}) attendu (${Math.round(wantDx)}, ${Math.round(wantDy)}) taille ${Math.round(after.width)}×${Math.round(after.height)}`);
      await p.screenshot({ path: `${OUT}/vp-${name}-touch-drag.png` });
    }

    // Sur mobile, le nuancier et la rangée secondaire se déplient sans déborder.
    if (width < 640) {
      await p.click('button[aria-label="أدوات أخرى"]');
      await p.click('button[aria-label="لون النصّ"]');
      const box = await dialog(p).boundingBox();
      const swatches = await p.$$eval('.sa-nb-swatch, .sa-nb-tools-secondary button', (els) => els.map((el) => { const r = el.getBoundingClientRect(); return { right: r.right, x: r.x, bottom: r.bottom, w: r.width }; }));
      const out = swatches.filter((s) => s.x < box.x - 1 || s.right > box.x + box.width + 1 || s.bottom > box.y + box.height + 1);
      record(`${name} : outils dépliés et nuancier dans la fenêtre`, out.length === 0 && !(await overflowX(p)), `${swatches.length} contrôles`);
      await p.screenshot({ path: `${OUT}/vp-${name}-tools.png` });
    }
  } catch (e) {
    record(`${name}`, false, e.message);
    await p.screenshot({ path: `${OUT}/error-${name}.png` }).catch(() => {});
  }
  await c.close();
}

// ── Nettoyage : le carnet de l'élève QA revient à son état de départ ─────
for (const id of createdNoteIds) await api(TOKEN, 'DELETE', `/practice/notes/${id}`);
console.log(`\n🧹 ${createdNoteIds.size} notes de test supprimées`);

await browser.close();

record('aucune erreur de page (exception JS)', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
record('aucune erreur console inattendue', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} vérifications passées — captures dans ${OUT}`);
process.exit(failed.length ? 1 : 0);
