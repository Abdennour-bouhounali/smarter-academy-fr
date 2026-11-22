/**
 * The words a mission's data file shares (pure): a count with its noun — the French agreement of the kit
 * (`kit/authoring/numbers.js › counted`: « 1 caisse », « 3 caisses », the number and the noun joined by a no-break
 * space) — and what is left of two stocks.
 */
import { counted, listFr } from '../kit/authoring/numbers';

export { counted };
/** The crates of the depot (« l’entrepôt » of « La coopérative du verger »): « 1 caisse », « 6 caisses ». */
export const CRATES = ['caisse', 'caisses'];
/** « 3 caisses de pommes et 6 caisses d’œufs » — only the stocks of which something is left (`kinds[k].name`, as « pommes »). */
export const leftOf = (left, kinds) =>
  listFr(
    ['a', 'b']
      .filter((k) => left[k] > 0)
      .map(
        (k) => `${counted(left[k], CRATES)} ${/^[aeiouyhéèêœ]/i.test(kinds[k].name) ? 'd’' : 'de '}${kinds[k].name}`,
      ),
  );
