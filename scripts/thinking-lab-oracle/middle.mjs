// Oracle du lot « middle » du « مختبر التفكير » — même forme que seed.mjs :
// ORACLE[id] = { answer, ceiling?, parts?[], tolerance? }, chaque champ (params, point) => valeur,
// recalculé par un chemin INDÉPENDANT de la relecture du contenu : recherche exhaustive,
// simulation pas à pas, géométrie analytique (lacet de Gauss), dichotomie… jamais la formule
// de la relecture.

/** Recherche exhaustive sur une grille : la seule valeur x de [from, to] (pas `step`) qui vérifie `ok`. */
function unique(from, to, step, ok) {
  const found = [];
  const n = Math.round((to - from) / step);
  for (let i = 0; i <= n; i++) {
    const x = Number((from + i * step).toFixed(9));
    if (ok(x)) found.push(x);
  }
  if (found.length !== 1) throw new Error(`oracle : ${found.length} solution(s) au lieu d'une`);
  return found[0];
}

const near = (a, b) => Math.abs(a - b) < 1e-9;

/**
 * Un flottant calculé (simulation, dichotomie) rendu EXACT pour un check integer/rational :
 * la fraction p/q (q ≤ 1000) qu'il approche à 1e-7 près, sinon une erreur.
 */
function exact(x) {
  for (let q = 1; q <= 1000; q++) {
    const p = Math.round(x * q);
    if (Math.abs(x * q - p) < 1e-7) return q === 1 ? p : `${p}/${q}`;
  }
  throw new Error(`oracle : ${x} n'est pas une fraction simple`);
}

/** Dichotomie : la racine de f (croissante) sur [lo, hi]. */
function bisect(f, lo, hi) {
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) < 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Aire d'un polygone par la formule du lacet (coordonnées). */
const shoelace = (pts) => Math.abs(pts.reduce((s, [x, y], i) => {
  const [u, v] = pts[(i + 1) % pts.length];
  return s + x * v - u * y;
}, 0)) / 2;

/** Hauteur du sommet d'une échelle de longueur L dont le pied est à `foot` du mur (dichotomie sur la distance). */
const ladderTop = (L, foot) => bisect((h) => Math.hypot(foot, h) - L, 0, L);

/** Vitesse moyenne d'un aller-retour : simulation pour plusieurs distances, toutes doivent donner la même. */
function roundTripAverage(a, b) {
  const values = [];
  for (let d = 1; d <= 50; d++) values.push((2 * d) / (d / a + d / b));
  if (!values.every((v) => near(v, values[0]))) throw new Error('oracle : moyenne dépendante de la distance');
  return values[0];
}

/** Remplissage simulé minute par minute en unités entières (capacité = a·b·60·k unités). */
function fillMinutes(rates) {
  // rates : [{hours, sign}] — chaque robinet remplit (+) ou vide (−) la cuve seul en `hours` heures.
  const cap = rates.reduce((p, r) => p * r.hours, 1) * 60;
  let level = 0;
  for (let minute = 1; minute < 100000; minute++) {
    for (const r of rates) level += (r.sign * cap) / (r.hours * 60);
    if (level >= cap - 1e-9) return minute;
  }
  throw new Error('oracle : la cuve ne se remplit pas');
}

/** Chevaliers et fripons : toutes les affectations cohérentes. */
function consistentWorlds(names, statements) {
  const worlds = [];
  for (let mask = 0; mask < 1 << names.length; mask++) {
    const w = Object.fromEntries(names.map((n, i) => [n, Boolean(mask & (1 << i))])); // true = صادق
    if (statements.every(([who, claim]) => w[who] === claim(w))) worlds.push(w);
  }
  return worlds;
}

