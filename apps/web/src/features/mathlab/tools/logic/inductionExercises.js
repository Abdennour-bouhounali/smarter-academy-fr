/**
 * LES EXERCICES DE RÉCURRENCE — §32, §38.
 *
 * Un exercice porte tout ce dont l'escalier a besoin : ses suites, sa
 * proposition, son rang de départ, et la chaîne d'hérédité que l'élève
 * ordonnera. Rien n'est codé en dur dans l'interface, et surtout pas le nom
 * `u` : un exercice peut définir u, v, w (§10).
 *
 * ── Ces exercices sont VÉRIFIÉS, pas déclarés ────────────────────────────
 * `inductionExercises.test.js` déroule chaque suite, évalue chaque
 * proposition rang par rang, et vérifie chaque maillon de chaque chaîne
 * d'hérédité numériquement. Un exercice faux ne peut pas atteindre un élève
 * — c'est la même exigence que `presets.test.js` pour les énoncés de logique.
 *
 * Les deux premiers sont les cas de référence du BAC algérien (§38) ; les
 * suivants gardent les sommes classiques, qui restent au programme et dont
 * l'escalier est plus simple à lire pour un premier contact.
 */

export const INDUCTION_EXERCISES = Object.freeze([
  /* ── §38 TEST CASE A — récurrence + inégalité ───────────────────────── */
  {
    id: 'boundedAffine',
    baseIndex: 0,
    stepCount: 5,
    sequences: [
      { name: 'u', kind: 'recurrence', startIndex: 0, initial: '-1', rule: '1/3*u + 2' },
    ],
    // Ce que l'élève doit démontrer : uₙ < 3.
    proposition: { left: 'uₙ', relation: '<', right: '3' },
    /**
     * §26 — la chaîne : de l'hypothèse uₙ < 3 jusqu'à uₙ₊₁ < 3.
     *
     * ── Une chaîne d'INÉGALITÉ s'écrit quand même en expressions ────────
     * Le raisonnement est « uₙ < 3 donc ⅓uₙ < 1 donc ⅓uₙ + 2 < 3 ». Ce qui
     * s'enchaîne, ce sont les MEMBRES DE GAUCHE : on part de uₙ, on le
     * multiplie par ⅓, on ajoute 2, et on reconnaît uₙ₊₁. Chaque maillon
     * part donc de là où le précédent arrive — c'est ce que `checkOrder`
     * vérifie — et la BORNE franchie à chaque fois (3, puis 1, puis 3) est
     * portée par `bounds` et par le texte arabe de l'étape.
     *
     * Écrire ces maillons comme des identités (`from === to`) aurait été
     * plus court, mais la chaîne ne se serait plus tenue : deux étapes
     * consécutives n'auraient rien eu en commun, et l'élève aurait pu les
     * poser dans n'importe quel ordre sans que rien ne le signale.
     */
    chain: [
      // uₙ < 3 — l'hypothèse de récurrence, vraie sur tout l'escalier.
      { id: 'hypothesis', from: 'u', to: '3', relation: '<' },
      // On multiplie par ⅓ : ⅓uₙ < 1.
      { id: 'third', from: '1/3*u', to: '1', relation: '<' },
      // On ajoute 2 : ⅓uₙ + 2 < 3.
      { id: 'plusTwo', from: '1/3*u + 2', to: '3', relation: '<' },
      // Et ⅓uₙ + 2 EST uₙ₊₁ — une égalité, celle-là, vérifiée comme telle.
      { id: 'conclude', from: '1/3*u + 2', to: 'U' },
    ],
    // La borne franchie à chaque étape : uₙ < 3, puis ⅓uₙ < 1, puis
    // ⅓uₙ + 2 < 3. C'est ce que le texte arabe de l'étape annonce.
    bounds: { hypothesis: 3, third: 1, plusTwo: 3 },
  },

  /* ── §38 TEST CASE B — suite auxiliaire + égalité ───────────────────── */
  {
    id: 'auxiliaryDifference',
    baseIndex: 0,
    stepCount: 5,
    sequences: [
      { name: 'u', kind: 'recurrence', startIndex: 0, initial: '-2/3', rule: '3/4*u - 1/2' },
      { name: 'v', kind: 'recurrence', startIndex: 0, initial: '4/3', rule: '3/4*v' },
      { name: 'w', kind: 'derived', startIndex: 0, rule: 'u - v' },
    ],
    proposition: { left: 'wₙ', relation: '=', right: '-2' },
    // §28 — la dérivation complète, maillon par maillon :
    //   wₙ₊₁ = uₙ₊₁ − vₙ₊₁ = (¾uₙ − ½) − ¾vₙ = ¾(uₙ − vₙ) − ½ = ¾(−2) − ½ = −2
    chain: [
      { id: 'expand', from: 'W', to: 'U - V' },
      { id: 'substitute', from: 'U - V', to: '(3/4*u - 1/2) - 3/4*v' },
      { id: 'factor', from: '(3/4*u - 1/2) - 3/4*v', to: '3/4*(u - v) - 1/2' },
      { id: 'useHypothesis', from: '3/4*(u - v) - 1/2', to: '3/4*w - 1/2' },
      { id: 'conclude', from: '3/4*w - 1/2', to: 'W' },
    ],
  },

  /* ── Les sommes classiques : l'escalier le plus simple à lire ───────── */
  {
    id: 'triangularSum',
    baseIndex: 1,
    stepCount: 5,
    sequences: [
      // La somme 1 + 2 + … + n, écrite en récurrence : sₙ₊₁ = sₙ + (n+1).
      { name: 'u', kind: 'recurrence', startIndex: 1, initial: '1', rule: 'u + n + 1' },
      // Et la formule fermée, comme suite explicite à comparer.
      { name: 'v', kind: 'explicit', startIndex: 1, rule: 'n*(n+1)/2' },
    ],
    proposition: { left: 'uₙ', relation: '=', right: 'vₙ' },
    chain: [
      { id: 'expand', from: 'U', to: 'u + n + 1' },
      { id: 'useHypothesis', from: 'u + n + 1', to: 'n*(n+1)/2 + n + 1' },
      { id: 'factor', from: 'n*(n+1)/2 + n + 1', to: '(n+1)*(n+2)/2' },
      { id: 'conclude', from: '(n+1)*(n+2)/2', to: 'V' },
    ],
  },

  {
    id: 'powersBeatSquares',
    baseIndex: 5,
    stepCount: 5,
    sequences: [
      { name: 'u', kind: 'explicit', startIndex: 0, rule: '2^n' },
      { name: 'v', kind: 'explicit', startIndex: 0, rule: 'n^2' },
    ],
    // 2ⁿ > n² — VRAI à partir de n = 5, et c'est tout l'intérêt : l'élève
    // qui teste n = 2, 3, 4 voit rouge, et découvre que le rang de départ
    // d'une récurrence n'est pas toujours 0 (§25).
    proposition: { left: 'uₙ', relation: '>', right: 'vₙ' },
    chain: [
      { id: 'expand', from: 'U', to: '2*u' },
      { id: 'useHypothesis', from: '2*u', to: '2*u' },
      { id: 'conclude', from: '2*u', to: 'U' },
    ],
    // L'escalier de CETTE proposition casse avant 5 : on le montre.
    failsBelow: 5,
  },
]);

