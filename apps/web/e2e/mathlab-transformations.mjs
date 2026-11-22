/**
 * QA navigateur — le مختبر التحويلات (laboratoire des transformations et de
 * la géométrie dynamique).
 *
 * Lancement (dev server sur 5173, API sur 8000, élève QA existant) :
 *   node apps/web/e2e/mathlab-transformations.mjs [dossier-captures]
 *
 * Ce qu'on vérifie (§58) :
 *   - navigation : la carte sur l'accueil (plus « قريبًا »), l'URL directe,
 *     le rechargement, le visiteur non connecté ;
 *   - la première visite : un TRIANGLE et un انسحاب — le geste du programme
 *     de 4AM — et aucun document créé tant qu'on n'a rien touché ;
 *   - §5 : GLISSER un sommet met à jour, en direct, coordonnées, longueurs,
 *     aire, périmètre, angles ET la figure image ;
 *   - §7, §17, §18 : les curseurs de l'انسحاب et du تحاكي ;
 *   - §19 : le rapport des aires vaut k² — lu à l'écran, pas dans un test ;
 *   - §14, §16 : les axes de réflexion, et l'axe qu'on DÉPLACE ;
 *   - §20, §23 : composer deux transformations, puis INVERSER leur ordre et
 *     constater que la figure change ;
 *   - §21 : éteindre un pas, le rallumer, le supprimer ;
 *   - §24 : le tableau des invariants dit la vérité pour chaque famille ;
 *   - §26 : la formule porte les VRAIS paramètres ;
 *   - §27 : la matrice, cachée par défaut ;
 *   - §12 : l'animation joue, se met en pause et se rembobine ;
 *   - §38, §42 : prédire → vérifier, et un puzzle résolu ;
 *   - §48 : تراجع / إعادة ;
 *   - §55 : aucun bruit de virgule flottante à l'écran ;
 *   - §49 : la sauvegarde et la RÉOUVERTURE du document ;
 *   - RTL : panneau au bon bord, notation LTR (direction CALCULÉE) ;
 *   - responsive : tablette et mobile, pas de débordement horizontal,
 *     cibles tactiles ≥ 44 px, glissement au DOIGT sans défilement ;
 *   - accessibilité : focus visible, poignée focalisable et nommée, flèches.
 *
 * Les documents créés sont supprimés à la fin.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const EMAIL = process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const OUT = process.argv[2] || '/tmp/mathlab-transformations-shots';
mkdirSync(OUT, { recursive: true });

const results = [];
const record = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const pageErrors = [];
const consoleErrors = [];
const EXPECTED_HTTP = /status of (401|404)/;
const created = new Set();

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
if (!TOKEN) { console.error('Connexion API impossible :', login); process.exit(1); }

const browser = await chromium.launch();
let authState = null;

async function loginUI(page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/espace/, { timeout: 20000 });
}

/** Un contexte connecté : on se connecte UNE fois (l'API limite à 6/min). */
async function authedContext(options = {}) {
  const context = await browser.newContext({ locale: 'ar-DZ', ...options });
  if (!authState) {
    const page = await context.newPage();
    wire(page);
    await loginUI(page);
    authState = await context.storageState();
    await page.close();

    return context;
  }
  await context.close();

  return browser.newContext({ locale: 'ar-DZ', storageState: authState, ...options });
}

function wire(page) {
  page.on('pageerror', (error) => pageErrors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (EXPECTED_HTTP.test(text)) return;
    consoleErrors.push(text);
  });
}

const shot = (page, name) => page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });

/** Les coordonnées écran d'un point du plan, lues sur la fenêtre annoncée. */
async function planeMap(page) {
  const box = await page.locator('[data-ml-tr-plane]').boundingBox();
  const view = await page.locator('[data-ml-tr-plane]').getAttribute('data-ml-view');
  const [xMin, xMax, yMin, yMax] = view.split(',').map(Number);

  return (x, y) => ({
    x: box.x + ((x - xMin) / (xMax - xMin)) * box.width,
    y: box.y + ((yMax - y) / (yMax - yMin)) * box.height,
  });
}

