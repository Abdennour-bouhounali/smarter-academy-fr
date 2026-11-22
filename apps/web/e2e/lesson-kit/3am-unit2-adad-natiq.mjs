// QA — 3AM, unité 2 « العمليات على الكسور والأعداد الناطقة » : leçon `adad-natiq` « العدد الناطق » (labo `number-line-pegs`, حبل الأعداد),
// cycle moyen, phase 3, priorité propriétaire, 2026-10-26.
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/3am-unit2-adad-natiq.mjs
//   QA_STUB=1 : sans API — les appels /api/v1 sont simulés (enveloppe réelle { success, user } pour /auth/me), un enseignant factice.
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement :
//   1. le sommaire et CHAQUE module à 768 et 1280 px : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » brut, RTL ;
//   2. guide §4quater : rien au-dessus du labo au module 1, le labo avant la première question, les briques ABSENTES avant la réponse ;
//   3. le labo au POINTEUR (porter chaque carte du panier au حبل) et au CLAVIER : w1 (deux piles, (−9)/(−12) traverse le zéro), la découverte après w3,
//      « جرّب أعدادك » (b = 0, hors حبل), متقدم (verdict faux, « أعد », verdict juste), le monde `writings` de معارف ;
//   4. le bloc `[data-npp-glance]` aux quatre tailles (mesure rapportée ; seul le débordement horizontal est un échec) ;
//   5. captures dans /tmp/qa-adad.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5174';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-adad';
const STUB = !!process.env.QA_STUB;
const CH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab';
const LESSON = 'adad-natiq';
const MODULES = ['astaidd', 'nashat', 'maarif', 'tariqa', 'atamarran', 'masala-1', 'masala-2', 'masala-3', 'itqan'];
const W = 470;
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
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); localStorage.setItem('sa.labCoach.number-line-pegs.off', '1'); } catch { /* noop */ } }, token);
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

