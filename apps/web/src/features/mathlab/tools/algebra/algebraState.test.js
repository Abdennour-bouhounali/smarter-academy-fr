import { describe, it, expect } from 'vitest';
import * as R from './rational.js';
import { parseEquation, equationToText, applyOperation, classify, solve, isSolvedForm } from './equation.js';
import {
  ALGEBRA_SCHEMA_VERSION,
  MAX_STEPS,
  createAlgebraData,
  normalizeAlgebraData,
  currentEquation,
  pushStep,
  resetTo,
  undo,
  redo,
  canUndo,
  canRedo,
} from './algebraState.js';
import { generateEquation, LEVELS } from './generator.js';
import { verifySolution, evaluateForm, verifyResolution, sampleInside } from './verify.js';
import { suggestOperations } from './operationHints.js';

const parse = (source) => parseEquation(source).equation;

/**
 * Applique une opération et empile le pas, comme le fait l'outil : une
 * opération REFUSÉE (débordement, division par zéro) laisse le document
 * intact, elle ne l'abîme pas.
 */
function step(data, kind, n, d = 1) {
  const value = R.makeRational(n, d);
  const result = applyOperation(currentEquation(data), { kind, value });
  if (!result.ok) return data;

  return pushStep(data, result.equation, { kind, value }, result.flipped);
}

describe('algebraState — document', () => {
  it('ouvre sur une équation à manipuler, jamais sur sa solution', () => {
    const data = createAlgebraData();
    expect(data.steps).toHaveLength(1);
    expect(data.showSolution).toBe(false);
    expect(equationToText(currentEquation(data))).toBe('2x + 3 = 11');
  });

  it('accepte l’amorce d’une leçon, et retombe sur le défaut si elle est illisible', () => {
    expect(equationToText(currentEquation(createAlgebraData({ equation: '3x - 5 = 16' })))).toBe('3x − 5 = 16');
    expect(equationToText(currentEquation(createAlgebraData({ equation: 'x^2 = 4' })))).toBe('2x + 3 = 11');
  });

  it('relit ce qu’il a écrit (aller-retour JSON)', () => {
    const data = step(createAlgebraData(), 'subtract', 3);
    const reopened = normalizeAlgebraData(JSON.parse(JSON.stringify(data)));
    expect(reopened.steps).toHaveLength(2);
    expect(equationToText(currentEquation(reopened))).toBe('2x = 8');
  });

  it('survit à n’importe quel data (null, champs absurdes)', () => {
    for (const raw of [null, undefined, 42, 'x', { steps: 'non' }, { steps: [{ equation: {} }] }, { cursor: 99 }]) {
      const data = normalizeAlgebraData(raw);
      expect(data.steps.length).toBeGreaterThanOrEqual(1);
      expect(data.cursor).toBeLessThan(data.steps.length);
    }
  });

  it('coupe un historique devenu illisible au lieu de le trouer', () => {
    const valid = createAlgebraData();
    const data = normalizeAlgebraData({
      ...valid,
      steps: [valid.steps[0], { equation: { left: 'cassé' } }, valid.steps[0]],
    });
    expect(data.steps).toHaveLength(1);
  });

  it('borne l’historique pour tenir sous le plafond du serveur', () => {
    let data = createAlgebraData();
    for (let i = 0; i < MAX_STEPS + 10; i += 1) data = step(data, 'add', 1);
    expect(data.steps.length).toBeLessThanOrEqual(MAX_STEPS);
    expect(data.cursor).toBe(data.steps.length - 1);
  });

  it('reste bien au-dessous du plafond d’octets une fois sérialisé', () => {
    let data = createAlgebraData();
    for (let i = 0; i < MAX_STEPS + 10; i += 1) data = step(data, 'multiply', -7);
    expect(JSON.stringify(data).length).toBeLessThan(20000);
  });

  it('porte une version de schéma', () => {
    expect(ALGEBRA_SCHEMA_VERSION).toBe(2);
  });

  it('refuse proprement une opération qui déborde, sans abîmer le document', () => {
    let equation = parse('2x + 3 = 11');
    let refused = null;
    for (let i = 0; i < 40 && !refused; i += 1) {
      const result = applyOperation(equation, { kind: 'multiply', value: R.makeRational(1000003) });
      if (result.ok) equation = result.equation;
      else refused = result;
    }
    expect(refused).not.toBeNull();
    expect(refused.error.code).toBe('overflow');
    expect(refused.equation).toBeUndefined();
  });
});

