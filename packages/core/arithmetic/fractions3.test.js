import { describe, it, expect } from 'vitest';
import * as F from './fractions3.js';
import { ratText } from './powers.js';

describe('fractions3 — brut, inverse, division', () => {
  it('raw garde l\'écriture non réduite et refuse d = 0', () => {
    const p = F.raw(6, 8);
    expect(F.rawText(p)).toBe('6/8');
    expect(ratText(F.valueOf(p))).toBe('3/4');
    expect(F.rawText(F.raw(3, -4))).toBe('-3/4');
    expect(() => F.raw(1, 0)).toThrow();
    expect(F.rawTex(F.raw(6, 8))).toBe('\\frac{6}{8}');
    expect(F.rawTex(F.raw(6, 1))).toBe('6');
  });
  it('le مقلوب d\'un naturel, d\'un décimal et d\'une fraction ; 0 n\'en a pas', () => {
    expect(F.rawText(F.reciprocal(8))).toBe('1/8');
    expect(ratText(F.valueOf(F.reciprocal('0,25')))).toBe('4');
    expect(ratText(F.valueOf(F.reciprocal('0,8')))).toBe('5/4');
    expect(F.rawText(F.reciprocal('0,4'))).toBe('10/4');
    expect(F.rawText(F.reciprocal(F.raw(7, 5)))).toBe('5/7');
    expect(() => F.reciprocal(0)).toThrow();
    expect(() => F.reciprocal('0,0')).toThrow();
  });
  it('x · y = 1 caractérise les inverses ; 0,33 n\'est pas le مقلوب de 3', () => {
    expect(F.isReciprocalPair(F.raw(3, 4), F.raw(4, 3))).toBe(true);
    expect(F.isReciprocalPair(3, '0,33')).toBe(false);
    expect(F.isReciprocalPair(3, F.raw(1, 3))).toBe(true);
    expect(F.isReciprocalPair(F.raw(3, 4), F.raw(-3, 4))).toBe(false);
  });
  it('a/b ÷ c/d = a/b × d/c', () => {
    const r = F.divideFractions(F.raw(14, 15), F.raw(21, 10));
    expect(r.product.map(F.rawText)).toEqual(['14/15', '10/21']);
    expect(ratText(r.value)).toBe('4/9');
    expect(ratText(F.divideFractions(6, F.raw(3, 4)).value)).toBe('8');
    expect(ratText(F.divideFractions(F.raw(5, 6), 10).value)).toBe('1/12');
    expect(ratText(F.divideFractions(F.raw(9, 2), F.raw(3, 4)).value)).toBe('6');
    expect(() => F.divideFractions(F.raw(1, 2), 0)).toThrow();
  });
  it('simplifier avant de multiplier', () => {
    const s = F.simplifyBeforeMultiply(F.raw(14, 15), F.raw(10, 21));
    expect(s.cancels.map((c) => `${c.top}/${c.bottom}:${c.g}`)).toEqual(['a/d:7', 'c/b:5']);
    expect(F.rawText(s.result)).toBe('4/9');
    expect(F.simplifyBeforeMultiply(F.raw(2, 3), F.raw(5, 7)).cancels).toEqual([]);
  });
  it('les tours de pédale et de roue (le labo gear-crank)', () => {
    const g = F.gearTurns(24, 32, 192);
    expect(ratText(g.pedal)).toBe('8');
    expect(ratText(g.wheel)).toBe('6');
    expect(ratText(F.gearTurns(24, 32, 32).pedal)).toBe('4/3');
    expect(ratText(F.teethFor(32, '7/5'))).toBe('224/5');
    expect(ratText(F.teethFor(24, 3))).toBe('72');
    expect(() => F.gearTurns(0, 5, 3)).toThrow();
  });
});

