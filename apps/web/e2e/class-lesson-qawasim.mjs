// « حصّة القسم » of lesson 2 `qawasim-adad-tabii` — walk of the LESSON ON THE BOARD (the lesson's own script, memo and tablets)
// [walk of the HOUR for the pilot: class-lesson.mjs]. The lesson is opened directly; every step is played through its UI.
// Original header of the pilot's walk: (simulated teacher; the API is an in-memory double): the start test, then
// the rules revised one per screen (the teacher picks the reader, or reads himself), then the lesson on the board — the
// class experiments with bridges, writes its rule, the board breaks a wrong rule and fails to break the right one, the rule
// gets its name, the other keys, the copybook — and the end test. On every screen: nothing scrolls, nothing leaves its card.
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/class-lesson-qawasim.mjs [outDir]
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

const BASE = process.env.E2E_BASE || 'http://localhost:5173';
const URL_ = `${BASE}/enseignant/hissa/qawasim-adad-tabii?classe=7`;
const OUT = process.argv[2] || `${tmpdir()}/class-lesson-qawasim`;
const SIZE = (process.env.E2E_SIZE || '1366x768').split('x').map(Number);
mkdirSync(OUT, { recursive: true });
const expect = (cond, msg) => { if (!cond) { console.log('FAIL', msg); process.exitCode = 1; throw new Error(msg); } console.log('ok  ', msg); };
const DEFAULT = JSON.parse(readFileSync(new URL('../../../content/class-tests/4am/qawasim-adad-tabii.json', import.meta.url), 'utf8'));
const NAMES = [['عمر', 'بن علي'], ['مريم', 'حدّاد'], ['ياسين', 'منصوري'], ['سلمى', 'بوزيد'], ['أنس', 'قاسمي'], ['هاجر', 'سعدي'], ['إلياس', 'عمراني'], ['نور', 'شريف'], ['آدم', 'بلقاسم'], ['رحمة', 'زروقي'], ['يوسف', 'دحماني'], ['خديجة', 'مرابط']];
const STUDENTS = Array.from({ length: 35 }, (_, i) => ({ id: 500 + i, firstName: NAMES[i % 12][0] + (i >= 12 ? ` ${i}` : ''), lastName: NAMES[(i * 5) % 12][1], grade: '4am' }));

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: SIZE[0], height: SIZE[1] } });
await ctx.addInitScript(([students, def]) => {
  localStorage.setItem('token', 'qa-fake-token'); window.__classFast = true;
  const db = (window.__api = { seating: null, sessions: [], posts: [], evidence: 0 });
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  const real = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url; const method = (init.method ?? 'GET').toUpperCase(); const body = init.body ? JSON.parse(init.body) : null;
    if (!url.includes('/api/')) return real(input, init);
    if (url.includes('/auth/me')) return json({ success: true, user: { id: 77, name: 'الأستاذ', firstName: 'كريم', lastName: 'أستاذ', role: 'teacher', roles: ['teacher'], email_verified_at: '2026-09-01T00:00:00Z', emailVerified: true, nameComplete: true } });
    if (/learning-evidence|game-evidence|\/answers/.test(url)) { db.evidence += 1; return json({ success: true }); }
    if (/\/teacher\/classrooms(\?|$)/.test(url)) return json({ success: true, classrooms: [{ id: 7, name: '4 م 1', grade: '4am', status: 'active' }] });
    if (url.includes('/teacher/classrooms/7/students')) return json({ success: true, students });
    if (url.includes('/teacher/classrooms/7/seating')) { if (method === 'PUT') db.seating = body; return json({ success: true, seating: db.seating }); }
    if (url.includes('/teacher/classrooms/7/class-sessions')) {
      if (method === 'POST') { db.posts.push(body); const items = {}; for (const a of body.answers) { if (!a.item) continue; items[a.item] ??= { item: a.item, right: 0, total: 0 }; items[a.item].total += 1; items[a.item].right += a.correct ? 1 : 0; } const right = body.answers.filter((a) => a.correct).length; const s = { uuid: body.uuid, lessonCode: body.lessonCode, moment: body.moment, finishedAt: '2026-11-18T09:00:00Z', summary: { ...body.summary, right, total: body.answers.length, items: Object.values(items) } }; db.sessions.unshift(s); return json({ success: true, session: s }, 201); }
      return json({ success: true, sessions: db.sessions, turns: {} });
    }
    if (url.includes('/teacher/class-tests/')) return json({ success: true, lessonCode: 'qawasim-adad-tabii', default: { version: def.version, start: def.start, end: def.end, pool: def.pool }, mine: null });
    return json({ success: true, data: [] });
  };
}, [STUDENTS, DEFAULT]);
const page = await ctx.newPage(); const errors = [];
page.on('pageerror', (e) => { errors.push(e.message); console.log('pageerror', e.message); });
let n = 0;
/** On the board nothing scrolls, nothing leaves the screen, nothing leaves its card, and the oral question is never cut. */
const shot = async (name, wait = 450) => {
  await page.waitForTimeout(wait);
  const bad = await page.evaluate(() => {
    const out = []; const root = document.querySelector('.cs-root'); const name = (el) => `${el.tagName.toLowerCase()}.${el.className?.baseVal ?? el.className}`;
    for (const el of root.querySelectorAll('*')) { if (el.closest('svg, .katex')) continue; /* KaTeX keeps a hidden copy for screen readers */ const cs = getComputedStyle(el); if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 2) out.push(`scrolls: ${name(el)}`); if (cs.overflow === 'hidden' && el.closest('.cs-lesson') && !el.matches('.cs-cue span, .cs-bridgebox, .cs-mini button, .cs-bigstep > span') && (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2)) out.push(`clips its content: ${name(el)}`); }
    for (const el of root.querySelectorAll('.cs-lesson__top, .cs-lesson__top > *, .cs-turn, .cs-scene, .cs-rule, .cs-lesson__foot, .cs-lesson__foot > *, .cs-classwin, .cs-play__top, .cs-question, .cs-result__foot')) { const r = el.getBoundingClientRect(); if (r.height > 0 && (r.top < -1 || r.bottom > innerHeight + 1 || r.left < -1 || r.right > innerWidth + 1)) out.push(`leaves the screen: ${name(el)}`); }
    for (const card of root.querySelectorAll('.cs-scene, .cs-rule, .cs-lesson__top, .cs-forge__right, .cs-log, .cs-name__card, .cs-plankcard, .cs-copy article, .cs-stmts li')) { const b = card.getBoundingClientRect(); for (const el of card.querySelectorAll('*')) { if (el.closest('svg') && el.tagName !== 'svg') continue; const r = el.getBoundingClientRect(); if (r.width > 0 && r.height > 0 && (r.bottom > b.bottom + 2 || r.top < b.top - 2 || r.left < b.left - 2 || r.right > b.right + 2)) out.push(`out of ${name(card)}: ${name(el)}`); } }
    const cue = root.querySelector('.cs-cue span'); if (cue && cue.scrollWidth > cue.clientWidth + 1) out.push('the oral question is cut');
    for (const k of root.querySelectorAll('.cs-scene .katex, .cs-rule .katex')) if (k.getClientRects().length > 1) out.push('a formula breaks across two lines');
    return [...new Set(out)];
  });
  if (bad.length) { n += 1; await page.screenshot({ path: `${OUT}/${String(n).padStart(2, '0')}-FAIL-${name}.png` }); console.log('FAIL at «', name, '»:', bad.join(' | ')); process.exitCode = 1; throw new Error(`layout at ${name}`); }
  n += 1; await page.screenshot({ path: `${OUT}/${String(n).padStart(2, '0')}-${name}.png` });
};
const _api = () => page.evaluate(() => window.__api);
const _hour = () => page.evaluate(() => window.__classHour);
const _board = () => page.evaluate(() => ({ step: window.__classLesson.step.id, memo: window.__classLesson.memo, speaker: window.__classLesson.speaker }));
const attr = (sel, a) => page.getAttribute(sel, a);
const text = async (sel) => ((await page.textContent(sel)) ?? '').trim();
const _px = (sel) => page.evaluate((s) => { const el = document.querySelector(s); const z = Number(document.querySelector('.cs-fit').style.zoom || 1); return el ? Math.round(parseFloat(getComputedStyle(el).fontSize) * z) : 0; }, sel);
const next = () => page.click('[data-cs-lesson-next]');
const stepIs = async (id) => { await page.waitForSelector(`[data-cs-lesson-step="${id}"]`); };

