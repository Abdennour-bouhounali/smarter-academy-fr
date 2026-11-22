// « حلبة التدريب » and « خريطة المعرفة » — walk of the practice game of lesson `qasim-adad-tabii` as a STUDENT.
// It checks the map (locked / open nodes), a run with a deliberate mistake (guidance, rule reminder, the question that comes
// back), a won level, a lost level, the save, and the keys opened by the lesson's own progress on a device without a game save.
// Run (dev server up): node apps/web/e2e/gameworld-practice.mjs [outDir]
import { chromium } from 'playwright';
import { GL_ARGS } from './lib/gpu.mjs';
import { tinyText } from './lib/walk.mjs';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

const BASE = process.env.E2E_BASE || 'http://localhost:5173';
const LESSON = `${BASE}/courses/moyen/4am/ansab_al_aadad_wal_hisab/qasim-adad-tabii`;
const OUT = process.argv[2] || `${tmpdir()}/gameworld-practice`;
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
const browser = await chromium.launch({ args: GL_ARGS });
const errors = [];
let n = 0;
const expect = (cond, msg) => { if (!cond) { console.log('FAIL', msg); process.exitCode = 1; throw new Error(msg); } console.log('ok  ', msg); };

/** A student session; `seed` = localStorage entries written before the app starts. */
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
      if (url.includes('/api/')) return new Response(JSON.stringify(url.includes('/auth/me') ? { success: true, user: { id: uid, name: 'تلميذ', role: 'student', roles: ['student'], email_verified_at: '2026-09-01T00:00:00Z', emailVerified: true, nameComplete: true, level: '4am', grade: '4am' } } : { success: true, data: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      return real(input, init);
    };
  }, [id, seed]);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => { errors.push(e.message); console.log('pageerror', e.message); });
  await page.goto(LESSON, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-di-start]', { timeout: 30000 });
  const shot = async (name) => { n += 1; await noScroll(page, name); await page.screenshot({ path: `${OUT}/${String(n).padStart(2, '0')}-${name}.png` }); };
  const ff = (sec) => page.evaluate(async (s) => { const g = window.__world; for (let t = 0; t < s; t += 0.04) { g.step(0.04); await null; await null; } }, sec);
  const st = () => page.evaluate(() => { const s = window.__world.getState(); return { phase: s.phase, overlay: s.overlay?.type ?? null, o: s.overlay, dash: s.dash, practice: s.practice, openKeys: s.openKeys }; });
  /** Rides to the next gate in the right lane (`wrong` = a wrong one), and stops as soon as the gate is passed. */
  const gate = async (wrong = false) => page.evaluate(async (bad) => {
    const g = window.__world; const d = g.dash; const w = d.waves[d.wave]; const k = d.wave;
    d.lane = bad ? (w.good + 1) % 3 : w.good;
    for (let i = 0; i < 600 && g.dash && g.dash.wave === k; i += 1) { g.step(0.04); await null; }
    return { type: w.type, say: w.a ?? w.b, picked: w.gates[bad ? (w.good + 1) % 3 : w.good], right: w.gates[w.good] };
  }, wrong);
  return { page, shot, ff, st, gate, close: () => ctx.close() };
}
/** The open card fits the window: no scrolling inside it, nothing cut off (owner rule: no scrolling anywhere). */
const fits = (page) => page.evaluate(() => { const c = document.querySelector('.di-veil .di-card'); if (!c) return false; const r = c.getBoundingClientRect(); return c.scrollHeight <= c.clientHeight + 1 && r.top >= 0 && r.bottom <= window.innerHeight; });
const doneSave = { v: 1, stage: 8, stars: { s15: 3 }, gems: [], keys: KEYS, falls: 0, flags: { storm: true, statues: true, anvil: true, seven: true, key4: true, bossPaid: true }, elapsed: 900000, finished: true };

