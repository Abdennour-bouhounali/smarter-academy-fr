/**
 * THE AUTHORING KIT, vitest side — the checks every lesson of a game world hand-wrote, as SHARED SUITES a lesson's test
 * calls in three lines (it names no lesson: the lesson is the argument). Each suite is what the three lessons built on
 * « L’archipel des diviseurs » checked by hand, generalised; a lesson keeps in its own test file only what is ITS OWN (the numbers
 * of its road, the false rules its students hold, the mistakes of its trainer).
 *
 *   describeStory      the road is solvable, `onArrive` bears being run twice, the numbers are the platform's own, the
 *                      tablets are true and short, the sentences agree with their numbers, no rule before its key
 *   describeForges     exactly one rule holds and every other is refuted by a computed case on every road; evidence,
 *                      attacks, nudges, the last step, the words; no pair of the bank in the mirror
 *   describeExperiments no two keys share a (kind, mode); no sentence of an experiment names a rule
 *   describeEvidence   `verifyClaim(claim) === check(q, v).ok` for every answer a student can write
 *   describeTrainer    every question accepts its solution and refuses a wrong answer; ≤ 3 answers a line; true hints
 *   describeKnowledge  the map: every card placed, reachable, laid out; every memo sheet complete and computed
 *   describeLimits     the data stays inside the limits the walks proved (`trusted.md`)
 *   describeSitting    the « brevet blanc » serves the bank as it is
 * Usage and a skeleton of every test file: `authoring/README.md`. Proved on two real lessons: `authoring/proof.*.test.js`.
 */
import { describe, it, expect } from 'vitest';
import { complete, ruleKey, runOn, testsOf } from '../../forge';
import { verifyClaim } from '../../claims';
import { guardEvidence } from '../../evidence';
import { rng } from '../../random';
import { keysOfPoints } from '../../bankSitting';
import { allQuestions, forgotten } from '../../sitting';
import { boxesOf, pairKey, partsOf } from '../forgeBlocks';
import { CELLS, COINS, DIVISIONS, PLANKS, ROWS, SUBTRACTIONS, gcd, range } from '../numbers';
import { alone, bankPairs, islandNamesIn, linesWithBoth, pairLines, readBank, storiesOf } from './bank.js';
// the one rule of a bridge with a marked stretch (pure, no three.js): the islands' stories are what this suite reads
import { markVerdict } from '../../../divisorIsles/mark.js';

// ───────────────────────── what a test asks of a forge and of a road (never needed by the app) ─────────────────────────

/** Every rule the tiles of a forge can write: the product of its slots' options. */
export const allRules = (forge) =>
  forge.slots.reduce((rules, s) => rules.flatMap((rule) => s.options.map((o) => ({ ...rule, [s.id]: o.id }))), [{}]);

/**
 * Planks of `b` HOLD a gap of `a` cells: they fill it — and when its first `mark` cells are marked (a bridge with a
 * marked stretch, `divisorIsles/mark.js`), a joint also falls on the post: `markVerdict(a, mark, b).holds`.
 */
export const holdsGap = (a, b, mark = null) => b >= 1 && (mark == null ? a % b === 0 : markVerdict(a, mark, b).holds);
/** Planks of `b` hold this segment of a road (its `a`, and its `mark` when it has one). */
export const holdsOn = (seg, b) => holdsGap(seg.a, b, seg.mark ?? null);

/**
 * The plank lengths among `candidates` (default 1 … the longest gap) that build EVERY gap of a road with the coins of
 * its purse — a coin per plank laid, whatever its length (GAME_WORLD.md §2ter-1). A gap of 0 cells costs nothing.
 * `marks` (optional, one per gap, null for an unmarked one): a marked gap holds only planks that also put a joint on
 * its post (`holdsGap`). A road is solvable for the student when this list holds exactly the plank the story expects.
 */
export function buildersOf(gaps, purse = Infinity, candidates = range(1, Math.max(...gaps)), marks = []) {
  return candidates.filter(
    (b) =>
      b >= 1 && gaps.every((a, i) => holdsGap(a, b, marks[i] ?? null)) && gaps.reduce((n, a) => n + a / b, 0) <= purse,
  );
}

// ───────────────────────── what every sentence must be ─────────────────────────

/** Nothing undefined, NaN, null or an object printed into a sentence. */
export const said = (x) => expect(String(x), String(x)).not.toMatch(/undefined|NaN|null|\[object/);
/** A string the screen writes as PLAIN text (not through MathText) carries no formula: no `$`, no backslash. */
export const plain = (x) => {
  said(x);
  expect(String(x), String(x)).not.toMatch(/\$|\\/);
};

/** A side written plainly: each PGCD of numbers by its value, × as *, the minus sign as -, no LaTeX space. */
const normalSide = (side) =>
  side
    .replace(/\\mathrm\{PGCD\}\s*\((\d+)\s*;\s*(\d+)\)|PGCD\s*\((\d+)\s*;\s*(\d+)\)/g, (_, a, b, c, d) =>
      String(gcd(Number(a ?? c), Number(b ?? d))),
    )
    .replace(/\\times|×/g, '*')
    .replace(/−/g, '-')
    .replace(/\\,|\\;|\\ /g, '')
    .trim();

/** The value of an arithmetic side: « 19 \\times 4 + 3 », « 152 - 95 », « \\mathrm{PGCD}(32 ; 44) »; null if not one. */
export function valueOf(side) {
  const t = normalSide(side);
  if (!/^\d+(\s*[-+*]\s*\d+)*$/.test(t)) return null;
  const tokens = t.match(/\d+|[-+*]/g);
  let sum = 0;
  let sign = 1;
  let prod = Number(tokens[0]);
  for (let i = 1; i < tokens.length; i += 2) {
    const [op, n] = [tokens[i], Number(tokens[i + 1])];
    if (op === '*') prod *= n;
    else {
      sum += sign * prod;
      sign = op === '+' ? 1 : -1;
      prod = n;
    }
  }
  return sum + sign * prod;
}

/** [n, d] in lowest terms, d > 0 — or null for a denominator 0. */
const ratio = (n, d) => {
  if (d === 0) return null;
  const g = gcd(Math.abs(n), Math.abs(d)) || 1;
  return d < 0 ? [-n / g, -d / g] : [n / g, d / g];
};
/**
 * The value of a side as a FRACTION [n, d] (lowest terms): an arithmetic side (`valueOf`) is [v, 1]; a side may also hold
 * fractions `\\frac{p}{q}` (`\\dfrac`, `\\tfrac`) whose terms are arithmetic, joined by + − × — « \\frac{5}{39} +
 * \\frac{8}{39} », « \\frac{2}{3} \\times \\frac{9}{4} ». null when it is not one (a letter, a box, a ÷ inside a term).
 */
export function fractionOf(side) {
  const fracs = [];
  let bad = false;
  const t = normalSide(
    side.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, (_, x, y) => {
      const r = valueOf(x) != null && valueOf(y) != null ? ratio(valueOf(x), valueOf(y)) : null;
      if (!r) bad = true;
      fracs.push(r);
      return ` F${fracs.length - 1} `;
    }),
  );
  if (bad || !/^(F\d+|\d+)(\s*[-+*]\s*(F\d+|\d+))*$/.test(t)) return null;
  const tokens = t.match(/F\d+|\d+|[-+*]/g);
  const val = (x) => (x[0] === 'F' ? fracs[Number(x.slice(1))] : [Number(x), 1]);
  const add = ([a, b], [c, d], sign) => ratio(a * d + sign * c * b, b * d);
  let sum = [0, 1];
  let sign = 1;
  let prod = val(tokens[0]);
  for (let i = 1; i < tokens.length; i += 2) {
    const [op, x] = [tokens[i], val(tokens[i + 1])];
    if (op === '*') prod = ratio(prod[0] * x[0], prod[1] * x[1]);
    else {
      sum = add(sum, prod, sign);
      sign = op === '+' ? 1 : -1;
      prod = x;
    }
  }
  return add(sum, prod, sign);
}

/**
 * Every equality of a formula is TRUE: its parts (split by `\\qquad`), each side that is arithmetic, a PGCD of numbers,
 * or fractions of numbers — two fractions are equal by CROSS-MULTIPLICATION (« \\frac{66}{78} = \\frac{11}{13} »:
 * 66 × 13 = 78 × 11). Returns how many equalities were checked (a side with a letter or a box is skipped).
 */
