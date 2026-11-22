import { describe, it, expect } from 'vitest';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import * as L from './groupTanks';

const txt = LIN.fracText;

describe('group-tanks — the water is the weighted mean', () => {
  it('beginner: 4 friends at 12 and 6 friends at 7 settle at 9, not 9,5', () => {
    const s = L.init({ groups: '4:12|6:7' });
    expect(txt(L.level(s, 0))).toBe('9');
    expect(txt(L.meanOfMeans(s, 0))).toBe('19/2');
    expect(txt(L.water(s, 0))).toBe('90');
    expect(L.count(s, 0)).toBe(10);
    expect(txt(s.step)).toBe('1/2');
    expect(L.levelTex(s, 0)).toBe('9');
  });

  it('advanced (تحدّ): both classes total 384 over 33 — same level 384/33', () => {
    const s = L.init({ groups: '15:10|18:13|14:12,5|19:11', classes: '2|2' });
    expect(s.classes.map((c) => c.members)).toEqual([[0, 1], [2, 3]]);
    expect([txt(L.water(s, 0)), txt(L.water(s, 1))]).toEqual(['384', '384']);
    expect([L.count(s, 0), L.count(s, 1)]).toEqual([33, 33]);
    expect(txt(L.level(s, 0))).toBe('128/11');
    expect(L.sameLevels(s)).toBe(true);
    expect(txt(s.step)).toBe('1/10');
    expect(L.levelTex(s, 0)).toBe('\\dfrac{384}{33} \\approx 11{,}64');
    expect(L.sumTex(s, 1)).toBe('14 \\times 12{,}5 + 19 \\times 11 = 384');
    // les moyennes des moyennes diffèrent (11,5 et 11,75) — l'eau, non
    expect([txt(L.meanOfMeans(s, 0)), txt(L.meanOfMeans(s, 1))]).toEqual(['23/2', '47/4']);
  });

  it('the valve refuses to open before a bet, and judges the bet against the water', () => {
    let s = L.init({ groups: '4:12|6:7' });
    s = L.openValve(s, 0);
    expect(s.last.kind).toBe('betFirst');
    expect(s.classes[0].opened).toBe(false);
    s = L.setBet(s, 0, 19); // 9,5 = la moyenne des moyennes
    s = L.openValve(s, 0);
    expect(s.trials[0]).toMatchObject({ kind: 'meanOfMeans', ok: false });
    expect(L.setBet(s, 0, 18).last.kind).toBe('betLocked');
    s = L.refill(s, 0);
    s = L.openValve(L.setBet(s, 0, 18), 0);
    expect(s.trials[1]).toMatchObject({ kind: 'ok', ok: true });
  });

  it('advanced: 11,6 is the right graduation, 11,5 (mean of means of A) is refused', () => {
    let s = L.init({ groups: '15:10|18:13|14:12,5|19:11', classes: '2|2' });
    expect(L.judgeBet(s, 0, 116).kind).toBe('ok');
    expect(L.judgeBet(s, 0, 115).kind).toBe('meanOfMeans');
    expect(L.judgeBet(s, 1, 118).kind).toBe('meanOfMeans'); // 11,75 → graduation 11,8
    expect(L.judgeBet(s, 1, 130).kind).toBe('high');
    expect(L.discoveryReady(s)).toBe(false);
    s = L.openValve(L.setBet(s, 0, 116), 0);
    expect(L.discoveryReady(s)).toBe(false);
    s = L.openValve(L.setBet(s, 1, 100), 1);
    expect(L.discoveryReady(s)).toBe(true);
  });

  it('sizes move only once the water is in the class; the level follows Σ n·m ÷ N', () => {
    let s = L.init({ groups: '4:12|6:7' });
    expect(L.setSize(s, 0, 6).last.kind).toBe('sizeFirst');
    s = L.openValve(L.setBet(s, 0, 18), 0);
    expect(L.discoveryReady(s)).toBe(false);
    s = L.setSize(s, 0, 6); // 6 et 6 : effectifs égaux → la moyenne des moyennes
    expect(txt(L.level(s, 0))).toBe('19/2');
    expect(s.sizeTrials[0].equal).toBe(true);
    expect(L.discoveryReady(s)).toBe(true);
    s = L.setSize(s, 1, 1);
    expect(txt(L.level(s, 0))).toBe('79/7');
    expect(L.setSize(s, 1, 0).groups[1].n).toBe(1);
    expect(L.setSize(s, 0, 999).groups[0].n).toBe(L.nMax(s.groups[0]));
  });

  it('sweep: the level is always between the extreme means and equals water ÷ N', () => {
    for (let a = 1; a <= 12; a++) {
      for (let b = 1; b <= 12; b++) {
        const s = L.init({ groups: `${a}:12|${b}:7` });
        const lv = L.level(s, 0);
        expect(LIN.cmp(lv, LIN.frac(7)) >= 0 && LIN.cmp(lv, LIN.frac(12)) <= 0).toBe(true);
        expect(LIN.eq(LIN.mul(lv, a + b), L.water(s, 0))).toBe(true);
        if (a === b) expect(LIN.eq(lv, L.meanOfMeans(s, 0))).toBe(true);
        else expect(LIN.eq(lv, L.meanOfMeans(s, 0))).toBe(false);
      }
    }
  });

  it('geometry: the water area of the groups equals the drawn area of the class', () => {
    for (const groups of ['4:12|6:7', '15:10|18:13', '14:12,5|19:11']) {
      for (const width of [140, 200, 320, 560]) {
        const s = L.init({ groups });
        const g = L.columnGeometry(s, 0, { width, tankH: 120 });
        const classArea = g.cls.w * (120 - g.yOf(L.level(s, 0)));
        expect(Math.abs(g.area - classArea)).toBeLessThan(1e-6);
        expect(g.tanks.at(-1).x + g.tanks.at(-1).w).toBeLessThanOrEqual(width + 1e-9);
        expect(g.tanks[0].x).toBeGreaterThanOrEqual(-1e-9);
      }
    }
  });

  it('pointer → bet, clamped to the grid', () => {
    const s = L.init({ groups: '4:12|6:7' });
    expect(L.kFromY(s, 60, 120)).toBe(20); // mi-hauteur = 10
    expect(L.kFromY(s, -10, 120)).toBe(40);
    expect(L.kFromY(s, 500, 120)).toBe(0);
  });

  it('bad content throws at init', () => {
    expect(() => L.init({ groups: '4:12' })).toThrow();
    expect(() => L.init({ groups: '0:12|4:3' })).toThrow();
    expect(() => L.init({ groups: '1:2|3:4|5:6', classes: '2|2' })).toThrow();
  });

  it('evidence lists the student\'s own bets', () => {
    let s = L.init({ groups: '4:12|6:7' });
    s = L.openValve(L.setBet(s, 0, 19), 0);
    const ev = L.evidenceOf(s);
    expect(ev.bets[0]).toMatchObject({ bet: '9,5', level: '9', ok: false, kind: 'meanOfMeans' });
  });
});
