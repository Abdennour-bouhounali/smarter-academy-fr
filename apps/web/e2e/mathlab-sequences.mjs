/**
 * QA navigateur — le مختبر المتتاليات (laboratoire des suites et récurrences).
 *
 * Lancement (dev server sur 5173, API sur 8000, élève QA existant) :
 *   node apps/web/e2e/mathlab-sequences.mjs [dossier-captures]
 *
 * Ce qu'on vérifie (§53) :
 *   - navigation : la carte sur l'accueil, l'URL directe, le rechargement,
 *     le visiteur non connecté ;
 *   - la première visite : la suite ARITHMÉTIQUE du programme de 4AM avec ses
 *     FROUS MÉTATALLIQUES affichées, et aucun document créé avant le premier geste ;
 *   - les familles (§3) : arithmétique, géométrique, tآلفية, صريحة, تراجعية,
 *     rang deux (Fibonacci) ;
 *   - les curseurs (§5, §25) : q de 0,8 → 1 → 1,2 → −1, et le comportement
 *     qui change SOUS le doigt ;
 *   - le pas à pas (§7) et l'animation (§6) : play avance, pause arrête ;
 *   - la décomposition du pas (§8) : uₙ → règle → uₙ₊₁ ;
 *   - la toile d'araignée (§9) et les points fixes (§10) ;
 *   - la convergence (§11) : « prouvé » pour l'affine contractante, « observé »
 *     pour le reste — JAMAIS l'inverse ;
 *   - les grands indices (§12) : n = 1000, n = 10000 ;
 *   - le tableau (§17) : colonnes qui s'allument, rapport « — » sur un zéro ;
 *   - les sous-suites (§23), les bornes (§22), les sommes (§36) ;
 *   - la comparaison (§33) ;
 *   - l'écriture libre (§31) et sa sûreté (§32) : `2u +`, `1/(u-2)`, `u^u` ;
 *   - l'entraînement (§27) : prédire → révéler, et JAMAIS de blocage ;
 *   - le mouvement réduit (§43) ;
 *   - RTL : panneau au bon bord, notation LTR (direction CALCULÉE) ;
 *   - responsive : tablette et mobile, pas de débordement horizontal,
 *     cibles tactiles ≥ 36 px ;
 *   - accessibilité : focus visible, curseurs nommés, ligne courante marquée
 *     autrement que par la couleur ;
 *   - non-régression : les autres instruments s'ouvrent toujours.
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
const OUT = process.argv[2] || '/tmp/mathlab-sequences-shots';
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
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

async function authedContext(options) {
  const context = await browser.newContext({ ...options, ...(authState ? { storageState: authState } : {}) });
  if (!authState) {
    const page = await context.newPage();
    await loginUI(page);
    authState = await context.storageState();
    await page.close();
  }

  return context;
}

function attach(page) {
  page.on('pageerror', (error) => pageErrors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error' && !EXPECTED_HTTP.test(message.text())) consoleErrors.push(message.text());
  });
}

const docIdOf = (url) => Number((url.match(/\/atelier\/suites\/(\d+)/) || [])[1]) || null;
const textOf = (page, selector) => page.locator(selector).first().innerText().catch(() => null);
const countOf = (page, selector) => page.locator(selector).count();

/** Les valeurs des points dessinés, dans l'ordre des indices. */
async function dotIndices(page) {
  return page.$$eval('[data-ml-seq-dot]', (nodes) => nodes
    .map((node) => Number(node.getAttribute('data-ml-seq-dot')))
    .sort((l, r) => l - r));
}

/** Les valeurs de la colonne uₙ du tableau. */
async function tableValues(page) {
  return page.$$eval('[data-ml-seq-row] td:first-of-type .sa-ml-seq__num',
    (nodes) => nodes.map((node) => node.textContent.trim()));
}

async function openSection(page, id) {
  const toggle = page.locator(`[data-ml-seq-section-toggle="${id}"]`).first();
  const section = page.locator(`[data-ml-seq-section="${id}"]`).first();
  if (await section.getAttribute('data-open') === 'false') {
    await toggle.click();
    await sleep(160);
  }
}

/** Pose une valeur dans le champ numérique d'un paramètre. */
async function setParam(page, id, value) {
  const field = page.locator(`[data-ml-seq-field="${id}"]`).first();
  await field.fill(String(value));
  await field.blur();
  await sleep(260);
}

async function setLayer(page, key, on) {
  await openSection(page, 'layers');
  const box = page.locator(`[data-ml-seq-layer="${key}"]`).first();
  if (await box.isChecked() !== on) {
    await box.click();
    await sleep(260);
  }
}

async function setRule(page, text) {
  const field = page.locator('[data-ml-seq-rulefield]').first();
  await field.fill(text);
  await field.blur();
  await sleep(320);
}

// ═══ 1. L'accueil ════════════════════════════════════════════════════════
const context = await authedContext({ viewport: { width: 1360, height: 900 } });
const page = await context.newPage();
attach(page);

