// « حصّة القسم » of lesson `qisma-iqlidiya-hasr` (2AM) — walk of the LESSON ON THE BOARD (the lesson's own script
// `board/script.js`, its tablets), copied from lesson 3's class-lesson-khawass.mjs (simulated teacher of a 2AM class; the
// API is an in-memory double). The lesson is opened directly from the set-up and ALL 13 stations are played through their
// UI: the situation (a gap of 84 and the plank 12, built), six questions — the RECALL of the first year's division (912,
// planks of two digits), then the LONG planks of three digits (4576: the board works a digit tried too big, then the
// right one), 5475, 644, 1080 and the port's 1872 — each a wrong pick met by the planks the board
// builds, then the plank that fills the gap (computed HERE: the option that divides it) —, five sentences judged on one
// equality (one wrong, then as the arithmetic says), three namings (a reader picked on the seating map, « من يتذكّر؟ »
// hides key words, a tap shows one), the copybook on two pages. On every screen: nothing scrolls, nothing leaves the screen
// or its card, the oral question is never cut, no raw formula, formulas left to right, nothing of another lesson
// (lib/hasr.mjs — words and numbers), no text under 12 px, no button covered, the ✕ reachable.
// The set-up is served the lesson's default class test (content/class-tests/2am/<id>.json) — or `default: null` when the
// file is missing: the board opens alone either way, as a teacher can.
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/class-lesson-hasr.mjs [outDir]
import { chromium } from 'playwright';
import { GL_ARGS } from './lib/gpu.mjs';
import { FOREIGN, FOREIGN_NUMBERS, tinyText } from './lib/walk.mjs';
import { ID, GRADE, HASR_FOREIGN, HASR_FOREIGN_NUMBERS, sentenceTruth } from './lib/hasr.mjs';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

const BASE = process.env.E2E_BASE || 'http://localhost:5173';
const URL_ = `${BASE}/enseignant/hissa/${ID}?classe=7`;
const OUT = process.argv[2] || `${tmpdir()}/class-lesson-hasr`;
const SIZE = (process.env.E2E_SIZE || '1366x768').split('x').map(Number);
mkdirSync(OUT, { recursive: true });
let oks = 0;
const fails = [];
const expect = (cond, msg) => {
  if (!cond) {
    console.log('FAIL', msg);
    fails.push(msg);
    process.exitCode = 1;
    throw new Error(msg);
  }
  oks += 1;
  console.log('ok  ', msg);
};
/** A SOFT check: printed and counted, the walk goes on to see the next screens. */
const check = (cond, msg) => {
  if (!cond) {
    console.log('FAIL', msg);
    fails.push(msg);
    process.exitCode = 1;
    return false;
  }
  oks += 1;
  console.log('ok  ', msg);
  return true;
};
const TEST_FILE = new URL(`../../../content/class-tests/${GRADE}/${ID}.json`, import.meta.url);
const DEFAULT = existsSync(TEST_FILE) ? JSON.parse(readFileSync(TEST_FILE, 'utf8')) : null;
const NAMES = [
  ['عمر', 'بن علي'],
  ['مريم', 'حدّاد'],
  ['ياسين', 'منصوري'],
  ['سلمى', 'بوزيد'],
  ['أنس', 'قاسمي'],
  ['هاجر', 'سعدي'],
  ['إلياس', 'عمراني'],
  ['نور', 'شريف'],
  ['آدم', 'بلقاسم'],
  ['رحمة', 'زروقي'],
  ['يوسف', 'دحماني'],
  ['خديجة', 'مرابط'],
];
const STUDENTS = Array.from({ length: 35 }, (_, i) => ({
  id: 500 + i,
  firstName: NAMES[i % 12][0] + (i >= 12 ? ` ${i}` : ''),
  lastName: NAMES[(i * 5) % 12][1],
  grade: GRADE,
}));
/** The words and numbers of the other lessons (lib/walk.mjs, lib/hasr.mjs): none may be read on this lesson's board. */
const ALIEN_WORDS = [...FOREIGN, ...HASR_FOREIGN, 'جسر بين جزيرتين', 'التعرّف على قاسم'];
const ALIEN_NUMBERS = [...FOREIGN_NUMBERS, ...HASR_FOREIGN_NUMBERS];

