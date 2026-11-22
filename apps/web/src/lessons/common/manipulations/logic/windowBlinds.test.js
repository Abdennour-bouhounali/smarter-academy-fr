import { describe, it, expect } from 'vitest';
import * as L from './windowBlinds';

const pullTo = (s) => { const t = L.taskOf(s); return L.setBlind(L.setCurtain(s, t.a), t.c); };
const solve = (s) => {
  const t = L.taskOf(s);
  if (t.predict) { s = L.write(s, `${t.num}/${t.den}`); return L.ask(pullTo(s)); }
  return L.write(L.ask(pullTo(s)), `${t.num}/${t.den}`);
};

describe('window-blinds — la grille est le produit (exhaustif)', () => {
  it('pour tout b, d ≤ 8 et W, H ≤ 2 : cases = b·W × d·H, ombrées = a·c, aire = ac/(bd) fenêtre', () => {
    let n = 0;
    for (let b = 1; b <= 8; b += 1) for (let d = 2; d <= 8; d += 1) for (let W = 1; W <= 2; W += 1) for (let H = 1; H <= 2; H += 1) {
      for (let a = 1; a <= b * W; a += 1) for (let c = 1; c <= d * H; c += 1) {
        const t = L.buildTask({ id: 'x', curtain: `${a}/${b}`, blind: `${c}/${d}`, W, H });
        expect(t.cols * t.rows).toBe(b * W * d * H);
        expect(t.grid.shaded).toBe(BigInt(a * c)); expect(t.grid.total).toBe(BigInt(b * d));
        // l'aire du coin sombre = ca/b × cc/d fenêtre ; chaque petit carré vaut 1/(b·d) fenêtre
        expect(a * c * (1 / (b * d))).toBeCloseTo((a / b) * (c / d), 10);
        n += 1;
      }
    }
    expect(n).toBeGreaterThan(1000);
  });
});

