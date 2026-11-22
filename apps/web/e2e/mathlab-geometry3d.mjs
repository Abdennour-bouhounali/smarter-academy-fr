/**
 * QA navigateur — la géométrie dans l'espace (الهندسة ثلاثية الأبعاد) du مختبر الرياضيات.
 *
 * Lancement (dev server sur 5173, API sur 8000, élève QA existant) :
 *   node apps/web/e2e/mathlab-geometry3d.mjs [dossier-captures]
 *
 * Ce qu'on vérifie :
 *   - navigation : la carte sur l'accueil, l'URL directe, le rechargement,
 *     le visiteur non connecté ;
 *   - la première visite : un cube d'arête 2, V = 8, A = 24, trois cotes,
 *     aucun document créé ;
 *   - le solide : chaque forme, ses paramètres, ses formules, ses valeurs
 *     (pavé 2×3×4, sphère r = 2, cylindre r = 2 h = 5, cône r = 3 h = 4 → l = 5) ;
 *   - les dimensions : le champ, le curseur, leur synchronisation, une
 *     valeur invalide refusée puis ramenée dans les bornes ;
 *   - la vue : glisser (orbite), molette, boutons + −, clavier,
 *     réinitialiser ; la face désignée d'un clic ;
 *   - les options : mesures, axes, grille (case du panneau et bouton de la coquille) ;
 *   - persistance : naissance au premier changement, sauvegarde, relecture
 *     (solide, dimensions, options, caméra), « أعمالي » ;
 *   - export PNG ;
 *   - RTL : panneau à droite, formules LTR ;
 *   - responsive : tablette et mobile, panneau repliable, pas de débordement,
 *     orbite au doigt et pincement (événements tactiles CDP).
 *
 * Les documents créés sont supprimés à la fin.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const EMAIL = process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const OUT = process.argv[2] || '/tmp/mathlab-geometry3d-shots';
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
  method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
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
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error' && !EXPECTED_HTTP.test(m.text())) consoleErrors.push(m.text());
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const docIdOf = (url) => Number((url.match(/\/atelier\/geometrie-3d\/(\d+)/) || [])[1]) || null;
const num = (text) => Number(String(text).replace(/^[A-Za-z]\s*=\s*/, '').replace(/−/g, '-').replace(',', '.'));
const waitSaved = async (page, timeout = 9000) => {
  await page.waitForSelector('[data-ml-status="dirty"], [data-ml-status="saving"]', { timeout: 2500 }).catch(() => {});
  await page.waitForSelector('[data-ml-status="saved"]', { timeout });
};
const readValue = async (page, sel) => num(await page.locator(sel).innerText());
const volume = (page) => readValue(page, '[data-ml-g3d-volume]');
const surface = (page) => readValue(page, '[data-ml-g3d-surface]');
/** Les positions à l'écran des cotes : elles bougent avec la caméra — c'est notre lecture de la vue. */
const labelPositions = (page) => page.$$eval('[data-ml-g3d-measure]', (els) => els.map((e) => e.style.transform));
const moved = (a, b) => JSON.stringify(a) !== JSON.stringify(b);

async function setNumber(page, param, text) {
  const field = page.locator(`[data-ml-g3d-number="${param}"]`);
  await field.click({ clickCount: 3 });
  await field.fill(text);
}

async function setSlider(page, param, value) {
  await page.locator(`[data-ml-g3d-slider="${param}"]`).evaluate((el, v) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(el, String(v));
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

async function drag(page, from, to, steps = 12) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i += 1) {
    await page.mouse.move(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps);
  }
  await page.mouse.up();
}

/** De vrais événements tactiles (CDP), un ou deux doigts. `moves` : une liste d'étapes, chaque étape = un point par doigt. */
async function touchGesture(page, moves) {
  const cdp = await page.context().newCDPSession(page);
  const points = (step) => step.map((p, i) => ({ x: p.x, y: p.y, id: i }));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points(moves[0]) });
  for (const step of moves.slice(1)) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: points(step) });
    await sleep(16);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

