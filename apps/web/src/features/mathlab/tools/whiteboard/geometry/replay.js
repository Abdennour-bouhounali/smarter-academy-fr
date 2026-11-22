/**
 * « Rejouer la construction » — la construction rejouée pas à pas, pure.
 *
 * Une étape par objet construit, dans l'ordre `seq`, chacune avec sa durée :
 * l'instrument apparaît à la pose qu'il avait, le trait se dessine, le compas
 * tourne. Le rejeu ne touche JAMAIS au dessin : il se joue sur une scène à
 * part, par-dessus le tableau (GeometryDesk), puis s'efface.
 */
import { UNITS_PER_CM, angleOf, dist, sub } from './geoMath.js';
import { RULER_LENGTHS_CM } from './instruments.js';

const STEP_MS = Object.freeze({
  point: 500, segment: 1300, line: 1300, ray: 1300, arc: 1700, circle: 2000, measure: 350,
});

/** Les étapes → une ligne du temps { items: [{ step, t0, t1 }], total } (millisecondes). */
export function buildTimeline(steps, { speed = 1 } = {}) {
  const items = [];
  let t = 0;
  for (const step of steps) {
    const d = (STEP_MS[step.kind] ?? 600) / speed;
    items.push({ step, t0: t, t1: t + d });
    t += d;
  }

  return { items, total: t };
}

/**
 * L'état du rejeu à l'instant t : les étapes finies, et celle en cours avec
 * son avancement (0 → 1). Au-delà de la fin, tout est fini.
 */
export function frameAt(timeline, t) {
  const done = [];
  let current = null;
  for (const item of timeline.items) {
    if (t >= item.t1) done.push(item.step);
    else if (t >= item.t0) {
      current = { step: item.step, progress: (t - item.t0) / (item.t1 - item.t0) };
      break;
    } else break;
  }

  return { done, current, finished: t >= timeline.total };
}

/**
 * Découpe l'avancement d'une étape tracée à l'instrument : l'instrument se
 * pose (0 → `settle`), puis le crayon trace (→ 1).
 */
export function drawPhase(progress, settle = 0.3) {
  if (progress <= settle) return { settling: progress / settle, drawn: 0 };

  return { settling: 1, drawn: Math.min(1, (progress - settle) / (1 - settle)) };
}

/**
 * La pose de la règle qui a tracé un trait : celle enregistrée si le trait
 * a été fait le long de la règle, sinon une règle posée zéro sur le premier
 * point, le long du trait — le geste qu'un enseignant ferait.
 */
export function rulerPoseFor(step) {
  const pose = step.via?.tool === 'ruler' && step.via.pose ? step.via.pose : null;
  if (pose) return { ...pose, visible: true };
  const l = dist(step.p0, step.p1) / UNITS_PER_CM;
  const lengthCm = RULER_LENGTHS_CM.find((c) => c >= l + 1) ?? RULER_LENGTHS_CM[RULER_LENGTHS_CM.length - 1];

  return { visible: true, x: step.p0.x, y: step.p0.y, angle: angleOf(sub(step.p1, step.p0)), lengthCm };
}