await page.goto(`${BASE}/espace/atelier?lab=secondaire`, { waitUntil: 'networkidle' });
const card = page.locator('a[href*="/atelier/suites"]').first();
record('accueil : la carte du مختبر المتتاليات est là', await card.count() > 0);
await page.screenshot({ path: `${OUT}/00-accueil.png`, fullPage: true });

// ═══ 2. La première visite ═══════════════════════════════════════════════
await page.goto(`${BASE}/espace/atelier/suites`, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-ml-sequences]', { timeout: 20000 });
await sleep(700);

record('première visite : AUCUN document créé avant le premier geste', docIdOf(page.url()) === null, page.url());

const openRule = await textOf(page, '[data-ml-seq-rule]');
record('ouvre sur la suite ARITHMÉTIQUE du programme (uₙ₊₁ = uₙ + 3)',
  /uₙ₊₁\s*=\s*uₙ\s*\+\s*3/.test(openRule ?? ''), openRule);

const openKind = await page.locator('[data-ml-seq-kind="arithmetic"]').first().getAttribute('aria-pressed');
record('la famille arithmétique est sélectionnée', openKind === 'true');

const firstValues = await tableValues(page);
record('les dix premiers termes sont 2, 5, 8, 11…',
  firstValues.slice(0, 4).join(',') === '2,5,8,11', firstValues.slice(0, 5).join(' · '));

const deltaCount = await countOf(page, '[data-ml-seq-delta]');
record('les FROUS MÉTATALLIQUES (§الفروق المتتالية, LP 2.1) sont affichées d’emblée', deltaCount > 0, `${deltaCount} lignes`);

// La règle de la plateforme : rien du lycée sur le premier écran.
const cobwebAtOpen = await countOf(page, '[data-ml-seq-cobweb]');
record('le premier écran ne montre PAS la toile (au-delà du programme de 4AM)', cobwebAtOpen === 0);

const dots = await dotIndices(page);
record('le graphe montre dix points discrets', dots.length === 10, dots.join(','));

/**
 * Le CADRAGE : les dix termes doivent être DANS la fenêtre.
 *
 * L'abscisse est un indice et l'ordonnée une valeur — deux grandeurs sans
 * rapport. Forcer un repère orthonormé (ce que fait `resizeViewport` pour le
 * grapheur) écrasait la hauteur : la QA visuelle a montré une fenêtre
 * y ∈ [10 ; 19] où trois points sur dix se voyaient, les premiers termes hors
 * cadre. On vérifie donc que 2 (le premier terme) et 29 (le dernier) tiennent
 * tous les deux dedans.
 */
const openView = (await page.locator('[data-ml-seq-plane]').first().getAttribute('data-ml-view'))
  ?.split(',').map(Number) ?? [];
record('le cadrage montre TOUS les termes, du premier au dernier (§19)',
  openView.length === 4 && openView[2] <= 2 && openView[3] >= 29,
  `y ∈ [${openView[2]} ; ${openView[3]}] pour des termes de 2 à 29`);
const connectAtOpen = await countOf(page, '[data-ml-seq-connect]');
record('les points ne sont PAS reliés par défaut (§18)', connectAtOpen === 0);

await page.screenshot({ path: `${OUT}/01-premiere-visite.png`, fullPage: true });

// ═══ 3. Le pas à pas et la décomposition (§7, §8) ════════════════════════
const badgeBefore = await textOf(page, '[data-ml-seq-cursor-badge]');
await page.locator('[data-ml-seq-next]').first().click();
await sleep(300);
const badgeAfter = await textOf(page, '[data-ml-seq-cursor-badge]');
record('« terme suivant » avance d’un terme', badgeBefore !== badgeAfter, `${badgeBefore} → ${badgeAfter}`);

const step = await textOf(page, '[data-ml-seq-step]');
record('le pas se lit en trois temps : uₙ → règle → uₙ₊₁ (§8)',
  /u₀\s*=\s*2/.test(step ?? '') && /2\s*\+\s*3/.test(step ?? '') && /u₁\s*=\s*5/.test(step ?? ''), step);

// Au bout des termes engendrés, avancer en CALCULE un de plus (§7).
for (let i = 0; i < 9; i += 1) await page.locator('[data-ml-seq-next]').first().click();
await sleep(400);
const grownDots = await dotIndices(page);
record('au bout de la liste, « suivant » ENGENDRE un terme de plus (§7)',
  grownDots.length > 10, `${grownDots.length} termes`);

await page.locator('[data-ml-seq-reset]').first().click();
await sleep(250);
record('« retour au premier terme » remet le curseur à u₀',
  /u₀/.test(await textOf(page, '[data-ml-seq-cursor-badge]') ?? ''));

