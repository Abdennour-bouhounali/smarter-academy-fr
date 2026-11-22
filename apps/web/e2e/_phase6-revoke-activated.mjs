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
const ctx = await browser.newContext({ viewport: { width: 1400, height: 950 }, locale: 'fr-FR' });
const page = await ctx.newPage();

try {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', process.env.QA_ADMIN_EMAIL || 'qa-admin@exemple.fr');
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin/, { timeout: 15000 });

  await page.goto(`${BASE}/admin/codes-activation/${codeId}`, { waitUntil: 'networkidle' });
  // admin:activation.theEntitlement — titre d'une AdminCard (<h3>).
  await page.waitForSelector('h3:has-text("Le droit")', { timeout: 10000 });

  let body = await page.locator('body').innerText();
  // La ligne « État » du détail porte le badge « Activé » (StatusBadge).
  record('le code est activé', /État\s+Activé\s/.test(body), 'état initial');
  // admin:activation.entitlementOpens « Ouvre l’accès ».
  record('le droit ouvre l’accès', body.includes('Ouvre l’accès'));

  await page.click('button:has-text("Révoquer")');
  // admin:activation.reasonCodePlaceholder « Carte vendue deux fois ».
  await page.waitForSelector('input[placeholder*="vendue"]', { timeout: 10000 });
  const dialog = await page.locator('body').innerText();
  // admin:activation.revokeActivatedWarning(Prefix) « … Le révoquer fermera l’accès de … ».
  record('avertissement « fermera l’accès »', dialog.includes('fermera l’accès'),
    dialog.includes('qa-eleve') ? 'l’élève est nommé' : 'élève non nommé');

  await page.fill('input[placeholder*="vendue"]', 'QA — carte revendue deux fois');
  await page.locator('button:has-text("Révoquer")').last().click();
  await page.waitForTimeout(2500);

  body = await page.locator('body').innerText();
  record('code révoqué', body.includes('Révoqué'));
  // admin:activation.entitlementClosed « N’ouvre plus l’accès ».
  record('le droit ne l’ouvre plus', body.includes('N’ouvre plus l’accès'));
  record('motif conservé', body.includes('carte revendue deux fois'));
  // admin:activation.actionCodeRevoked, dans « Historique ».
  record('historique enrichi', body.includes('Code révoqué'));

  await page.screenshot({ path: '/tmp/qa-revoke-activated.png', fullPage: true });
} catch (e) {
  record('exécution', false, e.message);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} contrôles passés.`);
process.exit(failed === 0 ? 0 : 1);
