/**
 * Aléatoire REPRODUCTIBLE pour les simulations (loi des grands nombres,
 * arbres, tests diagnostiques).
 *
 * Pourquoi pas Math.random : une simulation doit être rejouable à
 * l'identique — pour les tests unitaires, pour l'e2e, et pour qu'un élève
 * qui revient sur un module retrouve SA série plutôt qu'une autre. Le
 * générateur est un mulberry32 : petit, rapide, de qualité largement
 * suffisante pour un lancer de dé, et surtout déterministe à graine égale.
 *
 * Ce n'est PAS une animation préenregistrée : chaque tirage est réellement
 * calculé au moment où l'élève le demande, et 10 000 tirages donnent une
 * fréquence différente de 10 tirages parce que les tirages diffèrent.
 */

/** Générateur mulberry32 : seed (entier) → fonction () => [0 ; 1[. */
export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Entier uniforme dans [min ; max] (bornes incluses). */
export const randomInt = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));

/**
 * Une épreuve de Bernoulli : true avec la probabilité p.
 * `rng() < p` — strict, pour que p = 0 ne réussisse jamais et p = 1 toujours.
 */
export const bernoulli = (rng, p) => rng() < p;

/**
 * Tirage dans une loi discrète donnée par ses probabilités.
 * `weights` = [{ value, p }] avec Σp = 1 (à l'arrondi près) ; la dernière
 * valeur absorbe le résidu, ce qui évite qu'un flottant fasse retourner
 * `undefined`.
 */
export function drawFrom(rng, weights) {
  const u = rng();
  let acc = 0;
  for (const w of weights) {
    acc += w.p;
    if (u < acc) return w.value;
  }
  return weights[weights.length - 1].value;
}

/**
 * Répète `n` épreuves de Bernoulli et renvoie le nombre de succès.
 * Boucle réelle : le coût est linéaire, et 10 000 tirages restent
 * instantanés (~0,1 ms) — pas besoin d'approximer par une loi normale.
 */
export function runBernoulliTrials(rng, n, p) {
  let successes = 0;
  for (let i = 0; i < n; i += 1) if (bernoulli(rng, p)) successes += 1;
  return successes;
}

/**
 * Simule `n` lancers d'un dé équilibré à `faces` faces et renvoie les
 * effectifs par face (index 0 = face 1).
 */
export function rollDice(rng, n, faces = 6) {
  const counts = new Array(faces).fill(0);
  for (let i = 0; i < n; i += 1) counts[randomInt(rng, 1, faces) - 1] += 1;
  return counts;
}

/**
 * Trajectoire de la fréquence observée au fil des répétitions : renvoie
 * `samples` points (n, fréquence) espacés logarithmiquement jusqu'à `n`,
 * en RÉUTILISANT les tirages déjà faits — c'est bien la même série qu'on
 * regarde se stabiliser, pas une suite d'expériences indépendantes.
 */
export function frequencyTrajectory(rng, n, p, samples = 40) {
  const marks = new Set();
  for (let i = 0; i <= samples; i += 1) {
    marks.add(Math.max(1, Math.round(10 ** (Math.log10(n) * (i / samples)))));
  }
  marks.add(n);
  const checkpoints = [...marks].sort((a, b) => a - b);
  const points = [];
  let successes = 0;
  let next = 0;
  for (let i = 1; i <= n; i += 1) {
    if (bernoulli(rng, p)) successes += 1;
    while (next < checkpoints.length && checkpoints[next] === i) {
      points.push({ n: i, frequency: successes / i });
      next += 1;
    }
  }
  return points;
}
