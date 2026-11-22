// Oracle du lot « primary » du « مختبر التفكير » — même forme que seed.mjs :
// ORACLE[id] = { answer, ceiling?, parts?[], tolerance? }, chaque champ (params, point) => valeur,
// recalculé par un chemin INDÉPENDANT de la relecture du contenu : on SIMULE (jour par jour,
// année par année), on ÉNUMÈRE (paires, combinaisons de pièces, suites de chaussettes) ou on
// EXPLORE (parcours en largeur des états de la traversée), jamais la formule de la relecture.

/** Années jusqu'à ce que la somme des âges atteigne exactement `target` (simulation). */
function yearsUntilSum(ages, target) {
  for (let k = 0; k <= 500; k++) {
    const sum = ages.reduce((s, a) => s + a + k, 0);
    if (sum === target) return k;
    if (sum > target) break;
  }
  throw new Error(`somme ${target} jamais atteinte exactement`);
}

/** Années jusqu'à ce que l'aîné ait le double du cadet. */
function yearsUntilDouble(older, younger) {
  for (let k = 0; k <= 500; k++) if (older + k === 2 * (younger + k)) return k;
  throw new Error('jamais le double');
}

/** Nombre de paires {i, j}, i ≠ j, comptées une par une. */
function countPairs(n) {
  let c = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i < j) c++;
  return c;
}

/** Le colimaçon simulé : le numéro du jour où il atteint le bord. */
function snailDay(depth, up, down) {
  let h = 0;
  for (let day = 1; day <= 10000; day++) {
    h += up;
    if (h >= depth) return day;
    h -= down;
  }
  throw new Error('ne sort jamais');
}

const sumRange = (from, to, step = 1) => {
  let s = 0;
  for (let k = from; k <= to; k += step) s += k;
  return s;
};

/** Poteaux d'une ligne ouverte : positions 0, gap, 2·gap… ≤ length. */
function postsOnLine(length, gap) {
  let c = 0;
  for (let x = 0; x <= length + 1e-9; x += gap) c++;
  return c;
}
/** Poteaux d'une boucle fermée : positions distinctes modulo le périmètre. */
function postsOnLoop(perimeter, gap) {
  const seen = new Set();
  for (let k = 0; k <= 2 * perimeter; k++) seen.add(((k * gap) % perimeter + perimeter) % perimeter);
  return seen.size;
}

/** Parcours en largeur des états (berger, loup, mouton, trèfle) ∈ {0, 1}⁴. */
function riverCrossingBfs() {
  const unsafe = ([f, w, s, c]) => (w === s && f !== s) || (s === c && f !== s);
  const key = (st) => st.join('');
  const start = [0, 0, 0, 0];
  const goal = '1111';
  const dist = new Map([[key(start), 0]]);
  const queue = [start];
  while (queue.length) {
    const st = queue.shift();
    if (key(st) === goal) return dist.get(goal);
    for (const passenger of [null, 1, 2, 3]) {
      if (passenger !== null && st[passenger] !== st[0]) continue;
      const next = [...st];
      next[0] = 1 - st[0];
      if (passenger !== null) next[passenger] = 1 - st[passenger];
      if (unsafe(next) || dist.has(key(next))) continue;
      dist.set(key(next), dist.get(key(st)) + 1);
      queue.push(next);
    }
  }
  throw new Error('traversée impossible');
}

/**
 * Pesées minimales pour trouver LA boule plus lourde parmi n suspectes, au pire :
 * on essaie toutes les pesées k contre k (le reste de côté) et on garde le pire cas.
 */
const weighMemo = new Map();
function minWeighings(n) {
  if (n <= 1) return 0;
  if (weighMemo.has(n)) return weighMemo.get(n);
  let best = Infinity;
  for (let k = 1; 2 * k <= n; k++) best = Math.min(best, 1 + Math.max(minWeighings(k), minWeighings(n - 2 * k)));
  weighMemo.set(n, best);
  return best;
}

/**
 * Plus petit k tel que TOUTE suite de k tirages réalisable (au plus `stock[c]` de chaque couleur)
 * vérifie `ok` — énumération exhaustive des suites.
 */
