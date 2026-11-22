// « عُدّة الانطلاق » — walk of the LAUNCH of a lesson as a STUDENT (simulated session, no API), on the pilot lesson.
// The first « ابدأ » plays the launch before the world: two tools from the learning net, the three gestures, ✓ / « سنعود إليه »
// and never the answer, the quick workshop that repairs the weakest tool, the kit laid out with ONE lesson to revise, a tool
// re-checked, the take-off. Then: the launch is played once; a second student misses everything, leaves to the earlier lesson
// and comes back by the return button. Nothing may scroll, at any moment. The walk also LISTENS (window.__launchSounds).
// At every screenshot, besides the layout: no visible text under 12 px (`lib/walk.mjs › tinyText`, the floor of every walk).
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/launch-kit.mjs [outDir]
import { chromium } from 'playwright';
import { GL_ARGS } from './lib/gpu.mjs';
import { tinyText } from './lib/walk.mjs';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

const LESSON = `${process.env.E2E_BASE || 'http://localhost:5173'}/courses/moyen/4am/ansab_al_aadad_wal_hisab/qasim-adad-tabii`;
const OUT = process.argv[2] || `${tmpdir()}/launch-kit`;
const SIZE = (process.env.E2E_SIZE || '1366x768').split('x').map(Number);
mkdirSync(OUT, { recursive: true });
const expect = (cond, msg) => { if (!cond) { console.log('FAIL', msg); process.exitCode = 1; if (process.env.E2E_SOFT !== '1') throw new Error(msg); return; } console.log('ok  ', msg); };
const browser = await chromium.launch({ args: GL_ARGS });
const errors = []; let n = 0; let page;

