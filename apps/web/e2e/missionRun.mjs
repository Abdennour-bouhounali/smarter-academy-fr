/**
 * The walk of « سباق الأعداد », the endless game of a unit's last lesson (dev server on :5173):
 * `node e2e/missionRun.mjs <out>`. Through the UI at 1366×768: the door of the home, the game's card, a run played
 * with the keys — right gates (the score rises, a level is passed), then wrong gates on purpose (a heart is lost, the
 * fact of the wrong gate is shown, the run stops while it is read), the end card and the best score, back to the island.
 * It reads the right lane from the page's own data (`window.__world.runner.round.right`): the walk checks the GAME, not
 * the maths (the rounds are unit-tested). Fails on a text under 18 px, a gate number off the screen or over another, a
 * page error.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { GL_ARGS } from './lib/gpu.mjs';

const out = process.argv[2] ?? '/tmp/mission-run';
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: GL_ARGS });
const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
const errors = [];
const bad = [];
p.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
let n = 0;
const shot = async (name) => {
  n += 1;
  await p.screenshot({ path: `${out}/${String(n).padStart(2, '0')}-${name}.png` });
  const r = await p.evaluate(() => {
    let min = 99;
    document.querySelectorAll('.mi-run *').forEach((e) => {
      if (![...e.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()) || e.closest('.katex')) return;
      if (e.getBoundingClientRect().width) min = Math.min(min, parseFloat(getComputedStyle(e).fontSize));
    });
    const boxes = [...document.querySelectorAll('.mi-gate')]
      .filter((e) => e.style.visibility === 'visible')
      .map((e) => e.getBoundingClientRect());
    const sign = document.querySelector('.mi-run .di-dash__say')?.getBoundingClientRect();
    const hit = (a, c) => a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom;
    let over = 0;
    boxes.forEach((a, i) => {
      boxes.forEach((c, j) => j > i && hit(a, c) && (over += 1));
      if (sign && hit(a, sign) && a.right < 1300) over += 1;
    });
    return { min, gates: boxes.length, over, off: boxes.filter((x) => x.top < 0 || x.bottom > 768).length };
  });
  const flag = r.min < 18 || r.over || r.off ? ' <<< DEFECT' : '';
  if (flag) bad.push(name);
  console.log(
    `${String(n).padStart(2, '0')} ${name} | min ${r.min}px | gates on screen ${r.gates} | overlapping ${r.over} | off screen ${r.off}${flag}`,
  );
};
const state = () =>
  p.evaluate(() => ({
    ...window.__world.getState().run,
    right: window.__world.runner?.round.right,
    x: window.__world.runner?.x,
  }));
/** Plays one gate: steers to the right lane (or away from it), then waits for the gate to be judged. */
const gate = async (wrong = false) => {
  await p.waitForFunction(() => window.__world.runner && window.__world.getState().run.stage === 'go', null, {
    timeout: 20000,
  });
  const s = await state();
  const round = s.n;
  const target = wrong ? (s.right + 1) % 3 : s.right;
  for (let k = 0; k < 3; k += 1) {
    const now = (await state()).lane;
    if (now === target) break;
    await p.keyboard.press(now > target ? 'ArrowLeft' : 'ArrowRight');
    await p.waitForTimeout(80);
  }
  await p.waitForFunction(
    (r0) => {
      const r = window.__world.getState().run;
      return r.stage !== 'go' || r.n !== r0;
    },
    round,
    { timeout: 20000 },
  );
  return state();
};

await p.goto('http://localhost:5173/__qa/missions');
await p.waitForSelector('[data-mi-door="run"]', { timeout: 60000 });
await p.click('[data-mi-door="run"]');
await p.waitForSelector('[data-mi-run="ready"]');
await p.waitForTimeout(900);
await shot('card');
await p.click('[data-mi-run-start]');
await p.waitForTimeout(1500);
await shot('gates-far');
await p.waitForFunction(() => window.__world.runner?.x < 12, null, { timeout: 20000 });
await shot('gates-near');

// the pause: the gate stays where it was, and « متابعة » gives the run back
await p.click('[data-mi-run-pause]');
await p.waitForSelector('[data-mi-run-paused]');
const x0 = (await state()).x;
await p.waitForTimeout(900);
const x1 = (await state()).x;
await shot('paused');
if (Math.abs(x0 - x1) > 0.01) bad.push('the gate moved during the pause');
await p.click('[data-mi-run-resume]');
await p.waitForTimeout(400);
if ((await state()).x >= x1) bad.push('the run did not resume');

// six right gates: the score rises and level 2 opens after the fifth
for (let k = 0; k < 6; k += 1) {
  const s = await gate();
  if (k === 0) await shot('right-gate');
  if (s.stage !== 'go') bad.push(`a right gate was refused (round ${s.n})`);
}
let s = await state();
console.log('after six right gates: score', s.score, '| level', s.level, '| hearts', s.hearts);
if (s.score !== 6 || s.level !== 2 || s.hearts !== 3) bad.push('score, level or hearts after six right gates');
await p.waitForFunction(() => window.__world.runner?.x < 20, null, { timeout: 20000 });
await shot('level-2');
// the on-screen arrows move him too
const lane0 = (await state()).lane;
await p.click(lane0 === 0 ? '[data-mi-run-right]' : '[data-mi-run-left]');
if ((await state()).lane === lane0) bad.push('the on-screen arrow did not move the robot');

// three wrong gates: each costs a heart and shows its fact; the third ends the run
for (let k = 0; k < 3; k += 1) {
  s = await gate(true);
  if (s.stage !== 'hit' || !s.why) bad.push(`wrong gate ${k + 1}: no fact shown`);
  if (k === 0) {
    await p.waitForTimeout(300);
    await shot('wrong-gate-fact');
    console.log('   the fact of a wrong gate:', s.why);
  }
  await p.waitForFunction(() => window.__world.getState().run.stage !== 'hit', null, { timeout: 15000 });
}
await p.waitForSelector('[data-mi-run="over"]', { timeout: 15000 });
await p.waitForTimeout(500);
await shot('over');
s = await state();
console.log('end: score', s.score, '| best', s.best, '| record', s.record);
if (s.score !== 6 || s.best !== 6) bad.push('the end card does not hold the score or the best');
await p.click('[data-mi-run-leave]');
await p.waitForSelector('[data-mi-home]', { timeout: 15000 });
await p.click('[data-mi-door="run"]');
await p.waitForSelector('[data-mi-run="ready"]');
if (!(await p.locator('.mi-runcard__best').count())) bad.push('his best is not on the card when he comes back');
await shot('card-with-best');

console.log('page errors:', errors.length, errors);
console.log(bad.length ? `DEFECTS: ${bad.join(' | ')}` : 'NO DEFECT');
await b.close();
process.exit(bad.length || errors.length ? 1 : 0);
