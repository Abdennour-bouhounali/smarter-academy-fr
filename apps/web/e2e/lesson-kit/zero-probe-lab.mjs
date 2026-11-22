// QA du labo `zero-probe` (« المسبار », 2AM unité 3) — captures et mesures aux cinq tailles tablette / ordinateur.
//
//   node apps/web/e2e/lesson-kit/zero-probe-lab.mjs        (Vite sur le port 5173 ; la page de test est e2e/harness/zp.html)
//
// Tailles : 768×1024, 1024×768 (colonne de leçon ≈ 414 px, simulée par la largeur du conteneur), 1280×800, 1366×768, 1920×1080.
// Pour chaque niveau : état initial (guide allumé), un refus, un succès, la tâche impossible (مبتدئ) / le côté libre (متقدم), la phase formelle.
// Mesure : [data-zp-glance] tient dans la hauteur de l'écran, aucun défilement horizontal, aucune erreur console.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// La page de test (aucune leçon ne monte encore le labo) : écrite à côté, supprimée à la fin — `e2e/harness/zp.{html,jsx}`.
const HARNESS = fileURLToPath(new URL('../harness/', import.meta.url));
mkdirSync(HARNESS, { recursive: true });
writeFileSync(`${HARNESS}zp.html`, `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>zp harness</title></head>
<body><div id="root"></div><script type="module" src="/e2e/harness/zp.jsx"></script></body></html>
`);
writeFileSync(`${HARNESS}zp.jsx`, `import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import '../../src/index.css';
import '../../src/i18n/index.js';
import { loadLessonManipulationStrings } from '../../src/i18n/lessonManipulationStrings.js';
import ZeroProbe from '../../src/lessons/common/manipulations/operations/ZeroProbe';

const q = new URLSearchParams(location.search);
const w = Number(q.get('w') || 0);
const level = q.get('level') || 'beginner';
window.__events = [];
await loadLessonManipulationStrings();
ReactDOM.createRoot(document.getElementById('root')).render(
  <MemoryRouter>
    <div style={{ width: w || undefined, margin: '0 auto', padding: 12 }} data-harness>
      <ZeroProbe level={level} onTrial={(e) => window.__events.push(e)} onFinished={(e) => window.__events.push({ finished: e })} />
    </div>
  </MemoryRouter>,
);
`);
process.on('exit', () => { try { rmSync(HARNESS, { recursive: true, force: true }); } catch { /* noop */ } });

const BASE = process.env.KIT_BASE || 'http://localhost:5173';
const OUT = process.env.QA_OUT || '/tmp/qa-zero-probe';
mkdirSync(OUT, { recursive: true });
const SIZES = [
  { name: '768x1024', width: 768, height: 1024, col: 700 },
  { name: '1024x768', width: 1024, height: 768, col: 414 },
  { name: '1280x800', width: 1280, height: 800, col: 780 },
  { name: '1366x768', width: 1366, height: 768, col: 860 },
  { name: '1920x1080', width: 1920, height: 1080, col: 1100 },
];
const only = process.env.QA_ONLY ? process.env.QA_ONLY.split(',') : null;
let ctx2; let page2;
const failures = [];
const check = (ok, label) => { if (!ok) failures.push(label); console.log(`${ok ? '✓' : '✗'} ${label}`); };

const browser = await chromium.launch();

/** Accomplit les tâches d'un niveau par les gestes (−/+, côtés, bouton), puis ouvre la découverte. */
async function finishAll(page, level) {
  const next = async () => { await page.locator('[data-zp-next]').click(); await page.waitForTimeout(150); };
  if (level === 'beginner') {
    await more(page, 4); await next();
    await more(page, 2); await next();
    await more(page, 2); await next();
    await page.locator('[data-zp-none]').click();
  } else {
    await page.locator('[data-zp-side=below]').click();
    await more(page, 44); await next();
    await more(page, 9); await page.locator('[data-zp-side=above]').click(); await next(); // −0,9 puis +0,9, tous deux plus bas que 1,2
    await page.locator('[data-zp-side=below]').click(); await more(page, 3); // B = −0,3
  }
  await page.waitForTimeout(500);
}

