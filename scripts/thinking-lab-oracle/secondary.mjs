// Oracle du lot « secondary » du « مختبر التفكير » — même forme que seed.mjs :
// ORACLE[id] = { answer, ceiling?, parts?[], tolerance? }, chaque champ (params, point) => valeur,
// recalculé par un chemin INDÉPENDANT de la relecture du contenu.
//
// Les chemins choisis ici n'utilisent jamais la formule de la relecture :
//   — entiers exacts en BigInt (2027² − 2026², 100!, 1000!, 2026!) ;
//   — énumération exhaustive (tirages ordonnés, mains serrées, chemins par programmation dynamique) ;
//   — intégration numérique de la région (lentille), comme #318 ;
//   — récurrences itérées puis polynôme/exponentielle AJUSTÉS sur les premières valeurs (expressions en n) ;
//   — valeur numérique de la limite à grand x, extrapolée (Richardson) ;
//   — test numérique ligne à ligne des « preuves » fausses.

/* ------------------------------------------------------------------ outils */

/** Simpson composite sur [a, b] (n pair). */
function simpson(f, a, b, n = 400000) {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

/** Longueur, à la hauteur y, de l'intersection des disques (cx, cy, r). */
function chordOfDisks(disks, y) {
  let lo = -Infinity;
  let hi = Infinity;
  for (const [cx, cy, r] of disks) {
    const dy = y - cy;
    if (Math.abs(dy) > r) return 0;
    const half = Math.sqrt(r * r - dy * dy);
    lo = Math.max(lo, cx - half);
    hi = Math.min(hi, cx + half);
  }
  return Math.max(0, hi - lo);
}

/** Le rationnel p/q (q ≤ maxDen) le plus proche de x, exigé à `tol` près ; rendu « p/q ». */
function toFraction(x, { maxDen = 5000, tol = 1e-9 } = {}) {
  for (let q = 1; q <= maxDen; q++) {
    const p = Math.round(x * q);
    if (Math.abs(x - p / q) < tol) return q === 1 ? String(p) : `${p}/${q}`;
  }
  throw new Error(`oracle : ${x} n'est pas un rationnel simple`);
}

const factorial = (n) => {
  let f = 1n;
  for (let i = 2n; i <= BigInt(n); i++) f *= i;
  return f;
};
/** Zéros finals comptés sur l'écriture décimale de l'entier exact. */
const trailingZeros = (big) => big.toString().length - big.toString().replace(/0+$/, '').length;

/** Polynôme de Lagrange passant par les points (xs[i], ys[i]), évalué en t. */
function lagrange(xs, ys, t) {
  let s = 0;
  for (let i = 0; i < xs.length; i++) {
    let w = ys[i];
    for (let j = 0; j < xs.length; j++) if (j !== i) w *= (t - xs[j]) / (xs[i] - xs[j]);
    s += w;
  }
  return s;
}

/** Ajuste S(n) = A·qⁿ + B sur S(0), S(1), vérifie S(2..5), et l'évalue en t (réel). */
function fitGeometric(q, sums, t) {
  const A = (sums[1] - sums[0]) / (q - 1);
  const B = sums[0] - A;
  sums.forEach((s, n) => {
    if (Math.abs(A * q ** n + B - s) > 1e-9) throw new Error('oracle : la forme A·qⁿ + B ne colle pas');
  });
  return A * q ** t + B;
}
const partialSums = (q, count) => {
  const out = [];
  let s = 0;
  for (let n = 0; n < count; n++) {
    s += q ** n;
    out.push(s);
  }
  return out;
};

/* --------------------------------------------------------- #265 x + 1/x */
const rootOf = (k) => (k + Math.sqrt(k * k - 4)) / 2; // une racine de x² − kx + 1 = 0, calculée numériquement

/* -------------------------------------------------- #300 suite récurrente */
function fByRecurrence(n) {
  let f = 0;
  if (n >= 0) for (let i = 0; i < n; i++) f = f + 2 * i + 1;
  else for (let i = -1; i >= n; i--) f = f - 2 * i - 1; // f(i) = f(i + 1) − 2i − 1
  return f;
}

/* ------------------------------------------------------- #310 tirages */
function drawProbability(r, b, accept) {
  const balls = [...Array(r).fill('R'), ...Array(b).fill('B')];
  let total = 0;
  let good = 0;
  for (let i = 0; i < balls.length; i++) {
    for (let j = 0; j < balls.length; j++) {
      if (i === j) continue; // sans remise
      total++;
      if (accept(balls[i], balls[j])) good++;
    }
  }
  return `${good}/${total}`; // fraction exacte (cas favorables / cas possibles)
}

/* --------------------------------------------- #325 cercle inscrit (Héron) */
function inradius(a, b, c) {
  const s = (a + b + c) / 2;
  return Math.sqrt(s * (s - a) * (s - b) * (s - c)) / s;
}
// Vérification au chargement : pour des triangles rectangles, le rayon de Héron égale la tangente issue
// du sommet droit, s − c. C'est ce que l'oracle de la partie générale (a, b, c libres) évalue.
for (const [a, b] of [[3, 4], [5, 12], [2, 7], [1.5, 9.25]]) {
  const c = Math.hypot(a, b);
  if (Math.abs(inradius(a, b, c) - ((a + b + c) / 2 - c)) > 1e-12) throw new Error('oracle #325 : tangente ≠ rayon');
}
/** Plafond : hypoténuse 10, rayon 2 → on cherche la cathète a par dichotomie, puis l'aire. */
function rightTriangleAreaFromInradius(c, r) {
  let lo = 1e-9;
  let hi = c / Math.SQRT2; // r croît de 0 à son maximum (isocèle) sur cet intervalle
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (inradius(mid, Math.sqrt(c * c - mid * mid), c) < r) lo = mid;
    else hi = mid;
  }
  const a = (lo + hi) / 2;
  return (a * Math.sqrt(c * c - a * a)) / 2;
}

