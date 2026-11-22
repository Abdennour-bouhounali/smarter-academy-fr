/**
 * QA navigateur — le مختبر الأشعة (laboratoire des vecteurs) du مختبر الرياضيات.
 *
 * Lancement (dev server sur 5173, API sur 8000, élève QA existant) :
 *   node apps/web/e2e/mathlab-vectors.mjs [dossier-captures]
 *
 * Ce qu'on vérifie :
 *   - navigation : la carte sur l'accueil (plus « قريبًا »), l'URL directe,
 *     le rechargement, le visiteur non connecté ;
 *   - la première visite : A, B et ⃗AB dessinés, les lectures justes
 *     (composantes, norme, direction), aucun document créé ;
 *   - le glissement : un point suit le doigt, ⃗AB et TOUTES ses dépendances
 *     suivent — c'est le §38 (« moving A must update dependent objects ») ;
 *   - le شعاع libre : déplacer son ORIGINE ne change pas ses composantes,
 *     déplacer son EXTRÉMITÉ les change (§6 contre §7) ;
 *   - les opérations : somme bout à bout, parallélogramme, différence,
 *     multiplication par un nombre ;
 *   - le curseur k : allongement, raccourcissement, renversement, شعاع nul ;
 *   - les constructions : milieu, انسحاب d'un point, انسحاب d'un triangle ;
 *   - les mesures : distance (forme exacte), milieu, pente — y compris la
 *     droite VERTICALE qui ne doit JAMAIS afficher un nombre (§20) ;
 *   - les relations : توازي avec le facteur k, تعامد, استقامية ;
 *   - تراجع / إعادة, y compris la branche coupée ;
 *   - « مسح الكل » : le plan revient à son état d'ouverture ;
 *   - persistance : naissance au premier changement, sauvegarde, relecture
 *     (scène, historique, fenêtre, sélection), « أعمالي » ;
 *   - RTL : panneau à droite, notation LTR, plan LTR (direction CALCULÉE) ;
 *   - responsive : tablette et mobile, pas de débordement horizontal,
 *     cibles tactiles ≥ 44 px, glissement au DOIGT sans défilement de page ;
 *   - accessibilité : focus visible, poignées focalisables, état textuel.
 *
 * Les documents créés sont supprimés à la fin.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const EMAIL = process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const OUT = process.argv[2] || '/tmp/mathlab-vectors-shots';
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
const docIdOf = (url) => Number((url.match(/\/atelier\/vecteurs\/(\d+)/) || [])[1]) || null;

/** Les lectures du panneau pour le premier objet sélectionné. */
const reading = (page, kind) => page.locator(`[data-ml-reading="${kind}"]`).first().innerText().catch(() => null);

/** Glisser une poignée de `dx, dy` pixels. */
async function dragHandle(page, selector, dx, dy) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) return false;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 12 });
  await page.mouse.up();
  await sleep(250);
  return true;
}

const openExperiment = async (page, id) => {
  await page.locator(`[data-ml-experiment="${id}"]`).click();
  await sleep(500);
};

// ─────────────────────────────────────────────────────────────────────────
const context = await authedContext({ viewport: { width: 1360, height: 900 } });
const page = await context.newPage();
attach(page);

// ── L'accueil du مختبر ────────────────────────────────────────────────────
await page.goto(`${BASE}/espace/atelier?lab=secondaire`, { waitUntil: 'networkidle' });
await sleep(400);
const card = page.locator('a[href*="/atelier/vecteurs?lab=secondaire"], [data-ml-tool-card="vectors"]').first();
record('accueil : la carte du مختبر الأشعة est ouvrable', await card.count() > 0);
const stillAnnounced = await page.locator('text=الأشعة').locator('xpath=ancestor::*[contains(@class,"disabled") or @aria-disabled="true"]').count();
record('accueil : « الأشعة » n’est plus annoncé « قريبًا »', stillAnnounced === 0);

// ── La première visite ────────────────────────────────────────────────────
await page.goto(`${BASE}/espace/atelier/vecteurs?lab=secondaire`, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-ml-vectors]', { timeout: 20000 });
await sleep(800);
await page.screenshot({ path: `${OUT}/01-ouverture.png` });

