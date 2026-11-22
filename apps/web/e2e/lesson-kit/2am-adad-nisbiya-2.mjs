// QA — 2AM, unité 3 « الأعداد النسبية », leçon `muqarana-nisbiya` « مقارنة وترتيب أعداد نسبية » et son labo `zero-probe`
// (cycle moyen, phase 3, Phase A #7, 2026-10-21 — la première leçon de l'unité).
//
//   KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/2am-adad-nisbiya-2.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (768×1024, 1024×768, 1280×800, 1366×768, 1920×1080) :
//   1. la page d'unité, le sommaire et CHAQUE module à 768 et 1280 px : monté, aucune erreur console, aucun débordement horizontal,
//      aucun « $ » / « \command » / clé brute ;
//   2. le labo au CLAVIER (flèches sur le nœud) et au TOUCHER (−/+) : un câble de 4 sous le zéro (B = −4 plus bas que A = −3) coche la
//      tâche, « التالي », les quatre tâches de مبتدئ, la tâche impossible par le bouton ; au niveau متقدم B = −4,4 entre −4,5 et −4,3 ;
//      le même labo au module 2 (B = −6 entre −7 et −5) ;
//   3. D'UN SEUL REGARD : `[data-zp-glance]` tient dans la hauteur de l'écran aux cinq tailles, aux deux niveaux et au module 2 ;
//   4. guide §4quater : rien au-dessus du labo (aucune carte), les briques sont ABSENTES avant la réponse.
// Captures dans /tmp/qa-2am-muqarana.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-2am-muqarana';
const CH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/muqarana-nisbiya`;
const UNIT = `${CH}/units/adad-nisbiya-2`;
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

async function contextFor(browser, token, viewport, { coachOff = false } = {}) {
  const ctx = await browser.newContext({ viewport, locale: 'ar' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await ctx.addInitScript(([tk, off]) => {
    try { localStorage.setItem('token', tk); if (off) localStorage.setItem('sa.labCoach.zero-probe.off', 'true'); } catch { /* noop */ }
  }, [token, coachOff]);
  return ctx;
}

const RAW = /(^|[^\\])\$[^$\s][^$]*\$|\\(frac|times|mathrm|div|left|right)\b|manipulation\.[a-zA-Z]+\./;

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

// 1 — unité, sommaire, modules aux tailles ordinateur et tablette.
for (const vp of [{ width: 1280, height: 800 }, { width: 768, height: 1024 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}px`;

  await page.goto(`${BASE}${UNIT}`, { waitUntil: 'networkidle' });
  check(await page.getByText('مقارنة وترتيب أعداد نسبية').first().isVisible().catch(() => false), `${tag} page d'unité : la leçon est listée`);
  check(await page.locator(`a[href="${LESSON}"]`).count() >= 1, `${tag} page d'unité : la leçon est un lien`);
  await pageHealth(page, `${tag} unité`);
  await page.screenshot({ path: `${OUT}/unit-${vp.width}.png`, fullPage: false });

  await page.goto(`${BASE}${LESSON}`, { waitUntil: 'networkidle' });
  check(await page.locator('main').first().isVisible(), `${tag} sommaire monté`);
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

