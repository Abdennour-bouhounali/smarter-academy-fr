// QA — 3AM, unité 11 « خاصية فيثاغورس، جيب تمام زاوية », leçon `khassiyat-fitaghuras` « خاصية فيثاغورس » et son labo
// `pythagoras-tanks` (cycle moyen, phase 3, file A entrée 2, 2026-10-20).
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/3am-fitaghuras-jayb-tamam.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (pas de téléphone) :
//   1. la page d'unité, le sommaire et CHAQUE module à 768 et 1280 px : monté, aucune erreur console, aucun débordement horizontal,
//      aucun « $ » / « \command » / clé brute ;
//   2. guide §4quater : rien au-dessus du labo au module 1, les briques ABSENTES avant la réponse ;
//   3. le labo au CLAVIER (flèches sur la poignée, Entrée verse) : 60° déborde, 90° remplit tout juste, 120° laisse un vide ; la
//      découverte s'ouvre ; au متقدم : 13 remplit, 2 et 3 → la touche √ → √13 remplit ;
//   4. le labo au POINTEUR : glisser la poignée C change l'angle ;
//   5. D'UN SEUL REGARD : `[data-pt-glance]` tient dans l'écran à 768×1024, 1024×768, 1280×800, 1366×768, 1920×1080, aux deux niveaux.
// Captures dans /tmp/qa-3am-fitaghuras.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-3am-fitaghuras';
const CH = '/courses/moyen/3am/handasa';
const LESSON = `${CH}/khassiyat-fitaghuras`;
const UNIT = `${CH}/units/fitaghuras-jayb-tamam`;
const MODULES = ['astaidd', 'nashat', 'maarif', 'tariqa', 'atamarran', 'masala-1', 'masala-2', 'masala-3', 'itqan'];
mkdirSync(OUT, { recursive: true });

const failures = [];
const check = (ok, label) => { if (!ok) failures.push(label); console.log(`${ok ? '✓' : '✗'} ${label}`); };

async function loginToken(who, tries = 8) {
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
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); localStorage.setItem('sa.labCoach.pythagoras-tanks.off', '1'); } catch { /* noop */ } }, token);
  return ctx;
}

const RAW = /(^|[^\\])\$[^$\s][^$]*\$|\\(frac|times|mathrm|sqrt|neq|approx|div)\b|manipulation\.[a-zA-Z]+\./;

async function pageHealth(page, label) {
  const { overflow, raw } = await page.evaluate((re) => {
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
    return { overflow: doc.scrollWidth - doc.clientWidth, raw: bad.slice(0, 3) };
  }, RAW.source);
  check(overflow <= 1, `${label}: pas de débordement horizontal (${overflow}px)`);
  check(raw.length === 0, `${label}: aucun texte brut ${raw.length ? JSON.stringify(raw) : ''}`);
}

const browser = await chromium.launch();
const token = await loginToken(TEACHER);

