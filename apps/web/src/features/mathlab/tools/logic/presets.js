/**
 * Les ÉNONCÉS de l'atelier « Logique et raisonnement » — chaque préréglage est un fait
 * mathématique vérifié, jamais un énoncé fabriqué à la volée dans un
 * composant (§48 du cahier des charges : « Every generated problem […] must
 * be mathematically verified »). `presets.test.js` exécute chaque prédicat
 * sur son domaine et compare au verdict déclaré : un préréglage qui ment ne
 * peut pas passer la suite de tests, donc ne peut pas atteindre un élève.
 *
 * ── Deux règles tenues partout ───────────────────────────────────────────
 * 1. Un prédicat ne lève JAMAIS : hors de son domaine il rend `false`, et le
 *    domaine est déclaré (`excluded`) pour que le laboratoire le MONTRE
 *    (§6 : une énoncé ne se comprend pas sans son domaine).
 * 2. La parité passe par `isEven`/`isOdd`, jamais par `n % 2 === 1` : en
 *    JavaScript `(-3) % 2 === -1`, et « −3 est impair » deviendrait faux.
 *
 * Les prédicats sont des fonctions : ils ne sont JAMAIS stockés dans le
 * document (logicState.js ne garde que des identifiants).
 */

const isInteger = (n) => Number.isInteger(n);
export const isEven = (n) => Number.isInteger(n) && Math.abs(n % 2) === 0;
export const isOdd = (n) => Number.isInteger(n) && Math.abs(n % 2) === 1;

export function isPrime(n) {
  if (!Number.isInteger(n) || n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) {
    if (n % d === 0) return false;
  }

  return true;
}

const RANGE = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

/**
 * Un DOMAINE : ce que la droite graduée montre et ce que la recherche
 * parcourt. `integer: true` accroche le curseur aux entiers ; `step` fixe le
 * pas de l'accroche sinon (0,5 : de quoi trouver x = 0,5 pour x² > x).
 */
const INTEGERS = Object.freeze({ min: -12, max: 12, integer: true, symbol: 'ℤ' });
const NATURALS = Object.freeze({ min: 0, max: 30, integer: true, symbol: 'ℕ' });
const REALS = Object.freeze({ min: -6, max: 6, integer: false, step: 0.5, symbol: 'ℝ' });

/**
 * L'APPARTENANCE à l'ensemble déclaré — ce que dit l'énoncé, pas ce que la
 * droite graduée montre.
 *
 * `min`/`max` bornent l'ÉCHANTILLON (la droite, le tirage au hasard, la
 * recherche systématique) ; ils ne font PAS partie de l'énoncé. « Tout nombre
 * premier supérieur à 2 est pair » est réfuté par 31 autant que par 3 : refuser 31
 * parce que la droite s'arrête à 30 enseignerait une fausseté. Le juge ne
 * connaît donc que l'ensemble nommé par `symbol` (ℕ, ℕ*, ℤ, ℝ), plus les
 * valeurs `excluded` du domaine s'il en déclare.
 *
 * Un domaine SANS symbole connu n'a que ses bornes pour se définir : on les
 * garde alors, faute de mieux (aucun préréglage n'est dans ce cas —
 * presets.test.js le vérifie).
 */
const SETS = Object.freeze({
  'ℕ': (v) => Number.isInteger(v) && v >= 0,
  'ℕ*': (v) => Number.isInteger(v) && v >= 1,
  'ℤ': (v) => Number.isInteger(v),
  'ℝ': () => true,
});

export const KNOWN_SET_SYMBOLS = Object.freeze(Object.keys(SETS));

/**
 * Au-delà de cette valeur absolue, le juge NE SE PRONONCE PAS : n² + n + 41
 * doit rester un entier exact en virgule flottante (< 2⁵³) pour que la
 * primalité, la parité ou la divisibilité soient calculées juste. 10⁶ laisse
 * n² + n + 41 ≈ 10¹² — exact, et testé en premier par essais de division en
 * une milliseconde. Ce n'est PAS une borne de l'énoncé : une valeur plus
 * grande est « trop grande pour être vérifiée ici », jamais « fausse ».
 */