// 3 — D'UN SEUL REGARD, les deux niveaux et le module 2, aux cinq tailles.
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForTimeout(400);
};
const glanceFits = async (page, label) => {
  const box = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-zp-glance]')].find((e) => e.offsetParent !== null);
    if (!el) return null;
    el.scrollIntoView({ block: 'start', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    return { h: r.height, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.h <= box.vh, `${label}: [data-zp-glance] tient dans l'écran (${box ? `${Math.round(box.h)} / ${box.vh}` : 'absent'})`);
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-zp-glance] reste dans la largeur`);
};
for (const vp of [{ width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1280, height: 800 }, { width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-zero-probe]');
  await glanceFits(page, `nashat ${vp.width}×${vp.height} مبتدئ`);
  await page.screenshot({ path: `${OUT}/lab-beginner-${vp.width}.png` });
  await pickLevel(page, 'advanced');
  await glanceFits(page, `nashat ${vp.width}×${vp.height} متقدم`);
  await page.screenshot({ path: `${OUT}/lab-advanced-${vp.width}.png` });
  await page.goto(`${BASE}${LESSON}/maarif`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-zero-probe]');
  await glanceFits(page, `maarif ${vp.width}×${vp.height} insertion`);
  await page.screenshot({ path: `${OUT}/lab-insert-${vp.width}.png` });
  await ctx.close();
}

// 2 + 4 — les gestes (clavier et toucher), et la piste unique du module.
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  const lab = page.locator('[data-manipulation-level-panel=beginner] [data-zero-probe]').first();
  await lab.waitFor();
  check(await page.locator('[data-module-brief]').count() === 0, 'module 1 : aucune carte au-dessus du labo');
  for (const id of ['salibayn', 'mujabayn', 'mukhtalifayn']) {
    check(await page.locator(`[data-knowledge-brick="${id}"], [data-brick-id="${id}"]`).count() === 0, `module 1 : la brique « ${id} » est cachée avant la réponse`);
  }
  check(await page.locator('[data-manipulation-level-panel=beginner] [data-lab-coach-toggle]').count() === 1, 'مبتدئ : l’interrupteur du LabCoach est sous la question');
  check(await page.locator('[data-lab-coach]').count() >= 1, 'مبتدئ : le LabCoach montre le prochain geste');
  await page.getByText('إيقاف الإرشاد').first().click().catch(() => {});
  const nextBtn = lab.locator('[data-zp-next]');
  const more = async (n) => { for (let i = 0; i < n; i += 1) await lab.locator('[data-zp-more]').click(); };
  const verdict = async () => lab.locator('[data-zp-verdict]').getAttribute('data-zp-verdict');
  // tâche 1 : A = −3, côté imposé « تحت », plus bas : un câble de 2 refuse (B = −2 est plus haut), un câble de 4 réussit
  await more(2);
  check(await verdict() === 'wrong', 'مبتدئ : B = −2 est plus haut que A = −3, refusé');
  await more(2);
  check(await verdict() === 'right', 'مبتدئ : B = −4 est plus bas que A = −3, accepté');
  check(await lab.locator('[data-zp-prompt][data-lit=true]').count() === 1, 'مبتدئ : la lampe de la question s’allume');
  await page.screenshot({ path: `${OUT}/lab-task1.png` });
  await nextBtn.click();
  // tâche 2 : plus haut que −3 sous le zéro : un câble de 2
  await more(2);
  check(await verdict() === 'right', 'مبتدئ : B = −2 est plus haut que A = −3');
  await nextBtn.click();
  // tâche 3 : A = 4 au-dessus, plus bas : un câble de 2
  await more(2);
  check(await verdict() === 'right', 'مبتدئ : B = +2 est plus bas que A = 4');
  await nextBtn.click();
  // tâche 4 : A = 2, B sous le zéro, plus haut : impossible — un essai est refusé, puis le bouton
  await more(3);
  check(await verdict() === 'wrong', 'مبتدئ : B sous le zéro n’est jamais plus haut que A = 2');
  await lab.locator('[data-zp-none]').click();
  await page.waitForTimeout(400);
  check(await lab.getAttribute('data-solved') === 'true', 'مبتدئ : les quatre tâches faites');
  check(await page.locator('[data-manipulation-discovery]').first().isVisible(), 'مبتدئ : la question de découverte apparaît');
  await page.screenshot({ path: `${OUT}/lab-discovery.png` });

  // متقدم : B = −4,4 entre −4,5 et −4,3
  await pickLevel(page, 'advanced');
  const adv = page.locator('[data-manipulation-level-panel=advanced] [data-zero-probe]').first();
  await adv.locator('[data-zp-side=below]').click();
  for (let i = 0; i < 44; i += 1) await adv.locator('[data-zp-more]').click();
  await page.waitForTimeout(300);
  check(await adv.locator('[data-zp-verdict]').getAttribute('data-zp-verdict') === 'right', 'متقدم : B = −4,4 est entre −4,5 et −4,3');
  check(await adv.locator('[data-zp-prompt][data-lit=true]').count() === 1, 'متقدم : la lampe de la première tâche s’allume');

  // معارف : le même labo, B entre −7 et −5 puis les questions
  await page.goto(`${BASE}${LESSON}/maarif`, { waitUntil: 'networkidle' });
  const cp = page.locator('[data-zero-probe]').first();
  await cp.waitFor();
  await page.getByText('إيقاف الإرشاد').first().click().catch(() => {});
  await cp.locator('[data-zp-side=below]').click();
  for (let i = 0; i < 6; i += 1) await cp.locator('[data-zp-more]').click();
  await page.waitForTimeout(300);
  check(await cp.locator('[data-zp-verdict]').getAttribute('data-zp-verdict') === 'right', 'module 2 : B = −6 est entre −7 et −5');
  check(await page.locator('[data-knowledge-brick="tartib"], [data-brick-id="tartib"]').count() === 0, 'module 2 : « tartib » cachée avant la réponse');

  await page.goto(`${BASE}${LESSON}/tariqa`, { waitUntil: 'networkidle' });
  for (const id of ['tariqa']) check(await page.locator(`[data-knowledge-brick="${id}"], [data-brick-id="${id}"]`).count() === 0, `module 3 : brique « ${id} » cachée avant la réponse`);
  await ctx.close();
}

await browser.close();
console.log(failures.length ? `\n${failures.length} échec(s)` : '\n✅ 2AM muqarana-nisbiya — tout est vert');
process.exit(failures.length ? 1 : 0);