export function equalitiesHold(formula) {
  let checked = 0;
  for (const part of formula.split(/\\qquad|\\quad/)) {
    const sides = part.split('=').map(fractionOf);
    if (sides.length < 2 || sides.some((v) => v == null)) continue;
    const [[n0, d0]] = sides;
    for (const [n, d] of sides.slice(1)) expect(n * d0, formula).toBe(n0 * d);
    checked += 1;
  }
  return checked;
}

/** Every `$…$` of a sentence is true. Returns how many. */
export const trueEqualities = (text) =>
  [...String(text).matchAll(/\$([^$]+)\$/g)].reduce((n, m) => n + equalitiesHold(m[1]), 0);

/** The bidi controls the Arabic product wrapped its equalities in (LRI, PDI, LRM, RLM…): a French sentence holds none. */
export const BIDI = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/;

/** The tables of the world's counted nouns that every sentence is read against (numbers.js; the tiles of the palace). */
export const NOUNS = [COINS, PLANKS, DIVISIONS, SUBTRACTIONS, ROWS, CELLS, ['dalle', 'dalles'], ['caisse', 'caisses']];

const escape = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/**
 * The places where a number is glued to a noun with the wrong agreement: « 1 dalles », « 0 planches », « 3 dalle » — French
 * takes the singular for 0 and 1, the plural from 2 on (`counted`). Forms [singular, plural]; a noun whose two forms are
 * the same (« fois ») is never wrong. The number is a whole number (« 0,25 dalle » is not read: its « 25 » follows a
 * comma). A plain or a no-break space may join them. [] when the sentence agrees. (`past100`, an option of the Arabic
 * agreement, is accepted and ignored.)
 */
export function agreementErrors(text, tables = NOUNS) {
  const errors = [];
  for (const [one, many] of tables) {
    if (!one || !many || one === many) continue;
    const re = new RegExp(
      `(?<![\\d.,\\u202f])(\\d+)[ \\u00a0](${escape(many)}|${escape(one)})(?![\\p{L}\\p{M}])`,
      'gu',
    );
    for (const m of String(text).matchAll(re)) {
      const n = Number(m[1]);
      if ((n < 2 && m[2] === many) || (n >= 2 && m[2] === one)) errors.push(m[0]);
    }
  }
  return errors;
}

/** The words of a sentence, its formulas (`$…$`) left out: LaTeX writes its own punctuation. */
const wordsOf = (text) => String(text).replace(/\$[^$]*\$/g, ' ');
/**
 * The French typography mistakes a lesson author can make (`FRENCH_LANGUAGE_CONTRACT.md` §4), outside the formulas:
 *   space   no space, or a plain one, before « : », « ; », « ! », « ? » (U+00A0 before « : », U+202F before the others —
 *           either no-break space is accepted)
 *   quote   « … » without a no-break space inside
 *   apos    a straight apostrophe between two letters (« l'île »: « l’île »)
 *   ordinal « 3ème », « 2eme », « 1ère » (« 3e », « 1re »)
 *   arabic  an Arabic comma, semicolon or question mark (U+060C, U+061B, U+061F)
 *   bidi    a bidi control (BIDI)
 * → [{ kind, at }] — [] when the sentence is clean.
 */
