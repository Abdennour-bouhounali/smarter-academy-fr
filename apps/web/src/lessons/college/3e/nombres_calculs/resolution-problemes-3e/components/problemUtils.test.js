import { describe, it, expect } from 'vitest';
import {
  lin, addLin, subLin, scaleLin, evalLin, sameLin, isConstLin, mulLin,
  foldCards, equation, solveLinear, isEquivalentEquation, isSolvedForm,
  tryTable, planCost, interpret, rewriteQuantities, storyValues,
  nextValidSteps, formatLin, formatEquation, plainMath,
} from './problemUtils';
import { AGES, FORFAIT, FORFAIT_25, RECTANGLE_62, PROGRAMME } from './problemsData';

/* ── 1. Arithmétique sur Lin ──────────────────────────────────────── */
describe('formes linéaires', () => {
  it('additionne, soustrait, met à l’échelle et évalue de façon cohérente', () => {
    const p = lin(2, 3);
    const q = lin(1, -7);
    expect(addLin(p, q)).toEqual(lin(3, -4));
    expect(subLin(p, q)).toEqual(lin(1, 10));
    expect(scaleLin(p, 3)).toEqual(lin(6, 9));
    // invariant de la spec : evalLin(addLin(p,q),x) = evalLin(p,x) + evalLin(q,x)
    for (const x of [-3, 0, 1.5, 11]) {
      expect(evalLin(addLin(p, q), x)).toBe(evalLin(p, x) + evalLin(q, x));
    }
    expect(sameLin(lin(2, 3), lin(2, 3))).toBe(true);
    expect(sameLin(lin(2, 3), lin(3, 2))).toBe(false);
    expect(isConstLin(lin(0, 24))).toBe(true);
    expect(isConstLin(lin(9, 0))).toBe(false);
  });

  it('ne multiplie deux formes que si l’une est constante (on reste au 1er degré)', () => {
    expect(mulLin(lin(0, 2), lin(1, 4))).toEqual(lin(2, 8));
    expect(mulLin(lin(1, 4), lin(0, 2))).toEqual(lin(2, 8));
    expect(mulLin(lin(1, 0), lin(1, 0))).toBeNull();
  });
});

/* ── 2. foldCards : la suite de cartes du Traducteur ──────────────── */
describe('foldCards', () => {
  const term = (l) => ({ kind: 'term', value: l });
  const op = (o) => ({ kind: 'op', op: o });

  it('replie « 2 × (x + 4) + 2x » en 4x + 8', () => {
    const tokens = [term(lin(0, 2)), op('×'), term(lin(1, 4)), op('+'), term(lin(2, 0))];
    expect(foldCards(tokens)).toEqual(lin(4, 8));
  });

  it('refuse une suite mal formée (opérateur en bout, deux opérateurs, x fois x)', () => {
    expect(foldCards([term(lin(1, 0)), op('+')])).toBeNull();
    expect(foldCards([op('+'), term(lin(1, 0))])).toBeNull();
    expect(foldCards([term(lin(1, 0)), op('+'), op('+'), term(lin(1, 0))])).toBeNull();
    expect(foldCards([term(lin(1, 0)), op('×'), term(lin(1, 0))])).toBeNull();
    expect(foldCards([])).toBeNull();
  });
});

/* ── 3. solveLinear (spec test 1) ─────────────────────────────────── */
describe('solveLinear', () => {
  it('résout 9n = 24 + 5n → 6 et 9n = 25 + 5n → 6,25', () => {
    expect(solveLinear(FORFAIT.equation)).toEqual({ kind: 'unique', x: 6 });
    expect(solveLinear(FORFAIT_25.equation)).toEqual({ kind: 'unique', x: 6.25 });
  });

  it('résout 2x + 13 = 35 → 11 et 4x + 8 = 62 → 13,5', () => {
    expect(solveLinear(AGES.equation)).toEqual({ kind: 'unique', x: 11 });
    expect(solveLinear(RECTANGLE_62.equation)).toEqual({ kind: 'unique', x: 13.5 });
  });

  it('distingue « aucune solution » et « toutes »', () => {
    expect(solveLinear(equation(lin(1, 1), lin(1, 2)))).toEqual({ kind: 'none' });
    expect(solveLinear(equation(lin(2, 4), lin(2, 4)))).toEqual({ kind: 'all' });
  });

  it('vérifie l’invariant : les deux membres coïncident en la solution', () => {
    const { x } = solveLinear(PROGRAMME.equation);
    expect(evalLin(PROGRAMME.equation.left, x)).toBe(evalLin(PROGRAMME.equation.right, x));
  });
});

