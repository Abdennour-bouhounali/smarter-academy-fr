import { describe, it, expect } from 'vitest';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import * as L from './vectorChain';
import { LEVELS } from '../levels';

const BEG = LEVELS['vector-chain'].beginner.numbers;
const ADV = LEVELS['vector-chain'].advanced.numbers;
/** دوري الآن p. 138 : A, B, C, E placés par la plateforme (le manuel ne donne pas la figure). */
const NOW138 = {
  mode: 'construct', stations: { A: [0, 0], B: [4, 1], C: [1, 3], E: [6, 4] }, radius: 2,
  builds: [{ terms: ['AB', 'AC'], centre: 'E', name: 'E_1' }, { terms: ['BE', 'CA'], centre: 'E', name: 'E_2' }],
};
const id = (lab, name) => L.current(lab).tray.find((c) => c.name === name).id;

describe('vector-chain — names and data', () => {
  it('reads a named vector, its reverse and its KaTeX', () => {
    expect(L.ends('HK')).toEqual(['H', 'K']);
    expect(L.reverse('AO')).toBe('OA');
    expect(L.sumTex(['OA', '0'])).toBe('\\overrightarrow{OA} + \\overrightarrow{0}');
    expect(() => L.ends('A')).toThrow();
  });

  it('ex-18 figure: every given is TRUE on the figure (init would throw otherwise)', () => {
    expect(() => L.init(ADV)).not.toThrow();
    expect(() => L.init({ ...ADV, givens: [{ eq: ['BH', 'OA'] }] })).toThrow(/fausse/);
  });

  it('justifies an equality by a given, its reversal, or a chain of givens — never by the drawing', () => {
    const lab = L.init(ADV);
    expect(L.justify(lab, 'HB', 'OA')).not.toBeNull();              // BH = AO renversé
    expect(L.justify(lab, 'CL', 'AO')).toHaveLength(2);              // CL = OC (déf.) et OC = AO (milieu)
    expect(L.justify(lab, 'AD', 'BC')).not.toBeNull();               // ABCD متوازي أضلاع
    // vraies sur la figure, mais ce sont les CONCLUSIONS de l'exercice : jamais justifiées
    expect(V.vecEq(V.vec(lab.stations.O, lab.stations.L), V.vec(lab.stations.A, lab.stations.C))).toBe(true);
    expect(L.justify(lab, 'OL', 'AC')).toBeNull();
    expect(L.justify(lab, 'HK', 'AC')).toBeNull();
    expect(L.justify(lab, 'CK', 'AH')).toBeNull();                   // la somme de la définition n'est pas un échange
  });
});

describe('vector-chain — coupling (علاقة شال)', () => {
  it('beginner mission 1: BC then AB in FRONT gives AC; after the tail it is refused with the two stations', () => {
    let lab = L.init(BEG);
    lab = L.couple(lab, id(lab, 'BC'), 'tail');
    expect(L.current(lab).train).toBe('BC');
    const refused = L.couple(lab, id(lab, 'AB'), 'tail');
    expect(refused.last).toMatchObject({ ok: false, reason: 'chainTail', arrive: 'C', depart: 'A' });
    expect(L.current(refused).train).toBe('BC');
    lab = L.couple(lab, id(lab, 'AB'), 'head');
    expect(L.current(lab).train).toBe('AC');
    expect(L.status(lab)).toBe('complete');
    expect(lab.done).toEqual([true, false]);
    expect(L.proofChain(lab, 0)).toBe('\\overrightarrow{BC} + \\overrightarrow{AB} = \\overrightarrow{AC}');
  });

  it('two opposite vectors cancel into the zero vector, and 0 + u = u', () => {
    let lab = L.init(ADV);
    lab = L.goTo(lab, 1);
    lab = L.translateCard(lab, id(lab, 'HB'), 'O');
    lab = L.couple(lab, id(lab, 'OA'), 'tail');
    lab = L.couple(lab, id(lab, 'AO'), 'tail');
    expect(L.current(lab).train).toBe('0');
    expect(lab.last.reason).toBe('opposite');
    lab = L.couple(lab, id(lab, 'AB'), 'head');
    expect(L.current(lab).train).toBe('AB');
    expect(lab.last.reason).toBe('zero');
  });

  it('the value of the expression never changes under an accepted gesture (sweep of both levels)', () => {
    for (const numbers of [BEG, ADV]) {
      let lab = L.init(numbers);
      for (let mi = 0; mi < lab.missions.length; mi += 1) {
        lab = L.goTo(lab, mi);
        const v0 = L.value(lab, L.expression(L.current(lab)));
        // tous les gestes possibles, un à un, depuis l'état initial
        const ms = L.current(lab);
        for (const card of ms.tray) {
          for (const U of Object.keys(lab.stations)) {
            const after = L.translateCard(lab, card.id, U);
            expect(V.vecEq(L.value(after, L.expression(L.current(after))), v0)).toBe(true);
          }
          for (const end of ['head', 'tail']) {
            const after = L.couple(lab, card.id, end);
            expect(V.vecEq(L.value(after, L.expression(L.current(after))), v0)).toBe(true);
          }
        }
      }
    }
  });
});

