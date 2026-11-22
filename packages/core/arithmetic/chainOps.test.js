import { describe, it, expect } from 'vitest';
import * as C from './chainOps.js';
import * as P from './powers.js';
import { evaluate as relEvaluate, relText, parseRel, factorize as relFactorize } from './relativeOps.js';

const txt = (t) => relText(C.evaluateChain(t));

describe('chainOps — lecture', () => {
  it('tokenize : chiffres arabes, virgule, alias ASCII ; refuse parenthèses, négatif, trou', () => {
    expect(C.tokenize('٢٦ - 9 + 4').map((t) => t.t === 'op' ? t.o : relText(t.v))).toEqual(['26', '−', '9', '+', '4']);
    expect(C.tokenize('1,5 + 4 x 0,8').map((t) => t.t === 'op' ? t.o : relText(t.v))).toEqual(['1,5', '+', '4', '×', '0,8']);
    expect(() => C.tokenize('(2 + 3) × 4')).toThrow();
    expect(() => C.tokenize('[2 + 3] × 4')).toThrow();
    expect(() => C.tokenize('−3 + 4')).toThrow();
    expect(() => C.tokenize('3 +')).toThrow();
    expect(() => C.tokenize('3 + + 4')).toThrow();
    expect(() => C.tokenize('')).toThrow();
  });
});

describe('chainOps — valeur et priorités', () => {
  it('+ − de gauche à droite ; × ÷ de gauche à droite ; × ÷ avant + −', () => {
    expect(txt('26 − 9 + 4')).toBe('21');
    expect(txt('40 − 12 − 6 + 9')).toBe('31');
    expect(txt('150 ÷ 6 × 4')).toBe('100');
    expect(txt('15 + 3 × 4')).toBe('27');
    expect(txt('32 − 4 × 5 + 6')).toBe('18');
    expect(txt('1,5 + 4 × 0,8')).toBe('4,7');
    expect(txt('60 ÷ 4 + 3 × 6')).toBe('33');
    expect(txt('3,5 + 2 × 1,5 − 6 ÷ 3')).toBe('4,5');
    expect(txt('50 − 4 × 6 + 30 ÷ 5')).toBe('32');
    expect(txt('18 + 6 × 5 − 40 ÷ 8')).toBe('43');
  });
  it('contre-épreuve : relativeOps.evaluate (3AM) donne la même valeur', () => {
    for (const c of ['26 − 9 + 4', '150 ÷ 6 × 4', '15 + 3 × 4', '2,5 + 3 × 7 − 35 ÷ 5', '12 × 5 ÷ 6 ÷ 2', '100 − 36 ÷ 4 × 3']) {
      expect(C.evaluateChain(c)).toEqual(relEvaluate(c).value);
    }
  });
  it('division par 0 : exception', () => { expect(() => C.evaluateChain('5 ÷ 0')).toThrow(); });
  it('un quotient non décimal reste exact', () => { expect(P.eq(C.evaluateChain('1 ÷ 3 × 3'), 1)).toBe(true); });
});

