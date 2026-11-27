/**
 * The experiment `angles` played without a browser on the design's numbers (UNIT_3E_THALES_DESIGN.md, Lesson 1 › K2;
 * gate A 4th, notes 2–5). `ANGLES_SPEC` is an EXAMPLE of the shape a lesson's `inquiries.js` writes.
 */
import { describe, expect, it } from 'vitest';
import {
  initAngles,
  anglesReducer,
  anglesResult,
  triOf,
  toMeasure,
  thirdTex,
  drawnTex,
  slideOf,
  homologues,
  snapReading,
  MAGNET,
} from './angles';
import { ANGLES_TEXT } from './anglesText';

const FACE = { names: 'ABC', angles: ['27', '41'] };
const ANGLES_SPEC = {
  kind: 'angles',
  rounds: [
    // R1: the face 27° ; 41° and a block 41° ; 27° turned and flipped; the sides opposite 112°: 6 and 8
    {
      a: { ...FACE, side: '6' },
      b: { names: 'DEF', angles: ['41', '27'], side: '8', turn: 140, flip: true },
      measure: true,
    },
    // R2: 27° ; 41° against 27° ; 55°: one equal angle — the sides opposite it, 6 and 8
    {
      a: { ...FACE, side: '6', opp: 0 },
      b: { names: 'GHI', angles: ['27', '55'], side: '8', opp: 0, turn: 200 },
      measure: true,
    },
    // R3: the block's angles are the face's × 1,25, drawn by the world: 33,75° ; 51,25° ; 140° — 225°
    { a: { ...FACE }, b: { names: 'JKL', times: '1,25' }, measure: true, drawn: true },
    // R4: two sides proportional (4 ; 6 against 6 ; 9), the angle between them 27° against 41°: no protractor
    {
      a: { names: 'MNP', between: { sides: ['4', '6'], angle: '27' } },
      b: { names: 'RST', between: { sides: ['6', '9'], angle: '41' }, turn: 90, flip: true },
      measure: false,
    },
  ],
};

const run = (spec, s, actions) => actions.reduce((acc, a) => anglesReducer(spec, acc, a), s);
const readAt = (t, v, deg) => [{ type: 'place', t, v }, { type: 'needle', deg }, { type: 'read' }];

describe('angles: the triangles of a round, exact', () => {
  it('the third angle is 180 − x − y; × 1,25 gives 33,75 ; 51,25 ; 140 (225: it does not close)', () => {
    const [R1, R2, R3, R4] = ANGLES_SPEC.rounds;
    expect(triOf(R1, 'a').angles).toEqual(['27', '41', '112']);
    expect(triOf(R1, 'b').angles).toEqual(['41', '27', '112']);
    expect(triOf(R2, 'b').angles).toEqual(['27', '55', '98']);
    const J = triOf(R3, 'b');
    expect(J.angles).toEqual(['33,75', '51,25', '140']);
    expect(J.sum).toBe('225');
    expect(J.closes).toBe(false);
    expect(triOf(R4, 'a').between).toEqual({ sides: ['4', '6'], angle: '27' });
    expect(toMeasure(R1)).toEqual(['a', 'b']);
    expect(toMeasure(R3)).toEqual(['a']);
    expect(toMeasure(R4)).toEqual([]);
  });

  it('every whole pair x + y < 180: the third closes the triangle exactly', () => {
    for (let x = 1; x < 179; x += 1)
      for (let y = 1; x + y < 180; y += 7) {
        const t = triOf({ a: { names: 'ABC', angles: [String(x), String(y)] } }, 'a');
        expect(t.angles[2]).toBe(String(180 - x - y));
        expect(t.closes).toBe(true);
      }
  });

  it('the world writes the third with its THREE terms, in the order he read — never a partial sum (note 2)', () => {
    const A = triOf(ANGLES_SPEC.rounds[0], 'a');
    expect(thirdTex(A, [0, 1])).toBe('\\widehat{C} = 180^\\circ - 27^\\circ - 41^\\circ = 112^\\circ');
    expect(thirdTex(A, [1, 2])).toBe('\\widehat{A} = 180^\\circ - 41^\\circ - 112^\\circ = 27^\\circ');
    for (const read of [
      [0, 1],
      [1, 0],
      [0, 2],
      [2, 1],
    ]) {
      const line = thirdTex(A, read);
      expect(line).not.toMatch(/\b(68|153|139)\b/); // 27 + 41, 41 + 112, 27 + 112: never on screen
      expect(line.match(/\^\\circ/g)).toHaveLength(4);
    }
    const J = triOf(ANGLES_SPEC.rounds[2], 'b');
    expect(drawnTex(J)).toBe(
      '\\widehat{J} + \\widehat{K} + \\widehat{L} = 33{,}75^\\circ + 51{,}25^\\circ + 140^\\circ = 225^\\circ',
    );
  });
});

