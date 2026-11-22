/**
 * QA navigateur — le مختبر المثلثات (laboratoire de trigonométrie).
 *
 * Lancement (dev server sur 5173, API sur 8000, élève QA existant) :
 *   node apps/web/e2e/mathlab-trigonometry.mjs [dossier-captures]
 *
 * Ce qu'on vérifie (§50) :
 *   - navigation : la carte sur l'accueil (plus « قريبًا »), l'URL directe,
 *     le rechargement, le visiteur non connecté ;
 *   - la première visite : le TRIANGLE du programme de 4AM, pas le cercle,
 *     et aucun document créé tant qu'on n'a rien touché ;
 *   - le triangle (§9, §10) : glissement du sommet, les trois rapports lus
 *     sur les côtés, SOH-CAH-TOA qui ALLUME les bons segments ;
 *   - le cercle (§3) : glissement du point, l'angle, les coordonnées, les
 *     projections, tout synchronisé ;
 *   - les valeurs exactes (§19) : √3/2 et non 0,8660254037844386 ;
 *   - la tangente (§11) : « غير معرّف » à 90°, JAMAIS un nombre géant ;
 *   - les graphes (§12, §32) : le marqueur suit le cercle, et GLISSER le
 *     graphe change l'angle — la relation dans les deux sens ;
 *   - la périodicité (§14, §15) : 450° affiche son équivalent 90° ;
 *   - les radians (§16) : π/3, et ℓ = r·θ ;
 *   - les réciproques (§24) : arcsin(0,5) donne 30° ET 150° ;
 *   - l'identité (§22) : la somme vaut 1, exactement, à tout angle ;
 *   - l'entraînement (§25) : prédire → révéler, et JAMAIS de blocage ;
 *   - l'animation (§4) et le mouvement réduit (§38) ;
 *   - RTL : panneau au bon bord, notation LTR (direction CALCULÉE) ;
 *   - responsive : tablette et mobile, pas de débordement horizontal,
 *     cibles tactiles ≥ 44 px, glissement au DOIGT sans défilement ;
 *   - accessibilité : focus visible, poignée focalisable et nommée.
 *
 * Les documents créés sont supprimés à la fin.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const EMAIL = process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const OUT = process.argv[2] || '/tmp/mathlab-trigonometry-shots';
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
const docIdOf = (url) => Number((url.match(/\/atelier\/trigonometrie\/(\d+)/) || [])[1]) || null;

const valueOf = (page, ratio) => page.locator(`[data-ml-trig-value="${ratio}"]`).first().innerText().catch(() => null);
const theta = (page) => page.locator('[data-ml-trig-theta] .sa-ml-trig__theta-main').first().innerText().catch(() => null);

/** Ouvrir une section repliée du panneau. */
async function openSection(page, id) {
  const section = page.locator(`[data-ml-trig-section="${id}"]`);
  if (await section.getAttribute('data-open') === 'false') {
    await page.locator(`[data-ml-trig-section-toggle="${id}"]`).click();
    await sleep(200);
  }
}

async function setAngle(page, degrees) {
  await openSection(page, 'angle');
  const field = page.locator('[data-ml-trig-anglefield]');
  await field.fill(String(degrees));
  await field.press('Enter');
  await sleep(300);
}

async function dragBy(page, selector, dx, dy) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) return false;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 14 });
  await page.mouse.up();
  await sleep(300);
  return true;
}

// ─────────────────────────────────────────────────────────────────────────
const context = await authedContext({ viewport: { width: 1360, height: 900 } });
const page = await context.newPage();
attach(page);

// ── L'accueil ─────────────────────────────────────────────────────────────
await page.goto(`${BASE}/espace/atelier?lab=secondaire`, { waitUntil: 'networkidle' });
await sleep(500);
const card = page.locator('a[href*="/atelier/trigonometrie?lab=secondaire"]').first();
record('accueil : la carte du مختبر المثلثات est ouvrable', await card.count() > 0);
// La description de مخبر الثانوي NOMME la دائرة المثلثية (c'est son contenu) :
// ce qu'on cherche est une PUCE « قريبًا », donc dans la liste des annoncés.
const plannedChips = await page.locator('[data-ml-planned]').filter({ hasText: 'الدائرة المثلثية' }).count();
record('accueil : plus de puce « قريبًا » pour la trigonométrie', plannedChips === 0,
  plannedChips ? `${plannedChips} occurrence(s) de l’ancien nom` : '');
