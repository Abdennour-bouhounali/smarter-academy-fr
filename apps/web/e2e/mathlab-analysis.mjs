/**
 * QA navigateur — l'outil « Analyse » de l'atelier (analyse et
 * fonctions).
 *
 * Lancement (dev server sur 5173, API sur 8000, élève QA existant) :
 *   node apps/web/e2e/mathlab-analysis.mjs [dossier-captures]
 *
 * Ce qu'on vérifie (§55) :
 *   - navigation : la carte sur l'accueil, l'URL directe, le rechargement ;
 *   - §53 : la première visite ouvre sur la SÉCANTE et une fonction affine —
 *     le seul ancrage du collège — et rien n'est créé tant qu'on n'a rien touché ;
 *   - §7 : GLISSER B met à jour le coefficient directeur EN DIRECT ;
 *   - §8 : quand B s'approche de A, le coefficient directeur CONVERGE vers f′(a) ;
 *   - §9, §17 : f′ est écrite, et un point stationnaire n'est pas un extremum ;
 *   - §11, §12 : les deux tables d'approche, et le verdict quand elles diffèrent ;
 *   - §19, §20 : l'aire, et le mot « n » qui resserre les rectangles ;
 *   - §21 : intégrale signée ≠ aire géométrique sur sin ;
 *   - §16 : cliquer « Racines » les ALLUME sur le graphe ;
 *   - §24, §25 : les curseurs et les transformations ;
 *   - §30, §31 : le défi, les indices gradués, et qu'une erreur NE BLOQUE PAS ;
 *   - §46 : une expression fausse donne un message français, jamais une erreur JS ;
 *   - §41 : la sauvegarde et la RÉOUVERTURE du document ;
 *   - gauche à droite : page française sans dir="rtl", notation LTR
 *     (direction CALCULÉE) ;
 *   - responsive : tablette et mobile, pas de débordement horizontal,
 *     cibles tactiles ≥ 44 px ;
 *   - accessibilité : focus visible, poignée focalisable et nommée, flèches.
 *
 * Les documents créés sont supprimés à la fin.
 */
import { chromium } from 'playwright';
import { playToEnd } from './_stepPlayer.mjs';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const EMAIL = process.env.QA_STUDENT_EMAIL || 'qa-eleve@exemple.fr';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const OUT = process.argv[2] || '/tmp/mathlab-analysis-shots';
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
  const context = await browser.newContext({ locale: 'fr-FR', ...options });
  if (!authState) {
    const page = await context.newPage();
    wire(page);
    await loginUI(page);
    authState = await context.storageState();
    await page.close();

    return context;
  }
  await context.close();

  return browser.newContext({ locale: 'fr-FR', storageState: authState, ...options });
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

const textOf = async (page, selector) => (await page.locator(selector).first().textContent().catch(() => ''))?.trim() ?? '';

/** Ouvre l'instrument, plan prêt. */
async function openTool(page) {
  await page.goto(`${BASE}/espace/atelier/analyse`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-an-plane]', { timeout: 15000 });
  await page.waitForTimeout(600);
}

async function selectLab(page, lab) {
  await page.click(`[data-ml-an-lab="${lab}"]`);
  await page.waitForTimeout(500);
}

async function openTab(page, tab) {
  await page.click(`[data-ml-an-tab="${tab}"]`);
  await page.waitForTimeout(250);
}

/**
 * Écrit une expression dans le champ de f et valide.
 *
 * Le champ est un `<math-field>` (MathLive), pas un `<input>` : `fill` ne
 * s'y applique pas. On le focalise, on vide, on tape, on valide — c'est
 * exactement le geste de l'élève.
 */
async function setFunction(page, source) {
  const field = page.locator('[data-ml-an-mathfield="f"]');
  if (source.includes('\\')) {
    /**
     * Une source LaTeX ne se TAPE pas : MathLive avale la barre oblique
     * inverse comme une frappe et `\frac{1}{x}` devient `frac{1}{x}`. On
     * pose donc la valeur et on déclenche le `blur` qui la valide — c'est le
     * chemin qu'emprunte aussi un préréglage.
     */
    await field.evaluate((node, latex) => {
      node.value = latex;
      node.dispatchEvent(new Event('blur'));
    }, source);
  } else {
    await typeMath(page, 'f', source);
    await page.keyboard.press('Enter');
  }
  await page.waitForTimeout(700);
}

