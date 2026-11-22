// Oracle du lot « university » du « مختبر التفكير » — même forme que seed.mjs :
// ORACLE[id] = { answer, ceiling?, parts?[], tolerance? }, chaque champ (params, point) => valeur,
// recalculé par un chemin INDÉPENDANT de la relecture du contenu :
//   — sommes de fractions : additionnées terme à terme en BigInt (jamais le télescopage) ;
//   — dérangements : les n! permutations énumérées une à une ;
//   — intégrales : Simpson composite (jamais l'intégration par parties) ;
//   — anniversaires : le produit des probabilités, classe par classe ;
//   — restes : puissances en BigInt (jamais la période) ;
//   — tablette : des cassures tirées au hasard (graine fixe), comptées jusqu'au bout ;
//   — Josèphe : la ronde simulée avec un tableau (jamais la formule 2(n − 2ᵏ) + 1).

/* ---------- fractions exactes (BigInt) ---------- */
const gcd = (a, b) => {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a;
};
/** Somme exacte de 1 / den(k), k = from…to, rendue en « p/q » irréductible. */
function sumOfUnitFractions(from, to, den) {
  let p = 0n;
  let q = 1n;
  for (let k = from; k <= to; k++) {
    const d = den(BigInt(k));
    p = p * d + q;
    q *= d;
    const g = gcd(p, q);
    p /= g;
    q /= g;
  }
  return q === 1n ? `${p}` : `${p}/${q}`;
}

/* ---------- permutations ---------- */
function* permutations(items) {
  if (items.length <= 1) {
    yield items;
    return;
  }
  for (let i = 0; i < items.length; i++) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    for (const p of permutations(rest)) yield [items[i], ...p];
  }
}
/** Nombre de façons de ranger n lettres sans qu'aucune ne soit dans SON enveloppe. */
function countDerangements(n) {
  const ids = Array.from({ length: n }, (_, i) => i);
  let count = 0;
  for (const p of permutations(ids)) if (p.every((v, i) => v !== i)) count++;
  return count;
}

/* ---------- intégration numérique ---------- */
function simpson(f, a, b, n = 200000) {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

/* ---------- anniversaires ---------- */
function sharedBirthday(students, days = 365) {
  let allDifferent = 1;
  for (let i = 0; i < students; i++) allDifferent *= (days - i) / days;
  return 1 - allDifferent;
}

/* ---------- puissances modulaires (BigInt, sans période) ---------- */
const powMod = (base, exp, mod) => Number(BigInt(base) ** BigInt(exp) % BigInt(mod));

/* ---------- tablette : cassures aléatoires ---------- */
/** Générateur Park–Miller (graine fixe : l'oracle est déterministe). */
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 48271) % 2147483647;
    return s / 2147483647;
  };
}
/**
 * Casse une pièce au hasard (une pièce, une droite, le long d'une rainure) jusqu'à
 * n'avoir que des carrés unité ; renvoie le nombre de cassures. Plusieurs graines :
 * l'oracle vérifie que le nombre ne dépend PAS de la façon de casser.
 */
function breaksUntilUnits(dims, seed) {
  const rand = rng(seed);
  const pieces = [dims];
  let breaks = 0;
  for (;;) {
    const breakable = pieces.map((p, i) => [p, i]).filter(([p]) => p.some((d) => d > 1));
    if (!breakable.length) return breaks;
    const [piece, index] = breakable[Math.floor(rand() * breakable.length)];
    const axes = piece.map((d, a) => [d, a]).filter(([d]) => d > 1);
    const [d, axis] = axes[Math.floor(rand() * axes.length)];
    const at = 1 + Math.floor(rand() * (d - 1));
    const a = [...piece];
    const b = [...piece];
    a[axis] = at;
    b[axis] = d - at;
    pieces.splice(index, 1, a, b);
    breaks++;
  }
}
function breaksForAnyWay(dims) {
  const counts = new Set([1, 7, 42, 2026, 99991].map((seed) => breaksUntilUnits(dims, seed)));
  if (counts.size !== 1) throw new Error(`le nombre de cassures dépend de la façon : ${[...counts]}`);
  return [...counts][0];
}

