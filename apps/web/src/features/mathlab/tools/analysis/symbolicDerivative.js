/**
 * LA DÉRIVÉE SYMBOLIQUE — logique pure, sur l'AST du grapheur.
 *
 * §34 du cahier des charges : « Do not rely on naive string manipulation for
 * mathematical expressions », et « use an appropriate existing mathematical
 * engine already present in the project, or introduce a dependency only after
 * verifying that the existing architecture does not already provide the
 * capability ».
 *
 * L'architecture la fournit. `expressionParser.js` rend déjà un AST propre
 * ({num, var, const, neg, bin, call}) et `expressionEvaluator.js` le compile
 * déjà en fonction. Dériver un AST, c'est vingt lignes de règles connues —
 * il n'y a AUCUNE raison d'ajouter une bibliothèque de calcul formel (mathjs
 * pèse ~170 Ko minifié, nerdamer davantage) pour cela. On ne réécrit ni le
 * lexeur, ni la grammaire, ni l'évaluateur : on ajoute UNE passe AST → AST.
 *
 * ── Pourquoi une dérivée SYMBOLIQUE alors que numericalDerivative.js existe ─
 * Les deux coexistent, et c'est voulu :
 *
 *   - `numericalDerivative.js` MESURE une pente sur n'importe quelle
 *     fonction, même une que l'on ne sait pas dériver. C'est ce qu'il faut
 *     pour le point mobile du grapheur, et c'est honnête : `{ok: false,
 *     reason: 'corner'}` en 0 pour |x|.
 *   - Ici, on veut ÉCRIRE f′(x) à l'élève (§9 : « display f'(x) »), et
 *     `f(x) = x²  →  f′(x) = 2x` ne se lit pas dans un tableau de nombres.
 *     On veut aussi une dérivée SECONDE (§18) sans empiler deux fois l'erreur
 *     numérique, et des points critiques exacts (§17).
 *
 * La règle que l'instrument tient : quand la forme symbolique existe, elle
 * fait foi et elle s'affiche ; sinon on retombe sur la mesure numérique, et
 * l'interface DIT laquelle des deux elle montre (§35 : « If a result is
 * numerically approximated, clearly distinguish it from an exact value »).
 *
 * ── Ce que ce module ne fait pas ─────────────────────────────────────────
 * Ce n'est toujours pas un système de calcul formel. Pas d'intégration
 * symbolique, pas de résolution d'équations, pas de factorisation. La
 * simplification est LOCALE (0 + u → u, 1·u → u, u^1 → u, et l'arithmétique
 * des constantes) : assez pour que (x²)′ s'écrive `2x` et non
 * `2·x^1 + 0·…`, jamais assez pour prétendre réordonner une expression.
 */

const NUM = (value) => ({ type: 'num', value });
const ZERO = NUM(0);
const ONE = NUM(1);

const isNum = (node, value) => node.type === 'num' && node.value === value;
const isConstantNode = (node) => node.type === 'num';

/** u + v, simplifié localement. */
function add(left, right) {
  if (isNum(left, 0)) return right;
  if (isNum(right, 0)) return left;
  if (isConstantNode(left) && isConstantNode(right)) return NUM(left.value + right.value);
  if (right.type === 'neg') return sub(left, right.arg);

  return { type: 'bin', op: '+', left, right };
}

/** u − v, simplifié localement. */
function sub(left, right) {
  if (isNum(right, 0)) return left;
  if (isNum(left, 0)) return neg(right);
  if (isConstantNode(left) && isConstantNode(right)) return NUM(left.value - right.value);

  return { type: 'bin', op: '-', left, right };
}

/**
 * u · v, simplifié localement.
 *
 * La règle de la puissance engendre `3 · (4 · x³)` : deux constantes séparées
 * par une parenthèse. Non repliées, elles s'impriment `34x^3` — que l'élève
 * lit « trente-quatre ». On REMONTE donc la constante d'un produit imbriqué
 * pour la fondre dans celle de gauche : 3·(4·x³) → 12x³. C'est la seule
 * réécriture non locale du module, et elle est là parce qu'un nombre faux à
 * l'écran est un contresens, pas une inélégance.
 */
