// « L’échauffement » (the launch kit) — the shared walks of a lesson's LAUNCH as a STUDENT (simulated session, no API).
//
// `harness(...)`: what every launch walk needs — a student signed in with a mocked API, the screen checks, and the gestures
// played through the UI with answers COMPUTED here from what the screen shows (the equation's numbers, the prompt, the card in
// the hand), never read from the game: the game's own `bin` of a card is only CROSS-CHECKED against the walk's computation.
//
// The two scenarios of the Algerian lessons whose tools were fixed here (the « two » walk of lessons 2–3 and the « lists »
// walk of the PGCD lessons, on the Algerian items 4am.m1.r01, 4am.m1.r02, 2am.m1.r04) left with those lessons and their
// families (2026-11-22): a French lesson names its tools in its descriptor (`walkLaunchOne`, `walkLaunchPair`).
//
// `walkLaunchOne(...)` — a lesson whose launch holds ONE tool (the learning net gives it one direct prerequisite with a question
// family; in the Algerian tree: the division lessons and the divisibility rules, on the operations or the division). The tool
// is a CORE one (`weight` not
// `support`: unclassified counts as core, `engine.js › gateOf`). Four students:
//   1. knows: the very first question (level 1, write), then the level-2 SORT — 2 / 2, no workshop, take-off;
//   2. slips on the sort: « À consolider » in two answers, the workshop opens on the trap he took, two sorts LIKE it answered
//      right — repaired, still « À consolider », 1 / 2, the door open, ONE lesson to revise (its memo, its lab, its page);
//   3. misses everything: 0 / 2, the gate — ONE capsule (card, example, the instrument, two easy questions missed), the door
//      opens whatever he answers, the tool flagged « capsule faite », not a new try;
//   4. misses the stations and the workshop, then answers the capsule right: repaired by the capsule, 1 / 2, take-off.
//
// At every screenshot: nothing scrolls or leaves its panel (the rules of launch-kit.mjs, plus a sentence on two lines at most,
// a list card that never starts a line with a comma and whose LONGEST possible text (`LONGEST_LIST`) fits in two lines,
// a placed card in its box, the boxes above the buttons) — a hard FAIL; and the checks printed FAIL that let the walk go on
// (the run still fails): no raw formula, no word of another lesson, no text under 12 px (`lib/walk.mjs › tinyText`, the same
// floor as every walk), the launch's ✕ reachable. The lab opened from a capsule gets the same floor and its own ✕.
import { FAMILIES, makeQuestion } from '../../src/lessons/common/launchkit/families.js';
import { homeLessonOf } from '@smarter-academy/core/curriculum/fr/net/learningNet.js';
import { chromium } from 'playwright';
import { GL_ARGS } from './gpu.mjs';
import { eq as exactEq, mul as exactMul, q as exactQ } from './lessonWalk/worlds/exact.mjs';
import { tinyText } from './walk.mjs';
import { WRONG_WORD } from './lessonWalk/checks.mjs';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

/** Is a card « xᵉ = v » of powers TRUE (3am.m3.r06)? Read from its TeX, computed exactly; null: not a power card. */
function powerCard(tex) {
  const t = tex
    .replace(/\\left|\\right/g, '')
    .replace(/\{,\}/g, ',')
    .replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '$1/$2');
  const m = /^\(?(-?[\d,/]+)\)?\^\{(\d+)\} = (-?[\d,/]+)$/.exec(t);
  if (!m) return null;
  let p = exactQ('1');
  for (let i = 0; i < Number(m[2]); i += 1) p = exactMul(p, m[1]);
  return exactEq(p, m[3]);
}

/**
 * The LONGEST list card any family can draw (a sentence carrying a list, `card.list`: « Diviseurs de 54 : 1, 2, 3, 6, 9,
 * 18, 27 et 54 »), drawn from the families' own generators with a FIXED seed — the same text every run. Whenever a list card
 * is in the hand, `shot` lays this text in a copy of the card and measures it: the run meets the longest card every time,
 * not only when the random draw deals it. No family draws a list yet (the empty catalogue): nothing to measure.
 */
export const LONGEST_LIST = (() => {
  let seed = 20261119;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  let best = '';
  for (const item of Object.keys(FAMILIES)) {
    for (const level of [1, 2]) {
      let first;
      try {
        first = makeQuestion(rand, item, level, 'sort');
      } catch {
        continue; // the family has no sort at this level
      }
      if (!first?.cards?.some((c) => Array.isArray(c.list))) continue;
      for (let i = 0; i < 3000; i += 1)
        for (const c of makeQuestion(rand, item, level, 'sort').cards)
          if (Array.isArray(c.list) && c.text.length > best.length) best = c.text;
    }
  }
  return best;
})();

/** The greatest common divisor, the walk's own (never the game's). */
const gcdOf = (a, b) => (b ? gcdOf(b, a % b) : a);
const norm = (s) =>
  String(s ?? '')
    .replace(/\s+/g, ' ')
    .trim();
/** A formula as KaTeX annotates it: it may keep the style it drew in (« \displaystyle 43 - 7 »): the formula is what follows. */
const texOf = (s) => norm(s).replace(/^\\displaystyle\s*/, '');
/**
 * The foreign words of a launch walk, less what the launch SHOWS ON PURPOSE: each of its tools is named by its family and
 * sends to its home lesson (« Revois d’abord » and the lesson's title, an earlier lesson that may also be a lesson of the
 * world). A word of another lesson that is part of one of those names is the launch's own here, not a leak.
 */
const ownToolsAside = (alien, items) => {
  const shown = items.flatMap((i) => [FAMILIES[i]?.name, homeLessonOf(i)?.title]).filter(Boolean);
  return alien.filter((w) => !shown.some((s) => s.includes(w)));
};

/**
 * The shared machinery of a launch walk. `url`: the lesson page; `grade`: the student's year (the lesson's own);
 * `alien`: words of other lessons that must never show; `alienLabel`: those lessons, for the log.
 */