export function typographyErrors(text) {
  const w = wordsOf(text);
  const errors = [];
  const find = (kind, re) => {
    for (const m of w.matchAll(re)) errors.push({ kind, at: m[0] });
  };
  find('space', /(?<=[^\s\u00a0\u202f(«])[:;!?](?!\/\/)/gu);
  find('space', / [:;!?]/g);
  find('quote', /«(?![\u00a0\u202f])|(?<![\u00a0\u202f])»/g);
  find('apos', /\p{L}'\p{L}/gu);
  find('ordinal', /\d+\s?(?:ème|eme|ième|ère)(?!\p{L})/gu);
  find('arabic', /[\u060c\u061b\u061f]/g);
  if (BIDI.test(String(text))) errors.push({ kind: 'bidi', at: String(text).match(BIDI)[0] });
  return errors;
}
/**
 * Kept name (lessons call it): true when the sentence breaks French typography (`typographyErrors`) — the Arabic check
 * it replaced read only a list that could start a line with its comma, which French lists (« 1, 2 et 4 ») cannot.
 */
export const looseComma = (text) => typographyErrors(text).length > 0;

/** Every string inside a value (objects and arrays walked; functions skipped). */
export const stringsIn = (x, out = []) => {
  if (typeof x === 'string') out.push(x);
  else if (Array.isArray(x)) x.forEach((y) => stringsIn(y, out));
  else if (x && typeof x === 'object') Object.values(x).forEach((y) => stringsIn(y, out));
  return out;
};

// ───────────────────────── the story ─────────────────────────

/** A game the story's hooks can be played on: what they read is real; any other command does nothing. */
function fakeGame(story, held) {
  const opened = [];
  const modules = [];
  const segs = story.segments.map((s, index) => ({ ...s, index, complete: false, builtWith: null }));
  const base = {
    T: story.text,
    state: { keys: [...held], stage: 0, phase: 'play', held: null },
    flags: {},
    isl: story.islands,
    segs,
    log: [],
    openForge: (k) => opened.push(k),
    onModule: (m) => modules.push(m),
  };
  const game = new Proxy(base, { get: (t, p) => (p in t ? t[p] : () => undefined) });
  return { game, opened, modules };
}
/** The convoys of a road, in order: { id, segs: [segment…], head: index }. */
export const convoysOf = (segments) => {
  const out = [];
  segments.forEach((s, i) => {
    if (!s.convoy) return;
    const last = out.at(-1);
    if (last?.id === s.convoy && last.end === i - 1) {
      last.segs.push(s);
      last.end = i;
    } else out.push({ id: s.convoy, segs: [s], head: i, end: i });
  });
  return out;
};

/**
 * What the student can try on a convoy, and which of it builds the whole convoy within its purse: the lengths its head's
 * workshop makes, the planks a store sells (a store inside a convoy: its options, paid from the convoy's purse), or the
 * planks its head island offers. Marked gaps (`mark`) are held only by planks with a joint on the post.
 */
export function convoyBuilders(story, convoy) {
  const head = convoy.segs[0];
  const w = head.workshop;
  const candidates = w ? range(w.min ?? 1, w.max) : head.boss ? head.boss.options : head.moulds;
  const purse = story.convoys?.[convoy.id]?.purse ?? Infinity;
  const gaps = convoy.segs.map((s) => s.a);
  const marks = convoy.segs.map((s) => s.mark ?? null);
  return { candidates, purse, builders: candidates?.length ? buildersOf(gaps, purse, candidates, marks) : [] };
}

/**
 * The options of the store (the last bridge, `boss`) that HOLD it within the purse — of its convoy when it stands in one
 * (several options may hold the post; the purse pays only the right one), or with no purse. Exactly [holdsWith] when
 * the store is right.
 */
export function storeHolders(story) {
  const boss = story.segments.find((s) => s.boss);
  if (!boss) return [];
  const convoy = boss.convoy && convoysOf(story.segments).find((c) => c.segs.includes(boss));
  if (convoy) return convoyBuilders(story, convoy).builders;
  return boss.boss.options.filter((b) => holdsOn(boss, b));
}

/**
 * THE STORY — `world/story.js` (and its tablets).
 *
 *   describeStory({ id: '<lesson id>', story: STORY, tablets: TABLETS, keys: KEYS,
 *     before: { '<key>': { words: /garde|commun/, lines: [STORY.text.say.hello, …] } } });
 *
 * opts:
 *   id, story, tablets, keys     the lesson
 *   pairs        more pairs of the road to check (a mirror's fold, a forge's numbers): each convoy's gaps are checked
 *                anyway, two by two
 *   headline     numbers that must be in no other story (default: every gap ≥ 100 of a convoy and the last bridge)
 *   notInBank    numbers that must be nowhere in the bank (default: the last bridge's gap)
 *   before       per key, the sentences played BEFORE its forge and the words they must not hold (its name, its rule)
 *   sentences    sentences built by the story's functions, read for agreement and commas with its fixed strings
 *   dashMax      the largest number of the gate dash (mental arithmetic, default 100)
 *   agreement    (ignored: the option of the Arabic agreement; French agreement has none)
 *   tablet       { lines: 2, math: 2, notes: 1 } — what the board's naming card holds (defects.md B17)
 */
export function describeStory(opts) {
  const { id, story, tablets, keys, before = {}, sentences = [], dashMax = 100 } = opts;
  const T = { lines: 2, math: 2, notes: 1, ...opts.tablet };
  const bridges = story.segments.filter((s) => s.kind === 'bridge');
  const boss = story.segments.find((s) => s.boss);
  const convoys = convoysOf(story.segments);

  describe(`the story of « ${id} » — the shared checks (authoring/test/suites.js › describeStory)`, () => {
    const bank = readBank(id);
    const pairs = bankPairs(bank);
    const others = storiesOf({ exceptId: id });

    it('the road: one island more than segments, ids unique, every bridge holds with its plank, the store last', () => {
      expect(story.islands).toHaveLength(story.segments.length + 1);
      const ids = story.segments.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const s of bridges) {
        expect(s.holdsWith, s.id).toBeGreaterThanOrEqual(1);
        // it fills the gap — and, on a marked bridge, a joint falls on the post (mark.js)
        expect(
          holdsOn(s, s.holdsWith),
          `${s.id}: ${s.holdsWith} does not hold ${s.a}${s.mark != null ? ` marked ${s.mark}` : ''}`,
        ).toBe(true);
        if (s.mark != null) {
          expect(s.mark, s.id).toBeGreaterThan(0);
          expect(s.mark, s.id).toBeLessThanOrEqual(s.a);
        }
        if (s.strokes) {
          expect(s.mark, `${s.id}: strokes without a mark`).toBeDefined();
          for (const k of s.strokes) expect(k, s.id).toBeGreaterThan(0);
          expect(
            s.strokes.reduce((n, k) => n + k, 0),
            `${s.id}: the strokes add up to the mark`,
          ).toBe(s.mark);
        }
        if (s.moulds?.length && !s.convoy && !s.boss) expect(s.moulds, s.id).toContain(s.holdsWith);
      }
      expect(story.segments.filter((s) => s.boss)).toHaveLength(boss ? 1 : 0);
      if (boss) {
        expect(story.segments.at(-1)).toBe(boss);
        // the ONE option that holds within the purse (a store in a convoy may sell several that hold the post)
        expect(storeHolders(story), `the store ${boss.id}`).toEqual([boss.holdsWith]);
        expect(boss.boss.price).toBeGreaterThan(0);
      }
      const names = story.islands.map((x) => x.name);
      expect(new Set(names).size).toBe(names.length);
      for (const n of names) expect(n, n).not.toMatch(/\d/);
    });

    it('every convoy is solvable: its plank exists, holds every gap (and post), the purse pays it — and no other does', () => {
      for (const c of convoys) {
        const [head, ...tail] = c.segs;
        const gaps = c.segs.map((s) => s.a);
        const marks = c.segs.filter((s) => s.mark != null).map((s) => `${s.a} marked ${s.mark}`);
        const plank = head.holdsWith;
        for (const s of c.segs) expect(s.holdsWith, s.id).toBe(plank);
        for (const s of tail) {
          expect(s.moulds ?? [], s.id).toEqual([]);
          expect(s.workshop, s.id).toBeUndefined();
          expect(story.islands[story.segments.indexOf(s)].feature, s.id).not.toBe('anvil');
        }
        if (head.workshop) expect(story.islands[c.head].feature, c.id).toBe('anvil');
        // what he can try: every length its workshop makes, the planks a store sells, or those the head island offers
        const { candidates, purse, builders } = convoyBuilders(story, c);
        expect(candidates?.length, `${c.id}: no plank to try`).toBeGreaterThan(0);
        expect(builders, `${c.id} ${gaps.join(', ')} ${marks.join(', ')} (purse ${purse})`).toEqual([plank]);
      }
    });

    it('`onArrive` bears being run twice; a forge opens only while its key is missing; `pendingForge` agrees', () => {
      for (let n = 0; n <= keys.length; n += 1) {
        const held = keys.slice(0, n);
        const passes = [0, 1].map(() => {
          const { game, opened } = fakeGame(story, held);
          story.islands.forEach((_, k) => {
            game.state.stage = k;
            story.onArrive(game, k);
          });
          return opened;
        });
        expect(passes[1], `held ${held.join()}`).toEqual(passes[0]);
        for (const k of passes[0]) {
          expect(keys, k).toContain(k);
          expect(held, k).not.toContain(k);
        }
        if (n === keys.length) expect(passes[0]).toEqual([]);
        if (!story.pendingForge) continue;
        story.islands.forEach((_, k) => {
          const { game, opened } = fakeGame(story, held);
          game.state.stage = k;
          story.onArrive(game, k);
          expect(story.pendingForge(game) ?? null, `island ${k}, held ${held.join()}`).toBe(opened[0] ?? null);
        });
      }
      // the tablets closed one by one: what each hook does after it — only keys still missing open, only modules mark
      const { game, opened, modules } = fakeGame(story, []);
      for (const key of keys) {
        game.state.keys = [...game.state.keys, key];
        story.afterKey?.[key]?.(game);
        for (const k of opened) expect(game.state.keys, `after ${key}, the forge of ${k} opened`).not.toContain(k);
        opened.length = 0;
      }
      for (const m of modules) expect(String(m)).toMatch(/^\d+$/);
      for (const key of keys) expect(tablets[key], key).toBeTruthy();
    });

    it('its numbers are the platform’s own: no pair of the bank, of a line of the bank or of another story', () => {
      const road = [
        ...convoys.flatMap((c) => {
          const gaps = c.segs.map((s) => s.a).filter((a) => a > 0);
          return gaps.flatMap((x, i) => gaps.slice(i + 1).map((y) => [x, y]));
        }),
        ...(opts.pairs ?? []),
      ].filter(([x, y]) => x !== y);
      for (const [x, y] of road) {
        expect(pairs.has(pairKey(x, y)), `${x} ; ${y} is a pair of the bank`).toBe(false);
        expect(linesWithBoth(bank, x, y), `${x} ; ${y} stand on a line of the bank`).toEqual([]);
        for (const s of others) expect(pairLines(s.text, x, y), `${x} ; ${y} in ${s.file}`).toEqual([]);
      }
      const headline =
        opts.headline ??
        [...convoys.flatMap((c) => c.segs.map((s) => s.a)), ...(boss ? [boss.a] : [])].filter((n) => n >= 100);
      for (const n of headline) for (const s of others) expect(alone(n).test(s.text), `${n} in ${s.file}`).toBe(false);
      for (const n of opts.notInBank ?? (boss ? [boss.a] : []))
        for (const s of bank.sheets) expect(alone(n).test(s.text), `${n} in ${s.file}`).toBe(false);
      // an island's name is its own: in no other lesson's story
      const theirs = new Set(others.flatMap((s) => islandNamesIn(s.text)));
      for (const island of story.islands) expect(theirs.has(island.name), island.name).toBe(false);
    });

    it('the gate dash: exactly one right gate of three, mental arithmetic, no pair of the bank', () => {
      for (const w of story.dashWaves ?? []) {
        expect(w.gates.filter(w.test), w.say).toHaveLength(1);
        expect(new Set(w.gates).size, w.say).toBe(w.gates.length);
        const ns = (w.say.match(/\d+/g) ?? []).map(Number);
        for (const n of [...ns, ...w.gates]) expect(n, w.say).toBeLessThanOrEqual(dashMax);
        if (ns.length >= 2) expect(pairs.has(pairKey(ns[0], ns[1])), w.say).toBe(false);
      }
    });

    it('the tablets: true equalities, a method of two lines, two formulas, one plain note — no bidi control', () => {
      for (const key of keys) {
        const t = tablets[key];
        expect(t.title && t.lines.length && t.math.length, key).toBeTruthy();
        expect(t.lines.length, key).toBeLessThanOrEqual(T.lines);
        expect(t.math.length, key).toBeLessThanOrEqual(T.math);
        expect((t.notes ?? []).length, key).toBeLessThanOrEqual(T.notes);
        for (const m of t.math) expect(equalitiesHold(m), `${key}: « ${m} » has no equality of numbers`).toBe(1);
        for (const n of t.notes ?? []) {
          plain(n);
          trueEqualities(n);
          // French reads left to right: an equality in a plain sentence needs no isolation, and carries none
          expect(n, `${key}: a bidi control`).not.toMatch(BIDI);
        }
        for (const l of [...t.lines, ...t.math]) said(l);
      }
    });

    it('its sentences agree with their numbers, and their typography is French', () => {
      const all = [...stringsIn(story.text), ...stringsIn(tablets), ...sentences];
      expect(all.length).toBeGreaterThan(10);
      for (const s of all) {
        said(s);
        expect(agreementErrors(s, NOUNS), s).toEqual([]);
        expect(typographyErrors(s), s).toEqual([]);
      }
    });

    it('tells no rule before its key: the islands’ names and every sentence played before each forge', () => {
      for (const [key, { words, lines }] of Object.entries(before)) {
        expect(keys, key).toContain(key);
        expect(lines.length, key).toBeGreaterThan(0);
        for (const line of lines) {
          said(line);
          expect(line, `${key}: ${line}`).not.toMatch(words);
        }
        for (const island of story.islands) expect(island.name, island.name).not.toMatch(words);
      }
    });
  });
}

// ───────────────────────── the forges ─────────────────────────

/**
 * THE FORGES — `world/forges.js`.
 *
 *   describeForges({ forges: FORGES, keys: KEYS, roads: { AT_ONCE, WALKED, EVERY }, before: BEFORE,
 *     solve: SOLVE, forbidden: FORBIDDEN, bank: '<lesson id>' });
 *
 * opts:
 *   roads       { name: { key: log } } — the world's log ([{ a, b }]) each forge is opened on: the right plank at once,
 *               the walk's road, every plank a student tries. A forge must refute every wrong rule on EVERY road
 *   before      { key: log } — the bridges of the earlier convoys, in the log before this mirror (none is his here)
 *   inquiry     { key: result } — what a forge's own experiment handed back (`fromInquiry(result).rows`)
 *   solve       { key: (case) => values } — the right answer of the last step, computed from the case
 *   forbidden   { key: RegExp } — the words of the key's name and of what it states: no sentence before the last step
 *   bank        the lesson's id: the mirror never draws a pair its bank names (read by test/bank.js)
 *   bankPairs   or the Set of those pairs itself (the list a `forges.js` pastes: `lesson-bank-numbers.mjs <id> --js`)
 *   tiles       { key: n } — how many rules the tiles write (optional: a check that the design was kept)
 *   draw        { max: 90, laid: 40, tag: 12 } — what a mirror can draw: the longer gap, planks on one bridge, a log tag
 *   pairOf      (case) => [x, y] | null — the pair a case names (default [c.A, c.B])
 */
export function describeForges(opts) {
  const { forges, keys, roads, before = {}, inquiry = {}, solve, forbidden = {} } = opts;
  const draw = { max: 90, laid: 40, tag: 12, ...opts.draw };
  const pairOf = opts.pairOf ?? ((c) => (c.A != null && c.B != null ? [c.A, c.B] : null));
  const logOf = (key, road) => [...(before[key] ?? []), ...(road[key] ?? [])];
  const rowsOf = (key, road) => {
    const F = forges[key];
    return F.inquiry && inquiry[key] ? F.fromInquiry(inquiry[key]).rows : F.evidence(logOf(key, road));
  };
  const refutedBy = (key, rule, road) => {
    const F = forges[key];
    const rows = rowsOf(key, road);
    const run = runOn(F, rule, testsOf(F, rule, rows));
    return run.bad >= 0 ? { on: 'evidence', c: run.marks[run.bad] } : { on: 'attack', c: F.attacks(rule, rows)[0] };
  };
  const builtCases = (F) =>
    Object.values(roads).flatMap((road) => {
      const rows = rowsOf(F.key, road);
      return [
        ...allRules(F).flatMap((rule) => F.attacks(rule, rows)),
        ...[1, 2, 3].flatMap((n) => F.nudge(n, rows).cases ?? []),
      ];
    });
  const shownCases = (F) => [...Object.values(roads).flatMap((road) => rowsOf(F.key, road)), ...builtCases(F)];
  const chipOf = (F, s, o) => (F.chip ? F.chip(s, o) : o.label);
  /** Every sentence a forge shows BEFORE its last step (the tablet comes after it). */
  const sentences = (F) => {
    const Tx = F.text;
    const rules = allRules(F);
    return [
      ...['title', 'log', 'frame', 'buildLead', 'testing', 'agreed', 'experiment', 'wordsHint', 'survived', 'yes', 'no']
        .map((k) => Tx[k])
        .filter((x) => typeof x === 'string'),
      ...F.slots.flatMap((s) => [s.label, ...s.options.map((o) => o.label)]),
      ...rules.flatMap((r) => [
        F.ruleText(r),
        ...F.slots.map((s) =>
          chipOf(
            F,
            s,
            s.options.find((o) => o.id === r[s.id]),
          ),
        ),
      ]),
      ...shownCases(F).flatMap((c) => [
        Tx.attack(c),
        Tx.refuted({ ...c, says: true }),
        Tx.refuted({ ...c, says: false }),
        c.tag,
        ...rules.map((r) => F.explain(r, c)),
      ]),
    ];
  };

  describe('the forges — the shared checks (authoring/test/suites.js › describeForges)', () => {
    const bankSet = opts.bankPairs ?? (opts.bank ? bankPairs(readBank(opts.bank)) : new Set());

    it('one forge per key, in the order of the story; a forge with no experiment opens on its tiles', () => {
      expect(Object.keys(forges)).toEqual(keys);
      for (const key of keys) {
        const F = forges[key];
        expect(F.key).toBe(key);
        if (F.inquiry) continue;
        for (const road of Object.values(roads)) expect(F.predictCases(rowsOf(key, road)), key).toEqual([]);
      }
    });

    it('nothing he did is lost, nothing counted twice; a case the mirror built joins his lines as the mirror’s', () => {
      for (const key of keys) {
        const F = forges[key];
        for (const road of Object.values(roads)) {
          const rows = rowsOf(key, road);
          expect(rows.length, key).toBeGreaterThan(0);
          expect(new Set(rows.map(F.caseId)).size, key).toBe(rows.length);
          expect(F.evidence(rows), key).toEqual(rows);
          expect(F.evidence([...rows, ...logOf(key, road)]), key).toHaveLength(rows.length);
          const [p] = F.attacks(allRules(F).find(F.isTheRule), rows);
          const more = F.evidence([...rows, { ...p, mirror: true }]);
          expect(more, key).toHaveLength(rows.length + 1);
          expect(more.at(-1).mirror, key).toBe(true);
        }
      }
    });

    it('on ANY road every false rule falls in front of him — on what he did, or on a new case', () => {
      for (const key of keys) {
        const F = forges[key];
        const rules = allRules(F);
        for (const [name, road] of Object.entries(roads)) {
          const rows = rowsOf(key, road);
          expect(runOn(F, rules.find(F.isTheRule), rows).bad, `${key} ${name}: the right rule agrees`).toBe(-1);
          for (const rule of rules.filter((r) => !F.isTheRule(r))) {
            const { on, c } = refutedBy(key, rule, road);
            expect(c, `${key} ${name} ${ruleKey(F, rule)}: nothing refutes it`).toBeTruthy();
            expect(F.says(rule, c), `${key} ${name} ${ruleKey(F, rule)} ${on}`).not.toBe(c.held);
            if (on === 'attack') expect(rows.some((r) => F.caseId(r) === F.caseId(c))).toBe(false);
          }
        }
      }
    });

    it('every case it shows: worded, a short tag, a pair drawn as the world draws it, never a pair of the bank', () => {
      for (const key of keys) {
        const F = forges[key];
        for (const c of shownCases(F)) {
          const idc = F.caseId(c);
          if (c.pair) {
            expect([c.pair.a, c.pair.b, c.pair.d], idc).toEqual([c.A, c.B, c.d]);
            expect(c.fits, idc).toBe(c.A % c.d === 0 && c.B % c.d === 0);
          }
          if (c.tag != null) expect(String(c.tag).length, c.tag).toBeLessThanOrEqual(draw.tag);
          const p = pairOf(c);
          if (p) expect(bankSet.has(pairKey(...p)), `${key} ${idc}: a pair of the bank`).toBe(false);
        }
        for (const c of builtCases(F)) {
          if (!c.pair) continue;
          expect(Math.max(c.A, c.B), F.caseId(c)).toBeLessThanOrEqual(draw.max);
          // the planks laid on the longer bridge, one by one, in front of him
          const laid = Math.max(Math.floor(c.A / c.d), Math.floor(c.B / c.d));
          expect(laid, F.caseId(c)).toBeLessThanOrEqual(draw.laid);
        }
      }
    });

    it('no sentence of a forge before its last step names its key or states its rule', () => {
      for (const [key, words] of Object.entries(forbidden))
        for (const line of sentences(forges[key])) expect(line, `${key}: ${line}`).not.toMatch(words);
    });

    for (const key of keys) {
      const F = forges[key];
      const firstRoad = Object.values(roads)[0];

      describe(`${key} — he writes his rule with tiles`, () => {
        it('many rules can be written and exactly ONE holds; 2 to 4 columns, at most four tiles a column', () => {
          const rules = allRules(F);
          if (opts.tiles?.[key]) expect(rules).toHaveLength(opts.tiles[key]);
          expect(rules.filter(F.isTheRule)).toHaveLength(1);
          expect(F.slots.length).toBeGreaterThanOrEqual(2);
          expect(F.slots.length).toBeLessThanOrEqual(4);
          for (const s of F.slots) expect(s.options.length, s.id).toBeLessThanOrEqual(4);
          for (const rule of rules) expect(complete(F, rule), ruleKey(F, rule)).toBe(true);
          expect(complete(F, { ...rules.find(F.isTheRule), [F.slots[0].id]: null })).toBe(false);
        });

        it('every refutation is worded; the right rule survives hard attacks — a « yes » and a « no » of the world', () => {
          const rules = allRules(F);
          const right = rules.find(F.isTheRule);
          for (const road of Object.values(roads)) {
            const rows = rowsOf(key, road);
            for (const rule of rules.filter((r) => !F.isTheRule(r))) {
              const run = runOn(F, rule, testsOf(F, rule, rows));
              if (run.bad >= 0) {
                plain(F.text.refuted(run.marks[run.bad]));
                said(F.explain(rule, run.marks[run.bad]));
                continue;
              }
              const [c] = F.attacks(rule, rows);
              said(F.text.attack(c));
              said(F.explain(rule, c));
              if (F.text.eq) said(F.text.eq(c));
              plain(F.text.broken(F.says(rule, c)));
            }
            const list = F.attacks(right, rows);
            expect(list.length, key).toBeGreaterThanOrEqual(2);
            expect(new Set(list.map((c) => c.held)), key).toEqual(new Set([true, false]));
            for (const c of list) expect(F.says(right, c), F.caseId(c)).toBe(c.held);
            const after = F.evidence([...rows, { ...list[0], mirror: true }]);
            expect(F.attacks(right, after).map(F.caseId), `${key}: the next attack is still new`).not.toContain(
              F.caseId(list[0]),
            );
          }
        });

        it('says every rule and applies it in words; every moment of the forge is worded', () => {
          const rows = rowsOf(key, firstRoad);
          const Tx = F.text;
          for (const rule of allRules(F)) {
            plain(F.ruleText(rule));
            for (const c of [...rows, ...F.attacks(rule, rows)]) said(F.explain(rule, c));
            for (const s of F.slots)
              plain(
                chipOf(
                  F,
                  s,
                  s.options.find((o) => o.id === rule[s.id]),
                ),
              );
          }
          for (const s of F.slots) {
            plain(s.label);
            for (const o of s.options) plain(o.label);
          }
          for (const k of ['title', 'log', 'yes', 'no', 'frame', 'buildLead', 'testing', 'agreed', 'fire', 'survived'])
            plain(Tx[k]);
          for (const k of ['wordsHint', 'experiment', 'useOk']) if (Tx[k] != null) plain(Tx[k]);
          for (const yes of [true, false]) {
            plain(Tx.says(yes));
            plain(Tx.broken(yes));
          }
          for (const x of Object.values(Tx.use ?? {})) plain(x);
        });

        it('the robot helps without ever giving the rule: three more pairs of cases, never a choice of rules', () => {
          const rows = rowsOf(key, firstRoad);
          for (const n of [1, 2, 3]) {
            const h = F.nudge(n, rows);
            expect(h.kind, `nudge ${n}`).toBe('experiment');
            expect(h.cases).toHaveLength(2);
            expect(h.cases[0].held, `nudge ${n}`).not.toBe(h.cases[1].held);
            for (const c of h.cases) expect(rows.some((r) => F.caseId(r) === F.caseId(c))).toBe(false);
          }
          const right = allRules(F).find(F.isTheRule);
          for (const s of F.slots)
            if (typeof F.text.experiment === 'string')
              expect(F.text.experiment).not.toContain(s.options.find((o) => o.id === right[s.id]).label);
        });

        it('ends on a case the mirror does not build — the rule decides, typed in its own shape', () => {
          for (let seed = 1; seed <= 25; seed += 1) {
            const c = F.use.make(rng(seed * 104729));
            // a step that ends on yes / no (`use.verdict`): the conclusion is `solve`'s `verdict`, else the case's own
            const { verdict: said0, ...vals } = solve[key](c);
            const verdict = F.use.verdict ? (said0 ?? c.held) : undefined;
            const lines = F.use.lines(c);
            expect(lines.length).toBeGreaterThanOrEqual(1);
            expect(lines.length).toBeLessThanOrEqual(4);
            // a typed fraction (`fractionBox`) gives its numerator's box, then its denominator's (lesson 8); a typed power
            // (`powerBox`) its base's box, then its exponent's
            const boxes = lines.flatMap((l) => boxesOf(l.tokens));
            expect(boxes.map((t) => t.slot).sort()).toEqual(Object.keys(vals).sort());
            for (const t of boxes) expect(String(vals[t.slot]).length, t.slot).toBeLessThanOrEqual(t.w);
            for (const l of lines)
              for (const t of l.tokens)
                if (partsOf(t)) for (const x of partsOf(t)) plain(typeof x === 'string' ? x : x.label);
                else plain(typeof t === 'string' ? t : t.label);
            const asText = Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, String(v)]));
            expect(F.use.check(c, asText, verdict)).toBe('ok');
            said(F.text.tryKey(c));
            for (const name of Object.keys(vals)) {
              const fb = F.use.check(c, { ...asText, [name]: String(Number(vals[name]) + 100) }, verdict);
              expect(fb, `${key} ${name}`).not.toBe('ok');
              expect(typeof F.text.use[fb], `${key} text.use.${fb}`).toBe('string');
            }
            const p = pairOf(c);
            if (p) expect(bankSet.has(pairKey(...p)), `${key} last step ${p}: a pair of the bank`).toBe(false);
          }
        });
      });
    }
  });
  return { rowsOf, refutedBy, shownCases };
}