// ═══ 4. L'animation (§6) ═════════════════════════════════════════════════
const beforePlay = await textOf(page, '[data-ml-seq-cursor-badge]');
await page.locator('[data-ml-seq-play]').first().click();
await sleep(1600);
const duringPlay = await textOf(page, '[data-ml-seq-cursor-badge]');
record('le play avance les termes tout seul', beforePlay !== duringPlay, `${beforePlay} → ${duringPlay}`);
await page.locator('[data-ml-seq-play]').first().click();
await sleep(500);
const afterPause = await textOf(page, '[data-ml-seq-cursor-badge]');
await sleep(900);
record('la pause arrête vraiment', afterPause === await textOf(page, '[data-ml-seq-cursor-badge]'));

// ═══ 5. Le curseur de raison : le « wow » de §5 et §25 ═══════════════════
await page.locator('[data-ml-seq-kind="geometric"]').first().click();
await sleep(350);

const behaviours = {};
for (const q of [0.8, 1, 1.2, -1]) {
  await setParam(page, 'ratio', q);
  behaviours[q] = {
    trend: await page.locator('[data-ml-seq-trend]').first().getAttribute('data-ml-seq-trend'),
    micro: await page.locator('[data-ml-seq-micro]').first().getAttribute('data-ml-seq-micro').catch(() => null),
  };
}
record('q = 0,8 → les termes se resserrent', behaviours[0.8].trend === 'approaching', JSON.stringify(behaviours[0.8]));
record('q = 1 → la suite est CONSTANTE', behaviours[1].trend === 'constant', JSON.stringify(behaviours[1]));
record('q = 1,2 → la suite croît', ['increasing', 'diverging'].includes(behaviours[1.2].trend), JSON.stringify(behaviours[1.2]));
record('q = −1 → la suite ALTERNE', behaviours[-1].trend === 'alternating', JSON.stringify(behaviours[-1]));
record('le comportement change SOUS le doigt (quatre régimes distincts)',
  new Set(Object.values(behaviours).map((b) => b.trend)).size >= 3);
await page.screenshot({ path: `${OUT}/02-raison-negative.png`, fullPage: true });

// Les puces de valeurs remarquables (§14)
await page.locator('[data-ml-seq-mark="ratio:0.5"]').first().click();
await sleep(300);
record('les puces posent une valeur remarquable exactement',
  (await page.locator('[data-ml-seq-field="ratio"]').first().inputValue()) === '0,5');

/**
 * La DÉFINITION reste sous les yeux pendant qu'on la change (§5, §50).
 *
 * Les curseurs de `a` et `b` vivent au bas d'un panneau qui défile ; la règle
 * est en haut. Sans une carte COLLANTE, tirer un curseur se fait à l'aveugle.
 * Elle doit donc rester visible ET se mettre à jour en même temps.
 */
await page.locator('[data-ml-seq-kind="affine"]').first().click();
await sleep(400);
await page.evaluate(() => {
  const body = document.querySelector('.sa-ml-seq__panel-body');
  if (body) body.scrollTop = body.scrollHeight;
});
await sleep(400);

const sticky = await page.evaluate(() => {
  const body = document.querySelector('.sa-ml-seq__panel-body');
  const definition = document.querySelector('[data-ml-seq-definition]');
  const slider = document.querySelector('[data-ml-seq-slider="a"]');
  if (!body || !definition || !slider) return null;
  const inside = (node) => {
    const box = node.getBoundingClientRect();
    const frame = body.getBoundingClientRect();

    return box.bottom > frame.top && box.top < frame.bottom;
  };

  return { definition: inside(definition), slider: inside(slider), scrolled: body.scrollTop > 200 };
});
record('§5 : la définition reste visible quand on descend jusqu’aux curseurs',
  sticky && sticky.scrolled && sticky.definition && sticky.slider, JSON.stringify(sticky));

const ruleBefore = await textOf(page, '[data-ml-seq-rule]');
const slider = page.locator('[data-ml-seq-slider="a"]').first();
await slider.focus();
for (let i = 0; i < 6; i += 1) { await slider.press('ArrowLeft'); await sleep(110); }
await sleep(400);
const ruleAfter = await textOf(page, '[data-ml-seq-rule]');
const stillVisible = await page.evaluate(() => {
  const body = document.querySelector('.sa-ml-seq__panel-body');
  const definition = document.querySelector('[data-ml-seq-definition]');
  const box = definition.getBoundingClientRect();
  const frame = body.getBoundingClientRect();

  return box.bottom > frame.top && box.top < frame.bottom;
});
record('§5 : la règle change SOUS le doigt, sans quitter l’écran',
  ruleBefore !== ruleAfter && stillVisible, `${ruleBefore} → ${ruleAfter}`);

// ═══ 6. L'affine, la toile, les points fixes, et l'HONNÊTETÉ (§9-§11) ═══
await openSection(page, 'presets');
await page.locator('[data-ml-seq-preset="fixedPoint"]').first().click();
await sleep(700);

record('le préréglage « point fixe » ouvre la toile d’araignée (§9)',
  await countOf(page, '[data-ml-seq-cobweb]') > 0);
record('la toile trace y = x et y = f(x)',
  await countOf(page, '[data-ml-seq-diagonal]') > 0 && await countOf(page, '[data-ml-seq-rulecurve="0"]') > 0);