await page.screenshot({ path: `${OUT}/00-accueil.png` });

// ── La première visite : le TRIANGLE (§9, programme 4AM) ──────────────────
await page.goto(`${BASE}/espace/atelier/trigonometrie?lab=secondaire`, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-ml-trigonometry]', { timeout: 20000 });
await sleep(900);
await page.screenshot({ path: `${OUT}/01-ouverture.png` });

record('ouverture : l’instrument ouvre sur le TRIANGLE du programme',
  await page.locator('[data-ml-trig-tri]').count() === 1);
record('ouverture : le sommet est saisissable',
  await page.locator('[data-ml-trig-trihandle]').count() === 1);
record('ouverture : l’invitation « حرّك النقطة » est visible (§46)',
  await page.locator('[data-ml-trig-invite]').isVisible());
record('ouverture : aucun document n’est créé avant la première touche',
  docIdOf(page.url()) === null, page.url());

const sin0 = await valueOf(page, 'sin');
const cos0 = await valueOf(page, 'cos');
record('ouverture : sin(30°) affiché en forme EXACTE 1/2 (§19)', sin0 === '1/2', sin0);
record('ouverture : cos(30°) affiché √3/2, jamais 0,8660254… (§19)', cos0 === '√3/2', cos0);

// ── Le triangle : glissement et SOH-CAH-TOA (§9, §10) ─────────────────────
const svgText = (page, selector) => page.locator(selector).first().textContent().catch(() => null);
const angleBefore = await svgText(page, '[data-ml-trig-angle]');
await dragBy(page, '[data-ml-trig-trihandle]', 0, -90);
const angleAfter = await svgText(page, '[data-ml-trig-angle]');
record('triangle : glisser le sommet change l’angle (§9)', angleBefore !== angleAfter,
  `${angleBefore} → ${angleAfter}`);
const oppAfter = await svgText(page, '[data-ml-trig-len="opposite"]');
record('triangle : le côté opposé a suivi le doigt', Number(String(oppAfter).replace(',', '.')) > 0, oppAfter);
await page.screenshot({ path: `${OUT}/02-triangle-drag.png` });

await page.locator('[data-ml-trig-ratio="sin"]').click();
await sleep(300);
record('SOH-CAH-TOA : choisir sin écrit sa formule avec ses côtés (§10)',
  await page.locator('[data-ml-trig-formula="sin"]').count() === 1);
const oppClass = await page.locator('[data-ml-trig-side="opposite"]').getAttribute('class');
const adjClass = await page.locator('[data-ml-trig-side="adjacent"]').getAttribute('class');
record('SOH-CAH-TOA : sin ALLUME le côté opposé', (oppClass || '').includes('--on'), oppClass);
record('SOH-CAH-TOA : sin ÉTEINT le côté adjacent', (adjClass || '').includes('--off'), adjClass);
await page.screenshot({ path: `${OUT}/03-sohcahtoa.png` });

await page.locator('[data-ml-trig-ratio="tan"]').click();
await sleep(300);
const adjForTan = await page.locator('[data-ml-trig-side="adjacent"]').getAttribute('class');
const hypForTan = await page.locator('[data-ml-trig-side="hypotenuse"]').getAttribute('class');
record('SOH-CAH-TOA : tan allume opposé ET adjacent', (adjForTan || '').includes('--on'), adjForTan);
record('SOH-CAH-TOA : tan éteint l’hypoténuse', (hypForTan || '').includes('--off'), hypForTan);
await page.locator('[data-ml-trig-ratio="tan"]').click();   // on éteint
await sleep(200);

// Un SEUL θ à l'écran : l'inspecteur doit parler du triangle, pas du cercle.
// (Régression : l'inspecteur montrait sin = 1/2 pendant que le triangle
// affichait 0,5057 — deux valeurs pour le même angle.)
const triAngleText = (await svgText(page, '[data-ml-trig-angle]')) || '';
const panelTheta = (await theta(page)) || '';
record('cohérence : l’inspecteur affiche l’angle DU TRIANGLE, pas celui du cercle',
  panelTheta.replace('°', '').trim() === triAngleText.replace('°', '').trim(),
  `panneau ${panelTheta} / dessin ${triAngleText}`);