// ───────────────────────── the experiments ─────────────────────────

/**
 * THE EXPERIMENTS — `world/inquiries.js` (the « Explore » screens, the benches of the workshops).
 *
 *   describeExperiments({ ofKey: { '<key>': TARH_BENCH, … }, linesOf: (key, spec) => [...every sentence it can say],
 *     never: /PGCD|diviseur|algorithme/, own: { '<key>': /le plus court et la différence|jusqu’à obtenir/ } });
 */
export function describeExperiments({ ofKey, linesOf, never, own = {} }) {
  describe('the experiments — the shared checks (authoring/test/suites.js › describeExperiments)', () => {
    it('one experiment per key, each of its own nature: no two keys share a (kind, mode)', () => {
      const kinds = Object.values(ofKey).map((s) => `${s.kind}/${s.mode ?? ''}`);
      expect(new Set(kinds).size, kinds.join(' ')).toBe(kinds.length);
    });
    it('every sentence says what he just did — none names a key or states its rule', () => {
      for (const [key, spec] of Object.entries(ofKey)) {
        const lines = linesOf(key, spec);
        expect(lines.length, key).toBeGreaterThan(0);
        for (const line of lines) {
          said(line);
          expect(line, `${key}: ${line}`).not.toMatch(never);
          if (own[key]) expect(line, `${key}: ${line}`).not.toMatch(own[key]);
          expect(agreementErrors(line), line).toEqual([]);
        }
      }
    });
  });
}

