/**
 * QA navigateur — الاحتمالات والإحصاء (probabilités & statistiques) du مختبر الرياضيات.
 *
 * Lancement (dev server sur 5173, API sur 8000, élève QA existant) :
 *   node apps/web/e2e/mathlab-probability.mjs [dossier-captures]
 *
 * Ce qu'on vérifie :
 *   - navigation : la carte sur l'accueil, l'URL directe, le rechargement,
 *     le visiteur non connecté, l'absence de « قريبًا » pour l'instrument ;
 *   - la première visite : la pièce, cent tirages prêts, aucun tirage fait,
 *     aucun document créé ;
 *   - chaque expérience : pièce, dé, deux dés (la somme 7 domine), entiers
 *     aléatoires (bornes, redressement) ; l'animation lot par lot ; arrêt ;
 *     accumulation d'un lancer à l'autre ; réinitialisation ;
 *   - la comparaison : le trait théorique, le tableau (1/6, 6/36), la case
 *     qui le cache ; la loi des grands nombres (courbe, question) ;
 *   - la série : la saisie sans bouton, la moyenne 20 / médiane 20 / étendue
 *     20 de [10, 20, 30], le cas pair, une valeur « abc » nommée et non
 *     avalée, le vide, les repères moyenne / médiane et leurs cases,
 *     bâtons contre histogramme ;
 *   - persistance : naissance au premier changement, sauvegarde, relecture
 *     (mode, expérience, effectifs, série, cases), « أعمالي », mسح الكل ;
 *   - la table d'expérience (three.js) : pour CHAQUE valeur du dé, la face
 *     réellement en haut (lue sur l'objet) = le résultat affiché = l'effectif
 *     qui monte ; la pièce sur ses deux côtés ; deux dés et leur somme ;
 *     un lancer interrompu en l'air n'est pas compté ; « mouvement réduit »
 *     pose le résultat tout de suite ; le lot culbute puis se pose sur le
 *     dernier tirage ;
 *   - RTL : panneau à droite, Cairo, graphique LTR ;
 *   - responsive : tablette et mobile, panneau repliable, pas de débordement,
 *     pastilles ≥ 36 px sous le doigt.
 *
 * Les documents créés sont supprimés à la fin.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const EMAIL = process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const OUT = process.argv[2] || '/tmp/mathlab-probability-shots';
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
const docIdOf = (url) => Number((url.match(/\/atelier\/probabilites-statistiques\/(\d+)/) || [])[1]) || null;
const num = (text) => Number(String(text).replace(/[%\s]/g, '').replace(/−/g, '-').replace(',', '.'));
const waitSaved = async (page, timeout = 9000) => {
  await page.waitForSelector('[data-ml-status="dirty"], [data-ml-status="saving"]', { timeout: 2500 }).catch(() => {});
  await page.waitForSelector('[data-ml-status="saved"]', { timeout });
};
// Le total vit dans la légende du SVG : `innerText` n'existe pas sur un <text> SVG, on lit `textContent`.
// Le total est un attribut numérique : le texte arabe de la légende (« تجربة واحدة ») ne porte pas toujours un chiffre.
const total = (page) => page.evaluate(() => Number(document.querySelector('[data-ml-ps-chart-total]')?.getAttribute('data-ml-ps-total') ?? 0));
const stat = async (page, key) => num(await page.locator(`[data-ml-ps-stat-value="${key}"]`).innerText());
const counts = (page) => page.$$eval('[data-ml-ps-count]', (els) => els.map((e) => Number(e.textContent.replace(/\D/g, ''))));
const waitRunDone = async (page, timeout = 25000) => {
  await page.waitForSelector('[data-ml-ps-run]', { timeout });
  await sleep(200);
};

async function openTool(page, path = '/espace/atelier/probabilites-statistiques?lab=secondaire') {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  // Le pupitre existe dans les deux modes ; le bouton « أطلق » seulement en mode expérience.
  await page.waitForSelector('[data-ml-ps] [data-ml-ps-panel]', { timeout: 30000 });
  await sleep(300);
}

/**
 * UN lancer physique : on clique, on attend que l'objet soit posé (phase
 * « idle »), que le bouton revienne et que le total ait monté de un. On
 * rapporte ce que la table MONTRE (`data-ml-ps-top`, lu sur l'orientation
 * réelle des objets), ce que l'outil DIT (`data-ml-ps-result-parts`), et le temps.
 */
