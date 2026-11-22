import { describe, it, expect } from 'vitest';
import * as linear from '@smarter-academy/core/arithmetic/linear.js';
import * as LS from '@smarter-academy/core/arithmetic/linearSystem.js';
import * as E from './eliminationCards';

const T = (p) => linear.fracText(p);
const lineTexs = (lab) => lab.lines.map((l) => l.tex);

/** Jouer une méthode jusqu'à la ثنائية. */
function runSub(src, from, v, into, backOn = into) {
  let lab = E.init(src);
  lab = E.isolateFrom(lab, from, v);
  lab = E.substituteInto(lab, into);
  while (lab.stage === 'one') lab = E.solveStep(lab);
  return E.backSubstitute(lab, backOn);
}
function runAdd(src, k1, k2, backOn = 1) {
  let lab = E.init(src);
  lab = E.setScale(lab, 1, k1);
  lab = E.setScale(lab, 2, k2);
  lab = E.stack(lab, 1, 2);
  while (lab.stage === 'one') lab = E.solveStep(lab);
  return E.backSubstitute(lab, backOn);
}

/**
 * elimination-cards — la logique RÉELLE qu'EliminationCards.jsx importe, sur les nombres du
 * manuel : نشاط 2 (2x + y = 7 ; 3x − 2y = 4,2 — التلميذ 1 et التلميذ 2), les deux jumal des
 * طرائق p. 59, et le niveau débutant (x + y = 10 ; x − y = 2).
 */
describe('elimination-cards — نشاط 2, les deux élèves du manuel', () => {
  const ACT2 = '2x+y=7|3x-2y=4,2';

  it('التلميذ 1 : y = 7 − 2x porté dans (2) donne 3x − 2(7 − 2x) = 4,2, puis x = 2,6 et y = 1,8', () => {
    let lab = E.init(ACT2);
    expect(lab.decimal).toBe(true);
    lab = E.isolateFrom(lab, 1, 'y');
    expect(E.exprLine(lab)).toBe('y = 7 - 2x');
    lab = E.substituteInto(lab, 2);
    expect(lab.method).toBe('sub');
    expect(lineTexs(lab)).toEqual(['y = 7 - 2x', '3x - 2(7 - 2x) = 4{,}2']);
    lab = E.solveStep(lab);
    expect(lineTexs(lab).at(-1)).toBe('7x - 14 = 4{,}2');
    lab = E.solveStep(lab);
    expect(lineTexs(lab).at(-1)).toBe('7x = 18{,}2');
    lab = E.solveStep(lab);
    expect(lineTexs(lab).at(-1)).toBe('x = 2{,}6');
    expect(lab.stage).toBe('back');
    lab = E.backSubstitute(lab, 1);
    expect(lab.stage).toBe('done');
    expect(lineTexs(lab).slice(-3)).toEqual(['2 \\times 2{,}6 + y = 7', 'y = 1{,}8', '(2{,}6 ; 1{,}8)']);
    expect([T(lab.result.x), T(lab.result.y)]).toEqual(['13/5', '9/5']);
    expect(lab.result.checks).toEqual([true, true]);
  });

  it('التلميذ 2 : (1) × 2 posée sur (2) — 2y et −2y s’annulent, 7x = 18,2', () => {
    let lab = E.init(ACT2);
    expect(E.canStack(lab, 1, 2)).toBe('noCancel');
    expect(E.noCancelDetails(lab)).toEqual({ sum: '5x - y = 11{,}2', equalVar: null });
    lab = E.setScale(lab, 1, 2);
    expect(E.leftTex(E.card(lab, 1))).toBe('4x + 2y');
    expect(E.cancelledPairs(lab)).toMatchObject({ v: 'y', count: 2 });
    lab = E.stack(lab, 1, 2);
    expect(lab.method).toBe('add');
    expect(lineTexs(lab)).toEqual([
      '2x + y = 7 \\;\\xrightarrow{\\times 2}\\; 4x + 2y = 14',
      '(4x + 2y) + (3x - 2y) = 14 + 4{,}2',
      '7x = 18{,}2',
    ]);
    lab = E.solveStep(lab);
    expect(lineTexs(lab).at(-1)).toBe('x = 2{,}6');
    lab = E.backSubstitute(lab, 2);
    expect(lineTexs(lab).slice(-3)).toEqual(['3 \\times 2{,}6 - 2y = 4{,}2', 'y = 1{,}8', '(2{,}6 ; 1{,}8)']);
  });

  it('les deux méthodes donnent la même ثنائية : la découverte ne s’ouvre qu’après les deux', () => {
    let lab = runSub(ACT2, 1, 'y', 2);
    expect(E.discoveryReady(lab)).toBe(false);
    expect(E.missingMethod(lab)).toBe('add');
    lab = E.restart(lab);
    expect(lab.stage).toBe('cards');
    expect(lab.methodsDone.sub).toEqual({ x: '13/5', y: '9/5' });
    lab = E.setScale(lab, 1, 2);
    lab = E.stack(lab, 2, 1);
    lab = E.solveStep(lab);
    lab = E.backSubstitute(lab, 1);
    expect(E.discoveryReady(lab)).toBe(true);
    expect(lab.attempts.map((a) => a.method)).toEqual(['sub', 'add']);
  });

  it('éliminer x plutôt que y marche aussi (× 3 et × (−2)) ; isoler x de (2) fait apparaître des fractions', () => {
    const lab = runAdd(ACT2, 3, -2);
    expect([T(lab.result.x), T(lab.result.y)]).toEqual(['13/5', '9/5']);
    expect(lab.lines.find((l) => l.key === 'hence').tex).toBe('7y = 12{,}6');
    let s = E.init(ACT2);
    s = E.isolateFrom(s, 2, 'x');
    expect(s.expr.fractional).toBe(true);
    expect(E.exprLine(s)).toBe('x = \\dfrac{2}{3}y + 1{,}4');
    const done = runSub(ACT2, 2, 'x', 1);
    expect([T(done.result.x), T(done.result.y)]).toEqual(['13/5', '9/5']);
  });
});