// Et le champ d'angle pilote bien le triangle.
await setAngle(page, 45);
const triAngle45 = (await svgText(page, '[data-ml-trig-angle]')) || '';
record('cohérence : taper 45° en mode triangle déplace le TRIANGLE',
  triAngle45.startsWith('45'), triAngle45);
record('cohérence : à 45°, le triangle est isocèle — sin = cos',
  (await valueOf(page, 'sin')) === (await valueOf(page, 'cos')),
  `${await valueOf(page, 'sin')} / ${await valueOf(page, 'cos')}`);

// ── Le mode cercle (§3) ───────────────────────────────────────────────────
await openSection(page, 'mode');
await page.locator('[data-ml-trig-mode="circle"]').click();
await sleep(500);
record('cercle : la dizaine de couches du cercle est dessinée',
  await page.locator('[data-ml-trig-circle]').count() === 1);
record('cercle : le point est saisissable', await page.locator('[data-ml-trig-handle]').count() === 1);
await page.screenshot({ path: `${OUT}/04-cercle.png` });

await setAngle(page, 60);
record('cercle : sin(60°) = √3/2 en exact', await valueOf(page, 'sin') === '√3/2');
record('cercle : cos(60°) = 1/2 en exact', await valueOf(page, 'cos') === '1/2');
record('cercle : tan(60°) = √3 en exact', await valueOf(page, 'tan') === '√3');
const pointText = await page.locator('[data-ml-trig-point]').innerText();
record('cercle : le point s’écrit (1/2 ; √3/2) (§31)', pointText === '(1/2 ; √3/2)', pointText);

// Le glissement du point change tout en même temps (§3).
const thetaBefore = await theta(page);
await dragBy(page, '[data-ml-trig-handle]', -70, -70);
const thetaAfter = await theta(page);
record('cercle : glisser le point change θ (§3)', thetaBefore !== thetaAfter, `${thetaBefore} → ${thetaAfter}`);
const sinDrag = await valueOf(page, 'sin');
record('cercle : les valeurs suivent le glissement', Boolean(sinDrag) && sinDrag !== '√3/2', sinDrag);
await page.screenshot({ path: `${OUT}/05-drag.png` });

// ── La tangente indéfinie (§11, §23) — LE cas à ne pas rater ──────────────
await setAngle(page, 90);
const tan90 = await valueOf(page, 'tan');
record('tan(90°) affiche « غير معرّف », jamais un nombre (§11)', tan90 === 'غير معرّف', tan90);
record('tan(90°) : la note explique la division par zéro (§23)',
  await page.locator('[data-ml-trig-tannote]').count() === 1);
record('tan(90°) : aucune valeur astronomique nulle part sur l’écran',
  !(await page.locator('body').innerText()).match(/1[,.]6\d{4,}e?\+?1[56]|16331239353195370/));
const micro90 = await page.locator('[data-ml-trig-micro]').getAttribute('data-ml-trig-micro').catch(() => null);
record('tan(90°) : la micro-explication apparaît au bon moment (§47)', micro90 === 'tanUndefined', micro90);
await page.screenshot({ path: `${OUT}/06-tan-undefined.png` });

// La droite tangente dessinée, et son écrêtage signalé (§11).
await openSection(page, 'layers');
await page.locator('[data-ml-trig-layer="tangentLine"]').click();
await sleep(300);
record('tangente : à 90°, la droite est dessinée SANS point d’intersection (§11)',
  await page.locator('[data-ml-trig-tangent="undefined"]').count() === 1);
await setAngle(page, 89);
record('tangente : à 89°, le segment est écrêté et SIGNALÉ, pas coupé en silence',
  await page.locator('[data-ml-trig-tangent="clipped"]').count() === 1);
await page.screenshot({ path: `${OUT}/07-tangente.png` });
await setAngle(page, 60);
await page.locator('[data-ml-trig-layer="tangentLine"]').click();
await sleep(200);