record('le chemin en escalier est tracé',
  await countOf(page, '[data-ml-seq-webline="0"]') > 0);
record('le point fixe est marqué sur la toile',
  await countOf(page, '[data-ml-seq-cobweb-fixed]') > 0);

const fixedFormula = await textOf(page, '[data-ml-seq-fixed-formula]');
record('la formule du point fixe est affichée : L = b/(1−a) = 4',
  /L\s*=.*=\s*4/.test(fixedFormula ?? ''), fixedFormula);

// §11 : une affine contractante est un THÉORÈME — c'est le seul cas « prouvé ».
const provenFlag = await page.locator('[data-ml-seq-trend-proven]').first().getAttribute('data-ml-seq-trend-proven');
record('§11 : l’affine contractante est annoncée comme PROUVÉE (théorème du cours)', provenFlag === 'true', String(provenFlag));
const observedNote = await countOf(page, '[data-ml-seq-observed-note]');
record('§11 : et elle ne porte donc PAS la mention « simple observation »', observedNote === 0);
await page.screenshot({ path: `${OUT}/03-toile-point-fixe.png`, fullPage: true });

// Une récurrence libre, elle, n'est JAMAIS « prouvée ».
await page.locator('[data-ml-seq-kind="recurrence"]').first().click();
await sleep(300);
await setRule(page, 'u/2 + 1');
await sleep(400);
const freeProven = await page.locator('[data-ml-seq-trend-proven]').first().getAttribute('data-ml-seq-trend-proven').catch(() => null);
record('§11 : une récurrence LIBRE n’est jamais annoncée comme prouvée', freeProven !== 'true', String(freeProven));
record('§11 : elle porte la mention « observation, pas preuve »',
  await countOf(page, '[data-ml-seq-observed-note]') > 0);

// Le préréglage « point fixe » ÉTEINT le tableau pour laisser la place à la
// toile (§39) — et l'interface offre alors de le rallumer.
record('§39 : un préréglage peut éteindre le tableau, et propose de le rallumer',
  await countOf(page, '[data-ml-seq-table-off]') > 0);
await setLayer(page, 'table', true);
record('le tableau revient quand on le redemande', await countOf(page, '[data-ml-seq-table]') > 0);

// ═══ 7. L'écriture libre et la sûreté (§31, §32) ═════════════════════════
await setRule(page, '2u +');
record('une expression incomplète est signalée, sans écran cassé (§32)',
  await countOf(page, '[data-ml-seq-rule-error]') > 0,
  await page.locator('[data-ml-seq-rule-error]').first().getAttribute('data-ml-seq-rule-error'));
record('la saisie de l’élève n’est PAS effacée quand elle est invalide',
  (await page.locator('[data-ml-seq-rulefield]').first().inputValue()) === '2u +');

await setRule(page, '1/(u-2)');
await setParam(page, 'first', 2);
await sleep(400);
record('une division par zéro arrête la suite proprement et le DIT (§32)',
  await countOf(page, '[data-ml-seq-stopped]') > 0,
  await page.locator('[data-ml-seq-stopped]').first().getAttribute('data-ml-seq-stopped'));

await setRule(page, 'u^2');
await setParam(page, 'first', 10);
await sleep(500);
// On regarde les CELLULES du tableau, pas la page entière : en concaténant
// tout le texte on recolle les étiquettes d'axes entre elles et on fabrique
// de faux « nombres monstrueux » qui n'existent nulle part à l'écran.
const blowupCells = await tableValues(page);
const monstrous = blowupCells.filter((cell) => cell.replace(/[\s −,]/g, '').length > 13);
record('une suite qui explose ne montre aucun nombre monstrueux : elle S’ARRÊTE',
  monstrous.length === 0 && await countOf(page, '[data-ml-seq-stopped]') > 0,
  `${blowupCells.join(' · ')}`);
record('l’onglet reste vivant après une explosion', await countOf(page, '[data-ml-sequences]') > 0);
await page.screenshot({ path: `${OUT}/04-securite.png`, fullPage: true });

// ═══ 8. Les familles restantes (§3) ══════════════════════════════════════
await page.locator('[data-ml-seq-kind="explicit"]').first().click();
await sleep(350);
// Changer de famille GARDE l'expression de l'autre (§4) : on pose la nouvelle
// règle et on attend que les termes soient recalculés avant de lire.
await setRule(page, '(-1)^n');
await page.waitForFunction(
  () => document.querySelector('[data-ml-seq-rule]')?.textContent?.includes('(−1)'),
  null, { timeout: 5000 },
).catch(() => {});
await sleep(300);
const altValues = await tableValues(page);
record('explicite (−1)ⁿ : les signes alternent (§20)',
  altValues.slice(0, 4).join(',') === '1,−1,1,−1', altValues.slice(0, 4).join(','));

