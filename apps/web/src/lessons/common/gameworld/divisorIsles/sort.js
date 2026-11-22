/**
 * THE INVESTIGATION `sort` — PURE logic (screen: `InquirySort.jsx`; contract: GAME_WORLD.md « استكشف », « spec shape of
 * `sort` »). Its rule is a CLASSIFICATION: a hand of cards — one pair of gaps (a ; b) each, or one fraction a/b read as
 * two gaps, the numerator above the denominator — sorted into two baskets: the pairs whose only common plank is 1
 * (`one`) and the pairs that share a longer plank (`more`).
 *
 *   card      the card on the table: he MAY open ONE instrument he already owns (the spec lists them); the world runs
 *             it and shows FACTS only:
 *               lists   the planks of each gap, shortest first, the planks of both marked;
 *               summit  the planks of the shorter gap tried on the other from the longest down, stopping at the first
 *                       that fills it (its rest under each);
 *               ladder  the rows of Euclid's divisions a = b × q + r, down to the rest 0.
 *   tool      the world is running the instrument (one fact per tick).
 *   answer    he dropped the card in the OTHER basket: the world answers by what it does — a pair said « only 1 » that
 *             shares a longer plank gets that plank laid on both gaps; a pair said « a longer one » that shares none gets
 *             the planks of the shorter gap laid on the other from the longest down, none but 1 filling it.
 *   answered  the answer is on screen; « next » takes the card to the basket it belongs to.
 *   end       every card is in a basket; both baskets stay on screen — the evidence his rule is written from.
 *
 * The screen is a pure view of this file's reducer, so the whole experiment is played and tested without a browser.
 */
import { gcd, ladderOf } from './inquiry';
import { divisorsDown, descentOf, plankOn } from './summit';

/** The instruments a lesson may hand over, in the order their buttons are shown. */
const SORT_TOOLS = ['lists', 'summit', 'ladder'];
/** The longest gap a card may hold (one scale for both strips; past it a cell is thinner than a hair). */
export const SORT_MAX_GAP = 700;
/** How many cards a hand holds. */
const SORT_HAND = [5, 8];

/** The basket a pair belongs to: `one` when its only common plank is 1, `more` otherwise. */
export const truthOf = (a, b) => (gcd(a, b) === 1 ? 'one' : 'more');

/** Every plank of n, the shortest first. */
const divisorsUp = (n) => divisorsDown(n).reverse();

/** lists — the planks of each gap, shortest first, and the planks they share (shortest first). */
export function listsOf(a, b) {
  const la = divisorsUp(a);
  const lb = divisorsUp(b);
  return { a: la, b: lb, common: la.filter((d) => b % d === 0) };
}

/**
 * summit — the planks of the shorter gap, from the longest down, each tried on the longer gap until the first that fills
 * it: `tried` = [{ d, q, r }] (q, r of long ÷ d; the last has r = 0), `all` = every plank of the shorter gap.
 */
export function summitFactsOf(a, b) {
  const D = descentOf(a, b);
  const tried = D.planks.map((d) => ({ d, q: Math.floor(D.long / d), r: D.long % d }));
  return { short: D.short, long: D.long, all: D.all, tried, stop: D.crown };
}

/** ladder — the rows of Euclid's divisions, the longer gap first: [{ a, b, q, r }], the last with r = 0. */
export const ladderFactsOf = (a, b) =>
  ladderOf(a, b, 'divide').rows.map((row) => ({ a: row.a, b: row.b, q: row.q, r: row.value }));

/** How many facts the world shows, one per tick, when the instrument runs. */
export function toolSteps(tool, a, b) {
  if (tool === 'lists') return 2; // the planks of a, then those of b with the shared ones marked
  if (tool === 'summit') return summitFactsOf(a, b).tried.length;
  if (tool === 'ladder') return ladderFactsOf(a, b).length;
  throw new RangeError(`sort: tool ${tool}`);
}

/**
 * The world's answer to a card dropped in the OTHER basket (null when the basket is its own):
 *   said `one`, truth `more`: { kind: 'common', d, qa, qb, both } — d = the longest plank of both, laid on both
 *                              (a = d × qa, b = d × qb);
 *   said `more`, truth `one`: { kind: 'none', short, long, planks: [{ d, q, r }] } — every plank of the shorter gap from the
 *                              longest down, laid on the longer: only the last (1) leaves no rest.
 */
export function witnessOf(a, b, said) {
  const truth = truthOf(a, b);
  if (said === truth) return null;
  if (truth === 'more') {
    const d = gcd(a, b);
    const { qa, qb, both } = plankOn(a, b, d);
    return { kind: 'common', d, qa, qb, both };
  }
  const short = Math.min(a, b);
  const long = Math.max(a, b);
  const planks = divisorsDown(short).map((d) => ({ d, q: Math.floor(long / d), r: long % d }));
  return { kind: 'none', short, long, planks };
}

/** How many ticks the world's answer takes (one plank laid per tick). */
export const answerSteps = (w) => (w ? (w.kind === 'common' ? 1 : w.planks.length) : 0);

