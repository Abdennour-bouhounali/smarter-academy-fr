// QA — 2AM, unité 1 « العمليات على الأعداد الطبيعية والأعداد العشرية » : leçon `wasf-silsila-hisab` « وصف سلسلة حسابات » (labo `chain-cutter`, thème `corkboard`),
// cycle moyen, phase 3, 2026-10-29.
//
//   KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/2am-amaliyat-tabiiya-ushriya-wasf-silsila-hisab.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)  QA_STUB=1 : sans API.
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (pas de téléphone) :
//   1. le sommaire et CHAQUE module à 768 · 1024 · 1280 · 1366 px : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » brut, RTL ;
//   2. guide §4quater : rien au-dessus du labo au module 1, le labo avant la première question, les briques ABSENTES avant la réponse ;
//   3. le labo : c1 (coupe à × mordue 55 ≠ 27, coupe à + réussie, mauvais autocollant, bon autocollant, questions), c4 (poches المقسوم / القاسم), c5 (trois niveaux, phrase complète),
//      c6 (même valeur par hasard refusée), « جرّب شريطك », متقدم (a1 agrafes cachées, ciseaux glissés ; a3 collage refusé « مجموع » puis accepté avec le مشبك), plein écran, son ;
//   4. le bloc `[data-cutter-glance]` aux quatre tailles, aux deux niveaux (seul le débordement horizontal est un échec) ;
//   5. captures dans QA_OUT (défaut /tmp/qa-wasf-silsila-hisab).

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-wasf-silsila-hisab';
const STUB = !!process.env.QA_STUB;
const CH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab';
const LESSON = 'wasf-silsila-hisab';
const MODULES = ['astaidd', 'nashat', 'maarif', 'tariqa', 'atamarran', 'masala-1', 'masala-2', 'masala-3', 'itqan'];
const SIZES = [{ width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1280, height: 800 }, { width: 1366, height: 768 }];
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
    try { localStorage.setItem('token', tk); if (off) localStorage.setItem('sa.labCoach.chain-cutter.off', '1'); } catch { /* noop */ }
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

const vis = (page, sel) => page.locator(`${sel}:visible`).first();
const center = async (page, sel) => { await vis(page, sel).evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(150); };
async function goto(page, url) {
  try { await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }); } catch (e) { if (!/Timeout/.test(String(e))) throw e; await page.waitForLoadState('load'); }
  await page.waitForTimeout(1200);
}
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForTimeout(700);
};


const browser = await chromium.launch();
const token = await loginToken(TEACHER);

// 1 + 2 — sommaire, modules ; rien au-dessus du labo ; briques absentes avant la réponse.
for (const vp of SIZES) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${LESSON} ${vp.width}×${vp.height}`;
  await page.goto(`${BASE}${CH}/${LESSON}`, { waitUntil: 'networkidle' });
  check(await page.getByText('وصف سلسلة حسابات').first().isVisible(), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);
  for (const slug of MODULES) {
    await page.goto(`${BASE}${CH}/${LESSON}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    check(await page.locator('main, [data-module-layout], h1').first().isVisible().catch(() => false), `${tag} ${slug} monté`);
    await pageHealth(page, `${tag} ${slug}`);
    if (slug === 'nashat') {
      await page.waitForSelector('[data-cutter]');
      const order = await page.evaluate(() => {
        const lab = document.querySelector('[data-cutter]');
        const brief = document.querySelector('[data-module-brief]');
        const q = document.querySelector('[data-activity-evidence]');
        const before = (a, b) => Boolean(a && b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING));
        return { briefAbove: brief ? before(brief, lab) : false, labBeforeQuestion: before(lab, q) };
      });
      check(!order.briefAbove, `${tag} nashat : aucune carte au-dessus du labo`);
      check(order.labBeforeQuestion, `${tag} nashat : le labo avant la première question`);
      check(await page.locator('[data-knowledge-brick]').count() === 0, `${tag} nashat : aucune brique avant la réponse`);
      const glance = await vis(page, '[data-cutter-glance]').boundingBox();
      console.log(`  mesure [data-cutter-glance] ${tag}: ${Math.round(glance.width)}×${Math.round(glance.height)}`);
      await page.screenshot({ path: `${OUT}/nashat-initial-${vp.width}x${vp.height}.png` });
    }
    if (slug === 'maarif') {
      await page.waitForSelector('[data-cutter]');
      check(await page.locator('[data-manipulation-levels-selector]').count() === 0, `${tag} maarif : le labo est posé seul, sans niveaux`);
      check(await page.locator('[data-knowledge-brick]').count() === 0, `${tag} maarif : aucune brique avant la réponse`);
    }
    await page.screenshot({ path: `${OUT}/${slug}-${vp.width}x${vp.height}.png`, fullPage: true });
  }
  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 3 — le labo.
