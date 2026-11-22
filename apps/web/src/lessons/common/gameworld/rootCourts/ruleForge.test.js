import { describe, it, expect } from 'vitest';
import {
  TILES,
  tiles,
  tileWord,
  byTiles,
  rodFor,
  caseOf,
  caseId,
  runCase,
  evidenceOf,
  courtPool,
  courtFact,
  COURT_TEXT,
} from './ruleForge';
import { outcome } from './logic';

const AREAS = ['1', '2', '4', '9', '16', '30', '36', '0,25', '49/64'];
const RODS = ['1', '2', '3', '4', '5', '6', '0,5', '0,875', '-3', 'wall'];
const POOL = courtPool({ areas: AREAS, rods: RODS });
/** An independent judge (floats are exact for these few numbers): a rod rides when its square is the area. */
const num = (t) => (t === '49/64' ? 49 / 64 : Number(t.replace(',', '.')));
const ridesByHand = (a, s) => s === 'wall' || num(s) ** 2 === num(a);

describe('a number of tiles, agreed (defects.md B11)', () => {
  it('1, 2, 3–10, 11+, the hundreds — and a decimal or a fraction takes « بلاطة »', () => {
    expect(tiles(1)).toBe('بلاطة واحدة');
    expect(tiles('2')).toBe('بلاطتان');
    expect(tiles(3)).toBe('3 بلاطات');
    expect(tiles(10)).toBe('10 بلاطات');
    expect(tiles(11)).toBe('11 بلاطة');
    expect(tiles(30)).toBe('30 بلاطة');
    expect(tiles(100)).toBe('100 بلاطة');
    expect(tiles(103)).toBe('103 بلاطات');
    expect(tiles(0)).toBe('0 بلاطة');
    expect(tiles('0,0791')).toBe('0,0791 بلاطة');
    expect(tiles('49/64')).toBe('49/64 بلاطة');
    expect(TILES).toHaveLength(5);
  });
  it('the noun alone under a written number, and after « بـ »', () => {
    expect([1, 2, 5, 30, 103, '0,25', '49/64'].map(tileWord)).toEqual([
      'بلاطة واحدة',
      'بلاطتان',
      'بلاطات',
      'بلاطة',
      'بلاطات',
      'بلاطة',
      'بلاطة',
    ]);
    expect([1, 2, 6, 15, '0,0304'].map(byTiles)).toEqual([
      'ببلاطة واحدة',
      'ببلاطتين',
      'بـ 6 بلاطات',
      'بـ 15 بلاطة',
      'بـ 0,0304 بلاطة',
    ]);
  });
});

