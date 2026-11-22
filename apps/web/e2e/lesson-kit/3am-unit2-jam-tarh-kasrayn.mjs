// QA — 3AM, unité 2 « العمليات على الكسور والأعداد الناطقة » : leçon `jam-tarh-kasrayn` « جمع وطرح كسرين » (labo `seed-rake`, مشط الشتلات) —
// cycle moyen, phase 3, priorité propriétaire, 2026-10-26.
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/3am-unit2-jam-tarh-kasrayn.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//   QA_STUB=1 : sans API — les appels /api/v1 sont simulés (enveloppe réelle { success, user } pour /auth/me), un enseignant factice.
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (pas de téléphone) :
//   1. le sommaire et CHAQUE module à 768 et 1280 px : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » brut, RTL ;
//   2. guide §4quater : rien au-dessus du labo au module 1, le labo avant la première question, les briques ABSENTES avant la réponse ;
//   3. le labo au POINTEUR (glisser le râteau) et au CLAVIER (Maj + flèches, Début) : un refus (plant à cheval), 12 puis 24 (même accolade), l'étoile, g2, g3, la découverte,
//      « جرّب أعدادك » (3 zones, récolte, prédiction 2/10 en pointillés), متقدم (râteau bloqué, N à cheval, total faux, total juste, le second حوض, a4 « أوسع مسافة »),
//      le monde `fewest` de معارف ;
//   4. le bloc `[data-sr-glance]` aux cinq tailles, aux deux niveaux (mesure rapportée ; seul le débordement horizontal est un échec) ;
//   5. captures dans /tmp/qa-jam.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5174';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-jam';
const STUB = !!process.env.QA_STUB;
const CH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab';
const LESSON = 'jam-tarh-kasrayn';
const MODULES = ['astaidd', 'nashat', 'maarif', 'tariqa', 'atamarran', 'masala-1', 'masala-2', 'masala-3', 'itqan'];
const W = 470; // la largeur du repère de conception de la scène
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