export const JUDGE_LIMIT = 1e6;

/**
 * 'in' (dans l'ensemble déclaré), 'outside' (hors de l'ensemble : 2,5 dans
 * ℕ, −2 dans ℕ, 0 exclu) ou 'tooLarge' (au-delà de JUDGE_LIMIT : on ne
 * juge pas ce qu'on ne sait pas calculer exactement).
 */
export function domainStatus(value, domain) {
  if (!domain || typeof value !== 'number' || !Number.isFinite(value)) return 'outside';
  const member = SETS[domain.symbol];
  const inSet = member
    ? member(value)
    : value >= domain.min && value <= domain.max && (domain.integer ? Number.isInteger(value) : true);
  if (!inSet) return 'outside';
  if (Array.isArray(domain.excluded) && domain.excluded.includes(value)) return 'outside';
  if (Math.abs(value) > JUDGE_LIMIT) return 'tooLarge';

  return 'in';
}

/**
 * Le domaine tel qu'on l'ÉCRIT à côté de l'énoncé : « n ∈ ℕ* », « x ∈ ℝ ».
 * Sans lui, « 1/n > 0 » (toujours vrai sur ℕ*) et « 1/x > 0 » (dépend de x sur ℝ)
 * ne se distinguent pas (§6). La lettre est `variable` si le préréglage la
 * déclare, sinon n pour un ensemble d'entiers et x pour ℝ.
 */
export function domainLabel(preset) {
  const domain = preset?.domain;
  if (!domain?.symbol) return null;
  const variable = preset.variable ?? (domain.integer ? 'n' : 'x');
  const base = `${variable} ∈ ${domain.symbol}`;

  return domain.excludedSymbol ? `${base}, ${domain.excludedSymbol}` : base;
}

/** Les valeurs qu'une recherche systématique parcourt pour un domaine. */
export function sampleOf(domain) {
  if (domain.integer) return RANGE(domain.min, domain.max);
  const step = domain.step ?? 0.5;
  const out = [];
  for (let v = domain.min; v <= domain.max + 1e-9; v += step) out.push(Math.round(v * 1000) / 1000);

  return out;
}

/* ── §54 + §8-10 — l'expérience d'ouverture et le laboratoire du contre-exemple ── */

export const COUNTEREXAMPLE_CHALLENGES = Object.freeze([
  {
    // §54 : l'expérience qui OUVRE le laboratoire. Tout premier > 2 est un
    // contre-exemple — 3 est le plus petit.
    id: 'primeGtTwoIsEven',
    textKey: 'tools.logic.counterexample.claims.primeGtTwoIsEven',
    formula: '∀n ∈ ℕ, (n premier et n > 2) ⇒ n pair',
    domain: NATURALS,
    predicate: (n) => !(isPrime(n) && n > 2) || isEven(n),
    knownCounterexample: 3,
    hintKeys: ['tools.logic.counterexample.hints.listPrimes', 'tools.logic.counterexample.hints.primeGtTwoIsEven'],
  },
  {
    id: 'everyPrimeIsOdd',
    textKey: 'tools.logic.counterexample.claims.everyPrimeIsOdd',
    domain: NATURALS,
    predicate: (n) => !isPrime(n) || isOdd(n),
    knownCounterexample: 2,
    hintKeys: ['tools.logic.counterexample.hints.listPrimes', 'tools.logic.counterexample.hints.smallestPrime'],
  },
  {
    // « Si n² est pair, alors n est impair » — faux pour TOUT n pair.
    id: 'squareEvenImpliesOdd',
    textKey: 'tools.logic.counterexample.claims.squareEvenImpliesOdd',
    domain: INTEGERS,
    predicate: (n) => !isEven(n * n) || isOdd(n),
    knownCounterexample: 2,
    hintKeys: ['tools.logic.counterexample.hints.whenIsSquareEven', 'tools.logic.counterexample.hints.tryEven'],
  },
  {
    // « Tout nombre divisible par 4 est divisible par 8 » — 4 lui-même.
    id: 'divisibleByFourImpliesByEight',
    textKey: 'tools.logic.counterexample.claims.divisibleByFourImpliesByEight',
    domain: { min: 1, max: 40, integer: true, symbol: 'ℕ*' },
    predicate: (n) => n % 4 !== 0 || n % 8 === 0,
    knownCounterexample: 4,
    hintKeys: ['tools.logic.counterexample.hints.listMultiplesOfFour', 'tools.logic.counterexample.hints.smallestMultiple'],
  },
  {
    // Le polynôme d'Euler : n² + n + 41 est premier pour n = 0…39, et
    // composé en n = 40 (1681 = 41²). QUARANTE vérifications réussies ne
    // prouvaient rien : c'est §22 rendu tangible.
    id: 'eulerPolynomialAlwaysPrime',
    textKey: 'tools.logic.counterexample.claims.eulerPolynomialAlwaysPrime',
    domain: { min: 0, max: 45, integer: true, symbol: 'ℕ' },
    predicate: (n) => isPrime(n * n + n + 41),
    knownCounterexample: 40,
    hintKeys: ['tools.logic.counterexample.hints.manyChecksNotProof', 'tools.logic.counterexample.hints.eulerForty'],
  },
]);

