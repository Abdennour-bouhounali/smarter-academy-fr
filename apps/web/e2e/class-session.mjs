// « حصّة القسم » — walk of the TEACHER's side of the pilot lesson (simulated session; the API is an in-memory double).
// The teacher's card on the lesson page, « جرّب الدرس كتلميذ » (nothing recorded), then the class session: the seating map
// (move a student, any number of teams, gender), the test (default, his own question, save, reset), the test on the board
// (the turn by place, « أختار أنا », « اختر لي », an absent student, the sentences with the name), the result with the
// podium, the end test with « before / now », and a session kept when the connection is lost.
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/class-session.mjs [outDir]
import { chromium } from 'playwright';
import { GL_ARGS } from './lib/gpu.mjs';
import { mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

const BASE = process.env.E2E_BASE || 'http://localhost:5173';
const LESSON = `${BASE}/courses/moyen/4am/ansab_al_aadad_wal_hisab/qasim-adad-tabii`;
const OUT = process.argv[2] || `${tmpdir()}/class-session`;
const SIZE = (process.env.E2E_SIZE || '1366x768').split('x').map(Number);
mkdirSync(OUT, { recursive: true });
const expect = (cond, msg) => { if (!cond) { console.log('FAIL', msg); process.exitCode = 1; throw new Error(msg); } console.log('ok  ', msg); };
const DEFAULT = JSON.parse(readFileSync(new URL('../../../content/class-tests/4am/qasim-adad-tabii.json', import.meta.url), 'utf8'));
const NAMES = [['عمر', 'بن علي'], ['مريم', 'حدّاد'], ['ياسين', 'منصوري'], ['سلمى', 'بوزيد'], ['أنس', 'قاسمي'], ['هاجر', 'سعدي'], ['إلياس', 'عمراني'], ['نور', 'شريف'], ['آدم', 'بلقاسم'], ['رحمة', 'زروقي'], ['يوسف', 'دحماني'], ['خديجة', 'مرابط']];
const STUDENTS = NAMES.map(([firstName, lastName], i) => ({ id: 500 + i, firstName, lastName, grade: '4am' }));
const BIG = Array.from({ length: 35 }, (_, i) => ({ id: 700 + i, firstName: NAMES[i % 12][0] + (i >= 12 ? ` ${i}` : ''), lastName: NAMES[(i * 5) % 12][1], grade: '4am' }));

const browser = await chromium.launch({ args: GL_ARGS });
const ctx = await browser.newContext({ viewport: { width: SIZE[0], height: SIZE[1] } });
await ctx.addInitScript(([students, def, big]) => {
  localStorage.setItem('token', 'qa-fake-token');
  const db = (window.__api = { seating: null, mine: null, sessions: [], posts: [], puts: [], evidence: 0, offline: false });
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  const real = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url; const method = (init.method ?? 'GET').toUpperCase(); const body = typeof init.body === 'string' ? JSON.parse(init.body) : null;
    if (!url.includes('/api/')) return real(input, init);
    if (url.includes('/auth/me')) return json({ success: true, user: { id: 77, name: 'الأستاذ', firstName: 'كريم', lastName: 'أستاذ', role: 'teacher', roles: ['teacher'], email_verified_at: '2026-09-01T00:00:00Z', emailVerified: true, nameComplete: true } });
    if (url.includes('game-evidence')) { db.evidence += 1; return json({ success: true }); }
    if (/\/teacher\/classrooms(\?|$)/.test(url)) return json({ success: true, classrooms: [{ id: 7, name: '4 م 1', grade: '4am', status: 'active' }] });
    if (url.includes('/teacher/classrooms/7/students')) return json({ success: true, students });
    if (url.includes('/teacher/classrooms/8/students')) return json({ success: true, students: big });
    if (url.includes('/teacher/classrooms/8/seating')) { if (method === 'PUT') db.bigSeating = body; return json({ success: true, seating: db.bigSeating ?? null }); }
    if (url.includes('/teacher/classrooms/8/class-sessions')) return json({ success: true, sessions: [], turns: {} });
    if (url.includes('/teacher/classrooms/7/seating')) { if (method === 'PUT') { db.seating = body; db.puts.push(body); } return json({ success: true, seating: db.seating }); }
    if (url.includes('/teacher/classrooms/7/class-sessions')) {
      if (method === 'POST') { if (db.offline) throw new TypeError('offline'); db.posts.push(body); const items = {}; for (const a of body.answers) { if (!a.item) continue; items[a.item] ??= { item: a.item, right: 0, total: 0 }; items[a.item].total += 1; items[a.item].right += a.correct ? 1 : 0; } const right = body.answers.filter((a) => a.correct).length; const s = { uuid: body.uuid, lessonCode: body.lessonCode, moment: body.moment, finishedAt: '2026-11-18T09:00:00Z', summary: { ...body.summary, right, total: body.answers.length, items: Object.values(items) } }; db.sessions.unshift(s); return json({ success: true, session: s }, 201); }
      const turns = {}; for (const p of db.posts) for (const a of p.answers) if (a.studentId) turns[a.studentId] = (turns[a.studentId] ?? 0) + 1;
      return json({ success: true, sessions: db.sessions, turns });
    }
    if (url.includes('/teacher/lesson-files/')) { if (method === 'PUT') { db.fileDoc = body.documentId; db.filePuts = (db.filePuts ?? 0) + 1; } return json({ success: true, file: { lessonCode: 'qasim-adad-tabii', documentId: db.fileDoc ?? null } }); }
    if (url.includes('/math-lab/documents')) { const doc = { id: 41, tool: 'whiteboard', title: db.docTitle ?? '', schemaVersion: 1, data: db.docData ?? null, dataBytes: 0, summary: null, isFavorite: false, createdAt: '2026-11-18T09:00:00Z', updatedAt: '2026-11-18T09:00:00Z' }; if (method === 'POST') { db.docPosts = (db.docPosts ?? 0) + 1; db.docTitle = body.title; db.docData = body.data; return json({ success: true, document: { ...doc, title: body.title, data: body.data } }, 201); } if (/documents\/41/.test(url)) return json({ success: true, document: doc }); return json({ success: true, documents: [] }); }
    if (/\/teacher\/practice\/[^/]+\/exercises\/[^/]+\/students\/\d+/.test(url)) return json({ success: true, student: { id: 502, firstName: 'ياسين', lastName: 'منصوري', classrooms: [] }, questions: [{ questionId: 'q1', attempts: [{ attemptNumber: 1, answer: { value: '190' }, normalized: '190', outcome: 'incorrect', hintsUsed: 0, submittedAt: '2026-11-18 09:00:00', images: [], review: null }, { attemptNumber: 2, answer: { value: '196' }, normalized: '196', outcome: 'correct', hintsUsed: 1, submittedAt: '2026-11-18 09:01:00', images: [], review: null }] }, { questionId: 'q2', attempts: [{ attemptNumber: 1, answer: { value: '0' }, normalized: '0', outcome: 'correct', hintsUsed: 0, submittedAt: '2026-11-18 09:02:00', images: [], review: null }] }] });
    if (url.includes('/teacher/classrooms/7/lesson-tracking/')) return json({ success: true, lesson: { code: 'qasim-adad-tabii', title: 'قاسم' }, learningPoints: [{ code: 'P1', title: 'القاسم بالباقي', order: 1 }, { code: 'P2', title: 'القاسم بالجداء', order: 2 }], students: students.map((st, i) => ({ id: st.id, firstName: st.firstName, lastName: st.lastName, points: i === 0 ? { P1: 'mastered', P2: 'mastered' } : i === 1 ? { P1: 'gap' } : i === 2 ? { P1: 'mastered', P2: 'reinforce' } : {}, exercises: i === 2 ? [{ exerciseId: 'ex-4am-qasim-adad-tabii-l3-002', answered: 4, correct: 3, firstTry: 2, lastAnsweredAt: '2026-11-18 09:00:00' }, { exerciseId: 'ex-4am-qasim-adad-tabii-l1-001', answered: 3, correct: 3, firstTry: 3, lastAnsweredAt: '2026-11-17 09:00:00' }] : [], lastActivityAt: i === 2 ? '2026-11-18 09:00:00' : null })) });
    if (url.includes('/teacher/class-tests/')) { if (method === 'PUT') db.mine = { start: body.start, end: body.end, updatedAt: 'now' }; if (method === 'DELETE') db.mine = null; return json({ success: true, lessonCode: 'qasim-adad-tabii', default: { version: def.version, start: def.start, end: def.end, pool: def.pool }, mine: db.mine }); }
    return json({ success: true, data: [] });
  };
}, [STUDENTS, DEFAULT, BIG]);
const page = await ctx.newPage(); const errors = [];
page.on('pageerror', (e) => { errors.push(e.message); console.log('pageerror', e.message); });
let n = 0;
/** On the board (the test and its result) nothing scrolls and nothing leaves the screen. */
const shot = async (name, board = false) => {
  await page.waitForTimeout(350);
  if (board) {
    const bad = await page.evaluate(() => { const out = []; const root = document.querySelector('.cs-root'); for (const el of root.querySelectorAll('*')) { const cs = getComputedStyle(el); if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 2) out.push(`scrolls: ${el.className}`); } for (const el of root.querySelectorAll('.cs-play__top, .cs-turn, .cs-question, .cs-question > *, .cs-classwin, .cs-classwin .cs-mini button, .cs-said, .cs-options button, .cs-result__top, .cs-revise, .cs-stage, .cs-result__foot, .cs-podium')) { const r = el.getBoundingClientRect(); if (r.height > 0 && (r.top < -1 || r.bottom > innerHeight + 1 || r.left < -1 || r.right > innerWidth + 1)) out.push(`leaves the screen: ${el.className?.baseVal ?? el.className}`); } const q = root.querySelector('.cs-question'); if (q) for (const el of q.children) { const r = el.getBoundingClientRect(); const b = q.getBoundingClientRect(); if (r.bottom > b.bottom + 1 || r.top < b.top - 1) out.push(`out of the question card: ${el.className}`); } return out; });
    if (bad.length) { console.log('FAIL at «', name, '»:', [...new Set(bad)].join(' | ')); process.exitCode = 1; throw new Error(`layout at ${name}`); }
  }
  n += 1; await page.screenshot({ path: `${OUT}/${String(n).padStart(2, '0')}-${name}.png` });
};
const api = () => page.evaluate(() => window.__api);
const live = () => page.evaluate(() => window.__classSession);
const px = (sel) => page.evaluate((s) => { const el = document.querySelector(s); const z = Number(document.querySelector('.cs-fit').style.zoom || 1); return el ? Math.round(parseFloat(getComputedStyle(el).fontSize) * z) : 0; }, sel);
/** Answers the question on the board, right or not, as the student at the mouse would. */
const answer = async (right) => {
  const { q } = await live();
  if (q.kind === 'choice') await page.click(`[data-cs-option="${right ? q.answer : (q.answer + 1) % q.options.length}"]`);
  else if (q.kind === 'truefalse') await page.click(`[data-cs-option="${String(right ? q.answer : !q.answer)}"]`);
  else { for (const d of String(right ? q.answer : q.answer + 1)) await page.click(`[data-cs-key="${d}"]`); await page.click('[data-cs-key="ok"]'); }
  await page.waitForSelector('[data-cs-said]'); return q;
};
const turnName = () => page.textContent('.cs-turn strong');