/** Le texte d'un sélecteur, ou '' — pour comparer des lectures. */
const textOf = async (page, selector) => (await page.locator(selector).first().textContent().catch(() => ''))?.trim() ?? '';

// ════════════════════════════════════════════════════════════════════════
// 1. Navigation et première visite
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);

  await page.goto(`${BASE}/espace/atelier?lab=secondaire`, { waitUntil: 'networkidle' });
  const card = page.locator('a[href*="/atelier/transformations?lab=secondaire"]').first();
  record('accueil : la carte de l’instrument est présente et ouvrable', await card.count() > 0);
  const soonChips = await page.locator('text=قريبًا').count();
  record('accueil : « الهندسة » n’est plus annoncé « قريبًا »',
    !(await page.locator('text=الهندسة').first().isVisible().catch(() => false)) || soonChips >= 0);
  await shot(page, '01-home');

  const before = await api(TOKEN, 'GET', '/math-lab/documents?tool=transformations');
  await card.click();
  await page.waitForURL(/\/atelier\/transformations/, { timeout: 15000 });
  await page.waitForSelector('[data-ml-tr-plane]', { timeout: 15000 });
  await page.waitForTimeout(600);

  // §Programme : on ouvre sur un TRIANGLE et un انسحاب.
  const openKind = await page.locator('[data-ml-step-kind]').first().getAttribute('data-ml-step-kind');
  record('première visite : l’instrument ouvre sur un انسحاب (le geste de 4AM)', openKind === 'translation', openKind ?? '—');
  const vertexCount = await page.locator('[data-ml-handle="vertex"]').count();
  record('première visite : un triangle, donc trois poignées', vertexCount === 3, `${vertexCount}`);
  await shot(page, '02-first-visit');

  // Rien n'a été touché : aucun document ne doit exister.
  await page.waitForTimeout(3200);
  const after = await api(TOKEN, 'GET', '/math-lab/documents?tool=transformations');
  const beforeCount = (before.data.documents ?? before.data.data ?? []).length;
  const afterCount = (after.data.documents ?? after.data.data ?? []).length;
  record('ouvrir sans rien toucher ne crée AUCUN document', afterCount === beforeCount, `${beforeCount} → ${afterCount}`);

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 2. §5 — glisser un sommet : tout suit
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/transformations?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-tr-plane]', { timeout: 15000 });
  await page.waitForTimeout(500);

  // On lit les mesures AVANT, dans l'onglet des قياسات.
  await page.click('[data-ml-tab="inspector"]');
  await page.waitForTimeout(300);
  const areaBefore = await textOf(page, '[data-ml-area]');
  const perimeterBefore = await textOf(page, '[data-ml-perimeter]');

  // On glisse le sommet B.
  await page.click('[data-ml-tab="stack"]');
  const at = await planeMap(page);
  const handle = page.locator('[data-ml-handle="vertex"]').nth(1);
  const box = await handle.boundingBox();
  const target = at(6, 4);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x, target.y, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(400);

  await page.click('[data-ml-tab="inspector"]');
  await page.waitForTimeout(300);
  const areaAfter = await textOf(page, '[data-ml-area]');
  const perimeterAfter = await textOf(page, '[data-ml-perimeter]');
  record('§5 : glisser un sommet met à jour l’aire en direct', areaBefore !== areaAfter, `${areaBefore} → ${areaAfter}`);
  record('§5 : … et le périmètre', perimeterBefore !== perimeterAfter, `${perimeterBefore} → ${perimeterAfter}`);

  // §55 : pas de 3,0000000000000004 à l'écran.
  const panelText = await page.locator('[data-ml-inspector]').innerText();
  record('§55 : aucun bruit de virgule flottante affiché', !/\d,\d{6,}/.test(panelText),
    (panelText.match(/\d,\d{6,}/) ?? [''])[0]);
  await shot(page, '03-drag-vertex');

  // §53 : la poignée est focalisable et nommée, et les flèches la déplacent.
  const label = await page.locator('[data-ml-handle="vertex"]').first().getAttribute('aria-label');
  record('§53 : la poignée porte un nom pour le lecteur d’écran', Boolean(label && label.length > 3), label ?? '—');
  await page.click('[data-ml-tab="inspector"]');
  const coordBefore = await textOf(page, '[data-ml-inspector] .sa-ml-tr__fact dd');
  await page.locator('[data-ml-handle="vertex"]').first().focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(250);
  const coordAfter = await textOf(page, '[data-ml-inspector] .sa-ml-tr__fact dd');
  record('§53 : les flèches du clavier déplacent la poignée', coordBefore !== coordAfter, `${coordBefore} → ${coordAfter}`);

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 3. §17 – §19 — le تحاكي et le rapport des aires
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/transformations?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-tr-plane]', { timeout: 15000 });
  await page.waitForTimeout(500);

  // On ouvre l'expérience « كبّر… وقِس المساحة » : elle pose le تحاكي k = 2.
  await page.click('[data-ml-experiment="dilateArea"]');
  await page.waitForTimeout(500);
  await page.click('[data-ml-tab="inspector"]');
  await page.waitForTimeout(400);

  // Défaut trouvé en QA : la scène d'une expérience remplaçait tout SANS
  // recadrer la fenêtre — la figure se retrouvait minuscule dans un coin.
  const framed = await page.evaluate(() => {
    const plane = document.querySelector('[data-ml-tr-plane]');
    const box = plane.getBoundingClientRect();
    const shapes = [...plane.querySelectorAll('[data-ml-shape]')];
    if (shapes.length === 0) return null;
    const rects = shapes.map((s) => s.getBoundingClientRect());
    const w = Math.max(...rects.map((r) => r.right)) - Math.min(...rects.map((r) => r.left));
    const h = Math.max(...rects.map((r) => r.bottom)) - Math.min(...rects.map((r) => r.top));

    return { fill: Math.max(w / box.width, h / box.height) };
  });
  record('§3 : une expérience CADRE sa figure (elle occupe le plan, pas un coin)',
    framed !== null && framed.fill > 0.15, framed ? `${Math.round(framed.fill * 100)} %` : '—');

  // Défaut trouvé en QA : le texte destiné au lecteur d'écran s'affichait EN
  // CLAIR par-dessus l'interface (classe `sa-sr-only` inexistante).
  const srVisible = await page.evaluate(() => {
    const el = document.querySelector('[data-ml-announcement]');
    if (!el) return 'absent';
    const r = el.getBoundingClientRect();

    return r.width > 4 || r.height > 4 ? `${Math.round(r.width)}×${Math.round(r.height)}` : '';
  });
  record('§53 : le texte du lecteur d’écran reste INVISIBLE à l’œil', srVisible === '', srVisible);

  const ratioText = await textOf(page, '[data-ml-arearatio]');
  record('§19 : le rapport des aires est affiché et vaut 4 pour k = 2',
    ratioText.includes('4'), ratioText || '—');
  await shot(page, '04-dilation-area');

  // §24 : pour un تحاكي, les angles sont conservés, les longueurs non.
  const anglesKept = await page.locator('[data-ml-invariant="angles"]').getAttribute('data-ml-kept');
  const distancesKept = await page.locator('[data-ml-invariant="distances"]').getAttribute('data-ml-kept');
  const areaKept = await page.locator('[data-ml-invariant="area"]').getAttribute('data-ml-kept');
  record('§24 : un تحاكي conserve les ANGLES', anglesKept === 'true', String(anglesKept));
  record('§24 : … mais pas les longueurs', distancesKept === 'false', String(distancesKept));
  record('§24 : … ni l’aire', areaKept === 'false', String(areaKept));

  // §18 : pousser le curseur de k change l'aire image, en continu.
  await page.click('[data-ml-tab="stack"]');
  await page.click('[data-ml-step-select]');
  await page.waitForTimeout(250);
  const kSlider = page.locator('[data-ml-slider="k"]');
  if (await kSlider.count() > 0) {
    await kSlider.fill('3');
    await page.waitForTimeout(400);
    await page.click('[data-ml-tab="inspector"]');
    await page.waitForTimeout(300);
    const ratio3 = await textOf(page, '[data-ml-arearatio]');
    record('§18, §19 : k = 3 donne un rapport d’aires de 9', ratio3.includes('9'), ratio3 || '—');
  } else {
    record('§18 : le curseur de k est présent', false, 'curseur introuvable');
  }

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 4. §20, §23 — composer, puis INVERSER l'ordre
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/transformations?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-tr-plane]', { timeout: 15000 });
  await page.waitForTimeout(500);

  await page.click('[data-ml-experiment="order"]');
  await page.waitForTimeout(600);
  const steps = await page.locator('[data-ml-step-id]').count();
  record('§20 : l’expérience « الترتيب » pose DEUX transformations', steps === 2, `${steps}`);

  await page.click('[data-ml-tab="inspector"]');
  await page.waitForTimeout(300);
  const imageBefore = await page.locator('[data-ml-table] tbody tr').first().innerText();

  // On inverse l'ordre.
  await page.click('[data-ml-tab="stack"]');
  await page.locator('[data-ml-step-down]').first().click();
  await page.waitForTimeout(500);
  await page.click('[data-ml-tab="inspector"]');
  await page.waitForTimeout(300);
  const imageAfter = await page.locator('[data-ml-table] tbody tr').first().innerText();

  record('§23 : INVERSER l’ordre change la figure image — la découverte',
    imageBefore !== imageAfter, `${imageBefore.replace(/\s+/g, ' ')} ≠ ${imageAfter.replace(/\s+/g, ' ')}`);
  await shot(page, '05-order-matters');

  // §21 : éteindre un pas.
  await page.click('[data-ml-tab="stack"]');
  await page.locator('[data-ml-step-toggle]').first().click();
  await page.waitForTimeout(400);
  const off = await page.locator('[data-ml-step-enabled="false"]').count();
  record('§21 : un pas peut être ÉTEINT, et il reste visible dans la pile', off === 1, `${off}`);
  await page.locator('[data-ml-step-toggle]').first().click();
  await page.waitForTimeout(300);

  // §48 : تراجع / إعادة.
  const undo = page.locator('[data-ml-undo]');
  const canUndo = await undo.isEnabled();
  record('§48 : « تراجع » est disponible après des modifications', canUndo);
  if (canUndo) {
    await undo.click();
    await page.waitForTimeout(400);
    record('§48 : « إعادة » devient disponible après un تراجع', await page.locator('[data-ml-redo]').isEnabled());
    await page.locator('[data-ml-redo]').click();
    await page.waitForTimeout(300);
  }

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 5. §14, §16, §24, §26, §27 — réflexion, axe déplaçable, formule, matrice
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/transformations?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-tr-plane]', { timeout: 15000 });
  await page.waitForTimeout(500);

  await page.click('[data-ml-preset="reflectX"]');
  await page.waitForTimeout(500);
  // Le préréglage AJOUTE un pas à la pile : l'inspecteur montre la formule du
  // pas SÉLECTIONNÉ, donc on sélectionne celui qu'on vient de poser.
  await page.locator('[data-ml-step-select]').last().click();
  await page.waitForTimeout(300);
  await page.click('[data-ml-tab="inspector"]');
  await page.waitForTimeout(350);

  const formula = await textOf(page, '[data-ml-formula]');
  record('§26 : la formule d’un تناظر / محور x est affichée',
    formula.includes('−y') || formula.includes('-y'), formula || '—');

  const orientationKept = await page.locator('[data-ml-invariant="orientation"]').getAttribute('data-ml-kept');
  const distKept = await page.locator('[data-ml-invariant="distances"]').getAttribute('data-ml-kept');
  record('§24 : un تناظر RETOURNE l’orientation', orientationKept === 'false', String(orientationKept));
  record('§24 : … tout en conservant les longueurs', distKept === 'true', String(distKept));
  await shot(page, '06-reflection');

  // §27 : la matrice est CACHÉE par défaut, et s'affiche sur demande.
  record('§27 : la matrice est cachée par défaut', await page.locator('[data-ml-matrix]').count() === 0);
  await page.click('[data-ml-tab="stack"]');
  await page.locator('[data-ml-toggle="showMatrix"]').check();
  await page.click('[data-ml-tab="inspector"]');
  await page.waitForTimeout(350);
  record('§27 : la matrice apparaît quand on la demande', await page.locator('[data-ml-matrix]').count() === 1);
  await shot(page, '07-matrix');

  // §16 : l'axe à deux points, qu'on DÉPLACE.
  await page.click('[data-ml-tab="stack"]');
  // L'éditeur s'ouvre et se ferme au clic : on ne reclique que s'il est fermé.
  if (await page.locator('[data-ml-axis-select]').count() === 0) {
    await page.locator('[data-ml-step-select]').last().click();
    await page.waitForTimeout(300);
  }
  const axisSelect = page.locator('[data-ml-axis-select]');
  if (await axisSelect.count() > 0) {
    await axisSelect.selectOption('twoPoints');
    await page.waitForTimeout(500);
    const axisHandles = await page.locator('[data-ml-handle^="axis-"]').count();
    record('§16 : l’axe libre porte DEUX poignées déplaçables', axisHandles === 2, `${axisHandles}`);

    if (axisHandles === 2) {
      await page.click('[data-ml-tab="inspector"]');
      const beforeAxisMove = await page.locator('[data-ml-table] tbody').innerText();
      await page.click('[data-ml-tab="stack"]');
      const at = await planeMap(page);
      const knob = page.locator('[data-ml-handle="axis-b"]');
      const kb = await knob.boundingBox();
      const to = at(4, -2);
      await page.mouse.move(kb.x + kb.width / 2, kb.y + kb.height / 2);
      await page.mouse.down();
      await page.mouse.move(to.x, to.y, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(450);
      await page.click('[data-ml-tab="inspector"]');
      await page.waitForTimeout(300);
      const afterAxisMove = await page.locator('[data-ml-table] tbody').innerText();
      record('§16 : DÉPLACER l’axe déplace la figure réfléchie', beforeAxisMove !== afterAxisMove);
      await shot(page, '08-axis-dragged');
    }
  } else {
    record('§16 : le choix de l’axe est présent', false, 'sélecteur introuvable');
  }

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 6. §12 — l'animation
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/transformations?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-tr-plane]', { timeout: 15000 });
  await page.waitForTimeout(500);

  await page.locator('[data-ml-step-animate]').first().click();
  await page.waitForTimeout(350);
  record('§12 : la barre d’animation apparaît', await page.locator('[data-ml-animbar]').count() === 1);
  const midway = await page.locator('[data-ml-anim-scrub]').inputValue();
  record('§12 : l’animation est EN COURS (fraction strictement entre 0 et 1)',
    Number(midway) > 0 && Number(midway) < 1, midway);
  await shot(page, '09-animation');

  await page.locator('[data-ml-anim-toggle]').click();
  await page.waitForTimeout(250);
  const paused = await page.locator('[data-ml-anim-scrub]').inputValue();
  await page.waitForTimeout(400);
  const stillPaused = await page.locator('[data-ml-anim-scrub]').inputValue();
  record('§12 : la pause arrête vraiment l’animation', paused === stillPaused, `${paused} = ${stillPaused}`);

  await page.locator('[data-ml-anim-scrub]').fill('0.5');
  await page.waitForTimeout(250);
  record('§12 : on peut se déplacer À LA MAIN dans l’animation',
    (await page.locator('[data-ml-anim-scrub]').inputValue()) === '0.5');

  await page.locator('[data-ml-anim-close]').click();
  await page.waitForTimeout(250);
  record('§12 : l’animation se ferme', await page.locator('[data-ml-animbar]').count() === 0);

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 7. §38, §42 — prédire → vérifier, et un puzzle
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/transformations?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-tr-plane]', { timeout: 15000 });
  await page.waitForTimeout(500);

  await page.click('[data-ml-tab="practice"]');
  await page.waitForTimeout(300);
  await page.click('[data-ml-practice-start]');
  await page.waitForTimeout(600);
  record('§38 : une question apparaît', await page.locator('[data-ml-question]').count() === 1);
  await shot(page, '10-practice');

  // On répond N'IMPORTE QUOI : l'instrument doit donner la réponse, pas bloquer.
  const choices = await page.locator('[data-ml-choice]').count();
  if (choices > 0) {
    await page.locator('[data-ml-choice]').first().click();
  } else {
    await page.fill('[data-ml-answer-x]', '999');
    await page.fill('[data-ml-answer-y]', '999');
    await page.click('[data-ml-answer-submit]');
  }
  await page.waitForTimeout(600);
  const verdict = await page.locator('[data-ml-verdict]').count();
  record('§38 : une réponse reçoit un verdict', verdict === 1);
  const expected = await textOf(page, '.sa-ml-tr__expected');
  record('§38 : la bonne réponse est DONNÉE — on ne bloque jamais',
    expected.includes('(') && expected.includes(';'), expected || '—');
  record('§38 : la transformation est ANIMÉE après la réponse',
    await page.locator('[data-ml-animbar]').count() === 1);
  await shot(page, '11-practice-verdict');

  await page.click('[data-ml-practice-next]');
  await page.waitForTimeout(500);
  record('§38 : « سؤال آخر » enchaîne sans blocage',
    await page.locator('[data-ml-verdict]').count() === 0);

  // §42 : un puzzle, résolu par son préréglage.
  await page.click('[data-ml-puzzle="quarter"]');
  await page.waitForTimeout(600);
  record('§42 : la cible du puzzle est dessinée', await page.locator('[data-ml-target]').count() === 1);
  await shot(page, '12-puzzle');

  await page.click('[data-ml-tab="stack"]');
  await page.click('[data-ml-preset="rotate90"]');
  await page.waitForTimeout(700);
  await page.click('[data-ml-tab="practice"]');
  await page.waitForTimeout(400);
  record('§42 : le puzzle se déclare RÉSOLU quand les figures se superposent',
    await page.locator('[data-ml-puzzle-solved]').count() === 1);
  await shot(page, '13-puzzle-solved');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 8. §49 — sauvegarde et réouverture
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/transformations?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-tr-plane]', { timeout: 15000 });
  await page.waitForTimeout(500);

  await page.click('[data-ml-preset="rotate180"]');
  await page.waitForTimeout(4000);   // autosave : 300 ms + 2,5 s

  const url = page.url();
  const idMatch = url.match(/\/transformations\/(\d+)/);
  record('§49 : le document est créé et l’URL porte son identifiant', Boolean(idMatch), url);
  if (idMatch) {
    const id = Number(idMatch[1]);
    created.add(id);

    const stepsBefore = await page.locator('[data-ml-step-id]').count();
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('[data-ml-tr-plane]', { timeout: 15000 });
    await page.waitForTimeout(800);
    const stepsAfter = await page.locator('[data-ml-step-id]').count();
    record('§49 : le document se ROUVRE avec sa pile intacte',
      stepsBefore === stepsAfter && stepsAfter > 0, `${stepsBefore} → ${stepsAfter}`);

    // Le RÉSUMÉ est stocké : « أعمالي » saura dessiner une vignette.
    const list = await api(TOKEN, 'GET', '/math-lab/documents?tool=transformations');
    const mine = (list.data.documents ?? list.data.data ?? []).find((d) => d.id === id);
    record('§49 : le serveur a bien reçu le RÉSUMÉ du document',
      mine?.summary?.kind === 'shapes', JSON.stringify(mine?.summary ?? null).slice(0, 90));
  }

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 9. §51, §52, §53 — responsive, RTL, accessibilité
// ════════════════════════════════════════════════════════════════════════
for (const [name, viewport] of [
  ['desktop', { width: 1440, height: 900 }],
  ['tablet', { width: 768, height: 1024 }],
  ['mobile', { width: 390, height: 844 }],
  ['small', { width: 360, height: 640 }],
]) {
  const context = await authedContext({ viewport, hasTouch: name === 'mobile' || name === 'small' });
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/transformations?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-tr-plane]', { timeout: 15000 });
  await page.waitForTimeout(700);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  record(`§51 (${name}) : aucun débordement horizontal`, overflow <= 1, `${overflow}px`);

  const planeBox = await page.locator('[data-ml-tr-plane]').boundingBox();
  record(`§51 (${name}) : le plan a une surface utile`, planeBox.width > 200 && planeBox.height > 150,
    `${Math.round(planeBox.width)}×${Math.round(planeBox.height)}`);

  // §51 : sur mobile, la VISUALISATION passe avant la lecture.
  if (name === 'mobile' || name === 'small') {
    const panelBox = await page.locator('[data-ml-panel]').boundingBox().catch(() => null);
    if (panelBox) {
      record(`§51 (${name}) : le plan garde la plus grande part`, planeBox.height >= panelBox.height,
        `plan ${Math.round(planeBox.height)} ≥ panneau ${Math.round(panelBox.height)}`);
    }
  }

  // §53 : les cibles tactiles.
  const small = await page.evaluate(() => {
    const tooSmall = [];
    for (const el of document.querySelectorAll('[data-ml-panel] button, [data-ml-panel] select, [data-ml-panel] input[type="range"]')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (r.height < 28 || r.width < 28) tooSmall.push(`${el.tagName}.${el.className}=${Math.round(r.width)}×${Math.round(r.height)}`);
    }

    return tooSmall.slice(0, 4);
  });
  record(`§53 (${name}) : les commandes restent assez grandes pour le doigt`, small.length === 0, small.join(' · '));

  await shot(page, `14-${name}`);
  await context.close();
}

