import { describe, it, expect } from 'vitest';
import * as L from './coopCalculator';
import { LEVELS } from '../levels';

/** Les valeurs de contrôle sont recalculées ICI avec un évaluateur BigInt indépendant de chainOps.js. */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const Q = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const num = (s) => { const [i, f = ''] = String(s).replace(',', '.').split('.'); return Q(BigInt(i + f), 10n ** BigInt(f.length)); };
const same = (p, q) => p.n === q.n && p.d === q.d;
const ops = { '+': (p, q) => Q(p.n * q.d + q.n * p.d, p.d * q.d), '−': (p, q) => Q(p.n * q.d - q.n * p.d, p.d * q.d), '×': (p, q) => Q(p.n * q.n, p.d * q.d), '÷': (p, q) => Q(p.n * q.d, p.d * q.n) };
/** Évalue « a + (b × c) ÷ d » par descente récursive (priorités, parenthèses). */
const ev = (text) => {
  const t = text.replace(/\s+/g, '').match(/\d+(?:,\d+)?|[()+−×÷]/g);
  let i = 0;
  const factor = () => { const x = t[i++]; if (x === '(') { const v = expr(); i += 1; return v; } return num(x); };
  const term = () => { let v = factor(); while (t[i] === '×' || t[i] === '÷') { const o = t[i++]; v = ops[o](v, factor()); } return v; };
  const expr = () => { let v = term(); while (t[i] === '+' || t[i] === '−') { const o = t[i++]; v = ops[o](v, term()); } return v; };
  return expr();
};
const all = [...L.PRESETS.beginner.tasks, ...L.PRESETS.advanced.tasks, ...L.PRESETS.alone.tasks];
const type = (s, text) => { let st = s; for (const tk of text.split(' ')) for (const ch of tk.replace(/^(\d+,?\d*)$/, '$1').match(/\d+,\d+|\d|[()+−×÷]/g)) st = L.press(st, ch); return st; };

describe('coop-calculator — les clés et les pièges recalculés', () => {
  it('chaque vérité, chaque ligne sans parenthèses et chaque piège ont la valeur annoncée', () => {
    const want = { k1: ['40', '89'], k2: ['15', '48,75'], k3: ['19', '19'], k4: ['60', '96'], a1: ['8', null], a2: ['14,5', null], a3: ['21', null], m1: ['85', '97'] };
    for (const raw of all) {
      const t = L.buildTask(raw);
      expect(same(ev(raw.truthLine), t.truth), raw.id).toBe(true);
      expect(t.truthText, raw.id).toBe(want[raw.id][0]);
      if (raw.pre) expect(same(ev(raw.pre), num(want[raw.id][1])), raw.id).toBe(true);
      for (const tp of t.traps) expect(same(ev(tp.line), tp.value), `${raw.id} ${tp.line}`).toBe(true);
    }
  });
  it('les pièges nommés : k3 (9+2)×5 = 55 · k4 2×(50−12)+8 = 84 · a1 (40+8)÷15−9 = −5,8 · a1 sans parenthèses 31,53333333', () => {
    const find = (id, key) => L.buildTask(all.find((r) => r.id === id)).traps.find((x) => x.key === key).display;
    expect(find('k3', 'wrongPair')).toBe('55');
    expect(find('k4', 'early')).toBe('84');
    expect(find('k4', 'inside')).toBe('92');
    expect(find('a1', 'numOnly')).toBe('−5,8');
    expect(L.buildTask(all.find((r) => r.id === 'a1')).withoutDisplay).toBe('31,53333333');
    expect(L.buildTask(all.find((r) => r.id === 'a2')).withoutDisplay).toBe('35,16666667');
    expect(L.buildTask(all.find((r) => r.id === 'a3')).withoutDisplay).toBe('36,42857143');
  });
  it('les faits de chaque tâche sont cohérents avec la chaîne', () => {
    const t = (id) => L.buildTask(all.find((r) => r.id === id));
    expect(t('k2').facts.book + t('k2').facts.cover).toBe(t('k2').facts.total);
    expect(t('k4').facts.teachers + t('k4').facts.parents).toBe(t('k4').facts.taken);
    expect(t('k4').facts.seats - t('k4').facts.taken).toBe(t('k4').facts.left);
    expect(t('a1').facts.group - t('a1').facts.absent).toBe(t('a1').facts.present);
    expect(t('a3').facts.dictionaries + t('a3').facts.stories).toBe(t('a3').facts.total);
  });
});

