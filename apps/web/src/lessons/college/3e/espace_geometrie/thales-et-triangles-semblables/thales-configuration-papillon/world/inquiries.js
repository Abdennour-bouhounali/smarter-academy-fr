/**
 * THE EXPERIMENTS « Explore » of lesson `thales-configuration-papillon` — the first phase of its two forges (`forges.js ›
 * inquiry`; the screens are the world's: `nilePyramids/Inquiry.jsx` → `InquiryHalfturn.jsx`, `InquiryPlan.jsx`; their
 * logic `halfturn.js`, `plan.js`; their words `strings.js › KIND_TEXT`, with the lesson's `text` over them). No two keys
 * share a (kind, mode) — `inquiries.test.js`. Design: docs/reports/UNIT_3E_THALES_DESIGN.md § 2 (K1, K2).
 *
 *   papillon                 `halfturn` (no `chainOwn`: the screen prints no chain — the tiles are his): round 1 is HIS
 *                            river, whole (SE 9, SA 72, ER 52, AF 416; SR = √2785 and SF = 8√2785 are never written —
 *                            `logic.js › riverFigure`, k = 1/8); round 2 a parallel butterfly I K L / P Q (k = 4/7);
 *                            round 3 the crooked one on the same small triangle. Before each turn he says on which line
 *                            the point lands.
 *   calcul-depuis-le-sommet  `plan` (it WRITES the rule): round 1 HIS river (AF = 416 — the across 81 gives 468, an
 *                            overhang), round 2 ONE nested figure (AB = 6 by a join, MN = 5,5), round 3 a butterfly whose
 *                            length ACROSS the vertex is given (AE = 31,5: OE = 22,5 by a cut, EF = 12,5). The world lays
 *                            his number: it touches, leaves a gap or goes over, the size written.
 * Every sentence is a FACT about what he did — never a rule, never a key's name (`inquiries.test.js`).
 */
import { K, NUMBERS, RIVER, riverFigure } from './math';

const PAP = NUMBERS.papillon;
const CAL = NUMBERS.calcul;

/** HIS river round the stake S: E and R on this bank, A and F across (k = 1/8) — what the world logged at dock 3. */
export const TURN_RIVER = { ...riverFigure(RIVER), head: 'Le Nil' };
/** Round 2: the parallel butterfly I K L / P Q (k = 4/7). */
export const TURN_PARALLEL = { kind: 'butterfly', names: { ...PAP.rounds[0].names }, len: { ...PAP.rounds[0].len } };
/** Round 3: the crooked one on the same small triangle (PQ = 11,5, cos Î = −1/4). */
export const TURN_CROOKED = { kind: 'butterfly', names: { ...PAP.rounds[1].names }, len: { ...PAP.rounds[1].len } };

export const HALFTURN_INQUIRY = {
  kind: 'halfturn',
  rounds: [{ fig: TURN_RIVER }, { fig: TURN_PARALLEL }, { fig: TURN_CROOKED }],
  text: {
    lead: 'Deux triangles de part et d’autre d’un même point, comme les deux rives du Nil. Fais tourner le petit d’un demi-tour autour de ce point.',
  },
};

/** A round of the plan as the world draws it: its true lengths, the length across (or the piece) it gives. */
const planFig = (r) => ({
  kind: r.kind,
  names: { ...r.names },
  len: { ...r.len, ...(r.across ?? {}), ...(r.pieces ?? {}) },
});

/** Round 1: HIS river, whole (SR, SF exact roots, never shown: `show` is what he is given). */
export const PLAN_RIVER = { ...riverFigure(RIVER), head: 'Le Nil' };
export const PLAN_NESTED = planFig(CAL.rounds[1]);
export const PLAN_BUTTERFLY = planFig(CAL.rounds[2]);

export const PLAN_INQUIRY = {
  kind: 'plan',
  /** What he builds and the world accepts IS his rule: no tile is offered (GAME_WORLD.md §2sexies). */
  writes: true,
  rounds: [
    { fig: PLAN_RIVER, given: ['VM', 'VB', 'MN'], unknown: 'BC' },
    { fig: PLAN_NESTED, given: ['VM', 'MB', 'BC'], unknown: 'MN' },
    { fig: PLAN_BUTTERFLY, given: ['VM', 'VMB', 'MN'], unknown: 'BC' },
  ],
  text: {
    lead: 'Personne ne peut mesurer cette longueur. Choisis deux cartes, mets deux cordes bout à bout ou coupe un morceau s’il le faut, puis écris la longueur.',
  },
};

/** The experiment of each key (one per key: no (kind, mode) twice). */
export const INQUIRIES = { [K.papillon]: HALFTURN_INQUIRY, [K.calcul]: PLAN_INQUIRY };
