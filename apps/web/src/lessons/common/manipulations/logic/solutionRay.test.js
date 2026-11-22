import { describe, it, expect } from 'vitest';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as S from './solutionRay';

const { frac, eq, satisfies, linAt } = Lin;
const traceAll = (lab, ks) => ks.reduce((l, k) => S.addTrace(l, k), lab);

describe('solution-ray — writing like the textbook', () => {
  it('writes numbers, expressions and substitutions', () => {
    expect(S.numTex(frac(5, 2))).toBe('2{,}5');
    expect(S.numTex(frac(-28, 3))).toBe('-\\dfrac{28}{3}');
    expect(S.exprTex(Lin.linear('-3x+5'))).toBe('-3x + 5');
    expect(S.exprTex(Lin.linear('2,5x+100'))).toBe('2{,}5x + 100');
    expect(S.substitutionTex(Lin.linear('-3x+5'), frac(-4))).toBe('-3 \\times (-4) + 5');
    expect(S.sideTex(Lin.linear('-3x+5'), frac(-5))).toBe('-3 \\times (-5) + 5 = 20');
    expect(S.sideTex(Lin.linear('20'), frac(-5))).toBeNull();
    expect(S.ineqTex(S.parseIneq('-3x+5<=20'))).toBe('-3x + 5 \\leq 20');
    expect(S.ineqTex(S.parseIneq('2,5x+100≤150'))).toBe('2{,}5x + 100 \\leq 150');
  });

  it('reads the four relations and refuses a sentence without one', () => {
    for (const [src, rel] of [['x<3', '<'], ['x>=2', '>='], ['4x>-3', '>'], ['5x<=3', '<=']]) expect(S.parseIneq(src).rel).toBe(rel);
    expect(() => S.parseIneq('2x+1=7')).toThrow();
  });

  it('the textbook glyph convention: turned towards the red part iff the bound is a solution', () => {
    // know-4.convention : x ≤ a « ] », x > a « ] », x ≥ a « [ », x < a « [ »
    expect(S.glyphOf('left', true)).toBe(']');
    expect(S.glyphOf('right', false)).toBe(']');
    expect(S.glyphOf('right', true)).toBe('[');
    expect(S.glyphOf('left', false)).toBe('[');
    const r = S.rayOf(S.parseIneq('x<3'));
    expect([S.sideOf(r), S.closedOf(r)]).toEqual(['left', false]);
  });
});

describe('solution-ray — act-3a, Younes: 2,5x + 100 ≤ 150 on whole numbers', () => {
  const lab0 = S.initLab({ ineq: '2,5x+100<=150', whole: true });
  it('the line runs over whole numbers 0…30 and the bound is 20', () => {
    expect([lab0.kmin, lab0.kmax, lab0.den]).toEqual([0, 30, 1]);
    expect(S.boundK(lab0)).toBe(20);
  });
  it('21 messages refused (152,5 DA), 20 and 16 accepted (150 and 140) — the textbook answers', () => {
    expect(S.evaluate(lab0, 21).ok).toBe(false);
    expect(eq(S.evaluate(lab0, 21).left, frac(305, 2))).toBe(true);
    expect(S.evaluate(lab0, 20).ok).toBe(true);
    expect(eq(S.evaluate(lab0, 16).left, frac(140))).toBe(true);
    expect(S.evaluate(lab0, 2).ok).toBe(true); // س جـ : 2 est solution
  });
  it('a trace is red or grey, once per graduation, and the region discovery needs 3 trials with contrast', () => {
    let lab = traceAll(lab0, [16, 20]);
    expect(S.regionDiscoveryReady(lab)).toBe(false);
    lab = S.addTrace(lab, 16);
    expect(lab.traces).toHaveLength(2);
    lab = S.addTrace(lab, 21);
    expect(lab.traces.map((t) => [t.k, t.ok])).toEqual([[16, true], [20, true], [21, false]]);
    expect(S.regionDiscoveryReady(lab)).toBe(true);
    expect(S.addTrace(lab, 31)).toBe(lab); // hors de la droite
    expect(S.strictRedTrace(lab).k).toBe(16);
    expect(S.greyTrace(lab).k).toBe(21);
  });
});