export const DEFAULT_COUNTEREXAMPLE_ID = 'primeGtTwoIsEven';

/* ── §5-7 — Statement Lab : vraie / fausse / dépend, et la vérité sur la droite ── */

export const STATEMENTS = Object.freeze([
  { id: 'fiveGtThree', kind: 'fixed', formula: '5 > 3', verdict: 'true' },
  { id: 'sevenIsEven', kind: 'fixed', textKey: 'tools.logic.statements.items.sevenIsEven', formula: null, verdict: 'false' },
  {
    id: 'squareNonNegative', kind: 'variable', formula: 'x² ⩾ 0', domain: REALS,
    verdict: 'true', predicate: (x) => x * x >= 0,
  },
  {
    // §7 : l'expérience « x² > x » — fausse exactement sur [0 ; 1].
    id: 'squareGtX', kind: 'variable', formula: 'x² > x', domain: REALS,
    verdict: 'depends', predicate: (x) => x * x > x,
  },
  {
    id: 'xPlusTwoEqFive', kind: 'variable', formula: 'x + 2 = 5', domain: REALS,
    verdict: 'depends', predicate: (x) => x + 2 === 5,
  },
  {
    // §6 : x = 0 est HORS domaine — la droite le montre, barré.
    id: 'oneOverXPositive', kind: 'variable', formula: '1/x > 0',
    domain: { ...REALS, excludedSymbol: 'x ≠ 0' }, excluded: [0],
    verdict: 'depends', predicate: (x) => x !== 0 && 1 / x > 0,
  },
  {
    // Même énoncé, AUTRE domaine : sur ℕ*, 1/n > 0 est toujours vrai (§6).
    id: 'oneOverNPositive', kind: 'variable', formula: '1/n > 0',
    domain: { min: 1, max: 12, integer: true, symbol: 'ℕ*' },
    verdict: 'true', predicate: (n) => n !== 0 && 1 / n > 0,
  },
]);

export const DEFAULT_STATEMENT_ID = 'squareGtX';

/* ── §13-16 — Implication Lab : P ⇒ Q, réciproque, contraposée ─────────── */