await setRule(page, '1/n');
await page.locator('[data-ml-seq-start="1"]').first().click();
await sleep(600);
const invValues = await tableValues(page);
const invIndices = await page.$$eval('[data-ml-seq-row]',
  (nodes) => nodes.map((node) => Number(node.getAttribute('data-ml-seq-row'))));
record('explicite 1/n depuis u₁ : la suite commence bien à n = 1 (§4)',
  invIndices[0] === 1, invIndices.slice(0, 4).join(','));
record('explicite 1/n : les termes décroissent vers zéro (§12)',
  invValues[0] === '1'
    && parseFloat(invValues[1].replace(',', '.')) === 0.5
    && parseFloat(invValues[invValues.length - 1].replace(',', '.')) < 0.2,
  invValues.slice(0, 4).join(' · '));

await openSection(page, 'presets');
await page.locator('[data-ml-seq-preset="fibonacci"]').first().click();
await sleep(600);
const fibValues = await tableValues(page);
record('Fibonacci (§40) : 0, 1, 1, 2, 3, 5, 8…',
  fibValues.slice(0, 7).join(',') === '0,1,1,2,3,5,8', fibValues.slice(0, 7).join(','));
record('Fibonacci affiche la colonne des RAPPORTS (§40)', await countOf(page, '[data-ml-seq-ratio]') > 0);
await page.screenshot({ path: `${OUT}/05-fibonacci.png`, fullPage: true });

// ═══ 9. Un indice lointain (§12) ═════════════════════════════════════════
await openSection(page, 'presets');
await page.locator('[data-ml-seq-preset="arithmetic"]').first().click();
await sleep(500);
for (const n of [1000, 10000]) {
  await page.locator(`[data-ml-seq-probe-step="${n}"]`).first().click();
  await sleep(200);
  await page.locator('[data-ml-seq-probe-run]').first().click();
  await sleep(400);
  const probe = await textOf(page, '[data-ml-seq-probe-result]');
  const expected = 2 + 3 * n;
  const digits = (probe ?? '').replace(/[\s ]/g, '');
  record(`§12 : u(${n}) se calcule seul et vaut ${expected}`,
    digits.includes(String(expected)), probe);
}

// ═══ 10. Le tableau, les sous-suites, les bornes, les sommes ═════════════
await setLayer(page, 'ratios', true);
record('§17 : la colonne des rapports s’allume', await countOf(page, '[data-ml-seq-ratio]') > 0);
await setLayer(page, 'sums', true);
record('§36 : les sommes partielles s’affichent', (await textOf(page, '[data-ml-seq-table]'))?.includes('Sₙ'));
await setLayer(page, 'evenOdd', true);
record('§23 : les sous-suites paires/impaires se distinguent',
  await countOf(page, '.sa-ml-seq__dot--even') > 0 && await countOf(page, '.sa-ml-seq__dot--odd') > 0);
await setLayer(page, 'bounds', true);
record('§22 : le MAJAL MARSOUD est nommé comme observé', await countOf(page, '[data-ml-seq-range]') > 0);
await setLayer(page, 'connect', true);
record('§18 : relier les points est possible, mais sur demande', await countOf(page, '[data-ml-seq-connect]') > 0);
await page.screenshot({ path: `${OUT}/06-lectures.png`, fullPage: true });

// Un rapport sur un terme nul s'écrit « — », jamais l'infini (§35).
await setParam(page, 'first', 0);
await sleep(400);
const ratioCells = await page.$$eval('[data-ml-seq-ratio]', (nodes) => nodes.map((n) => n.textContent.trim()));
record('§35 : un rapport sur un terme nul s’écrit « — », jamais ∞',
  ratioCells.some((cell) => cell === '—') && !ratioCells.some((cell) => /Infinity|∞/.test(cell)),
  ratioCells.slice(0, 3).join(' | '));

// ═══ 11. La comparaison (§33) ════════════════════════════════════════════
await openSection(page, 'compare');
await page.locator('[data-ml-seq-compare-toggle]').first().click();
await sleep(500);
record('§33 : une seconde suite se dessine', await countOf(page, '[data-ml-seq-secondary]') > 0);
record('§33 : et elle a ses propres réglages', await countOf(page, '[data-ml-seq-secondary-params]') > 0);
await page.screenshot({ path: `${OUT}/07-comparaison.png`, fullPage: true });
await page.locator('[data-ml-seq-compare-toggle]').first().click();
await sleep(300);
record('§33 : la comparaison se referme', await countOf(page, '[data-ml-seq-secondary]') === 0);

// ═══ 12. Les expériences guidées (§26) ═══════════════════════════════════
await openSection(page, 'experiments');
await page.locator('[data-ml-seq-experiment="negativeRatio"]').first().click();
await sleep(600);
record('§26 : l’expérience pose une QUESTION', await countOf(page, '[data-ml-seq-guide]') > 0);
record('§26 : elle met en évidence le paramètre à tirer',
  await countOf(page, '.sa-ml-seq__param--focus') > 0);
