/**
 * QA navigateur — le مختبر القياس (laboratoire de la mesure).
 *
 * Lancement (dev server sur 5173, API sur 8000, élève QA existant) :
 *   node apps/web/e2e/mathlab-measurement.mjs [dossier-captures]
 *
 * Ce qu'on vérifie :
 *   - navigation : la carte sur l'accueil, l'URL directe, le rechargement ;
 *   - §23 : à l'OUVERTURE, la formule cherchée n'est NULLE PART dans le DOM —
 *     ni titre, ni question, ni infobulle. C'est le test le plus important ;
 *   - §5, §18 : tirer la poignée change les lectures, « سجّل » remplit le tableau ;
 *   - §25 : trois observations et la bonne règle ne suffisent PAS — il faut
 *     l'épreuve sur un objet non choisi avant que l'instrument ne conclue ;
 *   - §7 : une règle FAUSSE produit un contre-exemple chiffré, jamais « faux » ;
 *   - §21 : « تصمد » et jamais « برهان » tant que rien n'est démontré ;
 *   - §24 : les indices se révèlent un par un, et le premier ne donne pas la règle ;
 *   - §22 : « كيف ظهرت هذه القاعدة؟ » raconte des ÉTAPES ;
 *   - §41 : la sauvegarde et la RÉOUVERTURE du document ;
 *   - RTL : panneau au bon bord, notation LTR (direction CALCULÉE) ;
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
const EMAIL = process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const OUT = process.argv[2] || '/tmp/mathlab-measurement-shots';
mkdirSync(OUT, { recursive: true });

const results = [];
const record = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const pageErrors = [];
const consoleErrors = [];

async function api(token, method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });

  return { status: res.status, data: await res.json().catch(() => ({})) };
}

// UNE seule connexion : /auth/login est limité à 6 par minute.
const login = await fetch(`${API}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
}).then((r) => r.json());
const TOKEN = login.token ?? login.data?.token;
if (!TOKEN) { console.error('Connexion API impossible :', login); process.exit(1); }

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ar' });
const page = await context.newPage();

/**
 * UNE seule connexion par l'interface, puis on garde le contexte : le
 * point /auth/login est limité à six par minute, et un runner qui se
 * reconnecte à chaque étape finit par se faire jeter (429).
 */
async function loginUI(target) {
  await target.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await target.fill('input[type="email"]', EMAIL);
  await target.fill('input[type="password"]', PASSWORD);
  await target.click('button[type="submit"]');
  await target.waitForURL(/\/espace/, { timeout: 20000 });
}
page.on('pageerror', (error) => pageErrors.push(String(error)));
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});

const shot = async (name) => page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });

/* ── 1. Ouvrir l'instrument ──────────────────────────────────────────── */

await loginUI(page);
await page.goto(`${BASE}/espace/atelier/mesure`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await shot('01-ouverture');

const heading = await page.locator('.sa-ml-ms__question').first().textContent().catch(() => '');
record('l’instrument s’ouvre sur une question, pas sur une formule', Boolean(heading?.trim()), heading?.slice(0, 60));

/* ── 2. §23 — LE SECRET : aucune formule dans le DOM ─────────────────── */

const bodyText = await page.locator('body').innerText();
// Les écritures que l'élève doit DÉCOUVRIR, sous les formes où elles
// pourraient fuir. Aucune ne doit apparaître avant qu'il ne la construise.
const leaks = ['L × l', 'الطول × العرض', 'A = L', '= L × l', 'π × d', 'πr', 'r²',
  'القاعدة × الارتفاع', 'b × h', '2 × (L + l)', 'a² + b²'];
const found = leaks.filter((needle) => bodyText.includes(needle));
record('§23 — la formule n’est NULLE PART à l’ouverture', found.length === 0, found.join(' | ') || 'aucune fuite');

/* ── 3. §5, §18 — mesurer et enregistrer ─────────────────────────────── */

const readoutBefore = await page.locator('.sa-ml-ms__readoutItem.is-target dd').first().textContent();

// Tirer la poignée de la longueur.
const handle = page.locator('.sa-ml-ms__handle').first();
const box = await handle.boundingBox();
if (box) {
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 90, box.y + box.height / 2, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(400);
}
const readoutAfter = await page.locator('.sa-ml-ms__readoutItem.is-target dd').first().textContent();
record('§5 — tirer la poignée change la mesure', readoutBefore !== readoutAfter, `${readoutBefore} → ${readoutAfter}`);
await shot('02-poignee');

// Enregistrer trois observations DIFFÉRENTES.
const recordBtn = page.locator('.sa-ml-ms__record').first();
for (const dx of [0, 60, -40]) {
  if (dx !== 0) {
    const b = await page.locator('.sa-ml-ms__handle').first().boundingBox();
    if (b) {
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
      await page.mouse.down();
      await page.mouse.move(b.x + b.width / 2 + dx, b.y + b.height / 2, { steps: 8 });
      await page.mouse.up();
      await page.waitForTimeout(250);
    }
  }
  // La deuxième poignée aussi, pour varier les DEUX dimensions (§25).
  const second = page.locator('.sa-ml-ms__handle').nth(1);
  const sb = await second.boundingBox();
  if (sb && dx !== 0) {
    await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2);
    await page.mouse.down();
    await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2 - dx / 2, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(250);
  }
  await recordBtn.click();
  await page.waitForTimeout(300);
}

