import { describe, it, expect } from 'vitest';
import {
  normalizeProposition, compileTerm, buildContext, valueAt, compare,
  compileProposition, evaluateProposition, readNumber, clearCache,
  RELATIONS, SEQUENCE_NAMES,
} from './inductionModel.js';
import {
  INDUCTION_EXERCISES, findExercise, builderVariablesOf, alternativesOf,
} from './inductionExercises.js';
import { buildChain, verifyTransform, checkOrder, proofVerdict } from './inductionStep.js';

/* ── La notation du cahier ─────────────────────────────────────────────── */

describe('normalizeProposition — l\'élève écrit comme dans son manuel', () => {
  it('lit les indices Unicode, LaTeX et parenthésés', () => {
    expect(normalizeProposition('uₙ')).toBe('u');
    expect(normalizeProposition('u_n')).toBe('u');
    expect(normalizeProposition('u(n)')).toBe('u');
    expect(normalizeProposition('u_{n}')).toBe('u');
  });

  it('distingue le rang suivant du rang courant', () => {
    expect(normalizeProposition('uₙ₊₁')).toBe('U');
    expect(normalizeProposition('u_{n+1}')).toBe('U');
    expect(normalizeProposition('u(n+1)')).toBe('U');
  });

  // Le piège : `u(n+1)` ne doit pas être mangé par la règle de `u(n)`.
  it('ne laisse pas la règle de u(n) casser u(n+1)', () => {
    expect(normalizeProposition('u(n+1) - u(n)')).toBe('U - u');
  });

  it('lit plusieurs suites dans la même expression', () => {
    expect(normalizeProposition('uₙ - vₙ')).toBe('u - v');
    expect(normalizeProposition('wₙ₊₁ = uₙ₊₁ - vₙ₊₁')).toBe('W = U - V');
  });

  it('lit une fraction LaTeX et le vrai signe moins', () => {
    expect(normalizeProposition('\\frac{3}{4}')).toBe('(3)/(4)');
    expect(normalizeProposition('−2')).toBe('-2');
  });

  it('lit les chiffres arabes-indiens', () => {
    expect(normalizeProposition('٣')).toBe('3');
  });
});

describe('readNumber — u₀ = −2/3', () => {
  it('lit les fractions, les décimales à virgule et le vrai moins', () => {
    expect(readNumber('-2/3')).toBeCloseTo(-2 / 3, 12);
    expect(readNumber('1,5')).toBe(1.5);
    expect(readNumber('−1')).toBe(-1);
    expect(readNumber(4)).toBe(4);
  });

  it('refuse ce qui n\'est pas un nombre, sans lever', () => {
    expect(Number.isNaN(readNumber('abc'))).toBe(true);
    expect(Number.isNaN(readNumber('1/0'))).toBe(true);
  });
});

/* ── La grammaire, et ce qu'elle refuse ────────────────────────────────── */

describe('compileTerm — aucune exception, jamais de NaN affiché', () => {
  it('compile une expression de plusieurs suites', () => {
    const term = compileTerm('u - v');
    expect(term.ok).toBe(true);
    expect(term.evaluate({ u: 5, v: 3 })).toBe(2);
  });

  it('refuse une saisie vide avec un code, pas une exception', () => {
    expect(compileTerm('')).toMatchObject({ ok: false, error: { code: 'empty' } });
  });

  it('refuse une syntaxe illisible avec un code typé', () => {
    const bad = compileTerm('u +');
    expect(bad.ok).toBe(false);
    expect(['syntax', 'unknownSymbol']).toContain(bad.error.code);
  });

  it('rend NaN hors domaine plutôt que de lever', () => {
    const term = compileTerm('1/u');
    expect(term.ok).toBe(true);
    expect(Number.isNaN(term.evaluate({ u: 0 }))).toBe(true);
  });

  it('dit quelles variables l\'expression utilise vraiment', () => {
    expect(compileTerm('u - v').uses.sort()).toEqual(['u', 'v']);
    expect(compileTerm('3').uses).toEqual([]);
  });
});

/* ── §38 TEST CASE A ───────────────────────────────────────────────────── */

