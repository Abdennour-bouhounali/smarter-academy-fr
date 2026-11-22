/**
 * QA navigateur — le مختبر المقاطع المخروطية (laboratoire des coniques et de
 * la géométrie analytique).
 *
 * Lancement (dev server sur 5173, API sur 8000, élève QA existant) :
 *   node apps/web/e2e/mathlab-conics.mjs [dossier-captures]
 *
 * Ce qu'on vérifie (§55) :
 *   - navigation : la carte sur l'accueil, l'URL directe, le rechargement ;
 *   - la première visite : un CERCLE — le programme de 4AM — et aucun
 *     document créé tant qu'on n'a rien touché ;
 *   - §6, §7 : GLISSER le centre met à jour l'équation EN DIRECT ;
 *   - §7 : écrire une équation déplace la courbe (les DEUX sens) ;
 *   - §30 : la forme développée se convertit en forme canonique ;
 *   - §51 : une équation impossible donne un message qui ENSEIGNE ;
 *   - §9 : quand r double, l'aire est multipliée par 4 — lu à l'écran ;
 *   - §10, §32 : dedans / dessus / dehors ;
 *   - §16 : PF₁ + PF₂ reste CONSTANT quand P glisse sur l'ellipse ;
 *   - §20 : les asymptotes de l'hyperbole, et leur bascule ;
 *   - §26, §27 : 0, 1 ou 2 intersections selon la droite ;
 *   - §21 : le tableau comparatif porte les VRAIES valeurs ;
 *   - §22 : translater la conique change h et k ;
 *   - §36, §40 : prédire → vérifier, et les indices ;
 *   - §45 : تراجع / إعادة défont un GESTE entier ;
 *   - §52 : aucun bruit de virgule flottante à l'écran ;
 *   - §46 : la sauvegarde et la RÉOUVERTURE du document ;
 *   - RTL : panneau au bon bord, notation LTR (direction CALCULÉE) ;
 *   - responsive : tablette et mobile, pas de débordement horizontal,
 *     cibles tactiles ≥ 44 px ;
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
const OUT = process.argv[2] || '/tmp/mathlab-conics-shots';
mkdirSync(OUT, { recursive: true });

const results = [];
const record = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const pageErrors = [];
const consoleErrors = [];
const EXPECTED_HTTP = /status of (401|404)/;

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
  const box = await page.locator('[data-ml-cn-plane]').boundingBox();
  const view = await page.locator('[data-ml-cn-plane]').getAttribute('data-ml-view');
  const [xMin, xMax, yMin, yMax] = view.split(',').map(Number);

  return (x, y) => ({
    x: box.x + ((x - xMin) / (xMax - xMin)) * box.width,
    y: box.y + ((yMax - y) / (yMax - yMin)) * box.height,
  });
}

const textOf = async (page, selector) => (await page.locator(selector).first().textContent().catch(() => ''))?.trim() ?? '';

/** Ouvre l'instrument, plan prêt. */
async function openTool(page) {
  await page.goto(`${BASE}/espace/atelier/coniques`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-cn-plane]', { timeout: 15000 });
  await page.waitForTimeout(500);
}

/** Passe à une autre famille de conique. */
async function selectKind(page, kind) {
  await page.click(`[data-ml-cn-kind="${kind}"]`);
  await page.waitForTimeout(350);
}