describe('solution-ray — the bracket (act-3b table, know-4)', () => {
  it('x < 3: the bracket at 3, red on the left, turned AWAY (3 < 3 is false)', () => {
    let lab = S.initLab({ ineq: 'x<3' });
    expect(S.checkBracket(lab, { k: 3, side: 'left', toward: false }).reason).toBe('needContrast');
    lab = traceAll(lab, [0, 5]);
    expect(S.checkBracket(lab, { k: 3, side: 'left', toward: false })).toBe(true);
    const glyph = S.checkBracket(lab, { k: 3, side: 'left', toward: true });
    expect(glyph.reason).toBe('glyph');
    expect(glyph.witness.k).toBe(3);
    expect(glyph.witness.ok).toBe(false);
    const side = S.checkBracket(lab, { k: 3, side: 'right', toward: false });
    expect(side.reason).toBe('side');
    expect(side.witness.fromTrace).toBe(true); // 5 is grey yet coloured, or 0 red yet left out
    const pos = S.checkBracket(lab, { k: 1, side: 'left', toward: false });
    expect(pos.reason).toBe('position');
    expect([1, 2]).toContain(pos.witness.k); // 1 and 2 are solutions left out
    expect(pos.witness.ok).toBe(true);
    expect(S.placeBracket(lab, { k: 3, side: 'left', toward: true }).bracket).toBeNull();
    lab = S.placeBracket(lab, { k: 3, side: 'left', toward: false });
    expect(lab.bracket).toEqual({ k: 3, side: 'left', toward: false });
    expect(S.bracketDiscoveryReady(lab)).toBe(false); // la borne n'a pas été essayée
    expect(S.bracketDiscoveryReady(S.addTrace(lab, 3))).toBe(true);
  });

  it('−3x + 5 ≤ 20: the bound −5 is a solution (20 ≤ 20) — turned TOWARDS the red part on the right', () => {
    let lab = traceAll(S.initLab({ ineq: '-3x+5<=20' }), [-4, 0, -7]);
    expect(S.boundK(lab)).toBe(-5);
    const g = S.checkBracket(lab, { k: -5, side: 'right', toward: false });
    expect(g.reason).toBe('glyph');
    expect(S.sideTex(lab.ineq.L, g.witness.x)).toBe('-3 \\times (-5) + 5 = 20');
    expect(S.checkBracket(lab, { k: -5, side: 'right', toward: true })).toBe(true);
    lab = S.placeBracket(lab, { k: -5, side: 'right', toward: true });
    expect(lab.bracket).not.toBeNull();
  });

  it('a fractional bound is a graduation: 5x ≤ 3 is drawn in fifths and 3/5 is reachable', () => {
    const lab = traceAll(S.initLab({ ineq: '5x<=3' }), [0, 5]);
    expect(lab.den).toBe(5);
    expect(S.boundK(lab)).toBe(3);
    expect(S.checkBracket(lab, { k: 3, side: 'left', toward: true })).toBe(true);
  });

  it('sweep: for every textbook inequality, exactly one placement of the bracket is accepted', () => {
    for (const src of ['x<3', 'x>=2', '-3x+5<=20', '4x>-3', '4x-1<=x+3', '-3x+2>20', '5x<=3', '-7x+1<x-3', '2x-1<=6', '3x-2<6', '4x-1<=17-2x']) {
      let lab = S.initLab({ ineq: src });
      lab = traceAll(lab, [lab.kmin, lab.kmax]);
      let ok = 0;
      for (let k = lab.kmin; k <= lab.kmax; k += 1) {
        for (const side of ['left', 'right']) for (const toward of [true, false]) {
          const v = S.checkBracket(lab, { k, side, toward });
          if (v === true) ok += 1;
          else {
            // every refusal carries a true witness: its truth differs from the placed ray
            expect(v.witness, `${src} ${k} ${side} ${toward} ${v.reason}`).not.toBeNull();
            expect(v.witness.inStudent).not.toBe(v.witness.ok);
            expect(satisfies(lab.ineq.L, lab.ineq.rel, lab.ineq.R, v.witness.x)).toBe(v.witness.ok);
          }
        }
      }
      expect(ok, src).toBe(1);
    }
  });
});

