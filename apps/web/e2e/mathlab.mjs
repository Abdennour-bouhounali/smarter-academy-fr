/**
 * QA navigateur — « L’atelier de mathématiques » (/espace/atelier) et son tableau blanc.
 *
 * Lancement (dev server sur 5173, API sur 8000, élève QA existant) :
 *   node apps/web/e2e/mathlab.mjs [dossier-captures]
 *
 * Ce qu'on vérifie :
 *   - navigation : l'entrée « L’atelier », l'accueil, l'ouverture du tableau,
 *     rechargement, précédent/suivant, segment inconnu, document d'autrui,
 *     visiteur non connecté ;
 *   - le tableau : crayon, rectangle, ellipse, flèche, ligne, texte, sélection
 *     et déplacement, gomme, annuler/rétablir, zoom, main (déplacement de la
 *     vue), grille, export PNG, « Tout effacer » avec confirmation ;
 *   - persistance : naissance du document au premier trait (URL réécrite),
 *     sauvegarde automatique, titre, relecture après rechargement, « Mes travaux »,
 *     suppression avec confirmation ;
 *   - les fichiers (« Fichiers ») : PNG, PDF, SVG ; 1 Mo au plus ; 3 par
 *     tableau, dit avant le geste et refusé côté serveur aussi ; type
 *     inconnu refusé ; sélection multiple jugée en entier ; image posée sur
 *     le tableau sans base64 dans le document ; téléchargement ; suppression
 *     qui rend de la place et retire l'image ; persistance ; panneau dans
 *     l'écran à toute taille ;
 *   - import d'une bibliothèque de formes par le même panneau : fichier
 *     valide, JSON invalide, pas de doublon, persistance ;
 *     le « Ouvrir » d'Excalidraw et le menu ⋮ de la bibliothèque vide (qui
 *     débordait du panneau) ont disparu ;
 *   - un document neuf laissé tel quel ne crée RIEN sur le serveur ;
 *   - langue : l'interface d'Excalidraw en français, de gauche à droite ;
 *   - responsive : bureau, tablette (tactile), mobile étroit — aucun
 *     débordement horizontal, boutons de 44 px.
 *
 * Les documents créés sont supprimés à la fin.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const EMAIL = process.env.QA_STUDENT_EMAIL || 'qa-eleve@exemple.fr';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const OUT = process.argv[2] || '/tmp/mathlab-shots';
mkdirSync(OUT, { recursive: true });

// ── Les fichiers d'import ────────────────────────────────────────────────
const FIX = join(tmpdir(), 'sa-mathlab-fixtures');
mkdirSync(FIX, { recursive: true });
const libElement = (id) => ({
  id, type: 'rectangle', x: 0, y: 0, width: 80, height: 60, angle: 0, strokeColor: '#1e1e1e', backgroundColor: 'transparent',
  fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, opacity: 100, groupIds: [], frameId: null, roundness: null,
  seed: 1, version: 1, versionNonce: 1, isDeleted: false, boundElements: null, updated: 1, link: null, locked: false,
});
const LIB_VALID = join(FIX, 'formes.excalidrawlib');
writeFileSync(LIB_VALID, JSON.stringify({
  type: 'excalidrawlib', version: 2, source: 'https://excalidraw.com',
  libraryItems: [
    { id: 'lib-a', status: 'unpublished', created: 1, name: 'Rectangle', elements: [libElement('e-a')] },
    { id: 'lib-b', status: 'unpublished', created: 2, name: 'Carré', elements: [libElement('e-b')] },
  ],
}));
const LIB_PNG = join(FIX, 'photo.png');
writeFileSync(LIB_PNG, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64'));
const LIB_BROKEN = join(FIX, 'cassee.excalidrawlib');
writeFileSync(LIB_BROKEN, '{ "type": "excalidrawlib", ');
const LIB_SCENE = join(FIX, 'dessin.excalidraw');
writeFileSync(LIB_SCENE, JSON.stringify({ type: 'excalidraw', version: 2, elements: [], appState: {} }));
const PNG_BYTES = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
const FILE_PNG = join(FIX, 'figure.png');
writeFileSync(FILE_PNG, PNG_BYTES);
const FILE_PNG_2 = join(FIX, 'schema.png');
writeFileSync(FILE_PNG_2, PNG_BYTES);
const FILE_PNG_LIMIT = join(FIX, 'juste-1mo.png');
writeFileSync(FILE_PNG_LIMIT, Buffer.concat([PNG_BYTES, Buffer.alloc(1_000_000 - PNG_BYTES.length)]));
const FILE_PNG_BIG = join(FIX, 'trop-lourd.png');
writeFileSync(FILE_PNG_BIG, Buffer.concat([PNG_BYTES, Buffer.alloc(1_000_001 - PNG_BYTES.length)]));
const FILE_PDF = join(FIX, 'exercice.pdf');
writeFileSync(FILE_PDF, '%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n');
const FILE_SVG = join(FIX, 'graphe.svg');
writeFileSync(FILE_SVG, '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="#dbeafe"/></svg>');
const FILE_DOCX = join(FIX, 'cours.docx');
writeFileSync(FILE_DOCX, 'PK\u0003\u0004');

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
const docIdOf = (url) => Number((url.match(/\/atelier\/tableau\/(\d+)/) || [])[1]) || null;

/**
 * Attend que le geste précédent soit VRAIMENT parti.
 *
 * `waitForSelector('[data-ml-status="saved"]')` seul ne suffit pas : juste
 * après un trait, la coquille affiche encore « Enregistré » du geste d'AVANT
 * (la sérialisation attend 300 ms, la sauvegarde 2,5 s). On laisse donc
 * d'abord l'état devenir « modifié », puis on attend « Enregistré » — et si le
 * geste n'a rien changé, le court délai d'attente rend la main sans échouer.
 */
