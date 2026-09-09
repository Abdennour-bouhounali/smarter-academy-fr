/**
 * Noyau des SUITES NUMÉRIQUES — génération, reconnaissance, variation.
 *
 * Fonctions PURES, sans JSX ni état, partagées par les leçons de Première qui
 * parlent de suites (« Suites : générer et reconnaître », « Suites : calculer
 * et modéliser », et les modélisations d'évolution). Même précédent que
 * `common/analysis/derivative.js` et `common/stats` : un utilitaire
 * mathématique se partage, un LABORATOIRE se copie et s'adapte.
 *
 * ══ CONVENTION D'INDEXATION, load-bearing ══
 *
 *   u0 EST LE PREMIER TERME, PARTOUT DANS CE MODULE.
 *
 * `terms(gen, n)` rend n + 1 valeurs : u0, u1, …, un — l'indice d'un élément
 * du tableau EST le rang du terme. `nthArithmetic(u0, r, n)` vaut u0 + n·r et
 * `nthGeometric(u0, q, n)` vaut u0·qⁿ, cohérents avec ce tableau :
 *
 *     terms(arithmetic(u0, r), n)[k] === nthArithmetic(u0, r, k)   pour tout k ≤ n
 *
 * Une leçon qui préfère parler de u1 comme premier terme DÉCALE elle-même
 * (u1 = u0 + r, ou terms(...).slice(1)) ; ce module ne connaît qu'une seule
 * convention, parce que deux conventions dans le même fichier finissent par se
 * mélanger et par produire un terme de trop ou de moins dans une pile.
 * `sequences.test.js` teste explicitement les DEUX lectures en croisé.
 *
 * PÉRIMÈTRE : pas de somme de termes, pas de limite ni de convergence — ce
 * sont les leçons suivantes.
 */

/** Tolérance des comparaisons de flottants : 0,1 + 0,2 ne vaut pas 0,3. */
const EPS = 1e-9;
const proche = (a, b, eps = EPS) => Math.abs(a - b) <= eps * Math.max(1, Math.abs(a), Math.abs(b));

/**
 * Générateur d'une suite ARITHMÉTIQUE de premier terme u0 et de raison r :
 * u(n+1) = u(n) + r, donc u(n) = u0 + n·r.
 * @returns {(n:number)=>number} le terme de rang n (n ≥ 0)
 */
export function arithmetic(u0, r) {
  return (n) => u0 + n * r;
}

/**
 * Générateur d'une suite GÉOMÉTRIQUE de premier terme u0 et de raison q :
 * u(n+1) = u(n) × q, donc u(n) = u0 × qⁿ.
 * @returns {(n:number)=>number} le terme de rang n (n ≥ 0)
 */
export function geometric(u0, q) {
  return (n) => u0 * q ** n;
}

/**
 * Les n + 1 premiers termes d'une suite, du rang 0 au rang n INCLUS.
 * L'INDICE DU TABLEAU EST LE RANG : `terms(gen, 5)[3]` est u3, et le tableau a
 * six éléments. C'est la convention qui rend une pile de termes affichable
 * telle quelle, sans décalage silencieux.
 *
 * @param {(n:number)=>number} gen
 * @param {number} n rang du DERNIER terme voulu (n ≥ 0)
 */
export function terms(gen, n) {
  const out = [];
  for (let k = 0; k <= n; k += 1) out.push(gen(k));
  return out;
}

/** Terme de rang n d'une suite arithmétique : u0 + n·r. */
export function nthArithmetic(u0, r, n) {
  return u0 + n * r;
}

/** Terme de rang n d'une suite géométrique : u0 × qⁿ. */
export function nthGeometric(u0, q, n) {
  return u0 * q ** n;
}

/**
 * Les écarts successifs u(n+1) − u(n) — ce que le laboratoire dessine en
 * accolade à côté de la pile additive.
 * @returns {number[]} de longueur terms.length − 1
 */
export function differences(list) {
  const out = [];
  for (let i = 1; i < list.length; i += 1) out.push(list[i] - list[i - 1]);
  return out;
}

