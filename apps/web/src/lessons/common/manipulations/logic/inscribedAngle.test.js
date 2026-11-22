import { describe, it, expect } from 'vitest';
import * as L from './inscribedAngle';
import { LEVELS } from '../levels';

/**
 * inscribed-angle — la logique du lab « زاوية التسديد » sur les nombres de levels.js : le tireur sur le grand arc garde
 * SON angle (la moitié de l'angle au centre), le refus hors du cercle (plus grand dedans, plus petit dehors), l'autre arc,
 * le pari (≥ 180° refusé, le double nommé), les trois étapes du نشاط 4 (مزيان، هوارية، نقطة داخلية) et la découverte.
 */
const B = () => L.init(LEVELS['inscribed-angle'].beginner.numbers);
const A = () => L.init(LEVELS['inscribed-angle'].advanced.numbers);
const on = (t) => ({ t, rho: 1 });

describe('striker (مبتدئ) — l’angle de tir', () => {
  it('angle au centre 120°, angle de tir 60° partout sur le grand arc (balayage degré par degré)', () => {
    const s = B();
    expect(s.mode).toBe('striker');
    expect(s.central).toBe(120);
    expect(s.inscribed).toBe(60);
    // grand arc : de B (30°) à A (150°) en passant par le bas (30 + 360 = 390)
    for (let t = 150 + L.POST_GAP; t <= 390 - L.POST_GAP; t += 1) {
      const m = L.measure(s, on(t % 360));
      expect(m.arc, `${t}`).toBe('major');
      expect(m.angle, `${t}`).toBe(60);
    }
  });
  it('l’autre arc (derrière la ligne de but) : 120° = 180° − 60°', () => {
    const m = L.measure(B(), on(90));
    expect(m).toMatchObject({ position: 'on', arc: 'minor', angle: 120 });
  });
  it('dedans plus grand, dehors plus petit — refusés : ce n’est pas une زاوية محيطية', () => {
    let s = L.bet(B(), 60);
    s = L.place(s, { t: 270, rho: 0.6 });
    expect(s.last.trial).toMatchObject({ kind: 'inside', refused: true });
    expect(s.last.trial.angle).toBeGreaterThan(60);
    expect(s.last.trial.angle).toBeCloseTo((s.last.trial.far + s.last.trial.near) / 2, 6);
    s = L.place(s, { t: 270, rho: 1.3 });
    expect(s.last.trial).toMatchObject({ kind: 'outside', refused: true });
    expect(s.last.trial.angle).toBeLessThan(60);
  });
  it('l’aimant du cercle, les degrés entiers, le poteau repoussé', () => {
    const s = B();
    expect(L.legal(s, 250.4, 1.05)).toEqual({ t: 250, rho: 1 });
    expect(L.legal(s, 250, 0.83)).toEqual({ t: 250, rho: 0.85 });
    expect(L.legal(s, 152, 1).t).toBe(150 + L.POST_GAP);
    expect(L.legal(s, 2, 9).rho).toBe(L.RHO_MAX);
  });
  it('le pari : 240° (le double) et 200° refusés, 120° accepté (sera contredit), 60° accepté', () => {
    const s = B();
    expect(L.betVerdict(s, 240)).toBe('double');
    expect(L.betVerdict(s, 200)).toBe('impossible');
    expect(L.betVerdict(s, 0)).toBe('impossible');
    expect(L.betVerdict(s, 120)).toBe('equal');
    expect(L.betVerdict(s, 60)).toBe('half');
    expect(L.betVerdict(s, 45)).toBe('other');
    const refused = L.bet(s, 240);
    expect(refused.bet).toBeNull();
    expect(L.hasBet(refused)).toBe(false);
    expect(L.hasBet(L.bet(s, 120))).toBe(true);
  });
  it('le pari se fige au premier essai sur le cercle', () => {
    const s = L.place(L.bet(B(), 120), on(250));
    expect(L.canBet(s)).toBe(false);
    expect(L.bet(s, 60).bet.value).toBe(120);
  });
  it('la découverte : pari + deux positions DIFFÉRENTES du grand arc + un contraste', () => {
    let s = L.bet(B(), 60);
    s = L.place(s, on(250));
    s = L.place(s, on(255)); // trop proche : pas une seconde position
    expect(L.goalMet(s)).toBe(false);
    s = L.place(s, on(300));
    expect(L.goalMet(s)).toBe(true);
    expect(L.discoveryReady(s)).toBe(false);
    s = L.place(s, { t: 270, rho: 0.5 });
    expect(L.discoveryReady(s)).toBe(true);
  });
  it('sans pari, pas de découverte (l’angle reste caché)', () => {
    let s = L.place(B(), on(250));
    s = L.place(s, on(320));
    s = L.place(s, on(90));
    expect(L.discoveryReady(s)).toBe(false);
  });
  it('près / loin du but : même angle (réfute « plus près, plus grand »)', () => {
    let s = L.bet(B(), 60);
    s = L.place(s, on(270)); // le plus loin de la ligne de but
    s = L.place(s, on(170)); // tout près du poteau A
    const nf = L.nearFar(s);
    expect(nf).not.toBeNull();
    expect(nf.near.angle).toBe(60);
    expect(nf.far.angle).toBe(60);
    expect(nf.farDist).toBeGreaterThan(nf.nearDist);
  });
  it('evidenceOf : les essais en données plates', () => {
    const s = L.place(L.bet(B(), 60), on(250));
    expect(L.evidenceOf(s)).toMatchObject({ kind: 'major', angle: '60', central: '120', name: 'M' });
  });
});

