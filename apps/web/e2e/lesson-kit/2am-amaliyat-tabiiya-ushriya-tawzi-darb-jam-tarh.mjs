// QA — 2AM, unité 1 « العمليات على الأعداد الطبيعية والأعداد العشرية » : leçon `tawzi-darb-jam-tarh` « توزيع الضرب على الجمع والطرح » (labo `kit-packer`, thème `solidarity`),
// cycle moyen, phase 3, 2026-10-29.
//
//   KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/2am-amaliyat-tabiiya-ushriya-tawzi-darb-jam-tarh.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)  QA_STUB=1 : sans API.
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (pas de téléphone) :
//   1. le sommaire et CHAQUE module à 768 · 1024 · 1280 · 1366 px : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » brut, RTL ;
//   2. guide §4quater : rien au-dessus du labo au module 1, le labo avant la première question, les briques ABSENTES avant la réponse ;
//   3. le labo : k1 (3 cahiers refusés « حقائب بلا … », puis 18 et 12 : les deux compteurs 30 = 30, la modale de questions), k2, k3 (2 abîmés refusés, puis 14), k4 (k = 10 refusé, k = 12),
//      « جرّب أعدادك », متقدم (prédiction, a1 = 50 − 2, a2 rubans en mètres, a3 la commande « 6 × 4 + 3 » refusée puis corrigée), plein écran, son ;
//   4. le bloc `[data-kit-glance]` aux quatre tailles, aux deux niveaux, y compris la phase de prédiction (seul le débordement horizontal est un échec ; la hauteur est rapportée) ;
//   5. captures dans QA_OUT (défaut /tmp/qa-tawzi-darb-jam-tarh).

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-tawzi-darb-jam-tarh';
const STUB = !!process.env.QA_STUB;
const CH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab';
const LESSON = 'tawzi-darb-jam-tarh';
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
    try { localStorage.setItem('token', tk); if (off) localStorage.setItem('sa.labCoach.kit-packer.off', '1'); } catch { /* noop */ }
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


const MODULES_ = MODULES;

// 1 + 2 — sommaire, modules ; rien au-dessus du labo ; briques absentes avant la réponse.
for (const vp of SIZES) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${LESSON} ${vp.width}×${vp.height}`;
  await page.goto(`${BASE}${CH}/${LESSON}`, { waitUntil: 'networkidle' });
  check(await page.getByText('توزيع الضرب على الجمع والطرح').first().isVisible(), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);
  for (const slug of MODULES_) {
    await page.goto(`${BASE}${CH}/${LESSON}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    check(await page.locator('main, [data-module-layout], h1').first().isVisible().catch(() => false), `${tag} ${slug} monté`);
    await pageHealth(page, `${tag} ${slug}`);
    if (slug === 'nashat') {
      await page.waitForSelector('[data-kit]');
      const order = await page.evaluate(() => {
        const lab = document.querySelector('[data-kit]');
        const brief = document.querySelector('[data-module-brief]');
        const q = document.querySelector('[data-activity-evidence]');
        const before = (a, b) => Boolean(a && b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING));
        return { briefAbove: brief ? before(brief, lab) : false, labBeforeQuestion: before(lab, q) };
      });
      check(!order.briefAbove, `${tag} nashat : aucune carte au-dessus du labo`);
      check(order.labBeforeQuestion, `${tag} nashat : le labo avant la première question`);
      check(await page.locator('[data-knowledge-brick]').count() === 0, `${tag} nashat : aucune brique avant la réponse`);
      const glance = await vis(page, '[data-kit-glance]').boundingBox();
      console.log(`  mesure [data-kit-glance] ${tag}: ${Math.round(glance.width)}×${Math.round(glance.height)}`);
      await page.screenshot({ path: `${OUT}/nashat-initial-${vp.width}x${vp.height}.png` });
    }
    if (slug === 'maarif') {
      await page.waitForSelector('[data-kit]');
      check(await page.locator('[data-manipulation-levels-selector]').count() === 0, `${tag} maarif : le labo est posé seul, sans niveaux`);
      check(await page.locator('[data-knowledge-brick]').count() === 0, `${tag} maarif : aucune brique avant la réponse`);
    }
    await page.screenshot({ path: `${OUT}/${slug}-${vp.width}x${vp.height}.png`, fullPage: true });
  }
  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

