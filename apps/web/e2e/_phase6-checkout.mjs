import { chromium } from 'playwright';
import { createHmac } from 'node:crypto';

/**
 * Le parcours d'achat, au navigateur.
 *
 * Ce que ce harnais démontre, et qui ne se démontre pas en test unitaire :
 * qu'un élève voit bien le bouton, que le clic part, qu'il est redirigé, que
 * la page de retour n'annonce RIEN de faux, et que l'accès ne s'ouvre qu'au
 * webhook signé.
 *
 * Le prestataire est le bac à sable local : aucun appel réseau, aucun euro.
 * L'activation est simulée par un webhook réellement signé en HMAC, comme le
 * ferait Stripe.
 */

const BASE = 'http://localhost:5173';
const API = 'http://localhost:8000/api/v1';
const SECRET = 'whsec_e2e_phase6';
const EMAIL = 'e2e-phase6@test.local';
const PASSWORD = 'Password123!';
const USER_ID = 42;
const SUB = `sub_p6_${Date.now()}`;
const CUS = `cus_p6_${Date.now()}`;

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
        current_period_start: now() - 86400,
        current_period_end: extra.end ?? now() + 31536000,
        cancel_at_period_end: extra.cancelAtPeriodEnd ?? false,
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

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));

// ── 1. Élève gratuit devant une leçon premium ───────────────────────────
console.log('\n=== 1. ÉLÈVE GRATUIT ===');
await login(page);