const browser = await chromium.launch({ args: GL_ARGS });
const ctx = await browser.newContext({ viewport: { width: SIZE[0], height: SIZE[1] } });
await ctx.addInitScript(
  ([students, def, id, grade]) => {
    localStorage.setItem('token', 'qa-fake-token');
    window.__classFast = true;
    const db = (window.__api = { seating: null, sessions: [], posts: [], evidence: 0 });
    const json = (body, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
    const real = window.fetch.bind(window);
    window.fetch = async (input, init = {}) => {
      const url = typeof input === 'string' ? input : input.url;
      const method = (init.method ?? 'GET').toUpperCase();
      const body = init.body ? JSON.parse(init.body) : null;
      if (!url.includes('/api/')) return real(input, init);
      if (url.includes('/auth/me'))
        return json({
          success: true,
          user: {
            id: 77,
            name: 'الأستاذ',
            firstName: 'كريم',
            lastName: 'أستاذ',
            role: 'teacher',
            roles: ['teacher'],
            email_verified_at: '2026-09-01T00:00:00Z',
            emailVerified: true,
            nameComplete: true,
          },
        });
      if (/learning-evidence|game-evidence|\/answers/.test(url)) {
        db.evidence += 1;
        return json({ success: true });
      }
      if (/\/teacher\/classrooms(\?|$)/.test(url))
        return json({ success: true, classrooms: [{ id: 7, name: '2 م 1', grade, status: 'active' }] });
      if (url.includes('/teacher/classrooms/7/students')) return json({ success: true, students });
      if (url.includes('/teacher/classrooms/7/seating')) {
        if (method === 'PUT') db.seating = body;
        return json({ success: true, seating: db.seating });
      }
      if (url.includes('/teacher/classrooms/7/class-sessions')) {
        if (method === 'POST') {
          db.posts.push(body);
          const s = {
            uuid: body.uuid,
            lessonCode: body.lessonCode,
            moment: body.moment,
            finishedAt: '2026-11-18T09:00:00Z',
            summary: { ...body.summary, right: 0, total: body.answers.length, items: [] },
          };
          db.sessions.unshift(s);
          return json({ success: true, session: s }, 201);
        }
        return json({ success: true, sessions: db.sessions, turns: {} });
      }
      if (url.includes('/teacher/class-tests/'))
        return json({
          success: true,
          lessonCode: id,
          default: def ? { version: def.version, start: def.start, end: def.end, pool: def.pool } : null,
          mine: null,
        });
      return json({ success: true, data: [] });
    };
  },
  [STUDENTS, DEFAULT, ID, GRADE],
);
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => {
  errors.push(e.message);
  console.log('pageerror', e.message);
});
let n = 0;