/* ---------- Josèphe : la ronde simulée ---------- */
/** n enfants 1…n ; on compte à partir de l'enfant 1 et chaque `step`-ième sort. */
function lastInCircle(n, step) {
  const circle = Array.from({ length: n }, (_, i) => i + 1);
  let at = 0;
  while (circle.length > 1) {
    at = (at + step - 1) % circle.length;
    circle.splice(at, 1);
  }
  return circle[0];
}
/** La formule proposée en choix A, confrontée à la simulation pour n = 1…300. */
function generalFormulaChoice() {
  const candidates = {
    A: (n, p) => 2 * (n - p) + 1,
    B: (n, p) => n - p + 1,
    C: (n, p) => 2 * p - n,
    D: (n, p) => 2 * (n - p) - 1,
  };
  const winners = Object.entries(candidates).filter(([, f]) => {
    for (let n = 1; n <= 300; n++) {
      const p = 2 ** Math.floor(Math.log2(n));
      if (f(n, p) !== lastInCircle(n, 2)) return false;
    }
    return true;
  });
  if (winners.length !== 1) throw new Error('aucun choix unique ne colle à la simulation');
  return winners[0][0];
}

export const ORACLE = {
  // #425 — somme télescopique, additionnée terme à terme.
  'vanishing-sum': {
    answer: () => sumOfUnitFractions(1, 99, (k) => k * (k + 1n)),
    parts: [
      // 1/(1×3) + 1/(3×5) + … + 1/(99×101) : k impair = 2j − 1, j = 1…50.
      () => sumOfUnitFractions(1, 50, (j) => (2n * j - 1n) * (2n * j + 1n)),
      () => sumOfUnitFractions(1, 98, (k) => k * (k + 1n) * (k + 2n)),
    ],
    // Somme infinie de 1/(k(k+2)) : sommes partielles en flottant jusqu'à 10⁷ (reste < 1,1·10⁻⁷).
    ceiling: () => {
      let s = 0;
      for (let k = 10_000_000; k >= 1; k--) s += 1 / (k * (k + 2));
      return s + 1 / 10_000_000;
    },
  },

  // #435 — dérangements de 4 (et de 5), permutations énumérées.
  'lost-letters': {
    answer: () => countDerangements(4),
    ceiling: () => countDerangements(5),
  },

  // #450 — intégrales par Simpson.
  'integration-by-parts': {
    answer: () => simpson((x) => x * Math.exp(x), 0, 1),
    parts: [
      () => simpson((x) => x * x * Math.exp(x), 0, 1),
      () => simpson((x) => x ** 3 * Math.exp(x), 0, 1),
    ],
    ceiling: () => simpson((x) => Math.log(x), 1, Math.E),
  },

  // #460 — le produit des « tous différents », puis la première classe qui passe 0,9.
  'shared-birthday': {
    answer: () => sharedBirthday(23),
    ceiling: () => {
      let n = 1;
      while (sharedBirthday(n) < 0.9) n++;
      return n;
    },
  },

  // #475 — restes de puissances en BigInt.
  'power-remainder': {
    answer: () => powMod(2, 100, 7),
    parts: [() => powMod(2, 100, 13), () => powMod(3, 100, 7)],
    ceiling: () => powMod(2, 100, 100),
  },

  // #490 — cassures aléatoires, plusieurs graines, toujours le même nombre.
  'candy-bar': {
    answer: ({ r, c }) => breaksForAnyWay([Number(r), Number(c)]),
    ceiling: () => breaksForAnyWay([3, 4, 5]),
  },

  // #500 — la ronde simulée.
  'last-in-circle': {
    answer: ({ n }) => lastInCircle(Number(n), 2),
    parts: [() => generalFormulaChoice(), () => lastInCircle(100, 2)],
    ceiling: () => lastInCircle(41, 3),
  },
};