const kitHelpers = (page) => {
  const verdict = async () => vis(page, '[data-kit-verdict]').getAttribute('data-kit-verdict').catch(() => null);
  const vtext = () => vis(page, '[data-kit-verdict]').innerText();
  const setDial = async (id, v, step = 1) => {
    const d = vis(page, `[data-kit-dial="${id}"]`); await d.focus();
    const cur = +(await d.getAttribute('aria-valuenow'));
    let diff = Math.round((v - cur) / step);
    while (diff >= 10) { await page.keyboard.press('PageUp'); diff -= 10; }
    while (diff > 0) { await page.keyboard.press('ArrowUp'); diff -= 1; }
    while (diff <= -10) { await page.keyboard.press('PageDown'); diff += 10; }
    while (diff < 0) { await page.keyboard.press('ArrowDown'); diff += 1; }
  };
  const deal = async () => { await vis(page, '[data-kit-deal]').click(); await page.waitForFunction(() => { const b = [...document.querySelectorAll('[data-kit-belt]')].find((x) => x.offsetParent !== null); return b && b.getAttribute('data-running') === 'false'; }, null, { timeout: 8000 }); await page.waitForTimeout(250); };
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
  const next = async () => { await vis(page, '[data-kit-next]').click(); await page.waitForTimeout(350); };
  /** capture l'état « prêt » : la modale de questions est écartée (« انظر إلى المختبر ») puis rappelée. */
  const lookShot = async (path) => {
    const look = page.locator('[data-lab-checkpoint-look]:visible').first();
    if (await look.count()) { await look.click(); await page.waitForTimeout(400); }
    await page.screenshot({ path });
    const back = page.locator('[data-lab-checkpoint-back]:visible').first();
    if (await back.count()) { await back.click(); await page.waitForTimeout(300); }
  };
  return { verdict, vtext, setDial, deal, answerCards, next, lookShot };
};