describe('elimination-cards — les résistances', () => {
  const ACT2 = '2x+y=7|3x-2y=4,2';

  it('porter l’expression sur SA carte est refusé, avec « 7 = 7 » (MISC-TAWID-NAFS-MUADALA)', () => {
    const lab = E.isolateFrom(E.init(ACT2), 1, 'y');
    expect(E.canSubstitute(lab, 1, 'y')).toBe('sameCard');
    expect(E.sameCardDetails(lab)).toEqual({ line: '2x + (7 - 2x) = 7', identity: '7 = 7', vanished: true });
    expect(E.substituteInto(lab, 1)).toBe(lab);
  });

  it('l’expression de y ne remplace pas x ; × 0 est refusé ; rien ne s’annule sans multiplicateur', () => {
    const lab = E.isolateFrom(E.init(ACT2), 1, 'y');
    expect(E.canSubstitute(lab, 2, 'x')).toBe('wrongUnknown');
    expect(E.canScale(E.init(ACT2), 1, 0)).toBe('zero');
    expect(E.setScale(E.init(ACT2), 1, 0).scale[1]).toBe(1);
    expect(E.canScale(E.init(ACT2), 1, 9)).toBe('scaleRange');
  });

  it('des coefficients ÉGAUX ne s’annulent pas : il faut un multiplicateur négatif (MISC-JAM-LA-TAAKUS)', () => {
    const lab = E.init('3x-y=-1|3x+y=5');
    expect(E.canStack(lab, 1, 2)).toBe(true); // y et −y : déjà opposés
    const same = E.init('4x+2y=9|4x-3y=6');
    expect(E.canStack(same, 1, 2)).toBe('noCancel');
    expect(E.noCancelDetails(same).equalVar).toBe('x');
    const fixed = E.setScale(same, 2, -1);
    expect(E.canStack(fixed, 1, 2)).toBe(true);
  });

  it('rien ne se fait hors de son étape ; l’expression ne va que sur une carte qui a cette inconnue', () => {
    const lab = E.init('x+y=10|x-y=2');
    expect(E.canSubstitute(lab, 2, 'y')).toBe('notNow');
    expect(E.canBack(lab, 1)).toBe('notNow');
    const noY = E.init('x=4|x+y=10');
    // y isolée de (2) ne peut pas aller dans (1), qui n'a pas de y
    expect(E.canSubstitute(E.isolateFrom(noY, 2, 'y'), 1, 'y')).toBe('noUnknownHere');
    let s = E.isolateFrom(noY, 1, 'x');
    s = E.substituteInto(s, 2);
    while (s.stage === 'one') s = E.solveStep(s);
    expect(s.found).toMatchObject({ v: 'y' });
    s = E.backSubstitute(s, 1);
    expect([T(s.result.x), T(s.result.y)]).toEqual(['4', '6']);
  });
});

