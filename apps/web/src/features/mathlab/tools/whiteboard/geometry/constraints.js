/**
 * LES CONTRAINTES — un instrument posé sur le tableau CONDUIT le crayon.
 *
 * L'enseignant garde son crayon ordinaire (le stylo d'Excalidraw, ou le crayon
 * de géométrie) ; c'est l'INSTRUMENT qui décide de la géométrie du trait, comme
 * une vraie règle guide une vraie mine. Ce module est la seule réponse à
 * « où va la mine ? » pour tous les instruments :
 *
 *     position brute du pointeur
 *            ↓
 *     contrainte active ?  (la plus proche du pointeur, à portée)
 *            ↓ oui
 *     constrain(p)  → position contrainte (+ mesure)
 *            ↓
 *     build(start, end) → l'objet géométrique (segment, arc, demi-droite)
 *
 * Quatre familles, une seule interface :
 *
 *   straight  le bord d'une règle, d'une équerre, le diamètre du rapporteur :
 *             projection sur l'AXE du bord, abscisse lue sur ses graduations
 *   ray       le rapporteur en « Construire un angle » : depuis le sommet, dans la
 *             direction de l'aiguille, et nulle part ailleurs
 *   arc       le compas : la mine tourne autour de la pointe, à rayon fixe ;
 *             le rapporteur en « Tracer un arc » : la mine suit son bord COURBE
 *             (projection POLAIRE — jamais sur une droite) : le pointeur
 *             donne l'ANGLE, l'instrument donne le RAYON
 *
 *   {
 *     id, instrument, family,
 *     distance(p)            à quelle distance (unités de scène) la mine peut s'y accrocher
 *     attach(p, opts)        → { point, s? }                l'accroche
 *     constrain(p, state, opts) → { point, s?, away }       le trait en cours ; away = on s'est éloigné
 *     measure(state)         → { length?, angle?, sweep? }  ce qui s'affiche pendant le tracé
 *   }
 *
 * Tout est pur, en coordonnées de scène, dans l'unité du bureau
 * (geoMath.UNITS_PER_CM) — la règle, le compas et le rapporteur lisent la même.
 */
import {
  UNITS_PER_CM, UNITS_PER_MM, add, sub, scale, dot, dist, len, angleOf, normalizeAngle,
} from './geoMath.js';
import {
  INSTRUMENT_KINDS, rulerGeometry, setSquareGeometry, protractorGeometry, compassGeometry, RULER_MARGIN, RULER_WIDTH, PROTRACTOR_INNER,
} from './instruments.js';

/** À quelle distance (px d'écran) la mine s'accroche à un bord, une pointe, un sommet. */
export const ATTACH_PX = 16;
/** À quelle distance (px d'écran) du bord la mine le QUITTE en cours de tracé. */
export const DETACH_PX = 90;
/** Autour d'une graduation du cm, la mine s'arrête (px d'écran). */
const CM_SNAP_PX = 7;

/**
 * L'abscisse `s` (unités, depuis le zéro) calée sur les graduations : le
 * millimètre toujours — c'est la graduation la plus fine de la règle — et le
 * centimètre entier quand on en passe tout près. 5,0 est plus facile à
 * atteindre que 4,97 ; 4,7 reste atteignable.
 */
export function snapToGraduation(s, cmTolerance) {
  const cm = Math.round(s / UNITS_PER_CM) * UNITS_PER_CM;
  if (Math.abs(s - cm) <= cmTolerance) return cm;

  return Math.round(s / UNITS_PER_MM) * UNITS_PER_MM;
}

/**
 * Un bord droit : origine (le zéro de ses graduations), direction u, étendue
 * [from, to] le long de u. `graduated` : ses graduations comptent.
 */
function straightConstraint({ id, instrument, origin, u, from, to, graduated = false }) {
  const along = (p) => dot(sub(p, origin), u);
  const at = (s) => add(origin, scale(u, s));
  const off = (p) => Math.abs(dot(sub(p, origin), { x: -u.y, y: u.x }));
  const place = (p, opts) => {
    let s = along(p);
    if (graduated && opts?.graduations) s = snapToGraduation(s, opts.cmTolerance ?? 0);

    return s;
  };

  return {
    id, instrument, family: 'straight', origin, u, graduated, from, to,
    distance: (p) => {
      const s = along(p);
      if (s < from - 1 || s > to + 1) return Infinity;

      return off(p);
    },
    attach: (p, opts) => {
      const s = place(p, opts);

      return { point: at(s), s };
    },
    constrain: (p, state, opts) => {
      const s = place(p, opts);

      return { point: at(s), s, away: off(p) > (opts?.detachDistance ?? Infinity) };
    },
    measure: (state) => ({ length: Math.abs((state.s ?? 0) - (state.s0 ?? 0)) }),
  };
}

