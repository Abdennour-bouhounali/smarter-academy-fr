import { describe, it, expect } from 'vitest';
import * as RT from '@smarter-academy/core/arithmetic/rotation.js';
import * as L from './rotationDial';
import { LEVELS } from '../levels';

/**
 * rotation-dial — la logique de la grande roue et de la feuille, sur les nombres de levels.js (la roue à six nacelles ;
 * le نشاط 2 à 70°, le نشاط 3 à 72°). Chaque verdict vient de rotation.imageCheck ; ici on vérifie ce que l'élève
 * RENCONTRE : quelle condition manque, ce qui s'aimante, ce qui ouvre la découverte.
 */
const wheel = () => L.init(LEVELS['rotation-dial'].beginner.numbers);
const plane = () => L.init(LEVELS['rotation-dial'].advanced.numbers);
const node = (lab, ring, deg) => L.nodes(lab).find((n) => n.ring === ring && Math.abs(n.deg - deg) < 1e-9);

describe('judge — laquelle des trois conditions manque', () => {
  const P = { x: 3, y: 0 };
  it('accepte la seule image juste, dans les deux sens demandés', () => {
    expect(L.judge(P, L.polar(3, 60), 60, 'direct').kind).toBe('ok');
    expect(L.judge(P, L.polar(3, -60), 60, 'indirect').kind).toBe('ok');
  });
  it('le jumeau horaire : même rayon, même mesure, sens contraire', () => {
    const v = L.judge(P, L.polar(3, -60), 60, 'direct');
    expect(v).toMatchObject({ ok: false, kind: 'sense', length: true, angle: true, sense: false, measured: 60, measuredDir: 'indirect' });
  });
  it('la bonne direction au mauvais rayon ; le bon rayon à la mauvaise mesure ; ni l’un ni l’autre', () => {
    expect(L.judge(P, L.polar(1.8, 60), 60, 'direct').kind).toBe('radius');
    const a = L.judge(P, L.polar(3, 90), 60, 'direct');
    expect(a).toMatchObject({ kind: 'angle', measured: 90 });
    expect(L.judge(P, L.polar(1.8, 150), 60, 'direct').kind).toBe('both');
  });
  it('rien n’a tourné ; l’image posée au centre', () => {
    expect(L.judge(P, P, 60, 'direct').kind).toBe('zero');
    expect(L.judge(P, { x: 0, y: 0 }, 60, 'direct').kind).toBe('center');
  });
  it('la lecture vivante : rayons, mesure entière, sens', () => {
    const r = L.reading(P, L.polar(3, 120));
    expect(r.measured).toBe(120); expect(r.dir).toBe('direct');
    expect(L.reading(P, L.polar(3, -45)).dir).toBe('indirect');
    expect(L.fmt(Math.sqrt(10))).toBe('3,16');
  });
});

describe('la roue (مبتدئ) — quatre tâches en jumeaux', () => {
  it('six nacelles à 60° d’écart, 12 rayons × 2 anneaux de nœuds', () => {
    const lab = wheel();
    expect(lab.names).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    expect(L.nodes(lab)).toHaveLength(24);
    expect(lab.tasks.map((t) => [t.from, t.alpha, t.direction])).toEqual([['A', 60, 'direct'], ['A', 60, 'indirect'], ['C', 120, 'direct'], ['C', 120, 'indirect']]);
    expect(L.gondolaAt(lab, node(lab, 'rim', 60))).toBe('B');
    expect(L.gondolaAt(lab, node(lab, 'rim', 30))).toBeNull();
  });
  it('chaque tâche a UNE place juste, une nacelle (vérifiée par rotateApprox)', () => {
    const lab = wheel();
    const lands = lab.tasks.map((t) => {
      const img = RT.rotateApprox(L.gondolaPoint(lab, t.from), { x: 0, y: 0 }, t.alpha, t.direction);
      const ok = L.nodes(lab).filter((n) => L.judge(L.gondolaPoint(lab, t.from), n, t.alpha, t.direction).ok);
      expect(ok, t.id).toHaveLength(1);
      expect(ok[0].x).toBeCloseTo(img.x, 9); expect(ok[0].y).toBeCloseTo(img.y, 9);
      return L.gondolaAt(lab, ok[0]);
    });
    // A ↦ B (60° direct), A ↦ F (60° indirect), C ↦ E (120° direct), C ↦ A (120° indirect)
    expect(lands).toEqual(['B', 'F', 'E', 'A']);
  });
  it('un refus nomme la condition et garde la tâche ; une réussite ouvre la tâche suivante', () => {
    let lab = wheel();
    lab = L.placeWheel(lab, node(lab, 'rim', 300)); // le jumeau horaire
    expect(lab.last).toMatchObject({ ok: false, kind: 'sense', landsOn: 'F' });
    expect(lab.t).toBe(0);
    lab = L.placeWheel(lab, node(lab, 'inner', 60));
    expect(lab.last.kind).toBe('radius');
    lab = L.placeWheel(lab, node(lab, 'rim', 90));
    expect(lab.last).toMatchObject({ kind: 'angle', measured: 90 });
    lab = L.placeWheel(lab, node(lab, 'rim', 60));
    expect(lab.last).toMatchObject({ ok: true, landsOn: 'B' });
    expect(lab.t).toBe(1);
    expect(L.discoveryReady(lab)).toBe(false);
    expect(L.refusedKinds(lab).sort()).toEqual(['angle', 'radius', 'sense']);
  });
  it('la découverte s’ouvre quand les quatre tâches sont faites (les deux sens de 60° et de 120°)', () => {
    let lab = wheel();
    for (const deg of [60, 300, 240, 0]) lab = L.placeWheel(lab, node(lab, 'rim', deg));
    expect(L.discoveryReady(lab)).toBe(true);
    expect(L.summaryOf(lab).tasks.every((t) => t.done)).toBe(true);
    expect(L.evidenceOf(lab)).toMatchObject({ scene: 'wheel', from: 'C', ok: true, landsOn: 'A' });
  });
  it('le clavier parcourt un anneau rayon par rayon', () => {
    const lab = wheel();
    expect(L.nodeAt(lab, 'rim', 13).deg).toBe(30);
    expect(L.nodeAt(lab, 'inner', -1).deg).toBe(330);
  });
});

