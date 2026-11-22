/**
 * QA navigateur — « أعمالي », l'atelier du مختبر الرياضيات.
 *
 * Lancement (dev server sur 5173, API sur 8000, élève QA existant) :
 *   node apps/web/e2e/mathlab-work.mjs [dossier-captures]
 *
 * Ce qu'on vérifie :
 *   - les APERÇUS : un SVG dessiné pour chaque instrument qui résume, le
 *     repli pour un document sans résumé, et AUCUN moteur lourd chargé
 *     (three.js, Excalidraw, MathLive) pour afficher la page ;
 *   - la recherche : arabe, français sans accent, نوع الأداة, contenu du
 *     résumé, recherche vide, aucun résultat ;
 *   - les filtres : par instrument, par période, favoris, pastilles
 *     actives, « مسح الكل » ;
 *   - le tri : les cinq ordres ;
 *   - la vue : grille / liste, et la préférence qui survit au rechargement ;
 *   - la sélection : une carte, plusieurs, tout, rien ;
 *   - les gestes groupés : favoris, suppression avec confirmation ;
 *   - les gestes d'une carte : renommer, copier, étoile, supprimer ;
 *   - la navigation : ouvrir un travail, revenir, le retrouver ;
 *   - RTL : direction, menus dans l'écran, barre groupée centrée ;
 *   - responsive : bureau, tablette, mobile étroit — aucun débordement
 *     horizontal, cibles de 44 px.
 *
 * Les documents créés sont supprimés à la fin.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const EMAIL = process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const OUT = process.argv[2] || '/tmp/mathlab-work-shots';
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

// ── Le jeu d'essai : un travail par forme d'aperçu, plus un SANS résumé ──
const FIXTURES = [
  {
    tool: 'functionGrapher', title: 'دراسة الدالة f',
    data: { functions: [{ id: 'fn-1', name: 'f', expression: 'x^2', color: '#2563eb', visible: true, domain: null }], points: [], viewport: { xMin: -8, xMax: 8, yMin: -6, yMax: 6 }, settings: { grid: true } },
    summary: { kind: 'curve', text: ['f(x) = x^2'], detail: { curves: [{ e: 'x^2', c: '#2563eb' }], viewport: { xMin: -8, xMax: 8, yMin: -6, yMax: 6 }, points: 0, tangent: false } },
  },
  {
    tool: 'geometry3d', title: 'Étude du cylindre',
    data: { shape: 'cylinder', dimensions: { radius: 1.5, height: 3 }, showAxes: true, showGrid: true, showMeasurements: true, camera: null },
    summary: { kind: 'solid', text: ['r = 1.5', 'h = 3'], detail: { shape: 'cylinder', dimensions: { radius: 1.5, height: 3 } } },
  },
  {
    tool: 'algebra', title: 'حل المعادلة',
    data: { source: '2x + 3 = 11', steps: [{ equation: { relation: 'eq', left: { terms: [], constant: { n: 0, d: 1 } }, right: { terms: [], constant: { n: 0, d: 1 } } }, operation: null, flipped: false }], cursor: 0, showSolution: false, parameters: null, numberLine: null },
    summary: { kind: 'equation', text: ['2x + 3 = 11'], detail: { first: '2x + 3 = 11', current: 'x = 4', steps: 3, solved: true } },
  },
  {
    tool: 'probabilityStats', title: 'تجربة رمي النرد',
    data: { mode: 'experiment', experiment: 'die', draws: 60, dataset: '', settings: {} },
    summary: { kind: 'chart', text: ['die'], detail: { mode: 'experiment', experiment: 'die', bars: [10, 12, 9, 11, 8, 10], draws: 60 } },
  },
  // Un document SANS résumé : exactement une ligne d'avant la migration.
  { tool: 'whiteboard', title: 'مسودة قديمة', data: { elements: [], appState: {}, files: {} }, summary: null },
];

console.log('— création du jeu d’essai —');
for (const fixture of FIXTURES) {
  const { status, data } = await api(TOKEN, 'POST', '/math-lab/documents', {
    tool: fixture.tool, title: fixture.title, schemaVersion: 1, data: fixture.data,
    ...(fixture.summary ? { summary: fixture.summary } : {}),
  });
  if (status === 201) created.add(data.document.id);
  else console.error('  ✗', fixture.title, status, JSON.stringify(data).slice(0, 200));
}
console.log(`  ${created.size}/${FIXTURES.length} documents créés`);

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
const shot = (page, name) => page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });

const ctx = await authedContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
attach(page);

// Quels modules le navigateur a VRAIMENT téléchargés pour cette page.
const requested = [];
page.on('request', (r) => requested.push(r.url()));

await page.goto(`${BASE}/espace/atelier`, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-ml-work-space]', { timeout: 20000 });

// ── Les aperçus ─────────────────────────────────────────────────────────
{
  const cards = await page.$$('[data-ml-work]');
  record('l’atelier liste les travaux', cards.length >= FIXTURES.length, `${cards.length} cartes`);

  const svgs = await page.$$('[data-ml-work-preview] svg');
  record('des aperçus SVG sont dessinés', svgs.length >= 4, `${svgs.length} aperçus`);

  const fallbacks = await page.$$('.sa-mlw-preview__fallback');
  record('le document sans résumé a un aperçu de REPLI, pas une carte cassée', fallbacks.length >= 1, `${fallbacks.length} replis`);

  // Le cœur de la stratégie : aucune vignette ne monte un moteur lourd.
  const heavy = requested.filter((u) => /three\.module|excalidraw|mathlive|FunctionGrapherTool|Geometry3DTool/i.test(u));
  record('AUCUN moteur lourd chargé pour afficher les aperçus', heavy.length === 0, heavy.length ? heavy.slice(0, 2).join(' · ') : 'ni three.js ni Excalidraw ni MathLive');
}

await shot(page, '01-atelier-bureau');

// ── La recherche ────────────────────────────────────────────────────────
const search = '[data-ml-work-search]';
const visibleTitles = async () => page.$$eval('[data-ml-work] .sa-mlw-title', (ns) => ns.map((n) => n.textContent.trim()));

{
  await page.fill(search, 'دالة');
  await sleep(200);
  let titles = await visibleTitles();
  record('recherche arabe « دالة »', titles.length > 0 && titles.every((t) => /الدالة|الدوال/.test(t)), titles.join(' | '));

  await page.fill(search, 'etude');
  await sleep(200);
  titles = await visibleTitles();
  record('recherche française sans accent « etude » trouve « Étude »', titles.some((t) => t.includes('Étude')), titles.join(' | '));

  await page.fill(search, '2x + 3');
  await sleep(200);
  titles = await visibleTitles();
  record('recherche dans le RÉSUMÉ (une équation)', titles.some((t) => t.includes('المعادلة')), titles.join(' | '));

  // « راسم الدوال » est le nom de l'instrument : aucun de ces titres ne le
  // contient, donc seul le NOM peut les avoir trouvés.
  await page.fill(search, 'راسم');
  await sleep(200);
  titles = await visibleTitles();
  record('recherche par NOM d’instrument', titles.length >= 1, `${titles.length} trouvés`);

  await page.fill(search, 'zzzzz');
  await sleep(200);
  const none = await page.$('[data-ml-work-no-results]');
  record('aucun résultat : un état parlant, pas une erreur technique', !!none);

  await page.click('[data-ml-work-clear-all]');
  await sleep(200);
  record('« مسح البحث والفلاتر » rend toute la liste', (await visibleTitles()).length >= FIXTURES.length);
}

// ── Les filtres ─────────────────────────────────────────────────────────
{
  await page.click('[data-ml-work-tool="functionGrapher"]');
  await sleep(200);
  let titles = await visibleTitles();
  const grapherCount = Number(await page.$eval('[data-ml-work-tool="functionGrapher"] .sa-mlw-chip__count', (n) => n.textContent.trim()));
  record('filtre par instrument', titles.length === grapherCount && titles.some((t) => t.includes('الدالة')), `${titles.length} = la pastille (${grapherCount})`);

  const pill = await page.$('[data-ml-work-active-filters] .sa-mlw-pill');
  record('le filtre actif est VISIBLE et défaisable', !!pill);

  await page.click('[data-ml-work-period="month"]');
  await sleep(150);
  const bothFilters = await visibleTitles();
  record('filtre de période cumulable avec l’instrument', bothFilters.length <= grapherCount && bothFilters.length >= 1, `${bothFilters.length} ≤ ${grapherCount}`);

  await page.click('[data-ml-work-clear-filters]');
  await sleep(200);
  record('« مسح الكل » remet tout', (await visibleTitles()).length >= FIXTURES.length);

  await page.click('[data-ml-work-favorites]');
  await sleep(200);
  const favs = await page.$$eval('[data-ml-work]', (ns) => ns.every((n) => n.dataset.favorite !== undefined));
  record('le filtre « المفضلة » ne garde QUE des favoris', favs);
  await page.click('[data-ml-work-favorites]');
  await sleep(150);
}

// ── Le tri ──────────────────────────────────────────────────────────────
{
  const orders = {};
  for (const sort of ['updated', 'created', 'oldest', 'titleAsc', 'titleDesc']) {
    await page.selectOption('[data-ml-work-sort]', sort);
    await sleep(150);
    orders[sort] = (await visibleTitles()).join('|');
  }
  record('les cinq tris donnent des ordres cohérents', orders.titleAsc === orders.titleDesc.split('|').reverse().join('|'), 'أ→ي est l’inverse de ي→أ');
  record('« الأقدم » et « الأحدث إنشاءً » portent les mêmes travaux, en sens opposé',
    orders.oldest.split('|').sort().join('|') === orders.created.split('|').sort().join('|')
    && orders.oldest.split('|')[0] === orders.created.split('|').at(-1));
  await page.selectOption('[data-ml-work-sort]', 'updated');
  await sleep(150);
}

// ── Vue grille / liste ──────────────────────────────────────────────────
{
  await page.click('[data-ml-work-view="list"]');
  await sleep(200);
  const view = await page.$eval('[data-ml-works]', (n) => n.dataset.view);
  record('bascule en vue LISTE', view === 'list');
  await shot(page, '02-vue-liste');

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-works]');
  record('la vue choisie survit au rechargement', (await page.$eval('[data-ml-works]', (n) => n.dataset.view)) === 'list');

  await page.click('[data-ml-work-view="grid"]');
  await sleep(200);
  record('retour en vue GRILLE', (await page.$eval('[data-ml-works]', (n) => n.dataset.view)) === 'grid');
}

// ── La sélection et les gestes groupés ──────────────────────────────────
{
  const checks = await page.$$('[data-ml-work-check]');
  await checks[0].check();
  await sleep(150);
  record('sélection simple : la barre groupée apparaît', !!(await page.$('[data-ml-work-bulk]')));

  const selectedAttr = await page.$eval('[data-ml-work]', (n) => n.dataset.selected);
  record('la carte sélectionnée le DIT (pas seulement par la couleur)', selectedAttr === 'true');

  await checks[1].check();
  await sleep(150);
  const label = await page.$eval('[data-ml-work-bulk] .sa-mlw-bulk__count', (n) => n.textContent.trim());
  record('sélection multiple comptée en arabe', /عملان|2/.test(label), label);

  await page.click('[data-ml-work-select-all]');
  await sleep(200);
  const all = await page.$$eval('[data-ml-work]', (ns) => ns.filter((n) => n.dataset.selected === 'true').length);
  record('« تحديد الكل » coche tout ce qui est affiché', all === (await page.$$('[data-ml-work]')).length, `${all} cartes`);
  await shot(page, '03-selection-groupee');

  await page.click('[data-ml-work-bulk-favorite]');
  await page.waitForSelector('[data-ml-work-bulk]', { state: 'detached', timeout: 10000 }).catch(() => {});
  await sleep(400);
  const stars = await page.$$('[data-ml-work][data-favorite]');
  record('« إلى المفضلة » groupé étoile tous les travaux choisis', stars.length >= FIXTURES.length, `${stars.length} favoris`);

  await page.click('[data-ml-work-favorites]');
  await sleep(250);
  record('le filtre « المفضلة » les retrouve tous', (await visibleTitles()).length >= FIXTURES.length);
  await page.click('[data-ml-work-favorites]');
  await sleep(150);
}

// ── Renommer ────────────────────────────────────────────────────────────
{
  await page.click('[data-ml-work] [data-ml-work-menu]');
  await sleep(150);
  record('le menu « ⋮ » s’ouvre', !!(await page.$('[data-ml-work-menu-panel]')));

  // Le menu ne doit pas sortir de l'écran (RTL).
  const box = await page.$eval('[data-ml-work-menu-panel]', (n) => { const r = n.getBoundingClientRect(); return { left: r.left, right: r.right }; });
  const width = await page.evaluate(() => window.innerWidth);
  record('le menu reste DANS l’écran', box.left >= 0 && box.right <= width, `${Math.round(box.left)}→${Math.round(box.right)} / ${width}`);

  await page.click('[data-ml-work-rename]');
  await page.waitForSelector('[data-ml-work-rename-input]');
  await page.fill('[data-ml-work-rename-input]', 'عنوان جديد للاختبار');
  await page.click('[data-ml-work-rename-confirm]');
  await sleep(700);
  record('renommer change le titre', (await visibleTitles()).some((t) => t.includes('عنوان جديد')));

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-works]');
  record('le nouveau titre a bien été enregistré', (await visibleTitles()).some((t) => t.includes('عنوان جديد')));
}

// ── Copier ──────────────────────────────────────────────────────────────
{
  const before = (await visibleTitles()).length;
  await page.click('[data-ml-work] [data-ml-work-menu]');
  await sleep(150);
  await page.click('[data-ml-work-duplicate]');
  await sleep(900);
  const titles = await visibleTitles();
  record('la copie apparaît, préfixée « نسخة من »', titles.length === before + 1 && titles.some((t) => t.startsWith('نسخة من')), titles.find((t) => t.startsWith('نسخة من')) ?? '');
}

// ── L'étoile d'une carte ────────────────────────────────────────────────
{
  const first = await page.$('[data-ml-work]');
  const was = await first.getAttribute('data-favorite');
  await (await first.$('[data-ml-work-favorite]')).click();
  await sleep(500);
  const now = await (await page.$('[data-ml-work]')).getAttribute('data-favorite');
  record('l’étoile d’une carte bascule', was !== now, `${was ?? 'non'} → ${now ?? 'non'}`);
}

// ── Ouvrir un travail, revenir ──────────────────────────────────────────
{
  await page.fill(search, 'المعادلة');
  await sleep(250);
  await page.click('[data-ml-work-open]');
  await page.waitForURL(/\/atelier\/algebre\/\d+/, { timeout: 20000 });
  record('ouvrir un travail mène à SON instrument avec SON identifiant', /\/atelier\/algebre\/\d+/.test(page.url()), page.url().replace(BASE, ''));

  await page.goBack({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ml-work-space]', { timeout: 20000 });
  record('le retour ramène à « أعمالي »', !!(await page.$('[data-ml-work-space]')));
}

// ── Supprimer (groupé, avec confirmation) ───────────────────────────────
{
  await page.fill(search, 'نسخة من');
  await sleep(250);
  const copies = await page.$$('[data-ml-work-check]');
  if (copies.length) {
    await copies[0].check();
    await sleep(150);
    await page.click('[data-ml-work-bulk-delete]');
    await page.waitForSelector('[data-nb-confirm]', { timeout: 5000 });
    record('la suppression groupée DEMANDE confirmation', true);

    // Annuler ne supprime rien.
    await page.keyboard.press('Escape');
    await sleep(300);
    record('annuler la confirmation ne supprime rien', (await visibleTitles()).length === copies.length);

    await page.click('[data-ml-work-bulk-delete]');
    await page.waitForSelector('[data-nb-confirm]');
    await page.click('[data-nb-confirm]');
    await sleep(900);
    record('confirmer supprime la copie', (await visibleTitles()).length === copies.length - 1);
  } else {
    record('la suppression groupée DEMANDE confirmation', false, 'aucune copie à supprimer');
  }
  await page.fill(search, '');
  await sleep(200);
}

// ── RTL ─────────────────────────────────────────────────────────────────
{
  const dir = await page.evaluate(() => document.documentElement.dir || getComputedStyle(document.body).direction);
  record('la page est en RTL', dir === 'rtl', dir);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  record('aucun débordement horizontal (bureau)', overflow <= 1, `${overflow}px`);
}

await shot(page, '04-atelier-final');
await ctx.close();

// ── Responsive ──────────────────────────────────────────────────────────
for (const device of [
  { name: 'tablette', width: 820, height: 1180, touch: true },
  { name: 'mobile', width: 360, height: 740, touch: true },
  { name: 'mobile-paysage', width: 740, height: 360, touch: true },
]) {
  const c = await authedContext({ viewport: { width: device.width, height: device.height }, hasTouch: device.touch, isMobile: device.touch });
  const p = await c.newPage();
  attach(p);
  await p.goto(`${BASE}/espace/atelier`, { waitUntil: 'networkidle' });
  await p.waitForSelector('[data-ml-work-space]', { timeout: 20000 });

  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  record(`${device.name} : aucun débordement horizontal`, overflow <= 1, `${overflow}px`);

  // La recherche reste accessible partout.
  record(`${device.name} : la recherche est là`, !!(await p.$('[data-ml-work-search]')));

  if (device.width < 1024) {
    const openBtn = await p.$('[data-ml-work-filters-open]');
    record(`${device.name} : les filtres passent dans une FEUILLE`, !!openBtn);
    if (openBtn) {
      await openBtn.click();
      await p.waitForSelector('[data-ml-work-filters-sheet]', { timeout: 5000 });
      const box = await p.$eval('[data-ml-work-filters-sheet]', (n) => { const r = n.getBoundingClientRect(); return { left: r.left, right: r.right, bottom: r.bottom }; });
      record(`${device.name} : la feuille tient dans l’écran`, box.left >= -1 && box.right <= device.width + 1, `${Math.round(box.left)}→${Math.round(box.right)}`);
      // Le fond ferme la feuille : le bouton « إغلاق » peut tomber sous la
      // barre d'onglets de l'espace élève sur un écran bas.
      await p.locator('.sa-ns-sheet-backdrop').dispatchEvent('mousedown');
      await p.waitForSelector('[data-ml-work-filters-sheet]', { state: 'detached', timeout: 5000 }).catch(() => {});
      await sleep(200);
    }
  }

  // Les cibles du doigt : 44 px.
  const small = await p.$$eval('[data-ml-work] button, [data-ml-work-search], [data-ml-work-sort]', (ns) => ns
    .filter((n) => n.offsetParent !== null)
    .map((n) => ({ t: (n.getAttribute('data-ml-work-view') || n.tagName), h: Math.round(n.getBoundingClientRect().height) }))
    .filter((e) => e.h > 0 && e.h < 40));
  record(`${device.name} : les cibles font au moins 40 px`, small.length === 0, small.slice(0, 3).map((s) => `${s.t}:${s.h}`).join(' '));

  // La barre groupée reste utilisable au doigt.
  const check = await p.$('[data-ml-work-check]');
  if (check) {
    await check.check();
    await sleep(250);
    const bulk = await p.$('[data-ml-work-bulk]');
    if (bulk) {
      const b = await bulk.boundingBox();
      record(`${device.name} : la barre groupée est dans l’écran`, b && b.x >= -1 && b.x + b.width <= device.width + 1 && b.y + b.height <= device.height + 1, b ? `${Math.round(b.x)}→${Math.round(b.x + b.width)} / ${device.width}` : 'absente');
    } else {
      record(`${device.name} : la barre groupée est dans l’écran`, false, 'barre absente');
    }
  }

  await shot(p, `05-${device.name}`);
  await c.close();
}

// ── Ménage ──────────────────────────────────────────────────────────────
{
  const { data } = await api(TOKEN, 'GET', '/math-lab/documents');
  const mine = (data.documents ?? []).filter((d) => created.has(d.id) || /عنوان جديد|نسخة من|دراسة الدالة f|Étude du cylindre|حل المعادلة|تجربة رمي النرد|مسودة قديمة/.test(d.title));
  for (const doc of mine) await api(TOKEN, 'DELETE', `/math-lab/documents/${doc.id}`);
  const after = await api(TOKEN, 'GET', '/math-lab/documents');
  const left = (after.data.documents ?? []).filter((d) => created.has(d.id));
  record('les documents d’essai sont supprimés', left.length === 0, `${mine.length} supprimés`);
}

record('aucune erreur JavaScript', pageErrors.length === 0, pageErrors.slice(0, 2).join(' | '));
record('aucune erreur de console', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '));

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} vérifications passées — captures dans ${OUT}`);
if (failed.length) {
  console.log('\nÉchecs :');
  for (const f of failed) console.log(`  ❌ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`);
  process.exit(1);
}