async function student(id, fast = false) {
  const ctx = await browser.newContext({ viewport: { width: SIZE[0], height: SIZE[1] }, ...(process.env.E2E_TOUCH === '1' ? { hasTouch: true, isMobile: true } : {}) });
  await ctx.addInitScript(([uid, quick]) => {
    window.__paperFast = true; window.__launchFast = quick;
    localStorage.setItem('token', 'qa-fake-token');
    const real = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('/api/')) return new Response(JSON.stringify(url.includes('/auth/me') ? { success: true, user: { id: uid, name: 'تلميذ', role: 'student', roles: ['student'], email_verified_at: '2026-09-01T00:00:00Z', emailVerified: true, nameComplete: true, level: '4am', grade: '4am' } } : { success: true, data: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      return real(input, init);
    };
  }, [id, fast]);
  const p = await ctx.newPage(); p.on('pageerror', (e) => { errors.push(e.message); console.log('pageerror', e.message); });
  return p;
}

/** Nothing scrolls, nothing leaves the screen or its panel — checked at every screenshot. */
const shot = async (name) => {
  await page.waitForTimeout(350);
  const bad = await page.evaluate((phone) => {
    const out = []; const root = document.querySelector('.lk-root'); if (!root) return ['no launch on screen'];
    for (const el of root.querySelectorAll('*')) { const cs = getComputedStyle(el); if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 2 && !(phone && (el.classList.contains('lk-stage') || el.classList.contains('lk-capbody')))) out.push(`scrolls: ${el.className}`); } // on a phone held sideways the STAGE and a capsule's body slide inside themselves (GAME_WORLD.md « On a phone », rule 3); the bag never does
    const stage = root.querySelector('.lk-stage').getBoundingClientRect(); const bag = root.querySelector('.lk-bag').getBoundingClientRect();
    for (const el of root.querySelectorAll('.lk-head, .lk-bag, .lk-stage, .lk-memo')) { const r = el.getBoundingClientRect(); if (r.top < -1 || r.bottom > window.innerHeight + 1 || r.left < -1 || r.right > window.innerWidth + 1) out.push(`leaves the screen: ${el.className}`); }
    if (!phone)
      for (const el of root.querySelectorAll('.lk-stage button, .lk-prompt, .lk-equation, .lk-card, .lk-box, .lk-example li, .lk-kcard, .lk-revise, .lk-score, .lk-result h3, .lk-intro > *')) { const r = el.getBoundingClientRect(); if (r.height > 0 && (r.top < stage.top - 1 || r.bottom > stage.bottom + 1 || r.left < stage.left - 1 || r.right > stage.right + 1)) out.push(`out of the stage: ${el.className} « ${el.textContent.slice(0, 24)} »`); }
    for (const el of root.querySelectorAll('.lk-tool, .lk-robot')) { const r = el.getBoundingClientRect(); if (r.top < bag.top - 1 || r.bottom > bag.bottom + 1) out.push(`out of the bag: ${el.className?.baseVal ?? el.className}`); }
    for (const el of root.querySelectorAll('.lk-prompt, .lk-example ol, .lk-revise > div, .lk-kit')) if (el.scrollWidth > el.clientWidth + 3 || (!phone && el.scrollHeight > el.clientHeight + 3)) out.push(`overflows: ${el.className}`); // on a phone what is taller than the stage slides with it; nothing may be wider
    return out;
  }, process.env.E2E_TOUCH === '1' && SIZE[1] <= 500);
  for (const t of await tinyText(page)) bad.push(`text under 12 px: ${t}`);
  if (bad.length) { console.log('FAIL at «', name, '»:', [...new Set(bad)].join(' | ')); process.exitCode = 1; if (process.env.E2E_SOFT !== '1') throw new Error(`layout at ${name}`); }
  n += 1; await page.screenshot({ path: `${OUT}/${String(n).padStart(2, '0')}-${name}.png` });
};
const px = (sel) => page.evaluate((s) => { const el = document.querySelector(s); const z = Number(document.querySelector('.lk-fit').style.zoom || 1); return el ? Math.round(parseFloat(getComputedStyle(el).fontSize) * z) : 0; }, sel);
const cur = () => page.evaluate(() => window.__launch.cur);
const tool = async (item) => ({ band: await page.getAttribute(`[data-lk-tool="${item}"]`, 'data-lk-band'), seg: await page.getAttribute(`[data-lk-tool="${item}"]`, 'data-lk-segments') });
let heard = 0; const since = async () => { const all = await page.evaluate(() => [...(window.__launchSounds ?? [])]); const fresh = all.slice(heard); heard = all.length; return fresh; };
const kit = (id) => page.evaluate((uid) => JSON.parse(localStorage.getItem(`u_${uid}_smarter_launch_kit`) ?? 'null'), id);
const A = '1am.m3.r01'; const B = '1am.m3.r02';

