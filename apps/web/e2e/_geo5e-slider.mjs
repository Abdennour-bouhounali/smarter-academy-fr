/** Pousse un curseur à fond puis capture le SVG ciblé. */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:5271';
const OUT = '/tmp/claude-1000/-home-abdennour-websites-smarter-academy-v2/c36825ca-c545-48d1-aba2-29cdecf4d47f/scratchpad/shots';
const [path, name, idxS, valS] = process.argv.slice(2);
const idx = Number(idxS ?? 0); const val = valS ?? '14';
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
const p = await c.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
if (process.env.LESSON) {
  await p.goto(BASE, { waitUntil: 'domcontentloaded' });
  await p.evaluate(([id]) => localStorage.setItem(`u_anon_smarter_lesson_${id}`,
    JSON.stringify({ completedModules: ['0','1','2','3','4','5','6','7'], xp: 500 })), [process.env.LESSON]);
}
await p.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
await p.waitForTimeout(400);
const sl = p.locator('input[type=range]').first();
if (await sl.count()) {
  await sl.evaluate((el, v) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, val);
  await p.waitForTimeout(600);
} else console.log('  ⚠ aucun curseur');
const svgs = await p.locator('svg').all();
await svgs[idx].screenshot({ path: `${OUT}/${name}.png` });
if (errs.length) { console.log('ERREURS:'); errs.forEach((e) => console.log('  ' + e)); }
console.log(`→ ${name}.png (svg ${idx}/${svgs.length})`);
await b.close();
