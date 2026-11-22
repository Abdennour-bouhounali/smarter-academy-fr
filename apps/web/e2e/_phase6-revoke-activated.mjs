// QA navigateur — la révocation d'un code DÉJÀ ACTIVÉ ferme l'accès de
// l'élève. C'est le geste le plus lourd de l'administration des codes : il
// retire un accès payé, et il doit donc avertir avant de le faire.
//
//   node apps/web/e2e/_phase6-revoke-activated.mjs <id-du-code>
import { chromium } from 'playwright';

const BASE = process.env.QA_BASE || 'http://localhost:4173';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const codeId = process.argv[2];
if (!codeId) { console.error('Usage : node _phase6-revoke-activated.mjs <id>'); process.exit(1); }

const results = [];
const record = (n, ok, d = '') => { results.push({ ok }); console.log(`${ok ? '✅' : '❌'} ${n}${d ? ` — ${d}` : ''}`); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1400, height: 950 }, locale: 'ar-DZ' });
const page = await ctx.newPage();

try {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'qa-admin@smarter.dz');
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin/, { timeout: 15000 });

  await page.goto(`${BASE}/admin/codes-activation/${codeId}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('h2:has-text("Le droit")', { timeout: 10000 });

  let body = await page.locator('body').innerText();
  record('le code est activé', body.includes('Activé'), 'état initial');
  record('le droit ouvre l’accès', body.includes('ouvre l’accès'));

  await page.click('button:has-text("Révoquer")');
  await page.waitForSelector('input[placeholder*="revendue"]', { timeout: 10000 });
  const dialog = await page.locator('body').innerText();
  record('avertissement « FERMERA l’accès »', dialog.includes('FERMERA'),
    dialog.includes('qa-eleve') ? 'l’élève est nommé' : 'élève non nommé');

  await page.fill('input[placeholder*="revendue"]', 'QA — carte revendue deux fois');
  await page.locator('button:has-text("Révoquer")').last().click();
  await page.waitForTimeout(2500);

  body = await page.locator('body').innerText();
  record('code révoqué', body.includes('Révoqué'));
  record('le droit ne l’ouvre plus', body.includes('n’ouvre plus l’accès'));
  record('motif conservé', body.includes('carte revendue deux fois'));
  record('journal enrichi', body.includes('Code révoqué'));

  await page.screenshot({ path: '/tmp/qa-revoke-activated.png', fullPage: true });
} catch (e) {
  record('exécution', false, e.message);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} contrôles passés.`);
process.exit(failed === 0 ? 0 : 1);