export const DEFAULT_EXERCISE_ID = 'boundedAffine';

/** Un exercice par id, ou le premier — un document ancien ne casse jamais. */
export function findExercise(id) {
  return INDUCTION_EXERCISES.find((item) => item.id === id) ?? INDUCTION_EXERCISES[0];
}

/**
 * §31 — les variables que le CONSTRUCTEUR doit offrir pour cet exercice.
 *
 * Un exercice qui ne définit que `u` n'expose pas `vₙ`. La liste sort de la
 * définition, jamais d'une liste générique écrite à la main.
 */
export function builderVariablesOf(exercise) {
  return (exercise?.sequences ?? []).map((sequence) => ({
    name: sequence.name,
    token: `${sequence.name}ₙ`,
    kind: sequence.kind,
  }));
}

/**
 * Les propositions ALTERNATIVES qu'un élève peut essayer (§19 « جرّب عبارة
 * أخرى »). Elles sont construites depuis les suites de l'exercice, donc
 * elles parlent toujours de quelque chose qui existe.
 */
export function alternativesOf(exercise) {
  const [first] = exercise?.sequences ?? [];
  if (!first) return [];
  const token = `${first.name}ₙ`;

  return [
    { left: token, relation: '<', right: '3' },
    { left: token, relation: '>', right: '0' },
    { left: token, relation: '≥', right: '-2' },
  ];
}