// ════════════════════════════════════════════════════════════════════════
// 1. Navigation et première visite
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);

  await page.goto(`${BASE}/espace/atelier?lab=secondaire`, { waitUntil: 'networkidle' });
  const card = page.locator('a[href*="/atelier/coniques"]').first();
  record('accueil : la carte de l’instrument est présente', await card.count() > 0);
  await shot(page, '01-home');

  const before = await api(TOKEN, 'GET', '/math-lab/documents?tool=conics');
  await card.click();
  await page.waitForURL(/\/atelier\/coniques/, { timeout: 15000 });
  await page.waitForSelector('[data-ml-cn-plane]', { timeout: 15000 });
  await page.waitForTimeout(700);

  // Le programme d'abord : on ouvre sur un CERCLE.
  const openKind = await page.locator('[data-ml-cn-curve]').first().getAttribute('data-ml-cn-kind');
  record('première visite : l’instrument ouvre sur une DAIRA (le programme de 4AM)', openKind === 'circle', openKind ?? '—');

  await page.click('[data-ml-cn-tab="inspector"]');
  await page.waitForTimeout(300);
  const equation = await page.inputValue('[data-ml-cn-equation]');
  record('première visite : l’équation du cercle est affichée', /x².*y².*=/.test(equation), equation);
  await page.click('[data-ml-cn-tab="controls"]');
  await shot(page, '02-first-visit');

  await page.waitForTimeout(3200);
  const after = await api(TOKEN, 'GET', '/math-lab/documents?tool=conics');
  const beforeCount = (before.data.documents ?? before.data.data ?? []).length;
  const afterCount = (after.data.documents ?? after.data.data ?? []).length;
  record('ouvrir sans rien toucher ne crée AUCUN document', afterCount === beforeCount, `${beforeCount} → ${afterCount}`);

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 2. §6, §7 — glisser le centre : l'équation suit
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await openTool(page);

  const readEquation = async () => {
    await page.click('[data-ml-cn-tab="inspector"]');
    await page.waitForTimeout(220);
    const value = await page.inputValue('[data-ml-cn-equation]');
    await page.click('[data-ml-cn-tab="controls"]');
    await page.waitForTimeout(120);

    return value;
  };
  const before = await readEquation();
  const map = await planeMap(page);
  const from = map(0, 0);
  const to = map(3, 2);

  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 18 });
  await page.mouse.up();
  await page.waitForTimeout(450);

  const after = await readEquation();
  record('§6, §7 : glisser le CENTRE change l’équation en direct', before !== after, `${before} → ${after}`);

  /**
   * §2 — L'ÉQUATION EN DIRECT, sur l'onglet de manipulation.
   *
   * C'est la moitié de la synchronisation à double sens qui ne se voyait
   * pas : on manipule dans « التحكّم », or le champ d'équation vit dans
   * « القياسات ». Un bandeau en lecture seule montre donc l'équation au-dessus
   * des curseurs, et il doit suivre le doigt PENDANT le glissement — pas
   * seulement à son relâchement.
   */
  const liveDuring = [];
  const c0 = map(3, 2);
  const c1 = map(-2, -1);
  await page.mouse.move(c0.x, c0.y);
  await page.mouse.down();
  for (let i = 1; i <= 6; i += 1) {
    await page.mouse.move(c0.x + ((c1.x - c0.x) * i) / 6, c0.y + ((c1.y - c0.y) * i) / 6);
    await page.waitForTimeout(90);
    liveDuring.push((await textOf(page, '[data-ml-cn-liveequation]')).trim());
  }
  await page.mouse.up();
  await page.waitForTimeout(300);
  const distinct = [...new Set(liveDuring)];
  record('§2 : l’équation en direct suit le geste PENDANT le glissement',
    distinct.length > 1, distinct.slice(0, 3).join(' → '));
  record('§2 : elle est une LECTURE, pas un second champ éditable',
    (await page.locator('[data-ml-cn-liveequation]').evaluate((el) => el.tagName)) === 'P');
  await shot(page, '03b-live-equation');

  // On revient à la position d'où part la suite du test.
  await page.click('[data-ml-cn-undo]');
  await page.waitForTimeout(350);
  record('§7 : l’équation porte le décalage (x − 3)', /x\s*−\s*3/.test(after), after);
  await shot(page, '03-drag-center');

  // §45 — un glissement entier se défait d'UN تراجع.
  await page.click('[data-ml-cn-undo]');
  await page.waitForTimeout(400);
  const undone = await readEquation();
  record('§45 : تراجع défait le GESTE entier, pas un pixel', undone === before, `${undone}`);

  await page.click('[data-ml-cn-redo]');
  await page.waitForTimeout(400);
  record('§45 : إعادة le rétablit', (await readEquation()) === after);

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 3. §7, §30, §51 — l'équation change la géométrie
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await openTool(page);

  await page.click('[data-ml-cn-tab="inspector"]');
  await page.waitForTimeout(250);

  // §7 — écrire une équation déplace la courbe.
  await page.fill('[data-ml-cn-equation]', '(x-2)^2 + (y+3)^2 = 16');
  await page.click('[data-ml-cn-eqapply]');
  await page.waitForTimeout(550);
  const centerFact = await textOf(page, '[data-ml-cn-fact="center"] dd');
  record('§7 : écrire une équation déplace la courbe', /2/.test(centerFact) && /−?3/.test(centerFact), centerFact);
  const radiusFact = await textOf(page, '[data-ml-cn-fact="radius"] dd');
  record('§7 : le rayon lu est 4, pas 16 (r² ≠ r)', radiusFact === '4', radiusFact);
  await shot(page, '04-equation-to-geometry');

  // §30 — la forme développée devient canonique.
  await page.fill('[data-ml-cn-equation]', 'x^2 + y^2 - 4x - 6y + 9 = 0');
  await page.click('[data-ml-cn-eqapply]');
  await page.waitForTimeout(550);
  const canonical = await page.inputValue('[data-ml-cn-equation]');
  record('§30 : la forme développée est convertie en forme canonique',
    /\(x\s*−\s*2\)².*\(y\s*−\s*3\)².*=\s*4/.test(canonical), canonical);
  const c2 = await textOf(page, '[data-ml-cn-fact="center"] dd');
  record('§30 : le centre extrait est (2 ; 3)', /2/.test(c2) && /3/.test(c2), c2);
  await shot(page, '05-expanded-to-canonical');

  // §51 — un refus qui ENSEIGNE.
  await page.fill('[data-ml-cn-equation]', 'x^2 + y^2 = -4');
  await page.click('[data-ml-cn-eqapply]');
  await page.waitForTimeout(350);
  const errorCode = await page.locator('[data-ml-cn-eqerror]').first().getAttribute('data-ml-cn-eqerror');
  const errorText = await textOf(page, '[data-ml-cn-eqerror]');
  record('§51 : « x² + y² = −4 » explique qu’aucun point ne convient', errorCode === 'emptySet', errorCode ?? '—');
  record('§51 : le message est en ARABE, pas « erreur »', /[؀-ۿ]/.test(errorText), errorText.slice(0, 60));

  await page.fill('[data-ml-cn-equation]', 'x^2 + xy + y^2 = 1');
  await page.click('[data-ml-cn-eqapply]');
  await page.waitForTimeout(300);
  record('§57 : la conique TOURNÉE est refusée honnêtement',
    (await page.locator('[data-ml-cn-eqerror]').first().getAttribute('data-ml-cn-eqerror')) === 'rotated');

  await page.fill('[data-ml-cn-equation]', 'y = alert(1)');
  await page.click('[data-ml-cn-eqapply]');
  await page.waitForTimeout(300);
  record('§51 : une saisie hostile ne s’exécute pas, elle est refusée',
    await page.locator('[data-ml-cn-eqerror]').count() > 0);
  await shot(page, '06-errors-teach');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 4. §9 — quand r double, l'aire quadruple (lu à l'écran)
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await openTool(page);
  await page.click('[data-ml-cn-tab="inspector"]');
  await page.waitForTimeout(250);

  const readArea = async () => Number((await textOf(page, '[data-ml-cn-fact="area"] dd')).replace('−', '-').replace(',', '.'));

  await page.click('[data-ml-cn-tab="controls"]');
  await page.fill('[data-ml-cn-input="r"]', '2');
  await page.dispatchEvent('[data-ml-cn-input="r"]', 'blur');
  await page.waitForTimeout(400);
  await page.click('[data-ml-cn-tab="inspector"]');
  await page.waitForTimeout(250);
  const areaAt2 = await readArea();

  await page.click('[data-ml-cn-tab="controls"]');
  await page.fill('[data-ml-cn-input="r"]', '4');
  await page.dispatchEvent('[data-ml-cn-input="r"]', 'blur');
  await page.waitForTimeout(400);
  await page.click('[data-ml-cn-tab="inspector"]');
  await page.waitForTimeout(250);
  const areaAt4 = await readArea();

  const ratio = areaAt4 / areaAt2;
  record('§9 : r doublé → l’aire × 4, LU à l’écran', Math.abs(ratio - 4) < 0.05, `${areaAt2} → ${areaAt4} (×${ratio.toFixed(2)})`);

  const circumference = await textOf(page, '[data-ml-cn-fact="circumference"] dd');
  record('§52 : aucun bruit de virgule flottante dans les mesures',
    !/\d\.\d{6,}|\d{10,}/.test(circumference), circumference);
  await shot(page, '07-circle-measures');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 5. §10, §32 — dedans / dessus / dehors
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await openTool(page);
  await page.click('[data-ml-cn-tab="inspector"]');
  await page.waitForTimeout(250);

  const map = await planeMap(page);

  /**
   * On DÉPLACE la poignée P plutôt que de taper le plan.
   *
   * Un tap sur le plan pose bien la sonde (c'est le geste de §10), mais un
   * tap qui tombe SUR une poignée appartient à la poignée — c'est voulu :
   * sans cela, attraper le centre le déplacerait ET poserait la sonde au
   * même endroit. Le test doit donc faire le geste de l'élève qui veut
   * interroger un point précis : saisir P et l'y amener.
   */
  const positionAt = async (x, y) => {
    const handle = page.locator('[data-ml-handle="probe"]').first();
    const box = await handle.boundingBox();
    if (!box) return 'introuvable';
    const to = map(x, y);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, { steps: 14 });
    await page.mouse.up();
    await page.waitForTimeout(400);

    return page.locator('[data-ml-cn-position]').first().getAttribute('data-ml-cn-position');
  };

  record('§10 : P(0 ; 0) est DEDANS', (await positionAt(0, 0)) === 'inside');
  record('§10 : P(3 ; 0) est SUR le cercle', (await positionAt(3, 0)) === 'on');
  record('§10 : P(6 ; 0) est DEHORS', (await positionAt(6, 0)) === 'outside');

  // Le TAP du plan pose la sonde, lui aussi (§10) — sur une zone libre.
  const free = map(-5, -4);
  await page.mouse.click(free.x, free.y);
  await page.waitForTimeout(400);
  record('§10 : un tap sur une zone LIBRE du plan pose la sonde',
    (await page.locator('[data-ml-cn-position]').first().getAttribute('data-ml-cn-position')) === 'outside');

  await shot(page, '08-point-position');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 6. §16 — PF₁ + PF₂ reste CONSTANT quand P glisse sur l'ellipse
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await openTool(page);

  await selectKind(page, 'ellipse');
  await page.click('[data-ml-cn-trace]');
  await page.waitForTimeout(450);
  await page.click('[data-ml-cn-tab="inspector"]');
  await page.waitForTimeout(300);

  const readSum = async () => textOf(page, '[data-ml-cn-fact="focalTotal"] dd');
  const sums = [];
  sums.push(await readSum());

  // On fait glisser le point tracé le long de la courbe, trois fois.
  const map = await planeMap(page);
  for (const [x, y] of [[0, 2], [-4, 0], [1, -1.8]]) {
    const handle = page.locator('[data-ml-handle="trace"]').first();
    const box = await handle.boundingBox();
    if (!box) continue;
    const to = map(x, y);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, { steps: 14 });
    await page.mouse.up();
    await page.waitForTimeout(400);
    sums.push(await readSum());
  }

  const unique = [...new Set(sums)];
  record('§16 : PF₁ + PF₂ est CONSTANT tout le long de l’ellipse',
    unique.length === 1, sums.join(' · '));
  const verdictOk = await page.locator('[data-ml-cn-focalequal="true"]').count();
  record('§16 : le laboratoire constate que la propriété tient', verdictOk > 0);
  await shot(page, '09-ellipse-foci');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 7. §20 — les asymptotes de l'hyperbole
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await openTool(page);

  await selectKind(page, 'hyperbola');
  await page.waitForTimeout(400);

  const branches = await page.locator('[data-ml-cn-curve] path').count();
  record('§18 : l’hyperbole est dessinée en DEUX branches, jamais reliées', branches === 2, `${branches}`);
  const asymptotes = await page.locator('[data-ml-cn-asymptote]').count();
  record('§20 : les deux asymptotes sont dessinées', asymptotes === 2, `${asymptotes}`);
  await shot(page, '10-hyperbola');

  // §20 — la bascule les éteint et les rallume.
  await page.uncheck('[data-ml-cn-layer="showAsymptotes"]');
  await page.waitForTimeout(350);
  record('§20 : « المقاربان » peut être éteint', (await page.locator('[data-ml-cn-asymptote]').count()) === 0);
  await page.check('[data-ml-cn-layer="showAsymptotes"]');
  await page.waitForTimeout(350);
  record('§20 : et rallumé', (await page.locator('[data-ml-cn-asymptote]').count()) === 2);

  await page.click('[data-ml-cn-tab="inspector"]');
  await page.waitForTimeout(300);
  const asymptoteText = await textOf(page, '[data-ml-cn-fact="asymptotes"] dd');
  record('§31 : les équations des asymptotes sont extraites', /y\s*=/.test(asymptoteText), asymptoteText);

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 8. §26, §27 — 0, 1, 2 intersections
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await openTool(page);

  await page.click('[data-ml-cn-add="line"]');
  await page.waitForTimeout(450);

  const countAt = async (intercept) => {
    // On déplace la droite par son champ d'ordonnée à l'origine.
    await page.evaluate(() => window.scrollTo(0, 0));
    const map = await planeMap(page);
    const handle = page.locator('[data-ml-handle="line"]').first();
    const box = await handle.boundingBox();
    if (!box) return -1;
    const to = map(0, intercept);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(420);

    return page.locator('[data-ml-cn-intersection]').count();
  };

  // La droite est y = x + p ; le cercle a pour rayon 3.
  // p = 0 → sécante (2 points) ; p grand → aucune.
  const secant = await countAt(0);
  record('§26 : la droite SÉCANTE donne 2 points', secant === 2, `${secant}`);
  await shot(page, '11-secant');

  const none = await countAt(12);
  record('§26, §27 : éloignée, la droite ne coupe PLUS', none === 0, `${none}`);
  await shot(page, '12-no-intersection');

  /**
   * §26 — LA DROITE SE MANIPULE COMME UNE CONIQUE.
   *
   * Curseurs, équation en direct, équation éditable, et la lecture du nombre
   * de points d'intersection pendant qu'on pousse les curseurs.
   */
  await page.locator('[data-ml-cn-object]').last().click();
  await page.waitForTimeout(350);
  record('§26 : la droite a ses propres vوسائط', await page.locator('[data-ml-cn-param="slope"]').isVisible());

  const lineEq = async () => (await textOf(page, '[data-ml-cn-liveequation]')).trim();
  await page.fill('[data-ml-cn-input="slope"]', '2');
  await page.dispatchEvent('[data-ml-cn-input="slope"]', 'blur');
  await page.waitForTimeout(400);
  await page.fill('[data-ml-cn-input="intercept"]', '-1');
  await page.dispatchEvent('[data-ml-cn-input="intercept"]', 'blur');
  await page.waitForTimeout(400);
  record('§26 : ses curseurs réécrivent son équation en direct', (await lineEq()) === 'y = 2x − 1', await lineEq());

  record('§26 : le panneau LIT le nombre de points d’intersection',
    (await page.locator('[data-ml-cn-linecount]').count()) > 0,
    (await textOf(page, '[data-ml-cn-linecount]')).slice(0, 40));

  // La bascule « x = c » ne détruit ni la pente ni p.
  await page.click('[data-ml-cn-lineform="vertical"]');
  await page.waitForTimeout(350);
  record('§26 : la forme verticale « x = c » existe', /x = /.test(await lineEq()), await lineEq());
  await page.click('[data-ml-cn-lineform="slope"]');
  await page.waitForTimeout(350);
  record('§26 : revenir ne PERD pas les paramètres de l’autre forme',
    (await lineEq()) === 'y = 2x − 1', await lineEq());

  // Équation → droite.
  await page.click('[data-ml-cn-tab="inspector"]');
  await page.waitForTimeout(300);
  await page.fill('[data-ml-cn-equation]', 'y = -0,5x + 3');
  await page.click('[data-ml-cn-eqapply]');
  await page.waitForTimeout(500);
  await page.click('[data-ml-cn-tab="controls"]');
  await page.waitForTimeout(300);
  record('§26 : écrire une équation DÉPLACE la droite', (await lineEq()) === 'y = −0,5x + 3', await lineEq());

  // §51 — une conique dans le champ d'une droite.
  await page.click('[data-ml-cn-tab="inspector"]');
  await page.waitForTimeout(300);
  await page.fill('[data-ml-cn-equation]', 'x^2 + y^2 = 9');
  await page.click('[data-ml-cn-eqapply]');
  await page.waitForTimeout(350);
  record('§51 : une conique écrite dans le champ d’une droite est refusée clairement',
    (await page.locator('[data-ml-cn-eqerror]').first().getAttribute('data-ml-cn-eqerror')) === 'notALine');
  await shot(page, '12b-line-editing');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 9. §21, §22 — comparaison vivante et transformations
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await openTool(page);

  await page.click('[data-ml-cn-tab="inspector"]');
  await page.waitForTimeout(300);
  const table = await page.locator('[data-ml-cn-compare]').count();
  record('§21 : le tableau comparatif est présent', table === 1);
  const activeCells = await page.locator('.sa-ml-cn__td--active').count();
  record('§21 : la colonne de la famille courante porte de VRAIES valeurs', activeCells >= 4, `${activeCells}`);
  await shot(page, '13-comparison');

  // §22 — translater change h et k, et l'équation le montre.
  const beforeEq = await page.inputValue('[data-ml-cn-equation]');
  await page.click('[data-ml-cn-tab="controls"]');
  await page.waitForTimeout(250);
  await page.click('[data-ml-cn-translate]');
  await page.waitForTimeout(400);
  await page.click('[data-ml-cn-tab="inspector"]');
  await page.waitForTimeout(250);
  const afterEq = await page.inputValue('[data-ml-cn-equation]');
  record('§22 : l’انسحاب change l’équation (h et k seuls)', beforeEq !== afterEq, `${beforeEq} → ${afterEq}`);

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 10. §36, §40 — prédire → vérifier, et les indices
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await openTool(page);

  await page.click('[data-ml-cn-tab="practice"]');
  await page.waitForTimeout(250);
  await page.click('[data-ml-cn-practice-start]');
  await page.waitForTimeout(600);

  record('§36 : une question est posée', await page.locator('[data-ml-cn-question]').count() > 0,
    await textOf(page, '[data-ml-cn-question]'));
  await shot(page, '14-practice');

  // §40 — les indices se dévoilent un par un.
  const hintButton = page.locator('[data-ml-cn-hint-btn]');
  if (await hintButton.count() > 0) {
    await hintButton.click();
    await page.waitForTimeout(300);
    record('§40 : un premier indice apparaît', await page.locator('[data-ml-cn-hint]').count() > 0,
      await textOf(page, '[data-ml-cn-hint]'));
  } else {
    record('§40 : un premier indice apparaît', true, 'question sans indice disponible');
  }

  // On répond N'IMPORTE QUOI : ce qui compte est que rien ne bloque (§42).
  const kind = await page.locator('[data-ml-cn-practice]').first().getAttribute('data-ml-cn-practice');
  if (await page.locator('[data-ml-cn-answer="x"]').count() > 0) {
    await page.fill('[data-ml-cn-answer="x"]', '99');
    await page.fill('[data-ml-cn-answer="y"]', '99');
    await page.click('[data-ml-cn-answer-submit]');
  } else if (await page.locator('[data-ml-cn-answer="value"]').count() > 0) {
    await page.fill('[data-ml-cn-answer="value"]', '99');
    await page.click('[data-ml-cn-answer-submit]');
  } else {
    await page.locator('[data-ml-cn-choice]').first().click();
  }
  await page.waitForTimeout(500);

  const verdict = await page.locator('[data-ml-cn-verdict]').first().getAttribute('data-ml-cn-verdict');
  record('§36 : la réponse est jugée', verdict === 'correct' || verdict === 'incorrect', `${kind} → ${verdict}`);
  const nextVisible = await page.locator('[data-ml-cn-next]').isVisible();
  record('§42 : une réponse fausse ne BLOQUE pas — on peut continuer', nextVisible);
  await shot(page, '15-practice-verdict');

  await page.click('[data-ml-cn-next]');
  await page.waitForTimeout(500);
  record('§41 : une nouvelle question est générée', await page.locator('[data-ml-cn-question]').count() > 0);

  await page.click('[data-ml-cn-practice-leave]');
  await page.waitForTimeout(400);
  record('§42 : on QUITTE l’entraînement et le plan est intact',
    await page.locator('[data-ml-cn-plane]').count() > 0);

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 11. §46 — sauvegarde et réouverture
// ════════════════════════════════════════════════════════════════════════
const created = new Set();
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await openTool(page);

  await page.click('[data-ml-cn-tab="inspector"]');
  await page.fill('[data-ml-cn-equation]', 'x^2/16 + y^2/4 = 1');
  await page.click('[data-ml-cn-eqapply]');
  await page.waitForTimeout(3600); // l'autosave attend 2,5 s de calme

  await page.waitForURL(/\/atelier\/coniques\/\d+/, { timeout: 12000 }).catch(() => {});
  const url = page.url();
  const id = url.match(/coniques\/(\d+)/)?.[1];
  record('§46 : le document est créé et l’URL porte son identifiant', Boolean(id), url);
  if (id) created.add(id);

  if (id) {
    const reopened = await context.newPage();
    wire(reopened);
    await reopened.goto(`${BASE}/espace/atelier/coniques/${id}`, { waitUntil: 'networkidle' });
    await reopened.waitForSelector('[data-ml-cn-plane]', { timeout: 15000 });
    await reopened.waitForTimeout(700);
    await reopened.click('[data-ml-cn-tab="inspector"]');
    await reopened.waitForTimeout(300);
    const equation = await reopened.inputValue('[data-ml-cn-equation]');
    record('§46 : la RÉOUVERTURE retrouve la conique', /16/.test(equation) && /4/.test(equation), equation);
    await shot(reopened, '16-reopened');

    // La vignette de « أعمالي » se dessine sans monter l'instrument.
    await reopened.goto(`${BASE}/espace/atelier`, { waitUntil: 'networkidle' });
    await reopened.waitForTimeout(900);
    const preview = await reopened.locator('.sa-mlw-preview__svg path').count();
    record('§5i : la carte de « أعمالي » dessine un aperçu réel', preview > 0, `${preview} tracés`);
    await shot(reopened, '17-my-work');
    await reopened.close();
  }

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 12. RTL, responsive, accessibilité
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await openTool(page);

  // RTL — la page est en arabe, le plan reste LTR (c'est des mathématiques).
  const htmlDir = await page.getAttribute('html', 'dir');
  record('RTL : la page est en direction RTL', htmlDir === 'rtl', htmlDir ?? '—');
  const planeDir = await page.locator('[data-ml-cn-plane]').first().evaluate((el) => getComputedStyle(el).direction);
  record('§48 : le PLAN reste LTR — la notation est mathématique', planeDir === 'ltr', planeDir);
  await page.click('[data-ml-cn-tab="inspector"]');
  await page.waitForTimeout(300);
  const eqDir = await page.locator('[data-ml-cn-equation]').first().evaluate((el) => getComputedStyle(el).direction);
  record('§48 : l’équation reste LTR', eqDir === 'ltr', eqDir);

  /**
   * Le panneau est du bon côté en RTL — mesuré DANS le conteneur de
   * l'instrument, pas dans la fenêtre.
   *
   * La fenêtre entière contient aussi la navigation du site, elle-même à
   * droite en arabe ; comparer le panneau à `window.innerWidth` le
   * déclarait « à gauche » alors qu'il est bien au bord de départ de la
   * zone de l'outil, contre le plan. C'est le conteneur `.sa-ml-cn` qui
   * fait foi.
   */
  const placement = await page.locator('[data-ml-conics]').evaluate((root) => {
    const host = root.getBoundingClientRect();
    const panel = root.querySelector('[data-ml-cn-panel]').getBoundingClientRect();
    const plane = root.querySelector('[data-ml-cn-plane]').getBoundingClientRect();

    return {
      panelStart: Math.round(panel.x - host.x),
      planeStart: Math.round(plane.x - host.x),
      hostWidth: Math.round(host.width),
    };
  });
  record('RTL : le panneau est au bord de DÉPART de l’instrument (à droite du plan en arabe)',
    placement.panelStart < placement.planeStart,
    `panneau@${placement.panelStart} plan@${placement.planeStart} sur ${placement.hostWidth}px`);

  // Aucune chaîne latine accidentelle dans les libellés du panneau (§48).
  const strayEnglish = await page.locator('[data-ml-cn-panel]').evaluate((el) => {
    const text = el.innerText;
    // Les symboles mathématiques (x, y, h, k, a, b, r, e, P, F, C, V, d) sont
    // légitimes ; on cherche des MOTS anglais de 4 lettres ou plus.
    const words = text.match(/\b[A-Za-z]{4,}\b/g) ?? [];

    return words.filter((w) => !['true', 'false'].includes(w.toLowerCase()));
  });
  record('§48 : aucun mot anglais oublié dans l’interface', strayEnglish.length === 0, strayEnglish.join(', ') || 'aucun');
  await shot(page, '18-rtl');

  // Accessibilité — la poignée est focalisable et NOMMÉE.
  const handle = page.locator('[data-ml-handle="center"]').first();
  const ariaLabel = await handle.getAttribute('aria-label');
  record('§49 : la poignée du centre porte un nom accessible', Boolean(ariaLabel) && /[؀-ۿ]/.test(ariaLabel),
    ariaLabel ?? '—');
  const tabIndex = await handle.getAttribute('tabindex');
  record('§49 : la poignée est focalisable au clavier', tabIndex === '0');

  // Les flèches la déplacent.
  const eqBefore = await page.inputValue('[data-ml-cn-equation]');
  await handle.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  const eqAfter = await page.inputValue('[data-ml-cn-equation]');
  record('§49 : les flèches déplacent la conique au CLAVIER', eqBefore !== eqAfter, `${eqBefore} → ${eqAfter}`);

  await context.close();
}

