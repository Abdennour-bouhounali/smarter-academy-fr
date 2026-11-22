import { describe, it, expect } from 'vitest';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import * as L from './midpointDistance';
import { LEVELS } from '../levels';

/**
 * midpoint-distance — le rendez-vous GPS, sur les nombres de levels.js : مبتدئ A(1 ; −1), B(4 ; 3) (milieu (2,5 ; 1),
 * distance 5) ; متقدم نشاط 3 K(5 ; 3), L(−3 ; 1) → J(1 ; 2), puis نشاط 4 L(1 ; −2), K(5 ; 1) → M(5 ; −2), 3, 4, 5.
 */
const { beginner, advanced } = LEVELS['midpoint-distance'];
const at = (s, x, y) => L.commitHeld(s, [x, y]);

describe('midpoint-distance — le rendez-vous (المنتصف)', () => {
  it('beginner: only (2,5 ; 1) is accepted, and the formula is written with the friends’ numbers', () => {
    let s = L.init(beginner.numbers);
    expect(s.stage).toBe('meet');
    expect(L.xy(s.meet.I)).toEqual([2.5, 1]);
    expect(L.judgeMeet(s.meet).kind).not.toBe('ok'); // le départ n'est jamais la réponse
    s = at(s, 2, 1);
    expect(s.last.trial.kind).toBe('off'); // sur ce segment, aucune demi-maille entre A et B sauf le milieu
    expect(s.last.trial.AM).toEqual([1, 2]);
    expect(s.last.trial.MB).toEqual([2, 2]);
    s = at(s, 2.5, 1);
    expect(s.last.trial.kind).toBe('ok');
    expect(s.meet.solved).toBe(true);
    expect(L.meetReady(s)).toBe(true);
    const f = L.midFormulaLatex(s.meet);
    expect(f.x).toBe('x_{I} = \\dfrac{1 + 4}{2} = 2{,}5');
    expect(f.y).toBe('y_{I} = \\dfrac{-1 + 3}{2} = 1');
  });

  it('the two chat proposals are the two misconceptions, both refused with their name', () => {
    let s = L.init(beginner.numbers);
    s = L.commitHeld(L.tryProposal(s, 'sum'));
    expect(s.last.trial.kind).toBe('sum');
    expect(s.last.trial.at).toEqual([5, 2]);
    s = L.commitHeld(L.tryProposal(s, 'diff'));
    expect(s.last.trial.kind).toBe('diff');
    expect(s.last.trial.at).toEqual([1.5, 2]);
    expect(s.meet.solved).toBe(false);
  });

  it('a point off the segment: AM and MB do not share the same منحى ; on A: « end »', () => {
    let s = L.init(beginner.numbers);
    s = at(s, 3, 0);
    expect(s.last.trial.kind).toBe('off');
    s = at(s, 1, -1);
    expect(s.last.trial.kind).toBe('end');
  });

  it('advanced (نشاط 3): J(1 ; 2), KJ = JL = (−4 ; −1), the traps (2 ; 4) and (−4 ; −1)', () => {
    let s = L.init(advanced.numbers);
    expect(s.meet.names).toEqual(['K', 'L', 'J']);
    expect(L.xy(s.meet.sum)).toEqual([2, 4]);
    expect(L.xy(s.meet.diff)).toEqual([-4, -1]);
    s = at(s, 3, 2.5);
    expect(s.last.trial).toMatchObject({ kind: 'unequal', closer: 'A' }); // sur [KL], plus près de K
    s = at(s, 1, 2);
    expect(s.last.trial.kind).toBe('ok');
    expect(s.last.trial.AM).toEqual([-4, -1]);
    expect(s.last.trial.MB).toEqual([-4, -1]);
    expect(L.evidenceOf(s)).toMatchObject({ stage: 'meet', kind: 'ok', AM: [-4, -1], MB: [-4, -1] });
  });

  it('every half-node of the window: exactly one is accepted, and it is vectors.midpoint', () => {
    for (const lv of [beginner, advanced]) {
      const s0 = L.init(lv.numbers);
      const { win } = s0.meet;
      const ok = [];
      for (let x = win.xMin; x <= win.xMax; x += 0.5) {
        for (let y = win.yMin; y <= win.yMax; y += 0.5) {
          if (L.judgeMeet(s0.meet, [x, y]).kind === 'ok') ok.push([x, y]);
        }
      }
      expect(ok).toEqual([L.xy(V.midpoint(s0.meet.A, s0.meet.B))]);
    }
  });

  it('the distance card opens only after the meeting point, and back keeps both states', () => {
    let s = L.init(beginner.numbers);
    expect(L.openDistance(s).stage).toBe('meet');
    s = L.openDistance(at(s, 2.5, 1));
    expect(s.stage).toBe('distance');
    s = L.backToMeet(s);
    expect(s.meet.solved).toBe(true);
    expect(L.openDistance(s).stage).toBe('distance');
  });
});