describe('chainOps — opérateurs et ordre', () => {
  it('operatorsOf et conventionalOrder', () => {
    expect(C.operatorsOf('15 + 3 × 4').map((o) => o.o)).toEqual(['+', '×']);
    expect(C.conventionalOrder('15 + 3 × 4')).toEqual([1, 0]);
    expect(C.conventionalOrder('26 − 9 + 4')).toEqual([0, 1]);
    expect(C.conventionalOrder('18 + 6 × 5 − 40 ÷ 8')).toEqual([1, 3, 0, 2]);
  });
  it('valueInOrder : le plan de l\'élève', () => {
    const wrong = C.valueInOrder('26 − 9 + 4', [1, 0]);   // 9 + 4 d'abord
    expect(relText(wrong.value)).toBe('13');
    expect(wrong.lines).toEqual(['26 − 9 + 4', '26 − 13', '13']);
    expect(wrong.conventional).toBe(false);
    expect(wrong.matches).toBe(false);
    const ok = C.valueInOrder('26 − 9 + 4', [0, 1]);
    expect(relText(ok.value)).toBe('21'); expect(ok.conventional).toBe(true); expect(ok.matches).toBe(true);
    const price = C.valueInOrder('150 ÷ 6 × 4', [1, 0]);
    expect(relText(price.value)).toBe('6,25'); expect(price.matches).toBe(false);
    const groups = C.valueInOrder('15 + 3 × 4', [0, 1]);
    expect(relText(groups.value)).toBe('72'); expect(groups.lines).toEqual(['15 + 3 × 4', '18 × 4', '72']);
  });
  it('un plan différent peut donner la même valeur (+ seulement) : accepté, non conventionnel', () => {
    const r = C.valueInOrder('26 + 4 + 9', [1, 0]);
    expect(r.matches).toBe(true); expect(r.conventional).toBe(false);
  });
  it('balayage : toute permutation est calculable, et seul l\'ordre conventionnel (ou un équivalent) coïncide avec la valeur', () => {
    const perms = (a) => (a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p])));
    const chain = '40 − 12 − 6 + 9';
    const good = perms([0, 1, 2]).filter((o) => C.valueInOrder(chain, o).matches);
    expect(good.length).toBeGreaterThan(0);
    expect(good.some((o) => o.join() === C.conventionalOrder(chain).join())).toBe(true);
    expect(C.valueInOrder(chain, [0, 2, 1]).matches).toBe(false);   // 6 + 9 d'abord : 40 − 12 − 15 = 13
    expect(relText(C.valueInOrder(chain, [0, 2, 1]).value)).toBe('13');
    expect(relText(C.valueInOrder(chain, [1, 0, 2]).value)).toBe('43');   // 12 − 6 d'abord : 40 − 6 + 9 = 43
  });
  it('un ordre invalide est refusé', () => { expect(() => C.valueInOrder('1 + 2 + 3', [0, 0])).toThrow(); });
});

describe('chainOps — trace et garde', () => {
  it('traceChain : une opération par ligne, ou groupée', () => {
    expect(C.traceChain('15 + 3 × 4')).toEqual(['15 + 3 × 4', '15 + 12', '27']);
    expect(C.traceChain('4,5 + 2 × 8 − 27 ÷ 9')).toEqual(['4,5 + 2 × 8 − 27 ÷ 9', '4,5 + 16 − 27 ÷ 9', '4,5 + 16 − 3', '20,5 − 3', '17,5']);
    expect(C.traceChain('4,5 + 2 × 8 − 27 ÷ 9', { grouped: true })).toEqual(['4,5 + 2 × 8 − 27 ÷ 9', '4,5 + 16 − 3', '17,5']);
  });
  it('isNonNegativeChain : la garde de 2AM', () => {
    expect(C.isNonNegativeChain('26 − 9 + 4')).toBe(true);
    expect(C.isNonNegativeChain('4 − 9 + 20')).toBe(false);
  });
  it('chainText relit l\'arbre', () => { expect(C.chainText(C.parseChain('15 + 3 × 4'))).toBe('15 + 3 × 4'); });
});

describe('chainOps — offTreeStep', () => {
  it('9 + 4 avant de retrancher 9 quitte l\'arbre ; l\'ordre conventionnel jamais', () => {
    const step = C.offTreeStep('26 − 9 + 4', [1, 0]);
    expect(step).toMatchObject({ index: 1, o: '+', leftSpan: [1, 1], rightSpan: [2, 2] });
    expect(relText(step.value)).toBe('13');
    expect(C.offTreeStep('26 − 9 + 4', [0, 1])).toBeNull();
    expect(C.offTreeStep('15 + 3 × 4', [1, 0])).toBeNull();
    expect(C.offTreeStep('15 + 3 × 4', [0, 1])).toMatchObject({ index: 0, o: '+' });
    expect(C.offTreeStep('150 ÷ 6 × 4', [1, 0])).toMatchObject({ o: '×' });
  });
});