/** Porter la carte `id` du panier au حبل à la valeur v (gamme [lo, hi]) : un vrai glisser au pointeur. */
async function carry(page, id, v, [lo, hi]) {
  const stage = vis(page, '[data-npp-stage] > div');
  await stage.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(150);
  const sb = await stage.boundingBox();
  const scale = Number(await vis(page, '[data-npp-stage]').getAttribute('data-scale'));
  const card = vis(page, `[data-npp-card][data-id=${id}]`);
  const b = await card.boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y - 30, { steps: 3 });
  await page.mouse.move(sb.x + (34 + ((v - lo) / (hi - lo)) * (W - 68)) * scale, sb.y + 84 * scale + 20, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(120);
}
const hungAt = (page, id) => vis(page, '[data-npp-glance]').locator(`[data-npp-hung][data-id=${id}]`).getAttribute('data-x');

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
  check(await page.getByText('العدد الناطق').first().isVisible(), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);
  for (const slug of MODULES) {
    await page.goto(`${BASE}${CH}/${LESSON}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    check(await page.locator('main, [data-module-layout], h1').first().isVisible().catch(() => false), `${tag} ${slug} monté`);
    await pageHealth(page, `${tag} ${slug}`);
    if (slug === 'nashat') {
      await page.waitForSelector('[data-number-line-pegs]');
      const order = await page.evaluate(() => {
        const lab = document.querySelector('[data-number-line-pegs]');
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
      await page.waitForSelector('[data-number-line-pegs][data-world="writings"]');
      check(await page.locator('[data-manipulation-levels-selector]').count() === 0, `${tag} maarif : le labo est posé seul, sans niveaux`);
      check(await page.locator('[data-knowledge-brick]').count() === 0, `${tag} maarif : aucune brique avant la réponse`);
    }
    await page.screenshot({ path: `${OUT}/${slug}-${vp.width}.png`, fullPage: true });
  }
  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 3 — les gestes de `number-line-pegs`.
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  await page.waitForSelector('[data-number-line-pegs]');
  check(await vis(page, '[data-npp-check]').isDisabled(), 'مبتدئ : « تحقّق » inactif tant qu\'aucune carte n\'est accrochée');
  // w1 : (−9)/(−12) est accrochée du MAUVAIS côté
  await carry(page, 'c0', -0.75, [-2, 2]);
  check(await hungAt(page, 'c0') === '-9/12', 'w1 : la carte lâchée à −0,75 est accrochée à −9/12');
  check(await vis(page, '[data-npp-loupe]').count().then((n) => n === 0), 'w1 : la loupe disparaît au lâcher');
  await carry(page, 'c1', -0.75, [-2, 2]);
  await carry(page, 'c2', 0.75, [-2, 2]);
  await carry(page, 'c3', -0.75, [-2, 2]);
  await page.screenshot({ path: `${OUT}/w1-hung.png` });
  await vis(page, '[data-npp-check]').click();
  await page.waitForTimeout(1500);
  check(await hungAt(page, 'c3') === '3/4', 'w1 : (−9)/(−12) a glissé à 3/4 (côté positif)');
  check(await page.locator('[data-npp-stack]:visible').count() === 2, 'w1 : deux piles');
  check((await vis(page, '[data-npp-verdict]').getAttribute('data-npp-verdict')) === 'cross', 'w1 : le verdict dit que la carte a traversé le zéro');
  await page.screenshot({ path: `${OUT}/w1-settled.png` });
  await vis(page, '[data-npp-next]').click();
  // w2 : −7/3 etc., placés au mieux à −2,33 (le pas 1/12 le permet : −28)
  await carry(page, 'c0', -7 / 3, [-3, 3]);
  check(await hungAt(page, 'c0') === '-28/12', 'w2 : −7/3 s\'accroche exactement à −28/12');
  await carry(page, 'c1', -7 / 3, [-3, 3]);
  await carry(page, 'c2', -2, [-3, 3]);
  await carry(page, 'c3', 7 / 3, [-3, 3]);
  await vis(page, '[data-npp-check]').click();
  await page.waitForTimeout(1500);
  check(await page.locator('[data-npp-readout]:visible').count() >= 1, 'w2 : la lecture décimale « −2,333… » (non terminée) accompagne −7/3');
  check(await page.locator('[data-npp-stack]:visible[data-count="3"]').count() === 1, 'w2 : trois cartes sur le piquet de −7/3');
  await page.screenshot({ path: `${OUT}/w2-settled.png` });
  await vis(page, '[data-npp-next]').click();
  // w3 : au CLAVIER : Entrée prend la carte, les flèches la déplacent d'un douzième, Entrée l'accroche
  const first = vis(page, '[data-npp-card][data-id=c1]');
  await first.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  check(await vis(page, '[data-npp-rope]').getAttribute('data-held') === 'true', 'clavier : Entrée prend la carte');
  for (let i = 0; i < 24; i += 1) await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  check(await hungAt(page, 'c1') === '24/12' || await hungAt(page, 'c1') === '2', 'clavier : 24 pas de 1/12 → 2');
  await carry(page, 'c0', -1.5, [-4, 4]);
  await carry(page, 'c2', 2.5, [-4, 4]);
  await carry(page, 'c3', -3, [-4, 4]);
  await vis(page, '[data-npp-check]').click();
  await page.waitForTimeout(1500);
  check(await page.locator('[data-manipulation-discovery]:visible').count() > 0, 'la découverte s\'ouvre après w1–w3');
  await page.screenshot({ path: `${OUT}/discovery.png`, fullPage: true });
  // « جرّب أعدادك »
  await vis(page, '[data-npp-free-a]').fill('5');
  await vis(page, '[data-npp-free-b]').fill('0');
  await vis(page, '[data-npp-free-add]').click();
  check(await vis(page, '[data-npp-free-refusal="zero"]').isVisible(), 'جرّب أعدادك : b = 0 est refusé');
  await vis(page, '[data-npp-free-a]').fill('40');
  await vis(page, '[data-npp-free-b]').fill('5');
  await vis(page, '[data-npp-free-add]').click();
  check(await vis(page, '[data-npp-free-refusal="outside"]').isVisible(), 'جرّب أعدادك : une carte hors du حبل est refusée');
  await vis(page, '[data-npp-free-a]').fill('-14');
  await vis(page, '[data-npp-free-b]').fill('6');
  await vis(page, '[data-npp-free-add]').click();
  check(await vis(page, '[data-npp-free]').getAttribute('data-active') === 'true', 'جرّب أعدادك : la carte est ajoutée');
  check(errors.length === 0, `labo mb : aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);

  // متقدم : a1 — verdict faux, « أعد », verdict juste
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  await pickLevel(page, 'advanced');
  const A1 = { c0: -7 / 4, c1: 5 / 6, c2: -2 / 3, c3: -13 / 6, c4: 3 / 2, c5: -1 / 12 };
  check(await page.locator('[data-npp-tw]:visible').count() === 0, 'متقدم : aucune graduation entre les entiers');
  const bad = { ...A1, c0: -2 / 3, c2: -7 / 4 };          // −7/4 et −2/3 échangés
  for (const [id, v] of Object.entries(bad)) await carry(page, id, v, [-3, 3]);
  check(!(await vis(page, '[data-npp-check]').isDisabled()), 'متقدم : « تحقّق » actif quand TOUTES les cartes sont accrochées');
  await vis(page, '[data-npp-check]').click();
  await page.waitForTimeout(1500);
  check(await vis(page, '[data-npp-retry]').isVisible(), 'متقدم : un ordre faux propose « أعد »');
  await page.screenshot({ path: `${OUT}/a1-wrong.png` });
  await vis(page, '[data-npp-retry]').click();
  for (const [id, v] of Object.entries(A1)) await carry(page, id, v, [-3, 3]);
  await vis(page, '[data-npp-check]').click();
  await page.waitForTimeout(1500);
  check((await vis(page, '[data-npp-verdict]').getAttribute('data-npp-verdict')) === 'ok', 'متقدم : le bon ordre est accepté');
  await page.screenshot({ path: `${OUT}/a1-ok.png` });
  check(errors.length === 0, `labo adv : aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 3bis — le monde `writings` de معارف : quatre cartes sur −3/4, une sur 3/4.
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await goto(page, `${BASE}${CH}/${LESSON}/maarif`);
  await page.waitForSelector('[data-number-line-pegs][data-world="writings"]');
  const vals = { c0: -0.75, c1: -0.75, c2: -0.75, c3: -0.75, c4: 0.75 };
  for (const [id, v] of Object.entries(vals)) await carry(page, id, v, [-2, 2]);
  await vis(page, '[data-npp-check]').click();
  await page.waitForTimeout(1500);
  check(await page.locator('[data-npp-stack]:visible[data-count="4"]').count() === 1, 'maarif : quatre écritures sur le même piquet');
  await ctx.close();
}

// 4 — le bloc d'un seul regard aux quatre tailles.
for (const [w, h] of [[768, 1024], [1024, 768], [1280, 800], [1366, 768]]) {
  const ctx = await contextFor(browser, token, { width: w, height: h });
  const page = await ctx.newPage();
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  for (const level of ['beginner', 'advanced']) {
    await pickLevel(page, level);
    const m = await vis(page, '[data-npp-glance]').evaluate((el) => ({ h: Math.round(el.getBoundingClientRect().height), ow: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
    console.log(`  glance ${level} ${w}×${h} : ${m.h}px (écran ${h}px)`);
    check(m.ow <= 1, `glance ${level} ${w}×${h} : pas de débordement horizontal`);
  }
  await ctx.close();
}

await browser.close();
if (failures.length) { console.log(`\n${failures.length} échec(s) :\n- ${failures.join('\n- ')}`); process.exit(1); }
console.log('\nOK');
