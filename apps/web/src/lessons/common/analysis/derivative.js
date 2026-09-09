/**
 * Noyau d'analyse — taux de variation, nombre dérivé, tangente.
 *
 * Fonctions PURES, sans JSX ni état, partagées par les leçons de Première qui
 * parlent de pente locale : les trois leçons de dérivation et les deux
 * d'exponentielle. C'est le précédent `common/stats` : un utilitaire
 * mathématique se partage, un LABORATOIRE se copie et s'adapte.
 *
 * RÈGLE DE JUSTESSE, load-bearing :
 *   `numericDerivative` est une APPROXIMATION. Elle sert à TRACER une tangente
 *   quand la dérivée exacte n'est pas fournie, jamais à juger la réponse d'un
 *   élève. Une leçon qui demande f′(1) écrit la valeur exacte en littéral et
 *   compare à ce littéral. Comparer une saisie d'élève à une différence finie,
 *   c'est déclarer fausse une réponse juste au premier flottant qui dérape.
 */

/**
 * Taux de variation (pente de la sécante) entre a et a + h.
 * C'est la définition, écrite telle quelle : montée / avancée.
 * @returns {number} NaN si h vaut 0 — l'appelant décide quoi en montrer.
 */
export function secantSlope(f, a, h) {
  if (h === 0) return NaN;
  return (f(a + h) - f(a)) / h;
}

/**
 * Montée et avancée entre a et a + h — le triangle dessiné sous la sécante.
 * Rendu séparément de la pente parce que la leçon montre les DEUX nombres :
 * la conception erronée « le taux, c'est f(b) − f(a) » se combat en gardant
 * l'avancée visible à côté de la montée.
 */
export function riseRun(f, a, h) {
  const run = h;
  const rise = f(a + h) - f(a);
  return { run, rise, slope: run === 0 ? NaN : rise / run };
}

/**
 * Nombre dérivé approché par différence CENTRÉE, d'ordre 2 en h.
 * Centrée et non décentrée : l'erreur de troncature est en h², pas en h, donc
 * une tangente tracée ne passe pas visiblement à côté de son point de contact.
 *
 * PAS PAR DÉFAUT 1e-4, ET NON 1e-6. Une différence centrée cumule deux erreurs
 * de sens contraire : la troncature décroît en h², l'annulation catastrophique
 * croît en ε/h. Leur somme est minimale vers h = ε^(1/3) ≈ 6e-6 pour des
 * valeurs d'ordre 1, mais l'annulation domine dès que f(a) est grand devant h.
 * Mesuré sur x ↦ −2x + 7 en a = 5 : h = 1e-6 donne 2,8e-10 d'erreur, h = 1e-4
 * en donne 4,7e-12 — soixante fois mieux. Le tracé n'a besoin que de quelques
 * décimales, l'annulation est le seul risque réel : on prend donc le pas qui
 * s'en éloigne.
 * POUR LE DESSIN UNIQUEMENT (voir l'en-tête).
 */
export function numericDerivative(f, a, h = 1e-4) {
  return (f(a + h) - f(a - h)) / (2 * h);
}

/**
 * La tangente à la courbe de f au point d'abscisse a, sous la forme affine
 * { a: pente, b: ordonnée à l'origine } — directement consommable par
 * `CoordPlane.functions`, qui coupe exactement une affine au cadre.
 *
 * @param {(x:number)=>number} f
 * @param {number} a          abscisse du point de contact
 * @param {number} [fPrime]   la dérivée EXACTE en a, quand la leçon la connaît.
 *                            Omise, on retombe sur l'approximation numérique.
 */
export function tangentLine(f, a, fPrime) {
  const slope = Number.isFinite(fPrime) ? fPrime : numericDerivative(f, a);
  const fa = f(a);
  // y = m(x − a) + f(a) = m·x + (f(a) − m·a)
  return { a: slope, b: fa - slope * a };
}

/**
 * La même tangente à partir des seuls nombres, sans fonction : la forme dont
 * l'élève dispose quand il construit l'équation lui-même.
 */
export function tangentAt(fPrime, a, fa) {
  return { a: fPrime, b: fa - fPrime * a };
}

/** La sécante (AB) avec A(a ; f(a)) et B(a+h ; f(a+h)), même forme affine. */
export function secantLine(f, a, h) {
  const slope = secantSlope(f, a, h);
  return { a: slope, b: f(a) - slope * a };
}

/**
 * Écrit l'équation d'une droite affine en français scolaire : « y = 2x − 1 »,
 * « y = −x + 3 », « y = 4 ». Les nombres passent par le format décimal
 * français (virgule), et les cas 0 / 1 / −1 sont traités comme au tableau.
 */
export function lineEquation({ a, b }, format = (n) => String(n)) {
  const parts = [];
  if (a !== 0) {
    if (a === 1) parts.push('x');
    else if (a === -1) parts.push('−x');
    else parts.push(`${format(a)}x`);
  }
  if (b !== 0 || parts.length === 0) {
    if (parts.length === 0) parts.push(format(b));
    else parts.push(b > 0 ? `+ ${format(b)}` : `− ${format(Math.abs(b))}`);
  }
  return `y = ${parts.join(' ')}`;
}

/**
 * Tableau de signes d'une fonction sur une étendue, par balayage : les
 * intervalles où f garde un signe constant, séparés par ses zéros approchés.
 * Consommé par la leçon « variations et optimisation » pour dériver le tableau
 * du SIGNE de f′ plutôt que de l'écrire à la main.
 */
export function signTable(f, { xMin, xMax }, samples = 400) {
  const rows = [];
  const step = (xMax - xMin) / samples;
  let curSign = Math.sign(f(xMin));
  let start = xMin;
  for (let i = 1; i <= samples; i += 1) {
    const x = xMin + i * step;
    const s = Math.sign(f(x));
    if (s !== 0 && curSign !== 0 && s !== curSign) {
      // Zéro encadré : dichotomie pour le situer proprement.
      let lo = x - step;
      let hi = x;
      for (let k = 0; k < 60; k += 1) {
        const mid = (lo + hi) / 2;
        if (Math.sign(f(mid)) === curSign) lo = mid;
        else hi = mid;
      }
      const zero = (lo + hi) / 2;
      rows.push({ from: start, to: zero, sign: curSign });
      start = zero;
      curSign = s;
    } else if (curSign === 0 && s !== 0) {
      curSign = s;
    }
  }
  rows.push({ from: start, to: xMax, sign: curSign });
  return rows;
}
