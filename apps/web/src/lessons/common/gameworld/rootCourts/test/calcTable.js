/**
 * Test helpers of the experiment ✍️ « La calculatrice » (calc.js) — imported by tests only (the `test/` folder, like
 * kit/authoring/test/): what the layout of its table is measured against.
 */
import { rodOf } from '../calc';
import { outcome, write } from '../logic';

/** The longest number the table of a spec will write (the area, a rod, what it covers, the difference): ≤ MAX_CELL. */
export const longestCell = (spec) =>
  Math.max(
    write(spec.a).length,
    ...spec.rods.flatMap((r) => {
      const o = outcome(rodOf(r), write(spec.a));
      return [rodOf(r).q, o.covers, o.diff].map((x) => String(x).length);
    }),
  );