describe('§38 cas A — u₀ = −1, uₙ₊₁ = ⅓uₙ + 2, P(n) : uₙ < 3', () => {
  const specs = [{ name: 'u', kind: 'recurrence', startIndex: 0, initial: '-1', rule: '1/3*u + 2' }];

  it('déroule la suite aux valeurs exactes du sujet', () => {
    const { context } = buildContext(specs);
    expect(valueAt(context, 'u', 0).value).toBe(-1);
    expect(valueAt(context, 'u', 1).value).toBeCloseTo(5 / 3, 12);
    // ⅓·(5/3) + 2 = 5/9 + 18/9 = 23/9 — et non 17/9, que l'énoncé de
    // référence donnait par erreur. C'est le moteur qui a raison ici.
    expect(valueAt(context, 'u', 2).value).toBeCloseTo(23 / 9, 12);
    expect(valueAt(context, 'u', 3).value).toBeCloseTo(77 / 27, 12);
  });

  it('la proposition tient à tous les rangs testés', () => {
    const { context } = buildContext(specs);
    const proposition = compileProposition({ left: 'uₙ', relation: '<', right: '3' }, context);
    expect(proposition.ok).toBe(true);
    for (let n = 0; n <= 8; n += 1) {
      const result = evaluateProposition(proposition, context, n);
      expect(result.ok).toBe(true);
      expect(result.holds).toBe(true);
    }
  });

  it('rend les DEUX valeurs, pour pouvoir expliquer (§22)', () => {
    const { context } = buildContext(specs);
    const proposition = compileProposition({ left: 'uₙ', relation: '<', right: '3' }, context);
    const result = evaluateProposition(proposition, context, 2);
    expect(result.left).toBeCloseTo(23 / 9, 12);
    expect(result.right).toBe(3);
    expect(result.relation).toBe('<');
  });

  // §23 — une proposition fausse doit rougir, et montrer POURQUOI.
  it('une proposition fausse rougit avec sa valeur', () => {
    const { context } = buildContext(specs);
    const proposition = compileProposition({ left: 'uₙ', relation: '<', right: '0' }, context);
    const holds = evaluateProposition(proposition, context, 0);
    expect(holds.holds).toBe(true);          // u₀ = −1 < 0
    const fails = evaluateProposition(proposition, context, 1);
    expect(fails.holds).toBe(false);         // u₁ = 5/3, pas < 0
    expect(fails.left).toBeCloseTo(5 / 3, 12);
  });
});

/* ── §38 TEST CASE B ───────────────────────────────────────────────────── */

describe('§38 cas B — suite auxiliaire, wₙ = uₙ − vₙ, P(n) : wₙ = −2', () => {
  const specs = [
    { name: 'u', kind: 'recurrence', startIndex: 0, initial: '-2/3', rule: '3/4*u - 1/2' },
    { name: 'v', kind: 'recurrence', startIndex: 0, initial: '4/3', rule: '3/4*v' },
    { name: 'w', kind: 'derived', startIndex: 0, rule: 'u - v' },
  ];

  it('résout la dépendance w → u, v dans le bon ordre (§10)', () => {
    const built = buildContext(specs);
    expect(built.ok).toBe(true);
    expect(built.context.order.indexOf('w')).toBeGreaterThan(built.context.order.indexOf('u'));
    expect(built.context.order.indexOf('w')).toBeGreaterThan(built.context.order.indexOf('v'));
  });

  it('calcule w sans que l\'élève ait à calculer u et v lui-même', () => {
    const { context } = buildContext(specs);
    for (let n = 0; n <= 6; n += 1) {
      expect(valueAt(context, 'w', n).value).toBeCloseTo(-2, 9);
    }
  });

  it('la proposition wₙ = −2 tient à tous les rangs', () => {
    const { context } = buildContext(specs);
    const proposition = compileProposition({ left: 'wₙ', relation: '=', right: '-2' }, context);
    expect(proposition.ok).toBe(true);
    expect(proposition.uses).toEqual(['w']);
    for (let n = 0; n <= 8; n += 1) {
      expect(evaluateProposition(proposition, context, n).holds).toBe(true);
    }
  });

  it('une proposition peut combiner deux suites directement', () => {
    const { context } = buildContext(specs);
    const proposition = compileProposition({ left: 'uₙ - vₙ', relation: '=', right: '-2' }, context);
    expect(proposition.ok).toBe(true);
    expect(proposition.uses.sort()).toEqual(['u', 'v']);
    expect(evaluateProposition(proposition, context, 3).holds).toBe(true);
  });

  // La tolérance est là pour ça : ¾ répété accumule du flottant. Ici les
  // deux erreurs se compensent et w reste exactement −2 ; on vérifie donc
  // que la comparaison tient AUSSI quand on l'écarte d'un epsilon — c'est
  // ce qui arriverait avec une égalité stricte.
  it('l\'égalité résiste au flottant accumulé', () => {
    const { context } = buildContext(specs);
    const raw = valueAt(context, 'w', 12).value;
    expect(compare(raw, '=', -2)).toBe(true);
    expect(compare(-2 + 4e-16, '=', -2)).toBe(true);
    expect(-2 + 4e-16).not.toBe(-2);
    // …mais pas à une vraie erreur : la tolérance n'excuse pas une faute.
    expect(compare(-2.01, '=', -2)).toBe(false);
  });
});

