/**
 * COUNTED NOUNS of lesson `qisma-iqlidiya-hasr` — ONE place for the Arabic agreement of a number written in digits with
 * the thing it counts (PURE). Every generated sentence of the lesson (the forges, the investigations, the story, the
 * trainer, the knowledge map, the board) writes a count through `count`: never « 7 صندوقًا », « 4 علبة », « 100 لوحًا ».
 *
 *   0                    « لا لوح », « لا خانة »                    (`none`)
 *   1                    « لوح واحد », « خانة واحدة »               (accusative of a masculine noun: « لوحًا واحدًا »)
 *   2                    « لوحان », « خانتان »                      (accusative / genitive: « لوحين », « خانتين »)
 *   3 … 10               « 7 ألواح », « 10 خانات »                  (the plural)
 *   11 … 99              « 21 لوحًا », « 13 خانة »                  (the singular, accusative)
 *   100 and more         by its last two digits: 00, 01, 02 → the singular (« 100 لوح », « 200 خانة », « 101 لوح »),
 *                        03 … 10 → the plural (« 106 ألواح »), 11 … 99 → the accusative singular (« 4576 خانة », « 112 لوحًا »)
 *
 * `kase`: 'nom' (the subject: « بقيت خانتان »), 'acc' (the object: « نملأ صندوقين ») or 'gen' (after a preposition or a
 * noun: « من خانتين ») — it changes 1 and 2 only. What must AGREE with the count beside it (a pronoun, a verb) is chosen
 * by `agree(n, [for one, for two, for more])`.
 */

/** A noun the lesson counts: its singular, its plural, its gender ('m' | 'f'). */
export const noun = (one, many, g = 'm') => ({ one, many, g });

export const PLANK = noun('لوح', 'ألواح');
export const CELL = noun('خانة', 'خانات', 'f');
export const BOX = noun('صندوق', 'صناديق');
export const TRIP = noun('رحلة', 'رحلات', 'f');

/**
 * The accusative singular — after 11 … 99 and after « كم »: « لوحًا », « كم صندوقًا »; a noun in « ة » is written as
 * it is (« كم رحلة »).
 */
export const tamyiz = (w) => (w.one.endsWith('ة') ? w.one : `${w.one}ًا`);
/** The dual: « لوحان / لوحين », « خانتان / خانتين ». */
const dual = (w, kase) => `${w.one.endsWith('ة') ? `${w.one.slice(0, -1)}ت` : w.one}${kase === 'nom' ? 'ان' : 'ين'}`;
const single = (w, kase) => (w.g === 'f' ? `${w.one} واحدة` : kase === 'acc' ? `${tamyiz(w)} واحدًا` : `${w.one} واحد`);

/** « n things », agreed: see the table above. */
export function count(n, w, kase = 'nom') {
  if (!Number.isInteger(n) || n < 0) throw new RangeError(`count: ${n}`);
  if (n === 0) return `لا ${w.one}`;
  if (n === 1) return single(w, kase);
  if (n === 2) return dual(w, kase);
  const m = n % 100;
  if (n >= 100 && m <= 2) return `${n} ${w.one}`;
  return m >= 3 && m <= 10 ? `${n} ${w.many}` : `${n} ${tamyiz(w)}`;
}

/** The word that agrees with a count: `forms` = [for one, for two, for three and more]. */
export const agree = (n, [one, two, more]) => (n === 1 ? one : n === 2 ? two : more);

/** « 7 ألواح », « لوحان », « 21 لوحًا ». */
export const planks = (n, kase) => count(n, PLANK, kase);
/** « 7 خانات », « خانتان », « 4576 خانة ». */
export const cells = (n, kase) => count(n, CELL, kase);
/** « لوح واحد طوله 40 », « لوحان طولهما 40 », « 7 ألواح طولها 40 », « 21 لوحًا طولها 40 ». */
export const planksOf = (n, b, kase) => `${planks(n, kase)} ${agree(n, ['طوله', 'طولهما', 'طولها'])} ${b}`;