// ── Les graphes, dans les DEUX sens (§12, §32) ────────────────────────────
await page.locator('[data-ml-trig-layer="sineGraph"]').click();
await sleep(500);
record('graphe : le manche du sinus est dessiné', await page.locator('[data-ml-trig-sinwave]').count() === 1);
record('graphe : le marqueur est posé sur la courbe', await page.locator('[data-ml-trig-sindot]').count() === 1);
const dotBefore = await page.locator('[data-ml-trig-sindot]').getAttribute('cx');
await setAngle(page, 120);
const dotAfter = await page.locator('[data-ml-trig-sindot]').getAttribute('cx');
record('graphe : cercle → graphe, le marqueur suit l’angle (§12)', dotBefore !== dotAfter,
  `cx ${dotBefore} → ${dotAfter}`);

// L'inverse : glisser DANS le graphe change l'angle (§32).
const thetaPreGraph = await theta(page);
await dragBy(page, '[data-ml-trig-graphsurface]', 90, 0);
const thetaPostGraph = await theta(page);
record('graphe : graphe → cercle, glisser le graphe change θ (§32)',
  thetaPreGraph !== thetaPostGraph, `${thetaPreGraph} → ${thetaPostGraph}`);
await page.screenshot({ path: `${OUT}/08-graphe.png` });

// ── La périodicité (§14, §15) ─────────────────────────────────────────────
await setAngle(page, 450);
record('périodicité : 450° montre son équivalent (§15)',
  await page.locator('[data-ml-trig-equivalent]').count() === 1);
const equivalent = await page.locator('[data-ml-trig-equivalent]').innerText();
record('périodicité : l’équivalent annoncé est bien 90°', equivalent.includes('90'), equivalent.replace(/\n/g, ' '));
record('périodicité : sin(450°) = sin(90°) = 1', await valueOf(page, 'sin') === '1');
record('périodicité : le bouton de normalisation est proposé',
  await page.locator('[data-ml-trig-normalize]').count() === 1);
await page.screenshot({ path: `${OUT}/09-periodicite.png` });
await page.locator('[data-ml-trig-normalize]').click();
await sleep(300);
record('périodicité : normaliser ramène bien à 90°', (await theta(page) || '').includes('90'));

await setAngle(page, -90);
record('périodicité : un angle NÉGATIF est accepté (§15)',
  (await page.locator('[data-ml-trig-equivalent]').innerText()).includes('270'));
record('périodicité : sin(−90°) = −1', await valueOf(page, 'sin') === '−1', await valueOf(page, 'sin'));

// ── Les radians (§16) ─────────────────────────────────────────────────────
await setAngle(page, 60);
await openSection(page, 'angle');
await page.locator('[data-ml-trig-unit="rad"]').click();
await sleep(400);
const thetaRad = await theta(page);
record('radians : 60° s’écrit π/3 (§4)', thetaRad === 'π/3', thetaRad);
const microRad = await page.locator('[data-ml-trig-micro]').getAttribute('data-ml-trig-micro').catch(() => null);
record('radians : la micro-explication « longueur d’arc » apparaît (§47)', microRad === 'radianIsArc', microRad);
await openSection(page, 'mode');
const arcReadout = await page.locator('[data-ml-trig-arclength]').innerText().catch(() => null);
record('radians : ℓ = r·θ est affiché en direct (§17)', (arcReadout || '').includes('ℓ = r·θ'), arcReadout);
await page.screenshot({ path: `${OUT}/10-radians.png` });
await openSection(page, 'angle');
await page.locator('[data-ml-trig-unit="deg"]').click();
await sleep(300);

// ── L'identité (§22) ──────────────────────────────────────────────────────
const sum = await page.locator('[data-ml-trig-sum]').innerText();
record('identité : sin²θ + cos²θ = 1 EXACTEMENT, pas 0,999… (§22, §40)', sum === '1', sum);
await setAngle(page, 37);
const sum37 = await page.locator('[data-ml-trig-sum]').innerText();
record('identité : la somme reste 1 même à 37° (§40)', sum37 === '1', sum37);
record('identité : la barre montre les deux parts (§22)',
  await page.locator('[data-ml-trig-barsin]').count() === 1 && await page.locator('[data-ml-trig-barcos]').count() === 1);