export const IMPLICATIONS = Object.freeze([
  {
    id: 'gtThreeImpliesGtOne',
    p: { formula: 'x > 3', test: (x) => x > 3 },
    q: { formula: 'x > 1', test: (x) => x > 1 },
    domain: REALS,
    implicationHolds: true,
    // La réciproque est fausse : x = 2 vérifie Q (2 > 1), pas P (2 ⩽ 3).
    converseCounterexample: 2,
  },
  {
    id: 'xEqTwoImpliesSquareEqFour',
    p: { formula: 'x = 2', test: (x) => x === 2 },
    q: { formula: 'x² = 4', test: (x) => x * x === 4 },
    domain: REALS,
    implicationHolds: true,
    converseCounterexample: -2,
  },
  {
    id: 'divisibleByFourImpliesEven',
    p: { formula: '4 | n', test: (n) => isInteger(n) && n % 4 === 0 },
    q: { formula: '2 | n', test: (n) => isEven(n) },
    domain: INTEGERS,
    implicationHolds: true,
    converseCounterexample: 6,
  },
  {
    // Une implication FAUSSE — sans elle, « vraie » serait toujours la
    // bonne réponse et la question n'apprendrait rien. x = −3 : P vrai
    // (9 > 4), Q faux. Sa réciproque, elle, est vraie.
    id: 'squareGtFourImpliesGtTwo',
    p: { formula: 'x² > 4', test: (x) => x * x > 4 },
    q: { formula: 'x > 2', test: (x) => x > 2 },
    domain: REALS,
    implicationHolds: false,
    implicationCounterexample: -3,
    converseCounterexample: undefined,
  },
]);

export const DEFAULT_IMPLICATION_ID = 'gtThreeImpliesGtOne';

/* ── §17 — Equivalence Lab : P ⇔ Q, les deux sens ──────────────────────── */

export const EQUIVALENCES = Object.freeze([
  {
    // Vrai sur ℤ : pair ⇒ carré pair (produit), et carré pair ⇒ pair
    // (contraposée : impair ⇒ carré impair) — le 2e sens est prouvé dans
    // « Démonstration » (squareEvenImpliesEven).
    id: 'evenIffSquareEven',
    // `formula` est de la NOTATION, lisible dans toutes les langues : « n pair »
    // (du français) s'affichait tel quel dans l'aire et dans l'entraînement.
    p: { formula: '2 | n', textKey: 'tools.logic.formulas.nEven', test: isEven },
    q: { formula: '2 | n²', textKey: 'tools.logic.formulas.nSquareEven', test: (n) => isEven(n * n) },
    domain: INTEGERS,
    holds: true,
  },
  {
    id: 'squareEqSelfIffZeroOrOne',
    p: { formula: 'x² = x', test: (x) => x * x === x },
    q: { formula: 'x = 0 ∨ x = 1', test: (x) => x === 0 || x === 1 },
    domain: REALS,
    holds: true,
  },
  {
    // Un seul sens tient : x > 2 ⇒ x² > 4, mais x = −3 vérifie x² > 4 sans x > 2.
    id: 'gtTwoIffSquareGtFour',
    p: { formula: 'x > 2', test: (x) => x > 2 },
    q: { formula: 'x² > 4', test: (x) => x * x > 4 },
    domain: REALS,
    holds: false,
    forwardHolds: true,
    backwardCounterexample: -3,
  },
]);

export const DEFAULT_EQUIVALENCE_ID = 'evenIffSquareEven';

/* ── §18-20 — Conditions nécessaires et suffisantes ────────────────────── */

export const CONDITIONS = Object.freeze([
  {
    id: 'multipleOfFourAndEven',
    a: { formula: '4 | n', textKey: 'tools.logic.formulas.multipleOfFour', test: (n) => isInteger(n) && n % 4 === 0 },
    b: { formula: '2 | n', textKey: 'tools.logic.formulas.nEven', test: isEven },
    domain: { min: 0, max: 24, integer: true, symbol: 'ℕ' },
    // A ⇒ B tient ; B ⇏ A : 6 est pair sans être multiple de 4.
    bNotSufficientCounterexample: 6,
  },
  {
    id: 'gtFiveAndGtTwo',
    a: { formula: 'x > 5', test: (x) => x > 5 },
    b: { formula: 'x > 2', test: (x) => x > 2 },
    domain: { min: -2, max: 10, integer: false, step: 0.5, symbol: 'ℝ' },
    bNotSufficientCounterexample: 3,
  },
]);

export const DEFAULT_CONDITION_ID = 'multipleOfFourAndEven';

/* ── §21-25 — Quantifier Lab ────────────────────────────────────────────── */