describe('coop-calculator — la main', () => {
  const lab = () => L.init(LEVELS['coop-calculator'].beginner.numbers);
  it('مبتدئ : la ligne est donnée et verrouillée ; seules « ( » « ) » entrent, après avoir posé le curseur', () => {
    let s = lab();
    expect(L.lineText(s)).toBe('8 × 12 − 7');
    expect(L.cursorSet(s)).toBe(false);
    expect(L.press(s, '(')).toBe(s);
    s = L.setCursor(s, 2);
    expect(L.press(s, '9')).toBe(s);
    s = L.press(L.setCursor(L.press(L.setCursor(s, 2), '('), 6), ')');
    expect(L.lineText(s)).toBe('8 × ( 12 − 7 )');
    expect(L.lineText(L.back(L.setCursor(s, 1)))).toBe(L.lineText(s));  // une touche verrouillée ne part pas
  });
  it('« = » : sans parenthèses → refusé par l\'histoire ; bien placées → fait ; mal équilibré → Syntax ERROR', () => {
    let s = lab();
    s = L.equals(s);
    expect(s.flash).toMatchObject({ ok: false, reason: 'story', display: '89' });
    expect(L.truthShown(s)).toBe(false);
    s = L.equals(s);
    expect(L.truthShown(s)).toBe(true);                      // après le deuxième refus
    s = L.press(L.setCursor(s, 2), '(');
    s = L.equals(s);
    expect(s.flash).toMatchObject({ ok: false, reason: 'syntax' });
    s = L.press(L.setCursor(s, 6), ')');
    s = L.equals(s);
    expect(s.flash).toMatchObject({ ok: true, display: '40' });
    expect(L.taskDone(s)).toBe(true);
    expect(s.trials.map((e) => e.tk)).toEqual(['print', 'refused', 'print', 'refused', 'print', 'refused', 'print', 'solved']);
    expect(L.press(s, '(')).toBe(s);                          // la tâche faite est figée
  });
  it('k3 : sans paire → pas fait ; (9+2)×5 → 55 refusé ; 9+(2×5) → accepté avec la remarque « paire inutile »', () => {
    let s = { ...lab(), ti: 2 }; s = { ...s, ...L.restartTask(s), done: {} };
    expect(L.lineText(s)).toBe('9 + 2 × 5');
    expect(L.equals(s).flash).toMatchObject({ ok: false, reason: 'nopair', display: '19' });
    let w = L.press(L.setCursor(L.press(L.setCursor(s, 0), '('), 4), ')');
    w = L.equals(w);
    expect(w.flash).toMatchObject({ ok: false, reason: 'story', trap: 'wrongPair', display: '55' });
    let r = L.press(L.setCursor(L.press(L.setCursor(s, 2), '('), 6), ')');
    expect(L.lineText(r)).toBe('9 + ( 2 × 5 )');
    r = L.equals(r);
    expect(r.flash).toMatchObject({ ok: true, display: '19' });
    expect(r.remark).toBe('useless');
  });
  it('k4 : des parenthèses imbriquées ; 2×(50−12)+8 = 84 est refusé ; 2×(50−(12+8)) = 60 est juste', () => {
    let s = { ...lab(), ti: 3 }; s = { ...s, ...L.restartTask(s) };
    const at = (st, i, k) => L.press(L.setCursor(st, i), k);
    let early = at(at(s, 2, '('), 6, ')');   // 2 × ( 50 − 12 ) + 8
    expect(L.lineText(early)).toBe('2 × ( 50 − 12 ) + 8');
    expect(L.equals(early).flash).toMatchObject({ ok: false, trap: 'early', display: '84' });
    const ok = at(at(at(at(s, 7, ')'), 7, ')'), 4, '('), 2, '(');   // du dernier vers le premier : les indices ne bougent pas
    expect(L.lineText(ok)).toBe('2 × ( 50 − ( 12 + 8 ) )');
    expect(L.equals(ok).flash).toMatchObject({ ok: true, display: '60' });
  });
  it('متقدم : on tape toute la ligne ; le nombre de la barre doit rester celui de l\'histoire ; la valeur sans parenthèses est refusée', () => {
    let s = L.init(LEVELS['coop-calculator'].advanced.numbers);
    s = type(s, '( 40 + 8 ) ÷ 15 − 9');
    expect(L.equals(s).flash).toMatchObject({ ok: false, trap: 'numOnly', display: '−5,8' });
    s = L.init(LEVELS['coop-calculator'].advanced.numbers);
    s = type(s, '8');
    expect(L.equals(s).flash).toMatchObject({ ok: false, reason: 'numbers' });
    s = L.init(LEVELS['coop-calculator'].advanced.numbers);
    s = type(s, '( 40 + 8 ) ÷ ( 15 − 9 )');
    expect(L.lineText(s)).toBe('( 40 + 8 ) ÷ ( 15 − 9 )');
    expect(L.equals(s).flash).toMatchObject({ ok: true, display: '8' });
    expect(L.back(L.init(LEVELS['coop-calculator'].advanced.numbers)).line).toEqual([]);
  });
  it('les chiffres se collent au nombre ; la virgule une seule fois ; la ligne a une limite', () => {
    const r1 = L.pressKey([], 0, '1'); const r2 = L.pressKey(r1.line, r1.cur, '4'); const r3 = L.pressKey(r2.line, r2.cur, ',');
    expect(r3.line.map((x) => x.k)).toEqual(['14,']);
    expect(L.pressKey(r3.line, r3.cur, ',').ok).toBe(false);
    expect(L.back(L.init({ tasks: [L.PRESETS.advanced.tasks[0]] })).line).toEqual([]);
    expect(L.backKey(r3.line, 1).line[0].k).toBe('14');
  });
  it('« جرّب أعدادك » : la valeur de la machine et celle de gauche à droite sans priorité', () => {
    const r = L.freeRead(L.tokensOf('45 + 15 ÷ 4'));
    expect(r.display).toBe('48,75'); expect(r.ltr).toBe('15'); expect(r.differs).toBe(true);
    expect(L.freeRead(L.tokensOf('(45 + 15) ÷ 4')).differs).toBe(false);
    expect(L.freeRead([{ k: '(' }, { k: '3' }]).read.status).toBe('syntax');
    expect(L.freeDepthOk(L.tokensOf('((2 + 1) × 3)'))).toBe(true);
    expect(L.freeDepthOk(L.tokensOf('(((2)))'))).toBe(false);
  });
  it('le coach ne dit jamais une position ni une valeur', () => {
    let s = L.init(LEVELS['coop-calculator'].beginner.numbers);
    expect(L.coachOf(s).id).toBe('gap');
    s = L.setCursor(s, 2); expect(L.coachOf(s).id).toBe('bracket');
    s = L.press(s, '('); expect(L.coachOf(s).id).toBe('print');
    s = L.equals(s); expect(L.coachOf(s).id).toBe('syntax');
  });
});