/** What is wrong with a spec (empty when it can be played): the lesson's own test asserts it is empty. */
export function sortProblems(spec) {
  const out = [];
  if (spec.as !== 'pair' && spec.as !== 'fraction') out.push(`as: ${spec.as}`);
  const cards = spec.cards ?? [];
  if (cards.length < SORT_HAND[0] || cards.length > SORT_HAND[1]) out.push(`cards: ${cards.length}`);
  cards.forEach(({ a, b }, i) => {
    const ok = (n) => Number.isInteger(n) && n >= 1 && n <= SORT_MAX_GAP;
    if (!ok(a) || !ok(b)) out.push(`card ${i}: ${a} ; ${b}`);
  });
  const tools = spec.instruments ?? [];
  if (tools.some((t) => !SORT_TOOLS.includes(t)) || new Set(tools).size !== tools.length)
    out.push(`instruments: ${tools.join(',')}`);
  const valid = cards.filter(({ a, b }) => a >= 1 && b >= 1);
  const truths = new Set(valid.map(({ a, b }) => truthOf(a, b)));
  if (valid.length && truths.size < 2) out.push('one basket stays empty');
  return out;
}

// ───────────────────────── the state machine of the screen ─────────────────────────
// stage  card → [tool → card] → (drop in its basket) card of the next … → end
//                              → (drop in the other basket) answer → answered → (next) card of the next … → end

/** The card on the table, with what it derives from its numbers (null at the end). */
export function sortNow(spec, s) {
  if (s.ci == null) return null;
  const { a, b } = spec.cards[s.ci];
  return { i: s.ci, a, b, as: spec.as, truth: truthOf(a, b), short: Math.min(a, b), long: Math.max(a, b) };
}

export const initSort = (spec) => ({
  /** the cards still in his hand (indices into spec.cards), the one on the table excluded */
  hand: spec.cards.map((_, i) => i).slice(1),
  /** the card on the table */
  ci: 0,
  stage: 'card',
  /** the instrument opened on this card (null: none) and how many of its facts are shown */
  tool: null,
  shown: 0,
  /** the basket he dropped the card in, while the world answers */
  said: null,
  /** the cards played, in the order he played them: { a, b, as, said, truth, instrument, firstTry } */
  placed: [],
  done: false,
});

/** The card put in the basket it belongs to; the next card of his hand comes on the table (or the end). */
function place(spec, s, said) {
  const now = sortNow(spec, s);
  const entry = {
    a: now.a,
    b: now.b,
    as: now.as,
    said,
    truth: now.truth,
    instrument: s.tool,
    firstTry: said === now.truth,
  };
  const placed = [...s.placed, entry];
  const [ci = null, ...hand] = s.hand;
  return { ...s, placed, ci, hand, stage: ci == null ? 'end' : 'card', tool: null, shown: 0, said: null };
}

/**
 * One move of the experiment.
 *   { type: 'pick', i }        card: the card i of his hand comes on the table (only before an instrument is opened)
 *   { type: 'open', tool }     card: he opens one instrument the spec lists (once per card)
 *   { type: 'tick' }           tool / answer: the world shows its next fact
 *   { type: 'drop', basket }   card (instrument finished or none): the card dropped in 'one' or 'more'
 *   { type: 'next' }           answered: the card goes to its basket; end: the experiment is over
 * A move that does not belong to the stage changes nothing.
 */
export function sortReducer(spec, s, action) {
  const now = sortNow(spec, s);
  switch (action.type) {
    case 'pick': {
      if (s.stage !== 'card' || s.tool != null || !s.hand.includes(action.i)) return s;
      return { ...s, ci: action.i, hand: [s.ci, ...s.hand.filter((i) => i !== action.i)].sort((x, y) => x - y) };
    }
    case 'open': {
      const tools = spec.instruments ?? [];
      if (s.stage !== 'card' || s.tool != null || !tools.includes(action.tool)) return s;
      return { ...s, stage: 'tool', tool: action.tool, shown: 0 };
    }
    case 'tick': {
      if (s.stage === 'tool') {
        const shown = s.shown + 1;
        return { ...s, shown, stage: shown >= toolSteps(s.tool, now.a, now.b) ? 'card' : 'tool' };
      }
      if (s.stage === 'answer') {
        const shown = s.shown + 1;
        return { ...s, shown, stage: shown >= answerSteps(witnessOf(now.a, now.b, s.said)) ? 'answered' : 'answer' };
      }
      return s;
    }
    case 'drop': {
      if (s.stage !== 'card' || (action.basket !== 'one' && action.basket !== 'more')) return s;
      if (action.basket === now.truth) return place(spec, s, action.basket);
      return { ...s, stage: 'answer', said: action.basket, shown: 0 };
    }
    case 'next': {
      if (s.stage === 'answered') return place(spec, s, s.said);
      if (s.stage === 'end') return { ...s, done: true };
      return s;
    }
    default:
      return s;
  }
}

/** The cards of each basket, in the order they arrived (a card the world moved lands in the basket it belongs to). */
export const basketsOf = (s) => ({
  one: s.placed.filter((p) => p.truth === 'one'),
  more: s.placed.filter((p) => p.truth === 'more'),
});

/** What the investigation hands back to the forge (`forge.fromInquiry`). */
export const sortResult = (s) => ({ cards: s.placed });