/**
 * Chaque énoncé quantifié porte aussi sa STRUCTURE (`variable`, `inner`,
 * `negatedInner`) : l'entraînement en tire les deux erreurs classiques de
 * la négation (changer le seul quantificateur, nier le seul prédicat) au
 * lieu d'emprunter la négation d'un AUTRE énoncé — qui pouvait être
 * l'énoncé de départ lui-même (¬∃x, x² < 0 s'écrit ∀x, x² ⩾ 0) ou trahir la
 * réponse par son seul ensemble (ℕ). presets.test.js vérifie que la
 * structure réécrit exactement `formula` et `negationFormula`.
 */
export const QUANTIFIER_STATEMENTS = Object.freeze([
  {
    id: 'squareNonNegative', kind: 'forall', formula: '∀x ∈ ℝ, x² ⩾ 0', domain: REALS,
    predicate: (x) => x * x >= 0,
    truth: true, // vrai — et un ÉCHANTILLON ne suffit pas à le dire : c'est une propriété du carré
    negationFormula: '∃x ∈ ℝ, x² < 0',
    variable: 'x', inner: 'x² ⩾ 0', negatedInner: 'x² < 0',
  },
  {
    id: 'naturalPositive', kind: 'forall', formula: '∀n ∈ ℕ, n > 0', domain: NATURALS,
    predicate: (n) => n > 0,
    truth: false, // n = 0
    negationFormula: '∃n ∈ ℕ, n ⩽ 0',
    variable: 'n', inner: 'n > 0', negatedInner: 'n ⩽ 0',
  },
  {
    id: 'existsSquareFour', kind: 'exists', formula: '∃x ∈ ℝ, x² = 4', domain: REALS,
    predicate: (x) => x * x === 4,
    truth: true, // x = 2 ou x = −2
    negationFormula: '∀x ∈ ℝ, x² ≠ 4',
    variable: 'x', inner: 'x² = 4', negatedInner: 'x² ≠ 4',
  },
  {
    id: 'existsNegativeSquare', kind: 'exists', formula: '∃x ∈ ℝ, x² < 0', domain: REALS,
    predicate: (x) => x * x < 0,
    truth: false, // aucun témoin — et ne pas en trouver ne le PROUVE pas non plus
    negationFormula: '∀x ∈ ℝ, x² ⩾ 0',
    variable: 'x', inner: 'x² < 0', negatedInner: 'x² ⩾ 0',
  },
]);

export const DEFAULT_QUANTIFIER_ID = 'naturalPositive';

/* ── §26-36 — Les preuves, en GRAPHE de dépendances ─────────────────────
 *
 * Chaque étape déclare ce dont elle a besoin (`requires`). Une étape est
 * valide dès que ses prérequis sont posés AVANT elle : il n'y a donc pas un
 * seul ordre juste mais tous ceux que la logique permet (§36 : « Support
 * multiple valid proof paths ») — les deux cas d'un raisonnement par
 * disjonction se posent dans l'ordre qu'on veut. Le même graphe dessine
 * l'arbre de preuve (§32).
 *
 * `role` est le type de bloc de §26 (donnée · observation · propriété ·
 * déduction · conclusion). `distractors` sont des blocs FAUX, chacun avec la raison qui le
 * rend faux (§27 : jamais un simple « faux »). `alternatives` sont des
 * écritures équivalentes acceptées à la place d'une étape (§36).
 */