describe('a court and a rod as a case', () => {
  it('reads a rod in every form, and writes it once', () => {
    expect(rodFor('30', 'wall')).toEqual({ root: '30' });
    expect(rodFor('30', '5.470')).toEqual({ q: '5,47' });
    expect(rodFor('30', 6)).toEqual({ q: '6' });
    expect(rodFor('30', { q: '5.470' })).toEqual({ q: '5,47' });
    expect(rodFor('30', { root: '49/64' })).toEqual({ root: '0,765625' });
  });
  it('every case of a small pool holds exactly when the platform rides — checked by an independent judge', () => {
    expect(POOL).toHaveLength(AREAS.length * RODS.length);
    for (const a of AREAS)
      for (const s of RODS) {
        const c = caseOf(a, s);
        expect(c.held, `${a} / ${s}`).toBe(ridesByHand(a, s));
        expect(c.kind).toBe(runCase(c).kind);
        expect(runCase(c)).toEqual(outcome(rodFor(a, s), a));
        expect(c.a).toBe(a); // the area stays written as it was given
      }
    // the counts of the pool: 9 walls ride, and the rods whose square is the area — 1, 2→4, 3→9, 4→16, 6→36, 0,5, 0,875, -3→9
    expect(POOL.filter((c) => c.held)).toHaveLength(9 + 8);
    expect(POOL.filter((c) => c.kind === 'jam').length + POOL.filter((c) => c.kind === 'band').length).toBe(90 - 17);
  });
  it('a forge that asks another question keeps its own `held`; the world’s `kind` is still computed', () => {
    const c = caseOf('30', '5', { held: true, tag: 'tag', kind: 'ride' });
    expect(c).toMatchObject({ held: true, tag: 'tag', kind: 'band' });
  });
  it('one identity per court and rod, whatever their writing; `id` overrides it', () => {
    expect(caseId(caseOf('49/64', 'wall'))).toBe(caseId(caseOf('0,765625', { root: '0,765625' })));
    expect(caseId(caseOf('30', '5.470'))).toBe(caseId(caseOf('30', '5,47')));
    expect(caseId(caseOf('30', '5'))).not.toBe(caseId(caseOf('30', '6')));
    expect(caseId({ ...caseOf('30', '5'), id: 'mine' })).toBe('mine');
    const ids = POOL.map(caseId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('the evidence from the world’s log', () => {
  it('one line per case, the newest kept at its newest place; what he made stays his own', () => {
    const rows = evidenceOf([
      { a: '30', s: { q: '5' } },
      { a: '30', s: { q: '6' } },
      { a: '36', s: { q: '6' }, mirror: true },
      { a: '30', s: { q: '5' }, tag: 'again', mirror: true },
      { a: '36', s: { q: '6' }, mirror: true },
    ]);
    expect(rows.map(caseId)).toEqual(['30|6', '30|5', '36|6']);
    expect(rows.map((r) => r.mirror)).toEqual([false, false, true]);
    expect(rows[1].tag).toBe('again');
    expect(rows.map((r) => r.held)).toEqual([false, false, true]);
    expect(evidenceOf([], {})).toEqual([]);
    expect(evidenceOf(POOL, { max: 3 })).toHaveLength(3);
  });
  it('the cases the kit hands back (with `held` and `kind`) are read again unchanged', () => {
    const once = evidenceOf(POOL.map((c) => ({ ...c })));
    expect(evidenceOf(once)).toEqual(once);
  });
});

describe('a pool of cases', () => {
  it('builds its pool from a function of the area and gives each case its extras', () => {
    const pool = courtPool({
      areas: [30, 36],
      rods: (a) => ['5', 'wall', a === '36' ? '6' : '5'],
      extra: (a) => ({ tag: a }),
    });
    expect(pool.map(caseId)).toEqual(['30|5', '30|√30', '36|5', '36|√36', '36|6']);
    expect(pool.every((c) => c.tag === c.a)).toBe(true);
  });
});

describe('what the mirror says about a case — facts, agreed, isolated', () => {
  it('names what the world did, with the right agreement at 1, 2, 3–10 and 11+', () => {
    expect(courtFact(caseOf('36', '6'))).toBe('تركب المنصّة المصعد: غطّت الساحة بالضبط.');
    expect(courtFact(caseOf('26', '5'))).toBe('يبقى شريط مساحته بلاطة واحدة.');
    expect(courtFact(caseOf('27', '5'))).toBe('يبقى شريط مساحته بلاطتان.');
    expect(courtFact(caseOf('30', '5'))).toBe('يبقى شريط مساحته 5 بلاطات.');
    expect(courtFact(caseOf('36', '5'))).toBe('يبقى شريط مساحته 11 بلاطة.');
    expect(courtFact(caseOf('35', '6'))).toBe('تعلق على الحافّة: تزيد على الساحة ببلاطة واحدة.');
    expect(courtFact(caseOf('34', '6'))).toBe('تعلق على الحافّة: تزيد على الساحة ببلاطتين.');
    expect(courtFact(caseOf('30', '6'))).toBe('تعلق على الحافّة: تزيد على الساحة بـ 6 بلاطات.');
    expect(courtFact(caseOf('30', '5,47'))).toBe('يبقى شريط مساحته 0,0791 بلاطة.');
    // a fraction over a real bar (a MathText sentence), never « 33/64 » as text (defects.md D41)
    expect(courtFact(caseOf('49/64', '0,5'))).toBe('يبقى شريط مساحته $\\dfrac{33}{64}$ بلاطة.');
    expect(courtFact(caseOf('49/64', '1'))).toBe('تعلق على الحافّة: تزيد على الساحة بـ $\\dfrac{15}{64}$ بلاطة.');
    expect(courtFact(caseOf('2', '17/12'))).toBe('تعلق على الحافّة: تزيد على الساحة بـ $\\dfrac{1}{144}$ بلاطة.');
    for (const c of [caseOf('49/64', '0,5'), caseOf('2', '7/5'), caseOf('2', '3/2'), caseOf('121/36', '2')])
      expect(courtFact(c).replace(/\$[^$]*\$/g, '')).not.toMatch(/\d\s*\/\s*\d/);
  });
  it('every plain sentence holds no « $ », no « wrong », and every rod sits in a left-to-right isolate', () => {
    const plain = ['ask', 'fact', 'attack', 'refuted'];
    for (const c of POOL)
      for (const k of plain) {
        const t = COURT_TEXT[k]({ ...c, says: !c.held });
        // the fact is drawn by MathText: its only formula is a fraction over a real bar
        expect(k === 'fact' ? t.replace(/\$\\dfrac\{\d+\}\{\d+\}\$/g, '') : t, k).not.toMatch(/\$|خطأ|خاطئ/);
        if (k !== 'fact') expect(t).toContain(`⁦${c.s.root != null ? `√${c.s.root}` : c.s.q}⁩`);
      }
    for (const k of ['says', 'broken']) for (const v of [true, false]) expect(COURT_TEXT[k](v)).not.toMatch(/\$/);
    expect(COURT_TEXT.compare([caseOf('30', '5'), caseOf('30', '6')])).toContain('30 بلاطة');
  });
  it('writes the platform’s tiles beside the court’s — none for a wall, a negative rod in brackets, a fraction with its bar', () => {
    expect(COURT_TEXT.eq(caseOf('30', '5'))).toBe('$5 \\times 5 = 25 \\; \\textcolor{#fbbf24}{<} \\; 30$');
    expect(COURT_TEXT.eq(caseOf('30', '6'))).toBe('$6 \\times 6 = 36 \\; \\textcolor{#c4b5fd}{>} \\; 30$');
    expect(COURT_TEXT.eq(caseOf('9', '-3'))).toBe('$(-3) \\times (-3) = 9 \\; \\textcolor{#34d399}{=} \\; 9$');
    expect(COURT_TEXT.eq(caseOf('49/64', '0,875'))).toBe(
      '$0{,}875 \\times 0{,}875 = \\dfrac{49}{64} \\; \\textcolor{#34d399}{=} \\; \\dfrac{49}{64}$',
    );
    expect(COURT_TEXT.eq(caseOf('30', 'wall'))).toBeNull();
  });
});
