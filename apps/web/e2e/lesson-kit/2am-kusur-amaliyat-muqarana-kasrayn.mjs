// QA — 2AM, unité 2 « الكسور والعمليات عليها », 5e leçon `muqarana-kasrayn` « مقارنة كسرين » et son labo `level-laser` « ليزر المستوى » (cycle moyen phase 3, 2026-10-29).
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/2am-kusur-amaliyat-muqarana-kasrayn.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, à 768×1024, 1024×768, 1280×800 et 1366×768 (tablette et laptop seulement) :
//   1. le sommaire et CHAQUE module : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » / « \command » / clé `manipulation.` brute ;
//   2. le labo مبتدئ : un mauvais choix est refusé et le laser saute au niveau revendiqué ; les quatre tâches l1…l4 se jouent (laser, choix, écriture 9/12, trait « 1 ») et la carte de questions s'ouvre PAR-DESSUS le labo ;
//   3. le labo متقدم : tubes voilés et laser verrouillé tant que la prédiction n'est pas faite ; une prédiction fausse lève les voiles ; a1…a4 (dont l'ordre de trois réservoirs et les décimaux) ;
//   4. D'UN SEUL REGARD : `[data-ll-glance]` tient dans la largeur et dans la hauteur de l'écran, aux DEUX niveaux et dans la pire phase ;
//   5. « جرّب أعدادك » : 2/3 et 3/5 (cas de 3AM) ouvre une tâche libre SANS verdict.
// Captures dans /tmp/qa-2am-muqarana-kasrayn (ou QA_OUT).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-2am-muqarana-kasrayn';
const CH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/muqarana-kasrayn`;
const MODULES = ['astaidd', 'nashat', 'maarif', 'tariqa', 'atamarran', 'masala-1', 'masala-2', 'masala-3', 'itqan'];
const SIZES = [{ width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1280, height: 800 }, { width: 1366, height: 768 }];
mkdirSync(OUT, { recursive: true });

const failures = [];
const check = (ok, label) => { if (!ok) failures.push(label); console.log(`${ok ? '✓' : '✗'} ${label}`); };

async function loginToken(who) {
  if (process.env.QA_TOKEN) return process.env.QA_TOKEN;
  const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(who) });
  const data = await res.json().catch(() => ({}));
  const token = data.token ?? data.access_token ?? data.data?.token;
  if (!token) throw new Error(`login ${who.email}: ${res.status}`);
  return token;
}
async function contextFor(browser, token, viewport) {
  const ctx = await browser.newContext({ viewport, locale: 'ar' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); localStorage.setItem('sa.labCoach.level-laser.off', '1'); } catch { /* noop */ } }, token);
  return ctx;
}
const RAW = /(^|[^\\])\$[^$\s][^$]*\$|\\(frac|times|mathrm|ldots|le|div)\b|manipulation\.[a-zA-Z]+\./;
async function pageHealth(page, label) {
  const { overflow, raw } = await page.evaluate((re) => {
    const rx = new RegExp(re);
    const doc = document.documentElement;
    const bad = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode; const el = n.parentElement;
      if (!el || el.closest('script,style,.katex-mathml,[aria-hidden="true"]') || el.closest('[hidden]')) continue;
      if (rx.test(n.textContent)) bad.push(n.textContent.trim().slice(0, 80));
    }
    return { overflow: doc.scrollWidth - doc.clientWidth, raw: bad.slice(0, 3) };
  }, RAW.source);
  check(overflow <= 1, `${label}: pas de débordement horizontal (${overflow}px)`);
  check(raw.length === 0, `${label}: aucun texte brut ${raw.length ? JSON.stringify(raw) : ''}`);
}

const browser = await chromium.launch();
const token = await loginToken(TEACHER);

// 1 — sommaire et modules (QA_LAB_ONLY=1 les saute : relancer seulement le labo).
for (const vp of process.env.QA_LAB_ONLY ? [] : SIZES.filter((v) => !process.env.QA_WIDTHS || process.env.QA_WIDTHS.split(',').includes(String(v.width)))) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}×${vp.height}`;
  await page.goto(`${BASE}${LESSON}`, { waitUntil: 'networkidle' });
  check(await page.getByText('مقارنة كسرين').first().isVisible().catch(() => false), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);
  for (const slug of MODULES) {
    await page.goto(`${BASE}${LESSON}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    check(await page.locator('main, [data-module-layout], h1').first().isVisible().catch(() => false), `${tag} ${slug} monté`);
    await pageHealth(page, `${tag} ${slug}`);
    if (vp.width === 1366) await page.screenshot({ path: `${OUT}/${slug}-${vp.width}.png`, fullPage: true });
  }
  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 2 → 5 — le labo.
const vis = (page, sel) => page.locator(`${sel}:visible`).first();
const glanceFits = async (page, label) => {
  const box = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-ll-glance]')].find((e) => e.offsetHeight > 0);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const free = el.parentElement.querySelector('[data-ll-free]')?.getBoundingClientRect();
    return { h: r.height, top: r.top, bottom: free ? free.top : r.bottom, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-ll-glance] reste dans la largeur (${box ? `${Math.round(box.h)}px de haut / ${box.vh}` : 'absent'})`);
  return box;
};
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForSelector('[data-ll-glance]', { state: 'attached' });
  await page.waitForTimeout(900);
};
const nudge = async (page, key = 'ArrowUp', n = 1) => { const h = vis(page, '[data-ll-laser]'); await h.focus(); for (let i = 0; i < n; i += 1) await page.keyboard.press(key); await page.waitForTimeout(120); };
const snap = async (page, i) => { await vis(page, `[data-ll-snap="${i}"]`).click(); await page.waitForTimeout(150); };
const choose = async (page, c) => { await vis(page, `[data-ll-choice="${c}"]`).click(); await page.waitForTimeout(150); };
const verdict = (page) => vis(page, '[data-ll-verdict]').getAttribute('data-ll-verdict');
const write = async (page, text) => {
  const input = vis(page, '[data-ll-input]');
  await input.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await input.fill(text);
  await input.press('Enter');
  await page.waitForTimeout(150);
};
const answerCards = async (page, numbers = {}) => {
  for (let guard = 0; guard < 12; guard += 1) {
    const card = page.locator('[data-lab-checkpoint]:visible').first();
    if (!(await card.count())) return;
    const q = await card.getAttribute('data-q');
    const input = card.locator('[data-lab-checkpoint-input]');
    if (await input.count()) { await input.fill(numbers[q] ?? '0'); await card.locator('[data-lab-checkpoint-check]').click(); }
    else {
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
const nextTask = async (page) => { await vis(page, '[data-ll-next]').click(); await page.waitForTimeout(250); };
const NUM = { marks: '8', at9: '9' };

for (const vp of SIZES.filter((v) => !process.env.QA_LABW || process.env.QA_LABW.split(',').includes(String(v.width)))) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('framenavigated', (f) => { if (process.env.QA_DEBUG) console.log('NAV', f.url()); });
  const tag = `${vp.width}×${vp.height}`;
  const shot = async (name) => {
    await page.waitForTimeout(1700);   // la fête de fin de tâche passe
    const el = page.locator('[data-ll-glance]:visible').first();
    await el.evaluate((e) => e.scrollIntoView({ block: 'start', behavior: 'instant' })).catch(() => {});
    await page.waitForTimeout(150);
    await el.screenshot({ path: `${OUT}/lab-${name}-${vp.width}x${vp.height}.png` });
  };
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-level-laser]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  const bx = await glanceFits(page, `${tag} مبتدئ`);
  await shot('beginner-init');
  check((await vis(page, '[data-ll-laser]').getAttribute('data-locked')) === 'false', `${tag} مبتدئ : le laser est libre`);
  check(await page.locator('[data-ll-snap]:visible').count() === 0, `${tag} مبتدئ : les boutons « على زيت » ne sont pas offerts avant un geste`);
  await nudge(page);
  check(await page.locator('[data-ll-snap]:visible').count() > 0, `${tag} مبتدئ : après un geste de la main, ils sont offerts`);
  await snap(page, 0);
  check(await page.locator('[data-ll-choice]:visible').count() === 3, `${tag} l1 : le laser sur l'huile gauche ouvre le choix`);
  await choose(page, 'left');
  check((await verdict(page)) === 'bad', `${tag} l1 : « الأيسر » est refusé`);
  await shot('beginner-wrong');
  await choose(page, 'right');
  check((await verdict(page)) === 'good', `${tag} l1 : « الأيمن » est accepté`);
  await page.waitForTimeout(500);
  check(await page.locator('[data-lab-checkpoint]').count() > 0, `${tag} l1 : la carte de questions s'ouvre PAR-DESSUS le labo`);
  await shot('beginner-card');
  await answerCards(page, NUM);
  await nextTask(page);
  // l2 : 3/4 | 7/12
  await nudge(page); await snap(page, 0);
  const chip = await vis(page, '[data-ll-chip="1"]').getAttribute('data-on');
  check(chip === '9', `${tag} l2 : le laser sur 3/4 coupe le tube de 12 au cran 9 (${chip})`);
  await shot('beginner-l2-read');
  await choose(page, 'right');
  check((await verdict(page)) === 'bad' && (await vis(page, '[data-level-laser]').getAttribute('data-h')) !== '0/24', `${tag} l2 : « الأيمن » (numérateurs seuls) est refusé, le laser saute`);
  await choose(page, 'left');
  check(await vis(page, '[data-ll-input]').count() > 0, `${tag} l2 : l'écriture 9/12 est demandée`);
  await shot('beginner-l2-write');
  await write(page, '3/12'); check((await verdict(page)) === 'bad', `${tag} l2 : « 3/12 » (noScale) est refusé`);
  await write(page, '9/12'); await page.waitForTimeout(500);
  await answerCards(page, NUM); await nextTask(page);
  // l3 : 3/5 | 3/8 -> entre 4 et 5
  await nudge(page); await snap(page, 0);
  check((await vis(page, '[data-ll-chip="1"]').getAttribute('data-between')) === '4-5', `${tag} l3 : le laser sur 3/5 coupe le tube de 8 entre 4 et 5`);
  await shot('beginner-l3-between');
  await choose(page, 'left'); await page.waitForTimeout(500); await answerCards(page, NUM); await nextTask(page);
  // l4 : 9/8 | 5/6
  if (process.env.QA_DEBUG) console.log('DBG before l4', await vis(page, '[data-level-laser]').getAttribute('data-task'), await vis(page, '[data-level-laser]').getAttribute('data-h'));
  await nudge(page); await snap(page, 0);
  if (process.env.QA_DEBUG) console.log('DBG l4 snapped', await vis(page, '[data-level-laser]').getAttribute('data-task'), await vis(page, '[data-level-laser]').getAttribute('data-h'));
  await choose(page, 'left');
  if (process.env.QA_DEBUG) console.log('DBG l4 chose', await vis(page, '[data-level-laser]').getAttribute('data-task'), await page.locator('[data-ll-one-choice]').count(), await vis(page, '[data-ll-verdict]').getAttribute('data-ll-verdict'));
  check(await vis(page, '[data-ll-one]').count() > 0, `${tag} l4 : le trait « 1 » est interrogé`);
  await shot('beginner-l4-over');
  await vis(page, '[data-ll-one-choice="left"]').click(); await page.waitForTimeout(500);
  check(await page.locator('[data-lab-checkpoint]').count() > 0, `${tag} l4 : la carte de questions s'ouvre`);
  await answerCards(page, NUM);
  // « إعادة » : tout repart
  await vis(page, 'button:has-text("إعادة")').click().catch(() => {});
  await page.waitForTimeout(600);
  check((await vis(page, '[data-level-laser]').getAttribute('data-task')) === '0' && (await vis(page, '[data-level-laser]').getAttribute('data-h')).startsWith('0/'), `${tag} « إعادة » repart de la tâche 1`);

  await pickLevel(page, 'advanced');
  const ax = await glanceFits(page, `${tag} متقدم`);
  await shot('advanced-init');
  if (vp.width === 1024) for (const [lv, b] of [['مبتدئ', bx], ['متقدم', ax]]) console.log(`  ${tag} ${lv} : hauteur du labo avant « جرّب أعدادك » = ${b ? Math.round(b.bottom - b.top) : '?'} px (écran ${vp.height})`);
  check((await vis(page, '[data-ll-laser]').getAttribute('data-locked')) === 'true' && await page.locator('[data-ll-sleeve]:visible').count() >= 2, `${tag} متقدم : tubes voilés, laser verrouillé`);
  await choose(page, 'right');       // a1 : 5/6 > 11/18 : « < » est faux : les voiles se lèvent
  check((await verdict(page)) === 'bad' && (await vis(page, '[data-ll-laser]').getAttribute('data-locked')) === 'false', `${tag} a1 : une prédiction fausse lève les voiles`);
  await shot('advanced-lifted');
  await choose(page, 'left'); await write(page, '15/18');
  await nudge(page); await snap(page, 0); await page.waitForTimeout(500);
  check(await page.locator('[data-lab-checkpoint]').count() > 0, `${tag} a1 : vérification au laser, la carte s'ouvre`);
  await answerCards(page, NUM); await nextTask(page);
  // a2 : trois réservoirs
  check(await page.locator('[data-ll-tube]:visible').count() === 3, `${tag} a2 : trois réservoirs`);
  await shot('advanced-a2-covered');
  for (const i of [1, 0, 2]) await vis(page, `[data-ll-order="${i}"]`).click();
  await page.waitForTimeout(200);
  await write(page, '6/9'); await nudge(page); await snap(page, 0); await page.waitForTimeout(500);
  await shot('advanced-a2-done');
  await answerCards(page, NUM); await nextTask(page);
  // a3 : numérateurs décimaux
  await choose(page, 'right'); await write(page, '5/8'); await nudge(page); await snap(page, 0); await page.waitForTimeout(500);
  await shot('advanced-a3-done');
  await answerCards(page, NUM); await nextTask(page);
  // a4 : deux réservoirs trop pleins
  await choose(page, 'left'); await write(page, '14/10'); await nudge(page); await snap(page, 0); await page.waitForTimeout(500);
  await shot('advanced-a4-done');
  check(await page.locator('[data-lab-checkpoint]').count() > 0, `${tag} a4 : la carte de questions s'ouvre`);
  check(errors.length === 0, `${tag} aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 2)) : ''}`);
  await ctx.close();
}
{
  const ctx = await contextFor(browser, token, { width: 1366, height: 768 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-level-laser]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  for (const [sel, v] of [['a', '2'], ['b', '3'], ['c', '3'], ['d', '5']]) await vis(page, `[data-ll-free-${sel}]`).fill(v);
  await page.waitForTimeout(300);
  check((await vis(page, '[data-ll-free]').getAttribute('data-active')) === 'true', '« جرّب أعدادك » : 2/3 et 3/5 ouvre une tâche libre');
  check(/السنة الثالثة/.test(await vis(page, '[data-ll-verdict]').innerText()), '« جرّب أعدادك » : un cas de 3AM ne reçoit JAMAIS de verdict (le laser seul)');
  await page.screenshot({ path: `${OUT}/lab-free-1366x768.png` });
  for (const [sel, v] of [['a', '7'], ['b', '3'], ['c', '1'], ['d', '2']]) await vis(page, `[data-ll-free-${sel}]`).fill(v);
  await page.waitForTimeout(300);
  check(await vis(page, '[data-ll-free-msg]').isVisible().catch(() => false), '« جرّب أعدادك » : 7/3 est refusé (numérateur > 2 × dénominateur)');
  await ctx.close();
}

await browser.close();
if (failures.length) { console.log(`\n${failures.length} échec(s)`); process.exit(1); }
console.log('\nTout est vert.');
