import { chromium } from 'playwright';
import { createHmac } from 'node:crypto';

/**
 * Le cycle de vie de l'abonnement, au navigateur — phase 7.
 *
 * Ce que ce harnais démontre et qu'aucun test unitaire ne démontre : que
 * l'élève VOIT le bon état, que les bons boutons apparaissent au bon moment,
 * que résilier ne lui retire rien tout de suite, et que la page ne ment
 * jamais sur son accès.
 *
 * Les webhooks sont réellement signés en HMAC, comme le ferait Stripe : la
 * vérification de signature n'est pas contournée, elle est SATISFAITE.
 */

const BASE = 'http://localhost:5173';
const API = 'http://localhost:8000/api/v1';
const SECRET = 'whsec_e2e_phase7_local_only';
const EMAIL = 'e2e-phase7@test.local';
const PASSWORD = 'Password123!';
const USER_ID = Number(process.env.P7_USER_ID || 44);
const STAMP = Date.now();
// Les identifiants d'un abonnement RÉEL de test chez Stripe (livemode:false).
// Indispensable : résilier et reprendre appellent vraiment l'API Stripe, et
// un identifiant inventé s'y ferait refuser — la fausse piste a été prise une
// fois, autant l'écrire ici.
const SUB = process.env.P7_SUB || `sub_p7_${STAMP}`;
const CUS = process.env.P7_CUS || `cus_p7_${STAMP}`;

const now = () => Math.floor(Date.now() / 1000);

