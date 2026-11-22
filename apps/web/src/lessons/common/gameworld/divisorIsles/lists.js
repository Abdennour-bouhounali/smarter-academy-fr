/**
 * THE INVESTIGATION `lists` — PURE logic (screen: `InquiryLists.jsx`; contract: GAME_WORLD.md « استكشف », « spec shape
 * of `lists` »). Its rule is a PROCEDURE on two lists: to find the longest plank of two gaps, list the planks of each gap
 * (by pairs: a plank and its partner), cross the two lists, and take the longest plank they share.
 *
 *   build    he TYPES a plank of the gap; when it fills the gap the world writes its partner (n = d × q) and both join
 *            the list, sorted; when it does not, the world writes the fact (n = d × q + r) and nothing is added. The list
 *            is closed by the world when every plank is in it. He may say « it is complete » earlier: the world then lays
 *            ONE plank that is missing (a fact), never the list.
 *   (the same for the second gap — the two lists stand one above the other, aligned plank under plank)
 *   link     he taps a plank of either list: « it is in both ». The world lays it on both gaps: it fills the other gap (a
 *            link) or it does not (its division written). He says when he has linked them all; a link missing is
 *            answered by ONE missing plank shown on both gaps.
 *   longest  LAST, he taps the longest linked plank; a shorter one is answered by a longer linked plank, shown.
 *            A round (or the spec) with `crown: false` has no such step: it ends on the two lists and their links — a
 *            bench that gives facts and stops there, never pointing at a plank (lesson 5's workshop bench).
 *
 * The screen is a pure view of this file's reducer, so the whole experiment is played and tested without a browser.
 */
import { divisorsDown } from './summit';
import { gcd } from './inquiry';

/** Every plank that fills the gap n (its divisors), the SHORTEST first. */
export const divisorsUp = (n) => divisorsDown(n).reverse();

/** A plank of d cells on a gap of n: the division, whether it fills, and its partner (n ÷ d) when it does. */
export function plankFill(n, d) {
  const q = Math.floor(n / d);
  const r = n % d;
  return { n, d, q, r, fills: r === 0, partner: r === 0 ? q : null };
}

/** The list after a plank that fills: d and its partner, sorted, no plank twice. */
export function addPair(list, n, d) {
  const set = new Set(list);
  set.add(d);
  set.add(n / d);
  return [...set].sort((x, y) => x - y);
}

/** Is the list every plank of the gap n? */
export const isComplete = (n, list) => list.length === divisorsUp(n).length;

/** The plank shown when he says the list is complete too early: the shortest plank missing (its partner is missing too). */
export function missingPlank(n, list) {
  return divisorsUp(n).find((d) => !list.includes(d)) ?? null;
}

/** The columns of the two lists, aligned: every plank of either list, shortest first (equal planks share a column). */
export const columnsOf = (listA, listB) => [...new Set([...listA, ...listB])].sort((x, y) => x - y);

/** The planks of both gaps (the truth of the links), shortest first. */
export const commonPlanks = (a, b) => divisorsUp(Math.min(a, b)).filter((d) => a % d === 0 && b % d === 0);

/** The shortest linked plank longer than d (the fact that answers a pick that is not the longest), or null. */
export const longerLinked = (links, d) =>
  links.filter((x) => x > d).reduce((m, x) => (m == null || x < m ? x : m), null);

// ───────────────────────── the state machine of the screen ─────────────────────────
// stage  build → buildLay → build … → closed → (gap b) build … → closed → link → linkLay → link … → longest → seen
//        (`crown: false`: link … → seen)
//        a refused length, « complete » said early, « all linked » said early: a fact, the stage stays

const SIDES = ['a', 'b'];

/** Does the round end by asking the longest linked plank? Not when it (or the spec) says `crown: false`. */
const crowns = (spec, ri) => (spec.rounds[ri]?.crown ?? spec.crown) !== false;

/** The round the screen is on, with its numbers and its truth. */
export function listsNow(spec, s) {
  const r = spec.rounds[s.ri];
  const common = commonPlanks(r.a, r.b);
  return { a: r.a, b: r.b, gap: { a: r.a, b: r.b }, common, longest: gcd(r.a, r.b) };
}

const other = (side) => (side === 'a' ? 'b' : 'a');

function roundState(ri) {
  return {
    ri,
    stage: 'build',
    /** the gap being listed */
    side: 'a',
    lists: { a: [], b: [] },
    /** every plank he typed, per gap: [{ d, fills, known }] (known: already in the list) */
    typed: { a: [], b: [] },
    /** « complete » said too early: the plank the world showed each time, per gap */
    early: { a: [], b: [] },
    /** what waits for the world: a typed length (buildLay) or a tapped plank { side, d } (linkLay) */
    pending: null,
    /** the last thing the world did, drawn on the strips and said in the fact line:
     *  { kind: 'fill'|'again'|'miss'|'refused'|'missing'|'closed'|'link'|'unlinked'|'linkMissing'|'linksDone'|'longer'|'crown', … } */
    last: null,
    /** the links he made, shortest first (planks of both lists) */
    links: [],
    /** every plank he tapped as a link: [{ d, from, holds }] */
    taps: [],
    /** « all linked » said too early: the plank shown each time */
    earlyLinks: [],
    /** his picks of the longest, in order */
    picks: [],
    crown: null,
  };
}

export const initLists = () => ({ ...roundState(0), rounds: [], done: false });

