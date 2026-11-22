import { describe, it, expect } from 'vitest';
import * as L from './trailOdometer';

const walkTo = (s, p) => L.arrive(L.setPos(s, p));
const solveTask = (s) => {
  const t = L.taskOf(s);
  if (t.predict) {
    s = L.write(s, 'pos', `${t.end}/${t.n}`);
    if (t.fields.includes('rest')) s = L.write(s, 'rest', `${t.n - t.end}/${t.n}`);
  }
  for (const target of t.targets) s = walkTo(s, target);
  if (!t.predict) s = L.write(s, 'pos', `${t.end}/${t.n}`);
  return s;
};

describe('trail-odometer — sentier : des fractions égales = des longueurs égales', () => {
  for (const loop of [false, true]) {
    it(`${loop ? 'circuit' : 'sentier'} : les n étapes de 1/n ont la même longueur d'arc (0,5 px)`, () => {
      const P = L.makePath(470, 230, loop);
      for (const n of [6, 12, 16, 20, 24]) {
        const d = [];
        for (let i = 0; i < n; i += 1) {
          // longueur d'arc de la polyligne échantillonnée entre i/n et (i+1)/n
          let acc = 0; let prev = P.at(i / n);
          for (let j = 1; j <= 200; j += 1) { const q = P.at((i + j / 200) / n); acc += Math.hypot(q.x - prev.x, q.y - prev.y); prev = q; }
          d.push(acc);
        }
        const mean = d.reduce((a, b) => a + b, 0) / n;
        d.forEach((x) => expect(Math.abs(x - mean)).toBeLessThan(0.5));
      }
    });
  }
  it('project est l’inverse de at', () => {
    const P = L.makePath(470, 230, false);
    for (const t of [0.1, 0.35, 0.5, 0.8]) { const p = P.at(t); expect(Math.abs(P.project(p.x, p.y) - t)).toBeLessThan(0.01); }
  });
});