export function harness({ id, url, grade = '3e', outName, alien = [], alienLabel = 'another lesson' }) {
  const OUT = process.argv[2] || `${tmpdir()}/${outName}`;
  const SIZE = (process.env.E2E_SIZE || '1366x768').split('x').map(Number);
  const PHONE = process.env.E2E_TOUCH === '1' && SIZE[1] <= 500;
  mkdirSync(OUT, { recursive: true });
  const S = { page: null, n: 0, zeroSeen: false, browser: null };
  const errors = [];
  const expect = (cond, msg) => {
    if (!cond) {
      console.log('FAIL', msg);
      process.exitCode = 1;
      if (process.env.E2E_SOFT !== '1') throw new Error(msg);
      return;
    }
    console.log('ok  ', msg);
  };
  const say = (ok, msg) => {
    if (ok) console.log('ok  ', msg);
    else {
      console.log('FAIL', msg);
      process.exitCode = 1;
    }
  };

  async function student(uid) {
    S.browser ??= await chromium.launch({ args: GL_ARGS });
    const ctx = await S.browser.newContext({
      viewport: { width: SIZE[0], height: SIZE[1] },
      ...(process.env.E2E_TOUCH === '1' ? { hasTouch: true, isMobile: true } : {}),
    });
    await ctx.addInitScript(
      ([u, year]) => {
        window.__paperFast = true;
        window.__launchFast = true;
        localStorage.setItem('token', 'qa-fake-token');
        const real = window.fetch.bind(window);
        window.fetch = async (input, init) => {
          const url = typeof input === 'string' ? input : input.url;
          if (url.includes('/api/'))
            return new Response(
              JSON.stringify(
                url.includes('/auth/me')
                  ? {
                      success: true,
                      user: {
                        id: u,
                        name: 'Lucas Martin',
                        role: 'student',
                        roles: ['student'],
                        email_verified_at: '2026-09-01T00:00:00Z',
                        emailVerified: true,
                        nameComplete: true,
                        level: year,
                        grade: year,
                      },
                    }
                  : { success: true, data: [] },
              ),
              { status: 200, headers: { 'Content-Type': 'application/json' } },
            );
          return real(input, init);
        };
      },
      [uid, grade],
    );
    const p = await ctx.newPage();
    p.on('pageerror', (e) => {
      errors.push(e.message);
      console.log('pageerror', e.message);
    });
    return p;
  }

  /** Nothing scrolls, nothing leaves the screen or its panel — checked at every screenshot (the rules of launch-kit.mjs). */
  const shot = async (name) => {
    const page = S.page;
    await page.waitForTimeout(350);
    const bad = await page.evaluate(
      ([phone, longest]) => {
        const out = [];
        const root = document.querySelector('.lk-root');
        if (!root) return ['no launch on screen'];
        for (const el of root.querySelectorAll('*')) {
          const cs = getComputedStyle(el);
          if (
            /(auto|scroll)/.test(cs.overflowY) &&
            el.scrollHeight > el.clientHeight + 2 &&
            !(phone && (el.classList.contains('lk-stage') || el.classList.contains('lk-capbody')))
          )
            out.push(`scrolls: ${el.className}`);
        }
        const stage = root.querySelector('.lk-stage').getBoundingClientRect();
        const bag = root.querySelector('.lk-bag').getBoundingClientRect();
        for (const el of root.querySelectorAll('.lk-head, .lk-bag, .lk-stage, .lk-memo')) {
          const r = el.getBoundingClientRect();
          if (r.top < -1 || r.bottom > window.innerHeight + 1 || r.left < -1 || r.right > window.innerWidth + 1)
            out.push(`leaves the screen: ${el.className}`);
        }
        if (!phone)
          for (const el of root.querySelectorAll(
            '.lk-stage button, .lk-prompt, .lk-equation, .lk-card, .lk-box, .lk-example li, .lk-kcard, .lk-revise, .lk-score, .lk-result h3, .lk-intro > *',
          )) {
            const r = el.getBoundingClientRect();
            if (
              r.height > 0 &&
              (r.top < stage.top - 1 ||
                r.bottom > stage.bottom + 1 ||
                r.left < stage.left - 1 ||
                r.right > stage.right + 1)
            )
              out.push(`out of the stage: ${el.className} « ${el.textContent.slice(0, 24)} »`);
          }
        for (const el of root.querySelectorAll('.lk-tool, .lk-robot')) {
          const r = el.getBoundingClientRect();
          if (r.top < bag.top - 1 || r.bottom > bag.bottom + 1)
            out.push(`out of the bag: ${el.className?.baseVal ?? el.className}`);
        }
        for (const el of root.querySelectorAll('.lk-prompt, .lk-example ol, .lk-revise > div, .lk-kit'))
          if (el.scrollWidth > el.clientWidth + 3 || (!phone && el.scrollHeight > el.clientHeight + 3))
            out.push(`overflows: ${el.className}`);
        // a sentence card: inside its card, on two lines at most
        for (const el of root.querySelectorAll('.lk-card .lk-say')) {
          const r = el.getBoundingClientRect();
          const c = el.closest('.lk-card').getBoundingClientRect();
          const lines = Math.round(
            r.height /
              (parseFloat(getComputedStyle(el).lineHeight) * Number(root.querySelector('.lk-fit').style.zoom || 1)),
          );
          if (r.left < c.left - 1 || r.right > c.right + 1 || r.top < c.top - 1 || r.bottom > c.bottom + 1)
            out.push('a sentence leaves its card');
          if (lines > 2) out.push(`a sentence takes ${lines} lines`);
        }
        // a LIST card (« Diviseurs de 54 : 1, 2, 3, 6, 9, 18, 27 et 54 »): no line starts with a comma — on the card dealt AND on the longest card the
        // family can draw, laid in a copy of the card (same column, same style) and measured, then removed
        const listLines = (say) => {
          const zoom = Number(root.querySelector('.lk-fit').style.zoom || 1);
          const lh = parseFloat(getComputedStyle(say).lineHeight) * zoom;
          const node = say.firstChild;
          const rect = (i) => {
            const r = document.createRange();
            r.setStart(node, i);
            r.setEnd(node, i + 1);
            return r.getBoundingClientRect();
          };
          let comma = false;
          const t = node?.nodeValue ?? '';
          for (let i = 1; i < t.length; i += 1) {
            if (t[i] !== ',') continue;
            let j = i - 1; // the number before the comma (past the space that glues them)
            while (j > 0 && /\s/.test(t[j])) j -= 1;
            if (rect(i).top > rect(j).top + lh / 2) comma = true; // the comma opens a new line
          }
          return { lines: Math.round(say.getBoundingClientRect().height / lh), comma };
        };
        for (const say of root.querySelectorAll('.lk-card .lk-say[data-lk-list]')) {
          const dealt = listLines(say);
          if (dealt.comma) out.push(`a line of the list starts with a comma « ${say.textContent} »`);
          const card = say.closest('.lk-card');
          const copy = card.cloneNode(true);
          copy.style.animation = 'none';
          card.after(copy);
          const long = copy.querySelector('.lk-say');
          long.textContent = longest;
          const m = listLines(long);
          const width = Math.round(card.getBoundingClientRect().width);
          copy.remove();
          if (m.lines > 2)
            out.push(`the longest list takes ${m.lines} lines on a card ${width} px wide « ${longest} »`);
          if (m.comma) out.push(`a line of the longest list starts with a comma « ${longest} »`);
        }
        {
          const foot = root.querySelector('.lk-question .lk-qfoot')?.getBoundingClientRect();
          const sort = root.querySelector('.lk-sort')?.getBoundingClientRect();
          if (foot && sort && sort.bottom > foot.top + 1) out.push('the boxes lie under the buttons of the question');
        }
        for (const el of root.querySelectorAll('.lk-chip')) {
          const r = el.getBoundingClientRect();
          const b = el.closest('.lk-box').getBoundingClientRect();
          if (r.left < b.left - 1 || r.right > b.right + 1 || r.bottom > b.bottom + 1)
            out.push('a placed card leaves its box');
        }
        return out;
      },
      [PHONE, LONGEST_LIST],
    );
    if (bad.length) {
      console.log('FAIL at «', name, '»:', [...new Set(bad)].join(' | '));
      process.exitCode = 1;
      if (process.env.E2E_SOFT !== '1') throw new Error(`layout at ${name}`);
    }
    await soft(name);
    S.n += 1;
    await page.screenshot({ path: `${OUT}/${String(S.n).padStart(2, '0')}-${name}.png` });
  };
  /** The checks that let the walk go on (printed FAIL, the run fails): no raw formula, no word of another lesson, no text under 12 px, the ✕. */
  async function soft(name, { exit = '[data-lk-close]', words = true } = {}) {
    const page = S.page;
    const t = await page.evaluate(
      ([words, xsel]) => {
        const raw = [];
        let all = '';
        const wk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let x = wk.nextNode(); x; x = wk.nextNode()) {
          const p = x.parentElement;
          if (!p || !x.nodeValue.trim() || p.closest('script, style, noscript, title, .katex-mathml')) continue;
          const r = p.getBoundingClientRect();
          if (r.width <= 1 || r.height <= 1 || r.bottom < 0 || r.top > innerHeight) continue;
          const cs = getComputedStyle(p);
          if (cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
          all += ` ${x.nodeValue}`;
          if (!p.closest('.katex') && /\$|\\[a-zA-Z]{2,}/.test(x.nodeValue)) raw.push(x.nodeValue.trim().slice(0, 40));
        }
        const xb = document.querySelector(xsel);
        let exit = false;
        if (xb) {
          const r = xb.getBoundingClientRect();
          const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          exit =
            r.width > 0 && r.right <= innerWidth + 1 && r.top >= -1 && Boolean(top && (top === xb || xb.contains(top)));
        }
        return { raw: [...new Set(raw)], words: words.filter((w) => all.includes(w)), exit };
      },
      [alien, exit],
    );
    const tiny = await tinyText(page);
    say(t.raw.length === 0, `${name}: no raw formula on screen${t.raw.length ? ' — ' + t.raw.join(' | ') : ''}`);
    if (alien.length && words)
      say(
        t.words.length === 0,
        `${name}: nothing of ${alienLabel} on screen${t.words.length ? ' — ' + t.words.join(', ') : ''}`,
      );
    say(tiny.length === 0, `${name}: no text under 12 px${tiny.length ? ' — ' + tiny.slice(0, 6).join(' | ') : ''}`);
    say(
      t.exit,
      `${name}: ${exit === '[data-lk-close]' ? 'the launch’s ✕' : 'the lab’s ✕'} is on screen and a click reaches it`,
    );
  }
  /** The lab opened over the launch (a capsule's instrument): the same floor and formulas, its own ✕; then the screenshot. */
  const labShot = async (name) => {
    await S.page.waitForTimeout(500);
    // the lab's cabinet names the earlier lessons by design (`lessonlab/registry.js › toolsFor`): no foreign-word check here
    await soft(name, { exit: '[data-ll-close]', words: false });
    // the launch is played BEFORE the lesson: its lab (`earlierOnly`) has no « Les outils de cette leçon » group — the lesson's own
    // instrument would name the key the student has not discovered yet (LESSON_LAB.md §2)
    const mine = await S.page.evaluate(() => ({
      group: document.querySelectorAll('[data-lesson-lab] [data-ll-mine]').length,
      said: (document.querySelector('[data-lesson-lab] .ll-rail')?.textContent ?? '').includes('Les outils de cette leçon'),
    }));
    say(
      mine.group === 0 && !mine.said,
      `${name}: the lab opened from the launch shows no « Les outils de cette leçon » group (only the instruments of earlier lessons)`,
    );
    S.n += 1;
    await S.page.screenshot({ path: `${OUT}/${String(S.n).padStart(2, '0')}-${name}.png` });
  };

  const px = (sel) =>
    S.page.evaluate((s) => {
      const el = document.querySelector(s);
      const z = Number(document.querySelector('.lk-fit').style.zoom || 1);
      return el ? Math.round(parseFloat(getComputedStyle(el).fontSize) * z) : 0;
    }, sel);
  const cur = () => S.page.evaluate(() => window.__launch.cur);
  const tool = async (item) => ({
    band: await S.page.getAttribute(`[data-lk-tool="${item}"]`, 'data-lk-band'),
    seg: await S.page.getAttribute(`[data-lk-tool="${item}"]`, 'data-lk-segments'),
  });
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const bands = () => S.page.locator('[data-lk-kcard]').evaluateAll((els) => els.map((e) => e.dataset.lkBand).join());
  const kcard = (item) => S.page.textContent(`[data-lk-kcard="${item}"]`);
  const kit = (uid) =>
    S.page.evaluate((u) => JSON.parse(localStorage.getItem(`u_${u}_smarter_launch_kit`) ?? 'null'), uid);
  /** What the question shows: the tokens of the equation to complete, its boxes, the prompt (its words, its formulas apart). */
  const onScreen = () =>
    S.page.evaluate(() => {
      const pr = document.querySelector('.lk-question .lk-prompt');
      let plain = '';
      if (pr) {
        const c = pr.cloneNode(true);
        c.querySelectorAll('.katex').forEach((k) => k.remove());
        plain = c.textContent;
      }
      return {
        eq: [...document.querySelectorAll('.lk-question .lk-equation > b')].map((b) => b.textContent.trim()),
        slots: [...document.querySelectorAll('.lk-question [data-lk-slot]')].map((s) => s.dataset.lkSlot),
        // a fraction drawn with a real bar (1am.m5.r02): « n/d », a box written « ▢ »
        fracs: [...document.querySelectorAll('.lk-question .lk-equation > .lk-frac')].map((f) => f.dataset.lkFrac),
        // a power drawn with a real superscript (3am.m3.r06): « 8^2 », « (−8)^2 », « 2/3^2 »
        pows: [...document.querySelectorAll('.lk-question .lk-equation > .lk-pow')].map((f) => f.dataset.lkPow),
        plain,
        tex: pr ? [...pr.querySelectorAll('annotation')].map((a) => a.textContent) : [],
      };
    });
  /** The card in the hand, as the screen shows it: a formula (its TeX), a sentence, or a number. */
  const cardInHand = () =>
    S.page.evaluate(() => {
      const c = document.querySelector('[data-lk-card]');
      if (!c) return null;
      return {
        id: c.dataset.lkCard,
        tex: c.querySelector('annotation')?.textContent ?? null,
        say: c.querySelector('.lk-say')?.textContent ?? null,
        text: c.textContent,
      };
    });
  /**
   * The box a card belongs in, computed HERE from the card and the prompt:
   *   « a = b × q ± r »         THE Euclidean division of a by b? (+, the equality true, r < b)
   *   « x × y (+ z) = v », « x − y = v »   is the equality true?
   *   « x est un diviseur de y », « x est un multiple de y », « x est divisible par y »   is the sentence true?
   *   « Diviseurs de n : 1, 2, … et n »   is it the WHOLE list of n's divisors?
   *   a number                  a common divisor of the prompt's two numbers (« diviseur commun à a et b »), a divisor
   *                             of its number (« diviseur de n »), or divisible by its k (« divisible par k »).
   * The sentences are the French families' words (families.js › MISTAKES: « 6 est un diviseur de 42 », « 42 est un
   * multiple de 6 »; gestures.jsx › the list card, `listFr`); white space, no-break included, read as one space.
   */
  const boxOf = (card, plain) => {
    if (card.tex) {
      // KaTeX may keep the style it drew in (« \displaystyle 210 = 24 \times 7 + 42 »): the equality is what follows it
      const tex = texOf(card.tex);
      let m = /^(\d+) = (\d+) \\times (\d+) ([+-]) (\d+)$/.exec(tex);
      if (m) {
        const [a, b, k, r] = [m[1], m[2], m[3], m[5]].map(Number);
        const yes = m[4] === '+' && a === b * k + r && r < b;
        if (k === 0 && m[4] === '+') {
          S.zeroSeen = true;
          expect(yes, `a quotient 0 is THE Euclidean division of a smaller number (« ${tex} »)`);
        }
        return yes ? 'yes' : 'no';
      }
      m = /^(\d+) \\times (\d+)(?: \+ (\d+))? = (\d+)$/.exec(tex);
      if (m) return Number(m[1]) * Number(m[2]) + Number(m[3] ?? 0) === Number(m[4]) ? 'yes' : 'no';
      // « n/d = x/y » (1am.m5.r02, level 2): are the two fractions equal? (n × y = d × x)
      m = /^\\frac\{(\d+)\}\{(\d+)\} = \\frac\{(\d+)\}\{(\d+)\}$/.exec(tex);
      if (m) return Number(m[1]) * Number(m[4]) === Number(m[2]) * Number(m[3]) ? 'yes' : 'no';
      m = /^(\d+) - (\d+) = (\d+)$/.exec(tex);
      if (m) return Number(m[1]) - Number(m[2]) === Number(m[3]) ? 'yes' : 'no';
      // « PGCD(x ; y) = v » (4am.m1.r03, level 2): is v the greatest common divisor, computed here?
      m = /^\\mathrm\{PGCD\}\((\d+) ; (\d+)\) = (\d+)$/.exec(tex);
      if (m) return gcdOf(Number(m[1]), Number(m[2])) === Number(m[3]) ? 'yes' : 'no';
      // « 45 = 3 × 3 × 5 » (4e.m1.r06, first French lesson): the number written as a product of PRIMES? (the product is the
      // number, and every factor is prime — « 12 = 2 × 6 » keeps a 6, « 30 = 2 × 3 × 7 » is not 30)
      m = /^(\d+) = (\d+(?: \\times \d+)+)$/.exec(tex);
      if (m) {
        const fs = m[2].split(' \\times ').map(Number);
        const prime = (x) => x > 1 && [...Array(Math.max(0, Math.floor(Math.sqrt(x)) - 1)).keys()].every((i) => x % (i + 2) !== 0);
        return fs.reduce((p, x) => p * x, 1) === Number(m[1]) && fs.every(prime) ? 'yes' : 'no';
      }
      // « xᵉ = v » (3am.m3.r06): a power of a whole, negative, decimal number or a fraction — computed here, exactly
      const pw = powerCard(tex);
      if (pw != null) return pw ? 'yes' : 'no';
      expect(false, `the walk can read the card « ${tex} »`);
    }
    if (card.say) {
      const t = norm(card.say);
      let m = /^(\d+) est un diviseur de (\d+)$/.exec(t);
      if (m) return Number(m[2]) % Number(m[1]) === 0 ? 'yes' : 'no';
      m = /^(\d+) (?:est un multiple de|est divisible par) (\d+)$/.exec(t);
      if (m) return Number(m[1]) % Number(m[2]) === 0 ? 'yes' : 'no';
      // « Diviseurs de n : 1, 2, … et n »: is it the WHOLE list of n's divisors, nothing missing, nothing extra?
      m = /^Diviseurs de (\d+) ?: (.+)$/.exec(t);
      if (m) {
        const n = Number(m[1]);
        const list = m[2].split(/,| et /).map((x) => Number(x.trim()));
        const all = [];
        for (let d = 1; d <= n; d += 1) if (n % d === 0) all.push(d);
        return list.length === all.length && all.every((d, i) => list[i] === d) ? 'yes' : 'no';
      }
      expect(false, `the walk can read the sentence « ${t} »`);
    }
    const n = Number(norm(card.text));
    const both = /diviseur commun (?:à|de) (\d+) et (?:de )?(\d+)/i.exec(norm(plain));
    if (both) return Number(both[1]) % n === 0 && Number(both[2]) % n === 0 ? 'yes' : 'no';
    const of = /diviseur de (\d+)/i.exec(norm(plain));
    if (of) return Number(of[1]) % n === 0 ? 'yes' : 'no';
    const k = /divisible par (\d+)/i.exec(norm(plain));
    if (k) return n % Number(k[1]) === 0 ? 'yes' : 'no';
    // « Ce nombre est-il premier ? » (4e.m1.r06): exactly two divisors, 1 and itself — 1 is not prime
    if (/est-il premier/i.test(norm(plain))) {
      let p = n >= 2;
      for (let d = 2; d * d <= n; d += 1) if (n % d === 0) p = false;
      return p ? 'yes' : 'no';
    }
    expect(false, `the walk can read the number card « ${card.text} » with its prompt « ${norm(plain)} »`);
    return null;
  };
  const type = async (v) => {
    for (const d of String(v)) await S.page.click(`[data-lk-key="${d}"]`);
  };

  /** Sends the card in the hand to its box (right) or to the other one (wrong), by a tap on the box. Returns the box sent to. */
  async function sortOne(right) {
    const { q } = await cur();
    const card = await cardInHand();
    expect(Boolean(card), 'a card is in the hand');
    const { plain } = await onScreen();
    const bin = boxOf(card, plain);
    const game = q.cards.find((c) => c.id === card.id);
    expect(
      game && game.bin === bin,
      `the box of « ${norm(card.tex ?? card.say ?? card.text)} », computed apart, is the game's (${bin})`,
    );
    const to = right ? bin : bin === 'yes' ? 'no' : 'yes';
    await S.page.click(`[data-lk-send="${to}"]`);
    return to;
  }

  /** Fills the answer of the question on screen — right or wrong — with real taps and drags, WITHOUT handing it in. */
  async function fill(right) {
    const page = S.page;
    const { q } = await cur();
    const sc = await onScreen();
    if (q.gesture === 'write') {
      let vals;
      if (sc.fracs.length === 2) {
        // « n/d = m/▢ » or « n/d = ▢/m » (1am.m5.r02): the term that keeps the value, computed here; wrong: the same
        // number subtracted from both terms (the slip « subtract-not-divide »), or the term left as it was
        const [n, d] = sc.fracs[0].split('/').map(Number);
        const [top, bottom] = sc.fracs[1].split('/');
        const bottomAsked = bottom === '▢';
        const m = Number(bottomAsked ? top : bottom);
        const [given, other] = bottomAsked ? [d, n] : [n, d];
        expect(
          q.calc?.op === 'frac' && n === q.calc.n && d === q.calc.d && same(sc.slots, ['v']) && sc.eq.includes('='),
          `the equation on screen is the question asked (${sc.fracs.join(' = ')}), two fractions with a bar, ONE box`,
        );
        const v = (given * m) / other;
        expect(Number.isInteger(v), `${sc.fracs.join(' = ')}: a whole term keeps the value (${v})`);
        const slip = given - (other - m);
        vals = { v: right ? v : slip > 0 && slip !== v ? slip : given };
      } else if (sc.pows?.length) {
        // « xᵉ = ▢ » or « (p/q)² = ▢/▢ » (3am.m3.r06): the power, computed here; wrong: the base times the exponent
        // (the slip « power-times »)
        const [base, e] = sc.pows[0].split('^');
        const E = Number(e);
        const b = base.replace(/[()]/g, '').replace('−', '-');
        if (b.includes('/')) {
          const [p, d] = b.split('/').map(Number);
          expect(
            q.calc?.op === 'pow' && q.calc.n === p && q.calc.d === d && same(sc.slots, ['n', 'd']),
            `the power on screen is the question asked (${sc.pows[0]}), two boxes over a bar`,
          );
          vals = right ? { n: p ** E, d: d ** E } : { n: p * E, d: d * E }; // p·2/q·2 = p/q, never (p/q)²
        } else {
          const x = Number(b);
          expect(
            q.calc?.op === 'pow' && q.calc.x === x && q.calc.e === E && same(sc.slots, ['v']),
            `the power on screen is the question asked (${sc.pows[0]}), ONE box`,
          );
          // (2² = 2 × 2: the slip would be right — then the square plus one)
          const slip = Math.abs(x * E) === x ** E ? x ** E + 1 : Math.abs(x * E);
          vals = { v: right ? x ** E : slip };
        }
      } else if (/^PGCD/.test(sc.eq[0] ?? '')) {
        // « PGCD(x ; y) = ▢ » (4am.m1.r03): the greatest common divisor, computed here; wrong: the smaller number (it
        // never divides the greater in this family — the slip « smaller-not-divisor »)
        const [x, y] = sc.eq.map(Number).filter((v) => Number.isInteger(v) && v > 0);
        expect(
          q.calc?.op === 'pgcd' && x === q.calc.x && y === q.calc.y && same(sc.slots, ['v']),
          `the equation on screen is the question asked (${sc.eq.join(' ')}), ONE box`,
        );
        vals = { v: right ? gcdOf(x, y) : Math.min(x, y) };
      } else if (q.calc?.op === 'factor') {
        // « 30 = 2 × ▢ × 5 » (4e.m1.r06, first French lesson): one prime of the product to write — the number divided by the
        // primes printed, computed here; wrong: the next number (never the prime asked)
        const nums = sc.eq.map(Number).filter((v) => Number.isInteger(v) && v > 0);
        const [n, ...known] = nums;
        const v = n / known.reduce((p, x) => p * x, 1);
        expect(
          n === q.calc.n && Number.isInteger(v) && same(sc.slots, ['v']),
          `the equation on screen is the question asked (${sc.eq.join(' ')}), ONE box — ${n} ÷ ${known.join(' ÷ ')} = ${v}`,
        );
        vals = { v: right ? v : v + 1 };
      } else if (sc.eq[1] === '=') {
        // « a = b × ▢ (+ ▢) »: the Euclidean division, or the equality that shows a divisor (no box for a remainder)
        const a = Number(sc.eq[0]);
        const b = Number(sc.eq[2]);
        expect(a === q.a && b === q.b, `the equation on screen is the question asked (${sc.eq.join(' ')})`);
        const tq = Math.floor(a / b);
        const tr = a % b;
        if (sc.slots.includes('r')) {
          expect(same(sc.slots, ['q', 'r']) && tq >= 1, `two boxes: the quotient, then the remainder (${a} ÷ ${b})`);
          vals = right ? { q: tq, r: tr } : { q: tq - 1, r: tr + b }; // wrong: a TRUE equality whose remainder is too big
        } else {
          expect(same(sc.slots, ['q']) && tr === 0, `ONE box, and ${b} divides ${a}: the equality of a divisor`);
          vals = { q: right ? tq : tq + 1 };
        }
      } else {
        // « x × y (+ z) = ▢ » or « x − y = ▢ »: an operation, computed here
        const [x, op, y] = [Number(sc.eq[0]), sc.eq[1], Number(sc.eq[2])];
        const z = sc.eq[3] === '+' ? Number(sc.eq[4]) : 0;
        expect(
          ['×', '−'].includes(op) && same(sc.slots, ['v']),
          `an operation to compute, ONE box (${sc.eq.join(' ')})`,
        );
        const v = op === '×' ? x * y + z : x - y;
        vals = { v: right ? v : v + 10 };
      }
      for (const s of sc.slots) {
        await page.click(`[data-lk-slot="${s}"]`);
        await type(vals[s]);
      }
    } else if (q.gesture === 'sort') {
      for (let i = 0; i < q.cards.length; i += 1) await sortOne(right);
      expect((await page.locator('[data-lk-card]').count()) === 0, 'every card is in a box');
    } else {
      let target;
      let wrong;
      if (sc.tex.length) {
        // a prompt « … $a - d$ »: the flag counts back d from a
        const m = /^(\d+) - (\d+)$/.exec(texOf(sc.tex[0]));
        expect(Boolean(m), `the walk can read the difference « ${sc.tex[0]} »`);
        target = Number(m[1]) - Number(m[2]);
        wrong = Number(m[1]); // wrong: the flag left on the number itself
      } else {
        // « … the greatest multiple of b that does not pass a » (its two numbers, in that order)
        const [a, b] = sc.plain.match(/\d+/g).map(Number);
        expect(a === q.a && b === q.b, `the prompt is the question asked (${a}, ${b})`);
        target = Math.floor(a / b) * b;
        wrong = target + b <= q.max ? target + b : target - b; // wrong: a neighbour multiple, still on the line
      }
      const goal = right ? target : wrong;
      const box = await page.locator('[data-lk-line]').boundingBox();
      const k = Math.min(box.width / 940, box.height / 250);
      const ox = box.x + (box.width - 940 * k) / 2;
      const oy = box.y + (box.height - 250 * k) / 2;
      const at = (v) => ({ x: ox + (46 + (v / q.max) * 848) * k, y: oy + 168 * k });
      const to = at(goal);
      const from = at(0);
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      await page.mouse.move((from.x + to.x) / 2, to.y, { steps: 5 });
      await page.mouse.move(to.x, to.y, { steps: 5 });
      await page.mouse.up();
      await page.waitForTimeout(150); // let the last move be drawn before the value is read
      const got = Number(await page.getAttribute('[data-lk-line]', 'data-lk-x'));
      expect(got === goal, `the flag follows the hand (asked ${goal}, got ${got})`);
    }
    return q;
  }
  const hand = async () => {
    await S.page.click('[data-lk-done]');
  };
  const settle = async () => {
    await S.page.waitForFunction(() => !document.querySelector('[data-lk-signal]'), null, { timeout: 5000 });
    await S.page.waitForTimeout(150);
  };
  /** Hands the answer in and HEARS the verdict: the signal lasts 60 ms in a fast walk, so an observer set before keeps it. */
  const handAndHear = async () => {
    await S.page.evaluate(() => {
      window.__said = null;
      const o = new MutationObserver(() => {
        const el = document.querySelector('[data-lk-signal]');
        if (el && !window.__said) {
          window.__said = {
            kind: el.dataset.lkSignal,
            signal: el.textContent,
            stage: document.querySelector('.lk-stage').textContent,
          };
          o.disconnect();
        }
      });
      o.observe(document.body, { childList: true, subtree: true, attributes: true });
    });
    await hand();
    const said = await (await S.page.waitForFunction(() => window.__said)).jsonValue();
    await settle();
    return said;
  };
  const answer = async (right) => {
    const q = await fill(right);
    await hand();
    await settle();
    return q;
  };
  const open = async (uid) => {
    S.page = await student(uid);
    await S.page.goto(url, { waitUntil: 'networkidle' });
    await S.page.waitForSelector('[data-di-start]');
    await S.page.click('[data-di-start]');
    await S.page.waitForSelector(`[data-launch-kit="${id}"]`);
    return S.page;
  };
  const begin = async () => {
    await S.page.click('[data-lk-start]');
    await S.page.waitForSelector('[data-lk-question]');
  };
  /** « En route vers la leçon »: the countdown, then the launch closes and the world plays (`WorldRuntime › launched → start`). */
  const takeOff = async (msg) => {
    await S.page.click('[data-lk-go]');
    await S.page.waitForFunction(() => !document.querySelector('[data-launch-kit]'), null, { timeout: 15000 });
    const phase = await S.page.evaluate(() => window.__world.getState().phase);
    expect(
      phase === 'play' && (await S.page.locator('.lk-root').count()) === 0,
      `${msg} (the world's phase: ${phase})`,
    );
  };
  /** The workshop's worked example, revealed step by step through its button; every step on screen, then « Compris : j’essaie 2 questions ». */
  const revealWorkshop = async () => {
    const len = await S.page.evaluate(() => window.__launch.cur.ex.steps.length);
    for (let i = 1; i < len; i += 1) await S.page.click('[data-lk-step-next]');
    expect(
      (await S.page.locator('[data-lk-step]').count()) === len &&
        (await S.page.locator('[data-lk-step-next]').count()) === 0 &&
        (await S.page.locator('[data-lk-try]').count()) === 1,
      `the worked example, revealed step by step (${len} steps), then « Compris : j’essaie 2 questions »`,
    );
    return len;
  };
  /** The capsule's worked example, revealed step by step through its « Suivant » (`data-lk-capsule-next`). */
  const revealCapsule = async () => {
    const len = await S.page.evaluate(() => window.__launch.cap.ex.steps.length);
    for (let i = 1; i < len; i += 1) await S.page.click('[data-lk-capsule-next]');
    expect(
      (await S.page.locator('[data-lk-step]').count()) === len &&
        (await S.page.getAttribute('[data-lk-capsule]', 'data-lk-capsule-step')) === 'example',
      `the capsule's worked example, revealed step by step (${len} steps)`,
    );
    return len;
  };
  /** The capsule's lab: opened ON the tool's instrument, checked, closed. */
  const capsuleLab = async (labTool, name, msg) => {
    await S.page.click('[data-lk-capsule-lab]');
    await S.page.waitForSelector('[data-lesson-lab]');
    expect((await S.page.getAttribute('[data-lesson-lab]', 'data-ll-tool-on')) === labTool, msg);
    await labShot(name);
    await S.page.click('[data-ll-close]');
    await S.page.waitForFunction(() => !document.querySelector('[data-lesson-lab]'));
  };
  const done = async () => {
    expect(errors.length === 0, `no page error (${errors.length})`);
    await S.browser?.close();
    console.log(process.exitCode ? 'FAILED' : `PASSED — screenshots in ${OUT}`);
  };

  return {
    S,
    PHONE,
    expect,
    shot,
    labShot,
    px,
    cur,
    tool,
    same,
    bands,
    kcard,
    kit,
    onScreen,
    sortOne,
    fill,
    hand,
    handAndHear,
    settle,
    answer,
    open,
    begin,
    takeOff,
    revealWorkshop,
    revealCapsule,
    capsuleLab,
    done,
  };
}

