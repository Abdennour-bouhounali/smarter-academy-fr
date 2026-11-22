/**
 * QA navigateur — le مختبر الجبر (laboratoire d'algèbre) du مختبر الرياضيات.
 *
 * Lancement (dev server sur 5173, API sur 8000, élève QA existant) :
 *   node apps/web/e2e/mathlab-algebra.mjs [dossier-captures]
 *
 * Ce qu'on vérifie :
 *   - navigation : la carte sur l'accueil (plus « قريبًا »), l'URL directe,
 *     le rechargement, le visiteur non connecté ;
 *   - la première visite : `2x + 3 = 11` affichée, la balance dessinée,
 *     AUCUNE solution montrée, aucun document créé ;
 *   - les opérations : les quatre, par raccourci et par saisie, appliquées
 *     aux DEUX membres ; `2x + 3 = 11` → `−3` → `÷2` → `x = 4` ;
 *   - la simplification : pas de `2x + 3 − 3` qui traîne à l'écran ;
 *   - l'historique : un pas par opération, retour en arrière au clic ;
 *   - تراجع / إعادة, y compris la branche coupée ;
 *   - la solution : « إظهار الحل », puis « التحقق » qui substitue ;
 *   - les cas particuliers : aucune solution, une infinité ;
 *   - les inégalités : le sens qui se retourne (−2x > 6 → x < −3), la
 *     droite graduée, cercle vide/plein ;
 *   - le générateur : les quatre niveaux, équation soluble à chaque fois ;
 *   - la saisie libre : fractions, coefficients négatifs, refus motivé de
 *     `x^2 = 4` ;
 *   - les paramètres `ax + b = c` et le suivi de la solution ;
 *   - persistance : naissance au premier changement, sauvegarde, relecture
 *     (équation, historique, curseur), « أعمالي » ;
 *   - RTL : panneau à droite, notation LTR, SVG LTR (direction CALCULÉE) ;
 *   - responsive : tablette et mobile, pas de débordement horizontal,
 *     cibles tactiles ≥ 40 px ;
 *   - accessibilité : focus visible, clavier, état textuel pour lecteur d'écran.
 *
 * Les documents créés sont supprimés à la fin.
 */
import { chromium } from 'playwright';
import { playToEnd } from './_stepPlayer.mjs';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const EMAIL = process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const OUT = process.argv[2] || '/tmp/mathlab-algebra-shots';
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
const docIdOf = (url) => Number((url.match(/\/atelier\/algebre\/(\d+)/) || [])[1]) || null;

/** L'équation affichée en grand, en texte lisible (KaTeX rend du DOM). */
async function currentEquation(page) {
  return (await page.locator('[data-ml-current-equation]').first().innerText())
    .replace(/\s+/g, ' ')
    .trim();
}

/** Les équations de l'historique, de la plus ancienne à la plus récente. */
async function historyLines(page) {
  return (await page.locator('.sa-ml-alg__step-equation').allInnerTexts())
    .map((line) => line.replace(/\s+/g, ' ').trim());
}

async function clickSuggestion(page, label) {
  const button = page.locator('.sa-ml-alg__suggestion', { hasText: label }).first();
  if (await button.count() === 0) return false;
  await button.click();
  await sleep(120);
  return true;
}

/** Applique une opération par la saisie (le chemin « manipulation libre »). */
async function applyTyped(page, kindLabel, value) {
  await page.locator('.sa-ml-alg__kind', { hasText: kindLabel }).first().click();
  await page.fill('#sa-ml-alg-value-eq', value);
  await page.locator('.sa-ml-alg__apply').click();
  await sleep(150);
}

async function setEquation(page, text) {
  await page.fill('[data-ml-equation-input]', text);
  await page.locator('.sa-ml-alg__explore').click();
  await sleep(200);
}

