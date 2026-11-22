// « أرخبيل القواسم » — walk of the game world of lesson `qasim-adad-tabii` as a STUDENT (simulated session, no API).
// It plays the whole game through the public surface (keys, HUD buttons) and, to save time, moves the robot with the dev
// handle `window.__world` and fast-forwards the simulation with `step()`. It fails on any page error or a missed stage.
// Run (dev server up): node apps/web/e2e/gameworld-divisor-isles.mjs [outDir] [--until=<stage>]
import { chromium } from 'playwright';
import { GL_ARGS } from './lib/gpu.mjs';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

const BASE = process.env.E2E_BASE || 'http://localhost:5173';
const LESSON = `${BASE}/courses/moyen/4am/ansab_al_aadad_wal_hisab/qasim-adad-tabii`;
const OUT = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : `${tmpdir()}/gameworld-divisor-isles`;
const UNTIL = Number((process.argv.find((a) => a.startsWith('--until=')) || '--until=99').split('=')[1]);
const SIZE = (process.env.E2E_SIZE || '1366x768').split('x').map(Number);
mkdirSync(OUT, { recursive: true });

const USER = { id: 9001, name: 'تلميذ', firstName: 'ياسين', lastName: 'بلقاسم', nameComplete: true, emailVerified: true, email: 'eleve@example.test', role: 'student', roles: ['student'], email_verified_at: '2026-09-01T00:00:00Z', level: '4am', grade: '4am' };
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
    { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); for (let t = w.nextNode(); t; t = w.nextNode()) { const p = t.parentElement; if (!p || p.closest('.katex, script, style')) continue; if (/\$|\\(times|div|frac|dfrac|le|ge|ne|sqrt|cdot)\b/.test(t.nodeValue) && p.getClientRects().length) bad.push('raw formula on screen: « ' + t.nodeValue.trim().slice(0, 60) + ' »'); } }
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
  // on a phone a box may scroll INSIDE itself (GAME_WORLD.md « On a phone »): the page itself, and sideways, never
  if (TOUCH) res.bad = res.bad.filter((b) => !b.startsWith('scrolls: ') && !b.startsWith('cut: ') && !b.startsWith('leaves the screen'));
  if (res.bad.length) { console.log('FAIL no scrolling at «', where, '»:', res.bad.join(' | ')); process.exitCode = 1; throw new Error(`scroll at ${where}`); }
}
const browser = await chromium.launch({ args: GL_ARGS });
// E2E_TOUCH=1: a phone (touch screen, coarse pointer) — with E2E_SIZE=844x390 (sideways) or 390x844 (upright)
const TOUCH = process.env.E2E_TOUCH === '1';
const ctx = await browser.newContext({ viewport: { width: SIZE[0], height: SIZE[1] }, deviceScaleFactor: 1, ...(TOUCH ? { hasTouch: true, isMobile: true } : {}) });
await ctx.addInitScript((user) => {
  window.__paperFast = true; // the paper gate's few seconds of « pick up your pen » are skipped by the walk
  window.__forgeFast = true; // the mirror of the rule forge builds its bridges at once
  try { localStorage.setItem('token', 'qa-fake-token'); } catch { /* noop */ }
  try { const k = `u_${user.id}_smarter_launch_kit`; if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify({ lessons: { 'qasim-adad-tabii': { tries: 1 } } })); } catch { /* noop */ } // « عُدّة الانطلاق » already played: « ابدأ » enters the world (its own walk: launch-kit.mjs)
  const real = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    if (url.includes('/api/')) {
      const body = url.includes('/auth/me') ? { success: true, user } : { success: true, data: [] };
      return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return real(input, init);
  };
}, USER);
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => { errors.push(e.message); console.log('pageerror', e.message); });
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|fonts|ERR_|Failed to load resource/.test(m.text())) console.log('console.error', m.text().slice(0, 300)); });

