// QA du labo `fourth-gauges` (« موازين الرابع المتناسب », 2AM unité 5) — captures et mesures aux cinq tailles tablette / ordinateur.
//
//   node apps/web/e2e/lesson-kit/fourth-gauges-lab.mjs        (Vite sur le port 5173 ; la page de test est e2e/harness/fg.html)
//
// Tailles : 768×1024, 1024×768 (colonne de leçon ≈ 414 px, simulée par la largeur du conteneur), 1280×800, 1366×768, 1920×1080.
// Pour chaque niveau : état initial (guide allumé), mi-activité (balances ouvertes qui penchent / voilées puis dévoilées), un refus, la
// balance ouverte (« الجداءان »), le leurre (مبتدئ), un succès, la découverte, la phase formelle, le panneau libre (exact et 10/3).
// Mesure : [data-fg-glance] tient dans la hauteur de l'écran, aucun défilement horizontal, aucune erreur console, la bulle du coach ne
// couvre ni la planche, ni la règle, ni les balances. Gestes : glisser la poignée, clavier, saisie, toucher sur la règle.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// La page de test (aucune leçon ne monte encore le labo) : écrite à côté, supprimée à la fin — `e2e/harness/fg.{html,jsx}`.
const HARNESS = fileURLToPath(new URL('../harness/', import.meta.url));
mkdirSync(HARNESS, { recursive: true });
writeFileSync(`${HARNESS}fg.html`, `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>fg harness</title></head>
<body><div id="root"></div><script type="module" src="/e2e/harness/fg.jsx"></script></body></html>
`);
writeFileSync(`${HARNESS}fg.jsx`, `import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import '../../src/index.css';
import '../../src/i18n/index.js';
import { loadLessonManipulationStrings } from '../../src/i18n/lessonManipulationStrings.js';
import FourthGauges from '../../src/lessons/common/manipulations/operations/FourthGauges';

const q = new URLSearchParams(location.search);
const w = Number(q.get('w') || 0);
const level = q.get('level') || 'beginner';
window.__events = [];
await loadLessonManipulationStrings();
ReactDOM.createRoot(document.getElementById('root')).render(
  <MemoryRouter>
    <div style={{ width: w || undefined, margin: '0 auto', padding: 12 }} data-harness>
      <FourthGauges level={level} onTrial={(e) => window.__events.push(e)} onFinished={(e) => window.__events.push({ finished: e })} />
    </div>
  </MemoryRouter>,
);
`);
process.on('exit', () => { try { rmSync(`${HARNESS}fg.html`, { force: true }); rmSync(`${HARNESS}fg.jsx`, { force: true }); } catch { /* noop */ } });

const BASE = process.env.KIT_BASE || 'http://localhost:5173';
const OUT = process.env.QA_OUT || '/tmp/claude-1000/-home-abdennour-Projects-smarter-academy-smarter-academy-dz/7501d2eb-d034-4a31-b78e-4726647b9c56/scratchpad/qa-fourth-gauges';
mkdirSync(OUT, { recursive: true });
const SIZES = [
  { name: '768x1024', width: 768, height: 1024, col: 700 },
  { name: '1024x768', width: 1024, height: 768, col: 414 },
  { name: '1280x800', width: 1280, height: 800, col: 780 },
  { name: '1366x768', width: 1366, height: 768, col: 860 },
  { name: '1920x1080', width: 1920, height: 1080, col: 1100 },
];
const only = process.env.QA_ONLY ? process.env.QA_ONLY.split(',') : null;
const failures = [];
const check = (ok, label) => { if (!ok) failures.push(label); console.log(`${ok ? '✓' : '✗'} ${label}`); };

const browser = await chromium.launch();

