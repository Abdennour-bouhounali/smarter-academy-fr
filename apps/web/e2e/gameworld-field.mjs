// « تعاونية الواحة » (the real-world practice game) and the full-page « خريطة المعارف » of lesson `qasim-adad-tabii`, as a STUDENT.
// Every mission of the depot is played (a deliberate mistake on some: the guidance, the retry, a lost day), then the knowledge
// page is read card by card, a rule is sealed by its memory test, and the locks of a student without keys are checked.
// Run (dev server up): node apps/web/e2e/gameworld-field.mjs [outDir]
import { chromium } from 'playwright';
import { GL_ARGS } from './lib/gpu.mjs';
import { tinyText } from './lib/walk.mjs';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

const BASE = process.env.E2E_BASE || 'http://localhost:5173';
const LESSON = `${BASE}/courses/moyen/4am/ansab_al_aadad_wal_hisab/qasim-adad-tabii`;
const OUT = process.argv[2] || `${tmpdir()}/gameworld-field`;
const SIZE = (process.env.E2E_SIZE || '1366x768').split('x').map(Number);
mkdirSync(OUT, { recursive: true });
const KEYS = ['qasim-baqi', 'qasim-jidaa', 'siyagh-mutakafia', 'wahid-wa-nafsuh'];
/**
 * NO SCROLLING ANYWHERE: run at every screenshot of the walk. Fails when something of the game can scroll, when a fitted box
 * cuts its content, when a panel leaves the screen, or when the page itself is taller than the window.
 */