// the tablets of the STUDENT's world (`world/story.js › TABLETS`): the board must read the same wording
const TITLES = { 'jidaa-aamilayn': 'جداء عاملين: قاسمان معًا', 'qasim-rappel': 'القاسم: جداء بعدد طبيعي', 'tariqa-qawasim': 'أين نتوقّف', 'qawaid-qisma': 'قواعد قابلية القسمة' };
const divisors = (a) => Array.from({ length: a }, (_, i) => i + 1).filter((d) => a % d === 0);
/** Nothing of another lesson, no raw formula, on the board's screen. */
const clean = async (name) => {
  const t = await page.evaluate(() => document.querySelector('.cs-root').innerText);
  expect(!t.includes('جسر بين جزيرتين') && !t.includes('التعرّف على قاسم'), `${name}: nothing of the pilot lesson on screen`);
  expect(!/\$|\\times|\\leq|\\frac/.test(t), `${name}: no raw formula on screen`);
  // a formula reads left to right: the atoms KaTeX writes in order stand left to right on screen (the same check as lib/walk.mjs)
  const mirrored = await page.evaluate(() => {
    const out = [];
    for (const k of document.querySelectorAll('.cs-root .katex-html')) {
      const atoms = [...k.querySelectorAll('.mord, .mrel, .mbin, .mpunct')].filter((a) => !a.querySelector('.mord, .mrel, .mbin, .mpunct')).map((a) => a.getBoundingClientRect()).filter((r) => r.width > 0);
      if (atoms.length < 3) continue;
      const line = atoms.filter((r) => Math.abs(r.top - atoms[0].top) < r.height);
      let back = 0;
      for (let i = 1; i < line.length; i += 1) if (line[i].left < line[i - 1].left - 1) back += 1;
      if (back > line.length / 2) out.push((k.parentElement.querySelector('annotation')?.textContent ?? k.textContent).slice(0, 40));
    }
    return out;
  });
  expect(mirrored.length === 0, `${name}: every formula reads left to right${mirrored.length ? ' — ' + mirrored.map((x) => `« ${x} »`).join(' | ') : ''}`);
};
/** An « ask » step: a wrong pick is met by the bridges, the right picks by « right ». */
const askStep = async (id, a, options, wrongPick) => {
  await stepIs(id);
  const right = options.filter((o) => a % o === 0);
  await page.click(`[data-cs-ask-option="${wrongPick}"]`); await page.click('[data-cs-ask-check]');
  expect((await attr('[data-cs-ask-result]', 'data-cs-ask-result')) === 'look' && (await page.$$('.cs-plankcard .bbar')).length === options.length, `${id}: a wrong pick (${wrongPick}) shows the ${options.length} planks built, never « wrong »`);
  await page.click('[data-cs-ask-again]');
  for (const o of right) await page.click(`[data-cs-ask-option="${o}"]`);
  await page.click('[data-cs-ask-check]');
  expect((await attr('[data-cs-ask-result]', 'data-cs-ask-result')) === 'right' && (await page.$$('.cs-plankcard.is-held')).length === right.length, `${id}: exactly the planks that fill ${a} (${right.join(', ')}) are the right answer`);
  await clean(id); await shot(`ask-${id}`);
};
const nameStep = async (id, key) => {
  await stepIs(id);
  expect((await attr('[data-cs-name]', 'data-cs-name')) === key && (await text('.cs-scene__head h2')).includes(TITLES[key]), `${id}: the rule is named with the student's tablet « ${TITLES[key]} »`);
  await page.click('[data-cs-pick-reader]'); await page.click('[data-cs-seat="512"]');
  await page.click('[data-cs-recall]');
  const hidden = await page.$$('[data-cs-blank="hidden"]'); expect(hidden.length >= 1, `${id}: « من يتذكّر؟ » hides key words (${hidden.length})`);
  await hidden[0].click(); expect((await page.$$('[data-cs-blank="open"]')).length >= 1, `${id}: a tap shows a hidden word`);
  await clean(id); await shot(`name-${key}`);
};