// ══ 1. the lesson page of a teacher: his card, and the lesson as a student sees it ══
await page.goto(LESSON, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-teacher-lesson-panel]');
expect(await page.locator('[data-gameworld]').count() === 0, 'a teacher lands on the lesson page, not in the game');
expect((await page.locator('[data-teacher-tool]').evaluateAll((els) => els.map((e) => `${e.dataset.teacherTool}:${e.dataset.weight}`))).join() === '1am.m3.r01:core,1am.m3.r02:support' && await page.locator('[data-teacher-mistakes] li').count() >= 2 && await page.locator('[data-teacher-session], [data-teacher-preview], [data-teacher-memo]').count() === 3, 'his card: three doors, what the lesson stands on (core / support, with the year), the mistakes students really make');
await page.evaluate(() => window.scrollTo(0, 0)); await shot('teacher-top');
await page.locator('[data-teacher-lesson-panel]').scrollIntoViewIfNeeded(); await shot('teacher-card');
await page.waitForSelector('[data-lesson-tools]');
expect((await page.locator('[data-lesson-tool]').evaluateAll((els) => els.map((e) => e.dataset.lessonTool))).join() === 'lesson,session,memo,file,bank,track,card' && (await page.getAttribute('[data-lesson-tools]', 'data-lesson-tools-active')) === 'lesson' && await page.locator('main nav.font-mono').count() === 0, 'the top of the teacher’s lesson page is the header COMMON to the lesson’s tools: one tab per tool');
expect(await page.locator('[data-teacher-report]').count() === 1 && await page.evaluate(() => { const r = document.querySelector('[data-teacher-report]').getBoundingClientRect(); const c = document.querySelector('[data-teacher-lesson-panel]').getBoundingClientRect(); return r.top >= c.bottom - 1; }), 'the place of the report button (shown to the accounts that may report) is the bottom of the lesson’s home page, under his card');
// a lesson that has its board: the old « وضع القسم » is gone, and the teacher's page is the title and his card — one place
expect(await page.locator('[data-classroom-enter]').count() === 0, 'no « وضع القسم » on a lesson that has its board');
{ const main = (await page.locator('main').allInnerTexts()).join('\n');
  expect(await page.locator('[data-tour="lesson-index.modules"], [data-lesson-structure], [data-tour="lesson-index.progress"]').count() === 0 && !main.includes('مسار المحاور') && !main.includes('مسألة الدرس') && !main.includes('المناولات والطرائق'), 'the old sections of the lesson home (progress, الكفاءات / المتطلبات / المناولات, مسألة الدرس, مسار المحاور) are not shown to the teacher'); }