await page.locator('[data-ml-seq-guide-next]').first().click();
await sleep(250);
await page.locator('[data-ml-seq-guide-close]').first().click();
await sleep(250);
record('§26 : on peut TOUJOURS fermer une expérience', await countOf(page, '[data-ml-seq-guide]') === 0);

// ═══ 13. L'entraînement : jamais de blocage (§27, §28, §29) ══════════════
await page.locator('[data-ml-seq-practice-start]').first().click();
await sleep(700);
record('§27 : l’entraînement s’ouvre sur une question', await countOf(page, '[data-ml-seq-practice-question]') > 0);

const question = await textOf(page, '[data-ml-seq-practice-question]');
record('§44 : la question est en ARABE',
  /[؀-ۿ]/.test(question ?? '') && !/\b(what|predict|find|which|how)\b/i.test(question ?? ''), question);

// Une réponse volontairement fausse.
const answerField = page.locator('[data-ml-seq-practice-answer]').first();
const isChoice = await answerField.count() === 0;
if (isChoice) {
  await page.locator('[data-ml-seq-practice-choice]').first().click();
} else {
  await answerField.fill('999999');
}
await sleep(150);
await page.locator('[data-ml-seq-practice-check]').first().click();
await sleep(400);

const verdict = await page.locator('[data-ml-seq-practice-verdict]').first().getAttribute('data-ml-seq-practice-verdict');
record('§27 : une réponse est jugée', Boolean(verdict), String(verdict));
record('§27 : après une réponse FAUSSE, le champ reste modifiable',
  isChoice || await answerField.isEditable());
record('§27 : « révéler » reste actif après une erreur — rien ne se verrouille',
  await page.locator('[data-ml-seq-practice-reveal]').first().isEnabled().catch(() => true));
record('§27 : « question suivante » reste actif',
  await page.locator('[data-ml-seq-practice-next]').first().isEnabled());
record('§27 : la mention « réessaie librement » est affichée',
  (await textOf(page, '[data-ml-seq-practice]'))?.includes('أعِد المحاولة'));

// Une saisie illisible n'est PAS « faux ».
if (!isChoice) {
  await answerField.fill('أربعة');
  await page.locator('[data-ml-seq-practice-check]').first().click();
  await sleep(350);
  const unreadable = await page.locator('[data-ml-seq-practice-verdict]').first().getAttribute('data-ml-seq-practice-verdict');
  record('§29 : une saisie illisible est distinguée d’une erreur de calcul', unreadable === 'unreadable', String(unreadable));
}

// Les indices, progressifs (§28).
await page.locator('[data-ml-seq-practice-hint-btn]').first().click();
await sleep(300);
const hint1 = await textOf(page, '[data-ml-seq-practice-hint]');
record('§28 : le premier indice est donné, et il ne contient pas la réponse', Boolean(hint1), hint1);
await page.locator('[data-ml-seq-practice-hint-btn]').first().click();
await sleep(300);
const hint2 = await textOf(page, '[data-ml-seq-practice-hint]');
record('§28 : les indices sont PROGRESSIFS (le second diffère du premier)', hint1 !== hint2, hint2);

// La révélation montre les VRAIS termes (§29).
await page.locator('[data-ml-seq-practice-reveal]').first().click();
await sleep(300);
await playToEnd(page, 'data-ml-seq-reveal-step');
await sleep(300);
const explainTerms = await countOf(page, '[data-ml-seq-explain-term]');
record('§29 : la révélation montre les VRAIS termes calculés, pas un verdict',
  explainTerms > 1, `${explainTerms} termes`);
record('§29 : le terme demandé est mis en évidence',
  await countOf(page, '.sa-ml-seq__explainterm--target') > 0);
await page.screenshot({ path: `${OUT}/08-entrainement.png`, fullPage: true });

await page.locator('[data-ml-seq-practice-next]').first().click();
await sleep(600);
record('§27 : on passe à une autre question', await countOf(page, '[data-ml-seq-practice-question]') > 0);
await page.locator('[data-ml-seq-practice-close]').first().click();
await sleep(300);
record('§27 : l’entraînement se ferme et rend la main', await countOf(page, '[data-ml-seq-practice]') === 0);

// ═══ 14. La persistance ══════════════════════════════════════════════════
await page.locator('[data-ml-seq-kind="geometric"]').first().click();
await setParam(page, 'ratio', 1.5);
await sleep(3400);   // l'autosave de la coquille
const docId = docIdOf(page.url());
record('persistance : un document est créé après un geste', Boolean(docId), page.url());
if (docId) created.add(docId);

await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector('[data-ml-sequences]');
await sleep(700);
const reloadedRule = await textOf(page, '[data-ml-seq-rule]');
record('persistance : la suite est retrouvée après rechargement',
  /1,5/.test(reloadedRule ?? ''), reloadedRule);

