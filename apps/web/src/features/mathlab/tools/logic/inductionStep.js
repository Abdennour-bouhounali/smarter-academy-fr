/**
 * L'HÉRÉDITÉ — le passage de P(n) à P(n+1), en étapes STRUCTURÉES.
 *
 * ── Ce module ne démontre rien tout seul, et c'est délibéré (§29) ────────
 *
 * Il y a une différence énorme entre évaluer u₄ = 17/9 — facile, sûr, c'est
 * `inductionModel.js` — et démontrer que ¾(uₙ − vₙ) − ½ = −2 sachant que
 * uₙ − vₙ = −2. La seconde chose est du calcul formel, et le moteur
 * symbolique de la plateforme (`symbolic/`, une façade sur Nerdamer) n'est
 * pas assez fiable pour porter une leçon : il lui arrive de ne pas rendre la
 * main et de répondre par la question. La note `nerdamer-verify-before-showing`
 * de ce dépôt existe pour cette raison.
 *
 * On ne construit donc PAS un faux prouveur. On fait ce que §29 recommande :
 * des transformations STRUCTURÉES, portées par l'exercice, que l'élève
 * choisit dans l'ordre — et dont chacune est VÉRIFIÉE numériquement avant
 * d'être montrée juste.
 *
 * ── La vérification numérique, et ce qu'elle vaut ────────────────────────
 * Une étape annonce « de cette expression on passe à celle-là ». On teste
 * l'égalité des deux sur un échantillon de rangs. Cela ne DÉMONTRE pas
 * l'étape — et l'écran ne le prétend jamais. Cela attrape en revanche une
 * étape FAUSSE, ce qui est le vrai risque quand on écrit un exercice : une
 * étape erronée ne peut pas arriver jusqu'à l'élève.
 *
 * La démonstration, elle, reste celle que l'élève lit et ordonne. C'est
 * exactement le contrat de `ProofArea` (§26-32) appliqué à la récurrence.
 */

import {
  buildContext, compileTerm, valueAt, compare, nextRankName, RELATIONS,
} from './inductionModel.js';

/** Les rangs sur lesquels une étape est vérifiée. Petits : on reste exact. */
const VERIFY_RANGE = Object.freeze([0, 1, 2, 3, 4, 5]);

/**
 * @typedef {object} StepTransform
 * @property {string} id
 * @property {string} from    l'expression de départ, en variables de suites
 * @property {string} to      l'expression d'arrivée
 * @property {string} [relation]  '=' par défaut. Une chaîne d'INÉGALITÉ
 *   (« uₙ < 3 donc ⅓uₙ < 1 ») a des maillons qui ne sont pas des égalités :
 *   `relation: '<'` dit que `from` doit rester STRICTEMENT INFÉRIEUR à `to`
 *   sur l'échantillon. Sans cela, un maillon juste serait refusé comme faux.
 * @property {string} [hypothesis]  ce qu'on a le droit d'utiliser (l'HR)
 */

/**
 * Vérifie qu'une transformation est VRAIE, numériquement, sur l'exercice.
 *
 * @returns {{ok: true, checked: number} | {ok: false, reason: string, at?: number}}
 *
 * `ok: false` veut dire « cette étape est fausse ou invérifiable » — pas
 * « l'élève s'est trompé ». C'est un garde-fou d'AUTEUR : il tourne dans les
 * tests, pour qu'aucun exercice faux ne soit publié.
 */
export function verifyTransform(transform, specs, range = VERIFY_RANGE) {
  const built = buildContext(specs);
  if (!built.ok) return { ok: false, reason: 'invalidRule' };
  const { context } = built;
  const bound = [...context.names, 'n'];

  const from = compileTerm(transform.from, bound);
  if (!from.ok) return { ok: false, reason: 'syntax' };
  const to = compileTerm(transform.to, bound);
  if (!to.ok) return { ok: false, reason: 'syntax' };

  const relation = RELATIONS.includes(transform.relation) ? transform.relation : '=';

  let checked = 0;
  for (const n of range) {
    const scope = scopeAt(context, n, [...from.uses, ...to.uses]);
    if (!scope.ok) continue; // un rang hors domaine ne réfute rien
    const left = from.evaluate(scope.value);
    const right = to.evaluate(scope.value);
    if (!Number.isFinite(left) || !Number.isFinite(right)) continue;
    if (!compare(left, relation, right)) return { ok: false, reason: 'mismatch', at: n };
    checked += 1;
  }

  // Une étape qu'on n'a pas pu tester une seule fois n'est pas « vérifiée ».
  if (checked === 0) return { ok: false, reason: 'unverifiable' };

  return { ok: true, checked };
}

/**
 * Le scope d'un rang : chaque suite nommée, plus `n` et les rangs suivants.
 *
 * `U` est uₙ₊₁ (cf. `nextRankName`) : c'est ce qui permet à une étape
 * d'écrire « uₙ₊₁ = ¾uₙ − ½ » et d'être vérifiée des deux côtés.
 */