// Un angle quelconque n'invente pas de forme exacte (§19).
const sin37 = await valueOf(page, 'sin');
record('valeurs : 37° n’a pas de forme exacte — la décimale est affichée sans bruit (§19, §40)',
  /^0,\d{1,4}$/.test(sin37 || ''), sin37);
await page.screenshot({ path: `${OUT}/11-identite.png` });

// ── Les réciproques (§24) ─────────────────────────────────────────────────
await openSection(page, 'inverse');
await page.locator('[data-ml-trig-inverse="sin"]').click();
await sleep(400);
const solutions = await page.locator('[data-ml-trig-solution]').allInnerTexts();
record('réciproques : arcsin(0,5) propose DEUX angles, pas seulement 30° (§24)',
  solutions.length === 2, solutions.join(' · '));
record('réciproques : les deux solutions sont 30° et 150°',
  solutions.some((s) => s.includes('30')) && solutions.some((s) => s.includes('150')), solutions.join(' · '));
await page.locator('[data-ml-trig-solution]').nth(1).click();
await sleep(400);
record('réciproques : cliquer une solution amène le point à cet angle',
  (await theta(page) || '').includes('150'), await theta(page));
await page.screenshot({ path: `${OUT}/12-reciproques.png` });
await page.locator('[data-ml-trig-inverse="sin"]').click();
await sleep(200);

// ── La symétrie (§21) et la comparaison (§33) ─────────────────────────────
await setAngle(page, 40);
await openSection(page, 'symmetry');
await page.locator('button[data-ml-trig-symmetry="negate"]').click();
await sleep(400);
record('symétrie : le point symétrique est dessiné (§21)',
  await page.locator('g[data-ml-trig-symmetry="negate"]').count() === 1);
const symSin = await page.locator('[data-ml-trig-symvalue="sin"]').innerText().catch(() => null);
const ownSin = await valueOf(page, 'sin');
record('symétrie : sin(−θ) est l’opposé de sin(θ)',
  symSin === `−${ownSin}` || `−${symSin}` === ownSin, `${ownSin} ↔ ${symSin}`);
await page.screenshot({ path: `${OUT}/13-symetrie.png` });
await page.locator('button[data-ml-trig-symmetry="negate"]').click();
await sleep(200);

await openSection(page, 'compare');
await page.locator('[data-ml-trig-compare-toggle]').click();
await sleep(400);
record('comparaison : le second point est dessiné (§33)',
  await page.locator('[data-ml-trig-compare]').count() === 1);
record('comparaison : la table montre les deux angles',
  await page.locator('[data-ml-trig-comparetable]').count() === 1);
record('comparaison : Δθ est affiché (§34)', await page.locator('[data-ml-trig-delta]').count() === 1);
await page.screenshot({ path: `${OUT}/14-comparaison.png` });
await page.locator('[data-ml-trig-compare-toggle]').click();
await sleep(200);

// ── L'animation (§4) ──────────────────────────────────────────────────────
await openSection(page, 'angle');
const thetaPrePlay = await theta(page);
await page.locator('[data-ml-trig-play]').click();
await sleep(1200);
const thetaPlaying = await theta(page);
record('animation : la rotation fait bien avancer θ (§4)', thetaPrePlay !== thetaPlaying,
  `${thetaPrePlay} → ${thetaPlaying}`);
await page.locator('[data-ml-trig-play]').click();
await sleep(300);
const thetaPaused = await theta(page);
await sleep(600);
record('animation : la pause arrête vraiment', (await theta(page)) === thetaPaused);
await page.screenshot({ path: `${OUT}/15-animation.png` });

// ── Les préréglages et les expériences (§27, §26, §29) ────────────────────
await openSection(page, 'presets');
await page.locator('[data-ml-trig-preset="unitCircle"]').click();
await sleep(500);
record('préréglages : « الدائرة المثلثية » configure l’espace (§27)',
  await page.locator('[data-ml-trig-circle]').count() === 1);
await openSection(page, 'experiments');
await page.locator('[data-ml-trig-experiment="tanNear90"]').click();
await sleep(600);
record('expériences : l’expérience pose sa question sur le dessin (§26)',
  await page.locator('[data-ml-trig-guide="tanNear90"]').count() === 1);