describe('midpoint-distance — l’escalier et la distance GPS (المسافة)', () => {
  const toDist = (n) => L.openDistance(at(L.init(n), ...L.xy(L.init(n).meet.I)));

  it('beginner: corner (4 ; −1) or (1 ; 3) — legs 3 and 4 ; any other node is refused', () => {
    let s = toDist(beginner.numbers);
    expect(L.judgeCorner(s.dist).kind).not.toBe('ok');
    s = at(s, 3, -1);
    expect(s.last.trial).toMatchObject({ kind: 'slant', first: 'h', missing: 1 });
    s = at(s, 2, 2);
    expect(s.last.trial.kind).toBe('offStreet');
    s = at(s, 4, -1);
    expect(s.last.trial).toMatchObject({ kind: 'ok', which: 'h' });
    expect(s.dist.cornerOk).toBe('h');
    expect([s.dist.h, s.dist.v].map((p) => p.n / p.d)).toEqual([3, 4]);
    expect(L.judgeCorner(s.dist, [1, 3])).toMatchObject({ kind: 'ok', which: 'v' });
  });

  it('the claims: 7 (the streets) and 25 (the square) refused, √25 = 5 accepted', () => {
    let s = toDist(beginner.numbers);
    expect(L.claim(s, 'root')).toBe(s); // pas de réclamation avant l'escalier
    s = at(s, 4, -1);
    s = L.claim(s, 'taxi');
    expect(s.last.trial.kind).toBe('claim-taxi');
    expect(s.dist.taxi.n).toBe(7);
    s = L.claim(s, 'square');
    expect(s.dist.square.n).toBe(25);
    expect(s.dist.solved).toBe(false);
    s = L.claim(s, 'root');
    expect(s.dist.solved).toBe(true);
    expect(L.rootLatex(s.dist)).toBe('5');
    expect(L.distFormulaLatex(s.dist)).toBe('AB = \\sqrt{(4 - 1)^2 + (3 - (-1))^2} = \\sqrt{25} = 5');
    expect(L.discoveryReady(s)).toBe(false); // le rendez-vous a été trouvé du premier coup : pas de contraste
  });

  it('discovery needs a refusal in EACH stage (the contrast)', () => {
    let s = L.init(beginner.numbers);
    s = L.commitHeld(L.tryProposal(s, 'sum'));
    s = L.openDistance(at(s, 2.5, 1));
    s = L.claim(at(s, 1, 3), 'root');
    expect(L.distReady(s)).toBe(false);
    s = L.claim(s, 'taxi');
    expect(L.discoveryReady(s)).toBe(true);
  });

  it('advanced (نشاط 4): from L(1 ; −2) to K(5 ; 1) the corner is M(5 ; −2): LM = 4, MK = 3, KL = 5', () => {
    let s = L.openDistance(at(L.init(advanced.numbers), 1, 2));
    expect(s.dist.names).toEqual(['L', 'K', 'M']);
    s = at(s, 5, -2);
    expect(s.dist.cornerOk).toBe('h');
    expect([s.dist.h, s.dist.v].map((p) => p.n / p.d)).toEqual([4, 3]);
    s = L.claim(s, 'root');
    expect(L.distFormulaLatex(s.dist)).toBe('LK = \\sqrt{(5 - 1)^2 + (1 - (-2))^2} = \\sqrt{25} = 5');
    expect(L.evidenceOf(s)).toMatchObject({ stage: 'distance', kind: 'claim-ok', corner: [5, -2], h: 4, v: 3, root: '5' });
  });

  it('advanced: after a distance CLAIM (a trial without `at`) the meet reading neither throws nor shows (régression)', () => {
    let s = L.openDistance(at(L.init(advanced.numbers), 1, 2));
    expect(L.meetReadingLive(s, true)).toBe(false);
    s = L.claim(at(s, 5, -2), 'taxi');
    expect(s.last.trial.at).toBeUndefined();
    expect(() => L.meetReadingLive(s, true)).not.toThrow();
    expect(L.meetReadingLive(s, true)).toBe(false);
    s = L.backToMeet(s);
    expect(L.meetReadingLive(s, true)).toBe(false);
    expect(L.meetReadingLive(L.commitHeld(s), true)).toBe(true); // re-validated pin: the reading shows again
    expect(L.meetReadingLive(s, false)).toBe(true);
  });

  it('a fixed staircase does not move until it is reopened', () => {
    let s = at(toDist(beginner.numbers), 4, -1);
    expect(L.moveHeld(s, 0, 0)).toBe(s);
    s = L.reopenCorner(s);
    expect(L.xy(L.moveHeld(s, 0, 0).dist.C)).toEqual([0, 0]);
  });

  it('the exact distance is never a decimal: √52 = 2√13 for A(−2 ; −1), B(4 ; 3)', () => {
    const s = L.init({ A: [-2, -1], B: [4, 3] });
    expect(L.rootLatex(s.dist)).toBe('2\\sqrt{13}');
    expect(L.distFormulaLatex(s.dist)).toBe('AB = \\sqrt{(4 - (-2))^2 + (3 - (-1))^2} = \\sqrt{52} = 2\\sqrt{13}');
  });
});

