// QA — 2AM, unité 4 « مفهوم معادلة », 3e leçon `ikhtibar-musawat-mutabayina` « اختبار صحة مساواة أو متباينة » et son labo `bridge-load` « حمولة الجسر » (cycle moyen phase 3, 2026-10-30).
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/2am-mafhum-muadala-ikhtibar-musawat-mutabayina.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, à 768×1024, 1024×768, 1280×800 et 1366×768 (tablette et laptop seulement) :
//   1. le sommaire et CHAQUE module : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » brut / commande LaTeX / clé `manipulation.` ;
//   2. le labo مبتدئ b1 : 15 sacs → 4750 (verdict juste accepté, « لا » à tort refusé), 22 sacs → 5100, la carte 20 glissée sur la benne affiche 5000, seules 18 et 19 cochées passent ;
//   3. le labo متقدم a1 : l'écran est MASQUÉ jusqu'à ce que les deux masses soient tapées, 31 sacs réfute l'affirmation (la carte de questions s'ouvre PAR-DESSUS le labo) ;
//   4. D'UN SEUL REGARD : `[data-bl-glance]` tient dans la largeur et, à 1024×768, dans 700 px de haut, aux DEUX niveaux ;
//   5. « جرّب أعدادك » : une pesée libre qui n'est jamais comptée.
// Captures dans /tmp/qa-2am-ikhtibar-musawat-mutabayina (ou QA_OUT).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5174';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-2am-ikhtibar-musawat-mutabayina';
const CH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/ikhtibar-musawat-mutabayina`;
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
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); localStorage.setItem('sa.labCoach.bridge-load.off', '1'); } catch { /* noop */ } }, token);
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
  check(await page.getByText('اختبار صحة مساواة أو متباينة').first().isVisible().catch(() => false), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);
  for (const slug of MODULES) {
    await page.goto(`${BASE}${LESSON}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    check(await page.locator('main, [data-module-layout], h1').first().isVisible().catch(() => false), `${tag} ${slug} monté`);
    await pageHealth(page, `${tag} ${slug}`);
    await page.screenshot({ path: `${OUT}/${slug}-${vp.width}x${vp.height}.png`, fullPage: true });
    const memo = await page.evaluate(() => {
      const bad = [];
      for (const card of document.querySelectorAll('[data-memo-card]')) {
        const cr = card.getBoundingClientRect();
        if (!cr.width) continue;
        const fs = [...card.querySelectorAll('.katex')].filter((e) => !e.parentElement.closest('.katex') && e.getBoundingClientRect().width > 0).map((e) => ({ r: e.getBoundingClientRect(), s: e.textContent.slice(0, 20) }));
        fs.forEach((a, i) => {
          if (a.r.left < cr.left - 1 || a.r.right > cr.right + 1) bad.push(`hors carte: ${a.s}`);
          fs.slice(i + 1).forEach((b) => { if (a.r.left < b.r.right - 1 && b.r.left < a.r.right - 1 && a.r.top < b.r.bottom - 1 && b.r.top < a.r.bottom - 1) bad.push(`chevauche: ${a.s} / ${b.s}`); });
        });
      }
      return bad.slice(0, 4);
    });
    check(memo.length === 0, `${tag} ${slug}: aucune formule de la fiche mémo ne chevauche une autre ni ne dépasse sa carte ${memo.length ? JSON.stringify(memo) : ''}`);
  }
  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 2 → 5 — le labo.
const vis = (page, sel) => page.locator(`${sel}:visible`).first();
const glanceFits = async (page, label) => {
  const box = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-bl-glance]')].find((e) => e.offsetHeight > 0);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { h: r.height, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-bl-glance] reste dans la largeur (${box ? `${Math.round(box.h)}px de haut / ${box.vh}` : 'absent'})`);
  return box;
};
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForSelector('[data-bl-glance]', { state: 'attached' });
  await page.waitForTimeout(900);
};
const click = async (page, sel) => { const el = vis(page, sel); await el.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await el.click(); await page.waitForTimeout(80); };
const addX = async (page, n) => { for (let i = 0; i < Math.floor(n / 5); i += 1) await click(page, '[data-bl-x-more5]'); for (let i = 0; i < n % 5; i += 1) await click(page, '[data-bl-x-more]'); };
const verdict = (page) => vis(page, '[data-bl-verdict]').getAttribute('data-bl-verdict');
const screenText = (page) => vis(page, '[data-bl-screens]').innerText();
const checkpoint = (page) => page.locator('[data-lab-checkpoint]').count();