async function open(size, level, { coach = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: size.width, height: size.height }, locale: 'ar' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await ctx.addInitScript((on) => { try { if (!on) localStorage.setItem('sa.labCoach.fourth-gauges.off', '1'); } catch { /* noop */ } }, coach);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(`${BASE}/e2e/harness/fg.html?level=${level}&w=${size.col}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-fg-glance]');
  await page.waitForTimeout(500);
  return { ctx, page, errors };
}

const focusLab = (page) => page.evaluate(() => { document.querySelector('[data-fg-glance]')?.scrollIntoView({ block: 'start', behavior: 'instant' }); });
const typeValue = async (page, v) => {
  const input = page.locator('[data-fg-input]');
  await input.click();
  await input.fill(v);
  await input.press('Enter');
  await page.waitForTimeout(160);
};
const shot = async (page, size, level, tag, { free = false, formal = false } = {}) => {
  // la scène est mise en haut de l'écran (comme l'élève la regarde) ; le panneau libre / le دفتر : centrés
  await page.evaluate(([f, d]) => {
    const el = document.querySelector(f ? '[data-fg-free]' : d ? '[data-fg-formal]' : '[data-fg-glance]');
    el?.scrollIntoView({ block: f || d ? 'center' : 'start', behavior: 'instant' });
  }, [free, formal]);
  await page.waitForTimeout(420);
  await page.screenshot({ path: `${OUT}/${level}-${tag}-${size.name}.png` });
};
const glance = async (page, size, level, tag) => {
  const m = await page.evaluate(() => {
    const el = document.querySelector('[data-fg-glance]');
    el.scrollIntoView({ block: 'start', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    return { h: Math.round(r.height), vh: window.innerHeight, over: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });
  check(m.h <= m.vh, `${level} ${tag} ${size.name}: glance ${m.h} / ${m.vh}`);
  check(m.over <= 1, `${level} ${tag} ${size.name}: pas de défilement horizontal (${m.over}px)`);
};
const state = (page, sel, attr) => page.locator(sel).first().getAttribute(attr);

async function finishAll(page, level) {
  const next = async () => { await page.locator('[data-fg-next]').click(); await page.waitForTimeout(150); };
  if (level === 'beginner') {
    await typeValue(page, '780'); await next();
    await typeValue(page, '5'); await next();
    await typeValue(page, '404'); await typeValue(page, '600');
  } else {
    await typeValue(page, '520'); await next();
    await typeValue(page, '1800'); await next();
    await typeValue(page, '3'); await next();
    await typeValue(page, '4,5');
  }
  await page.waitForTimeout(500);
}

for (const size of SIZES) {
  if (only && !only.includes(size.name)) continue;
  for (const level of ['beginner', 'advanced']) {
    // 1 — initial, guide allumé
    let { ctx, page, errors } = await open(size, level, { coach: true });
    await shot(page, size, level, '1-initial-coach');
    await glance(page, size, level, 'initial');
    // la bulle du coach ne couvre ni la planche, ni la règle, ni les balances
    const cover = await page.evaluate(() => {
      const bubble = document.querySelector('[data-lab-coach]')?.getBoundingClientRect();
      if (!bubble) return { bubble: false };
      const hit = [];
      for (const sel of ['[data-fg-cell]', '[data-fg-knob]', '[data-fg-ruler]', '[data-fg-gauge]']) {
        for (const el of document.querySelectorAll(sel)) {
          const r = el.getBoundingClientRect();
          const w = Math.min(r.right, bubble.right) - Math.max(r.left, bubble.left);
          const h = Math.min(r.bottom, bubble.bottom) - Math.max(r.top, bubble.top);
          if (w > 4 && h > 4 && sel !== '[data-fg-ruler]') hit.push(sel);
        }
      }
      return { bubble: true, hit };
    });
    check(cover.bubble, `${level} ${size.name}: le coach montre la poignée`);
    check((cover.hit ?? []).length === 0, `${level} ${size.name}: la bulle du coach ne couvre ni la planche, ni les balances (${(cover.hit ?? []).join(',')})`);
    await ctx.close();

    ({ ctx, page, errors } = await open(size, level));
    await focusLab(page);
    if (level === 'beginner') {
      // 2 — mi-activité ouverte : la poignée à 40 % de la règle, les balances penchent sous le doigt (pendant le glissement)
      const knob = await page.locator('[data-fg-knob]').boundingBox();
      const ruler = await page.locator('[data-fg-ruler]').boundingBox();
      const cx = knob.x + knob.width / 2; const cy = knob.y + knob.height / 2;
      await page.mouse.move(cx, cy); await page.mouse.down();
      await page.mouse.move(ruler.x + 32 + (ruler.width - 64) * 0.4, cy, { steps: 8 });
      await shot(page, size, level, '2-glisse-ouvert');
      check((await state(page, '[data-fg-gauge=unit]', 'data-state')) === 'gt', `${level} ${size.name}: en glissant, les balances penchent en direct`);
      check((await page.evaluate(() => window.__events.length)) === 0, `${level} ${size.name}: aucun essai avant le relâchement`);
      await page.mouse.up();
      await page.waitForTimeout(250);
      check((await state(page, '[data-fg-verdict]', 'data-fg-verdict')) === 'wrong', `${level} ${size.name}: un refus après le relâchement`);
      // la balance « الجداءان » s'ouvre d'un toucher : ses deux nombres s'écrivent
      await page.locator('[data-fg-gauge-hit=cross]').click();
      await shot(page, size, level, '3-refus-balance-ouverte');
      check((await state(page, '[data-fg-gauge=cross]', 'data-open')) === 'true', `${level} ${size.name}: la balance s'ouvre`);
      await glance(page, size, level, 'refus');
      // un succès
      await typeValue(page, '780');
      await shot(page, size, level, '4-succes');
      check((await state(page, '[data-fg-verdict]', 'data-fg-verdict')) === 'right', `${level} ${size.name}: un succès`);
      check((await state(page, '[data-fg-lamp][data-lit=true]', 'data-lit')) === 'true', `${level} ${size.name}: les lampes s'allument`);
      check((await page.locator('[data-fg-gauge][data-state=eq]').count()) === 3, `${level} ${size.name}: les trois balances sont équilibrées`);
      await glance(page, size, level, 'succes');
      // jusqu'au leurre
      await page.locator('[data-fg-next]').click(); await typeValue(page, '5'); await page.locator('[data-fg-next]').click();
      await shot(page, size, level, '5-leurre-initial');
      await glance(page, size, level, 'leurre-initial');
      await typeValue(page, '404');
      await shot(page, size, level, '6-leurre');
      check((await state(page, '[data-fg-verdict]', 'data-fg-verdict')) === 'decoy', `${level} ${size.name}: le leurre allume « الفرق » seul`);
      check((await state(page, '[data-fg-gauge=diff]', 'data-state')) === 'eq', `${level} ${size.name}: la balance « الفرق » est équilibrée à 404`);
      await glance(page, size, level, 'leurre');
      await typeValue(page, '600');
      check((await page.locator('[data-fg-prompt]').getAttribute('data-lit')) === 'true', `${level} ${size.name}: la dernière tâche est accomplie`);
      await shot(page, size, level, '7-leurre-succes');
    } else {
      // 2 — voilé : rien ne penche tant qu'on ne relâche pas
      await shot(page, size, level, '2-voile');
      check((await page.locator('[data-fg-gauge][data-state=covered]').count()) === 3, `${level} ${size.name}: les trois balances sont voilées`);
      const knob = await page.locator('[data-fg-knob]').boundingBox();
      const ruler = await page.locator('[data-fg-ruler]').boundingBox();
      const cx = knob.x + knob.width / 2; const cy = knob.y + knob.height / 2;
      await page.mouse.move(cx, cy); await page.mouse.down();
      await page.mouse.move(ruler.x + 32 + (ruler.width - 64) * 0.35, cy, { steps: 8 });
      check((await page.locator('[data-fg-gauge][data-state=covered]').count()) === 3, `${level} ${size.name}: toujours voilées pendant le glissement`);
      await page.mouse.up();
      await page.waitForTimeout(250);
      await shot(page, size, level, '3-devoile-refus');
      check((await page.locator('[data-fg-gauge][data-state=covered]').count()) === 0, `${level} ${size.name}: dévoilées au relâchement`);
      check((await state(page, '[data-fg-verdict]', 'data-fg-verdict')) === 'wrong', `${level} ${size.name}: un refus`);
      await glance(page, size, level, 'refus');
      await typeValue(page, '520');
      await shot(page, size, level, '4-succes');
      check((await state(page, '[data-fg-verdict]', 'data-fg-verdict')) === 'right', `${level} ${size.name}: un succès`);
      await glance(page, size, level, 'succes');
      await page.locator('[data-fg-next]').click(); await page.waitForTimeout(250);
      await shot(page, size, level, '5-tache2-revoilee');
      check((await page.locator('[data-fg-gauge][data-state=covered]').count()) === 3, `${level} ${size.name}: revoilées à la tâche suivante`);
    }
    // 8 — panneau libre : exact puis 10/3
    await page.evaluate(() => document.querySelector('[data-fg-free]')?.scrollIntoView({ block: 'center' }));
    await page.locator('[data-fg-free-a]').fill('5'); await page.locator('[data-fg-free-b]').fill('625'); await page.locator('[data-fg-free-c]').fill('6');
    await page.waitForTimeout(300);
    check((await state(page, '[data-fg-free]', 'data-active')) === 'true', `${level} ${size.name}: le panneau libre prend la scène`);
    await page.evaluate(() => document.querySelector('[data-fourth-gauges]')?.scrollIntoView({ block: 'start' }));
    await typeValue(page, '750');
    await shot(page, size, level, '8-libre-exact');
    check((await state(page, '[data-fg-verdict]', 'data-fg-verdict')) === 'free', `${level} ${size.name}: l'essai libre juste`);
    await page.locator('[data-fg-free-a]').fill('3'); await page.locator('[data-fg-free-b]').fill('10'); await page.locator('[data-fg-free-c]').fill('1');
    await page.waitForTimeout(300);
    await typeValue(page, '3,33');
    await page.evaluate(() => document.querySelector('[data-fg-free]')?.scrollIntoView({ block: 'center' }));
    await shot(page, size, level, '9-libre-infini', { free: true });
    check((await page.locator('[data-fg-free-note=infinite]').count()) === 1, `${level} ${size.name}: 10/3 ne s'écrit pas en décimal`);
    await page.waitForTimeout(300);
    const ev = await page.evaluate(() => window.__events);
    check(ev.some((e) => e.kind === 'infinite' && e.free), `${level} ${size.name}: l'événement infinite`);
    check(errors.length === 0, `${level} ${size.name}: aucune erreur console ${errors.slice(0, 2).join(' | ')}`);
    await ctx.close();

    // 10 — découverte (une mauvaise réponse, puis la bonne) et phase formelle
    const o = await open(size, level);
    await finishAll(o.page, level);
    const wrong = level === 'beginner' ? 'تتوازن واحدة في كل مرّة' : 'يكفي دائمًا: الفرق بين الكمّيتين هو الفرق بين الثمنين';
    const right = level === 'beginner' ? 'تتوازن معًا عند ثمن واحد فقط' : 'لأنّ الثمن يُضرب في العدد نفسه الذي تُضرب به الكمّية';
    await o.page.getByText(right, { exact: true }).first().waitFor({ timeout: 8000 }).catch(() => {});
    await o.page.getByText(wrong, { exact: true }).first().click().catch(() => {});
    await o.page.waitForTimeout(400);
    await o.page.getByText(wrong, { exact: true }).first().scrollIntoViewIfNeeded().catch(() => {});
    await o.page.waitForTimeout(300);
    await o.page.screenshot({ path: `${OUT}/${level}-10-decouverte-faux-${size.name}.png` });
    await o.page.getByText(right, { exact: true }).first().click().catch(() => {});
    await o.page.locator('[data-fg-formal]').first().waitFor({ timeout: 8000 }).catch(() => {});
    await o.page.waitForTimeout(400);
    check(await o.page.locator('[data-fg-formal]').count() > 0, `${level} ${size.name}: la phase formelle apparaît`);
    await shot(o.page, size, level, '11-formelle', { formal: true });
    check((await o.page.locator('[data-fg-route]').count()) >= 4, `${level} ${size.name}: le دفتر écrit les chemins propres`);
    check(o.errors.length === 0, `${level} ${size.name}: aucune erreur console (découverte) ${o.errors.slice(0, 2).join(' | ')}`);
    await o.ctx.close();
  }
}