describe('solution-ray — transforming −3x + 5 ≤ 20 over the same traces (act-3b, q1)', () => {
  const start = () => S.placeBracket(traceAll(S.initLab({ ineq: '-3x+5<=20' }), [-7, -4, 0, 2]), { k: -5, side: 'right', toward: true });

  it('step 1 (−5) keeps the direction; keeping is accepted, flipping refused with a trace', () => {
    let lab = start();
    const [card] = S.cardsFor(S.current(lab));
    expect(card.op).toBe('sub');
    expect(S.cardTex(card)).toBe('- 5');
    const bad = S.chooseStep(lab, card, '>=');
    expect(bad.accepted).toBe(false);
    expect(bad.reason).toBe('mustKeep');
    expect(bad.witness.fromTrace).toBe(true);
    const good = S.chooseStep(lab, card, '<=');
    expect(good.accepted).toBe(true);
    lab = good.lab;
    expect(S.ineqTex(S.current(lab))).toBe('-3x \\leq 15');
    return lab;
  });

  it('step 2: ÷(−3) while KEEPING ≤ is refused — the red traces are on the right, x ≤ −5 says left', () => {
    let lab = start();
    lab = S.chooseStep(lab, S.cardsFor(S.current(lab))[0], '<=').lab;
    const cards = S.cardsFor(S.current(lab));
    expect(cards.map(S.cardTex)).toEqual(['\\div 3', '\\div (-3)']);
    const neg = cards[1];
    const bad = S.chooseStep(lab, neg, '<=');
    expect(bad.accepted).toBe(false);
    expect(bad.reason).toBe('mustFlip');
    expect(S.ineqTex(bad.proposed)).toBe('x \\leq -5');
    expect(bad.witness.ok).toBe(true); // a RED trace…
    expect(bad.witness.k).toBeGreaterThan(-5); // …on the right…
    expect(satisfies(bad.proposed.L, bad.proposed.rel, bad.proposed.R, bad.witness.x)).toBe(false); // …left out
    expect(S.flipDiscoveryReady(bad.lab)).toBe(false);
    const good = S.chooseStep(bad.lab, neg, '>=');
    expect(good.accepted).toBe(true);
    lab = good.lab;
    expect(S.ineqTex(S.current(lab))).toBe('x \\geq -5');
    expect(S.transformDone(lab)).toBe(true);
    expect(S.flipDiscoveryReady(lab)).toBe(true);
    expect(lab.refusals).toHaveLength(1);
  });

  it('the other path (÷3 then ×(−1)) is just as correct and also needs the flip', () => {
    let lab = start();
    lab = S.chooseStep(lab, S.cardsFor(S.current(lab))[0], '<=').lab;
    lab = S.chooseStep(lab, { op: 'div', k: frac(3) }, '<=').lab;
    expect(S.ineqTex(S.current(lab))).toBe('-x \\leq 5');
    const [m] = S.cardsFor(S.current(lab));
    expect(S.cardTex(m)).toBe('\\times (-1)');
    expect(S.chooseStep(lab, m, '<=').accepted).toBe(false);
    lab = S.chooseStep(lab, m, '>=').lab;
    expect(S.ineqTex(S.current(lab))).toBe('x \\geq -5');
    expect(S.flipDiscoveryReady(lab)).toBe(true);
  });

  it('invariant: every accepted line has exactly the solutions of the original on the whole line', () => {
    for (const src of ['-3x+5<=20', '4x-1<=x+3', '-3x+2>20', '-7x+1<x-3', '4x-1<=17-2x', '-x/2+2<-1', '3x-2<6']) {
      let lab = S.initLab({ ineq: src });
      lab = traceAll(lab, [lab.kmin, lab.kmax, lab.kmin + 1, lab.kmax - 1]);
      let guard = 0;
      while (!S.transformDone(lab) && guard < 6) {
        const card = S.cardsFor(S.current(lab)).at(-1);
        const c = S.candidates(lab, card);
        const wrong = S.chooseStep(lab, card, c.rel === c.kept.rel ? c.flipped.rel : c.kept.rel);
        expect(wrong.accepted, src).toBe(false);
        expect(wrong.witness, src).not.toBeNull();
        lab = S.chooseStep(lab, card, c.rel).lab;
        const I = S.current(lab);
        for (let k = lab.kmin; k <= lab.kmax; k += 1) {
          const x = S.xOfK(lab, k);
          expect(satisfies(I.L, I.rel, I.R, x), `${src} @ ${k}`).toBe(S.evaluate(lab, k).ok);
        }
        guard += 1;
      }
      expect(S.transformDone(lab), src).toBe(true);
      const final = S.current(lab);
      expect(eq(linAt(final.R, frac(0)), lab.sol.bound)).toBe(true);
      expect(final.rel).toBe(lab.sol.rel);
    }
  });
});

describe('graduation par défaut (hors solution, jamais une trace)', () => {
  it('n\'est ni une solution ni la borne, et aucune trace n\'est écrite', () => {
    for (const [ineq, whole] of [['-3x+5<=20', false], ['x<3', false], ['5x<=3', false], ['4x-1<=x+3', false], ['-7x+1<x-3', false], ['2,5x+100<=150', true]]) {
      const lab = S.initLab({ ineq, whole });
      const k = S.defaultK(lab);
      expect(S.inRange(lab, k)).toBe(true);
      expect(S.evaluate(lab, k).ok).toBe(false);
      expect(k).not.toBe(S.boundK(lab));
      expect(lab.traces).toEqual([]);
    }
  });
  it('balayer toute la droite donne les traces que la main donnerait et ouvre la région', () => {
    let lab = S.initLab({ ineq: '-3x+5<=20' });
    for (let k = lab.kmin; k <= lab.kmax; k += 1) lab = S.addTrace(lab, k);
    expect(lab.traces).toHaveLength(lab.kmax - lab.kmin + 1);
    expect(S.regionDiscoveryReady(lab)).toBe(true);
  });
});
