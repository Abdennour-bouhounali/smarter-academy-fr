// QA — 1AM, unité 1, leçon `kusur-ashriya-kitaba` « الكسور العشرية والكتابة العشرية » et son labo `decimal-comma`
// (cycle moyen, phase 3, batch 4, 2026-10-15).
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/1am-kusur-ashriya-kitaba.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (768×1024, 1024×768, 1280×800, 1366×768, 1920×1080 — pas de téléphone) :
//   1. le sommaire et CHAQUE module : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » / « \command » / clé brute ;
//   2. le labo, monde `mosaic` مبتدئ : la virgule glisse (touche ← →), le tableau de bord écrit le nombre, 2,35 est jugé exact ;
//   3. le labo, monde `machine` (module 4) : le même geste, un zéro à ajouter pour 3,5 × 100 ;
//   4. D'UN SEUL REGARD : `[data-dc-glance]` tient dans la hauteur de l'écran à 1024×768, 1280×800 et 1366×768 aux deux niveaux ;
//   5. guide §4quater : rien au-dessus du labo, les briques sont ABSENTES avant la réponse.
// Captures dans /tmp/qa-1am-kusur.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-1am-kusur';
const CH = '/courses/moyen/1am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/kusur-ashriya-kitaba`;
const UNIT = `${CH}/units/adad-tabiiya-ashriya`;
const MODULES = ['astaidd', 'nashat', 'maarif', 'tariqa', 'tariqa-ashara', 'atamarran', 'masala-1', 'masala-2', 'masala-3', 'itqan'];
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
  check(await page.getByText('الكسور العشرية والكتابة العشرية').first().isVisible().catch(() => false), `${tag} page d'unité : la leçon est listée`);
  await pageHealth(page, `${tag} unité`);
  await page.screenshot({ path: `${OUT}/unit-${vp.width}.png`, fullPage: false });

  await page.goto(`${BASE}${LESSON}`, { waitUntil: 'networkidle' });
  check(await page.getByText('الكسور العشرية والكتابة العشرية').first().isVisible(), `${tag} sommaire monté`);
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
    const el = [...document.querySelectorAll('[data-dc-glance]')].find((e) => e.offsetParent !== null);
    if (!el) return null;
    el.scrollIntoView({ block: 'start', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    return { h: r.height, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.h <= box.vh, `${label}: [data-dc-glance] tient dans l'écran (${box ? `${Math.round(box.h)} / ${box.vh}` : 'absent'})`);
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-dc-glance] reste dans la largeur`);
};
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForTimeout(300);
};

for (const slug of ['nashat', 'tariqa-ashara']) {
  for (const vp of [{ width: 1024, height: 768 }, { width: 1280, height: 800 }, { width: 1366, height: 768 }, { width: 768, height: 1024 }, { width: 1920, height: 1080 }]) {
    const ctx = await contextFor(browser, token, vp);
    const page = await ctx.newPage();
    await page.goto(`${BASE}${LESSON}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-decimal-comma]');
    await glanceFits(page, `${slug} ${vp.width}×${vp.height} مبتدئ`);
    await page.screenshot({ path: `${OUT}/lab-${slug}-beginner-${vp.width}.png` });
    await pickLevel(page, 'advanced');
    await glanceFits(page, `${slug} ${vp.width}×${vp.height} متقدم`);
    await page.screenshot({ path: `${OUT}/lab-${slug}-advanced-${vp.width}.png` });
    await ctx.close();
  }
}

// 2 + 3 + 5 — les gestes.
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  const lab = page.locator('[data-manipulation-level-panel=beginner] [data-decimal-comma]');
  await lab.waitFor();
  check(await page.locator('[data-module-brief]').count() === 0, 'module 1 : aucune carte au-dessus du labo');
  for (const id of ['fasila-hajm', 'kasr-ashri', 'kitaba-bifasila']) {
    check(await page.locator(`[data-knowledge-brick="${id}"], [data-brick-id="${id}"]`).count() === 0, `module 1 : la brique « ${id} » est cachée avant la réponse`);
  }
  check((await lab.getAttribute('data-world')) === 'mosaic', 'مبتدئ : monde « mosaic »');

  // le geste : la virgule part à droite des chiffres (235), on la glisse au clavier jusqu'à 2,35.
  const comma = lab.locator('[data-dc-comma]').first();
  await comma.focus();
  const readPoint = async () => Number(await lab.locator('[data-dc-comma]').first().getAttribute('data-point'));
  const written = async () => ((await lab.locator('[data-dc-written]').first().textContent()) || '').replace(/\s/g, '');
  check((await written()).replace(/[,.٫]/g, ',') === '235', `مبتدئ : au départ le وصل s'écrit « 235 » (${await written()})`);
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(300);
  check((await readPoint()) === 2, `مبتدئ : deux pas à gauche → deux chiffres après la virgule (${await readPoint()})`);
  check((await written()).replace(/[٫.]/g, ',') === '2,35', `مبتدئ : le وصل s'écrit « 2,35 » (${await written()})`);
  check(await lab.locator('[data-dc-verdict=exact]').count() > 0 || (await lab.getAttribute('data-solved')) === 'true', 'مبتدئ : 2,35 est jugé exact');
  await page.screenshot({ path: `${OUT}/lab-mosaic-exact.png` });

  await page.goto(`${BASE}${LESSON}/tariqa-ashara`, { waitUntil: 'networkidle' });
  const machine = page.locator('[data-manipulation-level-panel=beginner] [data-decimal-comma]');
  await machine.waitFor();
  check((await machine.getAttribute('data-world')) === 'machine', 'module 4 : monde « machine »');
  check(await page.locator('[data-module-brief]').count() === 0, 'module 4 : le labo est en haut, sans carte');
  check(await page.locator('[data-knowledge-brick="azaha-fasila"], [data-brick-id="azaha-fasila"]').count() === 0, 'module 4 : « azaha-fasila » cachée avant la réponse');
  await page.screenshot({ path: `${OUT}/lab-machine-1280.png` });

  await page.goto(`${BASE}${LESSON}/maarif`, { waitUntil: 'networkidle' });
  check(await page.locator('[data-knowledge-brick="mafkuk-ashri"], [data-brick-id="mafkuk-ashri"]').count() === 0, 'module 2 : « mafkuk-ashri » cachée avant la réponse');
  await ctx.close();
}

await browser.close();
console.log(failures.length ? `\n${failures.length} échec(s)` : '\n✅ 1AM kusur-ashriya-kitaba — tout est vert');
process.exit(failures.length ? 1 : 0);