let n = 0;
const shot = async (name) => { n += 1; const f = `${OUT}/${String(n).padStart(2, '0')}-${name}.png`; await noScroll(page, name); await page.screenshot({ path: f }); console.log('shot', f); };
/** Fast-forwards the world by `sec` seconds of game time (promises of the tweens resolve between steps). */
const ff = (sec) => page.evaluate(async (s) => { const g = window.__world; for (let t = 0; t < s; t += 0.04) { g.step(0.04); await null; await null; } }, sec);
const st = () => page.evaluate(() => { const s = window.__world.getState(); return { verdict: s.verdict, phase: s.phase, stage: s.stage, overlay: s.overlay?.type ?? null, oid: s.overlay?.id ?? s.overlay?.key ?? s.overlay?.step ?? null, held: s.held, prompt: s.prompt, eq: s.equation, stars: s.stars, keys: s.keys }; });
const tp = (x, z) => page.evaluate(([px, pz]) => { const h = window.__world.hero; h.pos.set(px, 0, pz); h.vel.set(0, 0, 0); h.grounded = true; }, [x, z]);
const act = async () => { await page.keyboard.press('KeyE'); await ff(0.2); };
const expect = (cond, msg) => { if (!cond) { console.log('FAIL', msg); process.exitCode = 1; throw new Error(msg); } console.log('ok  ', msg); };
/** Goes to the pedestal of mould b on the current island and takes it. */
const take = async (b) => {
  // stand in front of the pedestal, on the side the student comes from
  const p = await page.evaluate((bb) => { const g = window.__world; const i = g.hero.island; const ped = g.isl[i].pedestals.find((q) => q.b === bb); const d = g.exitDir(i); return ped ? [ped.x - d.dx * 1.5, ped.z - d.dz * 1.5] : null; }, b);
  expect(p, `pedestal ${b} exists`);
  await tp(p[0], p[1]); await ff(0.15); await act();
  if ((await st()).held !== b) console.log('debug take', JSON.stringify(await st()), JSON.stringify(await page.evaluate(() => { const g = window.__world; return { pos: g.hero.pos, island: g.hero.island, grounded: g.hero.grounded, peds: g.isl[g.hero.island].pedestals.map((q) => [q.b, q.x, q.z]) }; })));
  expect((await st()).held === b, `holds mould ${b}`);
};
const toAltar = async (i) => { const p = await page.evaluate((k) => { const g = window.__world; const a = g.segs[k].altarWorld; const isl = g.isl[k]; return [a.x, a.z, isl.x, isl.z]; }, i); const d = Math.hypot(p[2] - p[0], p[3] - p[1]); await tp(p[0] + ((p[2] - p[0]) / d) * 1.6, p[1] + ((p[3] - p[1]) / d) * 1.6); await ff(0.15); };
/** Forges on bridge i with the held mould; answers the prediction with `guess` (the true remainder when omitted). */
const forge = async (i, guess) => {
  await toAltar(i); await act();
  let s = await st();
  if (s.overlay === 'predict') {
    const o = await page.evaluate(() => window.__world.getState().overlay);
    const v = guess ?? (o.a % o.b);
    await page.click(`[data-di-predict="${v}"]`);
  }
  await ff(1.5); 
};
const cross = async (i) => {
  const p = await page.evaluate((k) => { const g = window.__world; const s = g.segs[k]; return { sx: s.sx, sz: s.sz, dx: s.dx, dz: s.dz, len: s.len }; }, i);
  await tp(p.sx + p.dx * 1, p.sz + p.dz * 1); await ff(0.1);
  await page.keyboard.down('ArrowUp'); await ff(p.len / 6.2 + 1.2); await page.keyboard.up('ArrowUp'); await ff(0.3);
};

await page.goto(LESSON, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-di-start]', { timeout: 30000 });
await page.waitForTimeout(1500);
await shot('title');
await page.click('[data-di-start]');
await page.waitForTimeout(1200);
await shot('start');
expect((await st()).phase === 'play', 'the game starts in play phase');

// ── bridge 15 with mould 3 (no prediction) ──
await take(3); await shot('holding-3');
await toAltar(0); await page.waitForTimeout(900); await shot('at-altar');
{
  const w = await page.evaluate(() => { const el = document.querySelector('[data-di-wprompt]'); if (!el) return null; const r = el.getBoundingClientRect(); const g = window.__world; return { text: el.textContent, vis: getComputedStyle(el).visibility, cx: r.left + r.width / 2, bottom: r.bottom, beacon: g.segs[0].altar.userData.beacon.visible }; });
  expect(w && w.vis === 'visible' && w.text.includes(TOUCH ? 'اضغط هنا' : 'E') && w.text.includes('ابنِ الجسر'), 'near the platform a floating « اضغط E — ابنِ الجسر » shows in the world');
  expect(w.cx > 200 && w.cx < SIZE[0] - 200 && w.bottom > 150 && w.bottom < SIZE[1] - 150, 'the floating prompt sits over the scene, not at the bottom edge');
  expect(w.beacon, 'the platform is lit by its beacon while a mould is in hand');
}
await act(); await ff(1.6); await page.waitForTimeout(400); await shot('forge-15-mid');
await ff(6); await page.waitForTimeout(400); await shot('forge-15-done');
expect((await st()).stars.s15 === 3, 'bridge 15 holds with 3 stars');
await cross(0); await page.waitForTimeout(300); await shot('island-B');
expect((await st()).stage === 1, 'arrived on island B');
if (UNTIL <= 1) { await browser.close(); process.exit(); }

// ── bridge 16: the carried 3 fails (remainder 1), then 4 holds ──
await forge(1, 0); await ff(1.2); await page.waitForTimeout(300); await shot('forge-16-gap');
await ff(4);
expect((await st()).verdict?.right === false, 'mould 3 on 16, predicted 0: the prediction is wrong (remainder 1)');
await ff(6);
expect((await st()).phase === 'play' && !(await st()).stars.s16, 'bridge 16 crumbled with mould 3');
await take(4); await forge(1); await ff(8); await page.waitForTimeout(300); await shot('forge-16-ok');
expect((await st()).stars.s16 === 2, 'bridge 16 holds: 2 stars (first prediction was wrong)');
await cross(1);
expect((await st()).stage === 2, 'arrived on island C');
if (UNTIL <= 2) { await browser.close(); process.exit(); }