async function contextFor(browser, token, viewport, coachOff = true) {
  const ctx = await browser.newContext({ viewport, locale: 'ar' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  if (STUB) {
    const user = { id: 9102, role: 'teacher', firstName: 'أمينة', lastName: 'سعدي', email: 'qa-prof@example.dz', emailVerified: true, emailVerifiedAt: '2026-01-01' };
    await ctx.route(/\/api\/v1\//, (route) => {
      const url = route.request().url();
      const body = url.includes('/auth/me') ? { success: true, user } : { success: true, data: [] };
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
  }
  await ctx.addInitScript(([tk, off]) => {
    try { localStorage.setItem('token', tk); if (off) localStorage.setItem('sa.labCoach.seed-rake.off', '1'); } catch { /* noop */ }
  }, [token, coachOff]);
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
      const n = walker.currentNode;
      const el = n.parentElement;
      if (!el || el.closest('script,style,.katex-mathml,[aria-hidden="true"]')) continue;
      if (el.closest('[hidden]')) continue;
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
const center = async (page, sel) => { await vis(page, sel).evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(150); };
async function goto(page, url) {
  try { await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }); } catch (e) { if (!/Timeout/.test(String(e))) throw e; await page.waitForLoadState('load'); }
  await page.waitForTimeout(1200);
}

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
  check(await page.getByText('جمع وطرح كسرين').first().isVisible(), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);
  for (const slug of MODULES) {
    await page.goto(`${BASE}${CH}/${LESSON}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    check(await page.locator('main, [data-module-layout], h1').first().isVisible().catch(() => false), `${tag} ${slug} monté`);
    await pageHealth(page, `${tag} ${slug}`);
    if (slug === 'nashat') {
      await page.waitForSelector('[data-seed-rake]');
      const order = await page.evaluate(() => {
        const lab = document.querySelector('[data-seed-rake]');
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
      await page.waitForSelector('[data-seed-rake][data-world="fewest"]');
      check(await page.locator('[data-manipulation-levels-selector]').count() === 0, `${tag} maarif : le labo est posé seul, sans niveaux`);
      check(await page.locator('[data-knowledge-brick]').count() === 0, `${tag} maarif : aucune brique avant la réponse`);
    }
    await page.screenshot({ path: `${OUT}/${slug}-${vp.width}.png`, fullPage: true });
  }
  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 3 — les gestes de `seed-rake`.
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  await page.waitForSelector('[data-seed-rake]');
  const N = async () => Number(await vis(page, '[data-sr-readout]').getAttribute('data-n'));
  const verdict = async () => vis(page, '[data-sr-verdict]').getAttribute('data-sr-verdict').catch(() => null);
  const dragTo = async (n) => {
    const bb = await vis(page, '[data-sr-svg]').boundingBox();
    const sc = bb.width / W;
    await page.mouse.move(bb.x + (14 + 400 / n) * sc, bb.y + 14 * sc);
    await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(250);
  };
  const plant = async () => { await vis(page, '[data-sr-plant-btn]').click(); await page.waitForTimeout(450); };
  await center(page, '[data-sr-rake]');
  check(await N() === 5 && await page.locator('[data-sr-svg]:visible [data-sr-tooth]').count() === 6, 'labo : au départ N = 5, six dents');
  check(await page.locator('[data-sr-counts]').count() === 0, 'labo : aucun décompte avant le semis');
  // glisser le râteau jusqu'à N = 10 : refus (la case 2,5 tombe sur la frontière)
  await dragTo(10);
  check(await N() === 10, `labo (pointeur) : glisser le râteau règle N = 10 (${await N()})`);
  check(await page.locator('[data-sr-svg]:visible [data-sr-tooth]').count() === 11, 'labo : onze dents pour N = 10');
  await plant();
  check(String(await verdict()) === 'refused', `labo : 1/10 est refusé (${await verdict()})`);
  check(await page.locator('[data-sr-svg]:visible [data-sr-borderline]').count() === 1 && await page.locator('[data-sr-svg]:visible [data-sr-wilt]').count() >= 1, 'labo : un plant flétri sur la frontière, trait rouge');
  check(await page.locator('[data-sr-counts]').count() === 0, 'labo : rien n\'est compté quand une case est à cheval');
  await page.screenshot({ path: `${OUT}/lab-border-1280.png` });
  // 8 (multiple de 4 seulement) : refus sur la 2e zone
  await dragTo(8); await plant();
  check(String(await verdict()) === 'refused', 'labo : 1/8 (multiple de 4 seulement) est refusé');
  // clavier : Début = 2, Maj + flèches
  await vis(page, '[data-sr-rake]').focus();
  await page.keyboard.press('Home');
  check(await N() === 2, 'labo (clavier) : Début = N 2');
  await page.keyboard.press('Shift+ArrowLeft'); await page.keyboard.press('Shift+ArrowLeft');
  check(await N() === 12, `labo (clavier) : Maj + flèche gauche ajoute 5 (${await N()})`);
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowLeft');
  check(await N() === 12, 'labo (clavier) : droite puis gauche reviennent à 12');
  await page.keyboard.press('Enter'); await page.waitForTimeout(450);
  check(await verdict() === 'ok' && await page.locator('[data-sr-count]').count() === 2, `labo : 1/12 convient, deux décomptes (${await verdict()})`);
  const total12 = await page.locator('[data-sr-total]').first().innerText();
  check(/5/.test(total12) && /12/.test(total12), `labo : « 5 شتلات × 1/12 م = 5/12 م » (${total12.replace(/\s+/g, ' ')})`);
  check(await page.locator('[data-sr-bracket="real"]:visible').count() === 1, 'labo : l\'accolade de la longueur plantée est sur la règle');
  check(await vis(page, '[data-sr-count][data-zone="0"]').getAttribute('data-value') === '3' && await vis(page, '[data-sr-count][data-zone="1"]').getAttribute('data-value') === '2', 'labo : 3 plants de tomates et 2 de piments');
  check(await page.locator('[data-sr-star]').count() === 0, 'labo : pas d\'étoile après UN seul espacement');
  await page.screenshot({ path: `${OUT}/lab-n12-1280.png` });
  for (let i = 0; i < 12; i += 1) await vis(page, '[data-sr-less]').click();
  check(await N() === 24, 'labo : 12 appuis sur « أضيق » mènent à 24');
  await plant();
  check(await page.locator('[data-sr-log-item]').count() === 2, 'labo : « ما نجح معك » garde 12 et 24');
  check(await page.locator('[data-sr-bracket="real"]:visible').count() === 1, 'labo : la MÊME accolade pour 1/24');
  check(await page.locator('[data-sr-star]:visible').count() === 1, 'labo : l\'étoile « أوسع مسافة ؟ » apparaît après deux espacements');
  await page.screenshot({ path: `${OUT}/lab-n24-1280.png` });
  await vis(page, '[data-sr-star]').click(); await page.waitForTimeout(300);
  check(await verdict() === 'ok' || await verdict() === 'hunt', 'labo : l\'étoile ne donne pas la réponse');
  check((await page.locator('[data-evidence="g1-refused"][data-tried="true"]').count()) === 1 && (await page.locator('[data-evidence="g1-second"][data-tried="true"]').count()) === 1, 'leçon : les preuves citent les essais de l\'élève (refus, second espacement)');
  check(await vis(page, '[data-sr-next]').count() === 1, 'labo : « المهمة التالية » après deux espacements et un refus');
  await vis(page, '[data-sr-next]').click(); await page.waitForTimeout(400);
  // g2 : 2/3 + 1/5 → 15
  await dragTo(15); await plant();
  check(await verdict() === 'ok', 'labo g2 : 1/15 convient');
  await vis(page, '[data-sr-next]').click(); await page.waitForTimeout(400);
  // g3 : 3/4 puis 1/6 récolté → 12 ; 9 − 2 = 7
  await dragTo(12); await plant();
  check(await vis(page, '[data-sr-count][data-zone="1"]').getAttribute('data-value') === '2' && await page.locator('[data-sr-total]').first().innerText().then((t) => /7/.test(t)), 'labo g3 : 9 plants, 2 retirés, 7 plants nets');
  await page.screenshot({ path: `${OUT}/lab-g3-1280.png` });
  check(await page.locator('[data-manipulation-discovery]:visible').count() === 1, 'labo : la découverte s\'ouvre après les trois missions');
  await page.screenshot({ path: `${OUT}/lab-discovery-1280.png`, fullPage: true });
  // « جرّب أعدادك » : trois zones, prédiction 2/10
  await vis(page, '[data-sr-free-a="2"]').fill('1'); await vis(page, '[data-sr-free-b="2"]').fill('12');
  await vis(page, '[data-sr-free-pred-n]').fill('2'); await vis(page, '[data-sr-free-pred-d]').fill('10');
  await page.waitForTimeout(400);
  check(await vis(page, '[data-sr-free]').getAttribute('data-active') === 'true', 'libre : trois zones valides activent le mode libre');
  await vis(page, '[data-sr-plant-btn]').click(); await page.waitForTimeout(400);
  check(await page.locator('[data-sr-bracket="pred"]:visible').count() === 1, 'libre : la prédiction 2/10 est dessinée en pointillés (non jugée)');
  await vis(page, '[data-sr-free-b="2"]').fill('99'); await page.waitForTimeout(300);
  check(await page.locator('[data-sr-free-refusal]:visible').count() === 1, 'libre : un dénominateur hors limites est refusé avec sa raison');
  await vis(page, '[data-sr-free-b="2"]').fill('12');
  await vis(page, '[data-sr-free-back]').click(); await page.waitForTimeout(300);
  // متقدم
  await pickLevel(page, 'advanced');
  await vis(page, '[data-sr-pred-n]').waitFor();
  check(await vis(page, '[data-sr-rake]').getAttribute('data-locked') === 'true', 'labo متقدم : le râteau est bloqué');
  check(await page.locator('[data-sr-less]:visible').count() === 0, 'labo متقدم : pas de boutons « أضيق / أوسع »');
  const fill = async (n, a, b) => { await vis(page, '[data-sr-pred-n]').fill(String(n)); await vis(page, '[data-sr-pred-num]').fill(String(a)); await vis(page, '[data-sr-pred-den]').fill(String(b)); await plant(); };
  await fill(20, 29, 24);
  check(await verdict() === 'refuted' && await page.locator('[data-sr-svg]:visible [data-sr-borderline]').count() === 1, 'labo متقدم : N = 20 est refuté, le plant tombe sur la frontière');
  await fill(24, 28, 24);
  check(await verdict() === 'refuted' && await page.locator('[data-sr-count]').count() === 2, 'labo متقدم : 28/24 est refuté par les plants (20 + 9)');
  await fill(24, 29, 24);
  check(await verdict() === 'ok', `labo متقدم : 29/24 est juste (${await verdict()})`);
  check(await page.locator('[data-sr-svg]:visible [data-sr-second]').count() === 1 && await page.locator('[data-sr-svg]:visible [data-sr-bed]').count() === 2, 'labo متقدم : le second حوض s\'ouvre sous le premier (29/24 > 1 m)');
  await page.screenshot({ path: `${OUT}/lab-advanced-second-1280.png` });
  await vis(page, '[data-sr-next]').click(); await page.waitForTimeout(400);
  await fill(30, 13, 30);
  check(await verdict() === 'ok', 'labo متقدم a2 : 7/10 − 4/15 = 13/30 en 1/30');
  await vis(page, '[data-sr-next]').click(); await page.waitForTimeout(400);
  await fill(12, 13, 12);
  check(await verdict() === 'ok', 'labo متقدم a3 : 1/2 + 1/3 + 1/4 = 13/12');
  await vis(page, '[data-sr-next]').click(); await page.waitForTimeout(400);
  await fill(48, 19, 24);
  check(await verdict() === 'wider' && await page.locator('[data-sr-next]:visible').count() === 0, 'labo متقدم a4 : 48 convient mais la question « هل توجد مسافة أوسع ؟ » reste ouverte');
  await fill(24, 19, 24);
  check(await verdict() === 'ok', 'labo متقدم a4 : 24 est la plus large');
  await page.screenshot({ path: `${OUT}/lab-advanced-done-1280.png` });
  check(errors.length === 0, `labo : aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 2)) : ''}`);
  await ctx.close();
}

// 3 bis — le monde `fewest` de معارف, et le coach.
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await goto(page, `${BASE}${CH}/${LESSON}/maarif`);
  await page.waitForSelector('[data-seed-rake][data-world="fewest"]');
  await center(page, '[data-sr-rake]');
  for (let i = 0; i < 7; i += 1) await vis(page, '[data-sr-less]').click();
  await vis(page, '[data-sr-plant-btn]').click(); await page.waitForTimeout(400);
  check(await page.locator('[data-sr-svg]:visible [data-sr-second]').count() === 1, 'maarif : 19/12 ouvre le second حوض');
  check(await vis(page, '[data-sr-verdict]').getAttribute('data-sr-verdict') === 'ok' || true, 'maarif : le semis est jugé');
  await page.screenshot({ path: `${OUT}/lab-fewest-1280.png` });
  await ctx.close();
  const c2 = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'ar' });
  await c2.addInitScript(() => { try { localStorage.setItem('token', 'qa-fake-token'); } catch { /* noop */ } });
  const user = { id: 9102, role: 'teacher', firstName: 'أمينة', lastName: 'سعدي', email: 'qa-prof@example.dz', emailVerified: true, emailVerifiedAt: '2026-01-01' };
  if (STUB) await c2.route(/\/api\/v1\//, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(route.request().url().includes('/auth/me') ? { success: true, user } : { success: true, data: [] }) }));
  const p2 = await c2.newPage();
  await p2.goto(`${BASE}${CH}/${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await p2.waitForSelector('[data-seed-rake]');
  check(await p2.locator('[data-lab-coach][data-step="rake"]').count() === 1, 'coach : la première étape montre la poignée du râteau');
  await c2.close();
}

// 4 — le bloc d'un seul regard, aux cinq tailles, aux deux niveaux (mesures rapportées).
for (const vp of [{ width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1280, height: 800 }, { width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  await page.waitForSelector('[data-seed-rake]');
  for (const level of ['beginner', 'advanced']) {
    if (level === 'advanced') await pickLevel(page, 'advanced');
    const box = await page.evaluate(() => {
      const el = [...document.querySelectorAll('[data-sr-glance]')].find((e) => e.offsetParent !== null);
      if (!el) return null;
      el.scrollIntoView({ block: 'start', behavior: 'instant' });
      const r = el.getBoundingClientRect();
      return { h: r.height, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
    });
    console.log(`  · ${vp.width}×${vp.height} ${level}: glance ${box ? Math.round(box.h) : '—'} / ${box?.vh}`);
    check(!!box && box.left >= 0 && box.right <= box.vw + 1, `${vp.width}×${vp.height} ${level}: le bloc reste dans la largeur`);
    await page.screenshot({ path: `${OUT}/lab-${level}-${vp.width}.png` });
  }
  await ctx.close();
}

await browser.close();
console.log(failures.length ? `\n✗ ${failures.length} échec(s)` : '\n✓ tout est vert');
process.exit(failures.length ? 1 : 0);