/** The greatest multiple of b not beyond a — computed here from the question's two numbers, never read from the game. */
const greatest = (q) => Math.floor(q.a / q.b) * q.b;
/** A wrong place for the flag that is still ON the line: one jump too far, or one jump short when the line ends first. */
const beyond = (q) => (greatest(q) + q.b <= q.max ? greatest(q) + q.b : greatest(q) - q.b);
/** The box of a sort card, computed apart from what it shows: an equality « $a = b \times q ± r$ » is THE Euclidean division of a by b or not (the 1AM level-2 sort); a number is divisible by the rule's k or not. */
const boxOf = (q, c) => { const m = /^\$(\d+) = (\d+) \\times (\d+) ([+-]) (\d+)\$$/.exec(c.text ?? ''); if (!m) return c.n % q.k === 0 ? 'yes' : 'no'; const [a, b, k, r] = [m[1], m[2], m[3], m[5]].map(Number); return m[4] === '+' && a === b * k + r && r < b ? 'yes' : 'no'; };
/** Fills the answer of the question on screen — right or wrong — with real taps, WITHOUT handing it in. Returns the question. */
async function fill(right) {
  const { q } = await cur();
  if (q.gesture === 'write') {
    const tq = Math.floor(q.a / q.b); const tr = q.a % q.b; const [vq, vr] = right ? [tq, tr] : [tq - 1, tr + q.b]; // wrong: a true equality whose remainder is too big
    for (const d of String(vq)) await page.click(`[data-lk-key="${d}"]`);
    await page.click('[data-lk-slot="r"]'); for (const d of String(vr)) await page.click(`[data-lk-key="${d}"]`);
  } else if (q.gesture === 'sort') {
    for (const c of q.cards) { const bin = boxOf(q, c); if (bin !== c.bin) expect(false, `the box of « ${c.text} », computed apart, is the game's (${bin} / ${c.bin})`); await page.click(`[data-lk-send="${right ? bin : bin === 'yes' ? 'no' : 'yes'}"]`); }
  } else {
    const box = await page.locator('[data-lk-line]').boundingBox(); const k = Math.min(box.width / 940, box.height / 250); const ox = box.x + (box.width - 940 * k) / 2; const oy = box.y + (box.height - 250 * k) / 2;
    const at = (v) => ({ x: ox + (46 + (v / q.max) * 848) * k, y: oy + 168 * k });
    const goal = at(right ? greatest(q) : beyond(q)); const from = at(0);
    await page.mouse.move(from.x, from.y); await page.mouse.down(); await page.mouse.move((from.x + goal.x) / 2, goal.y, { steps: 5 }); await page.mouse.move(goal.x, goal.y, { steps: 5 }); await page.mouse.up(); await page.waitForTimeout(150); // let the last move be drawn before the value is read
  }
  return q;
}
const hand = async () => { await page.click('[data-lk-done]'); };
const settle = async () => { await page.waitForFunction(() => !document.querySelector('[data-lk-signal]'), null, { timeout: 5000 }); await page.waitForTimeout(120); };

// ══ 1. the first « ابدأ » plays the launch before the world ══
page = await student(9501);
await page.goto(LESSON, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-di-start]'); await page.click('[data-di-start]'); await page.waitForSelector('[data-launch-kit="qasim-adad-tabii"]');
expect(await page.evaluate(() => window.__world.getState().phase) === 'title', 'the first « ابدأ » opens the launch: the world has not started');
expect((await page.locator('[data-lk-tool]').evaluateAll((els) => els.map((e) => `${e.dataset.lkTool}:${e.dataset.lkBand}:${e.dataset.lkSegments}`))).join() === `${A}:waiting:0,${B}:waiting:0`, 'the bag holds the two earlier الكفاءات the learning net gives for this lesson, both empty');
expect((await page.textContent('[data-lk-bag]')).includes('القسمة الإقليدية') && (await page.textContent('[data-lk-bag]')).includes('من السنة الأولى متوسط'), 'each tool is named in the student’s words, with the year it comes from');
console.log('    text on screen (px): intro', await px('.lk-intro h3'), '· tool', await px('.lk-tool strong'), '· button', await px('.lk-btn--xl'));
await shot('bag');
{ const s0 = await since(); expect(s0.includes('open') && !s0.includes('good'), `the bag opens on its sound (${s0.join(' ')})`); }
await page.click('[data-lk-start]'); await page.waitForSelector('[data-lk-question]');