expect((await page.locator('[data-teacher-group]').evaluateAll((els) => els.map((e) => e.dataset.teacherGroup))).join() === 'class,prepare,tools,follow,know' && await page.locator('[data-teacher-track], [data-teacher-file], [data-teacher-map]').count() === 3 && await page.locator('[data-km-trigger]:visible, [data-nb-trigger="lesson"]:visible').count() === 0 && await page.locator('[data-teacher-bank]').count() === 1 && await page.locator('[data-teacher-learns] li').count() >= 3 && (await page.locator('[data-teacher-moment]').evaluateAll((els) => els.map((e) => e.dataset.teacherMoment))).join() === 'start,revise,lesson,end', 'the teacher’s card follows his work: in class (the four moments), prepare (with his lesson file), my tools (the lab, the bank, the knowledge card), follow the class, what to know — and no floating « بطاقتي » / « كرّاسي » button any more');
// « ملفّ الدرس »: the lesson's own work file — the whiteboard, on its own full-screen page, outside the lab
await page.click('[data-teacher-file]'); await page.waitForSelector('[data-lf-document="41"]');
{ const a = await api(); const g = { nav: await page.locator('aside:visible').count(), bar: await page.getAttribute('[data-lesson-tools]', 'data-lesson-tools-active') };
  expect(page.url().includes('/enseignant/milaff/qasim-adad-tabii') && !page.url().includes('atelier') && g.nav >= 1 && g.bar === 'file' && a.docPosts === 1 && a.docTitle.includes('ملفّ الدرس') && a.fileDoc === 41, '« ملفّ الدرس » opens on its OWN page (not in the lab) INSIDE the teacher’s space — its navigation and the common header of the lesson’s tools stay — on this lesson’s one document, created once');
  await page.waitForSelector('[data-ml-back]');
  expect((await page.getAttribute('[data-ml-back]', 'href')).includes('qasim-adad-tabii') && !(await page.getAttribute('[data-ml-back]', 'href')).includes('atelier'), 'its way out is the lesson, never the lab'); }
{ const over = await page.evaluate(() => { const h = document.querySelector('[data-lesson-tool-page="file"] > .ltb').getBoundingClientRect(); const bar = document.querySelector('.sa-ml-bar')?.getBoundingClientRect(); return bar ? bar.top >= h.bottom - 1 && bar.height > 0 : false; });
  expect(over, 'the common header sits above the whiteboard’s own bars (title, save, tools), never over them'); }
await page.waitForTimeout(900); await shot('lesson-file');
await page.click('[data-ml-back]'); await page.waitForSelector('[data-teacher-lesson-panel]');
await page.click('[data-teacher-file]'); await page.waitForSelector('[data-lf-document="41"]');
expect((await api()).docPosts === 1 && (await api()).filePuts === 1, 'opened again, it is the same file: no second document for the lesson');
await page.goto(LESSON, { waitUntil: 'networkidle' }); await page.waitForSelector('[data-teacher-lesson-panel]');
// « بطاقة المعارف » on the board: the teacher's « بطاقتي », for a quick revision with the whole class
await page.click('[data-teacher-map]'); await page.waitForSelector('[data-cs-kcard]');
{ const c = await page.evaluate(() => window.__classCard);
  expect(page.url().includes('/enseignant/bitaqa/') && (await page.getAttribute('[data-lesson-tools]', 'data-lesson-tools-active')) === 'card' && await page.locator('[data-card-full]').count() === 1 && c.n >= 4 && c.id === 'qasim-baqi' && await page.locator('[data-cs-card-line]').count() === 0 && await page.locator('[data-cs-dock] .cs-tool').count() === 6 && await page.locator('[data-cs-dock] [data-card-full]').count() === 1 && await page.locator('h1').filter({ hasText: 'بطاقة المعارف' }).count() === 0 && await page.locator('[data-cs-class-open], [data-cs-pick-reader], .cs-turn, [data-cs-pick]').count() === 0, `« بطاقة المعارف » opens at once, with NO class to choose and nobody to name: ${c.n} cards of the lesson's own knowledge, one per screen, and only the tools (pen, pointer, curtain, timer, lab, and « ملء الشاشة » beside them); its name is written once`); }
expect(await page.locator('[data-cs-card-link]').count() === 2 && (await page.getAttribute('a[data-cs-card-link="qisma-iqlidiya-baqi"]', 'href')).includes('qisma-iqlidiya-baqi') && (await page.textContent('[data-cs-card-links]')).includes('يحتاج إلى'), 'for the teacher: the earlier lessons this الكفاءة is connected with, each with its direct link');
await page.click('[data-cs-card-show="trap"]');
expect(await page.locator('[data-cs-card-line="trap"]').count() === 1, 'the trap comes when the teacher asks');
expect(await page.evaluate(() => [...document.querySelectorAll('.cs-fitbox')].every((b) => b.firstElementChild.getBoundingClientRect().height <= b.getBoundingClientRect().height + 2)), 'whatever is opened, the card stays inside the board');
await shot('knowledge-board', true);
await page.keyboard.press('ArrowLeft'); await page.waitForSelector('[data-cs-card-index="1"]'); await page.waitForTimeout(150);
expect((await page.evaluate(() => window.__classCard)).shown.length === 0, 'the next card starts closed again');
await page.click('[data-card-full]'); await page.waitForSelector('[data-card-stage="full"]'); await page.waitForTimeout(300);
{ const f = await page.evaluate(() => { const b = document.querySelector('[data-card-stage]').getBoundingClientRect(); const top = document.elementFromPoint(innerWidth - 40, 30); return { real: !!document.fullscreenElement, covers: b.left <= 0 && b.top <= 0 && b.width >= innerWidth && b.height >= innerHeight - 1, over: !!top?.closest('[data-card-stage]') }; });
  if (process.env.DBG) console.log('DBG full', JSON.stringify(f));
  expect(f.real && f.covers && f.over && await page.locator('[data-card-full-exit]').isVisible(), '« ملء الشاشة » is the REAL full screen of the computer (the browser’s own bars go): the card covers the navigation and the common header'); await shot('knowledge-full'); }
