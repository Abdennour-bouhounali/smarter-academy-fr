// « حصّة القسم » — walk of the HOUR on the board (simulated teacher; the API is an in-memory double): the start test, then
// the rules revised one per screen (the teacher picks the reader, or reads himself), then the lesson on the board — the
// class experiments with bridges, writes its rule, the board breaks a wrong rule and fails to break the right one, the rule
// gets its name, the other keys, the copybook — and the end test. On every screen: nothing scrolls, nothing leaves its card.
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/class-lesson.mjs [outDir]
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

const BASE = process.env.E2E_BASE || 'http://localhost:5173';
const URL_ = `${BASE}/enseignant/hissa/qasim-adad-tabii?classe=7`;
const OUT = process.argv[2] || `${tmpdir()}/class-lesson`;
const SIZE = (process.env.E2E_SIZE || '1366x768').split('x').map(Number);
mkdirSync(OUT, { recursive: true });
const expect = (cond, msg) => { if (!cond) { console.log('FAIL', msg); process.exitCode = 1; throw new Error(msg); } console.log('ok  ', msg); };
const DEFAULT = JSON.parse(readFileSync(new URL('../../../content/class-tests/4am/qasim-adad-tabii.json', import.meta.url), 'utf8'));
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
    if (url.includes('/teacher/class-tests/')) return json({ success: true, lessonCode: 'qasim-adad-tabii', default: { version: def.version, start: def.start, end: def.end, pool: def.pool }, mine: null });
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
const api = () => page.evaluate(() => window.__api);
const hour = () => page.evaluate(() => window.__classHour);
const board = () => page.evaluate(() => ({ step: window.__classLesson.step.id, memo: window.__classLesson.memo, speaker: window.__classLesson.speaker }));
const attr = (sel, a) => page.getAttribute(sel, a);
const text = async (sel) => ((await page.textContent(sel)) ?? '').trim();
const px = (sel) => page.evaluate((s) => { const el = document.querySelector(s); const z = Number(document.querySelector('.cs-fit').style.zoom || 1); return el ? Math.round(parseFloat(getComputedStyle(el).fontSize) * z) : 0; }, sel);
const next = () => page.click('[data-cs-lesson-next]');
const stepIs = async (id) => { await page.waitForSelector(`[data-cs-lesson-step="${id}"]`); };
/** The class builds one bridge: the numbers by a suggestion, a prediction (true, false, null), then the verdict. */
const build = async (a, b, pred) => {
  if (await page.$('[data-cs-another]')) await page.click('[data-cs-another]');
  await page.click(`[data-cs-suggest="${a}:${b}"]`); await page.click(`[data-cs-predict="${pred === null ? 'none' : pred ? 'held' : 'fell'}"]`);
  await page.waitForSelector('[data-cs-lab-stage="done"]'); return attr('.cs-lab [data-cs-verdict]', 'data-cs-verdict');
};

// ══ 1. the hour as a script: four moments, each can be opened alone ══
await page.goto(URL_, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-cs-hour]');
expect((await page.$$('[data-cs-hour] > li')).length === 4, 'the set-up shows the hour as four moments: start test, rules, lesson, end test');
expect((await text('[data-cs-open="revise"] small')) === '5 قواعد' && (await text('[data-cs-open="lesson"] small')).includes('11 محطّة'), 'the rules come from the learning net (5 rule cards), the lesson has 11 stations');
await shot('setup-hour');

// ══ 2. the start test, then the board proposes the revision ══
await page.click('[data-cs-begin="start"]');
for (let k = 0; k < DEFAULT.start.length; k += 1) {
  const { q } = await page.evaluate(() => window.__classSession); const right = !(q.item === '1am.m3.r02'); // the class misses the divisibility rules
  if (q.kind === 'choice') await page.click(`[data-cs-option="${right ? q.answer : (q.answer + 1) % q.options.length}"]`);
  else if (q.kind === 'truefalse') await page.click(`[data-cs-option="${String(right ? q.answer : !q.answer)}"]`);
  else { for (const d of String(right ? q.answer : q.answer + 1)) await page.click(`[data-cs-key="${d}"]`); await page.click('[data-cs-key="ok"]'); }
  await page.waitForSelector('[data-cs-said]'); await page.click('[data-cs-next]');
}
await page.waitForSelector('[data-cs-result]');
expect((await attr('[data-cs-continue]', 'data-cs-continue')) === 'revise' && (await text('[data-cs-continue]')).includes('مراجعة القواعد'), 'after the start test the result leads to « مراجعة القواعد »');
await shot('start-result');
await page.click('[data-cs-continue]');