// ── tool A, station: the very first question is a near-certain win; two misses → « نبدأ منها » ──
let q = (await cur()).q;
expect(q.item === A && q.level === 1 && q.gesture === 'write' && q.a <= 29 && q.b <= 5, `the first question is a very easy one, answered by WRITING (${q.a} ÷ ${q.b})`);
expect(await page.locator('[data-lk-done]').isDisabled(), '« تمّ » waits for a complete answer');
console.log('    text on screen (px): prompt', await px('.lk-prompt'), '· equation', await px('.lk-equation'), '· key', await px('.lk-keys button'));
expect(await px('.lk-prompt') >= (process.env.E2E_TOUCH === '1' && SIZE[1] <= 500 ? 15 : 19), 'the question is comfortable to read');
await page.keyboard.press('7'); await page.keyboard.press('Backspace');
expect((await page.textContent('[data-lk-slot="q"] span')).trim() === '', 'the keyboard of a laptop writes and erases too');
await fill(false); await shot('write');
await hand(); await page.waitForSelector('[data-lk-signal="later"]');
expect((await page.textContent('[data-lk-signal]')).includes('سنعود إليه') && !(await page.textContent('.lk-stage')).includes('خطأ'), 'a miss says « سنعود إليه » — never « wrong », never the right answer');
await shot('signal-later'); await settle();
q = (await cur()).q;
expect(q.item === A && q.level === 1 && q.gesture === 'place', 'a tool is never judged on one answer: a second easy question, by another gesture — PLACING a flag');
await fill(false); { const got = Number(await page.getAttribute('[data-lk-line]', 'data-lk-x')); expect(got === beyond(q), `the flag follows the hand on the line (asked ${beyond(q)}, got ${got}; a = ${q.a}, b = ${q.b})`); } await shot('place');
await hand(); await settle();
expect(JSON.stringify(await tool(A)) === JSON.stringify({ band: 'start', seg: '0' }), 'two easy misses: the tool stays dim — « نبدأ منها »');

// ── tool B, station: sorting; a card taken back; two right answers → « ثابتة », and the game stops asking ──
q = (await cur()).q;
expect(q.item === B && q.level === 1 && q.gesture === 'sort' && q.cards.length === 3, 'the second tool is answered by SORTING three cards into two boxes');
/** Drags the card on screen into a box with the mouse (real pointer events), through the middle of the way. */
const dragCard = async (bin, drop = true) => {
  const c = await page.locator('[data-lk-card]').boundingBox(); const b = await page.locator(`[data-lk-bin="${bin}"]`).boundingBox();
  const from = { x: c.x + c.width / 2, y: c.y + c.height / 2 }; const to = drop ? { x: b.x + b.width / 2, y: b.y + b.height * 0.6 } : { x: from.x, y: from.y + 60 };
  await page.mouse.move(from.x, from.y); await page.mouse.down(); await page.mouse.move((from.x + to.x) / 2, (from.y + to.y) / 2, { steps: 6 }); await page.mouse.move(to.x, to.y, { steps: 6 });
  const over = await page.evaluate(() => document.querySelector('.lk-box.is-over')?.dataset.lkBin ?? null); // no box lit: null
  await page.mouse.up(); await page.waitForTimeout(120); return over;
};
const first = boxOf(q, q.cards[0]); expect(first === q.cards[0].bin, `the box of « ${q.cards[0].text} », computed apart, is the game's`);
const other = first === 'yes' ? 'no' : 'yes';
expect(await dragCard(other, false) === null && await page.locator('[data-lk-placed]').count() === 0 && await page.getAttribute('[data-lk-card]', 'data-lk-card') === q.cards[0].id, 'a card let go outside the boxes comes back to the hand');
expect(await dragCard(other) === other && await page.locator(`[data-lk-bin="${other}"] [data-lk-placed="${q.cards[0].id}"]`).count() === 1, 'the card is DRAGGED into a box: the box lights up under it, and keeps it');
await page.click(`[data-lk-placed="${q.cards[0].id}"]`);
expect(await page.locator('[data-lk-placed]').count() === 0 && await page.getAttribute('[data-lk-card]', 'data-lk-card') === q.cards[0].id, 'a tap takes it back as long as the answer is not handed in: a slip does not count');
await dragCard(first); await shot('sort');
for (const c of q.cards.slice(1)) { const bin = boxOf(q, c); expect(bin === c.bin, `the box of « ${c.text} », computed apart, is the game's`); await page.click(`[data-lk-send="${bin}"]`); }
await hand(); await page.waitForSelector('[data-lk-signal="good"]'); await shot('signal-good');
expect((await tool(B)).seg === '1', 'a right answer lights one segment of the tool at once');
await settle();
q = (await cur()).q; expect(q.item === B && q.level === 2 && [3, 9, 4].includes(q.k), `then a harder one (the rule of ${q.k})`);
await fill(true); await hand(); await settle();
expect(JSON.stringify(await tool(B)) === JSON.stringify({ band: 'solid', seg: '2' }), 'two right answers: the tool is « ثابتة » — and the game stops asking about it');
{ const s1 = await since(); expect(['go', 'key', 'erase', 'later', 'flag', 'lift', 'drop', 'back', 'good', 'charged'].every((x) => s1.includes(x)), `the launch is heard: keys, the flag, the boxes, the two verdicts, a tool fully charged (${[...new Set(s1)].join(' ')})`); }