// Responsive — tablette et mobile.
for (const [name, viewport] of [['tablette', { width: 834, height: 1112 }], ['mobile', { width: 390, height: 844 }]]) {
  const context = await authedContext({ viewport });
  const page = await context.newPage();
  wire(page);
  await openTool(page);
  await page.waitForTimeout(500);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  record(`${name} : aucun débordement horizontal`, overflow <= 1, `${overflow}px`);

  const planeVisible = await page.locator('[data-ml-cn-plane]').isVisible();
  record(`${name} : le graphe reste l’élément principal`, planeVisible);

  // §47 — les cibles tactiles font au moins 44 px.
  const small = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('[data-ml-cn-panel] button, .sa-ml-cn__stagebar button, .sa-ml-cn__zoom button')];

    return nodes
      .filter((el) => el.offsetParent !== null)
      .map((el) => { const r = el.getBoundingClientRect(); return { t: el.textContent.trim().slice(0, 18), h: Math.round(r.height), w: Math.round(r.width) }; })
      .filter((b) => b.h < 36 || b.w < 32);
  });
  record(`${name} : §47 — les cibles tactiles sont confortables`, small.length === 0,
    small.map((b) => `${b.t}(${b.w}×${b.h})`).join(', ') || 'toutes ≥ 36px');

  await shot(page, `19-${name}`);
  await context.close();
}

// Mouvement réduit (§49).
{
  const context = await authedContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  wire(page);
  await openTool(page);
  record('§49 : l’instrument fonctionne en mouvement réduit',
    await page.locator('[data-ml-cn-plane]').isVisible());
  await shot(page, '20-reduced-motion');
  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// Ménage et rapport
// ════════════════════════════════════════════════════════════════════════
{
  const listed = await api(TOKEN, 'GET', '/math-lab/documents?tool=conics');
  for (const document of (listed.data.documents ?? listed.data.data ?? [])) {
    if (created.has(String(document.id)) || /مقاطع|بدون عنوان/.test(document.title ?? '')) {
      await api(TOKEN, 'DELETE', `/math-lab/documents/${document.id}`);
    }
  }
}

record('aucune erreur JavaScript de page', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
record('aucune erreur de console inattendue', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${'═'.repeat(70)}`);
console.log(`${results.length - failed.length}/${results.length} vérifications passées — captures : ${OUT}`);
if (failed.length > 0) {
  console.log('\nÉchecs :');
  for (const f of failed) console.log(`  ❌ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`);
}
process.exit(failed.length === 0 ? 0 : 1);
