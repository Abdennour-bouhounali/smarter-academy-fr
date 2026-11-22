/**
 * COUNTED NOUNS of lesson `qisma-iqlidiya-baqi` — PURE. ONE place for the agreement of an Arabic noun with its number:
 * every generated sentence of the lesson (the experiments, the forges, the trainer, the board) says « 2 planks »,
 * « 7 cells », « 100 planks » through `counted`, never by gluing a number to a word.
 *
 *   0          the noun's own « none » form (« لا لوح », « لم تبقَ أيّ خانة » is the sentence's business)
 *   1          the noun, then « واحد / واحدة »        لوح واحد · خانة واحدة
 *   2          the dual, alone                         لوحان (لوحين) · خانتان (خانتين)
 *   3 … 10     the number, then the plural             5 ألواح · 7 خانات
 *   11 … 99    the number, then the singular in نصب    15 لوحًا · 15 خانة
 *   100, 200…  the number, then the singular in جرّ    100 لوح · 300 خانة
 * Above 100 the noun follows the LAST TWO digits (103 ألواح، 125 لوحًا، 101 لوح).
 * A noun is DATA — { zero, one, two, few, many, hundred } and, where a sentence makes it an object (« تأخذ لوحًا واحدًا »,
 * « تأخذ لوحين ») or puts it after a preposition (« بعد لوح واحد », « بعد لوحين »), `oneAcc` and `twoAcc`.
 */

/**
 * « n things », agreed. The case changes 1 and 2 only:
 *   acc  the noun is an OBJECT (نصب):              لوحًا واحدًا · لوحين
 *   gen  it follows a preposition or « بعد » (جرّ):  لوح واحد · لوحين
 */
export function counted(n, noun, { acc = false, gen = false } = {}) {
  if (n === 0) return noun.zero;
  if (n === 1) return acc ? (noun.oneAcc ?? noun.one) : noun.one;
  if (n === 2) return acc || gen ? (noun.twoAcc ?? noun.two) : noun.two;
  const tail = n % 100;
  if (tail >= 3 && tail <= 10) return `${n} ${noun.few}`;
  if (tail >= 11) return `${n} ${noun.many}`;
  return `${n} ${noun.hundred}`;
}

/** لوح (masculine). */
export const PLANK = {
  zero: 'لا لوح',
  one: 'لوح واحد',
  oneAcc: 'لوحًا واحدًا',
  two: 'لوحان',
  twoAcc: 'لوحين',
  few: 'ألواح',
  many: 'لوحًا',
  hundred: 'لوح',
};
/** لوح كامل — the adjective agrees too. */
export const FULL_PLANK = {
  zero: 'لا لوح كامل',
  one: 'لوح واحد كامل',
  oneAcc: 'لوحًا واحدًا كاملًا',
  two: 'لوحان كاملان',
  twoAcc: 'لوحين كاملين',
  few: 'ألواح كاملة',
  many: 'لوحًا كاملًا',
  hundred: 'لوح كامل',
};
/** خانة (feminine). */
export const CELL = {
  zero: 'لا خانة',
  one: 'خانة واحدة',
  two: 'خانتان',
  twoAcc: 'خانتين',
  few: 'خانات',
  many: 'خانة',
  hundred: 'خانة',
};
/** خانة فارغة — the adjective agrees too. */
export const EMPTY_CELL = {
  zero: 'لا خانة فارغة',
  one: 'خانة واحدة فارغة',
  two: 'خانتان فارغتان',
  twoAcc: 'خانتين فارغتين',
  few: 'خانات فارغة',
  many: 'خانة فارغة',
  hundred: 'خانة فارغة',
};
/** مسافر (masculine, a person). */
export const TRAVELLER = {
  zero: 'لا مسافر',
  one: 'مسافر واحد',
  oneAcc: 'مسافرًا واحدًا',
  two: 'مسافران',
  twoAcc: 'مسافرَين',
  few: 'مسافرين',
  many: 'مسافرًا',
  hundred: 'مسافر',
};
/** عربة (feminine) — a cabin of the cable car. A verb before it is feminine: « امتلأت 9 عربات », « تلزم عربة ». */
export const CABIN = {
  zero: 'لا عربة',
  one: 'عربة واحدة',
  two: 'عربتان',
  twoAcc: 'عربتين',
  few: 'عربات',
  many: 'عربة',
  hundred: 'عربة',
};

/** « 7 ألواح », « لوحان », « 100 لوح ». */
export const planksOf = (n, opts) => counted(n, PLANK, opts);
/** « 7 ألواح كاملة », « لوحان كاملان ». */
export const fullPlanksOf = (n, opts) => counted(n, FULL_PLANK, opts);
/** « 7 خانات », « خانتان », « 15 خانة ». */
export const cellsOf = (n, opts) => counted(n, CELL, opts);
/** « 7 خانات فارغة », « خانتان فارغتان ». */
export const emptyCellsOf = (n, opts) => counted(n, EMPTY_CELL, opts);
/** « 12 مسافرًا », « مسافران ». */
export const travellersOf = (n, opts) => counted(n, TRAVELLER, opts);
/** « 6 عربات », « عربة واحدة », « 12 عربة ». */
export const cabinsOf = (n, opts) => counted(n, CABIN, opts);

/** What is left on a gap, as a fact: « لم تبقَ أيّ خانة », « بقيت خانتان », « بقيت 15 خانة ». */
export const restOf = (r) => (r === 0 ? 'لم تبقَ أيّ خانة' : `بقيت ${cellsOf(r)}`);
/** The same, naming them empty: « لم تبقَ أيّ خانة فارغة », « بقيت خانتان فارغتان ». */
export const emptyRestOf = (r) => (r === 0 ? 'لم تبقَ أيّ خانة فارغة' : `بقيت ${emptyCellsOf(r)}`);
/** A length after « من » or « في »: « هوّة من 7 خانات », « من خانتين », « من خانة واحدة ». */
export const ofCells = (n) => cellsOf(n, { gen: true });