describe('trail-odometer — tâches', () => {
  it('les niveaux : cibles exactes', () => {
    const b = L.init(L.PRESETS.beginner);
    expect(b.tasks.map((t) => t.end)).toEqual([9, 8, 4]);
    expect(b.tasks[1].legs.map((l) => [l.posts, l.kind])).toEqual([[5, 'fine'], [3, 'red']]);
    expect(b.tasks[2].start).toBe(9);
    const a = L.init(L.PRESETS.advanced);
    expect(a.tasks.map((t) => t.end)).toEqual([11, 5, 9, 11]);
    expect(a.tasks.map((t) => t.fields)).toEqual([['pos', 'rest'], ['pos', 'rest'], ['pos', 'rest'], ['pos']]);
    expect(a.tasks[3].loop).toBe(true);
  });
  it('« وصلنا » juge la position exacte ; en deçà ou au-delà : refus avec le sens', () => {
    let s = L.init(L.PRESETS.beginner);
    s = L.arrive(L.setPos(s, 4));
    expect(s.last).toMatchObject({ kind: 'leg', ok: false }); expect(s.w.miss).toBe('short'); expect(s.w.li).toBe(0);
    s = L.arrive(L.setPos(s, 5));
    expect(s.last.ok).toBe(true); expect(s.w.li).toBe(1);
    s = L.arrive(L.setPos(s, 10));
    expect(s.w.miss).toBe('long');
  });
  it('rouge : le pas rouge vaut k blancs ; les compteurs lisent blancs et rouges', () => {
    let s = L.nextTask(L.nextTask({ ...L.init(L.PRESETS.beginner), done: { 0: true, 1: true } }));
    expect(s.ti).toBe(2);
    s = L.init(L.PRESETS.beginner); s = { ...s, ti: 1, w: { ...s.w, pos: 5, li: 1, phase: 'walk' } };
    s = L.nudgeRed(s, 1);
    expect(s.w.pos).toBe(8);
    expect(L.counters(s)).toMatchObject({ white: 8, red: 2, leftover: 2 });
  });
  it('chaque tâche des deux niveaux se résout (prédiction, marche, écriture)', () => {
    for (const lv of ['beginner', 'advanced']) {
      let s = L.init(L.PRESETS[lv]);
      for (let i = 0; i < s.tasks.length; i += 1) {
        s = solveTask(s);
        expect(L.taskDone(s), `${lv} ${i}`).toBe(true);
        if (i < s.tasks.length - 1) s = L.nextTask(s);
      }
      expect(L.discoveryReady(s)).toBe(true);
    }
  });
  it('prédiction : le sentier est verrouillé jusqu’aux deux écritures justes', () => {
    let s = L.init(L.PRESETS.advanced);
    expect(L.hikerLocked(s)).toBe(true);
    expect(L.setPos(s, 3)).toBe(s);
    s = L.write(s, 'pos', '11/16');
    expect(L.hikerLocked(s)).toBe(true);
    s = L.write(s, 'rest', '5/16');
    expect(L.hikerLocked(s)).toBe(false); expect(s.w.phase).toBe('walk');
  });
  it('les écritures fausses ont leur modèle et leur drapeau', () => {
    const b = L.init(L.PRESETS.beginner);
    const g2 = b.tasks[1];
    expect(L.judgeWriting(g2, '8/12')).toMatchObject({ ok: true });
    expect(L.judgeWriting(g2, '2/3')).toMatchObject({ ok: true });
    expect(L.judgeWriting(g2, '٨/١٢')).toMatchObject({ ok: true });
    const across = L.judgeWriting(g2, '6/16'); expect(across).toMatchObject({ ok: false, model: 'across' }); expect(across.flagAt).toBeCloseTo(0.375);
    expect(L.judgeWriting(g2, '6/12')).toMatchObject({ ok: false, model: 'noScale', flagAt: 0.5 });
    expect(L.judgeWriting(g2, 'abc')).toMatchObject({ ok: false, unreadable: true });
    const a4 = L.init(L.PRESETS.advanced).tasks[3];
    expect(L.judgeWriting(a4, '11/6').ok).toBe(true);
    expect(L.judgeWriting(a4, '6/6')).toMatchObject({ ok: false, model: 'natural' });
    const a1 = L.init(L.PRESETS.advanced).tasks[0];
    expect(L.judgeWriting(a1, '11/16', 'pos').ok).toBe(true);
    expect(L.judgeWriting(a1, '5/16', 'rest').ok).toBe(true);
    expect(L.judgeWriting(a1, '11/16', 'rest')).toMatchObject({ ok: false, model: 'part' });
  });
  it('le drag choisit le tour le plus proche', () => {
    let s = L.init(L.PRESETS.advanced); s = L.write(L.write(s, 'pos', '11/16'), 'rest', '5/16');
    let l = L.init(L.PRESETS.advanced); l = { ...l, ti: 3, w: { ...l.tasks[3] && { pos: 5, li: 0, phase: 'walk', predicted: {}, written: null, touched: false, miss: null } } };
    expect(L.dragTo(l, 0.9).w.pos).toBe(5);   // 0,9 × 6 = 5,4 → 5 (premier tour)
    l = { ...l, w: { ...l.w, pos: 9 } };
    expect(L.dragTo(l, 0.9).w.pos).toBe(11);  // le second tour : 6 + 5
    expect(s.w.phase).toBe('walk');
  });
  it('jeu libre : seul le cas de 2AM est ouvert', () => {
    expect(L.freeCheck('5', '12', '1', '4')).toMatchObject({ ok: true, n: 12 });
    expect(L.freeCheck('1', '3', '1', '2')).toMatchObject({ ok: false, why: 'unrelated' });
    expect(L.freeCheck('1', '4', '3', '4', '-')).toMatchObject({ ok: false, why: 'negative' });
    expect(L.freeCheck('3', '4', '3', '4')).toMatchObject({ ok: false, why: 'tooBig' });
    let s = L.freeTask(L.init(L.PRESETS.beginner), '5', '12', '1', '4');
    expect(L.isFree(s)).toBe(true); expect(L.taskOf(s).end).toBe(8);
    s = L.freeFlag(s, '6/16'); expect(s.flag.at).toBeCloseTo(0.375);
    expect(L.toGuided(s).free).toBe(null);
  });
  it('coachOf : marcher, puis arriver, puis (rouge), écrire', () => {
    let s = L.init(L.PRESETS.beginner);
    expect(L.coachOf(s).id).toBe('walk');
    s = L.setPos(s, 5);
    expect(L.coachOf(s).id).toBe('arrive');
    s = L.arrive(s); s = L.setPos(s, 6);
    expect(L.coachOf(s).id).toBe('arrive');
    s = L.arrive(L.setPos(s, 9));
    expect(L.coachOf(s).id).toBe('write');
  });
});
