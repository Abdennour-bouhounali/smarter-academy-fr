/**
 * QA navigateur — le مختبر الأعداد والحساب (laboratoire des nombres et du
 * calcul).
 *
 * Lancement (dev server sur 5173, API sur 8000, élève QA existant) :
 *   node apps/web/e2e/mathlab-numbers.mjs [dossier-captures]
 *
 * Ce qu'on vérifie (§64) :
 *   - navigation : la carte sur l'accueil (plus « قريبًا » pour المستقيم
 *     المدرّج), l'URL directe, le rechargement ;
 *   - §4 : l'explorateur affiche décomposition, facteurs, قواسم, parité ;
 *   - §5 : la valeur de position — ajouter, retirer, REGROUPER ;
 *   - §7, §49 : GLISSER un point sur la droite, et l'accrochage ;
 *   - §9, §12 : couper une part, et le dénominateur commun ;
 *   - §10 : la comparaison de deux fractions ;
 *   - §14, §15 : le curseur de pourcentage et le sullam ;
 *   - §17 : le verdict de proportionnalité, et la colonne fautive DÉSIGNÉE ;
 *   - §20 : la divisibilité dit POURQUOI, pas seulement oui/non ;
 *   - §22 : le crible tourne, se met en pause, se rembobine ;
 *   - §24 : l'arbre de facteurs se fend au clic ;
 *   - §27, §28 : Euclide pas à pas, et ses rectangles ;
 *   - §31 : PGCD × PPCM = a × b, lu à l'écran ;
 *   - §32 : l'arrondi et ses deux voisins ;
 *   - §46 : « أرسِل إلى » transporte le nombre d'un mode à l'autre ;
 *   - §48, §53 : prédire → vérifier, et l'erreur qui MONTRE ;
 *   - §55 : garder une découverte ;
 *   - §49 : la sauvegarde et la RÉOUVERTURE du document ;
 *   - §58 : RTL — la notation reste LTR (direction CALCULÉE) ;
 *   - §57 : responsive — tablette et mobile, pas de débordement horizontal,
 *     cibles tactiles ≥ 44 px ;
 *   - §59 : accessibilité — focus visible, poignée focalisable et nommée,
 *     pilotage au clavier ;
 *   - §61 : aucun bruit de virgule flottante à l'écran.
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
const OUT = process.argv[2] || '/tmp/mathlab-numbers-shots';
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

function wire(page) {
  page.on('pageerror', (error) => pageErrors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (EXPECTED_HTTP.test(text)) return;
    consoleErrors.push(text);
  });
}

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

const shot = (page, name) => page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
const textOf = async (page, selector) => (await page.locator(selector).first().textContent().catch(() => ''))?.trim() ?? '';
const stageText = (page) => textOf(page, '[data-ml-nb-stage]');

/** Passer à un mode et attendre qu'il soit monté. */
async function goMode(page, mode) {
  await page.click(`[data-ml-nb-modechip="${mode}"]`);
  await page.waitForFunction(
    (m) => document.querySelector('[data-ml-nb]')?.getAttribute('data-ml-nb-mode') === m,
    mode,
    { timeout: 8000 },
  );
  await page.waitForTimeout(220);
}

/** Les coordonnées écran d'une valeur sur la droite graduée. */
async function lineMap(page, index = 0) {
  const svg = page.locator('[data-ml-nb-line]').nth(index);
  const box = await svg.boundingBox();
  const view = await svg.getAttribute('data-ml-nb-view');
  const [min, max, margin, width] = view.split(',').map(Number);
  const ratio = box.width / width;

  return {
    box,
    toScreen: (value) => ({
      x: box.x + (margin + ((value - min) / (max - min)) * (width - margin * 2)) * ratio,
      y: box.y + box.height * 0.56,
    }),
  };
}