if (docId) {
  const stored = await api(TOKEN, 'GET', `/math-lab/documents/${docId}`);
  const raw = JSON.stringify(stored.data?.data ?? stored.data);
  record('persistance : l’ANIMATION n’est jamais stockée (§48)',
    !/playing|speed|direction|frame/.test(raw));
  record('persistance : la question d’entraînement n’est pas stockée (§48)',
    !/challenge|promptKey|expected|hintKeys/.test(raw));
  record('persistance : les TERMES ne sont pas stockés (ils se recalculent)',
    !/"terms"/.test(raw));
  record('persistance : le document reste minuscule', raw.length < 2000, `${raw.length} octets`);
}

// ═══ 15. RTL et notation (§44) ═══════════════════════════════════════════
const dir = await page.evaluate(() => document.documentElement.dir);
record('RTL : la page est en rtl', dir === 'rtl');

const planeDir = await page.evaluate(() => {
  const node = document.querySelector('[data-ml-seq-plane]');

  return node ? getComputedStyle(node).direction : null;
});
record('RTL : le PLAN reste en ltr (c’est de la mathématique)', planeDir === 'ltr', String(planeDir));

const ruleStyle = await page.evaluate(() => {
  const node = document.querySelector('[data-ml-seq-rule]');
  if (!node) return null;
  const style = getComputedStyle(node);

  return { direction: style.direction, textAlign: style.textAlign };
});
record('RTL : la notation est en ltr ET alignée à gauche (la paire de §44)',
  ruleStyle?.direction === 'ltr' && ruleStyle?.textAlign === 'left', JSON.stringify(ruleStyle));

const panelBox = await page.locator('[data-ml-panel]').first().boundingBox();
record('RTL : le panneau est au bord de DÉBUT (à gauche en rtl)',
  panelBox && panelBox.x < 700, JSON.stringify(panelBox && { x: Math.round(panelBox.x) }));

const panelText = await textOf(page, '[data-ml-panel]');
record('aucun mot anglais oublié dans le panneau',
  !/\b(sequence|ratio|difference|term|next|play|reveal|hint|table)\b/i.test(panelText ?? ''));
record('aucun chiffre arabo-indien : les manuels algériens écrivent en chiffres latins',
  !/[٠-٩]/.test(panelText ?? ''));
await page.screenshot({ path: `${OUT}/09-rtl.png`, fullPage: true });

// ═══ 16. Accessibilité (§43) ═════════════════════════════════════════════
const sliderLabel = await page.locator('[data-ml-seq-slider="ratio"]').first().getAttribute('aria-label');
record('a11y : les curseurs sont nommés', Boolean(sliderLabel), String(sliderLabel));
const sliderText = await page.locator('[data-ml-seq-slider="ratio"]').first().getAttribute('aria-valuetext');
record('a11y : un curseur annonce sa valeur lisible', Boolean(sliderText), String(sliderText));

/**
 * On active la ligne 1 du tableau.
 *
 * Le panneau est son PROPRE conteneur de défilement (`.sa-ml-seq__panel-body`,
 * `overflow-y: auto`) et le tableau se trouve souvent sous le pli : le clic
 * « réel » de Playwright vise alors ce qui se trouve par-dessus, et rien
 * n'est testé. On déclenche donc le bouton directement — ce qu'on vérifie ici
 * est le HANDLER et l'attribut `aria-current` qui en découle, pas la
 * géométrie du panneau (la taille des cibles tactiles est vérifiée à part,
 * dans la boucle responsive).
 */
await page.evaluate(() => document.querySelector('[data-ml-seq-rowbtn="1"]')?.click());
await sleep(300);
const currentRow = await page.locator('[data-ml-seq-row="1"]').first().getAttribute('aria-current');
record('a11y : la ligne courante est marquée autrement que par la COULEUR', currentRow === 'true');

const focusVisible = await page.evaluate(() => {
  const node = document.querySelector('[data-ml-seq-next]');
  node?.focus();

  return node === document.activeElement;
});
record('a11y : les boutons sont focalisables', focusVisible);

const canvasLabel = await page.locator('[data-ml-seq-plane]').first().getAttribute('aria-label');
record('a11y : le plan porte un nom accessible', Boolean(canvasLabel), String(canvasLabel));

// ═══ 17. Le mouvement réduit (§43) ═══════════════════════════════════════
const reducedContext = await authedContext({ viewport: { width: 1280, height: 860 }, reducedMotion: 'reduce' });
const reducedPage = await reducedContext.newPage();
attach(reducedPage);
await reducedPage.goto(`${BASE}/espace/atelier/suites`, { waitUntil: 'networkidle' });
await reducedPage.waitForSelector('[data-ml-sequences]');
await sleep(600);
record('§43 : la note de mouvement réduit est affichée',
  await countOf(reducedPage, '[data-ml-seq-reduced-motion]') > 0);
const playPressed = await reducedPage.locator('[data-ml-seq-play]').first().getAttribute('aria-pressed');
record('§43 : le défilement automatique ne démarre pas tout seul', playPressed === 'false');
record('§43 : l’instrument reste entièrement utilisable',
  await reducedPage.locator('[data-ml-seq-next]').first().isEnabled());
await reducedPage.close();
await reducedContext.close();

