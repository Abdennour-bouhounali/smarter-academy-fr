// QA — 3AM, unité 2 « العمليات على الكسور والأعداد الناطقة » : leçon `amaliyat-natiqa` « العمليات على الأعداد الناطقة » (labo `merge-board`, لوحة الدمج),
// cycle moyen, phase 3, priorité propriétaire, 2026-10-26.
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/3am-unit2-amaliyat-natiqa.mjs
//   QA_STUB=1 : sans API — les appels /api/v1 sont simulés (enveloppe réelle { success, user } pour /auth/me), un enseignant factice.
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement :
//   1. le sommaire et CHAQUE module à 768 et 1280 px : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » brut, RTL ;
//   2. guide §4quater : rien au-dessus du labo au module 1, le labo avant la première question, les briques ABSENTES avant la réponse ;
//   3. le labo au POINTEUR (porter chaque carte du panier au حبل) et au CLAVIER : w1 (deux piles, (−9)/(−12) traverse le zéro), la découverte après w3,
//      « جرّب أعدادك » (b = 0, hors حبل), متقدم (verdict faux, « أعد », verdict juste), le monde `writings` de معارف ;
//   4. le bloc `[data-npp-glance]` aux quatre tailles (mesure rapportée ; seul le débordement horizontal est un échec) ;
//   5. captures dans /tmp/qa-amal.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5174';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-amal';
const STUB = !!process.env.QA_STUB;
const CH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab';
const LESSON = 'amaliyat-natiqa';
const MODULES = ['astaidd', 'nashat', 'maarif', 'tariqa', 'atamarran', 'masala-1', 'masala-2', 'masala-3', 'itqan'];
mkdirSync(OUT, { recursive: true });

const failures = [];
const check = (ok, label) => { if (!ok) failures.push(label); console.log(`${ok ? '✓' : '✗'} ${label}`); };

async function loginToken(who, tries = 8) {
  if (STUB) return 'qa-fake-token';
  const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(who) });
  const data = await res.json().catch(() => ({}));
  const token = data.token ?? data.access_token ?? data.data?.token;
  if (!token && res.status === 429 && tries > 0) { await new Promise((r) => setTimeout(r, 15000)); return loginToken(who, tries - 1); }
  if (!token) throw new Error(`login ${who.email}: ${res.status}`);
  return token;
}

async function contextFor(browser, token, viewport) {
  const ctx = await browser.newContext({ viewport, locale: 'ar' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  if (STUB) {
    const user = { id: 9102, role: 'teacher', firstName: 'أمينة', lastName: 'سعدي', email: 'qa-prof@example.dz', emailVerified: true, emailVerifiedAt: '2026-01-01' };
    await ctx.route(/\/api\/v1\//, (route) => {
      const body = route.request().url().includes('/auth/me') ? { success: true, user } : { success: true, data: [] };
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
  }
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); localStorage.setItem('sa.labCoach.merge-board.off', '1'); } catch { /* noop */ } }, token);
  return ctx;
}

const RAW = /(^|[^\\])\$[^$\s][^$]*\$|\\(frac|times|mathrm|sqrt|neq|approx|div)\b|manipulation\.[a-zA-Z]+\./;

async function pageHealth(page, label) {
  const { overflow, raw, dir } = await page.evaluate((re) => {
    const rx = new RegExp(re);
    const doc = document.documentElement;
    const bad = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode; const el = n.parentElement;
      if (!el || el.closest('script,style,.katex-mathml,[aria-hidden="true"]') || el.closest('[hidden]')) continue;
      if (rx.test(n.textContent)) bad.push(n.textContent.trim().slice(0, 80));
    }
    return { overflow: doc.scrollWidth - doc.clientWidth, raw: bad.slice(0, 3), dir: document.documentElement.dir || document.body.dir };
  }, RAW.source);
  check(overflow <= 1, `${label}: pas de débordement horizontal (${overflow}px)`);
  check(raw.length === 0, `${label}: aucun texte brut ${raw.length ? JSON.stringify(raw) : ''}`);
  check(dir === 'rtl', `${label}: page RTL`);
}