await page.goto(`${BASE}/espace/cours`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const locked = page.locator('a[href="/tarifs"]').filter({ hasText: /Fonction affine/i }).first();
check('la leçon premium est verrouillée et mène aux tarifs', await locked.isVisible().catch(() => false));

// ── 2. La page des tarifs ───────────────────────────────────────────────
console.log('\n=== 2. TARIFS ===');
await page.goto(`${BASE}/tarifs`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);

const subscribeBtn = page.locator('button', { hasText: /S'abonner/ }).first();
check('le bouton « S\'abonner » est affiché', await subscribeBtn.isVisible().catch(() => false));

const priceShown = await page.locator('text=35€').first().isVisible().catch(() => false);
check('le prix servi par le serveur est affiché', priceShown);

const bodyTxt = await page.locator('body').innerText();
check('aucun identifiant de tarif n\'est exposé', !/price_[a-zA-Z0-9]/.test(bodyTxt));

// ── 3. Le clic et la redirection ────────────────────────────────────────
console.log('\n=== 3. CLIC ET REDIRECTION ===');
await subscribeBtn.click();
await page.waitForTimeout(3000);

const url = page.url();
// Le bac à sable renvoie vers l'annulation : honnête, rien n'a été payé.
check('la redirection a eu lieu vers la page de retour', url.includes('/abonnement/retour'), url);

// ── 4. Le retour : rien n'est accordé ───────────────────────────────────
console.log('\n=== 4. PAGE DE RETOUR ===');
const retourTxt = await page.locator('body').innerText();
check('aucun « paiement réussi » n\'est annoncé', !/paiement\s+réussi/i.test(retourTxt));
check('l\'annulation est annoncée honnêtement', /annul/i.test(retourTxt));

// L'accès n'a PAS été ouvert par le passage sur la page de retour.
const accessAfterReturn = await page.evaluate(async (api) => {
  const t = localStorage.getItem('token');
  const r = await fetch(`${api}/me/access`, { headers: { Authorization: `Bearer ${t}` } });
  return (await r.json()).access;
}, API);
check('revenir de la page de paiement n\'ouvre AUCUN accès', accessAfterReturn.premiumAccess === false);

// ── 5. La page de retour « succès » n'accorde rien non plus ─────────────
console.log('\n=== 5. L\'URL DE SUCCÈS N\'EST PAS UNE PREUVE ===');
await page.goto(`${BASE}/abonnement/retour?statut=succes`, { waitUntil: 'networkidle' });
await page.waitForTimeout(4000);
const successTxt = await page.locator('body').innerText();
check('l\'URL de succès affiche une ATTENTE, pas un accès', /activation en cours/i.test(successTxt));

const stillLocked = await page.evaluate(async (api) => {
  const t = localStorage.getItem('token');
  const r = await fetch(`${api}/me/access`, { headers: { Authorization: `Bearer ${t}` } });
  return (await r.json()).access;
}, API);
check('l\'accès reste fermé malgré ?statut=succes', stillLocked.premiumAccess === false);

// ── 6. LE WEBHOOK ouvre l'accès ─────────────────────────────────────────
console.log('\n=== 6. LE WEBHOOK, SEULE AUTORITÉ ===');
const s1 = await webhook({
  id: `evt_p6_checkout_${Date.now()}`,
  type: 'checkout.session.completed',
  created: now(),
  data: { object: { id: 'cs_p6', mode: 'subscription', subscription: SUB, customer: CUS, payment_status: 'paid', client_reference_id: String(USER_ID) } },
});
const s2 = await webhook(subEvent(`evt_p6_sub_${Date.now()}`, 'active'));
check('les webhooks signés sont acceptés', s1 === 200 && s2 === 200, `checkout=${s1} sub=${s2}`);

await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
const activated = await page.locator('body').innerText();
check('la page de retour bascule sur « abonnement actif »', /abonnement est actif/i.test(activated));

// ── 7. Le contenu s'ouvre ───────────────────────────────────────────────
console.log('\n=== 7. LE CONTENU PREMIUM ===');
await page.goto(`${BASE}/espace/cours`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const openLesson = page.locator('a[href*="fonction-affine-2nde"]').first();
check('la leçon premium est ouverte', await openLesson.isVisible().catch(() => false));
if (await openLesson.isVisible().catch(() => false)) {
  const t = await openLesson.innerText();
  check('le badge Premium est conservé pour l\'abonné', /Premium/i.test(t));
}

// ── 8. Tarifs pour un abonné ────────────────────────────────────────────
console.log('\n=== 8. TARIFS QUAND ON EST DÉJÀ ABONNÉ ===');
await page.goto(`${BASE}/tarifs`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const stillOffering = await page.locator('button', { hasText: /S'abonner/ }).first().isVisible().catch(() => false);
check('le bouton « S\'abonner » a disparu', !stillOffering);
check('l\'offre actuelle est signalée', /ton offre actuelle/i.test(await page.locator('body').innerText()));

// Et le serveur refuse un second achat même si on force l'appel.
const secondBuy = await page.evaluate(async (api) => {
  const t = localStorage.getItem('token');
  const r = await fetch(`${api}/billing/checkout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan: 'annual' }),
  });
  return { status: r.status, body: await r.json() };
}, API);
check('un second achat est refusé par le serveur', secondBuy.status === 422, secondBuy.body?.message || '');

// ── 9. Profil ───────────────────────────────────────────────────────────
console.log('\n=== 9. PROFIL ===');
await page.goto(`${BASE}/espace/profil`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const planCard = await page.locator('.glass-card').nth(1).innerText().catch(() => '');
check('le profil affiche « Abonnement actif »', /abonnement actif/i.test(planCard));
check('aucun identifiant du prestataire n\'est montré', !/cus_|sub_|price_/.test(planCard));

// ── 10. Expiration ──────────────────────────────────────────────────────
console.log('\n=== 10. SUPPRESSION → VERROUILLAGE IMMÉDIAT ===');
const s3 = await webhook(subEvent(`evt_p6_del_${Date.now()}`, 'canceled', {
  type: 'customer.subscription.deleted',
  created: now() + 10,
  object: { ended_at: now() },
}));
check('la suppression est acceptée', s3 === 200);

await page.goto(`${BASE}/espace/cours`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const relocked = await page.locator('a[href="/tarifs"]').filter({ hasText: /Fonction affine/i }).first().isVisible().catch(() => false);
check('la leçon est reverrouillée IMMÉDIATEMENT (non-régression phase 5)', relocked);

// ── 11. Mobile ──────────────────────────────────────────────────────────
console.log('\n=== 11. MOBILE (390px) ===');
const mob = await ctx.newPage();
mob.on('console', (m) => { if (m.type() === 'error') consoleErrors.push('[mobile] ' + m.text()); });
await mob.setViewportSize({ width: 390, height: 844 });
for (const [label, path] of [['tarifs', '/tarifs'], ['retour', '/abonnement/retour?statut=succes'], ['profil', '/espace/profil']]) {
  await mob.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  await mob.waitForTimeout(1500);
  const overflow = await mob.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(`${label} : aucun débordement horizontal`, overflow <= 1, `écart=${overflow}px`);
}
await mob.close();

// ── 12. Console ─────────────────────────────────────────────────────────
console.log('\n=== 12. CONSOLE ===');
const real = consoleErrors.filter((e) => !/favicon|404 \(Not Found\)|ERR_|Download the React|Failed to load resource/i.test(e));
check('aucune erreur console inattendue', real.length === 0, real.slice(0, 2).join(' ~ '));

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${'='.repeat(60)}`);
console.log(`E2E PHASE 6 : ${results.length - failed.length}/${results.length} réussis`);
if (failed.length) {
  console.log('ÉCHECS :');
  failed.forEach((f) => console.log('  - ' + f.name));
}
process.exit(failed.length ? 1 : 0);