// ── bridge 42: 5 fails (2), 6 holds ──
await page.waitForTimeout(300); await shot('island-C');
await take(5); await toAltar(2); await act(); await page.waitForTimeout(500); await shot('predict');
await page.click('[data-di-predict="2"]'); await ff(6); await page.waitForTimeout(300); await shot('forge-42-gap');
// a RIGHT prediction of a remainder that is not 0 is shown as a success, apart from the bridge that does not hold
{
  const v = await page.evaluate(() => ({ v: window.__world.getState().verdict, dom: document.querySelector('[data-di-verdict]')?.dataset.diVerdict, text: document.querySelector('.di-verdict__pred')?.textContent ?? '', ko: Boolean(document.querySelector('.di-eq.is-ko')) }));
  expect(v.v?.right === true && v.v.r === 2 && v.v.holds === false, 'mould 5 on 42, predicted 2: the prediction is RIGHT although the bridge does not hold');
  expect(v.dom === 'right' && v.text.includes('توقّعك صحيح') && !v.ko, 'the screen says « توقّعك صحيح » and shows no error styling');
}
await ff(8);
await take(6); await forge(2); await ff(10);
expect((await st()).stars.s42 === 3, 'bridge 42 holds with 3 stars');
await cross(2); await page.waitForTimeout(500);
let s = await st();
expect(s.stage === 3 && s.overlay === 'forge', 'island D opens the RULE FORGE: the rule is not told, the student forges it');
// ── the forges: what every one of them shares ──
const fg = () => page.evaluate(() => window.__forge);
/** The last step: writes the answer in its boxes (and the verdict, when the forge asks one), then « تحقّق ». */
const fillUse = async (vals, verdict = null) => {
  for (const [name, v] of Object.entries(vals)) await page.fill(`[data-rf-use="${name}"]`, String(v));
  if (verdict !== null) await page.click(`[data-rf-use-verdict="${verdict ? 'yes' : 'no'}"]`);
  await page.click('[data-rf-use-check]'); await page.waitForSelector('[data-rf-use-fb]');
};
/** Right predictions until the forge lets him write his rule. */
const toBuild = async () => {
  for (let i = 0; i < 12 && (await fg()).phase === 'predict'; i += 1) {
    const f = await fg();
    if (f.show.stage === 'ask') { await page.click(`[data-rf-guess="${f.show.c.held ? 'yes' : 'no'}"]`); await page.waitForSelector('[data-rf-predicted]'); }
    await page.click('[data-rf-next]'); await page.waitForTimeout(80);
  }
  await page.waitForSelector('[data-rf="build"]');
};
/** From « اكتب قاعدتك »: the right tiles, the mirror's test, its attacks, the seal, the last step — up to the tablet. */
const finishForge = async ({ tiles, last }) => {
  for (const t of tiles) await page.click(`[data-rf-tile="${t}"]`);
  await page.click('[data-rf-test]'); await page.waitForSelector('[data-rf-agreed]');
  await page.click('[data-rf-dare]'); await page.waitForSelector('[data-rf="attack"]');
  for (let i = 0; i < 4; i += 1) {
    const a = (await fg()).atk; const c = a.list[a.i];
    await page.click(`[data-rf-say="${c.held ? 'yes' : 'no'}"]`); await page.click('[data-rf-fire]'); await page.waitForSelector('[data-rf-survived]');
    await page.click('[data-rf-attack-next]');
    if (a.i + 1 >= a.list.length) break;
    await page.waitForSelector('[data-rf-say]'); await page.waitForTimeout(80);
  }
  await page.waitForSelector('[data-rf-sealed]');
  await page.click('[data-rf-seal]'); await page.waitForSelector('[data-rf="use"]'); await page.waitForTimeout(80);
  await last((await fg()).use.c);
  await page.waitForSelector('[data-di-my-rule]');
};
// ── « مصهر القاعدة »: predict → write his rule with two tiles → the mirror tests it on HIS crossing → attacks it → seals it ──
{
  const rowsOf = () => page.locator('[data-rf-row]').evaluateAll((els) => els.map((e) => e.dataset.rfRow));
  const crossing = await rowsOf();
  expect(['15:3', '42:5', '42:6'].every((r) => crossing.includes(r)) && await page.locator('[data-rf-row].is-fell').count() >= 1, `the evidence of the forge is his OWN crossing — the bridges that held and those that crumbled (${crossing.join(' ')})`);
  await shot('forge-predict');
  // 1. predictions on bridges he has not built: a miss, then three right in a row
  const guess = async (right) => { const c = (await fg()).show.c; await page.click(`[data-rf-guess="${c.held === right ? 'yes' : 'no'}"]`); await page.waitForSelector('[data-rf-predicted]'); return c; };
  let c = await guess(false);
  expect(await page.getAttribute('[data-rf-predicted]', 'data-rf-predicted') === 'miss' && !(await page.textContent('.rf-panel')).includes('خطأ') && (await page.textContent('[data-rf-eq]')).includes(String(c.a)), 'a missed prediction is said without « wrong »; the mirror builds the bridge and writes its division');
  expect(await page.getAttribute(`[data-rf-row="${c.a}:${c.b}"]`, 'data-rf-own') === '0', 'a bridge the mirror built joins the evidence, marked as the mirror’s');
  await page.click('[data-rf-next]');
  for (let i = 0; i < 3; i += 1) { await guess(true); if (i < 2) await page.click('[data-rf-next]'); }
  expect(await page.getAttribute('[data-rf-streak]', 'data-rf-streak') === '3' && (await page.textContent('.rf-panel')).includes('القاعدة في رأسك'), 'three right predictions in a row: « the rule is in your head — write it »');
  await shot('forge-predicted');
  await page.click('[data-rf-next]'); await page.waitForSelector('[data-rf="build"]');
  // 2. a false rule (« the plank is an even number ») is refuted by one of HIS bridges, not by the platform
  expect(await page.locator('[data-rf-tile^="q:"]').count() === 4 && await page.locator('[data-rf-tile^="c:"]').count() === 4 && await page.locator('[data-rf-test]').isDisabled(), 'the rule is written with two tiles — what I read, how it must be; nothing can be tested before both are chosen');
  await page.click('[data-rf-tile="q:b"]'); await page.click('[data-rf-tile="c:even"]'); await shot('forge-build');
  await page.click('[data-rf-test]'); await page.waitForSelector('[data-rf-refuted]');
  expect(await page.getAttribute('[data-rf-refuted]', 'data-rf-refuted') === '15:3' && await page.getAttribute('[data-rf-row="15:3"]', 'data-rf-mark') === 'refute' && await page.getAttribute('[data-rf-row="15:3"]', 'data-rf-own') === '1' && (await page.textContent('[data-rf-refuted]')).includes('لكنّك رأيته'), 'the mirror runs it on his crossing and stops on the first bridge that contradicts it — his very first bridge: 15 with the plank 3 held, and 3 is odd');
  {
    const out = await page.evaluate(() => { const box = document.querySelector('.rf-log').getBoundingClientRect(); const stage = document.querySelector('.rf-panel').getBoundingClientRect(); return [...document.querySelectorAll('[data-rf-row], .rf-panel > *')].filter((el) => { const r = el.getBoundingClientRect(); const lim = el.matches('[data-rf-row]') ? box : stage; const frame = el.matches('[data-rf-row]') ? el.closest('ul') : el.parentElement; if (/(auto|scroll)/.test(getComputedStyle(frame).overflowY)) return false; /* on a phone the list and the panel slide inside themselves */ return r.bottom > lim.bottom + 1 || r.top < lim.top - 1; }).map((el) => el.dataset.rfRow ?? el.className); });
    expect(out.length === 0, `every line of the evidence and of the panel stays inside its frame, also while the rule is being tested (${out.join(' | ') || 'none out'})`);
  }
  await shot('forge-refuted');
  await page.click('[data-rf-fix]'); await page.waitForSelector('[data-rf="build"]');
  // the robot helps without giving the rule: two of his own bridges to compare
  await page.click('[data-rf-help]');
  expect(await page.getAttribute('[data-rf-nudge]', 'data-rf-nudge') === 'compare' && await page.locator('[data-rf-row].is-compare').count() === 2 && !(await page.textContent('[data-rf-nudge]')).includes('يساوي 0'), 'the robot points at two of his bridges over the same gap — and does not say the rule');
  await shot('forge-nudge');
  // 3. the right rule agrees with every bridge, then survives two attacks
  await page.click('[data-rf-tile="q:r"]'); await page.click('[data-rf-tile="c:zero"]'); await page.click('[data-rf-test]'); await page.waitForSelector('[data-rf-agreed]');
  expect(await page.locator('[data-rf-row][data-rf-mark="agree"]').count() === (await rowsOf()).length, 'every bridge of the evidence agrees with it');
  await page.click('[data-rf-dare]'); await page.waitForSelector('[data-rf="attack"]');
  const first = (await fg()).atk.list;
  expect(first.length === 2 && first[0].held === false && first[0].a % 2 === 0 && first[0].b % 2 === 0 && first[1].held === true, 'the mirror attacks with a NEW gap: two even numbers that crumble, then an odd plank that holds');
  await page.click('[data-rf-say="yes"]'); // not what his rule says of this bridge
  expect((await page.textContent('.rf-panel')).includes('قاعدتك تقول غير ذلك') && await page.getAttribute('[data-rf-rule-says]', 'data-rf-rule-says') === 'no', 'he must say what HIS rule predicts; a slip is answered by the rule applied to the bridge, in words');
  await shot('forge-attack');
  await page.click('[data-rf-fire]'); await page.waitForSelector('[data-rf-survived]'); await shot('forge-survived');
  await page.click('[data-rf-attack-next]'); await page.click('[data-rf-say="yes"]'); await page.click('[data-rf-fire]'); await page.waitForSelector('[data-rf-survived]');
  await page.click('[data-rf-attack-next]'); await page.waitForSelector('[data-rf-sealed]');
  // 4. the key: his words, then one gap too long to count
  await page.fill('[data-rf-words]', 'الجسر يثبت إذا لم يبقَ شيء'); await shot('forge-seal');
  await page.click('[data-rf-seal]'); await page.waitForSelector('[data-rf="use"]');
  const u = (await fg()).use.c;
  await fillUse({ q: u.q - 1, r: u.r + u.b }, u.held);
  expect(await page.getAttribute('[data-rf-use-fb]', 'data-rf-use-fb') === 'big', 'the last gap is too long to count: a remainder bigger than the plank is refused with its reason, never the answer');
  await shot('forge-use');
  await fillUse({ q: u.q, r: u.r });
  await page.waitForSelector('[data-di-my-rule]'); await shot('tablet-1');
  const rec = await page.evaluate(() => window.__world.getState().rules['qasim-baqi']);
  expect(rec.rule.q === 'r' && rec.rule.c === 'zero' && rec.tries === 2 && rec.nudges === 1 && rec.level === 'nudged' && rec.predictions.asked === 4 && rec.predictions.right === 3, 'the game keeps HOW the rule was found: two rules tried, one nudge of the robot, three predictions right out of four');
  expect((await page.textContent('[data-di-my-rule]')).includes('باقي قسمة طول الهوّة على طول اللوح يساوي 0') && (await page.textContent('[data-di-my-rule]')).includes('الجسر يثبت إذا لم يبقَ شيء') && (await page.textContent('.di-card')).includes('قاسم'), 'only now the tablet gives the NAME — beside his own rule and his own words');
}
expect((await st()).overlay === 'tablet', 'the first knowledge tablet opens after the forge');
await page.click('[data-di-tablet]'); await ff(0.3);
expect((await st()).keys.includes('qasim-baqi'), 'key 1 earned');
if (UNTIL <= 3) { await browser.close(); process.exit(); }