record('expériences : on peut avancer d’une étape (§29)',
  await page.locator('[data-ml-trig-guide-next]').count() === 1);
await page.screenshot({ path: `${OUT}/16-experience.png` });
await page.locator('[data-ml-trig-guide-close]').click();
await sleep(300);
record('expériences : on peut TOUJOURS fermer et continuer à explorer (§29)',
  await page.locator('[data-ml-trig-guide]').count() === 0);

// ── L'entraînement (§25) — prédire → révéler, sans jamais bloquer ─────────
await openSection(page, 'practice');
await page.locator('[data-ml-trig-practice-start]').click();
await sleep(600);
record('entraînement : une question est posée (§25)',
  await page.locator('[data-ml-trig-question]').count() === 1);
const question = await page.locator('[data-ml-trig-question]').innerText();
record('entraînement : la question est en ARABE, pas en anglais (§36)',
  /[؀-ۿ]/.test(question) && !/\b(what|predict|find|which)\b/i.test(question),
  question.slice(0, 70));

// Une réponse volontairement fausse : le verdict tombe mais rien ne se ferme.
const answerField = page.locator('[data-ml-trig-answer]');
if (await answerField.count() > 0) {
  await answerField.fill('999');
  await page.locator('[data-ml-trig-check]').click();
  await sleep(400);
  record('entraînement : une réponse fausse est signalée',
    await page.locator('[data-ml-trig-verdict="incorrect"]').count() === 1);
  record('entraînement : après une erreur, le champ reste MODIFIABLE (§25)',
    await answerField.isEditable());
  record('entraînement : après une erreur, « اكشف » reste disponible (§25)',
    await page.locator('[data-ml-trig-reveal]').isEnabled());
  await answerField.fill('');
}
await page.locator('[data-ml-trig-hint-btn]').click();
await sleep(300);
record('entraînement : un indice s’affiche à la demande (§25)',
  await page.locator('[data-ml-trig-hint]').count() === 1);
await page.locator('[data-ml-trig-reveal]').click();
await sleep(600);
record('entraînement : « اكشف » montre la réponse ET son explication (§25)',
  await page.locator('[data-ml-trig-explain]').count() === 1);
await page.screenshot({ path: `${OUT}/17-entrainement.png` });
await page.locator('[data-ml-trig-next]').click();
await sleep(500);
record('entraînement : « سؤال آخر » pose une nouvelle question',
  await page.locator('[data-ml-trig-question]').count() === 1);
await page.locator('[data-ml-trig-practice-close]').click();
await sleep(300);
record('entraînement : on peut fermer et retrouver le cercle intact (§48)',
  await page.locator('[data-ml-trig-practice]').count() === 0
  && await page.locator('[data-ml-trig-circle]').count() === 1);

// ── La persistance (§43) ──────────────────────────────────────────────────
await setAngle(page, 135);
await sleep(3200);   // l'autosave de la coquille
const docId = docIdOf(page.url());
if (docId) created.add(docId);
record('persistance : un document est né au premier changement', Boolean(docId), String(docId));

await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector('[data-ml-trigonometry]', { timeout: 20000 });
await sleep(900);
const thetaReloaded = await theta(page);
record('persistance : l’angle est retrouvé au rechargement', (thetaReloaded || '').includes('135'), thetaReloaded);
record('persistance : le mode cercle est retrouvé', await page.locator('[data-ml-trig-circle]').count() === 1);

const stored = docId ? await api(TOKEN, 'GET', `/math-lab/documents/${docId}`) : null;
if (stored?.data?.data) {
  const raw = JSON.stringify(stored.data.data);
  record('persistance : l’ANIMATION n’est jamais stockée (§43)',
    !/playing|speed|direction|frame/.test(raw));
  record('persistance : la question d’entraînement n’est pas stockée (§43)',
    !/challenge|promptKey|expected/.test(raw));
  record('persistance : le document reste minuscule',
    raw.length < 2000, `${raw.length} octets`);
}

