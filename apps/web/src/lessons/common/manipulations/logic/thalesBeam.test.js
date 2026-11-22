import { describe, it, expect } from 'vitest';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import * as L from './thalesBeam';
import { LEVELS } from '../levels';

const { fracText, toNumber } = LIN;
const BEG = LEVELS['thales-beam'].beginner.numbers;
const ADV = LEVELS['thales-beam'].advanced.numbers;

describe('thales-beam — le faisceau (نشاط 1, p. 104)', () => {
  it('les niveaux de levels.js : مبتدئ graduations entières, متقدم au dixième avec la chambre noire', () => {
    const b = L.init(BEG);
    expect(fracText(b.step)).toBe('1');
    expect([b.iMin, b.iMax]).toEqual([1, 4]);
    expect(b.butterfly).toBe(false);
    const a = L.init(ADV);
    expect(fracText(a.step)).toBe('1/10');
    expect([a.iMin, a.iMax, a.iTarget]).toEqual([-60, 60, 32]);
    expect(a.i).not.toBe(a.iTarget); // la page ne tient jamais la réponse
  });

  it('cas 1 du manuel : AB′ = 3,2 ⇒ AC′ = 56/15 et B′C′ = 244/75, les trois rapports valent 8/15', () => {
    const s = L.setPosition(L.init(ADV), 32);
    const r = L.reading(s);
    expect(fracText(r.ACp)).toBe('56/15');
    expect(fracText(r.BCp)).toBe('244/75');
    expect(fracText(r.k)).toBe('8/15');
    expect(r.equal).toBe(true);
    expect(r.kind).toBe('reduction');
    const tx = L.readingTex(s);
    expect(tx.AB.tex).toBe('\\dfrac{3{,}2}{6}');
    expect(tx.AC.tex).toBe('\\approx \\dfrac{3{,}73}{7}');
    expect(tx.BC.tex).toBe('\\approx \\dfrac{3{,}25}{6{,}1}');
  });

  it('la chambre noire (وضعية الفراشة) : de l’autre côté de A les rapports restent égaux', () => {
    const s = L.setPosition(L.init(ADV), -30);
    const r = L.reading(s);
    expect(r.butterfly).toBe(true);
    expect(fracText(r.k)).toBe('1/2');
    expect(fracText(r.ACp)).toBe('7/2');
    expect(fracText(r.BCp)).toBe('61/20');
    expect(r.equal).toBe(true);
  });

  it('l’écran sur A n’a pas de triangle : l’enregistrement est refusé', () => {
    const s = L.record(L.setPosition(L.init(ADV), 0));
    expect(s.last.kind).toBe('atA');
    expect(s.pending).toBe(null);
  });

  it('RÉSISTANCE : incliner l’écran sépare les rapports, et la logique nomme celui qui diffère', () => {
    let s = L.setPosition(L.init(BEG), 2);
    s = L.setTilt(s, 1);
    const r = L.reading(s);
    expect(r.parallel).toBe(false);
    expect(r.equal).toBe(false);
    expect(fracText(r.rB)).toBe('1/2');
    expect(fracText(r.rC)).toBe('3/5'); // 2,5 + 0,5 = 3 sur 5
    expect(r.differs).toContain('AC');
    expect(r.differs).toContain('BC');
    s = L.setTilt(s, 0);
    expect(s.last.kind).toBe('parallelAgain');
    expect(L.reading(s).equal).toBe(true);
  });

  it('balayage : parallèle ⇔ les trois rapports égaux, à toutes les positions et inclinaisons des deux niveaux', () => {
    for (const nb of [BEG, ADV]) {
      const s0 = L.init(nb);
      for (let i = s0.iMin; i <= s0.iMax; i++) {
        if (i === 0) continue;
        const s = L.setPosition(s0, i);
        const tr = L.tiltRange(s);
        for (let t = tr.min; t <= tr.max; t++) {
          const r = L.reading(s, i, t);
          expect(r.equal, `${i} ${t}`).toBe(t === 0);
          expect(toNumber(r.ACp)).toBeGreaterThan(0);
          if (t === 0) expect(fracText(r.rBC)).toBe(fracText(r.k));
        }
      }
    }
  });

  it('l’élève JUGE l’égalité : un jugement faux est gardé avec le verdict exact (non bloquant)', () => {
    let s = L.record(L.setPosition(L.init(BEG), 2));
    expect(s.pending).toEqual({ i: 2, t: 0 });
    s = L.claim(s, 'unequal');
    expect(s.last.kind).toBe('claimWrong');
    expect(s.stops[0]).toMatchObject({ i: 2, parallel: true, equal: true, ok: false });
    // le même arrêt deux fois ne compte pas deux fois
    s = L.record(s);
    expect(s.last.kind).toBe('dup');
  });

  it('CONTRASTE : la découverte demande deux arrêts parallèles ET un arrêt incliné (مبتدئ)', () => {
    let s = L.init(BEG);
    const stop = (st, i, t, says) => L.claim(L.record(L.setTilt(L.setPosition(st, i), t)), says);
    s = stop(s, 1, 0, 'equal');
    s = stop(s, 3, 0, 'equal');
    expect(L.discoveryReady(s)).toBe(false);
    s = stop(s, 3, 2, 'unequal');
    expect(L.discoveryReady(s)).toBe(true);
  });

  it('متقدم : il faut aussi l’arrêt du manuel (3,2) et un arrêt dans la chambre noire', () => {
    let s = L.init(ADV);
    const stop = (st, i, t, says) => L.claim(L.record(L.setTilt(L.setPosition(st, i), t)), says);
    s = stop(s, 45, 0, 'equal');
    s = stop(s, 20, 0, 'equal');
    s = stop(s, 20, 1, 'unequal');
    expect(L.discoveryReady(s)).toBe(false);
    s = stop(s, 32, 0, 'equal');
    expect(L.discoveryReady(s)).toBe(false);
    s = stop(s, -30, 0, 'equal');
    expect(L.discoveryReady(s)).toBe(true);
    const w = L.witnesses(s);
    expect(w.par.i).toBe(32);
    const d = L.differenceWitness(s, w.par);
    expect(d.same).toBe(false); // 6 − 3,2 ≠ 7 − 56/15
    expect(L.evidenceOf(s, w.par)).toMatchObject({ k: '8/15', ACexact: '56/15' });
  });

  it('géométrie : la poignée retrouve la position sous le doigt, sur toute la règle', () => {
    for (const nb of [BEG, ADV]) {
      const s0 = L.init(nb);
      const lay = L.layout(s0, { width: 320, maxHeight: 260 });
      for (let i = s0.iMin; i <= s0.iMax; i++) {
        const p = lay.px(lay.R.onD(toNumber(L.bOf(s0, i))));
        expect(Math.round(L.iFromPoint(s0, lay, p))).toBe(i);
        expect(p[0]).toBeGreaterThanOrEqual(0);
        expect(p[0]).toBeLessThanOrEqual(lay.W);
      }
      // C′ incliné au maximum reste dans le dessin
      const s = L.setTilt(L.setPosition(s0, s0.iMax), L.TILT_MAX);
      const q = lay.px(lay.R.onDp(toNumber(L.cOf(s))));
      expect(q[0]).toBeLessThanOrEqual(lay.W);
      expect(Math.round(L.tFromPoint(s, lay, q))).toBe(L.TILT_MAX);
    }
  });

  it('un contenu défectueux lève une erreur (pas un triangle, AB hors graduation)', () => {
    expect(() => L.init({ AB: 1, AC: 2, BC: 5 })).toThrow();
    expect(() => L.init({ AB: 4, AC: 5, BC: 3, mode: 'mirror' })).toThrow();
    expect(() => L.init({ AB: 6, AC: 7, BC: 6.1, ABp: 7 })).toThrow();
  });
});

describe('thales-beam — the opening screen is a real position, never the textbook target, never a stop', () => {
  it('on every authored level', () => {
    for (const lv of Object.values(LEVELS['thales-beam'])) {
      const s = L.init(lv.numbers);
      expect(s.i).not.toBe(s.iTarget);
      expect(s.i).not.toBe(0);
      expect(s.t).toBe(0);
      expect(s.stops).toHaveLength(0);
      expect(s.pending).toBeNull();
    }
  });
});