function minDrawsGuaranteeing(stock, ok) {
  const colours = stock.length;
  for (let k = 1; k <= stock.reduce((a, b) => a + b, 0); k++) {
    let always = true;
    const counts = new Array(colours).fill(0);
    const walk = (depth) => {
      if (!always) return;
      if (depth === k) {
        if (!ok(counts)) always = false;
        return;
      }
      for (let c = 0; c < colours; c++) {
        if (counts[c] >= stock[c]) continue;
        counts[c]++;
        walk(depth + 1);
        counts[c]--;
      }
    };
    walk(0);
    if (always) return k;
  }
  throw new Error('jamais garanti');
}

/** Chiffres écrits pour numéroter les pages 1 … last. */
function digitsUpTo(last) {
  let c = 0;
  for (let p = 1; p <= last; p++) c += String(p).length;
  return c;
}

/** Le jour où la surface valait `fraction` du lac, en remontant le temps depuis le jour plein. */
function dayWithFraction(fullDay, fraction) {
  let area = 1;
  for (let day = fullDay; day >= 0; day--) {
    if (Math.abs(area - fraction) < 1e-12) return day;
    area /= 2;
  }
  throw new Error('fraction jamais atteinte');
}

/** Façons de payer `amount` avec les pièces données (multi-ensembles), par énumération imbriquée. */
function waysToPay(amount, coins) {
  const go = (i, rest) => {
    if (i === coins.length) return rest === 0 ? 1 : 0;
    let w = 0;
    for (let k = 0; k * coins[i] <= rest; k++) w += go(i + 1, rest - k * coins[i]);
    return w;
  };
  return go(0, amount);
}

export const ORACLE = {
  // #1 — simulation année par année.
  'two-ages-sum': {
    answer: ({ a, b, t }) => yearsUntilSum([a, b], t),
    ceiling: () => yearsUntilDouble(8, 3),
  },
  // #5 — les paires comptées une à une.
  'first-handshakes': {
    answer: ({ n }) => countPairs(n),
    ceiling: () => {
      for (let n = 2; n < 100; n++) if (countPairs(n) === 45) return n;
      throw new Error('aucun n');
    },
  },
  // #12 — le colimaçon simulé jour par jour.
  'snail-in-well': {
    answer: ({ h }) => snailDay(h, 3, 2),
    ceiling: () => snailDay(20, 5, 3),
  },
  // #18 — la somme faite terme à terme.
  'gauss-pairing-sum': {
    answer: ({ n }) => sumRange(1, n),
    ceiling: () => sumRange(2, 40, 2),
  },
  // #25 — positions des poteaux énumérées (ligne ouverte, puis boucle fermée).
  'fence-posts': {
    answer: ({ l }) => postsOnLine(l, 2),
    parts: [({ l }) => postsOnLoop(l, 2)],
    ceiling: () => postsOnLine(20, 1) - postsOnLine(20, 2),
  },
  // #33 — parcours en largeur des 16 états de la traversée.
  'shepherd-river-crossing': {
    answer: () => riverCrossingBfs(),
  },
  // #47 — toutes les stratégies de pesée explorées récursivement.
  'heavier-ball': {
    answer: () => minWeighings(9),
    ceiling: () => minWeighings(27),
  },
  // #60 — toutes les suites de tirages énumérées.
  'socks-in-dark': {
    answer: () => minDrawsGuaranteeing([10, 10], (c) => c.some((x) => x >= 2)),
    ceiling: () => minDrawsGuaranteeing([10, 10], (c) => c[0] >= 2),
  },
  // #72 — les chiffres comptés page par page.
  'page-digits': {
    answer: ({ p }) => digitsUpTo(p),
    ceiling: () => {
      for (let p = 1; p < 10000; p++) if (digitsUpTo(p) === 600) return p;
      throw new Error('aucune page');
    },
  },
  // #88 — la surface divisée par 2 en remontant les jours.
  'doubling-algae': {
    answer: ({ d }) => dayWithFraction(d, 1 / 2),
    ceiling: ({ d }) => dayWithFraction(d, 1 / 8),
  },
  // #100 — les combinaisons de pièces énumérées.
  'paying-with-coins': {
    answer: () => waysToPay(50, [20, 10]),
    parts: [() => waysToPay(50, [20, 10, 5])],
    ceiling: () => waysToPay(100, [20, 10, 5]),
  },
};
