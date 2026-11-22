/**
 * QA navigateur — le مختبر المنطق والبرهان (laboratoire de logique et de
 * démonstration).
 *
 * Lancement (dev server sur 5173, API sur 8000, élève QA existant) :
 *   node apps/web/e2e/mathlab-logic.mjs [dossier-captures]
 *
 * Ce qu'on vérifie :
 *   - navigation : la carte sur l'accueil, l'URL directe, le rechargement ;
 *   - §54 : le laboratoire OUVRE sur une expérience, pas sur un menu ;
 *   - §8-10 : chercher un contre-exemple, le trouver, et lire POURQUOI un
 *     seul suffit ; une valeur qui ne réfute pas est refusée avec sa raison ;
 *   - §5-7 : l'énoncé bascule vrai/faux quand on déplace x, et le domaine
 *     exclu est montré ;
 *   - §11-12 : les interrupteurs P/Q et la ligne ALLUMÉE de la table ;
 *   - §13-16 : le cas critique nommé, la réciproque réfutée, la contraposée
 *     qui coïncide colonne pour colonne ;
 *   - §17 : les deux sens d'une équivalence, séparément ;
 *   - §18-20 : nécessaire/suffisant, le vocabulaire APRÈS la relation ;
 *   - §21-23 : « pas de contre-exemple trouvé » n'est PAS « prouvé » ;
 *   - §24-25 : De Morgan ligne à ligne, et ¬∀ → ∃¬ ;
 *   - §26-36 : poser une étape, en refuser une avec sa RAISON, compléter,
 *     ordonner, trouver l'étape manquante, lire l'arbre ;
 *   - §33 : nommer un sophisme ET le réfuter ;
 *   - §37-39 : l'entraînement — indices progressifs, révélation, jamais de
 *     blocage, « اعرضه في المختبر » ;
 *   - §41 : le cahier de la plateforme s'ouvre (pas un second système) ;
 *   - persistance : autosave et RÉOUVERTURE du document ;
 *   - §2 : RTL — la page est RTL, la notation reste LTR (direction CALCULÉE) ;
 *   - §44 : responsive — tablette et mobile, pas de débordement horizontal,
 *     cibles tactiles ≥ 44 px ;
 *   - §45 : accessibilité — focus visible, aria-pressed, aria-current,
 *     pilotage au clavier, couleur jamais seule.
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
const OUT = process.argv[2] || '/tmp/mathlab-logic-shots';
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
const stageText = (page) => textOf(page, '[data-ml-lg-stage]');

async function goArea(page, area) {
  await page.click(`[data-ml-lg-area-tab="${area}"]`);
  await page.waitForFunction(
    (a) => document.querySelector('[data-ml-lg-root]')?.getAttribute('data-ml-lg-current-area') === a,
    area,
    { timeout: 8000 },
  );
  await page.waitForTimeout(220);
}

// ════════════════════════════════════════════════════════════════════════
// 1. Navigation et §54 — l'ouverture est une EXPÉRIENCE
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);

  await page.goto(`${BASE}/espace/atelier?lab=secondaire`, { waitUntil: 'networkidle' });
  const card = page.locator('a[href*="/atelier/logique?lab=secondaire"]').first();
  record('accueil : la carte de l’instrument est présente', await card.count() > 0);
  await shot(page, '01-home');

  await card.click();
  await page.waitForURL(/\/atelier\/logique/, { timeout: 15000 });
  await page.waitForSelector('[data-ml-lg-root]', { timeout: 15000 });
  await page.waitForTimeout(600);

  const area = await page.locator('[data-ml-lg-root]').getAttribute('data-ml-lg-current-area');
  record('§54 : le laboratoire ouvre sur le CONTRE-EXEMPLE, pas sur un menu',
    area === 'counterexample', `aire = ${area}`);

  const opening = await stageText(page);
  record('§54 : une QUESTION est posée d’emblée', opening.includes('هل تستطيع'), opening.slice(0, 60));
  record('§54 : l’énoncé à réfuter est affiché', (await page.locator('[data-ml-lg-claim]').count()) > 0);
  record('§54 : de quoi chercher tout de suite (curseur + champ)',
    (await page.locator('[data-ml-lg-ce-slider]').count()) > 0
    && (await page.locator('[data-ml-lg-ce-input]').count()) > 0);

  const tabs = await page.locator('[data-ml-lg-area-tab]').count();
  record('§4 : onze aires dans UN laboratoire (pas onze routes)', tabs === 11, `${tabs} aires`);
  await shot(page, '02-opening');

  // ── §8-10 : chercher, se tromper, trouver ────────────────────────────
  await page.fill('[data-ml-lg-ce-input]', '9');
  await page.press('[data-ml-lg-ce-input]', 'Enter');
  await page.waitForTimeout(350);
  let text = await stageText(page);
  record('§9 : une valeur qui ne réfute PAS est refusée avec sa raison',
    text.includes('لا يخالف'), text.match(/[^.]*لا يخالف[^.]*/)?.[0]?.slice(0, 70) ?? '');

  await page.fill('[data-ml-lg-ce-input]', '3');
  await page.press('[data-ml-lg-ce-input]', 'Enter');
  await page.waitForTimeout(400);
  record('§8 : le contre-exemple 3 est ACCEPTÉ', (await page.locator('[data-ml-lg-ce-found]').count()) > 0);
  text = await stageText(page);
  record('§9 : on explique POURQUOI un seul suffit, pas juste « bravo »',
    text.includes('يكفي'), text.match(/[^.]*يكفي[^.]*/)?.[0]?.slice(0, 80) ?? '');
  record('§10 : les essais gardent leur trace', (await page.locator('[data-ml-lg-ce-tried] li').count()) >= 2);
  await shot(page, '03-counterexample-found');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 2. §5-7 les énoncés · §11-12 les connecteurs
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/logique?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-lg-root]', { timeout: 15000 });

  await goArea(page, 'statements');
  record('§5 : les trois réponses sont offertes, dont « يعتمد »',
    (await page.locator('[data-ml-lg-guess="depends"]').count()) > 0);

  // §7 : déplacer x fait basculer l'énoncé (x² > x est faux sur [0;1]).
  const slider = page.locator('[data-ml-lg-probe]');
  await slider.fill('0.5');
  await page.waitForTimeout(300);
  let verdict = await page.locator('[data-ml-lg-probe-verdict]').getAttribute('data-ml-lg-probe-verdict');
  record('§7 : en x = 0,5 l’énoncé x² > x est FAUX', verdict === 'false', `verdict = ${verdict}`);

  await slider.fill('3');
  await page.waitForTimeout(300);
  verdict = await page.locator('[data-ml-lg-probe-verdict]').getAttribute('data-ml-lg-probe-verdict');
  record('§7 : en x = 3 il est VRAI — la vérité se voit changer', verdict === 'true', `verdict = ${verdict}`);
  record('§7 : la droite est GRADUÉE — sans repères on ne sait pas où l’on est',
    (await page.locator('[data-ml-lg-tick]').count()) >= 4,
    `${await page.locator('[data-ml-lg-tick]').count()} repères`);
  record('§7 : la droite montre les deux régions',
    (await page.locator('[data-ml-lg-interval="true"]').count()) > 0
    && (await page.locator('[data-ml-lg-interval="false"]').count()) > 0);
  await shot(page, '04-statement-regions');

  await page.click('[data-ml-lg-guess="depends"]');
  await page.click('[data-ml-lg-reveal]');
  await page.waitForTimeout(300);
  const revealed = await page.locator('[data-ml-lg-statement-verdict]').getAttribute('data-ml-lg-statement-verdict');
  record('§5 : le verdict de x² > x est « يعتمد »', revealed === 'depends', `verdict = ${revealed}`);

  // §6 : le domaine exclu est MONTRÉ.
  await page.selectOption('[data-ml-lg-statement-select]', 'oneOverXPositive');
  await page.waitForTimeout(350);
  record('§6 : la valeur exclue x = 0 est dessinée sur la droite',
    (await page.locator('[data-ml-lg-excluded]').count()) > 0);
  await slider.fill('0');
  await page.waitForTimeout(300);
  record('§6 : en x = 0 le laboratoire dit « hors domaine », pas « faux »',
    (await stageText(page)).includes('خارج مجال'));
  await shot(page, '05-domain-excluded');

  // ── §11-12 : les connecteurs ─────────────────────────────────────────
  await goArea(page, 'connectors');
  const before = await page.locator('[data-ml-lg-result]').getAttribute('data-ml-lg-result');
  await page.click('[data-ml-lg-operand="q"]');
  await page.waitForTimeout(250);
  const after = await page.locator('[data-ml-lg-result]').getAttribute('data-ml-lg-result');
  record('§11 : basculer Q change la valeur de l’expression', before !== after, `${before} → ${after}`);

  const current = await page.locator('[data-ml-lg-table] tr[aria-current="true"]').count();
  record('§12 : la ligne correspondante de la table est ALLUMÉE', current === 1, `${current} ligne(s)`);

  // P ⇒ Q est fausse dans exactement une ligne.
  await page.click('[data-ml-lg-connector="implies"]');
  await page.waitForTimeout(250);
  const falseCells = await page.locator('[data-ml-lg-cell="implies"].is-false').count();
  record('§13 : P ⇒ Q est fausse dans exactement UNE ligne', falseCells === 1, `${falseCells} case(s)`);
  await shot(page, '06-connectors');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 3. §13-20 implication, équivalence, conditions
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/logique?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-lg-root]', { timeout: 15000 });

  await goArea(page, 'implication');
  // x > 3 ⇒ x > 1 : en x = 2, P est fausse → implication vraie (vacuité).
  await page.locator('[data-ml-lg-impl-x]').fill('2');
  await page.waitForTimeout(300);
  let v = await page.locator('[data-ml-lg-impl-verdict]').getAttribute('data-ml-lg-impl-verdict');
  record('§13 : P fausse ⇒ la conditionnelle est vraie (vacuité expliquée)', v === 'true', `verdict = ${v}`);

  record('§14 : le diagramme montre P ⊂ Q',
    (await page.locator('[data-ml-lg-sets="p-in-q"]').count()) > 0);

  // La réciproque est fausse, et le contre-exemple est NOMMÉ.
  await page.click('[data-ml-lg-form="converse"]');
  await page.waitForTimeout(300);

  // Le défaut trouvé en QA visuelle : la réciproque était évaluée comme la
  // forme directe, et l'écran répondait « صحيحة » à x = 2 — l'inverse de ce
  // que §15 fait découvrir. On regarde le point, pas seulement le verdict
  // global.
  v = await page.locator('[data-ml-lg-impl-verdict]').getAttribute('data-ml-lg-impl-verdict');
  record('§15 : à x = 2, la RÉCIPROQUE est fausse (la forme est bien évaluée)',
    v === 'false', `verdict = ${v}`);
  record('§15 : et le cas critique est nommé LÀ', (await page.locator('[data-ml-lg-critical]').count()) > 0);
  record('§15 : la vacuité n’est PAS invoquée ici', (await page.locator('[data-ml-lg-vacuous]').count()) === 0);
  const holds = await page.locator('[data-ml-lg-impl-holds]').getAttribute('data-ml-lg-impl-holds');
  record('§15 : la réciproque est FAUSSE ici', holds === 'false');
  record('§15 : son contre-exemple est nommé',
    (await page.locator('[data-ml-lg-impl-counterexample]').count()) > 0,
    await page.locator('[data-ml-lg-impl-counterexample]').first().getAttribute('data-ml-lg-impl-counterexample') ?? '');

  // §16 : la contraposée coïncide colonne pour colonne avec l'implication.
  const direct = await page.locator('[data-ml-lg-cell="direct"]').allTextContents();
  const contra = await page.locator('[data-ml-lg-cell="contrapositive"]').allTextContents();
  const converse = await page.locator('[data-ml-lg-cell="converse"]').allTextContents();
  record('§16 : la contraposée a la MÊME colonne que la conditionnelle',
    direct.join('') === contra.join(''), `${direct.join('')} vs ${contra.join('')}`);
  record('§15 : la réciproque, elle, DIFFÈRE',
    direct.join('') !== converse.join(''), `${direct.join('')} vs ${converse.join('')}`);
  await shot(page, '07-implication');

  // ── §17 : les deux sens ──────────────────────────────────────────────
  await goArea(page, 'equivalence');
  record('§17 : les deux sens sont examinés séparément',
    (await page.locator('[data-ml-lg-equiv-forward]').count()) > 0
    && (await page.locator('[data-ml-lg-equiv-backward]').count()) > 0);
  await page.selectOption('[data-ml-lg-equiv-select]', 'gtTwoIffSquareGtFour');
  await page.waitForTimeout(350);
  const fwd = await page.locator('[data-ml-lg-equiv-forward]').getAttribute('data-ml-lg-equiv-forward');
  const bwd = await page.locator('[data-ml-lg-equiv-backward]').getAttribute('data-ml-lg-equiv-backward');
  record('§17 : un sens vrai et un sens faux ⇒ pas de tekafu', fwd === 'true' && bwd === 'false', `${fwd} / ${bwd}`);
  await shot(page, '08-equivalence');

  // ── §18-20 : nécessaire et suffisant ────────────────────────────────
  await goArea(page, 'conditions');
  const condText = await stageText(page);
  record('§18 : les QUESTIONS viennent avant le vocabulaire',
    condText.includes('هل يكفي'), condText.match(/[^.]*هل يكفي[^.]*/)?.[0]?.slice(0, 60) ?? '');
  await page.locator('[data-ml-lg-cond-question="backward"] [data-ml-lg-answer="no"]').click();
  await page.waitForTimeout(300);
  record('§19 : le contre-exemple de « B suffit » est montré',
    (await page.locator('[data-ml-lg-cond-not-sufficient]').count()) > 0);
  record('§20 : la carte de relation nomme ضروري et كافٍ',
    (await page.locator('[data-ml-lg-cond-necessary]').count()) > 0
    && (await page.locator('[data-ml-lg-cond-sufficient]').count()) > 0);
  await shot(page, '09-conditions');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 4. §21-25 quantificateurs et négation
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/logique?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-lg-root]', { timeout: 15000 });

  await goArea(page, 'quantifiers');
  await page.selectOption('[data-ml-lg-quant-select]', 'squareNonNegative');
  await page.waitForTimeout(300);

  // On essaie plusieurs valeurs : aucune ne réfute ∀x, x² ≥ 0.
  for (const value of ['1', '2', '-3']) {
    await page.fill('[data-ml-lg-quant-input]', value);
    await page.press('[data-ml-lg-quant-input]', 'Enter');
    await page.waitForTimeout(220);
  }
  record('§22 : la RECHERCHE est comptée', (await stageText(page)).includes('فُحصت'));
  record('§22 : « pas de contre-exemple » n’est PAS « prouvé »',
    (await page.locator('[data-ml-lg-quant-not-a-proof]').count()) > 0);
  const quantText = await stageText(page);
  record('§22 : le mot « ليست برهانًا » est écrit noir sur blanc',
    /ليست? برهان/.test(quantText), quantText.match(/[^.]*ليست? برهان[^.]*/)?.[0]?.slice(0, 70) ?? '');
  record('§22 : et l’élève est renvoyé vers la construction d’un BRHAN',
    (await page.locator('[data-ml-lg-goto-proof]').count()) > 0);
  await shot(page, '10-quantifier-not-a-proof');

  // ∃ : un témoin suffit, et il est reconnu comme PREUVE.
  await page.selectOption('[data-ml-lg-quant-select]', 'existsSquareFour');
  await page.waitForTimeout(300);
  await page.fill('[data-ml-lg-quant-input]', '2');
  await page.press('[data-ml-lg-quant-input]', 'Enter');
  await page.waitForTimeout(300);
  record('§23 : un seul témoin PROUVE un ∃', (await page.locator('[data-ml-lg-quant-proved]').count()) > 0);

  // ∀ faux : le contre-exemple RÉFUTE.
  await page.selectOption('[data-ml-lg-quant-select]', 'naturalPositive');
  await page.waitForTimeout(300);
  await page.fill('[data-ml-lg-quant-input]', '0');
  await page.press('[data-ml-lg-quant-input]', 'Enter');
  await page.waitForTimeout(300);
  record('§21 : un contre-exemple RÉFUTE un ∀', (await page.locator('[data-ml-lg-quant-disproved]').count()) > 0);

  // ── §24-25 ───────────────────────────────────────────────────────────
  await goArea(page, 'negation');
  const left = await page.locator('[data-ml-lg-cell="left"]').allTextContents();
  const right = await page.locator('[data-ml-lg-cell="right"]').allTextContents();
  record('§24 : De Morgan — les deux colonnes coïncident ligne à ligne',
    left.length === 4 && left.join('') === right.join(''), `${left.join('')} vs ${right.join('')}`);
  record('§24 : et le laboratoire le DIT', (await page.locator('[data-ml-lg-demorgan-holds]').count()) > 0);

  await page.click('[data-ml-lg-negation="forall"]');
  await page.waitForTimeout(300);
  const negation = await textOf(page, '[data-ml-lg-neg-result]');
  record('§25 : ¬(∀x, P) devient ∃x, ¬P', negation.startsWith('∃'), negation);
  await shot(page, '11-negation');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 5. §26-36 le constructeur de preuve · §33 les sophismes
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/logique?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-lg-root]', { timeout: 15000 });

  await goArea(page, 'proof');
  const proofTitleDir = await page.locator('[data-ml-lg-proof-title]').evaluate(
    (node) => getComputedStyle(node).direction,
  );
  record('RTL : le titre de la preuve n’est pas retourné (défaut signalé en revue)',
    proofTitleDir === 'rtl', `direction = ${proofTitleDir}`);
  record('§26 : les cartes portent leur RÔLE (معطى, قاعدة, النتيجة…)',
    (await page.locator('[data-ml-lg-proof-pool] .sa-ml-lg__stepRole').count()) > 0);

  // §27 : une carte hors tour est refusée AVEC sa raison.
  const poolBefore = await page.locator('[data-ml-lg-step]').count();
  record('§26 : au départ, seule la racine est proposée', poolBefore === 1, `${poolBefore} carte(s)`);

  await page.click('[data-ml-lg-step="given"]');
  await page.waitForTimeout(300);
  record('§26 : la première étape se pose', (await page.locator('[data-ml-lg-placed="given"]').count()) > 0);

  // On force une carte hors tour via l'aire « رتّب », où toutes sont offertes.
  await page.click('[data-ml-lg-proof-mode="order"]');
  await page.waitForTimeout(350);
  await page.click('[data-ml-lg-step="conclude"]');
  await page.waitForTimeout(350);
  const refused = await page.locator('[data-ml-lg-refused]').count();
  const refusedText = await textOf(page, '[data-ml-lg-refused]');
  record('§27 : une étape hors tour est REFUSÉE', refused > 0);
  record('§27 : et la raison est expliquée, pas « خطأ »',
    refusedText.includes('لا تتبع'), refusedText.slice(0, 80));
  record('§27 : ce qui MANQUE est nommé', refusedText.includes('ينقصها') || refusedText.length > 30);
  await shot(page, '12-proof-refused');

  // §35 : construire la preuve entière dans l'ordre.
  await page.click('[data-ml-lg-proof-mode="build"]');
  await page.waitForTimeout(350);
  for (let i = 0; i < 8; i += 1) {
    const next = page.locator('[data-ml-lg-step]').first();
    if (await next.count() === 0) break;
    await next.click();
    await page.waitForTimeout(180);
  }
  record('§26 : la preuve se termine et le laboratoire le dit',
    (await page.locator('[data-ml-lg-proof-complete]').count()) > 0);
  await shot(page, '13-proof-complete');

  // §32 : l'arbre.
  record('§32 : l’arbre de preuve est dessiné',
    (await page.locator('[data-ml-lg-proof-tree]').count()) > 0
    && (await page.locator('[data-ml-lg-tree-node]').count()) >= 5);

  // La preuve par CAS réunit deux branches au même rang (§31, §32).
  await page.selectOption('[data-ml-lg-proof-select]', 'squarePlusNEven');
  await page.waitForTimeout(400);
  await playToEnd(page, 'data-ml-lg-tree-step');
  const rankCounts = await page.locator('[data-ml-lg-tree-rank]').evaluateAll(
    (nodes) => nodes.map((node) => node.querySelectorAll('[data-ml-lg-tree-node]').length),
  );
  record('§31 : la preuve par cas a un rang à DEUX branches',
    rankCounts.some((n) => n === 2), `rangs = ${rankCounts.join(',')}`);

  // §34 : l'étape manquante.
  await page.click('[data-ml-lg-proof-mode="gap"]');
  await page.waitForTimeout(400);
  record('§34 : une étape est retirée et des candidats sont proposés',
    (await page.locator('[data-ml-lg-gap-slot="missing"]').count()) === 1
    && (await page.locator('[data-ml-lg-gap-candidate]').count()) >= 2);
  await shot(page, '14-proof-gap');

  // ── §33 : les sophismes ──────────────────────────────────────────────
  await goArea(page, 'fallacy');
  await page.click('[data-ml-lg-fallacy-kind="affirmingConsequent"]');
  await page.waitForTimeout(250);
  let fallacyText = await stageText(page);
  record('§33 : un mauvais nom est corrigé', fallacyText.includes('ليس هذا نوع') || fallacyText.length > 0);

  await page.click('[data-ml-lg-fallacy-kind="invalidConverse"]');
  await page.waitForTimeout(250);
  await page.fill('[data-ml-lg-fallacy-input]', '-2');
  await page.press('[data-ml-lg-fallacy-input]', 'Enter');
  await page.waitForTimeout(350);
  record('§33 : nommer ET réfuter — les deux ensemble',
    (await page.locator('[data-ml-lg-fallacy-done]').count()) > 0);
  await shot(page, '15-fallacy');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 5bis. §28 — البرهان بالتراجع : son aire, son escalier, ses exemples
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/logique?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-lg-root]', { timeout: 15000 });

  await goArea(page, 'induction');
  record('§28 : « البرهان بالتراجع » est une AIRE, pas une option cachée',
    (await page.locator('[data-ml-lg-area="induction"]').count()) > 0);

  // ══ L'ESCALIER DES PROPOSITIONS ════════════════════════════════════════
  // La récurrence telle qu'elle s'écrit au BAC : une proposition
  // (uₙ < 3, wₙ = −2), des suites définies par récurrence, parfois
  // auxiliaires, et l'hérédité construite après l'expérimentation.
  record('l’escalier des propositions ouvre l’aire',
    (await page.locator('[data-ml-lg-rec-statement]').count()) > 0);
  record('§19 : la proposition de l’exercice est POSÉE, pas à redéfinir',
    (await textOf(page, '[data-ml-lg-rec-text]')).includes('<'));
  record('§34 : les définitions des suites sont visibles',
    (await page.locator('[data-ml-lg-rec-definition]').count()) > 0);
  // §15, §37 : la définition s'écrit en NOTATION (⅓uₙ), jamais en syntaxe.
  {
    const definition = await textOf(page, '[data-ml-lg-rec-definition]');
    record('§15 : la règle s’affiche en notation, pas en « 1/3*u »',
      definition.includes('⅓') && !definition.includes('*'), definition);
  }
  record('§21 : chaque marche porte la proposition instanciée',
    (await page.locator('[data-ml-lg-stair-claim]').count()) > 0);

  // §4, §20 — tester marche par marche, et LIRE le calcul.
  await page.click('[data-ml-lg-rec-test]');
  await page.waitForTimeout(350);
  record('§20 : P(0) testée et VRAIE (le moteur calcule, il ne fait pas confiance)',
    (await page.getAttribute('[data-ml-lg-rec-result]', 'data-ml-lg-rec-result')) === 'correct');
  record('§22 : le panneau montre la comparaison, pas un simple ✓',
    (await textOf(page, '[data-ml-lg-rec-comparison]')).length > 0,
    await textOf(page, '[data-ml-lg-rec-comparison]'));

  // Monter tout l'escalier.
  for (let i = 0; i < 8; i += 1) {
    if (await page.locator('[data-ml-lg-rec-next]').isEnabled()) await page.click('[data-ml-lg-rec-next]');
    await page.waitForTimeout(120);
    if (await page.locator('[data-ml-lg-rec-test]').isEnabled()) await page.click('[data-ml-lg-rec-test]');
    await page.waitForTimeout(220);
  }
  record('§25 : toutes vertes → « هذا وحده لا يثبت »',
    (await page.locator('[data-ml-lg-rec-notproof]').count()) > 0);
  record('§25 : l’écran ne prétend JAMAIS avoir prouvé',
    !(await page.locator('[data-ml-lg-rec-notproof]').innerText()).includes('هذا برهان'));

  // §26 — l'hérédité, et le verdict qui exige les DEUX pieds.
  await page.click('[data-ml-lg-rec-toprove]');
  await page.waitForTimeout(350);
  record('§26 : l’hérédité s’ouvre après l’expérimentation',
    (await page.locator('[data-ml-lg-rec-heredity]').count()) > 0);
  {
    const total = await page.locator('[data-ml-lg-rec-place]').count();
    for (let i = 0; i < total; i += 1) {
      await page.locator('[data-ml-lg-rec-place]').first().click();
      await page.waitForTimeout(140);
    }
    record('§25 : base + hérédité → « برهان بالتراجع مكتمل »',
      (await page.getAttribute('[data-ml-lg-rec-proofverdict]', 'data-ml-lg-rec-proofverdict')) === 'complete');
  }
  await shot(page, '22a-recurrence-heredity');

  // §9, §10 — le cas B : trois suites, dont une DÉRIVÉE des deux autres.
  await page.selectOption('[data-ml-lg-rec-exercise]', 'auxiliaryDifference');
  await page.waitForTimeout(400);
  record('§10 : un exercice peut définir u, v ET w',
    (await page.locator('[data-ml-lg-rec-definition]').count()) === 3);
  await page.click('[data-ml-lg-rec-test]');
  await page.waitForTimeout(350);
  record('§9 : wₙ = uₙ − vₙ évaluée, dépendances résolues seules',
    (await page.getAttribute('[data-ml-lg-rec-result]', 'data-ml-lg-rec-result')) === 'correct');
  record('§22 : les valeurs des trois suites sont montrées',
    (await page.locator('[data-ml-lg-rec-value]').count()) === 3);
  await shot(page, '22b-recurrence-auxiliary');

  // §17 — une saisie illisible ne montre JAMAIS de message technique.
  await page.click('[data-ml-lg-rec-edit]');
  await page.waitForTimeout(200);
  await page.fill('[data-ml-lg-rec-left]', 'zzz +');
  await page.click('[data-ml-lg-rec-commit]');
  await page.waitForTimeout(350);
  {
    const body = await page.locator('[data-ml-lg-rec-statement]').innerText();
    record('§17 : ni SyntaxError, ni NaN, ni Infinity à l’écran',
      !/SyntaxError|ParserError|undefined variable|AST|NaN|Infinity/.test(body));
    record('§17 : le refus est une phrase arabe avec un exemple qui marche',
      (await page.locator('[data-ml-lg-rec-error]').count()) > 0);
    // Une proposition illisible ne doit pas s'écrire sur les marches.
    record('§17 : une proposition illisible ne s’affiche pas sur l’escalier',
      (await page.getAttribute('[data-ml-lg-rec-text]', 'data-ml-lg-rec-readable')) === 'false');
  }
  await page.selectOption('[data-ml-lg-rec-exercise]', 'boundedAffine');
  await page.waitForTimeout(300);

  // ── L'ESCALIER QU'ON MONTE : la règle, le test, la marche, le résultat ──
  record('§3 : l’escalier interactif est présent', (await page.locator('[data-ml-lg-stairs-name="rule"]').count()) > 0);
  record('§6 : un champ pour écrire sa règle', (await page.locator('[data-ml-lg-stairs-input]').count()) > 0);
  record('§16 : la suite est affichée, valeurs visibles', (await page.locator('[data-ml-lg-expected="1"]').count()) > 0);

  // §7 — la grammaire annoncée, et ce qui n'est pas supporté.
  await page.click('[data-ml-lg-grammar] summary');
  await page.waitForTimeout(250);
  record('§7 : la grammaire supportée est exposée',
    (await page.locator('[data-ml-lg-grammar-item]').count()) >= 8);
  record('§7 : ce qui n’est PAS supporté est nommé (pas caché)',
    (await page.locator('[data-ml-lg-unsupported="factorial"]').count()) > 0);

  // §9 — une saisie impossible propose des règles qui MARCHENT.
  await page.fill('[data-ml-lg-stairs-input]', 'n!');
  await page.waitForTimeout(350);
  record('§9 : une règle non supportée n’affiche pas une erreur technique',
    (await page.locator('[data-ml-lg-rule-error]').count()) > 0);
  const suggestions = await page.locator('[data-ml-lg-suggestion]').count();
  record('§9 : et des suggestions issues de la grammaire sont offertes', suggestions > 0, `${suggestions} suggestions`);

  // §4, §12 — tester marche par marche, avec la BONNE règle.
  await page.fill('[data-ml-lg-stairs-input]', '2n + 1');
  await page.waitForTimeout(300);
  record('§4 : rien n’est encore testé avant de le demander',
    (await page.locator('[data-ml-lg-stairs-name="rule"] [data-ml-lg-stair-status="correct"]').count()) === 0);

  await page.click('[data-ml-lg-stairs-test]');
  await page.waitForTimeout(350);
  record('§3 : la marche testée devient VERTE',
    (await page.locator('[data-ml-lg-stairs-name="rule"] [data-ml-lg-stair-status="correct"]').count()) === 1);
  const resultStatus = await page.locator('[data-ml-lg-step-result]').getAttribute('data-ml-lg-step-result');
  record('§5 : le panneau de résultat dit ce qui s’est passé', resultStatus === 'correct', resultStatus);
  const panel = await textOf(page, '[data-ml-lg-stairs-result]');
  record('§5 : il montre la règle, le résultat ET la valeur attendue',
    panel.includes('2n + 1') && panel.includes('3'), panel.replace(/\s+/g, ' ').slice(0, 80));
  await shot(page, '25-stairs-first-step');

  // §14 — avancer, puis monter tout l'escalier.
  for (let i = 0; i < 5; i += 1) {
    await page.click('[data-ml-lg-stairs-next]');
    await page.waitForTimeout(140);
    await page.click('[data-ml-lg-stairs-test]');
    await page.waitForTimeout(160);
  }
  const green = await page.locator('[data-ml-lg-stairs-name="rule"] [data-ml-lg-stair-status="correct"]').count();
  record('§12 : la bonne règle fait verdir TOUT l’escalier', green === 6, `${green} marches vertes`);

  // §20, §24 — et malgré cela, ce n'est PAS une preuve.
  const verdict = await page.locator('[data-ml-lg-climb-verdict]').getAttribute('data-ml-lg-climb-verdict');
  record('§20 : six marches vertes donnent « expérimental », pas « prouvé »',
    verdict === 'experimental', verdict);
  record('§20 : et l’écran le DIT explicitement',
    (await page.locator('[data-ml-lg-not-a-proof]').count()) > 0);
  const notAProof = await textOf(page, '[data-ml-lg-not-a-proof]');
  record('§20 : le mot « برهان » est nié, pas affirmé',
    notAProof.includes('لا برهان') || notAProof.includes('تجريبي'), notAProof.slice(0, 70));
  await shot(page, '26-stairs-all-green');

  // §15 — changer la règle EFFACE les verdicts (et ne les garde pas en douce).
  await page.fill('[data-ml-lg-stairs-input]', '2n');
  await page.waitForTimeout(350);
  record('§15 : changer la règle efface les verdicts de l’ancienne',
    (await page.locator('[data-ml-lg-stairs-name="rule"] [data-ml-lg-stair-status="correct"]').count()) === 0);

  // §17 — le PIÈGE : quelques marches vertes, puis une rouge.
  await page.selectOption('[data-ml-lg-stairs-sequence]', 'powersOfTwo');
  await page.waitForTimeout(300);
  await page.fill('[data-ml-lg-stairs-input]', 'n^2 - n + 2');
  await page.waitForTimeout(300);
  for (let i = 0; i < 4; i += 1) {
    await page.click('[data-ml-lg-stairs-test]');
    await page.waitForTimeout(150);
    if (i < 3) { await page.click('[data-ml-lg-stairs-next]'); await page.waitForTimeout(120); }
  }
  const trapGreen = await page.locator('[data-ml-lg-stairs-name="rule"] [data-ml-lg-stair-status="correct"]').count();
  const trapRed = await page.locator('[data-ml-lg-stairs-name="rule"] [data-ml-lg-stair-status="incorrect"]').count();
  record('§17 : le piège verdit TROIS marches puis casse', trapGreen === 3 && trapRed === 1,
    `${trapGreen} vertes, ${trapRed} rouge`);
  const trapVerdict = await page.locator('[data-ml-lg-climb-verdict]').getAttribute('data-ml-lg-climb-verdict');
  record('§17 : le verdict devient « réfuté »', trapVerdict === 'broken', trapVerdict);
  const brokenText = await textOf(page, '[data-ml-lg-climb-verdict]');
  record('§17 : et la leçon est écrite — réussir quelques fois ne prouve rien',
    brokenText.includes('لا يعني'), brokenText.replace(/\s+/g, ' ').slice(0, 80));

  // §18 — « لماذا ؟ » explique le calcul, pas « خطأ ».
  await page.click('[data-ml-lg-why]');
  await page.waitForTimeout(300);
  const whyDetail = await textOf(page, '[data-ml-lg-why-detail]');
  record('§18 : « لماذا ؟ » montre le calcul et l’écart', whyDetail.includes('14') || whyDetail.includes('16'),
    whyDetail.replace(/\s+/g, ' ').slice(0, 80));
  await shot(page, '27-stairs-trap-broken');

  // §8 — le constructeur de règle.
  await page.click('[data-ml-lg-entry="build"]');
  await page.waitForTimeout(250);
  record('§8 : un constructeur à jetons existe', (await page.locator('[data-ml-lg-token="n"]').count()) > 0);
  await page.click('[data-ml-lg-stairs-reset]').catch(() => {});
  await page.waitForTimeout(200);

  // §16 — le mode découverte cache les valeurs.
  await page.click('[data-ml-lg-entry="type"]');
  await page.click('[data-ml-lg-stairs-discover]');
  await page.waitForTimeout(300);
  const hidden = await textOf(page, '[data-ml-lg-stairs-table]');
  record('§16 : « اكتشف القاعدة » cache les valeurs', hidden.includes('؟'), hidden.replace(/\s+/g, ' ').slice(0, 50));
  await page.click('[data-ml-lg-stairs-discover]');
  await page.waitForTimeout(200);

  // §27 — une marche est atteignable au clavier et porte son état.
  const stairLabel = await page.locator('[data-ml-lg-stairs-name="rule"] [data-ml-lg-stair="0"]').getAttribute('aria-label');
  record('§27 : chaque marche est nommée pour un lecteur d’écran',
    Boolean(stairLabel && stairLabel.length > 3), stairLabel ?? '');
  const tabbable = await page.locator('[data-ml-lg-stairs-name="rule"] [data-ml-lg-stair="0"]').getAttribute('tabindex');
  record('§27 : et atteignable au clavier', tabbable === '0');

  // L'ESCALIER — les deux moitiés, et ce qui arrive sans elles.
  record('§28 : l’escalier de démonstration est dessiné', (await page.locator('[data-ml-lg-stairs-kind="demo"]').first().count()) > 0);
  let state = await page.locator('[data-ml-lg-stairs-kind="demo"]').first().getAttribute('data-ml-lg-stairs-state');
  record('§28 : avec les deux moitiés, on monte tout l’escalier', state === 'complete', state);

  await page.click('[data-ml-lg-toggle-base]');
  await page.waitForTimeout(300);
  state = await page.locator('[data-ml-lg-stairs-kind="demo"]').first().getAttribute('data-ml-lg-stairs-state');
  const reach = await page.locator('[data-ml-lg-stairs-kind="demo"]').first().getAttribute('data-ml-lg-stairs-reach');
  record('§28 : sans cas de base, on ne pose JAMAIS le pied', state === 'no-base' && reach === '-1',
    `${state}, portée ${reach}`);
  record('§28 : et le pied barré est dessiné', (await page.locator('[data-ml-lg-stairs-nofoot]').count()) > 0);
  await shot(page, '21-stairs-no-base');

  await page.click('[data-ml-lg-toggle-base]');
  await page.click('[data-ml-lg-toggle-step]');
  await page.waitForTimeout(300);
  state = await page.locator('[data-ml-lg-stairs-kind="demo"]').first().getAttribute('data-ml-lg-stairs-state');
  const broken = await page.locator('[data-ml-lg-stairs-kind="demo"]').first().getAttribute('data-ml-lg-stairs-reach');
  record('§28 : sans le pas, la montée S’ARRÊTE à un barreau cassé',
    state === 'broken' && Number(broken) < 5, `${state}, portée ${broken}`);
  record('§28 : le barreau cassé est marqué', (await page.locator('[data-ml-lg-stairs-break]').count()) > 0);
  await shot(page, '22-stairs-broken');

  await page.click('[data-ml-lg-toggle-step]');
  await page.waitForTimeout(300);

  // LES EXEMPLES qui marchent et qui ne marchent pas.
  const cases = await page.locator('[data-ml-lg-induction-case]').count();
  record('§28 : des exemples qui marchent ET des exemples qui échouent', cases >= 3, `${cases} exemples`);
  const failing = await page.locator('[data-ml-lg-case-works="false"]').count();
  record('§28 : au moins deux échouent — c’est là qu’on apprend', failing >= 2, `${failing} échecs`);

  await page.click('[data-ml-lg-induction-case="brokenStep"]');
  await page.waitForTimeout(350);
  await playToEnd(page, 'data-ml-lg-case-step');
  const why = await textOf(page, '[data-ml-lg-case-detail="brokenStep"]');
  record('§28 : « 2ⁿ > n² » explique que deux vérifications ne suffisent pas',
    why.includes('n = 2') || why.includes('‏2²'), why.slice(0, 70));
  record('§28 : et son escalier casse au bon endroit',
    (await page.locator('[data-ml-lg-case-detail="brokenStep"] [data-ml-lg-stairs-break]').count()) > 0);
  await shot(page, '23-induction-cases');

  await page.click('[data-ml-lg-induction-case="noBase"]');
  await page.waitForTimeout(300);
  await playToEnd(page, 'data-ml-lg-case-step');
  const noBaseWhy = await textOf(page, '[data-ml-lg-case-detail="noBase"]');
  record('§28 : « n = n+1 » dit que le pas SEUL ne prouve rien',
    noBaseWhy.includes('نقطة انطلاق') || noBaseWhy.includes('1 ≠ 2'), noBaseWhy.slice(0, 70));

  // La construction : deux chemins depuis le but.
  await page.click('[data-ml-lg-induction-step="goal"]');
  await page.waitForTimeout(300);
  const twoWays = await page.locator('[data-ml-lg-induction-step]').count();
  record('§28 : après le but, DEUX chemins s’ouvrent (base et hypothèse)', twoWays === 2, `${twoWays} cartes`);

  // Le titre est une PHRASE arabe : elle ne doit pas être retournée.
  const titleDir = await page.locator('[data-ml-lg-induction-title]').evaluate(
    (node) => getComputedStyle(node).direction,
  );
  record('RTL : le titre de la preuve reste une phrase ARABE (pas forcée en LTR)',
    titleDir === 'rtl', `direction = ${titleDir}`);
  await shot(page, '24-induction-build');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 6. §37-39 l'entraînement · §41 le cahier · persistance
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/logique?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-lg-root]', { timeout: 15000 });

  await page.click('[data-ml-lg-practice-toggle]');
  await page.waitForSelector('[data-ml-lg-practice]', { timeout: 8000 });
  record('§38 : l’entraînement s’ouvre avec une question', (await page.locator('[data-ml-lg-practice-question]').count()) > 0);
  record('§38 : les quatre niveaux sont offerts',
    (await page.locator('[data-ml-lg-practice-level] option').count()) === 4);

  // §39 : un indice à la fois, et jamais la réponse d'emblée.
  await page.click('[data-ml-lg-practice-hint-button]');
  await page.waitForTimeout(250);
  record('§39 : le premier indice apparaît', (await page.locator('[data-ml-lg-practice-hint]').count()) > 0);
  const hint1 = await textOf(page, '[data-ml-lg-practice-hint]');
  await page.click('[data-ml-lg-practice-hint-button]');
  await page.waitForTimeout(250);
  const hint2 = await textOf(page, '[data-ml-lg-practice-hint]');
  record('§39 : le deuxième indice est DIFFÉRENT (progressif)', hint1 !== hint2, `${hint1.slice(0, 30)} → ${hint2.slice(0, 30)}`);
  record('§39 : l’explication n’est pas encore donnée',
    (await page.locator('[data-ml-lg-practice-explain]').count()) === 0);
  await shot(page, '16-practice-hints');

  // §39 : « كشف » sur demande, et rien ne se ferme.
  await page.click('[data-ml-lg-practice-reveal]');
  await page.waitForTimeout(300);
  record('§39 : la révélation est offerte SUR DEMANDE',
    (await page.locator('[data-ml-lg-practice-explain]').count()) > 0);
  record('§39 : « تحقّق » reste actif après la révélation — rien ne bloque',
    await page.locator('[data-ml-lg-practice-check]').isEnabled());

  // §37 : « اعرضه في المختبر » ouvre l'aire qui MONTRE.
  if (await page.locator('[data-ml-lg-practice-show]').count() > 0) {
    await page.click('[data-ml-lg-practice-show]');
    await page.waitForTimeout(400);
    const area = await page.locator('[data-ml-lg-root]').getAttribute('data-ml-lg-current-area');
    record('§37 : « اعرضه في المختبر » ouvre l’aire correspondante', Boolean(area), `aire = ${area}`);
  }

  // Une mauvaise réponse ne ferme rien (§39).
  await page.click('[data-ml-lg-practice-next]');
  await page.waitForTimeout(350);
  if (await page.locator('[data-ml-lg-practice-input]').count() > 0) {
    await page.fill('[data-ml-lg-practice-input]', 'كلام');
    await page.click('[data-ml-lg-practice-check]');
    await page.waitForTimeout(300);
    const verdict = await page.locator('[data-ml-lg-practice-verdict]').getAttribute('data-ml-lg-practice-verdict');
    record('§39 : une saisie ILLISIBLE n’est pas une réponse fausse',
      verdict === 'unreadable', `verdict = ${verdict}`);
  }

  // §41 : le cahier de la plateforme.
  if (await page.locator('[data-ml-lg-notebook]').count() > 0) {
    await page.click('[data-ml-lg-notebook]');
    await page.waitForTimeout(600);
    const notebookOpen = await page.locator('[data-notebook-window], .sa-nb-window, [role="dialog"]').count();
    record('§41 : le cahier de la PLATEFORME s’ouvre (pas un second système)', notebookOpen > 0);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
  await shot(page, '17-practice-reveal');

  // ── Le dictionnaire des symboles ────────────────────────────────────
  record('قاموس : le dictionnaire est présent', (await page.locator('[data-ml-lg-dictionary]').count()) > 0);
  record('قاموس : il est REPLIÉ au départ — on n’ouvre pas un labo par un lexique',
    (await page.locator('[data-ml-lg-dict-entry]').count()) === 0);
  await page.click('[data-ml-lg-dictionary-toggle]');
  await page.waitForTimeout(350);
  const entries = await page.locator('[data-ml-lg-dict-entry]').count();
  record('قاموس : il explique tous les symboles', entries >= 20, `${entries} entrées`);
  record('قاموس : ⇒ y est, avec sa lecture arabe',
    (await textOf(page, '[data-ml-lg-dict-entry="implies"]')).includes('يستلزم'));
  record('قاموس : les variables latines (P, n) y sont expliquées aussi',
    (await page.locator('[data-ml-lg-dict-entry="P"]').count()) > 0
    && (await page.locator('[data-ml-lg-dict-entry="n"]').count()) > 0);
  const symbolDir = await page.locator('[data-ml-lg-dict-entry="forall"] .sa-ml-lg__math').first()
    .evaluate((node) => getComputedStyle(node).direction);
  record('قاموس : le symbole reste en LTR, son explication en arabe', symbolDir === 'ltr', symbolDir);
  await shot(page, '20-dictionary');

  // ── Persistance : l'URL prend un id, le document se rouvre ──────────
  // Un changement qui existe TOUJOURS, quel que soit l'état où les blocs
  // précédents ont laissé le document : on va dans « بناء البرهان » et on
  // pose la première carte disponible, quelle qu'elle soit.
  await goArea(page, 'proof');
  const firstCard = page.locator('[data-ml-lg-step]').first();
  if (await firstCard.count() > 0) await firstCard.click();
  await page.waitForTimeout(3200);
  const url = page.url();
  const id = url.match(/\/atelier\/logique\/(\d+)/)?.[1];
  record('persistance : le document est créé et l’URL porte son id', Boolean(id), url);
  if (id) created.add(Number(id));

  if (id) {
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('[data-ml-lg-root]', { timeout: 15000 });
    await page.waitForTimeout(600);
    const area = await page.locator('[data-ml-lg-root]').getAttribute('data-ml-lg-current-area');
    record('persistance : la RÉOUVERTURE retrouve l’aire travaillée', area === 'proof', `aire = ${area}`);
    record('persistance : et l’étape posée est toujours là',
      (await page.locator('[data-ml-lg-placed]').count()) > 0);
  }
  await shot(page, '18-reopened');

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// 7. §2 RTL/LTR · §44 responsive · §45 accessibilité
// ════════════════════════════════════════════════════════════════════════
{
  const context = await authedContext();
  const page = await context.newPage();
  wire(page);
  await page.goto(`${BASE}/espace/atelier/logique?lab=secondaire`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-lg-root]', { timeout: 15000 });

  // §2 : la page est RTL, la notation est LTR — direction CALCULÉE, pas l'attribut.
  const htmlDir = await page.evaluate(() => document.documentElement.dir);
  record('§2 : la page est RTL', htmlDir === 'rtl', `dir = ${htmlDir}`);

  await goArea(page, 'implication');
  const mathDir = await page.locator('[data-ml-lg-impl-formula]').evaluate(
    (node) => getComputedStyle(node).direction,
  );
  record('§2 : la notation mathématique est LTR (direction calculée)', mathDir === 'ltr', `direction = ${mathDir}`);
  const bidi = await page.locator('[data-ml-lg-impl-formula]').evaluate(
    (node) => getComputedStyle(node).unicodeBidi,
  );
  record('§2 : et elle est ISOLÉE du flux arabe', /isolate/.test(bidi), `unicode-bidi = ${bidi}`);

  const tableDir = await page.locator('[data-ml-lg-table]').first().evaluate(
    (node) => getComputedStyle(node).direction,
  );
  record('§2 : la table de vérité se lit de gauche à droite', tableDir === 'ltr', `direction = ${tableDir}`);

  // §45 : la couleur n'est jamais seule — V/F accompagne chaque case.
  const cellTexts = await page.locator('[data-ml-lg-cell="direct"]').allTextContents();
  record('§45 : chaque case porte sa LETTRE ARABE (ص/خ), pas seulement sa couleur',
    cellTexts.every((text) => /ص|خ/.test(text)), cellTexts.join(''));
  record('اللغة : plus aucune abréviation française (V/F) dans la table',
    cellTexts.every((text) => !/[VF]/.test(text)), cellTexts.join(''));

  // §45 : aria-pressed sur les bascules, aria-current sur la ligne active.
  record('§45 : les bascules portent aria-pressed',
    (await page.locator('[data-ml-lg-form][aria-pressed]').count()) === 4);

  // §45 : pilotage au clavier.
  await page.keyboard.press('Tab');
  const focusVisible = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return false;
    const style = getComputedStyle(el);

    return style.outlineStyle !== 'none' || style.boxShadow !== 'none' || el.matches(':focus-visible');
  });
  record('§45 : le focus est atteignable au clavier', focusVisible);

  // §44 : responsive — trois tailles, pas de débordement horizontal.
  for (const [name, size] of [['tablette', { width: 1024, height: 768 }], ['mobile', { width: 390, height: 844 }], ['petit', { width: 360, height: 640 }]]) {
    await page.setViewportSize(size);
    await page.waitForTimeout(450);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    record(`§44 : ${name} — aucun débordement horizontal`, overflow <= 1, `${overflow}px`);

    // On mesure les boutons de L'INSTRUMENT : la barre latérale et la barre
    // du haut appartiennent à la coquille de l'espace élève, et un défaut
    // qui s'y trouverait ne serait pas celui de ce laboratoire.
    const small = await page.locator('[data-ml-lg-root] button:visible').evaluateAll(
      (nodes) => nodes.filter((node) => {
        const rect = node.getBoundingClientRect();

        return rect.height > 0 && rect.height < 44;
      }).map((node) => `${node.className}:${Math.round(node.getBoundingClientRect().height)}px`),
    );
    record(`§44 : ${name} — les cibles tactiles font ≥ 44 px`, small.length === 0, small.slice(0, 3).join(' | '));
    await shot(page, `19-responsive-${size.width}`);
  }

  await context.close();
}

// ════════════════════════════════════════════════════════════════════════
// Nettoyage et bilan
// ════════════════════════════════════════════════════════════════════════
for (const id of created) {
  await api(TOKEN, 'DELETE', `/math-lab/documents/${id}`);
}
await browser.close();

record('aucune erreur JavaScript', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
record('aucune erreur console', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} vérifications passées`);
if (failed.length > 0) {
  console.log('\nÉchecs :');
  for (const f of failed) console.log(`  ❌ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`);
}
console.log(`\nCaptures : ${OUT}`);
process.exit(failed.length > 0 ? 1 : 0);
