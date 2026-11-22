/**
 * Le RÉSUMÉ d'un document du مختبر المثلثات : ce que l'instrument MONTRE —
 * le triangle rectangle du programme de 4AM, ou le cercle si l'élève y est
 * passé — et l'angle. La miniature dessine l'un ou l'autre, en SVG.
 *
 * @param {object} data
 * @returns {import('../../toolContract.js').MathLabSummary | null}
 */
export function summarizeTrigonometry(data) {
  const mode = data?.mode === 'circle' ? 'circle' : 'triangle';
  const angle = Number.isFinite(data?.angle) ? data.angle : null;
  if (angle == null) return null;
  const unit = data?.unit === 'rad' ? 'rad' : 'deg';

  const triangle = data?.triangle && typeof data.triangle === 'object' ? data.triangle : null;

  return {
    kind: 'triangle',
    text: [unit === 'deg' ? `${round(angle)}°` : `${round(angle)} rad`],
    detail: {
      mode,
      angle: round(angle),
      unit,
      // Les trois côtés du triangle : de quoi dessiner sa VRAIE forme.
      sides: triangle
        ? {
          opposite: num(triangle.opposite),
          adjacent: num(triangle.adjacent),
          hypotenuse: num(triangle.hypotenuse),
        }
        : null,
    },
  };
}

const num = (v) => (Number.isFinite(v) ? Math.round(v * 100) / 100 : null);
const round = (v) => Math.round(v * 100) / 100;
