import { describe, it, expect } from 'vitest';
import * as L from './juiceLine';

describe('juice-line — le remplissage est exact (centilitres entiers)', () => {
  it('les essais vérifiés du plan : 18 L et 1,4 L → 12 bouteilles et 1,2 L restent ; 1,6 L → 11 bouteilles et une 12e à 0,4 L', () => {
    expect(L.fill(1800, 140, 12)).toEqual({ full: 12, partial: 0, left: 120, short: 0 });
    expect(L.fill(1800, 160, 12)).toEqual({ full: 11, partial: 40, left: 0, short: 0 });
    expect(L.fill(1800, 150, 12)).toEqual({ full: 12, partial: 0, left: 0, short: 0 });
    expect(L.verdictOf(L.fill(1800, 150, 12))).toBe('exact');
    expect(L.verdictOf(L.fill(1800, 140, 12))).toBe('leftover');
    expect(L.verdictOf(L.fill(1800, 160, 12))).toBe('short');
  });
  it('exhaustif : sur la graduation 0,05 L et un réservoir ≤ 30 L, la commande est servie sans reste ⇔ x = total ÷ commande', () => {
    for (const total of [900, 1800, 3000]) for (const order of [12, 36, 40]) for (let x = 5; x <= 200; x += 5) {
      const f = L.fill(total, x, order);
      const exact = L.verdictOf(f) === 'exact';
      expect(exact, `${total}/${x}/${order}`).toBe(x * order === total);
      expect(f.full * x + f.partial + f.left).toBe(total + (f.full >= order ? 0 : 0));
    }
  });
  it('les nombres de la tâche : 1,5 · 0,75 · 0,25 ; 6 · 22,5 · 6 (4 + x)', () => {
    const [a, b, c] = L.PRESETS.beginner.tasks.map(L.buildTask);
    expect([a.answer, b.answer, c.answer]).toEqual([150, 75, 25]);
    const [d, e, f] = L.PRESETS.advanced.tasks.map(L.buildTask);
    expect([d.answer, e.answer, f.answer]).toEqual([600, 2250, 600]);
    expect(f.content).toBe(1000);
  });
  it('refuse une capacité hors graduation ou un réservoir hors pas', () => {
    expect(() => L.buildTask({ kind: 'mould', total: 10, bottles: 3, tests: 2 })).toThrow();
    expect(() => L.buildTask({ kind: 'tank', bottles: 3, size: 0.25 })).toThrow();
  });
  it('lText écrit à l’algérienne', () => {
    expect([150, 75, 25, 600, 2250, 120].map(L.lText)).toEqual(['1,5', '0,75', '0,25', '6', '22,5', '1,2']);
  });
});

