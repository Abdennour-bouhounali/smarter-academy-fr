// « Séance en classe » — the LESSON ON THE BOARD (« la leçon au tableau »), driven by the lesson's own `board/script.js` (lessons 5–6's board walks, made
// data; simulated teacher, the API an in-memory double). EVERY station is played through its UI, in the script's order:
//   situation  its bridge built, the verdict computed here (a % b);
//   ask        a wrong pick met by the bridges the board builds (never « wrong »), then the right picks — COMPUTED here:
//              the options that fill `a` — in the step's own `words` (a station not about planks speaks its language, A10);
//   name       the student's tablet title; a reader picked on the seating map; « Qui s’en souvient ? » hides words, a tap shows one;
//   trace      the copybook pages with the student's tablet titles.
// On every screen: nothing scrolls, leaves the screen or its card, the oral question whole, no raw formula, formulas left to
// right, nothing of another lesson, no text under 12 px, no button covered, the ✕ reachable; no key named before its
// naming station (A2). A station kind the library does not play stops the walk (README).
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { GL_ARGS } from '../gpu.mjs';
import { FOREIGN, FOREIGN_NUMBERS, FLOOR_PX } from '../walk.mjs';
import { boardCourt } from './worlds/rootCourts.mjs';
import { eq, write } from './worlds/exact.mjs';
import { WRONG_WORD } from './checks.mjs';

const CONTENT = join(dirname(fileURLToPath(import.meta.url)), '../../../../../content');
const NAMES = [
  ['Louis', 'Martin'],
  ['Emma', 'Bernard'],
  ['Hugo', 'Dubois'],
  ['Léa', 'Thomas'],
  ['Nathan', 'Robert'],
  ['Chloé', 'Richard'],
  ['Gabriel', 'Petit'],
  ['Inès', 'Durand'],
  ['Adam', 'Leroy'],
  ['Jade', 'Moreau'],
  ['Raphaël', 'Simon'],
  ['Manon', 'Laurent'],
];
/** The words of an `ask` step's cards when the step gives none (features/classSession/lessonScripts.js › ASK_WORDS). */
const PLANK_WORDS = { card: 'Planche', held: 'Tient', fell: 'S’effondre' };

const isPrimeN = (n) => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
};

/**
 * The board's `ladder` station (`features/classSession/LadderStation.jsx`, first French lesson): ONE gap broken plank by
 * plank, the class proposing, the board laying. Played with the walk's own arithmetic:
 *   a rack: the smallest plank of the rack that fills what is left, each time; on the FIRST ladder station a plank that
 *     leaves cells falls first (its division beside it), one plank is taken back (« Retirer la dernière planche »), and once
 *     the gap is 1 case « Une autre échelle » lays the longest planks that fill, the first ladder kept beside it;
 *     a gap no plank of the rack fills (a prime beyond the rack): « Tout le fossé » (`whole`);
 *   a sheet: the first line whose remainder is 0 (every remainder of the sheet checked against the walk's own), and when no
 *     remainder is 0, « Aucun reste nul »; on the first sheet a line that is not 0 first.
 * The gap shown after every plank, the product at the end, the proof (`after`).
 */