describe('fractions3 — égalité et comparaison (tasawi-muqaranat-kasrayn)', () => {
  it('les produits en croix décident l\'égalité, dans les deux sens', () => {
    expect(F.crossProducts(F.raw(3, 4), F.raw(6, 8))).toEqual({ left: 24n, right: 24n });
    expect(F.sameFraction(F.raw(3, 4), F.raw(6, 8))).toBe(true);
    expect(F.sameFraction(F.raw(7, 10), F.raw(3, 4))).toBe(false);
    expect(F.sameFraction(F.raw(2018, 2017), F.raw(2017, 2016))).toBe(false);
    expect(F.sameFraction(F.raw(336, 609), F.raw(16, 29))).toBe(true);
    expect(F.sameFraction('5/6', '10/12')).toBe(true);
  });
  it('compareFractions : −1, 0, 1 (7/10 < 3/4, 10/13 < 7/9, 11/14 > 7/9)', () => {
    expect(F.compareFractions(F.raw(7, 10), F.raw(3, 4))).toBe(-1);
    expect(F.compareFractions(F.raw(3, 4), F.raw(7, 10))).toBe(1);
    expect(F.compareFractions(F.raw(10, 13), F.raw(7, 9))).toBe(-1);
    expect(F.compareFractions(F.raw(7, 9), F.raw(11, 14))).toBe(-1);
    expect(F.compareFractions(F.raw(5, 7), F.raw(5, 7))).toBe(0);
    expect(F.compareFractions(F.raw(47, 23), F.raw(47, 25))).toBe(1);
  });
  it('lcm, multiples communs, écriture sur un dénominateur donné', () => {
    expect(F.lcm(4, 10)).toBe(20n);
    expect(F.lcm(12, 18)).toBe(36n);
    expect(F.commonMultiples(4, 10, 3)).toEqual([20n, 40n, 60n]);
    expect(() => F.lcm(0, 4)).toThrow();
    const t = F.toDenominator(F.raw(3, 4), 20);
    expect([t.k, t.n, t.d]).toEqual([5n, 15n, 20n]);
    expect(() => F.toDenominator(F.raw(3, 4), 10)).toThrow();
  });
  it('le terme manquant : x/16 = 5/8, 4/x = 6/9, 3/4 = x/20 …', () => {
    expect(ratText(F.missingTerm([null, 16, 5, 8]))).toBe('10');
    expect(ratText(F.missingTerm([4, null, 6, 9]))).toBe('6');
    expect(ratText(F.missingTerm([3, 4, null, 20]))).toBe('15');
    expect(ratText(F.missingTerm([3, 4, 15, null]))).toBe('20');
    expect(ratText(F.missingTerm([null, 15, 4, 6]))).toBe('10');
    expect(() => F.missingTerm([1, 2, 3, 4])).toThrow();
    expect(() => F.missingTerm([null, 0, 5, 8])).toThrow();
  });
  it('matchNumerator : 3/4 sur 8 blancs → 6 exact ; 3/4 sur 10 → entre 7 et 8 ; 4/7 sur 12 → entre 6 et 7', () => {
    expect(F.matchNumerator(3, 4, 8)).toMatchObject({ exact: true, c: 6n });
    const m = F.matchNumerator(3, 4, 10);
    expect([m.exact, m.below, m.above, ratText(m.value)]).toEqual([false, 7n, 8n, '15/2']);
    const n = F.matchNumerator(4, 7, 12);
    expect([n.exact, n.below, n.above]).toEqual([false, 6n, 7n]);
    expect(F.matchNumerator(9, 12, 8)).toMatchObject({ exact: true, c: 6n });
    expect(F.matchNumerator(5, 6, 18)).toMatchObject({ exact: true, c: 15n });
    expect(() => F.matchNumerator(3, 0, 8)).toThrow();
  });
  it('shadeVerdict : 5 plus clair, 6 pile, 7 plus foncé (3/4 sur 8)', () => {
    expect(F.shadeVerdict(3, 4, 5, 8).verdict).toBe('lighter');
    expect(F.shadeVerdict(3, 4, 6, 8)).toEqual({ verdict: 'match', gap: 0n });
    expect(F.shadeVerdict(3, 4, 7, 8).verdict).toBe('darker');
    expect(F.shadeVerdict(3, 4, 7, 10).verdict).toBe('lighter');
    expect(F.shadeVerdict(3, 4, 8, 10).verdict).toBe('darker');
    expect(F.shadeVerdict(7, 9, 10, 13).verdict).toBe('lighter');
  });
  it('le chiffre des unités d\'un produit : 3217 × 8133 finit par 1, 5419 × 4826 par 4', () => {
    expect(F.unitsDigitOfProduct(3217, 8133)).toBe(1);
    expect(F.unitsDigitOfProduct(5419, 4826)).toBe(4);
    expect(3217 * 8133 % 10).toBe(1);
  });
  it('leçon 3 : multiple commun, plus petit multiple commun, méthode des multiples du plus grand', () => {
    expect(F.isCommonMultiple(12, [4, 6])).toBe(true);
    expect(F.isCommonMultiple(10, [4, 6])).toBe(false);
    expect(F.isCommonMultiple(8, [4, 6])).toBe(false);
    expect(F.smallestCommonMultiple([4, 6])).toBe(12n);
    expect(F.smallestCommonMultiple([25, 12, 16])).toBe(1200n);
    const m = F.multiplesUntil(18, 12);
    expect([m.larger, m.other, m.list, m.lcm]).toEqual([18n, 12n, [18n, 36n], 36n]);
    expect(F.multiplesUntil(15, 25).list).toEqual([25n, 50n, 75n]);
    expect(F.multiplesUntil(4, 8).list).toEqual([8n]);
  });
  it('leçon 3 : cellsOf — 1/4 sur 1/10 = 2,5 cases (pas entier) ; sur 1/12 = 3', () => {
    expect(F.cellsOf('1/4', 10)).toMatchObject({ whole: false, count: null });
    expect(ratText(F.cellsOf('1/4', 10).cells)).toBe('5/2');
    expect(F.cellsOf('1/4', 12)).toMatchObject({ whole: true, count: 3n });
    expect(() => F.cellsOf('-1/4', 12)).toThrow();
  });
  it('leçon 3 : sumWith — 1/4 + 1/6 : 12 → 3 + 2 = 5 plants, 24 → 10, 10 → bord ; 3/4 − 1/6 sur 12 → 7', () => {
    const t = [{ p: '1/4' }, { p: '1/6' }];
    expect(F.sumWith(t, 12)).toMatchObject({ ok: true, counts: [3n, 2n], signed: 5n });
    expect(ratText(F.sumWith(t, 12).total)).toBe('5/12');
    expect(F.sumWith(t, 24)).toMatchObject({ ok: true, signed: 10n });
    expect(F.sumWith(t, 10)).toMatchObject({ ok: false, borderAt: 0, signed: null });
    expect(F.sumWith(t, 8)).toMatchObject({ ok: false, borderAt: 1 });
    expect(F.sumWith(t, 6)).toMatchObject({ ok: false, borderAt: 0 });
    const d = [{ p: '3/4' }, { p: '1/6', sub: true }];
    expect(F.sumWith(d, 12)).toMatchObject({ ok: true, counts: [9n, 2n], signed: 7n });
    expect(ratText(F.sumWith(d, 12).total)).toBe('7/12');
    expect(() => F.sumWith([{ p: '1/6' }, { p: '3/4', sub: true }], 12)).toThrow();
    expect(F.sumWith([{ p: '5/6' }, { p: '3/8' }], 24).signed).toBe(29n);
  });
  it('leçon 3 : widestUnit — 12 pour 4 et 6 ; null au-delà de maxN', () => {
    expect(F.widestUnit([4, 6])).toBe(12n);
    expect(F.widestUnit([8, 12])).toBe(24n);
    expect(F.widestUnit([25, 12], 60)).toBe(null);
    expect(F.widestUnit([2, 3, 4])).toBe(12n);
  });
});