describe('la feuille (متقدم) — compas, منقلة, dépôt', () => {
  it('le compas s’aimante sur OP, la منقلة se lit au degré depuis [OP)', () => {
    let lab = plane();
    expect(L.current(lab)).toBe('A');
    lab = L.setRadius(lab, 3.2);
    expect(lab.radius).toBeCloseTo(Math.sqrt(10), 12);
    lab = L.setRay(lab, 70.4);
    expect(lab.ray).toBe(70);
    expect(L.setRay(lab, 200).ray).toBe(-160);
    const I = L.crossing(lab);
    expect(L.judge(L.sourcePoint(lab), I, 70, 'direct', L.TOL.plane).ok).toBe(true);
  });
  it('l’aimant attire vers SES constructions, jamais vers la réponse', () => {
    let lab = plane();
    const truth = RT.rotateApprox({ x: 3, y: 1 }, { x: 0, y: 0 }, 70);
    expect(L.snapImage(lab, { x: truth.x + 0.1, y: truth.y }).snapped).toBeNull();
    lab = L.setRay(L.setRadius(lab, 3.2), 50); // la règle à 50°
    const s = L.snapImage(lab, L.crossing(lab));
    expect(s.snapped).toBe('cross');
    expect(L.placePlane(lab, s).last).toMatchObject({ ok: false, kind: 'angle', measured: 50 });
  });
  it('le compas mal ouvert : « la bonne direction mais OA′ ≠ OA » ; la règle dans l’autre sens : « sense »', () => {
    let lab = L.setRay(L.setRadius(plane(), 2.5), 70);
    expect(L.placePlane(lab, L.crossing(lab)).last.kind).toBe('radius');
    lab = L.setRay(L.setRadius(plane(), Math.sqrt(10)), -70);
    expect(L.placePlane(lab, L.crossing(lab)).last.kind).toBe('sense');
  });
  const build = (lab) => {
    while (L.current(lab)) {
      const P = L.sourcePoint(lab); const ms = L.mission(lab);
      lab = L.setRay(L.setRadius(lab, Math.hypot(P.x, P.y)), ms.direction === 'direct' ? ms.alpha : -ms.alpha);
      lab = L.placePlane(lab, L.crossing(lab));
      expect(lab.last.ok, `${ms.id} ${lab.last.from}`).toBe(true);
    }
    return lab;
  };
  it('les trois missions : la قطعة garde sa longueur (4), la دائرة son rayon (1,5) ; puis la découverte', () => {
    let lab = plane();
    lab = build(lab);
    expect(L.missionDone(lab, 0)).toBe(true);
    expect(lab.radius).toBeNull(); // compas et منقلة refermés après la réussite
    lab = build(L.goToMission(lab, 1));
    expect(L.outcome(lab)).toMatchObject({ kind: 'segment', kept: true });
    expect(L.outcome(lab).after).toBeCloseTo(4, 9);
    expect(L.discoveryReady(lab)).toBe(false);
    lab = build(L.goToMission(lab, 2));
    expect(L.outcome(lab).after).toBeCloseTo(1.5, 9);
    expect(L.discoveryReady(lab)).toBe(true);
    expect(L.summaryOf(lab).missions.map((m) => m.done)).toEqual([true, true, true]);
  });
  it('chaque image des missions reste dans le cadre de la feuille', () => {
    const lab = plane();
    for (const ms of lab.missions) {
      for (const p of Object.values(ms.pts)) {
        const q = RT.rotateApprox(p, { x: 0, y: 0 }, ms.alpha, ms.direction);
        for (const v of [p.x, p.y, q.x, q.y]) expect(Math.abs(v), ms.id).toBeLessThan(L.BOX.plane - 0.5);
      }
    }
  });
});

describe('layout', () => {
  it('le centre O au milieu d’une scène carrée, y vers le haut, aller-retour', () => {
    const g = L.layout(wheel(), 300);
    expect(g.toPx({ x: 0, y: 0 })).toEqual([150, 150]);
    const [px, py] = g.toPx({ x: 1, y: 2 });
    expect(py).toBeLessThan(150);
    const back = g.fromPx(px, py);
    expect(back.x).toBeCloseTo(1, 9); expect(back.y).toBeCloseTo(2, 9);
  });
});

describe('rotation-dial — l’ouverture n’est ni un essai ni la réponse', () => {
  it('aucun essai, aucune image posée, aucune tâche faite', () => {
    for (const lv of ['beginner', 'advanced']) {
      const s = L.init(LEVELS['rotation-dial'][lv].numbers);
      expect(s.trials).toHaveLength(0);
      expect(s.last).toBeNull();
      expect(Object.keys(s.done ?? {})).toHaveLength(0);
      expect(Object.keys(s.images ?? {}).every((id) => Object.keys(s.images[id]).length === 0)).toBe(true);
    }
  });
});
