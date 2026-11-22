import { LOCALE } from '../locale.js';

/**
 * Money, in euros — THE one place that writes an amount (docs/architecture/FRENCH_LANGUAGE_CONTRACT.md §5).
 *
 * « 35 € », « 9,90 € », « 1 250 € »: the sign AFTER the number, a no-break space (U+00A0) before it, the decimal
 * comma, thousands grouped by the narrow no-break space of `Intl` for fr-FR. A whole amount has no decimals; any
 * other has two. Never « EUR », never « €35 ». No amount is decided here: the server sends them.
 *
 * The server speaks in CENTS (`…Cents` fields): `formatEur(990)` → « 9,90 € ». An amount already in euros (a form
 * field) says so: `formatEur(35, { unit: 'euros' })` → « 35 € ».
 */
export const EURO_SIGN = '€';
const NBSP = ' ';

export function formatEur(value, { unit = 'cents' } = {}) {
  const number = Number(value || 0);
  const cents = Math.round(unit === 'euros' ? number * 100 : number);
  const whole = cents % 100 === 0;
  const digits = new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(cents / 100);
  return `${digits}${NBSP}${EURO_SIGN}`;
}