async function rollOnce(page, { tap = false } = {}) {
  const before = await total(page);
  const t0 = Date.now();
  await (tap ? page.tap('[data-ml-ps-run]') : page.click('[data-ml-ps-run]'));
  await page.waitForFunction((b) => {
    const el = document.querySelector('[data-ml-ps-result]');
    const t = Number(document.querySelector('[data-ml-ps-chart-total]')?.getAttribute('data-ml-ps-total') ?? 0);
    return el && el.getAttribute('data-ml-ps-result') === 'idle' && el.getAttribute('data-ml-ps-top') !== '' && Boolean(document.querySelector('[data-ml-ps-run]')) && t === b + 1;
  }, before, { timeout: 8000 });
  const ms = Date.now() - t0;
  const el = page.locator('[data-ml-ps-result]');
  return { before, ms, parts: await el.getAttribute('data-ml-ps-result-parts'), top: await el.getAttribute('data-ml-ps-top'), text: await el.innerText() };
}

async function setDataset(page, text) {
  const field = page.locator('[data-ml-ps-dataset]');
  await field.click({ clickCount: 3 });
  await field.fill(text);
  await sleep(450);
}

const ctx = await authedContext({ viewport: { width: 1440, height: 900 }, locale: 'ar-DZ' });
const page = await ctx.newPage();
attach(page);