/* ── Les relations ─────────────────────────────────────────────────────── */

describe('compare — les six relations (§7)', () => {
  it('couvre toutes les relations annoncées', () => {
    expect(RELATIONS).toEqual(['=', '≠', '<', '>', '≤', '≥']);
  });

  it('compare juste', () => {
    expect(compare(2, '<', 3)).toBe(true);
    expect(compare(3, '<', 3)).toBe(false);
    expect(compare(3, '≤', 3)).toBe(true);
    expect(compare(3, '≥', 3)).toBe(true);
    expect(compare(4, '>', 3)).toBe(true);
    expect(compare(2, '≠', 3)).toBe(true);
    expect(compare(3, '=', 3)).toBe(true);
  });

  // Une stricte ne doit pas devenir vraie par simple bruit de flottant.
  it('la stricte reste stricte à la tolérance près', () => {
    expect(compare(3, '<', 3 + 1e-15)).toBe(false);
    expect(compare(3, '≤', 3 + 1e-15)).toBe(true);
  });

  it('refuse une relation inconnue plutôt que d\'en inventer une', () => {
    expect(compare(1, '≈', 1)).toBe(false);
  });
});

/* ── Les refus, jamais techniques ──────────────────────────────────────── */

describe('les refus sont des CODES, jamais NaN ni une exception (§17)', () => {
  it('refuse une proposition qui parle d\'une suite non définie (§31)', () => {
    const { context } = buildContext([{ name: 'u', kind: 'explicit', rule: '2n+1' }]);
    const proposition = compileProposition({ left: 'vₙ', relation: '=', right: '1' }, context);
    expect(proposition.ok).toBe(false);
    expect(proposition.error.code).toBe('missing');
    expect(proposition.error.symbol).toBe('v');
  });

  it('refuse une relation absente', () => {
    const { context } = buildContext([{ name: 'u', kind: 'explicit', rule: 'n' }]);
    expect(compileProposition({ left: 'uₙ', relation: '≈', right: '1' }, context).ok).toBe(false);
  });

  it('dit de quel CÔTÉ vient l\'erreur, pour souligner le bon champ', () => {
    const { context } = buildContext([{ name: 'u', kind: 'explicit', rule: 'n' }]);
    const bad = compileProposition({ left: 'uₙ', relation: '=', right: '3 +' }, context);
    expect(bad.ok).toBe(false);
    expect(bad.error.side).toBe('right');
  });

  it('détecte une dépendance circulaire au lieu de boucler', () => {
    const built = buildContext([
      { name: 'w', kind: 'derived', rule: 'u + 1' },
      { name: 'u', kind: 'derived', rule: 'w - 1' },
    ]);
    expect(built.ok).toBe(false);
    expect(built.error.code).toBe('cycle');
  });

  it('arrête une suite qui explose au lieu de rendre Infinity', () => {
    const { context } = buildContext([
      { name: 'u', kind: 'recurrence', startIndex: 0, initial: '2', rule: 'u^2' },
    ]);
    const far = valueAt(context, 'u', 40);
    expect(far.ok).toBe(false);
    expect(far.reason).toBe('overflow');
  });

  it('refuse un rang trop lointain plutôt que de geler l\'onglet', () => {
    const { context } = buildContext([
      { name: 'u', kind: 'recurrence', startIndex: 0, initial: '1', rule: 'u + 1' },
    ]);
    expect(valueAt(context, 'u', 50000)).toMatchObject({ ok: false, reason: 'iterationCap' });
  });

  it('refuse un rang sous le premier terme', () => {
    const { context } = buildContext([
      { name: 'u', kind: 'recurrence', startIndex: 1, initial: '1', rule: 'u + 1' },
    ]);
    expect(valueAt(context, 'u', 0).ok).toBe(false);
  });

  it('rend `undefined` sur une division par zéro, jamais NaN à l\'écran', () => {
    const { context } = buildContext([
      { name: 'u', kind: 'recurrence', startIndex: 0, initial: '1', rule: '1/(u - 1)' },
    ]);
    // u₁ = 1/(1−1) → NaN, donc refusé proprement.
    expect(valueAt(context, 'u', 1)).toMatchObject({ ok: false, reason: 'undefined' });
  });
});

