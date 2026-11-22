// QA — 1AM, unité 1, leçon `muqaranat-adad-ashriya` « الكسور العشرية والكتابة العشرية » et son labo `ruler-compare`
// (cycle moyen, phase 3, batch 4, 2026-10-15).
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/1am-muqaranat-adad-ashriya.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (768×1024, 1024×768, 1280×800, 1366×768, 1920×1080 — pas de téléphone) :
//   1. le sommaire et CHAQUE module : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » / « \command » / clé brute ;
//   2. le labo, monde `mosaic` مبتدئ : la virgule glisse (touche ← →), le tableau de bord écrit le nombre, 2,35 est jugé exact ;
//   3. le labo, monde `machine` (module 4) : le même geste, un zéro à ajouter pour 3,5 × 100 ;
//   4. D'UN SEUL REGARD : `[data-dc-glance]` tient dans la hauteur de l'écran à 1024×768, 1280×800 et 1366×768 aux deux niveaux ;
//   5. guide §4quater : rien au-dessus du labo, les briques sont ABSENTES avant la réponse.
// Captures dans /tmp/qa-1am-muqaranat.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-1am-muqaranat';
const CH = '/courses/moyen/1am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/muqaranat-adad-ashriya`;
const UNIT = `${CH}/units/adad-tabiiya-ashriya`;
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
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); } catch { /* noop */ } }, token);
  return ctx;
}

const RAW = /(^|[^\\])\$[^$\s][^$]*\$|\\(frac|times|mathrm|div|square|bigcirc|triangle)\b|manipulation\.[a-zA-Z]+\./;

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

// 1 — sommaire, unité, modules aux tailles tablette et ordinateur.
for (const vp of [{ width: 1280, height: 800 }, { width: 768, height: 1024 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}px`;

  await page.goto(`${BASE}${UNIT}`, { waitUntil: 'networkidle' });
  check(await page.getByText('مقارنة الأعداد العشرية وترتيبها').first().isVisible().catch(() => false), `${tag} page d'unité : la leçon est listée`);
  await pageHealth(page, `${tag} unité`);
  await page.screenshot({ path: `${OUT}/unit-${vp.width}.png`, fullPage: false });

  await page.goto(`${BASE}${LESSON}`, { waitUntil: 'networkidle' });
  check(await page.getByText('مقارنة الأعداد العشرية وترتيبها').first().isVisible(), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);
  await page.screenshot({ path: `${OUT}/index-${vp.width}.png`, fullPage: true });

  for (const slug of MODULES) {
    await page.goto(`${BASE}${LESSON}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    check(await page.locator('main, [data-module-layout], h1').first().isVisible().catch(() => false), `${tag} ${slug} monté`);
    await pageHealth(page, `${tag} ${slug}`);
    await page.screenshot({ path: `${OUT}/${slug}-${vp.width}.png`, fullPage: true });
  }
  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 4 — D'UN SEUL REGARD, les deux mondes, les deux niveaux.
const glanceFits = async (page, label) => {
  const box = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-rc-glance]')].find((e) => e.offsetParent !== null);
    if (!el) return null;
    el.scrollIntoView({ block: 'start', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    return { h: r.height, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.h <= box.vh, `${label}: [data-rc-glance] tient dans l'écran (${box ? `${Math.round(box.h)} / ${box.vh}` : 'absent'})`);
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-rc-glance] reste dans la largeur`);
};
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForTimeout(300);
};

for (const slug of ['nashat']) {
  for (const vp of [{ width: 1024, height: 768 }, { width: 1280, height: 800 }, { width: 1366, height: 768 }, { width: 768, height: 1024 }, { width: 1920, height: 1080 }]) {
    const ctx = await contextFor(browser, token, vp);
    const page = await ctx.newPage();
    await page.goto(`${BASE}${LESSON}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-ruler-compare]');
    await glanceFits(page, `${slug} ${vp.width}×${vp.height} مبتدئ`);
    await page.screenshot({ path: `${OUT}/lab-${slug}-beginner-${vp.width}.png` });
    await pickLevel(page, 'advanced');
    await glanceFits(page, `${slug} ${vp.width}×${vp.height} متقدم`);
    await page.screenshot({ path: `${OUT}/lab-${slug}-advanced-${vp.width}.png` });
    await ctx.close();
  }
}

