// QA — 2AM, unité 3 « الأعداد النسبية », leçon `talim-nuqta-mustawi` « تعليم نقطة في المستوي » et son labo `dig-grid` « شبكة الحفرية » (cycle moyen phase 3, 2026-10-29).
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/2am-adad-nisbiya-2-talim-nuqta-mustawi.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, à 768×1024, 1024×768, 1280×800 et 1366×768 (tablette et laptop seulement) :
//   1. le sommaire et CHAQUE module : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » / « \command » / clé `manipulation.` brute ;
//   2. le labo مبتدئ : le piquet (flèches du clavier) amené en (4 ; 2) lit la jarre (1 ; 2) = le relevé échangé : le carnet devient rouge ; en (3 ; 3) la tâche est faite et la carte de
//      questions s'ouvre PAR-DESSUS le labo ; un glissement à la souris déplace le piquet ; « إعادة » repart de la tâche 1 ;
//   3. le labo متقدم : aucune coordonnée avant d'écrire ; « 3 ; 1 » pour la pièce est refusé (fantôme) puis « 3 ; −1 » accepté ; la perle « −2 ; 0 » est refusée (fantôme sur l'autre corde) ;
//   4. D'UN SEUL REGARD : `[data-dg-glance]` reste dans la largeur ET ≤ 700 px de haut à 1024×768, aux DEUX niveaux ;
//   5. « جرّب أعدادك » : « −2 ; 3,5 » ouvre la tâche libre et nomme la région (en haut à gauche).
// Captures dans /tmp/qa-2am-talim-nuqta-mustawi (ou QA_OUT).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5174';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-2am-talim-nuqta-mustawi';
const CH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/talim-nuqta-mustawi`;
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
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); localStorage.setItem('sa.labCoach.dig-grid.off', '1'); } catch { /* noop */ } }, token);
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
  check(await page.getByText('تعليم نقطة في المستوي').first().isVisible().catch(() => false), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);
  for (const slug of MODULES) {
    await page.goto(`${BASE}${LESSON}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    check(await page.locator('main, [data-module-layout], h1').first().isVisible().catch(() => false), `${tag} ${slug} monté`);
    await pageHealth(page, `${tag} ${slug}`);
    // aucune formule d'une fiche de mémoire ne dépasse sa fiche (règle trop longue = rognée)
    const clipped = await page.evaluate(() => {
      const out = [];
      for (const card of document.querySelectorAll('[data-memo-card]')) {
        const cb = card.getBoundingClientRect();
        for (const k of card.querySelectorAll('.katex')) {
          const r = k.getBoundingClientRect();
          if (r.width && (r.left < cb.left - 1 || r.right > cb.right + 1)) out.push(k.textContent.slice(0, 40));
          const host = k.closest('[data-memo-rule],[data-memo-chip],[data-memo-tile]');
          if (host) { const hb = host.getBoundingClientRect(); if (r.width && (r.left < hb.left - 1 || r.right > hb.right + 1)) out.push(`tile:${k.textContent.slice(0, 40)}`); }
        }
      }
      return out;
    });
    check(clipped.length === 0, `${tag} ${slug}: aucune formule de fiche ne dépasse sa fiche ${clipped.length ? JSON.stringify(clipped.slice(0, 3)) : ''}`);
    if (vp.width !== 1280) await page.screenshot({ path: `${OUT}/${slug}-${vp.width}.png`, fullPage: true });
  }
  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 2 → 5 — le labo.
const vis = (page, sel) => page.locator(`${sel}:visible`).first();
const glanceFits = async (page, label, vp) => {
  const box = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-dg-glance]')].find((e) => e.offsetHeight > 0);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { h: r.height, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-dg-glance] reste dans la largeur (${box ? Math.round(box.h) : 'absent'} px de haut)`);
  if (vp.width === 1024) check(box && box.h <= 700, `${label}: [data-dg-glance] ≤ 700 px de haut à 1024×768 (${box ? Math.round(box.h) : 'absent'})`);
  return box;
};
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForSelector('[data-dg-glance]', { state: 'attached' });
  await page.waitForTimeout(900);
};
const keys = async (page, ...ks) => { const s = vis(page, '[data-dg-stake]'); await s.focus(); for (const k of ks) { await page.keyboard.press(k); await page.waitForTimeout(60); } };
const stakeAt = (page) => vis(page, '[data-dig-grid]').getAttribute('data-stake');
const write = async (page, x, y) => {
  await vis(page, '[data-dg-x]').evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await vis(page, '[data-dg-x]').fill(x); await vis(page, '[data-dg-y]').fill(y); await vis(page, '[data-dg-check]').click(); await page.waitForTimeout(250);
};
const verdict = async (page) => vis(page, '[data-dg-verdict]').getAttribute('data-dg-verdict');