// 3 — le labo (مبتدئ).
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  await page.waitForSelector('[data-kit]');
  const { verdict, vtext, setDial, deal, answerCards, next, lookShot } = kitHelpers(page);
  await center(page, '[data-kit-belt]');
  check(await page.locator('[data-kit-bag]:visible').count() === 6, 'k1 : six cartables');
  check(await page.locator('[data-kit-dial]:visible').count() === 2, 'k1 : deux distributeurs à cadran');
  check(await page.locator('[data-kit-deal]:visible').first().isDisabled(), 'k1 : « وزّع » attend un réglage');
  await page.screenshot({ path: `${OUT}/lab-k1-initial-1280.png` });
  await setDial('n', 3); await setDial('m', 12); await deal();
  check(await verdict() === 'unequal', `k1 : 3 cahiers pour 6 cartables sont refusés (${await verdict()})`);
  check(/3 حقائب بلا/.test(await vtext()), `k1 : « 3 حقائب بلا … » (${await vtext()})`);
  check(await page.locator('[data-kit-bag][data-state="short"]:visible').count() === 6, 'k1 : les six cartables sont marqués incomplets');
  await page.screenshot({ path: `${OUT}/lab-k1-short-1280.png` });
  await setDial('n', 20); await setDial('m', 10); await deal();
  check(await vis(page, '[data-kit-counter="fatima"]').getAttribute('data-lit') === 'false', 'k1 : 20 + 10 = 30 mais les cartables sont faux : les compteurs ne s\'allument pas');
  await page.screenshot({ path: `${OUT}/lab-k1-30-not-enough-1280.png` });
  await setDial('n', 18); await setDial('m', 12); await deal();
  check(await verdict() === 'ok', `k1 : 18 et 12 remplissent les cartables (${await verdict()})`);
  check(await page.locator('[data-kit-bag][data-state="ready"]:visible').count() === 6, 'k1 : six cartables prêts');
  check(await vis(page, '[data-kit-counter="fatima"]').getAttribute('data-lit') === 'true' && await vis(page, '[data-kit-counter="ali"]').getAttribute('data-lit') === 'true', 'k1 : les deux compteurs s\'allument ensemble');
  await lookShot(`${OUT}/lab-k1-ready-1280.png`);
  await page.waitForSelector('[data-lab-checkpoint]:visible', { timeout: 8000 });
  check(await vis(page, '[data-lab-checkpoint]').getAttribute('data-checkpoint') === 'k1', 'k1 : la carte de questions se pose PAR-DESSUS le labo');
  await page.screenshot({ path: `${OUT}/lab-k1-question-1280.png` });
  await answerCards(); await page.waitForTimeout(2800);
  await next();
  // k2
  await setDial('n', 32); await setDial('m', 40); await deal();
  check(await verdict() === 'ok', `k2 : 8 × (4 + 5) (${await verdict()})`);
  await lookShot(`${OUT}/lab-k2-ready-1280.png`);
  await page.waitForSelector('[data-lab-checkpoint]:visible', { timeout: 8000 }); await answerCards(); await page.waitForTimeout(2800);
  await next();
  // k3 : les abîmés
  check(/التالف/.test(await vis(page, '[data-kit-dispensers]').innerText()), 'k3 : le second distributeur est la benne des abîmés');
  await setDial('n', 70); await setDial('m', 2); await deal();
  check(await verdict() === 'unequal', `k3 : 2 abîmés seulement : cartables inégaux (${await verdict()})`);
  await page.screenshot({ path: `${OUT}/lab-k3-unequal-1280.png` });
  await setDial('m', 14); await deal();
  check(await verdict() === 'ok', `k3 : 70 − 14 = 56 (${await verdict()})`);
  await lookShot(`${OUT}/lab-k3-ready-1280.png`);
  await page.waitForSelector('[data-lab-checkpoint]:visible', { timeout: 8000 }); await answerCards(); await page.waitForTimeout(2800);
  await next();
  // k4 : distributeurs verrouillés
  check(await page.locator('[data-kit-dial][data-locked="true"]:visible').count() === 2, 'k4 : les deux distributeurs sont verrouillés');
  check(await page.locator('[data-kit-dial-plus="n"]:visible').first().isDisabled(), 'k4 : un distributeur verrouillé ne s\'ajuste pas');
  await page.screenshot({ path: `${OUT}/lab-k4-initial-1280.png` });
  await setDial('k', 10); await deal();
  check(await verdict() === 'unequal' || await verdict() === 'extra', `k4 : 10 cartables : refusé (${await verdict()})`);
  await page.screenshot({ path: `${OUT}/lab-k4-wrong-k-1280.png` });
  await setDial('k', 12); await deal();
  check(await verdict() === 'ok', `k4 : 12 cartables (${await verdict()})`);
  check(await page.locator('[data-kit-bag]:visible').count() === 12, 'k4 : douze cartables dessinés');
  await lookShot(`${OUT}/lab-k4-ready-1280.png`);
  await page.waitForSelector('[data-lab-checkpoint]:visible', { timeout: 8000 }); await answerCards(); await page.waitForTimeout(800);
  check(await vis(page, '[data-kit]').getAttribute('data-solved') === 'true', 'labo : toutes les tâches du niveau sont faites');
  // « جرّب أعدادك »
  await center(page, '[data-kit-free]');
  await vis(page, '[data-kit-free-show]').click(); await page.waitForTimeout(200);
  check(/5 × \(6 \+ 4\)/.test(await vis(page, '[data-kit-free-kit]').innerText()), 'libre : 5 × (6 + 4)');
  check(/= 50/.test(await vis(page, '[data-kit-free-split]').innerText()), 'libre : 30 + 20 = 50');
  await vis(page, '[data-kit-free-op]').click(); await vis(page, '[data-kit-free-show]').click(); await page.waitForTimeout(150);
  check(/5 × \(6 − 4\)/.test(await vis(page, '[data-kit-free-kit]').innerText()), 'libre : 5 × (6 − 4) = 10');
  for (let i = 0; i < 7; i += 1) await vis(page, '[data-kit-free-plus="k"]').click();
  check(await vis(page, '[data-kit-free-plus="k"]').isDisabled(), 'libre : le nombre de cartables s\'arrête à 12');
  await page.screenshot({ path: `${OUT}/lab-free-1280.png` });
  check(await page.locator('button:has-text("ملء الشاشة")').count() > 0, 'labo : le bouton plein écran existe');
  check(await page.locator('[data-manipulation-sound]').count() > 0, 'labo : l\'interrupteur « الصوت » existe');
  check(errors.length === 0, `labo : aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 3bis — متقدم : prédiction, 48 = 50 − 2, rubans, commande d'un camarade.
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  await page.waitForSelector('[data-kit]');
  await pickLevel(page, 'advanced');
  await page.waitForSelector('[data-kit-predict]');
  const { verdict, vtext, setDial, deal, answerCards, next, lookShot } = kitHelpers(page);
  check(await vis(page, '[data-kit-deal]').isDisabled(), 'a1 : « وزّع » attend la prédiction');
  await page.screenshot({ path: `${OUT}/lab-a1-initial-1280.png` });
  await vis(page, '[data-kit-predict-input]').fill('432'); await vis(page, '[data-kit-predict-lock]').click(); await page.waitForTimeout(250);
  check(await page.locator('[data-kit-predict]').count() === 0, 'a1 : la prédiction posée ouvre les distributeurs');
  await setDial('q', 3); await deal();
  check(await verdict() === 'split', `a1 : 50 − 3 ≠ 48 (${await verdict()})`);
  await page.screenshot({ path: `${OUT}/lab-a1-refused-1280.png` });
  await setDial('q', 2); await deal();
  check(await verdict() === 'ok' && /432/.test(await vtext()), `a1 : 9 × 50 − 9 × 2 = 432 (${await vtext()})`);
  await lookShot(`${OUT}/lab-a1-ready-1280.png`);
  await page.waitForSelector('[data-lab-checkpoint]:visible', { timeout: 8000 }); await answerCards(); await page.waitForTimeout(2800);
  await next();
  // a2 : rubans en mètres
  await vis(page, '[data-kit-predict-input]').fill('30'); await vis(page, '[data-kit-predict-lock]').click(); await page.waitForTimeout(250);
  await setDial('n', 18); await setDial('m', 12); await deal();
  check(await verdict() === 'ok', `a2 : 15 × (1,2 + 0,8) = 30 m (${await verdict()})`);
  check(await page.locator('[data-kit-bag]:visible').count() === 15, 'a2 : quinze cartables');
  await lookShot(`${OUT}/lab-a2-ready-1280.png`);
  await next();
  // a3 : la commande du camarade
  await vis(page, '[data-kit-predict-input]').fill('27'); await vis(page, '[data-kit-predict-lock]').click(); await page.waitForTimeout(250);
  check(await vis(page, '[data-kit-dial="n"]').getAttribute('aria-valuenow') === '24' && await vis(page, '[data-kit-dial="m"]').getAttribute('aria-valuenow') === '3', 'a3 : les distributeurs partent de la commande « 6 × 4 + 3 »');
  await deal();
  check(await verdict() === 'unequal' && /3 حقائب بلا/.test(await vtext()), `a3 : 3 stylos pour 6 cartables (${await vtext()})`);
  await page.screenshot({ path: `${OUT}/lab-a3-refused-1280.png` });
  await setDial('m', 18); await deal();
  check(await verdict() === 'ok' && /توقّعتَ \u2066?27/.test(await vtext()), `a3 : corrigé à 18, la prédiction est comparée (${await vtext()})`);
  await lookShot(`${OUT}/lab-a3-ready-1280.png`);
  await page.waitForSelector('[data-lab-checkpoint]:visible', { timeout: 8000 }); await answerCards(); await page.waitForTimeout(800);
  check(await vis(page, '[data-kit]').getAttribute('data-solved') === 'true', 'متقدم : toutes les tâches sont faites');
  check(errors.length === 0, `متقدم : aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 4 — le bloc d'un seul regard aux quatre tailles, aux deux niveaux (mesure rapportée ; seul le débordement horizontal est un échec).
for (const vp of SIZES) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  await page.waitForSelector('[data-kit]');
  for (const lvl of ['beginner', 'advanced']) {
    await pickLevel(page, lvl);
    const box = await vis(page, '[data-kit-glance]').boundingBox();
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(`  d'un seul regard ${vp.width}×${vp.height} ${lvl}${lvl === 'advanced' ? ' (phase de prédiction)' : ''}: ${Math.round(box.width)}×${Math.round(box.height)}`);
    check(over <= 1, `${vp.width}×${vp.height} ${lvl}: pas de débordement horizontal (${over}px)`);
    await page.screenshot({ path: `${OUT}/glance-${lvl}-${vp.width}x${vp.height}.png` });
  }
  await ctx.close();
}

await browser.close();
console.log(failures.length ? `\n${failures.length} échec(s):\n- ${failures.join('\n- ')}` : '\nTout est vert.');
process.exit(failures.length ? 1 : 0);