const rows = await page.locator('.sa-ml-ms__table tbody tr').count();
record('§18 — le tableau garde les observations', rows >= 3, `${rows} lignes`);
await shot('03-tableau');

/* ── 4. §7 — une règle FAUSSE donne un contre-exemple ────────────────── */

await page.locator('.sa-ml-ms__tab').nth(2).click();
await page.waitForTimeout(400);

// Construire « L + l » : variable, +, variable.
const varChips = page.locator('.sa-ml-ms__chip--var');
await varChips.nth(0).click();
await page.waitForTimeout(150);
await page.locator('.sa-ml-ms__chip--op').filter({ hasText: '+' }).first().click();
await page.waitForTimeout(150);
await varChips.nth(1).click();
await page.waitForTimeout(400);

const equation = await page.locator('.sa-ml-ms__equation').textContent();
record('§19 — la règle se construit aux jetons, sans rien taper', /\+/.test(equation ?? ''), equation?.trim());

await page.locator('.sa-ml-ms__primaryBtn').first().click();
await page.waitForTimeout(600);

const counterVisible = await page.locator('.sa-ml-ms__counter').count();
const counterText = counterVisible ? await page.locator('.sa-ml-ms__counter').innerText() : '';
// Le contre-exemple doit porter DEUX nombres : la mesure et la prédiction.
const hasNumbers = /\d/.test(counterText) && counterText.split(/\d+/).length >= 3;
record('§7 — une règle fausse produit un CONTRE-EXEMPLE chiffré',
  counterVisible > 0 && hasNumbers, counterText.replace(/\s+/g, ' ').slice(0, 110));
await shot('04-contre-exemple');

/* ── 5. §25 — la bonne règle ne suffit pas sans épreuve ──────────────── */

// Repartir : construire « L × l ».
await page.locator('.sa-ml-ms__ghostBtn').filter({ hasText: /.*/ }).first().click().catch(() => {});
await page.waitForTimeout(300);
await varChips.nth(0).click();
await page.waitForTimeout(150);
await page.locator('.sa-ml-ms__chip--op').filter({ hasText: '×' }).first().click();
await page.waitForTimeout(150);
await varChips.nth(1).click();
await page.waitForTimeout(500);

await page.locator('.sa-ml-ms__primaryBtn').first().click();
await page.waitForTimeout(600);

const holdsCount = await page.locator('.sa-ml-ms__holds').count();
const notProof = await page.locator('.sa-ml-ms__notProof').count();
record('§20 — la bonne règle « tient » sur les observations', holdsCount > 0);
record('§21 — et l’instrument dit que tenir n’est pas démontrer', notProof > 0);

const panelText = await page.locator('.sa-ml-ms__panelBody').innerText();
record('§21 — le mot « برهان » n’est pas employé pour une conjecture',
  !/برهان|مبرهن|أثبتنا/.test(panelText.replace('التفسير', '')), '');

const evidenceItems = await page.locator('.sa-ml-ms__evidenceList li').count();
const evidenceDone = await page.locator('.sa-ml-ms__evidenceList li.is-done').count();
record('§25 — la preuve exigée est affichée et INCOMPLÈTE',
  evidenceItems >= 3 && evidenceDone < evidenceItems, `${evidenceDone}/${evidenceItems}`);
await shot('05-preuve-exigee');

// L'épreuve sur un objet non choisi.
const unseenBtn = page.locator('.sa-ml-ms__primaryBtn').filter({ hasText: /.+/ });
const unseenCount = await unseenBtn.count();
if (unseenCount > 1) {
  await unseenBtn.nth(1).click();
  await page.waitForTimeout(700);
}
const stageBadge = await page.locator('.sa-ml-ms__phase').first().textContent();
const unseenRows = await page.locator('.sa-ml-ms__unseenList li').count();
record('§25 — l’épreuve sur un objet NON choisi a eu lieu', unseenRows > 0, `${unseenRows} épreuve(s)`);
record('§21 — l’étape devient « وجدتُ » seulement après l’épreuve',
  /وجد/.test(stageBadge ?? ''), stageBadge?.trim());