await page.click('[data-card-full-exit]'); await page.waitForSelector('[data-card-stage="page"]'); await page.waitForTimeout(200);
expect(await page.evaluate(() => !document.fullscreenElement) && await page.locator('[data-lesson-tools]').isVisible(), 'the same button, now « خروج », is on the full screen and comes back under the common header');
await page.click('[data-cs-card-exit]'); await page.waitForSelector('[data-teacher-lesson-panel]');
// « متابعة القسم »: the class on this lesson, student by student
await page.click('[data-teacher-track]'); await page.waitForSelector('[data-cs-track]');
expect(page.url().includes('/enseignant/mutabaa/qasim-adad-tabii') && await page.locator('[data-cs-track-screen]').count() === 1 && await page.locator('[data-cs-hour], [data-cs-tab]').count() === 0 && (await page.getAttribute('[data-lesson-tools]', 'data-lesson-tools-active')) === 'track' && await page.locator('aside:visible').count() >= 1 && (await page.getAttribute('[data-cs-track]', 'data-cs-track')) === '12' && (await page.getAttribute('[data-cs-track-points]', 'data-cs-track-points')) === '2', '« متابعة القسم » is its own screen — nothing of « مسار الحصّة » around it: twelve students, the two الكفاءات of the lesson');
{ const order = (await page.evaluate(() => window.__classTracking.order)).slice(0, 3);
  expect(order.join() === '501,502,503'.replace('503', order[2]) && order[0] === 501 && order[1] === 502, 'the order is « who needs me first »: the student with a gap, then the one who needs support — never a ranking'); }
await page.click('[data-cs-track-student="502"] .cs-track__row'); await page.waitForSelector('[data-cs-track-detail]');
expect(await page.locator('[data-cs-track-exercise]').count() === 2 && (await page.textContent('[data-cs-track-detail]')).includes('المستوى 3 · التمرين 2') && (await page.textContent('[data-cs-track-detail]')).includes('من أوّل محاولة'), 'a line opens on the student: each الكفاءة in words, each exercise with what he got right and right at the first try');
{ const clash = await page.evaluate(() => { const els = [...document.querySelectorAll('[data-cs-track-detail] li > *')].map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0); for (let i = 0; i < els.length; i += 1) for (let j = i + 1; j < els.length; j += 1) { const a = els[i]; const b = els[j]; if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) return true; } return false; });
  expect(!clash, 'in the opened line no text runs over another (a long الكفاءة wraps)'); }
await shot('tracking');
await page.locator('[data-cs-track-exercise="ex-4am-qasim-adad-tabii-l3-002"] [data-cs-track-see]').click(); await page.waitForSelector('[data-cs-work-question]');
{ const q = await page.$$eval('[data-cs-work-question]', (els) => els.map((e) => e.getAttribute('data-cs-work-right'))); const tries = await page.$$eval('[data-cs-work-question="q1"] [data-cs-work-try]', (els) => els.map((e) => `${e.getAttribute('data-cs-work-try')}:${e.querySelector('strong').textContent.trim()}`));
  expect(q.join() === 'true,true,,' && tries.join() === 'redo:190,right:196' && (await page.textContent('[data-cs-work]')).includes('ما كتبه ياسين') && (await page.textContent('[data-cs-work-question="q3"]')).includes('لم يُجب'), 'a window shows the exact exercise the student did: each question, what he wrote at each try (190 to redo, then 196 right), the questions he did not answer, and the expected answer'); }
await shot('student-work');
await page.click('[data-cs-work-close]'); expect(await page.locator('[data-cs-work]').count() === 0, 'the window closes');
// THE SAME HEADER on every tool: same width, same place for every tab
{ const boxes = {}; for (const [tool, ready] of [['track', '[data-cs-track]'], ['card', '[data-cs-kcard]'], ['bank', '[data-tb-list]'], ['memo', '[data-memo-rail]'], ['file', '[data-lf-document="41"]']]) { await page.click(`[data-lesson-tool="${tool}"]`); await page.waitForSelector(ready); await page.evaluate(() => window.scrollTo(0, 0)); boxes[tool] = await page.evaluate(() => { const r = (el) => { const b = el.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)].join(); }; return [r(document.querySelector('[data-lesson-tools]')), ...[...document.querySelectorAll('[data-lesson-tool]')].map(r)].join('|'); }); }
  const right = await page.evaluate(() => { const t = document.querySelector('.ltb__title').getBoundingClientRect(); const n = document.querySelector('.ltb__tabs').getBoundingClientRect(); const h = document.querySelector('.ltb').getBoundingClientRect(); return h.right - n.right < 8 && t.left - h.left < 8 && t.right <= n.left + 1 && h.top >= 0 && h.bottom <= innerHeight && document.scrollingElement.scrollHeight <= innerHeight + 2; });
  if (process.env.DBG) console.log('DBG', right, JSON.stringify(boxes, null, 1), await page.evaluate(() => { const g = (q) => { const b = document.querySelector(q).getBoundingClientRect(); return [b.left, b.right, b.top, b.bottom].map(Math.round).join(); }; return [g('.ltb'), g('.ltb__tabs'), g('.ltb__title'), innerHeight, document.scrollingElement.scrollHeight].join(' | '); }));
  const all = Object.values(boxes); expect(right && all.every((b) => b === all[0]) && await page.locator('aside:visible').count() >= 1, 'the header of the lesson’s tools is IDENTICAL on the tracking, the knowledge card, the bank, the memo and the lesson file: same width, same style, every tab at the same place, on the RIGHT, the lesson’s name on the left, and on the lesson file the header STAYS on screen above the whiteboard — inside the teacher’s space');
  await shot('tools-header'); }
await page.click('[data-lesson-tool="lesson"]'); await page.waitForSelector('[data-teacher-lesson-panel]');
await page.click('[data-teacher-lab]'); await page.waitForSelector('.ll-root'); await shot('teacher-lab');
await page.click('[data-ll-close]'); expect(await page.locator('.ll-root').count() === 0, '« مختبر الدرس » opens the lesson’s own lab from the card, and closes');
await page.click('[data-teacher-moment="lesson"]'); await page.waitForSelector('[data-cs-lesson-step="situation"]');
expect(!page.url().includes('moment=') && page.url().includes('classe=7'), 'a moment of the card opens the hour directly on it (here: the lesson on the board)');
expect(await page.locator('[data-cs-dock] .cs-dock__group').count() === 3 && await page.locator('[data-cs-dock] .cs-tool').count() === 6, 'the dock « أدوات الأستاذ »: six tools in three groups (who speaks · the board · the hour)');
await page.click('[data-cs-lab-toggle]'); await page.waitForSelector('[data-lesson-lab]'); await shot('board-lab');
await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(200);
expect((await page.evaluate(() => window.__classLesson.step.id)) === 'situation', '« مختبري » opens over the board, and the keys of the board wait while it is open');
await page.click('[data-ll-close]'); expect(await page.locator('[data-lesson-lab]').count() === 0, 'closing the lab gives the board back');
await shot('board-dock', true);
await page.click('[data-cs-lesson-exit]'); await page.click('[data-cs-close-setup]'); await page.waitForSelector('[data-teacher-lesson-panel]');

