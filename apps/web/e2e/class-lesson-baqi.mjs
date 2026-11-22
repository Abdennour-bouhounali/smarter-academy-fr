// « حصّة القسم » of lesson `qisma-iqlidiya-baqi` (1AM « القسمة الإقليدية ») — walk of the LESSON ON THE BOARD (the lesson's
// own script `board/script.js`, its tablets), copied from lesson 3's class-lesson-khawass.mjs (simulated teacher of a 1AM
// class; the API is an in-memory double). The lesson is opened directly from the set-up and ALL 14 stations are played
// through their UI: the situation (a gap of 45 and the plank 8, built: 5 planks, 5 cells left), five questions — one per
// key; each a wrong pick met by the planks the board builds, then the right one, computed HERE from the numbers the board
// writes, and THE RIGHT ANSWER IS ALWAYS A BRIDGE THAT HOLDS (the board colours a choice by « it fills the gap ») —
// five namings (a reader picked on the seating map, « من يتذكّر؟ » hides key words, a tap shows one), the copybook on
// three pages. On every screen: nothing scrolls, nothing leaves the screen or its card, the oral question is never cut, no
// raw formula, formulas left to right, nothing of another lesson, no text under 12 px, no button covered, the ✕ reachable.
// NOT RUN since the script was re-asked and its fifth station written (2026-11-19): `node --check` only.
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/class-lesson-baqi.mjs [outDir]
import { chromium } from 'playwright';
import { GL_ARGS } from './lib/gpu.mjs';
import { FOREIGN, FOREIGN_NUMBERS } from './lib/walk.mjs';
import { ID, GRADE, BAQI_FOREIGN, BAQI_FOREIGN_NUMBERS } from './lib/baqi.mjs';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

const BASE = process.env.E2E_BASE || 'http://localhost:5173';
const URL_ = `${BASE}/enseignant/hissa/${ID}?classe=7`;
const OUT = process.argv[2] || `${tmpdir()}/class-lesson-baqi`;
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
// the lesson's default class test (content/class-tests/1am/qisma-iqlidiya-baqi.json), handed to the API double as it is
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
/** The words and numbers of other lessons (lib/walk.mjs, lib/baqi.mjs): none may be read on this lesson's board. */
const ALIEN_WORDS = [...FOREIGN, ...BAQI_FOREIGN, 'التعرّف على قاسم'];
const ALIEN_NUMBERS = [...FOREIGN_NUMBERS, ...BAQI_FOREIGN_NUMBERS];