// ── bridge 48: 6 holds (8 planks), the storm takes it, then 8 (no division) ──
await take(6); await forge(3); await ff(7); await page.waitForTimeout(300); await shot('forge-48-ok');
await ff(10); await page.waitForTimeout(400); await shot('after-storm');
s = await st(); expect(s.phase === 'play' && s.held == null && !s.stars.s48, 'the storm took the bridge and the mould');
await take(8); await forge(3); await ff(12);
expect((await st()).stars.s48 === 3, 'bridge 48 holds with mould 8');
await cross(3); await page.waitForTimeout(500);
s = await st(); expect(s.stage === 4 && s.overlay === 'forge' && (await fg()).key === 'qasim-jidaa', 'island E opens the SECOND forge: the product rule is not told either');
{
  await shot('forge2-predict');
  const c = (await fg()).show.c; await page.click(`[data-rf-guess="${c.held ? 'yes' : 'no'}"]`); await page.waitForSelector('[data-rf-predicted]');
  expect(!(await page.textContent('[data-rf-eq]')).includes('+') && (await page.textContent('.rf-panel')).includes('جدول'), 'the mirror of this island writes a PRODUCT of the plank’s table — no division, no remainder');
  await shot('forge2-predicted');
  await toBuild();
  // the additive idea (« the gap = the plank + a number ») says that every bridge holds: one of HIS bridges that fell refutes it
  await page.click('[data-rf-tile="q:a"]'); await page.click('[data-rf-tile="c:plus"]'); await page.click('[data-rf-test]'); await page.waitForSelector('[data-rf-refuted]');
  const bad = await page.getAttribute('[data-rf-refuted]', 'data-rf-refuted');
  expect(await page.getAttribute(`[data-rf-row="${bad}"]`, 'data-rf-mark') === 'refute' && (await page.locator(`[data-rf-row="${bad}"].is-fell`).count()) === 1 && (await page.textContent('.rf-panel')).includes('+'), `a false rule of this forge is refuted by a bridge of his that fell (${bad}), with his rule applied to it in words`);
  await shot('forge2-refuted');
  await page.click('[data-rf-fix]'); await page.waitForSelector('[data-rf="build"]');
  await finishForge({ tiles: ['q:a', 'c:times'], last: async (u) => {
    await fillUse({ k: u.q - 1, p: u.b * (u.q - 1) }, u.held);
    expect(await page.getAttribute('[data-rf-use-fb]', 'data-rf-use-fb') === 'far', 'the last step is a product typed in its shape: one that stops a plank too early is refused with its reason');
    await shot('forge2-use');
    await fillUse({ k: u.q, p: u.b * u.q });
  } });
  await shot('tablet-2');
  expect((await page.textContent('[data-di-my-rule]')).includes('يساوي طول اللوح × عددًا طبيعيًّا') && (await page.evaluate(() => window.__world.getState().rules['qasim-jidaa'].tries)) === 2, 'tablet 2 names the product rule AFTER his own; the game kept that he tried two rules');
}
expect((await st()).overlay === 'tablet', 'tablet 2 on island E'); await page.click('[data-di-tablet]'); await ff(0.3);
if (UNTIL <= 4) { await browser.close(); process.exit(); }