// ── 1. a student who never played: the map shows the lesson, every node locked ──
{
  const a = await student(9101);
  await a.page.click('[data-di-map]'); await a.page.waitForSelector('[data-di-mapcard]'); await a.page.waitForTimeout(500); await a.shot('map-locked');
  expect(await a.page.locator('[data-di-node][data-open="true"]').count() === 0 && await a.page.locator('[data-di-node]').count() === 5, 'new student: five nodes on the map, all locked');
  expect(await a.page.locator('[data-di-next]').count() === 0 && await a.page.locator('[data-di-level]:not([disabled])').count() === 0, 'new student: no level can be played before a key is earned');
  await a.page.click('[data-di-map-close]'); expect((await a.st()).phase === 'title' && await a.page.locator('[data-di-start]').count() === 1, 'closing the map returns to the title screen');
  await a.close();
}

// ── 2. a student who finished the story: practice straight from the title screen ──
const b = await student(9102, { 'u_9102_smarter_world_qasim-adad-tabii': doneSave });
await b.page.click('[data-di-map]'); await b.page.waitForSelector('[data-di-mapcard]'); await b.page.waitForTimeout(500); await b.shot('map-open');
expect(await b.page.locator('[data-di-node][data-open="true"]').count() === 4, 'four key nodes are open, the exam node is still locked');
expect(await fits(b.page), 'the map fits the window without scrolling');
expect((await b.page.textContent('[data-di-next]')).includes('سباق: أعداد صغيرة'), '« واصل التدريب » proposes the easiest level first');
expect(await b.page.locator('[data-di-level="qasim-baqi:2"][disabled]').count() === 1, 'level 2 is locked until level 1 is passed');
await b.page.click('[data-di-next]'); await b.ff(0.5);
let s = await b.st();
expect(s.phase === 'dash' && s.dash?.mode === 'practice' && s.dash.total === 6 && s.dash.hearts === 3, 'the run starts: 6 gates, 3 shields');
await b.ff(2.5); await b.page.waitForTimeout(500); await b.shot('run');
// a deliberate mistake on the first gate
const miss = await b.gate(true); await b.page.waitForTimeout(500); await b.shot('guide');
s = await b.st();
expect(s.phase === 'dialog' && s.overlay === 'guide' && s.o.picked === miss.picked && s.dash.hearts === 2, 'a wrong gate STOPS the run on a guidance card');
const guide = await b.page.textContent('[data-di-guide]');
expect(guide.includes(`اخترتَ ${miss.picked}`) && guide.includes(`البوّابة الصحيحة: ${miss.right}`) && /الباقي|مضاعف/.test(guide), 'the card says why the chosen number does not fit and why the right one does');
expect(s.dash.total === 7 && s.o.again, 'a question of the same kind is added to the run');
expect(await fits(b.page), 'the guidance card fits the window without scrolling');
await b.page.click('[data-di-remind]'); await b.page.waitForTimeout(400); await b.shot('rule');
expect((await b.st()).overlay === 'rule' && (await b.page.textContent('.di-card--stone')).includes('القاسم بالباقي'), '« ذكّرني بالقاعدة » opens the tablet of the rule');
await b.page.click('[data-di-tablet]'); await b.ff(0.2);
expect((await b.st()).phase === 'dash', 'closing the rule resumes the run');
// the rule is also one tap away during the run
await b.page.click('[data-di-rule]'); await b.page.waitForTimeout(300); expect((await b.st()).overlay === 'rule', 'the « القاعدة » button of the run opens the rule and pauses');
await b.page.click('[data-di-tablet]'); await b.ff(0.2);
for (let i = 0; i < 6; i += 1) await b.gate(false);
await b.ff(3); await b.page.waitForTimeout(600); await b.shot('result-win');
s = await b.st();
expect(s.overlay === 'result' && s.o.win && s.o.stars === 2 && s.o.mistakes === 1 && s.practice['qasim-baqi:1']?.stars === 2, 'level won with 2 stars (one shield lost), saved');
expect(s.o.next?.id === 'qasim-baqi:2' && s.phase === 'title', 'the next level is proposed; the story behind is untouched');
// level 2: two mistakes bring the rule by itself, the third ends the run
await b.page.click('[data-di-result-next]'); await b.ff(0.5);
await b.gate(true); await b.page.click('[data-di-resume]'); await b.ff(0.2);
await b.gate(true); await b.page.waitForTimeout(500); await b.shot('guide-lost');
expect(await b.page.locator('[data-di-guide-rule]').count() === 1, 'after two mistakes the rule is shown without being asked');
expect(await fits(b.page), 'the guidance card with the rule still fits the window without scrolling');
await b.page.click('[data-di-resume]'); await b.ff(0.2);
await b.gate(true); await b.ff(0.5); await b.page.waitForTimeout(500); await b.shot('result-lose');
s = await b.st();
expect(s.overlay === 'result' && !s.o.win && !s.practice['qasim-baqi:2'], 'three mistakes: the level is lost and nothing is recorded for it');
// back to the map: the pips, then the first level of the three other nodes opens the exam node
await b.page.click('[data-di-result-map]'); await b.page.waitForSelector('[data-di-mapcard]');
for (const id of ['qasim-jidaa', 'siyagh-mutakafia', 'wahid-wa-nafsuh']) {
  await b.page.click(`[data-di-node="${id}"]`); await b.page.click(`[data-di-level="${id}:1"]`); await b.ff(0.4);
  for (let i = 0; i < 6; i += 1) await b.gate(false);
  await b.ff(3);
  s = await b.st(); expect(s.overlay === 'result' && s.o.win && s.o.stars === 3, `${id}: level 1 won with 3 stars`);
  if (id === 'siyagh-mutakafia') { await b.page.waitForTimeout(500); await b.shot('result-3-stars'); }
  await b.page.click('[data-di-result-map]'); await b.page.waitForSelector('[data-di-mapcard]');
}
await b.page.waitForTimeout(500); await b.shot('map-exam-open');
expect(await b.page.locator('[data-di-node="exam"][data-open="true"]').count() === 1, 'the exam node opens once level 1 of the four keys is passed');
await b.page.click('[data-di-node="exam"]'); await b.page.click('[data-di-level="exam:1"]'); await b.ff(0.4);
const kinds = new Set(await b.page.evaluate(() => window.__world.dash.waves.map((w) => w.key)));
await b.ff(2.5); await b.page.waitForTimeout(400); await b.shot('exam-run');
for (let i = 0; i < 6; i += 1) await b.gate(false);
await b.ff(3);
expect(kinds.size >= 2 && (await b.st()).o?.win, 'the exam level mixes several keys and is won');
// the save survives a reload
await b.page.reload({ waitUntil: 'networkidle' }); await b.page.waitForSelector('[data-di-start]');
s = await b.st();
expect(s.practice['qasim-baqi:1']?.stars === 2 && s.practice['exam:1']?.stars === 3, 'after a reload the practice progress is still there');
// « من البداية » restarts the story, not the practice
await b.page.click('text=من البداية'); await b.page.waitForTimeout(1500); await b.page.waitForSelector('[data-di-start]');
s = await b.page.evaluate(() => { const x = window.__world.getState(); return { stage: x.stage, keys: x.keys.length, open: x.openKeys.length, p: x.practice['exam:1']?.stars }; });
expect(s.stage === 0 && s.keys === 0 && s.open === 4 && s.p === 3, 'restarting the story keeps the practice levels and the nodes open');
await b.close();

// ── 3. another device: no game save, but the lesson's progress says modules 1 and 2 are done ──
{
  const c = await student(9103, { 'u_9103_smarter_lesson_qasim-adad-tabii': { completedModules: ['1', '2', '3', '4'], completedExercises: [] } });
  await c.page.click('[data-di-map]'); await c.page.waitForSelector('[data-di-mapcard]');
  expect(await c.page.locator('[data-di-node][data-open="true"]').count() === 4, 'on a device without a game save, the lesson progress opens the four nodes');
  await c.close();
}
console.log('ok   nothing scrolls at any screenshot of the walk');
if (shrunk.size) console.log('note: content scaled below ×0.8 to fit at:', [...shrunk].map(([k, v]) => `${k} @ ${v}`).join('; '));
expect(errors.length === 0, 'no page error');
await browser.close();