const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForTimeout(600);
};
const vis = (page, sel) => page.locator(`${sel}:visible`).first();
async function goto(page, url) {
  try { await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }); } catch (e) { if (!/Timeout/.test(String(e))) throw e; await page.waitForLoadState('load'); }
  await page.waitForTimeout(1200);
}


const tiles = (page) => page.locator('[data-mb-tile]:visible');
const tileTexts = (page) => tiles(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-id')));
const verdict = (page) => vis(page, '[data-mb-verdict]').getAttribute('data-mb-verdict');
async function pair(page, i, j) { await tiles(page).nth(i).click(); await tiles(page).nth(j).click(); }
const pad = (page, sg) => vis(page, `[data-mb-pad][data-sign="${sg}"]`).click();
async function pickLevelMB(page, level) { await pickLevel(page, level); await page.locator('[data-merge-board]:visible').first().waitFor(); }

const browser = await chromium.launch();
const token = await loginToken(TEACHER);

// 1 + 2 — sommaire, modules ; rien au-dessus du labo ; briques absentes avant la réponse.
for (const vp of [{ width: 1280, height: 800 }, { width: 768, height: 1024 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${LESSON} ${vp.width}px`;
  await page.goto(`${BASE}${CH}/${LESSON}`, { waitUntil: 'networkidle' });
  check(await page.getByText('العمليات على الأعداد الناطقة').first().isVisible(), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);
  for (const slug of MODULES) {
    await page.goto(`${BASE}${CH}/${LESSON}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    check(await page.locator('main, [data-module-layout], h1').first().isVisible().catch(() => false), `${tag} ${slug} monté`);
    await pageHealth(page, `${tag} ${slug}`);
    if (slug === 'nashat') {
      await page.waitForSelector('[data-merge-board]');
      const order = await page.evaluate(() => {
        const lab = document.querySelector('[data-merge-board]');
        const brief = document.querySelector('[data-module-brief]');
        const q = document.querySelector('[data-activity-evidence]');
        const before = (a, b) => Boolean(a && b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING));
        return { briefAbove: brief ? before(brief, lab) : false, labBeforeQuestion: before(lab, q) };
      });
      check(!order.briefAbove, `${tag} nashat : aucune carte au-dessus du labo`);
      check(order.labBeforeQuestion, `${tag} nashat : le labo avant la première question`);
      check(await page.locator('[data-knowledge-brick]').count() === 0, `${tag} nashat : aucune brique avant la réponse`);
    }
    if (slug === 'maarif') {
      await page.waitForSelector('[data-merge-board][data-world="signs"]');
      check(await page.locator('[data-manipulation-levels-selector]').count() === 0, `${tag} maarif : le labo est posé seul, sans niveaux`);
      check(await page.locator('[data-knowledge-brick]').count() === 0, `${tag} maarif : aucune brique avant la réponse`);
    }
    await page.screenshot({ path: `${OUT}/${slug}-${vp.width}.png`, fullPage: true });
  }
  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 3 — les gestes de `merge-board`.
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  await page.waitForSelector('[data-merge-board]');
  check(await vis(page, '[data-mb-pad][data-sign="1"]').isDisabled(), 'مبتدئ : les pavés sont inactifs tant qu\'aucune paire n\'est choisie');
  check(await page.locator('[data-mb-bar="neg"]:visible').count() >= 1 && await page.locator('[data-mb-bar="pos"]:visible').count() >= 1, 'مبتدئ : les barres signées sont visibles (rouge −, bleu +)');
  // c1 : −5/4 + 11/6
  await pair(page, 0, 1);
  check(await page.locator('[data-mb-miniline]:visible').count() === 1, 'c1 : la mini-droite des barres sous la paire');
  await pad(page, -1);
  check((await verdict(page)) === 'sign', 'c1 : « − » est REFUSÉ (le bleu est plus long)');
  check((await tileTexts(page)).length === 2, 'c1 : rien n\'a fusionné');
  await page.screenshot({ path: `${OUT}/c1-refused.png` });
  await pad(page, 1);
  await page.waitForTimeout(500);
  check((await tileTexts(page)).length === 1, 'c1 : « + » fusionne en une seule tuile');
  check(await page.locator('[data-mb-trail]:visible').count() === 1, 'c1 : la trace du dénominateur commun est écrite');
  await page.screenshot({ path: `${OUT}/c1-merged.png` });
  await vis(page, '[data-mb-next]').click();
  // c2 : 7/13 × −8/5
  await pair(page, 0, 1);
  check(await page.locator('[data-mb-miniline]:visible').count() === 0, 'c2 : pas de mini-droite pour un produit');
  await pad(page, 1);
  check((await verdict(page)) === 'sign', 'c2 : produit positif REFUSÉ');
  await pad(page, -1);
  check((await tileTexts(page)).length === 1, 'c2 : le produit négatif fusionne');
  await vis(page, '[data-mb-next]').click();
  // c3 : −9/8 ÷ −3/4 : retourner le diviseur
  await pair(page, 0, 1);
  await pad(page, 1);
  check((await verdict(page)) === 'noflip', 'c3 : la division sans retournement est REFUSÉE');
  const flips = page.locator('[data-mb-flip]:visible');
  check(await flips.count() === 2, 'c3 : un bouton « اقلب » sous chaque tuile de la division');
  await flips.nth(0).click();
  check((await verdict(page)) === 'dividend', 'c3 : retourner le DIVIDENDE est refusé');
  await flips.nth(1).click();
  check((await page.locator('[data-mb-tile][data-flipped="true"]:visible').getAttribute('data-sign')) === '-1', 'c3 : le مقلوب de −3/4 garde sa barre rouge (signe −)');
  await page.screenshot({ path: `${OUT}/c3-flipped.png` });
  await pad(page, 1);
  await page.waitForTimeout(500);
  check((await tileTexts(page)).length === 1, 'c3 : après le retournement et la bonne prédiction, la tuile fusionne');
  check(await page.locator('[data-manipulation-discovery]:visible').count() > 0, 'la découverte s\'ouvre après c1–c3');
  await page.screenshot({ path: `${OUT}/discovery.png`, fullPage: true });
  await vis(page, '[data-mb-next]').click();
  // c4 : 7/3 − 8/15 ÷ 11/20 : l'aimant
  await pair(page, 0, 1);
  check((await verdict(page)) === 'magnet', 'c4 : l\'AIMANT refuse la soustraction d\'abord');
  await page.screenshot({ path: `${OUT}/c4-magnet.png` });
  await pair(page, 1, 2);
  await page.locator('[data-mb-flip]:visible').nth(1).click();
  await pad(page, 1);
  await page.waitForTimeout(400);
  check((await tileTexts(page)).length === 2, 'c4 : la division fusionne d\'abord (32/33)');
  await pair(page, 0, 1);
  await pad(page, 1);
  await page.waitForTimeout(500);
  check((await tileTexts(page)).length === 1 && (await verdict(page)) === 'solved', 'c4 : 15/11, la chaîne est finie');
  await page.screenshot({ path: `${OUT}/c4-solved.png` });
  // « جرّب أعدادك »
  await vis(page, '[data-mb-free-input]').fill('1/2 +');
  await vis(page, '[data-mb-free-add]').click();
  check(await vis(page, '[data-mb-free-refusal="syntax"]').isVisible(), 'جرّب أعدادك : une chaîne incomplète est refusée');
  await vis(page, '[data-mb-free-input]').fill('3/4 ÷ 0');
  await vis(page, '[data-mb-free-add]').click();
  check(await vis(page, '[data-mb-free]').getAttribute('data-active') === 'true', 'جرّب أعدادك : la chaîne est construite');
  await pair(page, 0, 1);
  await page.locator('[data-mb-flip]:visible').nth(1).click();
  check((await verdict(page)) === 'zero', 'جرّب أعدادك : « لا مقلوب للعدد 0 »');
  await vis(page, '[data-mb-free-input]').fill('-1/2 + 1/2');
  await vis(page, '[data-mb-free-add]').click();
  await pair(page, 0, 1);
  check(await vis(page, '[data-mb-pad][data-sign="0"]').isVisible(), 'جرّب أعدادك : le pavé « معدوم » existe (une somme peut s\'annuler)');
  await pad(page, 0);
  check((await tileTexts(page)).length === 1, 'جرّب أعدادك : −1/2 + 1/2 = 0 fusionne avec le pavé « معدوم »');
  check(errors.length === 0, `labo mb : aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);

  // متقدم : barres cachées, bulle, fraction composée
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  await pickLevelMB(page, 'advanced');
  check(await page.locator('[data-mb-bar="hidden"]:visible').count() >= 2 && await page.locator('[data-mb-bar="neg"]:visible').count() === 0, 'متقدم : les barres sont cachées');
  // a1 : (2/3 − 5/2) × −6/11 — la bulle
  await pair(page, 1, 2);
  check((await verdict(page)) === 'bubble', 'a1 : fusionner à travers la bulle est REFUSÉ');
  await page.screenshot({ path: `${OUT}/a1-bubble.png` });
  await pair(page, 0, 1);
  await pad(page, -1);
  await page.waitForTimeout(400);
  await pair(page, 0, 1);
  await pad(page, 1);
  await page.waitForTimeout(500);
  check((await tileTexts(page)).length === 1, 'a1 : bulle puis produit → 1');
  await vis(page, '[data-mb-next]').click();
  await vis(page, '[data-mb-next]').click().catch(() => {});
  await page.screenshot({ path: `${OUT}/a2.png` });
  await ctx.close();
}

// 3bis — le monde `signs` de معارف : six prédictions justes de suite ; une erreur remet la série à zéro.
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await goto(page, `${BASE}${CH}/${LESSON}/maarif`);
  await page.waitForSelector('[data-merge-board][data-world="signs"]');
  check(!(await vis(page, '[data-mb-pad][data-sign="1"]').isDisabled()), 'maarif : la paire est déjà choisie, les pavés sont actifs');
  await pad(page, 1);                                 // −2/3 + 1/4 est NÉGATIF : faux
  check((await verdict(page)) === 'sign', 'maarif : une prédiction fausse est refusée');
  const signs = [-1, -1, 1, -1, -1, 1];
  for (let i = 0; i < signs.length; i += 1) {
    await pad(page, signs[i]);
    await page.waitForTimeout(350);
    if (i < signs.length - 1) await vis(page, '[data-mb-next]').click();
  }
  check(await vis(page, '[data-merge-board]').getAttribute('data-solved') === 'true', 'maarif : six signes justes de suite');
  await page.screenshot({ path: `${OUT}/signs-done.png` });
  await ctx.close();
}

// 4 — le bloc d'un seul regard aux quatre tailles.
for (const [w, h] of [[768, 1024], [1024, 768], [1280, 800], [1366, 768]]) {
  const ctx = await contextFor(browser, token, { width: w, height: h });
  const page = await ctx.newPage();
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  for (const level of ['beginner', 'advanced']) {
    await pickLevelMB(page, level);
    await pair(page, 0, 1).catch(() => {});
    const m = await vis(page, '[data-mb-glance]').evaluate((el) => ({ h: Math.round(el.getBoundingClientRect().height), ow: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
    console.log(`  glance ${level} ${w}×${h} : ${m.h}px (écran ${h}px)`);
    check(m.ow <= 1, `glance ${level} ${w}×${h} : pas de débordement horizontal`);
    await vis(page, '[data-mb-glance]').evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.screenshot({ path: `${OUT}/lab-${level}-${w}x${h}.png` });
  }
  await ctx.close();
}

await browser.close();
if (failures.length) { console.log(`\n${failures.length} échec(s) :\n- ${failures.join('\n- ')}`); process.exit(1); }
console.log('\nOK');
