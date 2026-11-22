// QA — 3AM, unité 3 « القوى ذات أسس نسبية صحيحة », leçon `quwat-adad-nisbi` « قوة عدد نسبي » et son labo `power-train`
// (cycle moyen, phase 3, Phase A, 2026-10-21 — la première leçon de 3AM).
//
//   KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/3am-quwa-nisbiya.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (768×1024, 1024×768, 1280×800, 1366×768, 1920×1080) :
//   1. la page d'unité, le sommaire et CHAQUE module à 768 et 1280 px : monté, aucune erreur console, aucun débordement horizontal,
//      aucun « $ » / « \command » / clé brute ;
//   2. le labo au CLAVIER (flèches sur la poignée) et au TOUCHER (−/+, un toucher sur la règle) : (−2)⁴ = 16 coche la tâche,
//      « التالي », (−2)⁵ = −32, aucun wagon → 1 ; au niveau متقدم deux wagons « ÷ (−3) » → 1/9 ; le monde `couple` → exposant 7 ;
//   3. D'UN SEUL REGARD : `[data-pt-glance]` tient dans la hauteur de l'écran aux cinq tailles, aux deux niveaux et au monde `couple` ;
//   4. guide §4quater : rien au-dessus du labo (aucune carte), les briques sont ABSENTES avant la réponse.
// Captures dans /tmp/qa-3am-quwa.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-3am-quwa';
const CH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/quwat-adad-nisbi`;
const UNIT = `${CH}/units/quwa-nisbiya`;
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
    try { localStorage.setItem('token', tk); if (off) localStorage.setItem('sa.labCoach.power-train.off', 'true'); } catch { /* noop */ }
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
  check(await page.getByText('قوة عدد نسبي').first().isVisible().catch(() => false), `${tag} page d'unité : la leçon est listée`);
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

// 3 — D'UN SEUL REGARD, les deux niveaux et le monde `couple`, aux cinq tailles.
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForTimeout(400);
};
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
  await page.waitForSelector('[data-power-train]');
  await glanceFits(page, `nashat ${vp.width}×${vp.height} مبتدئ`);
  await page.screenshot({ path: `${OUT}/lab-beginner-${vp.width}.png` });
  await pickLevel(page, 'advanced');
  await glanceFits(page, `nashat ${vp.width}×${vp.height} متقدم`);
  await page.screenshot({ path: `${OUT}/lab-advanced-${vp.width}.png` });
  await page.goto(`${BASE}${LESSON}/maarif`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-power-train][data-world=couple]');
  await glanceFits(page, `maarif ${vp.width}×${vp.height} couple`);
  await page.screenshot({ path: `${OUT}/lab-couple-${vp.width}.png` });
  await ctx.close();
}