async function boardLadder({ page, check, expect, shot, clean, attr, step: s, first }) {
  const gapNow = async () => Number(await attr('[data-cs-ladder-gap]', 'data-cs-ladder-gap'));
  const lay = async (sel, want) => {
    await page.click(sel);
    await page.waitForTimeout(250);
    const g = await gapNow();
    check(g === want, `${s.id}: the gap is now ${want} cases (the board: ${g})`);
  };
  expect((await gapNow()) === s.n, `${s.id}: the ladder opens on the gap of ${s.n} cases`);
  await clean(`${s.id}-start`);
  await shot(`ladder-${s.id}-start`);
  const run = async ({ longest = false, wrong = false, undo = false } = {}) => {
    let gap = s.n;
    let fell = !wrong;
    let undone = !undo;
    let planks = [];
    for (let guard = 0; guard < 40 && gap > 1; guard += 1) {
      if (s.sheet) {
        const lines = await page.$$eval('[data-cs-ladder-line]', (els) =>
          els.map((e) => [Number(e.dataset.csLadderLine), Number(e.dataset.csLadderR)]),
        );
        const want = [];
        for (let p = 2; p * p <= gap; p += 1) if (isPrimeN(p)) want.push(p);
        check(
          lines.map((l) => l[0]).join() === want.join() && lines.every(([p, r]) => r === gap % p),
          `${s.id}: the sheet of ${gap} — the primes ${want[0] ?? '—'} … ${want.at(-1) ?? '—'} and every remainder, computed here`,
        );
        // every line of the sheet whole and apart (2026-11-23: eight lines a column wrote them over one another)
        const crowded = await page.$$eval('[data-cs-ladder-line]', (els) => {
          const rs = els.map((e) => ({ p: e.dataset.csLadderLine, r: e.getBoundingClientRect(), h: e.scrollHeight }));
          const out = [];
          for (const x of rs)
            if (x.r.height < 24 || x.h > x.r.height + 2) out.push(`line ${x.p} is ${Math.round(x.r.height)} px high`);
          for (let i = 0; i < rs.length; i += 1)
            for (let j = i + 1; j < rs.length; j += 1) {
              const [a, b] = [rs[i].r, rs[j].r];
              if (
                Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
                Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1
              )
                out.push(`lines ${rs[i].p} / ${rs[j].p} overlap`);
            }
          return out;
        });
        check(
          crowded.length === 0,
          `${s.id}: the ${lines.length} lines of the sheet of ${gap} stand whole and apart${crowded.length ? ' — ' + crowded.slice(0, 4).join(' | ') : ''}`,
        );
        const zero = want.find((p) => gap % p === 0);
        if (!fell && zero != null) {
          const miss = want.find((p) => gap % p !== 0);
          await page.click(`[data-cs-ladder-line="${miss}"]`);
          await page.waitForTimeout(250);
          check(
            (await gapNow()) === gap && (await attr('[data-cs-ladder-last]', 'data-cs-ladder-last')) === 'fell',
            `${s.id}: line ${miss} shows ${gap % miss}: nothing laid, its division written`,
          );
          await page.click('[data-cs-ladder-nozero]');
          await page.waitForTimeout(250);
          check(
            (await gapNow()) === gap && (await page.$$('.cs-ladder__line.is-zero')).length >= 1,
            `${s.id}: « Aucun reste nul » on ${gap}: the lines whose remainder IS 0 are marked, nothing laid`,
          );
          await clean(`${s.id}-nozero`);
          await shot(`ladder-${s.id}-not-yet`);
          fell = true;
        }
        if (want.length >= 8 && !planks.length) await shot(`ladder-${s.id}-sheet-${gap}`);
        if (zero == null) {
          await lay('[data-cs-ladder-nozero]', 1);
          planks = [...planks, gap];
          gap = 1;
        } else {
          await lay(`[data-cs-ladder-line="${zero}"]`, gap / zero);
          planks = [...planks, zero];
          gap /= zero;
        }
        continue;
      }
      const rack = await page.$$eval('[data-cs-ladder-plank]', (els) => els.map((e) => e.dataset.csLadderPlank));
      const nums = rack.filter((x) => x !== 'whole').map(Number);
      const fit = nums.filter((d) => d <= gap && gap % d === 0);
      if (!fell) {
        const miss = nums.find((d) => d <= gap && gap % d !== 0);
        if (miss != null) {
          await page.click(`[data-cs-ladder-plank="${miss}"]`);
          await page.waitForTimeout(250);
          check(
            (await gapNow()) === gap && (await attr('[data-cs-ladder-last]', 'data-cs-ladder-last')) === 'fell',
            `${s.id}: ${gap} = ${miss} × ${Math.floor(gap / miss)} + ${gap % miss} — the plank of ${miss} falls, the gap stays ${gap}`,
          );
          await clean(`${s.id}-fell`);
          await shot(`ladder-${s.id}-fell-${miss}`);
        }
        fell = true;
      }
      if (!fit.length) {
        expect(
          rack.includes('whole') && isPrimeN(gap),
          `${s.id}: no plank of the rack fills ${gap} — ${gap} is prime: « Tout le fossé »`,
        );
        await lay('[data-cs-ladder-plank="whole"]', 1);
        planks = [...planks, gap];
        gap = 1;
        continue;
      }
      const d = longest ? Math.max(...fit) : Math.min(...fit);
      await lay(`[data-cs-ladder-plank="${d}"]`, gap / d);
      planks = [...planks, d];
      gap /= d;
      if (!undone && planks.length === 2) {
        await page.click('[data-cs-ladder-undo]');
        await page.waitForTimeout(250);
        check((await gapNow()) === gap * d, `${s.id}: the last plank taken back — the gap is ${gap * d} again`);
        gap *= d;
        planks = planks.slice(0, -1);
        undone = true;
      }
    }
    expect((await attr('[data-cs-ladder]', 'data-cs-ladder-done')) === 'true', `${s.id}: the gap is down to 1 case`);
    const product = planks.reduce((p, x) => p * x, 1);
    check(product === s.n, `${s.id}: ${s.n} = ${planks.join(' × ')} — computed here`);
    // under a finished ladder of the rack (not grouped): the planks of its row still laid in shorter planks, computed
    // here — never its last rung « 4 = 4 × 1 » (2026-11-23)
    if (!s.group && !s.sheet) {
      const composite = [...new Set(planks)].filter((p) => !isPrimeN(p)).sort((x, y) => x - y);
      const shown = await attr('[data-cs-ladder-breaks]', 'data-cs-ladder-breaks');
      check(
        shown === composite.join(','),
        `${s.id}: under the finished ladder, the planks laid in shorter planks: ${composite.join(', ') || 'none'} (« ${shown} »)`,
      );
    }
    return planks;
  };
  const planks = await run({ wrong: first || Boolean(s.sheet), undo: first && !s.sheet });
  check(
    (await page.$$('[data-cs-ladder-after]')).length === 1 && (await page.$$('[data-cs-ladder-product]')).length === 1,
    `${s.id}: the row written as one product, then the board's proof`,
  );
  if (s.group) {
    const groups = await page.$$eval('[data-cs-ladder-group]', (els) => els.map((e) => e.dataset.csLadderGroup));
    const want = [...new Set(planks)].sort((x, y) => x - y).map((p) => `${p}:${planks.filter((x) => x === p).length}`);
    check(
      groups.join() === want.join(),
      `${s.id}: the row counted plank by plank: ${want.join(', ')} (${groups.join(', ')})`,
    );
  }
  await clean(s.id);
  await shot(`ladder-${s.id}`);
  if (first && !s.sheet) {
    await page.click('[data-cs-ladder-another]');
    await page.waitForTimeout(250);
    expect((await gapNow()) === s.n, `${s.id}: « Une autre échelle » starts again on ${s.n}`);
    await run({ longest: true });
    check(
      (await attr('[data-cs-ladder-earlier]', 'data-cs-ladder-earlier')) === '1',
      `${s.id}: the first ladder is kept beside the second`,
    );
    await clean(`${s.id}-another`);
    await shot(`ladder-${s.id}-another`);
  }
}