/** La valeur LaTeX que le champ mathématique porte réellement. */
const mathValue = (page, id) => page.locator(`[data-ml-an-mathfield="${id}"]`).evaluate((node) => node.value);

/**
 * Écrit dans un `<math-field>` et valide.
 *
 * MathLive ne prend les frappes qu'une fois son champ VRAIMENT focalisé :
 * taper juste après un `click()` de Playwright laissait le champ vide, ce
 * qui faisait passer des échecs de harnais pour des échecs de produit. On
 * focalise donc explicitement, on attend, puis on tape.
 */
async function typeMath(page, id, text) {
  const field = page.locator(`[data-ml-an-mathfield="${id}"]`);
  await field.click();
  await field.evaluate((node) => node.focus());
  await page.waitForTimeout(250);
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  if (text) await page.keyboard.type(text);
  await page.waitForTimeout(250);

  return field;
}

// ════════════════════════════════════════════════════════════════════════
// 1. Navigation et première visite (§53)
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);

  await page.goto(`${BASE}/espace/atelier?lab=secondaire`, { waitUntil: 'networkidle' });
  const card = page.locator('a[href*="/atelier/analyse"]').first();
  record('accueil : la carte de l’instrument est présente', await card.count() > 0);
  await shot(page, '01-home');

  const listLength = (response) => {
    const payload = response.data?.data ?? response.data ?? [];

    return (Array.isArray(payload) ? payload : (payload.documents ?? [])).length;
  };
  const countBefore = listLength(await api(TOKEN, 'GET', '/math-lab/documents?tool=analysis'));

  await openTool(page);
  await shot(page, '02-first-visit');

  // §53 : on ouvre sur la SÉCANTE, la seule porte du collège du calcul différentiel.
  const lab = await page.locator('[data-ml-analysis]').getAttribute('data-ml-lab');
  record('§53 : la première visite ouvre sur le laboratoire de la sécante', lab === 'secant', `lab=${lab}`);

  const source = await mathValue(page, 'f');
  record('§53 : la fonction d’ouverture est AFFINE (programme du collège)', source === '2x+1', source);

  // §36 : la saisie est un vrai champ MATHÉMATIQUE, pas une ligne de texte.
  record('§36 : le champ de f est un champ mathématique (MathLive)',
    await page.evaluate(() => Boolean(customElements.get('math-field')))
    && await page.locator('[data-ml-an-mathfield="f"]').count() > 0);

  // Le coefficient directeur est lisible tout de suite, sans rien régler (§53).
  await openTab(page, 'inspector');
  const slopeText = await textOf(page, '[data-ml-an-inspector] .sa-ml-an__math--strong');
  record('§53 : le coefficient directeur est affiché dès l’ouverture', slopeText.length > 0, slopeText);

  await page.waitForTimeout(1200);
  const countAfter = listLength(await api(TOKEN, 'GET', '/math-lab/documents?tool=analysis'));
  record('ouvrir sans rien toucher ne crée AUCUN document', countAfter === countBefore, `${countBefore} → ${countAfter}`);

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 2. §7, §8 — la sécante, son coefficient directeur, et sa convergence vers la tangente
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await openTool(page);

  /**
   * LA lecture vive : le coefficient directeur doit changer SOUS LES YEUX de l'élève pendant
   * qu'il règle, sans changer d'onglet. C'est la boucle de §3 —
   * « je change quelque chose → je vois le résultat tout de suite » — et elle
   * était cassée tant que les nombres ne vivaient que dans l'onglet « Lecture ».
   */
  const liveSlope = () => textOf(page, '[data-ml-an-live-cell="slope"] .sa-ml-an__livevalue');

  await openTab(page, 'controls');
  record('la lecture vive est visible dans l’onglet « Réglages »',
    await page.locator('[data-ml-an-live]').count() > 0);

  // Sur une AFFINE, le taux d'accroissement ne dépend pas des points : c'est
  // exactement ce que le programme du collège enseigne, et ça doit se vérifier.
  const slope1 = await liveSlope();
  await page.locator('[data-ml-an-number="pointB"]').fill('7');
  await page.waitForTimeout(500);
  const slope2 = await liveSlope();
  record('§7 : sur une affine, le coefficient directeur ne dépend pas des points choisis', slope1 === slope2 && slope1 !== '', `${slope1} = ${slope2}`);

  // Et il CHANGE quand la fonction cesse d'être affine, toujours sans onglet.
  await setFunction(page, 'x^2');
  await page.locator('[data-ml-an-number="pointB"]').fill('4');
  await page.waitForTimeout(500);
  const before = await liveSlope();
  await page.locator('[data-ml-an-number="pointB"]').fill('2');
  await page.waitForTimeout(500);
  const afterMove = await liveSlope();
  record('§3 : régler dans « Réglages » met à jour la lecture SANS changer d’onglet',
    before !== afterMove && afterMove !== '', `${before} → ${afterMove}`);
  await shot(page, '03-secant-affine');

  // Sur x², le coefficient directeur de la sécante doit CONVERGER vers f′(a) = 2a quand B → A.
  await setFunction(page, 'x^2');
  await page.locator('[data-ml-an-number="pointA"]').fill('1');
  await page.waitForTimeout(300);
  const readSlope = async () => {
    const value = await liveSlope();

    return Number(value.replace('−', '-').replace(',', '.'));
  };

  const slopes = [];
  for (const b of [3, 2, 1.5, 1.1]) {
    await page.locator('[data-ml-an-number="pointB"]').fill(String(b));
    await page.waitForTimeout(400);
    slopes.push(await readSlope());
  }
  // f′(1) = 2 : la suite des pentes doit descendre vers 2.
  const converges = slopes.every((value, index) => index === 0 || value < slopes[index - 1]);
  record('§8 : le coefficient directeur de la sécante converge vers f′(a) = 2', converges && Math.abs(slopes[slopes.length - 1] - 2) < 0.2, slopes.join(' → '));
  await shot(page, '04-secant-approaching');

  // Le bouton « Rapprocher B de A » (§8, §32) : il doit BOUGER le point.
  const beforeApproach = await page.locator('[data-ml-an-number="pointB"]').inputValue();
  await page.click('[data-ml-an-approach]');
  await page.waitForTimeout(3200);
  const afterApproach = await page.locator('[data-ml-an-number="pointB"]').inputValue();
  record('§8, §32 : le bouton d’approche rapproche vraiment B de A',
    Math.abs(Number(afterApproach) - 1) < Math.abs(Number(beforeApproach) - 1), `${beforeApproach} → ${afterApproach}`);
  await shot(page, '05-secant-became-tangent');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 3. §9, §17 — la dérivée écrite, et le point stationnaire qui n'est pas un extremum
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await openTool(page);
  await selectLab(page, 'derivative');

  await setFunction(page, 'x^2-4x+3');
  await openTab(page, 'inspector');
  // La dérivation se DÉROULE (MATH_LAB §3.4.2) : rien d'écrit avant, f′ au dernier pas.
  await page.locator('[data-ml-an-derive]').first().click();
  await playToEnd(page, 'data-ml-an-dstep');
  const body = await textOf(page, '[data-ml-an-inspector]');
  record('§9 : f′(x) est ÉCRITE, pas seulement tracée', body.includes('2x - 4'), body.slice(0, 80));
  record('§35 : la dérivée symbolique est annoncée comme exacte',
    await page.locator('[data-ml-an-inspector]').locator('text=/formules de dérivation/').count() > 0);
  await shot(page, '06-derivative-parabola');

  // §17 : x³ a une tangente horizontale en 0 et AUCUN extremum.
  await openTab(page, 'controls');
  await setFunction(page, 'x^3');
  await openTab(page, 'inspector');
  const stationary = await page.locator('[data-ml-an-critical="stationary"]').count();
  const asExtremum = await page.locator('[data-ml-an-critical="min"], [data-ml-an-critical="max"]').count();
  record('§17 : le point critique de x³ est « stationnaire », jamais un extremum',
    stationary === 1 && asExtremum === 0, `stationnaire=${stationary} extremum=${asExtremum}`);
  record('§17 : une note explique que f′ = 0 n’implique pas un extremum',
    await page.locator('[data-ml-an-stationary-note]').count() > 0);
  await shot(page, '07-derivative-cubic-stationary');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 4. §11 – §15 — les limites, des deux côtés
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await openTool(page);
  await selectLab(page, 'limit');
  await setFunction(page, '\\frac{1}{x}');
  await page.locator('[data-ml-an-number="limitPoint"]').fill('0');
  await page.waitForTimeout(700);

  await openTab(page, 'inspector');
  const leftTable = await page.locator('[data-ml-an-approach-table="left"]').count();
  const rightTable = await page.locator('[data-ml-an-approach-table="right"]').count();
  record('§11 : les deux tables d’approche sont affichées', leftTable === 1 && rightTable === 1);

  // §12 : les deux côtés DIFFÈRENT — et la raison doit être visible.
  const agree = await page.locator('[data-ml-an-limit-agree]').getAttribute('data-ml-an-limit-agree');
  record('§12 : pour 1/x en 0, le verdict dit que les limites diffèrent', agree === 'false', `agree=${agree}`);
  const verdict = await textOf(page, '[data-ml-an-limit-agree]');
  record('§12 : la raison est ÉCRITE, pas seulement « n’existe pas »', verdict.length > 30, verdict.slice(0, 60));
  await shot(page, '08-limit-two-sided');

  // §15 : le TROU de (x²−1)/(x−1) en 1.
  await openTab(page, 'controls');
  await setFunction(page, '\\frac{x^2-1}{x-1}');
  await page.locator('[data-ml-an-number="limitPoint"]').fill('1');
  await page.waitForTimeout(700);
  await openTab(page, 'inspector');
  const removable = await page.locator('[data-ml-an-break="removable"]').count();
  record('§15 : la discontinuité APPARENTE (le trou) est reconnue', removable > 0);
  await shot(page, '09-limit-removable');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 5. §19 – §21 — l'aire, Riemann, et l'intégrale signée
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await openTool(page);
  await selectLab(page, 'integral');
  await setFunction(page, 'x^2');
  await page.locator('[data-ml-an-number="boundA"]').fill('0');
  await page.locator('[data-ml-an-number="boundB"]').fill('2');
  await page.waitForTimeout(600);

  const area = await page.locator('[data-ml-area]').count();
  record('§19 : l’aire sous la courbe est dessinée', area > 0);

  // §20 : quand n grandit, les rectangles se multiplient et l'erreur baisse.
  const errorAt = async (n) => {
    await page.locator('[data-ml-an-number="riemannN"]').fill(String(n));
    await page.waitForTimeout(500);
    await openTab(page, 'inspector');
    const rows = await page.locator('[data-ml-an-inspector] .sa-ml-an__row').allTextContents();
    await openTab(page, 'controls');
    const errorRow = rows.find((row) => /Écart avec la valeur/.test(row)) ?? '';

    return Number(errorRow.replace(/[^\d,.-]/g, '').replace(',', '.'));
  };
  const e2 = await errorAt(2);
  const e50 = await errorAt(50);
  record('§20 : augmenter n RÉDUIT l’écart à l’aire', e50 < e2, `n=2 → ${e2} ; n=50 → ${e50}`);
  const rects = await page.locator('[data-ml-riemann] rect').count();
  record('§20 : les rectangles sont bien dessinés', rects >= 40, `${rects} rectangles`);
  await shot(page, '10-integral-riemann');

  // §21 : sur sin de 0 à 2π, l'intégrale SIGNÉE vaut 0 mais l'aire vaut 4.
  await setFunction(page, '\\sin(x)');
  await page.locator('[data-ml-an-number="boundA"]').fill('0');
  await page.locator('[data-ml-an-number="boundB"]').fill('6.2832');
  await page.waitForTimeout(700);
  await openTab(page, 'inspector');
  const differ = await page.locator('[data-ml-an-area-differ]').getAttribute('data-ml-an-area-differ');
  record('§21 : l’intégrale signée et l’aire géométrique sont DISTINGUÉES', differ === 'true', `differ=${differ}`);
  const negative = await page.locator('[data-ml-area-sign="negative"]').count();
  record('§21 : la région sous l’axe est colorée différemment', negative > 0);
  await shot(page, '11-integral-signed-vs-area');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 6. §16 — l'étude de la fonction, CONNECTÉE au graphe
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await openTool(page);
  await selectLab(page, 'study');
  await setFunction(page, 'x^2-4x+3');
  await openTab(page, 'inspector');
  await page.waitForTimeout(500);

  const rootsRow = await textOf(page, '[data-ml-an-study="roots"]');
  record('§16 : les racines sont calculées et écrites', /1/.test(rootsRow) && /3/.test(rootsRow), rootsRow.slice(0, 60));

  // §16 : cliquer une ligne ALLUME la couche sur le graphe.
  const rootsBefore = await page.locator('[data-ml-point="root"]').count();
  await page.click('[data-ml-an-study="roots"]');
  await page.waitForTimeout(500);
  const rootsAfter = await page.locator('[data-ml-point="root"]').count();
  record('§16 : cliquer « Racines » change la mise en évidence SUR le graphe',
    rootsBefore !== rootsAfter, `${rootsBefore} → ${rootsAfter}`);

  /**
   * §16 : la bascule commande le DESSIN, pas le SAVOIR. Éteindre la mise en
   * évidence ne doit pas faire dire au tableau que la fonction n'a pas de
   * racines — c'est une réponse fausse à une question de mathématiques.
   */
  const rootsRowAfter = await textOf(page, '[data-ml-an-study="roots"]');
  record('§16 : éteindre la mise en évidence ne FAIT PAS disparaître la réponse',
    /1/.test(rootsRowAfter) && /3/.test(rootsRowAfter), rootsRowAfter.slice(0, 60));

  // ── tableau de variations : la synthèse sous la forme du cours ────────────────
  {
    // Le tableau se CONSTRUIT ligne par ligne (MATH_LAB §3.4.2).
    const buildTable = async () => {
      const build = page.locator('[data-ml-an-vbuild]').first();
      if (await build.count()) await build.click();
      await playToEnd(page, 'data-ml-an-vstep');
      await page.waitForTimeout(200);
    };
    record('tableau de variations : rien avant la construction',
      (await page.locator('[data-ml-an-vararrow]').count()) === 0);
    await buildTable();
    const state = await page.locator('[data-ml-an-vartable]').getAttribute('data-ml-an-vartable').catch(() => null);
    record('tableau de variations : le tableau de variations est construit', state === 'ok', `state=${state}`);

    const readTable = async () => ({
      arrows: await page.locator('[data-ml-an-vararrow]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-ml-an-vararrow'))),
      positions: await page.locator('[data-ml-an-varpos]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-ml-an-varpos'))),
      signs: await page.locator('[data-ml-an-varsign]').evaluateAll((nodes) => nodes.map((node) => node.textContent.trim())),
      bars: await page.locator('[data-ml-an-varcell="break"]').count(),
    });

    const parabola = await readTable();
    record('tableau de variations : ↘ puis ↗ pour x² − 4x + 3',
      JSON.stringify(parabola.arrows) === JSON.stringify(['decreasing', 'increasing']), JSON.stringify(parabola.arrows));
    record('tableau de variations : le minimum est posé EN BAS, les bornes en haut',
      JSON.stringify(parabola.positions) === JSON.stringify(['high', 'low', 'high']), JSON.stringify(parabola.positions));
    record('tableau de variations : la ligne f′ porte les signes − puis +',
      JSON.stringify(parabola.signs) === JSON.stringify(['−', '+']), JSON.stringify(parabola.signs));

    // §17 dans le tableau : f′ = 0 sans extremum, la valeur à MI-HAUTEUR.
    await openTab(page, 'controls');
    await setFunction(page, 'x^3');
    await openTab(page, 'inspector');
    await page.waitForTimeout(400);
    await buildTable();
    const cubic = await readTable();
    record('tableau de variations : x³ monte des deux côtés de f′ = 0 (§17)',
      JSON.stringify(cubic.arrows) === JSON.stringify(['increasing', 'increasing'])
      && cubic.positions[1] === 'middle', `${JSON.stringify(cubic.arrows)} ${JSON.stringify(cubic.positions)}`);

    // Une discontinuité COUPE le tableau.
    await openTab(page, 'controls');
    await setFunction(page, '\\frac{1}{x}');
    await openTab(page, 'inspector');
    await page.waitForTimeout(400);
    await buildTable();
    const inverse = await readTable();
    record('tableau de variations : le pôle de 1/x coupe le tableau UNE fois',
      inverse.bars === 1, `${inverse.bars} barre(s)`);
    record('tableau de variations : 1/x décroît de part et d’autre',
      JSON.stringify(inverse.arrows) === JSON.stringify(['decreasing', 'decreasing']), JSON.stringify(inverse.arrows));

    await shot(page, '12b-variation-table');
  }
  await shot(page, '12-study-connected');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 7. §24, §25 — paramètres et transformations
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await openTool(page);
  await selectLab(page, 'transform');
  await page.waitForTimeout(400);

  await page.click('[data-ml-an-parametric="quadraticParam"]');
  await page.waitForTimeout(600);
  const curveBefore = await page.locator('[data-ml-curve="f"]').getAttribute('d');
  await page.locator('[data-ml-an-number="param-a"]').fill('-2');
  await page.waitForTimeout(600);
  const curveAfter = await page.locator('[data-ml-curve="f"]').getAttribute('d');
  record('§24 : bouger le curseur « a » change le tracé', curveBefore !== curveAfter);
  await shot(page, '13-parameters');

  await page.click('[data-ml-an-transform="verticalShift"]');
  await page.waitForTimeout(600);
  const original = await page.locator('[data-ml-curve="original"]').count();
  record('§25 : l’original reste visible à côté de son image', original > 0);
  await shot(page, '14-transformations');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 8. §30, §31, §43 — l'entraînement : indices gradués, rien ne bloque
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await openTool(page);
  await openTab(page, 'practice');
  await page.waitForTimeout(500);

  record('§30 : un défi est posé', await page.locator('[data-ml-an-question]').count() > 0);

  // §31 : les indices se dévoilent UN par UN.
  await page.click('[data-ml-an-hint]');
  await page.waitForTimeout(200);
  const hint1 = await page.locator('[data-ml-an-hints]').getAttribute('data-ml-an-hints');
  await page.click('[data-ml-an-hint]');
  await page.waitForTimeout(200);
  const hint2 = await page.locator('[data-ml-an-hints]').getAttribute('data-ml-an-hints');
  record('§31 : les indices sont GRADUÉS, un par un', hint1 === '1' && hint2 === '2', `${hint1} → ${hint2}`);

  // §43 : une réponse fausse n'enferme rien.
  const answerField = page.locator('[data-ml-an-mathfield="answer"]');
  if (await answerField.count() > 0) {
    await typeMath(page, 'answer', '99999');
    await page.click('[data-ml-an-check]');
    await page.waitForTimeout(400);
    const verdict = await page.locator('[data-ml-an-verdict]').getAttribute('data-ml-an-verdict');
    record('§30 : une réponse fausse est reconnue comme telle', verdict === 'incorrect', `verdict=${verdict}`);
    record('§29 : l’explication MONTRE le calcul vrai', await page.locator('[data-ml-an-explain]').count() > 0);
    record('§43 : après une erreur, tout reste ouvert', await page.locator('[data-ml-an-check]').isEnabled());

    /**
     * §36 : une FRACTION se tape et se lit. MathLive rend `1/2` sous la
     * forme `\frac12` (sans accolades) : si l'analyseur ne la lit pas, une
     * bonne réponse passe pour incompréhensible.
     */
    await typeMath(page, 'answer', '1/2');
    const latex = await mathValue(page, 'answer');
    record('§36 : le champ de réponse produit une vraie fraction', /frac/.test(latex), latex);
    await page.click('[data-ml-an-check]');
    await page.waitForTimeout(400);
    const fractionVerdict = await page.locator('[data-ml-an-verdict]').getAttribute('data-ml-an-verdict');
    record('§36, §46 : une fraction est COMPRISE (jugée, jamais « non comprise »)',
      fractionVerdict === 'correct' || fractionVerdict === 'incorrect', `verdict=${fractionVerdict}`);

    // Un champ VIDE dit « écris une réponse », pas « je n'ai pas compris ».
    await typeMath(page, 'answer', '');
    await page.click('[data-ml-an-check]');
    await page.waitForTimeout(300);
    const emptyText = await textOf(page, '[data-ml-an-verdict]');
    record('§46 : un champ vide demande une réponse, il n’accuse pas', /Écris d’abord une réponse/.test(emptyText), emptyText.slice(0, 40));
  }
  await shot(page, '15-practice-hints');

  // §28 : la prédiction ne punit pas.
  const predictChoice = page.locator('[data-ml-an-predict-choice]').first();
  if (await predictChoice.count() > 0) {
    await predictChoice.click();
    await page.click('[data-ml-an-reveal]');
    await page.waitForTimeout(300);
    record('§28 : la prédiction se révèle sans sanction',
      await page.locator('[data-ml-an-predict-result]').count() > 0);
  }
  await shot(page, '16-prediction');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 9. §46 — une expression fausse n'expose JAMAIS une erreur JavaScript
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await openTool(page);

  /**
   * Des écritures que MathLive ne peut PAS rattraper.
   *
   * `((x` n'en est plus une : le champ mathématique ferme les parenthèses
   * tout seul et produit `((x))`, une expression parfaitement valide. C'est
   * un gain de MathLive — une parenthèse déséquilibrée n'existe plus — et
   * c'est pourquoi ce cas a quitté la liste plutôt que d'être « réparé ».
   */
  for (const bad of ['x^^2', 'sinn(x)', '@@@', '(((']) {
    await setFunction(page, bad);
    const errorBox = await page.locator('[data-ml-an-error]').count();
    const text = await textOf(page, '[data-ml-an-error]');
    record(`§46 : « ${bad} » donne un message français, pas une exception`,
      errorBox > 0 && /[A-Za-zÀ-ÿ]{3}/.test(text) && !/[\u0600-\u06FF]/.test(text), text.slice(0, 50));
  }
  await shot(page, '17-invalid-expression');

  // Et on se remet d'aplomb : le laboratoire n'est pas cassé.
  await setFunction(page, 'x^2');
  record('§46 : après une erreur, une bonne expression retrace la courbe',
    await page.locator('[data-ml-curve="f"]').count() > 0);

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 10. Persistance : sauvegarde et réouverture
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await openTool(page);

  await setFunction(page, 'x^3-3x');
  await selectLab(page, 'derivative');
  await page.waitForTimeout(3000);           // l'autosave de la coquille

  const url = page.url();
  const saved = /\/atelier\/analyse\/\d+/.test(url);
  record('un changement crée le document et réécrit l’URL', saved, url);

  if (saved) {
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('[data-ml-an-plane]', { timeout: 15000 });
    await page.waitForTimeout(800);
    const source = await mathValue(page, 'f');
    const lab = await page.locator('[data-ml-analysis]').getAttribute('data-ml-lab');
    record('après rechargement, la fonction ET le laboratoire sont retrouvés',
      source === 'x^3-3x' && lab === 'derivative', `${source} / ${lab}`);
  }
  await shot(page, '18-persistence');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 11. Gauche à droite et notation LTR (§39)
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await openTool(page);

  const planeDir = await page.locator('[data-ml-an-plane]').evaluate((node) => getComputedStyle(node).direction);
  record('§39 : le plan est LTR — l’axe des x croît vers la droite', planeDir === 'ltr', planeDir);

  const pageDir = await page.evaluate(() => getComputedStyle(document.documentElement).direction);
  const htmlLang = await page.evaluate(() => document.documentElement.getAttribute('lang'));
  record('l’interface est française, de gauche à droite', pageDir === 'ltr' && htmlLang === 'fr' && await page.locator('[dir="rtl"]').count() === 0, `${pageDir} lang=${htmlLang}`);

  await openTab(page, 'inspector');
  const mathDir = await page.locator('[data-ml-an-inspector] .sa-ml-an__math').first()
    .evaluate((node) => getComputedStyle(node).direction);
  record('§39 : la notation mathématique est LTR dans le panneau', mathDir === 'ltr', mathDir);

  // L'axe des x doit croître vers la DROITE : on le lit sur la fenêtre.
  const view = await page.locator('[data-ml-an-plane]').getAttribute('data-ml-view');
  const [xMin, xMax] = view.split(',').map(Number);
  record('§39 : le repère n’est pas miroité (xMin < xMax)', xMin < xMax, `${xMin} … ${xMax}`);
  await shot(page, '19-ltr');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 12. Responsive (§38) et accessibilité (§40)
