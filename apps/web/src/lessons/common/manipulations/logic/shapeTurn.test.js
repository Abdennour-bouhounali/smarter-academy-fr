import { describe, it, expect } from 'vitest';
import * as L from './shapeTurn';
import { LEVELS } from '../levels';

/**
 * shape-turn — la logique du papier calque épinglé en O (leçon khawas-dawaran). Les nombres sont ceux des deux niveaux
 * (levels.js) : la rosace de zellige (60°, plateforme) et la طريقة p. 155 (OAB, OCD rectangles isocèles en O, 90° direct)
 * suivie du centre de l'exercice 18 p. 161 (W(2 ; 4)).
 */
const rosette = () => L.init(LEVELS['shape-turn'].beginner.numbers);
const prove = () => L.init(LEVELS['shape-turn'].advanced.numbers);

describe('shape-turn — les jauges : ce qui reste, ce qui change', () => {
  it('à toute rotation de la feuille, longueur, angle, aire et alignement restent ; l’angle entre (AB) et (A′B′) = la rotation repliée', () => {
    const s = rosette();
    for (let t = -360; t <= 360; t += 5) {
      const g = L.gauges(L.turn(s, t));
      expect(g.rotation).toBe(true);
      expect(g.length).toMatchObject({ orig: '3', copy: '3', equal: true });
      expect(g.angle.equal).toBe(true);
      expect(g.area).toMatchObject({ orig: '3', copy: '3', equal: true });
      expect(g.aligned).toBe(true);
      const a = ((t % 180) + 180) % 180;
      expect(g.between, `θ = ${t}`).toBe(Math.min(a, 180 - a));
    }
    expect(L.gauges(L.turn(s, 90)).perp).toBe(true);
    expect(L.gauges(L.turn(s, 180)).parallel).toBe(true);
    expect(L.gauges(L.turn(s, -270)).perp).toBe(true);
    expect(L.gauges(L.turn(s, 60)).perp).toBe(false);
  });
  it('le faux mors (feuille étirée) change la longueur, l’angle et l’aire — mais pas l’alignement', () => {
    const s = L.stretchTo(L.turn(rosette(), 60), 12);
    const g = L.gauges(s);
    expect(g.rotation).toBe(false);
    expect(g.length).toMatchObject({ orig: '3', copy: '3,6', equal: false });
    expect(g.angle.equal).toBe(false);
    expect(g.area.equal).toBe(false);
    expect(g.area.copy).toBe('3,6');
    expect(g.aligned).toBe(true);
    expect(s.fakeTried).toBe(true);
    expect(L.unstretch(s).stretch).toBe(10);
    expect(L.unstretch(s).fakeTried).toBe(true);
  });
  it('mode prove : AC = √41 sur la copie à toute rotation, l’aire de OAC conservée', () => {
    const p = prove();
    for (const t of [0, 30, 90, -90, 200]) {
      const g = L.gauges(L.turn(p, t));
      expect(g.seg).toBe('AC');
      expect(g.length).toMatchObject({ orig: '√41', copy: '√41', equal: true });
      expect(g.area.equal).toBe(true);
    }
    expect(L.gauges(L.turn(p, 90)).perp).toBe(true);
  });
});