describe('juice-line — مبتدئ : deux essais, l’ardoise, les cartes', () => {
  const play = () => L.init(L.PRESETS.beginner);
  it('deux essais seulement : le troisième est refusé et ouvre l’ardoise', () => {
    let s = play();
    s = L.stretch(s, 140); s = L.pressFill(s);
    expect(s.w.testsLeft).toBe(1); expect(s.last.left).toBe(120);
    s = L.stretch(s, 160); s = L.pressFill(s);
    expect(s.w.testsLeft).toBe(0); expect(s.w.phase).toBe('slate');
    expect(s.last.partial).toBe(40);
    expect(L.stretch(s, 150).w.x).toBe(160);        // la main ne tient plus le moule
  });
  it('l’ardoise juge le DESSIN : 18÷12 juste ; 18×12, 12÷18, 18−12, 18+12 refusées avec leur modèle', () => {
    const at = (text) => { let s = play(); s = L.pressFill(s); s = L.openSlate(s); return L.writeOperation(s, text); };
    const good = at('18÷12');
    expect(good.w.phase).toBe('cards'); expect(good.w.x).toBe(150); expect(good.w.lastFill.left).toBe(0);
    expect(at('1,5').w.phase).toBe('cards');
    const models = { '18×12': 'mult', '12÷18': 'flip', '18−12': 'sub', '18+12': 'add', '2': 'other' };
    for (const [t, m] of Object.entries(models)) {
      const s = at(t); expect(s.w.phase, t).toBe('slate'); expect(s.flag.model, t).toBe(m);
      expect(s.w.miss.fill, t).toBeTruthy();
    }
    expect(at('18×12').w.x).toBe(200);            // le moule de 216 L déborde : tracé à la limite
    expect(at('12÷18').w.x).toBe(65);             // 0,666… tombe sur 0,65 : 27 bouteilles et 0,45 L
    expect(at('12÷18').w.miss.fill).toEqual({ full: 12, partial: 0, left: 1800 - 12 * 65, short: 0 });
    expect(at('abc').flag.unreadable).toBe(true);
  });
  it('les cartes : les DEUX bonnes, aucune fausse', () => {
    let s = play(); s = L.pressFill(s); s = L.openSlate(s); s = L.writeOperation(s, '1,5');
    const t = L.taskOf(s);
    expect(L.judgeCards(t, ['times'])).toMatchObject({ ok: false, missing: ['under'] });
    expect(L.judgeCards(t, ['times', 'under', 'swap'])).toMatchObject({ ok: false, wrong: 'swap' });
    expect(L.judgeCards(t, ['under', 'times']).ok).toBe(true);
    s = L.toggleCard(s, 'times'); s = L.toggleCard(s, 'under'); s = L.checkCards(s);
    expect(L.taskDone(s)).toBe(true); expect(L.canNext(s)).toBe(true);
    s = L.nextTask(s); expect(s.ti).toBe(1); expect(s.w.testsLeft).toBe(2);
  });
});

describe('juice-line — متقدم : le réservoir sous la main', () => {
  const adv = () => L.init(L.PRESETS.advanced);
  it('a1 : 24 × 0,25 = 6 ; « 24÷0,25 » est le modèle divide', () => {
    let s = adv();
    expect(L.writeOperation(s, '24÷0,25').flag.model).toBe('divide');
    s = L.writeOperation(s, '24×0,25'); expect(s.w.phase).toBe('set');
    s = L.stretch(s, 550); s = L.pressFill(s); expect(L.taskDone(s)).toBe(false);
    s = L.stretch(s, 600); s = L.pressFill(s); expect(L.taskDone(s)).toBe(true);
  });
  it('a3 : deux étapes — le contenu 10, puis ce qu’on presse en plus 6 ; (40 − 4) × 0,25 = 9 est UNDOFIRST', () => {
    let s = L.nextTask(L.nextTask((() => { let t = adv(); for (const [, op] of [['24×0,25', 600], ['15×1,5', 2250]].entries()) { t = L.writeOperation(t, op[0]); t = L.stretch(t, op[1]); t = L.pressFill(t); t = L.nextTask(t); } return t; })()));
    expect(L.taskOf(s).id).toBe('a3');
    expect(L.writeOperation(s, '40÷0,25').flag.model).toBe('divide');
    s = L.writeOperation(s, '40×0,25'); expect(s.w.stage).toBe('final'); expect(s.w.phase).toBe('slate');
    expect(L.writeOperation(s, '36×0,25').flag.model).toBe('undoFirst');
    expect(L.writeOperation(s, '10+4').flag.model).toBe('addCarry');
    s = L.writeOperation(s, '10−4'); expect(s.w.phase).toBe('set');
    s = L.stretch(s, 600); s = L.pressFill(s); expect(L.taskDone(s)).toBe(true);
    expect(L.currentFill(s)).toEqual({ full: 40, partial: 0, left: 0, short: 0 });
  });
});

describe('juice-line — جرّب أعدادك', () => {
  it('toujours ouvert, jamais compté', () => {
    let s = L.init(L.PRESETS.beginner);
    s = L.freeTask(s); s = L.pressFill(s);
    expect(s.trials.filter((t) => t.free).length).toBe(2);
    expect(L.guidedTrials(s)).toEqual([]);
    s = L.setFree(s, { total: 3000, bottles: 40, x: 75 }); s = L.pressFill(s);
    expect(s.free.lastFill).toEqual({ full: 40, partial: 0, left: 0, short: 0 });
    expect(L.toGuided(s).free).toBe(null);
  });
});
