/**
 * La MATHÉMATIQUE du مختبر المنطق والبرهان — logique pure, sans React,
 * testée à part (logicMath.test.js).
 *
 * §48 du cahier des charges : « This tool is highly sensitive to logical
 * correctness. » Toute vérité affichée à l'élève — une case de table de
 * vérité, un verdict d'implication, une région de la droite, une négation —
 * passe par UNE fonction d'ici, jamais par une condition éparpillée dans un
 * composant. C'est la règle « une seule source de vérité » de numberLab
 * (MATH_LAB.md §5l), appliquée à la vérité elle-même.
 *
 * ── Trois valeurs, pas deux ──────────────────────────────────────────────
 * Une case de table non réglée vaut `null` et donne `null` : jamais une
 * devinette. Un prédicat évalué hors de son domaine donne `undefined`
 * (`evaluate`) et n'est compté NI vrai NI faux (§6).
 */

export const CONNECTORS = Object.freeze(['not', 'and', 'or', 'implies', 'iff']);

export const CONNECTOR_SYMBOLS = Object.freeze({
  not: '¬', and: '∧', or: '∨', implies: '⇒', iff: '⇔',
});

/** Une case de table de vérité. Totale sur {V, F}² ; `null` si une entrée manque. */
export function evalConnector(connector, p, q = null) {
  if (connector === 'not') return p == null ? null : !p;
  if (p == null || q == null) return null;

  switch (connector) {
    case 'and': return p && q;
    case 'or': return p || q;
    case 'implies': return !p || q;
    case 'iff': return p === q;
    default: return null;
  }
}

/** Les quatre lignes de P et Q, dans l'ordre des manuels : VV · VF · FV · FF. */
export const TRUTH_ROWS = Object.freeze([
  Object.freeze({ p: true, q: true }),
  Object.freeze({ p: true, q: false }),
  Object.freeze({ p: false, q: true }),
  Object.freeze({ p: false, q: false }),
]);

/** La table d'un connecteur (deux lignes pour ¬P). */
export function truthTable(connector) {
  if (connector === 'not') {
    return [{ p: true, result: false }, { p: false, result: true }];
  }

  return TRUTH_ROWS.map((row) => ({ ...row, result: evalConnector(connector, row.p, row.q) }));
}

/** L'indice de la ligne VV/VF/FV/FF qui correspond à (p, q) — celle qu'on allume. */
export function rowIndexOf(p, q) {
  return TRUTH_ROWS.findIndex((row) => row.p === p && row.q === q);
}

/**
 * Les FORMES d'une implication, chacune comme fonction de (p, q). La table
 * de chacune se lit en appliquant la forme aux quatre lignes : c'est ainsi
 * que l'élève VOIT que la contraposée coïncide avec l'implication, et que la
 * réciproque et l'inverse n'y coïncident pas (§15, §16).
 */
export const IMPLICATION_FORMS = Object.freeze({
  direct: (p, q) => !p || q,          // P ⇒ Q
  converse: (p, q) => !q || p,        // Q ⇒ P
  contrapositive: (p, q) => q || !p,  // ¬Q ⇒ ¬P  (≡ ¬¬Q ∨ ¬P)
  inverse: (p, q) => p || !q,         // ¬P ⇒ ¬Q  (≡ ¬¬P ∨ ¬Q)
});

export function formTable(form) {
  const fn = IMPLICATION_FORMS[form];

  return TRUTH_ROWS.map((row) => ({ ...row, result: fn(row.p, row.q) }));
}

/** Deux formes ont-elles la même table ? (contraposée : oui ; réciproque : non). */
export function sameTable(formA, formB) {
  const a = formTable(formA);
  const b = formTable(formB);

  return a.every((row, i) => row.result === b[i].result);
}

export function contrapositiveEquivalent() {
  return sameTable('direct', 'contrapositive');
}

export function converseEquivalent() {
  return sameTable('direct', 'converse');
}

/** §24 — De Morgan, vérifié ligne par ligne. */
export function deMorganTable(kind) {
  return TRUTH_ROWS.map((row) => {
    const left = kind === 'and' ? !(row.p && row.q) : !(row.p || row.q);
    const right = kind === 'and' ? (!row.p || !row.q) : (!row.p && !row.q);

    return { ...row, left, right, same: left === right };
  });
}

export function deMorganHolds(kind) {
  return deMorganTable(kind).every((row) => row.same);
}

/* ── Évaluer un prédicat sans jamais tricher ─────────────────────────── */