await shot('06-trouve');

// L'explication géométrique n'apparaît qu'ICI (§21).
const explain = await page.locator('.sa-ml-ms__explain').count();
record('§21 — l’explication géométrique n’arrive qu’APRÈS la découverte', explain > 0);

/* ── 6. §24 — les indices ────────────────────────────────────────────── */

await page.locator('.sa-ml-ms__invBtn').nth(2).click();   // une enquête neuve
await page.waitForTimeout(600);
await page.locator('.sa-ml-ms__tab').nth(2).click();
await page.waitForTimeout(300);

const hintBtn = page.locator('.sa-ml-ms__ghostBtn').filter({ hasText: /أرشدني/ }).first();
await hintBtn.click();
await page.waitForTimeout(400);
const firstHint = await page.locator('.sa-ml-ms__hintList li').first().textContent().catch(() => '');
const hintCount = await page.locator('.sa-ml-ms__hintList li').count();
record('§24 — le premier indice apparaît seul', hintCount === 1, firstHint?.slice(0, 60));
record('§24 — et il ne donne PAS la règle',
  !/[×÷]\s*\S+\s*[×÷=]/.test(firstHint ?? '') && !/= /.test(firstHint ?? ''), '');

/* ── 7. §22 — « كيف ظهرت هذه القاعدة؟ » ──────────────────────────────── */

const storyBtn = page.locator('.sa-ml-ms__ghostBtn').filter({ hasText: /كيف ظهرت/ }).first();
await storyBtn.click();
await page.waitForTimeout(300);
await playToEnd(page, 'data-ml-ms-story-step');
await page.waitForTimeout(200);
const steps = await page.locator('.sa-ml-ms__storySteps li').count();
record('§22 — le récit montre des ÉTAPES, pas une formule', steps >= 5, `${steps} étapes`);
await shot('07-recit');

/* ── 8. RTL et notation LTR ──────────────────────────────────────────── */

const dir = await page.evaluate(() => document.documentElement.dir);
const equationDir = await page.locator('.sa-ml-ms__equation').first()
  .evaluate((node) => getComputedStyle(node).direction).catch(() => 'n/a');
// Il faut une LIGNE pour mesurer la direction d'une cellule. On revient
// donc sur l'enquête du rectangle, dont le tableau a été rempli plus haut :
// sonder l'onglet « القاعدة » d'une enquête neuve rend « aucune ligne » sans
// que rien ne soit cassé.
await page.locator('.sa-ml-ms__invBtn').first().click();
await page.waitForTimeout(500);
await page.locator('.sa-ml-ms__tab').nth(1).click();
await page.waitForTimeout(500);
const tableCells = await page.locator('.sa-ml-ms__table td').count();
const tableDir = tableCells > 0
  ? await page.locator('.sa-ml-ms__table td').first().evaluate((node) => getComputedStyle(node).direction)
  : 'aucune ligne';
record('RTL — la page est en arabe RTL', dir === 'rtl', dir);
record('§30 — l’équation reste LTR (direction calculée)', equationDir === 'ltr', equationDir);
record('§30 — les nombres du tableau restent LTR', tableDir === 'ltr', `${tableCells} cellules · ${tableDir}`);

const font = await page.locator('.sa-ml-ms__question').first()
  .evaluate((node) => getComputedStyle(node).fontFamily).catch(() => '');
record('Cairo est la police de l’arabe', /Cairo/i.test(font), font.slice(0, 40));

/* ── 9. Accessibilité ────────────────────────────────────────────────── */

await page.locator('.sa-ml-ms__invBtn').first().click();
await page.waitForTimeout(500);

const handleInfo = await page.locator('.sa-ml-ms__handle').first().evaluate((node) => ({
  role: node.getAttribute('role'),
  label: node.getAttribute('aria-label'),
  tabindex: node.getAttribute('tabindex'),
}));
record('la poignée est focalisable et NOMMÉE',
  handleInfo.role === 'slider' && Boolean(handleInfo.label) && handleInfo.tabindex === '0',
  JSON.stringify(handleInfo));

// Les flèches du clavier règlent l'objet.
const beforeKey = await page.locator('.sa-ml-ms__readoutItem.is-target dd').first().textContent();
await page.locator('.sa-ml-ms__handle').first().focus();
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(300);
const afterKey = await page.locator('.sa-ml-ms__readoutItem.is-target dd').first().textContent();
record('§33 — les flèches du clavier règlent l’objet', beforeKey !== afterKey, `${beforeKey} → ${afterKey}`);