/* ── 4. isEquivalentEquation / isSolvedForm (spec test 2 + risque C8) ── */
describe('isEquivalentEquation', () => {
  it('accepte 2x + 2(x + 4) = 40 comme équivalent de 4x + 8 = 40', () => {
    const assemblee = equation(addLin(lin(2, 0), scaleLin(lin(1, 4), 2)), lin(0, 40));
    const attendue = equation(lin(4, 8), lin(0, 40));
    expect(isEquivalentEquation(assemblee, attendue)).toBe(true);
    // symétrique
    expect(isEquivalentEquation(attendue, assemblee)).toBe(true);
  });

  it('refuse 3x = 25 + 7 comme traduction de 3x + 7 = 25', () => {
    const fausse = equation(lin(3, 0), lin(0, 32));
    expect(isEquivalentEquation(fausse, PROGRAMME.equation)).toBe(false);
  });

  it('reconnaît une forme RÉSOLUE (x = 8) : équivalente, mais pas une traduction', () => {
    const resolue = equation(lin(1, 0), lin(0, 6));
    expect(isEquivalentEquation(resolue, PROGRAMME.equation)).toBe(true);
    expect(isSolvedForm(resolue)).toBe(true);
    expect(isSolvedForm(PROGRAMME.equation)).toBe(false);
    expect(isSolvedForm(equation(lin(0, 6), lin(1, 0)))).toBe(true);
  });
});

/* ── 5. tryTable + planCost (spec tests 3 et 8) ───────────────────── */
describe('tryTable et planCost', () => {
  it('4x + 8 = 62 n’est jamais égal sur 10, 12, 14 — mais l’est en 13,5', () => {
    const rows = tryTable(RECTANGLE_62.equation, [10, 12, 14]);
    expect(rows.every((r) => !r.equal)).toBe(true);
    expect(rows.map((r) => r.left)).toEqual([48, 56, 64]);
    expect(tryTable(RECTANGLE_62.equation, [13.5])[0].equal).toBe(true);
    // `equal` ⇔ `diff === 0`
    expect(rows.every((r) => r.equal === (r.diff === 0))).toBe(true);
  });

  it('le forfait coïncide exactement en n = 6', () => {
    const rows = tryTable(FORFAIT.equation, [4, 5, 6, 7]);
    expect(rows.filter((r) => r.equal).map((r) => r.x)).toEqual([6]);
    expect(rows.find((r) => r.x === 6).left).toBe(54);
  });

  it('planCost n’oublie pas la part fixe : 24 + 5 × 4 = 44 (et non 68)', () => {
    expect(planCost(24, 5, 4)).toBe(44);
    expect(planCost(24, 5, 2)).toBe(34);
    expect(planCost(0, 9, 4)).toBe(36);
  });
});

/* ── 6. interpret (spec test 4) ───────────────────────────────────── */
describe('interpret', () => {
  it('6,25 séances avec contrainte « entier » devient « dès 7 séances »', () => {
    const r = interpret(6.25, { integer: true, min: 0, unit: 'séances' });
    expect(r).toMatchObject({ ok: true, kind: 'ceil', value: 7 });
    expect(r.reason).toBe('dès 7 séances');
  });

  it('un âge de −2 ans est rejeté', () => {
    const r = interpret(-2, { min: 0, unit: 'ans' });
    expect(r.ok).toBe(false);
    expect(r.kind).toBe('reject');
    expect(r.value).toBeNull();
    expect(r.reason).toContain('impossible');
  });

  it('laisse passer une valeur exacte et sait arrondir par défaut', () => {
    expect(interpret(11, AGES.constraints)).toMatchObject({ ok: true, kind: 'exact', value: 11 });
    expect(interpret(6.25, { integer: true, round: 'floor', unit: 'séances' }))
      .toMatchObject({ kind: 'floor', value: 6 });
    // sans contrainte d'entier, 13,5 cm reste 13,5 cm
    expect(interpret(13.5, { min: 0, unit: 'cm' })).toMatchObject({ kind: 'exact', value: 13.5 });
  });
});