let docId = null;
try {
  // ── Accueil et première visite ────────────────────────────────────────
  // Le scénario parcourt les quatre sections : c'est le ثانوي (au collège,
  // ni arbre ni loi normale — mathlab-labs-scope.mjs).
  await page.goto(`${BASE}/espace/atelier?lab=secondaire`, { waitUntil: 'networkidle' });
  const card = page.locator('[data-ml-tool-card="probabilityStats"]');
  record('مخبر الثانوي : la carte « الاحتمالات والإحصاء »', (await card.count()) === 1 && (await card.innerText()).includes('الاحتمالات والإحصاء'));
  await card.click();
  await page.waitForURL(/\/espace\/atelier\/probabilites-statistiques\?lab=secondaire$/, { timeout: 15000 });
  await page.waitForSelector('[data-ml-ps-run]', { timeout: 30000 });
  await sleep(400);
  record('première visite : la pièce, 100 tirages prêts, aucun tirage', (await page.inputValue('[data-ml-ps-experiment]')) === 'coin' && (await page.getAttribute('[data-ml-ps-draws="100"]', 'aria-pressed')) === 'true' && (await page.locator('[data-ml-ps-chart-empty]').count()) === 1);
  record('première visite : rien n’est créé', (await page.locator('[data-ml-status]').getAttribute('data-ml-status')) === 'clean' && docIdOf(page.url()) === null);
  record('première visite : « إعادة التصفير » désactivé', await page.locator('[data-ml-ps-reset]').isDisabled());
  await page.screenshot({ path: `${OUT}/01-first.png` });

  // ── La pièce : lancer, accumuler, animer ──────────────────────────────
  await page.click('[data-ml-ps-draws="10"]');
  await page.click('[data-ml-ps-run]');
  await sleep(120);
  record('pièce : pendant l’animation, le bouton devient « أوقف »', (await page.locator('[data-ml-ps-stop]').count()) === 1);
  await waitRunDone(page);
  record('pièce : 10 tirages faits, deux barres', (await total(page)) === 10 && (await page.locator('[data-ml-ps-bar]').count()) === 2);
  const c10 = await counts(page);
  record('pièce : les effectifs somment à 10', c10.length === 2 && c10[0] + c10[1] === 10, c10.join('+'));
  record('pièce : le trait théorique à 50 % est dessiné', (await page.locator('[data-ml-ps-theoretical]').count()) === 2);
  record('pièce : « وجه … مقابل 50 % »', (await page.locator('[data-ml-ps-tracked]').innerText()).includes('50'));
  await page.waitForURL(/\/probabilites-statistiques\/\d+(?:\?lab=\w+)?$/, { timeout: 12000 });
  docId = docIdOf(page.url());
  created.add(docId);
  record('persistance : le document naît au premier lancer', docId !== null);
  await page.screenshot({ path: `${OUT}/02-coin-10.png` });

  await page.click('[data-ml-ps-draws="1000"]');
  await page.click('[data-ml-ps-run]');
  await waitRunDone(page);
  record('pièce : un second lancer S’AJOUTE — 1 010 tirages', (await total(page)) === 1010);
  const heads = num(await page.locator('[data-ml-ps-tracked-frequency]').innerText());
  record('pièce : la fréquence de « وجه » est près de 50 %', heads > 40 && heads < 60, `${heads} %`);
  record('loi des grands nombres : la courbe de convergence est dessinée', (await page.locator('[data-ml-ps-convergence]').count()) === 1 && (await page.locator('[data-ml-ps-convergence-theoretical]').count()) === 1);
  record('loi des grands nombres : une question, pas une leçon', (await page.locator('[data-ml-ps-prompt]').innerText()).includes('؟'));
  await page.screenshot({ path: `${OUT}/03-coin-1010.png` });

  await page.click('[data-ml-ps-draws="100000"]');
  const t0 = Date.now();
  await page.click('[data-ml-ps-run]');
  await waitRunDone(page, 30000);
  const elapsed = Date.now() - t0;
  record('pièce : 100 000 tirages de plus, en lots, en moins de 15 s', (await total(page)) === 101010 && elapsed < 15000, `${elapsed} ms`);
  const headsBig = num(await page.locator('[data-ml-ps-tracked-frequency]').innerText());
  record('loi des grands nombres : à 101 010 tirages, à moins de 1 % de 50 %', Math.abs(headsBig - 50) < 1, `${headsBig} %`);
  await page.screenshot({ path: `${OUT}/04-coin-100k.png` });

  // ── Arrêt et réinitialisation ─────────────────────────────────────────
  await page.click('[data-ml-ps-run]');
  await sleep(60);
  await page.click('[data-ml-ps-stop]').catch(() => {});
  await sleep(200);
  const stopped = await total(page);
  record('arrêt : « أوقف » interrompt l’animation', (await page.locator('[data-ml-ps-run]').count()) === 1 && stopped >= 101010 && stopped < 201010, `${stopped}`);
  await page.click('[data-ml-ps-reset]');
  await sleep(300);
  record('réinitialiser : plus aucun tirage, graphique vide, bouton désactivé', (await page.locator('[data-ml-ps-chart-empty]').count()) === 1 && (await page.locator('[data-ml-ps-reset]').isDisabled()));

  // ── Le dé ─────────────────────────────────────────────────────────────
  await page.selectOption('[data-ml-ps-experiment]', 'die');
  await page.click('[data-ml-ps-draws="1000"]');
  await page.click('[data-ml-ps-run]');
  await waitRunDone(page);
  record('dé : six barres, 1 000 tirages', (await page.locator('[data-ml-ps-bar]').count()) === 6 && (await total(page)) === 1000);
  const dieCounts = await counts(page);
  record('dé : les effectifs somment à 1 000 et chaque face sort', dieCounts.reduce((a, b) => a + b, 0) === 1000 && dieCounts.every((c) => c > 100), dieCounts.join(' '));
  const dieTable = await page.locator('[data-ml-ps-table]').innerText();
  record('dé : le tableau donne 1/6 et 16,67 %', dieTable.includes('1/6') && dieTable.includes('16,67'));
  await page.screenshot({ path: `${OUT}/05-die.png` });

  await page.click('[data-ml-ps-option="compare"]');
  await sleep(200);
  record('comparaison : décochée, le trait théorique disparaît', (await page.locator('[data-ml-ps-theoretical]').count()) === 0);
  await page.click('[data-ml-ps-option="compare"]');
  await sleep(200);
  record('comparaison : recochée, il revient', (await page.locator('[data-ml-ps-theoretical]').count()) === 6);

  // ── Deux dés ──────────────────────────────────────────────────────────
  await page.selectOption('[data-ml-ps-experiment]', 'twoDice');
  record('deux dés : changer d’expérience remet à zéro', (await page.locator('[data-ml-ps-chart-empty]').count()) === 1);
  await page.click('[data-ml-ps-draws="10000"]');
  await page.click('[data-ml-ps-run]');
  await waitRunDone(page, 20000);
  const sums = await counts(page);
  record('deux dés : onze sommes, 10 000 tirages', sums.length === 11 && sums.reduce((a, b) => a + b, 0) === 10000);
  record('deux dés : la somme 7 sort plus que 2 et que 12', sums[5] > sums[0] * 3 && sums[5] > sums[10] * 3, `7:${sums[5]} 2:${sums[0]} 12:${sums[10]}`);
  const twoTable = await page.locator('[data-ml-ps-table]').innerText();
  record('deux dés : le tableau donne 6/36 pour 7 et 1/36 pour 2', twoTable.includes('6/36') && twoTable.includes('1/36'));
  await page.screenshot({ path: `${OUT}/06-two-dice.png` });

  // ── Entiers aléatoires ────────────────────────────────────────────────
  await page.selectOption('[data-ml-ps-experiment]', 'random');
  record('entiers : les bornes apparaissent (1 à 20)', (await page.inputValue('[data-ml-ps-bound="ml-ps-min"]')) === '1' && (await page.inputValue('[data-ml-ps-bound="ml-ps-max"]')) === '20');
  const maxField = page.locator('[data-ml-ps-bound="ml-ps-max"]');
  await maxField.click({ clickCount: 3 });
  await maxField.fill('6');
  await maxField.press('Enter');
  await sleep(200);
  await page.click('[data-ml-ps-draws="1000"]');
  await page.click('[data-ml-ps-run]');
  await waitRunDone(page);
  record('entiers : 1 à 6 → six barres, 1 000 tirages', (await page.locator('[data-ml-ps-bar]').count()) === 6 && (await total(page)) === 1000);
  await maxField.click({ clickCount: 3 });
  await maxField.fill('abc');
  await sleep(150);
  record('entiers : « abc » est refusé et dit', (await page.locator('[data-ml-ps-range] [role="alert"]').count()) === 1);
  await maxField.press('Enter');
  await sleep(150);
  record('entiers : à la validation la valeur revient à 6', (await maxField.inputValue()) === '6');
  const minField = page.locator('[data-ml-ps-bound="ml-ps-min"]');
  await minField.click({ clickCount: 3 });
  await minField.fill('9');
  await minField.press('Enter');
  await sleep(250);
  record('entiers : min > max est redressé (6 à 9)', (await minField.inputValue()) === '6' && (await maxField.inputValue()) === '9');
  await page.screenshot({ path: `${OUT}/07-random.png` });

  // ── Le nombre de tirages, à la main ───────────────────────────────────
  const drawsField = page.locator('[data-ml-ps-draws-field]');
  await drawsField.click({ clickCount: 3 });
  await drawsField.fill('0');
  await sleep(100);
  record('tirages : 0 est refusé', (await page.locator('#ml-ps-draws-error').count()) === 1);
  await drawsField.fill('250');
  await drawsField.press('Enter');
  // Changer les bornes a déjà remis la simulation à zéro : « إعادة التصفير » est alors désactivé, à juste titre.
  record('entiers : changer les bornes remet la simulation à zéro', await page.locator('[data-ml-ps-reset]').isDisabled());
  await page.click('[data-ml-ps-run]');
  await waitRunDone(page);
  record('tirages : 250 à la main', (await total(page)) === 250);

  // ── La table d'expérience : le résultat commande la face ───────────────
  await page.selectOption('[data-ml-ps-experiment]', 'die');
  await page.click('[data-ml-ps-draws="1"]');
  record('table : un dé est posé sur la table (canevas three.js)', (await page.locator('[data-ml-ps-dice="die"] [data-ml-ps-dice-canvas]').count()) === 1 && (await page.getAttribute('[data-ml-ps-dice]', 'data-ml-ps-dice-count')) === '1');
  record('table : le bouton dit « ارمِ النرد »', (await page.locator('[data-ml-ps-run]').innerText()).includes('ارمِ النرد'));
  {
    const seen = new Set();
    let allConsistent = true;
    let countsConsistent = true;
    const durations = [];
    let shot = false;
    for (let i = 0; i < 40 && seen.size < 6; i += 1) {
      const countsBefore = i === 0 ? [0, 0, 0, 0, 0, 0] : await counts(page);
      if (!shot) {
        // Une image en plein vol, pour l'œil.
        await page.click('[data-ml-ps-run]');
        await sleep(380);
        await page.screenshot({ path: `${OUT}/14-die-flight.png` });
        await page.waitForFunction(() => document.querySelector('[data-ml-ps-result]')?.getAttribute('data-ml-ps-result') === 'idle' && Boolean(document.querySelector('[data-ml-ps-run]')), null, { timeout: 8000 });
        shot = true;
      }
      const roll = await rollOnce(page);
      const value = Number(roll.parts);
      seen.add(value);
      durations.push(roll.ms);
      if (roll.parts !== roll.top || !roll.text.includes(String(value))) allConsistent = false;
      const countsAfter = await counts(page);
      if (countsAfter[value - 1] !== countsBefore[value - 1] + 1) countsConsistent = false;
    }
    record('dé : les six faces sont sorties', seen.size === 6, [...seen].sort().join(' '));
    record('dé : pour CHAQUE lancer, face réellement en haut = résultat affiché', allConsistent);
    record('dé : pour CHAQUE lancer, l’effectif de cette face monte de un', countsConsistent);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    record('dé : un lancer dure entre 0,7 et 1,8 s', durations.every((d) => d >= 700 && d <= 1800), `moyenne ${Math.round(avg)} ms`);
    await page.screenshot({ path: `${OUT}/15-die-landed.png` });
  }

  // Un lancer interrompu en l'air n'est pas une observation.
  {
    const before = await total(page);
    await page.click('[data-ml-ps-run]');
    await sleep(250);
    await page.click('[data-ml-ps-stop]');
    await sleep(300);
    record('dé : un lancer arrêté en l’air n’est pas compté', (await total(page)) === before && (await page.locator('[data-ml-ps-run]').count()) === 1 && (await page.getAttribute('[data-ml-ps-result]', 'data-ml-ps-result')) === 'idle');
  }

  // Un lot : les dés culbutent, puis se posent sur le DERNIER tirage.
  {
    const before = await total(page);
    await page.click('[data-ml-ps-draws="1000"]');
    const t0 = Date.now();
    await page.click('[data-ml-ps-run]');
    await sleep(200);
    record('dé : pendant un lot, la table dit « محاكاة 1000 رمية… »', (await page.getAttribute('[data-ml-ps-result]', 'data-ml-ps-result')) === 'batch' && (await page.locator('[data-ml-ps-result]').innerText()).includes('1000'));
    await waitRunDone(page);
    await page.waitForFunction(() => document.querySelector('[data-ml-ps-result]')?.getAttribute('data-ml-ps-result') === 'idle', null, { timeout: 5000 });
    const ms = Date.now() - t0;
    const el = page.locator('[data-ml-ps-result]');
    record('dé : le lot de 1 000 reste rapide (< 6 s) et compte 1 000', ms < 6000 && (await total(page)) === before + 1000, `${ms} ms`);
    record('dé : après le lot, le dé montre le dernier tirage', (await el.getAttribute('data-ml-ps-result-parts')) === (await el.getAttribute('data-ml-ps-top')) && (await el.getAttribute('data-ml-ps-top')) !== '');
  }

  // « Regarder chaque lancer » décoché : dix tirages en lot, pas dix lancers.
  {
    await page.click('[data-ml-ps-option="watchRolls"]');
    await page.click('[data-ml-ps-draws="10"]');
    const before = await total(page);
    const t0 = Date.now();
    await page.click('[data-ml-ps-run]');
    await waitRunDone(page);
    await page.waitForFunction(() => document.querySelector('[data-ml-ps-result]')?.getAttribute('data-ml-ps-result') === 'idle', null, { timeout: 5000 });
    record('dé : sans « شاهد كل رمية », 10 tirages passent en lot (< 3 s)', Date.now() - t0 < 3000 && (await total(page)) === before + 10);
    await page.click('[data-ml-ps-option="watchRolls"]');
  }

  // La pièce : les deux côtés.
  await page.selectOption('[data-ml-ps-experiment]', 'coin');
  await page.click('[data-ml-ps-draws="1"]');
  record('table : une pièce est posée', (await page.locator('[data-ml-ps-dice="coin"] [data-ml-ps-dice-canvas]').count()) === 1);
  {
    const seen = new Set();
    let consistent = true;
    for (let i = 0; i < 24 && seen.size < 2; i += 1) {
      const roll = await rollOnce(page);
      seen.add(roll.parts);
      const word = roll.parts === '1' ? 'وجه' : 'ظهر';
      if (roll.parts !== roll.top || !roll.text.includes(word)) consistent = false;
    }
    record('pièce : « وجه » et « ظهر » sont sortis', seen.size === 2, [...seen].join(' '));
    record('pièce : pour CHAQUE lancer, le côté en haut = le mot affiché', consistent);
    await page.screenshot({ path: `${OUT}/16-coin-landed.png` });
  }

  // Deux dés : deux objets, deux faces, une somme.
  await page.selectOption('[data-ml-ps-experiment]', 'twoDice');
  await page.click('[data-ml-ps-draws="1"]');
  record('table : deux dés sont posés', (await page.getAttribute('[data-ml-ps-dice]', 'data-ml-ps-dice-count')) === '2');
  {
    let consistent = true;
    for (let i = 0; i < 4; i += 1) {
      const countsBefore = i === 0 ? new Array(11).fill(0) : await counts(page);
      const roll = await rollOnce(page);
      const [a, b] = roll.parts.split(',').map(Number);
      const sum = Number(await page.getAttribute('[data-ml-ps-result-sum]', 'data-ml-ps-result-sum'));
      const countsAfter = await counts(page);
      if (roll.parts !== roll.top || sum !== a + b || !roll.text.includes(`${a} + `) || countsAfter[sum - 2] !== countsBefore[sum - 2] + 1) consistent = false;
    }
    record('deux dés : faces réelles = faces affichées, somme juste, effectif de la somme +1', consistent);
    await page.screenshot({ path: `${OUT}/17-two-dice-landed.png` });
  }
  // Le générateur d'entiers, 100 tirages : c'est cet état (bornes 6–9, 100 tirages) que la persistance doit rendre.
  await page.selectOption('[data-ml-ps-experiment]', 'random');
  await page.click('[data-ml-ps-draws="100"]');
  await page.click('[data-ml-ps-run]');
  await waitRunDone(page);
  record('entiers : sans objet physique, pas de table 3D', (await page.locator('[data-ml-ps-dice]').count()) === 0);

  // ── La série statistique ──────────────────────────────────────────────
  await page.click('[data-ml-ps-mode="dataset"]');
  await sleep(300);
  record('série : la série d’exemple est là, 7 valeurs', (await page.locator('[data-ml-ps-dataset-count]').innerText()).includes('7'));
  record('série : l’exemple donne n = 7, médiane 14, étendue 8', (await stat(page, 'count')) === 7 && (await stat(page, 'median')) === 14 && (await stat(page, 'range')) === 8);
  await setDataset(page, '10, 20, 30');
  record('série : [10, 20, 30] → moyenne 20, médiane 20, étendue 20, SANS bouton', (await stat(page, 'mean')) === 20 && (await stat(page, 'median')) === 20 && (await stat(page, 'range')) === 20 && (await stat(page, 'min')) === 10 && (await stat(page, 'max')) === 30);
  record('série : la moyenne et la médiane sont dessinées', (await page.locator('[data-ml-ps-mean-line]').count()) === 1 && (await page.locator('[data-ml-ps-median-line]').count()) === 1);
  record('série : des bâtons, pas un histogramme', (await page.getAttribute('[data-ml-ps-distribution]', 'data-ml-ps-distribution')) === 'bars');
  await page.screenshot({ path: `${OUT}/08-dataset-10-20-30.png` });
  await setDataset(page, '10, 20, 30, 40');
  record('série : [10, 20, 30, 40] → moyenne 25, médiane 25', (await stat(page, 'mean')) === 25 && (await stat(page, 'median')) === 25);
  await setDataset(page, '12, 15, abc, 20');
  const err = await page.locator('[data-ml-ps-dataset-error]').innerText();
  record('série : « abc » est nommé, pas avalé', err.includes('abc'));
  record('série : les trois autres valeurs sont quand même comptées', (await stat(page, 'count')) === 3 && (await stat(page, 'min')) === 12);
  await setDataset(page, '12,5 ; 14,2 ; 9');
  record('série : virgule décimale « 12,5 ; 14,2 ; 9 »', (await stat(page, 'count')) === 3 && (await stat(page, 'max')) === 14.2);
  await setDataset(page, '');
  record('série : vide → tirets, pas NaN, pas de plantage', (await page.locator('[data-ml-ps-stat-value="mean"]').innerText()) === '—' && (await page.locator('[data-ml-ps-chart-empty]').count()) === 1);
  await page.click('[data-ml-ps-option="showMean"]');
  await setDataset(page, '3 5 5 6 8');
  record('série : la case « المتوسط » décochée cache le repère', (await page.locator('[data-ml-ps-mean-line]').count()) === 0 && (await page.locator('[data-ml-ps-median-line]').count()) === 1);
  await page.click('[data-ml-ps-option="showMean"]');
  const many = Array.from({ length: 80 }, (_, i) => Math.round(50 + 30 * Math.sin(i * 1.7) + i * 0.4)).join(' ');
  await setDataset(page, many);
  record('série : 80 valeurs dispersées → un histogramme en classes', (await page.getAttribute('[data-ml-ps-distribution]', 'data-ml-ps-distribution')) === 'classes' && (await stat(page, 'count')) === 80);
  await page.screenshot({ path: `${OUT}/09-histogram.png` });

  // ── Persistance ───────────────────────────────────────────────────────
  await setDataset(page, '10, 20, 30');
  await page.fill('[data-ml-title]', 'تجربة QA');
  await waitSaved(page);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-ps-dataset]', { timeout: 30000 });
  await sleep(400);
  record('rechargement : le mode « série », la saisie et la moyenne 20 reviennent', (await page.getAttribute('[data-ml-ps-mode="dataset"]', 'aria-selected')) === 'true' && (await page.inputValue('[data-ml-ps-dataset]')) === '10, 20, 30' && (await stat(page, 'mean')) === 20);
  await page.click('[data-ml-ps-mode="experiment"]');
  await sleep(300);
  record('rechargement : l’expérience (entiers 6–9) et ses 100 tirages reviennent', (await page.inputValue('[data-ml-ps-experiment]')) === 'random' && (await total(page)) === 100 && (await page.inputValue('[data-ml-ps-bound="ml-ps-min"]')) === '6');
  // Le changement de mode est un changement du document : il s'enregistre.
  await waitSaved(page);
  const stored = await api(TOKEN, 'GET', `/math-lab/documents/${docId}`);
  const sim = stored.data?.document?.data?.simulation ?? null;
  record('serveur : des effectifs et le dernier tirage, jamais les tirages', Boolean(sim) && Array.isArray(sim.counts) && sim.counts.length === 4 && sim.total === 100 && !('draws' in sim) && Array.isArray(sim.last?.parts), JSON.stringify(sim ?? stored.data).slice(0, 120));
  await page.goto(`${BASE}/espace/atelier`, { waitUntil: 'networkidle' });
  record('« أعمالي » liste le document', (await page.locator('body').innerText()).includes('تجربة QA'));

  // ── Mسح الكل ──────────────────────────────────────────────────────────
  await openTool(page, `/espace/atelier/probabilites-statistiques/${docId}`);
  record('réouverture : le mode « expérience » a été enregistré', (await page.getAttribute('[data-ml-ps-mode="experiment"]', 'aria-selected')) === 'true' && (await total(page)) === 100);
  await page.click('[data-ml-clear]');
  await page.waitForSelector('[role="alertdialog"]', { timeout: 5000 });
  const dialogText = await page.locator('[role="alertdialog"]').innerText();
  record('« مسح الكل » : le texte de l’outil', dialogText.includes('النتائج'));
  await page.click('[data-nb-confirm]');
  await sleep(300);
  record('« مسح الكل » : plus aucun tirage', (await page.locator('[data-ml-ps-chart-empty]').count()) === 1);

  // ── RTL ───────────────────────────────────────────────────────────────
  const panelBox = await page.locator('[data-ml-ps-panel]').boundingBox();
  const stageBox = await page.locator('[data-ml-ps-stage]').boundingBox();
  record('RTL : le panneau est à droite du graphique', panelBox.x > stageBox.x);
  const font = await page.locator('[data-ml-ps-run]').evaluate((el) => getComputedStyle(el).fontFamily);
  record('RTL : Cairo sur les contrôles', /Cairo/i.test(font), font);
  await page.click('[data-ml-ps-run]');
  await waitRunDone(page);
  // La direction CALCULÉE : l'attribut `dir` ne s'applique pas à un SVG, seule la CSS compte.
  record('RTL : le graphique reste LTR sous une page RTL', (await page.locator('[data-ml-ps-chart]').first().evaluate((el) => getComputedStyle(el).direction)) === 'ltr' && (await page.evaluate(() => getComputedStyle(document.documentElement).direction)) === 'rtl');
  const totalBox = await page.locator('[data-ml-ps-chart-total]').evaluate((el) => { const b = el.getBBox(); const svg = el.ownerSVGElement.viewBox.baseVal; return { right: b.x + b.width, max: svg.width }; });
  record('RTL : la légende du total ne sort pas du cadre', totalBox.right <= totalBox.max, JSON.stringify(totalBox));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  record('bureau : pas de débordement horizontal', !overflow);
  await page.screenshot({ path: `${OUT}/10-rtl.png` });

  // ── Mouvement réduit : le résultat se pose tout de suite ───────────────
  {
    const calm = await authedContext({ viewport: { width: 1280, height: 800 }, locale: 'ar-DZ', reducedMotion: 'reduce' });
    const p = await calm.newPage();
    attach(p);
    try {
      await openTool(p);
      await p.selectOption('[data-ml-ps-experiment]', 'die');
      await p.click('[data-ml-ps-draws="1"]');
      record('mouvement réduit : l’outil le dit', (await p.locator('[data-ml-ps-reduced-motion]').count()) === 1);
      const roll = await rollOnce(p);
      record('mouvement réduit : le résultat est là en moins de 400 ms, compté, et le dé le montre', roll.ms < 400 && roll.parts === roll.top && (await total(p)) === 1, `${roll.ms} ms`);
      await p.waitForURL(/\/probabilites-statistiques\/\d+(?:\?lab=\w+)?$/, { timeout: 12000 });
      created.add(docIdOf(p.url()));
    } catch (e) {
      record('mouvement réduit : scénario interrompu', false, String(e).slice(0, 300));
    } finally {
      await calm.close();
    }
  }

  // ── Un visiteur ───────────────────────────────────────────────────────
  const anon = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'ar-DZ' });
  const anonPage = await anon.newPage();
  await anonPage.goto(`${BASE}/espace/atelier/probabilites-statistiques?lab=secondaire`, { waitUntil: 'networkidle' });
  record('visiteur : envoyé à /login', /\/login/.test(anonPage.url()));
  await anon.close();
} catch (e) {
  record('scénario bureau interrompu', false, String(e).slice(0, 400));
  await page.screenshot({ path: `${OUT}/error-desktop.png` }).catch(() => {});
} finally {
  await ctx.close();
}

