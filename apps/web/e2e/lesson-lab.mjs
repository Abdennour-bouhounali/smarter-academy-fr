// « مختبري » — walk of the LAB of a lesson as a STUDENT (simulated session, no API).
// Lesson 1 of 4AM (in its game world): its three instruments, the cabinet of the EARLIER lessons only, numbers that follow the
// student from one instrument to the next, « جرّب » ticked only by what he makes. Then lesson 5 (in its game world): its
// « مِنضدة القائمتين » played until both lists close. Then lesson 6, the PGCD algorithms (in its game world): its own
// instrument and the cabinet of three grades. Nothing may scroll, at any moment.
// Run (dev server up): [E2E_SIZE=1366x768] [E2E_LAB_ONLY=2quater|2quinquies] node apps/web/e2e/lesson-lab.mjs [outDir]
import { chromium } from 'playwright';
import { GL_ARGS } from './lib/gpu.mjs';
import { tinyText } from './lib/walk.mjs';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

const BASE = `${process.env.E2E_BASE || 'http://localhost:5173'}/courses/moyen/4am/ansab_al_aadad_wal_hisab`;
const OUT = process.argv[2] || `${tmpdir()}/lesson-lab`;
const SIZE = (process.env.E2E_SIZE || '1366x768').split('x').map(Number);
mkdirSync(OUT, { recursive: true });
const expect = (cond, msg) => { if (!cond) { console.log('FAIL', msg); process.exitCode = 1; if (process.env.E2E_SOFT !== '1') throw new Error(msg); return; } console.log('ok  ', msg); };
const browser = await chromium.launch({ args: GL_ARGS });
const ctx = await browser.newContext({ viewport: { width: SIZE[0], height: SIZE[1] }, ...(process.env.E2E_TOUCH === '1' ? { hasTouch: true, isMobile: true } : {}) });
await ctx.addInitScript(() => {
  localStorage.setItem('token', 'qa-fake-token');
  const real = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    if (url.includes('/api/')) return new Response(JSON.stringify(url.includes('/auth/me') ? { success: true, user: { id: 9402, name: 'تلميذ', role: 'student', roles: ['student'], email_verified_at: '2026-09-01T00:00:00Z', emailVerified: true, nameComplete: true, level: '4am', grade: '4am' } } : { success: true, data: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    return real(input, init);
  };
});
const page = await ctx.newPage(); const errors = [];
page.on('pageerror', (e) => { errors.push(e.message); console.log('pageerror', e.message); });
let n = 0;
/** Nothing scrolls, nothing leaves the screen, no text is tiny — checked at every screenshot. */
const shot = async (name) => {
  await page.waitForTimeout(450);
  const bad = await page.evaluate((phone) => {
    const out = []; const root = document.querySelector('.ll-root'); if (!root) return ['no lab on screen'];
    for (const el of root.querySelectorAll('*')) { const cs = getComputedStyle(el); if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 2 && !(phone && el.classList.contains('ll-draw'))) out.push(`scrolls: ${el.className}`); } // on a phone an instrument taller than its table slides INSIDE the table (GAME_WORLD.md « On a phone », rule 3)
    for (const el of root.querySelectorAll('.ll-head, .ll-rail, .ll-bench, .ll-quests, .ll-cabinet, .ll-reading, .ll-tile, .ll-cabinet-btn, .ll-quests li, .ll-sent__card, .ll-zone, .ll-sheet, .ll-think, .ll-lamp, .ll-toolhead')) { const r = el.getBoundingClientRect(); if (r.height > 0 && (r.top < -1 || r.bottom > window.innerHeight + 1 || r.left < -1 || r.right > window.innerWidth + 1) && !(phone && el.closest('.ll-quests') && el.matches('li')) && !(phone && el.closest('.ll-draw') && r.left >= -1 && r.right <= window.innerWidth + 1)) out.push(`leaves the screen: ${el.className}`); } // a quest of the sliding line may wait beyond the edge on a phone
    const stage = root.querySelector('.ll-stage').getBoundingClientRect();
    for (const el of root.querySelectorAll('.ll-draw > *, .ll-reading')) { const r = el.getBoundingClientRect(); if ((r.bottom > stage.bottom + 2 || r.top < stage.top - 2) && !(phone && el.parentElement.classList.contains('ll-draw'))) out.push(`out of the stage: ${el.className?.baseVal ?? el.className} (${Math.round(r.bottom - stage.bottom)}px)`); }
    for (const t of root.querySelectorAll('.ll-draw svg text')) { const r = t.getBoundingClientRect(); if (r.width > 0 && (r.left < stage.left - 1 || r.right > stage.right + 1 || r.top < stage.top - 1 || r.bottom > stage.bottom + 1)) out.push(`clipped label: ${t.textContent}`); }
    for (const el of root.querySelectorAll('.ll-quests, .ll-reading__text, .ll-sent__cards, .ll-think, .ll-cabinet__list')) if (el.scrollHeight > el.clientHeight + 3 || (el.scrollWidth > el.clientWidth + 3 && !(phone && el.classList.contains('ll-quests')))) out.push(`overflows: ${el.className}`); // on a phone the quests are ONE line that slides (GAME_WORLD.md « On a phone », rule 5)
    // the lab INSIDE a game world (`ll-root--inline`) is the page: it must not make it scroll. The lab of a lesson page is a
    // fixed portal over that page, which is the page's own walk's business.
    if (root.classList.contains('ll-root--inline') && document.documentElement.scrollHeight > window.innerHeight + 1) out.push('the page scrolls');
    // no raw LaTeX: no `$` and no backslash command readable on screen outside a drawn formula (`.katex`)
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let t = w.nextNode(); t; t = w.nextNode()) {
      const p = t.parentElement; const v = t.nodeValue;
      if (!p || !v.trim() || p.closest('script, style, noscript, .katex, title') || !p.getClientRects().length) continue;
      const cs = getComputedStyle(p); if (cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
      const r = p.getBoundingClientRect(); if (r.width <= 1 || r.height <= 1 || r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) continue;
      if (/\$|\\[a-zA-Z]{2,}/.test(v)) out.push(`raw LaTeX: « ${v.trim().slice(0, 50)} »`);
    }
    return out;
  }, process.env.E2E_TOUCH === '1' && SIZE[1] <= 500);
  // the 12 px floor (GAME_WORLD.md « 12 px floor »), the rule of lib/walk.mjs › shot, at every screenshot and every size
  for (const t of await tinyText(page)) bad.push(`text under 12 px: ${t}`);
  if (bad.length) { console.log('FAIL at «', name, '»:', [...new Set(bad)].join(' | ')); process.exitCode = 1; if (process.env.E2E_SOFT !== '1') throw new Error(`layout at ${name}`); }
  n += 1; await page.screenshot({ path: `${OUT}/${String(n).padStart(2, '0')}-${name}.png` });
};
const px = (sel) => page.evaluate((s) => { const el = document.querySelector(s); const z = Number(document.querySelector('.ll-fit').style.zoom || 1); return el ? Math.round(parseFloat(getComputedStyle(el).fontSize) * z) : 0; }, sel);
const setNum = async (id, v) => { await page.fill(`[data-ll-input="${id}"]`, String(v)); await page.waitForTimeout(120); };
const quest = (id) => page.getAttribute(`[data-ll-quest="${id}"]`, 'data-ll-quest-done');
/** The sounds the lab has played so far (sound.js writes their names here in dev), and those played since a mark. */
const sounds = () => page.evaluate(() => [...(window.__labSounds ?? [])]);
let heard = 0; const since = async () => { const all = await sounds(); const fresh = all.slice(heard); heard = all.length; return fresh; };
/** Drags an svg handle to the viewBox abscissa `vx` (and ordinate `vy`), through real pointer events. */
const dragTo = async (handle, vx, vy = null) => {
  const box = await page.locator(handle).boundingBox(); const svg = await page.locator('.ll-draw > svg').boundingBox();
  const k = Math.min(svg.width / 940, svg.height / 370); const ox = svg.x + (svg.width - 940 * k) / 2; const oy = svg.y + (svg.height - 370 * k) / 2;
  const from = { x: box.x + box.width / 2, y: box.y + box.height / 2 }; const to = { x: ox + vx * k, y: vy == null ? from.y : oy + vy * k };
  await page.mouse.move(from.x, from.y); await page.mouse.down(); await page.mouse.move((from.x + to.x) / 2, (from.y + to.y) / 2, { steps: 6 }); await page.mouse.move(to.x, to.y, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(200);
};
const CYAN = '#7dfcff'; const GREEN = '#34d399'; const ROSE = '#fb7185';
/**
 * « مسطرة الحصر » as it is DRAWN: the plank rectangles under the length (inside: cyan or green, the one that passes: rose,
 * what is left: a dashed rect with no fill), the product line, the bracket line, the reading chips.
 */
const bracketDrawn = () => page.evaluate(([CYAN, GREEN, ROSE]) => {
  const rects = [...document.querySelectorAll('[data-ll-planks-laid] rect')]; const fill = (c) => rects.filter((r) => r.getAttribute('fill') === c).length;
  const txt = (s) => document.querySelector(s)?.textContent.trim() ?? null; const attr = (s, a) => document.querySelector(s)?.getAttribute(a) ?? null;
  return { cyan: fill(CYAN), green: fill(GREEN), rose: fill(ROSE), gap: fill('none'), product: txt('[data-ll-product]'), bracket: txt('[data-ll-bracket]'), found: txt('[data-ll-found]'), left: attr('[data-ll-left]', 'data-ll-left'), over: attr('[data-ll-over]', 'data-ll-over'), more: document.querySelector('[data-ll-more]')?.disabled ?? null };
}, [CYAN, GREEN, ROSE]);
/** What n planks of b along a length a must show — computed HERE from a, b, n, never read from the instrument. */
const bracketWanted = (a, b, n) => {
  const q = Math.floor(a / b); const laid = n * b; const exact = laid === a;
  return {
    cyan: exact ? 0 : Math.min(n, q), green: exact ? n : 0, rose: n > q ? 1 : 0, gap: laid < a ? 1 : 0,
    product: `${n} × ${b} = ${laid} ${exact ? '=' : laid > a ? '>' : '<'} ${a}`,
    left: laid <= a ? String(a - laid) : null, over: laid > a ? String(laid - a) : null, more: n >= q + 1,
  };
};
const same = (got, want) => Object.keys(want).every((k) => got[k] === want[k]);
const show = (o) => JSON.stringify(o);
/** The viewBox abscissa of the end of the n-th plank: the drawing spans 190 → 900 for one plank past the full ones. */
const plankEnd = (a, b, n) => 190 + (710 * n) / (Math.floor(a / b) + 1);
/** « اللوح المشترك » as it is DRAWN, row by row: its label, ✓ or « يبقى r », the planks laid, where the planks and the gap end. */
const planksDrawn = () => page.evaluate(([CYAN, GREEN]) => {
  const num = (r, k) => Number(r.getAttribute(k));
  const held = document.querySelector('[data-ll-planks] > rect[fill="#fbbf24"]');
  const rows = [...document.querySelectorAll('[data-ll-row]')].map((g) => {
    const rects = [...g.querySelectorAll('rect')]; const outline = rects[0];
    const planks = rects.filter((r) => [CYAN, GREEN].includes(r.getAttribute('fill'))); const gap = rects.find((r) => r.getAttribute('fill') === 'none');
    const ends = [...planks, ...(gap ? [gap] : [])].map((r) => num(r, 'x') + num(r, 'width'));
    const [mark, name] = [...g.querySelectorAll('text')].map((t) => t.textContent.trim());
    return { id: g.dataset.llRow, name, mark, planks: planks.length, green: planks.filter((r) => r.getAttribute('fill') === GREEN).length, gap: gap ? 1 : 0, end: ends.length ? Math.max(...ends) : null, length: num(outline, 'x') + num(outline, 'width') };
  });
  return { held: held ? num(held, 'width') : null, rows, filled: document.querySelector('[data-ll-filled]')?.textContent.trim() ?? null, both: document.querySelector('[data-ll-both]')?.textContent.trim() ?? null };
}, [CYAN, GREEN]);
/** The six lengths a plank of d is laid along, and what it must make of each — computed HERE. */
const planksWanted = (a, b, d) => {
  const big = Math.max(a, b); const small = Math.min(a, b); const q = Math.floor(big / small); const r = big % small;
  const rows = [[a, `${a}`], [b, `${b}`], [a + b, `${a} + ${b} = ${a + b}`], [big - small, `${big} − ${small} = ${big - small}`], [r, `${big} = ${small} × ${q} + ${r}`], [3 * a, `3 × ${a} = ${3 * a}`]]
    .map(([n, name]) => ({ n, name, planks: Math.floor(n / d), fits: n % d === 0, mark: n % d === 0 ? '✓' : `يبقى ${n % d}` }));
  const filled = rows.filter((x) => x.fits).length; const both = rows[0].fits && rows[1].fits && d > 1;
  return { rows, filled, both, u: 672 / Math.max(a + b, 3 * a, 2) };
};
/** Compares the drawing of the planks with what the walk computed; returns the differences (empty: the drawing is right). */
const planksDiff = (got, want, a, b, d) => {
  const diff = [];
  if (got.held == null || Math.abs(got.held - d * want.u) > 0.5) diff.push(`the held plank is ${got.held} wide, not ${d * want.u}`);
  if (got.rows.length !== 6) diff.push(`${got.rows.length} rows`);
  want.rows.forEach((w, i) => {
    const g = got.rows[i] ?? {};
    if (g.name !== w.name) diff.push(`row ${i}: « ${g.name} » ≠ « ${w.name} »`);
    if (g.mark !== w.mark) diff.push(`row ${i}: « ${g.mark} » ≠ « ${w.mark} »`);
    if (g.planks !== w.planks || g.green !== (w.fits ? w.planks : 0)) diff.push(`row ${i}: ${g.planks} planks (${g.green} green), want ${w.planks}${w.fits ? ' green' : ''}`);
    if (g.gap !== (w.fits ? 0 : 1)) diff.push(`row ${i}: gap ${g.gap}`);
    if (w.n > 0 && (g.end == null || Math.abs(g.end - g.length) > 2.5)) diff.push(`row ${i}: the planks and the gap end at ${g.end}, the length at ${g.length}`);
  });
  if (got.filled !== `يملأ ${want.filled} من 6 أطوال`) diff.push(`chip « ${got.filled} »`);
  if (got.both !== (want.both ? `${d} قاسم للعددين ${a} و ${b}` : null)) diff.push(`both « ${got.both} »`);
  return diff;
};

// ONE step alone: E2E_LAB_ONLY=2quater runs that step only (the others are skipped); unset, the whole walk runs
const ONLY = process.env.E2E_LAB_ONLY ?? null;
const ALONE = ['2quater', '2quinquies'];
if (ONLY && !ALONE.includes(ONLY)) throw new Error(`E2E_LAB_ONLY: no step « ${ONLY} » can run alone (${ALONE.join(', ')})`);
if (!ONLY) {
// ══ 1. the first lesson of 4AM: the lab opens from the title screen of its game world ══
await page.goto(`${BASE}/qasim-adad-tabii`, { waitUntil: 'networkidle' }); heard = 0;
await page.waitForSelector('[data-di-lab-open]'); await page.click('[data-di-lab-open]'); await page.waitForSelector('[data-lesson-lab="qasim-adad-tabii"]'); await page.waitForSelector('[data-ll-rows]');
expect((await page.locator('.ll-rail [data-ll-tool]').evaluateAll((els) => els.map((e) => e.dataset.llTool))).join() === 'rows,jumps,sentences', 'the bench shows the three instruments of THIS lesson');
expect(await page.locator('[data-ll-cabinet-open]').count() === 1 && (await page.textContent('[data-ll-cabinet-open]')).includes('(3)'), '« خزانتي » holds the three instruments of the earlier lessons (two of 1AM, one of 2AM)');
console.log('    text on screen (px): tool', await px('.ll-tile strong'), '· quest', await px('.ll-quests li'), '· reading', await px('.ll-reading__text'), '· hint', await px('.ll-toolhead p'));
// a phone held sideways has ONE scale, its root font at 13 px (GAME_WORLD.md « On a phone », rule 1): 12 px is the floor for a label there
const PHONE = process.env.E2E_TOUCH === '1' && SIZE[1] <= 500;
expect(await px('.ll-quests li') >= (PHONE ? 12 : 15) && await px('.ll-tile strong') >= (PHONE ? 12 : 16), 'the text is comfortable to read');
// صفوف القسمة: 42 counters in rows of 5 → 8 rows and 2 left
expect(await page.getAttribute('[data-ll-rows]', 'data-q') === '8' && await page.getAttribute('[data-ll-rows]', 'data-r') === '2' && await page.locator('.ll-counter').count() === 42, 'صفوف القسمة: 42 counters in rows of 5 — 8 rows, 2 left over');
expect(await quest('zero') === '0', 'no « جرّب » is ticked before the student does anything');
await shot('rows-42-5');
{ const s0 = await since(); expect(s0.includes('enter') && !s0.includes('fit') && !s0.includes('quest'), `the lab opens on its own short chime, and an instrument is silent until it is touched (${s0.join(' ') || 'nothing'})`); }
// the hand moves the WALL: rows of 6 → nothing left
await dragTo('[data-ll-wall]', 910 - 6 * (760 / 24) - 7);
expect(await page.inputValue('[data-ll-input="b"]') === '6' && await page.getAttribute('[data-ll-rows]', 'data-r') === '0' && await page.getAttribute('[data-ll-reading]', 'data-ll-reading') === 'good', 'dragging the wall to rows of 6: the remainder is 0, the tray turns green, the number box follows');
expect(await quest('zero') === '1' && await quest('two') === '0', '« اجعل الباقي 0 » is ticked — by what the student made');
await shot('rows-42-6');
{ await page.waitForTimeout(500); const s1 = await since(); expect(s1.includes('tick') && s1.filter((x) => x === 'fit').length === 1 && s1.at(-1) === 'quest', `the wall ticks as it moves, ONE chime marks the rows that are full, then the mission rings (${s1.join(' ')})`); }
// the switch of the lab: off is silent, on answers at once
await page.click('[data-ll-sound]'); await dragTo('[data-ll-wall]', 910 - 9 * (760 / 24) - 7); await dragTo('[data-ll-wall]', 910 - 6 * (760 / 24) - 7);
{ const off = await since(); expect(off.length === 0 && await page.getAttribute('[data-ll-sound]', 'aria-pressed') === 'false', `« الصوت » off: the same gestures make no sound (${off.join(' ') || 'silence'})`); }
await page.click('[data-ll-sound]');
{ const on = await since(); expect(on.join() === 'on', 'switched back on, it answers with its two notes'); }
await dragTo('[data-ll-wall]', 910 - 7 * (760 / 24) - 7);
expect(await quest('two') === '1' && await page.getAttribute('[data-ll-stars]', 'data-ll-stars') === '2', 'a second divisor of the same number ticks the second mission; the lab counts 2 missions');
// قفزات المضاعفات — the SAME numbers follow the student
await page.click('[data-ll-tool="jumps"]'); await page.waitForSelector('[data-ll-jumps]');
expect(await page.inputValue('[data-ll-input="a"]') === '42' && await page.inputValue('[data-ll-input="b"]') === '7' && await page.getAttribute('[data-ll-jumps]', 'data-q') === '6', 'قفزات المضاعفات opens with the same numbers: 6 jumps of 7 reach 42');
await setNum('b', 5);
expect(await page.getAttribute('[data-ll-jumps]', 'data-r') === '2' && (await page.textContent('[data-ll-jumps]')).includes('يبقى 2'), 'jumps of 5: the last one lands on 40, and the line shows what is missing: 2');
await shot('jumps-42-5');
await page.click('[data-ll-run]'); await page.waitForTimeout(3600);
{ const before = await page.inputValue('[data-ll-input="a"]'); await dragTo('[data-ll-flag]', 40 + (30 / 48) * 860); const after = await page.inputValue('[data-ll-input="a"]'); expect(before === '42' && after === '30' && await page.getAttribute('[data-ll-jumps]', 'data-r') === '0', 'dragging the FLAG to 30: six jumps of 5 land on it exactly'); }
await shot('jumps-30-5');
{ const s2 = await since(); expect(s2.includes('open') && s2.filter((x) => x === 'hop').length === 8 && s2.includes('short') && s2.includes('fit'), `قفزات: the instrument is set on the bench, 8 hops are heard one by one, a landing before the flag sounds « short », the exact one chimes (${[...new Set(s2)].join(' ')})`); }
// آلة الجمل الأربع
await page.click('[data-ll-tool="sentences"]'); await page.waitForSelector('[data-ll-view="sentences"]');
expect(await page.locator('.ll-sent__card.is-ok').count() === 4 && (await page.textContent('.ll-sent__cards')).includes('5 قاسم للعدد 30'), 'آلة الجمل الأربع: 30 and 5 — the four sentences are true together');
await page.click('[data-ll-swap]');
expect(await page.locator('.ll-sent__card.is-ko').count() === 4 && (await page.textContent('[data-ll-reading]')).includes('5 < 30'), 'the lever swaps them: « 30 قاسم للعدد 5 » — the four are false together, and the reason is written');
await shot('sentences-swapped');
{ await page.waitForTimeout(300); const s3 = await since(); expect(s3.includes('swap') && s3.includes('rest'), `the lever whooshes, then the four false sentences fall on the soft low notes — never a buzzer (${s3.join(' ')})`); }
// خزانتي: only the PAST
await page.click('[data-ll-cabinet-open]'); await page.waitForSelector('[data-ll-cabinet]');
{
  // the cabinet opens on the NEAREST grade (2AM: « مسطرة الحصر », 2026-11-18); 1AM is one tap away
  const grades = await page.locator('[data-ll-grade]').evaluateAll((els) => els.map((e) => e.dataset.llGrade));
  const near = await page.locator('[data-ll-cabinet-lesson]').evaluateAll((els) => els.map((e) => e.dataset.llCabinetLesson));
  expect(grades.join() === '1am,2am' && near.join() === 'qisma-iqlidiya-hasr' && await page.locator('[data-ll-cabinet-tool="bracket"]').count() === 1, 'the cabinet has two grades and opens on 2AM: the lesson of the bracket and its instrument');
  await page.click('[data-ll-grade="1am"]');
  const lessons = await page.locator('[data-ll-cabinet-lesson]').evaluateAll((els) => els.map((e) => e.dataset.llCabinetLesson));
  const tools = await page.locator('[data-ll-cabinet-tool]').evaluateAll((els) => els.map((e) => e.dataset.llCabinetTool));
  expect(lessons.join() === 'qisma-iqlidiya-baqi,qawaid-qabiliyat-qisma' && tools.join() === 'paper,rules', 'the 1AM shelf lists its two lessons with their instruments');
  expect(!(await page.textContent('.ll-root')).includes('إقليدس') && !(await page.textContent('.ll-root')).includes('قوس القواسم'), 'NOTHING of the lessons after this one is shown — not even locked');
}
await shot('cabinet');
await page.click('[data-ll-cabinet-tool="paper"]'); await page.waitForSelector('[data-ll-sheet]');
expect(await page.locator('.ll-rail [data-ll-tool="paper"]').count() === 1 && (await page.textContent('[data-ll-from]')).includes('القسمة الإقليدية'), 'the picked instrument is on the bench, under « من خزانتي », and says which lesson it comes from');
await setNum('a', 756); await setNum('b', 36);
for (let i = 0; i < 2; i += 1) await page.click('[data-ll-step]');
await page.waitForTimeout(300);
expect((await page.textContent('[data-ll-quotient]')).trim() === '21' && await page.locator('[data-ll-paper-done]').count() === 1 && (await page.textContent('[data-ll-think]')).includes('36 \\times 21 + 0 = 756'), 'القسمة على الورقة: 756 ÷ 36 written in two steps — quotient 21, then the check 36 × 21 + 0 = 756');
expect((await page.textContent('[data-ll-paper-done]')).includes('36 قاسم للعدد 756') && await quest('end') === '1' && await quest('exact') === '1', 'the sheet ends on the sentence, and two missions are ticked');
await shot('paper-756-36');
{ await page.waitForTimeout(400); const s4 = await since(); expect(s4.includes('drawer') && s4.filter((x) => x === 'pencil').length === 2 && s4.includes('fit'), `the cabinet is a drawer, each step of the division is a pencil, a remainder 0 chimes (${[...new Set(s4)].join(' ')})`); }
await page.click('[data-ll-cabinet-open]'); await page.click('[data-ll-grade="1am"]'); await page.click('[data-ll-cabinet-tool="rules"]'); await page.waitForSelector('[data-ll-lock]');
expect(await page.getAttribute('[data-ll-lock]', 'data-ll-lock') === '756' && await page.getAttribute('[data-ll-lamp="9"]', 'data-ll-lit') === '1' && await page.getAttribute('[data-ll-lamp="5"]', 'data-ll-lit') === '0', 'كاشف قابلية القسمة takes the same 756: the lamps of 2, 3, 4, 9 are lit, 5 and 10 are dark');
await page.click('[data-ll-lamp="9"]');
expect(await page.locator('.ll-wheel.is-read').count() === 3 && (await page.textContent('[data-ll-reading]')).includes('مجموع الأرقام 18'), 'tapping the lamp of 9 raises the three digits its rule reads: their sum, 18');
await page.click('[data-ll-up="2"]'); // 756 → 757
expect(await page.getAttribute('[data-ll-lock]', 'data-ll-lock') === '757' && await page.getAttribute('[data-ll-lamp="9"]', 'data-ll-lit') === '0', 'rolling one digit of the padlock (757) puts the lamp out');
await shot('rules-757');
{ const s5 = await since(); expect(s5.includes('lamp') && s5.includes('click') && s5.includes('lamps') === false, `the padlock clicks; 757 lights no lamp, so no lamp rings (${[...new Set(s5)].join(' ')})`); }
await page.click('[data-ll-down="2"]'); await page.waitForTimeout(250);
{ const s6 = await since(); expect(s6.includes('click') && s6.includes('lamps'), 'back to 756: the lit lamps ring, one soft note each'); }
// مسطرة الحصر (2AM): PLAYED — the hand lays the planks, and the drawing is read against what the walk computes itself
await page.click('[data-ll-cabinet-open]'); await page.waitForSelector('[data-ll-cabinet]');
await page.click('[data-ll-cabinet-tool="bracket"]'); await page.waitForSelector('[data-ll-bracket-tool]');
await setNum('a', 100); await setNum('b', 7);
{
  const [a, b] = [100, 7]; const q = Math.floor(a / b); // 14 full planks, 2 left
  const open = await bracketDrawn();
  expect(same(open, bracketWanted(a, b, 1)) && open.bracket === null && open.found === null && await quest('over') === '0', `مسطرة الحصر on 100 and 7 opens on ONE plank: 1 × 7 = 7 < 100, 93 left, no bracket written (${show(open)})`);
  await dragTo('[data-ll-plank-end]', plankEnd(a, b, q));
  const full = await bracketDrawn();
  expect(same(full, bracketWanted(a, b, q)) && full.bracket === null, `dragging the end of the planks to the 14th: 14 cyan planks, « 14 × 7 = 98 < 100 », the dashed gap of 2 — and still no bracket (${show(full)})`);
  await page.click('[data-ll-more]'); await page.waitForTimeout(400);
  const past = await bracketDrawn();
  const m = /^(\d+) < (\d+) ÷ (\d+) < (\d+)$/.exec(past.bracket ?? '');
  const [lo, hi] = m ? [Number(m[1]), Number(m[4])] : [NaN, NaN];
  expect(same(past, bracketWanted(a, b, q + 1)) && m && Number(m[2]) === a && Number(m[3]) === b && lo === q && hi === q + 1 && lo * b <= a && a < hi * b && past.found === `الكاملة ${q} · اللازمة ${q + 1}`, `« لوح آخر + »: the 15th plank passes in rose (105 > 100 by 5), the button stops there, and the drawing writes the bracket it framed — « ${past.bracket} » with 14 × 7 ≤ 100 < 15 × 7 (${show(past)})`);
  expect(await quest('over') === '1', '« اجعل آخر لوح وحده يتجاوز الطول » is ticked by the plank the hand laid');
}
await shot('bracket-100-7');
{
  // a length of four digits, a plank of two: 1000 ÷ 37 — 27 full planks, 28 needed
  await setNum('a', 1000); await setNum('b', 37);
  const [a, b] = [1000, 37]; const q = Math.floor(a / b);
  const typed = await bracketDrawn(); const n0 = Number(await page.getAttribute('[data-ll-bracket-tool]', 'data-n'));
  expect(Number.isInteger(n0) && n0 >= 0 && n0 <= q + 1 && same(typed, bracketWanted(a, b, n0)) && typed.bracket === null && typed.found === null, `new numbers typed (1000 and 37): the ${n0} planks on the length are drawn and counted for THESE numbers, and no bracket is written before the hand lays them (${show(typed)})`);
  await dragTo('[data-ll-plank-end]', plankEnd(a, b, q)); await page.click('[data-ll-more]'); await page.waitForTimeout(400);
  const past = await bracketDrawn();
  expect(same(past, bracketWanted(a, b, q + 1)) && past.bracket === `${q} < ${a} ÷ ${b} < ${q + 1}` && q * b <= a && a < (q + 1) * b && past.found === `الكاملة ${q} · اللازمة ${q + 1}`, `the hand lays 27 then one more: « 28 × 37 = 1036 > 1000 », and the bracket « 27 < 1000 ÷ 37 < 28 » (${show(past)})`);
  expect(await quest('big') === '1', 'the full and the needed planks of a four-digit length and a two-digit plank: the mission is ticked');
}
{
  // a length the planks fill: 84 ÷ 7 = 12, nothing left — the bracket closes on ONE number
  await setNum('a', 84); await setNum('b', 7);
  const [a, b] = [84, 7]; const q = a / b;
  const typed = await bracketDrawn();
  expect(typed.bracket === null, `84 and 7 typed: no bracket before the hand lays the planks (${show(typed)})`);
  await dragTo('[data-ll-plank-end]', plankEnd(a, b, q));
  const exact = await bracketDrawn();
  expect(same(exact, bracketWanted(a, b, q)) && exact.bracket === `${a} ÷ ${b} = ${q}` && exact.found === `الألواح الكاملة ${q} هي اللازمة` && (await page.textContent('[data-ll-reading]')).includes('تملأ الطول تمامًا'), `12 planks of 7 fill 84: all green, no gap, « 12 × 7 = 84 = 84 », and « 84 ÷ 7 = 12 » (${show(exact)})`);
  expect(await quest('exact') === '1', '« املأ الطول تمامًا بأكثر من 10 ألواح » is ticked');
}
await shot('bracket-84-7');
{
  // the bracket of NEW numbers is written only once the hand has laid BOTH counts FOR THEM (LESSON_LAB.md, `bracket`): a single
  // « − لوح » right after typing 9 is one gesture, not two. Known product issue (Bracket.jsx keeps `n` and `moved` across new
  // numbers; only its memory `met` is stamped with them) was being fixed on 2026-11-19: this HARD check proves the fix — the 12
  // planks of 84 ÷ 7 must not count as laid by the hand for 84 ÷ 9.
  await setNum('b', 9);
  await page.click('[data-ll-less]'); await page.waitForTimeout(400);
  const one = await bracketDrawn();
  expect(one.bracket === null && one.found === null, `84 and 9 typed, then one « − لوح »: the bracket of 84 ÷ 9 is NOT written yet — the hand has not laid both 9 and 10 planks for these numbers (${show(one)})`);
}
await page.click('[data-ll-close]');
expect(await page.locator('.ll-root').count() === 0 && await page.locator('[data-di-lab-open]').count() === 1, 'closing the lab returns to the lesson');

// ══ on a phone the walk ends here: only the lessons designed for it open (`PHONE_LESSONS`); another lesson's lab is closed with it ══
if (PHONE) {
  await page.goto(`${BASE}/bahth-pgcd?lab=1`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[role="alert"]');
  expect(await page.locator('.ll-root').count() === 0 && await page.locator('[data-mission-lab], [data-di-lab-open]').count() === 0 && (await page.textContent('[role="alert"]')).includes('الحاسوب'), 'on a phone a lesson that is not designed for it is closed with its lab: the message names the computer, no lab opens behind it');
  expect(errors.length === 0, 'no page error');
  await browser.close();
  process.exit(process.exitCode ?? 0);
}

// ══ 1bis. lesson 5 of 4AM (in its game world): « مِنضدة القائمتين », PLAYED — « جرّب » until both lists close ══
await page.goto(`${BASE}/tayin-pgcd`, { waitUntil: 'networkidle' }); heard = 0;
await page.waitForSelector('[data-di-lab-open]'); await page.click('[data-di-lab-open]'); await page.waitForSelector('[data-lesson-lab="tayin-pgcd"]');
await page.waitForSelector('[data-ll-mine] [data-ll-tool]'); // the rail is drawn once the lab has loaded its instruments
// « mine » only: the rail also keeps, under it, the instruments this student picked from the cabinet earlier in the walk
{ const mine = (await page.locator('[data-ll-mine] [data-ll-tool]').evaluateAll((els) => els.map((e) => e.dataset.llTool))).join(); expect(mine === 'lists', `the bench of lesson 5 shows its one instrument: مِنضدة القائمتين (${mine})`); }
if (await page.locator('svg[data-ll-lists]').count() === 0) await page.click('[data-ll-tool="lists"]');
await page.waitForSelector('svg[data-ll-lists]');
{
  const [a, b] = [40, 56];
  await setNum('a', a); await setNum('b', b);
  // what the sheet must hold — computed HERE from a and b, never read from the instrument
  const divs = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
  const common = divs(a).filter((d) => b % d === 0);
  const g = Math.max(...common);
  const steps = Math.max(Math.floor(Math.sqrt(a)), Math.floor(Math.sqrt(b))); // a list closes once (d + 1)² passes its number
  expect(await page.getAttribute('svg[data-ll-lists]', 'data-tried') === '0' && await page.getAttribute('[data-ll-try]', 'data-ll-try') === '1', `new numbers open a blank sheet: nothing tried, « جرّب 1 » (${a} and ${b})`);
  let presses = 0;
  while ((await page.getAttribute('[data-ll-try]', 'data-ll-try')) && presses < 20) { await page.click('[data-ll-try]'); presses += 1; await page.waitForTimeout(120); }
  await page.waitForTimeout(700); // the links and the crown are drawn after the lists close
  const lists = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('g[data-ll-list]')].map((el) => [el.dataset.llList, { n: Number(el.dataset.llN), done: el.dataset.llDone, all: el.dataset.all }])));
  expect(presses === steps && await page.getAttribute('svg[data-ll-lists]', 'data-done') === 'true', `« جرّب » pressed ${presses} times — ${steps} tries close both lists (${steps + 1} × ${steps + 1} > ${b})`);
  expect(lists.A?.n === a && lists.A.done === 'true' && lists.A.all.split(',').map(Number).sort((x, y) => x - y).join() === divs(a).join()
    && lists.B?.n === b && lists.B.done === 'true' && lists.B.all.split(',').map(Number).sort((x, y) => x - y).join() === divs(b).join(),
  `the two lists are closed and whole: ${a} → ${divs(a).join(' ، ')} · ${b} → ${divs(b).join(' ، ')} (${JSON.stringify(lists)})`);
  const links = await page.locator('g[data-ll-link]').evaluateAll((els) => els.map((e) => Number(e.dataset.llLink)));
  const crowned = await page.locator('g[data-ll-link] [data-ll-crown]').evaluateAll((els) => els.map((e) => Number(e.closest('g[data-ll-link]').dataset.llLink)));
  expect(links.sort((x, y) => x - y).join() === common.join() && crowned.join() === String(g), `a line joins ${common.join(' ، ')} — the numbers in both lists — and ${g} wears the crown (links ${links.join()}, crown ${crowned.join()})`);
  expect(await page.getAttribute('[data-ll-common]', 'data-ll-common') === common.join() && await page.getAttribute('[data-ll-g]', 'data-ll-g') === String(g), `the reading writes them: « في القائمتين: ${common.join('، ')} — أكبرها ${g} »`);
  await shot(`lists-${a}-${b}`);
  await page.click('[data-ll-reset]'); await page.waitForTimeout(200);
  expect(await page.getAttribute('svg[data-ll-lists]', 'data-tried') === '0' && await page.locator('g[data-ll-link]').count() === 0, '« من جديد » clears the sheet: nothing tried, no link');
}
await page.click('[data-ll-close]');
expect(await page.locator('.ll-root').count() === 0 && await page.locator('[data-di-lab-open]').count() === 1, 'closing the lab returns to the world of lesson 5');

// ══ 2. another lesson — the PGCD (lesson 6, in its game world since 2026-11-19): its own instrument, and the cabinet of everything before it ══
await page.goto(`${BASE}/bahth-pgcd`, { waitUntil: 'networkidle' }); heard = 0;
await page.waitForSelector('[data-di-lab-open]'); await page.click('[data-di-lab-open]'); await page.waitForSelector('[data-lesson-lab="bahth-pgcd"]');
await page.waitForSelector('[data-ll-mine] [data-ll-tool]'); // the rail is drawn once the lab has loaded its instruments
{ const mine = (await page.locator('[data-ll-mine] [data-ll-tool]').evaluateAll((els) => els.map((e) => e.dataset.llTool))).join(); expect(mine === 'euclid', `the PGCD lesson opens the SAME lab from its world: its one instrument is مربّعات إقليدس (${mine})`); }
if (await page.locator('[data-ll-euclid]').count() === 0) await page.click('[data-ll-tool="euclid"]');
await page.waitForSelector('[data-ll-euclid]');
expect(await page.getAttribute('[data-ll-stars]', 'data-ll-stars') !== '0', 'the missions made in the other lesson are still counted: one toolbox for the student');
await setNum('a', 48); await setNum('b', 18);
const squares = Number(await page.getAttribute('[data-ll-euclid]', 'data-squares'));
for (let i = 0; i < squares; i += 1) await page.click('[data-ll-cut]');
await page.waitForTimeout(300);
expect(squares === 5 && (await page.textContent('[data-ll-lines]')).includes('12 = 6 × 2 + 0') && (await page.textContent('[data-ll-lines]')).includes('48 = 18 × 2 + 12'), 'مربّعات إقليدس: 48 × 18 is cut in 5 squares, and each family of squares wrote its division (48 = 18 × 2 + 12 … 12 = 6 × 2 + 0)');
expect(await page.getAttribute('[data-ll-pgcd]', 'data-ll-pgcd') === '6' && await quest('one') === '1' && await quest('three') === '1', 'the last square has side 6: the PGCD — and the missions are ticked');
{ // every text of the drawing stays inside the stage (a clipped label is a wrong drawing)
  const out = await page.evaluate(() => { const st = document.querySelector('.ll-stage').getBoundingClientRect(); return [...document.querySelectorAll('.ll-draw svg text')].filter((t) => { const r = t.getBoundingClientRect(); return r.left < st.left - 1 || r.right > st.right + 1 || r.top < st.top - 1 || r.bottom > st.bottom + 1; }).map((t) => t.textContent); });
  expect(out.length === 0, `the three divisions are written beside the rectangle, fully visible (${out.join(' | ') || 'none clipped'})`);
}
await shot('euclid-48-18');
{ await page.waitForTimeout(400); const s7 = await since(); expect(s7.filter((x) => x === 'snip').length === 5 && s7.includes('pencil') && s7.includes('crown'), `إقليدس: five snips of the scissors, the pencil writes each division, the last square is crowned (${[...new Set(s7)].join(' ')})`); }
{ const u = Math.min(640 / 48, 318 / 18, 46); await dragTo('[data-ll-corner]', 48 + 30 * u, 14 + 12 * u); }
expect(await page.inputValue('[data-ll-input="a"]') === '30' && await page.inputValue('[data-ll-input="b"]') === '12' && await page.getAttribute('[data-ll-euclid]', 'data-cut') === '0', 'dragging the CORNER makes another rectangle (30 × 12), uncut');
await page.click('[data-ll-cabinet-open]'); await page.waitForSelector('[data-ll-cabinet]');
{
  const grades = await page.locator('[data-ll-grade]').evaluateAll((els) => els.map((e) => e.dataset.llGrade));
  expect(grades.join() === '1am,2am,4am', 'its cabinet has three grades: 1AM, 2AM and the earlier lessons of 4AM');
  // the shelf may hold more lessons than a page shows: every page is read, through the pager (« ‹ 1 / 2 › »)
  const lessons = [];
  for (let k = 0; k < 4; k += 1) {
    lessons.push(...(await page.locator('[data-ll-cabinet-lesson]').evaluateAll((els) => els.map((e) => e.dataset.llCabinetLesson))));
    const next = page.locator('[data-ll-cabinet] footer button').last();
    if (!(await next.count()) || (await next.isDisabled())) break;
    if (k === 0) await shot('cabinet-pgcd-page-1');
    await next.click(); await page.waitForTimeout(250);
  }
  expect(lessons.join() === 'qasim-adad-tabii,qawasim-adad-tabii,khawass-qawasim,qasim-mushtarak-akbar,tayin-pgcd', 'the 4AM shelf: the five earlier lessons that have instruments (lesson 5 « مِنضدة القائمتين » since 2026-11-19)');
  await shot('cabinet-pgcd');
  await page.click('[data-ll-grade="1am"]');
  expect((await page.locator('[data-ll-cabinet-tool]').evaluateAll((els) => els.map((e) => e.dataset.llCabinetTool))).join() === 'paper,rules', 'the 1AM shelf is one tap away');
  await page.click('[data-ll-grade="4am"]');
}
await page.click('[data-ll-cabinet-tool="divisors"]'); await page.waitForSelector('[data-ll-divisors]');
await setNum('a', 36);
await dragTo('[data-ll-lens]', 896);
{
  const box = await page.locator('.ll-draw > svg').boundingBox(); const k = Math.min(box.width / 940, box.height / 370); const ox = box.x + (box.width - 940 * k) / 2; const oy = box.y + (box.height - 370 * k) / 2;
  await page.mouse.move(ox + 896 * k, oy + 268 * k); await page.mouse.down(); await page.mouse.move(ox + 44 * k, oy + 268 * k, { steps: 120 }); await page.mouse.up(); await page.waitForTimeout(250);
}
expect(await page.getAttribute('[data-ll-divisors]', 'data-found') === '1,2,3,4,6,9,12,18,36' && await page.locator('[data-ll-complete]').count() === 1, 'قوس القواسم: sweeping the lens over the line finds the nine divisors of 36, each with its partner');
expect(await quest('all') === '1' && await quest('odd') === '1', 'an odd number of divisors: the mission is ticked');
await shot('divisors-36');
await page.click('[data-ll-cabinet-open]'); await page.click('[data-ll-cabinet-tool="planks"]'); await page.waitForSelector('[data-ll-planks]');
await setNum('a', 21); await setNum('b', 35);
{
  const [a, b] = [21, 35]; const plankAt = (d) => 236 + d * planksWanted(a, b, d).u; // the drawing spans 236 → 908 for max(a + b, 3a) = 63 units
  const opening = planksDiff(await planksDrawn(), planksWanted(a, b, 4), a, b, 4);
  expect(opening.length === 0 && await quest('both') === '0' && await quest('sum') === '0', `اللوح المشترك opens on a plank of 4 along the six lengths, nothing ticked before the hand moves it (${opening.join(' | ') || 'drawn as computed'})`);
  await dragTo('[data-ll-plank]', plankAt(7), 34);
  const seven = planksDiff(await planksDrawn(), planksWanted(a, b, 7), a, b, 7);
  expect(await page.getAttribute('[data-ll-planks]', 'data-d') === '7' && seven.length === 0, `dragging the plank to 7: 3 green planks in 21, 5 in 35, 8 in 56, 2 in 14 (twice), 9 in 63 — every row ✓, « 7 قاسم للعددين 21 و 35 » (${seven.join(' | ') || 'drawn as computed'})`);
  expect(await quest('both') === '1' && await quest('rest') === '1', 'two missions of the planks are ticked by what was made');
  await shot('planks-21-35-7');
  await dragTo('[data-ll-plank]', plankAt(14), 34);
  const fourteen = planksDiff(await planksDrawn(), planksWanted(a, b, 14), a, b, 14);
  expect(await page.getAttribute('[data-ll-planks]', 'data-d') === '14' && fourteen.length === 0, `a plank of 14: 21 and 35 each keep a dashed 7 (as does 63), yet their sum 56 is filled by 4, the difference and the remainder by 1 (${fourteen.join(' | ') || 'drawn as computed'})`);
  expect(await quest('sum') === '1', '« a plank that fills the sum and neither length » is ticked');
  await dragTo('[data-ll-plank]', plankAt(5), 34);
  const five = planksDiff(await planksDrawn(), planksWanted(a, b, 5), a, b, 5);
  expect(await page.getAttribute('[data-ll-planks]', 'data-d') === '5' && five.length === 0, `a plank of 5 fills 35 alone: 21 keeps 1, 56 keeps 1, 14 keeps 4, 63 keeps 3, no « قاسم » chip (${five.join(' | ') || 'drawn as computed'})`);
}
await setNum('a', 36); // the numbers are shared: the next instrument is read on 36
await page.click('[data-ll-cabinet-open]');
// the 4AM shelf has five lessons since lesson 5: three a page, « القواسم المشتركة » (lesson 4) is on its second page
for (let k = 0; k < 3 && !(await page.locator('[data-ll-cabinet-tool="common"]').count()); k += 1) { await page.locator('[data-ll-cabinet] footer button').last().click(); await page.waitForTimeout(250); }
await page.click('[data-ll-cabinet-tool="common"]'); await page.waitForSelector('[data-ll-view="common"]');
await setNum('b', 24);
expect(await page.getAttribute('[data-ll-pgcd]', 'data-ll-pgcd') === '12' && await page.locator('[data-ll-zone="both"] .ll-dchip.is-top').count() === 1 && (await page.locator('[data-ll-zone="both"] [data-ll-d]').evaluateAll((els) => els.map((e) => e.dataset.llD))).join() === '1,2,3,4,6,12', 'القواسم المشتركة of 36 and 24: 1, 2, 3, 4, 6, 12 — the 12 wears the crown');
await shot('common-36-24');
await page.click('[data-ll-close]'); await page.waitForTimeout(500);
expect(await page.locator('.ll-root').count() === 0 && await page.locator('[data-di-lab-open]').count() === 1, 'closing the lab returns to the world of lesson 6');

// ══ 2bis. lesson 7 (in its game world since 2026-11-20 — its mission home and its door `[data-mission-lab]` are gone): the SAME lab, its one instrument ══
await page.goto(`${BASE}/awwaliyan-fima-baynahuma`, { waitUntil: 'networkidle' }); heard = 0;
await page.waitForSelector('[data-di-lab-open]'); await page.click('[data-di-lab-open]'); await page.waitForSelector('[data-lesson-lab="awwaliyan-fima-baynahuma"]');
await page.waitForSelector('[data-ll-mine] [data-ll-tool]');
{ const mine = (await page.locator('[data-ll-mine] [data-ll-tool]').evaluateAll((els) => els.map((e) => e.dataset.llTool))).join(); expect(mine === 'duo', `lesson 7 opens the lab from its world: its one instrument is مِجهر العددين (${mine})`); }
if (await page.locator('[data-ll-duo]').count() === 0) await page.click('[data-ll-tool="duo"]');
await page.waitForSelector('[data-ll-duo]');
// ONE gesture per face, ONE screenshot per face — every reading checked by the walk's own arithmetic
{
  const g = (x, y) => (y ? g(y, x % y) : x);
  const face = () => page.getAttribute('[data-ll-duo]', 'data-face');
  const tab = async (f) => { await page.locator(`[data-ll-face-tab="${f}"]`).dispatchEvent('click'); await page.waitForFunction((want) => document.querySelector('[data-ll-duo]')?.dataset.face === want, f); await page.waitForTimeout(250); };
  if ((await face()) !== 'lists') await tab('lists');
  const lists = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-ll-duo-list]')].map((e) => [e.dataset.llDuoList, e.dataset.all ?? null])));
  const [A, B] = [lists.A, lists.B].map((l) => Number(l.split(',').at(-1)));
  const common = await page.getAttribute('[data-ll-common]', 'data-ll-common');
  const want = Array.from({ length: Math.min(A, B) }, (_, i) => i + 1).filter((d) => A % d === 0 && B % d === 0).join(',');
  expect(common === want, `duo, the lists of ${A} and ${B}: in both ${want} — computed here (${common})`);
  await page.locator(`[data-ll-d="${want.split(',').at(-1)}"]`).first().dispatchEvent('click'); await page.waitForTimeout(200);
  await shot('duo-lesson-7-lists');
  await tab('divisions');
  expect(await page.getAttribute('[data-ll-duo-divisions]', 'data-written') === '0', 'duo, the divisions: nothing written on opening');
  await page.click('[data-ll-next]'); await page.click('[data-ll-next]'); await page.waitForTimeout(300);
  expect(await page.getAttribute('[data-ll-duo-divisions]', 'data-written') === '2', 'duo, the divisions: two taps, two rows written');
  await shot('duo-lesson-7-divisions');
  await tab('probe');
  const d0 = Number(await page.getAttribute('[data-ll-duo-probe]', 'data-d'));
  console.log(`    the probe opens on ${d0}`);
  // `[data-ll-plus="true"]`: the instrument's own « + » — the numbers panel's steppers carry `data-ll-plus="a|b"` too
  await page.click('[data-ll-plus="true"]');
  await page.waitForFunction((was) => Number(document.querySelector('[data-ll-duo-probe]')?.dataset.d) !== was, d0, { timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(200);
  const d = Number(await page.getAttribute('[data-ll-duo-probe]', 'data-d'));
  const v = await page.getAttribute('[data-ll-verdict]', 'data-ll-verdict');
  // the two numbers the probe draws (its bars), read as the question — the verdict computed here
  const [pa, pb] = await page.evaluate(() => ['a', 'b'].map((k) => Number(document.querySelector(`[data-ll-duo-bar="${k}"]`)?.dataset.n)));
  const truth = pa % d === 0 && pb % d === 0 ? 'both' : pa % d === 0 ? 'a' : pb % d === 0 ? 'b' : 'none';
  expect(d === d0 + 1 && v === truth, `duo, the probe: « + » tries ${d} on ${pa} and ${pb}: « ${truth} » — computed here (${v}; PGCD ${g(pa, pb)})`);
  await shot('duo-lesson-7-probe');
}
await page.click('[data-ll-close]'); await page.waitForTimeout(500);
expect(await page.locator('.ll-root').count() === 0 && await page.locator('[data-di-lab-open]').count() === 1, 'closing the lab returns to the world of lesson 7');

// ══ 2ter. lesson 8 (in its game world since 2026-11-20 — its mission home and its door `[data-mission-lab]` are gone): the SAME lab, its one instrument ══
await page.goto(`${BASE}/ikhtizal-kasr`, { waitUntil: 'networkidle' }); heard = 0;
await page.waitForSelector('[data-di-lab-open]'); await page.click('[data-di-lab-open]'); await page.waitForSelector('[data-lesson-lab="ikhtizal-kasr"]');
await page.waitForSelector('[data-ll-mine] [data-ll-tool]');
{ const mine = (await page.locator('[data-ll-mine] [data-ll-tool]').evaluateAll((els) => els.map((e) => e.dataset.llTool))).join(); expect(mine === 'strip', `lesson 8 opens the lab from its world: its one instrument is شريط الكسر (${mine})`); }
if (await page.locator('[data-ll-strip]').count() === 0) await page.click('[data-ll-tool="strip"]');
await page.waitForSelector('[data-ll-strip]');
// ONE gesture (the instrument's own « + »), ONE screenshot — the verdict checked by the walk's own arithmetic
{
  const k0 = Number(await page.getAttribute('[data-ll-strip]', 'data-k'));
  const [a, b] = await page.evaluate(() => ['a', 'b'].map((k) => Number(document.querySelector('[data-ll-strip-bar]')?.dataset[k])));
  await page.click('[data-ll-strip-plus]');
  await page.waitForFunction((was) => Number(document.querySelector('[data-ll-strip]')?.dataset.k) !== was, k0, { timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(200);
  const k = Number(await page.getAttribute('[data-ll-strip]', 'data-k'));
  const v = await page.getAttribute('[data-ll-strip]', 'data-verdict');
  const want = Math.min(k0 + 1, Math.max(2, a, b));
  const truth = a % k === 0 && b % k === 0 ? 'both' : a % k === 0 ? 'a' : b % k === 0 ? 'b' : 'none';
  expect(k === want && v === truth, `strip, ${a}/${b}: « + » lays a piece of ${k} (from ${k0}): « ${truth} » — computed here (${v})`);
  await shot('strip-lesson-8');
}
await page.click('[data-ll-close]'); await page.waitForTimeout(500);
expect(await page.locator('.ll-root').count() === 0 && await page.locator('[data-di-lab-open]').count() === 1, 'closing the lab returns to the world of lesson 8');

}

if (!ONLY || ONLY === '2quater') {
// ══ 2quater. « الجذر التربيعي لعدد موجب » (unit 2, in its game world « قصر الساحات »): its one instrument « ساحة العدد » ══
// written 2026-11-21, NOT run yet. Every reading is checked against the walk's OWN integer arithmetic (never the tool's).
await page.goto(`${BASE}/jidhr-tarbii`, { waitUntil: 'networkidle' }); heard = 0;
await page.waitForSelector('[data-di-lab-open]'); await page.click('[data-di-lab-open]'); await page.waitForSelector('[data-lesson-lab="jidhr-tarbii"]');
await page.waitForSelector('[data-ll-mine] [data-ll-tool]');
{ const mine = (await page.locator('[data-ll-mine] [data-ll-tool]').evaluateAll((els) => els.map((e) => e.dataset.llTool))).join(); expect(mine === 'court', `jidhr-tarbii opens the lab from its world: its one instrument is ساحة العدد (${mine})`); }
if (await page.locator('[data-ll-court]').count() === 0) await page.click('[data-ll-tool="court"]');
await page.waitForSelector('[data-ll-court]');
{
  const isq = (n) => { let x = 0; while ((x + 1) * (x + 1) <= n) x += 1; return x; };
  const h2 = (h) => `${Math.floor(h / 100)},${String(h % 100).padStart(2, '0')}`;
  /** What the court must draw for a and s — computed here. */
  const want = (a, s) => ({ s: String(s), verdict: s * s === a ? 'fits' : s * s < a ? 'out' : 'holes', inside: String(Math.min(a, s * s)), out: String(Math.max(0, a - s * s)), holes: String(Math.max(0, s * s - a)) });
  const drawn = () => page.evaluate(() => { const d = document.querySelector('[data-ll-court]').dataset; return { s: d.s, verdict: d.verdict, inside: d.inside, out: d.out, holes: d.holes }; });
  const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
  const side = async () => Number(await page.getAttribute('[data-ll-court]', 'data-s'));
  await setNum('a', 30);
  const s0 = await side();
  expect(same(await drawn(), want(30, s0)) && (await page.getAttribute('[data-ll-court-facts]', 'data-ll-court-facts')) === 'open' && await quest('bracket') === '0', `ساحة العدد, 30 tiles in a square of ${s0}: drawn as computed, nothing written about the court before the hand settles it`);
  console.log('    text on screen (px): facts', await px('.ll-court__facts p'), '· reading', await px('.ll-reading__text'));
  await shot('court-30-opening');
  // the hand: « + » up to 6 (a square too big: its empty places), then « − » to 5 (the greatest whole square)
  for (let s = s0; s < 6; s += 1) await page.click('[data-ll-court-plus]');
  await page.waitForTimeout(200);
  expect(same(await drawn(), want(30, 6)) && await page.locator('[data-ll-court-hole]').count() === 6, 'a square of 6: 30 tiles inside, 6 places left empty, drawn dashed');
  await page.click('[data-ll-court-minus]'); await page.waitForTimeout(250);
  const k = isq(30); const lo = isq(30 * 10000);
  expect(same(await drawn(), want(30, 5)) && await page.locator('[data-ll-court-out]').count() === 30 - k * k, 'back to 5: 25 tiles inside, the 5 that do not fit along its border');
  expect((await page.getAttribute('[data-ll-court-facts]', 'data-ll-court-facts')) === 'settled' && (await page.getAttribute('[data-ll-court-whole]', 'data-ll-court-whole')) === `${k}:${30 - k * k}` && (await page.getAttribute('[data-ll-court-bracket]', 'data-ll-court-bracket')) === `${k}:${k + 1}` && (await page.getAttribute('[data-ll-court-near]', 'data-ll-court-near')) === `${h2(lo)}:${h2(lo + 1)}`, `5 and 6 tried: the court is written — 5 × 5 = 25, 5 left, 5 < √30 < 6, ${h2(lo)} < √30 < ${h2(lo + 1)} (computed here)`);
  await shot('court-30-settled');
  // a perfect square, by a real drag of the handle: 144 tiles and a side of 12 fill the court
  await setNum('a', 144);
  {
    const svg = await page.locator('[data-ll-court]').boundingBox(); const kk = Math.min(svg.width / 560, svg.height / 370);
    const ox = svg.x + (svg.width - 560 * kk) / 2; const oy = svg.y + (svg.height - 370 * kk) / 2;
    const at = (v) => ({ x: ox + (50 + (v - 1) * (470 / 20)) * kk, y: oy + 40 * kk }); // the ruler: 1 at 50, 21 at 520, y = 40
    const from = at(await side()); const to = at(12);
    await page.mouse.move(from.x, from.y); await page.mouse.down(); await page.mouse.move(to.x, to.y, { steps: 12 }); await page.mouse.up(); await page.waitForTimeout(300);
  }
  expect(same(await drawn(), want(144, 12)) && (await page.getAttribute('[data-ll-court-root]', 'data-ll-court-root')) === String(isq(144)) && await page.locator('[data-ll-court-bracket]').count() === 0, 'dragging the side to 12 on 144: the square is full, √144 = 12, no bracket');
  expect(await quest('exact') === '1', '« a court above 100 filled by a whole square » is ticked by what was made');
  const heardCourt = await since();
  expect(heardCourt.includes('tick') && heardCourt.includes('fit'), `the side ticks, the full square chimes (${heardCourt.join(' ')})`);
  await shot('court-144-fits');
}
await page.click('[data-ll-close]'); await page.waitForTimeout(500);
expect(await page.locator('.ll-root').count() === 0 && await page.locator('[data-di-lab-open]').count() === 1, 'closing the lab returns to the world of jidhr-tarbii');

}

if (!ONLY || ONLY === '2quinquies') {
// ══ 2quinquies. « الأعداد الناطقة والأعداد غير الناطقة » (unit 2, lesson 2, « قصر الساحات »): its one instrument « منصّة الكسر » ══
// written 2026-11-21, NOT run yet. Every count is checked against the walk's OWN integer arithmetic (never the tool's).
await page.goto(`${BASE}/natiqa-ghayr-natiqa`, { waitUntil: 'networkidle' }); heard = 0;
await page.waitForSelector('[data-di-lab-open]'); await page.click('[data-di-lab-open]'); await page.waitForSelector('[data-lesson-lab="natiqa-ghayr-natiqa"]');
await page.waitForSelector('[data-ll-mine] [data-ll-tool]');
{ const mine = (await page.locator('[data-ll-mine] [data-ll-tool]').evaluateAll((els) => els.map((e) => e.dataset.llTool))).join(); expect(mine === 'piece', `natiqa-ghayr-natiqa opens the lab from its world: its one instrument is منصّة الكسر (${mine})`); }
if (await page.locator('[data-ll-piece]').count() === 0) await page.click('[data-ll-tool="piece"]');
await page.waitForSelector('[data-ll-piece]');
{
  /** What a rod of p/q over a court of a tiles must count — computed here: p × p pieces against a × q × q. */
  const want = (a, q, p) => { const court = a * q * q; const plat = p * p; return { q: String(q), p: String(p), court: String(court), plat: String(plat), verdict: plat === court ? 'fits' : plat < court ? 'band' : 'jam', far: String(Math.abs(plat - court)) }; };
  const drawn = () => page.evaluate(() => { const d = document.querySelector('[data-ll-piece]').dataset; return { q: d.q, p: d.p, court: d.court, plat: d.plat, verdict: d.verdict, far: d.far }; });
  const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
  const rodP = async () => Number(await page.getAttribute('[data-ll-piece]', 'data-p'));
  const best = () => page.getAttribute('[data-ll-piece-best]', 'data-ll-piece-best').catch(() => null);
  await setNum('a', 2); await setNum('b', 5);
  const p0 = await rodP();
  expect(same(await drawn(), want(2, 5, p0)) && await page.locator('[data-ll-piece-best]').count() === 0 && await quest('one') === '0', `منصّة الكسر, a court of 2 cut in 5 × 5 and a rod of ${p0}/5: counted as computed, no nearest rod before the hand moves`);
  console.log('    text on screen (px): facts', await px('.ll-court__facts p'), '· reading', await px('.ll-reading__text'));
  await shot('piece-2-5-opening');
  // the hand: « + » / « − » to 7/5 — 49 pieces against 50, a band of ONE piece, the nearest rod kept
  for (let p = p0; p !== 7; p += p < 7 ? 1 : -1) await page.click(p < 7 ? '[data-ll-piece-plus]' : '[data-ll-piece-minus]');
  await page.waitForTimeout(250);
  expect(same(await drawn(), want(2, 5, 7)) && (await page.getAttribute('[data-ll-piece-verdict]', 'data-ll-piece-verdict')) === 'band' && await best() === '7:5:1', 'the rod 7/5: 49 pieces against 50 — a band of one piece, kept as the nearest rod');
  expect(await quest('one') === '1', '« one piece apart, denominator above 4 » is ticked by what was made');
  await shot('piece-2-5-seven');
  // a finer denominator keeps the rod's length: 7/5 → 17/12, 289 against 288 — one piece over, and nearer in tiles
  await setNum('b', 12); await page.waitForTimeout(250);
  expect(same(await drawn(), want(2, 12, Math.round((7 * 12) / 5))) && await best() === '17:12:1' && await quest('close') === '1', 'denominator 12: the rod becomes 17/12 — 289 against 288, one piece over, the nearest rod (1/144 of a tile), « under a hundredth » ticked');
  await shot('piece-2-12');
  // a perfect square, by a real drag of the handle: 16 tiles in 3 × 3 pieces, the rod 12/3 covers it exactly
  await setNum('a', 16); await setNum('b', 3);
  {
    const pMax = Math.floor(Math.sqrt(16 * 9)) + 3 + 1; // one tile beyond the court's side (integers: 144 is 12 × 12)
    const svg = await page.locator('[data-ll-piece]').boundingBox(); const kk = Math.min(svg.width / 560, svg.height / 370);
    const ox = svg.x + (svg.width - 560 * kk) / 2; const oy = svg.y + (svg.height - 370 * kk) / 2;
    const at = (v) => ({ x: ox + (50 + ((v - 1) * 470) / (pMax - 1)) * kk, y: oy + 34 * kk }); // the ruler: 1 at 50, pMax at 520, y = 34
    const from = at(await rodP()); const to = at(12);
    await page.mouse.move(from.x, from.y); await page.mouse.down(); await page.mouse.move(to.x, to.y, { steps: 12 }); await page.mouse.up(); await page.waitForTimeout(300);
  }
  expect(same(await drawn(), want(16, 3, 12)) && await best() === '12:3:0' && await page.locator('[data-ll-piece-grid="3"]').count() === 1, 'dragging the rod to 12/3 on 16: 144 pieces each — it covers the court exactly, its pieces drawn');
  expect(await quest('exact') === '1', '« a court above 10 covered exactly, denominator above 1 » is ticked by what was made');
  const heardPiece = await since();
  expect(heardPiece.includes('tick') && heardPiece.includes('fit') && heardPiece.includes('rest'), `the rod ticks, a band rests, the exact cover chimes (${heardPiece.join(' ')})`);
  await shot('piece-16-3-fits');
}
await page.click('[data-ll-close]'); await page.waitForTimeout(500);
expect(await page.locator('.ll-root').count() === 0 && await page.locator('[data-di-lab-open]').count() === 1, 'closing the lab returns to the world of natiqa-ghayr-natiqa');

}

if (!ONLY) {
// ══ 3. a lesson with nothing before it has no lab door ══
await page.goto(`${process.env.E2E_BASE || 'http://localhost:5173'}/courses/moyen/1am/ansab_al_aadad_wal_hisab/kitabat-adad-tabii?lab=1`, { waitUntil: 'networkidle' }); heard = 0;
await page.waitForTimeout(800);
expect(await page.locator('.ll-root').count() === 0 && await page.locator('[data-lesson-lab-open], [data-mission-lab]').count() === 0, 'the very first lesson of 1AM: no instrument is reached yet — no door, no lab');
}
expect(errors.length === 0, 'no page error');
await browser.close();
