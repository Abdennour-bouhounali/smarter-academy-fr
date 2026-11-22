import { describe, it, expect } from 'vitest';
import * as L from './waxCells';

const build = (s, n) => { for (let i = 0; i < n; i += 1) s = L.snap(s); return s; };

describe('wax-cells — le dessin est le décompte (exhaustif)', () => {
  it('un rang de n hexagones qui partagent une tige : 5n + 1 pour n = 1…8 (décompte d’ARÊTES, pas la formule)', () => {
    for (let n = 1; n <= 8; n += 1) expect(L.rodsOfRow(n), `n=${n}`).toBe(5 * n + 1);
    expect(L.rodsOfRow(0)).toBe(0);
  });
  it('une bande de deux rangs décalés : 8n + 3 pour n = 1…8', () => {
    for (let n = 1; n <= 8; n += 1) expect(L.rodsOfRow(n, true), `n=${n}`).toBe(8 * n + 3);
  });
  it('les tiges partagées : un rang de n compte n − 1 tiges portées par deux cellules', () => {
    for (let n = 1; n <= 8; n += 1) expect(L.rodsOf(L.centersFor(n)).shared.length).toBe(n - 1);
  });
  it('un rang de n cellules ET une bande de m colonnes (deux lettres) : (5n + 1) + (8m + 3)', () => {
    for (let n = 1; n <= 8; n += 1) for (let m = 1; m <= 6; m += 1) expect(L.rodsOfBoth(n, m)).toBe(5 * n + 1 + 8 * m + 3);
    expect(L.rodsOfBoth(6, 4)).toBe(66);
  });
});

describe('wax-cells — niveaux et tâches', () => {
  it('les valeurs du plan : 6, 11, 16 puis 201 pour 40 cellules ; 11, 19, 27', () => {
    expect([1, 2, 3].map((n) => L.rodsOfRow(n))).toEqual([6, 11, 16]);
    expect(L.farValue(L.buildTask(L.PRESETS.beginner.tasks[2]))).toBe(201);
    expect([1, 2, 3].map((n) => L.rodsOfRow(n, true))).toEqual([11, 19, 27]);
    expect(L.farValue(L.buildTask(L.PRESETS.advanced.tasks[2]))).toBe(66);
  });
  it('refuse un n hors du cadre', () => {
    expect(() => L.buildTask({ kind: 'build', targets: [9] })).toThrow();
    expect(() => L.buildTask({ kind: 'rule', strip: true, targets: [7] })).toThrow();
  });
});

describe('wax-cells — مبتدئ : construire, écrire la règle, la valeur lointaine', () => {
  it('w1 se résout en visitant 1, 2, 3', () => {
    let s = L.init(L.PRESETS.beginner);
    s = L.snap(s); expect(L.drawn(s)).toBe(6); expect(L.taskDone(s)).toBe(false);
    s = L.snap(s); expect(L.drawn(s)).toBe(11);
    s = L.snap(s); expect(L.drawn(s)).toBe(16); expect(L.taskDone(s)).toBe(true);
    expect(L.canNext(s)).toBe(true);
  });
  it('lift retire la dernière cellule ; le cadre est limité à 8', () => {
    let s = L.init({ tasks: [{ id: 'z', kind: 'rule', targets: [1] }] });
    s = build(s, 12);
    expect(s.w.n).toBe(8); expect(L.full(s)).toBe(true);
    s = L.lift(s); expect(s.w.n).toBe(7);
  });
  it('w2 : 5n + 1 et ses écritures égales sont acceptées ; 6n, 5n, 5n + 6 sont refusées AVEC leur modèle', () => {
    const open = () => { let s = L.init(L.PRESETS.beginner); s = build(s, 3); s = L.nextTask(s); return build(s, 4); };
    const ok = (txt) => { const s = L.writeRule(open(), txt); return [L.taskDone(s), s.flag.model]; };
    expect(ok('5n+1')).toEqual([true, 'right']);
    expect(ok('1 + 5 × n')[0]).toBe(true);
    expect(ok('6+5(n-1)')[0]).toBe(true);
    expect(ok('6n')).toEqual([false, 'perCell']);
    expect(ok('5n')).toEqual([false, 'noFirst']);
    expect(ok('5n+6')).toEqual([false, 'plusSix']);
    expect(ok('4n+2')[1]).toBe('other');
    const bad = L.writeRule(open(), '6n');
    expect(bad.flag.column).toBe(2);               // 6n = 12 ≠ 11 : première colonne qui diffère
    expect(bad.w.rodBlink).toBe('shared');
    expect(L.writeRule(open(), '5n').w.rodBlink).toBe('first');
    expect(L.writeRule(open(), 'abc').flag.unreadable).toBe(true);
  });
  it('une règle est jugée sur TOUS les n construits (une règle vraie seulement en n = 1 est refusée)', () => {
    let s = L.init({ tasks: [{ id: 'q', kind: 'rule', targets: [1, 2] }] });
    s = build(s, 2);
    expect(L.judgeColumns(s)).toEqual([1, 2, 3, 4]);
    expect(L.writeRule(s, '6').flag.ok).toBe(false);      // 6 = 6 pour n = 1 seulement
  });
  it('w3 : 5 × 40 + 1 = 201 ; une autre valeur est refusée', () => {
    let s = L.init(L.PRESETS.beginner);
    s = build(s, 3); s = L.nextTask(s); s = build(s, 4); s = L.writeRule(s, '5n+1'); s = L.nextTask(s);
    s = build(s, 4); s = L.writeRule(s, '5n+1');
    expect(s.w.phase).toBe('far');
    expect(L.taskDone(L.answerFar(s, '240'))).toBe(false);
    expect(L.taskDone(L.answerFar(s, '٢٠١'))).toBe(true);
  });
});