// ── the quick workshop repairs the weakest tool on the spot ──
await page.waitForSelector(`[data-lk-example="${A}"]`);
expect((await page.textContent('.lk-example__lead')).includes('لا يتجاوز العدد') && await page.locator('[data-lk-step]').count() === 1, 'the workshop opens on the mistake the last answer showed, with the first step of a worked example');
await shot('workshop-example');
{ const len = await page.evaluate(() => window.__launch.cur.ex.steps.length); expect(len === 4, `the worked example of the division has four steps (${len})`); for (let i = 1; i < len; i += 1) { await page.click('[data-lk-step-next]'); await page.waitForTimeout(120); } }
expect(await page.locator('[data-lk-step]').count() === 4 && await page.locator('[data-lk-step-next]').count() === 0 && await page.locator('[data-lk-try]').count() === 1, 'the student reveals the example step by step, then tries');
await shot('workshop-steps');
await page.click('[data-lk-try]'); await page.waitForSelector('[data-lk-qphase="workshop"]');
await fill(true); await shot('workshop-question'); await hand(); await settle();
await fill(true); await hand();
await page.waitForSelector('[data-lk-result]');

// ══ 2. the kit laid out ══
expect(await page.getAttribute('[data-lk-score]', 'data-lk-score') === '3/4' && await page.getAttribute('[data-lk-result]', 'data-lk-percent') === '75', 'the kit: 3 segments out of 4');
expect(await page.getAttribute(`[data-lk-kcard="${A}"]`, 'data-lk-band') === 'consolidate' && (await page.textContent(`[data-lk-kcard="${A}"]`)).includes('أُصلحت الآن'), 'the repaired tool rises to « تحتاج تثبيتًا » — repaired is not yet « ثابتة »');
expect(await page.getAttribute('[data-lk-revise]', 'data-lk-revise') === A && (await page.textContent('[data-lk-revise]')).includes('راجع أوّلًا') && (await page.textContent('[data-lk-revise]')).includes('القسمة الإقليدية'), 'ONE lesson to revise first: the home lesson of the weakest tool');
expect(await page.locator('[data-lk-star]').count() === 0, 'no honesty star: two answers were sure and wrong');
{
  const k = await kit(9501);
  expect(k.items[A].band === 'consolidate' && k.items[A].repaired === true && k.items[B].band === 'solid' && k.lessons['qasim-adad-tabii'].tries === 1 && k.lessons['qasim-adad-tabii'].last.percent === 75, 'the result is written in the student’s toolbox: each tool, the score, one try');
}
await shot('result');
{ const s2 = await since(); expect(s2.includes('step') && s2.includes('repaired') && s2.includes('kit'), `the workshop and the kit are heard (${[...new Set(s2)].join(' ')})`); }
await page.click('[data-lk-memo-open]'); await page.waitForSelector('[data-lk-memo]');
expect((await page.textContent('[data-lk-memo]')).includes('الباقي') && await page.locator('[data-lk-memo] li').count() >= 3, 'the revision card of the tool');
await shot('memo'); await page.click('[data-lk-memo-close]');
await page.click('[data-lk-lab-open]'); await page.waitForSelector('[data-lesson-lab="qasim-adad-tabii"]');
expect(await page.getAttribute('[data-lesson-lab]', 'data-ll-tool-on') === 'paper' && await page.locator('[data-ll-sheet]').count() === 1, '« جرّب الأداة في مختبري » opens the lab ON the instrument of that tool');
await page.click('[data-ll-close]'); await page.waitForFunction(() => !document.querySelector('[data-lesson-lab]'));