// ══ 3. the rules revised: one per screen; the TEACHER decides who reads ══
await page.waitForSelector('[data-cs-rule]');
{ const r = await page.evaluate(() => window.__classRevise);
  expect(r.n === 5 && r.card.item === '1am.m3.r02' && r.card.score && r.card.score.right === 0, 'five rules, and the الكفاءة the class missed in the start test comes first, with its count');
  expect(r.reader === null && (await attr('.cs-turn', 'data-cs-speaker')) === '' && (await text('.cs-turn strong')) === 'من يقرأ القاعدة؟', 'the platform proposes NO reader: the board waits for the teacher'); }
expect((await page.$('[data-cs-rule-example]')) === null, 'the example stays hidden until the teacher asks for it');
console.log('    text on the board (px): rule', await px('.cs-rule__text'), '· title', await px('.cs-rule h2'));
expect((await px('.cs-rule__text')) >= 30, 'the rule is written large enough for the last desk');
await shot('revise-waiting');
await page.click('[data-cs-pick-reader]'); await page.waitForSelector('[data-cs-class-window]');
expect((await page.$$('[data-cs-minimap] [data-cs-seat]')).length === 35, 'the class opens as a window: 35 desks');
await shot('revise-class-window');
await page.click('[data-cs-seat="503"]');
expect((await attr('.cs-turn', 'data-cs-speaker')) === 'سلمى' && (await text('.cs-turn small')) === 'يقرأ' && (await page.$('[data-cs-class-window]')) === null, 'the teacher taps a desk: « يقرأ: سلمى » stands across the top');
await page.click('[data-cs-rule-show]'); await page.waitForSelector('[data-cs-rule-example]');
await shot('revise-student-reads');
await page.click('[data-cs-read-myself]');
expect((await attr('.cs-turn', 'data-cs-speaker')) === 'الأستاذ', '« أقرأها أنا »: the teacher reads it himself');
await page.keyboard.press('ArrowLeft'); await page.waitForSelector('[data-cs-revise-index="1"]'); await page.waitForTimeout(150);
{ const r = await page.evaluate(() => window.__classRevise); expect(r.i === 1 && r.reader === null && r.shown === false, 'the arrow of a presenter remote goes to the next rule; reader and example start again'); }
// the board tools: the pen, the curtain, the timer
await page.click('[data-cs-ink-toggle]'); await page.waitForSelector('[data-cs-ink]');
await page.mouse.move(300, 300); await page.mouse.down(); await page.mouse.move(420, 340, { steps: 6 }); await page.mouse.move(520, 300, { steps: 6 }); await page.mouse.up();
expect((await attr('.cs-inklayer', 'data-cs-ink')) === '1', 'the pen writes over the rule');
await shot('revise-pen');
await page.click('[data-cs-ink-page]'); await page.mouse.move(400, 200); await page.mouse.down(); await page.mouse.move(600, 260, { steps: 5 }); await page.mouse.up();
expect((await attr('.cs-inklayer', 'data-cs-ink')) === '2' && (await page.$('.cs-inklayer.is-page')) !== null, 'a blank page is one tap away');
await page.click('[data-cs-ink-undo]'); expect((await attr('.cs-inklayer', 'data-cs-ink')) === '1', '« تراجع » removes the last stroke');
await page.click('[data-cs-ink-close]'); expect((await page.$('[data-cs-ink]')) === null, '« أغلق القلم » gives the board back');
await page.click('[data-cs-curtain-toggle]'); await page.waitForSelector('[data-cs-curtain]'); await shot('curtain', 200);
await page.click('[data-cs-curtain]'); expect((await page.$('[data-cs-curtain]')) === null, 'the curtain hides the board, a tap lifts it');
await page.click('[data-cs-timer]'); expect((await attr('[data-cs-timer]', 'data-cs-timer')) === '60', 'the timer starts at one minute');
await page.click('[data-cs-timer]'); await page.click('[data-cs-timer]'); await page.click('[data-cs-timer]'); expect((await attr('[data-cs-timer]', 'data-cs-timer')) === '', 'and a fourth tap stops it');
for (let k = 1; k < 4; k += 1) { await page.click('[data-cs-revise-next]'); await shot(`revise-card-${k + 2}`, 250); }
expect((await attr('[data-cs-revise-next]', 'data-cs-revise-next')) === 'lesson' && (await text('[data-cs-revise-next]')).includes('نبدأ الدرس الجديد'), 'after the last rule: « نبدأ الدرس الجديد »');
await page.click('[data-cs-revise-next]');