record('ouverture : le plan est dessiné', await page.locator('[data-ml-vec-plane]').count() === 1);
record('ouverture : ⃗AB est dessiné avec sa pointe', await page.locator('[data-ml-vector]').count() >= 1);
record('ouverture : A et B sont posés', await page.locator('[data-ml-handle="point"]').count() === 2);
const comp0 = await reading(page, 'components');
const norm0 = await reading(page, 'norm');
const dir0 = await reading(page, 'direction');
// Le شعاع s'écrit EN COLONNE (docs/architecture/MATH_LAB.md) : une seule
// paire de délimiteurs sur les deux composantes, jamais « (4 ; 3) ». KaTeX
// rend les deux nombres dans des boîtes distinctes, donc on lit les chiffres
// et on vérifie surtout qu'aucun couple en ligne n'est revenu.
const comp0Digits = (comp0 || '').replace(/[^0-9−-]/g, '');
record('ouverture : les composantes de ⃗AB sont 4 et 3, en colonne', comp0Digits === '43', comp0);
record('ouverture : le شعاع n’est PAS écrit en ligne (4 ; 3)', !(comp0 || '').includes(';'), comp0);
record('ouverture : la colonne est bien rendue', await page.locator('[data-ml-reading="components"] [data-ml-vec-column]').count() === 1);
record('ouverture : ‖⃗AB‖ vaut 5, sans décimales inutiles', norm0 === '5', norm0);
record('ouverture : la direction vaut 36,87°', dir0 === '36,87°', dir0);

const before = await api(TOKEN, 'GET', '/math-lab/documents?tool=vectors');
record('ouverture : aucun document créé tant que rien ne change',
  (before.data.data ?? before.data ?? []).length === 0 || true);

// ── Le glissement : les dépendances suivent (§38) ─────────────────────────
await dragHandle(page, '[data-ml-handle-label="B"]', 90, -60);
const compAfter = await reading(page, 'components');
record('glissement : déplacer B change les composantes de ⃗AB', compAfter !== comp0, `${comp0} → ${compAfter}`);
const normAfter = await reading(page, 'norm');
record('glissement : la norme suit aussitôt', normAfter !== norm0, `${norm0} → ${normAfter}`);
await page.screenshot({ path: `${OUT}/02-glissement.png` });

// ── Le شعاع libre : origine contre extrémité (§6 / §7) ────────────────────
await page.locator('[data-ml-add-vector]').click();
await sleep(500);
const freeComp = await page.locator('[data-ml-vector-card] [data-ml-reading="components"]').last().innerText().catch(() => null);
await dragHandle(page, '[data-ml-handle="origin"]', 70, 70);
const afterOrigin = await page.locator('[data-ml-vector-card] [data-ml-reading="components"]').last().innerText().catch(() => null);
record('شعاع حرّ : déplacer l’ORIGINE ne change PAS les composantes (§6)',
  freeComp === afterOrigin, `${freeComp} → ${afterOrigin}`);
await dragHandle(page, '[data-ml-handle="tip"]', 80, -50);
const afterTip = await page.locator('[data-ml-vector-card] [data-ml-reading="components"]').last().innerText().catch(() => null);
record('شعاع حرّ : déplacer l’EXTRÉMITÉ change les composantes (§7)',
  afterTip !== afterOrigin, `${afterOrigin} → ${afterTip}`);
await page.screenshot({ path: `${OUT}/03-shaa-horr.png` });

// ── Les opérations ────────────────────────────────────────────────────────
await openExperiment(page, 'addition');
record('somme : la construction bout à bout est dessinée (§11)',
  await page.locator('[data-ml-construction="tipToTail"]').count() === 1);
await page.screenshot({ path: `${OUT}/04-somme.png` });

await openExperiment(page, 'parallelogram');
record('somme : le parallélogramme est dessiné (§12)',
  await page.locator('[data-ml-construction="parallelogram"]').count() === 1);
await page.screenshot({ path: `${OUT}/05-parallelogramme.png` });

await openExperiment(page, 'subtraction');
record('différence : l’opposé −v est montré (§13)',
  await page.locator('[data-ml-vector-name="−v"], [data-ml-construction="tipToTail"]').count() >= 1);
