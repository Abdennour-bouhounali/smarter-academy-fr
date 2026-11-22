/**
 * The arithmetic of lesson `qasim-mushtarak-akbar` — PURE. A divisor list, the common divisors, the PGCD and the Arabic
 * agreement are the authoring kit's (`kit/authoring/numbers.js`), re-exported here for the story, the practice ladder,
 * the trainer, the knowledge page and their tests; the lesson keeps the nouns of its own world (bouquets, flowers,
 * fruit) in the kit's shape [one, two, three to ten, eleven and more]: no number of the lesson is typed where it can be
 * computed.
 */

export const BOUQUETS = ['باقة واحدة', 'باقتان', 'باقات', 'باقة'];
export const ROSES = ['وردة واحدة', 'وردتان', 'ورود', 'وردة'];
export const LILIES = ['زنبقة واحدة', 'زنبقتان', 'زنبقات', 'زنبقة'];
export const DATES = ['تمرة واحدة', 'تمرتان', 'تمرات', 'تمرة'];
export const FIGS = ['تينة واحدة', 'تينتان', 'تينات', 'تينة'];

export {
  COINS,
  commonDivisors,
  counted,
  divisorsOf,
  emptyCells,
  gcd,
  listAr,
} from '../../../../../../common/gameworld/kit/authoring/numbers';