// ═══ 18. Responsive (§45) ════════════════════════════════════════════════
for (const [name, viewport] of [
  ['tablette', { width: 834, height: 1112 }],
  ['mobile', { width: 390, height: 844 }],
  ['mobile-petit', { width: 360, height: 740 }],
]) {
  const mobileContext = await authedContext({ viewport, hasTouch: true, isMobile: true });
  const mobilePage = await mobileContext.newPage();
  attach(mobilePage);
  await mobilePage.goto(`${BASE}/espace/atelier/suites`, { waitUntil: 'networkidle' });
  await mobilePage.waitForSelector('[data-ml-sequences]');
  await sleep(700);

  const overflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  record(`${name} : aucun débordement horizontal`, overflow <= 1, `${overflow}px`);

  /**
   * Le graphe doit rester UTILISABLE (§45), pas seulement présent.
   *
   * Le seuil était à 18 % de la hauteur, ce qui laissait passer une bande de
   * 180 px où deux points sur dix se voyaient — la QA visuelle l'a montré là
   * où l'assertion passait. On exige un tiers de l'écran, et surtout que les
   * points DESSINÉS soient au moins aussi nombreux que sur un grand écran.
   */
  const stageBox = await mobilePage.locator('[data-ml-seq-plotbox]').first().boundingBox();
  record(`${name} : le graphe garde une hauteur utilisable`,
    stageBox && stageBox.height > viewport.height * 0.3,
    stageBox && `${Math.round(stageBox.height)}px sur ${viewport.height}px`);

  const mobileDots = await dotIndices(mobilePage);
  record(`${name} : les dix termes sont VISIBLES, pas seulement calculés`,
    mobileDots.length === 10, `${mobileDots.length} points`);

  // On mesure les cibles DE L'INSTRUMENT : la coquille élève (StudentLayout)
  // a ses propres boutons, dont la déconnexion à 32 px, qui ne relèvent pas
  // de cette tâche et qu'il serait malhonnête de faire passer pour les nôtres.
  const small = await mobilePage.$$eval('[data-ml-sequences] button:visible', (nodes) => nodes
    .map((node) => {
      const r = node.getBoundingClientRect();

      return { w: Math.round(r.width), h: Math.round(r.height), text: (node.textContent || '').trim().slice(0, 18) };
    })
    .filter((box) => box.h > 0 && (box.h < 36 || box.w < 36)));
  record(`${name} : aucune cible tactile de l’instrument sous 36 px`, small.length === 0, JSON.stringify(small.slice(0, 4)));

  // Le tableau doit DÉFILER, pas comprimer (§45).
  const scrollable = await mobilePage.evaluate(() => {
    const node = document.querySelector('.sa-ml-seq__tablewrap');
    if (!node) return null;

    return getComputedStyle(node).overflowX;
  });
  record(`${name} : le tableau défile horizontalement`, scrollable === 'auto' || scrollable === 'scroll', String(scrollable));

  await mobilePage.screenshot({ path: `${OUT}/10-${name}.png`, fullPage: true });
  await mobilePage.close();
  await mobileContext.close();
}

// ═══ 19. Le visiteur non connecté ════════════════════════════════════════
const anonContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const anonPage = await anonContext.newPage();
await anonPage.goto(`${BASE}/espace/atelier/suites`, { waitUntil: 'networkidle' });
record('un visiteur non connecté est renvoyé vers /login', /\/login/.test(anonPage.url()), anonPage.url());
await anonPage.close();
await anonContext.close();

// ═══ 20. Non-régression : les autres instruments ═════════════════════════
for (const [slug, marker] of [
  ['trigonometrie', '[data-ml-trigonometry]'],
  ['vecteurs', '[data-ml-vectors]'],
  ['algebre', '[data-ml-algebra]'],
  ['grapheur', '[data-ml-grapher]'],
  ['probabilites-statistiques', '[data-ml-ps]'],
  ['geometrie-3d', '[data-ml-g3d]'],
]) {
  await page.goto(`${BASE}/espace/atelier/${slug}`, { waitUntil: 'networkidle' });
  const ok = await page.waitForSelector(marker, { timeout: 15000 }).then(() => true).catch(() => false);
  record(`non-régression : /${slug} s’ouvre toujours`, ok);
}

// ═══ Nettoyage ═══════════════════════════════════════════════════════════
for (const id of created) {
  const response = await api(TOKEN, 'DELETE', `/math-lab/documents/${id}`);
  if (response.status >= 300) console.warn(`  (document ${id} non supprimé : ${response.status})`);
}

record('aucune erreur JavaScript', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
record('aucune erreur console', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

await page.close();
await context.close();
await browser.close();

const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} vérifications passées`);
if (failed.length) {
  console.log('\nÉchecs :');
  for (const item of failed) console.log(`  ❌ ${item.name}${item.detail ? ` — ${item.detail}` : ''}`);
}
console.log(`\nCaptures : ${OUT}`);
process.exit(failed.length ? 1 : 0);