export async function boardWalk(L, D, opts) {
  const BASE = process.env.E2E_BASE || 'http://localhost:5173';
  const URL_ = `${BASE}/enseignant/seance/${L.id}?classe=7`;
  const OUT =
    process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : `${tmpdir()}/lesson-${L.id}-board`;
  const SIZE = (process.env.E2E_SIZE || '1366x768').split('x').map(Number);
  mkdirSync(OUT, { recursive: true });
  const t0 = Date.now();
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
  const DEFAULT = JSON.parse(readFileSync(join(CONTENT, 'class-tests', L.grade, `${L.id}.json`), 'utf8'));
  const STUDENTS = Array.from({ length: 35 }, (_, i) => ({
    id: 500 + i,
    firstName: NAMES[i % 12][0] + (i >= 12 ? ` ${i}` : ''),
    lastName: NAMES[(i * 5) % 12][1],
    grade: L.grade,
  }));
  // (the Algerian walk added two titles of its pilot lesson by hand; no French lesson exists yet to name)
  const ALIEN_WORDS = [...new Set([...FOREIGN, ...(opts.foreign ?? [])])];
  const ALIEN_NUMBERS = [...new Set([...FOREIGN_NUMBERS, ...(opts.foreignNumbers ?? [])])];
  const TITLES = Object.fromEntries(L.lesson.keys.map((k) => [k, L.lesson.rules[k].title]));
  const KEYS = L.lesson.keys;

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
              name: 'Claire Durand',
              firstName: 'Claire',
              lastName: 'Durand',
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
          return json({ success: true, classrooms: [{ id: 7, name: `${grade} B`, grade, status: 'active' }] });
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
    [STUDENTS, DEFAULT, L.id, L.grade],
  );
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => {
    errors.push(e.message);
    console.log('pageerror', e.message);
  });
  // a console.error of the app (a React warning) counts as a page error
  page.on('console', (m) => {
    if (m.type() === 'error' && !/favicon|fonts|ERR_|Failed to load resource/.test(m.text())) {
      errors.push(`console.error: ${m.text().slice(0, 160)}`);
      console.log('console.error', m.text().slice(0, 300));
    }
  });
  let n = 0;

  /** What every screen of the board must hold (the board walks' layout rules, the 12 px floor, covered buttons, the ✕). */
  /** `exit`: the screen's own ✕ — the board's (`[data-cs-lesson-exit]`), or the test's (`[data-cs-exit]`, SessionPlay). */
  const shot = async (name, wait = 450, exitSel = '[data-cs-lesson-exit]') => {
    await page.waitForTimeout(wait);
    const bad = await page.evaluate(() => {
      const out = [];
      const root = document.querySelector('.cs-root');
      const nm = (el) => `${el.tagName.toLowerCase()}.${el.className?.baseVal ?? el.className}`;
      for (const el of root.querySelectorAll('*')) {
        if (el.closest('svg, .katex')) continue;
        const cs = getComputedStyle(el);
        if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 2) out.push(`scrolls: ${nm(el)}`);
        if (
          cs.overflow === 'hidden' &&
          el.closest('.cs-lesson') &&
          !el.matches('.cs-cue span, .cs-bridgebox, .cs-mini button, .cs-bigstep > span') &&
          (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2)
        )
          out.push(`clips its content: ${nm(el)}`);
      }
      for (const el of root.querySelectorAll(
        '.cs-lesson__top, .cs-lesson__top > *, .cs-turn, .cs-scene, .cs-rule, .cs-lesson__foot, .cs-lesson__foot > *, .cs-classwin, .cs-play__top, .cs-question, .cs-result__foot',
      )) {
        const r = el.getBoundingClientRect();
        if (r.height > 0 && (r.top < -1 || r.bottom > innerHeight + 1 || r.left < -1 || r.right > innerWidth + 1))
          out.push(`leaves the screen: ${nm(el)}`);
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
            out.push(`out of ${nm(card)}: ${nm(el)}`);
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
    check(
      bad.length === 0,
      `${name}: nothing scrolls, leaves the screen or its card, the oral question whole${bad.length ? ' — ' + bad.join(' | ') : ''}`,
    );
    const soft = await page.evaluate(
      ([FLOOR, EXIT]) => {
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
        const x = document.querySelector(EXIT);
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
      },
      [FLOOR_PX, exitSel],
    );
    check(
      soft.tiny.length === 0,
      `${name}: no text under 12 px${soft.tiny.length ? ' — ' + soft.tiny.slice(0, 6).join(' | ') : ''}`,
    );
    check(
      soft.covered.length === 0,
      `${name}: no button is covered${soft.covered.length ? ' — ' + soft.covered.join(' | ') : ''}`,
    );
    check(soft.exit, `${name}: the screen's ✕ (${exitSel}) is on screen and a click reaches it`);
    n += 1;
    await page.screenshot({ path: `${OUT}/${String(n).padStart(2, '0')}-${name}.png` });
  };
  const attr = (sel, a) => page.getAttribute(sel, a);
  const text = async (sel) => ((await page.textContent(sel)) ?? '').trim();
  const stepIs = (id) => page.waitForSelector(`[data-cs-lesson-step="${id}"]`);
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
  const notYet = async (where, keys) => {
    const t = await page.evaluate(() => document.querySelector('.cs-root').innerText);
    const said = keys.map((k) => TITLES[k]).filter((x) => t.includes(x));
    check(
      said.length === 0,
      `${where}: no key is named before its station${said.length ? ' — ' + said.join(', ') : ''}`,
    );
  };
  const cardWords = () =>
    page.$$eval('.cs-plankcard', (els) =>
      els.map((e) => ({
        card: e.querySelector('small')?.textContent.trim(),
        verdict: e.querySelector('em')?.textContent.trim(),
        held: e.classList.contains('is-held'),
      })),
    );

  try {
    await page.goto(URL_, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-cs-hour]');
    const steps = L.script.steps;
    expect(
      // « 6 étapes : on essaie, on conclut, on nomme » (ClassSessionPage.jsx › stations; any space before the noun)
      new RegExp(`(^|[^0-9])${steps.length}\\s+étapes?\\b`).test(await text('[data-cs-open="lesson"] small')),
      `the set-up counts the ${steps.length} stations of THIS lesson`,
    );
    await page.click('[data-cs-open="lesson"]');
    let named = [];
    let ladderSeen = false;
    for (const [k, s] of steps.entries()) {
      if (k > 0) await page.click('[data-cs-lesson-next]');
      await stepIs(s.id);
      const still = KEYS.filter((x) => !named.includes(x));
      if (D.steps?.[`board:${s.id}`]) {
        console.log(`NOTE  the lesson's own step « board:${s.id} »`);
        await D.steps[`board:${s.id}`]({ page, check, expect, shot, clean, step: s });
      } else if (s.kind === 'situation') {
        await notYet('situation', still);
        await clean('situation');
        await shot('situation');
        await page.click('[data-cs-sit-try]');
        await page.waitForSelector('.cs-sit [data-cs-verdict]');
        if (s.bridge) {
          const { a, b } = s.bridge;
          await page.waitForTimeout(1200);
          check(
            (await attr('.bb', 'data-bb')) === `${a}:${b}` &&
              (await attr('.cs-sit [data-cs-verdict]', 'data-cs-verdict')) === (a % b === 0 ? 'held' : 'fell'),
            `situation: the board builds ${a} with planks of ${b}: it ${a % b === 0 ? 'holds' : 'falls'} (${a} = ${b} × ${Math.floor(a / b)} + ${a % b}) — computed here`,
          );
        }
        await clean('situation-held');
        await shot('situation-held', 900);
      } else if (s.kind === 'ask' && s.figure) {
        // a station that carries its FIGURE (the pyramids world's board first): its cards are lengths, the one asked is
        // computed by the descriptor from the lengths the figure writes; « On vérifie sur la figure » proves it — no bridge drawn
        const judge = D.board?.[s.id];
        expect(judge, `${s.id}: the descriptor computes the length this figure asks (board.${s.id})`);
        const want = judge(s);
        const right = s.options.filter((o) => eq(String(o), want));
        const wrong = s.options.find((o) => !eq(String(o), want));
        expect(
          right.length === 1 && wrong != null,
          `${s.id}: ONE card is the length asked, ${write(want)} — computed here from the figure's lengths (${s.options.join(', ')})`,
        );
        const shown = await page.$$eval('[data-cs-ask-option]', (els) => els.map((e) => Number(e.dataset.csAskOption)));
        expect(shown.join() === s.options.join(), `${s.id}: the cards on the board are ${s.options.join(', ')}`);
        await notYet(`${s.id}, before its check`, still);
        check(
          (await page.locator('[data-cs-figure]').count()) === 1,
          `${s.id}: the station draws its figure (${await page.getAttribute('[data-cs-figure]', 'data-cs-figure').catch(() => 'none')})`,
        );
        await clean(`${s.id}-open`);
        await shot(`ask-${s.id}-open`);
        await page.click(`[data-cs-ask-option="${wrong}"]`);
        check(
          ((await text('[data-cs-ask-check]')) ?? '').includes('On vérifie sur la figure'),
          `${s.id}: one card picked, « On vérifie sur la figure »`,
        );
        await page.click('[data-cs-ask-check]');
        expect(
          (await attr('[data-cs-ask-result]', 'data-cs-ask-result')) === 'look' &&
            (await page.$$('.cs-plankcard .bbar')).length === 0,
          `${s.id}: a wrong card (${wrong}) is answered by the figure's proof, never « wrong », no bridge drawn`,
        );
        const said = (await text('[data-cs-ask-result]')) ?? '';
        check(!WRONG_WORD.test(said), `${s.id}: the proof never says « wrong »`);
        await clean(`${s.id}-look`);
        await shot(`ask-${s.id}-look`);
        await page.click('[data-cs-ask-again]');
        await page.click(`[data-cs-ask-option="${right[0]}"]`);
        await page.click('[data-cs-ask-check]');
        expect(
          (await attr('[data-cs-ask-result]', 'data-cs-ask-result')) === 'right' &&
            (await page.$$('.cs-plankcard.is-held')).length === 1,
          `${s.id}: the card ${right[0]} is the right answer`,
        );
        await notYet(s.id, still);
        await clean(s.id);
        await shot(`ask-${s.id}`);
      } else if (s.kind === 'ask') {
        const words = { ...PLANK_WORDS, ...s.words };
        const right = s.options.filter((o) => s.a % o === 0);
        const wrong = s.options.find((o) => s.a % o !== 0);
        expect(
          right.length >= 1 && wrong != null,
          `${s.id}: ${right.length} right pick(s) among ${s.options.join(', ')} for ${s.a} (computed here)`,
        );
        const shown = await page.$$eval('[data-cs-ask-option]', (els) => els.map((e) => Number(e.dataset.csAskOption)));
        expect(shown.join() === s.options.join(), `${s.id}: the options on the board are ${s.options.join(', ')}`);
        await page.click(`[data-cs-ask-option="${wrong}"]`);
        await page.click('[data-cs-ask-check]');
        expect(
          (await attr('[data-cs-ask-result]', 'data-cs-ask-result')) === 'look' &&
            (await page.$$('.cs-plankcard .bbar')).length === s.options.length,
          `${s.id}: a wrong pick (${wrong}) shows the ${s.options.length} cards built, never « wrong »`,
        );
        const cards = await cardWords();
        check(
          cards.every((c) => c.card === words.card && c.verdict === (c.held ? words.held : words.fell)) &&
            cards.every((c, j) => c.held === (s.a % s.options[j] === 0)),
          `${s.id}: every card says « ${words.card} » and « ${words.held} » / « ${words.fell} », and holds exactly when it fills ${s.a}`,
        );
        if (s.words?.card && s.words.card !== PLANK_WORDS.card)
          check(!(await text('.cs-planks')).includes(PLANK_WORDS.card), `${s.id}: no card speaks of a plank (A10)`);
        await clean(`${s.id}-look`);
        await shot(`ask-${s.id}-look`);
        await page.click('[data-cs-ask-again]');
        for (const o of right) await page.click(`[data-cs-ask-option="${o}"]`);
        await page.click('[data-cs-ask-check]');
        expect(
          (await attr('[data-cs-ask-result]', 'data-cs-ask-result')) === 'right' &&
            (await page.$$('.cs-plankcard.is-held')).length === right.length,
          `${s.id}: exactly the options that fill ${s.a} (${right.join(', ')}) are the right answer`,
        );
        await notYet(s.id, still);
        await clean(s.id);
        await shot(`ask-${s.id}`);
      } else if (s.kind === 'name') {
        await notYet(
          `${s.id}, before its name`,
          still.filter((x) => x !== s.tablet),
        );
        expect(
          (await attr('[data-cs-name]', 'data-cs-name')) === s.tablet &&
            (await text('.cs-scene__head h2')).includes(TITLES[s.tablet]),
          `${s.id}: the rule is named with the student's tablet « ${TITLES[s.tablet]} »`,
        );
        await page.click('[data-cs-pick-reader]');
        await page.click('[data-cs-seat="512"]');
        await page.click('[data-cs-recall]');
        const hidden = await page.$$('[data-cs-blank="hidden"]');
        expect(
          hidden.length >= Math.min(1, (s.recall ?? []).length),
          `${s.id}: « Qui s’en souvient ? » hides key words (${hidden.length})`,
        );
        if (hidden.length) {
          await hidden[0].click();
          expect((await page.$$('[data-cs-blank="open"]')).length >= 1, `${s.id}: a tap shows a hidden word`);
        }
        await clean(s.id);
        await shot(`name-${s.tablet}`);
        named = [...named, s.tablet];
      } else if (s.kind === 'trace') {
        expect(
          (await attr('[data-cs-trace]', 'data-cs-trace')) === String(s.tablets.length) &&
            (await page.$$('.cs-copy article')).length === s.tablets.length,
          `${s.id}: ${s.tablets.length} key(s) of the lesson on this page of the copybook`,
        );
        const heads = await page.$$eval('.cs-copy article h3', (els) => els.map((e) => e.textContent));
        expect(
          heads.every((h, j) => h.includes(TITLES[s.tablets[j]])),
          `${s.id}: with the same titles as the student's tablets`,
        );
        await clean(s.id);
        await shot(s.id);
      } else if (s.kind === 'ladder') {
        // a FACTOR LADDER (first French lesson, `LadderStation.jsx`): every plank laid is computed here
        await notYet(`${s.id}, before its name`, still);
        await boardLadder({ page, check, expect, shot, clean, attr, step: s, first: !ladderSeen });
        ladderSeen = true;
        await notYet(s.id, still);
      } else if (s.kind === 'court') {
        // « Le palais des dalles »: a court and its rods (worlds/rootCourts.mjs › boardCourt)
        await notYet(`${s.id}, before its name`, still);
        await boardCourt({ page, check, expect, shot, clean, step: s });
        await notYet(s.id, still);
      } else {
        expect(
          false,
          `station ${s.id} (${s.kind}) has no player in the library: a descriptor step \`board:${s.id}\` or a handler in lib/lessonWalk/board.mjs`,
        );
      }
    }
    expect((await page.$$('[data-cs-rail]')).length === steps.length, `the rail holds the ${steps.length} stations`);
    expect(
      (await attr('[data-cs-lesson-next]', 'data-cs-lesson-next')) === 'end' &&
        (await text('[data-cs-lesson-next]')).includes('Test de fin'),
      'the last station leads to the end test (« Test de fin »)',
    );

    // ══ « Test de fin »: the lesson's class test on the board (SessionPlay.jsx) ══
    // The answer of each question is read from the page's dev hook (`window.__classSession.q`), as the Algerian
    // class-session walk did: a class test's keys are the lesson's own content, every one re-computed by its
    // `board/board.test.js` — the walk checks that the board TAKES the right one and meets a wrong one with a sentence.
    if (DEFAULT.end?.length) {
      await page.click('[data-cs-lesson-next]');
      await page.waitForSelector('[data-cs-play]', { timeout: 15000 });
      const live = () => page.evaluate(() => window.__classSession);
      const kinds = new Set();
      let right = 0;
      for (let k = 0; k < DEFAULT.end.length; k += 1) {
        const { q } = await live();
        const good = k !== 1; // the second question is missed on purpose
        if (!kinds.has(q.kind)) {
          kinds.add(q.kind);
          await clean(`end test, question ${k + 1}`);
          await shot(`end-test-q${k + 1}-${q.kind}`, 450, '[data-cs-exit]');
        }
        if (q.kind === 'choice')
          await page.click(`[data-cs-option="${good ? q.answer : (q.answer + 1) % q.options.length}"]`);
        else if (q.kind === 'truefalse') await page.click(`[data-cs-option="${String(good ? q.answer : !q.answer)}"]`);
        else {
          for (const d of String(good ? q.answer : Number(q.answer) + 1)) await page.click(`[data-cs-key="${d}"]`);
          await page.click('[data-cs-key="ok"]');
        }
        await page.waitForSelector('[data-cs-said]');
        const said = await attr('[data-cs-said]', 'data-cs-said');
        check(
          said === (good ? 'right' : 'miss'),
          `end test, question ${k + 1} (${q.kind}): ${good ? 'the right answer is taken' : 'a wrong answer is met by a sentence'} (${said})`,
        );
        if (!good) {
          check(
            !/\bfau(?:x|sse)\b/i.test((await text('[data-cs-said] p')) ?? ''),
            'end test: the miss is never called « faux »',
          );
          if (await page.locator('[data-cs-reveal]').count()) await page.click('[data-cs-reveal]');
          await clean('end test, a miss');
          await shot(`end-test-q${k + 1}-miss`, 450, '[data-cs-exit]');
        }
        if (good) right += 1;
        await page.click('[data-cs-next]');
      }
      await page.waitForSelector('[data-cs-result]', { timeout: 10000 });
      const res = await attr('[data-cs-result]', 'data-cs-result');
      check(
        res === `${right}/${DEFAULT.end.length}`,
        `the end test's result: ${right} of ${DEFAULT.end.length} (${res})`,
      );
      await clean('end test, the result');
      await shot('end-test-result', 450, '[data-cs-close], [data-cs-back], [data-cs-exit]');
    }
    check(errors.length === 0, `no page error${errors.length ? ' — ' + errors.slice(0, 3).join(' | ') : ''}`);

    // ══ « La fiche du professeur »: the lesson's written memo (BoardMemo.jsx), every part ══
    if (L.memo) {
      await page.goto(`${BASE}/enseignant/cours/${L.id}/memoire`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[data-board-memo]', { timeout: 30000 });
      await page.waitForTimeout(800);
      const parts = await page.$$eval('[data-memo-go]', (els) => els.map((e) => e.dataset.memoGo));
      expect(parts.length >= 2, `the teacher's memo opens with its parts (${parts.join(', ')})`);
      // the teacher's shell (every page of his space): each door's name inside its door, on two lines at most; the
      // lesson's title on ONE line, inside the window (2026-11-23: French names ran out of an 80 px rail, the title
      // stood on four lines beside the tabs)
      const shell = await page.evaluate(() => {
        const bad = [];
        for (const d of document.querySelectorAll('[data-workspace-rail] [data-door]')) {
          const r = d.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(d);
          const g = range.getBoundingClientRect();
          const label = d.querySelector('span:last-child') ?? d;
          const lines = Math.round(
            label.getBoundingClientRect().height / (parseFloat(getComputedStyle(label).lineHeight) || 16),
          );
          if (g.left < r.left - 0.5 || g.right > r.right + 0.5)
            bad.push(`door « ${d.textContent.trim()} » runs out of its door`);
          if (lines > 2) bad.push(`door « ${d.textContent.trim()} » on ${lines} lines`);
        }
        const t = document.querySelector('.ltb__title strong');
        if (t) {
          const r = t.getBoundingClientRect();
          const lh = parseFloat(getComputedStyle(t).lineHeight) || 20;
          if (r.height > lh * 1.5) bad.push(`the lesson's title on ${Math.round(r.height / lh)} lines`);
          if (r.right > window.innerWidth + 1 || r.width < 120)
            bad.push(`the lesson's title squeezed (${Math.round(r.width)} px)`);
        }
        return bad;
      });
      check(
        shell.length === 0,
        `the teacher's shell: each door's name inside its door, the lesson's title on one line${shell.length ? ' — ' + shell.join(' | ') : ''}`,
      );
      for (const part of parts) {
        await page.click(`[data-memo-go="${part}"]`);
        await page.waitForTimeout(400);
        const t = await page.evaluate(() => {
          const root = document.querySelector('[data-board-memo]');
          let text = '';
          const tiny = [];
          const wk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
          for (let x = wk.nextNode(); x; x = wk.nextNode()) {
            const p = x.parentElement;
            if (!p || p.closest('.katex-mathml, script, style') || !p.getClientRects().length) continue;
            if (getComputedStyle(p).visibility === 'hidden') continue;
            if (!p.closest('.katex')) text += ` ${x.nodeValue}`;
            const px = parseFloat(getComputedStyle(p.closest('.katex') ?? p).fontSize);
            if (x.nodeValue.trim() && px < 11.95)
              tiny.push(`${px.toFixed(1)}px « ${x.nodeValue.trim().slice(0, 20)} »`);
          }
          return {
            raw: (text.match(/\$|\\[a-zA-Z]{2,}/) ?? [null])[0],
            arabic: /[\u0600-\u06ff]/.test(text),
            wide: document.documentElement.scrollWidth > window.innerWidth + 1,
            tiny: [...new Set(tiny)].slice(0, 4),
          };
        });
        check(
          !t.raw && !t.arabic && !t.wide && t.tiny.length === 0,
          `the memo, part « ${part} »: no raw formula, no Arabic letter, nothing wider than the screen, no text under 12 px${t.raw ? ` — « ${t.raw} »` : ''}${t.tiny.length ? ' — ' + t.tiny.join(' | ') : ''}`,
        );
        n += 1;
        await page.screenshot({ path: `${OUT}/${String(n).padStart(2, '0')}-memo-${part}.png` });
      }
      check(
        errors.length === 0,
        `no page error on the memo${errors.length ? ' — ' + errors.slice(0, 3).join(' | ') : ''}`,
      );
    }
  } catch (e) {
    if (!fails.length || !String(e.message).startsWith(fails.at(-1))) {
      console.log('FAIL', `the walk stopped: ${String(e.message).split('\n')[0]}`);
      fails.push(`stopped: ${String(e.message).split('\n')[0]}`);
    }
    process.exitCode = 1;
  }
  console.log(
    `walk lesson-${L.id}-board @ ${SIZE.join('x')}: ${oks} ok, ${fails.length} FAIL, ${Math.round((Date.now() - t0) / 1000)} s — ${n} screenshots in ${OUT}`,
  );
  if (fails.length) console.log('failed:\n  - ' + fails.join('\n  - '));
  await browser.close();
}