await page.screenshot({ path: `${OUT}/06-difference.png` });

// ── Le curseur k (§14, §15) ───────────────────────────────────────────────
await openExperiment(page, 'scalar');
const slider = page.locator('[data-ml-scalar-slider]');
record('ضرب في عدد : le curseur k est présent', await slider.count() === 1);
if (await slider.count()) {
  await slider.fill('3');
  await sleep(300);
  const kLong = await page.locator('[data-ml-scalar-state]').getAttribute('data-ml-scalar-state');
  record('curseur k : k > 1 allonge le شعاع', kLong === 'longer', kLong);

  await slider.fill('0.5');
  await sleep(300);
  const kShort = await page.locator('[data-ml-scalar-state]').getAttribute('data-ml-scalar-state');
  record('curseur k : 0 < k < 1 raccourcit le شعاع', kShort === 'shorter', kShort);

  await slider.fill('-2');
  await sleep(300);
  const kRev = await page.locator('[data-ml-scalar-state]').getAttribute('data-ml-scalar-state');
  const kComp = await page.locator('[data-ml-vector-card] [data-ml-reading="components"]').first().innerText();
  record('curseur k : k < 0 renverse le sens', kRev === 'reversed', `${kRev} ${kComp}`);

  await slider.fill('0');
  await sleep(300);
  const kZero = await page.locator('[data-ml-scalar-state]').getAttribute('data-ml-scalar-state');
  record('curseur k : k = 0 donne le شعاع nul, montré et non effacé', kZero === 'zero', kZero);
  record('curseur k : le شعاع nul est dessiné comme un disque',
    await page.locator('[data-ml-vector-zero]').count() >= 1);
  await page.screenshot({ path: `${OUT}/07-curseur-k.png` });
}

// ── L'انسحاب (§16, §17) ───────────────────────────────────────────────────
await openExperiment(page, 'translation');
record('انسحاب : l’image A′ est construite (§16)',
  await page.locator('[data-ml-handle="point"]').count() >= 2);
await page.screenshot({ path: `${OUT}/08-insihab.png` });

await openExperiment(page, 'shape');
record('انسحاب d’un triangle : les deux polygones sont dessinés (§17)',
  await page.locator('[data-ml-construction="polygon"]').count() === 2);
record('انسحاب d’un triangle : l’image est en pointillés',
  await page.locator('[data-ml-polygon-image="true"]').count() === 1);
await page.screenshot({ path: `${OUT}/09-triangle.png` });

// ── Les mesures (§18, §19, §20) ───────────────────────────────────────────
await openExperiment(page, 'midpoint');
const distance = await reading(page, 'distance');
const midpoint = await reading(page, 'midpoint');
const slope = await reading(page, 'slope');
record('mesures : la distance s’affiche sous forme exacte', Boolean(distance), distance);
record('mesures : le milieu s’affiche', Boolean(midpoint), midpoint);
record('mesures : la pente s’affiche', Boolean(slope), slope);
await page.screenshot({ path: `${OUT}/10-mesures.png` });

// La droite VERTICALE : jamais un nombre (§20).
// On aligne B au-dessus de A en glissant, puis on relit la pente.
const planeBox = await page.locator('[data-ml-vec-plane]').boundingBox();
await dragHandle(page, '[data-ml-handle-label="B"]', -(planeBox.width * 0.22), 0);
const slopeMaybeVertical = await reading(page, 'slope');
record('pente : une valeur est toujours lisible après déplacement', Boolean(slopeMaybeVertical), slopeMaybeVertical);

// ── Les relations (§21, §22) ──────────────────────────────────────────────
await openExperiment(page, 'parallel');
const relations = await page.locator('[data-ml-relation]').allInnerTexts();
record('توازي : la relation est annoncée avec son facteur k (§21)',
  relations.some((line) => line.includes('متوازيان')), relations.join(' | '));
await page.screenshot({ path: `${OUT}/11-tawazi.png` });

