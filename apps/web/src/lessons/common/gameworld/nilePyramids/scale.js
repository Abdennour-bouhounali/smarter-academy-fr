/**
 * THE EXPERIMENT `scale`, the copying frame (key 🔍 — PYRAMIDS_WORLD_PLAN §2.3, §3.6) — PURE reducer; the screen is
 * `InquiryScale.jsx`. A copying frame fixed at the vertex V: a number k is set on its dial, a triangle is fed to it, and
 * the copy is drawn from V with every side × k. BEFORE each copy he says how it will stand against the target
 * triangle — larger · exact · smaller; the world draws it: beyond the target, covering it exactly, or inside it, its
 * sides written. A round may ask him to SET k himself (a fraction), or which perimeter the copy will have.
 *
 *   spec = { kind: 'scale',
 *            tri: { small: { V, P, Q, sides: [VP, VQ, PQ] }, big: { V, P, Q, sides: [...] } },
 *            rounds: [ { fact: { k, from, to } }                        a fact of the world (the capstone, gate F1)
 *                    | { k: '6/5', feed: 'small' | 'big' }               predict, then copy
 *                    | { k: null, feed: 'big' }                          he sets k, then copy
 *                    | { k: '6/5', feed: 'small', perimeter: true } ],   which perimeter: × k · + k · × 3k
 *            text? }
 * The target of a copy is the OTHER triangle. Everything is exact.
 */
import { read, write, times, plus, compare, tryRead } from '../kit/exact';

export const PREDICTS = Object.freeze(['larger', 'exact', 'smaller']);
export const PERIMETERS = Object.freeze(['times', 'plus', 'times3']);
const IMAGE_OF = { outside: 'larger', exact: 'exact', inside: 'smaller' };

export function initScale(spec) {
  if (!spec.rounds?.length) throw new Error('scale: no round');
  return {
    i: 0,
    stage: stageOf(spec.rounds[0]),
    k: spec.rounds[0].k ?? null,
    n: '',
    d: '',
    said: null,
    copy: null,
    rows: [],
    done: false,
  };
}
const stageOf = (r) => (r.fact ? 'fact' : r.k == null ? 'set' : r.perimeter ? 'perimeter' : 'predict');

const sum = (sides) => write(sides.reduce((acc, x) => plus(acc, x), read('0')));
const perimeterOf = (t) => sum(t.sides);

/** The copy of a triangle by k: its sides × k, and how it stands against the target (exact). */
export function copyOf(spec, feed, k) {
  const fed = spec.tri[feed];
  const target = spec.tri[feed === 'small' ? 'big' : 'small'];
  const sides = fed.sides.map((x) => write(times(x, k)));
  const c = compare(sides[0], target.sides[0]);
  return { sides, perimeter: sum(sides), image: c === 0 ? 'exact' : c < 0 ? 'inside' : 'outside' };
}

/** The perimeter each choice says the copy will have: × k, + k, × 3k (of the fed triangle's perimeter). */
export function perimeterChoices(spec, feed, k) {
  const p = perimeterOf(spec.tri[feed]);
  return { times: write(times(p, k)), plus: write(plus(p, k)), times3: write(times(p, times('3', k))) };
}

export function scaleReducer(spec, s, a) {
  const r = spec.rounds[s.i];
  switch (a.type) {
    case 'say':
      return s.stage === 'predict' && PREDICTS.includes(a.v) ? { ...s, said: a.v } : s;
    case 'frac':
      return s.stage === 'set'
        ? {
            ...s,
            [a.part]: String(a.text)
              .replace(/[^0-9]/g, '')
              .slice(0, 4),
          }
        : s;
    case 'feed': {
      if (s.copy) return s;
      let k = r.k;
      if (s.stage === 'set') {
        const v = tryRead(`${s.n}/${s.d}`);
        if (!s.n || !s.d || !v || v.n <= 0n) return s;
        k = write(v);
      }
      if (s.stage === 'predict' && !s.said) return s;
      if (s.stage === 'perimeter' && !s.said) return s;
      const copy = copyOf(spec, r.feed, k);
      const row = {
        round: s.i,
        feed: r.feed,
        k,
        image: copy.image,
        said: s.said,
        right:
          s.stage === 'predict'
            ? IMAGE_OF[copy.image] === s.said
            : s.stage === 'perimeter'
              ? perimeterChoices(spec, r.feed, k)[s.said] === copy.perimeter
              : copy.image === 'exact',
        perimeter: copy.perimeter,
      };
      return { ...s, k, copy, rows: [...s.rows, row] };
    }
    case 'choose':
      return s.stage === 'perimeter' && PERIMETERS.includes(a.v) && !s.copy ? { ...s, said: a.v } : s;
    case 'next': {
      if (s.stage !== 'fact' && !s.copy) return s;
      // a k he set that does not give the target exactly: the copy stays in the rows, he sets another
      if (s.stage === 'set' && s.copy.image !== 'exact') return { ...s, copy: null, n: '', d: '' };
      if (s.i + 1 >= spec.rounds.length) return { ...s, done: true };
      const nr = spec.rounds[s.i + 1];
      return { ...s, i: s.i + 1, stage: stageOf(nr), k: nr.k ?? null, n: '', d: '', said: null, copy: null };
    }
    default:
      return s;
  }
}

export const scaleResult = (s) => ({ rows: s.rows });