// ══ 1. the lesson is opened alone, from the set-up ══
await page.goto(URL_, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-cs-hour]');
expect((await text('[data-cs-open="lesson"] small')).includes('11 محطّة'), 'the set-up counts the 11 stations of THIS lesson');
await page.click('[data-cs-open="lesson"]');

// ══ 2. the situation: a gap of 60 and a plank of 8 ══
await stepIs('situation');
expect((await attr('.bb', 'data-bb')) === '60:8' && (await text('[data-cs-cue] span')).length > 10, 'it opens on a gap of 60, a plank of 8 and one oral question');
await clean('situation'); await shot('situation');
await page.click('[data-cs-sit-try]'); await page.waitForSelector('.cs-sit [data-cs-verdict]');
expect((await attr('.bb', 'data-bb-planks')) === '7' && (await attr('.bb', 'data-bb-left')) === '4' && (await attr('.cs-sit [data-cs-verdict]', 'data-cs-verdict')) === 'fell', 'the board builds 7 planks and leaves 4 cells: it falls');
await shot('situation-fell', 1300);

// ══ 3. the four rules: a question made for each, proved by bridges, then its name ══
await next(); await askStep('partner', 56, [6, 8, 9, 12], 6);
await next(); await nameStep('name-1', 'jidaa-aamilayn');
await next(); await askStep('part', 31, [1, 2, 5, 31], 2);
await next(); await nameStep('name-2', 'qasim-rappel');
await next(); await askStep('search', 60, [4, 5, 7, 8, 12, 15], 7);
await next(); await nameStep('name-3', 'tariqa-qawasim');
await next(); await askStep('glance', 252, [2, 3, 4, 5, 9], 5);
await next(); await nameStep('name-4', 'qawaid-qisma');