function scopeAt(context, n, names) {
  const scope = { n };
  const nextOf = new Map(context.names.map((name) => [nextRankName(name), name]));

  for (const raw of names) {
    if (raw === 'n') continue;
    const base = nextOf.get(raw);
    const name = base ?? raw;
    if (!context.sequences.has(name)) return { ok: false };
    const resolved = valueAt(context, name, base ? n + 1 : n);
    if (!resolved.ok) return { ok: false };
    scope[raw] = resolved.value;
  }

  return { ok: true, value: scope };
}

/**
 * §26, §28 — la CHAÎNE d'hérédité d'un exercice, prête à être ordonnée par
 * l'élève. Chaque maillon est vérifié ; un maillon faux fait échouer la
 * construction entière plutôt que d'atteindre l'écran.
 *
 * @returns {{ok: true, chain: object[]} | {ok: false, error: object}}
 */
export function buildChain(transforms, specs) {
  const list = Array.isArray(transforms) ? transforms : [];
  if (list.length === 0) return { ok: false, error: { code: 'missing' } };

  const chain = [];
  for (const transform of list) {
    const verified = verifyTransform(transform, specs);
    if (!verified.ok) {
      return { ok: false, error: { code: verified.reason, id: transform.id, at: verified.at } };
    }
    chain.push({ ...transform, verified: true, checked: verified.checked });
  }

  return { ok: true, chain };
}

/**
 * L'élève a posé les étapes dans un ordre. Est-il le bon ?
 *
 * On ne compare pas à une seule solution « officielle » : une étape est à sa
 * place dès lors qu'elle S'ACCROCHE à la précédente. C'est le même principe
 * que `proofMath.js` — un GRAPHE, pas une liste figée.
 *
 * ── Deux façons de s'accrocher, parce qu'il y a deux sortes de chaînes ───
 *
 *   ÉGALITÉ   wₙ₊₁ = uₙ₊₁ − vₙ₊₁ = (¾uₙ − ½) − ¾vₙ = …
 *             chaque maillon REPART de là où le précédent est ARRIVÉ,
 *             donc `previous.to` doit valoir `current.from`.
 *
 *   INÉGALITÉ uₙ < 3  ⇒  ⅓uₙ < 1  ⇒  ⅓uₙ + 2 < 3
 *             ici ce sont les MEMBRES DE GAUCHE qui se transforment, et
 *             c'est `previous.from` qui doit se retrouver dans
 *             `current.from` : on reconnaît l'expression précédente à
 *             l'intérieur de la nouvelle (⅓·**uₙ**, puis **⅓uₙ** + 2).
 *
 * Exiger le raccord d'égalité sur une chaîne d'inégalité déclarerait faux
 * un enchaînement parfaitement juste — c'est exactement ce que la QA
 * navigateur a attrapé sur `boundedAffine`.
 *
 * @returns {{ok: boolean, firstWrong: number|null}}
 */
export function checkOrder(chain, order) {
  const placed = Array.isArray(order) ? order : [];
  for (let i = 0; i < placed.length; i += 1) {
    const current = chain.find((link) => link.id === placed[i]);
    if (!current) return { ok: false, firstWrong: i };
    if (i === 0) continue;
    const previous = chain.find((link) => link.id === placed[i - 1]);
    if (!previous || !follows(previous, current)) return { ok: false, firstWrong: i };
  }

  return { ok: placed.length === chain.length, firstWrong: null };
}

/** `current` s'accroche-t-il à `previous` ? */
function follows(previous, current) {
  const from = normalize(current.from);
  // Le raccord d'égalité : on repart de là où l'on est arrivé.
  if (normalize(previous.to) === from) return true;

  // Le raccord d'inégalité : le membre de gauche précédent se retrouve DANS
  // le nouveau. `contains` sur une écriture normalisée suffit ici, parce que
  // les maillons d'un exercice sont écrits par un auteur et vérifiés
  // numériquement : on reconnaît une continuation, on ne prouve pas une
  // inclusion syntaxique.
  const previousFrom = normalize(previous.from);

  return previousFrom.length > 0 && from.includes(previousFrom);
}

/**
 * On enlève les espaces, et RIEN d'autre : surtout pas la casse, puisque
 * `U` est uₙ₊₁ et `u` est uₙ. Les confondre ferait passer pour « enchaînées »
 * deux étapes qui parlent de rangs différents.
 */
function normalize(text) {
  return String(text ?? '').replace(/\s+/g, '');
}

/**
 * §25 — ce qu'on a le droit de conclure. Jamais « prouvé » depuis
 * l'escalier seul : il faut la base ET l'hérédité.
 *
 *   'none'        rien n'est établi ;
 *   'baseOnly'    P(n₀) vérifiée, l'hérédité pas encore construite ;
 *   'stepOnly'    l'hérédité construite, mais aucune base — le cas « n = n+1 » ;
 *   'complete'    les deux pieds. LÀ, et seulement là, c'est une récurrence.
 */
export function proofVerdict({ baseHolds, stepComplete }) {
  if (baseHolds && stepComplete) return 'complete';
  if (baseHolds) return 'baseOnly';
  if (stepComplete) return 'stepOnly';

  return 'none';
}

