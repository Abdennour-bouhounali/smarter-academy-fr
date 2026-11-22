import { describe, it, expect } from 'vitest';
import * as M from './missingNumber.js';

const q = M.parse;
const T = M.text;

describe('missingNumber — rationnels exacts', () => {
  it('parse : virgule, point, fraction, chiffres arabes ; texte à la virgule', () => {
    expect(T(q('25,3'))).toBe('25,3');
    expect(T(q('25.3'))).toBe('25,3');
    expect(T(q('٢٥٫٣'))).toBe('25,3');
    expect(T(q('20/7'))).toBe('20/7');
    expect(T(q('6/9'))).toBe('2/3');
    expect(q('abc')).toBeNull();
    expect(q('1/0')).toBeNull();
    expect(T(q('-0,45'))).toBe('-0,45');
  });
  it('décimal exact ou fraction : 20/7 ne s\'arrête pas, 41,6/13 = 3,2', () => {
    expect(M.isTerminating(M.Q(20, 7))).toBe(false);
    expect(M.decimalText(M.Q(20, 7))).toBeNull();
    expect(M.isTerminating(M.Q(1, 8))).toBe(true);
    expect(T(M.Q(1, 8))).toBe('0,125');
    expect(T(M.div(q('41,6'), q('13')))).toBe('3,2');
    expect(M.latex(M.Q(20, 7))).toBe('\\frac{20}{7}');
    expect(M.latex(q('35,9'))).toBe('35{,}9');
  });
});

describe('missingNumber — la machine et son inverse', () => {
  const cases = [
    ['add', '9', '54', '45'],
    ['sub', '14', '54', '68'],
    ['rsub', '80', '54', '26'],
    ['mul', '6', '54', '9'],
    ['div', '4', '12', '48'],
    ['add', '17,5', '46,2', '28,7'],
    ['mul', '8', '3,6', '0,45'],
    ['mul', '7', '20', '20/7'],
  ];
  it.each(cases)('%s %s → %s : le manquant est %s et la contre-épreuve tient', (kind, a, out, want) => {
    const c = M.card(kind, a);
    const x = M.missing(c, q(out));
    expect(T(x)).toBe(want);
    expect(M.holds(c, x, q(out))).toBe(true);
    expect(M.eq(M.run(c, x), q(out))).toBe(true);
  });
  it('l\'inverse de l\'inverse est la carte ; « a − □ » est son propre inverse', () => {
    for (const k of M.KINDS) expect(M.inverseKind(M.inverseKind(k))).toBe(k);
    expect(M.inverseKind('rsub')).toBe('rsub');
    expect(M.inverseKind('add')).toBe('sub');
    expect(M.inverseKind('mul')).toBe('div');
  });
  it('un facteur nul est refusé', () => {
    expect(() => M.card('mul', '0')).toThrow();
    expect(() => M.card('div', '0')).toThrow();
    expect(() => M.card('zzz', '1')).toThrow();
  });
  it('la forme de l\'égalité', () => {
    expect(M.shapeOf('add')).toBe('sum');
    expect(M.shapeOf('rsub')).toBe('diffSecond');
    expect(M.shapeOf('sub')).toBe('diffFirst');
    expect(M.shapeOf('mul')).toBe('product');
  });
});

describe('missingNumber — le jugement d\'une carte choisie', () => {
  it('+9 → 54 : la bonne carte est « − », « + » répète la machine, « × » est de l\'autre famille', () => {
    const c = M.card('add', '9');
    const out = q('54');
    expect(M.judgePick(c, 'sub', out)).toMatchObject({ ok: true, model: 'right' });
    const same = M.judgePick(c, 'add', out);
    expect(same).toMatchObject({ ok: false, model: 'same' });
    expect(T(same.found)).toBe('63');
    expect(T(same.fwd)).toBe('72');
    expect(M.judgePick(c, 'mul', out)).toMatchObject({ ok: false, model: 'family' });
    expect(T(M.judgePick(c, 'div', out).found)).toBe('6');
  });
  it('− 14 → 54 : « + » est juste', () => {
    const c = M.card('sub', '14');
    expect(T(M.judgePick(c, 'add', q('54')).found)).toBe('68');
    expect(M.judgePick(c, 'add', q('54')).ok).toBe(true);
    expect(M.judgePick(c, 'sub', q('54')).model).toBe('same');
  });
  it('« 80 − □ = 54 » : le piège prend l\'inverse du moins (« + » donne 134 et la contre-épreuve −54) ; « − » donnerait un négatif ; la bonne est « 80 − »', () => {
    const c = M.card('rsub', '80');
    const out = q('54');
    const trap = M.judgePick(c, 'add', out);
    expect(trap).toMatchObject({ ok: false, model: 'trap' });
    expect(T(trap.found)).toBe('134');
    expect(T(trap.fwd)).toBe('-54');
    expect(M.judgePick(c, 'sub', out)).toMatchObject({ ok: false, model: 'neg' });
    const right = M.judgePick(c, 'rsub', out);
    expect(right.ok).toBe(true);
    expect(T(right.found)).toBe('26');
  });
  it('× 6 → 54 : « ÷ » juste ; « × » répète ; « + » est de l\'autre famille', () => {
    const c = M.card('mul', '6');
    expect(M.judgePick(c, 'div', q('54')).ok).toBe(true);
    expect(M.judgePick(c, 'mul', q('54')).model).toBe('same');
    expect(M.judgePick(c, 'add', q('54')).model).toBe('family');
  });
  it('un quotient qui ne s\'arrête pas : × 7 → 20 donne 20/7 et la contre-épreuve tient', () => {
    const j = M.judgePick(M.card('mul', '7'), 'div', q('20'));
    expect(j.ok).toBe(true);
    expect(T(j.found)).toBe('20/7');
    expect(T(j.fwd)).toBe('20');
  });
  it('toutes les cartes sur toutes les machines : exactement une carte juste par machine (deux jamais)', () => {
    for (const kind of M.KINDS.filter((k) => k !== 'div')) {
      const c = M.card(kind, kind === 'rsub' ? '90' : '9');
      const rights = M.KINDS.filter((k) => M.judgePick(c, k, q('54')).ok);
      expect(rights, kind).toEqual([M.inverseKind(kind)]);
    }
  });
});