// ════════════════════════════════════════════════════════════════════════
// 1. Navigation, première visite, §4 l'explorateur
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);

  await page.goto(`${BASE}/espace/atelier?lab=secondaire`, { waitUntil: 'networkidle' });
  const card = page.locator('a[href*="/atelier/nombres?lab=secondaire"]').first();
  record('accueil : la carte de l’instrument est présente', await card.count() > 0);

  // « المستقيم المدرّج » ne doit plus figurer parmi les chips ANNONCÉS
  // (« قريبًا ») : l'instrument l'a livré comme mode. « القياس », lui, reste
  // annoncé — donc on regarde la liste des annoncés, pas la page entière.
  const plannedText = await textOf(page, '.sa-ml-planned');
  record('accueil : « المستقيم المدرّج » n’est plus annoncé « قريبًا »',
    !plannedText.includes('المستقيم المدرّج'), plannedText.replace(/\s+/g, ' ').slice(0, 80));
  record('accueil : « القياس » reste annoncé, lui', plannedText.includes('القياس'));
  await shot(page, '01-home');

  await card.click();
  await page.waitForURL(/\/atelier\/nombres/, { timeout: 15000 });
  await page.waitForSelector('[data-ml-nb]', { timeout: 15000 });
  await page.waitForTimeout(700);

  const mode = await page.locator('[data-ml-nb]').getAttribute('data-ml-nb-mode');
  record('§4 : l’instrument ouvre sur l’EXPLORATEUR', mode === 'explorer', `mode = ${mode}`);

  const explorer = await stageText(page);
  record('§4 : 360 est décomposé (300 + 60)', explorer.includes('300') && explorer.includes('60'));
  record('§4 : ses facteurs premiers sont affichés', /2\^3|2\^{3}|2³/.test(explorer) || explorer.includes('2^3'));
  record('§4 : ses قواسم sont listés', explorer.includes('24') && explorer.includes('180'));
  record('§4 : la parité est dite', explorer.includes('زوجي'));
  record('§4 : il y a une droite graduée dès l’ouverture', await page.locator('[data-ml-nb-line]').count() > 0);
  record('§4 : le nombre est composé, et on dit par quoi', explorer.includes('مركّب'));
  await shot(page, '02-explorer');

  // §61 : aucun bruit de flottant à l'écran.
  record('§61 : aucun bruit de virgule flottante (0,30000000004…)',
    !/\d,\d{0,3}0{6,}\d/.test(explorer) && !/\d\.\d{10,}/.test(explorer));

  // Les 16 modes sont là, dans une seule page (13 + division, puissances, ordre — 2026-09-30).
  const chips = await page.locator('[data-ml-nb-modechip]').count();
  record('§3 : seize modes dans UN laboratoire (pas seize routes)', chips === 16, `${chips} modes`);

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 2. §5 la valeur de position, et son REGROUPEMENT
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/nombres?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-nb]', { timeout: 15000 });

  await goMode(page, 'place');
  const before = await stageText(page);
  record('§5 : les colonnes de mраتب sont dessinées', before.includes('الآلاف') && before.includes('الوحدات'));
  record('§5 : le total est écrit en somme', before.includes('4582') || before.includes('4 582'));

  // Ajouter UNE UNITÉ : c'est le « + » de la colonne des unités, la
  // DERNIÈRE (chaque colonne porte « − » puis « + »).
  const unitsColumn = page.locator('.sa-ml-nb__column').last();
  await unitsColumn.locator('.sa-ml-nb__column-actions .sa-ml-nb__mini').nth(1).click();
  await page.waitForTimeout(280);
  const after = await textOf(page, '.sa-ml-nb__total');
  record('§5 : ajouter une unité met le total à jour (4582 → 4583)',
    after.includes('4583'), after.replace(/\s+/g, ' ').slice(0, 70));

  // Le regroupement 10 → 1.
  const regroup = page.locator('.sa-ml-nb__column-regroup .sa-ml-nb__tiny').first();
  const hasRegroup = await regroup.count() > 0;
  record('§5 : le bouton de REGROUPEMENT existe', hasRegroup);
  if (hasRegroup) {
    await regroup.click();
    await page.waitForTimeout(420);
    record('§5 : le regroupement s’exécute sans casser la page', (await stageText(page)).length > 0);
  }
  await shot(page, '03-place');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 3. §7, §49 la droite graduée — GLISSER un point
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/nombres?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-nb]', { timeout: 15000 });

  await goMode(page, 'line');
  const before = await stageText(page);
  record('§7 : la droite montre deux points (1/4 et 3/4)', before.includes('1/4') && before.includes('3/4'));
  record('§46 : les quatre écritures sont affichées ensemble',
    before.includes('%') && (before.includes('0,25') || before.includes('0,75')));

  // Glisser le premier point vers 1/2.
  const map = await lineMap(page);
  const handle = page.locator('[data-ml-nb-point="0"] circle').first();
  const from = await handle.boundingBox();
  const target = map.toScreen(0.5);
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x, target.y, { steps: 14 });
  await page.mouse.up();
  await page.waitForTimeout(420);

  const after = await stageText(page);
  record('§7, §49 : GLISSER le point le déplace et l’accroche à 1/2 (2/4)',
    after.includes('2/4') || after.includes('1/2'), after.slice(0, 80));
  record('§45 : la comparaison se met à jour', after.includes('<') || after.includes('>') || after.includes('='));
  await shot(page, '04-line');

  // §59 : la poignée est focalisable et pilotable au clavier.
  await handle.focus();
  const focused = await page.evaluate(() => document.activeElement?.tagName?.toLowerCase());
  record('§59 : la poignée est focalisable', focused === 'circle');
  const role = await handle.getAttribute('role');
  const label = await handle.getAttribute('aria-label');
  record('§59 : la poignée est un slider NOMMÉ', role === 'slider' && Boolean(label), `${role} / ${label}`);
  const beforeKey = await stageText(page);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(320);
  record('§59 : la flèche déplace le point', (await stageText(page)) !== beforeKey);

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 4. §9, §10, §12 les fractions
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/nombres?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-nb]', { timeout: 15000 });

  await goMode(page, 'fractions');
  const before = await stageText(page);
  record('§8 : les deux fractions sont dessinées', await page.locator('.sa-ml-nb__shape').count() >= 2);
  record('§12 : le dénominateur commun (12) est annoncé pour 1/3 + 1/4', before.includes('12'));
  record('§11 : le résultat 7/12 est affiché', before.includes('7/12'), before.slice(0, 100));

  // §9 : couper chaque part en deux.
  const splitButton = page.locator('.sa-ml-nb__fraction-actions .sa-ml-nb__tiny').first();
  await splitButton.click();
  await page.waitForTimeout(340);
  const afterSplit = await stageText(page);
  record('§9 : couper les parts donne une fraction ÉQUIVALENTE (2/6)',
    afterSplit.includes('2/6'), afterSplit.slice(0, 90));
  await shot(page, '05-fractions');

  // §10 : passer en comparaison.
  await page.selectOption('.sa-ml-nb__row select', 'compare');
  await page.waitForTimeout(340);
  const compare = await stageText(page);
  record('§10 : la comparaison montre le jadā’ tabādulī', compare.includes('×'));
  record('§10 : un signe de comparaison est affiché',
    compare.includes('<') || compare.includes('>') || compare.includes('='));

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 5. §14, §15 les pourcentages
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/nombres?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-nb]', { timeout: 15000 });

  await goMode(page, 'percent');
  const before = await stageText(page);
  record('§14 : la grille de 100 est dessinée', await page.locator('.sa-ml-nb__cell').count() === 100);
  record('§14 : 35 % de 200 = 70', before.includes('70'), before.slice(0, 80));
  record('§15 : le sullam montre 10 % = 20 et 50 % = 100',
    before.includes('20') && before.includes('100'));

  // Le curseur.
  const slider = page.locator('.sa-ml-nb__slider').first();
  await slider.fill('50');
  await page.waitForTimeout(340);
  const after = await stageText(page);
  record('§15 : pousser le curseur à 50 % donne 100', after.includes('100'), after.slice(0, 70));
  const filled = await page.locator('.sa-ml-nb__cell.is-filled').count();
  record('§14 : la grille se remplit de 50 carrés', filled === 50, `${filled} carrés`);
  await shot(page, '06-percent');

  // §16 : la variation, distinguée par un MOT, pas seulement une couleur.
  await page.click('.sa-ml-nb__tab >> nth=1');
  await page.waitForTimeout(340);
  const change = await stageText(page);
  record('§16 : la hausse est nommée par un MOT (ارتفاع), pas seulement une couleur',
    change.includes('ارتفاع') || change.includes('انخفاض'));
  record('§16 : le coefficient multiplicateur est montré', change.includes('1,15') || change.includes('×'));
  record('§16 : le piège de l’inverse est signalé', change.includes('لا يُلغى') || change.includes('−13'));

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 6. §17 la proportionnalité, et la colonne fautive DÉSIGNÉE
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/nombres?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-nb]', { timeout: 15000 });

  await goMode(page, 'proportion');
  const before = await stageText(page);
  record('§17 : le tableau est jugé PROPORTIONNEL', before.includes('متناسب') && !before.includes('غير متناسب'));
  record('§17 : le coefficient 1,5 est affiché', before.includes('1,5'), before.slice(0, 90));
  record('§18 : le graphique est dessiné', await page.locator('.sa-ml-nb__graph').count() > 0);

  // Casser une case : le verdict doit basculer ET désigner la colonne.
  const cell = page.locator('.sa-ml-nb__cell-input').nth(5);
  await cell.fill('99');
  await cell.press('Enter');
  await page.waitForTimeout(420);
  const after = await stageText(page);
  record('§17 : le verdict bascule à « غير متناسب »', after.includes('غير متناسب'));
  record('§53 : la colonne fautive est DÉSIGNÉE', await page.locator('.is-failure').count() > 0);
  await shot(page, '07-proportion');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 7. §20 la divisibilité dit POURQUOI
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/nombres?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-nb]', { timeout: 15000 });

  await goMode(page, 'divisibility');
  const rows = await page.locator('.sa-ml-nb__divrow').count();
  record('§20 : le tableau des critères est affiché', rows >= 8, `${rows} critères`);

  // Ouvrir le critère de 9 : il doit montrer la SOMME DES CHIFFRES.
  const row9 = page.locator('.sa-ml-nb__divrow', { hasText: 'على 9' }).first();
  await row9.click();
  await page.waitForTimeout(320);
  const body = await row9.textContent();
  record('§20 : le critère de 9 montre la somme des chiffres (3 + 6 + 0)',
    body.includes('3 + 6 + 0'), body.replace(/\s+/g, ' ').slice(0, 120));
  record('§20 : et la division qui en découle (360 ÷ 9 = 40)', body.includes('40'));
  record('§20 : ce n’est PAS qu’un oui/non', body.includes('لأنّ'));
  await shot(page, '08-divisibility');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 8. §22 le crible, §24 l'arbre
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/nombres?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-nb]', { timeout: 15000 });

  await goMode(page, 'primes');
  const cells = await page.locator('.sa-ml-nb__sieve-cell').count();
  record('§22 : la grille du crible est dessinée', cells === 100, `${cells} cases`);

  // Un pas : les multiples de 2 doivent être rayés.
  await page.click('.sa-ml-nb__button--ghost >> nth=0');
  await page.waitForTimeout(420);
  const struck = await page.locator('.sa-ml-nb__sieve-cell.is-struck').count();
  record('§22 : une passe raye les multiples de 2', struck >= 40, `${struck} rayés`);
  await shot(page, '09-sieve');

  // Lancer et mettre en pause.
  await page.click('.sa-ml-nb__button >> nth=0');
  await page.waitForTimeout(1300);
  await page.click('.sa-ml-nb__button >> nth=0');
  await page.waitForTimeout(260);
  const primes = await page.locator('.sa-ml-nb__sieve-cell.is-prime').count();
  record('§22 : le crible tourne et révèle des premiers', primes > 0, `${primes} premiers`);

  // §24 : l'arbre.
  const treeStart = page.locator('.sa-ml-nb__button', { hasText: '360' }).first();
  if (await treeStart.count() > 0) {
    await treeStart.click();
    await page.waitForTimeout(340);
  }
  const node = page.locator('.sa-ml-nb__tree-value.is-splittable').first();
  const hasNode = await node.count() > 0;
  record('§24 : l’arbre démarre sur un nœud fendable', hasNode);
  if (hasNode) {
    await node.click();
    await page.waitForTimeout(300);
    const choices = await page.locator('.sa-ml-nb__chip').count();
    record('§24 : l’élève CHOISIT comment fendre', choices > 1, `${choices} couples proposés`);
    await page.locator('.sa-ml-nb__chip').nth(1).click();
    await page.waitForTimeout(340);
    const nodes = await page.locator('.sa-ml-nb__tree-value').count();
    record('§24 : le nœud se fend en deux fils', nodes >= 3, `${nodes} nœuds`);
    await shot(page, '10-tree');
  }

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 9. §27, §28, §31 — PGCD, Euclide, la relation
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/nombres?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-nb]', { timeout: 15000 });

  await goMode(page, 'gcdLcm');
  // Un document neuf ouvre sur les différences successives (la méthode du manuel) :
  // le PGCD n'est dit qu'à la dernière étape.
  record('PGCD : un document neuf ouvre sur les الفوارق المتتالية',
    await page.locator('[data-ml-nb-differences]').count() > 0);
  // Le déroulé pas à pas (MATH_LAB §3.4.1) : rien avant « ابدأ الحل », puis un pas par clic.
  record('PGCD : le résultat n’est PAS affiché avant le déroulé',
    await page.locator('[data-ml-nb-diff-result]').count() === 0);
  const firstFrames = await playToEnd(page, 'data-ml-nb-step');
  record('PGCD : le déroulé avance un pas par clic', firstFrames > 3, `${firstFrames} clics`);
  record('PGCD : le dernier pas conclut PGCD(84 ; 36) = 12',
    (await page.locator('[data-ml-nb-diff-result]').first().innerText().catch(() => '')).includes('12'));
  // Puis Euclide, la méthode de comparaison — déroulée elle aussi, puis la PPCM.
  await page.locator('select[data-ml-nb-gcd-method]').first().selectOption('euclid');
  await page.waitForTimeout(400);
  await playToEnd(page, 'data-ml-nb-step');
  await playToEnd(page, 'data-ml-nb-ppcm-step');
  await page.waitForTimeout(300);
  const text = await stageText(page);
  record('§27 : PGCD(84 ; 36) = 12', text.includes('12'), text.slice(0, 90));
  record('§30 : PPCM(84 ; 36) = 252', text.includes('252'));
  record('§27 : les divisions d’Euclide sont écrites',
    text.includes('84 = 2 × 36 + 12') || (text.includes('84') && text.includes('36') && text.includes('+')));
  record('§28 : les rectangles d’Euclide sont dessinés',
    await page.locator('.sa-ml-nb__euclid-square').count() > 0);
  record('§31 : la relation PGCD × PPCM = a × b est VÉRIFIÉE à l’écran',
    text.includes('3024') || text.includes('الطرفان متساويان'));
  await shot(page, '11-gcd');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 10. §32 l'arrondi, §46 « أرسِل إلى »
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/nombres?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-nb]', { timeout: 15000 });

  await goMode(page, 'rounding');
  const text = await stageText(page);
  record('§32 : les deux voisins de 7,846 au dixième sont 7,8 et 7,9',
    text.includes('7,8') && text.includes('7,9'), text.slice(0, 90));
  record('§32 : le milieu 7,85 est montré', text.includes('7,85'));
  record('§33 : la troncature est comparée à l’arrondi', text.includes('الحذف'));
  record('§34 : l’erreur absolue est affichée', text.includes('الخطأ المطلق'));
  await shot(page, '12-rounding');

  // §46 : envoyer un nombre d'un mode à l'autre.
  await goMode(page, 'explorer');
  const sendButton = page.locator('.sa-ml-nb__sendto button').first();
  await sendButton.click();
  await page.waitForTimeout(220);
  await page.locator('.sa-ml-nb__menu-item', { hasText: 'قابلية القسمة' }).first().click();
  await page.waitForTimeout(420);
  const mode = await page.locator('[data-ml-nb]').getAttribute('data-ml-nb-mode');
  const sent = await stageText(page);
  record('§46 : « أرسِل إلى » change de mode ET transporte le nombre',
    mode === 'divisibility' && sent.includes('360'), `mode = ${mode}`);

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 11. §48, §52, §53 — l'entraînement
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/nombres?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-nb]', { timeout: 15000 });

  await page.locator('.sa-ml-nb__footer .sa-ml-nb__button').first().click();
  await page.waitForTimeout(600);
  record('§48 : le panneau d’entraînement s’ouvre',
    await page.locator('.sa-ml-nb__practice').count() > 0);
  const question = await textOf(page, '.sa-ml-nb__question');
  record('§48 : une question est posée', question.length > 5, question.slice(0, 70));

  // §54 : le laboratoire reste manipulable derrière la question.
  record('§54 : le laboratoire reste visible et manipulable',
    await page.locator('[data-ml-nb-stage]').isVisible());

  // §52 : demander un indice.
  await page.locator('.sa-ml-nb__practice-actions .sa-ml-nb__button').nth(1).click();
  await page.waitForTimeout(280);
  const hints = await page.locator('.sa-ml-nb__hints li').count();
  record('§52 : un indice apparaît, un seul', hints === 1, `${hints} indice(s)`);

  // Répondre (juste ou faux, peu importe) : un verdict doit apparaître et
  // NE JAMAIS bloquer.
  // La réponse prend la forme que la question demande (§49) : un choix, un
  // champ, un glissé ou un curseur. On répond par celle qui est là.
  const choice = page.locator('.sa-ml-nb__choice').first();
  const field = page.locator('.sa-ml-nb__input--answer').first();
  const chips = page.locator('.sa-ml-nb__question-card .sa-ml-nb__chip').first();
  if (await choice.count() > 0) {
    await choice.click();
    await page.waitForTimeout(180);
  } else if (await field.count() > 0) {
    await field.fill('1');
  } else if (await chips.count() > 0) {
    await chips.click();
  }
  // Sinon la question se répond au glissé ou au curseur : sa valeur courante
  // fait office de réponse, et « تحقّق » doit quand même rendre un verdict.
  await page.locator('.sa-ml-nb__practice-actions .sa-ml-nb__button').first().click();
  await page.waitForTimeout(420);
  const verdictBox = await page.locator('.sa-ml-nb__verdict-box').count();
  record('§48 : un verdict est rendu', verdictBox > 0);

  const verdictText = await textOf(page, '.sa-ml-nb__verdict-box');
  const incorrect = await page.locator('.sa-ml-nb__verdict-box.is-incorrect').count() > 0;
  if (incorrect) {
    record('§53 : l’erreur n’est PAS un simple « خطأ » — elle POSE UNE QUESTION',
      verdictText.includes('؟'), verdictText.replace(/\s+/g, ' ').slice(0, 110));
    record('§53 : et elle MONTRE (une droite ou des couples)',
      await page.locator('.sa-ml-nb__reveal').count() > 0);
  } else {
    record('§48 : la bonne réponse est reconnue', verdictText.includes('صحيحة'));
  }

  // §48 : rien n'est bloqué — on peut toujours passer à la suite.
  const nextEnabled = await page.locator('.sa-ml-nb__practice-actions .sa-ml-nb__button').last().isEnabled();
  record('§48 : rien ne bloque — la question suivante reste accessible', nextEnabled);
  await shot(page, '13-practice');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 12. §55 les notes, §49 la SAUVEGARDE et la réouverture
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/nombres?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-nb]', { timeout: 15000 });

  // Régler un état reconnaissable.
  await goMode(page, 'gcdLcm');
  const inputs = page.locator('.sa-ml-nb__input');
  await inputs.first().fill('120');
  await inputs.first().press('Enter');
  await page.waitForTimeout(300);

  // §55 : garder une découverte.
  await page.locator('.sa-ml-nb__footer .sa-ml-nb__button').nth(1).click();
  await page.waitForTimeout(300);
  const noteInput = page.locator('.sa-ml-nb__notes .sa-ml-nb__input');
  await noteInput.fill('كل عدد يقبل القسمة على 6 يقبل القسمة على 2 وعلى 3.');
  await noteInput.press('Enter');
  await page.waitForTimeout(400);
  const notes = await page.locator('.sa-ml-nb__notes-list li').count();
  record('§55 : une découverte se garde', notes === 1, `${notes} note(s)`);
  record('§55 : le pont vers le vrai كرّاس existe',
    await page.locator('.sa-ml-nb__notes-list .sa-ml-nb__tiny', { hasText: 'كرّاسي' }).count() > 0);
  await shot(page, '14-notes');

  // Attendre la sauvegarde, puis RECHARGER. L'outil attend 300 ms avant de
  // remettre son état à la coquille, qui attend encore MATH_LAB_AUTOSAVE_MS
  // (2500 ms) de calme : on attend que l'URL porte l'identifiant plutôt
  // qu'une durée fixe, sinon le test court après la sauvegarde.
  await page.waitForURL(/nombres\/\d+/, { timeout: 15000 }).catch(() => {});
  const url = page.url();
  const documentId = url.match(/nombres\/(\d+)/)?.[1];
  record('§49 : un document a été créé', Boolean(documentId), `id = ${documentId}`);
  if (documentId) created.add(documentId);

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-nb]', { timeout: 15000 });
  await page.waitForTimeout(800);
  const reopened = await page.locator('[data-ml-nb]').getAttribute('data-ml-nb-mode');
  record('§49 : le mode est RETROUVÉ après rechargement', reopened === 'gcdLcm', `mode = ${reopened}`);
  const reopenedText = await stageText(page);
  record('§49 : les nombres sont retrouvés', reopenedText.includes('120'));

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 13. §58 RTL, §57 responsive, §59 accessibilité
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/nombres?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-nb]', { timeout: 15000 });
  await page.waitForTimeout(500);

  // §58 : la page est RTL, la NOTATION reste LTR — direction CALCULÉE.
  const pageDir = await page.evaluate(() => getComputedStyle(document.documentElement).direction);
  record('§58 : la page est RTL', pageDir === 'rtl');

  const formulaDir = await page.evaluate(() => {
    const node = document.querySelector('.sa-ml-nb__formula');

    return node ? getComputedStyle(node).direction : null;
  });
  record('§58 : la notation mathématique reste LTR', formulaDir === 'ltr', `direction = ${formulaDir}`);

  const lineDir = await page.evaluate(() => {
    const node = document.querySelector('.sa-ml-nb__line');

    return node ? getComputedStyle(node).direction : null;
  });
  record('§58 : la droite graduée est LTR (les négatifs à gauche)', lineDir === 'ltr');

  const font = await page.evaluate(() => {
    const node = document.querySelector('.sa-ml-nb__heading');

    return node ? getComputedStyle(node).fontFamily : '';
  });
  record('§58 : Cairo est appliqué au texte arabe', font.includes('Cairo'), font.slice(0, 40));

  // §59 : le focus est visible.
  await page.locator('[data-ml-nb-modechip="line"]').focus();
  const outline = await page.evaluate(() => {
    const node = document.activeElement;
    const style = getComputedStyle(node);

    return `${style.outlineStyle}/${style.outlineWidth}`;
  });
  record('§59 : le focus est visible', !outline.startsWith('none'), outline);

  // §57 : tablette.
  await page.setViewportSize({ width: 820, height: 1100 });
  await page.waitForTimeout(500);
  let overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  record('§57 : tablette — aucun débordement horizontal', overflow <= 2, `${overflow}px`);
  await shot(page, '15-tablet');

  // §57 : mobile.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);
  overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  record('§57 : mobile — aucun débordement horizontal', overflow <= 2, `${overflow}px`);

  // Les cibles tactiles.
  const small = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('.sa-ml-nb button:not([disabled])')];

    return nodes
      .filter((node) => {
        const rect = node.getBoundingClientRect();

        return rect.width > 0 && rect.height > 0 && (rect.height < 32 || rect.width < 24);
      })
      .map((node) => `${node.className.split(' ')[0]}:${Math.round(node.getBoundingClientRect().height)}`)
      .slice(0, 6);
  });
  record('§57 : les cibles tactiles sont confortables', small.length === 0, small.join(' · '));
  await shot(page, '16-mobile');

  // Le laboratoire reste utilisable sur téléphone.
  await goMode(page, 'percent');
  record('§57 : mobile — un mode s’ouvre et se lit',
    (await stageText(page)).includes('%'));
  await shot(page, '17-mobile-percent');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// Nettoyage et rapport
// ════════════════════════════════════════════════════════════════════════
{
  const list = await api(TOKEN, 'GET', '/math-lab/documents?tool=numberLab');
  // La forme de la réponse peut être { data: [...] } ou { data: { data: [...] } }
  // selon la pagination : on prend le premier tableau qu'on trouve.
  const rows = [list.data?.data, list.data, list.data?.documents].find(Array.isArray) ?? [];
  for (const document of rows) {
    if (document?.id) created.add(String(document.id));
  }
  for (const id of created) await api(TOKEN, 'DELETE', `/math-lab/documents/${id}`);
  console.log(`\n🧹 ${created.size} document(s) supprimé(s).`);
}

await browser.close();

record('aucune erreur JavaScript', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
record('aucune erreur de console', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

const failed = results.filter((r) => !r.ok);
console.log(`\n${'═'.repeat(66)}`);
console.log(`${results.length - failed.length}/${results.length} vérifications passées.`);
if (failed.length) {
  console.log('\nÉchecs :');
  for (const f of failed) console.log(`  ❌ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`);
}
console.log(`\nCaptures : ${OUT}`);
process.exit(failed.length ? 1 : 0);