export const ORACLE = {
  // #125 — moyenne de l'aller-retour pour 50 distances différentes.
  'round-trip-average-speed': {
    answer: ({ a, b }) => exact(roundTripAverage(a, b)),
    parts: [
      // vitesse de retour v (grille 0,1 km/h) donnant une moyenne de 15 avec un aller à 12.
      () => unique(0.1, 200, 0.1, (v) => near(roundTripAverage(12, v), 15)),
      // distance d (grille 1 km) : d/30 + d/60 = 3 h.
      () => unique(1, 500, 1, (d) => near(d / 30 + d / 60, 3)),
    ],
    // moyenne ≥ 50 avec un aller à 25 ? on essaie des retours jusqu'à 10⁶ km/h.
    ceiling: () => {
      for (let v = 1; v <= 1e6; v *= 1.5) if (roundTripAverage(25, v) >= 50) return v < 90 ? 'A' : 'B';
      return 'C';
    },
  },

  // #132 — distance sur une grille de 0,5 km : arrivée à 12 km/h + ½ h = arrivée à 8 km/h − ½ h.
  'grandfather-house-distance': {
    answer: () => unique(0.5, 200, 0.5, (d) => near(d / 12 + 0.5, d / 8 - 0.5)),
    ceiling: () => {
      const d = unique(0.5, 200, 0.5, (x) => near(x / 12 + 0.5, x / 8 - 0.5));
      const meal = d / 12 + 0.5; // l'heure du repas
      return exact(unique(0.1, 50, 0.1, (v) => near(d / v, meal)));
    },
  },

  // #138 — âges entiers essayés un par un.
  'mother-daughter-ages': {
    answer: ({ n }) => {
      const girl = unique(1, 150, 1, (x) => x > n && 2 * x - n === 3 * (x - n));
      return 2 * girl;
    },
    ceiling: ({ n }) => {
      const girl = unique(1, 150, 1, (x) => x > n && 2 * x - n === 3 * (x - n));
      return unique(0, 200, 1, (t) => 2 * (2 * girl + t) === 3 * (girl + t));
    },
  },

  // #150 — on essaie tous les nombres de lapins de 0 à h.
  'chickens-and-rabbits': {
    answer: ({ h, L }) => unique(0, h, 1, (r) => 4 * r + 2 * (h - r) === L),
    parts: [
      ({ h, L }) => unique(0, h, 1, (c) => 2 * c + 4 * (h - c) === L),
      () => unique(0, 30, 1, (sheep) => 4 * sheep + 2 * (30 - sheep) === 100),
    ],
  },

  // #158 — un prix de 1000 dinars simulé, puis l'écart relatif en pourcentage.
  'raise-then-discount': {
    answer: ({ p }) => {
      const start = 1000;
      const up = start + (start * p) / 100;
      const end = up - (up * p) / 100;
      return ((end - start) / start) * 100;
    },
    ceiling: () => unique(0.5, 99.5, 0.5, (q) => near(125 - (125 * q) / 100, 100)),
  },

  // #166 — énumération des 90 nombres de deux chiffres.
  'reversed-digits-sum': {
    answer: ({ s }) => {
      let count = 0;
      for (let x = 10; x <= 99; x++) {
        const rev = (x % 10) * 10 + Math.floor(x / 10);
        if (x % 10 !== 0 && x + rev === s) count++;
      }
      return count;
    },
    ceiling: () => {
      let count = 0;
      for (let x = 11; x <= 99; x++) {
        if (x % 10 === 0) continue;
        if (x - ((x % 10) * 10 + Math.floor(x / 10)) === 54) count++;
      }
      return count;
    },
  },

  // #175 — tous les triplets entiers x ≤ y ≤ z jusqu'à 20 kg dont les sommes deux à deux sont {10, 13, 15}.
  'three-bags-pairwise': (() => {
    const triples = [];
    for (let x = 0; x <= 20; x++) for (let y = x; y <= 20; y++) for (let z = y; z <= 20; z++) {
      const sums = [x + y, x + z, y + z].sort((p, q) => p - q);
      if (sums.join() === '10,13,15') triples.push([x, y, z]);
    }
    if (triples.length !== 1) throw new Error('oracle : sacs non uniques');
    const [[lightest, , heaviest]] = triples;
    // cinq sacs : combien de fois chaque sac entre dans les dix pesées (énumération des paires).
    let appearances = 0;
    for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) if (i === 0 || j === 0) appearances++;
    return {
      answer: () => heaviest,
      parts: [() => lightest, () => 96 / appearances],
    };
  })(),

  // #182 — aire du carré intérieur par le lacet de Gauss sur ses sommets.
  'tilted-inner-square': {
    answer: ({ s, d }) => shoelace([[d, 0], [s, d], [s - d, s], [0, s - d]]),
    // plus petite aire sur une grille fine de positions d.
    ceiling: ({ s }) => {
      let best = Infinity;
      for (let i = 0; i <= s * 100; i++) {
        const d = i / 100;
        best = Math.min(best, shoelace([[d, 0], [s, d], [s - d, s], [0, s - d]]));
      }
      return best;
    },
  },

  // #190 — les 8 affectations (أمين، بلال، سليم) ; Salim a-t-il le même type dans toutes ?
  'truth-tellers-and-liars': {
    answer: () => {
      const worlds = consistentWorlds(['amine', 'bilal', 'salim'], [
        ['amine', (w) => !w.bilal],
        ['bilal', (w) => w.amine === w.salim],
      ]);
      const types = new Set(worlds.map((w) => w.salim));
      if (types.size !== 1) return 'C';
      return types.has(true) ? 'A' : 'B';
    },
    ceiling: () => {
      const worlds = consistentWorlds(['omar', 'bilal'], [['omar', (w) => !w.omar && !w.bilal]]);
      const types = new Set(worlds.map((w) => w.bilal));
      if (types.size !== 1) return 'C';
      return types.has(true) ? 'A' : 'B';
    },
  },

  // #200 — hauteurs par dichotomie sur la longueur (Math.hypot), puis la différence.
  'sliding-ladder': {
    answer: () => exact(ladderTop(5, 3) - ladderTop(5, 4)),
    parts: [
      () => exact(ladderTop(25, 7) - ladderTop(25, 15)),
      () => unique(0.5, 18, 0.5, (m) => Math.abs(ladderTop(25, 7) - ladderTop(25, 7 + m) - 17) < 1e-6),
    ],
    ceiling: () => unique(0.25, 3.75, 0.25, (x) => Math.abs(ladderTop(5, x) - ladderTop(5, x + 1) - 1) < 1e-6),
  },

  // #210 — la somme faite terme par terme.
  'sum-of-odd-numbers': {
    answer: ({ n }) => {
      let sum = 0;
      for (let k = 1; k <= n; k += 2) sum += k;
      return sum;
    },
    ceiling: () => {
      let sum = 0;
      for (let k = 1; k < 1000; k += 2) {
        sum += k;
        if (sum === 1225) return k;
      }
      throw new Error('oracle : 1225 jamais atteint');
    },
  },

  // #220 — exponentiation modulaire, 2026 multiplications modulo 10.
  'last-digit-of-power': {
    answer: () => {
      let d = 1;
      for (let i = 0; i < 2026; i++) d = (d * 7) % 10;
      return d;
    },
    ceiling: () => {
      let d3 = 1;
      let d7 = 1;
      for (let i = 0; i < 2026; i++) {
        d3 = (d3 * 3) % 10;
        d7 = (d7 * 7) % 10;
      }
      return (d3 + d7) % 10;
    },
  },

  // #232 — la cuve simulée minute par minute.
  'two-taps': {
    answer: ({ a, b }) => exact(fillMinutes([{ hours: a, sign: 1 }, { hours: b, sign: 1 }]) / 60),
    ceiling: () => exact(fillMinutes([{ hours: 6, sign: 1 }, { hours: 3, sign: 1 }, { hours: 4, sign: -1 }]) / 60),
  },

  // #250 — géométrie analytique : le rayon solaire est la droite par le haut du bâton et le bout
  // de son ombre ; on le translate au pied de l'arbre et on lit la hauteur à l'extrémité de l'ombre.
  'tree-shadow': (() => {
    // bâton en x = 0 de hauteur 1,5, ombre jusqu'en x = 2 : direction du rayon (2, −1,5).
    const ray = [2, -1.5];
    const heightFor = (shadow) => (-ray[1] / ray[0]) * shadow; // le rayon qui touche le sol à `shadow` du pied
    const shadowFor = (height) => bisect((s) => heightFor(s) - height, 0, 100);
    return {
      answer: ({ T }) => exact(heightFor(T)),
      parts: [
        () => shadowFor(1.6),
        // nouveau rayon : bâton 1,5 → ombre 3 ; ombre de l'arbre dont la hauteur ne change pas.
        ({ T }) => exact(bisect((s) => (1.5 / 3) * s - heightFor(T), 0, 200)),
      ],
      // lampe ponctuelle : on cherche l'ombre s (grille 0,25 m) telle que la tête de l'enfant soit
      // sur le segment lampe (0 ; 4,5) → bout de l'ombre (6 + s ; 0).
      ceiling: () => unique(0.25, 30, 0.25, (s) => near(4.5 * (1 - 6 / (6 + s)), 1.5)),
    };
  })(),
};
