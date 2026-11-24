/** EXAMPLES of the spec shapes a lesson's `inquiries.js` writes for this world's three kinds (plan §3.4–§3.6, final). */
import { RIVER, riverFigure } from '../logic';

export const NESTED = { V: 'A', M: 'M', B: 'B', N: 'N', C: 'C' };
export const PLAN_SPEC = {
  kind: 'plan',
  rounds: [
    {
      fig: {
        kind: 'nested',
        names: { V: 'S', M: 'M', B: 'B', N: 'N', C: 'C' },
        len: { VM: '80', VB: '90', VN: '80', VC: '90', MN: '88', BC: '99' },
      },
      given: ['MB', 'VB', 'BC'],
      unknown: 'MN',
    },
    {
      fig: { kind: 'nested', names: NESTED, len: { VM: '42', VB: '54', VN: '56', VC: '72', MN: '63', BC: '81' } },
      given: ['VM', 'MB', 'BC'],
      unknown: 'MN',
    },
    {
      fig: { kind: 'nested', names: NESTED, len: { VM: '42', VB: '54', VN: '56', VC: '72', MN: '63', BC: '81' } },
      given: ['VN', 'NC', 'MN'],
      unknown: 'BC',
    },
  ],
};
export const HALFTURN_SPEC = {
  kind: 'halfturn',
  rounds: [
    {
      fig: {
        kind: 'butterfly',
        names: { V: 'I', M: 'K', B: 'P', N: 'L', C: 'Q' },
        len: { VM: '35', VB: '50', VN: '49', VC: '70', MN: '63', BC: '90' },
      },
    },
    {
      fig: {
        kind: 'butterfly',
        names: { V: 'I', M: 'K', B: 'P', N: 'L', C: 'Q' },
        len: { VM: '35', VB: '60', VN: '49', VC: '64', MN: '63', BC: '92' },
      },
    },
  ],
};
export const SCALE_SPEC = {
  kind: 'scale',
  tri: {
    small: { V: 'A', P: 'M', Q: 'N', sides: ['20', '40', '55'] },
    big: { V: 'A', P: 'B', Q: 'C', sides: ['24', '48', '66'] },
  },
  rounds: [
    { fact: { k: '1/36', lines: ['$k = \\dfrac{1}{36}$'] } },
    { k: '6/5', feed: 'small' },
    { k: '6/5', feed: 'big' },
    { k: null, feed: 'big' },
    { k: '6/5', feed: 'small', perimeter: true },
  ],
};

/**
 * `plan` on BUTTERFLIES and one nested round between them — France's K2 (UNIT_3E_THALES_DESIGN.md § 3): HIS river
 * (AF = 416; the across EA = 81 gives 468, too long), a nested round (AB = 6 by a join, MN = 5,5), a butterfly
 * O A B E F at k = 2/5 whose length ACROSS the vertex is given (AE = 31,5: OE = 22,5 by a cut across, EF = 12,5; the
 * across gives 17,5, too long). Then, as a round of its own for the words of a rope from the vertex, the same butterfly
 * with the unknown ACROSS (BF = 38,5; typing OF = 27,5 falls short).
 */
const OABEF = {
  kind: 'butterfly',
  names: { V: 'O', M: 'A', B: 'E', N: 'B', C: 'F' },
  len: { VM: '9', VB: '22,5', VN: '11', VC: '27,5', MN: '5', BC: '12,5' },
};
export const BUTTERFLY_PLAN_SPEC = {
  kind: 'plan',
  rounds: [
    { fig: riverFigure(RIVER), given: ['VM', 'VB', 'MN'], unknown: 'BC' },
    {
      fig: { kind: 'nested', names: NESTED, len: { VM: '2', VB: '6', VN: '4,5', VC: '13,5', MN: '5,5', BC: '16,5' } },
      given: ['VM', 'MB', 'BC'],
      unknown: 'MN',
    },
    { fig: OABEF, given: ['VM', 'VMB', 'MN'], unknown: 'BC' },
  ],
};
export const ACROSS_PLAN_SPEC = { kind: 'plan', rounds: [{ fig: OABEF, given: ['VM', 'VB', 'VN'], unknown: 'VNC' }] };
