// « أرخبيل القواسم: جزر الأزواج » — walk of the game world of lesson `qawasim-adad-tabii` as a STUDENT: its own story in
// the unit's world, and its four forges (a bridge gives a second one; a natural number of planks; which planks must be
// tried; what to read instead of dividing). The set-up and the helpers are those of gameworld-divisor-isles.mjs.
// Run (dev server up): [E2E_SIZE=1366x768] [E2E_TOUCH=1] node apps/web/e2e/gameworld-qawasim.mjs [outDir]
import { chromium } from 'playwright';
import { GL_ARGS } from './lib/gpu.mjs';
import { tinyText } from './lib/walk.mjs';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

const BASE = process.env.E2E_BASE || 'http://localhost:5173';
const LESSON = `${BASE}/courses/moyen/4am/ansab_al_aadad_wal_hisab/qawasim-adad-tabii`;
const OUT = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : `${tmpdir()}/gameworld-qawasim`;
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
  try { const k = `u_${user.id}_smarter_launch_kit`; if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify({ lessons: { 'qawasim-adad-tabii': { tries: 1 } } })); } catch { /* noop */ } // « عُدّة الانطلاق » already played: « ابدأ » enters the world (its own walk: launch-kit.mjs)
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

// ── the forges: what every one of them shares ──
const fg = () => page.evaluate(() => window.__forge);
/** The last step: writes the answer in its boxes (and the verdict, when the forge asks one), then « تحقّق ». */
const fillUse = async (vals, verdict = null) => {
  for (const [name, v] of Object.entries(vals)) await page.fill(`[data-rf-use="${name}"]`, String(v));
  if (verdict !== null) await page.click(`[data-rf-use-verdict="${verdict ? 'yes' : 'no'}"]`);
  await page.click('[data-rf-use-check]'); await page.waitForSelector('[data-rf-use-fb]');
};
/** From « اكتب قاعدتك »: the right tiles, the mirror's test, its attacks, the seal, the last step — up to the tablet. */
const finishForge = async ({ tiles, last }) => {
  for (const t of tiles) await page.click(`[data-rf-tile="${t}"]`);
  await page.click('[data-rf-test]'); await page.waitForSelector('[data-rf-agreed]');
  await page.click('[data-rf-dare]'); await page.waitForSelector('[data-rf="attack"]');
  await attackToTablet(last);
};
/** From the mirror's attacks: each one answered as the rule says, then the seal and the last step — up to the tablet. */
const attackToTablet = async (last) => {
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

const iq = () => page.evaluate(() => window.__inquiry);
/** The forge covers the top bar: its OWN ✕ (leave the game) and sound button are on screen, uncovered, and its header keeps one row. */
const forgeTools = async (where) => {
  const t = await page.evaluate(() => {
    const seen = (sel) => { const el = document.querySelector(sel); if (!el) return false; const r = el.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return r.width > 0 && r.left >= 0 && r.right <= window.innerWidth + 1 && r.top >= 0 && (el === top || el.contains(top)); };
    const head = document.querySelector('.rf-head'); const kids = [...head.children].map((k) => k.getBoundingClientRect());
    const apart = kids.every((a, i) => kids.every((b, j) => i >= j || a.right <= b.left + 1 || b.right <= a.left + 1));
    return { exit: seen('.rf-root [data-di-exit]'), sound: seen('.rf-root [data-di-sound]'), help: !document.querySelector('[data-rf-help]') || seen('[data-rf-help]'), href: document.querySelector('.rf-root [data-di-exit]')?.getAttribute('href'), apart, titleOneLine: (() => { const h = document.querySelector('.rf-brand h2'); return h.getBoundingClientRect().height < 1.9 * parseFloat(getComputedStyle(h).fontSize) * (parseFloat(document.querySelector('.rf-fit').style.zoom) || 1); })(), inScreen: head.getBoundingClientRect().right <= window.innerWidth + 1 && kids.every((k) => k.left >= -1 && k.right <= window.innerWidth + 1) };
  });
  expect(t.exit && t.sound && t.help && Boolean(t.href) && t.apart && t.titleOneLine && t.inScreen, `${where}: the forge shows the ✕ that leaves the game and the sound button, uncovered, beside its steps (${JSON.stringify(t)})`);
};
/** An investigation screen: nothing of it leaves its frame, no button is covered, no text is under 12 px — then the screenshot. */
const inquiryFits = async (name) => {
  await page.waitForTimeout(250);
  const bad = await page.evaluate(() => {
    const out = []; const frame = document.querySelector('.iq'); const box = frame.getBoundingClientRect();
    const zoom = parseFloat(document.querySelector('.rf-fit').style.zoom) || 1;
    for (const el of frame.querySelectorAll('button, .iq-lead p, .iq-goal, .iq-how, .iq-div, .iq-equals, .iq-fact, .iq-strip, .iq-table, .iq-chart, .iq-found li')) {
      const r = el.getBoundingClientRect(); if (!r.width) continue;
      if (r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1) out.push(String(el.className).split(' ')[0] + ' leaves the frame');
      if (el.tagName === 'BUTTON') { const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (top && !el.contains(top) && !top.contains(el)) out.push('covered: « ' + el.textContent.trim().slice(0, 18) + ' »'); }
      if (el.textContent.trim() && !el.querySelector('*:not(.katex):not(.katex *)') && parseFloat(getComputedStyle(el).fontSize) * zoom < 11.5) out.push('text under 12 px: ' + String(el.className).split(' ')[0]);
    }
    if (box.bottom > window.innerHeight + 1 || box.right > window.innerWidth + 1) out.push('the frame leaves the screen');
    for (const el of frame.querySelectorAll('*')) if (/(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight + 2) out.push('scrolls: ' + el.className);
    return [...new Set(out)];
  });
  expect(bad.length === 0, `${name}: the investigation fits its frame — nothing cut, covered, scrolled or too small${bad.length ? ' — ' + bad.join(' | ') : ''}`);
  await shot(name);
};
const fact = () => page.textContent('[data-iq-fact]');

// ══════════════════════════ the story of lesson « قواسم عدد طبيعي » ══════════════════════════
await page.goto(LESSON, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-di-start]', { timeout: 30000 });
await page.waitForTimeout(1200);
expect((await page.textContent('.di-title, [data-di-title], h1')).includes('جزر الأزواج'), 'the title screen is this lesson’s own story');
await shot('title');
await page.click('[data-di-start]');
await page.waitForTimeout(1200);
expect((await st()).phase === 'play', 'the game starts in play phase');

// ── 24 with planks of 3: eight planks — then the same gap with planks of 8 ──
await take(3); await forge(0); await ff(6);
expect((await st()).stars.g24 >= 1, 'bridge 24 holds with planks of 3');
await shot('g24');
await cross(0); await page.waitForTimeout(400);
let s = await st();
expect(s.stage === 1 && s.held == null, 'on the second island the mould is not kept: he must choose');
await take(5); await forge(1, 0); await ff(8); await page.waitForTimeout(300);
expect(!(await st()).stars.g24b, 'planks of 5 leave cells over 24: the bridge crumbles');
await take(8); await forge(1); await ff(8);
expect((await st()).stars.g24b >= 1, 'planks of 8 hold over the same gap: the first bridge turned round');
await shot('g24b');
await cross(1); await page.waitForTimeout(400);
await take(5); await forge(2); await ff(8);
expect((await st()).stars.g40 >= 1, 'bridge 40 holds with planks of 5');
await cross(2); await page.waitForTimeout(500);

// ── forge 1 🧱: one bridge gives a second one — FOUND on the wall, then written ──
s = await st(); expect(s.stage === 3 && s.overlay === 'forge' && (await fg()).key === 'jidaa-aamilayn' && (await fg()).phase === 'inquiry', 'island D opens the first forge on an INVESTIGATION: the wall');
{
  const lead = () => page.textContent('.iq-lead');
  expect((await iq()).kind === 'turn' && (await iq()).a === 24 && (await iq()).d === 3 && await page.locator('[data-rf-tile]').count() === 0, 'no tile, no prediction: it starts from HIS first bridge — 24 with planks of 3');
  await inquiryFits('inquiry1-start');
  for (let i = 0; i < 8; i += 1) await page.click('[data-iq-lift]');
  expect((await iq()).stage === 'cut', 'he lifts the eight planks one by one: a wall of 24 cells, none added, none lost');
  await inquiryFits('inquiry1-wall');
  for (let i = 0; i < 3; i += 1) await page.click('[data-iq-lay]');
  expect((await iq()).stage === 'seen' && (await lead()).includes('3 ألواح طولها 8'), 'he takes the wall down column by column: the same cells are 3 planks of 8 — the second bridge he built');
  await inquiryFits('inquiry1-turned');
  await page.click('[data-iq-next]');
  // he says what the columns will give BEFORE the wall is turned
  expect((await iq()).stage === 'predict' && (await iq()).a === 40 && await page.locator('[data-iq-turn]').count() === 0, 'a second bridge (40 with planks of 5): the wall is not turned before he has said what its columns will give');
  await page.click('[data-iq-say="len:5"]'); await page.click('[data-iq-say="count:8"]');
  await inquiryFits('inquiry1-predict');
  await page.click('[data-iq-turn]'); await page.waitForSelector('[data-iq-next]');
  expect((await lead()).includes('5 ألواح طولها 8') && (await lead()).includes('كنتَ توقّعت 8 ألواح طولها 5'), 'he said « the same bridge again »: the wall answers with what it gave, beside what he had said — never « wrong »');
  await page.click('[data-iq-next]');
  expect((await iq()).rest === 4 && await page.locator('.iq-brick.is-rest').count() === 4, 'a bridge that FELL (40 with planks of 6): its four cells left are part of the wall');
  await page.click('[data-iq-say="equal:yes"]'); await page.click('[data-iq-turn]'); await page.waitForSelector('[data-iq-next]');
  expect((await lead()).includes('غير متساوية'), 'its wall is ragged: the columns are not equal — no plank comes out of a bridge that fell');
  await inquiryFits('inquiry1-ragged');
  await page.click('[data-iq-next]');
  await page.click('[data-iq-say="len:6"]'); await page.click('[data-iq-say="count:6"]'); await page.click('[data-iq-turn]'); await page.waitForSelector('[data-iq-next]');
  expect((await lead()).includes('مربّع') && (await lead()).includes('كما توقّعت'), 'a square wall (36 with planks of 6) gives the plank itself');
  await page.click('[data-iq-next]');
  expect((await iq()).a === 42 && await page.locator('.iq-brick').count() === 0, 'the last bridge is NOT drawn (42 with 6 planks of 7): he answers without the wall');
  await page.click('[data-iq-say="len:6"]'); await page.click('[data-iq-say="count:7"]'); await page.click('[data-iq-turn]'); await page.waitForSelector('[data-iq-next]');
  expect((await lead()).includes('كما توقّعت') && await page.locator('[data-iq-found] li').count() === 4, 'the wall then shows it; the four equalities he found stay on screen');
  await inquiryFits('inquiry1-blind');
  await page.click('[data-iq-next]'); await page.waitForSelector('[data-rf="build"]');
  expect(await page.locator('[data-rf-row][data-rf-own="1"]').count() === 5, 'only now he WRITES his rule — the mirror will test it on the five bridges HE turned');
  // « the second bridge has as many planks as the first »: the mirror builds it from HIS bridges — it holds, with another count
  await page.click('[data-rf-tile="p:count"]'); await page.click('[data-rf-tile="n:same"]'); await shot('forge1-build');
  await forgeTools('forge 1, writing his rule (the help button is there too)');
  await page.click('[data-rf-test]'); await page.waitForSelector('[data-rf-refuted]');
  expect((await page.textContent('[data-rf-refuted]')).includes('لكن بـ'), 'a promise of the right plank with the wrong count is refuted by the bridge itself: it holds, but with another number of planks');
  await shot('forge1-refuted');
  await page.click('[data-rf-fix]'); await page.waitForSelector('[data-rf="build"]');
  await finishForge({ tiles: ['p:count', 'n:first'], last: async (u) => {
    await fillUse({ x: u.b, y: u.q });
    expect(await page.getAttribute('[data-rf-use-fb]', 'data-rf-use-fb') === 'same', 'the last step: writing the first bridge again is refused — the rule gives ANOTHER bridge');
    await shot('forge1-use');
    await fillUse({ x: u.q, y: u.b });
  } });
  await shot('tablet-1');
  expect((await page.textContent('[data-di-my-rule]')).includes('عدد ألواح الجسر الأوّل') && (await page.textContent('.di-card')).includes('جداء عاملين'), 'the tablet names the rule after HIS own');
}
await page.click('[data-di-tablet]'); await ff(0.3);

// ── 31: nothing on the pedestals fits, the workshop makes the plank of 1 ──
await take(2); await forge(3); await ff(8);
await take(3); await forge(3); await ff(8);
expect(await page.evaluate(() => Boolean(window.__world.flags.anvil)), 'two planks failed over 31: the workshop opens');
{
  const p = await page.evaluate(() => { const g = window.__world; const w = g.anvil.getWorldPosition(g.anvil.position.clone()); const isl = g.isl[3]; const d = Math.hypot(isl.x - w.x, isl.z - w.z); return [w.x + ((isl.x - w.x) / d) * 1.7, w.z + ((isl.z - w.z) / d) * 1.7]; });
  await tp(p[0], p[1]); await ff(0.3); await act();
  expect((await st()).overlay === 'workshop', 'the workshop opens at the anvil');
  await shot('workshop');
  for (let i = 0; i < 9; i += 1) await page.click('[data-di-minus]');
  await page.click('[data-di-craft]'); await ff(0.4);
  expect((await st()).held === 1, 'a plank of 1 is made');
}
await forge(3); await ff(14);
expect((await st()).stars.g31 >= 1, 'only the plank of 1 fills 31 among those he could make');
await cross(3); await page.waitForTimeout(500);

// ── forge 2 🔑: a whole number of planks — FOUND with the saw, then written ──
s = await st(); expect(s.stage === 4 && s.overlay === 'forge' && (await fg()).key === 'qasim-rappel' && (await fg()).phase === 'inquiry', 'island E opens the second forge on an INVESTIGATION: the saw');
{
  const lead = () => page.textContent('.iq-lead');
  const slideTo = async (part) => { const r = await page.locator('[data-iq-slider]').boundingBox(); await page.mouse.click(r.x + 3 + (r.width - 6) * part, r.y + r.height / 2); await page.waitForTimeout(60); return (await iq()).b; };
  expect((await iq()).kind === 'cut' && (await iq()).a === 31 && (await iq()).b === 4 && await page.locator('.iq-piece').count() === 1, 'it starts on the gap no mould filled (31): seven planks of 4, and a piece that would have to be sawn');
  await inquiryFits('inquiry2-start');
  const mid = await slideTo(0.45);
  expect(mid > 4 && mid < 31 && Number(await page.getAttribute('[data-iq-plank]', 'data-iq-plank')) === mid && (await iq()).tried.includes(mid), `his hand slides the length of the plank (${mid}): the planks are laid again at once, and the length joins his table`);
  expect(await slideTo(1) === 31 && await page.locator('.iq-piece').count() === 0 && await page.locator('.iq-plank').count() === 1, 'at the end of the slider: one plank of 31, no piece');
  expect(await slideTo(0) === 1 && await page.locator('.iq-plank').count() === 31, 'at its start: 31 planks of 1, no piece');
  for (let i = 0; i < 3; i += 1) await page.click('[data-iq-step="1"]');
  expect((await iq()).b === 4 && await page.locator('[data-iq-enough]').count() === 1, 'the two small buttons move the length one cell at a time; after six lengths he may say he has an answer');
  await inquiryFits('inquiry2-free');
  await page.click('[data-iq-enough]');
  await page.click('[data-iq-count="1"]');
  expect((await fact()).includes('1 و 31'), 'he says ONE length fills 31 without a cut: the saw answers with what HE found — 1 and 31');
  await inquiryFits('inquiry2-count');
  await page.click('[data-iq-count="2"]');
  // then he judges from the quotient alone, before the saw shows the planks
  expect((await iq()).stage === 'ask' && (await iq()).a === 36 && (await iq()).b === 8 && await page.locator('.iq-plank').count() === 0 && (await lead()).includes('36'), 'a plank of 8 over 36: only the quotient is given — the planks are not laid before he answers');
  await inquiryFits('inquiry2-ask');
  await page.click('[data-iq-say="yes"]');
  expect((await lead()).includes('قطعة') && (await lead()).includes('لم يكن هذا توقّعك') && await page.locator('.iq-piece').count() === 1, 'he said « no cut »: the saw lays four planks and the piece — his prediction is put beside the fact');
  await inquiryFits('inquiry2-shown');
  await page.click('[data-iq-next]'); await page.click('[data-iq-say="yes"]');
  expect((await lead()).includes('كما توقّعت') && await page.locator('.iq-piece').count() === 0, 'a plank of 9 over 36: four whole planks, as he said');
  await page.click('[data-iq-next]'); await page.click('[data-iq-say="no"]'); await page.click('[data-iq-next]'); await page.click('[data-iq-say="yes"]');
  expect((await iq()).a === 52 && await page.locator('.iq-plank').count() === 13, 'the last one (52 with planks of 4): thirteen whole planks');
  await page.click('[data-iq-next]'); await page.waitForSelector('[data-rf="build"]');
  expect(await page.locator('[data-rf-row][data-rf-own="1"]').count() === 8, 'only now he WRITES his rule — the mirror will test it on the lengths he tried and the four he judged');
  await page.click('[data-rf-tile="q:diff"]'); await page.click('[data-rf-tile="c:natural"]'); await page.click('[data-rf-test]'); await page.waitForSelector('[data-rf-refuted]');
  await shot('forge2-refuted');
  await page.click('[data-rf-fix]'); await page.waitForSelector('[data-rf="build"]');
  await finishForge({ tiles: ['q:exact', 'c:natural'], last: async (u) => {
    await fillUse({ x: 1, y: u.a });
    expect(await page.getAttribute('[data-rf-use-fb]', 'data-rf-use-fb') === 'trivial', 'the last step asks for a product with no factor 1');
    await shot('forge2-use');
    const d = [2, 3, 5, 7, 11, 13].find((p) => u.a % p === 0);
    await fillUse({ x: d, y: u.a / d });
  } });
  await shot('tablet-2');
}
await page.click('[data-di-tablet]'); await ff(0.3);
expect((await st()).keys.length === 2, 'two keys earned');

// ── 36 with planks of 6: the partner is the plank itself; then the dash ──
await take(6); await forge(4); await ff(8);
expect((await st()).stars.g36 >= 1, 'bridge 36 holds with planks of 6');
await cross(4); await page.waitForTimeout(500);
s = await st(); expect(s.stage === 5, 'island F: the board of light');
{
  const p = await page.evaluate(() => { const g = window.__world; return [g.boardHome.x, g.boardHome.z]; });
  await tp(p[0], p[1] + 0.2); await ff(0.3); await act(); await ff(0.6);
  expect(Boolean((await page.evaluate(() => window.__world.getState().dash))), 'the board moves at once: this island has no guardians');
  await shot('dash');
  // always the right lane
  for (let k = 0; k < 400 && (await page.evaluate(() => Boolean(window.__world.getState().dash))); k += 1) {
    await page.evaluate(() => { const g = window.__world; const d = g.dash; if (!d) return; const w = d.waves[d.wave]; if (w) d.lane = w.good; });
    await ff(0.25);
  }
}
await ff(6); await page.waitForTimeout(500);

// ── forge 3 🔍: where the search stops — FOUND on the strip, then written ──
s = await st(); expect(s.stage === 6 && s.overlay === 'forge' && (await fg()).key === 'tariqa-qawasim' && (await fg()).phase === 'inquiry', 'island G opens the third forge on an INVESTIGATION');
{
  expect(await page.locator('[data-rf-tile]').count() === 0 && await page.locator('[data-rf-guess]').count() === 0 && (await iq()).a === 36, 'no tile, no prediction: he acts first — on the gap he has just crossed (36)');
  await inquiryFits('inquiry3-start');
  for (let d = 1; d <= 6; d += 1) await page.click(`[data-iq-try="${d}"]`);
  expect((await fact()).includes('شريك نفسه') && await page.locator('.iq-try.is-new').count() === 5, 'planks 1 to 6 tried in order: five bridges hold, each gives its partner — and 6 is its own partner');
  await inquiryFits('inquiry3-meet');
  await page.click('[data-iq-try="7"]');
  expect(await page.getAttribute('[data-iq-crossed]', 'data-iq-crossed') === '1' && (await fact()).includes('خلفه'), 'plank 7: the strip shows its partner BEHIND it, among the planks already tried');
  await page.click('[data-iq-try="8"]');
  expect((await iq()).stage === 'ask', 'two planks past the crossing, the question is HIS: can a new plank still appear?');
  await inquiryFits('inquiry3-ask');
  await page.click('[data-iq-ask="yes"]'); await page.waitForSelector('[data-iq-swept]');
  expect((await fact()).includes('ولا لوح جديد'), '« maybe »: the world tries every plank up to 36 in front of him — not one new plank');
  await page.click('[data-iq-swept]');
  await page.click('[data-iq-pick="9"]');
  expect((await fact()).includes('شريكه 4'), 'he says 9 was needed: the strip answers with a fact — its partner 4 was tried before it');
  await page.click('[data-iq-pick="5"]');
  expect((await fact()).includes('لضاع'), 'he says 5: stopping there would have lost a plank — said with the count, never « wrong »');
  await inquiryFits('inquiry3-pick');
  await page.click('[data-iq-pick="6"]'); await page.click('[data-iq-next]');
  // the second gap: he says the last plank BEFORE trying
  expect((await iq()).stage === 'guess' && (await iq()).a === 30, 'a second gap (30): he says where he will stop BEFORE trying');
  await inquiryFits('inquiry3-guess');
  await page.click('[data-iq-pick="8"]');
  for (let d = 1; d <= 7; d += 1) await page.click(`[data-iq-try="${d}"]`);
  expect((await page.textContent('[data-iq-table]')).includes('مربّعه') && (await page.textContent('[data-iq-tried="6"]')).includes('36'), 'from the second gap the table also shows the square of each plank: something to measure the crossing with');
  await inquiryFits('inquiry3-squares');
  await page.click('[data-iq-pick="5"]');
  expect((await page.textContent('.iq-lead')).includes('كنتَ توقّعتَ 8'), 'the last needed plank of 30 is 5; his guess (8) is put beside it');
  await page.click('[data-iq-next]');
  // the third gap: only the table, before any trial
  expect((await iq()).a === 60 && await page.locator('[data-iq-tried]').count() === 9 && (await page.textContent('[data-iq-tried="7"]')).includes('49') && (await page.textContent('[data-iq-tried="7"]')).includes('؟'), 'the third gap (60): the planks and their squares are on the table before any trial; the partners are still « ؟ »');
  await inquiryFits('inquiry3-ahead');
  await page.click('[data-iq-pick="7"]');
  for (let d = 1; d <= 9; d += 1) await page.click(`[data-iq-try="${d}"]`);
  await page.click('[data-iq-pick="7"]');
  expect((await page.textContent('.iq-lead')).includes('توقّعك كان صحيحًا') && await page.locator('[data-iq-found] li').count() === 3, 'he had said 7 — and the trials agree; his three gaps and their last planks stay on screen');
  await inquiryFits('inquiry3-found');
  await page.click('[data-iq-next]'); await page.waitForSelector('[data-rf="build"]');
  expect(await page.locator('[data-rf-row]').count() === 8 && await page.locator('[data-rf-row][data-rf-own="1"]').count() === 8, 'only now he WRITES his rule — and the mirror will test it on eight planks HE tried');
  // « try a plank as long as it does not pass half the gap »: one of the planks he tried gave nothing new
  await page.click('[data-rf-tile="q:len"]'); await page.click('[data-rf-tile="c:leHalf"]'); await shot('forge3-build');
  await page.click('[data-rf-test]'); await page.waitForSelector('[data-rf-refuted]');
  expect((await page.textContent('[data-rf-refuted]')).includes('لم يعطِ شيئًا جديدًا'), 'the « up to half » rule is refuted by a plank of his own investigation that gave nothing new');
  await shot('forge3-refuted');
  await page.click('[data-rf-fix]'); await page.waitForSelector('[data-rf="build"]');
  await finishForge({ tiles: ['q:sq', 'c:leA'], last: async (u) => {
    const d = Math.floor(Math.sqrt(u.a));
    await fillUse({ d: Math.floor(u.a / 2) });
    expect(await page.getAttribute('[data-rf-use-fb]', 'data-rf-use-fb') === 'far', 'the last step: half the gap is refused — its square passes the gap');
    await shot('forge3-use');
    await fillUse({ d });
  } });
  await shot('tablet-3');
}
await page.click('[data-di-tablet]'); await ff(0.3);

// ── 60 with planks of 10, then the stone of the last harbour ──
await take(10); await forge(6); await ff(8);
expect((await st()).stars.g60 >= 1, 'bridge 60 holds with planks of 10');
await cross(6); await ff(2.5); await page.waitForTimeout(400);
s = await st(); expect(s.stage === 7 && s.overlay === 'forge' && (await fg()).key === 'qawaid-qisma' && (await fg()).phase === 'inquiry', 'island H: the stone asks about a gap nobody can build — its question OPENS an investigation, it is not asked before he can answer');

// ── forge 4 ⚡: what to read instead of dividing — FOUND on the chart, plank by plank ──
{
  expect(await page.locator('[data-rf-tile]').count() === 0 && (await iq()).b === 5, 'no tile: he starts with ONE plank (5), on the gaps 5, 6, 7…');
  await forgeTools('forge 4, the chart');
  await page.click('.rf-root [data-di-sound]');
  expect(await page.getAttribute('.rf-root [data-di-sound]', 'data-di-sound') === 'off' && await page.evaluate(() => window.__world.getState().sound === false && window.__world.audio.enabled === false), 'the sound is turned OFF from inside the forge');
  await page.click('.rf-root [data-di-sound]');
  expect(await page.evaluate(() => window.__world.getState().sound === true && window.__world.audio.enabled === true), '…and on again');
  /** One plank whose reading is a lens: tested by hand, the chart filled, a lens that fails, the lens that separates, the next hundred. */
  const lensPlank = async (b, wrong, lens, values) => {
    let taps = 0;
    const goal = await page.textContent('[data-iq-goal]');
    expect((await page.textContent('.iq-lead')).includes(`لوح طوله ${b}`) && goal.includes('الهدف') && goal.includes('دون تقسيم') && goal.includes(`العدد ${b}`) && (await page.textContent('[data-iq-how]')).includes('الباقي 0') && await page.locator('[data-iq-div]').count() === 0, `plank ${b}: the chart opens on its QUESTION (which gaps take a bridge of planks of ${b}?) and its GOAL (to know them without dividing each time)`);
    const wrongGaps = []; // every gap tested by hand, measured on the screen: its division, its rest, the colour of its cell
    while (await page.locator('[data-iq-fill]').count() === 0 && taps < 60) {
      const n = Number(await page.getAttribute('[data-iq-test]', 'data-iq-test'));
      await page.click('[data-iq-test]'); taps += 1;
      const d = await page.evaluate((k) => { const li = document.querySelector('[data-iq-div]'); const cell = document.querySelector(`[data-iq-cell="${k}"]`); return { n: Number(li.dataset.iqDiv), rest: Number(li.dataset.iqRest), tex: li.querySelector('annotation')?.textContent ?? '', green: getComputedStyle(cell).backgroundColor === 'rgb(22, 163, 74)' }; }, n);
      if (!(d.n === n && d.rest === n % b && d.tex.includes(` ${n} = ${Math.floor(n / b)} \\times ${b} + `) && d.green === (n % b === 0)))
        wrongGaps.push(`gap ${n}: division « ${d.tex} » (shown for ${d.n}), rest ${d.rest}, cell green: ${d.green}`);
    }
    expect(taps >= 1 && wrongGaps.length === 0, `plank ${b}: every gap he tries (${taps}) shows ITS division « n = q × ${b} + r », and its cell turns green exactly when the rest is 0${wrongGaps.length ? ' — ' + wrongGaps.join(' | ') : ''}`);
    const litByHand = await page.locator('.iq-cell.is-lit').count();
    expect((await iq()).b === b && taps >= 6 && litByHand >= 2, `plank ${b}: ${taps} gaps tested by hand, one after the other (${litByHand} lit) before the world may finish the chart`);
    if (b === 5) await inquiryFits('inquiry4-test');
    // the fullest test screen of the chart: four readings found, the question, the goal, a division, two buttons
    if (b === 4) await inquiryFits('inquiry4-four-test');
    // the chart is heard while the world fills it: what the game's sound is asked for, recorded here (a walk has no ear)
    await page.evaluate(() => { const a = window.__world.audio; window.__heard = []; if (!a.__spied) { const real = a.play.bind(a); a.play = (name, p) => { window.__heard.push(name); real(name, p); }; a.__spied = true; } });
    await page.click('[data-iq-fill]'); await page.waitForSelector('[data-iq-look]');
    let heard = await page.evaluate(() => window.__heard);
    expect(heard.includes('sweep') && heard.includes('spark') && heard.at(-1) === 'gate', `plank ${b}: the chart that fills is heard — a count, the cells that light, and a chime when it is full (${[...new Set(heard)].join(', ')})`);
    await page.click('[data-iq-look]');
    await page.click(`[data-iq-lens="${wrong[0]}"]`); await page.click(`[data-iq-value="${wrong[1]}"]`);
    expect(await page.getAttribute('[data-iq-fact]', 'data-iq-ok') === '0' && await page.locator('.iq-cell.is-intruder').count() > 0, `plank ${b}: a lens that does not separate takes dark cells in — the chart shows them, nobody says « wrong »`);
    if (b === 5) await inquiryFits('inquiry4-wrong-lens');
    await page.click(`[data-iq-lens="${lens}"]`);
    for (const v of values) await page.click(`[data-iq-value="${v}"]`);
    expect(await page.getAttribute('[data-iq-fact]', 'data-iq-ok') === '1' && await page.locator('.iq-cell.is-intruder').count() === 0 && await page.locator('.iq-cell.is-lit:not(.is-claimed)').count() === 0, `plank ${b}: HIS claim holds every lit cell and no dark one`);
    if (b === 5 || b === 9 || b === 4) {
      const lay = await page.evaluate(() => {
        const r = (s) => document.querySelector(s).getBoundingClientRect();
        const L = [...document.querySelectorAll('[data-iq-lens]')].map((e) => e.getBoundingClientRect()); const V = [...document.querySelectorAll('[data-iq-value]')].map((e) => e.getBoundingClientRect());
        return { stacked: L.every((x, i) => i === 0 || (x.top >= L[i - 1].bottom - 1 && Math.abs(x.left - L[0].left) < 2)), order: r('[data-iq-values]').right <= r('[data-iq-equals]').left + 1 && r('[data-iq-equals]').right <= r('[data-iq-lenses]').left + 1, down: V[1].top >= V[0].bottom - 1 && Math.abs(V[1].left - V[0].left) < 2, word: document.querySelector('[data-iq-equals]').textContent.trim() };
      });
      expect(lay.stacked && lay.order && lay.down && lay.word === (b === 5 ? 'يساوي' : 'يقبل القسمة على'), `plank ${b}: his claim is laid as asked — right to left: the three lenses in a column on the RIGHT, « ${b === 5 ? 'يساوي' : 'يقبل القسمة على'} », then the ${b === 5 ? 'values' : 'numbers'} on the LEFT, read downwards (${JSON.stringify(lay)})`);
      await inquiryFits(`inquiry4-claim-${b}`);
    }
    await page.evaluate(() => { window.__heard = []; });
    await page.click('[data-iq-seal]');
    // the next hundred: he tests its first gaps HIMSELF (Inquiry.jsx › Chart, `spec.nextManual`, 3 by default), each one
    // writing its division; only then the world finishes the hundred and « next » appears
    await page.waitForSelector('[data-iq-test]');
    expect((await iq()).from === 100 && (await iq()).stage === 'confirm' && await page.locator('[data-iq-next]').count() === 0, `plank ${b}: his reading is carried to the next hundred (100–199), and he tests it himself first`);
    const nextGaps = [];
    for (let k = 0; k < 3; k += 1) {
      expect(await page.locator('[data-iq-next]').count() === 0, `plank ${b}: before his test ${k + 1} of the next hundred, the world does not finish it for him`);
      const n = Number(await page.getAttribute('[data-iq-test]', 'data-iq-test'));
      await page.click('[data-iq-test]');
      const d = await page.evaluate(() => { const li = document.querySelector('[data-iq-div]'); return li ? { n: Number(li.dataset.iqDiv), rest: Number(li.dataset.iqRest), tex: li.querySelector('annotation')?.textContent ?? '' } : null; }, n);
      if (!(n === 100 + k && d && d.n === n && d.rest === n % b && d.tex.includes(` ${n} = ${Math.floor(n / b)} \\times ${b} + `))) nextGaps.push(`gap ${n}: ${JSON.stringify(d)}`);
      if (b === 5 && k === 0) await inquiryFits('inquiry4-next-test');
    }
    expect(nextGaps.length === 0, `plank ${b}: his three tests of the next hundred (100, 101, 102) each write ITS division « n = q × ${b} + r »${nextGaps.length ? ' — ' + nextGaps.join(' | ') : ''}`);
    await page.waitForSelector('[data-iq-next]');
    heard = await page.evaluate(() => window.__heard);
    expect(heard.includes('sweep') && heard.at(-1) === 'gate', `plank ${b}: the rest of the next hundred, finished by the world, is heard too`);
    expect((await iq()).from === 100 && (await page.textContent('.iq-lead')).includes('صمدت') && await page.locator('.iq-cell.is-lit:not(.is-claimed)').count() === 0 && await page.locator('.iq-cell.is-claimed.is-dark').count() === 0, `plank ${b}: his reading is tried on the next hundred (100–199) and holds`);
    if (b === 3) await inquiryFits('inquiry4-confirm-3');
    await page.click('[data-iq-next]');
  };
  await lensPlank(5, ['tens', 1], 'units', [0, 5]);
  expect((await page.textContent('[data-iq-found]')).includes('0 أو 5'), 'what he found for plank 5 is written in HIS words of the chart, and stays on screen');
  await lensPlank(2, ['sum', 4], 'units', [0, 2, 4, 6, 8]);
  // 9 and 3 are said « lens · يقبل القسمة على · a number »: ONE number is pressed, not a list of values
  await lensPlank(9, ['units', 9], 'sum', [9]);
  expect((await page.textContent('[data-iq-found]')).includes('مجموع الأرقام يقبل القسمة على 9'), 'what he found for plank 9 is kept as he said it: the sum of the digits is divisible by 9');
  await lensPlank(3, ['units', 3], 'sum', [3]);
  // plank 4: no single digit and no sum separates its chart — its lens is the number the tens and the units write
  await lensPlank(4, ['sum', 4], 'last2', [4]);
  expect((await page.textContent('[data-iq-found]')).includes('العدد المكوّن من الآحاد والعشرات يقبل القسمة على 4') && await page.locator('[data-iq-nolens]').count() === 0, 'plank 4 is read on the number its tens and units write, divisible by 4 — the old side road is gone');
  expect((await iq()).stage === 'sealed' && await page.locator('[data-iq-found] li').count() === 5, 'five planks, five readings — all found by him, all on screen');
  await inquiryFits('inquiry4-sealed');
  await page.click('[data-iq-done]'); await page.waitForSelector('[data-rf="attack"]');
  expect(await page.locator('[data-rf-tile]').count() === 0 && (await fg()).atk.list.every((c) => c.a >= 100), 'what he claimed IS his rule: no tile is offered, the mirror attacks it at once on gaps of three digits');
  await shot('forge4-attack');
  await attackToTablet(async (u) => {
    expect(u.a === 252 && (await page.textContent('.rf-root')).includes('الحجر'), 'the last step is the stone’s own question: 252, read with his key');
    const sum = String(u.a).split('').reduce((t, x) => t + Number(x), 0);
    const count = [2, 3, 4, 5, 9].filter((b) => u.a % b === 0).length;
    await fillUse({ s: sum, l: u.a % 100, n: count + 1 });
    expect(await page.getAttribute('[data-rf-use-fb]', 'data-rf-use-fb') === 'count', 'the last step: the readings are right, the count of planks is not — said without the answer');
    await shot('forge4-use');
    await fillUse({ s: sum, l: u.a % 100, n: count });
  });
  await shot('tablet-4');
}
await page.click('[data-di-tablet]'); await ff(0.5);
expect((await st()).keys.length === 4, 'four keys earned, all forged');

// ── the last bridge: 96 books, shelves of 20 or of 12 ──
await toAltar(7); await page.waitForTimeout(600); await act(); await page.waitForTimeout(400);
s = await st(); expect(s.overlay === 'boss' && (await page.textContent('[data-di-boss-mission]')).includes('96'), 'the store opens on the lesson’s problem: 96 books');
await shot('boss');
// THE STORE IS PLAYED THROUGH ITS SCREEN (owner, 2026-11-17: it showed the pilot's 756, 32 / 36 and 1850 in this lesson, and
// its payment step had no way out). Every number on screen is read and compared with the lesson's own.
expect((await page.locator('[data-di-mould]').evaluateAll((els) => els.map((e) => e.dataset.diMould))).join() === '20,12', 'the store offers the lesson’s two shelves — 20 and 12 — and no other');
expect(await page.locator('.di-veil [data-di-exit]').count() === 1 && await page.locator('.di-veil [data-di-exit]').isVisible(), 'the ✕ that leaves the game is drawn OVER the dialog: the student can always quit');
{ const hit = await page.evaluate(() => { const r = document.querySelector('.di-veil [data-di-exit]').getBoundingClientRect(); const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return Boolean(el?.closest('[data-di-exit]')); }); expect(hit, 'and nothing covers it: a click reaches it'); }
await page.click('[data-di-mould="20"]'); await page.waitForTimeout(300); await page.click('[data-di-pgate-go]');
expect((await page.textContent('[data-di-boss-a]')).trim() === '96', 'the division to write starts with the gap of THIS lesson: 96 = 20 × ▢ + ▢');
await page.click('[data-di-check]'); await page.waitForTimeout(200);
expect((await page.textContent('[data-di-boss-error]')).includes('عدد الرفوف'), 'an empty division is refused, in the words of this lesson (shelves)');
await page.fill('[data-di-q]', '5'); await page.fill('[data-di-r]', '0'); await page.click('[data-di-check]'); await page.waitForTimeout(300);
expect((await page.textContent('[data-di-boss-error]')).includes('100') && (await page.textContent('[data-di-boss-error]')).includes('(96)'), '5 shelves of 20: « 100 cells, longer than the gap (96) »');
await page.fill('[data-di-q]', '3'); await page.fill('[data-di-r]', '36'); await page.click('[data-di-check]'); await page.waitForTimeout(300);
expect((await page.textContent('[data-di-boss-error]')).includes('أصغر من 20'), 'remainder 36: « room for another shelf »');
await shot('boss-divide');
await page.fill('[data-di-q]', '4'); await page.fill('[data-di-r]', '16'); await page.click('[data-di-check]');
await ff(15); await page.waitForTimeout(400);
s = await page.evaluate(() => window.__world.getState().overlay);
expect(s?.type === 'boss' && s.view === 'choose' && s.tried[20] === 16, 'shelf 20 leaves 16 cells: the store shows it tried and lets him choose again');
await shot('boss-tried');
await page.click('[data-di-mould="12"]'); await page.waitForTimeout(300); await page.click('[data-di-pgate-go]');
await page.fill('[data-di-q]', '8'); await page.fill('[data-di-r]', '0'); await page.click('[data-di-check]');
await ff(12); await page.waitForTimeout(300);
s = await page.evaluate(() => window.__world.getState().overlay);
expect(s?.type === 'boss' && s.view === 'cost' && s.q === 8, 'the bridge of 96 holds with 8 shelves of 12: the store asks their price');
await page.click('[data-di-pgate-go]');
{ const asked = await page.textContent('.di-card h2'); const price = (await page.textContent('[data-di-boss-price]')).trim();
  expect(price === '1400' && asked.includes('1400') && asked.includes('8 رفوف'), `the price in the sentence and the price in the equation are the SAME number (1400; equation shows ${price})`); }
expect((await page.textContent('.di-template')).includes('دج'), 'the amount is typed in its own shape: its unit « دج » is printed');
await shot('boss-cost');
await page.fill('[data-di-cost]', '4200'); await page.click('[data-di-check]'); await page.waitForTimeout(300);
expect((await page.textContent('[data-di-boss-error]')).includes('4200') && (await page.textContent('[data-di-boss-error]')).includes('الرفّ'), 'a wrong price is refused with a sentence, in the words of this lesson');
// the way out of the payment step: « إغلاق » returns to the world, the store opens again where it was
await page.click('[data-di-boss-close]'); await ff(0.3);
expect((await st()).overlay == null && await page.evaluate(() => window.__world.getState().phase) === 'play', 'the payment step can be CLOSED: back in the world, nothing lost');
await act(); await page.waitForTimeout(400);
s = await page.evaluate(() => window.__world.getState().overlay);
expect(s?.type === 'boss' && s.view === 'cost' && s.q === 8, 'the store opens again on the price of the 8 shelves');
// the store's card is keyed by its view (DivisorIsles.jsx › <Boss key=…>): reopened, it is mounted afresh, so its paper gate
// « كتبتُ على ورقتي » (kit/Paper.jsx › PaperGate, always around the price) is closed again and must be passed again
expect(await page.locator('[data-di-pgate-go]').count() === 1 && await page.locator('[data-di-cost]').count() === 0, 'the store reopened on the price: its paper gate is closed again, the amount box behind it');
await page.click('[data-di-pgate-go]');
await page.fill('[data-di-cost]', '11200'); await page.click('[data-di-check]'); await ff(0.5);
expect((await st()).overlay == null && (await page.evaluate(() => window.__world.getState().objective)).includes('اعبر إلى المنارة'), 'paid 11200 دج (8 × 1400): the objective says to cross to the lighthouse');
await cross(7); await ff(3); await page.waitForTimeout(500); await shot('finale');
await ff(6); await page.waitForTimeout(600); await shot('end');
s = await st(); expect(s.overlay === 'end', 'the lighthouse is lit and the end screen shows: the story is played to its end');
expect(errors.length === 0, 'no page error');
console.log('ok   nothing scrolls at any screenshot of the walk');
// (no prediction is asked in this lesson any more: every forge opens on an investigation; a raw formula on ANY screenshot fails noScroll)
await browser.close();