// ══ 1bis. the teacher's exercise bank: he reads, he shows an exercise on the board, he prints a sheet ══
await page.click('[data-teacher-bank]'); await page.waitForSelector('[data-teacher-bank="qasim-adad-tabii"] [data-tb-list="10"]');
expect((await page.getAttribute('[data-tb-total]', 'data-tb-total')) === '50' && await page.locator('[data-tb-level]').count() === 5 && !(await page.locator('[data-teacher-bank]').innerText()).includes('ابدأ'), 'the bank of the teacher: 50 exercises in five level tabs — nothing asks him to « start » like a student');
await page.locator('[data-tb-exercise] [data-tb-toggle]').first().click(); await page.waitForSelector('[data-tb-body]');
expect(await page.locator('[data-tb-body] [data-tb-key]').count() === 0 && await page.locator('[data-tb-body] .tb-q').count() >= 1, 'a line opens on the whole exercise: the statement and its questions, the key still hidden');
await page.click('[data-tb-keys]');
expect(await page.locator('[data-tb-body] [data-tb-key]').count() === await page.locator('[data-tb-body] .tb-q').count(), '« أظهر الحلول » puts the key under every question');
expect(await page.locator('[data-background-layer]').count() === 0 && await page.evaluate(() => [...document.querySelectorAll('[data-tb-body] *')].every((el) => !/(auto|scroll)/.test(getComputedStyle(el).overflowX))), 'the teacher’s space has a plain background (no coloured halos), and a formula of the bank never carries a scrollbar');
await shot('bank');
await page.locator('[data-tb-exercise] [data-tb-add]').first().click(); await page.click('[data-tb-level="3"]'); await page.waitForSelector('[data-tb-list="10"]');
await page.locator('[data-tb-exercise] [data-tb-add]').nth(1).click();
{ const [ex, qs, min] = (await page.getAttribute('[data-tb-totals]', 'data-tb-totals')).split('/').map(Number);
  expect(ex === 2 && qs >= 2 && min > 0, `the sheet of the class keeps exercises of several levels and says how much work it is (${ex} exercises, ${qs} questions, ${min} min)`); }