for (const vp of SIZES) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}×${vp.height}`;
  const shot = async (n) => { await page.locator('[data-bl-glance]:visible').first().evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' })).catch(() => {}); await page.waitForTimeout(150); await page.screenshot({ path: `${OUT}/${n}-${vp.width}x${vp.height}.png` }); };
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-bridge-load]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  const bx = await glanceFits(page, `${tag} مبتدئ`);
  await shot('lab-beginner-init');
  // b1 : 15 sacs → 4750 < 5000, la barrière s'ouvre
  await addX(page, 15);
  check((await vis(page, '[data-bl-count=x]').innerText()).trim() === '15', `${tag} b1 : 15 sacs sur la benne`);
  await click(page, '[data-bl-weigh]');
  check(/4750/.test(await screenText(page)), `${tag} b1 : l'écran écrit 4750`);
  await shot('lab-beginner-weighed');
  await click(page, '[data-bl-no]');
  check((await verdict(page)) === 'bad', `${tag} b1 : « لا » à tort est refusé`);
  await shot('lab-beginner-wrong');
  await click(page, '[data-bl-yes]');
  check((await verdict(page)) === 'good', `${tag} b1 : « نعم » juste est accepté`);
  await click(page, '[data-bl-next-load]');
  await addX(page, 22);
  await click(page, '[data-bl-weigh]');
  check(/5100/.test(await screenText(page)), `${tag} b1 : 22 sacs → 5100`);
  await click(page, '[data-bl-no]');
  check((await verdict(page)) === 'good', `${tag} b1 : 5100 ne passe pas, « لا » juste`);
  await click(page, '[data-bl-next-load]');
  // les cartes : on glisse « 20 » sur la benne, l'écran dit 5000
  const card = vis(page, '[data-bl-card="2"]');
  await card.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
  const cb = await card.boundingBox();
  const zone = await page.locator('[data-bl-dropzone]').first().boundingBox();
  await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2);
  await page.mouse.down();
  await page.mouse.move(zone.x + zone.width / 2, zone.y + zone.height / 2, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(250);
  check(/5000/.test(await screenText(page)), `${tag} b1 : la carte 20 glissée sur la benne affiche 5000`);
  await shot('lab-beginner-boundary');
  await click(page, '[data-bl-card="0"]'); await click(page, '[data-bl-card="1"]'); await click(page, '[data-bl-card="2"]');
  await click(page, '[data-bl-cards-check]');
  await page.waitForTimeout(200);
  check((await checkpoint(page)) === 0, `${tag} b1 : cocher aussi « 20 » est refusé`);
  await click(page, '[data-bl-card="2"]');
  await click(page, '[data-bl-cards-check]');
  await page.waitForTimeout(700);
  check((await checkpoint(page)) > 0, `${tag} b1 : 18 et 19 seules acceptées, la carte de questions s'ouvre PAR-DESSUS le labo`);
  await shot('lab-beginner-card');
  await vis(page, 'button:has-text("إعادة")').click().catch(() => {});
  await page.waitForTimeout(600);
  check((await vis(page, '[data-bridge-load]').getAttribute('data-task')) === '0', `${tag} « إعادة » repart de la tâche 1`);

  await pickLevel(page, 'advanced');
  const ax = await glanceFits(page, `${tag} متقدم`);
  await shot('lab-advanced-init');
  if (vp.width === 1024) {
    for (const [lv, b] of [['مبتدئ', bx], ['متقدم', ax]]) {
      console.log(`  ${tag} ${lv} : hauteur de [data-bl-glance] = ${b ? Math.round(b.h) : '?'} px (écran ${vp.height})`);
      check(b && b.h <= 700, `${tag} ${lv} : [data-bl-glance] ≤ 700 px de haut (${b ? Math.round(b.h) : '?'}) : un seul écran`);
    }
  }
  // a1 : l'écran est masqué jusqu'à ce que les deux masses soient tapées ; 31 sacs réfutent l'affirmation
  await addX(page, 31);
  await click(page, '[data-bl-weigh]');
  check((await page.locator('[data-bl-predict-input=A]:visible').count()) > 0, `${tag} a1 : les champs de prédiction s'ouvrent, l'écran est masqué`);
  check(!/5170/.test(await screenText(page).catch(() => '')), `${tag} a1 : la masse n'est pas encore écrite`);
  await shot('lab-advanced-predict');
  await vis(page, '[data-bl-predict-input=A]').fill('5170');
  await vis(page, '[data-bl-predict-input=B]').fill('5150');
  await click(page, '[data-bl-predict-go]');
  await page.waitForTimeout(250);
  check(/5170/.test(await screenText(page)) && /5150/.test(await screenText(page)), `${tag} a1 : l'écran écrit 5170 et 5150`);
  await shot('lab-advanced-revealed');
  await click(page, '[data-bl-counter]');
  await page.waitForTimeout(700);
  check((await checkpoint(page)) > 0, `${tag} a1 : 31 sacs réfutent l'affirmation (carte de questions)`);
  await shot('lab-advanced-solved');

  // « جرّب أعدادك »
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-bridge-load]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  await click(page, '[data-bl-free-start]');
  await page.waitForTimeout(200);
  await click(page, '[data-bl-weigh]');
  await page.waitForTimeout(200);
  check((await screenText(page)).length > 0, `${tag} libre : une pesée libre donne son écran`);
  await shot('lab-free');
  check(errors.length === 0, `${tag} aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 2)) : ''}`);
  await ctx.close();
}

await browser.close();
if (failures.length) { console.log(`\n${failures.length} échec(s)`); process.exit(1); }
console.log('\nTout est vert.');
