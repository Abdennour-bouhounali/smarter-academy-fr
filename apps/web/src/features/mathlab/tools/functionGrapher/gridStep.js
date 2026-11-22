/**
 * LE PAS DE LA GRILLE : lisible à tout niveau de zoom.
 *
 * Le pas est le plus petit de la suite 1, 2, 5, 10, 20, 50… (et 0,5 ; 0,2 ;
 * 0,1…) qui laisse au moins `minPixels` entre deux lignes principales. Les
 * subdivisions découpent chaque carreau en 5 (pas en 1 ou 5) ou en 4 (pas
 * en 2), pour que les lignes fines tombent sur des valeurs rondes.
 */

const MIN_GRID_PIXELS = 56;

/**
 * @param {number} pixelsPerUnit  combien de pixels fait une unité du plan
 * @returns {{step: number, subdivisions: number}}
 */
export function gridStepFor(pixelsPerUnit, minPixels = MIN_GRID_PIXELS) {
  if (!(pixelsPerUnit > 0) || !Number.isFinite(pixelsPerUnit)) return { step: 1, subdivisions: 5 };
  const minUnits = minPixels / pixelsPerUnit;
  const exponent = Math.floor(Math.log10(minUnits));
  const base = 10 ** exponent;
  let mantissa = 1;
  for (const candidate of [1, 2, 5, 10]) {
    if (candidate * base >= minUnits) { mantissa = candidate; break; }
  }
  const step = roundStep(mantissa * base);

  return { step, subdivisions: mantissa === 2 ? 4 : 5 };
}

/** 0.30000000000000004 → 0.3 : les étiquettes en dépendent. */
function roundStep(value) {
  return Number(value.toPrecision(12));
}
