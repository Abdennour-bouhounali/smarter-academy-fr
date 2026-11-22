// « حصّة القسم » of lesson 6 `bahth-pgcd` — walk of the LESSON ON THE BOARD (the lesson's own script `board/script.js`, its
// tablets), copied from lesson 5's class-lesson-tayin.mjs (simulated teacher; the API is an in-memory double). The board's
// frame is proven (.claude/skills/lesson-v2/trusted.md); what is NEW here is walked: 14 stations, asks with ONE right
// answer (tarh, iqlidis), naming stations with formula rows of 30–32 characters, the long chains of baqi and sibaq, bars
// over 1000 cells. The lesson is opened from the set-up and EVERY station is played through its UI, in the order of the
// script (read from the lesson's own module — the question; the right picks are computed HERE: the options that fill a). On every screen: nothing scrolls, nothing leaves
// the screen or its card, the oral question is never cut, no raw formula, formulas left to right, nothing of lessons 1–4,
// no text under 12 px, no button covered, the ✕ reachable; no name of a key is read before its naming station; every card
// says « لوح » (each question is about planks over a stream).
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/class-lesson-bahth.mjs [outDir]
import { chromium } from 'playwright';
import { GL_ARGS } from './lib/gpu.mjs';
import { FOREIGN, FOREIGN_NUMBERS, FLOOR_PX } from './lib/walk.mjs';
import { ID, TITLES, BAHTH_FOREIGN, BAHTH_NUMBERS } from './lib/bahth.mjs';
import { mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

const BASE = process.env.E2E_BASE || 'http://localhost:5173';
const URL_ = `${BASE}/enseignant/hissa/${ID}?classe=7`;
const OUT = process.argv[2] || `${tmpdir()}/class-lesson-bahth`;
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
const DEFAULT = JSON.parse(
  readFileSync(new URL(`../../../content/class-tests/4am/${ID}.json`, import.meta.url), 'utf8'),
);
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
  grade: '4am',
}));
/** The words and numbers of the other lessons of the world (lib/bahth.mjs): none on this board. */
const ALIEN_WORDS = [...FOREIGN, ...BAHTH_FOREIGN, 'جسر بين جزيرتين', 'التعرّف على قاسم'];
const ALIEN_NUMBERS = [...FOREIGN_NUMBERS, ...BAHTH_NUMBERS];

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
        return json({ success: true, classrooms: [{ id: 7, name: '4 م 1', grade: '4am', status: 'active' }] });
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
          default: { version: def.version, start: def.start, end: def.end, pool: def.pool },
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
  // soft: text under 12 px (every CSS zoom counted; the floor of lib/walk.mjs), a button something covers, the board's ✕
  // not reachable
  const soft = await page.evaluate((FLOOR) => {
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
      if (px < FLOOR)
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
  }, FLOOR_PX);
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
const KEYS = Object.keys(TITLES);
/** Nothing of another lesson, no raw formula, every formula left to right, on the board's screen. */
const clean = async (name) => {
  const t = await page.evaluate(() => document.querySelector('.cs-root').innerText);
  const alien = [
    ...ALIEN_WORDS.filter((x) => t.includes(x)),
    ...ALIEN_NUMBERS.filter((k) => new RegExp(`(^|[^0-9])${k}([^0-9]|$)`).test(t)).map(String),
  ];
  check(
    alien.length === 0,
    `${name}: nothing of the other lessons on screen${alien.length ? ' — ' + alien.join(', ') : ''}`,
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
/** Before a key is named on the board, its name is not on the board (« no rule is told »): the names still to come. */
const notYet = async (where, keys) => {
  const t = await page.evaluate(() => document.querySelector('.cs-root').innerText);
  const said = keys.map((k) => TITLES[k]).filter((x) => t.includes(x));
  check(said.length === 0, `${where}: no key is named before its station${said.length ? ' — ' + said.join(', ') : ''}`);
};
/** The words of an « ask »'s cards: the planks' by default; the florist's station speaks of bouquets (its own `words`). */
const PLANK_WORDS = { card: 'لوح', held: 'يثبت', fell: 'ينهار' };
/** What the checked cards say: each card's label, and each verdict with whether its bridge held. */
const cardWords = () =>
  page.$$eval('.cs-plankcard', (els) =>
    els.map((e) => ({
      card: e.querySelector('small')?.textContent.trim(),
      verdict: e.querySelector('em')?.textContent.trim(),
      held: e.classList.contains('is-held'),
    })),
  );
/** An « ask » step: a wrong pick is met by the bridges, the right picks (computed HERE: the options that divide a) by « right ». */
const askStep = async (id, a, options, wrongPick, words = PLANK_WORDS) => {
  await stepIs(id);
  const shown = await page.$$eval('[data-cs-ask-option]', (els) => els.map((e) => Number(e.dataset.csAskOption)));
  expect(
    shown.join() === options.join(),
    `${id}: the options on the board are ${options.join(', ')} (${shown.join(', ')})`,
  );
  const right = options.filter((o) => a % o === 0);
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
  const cards = await cardWords();
  check(
    cards.every((c) => c.card === words.card && c.verdict === (c.held ? words.held : words.fell)),
    `${id}: every card says « ${words.card} » and « ${words.held} » / « ${words.fell} » (${cards.map((c) => `${c.card}: ${c.verdict}`).join(' | ')})`,
  );
  if (words !== PLANK_WORDS)
    expect(
      !(await text('.cs-planks')).includes(PLANK_WORDS.card),
      `${id}: no card speaks of a plank « ${PLANK_WORDS.card} »`,
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

const SCRIPT_MODULE = `/src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/${ID}/board/script.js`;

try {
  // ══ 1. the lesson is opened alone, from the set-up ══
  await page.goto(URL_, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-cs-hour]');
  /** The script as the dev server serves it: the questions (each `a` and its options), never an answer. */
  const steps = await page.evaluate(async (path) => {
    const { SCRIPT } = await import(path);
    return SCRIPT.steps.map((s) => ({
      id: s.id,
      kind: s.kind,
      a: s.a ?? null,
      options: s.options ?? null,
      tablet: s.tablet ?? null,
      tablets: s.tablets ?? null,
    }));
  }, SCRIPT_MODULE);
  expect(
    (await text('[data-cs-open="lesson"] small')).includes(`${steps.length} محطّة`),
    `the set-up counts the ${steps.length} stations of THIS lesson`,
  );
  await page.click('[data-cs-open="lesson"]');
  let named = [];
  for (const [k, s] of steps.entries()) {
    if (k > 0) await next();
    if (s.kind === 'situation') {
      await stepIs(s.id);
      await notYet('situation', KEYS);
      await clean('situation');
      await shot('situation');
      await page.click('[data-cs-sit-try]');
      await page.waitForSelector('.cs-sit [data-cs-verdict]');
      await clean('situation-held');
      await shot('situation-held', 1300);
    } else if (s.kind === 'ask') {
      const right = s.options.filter((o) => s.a % o === 0);
      const wrong = s.options.find((o) => s.a % o !== 0);
      expect(
        right.length >= 1 && wrong != null,
        `${s.id}: ${right.length} right pick(s) among ${s.options.join(', ')} for ${s.a} (computed here)`,
      );
      await askStep(s.id, s.a, s.options, wrong);
      await notYet(
        s.id,
        KEYS.filter((x) => !named.includes(x)),
      );
    } else if (s.kind === 'name') {
      await nameStep(s.id, s.tablet);
      named = [...named, s.tablet];
    } else if (s.kind === 'trace') {
      await stepIs(s.id);
      expect(
        (await attr('[data-cs-trace]', 'data-cs-trace')) === String(s.tablets.length) &&
          (await page.$$('.cs-copy article')).length === s.tablets.length,
        `${s.id}: ${s.tablets.length} key(s) of the lesson on this page of the copybook`,
      );
      const heads = await page.$$eval('.cs-copy article h3', (els) => els.map((e) => e.textContent));
      expect(
        heads.every((h, j) => h.includes(TITLES[s.tablets[j]])),
        `${s.id}: with the same titles as the student’s tablets`,
      );
      await clean(s.id);
      await shot(s.id);
    }
  }
  expect((await page.$$('[data-cs-rail]')).length === steps.length, `the rail holds the ${steps.length} stations`);
  expect((await text('[data-cs-lesson-next]')).includes('اختبار النهاية'), 'the last station leads to the end test');
  check(errors.length === 0, `no page error${errors.length ? ' — ' + errors.slice(0, 3).join(' | ') : ''}`);
} catch (e) {
  if (!fails.length || !String(e.message).startsWith(fails.at(-1))) {
    console.log('FAIL', `the walk stopped: ${String(e.message).split('\n')[0]}`);
    fails.push(`stopped: ${String(e.message).split('\n')[0]}`);
  }
  process.exitCode = 1;
}
console.log(
  `\nwalk class-lesson-bahth @ ${SIZE.join('x')}: ${oks} ok, ${fails.length} FAIL — ${n} screenshots in ${OUT}`,
);
if (fails.length) console.log('failed:\n  - ' + fails.join('\n  - '));
await browser.close();