/** Le rapporteur en construction : une demi-droite depuis son centre, dans la direction de l'aiguille. */
function rayConstraint({ id, instrument, origin, u, degrees, reach = 0 }) {
  const along = (p) => Math.max(0, dot(sub(p, origin), u));

  return {
    id, instrument, family: 'ray', origin, u, degrees, reach,
    // On s'accroche au SOMMET — le geste « je pars du sommet » — ou le long de l'aiguille.
    distance: (p) => {
      const t = dot(sub(p, origin), u);
      if (t < -1 || t > reach) return dist(p, origin);

      return Math.min(dist(p, origin), Math.abs(dot(sub(p, origin), { x: -u.y, y: u.x })));
    },
    attach: () => ({ point: { ...origin }, s: 0 }),
    constrain: (p, state, opts) => {
      let s = along(p);
      if (opts?.graduations) s = snapToGraduation(s, opts.cmTolerance ?? 0);

      return { point: add(origin, scale(u, s)), s, away: false };
    },
    measure: (state) => ({ length: state.s ?? 0, angle: degrees }),
  };
}

/**
 * Le compas : la mine s'accroche à la POINTE porte-mine ; ensuite elle ne
 * peut qu'aller autour du centre, au rayon réglé. `sweep` cumule le tour
 * (au-delà de ±π, sans saut), plafonné à un tour complet.
 */
function arcConstraint({ id, instrument, center, radius, angle }) {
  const tip = add(center, scale({ x: Math.cos(angle), y: Math.sin(angle) }, radius));

  return {
    id, instrument, family: 'arc', center, radius, startAngle: angle,
    distance: (p) => dist(p, tip),
    attach: () => ({ point: tip, angle, sweep: 0, startAngle: angle }),
    constrain: (p, state) => {
      const a = angleOf(sub(p, center));
      const last = state.angle ?? angle;
      let sweep = (state.sweep ?? 0) + normalizeAngle(a - last);
      sweep = Math.max(-2 * Math.PI, Math.min(2 * Math.PI, sweep));
      const now = angle + sweep;

      return { point: add(center, scale({ x: Math.cos(now), y: Math.sin(now) }, radius)), angle: a, sweep, away: false };
    },
    measure: (state) => ({ radius, degrees: Math.abs((state.sweep ?? 0) * 180 / Math.PI) }),
  };
}

/** Les angles « ronds » d'un rapporteur scolaire : l'aimant s'y arrête. */
const ROUND_DEGREES = Object.freeze([0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180]);

/**
 * Le degré lu calé : sur un angle rond (0°, 15°, 30°… 180°) quand on en
 * passe à `tolerance` degrés, sinon au degré — le rapporteur se lit au degré.
 */
function snapDegree(deg, { angles = true, tolerance = 2.5 } = {}) {
  if (angles) {
    for (const r of ROUND_DEGREES) if (Math.abs(deg - r) <= tolerance) return r;
  }

  return Math.round(deg);
}

/**
 * Le rapporteur en « Tracer un arc » : un bord COURBE de rayon `radius` (le bord
 * extérieur, ou le bord de l'évidement intérieur — un petit arc d'angle).
 *
 * Tout se passe dans l'échelle du rapporteur : `deg` ∈ [0, 180] est la
 * graduation qu'on lit. L'appui fixe l'angle de DÉPART (il ne bouge plus) ;
 * la mine fixe l'angle d'ARRIVÉE. L'arc ne sort jamais du demi-disque : le
 * rapporteur n'est pas un compas, il ne trace pas de cercle entier.
 *
 * Écran : la graduation d monte du côté du demi-disque, donc l'angle
 * d'écran est `baseAngle − d` (y vers le bas).
 */
function protractorArcConstraint({ id, instrument, center, radius, baseAngle, reach }) {
  const u = { x: Math.cos(baseAngle), y: Math.sin(baseAngle) };
  const n = { x: u.y, y: -u.x };
  const degreeOf = (p) => {
    const d = sub(p, center);
    const x = dot(d, u);
    const y = dot(d, n);
    if (Math.hypot(x, y) < 1e-9) return 0;
    // Sous le diamètre, la mine reste en butée sur 0° ou 180°.
    if (y < 0) return x >= 0 ? 0 : 180;

    return (Math.atan2(y, x) * 180) / Math.PI;
  };
  const pointAt = (deg) => {
    const a = baseAngle - (deg * Math.PI) / 180;

    return add(center, scale({ x: Math.cos(a), y: Math.sin(a) }, radius));
  };
  const onSide = (p) => dot(sub(p, center), n) >= -reach;

  return {
    id, instrument, family: 'arc', center, radius, baseAngle,
    distance: (p) => (onSide(p) ? Math.abs(dist(p, center) - radius) : Infinity),
    attach: (p, opts) => {
      const d0 = snapDegree(degreeOf(p), opts);

      return { point: pointAt(d0), d0, deg: d0, startAngle: baseAngle - (d0 * Math.PI) / 180, sweep: 0 };
    },
    constrain: (p, state, opts) => {
      const deg = snapDegree(degreeOf(p), opts);

      return { point: pointAt(deg), deg, sweep: -((deg - state.d0) * Math.PI) / 180, away: false };
    },
    measure: (state) => ({ radius, degrees: Math.abs((state.deg ?? 0) - (state.d0 ?? 0)), from: state.d0, to: state.deg }),
  };
}