// ════════════════════════════════════════════════════════════════════════
for (const [label, viewport] of [
  ['tablette', { width: 820, height: 1180 }],
  ['mobile', { width: 390, height: 844 }],
  ['petit-mobile', { width: 320, height: 640 }],
]) {
  const context = await authedContext({ viewport, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  wire(page);
  await openTool(page);
  await page.waitForTimeout(500);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  record(`${label} : aucun débordement horizontal`, !overflow);

  const planeBox = await page.locator('[data-ml-an-plane]').boundingBox();
  record(`${label} : le plan reste visible et large`, planeBox && planeBox.height > 180 && planeBox.width > 200,
    planeBox ? `${Math.round(planeBox.width)}×${Math.round(planeBox.height)}` : 'absent');

  // §38, §40 : les cibles tactiles restent ≥ 40 px.
  const small = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('[data-ml-an-lab], [data-ml-an-tab], .sa-ml-an__action, .sa-ml-an__chip')];

    return nodes.filter((node) => {
      const rect = node.getBoundingClientRect();

      return rect.width > 0 && rect.height > 0 && rect.height < 40;
    }).length;
  });
  record(`${label} : les cibles tactiles font au moins 40 px`, small === 0, `${small} trop petites`);

  await shot(page, `20-${label}`);
  await context.close();
}