/**
 * Les rapports successifs u(n+1) / u(n) — l'accolade de la pile multiplicative.
 * Un terme nul rend NaN pour son rapport : l'appelant décide quoi en montrer,
 * plutôt que de recevoir une Infinity qui atteindrait le SVG.
 */
export function ratios(list) {
  const out = [];
  for (let i = 1; i < list.length; i += 1) out.push(list[i - 1] === 0 ? NaN : list[i] / list[i - 1]);
  return out;
}

/**
 * Reconnaître la nature d'une suite à partir de ses premiers termes.
 *
 * ORDRE DE DÉCISION, load-bearing : l'écart constant est testé AVANT le
 * rapport constant. Une suite CONSTANTE non nulle (2, 2, 2, 2) est à la fois
 * arithmétique de raison 0 et géométrique de raison 1 : elle est donc classée
 * `arithmetique` avec raison 0, jamais « ni », et jamais les deux à la fois —
 * un `kind` ambigu obligerait chaque appelant à retrancher le même cas
 * particulier.
 *
 * La suite nulle (0, 0, 0) est arithmétique de raison 0 ; son rapport n'a pas
 * de sens (0/0) et n'est pas cherché.
 *
 * @param {number[]} list au moins 3 termes — en dessous, deux termes ne
 *   permettent pas de distinguer (toute paire est à la fois arithmétique et
 *   géométrique), et la fonction rend `{ kind: 'indetermine' }`.
 * @returns {{kind:'arithmetique'|'geometrique'|'ni'|'indetermine', raison:number|null}}
 */
export function detectKind(list, eps = 1e-9) {
  if (!Array.isArray(list) || list.length < 3) return { kind: 'indetermine', raison: null };

  const d = differences(list);
  if (d.every((x) => proche(x, d[0], eps))) return { kind: 'arithmetique', raison: d[0] };

  if (list.every((x) => x !== 0)) {
    const q = ratios(list);
    if (q.every((x) => proche(x, q[0], eps))) return { kind: 'geometrique', raison: q[0] };
  }

  return { kind: 'ni', raison: null };
}

/**
 * Le sens de variation d'une suite, lu sur ses termes.
 *
 * `'croissante'` / `'decroissante'` sont STRICTS ; une suite constante rend
 * `'constante'` ; une suite qui monte puis descend rend `'ni'`. La distinction
 * compte pédagogiquement : une suite géométrique de raison 1 est constante, et
 * dire d'elle qu'elle « croît » serait faux.
 *
 * @returns {{sens:'croissante'|'decroissante'|'constante'|'ni', ecarts:number[]}}
 */
export function variationSense(list, eps = 1e-9) {
  const ecarts = differences(list);
  if (ecarts.length === 0) return { sens: 'constante', ecarts };
  const positifs = ecarts.every((x) => x > eps);
  const negatifs = ecarts.every((x) => x < -eps);
  const nuls = ecarts.every((x) => Math.abs(x) <= eps);
  if (nuls) return { sens: 'constante', ecarts };
  if (positifs) return { sens: 'croissante', ecarts };
  if (negatifs) return { sens: 'decroissante', ecarts };
  return { sens: 'ni', ecarts };
}

/**
 * La raison r qui fait coïncider une suite arithmétique et une suite
 * géométrique sur leurs DEUX premiers termes, à partir du même u0 :
 *   u0 + r = u0·q  ⟺  r = u0·(q − 1).
 *
 * IL N'EN EXISTE PAS POUR TROIS TERMES, sauf q = 1. La démonstration tient en
 * deux lignes : si u0 + 2r = u0·q² et u0 + r = u0·q, alors en retranchant
 * r = u0·q(q − 1), et en comparant à r = u0·(q − 1) il vient u0(q−1)(q−1) = 0,
 * donc q = 1 (ou u0 = 0). Autrement dit : deux machines réglées au même
 * premier terme et au même deuxième terme s'écartent NÉCESSAIREMENT au
 * troisième, sauf si elles ne bougent pas. C'est l'aha du laboratoire, et
 * `sequences.test.js` le vérifie par balayage plutôt que de le croire.
 */
export function raisonQuiCoincide(u0, q) {
  return u0 * (q - 1);
}