// ───────────────────────── the evidence ─────────────────────────

/**
 * Answers a student can really write: the right one, every box off by a little, emptied, doubled, a decimal, a negative,
 * blank, two boxes swapped — whole-wrong and HALF-wrong — then the lesson's own `mistakes(q)`.
 */
export function answersOf(q, right, boxes, mistakes = () => []) {
  const out = [right];
  for (const k of boxes)
    for (const v of [right[k] + 1, right[k] - 1, right[k] * 2, 0, '', undefined, '2.5', -right[k], ' '])
      out.push({ ...right, [k]: v });
  for (const k of boxes) for (const j of boxes) if (k !== j) out.push({ ...right, [k]: right[j], [j]: right[k] });
  out.push(...mistakes(q, right), {}, null);
  return out;
}

/**
 * THE EVIDENCE — `world/evidence.js`.
 *
 *   describeEvidence({ id: '<lesson id>', keys: KEYS, evidence, trainerEvidence, trainer, check, solution,
 *     cards: KNOWLEDGE.graph.nodes.map((n) => n.id), boxes: { farq: ['e', 'g'], … }, config: LESSON_CONFIG });
 *
 * opts:
 *   boxes      { kind: [box…] } — the kinds of trainer question whose first exam try is evidence, and their boxes;
 *              or (q) => [box…] | null when the boxes depend on the question (a list of n divisors: n boxes) — then
 *   kinds      the kinds that must each be seen at least `minPerKind` times
 *   mistakes   (q, right) => [answers] — the mistakes of THIS lesson (the difference for the PGCD, a true equality
 *              that is not the one asked…): each must make the claim false when `check` refuses it
 *   seeds      sessions drawn per card (default 30); minPerKind (default 50)
 */