// ══ 4. the lesson on the board — the situation ══
await stepIs('situation');
expect((await attr('.bb', 'data-bb-stage')) === 'ask' && (await attr('.bb', 'data-bb')) === '15:4' && (await text('[data-cs-cue] span')).length > 10, 'the lesson opens on a situation: a gap of 15, a plank of 4, and one oral question for the teacher');
await shot('lesson-situation');
await page.click('[data-cs-sit-try]'); await page.waitForSelector('.cs-sit [data-cs-verdict]');
expect((await attr('.bb', 'data-bb-planks')) === '3' && (await attr('.bb', 'data-bb-left')) === '3' && (await attr('.cs-sit [data-cs-verdict]', 'data-cs-verdict')) === 'fell' && (await attr('.bb-kid', 'data-bb-kid')) === 'waiting', 'the board builds: 3 planks, 3 cells left — it crumbles and the child does not cross');
await shot('lesson-situation-fell', 1300);

// ══ 5. the class experiments ══
await next(); await stepIs('bridges');
expect((await attr('[data-cs-ready]', 'data-cs-ready')) === 'held' && (await attr('[data-cs-log]', 'data-cs-log')) === '0', 'the class has no evidence yet');
expect((await build(15, 3, true)) === 'held' && (await attr('[data-cs-pred]', 'data-cs-pred')) === 'right' && (await text('[data-cs-equality]')).replace(/\s/g, '').includes('15=3×5'), 'the class predicts « يثبت » for 15 and 3: it holds, the equality is written, the prediction earns a star');
await page.waitForTimeout(1900);
expect((await attr('.bb-kid', 'data-bb-kid')) === 'crossed', 'on a bridge that holds the child crosses');
await shot('lesson-bridge-held');
expect((await build(15, 4, true)) === 'fell' && (await attr('[data-cs-pred]', 'data-cs-pred')) === 'off', 'a prediction that misses is met by « لماذا؟ », never by « wrong »');
await shot('lesson-bridge-fell', 1200);
await build(16, 4, null); expect((await page.$('[data-cs-pred]')) === null, 'the class may build without predicting');
expect((await attr('[data-cs-ready]', 'data-cs-ready')) === 'more', 'three bridges: the board asks for one more');
await page.click('[data-cs-another]'); await page.click('[data-cs-plus="b"]'); await page.click('[data-cs-minus="a"]'); await page.click('[data-cs-plus="a"]');
expect((await text('[data-cs-value="a"]')) === '16' && (await text('[data-cs-value="b"]')) === '5', 'the class is free: its own gap and its own plank, by the two big steppers');
await page.click('[data-cs-predict="fell"]'); await page.waitForSelector('[data-cs-lab-stage="done"]');
{ const b = await board(); expect(b.memo.log.length === 4 && b.memo.stars === 2 && b.memo.preds === 3 && (await attr('[data-cs-ready]', 'data-cs-ready')) === 'yes', 'four bridges, one that held and one that fell: « عندنا ما يكفي لنستنتج »'); }
await page.click('.cs-lesson__top [data-cs-class-open]'); await page.click('[data-cs-seat="507"]');
expect((await attr('.cs-turn', 'data-cs-speaker')) === 'نور' && (await text('.cs-turn small')) === 'على السبّورة', 'a student called to the board: his name across the top, the scene keeps its place');
await shot('lesson-bridges-student-at-board', 900);
expect((await text('[data-cs-lesson-next]')).includes('نستنتج') && (await page.$('[data-cs-lesson-next].cs-btn--main')) !== null, 'the way on is « نستنتج »');