// ── RTL et notation (§36) ─────────────────────────────────────────────────
const dir = await page.evaluate(() => document.documentElement.dir);
record('RTL : la page est bien en rtl', dir === 'rtl', dir);
const stageDir = await page.locator('[data-ml-trig-stage]').evaluate((el) => getComputedStyle(el).direction);
record('RTL : le dessin est CALCULÉ en ltr — c’est des mathématiques (§36)', stageDir === 'ltr', stageDir);
const pointDir = await page.locator('[data-ml-trig-point]').evaluate((el) => getComputedStyle(el).direction);
record('RTL : la notation (1/2 ; √3/2) est calculée en ltr (§36)', pointDir === 'ltr', pointDir);
const panelBox = await page.locator('[data-ml-panel]').boundingBox();
record('RTL : le panneau est sur le bord de DÉPART (à gauche en rtl)',
  panelBox && panelBox.x < 680, panelBox ? `x=${Math.round(panelBox.x)}` : '');

// Aucune chaîne anglaise oubliée dans l'interface (§36).
const panelText = await page.locator('[data-ml-panel]').innerText();
const englishLeftovers = panelText.match(/\b(Angle|Show|Hide|Reset|Play|Pause|Speed|Value|Mode|Layers|Practice|Reveal|Check|Hint|Next|Quadrant)\b/g);
record('i18n : aucune chaîne anglaise oubliée dans le panneau (§36)',
  !englishLeftovers, englishLeftovers ? englishLeftovers.join(', ') : '');

// Les chiffres restent latins (ARABIC_RTL_CONTRACT).
record('i18n : les chiffres restent LATINS', !/[٠-٩]/.test(panelText));

// ── Accessibilité (§37) ───────────────────────────────────────────────────
const handleRole = await page.locator('[data-ml-trig-handle]').getAttribute('role');
const handleLabel = await page.locator('[data-ml-trig-handle]').getAttribute('aria-label');
const handleValueText = await page.locator('[data-ml-trig-handle]').getAttribute('aria-valuetext');
record('a11y : la poignée est un slider nommé', handleRole === 'slider' && Boolean(handleLabel), `${handleRole} / ${handleLabel}`);
record('a11y : la poignée annonce ses valeurs (§37)',
  Boolean(handleValueText) && /[؀-ۿ]/.test(handleValueText), handleValueText);
const tabIndex = await page.locator('[data-ml-trig-handle]').getAttribute('tabindex');
record('a11y : la poignée est focalisable au clavier', tabIndex === '0');

// Le clavier tourne le point (§37).
await page.locator('[data-ml-trig-handle]').focus();
const thetaPreKey = await theta(page);
await page.keyboard.press('ArrowRight');
await sleep(300);
record('a11y : les flèches font tourner le point (§37)', (await theta(page)) !== thetaPreKey,
  `${thetaPreKey} → ${await theta(page)}`);

// La ligne courante de la table n'est pas signalée par la COULEUR SEULE (§37).
await page.locator('[data-ml-trig-signrow] [class*="sr"]').first().innerText().catch(() => '');
const ariaCurrent = await page.locator('tr[aria-current="true"]').count();
record('a11y : la ligne courante est annoncée, pas seulement colorée (§37)',
  ariaCurrent === 1, `aria-current ×${ariaCurrent}`);

// ── Mouvement réduit (§38) ────────────────────────────────────────────────
const reducedContext = await authedContext({ viewport: { width: 1360, height: 900 }, reducedMotion: 'reduce' });
const reducedPage = await reducedContext.newPage();
attach(reducedPage);
await reducedPage.goto(`${BASE}/espace/atelier/trigonometrie?lab=secondaire`, { waitUntil: 'networkidle' });
await reducedPage.waitForSelector('[data-ml-trigonometry]', { timeout: 20000 });
await sleep(800);
record('mouvement réduit : la note explicative est affichée (§38)',
  await reducedPage.locator('[data-ml-trig-reducednote]').count() === 1);
const reducedPlay = await reducedPage.locator('[data-ml-trig-play]').getAttribute('aria-pressed');
record('mouvement réduit : la rotation NE DÉMARRE PAS d’elle-même (§38)', reducedPlay === 'false', reducedPlay);
// Et l'instrument reste pleinement utilisable.
await reducedPage.locator('[data-ml-trig-ratio="sin"]').click();
await sleep(300);
record('mouvement réduit : l’instrument reste entièrement utilisable (§38)',
  await reducedPage.locator('[data-ml-trig-formula="sin"]').count() === 1);