// ── a tool re-checked: only that tool is asked again, no workshop, the try is not counted twice ──
await page.click('[data-lk-recheck]'); await page.waitForSelector('[data-lk-question]');
q = (await cur()).q; expect(q.item === A && q.level === 1, '« أعد فحص الأداة » asks that tool again, from the easy question');
await fill(true); await hand(); await settle();
q = (await cur()).q; expect(q.item === A && q.level === 2 && q.gesture === 'sort' && q.cards.length === 3, 'then the harder one: the level-2 SORT of three equalities (asked first at level 2 since 2026-11-18 — unreachable before)');
await fill(true); await shot(`recheck-${q.gesture}`);
await hand(); await page.waitForSelector('[data-lk-result]');
expect(await page.getAttribute('[data-lk-score]', 'data-lk-score') === '4/4' && await page.locator('[data-lk-revise]').count() === 0 && (await page.textContent('.lk-result h3')).includes('كاملة'), 'the kit is complete: nothing to revise');
{ const k = await kit(9501); const l = k.lessons['qasim-adad-tabii']; expect(l.tries === 1 && l.first.percent === 75 && l.last.percent === 100 && k.items[A].band === 'solid', 'the toolbox keeps the first score (75) and the last (100) — a re-check is not a new try'); }
await shot('result-full');

// ── the take-off, then the world ──
await page.click('[data-lk-sound]'); await since(); await page.click('[data-lk-go]'); await page.waitForSelector('[data-lk-liftoff]');
await shot('liftoff');
await page.waitForFunction(() => !document.querySelector('[data-launch-kit]') && window.__world.getState().phase === 'play', null, { timeout: 8000 });
expect((await since()).length === 0, '« الصوت » off: the countdown and the take-off are silent');
expect(await page.locator('[data-launch-kit]').count() === 0 && await page.evaluate(() => window.__world.getState().phase) === 'play', 'after the take-off the lesson starts: the launch is gone, the world plays');

// ══ 3. played once: « واصل » enters the world; « عُدّتي » shows the kit, charged ══
await page.reload({ waitUntil: 'networkidle' }); heard = 0;
await page.waitForSelector('[data-di-start]'); await page.click('[data-di-start]');
await page.waitForFunction(() => window.__world.getState().phase === 'play');
expect(await page.locator('[data-launch-kit]').count() === 0, 'the launch is played ONCE per lesson: the next « واصل » goes straight in');
await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector('[data-di-launch-open]'); await page.click('[data-di-launch-open]'); await page.waitForSelector('[data-launch-kit]');
expect((await page.locator('[data-lk-tool]').evaluateAll((els) => els.map((e) => `${e.dataset.lkBand}:${e.dataset.lkSegments}`))).join() === 'solid:2,solid:2' && (await page.textContent('[data-lk-intro]')).includes('مشحونة من قبل'), '« عُدّتي » on the title screen: the tools measured « ثابتة » arrive charged');
await shot('bag-charged');
await page.click('[data-lk-start]'); await page.waitForSelector('[data-lk-result]');
expect(await page.locator('[data-lk-question]').count() === 0 && await page.getAttribute('[data-lk-score]', 'data-lk-score') === '4/4', 'nothing is asked again: the kit is shown at once');
await page.click('[data-lk-close]');
expect(await page.locator('[data-launch-kit]').count() === 0 && await page.evaluate(() => window.__world.getState().phase) === 'title', 'closing it returns to the title screen');