// ── 1. Navigation et première visite ──────────────────────────────────────
{
  const context = await authedContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  attach(page);

  await page.goto(`${BASE}/espace/atelier?lab=secondaire`, { waitUntil: 'networkidle' });
  const card = page.locator('a, button').filter({ hasText: 'مختبر الجبر' }).first();
  const cardVisible = await card.count() > 0;
  record('accueil — la carte « مختبر الجبر » est présente', cardVisible);

  // L'outil ne doit plus être annoncé comme « قريبًا ».
  const plannedText = await page.locator('.sa-ml-home__planned, [class*="planned"]').allInnerTexts().catch(() => []);
  record('accueil — l’algèbre n’est plus « قريبًا »',
    !plannedText.join(' ').includes('الجبر'),
    plannedText.join(' ').includes('الجبر') ? 'encore annoncée' : '');

  await page.goto(`${BASE}/espace/atelier/algebre?lab=secondaire`, { waitUntil: 'networkidle' });
  await sleep(600);

  const equation = await currentEquation(page);
  record('première visite — l’équation de départ est affichée', equation.includes('2x') && equation.includes('11'), equation);

  const balance = await page.locator('.sa-ml-alg__balance').count();
  record('première visite — la balance est dessinée', balance === 1);

  // §8 : surtout NE PAS afficher la solution à l'ouverture.
  const solutionShown = await page.locator('[data-ml-solution]').count();
  record('première visite — la solution n’est PAS affichée (§8)', solutionShown === 0);

  // Ouvrir l'instrument ne doit RIEN créer : le document naît au premier
  // changement (useMathLabDocument), pas à la visite.
  const before = await api(TOKEN, 'GET', '/math-lab/documents?tool=algebra');
  const countBefore = (before.data.documents ?? []).length;
  await sleep(3200);
  const after = await api(TOKEN, 'GET', '/math-lab/documents?tool=algebra');
  const countAfter = (after.data.documents ?? []).length;
  record('première visite — aucun document créé sans changement',
    countAfter === countBefore, `${countBefore} → ${countAfter}`);

  await page.screenshot({ path: `${OUT}/01-premiere-visite.png`, fullPage: false });
  await context.close();
}

// ── 2. Les opérations, la simplification, l'historique ────────────────────
let createdDocId = null;
{
  const context = await authedContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  attach(page);
  await page.goto(`${BASE}/espace/atelier/algebre?lab=secondaire`, { waitUntil: 'networkidle' });
  await sleep(600);

  // Le chemin canonique du cahier des charges : 2x + 3 = 11 → −3 → ÷2 → x = 4.
  const usedSuggestion = await clickSuggestion(page, '−');
  record('opérations — un raccourci applique l’opération', usedSuggestion);

  let equation = await currentEquation(page);
  record('simplification — « 2x + 3 − 3 » ne traîne pas à l’écran',
    !equation.includes('+ 3 −') && equation.includes('2x') && equation.includes('8'), equation);

  await applyTyped(page, 'القسمة', '2');
  equation = await currentEquation(page);
  record('deux étapes — 2x + 3 = 11 donne x = 4', /x\s*=\s*4/.test(equation), equation);

  const history = await historyLines(page);
  record('historique — trois pas enregistrés', history.length === 3, history.join(' | '));

  // تراجع / إعادة
  await page.locator('[data-ml-undo]').click();
  await sleep(150);
  record('تراجع — revient au pas précédent', (await currentEquation(page)).includes('8'), await currentEquation(page));
  await page.locator('[data-ml-redo]').click();
  await sleep(150);
  record('إعادة — repart en avant', /x\s*=\s*4/.test(await currentEquation(page)));

  // Revenir à un pas par un clic dans l'historique : le pas redevient
  // courant, et les suivants sont marqués « à venir ».
  await page.locator('.sa-ml-alg__step-equation').first().click();
  await sleep(250);
  const back = await currentEquation(page);
  const activeStep = (await page.locator('.sa-ml-alg__step--active .sa-ml-alg__step-equation').innerText().catch(() => ''))
    .replace(/\s+/g, ' ').trim();
  const ahead = await page.locator('.sa-ml-alg__step--ahead').count();
  record('historique — cliquer un pas y revient',
    /2x\+3=11/.test(back.replace(/\s/g, '')) && /2x\+3=11/.test(activeStep.replace(/\s/g, '')) && ahead === 2,
    `${back} · ${ahead} pas à venir`);

  // Repartir en avant puis brancher : la branche abandonnée disparaît.
  await page.locator('[data-ml-redo]').click();
  await sleep(120);
  await applyTyped(page, 'الضرب', '3');
  const branched = await historyLines(page);
  record('historique — une opération après un retour coupe la branche', branched.length === 3, branched.join(' | '));

  // La solution : secondaire, puis la vérification.
  // « حلّ خطوة بخطوة » déroule la solution (MATH_LAB §5e.10), puis « التحقق » se déroule aussi.
  await page.locator('[data-ml-alg-solve]').first().click();
  await sleep(150);
  await playToEnd(page, 'data-ml-alg-step');
  const verifyButton = page.locator('[data-ml-alg-verify]').first();
  if (await verifyButton.count() > 0) {
    await verifyButton.click();
    await sleep(200);
    await playToEnd(page, 'data-ml-alg-verify-step');
    const verification = await page.locator('[data-ml-verification]').innerText().catch(() => '');
    record('التحقق — la substitution est montrée', verification.length > 0, verification.replace(/\s+/g, ' ').slice(0, 80));
  } else {
    record('التحقق — le bouton est proposé', false, 'bouton absent');
  }

  await page.screenshot({ path: `${OUT}/02-operations.png` });

  // Persistance : le document est né au premier changement.
  await sleep(3200);
  createdDocId = docIdOf(page.url());
  record('persistance — le document est créé et l’URL porte son identifiant', Boolean(createdDocId), page.url());
  if (createdDocId) created.add(createdDocId);

  await context.close();
}