function mul(left, right) {
  if (isNum(left, 0) || isNum(right, 0)) return ZERO;
  if (isNum(left, 1)) return right;
  if (isNum(right, 1)) return left;
  if (isConstantNode(left) && isConstantNode(right)) return NUM(left.value * right.value);

  // c₁ · (c₂ · u) → (c₁c₂) · u
  if (isConstantNode(left) && right.type === 'bin' && right.op === '*' && isConstantNode(right.left)) {
    return mul(NUM(left.value * right.left.value), right.right);
  }
  // (c₁ · u) · c₂ → (c₁c₂) · u
  if (isConstantNode(right) && left.type === 'bin' && left.op === '*' && isConstantNode(left.left)) {
    return mul(NUM(left.left.value * right.value), left.right);
  }
  // Une constante s'écrit DEVANT : `2x`, jamais `x·2` — c'est l'écriture du manuel.
  if (isConstantNode(right) && !isConstantNode(left)) return mul(right, left);

  return { type: 'bin', op: '*', left, right };
}

/** u / v, simplifié localement. */
function div(left, right) {
  if (isNum(left, 0)) return ZERO;
  if (isNum(right, 1)) return left;

  return { type: 'bin', op: '/', left, right };
}

/**
 * uᵛ, simplifié localement.
 *
 * `(u^a)^b` avec a et b constants devient `u^(ab)` : sans cela la dérivée de
 * `1/x²` s'imprimait `x^2^2`, une écriture AMBIGUË (les puissances sont
 * associatives à droite dans la grammaire du grapheur, donc `x^(2^2)` = x⁴ —
 * pas ce qu'on voulait dire).
 */
function pow(base, exponent) {
  if (isNum(exponent, 0)) return ONE;
  if (isNum(exponent, 1)) return base;
  if (isConstantNode(exponent) && base.type === 'bin' && base.op === '^' && isConstantNode(base.right)) {
    return pow(base.left, NUM(base.right.value * exponent.value));
  }

  return { type: 'bin', op: '^', left: base, right: exponent };
}

function neg(node) {
  if (isNum(node, 0)) return ZERO;
  if (node.type === 'num') return NUM(-node.value);
  if (node.type === 'neg') return node.arg;

  return { type: 'neg', arg: node };
}

const call = (name, ...args) => ({ type: 'call', name, args });

const CONSTANT_VALUES = { pi: Math.PI, e: Math.E };

/**
 * La VALEUR d'un sous-arbre sans variable, ou null s'il n'est pas constant
 * ou si son évaluation n'est pas un nombre fini. Sert à juger une base
 * d'exponentielle, qui doit être strictement positive.
 */
function constantValue(node) {
  switch (node?.type) {
    case 'num': return Number.isFinite(node.value) ? node.value : null;
    case 'const': return CONSTANT_VALUES[node.name] ?? null;
    case 'neg': {
      const inner = constantValue(node.arg);

      return inner === null ? null : -inner;
    }
    case 'bin': {
      const left = constantValue(node.left);
      const right = constantValue(node.right);
      if (left === null || right === null) return null;
      const value = node.op === '+' ? left + right
        : node.op === '-' ? left - right
          : node.op === '*' ? left * right
            : node.op === '/' ? (right === 0 ? NaN : left / right)
              : node.op === '^' ? left ** right
                : NaN;

      return Number.isFinite(value) ? value : null;
    }
    default: return null;
  }
}

/**
 * L'expression dépend-elle de `variable` ? Une sous-expression constante se
 * dérive en 0 d'un coup, ce qui évite d'engendrer des arbres de zéros.
 */
export function dependsOn(node, variable = 'x') {
  switch (node?.type) {
    case 'var': return node.name === variable;
    case 'neg': return dependsOn(node.arg, variable);
    case 'bin': return dependsOn(node.left, variable) || dependsOn(node.right, variable);
    case 'call': return node.args.some((arg) => dependsOn(arg, variable));
    default: return false;
  }
}

/**
 * d/dx d'un AST → un AST.
 *
 * Rend `null` quand la règle n'est pas connue — un exposant VARIABLE (`x^x`,
 * `2^x`) demande la dérivée logarithmique, qui sort du sous-ensemble que
 * l'instrument prétend savoir écrire. L'appelant retombe alors sur la mesure
 * numérique, et le dit.
 *
 * @param {object} node          un AST de expressionParser.js
 * @param {string} [variable]    la variable de dérivation ('x')
 * @returns {object | null}
 */
export function differentiate(node, variable = 'x') {
  if (!node || typeof node !== 'object') return null;
  if (!dependsOn(node, variable)) return ZERO;

  switch (node.type) {
    case 'num':
    case 'const':
      return ZERO;

    case 'var':
      return node.name === variable ? ONE : ZERO;

    case 'neg': {
      const inner = differentiate(node.arg, variable);

      return inner && neg(inner);
    }

    case 'bin':
      return differentiateBinary(node, variable);

    case 'call':
      return differentiateCall(node, variable);

    default:
      return null;
  }
}

