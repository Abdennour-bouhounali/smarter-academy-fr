import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const API = 'http://localhost:8000/api/v1';
const SECRET = 'whsec_e2e_phase5';
const EMAIL = 'e2e-phase5@test.local';
const PASSWORD = 'Password123!';
const LESSON = 'fonction-affine-2nde';
const SUB = `sub_e2e_${Date.now()}`;
const CUS = `cus_e2e_${Date.now()}`;
const USER_ID = 41;

import { createHmac } from 'node:crypto';

async function webhook(body) {
  const raw = JSON.stringify(body);
  const ts = Math.floor(Date.now() / 1000);
  const sig = createHmac('sha256', SECRET).update(`${ts}.${raw}`).digest('hex');
  const res = await fetch(`${API}/webhooks/stripe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Stripe-Signature': `t=${ts},v1=${sig}` },
    body: raw,
  });
  return res.status;
}

const now = () => Math.floor(Date.now() / 1000);

function subEvent(id, status, extra = {}) {
  return {
    id, type: extra.type || 'customer.subscription.updated', created: extra.created || now(),
    data: { object: {
      id: SUB, customer: CUS, status,
      current_period_start: now() - 86400,
      current_period_end: extra.end ?? (now() + 2592000),
      cancel_at_period_end: extra.cancelAtPeriodEnd ?? false,
      ...(extra.object || {}),
    } },
  };
}

const results = [];
function check(name, pass, detail = '') {
  results.push({ name, pass, detail });
  console.log(`${pass ? '  ✅' : '  ❌'} ${name}${detail ? ' — ' + detail : ''}`);
}

const consoleErrors = [];

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(espace|dashboard|app)/, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text());
});
page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));

// ── État initial : GRATUIT ──────────────────────────────────────────────
console.log('\n=== 1. ÉLÈVE GRATUIT, leçon premium ===');
// Pas de réinitialisation : chaque exécution part d'un abonnement neuf.
await login(page);

await page.goto(`${BASE}/espace/cours`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

const card = page.locator('a[href="/tarifs"]').filter({ hasText: /Fonction affine/i }).first();
await page.waitForTimeout(1000);
const lockedVisible = await card.isVisible().catch(() => false);
check('la leçon premium est visible et mène à /tarifs', lockedVisible);
if (lockedVisible) {
  const txt = await card.innerText();
  check('le badge « Premium » est affiché', /Premium/i.test(txt), txt.split('\n')[1] || '');
}

// Profil : compte gratuit
await page.goto(`${BASE}/espace/profil`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const planCard = page.locator('.glass-card').nth(1);
const planText = await planCard.innerText().catch(() => '');
const profilFree = /Compte gratuit/.test(planText);
const ctaFree = /Passer Premium/.test(planText);
check('Profil affiche « Compte gratuit »', profilFree);
check('Profil affiche « Passer Premium »', ctaFree);

// Tarifs : l'offre gratuite est marquée comme la sienne
await page.goto(`${BASE}/tarifs`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const ownedFree = await page.locator('text=Ton offre actuelle').isVisible().catch(() => false);
check('Tarifs marque l\'offre gratuite comme actuelle', ownedFree);

// ── ABONNEMENT ACTIF ────────────────────────────────────────────────────
console.log('\n=== 2. ABONNEMENT ACTIF ===');
const s1 = await webhook({
  id: `evt_ui_1_${Date.now()}`, type: 'checkout.session.completed', created: now(),
  data: { object: { id: 'cs_ui', mode: 'subscription', subscription: SUB, customer: CUS, payment_status: 'paid', client_reference_id: String(USER_ID) } },
});
const s2 = await webhook(subEvent(`evt_ui_2_${Date.now()}`, 'active'));
check('webhooks acceptés (200)', s1 === 200 && s2 === 200, `checkout=${s1} sub=${s2}`);

await page.reload({ waitUntil: 'networkidle' });
await page.goto(`${BASE}/espace/cours`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const openCard = page.locator(`a[href*="${LESSON}"]`).first();
const openVisible = await openCard.isVisible().catch(() => false);
check('la leçon est maintenant ouverte (lien vers la leçon)', openVisible);
if (openVisible) {
  const t = await openCard.innerText();
  check('le badge Premium est CONSERVÉ pour l\'abonné', /Premium/i.test(t), t.split('\n').slice(0,3).join(' | '));
}

await page.goto(`${BASE}/espace/profil`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const planCard2 = page.locator('.glass-card').nth(1);
const planText2 = await planCard2.innerText().catch(() => '');
const abonne = /Abonnement actif/.test(planText2);
const ctaGone = /Passer Premium/.test(planText2);
check('Profil affiche « Abonnement actif »', abonne);
check('Profil ne propose plus « Passer Premium »', !ctaGone);

// La leçon s'ouvre vraiment
await page.goto(`${BASE}/lecons/lycee/2nde/fonctions/${LESSON}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const notHome = !new URL(page.url()).pathname.match(/^\/?$/);
check('la leçon s\'ouvre (pas de redirection accueil)', notHome, page.url());

// ── EXPIRATION ──────────────────────────────────────────────────────────
console.log('\n=== 3. EXPIRATION ===');
const s3 = await webhook(subEvent(`evt_ui_3_${Date.now()}`, 'canceled', {
  type: 'customer.subscription.deleted', object: { ended_at: now() } }));
check('suppression acceptée', s3 === 200);

await page.goto(`${BASE}/espace/cours`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const relocked = await page.locator(`a[href="/tarifs"]`).filter({ hasText: /Fonction affine/i }).first().isVisible().catch(() => false);
check('la leçon est REVERROUILLÉE', relocked);

// ── MOBILE 390px ────────────────────────────────────────────────────────
console.log('\n=== 4. MOBILE (390px) ===');
const mob = await ctx.newPage();
mob.on('console', (m) => { if (m.type() === 'error') consoleErrors.push('[mobile] ' + m.text()); });
await mob.setViewportSize({ width: 390, height: 844 });
for (const [label, path] of [['profil', '/espace/profil'], ['tarifs', '/tarifs'], ['cours', '/espace/cours']]) {
  await mob.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  await mob.waitForTimeout(1200);
  const overflow = await mob.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(`${label} : aucun débordement horizontal`, overflow <= 1, `écart=${overflow}px`);
}
await mob.close();

// ── CONSOLE ─────────────────────────────────────────────────────────────
console.log('\n=== 5. CONSOLE ===');
const real = consoleErrors.filter((e) => !/favicon|404 \(Not Found\)|ERR_|Download the React/i.test(e));
check('aucune erreur console inattendue', real.length === 0, real.slice(0, 3).join(' ~ '));

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${'='.repeat(60)}`);
console.log(`E2E : ${results.length - failed.length}/${results.length} réussis`);
if (failed.length) { console.log('ÉCHECS :'); failed.forEach((f) => console.log('  - ' + f.name + (f.detail ? ' :: ' + f.detail : ''))); }
process.exit(failed.length ? 1 : 0);
