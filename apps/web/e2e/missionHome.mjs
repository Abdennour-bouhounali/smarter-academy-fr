/**
 * The walk of the HOME of an integration lesson (« جزيرة المهمّات », dev server on :5173): `node e2e/missionHome.mjs <out>`.
 * At 1366×768 it opens every door through the UI — the three mission cards, the exam sitting (a level, then out), the
 * bank mission (the sitting of the top level, then out), the unit's recap — and checks no text of the home under
 * 18 px, nothing beyond the screen, no page error.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { GL_ARGS } from './lib/gpu.mjs';

const out = process.argv[2] ?? '/tmp/mission-home';
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: GL_ARGS });
const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
const errors = [];
const bad = [];
p.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
let n = 0;
const shot = async (name, scope = '.mi-home, .mi-panel') => {
  n += 1;
  await p.screenshot({ path: `${out}/${String(n).padStart(2, '0')}-${name}.png` });
  const r = await p.evaluate((sel) => {
    let min = 99;
    let low = 0;
    document.querySelectorAll(sel).forEach((root) =>
      root.querySelectorAll('*').forEach((e) => {
        if (![...e.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())) return;
        const box = e.getBoundingClientRect();
        if (!box.width) return;
        min = Math.min(min, parseFloat(getComputedStyle(e).fontSize));
        low = Math.max(low, box.bottom);
      }),
    );
    return { min, low: Math.round(low) };
  }, scope);
  const flag = r.min < 18 || r.low > 768 ? ' <<< DEFECT' : '';
  if (flag) bad.push(name);
  console.log(`${String(n).padStart(2, '0')} ${name} | min ${r.min}px | lowest text ${r.low}${flag}`);
};
const home = () => p.waitForSelector('[data-mi-home]', { timeout: 20000 });

await p.goto('http://localhost:5173/__qa/missions');
await home();
await p.waitForTimeout(1200);
await shot('home');
const cards = await p.locator('[data-mi-card]').count();
if (cards !== 3) bad.push(`${cards} mission cards, 3 expected`);

// a depot mission opens on its card and « ليس الآن » brings him back
for (const id of ['bem-2022-lots', 'bem-2020-trees']) {
  await p.click(`[data-mi-open="${id}"]`);
  await p.waitForSelector('[data-ms-card]', { timeout: 20000 });
  await p.click('[data-ms-close]');
  await home();
}

// the unit's recap
await p.click('[data-mi-door="recap"]');
await p.waitForFunction(() => Number(document.querySelector('[data-mi-recap]')?.dataset.miRecap) > 0, null, {
  timeout: 60000,
});
await shot('recap');
const recap = await p.locator('[data-mi-recap-lesson]').count();
console.log('recap: lessons', recap, '| rules listed', await p.locator('[data-mi-recap-lesson] li').count());
if (recap !== 8) bad.push(`${recap} lessons in the recap, 8 expected`);
await p.click('[data-mi-recap-close]');
await home();

// the exam door: five levels, the first open; it opens the bank's sitting, and leaving it comes home
await p.click('[data-mi-door="exam"]');
await p.waitForSelector('[data-mi-exam]');
await shot('exam-levels');
const open = await p.locator('[data-mi-level]:not([disabled])').count();
if (open !== 1) bad.push(`${open} exam levels open on a new save, 1 expected`);
const sitting = async (name) => {
  // the bank's sheet is drawn (its clock or its envelope shows), then « خروج » confirmed brings him home
  await p
    .waitForSelector('[data-xs-start], [data-xs-clock], [data-xs-envelope]', { timeout: 90000 })
    .catch(() => bad.push(`${name}: the sitting did not open`));
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${out}/${name}.png` });
  console.log(name, '| a bank sheet is on screen:', await p.locator('[data-xs-bank]').count());
  await p.click('[data-xs-quit]').catch(() => bad.push(`${name}: no way out`));
  await p.click('[data-xs-quit-yes]').catch(() => {});
  await home();
};
await p.click('[data-mi-level="1"]');
await sitting('sitting-level-1');

// mission 3: a sheet of the bank's last level, in exam form, whatever the ladder
await p.click('[data-mi-open="bank-sheet"]');
await sitting('mission-3-bank-sheet');
await shot('home-again');

console.log('page errors:', errors.length, errors);
console.log(bad.length ? `DEFECTS: ${bad.join(' | ')}` : 'NO DEFECT');
await b.close();
process.exit(bad.length || errors.length ? 1 : 0);