// ── bridge 120 with 20 ──
await take(20); await toAltar(4); await act(); await page.waitForTimeout(400); await shot('predict-20');
await page.click('[data-di-predict="0"]'); await ff(4); await page.waitForTimeout(300); await shot('forge-120');
await ff(8);
expect((await st()).stars.s120 === 3, 'bridge 120 holds with mould 20');
await cross(4); await page.waitForTimeout(400); await shot('island-F');
expect((await st()).stage === 5, 'arrived on island F');
if (UNTIL <= 5) { await browser.close(); process.exit(); }

// ── the four guardians ──
let ring = await page.evaluate(() => { const g = window.__world; const w = g.statueRing.getWorldPosition(g.statueRing.position.clone()); return [w.x, w.z]; });
await tp(ring[0], ring[1]); await ff(0.2); await act(); await page.waitForTimeout(400); await shot('statues');
expect((await st()).overlay === 'statues', 'the guardians puzzle opens');
await page.click('[data-di-check]'); await page.waitForTimeout(300); await shot('statues-wrong');
for (const id of ['qasim', 'yaqsim', 'yaqbal', 'mudaaf']) await page.click(`[data-di-sentence="${id}"]`);
await page.click('[data-di-check]'); await page.waitForTimeout(500);
s = await st(); expect(s.overlay === 'forge' && (await fg()).key === 'siyagh-mutakafia', 'the four sentences are right: the guardians’ mirror opens — now he must say WHY');
{
  const c = (await fg()).show.c;
  expect(await page.locator('[data-rf-row]').count() === 4 && (await page.textContent('[data-rf-log]')).includes('6 قاسم للعدد 120') && (await page.textContent('[data-rf-sentence]')).includes(c.text), 'the evidence is the guardians’ four sentences, and a case is a SENTENCE written above the bridge it means');
  await shot('forge3-predict');
  await toBuild();
  expect(await page.locator('[data-rf-tile]').count() === 8, 'one tile per phrasing: is the number written first the plank or the gap?');
  for (const f of ['qasim', 'yaqsim', 'yaqbal', 'mudaaf']) await page.click(`[data-rf-tile="${f}:plank"]`);
  await shot('forge3-build');
  await page.click('[data-rf-test]'); await page.waitForSelector('[data-rf-refuted]');
  expect(/^(yaqbal|mudaaf):120:6$/.test(await page.getAttribute('[data-rf-refuted]', 'data-rf-refuted')) && (await page.textContent('[data-rf-refuted]')).includes('الحرّاس قبلوها'), 'a reading that puts the plank first everywhere is refuted by a sentence the guardians accepted');
  await shot('forge3-refuted');
  await page.click('[data-rf-fix]'); await page.waitForSelector('[data-rf="build"]');
  await finishForge({ tiles: ['qasim:plank', 'yaqsim:plank', 'yaqbal:gap', 'mudaaf:gap'], last: async (u) => {
    const right = { 'qasim.x': u.b, 'qasim.y': u.a, 'yaqsim.x': u.b, 'yaqsim.y': u.a, 'yaqbal.x': u.a, 'yaqbal.y': u.b, 'mudaaf.x': u.a, 'mudaaf.y': u.b };
    await fillUse({ ...right, 'mudaaf.x': u.b, 'mudaaf.y': u.a });
    expect(await page.getAttribute('[data-rf-use-fb]', 'data-rf-use-fb') === 'order', 'the last step: one fact written in the four sentences — a sentence the wrong way round is refused, never corrected for him');
    await shot('forge3-use');
    await fillUse(right);
  } });
  await shot('tablet-3');
}
expect((await st()).overlay === 'tablet', 'tablet 3'); await page.click('[data-di-tablet]'); await ff(1.5);