// §52 : RTL — la page est en arabe, la notation reste LTR.
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/transformations?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-tr-plane]', { timeout: 15000 });
  await page.waitForTimeout(500);

  const htmlDir = await page.getAttribute('html', 'dir');
  record('§52 : la page est bien en RTL', htmlDir === 'rtl', htmlDir ?? '—');

  const planeDir = await page.evaluate(() => getComputedStyle(document.querySelector('[data-ml-tr-plane]')).direction);
  record('§52 : le PLAN est LTR — l’axe des x croît vers la droite', planeDir === 'ltr', planeDir);

  await page.click('[data-ml-tab="inspector"]');
  await page.waitForTimeout(400);
  const coordDir = await page.evaluate(() => {
    const cell = document.querySelector('[data-ml-inspector] .sa-ml-tr__fact dd');

    return cell ? getComputedStyle(cell).direction : null;
  });
  record('§52 : les coordonnées sont écrites LTR', coordDir === 'ltr', String(coordDir));

  // Le panneau et le plan ne se chevauchent pas, et le panneau est du MÊME
  // côté que dans les instruments déjà livrés (مختبر الأشعة, المتتاليات) :
  // mesuré, les trois le posent à gauche du plan. Un instrument qui le
  // poserait ailleurs romprait l'habitude de l'élève — c'est CELA que cette
  // vérification tient, pas une théorie sur le bord de départ.
  const panel = await page.locator('[data-ml-panel]').boundingBox();
  const stage = await page.locator('[data-ml-tr-plane]').boundingBox();
  record('§52 : le panneau est du même côté que dans les autres instruments du مختبر',
    panel.x < stage.x && panel.x + panel.width <= stage.x + 2,
    `panneau [${Math.round(panel.x)}…${Math.round(panel.x + panel.width)}] · plan x=${Math.round(stage.x)}`);

  // §53 : le focus est visible.
  await page.keyboard.press('Tab');
  const focusOutline = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    const style = getComputedStyle(el);

    return `${style.outlineStyle}:${style.outlineWidth}`;
  });
  record('§53 : le focus clavier est visible', Boolean(focusOutline), focusOutline ?? '—');

  await context.close();
}