function differentiateBinary(node, variable) {
  const { op, left, right } = node;
  const dLeft = differentiate(left, variable);
  const dRight = differentiate(right, variable);
  if (dLeft === null || dRight === null) return null;

  switch (op) {
    case '+': return add(dLeft, dRight);
    case '-': return sub(dLeft, dRight);

    // (uv)′ = u′v + uv′
    case '*': return add(mul(dLeft, right), mul(left, dRight));

    // (u/v)′ = (u′v − uv′) / v²
    case '/': return div(sub(mul(dLeft, right), mul(left, dRight)), pow(right, NUM(2)));

    case '^': {
      // Le cas du programme et du lycée : un exposant CONSTANT.
      // (uⁿ)′ = n·uⁿ⁻¹·u′
      if (!dependsOn(right, variable)) {
        if (right.type !== 'num') {
          // Un exposant constant mais non littéral (`x^(2+1)`, `x^pi`) : la
          // règle vaut encore, l'exposant−1 s'écrit comme une soustraction.
          return mul(mul(right, pow(left, sub(right, ONE))), dLeft);
        }

        return mul(mul(right, pow(left, NUM(right.value - 1))), dLeft);
      }
      /**
       * Base CONSTANTE, exposant variable : (a^u)′ = a^u · ln a · u′.
       *
       * C'est `e^x` — la fonction exponentielle telle que l'élève l'écrit au
       * clavier, et l'un des préréglages de §37. La refuser aurait forcé
       * l'exponentielle à retomber sur la mesure numérique alors que sa
       * dérivée est la plus simple de toutes.
       */
      if (!dependsOn(left, variable)) {
        /**
         * a ≤ 0 : ln a n'existe pas, et aᵡ n'est pas une fonction sur un
         * intervalle. On ne prétend pas savoir.
         *
         * La base n'est pas toujours un littéral : `(0−2)^x` est un nœud
         * `bin`. On l'ÉVALUE donc (elle est constante, par hypothèse) plutôt
         * que de regarder sa forme — sinon la dérivée s'écrivait `ln(0 − 2)`,
         * c'est-à-dire ln(−2).
         */
        const base = constantValue(left);
        if (base === null || base <= 0) return null;
        const lnBase = left.type === 'const' && left.name === 'e' ? ONE : call('ln', left);

        return mul(mul(node, lnBase), dRight);
      }

      // (uᵛ)ʹ avec u ET v variables : la dérivée logarithmique sort du
      // sous-ensemble que l'instrument prétend savoir ÉCRIRE — on le dit
      // franchement, et l'appelant mesure numériquement.
      return null;
    }

    default:
      return null;
  }
}

function differentiateCall(node, variable) {
  const [arg] = node.args;
  // La racine n-ième `\sqrt[n]{u}` porte son degré en premier argument.
  if (node.name === 'root') {
    const [degree, value] = node.args;
    if (dependsOn(degree, variable)) return null;
    const dValue = differentiate(value, variable);
    if (dValue === null) return null;

    // (u^(1/n))′ = (1/n)·u^(1/n − 1)·u′
    const inverse = div(ONE, degree);

    return mul(mul(inverse, pow(value, sub(inverse, ONE))), dValue);
  }

  const dArg = differentiate(arg, variable);
  if (dArg === null) return null;

  switch (node.name) {
    case 'sin': return mul(call('cos', arg), dArg);
    case 'cos': return neg(mul(call('sin', arg), dArg));
    // (tan u)′ = u′ / cos²u — on l'écrit ainsi plutôt qu'en 1 + tan²,
    // parce que le dénominateur MONTRE où la dérivée n'existe pas.
    case 'tan': return div(dArg, pow(call('cos', arg), NUM(2)));
    // (√u)′ = u′ / (2√u)
    case 'sqrt': return div(dArg, mul(NUM(2), call('sqrt', arg)));
    case 'exp': return mul(call('exp', arg), dArg);
    case 'ln': return div(dArg, arg);
    // (log₁₀ u)′ = u′ / (u·ln 10)
    case 'log': return div(dArg, mul(arg, call('ln', NUM(10))));
    // |u|′ = u′·u/|u| : vraie partout sauf où u = 0, et l'évaluation y rend
    // NaN d'elle-même — ce que le traceur coupe, et ce que l'inspecteur dit.
    case 'abs': return mul(dArg, div(arg, call('abs', arg)));
    default: return null;
  }
}

/**
 * La dérivée n-ième, ou null dès qu'un ordre échoue.
 *
 * @param {object} ast
 * @param {number} order
 * @param {string} [variable]
 */
export function differentiateN(ast, order, variable = 'x') {
  let current = ast;
  for (let k = 0; k < order; k += 1) {
    current = differentiate(current, variable);
    if (current === null) return null;
  }

  return current;
}