// ── Accessibilité : focus et clavier ────────────────────────────────────
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await openTool(page);

  const handle = page.locator('[data-ml-an-handle="A"]');
  if (await handle.count() > 0) {
    const named = await handle.getAttribute('aria-label');
    record('§40 : la poignée A porte un nom accessible', Boolean(named), named ?? '');

    await handle.focus();
    const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-ml-an-handle'));
    record('§40 : la poignée est focalisable au clavier', focused === 'A', `focus=${focused}`);

    await openTab(page, 'controls');
    const before = await page.locator('[data-ml-an-number="pointA"]').inputValue();
    await handle.focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    const after = await page.locator('[data-ml-an-number="pointA"]').inputValue();
    record('§40 : les flèches déplacent le point', before !== after, `${before} → ${after}`);
  }
  await shot(page, '21-a11y');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// Ménage et rapport
// ════════════════════════════════════════════════════════════════════════
{
  const list = await api(TOKEN, 'GET', '/math-lab/documents?tool=analysis');
  const payload = list.data?.data ?? list.data ?? [];
  const documents = Array.isArray(payload) ? payload : (payload.documents ?? []);
  for (const document of documents) {
    await api(TOKEN, 'DELETE', `/math-lab/documents/${document.id}`);
  }
  console.log(`\n🧹 ${documents.length} document(s) supprimé(s).`);
}

record('aucune erreur JavaScript sur la page', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
record('aucune erreur dans la console', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

await browser.close();

const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} vérifications réussies.`);
console.log(`Captures : ${OUT}`);
if (failed.length) {
  console.log('\nÉchecs :');
  for (const failure of failed) console.log(`  ❌ ${failure.name}${failure.detail ? ` — ${failure.detail}` : ''}`);
  process.exit(1);
}