export const PROOFS = Object.freeze([
  {
    id: 'evenSquareIsEven',
    strategy: 'direct',
    steps: [
      { id: 'given', role: 'given', requires: [] },
      { id: 'rewrite', role: 'rule', requires: ['given'] },
      { id: 'square', role: 'conclusion', requires: ['rewrite'], alternatives: ['squareAlt'] },
      { id: 'factor', role: 'conclusion', requires: ['square'] },
      { id: 'conclude', role: 'result', requires: ['factor'] },
    ],
    distractors: ['wrongSquare', 'oneExample'],
  },
  {
    id: 'squareEvenImpliesEven',
    strategy: 'contrapositive',
    steps: [
      { id: 'contrapositive', role: 'rule', requires: [] },
      { id: 'assumeOdd', role: 'given', requires: ['contrapositive'] },
      { id: 'square', role: 'conclusion', requires: ['assumeOdd'] },
      { id: 'factor', role: 'conclusion', requires: ['square'] },
      { id: 'oddSquare', role: 'conclusion', requires: ['factor'] },
      { id: 'conclude', role: 'result', requires: ['oddSquare'] },
    ],
    distractors: ['converseInstead'],
  },
  {
    id: 'sqrtTwoIrrational',
    strategy: 'contradiction',
    steps: [
      { id: 'goal', role: 'given', requires: [] },
      { id: 'assume', role: 'observation', requires: ['goal'] },
      { id: 'square', role: 'conclusion', requires: ['assume'] },
      { id: 'aEven', role: 'rule', requires: ['square'] },
      { id: 'bEven', role: 'conclusion', requires: ['aEven'] },
      { id: 'contradiction', role: 'conclusion', requires: ['assume', 'bEven'], contradiction: true },
      { id: 'conclude', role: 'result', requires: ['contradiction'] },
    ],
    distractors: ['assumeGoal'],
  },
  {
    /**
     * §28 — le raisonnement par récurrence. Sa forme n'est celle d'AUCUNE des quatre
     * autres : deux racines indépendantes (le cas de base et l'hypothèse au
     * rang n), un pas qui a besoin des deux, et une conclusion qui ne suit
     * que si le pas ET la base sont posés. Le graphe le dit ; c'est
     * exactement ce que §32 veut rendre visible, et ce qu'une liste
     * ordonnée aurait aplati.
     *
     * L'énoncé est vérifié terme à terme dans presets.test.js : la somme
     * 1 + 2 + … + n vaut bien n(n+1)/2 pour n = 1…200.
     */
    id: 'sumOfFirstIntegers',
    strategy: 'induction',
    steps: [
      { id: 'goal', role: 'given', requires: [] },
      { id: 'base', role: 'observation', requires: ['goal'], branch: 1 },
      { id: 'hypothesis', role: 'given', requires: ['goal'], branch: 2 },
      { id: 'addNext', role: 'conclusion', requires: ['hypothesis'] },
      { id: 'factor', role: 'conclusion', requires: ['addNext'] },
      { id: 'rankUp', role: 'rule', requires: ['factor'] },
      { id: 'conclude', role: 'result', requires: ['base', 'rankUp'] },
    ],
    distractors: ['baseOnly', 'assumeAll'],
  },
  {
    /**
     * Une seconde récurrence, pour que l'aire ne soit pas un exemple unique :
     * l'inégalité 2ⁿ > n, vérifiée dans presets.test.js pour n = 0…40. Son
     * pas de récurrence est une INÉGALITÉ, pas une égalité — c'est la
     * différence qui fait qu'un élève ne recopie pas le premier exemple.
     */
    id: 'powerGreaterThanIndex',
    strategy: 'induction',
    steps: [
      { id: 'goal', role: 'given', requires: [] },
      { id: 'base', role: 'observation', requires: ['goal'], branch: 1 },
      { id: 'hypothesis', role: 'given', requires: ['goal'], branch: 2 },
      { id: 'double', role: 'conclusion', requires: ['hypothesis'] },
      { id: 'compare', role: 'rule', requires: ['double'] },
      { id: 'rankUp', role: 'conclusion', requires: ['compare'] },
      { id: 'conclude', role: 'result', requires: ['base', 'rankUp'] },
    ],
    distractors: ['baseOnly', 'assumeAll'],
  },
  {
    id: 'squarePlusNEven',
    strategy: 'cases',
    steps: [
      { id: 'given', role: 'given', requires: [] },
      { id: 'split', role: 'rule', requires: ['given'] },
      { id: 'evenCase', role: 'conclusion', requires: ['split'], branch: 1 },
      { id: 'oddCase', role: 'conclusion', requires: ['split'], branch: 2 },
      { id: 'conclude', role: 'result', requires: ['evenCase', 'oddCase'] },
    ],
    distractors: ['oneCase'],
  },
]);

export const DEFAULT_PROOF_ID = 'evenSquareIsEven';