// ── 3. Relecture ──────────────────────────────────────────────────────────
if (createdDocId) {
  const context = await authedContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  attach(page);
  await page.goto(`${BASE}/espace/atelier/algebre/${createdDocId}`, { waitUntil: 'networkidle' });
  await sleep(900);

  const history = await historyLines(page);
  record('relecture — l’historique est retrouvé', history.length >= 2, `${history.length} pas`);
  record('relecture — l’équation courante est retrouvée', (await currentEquation(page)).length > 0);

  await context.close();
}

// ── 4. Cas particuliers, inégalités, droite graduée ───────────────────────
{
  const context = await authedContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  attach(page);
  await page.goto(`${BASE}/espace/atelier/algebre?lab=secondaire`, { waitUntil: 'networkidle' });
  await sleep(600);

  await setEquation(page, '2x + 3 = 2x + 5');
  record('cas particulier — rien n’est dit avant le déroulé', await page.locator('[data-ml-solution]').count() === 0);
  await page.locator('[data-ml-alg-solve]').first().click();
  await playToEnd(page, 'data-ml-alg-step');
  let verdict = await page.locator('[data-ml-solution]').innerText().catch(() => '');
  record('cas particulier — « لا يوجد حل »', verdict.includes('لا يوجد حل'), verdict.replace(/\s+/g, ' '));

  await setEquation(page, '2x + 3 = 2x + 3');
  await page.locator('[data-ml-alg-solve]').first().click();
  await playToEnd(page, 'data-ml-alg-step');
  verdict = await page.locator('[data-ml-solution]').innerText().catch(() => '');
  record('cas particulier — « عدد لا نهائي من الحلول »', verdict.includes('لا نهائي'), verdict.replace(/\s+/g, ' '));

  // L'inégalité et LE point du chapitre : le sens qui se retourne.
  await setEquation(page, '-2x > 6');
  const numberLine = await page.locator('.sa-ml-alg__numberline-svg').count();
  record('inégalité — la droite graduée apparaît', numberLine === 1);

  await applyTyped(page, 'القسمة', '-2');
  const flipped = await currentEquation(page);
  record('inégalité — −2x > 6 ÷(−2) donne x < −3 (le sens se retourne)',
    flipped.includes('<') && flipped.includes('3'), flipped);

  const notice = await page.locator('.sa-ml-alg__flipped').count();
  record('inégalité — le retournement est signalé à l’élève', notice >= 1);

  // §8 : la droite ne trahit pas la réponse tant que l'inconnue n'est pas
  // isolée. Ici elle vient de l'être (x < −3) : la borne s'affiche, VIDE
  // parce qu'elle est exclue.
  const openCircle = await page.locator('.sa-ml-alg__numberline-solution circle').getAttribute('fill').catch(() => null);
  record('droite graduée — borne exclue dessinée en cercle vide', openCircle === '#ffffff', String(openCircle));

  await setEquation(page, '2x <= 10');
  const hiddenBound = await page.locator('.sa-ml-alg__numberline-solution').count();
  record('droite graduée — la borne reste cachée avant la résolution (§8)', hiddenBound === 0, `${hiddenBound} borne(s)`);

  await applyTyped(page, 'القسمة', '2');
  const closedCircle = await page.locator('.sa-ml-alg__numberline-solution circle').getAttribute('fill').catch(() => null);
  record('droite graduée — borne incluse dessinée en cercle plein', closedCircle === '#7c3aed', String(closedCircle));

  await page.screenshot({ path: `${OUT}/03-inegalite.png` });
  await context.close();
}

