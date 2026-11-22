import { describe, it, expect } from 'vitest';
import * as L from './affineLine';

/**
 * affine-line — la droite qui a quitté l'origine, sur les nombres du نشاط 3 (g(x) = 3/2 x,
 * f(x) = 3/2 x + 1) et des niveaux (levels.js) : beginner 1/2 x + 2, advanced 3/2 x + 1 puis la rampe
 * cachée −1/2 x + 3.
 */
const t = (p) => L.numText(p, 'frac');
const v = (s) => L.toFrac(s);

describe('lecture des props', () => {
  it('modes enchaînés, droite cachée, cibles', () => {
    expect(L.parseModes('shift|identify')).toEqual(['shift', 'identify']);
    expect(() => L.parseModes('pivot')).toThrow();
    expect(t(L.parseLine('-1/2:3').a)).toBe('-1/2');
    expect(L.parseReads('x:4|y:7').map((r) => r.axis)).toEqual(['x', 'y']);
    expect(L.styleOf('3/2', '1')).toBe('frac');
    expect(L.styleOf('0,5', '2')).toBe('dec');
  });
  it('un contrat incomplet est une erreur de contenu', () => {
    expect(() => L.init({ mode: 'shift', a: '1' })).toThrow();
    expect(() => L.init({ mode: 'shift|identify', a: '1', b: '2' })).toThrow();
    expect(() => L.init({ mode: 'read', a: '0', b: '2' })).toThrow();
  });
});

describe('shift — نشاط 3 : (d′) est (d) montée de b', () => {
  const s0 = L.init({ a: '3/2', b: '1', mode: 'shift|identify', find: '-1/2:3' });
  it('la fenêtre contient O, (0 ; 1), (2 ; 4) et la grille atteint b exactement', () => {
    expect(s0.win.xMin).toBeLessThanOrEqual(0);
    expect(s0.win.yMax).toBeGreaterThanOrEqual(4);
    expect(L.isMul(v('1'), s0.snap.dB)).toBe(true);
    expect(L.isMul(v('3/2'), s0.snap.dA)).toBe(true);
    expect(L.isMul(v('-1/2'), s0.snap.dA)).toBe(true);
  });
  it('la droite de l\'élève part de (d) : b′ = 0', () => {
    expect(t(s0.bNow)).toBe('0');
    expect(L.mode(s0)).toBe('shift');
  });
  it('b′ ≠ b est refusé (f(0) = 1), b′ = 0 est (d) elle-même', () => {
    let s = L.setB(s0, v('2'));
    expect(s.last.kind).toBe('shiftOff');
    expect(s.shiftDone).toBe(false);
    s = L.setB(s, v('0'));
    expect(s.last.kind).toBe('shiftZero');
  });
  it('la marche résiste en shift (a est celle de f)', () => {
    expect(L.setA(s0, v('2')).last.kind).toBe('aFixed');
  });
  it('la sonde lit 3 sur (d) et 4 sur (d′) en 2 (س 1 أ) — l\'écart b est le même partout', () => {
    let s = L.setB(s0, v('1'));
    expect(s.last.kind).toBe('shiftOk');
    s = L.probe(s, v('2'));
    expect(t(s.last.yd)).toBe('3');
    expect(t(s.last.yl)).toBe('4');
    expect(L.stageDone(s)).toBe(false); // une seule abscisse
    s = L.probe(s, v('-2'));
    expect(t(s.last.yl)).toBe('-2');
    expect(L.stageDone(s)).toBe(true);
    for (const p of s.probes) expect(t(L.addFrac(p.yd, v('1')))).toBe(t(p.yl));
  });
  it('les colonnes « (d) → (d′) » évitent 0 et restent dans la fenêtre', () => {
    const cols = L.liftColumns(L.setB(s0, v('1')));
    expect(cols).not.toContain(0);
    expect(cols.length).toBeGreaterThan(1);
  });
});

describe('identify — lire b et a sur une droite donnée', () => {
  const done = (() => {
    let s = L.init({ a: '3/2', b: '1', mode: 'shift|identify', find: '-1/2:3' });
    s = L.setB(s, v('1')); s = L.probe(s, v('2')); s = L.probe(s, v('1'));
    return s;
  })();
  it('on ne passe au second laboratoire qu\'après le premier, et l\'on peut revenir', () => {
    const fresh = L.init({ a: '3/2', b: '1', mode: 'shift|identify', find: '-1/2:3' });
    expect(L.next(fresh).stage).toBe(0);
    const s = L.next(done);
    expect(L.mode(s)).toBe('identify');
    expect(t(s.aNow)).toBe('1');
    const back = L.back(s);
    expect(L.mode(back)).toBe('shift');
    expect(t(back.bNow)).toBe('1');
    expect(back.probes.length).toBe(2);
  });
  it('chaque essai dit la relation des deux droites', () => {
    let s = L.next(done);
    s = L.setB(s, v('3'));
    expect(s.last.kind).toBe('rel-sameB');
    s = L.setA(s, v('-1/2'));
    expect(s.last.kind).toBe('rel-match');
    expect(s.matched).toBe(true);
    s = L.setB(s, v('1'));
    expect(s.last.kind).toBe('rel-parallel');
    expect(L.relation(v('2'), v('0'), v('-1/2'), v('3'))).toBe('cross');
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.primaryMode(s)).toBe('identify');
  });
  it('seule, identify cache la fonction elle-même', () => {
    const s = L.init({ a: '2', b: '-3', mode: 'identify' });
    expect(t(s.hidden.a)).toBe('2');
    expect(t(s.aNow)).toBe('1');
    const s2 = L.init({ a: '1', b: '-3', mode: 'identify' });
    expect(t(s2.aNow)).toBe('-1');
  });
});