/** What every screen of the board must hold (lesson 2's layout rules, plus the 12 px floor, covered buttons, the ✕). */
const shot = async (name, wait = 450) => {
  await page.waitForTimeout(wait);
  const bad = await page.evaluate(() => {
    const out = [];
    const root = document.querySelector('.cs-root');
    const name = (el) => `${el.tagName.toLowerCase()}.${el.className?.baseVal ?? el.className}`;
    for (const el of root.querySelectorAll('*')) {
      if (el.closest('svg, .katex')) continue;
      const cs = getComputedStyle(el);
      if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 2) out.push(`scrolls: ${name(el)}`);
      if (
        cs.overflow === 'hidden' &&
        el.closest('.cs-lesson') &&
        !el.matches('.cs-cue span, .cs-bridgebox, .cs-mini button, .cs-bigstep > span') &&
        (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2)
      )
        out.push(`clips its content: ${name(el)}`);
    }
    for (const el of root.querySelectorAll(
      '.cs-lesson__top, .cs-lesson__top > *, .cs-turn, .cs-scene, .cs-rule, .cs-lesson__foot, .cs-lesson__foot > *, .cs-classwin, .cs-play__top, .cs-question, .cs-result__foot',
    )) {
      const r = el.getBoundingClientRect();
      if (r.height > 0 && (r.top < -1 || r.bottom > innerHeight + 1 || r.left < -1 || r.right > innerWidth + 1))
        out.push(`leaves the screen: ${name(el)}`);
    }
    for (const card of root.querySelectorAll(
      '.cs-scene, .cs-rule, .cs-lesson__top, .cs-forge__right, .cs-log, .cs-name__card, .cs-plankcard, .cs-copy article, .cs-stmts li',
    )) {
      const b = card.getBoundingClientRect();
      for (const el of card.querySelectorAll('*')) {
        if (el.closest('svg') && el.tagName !== 'svg') continue;
        const r = el.getBoundingClientRect();
        if (
          r.width > 0 &&
          r.height > 0 &&
          (r.bottom > b.bottom + 2 || r.top < b.top - 2 || r.left < b.left - 2 || r.right > b.right + 2)
        )
          out.push(`out of ${name(card)}: ${name(el)}`);
      }
    }
    const cue = root.querySelector('.cs-cue span');
    if (cue && cue.scrollWidth > cue.clientWidth + 1) out.push('the oral question is cut');
    for (const k of root.querySelectorAll('.cs-scene .katex, .cs-rule .katex'))
      if (k.getClientRects().length > 1) out.push('a formula breaks across two lines');
    if (
      document.documentElement.scrollHeight > innerHeight + 1 ||
      document.documentElement.scrollWidth > innerWidth + 1
    )
      out.push('the page itself scrolls');
    return [...new Set(out)];
  });
  if (bad.length) {
    n += 1;
    await page.screenshot({ path: `${OUT}/${String(n).padStart(2, '0')}-FAIL-${name}.png` });
    console.log('FAIL at «', name, '»:', bad.join(' | '));
    fails.push(`layout at ${name}`);
    process.exitCode = 1;
    throw new Error(`layout at ${name}`);
  }
  // soft: text under 12 px — the rule of every walk (lib/walk.mjs › tinyText: every CSS zoom counted, a drawn formula at
  // the size of its box, the threshold at 12 px) —, a button something covers, the board's ✕ not reachable
  const tiny = await tinyText(page);
  const soft = await page.evaluate(() => {
    const covered = [];
    const root = document.querySelector('.cs-root');
    for (const b of root.querySelectorAll('button')) {
      const r = b.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight) continue;
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if (top && !b.contains(top) && !top.contains(b))
        covered.push(b.textContent.trim().slice(0, 18) || b.getAttribute('aria-label'));
    }
    const x = document.querySelector('[data-cs-lesson-exit]');
    let exit = false;
    if (x) {
      const r = x.getBoundingClientRect();
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      exit =
        r.width > 0 &&
        r.left >= -1 &&
        r.right <= innerWidth + 1 &&
        r.top >= -1 &&
        Boolean(top && (top === x || x.contains(top)));
    }
    return { covered: [...new Set(covered)], exit };
  });
  // the 12 px floor holds at every size (GAME_WORLD.md « 12 px floor »; phones are paused)
  check(tiny.length === 0, `${name}: no text under 12 px${tiny.length ? ' — ' + tiny.slice(0, 6).join(' | ') : ''}`);
  check(
    soft.covered.length === 0,
    `${name}: no button is covered${soft.covered.length ? ' — ' + soft.covered.join(' | ') : ''}`,
  );
  check(soft.exit, `${name}: the board’s ✕ is on screen and a click reaches it`);
  n += 1;
  await page.screenshot({ path: `${OUT}/${String(n).padStart(2, '0')}-${name}.png` });
};
const attr = (sel, a) => page.getAttribute(sel, a);
const text = async (sel) => ((await page.textContent(sel)) ?? '').trim();
const next = () => page.click('[data-cs-lesson-next]');
const stepIs = async (id) => {
  await page.waitForSelector(`[data-cs-lesson-step="${id}"]`);
};