// ── the gate dash: always the right lane ──
const b = await page.evaluate(() => { const g = window.__world; return [g.board.position.x, g.board.position.z]; });
await tp(b[0], b[1]); await ff(0.2); await act();
expect((await st()).phase === 'dash', 'the dash starts');
await ff(2.5); await page.waitForTimeout(400); await shot('dash-1');
for (let w = 0; w < 8; w += 1) {
  await page.evaluate(() => { const d = window.__world.dash; d.lane = d.waves[d.wave].good; });
  if (w === 3) { await ff(2); await page.waitForTimeout(300); await shot('dash-4'); }
  await page.evaluate(async () => { const g = window.__world; const w0 = g.dash?.wave; for (let i = 0; i < 400 && g.dash && g.dash.wave === w0; i += 1) { g.step(0.04); await null; } });
}
await ff(6);
s = await st(); expect(s.stage === 6 && s.stars.dash === 3, 'dash done with 3 hearts, arrived on island G');
await page.waitForTimeout(400); await shot('island-G');
if (UNTIL <= 6) { await browser.close(); process.exit(); }

// ── the stubborn gap of 7: two failures open the workshop, then 1 and 7 ──
await take(2); await forge(6); await ff(8);
await take(3); await forge(6); await ff(9);
const an = await page.evaluate(() => { const g = window.__world; const w = g.anvil.getWorldPosition(g.anvil.position.clone()); const isl = g.isl[6]; return [w.x, w.z, isl.x, isl.z]; });
{ const d = Math.hypot(an[2] - an[0], an[3] - an[1]); await tp(an[0] + ((an[2] - an[0]) / d) * 1.8, an[1] + ((an[3] - an[1]) / d) * 1.8); }
await ff(0.2); await act(); await page.waitForTimeout(400); await shot('workshop');
expect((await st()).overlay === 'workshop', 'the workshop opens after two failures');
for (let i = 0; i < 4; i += 1) await page.click('[data-di-plus]');
await page.click('[data-di-craft]'); await ff(0.2);
expect((await st()).held === 9, 'crafted a mould of 9');
await forge(6); await ff(6); // longer than the gap: no plank
{ const d = Math.hypot(an[2] - an[0], an[3] - an[1]); await tp(an[0] + ((an[2] - an[0]) / d) * 1.8, an[1] + ((an[3] - an[1]) / d) * 1.8); }
await ff(0.2); await act(); for (let i = 0; i < 4; i += 1) await page.click('[data-di-minus]'); await page.click('[data-di-craft]'); await ff(0.2);
expect((await st()).held === 1, 'crafted a mould of 1');
await forge(6); await ff(4); await page.waitForTimeout(300); await shot('forge-7-with-1');
await ff(8);
expect((await st()).stars.s7 >= 1, 'bridge 7 holds with mould 1');
await cross(6); await ff(2.5); await page.waitForTimeout(400); await shot('quiz-seven');
s = await st(); expect(s.stage === 7 && s.overlay === 'quiz', 'island H asks about the gap of 7');
// a WRONG answer is judged choice by choice (the division proves it), the missing mould is counted, never named
await page.click('[data-di-option="3"]'); await page.click('[data-di-option="7"]'); await page.click('[data-di-check]'); await page.waitForTimeout(400); await shot('seven-wrong');
{
  const m = await page.evaluate(() => document.querySelector('[data-di-marks]')?.textContent ?? '');
  expect(m.includes('7 يملأ 7') && m.includes('تبقى خانة واحدة') && m.includes('ينقص قالب واحد'), 'wrong answer {3, 7}: « 7 fills », « 3 leaves one cell », « one mould is missing »');
}
// closing the stone leaves a way back: its beacon is lit, the platform of the last bridge offers NOTHING yet
await page.click('[data-di-quiz-close]'); await ff(0.4);
await toAltar(7); await page.waitForTimeout(700); await shot('altar-before-stone');
s = await st();
expect(s.phase === 'play' && s.prompt == null, 'before the stone is answered, the platform of the last bridge shows no prompt');
expect(await page.evaluate(() => window.__world.stoneBeacon.visible && !window.__world.segs[7].altar.userData.beacon.visible), 'the beacon is on the question stone, not on the platform');
await page.keyboard.press('KeyE'); await ff(0.3); expect((await st()).overlay == null, 'E on that platform opens nothing');
{ const p = await page.evaluate(() => { const g = window.__world; const it = g.stoneIt; const isl = g.isl[7]; const d = Math.hypot(isl.x - it.x, isl.z - it.z); return [it.x + ((isl.x - it.x) / d) * 1.8, it.z + ((isl.z - it.z) / d) * 1.8]; }); await tp(p[0], p[1]); }
await ff(0.3); await page.waitForTimeout(700); await shot('at-stone');
expect((await st()).prompt === 'اقرأ اللوح', 'at the stone the prompt is « اقرأ اللوح »');
await act(); expect((await st()).overlay === 'quiz', 'E at the stone reopens the question');
await page.click('[data-di-option="1"]'); await page.click('[data-di-option="7"]'); await page.click('[data-di-check]'); await page.waitForTimeout(300);
s = await st(); expect(s.overlay === 'forge' && (await fg()).key === 'wahid-wa-nafsuh', 'the gap of 7 understood, the stone shows its mirror: the last key is forged, not told');
{
  await shot('forge4-predict');
  await toBuild();
  // « a plank of 2 always holds »: the mirror builds the planks of HIS rule over the gaps he crossed — an odd one refutes it
  await page.click('[data-rf-tile="short:two"]'); await page.click('[data-rf-tile="long:self"]'); await shot('forge4-build');
  await page.click('[data-rf-test]'); await page.waitForSelector('[data-rf-refuted]');
  const bad = await page.getAttribute('[data-rf-refuted]', 'data-rf-refuted');
  expect(bad.endsWith(':2') && Number(bad.split(':')[0]) % 2 === 1 && (await page.textContent('[data-rf-refuted]')).includes('انهار أمامك'), `a rule about EVERY gap is run on his own gaps: the plank 2 crumbles over an odd one (${bad})`);
  await shot('forge4-refuted');
  await page.click('[data-rf-fix]'); await page.waitForSelector('[data-rf="build"]');
  await finishForge({ tiles: ['short:one', 'long:self'], last: async (u) => {
    await fillUse({ x: 1, y: 100 });
    expect(await page.getAttribute('[data-rf-use-fb]', 'data-rf-use-fb') === 'one' && u.a > 100, 'the last step: a gap never seen, two planks to write without any calculation — one right, the other refused without being named');
    await shot('forge4-use');
    await fillUse({ x: 1, y: u.a });
  } });
  await shot('tablet-4');
}
expect((await st()).overlay === 'tablet', 'tablet 4'); await page.click('[data-di-tablet]'); await ff(0.5);
expect((await st()).keys.length === 4, 'four keys earned');
if (UNTIL <= 7) { await browser.close(); process.exit(); }