async function openTool(page, path = '/espace/atelier/geometrie-3d') {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-g3d] [data-ml-g3d-canvas]', { timeout: 30000 });
  await sleep(400);
}

async function hostBox(page) {
  return page.locator('[data-ml-g3d-host]').boundingBox();
}

const ctx = await authedContext({ viewport: { width: 1440, height: 900 }, locale: 'ar-DZ', acceptDownloads: true });
const page = await ctx.newPage();
attach(page);

let docId = null;
try {
  // ── Accueil et première visite ────────────────────────────────────────
  await page.goto(`${BASE}/espace/atelier?lab=moyen`, { waitUntil: 'networkidle' });
  const card = page.locator('[data-ml-tool-card="geometry3d"]');
  record('مخبر المتوسط : la carte « الهندسة ثلاثية الأبعاد »', (await card.count()) === 1 && (await card.innerText()).includes('الهندسة ثلاثية الأبعاد'));
  await card.click();
  await page.waitForURL(/\/espace\/atelier\/geometrie-3d\?lab=moyen$/, { timeout: 15000 });
  await page.waitForSelector('[data-ml-g3d-canvas]', { timeout: 30000 });
  await sleep(600);
  record('première visite : un cube d’arête 2, sans document', (await page.inputValue('[data-ml-g3d-shape-select]')) === 'cube' && (await page.inputValue('[data-ml-g3d-number="side"]')) === '2' && docIdOf(page.url()) === null);
  record('première visite : V = 8, A = 24', (await volume(page)) === 8 && (await surface(page)) === 24);
  record('première visite : trois cotes « a = 2 » sur le solide', (await page.$$eval('[data-ml-g3d-measure]', (els) => els.map((e) => e.textContent))).join('|') === 'a = 2|a = 2|a = 2');
  record('première visite : l’invitation « اسحب لتدوير الشكل »', (await page.locator('[data-ml-g3d-drag-hint]').count()) === 1);
  record('première visite : rien n’est créé', (await page.locator('[data-ml-status]').getAttribute('data-ml-status')) === 'clean' && docIdOf(page.url()) === null);
  await page.screenshot({ path: `${OUT}/01-cube.png` });

  // ── La vue : orbite, molette, boutons, clavier, réinitialisation ───────
  const box = await hostBox(page);
  const centre = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const home = await labelPositions(page);
  await drag(page, centre, { x: centre.x + 160, y: centre.y + 40 });
  await sleep(700);
  const afterDrag = await labelPositions(page);
  record('vue : glisser fait tourner le solide', moved(home, afterDrag));
  record('vue : l’invitation disparaît au premier geste', (await page.locator('[data-ml-g3d-drag-hint]').count()) === 0);
  await page.mouse.move(centre.x, centre.y);
  await page.mouse.wheel(0, -400);
  await sleep(700);
  const afterWheel = await labelPositions(page);
  record('vue : la molette zoome', moved(afterDrag, afterWheel));
  await page.click('[data-ml-g3d-zoom-out]');
  await sleep(600);
  record('vue : le bouton − dézoome', moved(afterWheel, await labelPositions(page)));
  await page.locator('[data-ml-g3d-host]').focus();
  const beforeKeys = await labelPositions(page);
  await page.keyboard.press('ArrowLeft');
  await sleep(600);
  record('vue : la flèche gauche tourne la vue au clavier', moved(beforeKeys, await labelPositions(page)));
  await page.click('[data-ml-g3d-reset]');
  await sleep(800);
  const afterReset = await labelPositions(page);
  const px = (t) => (t.match(/translate\(([-\d.]+)px, ([-\d.]+)px\)/) || []).slice(1, 3).map(Number);
  const closeEnough = home.every((t, i) => { const a = px(t); const b = px(afterReset[i]); return Math.abs(a[0] - b[0]) < 1.5 && Math.abs(a[1] - b[1]) < 1.5; });
  record('vue : réinitialiser retrouve la vue par défaut', closeEnough, `${home[0]} → ${afterReset[0]}`);
  record('vue : réinitialiser ne touche ni au solide ni aux dimensions', (await page.inputValue('[data-ml-g3d-number="side"]')) === '2' && (await volume(page)) === 8);
  await page.waitForURL(/\/espace\/atelier\/geometrie-3d\/\d+(?:\?lab=\w+)?$/, { timeout: 12000 });
  docId = docIdOf(page.url());
  created.add(docId);
  await waitSaved(page);
  const savedCamera = (await api(TOKEN, 'GET', `/math-lab/documents/${docId}`)).data.document?.data?.camera;
  record('persistance : la caméra est enregistrée après un geste', Array.isArray(savedCamera?.position) && savedCamera.position.length === 3);

  // ── La face désignée ───────────────────────────────────────────────────
  await page.mouse.click(centre.x + 60, centre.y + 20);
  await sleep(400);
  const faceAttr = await page.locator('[data-ml-g3d-face]').getAttribute('data-ml-g3d-face');
  record('face : un clic désigne une face et lit son aire', faceAttr === 'face' && (await page.locator('[data-ml-g3d-face]').innerText()).includes('A = 4'), faceAttr);
  await page.screenshot({ path: `${OUT}/02-face.png` });
  await page.mouse.click(centre.x + 60, centre.y + 20);
  await sleep(400);
  record('face : un second clic la relâche', (await page.locator('[data-ml-g3d-face]').getAttribute('data-ml-g3d-face')) === 'none');

  // ── Les dimensions : champ et curseur ─────────────────────────────────
  await setNumber(page, 'side', '3');
  await sleep(200);
  record('dimensions : taper 3 → V = 27, A = 54, cote « a = 3 »', (await volume(page)) === 27 && (await surface(page)) === 54 && (await page.locator('[data-ml-g3d-measure]').first().innerText()) === 'a = 3');
  record('dimensions : le curseur suit le champ', (await page.inputValue('[data-ml-g3d-slider="side"]')) === '3');
  await page.locator('[data-ml-g3d-number="side"]').blur();
  await setSlider(page, 'side', 2.5);
  await sleep(200);
  record('dimensions : le curseur → 2,5 → le champ suit, V = 15,63', (await page.inputValue('[data-ml-g3d-number="side"]')) === '2,5' && Math.abs((await volume(page)) - 15.63) < 0.01);
  await setNumber(page, 'side', '-4');
  await sleep(200);
  record('validation : −4 est refusé (message, valeur inchangée)', (await page.locator('[data-ml-g3d-dim="side"] [role="alert"]').count()) === 1 && Math.abs((await volume(page)) - 15.63) < 0.01);
  await page.keyboard.press('Enter');
  await sleep(200);
  record('validation : validé → ramené à la borne 0,5', (await page.inputValue('[data-ml-g3d-number="side"]')) === '0,5' && Math.abs((await volume(page)) - 0.13) < 0.01);
  await setNumber(page, 'side', '50');
  await page.keyboard.press('Tab');
  await sleep(200);
  record('validation : 50 → ramené à la borne 10', (await page.inputValue('[data-ml-g3d-number="side"]')) === '10' && (await volume(page)) === 1000);
  await setNumber(page, 'side', '2,5');
  await page.keyboard.press('Enter');
  await sleep(200);
  record('dimensions : la virgule décimale est lue', Math.abs((await volume(page)) - 15.63) < 0.01);

  // ── Chaque solide ──────────────────────────────────────────────────────
  await page.selectOption('[data-ml-g3d-shape-select]', 'cuboid');
  await sleep(300);
  record('pavé : le cube devient un pavé de mêmes arêtes', (await page.inputValue('[data-ml-g3d-number="length"]')) === '2,5' && (await page.inputValue('[data-ml-g3d-number="height"]')) === '2,5');
  record('pavé : trois contrôles L, l, h', (await page.locator('[data-ml-g3d-dim]').count()) === 3 && (await page.locator('[data-ml-g3d-info-shape]').innerText()) === 'متوازي المستطيلات');
  await setNumber(page, 'length', '2'); await page.keyboard.press('Enter');
  await setNumber(page, 'width', '3'); await page.keyboard.press('Enter');
  await setNumber(page, 'height', '4'); await page.keyboard.press('Enter');
  await sleep(300);
  record('pavé 2 × 3 × 4 : V = 24, A = 52', (await volume(page)) === 24 && (await surface(page)) === 52);
  record('pavé : les cotes L, l, h sur le solide', (await page.$$eval('[data-ml-g3d-measure]', (els) => els.map((e) => e.textContent))).join('|') === 'L = 2|l = 3|h = 4');
  await page.screenshot({ path: `${OUT}/03-cuboid.png` });

  await page.selectOption('[data-ml-g3d-shape-select]', 'sphere');
  await sleep(300);
  await setNumber(page, 'radius', '2'); await page.keyboard.press('Enter');
  await sleep(300);
  record('sphère r = 2 : V = 33,51, A = 50,27', Math.abs((await volume(page)) - 33.51) < 0.01 && Math.abs((await surface(page)) - 50.27) < 0.01 && (await page.locator('[data-ml-g3d-dim]').count()) === 1);
  await page.screenshot({ path: `${OUT}/04-sphere.png` });

  await page.selectOption('[data-ml-g3d-shape-select]', 'cylinder');
  await sleep(300);
  record('cylindre : le rayon de la sphère est conservé', (await page.inputValue('[data-ml-g3d-number="radius"]')) === '2');
  await setNumber(page, 'height', '5'); await page.keyboard.press('Enter');
  await sleep(300);
  record('cylindre r = 2, h = 5 : V = 62,83, A = 87,96', Math.abs((await volume(page)) - 62.83) < 0.01 && Math.abs((await surface(page)) - 87.96) < 0.01);
  await page.screenshot({ path: `${OUT}/05-cylinder.png` });

  await page.selectOption('[data-ml-g3d-shape-select]', 'cone');
  await sleep(300);
  await setNumber(page, 'radius', '3'); await page.keyboard.press('Enter');
  await setNumber(page, 'height', '4'); await page.keyboard.press('Enter');
  await sleep(300);
  record('cône r = 3, h = 4 : l = 5, V = 37,7, A = 75,4', (await readValue(page, '[data-ml-g3d-slant]')) === 5 && Math.abs((await volume(page)) - 37.7) < 0.01 && Math.abs((await surface(page)) - 75.4) < 0.01);
  record('cône : la cote de l’apothème « l = 5 »', (await page.$$eval('[data-ml-g3d-measure]', (els) => els.map((e) => e.textContent))).includes('l = 5'));
  record('formules : KaTeX en LTR', (await page.locator('[data-ml-g3d-info] .katex').count()) >= 4 && (await page.locator('[data-ml-g3d-info] [dir="ltr"]').count()) >= 4);
  await page.screenshot({ path: `${OUT}/06-cone.png` });

  // ── Les options ────────────────────────────────────────────────────────
  await page.click('[data-ml-g3d-option="showMeasurements"]');
  await sleep(300);
  record('options : sans « القياسات », les cotes disparaissent', (await page.$$eval('[data-ml-g3d-measure]', (els) => els.every((e) => e.style.display === 'none'))));
  await page.click('[data-ml-g3d-option="showAxes"]');
  await sleep(300);
  record('options : sans « المحاور », les noms d’axes disparaissent', (await page.$$eval('.sa-ml-g3d__label--axis', (els) => els.length === 3 && els.every((e) => e.style.display === 'none'))));
  record('options : le bouton grille de la coquille est allumé', (await page.getAttribute('[data-ml-grid]', 'aria-pressed')) === 'true');
  await page.click('[data-ml-g3d-option="showGrid"]');
  await sleep(300);
  record('options : la case « الشبكة » éteint le bouton de la coquille', (await page.getAttribute('[data-ml-grid]', 'aria-pressed')) === 'false');
  await page.click('[data-ml-grid]');
  await sleep(300);
  record('options : le bouton de la coquille recoche la case', await page.isChecked('[data-ml-g3d-option="showGrid"]'));
  await page.screenshot({ path: `${OUT}/07-options.png` });
  await page.click('[data-ml-g3d-option="showMeasurements"]');
  await page.click('[data-ml-g3d-option="showAxes"]');

  // ── Export ─────────────────────────────────────────────────────────────
  const [download] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.click('[data-ml-export]')]);
  const path = await download.path();
  const { statSync } = await import('node:fs');
  record('export : un PNG non vide', download.suggestedFilename().endsWith('.png') && statSync(path).size > 2000, download.suggestedFilename());

  // ── Titre, persistance, relecture ─────────────────────────────────────
  await page.fill('[data-ml-title]', 'مخروط الاختبار');
  await page.click('[data-ml-g3d-option="showGrid"]');
  await waitSaved(page);
  const saved = (await api(TOKEN, 'GET', `/math-lab/documents/${docId}`)).data.document;
  record('persistance : solide, dimensions, options, caméra, titre', saved?.title === 'مخروط الاختبار' && saved?.data?.shape === 'cone' && saved.data.dimensions.radius === 3 && saved.data.dimensions.height === 4 && saved.data.showGrid === false && saved.data.showAxes === true && Array.isArray(saved.data.camera?.target), JSON.stringify(saved?.data).slice(0, 160));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-g3d-canvas]', { timeout: 30000 });
  await sleep(600);
  record('relecture : le cône r = 3, h = 4 revient, grille éteinte', (await page.inputValue('[data-ml-g3d-shape-select]')) === 'cone' && (await page.inputValue('[data-ml-g3d-number="radius"]')) === '3' && (await volume(page)) === 37.7 && !(await page.isChecked('[data-ml-g3d-option="showGrid"]')) && (await page.getAttribute('[data-ml-grid]', 'aria-pressed')) === 'false');
  record('relecture : le titre', (await page.inputValue('[data-ml-title]')) === 'مخروط الاختبار');
  await page.goto(`${BASE}/espace/atelier`, { waitUntil: 'networkidle' });
  await page.waitForSelector(`[data-ml-doc="${docId}"]`, { timeout: 15000 });
  record('أعمالي : listé avec son titre', (await page.locator(`[data-ml-doc="${docId}"]`).innerText()).includes('مخروط الاختبار'));

  // ── RTL ────────────────────────────────────────────────────────────────
  await openTool(page, `/espace/atelier/geometrie-3d/${docId}`);
  const panel = await page.locator('[data-ml-g3d-panel]').boundingBox();
  const stage = await hostBox(page);
  record('RTL : le panneau à droite, la fenêtre à gauche', panel.x > stage.x + stage.width / 2 && (await page.getAttribute('html', 'dir')) === 'rtl');
  record('RTL : la police Cairo sur le panneau', (await page.locator('[data-ml-g3d-info-shape]').evaluate((e) => getComputedStyle(e).fontFamily)).includes('Cairo'));

  // ── Les autres instruments toujours là ────────────────────────────────
  await page.goto(`${BASE}/espace/atelier/grapheur?lab=secondaire`, { waitUntil: 'networkidle' });
  record('régression : le grapheur s’ouvre', (await page.waitForSelector('[data-ml-grapher] [data-ml-plane] svg', { timeout: 30000 }).then(() => true).catch(() => false)));
  await page.goto(`${BASE}/espace/atelier/tableau`, { waitUntil: 'networkidle' });
  record('régression : la سبّورة s’ouvre', (await page.waitForSelector('.excalidraw', { timeout: 30000 }).then(() => true).catch(() => false)));
} catch (e) {
  record('scénario principal interrompu', false, String(e).slice(0, 400));
  await page.screenshot({ path: `${OUT}/error-main.png` }).catch(() => {});
} finally {
  await ctx.close();
}