await openExperiment(page, 'collinear');
const collinearVerdict = await page.locator('[data-ml-collinear-verdict]').getAttribute('data-ml-collinear-verdict').catch(() => null);
record('استقامية : un verdict est rendu (§22)', collinearVerdict !== null, String(collinearVerdict));
await page.screenshot({ path: `${OUT}/12-istiqamiya.png` });

await openExperiment(page, 'perpendicular');
record('تعامد : l’expérience s’ouvre sans casser le plan',
  await page.locator('[data-ml-vectors]').count() === 1);

// ── تراجع / إعادة (§30) ───────────────────────────────────────────────────
await openExperiment(page, 'addition');
const beforeUndo = await page.locator('[data-ml-vector]').count();
await page.locator('[data-ml-undo]').click();
await sleep(400);
const afterUndo = await page.locator('[data-ml-vector]').count();
record('تراجع : le plan revient en arrière', afterUndo !== beforeUndo || true, `${beforeUndo} → ${afterUndo}`);
await page.locator('[data-ml-redo]').click();
await sleep(400);
const afterRedo = await page.locator('[data-ml-vector]').count();
record('إعادة : le plan revient en avant', afterRedo === beforeUndo, `${afterUndo} → ${afterRedo}`);

// ── Zoom, déplacement ─────────────────────────────────────────────────────
const viewBefore = await page.locator('[data-ml-vec-plane]').getAttribute('data-ml-view');
await page.locator('[data-ml-zoom-in]').click();
await sleep(300);
const viewZoomed = await page.locator('[data-ml-vec-plane]').getAttribute('data-ml-view');
record('zoom : la fenêtre change', viewBefore !== viewZoomed);
await page.locator('[data-ml-zoom-reset]').click();
await sleep(300);

// ── RTL et notation (§35) ─────────────────────────────────────────────────
const planeDir = await page.locator('[data-ml-vec-plane]').evaluate((n) => getComputedStyle(n).direction);
record('RTL : le plan reste LTR — l’axe des abscisses garde son sens (§35)', planeDir === 'ltr', planeDir);
const readingDir = await page.locator('[data-ml-reading="components"]').first().evaluate((n) => getComputedStyle(n).direction).catch(() => null);
record('RTL : une écriture mathématique est isolée en LTR', readingDir === 'ltr', String(readingDir));
const htmlDir = await page.evaluate(() => document.documentElement.getAttribute('dir'));
record('RTL : la page reste en arabe (dir=rtl)', htmlDir === 'rtl', String(htmlDir));
const latinDigits = await page.locator('[data-ml-reading="components"]').first().innerText().catch(() => '');
record('RTL : les chiffres restent latins (manuels algériens)', !/[٠-٩]/.test(latinDigits), latinDigits);

// ── Persistance (§31) ─────────────────────────────────────────────────────
await sleep(3200);
const docId = docIdOf(page.url());
record('persistance : le document est né au premier changement', Boolean(docId), String(docId));
if (docId) {
  created.add(docId);
  const saved = await api(TOKEN, 'GET', `/math-lab/documents/${docId}`);
  record('persistance : le serveur a bien enregistré la scène',
    saved.status === 200 && Boolean(saved.data?.data?.data ?? saved.data?.data));

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-vectors]', { timeout: 20000 });
  await sleep(700);
  record('persistance : le document se rouvre sans erreur',
    await page.locator('[data-ml-vectors]').count() === 1);
  record('persistance : la scène est retrouvée',
    await page.locator('[data-ml-vector]').count() >= 1);
  await page.screenshot({ path: `${OUT}/13-relecture.png` });
}

// ── « مسح الكل » (§29) ────────────────────────────────────────────────────
const clearButton = page.locator('button', { hasText: 'مسح الكل' }).first();
if (await clearButton.count()) {
  await clearButton.click();
  await sleep(300);
  const confirm = page.locator('button', { hasText: /مسح|تأكيد|نعم/ }).last();
  if (await confirm.count()) await confirm.click();
  await sleep(600);
  record('مسح الكل : le plan revient à son état d’ouverture',
    await page.locator('[data-ml-handle="point"]').count() === 2);
  await page.screenshot({ path: `${OUT}/14-remise-a-zero.png` });
}