describe('angles: the slide decides, exactly', () => {
  it('R1 covers (× 8 ÷ 6), R2 does not, R3 cannot close, R4 fails', () => {
    const [R1, R2, R3, R4] = ANGLES_SPEC.rounds;
    expect(slideOf(R1)).toMatchObject({ fact: 'covers', top: '8', bottom: '6' });
    // the written sides' ends: A (27) on E (27), B (41) on D (41)
    expect(slideOf(R1).map).toEqual([
      [0, 1],
      [1, 0],
    ]);
    expect(slideOf(R2)).toMatchObject({ fact: 'apart', top: '8', bottom: '6' });
    expect(slideOf(R3)).toMatchObject({ fact: 'open', top: null });
    expect(slideOf(R4)).toMatchObject({ fact: 'apart', top: '6', bottom: '4' });
    // the same sides with the same angle: the slide covers (the sides alone never decide)
    const same = { ...R4, b: { ...R4.b, between: { sides: ['6', '9'], angle: '27' } } };
    expect(slideOf(same).fact).toBe('covers');
    const notProp = { ...R4, b: { ...R4.b, between: { sides: ['6', '8'], angle: '27' } } };
    expect(slideOf(notProp).fact).toBe('apart');
  });

  it('two triangles cover exactly when their three angles are the same and the written sides face the same angle', () => {
    const angles = [
      ['27', '41'],
      ['41', '27'],
      ['27', '112'],
      ['27', '55'],
      ['30', '41'],
    ];
    for (const x of angles)
      for (const y of angles)
        for (const opp of [0, 1, 2]) {
          const r = { a: { names: 'ABC', angles: x, side: '6' }, b: { names: 'DEF', angles: y, side: '8', opp } };
          const A = triOf(r, 'a');
          const B = triOf(r, 'b');
          const same = [...A.angles].sort().join() === [...B.angles].sort().join();
          expect(slideOf(r).fact).toBe(same && A.angles[2] === B.angles[opp] ? 'covers' : 'apart');
        }
  });

  it('the homologous vertices and sides of two triangles of the same angles (a last step reads them)', () => {
    const r = { a: { names: 'ABC', angles: ['27', '41'] }, b: { names: 'UVW', angles: ['112', '27'] } };
    expect(homologues(r)).toEqual({
      vertex: { A: 'V', B: 'W', C: 'U' },
      side: { AB: 'VW', BC: 'WU', AC: 'VU' },
    });
    expect(homologues(ANGLES_SPEC.rounds[1])).toBeNull();
    expect(homologues(ANGLES_SPEC.rounds[2])).toBeNull();
  });
});