describe('vector-chain — translation (تساوي شعاعين)', () => {
  it('beginner mission 2: AB + AD is not a chain; AD carried to B becomes BC (ABCD), then AB + BC = AC', () => {
    let lab = L.goTo(L.init(BEG), 1);
    lab = L.couple(lab, id(lab, 'AB'), 'tail');
    expect(L.couple(lab, id(lab, 'AD'), 'tail').last.reason).toBe('chainTail');
    expect(L.couple(lab, id(lab, 'AD'), 'head').last.reason).toBe('chainHead');
    lab = L.translateCard(lab, id(lab, 'AD'), 'B');
    expect(lab.last).toMatchObject({ ok: true, to: 'BC' });
    lab = L.couple(lab, id(lab, 'BC'), 'tail');
    expect(L.current(lab).train).toBe('AC');
    expect(lab.done).toEqual([false, true]);
  });

  it('a representative that lands on no station is refused, naming the opposite one the student probably meant', () => {
    const lab = L.goTo(L.init(BEG), 1);
    const p = L.probe(lab, 'AB', 'C');                  // C + AB n'est pas une station ; CD = −AB
    expect(p).toMatchObject({ kind: 'nowhere', opposite: 'CD' });
    const after = L.translateCard(lab, id(lab, 'AB'), 'C');
    expect(after.last).toMatchObject({ ok: false, reason: 'nowhere', opposite: 'CD' });
    expect(L.probe(lab, 'AB', 'A')).toEqual({ kind: 'same' });
    expect(L.translateCard(lab, id(lab, 'AB'), 'A')).toBe(lab);
  });

  it('ex-18: OL carried to A lands on C (OL = AC on the figure) but is REFUSED — it is what must be proved', () => {
    let lab = L.init(ADV);
    lab = L.couple(lab, id(lab, 'OC'), 'tail');
    lab = L.couple(lab, id(lab, 'CL'), 'tail');
    expect(L.current(lab).train).toBe('OL');
    expect(L.status(lab)).toBe('offTarget');
    const refused = L.translateCard(lab, 'train', 'A');
    expect(refused.last).toMatchObject({ ok: false, reason: 'notGiven', to: 'AC' });
  });

  it('ex-18 question 2, mission OL: CL → OC (def. of L), OC → AO (O midpoint), AO + OC = AC', () => {
    let lab = L.init(ADV);
    lab = L.translateCard(lab, id(lab, 'CL'), 'O');
    expect(lab.last.to).toBe('OC');
    const first = L.current(lab).tray[0].id;
    lab = L.translateCard(lab, first, 'A');
    expect(lab.last.to).toBe('AO');
    lab = L.couple(lab, L.current(lab).tray[1].id, 'tail');
    lab = L.couple(lab, L.current(lab).tray[0].id, 'head');
    expect(L.current(lab).train).toBe('AC');
    expect(L.status(lab)).toBe('complete');
    expect(L.proofChain(lab, 0)).toBe(
      '\\overrightarrow{OL} = \\overrightarrow{OC} + \\overrightarrow{CL} = \\overrightarrow{OC} + \\overrightarrow{OC}'
      + ' = \\overrightarrow{AO} + \\overrightarrow{OC} = \\overrightarrow{AC}',
    );
  });

  it('ex-18 question 2, mission HK: the textbook\'s chain HK = HB + BC + CK = … = AC', () => {
    let lab = L.goTo(L.init(ADV), 1);
    lab = L.translateCard(lab, id(lab, 'HB'), 'O');
    lab = L.couple(lab, id(lab, 'OA'), 'tail');
    lab = L.couple(lab, id(lab, 'AO'), 'tail');
    lab = L.couple(lab, id(lab, 'AB'), 'tail');
    lab = L.couple(lab, id(lab, 'BC'), 'tail');
    expect(L.current(lab).train).toBe('AC');
    expect(lab.done).toEqual([false, true]);
    const lines = L.proofLines(lab, 1);
    expect(lines[0].tex).toBe('\\overrightarrow{HK} = \\overrightarrow{HB} + \\overrightarrow{BC} + \\overrightarrow{CK}');
    expect(lines[1]).toMatchObject({ reason: { kind: 'def' } });
    expect(lines.at(-1).tex).toBe('= \\overrightarrow{AC}');
    expect(L.discoveryReady(lab)).toBe(false);
  });

  it('undo restores the previous expression; a mission keeps its state when the student switches', () => {
    let lab = L.init(ADV);
    lab = L.translateCard(lab, id(lab, 'CL'), 'O');
    expect(L.canUndo(lab)).toBe(true);
    lab = L.goTo(lab, 1);
    lab = L.goTo(lab, 0);
    expect(L.expression(L.current(lab))).toEqual(['OC', 'OC']);
    lab = L.undo(lab);
    expect(L.expression(L.current(lab))).toEqual(['OC', 'CL']);
    expect(L.canUndo(lab)).toBe(false);
  });
});

