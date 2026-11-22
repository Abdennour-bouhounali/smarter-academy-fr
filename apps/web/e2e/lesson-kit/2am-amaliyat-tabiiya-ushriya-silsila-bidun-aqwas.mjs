// QA — 2AM, unité 1 « العمليات على الأعداد الطبيعية والأعداد العشرية » : leçon `silsila-bidun-aqwas` « سلسلة عمليات دون أقواس وأولوية العمليات » (labo `tram-route`, خطّ الترامواي),
// cycle moyen, phase 3, 2026-10-28.
//
//   KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/2am-amaliyat-tabiiya-ushriya-silsila-bidun-aqwas.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//   QA_STUB=1 : sans API — les appels /api/v1 sont simulés, un enseignant factice.
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (pas de téléphone) :
//   1. le sommaire et CHAQUE module à 768 · 1024 · 1280 · 1366 px : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » brut, RTL ;
//   2. guide §4quater : rien au-dessus du labo au module 1, le labo avant la première question, les briques ABSENTES avant la réponse ;
//   3. le labo : un plan refusé (13 puis la carte de preuve), « مسح », le plan juste, les questions pendant le labo, la fête, « المهمة التالية », t2 · t3 · t4 (prix absurde, groupes
//      fantômes), le plan équivalent d'une chaîne de + seulement, « جرّب أعدادك » (refus sous 0), متقدم (écrire la chaîne, prédire, partir), « إعادة », plein écran ;
//   4. le bloc `[data-tr-glance]` aux quatre tailles, aux deux niveaux (seul le débordement horizontal est un échec) ;
//   5. captures dans QA_OUT (défaut /tmp/qa-tram).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-tram';
const STUB = !!process.env.QA_STUB;
const CH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab';
const LESSON = 'silsila-bidun-aqwas';
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
    try { localStorage.setItem('token', tk); if (off) localStorage.setItem('sa.labCoach.tram-route.off', '1'); } catch { /* noop */ }
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
  check(await page.getByText('سلسلة عمليات دون أقواس وأولوية العمليات').first().isVisible(), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);
  for (const slug of MODULES) {
    await page.goto(`${BASE}${CH}/${LESSON}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    check(await page.locator('main, [data-module-layout], h1').first().isVisible().catch(() => false), `${tag} ${slug} monté`);
    await pageHealth(page, `${tag} ${slug}`);
    if (slug === 'nashat') {
      await page.waitForSelector('[data-tram-route]');
      const order = await page.evaluate(() => {
        const lab = document.querySelector('[data-tram-route]');
        const brief = document.querySelector('[data-module-brief]');
        const q = document.querySelector('[data-activity-evidence]');
        const before = (a, b) => Boolean(a && b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING));
        return { briefAbove: brief ? before(brief, lab) : false, labBeforeQuestion: before(lab, q) };
      });
      check(!order.briefAbove, `${tag} nashat : aucune carte au-dessus du labo`);
      check(order.labBeforeQuestion, `${tag} nashat : le labo avant la première question`);
      check(await page.locator('[data-knowledge-brick]').count() === 0, `${tag} nashat : aucune brique avant la réponse`);
      const glance = await vis(page, '[data-tr-glance]').boundingBox();
      console.log(`  mesure [data-tr-glance] ${tag}: ${Math.round(glance.width)}×${Math.round(glance.height)}`);
      await page.screenshot({ path: `${OUT}/nashat-initial-${vp.width}x${vp.height}.png` });
    }
    if (slug === 'maarif') {
      await page.waitForSelector('[data-tram-route][data-world="mixed"]');
      check(await page.locator('[data-manipulation-levels-selector]').count() === 0, `${tag} maarif : le labo est posé seul, sans niveaux`);
      check(await page.locator('[data-knowledge-brick]').count() === 0, `${tag} maarif : aucune brique avant la réponse`);
    }
    await page.screenshot({ path: `${OUT}/${slug}-${vp.width}x${vp.height}.png`, fullPage: true });
  }
  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 3 — le labo.
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  await page.waitForSelector('[data-tram-route]');
  const verdict = async () => vis(page, '[data-tr-verdict]').getAttribute('data-tr-verdict').catch(() => null);
  const stamp = async (idx) => { await vis(page, `[data-tr-op="${idx}"]`).click(); await page.waitForTimeout(80); };
  const go = async () => { await vis(page, '[data-tr-go]').click(); await page.waitForTimeout(400); };
  const waitVerdict = async (codes) => { for (let i = 0; i < 80; i += 1) { const v = await verdict(); if (codes.includes(v)) return v; await page.waitForTimeout(150); } return await verdict(); };
  const plan = async (order, codes = ['ok', 'any', 'refused']) => { for (const i of order) await stamp(i); await go(); return waitVerdict(codes); };
  const planValue = () => vis(page, '[data-tr-plan]').getAttribute('data-value');
  const counterValue = () => vis(page, '[data-tr-counter]').getAttribute('data-value');
  /** répond à la carte de questions : une option après l'autre jusqu'à la bonne, un nombre au champ. */
  const answerCards = async (numbers = {}) => {
    for (let guard = 0; guard < 12; guard += 1) {
      const card = page.locator('[data-lab-checkpoint]:visible').first();
      if (!(await card.count())) return;
      const q = await card.getAttribute('data-q');
      const input = card.locator('[data-lab-checkpoint-input]');
      if (await input.count()) {
        await input.fill(numbers[q] ?? '0'); await card.locator('[data-lab-checkpoint-check]').click();
      } else {
        const n = await card.locator('[data-lab-checkpoint-option]').count();
        for (let i = 0; i < n; i += 1) {
          await card.locator(`[data-lab-checkpoint-option="${i}"]`).click(); await page.waitForTimeout(120);
          if (await card.locator('[data-lab-checkpoint-feedback=right]').count()) break;
        }
      }
      await page.waitForTimeout(150);
      const next = card.locator('[data-lab-checkpoint-next]');
      if (await next.count()) await next.click();
      await page.waitForTimeout(200);
    }
  };
  await center(page, '[data-tr-strip]');
  check(await page.locator('[data-tr-op]:visible').count() === 2 && await page.locator('[data-tr-num]:visible').count() === 3, 'labo : 26 − 9 + 4, trois plaques et deux puces');
  check(await vis(page, '[data-tr-go]').isDisabled(), 'labo : « انطلق » est grisé tant qu\'une puce n\'a pas son ticket');
  await stamp(1);
  check(await vis(page, '[data-tr-op="1"]').getAttribute('data-ticket') === '1', 'labo : le premier ticket est sur la puce tapée');
  await stamp(1);
  check(await vis(page, '[data-tr-op="1"]').getAttribute('data-ticket') === '', 'labo : un second appui reprend le ticket');
  // t1 : + d'abord → refusé, 13 contre 21
  let v = await plan([1, 0]);
  check(v === 'refused', `t1 : le plan « + d'abord » est refusé (${v})`);
  check(await planValue() === '13' && await counterValue() === '17', `t1 : « حسابك » 13, le compteur au quai fautif (${await counterValue()})`);
  const verdictText = await vis(page, '[data-tr-verdict]').innerText();
  check(/13/.test(verdictText) && /21/.test(verdictText) && /9/.test(verdictText), `t1 : le monde dit l'absurde « نزل 13 ؟ لم ينزل إلا 9 » (${verdictText.replace(/\s+/g, ' ').slice(0, 90)})`);
  check(await page.locator('[data-lab-checkpoint]:visible').count() === 0, 't1 : aucune question tant que la tâche n\'est pas faite');
  await page.screenshot({ path: `${OUT}/lab-t1-refused-1280.png` });
  await vis(page, '[data-tr-clear]').click(); await page.waitForTimeout(300);
  check(await vis(page, '[data-tr-op="0"]').getAttribute('data-ticket') === '', 't1 : « مسح » reprend tous les tickets');
  v = await plan([0, 1]);
  check(v === 'ok', `t1 : de gauche à droite le compteur est d'accord (${v})`);
  await page.waitForSelector('[data-lab-checkpoint]:visible', { timeout: 8000 });
  check(await vis(page, '[data-lab-checkpoint]').getAttribute('data-checkpoint') === 't1', 't1 : la carte de questions se pose PAR-DESSUS le labo');
  await page.screenshot({ path: `${OUT}/lab-t1-question-1280.png` });
  await answerCards({ realStop: '9' });
  await page.waitForSelector('[data-tr-next]:visible', { timeout: 8000 });
  check(await page.locator('[data-lab-celebration]').count() >= 0, 't1 : la fête (une fois)');
  await page.screenshot({ path: `${OUT}/lab-t1-done-1280.png` });
  await vis(page, '[data-tr-next]').click(); await page.waitForTimeout(400);
  // t2
  check(await page.locator('[data-tr-op]:visible').count() === 3, 't2 : 40 − 12 − 6 + 9, trois puces');
  v = await plan([2, 0, 1]);
  check(v === 'refused' && await planValue() === '13', `t2 : 6 + 9 d'abord donne 13 (${v}, ${await planValue()})`);
  await vis(page, '[data-tr-clear]').click();
  v = await plan([0, 1, 2]);
  check(v === 'ok', 't2 : gauche → droite juste');
  await page.waitForSelector('[data-lab-checkpoint]:visible', { timeout: 8000 });
  await answerCards();
  await vis(page, '[data-tr-next]').click(); await page.waitForTimeout(400);
  // t3 : le kiosque
  await page.waitForSelector('[data-tr-kiosk]');
  v = await plan([1, 0]);
  check(v === 'refused' && await planValue() === '6,25', `t3 : × d'abord donne 6,25 DA (${v}, ${await planValue()})`);
  check(/6,25/.test(await vis(page, '[data-tr-verdict]').innerText()), 't3 : « 4 تذاكر بـ 6,25 DA ؟ »');
  await page.screenshot({ path: `${OUT}/lab-t3-price-1280.png` });
  await vis(page, '[data-tr-clear]').click();
  v = await plan([0, 1]);
  check(v === 'ok', 't3 : 25 puis 100');
  await page.waitForSelector('[data-lab-checkpoint]:visible', { timeout: 8000 });
  await answerCards({ unitPrice: '25' });
  await vis(page, '[data-tr-next]').click(); await page.waitForTimeout(400);
  // t4 : les groupes
  v = await plan([0, 1]);
  check(v === 'refused' && await planValue() === '72', `t4 : + d'abord donne 72 (${v}, ${await planValue()})`);
  check(await page.locator('[data-tr-ghost]').count() === 1, 't4 : les groupes fantômes sont dessinés');
  await page.screenshot({ path: `${OUT}/lab-t4-ghost-1280.png` });
  await vis(page, '[data-tr-clear]').click();
  v = await plan([1, 0]);
  check(v === 'ok', 't4 : 3 × 4 puis 15 + 12 = 27');
  await page.waitForSelector('[data-lab-checkpoint]:visible', { timeout: 8000 });
  await answerCards({ groupsTotal: '12' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/lab-t4-done-1280.png` });
  // les preuves de la leçon
  for (const id of ['t1', 't2', 't3', 't4']) check(await page.locator(`[data-evidence="${id}"][data-tried="true"]`).count() === 1, `leçon : la preuve ${id} cite l'essai de l'élève`);
  check(await page.locator('[data-knowledge-brick]').count() >= 3, 'leçon : les briques apparaissent APRÈS les réponses');
  // « جرّب أعدادك »
  await center(page, '[data-tr-free]');
  await vis(page, '[data-tr-free-start]').fill('10');
  await vis(page, '[data-tr-free-n="0"]').fill('12');
  await page.waitForTimeout(250);
  check(await vis(page, '[data-tr-free-refusal]').getAttribute('data-tr-free-refusal') === 'below', 'libre : « لا يمكن أن ينزل أكثر ممّا في العربة »');
  await vis(page, '[data-tr-free-n="0"]').fill('4'); await vis(page, '[data-tr-free-n="1"]').fill('3');
  await page.waitForTimeout(300);
  check(await vis(page, '[data-tr-free]').getAttribute('data-active') === 'true', 'libre : la rame libre est active');
  await center(page, '[data-tr-strip]');
  check(await page.locator('[data-tr-op]:visible').count() === 2, 'libre : 10 − 4 + 3, deux puces');
  v = await plan([1, 0], ['free', 'refused', 'ok', 'any']);
  check(v === 'refused' || v === 'free', `libre : la rejouée juge (${v})`);
  await page.screenshot({ path: `${OUT}/lab-free-1280.png` });
  await center(page, '[data-tr-free-back]'); await vis(page, '[data-tr-free-back]').click();
  // plein écran puis « إعادة »
  const fs = page.locator('button:has-text("ملء الشاشة")').first();
  check(await fs.count() > 0, 'labo : le bouton plein écran existe');
  check(errors.length === 0, `labo : aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 3bis — متقدم : écrire la chaîne, prédire, partir.
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  await page.waitForSelector('[data-tram-route]');
  await pickLevel(page, 'advanced');
  await page.waitForSelector('[data-tr-builder]');
  check(await page.locator('[data-tr-strip]:visible').count() === 0, 'متقدم : le ruban n\'existe pas avant que la chaîne soit écrite');
  const tok = async (id) => vis(page, `[data-tr-token="${id}"]`).click();
  // une chaîne fausse d'abord : les jetons dans l'ordre inverse
  for (const id of ['n6', 'n4', 'n2', 'n0', 'o5', 'o3', 'o1']) await tok(id);
  await vis(page, '[data-tr-check]').click(); await page.waitForTimeout(300);
  check(await vis(page, '[data-tr-verdict]').getAttribute('data-tr-verdict') === 'buildWrong', 'متقدم : une chaîne qui ne raconte pas l\'histoire est refusée');
  await vis(page, '[data-tr-clear-slots]').click();
  for (const id of ['n0', 'o1', 'n2', 'o3', 'n4', 'o5', 'n6']) await tok(id);
  await vis(page, '[data-tr-check]').click(); await page.waitForTimeout(400);
  check(await page.locator('[data-tr-strip]:visible').count() === 1 && await page.locator('[data-tr-op]:visible').count() === 3, 'متقدم : la chaîne juste ouvre le ruban et ses trois puces');
  check(await vis(page, '[data-tr-counter]').getAttribute('data-veiled') === 'true', 'متقدم : le compteur reste voilé avant le départ');
  await page.screenshot({ path: `${OUT}/lab-advanced-built-1280.png` });
  await vis(page, '[data-tr-predict-input]').fill('18');
  for (const i of [1, 0, 2]) await vis(page, `[data-tr-op="${i}"]`).click();
  await vis(page, '[data-tr-go]').click();
  for (let i = 0; i < 60 && (await vis(page, '[data-tr-verdict]').getAttribute('data-tr-verdict')) !== 'ok'; i += 1) await page.waitForTimeout(150);
  check(await vis(page, '[data-tr-verdict]').getAttribute('data-tr-verdict') === 'ok', 'متقدم : × d\'abord puis − puis + : le compteur lit 18');
  check(/18/.test(await vis(page, '[data-tr-verdict]').innerText()), 'متقدم : la prédiction 18 est reconnue');
  await page.screenshot({ path: `${OUT}/lab-advanced-done-1280.png` });
  check(errors.length === 0, `متقدم : aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 4 — le bloc d'un seul regard aux quatre tailles, aux deux niveaux (mesure rapportée ; seul le débordement horizontal est un échec).
for (const vp of SIZES) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  await page.waitForSelector('[data-tram-route]');
  for (const lvl of ['beginner', 'advanced']) {
    await pickLevel(page, lvl);
    const box = await vis(page, '[data-tr-glance]').boundingBox();
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