describe('fractions3 — leçon 4 `adad-natiq` : le nombre rationnel', () => {
  it('writingValue / normalize / writingsEqual : plusieurs écritures, un seul nombre', () => {
    expect(ratText(F.writingValue('6/-8'))).toBe('-3/4');
    expect(ratText(F.writingValue('-9/-12'))).toBe('3/4');
    expect(ratText(F.writingValue('-1,5'))).toBe('-3/2');
    expect(ratText(F.writingValue('-3,6/-8'))).toBe('9/20');
    expect(F.normalize('14/-21')).toEqual({ sign: -1, n: 2n, d: 3n });
    expect(F.writingsEqual('15/-20', '-12/16')).toBe(true);
    expect(F.writingsEqual('-3/4', '3/4')).toBe(false);
    expect(() => F.writingValue('5/0')).toThrow();
  });
  it('isDecimalRational (2^i · 5^j) et twelfths', () => {
    expect(F.isDecimalRational('-7,4/5')).toBe(true);
    expect(F.isDecimalRational('5/6')).toBe(false);
    expect(F.isDecimalRational('-5/8')).toBe(true);
    expect(F.isDecimalRational('7/-3')).toBe(false);
    expect(F.twelfths('-7/3')).toBe(-28);
    expect(F.twelfths('3/4')).toBe(9);
    expect(F.twelfths('1/5')).toBe(null);
  });
  it('integerAndFraction et sortRationals', () => {
    const a = F.integerAndFraction('17/5');
    expect(a.k).toBe(3n); expect(ratText(a.frac)).toBe('2/5');
    const b = F.integerAndFraction('-17/3');
    expect(b.k).toBe(-6n); expect(ratText(b.frac)).toBe('1/3');
    expect(b.alt.k).toBe(-5n); expect(ratText(b.alt.frac)).toBe('-2/3');
    expect(F.unitOf('-11/4')).toBe(-3);
    expect(F.sortRationals(['5/6', '-7/4', '-2/3'])).toEqual(['-7/4', '-2/3', '5/6']);
  });
});