describe('elimination-cards — طرائق p. 59 et le niveau débutant', () => {
  it('jumla (1) par التعويض : y = x − 2, 3x + (x − 2) = −4, 4x − 2 = −4, 4x = −2, x = −1/2, y = −5/2', () => {
    const lab = runSub('3x+y=-4|x-y=2', 2, 'y', 1, 2);
    expect(lineTexs(lab)).toEqual([
      'y = x - 2', '3x + (x - 2) = -4', '4x - 2 = -4', '4x = -2', 'x = -\\dfrac{1}{2}',
      '-\\dfrac{1}{2} - y = 2', 'y = -\\dfrac{5}{2}', '\\left(-\\dfrac{1}{2} ; -\\dfrac{5}{2}\\right)',
    ]);
  });

  it('jumla (2) par الجمع : 5y = 15, y = 3, puis 4x + 2 × 3 = 9, x = 3/4', () => {
    const lab = runAdd('4x+2y=9|-4x+3y=6', 1, 1, 1);
    expect(lineTexs(lab)).toEqual([
      '(4x + 2y) + (-4x + 3y) = 9 + 6', '5y = 15', 'y = 3', '4x + 2 \\times 3 = 9', 'x = \\dfrac{3}{4}', '\\left(\\dfrac{3}{4} ; 3\\right)',
    ]);
  });

  it('débutant : y et −y déjà opposés — une seule carte posée sur l’autre, (6 ; 4)', () => {
    const lab = runAdd('x+y=10|x-y=2', 1, 1, 1);
    expect(lab.lines.map((l) => l.key)).toEqual(['sum', 'hence', 'value', 'back', 'value', 'pair']);
    expect([T(lab.result.x), T(lab.result.y)]).toEqual(['6', '4']);
    const sub = runSub('x+y=10|x-y=2', 1, 'y', 2);
    expect(lineTexs(sub).slice(0, 2)).toEqual(['y = 10 - x', 'x - (10 - x) = 2']);
    expect(lab.pairs).toMatchObject({ v: 'y', count: 1 });
  });
});

describe('elimination-cards — balayage', () => {
  // Les jumal du manuel destinées à la leçon (ex-5 … ex-23, دوري الآن) : chaque chemin raisonnable
  // (isoler chaque inconnue de chaque carte ; les multiplicateurs minimaux pour chaque inconnue)
  // donne la ثنائية de linearSystem.classify, et la vérification tient dans les deux équations.
  const SYSTEMS = [
    'x+3y=10|3x+5y=18', '2x-3y=1|3x+5y=21', '-x+3y=2|2x+y=3', '5x+4y=16|3x+6y=15', '2x-y=1|3x+5y=21',
    '3x+7y=11|-5x+2y=5', '-2x+y=0|3x-y=4', 'x+y=12|3x+2y=31', '4x-3y=1|12x-y=-5', '6x-5y=0|2x-y=12',
    '2x+y=6|1/2x-y=-2', '6x-2y=8|x+3y=1', '8x+3y=39,5|7x+9y=50,5', '2x+y=1|-2x+4y=-6', 'x+4y=7|5x+3y=1',
  ];
  for (const src of SYSTEMS) {
    it(src, () => {
      const sys = E.parseSystem(src);
      const truth = LS.classify(sys);
      const want = [T(truth.x), T(truth.y)];
      for (const from of E.CARDS) {
        for (const v of E.VARS) {
          if (E.canIsolate(E.init(src), from, v) !== true) continue;
          const lab = runSub(src, from, v, 3 - from, 3 - from);
          expect([T(lab.result.x), T(lab.result.y)], `${src} sub ${from}/${v}`).toEqual(want);
          expect(lab.result.checks).toEqual([true, true]);
          expect(E.checkLines(lab)).toHaveLength(2);
        }
      }
      for (const v of E.VARS) {
        const f = LS.eliminationFactors(sys[0], sys[1], v);
        if (!f || Math.abs(f[0]) > E.SCALE_MAX || Math.abs(f[1]) > E.SCALE_MAX) continue;
        const lab = runAdd(src, f[0], f[1], 1);
        expect([T(lab.result.x), T(lab.result.y)], `${src} add ${v}`).toEqual(want);
      }
    });
  }

  it('les tuiles : un petit entier est compté, un grand ou un décimal porte son coefficient', () => {
    expect(E.tilesOf(linear.frac(-2))).toEqual({ count: 2, negative: true, label: null });
    expect(E.tilesOf(linear.parseNumber('4,2')).count).toBe(1);
    expect(E.tilesOf(linear.frac(12)).label).toEqual(linear.frac(12));
  });
});
