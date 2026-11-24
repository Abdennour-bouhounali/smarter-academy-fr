/**
 * THE EXPERIMENT `halfturn`, the half-turn (key 🦋 — PYRAMIDS_WORLD_PLAN §2.3, §3.5) — PURE reducer; the screen is
 * `InquiryHalfturn.jsx`. A BUTTERFLY: the small triangle VMN on one side of the vertex, the big VBC on the other. BEFORE
 * the turn he says where M will land — on line (VB) or on line (VC); then he turns the small triangle round the vertex
 * with ← → (steps of 30°; it stops at 180°). His act is the prediction (gate cut 5). The turned triangle lands INSIDE the
 * big one: key 🔑's nested figure appears with its gauge; where each turned point lies is written as a FACT, never the
 * chain of ratios — except, when the inquiry says `chainOwn: true`, ONE line that rewrites the chain in the
 * butterfly's own letters (InquiryHalfturn.jsx; off by default). On a crooked butterfly the turned side lands crooked: the gauge stands
 * apart.
 *
 *   spec = { kind: 'halfturn', rounds: [{ fig: { kind: 'butterfly', names: { V, M, B, N, C }, len } }], chainOwn?, text? }
 */
import { chain } from './figure';

const STEP = 30;
const HALF = 180;

export function initHalfturn(spec) {
  if (!spec.rounds?.length) throw new Error('halfturn: no round');
  return { i: 0, stage: 'predict', predicted: null, angle: 0, rows: [], done: false };
}

/** The nested figure the half-turn gives: the same lengths, M and N now on the rays of B and C. */
export const turned = (fig) => ({ ...fig, kind: 'nested' });

export function halfturnReducer(spec, s, a) {
  const fig = spec.rounds[s.i].fig;
  switch (a.type) {
    case 'predict':
      return s.stage === 'predict' && (a.line === 'B' || a.line === 'C')
        ? { ...s, predicted: a.line, stage: 'turn' }
        : s;
    case 'turn': {
      if (s.stage !== 'turn') return s;
      const angle = Math.max(0, Math.min(HALF, s.angle + STEP * Math.sign(a.d)));
      if (angle < HALF) return { ...s, angle };
      // M lands on the ray of B — the line (VB) — always: a half-turn keeps a line through its centre
      const row = { round: s.i, predicted: s.predicted, landed: 'B', right: s.predicted === 'B', parallel: chain(fig) };
      return { ...s, angle, stage: 'landed', rows: [...s.rows, row] };
    }
    case 'next':
      if (s.stage !== 'landed') return s;
      if (s.i + 1 >= spec.rounds.length) return { ...s, done: true };
      return { ...s, i: s.i + 1, stage: 'predict', predicted: null, angle: 0 };
    default:
      return s;
  }
}

/** The points of the small triangle turned by `angle` degrees round the vertex (for drawing), from the butterfly's. */
export function rotate(p, angle) {
  const t = (angle * Math.PI) / 180;
  const c = Math.cos(t);
  const n = Math.sin(t);
  return [p[0] * c - p[1] * n, p[0] * n + p[1] * c];
}

export const halfturnResult = (s) => ({ rows: s.rows });