/**
 * `true`/`false`, ou `undefined` si la valeur est hors domaine (déclarée
 * dans `excluded`, ou un prédicat qui lève). Jamais une exception.
 */
export function evaluate(predicate, x, excluded = []) {
  if (!Number.isFinite(x) || excluded.includes(x)) return undefined;
  try {
    return Boolean(predicate(x));
  } catch {
    return undefined;
  }
}

/**
 * §8-10, §22 — la recherche d'un contre-exemple sur un échantillon. Rend le
 * premier trouvé ET ce qui a été parcouru : l'interface doit pouvoir dire
 * « aucun contre-exemple parmi 25 valeurs », jamais « c'est prouvé ».
 */
export function searchCounterexample(predicate, sample, excluded = []) {
  let checked = 0;
  for (const x of sample) {
    const value = evaluate(predicate, x, excluded);
    if (value === undefined) continue;
    checked += 1;
    if (value === false) return { found: x, checked };
  }

  return { found: null, checked };
}

/** §23 — un seul témoin suffit. Même forme de résultat. */
export function searchWitness(predicate, sample, excluded = []) {
  let checked = 0;
  for (const x of sample) {
    const value = evaluate(predicate, x, excluded);
    if (value === undefined) continue;
    checked += 1;
    if (value === true) return { found: x, checked };
  }

  return { found: null, checked };
}

/**
 * Ce qu'on peut HONNÊTEMENT conclure d'une recherche sur un échantillon
 * (§22) — la distinction que tout le laboratoire enseigne :
 *
 *   ∀ + contre-exemple trouvé   → 'disproved'   (réfuté : un seul suffit)
 *   ∀ + rien trouvé             → 'notFound'    (observé, PAS prouvé)
 *   ∃ + témoin trouvé           → 'proved'      (prouvé : un seul suffit)
 *   ∃ + rien trouvé             → 'notFound'    (observé, PAS réfuté)
 */
export function searchVerdict(kind, predicate, sample, excluded = []) {
  if (kind === 'forall') {
    const { found, checked } = searchCounterexample(predicate, sample, excluded);

    return { status: found === null ? 'notFound' : 'disproved', value: found, checked };
  }
  const { found, checked } = searchWitness(predicate, sample, excluded);

  return { status: found === null ? 'notFound' : 'proved', value: found, checked };
}

/**
 * §25 — ¬(∀x, P(x)) ≡ ∃x, ¬P(x) et ¬(∃x, P(x)) ≡ ∀x, ¬P(x), vérifiés sur
 * un exemple concret : les deux côtés reçoivent la même valeur de vérité.
 */
export function quantifierNegationHolds(kind, predicate, sample) {
  const holdsForall = (pred) => sample.every((x) => evaluate(pred, x) !== false);
  const holdsExists = (pred) => sample.some((x) => evaluate(pred, x) === true);
  const not = (pred) => (x) => !pred(x);

  if (kind === 'forall') return !holdsForall(predicate) === holdsExists(not(predicate));

  return !holdsExists(predicate) === holdsForall(not(predicate));
}

/* ── La vérité rendue VISIBLE (§7, §13, §14, §17) ───────────────────── */

/**
 * §7 — les régions de la droite où un prédicat est vrai ou faux, calculées
 * sur une grille fine puis fusionnées en intervalles. Les valeurs exclues
 * sont rendues à part (`excluded`), et une égalité vraie en un point isolé
 * (x + 2 = 5) est rendue comme un POINT (`points`), puisqu'aucun intervalle
 * de la grille ne la contiendrait.
 */
export function truthIntervals(predicate, min, max, { samples = 480, excluded = [], candidates = [] } = {}) {
  const intervals = [];
  const step = (max - min) / samples;
  let current = null;

  for (let i = 0; i <= samples; i += 1) {
    const x = min + step * i;
    const value = evaluate(predicate, x, []);
    if (value === undefined) { current = null; continue; }
    if (current && current.value === value) {
      current.to = x;
    } else {
      current = { from: x, to: x, value };
      intervals.push(current);
    }
  }

  // Points isolés où l'énoncé est vrai alors que la grille dit « faux » autour.
  const points = candidates
    .filter((x) => x >= min && x <= max && evaluate(predicate, x, excluded) === true)
    .filter((x) => !intervals.some((iv) => iv.value && iv.to - iv.from > step && x >= iv.from && x <= iv.to));

  return {
    intervals: intervals.map((iv) => ({ from: round(iv.from), to: round(iv.to), value: iv.value })),
    points,
    excluded: excluded.filter((x) => x >= min && x <= max),
  };
}