// ══ 4. the copybook: two pages of two keys, then the adult's board ══
const KEYS = Object.keys(TITLES);
for (const [pageNo, id] of [[0, 'trace-1'], [1, 'trace-2']]) {
  await next(); await stepIs(id);
  expect((await attr('[data-cs-trace]', 'data-cs-trace')) === '2' && (await page.$$('.cs-copy article')).length === 2, `${id}: two keys of the lesson on this page of the copybook`);
  const heads = await page.$$eval('.cs-copy article h3', (els) => els.map((e) => e.textContent));
  expect(heads.every((h, k) => h.includes(TITLES[KEYS[pageNo * 2 + k]])), `${id}: with the same titles as the student’s tablets`);
  await clean(id); await shot(id);
}
expect((await text('[data-cs-lesson-next]')).includes('اختبار النهاية'), 'the last station leads to the end test');
await page.click('[data-cs-rail="1"]'); await stepIs('partner');
expect((await page.$('[data-cs-ask]')) !== null, 'every station is one tap away on the rail');
expect(divisors(60).length === 12, 'sanity: 60 has 12 divisors');
expect(errors.length === 0, 'no page error');
console.log(`\n${process.exitCode ? 'FAILED' : 'ALL OK'} — ${n} screenshots in ${OUT} at ${SIZE.join('×')}`);
await browser.close();