// 1 + 2 — unité, sommaire, modules ; rien au-dessus du labo ; briques absentes avant la réponse.
for (const vp of [{ width: 1280, height: 800 }, { width: 768, height: 1024 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}px`;

  await page.goto(`${BASE}${UNIT}`, { waitUntil: 'networkidle' });
  check(await page.getByText('خاصية فيثاغورس').first().isVisible().catch(() => false), `${tag} page d'unité : la leçon est listée`);
  await pageHealth(page, `${tag} unité`);

  await page.goto(`${BASE}${LESSON}`, { waitUntil: 'networkidle' });
  check(await page.getByText('خاصية فيثاغورس').first().isVisible(), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);
  await page.screenshot({ path: `${OUT}/index-${vp.width}.png`, fullPage: true });

  for (const slug of MODULES) {
    await page.goto(`${BASE}${LESSON}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    check(await page.locator('main, [data-module-layout], h1').first().isVisible().catch(() => false), `${tag} ${slug} monté`);
    await pageHealth(page, `${tag} ${slug}`);
    if (slug === 'nashat') {
      await page.waitForSelector('[data-pythagoras-tanks]');
      const order = await page.evaluate(() => {
        const lab = document.querySelector('[data-pythagoras-tanks]');
        const brief = document.querySelector('[data-module-brief]');
        const q = document.querySelector('[data-activity-evidence]');
        const before = (a, b) => Boolean(a && b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING));
        return { briefAbove: brief ? before(brief, lab) : false, labBeforeQuestion: before(lab, q) };
      });
      check(!order.briefAbove, `${tag} nashat : aucune carte au-dessus du labo`);
      check(order.labBeforeQuestion, `${tag} nashat : le labo avant la première question`);
      check(await page.locator('[data-knowledge-brick]').count() === 0, `${tag} nashat : aucune brique avant la réponse`);
    }
    await page.screenshot({ path: `${OUT}/${slug}-${vp.width}.png`, fullPage: true });
  }
  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 3 + 4 — les gestes.
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForTimeout(400);
};
const vis = (page, sel) => page.locator(`${sel}:visible`).first();
const pour = async (page) => { await vis(page, '[data-pt-pour]').click(); await page.waitForTimeout(1900); };
const verdict = async (page) => vis(page, '[data-pt-verdict]').getAttribute('data-pt-verdict').catch(() => null);
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-pythagoras-tanks][data-mode=angle]');
  const handle = vis(page, '[data-pt-handle]');
  check(await handle.getAttribute('aria-valuenow') === '60', 'labo : départ à 60°');
  await pour(page);
  check(await verdict(page) === 'over', 'labo : à 60° le grand bassin déborde');
  check(await vis(page, '[data-pt-spill]').count() === 1, 'labo : la flaque est dessinée');
  await handle.focus();
  for (let i = 0; i < 3; i += 1) await page.keyboard.press('Shift+ArrowRight');
  check(await handle.getAttribute('aria-valuenow') === '90', 'labo (clavier) : Maj+→ ×3 → 90°');
  check(await vis(page, '[data-pt-right]').count() === 1, 'labo : le marqueur d\'angle droit apparaît à 90°');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1900);
  check(await verdict(page) === 'exact', 'labo : à 90° le grand bassin est plein tout juste');
  await vis(page, '[data-pt-next]').click();
  await page.waitForTimeout(300);
  await handle.focus();
  for (let i = 0; i < 3; i += 1) await page.keyboard.press('Shift+ArrowRight');
  await pour(page);
  check(await verdict(page) === 'gap', 'labo : à 120° il reste un vide');
  check(await vis(page, '[data-pt-gap]').count() === 1, 'labo : le vide est dessiné');
  check(await page.locator('[data-manipulation-discovery]:visible').count() === 1, 'labo : la découverte s\'ouvre après le contraste');
  await page.screenshot({ path: `${OUT}/lab-discovery-1280.png`, fullPage: true });

  // 4 — pointeur : glisser C vers la gauche ouvre l'angle
  const before = Number(await handle.getAttribute('aria-valuenow'));
  const box = await handle.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 90, box.y + box.height / 2 + 20, { steps: 8 });
  await page.mouse.up();
  const after = Number(await handle.getAttribute('aria-valuenow'));
  check(after !== before, `labo (pointeur) : glisser C change l'angle (${before}° → ${after}°)`);

  // متقدم : 13 puis √13
  await pickLevel(page, 'advanced');
  const h2 = vis(page, '[data-pt-handle]');
  await h2.focus();
  let now = Number(await h2.getAttribute('aria-valuenow'));
  for (let k = 0; k < 120 && Math.abs(now - 13) > 0.001; k += 1) { await page.keyboard.press(now < 13 ? 'ArrowRight' : 'ArrowLeft'); now = Number(await h2.getAttribute('aria-valuenow')); }
  check(Math.abs(now - 13) < 0.001, 'labo متقدم (clavier) : BC = 13');
  await pour(page);
  check(await verdict(page) === 'exact', 'labo متقدم : 5 et 12 → 13 remplit tout juste');
  await vis(page, '[data-pt-next]').click();
  await page.waitForTimeout(300);
  check(await vis(page, '[data-pt-root-locked]').count() === 1, 'labo متقدم : la touche √ est fermée avant deux versements');
  await pour(page);
  await h2.focus(); await page.keyboard.press('ArrowRight');
  await pour(page);
  await vis(page, '[data-pt-root]').click();
  await page.waitForTimeout(200);
  check((await vis(page, '[data-pt-screen]').textContent()).trim() === '3.605551275', 'labo متقدم : l\'écran affiche √13');
  await pour(page);
  check(await verdict(page) === 'exact', 'labo متقدم : √13 remplit tout juste');
  await page.screenshot({ path: `${OUT}/lab-advanced-root-1280.png` });
  await ctx.close();
}

// 5 — D'UN SEUL REGARD aux cinq tailles, aux deux niveaux.
const glanceFits = async (page, label) => {
  const box = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-pt-glance]')].find((e) => e.offsetParent !== null);
    if (!el) return null;
    el.scrollIntoView({ block: 'start', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    return { h: r.height, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.h <= box.vh, `${label}: [data-pt-glance] tient dans l'écran (${box ? `${Math.round(box.h)} / ${box.vh}` : 'absent'})`);
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-pt-glance] reste dans la largeur`);
};
for (const vp of [{ width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1280, height: 800 }, { width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-pythagoras-tanks]');
  await glanceFits(page, `nashat ${vp.width}×${vp.height} مبتدئ`);
  await pour(page);
  await glanceFits(page, `nashat ${vp.width}×${vp.height} مبتدئ après versement`);
  await page.screenshot({ path: `${OUT}/lab-beginner-${vp.width}.png` });
  await pickLevel(page, 'advanced');
  await glanceFits(page, `nashat ${vp.width}×${vp.height} متقدم`);
  await page.screenshot({ path: `${OUT}/lab-advanced-${vp.width}.png` });
  await ctx.close();
}

await browser.close();
console.log(failures.length ? `\n✗ ${failures.length} échec(s)` : '\n✓ tout est vert');
process.exit(failures.length ? 1 : 0);
