import { describe, it, expect } from 'vitest';
import * as L from './componentSteps';
import { LEVELS } from '../levels';

/**
 * component-steps — l'appli de livraison, sur les nombres des deux niveaux (levels.js) : le quartier de la
 * plateforme et le نشاط 1 du manuel (p. 140 : A(−2 ; 4), C(6 ; 4), B(6 ; 2), D(3 ; −2)). On vérifie ce que l'élève
 * RENCONTRE : les compteurs qui suivent chaque pas, ce qui est refusé et pourquoi, et quand la découverte s'ouvre.
 */
const city = () => L.init(LEVELS['component-steps'].beginner.numbers);
const act1 = () => L.init(LEVELS['component-steps'].advanced.numbers);
const code = (lab, x, y) => L.setCode(L.setCode(lab, 0, x), 1, y);
const deliverAll = (lab0) => {
  let lab = lab0;
  lab.orders.forEach((o, i) => {
    lab = L.goTo(lab, i);
    if (o.kind === 'walk' || o.kind === 'walkCode') {
      lab = L.walkTo(lab, L.at(lab, o.to));
      if (o.kind === 'walkCode') lab = L.sendCode(code(lab, ...L.expectedOf(lab, o)));
    } else if (o.kind === 'code') lab = L.sendCode(code(lab, ...L.expectedOf(lab, o)));
    else lab = L.dropPin(lab, L.targetOf(lab, o));
  });
  return lab;
};

describe('classify — ce qui cloche dans un code', () => {
  const from = [6, 2]; const u = [-3, -4]; const to = [3, -2];
  it('nomme l’erreur', () => {
    expect(L.classify([-3, -4], u, from, to)).toBe('equal');
    expect(L.classify([3, 4], u, from, to)).toBe('reverse');
    expect(L.classify([3, -4], u, from, to)).toBe('sign');
    expect(L.classify([-4, -3], u, from, to)).toBe('swap');
    expect(L.classify([3, -2], u, from, to)).toBe('coords');
    expect(L.classify([0, 0], u, from, to)).toBe('zero');
    expect(L.classify([1, 1], u, from, to)).toBe('other');
  });
  it('depuis le dépôt O, l’adresse EST le code (jamais « coords »)', () => {
    expect(L.classify([-3, 2], [-3, 2], [0, 0], [-3, 2])).toBe('equal');
    expect(L.classify([2, -3], [-3, 2], [0, 0], [-3, 2])).toBe('swap');
  });
});

describe('مبتدئ — conduire, puis écrire le code', () => {
  it('chaque pas change un compteur de ±1 ; l’arrivée livre la commande 1 avec (3 ; 2)', () => {
    let lab = city();
    expect(L.counters(lab)).toEqual([0, 0]);
    lab = L.step(lab, 1, 0);
    expect(L.counters(lab)).toEqual([1, 0]);
    lab = L.step(lab, -1, 0);
    lab = L.step(lab, -1, 0); // le bord : x = −4 est la dernière rue
    expect(lab.last.kind).toBe('edge');
    expect(L.counters(lab)).toEqual([0, 0]);
    lab = L.step(lab, 0, 1); lab = L.step(lab, 0, 1);
    expect(L.counters(lab)).toEqual([0, 2]);
    lab = L.walkTo(lab, [-1, -1]);
    expect(L.counters(lab)).toEqual([3, 2]);
    expect(L.orderDone(lab, 0)).toBe(true);
    expect(lab.last).toMatchObject({ order: '1', ok: true, v: [3, 2] });
  });
  it('n’importe quel chemin dans les rues donne les mêmes compteurs (le trajet net)', () => {
    let a = L.walkTo(city(), [-1, -1]);
    let b = city();
    for (const [dx, dy] of [[0, 1], [0, 1], [1, 0], [1, 0], [1, 0]]) b = L.step(b, dx, dy);
    expect(L.counters(a)).toEqual(L.counters(b));
    a = L.rideTo(city(), [-2, -2]);
    expect(a.last.kind).toBe('street'); // un toucher ne traverse pas les blocs
  });
  it('commande 2 : C → D a le MÊME code (3 ; 2) que A → B ; l’adresse de D (4 ; 3) est refusée', () => {
    let lab = L.goTo(city(), 1);
    lab = L.sendCode(code(lab, 4, 3));
    expect(lab.last).toMatchObject({ ok: false, reason: 'coords' });
    expect(lab.last.lands).toEqual([5, 4]);
    lab = L.sendCode(code(lab, 3, 2));
    expect(lab.last).toMatchObject({ ok: true });
    expect(L.expectedOf(lab, lab.orders[0])).toEqual(L.expectedOf(lab, lab.orders[1]));
  });
  it('commande 3 : vers la gauche et le bas, (2 ; 3) sans signes et (−3 ; −2) échangé sont refusés', () => {
    let lab = L.goTo(city(), 2);
    lab = L.sendCode(code(lab, 2, 3));
    expect(lab.last.reason).toBe('reverse');
    lab = L.sendCode(code(lab, 2, -3));
    expect(lab.last.reason).toBe('sign');
    lab = L.sendCode(code(lab, -3, -2));
    expect(lab.last.reason).toBe('swap');
    lab = L.sendCode(code(lab, -2, -3));
    expect(lab.last.ok).toBe(true);
  });
  it('commande 4 : depuis le dépôt O, le code de M est son adresse (−3 ; 2)', () => {
    const lab = L.sendCode(code(L.goTo(city(), 3), -3, 2));
    expect(lab.last.ok).toBe(true);
    expect(L.expectedOf(lab, lab.orders[3])).toEqual(lab.points.M);
  });
  it('commande 5 : le pin de u(3 ; −2) depuis P(−4 ; 4) va en Q(−1 ; 2) ; le pin posé sur (3 ; −2) est l’adresse', () => {
    let lab = L.goTo(city(), 4);
    lab = L.dropPin(lab, [3, -2]);
    expect(lab.last.reason).toBe('coords');
    lab = L.dropPin(lab, [-1, 6]); // (−1 ; 6) : le signe oublié sortirait du quartier — le pin ne s'y pose pas
    expect(lab.last.reason).toBe('coords');
    lab = L.dropPin(lab, [2, -2]); // (6 ; −6) depuis P : autre
    expect(lab.last.reason).toBe('other');
    lab = L.dropPin(lab, [-1, 2]);
    expect(lab.last.ok).toBe(true);
    expect(L.targetOf(lab, lab.orders[4])).toEqual(lab.points.Q);
  });
  it('la découverte s’ouvre seulement quand les cinq commandes sont livrées', () => {
    expect(L.discoveryReady(city())).toBe(false);
    const lab = deliverAll(city());
    expect(L.discoveryReady(lab)).toBe(true);
    expect(L.summaryOf(lab).orders.map((o) => o.u)).toEqual([[3, 2], [3, 2], [-2, -3], [-3, 2], [3, -2]]);
  });
});

