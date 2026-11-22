import { describe, it, expect } from 'vitest';
import * as L from './courtyardDrone';
import { LEVELS } from '../levels';

const LV = LEVELS['courtyard-drone'];
const start = (tasks) => L.init({ tasks });
const fly = (s, x, y) => {
  let t = L.setActive(s, x);
  t = L.lock(t);
  t = L.setActive(t, y);
  return L.record(t);
};

describe('courtyard-drone — logique', () => {
  it('les préréglages sont valides et leurs échanges restent dans le cadre', () => {
    for (const lv of ['beginner', 'advanced']) {
      const tasks = L.normalizeTasks(LV[lv].numbers.tasks);
      expect(tasks.length).toBe(3);
      for (const tk of tasks) expect(tk.reads.length).toBeGreaterThan(0);
    }
    const b = L.normalizeTasks(LV.beginner.numbers.tasks);
    expect(b.every((tk) => tk.grain === 10)).toBe(true);
    expect(L.normalizeTasks(LV.advanced.numbers.tasks).every((tk) => tk.grain === 5)).toBe(true);
  });
  it('les tâches invalides sont refusées', () => {
    expect(() => L.normalizeTasks([{ id: 'b1', kind: 'nope', reads: [{ x: 10, y: 10 }] }])).toThrow();
    expect(() => L.normalizeTasks([{ id: 'b1', kind: 'fly', reads: [] }])).toThrow();
    expect(() => L.normalizeTasks([{ id: 'b1', kind: 'fly', reads: [{ x: 15, y: 10 }] }])).toThrow();           // pas d'une demi-case en مبتدئ
    expect(() => L.normalizeTasks([{ id: 'b1', kind: 'fly', reads: [{ x: 60, y: 10 }] }])).toThrow();           // hors du cadre
    expect(() => L.normalizeTasks([{ id: 'b1', kind: 'fly', reads: [{ x: 0, y: 0 }] }])).toThrow();            // l'origine
    expect(() => L.normalizeTasks([{ id: 'b1', kind: 'fly', reads: [{ x: 50, y: 10 }] }])).toThrow();           // l'échangé (1 ; 5) sort du cadre en y
    expect(() => L.normalizeTasks([{ id: 'b1', kind: 'fly', paper: 'glossy', reads: [{ x: 10, y: 10 }] }])).toThrow();
    expect(() => L.normalizeTasks([{ id: 'b1', kind: 'read', reads: [{ x: 10, y: 10, what: 'dragon' }] }])).toThrow();
  });
  it('le drone part du mât, sur l\'axe horizontal ; il ne roule d\'abord que sur cet axe', () => {
    let s = start(LV.beginner.numbers.tasks);
    expect(L.dronePos(s)).toEqual({ x: 0, y: 0 });
    expect(s.phase).toBe('x');
    s = L.setActive(s, 30);
    expect(L.dronePos(s)).toEqual({ x: 30, y: 0 });
    s = L.setActive(s, 400);       // butée du cadre
    expect(s.x).toBe(50);
    s = L.setActive(s, -400);
    expect(s.x).toBe(-50);
    s = L.setActive(s, 14);        // pas d'une case
    expect(s.x).toBe(10);
  });
  it('le drone REFUSE la diagonale : une touche de l\'autre axe ne déplace rien', () => {
    let s = start(LV.beginner.numbers.tasks);
    s = L.setActive(s, 30);
    const before = L.dronePos(s);
    const r = L.move(s, 'y', 1);
    expect(L.dronePos(r)).toEqual(before);
    expect(r.last).toMatchObject({ kind: 'refuse', axis: 'y', phase: 'x' });
    expect(r.refusals).toBe(1);
    const locked = L.lock(s);
    const r2 = L.move(locked, 'x', 1);
    expect(L.dronePos(r2)).toEqual(L.dronePos(locked));
    expect(r2.last).toMatchObject({ kind: 'refuse', axis: 'x', phase: 'y' });
    expect(L.move(s, 'x', 1).x).toBe(40);
  });
  it('« ثبّت » ouvre la phase verticale ; « عُد » la ferme sans garder l\'ordonnée ; la photo n\'est possible qu\'en phase y', () => {
    let s = start(LV.beginner.numbers.tasks);
    expect(L.record(L.setActive(s, 30))).toEqual(L.setActive(s, 30));   // en phase x : rien
    s = L.lock(L.setActive(s, 30));
    expect(s.phase).toBe('y');
    s = L.setActive(s, -20);
    expect(L.dronePos(s)).toEqual({ x: 30, y: -20 });
    s = L.unlock(s);
    expect(s.phase).toBe('x');
    expect(L.dronePos(s)).toEqual({ x: 30, y: 0 });
    const t = L.setActive(L.lock(s), 500);
    expect(t.y).toBe(40);
  });
  it('b1 : (3 ; −2) juste ; les nombres échangés mènent à (−2 ; 3), un AUTRE lieu', () => {
    const s0 = start(LV.beginner.numbers.tasks);
    const right = fly(s0, 30, -20);
    expect(right.last).toMatchObject({ ok: true, model: 'right' });
    expect(right.ri).toBe(1);
    expect(right.phase).toBe('x');            // le drone est retourné au mât
    expect(L.dronePos(right)).toEqual({ x: 0, y: 0 });
    const swap = fly(s0, -20, 30);
    expect(swap.last).toMatchObject({ ok: false, model: 'swap', x: -20, y: 30 });
    expect(swap.ri).toBe(0);                 // rien n'avance
    expect(L.dronePos(swap)).toEqual({ x: -20, y: 30 });
  });
  it('les modèles d\'erreur : signe, un seul nombre juste, autre', () => {
    const read = { x: 30, y: -20 };
    expect(L.judge(read, { x: -30, y: -20 }).model).toBe('signx');
    expect(L.judge(read, { x: 30, y: 20 }).model).toBe('signy');
    expect(L.judge(read, { x: -30, y: 20 }).model).toBe('signs');
    expect(L.judge(read, { x: 30, y: -30 }).model).toBe('one');
    expect(L.judge(read, { x: 10, y: 10 }).model).toBe('other');
    expect(L.judge(read, { x: 30, y: -20 })).toEqual({ ok: true, model: 'right' });
    // sur un axe : (4 ; 0) — l'échangé est (0 ; 4) ; la bonne abscisse avec une autre ordonnée = un seul nombre juste
    expect(L.judge({ x: 40, y: 0 }, { x: 0, y: 40 }).model).toBe('swap');
    expect(L.judge({ x: 40, y: 0 }, { x: 40, y: 10 }).model).toBe('one');
    expect(L.judge({ x: 40, y: 0 }, { x: -40, y: 0 }).model).toBe('signx');
    // deux nombres égaux : l'échange est le même point
    expect(L.judge({ x: 20, y: 20 }, { x: 20, y: 20 }).ok).toBe(true);
  });
  it('b2 : un point de l\'axe ne demande aucun mouvement vertical', () => {
    let s = start(LV.beginner.numbers.tasks);
    s = L.nextTask({ ...fly(fly(s, 30, -20), -40, 10), });
    expect(L.taskOf(s).id).toBe('b2');
    const r = L.record(L.lock(L.setActive(s, 40)));
    expect(r.last).toMatchObject({ ok: true });
    const r2 = L.record(L.lock(L.setActive(r, 0)));
    expect(r2.last).toMatchObject({ ok: false });    // (0 ; 0) n'est pas le robinet
    const r3 = L.record(L.setActive(L.lock(r), -30));
    expect(r3.last).toMatchObject({ ok: true });     // (0 ; −3) : aucune distance sur l'axe horizontal, puis trois cases vers le bas
  });
  it('la progression : une tâche finie est verrouillée, la suivante recommence au mât, « إعادة de la tâche » efface', () => {
    let s = start([{ id: 'b1', kind: 'fly', reads: [{ x: 30, y: -20 }] }, { id: 'b2', kind: 'fly', reads: [{ x: -40, y: 10 }] }]);
    expect(L.canNext(s)).toBe(false);
    s = fly(s, 30, -20);
    expect(L.taskDone(s)).toBe(true);
    expect(L.canNext(s)).toBe(true);
    expect(L.setActive(s, 10)).toBe(s);       // plus de geste
    s = L.nextTask(s);
    expect(L.taskOf(s).id).toBe('b2');
    expect(L.dronePos(s)).toEqual({ x: 0, y: 0 });
    expect(L.discoveryReady(s)).toBe(false);
    s = fly(s, -40, 10);
    expect(L.discoveryReady(s)).toBe(true);
    const again = L.retryTask(s);
    expect(L.taskDone(again)).toBe(false);
    expect(L.discoveryReady(again)).toBe(false);
  });
  it('متقدم : le pas est une demi-case (1,5 ; −3) puis le papier sans carreaux', () => {
    const tasks = L.normalizeTasks(LV.advanced.numbers.tasks);
    expect(tasks[1].paper).toBe('plain');
    let s = L.init({ tasks: LV.advanced.numbers.tasks });
    s = L.setActive(s, 14);
    expect(s.x).toBe(15);
    s = L.move(s, 'x', 1);
    expect(s.x).toBe(20);
    const r = fly(L.init({ tasks: LV.advanced.numbers.tasks }), 15, -30);
    expect(r.last.ok).toBe(true);
    expect(L.isAdvanced(r)).toBe(true);
  });
  it('« جرّب أعدادك » : deux nombres, jamais comptés ; hors du cadre ou illisible, rien ne change', () => {
    let s = start(LV.beginner.numbers.tasks);
    expect(L.parseCoord('−2', 50)).toBe(-20);
    expect(L.parseCoord('٣', 50)).toBe(30);
    expect(L.parseCoord('1,5', 50)).toBe(15);
    expect(L.parseCoord('6', 50)).toBeNull();
    expect(L.parseCoord('4,1', 40)).toBeNull();
    expect(L.parseCoord('x', 50)).toBeNull();
    const f = L.setFree(s, '-2', '3');
    expect(f.free).toEqual({ x: -20, y: 30 });
    expect(L.dronePos(f)).toEqual({ x: -20, y: 30 });
    expect(L.setFree(s, '9', '3')).toBe(s);
    const info = L.freeInfo(f);
    expect(info.swapped).toEqual({ x: 30, y: -20 });
    expect(info.axis).toBeNull();
    expect(L.freeInfo(L.setFree(s, '4', '0')).axis).toBe('x');
    expect(L.freeInfo(L.setFree(s, '0', '-3')).axis).toBe('y');
    expect(L.freeInfo(L.setFree(s, '2', '2')).swapSame).toBe(true);
    expect(f.trials).toEqual([]);
    expect(L.record(f)).toBe(f);
    expect(L.toGuided(f).free).toBeNull();
  });
  it('le coach suit le geste utile maintenant', () => {
    let s = start(LV.beginner.numbers.tasks);
    expect(L.coachOf(s).id).toBe('driveX');
    s = L.setActive(s, 30);
    expect(L.coachOf(s).id).toBe('lock');
    s = L.lock(s);
    expect(L.coachOf(s).id).toBe('driveY');
    s = L.setActive(s, -20);
    expect(L.coachOf(s).id).toBe('record');
    s = L.record(L.setActive(s, -30));
    expect(L.coachOf(s).id).toBe('again');
  });
});
