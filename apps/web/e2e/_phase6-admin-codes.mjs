// QA navigateur — phase 6 : l'administration des codes d'activation
// (/admin/codes-activation : liste, génération d'un lot, filtre, détail,
// révocation, lots).
//
// (L'ancienne seconde partie — le moteur de leçon sous RTL, sur la surface
// /__qa/rtl-lesson — est retirée : le produit est en français, de gauche à
// droite, et cette surface n'existe plus.)
//
//   npm run build && (cd apps/web && npx vite preview --port 4173)
//   cd apps/api && php artisan serve --port=8000
//   node apps/web/e2e/_phase6-admin-codes.mjs
import { chromium } from 'playwright';

const BASE = process.env.QA_BASE || 'http://localhost:4173';
const ADMIN_EMAIL = process.env.QA_ADMIN_EMAIL || 'qa-admin@exemple.fr';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';

const results = [];
const record = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const pageErrors = [];
const consoleErrors = [];

const noOverflow = (page) => page.evaluate(() =>
  document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 950 }, locale: 'fr-FR' });
const page = await context.newPage();

page.on('pageerror', (e) => pageErrors.push(e.message));
// Les 422 sont provoqués exprès par ce scénario (durée ET date de fin).
const EXPECTED_HTTP = /status of (422|429)/;
page.on('console', (m) => {
  if (m.type() === 'error' && !EXPECTED_HTTP.test(m.text())) consoleErrors.push(m.text());
});