// ── Tablette et mobile ───────────────────────────────────────────────────
for (const [label, width, height] of [['tablette', 1024, 768], ['mobile', 390, 844]]) {
  const c = await authedContext({ viewport: { width, height }, locale: 'ar-DZ', hasTouch: true, isMobile: width < 700, deviceScaleFactor: 1 });
  const p = await c.newPage();
  attach(p);
  try {
    await openTool(p);
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    record(`${label} : pas de débordement horizontal`, !overflow);
    await p.tap('[data-ml-ps-draws="1000"]');
    await p.tap('[data-ml-ps-run]');
    await waitRunDone(p);
    record(`${label} : 1 000 tirages au doigt`, (await total(p)) === 1000);
    const chart = await p.locator('[data-ml-ps-chart]').boundingBox();
    const stage = await p.locator('[data-ml-ps-stage]').boundingBox();
    record(`${label} : le graphique tient dans sa colonne`, chart.width <= stage.width + 1 && chart.width > stage.width * 0.6, `${Math.round(chart.width)}/${Math.round(stage.width)}`);
    const chip = await p.locator('[data-ml-ps-draws="100"]').boundingBox();
    const run = await p.locator('[data-ml-ps-run]').boundingBox();
    record(`${label} : pastilles ≥ 36 px, bouton ≥ 44 px`, chip.height >= 36 && run.height >= 44, `${chip.height}/${run.height}`);
    await p.waitForURL(/\/probabilites-statistiques\/\d+(?:\?lab=\w+)?$/, { timeout: 12000 });
    created.add(docIdOf(p.url()));
    await p.screenshot({ path: `${OUT}/11-${label}.png` });
    if (width < 700) {
      record('mobile : le panneau se replie', await p.locator('[data-ml-ps-panel-toggle]').isVisible());
      await p.tap('[data-ml-ps-panel-toggle]');
      await sleep(300);
      const collapsedStage = await p.locator('[data-ml-ps-stage]').boundingBox();
      record('mobile : replié, le graphique grandit', collapsedStage.height > stage.height);
      await p.screenshot({ path: `${OUT}/12-mobile-collapsed.png` });
      await p.tap('[data-ml-ps-panel-toggle]');
      await sleep(300);
    }
    await p.selectOption('[data-ml-ps-experiment]', 'die');
    await p.tap('[data-ml-ps-draws="1"]');
    await sleep(300);
    const canvas = await p.locator('[data-ml-ps-dice-canvas]').boundingBox();
    record(`${label} : la table 3D est visible et tient dans l’écran`, canvas && canvas.width > 200 && canvas.height > 120 && canvas.x >= 0 && canvas.x + canvas.width <= width + 1, canvas ? `${Math.round(canvas.width)}×${Math.round(canvas.height)}` : 'absente');
    const roll = await rollOnce(p, { tap: true });
    record(`${label} : un lancer au doigt — face réelle = résultat`, roll.parts === roll.top && roll.parts !== '');
    await p.screenshot({ path: `${OUT}/18-${label}-die.png` });
    await p.tap('[data-ml-ps-mode="dataset"]');
    await sleep(300);
    const ta = await p.locator('[data-ml-ps-dataset]').boundingBox();
    record(`${label} : la saisie de série est visible et large`, ta && ta.width > 200);
    await p.screenshot({ path: `${OUT}/13-${label}-dataset.png` });
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