describe('angles: the state machine, with wrong moves', () => {
  it('R1: a wrong reading is a fact, the right one is kept; after two, the third; then he predicts and it covers', () => {
    let s = initAngles(ANGLES_SPEC);
    expect(s.stage).toBe('measure');
    // nothing happens before the protractor is on a vertex; a prediction is refused while measuring
    expect(run(ANGLES_SPEC, s, [{ type: 'read' }, { type: 'say', v: 'same' }, { type: 'slide' }])).toEqual(s);
    s = run(ANGLES_SPEC, s, readAt('a', 0, 26));
    expect(s).toMatchObject({ off: true, misreads: 1, read: { a: [], b: [] } });
    s = run(ANGLES_SPEC, s, [{ type: 'turn', d: 1 }, { type: 'read' }]);
    expect(s).toMatchObject({ off: false, at: null, read: { a: [0], b: [] } });
    // a vertex read is not read again
    expect(anglesReducer(ANGLES_SPEC, s, { type: 'place', t: 'a', v: 0 })).toBe(s);
    s = run(ANGLES_SPEC, s, readAt('a', 2, 112));
    expect(s.read.a).toEqual([0, 2]);
    // a triangle read twice takes no more protractor
    expect(anglesReducer(ANGLES_SPEC, s, { type: 'place', t: 'a', v: 1 })).toBe(s);
    s = run(ANGLES_SPEC, s, [...readAt('b', 0, 41), ...readAt('b', 1, 27)]);
    expect(s.stage).toBe('predict');
    expect(anglesReducer(ANGLES_SPEC, s, { type: 'slide' })).toBe(s); // nothing said yet
    s = run(ANGLES_SPEC, s, [{ type: 'say', v: 'same' }, { type: 'slide' }]);
    expect(s.stage).toBe('slid');
    expect(s.rows[0]).toEqual({
      round: 0,
      said: 'same',
      fact: 'covers',
      right: true,
      read: { a: ['27', '112'], b: ['41', '27'] },
      third: { a: '41', b: '112' },
      misreads: 1,
      quotient: ['8', '6'],
    });
  });

  it('the needle reads whole degrees from 0 to 180; the magnet lays a drag let go near the side on it', () => {
    const R1 = ANGLES_SPEC.rounds[0];
    expect(snapReading(R1, 'a', 0, 26.6)).toBe(27);
    expect(snapReading(R1, 'a', 0, -12)).toBe(0);
    expect(snapReading(R1, 'a', 0, 250)).toBe(180);
    expect(snapReading(R1, 'a', 0, 27 + MAGNET, true)).toBe(27);
    expect(snapReading(R1, 'a', 0, 27 + MAGNET + 1, true)).toBe(27 + MAGNET + 1);
    expect(snapReading(R1, 'a', 0, 29)).toBe(29); // no magnet on the keys
    let s = run(ANGLES_SPEC, initAngles(ANGLES_SPEC), [
      { type: 'place', t: 'a', v: 1 },
      { type: 'needle', deg: 39.2, magnet: true },
    ]);
    expect(s.needle).toBe(41);
    s = run(ANGLES_SPEC, s, [{ type: 'turn', d: 200 }]);
    expect(s.needle).toBe(180);
  });

  it('the four rounds played through: R2 apart, R3 open (b is never measured), R4 opens on the prediction', () => {
    let s = initAngles(ANGLES_SPEC);
    s = run(ANGLES_SPEC, s, [
      ...readAt('a', 0, 27),
      ...readAt('a', 1, 41),
      ...readAt('b', 0, 41),
      ...readAt('b', 1, 27),
      { type: 'say', v: 'other' },
      { type: 'slide' },
      { type: 'next' },
    ]);
    expect(s.rows[0]).toMatchObject({ fact: 'covers', right: false });
    expect(s).toMatchObject({ i: 1, stage: 'measure', read: { a: [], b: [] }, said: null });
    s = run(ANGLES_SPEC, s, [
      ...readAt('a', 0, 27),
      ...readAt('a', 1, 41),
      ...readAt('b', 0, 27),
      ...readAt('b', 2, 98),
      { type: 'say', v: 'same' },
      { type: 'slide' },
      { type: 'next' },
    ]);
    expect(s.rows[1]).toMatchObject({ fact: 'apart', right: false, third: { a: '112', b: '55' } });
    expect(s.i).toBe(2);
    expect(anglesReducer(ANGLES_SPEC, s, { type: 'place', t: 'b', v: 0 })).toBe(s); // the world draws b
    s = run(ANGLES_SPEC, s, [...readAt('a', 0, 27), ...readAt('a', 1, 41)]);
    expect(s.stage).toBe('predict');
    s = run(ANGLES_SPEC, s, [{ type: 'say', v: 'other' }, { type: 'slide' }]);
    expect(s.rows[2]).toMatchObject({ fact: 'open', right: true, quotient: null, third: { a: '112', b: null } });
    s = anglesReducer(ANGLES_SPEC, s, { type: 'next' });
    expect(s).toMatchObject({ i: 3, stage: 'predict' });
    expect(anglesReducer(ANGLES_SPEC, s, { type: 'place', t: 'a', v: 0 })).toBe(s); // no protractor in R4
    s = run(ANGLES_SPEC, s, [{ type: 'say', v: 'other' }, { type: 'slide' }]);
    expect(s.rows[3]).toMatchObject({ fact: 'apart', right: true, quotient: ['6', '4'], read: { a: [], b: [] } });
    s = anglesReducer(ANGLES_SPEC, s, { type: 'next' });
    expect(s.done).toBe(true);
    expect(anglesResult(s).rows.map((r) => r.fact)).toEqual(['covers', 'apart', 'open', 'apart']);
  });

  it('a spec without rounds, or a triangle without enough angles, is refused', () => {
    expect(() => initAngles({ kind: 'angles', rounds: [] })).toThrow();
    expect(() => initAngles({ kind: 'angles', rounds: [{ a: { names: 'ABC', angles: ['27'] }, b: FACE }] })).toThrow();
    expect(() =>
      initAngles({ kind: 'angles', rounds: [{ a: { names: 'AB', angles: ['27', '41'] }, b: FACE }] }),
    ).toThrow();
  });
});

describe('angles: its words', () => {
  it('French typography, and no word of a rule (« semblable », « proportionnel », « égaux »)', () => {
    const all = JSON.stringify(ANGLES_TEXT) + ANGLES_TEXT.leadDrawn('ABC') + ANGLES_TEXT.pick('ABC');
    expect(all).not.toMatch(/semblab|proportion|égaux|homolog|\bsomme\b/i);
    expect(all).not.toMatch(/ [:;!?]/); // a plain space before « : ; ! ? »
    expect(all).not.toContain("'");
    expect(ANGLES_TEXT.ask).toMatch(/ \?$/);
    expect(ANGLES_TEXT.pick('ABC')).toMatch(/ :$/);
  });
});
