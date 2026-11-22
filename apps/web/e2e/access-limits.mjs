/**
 * « الوصول والحدود » au navigateur — docs/architecture/ACCESS_AND_LIMITS.md.
 *
 *   node e2e/access-limits.mjs [dossier-captures]
 *
 * Variables : QA_BASE (http://localhost:5173), QA_API, QA_STUDENT_EMAIL /
 * QA_PASSWORD (un élève au palier GRATUIT), QA_ADMIN_TOKEN (facultatif : un
 * jeton Sanctum d'administrateur — sans lui, la partie admin est sautée).
 *
 * Vérifie, avec la configuration INITIALE (logic = premium, whiteboard =
 * gratuit, cahier et travaux limités en gratuit) :
 *   - l'accueil du مختبر : cadenas sur l'instrument premium, aucun sur le
 *     gratuit, compteur des travaux ;
 *   - l'instrument premium ouvert par son URL : panneau explicatif, pas d'outil ;
 *   - l'API directe refuse (403 premium_required) — l'interface n'est pas la porte ;
 *   - « Mon cahier » : compteur des nouvelles notes ;
 *   - mobile 390 px : pas de défilement horizontal ;
 *   - admin : la page liste chaque instrument, une bascule s'enregistre, se
 *     voit côté élève, puis est remise en place.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const EMAIL = process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const ADMIN_TOKEN = process.env.QA_ADMIN_TOKEN || '';
const OUT = process.argv[2] || '/tmp/access-limits-shots';
mkdirSync(OUT, { recursive: true });

const results = [];
const record = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
};

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

const summary = await api(TOKEN, 'GET', '/me/feature-access');
record('résumé servi', summary.status === 200 && summary.data.tier === 'free', `palier ${summary.data.tier}`);

const browser = await chromium.launch();
const pageErrors = [];
async function pageAs(token, options = {}) {
  const context = await browser.newContext({ locale: 'ar-DZ', ...options });
  await context.addInitScript((t) => window.localStorage.setItem('token', t), token);
  const page = await context.newPage();
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  return page;
}
const noHorizontalScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

// ── Élève : accueil du مختبر ───────────────────────────────────────────────
const page = await pageAs(TOKEN);
await page.goto(`${BASE}/espace/atelier`, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-ml-tool-card="whiteboard"]', { timeout: 20000 });
await page.waitForSelector('[data-ml-tool-card="logic"][data-ml-tool-locked="true"]', { timeout: 10000 }).catch(() => null);
record('cadenas sur l’instrument premium', await page.locator('[data-ml-tool-card="logic"][data-ml-tool-locked="true"]').count() === 1);
record('pas de cadenas sur l’instrument gratuit', await page.locator('[data-ml-tool-card="whiteboard"][data-ml-tool-locked]').count() === 0);
record('compteur des travaux', await page.locator('[data-quota-meter="document_generation"]').count() === 1,
  (await page.locator('[data-quota-meter="document_generation"]').textContent().catch(() => '')) ?? '');
await page.screenshot({ path: `${OUT}/01-home.png`, fullPage: true });

// ── Élève : l'instrument premium ouvert ────────────────────────────────────
await page.click('[data-ml-tool-card="logic"]');
await page.waitForSelector('[data-feature-locked]', { timeout: 15000 }).catch(() => null);
record('instrument premium : panneau explicatif', await page.locator('[data-feature-locked="premium_required"]').count() === 1);
record('instrument premium : aucun outil monté', await page.locator('[data-ml-status]').count() === 0);
await page.screenshot({ path: `${OUT}/02-locked-tool.png`, fullPage: true });

// ── L'API directe ──────────────────────────────────────────────────────────
const direct = await api(TOKEN, 'POST', '/math-lab/documents', { tool: 'logic', title: 'x', schemaVersion: 1, data: { area: 'statements' } });
record('API directe refusée', direct.status === 403 && direct.data.code === 'premium_required', `HTTP ${direct.status}`);

// ── « Mon cahier » ─────────────────────────────────────────────────────────
await page.goto(`${BASE}/espace/cahier`, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-quota-meter="notebook_copy"]', { timeout: 15000 }).catch(() => null);
record('compteur des nouvelles notes', await page.locator('[data-quota-meter="notebook_copy"]').count() === 1);
await page.screenshot({ path: `${OUT}/03-notebook.png`, fullPage: true });

// ── Mobile ─────────────────────────────────────────────────────────────────
const mobile = await pageAs(TOKEN, { viewport: { width: 390, height: 844 } });
await mobile.goto(`${BASE}/espace/atelier`, { waitUntil: 'networkidle' });
await mobile.waitForSelector('[data-ml-tool-card="logic"][data-ml-tool-locked="true"]', { timeout: 20000 }).catch(() => null);
record('mobile : accueil sans défilement horizontal', await noHorizontalScroll(mobile));
await mobile.screenshot({ path: `${OUT}/04-home-mobile.png`, fullPage: true });
await mobile.click('[data-ml-tool-card="logic"]');
await mobile.waitForSelector('[data-feature-locked]', { timeout: 15000 }).catch(() => null);
record('mobile : panneau sans défilement horizontal', await noHorizontalScroll(mobile));
await mobile.screenshot({ path: `${OUT}/05-locked-mobile.png`, fullPage: true });

// ── Administration ─────────────────────────────────────────────────────────
if (ADMIN_TOKEN) {
  const admin = await pageAs(ADMIN_TOKEN, { viewport: { width: 1360, height: 900 } });
  await admin.goto(`${BASE}/admin/offres/acces`, { waitUntil: 'networkidle' });
  await admin.waitForSelector('[data-access-tools] [data-access-row]', { timeout: 20000 }).catch(() => null);
  const rows = await admin.locator('[data-access-tools] [data-access-row]').count();
  record('admin : une ligne par instrument', rows === 14, `${rows} lignes`);
  record('admin : cahier et travaux', await admin.locator('[data-access-row="notebook"]').count() === 1
    && await admin.locator('[data-access-row="math_lab.documents"]').count() === 1);
  await admin.screenshot({ path: `${OUT}/06-admin.png`, fullPage: true });

  // Ouvrir « logic » au gratuit (geste non restrictif : pas de confirmation).
  const row = admin.locator('[data-access-row="math_lab.tool.logic"]');
  await row.locator('input[role="switch"]').nth(1).check();
  await row.locator('button').first().click();
  await admin.waitForTimeout(800);
  const after = await api(TOKEN, 'GET', '/me/feature-access');
  record('admin → élève : l’outil s’ouvre sans déploiement', after.data.features?.['math_lab.tool.logic']?.allowed === true);

  // La remise en place est RESTRICTIVE : la confirmation doit apparaître.
  await row.locator('input[role="switch"]').nth(1).uncheck();
  await row.locator('button').first().click();
  const dialog = admin.getByRole('dialog');
  await dialog.waitFor({ timeout: 5000 }).catch(() => null);
  record('admin : confirmation d’un geste restrictif', await dialog.count() === 1);
  await admin.screenshot({ path: `${OUT}/07-admin-confirm.png` });
  await dialog.getByRole('button').last().click();
  await admin.waitForTimeout(800);
  const restored = await api(TOKEN, 'GET', '/me/feature-access');
  record('admin : configuration remise en place', restored.data.features?.['math_lab.tool.logic']?.allowed === false);
} else {
  console.log('ℹ️  QA_ADMIN_TOKEN absent : partie administration sautée.');
}

record('aucune erreur de page', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
await browser.close();

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} vérifications — captures dans ${OUT}`);
process.exit(failed ? 1 : 0);