async function open(size, level, { coach = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: size.width, height: size.height }, locale: 'ar' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await ctx.addInitScript((on) => { try { if (!on) localStorage.setItem('sa.labCoach.zero-probe.off', 'true'); } catch { /* noop */ } }, coach);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(`${BASE}/e2e/harness/zp.html?level=${level}&w=${size.col}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-zp-glance]');
  await page.waitForTimeout(500);
  return { ctx, page, errors };
}

const more = async (page, n) => { for (let i = 0; i < n; i += 1) await page.locator('[data-zp-more]').click(); };
const less = async (page, n) => { for (let i = 0; i < n; i += 1) await page.locator('[data-zp-less]').click(); };
const shot = async (page, size, level, tag) => { await page.waitForTimeout(350); await page.screenshot({ path: `${OUT}/${level}-${tag}-${size.name}.png` }); };
const glance = async (page, size, level, tag) => {
  const m = await page.evaluate(() => {
    const el = document.querySelector('[data-zp-glance]');
    el.scrollIntoView({ block: 'start', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    return { h: Math.round(r.height), vh: window.innerHeight, over: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });
  check(m.h <= m.vh, `${level} ${tag} ${size.name}: glance ${m.h} / ${m.vh}`);
  check(m.over <= 1, `${level} ${tag} ${size.name}: pas de défilement horizontal (${m.over}px)`);
};

for (const size of SIZES) {
  if (only && !only.includes(size.name)) continue;
  for (const level of ['beginner', 'advanced']) {
    // 1 — initial, guide allumé
    let { ctx, page, errors } = await open(size, level, { coach: true });
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot(page, size, level, '1-initial-coach');
    await glance(page, size, level, 'initial');
    await ctx.close();

    ({ ctx, page, errors } = await open(size, level));
    if (level === 'beginner') {
      // 2 — un refus : 2 m de câble sous le zéro, B est plus HAUT que A (−2 > −3)
      await more(page, 2);
      await shot(page, size, level, '2-refus');
      check((await page.locator('[data-zp-verdict]').getAttribute('data-zp-verdict')) === 'wrong', `${level} ${size.name}: un refus`);
      // 3 — un succès
      await more(page, 2);
      await shot(page, size, level, '3-succes');
      check((await page.locator('[data-zp-verdict]').getAttribute('data-zp-verdict')) === 'right', `${level} ${size.name}: un succès`);
      await glance(page, size, level, 'succes');
      // 4 — jusqu'à la tâche impossible
      await page.locator('[data-zp-next]').click();
      await less(page, 0); await more(page, 2); await page.locator('[data-zp-next]').click();
      await more(page, 2); await page.locator('[data-zp-next]').click();
      await more(page, 3);
      await shot(page, size, level, '4-impossible');
      await page.locator('[data-zp-none]').click();
      await shot(page, size, level, '5-impossible-ok');
      check((await page.locator('[data-zp-prompt]').getAttribute('data-lit')) === 'true', `${level} ${size.name}: la dernière tâche est accomplie par le bouton`);
      await page.waitForTimeout(500);
    } else {
      await page.locator('[data-zp-side=below]').click();
      await more(page, 40);
      await shot(page, size, level, '2-refus');
      await more(page, 4);
      await shot(page, size, level, '3-succes');
      await glance(page, size, level, 'succes');
    }
    // 7 — découverte (une mauvaise réponse, puis la bonne) et phase formelle
    ({ ctx: ctx2, page: page2 } = await (async () => { const o = await open(size, level); return { ctx: o.ctx, page: o.page }; })());
    await finishAll(page2, level);
    await page2.waitForSelector('[data-zp-prompt][data-lit=true], [data-manipulation] [role=radio], [data-manipulation] button', { timeout: 3000 }).catch(() => {});
    const wrong = level === 'beginner' ? 'دائمًا' : 'الأبعد عن الصفر';
    const right = level === 'beginner' ? 'إذا كان تحت الصفر' : 'الذي تحت الصفر';
    await page2.getByText(wrong, { exact: true }).first().click().catch(() => {});
    await page2.waitForTimeout(400);
    await page2.getByText(wrong, { exact: true }).first().scrollIntoViewIfNeeded().catch(() => {});
    await shot(page2, size, level, '7-decouverte-faux');
    await page2.getByText(right, { exact: true }).first().click().catch(() => {});
    await page2.waitForTimeout(500);
    check(await page2.locator('[data-zp-formal]').count() > 0, `${level} ${size.name}: la phase formelle apparaît`);
    await page2.locator('[data-zp-formal]').first().scrollIntoViewIfNeeded().catch(() => {});
    await shot(page2, size, level, '8-formelle');
    await ctx2.close();
    await page.evaluate(() => document.querySelector('[data-zp-free]')?.scrollIntoView({ block: 'center' }));
    await shot(page, size, level, '6-free');
    check(errors.length === 0, `${level} ${size.name}: aucune erreur console ${errors.slice(0, 2).join(' | ')}`);
    await ctx.close();
  }
}
// 8 — la main : glisser le nœud (le câble se déroule, ne traverse jamais le zéro), le clavier, un toucher sur l'échelle
{
  const size = SIZES[2];
  const { ctx, page, errors } = await open(size, 'beginner');
  const knob = page.locator('[data-zp-knob]');
  const box = await knob.boundingBox();
  const cx = box.x + box.width / 2; const cy = box.y + box.height / 2;
  const dOf = async () => Number((await page.locator('[data-zp-cable]').getAttribute('data-d')).replace(',', '.'));
  await page.mouse.move(cx, cy); await page.mouse.down();
  await page.mouse.move(cx, cy + 90, { steps: 8 });
  const mid = await dOf();
  check(mid > 0, `glisser : le câble se déroule pendant le geste (d = ${mid})`);
  check((await page.evaluate(() => window.__events.length)) === 0, 'glisser : aucun essai avant le relâchement');
  await page.mouse.move(cx, cy - 120, { steps: 8 });
  check((await dOf()) === 0, 'glisser : le câble s\'arrête à 0 — il ne traverse jamais le zéro');
  await page.mouse.move(cx, cy + 150, { steps: 8 });
  await page.mouse.up();
  const ev = await page.evaluate(() => window.__events);
  check(ev.length === 1 && ev[0].kind === 'release' && ev[0].side === 'below' && Number(ev[0].d.replace(',', '.')) === (await dOf()), `glisser : UN essai au relâchement ${JSON.stringify(ev[0])}`);
  await knob.focus();
  await page.keyboard.press('End');
  check((await dOf()) === 10, 'clavier : Fin → 10');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Home');
  check((await dOf()) === 0, 'clavier : Origine → 0');
  const ruler = await page.locator('[data-zp-ruler]').boundingBox();
  await page.mouse.click(ruler.x + ruler.width - 20, ruler.y + ruler.height * 0.62);
  check((await dOf()) > 0, 'toucher sur l\'échelle : le nœud y vient');
  check(errors.length === 0, `la main : aucune erreur console ${errors.slice(0, 2).join(' | ')}`);
  await ctx.close();
}
await browser.close();
console.log(failures.length ? `\n${failures.length} échec(s)` : '\ntout est bon');
process.exit(failures.length ? 1 : 0);