/**
 * §28 — LES RÉCURRENCES, dans leur propre liste.
 *
 * La récurrence est une AIRE du laboratoire, pas une stratégie parmi
 * d'autres dans « Démonstration » : sa forme n'est celle d'aucune des quatre
 * autres (deux chemins qui partent du but et se rejoignent seulement dans la
 * conclusion), et le mélanger aux preuves directes aurait laissé croire
 * qu'on choisit sa méthode au hasard. Les deux listes partagent le même
 * moteur (`proofMath.js`) et le même constructeur — c'est le contenu qui
 * diffère, pas la machine.
 */
export const INDUCTIONS = Object.freeze(PROOFS.filter((proof) => proof.strategy === 'induction'));

/** Les preuves de « Démonstration » : toutes SAUF les récurrences. */
export const DIRECT_PROOFS = Object.freeze(PROOFS.filter((proof) => proof.strategy !== 'induction'));

export const DEFAULT_INDUCTION_ID = 'sumOfFirstIntegers';

/**
 * §16, §10 — LES SUITES DE L'ESCALIER : ce que l'exercice ATTEND.
 *
 * Chaque entrée porte la VÉRITÉ de l'exercice (`expected`), jamais la règle
 * de l'élève : les deux doivent venir de sources différentes, sinon toute
 * comparaison serait toujours verte. `presets.test.js` vérifie les premières
 * valeurs à la main, comme pour tout le reste de ce fichier.
 *
 * `answer` n'est PAS montrée : elle sert aux tests (« une règle juste fait
 * verdir toutes les marches ») et au mode « termes cachés » (découvrir la règle) pour ne proposer
 * que des suites qui ont réellement une règle simple. L'interface ne la
 * révèle jamais d'elle-même — §16 veut que l'élève la cherche.
 *
 * `trap` est la règle FAUSSE que l'énoncé rend tentante : celle qui verdit
 * les premières marches puis casse. C'est le cœur de §17.
 */
export const INDUCTION_SEQUENCES = Object.freeze([
  {
    id: 'oddNumbers',
    from: 1,
    count: 6,
    // 3, 5, 7, 9, 11, 13
    expected: (n) => 2 * n + 1,
    answer: '2n + 1',
    // Coïncide en n = 1 et 2 (3, 5) puis donne 9 au lieu de 7.
    trap: '2n + 1 + (n-1)(n-2)',
  },
  {
    id: 'triangular',
    from: 1,
    count: 6,
    // 1, 3, 6, 10, 15, 21 — les nombres triangulaires
    expected: (n) => (n * (n + 1)) / 2,
    answer: 'n(n+1)/2',
    // 1, 3 … puis 7 au lieu de 6.
    trap: 'n^2 - n + 1',
  },
  {
    id: 'squares',
    from: 1,
    count: 6,
    // 1, 4, 9, 16, 25, 36
    expected: (n) => n * n,
    answer: 'n^2',
    // 1, 4 … puis 7 au lieu de 9.
    trap: '3n - 2',
  },
  {
    id: 'powersOfTwo',
    from: 1,
    count: 6,
    // 2, 4, 8, 16, 32, 64
    expected: (n) => 2 ** n,
    answer: '2^n',
    // 2, 4, 8 — TROIS marches justes — puis 14 au lieu de 16.
    // C'est le piège de §17 : réussir trois fois ne prouve rien.
    trap: 'n^2 - n + 2',
  },
  {
    id: 'multiplesOfThree',
    from: 1,
    count: 6,
    // 3, 6, 9, 12, 15, 18
    expected: (n) => 3 * n,
    answer: '3n',
    // 3, 6 … puis 11 au lieu de 9.
    trap: 'n^2 + 2',
  },
]);

export const DEFAULT_SEQUENCE_ID = 'oddNumbers';