for (const vp of SIZES.filter((v) => !process.env.QA_WIDTHS || process.env.QA_WIDTHS.split(',').includes(String(v.width)))) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}×${vp.height}`;
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-dig-grid]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  await glanceFits(page, `${tag} مبتدئ`, vp);
  await page.screenshot({ path: `${OUT}/lab-beginner-init-${vp.width}x${vp.height}.png` });
  // d1 : le piquet part de (1 ; 1) ; (4 ; 2) lit la jarre (1 ; 2) — les nombres échangés
  await keys(page, 'ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowUp');
  check((await stakeAt(page)) === '(4 ; 2)', `${tag} d1 : les flèches amènent le piquet en (4 ; 2) (${await stakeAt(page)})`);
  check((await verdict(page)) === 'wrong' && (await page.locator('[data-dg-note][data-ok="false"]:visible').count()) > 0, `${tag} d1 : la lecture échangée (1 ; 2) rend le carnet rouge`);
  await page.screenshot({ path: `${OUT}/lab-beginner-swap-${vp.width}x${vp.height}.png` });
  await keys(page, 'ArrowLeft', 'ArrowUp');
  await page.waitForTimeout(500);
  check((await stakeAt(page)) === '(3 ; 3)' && (await page.locator('[data-dg-note][data-ok="true"]:visible').count()) > 0, `${tag} d1 : en (3 ; 3) la jarre est à (2 ; 1)`);
  await page.waitForTimeout(600);
  check(await page.locator('[data-lab-checkpoint]').count() > 0, `${tag} d1 : la carte de questions s'ouvre PAR-DESSUS le labo`);
  await page.screenshot({ path: `${OUT}/lab-beginner-card-${vp.width}x${vp.height}.png` });
  // « إعادة » : tout repart
  await vis(page, 'button:has-text("إعادة")').click().catch(() => {});
  await page.waitForTimeout(600);
  check((await vis(page, '[data-dig-grid]').getAttribute('data-task')) === '0' && (await stakeAt(page)) === '(1 ; 1)', `${tag} « إعادة » repart de la tâche 1 (${await stakeAt(page)})`);
  // un glissement à la souris déplace le piquet
  await vis(page, '[data-dg-svg]').scrollIntoViewIfNeeded();
  const box = await vis(page, '[data-dg-svg]').boundingBox();
  await page.mouse.move(box.x + 5, box.y + 5);
  const before = await stakeAt(page);
  const peg = await vis(page, '[data-dg-stake]').boundingBox();
  await page.mouse.move(peg.x + peg.width / 2, peg.y + peg.height - 8); await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.3, { steps: 6 }); await page.mouse.up();
  await page.waitForTimeout(200);
  check((await stakeAt(page)) !== before, `${tag} un glissement à la souris déplace le piquet (${before} → ${await stakeAt(page)})`);
  await page.screenshot({ path: `${OUT}/lab-beginner-drag-${vp.width}x${vp.height}.png` });

  await pickLevel(page, 'advanced');
  await glanceFits(page, `${tag} متقدم`, vp);
  await page.screenshot({ path: `${OUT}/lab-advanced-init-${vp.width}x${vp.height}.png` });
  check(await page.locator('[data-dg-find][data-coords]:visible').count() === 0, `${tag} متقدم : aucune coordonnée n'est montrée avant d'écrire`);
  await write(page, '3', '1');
  check((await verdict(page)) === 'wrong' && await page.locator('[data-dg-ghost][data-model="signAxis"]').count() > 0, `${tag} p1 : « 3 ; 1 » pour la pièce est refusé et le fantôme montre l'autre côté de la corde bleue`);
  await page.screenshot({ path: `${OUT}/lab-advanced-ghost-${vp.width}x${vp.height}.png` });
  await write(page, '3', '-1'); await write(page, '1', '3');
  await write(page, '-2', '0');
  check((await verdict(page)) === 'wrong' && await page.locator('[data-dg-ghost][data-model="onAxis"]').count() > 0, `${tag} p1 : la perle « −2 ; 0 » est refusée, le fantôme est sur l'autre corde`);
  await write(page, '0', '-2');
  await page.waitForTimeout(1000);
  check(await page.locator('[data-lab-checkpoint]').count() > 0, `${tag} p1 : les trois relevés ouvrent la carte de questions`);
  await page.screenshot({ path: `${OUT}/lab-advanced-done-${vp.width}x${vp.height}.png` });
  check(errors.length === 0, `${tag} aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 2)) : ''}`);
  await ctx.close();
}
{
  const ctx = await contextFor(browser, token, { width: 1366, height: 768 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-dig-grid]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  await vis(page, '[data-dg-free-input]').fill('-2 ; 3,5');
  await page.waitForTimeout(300);
  check((await vis(page, '[data-dg-free]').getAttribute('data-active')) === 'true', '« جرّب أعدادك » : « −2 ; 3,5 » ouvre la tâche libre');
  check((await vis(page, '[data-dg-free-info]').textContent()).includes('يسار'), '« جرّب أعدادك » : la région (يسار الحبل الأخضر) est nommée');
  await page.screenshot({ path: `${OUT}/lab-free-1366x768.png` });
  await ctx.close();
}

await browser.close();
if (failures.length) { console.log(`\n${failures.length} échec(s)`); process.exit(1); }
console.log('\nTout est vert.');