/**
 * §14, §17, §20, §24 — la PARTITION d'un échantillon par deux prédicats :
 * ce que le diagramme d'ensembles dessine. `pOnly` vide ⇔ P ⊂ Q ⇔ P ⇒ Q sur
 * l'échantillon ; `pOnly` et `qOnly` vides ⇔ mêmes ensembles.
 */
export function vennPartition(p, q, sample, excluded = []) {
  const out = { both: [], pOnly: [], qOnly: [], neither: [] };
  for (const x of sample) {
    const a = evaluate(p, x, excluded);
    const b = evaluate(q, x, excluded);
    if (a === undefined || b === undefined) continue;
    if (a && b) out.both.push(x);
    else if (a) out.pOnly.push(x);
    else if (b) out.qOnly.push(x);
    else out.neither.push(x);
  }

  return out;
}

/**
 * §13-16 — ce qu'une implication concrète dit sur un échantillon, et ses
 * trois cousines. Chaque verdict vient de la partition : aucune n'est
 * « affirmée ».
 */
export function analyzeImplication(p, q, sample, excluded = []) {
  const parts = vennPartition(p, q, sample, excluded);

  return {
    parts,
    direct: { holds: parts.pOnly.length === 0, counterexample: parts.pOnly[0] ?? null },
    converse: { holds: parts.qOnly.length === 0, counterexample: parts.qOnly[0] ?? null },
    // ¬Q ⇒ ¬P échoue exactement quand ¬Q vrai et ¬P faux, c'est-à-dire P et ¬Q : les mêmes x que P ⇒ Q.
    contrapositive: { holds: parts.pOnly.length === 0, counterexample: parts.pOnly[0] ?? null },
    // ¬P ⇒ ¬Q échoue quand ¬P et Q : les mêmes x que la réciproque.
    inverse: { holds: parts.qOnly.length === 0, counterexample: parts.qOnly[0] ?? null },
  };
}

/**
 * La valeur d'une ligne concrète : x donné, P(x), Q(x), et la valeur de la
 * FORME regardée en ce point.
 *
 * `form` compte, et l'oublier a été un vrai défaut : à x = 2 sur
 * « x > 3 ⇒ x > 1 », la réciproque « x > 1 ⇒ x > 3 » est FAUSSE (l'antécédent
 * x > 1 tient, le conséquent x > 3 non) — mais évaluer la forme directe
 * répondait « vraie, car P est fausse ici », ce qui enseignait exactement
 * l'inverse de ce que §15 veut faire découvrir. Le cas critique est donc
 * calculé sur l'antécédent et le conséquent DE LA FORME, jamais sur P et Q.
 *
 * `antecedent` / `consequent` sont rendus pour que l'interface puisse dire
 * DE QUOI elle parle quand elle explique la vacuité.
 */
export function implicationAt(p, q, x, excluded = [], form = 'direct') {
  const pv = evaluate(p, x, excluded);
  const qv = evaluate(q, x, excluded);
  if (pv === undefined || qv === undefined) {
    return { p: null, q: null, antecedent: null, consequent: null, result: null, critical: false };
  }

  // Chaque forme est une implication « antécédent ⇒ conséquent » ; on la
  // ramène à ces deux valeurs, puis on applique la même table (§13).
  const [antecedent, consequent] = form === 'converse' ? [qv, pv]
    : form === 'contrapositive' ? [!qv, !pv]
      : form === 'inverse' ? [!pv, !qv]
        : [pv, qv];

  return {
    p: pv,
    q: qv,
    antecedent,
    consequent,
    result: evalConnector('implies', antecedent, consequent),
    critical: antecedent && !consequent,
  };
}

/** §18-20 — les deux lectures du vocabulaire, à partir de A ⇒ B et B ⇒ A. */
export function conditionReading(a, b, sample, excluded = []) {
  const analysis = analyzeImplication(a, b, sample, excluded);

  return {
    aImpliesB: analysis.direct.holds,
    bImpliesA: analysis.converse.holds,
    // A ⇒ B : A est SUFFISANTE pour B, B est NÉCESSAIRE pour A.
    aSufficientForB: analysis.direct.holds,
    bNecessaryForA: analysis.direct.holds,
    // B ⇒ A : B est suffisante pour A, A nécessaire pour B.
    bSufficientForA: analysis.converse.holds,
    aNecessaryForB: analysis.converse.holds,
    bNotSufficientCounterexample: analysis.converse.counterexample,
    aNotSufficientCounterexample: analysis.direct.counterexample,
    parts: analysis.parts,
  };
}

const round = (v) => Math.round(v * 1e6) / 1e6;