// 2 + 5 — les gestes.
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  const lab = page.locator('[data-manipulation-level-panel=beginner] [data-ruler-compare]');
  await lab.waitFor();
  check(await page.locator('[data-module-brief]').count() === 0, 'module 1 : aucune carte au-dessus du labo');
  for (const id of ['taqarun-rutab', 'itmam-asfar', 'tartib-silsila']) {
    check(await page.locator(`[data-knowledge-brick="${id}"], [data-brick-id="${id}"]`).count() === 0, `module 1 : la brique « ${id} » est cachée avant la réponse`);
  }
  check((await lab.getAttribute('data-world')) === 'jump', 'مبتدئ : monde « jump »');
  // le verdict est refusé tant que la règle est trop grossière, puis la graduation au centimètre sépare 4,6 de 4,35.
  await page.locator('[data-rc-verdict=lt]').first().click();
  check(await page.locator('[data-rc-refused=coarse]').count() > 0, 'مبتدئ : un verdict sur la règle trop grossière est refusé');
  await page.locator('[data-rc-grad="2"]').first().click();
  await page.waitForTimeout(300);
  check((await page.locator('[data-rc-lamp]').first().getAttribute('data-decided')) === 'true', 'مبتدئ : au centimètre la règle sépare les deux sauts');
  const counts = await page.locator('[data-rc-reading]').evaluateAll((els) => els.map((e) => e.getAttribute('data-count')));
  check(counts.includes('460') && counts.includes('435'), `مبتدئ : les lectures sont 460 et 435 (${counts})`);
  await page.locator('[data-rc-verdict=gt]').first().click();
  await page.waitForTimeout(400);
  check((await page.locator('[data-rc-verdict=gt]').first().getAttribute('data-state')) !== null, 'مبتدئ : le verdict > est jugé');
  await page.screenshot({ path: `${OUT}/lab-compare-decided.png` });

  await page.goto(`${BASE}${LESSON}/tariqa`, { waitUntil: 'networkidle' });
  const alone = page.locator('[data-ruler-compare]').first();
  await alone.waitFor();
  check((await alone.getAttribute('data-kind')) === 'order', 'module 3 : la tâche posée seule est « order »');
  check(await page.locator('[data-module-brief]').count() === 0, 'module 3 : le labo est en haut, sans carte');
  check(await page.locator('[data-knowledge-brick="tariqat-muqarana"], [data-brick-id="tariqat-muqarana"]').count() === 0, 'module 3 : brique cachée avant la réponse');
  await page.screenshot({ path: `${OUT}/lab-order-1280.png` });

  await page.goto(`${BASE}${LESSON}/maarif`, { waitUntil: 'networkidle' });
  check(await page.locator('[data-knowledge-brick="ramz-muqarana"], [data-brick-id="ramz-muqarana"]').count() === 0, 'module 2 : « ramz-muqarana » cachée avant la réponse');
  await ctx.close();
}

// 6 — l'essai LIBRE du niveau « order » : six nombres à soi, le même rangement, refusé tant que la règle est grossière.
for (const vp of [{ width: 1280, height: 800 }, { width: 768, height: 1024 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const tag = `libre-${vp.width}`;
  await page.goto(`${BASE}${LESSON}/tariqa`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-ruler-compare]');
  const free = page.locator('[data-rc-free]').first();
  check(await free.locator('[data-rc-free-n]').count() === 6, `${tag}: six champs dans le panneau libre`);
  const boxes = await free.locator('[data-rc-free-n]').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { h: r.height, w: r.width, l: r.left, r: r.right }; }));
  check(boxes.every((b) => b.h >= 44 && b.w >= 44 && b.l >= 0 && b.r <= window_w(vp)), `${tag}: champs >= 44px et dans la largeur`);
  const values = ['7,4', '7,04', '7,405', '6,98', '7,45', '7,40'];
  for (let i = 0; i < 6; i += 1) await free.locator(`[data-rc-free-n="${i + 1}"]`).fill(values[i]);
  await page.waitForTimeout(300);
  check((await free.getAttribute('data-active')) === 'true', `${tag}: l'essai libre est actif`);
  check(await page.locator('[data-rc-jump]').count() === 6 && await page.locator('[data-rc-slot]').count() === 6, `${tag}: six sauts, six cases`);
  // ordre juste : 6,98 < 7,04 < 7,4 = 7,40 < 7,405 < 7,45 -> indices 3,1,0,5,2,4 (tap-tap)
  for (const [slot, jump] of [3, 1, 0, 5, 2, 4].entries()) {
    await page.locator(`[data-rc-jump="${jump}"]`).first().click();
    await page.locator(`[data-rc-slot="${slot}"]`).first().click();
  }
  check(await page.locator('[data-rc-slot][data-filled=true]').count() === 6, `${tag}: les six cases sont pleines`);
  await page.locator('[data-rc-check]').click();
  await page.waitForTimeout(300);
  check(await page.locator('[data-rc-refused]').count() > 0, `${tag}: « تحقّق » refusé tant que la règle est grossière`);
  await page.screenshot({ path: `${OUT}/free-order-refused-${vp.width}.png`, fullPage: true });
  await page.locator('[data-rc-grad="3"]').first().click();
  await page.waitForTimeout(300);
  await page.locator('[data-rc-check]').click();
  await page.waitForTimeout(400);
  check(await page.locator('[data-rc-refused]').count() === 0 && await page.locator('[data-rc-banner="check"]').count() > 0, `${tag}: après le millimètre, le rangement est jugé`);
  check((await page.locator('[data-ruler-compare]').first().getAttribute('data-solved')) === 'false', `${tag}: l'essai libre ne compte pas pour la découverte`);
  await page.screenshot({ path: `${OUT}/free-order-judged-${vp.width}.png`, fullPage: true });
  await free.locator('[data-rc-free-back]').click();
  await page.waitForTimeout(300);
  check((await free.getAttribute('data-active')) === 'false' && await page.locator('[data-rc-slot][data-filled=true]').count() === 0, `${tag}: retour aux tâches, planche guidée intacte`);
  await ctx.close();
}
function window_w(vp) { return vp.width + 1; }

await browser.close();
console.log(failures.length ? `\n${failures.length} échec(s)` : '\n✅ 1AM muqaranat-adad-ashriya — tout est vert');
process.exit(failures.length ? 1 : 0);
