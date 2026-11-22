/**
 * THE INVESTIGATION `deal` — PURE logic (screen: `InquiryDeal.jsx`; contract: GAME_WORLD.md « Explore », « spec shape of
 * `deal` »). Two collections (nA items of one kind, nB of another) are shared into k IDENTICAL lots: the world deals both
 * round by round, one item of each kind per lot and per round, and what cannot be dealt stays on the table. Everything
 * is shared exactly when k fills both numbers; the most lots is the longest plank of both gaps of the archipelago.
 *
 * The screen is a pure view of this file's reducer, so the whole experiment is played and tested without a browser.
 */
/** What k lots give: each lot holds qA and qB, rA and rB stay on the table; `rounds` = the rounds of the deal. */
export function dealOf(nA, nB, k) {
  if (!(Number.isInteger(k) && k > 0)) throw new RangeError(`deal: ${k} lots`);
  const qA = Math.floor(nA / k);
  const qB = Math.floor(nB / k);
  const rA = nA - k * qA;
  const rB = nB - k * qB;
  return { k, qA, rA, qB, rB, ok: rA === 0 && rB === 0, rounds: Math.max(qA, qB) };
}

/** Every number of lots that shares both collections with nothing left, fewest first (the common divisors). */
export function dealsThatWork(nA, nB) {
  const out = [];
  for (let k = 1; k <= Math.min(nA, nB); k += 1) if (nA % k === 0 && nB % k === 0) out.push(k);
  return out;
}

/** The most lots that share everything (the longest plank of both gaps), and what one lot then holds. */
export function mostLots(nA, nB) {
  const k = dealsThatWork(nA, nB).at(-1);
  return { k, x: nA / k, y: nB / k };
}

/**
 * How the world answers what he typed: said = { k, x, y } (the most lots, what one lot holds of each kind).
 *   ok      it is the most lots, and what one lot holds
 *   deal    k does not share everything, or one lot does not hold x and y: the world deals k (or shows its row)
 *   bigger  k shares everything with x and y, but a bigger k of HIS table did too: that row is shown
 *   open    the same, and no bigger k of his table did — a number he has not tried is still open (never the answer)
 */
export function answerOf(nA, nB, tries, said) {
  const most = mostLots(nA, nB);
  if (said.k === most.k && said.x === most.x && said.y === most.y) return { kind: 'ok' };
  const d = dealOf(nA, nB, said.k);
  if (!d.ok || d.qA !== said.x || d.qB !== said.y) return { kind: 'deal', k: said.k };
  const bigger = tries.filter((t) => t.ok && t.k > said.k).sort((x, y) => y.k - x.k)[0];
  return bigger ? { kind: 'bigger', k: bigger.k } : { kind: 'open' };
}

// ───────────────────────── the state machine of the screen ─────────────────────────
// stage  pick → guess → deal (ticks) → pick … → answer → (miss: deal → pick | pick) … → seen

