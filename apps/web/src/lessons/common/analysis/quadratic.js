/**
 * Noyau du second degré — discriminant, racines, forme factorisée, sommet, signe.
 *
 * Fonctions PURES, sans JSX ni état, partagées par les leçons de Première qui
 * parlent de trinôme : « Second degré : résoudre », « Second degré : signe et
 * problèmes », et toute leçon qui a besoin de savoir où une parabole coupe
 * l'axe. C'est le précédent `derivative.js` (même dossier) : un utilitaire
 * mathématique se partage, un LABORATOIRE se copie et s'adapte.
 *
 * RÈGLE DE JUSTESSE, load-bearing :
 *   `roots` rend des flottants. Une réponse d'élève n'est comparée à ces
 *   flottants qu'à travers une tolérance explicite, jamais par égalité stricte.
 *   Quand une leçon annonce une racine ENTIÈRE, elle l'écrit en littéral dans
 *   son module et un test vérifie que `roots` la retrouve à 1e-9 près.
 *
 * CONVENTION : a ≠ 0. Un a nul n'est pas un trinôme du second degré ; toutes
 * ces fonctions lèvent alors, plutôt que de rendre un résultat qui aurait l'air
 * juste (une division par zéro silencieuse produirait Infinity, qui se
 * dessinerait sans erreur).
 */

/** Garde commune : le second degré exige a ≠ 0. */
function requireQuadratic(a) {
  if (typeof a !== 'number' || !Number.isFinite(a) || a === 0) {
    throw new Error('quadratic: a doit être un nombre non nul (ax² + bx + c).');
  }
}

/**
 * Le discriminant Δ = b² − 4ac.
 * Un seul nombre, et c'est lui qui décide du NOMBRE de solutions avant toute
 * résolution : Δ > 0 → deux, Δ = 0 → une, Δ < 0 → aucune.
 */
export function discriminant(a, b, c) {
  requireQuadratic(a);
  return b * b - 4 * a * c;
}

/**
 * Les racines réelles de ax² + bx + c, TRIÉES par ordre croissant.
 * @returns {number[]} [] si Δ < 0, [x0] si Δ = 0, [x1, x2] avec x1 < x2 sinon.
 *
 * Le tri est un CONTRAT, pas un détail : les modules affichent « x₁ » puis
 * « x₂ » et l'élève lit le dessin de gauche à droite. Sans tri, un a négatif
 * inverserait l'ordre et l'affichage contredirait la figure.
 */
export function roots(a, b, c) {
  const d = discriminant(a, b, c);
  if (d < 0) return [];
  // `+ 0` : même parade contre le zéro négatif que dans `vertex`.
  if (d === 0) return [-b / (2 * a) + 0];
  const r = Math.sqrt(d);
  const x1 = (-b - r) / (2 * a) + 0;
  const x2 = (-b + r) / (2 * a) + 0;
  return x1 <= x2 ? [x1, x2] : [x2, x1];
}

/**
 * La forme factorisée a(x − x₁)(x − x₂), rendue comme une STRUCTURE, jamais
 * comme une chaîne : c'est la leçon qui décide de l'écriture française.
 * @returns {{ a: number, roots: number[], factorable: boolean }}
 *   factorable vaut false quand Δ < 0 : sur ℝ le trinôme ne se factorise pas.
 *   Δ = 0 rend une seule racine — la forme est alors a(x − x₀)².
 */
export function factoredForm(a, b, c) {
  const rs = roots(a, b, c);
  return { a, roots: rs, factorable: rs.length > 0 };
}

/**
 * Le sommet de la parabole : { x: −b/(2a), y: f(x) }.
 * `y` est calculé en ÉVALUANT le trinôme au sommet plutôt que par la formule
 * −Δ/(4a) : les deux sont égales en algèbre exacte, mais l'évaluation directe
 * ne cumule pas l'erreur de b² − 4ac, et c'est elle qui est cohérente avec le
 * point que la figure dessine.
 */
export function vertex(a, b, c) {
  requireQuadratic(a);
  // `+ 0` normalise le ZÉRO NÉGATIF : avec b = 0, −b/(2a) vaut −0, qui
  // s'affiche « −0 » une fois formaté en français. Un sommet à −0 est un
  // mensonge visuel, attrapé par le test « est en −b/(2a) ».
  const x = -b / (2 * a) + 0;
  return { x, y: a * x * x + b * x + c + 0 };
}

/** Évalue le trinôme — le même calcul partout, pour que figure et texte concordent. */
export function evalTrinome(a, b, c, x) {
  requireQuadratic(a);
  return a * x * x + b * x + c;
}

/**
 * Le signe du trinôme, décrit par intervalles, du plus petit x au plus grand.
 * @returns {{ from: number|null, to: number|null, sign: 1|0|-1 }[]}
 *   `null` signifie une borne infinie. Les racines apparaissent comme des
 *   intervalles ponctuels de signe 0 : c'est ce qui permet à un tableau de
 *   signes d'afficher le zéro sans que la leçon ait à le recalculer.
 *
 * La règle qui en sort : « du signe de a, sauf ENTRE les racines ».
 */
export function trinomialSign(a, b, c) {
  requireQuadratic(a);
  const s = a > 0 ? 1 : -1;
  const rs = roots(a, b, c);
  if (rs.length === 0) return [{ from: null, to: null, sign: s }];
  if (rs.length === 1) {
    return [
      { from: null, to: rs[0], sign: s },
      { from: rs[0], to: rs[0], sign: 0 },
      { from: rs[0], to: null, sign: s },
    ];
  }
  const [x1, x2] = rs;
  return [
    { from: null, to: x1, sign: s },
    { from: x1, to: x1, sign: 0 },
    { from: x1, to: x2, sign: /** @type {1|-1} */ (-s) },
    { from: x2, to: x2, sign: 0 },
    { from: x2, to: null, sign: s },
  ];
}

/**
 * Le nombre de solutions réelles — 2, 1 ou 0 — sans passer par les racines.
 * C'est le geste du module 1 : compter AVANT de résoudre.
 */
export function rootCount(a, b, c) {
  const d = discriminant(a, b, c);
  return d > 0 ? 2 : d === 0 ? 1 : 0;
}