describe('متقدم — le نشاط 1 du manuel', () => {
  it('A → B se conduit sans compteurs, puis le code s’écrit : (8 ; −2) ; (8 ; 2) refusé (signe), (−2 ; 8) (échange)', () => {
    let lab = act1();
    expect(lab.live).toBe(false);
    lab = L.sendCode(code(lab, 8, -2));
    expect(lab.last.kind).toBe('notArrived');
    lab = L.walkTo(lab, [6, 2]);
    expect(L.stateOf(lab).arrived).toBe(true);
    expect(L.orderDone(lab, 0)).toBe(false);
    lab = L.sendCode(code(lab, 8, 2));
    expect(lab.last.reason).toBe('sign');
    lab = L.sendCode(code(lab, -2, 8));
    expect(lab.last.reason).toBe('swap');
    lab = L.sendCode(code(lab, 6, 2));
    expect(lab.last.reason).toBe('coords'); // l'adresse de B
    lab = L.sendCode(code(lab, 8, -2));
    expect(lab.last.ok).toBe(true);
  });
  it('B → D (D hors figure) : (−3 ; −4) ; OA et OD : les adresses (−2 ; 4) et (3 ; −2) ; u(3 ; −4) depuis A mène en (1 ; 0)', () => {
    const lab = act1();
    expect(L.expectedOf(lab, lab.orders[1])).toEqual([-3, -4]);
    expect(L.expectedOf(lab, lab.orders[2])).toEqual([-2, 4]);
    expect(L.expectedOf(lab, lab.orders[3])).toEqual([3, -2]);
    expect(L.targetOf(lab, lab.orders[4])).toEqual([1, 0]);
    expect(L.discoveryReady(deliverAll(lab))).toBe(true);
  });
  it('un code qui sort du quartier est dit « outside »', () => {
    const lab = L.sendCode(code(L.goTo(act1(), 1), 9, 9));
    expect(lab.last.reason).toBe('outside');
  });
});

describe('layout — une maille carrée (معلم متجانس), le quartier dans la scène', () => {
  it('toPx / fromPx sont inverses, y vers le haut', () => {
    const lab = act1();
    for (const [w, h] of [[300, 260], [640, 480], [260, 230]]) {
      const g = L.layout(lab, { width: w, height: h });
      const [x0, x1, y0, y1] = lab.grid;
      const a = g.toPx([x0, y1]); const b = g.toPx([x1, y0]);
      expect(a[0]).toBeGreaterThanOrEqual(0); expect(a[1]).toBeGreaterThanOrEqual(0);
      expect(b[0]).toBeLessThanOrEqual(w); expect(b[1]).toBeLessThanOrEqual(h);
      const p = g.fromPx(...g.toPx([3, -2]));
      expect(p[0]).toBeCloseTo(3); expect(p[1]).toBeCloseTo(-2);
      expect(g.toPx([0, 1])[1]).toBeLessThan(g.toPx([0, 0])[1]);
    }
    expect(L.nodeNear(lab, 2.4, -7)).toEqual([2, -3]);
  });
});