describe('midpoint-distance — la carte (cadre, échelle)', () => {
  it('every window contains its points and O, and is a near-square block (≤ 1,6)', () => {
    for (const lv of [beginner, advanced]) {
      const s = L.init(lv.numbers);
      for (const [w, pts] of [[s.meet.win, [s.meet.A, s.meet.B, s.meet.sum, s.meet.diff, s.meet.M]], [s.dist.win, [s.dist.A, s.dist.B, s.dist.cornerH, s.dist.cornerV, s.dist.C]]]) {
        for (const p of pts) {
          const [x, y] = L.xy(p);
          expect(x >= w.xMin && x <= w.xMax && y >= w.yMin && y <= w.yMax).toBe(true);
        }
        expect(w.xMin < 0 && w.xMax > 0 && w.yMin < 0 && w.yMax > 0).toBe(true);
        const r = (w.xMax - w.xMin) / (w.yMax - w.yMin);
        expect(Math.max(r, 1 / r)).toBeLessThanOrEqual(1.6);
      }
    }
  });

  it('frame: every node of the window lands inside the scene, and fromPx inverts px/py', () => {
    const s = L.init(advanced.numbers);
    for (const [w, h] of [[300, 220], [720, 480], [380, 380]]) {
      const fr = L.frame(s, { width: w, height: h });
      for (let x = fr.win.xMin; x <= fr.win.xMax; x += 1) {
        for (let y = fr.win.yMin; y <= fr.win.yMax; y += 1) {
          const [X, Y] = [fr.px(x), fr.py(y)];
          expect(X >= 0 && X <= w && Y >= 0 && Y <= h).toBe(true);
          const [bx, by] = fr.fromPx(X, Y);
          expect(Math.abs(bx - x) + Math.abs(by - y)).toBeLessThan(1e-9);
        }
      }
    }
  });
});