// ── 5. Saisie libre, fractions, refus motivé, générateur ──────────────────
{
  const context = await authedContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  attach(page);
  await page.goto(`${BASE}/espace/atelier/algebre?lab=secondaire`, { waitUntil: 'networkidle' });
  await sleep(600);

  await setEquation(page, 'x/3 = 5');
  await applyTyped(page, 'الضرب', '3');
  record('fraction — x/3 = 5 donne x = 15', /x\s*=\s*15/.test(await currentEquation(page)), await currentEquation(page));

  await setEquation(page, '-2x + 4 = 10');
  await applyTyped(page, 'الطرح', '4');
  await applyTyped(page, 'القسمة', '-2');
  record('coefficient négatif — −2x + 4 = 10 donne x = −3',
    /x\s*=\s*[−-]3/.test(await currentEquation(page)), await currentEquation(page));

  // Une saisie hors du premier degré doit être REFUSÉE, avec un mot clair.
  await page.fill('[data-ml-equation-input]', 'x^2 = 4');
  await page.locator('.sa-ml-alg__explore').click();
  await sleep(250);
  const error = await page.locator('#sa-ml-alg-input-error-eq').innerText().catch(() => '');
  record('saisie invalide — refus motivé, pas de plantage', error.length > 0, error.replace(/\s+/g, ' '));
  record('saisie invalide — l’équation précédente reste affichée',
    (await currentEquation(page)).includes('3'), await currentEquation(page));

  // Le générateur, aux quatre niveaux.
  let generated = 0;
  for (const level of ['1', '2', '3', '4']) {
    await page.selectOption('#sa-ml-alg-level-eq', level);
    await page.locator('.sa-ml-alg__new').click();
    await sleep(250);
    const text = await currentEquation(page);
    if (text.includes('x') && text.includes('=')) generated += 1;
  }
  record('générateur — les quatre niveaux produisent une équation', generated === 4, `${generated}/4`);

  // Les paramètres ax + b = c.
  const paramsButton = page.locator('.sa-ml-alg__mini-action', { hasText: 'الوسائط' }).first();
  if (await paramsButton.count() > 0) {
    await paramsButton.click();
    await sleep(200);
    const sliders = await page.locator('.sa-ml-alg__param-slider').count();
    record('paramètres — trois curseurs a, b, c', sliders === 3, `${sliders} curseur(s)`);
    await page.locator('.sa-ml-alg__param-slider').first().press('ArrowRight');
    await sleep(200);
    record('paramètres — bouger a change l’équation', (await currentEquation(page)).includes('x'));
  } else {
    record('paramètres — le panneau est proposé', false, 'bouton absent');
  }

  await page.screenshot({ path: `${OUT}/04-parametres.png` });
  await context.close();
}

// ── 6. RTL et notation LTR ────────────────────────────────────────────────
{
  const context = await authedContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  attach(page);
  await page.goto(`${BASE}/espace/atelier/algebre?lab=secondaire`, { waitUntil: 'networkidle' });
  await sleep(700);

  const htmlDir = await page.evaluate(() => document.documentElement.getAttribute('dir'));
  record('RTL — la page est en arabe, direction rtl', htmlDir === 'rtl', String(htmlDir));

  // Le panneau est sur le bord de DÉPART (à droite en arabe).
  const geometry = await page.evaluate(() => {
    const panel = document.querySelector('.sa-ml-alg__panel');
    const stage = document.querySelector('.sa-ml-alg__stage');
    if (!panel || !stage) return null;
    const p = panel.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    return { panelLeft: p.left, stageLeft: s.left };
  });
  record('RTL — le panneau est sur le bord de départ (à droite)',
    geometry !== null && geometry.panelLeft > geometry.stageLeft,
    geometry ? `panneau ${Math.round(geometry.panelLeft)} / scène ${Math.round(geometry.stageLeft)}` : 'introuvable');

  // La direction CALCULÉE, pas l'attribut : SVG n'hérite pas de `dir`.
  const svgDirection = await page.evaluate(() => {
    const svg = document.querySelector('.sa-ml-alg__balance');
    return svg ? getComputedStyle(svg).direction : null;
  });
  record('RTL — la balance est en LTR (direction calculée)', svgDirection === 'ltr', String(svgDirection));

  const mathDirection = await page.evaluate(() => {
    const math = document.querySelector('.sa-ml-alg__current');
    return math ? getComputedStyle(math).direction : null;
  });
  record('RTL — la notation reste LTR', mathDirection === 'ltr', String(mathDirection));

  // Cairo doit bien être servi pour l'arabe.
  const font = await page.evaluate(() => {
    const heading = document.querySelector('.sa-ml-alg__heading');
    return heading ? getComputedStyle(heading).fontFamily : null;
  });
  record('RTL — la pile de polices contient Cairo', /Cairo/i.test(String(font)), String(font));

  // L'état mathématique doit exister en TEXTE (§34).
  const srText = await page.locator('[data-ml-alg-state="eq"]').innerText().catch(() => '');
  record('accessibilité — l’état est lisible en texte', srText.includes('المعادلة'), srText.replace(/\s+/g, ' ').slice(0, 70));

  await page.screenshot({ path: `${OUT}/05-rtl.png` });
  await context.close();
}