describe('draw — deux points suffisent, O est refusé quand b ≠ 0', () => {
  const s0 = L.init({ a: '2', b: '-3', mode: 'draw' });
  it('O refusé : f(0) = −3', () => {
    const s = L.place(s0, v('0'), v('0'));
    expect(s.last.kind).toBe('originRefused');
    expect(t(s.last.fx)).toBe('-3');
  });
  it('un point hors de la droite refusé avec son écart, deux points acceptés tracent la droite', () => {
    let s = L.place(s0, v('2'), v('2'));
    expect(s.last.kind).toBe('refused');
    expect(t(s.last.gap)).toBe('1');
    s = L.place(s, v('0'), v('-3'));
    expect(s.last.kind).toBe('accepted');
    expect(L.drawLine(s)).toBe(false);
    s = L.place(s, v('2'), v('1'));
    expect(s.last.line).toBe(true);
    expect(L.stageDone(s)).toBe(true);
  });
  it('l\'épingle ne commence jamais sur la droite, et la grille atteint chaque (x ; f(x))', () => {
    const p = L.startPin(s0);
    expect(L.onLine(s0.a, s0.b, L.valueAt(p.i, s0.snap.dx), L.valueAt(p.j, s0.snap.dyPin))).toBe(false);
    const s = L.init({ a: '3/2', b: '1', mode: 'draw' });
    for (let i = -4; i <= 4; i++) expect(L.isMul(L.image(s.a, s.b, L.valueAt(i, s.snap.dx)), s.snap.dyPin)).toBe(true);
  });
});

describe('read — صورة 4 والعدد الذي صورته 7', () => {
  const s0 = L.init({ a: '3/2', b: '1', mode: 'read', reads: 'x:4|y:7' });
  it('les deux lectures sont exactes et ferment les cibles', () => {
    let s = L.probe(s0, v('4'));
    expect(t(s.last.other)).toBe('7');
    s = L.readY(s, v('7'));
    expect(t(s.last.other)).toBe('4');
    expect(L.targetsDone(s)).toEqual([true, true]);
    expect(L.stageDone(s)).toBe(true);
  });
  it('un antécédent non décimal reste exact', () => {
    const s = L.readY(L.init({ a: '3', b: '1', mode: 'read' }), v('2'));
    expect(t(s.last.other)).toBe('1/3');
    expect(L.approxTex(s.last.other)).toContain('\\approx');
  });
});

describe('écritures', () => {
  it('la formule à la façon du manuel', () => {
    expect(L.affineTex(v('3/2'), v('1'), 'frac')).toBe('\\dfrac{3}{2}x + 1');
    expect(L.affineTex(v('-1/2'), v('3'), 'frac')).toBe('-\\dfrac{1}{2}x + 3');
    expect(L.affineTex(v('2'), v('-3'))).toBe('2x - 3');
    expect(L.affineTex(v('1'), v('0'))).toBe('x');
    expect(L.affineTex(v('0'), v('4'))).toBe('4');
    expect(L.imageCalcTex(v('3/2'), v('1'), v('2'), 'frac')).toBe('\\dfrac{3}{2} \\times 2 + 1 = 4');
    expect(L.affineText(v('0,5'), v('2'))).toBe('0,5x + 2');
  });
  it('le tronçon visible passe par (0 ; b)', () => {
    const [[x1, y1], [x2, y2]] = L.segment(v('1/2'), v('2'), { xMin: -2, xMax: 6, yMin: -1, yMax: 5 });
    const at0 = y1 + ((y2 - y1) * (0 - x1)) / (x2 - x1);
    expect(at0).toBeCloseTo(2);
  });
});

describe('valeurs par défaut et balayage (2026-10-09)', () => {
  const READ = { a: '3/2', b: '1', mode: 'read', reads: 'x:4|y:7' };
  it('la sonde de départ n\'est jamais une cible de lecture et n\'écrit rien', () => {
    for (const props of [READ, { a: '3/2', b: '1', mode: 'shift' }, { a: '2', b: '3', mode: 'read', reads: 'x:1|x:2|y:5' }]) {
      const s = L.init(props);
      const ix = L.defaultProbeIndex(s, 'x');
      const iy = L.defaultProbeIndex(s, 'y');
      expect(s.reads.some((r) => r.axis === 'x' && L.same(r.v, L.valueAt(ix, s.snap.dx)))).toBe(false);
      expect(s.reads.some((r) => r.axis === 'y' && L.same(r.v, L.valueAt(iy, s.snap.dyRead)))).toBe(false);
      expect(s.trials).toHaveLength(0);
      expect(s.readsDone).toHaveLength(0);
      expect(s.probes).toHaveLength(0);
    }
  });
  it('shift : le balayage des b′ valide chaque essai comme la main', () => {
    let s = L.init({ a: '3/2', b: '1', mode: 'shift' });
    const todo = L.untriedShifts(s);
    expect(todo.length).toBeGreaterThan(2);
    for (const j of todo) s = L.setB(s, L.valueAt(j, s.snap.dB));
    expect(L.untriedShifts(s)).toHaveLength(0);
    expect(s.shiftDone).toBe(true);
    expect(s.trials.filter((x) => x.kind === 'shift')).toHaveLength(todo.length);
  });
  it('read : le balayage des x et des y atteint les cibles, sans doublon', () => {
    let s = L.init(READ);
    for (const i of L.untriedProbes(s, 'x')) s = L.probe(s, L.valueAt(i, s.snap.dx));
    for (const i of L.untriedProbes(s, 'y')) s = L.readY(s, L.valueAt(i, s.snap.dyRead));
    expect(L.untriedProbes(s, 'x')).toHaveLength(0);
    expect(L.targetsDone(s).every(Boolean)).toBe(true);
  });
});
