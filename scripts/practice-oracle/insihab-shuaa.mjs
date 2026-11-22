// Oracle du banc « insihab-shuaa » (unité 11 « الأشعة والانسحاب ») — chaque réponse construite RECALCULÉE ici à partir des
// nombres de l'énoncé (helpers.mjs : R, q), sans lire le contenu ni packages/core/arithmetic/vectors.js ni la logique du lab.
// Les comptes de vecteurs égaux sont refaits par force brute sur les points nommés de la figure (recopiés ici), les
// longueurs par Pythagore en entiers. Fusionné dans scripts/practice-answer-oracle.test.mjs. Les QCM sont vérifiés par
// l'aller-retour du validateur. Écrit avec le générateur de l'auteur (scratchpad u1x-insihab-shuaa/gen.py).
import { R, q } from './helpers.mjs';

const ID = (l, n) => `ex-4am-insihab-shuaa-l${l}-${String(n).padStart(3, '0')}:q1`;

/** Nombre de couples (X, Y) de points nommés, autres que (a, b), dont la flèche XY a les mêmes déplacements que ab. */
function equalCount(points, a, b) {
  const [dx, dy] = [points[b][0] - points[a][0], points[b][1] - points[a][1]];
  let n = 0;
  for (const x of Object.keys(points)) {
    for (const y of Object.keys(points)) {
      if (x === y || (x === a && y === b)) continue;
      if (points[y][0] - points[x][0] === dx && points[y][1] - points[x][1] === dy) n += 1;
    }
  }
  return n;
}
/** Parmi des flèches DESSINÉES (« XY »), combien d'autres que `ref` ont le même déplacement. */
function drawnEqual(points, arrows, ref) {
  const d = (s) => [points[s[1]][0] - points[s[0]][0], points[s[1]][1] - points[s[0]][1]];
  const [dx, dy] = d(ref);
  return arrows.filter((a) => a !== ref && d(a)[0] === dx && d(a)[1] === dy).length;
}
/** Longueur entière d'une flèche (dx ; dy) — refuse un résultat non entier. */
function intLength(dx, dy) {
  const s = dx * dx + dy * dy;
  const r = Math.round(Math.sqrt(s));
  if (r * r !== s) throw new Error(`longueur non entière : √${s}`);
  return r;
}
const grid = (cols, rows, names) => Object.fromEntries(names.map((n, i) => [n, [i % cols, Math.floor(i / cols)]]));

const TREE = { O: [3, 5], A: [0, 4], M: [2, 4], N: [4, 4], B: [6, 4], C: [0, 3], P: [2, 3], Q: [4, 3], D: [6, 3], E: [0, 2], R: [2, 2], S: [4, 2], F: [6, 2], H: [2, 0], K: [4, 0] };

export const ORACLE = {
  [ID(1, 8)]: R(intLength(6 - 1, 2 - 2)),
  // « من بين الأسهم المرسومة » : seules les six flèches dessinées comptent (HG serait égal à AB, mais c'est GH qui est dessiné)
  [ID(2, 5)]: R(drawnEqual({ A: [0, 0], B: [2, 1], C: [3, 0], D: [5, 1], E: [0, 2], F: [2, 3], G: [5, 3], H: [3, 2], K: [3, 4], L: [7, 6], M: [6, 0], N: [8, 1] },
    ['AB', 'CD', 'EF', 'GH', 'KL', 'MN'], 'AB')),
  [ID(2, 8)]: R(q(3).add(2)),
  [ID(2, 10)]: R(intLength(3, 4)),
  [ID(3, 4)]: R(equalCount(TREE, 'C', 'M')),
  [ID(3, 10)]: R(q(7)),
  [ID(4, 6)]: R(equalCount(grid(4, 3, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']), 'A', 'F')),
  [ID(4, 10)]: R(equalCount({ P: [0, 0], Q: [2, 0], R: [4, 0], U: [1, 3], V: [3, 3], W: [5, 3] }, 'P', 'Q')),
  [ID(5, 3)]: R(equalCount(grid(4, 2, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']), 'E', 'B')),
  [ID(5, 5)]: R(intLength(3, 4)),
  [ID(5, 7)]: R(q(3).add(4).add(5)),
};