describe('chainOps L2 — parenthèses, barre de fraction, calculatrice (silsila-bi-aqwas)', () => {
  it('calculatorRead : priorités, parenthèses, Syntax ERROR, Math ERROR, négatif affiché', () => {
    expect(C.calculatorRead('45 + 15 ÷ 4')).toMatchObject({ status: 'ok', display: '48,75' });
    expect(C.calculatorRead('(45 + 15) ÷ 4')).toMatchObject({ status: 'ok', display: '15' });
    expect(C.calculatorRead('(45 + 15 ÷ 4').status).toBe('syntax');
    expect(C.calculatorRead('45 + ÷ 4').status).toBe('syntax');
    expect(C.calculatorRead('4 ÷ (3 − 3)').status).toBe('math');
    expect(C.calculatorRead('(40 + 8) ÷ 15 − 9').display).toBe('−5,8');
    expect(C.calculatorRead('40 + 8 ÷ 15 − 9').display).toBe('31,53333333');
    expect(C.calculatorRead('2 × [50 − (12 + 8)]').display).toBe('60');
  });
  it('evaluateB est d\'accord avec evaluateChain sans parenthèses et avec la valeur à la main avec', () => {
    for (const t of ['26 − 9 + 4', '15 + 3 × 4', '150 ÷ 6 × 4', '3,5 + 2 × 1,5 − 6 ÷ 3']) expect(C.numText(C.evaluateB(t)), t).toBe(C.numText(C.evaluateChain(t)));
    expect(C.numText(C.evaluateB('3 × [20 − (4 + 6)]'))).toBe('30');
    expect(C.numText(C.evaluateB('(7 + 5) × (20 − 4)'))).toBe('192');
  });
  it('uselessBrackets : 9 + (2 × 5) a une paire inutile, (9 + 2) × 5 aucune, ((3)) + 4 deux', () => {
    expect(C.uselessBrackets('9 + (2 × 5)')).toHaveLength(1);
    expect(C.uselessBrackets('(9 + 2) × 5')).toHaveLength(0);
    expect(C.uselessBrackets('((3)) + 4')).toHaveLength(2);
    expect(C.uselessBrackets('(8 × 12) − 7')).toHaveLength(1);
    expect(C.uselessBrackets('50 − (12 + 8)')).toHaveLength(0);
    expect(C.uselessBrackets('50 − (12 − 8)')).toHaveLength(0);
  });
  it('bracketForm : la paire extérieure s\'écrit [ ]', () => {
    expect(C.bracketForm('2 × (50 − (12 + 8))')).toBe('2 × [ 50 − ( 12 + 8 ) ]');
    expect(C.bracketForm('(1 + 2) × 3')).toBe('( 1 + 2 ) × 3');
  });
  it('barToLine / lineToBar : les deux sens', () => {
    expect(C.barToLine('36 + 12', '20 − 8')).toBe('(36 + 12) ÷ (20 − 8)');
    expect(C.barToLine('28', '11 − 4')).toBe('28 ÷ (11 − 4)');
    expect(C.lineToBar('(36 + 12) ÷ (20 − 8)')).toEqual({ num: '36 + 12', den: '20 − 8' });
    expect(C.lineToBar('8 ÷ (5 + 3)')).toEqual({ num: '8', den: '5 + 3' });
    expect(C.lineToBar('1 + 2')).toBeNull();
    expect(C.numText(C.evaluateB(C.barToLine('36 + 12', '20 − 8')))).toBe('4');
  });
  it('leftToRight et calculatorKeys', () => {
    expect(C.calcDisplay(C.leftToRight('45 + 15 ÷ 4'))).toBe('15');
    expect(C.calcDisplay(C.leftToRight('(1 + 2) × 3'))).toBe('9');
    expect(C.calculatorKeys('54 ÷ (4 × 3 − 3) + 2').join(' ')).toBe('5 4 ÷ ( 4 × 3 − 3 ) + 2 =');
  });
  it('L1 refuse toujours les parenthèses', () => {
    expect(() => C.tokenize('(1 + 2) × 3')).toThrow();
  });
});