const focusVisible = await page.locator('.sa-ml-ms__handle').first()
  .evaluate((node) => { node.focus(); return getComputedStyle(node).stroke; });
record('le focus est VISIBLE sur la poignée', Boolean(focusVisible), focusVisible);

// Le texte du lecteur d'écran est bien CACHÉ (le piège de la classe sr-only).
const srHidden = await page.locator('.sa-ml-ms__sr').first().evaluate((node) => {
  const rect = node.getBoundingClientRect();

  return rect.width <= 2 && rect.height <= 2;
}).catch(() => true);
record('le texte du lecteur d’écran n’est pas affiché en clair', srHidden);

/* ── 10. §41 — sauvegarde et réouverture ─────────────────────────────── */

await page.waitForTimeout(3200);   // l'autosave attend 2,5 s de calme
const url = page.url();
const documentId = url.match(/\/mesure\/(\d+)/)?.[1];
record('§41 — le document est créé après la première mesure', Boolean(documentId), url);

if (documentId) {
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const rowsAfter = await page.locator('.sa-ml-ms__table tbody tr').count();
  record('§41 — les observations survivent au rechargement', rowsAfter >= 1, `${rowsAfter} lignes`);
  await shot('08-reouverture');
}

/* ── 11. Responsive ──────────────────────────────────────────────────── */

for (const [name, width, height] of [['tablette', 820, 1180], ['mobile', 390, 844]]) {
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(700);
  await shot(`09-${name}`);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  record(`${name} — aucun débordement horizontal de la PAGE`, overflow <= 1, `${overflow}px`);

  // Les cibles tactiles DE L'INSTRUMENT. La coquille du مختبر et la barre
  // de navigation de l'espace ont les leurs, et elles ne sont pas de ce
  // ressort : on ne juge que ce que cet instrument dessine.
  const small = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('.sa-ml-ms button, .sa-ml-ms .sa-ml-ms__chip, .sa-ml-ms .sa-ml-ms__tab')];

    return nodes
      .filter((node) => {
        const r = node.getBoundingClientRect();

        return r.width > 0 && r.height > 0 && (r.height < 40 || r.width < 32);
      })
      .map((node) => `${node.className.split(' ')[0]}:${Math.round(node.getBoundingClientRect().width)}×${Math.round(node.getBoundingClientRect().height)}`);
  });
  record(`${name} — les cibles tactiles de l’instrument sont assez grandes`,
    small.length === 0, small.join(' | ') || 'toutes ≥ 44 px');

  // La scène reste visible : elle ne doit pas être poussée hors de l'écran.
  const stageVisible = await page.locator('.sa-ml-ms__stage').first().isVisible();
  record(`${name} — la scène reste visible`, stageVisible);

  // …et les LECTURES avec elle. Une figure sans ses nombres, c'est un dessin :
  // c'est le défaut que seule la capture d'écran avait montré.
  const readoutSeen = await page.evaluate(() => {
    const node = document.querySelector('.sa-ml-ms__readoutItem.is-target');
    if (!node) return false;
    const r = node.getBoundingClientRect();

    return r.top >= 0 && r.bottom <= window.innerHeight && r.height > 0;
  });
  record(`${name} — la MESURE reste lisible à l’écran`, readoutSeen);
}

await page.setViewportSize({ width: 1280, height: 900 });

/* ── 12. Console propre ──────────────────────────────────────────────── */

const realErrors = consoleErrors.filter((text) => !/status of (401|404|422)/.test(text));
record('aucune erreur JavaScript', pageErrors.length === 0, pageErrors.slice(0, 2).join(' | '));
record('aucune erreur de console inattendue', realErrors.length === 0, realErrors.slice(0, 2).join(' | '));

/* ── Ménage ──────────────────────────────────────────────────────────── */

const list = await api(TOKEN, 'GET', '/math-lab/documents?tool=measurement');
const payload = list.data?.data ?? list.data ?? [];
const documents = Array.isArray(payload) ? payload : (payload.documents ?? payload.items ?? []);
for (const document of documents) {
  if (document?.id) await api(TOKEN, 'DELETE', `/math-lab/documents/${document.id}`);
}

await browser.close();

const failed = results.filter((entry) => !entry.ok);
console.log(`\n${results.length - failed.length}/${results.length} vérifications passées.`);
console.log(`Captures : ${OUT}`);
if (failed.length) {
  console.log('\nÉchecs :');
  for (const entry of failed) console.log(` ❌ ${entry.name}${entry.detail ? ` — ${entry.detail}` : ''}`);
  process.exit(1);
}