describe('algebraState — historique, تراجع et إعادة', () => {
  it('empile un pas par opération', () => {
    const data = step(step(createAlgebraData(), 'subtract', 3), 'divide', 2);
    expect(data.steps).toHaveLength(3);
    expect(equationToText(currentEquation(data))).toBe('x = 4');
  });

  it('revient en arrière et repart en avant', () => {
    const data = step(step(createAlgebraData(), 'subtract', 3), 'divide', 2);
    const back = undo(undo(data));
    expect(equationToText(currentEquation(back))).toBe('2x + 3 = 11');
    expect(canUndo(back)).toBe(false);
    expect(equationToText(currentEquation(redo(back)))).toBe('2x = 8');
    expect(canRedo(redo(redo(back)))).toBe(false);
  });

  it('ne perd pas les pas en annulant — إعادة les retrouve', () => {
    const data = step(step(createAlgebraData(), 'subtract', 3), 'divide', 2);
    expect(redo(redo(undo(undo(data)))).steps).toHaveLength(3);
  });

  it('une nouvelle opération après un retour coupe la branche abandonnée', () => {
    const data = step(step(createAlgebraData(), 'subtract', 3), 'divide', 2);
    const branched = step(undo(data), 'divide', 2);
    expect(branched.steps).toHaveLength(3);
    expect(equationToText(currentEquation(branched))).toBe('x = 4');
    expect(canRedo(branched)).toBe(false);
  });

  it('n’empile pas une opération sans effet', () => {
    const data = createAlgebraData();
    expect(step(data, 'add', 0).steps).toHaveLength(1);
    expect(step(data, 'multiply', 1).steps).toHaveLength(1);
  });

  it('repartir d’une nouvelle équation remplace l’historique', () => {
    const data = step(createAlgebraData(), 'subtract', 3);
    const fresh = resetTo(data, parse('5x = 20'), '5x = 20');
    expect(fresh.steps).toHaveLength(1);
    expect(fresh.cursor).toBe(0);
    expect(fresh.showSolution).toBe(false);
  });

  it('retient le retournement du sens sur le pas concerné', () => {
    const data = step(normalizeAlgebraData({ source: '-2x > 6' }), 'divide', -2);
    expect(data.steps[1].flipped).toBe(true);
    expect(equationToText(currentEquation(data))).toBe('x < −3');
  });
});

describe('generator', () => {
  /** Un tirage déterministe, pour que le test ne dépende pas du hasard. */
  function seeded(seed) {
    let state = seed >>> 0;

    return () => {
      state = (state * 1664525 + 1013904223) >>> 0;

      return state / 4294967296;
    };
  }

  it('rend, à chaque niveau, une équation à solution entière lisible', () => {
    for (const level of LEVELS) {
      const random = seeded(level * 7919);
      for (let i = 0; i < 200; i += 1) {
        const { equation, solution } = generateEquation({ level, random });
        const left = evaluateForm(equation.left, R.makeRational(solution));
        const right = evaluateForm(equation.right, R.makeRational(solution));
        expect(R.equals(left, right)).toBe(true);
        expect(Number.isInteger(solution)).toBe(true);
        expect(Math.abs(solution)).toBeLessThanOrEqual(10);
      }
    }
  });

  it('n’engendre jamais une équation dégénérée', () => {
    const random = seeded(4242);
    for (let i = 0; i < 400; i += 1) {
      const level = LEVELS[i % LEVELS.length];
      const { equation } = generateEquation({ level, random });
      // L'inconnue survit : le coefficient global n'est pas nul.
      const a = R.subtract(equation.left.a, equation.right.a);
      expect(R.isZero(a)).toBe(false);
      if (level === 2 || level === 3) expect(Math.abs(R.toNumber(equation.left.a))).toBeGreaterThan(1);
    }
  });

  it('sait engendrer une inéquation', () => {
    const { equation } = generateEquation({ level: 3, relation: '>', random: seeded(11) });
    expect(equation.relation).toBe('>');
  });
});

describe('verify — substituer pour voir que c’est vrai', () => {
  it('confirme la solution et montre le calcul', () => {
    const result = verifySolution(parse('2x + 3 = 11'), R.makeRational(4));
    expect(result.holds).toBe(true);
    expect(result.lines.substituted).toBe('2 \\times 4 + 3 = 11');
    expect(result.lines.evaluated).toBe('11 = 11');
  });

  it('refuse une valeur qui ne convient pas', () => {
    expect(verifySolution(parse('2x + 3 = 11'), R.makeRational(5)).holds).toBe(false);
  });

  it('met une valeur négative entre parenthèses', () => {
    const result = verifySolution(parse('-2x + 4 = 10'), R.makeRational(-3));
    expect(result.holds).toBe(true);
    expect(result.lines.substituted).toContain('\\left(-3\\right)');
  });

  it('vérifie exactement une solution fractionnaire', () => {
    const result = verifySolution(parse('3x = 1'), R.makeRational(1, 3));
    expect(result.holds).toBe(true);
    expect(result.lines.evaluated).toBe('1 = 1');
  });

  it('vérifie aussi une inégalité', () => {
    expect(verifySolution(parse('x + 3 > 7'), R.makeRational(5)).holds).toBe(true);
    expect(verifySolution(parse('x + 3 > 7'), R.makeRational(4)).holds).toBe(false);
  });
});