const browser = await chromium.launch({ args: GL_ARGS });
const ctx = await browser.newContext({ viewport: { width: SIZE[0], height: SIZE[1] } });
await ctx.addInitScript(
  ([students, def, id]) => {
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
        return json({ success: true, classrooms: [{ id: 7, name: '1 م 1', grade: '1am', status: 'active' }] });
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
  [STUDENTS, DEFAULT, ID],
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
  // soft: text under 12 px (every CSS zoom counted), a button something covers, the board's ✕ not reachable
  const soft = await page.evaluate(() => {
    const tiny = [];
    const covered = [];
    const zoomOf = (el) => {
      let z = 1;
      for (let x = el; x && x.nodeType === 1; x = x.parentElement) z *= parseFloat(getComputedStyle(x).zoom) || 1;
      return z;
    };
    const root = document.querySelector('.cs-root');
    const wk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let t = wk.nextNode(); t; t = wk.nextNode()) {
      const p = t.parentElement;
      if (!p || !t.nodeValue.trim() || p.closest('.katex, svg, script, style')) continue;
      const r = p.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1 || r.bottom < 0 || r.top > innerHeight) continue;
      const cs = getComputedStyle(p);
      if (cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
      const px = parseFloat(cs.fontSize) * zoomOf(p);
      if (px < 11.5)
        tiny.push(
          `${p.tagName.toLowerCase()}.${String(p.className).split(' ')[0]} ${px.toFixed(1)}px « ${t.nodeValue.trim().slice(0, 20)} »`,
        );
    }
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
    return { tiny: [...new Set(tiny)], covered: [...new Set(covered)], exit };
  });
  // the 12 px floor holds at every size (GAME_WORLD.md « 12 px floor »; phones are paused)
  check(
    soft.tiny.length === 0,
    `${name}: no text under 12 px${soft.tiny.length ? ' — ' + soft.tiny.slice(0, 6).join(' | ') : ''}`,
  );
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
  'majmuaat-kamila': 'المجموعات الكاملة',
  'baqi-asghar': 'الباقي أصغر من المقسوم عليه',
  'musawat-qisma': 'مساواة القسمة الإقليدية',
  'taqdir-hasil': 'تقدير الحاصل',
  'baqi-fi-masala': 'الباقي في مسألة',
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
/** The text of the board's question card (the numbers the walk computes from). */
const boardText = () => page.evaluate(() => document.querySelector('[data-cs-ask]')?.innerText ?? '');
/**
 * An « ask » step: the options on the board, a wrong pick met by the bridges (never « wrong »), then the right pick —
 * `rightOf(options, text)` computes it HERE from the numbers on the board. `fills` = the options whose bridge holds.
 */
const askStep = async (id, a, options, wrongPick, rightOf) => {
  await stepIs(id);
  const shown = await page.$$eval('[data-cs-ask-option]', (els) => els.map((e) => Number(e.dataset.csAskOption)));
  expect(
    shown.join() === options.join(),
    `${id}: the options on the board are ${options.join(', ')} (${shown.join(', ')})`,
  );
  const right = rightOf(options, await boardText());
  expect(
    right.length >= 1 && !right.includes(wrongPick),
    `${id}: the walk computes the right plank(s) ${right.join(', ')} — not ${wrongPick} (${a} = ${wrongPick} × ${Math.floor(a / wrongPick)} + ${a % wrongPick})`,
  );
  const fills = options.filter((o) => a % o === 0);
  // the board draws a choice green when its plank FILLS the gap: the right answer must be exactly those planks —
  // never a right answer shown as a fallen bridge
  expect(
    right.join() === fills.join(),
    `${id}: the right answer (${right.join(', ')}) is the planks that fill ${a} (${fills.join(', ')})`,
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
      (await page.$$('.cs-plankcard.is-held')).length === fills.length,
    `${id}: ${right.join(', ')} is the right answer; the bridges that hold are those that fill ${a} (${fills.join(', ') || 'none'})`,
  );
  {
    const held = await page.$$eval('.cs-plankcard.is-held', (els) => els.map((e) => Number(e.dataset.csAskOption)));
    const fell = await page.$$eval('.cs-plankcard.is-fell', (els) => els.map((e) => Number(e.dataset.csAskOption)));
    expect(
      held.join() === right.join() && !fell.some((o) => right.includes(o)),
      `${id}: every plank of the right answer is drawn as a bridge that HOLDS (${held.join(', ')}); the others fall (${fell.join(', ')})`,
    );
  }
  await clean(id);
  await shot(`ask-${id}`);
};
/** The first number written before a word in the board's text: « … فبقيت 7 خانات » → 7. */
const numberBefore = (text, word) => Number((text.match(new RegExp(`(\\d+) ${word}`)) ?? [])[1]);
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
    (await text('[data-cs-open="lesson"] small')).includes('14 محطّة'),
    'the set-up counts the 14 stations of THIS lesson',
  );
  await page.click('[data-cs-open="lesson"]');

  // ══ 2. the situation: a gap of 45 and planks of 8 ══
  await stepIs('situation');
  const [SA, SB] = ((await attr('.bb', 'data-bb')) ?? '').split(':').map(Number);
  expect(
    SA === 45 && SB === 8 && (await text('[data-cs-cue] span')).length > 10,
    'it opens on a gap of 45 (island C), the plank 8 and one oral question',
  );
  await clean('situation');
  await shot('situation');
  await page.click('[data-cs-sit-try]');
  await page.waitForSelector('.cs-sit [data-cs-verdict]');
  expect(
    (await attr('.bb', 'data-bb-planks')) === String(Math.floor(SA / SB)) &&
      (await attr('.bb', 'data-bb-left')) === String(SA % SB) &&
      (await attr('.cs-sit [data-cs-verdict]', 'data-cs-verdict')) === (SA % SB === 0 ? 'held' : 'fell'),
    `the board lays ${Math.floor(SA / SB)} full planks and leaves ${SA % SB} cells (${SA} = ${SB} × ${Math.floor(SA / SB)} + ${SA % SB})`,
  );
  await clean('situation-held');
  await shot('situation-built', 1300);

  // ══ 3. the five keys: ONE question made for each, proved by bridges, then the name ══
  // key 1: in 30 cells, the plank that goes in exactly n times and leaves nothing (n is read on the board)
  await next();
  await askStep('count', 30, [4, 6, 7, 8], 4, (opts, t) => {
    const n = numberBefore(t, 'ألواح');
    return opts.filter((o) => 30 % o === 0 && 30 / o === n);
  });
  await next();
  await nameStep('name-1', 'majmuaat-kamila');
  // key 2: planks of 8 leave their longest leftover (7) on 47 cells; one cell more — which plank fills the new gap?
  await next();
  {
    await stepIs('grow');
    const t = await boardText();
    const longest = numberBefore(t, 'خانات فارغة');
    const grown = numberBefore(t, 'خانة، تمامًا');
    expect(
      grown === 48 && longest === 7 && (grown - 1) % 8 === longest,
      `grow: the board says ${longest} cells left on ${grown - 1} with planks of 8, then asks about ${grown} cells`,
    );
  }
  await askStep('grow', 48, [5, 7, 8, 9], 7, (opts) => opts.filter((o) => 48 % o === 0));
  await next();
  await nameStep('name-2', 'baqi-asghar');
  // key 3: 7 planks of 8 and 7 cells left — the gap rebuilt, then the planks that fill it
  await next();
  await askStep('rebuild', 8 * 7 + 7, [6, 7, 8, 9], 8, (opts) => opts.filter((o) => (8 * 7 + 7) % o === 0));
  await next();
  await nameStep('name-3', 'musawat-qisma');
  // key 4: an old bridge of 675 cells — the plank that fills it with a number of planks between t and t + 10
  await next();
  await askStep('scope', 675, [18, 27, 35, 70], 35, (opts, t) => {
    const lo = numberBefore(t, 'و');
    return opts.filter((o) => 675 % o === 0 && 675 / o >= lo && 675 / o < lo + 10);
  });
  await next();
  await nameStep('name-4', 'taqdir-hasil');
  // key 5: the cable-car station — the load with which every cabin is full and nobody is left (the travellers are read
  // on the board); with the story's cabins of 8 the leftover decides: one more cabin
  await next();
  {
    await stepIs('cable');
    const travellers = numberBefore(await boardText(), 'مسافرًا');
    expect(travellers === 78, `cable: the board says ${travellers} travellers`);
  }
  await askStep('cable', 78, [8, 9, 12, 13], 8, (opts) => opts.filter((o) => 78 % o === 0));
  {
    const after = await boardText();
    check(
      after.includes(String(Math.ceil(78 / 8))) && after.includes(String(78 % 8)),
      `cable: once checked, the board reads the leftover of the cabins of 8 — ${78 % 8} travellers left, ${Math.ceil(78 / 8)} cabins needed`,
    );
  }
  await next();
  await nameStep('name-5', 'baqi-fi-masala');

  // ══ 4. the copybook: three pages — two keys, two keys, the fifth ══
  const KEYS = Object.keys(TITLES);
  for (const [pageNo, id, count] of [
    [0, 'trace-1', 2],
    [1, 'trace-2', 2],
    [2, 'trace-3', 1],
  ]) {
    await next();
    await stepIs(id);
    expect(
      (await attr('[data-cs-trace]', 'data-cs-trace')) === String(count) &&
        (await page.$$('.cs-copy article')).length === count,
      `${id}: ${count} key(s) of the lesson on this page of the copybook`,
    );
    const heads = await page.$$eval('.cs-copy article h3', (els) => els.map((e) => e.textContent));
    expect(
      heads.every((h, k) => h.includes(TITLES[KEYS[pageNo * 2 + k]])),
      `${id}: with the same titles as the student’s tablets`,
    );
    await clean(id);
    await shot(id);
  }
  expect((await page.$$('[data-cs-rail]')).length === 14, 'the rail holds the 14 stations');
  expect((await text('[data-cs-lesson-next]')).includes('اختبار النهاية'), 'the last station leads to the end test');
  await page.click('[data-cs-rail="1"]');
  await stepIs('count');
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
  `\nwalk class-lesson-baqi @ ${SIZE.join('x')}: ${oks} ok, ${fails.length} FAIL — ${n} screenshots in ${OUT}`,
);
if (fails.length) console.log('failed:\n  - ' + fails.join('\n  - '));
await browser.close();