// ══ 6. the class writes its rule; the board tests it, then attacks it ══
await next(); await stepIs('forge');
expect((await attr('[data-cs-evidence]', 'data-cs-evidence')) === '4' && (await page.$('[data-cs-forge-test]:disabled')) !== null, "the class's bridges are a table: planks laid, cells left, held or not — no rule yet");
await shot('forge-write');
await page.click('[data-cs-tile-q="b"]'); await page.click('[data-cs-tile-c="even"]'); await page.click('[data-cs-forge-test]');
await page.waitForSelector('[data-cs-clash]');
expect((await attr('[data-cs-clash]', 'data-cs-clash')) === '15:3' && (await text('[data-cs-clash]')).includes('نعدّل قاعدتنا'), "a first rule (« طول اللوح عدد زوجي ») is contradicted by the class's own bridge 15 · 3");
await shot('forge-clash');
await page.click('[data-cs-tile-q="r"]'); await page.click('[data-cs-forge-test]');
await page.waitForSelector('[data-cs-attack]');
{ const a = await attr('[data-cs-attack]', 'data-cs-attack'); const [ga, gb] = a.split(':').map(Number);
  expect(ga % gb !== 0 && (ga % gb) % 2 === 0 && (await text('[data-cs-explain]')).includes('قاعدتنا تقول إنّ الجسر يثبت'), `a rule that agrees with every bridge of the class (« الباقي عدد زوجي ») is attacked with a new gap (${a}) where it says « يثبت »`);
  await shot('forge-attack');
  await page.click('[data-cs-attack-build]'); await page.waitForSelector('[data-cs-attack-result]');
  expect((await attr('[data-cs-attack-result]', 'data-cs-attack-result')) === 'broken', 'the board builds it: the bridge crumbles, the rule does not survive');
  await shot('forge-attack-broken', 1200);
  await page.click('[data-cs-attack-next]'); await page.waitForSelector('[data-cs-broke]');
  expect((await attr('[data-cs-broke]', 'data-cs-broke')) === a && (await attr('[data-cs-evidence]', 'data-cs-evidence')) === '5', 'the bridge that broke the rule joins the evidence of the class'); }
await page.click('[data-cs-tile-c="zero"]'); await page.click('[data-cs-forge-test]');
await page.waitForSelector('[data-cs-attack]');
for (let k = 0; k < 2; k += 1) { await page.click('[data-cs-attack-build]'); await page.waitForSelector('[data-cs-attack-result="survived"]'); if (k === 0) await shot('forge-attack-survived', 1900); await page.click('[data-cs-attack-next]'); }
await page.waitForSelector('[data-cs-sealed]');
{ const b = await board(); expect(b.memo.sealed && b.memo.rule.q === 'r' && b.memo.rule.c === 'zero' && (await text('.cs-sealed .cs-sentence')).includes('يساوي 0'), 'the right rule survives two attacks: « قاعدة القسم صمدت »'); }
await shot('forge-sealed');
expect((await text('[data-cs-lesson-next]')).includes('نعطيها اسمها'), 'only now: « نعطيها اسمها »');

// ══ 7. the rule gets its name, read aloud ══
await next(); await stepIs('name-1');
expect((await text('[data-cs-ours]')).includes('باقي قسمة طول الهوّة على طول اللوح يساوي 0') && (await text('.cs-scene__head h2')).includes('القاسم بالباقي'), 'the name comes AFTER the rule of the class, which is shown above it');
expect((await board()).speaker === null, 'again, the platform proposes no reader');
await page.click('[data-cs-pick-reader]'); expect((await page.$('[data-cs-seat="507"].is-spoken')) !== null && (await page.$('[data-cs-seat="503"].is-spoken')) === null, 'the class window remembers who has already spoken in the lesson');
await page.click('[data-cs-seat="512"]'); expect((await text('.cs-turn small')) === 'يقرأ', 'a student reads the key');
console.log('    text on the board (px): key', await px('.cs-name__lines p'));
await shot('name-1-read');
await page.click('[data-cs-recall]');
{ const hidden = await page.$$('[data-cs-blank="hidden"]'); expect(hidden.length >= 2, `« من يتذكّر؟ » hides the key words (${hidden.length})`); await shot('name-1-recall'); await hidden[0].click(); expect((await page.$$('[data-cs-blank="open"]')).length === 1, 'a tap shows the word the class has said'); }