const shrunk = new Map();
async function noScroll(page, where) {
  await page.waitForTimeout(250);
  const measure = () => page.evaluate(() => {
    const bad = []; const small = [];
    // a formula is DRAWN: no dollar sign, no backslash command may be read on screen (text outside the rendered formulas)
    // (any backslash command, as lib/walk.mjs › readScreen), and money is « دج » only — never « DA », €, USD or « د.ج »
    { let text = ''; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); for (let t = w.nextNode(); t; t = w.nextNode()) { const p = t.parentElement; if (!p || p.closest('script, style, noscript, .katex-mathml, title') || !p.getClientRects().length) continue; if (!p.closest('.katex') && /\$|\\[a-zA-Z]{2,}/.test(t.nodeValue)) bad.push('raw formula on screen: « ' + t.nodeValue.trim().slice(0, 60) + ' »'); const cs = getComputedStyle(p); if (cs.visibility !== 'hidden' && Number(cs.opacity) !== 0) text += ` ${t.nodeValue}`; }
      if (/(?<![A-Za-z])DA(?![A-Za-z])|€|\bUSD\b|د\.ج/.test(text)) bad.push('money not in « دج » (DA, €, USD or د.ج on screen)'); }
    const name = (el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 2).join('.')}`;
    for (const el of document.querySelectorAll('.di-root *')) {
      const cs = getComputedStyle(el);
      if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 2 && !el.hasAttribute('data-di-fit-scroll')) bad.push(`scrolls: ${name(el)}`); // on a phone held sideways a Fit box slides INSIDE itself (GAME_WORLD.md « On a phone », rule 3): it marks itself
      if (/(auto|scroll)/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 2 && !el.hasAttribute('data-di-slides')) bad.push(`scrolls sideways: ${name(el)}`); // a line marked `data-di-slides` is ONE line that slides on a phone (the trail of the journey)
    }
    for (const box of document.querySelectorAll('[data-di-fitbox]')) {
      const o = box.getBoundingClientRect(); const i = box.firstElementChild.getBoundingClientRect();
      if (o.height > 0 && i.height > o.height + 3 && !box.hasAttribute('data-di-fit-scroll')) bad.push(`cut: ${name(box.parentElement)} (${Math.round(i.height)} in ${Math.round(o.height)}, scale ${box.dataset.diFitz})`);
      if (Number(box.dataset.diFitz) < 0.8 && o.height > 0) small.push(`${name(box.parentElement)} ×${box.dataset.diFitz}`);
    }
    for (const sel of ['.di-card', '.di-step', '.di-order', '.di-page__fit', '.di-jcard', '.di-next', '.di-kpanel']) for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect(); if (r.height > 0 && (r.top < -2 || r.bottom > window.innerHeight + 2)) bad.push(`leaves the screen: ${sel} (${Math.round(r.top)} → ${Math.round(r.bottom)} of ${window.innerHeight})`);
    }
    if (document.documentElement.scrollHeight > window.innerHeight + 1 || document.documentElement.scrollWidth > window.innerWidth + 1) bad.push('the page itself scrolls');
    return { bad, small };
  });
  let res = await measure();
  // a Fit box settles in a few frames, and here the world behind it is drawn by a software renderer (a frame can be slow):
  // a « cut » that is only a fit in progress gets a moment — a real cut stays and fails
  for (let i = 0; i < 5 && res.bad.length && res.bad.every((b) => b.startsWith('cut:')); i += 1) { await page.waitForTimeout(300); res = await measure(); }
  for (const x of res.small) shrunk.set(x, where);
  // the 12 px floor (GAME_WORLD.md « 12 px floor »), at every size: the shared rule of lib/walk.mjs › tinyText
  { const tiny = await tinyText(page); if (tiny.length) res.bad.push(`text under 12 px: ${tiny.slice(0, 8).join(' | ')}${tiny.length > 8 ? ` (+${tiny.length - 8})` : ''}`); }
  if (res.bad.length) { console.log('FAIL no scrolling at «', where, '»:', res.bad.join(' | ')); process.exitCode = 1; throw new Error(`scroll at ${where}`); }
}
/** Picks a card on the full map. On a phone the map steps aside while a memo, a memory test or a training is open: the tab « البطاقة » brings it back. */
const knode = async (page, id) => { const n = page.locator(`[data-di-knode="${id}"]`); if (!(await n.isVisible())) await page.click('[data-di-tab="card"]'); await n.click(); };
const browser = await chromium.launch({ args: GL_ARGS });
const errors = []; let n = 0;
const expect = (cond, msg) => { if (!cond) { console.log('FAIL', msg); process.exitCode = 1; throw new Error(msg); } console.log('ok  ', msg); };

async function student(id, seed = {}) {
  const ctx = await browser.newContext({ viewport: { width: SIZE[0], height: SIZE[1] }, ...(process.env.E2E_TOUCH === '1' ? { hasTouch: true, isMobile: true } : {}) });
  await ctx.addInitScript(([uid, entries]) => {
    window.__paperFast = true; // the paper gate's few seconds of « pick up your pen » are skipped by the walk
    localStorage.setItem('token', 'qa-fake-token');
  try { const k = `u_${uid}_smarter_launch_kit`; if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify({ lessons: { 'qasim-adad-tabii': { tries: 1 } } })); } catch { /* noop */ } // « عُدّة الانطلاق » already played: « ابدأ » enters the world (its own walk: launch-kit.mjs)
    for (const [k, v] of Object.entries(entries)) if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify(v));
    const real = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('/game-evidence')) (window.__posts ??= []).push(JSON.parse(init.body));
      if (url.includes('/api/')) return new Response(JSON.stringify(url.includes('/auth/me') ? { success: true, user: { id: uid, name: 'تلميذ', role: 'student', roles: ['student'], email_verified_at: '2026-09-01T00:00:00Z', emailVerified: true, nameComplete: true, level: '4am', grade: '4am' } } : { success: true, data: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      return real(input, init);
    };
  }, [id, seed]);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => { errors.push(e.message); console.log('pageerror', e.message); });
  await page.goto(LESSON, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-di-start]', { timeout: 30000 });
  const shot = async (name) => { n += 1; await noScroll(page, name); await page.screenshot({ path: `${OUT}/${String(n).padStart(2, '0')}-${name}.png` }); };
  const st = () => page.evaluate(() => { const s = window.__world.getState(); return { phase: s.phase, overlay: s.overlay?.type ?? null, o: s.overlay, depot: s.depot, practice: s.practice, know: s.know, eq: s.equation }; });
  /** Fast-forwards the world until the depot has finished packing (or a card opened). */
  const settle = () => page.evaluate(async () => { const g = window.__world; for (let i = 0; i < 4000; i += 1) { g.step(0.04); await null; await null; const s = g.getState(); if (s.overlay || (s.depot && !s.depot.busy)) break; } });
  const order = () => page.evaluate(() => { const c = window.__world.caseRun; const o = c.orders[c.oi]; return { ...o, si: c.si, oi: c.oi, answer: window.__cases.answerOf(o, c.si), options: o.steps[c.si].options?.map((x) => x.v) }; });
  /** Answers the current step: `value` = an option, two options, or { slot: number }. */
  const answer = async (value) => {
    if (Array.isArray(value)) { for (const v of value) await page.click(`[data-di-opt="${v}"]`); await page.click('[data-di-case-check]'); }
    // a number step is WRITTEN work: its boxes sit behind the paper gate « كتبتُ على ورقتي » (DivisorIsles.jsx › DepotHud: a
    // PaperGate keyed by order and step, so every new step comes with its gate closed). Every object answer of this walk is the
    // first on its step, or the retry after the guidance card of § 3 — whose gate the walk asserts closed again just before.
    else if (typeof value === 'object') { const g = await page.locator('[data-di-pgate-go]').count(); expect(g === 1 && await page.locator('[data-di-slot]').count() === 0, `a calculation step of the depot opens behind its paper gate, the boxes closed (gate found ${g})`); await page.click('[data-di-pgate-go]'); for (const [k, v] of Object.entries(value)) await page.fill(`[data-di-slot="${k}"]`, String(v)); await page.click('[data-di-case-check]'); }
    else await page.click(`[data-di-opt="${value}"]`);
    await settle();
  };
  /** Plays the open mission to its end with right answers. */
  const finish = async () => { for (let i = 0; i < 40; i += 1) { const s = await st(); if (s.overlay === 'result' || !s.depot) break; await answer((await order()).answer); } };
  const open = async (node, level) => { if (!(await page.locator('[data-di-mapcard]').count())) await page.click('[data-di-map], [data-di-result-map]'); await page.waitForSelector('[data-di-mapcard]'); await page.click(`[data-di-node="${node}"]`); await page.click(`[data-di-level="${node}:${level}"]`); await page.waitForTimeout(300); await settle(); };
  return { page, shot, st, settle, order, answer, finish, open, close: () => ctx.close() };
}
const p3 = { stars: 3, best: 900 };
const practice = Object.fromEntries([...KEYS.flatMap((k) => [[`${k}:1`, p3], [`${k}:2`, p3]]), ['exam:1', p3], ['exam:2', p3], ['exam:3', p3]]);
const save = { v: 1, stage: 8, stars: { s15: 3 }, gems: [], keys: KEYS, falls: 0, flags: { storm: true, statues: true, anvil: true, seven: true, key4: true, bossPaid: true }, elapsed: 900000, finished: true, practice };

const a = await student(9201, { 'u_9201_smarter_world_qasim-adad-tabii': save });
// ── 1. « أيّ صندوق؟ »: a wrong crate is PACKED and its leftover shown, then explained; the day is won with 2 stars ──
await a.open('qasim-baqi', 3);
let s = await a.st();
expect(s.phase === 'depot' && s.depot?.kind === 'fit' && s.depot.total === 3 && s.depot.hearts === 3, 'the field mission opens at the depot: 3 orders, 3 shields');
await a.page.waitForTimeout(1500); await a.shot('depot-order');
expect(await a.page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight + 1), 'the depot screen does not scroll');
let o = await a.order();
const wrongCrate = o.options.find((v) => v !== o.answer);
await a.answer(wrongCrate); await a.page.waitForTimeout(700); await a.shot('depot-leftover');
s = await a.st();
expect(s.overlay === 'caseGuide' && s.depot.hearts === 2 && s.eq && s.eq.r === o.n % wrongCrate && s.eq.r > 0, 'a wrong crate is packed for real: the equality shows its remainder, then a guidance card opens');
const guide = await a.page.textContent('[data-di-case-guide]');
expect(guide.includes('على الأرض') && guide.includes(`${o.n} = ${wrongCrate}`), 'the card explains with the division the choice produced');
expect(!guide.includes(`الصندوق ${o.answer} `), 'the card does not give the right crate');
await a.page.click('[data-di-case-retry]'); await a.settle();
await a.answer(o.answer); await a.page.waitForTimeout(400);
s = await a.st(); expect(s.depot.index === 2 && s.depot.earned === 900, 'the right crate ships the order: 900 دج (1200 less one mistake)');
await a.finish(); await a.page.waitForTimeout(500); await a.shot('depot-result');
s = await a.st();
expect(s.overlay === 'result' && s.o.win && s.o.money && s.o.stars === 2 && s.o.score === 3300 && s.practice['qasim-baqi:3']?.stars === 2, 'the day is won with 2 stars and 3300 دج, saved');

// ── 2. the other missions, played right: capacity, which order, the stubborn order ──
for (const [node, kind] of [['qasim-jidaa', 'count'], ['siyagh-mutakafia', 'orders'], ['wahid-wa-nafsuh', 'special']]) {
  await a.open(node, 3);
  expect((await a.st()).depot?.kind === kind, `${node}:3 is the mission « ${kind} »`);
  if (kind === 'special') { o = await a.order(); await a.answer(o.answer); await a.page.waitForTimeout(500); await a.shot('depot-special'); }
  await a.finish();
  s = await a.st(); expect(s.overlay === 'result' && s.o.win && s.o.stars === 3, `${kind}: won with 3 stars`);
}
// ── 3. the three exam cases ──
await a.open('exam', 2);
o = await a.order(); expect(o.kind === 'cost' && o.steps.length === 3, 'exam case 1: two crate sizes, then the invoice (3 steps)');
await a.answer({ q: o.q1 - 1, r: o.r1 + o.b1 }); // a remainder too big
expect((await a.page.textContent('[data-di-case-guide]')).includes('أصغر من'), 'a remainder bigger than the crate is refused with its reason');
await a.page.click('[data-di-case-retry]'); await a.settle();
// a calculation step is WRITTEN work: the paper mode is on (no music), the boxes wait for « كتبتُ على ورقتي », and a model sheet shows how
s = await a.st();
expect(await a.page.evaluate(() => window.__world.getState().paper === true && window.__world.audio.musicWanted === false) && await a.page.locator('[data-di-paper]').count() === 1, 'a calculation step of the depot turns the paper mode on: the music stops');
expect(await a.page.locator('[data-di-pgate]').count() === 1 && await a.page.locator('[data-di-slot]').count() === 0, 'the answer boxes stay closed until the student says he wrote on his paper');
await a.page.waitForTimeout(300); await a.shot('paper-gate-depot');
await a.page.click('[data-di-pgate-model]'); await a.page.waitForSelector('[data-di-model]');
{
  const m = await a.page.evaluate(() => { const el = document.querySelector('[data-di-model]'); return { kind: el.dataset.diModel, a: Number(el.dataset.diModelA), b: Number(el.dataset.diModelB) }; });
  expect(m.kind === 'twin' && m.a !== o.n && m.b !== o.b1 && (m.a % m.b === 0) === (o.n % o.b1 === 0), 'the model sheet poses a TWIN division: same nature, other numbers — it does not give the answer');
  expect((await a.page.textContent('[data-di-model-talk]')).includes('كم مرّة'), 'each step is said aloud: « في …، كم مرّة …؟ »');
  await a.page.waitForTimeout(300); await a.shot('paper-model-step1');
  for (let i = 0; i < 12 && await a.page.locator('[data-di-model-next]').count(); i += 1) await a.page.click('[data-di-model-next]');
  await a.page.waitForTimeout(300); await a.shot('paper-model-final');
  const fin = await a.page.textContent('[data-di-model-final]');
  expect(fin.includes('إذن') && fin.includes(String(m.a)), 'it ends on the check and the sentence to write on the exam sheet');
  await a.page.click('[data-di-model-close]');
}
await a.answer(o.answer); await a.page.waitForTimeout(500); await a.shot('depot-cost-step1');
s = await a.st(); expect(s.depot.stepIndex === 1 && s.eq.r === o.r1, 'the first crate size is packed and leaves its remainder; the case goes on to the second size');
await a.answer((await a.order()).answer); await a.answer((await a.order()).answer); // the second size, then the invoice
// the day goes on in the SAME world: the best packaging, then the export trucks
o = await a.order(); expect(o.kind === 'profit' && o.steps.length === 4, 'second order of the day: which packaging earns more (4 steps)');
await a.answer(o.answer); await a.answer((await a.order()).answer); await a.page.waitForTimeout(400); await a.shot('depot-profit-choice');
await a.answer((await a.order()).answer); await a.answer((await a.order()).answer);
o = await a.order(); expect(o.kind === 'trip', 'third order of the day: the export trucks');
await a.answer(o.answer); await a.page.waitForTimeout(500); await a.shot('depot-trucks');
s = await a.st(); expect(s.eq.r === o.r && s.eq.mode === 'trucks' && s.depot.stepIndex === 1, 'the trucks are shown: the last one partly empty');
await a.finish(); s = await a.st(); expect(s.o.win && s.o.stars === 2 && s.o.world === 'depot', 'the day at the cooperative is won with 2 stars');

// ── level 3 of the exam node: ANOTHER WORLD — sweets shared fairly between friends ──
await a.open('exam', 3);
o = await a.order(); s = await a.st();
expect(o.kind === 'share' && s.depot.world === 'share' && o.brief.includes('بالعدل'), 'level 3 opens another world: « قعدة الأصدقاء », a fair sharing');
await a.page.waitForTimeout(1500); await a.shot('share-world');
expect((await a.page.textContent('[data-di-order]')).includes('قعدة الأصدقاء'), 'the screen names the world and its own words');
await a.answer(o.answer); await a.page.waitForTimeout(500); await a.shot('share-unfair');
s = await a.st(); expect(s.eq.mode === 'share' && s.eq.b === o.b && s.eq.r === o.r && s.eq.r > 0, 'the pieces are dealt round after round: the remainder stays on the tray');
o = await a.order();
await a.answer(o.options.find((v) => v !== o.answer)); // a number of children that does not divide the pieces
expect((await a.page.textContent('[data-di-case-guide]')).includes('على الطبق'), 'a wrong number of guests: « … pieces stay on the tray »');
await a.page.click('[data-di-case-retry]'); await a.settle();
// the last step of the case: look while the plates are full, before the table is cleared for the next one
await a.page.click(`[data-di-opt="${o.answer}"]`);
await a.page.evaluate(async () => { const g = window.__world; for (let i = 0; i < 2000; i += 1) { g.step(0.04); await null; await null; const e = g.getState().equation; if (e && !e.live && g.getState().depot.note) break; } });
await a.page.waitForTimeout(500); await a.shot('share-fair');
s = await a.st(); expect(s.eq?.r === 0 && s.eq.b === o.g && s.depot.note.includes('قسمة عادلة'), 'with the neighbours the sharing is fair: nothing is left');
await a.settle();
await a.finish(); s = await a.st(); expect(s.overlay === 'result' && s.o.win && s.o.stars === 2 && s.o.world === 'share', 'the sharing world is won with 2 stars');

// ── level 4 of the exam node: A THIRD WORLD — the tiler who does the work properly ──
await a.open('exam', 4);
o = await a.order(); s = await a.st();
expect(o.kind === 'tiling' && s.depot.world === 'tiling' && o.brief.includes('المتقن') && o.steps.length === 3, 'level 4 opens a third world: « ورشة التبليط », work done properly (3 steps)');
await a.page.waitForTimeout(1500); await a.shot('tiling-world');
await a.answer(o.options.find((v) => v !== o.answer)); await a.page.waitForTimeout(500); await a.shot('tiling-gap');
s = await a.st(); expect(s.overlay === 'caseGuide' && s.eq.mode === 'row' && s.eq.r > 0 && (await a.page.textContent('[data-di-case-guide]')).includes('قصّ'), 'a tile that does not fit leaves a gap: « a tile would have to be cut »');
await a.page.click('[data-di-case-retry]'); await a.settle();
await a.answer(o.answer); await a.page.waitForTimeout(500); await a.shot('tiling-row');
s = await a.st(); expect(s.eq.r === 0 && s.eq.q === o.q, 'the right tile covers the corridor without any cut');
// « حيلة »: a shortcut is shown AFTER the right answer, and its arithmetic is about this very division
const tip = await a.page.textContent('[data-di-tip]');
expect(tip.includes('حيلة') && tip.includes(String(o.s)) && tip.includes(String(o.L)), 'after the right answer, a shortcut « حيلة » for this division is shown');
await a.answer((await a.order()).answer); // the whole floor: rows × tiles of a row
o = await a.order();
// GOING BACK: an earlier step can be read again — its question, what the student answered (the wrong try too), the explanation
{
  expect(await a.page.locator('[data-di-hist-dot]').count() === 2, 'the two steps already done are listed above the question');
  await a.page.click('[data-di-hist-dot="0"]'); await a.page.waitForTimeout(300); await a.shot('review-step');
  const rv = await a.page.textContent('[data-di-review]');
  expect(rv.includes('أيّ بلاطة') && rv.includes('جوابك') && rv.includes('قصّ') && rv.includes(String(o.s)), 'the first step is shown again: its question, the wrong tile and why, then the right one');
  expect(await a.page.locator('[data-di-review] .di-review__a').count() === 2 && await a.page.locator('[data-di-slot], [data-di-pgate]').filter({ visible: true }).count() === 0, 'both tries are listed, and the earlier step cannot be answered again');
  expect(!(await a.page.textContent('[data-di-facts]')).includes('المجموع') && await a.page.locator('[data-di-facts] li').count() === 1, 'while reading an earlier step, the facts are those of THAT step');
  await a.page.click('[data-di-hist-back]'); await a.page.waitForTimeout(200);
  expect(await a.page.locator('[data-di-review]').count() === 0 && (await a.page.textContent('[data-di-step]')).includes('كم علبة'), '« أعود إلى سؤالي » brings the current question back');
}
// EVERY datum the step needs is on its screen: the total found at the step before, the size of a box, and the tiled corridor
{
  const known = await a.page.textContent('[data-di-facts]');
  expect(known.includes(String(o.total)) && known.includes(String(o.L)) && known.includes(String(o.s)) && (await a.page.textContent('[data-di-step]')).includes(String(o.box)), 'the step « how many boxes » shows all it needs: the total of tiles, the corridor, the tile, the box');
  expect(await a.page.evaluate((q) => window.__world.depot.tiles.length === q, o.q), 'the corridor stays tiled while the boxes are computed');
}
await a.answer({ x: o.boxes - 1 }); // one box short
expect((await a.page.textContent('[data-di-case-guide]')).includes('تنقصه') && await a.page.locator('[data-di-guide-rule]').count() === 1, 'one box short: « … tiles are missing », and the rule comes with this second mistake');
await a.page.click('[data-di-case-retry]'); await a.settle();
expect(await a.page.evaluate((q) => window.__world.depot.tiles.length === q, o.q) && (await a.page.textContent('[data-di-facts]')).includes(String(o.total)), 'after a mistake and « try again », what was built and what was found are still there');
await a.page.waitForTimeout(400); await a.shot('tiling-facts');
// the last step of the order: look while the boxes are on the floor, before the work is cleared for the next one
// after a guidance card and « حاول مجدّدًا » the step's boxes are behind the paper gate again — as § 3 asserts after the first
// retry of the day (« the answer boxes stay closed until the student says he wrote on his paper »)
expect(await a.page.locator('[data-di-pgate-go]').count() === 1 && await a.page.locator('[data-di-slot]').count() === 0, 'after « try again » the boxes of the step wait behind the paper gate once more');
await a.page.click('[data-di-pgate-go]');
await a.page.fill('[data-di-slot="x"]', String(o.boxes)); await a.page.click('[data-di-case-check]');
await a.page.evaluate(async () => { const g = window.__world; for (let i = 0; i < 2000; i += 1) { g.step(0.04); await null; await null; const e = g.getState().equation; if (e && e.mode === 'boxes' && !e.live && g.getState().depot.note) break; } });
await a.page.waitForTimeout(500); await a.shot('tiling-boxes');
s = await a.st(); expect(s.eq?.mode === 'boxes' && s.eq.r === o.br && s.depot.note.includes('للتصليح') && s.depot.note.includes('لا تبذير'), 'the boxes are bought without waste: the spare tiles are kept for repairs');
expect((await a.page.textContent('[data-di-step]')).includes('عمل متقن') && !(await a.page.textContent('[data-di-step]')).includes('الشاحنة'), 'each world closes a case in its own words: « عمل متقن! », not the depot\'s truck');
await a.settle();
await a.finish(); s = await a.st(); expect(s.overlay === 'result' && s.o.win && s.o.stars === 1 && s.o.world === 'tiling', 'the tiling world is won with 1 star (two mistakes)');
// a lost day: three mistakes
await a.page.click('[data-di-result-retry]'); await a.page.waitForTimeout(300); await a.settle();
o = await a.order();
for (const v of o.options.filter((x) => x !== o.answer)) { await a.answer(v); await a.page.click('[data-di-case-retry]'); await a.settle(); }
await a.answer(o.answer); o = await a.order();
await a.answer({ x: o.total + 1 }); await a.page.waitForTimeout(500); await a.shot('depot-lost');
s = await a.st(); expect(s.overlay === 'result' && !s.o.win && s.o.why, 'third mistake: the day is lost, the last explanation stays on the result');
await a.page.click('[data-di-result-map]'); await a.page.waitForSelector('[data-di-mapcard]'); await a.page.waitForTimeout(400); await a.shot('hub');
await a.page.click('[data-di-node="exam"]');
expect(await a.page.locator('[data-di-level]').count() === 4 && (await a.page.textContent('.di-levels')).includes('قعدة الأصدقاء') && (await a.page.textContent('.di-levels')).includes('ورشة التبليط'), 'the exam node lists its four levels: a run, then the three worlds');

// ── 4. « خريطة المعارف »: the full page ──
await a.page.click('[data-di-hub-know]'); await a.page.waitForSelector('[data-di-know]'); await a.page.waitForTimeout(900); await a.shot('journey-start');
// THE DISCOVERY JOURNEY: one card at a time, LARGE and comfortable to read, in the middle of the screen
expect(await a.page.locator('[data-di-journey]').count() === 1 && await a.page.locator('[data-di-jcard="qasim"]').count() === 1 && await a.page.locator('[data-di-knode]').count() === 0, 'the page opens on the journey: the idea « قاسم عدد طبيعي » alone, as one big card');
{
  const m = await a.page.evaluate(() => { const px = (sel) => { const el = document.querySelector(sel); return el ? parseFloat(getComputedStyle(el).fontSize) * Number(document.querySelector('[data-di-fit]').dataset.diFit) : 0; }; const c = document.querySelector('[data-di-jcard]').getBoundingClientRect(); return { title: px('[data-di-jcard] h3'), text: px('[data-di-jcard] .di-ctx p'), next: px('.di-nextcard strong'), trail: px('[data-di-trail-card]'), share: c.width / window.innerWidth, fit: document.querySelector('[data-di-fit]').dataset.diFit }; });
  console.log('    sizes on screen (px):', JSON.stringify(m));
  // a window up to 1100 px wide (a tablet held sideways) gets the page's own narrower sizes: still large, one step down
  // a phone held sideways has ONE scale, its root font at 13 px (GAME_WORLD.md « On a phone », rule 1): 10.7 px is its smallest label
  const PHONE = process.env.E2E_TOUCH === '1' && SIZE[1] <= 500;
  const min = PHONE ? { title: 20, text: 15, next: 13, trail: 10.5 } : SIZE[0] <= 1100 ? { title: 27, text: 19, next: 17, trail: 13 } : { title: 34, text: 22, next: 20, trail: 15 };
  expect(m.title >= min.title && m.text >= min.text && m.next >= min.next && m.trail >= min.trail, `its text is big on screen: title ≥ ${min.title} px, explanation ≥ ${min.text} px, the next card ≥ ${min.next} px`);
  expect(m.share > 0.5, 'the card takes more than half of the screen');
}
expect((await a.page.textContent('[data-di-jcard]')).includes('قاسم عدد طبيعي') && await a.page.locator('[data-di-jcard] [data-di-tab="train"]').count() === 1, 'the explanation and the training of the card are on the card');
expect(await a.page.locator('[data-di-mystery]').count() === 1, 'beside it, ONE mystery card: what follows is still hidden');
await a.page.click('[data-di-mystery="baqi"]'); await a.page.waitForTimeout(900); await a.shot('journey-2');
expect(await a.page.locator('[data-di-jcard="baqi"]').count() === 1 && await a.page.locator('[data-di-trail-card]').count() === 2 && await a.page.locator('[data-di-mystery]').count() === 2, 'turning it over finds « بالباقي »: it becomes the card being read, the trail grows, two new mystery cards wait');
await a.page.click('[data-di-trail-card="qasim"]'); await a.page.waitForTimeout(400);
expect(await a.page.locator('[data-di-jcard="qasim"]').count() === 1 && await a.page.locator('[data-di-go="baqi"]').count() === 1, 'the trail goes back to any card already found');
// card after card to the end: a mystery card when there is one, otherwise a card that still hides something
for (let i = 0; i < 40 && (await a.st()).know.found.length < 13; i += 1) {
  // the journey offers a mystery card while one is left beside the card being read; otherwise a card already found that still
  // hides a neighbour (`[data-di-frontier]`) or a way on (`[data-di-go]`) — one of the two must be there while cards are missing
  const mysteries = await a.page.locator('[data-di-mystery]').count();
  if (mysteries) await a.page.locator('[data-di-mystery]').first().click();
  else { const ways = await a.page.locator('[data-di-frontier], [data-di-go]').count(); expect(ways > 0, `the journey (${(await a.st()).know.found.length} of 13 found) always offers a way on: a mystery card, or a card that still hides something`); await a.page.locator('[data-di-frontier], [data-di-go]').first().click(); }
  await a.page.waitForTimeout(120);
  if ((await a.st()).know.found.length === 8) { await a.page.waitForTimeout(700); await a.shot('journey-middle'); }
}
await a.page.waitForTimeout(800); await a.shot('journey-all');
expect((await a.st()).know.found.length === 13 && await a.page.locator('[data-di-trail-card]').count() === 13 && await a.page.locator('[data-di-see-map]').count() === 1, 'card after card, the 13 cards of the lesson are discovered');
expect(await a.page.evaluate(() => { const p = document.querySelector('[data-di-know]'); return p.scrollHeight <= p.clientHeight + 1 && document.documentElement.scrollHeight <= window.innerHeight + 1; }), 'the journey fits the screen without scrolling');
await a.page.click('[data-di-see-map]'); await a.page.waitForTimeout(600); await a.shot('know-page');
expect(await a.page.locator('[data-di-kmap="full"]').count() === 1, '« شاهد الخريطة كاملة » shows the whole map at once');
expect(await a.page.locator('[data-di-knode]').count() === 13 && await a.page.locator('[data-di-knode][data-open="true"]').count() === 13, 'the page shows the 13 cards of the lesson, all open with the four keys');
expect(await a.page.evaluate(() => { const p = document.querySelector('[data-di-know]'); const r = p.getBoundingClientRect(); return r.width >= window.innerWidth - 1 && r.height >= window.innerHeight - 1 && p.scrollHeight <= p.clientHeight + 1; }), 'it is a FULL page and it does not scroll');
expect(await a.page.evaluate(() => [...document.querySelectorAll('[data-di-knode]')].every((el) => { const r = el.getBoundingClientRect(); const m = document.querySelector('.di-kmap').getBoundingClientRect(); return r.left >= m.left - 2 && r.right <= m.right + 2 && r.top >= m.top - 2 && r.bottom <= m.bottom + 2; })), 'every card of the map is inside the map');
for (const id of ['qasim', 'baqi', 'jidaa', 'tadhakkar', 'ex120', 'ex143', 'tahaqqaq', 'siyagh', 'wahid', 'intabih', 'khulasa']) await knode(a.page, id);
await knode(a.page, 'khata-ittijah'); await a.page.waitForTimeout(300); await a.shot('know-mistake-hidden');
expect(!(await a.st()).know.read.includes('khata-ittijah'), 'a common mistake is not « read » before its error is uncovered');
await a.page.click('[data-di-uncover]'); await a.page.waitForTimeout(300); await a.shot('know-mistake-shown');
expect((await a.page.textContent('.di-parts')).includes('الصواب'), 'uncovering shows why it is wrong and the right sentence');
await knode(a.page, 'khata-amil'); await a.page.click('[data-di-uncover]');
expect((await a.st()).know.read.length === 13, 'the 13 cards are read');
// the memo sheet and the memory test of a rule
await knode(a.page, 'baqi'); await a.page.click('[data-di-tab="memo"]'); await a.page.waitForTimeout(300); await a.shot('know-memo');
const memo = await a.page.textContent('.di-memo');
expect(memo.includes('القاعدة') && memo.includes('الفخّ') && memo.includes('في الامتحان'), 'the memo sheet gives the rule, its trap and the exam tip');
await a.page.click('[data-di-tab="quiz"]'); await a.page.click('[data-di-quiz="0-0"]'); await a.page.click('[data-di-quiz="1-0"]'); await a.page.click('[data-di-quiz-check]');
expect((await a.st()).know.sealed.length === 0, 'a wrong memory test seals nothing');
await a.page.click('[data-di-quiz="0-1"]'); await a.page.click('[data-di-quiz="1-2"]'); await a.page.click('[data-di-quiz-check]'); await a.page.waitForTimeout(400); await a.shot('know-sealed');
expect((await a.st()).know.sealed.includes('qasim-baqi'), 'the right answers seal the rule in gold');
// ── « تدرّب » opens ON the card, inside the page: six questions, game format then exam format ──
const tr = () => a.page.evaluate(() => ({ ...window.__trainer, dom: document.querySelector('[data-di-trainer]')?.dataset.diTrainer, fb: document.querySelector('[data-di-tr-fb]')?.dataset.diTrFb ?? null, fbText: document.querySelector('[data-di-tr-fb]')?.textContent ?? '' }));
/** Answers the current question of the trainer with `v` (shape of solution()). */
/**
 * `gate` — { open } for the question on screen: the paper gate « كتبتُ على ورقتي » (kit/Paper.jsx › PaperGate) closes the
 * answer of EVERY exam-format question of the trainer (kit/Trainer.jsx) until it is passed once; the question stays mounted
 * between two tries, so it does not come back for the second try; a game question has none.
 */
const reply = async (q, v, gate) => {
  // Trainer.jsx › Question: a « tap » and a game-format true / false answer at once; every other question is a sheet whose
  // boxes sit behind the gate (an exam true / false, and every form, whatever its format)
  const want = !(q.kind === 'tap' || (q.kind === 'tf' && q.format !== 'exam')) && !gate.open;
  const shown = await a.page.locator('[data-di-pgate-go]').count();
  expect(shown === (want ? 1 : 0), `trainer « ${q.kind} » (${q.format}): the paper gate is ${want ? 'there' : 'absent'} (found ${shown})`);
  if (want) { await a.page.click('[data-di-pgate-go]'); gate.open = true; }
  if (q.kind === 'tap') { await a.page.click(`[data-di-tr-opt="${v}"]`); return; }
  if (q.kind === 'tf') { await a.page.click(`[data-di-tr-tf="${v.truth}"]`); if (q.format === 'exam') { await a.page.click(`[data-di-tr-reason="${v.reason}"]`); await a.page.click('[data-di-tr-check]'); } return; }
  if (q.kind === 'complete') { await a.page.selectOption('[data-di-tr="phrase"]', v); await a.page.click('[data-di-tr-check]'); return; }
  for (const [k, x] of Object.entries(v)) { if (k === 'fits') await a.page.selectOption('[data-di-tr="fits"]', x ? 'yes' : 'no'); else await a.page.fill(`[data-di-tr="${k}"]`, String(x)); }
  await a.page.click('[data-di-tr-check]');
};
await knode(a.page, 'baqi'); await a.page.click('[data-di-tab="card"]'); await a.page.click('[data-di-know-train]'); await a.page.waitForSelector('[data-di-trainer]');
expect(await a.page.locator('[data-di-know]').count() === 1 && await a.page.locator('[data-di-mapcard]').count() === 0, '« تدرّب على هذه البطاقة » opens the exercise INSIDE the knowledge page');
const formats = [];
for (let i = 0; i < 6; i += 1) {
  const t = await tr(); formats.push(t.dom); const gate = { open: false };
  if (i === 0) { await a.page.waitForTimeout(300); await a.shot('train-game'); expect(t.q.kind === 'tap' && t.q.wave.a <= 100, 'the first question is in the GAME format: gates to tap, small numbers'); }
  if (i === 3) {
    expect(await a.page.evaluate(() => window.__world.getState().paper === false && window.__world.audio.musicWanted === true), 'back to a game question: the paper mode is off and the music returns');
    // going back in the trainer: an earlier question, the answers given and its correction
    await a.page.click('[data-di-tr-dot="2"]'); await a.page.waitForTimeout(300); await a.shot('train-review');
    const rv = await a.page.textContent('[data-di-tr-review]');
    expect(rv.includes('أجرِ القسمة الإقليدية') && rv.includes('جوابك') && rv.includes('التصحيح') && await a.page.locator('[data-di-tr-review] .di-review__a').count() === 2, 'an earlier question of the session can be read again: its statement, the two answers given, the correction');
    await a.page.click('[data-di-tr-back]'); await a.page.waitForTimeout(200);
    expect(await a.page.locator('[data-di-tr-review]').count() === 0 && await a.page.locator('.di-trainer__live:not([hidden])').count() === 1 && (await tr()).index === 3, '« أعود إلى سؤالي » brings the current question back');
  }
  if (i === 2) {
    await a.page.waitForTimeout(300); await a.shot('train-exam');
    expect(t.dom === 'exam' && t.q.kind === 'division' && (await a.page.textContent('.di-sheet')).includes('أجرِ القسمة الإقليدية'), 'the third question is in the EXAM format: « أجرِ القسمة الإقليدية … ثمّ استنتج »');
    expect(await a.page.evaluate(() => window.__world.getState().paper === true && window.__world.audio.musicWanted === false) && await a.page.locator('.di-trainer [data-di-paper]').count() === 1, 'the exam format is answered in PAPER MODE: no music, the sign « وضع الورقة » and its clock');
    expect(await a.page.locator('.di-sheet__q u').count() >= 2 && await a.page.locator('.di-sheet [data-di-pgate]').count() === 1, 'the data of the statement are underlined, and the sheet asks for the pen before the boxes open');
    expect(await a.page.evaluate(() => { const pg = document.querySelector('[data-di-know]'); const b = document.querySelector('.di-kpanel__body'); return pg.scrollHeight <= pg.clientHeight + 1 && b.scrollHeight <= b.clientHeight + 1; }), 'the exam sheet fits in the page without scrolling');
    // a deliberate mistake: a remainder that is too big — a hint first, the correction only after a second mistake
    await reply(t.q, { q: t.q.q - 1, r: t.q.r + t.q.b, fits: false }, gate); let f = await tr();
    expect(f.fb === 'hint' && f.fbText.includes('أصغر من') && !f.fbText.includes(`× ${t.q.q} `), 'first mistake: a hint that does not give the answer');
    await reply(t.q, { q: t.q.q - 1, r: t.q.r + t.q.b, fits: false }, gate); f = await tr(); await a.page.waitForTimeout(300); await a.shot('train-correction');
    expect(f.fb === 'fix' && f.fbText.includes('التصحيح') && f.fbText.includes(String(t.q.q)), 'second mistake: the written correction');
    await a.page.click('[data-di-tr-model]'); await a.page.waitForSelector('[data-di-model="own"]');
    expect(await a.page.evaluate(([qa, qb]) => { const el = document.querySelector('[data-di-model]'); return Number(el.dataset.diModelA) === qa && Number(el.dataset.diModelB) === qb; }, [t.q.a, t.q.b]), 'after the correction, « اقرأ التحرير النموذجي » writes the student\'s OWN division step by step');
    for (let k = 0; k < 12 && await a.page.locator('[data-di-model-next]').count(); k += 1) await a.page.click('[data-di-model-next]');
    await a.page.waitForTimeout(300); await a.shot('paper-model-own'); await a.page.click('[data-di-model-close]');
  } else { await reply(t.q, t.solution, gate); expect((await tr()).fb === 'ok', `question ${i + 1} (${t.dom} · ${t.q.kind}) is accepted`); }
  await a.page.click('[data-di-tr-next]');
}
expect(formats.join(',') === 'game,game,exam,game,exam,exam', 'the formats alternate and end on the exam format: game, game, exam, game, exam, exam');
await a.page.waitForTimeout(400); await a.shot('train-done');
expect(await a.page.locator('[data-di-trainer="done"][data-di-tr-stars="2"]').count() === 1 && (await a.st()).know.trained.baqi === 2, 'five right at the first try: 2 stars, saved on the card');
// الكفاءات: of the six questions, only the three exam-format ones were sent — their FIRST try, right or wrong — to the server
{
  const sent = await a.page.evaluate(() => (window.__posts ?? []).filter((p) => p.context === 'trainer'));
  expect(sent.length === 3 && sent.every((p) => p.learningPoint === '4am_qasim-adad-tabii_P1' && p.claim.kind === 'division' && p.attemptId), 'الكفاءات: the three exam-format questions are sent as evidence on P1; the three game-format ones are not');
  expect(sent[0].claim.r >= sent[0].claim.b && sent.slice(1).every((p) => p.claim.b * p.claim.q + p.claim.r === p.claim.a), 'the first one carries the WRONG first try (the second try and the correction are not sent); the two others are right');
  expect(new Set(sent.map((p) => p.attemptId)).size === 3, 'each has its own attempt id');
}
// the other families of cards: the four sentences (complete, true/false with its reason), 1 and the number itself, the mix
for (const id of ['siyagh', 'wahid', 'jidaa', 'khulasa']) {
  await knode(a.page, id); await a.page.click('[data-di-tab="train"]'); await a.page.waitForSelector('[data-di-trainer]');
  for (let i = 0; i < 6; i += 1) { const t = await tr(); await reply(t.q, t.solution, { open: false }); if ((await tr()).fb !== 'ok') throw new Error(`${id} question ${i + 1} ${t.q.kind} refused`); if (id === 'siyagh' && i === 4) { await a.page.waitForTimeout(300); await a.shot('train-tf-exam'); } await a.page.click('[data-di-tr-next]'); }
  expect((await a.st()).know.trained[id] === 3, `card « ${id} »: a session all right at the first try gives 3 stars`);
}
{
  const all = await a.page.evaluate(() => window.__posts ?? []);
  const cases = all.filter((p) => p.context === 'case');
  expect(cases.length > 0 && cases.every((p) => ['division', 'product', 'containers'].includes(p.claim.kind)) && all.every((p) => p.claim.kind !== 'truth'), 'the calculation steps of the real cases were sent too; a « صحيح أم خطأ » is never sent');
  console.log('    evidence sent:', all.length, '— by learning point:', JSON.stringify(all.reduce((m, p) => ({ ...m, [p.learningPoint.slice(-2)]: (m[p.learningPoint.slice(-2)] ?? 0) + 1 }), {})));
}
await a.page.click('[data-di-know-hub]'); await a.page.waitForSelector('[data-di-mapcard]');
expect(await a.page.locator('[data-di-mapcard]').count() === 1, 'the practice space is still one tap away from the page');
await a.page.reload({ waitUntil: 'networkidle' }); await a.page.waitForSelector('[data-di-start]');
s = await a.st(); expect(s.know.found.length === 13 && s.know.read.length === 13 && s.know.sealed.length === 1 && s.know.trained.baqi === 2 && s.practice['qasim-baqi:3']?.stars === 2, 'cards read, seals, training stars and missions survive a reload');
await a.close();

// ── 5. a student without keys: the page exists, its cards are locked ──
{
  const b = await student(9202);
  await b.page.click('[data-di-know-open]'); await b.page.waitForSelector('[data-di-know]'); await b.page.waitForTimeout(400); await b.shot('know-locked');
  expect(await b.page.locator('[data-di-jcard][data-open="false"]').count() === 1 && await b.page.locator('[data-di-mystery]:not([disabled])').count() === 0, 'without keys the first card is locked and its mystery card cannot be turned: a rule is named only after it is discovered in the story');
  await b.page.click('[data-di-know-mode]'); await b.page.waitForTimeout(300);
  expect(await b.page.locator('[data-di-knode]').count() === 13 && await b.page.locator('[data-di-knode][data-open="true"]').count() === 0, 'the whole map shows 13 locked cards');
  await b.page.click('[data-di-know-close]'); expect((await b.st()).phase === 'title', 'closing returns to the title screen');
  await b.close();
}
console.log('ok   nothing scrolls at any screenshot of the walk');
if (shrunk.size) console.log('note: content scaled below ×0.8 to fit at:', [...shrunk].map(([k, v]) => `${k} @ ${v}`).join('; '));
expect(errors.length === 0, 'no page error');
await browser.close();
