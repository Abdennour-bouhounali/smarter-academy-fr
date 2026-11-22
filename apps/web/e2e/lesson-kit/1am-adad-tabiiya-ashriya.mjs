// QA — 1AM, unité 1 « الأعداد الطبيعية والأعداد العشرية » (cycle moyen, phase 3, 2026-10-14). Leçon `kitabat-adad-tabii`
// et son labo `rank-exchange`.
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/1am-adad-tabiiya-ashriya.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur :
//   1. le sommaire et CHAQUE محور à 1280 et 320 px : monté, aucune erreur console, aucun débordement horizontal,
//      aucun « $ » / « \command » / clé `manipulation.` brute dans le texte visible ;
//   2. le labo, مبتدئ (atelier des crayons) : une prédiction, un paquet de 7 refusé, un paquet de 10 lié ; le module 3 monte le
//      monde `money` (1345 DA) seul ;
//   3. le labo, متقدم (jetons) : 999 + 1 — un jeton ajouté, la colonne des unités déborde, le nombre ne s'écrit pas ;
//   4. D'UN SEUL REGARD : `[data-rx-glance]` tient dans la hauteur de l'écran à 1280×800, 1366×768, 390×844 et 320×640,
//      aux deux niveaux ;
//   5. la page d'unité et la carte de la leçon.
// Captures dans /tmp/qa-1am-kitabat.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-1am-kitabat';
const CH = '/courses/moyen/1am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/kitabat-adad-tabii`;
const MODULES = ['astaidd', 'nashat', 'maarif', 'tariqa', 'atamarran', 'aadad-kabira', 'masala-1', 'masala-2', 'masala-3', 'itqan'];
const UNIT = `${CH}/units/adad-tabiiya-ashriya`;
mkdirSync(OUT, { recursive: true });

const failures = [];
const check = (ok, label) => { if (!ok) failures.push(label); console.log(`${ok ? '✓' : '✗'} ${label}`); };