async function waitSaved(page, timeout = 15000) {
  await page.waitForSelector('[data-ml-status="dirty"], [data-ml-status="saving"]', { timeout: 2000 }).catch(() => {});
  await page.waitForSelector('[data-ml-status="saved"]', { timeout });
}

async function canvasBox(page) {
  const canvas = page.locator('[data-ml-whiteboard] canvas.interactive').first();
  await canvas.waitFor({ state: 'visible', timeout: 20000 });
  return canvas.boundingBox();
}

async function tool(page, name) {
  const btn = page.locator(`[data-ml-whiteboard] [data-testid="toolbar-${name}"]`).first();
  await btn.waitFor({ state: 'attached', timeout: 10000 });
  await btn.click({ force: true });
}

async function drag(page, from, to, steps = 12) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i += 1) {
    await page.mouse.move(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps);
  }
  await page.mouse.up();
}

async function elementCount(id) {
  const { data } = await api(TOKEN, 'GET', `/math-lab/documents/${id}`);
  return (data.document?.data?.elements || []).filter((e) => !e.isDeleted).length;
}

async function openFiles(page) {
  if (!(await page.locator('[data-ml-files]').count())) {
    await page.click('[data-ml-files-toggle]');
    await page.waitForSelector('[data-ml-files]', { timeout: 5000 });
  }
}

/** Dépose une sélection dans le panneau des fichiers et attend son verdict (succès ou refus). */
async function addFiles(page, files) {
  await openFiles(page);
  await page.setInputFiles('[data-ml-files-input]', files);
  await page.waitForSelector('[data-ml-files-message]', { timeout: 20000 });
  return page.getAttribute('[data-ml-files-message]', 'data-ml-files-message');
}
const filesMessage = (page) => page.locator('[data-ml-files-message]').innerText();
const filesCount = (page) => page.locator('[data-ml-file]').count();
const boardCounter = (page) => page.getAttribute('[data-ml-files-board]', 'data-ml-files-board');

const libraryUnits = (page) => page.locator('[data-ml-whiteboard] .library-unit').count();

const inside = (b, w, h) => !!b && b.x >= -0.5 && b.y >= -0.5 && b.x + b.width <= w + 0.5 && b.y + b.height <= h + 0.5;

async function openWhiteboard(page) {
  await page.goto(`${BASE}/espace/atelier/tableau`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-whiteboard] .excalidraw', { timeout: 30000 });
}

const ctx = await authedContext({ viewport: { width: 1440, height: 900 }, locale: 'fr-FR', acceptDownloads: true });
const page = await ctx.newPage();
attach(page);