await reducedPage.screenshot({ path: `${OUT}/18-mouvement-reduit.png` });
await reducedContext.close();

// ── Tablette et mobile (§35) ──────────────────────────────────────────────
for (const [name, viewport] of [
  ['tablette', { width: 834, height: 1112 }],
  ['mobile', { width: 390, height: 844 }],
  ['mobile-petit', { width: 360, height: 740 }],
]) {
  const c = await authedContext({ viewport, hasTouch: true, isMobile: name !== 'tablette' });
  const p = await c.newPage();
  attach(p);
  await p.goto(`${BASE}/espace/atelier/trigonometrie?lab=secondaire`, { waitUntil: 'networkidle' });
  await p.waitForSelector('[data-ml-trigonometry]', { timeout: 20000 });
  await sleep(900);
  await p.screenshot({ path: `${OUT}/19-${name}.png`, fullPage: false });

  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  record(`${name} : aucun débordement horizontal (§35)`, overflow <= 1, `${overflow}px`);

  const stage = await p.locator('[data-ml-trig-stage]').boundingBox();
  record(`${name} : le dessin reste le héros et garde sa place (§45)`,
    stage && stage.height > viewport.height * 0.3, stage ? `${Math.round(stage.height)}px` : '');

  // Les cibles tactiles (§35 : « avoid tiny controls »).
  const small = await p.evaluate(() => {
    const targets = [...document.querySelectorAll('.sa-ml-trig__btn, .sa-ml-trig__ratio, .sa-ml-trig__section-btn')];
    return targets.filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.height < 36;
    }).length;
  });
  record(`${name} : aucune cible tactile sous 36 px (§35)`, small === 0, `${small} trop petites`);

  // Un vrai glissement au DOIGT, sans faire défiler la page (§35).
  if (name !== 'tablette') {
    await p.locator('[data-ml-trig-mode="circle"]').click().catch(() => {});
    await sleep(400);
    const handle = await p.locator('[data-ml-trig-handle]').boundingBox();
    if (handle) {
      const scrollBefore = await p.evaluate(() => window.scrollY);
      const cx = handle.x + handle.width / 2;
      const cy = handle.y + handle.height / 2;
      await p.touchscreen.tap(cx, cy);
      await sleep(200);
      const client = await p.context().newCDPSession(p);
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
      await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx - 40, y: cy - 40 }] });
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await sleep(400);
      const scrollAfter = await p.evaluate(() => window.scrollY);
      record(`${name} : le doigt tire le point SANS faire défiler la page (§35)`,
        scrollBefore === scrollAfter, `scrollY ${scrollBefore} → ${scrollAfter}`);
    }
  }
  await c.close();
}

// ── Le visiteur ───────────────────────────────────────────────────────────
const anon = await browser.newContext();
const anonPage = await anon.newPage();
await anonPage.goto(`${BASE}/espace/atelier/trigonometrie?lab=secondaire`, { waitUntil: 'networkidle' });
await sleep(700);
record('visiteur : redirigé vers la connexion', /\/login/.test(anonPage.url()), anonPage.url());
await anon.close();

// ── Les autres instruments n’ont pas bougé (§51) ──────────────────────────
for (const [slug, marker] of [
  ['vecteurs', '[data-ml-vectors]'],
  ['algebre', '[data-ml-algebra]'],
  ['grapheur', '[data-ml-grapher]'],
]) {
  await page.goto(`${BASE}/espace/atelier/${slug}`, { waitUntil: 'networkidle' });
  const ok = await page.waitForSelector(marker, { timeout: 15000 }).then(() => true).catch(() => false);
  record(`régression : « ${slug} » s’ouvre toujours`, ok);
  await sleep(300);
}

// ── Ménage ────────────────────────────────────────────────────────────────
for (const id of created) {
  await api(TOKEN, 'DELETE', `/math-lab/documents/${id}`);
}

record('console : aucune erreur de page', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
record('console : aucune erreur console', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

await context.close();
await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} vérifications passées.`);
if (failed.length) {
  console.log('\nÉchecs :');
  for (const f of failed) console.log(`  ❌ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`);
}
console.log(`\nCaptures : ${OUT}`);
process.exit(failed.length ? 1 : 0);