/**
 * A lesson whose launch holds ONE tool. `tool`: { item, name (as the bag names it), year (« vu en … »), home (the title of
 * its home lesson, named under « Revois d’abord »), firstOk(q) (the very first question: level 1,
 * write, a near-certain win), memo (the lines of its card), mistakeLead (a word of the workshop's lead on the trap of the
 * sort) }; `ids`: four student ids; `alien`, `alienLabel`: words of other lessons that must never show.
 */
export async function walkLaunchOne({
  id,
  url,
  grade,
  outName,
  ids,
  alien = [],
  alienLabel = 'another lesson',
  tool: given,
}) {
  // the tool's instrument is READ from its family (families.js › labTool): null = the family has none — e.g. its instrument
  // belongs to the lesson being launched and must not be shown before it — and then the capsule has no lab step and no
  // « Mon labo » button (LaunchKit.jsx)
  const T = { ...given, labTool: FAMILIES[given.item]?.labTool ?? null };
  // the gesture of the second easy question: the division family's flag (« place »), or what the tool says (4am.m1.r03:
  // its level-1 « common » form is a SORT of three numbers — lesson 7, 2026-11-20)
  const SECOND = given.second ?? 'place';
  const H = harness({ id, url, grade, outName, alien: ownToolsAside(alien, [given.item]), alienLabel });
  const { PHONE, expect, shot, px, cur, tool, same, bands, kcard, kit, fill, hand, settle, answer } = H;
  const I = T.item;
  const forms = new Set(); // every form of the tool the walk met
  const ans = async (right) => {
    const q = await answer(right);
    forms.add(`${q.level}:${q.form}`);
    return q;
  };

  // ══ 1. a student who knows: ONE tool in the bag, two answers, 2 / 2, no workshop, take-off ══
  let page = await H.open(ids[0]);
  expect(
    (await page.evaluate(() => window.__world.getState().phase)) === 'title',
    'the first « Commencer l’aventure » opens the launch: the world has not started',
  );
  expect(
    (
      await page
        .locator('[data-lk-tool]')
        .evaluateAll((els) => els.map((e) => `${e.dataset.lkTool}:${e.dataset.lkBand}:${e.dataset.lkSegments}`))
    ).join() === `${I}:waiting:0`,
    `the bag holds the ONE tool the learning net gives this lesson (${I}), empty`,
  );
  {
    // read as SEEN: a no-break space (« 1 outil » keeps its count with its noun) is a space (defects.md C11)
    const bag = ((await page.textContent('[data-lk-bag]')) ?? '').replace(/\s+/g, ' ');
    const intro = ((await page.textContent('[data-lk-intro]')) ?? '').replace(/\s+/g, ' ');
    expect(
      bag.includes(T.name) && bag.includes(T.year) && intro.includes('1 outil vu dans tes leçons précédentes'),
      `the tool is named in the student’s words (« ${T.name} », ${T.year}); the intro says ONE tool (bag « ${bag.replace(/\s+/g, ' ').trim()} »; intro « ${intro.replace(/\s+/g, ' ').trim().slice(0, 120)} »)`,
    );
  }
  await shot('bag');
  await H.begin();
  let q = (await cur()).q;
  expect(
    q.item === I && q.level === 1 && q.gesture === 'write' && T.firstOk(q),
    'the first question is a very easy one, answered by WRITING',
  );
  expect(await page.locator('[data-lk-done]').isDisabled(), '« Valider » waits for a complete answer');
  console.log('    text on screen (px): prompt', await px('.lk-prompt'), '· equation', await px('.lk-equation'));
  expect((await px('.lk-prompt')) >= (PHONE ? 15 : 19), 'the question is comfortable to read');
  await fill(true);
  await shot('write');
  {
    const said = await H.handAndHear();
    expect(
      said.kind === 'good' && said.signal.includes('Bravo'),
      `a right answer: ✓ « Bravo ! » (${said.signal.trim()})`,
    );
  }
  expect((await tool(I)).seg === '1', 'a right answer lights one segment of the tool');
  forms.add(`1:${q.form}`);
  q = (await cur()).q;
  expect(
    q.item === I && q.level === 2 && q.gesture === 'sort' && q.cards.length === 3,
    'then a harder one, by another gesture: the level-2 SORT of three cards (asked first at level 2)',
  );
  await shot('sort');
  await H.sortOne(true);
  await shot('sort-one-placed');
  await H.sortOne(true);
  await H.sortOne(true);
  await shot('sort-placed');
  expect((await H.handAndHear()).kind === 'good', 'the three cards in their boxes: ✓');
  forms.add('2:sort');
  await page.waitForSelector('[data-lk-result]');
  expect(
    (await page.getAttribute('[data-lk-score]', 'data-lk-score')) === '2/2' &&
      same(await tool(I), { band: 'solid', seg: '2' }) &&
      (await page.locator('[data-lk-example]').count()) === 0 &&
      (await page.locator('[data-lk-revise]').count()) === 0,
    'two right answers: 2 / 2, the tool « Solide » — no workshop, nothing to revise',
  );
  expect(
    (await page.locator('[data-lk-go]').count()) === 1 &&
      (await page.locator('[data-lk-gate]').count()) === 0 &&
      (await page.textContent('.lk-result h3')).includes('chargée à fond'),
    'the kit is complete: the take-off is open',
  );
  await shot('result-solid');
  {
    const k = await kit(ids[0]);
    expect(
      k.items[I].band === 'solid' && k.lessons[id].tries === 1 && k.lessons[id].last.percent === 100,
      'the result is written in the student’s toolbox: the tool « Solide », 100, one try',
    );
  }
  await H.takeOff('take-off: the launch closes and the world of the lesson plays');

  // ══ 2. a student who slips on the sort: « À consolider », the workshop on the trap, two sorts right — repaired ══
  page = await H.open(ids[1]);
  await H.begin();
  await ans(true);
  q = (await cur()).q;
  expect(q.item === I && q.level === 2 && q.gesture === 'sort', 'right at once: the harder one, the sort');
  await fill(false);
  await shot('sort-missed');
  {
    const said = await H.handAndHear();
    expect(
      said.kind === 'later' && said.signal.includes('On y reviendra') && !WRONG_WORD.test(said.stage),
      'a miss says « On y reviendra » — never « wrong », never the right answer',
    );
  }
  expect(
    same(await tool(I), { band: 'consolidate', seg: '1' }),
    'one right, one missed: the tool is « À consolider » — two answers, the game stops asking',
  );
  await page.waitForSelector(`[data-lk-example="${I}"]`);
  {
    const c = await cur();
    const lead = await page.textContent('.lk-example__lead');
    expect(
      c.kind === 'example' && c.level === 2 && Boolean(c.mistake) && lead.includes('Attention'),
      `the workshop opens on the trap his sort took (« ${lead.trim()} »), at the harder level`,
    );
  }
  await shot('workshop-mistake');
  await H.revealWorkshop();
  await shot('workshop-example');
  await page.click('[data-lk-try]');
  await page.waitForSelector('[data-lk-qphase="workshop"]');
  q = (await cur()).q;
  expect(
    q.item === I && q.level === 2 && q.gesture === 'sort',
    'after the worked example, two questions LIKE the one he missed: a sort again, on other numbers',
  );
  await shot('workshop-question');
  await ans(true);
  await ans(true);
  await page.waitForSelector('[data-lk-result]');
  expect(
    (await page.getAttribute('[data-lk-score]', 'data-lk-score')) === '1/2' &&
      (await bands()) === 'consolidate' &&
      (await kcard(I)).includes('Réparé à l’instant') &&
      (await page.locator('[data-lk-go]').count()) === 1 &&
      (await page.locator('[data-lk-gate]').count()) === 0,
    'repaired, the tool keeps « À consolider » (« Réparé à l’instant »): 1 / 2 — and the door is open',
  );
  expect(
    (await page.getAttribute('[data-lk-revise]', 'data-lk-revise')) === I &&
      (await page.textContent('[data-lk-revise]')).includes('Revois d’abord') &&
      (await page.textContent('[data-lk-revise]')).includes(T.home),
    `ONE lesson to revise first: the home lesson of the tool (« ${T.home} »)`,
  );
  await shot('result-repaired');
  await page.click('[data-lk-memo-open]');
  await page.waitForSelector('[data-lk-memo]');
  expect(
    (await page.locator('[data-lk-memo] li').count()) === T.memo,
    `the revision card of the tool (${T.memo} lines)`,
  );
  await shot('memo');
  await page.click('[data-lk-memo-close]');
  if (T.labTool) {
    await page.click('[data-lk-lab-open]');
    await page.waitForSelector(`[data-lesson-lab="${id}"]`);
    expect(
      (await page.getAttribute('[data-lesson-lab]', 'data-ll-tool-on')) === T.labTool,
      `« Essaie l’outil dans Mon labo » opens the lab ON the instrument of that tool (${T.labTool})`,
    );
    await H.labShot('lab');
    await page.click('[data-ll-close]');
    await page.waitForFunction(() => !document.querySelector('[data-lesson-lab]'));
  } else {
    expect(
      (await page.locator('[data-lk-lab-open]').count()) === 0 &&
        !(await page.textContent('[data-lk-result]')).includes('Essaie l’outil dans Mon labo'),
      'a tool with NO instrument (labTool: null): no « Essaie l’outil dans Mon labo » button',
    );
  }
  // the home lesson is `available` in the catalogue (core › getLessonPath gives its page): its button is there, not « Leçon bientôt disponible »
  // a tool whose home lesson is not written yet (a 4e item before any 4e lesson — first French lesson): « Leçon bientôt
  // disponible », never a button to nowhere
  if (homeLessonOf(I))
    expect(
      (await page.locator('[data-lk-lesson]').count()) === 1 ||
        (PHONE && (await page.locator('[data-lk-lesson-computer]').count()) === 1),
      '« Toute la leçon » leads to the home lesson of the tool',
    );
  else
    expect(
      (await page.locator('[data-lk-lesson]').count()) === 0 &&
        (await page.textContent('[data-lk-result]')).includes('Leçon bientôt disponible'),
      'the tool has no home lesson yet: « Leçon bientôt disponible », no button to nowhere',
    );
  {
    const k = await kit(ids[1]);
    expect(
      k.items[I].band === 'consolidate' && k.items[I].repaired === true && k.lessons[id].last.percent === 50,
      'the toolbox: the tool repaired, « À consolider », 50',
    );
  }

  // ══ 3. a student who misses everything: 0 / 2, the gate, ONE capsule missed too — the door opens whatever he answers ══
  page = await H.open(ids[2]);
  await H.begin();
  await ans(false);
  q = (await cur()).q;
  expect(
    q.item === I && q.level === 1 && q.gesture === SECOND,
    `a tool is never judged on one answer: a second easy question, by another gesture — ${SECOND === 'place' ? 'PLACING a flag' : SECOND.toUpperCase()}`,
  );
  await fill(false);
  await shot(`${SECOND}-missed`);
  await hand();
  await settle();
  forms.add(`1:${q.form}`);
  expect(same(await tool(I), { band: 'start', seg: '0' }), 'two easy misses: the tool stays dim — « À reprendre »');
  await page.waitForSelector(`[data-lk-example="${I}"]`);
  {
    const c = await cur();
    expect(c.kind === 'example' && c.level === 1, 'the workshop: at the easy level');
  }
  await H.revealWorkshop();
  await page.click('[data-lk-try]');
  await page.waitForSelector('[data-lk-qphase="workshop"]');
  q = (await cur()).q;
  expect(
    q.item === I && q.level === 1 && q.gesture === SECOND,
    `two questions LIKE the one he missed: the ${SECOND === 'place' ? 'flag' : SECOND} again`,
  );
  await ans(false);
  await ans(false);
  await page.waitForSelector('[data-lk-result]');
  expect(
    (await page.getAttribute('[data-lk-score]', 'data-lk-score')) === '0/2' &&
      (await bands()) === 'start' &&
      (await page.locator('[data-lk-go]').count()) === 0 &&
      (await page.getAttribute('[data-lk-gate]', 'data-lk-gate')) === I &&
      /capsule/i.test(await page.textContent('.lk-result h3')),
    'everything missed: 0 / 2 — the take-off is replaced by ONE capsule, the one of this core tool',
  );
  await shot('gate');
  await page.click('[data-lk-capsule-start]');
  await page.waitForSelector('[data-lk-capsule-step="card"]');
  expect(
    (await page.locator('[data-lk-capsule-card] li').count()) === T.memo &&
      (await page.locator('.lk-capsteps li').count()) === (T.labTool ? 4 : 3) &&
      (await page.locator('.lk-capsteps li.is-now').count()) === 1 &&
      (T.labTool || !(await page.textContent('.lk-capsteps')).includes('À toi d’essayer')),
    `the capsule shows its ${T.labTool ? 'four steps' : 'three steps (no lab: the tool has no instrument)'}; first the card of the tool (${T.memo} lines)`,
  );
  await shot('capsule-card');
  await page.click('[data-lk-capsule-next]');
  await page.waitForSelector('[data-lk-capsule-step="example"]');
  await H.revealCapsule();
  await shot('capsule-example');
  if (T.labTool) {
    await page.click('[data-lk-capsule-next]');
    await page.waitForSelector('[data-lk-capsule-step="lab"]');
    await shot('capsule-lab');
    await H.capsuleLab(
      T.labTool,
      'capsule-instrument',
      'then the instrument of the tool, in the lab, with his own numbers',
    );
  } else {
    // LaunchKit.jsx: with no instrument, the last step of the example offers « Aux questions » (L.toQuestions)
    expect(
      (await page.locator('[data-lk-capsule-lab]').count()) === 0 &&
        (await page.textContent('[data-lk-capsule-next]')).includes('Aux questions'),
      'no instrument: the example leads straight to the two questions — no lab step, no « Mon labo » button',
    );
  }
  await page.click('[data-lk-capsule-next]');
  await page.waitForSelector('[data-lk-qphase="capsule"]');
  for (let i = 0; i < 2; i += 1) {
    q = (await cur()).q;
    expect(q.item === I && q.level === 1, `capsule question ${i + 1}: an easy one of the tool (${q.gesture})`);
    forms.add(`1:${q.form}`);
    await fill(false);
    if (i === 0) await shot(`capsule-${q.gesture}`);
    await hand();
    await settle();
  }
  await page.waitForSelector('[data-lk-capsule-end="done"]');
  expect(
    (await page.locator('[data-lk-go]').count()) === 1 && (await page.locator('[data-lk-gate]').count()) === 0,
    'both capsule answers missed — and the door is OPEN: the capsule is passed by doing it, never a second lock',
  );
  expect(
    (await page.getAttribute(`[data-lk-kcard="${I}"]`, 'data-lk-band')) === 'start' &&
      (await kcard(I)).includes('capsule faite') &&
      (await page.textContent('[data-lk-revise]')).includes(T.home),
    'the tool stays « À reprendre », flagged « capsule faite » — nothing is pretended; its lesson to revise',
  );
  {
    const k = await kit(ids[2]);
    expect(
      k.items[I].capsule === true && k.items[I].band === 'start' && k.lessons[id].tries === 1,
      'the toolbox remembers the capsule; it is not a new try',
    );
  }
  await shot('capsule-end');

  // ══ 4. a student who misses the stations and the workshop, then answers the capsule right: repaired, take-off ══
  page = await H.open(ids[3]);
  await H.begin();
  await ans(false);
  await ans(false);
  await page.waitForSelector(`[data-lk-example="${I}"]`);
  await H.revealWorkshop();
  await page.click('[data-lk-try]');
  await page.waitForSelector('[data-lk-qphase="workshop"]');
  await ans(false);
  await ans(false);
  await page.waitForSelector('[data-lk-result]');
  expect(
    (await page.getAttribute('[data-lk-gate]', 'data-lk-gate')) === I,
    'everything missed: the gate asks the capsule of the tool',
  );
  await page.click('[data-lk-capsule-start]');
  await page.waitForSelector('[data-lk-capsule-step="card"]');
  await page.click('[data-lk-capsule-next]');
  await page.waitForSelector('[data-lk-capsule-step="example"]');
  await H.revealCapsule();
  if (T.labTool) {
    await page.click('[data-lk-capsule-next]');
    await page.waitForSelector('[data-lk-capsule-step="lab"]');
  } else
    expect(
      (await page.locator('[data-lk-capsule-lab]').count()) === 0,
      'no instrument: no lab step in this capsule either',
    );
  await page.click('[data-lk-capsule-next]');
  await page.waitForSelector('[data-lk-qphase="capsule"]');
  for (let i = 0; i < 2; i += 1) {
    q = (await cur()).q;
    expect(q.item === I && q.level === 1, `capsule question ${i + 1}: an easy one of the tool (${q.gesture})`);
    forms.add(`1:${q.form}`);
    await fill(true);
    await shot(`capsule-right-${i + 1}-${q.gesture}`);
    expect((await H.handAndHear()).kind === 'good', `capsule question ${i + 1} answered right: ✓`);
  }
  await page.waitForSelector('[data-lk-capsule-end="repaired"]');
  expect(
    (await page.locator('[data-lk-go]').count()) === 1 &&
      (await page.locator('[data-lk-gate]').count()) === 0 &&
      (await page.getAttribute('[data-lk-score]', 'data-lk-score')) === '1/2' &&
      (await page.getAttribute(`[data-lk-kcard="${I}"]`, 'data-lk-band')) === 'consolidate' &&
      (await kcard(I)).includes('Réparé à l’instant'),
    'both capsule answers right: the tool rises to « À consolider » (« Réparé à l’instant »), 1 / 2, the door open',
  );
  {
    const k = await kit(ids[3]);
    expect(
      k.items[I].band === 'consolidate' &&
        k.items[I].repaired === true &&
        k.items[I].capsule === true &&
        k.lessons[id].tries === 1,
      'the toolbox: the tool repaired by its capsule, one try',
    );
  }
  await shot('capsule-repaired');
  await H.takeOff('take-off after the capsule: the world of the lesson plays');

  // the tool's own forms (families.js › forms): EVERY easy form the family declares — the station's two, and the others
  // through the capsule (`pickForm` takes the form used least: 4e.m1.r06's « power » is the capsule's first question) —
  // and the harder sort. STRICT again since 2026-11-23 (the capsule's forms were not counted: the NOTE said « never asked »)
  const easy = FAMILIES[I]?.forms?.[1] ?? ['write', 'place'];
  const want = [...easy.map((f) => `1:${f}`), '2:sort'];
  expect(
    want.every((f) => forms.has(f)),
    `the launch asked every easy form of the tool and its harder sort: ${want.join(', ')} (${[...forms].join(' ')})`,
  );
  await H.done();
}