/* ── 7. rewriteQuantities / storyValues (spec tests 5 et 6) ───────── */
describe('rewriteQuantities et storyValues', () => {
  it('avec « âge de Tom » comme x : Léa = x + 3 et la somme dans 5 ans = 2x + 13', () => {
    const rw = rewriteQuantities(AGES, 'tom');
    expect(rw).not.toBeNull();
    const byId = Object.fromEntries(rw.map((q) => [q.id, q.lin]));
    expect(byId.tom).toEqual(lin(1, 0));
    expect(byId.lea).toEqual(lin(1, 3));
    expect(byId.somme5).toEqual(lin(2, 13));
  });

  it('avec « âge de Léa » comme x : Tom = x − 3 — l’autre entrée est valable aussi', () => {
    const rw = rewriteQuantities(AGES, 'lea');
    expect(rw).not.toBeNull();
    expect(rw.find((q) => q.id === 'tom').lin).toEqual(lin(1, -3));
    expect(rw.find((q) => q.id === 'somme5').lin).toEqual(lin(2, 7));
  });

  it('avec « la somme » comme x, aucune quantité ne se réécrit → null', () => {
    expect(rewriteQuantities(AGES, 'somme')).toBeNull();
    expect(rewriteQuantities(AGES, null)).toBeNull();
  });

  it('storyValues remet x dans l’HISTOIRE : Tom 11, Léa 14, dans 5 ans 16 + 19 = 35', () => {
    const vals = storyValues(AGES, 'tom', 11);
    const byId = Object.fromEntries(vals.map((v) => [v.id, v.value]));
    expect(byId.tom).toBe(11);
    expect(byId.lea).toBe(14);
    expect(byId.tom5).toBe(16);
    expect(byId.lea5).toBe(19);
    expect(byId.somme5).toBe(35);
    expect(byId.tom5 + byId.lea5).toBe(byId.somme5);
    expect(storyValues(AGES, 'somme', 11)).toBeNull();
  });
});

/* ── 8. nextValidSteps (spec test 7) ──────────────────────────────── */
describe('nextValidSteps', () => {
  it('propose « − 13 des deux côtés » sur 2x + 13 = 35, donnant 2x = 22', () => {
    const steps = nextValidSteps(AGES.equation);
    const sub = steps.find((s) => s.id === 'sub-b');
    expect(sub).toBeDefined();
    expect(sub.label).toBe('− 13 des deux côtés');
    expect(sub.eq).toEqual(equation(lin(2, 0), lin(0, 22)));
  });

  it('puis « ÷ 2 des deux côtés » sur 2x = 22, donnant x = 11', () => {
    const steps = nextValidSteps(equation(lin(2, 0), lin(0, 22)));
    const div = steps.find((s) => s.id === 'div-a');
    expect(div).toBeDefined();
    expect(div.eq).toEqual(equation(lin(1, 0), lin(0, 11)));
    expect(isSolvedForm(div.eq)).toBe(true);
  });

  it('retire les x du membre de droite : 9n = 5n + 24 → 4n = 24', () => {
    const steps = nextValidSteps(FORFAIT.equation, 'n');
    const subx = steps.find((s) => s.id === 'sub-ax');
    expect(subx).toBeDefined();
    expect(subx.label).toBe('− 5n des deux côtés');
    expect(subx.eq).toEqual(equation(lin(4, 0), lin(0, 24)));
  });

  it('TOUTES les sorties sont équivalentes à l’entrée (invariant de la spec)', () => {
    for (const eq of [AGES.equation, FORFAIT.equation, PROGRAMME.equation, RECTANGLE_62.equation]) {
      const steps = nextValidSteps(eq);
      expect(steps.length).toBeGreaterThan(0);
      for (const s of steps) expect(isEquivalentEquation(s.eq, eq)).toBe(true);
    }
  });
});

/* ── 9. Formatage (spec test 9) ───────────────────────────────────── */
describe('formatLin / formatEquation / plainMath', () => {
  it('écrit 9n = 5n + 24 avec la lettre choisie', () => {
    expect(formatEquation(FORFAIT.equation, 'n')).toBe('9n = 5n + 24');
    expect(formatEquation(AGES.equation)).toBe('2x + 13 = 35');
    expect(formatEquation(PROGRAMME.equation)).toBe('3x + 7 = 25');
  });

  it('gère les coefficients 0, 1 et −1 et les décimaux à la française', () => {
    expect(formatLin(lin(0, 24))).toBe('24');
    expect(formatLin(lin(1, 0))).toBe('x');
    expect(formatLin(lin(-1, 0))).toBe('-x');
    expect(formatLin(lin(1, -3))).toBe('x - 3');
    expect(formatLin(lin(62.5, 0))).toBe('62{,}5x');
    expect(plainMath(formatLin(lin(62.5, -13.5)))).toBe('62,5x − 13,5');
  });
});
