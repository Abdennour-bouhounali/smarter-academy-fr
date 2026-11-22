/**
 * QA navigateur — le grapheur (راسم الدوال) du مختبر الرياضيات.
 *
 * Lancement (dev server sur 5173, API sur 8000, élève QA existant) :
 *   node apps/web/e2e/mathlab-grapher.mjs [dossier-captures]
 *
 * Ce qu'on vérifie :
 *   - navigation : la carte sur l'accueil, l'URL directe, le rechargement,
 *     le visiteur non connecté ;
 *   - la première visite : repère, grille, f(x) = x² tracée, aucun document créé ;
 *   - la saisie MathLive : une expression tapée, une expression invalide
 *     (message, jamais de plantage), un symbole inconnu, 1/x coupée en 0,
 *     √x qui part de 0 ;
 *   - la liste : ajouter (bouton, exemple), cacher/montrer, supprimer, la limite ;
 *   - le plan : zoom (boutons, molette, clavier), glisser, réinitialiser,
 *     lecture du curseur, grille ;
 *   - le point : posé d'un clic sur la courbe, déplacé, x tapé, retiré ;
 *   - persistance : naissance au premier changement, sauvegarde, relecture
 *     (fonctions, visibilité, fenêtre, point), « أعمالي » ;
 *   - export PNG, « مسح الكل » ;
 *   - RTL : panneau à droite, expressions LTR ;
 *   - responsive : tablette et mobile, panneau repliable, pas de débordement.
 *
 * Les documents créés sont supprimés à la fin.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const EMAIL = process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const OUT = process.argv[2] || '/tmp/mathlab-grapher-shots';
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
const docIdOf = (url) => Number((url.match(/\/atelier\/grapheur\/(\d+)/) || [])[1]) || null;
// Un changement met 300 ms (outil) + 400 ms (fenêtre) à devenir « dirty » : on
// attend d'abord ce passage, sinon un « محفوظ » PRÉCÉDENT ferait croire que
// le nouveau changement est déjà parti.
const waitSaved = async (page, timeout = 9000) => {
  await page.waitForSelector('[data-ml-status="dirty"], [data-ml-status="saving"]', { timeout: 2500 }).catch(() => {});
  await page.waitForSelector('[data-ml-status="saved"]', { timeout });
};
const curve = (page, name) => page.locator(`[data-ml-plane] path[data-ml-curve="${name}"]`);
const subpaths = async (page, name) => ((await curve(page, name).getAttribute('d').catch(() => '')) || '').split('M').length - 1;
const readView = async (page) => (await page.getAttribute('[data-ml-plane]', 'data-ml-view')).split(',').map(Number);
const span = (v) => v[1] - v[0];

async function planeBox(page) {
  const plane = page.locator('[data-ml-plane]');
  await plane.waitFor({ state: 'visible', timeout: 20000 });
  return plane.boundingBox();
}

/** Coordonnées du plan → pixels de la page. */
async function toPage(page, x, y) {
  const [xMin, xMax, yMin, yMax] = await readView(page);
  const box = await planeBox(page);
  return { x: box.x + ((x - xMin) / (xMax - xMin)) * box.width, y: box.y + ((yMax - y) / (yMax - yMin)) * box.height };
}

async function setExpression(page, name, latex) {
  await page.locator(`[data-ml-fn-name="${name}"] math-field`).evaluate((mf, value) => {
    mf.value = value;
    mf.dispatchEvent(new Event('input', { bubbles: true }));
  }, latex);
}

const fieldValue = (page, name) => page.locator(`[data-ml-fn-name="${name}"] math-field`).evaluate((mf) => mf.value);

async function drag(page, from, to, steps = 12) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i += 1) {
    await page.mouse.move(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps);
  }
  await page.mouse.up();
}

async function openGrapher(page, path = '/espace/atelier/grapheur?lab=secondaire') {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-grapher] [data-ml-plane] svg', { timeout: 30000 });
}

const ctx = await authedContext({ viewport: { width: 1440, height: 900 }, locale: 'ar-DZ', acceptDownloads: true });
const page = await ctx.newPage();
attach(page);