/**
 * TWO tools of the descriptor's choosing (lesson 8: the PGCD of 4AM, then the equal fractions of 1AM — the learning net
 * gives both, core, in that order): the three students of the two-tool walks above, with every question judged by the
 * shared `fill` (write — numbers, PGCD, fractions with a bar —, sort, place). `tools` = [first, second], each
 * `{ item, name, year, home, firstOk(q), second }` — `second`: the gesture of a tool's second easy question; `firstOk`
 * judges the launch's very first question (the first tool's only).
 */
export async function walkLaunchPair({
  id,
  url,
  grade,
  outName,
  ids,
  alien = [],
  alienLabel = 'another lesson',
  tools,
}) {
  const [T1, T2] = tools.map((t) => ({ ...t, labTool: FAMILIES[t.item]?.labTool ?? null }));
  const H = harness({
    id,
    url,
    grade,
    outName,
    alien: ownToolsAside(alien, [T1.item, T2.item]),
    alienLabel,
  });
  const { expect, shot, cur, tool, same, bands, kcard, kit, fill, hand, settle, answer } = H;
  const seen = new Set();
  const note = async () => {
    const { q } = await cur();
    seen.add(`${q.item}:${q.level}:${q.form}`);
    return q;
  };
  const ans = async (right) => {
    await note();
    return answer(right);
  };

  // ══ 1. a student who knows: both tools charged by four right answers; take-off ══
  let page = await H.open(ids[0]);
  expect(
    (
      await page
        .locator('[data-lk-tool]')
        .evaluateAll((els) => els.map((e) => `${e.dataset.lkTool}:${e.dataset.lkBand}:${e.dataset.lkSegments}`))
    ).join() === `${T1.item}:waiting:0,${T2.item}:waiting:0`,
    `the bag holds the TWO tools the learning net gives this lesson (${T1.item}, then ${T2.item}), both empty`,
  );
  {
    const t = (await page.textContent('[data-lk-bag]')) ?? '';
    expect(
      [T1, T2].every((x) => t.includes(x.name) && (!x.year || t.includes(x.year))),
      `each tool is named in the student’s words, with the year it comes from (« ${T1.name} », « ${T2.name} »)`,
    );
  }
  await shot('bag');
  await H.begin();
  let q = await note();
  expect(
    q.item === T1.item && q.level === 1 && q.gesture === 'write' && T1.firstOk(q),
    `the first question is a very easy one of « ${T1.name} »`,
  );
  await fill(true);
  await shot('t1-write');
  await hand();
  await page.waitForSelector('[data-lk-signal="good"]');
  expect((await tool(T1.item)).seg === '1', 'a right answer lights one segment of the tool at once');
  await settle();
  q = await note();
  expect(q.item === T1.item && q.level === 2, `then a harder one of « ${T1.name} » (${q.gesture})`);
  await fill(true);
  await shot('t1-hard');
  await hand();
  await settle();
  expect(same(await tool(T1.item), { band: 'solid', seg: '2' }), `two right answers: « ${T1.name} » is « Solide »`);
  q = await note();
  expect(
    q.item === T2.item && q.level === 1 && q.gesture === 'write',
    `then the second tool, « ${T2.name} »: an easy one to write`,
  );
  await fill(true);
  await shot('t2-write');
  await hand();
  await settle();
  q = await note();
  expect(q.item === T2.item && q.level === 2, `then a harder one of « ${T2.name} » (${q.gesture})`);
  await fill(true);
  await shot('t2-hard');
  await hand();
  await settle();
  await page.waitForSelector('[data-lk-result]');
  expect(
    (await page.getAttribute('[data-lk-score]', 'data-lk-score')) === '4/4' &&
      same(await tool(T1.item), { band: 'solid', seg: '2' }) &&
      same(await tool(T2.item), { band: 'solid', seg: '2' }) &&
      (await page.locator('[data-lk-go]').count()) === 1,
    'four right answers: 4 / 4, both tools « Solide », the take-off open',
  );
  await shot('result-solid');
  {
    const k = await kit(ids[0]);
    expect(
      k.items[T1.item].band === 'solid' && k.items[T2.item].band === 'solid' && k.lessons[id].tries === 1,
      'the result is written in the student’s toolbox: both tools, one try',
    );
  }
  await H.takeOff('take-off: the launch closes and the world of the lesson plays');

  // ══ 2. a student who slips: T1's harder one, T2's first — two « À consolider », the workshop on T1 ══
  page = await H.open(ids[1]);
  await H.begin();
  await ans(true);
  q = await note();
  expect(q.item === T1.item && q.level === 2, `the first right: the harder one of « ${T1.name} » comes`);
  await fill(false);
  await hand();
  await settle();
  expect(same(await tool(T1.item), { band: 'consolidate', seg: '1' }), 'one right, one missed: « À consolider »');
  q = await note();
  expect(q.item === T2.item && q.level === 1, 'the workshop waits: the second tool is measured first');
  await ans(false);
  q = await note();
  expect(
    q.item === T2.item && q.level === 1 && q.gesture === T2.second,
    `a second easy one of « ${T2.name} » by another gesture (${q.gesture})`,
  );
  await fill(true);
  await hand();
  await settle();
  q = await note();
  expect(q.item === T2.item && q.level === 2, `missed then right: the harder one of « ${T2.name} »`);
  await ans(true);
  expect(same(await tool(T2.item), { band: 'consolidate', seg: '1' }), `« ${T2.name} » is « À consolider » too`);
  await page.waitForSelector(`[data-lk-example="${T1.item}"]`);
  await shot('workshop-mistake');
  {
    const steps = await H.revealWorkshop();
    expect(steps >= 3, `the workshop opens on the FIRST tool: a worked example (${steps} steps)`);
  }
  await shot('workshop-example');
  await page.click('[data-lk-try]');
  await page.waitForSelector('[data-lk-qphase="workshop"]');
  q = await note();
  expect(q.item === T1.item, `after the worked example, questions of « ${T1.name} » again (${q.gesture})`);
  await shot('workshop-question');
  await ans(true);
  await ans(true);
  await page.waitForSelector('[data-lk-result]');
  expect(
    (await page.getAttribute('[data-lk-score]', 'data-lk-score')) === '2/4' &&
      (await bands()) === 'consolidate,consolidate' &&
      (await kcard(T1.item)).includes('Réparé à l’instant') &&
      !(await kcard(T2.item)).includes('Réparé à l’instant') &&
      (await page.locator('[data-lk-go]').count()) === 1,
    `repaired, « ${T1.name} » keeps « À consolider »: 2 / 4 — and the door is open`,
  );
  expect(
    (await page.getAttribute('[data-lk-revise]', 'data-lk-revise')) === T2.item &&
      (await page.textContent('[data-lk-revise]')).includes(T2.home),
    `what to revise first is the tool NOT repaired: « ${T2.home} »`,
  );
  await shot('result-repaired');

  // ══ 3. a student who misses everything: ONE capsule — T1's — then the door opens whatever he answers ══
  page = await H.open(ids[2]);
  await H.begin();
  await ans(false);
  q = await note();
  expect(
    q.item === T1.item && q.level === 1 && q.gesture === T1.second,
    `a tool is never judged on one answer: a second easy question, by another gesture (${q.gesture})`,
  );
  await ans(false);
  expect(same(await tool(T1.item), { band: 'start', seg: '0' }), `two easy misses: « ${T1.name} » is « À reprendre »`);
  q = await note();
  expect(q.item === T2.item && q.level === 1, 'then the second tool is measured too');
  await ans(false);
  await ans(false);
  expect(same(await tool(T2.item), { band: 'start', seg: '0' }), `two easy misses: « ${T2.name} » too`);
  await page.waitForSelector(`[data-lk-example="${T1.item}"]`);
  await H.revealWorkshop();
  await page.click('[data-lk-try]');
  await page.waitForSelector('[data-lk-qphase="workshop"]');
  await ans(false);
  await ans(false);
  await page.waitForSelector('[data-lk-result]');
  expect(
    (await page.getAttribute('[data-lk-score]', 'data-lk-score')) === '0/4' &&
      (await bands()) === 'start,start' &&
      (await page.locator('[data-lk-go]').count()) === 0 &&
      (await page.getAttribute('[data-lk-gate]', 'data-lk-gate')) === T1.item,
    `everything missed: 0 / 4 — ONE capsule, the first core tool's (« ${T1.name} »)`,
  );
  await shot('gate');
  await page.click('[data-lk-capsule-start]');
  await page.waitForSelector('[data-lk-capsule-step="card"]');
  expect(
    (await page.locator('[data-lk-capsule-card] li').count()) === FAMILIES[T1.item].memo.length,
    `the capsule opens on the card of the tool (${FAMILIES[T1.item].memo.length} lines)`,
  );
  await shot('capsule-card');
  await page.click('[data-lk-capsule-next]');
  await page.waitForSelector('[data-lk-capsule-step="example"]');
  expect((await H.revealCapsule()) >= 3, 'then a worked example');
  await shot('capsule-example');
  if (T1.labTool) {
    await page.click('[data-lk-capsule-next]');
    await page.waitForSelector('[data-lk-capsule-step="lab"]');
    await H.capsuleLab(
      T1.labTool,
      'capsule-instrument',
      `then the instrument of the tool in the lab: « ${T1.labTool} »`,
    );
  }
  await page.click('[data-lk-capsule-next]');
  await page.waitForSelector('[data-lk-qphase="capsule"]');
  await ans(false);
  await ans(false);
  await page.waitForSelector('[data-lk-capsule-end="done"]');
  expect(
    (await page.locator('[data-lk-go]').count()) === 1 &&
      (await kcard(T1.item)).includes('capsule faite') &&
      !(await kcard(T2.item)).includes('capsule faite'),
    `both capsule answers missed — the door is OPEN; « ${T1.name} » flagged « capsule faite », the other not`,
  );
  expect(
    (await page.textContent('[data-lk-revise]')).includes(T1.home),
    `what to revise is ONE lesson: the home lesson of « ${T1.name} » (« ${T1.home} »)`,
  );
  {
    const k = await kit(ids[2]);
    expect(
      k.items[T1.item].capsule === true && !k.items[T2.item].capsule && k.lessons[id].tries === 1,
      'the toolbox remembers ONE capsule; it is not a new try',
    );
  }
  await shot('capsule-done');
  console.log(`NOTE  the forms met: ${[...seen].sort().join(', ')}`);
  await H.done();
}