describe('act4 (متقدم) — نشاط 4 : مزيان، هوارية، ثم نقطة داخل الدائرة', () => {
  it('angle au centre 100° ; ADB = 50° partout sur le grand arc', () => {
    const s = A();
    expect(s.mode).toBe('act4');
    expect(s.stage).toBe('mezian');
    expect(s.central).toBe(100);
    for (let t = 146; t <= 394; t += 4) expect(L.measure(s, on(t % 360)).angle, `${t}`).toBe(50);
  });
  it('مزيان : D ailleurs qu’au bout du diamètre est refusé ; l’aimant à ±3° ; les nombres du manuel', () => {
    let s = A();
    s = L.place(s, on(290));
    expect(s.last.trial.kind).toBe('notDiameter');
    expect(L.aodOf(s)).toBe(150);
    expect(L.legal(s, 318, 1).t).toBe(L.diameterT(s));
    s = L.place(s, on(318));
    expect(s.last.trial.kind).toBe('diameter');
    const n = L.mezianNumbers(s);
    expect(n).toEqual({ BAD: 40, ADB: 50, AOB: 100, AOD: 180 });
    expect(2 * n.BAD + n.AOB).toBe(180);
    expect(n.ADB + n.BAD).toBe(90);
  });
  it('مزيان : la relation choisie — « ½ » et « = » réfutés, « 2× » ouvre l’étape suivante', () => {
    let s = L.place(A(), on(320));
    expect(L.stageDone(s)).toBe(false);
    s = L.pickRelation(s, 'half');
    expect(s.last).toMatchObject({ choice: 'half', ok: false });
    expect(L.stageDone(s)).toBe(false);
    expect(L.advance(s).stage).toBe('mezian');
    s = L.pickRelation(s, 'double');
    expect(L.stageDone(s)).toBe(true);
    expect(L.advance(s).stage).toBe('houaria');
  });
  it('هوارية : trois positions, O dans l’angle ET hors de l’angle ; l’arc coloré est refusé comme but', () => {
    let s = L.advance(L.pickRelation(L.place(A(), on(320)), 'double'));
    s = L.place(s, on(90));
    expect(s.last.trial.kind).toBe('minor');
    s = L.place(s, on(270)); // D′ = 90° sur l'arc AB : O dans l'angle
    expect(s.last.trial.oInside).toBe(true);
    s = L.place(s, on(200)); // D′ = 20° hors de l'arc AB : O hors de l'angle
    expect(s.last.trial.oInside).toBe(false);
    expect(L.stageDone(s)).toBe(false);
    s = L.place(s, on(240));
    expect(L.stageDone(s)).toBe(true);
    for (const tr of L.distinctMajor(s, 'houaria')) expect(tr.angle).toBe(50);
  });
  it('نقطة داخل الدائرة : l’angle de l’exercice 12 vaut la demi-somme des deux arcs, la découverte s’ouvre', () => {
    let s = L.advance(L.pickRelation(L.place(A(), on(320)), 'double'));
    for (const t of [270, 200, 240]) s = L.place(s, on(t));
    s = L.advance(s);
    expect(s.stage).toBe('interior');
    expect(s.pos.rho).toBe(0.6);
    expect(L.discoveryReady(s)).toBe(false);
    s = L.place(s, { t: 270, rho: 0.5 });
    const tr = s.last.trial;
    expect(tr.kind).toBe('interior');
    expect(tr.far).toBe(100);
    expect(tr.angle).toBeCloseTo((tr.far + tr.near) / 2, 6);
    expect(tr.angle).toBeGreaterThan(50);
    expect(L.discoveryReady(s)).toBe(true);
  });
  it('revenir en arrière garde les essais', () => {
    let s = L.advance(L.pickRelation(L.place(A(), on(320)), 'double'));
    s = L.place(s, on(270));
    const b = L.back(s);
    expect(b.stage).toBe('mezian');
    expect(b.trials.length).toBe(s.trials.length);
    expect(b.relation).toBe('double');
  });
});

describe('degText', () => {
  it('écrit à la manière du manuel', () => {
    expect(L.degText(59.9999999)).toBe('60');
    expect(L.degText(62.5)).toBe('62,5');
    expect(L.degText(75.4321)).toBe('75,4');
  });
});

describe('inscribed-angle — l’ouverture n’est ni un essai ni la réponse', () => {
  it('le sommet part sur le grand arc, hors du diamètre de مزيان, sans essai ni pari', () => {
    for (const lv of ['beginner', 'advanced']) {
      const s = L.init(LEVELS['inscribed-angle'][lv].numbers);
      expect(s.trials).toHaveLength(0);
      expect(s.bet).toBeNull();
      expect(s.pos.rho).toBe(1);
      expect(s.pos.t).not.toBe(L.diameterT(s));
    }
  });
});