describe('shape-turn — la rosace (60° direct) : chaque copie est l’image d’une copie posée', () => {
  it('refuse : la feuille étirée (la longueur nommée), la place du motif, un angle faux (mesuré), le mauvais sens', () => {
    let s = rosette();
    expect(L.canStamp(L.turn(s, 0))).toMatchObject({ reason: 'home' });
    expect(L.canStamp(L.turn(s, 360))).toMatchObject({ reason: 'home' });
    expect(L.canStamp(L.stretchTo(L.turn(s, 60), 13))).toMatchObject({ reason: 'stretch', seg: 'AB', orig: '3', copy: '3,9' });
    expect(L.canStamp(L.turn(s, 75))).toMatchObject({ reason: 'angle', measured: 75 });
    expect(L.canStamp(L.turn(s, 45))).toMatchObject({ reason: 'angle', measured: 45 });
    expect(L.canStamp(L.turn(s, -60))).toMatchObject({ reason: 'sense', measured: 60 });
    s = L.stamp(L.turn(s, 60));
    expect(s.stamps).toHaveLength(1);
    expect(L.canStamp(L.turn(s, 60))).toMatchObject({ reason: 'twice' });
    expect(L.canStamp(L.turn(s, 420 - 360))).toMatchObject({ reason: 'twice' });
  });
  it('la rosace se complète de proche en proche (60, 120, …, 300 — ou −60 une fois 240 posé) ; la découverte veut AUSSI le faux mors', () => {
    let s = rosette();
    for (const t of [60, 120, 180, 240]) s = L.stamp(L.turn(s, t));
    expect(L.rosetteDone(s)).toBe(false);
    s = L.stamp(L.turn(s, -60)); // 300° = l'image de la copie à 240°
    expect(s.stamps.map((x) => x.at)).toEqual([60, 120, 180, 240, 300]);
    expect(L.rosetteDone(s)).toBe(true);
    expect(L.discoveryReady(s)).toBe(false);
    s = L.unstretch(L.stretchTo(s, 14));
    expect(L.discoveryReady(s)).toBe(true);
  });
  it('balayage : de 0 à 360, seules les multiples de 60 s’impriment (dans l’ordre)', () => {
    let s = rosette();
    for (let t = 1; t < 360; t += 1) {
      const ok = L.canStamp(L.turn(s, t)) === true;
      expect(ok, `θ = ${t}`).toBe(t === 60);
    }
    s = L.stamp(L.turn(s, 60));
    const okAfter = [];
    for (let t = 1; t < 360; t += 1) if (L.canStamp(L.turn(s, t)) === true) okAfter.push(t);
    expect(okAfter).toEqual([120]);
  });
  it('les affirmations de la rosace (ouvertes la rosace faite) : une carte qui prouve autre chose est refusée en le disant', () => {
    let s = rosette();
    expect(L.claimsOf(s).map((c) => c.id)).toEqual(['len', 'par', 'area']);
    expect(L.judgeClaim(s, 'len', 'atwal')).toMatchObject({ ok: false, reason: 'closed' });
    for (const t of [60, 120, 180, 240, 300]) s = L.stamp(L.turn(s, t));
    expect(L.judgeClaim(s, 'len', 'atwal')).toEqual({ ok: true });
    expect(L.judgeClaim(s, 'par', 'tawazi180')).toEqual({ ok: true });
    expect(L.judgeClaim(s, 'par', 'atwal')).toMatchObject({ ok: false, reason: 'card', proves: 'length', need: 'parallel' });
    expect(L.judgeClaim(s, 'area', 'masahat')).toEqual({ ok: true });
  });
});

describe('shape-turn — la طريقة p. 155 : [AC] tombe sur [BD] par (O, 90°, direct) seulement', () => {
  it('balayage de −360 à 360 : « land » à 90 et −270 (le même دوران) et nulle part ailleurs', () => {
    const p = prove();
    const lands = [];
    for (let t = -360; t <= 360; t += 1) if (L.landing(L.turn(p, t)).kind === 'land') lands.push(t);
    expect(lands).toEqual([-270, 90]);
    expect(L.landing(L.turn(p, 90))).toMatchObject({ kind: 'land', alpha: 90, direction: 'direct' });
    expect(L.landing(L.turn(p, 60))).toMatchObject({ kind: 'miss', rest: 30 });
    expect(L.landing(L.turn(p, -90))).toMatchObject({ kind: 'miss', rest: 180 });
    expect(L.landing(L.stretchTo(L.turn(p, 90), 12)).kind).toBe('stretch');
  });
  it('les deux affirmations : AC = BD par les longueurs, (AC) ⊥ (BD) par la carte des 90° (pas par les longueurs)', () => {
    let p = prove();
    expect(L.claimsOpen(p)).toBe(false);
    p = L.turn(p, 90);
    expect(p.landed).toBe(true);
    p = L.claim(p, 'perp', 'atwal');
    expect(p.claims.perp.ok).toBe(false);
    expect(p.last).toMatchObject({ kind: 'claim', ok: false, proves: 'length', need: 'perp' });
    expect(L.discoveryReady(p)).toBe(false);
    p = L.claim(L.claim(p, 'perp', 'taamud90'), 'eq', 'atwal');
    expect(L.claimsProved(p)).toBe(true);
    expect(L.discoveryReady(p)).toBe(true);
    // l'élève tourne ensuite ailleurs : ce qu'il a prouvé reste prouvé
    expect(L.discoveryReady(L.turn(p, 10))).toBe(true);
  });
});

describe('shape-turn — le centre W (تمرين 18) : à égale distance de chaque point et de son image', () => {
  it('seule l’épingle en (2 ; 4) est acceptée ; un refus nomme la paire et ses deux distances', () => {
    let p = L.openCenter(prove());
    expect(p.stage).toBe('center');
    const accepted = [];
    for (let x = 0; x <= 5; x += 1) for (let y = 0; y <= 5; y += 1) if (L.placePin(L.movePin(p, [x, y])).center) accepted.push(`${x};${y}`);
    expect(accepted).toEqual(['2;4']);
    p = L.placePin(L.movePin(p, [2, 3]));
    expect(p.last).toMatchObject({ kind: 'pin', ok: false, pair: 'P', d1: '1', d2: '5' });
    const d = L.pinDistances(L.movePin(p, [1, 4]));
    expect(d.M).toMatchObject({ d1: '1', d2: '5', equal: false });
    p = L.placePin(L.movePin(p, [2, 4]));
    expect(p.center).toMatchObject({ at: [2, 4], alpha: 90, direction: 'direct' });
    expect(L.movePin(p, [9, -3]).pin).toEqual([5, 0]);
  });
  it('les médiatrices de [MM′] et [NN′] sont confondues ; celles de [MM′] et [PP′] se coupent en W', () => {
    let p = L.openCenter(prove());
    p = L.toggleBisector(L.toggleBisector(p, 'M'), 'N');
    expect(L.bisectorMeet(p)).toMatchObject({ kind: 'same' });
    p = L.toggleBisector(p, 'N');
    p = L.toggleBisector(p, 'P');
    expect(L.bisectorMeet(p)).toMatchObject({ kind: 'point', at: [2, 4] });
    expect(L.backToTurn(p).stage).toBe('turn');
  });
});