/* -------------------------------------------------------- #333 lentille */
// Deux disques de rayon 1 dont les centres sont à distance d, intégrés en tranches horizontales.
const lensUnit = (d) => simpson((y) => chordOfDisks([[0, 0, 1], [d, 0, 1]], y), -1, 1);
const LENS_UNIT = lensUnit(1);
const LENS_SQRT2_UNIT = lensUnit(Math.SQRT2);

/* --------------------------------------------------------- #340 chemins */
function latticePaths(n, blocked = null) {
  const ways = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= n; j++) {
      if (blocked && blocked[0] === i && blocked[1] === j) ways[i][j] = 0;
      else if (i === 0 && j === 0) ways[i][j] = 1;
      else ways[i][j] = (i > 0 ? ways[i - 1][j] : 0) + (j > 0 ? ways[i][j - 1] : 0);
    }
  }
  return ways[n][n];
}

/* ------------------------------------------------------ #350 poignées */
/** Simule les poignées de main : chaque paire {i, j} (i < j) admise par `shakes` compte une fois. */
function countShakes(n, shakes = () => true) {
  let count = 0;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (shakes(i, j, n)) count++;
  return count;
}
function peopleFor(h, shakes) {
  for (let n = 1; n < 1000; n++) if (countShakes(n, shakes) === h) return n;
  throw new Error(`oracle #350 : aucun n pour ${h}`);
}
const notNeighbours = (i, j, n) => j - i !== 1 && !(i === 0 && j === n - 1);

/* ---------------------------------------------------------- #392 limite */
/** Limite en +∞ de g, par extrapolation de Richardson (g(x) = L + c/x + O(1/x²)). */
function limitAtInfinity(g) {
  // x = 10⁴ : assez grand pour que le reste en 1/x² soit < 1e-7, assez petit pour que
  // l'annulation √(x² + …) − x garde ~12 chiffres significatifs.
  const x = 1e4;
  return 2 * g(2 * x) - g(x);
}

