/**
 * Vérification navigateur d'une page de leçon : erreurs console, rendu SVG,
 * et captures aux trois largeurs demandées (375 / 768 / 1440).
 *
 * usage : node check.mjs <path> [nom]
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:5271';
const path = process.argv[2];
const name = process.argv[3] || 'page';
const OUT = process.env.OUT || '/tmp/claude-1000/-home-abdennour-websites-smarter-academy-v2/c36825ca-c545-48d1-aba2-29cdecf4d47f/scratchpad/shots';

const browser = await chromium.launch();
const errors = [];
let ok = true;

for (const width of [375, 768, 1440]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${width}] ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`[${width}] PAGEERROR ${e.message}`));

  // Déverrouiller : la clé de progression est PORTÉE PAR UTILISATEUR.
  if (process.env.LESSON) {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.evaluate(([id]) => {
      localStorage.setItem(`u_anon_smarter_lesson_${id}`, JSON.stringify({
        completedModules: ['0', '1', '2', '3', '4', '5', '6', '7'], xp: 500,
      }));
    }, [process.env.LESSON]);
  }
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(700);

  const info = await page.evaluate(() => ({
    h1: document.querySelector('h1,h2')?.textContent?.trim() ?? null,
    svgs: document.querySelectorAll('svg').length,
    bricks: document.querySelectorAll('[data-knowledge-brick]').length,
    // Débordement horizontal : la page ne doit jamais scroller latéralement.
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
  }));
  if (info.overflow) { ok = false; errors.push(`[${width}] DÉBORDEMENT horizontal ${info.scrollW} > ${info.innerW}`); }
  console.log(`  ${String(width).padStart(4)}px  svg=${info.svgs} bricks=${info.bricks} overflow=${info.overflow} · ${info.h1?.slice(0, 60)}`);

  await page.screenshot({ path: `${OUT}/${name}-${width}.png`, fullPage: width === 1440 });
  await ctx.close();
}

await browser.close();
if (errors.length) { console.log('\nERREURS :'); errors.forEach((e) => console.log('  ' + e)); }
console.log(errors.length || !ok ? '\n❌ échec' : '\n✅ ok');
process.exit(errors.length || !ok ? 1 : 0);