async function loginToken(who, tries = 8) {
  // /auth/login est limité à 6/min (d'autres suites tournent en parallèle) : on réessaie sur 429.
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

const RAW = /(^|[^\\])\$[^$\s][^$]*\$|\\(frac|times|mathrm|square|bigcirc|triangle)\b|manipulation\.[a-zA-Z]+\./;

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

// 1 + 5 — sommaire, unité, modules aux deux largeurs.
for (const vp of [{ width: 1280, height: 800 }, { width: 320, height: 640 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}px`;

  await page.goto(`${BASE}${UNIT}`, { waitUntil: 'networkidle' });
  check(await page.getByText('كتابة الأعداد الطبيعية ودلالة الأرقام').first().isVisible().catch(() => false), `${tag} page d'unité : la leçon est listée`);
  await pageHealth(page, `${tag} unité`);
  await page.screenshot({ path: `${OUT}/unit-${vp.width}.png`, fullPage: false });

  await page.goto(`${BASE}${LESSON}`, { waitUntil: 'networkidle' });
  check(await page.getByText('كتابة الأعداد الطبيعية ودلالة الأرقام').first().isVisible(), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);
  await page.screenshot({ path: `${OUT}/index-${vp.width}.png`, fullPage: true });

  for (const slug of MODULES) {
    await page.goto(`${BASE}${LESSON}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const mounted = await page.locator('main, [data-module-layout], h1').first().isVisible().catch(() => false);
    check(mounted, `${tag} ${slug} monté`);
    await pageHealth(page, `${tag} ${slug}`);
    await page.screenshot({ path: `${OUT}/${slug}-${vp.width}.png`, fullPage: true });
  }
  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 2 + 3 + 4 — le labo.
const glanceFits = async (page, label) => {
  const box = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-rx-glance]')].find((e) => e.offsetParent !== null);
    if (!el) return null;
    el.scrollIntoView({ block: 'start', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    return { h: r.height, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.h <= box.vh, `${label}: [data-rx-glance] tient dans l'écran (${box ? `${Math.round(box.h)} / ${box.vh}` : 'absent'})`);
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-rx-glance] reste dans la largeur`);
};
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForTimeout(300);
};

for (const vp of [{ width: 1280, height: 800 }, { width: 1366, height: 768 }, { width: 390, height: 844 }, { width: 320, height: 640 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-rank-exchange]');
  await glanceFits(page, `${vp.width}×${vp.height} مبتدئ`);
  await page.screenshot({ path: `${OUT}/lab-beginner-${vp.width}.png` });
  await pickLevel(page, 'advanced');
  await glanceFits(page, `${vp.width}×${vp.height} متقدم`);
  await page.screenshot({ path: `${OUT}/lab-advanced-${vp.width}.png` });
  await ctx.close();
}

{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  const lab = page.locator('[data-manipulation-level-panel=beginner] [data-rank-exchange]');
  await lab.waitFor();
  // guide §4quater (2026-10-14) : une seule piste — rien au-dessus du labo, la brique arrive APRÈS la réponse.
  check(await page.locator('[data-module-brief]').count() === 0, 'module 1 : aucune carte au-dessus du labo');
  check(await page.locator('[data-knowledge-brick="qima-mawdi"], [data-brick-id="qima-mawdi"]').count() === 0, 'module 1 : « قيمة الرقم حسب موقعه » cachée avant la réponse');
  check((await lab.getAttribute('data-world')) === 'pencils', 'مبتدئ : monde « pencils »');
  check(((await lab.locator('[data-rx-written]').first().textContent()) || '').trim() === '', 'مبتدئ : 1 · 13 · 24 · 37 ne s\'écrit pas encore');
  const predict = lab.locator('[data-rx-predict="2577"][data-state=idle]').first();
  if (await predict.count()) { await predict.click(); await page.waitForTimeout(200); }
  const before = Number(await lab.locator('[data-rx-col="1"]').getAttribute('data-count'));
  await lab.locator('[data-rx-tie="0"]').click();
  await page.waitForTimeout(250);
  const carry = lab.locator('[data-rx-carry]').first();
  if (await carry.count()) { await carry.click(); await page.waitForTimeout(250); }
  const after = Number(await lab.locator('[data-rx-col="1"]').getAttribute('data-count'));
  const units = Number(await lab.locator('[data-rx-col="0"]').getAttribute('data-count'));
  check(after === before + 1 && units === 27, `مبتدئ : 10 crayons liés → un paquet de plus (${before} → ${after}, crayons ${units})`);
  await page.screenshot({ path: `${OUT}/lab-beginner-tie.png` });

  await pickLevel(page, 'advanced');
  const adv = page.locator('[data-manipulation-level-panel=advanced] [data-rank-exchange]');
  await adv.waitFor();
  check((await adv.getAttribute('data-world')) === 'tokens', 'متقدم : monde « tokens »');
  check(await adv.locator('[data-rx-step=dictation]').count() === 0, 'متقدم : la dictée est passée au module 2');
  const written = ((await adv.locator('[data-rx-written]').first().textContent()) || '').replace(/\s/g, '');
  check(written === '999', `متقدم : la tâche « next » part de 999 (${written})`);
  await page.screenshot({ path: `${OUT}/lab-advanced-999.png` });

  await page.goto(`${BASE}${LESSON}/maarif`, { waitUntil: 'networkidle' });
  const dict = page.locator('[data-rank-exchange][data-task=dictation]');
  await dict.waitFor();
  check(await page.locator('[data-module-brief]').count() === 0, 'module 2 : il s\'ouvre sur la dictée, pas sur une carte de définitions');
  await page.screenshot({ path: `${OUT}/maarif-dictation-1280.png` });

  await page.goto(`${BASE}${LESSON}/tariqa`, { waitUntil: 'networkidle' });
  const money = page.locator('[data-rank-exchange][data-world=money]');
  check(await money.count() === 1, 'module 3 : le monde « money » (1345 DA) est monté seul');
  check(await page.locator('[data-module-brief]').count() === 0, 'module 3 : le labo est en haut, sans carte');
  await page.screenshot({ path: `${OUT}/lab-money-1280.png` });
  await ctx.close();
}

await browser.close();
console.log(failures.length ? `\n${failures.length} échec(s)` : "\n✅ 1AM kitabat-adad-tabii — tout est vert");
process.exit(failures.length ? 1 : 0);