// ══ 4. a student who misses everything: no dead end — the earlier lesson, and ONE button to come back ══
page = await student(9502, true); heard = 0;
await page.goto(LESSON, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-di-start]'); await page.click('[data-di-start]'); await page.waitForSelector('[data-lk-start]'); await page.click('[data-lk-start]'); await page.waitForSelector('[data-lk-question]');
await fill(false); await page.click('[data-lk-close]'); await page.waitForSelector('[data-lk-quit-box]');
expect((await page.textContent('[data-lk-quit-box]')).includes('تخرج من الشحن؟'), 'leaving in the middle asks first');
await shot('quit'); await page.click('[data-lk-quit-no]');
expect(await page.locator('[data-lk-quit-box]').count() === 0 && await page.locator('[data-lk-question]').count() === 1 && !(await page.locator('[data-lk-done]').isDisabled()), '« أواصل » keeps the question and what was written');
for (let i = 0; i < 4; i += 1) { if (i > 0) await fill(false); await hand(); await page.waitForTimeout(260); }
await page.waitForSelector(`[data-lk-example="${A}"]`);
{ const c = await cur(); expect(c.kind === 'example' && c.item === A && c.level === 1, 'the workshop: the core tool at « نبدأ منها », at the easy level'); for (let i = 1; i < c.ex.steps.length; i += 1) await page.click('[data-lk-step-next]'); expect(await page.locator('[data-lk-step]').count() === c.ex.steps.length && await page.locator('[data-lk-try]').count() === 1, `its worked example revealed step by step (${c.ex.steps.length} steps)`); }
await page.click('[data-lk-try]'); await page.waitForSelector('[data-lk-qphase="workshop"]');
for (let i = 0; i < 2; i += 1) { await fill(false); await hand(); await page.waitForTimeout(260); }
await page.waitForSelector('[data-lk-result]');
expect(await page.getAttribute('[data-lk-score]', 'data-lk-score') === '0/4' && (await page.locator('[data-lk-kcard]').evaluateAll((els) => els.map((e) => e.dataset.lkBand))).join() === 'start,start', 'everything missed: 0 / 4, both tools « نبدأ منها » — the workshop repaired nothing');

