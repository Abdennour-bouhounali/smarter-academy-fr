// QA navigateur — phase 6 : la saisie d'un code d'activation, côté élève.
//
// Lancement (le lot doit être construit et servi, l'API en marche) :
//   npm run build && (cd apps/web && npx vite preview --port 4173)
//   cd apps/api && php artisan serve --port=8000
//   node apps/web/e2e/_phase6-activation.mjs CODE1 CODE2
//
// Les codes en clair sont passés en ARGUMENTS : ils n'existent qu'une fois,
// à la génération, et les écrire dans un fichier versionné les déposerait
// dans l'historique du dépôt.
import { chromium } from 'playwright';

const BASE = process.env.QA_BASE || 'http://localhost:4173';
const EMAIL = process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';

const [validCode, secondCode] = process.argv.slice(2);
if (!validCode) {
  console.error('Usage : node _phase6-activation.mjs <code-valide> [second-code]');
  process.exit(1);
}

const results = [];
const record = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const pageErrors = [];
const consoleErrors = [];

async function overflow(page) {
  return page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 950 }, locale: 'ar-DZ' });
const page = await context.newPage();

page.on('pageerror', (e) => pageErrors.push(e.message));
// Les 422/429 sont ATTENDUS : ce scénario provoque délibérément des refus
// (code inconnu, code déjà utilisé, limite de débit), et le navigateur
// journalise toute réponse non-2xx en erreur. Les compter comme des défauts
// ferait échouer le test précisément parce qu'il a bien fait son travail.
const EXPECTED_HTTP = /status of (422|429)/;
page.on('console', (m) => {
  if (m.type() !== 'error') return;
  const text = m.text();
  if (EXPECTED_HTTP.test(text)) return;
  consoleErrors.push(text);
});

try {
  // ── Connexion ────────────────────────────────────────────────────────
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/espace/, { timeout: 15000 });
  record('connexion élève', true, page.url());

  // ── La page d'activation ─────────────────────────────────────────────
  await page.goto(`${BASE}/espace/activation`, { waitUntil: 'networkidle' });

  const dir = await page.evaluate(() => document.documentElement.getAttribute('dir'));
  record('page en RTL', dir === 'rtl', `dir=${dir}`);

  const heading = await page.locator('h1').first().innerText();
  record('titre arabe', heading.includes('تفعيل'), heading);

  // Le champ du code est LTR dans une page RTL : le code est latin.
  const inputDir = await page.evaluate(() => {
    const el = document.querySelector('#activation-code');
    return el && getComputedStyle(el).direction;
  });
  record('champ du code en LTR', inputDir === 'ltr', `direction=${inputDir}`);

  record('aucun débordement horizontal', !(await overflow(page)));

  // ── Les états de refus ───────────────────────────────────────────────
  const submit = () => page.click('form button[type="submit"]');
  const alertText = async () => {
    await page.waitForSelector('[role="alert"]', { timeout: 10000 });
    return page.locator('[role="alert"]').first().innerText();
  };

  // Code inconnu, mais bien formé.
  await page.fill('#activation-code', 'ZZZZZZZZZZZZ');
  await submit();
  let message = await alertText();
  record('code inconnu refusé', message.includes('غير صالح'), message.trim());

  // Champ vide : refus local, sans appel réseau.
  await page.fill('#activation-code', '');
  await submit();
  message = await alertText();
  record('code vide refusé', message.includes('أدخل'), message.trim());

  // ── Le succès ────────────────────────────────────────────────────────
  await page.fill('#activation-code', validCode);
  await submit();
  await page.waitForSelector('[role="status"]', { timeout: 15000 });
  const success = await page.locator('[role="status"]').first().innerText();
  record('code valide accepté', success.includes('تمّ تفعيل'), success.split('\n')[0]);

  // L'état d'accès a changé SANS rechargement : c'est le refresh du contexte.
  const statusAfter = await page.locator('section[aria-label]').first().innerText();
  record('état d’accès mis à jour sans rechargement', statusAfter.includes('وصول كامل'), statusAfter.split('\n')[0]);

  // ── Le même code, une seconde fois ───────────────────────────────────
  await page.fill('#activation-code', validCode);
  await submit();
  message = await alertText();
  record('code déjà utilisé refusé', message.includes('سبق استعماله') || message.includes('سبق استعمال'), message.trim());

  // ── Un second code empile l'accès ────────────────────────────────────
  if (secondCode) {
    await page.fill('#activation-code', secondCode);
    await submit();
    await page.waitForTimeout(1500);
    const stacked = await page.locator('[role="status"]').first().innerText();
    record('second code accepté (empilement)', stacked.includes('تمّ تفعيل'), stacked.split('\n')[0]);
  }

  // ── La limite de débit ───────────────────────────────────────────────
  // Les essais précédents comptent déjà ; on en pousse quelques-uns de plus.
  let rateLimited = false;
  for (let i = 0; i < 6 && !rateLimited; i++) {
    await page.fill('#activation-code', `ZZZZZZZZZZZ${i}`);
    await submit();
    await page.waitForTimeout(600);
    const text = await page.locator('[role="alert"]').first().innerText().catch(() => '');
    if (text.includes('عدد المحاولات')) rateLimited = true;
  }
  record('limite de débit atteinte', rateLimited, rateLimited ? 'message arabe rendu' : 'jamais atteinte');

  await page.screenshot({ path: '/tmp/qa-activation-desktop.png', fullPage: true });

  // ── Mobile ───────────────────────────────────────────────────────────
  const mobile = await context.newPage();
  mobile.on('pageerror', (e) => pageErrors.push(`[mobile] ${e.message}`));
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto(`${BASE}/espace/activation`, { waitUntil: 'networkidle' });
  const mobileOverflow = await mobile.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  record('mobile 390px sans débordement', !mobileOverflow);
  await mobile.screenshot({ path: '/tmp/qa-activation-mobile.png', fullPage: true });

  record('aucune erreur de page', pageErrors.length === 0, pageErrors.join(' | ') || 'zéro');
  record('aucune erreur console', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | ') || 'zéro');
} catch (error) {
  record('exécution du scénario', false, error.message);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} contrôles passés.`);
process.exit(failed.length === 0 ? 0 : 1);