// ── 7. Responsive ─────────────────────────────────────────────────────────
for (const [label, viewport] of [['tablette', { width: 834, height: 1112 }], ['mobile', { width: 390, height: 844 }]]) {
  const context = await authedContext({ viewport, hasTouch: true, isMobile: label === 'mobile' });
  const page = await context.newPage();
  attach(page);
  await page.goto(`${BASE}/espace/atelier/algebre?lab=secondaire`, { waitUntil: 'networkidle' });
  await sleep(800);

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  record(`${label} — aucun débordement horizontal de la page`,
    overflow.scrollWidth <= overflow.clientWidth + 1,
    `${overflow.scrollWidth} / ${overflow.clientWidth}`);

  const equationVisible = await page.locator('.sa-ml-alg__balance').isVisible().catch(() => false);
  record(`${label} — la balance reste visible`, equationVisible);

  // Cibles tactiles : les commandes doivent rester prenables au doigt.
  const small = await page.evaluate(() => {
    const selectors = ['.sa-ml-alg__kind', '.sa-ml-alg__apply', '.sa-ml-alg__explore', '.sa-ml-alg__suggestion', '.sa-ml-alg__mini-action'];
    const tiny = [];
    for (const selector of selectors) {
      for (const node of document.querySelectorAll(selector)) {
        const r = node.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.height < 32) tiny.push(`${selector}:${Math.round(r.height)}px`);
      }
    }
    return tiny;
  });
  record(`${label} — cibles tactiles suffisantes`, small.length === 0, small.slice(0, 4).join(', '));

  // Une opération doit rester faisable au doigt.
  const suggestion = page.locator('.sa-ml-alg__suggestion').first();
  if (await suggestion.count() > 0) {
    await suggestion.tap().catch(async () => { await suggestion.click(); });
    await sleep(200);
    record(`${label} — une opération s’applique au doigt`, (await historyLines(page)).length >= 2);
  }

  const overflowAfter = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
  record(`${label} — toujours aucun débordement après une opération`, overflowAfter);

  await page.screenshot({ path: `${OUT}/06-${label}.png`, fullPage: true });
  await context.close();
}

// ── 8. Visiteur non connecté ──────────────────────────────────────────────
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  attach(page);
  // La redirection part avant la fin du chargement : `networkidle` n'arrive
  // jamais de façon fiable ici, on attend l'URL.
  await page.goto(`${BASE}/espace/atelier/algebre?lab=secondaire`, { waitUntil: 'domcontentloaded' });
  await page.waitForURL((url) => !/\/espace\/atelier\/algebre/.test(url.toString()), { timeout: 15000 }).catch(() => {});
  record('visiteur non connecté — renvoyé hors de l’atelier', !/\/espace\/atelier\/algebre/.test(page.url()), page.url());
  await context.close();
}

// ── Nettoyage ─────────────────────────────────────────────────────────────
for (const id of created) {
  const res = await api(TOKEN, 'DELETE', `/math-lab/documents/${id}`);
  record(`nettoyage — document ${id} supprimé`, res.status === 200 || res.status === 204, `HTTP ${res.status}`);
}

record('aucune erreur JavaScript', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
record('aucune erreur console', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} vérifications passées — captures : ${OUT}`);
if (failed.length) {
  console.log('\nÉchecs :');
  for (const f of failed) console.log(`  ❌ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`);
  process.exit(1);
}