await page.check('[data-tb-with-key]'); await page.emulateMedia({ media: 'print' });
expect(await page.locator('.tb-paper').isVisible() && !(await page.locator('.tb-screen').isVisible()) && await page.locator('.tb-paper > section').count() === 2 && await page.locator('[data-tb-paper-key] [data-tb-key]').count() >= 2 && await page.locator('aside:visible').count() === 0, 'printed: the sheet alone (name, class, date, the two exercises), then the key on its own page — no menu, no button');
{ const tinted = await page.evaluate(() => { const seen = (el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0; }; const bad = []; for (const el of document.querySelectorAll('body, body *')) { if (!seen(el) || el.closest('.katex')) continue; const cs = getComputedStyle(el); const bg = cs.backgroundColor; const plain = bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent' || bg === 'rgb(255, 255, 255)'; if (!plain || cs.backgroundImage !== 'none') bad.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)} ${bg} ${cs.backgroundImage.slice(0, 30)}`); } return { bad: bad.slice(0, 5), layer: [...document.querySelectorAll('[data-background-layer]')].filter(seen).length, fixed: [...document.querySelectorAll('body *')].filter((el) => seen(el) && getComputedStyle(el).position === 'fixed').length }; });
  expect(tinted.layer === 0 && tinted.fixed === 0 && tinted.bad.length === 0, `paper is white: no background of the platform, no fixed layer the printer would repeat, no tinted surface (${tinted.bad.join(' | ') || 'none'})`); }
await shot('bank-print'); await page.emulateMedia({ media: 'screen' });
await page.locator('[data-tb-exercise] [data-tb-board]').nth(1).click(); await page.waitForSelector('[data-cs-exercise]');
expect(page.url().includes('/enseignant/hissa/qasim-adad-tabii') && await page.locator('[data-cs-exo-question]').count() === 1 && await page.locator('[data-cs-dock] .cs-tool').count() === 6 && await page.locator('[data-cs-exo-key]').count() === 0, '« على السبّورة » opens the exercise on the board of the class: the statement, one question, the same dock — the answer hidden');
await page.click('[data-cs-exo-hint]'); expect((await page.getAttribute('[data-cs-exo-hints]', 'data-cs-exo-hints')) === '1', 'a hint comes only when the teacher asks, one at a time');
await page.click('[data-cs-exo-show]'); await page.waitForSelector('[data-cs-exo-key]');
await page.click('[data-cs-class-open]'); await page.click('[data-cs-seat="503"]');
expect((await page.textContent('.cs-turn strong')).trim() === 'سلمى', 'the teacher calls a student to the board by his desk');
await shot('exercise-board-answer');
{ const bad = await page.evaluate(() => [...document.querySelectorAll('.cs-fitbox')].filter((b) => b.firstElementChild.getBoundingClientRect().height > b.getBoundingClientRect().height + 2).length);
  expect(bad === 0 && await page.evaluate(() => [...document.querySelectorAll('.cs-exo .katex')].every((k) => k.getClientRects().length <= 1)), 'the statement and the solution fit the board: drawn smaller if needed, never cut, never scrolled; no formula breaks'); }
await shot('exercise-board', true);
{ const n = await page.locator('[data-cs-exo-dot]').count(); for (let k = 1; k < n; k += 1) await page.click('[data-cs-exo-next]');
  expect((await page.getAttribute('[data-cs-exo-next]', 'data-cs-exo-next')) === 'done' && await page.locator('[data-cs-exo-key]').count() === 0, 'each question starts with its answer hidden; the last one ends the exercise'); }
await page.click('[data-cs-exo-next]'); await page.waitForSelector('[data-teacher-bank]');
expect(page.url().endsWith('/enseignant/pratique/qasim-adad-tabii'), 'the end of the exercise goes back to the bank');
{ const id = await page.getAttribute('[data-tb-exercise]', 'data-tb-exercise'); await page.goto(`${BASE}/enseignant/pratique/qasim-adad-tabii/1/${id}`, { waitUntil: 'networkidle' }); await page.waitForSelector('[data-cs-exercise]');
  expect(page.url().includes('/enseignant/hissa/') && page.url().includes('exercice='), 'the address of the old exercise player now opens the exercise on the board'); }
expect((await api()).posts.length === 0 && (await api()).evidence === 0, 'the bank and the board of an exercise record nothing');
await page.goto(LESSON, { waitUntil: 'networkidle' }); await page.waitForSelector('[data-teacher-lesson-panel]');
await page.click('[data-teacher-preview]'); await page.waitForSelector('[data-gameworld]');
expect(await page.locator('[data-di-preview]').count() === 1 && (await page.textContent('[data-di-preview]')).includes('لا شيء يُسجَّل'), '« جرّب الدرس كتلميذ » opens the student’s world, under a banner that says nothing is recorded');
await shot('preview');
await page.click('[data-di-preview] a'); await page.waitForSelector('[data-teacher-lesson-panel]');
expect((await api()).evidence === 0, 'leaving the preview comes back to the lesson page; no evidence was sent');

// ══ 2. the class session: the seating map ══
await page.click('[data-teacher-session]'); await page.waitForSelector('[data-cs-seating]');
expect(page.url().includes('/enseignant/hissa/qasim-adad-tabii') && page.url().includes('classe=7'), 'with one class, « حصّة القسم » opens on it at once');
expect(await page.locator('.cs-desk.is-taken').count() === 12 && await page.locator('[data-cs-team]').count() === 6, 'the map seats the twelve students: six lines of desks from the board to the back, so six teams under the names of scholars');
const firstTeam = await page.inputValue('[data-cs-team] input');
expect(firstTeam === 'الخوارزمي', 'the first team is « الخوارزمي »');
await page.click('[data-cs-desk="0:0"] .cs-desk__main'); await page.click('[data-cs-desk="1:0"] .cs-desk__main');
expect(await page.getAttribute('[data-cs-desk="1:0"]', 'data-cs-student') === '500' && await page.getAttribute('[data-cs-desk="0:0"]', 'data-cs-student') === '506', 'a tap on a student, a tap on a desk: the two students swap their places');
await page.click('[data-cs-desk="1:0"] .cs-desk__main'); await page.click('[data-cs-desk="0:0"] .cs-desk__main'); // back
await page.click('[data-cs-cols-minus]'); await page.click('[data-cs-cols-minus]');
expect(await page.getAttribute('[data-cs-cols]', 'data-cs-cols') === '4' && await page.locator('[data-cs-team]').count() === 4 && (await page.locator('[data-cs-team] small').allTextContents()).join() === '3,3,3,3', 'four lines of desks: four teams — a team is a VERTICAL line, three students each');
await page.click('[data-cs-teams="own"]'); await page.click('[data-cs-teamcount-plus]');
expect(await page.getAttribute('[data-cs-teamcount]', 'data-cs-teamcount') === '5' && await page.locator('[data-cs-team]').count() === 5, 'his own teams: FIVE teams — as many as he wants');
const dot0 = await page.getAttribute('[data-cs-desk="0:0"] [data-cs-teamdot]', 'data-cs-teamdot');
await page.click('[data-cs-desk="0:0"] [data-cs-teamdot]');
expect(await page.getAttribute('[data-cs-desk="0:0"] [data-cs-teamdot]', 'data-cs-teamdot') !== dot0, 'a tap on a student’s colour moves him to the next team');
await shot('seating-own-teams');
await page.click('[data-cs-teams="lines"]');
await page.click('[data-cs-desk="0:0"] [data-cs-gender]'); await page.click('[data-cs-desk="0:1"] [data-cs-gender]'); await page.click('[data-cs-desk="0:1"] [data-cs-gender]');
expect(await page.getAttribute('[data-cs-desk="0:0"] [data-cs-gender]', 'data-cs-gender') === 'm' && await page.getAttribute('[data-cs-desk="0:1"] [data-cs-gender]', 'data-cs-gender') === 'f', 'boy / girl is set by the teacher, never guessed from a name');
await page.waitForTimeout(900);
{ const s = (await api()).seating; expect(s && s.cols === 4 && s.seats.length === 12 && s.genders['500'] === 'm' && s.genders['501'] === 'f' && s.teams === null, 'the map is saved by itself'); }
await shot('seating');

// ══ 3. the test: the default, his own question, save, reset ══
await page.click('[data-cs-tab="test"]'); await page.waitForSelector('[data-cs-qlist]');
expect(await page.getAttribute('[data-cs-teststate]', 'data-cs-teststate') === 'default' && await page.locator('[data-cs-q]').count() === DEFAULT.start.length, 'the test of the platform is there, ready: ten questions for the start of the hour');
await page.click('[data-cs-remove="s4"]');
await page.click('[data-cs-add-own]'); await page.click('[data-cs-kind="truefalse"]'); await page.fill('[data-cs-qtext]', 'سؤال الأستاذ: 4 قاسم للعدد 20.'); await page.click('[data-cs-tf="true"]');
expect((await page.textContent('[data-cs-responsibility]')).includes('أنت المسؤول'), 'writing his own question, the teacher is told plainly that he answers for it');
await shot('own-question');
await page.click('[data-cs-form-ok]');
expect(await page.locator('[data-cs-q][data-cs-source="teacher"]').count() === 1 && await page.locator('[data-cs-q]').count() === DEFAULT.start.length && await page.getAttribute('[data-cs-teststate]', 'data-cs-teststate') === 'dirty', 'one question removed, his own added and marked « سؤال الأستاذ »');
await page.click('[data-cs-add-pool]'); await page.waitForSelector('[data-cs-pool]');
expect(await page.locator('[data-cs-pool-add]').count() >= DEFAULT.pool.length, 'more prepared questions wait in the pool (and the one he removed)');
await page.click('[data-cs-add-pool]');
await page.click('[data-cs-save]'); await page.waitForSelector('[data-cs-teststate="mine"]');
{ const mine = (await api()).mine; expect(mine.start.length === DEFAULT.start.length && mine.start.at(-1).source === 'teacher' && !mine.start.some((q) => q.id === 's4'), 'his copy is saved beside the default'); }
await shot('test-mine');
await page.click('[data-cs-reset]'); await page.click('[data-cs-reset-yes]'); await page.waitForSelector('[data-cs-teststate="default"]');
expect(await page.locator('[data-cs-q]').count() === DEFAULT.start.length && await page.locator('[data-cs-q="s4"]').count() === 1 && (await api()).mine === null, '« استرجع الاختبار الأصلي » brings the default back, whole');

// ══ 4. the test on the board ══
await page.click('[data-cs-begin="start"]'); await page.waitForSelector('[data-cs-play]');
expect((await turnName()).trim() === 'عمر' && (await page.textContent('.cs-turn')).includes('الخوارزمي'), 'the name of the student whose turn it is stands across the top of the board, with his team');
expect(await page.locator('[data-cs-minimap]').count() === 0 && await page.locator('[data-classroom-pointer-layer]').count() === 1, 'the question owns the board: the class is not on it, and a red pointer follows the mouse for the back of the room');
{ const w = await page.evaluate(() => ({ turn: document.querySelector('.cs-turn').getBoundingClientRect().width, q: document.querySelector('.cs-question').getBoundingClientRect().width, win: innerWidth })); expect(w.turn > w.win * 0.9 && w.q > w.win * 0.9, 'the name strip and the question take the whole width'); }
console.log('    text on the board (px): name', await px('.cs-turn strong'), '· question', await px('.cs-question__text'), '· option', await px('.cs-options button, .cs-keys button'));
expect(await px('.cs-question__text') >= 34 && await px('.cs-turn strong') >= 56, 'the board is readable from the last desk of a big class');
await shot('board-question', true);
await answer(true);
expect(await page.getAttribute('[data-cs-said]', 'data-cs-said') === 'right' && (await page.textContent('[data-cs-said] p')) === 'أحسنت يا عمر، بارك الله فيك!', 'a right answer: « أحسنت يا عمر، بارك الله فيك! »');
await shot('board-right', true);
await page.click('[data-cs-next]');
expect((await turnName()).trim() === 'مريم', 'the mouse passes to the next student of the row');
const q2 = await answer(false);
{ const t = await page.textContent('[data-cs-said] p'); expect(await page.getAttribute('[data-cs-said]', 'data-cs-said') === 'miss' && t.includes('مريم') && t.includes('لا تقلقي') && t.includes('يستدركون'), `a miss is met by her name and a sentence that respects her, in the feminine: « ${t} »`); }
expect(await page.locator('.cs-options .is-right, [data-cs-right-number]').count() === 0, 'the right answer is not shown until the teacher decides');
await shot('board-miss', true);
await page.click('[data-cs-reveal]');
expect(await page.locator(q2.kind === 'number' ? '[data-cs-right-number]' : '.cs-options .is-right').count() === 1, '« أظهر الجواب »: the teacher shows it when he wants');
await page.click('[data-cs-next]');
// « أختار أنا »
await page.click('[data-cs-mode="teacher"]');
await page.waitForSelector('[data-cs-class-window]');
expect(await page.locator('.cs-turn strong.is-wait').count() === 1 && await page.locator('.cs-options button:disabled, .cs-keys button:disabled').count() > 0 && await page.locator('[data-cs-seat]').count() === 12, '« أختار أنا »: nobody has the turn, and the class opens by itself as a window in the middle');
await shot('class-window', true);
await page.click('[data-cs-seat="509"]');
expect((await turnName()).trim() === 'رحمة' && await page.locator('[data-cs-class-window]').count() === 0, 'a tap on a desk gives the turn to that student, whatever the order — and the window closes');
await shot('board-teacher-picks', true);
await answer(true); await page.click('[data-cs-next]');
// an absent student, then « اختر لي »
await page.waitForSelector('[data-cs-class-window]'); // « أختار أنا » is still on: the class is open again
await page.click('[data-cs-absent-toggle]'); await page.click('[data-cs-seat="502"]');
expect(await page.locator('[data-cs-seat="502"].is-absent').count() === 1 && await page.locator('[data-cs-class-window]').count() === 1, 'in the class window, « غياب » marks an absent student with one tap');
await page.click('[data-cs-class-close]');
await page.click('[data-cs-mode="fair"]');
{ const cur = (await live()).current; expect(![500, 501, 509, 502].includes(cur), `« اختر لي »: the platform gives the turn to a student who has not spoken yet, never to the absent one (${cur})`); }
await answer(true); await page.click('[data-cs-next]');
await page.click('[data-cs-mode="order"]');
for (let k = 4; k < DEFAULT.start.length; k += 1) { await answer(k < 8); if (k === 5) await shot('board-number-or-choice', true); await page.click('[data-cs-next]'); } // the two questions of the NEW lesson (the last two) are missed
await page.waitForSelector('[data-cs-result]');

// ══ 5. the result and the podium ══
expect(await page.getAttribute('[data-cs-result]', 'data-cs-result') === '7/10', 'the result of the class: 7 of 10');
expect((await page.getAttribute('[data-cs-revise]', 'data-cs-revise')).includes('4am.m1.r01') && (await page.textContent('[data-cs-revise]')).includes('التعرّف على قاسم'), 'the الكفاءات to revise are named by their lesson');
{
  const steps = await page.getAttribute('[data-cs-podium]', 'data-cs-podium');
  expect(steps.split(',').includes('1') && steps.split(',').indexOf('1') === (steps.split(',').includes('2') ? 1 : 0), `the podium: the first in the middle (${steps})`);
  expect(await page.locator('[data-cs-kid]').count() >= 2 && (await page.textContent('[data-cs-podium]')).includes('عمر'), 'the teams stand on it under their names, with their students');
  const drawn = await page.locator('[data-cs-kid]').evaluateAll((els) => Object.fromEntries(els.map((e) => [e.dataset.csKid, e.dataset.csKidDrawn])));
  expect(drawn['500'] === 'figure' && Object.entries(drawn).every(([id, d]) => d === (['500', '501'].includes(id) ? 'figure' : 'medal')), `a student whose gender the teacher set is drawn as the platform’s character; the others get a medal with their initial — nothing is guessed (${JSON.stringify(drawn)})`);
  expect((await page.textContent('.cs-result')).includes('لا يغيّر تقدّم'), 'the screen says the test does not change anyone’s progress');
}
await page.waitForSelector('[data-cs-saved="saved"]');
{
  const p = (await api()).posts[0];
  expect(p.moment === 'start' && p.answers.length === 10 && p.absent.join() === '502' && !JSON.stringify(p).includes('"answer"') && p.answers[2].pickedBy === 'teacher' && p.answers[3].pickedBy === 'fair' && p.answers.every((a) => a.studentId !== 502), 'the session is saved: who answered what, how he was chosen, the absent student — never a right answer');
  expect(/^[0-9a-f]{8}-[0-9a-f]{4}-/.test(p.uuid), 'with an identifier that makes a second sending harmless');
}
await shot('result', true);

// ══ 6. the end of the hour: the test again, and « before / now » ══
await page.click('[data-cs-back]'); await page.waitForSelector('[data-cs-launch]');
expect(await page.locator('[data-cs-recent] li').count() === 1, 'back in the preparation: the session of the start is in « آخر الحصص »');
await page.click('[data-cs-begin="end"]'); await page.waitForSelector('[data-cs-play]');
for (let k = 0; k < DEFAULT.end.length; k += 1) { await answer(true); await page.click('[data-cs-next]'); }
await page.waitForSelector('[data-cs-result]');
expect(await page.getAttribute('[data-cs-gain]', 'data-cs-gain') === `0/2>${DEFAULT.end.length}/${DEFAULT.end.length}`, 'the end test shows what the hour changed on the NEW lesson: at the start 0 of 2, now 8 of 8');
await shot('result-end', true);

// ══ 7. the connection drops: the session waits, nothing is lost ══
await page.click('[data-cs-back]'); await page.evaluate(() => { window.__api.offline = true; });
await page.click('[data-cs-begin="end"]'); await page.waitForSelector('[data-cs-play]');
await page.click('[data-cs-pointer-toggle]'); expect(await page.locator('[data-classroom-pointer-layer]').count() === 0, 'the pointer can be put away');
await page.click('[data-cs-exit]'); await page.waitForSelector('[data-cs-exit-box]'); await shot('exit-ask', true);
await page.click('[data-cs-exit-box] .cs-btn--main');
for (let k = 0; k < DEFAULT.end.length; k += 1) { await answer(true); await page.click('[data-cs-next]'); }
await page.waitForSelector('[data-cs-saved="queued"]');
expect((await page.textContent('[data-cs-saved]')).includes('عند عودة الاتّصال') && await page.evaluate(() => JSON.parse(localStorage.getItem('smarter_class_session_outbox')).length) === 1 && (await api()).posts.length === 2, 'no connection: the session is kept and will be sent by itself — the board shows no error');
await shot('queued', true);

// ══ 8. a BIG class: thirty-five students ══
await page.goto(`${BASE}/enseignant/hissa/qasim-adad-tabii?classe=8`, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-cs-seating]');
{
  const fit = await page.evaluate(() => { const room = document.querySelector('.cs-desks').getBoundingClientRect(); const desks = [...document.querySelectorAll('.cs-desk.is-taken')]; return { n: desks.length, out: desks.filter((d) => { const r = d.getBoundingClientRect(); return r.bottom > room.bottom + 1 || r.top < room.top - 1 || r.height < 24; }).length, teams: document.querySelectorAll('[data-cs-team]').length }; });
  expect(fit.n === 35 && fit.out === 0 && fit.teams === 6, `thirty-five students: every desk is on the map, none cut, none squeezed flat — six lines, six teams (${JSON.stringify(fit)})`);
}
await shot('big-seating');
await page.click('[data-cs-begin="start"]'); await page.waitForSelector('[data-cs-play]');
await shot('big-board', true);
await page.click('[data-cs-class-open]'); await page.waitForSelector('[data-cs-class-window]');
{
  const win = await page.evaluate(() => { const box = document.querySelector('.cs-classwin').getBoundingClientRect(); const z = Number(document.querySelector('.cs-fit').style.zoom || 1); const seats = [...document.querySelectorAll('[data-cs-seat]')]; return { n: seats.length, out: seats.filter((b) => { const r = b.getBoundingClientRect(); return r.bottom > box.bottom + 1 || r.right > box.right + 1 || r.left < box.left - 1 || r.height < 30; }).length, cut: seats.filter((b) => b.scrollWidth > b.clientWidth + 1).length, px: Math.round(parseFloat(getComputedStyle(seats[0]).fontSize) * z) }; });
  expect(win.n === 35 && win.out === 0 && win.px >= 15, `the class window shows the thirty-five desks, each big enough to read and to tap (${JSON.stringify(win)})`);
}
await shot('big-class-window', true);
await page.click('[data-cs-seat="734"]');
expect((await turnName()).trim().length > 0 && (await live()).current === 734, 'the last student of the last line can be given the turn with one tap');

// ══ the memo of this lesson: WRITTEN (not derived), one part at a time, with drawn opening situations ══
await page.goto(`${BASE}/enseignant/cours/qasim-adad-tabii/memoire`, { waitUntil: 'networkidle' }); await page.waitForSelector('[data-board-memo] [data-memo-rail]');
{ const seen = () => page.$$eval('[data-memo-pane]', (els) => els.filter((e) => !e.hidden && e.getBoundingClientRect().height > 0).map((e) => e.getAttribute('data-memo-pane')));
  expect((await seen()).join() === 'glance' && await page.locator('[data-memo-hour] [data-memo-moment]').count() === 4 && (await page.getAttribute('[data-lesson-tool="session"]', 'href')).includes('/enseignant/hissa/') && (await page.getAttribute('[data-lesson-tools]', 'data-lesson-tools-active')) === 'memo' && await page.locator('[data-memo-print]').count() === 1 && !(await page.locator('[data-board-memo]').innerText()).includes('وضع القسم'), 'the memo opens on « الحصّة في صفحة »: the goal, the idea, the trap, the four moments with their minutes, three questions — under one calm top line (the lesson, print, the lesson file, « حصّة القسم »)');
  const one = await page.evaluate(() => document.documentElement.scrollHeight / innerHeight); const px = await page.evaluate(() => { const el = document.querySelector('[data-memo-pane="glance"] p'); return parseFloat(getComputedStyle(el).fontSize) * Number(getComputedStyle(document.querySelector('.sa-memo-stage')).zoom || 1); });
  expect(one <= 2 && px >= 19, `one part is about one screen (${one.toFixed(1)}) and its text is large (${px.toFixed(0)} px)`);
  await shot('memo');
  await page.click('[data-memo-go="openings"]');
  const figs = await page.$$eval('[data-memo-opening]', (els) => els.map((e) => `${e.getAttribute('data-memo-opening')}:${e.getAttribute('data-memo-opening-left')}:${e.querySelector('svg[data-memo-figure]') ? 'drawn' : 'none'}`));
  expect(figs.join() === 'bridge:3:drawn,teams:3:drawn,shelves:20:drawn,tiles:20:drawn' && await page.locator('[data-memo-opening="bridge"] [data-memo-opening-board]').count() === 1, 'four opening situations, each DRAWN from its own numbers; the one of « حصّة القسم » is marked');
  await shot('memo-openings');
  await page.click('[data-memo-go="anticipated"]'); expect(await page.locator('[data-memo-anticipated="miss"]').count() >= 3 && await page.locator('[data-memo-anticipated="right"]').count() >= 1, 'what students will likely say — right answers and misconceptions — each with a question to check and one to push forward');
  await shot('memo-anticipated');
  await page.click('[data-memo-go="exit"]'); expect(await page.locator('[data-memo-exit]').count() === 3 && await page.locator('[data-memo-exit-answer]').count() === 0, 'an exit ticket of three questions, its answers hidden');
  await page.click('[data-memo-exit-show]'); expect(await page.locator('[data-memo-exit-answer]').count() === 3, 'the answers come when he asks');
  await page.click('[data-memo-next]'); expect((await seen()).join() === 'tiers', '« التالي » goes to the next part');
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForSelector('[data-memo-rail]'); expect((await seen()).join() === 'tiers', 'after a reload the memo is on the part he was reading');
  await page.click('[data-memo-go="all"]'); expect((await seen()).length === 9 && await page.locator('[data-board-memo] [data-memo-note-input]').count() === 0, 'the whole memo is still one tap away — and it has no « كرّاسي » block: his notes are « ملفّ الدرس », in the top bar');
  await page.emulateMedia({ media: 'print' }); expect((await seen()).length === 9 && await page.locator('[data-memo-rail]').isHidden(), 'printed, the whole memo comes out, without the rail'); await page.emulateMedia({ media: 'screen' });
  { await page.emulateMedia({ media: 'print' }); const pdf = await page.pdf({ format: 'A4', printBackground: true }); await page.emulateMedia({ media: 'screen' }); const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length; (await import('node:fs')).writeFileSync(`${OUT}/memo.pdf`, pdf);
    expect(pages >= 1 && pages <= 2, `on paper the whole memo is ${pages} A4 page(s): two at most`); } }
expect(errors.length === 0, 'no page error');
await browser.close();