// 2 + 4 — les gestes (clavier et toucher), et la piste unique du module.
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  const lab = page.locator('[data-manipulation-level-panel=beginner] [data-power-train]').first();
  await lab.waitFor();
  check(await page.locator('[data-module-brief]').count() === 0, 'module 1 : aucune carte au-dessus du labo');
  for (const id of ['quwa-taarif', 'ishara-quwa', 'quwa-sifr', 'quwa-salib']) {
    check(await page.locator(`[data-knowledge-brick="${id}"], [data-brick-id="${id}"]`).count() === 0, `module 1 : la brique « ${id} » est cachée avant la réponse`);
  }
  check(await page.locator('[data-manipulation-level-panel=beginner] [data-lab-coach-toggle]').count() === 1, 'مبتدئ : l’interrupteur du LabCoach est sous la question');
  check(await page.locator('[data-lab-coach][data-step=grab]').count() >= 1, 'مبتدئ : le LabCoach montre la poignée');
  await page.getByText('إيقاف الإرشاد').first().click().catch(() => {});
  const readLoad = async () => lab.locator('[data-pt-readout]').getAttribute('data-load');
  check(await readLoad() === '1', 'مبتدئ : le train vide porte 1');
  // clavier : quatre flèches → (−2)⁴ = 16
  const knob = lab.locator('[data-pt-knob]').first();
  await knob.focus();
  for (let i = 0; i < 4; i += 1) await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300);
  check(await readLoad() === '16', `مبتدئ (clavier) : quatre wagons → 16 (${await readLoad()})`);
  check(await lab.locator('[data-pt-wagon]').count() === 4, 'مبتدئ : quatre wagons dessinés');
  check(await lab.locator('[data-pt-pair]').count() === 2, 'مبتدئ : deux paires de wagons négatifs liées');
  check(await lab.locator('[data-pt-prompt][data-lit=true]').count() === 1, 'مبتدئ : la lampe de la question s’allume');
  await page.screenshot({ path: `${OUT}/lab-16.png` });
  await lab.locator('[data-pt-next]').click();
  // toucher : + cinq fois → (−2)⁵ = −32, et le wagon seul marqué
  for (let i = 0; i < 5; i += 1) await lab.locator('[data-pt-more]').click();
  await page.waitForTimeout(300);
  check(await readLoad() === '-32', `مبتدئ (toucher) : cinq wagons → −32 (${await readLoad()})`);
  check(await lab.locator('[data-pt-alone]').count() === 1, 'مبتدئ : le cinquième wagon reste seul (−)');
  await lab.locator('[data-pt-next]').click();
  // toucher sur la règle : la graduation 0 → la locomotive seule porte 1
  const ruler = lab.locator('[data-pt-ruler]').first();
  const tick0 = await lab.locator('[data-pt-tick="0"] line').first().boundingBox();
  const rb = await ruler.boundingBox();
  await page.mouse.click(tick0.x + tick0.width / 2, rb.y + rb.height / 2);
  await page.waitForTimeout(300);
  check(await readLoad() === '1', `مبتدئ (règle) : aucun wagon → 1 (${await readLoad()})`);
  check(await lab.getAttribute('data-solved') === 'true', 'مبتدئ : les trois tâches faites');
  check(await page.locator('[data-manipulation-discovery]').first().isVisible(), 'مبتدئ : la question de découverte apparaît');
  await page.screenshot({ path: `${OUT}/lab-discovery.png` });

  // متقدم : deux wagons « ÷ (−3) » → 1/9
  await pickLevel(page, 'advanced');
  const adv = page.locator('[data-manipulation-level-panel=advanced] [data-power-train]').first();
  for (let i = 0; i < 2; i += 1) await adv.locator('[data-pt-less]').click();
  await page.waitForTimeout(300);
  check(await adv.locator('[data-pt-readout]').getAttribute('data-load') === '1/9', 'متقدم : deux wagons « ÷ (−3) » → 1/9');
  check(await adv.locator('[data-pt-wagon][data-kind=divide]').count() === 2, 'متقدم : deux wagons de division dessinés');
  check(await adv.locator('[data-pt-load]').count() === 0, 'متقدم : aucune charge intermédiaire écrite');

  // معارف : le monde couple, 3 + 4 = 7
  await page.goto(`${BASE}${LESSON}/maarif`, { waitUntil: 'networkidle' });
  const cp = page.locator('[data-power-train][data-world=couple]').first();
  await cp.waitFor();
  await page.getByText('إيقاف الإرشاد').first().click().catch(() => {});
  for (let i = 0; i < 4; i += 1) await cp.locator('[data-pt-more]').click();
  await page.waitForTimeout(300);
  check(await cp.locator('[data-pt-merged]').getAttribute('data-exponent') === '7', 'couple : 2³ × 2⁴ → exposant 7');
  check(await cp.locator('[data-pt-prompt][data-lit=true]').count() === 1, 'couple : la tâche est cochée');
  check(await page.locator('[data-knowledge-brick="jidaa-quwatayn"], [data-brick-id="jidaa-quwatayn"]').count() === 0, 'module 2 : « jidaa-quwatayn » cachée avant la réponse');

  await page.goto(`${BASE}${LESSON}/tariqa`, { waitUntil: 'networkidle' });
  for (const id of ['tariqat-tabsit', 'awlawiya-quwa']) check(await page.locator(`[data-knowledge-brick="${id}"], [data-brick-id="${id}"]`).count() === 0, `module 3 : brique « ${id} » cachée avant la réponse`);
  await ctx.close();
}

await browser.close();
console.log(failures.length ? `\n${failures.length} échec(s)` : '\n✅ 3AM quwat-adad-nisbi — tout est vert');
process.exit(failures.length ? 1 : 0);