describe('wax-cells — متقدم : prédire avant de voir, deux lettres', () => {
  it('le compteur est caché tant que le nombre n’est pas tapé', () => {
    let s = L.init(L.PRESETS.advanced);
    s = L.snap(s);
    expect(L.counterHidden(s)).toBe(true);
    s = L.predict(s, '12'); expect(s.last.ok).toBe(false); expect(L.counterHidden(s)).toBe(true);
    s = L.predict(s, '11'); expect(s.last.ok).toBe(true); expect(L.counterHidden(s)).toBe(false);
  });
  it('a1 : prédire 11, 19, 27 puis la règle 8n + 3 (10n + 2 est refusée)', () => {
    let s = L.init(L.PRESETS.advanced);
    for (const v of ['11', '19', '27']) { s = L.snap(s); s = L.predict(s, v); }
    expect(s.w.phase).toBe('rule');
    expect(L.writeRule(s, '10n+2').flag.model).toBe('perCell');
    expect(L.writeRule(s, '8n').flag.model).toBe('noFirst');
    expect(L.taskDone(L.writeRule(s, '8n+3'))).toBe(true);
  });
  it('a2 : les deux écritures donnent le même tableau (observation, jamais « pour tout n »)', () => {
    let s = L.init({ tasks: [{ id: 'a2', kind: 'compare', targets: [1, 2, 3, 4], predict: true }] });
    s = { ...s, w: { ...s.w, phase: 'compare' } };
    s = L.compareWritings(s);
    expect(s.flag.same).toBe(true); expect(L.taskDone(s)).toBe(true);
  });
  it('a3 : 5n + 1 + 8m + 3 ; n = 6, m = 4 donne 66', () => {
    let s = L.init({ tasks: [L.PRESETS.advanced.tasks[2]] });
    expect(s.w.phase).toBe('rule');
    expect(L.writeRule(s, '5n+8m+4').flag.ok).toBe(true);
    expect(L.writeRule(s, '13n+4').flag.ok).toBe(false);
    s = L.writeRule(s, '5n+1+8m+3');
    expect(s.w.phase).toBe('far');
    expect(L.taskDone(L.answerFar(s, '66'))).toBe(true);
  });
});

describe('wax-cells — « جرّب أعدادك » n’est jamais compté', () => {
  it('une tâche libre ne fait pas avancer la progression', () => {
    let s = L.init(L.PRESETS.beginner);
    s = L.freeTask(s); s = build(s, 5); s = L.writeRule(s, '5n+1');
    expect(L.isFree(s)).toBe(true); expect(s.done).toEqual({}); expect(L.discoveryReady(s)).toBe(false);
    expect(L.toGuided(s).free).toBe(null);
  });
});