try {
  record('connexion élève', !!authState);

  // ── 1. L'accueil de l'atelier ─────────────────────────────────────────
  await page.goto(`${BASE}/espace/atelier`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-home]', { timeout: 20000 });
  record('accueil : titre', (await page.locator('h1').first().innerText()).includes('L’atelier de mathématiques'));
  record('navigation : entrée « L’atelier » dans la barre latérale', await page.locator('aside a[href="/espace/atelier"]').count() === 1);
  // Une carte par instrument LIVRÉ — le nombre suit le registre, il n'est
  // plus écrit ici : l'assertion « exactement trois » datait du jour où le
  // l'atelier en avait trois, et elle a vieilli à chaque instrument livré.
  // Depuis les deux ateliers (MATH_LAB.md §2.1) : l'accueil montre le tableau,
  // commun, puis deux choix ; les autres instruments sont dans chaque atelier.
  // (mathlab-labs-scope.mjs vérifie cette architecture en détail.)
  record('accueil : le tableau, commun, en tête', await page.locator('[data-ml-common-tools] [data-ml-tool-card="whiteboard"]').count() === 1);
  record('accueil : deux choix — atelier du collège, atelier du lycée', await page.locator('[data-ml-lab-choice]').count() === 2);
  // PLANNED_MATH_LAB_TOOLS est vide depuis l'instrument des mesures : rien d'annoncé.
  if (await page.locator('[data-ml-planned]').count() > 0) {
    record('accueil : aucun lien vers un instrument annoncé', await page.locator('[data-ml-planned] a').count() === 0);
  }
  await page.screenshot({ path: `${OUT}/01-home-desktop.png`, fullPage: true });

  // ── 2. Ouvrir le tableau ──────────────────────────────────────────────
  await page.click('[data-ml-tool-card="whiteboard"]');
  await page.waitForURL(/\/espace\/atelier\/tableau$/, { timeout: 15000 });
  await page.waitForSelector('[data-ml-whiteboard] .excalidraw', { timeout: 30000 });
  record('tableau : ouvert, document neuf non enregistré', (await page.getAttribute('[data-ml-status]', 'data-ml-status')) === 'clean');
  // Excalidraw ne pose pas `dir` lui-même : il hérite de <html lang="fr"> sans
  // `dir`. On lit la direction calculée, et la page ne porte aucun dir="rtl".
  record('tableau : Excalidraw de gauche à droite', (await page.locator('[data-ml-whiteboard] .excalidraw').first().evaluate((el) => getComputedStyle(el).direction)) === 'ltr'
    && (await page.getAttribute('html', 'lang')) === 'fr' && await page.locator('[dir="rtl"]').count() === 0);
  // L'interface d'Excalidraw parle français (langCode="fr-FR") : les titres de la
  // barre d'outils sont en lettres latines et ne contiennent aucune lettre arabe.
  const toolbarTitle = await page.locator('[data-ml-whiteboard] label[title]').first().getAttribute('title').catch(() => '') || '';
  const toolbarText = await page.locator('[data-ml-whiteboard] .App-toolbar').first().innerText().catch(() => '') || '';
  const frenchUi = await page.locator('[data-ml-whiteboard] [data-testid="toolbar-freedraw"]').count() === 1
    && /[A-Za-zÀ-ÿ]/.test(toolbarTitle)
    && !/[\u0600-\u06FF]/.test(toolbarTitle + toolbarText);
  record('tableau : interface Excalidraw en français', frenchUi, toolbarTitle);
  record('accessibilité : région du canevas nommée', !!(await page.getAttribute('[data-ml-whiteboard]', 'aria-label')));
  await page.screenshot({ path: `${OUT}/02-whiteboard-empty.png` });

  await page.waitForTimeout(4500);
  record('persistance : un document neuf laissé tel quel ne crée rien', /\/espace\/atelier\/tableau$/.test(page.url()) && (await page.getAttribute('[data-ml-status]', 'data-ml-status')) === 'clean');

  // ── 3. Dessiner ───────────────────────────────────────────────────────
  const box = await canvasBox(page);
  const P = (fx, fy) => ({ x: box.x + box.width * fx, y: box.y + box.height * fy });

  await tool(page, 'freedraw');
  await drag(page, P(0.2, 0.3), P(0.35, 0.45), 20);
  await page.waitForURL(/\/espace\/atelier\/tableau\/\d+(?:\?lab=\w+)?$/, { timeout: 12000 });
  const docId = docIdOf(page.url());
  created.add(docId);
  record('persistance : le document naît au premier trait, URL réécrite', docId != null);
  await waitSaved(page);
  record('persistance : sauvegarde automatique « Enregistré »', true);
  record('persistance : le trait est sur le serveur', (await elementCount(docId)) === 1);

  await page.waitForTimeout(300);
  await tool(page, 'rectangle');
  await drag(page, P(0.45, 0.25), P(0.6, 0.4));
  await tool(page, 'ellipse');
  await drag(page, P(0.65, 0.25), P(0.8, 0.4));
  await tool(page, 'arrow');
  await drag(page, P(0.2, 0.6), P(0.4, 0.7));
  await tool(page, 'line');
  await drag(page, P(0.45, 0.6), P(0.6, 0.6));
  await tool(page, 'text');
  await page.mouse.click(...Object.values(P(0.65, 0.65)));
  await page.waitForSelector('[data-ml-whiteboard] .excalidraw-wysiwyg', { timeout: 5000 });
  await page.keyboard.type('AB = 5 cm');
  await page.keyboard.press('Escape');
  await sleep(300);
  await waitSaved(page);
  const afterShapes = await elementCount(docId);
  record('tableau : crayon, rectangle, ellipse, flèche, ligne, texte', afterShapes === 6, `${afterShapes} éléments`);
  await page.screenshot({ path: `${OUT}/03-whiteboard-shapes.png` });

  // ── 4. Titre ─────────────────────────────────────────────────────────
  await page.fill('[data-ml-title]', 'Le triangle ABC');
  await waitSaved(page);
  const titled = await api(TOKEN, 'GET', `/math-lab/documents/${docId}`);
  record('persistance : le titre est enregistré', titled.data.document?.title === 'Le triangle ABC');

  // ── 5. Sélection et déplacement ───────────────────────────────────────
  await tool(page, 'selection');
  const before = (await api(TOKEN, 'GET', `/math-lab/documents/${docId}`)).data.document.data.elements.find((e) => e.type === 'rectangle');
  // On saisit le rectangle par son BORD : sans remplissage, son intérieur est vide.
  await drag(page, P(0.45, 0.325), P(0.45, 0.5));
  await sleep(300);
  await waitSaved(page);
  const after = (await api(TOKEN, 'GET', `/math-lab/documents/${docId}`)).data.document.data.elements.find((e) => e.type === 'rectangle');
  record('tableau : sélectionner et déplacer', !!before && !!after && after.y > before.y + 20, `y ${before?.y?.toFixed(0)} → ${after?.y?.toFixed(0)}`);

  // ── 6. Annuler / rétablir ─────────────────────────────────────────────
  await page.click('[data-ml-whiteboard] [data-testid="button-undo"]');
  await sleep(300);
  await waitSaved(page);
  const undone = (await api(TOKEN, 'GET', `/math-lab/documents/${docId}`)).data.document.data.elements.find((e) => e.type === 'rectangle');
  record('tableau : annuler', Math.abs(undone.y - before.y) < 1);
  await page.click('[data-ml-whiteboard] [data-testid="button-redo"]');
  await sleep(300);
  await waitSaved(page);
  const redone = (await api(TOKEN, 'GET', `/math-lab/documents/${docId}`)).data.document.data.elements.find((e) => e.type === 'rectangle');
  record('tableau : rétablir', Math.abs(redone.y - after.y) < 1);

  // ── 7. Gomme ─────────────────────────────────────────────────────────
  await tool(page, 'eraser');
  await drag(page, P(0.18, 0.28), P(0.37, 0.47), 30);
  await sleep(300);
  await waitSaved(page);
  const erased = await elementCount(docId);
  record('tableau : gomme', erased < afterShapes, `${afterShapes} → ${erased}`);
  await tool(page, 'selection');

  // ── 8. Zoom, main, grille ─────────────────────────────────────────────
  const zoomLabel = () => page.locator('[data-ml-whiteboard] button', { hasText: '%' }).first().innerText().catch(() => '');
  const zoomBefore = await zoomLabel();
  const zoomIn = page.locator('[data-ml-whiteboard] [data-testid="zoom-in-button"], [data-ml-whiteboard] .zoom-in-button').first();
  await zoomIn.click();
  await zoomIn.click();
  const zoomAfter = await zoomLabel();
  record('tableau : zoom', zoomBefore !== zoomAfter, `${zoomBefore} → ${zoomAfter}`);
  await page.locator('[data-ml-whiteboard] [data-testid="zoom-out-button"], [data-ml-whiteboard] .zoom-out-button').first().click();
  await page.mouse.move(...Object.values(P(0.5, 0.5)));
  await page.keyboard.down('Control');
  await page.mouse.wheel(0, -200);
  await page.keyboard.up('Control');
  await tool(page, 'hand');
  await drag(page, P(0.5, 0.5), P(0.6, 0.55));
  record('tableau : main (déplacer la vue), sans erreur', pageErrors.length === 0);
  await tool(page, 'selection');
  await page.click('[data-ml-grid]');
  record('coquille : grille activée', (await page.getAttribute('[data-ml-grid]', 'aria-pressed')) === 'true');
  await page.screenshot({ path: `${OUT}/04-whiteboard-grid.png` });
  await page.click('[data-ml-grid]');

  // ── 9. Export PNG ─────────────────────────────────────────────────────
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }),
    page.click('[data-ml-export]'),
  ]);
  record('coquille : export PNG', download.suggestedFilename().endsWith('.png'), download.suggestedFilename());

  // ── 10. « Tout effacer » avec confirmation, puis annuler ─────────────
  await page.click('[data-ml-clear]');
  await page.waitForSelector('[role="alertdialog"]', { timeout: 5000 });
  await page.click('[role="alertdialog"] button:not([data-nb-confirm])');
  record('coquille : « Tout effacer » se refuse sans confirmation', (await elementCount(docId)) === erased);
  await page.click('[data-ml-clear]');
  await page.waitForSelector('[role="alertdialog"]', { timeout: 5000 });
  await page.click('[data-nb-confirm]');
  await sleep(300);
  await waitSaved(page);
  record('coquille : « Tout effacer » vide le tableau', (await elementCount(docId)) === 0);
  await page.click('[data-ml-whiteboard] [data-testid="button-undo"]');
  await sleep(300);
  await waitSaved(page);
  record('coquille : le vidage s’annule', (await elementCount(docId)) === erased);

  // ── 10b. Les fichiers du tableau ───────────────────────────────────
  record('fichiers : le bouton « Fichiers » est dans la barre', await page.locator('[data-ml-files-toggle]').count() === 1);
  await openFiles(page);
  record('fichiers : les deux compteurs sont dans le panneau', (await boardCounter(page)) === '0/3' && await page.locator('[data-ml-files-user]').count() === 1);
  await page.screenshot({ path: `${OUT}/08-files-empty.png` });

  let outcome = await addFiles(page, FILE_PNG);
  record('fichiers : une image PNG entre, 1 / 3', outcome === 'success' && (await filesCount(page)) === 1 && (await boardCounter(page)) === '1/3');
  record('fichiers : la carte dit le type et la taille', /PNG|Image/.test(await page.locator('[data-ml-file]').first().innerText()) && /\b(?:o|Ko|Mo)\b/.test(await page.locator('[data-ml-file]').first().innerText()));

  outcome = await addFiles(page, FILE_PNG_BIG);
  record('fichiers : 1 000 001 octets → « Fichier trop lourd »', outcome === 'error' && (await filesMessage(page)).includes('Fichier trop lourd') && (await filesCount(page)) === 1);
  outcome = await addFiles(page, FILE_DOCX);
  record('fichiers : .docx → « n’est pas accepté »', outcome === 'error' && (await filesMessage(page)).includes('Ce type de fichier n’est pas accepté') && (await filesCount(page)) === 1);
  await page.screenshot({ path: `${OUT}/08-files-error.png` });

  outcome = await addFiles(page, LIB_PNG);
  record('bibliothèque : une image nommée .png va aux fichiers, pas à la bibliothèque', outcome === 'success' && (await filesCount(page)) === 2);
  outcome = await addFiles(page, LIB_BROKEN);
  record('import : un JSON cassé est refusé (pas « Impossible d’importer la bibliothèque »)', outcome === 'error' && (await filesMessage(page)).includes('ce n’est pas une bibliothèque de formes valide'));
  outcome = await addFiles(page, LIB_VALID);
  const units = await libraryUnits(page);
  record('import : une bibliothèque valide entre (2 formes) sans prendre de place', outcome === 'success' && units === 2 && (await boardCounter(page)) === '2/3', `${units} formes`);
  record('import : le message de succès compte les formes', (await filesMessage(page)).includes('2 formes ajoutées à la bibliothèque'));
  record('bibliothèque : le « Ouvrir » d’Excalidraw a disparu', await page.locator('[data-ml-whiteboard] [data-testid="lib-dropdown--load"]:visible').count() === 0);
  outcome = await addFiles(page, LIB_VALID);
  record('import : réimporter la même bibliothèque ne la duplique pas', outcome === 'success' && (await libraryUnits(page)) === 2 && (await filesMessage(page)).includes('déjà dans ta bibliothèque'));
  await page.locator('[data-ml-whiteboard] [data-testid="sidebar-close"]').click().catch(() => {});

  outcome = await addFiles(page, [FILE_PDF, FILE_SVG]);
  record('fichiers : PDF + SVG en une sélection → 3 / 3 ; refus si 4', outcome === 'error' && (await filesMessage(page)).includes('Tu peux encore ajouter 1 fichier seulement') && (await filesCount(page)) === 2);
  outcome = await addFiles(page, FILE_PDF);
  record('fichiers : le PDF entre, le tableau est plein', outcome === 'success' && (await filesCount(page)) === 3 && (await boardCounter(page)) === '3/3');
  record('fichiers : « pleine » est dit AVANT le geste, bouton désactivé', await page.locator('[data-ml-files-full="board"]').count() === 1 && await page.locator('[data-ml-files-add]').isDisabled());
  outcome = await addFiles(page, FILE_SVG);
  record('fichiers : un 4e fichier est refusé côté client', outcome === 'error' && (await filesMessage(page)).includes('maximum de 3 fichiers') && (await filesCount(page)) === 3);
  const bypass = await fetch(`${API}/math-lab/documents/${docId}/files`, { method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' }, body: (() => { const f = new FormData(); f.append('file', new Blob([PNG_BYTES], { type: 'image/png' }), 'x.png'); return f; })() });
  record('sécurité : le serveur refuse aussi le 4e fichier (422, code)', bypass.status === 422 && (await bypass.json()).code === 'math_lab_board_file_limit');
  await page.screenshot({ path: `${OUT}/09-files-full.png` });

  await page.locator('[data-ml-file][data-ml-file-kind="image"] [data-ml-file-place]').first().click();
  await page.waitForTimeout(600);
  await waitSaved(page);
  let doc = (await api(TOKEN, 'GET', `/math-lab/documents/${docId}`)).data.document;
  const image = doc.data.elements.find((e) => e.type === 'image');
  record('fichiers : l’image posée sur le tableau référence le fichier, sans base64', !!image && /^sa-\d+(?:\?lab=\w+)?$/.test(image.fileId) && Object.keys(doc.data.files ?? {}).length === 0);
  await page.screenshot({ path: `${OUT}/09-files-placed.png` });

  const [dl] = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }),
    page.locator('[data-ml-file][data-ml-file-kind="pdf"] [data-ml-file-download]').click(),
  ]);
  record('fichiers : le PDF se télécharge', dl.suggestedFilename() === 'exercice.pdf');

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-whiteboard] .excalidraw', { timeout: 30000 });
  await page.waitForTimeout(800);
  await openFiles(page);
  record('fichiers : conservés après rechargement, 3 / 3', (await filesCount(page)) === 3 && (await boardCounter(page)) === '3/3');
  doc = (await api(TOKEN, 'GET', `/math-lab/documents/${docId}`)).data.document;
  record('fichiers : l’image reste sur le tableau après rechargement', doc.data.elements.some((e) => e.type === 'image'));

  // Le PDF : le tableau ne le pose pas sur le canevas, seulement le garde.
  await page.locator('[data-ml-file][data-ml-file-kind="pdf"] [data-ml-file-delete]').click();
  await page.waitForSelector('[role="alertdialog"]', { timeout: 5000 });
  await page.click('[data-nb-confirm]');
  await page.waitForFunction(() => document.querySelectorAll('[data-ml-file]').length === 2, null, { timeout: 10000 });
  record('fichiers : supprimer rend de la place, 2 / 3', (await boardCounter(page)) === '2/3' && (await api(TOKEN, 'GET', `/math-lab/documents/${docId}/files`)).data.files.length === 2);
  record('fichiers : un PDF ne se pose pas sur le tableau, il se garde', await page.locator('[data-ml-file][data-ml-file-kind="image"] [data-ml-file-place]').count() > 0);
  await page.locator('[data-ml-file][data-ml-file-kind="image"] [data-ml-file-delete]').first().click();
  await page.waitForSelector('[role="alertdialog"]', { timeout: 5000 });
  await page.click('[data-nb-confirm]');
  await page.waitForFunction(() => document.querySelectorAll('[data-ml-file]').length === 1, null, { timeout: 10000 });
  await page.waitForTimeout(400);
  await waitSaved(page);
  doc = (await api(TOKEN, 'GET', `/math-lab/documents/${docId}`)).data.document;
  record('fichiers : supprimer l’image la retire aussi du tableau', !doc.data.elements.some((e) => e.type === 'image' && e.fileId === image?.fileId));
  await page.click('[data-ml-files-close]');
  record('fichiers : le panneau se ferme', await page.locator('[data-ml-files]').count() === 0);

  // ── 11. Rechargement, retour, « Mes travaux » ────────────────────────
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-whiteboard] .excalidraw', { timeout: 30000 });
  record('navigation : rechargement — même document, titre relu', (await page.inputValue('[data-ml-title]')) === 'Le triangle ABC' && docIdOf(page.url()) === docId);
  await page.click('[data-ml-back]');
  await page.waitForSelector('[data-ml-home]', { timeout: 15000 });
  await page.waitForSelector(`[data-ml-doc="${docId}"]`, { timeout: 15000 });
  record('Mes travaux : le document est listé avec son titre', (await page.locator(`[data-ml-doc="${docId}"]`).innerText()).includes('Le triangle ABC'));
  await page.click(`[data-ml-doc="${docId}"] [data-ml-doc-open]`);
  await page.waitForSelector('[data-ml-whiteboard] .excalidraw', { timeout: 30000 });
  record('Mes travaux : rouvrir', docIdOf(page.url()) === docId);
  await page.goBack({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-home]', { timeout: 15000 });
  record('navigation : précédent', /\/espace\/atelier$/.test(page.url()));
  await page.goForward({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-whiteboard] .excalidraw', { timeout: 30000 });
  record('navigation : suivant', docIdOf(page.url()) === docId);

  // ── 12. Segment inconnu, document d'autrui / inexistant ──────────────
  await page.goto(`${BASE}/espace/atelier/inconnu`, { waitUntil: 'networkidle' });
  record('navigation : instrument inconnu → accueil de l’atelier', /\/espace\/atelier$/.test(page.url()));
  await page.goto(`${BASE}/espace/atelier/tableau/999999999`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-error]', { timeout: 15000 });
  record('sécurité : document inexistant ou d’autrui → « n’existe pas »', (await page.locator('[data-ml-error]').innerText()).includes('Ce travail n’existe pas ou n’est pas à toi.'));

  // ── 13. Suppression depuis « Mes travaux » ────────────────────────────
  await page.goto(`${BASE}/espace/atelier`, { waitUntil: 'networkidle' });
  await page.waitForSelector(`[data-ml-doc="${docId}"]`, { timeout: 15000 });
  // Depuis « Mes travaux » refait en atelier, les gestes de rangement vivent dans
  // le menu « ⋮ » de la carte plutôt qu'en boutons alignés : on l'ouvre
  // d'abord (MATH_LAB.md §5i.3).
  await page.click(`[data-ml-doc="${docId}"] [data-ml-work-menu]`);
  await page.click(`[data-ml-doc="${docId}"] [data-ml-doc-delete]`);
  await page.waitForSelector('[role="alertdialog"]', { timeout: 5000 });
  await page.click('[data-nb-confirm]');
  await page.waitForSelector(`[data-ml-doc="${docId}"]`, { state: 'detached', timeout: 10000 });
  record('Mes travaux : suppression avec confirmation', (await api(TOKEN, 'GET', `/math-lab/documents/${docId}`)).status === 404);
  created.delete(docId);
  await page.screenshot({ path: `${OUT}/05-home-after-delete.png`, fullPage: true });
} catch (e) {
  record('scénario bureau interrompu', false, String(e).slice(0, 300));
  await page.screenshot({ path: `${OUT}/error-desktop.png` }).catch(() => {});
} finally {
  await ctx.close();
}

// ── 14. Visiteur non connecté ─────────────────────────────────────────────
try {
  const anon = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'fr-FR' });
  const p = await anon.newPage();
  await p.goto(`${BASE}/espace/atelier/tableau`, { waitUntil: 'networkidle' });
  record('sécurité : visiteur → connexion', /\/login/.test(p.url()));
  await anon.close();
} catch (e) {
  record('visiteur', false, String(e).slice(0, 200));
}

