/**
 * Comme _geo5e-check.mjs, mais SÈME la progression avant d'ouvrir la page :
 * sans cela, sequentialUnlock affiche « Module verrouillé » et l'on ne teste
 * jamais le module lui-même.
 *
 * usage : node _geo5e-seeded.mjs <lessonId> <path> <nom> [modulesDéjàFaits]
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:5251';
const OUT = process.env.OUT || '/tmp/shots';
const [lessonId, path, name, doneArg] = process.argv.slice(2);
const done = (doneArg ?? '0,1,2,3,4,5,6,7').split(',');

const browser = await chromium.launch();
const errors = [];
let ok = true;

for (const width of [375, 768, 1440]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${width}] ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`[${width}] PAGEERROR ${e.message}`));

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(([id, mods]) => {
    const v = JSON.stringify({ completedModules: mods, completedExercises: [] });
    localStorage.setItem(`u_anon_smarter_lesson_${id}`, v);
    localStorage.setItem(`smarter_lesson_${id}`, v);
  }, [lessonId, done]);

  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);

  const info = await page.evaluate(() => ({
    h1: document.querySelector('h1,h2')?.textContent?.trim() ?? null,
    svgs: document.querySelectorAll('svg').length,
    bricks: document.querySelectorAll('[data-knowledge-brick]').length,
    locked: document.body.innerText.includes('Module verrouillé'),
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
  }));
  if (info.overflow) { ok = false; errors.push(`[${width}] DÉBORDEMENT ${info.scrollW} > ${info.innerW}`); }
  if (info.locked) { ok = false; errors.push(`[${width}] MODULE VERROUILLÉ — la progression n'a pas été semée`); }
  console.log(`  ${String(width).padStart(4)}px  svg=${info.svgs} bricks=${info.bricks} locked=${info.locked} overflow=${info.overflow} · ${info.h1?.slice(0, 55)}`);

  await page.screenshot({ path: `${OUT}/${name}-${width}.png`, fullPage: width === 1440 }).catch(() => {});
  await ctx.close();
}

await browser.close();
if (errors.length) { console.log('ERREURS :'); errors.forEach((e) => console.log('  ' + e)); }
console.log(errors.length || !ok ? '❌ échec' : '✅ ok');
process.exit(errors.length || !ok ? 1 : 0);
