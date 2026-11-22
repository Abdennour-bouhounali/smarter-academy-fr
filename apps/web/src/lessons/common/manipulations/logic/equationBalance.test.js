import { describe, it, expect } from 'vitest';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as B from './equationBalance';

const { fracText } = Lin;
const run = (lab, moves) => moves.reduce((s, [side, g]) => B.gesture(s, side, g), lab);

describe('equation-balance — la balance (unité 4, حل معادلة من الدرجة الأولى)', () => {
  it('lit les équations du manuel et cache la vraie valeur des sacs', () => {
    expect(fracText(B.init('9x+1=-26').x)).toBe('-3');      // نشاط 1، فاطمة
    expect(fracText(B.init('9x+1=2x').x)).toBe('-1/7');     // نشاط 1، مصطفى
    expect(fracText(B.init('4x-3=2x+6').x)).toBe('9/2');    // معارف 1
    expect(fracText(B.init('3x+2=11').x)).toBe('3');
    expect(() => B.init('2x+1=2x+3')).toThrow();            // aucune solution : pas une balance
    expect(() => B.init('x^2=4')).toThrow();
  });

  it('un geste sur UN plateau fait pencher ; le même effet sur l’autre le rétablit', () => {
    let lab = B.init('3x+2=11');
    expect(B.isBalanced(lab)).toBe(true);
    lab = B.gesture(lab, 'L', 'remove:ball');
    expect(B.tilt(lab)).toBe(-1);            // la gauche est plus légère : elle monte
    expect(lab.tippedSeen).toBe(true);
    expect(B.canGesture(lab, 'L', 'add:bag')).toBe('tipped');   // autre chose : refusé
    expect(B.canGesture(lab, 'R', 'add:balloon')).toBe(true);   // −1 aussi : poser une baudruche = ôter un ballon
    lab = B.gesture(lab, 'R', 'remove:ball');
    expect(B.isBalanced(lab)).toBe(true);
    expect(lab.pending).toBeNull();
    expect(B.equationTex(lab.pans)).toBe('3x + 1 = 10');
    expect(B.steps(lab)[0]).toMatchObject({ op: '3x + 2 - 1 = 11 - 1', result: '3x + 1 = 10', key: 'opSubUnits' });
  });

  it('se reprendre (geste inverse sur le plateau touché) annule sans écrire d’étape', () => {
    let lab = B.gesture(B.init('3x+2=11'), 'L', 'add:ball');
    expect(B.canGesture(lab, 'R', 'remove:ball')).toBe('tipped'); // inverse sur un plateau NON touché
    lab = B.gesture(lab, 'L', 'remove:ball');
    expect(lab.pending).toBeNull();
    expect(B.steps(lab)).toHaveLength(0);
  });

  it('résout 3x + 2 = 11 : ôter 2 ballons de chaque côté, puis partager en 3', () => {
    let lab = run(B.init('3x+2=11'), [['L', 'remove:ball'], ['L', 'remove:ball'], ['R', 'remove:ball'], ['R', 'remove:ball']]);
    expect(B.steps(lab).map((s) => s.op)).toEqual(['3x + 2 - 2 = 11 - 2']);
    expect(B.canDivide(lab, 2)).toMatchObject({ reason: 'bagsUneven', side: 'L', n: 3, q: 1, r: 1 });
    expect(B.canDivide(lab, 3)).toBe(true);
    lab = B.divide(lab, 3);
    expect(B.equationTex(lab.pans)).toBe('x = 3');
    expect(B.isSolved(lab)).toBe(true);
    expect(B.discoveryReady(lab)).toBe(false);   // pas encore vérifié
    expect(B.substitution(lab)).toMatchObject({ equal: true });
    expect(fracText(B.substitution(lab).left)).toBe('11');
    lab = B.verify(lab);
    expect(B.discoveryReady(lab)).toBe(true);
  });

  it('فاطمة : 9x + 1 = −26 → 9x = −27 → x = −3 (le sac contient des baudruches)', () => {
    let lab = B.init('9x+1=-26');
    lab = B.gesture(lab, 'L', 'remove:ball');            // −1 à gauche
    expect(B.canGesture(lab, 'R', 'remove:ball')).toBe('noneHere'); // il n'y a pas de ballon à droite
    lab = B.gesture(lab, 'R', 'add:balloon');            // −1 à droite : la même opération
    expect(B.equationTex(lab.pans)).toBe('9x = -27');
    expect(B.drawCounts(lab.pans.R)).toMatchObject({ balloons: 27, balls: 0 });
    lab = B.divide(lab, 9);
    expect(B.equationTex(lab.pans)).toBe('x = -3');
    expect(B.steps(lab).map((s) => s.op)).toEqual(['9x + 1 - 1 = -26 - 1', '\\dfrac{9x}{9} = \\dfrac{-27}{9}']);
    expect(fracText(B.readValue(lab))).toBe('-3');
    expect(B.substitutedTex(lab.start.L, B.readValue(lab))).toBe('9 \\times (-3) + 1');
    expect(B.substitutedTex(lab.start.R, B.readValue(lab))).toBe('-26');
  });

  it('une baudruche sur un plateau à ballons : paire nulle, la charge nette baisse', () => {
    const lab = B.gesture(B.init('3x+2=11'), 'L', 'add:balloon');
    expect(lab.zero).toEqual({ side: 'L', kind: 'unit' });
    expect(B.panTex(lab.pans.L)).toBe('3x + 1');
  });

  it('معارف 1 : 4x − 3 = 2x + 6 → 2x − 3 = 6 → 2x = 9 → x = 9/2 (quatre ballons et demi)', () => {
    let lab = B.init('4x-3=2x+6');
    lab = run(lab, [['L', 'remove:bag'], ['L', 'remove:bag'], ['R', 'remove:bag'], ['R', 'remove:bag']]);
    expect(B.equationTex(lab.pans)).toBe('2x - 3 = 6');
    expect(B.steps(lab)[0].op).toBe('4x - 3 - 2x = 2x + 6 - 2x');
    expect(B.canDivide(lab, 2)).toMatchObject({ reason: 'cutMixed', side: 'L' }); // 3 baudruches à couper avec des sacs
    lab = run(lab, [['L', 'add:ball'], ['L', 'add:ball'], ['L', 'add:ball'], ['R', 'add:ball'], ['R', 'add:ball'], ['R', 'add:ball']]);
    expect(B.equationTex(lab.pans)).toBe('2x = 9');
    lab = B.divide(lab, 2);
    expect(B.equationTex(lab.pans)).toBe('x = \\dfrac{9}{2}');
    expect(B.drawCounts(lab.pans.R)).toMatchObject({ balls: 4, part: { n: 1, d: 2, negative: false } });
  });

  it('مصطفى : 9x + 1 = 2x → x = −1/7 — un septième de baudruche', () => {
    let lab = B.init('9x+1=2x');
    lab = run(lab, [['L', 'remove:bag'], ['R', 'remove:bag'], ['L', 'remove:bag'], ['R', 'remove:bag'], ['L', 'remove:ball'], ['R', 'add:balloon']]);
    expect(B.equationTex(lab.pans)).toBe('7x = -1');
    lab = B.divide(lab, 7);
    expect(fracText(B.readValue(lab))).toBe('-1/7');
    expect(B.drawCounts(lab.pans.R)).toMatchObject({ balloons: 0, part: { n: 1, d: 7, negative: true } });
  });

  it('x dans le plateau de DROITE et sacs-ballons : 2x − 3 = 3x + 1 (تمرين 4)', () => {
    let lab = B.init('2x-3=3x+1');
    lab = run(lab, [['L', 'remove:bag'], ['R', 'remove:bag'], ['L', 'remove:bag'], ['R', 'remove:bag']]);
    expect(B.equationTex(lab.pans)).toBe('-3 = x + 1');
    lab = run(lab, [['R', 'remove:ball'], ['L', 'add:balloon']]);
    expect(B.equationTex(lab.pans)).toBe('-4 = x');
    expect(B.solvedSide(lab)).toBe('R');
    // un sac-ballon (−x) : 4x − 3 = −2x + 5 met deux sacs-ballons à droite
    const anti = B.init('4x-3=-2x+5');
    expect(B.drawCounts(anti.pans.R)).toMatchObject({ antis: 2 });
    expect(B.canGesture(anti, 'R', 'remove:anti')).toBe(true);
  });

  it('le partage est refusé tant que le fléau penche, et sans aucun sac', () => {
    const tipped = B.gesture(B.init('3x+2=11'), 'L', 'add:ball');
    expect(B.canDivide(tipped, 3)).toEqual({ reason: 'tipped' });
    expect(B.canDivide(B.init('3x+2=11'), 1)).toEqual({ reason: '' });
  });

  it('balayage : toute suite d’étapes appariées garde la balance et la même solution', () => {
    const effects = ['add:ball', 'add:balloon', 'add:bag', 'add:anti'];
    for (const src of ['3x+2=11', '9x+1=-26', '4x-3=2x+6', '2x-3=3x+1', '5x+11=11x+5']) {
      let lab = B.init(src);
      const x0 = lab.x;
      for (let i = 0; i < 12; i++) {
        const g = effects[i % 4];
        lab = B.gesture(lab, 'L', g);
        lab = B.gesture(lab, 'R', g);
        expect(B.isBalanced(lab), src).toBe(true);
        const { L, R } = lab.pans;
        const sol = Lin.solveEquation(Lin.lin(L.a, L.u), Lin.lin(R.a, R.u));
        if (sol.kind === 'unique') expect(Lin.eq(sol.x, x0), src).toBe(true);
      }
    }
  });
});