/* ── Le cache (§11) ────────────────────────────────────────────────────── */

describe('le cache — on ne recalcule pas toute la suite à chaque clic (§11)', () => {
  it('mémorise les rangs intermédiaires en déroulant', () => {
    const { context } = buildContext([
      { name: 'u', kind: 'recurrence', startIndex: 0, initial: '0', rule: 'u + 1' },
    ]);
    valueAt(context, 'u', 5);
    // Les rangs 0..5 sont tous dans le cache après UN seul calcul.
    for (let n = 0; n <= 5; n += 1) expect(context.cache.has(`u:${n}`)).toBe(true);
  });

  it('se vide quand la définition change (§24)', () => {
    const { context } = buildContext([
      { name: 'u', kind: 'recurrence', startIndex: 0, initial: '0', rule: 'u + 1' },
    ]);
    valueAt(context, 'u', 3);
    expect(context.cache.size).toBeGreaterThan(0);
    clearCache(context);
    expect(context.cache.size).toBe(0);
  });
});

/* ── Les exercices, VÉRIFIÉS et non déclarés (§38, §39) ────────────────── */

describe('chaque exercice livré est mathématiquement juste', () => {
  it('expose au moins les deux cas de référence', () => {
    const ids = INDUCTION_EXERCISES.map((item) => item.id);
    expect(ids).toContain('boundedAffine');
    expect(ids).toContain('auxiliaryDifference');
  });

  for (const exercise of INDUCTION_EXERCISES) {
    describe(exercise.id, () => {
      it('ses suites se compilent toutes', () => {
        const built = buildContext(exercise.sequences);
        expect(built.ok, JSON.stringify(built.error)).toBe(true);
      });

      it('sa proposition se compile contre ses propres suites', () => {
        const { context } = buildContext(exercise.sequences);
        const proposition = compileProposition(exercise.proposition, context);
        expect(proposition.ok, JSON.stringify(proposition.error)).toBe(true);
      });

      it('sa proposition tient à partir de son rang de base', () => {
        const { context } = buildContext(exercise.sequences);
        const proposition = compileProposition(exercise.proposition, context);
        for (let i = 0; i < exercise.stepCount; i += 1) {
          const n = exercise.baseIndex + i;
          const result = evaluateProposition(proposition, context, n);
          expect(result.ok, `P(${n}) ne s'évalue pas`).toBe(true);
          expect(result.holds, `P(${n}) est fausse`).toBe(true);
        }
      });

      // §39 — chaque maillon d'hérédité est vérifié numériquement.
      it('sa chaîne d\'hérédité est vérifiée maillon par maillon', () => {
        const built = buildChain(exercise.chain, exercise.sequences);
        expect(built.ok, JSON.stringify(built.error)).toBe(true);
        expect(built.chain).toHaveLength(exercise.chain.length);
        for (const link of built.chain) expect(link.verified).toBe(true);
      });

      it('son constructeur n\'offre que ses propres suites (§31)', () => {
        const variables = builderVariablesOf(exercise);
        expect(variables).toHaveLength(exercise.sequences.length);
        const names = variables.map((item) => item.name);
        expect(names).toEqual(exercise.sequences.map((s) => s.name));
      });
    });
  }

  // Celui-ci est l'exercice qui ENSEIGNE que le rang de départ compte.
  it('2ⁿ > n² est FAUSSE avant n = 5 — et l\'escalier doit le montrer', () => {
    const exercise = findExercise('powersBeatSquares');
    const { context } = buildContext(exercise.sequences);
    const proposition = compileProposition(exercise.proposition, context);
    expect(evaluateProposition(proposition, context, 2).holds).toBe(false);
    expect(evaluateProposition(proposition, context, 3).holds).toBe(false);
    expect(evaluateProposition(proposition, context, 4).holds).toBe(false);
    expect(evaluateProposition(proposition, context, 5).holds).toBe(true);
  });

  it('un id inconnu rend le premier exercice, jamais undefined', () => {
    expect(findExercise('nope').id).toBe(INDUCTION_EXERCISES[0].id);
  });

  it('les alternatives proposées parlent des suites de l\'exercice (§19, §31)', () => {
    for (const exercise of INDUCTION_EXERCISES) {
      const { context } = buildContext(exercise.sequences);
      for (const alternative of alternativesOf(exercise)) {
        expect(compileProposition(alternative, context).ok).toBe(true);
      }
    }
  });
});

/* ── L'hérédité (§28, §29) ─────────────────────────────────────────────── */