export function describeEvidence(opts) {
  const { id, keys, evidence, trainerEvidence, trainer, check, solution, cards, boxes, config } = opts;
  const FIRST = { firstTry: true, helped: false };
  describe(`the evidence of « ${id} » — the shared checks (authoring/test/suites.js › describeEvidence)`, () => {
    it('each key proves one savoir-faire of the lesson, by its catalogue id, and a module of the lesson teaches it', () => {
      const points = keys.map((key) => evidence.learningPointOf(id, key));
      expect(new Set(points).size).toBe(keys.length);
      for (const p of points) expect(p).toMatch(new RegExp(`^[0-9a-z]+_${id}_P\\d+$`));
      const taught = new Set(config.modules.flatMap((m) => m.teachesLearningPointIds ?? []));
      for (const p of points) expect(taught.has(p), p).toBe(true);
    });

    it('for EVERY question of the trainer: the claim is true exactly when `check` accepts the WHOLE answer', () => {
      const boxesOf = typeof boxes === 'function' ? boxes : (q) => boxes[q.kind] ?? null;
      const seen = {};
      let wrong = 0;
      for (const card of cards)
        for (let seed = 1; seed <= (opts.seeds ?? 30); seed += 1)
          for (const q of trainer.makeSession(rng(seed * 7919 + 13), card)) {
            const right = solution(q);
            const bx = boxesOf(q);
            if (!bx) {
              // a tap, a true / false, an answer no claim kind states: never evidence, right or wrong
              expect(trainerEvidence(q, right, FIRST), q.kind).toBe(null);
              expect(trainerEvidence(q, {}, FIRST), q.kind).toBe(null);
              continue;
            }
            seen[q.kind] = (seen[q.kind] ?? 0) + 1;
            expect(trainerEvidence(q, right, { firstTry: false, helped: false }), q.kind).toBe(null);
            expect(trainerEvidence(q, right, { firstTry: true, helped: true }), q.kind).toBe(null);
            if (q.format !== 'exam') {
              expect(trainerEvidence(q, right, FIRST), `${q.kind} ${q.format}`).toBe(null);
              continue;
            }
            for (const v of answersOf(q, right, bx, opts.mistakes)) {
              const ok = check(q, v).ok;
              const ev = trainerEvidence(q, v, FIRST);
              expect(ev?.key, q.kind).toBe(q.key);
              expect(
                verifyClaim(ev.claim),
                `${q.prompt} ← ${JSON.stringify(v)} claims ${JSON.stringify(ev.claim)}`,
              ).toBe(ok);
              expect(guardEvidence(ev, ok)).toBe(ev);
              if (!ok) wrong += 1;
            }
          }
      for (const kind of opts.kinds ?? Object.keys(boxes))
        expect(seen[kind] ?? 0, kind).toBeGreaterThan(opts.minPerKind ?? 50);
      expect(wrong).toBeGreaterThan(100);
    });
  });
}

// ───────────────────────── the trainer ─────────────────────────

/** A token of a form line that is answered: a box `{ num }` or a choice `{ choice }`. */
const isAnswerBox = (t) => Boolean(t && typeof t === 'object' && (t.num || t.choice));
/** The kit's fraction template `{ frac: { n, d } }` (Trainer.jsx › FormLines). */
const isFracToken = (t) => Boolean(t && typeof t === 'object' && t.frac && typeof t.frac === 'object');
/**
 * How many ANSWERS a line of a form asks (defects.md B17: a sheet whose boxes wrap one alone onto a line). A box or a
 * choice is one; a typed fraction — two boxes stacked over a bar — is ONE answer in its own shape, as wide as one box;
 * a printed fraction asks nothing.
 */
export const answersOnLine = (line) =>
  line.tokens.filter((t) => isAnswerBox(t) || (isFracToken(t) && (isAnswerBox(t.frac.n) || isAnswerBox(t.frac.d))))
    .length;

/**
 * THE TRAINER « Entraîne-toi » — `world/trainer.js`.
 *
 *   describeTrainer({ trainer, check, solution, answerLabel, evidenceOf: trainerEvidence, planOf: PLAN_OF,
 *     cards: KNOWLEDGE.graph.nodes.map((n) => n.id), kinds: ['farq', 'furuq', 'tap', 'tf'] });
 *
 * opts:   kinds — every kind a session can ask (each must be seen); boxes — at most this many answers a line (3, B17;
 *         a typed fraction `{ frac: { n, d } }` counts as ONE: `answersOnLine`);
 *         seeds — sessions per card (25)
 */
export function describeTrainer(opts) {
  const { trainer, check, solution, answerLabel, evidenceOf, planOf, cards, kinds } = opts;
  const maxBoxes = opts.boxes ?? 3;
  const all = function* () {
    for (const card of cards)
      for (let seed = 1; seed <= (opts.seeds ?? 25); seed += 1)
        for (const q of trainer.makeSession(rng(seed * 104729), card)) yield q;
  };
  describe('« Entraîne-toi » — the shared checks (authoring/test/suites.js › describeTrainer)', () => {
    it('every card of the mind map has a plan', () => {
      expect(Object.keys(planOf).sort()).toEqual([...cards].sort());
    });

    it('every question accepts its own solution with a true correction, and refuses a wrong answer with a hint', () => {
      const seen = new Set();
      for (const q of all()) {
        seen.add(q.kind);
        const right = solution(q);
        const res = check(q, right);
        expect(res.ok, `${q.kind} ${q.prompt}`).toBe(true);
        expect(res.fix, q.kind).toBeTruthy();
        said(`${q.prompt} ${res.fix} ${answerLabel(q, right)}`);
        trueEqualities(res.fix);
        expect(typographyErrors(`${q.prompt} ${res.fix}`), res.fix).toEqual([]);
        expect(agreementErrors(`${q.prompt} ${res.fix}`), q.prompt).toEqual([]);
        const bad =
          q.kind === 'tap'
            ? (q.options ?? q.wave?.gates ?? []).find((n) => n !== right)
            : q.kind === 'tf'
              ? { truth: !q.truth, reason: 0 }
              : {};
        const no = check(q, bad);
        expect(no.ok, `${q.kind} wrong`).toBe(false);
        expect(no.hint, q.kind).toBeTruthy();
        said(no.hint);
        const ev = evidenceOf?.(q, right, { firstTry: true, helped: false });
        if (ev) expect(verifyClaim(ev.claim), `${q.kind} claim`).toBe(true);
      }
      expect([...seen].sort()).toEqual([...kinds].sort());
    });

    it(`a line of an exam sheet holds at most ${maxBoxes} answers (defects.md B17); a typed fraction is ONE`, () => {
      for (const q of all())
        for (const l of q.form?.lines ?? []) {
          expect(answersOnLine(l), `${q.kind} ${q.prompt}`).toBeLessThanOrEqual(maxBoxes);
          for (const t of l.tokens.filter(isFracToken)) {
            const parts = [t.frac.n, t.frac.d];
            // a fraction is typed whole or printed whole: never a box over a printed number, never empty
            expect(new Set(parts.map(isAnswerBox)).size, `${q.kind} ${q.prompt}: a half-typed fraction`).toBe(1);
            for (const x of parts) if (!isAnswerBox(x)) said(x);
          }
        }
    });
  });
}