// ── 15. Tablette et mobile ────────────────────────────────────────────────
for (const [label, width, height, touch] of [
  ['bureau-1920', 1920, 1080, false], ['bureau-1280', 1280, 720, false], ['bureau-bas-1280x500', 1280, 500, false],
  ['tablette', 1024, 768, true], ['tablette-portrait', 768, 1024, true],
  ['mobile-430', 430, 932, true], ['mobile', 390, 844, true], ['mobile-360', 360, 800, true], ['mobile-bas-360x600', 360, 600, true],
]) {
  const c = await authedContext({ viewport: { width, height }, locale: 'fr-FR', hasTouch: touch, isMobile: width < 700, deviceScaleFactor: 1 });
  const p = await c.newPage();
  attach(p);
  try {
    await p.goto(`${BASE}/espace/atelier`, { waitUntil: 'networkidle' });
    await p.waitForSelector('[data-ml-home]', { timeout: 20000 });
    const overflowHome = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    record(`${label} : accueil sans débordement horizontal`, overflowHome <= 0, `${overflowHome}px`);
    if (width < 700) {
      record('mobile : entrée « L’atelier » dans la barre d’onglets basse', await p.locator('nav.fixed.bottom-0 a[href="/espace/atelier"]').count() === 1);
    }
    await p.screenshot({ path: `${OUT}/06-home-${label}.png`, fullPage: true });

    await openWhiteboard(p);
    const box = await canvasBox(p);
    const overflowTool = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    record(`${label} : tableau sans débordement horizontal`, overflowTool <= 0, `${overflowTool}px`);
    const fits = await p.evaluate(() => {
      const el = document.querySelector('[data-ml-tool]');
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, inner: window.innerHeight };
    });
    record(`${label} : le tableau tient dans l’écran (sans défilement)`, fits.bottom <= fits.inner + 1 && box.height > 200, `bas ${fits.bottom.toFixed(0)} / ${fits.inner}, canevas ${box.height.toFixed(0)}px`);
    const saveBox = await p.locator('[data-ml-save]').boundingBox();
    const backBox = await p.locator('[data-ml-back]').boundingBox();
    record(`${label} : boutons de la coquille ≥ 44 px`, saveBox.height >= 44 && backBox.width >= 44 && backBox.height >= 44);

    // Le panneau des fichiers : dans l'écran à toute taille, et le premier
    // fichier d'un tableau neuf le fait naître.
    const toggleBox = await p.locator('[data-ml-files-toggle]').boundingBox();
    record(`${label} : « Fichiers » visible, ≥ 44 px, dans l’écran`, inside(toggleBox, width, height) && toggleBox.width >= 44 && toggleBox.height >= 44);
    await openFiles(p);
    const panel = await p.locator('[data-ml-files]').boundingBox();
    const addBox = await p.locator('[data-ml-files-add]').boundingBox();
    const closeBox = await p.locator('[data-ml-files-close]').boundingBox();
    record(`${label} : panneau, « Ajouter des fichiers », « Fermer » dans l’écran`, inside(panel, width, height) && inside(addBox, width, height) && inside(closeBox, width, height) && addBox.height >= 44 && closeBox.height >= 44);
    const outcome = await addFiles(p, [FILE_PNG, FILE_PDF]);
    await p.waitForURL(/\/espace\/atelier\/tableau\/\d+(?:\?lab=\w+)?$/, { timeout: 15000 });
    const newId = docIdOf(p.url());
    created.add(newId);
    record(`${label} : deux fichiers sur un tableau neuf → document créé, 2 / 3`, outcome === 'success' && (await filesCount(p)) === 2 && (await boardCounter(p)) === '2/3');
    const msg = await p.locator('[data-ml-files-message]').boundingBox();
    const lastFile = await p.locator('[data-ml-file]').last().boundingBox();
    const panelAfter = await p.locator('[data-ml-files]').boundingBox();
    const scrolls = await p.locator('[data-ml-files]').evaluate((el) => el.scrollHeight > el.clientHeight);
    record(`${label} : message et cartes dans l’écran (ou le panneau défile)`, inside(msg, width, height) && inside(panelAfter, width, height) && (inside(lastFile, width, height) || scrolls), scrolls ? 'défile' : '');
    // On mesure l'ESPACE DE TRAVAIL, pas l'élément <canvas> : Excalidraw
    // redimensionne le sien au rendu suivant, et le lire trop tôt donne la
    // taille d'avant l'ouverture du panneau.
    await p.waitForTimeout(500);
    const workspace = await p.locator('.sa-ml-workspace').boundingBox();
    record(`${label} : le tableau reste utilisable sous le panneau`, workspace.height >= 150, `${workspace.height.toFixed(0)}px`);
    await p.screenshot({ path: `${OUT}/10-files-${label}.png` });
    await addFiles(p, LIB_VALID);
    await p.waitForSelector('[data-ml-whiteboard] .sidebar', { timeout: 5000 });
    const dd = p.locator('[data-ml-whiteboard] .sidebar .library-menu-dropdown-container--in-heading [data-testid="dropdown-menu-button"]').first();
    await dd.click({ force: true });
    await p.waitForTimeout(400);
    const menu = await p.locator('[data-ml-whiteboard] .sidebar .dropdown-menu .dropdown-menu-container').first().boundingBox();
    record(`${label} : menu ⋮ de la bibliothèque dans l’écran`, inside(menu, width, height), menu ? `x${menu.x.toFixed(0)}–${(menu.x + menu.width).toFixed(0)}` : 'absent');
    await p.keyboard.press('Escape');
    await p.locator('[data-ml-whiteboard] [data-testid="sidebar-close"]').click({ force: true }).catch(() => {});
    await p.click('[data-ml-files-close]');
    await p.waitForTimeout(300);
    const overflowAfter = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    record(`${label} : toujours sans débordement horizontal`, overflowAfter <= 0, `${overflowAfter}px`);

    // Un trait au doigt, puis une forme : la persistance suit.
    const boxAfter = await canvasBox(p);
    await tool(p, 'freedraw');
    await drag(p, { x: boxAfter.x + boxAfter.width * 0.3, y: boxAfter.y + boxAfter.height * 0.4 }, { x: boxAfter.x + boxAfter.width * 0.5, y: boxAfter.y + boxAfter.height * 0.55 }, 16);
    await p.waitForTimeout(400);
    await waitSaved(p);
    record(`${label} : dessiner et enregistrer`, (await elementCount(newId)) === 1);
    await p.screenshot({ path: `${OUT}/07-whiteboard-${label}.png` });
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