/** The numbers of the spec, and the most lots he may type (the longest choice). */
export function dealNow(spec) {
  const choices = spec.choices ?? [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  return { nA: spec.a.n, nB: spec.b.n, choices, max: Math.max(...choices), minTries: spec.minTries ?? 4 };
}

export const initDeal = () => ({
  stage: 'pick',
  /** the number of lots on the scene (null: none chosen yet), and the rounds of its deal shown so far */
  k: null,
  dealt: 0,
  /** his tries, in order: [{ k, guess, restA, restB, ok, qA, qB }] — guess null for a deal of his answer */
  tries: [],
  /** what the fact line says: { type: 'dealt' | 'again' | 'miss' | 'ok' | 'bound', … } */
  fact: null,
  /** his answers: [{ k, x, y, kind }] */
  answers: [],
  /** the guess waiting for the deal, and the miss waiting for a deal of his answer */
  guess: null,
  miss: null,
  done: false,
});

const rowOf = (nA, nB, k, guess) => {
  const d = dealOf(nA, nB, k);
  return { k, guess, restA: d.rA, restB: d.rB, ok: d.ok, qA: d.qA, qB: d.qB };
};

/**
 * One move of the experiment.
 *   { type: 'choose', k }        pick: a number of lots (a k already tried shows its row again, nothing is dealt twice)
 *   { type: 'say', v }           guess: will everything be shared? (true / false)
 *   { type: 'tick' }             deal: the world deals one more round (the last one ends the deal)
 *   { type: 'toAnswer' }         pick: after `minTries` tries, the boxes of the answer
 *   { type: 'back' }             answer: back to the tries
 *   { type: 'answer', k, x, y }  answer: the most lots and what one lot holds
 *   { type: 'next' }             seen: the end
 * A move that does not belong to the stage changes nothing.
 */
export function dealReducer(spec, s, action) {
  const { nA, nB, max, minTries } = dealNow(spec);
  switch (action.type) {
    case 'choose': {
      if (s.stage !== 'pick' || !Number.isInteger(action.k) || action.k < 1) return s;
      const row = s.tries.find((t) => t.k === action.k);
      if (row) return { ...s, k: row.k, dealt: dealOf(nA, nB, row.k).rounds, fact: { type: 'again', row } };
      return { ...s, stage: 'guess', k: action.k, dealt: 0, fact: null };
    }
    case 'say': {
      if (s.stage !== 'guess' || typeof action.v !== 'boolean') return s;
      return { ...s, stage: 'deal', guess: action.v };
    }
    case 'tick': {
      if (s.stage !== 'deal') return s;
      const { rounds } = dealOf(nA, nB, s.k);
      const dealt = Math.min(rounds, s.dealt + 1);
      if (dealt < rounds) return { ...s, dealt };
      const row = rowOf(nA, nB, s.k, s.miss ? null : s.guess);
      const fact = s.miss ? { type: 'miss', ...s.miss, row } : { type: 'dealt', row };
      return { ...s, stage: 'pick', dealt, tries: [...s.tries, row], fact, guess: null, miss: null };
    }
    case 'toAnswer': {
      if (s.stage !== 'pick' || s.tries.length < minTries) return s;
      return { ...s, stage: 'answer', fact: null };
    }
    case 'back': {
      if (s.stage !== 'answer') return s;
      return { ...s, stage: 'pick' };
    }
    case 'answer': {
      if (s.stage !== 'answer') return s;
      const { k, x, y } = action;
      // a box left empty, or a number of lots outside 1 … max, is answered by the bound (never a silent button)
      if (![k, x, y].every((v) => Number.isInteger(v) && v >= 0) || k < 1 || k > max)
        return { ...s, fact: { type: 'bound', max } };
      const said = { k, x, y };
      const a = answerOf(nA, nB, s.tries, said);
      const answers = [...s.answers, { ...said, kind: a.kind }];
      if (a.kind === 'ok')
        return { ...s, stage: 'seen', answers, k, dealt: dealOf(nA, nB, k).rounds, fact: { type: 'ok', said } };
      const miss = { kind: a.kind, said };
      if (a.kind === 'open') return { ...s, stage: 'pick', answers, fact: { type: 'miss', ...miss, row: null } };
      const row = s.tries.find((t) => t.k === a.k);
      if (row)
        return {
          ...s,
          stage: 'pick',
          answers,
          k: row.k,
          dealt: dealOf(nA, nB, row.k).rounds,
          fact: { type: 'miss', ...miss, row },
        };
      // the world deals what he typed, then says what is left (a k he never tried joins his table)
      return { ...s, stage: 'deal', answers, k: a.k, dealt: 0, fact: null, miss };
    }
    case 'next': {
      if (s.stage !== 'seen') return s;
      return { ...s, done: true };
    }
    default:
      return s;
  }
}

/** What the investigation hands back to the forge (`forge.fromInquiry`). */
export function dealResult(spec, s) {
  const { nA, nB } = dealNow(spec);
  const most = mostLots(nA, nB);
  return {
    tries: s.tries.map(({ k, guess, restA, restB, ok }) => ({ k, guess, restA, restB, ok })),
    most: most.k,
    perLot: [most.x, most.y],
    answers: s.answers,
  };
}