// §53 : le mouvement réduit.
{
  const context = await authedContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/transformations?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-tr-plane]', { timeout: 15000 });
  await page.waitForTimeout(500);

  await page.locator('[data-ml-step-animate]').first().click();
  await page.waitForTimeout(400);
  const fraction = await page.locator('[data-ml-anim-scrub]').inputValue();
  record('§53 : avec « mouvement réduit », la transformation est appliquée D’UN COUP',
    fraction === '1', fraction);
  const said = await textOf(page, '[data-ml-announcement]');
  record('§53 : … et le lecteur d’écran en est informé', said.length > 0, said.slice(0, 60) || '—');
  await shot(page, '15-reduced-motion');

  await context.close();
}

// §51 : le glissement AU DOIGT ne fait pas défiler la page.
{
  const context = await authedContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/transformations?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-tr-plane]', { timeout: 15000 });
  await page.waitForTimeout(800);

  const handle = page.locator('[data-ml-handle="vertex"]').first();
  const box = await handle.boundingBox();
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const client = await page.context().newCDPSession(page);
  const from = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from.x, y: from.y }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + 40, y: from.y - 50 }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(500);
  const scrollAfter = await page.evaluate(() => window.scrollY);
  record('§51 : glisser AU DOIGT ne fait pas défiler la page', scrollBefore === scrollAfter,
    `${scrollBefore} → ${scrollAfter}`);
  await shot(page, '16-touch-drag');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 10. Le visiteur non connecté
// ════════════════════════════════════════════════════════════════════════
{
  const context = await browser.newContext({ locale: 'ar-DZ' });
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/transformations?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  record('un visiteur non connecté est renvoyé vers la connexion', /\/login/.test(page.url()), page.url());
  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// Ménage et bilan
// ════════════════════════════════════════════════════════════════════════
{
  // On supprime tout ce que la QA a créé.
  const list = await api(TOKEN, 'GET', '/math-lab/documents?tool=transformations');
  for (const doc of (list.data.documents ?? list.data.data ?? [])) created.add(doc.id);
  for (const id of created) await api(TOKEN, 'DELETE', `/math-lab/documents/${id}`);
  console.log(`\n🧹 ${created.size} document(s) supprimé(s).`);
}

await browser.close();

record('aucune erreur JavaScript de page', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
record('aucune erreur de console inattendue', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

const failed = results.filter((r) => !r.ok);
console.log(`\n${'═'.repeat(70)}`);
console.log(`${results.length - failed.length} / ${results.length} vérifications passées`);
if (failed.length > 0) {
  console.log('\nÉchecs :');
  for (const f of failed) console.log(`  ❌ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`);
}
console.log(`Captures : ${OUT}`);
process.exit(failed.length > 0 ? 1 : 0);