/** The round as the result keeps it. */
function roundResult(now, s) {
  return {
    a: now.a,
    b: now.b,
    typed: s.typed,
    lists: s.lists,
    early: { a: s.early.a, b: s.early.b, links: s.earlyLinks },
    taps: s.taps,
    links: s.links,
    common: now.common,
    picks: s.picks,
    firstPick: s.picks[0] ?? null,
    longest: now.longest,
  };
}

/**
 * One move of the experiment.
 *   { type: 'try', d }         build: he lays a plank of d cells on the gap (refused, as a fact, outside 1 … the gap)
 *   { type: 'complete' }       build: « the list is complete » (answered by a missing plank: the world closes a full list)
 *   { type: 'shown' }          the world has laid what was pending
 *   { type: 'go' }             closed: on to the second gap, or to the links
 *   { type: 'tap', side, d }   link: « this plank of that list is in both »
 *   { type: 'allLinked' }      link: « I have linked them all »
 *   { type: 'pick', d }        longest: the plank he says is the longest linked one
 *   { type: 'next' }           seen: the next round, or the end
 * A move that does not belong to the stage changes nothing.
 */
export function listsReducer(spec, s, action) {
  const now = listsNow(spec, s);
  switch (action.type) {
    case 'try': {
      if (s.stage !== 'build') return s;
      const n = now.gap[s.side];
      const d = action.d;
      if (!Number.isInteger(d) || d < 1 || d > n)
        return { ...s, last: { kind: 'refused', side: s.side, n, d: Number.isInteger(d) ? d : null } };
      return { ...s, stage: 'buildLay', pending: d };
    }
    case 'complete': {
      if (s.stage !== 'build') return s;
      const n = now.gap[s.side];
      const d = missingPlank(n, s.lists[s.side]);
      if (d == null) return s; // a full list is closed by the world before he can say it
      return {
        ...s,
        early: { ...s.early, [s.side]: [...s.early[s.side], d] },
        last: { kind: 'missing', side: s.side, ...plankFill(n, d) },
      };
    }
    case 'shown': {
      if (s.stage === 'buildLay') {
        const side = s.side;
        const n = now.gap[side];
        const f = plankFill(n, s.pending);
        const known = f.fills && s.lists[side].includes(f.d);
        const typed = { ...s.typed, [side]: [...s.typed[side], { d: f.d, fills: f.fills, known }] };
        const list = f.fills && !known ? addPair(s.lists[side], n, f.d) : s.lists[side];
        const lists = { ...s.lists, [side]: list };
        const kind = !f.fills ? 'miss' : known ? 'again' : 'fill';
        const next = { ...s, typed, lists, pending: null, last: { kind, side, ...f } };
        if (isComplete(n, list)) return { ...next, stage: 'closed', last: { kind: 'closed', side, ...f, list } };
        return { ...next, stage: 'build' };
      }
      if (s.stage === 'linkLay') {
        const { side, d } = s.pending;
        const o = other(side);
        const f = plankFill(now.gap[o], d);
        const taps = [...s.taps, { d, from: side, holds: f.fills }];
        const links = f.fills ? [...s.links, d].sort((x, y) => x - y) : s.links;
        const last = { kind: f.fills ? 'link' : 'unlinked', side, other: o, d, on: f, ...both(now, d) };
        return { ...s, stage: 'link', taps, links, pending: null, last };
      }
      return s;
    }
    case 'go': {
      if (s.stage !== 'closed') return s;
      if (s.side === 'a') return { ...s, stage: 'build', side: 'b', last: null };
      return { ...s, stage: 'link', last: null };
    }
    case 'tap': {
      if (s.stage !== 'link' || !SIDES.includes(action.side)) return s;
      const { side, d } = action;
      if (!s.lists[side].includes(d) || s.links.includes(d)) return s;
      return { ...s, stage: 'linkLay', pending: { side, d } };
    }
    case 'allLinked': {
      if (s.stage !== 'link') return s;
      const d = now.common.find((x) => !s.links.includes(x));
      if (d != null)
        return { ...s, earlyLinks: [...s.earlyLinks, d], last: { kind: 'linkMissing', d, ...both(now, d) } };
      const last = { kind: 'linksDone', links: s.links };
      if (crowns(spec, s.ri)) return { ...s, stage: 'longest', last };
      // no crown: the round ends on the links — nothing is picked, nothing is crowned
      const seen = { ...s, stage: 'seen', last };
      return { ...seen, rounds: [...s.rounds, roundResult(now, seen)] };
    }
    case 'pick': {
      if (s.stage !== 'longest' || !s.links.includes(action.d)) return s;
      const d = action.d;
      const picks = [...s.picks, d];
      if (d === now.longest) {
        const done = { ...s, picks, crown: d, stage: 'seen', last: { kind: 'crown', d, picks, ...both(now, d) } };
        return { ...done, rounds: [...s.rounds, roundResult(now, done)] };
      }
      const longer = longerLinked(s.links, d);
      return { ...s, picks, last: { kind: 'longer', d, longer, ...both(now, longer) } };
    }
    case 'next': {
      if (s.stage !== 'seen') return s;
      if (s.ri + 1 >= spec.rounds.length) return { ...s, done: true };
      return { ...s, ...roundState(s.ri + 1) };
    }
    default:
      return s;
  }
}

/** A plank on both gaps: { qa, ra, qb, rb } — what the strips and the calc line show for a link. */
function both(now, d) {
  return { qa: Math.floor(now.a / d), ra: now.a % d, qb: Math.floor(now.b / d), rb: now.b % d };
}

/** What the investigation hands back to the forge (`forge.fromInquiry`). */
export const listsResult = (s) => ({ rounds: s.rounds });