/**
 * §28 — CE QUI MARCHE, ET CE QUI NE MARCHE PAS.
 *
 * Une récurrence tient sur deux pieds ; l'élève ne le croit vraiment que
 * lorsqu'il a vu ce qui arrive quand un pied manque. Ces trois cas — vérifiés
 * dans `presets.test.js` — donnent les trois situations :
 *
 *   `works: true`  — les deux moitiés tiennent, l'escalier se monte ;
 *   base fausse    — « n = n+1 » : le PAS est formellement correct (si
 *                    n = n+1 alors n+1 = n+2), mais aucune marche ne porte.
 *                    C'est l'exemple qui montre qu'un pas sans point de
 *                    départ ne prouve RIEN ;
 *   pas faux       — « 2ⁿ > n² » : vrai en 0 et en 1, FAUX en 2, 3 et 4,
 *                    puis vrai de nouveau. Un élève qui vérifie deux cas et
 *                    croit avoir fini se trompe — et l'endroit exact où la
 *                    montée casse est visible sur l'escalier.
 *
 * `breakAt` est la marche où le pas échoue (index 0 = première marche).
 */
export const INDUCTION_CASES = Object.freeze([
  {
    id: 'sumWorks',
    works: true,
    baseHolds: true,
    stepHolds: true,
    checkAt: '1 + 2 + 3 = 6 = 3×4/2',
    // Vérifiable : la somme des n premiers entiers.
    verify: (n) => {
      let sum = 0;
      for (let i = 1; i <= n; i += 1) sum += i;

      return sum === (n * (n + 1)) / 2;
    },
    verifyRange: [1, 60],
    expected: true,
  },
  {
    id: 'noBase',
    works: false,
    baseHolds: false,
    stepHolds: true,
    checkAt: '1 ≠ 2',
    // « n = n+1 » : faux partout, mais son pas se « démontre » formellement.
    verify: (n) => n === n + 1,
    verifyRange: [0, 20],
    expected: false,
  },
  {
    id: 'brokenStep',
    works: false,
    baseHolds: true,
    stepHolds: false,
    breakAt: 2,
    checkAt: '2² = 4 et 2² = 4 : 4 > 4 est faux',
    // « 2ⁿ > n² » : vrai en 0 et 1, faux en 2, 3, 4.
    verify: (n) => 2 ** n > n * n,
    verifyRange: [0, 6],
    expected: false,
  },
]);


/* ── §33 — Fallacy Detector ────────────────────────────────────────────── */

/**
 * Un sophisme n'est pas une preuve mal ordonnée : c'est un ARGUMENT dont la
 * conclusion ne suit pas des prémisses. L'élève nomme la faute (`kind`,
 * parmi FALLACY_KINDS) puis la RÉFUTE : `refutes(value)` accepte TOUT
 * contre-exemple valide, pas seulement celui qu'on a en tête.
 */
export const FALLACY_KINDS = Object.freeze(['invalidConverse', 'affirmingConsequent', 'examplesNotProof']);

export const FALLACIES = Object.freeze([
  {
    // L'argument conclut « x² = 4 ⇒ x = 2 » à partir de « x = 2 ⇒ x² = 4 » :
    // c'est un passage de P ⇒ Q à Q ⇒ P, donc « utiliser la réciproque » (kindHints). Il
    // affirmait autrefois « or x² = 4, donc x = 2 » — de P ⇒ Q et Q vers
    // P, soit « déduire l'hypothèse de la conclusion » selon les propres définitions du laboratoire.
    id: 'squareFourConverse',
    kind: 'invalidConverse',
    domain: INTEGERS,
    variable: 'x',
    refutes: (x) => x * x === 4 && x !== 2,
    counterexample: -2,
  },
  {
    id: 'evenSoMultipleOfFour',
    kind: 'affirmingConsequent',
    domain: { min: 0, max: 30, integer: true, symbol: 'ℕ' },
    refutes: (n) => isEven(n) && n % 4 !== 0,
    counterexample: 6,
  },
  {
    id: 'eulerExamples',
    kind: 'examplesNotProof',
    domain: { min: 0, max: 45, integer: true, symbol: 'ℕ' },
    refutes: (n) => Number.isInteger(n) && n >= 0 && !isPrime(n * n + n + 41),
    counterexample: 40,
  },
]);

/** Le préréglage d'une liste par id, ou le premier (un document ancien ne casse pas). */
export function findPreset(list, id) {
  return list.find((item) => item.id === id) ?? list[0];
}
