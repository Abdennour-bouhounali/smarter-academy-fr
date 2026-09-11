import { chromium } from 'playwright';

/**
 * Le parcours RÉEL, contre la vraie page de paiement de Stripe (mode test).
 * Carte de test officielle 4242…, aucun euro réel.
 */
const BASE = 'http://localhost:5173';
const API = 'http://localhost:8000/api/v1';
const EMAIL = 'e2e-phase65@test.local';
const PASSWORD = 'Password123!';

const log = (m) => console.log(m);
const errors = [];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

// 1. Connexion
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} });
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', EMAIL);
await page.fill('input[type="password"]', PASSWORD);
await page.click('button[type="submit"]');
await page.waitForTimeout(2500);
log('  ✅ connecté');

// 2. Leçon verrouillée avant achat
await page.goto(`${BASE}/espace/cours`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const locked = await page.locator('a[href="/tarifs"]').filter({ hasText: /Fonction affine/i }).first().isVisible().catch(() => false);
log(`  ${locked ? '✅' : '❌'} leçon premium verrouillée avant achat`);

// 3. Tarifs + interception de la requête d'achat
await page.goto(`${BASE}/tarifs`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);

let sentBody = null;
page.on('request', (r) => {
  if (r.url().includes('/billing/checkout') && r.method() === 'POST') {
    sentBody = r.postData();
  }
});

page.on('response', async (r) => {
  if (r.url().includes('/billing/checkout')) {
    log(`  réponse checkout : HTTP ${r.status()}`);
    if (r.status() >= 400) log(`    corps : ${(await r.text()).slice(0, 160)}`);
  }
});

const btn = page.locator('button', { hasText: /S'abonner/ }).first();
log(`  ${await btn.isVisible().catch(() => false) ? '✅' : '❌'} bouton « S'abonner » présent`);
await btn.click();

// 4. Attendre l'arrivée sur Stripe
await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(4000);
log(`  corps envoyé au serveur : ${sentBody}`);
log(`  ${page.url().includes('checkout.stripe.com') ? '✅' : '❌'} page de paiement Stripe atteinte`);

if (!page.url().includes('checkout.stripe.com')) {
  log('  ❌ redirection Stripe absente — arrêt');
  await browser.close();
  process.exit(1);
}

// 5. Payer avec la carte de TEST officielle 4242 4242 4242 4242
try {
  await page.fill('#email', EMAIL).catch(() => {});
  await page.fill('#cardNumber', '4242424242424242');
  await page.fill('#cardExpiry', '12 / 34');
  await page.fill('#cardCvc', '123');
  await page.fill('#billingName', 'E2E Phase65');
  // Pays / code postal selon le formulaire présenté
  await page.selectOption('#billingCountry', 'FR').catch(() => {});
  await page.fill('#billingPostalCode', '75001').catch(() => {});
  log('  ✅ carte de test 4242 saisie');

  await page.click('.SubmitButton, button[type="submit"]');
  log('  … paiement soumis, attente de la redirection');
  await page.waitForURL(/abonnement\/retour/, { timeout: 60000 });
  log(`  ✅ retour sur l'application : ${page.url()}`);
} catch (e) {
  log(`  ❌ échec du formulaire Stripe : ${e.message}`);
  await page.screenshot({ path: '/tmp/stripe_fail.png' });
  await browser.close();
  process.exit(1);
}

// 6. La page de retour n'annonce PAS un succès
await page.waitForTimeout(3000);
const txt = await page.locator('body').innerText();
log(`  ${!/paiement\s+réussi/i.test(txt) ? '✅' : '❌'} aucun « paiement réussi » annoncé`);
log(`  état affiché : ${/activation en cours/i.test(txt) ? 'Activation en cours' : /actif/i.test(txt) ? 'Abonnement actif' : '?'}`);

// 7. L'accès, vu du serveur (le webhook n'est pas encore relayé)
const access = await page.evaluate(async (api) => {
  const t = localStorage.getItem('token');
  const r = await fetch(`${api}/me/access`, { headers: { Authorization: `Bearer ${t}` } });
  return (await r.json()).access;
}, API);
log(`  premiumAccess juste après le retour : ${access.premiumAccess}`);

// 8. Attendre que le webhook RÉEL soit livré par la CLI Stripe.
log('  … attente de la livraison du webhook réel (CLI Stripe)');
let granted = false;
for (let i = 0; i < 15; i++) {
  await page.waitForTimeout(2000);
  const a = await page.evaluate(async (api) => {
    const t = localStorage.getItem('token');
    const r = await fetch(`${api}/me/access`, { headers: { Authorization: `Bearer ${t}` } });
    return (await r.json()).access;
  }, API);
  if (a.premiumAccess) { granted = true; log(`  ✅ accès OUVERT après ${(i + 1) * 2}s — expiresAt=${a.expiresAt}`); break; }
}
if (!granted) log('  ❌ accès toujours fermé après 30s');

// 9. La leçon premium s'ouvre-t-elle ?
await page.goto(`${BASE}/espace/cours`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const open = await page.locator('a[href*="fonction-affine-2nde"]').first().isVisible().catch(() => false);
log(`  ${open ? '✅' : '❌'} leçon premium accessible après le webhook réel`);

log(`  erreurs console : ${errors.filter((e) => !/favicon|404|ERR_/i.test(e)).length}`);
await browser.close();