describe('l\'hérédité — des étapes vérifiées, pas un prouveur inventé (§29)', () => {
  const specsB = findExercise('auxiliaryDifference').sequences;

  it('accepte une transformation vraie', () => {
    const verified = verifyTransform(
      { id: 'x', from: 'W', to: 'U - V' },
      specsB,
    );
    expect(verified.ok).toBe(true);
    expect(verified.checked).toBeGreaterThan(0);
  });

  // Le garde-fou d'auteur : une étape fausse ne peut pas être publiée.
  it('REFUSE une transformation fausse, en disant à quel rang', () => {
    const rejected = verifyTransform(
      { id: 'x', from: 'W', to: 'U + V' },
      specsB,
    );
    expect(rejected.ok).toBe(false);
    expect(rejected.reason).toBe('mismatch');
    expect(Number.isFinite(rejected.at)).toBe(true);
  });

  it('refuse une transformation qu\'on ne peut pas tester du tout', () => {
    const rejected = verifyTransform({ id: 'x', from: 'zₙ', to: 'zₙ' }, specsB);
    expect(rejected.ok).toBe(false);
  });

  it('fait échouer toute la chaîne si un maillon est faux', () => {
    const built = buildChain(
      [{ id: 'good', from: 'W', to: 'U - V' },
        { id: 'bad', from: 'W', to: 'U + V' }],
      specsB,
    );
    expect(built.ok).toBe(false);
    expect(built.error.id).toBe('bad');
  });

  it('un maillon suit un autre quand il part de là où l\'autre arrive', () => {
    const { chain } = buildChain(findExercise('auxiliaryDifference').chain, specsB);
    const right = chain.map((link) => link.id);
    expect(checkOrder(chain, right).ok).toBe(true);
    const wrong = [right[1], right[0], ...right.slice(2)];
    expect(checkOrder(chain, wrong).ok).toBe(false);
  });

  /**
   * Le défaut attrapé par la QA navigateur : une chaîne d'INÉGALITÉ.
   * Ses maillons ne sont pas des égalités, et ses raccords se font sur les
   * membres de GAUCHE. Les traiter comme une chaîne d'égalité refusait un
   * enchaînement juste.
   */
  it('vérifie un maillon d\'INÉGALITÉ comme une inégalité', () => {
    const exercise = findExercise('boundedAffine');
    const verified = verifyTransform(
      { id: 'x', from: 'u', to: '3', relation: '<' },
      exercise.sequences,
    );
    expect(verified.ok).toBe(true);
  });

  it('refuse une inégalité FAUSSE même déclarée comme telle', () => {
    const exercise = findExercise('boundedAffine');
    const rejected = verifyTransform(
      { id: 'x', from: 'u', to: '-5', relation: '<' },
      exercise.sequences,
    );
    expect(rejected.ok).toBe(false);
    expect(rejected.reason).toBe('mismatch');
  });

  it('enchaîne une chaîne d\'inégalité par ses membres de gauche', () => {
    const exercise = findExercise('boundedAffine');
    const { chain } = buildChain(exercise.chain, exercise.sequences);
    const ids = chain.map((link) => link.id);
    expect(checkOrder(chain, ids).ok).toBe(true);
    // …et un ordre mélangé reste refusé : le raccord n'est pas décoratif.
    expect(checkOrder(chain, [ids[1], ids[0], ...ids.slice(2)]).ok).toBe(false);
  });

  it('un ordre incomplet n\'est pas « fini »', () => {
    const { chain } = buildChain(findExercise('auxiliaryDifference').chain, specsB);
    expect(checkOrder(chain, [chain[0].id]).ok).toBe(false);
  });
});

/* ── §25 — tester n'est pas prouver ────────────────────────────────────── */

describe('§25 — le verdict ne dit « prouvé » qu\'avec les DEUX pieds', () => {
  it('la base seule ne prouve pas', () => {
    expect(proofVerdict({ baseHolds: true, stepComplete: false })).toBe('baseOnly');
  });

  it('l\'hérédité seule ne prouve pas — c\'est le cas « n = n+1 »', () => {
    expect(proofVerdict({ baseHolds: false, stepComplete: true })).toBe('stepOnly');
  });

  it('les deux ensemble, et seulement là', () => {
    expect(proofVerdict({ baseHolds: true, stepComplete: true })).toBe('complete');
    expect(proofVerdict({ baseHolds: false, stepComplete: false })).toBe('none');
  });
});

describe('les noms de suites sont ceux du tableau', () => {
  it('u, v, w, t — jamais un identifiant technique', () => {
    expect(SEQUENCE_NAMES).toEqual(['u', 'v', 'w', 't']);
  });
});