describe('window-blinds — tâches', () => {
  it('les niveaux : produits exacts', () => {
    const b = L.init(L.PRESETS.beginner);
    expect(b.tasks.map((t) => [t.num, t.den, t.reduced.num, t.reduced.den])).toEqual([[6, 12, 1, 2], [3, 10, 3, 10], [8, 15, 8, 15]]);
    expect(b.tasks.map((t) => [t.cols, t.rows])).toEqual([[3, 4], [2, 5], [5, 3]]);
    const a = L.init(L.PRESETS.advanced);
    expect(a.tasks.map((t) => [t.num, t.den])).toEqual([[6, 6], [15, 20], [28, 12], [6, 5]]);
    expect(a.tasks[3].natural).toBe(true);
    expect(a.tasks.map((t) => t.reduced)).toEqual([{ num: 1, den: 1 }, { num: 3, den: 4 }, { num: 7, den: 3 }, { num: 6, den: 5 }]);
  });
  it('refuse un tirage hors du mur', () => {
    expect(() => L.buildTask({ curtain: '4/3', blind: '1/2', W: 1, H: 1 })).toThrow();
    expect(() => L.buildTask({ curtain: '1/9', blind: '1/2' })).toThrow();
  });
  it('les deux tirages se collent aux crans et se verrouillent après', () => {
    let s = L.init(L.PRESETS.beginner);
    s = L.setCurtain(s, 99); expect(s.w.ca).toBe(3);
    s = L.setBlind(s, -4); expect(s.w.cc).toBe(0);
    s = L.setBlind(s, 2.4); expect(s.w.cc).toBe(2);
  });
  it('« ماذا أُظلم؟ » vérifie les deux tirages ; les guides n’apparaissent qu’après', () => {
    let s = L.init(L.PRESETS.beginner);
    expect(L.linesShown(s)).toBe(false);
    s = L.ask(L.setCurtain(s, 2));
    expect(s.w.phase).toBe('pull'); expect(s.w.miss).toEqual({ curtain: null, blind: 'short' }); expect(L.linesShown(s)).toBe(false);
    s = L.ask(L.setBlind(s, 3));
    expect(s.w.phase).toBe('write'); expect(L.linesShown(s)).toBe(true); expect(L.pullLocked(s)).toBe(true);
  });
  it('judge : 6/12 et 1/2 acceptés ; 17/12, 6/7, 8/9, 2/3, 6 refusés avec leur modèle', () => {
    const t = L.buildTask({ id: 'w1', curtain: '2/3', blind: '3/4' });
    for (const ok of ['6/12', '1/2', '٣/٦', '12/24']) expect(L.judgeProduct(t, ok).ok, ok).toBe(true);
    const m = (x) => L.judgeProduct(t, x).model;
    expect([m('17/12'), m('6/7'), m('8/9'), m('2/3'), m('6'), m('1/3')]).toEqual(['sum', 'sameDen', 'cross', 'oneFactor', 'count', 'other']);
    expect(L.judgeProduct(t, '17/12').bigger).toBe(true);
    expect(L.judgeProduct(t, 'abc').unreadable).toBe(true);
  });
  it('chaque tâche des deux niveaux se résout et laisse un « solved »', () => {
    for (const lv of ['beginner', 'advanced']) {
      let s = L.init(L.PRESETS[lv]);
      for (let i = 0; i < s.tasks.length; i += 1) {
        s = solve(s);
        expect(L.taskDone(s)).toBe(true);
        if (i < s.tasks.length - 1) s = L.nextTask(s);
      }
      expect(L.discoveryReady(s)).toBe(true);
      expect(s.trials.filter((x) => x.kind === 'solved')).toHaveLength(s.tasks.length);
    }
  });
  it('متقدم : les tirages sont fermés tant que le produit n’est pas écrit ; une prédiction fausse ne les ouvre pas', () => {
    let s = L.init(L.PRESETS.advanced);
    expect(L.pullLocked(s)).toBe(true);
    s = L.setCurtain(s, 3); expect(s.w.ca).toBe(0);
    s = L.write(s, '13/6'); expect(s.w.phase).toBe('predict'); expect(s.flag).toMatchObject({ model: 'sum' });
    s = L.write(s, '1'); expect(s.w.phase).toBe('pull'); expect(L.pullLocked(s)).toBe(false); expect(L.linesShown(s)).toBe(false);
    s = L.ask(pullTo(s)); expect(L.taskDone(s)).toBe(true); expect(L.linesShown(s)).toBe(true);
  });
  it('« جرّب أعدادك » : bornes, mur élargi, cadre libre jamais compté', () => {
    expect(L.freeCheck('2', '3', '3', '4').ok).toBe(true);
    expect(L.freeCheck('2', '1', '3', '4').why).toBe('range');
    expect(L.freeCheck('7', '3', '1', '2').why).toBe('tooBig');
    expect(L.freeCheck('', '3', '1', '2').why).toBe('incomplete');
    let s = L.freeTask(L.init(L.PRESETS.beginner), '5', '4', '3', '2');
    expect(L.isFree(s)).toBe(true); expect(L.taskOf(s)).toMatchObject({ W: 2, H: 2, cols: 8, rows: 4 });
    s = L.freeFlag(s, '1/2'); expect(s.flag).toMatchObject({ model: 'free', value: 0.5 });
    expect(s.trials.filter((x) => x.kind === 'custom')).toHaveLength(1);
    expect(L.toGuided(s).free).toBe(null);
  });
  it('coachOf : curtain → blind → ask → write ; jamais la réponse', () => {
    let s = L.init(L.PRESETS.beginner);
    expect(L.coachOf(s).id).toBe('curtain');
    s = L.setCurtain(s, 2); expect(L.coachOf(s).id).toBe('blind');
    s = L.setBlind(s, 3); expect(L.coachOf(s).id).toBe('ask');
    s = L.ask(s); expect(L.coachOf(s).id).toBe('lines');
  });
});