// ══ 8. the other keys: a question proved by bridges, sentences proved by the equality ══
await next(); await stepIs('product');
await page.click('[data-cs-ask-option="7"]'); await page.click('[data-cs-ask-check]');
expect((await attr('[data-cs-ask-result]', 'data-cs-ask-result')) === 'look' && (await page.$$('.cs-plankcard.is-held')).length === 1 && (await page.$$('.cs-plankcard .bbar')).length === 4, 'a choice that misses: the four planks are built, the class looks — never « wrong »');
await page.click('[data-cs-ask-again]'); await page.click('[data-cs-ask-option="8"]'); await page.click('[data-cs-ask-check]');
expect((await attr('[data-cs-ask-result]', 'data-cs-ask-result')) === 'right', 'the plank 8 fills 48: the class is right');
await shot('ask-product');
await next(); await stepIs('name-2'); await shot('name-2');
await next(); await stepIs('sentences');
{ const truth = [true, false, true, false, true];
  for (let k = 0; k < 5; k += 1) await page.click(`[data-cs-stmt="${k}"] [data-cs-stmt-say="${k === 3 ? String(!truth[k]) : String(truth[k])}"]`);
  const shown = await page.$$eval('[data-cs-stmt]', (els) => els.map((e) => e.getAttribute('data-cs-stmt-truth')));
  expect(shown.join() === 'true,false,true,false,true' && (await page.$$('[data-cs-stmt-star]')).length === 4, 'five sentences: each shows its truth and its reason; four stars for the class'); }
await shot('statements');
await next(); await stepIs('name-3'); expect((await page.$$('.cs-name__lines li')).length === 4, 'the four sentences that say the same thing'); await shot('name-3');
await next(); await stepIs('always');
await page.click('[data-cs-ask-option="1"]'); await page.click('[data-cs-ask-option="143"]'); await page.click('[data-cs-ask-check]');
expect((await attr('[data-cs-ask-result]', 'data-cs-ask-result')) === 'right', 'two planks always hold: 1 and the gap itself');
await shot('ask-always');
await next(); await stepIs('name-4'); await page.click('[data-cs-read-myself]'); expect((await attr('.cs-turn', 'data-cs-speaker')) === 'الأستاذ', 'the teacher may read a key himself'); await shot('name-4');
await next(); await stepIs('trace'); expect((await attr('[data-cs-trace]', 'data-cs-trace')) === '4', 'the copybook: the four keys on one page'); await shot('trace');

// ══ 9. an adult's board: every station is one tap away, and the hour is remembered ══
await page.click('[data-cs-rail="1"]'); await stepIs('bridges');
expect((await attr('[data-cs-log]', 'data-cs-log')) === '5', 'back on « نجرّب » from the rail: the bridges of the class are still there');
await page.keyboard.press('PageDown'); await stepIs('forge'); expect((await page.$('[data-cs-sealed]')) !== null, 'and its rule is still sealed');
await page.click('[data-cs-lesson-exit]'); await page.waitForSelector('[data-cs-hour]');
expect((await text('[data-cs-open="lesson"] small')).includes('نواصل من المحطّة 3 من 11'), 'leaving the board keeps the place: « نواصل من المحطّة 3 من 11 »');
await page.reload({ waitUntil: 'networkidle' }); await page.waitForSelector('[data-cs-hour]');
expect((await hour()).memo.step === 2 && (await hour()).memo.sealed === true, 'and a reloaded page too (kept in the browser tab, never sent)');
await page.click('[data-cs-lesson-restart]'); expect((await hour()).memo.step === 0 && (await hour()).memo.log.length === 0, '« من البداية » starts the lesson again');

// ══ 10. the end of the hour: the end test ══
await page.click('[data-cs-open="lesson"]'); await stepIs('situation'); await page.click('[data-cs-rail="10"]'); await stepIs('trace');
expect((await text('[data-cs-lesson-next]')).includes('اختبار النهاية'), 'the last station leads to the end test');
await next(); await page.waitForSelector('[data-cs-moment-on="end"]');
await shot('end-test');
{ const a = await api(); expect(a.evidence === 0 && a.posts.every((p) => p.moment === 'start'), 'the revision and the lesson send NOTHING: the only saved session is the start test, and no learning evidence'); }
expect(errors.length === 0, 'no page error');
console.log(`\n${process.exitCode ? 'FAILED' : 'ALL OK'} — ${n} screenshots in ${OUT} at ${SIZE.join('×')}`);
await browser.close();