// ── Visiteur ─────────────────────────────────────────────────────────────
{
  const anon = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'ar-DZ' });
  const p = await anon.newPage();
  await p.goto(`${BASE}/espace/atelier/geometrie-3d`, { waitUntil: 'networkidle' });
  record('visiteur : renvoyé vers /login', p.url().includes('/login'));
  await anon.close();
}

// ── Tablette et mobile ───────────────────────────────────────────────────
for (const [label, width, height] of [['tablette', 1024, 768], ['mobile', 390, 844]]) {
  const c = await authedContext({ viewport: { width, height }, locale: 'ar-DZ', hasTouch: true, isMobile: width < 700, deviceScaleFactor: 1 });
  const p = await c.newPage();
  attach(p);
  try {
    await openTool(p);
    const box = await hostBox(p);
    record(`${label} : la fenêtre 3D reste large`, box.width >= Math.min(width, 460), `${Math.round(box.width)}×${Math.round(box.height)}`);
    record(`${label} : la fenêtre 3D est assez haute`, box.height >= 200);
    record(`${label} : pas de débordement horizontal`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    await p.screenshot({ path: `${OUT}/08-${label}.png` });
    const c0 = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    const before = await labelPositions(p);
    const scrollBefore = await p.evaluate(() => window.scrollY);
    await touchGesture(p, [[c0], [{ x: c0.x + 30, y: c0.y + 10 }], [{ x: c0.x + 70, y: c0.y + 20 }], [{ x: c0.x + 110, y: c0.y + 30 }]]);
    await sleep(700);
    record(`${label} : un doigt fait tourner le solide`, moved(before, await labelPositions(p)));
    record(`${label} : la page ne défile pas pendant le geste`, (await p.evaluate(() => window.scrollY)) === scrollBefore);
    const mid = await labelPositions(p);
    await touchGesture(p, [
      [{ x: c0.x - 30, y: c0.y }, { x: c0.x + 30, y: c0.y }],
      [{ x: c0.x - 60, y: c0.y }, { x: c0.x + 60, y: c0.y }],
      [{ x: c0.x - 90, y: c0.y }, { x: c0.x + 90, y: c0.y }],
      [{ x: c0.x - 120, y: c0.y }, { x: c0.x + 120, y: c0.y }],
    ]);
    await sleep(700);
    record(`${label} : le pincement zoome`, moved(mid, await labelPositions(p)));
    await p.waitForURL(/\/espace\/atelier\/geometrie-3d\/\d+(?:\?lab=\w+)?$/, { timeout: 12000 });
    created.add(docIdOf(p.url()));
    if (width < 700) {
      record('mobile : le panneau se replie', (await p.locator('[data-ml-g3d-panel-toggle]').isVisible()));
      await p.tap('[data-ml-g3d-panel-toggle]');
      await sleep(300);
      const collapsedBox = await hostBox(p);
      record('mobile : replié, la fenêtre 3D grandit', collapsedBox.height > box.height);
      await p.screenshot({ path: `${OUT}/09-mobile-collapsed.png` });
      await p.tap('[data-ml-g3d-panel-toggle]');
      await sleep(300);
    }
    const slider = await p.locator('[data-ml-g3d-slider="side"]').boundingBox();
    const number = await p.locator('[data-ml-g3d-number="side"]').boundingBox();
    record(`${label} : curseur et champ ≥ 40 px de haut`, slider.height >= 40 && number.height >= 40, `${slider.height}/${number.height}`);
    await p.selectOption('[data-ml-g3d-shape-select]', 'cylinder');
    await sleep(300);
    record(`${label} : changer de solide au doigt`, (await p.locator('[data-ml-g3d-info-shape]').innerText()) === 'أسطوانة');
    await p.screenshot({ path: `${OUT}/10-${label}-cylinder.png` });
  } catch (e) {
    record(`${label} : scénario interrompu`, false, String(e).slice(0, 300));
    await p.screenshot({ path: `${OUT}/error-${label}.png` }).catch(() => {});
  } finally {
    await c.close();
  }
}

// ── Nettoyage ────────────────────────────────────────────────────────────
for (const id of created) if (id) await api(TOKEN, 'DELETE', `/math-lab/documents/${id}`);

record('aucune erreur de page', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
record('aucune erreur console inattendue', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} vérifications réussies — captures dans ${OUT}`);
process.exit(failed.length ? 1 : 0);
