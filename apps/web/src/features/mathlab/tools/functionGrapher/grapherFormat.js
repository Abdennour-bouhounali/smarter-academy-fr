/**
 * Le FORMAT des nombres du grapheur : virgule décimale, vrai signe moins,
 * comme partout sur la plateforme (statsUtils.formatNumber). Les chiffres
 * restent latins — convention des manuels algériens de mathématiques.
 */

/** Une valeur pour une lecture (curseur, point) : `2,35`, `−4`, `—` si non définie. */
export function formatValue(value, decimals = 2) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  const rounded = Number(value.toFixed(decimals));
  const text = Math.abs(rounded) < 1e-12 ? '0' : String(rounded);

  return text.replace('.', ',').replace('-', '−');
}

/** Une étiquette d'axe : sans zéros inutiles, avec le signe moins typographique. */
export function formatAxisLabel(value) {
  const rounded = Number(value.toPrecision(10));
  const text = Math.abs(rounded) < 1e-12 ? '0' : String(rounded);

  return text.replace('.', ',').replace('-', '−');
}

/** Le nombre de décimales qui fait sens pour une lecture à ce zoom (≈ un dixième de pixel). */
export function decimalsFor(unitsPerPixel) {
  if (!(unitsPerPixel > 0)) return 2;
  const decimals = Math.ceil(-Math.log10(unitsPerPixel)) + 1;

  return Math.min(6, Math.max(0, decimals));
}