try {
  record('connexion élève', !!authState);

  // ── 1. L'accueil ─────────────────────────────────────────────────────
  // Le راسم vit dans les deux مخابر ; ce scénario (المماس compris) est celui
  // du ثانوي — au collège, المماس n'existe pas (mathlab-labs-scope.mjs).
  await page.goto(`${BASE}/espace/atelier?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-home]', { timeout: 20000 });
  record('مخبر الثانوي : la carte « راسم الدوال »', await page.locator('[data-ml-tool-card="functionGrapher"]').count() === 1 && (await page.locator('[data-ml-tool-card="functionGrapher"]').innerText()).includes('راسم الدوال'));
  await page.click('[data-ml-tool-card="functionGrapher"]');
  await page.waitForURL(/\/espace\/atelier\/grapheur\?lab=secondaire$/, { timeout: 15000 });
  await page.waitForSelector('[data-ml-grapher] [data-ml-plane] svg', { timeout: 30000 });

  // ── 2. Première visite ───────────────────────────────────────────────
  record('première visite : f(x) = x² est là, tracée', (await fieldValue(page, 'f')) === 'x^2' && (await curve(page, 'f').count()) === 1 && ((await curve(page, 'f').getAttribute('d')) || '').length > 100);
  record('première visite : grille, axes, étiquettes', (await page.locator('[data-ml-plane] .mafs-axis text').count()) > 8 && (await page.locator('[data-ml-plane] pattern').count()) >= 1);
  record('première visite : aucun document créé à l’ouverture', (await page.getAttribute('[data-ml-status]', 'data-ml-status')) === 'clean' && docIdOf(page.url()) === null);
  const view0 = await readView(page);
  record('première visite : fenêtre par défaut orthonormée (x ∈ [−8, 8])', view0[0] === -8 && view0[1] === 8 && Math.abs(span(view0) / (view0[3] - view0[2]) - (await planeBox(page)).width / (await planeBox(page)).height) < 0.01);
  record('accessibilité : plan nommé et focalisable, champ nommé', (await page.getAttribute('[data-ml-plane]', 'aria-label') || '').length > 0 && (await page.getAttribute('[data-ml-plane]', 'tabindex')) === '0' && (await page.getAttribute('[data-ml-fn-name="f"] math-field', 'aria-label') || '').includes('f'));
  await page.screenshot({ path: `${OUT}/01-first-run-desktop.png` });

  // ── 3. Saisie au clavier dans MathLive ───────────────────────────────
  const fieldBox = await page.locator('[data-ml-fn-name="f"] math-field').boundingBox();
  await page.mouse.click(fieldBox.x + 20, fieldBox.y + fieldBox.height / 2);
  await sleep(200);
  record('saisie : un clic donne le focus au champ', (await page.evaluate(() => document.activeElement?.tagName)) === 'MATH-FIELD');
  await page.keyboard.press('Control+a');
  await page.keyboard.type('2x+3');
  await sleep(400);
  record('saisie : « 2x+3 » tapé dans MathLive', (await fieldValue(page, 'f')) === '2x+3', await fieldValue(page, 'f'));
  await page.waitForURL(/\/espace\/atelier\/grapheur\/\d+(?:\?lab=\w+)?$/, { timeout: 12000 });
  const docId = docIdOf(page.url());
  created.add(docId);
  record('persistance : le document naît au premier changement, URL réécrite', docId != null);
  await waitSaved(page);
  const saved1 = await api(TOKEN, 'GET', `/math-lab/documents/${docId}`);
  record('persistance : l’expression est sur le serveur', saved1.data.document?.data?.functions?.[0]?.expression === '2x+3' && saved1.data.document?.tool === 'functionGrapher');
  record('la droite 2x+3 est un seul morceau', (await subpaths(page, 'f')) === 1);
  record('la courbe est VRAIMENT bleue (la feuille de mafs ne l’assombrit pas)', (await curve(page, 'f').evaluate((el) => getComputedStyle(el).stroke)) === 'rgb(37, 99, 235)');

  // ── 4. Expressions invalides ─────────────────────────────────────────
  await setExpression(page, 'f', 'x^');
  await sleep(1000);
  record('erreur : « x^ » → message, pas de courbe, pas de plantage', (await page.locator('[data-ml-fn-name="f"] [data-ml-fn-error]').count()) === 1 && (await curve(page, 'f').count()) === 0 && pageErrors.length === 0);
  await setExpression(page, 'f', '2y');
  await sleep(1000);
  record('erreur : symbole inconnu nommé', (await page.locator('[data-ml-fn-name="f"] [data-ml-fn-error]').innerText()).includes('y'));
  await setExpression(page, 'f', '');
  await sleep(1000);
  record('erreur : expression vide', (await page.locator('[data-ml-fn-name="f"] [data-ml-fn-error]').innerText()).length > 0);
  await setExpression(page, 'f', '\\frac{1}{x}');
  await sleep(400);
  record('1/x : deux morceaux, rien ne traverse x = 0', (await page.locator('[data-ml-fn-name="f"] [data-ml-fn-error]').count()) === 0 && (await subpaths(page, 'f')) === 2);
  await page.screenshot({ path: `${OUT}/02-one-over-x.png` });
  await setExpression(page, 'f', '\\sqrt{x}');
  await sleep(400);
  const sqrtD = await curve(page, 'f').getAttribute('d');
  // Les coordonnées du tracé sont dans l'espace utilisateur du SVG de mafs : x = 0 y est 0.
  const sqrtStartPx = Number(sqrtD.match(/^M([-\d.]+)/)[1]);
  record('√x : la courbe part de x = 0, pas avant', Math.abs(sqrtStartPx) < 2 && !sqrtD.includes('M-'), `départ ${sqrtStartPx.toFixed(1)}px`);
  await setExpression(page, 'f', '\\tan(x)');
  await sleep(400);
  record('tan(x) : coupée à chaque asymptote', (await subpaths(page, 'f')) >= 5);
  await setExpression(page, 'f', 'x^2');
  await sleep(400);

  // ── 5. La liste : ajouter, exemple, cacher, supprimer, limite ────────
  await page.click('[data-ml-preset="2x+1"]');
  await sleep(400);
  record('liste : un exemple ajoute g(x) = 2x+1', (await page.locator('[data-ml-fn]').count()) === 2 && (await fieldValue(page, 'g')) === '2x+1' && (await curve(page, 'g').count()) === 1);
  const colors = await page.locator('[data-ml-plane] path[data-ml-curve]').evaluateAll((els) => els.map((e) => e.getAttribute('stroke')));
  record('liste : deux couleurs distinctes de la palette', colors.length === 2 && colors[0] !== colors[1]);
  const fColorBefore = await curve(page, 'f').getAttribute('stroke');
  await page.click('[data-ml-fn-name="g"] [data-ml-fn-color]');
  await page.waitForSelector('[data-ml-palette]', { timeout: 3000 });
  const paletteBox = await page.locator('[data-ml-palette]').boundingBox();
  const vp = page.viewportSize();
  record('couleur : la palette s’ouvre dans l’écran, avec ses neuf choix nommés', paletteBox.x >= 0 && paletteBox.y >= 0 && paletteBox.x + paletteBox.width <= vp.width && paletteBox.y + paletteBox.height <= vp.height && (await page.locator('[data-ml-palette-color]').count()) === 9 && (await page.locator('[data-ml-palette-color]').evaluateAll((els) => els.every((e) => /[؀-ۿ]/.test(e.getAttribute('aria-label') || '')))));
  record('couleur : la couleur courante est marquée autrement que par la couleur', (await page.locator('[data-ml-palette-color][aria-pressed="true"] svg').count()) === 1);
  await page.keyboard.press('Escape');
  await sleep(200);
  record('couleur : Échap ferme la palette et rend le focus à la pastille', (await page.locator('[data-ml-palette]').count()) === 0 && (await page.evaluate(() => document.activeElement?.hasAttribute('data-ml-fn-color'))));
  await page.keyboard.press('Enter');
  await page.waitForSelector('[data-ml-palette]', { timeout: 3000 });
  await page.locator('[data-ml-palette-color="#7c3aed"]').focus();
  await page.keyboard.press('Enter');
  await sleep(300);
  record('couleur : au clavier, g devient violette — courbe et pastille ensemble', (await page.locator('[data-ml-palette]').count()) === 0 && (await curve(page, 'g').getAttribute('stroke')) === '#7c3aed' && (await page.locator('[data-ml-fn-name="g"] [data-ml-fn-color]').evaluate((el) => el.style.backgroundColor)) === 'rgb(124, 58, 237)');
  record('couleur : f n’a pas changé', (await curve(page, 'f').getAttribute('stroke')) === fColorBefore);
  await page.click('[data-ml-fn-name="f"] [data-ml-fn-color]');
  await page.waitForSelector('[data-ml-palette]', { timeout: 3000 });
  await page.click('[data-ml-palette-color="#7c3aed"]');
  await sleep(300);
  record('couleur : deux fonctions peuvent partager une couleur, volontairement', (await curve(page, 'f').getAttribute('stroke')) === '#7c3aed' && (await curve(page, 'g').getAttribute('stroke')) === '#7c3aed');
  await page.click('[data-ml-fn-name="f"] [data-ml-fn-color]');
  await page.waitForSelector('[data-ml-palette]', { timeout: 3000 });
  await page.click('[data-ml-palette-color="#2563eb"]');
  await sleep(300);
  await page.click('[data-ml-fn-name="g"] [data-ml-fn-toggle]');
  await sleep(300);
  record('liste : cacher g retire sa courbe', (await curve(page, 'g').count()) === 0 && (await page.getAttribute('[data-ml-fn-name="g"] [data-ml-fn-toggle]', 'aria-pressed')) === 'false');
  await page.click('[data-ml-fn-name="g"] [data-ml-fn-toggle]');
  await sleep(300);
  record('liste : montrer g la remet', (await curve(page, 'g').count()) === 1);
  await page.click('[data-ml-fn-add]');
  await sleep(500);
  record('liste : « أضف دالة » crée h, champ focalisé', (await page.locator('[data-ml-fn-name="h"]').count()) === 1 && (await page.evaluate(() => document.activeElement?.tagName?.toLowerCase())) === 'math-field');
  await page.keyboard.type('sin(x)');
  await sleep(500);
  record('liste : sin(x) tapé avec le raccourci MathLive', /\\sin/.test(await fieldValue(page, 'h')) && (await curve(page, 'h').count()) === 1);
  await page.screenshot({ path: `${OUT}/03-three-functions.png` });
  // |x|, √x, 1/x — par rang : les antislashs des exemples ne passent pas dans un sélecteur CSS.
  for (const index of [4, 5, 3]) await page.locator('[data-ml-preset]').nth(index).click();
  await sleep(400);
  record('liste : la limite de 6 fonctions désactive l’ajout', (await page.locator('[data-ml-fn]').count()) === 6 && (await page.locator('[data-ml-fn-add]').isDisabled()) && (await page.locator('[data-ml-fn-limit]').count()) === 1);
  const names = await page.locator('[data-ml-fn]').evaluateAll((els) => els.map((e) => e.dataset.mlFnName));
  record('liste : noms f, g, h, k, l, m', names.join('') === 'fghklm');
  await page.screenshot({ path: `${OUT}/04-six-functions.png` });
  for (const name of ['m', 'l', 'k']) await page.click(`[data-ml-fn-name="${name}"] [data-ml-fn-remove]`);
  await sleep(300);
  record('liste : supprimer', (await page.locator('[data-ml-fn]').count()) === 3 && (await page.locator('[data-ml-plane] path[data-ml-curve]').count()) === 3);

  // ── 6. Le point ──────────────────────────────────────────────────────
  await page.mouse.click(...Object.values(await toPage(page, 2, 4)));
  await sleep(300);
  const pairText = await page.locator('[data-ml-point-pair]').innerText().catch(() => '');
  const pair = pairText.replace(/−/g, '-').match(/A\(([-\d,]+) ; ([-\d,]+)\)/);
  const pairNumbers = pair ? [pair[1], pair[2]].map((v) => Number(v.replace(',', '.'))) : [NaN, NaN];
  // Un clic est précis au pixel près : (2 ; 4) à un centième.
  record('point : un clic sur f en (2 ; 4) pose A', (await page.locator('[data-ml-point]').count()) === 1 && Math.abs(pairNumbers[0] - 2) < 0.05 && Math.abs(pairNumbers[1] - 4) < 0.2, pairText);
  record('point : dessiné sur le plan avec ses pointillés', (await page.locator('[data-ml-plane] .mafs-movable-point').count()) === 1);
  await page.click('[data-ml-fn-name="f"] [data-ml-fn-color]');
  await page.waitForSelector('[data-ml-palette]', { timeout: 3000 });
  await page.click('[data-ml-palette-color="#334155"]');
  await sleep(300);
  record('point : il suit la couleur de sa fonction', (await page.locator('[data-ml-point-on]').evaluate((el) => el.style.color)) === 'rgb(51, 65, 85)' && (await page.locator('[data-ml-plane] .mafs-movable-point').evaluate((el) => getComputedStyle(el).getPropertyValue('--movable-point-color').trim())) === '#334155');
  await page.click('[data-ml-fn-name="f"] [data-ml-fn-color]');
  await page.waitForSelector('[data-ml-palette]', { timeout: 3000 });
  await page.click('[data-ml-palette-color="#2563eb"]');
  await sleep(300);
  await page.fill('[data-ml-point-x]', '1');
  await page.keyboard.press('Enter');
  await sleep(300);
  record('point : x = 1 tapé → f(1) = 1', /A\(1 ; 1\)/.test(await page.locator('[data-ml-point-pair]').innerText()), await page.locator('[data-ml-point-pair]').innerText());
  const handle = await page.locator('[data-ml-plane] .mafs-movable-point').boundingBox();
  await drag(page, { x: handle.x + handle.width / 2, y: handle.y + handle.height / 2 }, { x: handle.x + handle.width / 2 - 60, y: handle.y + handle.height / 2 });
  await sleep(300);
  const movedX = Number((await page.inputValue('[data-ml-point-x]')).replace(',', '.'));
  record('point : glissé le long de la courbe', movedX < 1 && movedX > -1 && movedX !== 0, `x = ${movedX}`);
  const clickEmpty = await toPage(page, -6, 5);
  await page.mouse.click(clickEmpty.x, clickEmpty.y);
  await sleep(300);
  record('point : un clic loin de toute courbe ne bouge rien', Math.abs(Number((await page.inputValue('[data-ml-point-x]')).replace(',', '.')) - movedX) < 1e-6);
  await waitSaved(page);
  await page.screenshot({ path: `${OUT}/05-point.png` });

  // ── 6b. Le mode « المماس » ─────────────────────────────────────────────
  const slopeOf = async () => Number((await page.locator('[data-ml-tangent-slope] .sa-ml-grapher__point-number').innerText()).replace(/−/g, '-').replace(',', '.'));
  const tangentX = async () => Number((await page.inputValue('[data-ml-tangent-x]')).replace(/−/g, '-').replace(',', '.'));
  record('tangente : éteinte par défaut, aucune construction', !(await page.isChecked('[data-ml-tangent-toggle]')) && (await page.locator('[data-ml-tangent-values]').count()) === 0 && (await page.locator('[data-ml-plane] polyline').count()) === 0 && (await page.locator('[data-ml-drag-hint]').count()) === 0);
  await page.click('[data-ml-tangent-toggle]');
  await sleep(400);
  record('tangente : allumée → A sur f, tangente, valeurs, invitation, choix de la fonction', (await page.isChecked('[data-ml-tangent-toggle]')) && (await page.locator('[data-ml-plane] polyline').count()) >= 1 && (await tangentX()) === 1 && Math.abs((await slopeOf()) - 2) < 1e-6 && (await page.locator('[data-ml-drag-hint]').count()) === 1 && (await page.locator('[data-ml-tangent-pick]').count()) === 3 && (await page.locator('[data-ml-point]').count()) === 0);
  record('tangente : pas de bouton « استكشف »', (await page.locator('[data-ml-play]').count()) === 0);
  await page.fill('[data-ml-tangent-x]', '2');
  await page.keyboard.press('Enter');
  await sleep(300);
  record('tangente : x = 2 → f′(2) = 4, A(2 ; 4)', Math.abs((await slopeOf()) - 4) < 1e-6 && /A\(2 ; 4\)/.test(await page.locator('[data-ml-tangent-pair]').innerText()));
  {
    const h = await page.locator('[data-ml-plane] .mafs-movable-point').boundingBox();
    const start = { x: h.x + h.width / 2, y: h.y + h.height / 2 };
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x - 60, start.y + 150, { steps: 6 });
    await sleep(100);
    const midX = await tangentX();
    const midSlope = await slopeOf();
    await page.mouse.move(start.x - 120, start.y + 300, { steps: 8 });
    await page.mouse.up();
    await sleep(300);
    const endX = await tangentX();
    record('tangente : A glisse sur f, la pente suit déjà pendant le geste (f′ = 2x)', midX < 2 && endX < midX && Math.abs(midSlope - 2 * midX) < 1e-2 && Math.abs((await slopeOf()) - 2 * endX) < 1e-2, `x ${midX} → ${endX}`);
    record('tangente : l’invitation disparaît après le premier geste', (await page.locator('[data-ml-drag-hint]').count()) === 0);
  }
  await page.click('[data-ml-tangent-pick="g"]');
  await sleep(300);
  await page.fill('[data-ml-tangent-x]', '-3');
  await page.keyboard.press('Enter');
  await sleep(300);
  const slopeG1 = await slopeOf();
  await page.fill('[data-ml-tangent-x]', '2,5');
  await page.keyboard.press('Enter');
  await sleep(300);
  record('tangente : sur g(x) = 2x+1 la pente vaut 2 partout', Math.abs(slopeG1 - 2) < 1e-6 && Math.abs((await slopeOf()) - 2) < 1e-6 && (await page.locator('[data-ml-tangent-values]').innerText()).includes('g'));
  await page.click('[data-ml-tangent-pick="f"]');
  await page.click('[data-ml-tangent-derivative]');
  await sleep(400);
  record('tangente : « إظهار المشتقّة » trace f′ (rose, distincte de f) et B(a ; f′(a))', (await curve(page, "f′").count()) === 1 && (await curve(page, "f′").getAttribute('stroke')) !== (await curve(page, 'f').getAttribute('stroke')) && (await page.locator('[data-ml-plane] text', { hasText: /^B$/ }).count()) === 1 && /B\(2,5 ; 5\)/.test(await page.locator('[data-ml-tangent-pair]').innerText()), await page.locator('[data-ml-tangent-pair]').innerText());
  await page.locator('[data-ml-tangent-slider]').evaluate((el) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, '-1');
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await sleep(300);
  // Le curseur quantifie au millième de l'étendue : −1 devient −0,992.
  record('tangente : le curseur (alternative clavier) déplace A → f′(−1) ≈ −2', Math.abs((await tangentX()) + 1) < 0.02 && Math.abs((await slopeOf()) + 2) < 0.05 && /^x = −0?[,.]?9|^x = −1/.test(await page.getAttribute('[data-ml-tangent-slider]', 'aria-valuetext')));
  await page.locator('[data-ml-fn-name="k"]').count();
  await page.screenshot({ path: `${OUT}/11-tangent-mode.png` });
  await waitSaved(page);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-grapher] [data-ml-plane] svg', { timeout: 30000 });
  await sleep(500);
  record('tangente : après rechargement — allumée, sur f, x = −1, f′ affichée', (await page.isChecked('[data-ml-tangent-toggle]')) && (await page.isChecked('[data-ml-tangent-pick="f"]')) && Math.abs((await tangentX()) + 1) < 0.02 && (await curve(page, "f′").count()) === 1);
  await page.click('[data-ml-tangent-toggle]');
  await sleep(300);
  record('tangente : éteinte → le grapheur d’avant (point d’inspection, pas de f′, pas de tangente)', !(await page.isChecked('[data-ml-tangent-toggle]')) && (await curve(page, "f′").count()) === 0 && (await page.locator('[data-ml-plane] polyline').count()) === 0 && (await page.locator('[data-ml-tangent-values]').count()) === 0 && (await page.locator('[data-ml-point]').count()) === 1);

  // ── 7. Le plan : zoom, glisser, molette, clavier, réinitialiser ──────
  const before = await readView(page);
  await page.click('[data-ml-zoom-in]');
  await sleep(200);
  const zoomedIn = await readView(page);
  record('plan : zoom +', span(zoomedIn) < span(before) * 0.9);
  await page.click('[data-ml-zoom-out]');
  await page.click('[data-ml-zoom-out]');
  await sleep(200);
  record('plan : zoom −', span(await readView(page)) > span(before) * 1.1);
  const stepBefore = await page.getAttribute('[data-ml-plane]', 'data-ml-step');
  for (let i = 0; i < 6; i += 1) await page.click('[data-ml-zoom-out]');
  await sleep(200);
  record('plan : le pas de la grille grandit en dézoomant', Number(await page.getAttribute('[data-ml-plane]', 'data-ml-step')) > Number(stepBefore), `${stepBefore} → ${await page.getAttribute('[data-ml-plane]', 'data-ml-step')}`);
  await page.click('[data-ml-zoom-reset]');
  await sleep(200);
  const reset = await readView(page);
  record('plan : réinitialiser revient à la fenêtre par défaut', Math.abs(reset[0] + 8) < 1e-6 && Math.abs(reset[1] - 8) < 1e-6);
  const box = await planeBox(page);
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  // On part loin du point A (sa zone de saisie fait 60 px) : ici on veut glisser le PLAN.
  const grab = { x: box.x + box.width * 0.25, y: box.y + box.height * 0.75 };
  await drag(page, grab, { x: grab.x + 200, y: grab.y + 100 });
  await sleep(200);
  const panned = await readView(page);
  record('plan : glisser déplace la vue (x vers la gauche, y vers le haut)', panned[0] < reset[0] - 1 && panned[2] > reset[2] + 0.5, `x ${panned[0].toFixed(2)}, y ${panned[2].toFixed(2)}`);
  await page.mouse.move(center.x, center.y);
  await page.mouse.wheel(0, -300);
  await sleep(200);
  record('plan : la molette zoome', span(await readView(page)) < span(panned));
  await page.locator('[data-ml-plane]').focus();
  const beforeKeys = await readView(page);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Minus');
  await sleep(200);
  const afterKeys = await readView(page);
  // La flèche décale le centre vers la droite, − élargit la fenêtre autour du centre.
  const centerOf = (v) => (v[0] + v[1]) / 2;
  record('plan : clavier — flèche et −', centerOf(afterKeys) > centerOf(beforeKeys) + 0.5 && span(afterKeys) > span(beforeKeys) * 1.1, `${beforeKeys.slice(0, 2)} → ${afterKeys.slice(0, 2)}`);
  await page.keyboard.press('0');
  await sleep(200);
  record('plan : clavier — 0 réinitialise', Math.abs((await readView(page))[0] + 8) < 1e-6);
  await page.mouse.move(center.x + 40, center.y - 30);
  await sleep(100);
  const readout = await page.locator('[data-ml-readout]').innerText();
  record('plan : lecture des coordonnées sous le curseur', /x = .+y = /.test(readout) && (await page.getAttribute('[data-ml-readout]', 'data-visible')) === 'true', readout);
  await page.click('[data-ml-zoom-in]');
  await waitSaved(page);
  const savedView = (await api(TOKEN, 'GET', `/math-lab/documents/${docId}`)).data.document.data.viewport;
  record('persistance : la fenêtre est enregistrée', savedView && Math.abs(savedView.xMin - (await readView(page))[0]) < 1e-3);

  // ── 8. Grille, export, titre ─────────────────────────────────────────
  await page.click('[data-ml-grid]');
  await sleep(200);
  record('coquille : la grille se cache', (await page.getAttribute('[data-ml-grid]', 'aria-pressed')) === 'false' && (await page.locator('[data-ml-plane].sa-ml-grapher__plane--nogrid').count()) === 1);
  await page.screenshot({ path: `${OUT}/06-no-grid.png` });
  await page.click('[data-ml-grid]');
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }),
    page.click('[data-ml-export]'),
  ]);
  record('coquille : export PNG', download.suggestedFilename().endsWith('.png'), download.suggestedFilename());
  await download.saveAs(`${OUT}/export.png`);
  await page.fill('[data-ml-title]', 'الدالة التربيعية');
  await waitSaved(page);
  record('persistance : le titre est enregistré', (await api(TOKEN, 'GET', `/math-lab/documents/${docId}`)).data.document?.title === 'الدالة التربيعية');

  // ── 9. Rechargement : tout est relu ──────────────────────────────────
  await page.click('[data-ml-fn-name="g"] [data-ml-fn-toggle]');
  await waitSaved(page);
  const viewBeforeReload = await readView(page);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-grapher] [data-ml-plane] svg', { timeout: 30000 });
  await sleep(500);
  const viewAfterReload = await readView(page);
  record('rechargement : les trois fonctions, leurs expressions', (await page.locator('[data-ml-fn]').count()) === 3 && (await fieldValue(page, 'f')) === 'x^2' && (await fieldValue(page, 'g')) === '2x+1' && /\\sin/.test(await fieldValue(page, 'h')));
  record('rechargement : g reste cachée', (await curve(page, 'g').count()) === 0 && (await curve(page, 'f').count()) === 1);
  record('rechargement : la couleur choisie pour g est relue', (await page.locator('[data-ml-fn-name="g"] [data-ml-fn-color]').evaluate((el) => el.style.backgroundColor)) === 'rgb(124, 58, 237)');
  // À un pixel de boîte près (l'ajustement au format peut décaler de 0,02 unité).
  record('rechargement : la fenêtre est la même', Math.abs(viewAfterReload[0] - viewBeforeReload[0]) < 0.05 && Math.abs(span(viewAfterReload) - span(viewBeforeReload)) < 0.05, `${viewBeforeReload.slice(0, 2)} → ${viewAfterReload.slice(0, 2)}`);
  record('rechargement : le point A est là', (await page.locator('[data-ml-point]').count()) === 1 && (await page.locator('[data-ml-plane] .mafs-movable-point').count()) === 1);
  record('rechargement : titre relu', (await page.inputValue('[data-ml-title]')) === 'الدالة التربيعية');
  await page.click('[data-ml-back]');
  await page.waitForSelector(`[data-ml-doc="${docId}"]`, { timeout: 15000 });
  record('أعمالي : listé avec son titre', (await page.locator(`[data-ml-doc="${docId}"]`).innerText()).includes('الدالة التربيعية'));
  await page.click(`[data-ml-doc="${docId}"] [data-ml-doc-open]`);
  await page.waitForSelector('[data-ml-grapher] [data-ml-plane] svg', { timeout: 30000 });
  record('أعمالي : rouvrir', docIdOf(page.url()) === docId);

  // ── 10. RTL ──────────────────────────────────────────────────────────
  const panelBox = await page.locator('[data-ml-panel]').boundingBox();
  const plane2 = await planeBox(page);
  record('RTL : le panneau est à droite du plan', panelBox.x > plane2.x + plane2.width - 1);
  record('RTL : l’expression se lit de gauche à droite', (await page.locator('[data-ml-fn-name="f"] math-field').evaluate((el) => getComputedStyle(el).direction)) === 'ltr' && (await page.locator('[data-ml-fn-name="f"] .sa-ml-grapher__row-main').evaluate((el) => getComputedStyle(el).direction)) === 'ltr');
  record('RTL : le panneau lui-même est en arabe, RTL', (await page.locator('[data-ml-panel]').evaluate((el) => getComputedStyle(el).direction)) === 'rtl' && /[؀-ۿ]/.test(await page.locator('[data-ml-panel]').innerText()));
  record('RTL : les étiquettes d’axes sont des chiffres, avec le vrai moins', (await page.locator('[data-ml-plane] .mafs-axis text').evaluateAll((els) => els.map((e) => e.textContent))).some((t) => t.startsWith('−')));

  // ── 11. Mسح الكل ─────────────────────────────────────────────────────
  await page.click('[data-ml-clear]');
  await page.waitForSelector('[role="alertdialog"]', { timeout: 5000 });
  record('coquille : le texte de confirmation est celui du grapheur', (await page.locator('[role="alertdialog"]').innerText()).includes('الدوال'));
  await page.click('[role="alertdialog"] button:not([data-nb-confirm])');
  record('coquille : « مسح الكل » se refuse sans confirmation', (await page.locator('[data-ml-fn]').count()) === 3);
  await page.click('[data-ml-clear]');
  await page.waitForSelector('[role="alertdialog"]', { timeout: 5000 });
  await page.click('[data-nb-confirm]');
  await sleep(300);
  record('coquille : « مسح الكل » vide, l’état vide explique quoi faire', (await page.locator('[data-ml-fn]').count()) === 0 && (await page.locator('[data-ml-empty]').count()) === 1 && (await page.locator('[data-ml-plane] .mafs-axis text').count()) > 4);
  await page.screenshot({ path: `${OUT}/07-empty-state.png` });
  await waitSaved(page);
  record('persistance : le vide est enregistré', (await api(TOKEN, 'GET', `/math-lab/documents/${docId}`)).data.document?.data?.functions?.length === 0);
  await page.click('[data-ml-preset="x^2"]');
  await sleep(300);
  record('état vide : un exemple relance', (await curve(page, 'f').count()) === 1);

  // ── 12. Segment/document inconnus ────────────────────────────────────
  await page.goto(`${BASE}/espace/atelier/grapheur/999999999`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-error]', { timeout: 15000 });
  record('sécurité : document inexistant ou d’autrui → « غير موجود »', (await page.locator('[data-ml-error]').innerText()).includes('غير موجود'));
} catch (e) {
  record('scénario bureau interrompu', false, String(e).slice(0, 300));
  await page.screenshot({ path: `${OUT}/error-desktop.png` }).catch(() => {});
} finally {
  await ctx.close();
}

// ── 13. Visiteur ──────────────────────────────────────────────────────────
try {
  const anon = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'ar-DZ' });
  const p = await anon.newPage();
  await p.goto(`${BASE}/espace/atelier/grapheur?lab=secondaire`, { waitUntil: 'networkidle' });
  record('sécurité : visiteur → connexion', /\/login/.test(p.url()));
  await anon.close();
} catch (e) {
  record('visiteur', false, String(e).slice(0, 200));
}

// ── 14. Tablette et mobile ────────────────────────────────────────────────
for (const [label, width, height, touch] of [['tablette', 1024, 768, true], ['mobile', 390, 844, true]]) {
  const c = await authedContext({ viewport: { width, height }, locale: 'ar-DZ', hasTouch: touch, isMobile: width < 700, deviceScaleFactor: 1 });
  const p = await c.newPage();
  attach(p);
  try {
    await openGrapher(p);
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    record(`${label} : sans débordement horizontal`, overflow <= 0, `${overflow}px`);
    const fits = await p.evaluate(() => {
      const r = document.querySelector('[data-ml-tool]').getBoundingClientRect();
      return { bottom: r.bottom, inner: window.innerHeight };
    });
    const pb = await planeBox(p);
    record(`${label} : l’instrument tient dans l’écran, le plan domine`, fits.bottom <= fits.inner + 1 && pb.height > 200, `bas ${fits.bottom.toFixed(0)} / ${fits.inner}, plan ${pb.height.toFixed(0)}px`);
    const sizes = await Promise.all(['[data-ml-zoom-in]', '[data-ml-fn-name="f"] [data-ml-fn-toggle]', '[data-ml-fn-add]', '[data-ml-save]'].map((s) => p.locator(s).boundingBox()));
    record(`${label} : cibles tactiles ≥ 44 px`, sizes.every((b) => b && b.height >= 44 && b.width >= 44));
    if (width < 700) {
      const panel = await p.locator('[data-ml-panel]').boundingBox();
      record('mobile : le plan est au-dessus du panneau', panel.y > pb.y);
      await p.tap('[data-ml-panel-toggle]');
      await sleep(300);
      const pbCollapsed = await planeBox(p);
      record('mobile : replier le panneau agrandit le plan', pbCollapsed.height > pb.height + 50, `${pb.height.toFixed(0)} → ${pbCollapsed.height.toFixed(0)}px`);
      await p.screenshot({ path: `${OUT}/09-mobile-collapsed.png` });
      await p.tap('[data-ml-panel-toggle]');
      await sleep(300);
    }
    // Un tap sur la courbe pose un point ; un glisser au doigt déplace la vue.
    const target = await toPage(p, 1, 1);
    await p.touchscreen.tap(target.x, target.y);
    await sleep(300);
    record(`${label} : un tap sur f pose A`, (await p.locator('[data-ml-point]').count()) === 1);
    await p.waitForURL(/\/espace\/atelier\/grapheur\/\d+(?:\?lab=\w+)?$/, { timeout: 12000 });
    const id = docIdOf(p.url());
    created.add(id);
    await waitSaved(p);
    record(`${label} : enregistré`, (await api(TOKEN, 'GET', `/math-lab/documents/${id}`)).data.document?.data?.points?.length === 1);
    const v0 = await readView(p);
    const box = await planeBox(p);
    await drag(p, { x: box.x + box.width * 0.5, y: box.y + box.height * 0.5 }, { x: box.x + box.width * 0.3, y: box.y + box.height * 0.4 }, 10);
    await sleep(300);
    record(`${label} : glisser déplace la vue`, (await readView(p))[0] !== v0[0]);
    await p.tap('[data-ml-tangent-toggle]');
    await sleep(400);
    const th = await p.locator('[data-ml-plane] .mafs-movable-point').boundingBox();
    await drag(p, { x: th.x + th.width / 2, y: th.y + th.height / 2 }, { x: th.x + th.width / 2 + 50, y: th.y + th.height / 2 }, 8);
    await sleep(300);
    const tx = Number((await p.inputValue('[data-ml-tangent-x]')).replace(/−/g, '-').replace(',', '.'));
    const ts = Number((await p.locator('[data-ml-tangent-slope] .sa-ml-grapher__point-number').innerText()).replace(/−/g, '-').replace(',', '.'));
    record(`${label} : mode tangente — A glisse au doigt, f′ = 2x suit`, tx > 1 && Math.abs(ts - 2 * tx) < 1e-2, `x = ${tx}, f′ = ${ts}`);
    await p.tap('[data-ml-tangent-toggle]');
    await sleep(300);
    await p.tap('[data-ml-fn-name="f"] [data-ml-fn-color]');
    await p.waitForSelector('[data-ml-palette]', { timeout: 3000 });
    const pal = await p.locator('[data-ml-palette]').boundingBox();
    record(`${label} : la palette reste dans l’écran, cibles ≥ 36 px`, pal.x >= 0 && pal.y >= 0 && pal.x + pal.width <= width && pal.y + pal.height <= height && (await p.locator('[data-ml-palette-color]').first().boundingBox()).height >= 36);
    await p.screenshot({ path: `${OUT}/10-${label}-palette.png` });
    await p.tap('[data-ml-palette-color="#d97706"]');
    await sleep(300);
    record(`${label} : la couleur choisie au doigt s’applique`, (await curve(p, 'f').getAttribute('stroke')) === '#d97706');
    await p.locator('[data-ml-fn-name="f"] math-field').tap();
    await sleep(600);
    const keyboardShown = await p.locator('.ML__keyboard').count();
    record(`${label} : le clavier virtuel MathLive apparaît au toucher`, keyboardShown >= 1);
    await p.screenshot({ path: `${OUT}/08-${label}.png` });
  } catch (e) {
    record(`${label} : scénario interrompu`, false, String(e).slice(0, 300));
    await p.screenshot({ path: `${OUT}/error-${label}.png` }).catch(() => {});
  } finally {
    await c.close();
  }
}

// ── Nettoyage ────────────────────────────────────────────────────────────
for (const id of created) await api(TOKEN, 'DELETE', `/math-lab/documents/${id}`);

record('aucune erreur de page', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
record('aucune erreur console inattendue', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} vérifications réussies — captures dans ${OUT}`);
process.exit(failed.length ? 1 : 0);