// the tablets of the STUDENT's world (`world/story.js › TABLETS`): the board must read the same wording
const TITLES = {
  'qisma-ay-adad': 'القسمة على أيّ عدد',
  'hasr-hasil': 'حصر حاصل القسمة',
  'inidam-baqi': 'انعدام الباقي',
};
/** Nothing of another lesson, no raw formula, every formula left to right, on the board's screen. */
const clean = async (name) => {
  const t = await page.evaluate(() => document.querySelector('.cs-root').innerText);
  const alien = [
    ...ALIEN_WORDS.filter((x) => t.includes(x)),
    ...ALIEN_NUMBERS.filter((k) => new RegExp(`(^|[^0-9])${k}([^0-9]|$)`).test(t)).map(String),
  ];
  check(
    alien.length === 0,
    `${name}: nothing of another lesson on screen${alien.length ? ' — ' + alien.join(', ') : ''}`,
  );
  check(!/\$|\\[a-zA-Z]{2,}/.test(t), `${name}: no raw formula on screen`);
  const mirrored = await page.evaluate(() => {
    const out = [];
    for (const k of document.querySelectorAll('.cs-root .katex-html')) {
      const atoms = [...k.querySelectorAll('.mord, .mrel, .mbin, .mpunct')]
        .filter((a) => !a.querySelector('.mord, .mrel, .mbin, .mpunct'))
        .map((a) => a.getBoundingClientRect())
        .filter((r) => r.width > 0);
      if (atoms.length < 3) continue;
      const line = atoms.filter((r) => Math.abs(r.top - atoms[0].top) < r.height);
      let back = 0;
      for (let i = 1; i < line.length; i += 1) if (line[i].left < line[i - 1].left - 1) back += 1;
      if (back > line.length / 2)
        out.push((k.parentElement.querySelector('annotation')?.textContent ?? k.textContent).slice(0, 40));
    }
    return out;
  });
  check(
    mirrored.length === 0,
    `${name}: every formula reads left to right${mirrored.length ? ' — ' + mirrored.map((x) => `« ${x} »`).join(' | ') : ''}`,
  );
};
/** An « ask » step: a wrong pick is met by the bridges, the right pick (computed HERE: the option that divides a) by « right ». */
const askStep = async (id, a, options, wrongPick) => {
  await stepIs(id);
  const shown = await page.$$eval('[data-cs-ask-option]', (els) => els.map((e) => Number(e.dataset.csAskOption)));
  expect(
    shown.join() === options.join(),
    `${id}: the options on the board are ${options.join(', ')} (${shown.join(', ')})`,
  );
  const right = options.filter((o) => a % o === 0);
  expect(right.length === 1, `sanity: exactly one plank fills ${a} (${right.join(', ')})`);
  expect(
    !right.includes(wrongPick),
    `sanity: ${wrongPick} does not fill ${a} (${a} = ${wrongPick} × ${Math.floor(a / wrongPick)} + ${a % wrongPick})`,
  );
  await page.click(`[data-cs-ask-option="${wrongPick}"]`);
  await page.click('[data-cs-ask-check]');
  expect(
    (await attr('[data-cs-ask-result]', 'data-cs-ask-result')) === 'look' &&
      (await page.$$('.cs-plankcard .bbar')).length === options.length,
    `${id}: a wrong pick (${wrongPick}) shows the ${options.length} planks built, never « wrong »`,
  );
  await clean(`${id}-look`);
  await shot(`ask-${id}-look`);
  await page.click('[data-cs-ask-again]');
  for (const o of right) await page.click(`[data-cs-ask-option="${o}"]`);
  await page.click('[data-cs-ask-check]');
  expect(
    (await attr('[data-cs-ask-result]', 'data-cs-ask-result')) === 'right' &&
      (await page.$$('.cs-plankcard.is-held')).length === right.length,
    `${id}: exactly the planks that fill ${a} (${right.join(', ')}) are the right answer`,
  );
  await clean(id);
  await shot(`ask-${id}`);
};
/** A « statements » step: five sentences on one equality, each judged — the first one the other way. */
const statementsStep = async (id, a, b) => {
  await stepIs(id);
  const items = await page.$$eval('[data-cs-stmt] strong', (els) => els.map((e) => e.textContent));
  expect(
    items.length === 5 && items.every((t) => sentenceTruth(t) !== null),
    `${id}: five sentences about ${a} and ${b}, each one the arithmetic can judge (${items.join(' | ')})`,
  );
  await clean(`${id}-ask`);
  await shot(`${id}-ask`);
  for (const [k, t] of items.entries()) {
    const truth = sentenceTruth(t);
    const say = k === 0 ? !truth : truth;
    await page.click(`[data-cs-stmt="${k}"] [data-cs-stmt-say="${say}"]`);
    expect(
      (await attr(`[data-cs-stmt="${k}"]`, 'data-cs-stmt-truth')) === String(truth),
      `${id}: « ${t} » is ${truth ? 'true' : 'false'} — the board says it with its equality`,
    );
  }
  expect(
    (await page.$$('[data-cs-stmt-star]')).length === items.length - 1,
    `${id}: a star for each sentence judged as the arithmetic says (the first one was not)`,
  );
  await clean(id);
  await shot(id);
};
const nameStep = async (id, key) => {
  await stepIs(id);
  expect(
    (await attr('[data-cs-name]', 'data-cs-name')) === key && (await text('.cs-scene__head h2')).includes(TITLES[key]),
    `${id}: the rule is named with the student's tablet « ${TITLES[key]} »`,
  );
  await page.click('[data-cs-pick-reader]');
  await page.click('[data-cs-seat="512"]');
  await page.click('[data-cs-recall]');
  const hidden = await page.$$('[data-cs-blank="hidden"]');
  expect(hidden.length >= 1, `${id}: « من يتذكّر؟ » hides key words (${hidden.length})`);
  await hidden[0].click();
  expect((await page.$$('[data-cs-blank="open"]')).length >= 1, `${id}: a tap shows a hidden word`);
  await clean(id);
  await shot(`name-${key}`);
};