// 12 — la main : glisser la poignée (un essai au relâchement), le clavier, la saisie, un toucher sur la règle
{
  const size = SIZES[2];
  const { ctx, page, errors } = await open(size, 'beginner');
  await focusLab(page);
  const knob = page.locator('[data-fg-knob]');
  const kb = await knob.boundingBox();
  const ruler = await page.locator('[data-fg-ruler]').boundingBox();
  const cx = kb.x + kb.width / 2; const cy = kb.y + kb.height / 2;
  const valueOf = async () => Number((await page.locator('[data-fg-readout]').getAttribute('data-value')).replace(',', '.'));
  await page.mouse.move(cx, cy); await page.mouse.down();
  await page.mouse.move(cx + 120, cy, { steps: 8 });
  const mid = await valueOf();
  check(mid > 0, `glisser : le nombre suit la poignée pendant le geste (${mid})`);
  check((await page.evaluate(() => window.__events.length)) === 0, 'glisser : aucun essai avant le relâchement');
  await page.mouse.move(cx - 400, cy, { steps: 8 });
  check((await valueOf()) === 0, 'glisser : la poignée s\'arrête à 0');
  await page.mouse.move(ruler.x + ruler.width + 200, cy, { steps: 8 });
  check((await valueOf()) === 1560, 'glisser : la poignée s\'arrête à la borne de la règle');
  await page.mouse.up();
  const ev = await page.evaluate(() => window.__events);
  check(ev.length === 1 && ev[0].kind === 'release' && ev[0].hole === 'd' && ev[0].via === 'drag' && ev[0].ok === false && ev[0].free === false, `glisser : UN essai au relâchement ${JSON.stringify(ev[0])}`);
  check(ev[0] && ev[0].gauges.unit === 'lt' && ev[0].gauges.diff === null, `l'événement porte l'état des balances ${JSON.stringify(ev[0]?.gauges)}`);
  await knob.focus();
  await page.keyboard.press('Home');
  check((await valueOf()) === 0, 'clavier : Origine → 0');
  await page.keyboard.press('ArrowRight');
  check((await valueOf()) === 1, 'clavier : → un pas');
  await page.keyboard.press('PageUp');
  check((await valueOf()) === 11, 'clavier : PageUp = 10 pas');
  await page.keyboard.press('End');
  check((await valueOf()) === 1560, 'clavier : Fin → la borne');
  await page.locator('[data-fg-less]').click();
  check((await valueOf()) === 1559, '−/+ : un pas de moins');
  await typeValue(page, '780');
  check((await state(page, '[data-fg-verdict]', 'data-fg-verdict')) === 'right', 'saisie : 780 + Entrée accomplit la tâche');
  const last = (await page.evaluate(() => window.__events)).slice(-1)[0];
  check(last.via === 'type' && last.ok === true && last.value === '780' && last.gauges.cross === 'eq' && last.done === true, `saisie : l'événement ${JSON.stringify(last)}`);
  await page.locator('[data-fg-ruler]').click({ position: { x: ruler.width * 0.12, y: 30 } });
  check((await valueOf()) > 0, 'toucher sur la règle : la poignée y vient');
  check(errors.length === 0, `la main : aucune erreur console ${errors.slice(0, 2).join(' | ')}`);
  await ctx.close();
}
await browser.close();
console.log(failures.length ? `\n${failures.length} échec(s)` : '\ntout est bon');
process.exit(failures.length ? 1 : 0);