/**
 * Toutes les contraintes qu'offrent les instruments POSÉS. Le rapporteur offre
 * son diamètre en mode « Mesurer », et la demi-droite de l'aiguille en mode
 * « Construire un angle » — jamais les deux : les deux gestes ne se mélangent pas.
 */
export function constraintsFor(instruments) {
  const out = [];
  for (const kind of INSTRUMENT_KINDS) {
    const inst = instruments?.[kind];
    if (!inst?.visible) continue;
    if (kind === 'ruler') {
      const g = rulerGeometry(inst);
      const range = { from: -RULER_MARGIN, to: g.L + RULER_MARGIN };
      out.push(straightConstraint({ id: 'ruler:graduated', instrument: 'ruler', origin: g.o, u: g.u, ...range, graduated: true }));
      out.push(straightConstraint({ id: 'ruler:back', instrument: 'ruler', origin: add(g.o, scale(g.n, RULER_WIDTH)), u: g.u, ...range }));
    } else if (kind === 'setSquare') {
      const g = setSquareGeometry(inst);
      out.push(straightConstraint({ id: 'setSquare:a', instrument: 'setSquare', origin: g.v, u: g.u, from: 0, to: g.a, graduated: true }));
      out.push(straightConstraint({ id: 'setSquare:b', instrument: 'setSquare', origin: g.v, u: g.n, from: 0, to: g.b }));
      const hyp = sub(g.B, g.A);
      const hl = len(hyp);
      out.push(straightConstraint({ id: 'setSquare:hyp', instrument: 'setSquare', origin: g.A, u: scale(hyp, 1 / hl), from: 0, to: hl }));
    } else if (kind === 'protractor') {
      const g = protractorGeometry(inst);
      if (inst.mode === 'construct') {
        out.push(rayConstraint({ id: 'protractor:ray', instrument: 'protractor', origin: g.center, u: g.directionOf(inst.needleDeg), degrees: inst.needleDeg, reach: g.R * 1.05 }));
      } else if (inst.mode === 'arc') {
        // Deux bords courbes, comme un vrai rapporteur : l'extérieur, et l'évidement (un petit arc d'angle).
        const reach = 0.3 * UNITS_PER_CM;
        out.push(protractorArcConstraint({ id: 'protractor:rim', instrument: 'protractor', center: g.center, radius: g.R, baseAngle: inst.angle, reach }));
        out.push(protractorArcConstraint({ id: 'protractor:inner', instrument: 'protractor', center: g.center, radius: g.R * PROTRACTOR_INNER, baseAngle: inst.angle, reach }));
      } else {
        const e = g.R + 0.3 * UNITS_PER_CM;
        out.push(straightConstraint({ id: 'protractor:base', instrument: 'protractor', origin: g.center, u: g.u, from: -e, to: e }));
      }
    } else if (kind === 'compass') {
      const g = compassGeometry(inst);
      out.push(arcConstraint({ id: 'compass:arc', instrument: 'compass', center: g.pivot, radius: inst.radius, angle: inst.angle }));
    }
  }

  return out;
}

/**
 * LA RÈGLE DE PRIORITÉ quand plusieurs instruments sont à portée : la
 * contrainte la PLUS PROCHE de la mine gagne ; à égalité (moins d'un pixel),
 * celle de l'instrument touché en dernier (`focus`). L'enseignant voit
 * toujours laquelle tient le crayon : elle s'allume, et la barre la nomme.
 *
 * @returns {object | null}
 */
export function pickConstraint(p, constraints, tolerance, focus = null) {
  let best = null;
  let bestD = Infinity;
  for (const c of constraints) {
    const d = c.distance(p);
    if (d > tolerance) continue;
    const better = d < bestD - 1 || (Math.abs(d - bestD) <= 1 && c.instrument === focus && best?.instrument !== focus);
    if (!best || better) {
      best = c;
      bestD = d;
    }
  }

  return best;
}

/** Tolérance de calage sur le cm, en unités de scène, pour un zoom donné. */
export const cmTolerance = (zoom) => Math.min(0.2 * UNITS_PER_CM, CM_SNAP_PX / zoom);