/* --------------------------------------------- #384 preuves fausses */
/** Chaque ligne est une égalité [gauche, droite] ; la première ligne fausse désigne la transition fautive. */
function firstBrokenTransition(lines, transitions) {
  const holds = lines.map(([l, r]) => Math.abs(l - r) < 1e-12);
  for (let i = 1; i < holds.length; i++) if (holds[i - 1] && !holds[i]) return transitions[`${i}-${i + 1}`];
  throw new Error('oracle #384 : aucune transition fautive');
}
const flawProof = (a, b) => [
  [a, b], //                          (1) a = b
  [a * a, a * b], //                  (2)
  [a * a - b * b, a * b - b * b], //  (3)
  [(a - b) * (a + b), b * (a - b)], // (4)
  [a + b, b], //                      (5)
  [2 * b, b], //                      (6)
  [2, 1], //                          (7)
];
const sqrtProof = (x) => [
  [x, -3], //                  (1)
  [x * x, 9], //               (2)
  [Math.sqrt(x * x), 3], //    (3)
  [x, 3], //                   (4)
  [-3, 3], //                  (5)
];

/* ================================================================= ORACLE */
export const ORACLE = {
  // #265 — x calculé numériquement, puis x² + 1/x² et x³ + 1/x³ évalués directement.
  'reciprocal-square': {
    answer: ({ k }) => {
      const x = rootOf(k);
      return toFraction(x * x + 1 / (x * x), { tol: 1e-7 }); // calculé en flottant, reconnu comme entier exact
    },
    ceiling: ({ k }) => {
      const x = rootOf(k);
      return toFraction(x ** 3 + 1 / x ** 3, { tol: 1e-6 });
    },
  },

  // #275 — entiers exacts.
  'difference-of-squares': {
    answer: () => String(2027n * 2027n - 2026n * 2026n),
    parts: [
      () => {
        let s = 0n;
        for (let i = 1n; i <= 100n; i++) s += (i % 2n ? 1n : -1n) * i * i;
        return String(s);
      },
      // somme alternée calculée pour n = 1, 2, 3, puis le polynôme de degré 2 qui passe par ces valeurs
      (_p, { n }) => {
        const alt = (m) => {
          let s = 0;
          for (let i = 1; i <= 2 * m; i++) s += (i % 2 ? 1 : -1) * i * i;
          return s;
        };
        return lagrange([1, 2, 3], [alt(1), alt(2), alt(3)], n);
      },
    ],
    ceiling: () => {
      const target = 2026n * 2028n + 1n;
      let r = 0n;
      while (r * r < target) r++;
      if (r * r !== target) throw new Error('oracle #275 : pas un carré');
      return String(r);
    },
  },

  // #300 — récurrence itérée ; l'expression est le polynôme de degré 2 ajusté sur f(0), f(1), f(2).
  'mystery-function': {
    answer: ({ m }) => fByRecurrence(m),
    parts: [
      (_p, { n }) => lagrange([0, 1, 2], [fByRecurrence(0), fByRecurrence(1), fByRecurrence(2)], n),
      () => fByRecurrence(-3),
    ],
    ceiling: () => {
      let g = 0;
      for (let n = 0; n < 10; n++) g += 3 * n * n + 3 * n + 1;
      return g;
    },
  },

  // #310 — énumération de tous les tirages ordonnés sans remise.
  'balls-in-bag': {
    answer: ({ r, b }) => drawProbability(r, b, (x, y) => x === 'R' && y === 'R'),
    ceiling: ({ r, b }) => drawProbability(r, b, (x, y) => x !== y),
  },

  // #325 — Héron (aire / demi-périmètre), jamais les tangentes de la relecture.
  'incircle-right-triangle': {
    answer: () => Math.round(inradius(3, 4, 5) * 1e9) / 1e9,
    parts: [
      (_p, { a, b, c }) => (a + b + c) / 2 - c, // tangente issue du sommet de l'angle droit (vérifiée au chargement)
      () => Math.round(inradius(5, 12, 13) * 1e9) / 1e9,
    ],
    ceiling: () => Math.round(rightTriangleAreaFromInradius(10, 2) * 1e6) / 1e6,
  },

  // #333 — la lentille intégrée en tranches (unité r = 1), mise à l'échelle en r².
  'lens-area': {
    answer: (_p, { r }) => LENS_UNIT * r * r,
    ceiling: (_p, { r }) => LENS_SQRT2_UNIT * r * r,
    tolerance: 1e-7,
  },

  // #340 — programmation dynamique sur les nœuds de la grille.
  'grid-paths': {
    answer: () => latticePaths(4),
    ceiling: () => latticePaths(4, [2, 2]),
  },

  // #350 — on simule les poignées pour n = 1, 2, … jusqu'à retrouver le compte.
  'handshakes-count': {
    answer: ({ h }) => peopleFor(h),
    parts: [
      // cartes : chaque couple ORDONNÉ (i ≠ j) donne une carte
      ({ h }) => {
        const n = peopleFor(h);
        let cards = 0;
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j) cards++;
        return cards;
      },
      ({ h }) => countShakes(peopleFor(h) + 1),
    ],
    ceiling: () => peopleFor(54, notNeighbours),
  },

  // #358 — valeurs numériques des cosinus/sinus, reconnues comme rationnel simple.
  'trig-product': {
    answer: () => {
      const d = Math.PI / 180;
      return toFraction(Math.sin(15 * d) * Math.cos(15 * d));
    },
    ceiling: () => {
      const d = Math.PI / 180;
      return toFraction(Math.cos(20 * d) * Math.cos(40 * d) * Math.cos(80 * d));
    },
  },

  // #375 — somme itérée ; les expressions sont A·qⁿ + B ajustées sur les sommes partielles calculées.
  'powers-of-two': {
    answer: ({ p }) => {
      let s = 0;
      for (let t = 1; t <= p; t *= 2) s += t;
      return s;
    },
    parts: [
      (_p, { n }) => fitGeometric(2, partialSums(2, 6), n),
      (_p, { n }) => fitGeometric(3, partialSums(3, 6), n),
    ],
    ceiling: () => {
      // somme exacte en fractions de dénominateur 1024
      let num = 0n;
      for (let t = 1n; t <= 1024n; t *= 2n) num += 1024n / t;
      return `${num}/1024`;
    },
  },

  // #384 — chaque ligne testée numériquement avec des valeurs qui vérifient l'hypothèse.
  'find-the-flaw': {
    answer: () => firstBrokenTransition(flawProof(1, 1), { '1-2': 'A', '3-4': 'B', '4-5': 'C', '6-7': 'D' }),
    ceiling: () => firstBrokenTransition(sqrtProof(-3), { '1-2': 'A', '2-3': 'B', '3-4': 'C', '4-5': 'D' }),
  },

  // #392 — valeur numérique à grand x, extrapolée.
  'hidden-limit': {
    answer: ({ k }) => toFraction(limitAtInfinity((x) => Math.sqrt(x * x + k * x) - x), { maxDen: 20, tol: 1e-6 }),
    ceiling: () => toFraction(limitAtInfinity((x) => x * (Math.sqrt(x * x + 1) - x)), { maxDen: 20, tol: 1e-6 }),
  },

  // #400 — factorielles exactes en BigInt, zéros comptés sur l'écriture décimale.
  'factorial-zeros': {
    answer: () => trailingZeros(factorial(100)),
    parts: [
      () => trailingZeros(factorial(1000)),
      () => {
        for (let n = 1; ; n++) if (trailingZeros(factorial(n)) >= 5) return n;
      },
    ],
    ceiling: () => trailingZeros(factorial(2026)),
  },
};