describe('chainOps L3 — la dernière opération nomme la chaîne (wasf-silsila-hisab)', () => {
  it('lastOperation / chainName / operands : la racine, jamais la première opération écrite', () => {
    const cases = [
      ['7 + 4 × 5', '+', 'مجموع'], ['(7 + 4) × 5', '×', 'جداء'], ['40 − 12 ÷ 4', '−', 'فرق'], ['(18 + 6) ÷ 3', '÷', 'حاصل قسمة'],
      ['6 × (9 − 2) + 5', '+', 'مجموع'], ['20 + 5 − 3', '−', 'فرق'], ['24 ÷ 4 × 3', '×', 'جداء'], ['((8 + 2)) × 3', '×', 'جداء'],
    ];
    for (const [t, o, n] of cases) { expect(C.lastOperation(t), t).toBe(o); expect(C.chainName(t), t).toBe(n); }
    expect(C.lastOperation('5')).toBeNull();
    expect(C.operands('7 + 4 × 5').map((x) => x.t)).toEqual(['num', 'op']);
    expect(C.operands('(7 + 4) × 5').map((x) => x.t)).toEqual(['op', 'num']);
  });
  it('describe : le tableau de phrases écrit à la main (masculin, « و », « على », la virgule des chaînes imbriquées)', () => {
    const table = [
      ['7 + 4 × 5', 'مجموع العدد 7 وجداء العددين 4 و 5'],
      ['(7 + 4) × 5', 'جداء مجموع العددين 7 و 4 والعدد 5'],
      ['40 − 12 ÷ 4', 'فرق العدد 40 وحاصل قسمة 12 على 4'],
      ['(18 + 6) ÷ 3', 'حاصل قسمة مجموع العددين 18 و 6 على 3'],
      ['6 × (9 − 2) + 5', 'مجموع جداء العدد 6 وفرق العددين 9 و 2 ، والعدد 5'],
      ['(20 − 8) ÷ (1 + 2)', 'حاصل قسمة فرق العددين 20 و 8 على مجموع العددين 1 و 2'],
      ['4 × (9 + 6)', 'جداء العدد 4 ومجموع العددين 9 و 6'],
      ['12 + 45 ÷ 9', 'مجموع العدد 12 وحاصل قسمة 45 على 9'],
      ['(4 + 6) × 2 ÷ 4', 'حاصل قسمة جداء مجموع العددين 4 و 6 والعدد 2 على 4'],
      ['(3 + 5) × (10 − 4)', 'جداء مجموع العددين 3 و 5 وفرق العددين 10 و 4'],
      ['4 × (1,5 + 2,5)', 'جداء العدد 4 ومجموع العددين 1,5 و 2,5'],
    ];
    for (const [t, s] of table) expect(C.describe(t), t).toBe(s);
  });
  it('cutAt : la racine réussit ; ailleurs une agrafe est mordue et la valeur « recollée » est celle du plan', () => {
    const rebuilt = (t, i) => C.cutAt(t, i);
    expect(rebuilt('7 + 4 × 5', 0)).toMatchObject({ ok: true, left: '7', right: '4 × 5', reason: null });
    expect(rebuilt('7 + 4 × 5', 1)).toMatchObject({ ok: false, left: '7 + 4', right: '5', rebuilt: '55', reason: 'staple', same: false });
    expect(rebuilt('(7 + 4) × 5', 0)).toMatchObject({ ok: false, rebuilt: '27' });
    expect(rebuilt('(7 + 4) × 5', 1)).toMatchObject({ ok: true, left: '7 + 4', right: '5' });
    expect(rebuilt('40 − 12 ÷ 4', 1).rebuilt).toBe('7');
    expect(rebuilt('(18 + 6) ÷ 3', 0).rebuilt).toBe('20');
    expect(rebuilt('6 × (9 − 2) + 5', 0).rebuilt).toBe('72');
    expect(rebuilt('6 × (9 − 2) + 5', 2)).toMatchObject({ ok: true, left: '6 × ( 9 − 2 )', right: '5' });
  });
  it('cutAt : la même valeur par hasard est refusée par l\'agrafe (20 + 5 − 3 coupé à +)', () => {
    expect(C.cutAt('20 + 5 − 3', 0)).toMatchObject({ ok: false, rebuilt: '22', same: true });
    expect(C.cutAt('20 + 5 − 3', 1)).toMatchObject({ ok: true, left: '20 + 5', right: '3' });
  });
  it('cutAt : un recollage négatif ou divisé par 0 n\'est jamais calculé', () => {
    expect(C.cutAt('3 + 8 − 4', 0).rebuilt).toBe('7');   // 3 + (8 − 4)
    expect(C.cutAt('9 − 6 ÷ 2', 0).ok).toBe(true);
    expect(C.cutAt('2 × 5 − 12', 0).rebuilt).toBeNull();   // 2 × (5 − 12) < 0
  });
  it('staplesOf : une agrafe par opération, ses blocs, sa valeur, son niveau', () => {
    const s = C.staplesOf('6 × (9 − 2) + 5');
    expect(s.map((x) => [x.o, x.text, x.level, x.parent])).toEqual([['+', '47', 3, -1], ['×', '42', 2, 0], ['−', '7', 1, 1]]);
    expect(C.staplesOf('7 + 4 × 5').map((x) => x.text)).toEqual(['27', '20']);
  });
  it('build : les parenthèses que la structure exige, et ce que donne le collage sans elles', () => {
    expect(C.build('÷', '15 + 9', '4', { clipLeft: true })).toMatchObject({ text: '(15 + 9) ÷ 4', name: 'حاصل قسمة', needs: { left: true, right: false } });
    const bare = C.build('÷', '15 + 9', '4');
    expect(bare).toMatchObject({ text: '15 + 9 ÷ 4', name: 'مجموع' });
    expect(C.numText(C.evaluateB(bare.text))).toBe('17,25');
    expect(C.build('−', '50', '6 × 7').needs).toEqual({ left: false, right: false });
    expect(C.build('×', '3 + 5', '10 − 4', { clipLeft: true, clipRight: true })).toMatchObject({ text: '(3 + 5) × (10 − 4)', name: 'جداء', needs: { left: true, right: true } });
    expect(C.build('−', '40', '26 − 11').needs.right).toBe(true);
  });
  it('sameStructure : les parenthèses inutiles ne changent pas la structure', () => {
    expect(C.sameStructure('50 − 6 × 7', '50 − (6 × 7)')).toBe(true);
    expect(C.sameStructure('(15 + 9) ÷ 4', '15 + 9 ÷ 4')).toBe(false);
  });
});