describe('fractions3 — leçon 5 `amaliyat-natiqa` : la chaîne de calcul', () => {
  const ev = (t) => ratText(F.evaluateChain(t).value);
  it('chaque chaîne du plan s\'évalue à la valeur exacte, dans l\'ordre des priorités', () => {
    expect(ev('-5/4 + 11/6')).toBe('7/12');
    expect(ev('7/13 × -8/5')).toBe('-56/65');
    expect(ev('-9/8 ÷ -3/4')).toBe('3/2');
    expect(ev('7/3 - 8/15 ÷ 11/20')).toBe('15/11');
    expect(ev('(2/3 - 5/2) × -6/11')).toBe('1');
    expect(ev('-3/4 + 5/6 × -9/10')).toBe('-3/2');
    expect(ev('(1/2 - 4/3)@(5/6 + -3/4)')).toBe('-10');
    expect(ev('4/5 - 3/5 ÷ -9/10 + -2')).toBe('-8/15');
    expect(ev('-4/9 + 1,5/6')).toBe('-7/36');
    expect(ev('-2,5/14 - 3,1/21')).toBe('-137/420');
    expect(ev('5/2 - 9/14 ÷ 3/7')).toBe('1');
    expect(ev('3/4 - 5/6 - 1/12')).toBe('-1/6');          // de gauche à droite
    expect(ev('8 ÷ 4 ÷ 2')).toBe('1');
    expect(ev('(5/6 - 3/4) ÷ -1/24')).toBe('-2');
  });
  it('parseChain : le signe, la soustraction, les bulles d\'un seul nombre, les erreurs', () => {
    expect(ev('5/4 - -11/6')).toBe('37/12');
    expect(ev('2 × (-3)')).toBe('-6');
    expect(F.parseChain('(−5/4)').t).toBe('g');
    expect(() => F.parseChain('1/0 + 2')).toThrow();
    expect(() => F.parseChain('1/2 +')).toThrow();
    expect(() => F.evaluateChain('1/2 ÷ 0')).toThrow();
  });
  it('resultSign : les quatre opérations', () => {
    expect(F.resultSign('+', '-5/4', '11/6')).toBe(1);
    expect(F.resultSign('-', '5/6', '7/8')).toBe(-1);
    expect(F.resultSign('×', '-3/5', '-10/9')).toBe(1);
    expect(F.resultSign('÷', '4/7', '-2/21')).toBe(-1);
    expect(F.resultSign('+', '1/2', '-1/2')).toBe(0);
    expect(() => F.resultSign('÷', '1', '0')).toThrow();
  });
  it('linkStatus : l\'aimant (priorité), la bulle, de gauche à droite, le retournement', () => {
    const r = F.parseChain('7/3 - 8/15 ÷ 11/20');
    const [minus, div] = F.links(r);
    expect(F.linkStatus(r, minus)).toEqual({ ok: false, reason: 'magnet' });
    expect(F.linkStatus(r, div)).toEqual({ ok: false, reason: 'noflip' });
    const b = F.parseChain('(1/2 + 1/3) × 2');
    const ls = F.links(b);
    expect(ls.find((l) => l.op === '×').ready).toBe(false);
    expect(F.linkStatus(b, ls.find((l) => l.op === '×')).reason).toBe('bubble');
    const lr = F.parseChain('1 - 2 + 3');
    expect(F.linkStatus(lr, F.links(lr)[1]).reason).toBe('order');
    const md = F.parseChain('8 ÷ 4 × 2');
    expect(F.linkStatus(md, F.links(md)[1]).reason).toBe('order');
  });
  it('flipStatus : seul le diviseur ; le signe est gardé ; 0 refusé', () => {
    const r = F.parseChain('-9/8 ÷ -3/4');
    const [d] = F.links(r);
    expect(F.flipStatus(r, d.left.id)).toEqual({ ok: false, reason: 'dividend' });
    expect(F.flipStatus(r, d.right.id).ok).toBe(true);
    const f = F.flipTile(r, d.right.id);
    expect(ratText(F.tileValue(F.findTile(f, d.right.id)))).toBe('-4/3');
    expect(F.flipStatus(F.parseChain('1 + 2'), 'zz').reason).toBe('notdiv');
    expect(F.flipStatus(F.parseChain('3 ÷ 0'), F.links(F.parseChain('3 ÷ 0'))[0].right.id).ok).toBe(false);
  });
  it('mergeLink : la tuile résultat, la bulle qui s\'efface, la trace du dénominateur commun', () => {
    let r = F.parseChain('-5/4 + 11/6');
    const { root, step } = F.mergeLink(r, F.links(r)[0]);
    expect(step.den).toBe(12);
    expect(step.sign).toBe(1);
    expect(step.trail).toContain('\\frac{-15}{12}');
    expect(step.trail).toContain('\\frac{22}{12}');
    expect(F.tileCount(root)).toBe(1);
    r = F.parseChain('(1/2 + 1/3) × 2');
    const m = F.mergeLink(r, F.links(r)[0]);
    expect(m.root.items).toHaveLength(3);
    expect(m.root.items[0].t).toBe('n');
    expect(F.parseChain('-2,5/14 - 3,1/21') && F.stepOf(F.links(F.parseChain('-2,5/14 - 3,1/21'))[0]).den).toBe(42);
    expect(() => F.mergeLink(F.parseChain('1 + 2 × 3'), F.links(F.parseChain('1 + 2 × 3'))[0])).toThrow();
  });
  it('chainScale : au moins 1, au plus 8', () => {
    expect(F.chainScale('-5/4 + 11/6')).toBe(1.8333333333333333);
    expect(F.chainScale('1/2 × 1/3')).toBe(1);
  });
});