try {
  // ══ 1. the lesson is opened alone, from the set-up ══
  // the DOM, then the app's own sign that the set-up is drawn (« networkidle » waited on every dev module: a load flake)
  await page.goto(URL_, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-cs-hour]', { timeout: 60000 });
  expect(
    (await text('[data-cs-open="lesson"] small')).includes('13 محطّة'),
    'the set-up counts the 13 stations of THIS lesson',
  );
  await page.click('[data-cs-open="lesson"]');

  // ══ 2. the situation: the first gap of the world — 84 and the plank 12 ══
  await stepIs('situation');
  expect(
    (await attr('.bb', 'data-bb')) === '84:12' && (await text('[data-cs-cue] span')).length > 10,
    'it opens on a gap of 84, the plank 12 and one oral question',
  );
  await clean('situation');
  await shot('situation');
  await page.click('[data-cs-sit-try]');
  await page.waitForSelector('.cs-sit [data-cs-verdict]');
  expect(
    (await attr('.bb', 'data-bb-planks')) === String(84 / 12) &&
      (await attr('.bb', 'data-bb-left')) === '0' &&
      (await attr('.cs-sit [data-cs-verdict]', 'data-cs-verdict')) === 'held',
    `the board builds ${84 / 12} planks and leaves no cell: it holds`,
  );
  await clean('situation-held');
  await shot('situation-held', 1300);

  // ══ 3. the three keys: questions made for each, proved by bridges, then the name ══
  // the recall: ONE station, a plank of two digits — the first year's division, no name given to it here
  await next();
  await askStep('recall', 912, [17, 24, 35], 17);
  {
    const opts = await page.$$eval('[data-cs-ask-option]', (els) => els.map((e) => e.dataset.csAskOption));
    expect(
      opts.every((o) => o.length === 2) && (await page.$('[data-cs-name]')) === null,
      `recall: its planks have two digits (${opts.join(', ')}) and no rule is named on this station`,
    );
  }
  // what the lesson adds: planks of THREE digits — the board works a digit tried too big, then the right one
  await next();
  await askStep('long', 4576, [208, 248, 365], 248);
  {
    const opts = await page.$$eval('[data-cs-ask-option]', (els) => els.map((e) => e.dataset.csAskOption));
    expect(
      opts.every((o) => o.length === 3),
      `long: every plank has three digits (${opts.join(', ')})`,
    );
    // the walk's own arithmetic: ten planks of 248 leave 2096; 9 more pass it (2232), 8 leave 112
    const left = 4576 - 248 * 10;
    const scene = await text('.cs-scene');
    check(
      scene.includes(String(left)) && scene.includes(String(248 * 9)) && scene.includes(String(left - 248 * 8)),
      `long: the board shows ${left} left, ${248 * 9} = 248 × 9 passing it, then the remainder ${left - 248 * 8} with 8`,
    );
  }
  await next();
  await nameStep('name-1', 'qisma-ay-adad');
  await next();
  await askStep('bracket', 5475, [208, 312, 365], 208);
  await next();
  await askStep('need', 644, [28, 30, 45], 30);
  await next();
  await nameStep('name-2', 'hasr-hasil');
  await next();
  await askStep('exact', 1080, [45, 50, 64], 64);
  await next();
  await statementsStep('sentences', 1080, 45);
  await next();
  await askStep('port', 1872, [130, 156], 130);
  await next();
  await nameStep('name-3', 'inidam-baqi');

  // ══ 4. the copybook: two keys, then the third ══
  const KEYS = Object.keys(TITLES);
  for (const [id, keys] of [
    ['trace-1', KEYS.slice(0, 2)],
    ['trace-2', KEYS.slice(2)],
  ]) {
    await next();
    await stepIs(id);
    expect(
      (await attr('[data-cs-trace]', 'data-cs-trace')) === String(keys.length) &&
        (await page.$$('.cs-copy article')).length === keys.length,
      `${id}: ${keys.length} key(s) of the lesson on this page of the copybook`,
    );
    const heads = await page.$$eval('.cs-copy article h3', (els) => els.map((e) => e.textContent));
    expect(
      heads.every((h, k) => h.includes(TITLES[keys[k]])),
      `${id}: with the same titles as the student’s tablets`,
    );
    await clean(id);
    await shot(id);
  }
  expect((await page.$$('[data-cs-rail]')).length === 13, 'the rail holds the 13 stations');
  check((await text('[data-cs-lesson-next]')).includes('اختبار النهاية'), 'the last station leads to the end test');
  await page.click('[data-cs-rail="1"]');
  await stepIs('recall');
  expect((await page.$('[data-cs-ask]')) !== null, 'every station is one tap away on the rail');
  check(errors.length === 0, `no page error${errors.length ? ' — ' + errors.slice(0, 3).join(' | ') : ''}`);
} catch (e) {
  if (!fails.length || !String(e.message).startsWith(fails.at(-1))) {
    console.log('FAIL', `the walk stopped: ${String(e.message).split('\n')[0]}`);
    fails.push(`stopped: ${String(e.message).split('\n')[0]}`);
  }
  process.exitCode = 1;
}
console.log(
  `\nwalk class-lesson-hasr @ ${SIZE.join('x')}: ${oks} ok, ${fails.length} FAIL — ${n} screenshots in ${OUT}`,
);
if (fails.length) console.log('failed:\n  - ' + fails.join('\n  - '));
await browser.close();