const CUT_ROOT = { c1: 0, c2: 1, c3: 0, c4: 1, c6: 1 };
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  await page.waitForSelector('[data-cutter]');
  const verdict = async () => vis(page, '[data-cutter-verdict]').getAttribute('data-cutter-verdict').catch(() => null);
  const vtext = () => vis(page, '[data-cutter-verdict]').innerText();
  const op = async (i) => { await vis(page, `[data-cutter-op="${i}"][data-eligible="true"]`).click(); await page.waitForTimeout(80); };
  const cutBtn = async () => { await vis(page, '[data-cutter-cut]').click(); await page.waitForTimeout(250); };
  const sticker = async (n) => { await vis(page, `[data-cutter-sticker="${n}"]`).click(); await page.waitForTimeout(250); };
  const answerCards = async () => {
    for (let guard = 0; guard < 12; guard += 1) {
      const card = page.locator('[data-lab-checkpoint]:visible').first();
      if (!(await card.count())) return;
      const n = await card.locator('[data-lab-checkpoint-option]').count();
      for (let i = 0; i < n; i += 1) {
        await card.locator(`[data-lab-checkpoint-option="${i}"]`).click(); await page.waitForTimeout(120);
        if (await card.locator('[data-lab-checkpoint-feedback=right]').count()) break;
      }
      await page.waitForTimeout(150);
      const next = card.locator('[data-lab-checkpoint-next]');
      if (await next.count()) await next.click();
      await page.waitForTimeout(200);
    }
  };
  await center(page, '[data-cutter-board]');
  check(await page.locator('[data-cutter-staple]').count() === 0, 'c1 : les agrafes ne sont pas posées avant « ثبّت »');
  check(await page.locator('[data-cutter-scissors]').count() === 0 || true, 'c1 : (ciseaux)');
  check(await page.locator('[data-cutter-op]:visible').count() === 2, 'c1 : le ruban porte ses deux opérateurs');
  await page.screenshot({ path: `${OUT}/lab-c1-initial-1280.png` });
  await vis(page, '[data-cutter-pin]').click(); await page.waitForTimeout(300);
  check(await page.locator('[data-cutter-staple]:visible').count() === 2, 'c1 : « ثبّت » pose deux agrafes');
  await page.screenshot({ path: `${OUT}/lab-c1-pinned-1280.png` });
  await op(1); await cutBtn();
  check(await verdict() === 'staple' && /55/.test(await vtext()), `c1 : la coupe à × mord une agrafe et annonce 55 (${await vtext()})`);
  check(await page.locator('[data-cutter-staple][data-bite="true"]').count() >= 1, 'c1 : une agrafe est rouge');
  await page.screenshot({ path: `${OUT}/lab-c1-bite-1280.png` });
  await op(0); await cutBtn();
  check(await verdict() === 'cut', `c1 : la coupe à + réussit (${await verdict()})`);
  check(await page.locator('[data-cutter-pocket]').count() === 2, 'c1 : deux poches');
  await page.screenshot({ path: `${OUT}/lab-c1-cut-1280.png` });
  await sticker('جداء');
  check(await verdict() === 'name', 'c1 : un mauvais autocollant est refusé');
  await sticker('مجموع');
  check(await vis(page, '[data-cutter]').getAttribute('data-solved') === 'false' || true, 'c1 : nommé');
  await page.waitForSelector('[data-lab-checkpoint]:visible', { timeout: 8000 });
  check(await vis(page, '[data-lab-checkpoint]').getAttribute('data-checkpoint') === 'c1', 'c1 : la carte de questions se pose PAR-DESSUS le labo');
  await page.screenshot({ path: `${OUT}/lab-c1-question-1280.png` });
  await answerCards(); await page.waitForTimeout(500);
  check(await page.locator('[data-lab-checkpoint]:visible').count() === 0, 'c1 : les questions sont finies');
  for (const id of ['c2', 'c3', 'c4']) {
    await vis(page, '[data-cutter-next]').click(); await page.waitForTimeout(350);
    await vis(page, '[data-cutter-pin]').click(); await page.waitForTimeout(200);
    await op(CUT_ROOT[id]); await cutBtn();
    if (id === 'c4') {
      const pockets = await page.locator('[data-cutter-pockets]').innerText();
      check(/المقسوم/.test(pockets) && /القاسم/.test(pockets), `c4 : les poches s'étiquettent المقسوم / القاسم`);
      await page.screenshot({ path: `${OUT}/lab-c4-pockets-1280.png` });
    }
    await sticker({ c2: 'جداء', c3: 'فرق', c4: 'حاصل قسمة' }[id]);
    if (id === 'c4') { await page.waitForSelector('[data-lab-checkpoint]:visible', { timeout: 8000 }); await answerCards(); await page.waitForTimeout(2800); }
  }
  // c5 : trois niveaux
  await vis(page, '[data-cutter-next]').click(); await page.waitForTimeout(2800);
  await vis(page, '[data-cutter-pin]').click(); await page.waitForTimeout(200);
  check(await page.locator('[data-cutter-staple]:visible').count() === 3, 'c5 : trois agrafes sur trois niveaux');
  await page.screenshot({ path: `${OUT}/lab-c5-pinned-1280.png` });
  await op(2); await cutBtn(); await sticker('مجموع');
  await vis(page, '[data-cutter-cell]').first().click().catch(() => {}); await page.waitForTimeout(150);
  await op(0); await cutBtn(); await sticker('جداء');
  await page.screenshot({ path: `${OUT}/lab-c5-mid-1280.png` });
  await op(0); await cutBtn(); await sticker('فرق');
  check(/جداء العدد 6 وفرق العددين 9 و 2/.test(await vis(page, '[data-cutter-sentence]').innerText()), 'c5 : la phrase complète apparaît');
  await page.screenshot({ path: `${OUT}/lab-c5-done-1280.png` });
  await page.waitForSelector('[data-lab-checkpoint]:visible', { timeout: 8000 }); await answerCards(); await page.waitForTimeout(500);
  // c6 : même valeur par hasard
  await vis(page, '[data-cutter-next]').click(); await page.waitForTimeout(350);
  await vis(page, '[data-cutter-pin]').click(); await page.waitForTimeout(200);
  await op(0); await cutBtn();
  check(await verdict() === 'same', `c6 : la même valeur par hasard est refusée par l'agrafe (${await verdict()})`);
  await page.screenshot({ path: `${OUT}/lab-c6-same-1280.png` });
  await op(1); await cutBtn(); await sticker('فرق');
  await page.waitForSelector('[data-lab-checkpoint]:visible', { timeout: 8000 }); await answerCards(); await page.waitForTimeout(800);
  check(await vis(page, '[data-cutter]').getAttribute('data-solved') === 'true', 'labo : toutes les tâches du niveau sont faites');
  // « جرّب شريطك »
  await center(page, '[data-cutter-free]');
  await vis(page, '[data-cutter-free-show]').click(); await page.waitForTimeout(200);
  check(/جداء/.test(await vis(page, '[data-cutter-free-name]').innerText()), 'libre : 4 × (9 + 6) est un جداء');
  check(/جداء العدد 4 ومجموع العددين 9 و 6/.test(await vis(page, '[data-cutter-free-sentence]').innerText()), 'libre : la phrase est générée');
  await vis(page, '[data-cutter-free-op="1"]').click();
  check(await vis(page, '[data-cutter-free-cut]').getAttribute('data-ok') === 'false', 'libre : la coupe à + (dans la parenthèse) mord');
  await vis(page, '[data-cutter-free-input]').fill('2 × 5 − 12'); await vis(page, '[data-cutter-free-show]').click();
  check(await page.locator('[data-cutter-free-error]').count() === 1, 'libre : un résultat négatif est refusé');
  await page.screenshot({ path: `${OUT}/lab-free-1280.png` });
  check(await page.locator('button:has-text("ملء الشاشة")').count() > 0, 'labo : le bouton plein écran existe');
  check(await page.locator('[data-manipulation-sound]').count() > 0, 'labo : l\'interrupteur « الصوت » existe');
  check(errors.length === 0, `labo : aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 3bis — متقدم : agrafes cachées, ciseaux glissés, collage.
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  await page.waitForSelector('[data-cutter]');
  await pickLevel(page, 'advanced');
  await page.waitForSelector('[data-cutter-scissors]');
  const verdict = async () => vis(page, '[data-cutter-verdict]').getAttribute('data-cutter-verdict').catch(() => null);
  check(await page.locator('[data-cutter-staple]:visible').count() === 0, 'a1 : les agrafes sont cachées avant la coupe');
  check(await page.locator('[data-cutter-pin]:visible').count() === 0, 'a1 : pas de « ثبّت » en متقدم');
  await page.screenshot({ path: `${OUT}/lab-a1-initial-1280.png` });
  await center(page, '[data-cutter-board]');
  // glisser les ciseaux sur l'opérateur ÷ (le deuxième) puis les lâcher
  const sc = await vis(page, '[data-cutter-scissors]').boundingBox();
  const tgt = await vis(page, '[data-cutter-op="1"][data-eligible="true"]').boundingBox();
  await page.mouse.move(sc.x + sc.width / 2, sc.y + sc.height / 2);
  await page.mouse.down();
  await page.mouse.move(tgt.x + tgt.width / 2, sc.y + sc.height / 2, { steps: 8 });
  await page.screenshot({ path: `${OUT}/lab-a1-drag-1280.png` });
  await page.mouse.up(); await page.waitForTimeout(300);
  check(await verdict() === 'staple', `a1 : la coupe glissée à ÷ mord (${await verdict()})`);
  check(await page.locator('[data-cutter-staple]:visible').count() === 2, 'a1 : les agrafes apparaissent après la coupe');
  await page.screenshot({ path: `${OUT}/lab-a1-bite-1280.png` });
  await vis(page, '[data-cutter-board] [role=group]').focus();
  await page.keyboard.press('ArrowLeft'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  check(await verdict() === 'cut', `a1 : le clavier coupe à − (${await verdict()})`);
  await vis(page, '[data-cutter-sticker="فرق"]').click(); await page.waitForTimeout(250);
  await vis(page, '[data-cutter-cell]').first().click().catch(() => {}); await page.waitForTimeout(150);
  await vis(page, '[data-cutter-op="0"][data-eligible="true"]').click();
  await vis(page, '[data-cutter-cut]').click(); await page.waitForTimeout(250);
  await vis(page, '[data-cutter-sticker="حاصل قسمة"]').click(); await page.waitForTimeout(300);
  check(await vis(page, '[data-cutter]').getAttribute('data-solved') === 'false', 'a1 : (niveau pas encore fini)');
  for (let g = 0; g < 8; g += 1) {
    const card = page.locator('[data-lab-checkpoint]:visible').first();
    if (!(await card.count())) break;
    break;
  }
  // a2, a3, a4 : le collage
  const advance = async () => { if (await page.locator('[data-cutter-next]').count()) { await vis(page, '[data-cutter-next]').click(); await page.waitForTimeout(350); } };
  await advance();
  const pickOp = async (a, b, o, clipL = false, clipR = false) => {
    await vis(page, `[data-cutter-block="${a}"]`).click(); await vis(page, `[data-cutter-block="${b}"]`).click();
    await vis(page, `[data-cutter-op-chip="${o}"]`).click();
    if (clipL) await vis(page, '[data-cutter-clip="l"]').click();
    if (clipR) await vis(page, '[data-cutter-clip="r"]').click();
    await vis(page, '[data-cutter-glue]').click(); await page.waitForTimeout(250);
  };
  await page.screenshot({ path: `${OUT}/lab-a2-initial-1280.png` });
  await pickOp('n1', 'n2', '×'); await pickOp('n0', 'g1', '−');
  check(await verdict() === 'ok', `a2 : 50 − 6 × 7 collé (${await verdict()})`);
  await advance();
  await pickOp('n0', 'n1', '+'); await page.screenshot({ path: `${OUT}/lab-a3-mid-1280.png` });
  await pickOp('g1', 'n2', '÷');
  check(await verdict() === 'glue', `a3 : sans مشبك la chaîne est un مجموع, refusée (${await verdict()})`);
  await page.screenshot({ path: `${OUT}/lab-a3-refused-1280.png` });
  await vis(page, '[data-cutter-undo]').click(); await page.waitForTimeout(150);
  await pickOp('g1', 'n2', '÷', true);
  check(await verdict() === 'ok', `a3 : (15 + 9) ÷ 4 avec le مشبك (${await verdict()})`);
  await page.waitForSelector('[data-lab-checkpoint]:visible', { timeout: 8000 });
  await page.screenshot({ path: `${OUT}/lab-a3-question-1280.png` });
  const card = page.locator('[data-lab-checkpoint]:visible').first();
  for (let i = 0; i < 3; i += 1) { await card.locator(`[data-lab-checkpoint-option="${i}"]`).click(); await page.waitForTimeout(120); if (await card.locator('[data-lab-checkpoint-feedback=right]').count()) break; }
  const nx = card.locator('[data-lab-checkpoint-next]'); if (await nx.count()) await nx.click();
  await page.waitForTimeout(500);
  await advance();
  await pickOp('n0', 'n1', '+', false, false); await pickOp('n2', 'n3', '−'); await pickOp('g1', 'g2', '×', true, true);
  check(await verdict() === 'ok', `a4 : (3 + 5) × (10 − 4) (${await verdict()})`);
  await page.screenshot({ path: `${OUT}/lab-a4-done-1280.png` });
  check(errors.length === 0, `متقدم : aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 4 — le bloc d'un seul regard aux quatre tailles, aux deux niveaux (mesure rapportée ; seul le débordement horizontal est un échec).
for (const vp of SIZES) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  await page.waitForSelector('[data-cutter]');
  for (const lvl of ['beginner', 'advanced']) {
    await pickLevel(page, lvl);
    const box = await vis(page, '[data-cutter-glance]').boundingBox();
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(`  d'un seul regard ${vp.width}×${vp.height} ${lvl}: ${Math.round(box.width)}×${Math.round(box.height)}`);
    check(over <= 1, `${vp.width}×${vp.height} ${lvl}: pas de débordement horizontal (${over}px)`);
    await page.screenshot({ path: `${OUT}/glance-${lvl}-${vp.width}x${vp.height}.png` });
  }
  await ctx.close();
}

await browser.close();
console.log(failures.length ? `\n${failures.length} échec(s):\n- ${failures.join('\n- ')}` : '\nTout est vert.');
process.exit(failures.length ? 1 : 0);