// ── the last bridge: the student CHOOSES a mould; 32 leaves 20, then 36 holds, then the price ──
expect(await page.evaluate(() => window.__world.segs[7].altar.userData.beacon.visible), 'after the stone, the beacon moves to the platform of the last bridge');
await toAltar(7); await page.waitForTimeout(600); await act(); await page.waitForTimeout(400); await shot('boss-choose');
s = await st(); expect(s.overlay === 'boss' && (await page.textContent('[data-di-boss-mission]')).includes('اختر القالب'), 'the store opens on its mission and the two moulds');
await page.click('[data-di-mould="32"]'); await page.waitForTimeout(300);
// the store of the last bridge is written work: paper mode, no music, the boxes behind « كتبتُ على ورقتي »
expect(await page.evaluate(() => window.__world.getState().paper === true && window.__world.audio.musicWanted === false) && await page.locator('[data-di-pgate]').count() === 1 && await page.locator('[data-di-q]').count() === 0, 'the last bridge is solved in PAPER MODE: the music stops and the answer waits for the pen');
await shot('boss-paper-gate');
await page.click('[data-di-pgate-go]');
await page.click('[data-di-check]'); await page.waitForTimeout(200);
expect((await page.textContent('[data-di-boss-error]')).includes('اكتب العددين'), 'an empty division is refused with a sentence');
await page.fill('[data-di-q]', '24'); await page.fill('[data-di-r]', '0'); await page.click('[data-di-check]'); await page.waitForTimeout(300); await shot('boss-too-long');
expect((await page.textContent('[data-di-boss-error]')).includes('768'), '24 planks of 32: « 768 cells, longer than the gap »');
await page.fill('[data-di-q]', '22'); await page.fill('[data-di-r]', '52'); await page.click('[data-di-check]'); await page.waitForTimeout(300);
expect((await page.textContent('[data-di-boss-error]')).includes('أصغر من 32'), 'remainder 52: « room for another plank »');
await page.fill('[data-di-q]', '23'); await page.fill('[data-di-r]', '20'); await page.click('[data-di-check]');
await ff(5); await page.waitForTimeout(300); await shot('boss-forge-32');
await ff(10); await page.waitForTimeout(400); await shot('boss-after-32');
s = await page.evaluate(() => window.__world.getState().overlay);
expect(s?.type === 'boss' && s.view === 'choose' && s.tried[32] === 20, 'mould 32 failed: the store shows it « tried: 20 cells left » and lets the student choose again');
await page.click('[data-di-mould="36"]'); await page.waitForTimeout(300); await page.click('[data-di-pgate-go]');
await page.fill('[data-di-q]', '21'); await page.fill('[data-di-r]', '0'); await page.click('[data-di-check]');
await ff(12); await page.waitForTimeout(300); await shot('boss-cost');
s = await page.evaluate(() => window.__world.getState().overlay);
expect(s?.type === 'boss' && s.view === 'cost' && s.q === 21, 'the bridge of 756 holds, the store asks the price of 21 planks');
await page.click('[data-di-pgate-go]');
await page.fill('[data-di-cost]', '3885'); await page.click('[data-di-check]'); await page.waitForTimeout(300);
expect((await page.textContent('[data-di-boss-error]')).includes('3885'), 'a wrong price is refused with a sentence');
await page.fill('[data-di-cost]', '38850'); await page.click('[data-di-check]'); await ff(0.5);
expect((await st()).overlay == null && (await page.evaluate(() => window.__world.getState().objective)).includes('اعبر إلى المنارة'), 'paid: the objective says to cross to the lighthouse');
expect(await page.evaluate(() => window.__world.getState().paper === false && window.__world.audio.musicWanted === true), 'the written work is over: the music comes back');
await page.waitForTimeout(300); await shot('boss-bridge');
await cross(7); await ff(3); await page.waitForTimeout(500); await shot('finale');
await ff(6); await page.waitForTimeout(600); await shot('end');
s = await st(); expect(s.overlay === 'end' && s.stage === 8, 'the lighthouse is lit and the end screen shows');
// the end screen leads to the practice game: the map opens with the four nodes the story unlocked
await page.click('[data-di-end-practice]'); await page.waitForSelector('[data-di-mapcard]'); await page.waitForTimeout(400); await shot('map-after-story');
expect(await page.locator('[data-di-node][data-open="true"]').count() === 4, 'after the story the map shows the four keys open for practice');
await page.click('[data-di-map-close]'); await ff(0.3);
expect((await st()).phase === 'play', 'closing the map gives the world back');
console.log('stars', JSON.stringify(s.stars));