// ───────────────────────── the knowledge map ─────────────────────────

/**
 * THE KNOWLEDGE MAP « fiche de connaissances » — `world/knowledge.js`.
 *
 *   describeKnowledge({ knowledge: KNOWLEDGE, keys: KEYS, cards: lesson.cards });
 *
 * opts.layout: { perRow: 3, colGap: 33, rowGap: 8.5, labelGap: 19 } — in % of the map: cards a row at most, the
 * horizontal distance of two cards of a row, how far a link label (at the middle of its link) stays from a row unless
 * it is `labelGap` away from every card of that row (2026-11-19: at 7.75 % labels touched a two-line card).
 * opts.memo: the fields every memo sheet fills (default rule, hook, example, trap, exam, chip).
 */
export function describeKnowledge(opts) {
  const { knowledge, keys, cards } = opts;
  const L = { perRow: 3, colGap: 33, rowGap: 8.5, labelGap: 19, ...opts.layout };
  const memoFields = opts.memo ?? ['rule', 'hook', 'example', 'trap', 'exam', 'chip'];
  const nodes = knowledge.graph.nodes;
  const card = (cid) => nodes.find((n) => n.id === cid);
  describe('the knowledge map — the shared checks (authoring/test/suites.js › describeKnowledge)', () => {
    it('every card placed, opened by a key of the lesson, revealed along its links, reachable from the root', () => {
      const ids = nodes.map((n) => n.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(Object.keys(knowledge.positions).sort()).toEqual([...ids].sort());
      expect(ids).toContain(knowledge.graph.root);
      for (const n of nodes) {
        expect(keys, n.id).toContain(n.requires);
        const out = knowledge.graph.edges.filter((e) => e.from === n.id).map((e) => e.to);
        expect([...n.reveals].sort(), n.id).toEqual(out.sort());
        said(`${n.title} ${n.subtitle} ${JSON.stringify(n.context ?? {})}`);
      }
      const reached = new Set([knowledge.graph.root]);
      for (let i = 0; i < ids.length; i += 1)
        for (const e of knowledge.graph.edges) if (reached.has(e.from)) reached.add(e.to);
      expect(reached.size).toBe(ids.length);
      const order = (cid) => keys.indexOf(card(cid).requires);
      for (const e of knowledge.graph.edges)
        expect(order(e.to), `${e.from} → ${e.to}`).toBeGreaterThanOrEqual(order(e.from));
      if (cards) {
        for (const key of keys) expect(ids, `the card of ${key}`).toContain(cards.ofKey[key]);
        if (cards.fallback) expect(ids).toContain(cards.fallback);
      }
    });

    it('laid out: no two cards on a spot, a few a row and far apart, every link label clear of the cards', () => {
      const P = knowledge.positions;
      const rows = new Map();
      for (const [cid, [x, y]] of Object.entries(P)) rows.set(y, [...(rows.get(y) ?? []), [x, cid]]);
      for (const [y, row] of rows) {
        expect(row.length, `row ${y}`).toBeLessThanOrEqual(L.perRow);
        const xs = row.map(([x]) => x).sort((a, b) => a - b);
        for (let i = 1; i < xs.length; i += 1) expect(xs[i] - xs[i - 1], `row ${y}`).toBeGreaterThanOrEqual(L.colGap);
      }
      for (const e of knowledge.graph.edges) {
        const [x1, y1] = P[e.from];
        const [x2, y2] = P[e.to];
        expect(y2, `${e.from} → ${e.to} goes down`).toBeGreaterThan(y1);
        if (!e.label) continue;
        const [mx, my] = [(x1 + x2) / 2, (y1 + y2) / 2];
        for (const [cid, [x, y]] of Object.entries(P))
          if (Math.abs(y - my) < L.rowGap)
            expect(Math.abs(x - mx), `« ${e.label} » under ${cid}`).toBeGreaterThanOrEqual(L.labelGap);
      }
    });

    it('every memo sheet is complete; its quiz has ONE right option; no Arabic anywhere, no bare PGCD(…)', () => {
      const items = Object.values(knowledge.modules).flat();
      expect(items.map((x) => x.id)).toEqual(keys);
      for (const x of items) {
        for (const f of memoFields) expect(x.memo[f], `${x.id} ${f}`).toBeTruthy();
        for (const q of x.memo.quiz ?? []) {
          expect(q.options[q.correct], q.q).toBeTruthy();
          expect(new Set(q.options).size, q.q).toBe(q.options.length);
          for (const m of `${q.q} ${q.options.join(' ')}`.matchAll(/\$([^$]*)\$/g))
            expect(m[1], q.q).not.toMatch(/[\u0600-\u06ff]/);
        }
        said(JSON.stringify(x));
        for (const f of ['rule', 'example', 'chip'].filter((k) => memoFields.includes(k)))
          expect(x.memo[f], `${x.id} ${f}`).not.toMatch(/[\u0600-\u06ff]/);
        for (const f of ['trap', 'exam', 'hook'].filter((k) => memoFields.includes(k)))
          expect(x.memo[f], `${x.id} ${f}`).not.toMatch(/(?<!\{)PGCD\(/);
      }
      for (const s of stringsIn(knowledge)) {
        expect(s, 'an Arabic letter').not.toMatch(/[\u0600-\u06ff]/);
        expect(typographyErrors(s), s).toEqual([]);
      }
      // what a card or a sheet STATES is true (not a quiz's options nor a mistake's « wrong » part: false on purpose)
      const statedOf = (node) => ({
        ...node,
        context: { ...node.context, parts: (node.context?.parts ?? []).filter((p) => p.role !== 'wrong') },
      });
      const stated = [
        ...stringsIn(knowledge.graph.nodes.map(statedOf)),
        ...items.flatMap((x) => stringsIn({ ...x, memo: { ...x.memo, quiz: [] } })),
      ];
      for (const s of stated) trueEqualities(s);
    });
  });
}

// ───────────────────────── the limits the walks proved ─────────────────────────

/**
 * What the walks of 2026-11-19 proved at 1366×768, 1024×768 and 1840×900 (`trusted.md`; measured on the PGCD-search
 * lesson's data, its `world/limits.test.js`, and the « 2 to 4 slots » of the forge's frame). A lesson whose data
 * stays inside is not walked on these screens again; past a limit, the screen is walked BEFORE the limit is raised.
 */
export const PROVEN_LIMITS = {
  tile: 32, // the longest tile of a forge
  slotHeading: 35, // a column's heading
  chip: 54, // the chip of a picked tile
  slots: [2, 4], // columns of tiles (trusted.md: 2 to 4)
  tilesPerSlot: 4,
  buildLead: 135, // the lead above the tiles
  ruleText: 145, // his rule as one sentence
  attack: 155, // the mirror's challenge
  tryKey: 146, // the last step's question
  useLines: 4, // the last step's lines (4: two columns)
  useBoxes: 4, // boxes on one line of the last step
  tabletLines: 2,
  tabletMath: 2,
  tabletNotes: 1,
  objective: 212, // the world's instruction
  practiceNodes: 7, // the practice map: the root, five keys, the exam
  knowledgeCards: 15,
  boardSteps: 14,
  boardOptions: 6, // cards on an « ask »
  boardCue: 70,
};
const len = (s) => [...String(s)].length;

/**
 * THE LIMITS — a lesson's data against what the walks proved (`trusted.md`, SKILL.md §6).
 *
 *   describeLimits({ forges: FORGES, keys: KEYS, tablets: TABLETS, objectives: [...every instruction it can show],
 *     knowledge: KNOWLEDGE, practiceMap: PRACTICE_MAP, script: SCRIPT });
 *
 * opts.limits overrides a limit ONLY with the number a walk of this lesson measured (say so in a comment).
 */
export function describeLimits(opts) {
  const { forges, keys, tablets, objectives = [], knowledge, practiceMap, script } = opts;
  const Lm = { ...PROVEN_LIMITS, ...opts.limits };
  describe('the limits the walks proved — the shared checks (authoring/test/suites.js › describeLimits)', () => {
    for (const key of keys) {
      const F = forges[key];
      it(`forge ${key}: tiles, headings, chips, lead, rule, attacks, last step`, () => {
        expect(F.slots.length).toBeGreaterThanOrEqual(Lm.slots[0]);
        expect(F.slots.length).toBeLessThanOrEqual(Lm.slots[1]);
        for (const s of F.slots) {
          expect(s.options.length).toBeLessThanOrEqual(Lm.tilesPerSlot);
          expect(len(s.label), s.label).toBeLessThanOrEqual(Lm.slotHeading);
          for (const o of s.options) {
            expect(len(o.label), o.label).toBeLessThanOrEqual(Lm.tile);
            if (F.chip) expect(len(F.chip(s, o)), F.chip(s, o)).toBeLessThanOrEqual(Lm.chip);
          }
        }
        expect(len(F.text.buildLead), F.text.buildLead).toBeLessThanOrEqual(Lm.buildLead);
        for (const r of allRules(F)) expect(len(F.ruleText(r)), F.ruleText(r)).toBeLessThanOrEqual(Lm.ruleText);
        const right = allRules(F).find(F.isTheRule);
        for (const c of F.attacks(right, []))
          expect(len(F.text.attack(c)), F.text.attack(c)).toBeLessThanOrEqual(Lm.attack);
        for (let i = 0; i < 12; i += 1) {
          const c = F.use.make(() => (i + 0.5) / 12);
          expect(len(F.text.tryKey(c)), F.text.tryKey(c)).toBeLessThanOrEqual(Lm.tryKey);
          const lines = F.use.lines(c);
          expect(lines.length).toBeLessThanOrEqual(Lm.useLines);
          // a fraction or a power (`{ frac }`, `{ pow }`) is ONE unit of its line, typed or printed, however many boxes it
          // holds (defects.md B17, C14)
          for (const l of lines)
            expect(l.tokens.filter((t) => typeof t === 'object').length).toBeLessThanOrEqual(Lm.useBoxes);
        }
      });
    }

    it('the tablets, the instructions, the maps and the board', () => {
      for (const t of Object.values(tablets)) {
        expect(t.lines.length).toBeLessThanOrEqual(Lm.tabletLines);
        expect(t.math.length).toBeLessThanOrEqual(Lm.tabletMath);
        expect((t.notes ?? []).length).toBeLessThanOrEqual(Lm.tabletNotes);
      }
      for (const o of objectives) expect(len(o), o).toBeLessThanOrEqual(Lm.objective);
      if (practiceMap) expect(Object.keys(practiceMap.positions).length).toBeLessThanOrEqual(Lm.practiceNodes);
      if (knowledge) expect(knowledge.graph.nodes.length).toBeLessThanOrEqual(Lm.knowledgeCards);
      if (script) {
        expect(script.steps.length).toBeLessThanOrEqual(Lm.boardSteps);
        for (const s of script.steps) {
          if (s.options) expect(s.options.length, s.id).toBeLessThanOrEqual(Lm.boardOptions);
          if (s.cue) expect(len(s.cue), s.cue).toBeLessThanOrEqual(Lm.boardCue);
        }
      }
    });
  });
}

// ───────────────────────── the exam sitting: the bank as it is ─────────────────────────

/** The answer the bank's own key expects, in the shape the practice widgets write. */
const bankAnswer = (q) =>
  q.answerType === 'choice'
    ? { choiceId: q.bank.choices.find((c) => c.isCorrect).id }
    : q.paper
      ? undefined
      : { value: String(q.bank.expectedAnswer) };
/** A dinar of the Algerian banks (« 900DA », `$1500$ DA`, `11225\,DA`, `\text{ DA}`, « (DA) », its Arabic sign): never in France. */
const MONEY_DA = /(?:\d\$?|\\,|\\text\{)\s*DA(?![A-Za-z])|\(\s*DA\s*\)|\u062f\u062c/;
/** A euro sign glued to its number or after a plain space: French writes « 450 € » (a no-break space before the sign). */
const LOOSE_EURO = /\d ?€|\d\$ ?€/;

/**
 * The « brevet blanc » — `world/sitting.js` (one call to `createBankSittings`): the REAL bank, every sheet whole, every
 * step markable to full points by its own key, money in euros written the French way, adapting to what he missed.
 *
 *   describeSitting({ id: '<lesson id>', lesson, sittings, levels: LEVELS });
 */
export function describeSitting({ id, lesson, sittings, levels }) {
  const keyOf = keysOfPoints(id, lesson);
  const shown = (q) => [
    q.text,
    q.lead,
    q.shown.statement,
    q.shown.answerFormat,
    ...(q.shown.choices ?? []).map((c) => c.content),
    ...sittings.model(q),
    ...sittings.guide(q),
    sittings.written(q, bankAnswer(q)),
  ];
  describe(`the sitting of « ${id} » — the bank as it is (authoring/test/suites.js › describeSitting)`, () => {
    it('loads the levels of the bank, each with its sheets, minutes and points on the ladder', async () => {
      await sittings.prepare();
      expect(sittings.ready()).toBe(true);
      for (const L of levels) {
        expect(sittings.levelPoints(L), `level ${L.n}`).toBeTruthy();
        expect(sittings.levelMinutes(L), `level ${L.n}`).toBeTruthy();
      }
    });

    it('serves real sheets, whole, and every step earns its points with the answer the bank expects', async () => {
      await sittings.prepare();
      const seen = new Set();
      for (const L of levels)
        for (let seed = 1; seed <= 30; seed += 1) {
          const s = sittings.makeSubject(rng(seed * 7 + L.n), L.n, [], keyOf);
          const qs = allQuestions(s);
          expect(s.exercises).toHaveLength(L.sheets);
          expect(new Set(qs.map((q) => q.id)).size).toBe(qs.length);
          for (const e of s.exercises) {
            seen.add(e.bankId);
            expect(e.bankId).toMatch(new RegExp(`^ex-[0-9a-z]+-${id}-l${L.n}-\\d{3}$`));
            expect(e.questions.reduce((t, q) => t + q.points, 0)).toBe(e.points);
          }
          const full = Object.fromEntries(qs.map((q) => [q.id, bankAnswer(q)]));
          expect(sittings.totalMark(s, full), s.exercises.map((e) => e.bankId).join()).toBe(s.total);
          expect(sittings.totalMark(s, {})).toBe(0);
          expect(forgotten(s, full, 0)).toEqual([]);
          for (const q of qs) {
            expect(sittings.model(q).length, q.id).toBeGreaterThan(0);
            if (q.key) expect(lesson.keys).toContain(q.key);
            for (const l of shown(q).filter(Boolean)) {
              expect(l).not.toMatch(MONEY_DA);
              expect(l).not.toMatch(LOOSE_EURO);
              expect(l).not.toMatch(/[\u0600-\u06ff]/);
              expect(l).not.toMatch(/undefined|NaN/);
            }
          }
        }
      expect(seen.size).toBeGreaterThan(30);
    });

    it('hands in only the steps he answered, as he wrote them; adapts the next sheet to the one he missed', async () => {
      await sittings.prepare();
      const s = sittings.makeSubject(rng(3), 2, [], keyOf);
      const qs = allQuestions(s).filter((q) => !q.paper);
      let n = 0;
      const sheet = sittings.sheetOf(s, { [qs[0].id]: bankAnswer(qs[0]) }, () => `id-${(n += 1)}`);
      expect(sheet).toMatchObject({ lesson: id, level: 2 });
      expect(sheet.items).toHaveLength(1);
      expect(sheet.items[0]).toMatchObject({ exerciseId: s.exercises[0].bankId, outcome: 'correct' });
      const first = sittings.makeSubject(rng(9), 1, [], keyOf);
      const weak = sittings.weakKinds(first, {});
      expect(weak).toContain(`ex:${first.exercises[0].bankId}`);
      for (let seed = 1; seed <= 10; seed += 1)
        expect(sittings.makeSubject(rng(seed), 1, weak, keyOf).exercises[0].bankId).not.toBe(first.exercises[0].bankId);
    });
  });
}
