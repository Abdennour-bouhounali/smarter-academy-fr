import { describe, it, expect } from 'vitest';
import * as L from './numberLinePegs';

const hangAll = (s, ks) => {
  let st = s;
  L.taskOf(st).cards.forEach((c, i) => { st = L.hang(L.holdAt(L.take(st, c.id), ks[i])); });
  return st;
};

describe('number-line-pegs — la logique exacte', () => {
  it('les cartes : valeur exacte, écriture gardée, forme modèle', () => {
    const c = L.buildCard('6/-8');
    expect(c.text).toBe('6/-8');
    expect(c.valueText).toBe('-3/4');
    expect(c.tw).toBe(-9);
    expect(L.buildCard('-1,5').valueText).toBe('-3/2');
    expect(L.buildCard('-7/3').decimal).toBe(false);
    expect(L.buildCard('-7/3').unit).toBe(-3);
    expect(() => L.buildCard('5/0')).toThrow();
  });

  it('w1 : deux piles (−9/12 ×3 et +9/12), la carte (−9)/(−12) traverse le zéro si elle est accrochée à gauche', () => {
    let s = L.init(L.PRESETS.beginner);
    expect(L.taskOf(s).cards.map((c) => c.tw)).toEqual([-9, -9, 9, 9]);
    s = hangAll(s, [-9, -9, 9, -9]);                    // la 4e (−9)/(−12) est accrochée du mauvais côté
    expect(L.wrongSide(s).text).toBe('-9/-12');
    s = L.check(s);
    const m = s.last.moves.find((x) => x.card === 'c3');
    expect(m.crossedZero).toBe(true);
    expect(m.dir).toBe('right');
    expect(m.twelfths).toBe('18');
    expect(s.last.stacks.map((g) => g.length).sort()).toEqual([2, 2]);
    expect(L.taskDone(s)).toBe(true);
    expect(s.trials.at(-1).kind).toBe('solved');
  });

  it('une carte bien accrochée reste (delta 0), une carte oubliée garde la tâche ouverte', () => {
    let s = L.init(L.PRESETS.beginner);
    s = L.hang(L.holdAt(L.take(s, 'c0'), -9));
    s = L.check(s);
    expect(s.last.moves[0].dir).toBe('stay');
    expect(L.taskDone(s)).toBe(false);
    expect(L.isLanded(s, 'c0')).toBe(true);
    expect(L.take(s, 'c0')).toBe(s);                    // une carte atterrie ne se reprend pas
  });

  it('w2 : −7/3 est à −28 douzièmes, entre −3 et −2 ; −14/6 et 7/−3 empilent', () => {
    let s = L.nextTask(L.init(L.PRESETS.beginner));
    s = L.init({ tasks: [L.PRESETS.beginner.tasks[1]] });
    expect(L.taskOf(s).cards.map((c) => c.tw)).toEqual([-28, -28, -28, 28]);
    s = L.check(hangAll(s, [-20, -20, -20, 20]));       // « −2 puis un tiers » : trop à droite
    expect(s.last.moves[0].dir).toBe('left');
    expect(s.last.moves[0].twelfths).toBe('-8');
    expect(s.last.stacks.map((g) => g.length)).toEqual([3]);
    expect(L.decimalDigits(L.taskOf(s).cards[0].value, 5)).toMatchObject({ int: '2', digits: '33333', endless: true, neg: true });
  });

  it('une carte reprise avant « تحقّق » peut être déplacée ; hors حبل elle revient au panier', () => {
    let s = L.init(L.PRESETS.beginner);
    s = L.hang(L.holdAt(L.take(s, 'c0'), 5));
    s = L.hang(L.holdAt(L.take(s, 'c0'), -9));
    expect(s.hung.c0).toBe(-9);
    s = L.drop(L.take(s, 'c1'));
    expect(L.inBasket(s).map((c) => c.id)).toContain('c1');
    expect(L.holdAt(L.take(s, 'c1'), 999).held.k).toBe(24);   // borné à l'intervalle [−2, 2] × 12
  });

  it('متقدم : le verdict exige l\'intervalle et l\'ordre ; un verdict faux laisse « أعد »', () => {
    const base = L.init(L.PRESETS.advanced);
    const t = L.taskOf(base);
    expect(t.snap).toBe(48);
    // a1 : les bonnes places, en 48es
    const good = t.cards.map((c) => Math.round(Number(c.value.n) * 48 / Number(c.value.d)));
    let s = L.check(hangAll(base, good));
    expect(s.verdict.ok).toBe(true);
    expect(L.taskDone(s)).toBe(true);
    // ordre échangé : −7/4 et −2/3 inversés
    const bad = [...good]; [bad[0], bad[2]] = [bad[2], bad[0]];
    s = L.check(hangAll(base, bad));
    expect(s.verdict).toMatchObject({ ok: false });
    expect(L.canRetry(s)).toBe(true);
    s = L.retry(s);
    expect(L.hungCards(s)).toHaveLength(0);
    // mauvais intervalle : −13/6 accrochée dans [−2, −1[
    const off = [...good]; off[3] = -90;
    expect(L.check(hangAll(base, off)).verdict).toMatchObject({ ok: false, why: 'unit' });
    // le bouton n'est actif que lorsque TOUTES les cartes sont accrochées
    expect(L.canCheck(L.hang(L.holdAt(L.take(base, 'c0'), good[0])))).toBe(false);
  });

  it('a3 : deux écritures de la même valeur peuvent être accrochées différemment ; −5/6 reste à gauche de −3/4', () => {
    const base = L.init({ tasks: [L.PRESETS.advanced.tasks[2]] });
    const v = (k) => L.check(hangAll(base, k)).verdict;
    expect(v([-36, -36, -40]).ok).toBe(true);
    expect(v([-36, -35, -40]).ok).toBe(true);
    expect(v([-36, -36, -35]).ok).toBe(false);
  });

  it('« جرّب أعدادك » : refus de b = 0, des cartes hors حبل, des champs invalides ; jamais compté', () => {
    expect(L.validateFree('5', '0').why).toBe('zero');
    expect(L.validateFree('50', '3').why).toBe('range');
    expect(L.validateFree('40', '5').why).toBe('outside');
    expect(L.validateFree('', '5').why).toBe('empty');
    expect(L.validateFree('-7,5', '2')).toMatchObject({ ok: true, text: '-7,5/2' });
    let s = L.init(L.PRESETS.beginner);
    s = L.addFree(L.addFree(s, '7', '-3'), '-14', '6');
    expect(L.isFree(s)).toBe(true);
    s = L.check(hangAll(s, [-28, -28]));
    expect(s.trials.at(-1).kind).toBe('custom');
    expect(s.done).toEqual({});
    expect(L.toGuided(s).free).toBe(null);
  });

  it('coachOf suit chaque monde jusqu\'au bout', () => {
    let s = L.init(L.PRESETS.beginner);
    const seen = new Set();
    for (let i = 0; i < 40 && !L.discoveryReady(s); i += 1) {
      const c = L.coachOf(s);
      if (c) seen.add(c.id);
      if (L.canNext(s)) { s = L.nextTask(s); continue; }
      const t = L.taskOf(s);
      if (s.held) { s = L.hang(L.holdAt(s, Math.round(Number(t.cards.find((x) => x.id === s.held.id).value.n) * 12 / Number(t.cards.find((x) => x.id === s.held.id).value.d)))); continue; }
      const next = L.inBasket(s)[0];
      if (next) { s = L.take(s, next.id); continue; }
      s = L.check(s);
    }
    expect(L.discoveryReady(s)).toBe(true);
    expect([...seen]).toEqual(expect.arrayContaining(['card', 'loupe', 'check']));
    const adv = L.init(L.PRESETS.advanced);
    expect(L.coachOf(adv).id).toBe('card');
    expect(L.coachOf(L.take(adv, 'c0')).id).toBe('hang');
  });
});
