/**
 * The words a mission's data file shares (pure): an Arabic count with its noun, what is left of two stocks, and an
 * equality kept left to right and unbreakable inside an Arabic sentence.
 */
const NB = ' ';
/** `forms` = [one, two, 3–10, 11+]: « تشكيلة واحدة », « تشكيلتان », « 4 تشكيلات », « 132 تشكيلة ». */
export const counted = (n, forms) => {
  const last = n % 100;
  if (n === 1) return forms[0];
  if (n === 2) return forms[1];
  return last >= 3 && last <= 10 ? `${n}${NB}${forms[2]}` : `${n}${NB}${forms[3]}`;
};
export const CRATES = ['صندوق واحد', 'صندوقان', 'صناديق', 'صندوقًا'];
/** « 3 صناديق من البطاطا و6 صناديق من الجزر » — only the stocks of which something is left. */
export const leftOf = (left, kinds) =>
  ['a', 'b']
    .filter((k) => left[k] > 0)
    .map((k) => `${counted(left[k], CRATES)} من ${kinds[k].name}`)
    .join(' و');
export const ltr = (s) => `⁦${s.replace(/ /g, NB)}⁩`;