// ── THE GATE: the door opens by doing — ONE capsule, for the CORE tool only; then he goes in whatever he answers ──
expect(await page.locator('[data-lk-go]').count() === 0 && await page.getAttribute('[data-lk-gate]', 'data-lk-gate') === A && (await page.textContent('.lk-result h3')).includes('كبسولة'), 'the take-off is replaced by ONE capsule: the one of the core tool (the division), not of the support tool (the rules)');
await shot('gate');
await page.click('[data-lk-capsule-start]'); await page.waitForSelector('[data-lk-capsule-step="card"]');
expect(await page.locator('[data-lk-capsule-card] li').count() >= 3 && await page.locator('.lk-capsteps li').count() === 4 && await page.locator('.lk-capsteps li.is-now').count() === 1, 'the capsule shows its four steps; first the card of the tool');
await shot('capsule-card');
await page.click('[data-lk-capsule-next]'); await page.waitForSelector('[data-lk-capsule-step="example"]');
for (let i = 0; i < 3; i += 1) await page.click('[data-lk-capsule-next]');
expect(await page.locator('[data-lk-step]').count() === 4 && await page.getAttribute('[data-lk-capsule]', 'data-lk-capsule-step') === 'example', 'then a worked example, revealed step by step');
await shot('capsule-example');
await page.click('[data-lk-capsule-next]'); await page.waitForSelector('[data-lk-capsule-step="lab"]');
await shot('capsule-lab');
await page.click('[data-lk-capsule-lab]'); await page.waitForSelector('[data-lesson-lab]');
expect(await page.getAttribute('[data-lesson-lab]', 'data-ll-tool-on') === 'paper', 'then the instrument of the tool, in the lab, with his own numbers');
await page.click('[data-ll-close]'); await page.waitForFunction(() => !document.querySelector('[data-lesson-lab]'));
await page.click('[data-lk-capsule-next]'); await page.waitForSelector('[data-lk-qphase="capsule"]');
{ const cq = (await cur()).q; expect(cq.item === A && cq.level === 1, 'then two easy questions on that tool'); }
await shot('capsule-question');
for (let i = 0; i < 2; i += 1) { await fill(false); await hand(); await page.waitForTimeout(280); }
await page.waitForSelector('[data-lk-capsule-end="done"]');
expect(await page.locator('[data-lk-go]').count() === 1 && await page.locator('[data-lk-gate]').count() === 0, 'both capsule answers missed — and the door is OPEN: the capsule is passed by doing it, never a second lock');
expect(await page.getAttribute(`[data-lk-kcard="${A}"]`, 'data-lk-band') === 'start' && (await page.textContent(`[data-lk-kcard="${A}"]`)).includes('كبسولة منجزة'), 'the tool stays « نبدأ منها », flagged « كبسولة منجزة »: nothing is pretended');
{ const k = await kit(9502); expect(k.items[A].capsule === true && k.items[A].band === 'start' && k.lessons['qasim-adad-tabii'].tries === 1, 'the toolbox remembers the capsule; it is not a new try'); }
await shot('capsule-end');
await page.click(`[data-lk-kcard="${B}"]`);
expect(await page.getAttribute('[data-lk-revise]', 'data-lk-revise') === B && (await page.textContent('[data-lk-revise]')).includes('وأيضًا'), 'a tap on the other weak tool shows ITS lesson under « وأيضًا »');
await page.click(`[data-lk-kcard="${A}"]`);
const PHONE = process.env.E2E_TOUCH === '1' && SIZE[1] <= 500;
if (PHONE) {
  // a phone opens only the lessons designed for it: the earlier lesson is not a dead end, it is named with where to read it whole
  expect(await page.locator('[data-lk-lesson]').count() === 0 && (await page.textContent('[data-lk-lesson-computer]')).includes('الحاسوب'), 'on a phone « الدرس كاملًا » is not a link to a closed page: it says « على الحاسوب »');
  // on the result screen the ✕ closes at once: « تخرج من الشحن؟ » is asked only during a question or a capsule (`LaunchKit.jsx › askClose`)
  await page.click('[data-lk-close]');
  expect(await page.locator('[data-lk-quit-box]').count() === 0, 'the ✕ of the result screen closes without asking');
  await page.waitForSelector('[data-di-start]');
} else {
  await page.click('[data-lk-lesson]'); await page.waitForURL(/qisma-iqlidiya-baqi/); await page.waitForSelector('[data-return-to-lesson]');
  expect((await page.textContent('[data-return-to-lesson]')).includes('التعرّف على قاسم لعدد طبيعي'), '« الدرس كاملًا » opens the earlier lesson of 1AM, with ONE button to come back');
  await page.click('[data-return-to-lesson-go]'); await page.waitForURL(/qasim-adad-tabii/); await page.waitForSelector('[data-di-start]');
  { const k = await kit(9502); expect(k.lessons['qasim-adad-tabii'].last.percent === 0 && k.items[A].band === 'start', 'back in the lesson: the result was kept'); }
}
await page.click('[data-di-launch-open]'); await page.waitForSelector('[data-lk-start]');
expect((await page.locator('[data-lk-tool]').evaluateAll((els) => els.map((e) => e.dataset.lkBand))).join() === 'waiting,waiting' && !(await page.textContent('[data-lk-intro]')).includes('مشحونة من قبل'), '« عُدّتي » lets him charge again: a tool that is not « ثابتة » is asked again');

expect(errors.length === 0, 'no page error');
await browser.close();