describe('rational', () => {
  it('réduit et porte le signe au numérateur', () => {
    expect(R.makeRational(2, -4)).toEqual({ n: -1, d: 2 });
    expect(R.makeRational(-6, -3)).toEqual({ n: 2, d: 1 });
  });

  it('lit un décimal comme la fraction qu’il écrit', () => {
    expect(R.fromNumber(2.5)).toEqual({ n: 5, d: 2 });
    expect(R.fromNumber(0.25)).toEqual({ n: 1, d: 4 });
  });

  it('écrit le moins devant la fraction, comme le manuel', () => {
    expect(R.toLatex(R.makeRational(-1, 3))).toBe('-\\frac{1}{3}');
    expect(R.toLatex(R.makeRational(4))).toBe('4');
  });

  it('écrit en clair avec virgule et vrai signe moins', () => {
    expect(R.toPlainText(R.makeRational(-5, 2))).toBe('−2,5');
    expect(R.toPlainText(R.makeRational(1, 3))).toBe('1/3');
  });

  it('refuse la division par zéro', () => {
    expect(() => R.divide(R.ONE, R.ZERO)).toThrow();
  });
});

// ── A1 : « التحقق » d'une متراجحة ne déclare jamais faux un résultat juste ──
//
// Attentes calculées À LA MAIN, en nombres ordinaires : pas de `classify`
// pour dire quelle est la bonne solution.

/** Le générateur pseudo-aléatoire des tests : reproductible. */
function lcg(seed) {
  let state = seed;

  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;

    return state / 2147483648;
  };
}

const num = (r) => r.n / r.d;
const holdsByHand = (l, r, relation) => ({
  '<': l < r, '>': l > r, '<=': l <= r, '>=': l >= r, '=': l === r,
})[relation];
const HAND_FLIP = { '<': '>', '>': '<', '<=': '>=', '>=': '<=' };

/** Résout comme un élève : ôter b, puis diviser par a (niveaux 1 à 3). */
function resolveByOperations(start) {
  let current = start;
  if (!R.isZero(current.left.b)) {
    current = applyOperation(current, { kind: 'subtract', value: current.left.b }).equation;
  }
  if (!R.equals(current.left.a, R.ONE)) {
    current = applyOperation(current, { kind: 'divide', value: current.left.a }).equation;
  }

  return current;
}