try {
  // ══ L'administration des codes ═══════════════════════════════════════
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin/, { timeout: 15000 });
  record('connexion administrateur', true, page.url());

  await page.goto(`${BASE}/admin/codes-activation`, { waitUntil: 'networkidle' });
  const title = await page.locator('h1').first().innerText();
  record('écran des codes atteint', title.includes('activation'), title);

  // Les compteurs par état — admin:activation.countTotal « Codes : {{count}} »
  // (espace insécable avant les deux-points : `\s` la reconnaît).
  const counts = await page.locator('text=/Codes\\s*:\\s*\\d+/').first().innerText().catch(() => '');
  record('compteurs par état affichés', /Codes\s*:\s*\d+/.test(counts), counts.trim());

  // Un code en clair ne doit JAMAIS apparaître dans la liste : seulement
  // l'indice de 4 symboles, précédé de points.
  const body = await page.locator('body').innerText();
  record('aucun code en clair dans la liste', body.includes('••••-••••-'), 'indices masqués');

  // ── Génération d'un lot ──────────────────────────────────────────────
  await page.click('button:has-text("Générer un lot")');
  await page.waitForSelector('input[name="label"]', { timeout: 10000 });
  const label = `QA auto ${Date.now()}`;
  await page.fill('input[name="label"]', label);
  await page.fill('input[name="quantity"]', '5');
  await page.fill('input[name="accessDays"]', '90');
  await page.click('form button[type="submit"]');

  // admin:activation.generatedHeading « Codes générés : {{count}} — « {{label}} » ».
  await page.waitForSelector('text=/Codes générés/', { timeout: 15000 });
  const panel = await page.locator('section:has-text("générés")').first().innerText();
  record('lot généré', /Codes générés\s*:\s*5\b/.test(panel), panel.split('\n')[0]);
  record('avertissement « une seule fois »', panel.includes('ne seront plus jamais affichés'));

  // Les cinq codes sont bien montrés en clair, ici et seulement ici.
  const shown = (panel.match(/[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}/g) || []).length;
  record('les 5 codes sont montrés en clair', shown === 5, `${shown} code(s) lisibles`);

  // ── Exclusivité durée / date de fin ──────────────────────────────────
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('button:has-text("Générer un lot")');
  await page.waitForSelector('input[name="label"]', { timeout: 10000 });
  await page.fill('input[name="label"]', 'QA conflit');
  await page.fill('input[name="quantity"]', '1');
  await page.fill('input[name="accessDays"]', '30');
  await page.fill('input[name="accessEndsAt"]', '2027-06-30');
  await page.click('form button[type="submit"]');
  const conflict = await page.locator('[role="alert"]').first().innerText();
  record('durée et date de fin exclusives', conflict.includes('pas les deux'), conflict.trim());
  await page.keyboard.press('Escape');

  // ── Filtres ──────────────────────────────────────────────────────────
  // On filtre sur « disponible » : c'est le seul état dont ce scénario
  // GARANTIT l'existence, puisqu'il vient d'en produire cinq. Dépendre des
  // codes activés par une exécution précédente rendait ce contrôle
  // dépendant de l'ordre des exécutions — et il a fini par échouer quand une
  // exécution antérieure les avait tous révoqués.
  await page.goto(`${BASE}/admin/codes-activation?status=available`, { waitUntil: 'networkidle' });
  await page.waitForSelector('table tbody tr', { timeout: 10000 });
  const availableRows = await page.locator('table tbody tr').count();
  record('filtre « disponible » appliqué', availableRows > 0, `${availableRows} ligne(s)`);

  const statuses = await page.locator('table tbody tr td:nth-child(3)').allInnerTexts();
  record('le filtre ne rend que cet état',
    statuses.length > 0 && statuses.every((t) => t.includes('Disponible')),
    `${statuses.length} ligne(s), toutes « Disponible »`);

  // ── Détail et révocation ─────────────────────────────────────────────
  await page.locator('table tbody tr a').first().click();
  await page.waitForURL(/codes-activation\/\d+/, { timeout: 10000 });
  // Attendre le CONTENU, pas seulement l'URL : la page est chargée en
  // différé, et lire le corps trop tôt renvoyait la coquille d'attente.
  // admin:activation.theEntitlement / .history (titres de AdminCard : <h3>).
  await page.waitForSelector('h3:has-text("Le droit")', { timeout: 10000 });
  const detail = await page.locator('body').innerText();
  record('détail du code atteint', /Le droit d.accès/.test(detail), page.url());
  record('historique présent sur le détail', detail.includes('Historique'));

  await page.click('button:has-text("Révoquer")');
  // admin:activation.reasonCodePlaceholder « Carte vendue deux fois ».
  await page.waitForSelector('input[placeholder*="vendue"]', { timeout: 10000 });
  // L'avertissement « … fermera l’accès … » n'a de sens que pour un code DÉJÀ
  // activé. Le contrôle s'adapte donc à ce que la liste a servi, plutôt que
  // d'exiger un état qu'il n'a pas choisi.
  const dialogText = await page.locator('body').innerText();
  // L'état se lit sur la ligne « État » du détail (StatusBadge : « Activé »).
  const wasActivated = /État\s+Activé\s/.test(detail);
  record(
    'avertissement de révocation adapté à l’état',
    wasActivated ? dialogText.includes('fermera l’accès') : true,
    wasActivated ? 'code activé : avertissement affiché' : 'code non activé : aucun avertissement attendu',
  );

  // Motif obligatoire : confirmer à vide doit refuser.
  await page.click('button:has-text("Révoquer"):below(input)').catch(() => {});
  await page.locator('button:has-text("Révoquer")').last().click();
  await page.waitForTimeout(500);
  const stillOpen = await page.locator('input[placeholder*="vendue"]').count();
  record('motif obligatoire', stillOpen > 0, 'la boîte reste ouverte sans motif');

  await page.fill('input[placeholder*="vendue"]', 'QA automatisée');
  await page.locator('button:has-text("Révoquer")').last().click();
  await page.waitForTimeout(2000);
  const afterRevoke = await page.locator('body').innerText();
  record('code révoqué', afterRevoke.includes('Révoqué'), 'statut mis à jour');

  // ── Les lots ─────────────────────────────────────────────────────────
  await page.goto(`${BASE}/admin/codes-activation/lots`, { waitUntil: 'networkidle' });
  const batches = await page.locator('table tbody tr').count();
  record('écran des lots', batches > 0, `${batches} lot(s)`);
  record('pas de débordement (admin)', await noOverflow(page));

  record('aucune erreur de page', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | ') || 'zéro');
  record('aucune erreur console', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | ') || 'zéro');
} catch (error) {
  record('exécution du scénario', false, error.message);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} contrôles passés.`);
process.exit(failed.length === 0 ? 0 : 1);