async function webhook(body) {
  const raw = JSON.stringify(body);
  const ts = now();
  const sig = createHmac('sha256', SECRET).update(`${ts}.${raw}`).digest('hex');
  const res = await fetch(`${API}/webhooks/stripe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Stripe-Signature': `t=${ts},v1=${sig}` },
    body: raw,
  });
  return res.status;
}

/** La forme RÉELLE de l'API 2025 : la période vit sur les lignes (défaut D1). */
function subEvent(id, status, extra = {}) {
  return {
    id,
    type: extra.type || 'customer.subscription.updated',
    created: extra.created || now(),
    data: {
      object: {
        id: SUB,
        customer: CUS,
        status,
        cancel_at_period_end: extra.cancelAtPeriodEnd ?? false,
        items: { data: [{
          current_period_start: now() - 86400,
          current_period_end: extra.end ?? now() + 31536000,
          price: { id: process.env.P7_PRICE || 'price_e2e_phase7' },
        }] },
        ...(extra.object || {}),
      },
    },
  };
}

const results = [];
const consoleErrors = [];
function check(name, pass, detail = '') {
  results.push({ name, pass });
  console.log(`${pass ? '  ✅' : '  ❌'} ${name}${detail ? ' — ' + detail : ''}`);
}

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2500);
}

const api = (page, path, opts = {}) => page.evaluate(async ([a, p, o]) => {
  const t = localStorage.getItem('token');
  const r = await fetch(`${a}${p}`, {
    ...o,
    headers: { Authorization: `Bearer ${t}`, ...(o.headers || {}) },
  });
  return { status: r.status, body: await r.json().catch(() => null) };
}, [API, path, opts]);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));

// ── 1. Sans abonnement ──────────────────────────────────────────────────
console.log('\n=== 1. SANS ABONNEMENT ===');
await login(page);
check('la connexion mène à l\'espace élève', page.url().includes('/espace'), page.url());

await page.goto(`${BASE}/abonnement`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

let txt = await page.locator('body').innerText();
check('l\'accès gratuit est annoncé', /accès gratuit/i.test(txt));
check('aucune résiliation n\'est proposée', !/Résilier mon abonnement/i.test(txt));
check('une offre est proposée', /Découvrir les offres/i.test(txt));

// ── 2. Activation par webhook SIGNÉ ─────────────────────────────────────
console.log('\n=== 2. ACTIVATION (webhook signé) ===');
const s1 = await webhook({
  id: `evt_p7_session_${STAMP}`,
  type: 'checkout.session.completed',
  created: now(),
  data: { object: {
    id: `cs_p7_${STAMP}`, mode: 'subscription', payment_status: 'paid',
    subscription: SUB, customer: CUS, client_reference_id: String(USER_ID),
  } },
});
check('la session signée est acceptée', s1 === 200, `HTTP ${s1}`);

const s2 = await webhook(subEvent(`evt_p7_created_${STAMP}`, 'active', { type: 'customer.subscription.created' }));
check('l\'abonnement signé est accepté', s2 === 200, `HTTP ${s2}`);

await page.goto(`${BASE}/abonnement`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);
txt = await page.locator('body').innerText();

check('l\'abonnement est annoncé ACTIF', /Votre abonnement est actif/i.test(txt));
check('la date de renouvellement est affichée', /renouvellement/i.test(txt));
check('« Résilier » est proposé', /Résilier mon abonnement/i.test(txt));
check('« Gérer mon moyen de paiement » est proposé', /Gérer mon moyen de paiement/i.test(txt));
check('aucun identifiant du fournisseur n\'est affiché', !/cus_|sub_|price_/.test(txt));

const access1 = await api(page, '/me/access');
check('le serveur confirme l\'accès premium', access1.body?.access?.premiumAccess === true);

// ── 3. La résiliation demande une confirmation ──────────────────────────
console.log('\n=== 3. RÉSILIATION : JAMAIS UN SEUL CLIC ===');
await page.locator('button', { hasText: /Résilier mon abonnement/i }).first().click();
await page.waitForTimeout(600);
txt = await page.locator('body').innerText();
check('une confirmation est demandée', /Résilier votre abonnement \?/i.test(txt));
check('l\'élève est prévenu qu\'il garde ses jours payés', /reste ouvert/i.test(txt));

// On renonce : rien ne doit avoir changé.
await page.locator('button', { hasText: /Garder mon abonnement/i }).first().click();
await page.waitForTimeout(800);
const stillActive = await api(page, '/billing/subscription');
check('renoncer ne résilie rien', stillActive.body?.billing?.subscription?.cancelAtPeriodEnd === false);

// ── 4. Résilier DEPUIS L'INTERFACE, avec un identifiant étranger joint ──
//
// Deux vérifications d'un coup : le bouton fonctionne, et un identifiant
// étranger envoyé en même temps n'a aucun effet. L'élève A un abonnement,
// donc l'appel RÉUSSIT — ce qu'on vérifie, c'est qu'il a agi sur LE SIEN.
console.log('\n=== 4. RÉSILIATION + APPARTENANCE ===');
const idor = await api(page, '/billing/subscription/cancel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ user_id: 1, subscription_id: 1, customer_id: 'cus_autrui' }),
});
check('un identifiant étranger est ignoré', idor.status === 200, `HTTP ${idor.status}`);
check('c\'est SON abonnement qui a été résilié',
  idor.body?.billing?.subscription?.cancelAtPeriodEnd === true);

// ── 5. Résilié : l'accès reste OUVERT ───────────────────────────────────
console.log('\n=== 5. RÉSILIÉ, MAIS ENCORE OUVERT ===');
await page.goto(`${BASE}/abonnement`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);
txt = await page.locator('body').innerText();

check('la fin programmée est annoncée', /Votre abonnement prendra fin/i.test(txt));
check('« Continuer mon abonnement » est proposé', /Continuer mon abonnement/i.test(txt));
check('« Résilier » n\'est plus proposé', !/Résilier mon abonnement/i.test(txt));

const access2 = await api(page, '/me/access');
check('L\'ACCÈS RESTE OUVERT après résiliation', access2.body?.access?.premiumAccess === true);

// ── 6. La reprise ───────────────────────────────────────────────────────
console.log('\n=== 6. REPRISE ===');
await page.locator('button', { hasText: /Continuer mon abonnement/i }).first().click();
await page.waitForTimeout(3500);
txt = await page.locator('body').innerText();
check('l\'abonnement redevient actif', /Votre abonnement est actif/i.test(txt));
check('« Résilier » est de nouveau proposé', /Résilier mon abonnement/i.test(txt));

// ── 7. La fin réelle ferme l'accès ──────────────────────────────────────
console.log('\n=== 7. LE WEBHOOK DE FIN FERME ===');
const s3 = await webhook(subEvent(`evt_p7_deleted_${STAMP}`, 'canceled', {
  type: 'customer.subscription.deleted',
  object: { ended_at: now() },
}));
check('la suppression signée est acceptée', s3 === 200, `HTTP ${s3}`);

await page.goto(`${BASE}/abonnement`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);
txt = await page.locator('body').innerText();
check('l\'abonnement est annoncé TERMINÉ', /Votre abonnement est terminé/i.test(txt));

const access3 = await api(page, '/me/access');
check('l\'accès premium est FERMÉ', access3.body?.access?.premiumAccess === false);

// ── 8. Signature forgée ─────────────────────────────────────────────────
console.log('\n=== 8. SIGNATURE FORGÉE ===');
const forged = await fetch(`${API}/webhooks/stripe`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Stripe-Signature': 't=1,v1=deadbeef' },
  body: JSON.stringify(subEvent(`evt_p7_forge_${STAMP}`, 'active')),
});
check('une signature forgée est refusée', forged.status === 400, `HTTP ${forged.status}`);
const access4 = await api(page, '/me/access');
check('elle n\'ouvre aucun accès', access4.body?.access?.premiumAccess === false);

// ── 9. L'authentification ───────────────────────────────────────────────
console.log('\n=== 9. AUTHENTIFICATION ===');
const anon = await fetch(`${API}/billing/subscription`);
check('un visiteur non connecté est refusé', anon.status === 401, `HTTP ${anon.status}`);

// ── 10. La mise en page ─────────────────────────────────────────────────
console.log('\n=== 10. MISE EN PAGE ===');
const overflow = await page.evaluate(() =>
  document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
check('aucun débordement horizontal (bureau)', !overflow);

const gutter = await page.evaluate(() => {
  const el = document.querySelector('.sa-page');
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return Math.round(r.left);
});
check('la page utilise le cadre partagé', gutter !== null, `gouttière ${gutter}px`);

await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(900);
const overflowMobile = await page.evaluate(() =>
  document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
check('aucun débordement horizontal (mobile 390px)', !overflowMobile);

check('aucune erreur de console', consoleErrors.length === 0,
  consoleErrors.slice(0, 2).join(' | '));

await browser.close();

const passed = results.filter((r) => r.pass).length;
console.log(`\n${'='.repeat(56)}`);
console.log(`RÉSULTAT : ${passed}/${results.length}`);
if (passed < results.length) {
  console.log('ÉCHECS :');
  results.filter((r) => !r.pass).forEach((r) => console.log(`  - ${r.name}`));
}
process.exit(passed === results.length ? 0 : 1);