describe('chainOps — L4 distributivité', () => {
  it('expand : les deux écritures et la même valeur (contre-épreuve relativeOps.factorize)', () => {
    const e = C.expand(6, 8, 3, '−');
    expect(e.factored).toBe('6 × (8 − 3)'); expect(e.split).toBe('6 × 8 − 6 × 3'); expect(e.value).toBe('30'); expect(e.equal).toBe(true);
    expect(C.expand('25', '4,3', '5,7').value).toBe('250');
    expect(C.expand('2,5', '18', '8', '−').products).toBe('45 − 20');
    for (const [k, a, b, op] of [[7, 13, 17, '+'], [4.5, 12, 2, '−'], [12, 5, 8, '+']]) {
      const f = relFactorize(parseRel(String(k).replace('.', ',')), parseRel(String(a)), parseRel(String(b)), op === '−' ? '-' : '+');
      expect(P.eq(f.split, f.factored)).toBe(true);
      expect(C.expand(String(k).replace('.', ','), a, b, op).value).toBe(relText(f.factored));
    }
    expect(() => C.expand(3, 2, 5, '−')).toThrow();
  });
  it('commonFactor : visible dans n\'importe quel ordre', () => {
    expect(C.commonFactor('12 × 5', '12 × 3')).toEqual({ factor: '12', rest: ['5', '3'] });
    expect(C.commonFactor('5 × 12', '12 × 3')).toEqual({ factor: '12', rest: ['5', '3'] });
    expect(C.commonFactor('14,6 × 12', '4,6 × 12')).toEqual({ factor: '12', rest: ['14,6', '4,6'] });
    expect(C.commonFactor('6 × 8', '7 × 3')).toBeNull();
  });
  it('mentalSplits', () => {
    expect(C.mentalSplits(48)).toEqual([{ parts: [40, 8], op: '+' }, { parts: [50, 2], op: '−' }]);
    expect(C.mentalSplits(99)).toEqual([{ parts: [90, 9], op: '+' }, { parts: [100, 1], op: '−' }]);
    expect(C.mentalSplits(101)[0]).toEqual({ parts: [100, 1], op: '+' });
    expect(C.mentalSplits(50)).toEqual([]);
  });
  it('expandLetter : 4 × (x − 3) = 4x − 12, valeurs par deux voies', () => {
    const e = C.expandLetter({ k: 4, b: 3, op: '−' });
    expect(e.text).toBe('4x − 12');
    expect(e.at('5')).toEqual({ factored: '8', expanded: '8', equal: true });
    expect(e.at('3').factored).toBe('0'); expect(e.at('4,5').factored).toBe('6');
    expect(() => e.at('2')).toThrow();
    expect(C.expandLetter({ k: 4, b: 3, op: '+' }).text).toBe('4x + 12');
  });
});