describe('shape-turn — mise en page', () => {
  it('la scène est carrée et contient chaque copie et chaque coin de la feuille, à toute rotation', () => {
    for (const s of [rosette(), prove()]) {
      const G = L.sceneLayout(s, { size: 300 });
      expect(G.x1 - G.x0).toBeCloseTo(G.y1 - G.y0, 9);
      const sh = L.sheetRect(s);
      for (let t = 0; t < 360; t += 5) {
        const pts = [...s.carried.map((n) => L.copyPoint(s, n, t, 10)),
          ...[[sh.x0, sh.y0], [sh.x0, sh.y1], [sh.x1, sh.y0], [sh.x1, sh.y1]].map(([x, y]) => L.copyPoint({ ...s, carried: ['Z'], pts: { ...s.pts, Z: { x: { n: x * 1000, d: 1000 }, y: { n: y * 1000, d: 1000 } } } }, 'Z', t, 10))];
        for (const q of pts) {
          expect(G.X(q.x)).toBeGreaterThanOrEqual(0); expect(G.X(q.x)).toBeLessThanOrEqual(300);
          expect(G.Y(q.y)).toBeGreaterThanOrEqual(0); expect(G.Y(q.y)).toBeLessThanOrEqual(300);
        }
      }
    }
    const s = rosette();
    const G = L.sceneLayout(s, { size: 300 });
    for (let t = 0; t < 360; t += 15) {
      for (const n of ['A', 'B', 'C']) {
        const q = L.copyPoint(s, n, t, 10);
        expect(G.X(q.x)).toBeGreaterThanOrEqual(0); expect(G.X(q.x)).toBeLessThanOrEqual(300);
        expect(G.Y(q.y)).toBeGreaterThanOrEqual(0); expect(G.Y(q.y)).toBeLessThanOrEqual(300);
      }
    }
    const back = G.toWorld(G.X(1.5), G.Y(-2));
    expect(back.x).toBeCloseTo(1.5, 9); expect(back.y).toBeCloseTo(-2, 9);
  });
  it('le faux mors ne couvre aucun point nommé (boîte de 48 px + 28 px), aux deux niveaux, à 260, 300 et 560 px', () => {
    for (const s of [rosette(), prove()]) {
      const h = L.stretchHandle(s);
      for (const size of [260, 300, 560]) {
        const G = L.sceneLayout(s, { size, pad: 22 });
        const hx = G.X(h.x); const hy = G.Y(h.y);
        for (const [n, p] of Object.entries(s.pts)) {
          const px = G.X(p.x.n / p.x.d); const py = G.Y(p.y.n / p.y.d);
          const out = Math.max(Math.abs(px - hx), Math.abs(py - hy)) - 24;   // distance au bord de la boîte
          expect(out, `${s.mode} ${n} ${size}`).toBeGreaterThanOrEqual(28);
        }
        expect(G.X(h.x)).toBeGreaterThanOrEqual(24); expect(G.X(h.x)).toBeLessThanOrEqual(size - 24);
      }
    }
  });
  it('pointerTheta déroule l’angle près de la valeur courante', () => {
    const O = { x: 0, y: 0 };
    expect(L.pointerTheta(O, { x: 0, y: 1 }, 0)).toBeCloseTo(90, 9);
    expect(L.pointerTheta(O, { x: 1, y: -0.0001 }, 350)).toBeCloseTo(360, 1);
    expect(L.pointerTheta(O, { x: 0, y: -1 }, -80)).toBeCloseTo(-90, 9);
    expect(L.pointerTheta(O, { x: 1, y: 1 }, 0, -35)).toBeCloseTo(80, 9);
  });
});

describe('shape-turn — l’ouverture n’est ni un essai ni la réponse', () => {
  it('θ = 0, feuille non étirée, rien imprimé ni posé', () => {
    for (const lv of ['beginner', 'advanced']) {
      const s = L.init(LEVELS['shape-turn'][lv].numbers);
      expect(s.theta).toBe(0);
      expect(s.stretch).toBe(L.STRETCH.min);
      expect(s.trials).toHaveLength(0);
      expect(s.theta % 360).not.toBe(s.alpha);
      expect(s.landed ?? false).toBe(false);
      expect(s.stamps ?? []).toHaveLength(0);
    }
  });
});
