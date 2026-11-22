import { describe, it, expect } from 'vitest';
import * as L from './pinRails';
import { LEVELS } from '../levels';

const B = () => L.init(LEVELS['pin-rails'].beginner.numbers);
const A = () => L.init(LEVELS['pin-rails'].advanced.numbers);
const placeAll = (s) => [10, 30, 60, 70].reduce((st, y, col) => L.placePin(st, col, y), s);

describe('pin-rails — la logique exacte', () => {
  it('les tâches du niveau مبتدئ : trois boutiques de trois sortes', () => {
    const s = B();
    expect(s.tasks.map((t) => t.kind)).toEqual(['prop', 'aligned', 'bent']);
    expect(s.tasks.map((t) => t.mode)).toEqual(['plot', 'given', 'given']);
  });
  it('une punaise levée au bon prix reste ; sinon elle retombe avec le sens de l’erreur', () => {
    let s = B();
    s = L.placePin(s, 0, 15);
    expect(s.pins[0]).toBeNull();
    expect(s.last).toMatchObject({ kind: 'pin', ok: false, why: 'high', want: '10' });
    s = L.placePin(s, 0, 10);
    expect(s.pins[0]).toBeTruthy();
    expect(s.last.ok).toBe(true);
    s = L.placePin(s, 1, 25);
    expect(s.last.why).toBe('low');
    expect(L.rodOpen(s)).toBe(false);
    expect(L.rodOpen(placeAll(B()))).toBe(true);
  });
  it('la règle refuse d’être posée avant que les punaises le soient ; sur le nœud de l’autre extrémité, elles échangent', () => {
    let s = B();
    expect(L.setRodEnd(s, 0, 0)).toBe(s);
    s = placeAll(s);
    s = L.setRodEnd(L.setRodEnd(s, 0, 0), 1, 1);
    s = L.setRodEnd(s, 1, 0);
    expect(s.rod).toEqual([1, 0]);
    expect(s.rods).toHaveLength(1);
  });
  it('boutique 1 : une règle par O touche tout ; la tâche est réussie', () => {
    let s = placeAll(B());
    s = L.setRodEnd(L.setRodEnd(s, 0, 0), 1, 2);
    expect(s.last).toMatchObject({ kind: 'rod', full: true, throughO: true, count: 5, total: 5 });
    expect(L.taskDone(s)).toBe(true);
  });
  it('boutique 2 : alignée sans O — la règle par les punaises coupe l’axe à 10 et O reste dehors', () => {
    let s = L.nextTask({ ...placeAll(B()), done: { 0: true } });
    expect(L.taskOf(s).kind).toBe('aligned');
    s = L.setRodEnd(L.setRodEnd(s, 0, 0), 1, 1);
    expect(s.last).toMatchObject({ full: false, throughO: true, pinsHit: false });
    expect(L.taskDone(s)).toBe(false);
    s = L.setRodEnd(L.setRodEnd(s, 1, 4), 0, 1);
    expect(s.last).toMatchObject({ pinsHit: true, throughO: false, cuts: '10', count: 4, total: 5, gapNode: 'O', gap: '10' });
    expect(L.taskDone(s)).toBe(true);
  });
  it('boutique 3 : brisée — il faut trois poses dont une par O et une sans', () => {
    let s = L.nextTask({ ...L.nextTask({ ...placeAll(B()), done: { 0: true } }), done: { 0: true, 1: true } });
    expect(L.taskOf(s).kind).toBe('bent');
    s = L.setRodEnd(L.setRodEnd(s, 0, 0), 1, 1);
    s = L.setRodEnd(L.setRodEnd(s, 1, 2), 0, 1);
    expect(L.taskDone(s)).toBe(false);
    s = L.setRodEnd(L.setRodEnd(s, 1, 4), 0, 3);
    expect(s.trials.filter((t) => t.kind === 'rod').every((t) => !t.full)).toBe(true);
    expect(L.taskDone(s)).toBe(true);
  });
  it('la lecture : (1 ; 1,5), (7 ; 10,5), (10 ; 15) ; un autre point est refusé avec son sens', () => {
    let s = { ...A(), ti: 2 };
    s = L.placeRead(s, 1);
    expect(s.last).toMatchObject({ ok: false, why: 'below' });
    s = L.placeRead(s, 1.5);
    expect(s.last).toMatchObject({ ok: true, x: '1', y: '1,5', a: '1,5' });
    s = { ...L.nextTask(s), ti: 3 };
    s = L.placeRead(s, 11);
    expect(s.last.why).toBe('above');
    s = L.placeRead(s, 10.5);
    expect(s.last.ok).toBe(true);
    s = { ...s, ti: 4 };
    s = L.placeRead(s, 8);
    expect(s.last).toMatchObject({ axis: 'y', why: 'left' });
    s = L.placeRead(s, 10);
    expect(s.last).toMatchObject({ ok: true, x: '10', y: '15' });
  });
  it('« جرّب أعدادك » : prix a et frais b ; le verdict du cadre vient du calcul', () => {
    let s = L.setFree(B(), '3', '0');
    expect(L.taskOf(s).kind).toBe('prop');
    s = L.setFree(B(), '3', '4');
    expect(L.taskOf(s).kind).toBe('aligned');
    expect(L.setFree(B(), 'x', '0').free).toBeNull();
    s = L.toGuided(s);
    expect(s.free).toBeNull();
  });
  it('le coach montre le geste utile sans donner la réponse', () => {
    let s = B();
    expect(L.coachOf(s)).toMatchObject({ id: 'pin', target: '[data-pr-pin="0"]' });
    s = placeAll(s);
    expect(L.coachOf(s).id).toBe('rod');
    s = L.setRodEnd(L.setRodEnd(s, 0, 0), 1, 1);
    expect(L.coachOf(s).id).toBe('next');
    expect(L.coachOf(L.setFree(B(), '3', '0'))).toBeNull();
  });
  it('la découverte s’ouvre quand les trois boutiques sont jugées', () => {
    let s = B();
    expect(L.discoveryReady(s)).toBe(false);
    s = { ...s, done: { 0: true, 1: true, 2: true } };
    expect(L.discoveryReady(s)).toBe(true);
  });
});