describe('A1 — vérifier une inéquation résolue', () => {
  it('le cas de l’audit : x − 7 < −7 résolue en x < 0 n’est PAS déclarée fausse', () => {
    const start = parse('x - 7 < -7');
    const current = applyOperation(start, { kind: 'add', value: R.makeRational(7) }).equation;
    const verdict = classify(current);
    expect(verdict.kind).toBe('solved');
    expect(verdict.relation).toBe('<');
    expect(R.equals(verdict.solution, R.ZERO)).toBe(true);

    const check = verifyResolution(start, verdict.solution, verdict.relation);
    expect(check.kind).toBe('inequality');
    expect(check.holds).toBe(true);
    // Une valeur DE l'ensemble (−1), pas la borne.
    expect(R.equals(check.sample, R.makeRational(-1))).toBe(true);
    expect(check.inside.lines.evaluated).toBe('-8 < -7');
    // La borne rend les membres égaux, et < n'accepte pas l'égalité.
    expect(check.boundary.check.lines.evaluated).toBe('-7 = -7');
    expect(check.boundary.equal).toBe(true);
    expect(check.boundary.included).toBe(false);
  });

  it('sur 4 000 inéquations générées (4 niveaux × 4 sens), un résultat juste est TOUJOURS confirmé', () => {
    for (const relation of ['<', '>', '<=', '>=']) {
      for (const level of LEVELS) {
        const random = lcg(level * 131 + relation.length * 17 + relation.charCodeAt(0));
        for (let i = 0; i < 250; i += 1) {
          const { equation: start } = generateEquation({ level, relation, random });
          const a = num(start.left.a);
          const b = num(start.left.b);
          const c = num(start.right.a);
          const d = num(start.right.b);
          // (a − c)·x REL d − b, divisé par a − c : le sens se retourne si a − c < 0.
          const s = (d - b) / (a - c);
          const expected = a - c < 0 ? HAND_FLIP[relation] : relation;

          // L'état « résolu » tel que l'outil le voit : par les opérations
          // (niveaux 1–3), ou par « إظهار الحل » (niveau 4, x des deux côtés).
          const current = level <= 3 ? resolveByOperations(start) : start;
          const verdict = classify(current);
          if (level <= 3) expect(verdict.kind).toBe('solved');
          expect(num(verdict.solution)).toBeCloseTo(s, 12);
          expect(verdict.relation).toBe(expected);

          const check = verifyResolution(start, verdict.solution, verdict.relation);
          expect(check.holds).toBe(true);
          // La valeur substituée est bien DANS l'ensemble, et vérifie la relation de départ (à la main).
          const v = num(check.sample);
          expect(holdsByHand(v, s, expected)).toBe(true);
          expect(v).not.toBe(s);
          expect(holdsByHand(a * v + b, c * v + d, relation)).toBe(true);
          // La borne : membres égaux ; solution ssi le symbole accepte l'égalité.
          expect(a * s + b).toBeCloseTo(c * s + d, 9);
          expect(check.boundary.included).toBe(relation === '<=' || relation === '>=');
        }
      }
    }
  });

  it('un résultat FAUX reste déclaré faux : sens inversé, borne décalée, égalité mal jugée', () => {
    const start = parse('3x + 2 >= 11');                   // x ≥ 3
    const three = R.makeRational(3);
    expect(verifyResolution(start, three, '>=').holds).toBe(true);
    expect(verifyResolution(start, three, '<=').holds).toBe(false);   // sens inversé
    expect(verifyResolution(start, R.makeRational(4), '>=').holds).toBe(false); // borne fausse
    expect(verifyResolution(start, three, '>').holds).toBe(false);    // 3 est solution : ≥, pas >
    expect(verifyResolution(parse('3x + 2 > 11'), three, '>=').holds).toBe(false);
  });

  it('une équation se vérifie toujours en substituant SA solution', () => {
    const check = verifyResolution(parse('2x + 3 = 11'), R.makeRational(4), '=');
    expect(check.kind).toBe('equation');
    expect(check.holds).toBe(true);
    expect(check.check.lines.evaluated).toBe('11 = 11');
  });

  it('la valeur témoin : l’entier le plus proche du bon côté, jamais la borne', () => {
    expect(sampleInside(R.makeRational(0), '<')).toEqual(R.makeRational(-1));
    expect(sampleInside(R.makeRational(0), '>=')).toEqual(R.makeRational(1));
    expect(sampleInside(R.makeRational(7, 3), '<')).toEqual(R.makeRational(2));
    expect(sampleInside(R.makeRational(7, 3), '>')).toEqual(R.makeRational(3));
    expect(sampleInside(R.makeRational(-7, 3), '<=')).toEqual(R.makeRational(-3));
    expect(sampleInside(R.makeRational(-7, 3), '>')).toEqual(R.makeRational(-2));
  });
});

describe('A2 — la forme résolue miroir « valeur RELATION x »', () => {
  it('3 > x est résolue, et se lit x < 3', () => {
    const equation = parse('3 > x');
    expect(isSolvedForm(equation)).toBe(true);
    const verdict = classify(equation);
    expect(verdict.kind).toBe('solved');
    expect(verdict.relation).toBe('<');
    expect(R.equals(verdict.solution, R.makeRational(3))).toBe(true);
    expect(equationToText(solve(equation).equation)).toBe('x < 3');
    expect(suggestOperations(equation)).toEqual([]);
  });

  it('chaque sens est retourné correctement (vérifié à la main sur des entiers)', () => {
    for (const relation of ['<', '>', '<=', '>=', '=']) {
      const equation = { left: { a: R.ZERO, b: R.makeRational(-2) }, right: { a: R.ONE, b: R.ZERO }, relation };
      expect(isSolvedForm(equation)).toBe(true);
      const verdict = classify(equation);
      for (let x = -5; x <= 5; x += 1) {
        // −2 REL x  ⇔  x REL′ −2
        expect(holdsByHand(x, -2, verdict.relation)).toBe(holdsByHand(-2, x, relation));
      }
    }
  });

  it('ne prend pas pour résolu ce qui ne l’est pas', () => {
    expect(isSolvedForm(parse('2x = 6'))).toBe(false);
    expect(isSolvedForm(parse('6 = 2x'))).toBe(false);
    expect(isSolvedForm(parse('3 = x + 1'))).toBe(false);
    expect(isSolvedForm(parse('x = x + 1'))).toBe(false);
  });
});