// ── the save: a reload offers to continue, on the lighthouse island ──
await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector('[data-di-start]', { timeout: 30000 });
s = await page.evaluate(() => { const st0 = window.__world.getState(); return { hasSave: st0.hasSave, stage: st0.stage, keys: st0.keys.length, finished: st0.finished }; });
expect(s.hasSave && s.stage === 8 && s.keys === 4 && s.finished, 'after a reload the save is offered (stage 8, four keys)');
await page.waitForTimeout(800); await shot('title-resume');

// ── the old version is deleted (owner, 2026-11-18): a module address and `?view=classic` lead to the world, never a 404 ──
await page.goto(`${LESSON}/maarif`, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-gameworld]', { timeout: 30000 });
expect(new URL(page.url()).pathname === new URL(LESSON).pathname, 'a module address of the deleted pages redirects to the lesson home');
await page.goto(`${LESSON}?view=classic`, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-gameworld]', { timeout: 30000 });
expect(!(await page.textContent('body')).includes('756'), '?view=classic opens the world: no mission player behind it');
await shot('old-address');

// ── a TEACHER never sees the world ──
const tctx = await browser.newContext({ viewport: { width: SIZE[0], height: SIZE[1] } });
await tctx.addInitScript((user) => {
  try { localStorage.setItem('token', 'qa-fake-token'); } catch { /* noop */ }
  try { const k = `u_${user.id}_smarter_launch_kit`; if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify({ lessons: { 'qasim-adad-tabii': { tries: 1 } } })); } catch { /* noop */ } // « عُدّة الانطلاق » already played: « ابدأ » enters the world (its own walk: launch-kit.mjs)
  const real = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    if (url.includes('/api/')) return new Response(JSON.stringify(url.includes('/auth/me') ? { success: true, user } : { success: true, data: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    return real(input, init);
  };
}, { ...USER, id: 9002, role: 'teacher', roles: ['teacher'], level: null, grade: null });
const tpage = await tctx.newPage();
await tpage.goto(LESSON, { waitUntil: 'networkidle' });
await tpage.waitForTimeout(2000);
expect(await tpage.locator('[data-gameworld]').count() === 0, 'a teacher sees no game world');
expect((await tpage.textContent('body')).includes('التعرّف على قاسم'), 'a teacher sees the lesson page');
await tpage.screenshot({ path: `${OUT}/teacher.png` });

console.log('ok   nothing scrolls at any screenshot of the walk');
if (shrunk.size) console.log('note: content scaled below ×0.8 to fit at:', [...shrunk].map(([k, v]) => `${k} @ ${v}`).join('; '));
expect(errors.length === 0, 'no page error');
await browser.close();