describe('vector-chain — construct (دوري الآن ص 138)', () => {
  it('Γ1 from E: AB at E, then AC at the tip — E1 = E + AB + AC (the builder\'s (11 ; 8))', () => {
    let lab = L.init(NOW138);
    const [ab, ac] = L.currentBuild(lab).tray.map((c) => c.id);
    lab = L.place(lab, ab, 'st:E');
    expect(L.canPlace(lab, ac, 'st:A')).toBe('ownStart');
    expect(L.canPlace(lab, ac, 'st:B')).toBe('notTip');
    lab = L.place(lab, ac, 'tip');
    expect(V.coords(L.currentBuild(lab).found)).toEqual([11, 8]);
    expect(L.currentBuild(lab).sum).toBeNull();
  });

  it('Γ1 by the parallelogram at A then a translation: the resultant carried to E gives the same E1', () => {
    let lab = L.init(NOW138);
    const [ab, ac] = L.currentBuild(lab).tray.map((c) => c.id);
    lab = L.place(lab, ab, 'st:A');
    lab = L.place(lab, ac, 'tip');
    expect(V.coords(L.currentBuild(lab).sum.to)).toEqual([5, 4]);   // AD, ABDC متوازي أضلاع
    expect(L.canPlace(lab, 'sum', 'st:B')).toBe('notCentre');
    lab = L.place(lab, 'sum', 'st:E');
    expect(V.coords(L.currentBuild(lab).found)).toEqual([11, 8]);
  });

  it('Γ2: BE + CA from E — E2 = (7 ; 4), in either order; discovery after both circles', () => {
    let lab = L.goTo(L.init(NOW138), 1);
    const [be, ca] = L.currentBuild(lab).tray.map((c) => c.id);
    lab = L.place(lab, ca, 'st:E');
    lab = L.place(lab, be, 'tip');
    expect(V.coords(L.currentBuild(lab).found)).toEqual([7, 4]);
    expect(L.discoveryReady(lab)).toBe(false);
    lab = L.goTo(lab, 0);
    const [ab, ac] = L.currentBuild(lab).tray.map((c) => c.id);
    lab = L.place(L.place(lab, ab, 'st:E'), ac, 'tip');
    expect(L.discoveryReady(lab)).toBe(true);
  });

  it('the frame contains every reachable tip and both image circles', () => {
    const lab = L.init(NOW138);
    const fr = L.frame(lab);
    expect(fr.maxX).toBeGreaterThanOrEqual(13);   // E1 (11 ; 8) + rayon 2
    expect(fr.maxY).toBeGreaterThanOrEqual(10);
    expect(fr.minY).toBeLessThanOrEqual(-3);      // A + CA
  });
});

describe('vector-chain — the map scale', () => {
  it('keeps one unit equal on both axes and every station inside the box, at five widths', () => {
    for (const numbers of [BEG, ADV, NOW138]) {
      const lab = L.init(numbers);
      const fr = L.frame(lab);
      for (const w of [260, 320, 420, 600, 760]) {
        const h = Math.min(L.naturalHeight(fr, w), 420);
        const s = L.mapScale(fr, { width: w, height: h });
        for (const p of Object.values(numbers.stations)) {
          const [x, y] = s.to(p);
          expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThanOrEqual(w);
          expect(y).toBeGreaterThanOrEqual(0); expect(y).toBeLessThanOrEqual(h);
        }
        const [a] = [s.to([0, 0])]; const b = s.to([1, 1]);
        expect(Math.abs((b[0] - a[0]) + (b[1] - a[1]))).toBeLessThan(1e-9);
      }
    }
  });
});