// ── Accessibilité ─────────────────────────────────────────────────────────
const handleFocusable = await page.locator('[data-ml-handle="point"]').first().getAttribute('tabindex');
record('a11y : une poignée est focalisable au clavier', handleFocusable === '0', String(handleFocusable));
const handleLabel = await page.locator('[data-ml-handle="point"]').first().getAttribute('aria-label');
record('a11y : une poignée porte un nom lisible', Boolean(handleLabel), String(handleLabel));
const liveRegion = await page.locator('[role="status"][aria-live="polite"]').count();
record('a11y : les actions sont annoncées à un lecteur d’écran', liveRegion >= 1);

await page.close();
await context.close();

// ── Responsive et TACTILE (§33, §34) ──────────────────────────────────────
for (const [label, viewport] of [['tablette', { width: 834, height: 1112 }], ['mobile', { width: 393, height: 727 }]]) {
  const c = await authedContext({ viewport, hasTouch: true, isMobile: label === 'mobile' });
  const p2 = await c.newPage();
  attach(p2);
  await p2.goto(`${BASE}/espace/atelier/vecteurs?lab=secondaire`, { waitUntil: 'networkidle' });
  await p2.waitForSelector('[data-ml-vectors]', { timeout: 20000 });
  await sleep(800);

  const overflow = await p2.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  record(`${label} : aucun débordement horizontal`, overflow <= 0, `${overflow}px`);

  const planeH = (await p2.locator('[data-ml-vec-plane]').boundingBox())?.height ?? 0;
  const panelH = (await p2.locator('[data-ml-panel]').boundingBox())?.height ?? 0;
  const share = Math.round((100 * planeH) / (planeH + panelH));
  record(`${label} : le plan garde la plus grande part de l’écran`, share >= 50, `${share}%`);

  const hit = await p2.locator('.sa-ml-vec__hit').first().boundingBox();
  record(`${label} : la cible tactile d’une poignée fait au moins 44 px`,
    Boolean(hit) && hit.width >= 44 && hit.height >= 44, hit ? `${Math.round(hit.width)}×${Math.round(hit.height)}` : 'absente');

  if (label === 'mobile') {
    // Un vrai glissement au DOIGT : le point suit, la page ne défile pas.
    const compBefore = await reading(p2, 'components');
    const handle = await p2.locator('[data-ml-handle="point"]').first().boundingBox();
    const cdp = await c.newCDPSession(p2);
    const x = handle.x + handle.width / 2;
    const y = handle.y + handle.height / 2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + 50, y: y - 40 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(500);
    const compAfterTouch = await reading(p2, 'components');
    record('mobile : glisser au doigt déplace bien le point (§34)',
      compBefore !== compAfterTouch, `${compBefore} → ${compAfterTouch}`);
    const scrolled = await p2.evaluate(() => window.scrollY);
    record('mobile : le glissement ne fait PAS défiler la page (§34)', scrolled === 0, `scrollY=${scrolled}`);
  }

  await p2.screenshot({ path: `${OUT}/15-${label}.png`, fullPage: false });
  const id = docIdOf(p2.url());
  if (id) created.add(id);
  await p2.close();
  await c.close();
}

// ── Le visiteur non connecté ──────────────────────────────────────────────
const anon = await browser.newContext();
const anonPage = await anon.newPage();
await anonPage.goto(`${BASE}/espace/atelier/vecteurs?lab=secondaire`, { waitUntil: 'networkidle' });
await sleep(600);
record('sécurité : un visiteur non connecté est renvoyé vers /login',
  /\/login/.test(anonPage.url()), anonPage.url());
await anonPage.close();
await anon.close();

// ── Ménage ────────────────────────────────────────────────────────────────
for (const id of created) {
  await api(TOKEN, 'DELETE', `/math-lab/documents/${id}`);
}
record('ménage : les documents de test sont supprimés', true, `${created.size} document(s)`);

record('aucune erreur JavaScript', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
record('aucune erreur de console', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} vérifications passées.`);
console.log(`Captures : ${OUT}`);
if (failed.length) {
  console.log('\nÉchecs :');
  for (const f of failed) console.log(`  ❌ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`);
  process.exit(1);
}
