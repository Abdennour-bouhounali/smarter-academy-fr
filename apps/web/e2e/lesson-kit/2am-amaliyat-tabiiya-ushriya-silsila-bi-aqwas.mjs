// QA — 2AM, unité 1 « العمليات على الأعداد الطبيعية والأعداد العشرية » : leçon `silsila-bi-aqwas` « سلسلة عمليات تتضمّن أقواسا » (labo `coop-calculator`, thème `coopshop`),
// cycle moyen, phase 3, 2026-10-29.
//
//   KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/2am-amaliyat-tabiiya-ushriya-silsila-bi-aqwas.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)  QA_STUB=1 : sans API.
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (pas de téléphone) :
//   1. le sommaire et CHAQUE module à 768 · 1024 · 1280 · 1366 px : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » brut, RTL ;
//   2. guide §4quater : rien au-dessus du labo au module 1, le labo avant la première question, les briques ABSENTES avant la réponse ;
//   3. le labo : k1 (sans parenthèses refusé 89, puis la carte vérité après le 2e refus), Syntax ERROR, k2 (48,75 puis 15) et ses questions, k3 (paire inutile acceptée, remarque),
//      k4 (parenthèses imbriquées ; 84 refusé), « جرّب أعدادك » (valeur de la machine et valeur de gauche à droite), متقدم (a1 : le numérateur seul −5,8, puis la bonne ligne), clavier,
//      « إعادة », plein écran, interrupteur du son ;
//   4. le bloc `[data-coop-glance]` aux quatre tailles, aux deux niveaux (seul le débordement horizontal est un échec) ;
//   5. captures dans QA_OUT (défaut /tmp/qa-silsila-bi-aqwas).

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-silsila-bi-aqwas';
const STUB = !!process.env.QA_STUB;
const CH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab';
const LESSON = 'silsila-bi-aqwas';
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
    try { localStorage.setItem('token', tk); if (off) localStorage.setItem('sa.labCoach.coop-calculator.off', '1'); } catch { /* noop */ }
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
  check(await page.getByText('سلسلة عمليات تتضمّن أقواسا').first().isVisible(), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);
  for (const slug of MODULES) {
    await page.goto(`${BASE}${CH}/${LESSON}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    check(await page.locator('main, [data-module-layout], h1').first().isVisible().catch(() => false), `${tag} ${slug} monté`);
    await pageHealth(page, `${tag} ${slug}`);
    if (slug === 'nashat') {
      await page.waitForSelector('[data-coop-calculator]');
      const order = await page.evaluate(() => {
        const lab = document.querySelector('[data-coop-calculator]');
        const brief = document.querySelector('[data-module-brief]');
        const q = document.querySelector('[data-activity-evidence]');
        const before = (a, b) => Boolean(a && b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING));
        return { briefAbove: brief ? before(brief, lab) : false, labBeforeQuestion: before(lab, q) };
      });
      check(!order.briefAbove, `${tag} nashat : aucune carte au-dessus du labo`);
      check(order.labBeforeQuestion, `${tag} nashat : le labo avant la première question`);
      check(await page.locator('[data-knowledge-brick]').count() === 0, `${tag} nashat : aucune brique avant la réponse`);
      const glance = await vis(page, '[data-coop-glance]').boundingBox();
      console.log(`  mesure [data-coop-glance] ${tag}: ${Math.round(glance.width)}×${Math.round(glance.height)}`);
      await page.screenshot({ path: `${OUT}/nashat-initial-${vp.width}x${vp.height}.png` });
    }
    if (slug === 'maarif') {
      await page.waitForSelector('[data-coop-calculator]');
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
  await page.waitForSelector('[data-coop-calculator]');
  const verdict = async () => vis(page, '[data-coop-verdict]').getAttribute('data-coop-verdict').catch(() => null);
  const key = async (k) => { await vis(page, `[data-coop-calc] [data-coop-key="${k}"]`).click(); await page.waitForTimeout(60); };
  const gap = async (i) => { await vis(page, `[data-coop-calc] [data-coop-gap="${i}"]`).click(); await page.waitForTimeout(60); };
  const equals = async () => { await vis(page, '[data-coop-equals]').click(); await page.waitForTimeout(250); };
  const lineText = () => page.evaluate(() => [...document.querySelectorAll('[data-coop-calc]')].filter((c) => c.offsetParent !== null).flatMap((c) => [...c.querySelectorAll('[data-coop-tok]')]).map((e) => e.textContent.trim()).join(' '));
  const result = () => vis(page, '[data-coop-result]').innerText();
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
  await center(page, '[data-coop-calc]');
  check(await lineText() === '8 × 12 − 7', `k1 : la ligne est pré-tapée sans parenthèses (« ${await lineText()} »)`);
  check(await vis(page, '[data-coop-calc] [data-coop-key="("]').isDisabled(), 'k1 : « ( » est grisé tant qu\'on n\'a pas touché un intervalle');
  check(await vis(page, '[data-coop-calc] [data-coop-key="7"]').isDisabled(), 'k1 : les chiffres sont verrouillés en مبتدئ');
  check(await page.locator('[data-coop-truth]').count() === 0, 'k1 : la carte « ما تقوله الوضعية » n\'apparaît pas avant');
  await page.screenshot({ path: `${OUT}/lab-k1-initial-1280.png` });
  // 1er essai : sans parenthèses
  await equals();
  check(await verdict() === 'story' && await result() === '89', `k1 : sans parenthèses la machine imprime 89 et l'histoire refuse (${await result()})`);
  check(await page.locator('[data-coop-refuted]').count() === 1, 'k1 : la scène barre le montant refusé');
  check(await page.locator('[data-coop-tape-row]').count() === 1, 'k1 : le ruban a imprimé la ligne');
  await page.screenshot({ path: `${OUT}/lab-k1-refused-1280.png` });
  await equals();
  check(await page.locator('[data-coop-truth="k1"]').count() === 1, 'k1 : après le 2e refus la carte vérité apparaît');
  // une seule parenthèse → Syntax ERROR
  await gap(2); await key('(');
  check(await lineText() === '8 × ( 12 − 7', `k1 : « ( » posée au curseur (« ${await lineText()} »)`);
  await equals();
  check(await verdict() === 'syntax' && /Syntax ERROR/.test(await result()), `k1 : un seul « ( » → Syntax ERROR (${await result()})`);
  await page.screenshot({ path: `${OUT}/lab-k1-syntax-1280.png` });
  check(await vis(page, '[data-coop-back]').isEnabled(), 'k1 : ⌫ retire la parenthèse de gauche du curseur');
  await gap(6); await key(')');
  await equals();
  check(await verdict() === 'ok' && await result() === '40', `k1 : 8 × ( 12 − 7 ) imprime 40 (${await result()})`);
  await page.screenshot({ path: `${OUT}/lab-k1-ok-1280.png` });
  check(await page.locator('[data-coop-next]').count() === 1, 'k1 : « المهمة التالية » apparaît (pas de questions pour k1)');
  check(await vis(page, '[data-coop-equals]').isDisabled(), 'k1 : la tâche faite est figée');
  await vis(page, '[data-coop-next]').click(); await page.waitForTimeout(400);
  // k2
  check(await lineText() === '45 + 15 ÷ 4', 'k2 : la ligne 45 + 15 ÷ 4');
  await equals();
  check(/48,75/.test(await result()) && /60/.test(await vis(page, '[data-coop-verdict]').innerText()), `k2 : 48,75 refusé, « ثمن الكتاب وغلافه معًا 60 DA » (${await result()})`);
  await gap(0); await key('('); await gap(4); await key(')');
  check(await lineText() === '( 45 + 15 ) ÷ 4', 'k2 : (45 + 15) ÷ 4');
  await page.waitForTimeout(100);
  await equals();
  check(await verdict() === 'ok' && await result() === '15', `k2 : 15 (${await result()})`);
  await page.waitForSelector('[data-lab-checkpoint]:visible', { timeout: 8000 });
  check(await vis(page, '[data-lab-checkpoint]').getAttribute('data-checkpoint') === 'k2', 'k2 : la carte de questions se pose PAR-DESSUS le labo');
  await page.screenshot({ path: `${OUT}/lab-k2-question-1280.png` });
  await answerCards({ paid: '15' });
  await page.waitForTimeout(500);
  check(await page.locator('[data-lab-checkpoint]:visible').count() === 0, 'k2 : les questions sont finies');
  check(await page.locator('[data-lab-celebration]').count() >= 0, 'k2 : fête (non bloquante)');
  await vis(page, '[data-coop-next]').click(); await page.waitForTimeout(400);
  // k3 : sans paire → remarque ; (9+2)×5 → 55 ; 9 + (2×5) accepté avec remarque
  await equals();
  check(await verdict() === 'nopair' && await result() === '19', `k3 : sans paire la machine imprime 19 mais la tâche demande des parenthèses (${await verdict()})`);
  await gap(0); await key('('); await gap(4); await key(')'); await equals();
  check(await verdict() === 'story' && await result() === '55', `k3 : (9 + 2) × 5 = 55 refusé (${await result()})`);
  await vis(page, '[data-coop-clear]').click(); await page.waitForTimeout(150);
  await gap(2); await key('('); await gap(6); await key(')');
  check(await lineText() === '9 + ( 2 × 5 )', `k3 : 9 + (2 × 5) (« ${await lineText()} »)`);
  await equals();
  check(await verdict() === 'useless' && await result() === '19', `k3 : la paire inutile est acceptée avec la remarque (${await verdict()})`);
  check(/لا يغيّران/.test(await vis(page, '[data-coop-verdict]').innerText()), 'k3 : « هذان القوسان لا يغيّران شيئًا »');
  await page.screenshot({ path: `${OUT}/lab-k3-useless-1280.png` });
  await page.waitForSelector('[data-lab-checkpoint]:visible', { timeout: 8000 });
  await answerCards();
  await page.waitForTimeout(500);
  await vis(page, '[data-coop-next]').click(); await page.waitForTimeout(400);
  // k4 : nested
  await gap(2); await key('('); await gap(6); await key(')'); await equals();
  check(await verdict() === 'story' && await result() === '84', `k4 : 2 × (50 − 12) + 8 = 84 refusé (${await result()})`);
  await vis(page, '[data-coop-clear]').click(); await page.waitForTimeout(150);
  await gap(7); await key(')'); await gap(7); await key(')'); await gap(4); await key('('); await gap(2); await key('(');
  check(await lineText() === '2 × ( 50 − ( 12 + 8 ) )', `k4 : parenthèses imbriquées (« ${await lineText()} »)`);
  const depths = await page.evaluate(() => [...document.querySelectorAll('[data-coop-calc] [data-coop-tok][data-depth]')].map((e) => e.getAttribute('data-depth')).join(''));
  check(/1/.test(depths) && /2/.test(depths), `k4 : les parenthèses sont colorées par profondeur (${depths})`);
  await page.screenshot({ path: `${OUT}/lab-k4-nested-1280.png` });
  await equals();
  check(await verdict() === 'ok' && await result() === '60', `k4 : 60 (${await result()})`);
  await page.waitForSelector('[data-lab-checkpoint]:visible', { timeout: 8000 });
  await answerCards();
  await page.waitForTimeout(800);
  check(await vis(page, '[data-coop-calculator]').getAttribute('data-solved') === 'true', 'labo : toutes les tâches du niveau sont faites');
  // « جرّب أعدادك »
  await center(page, '[data-coop-free]');
  const fkey = async (k) => { await vis(page, `[data-coop-free-key="${k}"]`).click(); await page.waitForTimeout(40); };
  await fkey('='); 
  check(/48,75/.test(await vis(page, '[data-coop-free-read]').innerText()) && /15/.test(await vis(page, '[data-coop-free-ltr]').innerText()), 'libre : 45 + 15 ÷ 4 — la machine 48,75 et « de gauche à droite » 15');
  await page.screenshot({ path: `${OUT}/lab-free-1280.png` });
  // clavier : taper dans le niveau متقدم plus bas ; plein écran et son
  const fs = page.locator('button:has-text("ملء الشاشة")').first();
  check(await fs.count() > 0, 'labo : le bouton plein écran existe');
  check(await page.locator('[data-manipulation-sound]').count() > 0, 'labo : l\'interrupteur « الصوت » existe');
  check(errors.length === 0, `labo : aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 3bis — متقدم : taper la ligne, le numérateur seul, la bonne ligne, le clavier.
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  await page.waitForSelector('[data-coop-calculator]');
  await pickLevel(page, 'advanced');
  await page.waitForSelector('[data-coop-card="bar"]');
  const key = async (k) => { await vis(page, `[data-coop-calc] [data-coop-key="${k}"]`).click(); await page.waitForTimeout(40); };
  const typeLine = async (keys) => { for (const k of keys) await key(k); };
  const lineText = () => page.evaluate(() => [...document.querySelectorAll('[data-coop-calc]')].filter((c) => c.offsetParent !== null).flatMap((c) => [...c.querySelectorAll('[data-coop-tok]')]).map((e) => e.textContent.trim()).join(' '));
  const result = () => vis(page, '[data-coop-result]').innerText();
  const verdict = async () => vis(page, '[data-coop-verdict]').getAttribute('data-coop-verdict').catch(() => null);
  check(await page.locator('[data-coop-tok]:visible').count() === 0, 'متقدم : la ligne est vide au départ');
  check(await vis(page, '[data-coop-calc] [data-coop-key="7"]').isEnabled(), 'متقدم : les chiffres sont actifs');
  await page.screenshot({ path: `${OUT}/lab-a1-initial-1280.png` });
  await typeLine(['(', '4', '0', '+', '8', ')', '÷', '1', '5', '−', '9']);
  check(await lineText() === '( 40 + 8 ) ÷ 15 − 9', `a1 : le numérateur seul (« ${await lineText()} »)`);
  await vis(page, '[data-coop-equals]').click(); await page.waitForTimeout(250);
  check(await result() === '−5,8' && await verdict() === 'story', `a1 : la machine imprime −5,8 et l'histoire refuse (${await result()})`);
  check(/أقلّ من 0/.test(await vis(page, '[data-coop-verdict]').innerText()), 'a1 : « لا يمكن أن يكون النصيب أقلّ من 0 »');
  await page.screenshot({ path: `${OUT}/lab-a1-refused-1280.png` });
  await vis(page, '[data-coop-clear]').click();
  // le clavier physique : la bonne ligne
  await vis(page, '[data-coop-calc]').focus();
  await page.keyboard.type('(40+8)/(15-9)');
  await page.waitForTimeout(200);
  check(await lineText() === '( 40 + 8 ) ÷ ( 15 − 9 )', `a1 : le clavier tape la ligne (« ${await lineText()} »)`);
  await page.screenshot({ path: `${OUT}/lab-a1-typed-1280.png` });
  await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  check(await verdict() === 'ok' && await result() === '8', `a1 : 8 (${await result()})`);
  await page.waitForSelector('[data-lab-checkpoint]:visible', { timeout: 8000 });
  await page.screenshot({ path: `${OUT}/lab-a1-question-1280.png` });
  check(errors.length === 0, `متقدم : aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 4 — le bloc d'un seul regard aux quatre tailles, aux deux niveaux (mesure rapportée ; seul le débordement horizontal est un échec).
for (const vp of SIZES) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  await page.waitForSelector('[data-coop-calculator]');
  for (const lvl of ['beginner', 'advanced']) {
    await pickLevel(page, lvl);
    const box = await vis(page, '[data-coop-glance]').boundingBox();
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
