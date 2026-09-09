import { describe, it, expect } from 'vitest';
import {
  round2, fr, quantity, valueTable, readTable, trend,
  program, step, toPoints, readCurve, inputsReaching, maximumOf,
} from './fonctionsUtils';

const masse = quantity({
  id: 'masse',
  label: 'Masse du pain',
  unit: 'g',
  rule: (t) => 500 - 4 * t,
});

const temperature = quantity({
  id: 'temp',
  label: 'Température à cœur',
  unit: '°C',
  rule: (t) => 20 + 7 * t,
});

describe('une dépendance est une règle', () => {
  it('calcule la sortie de chaque entrée', () => {
    expect(masse.at(0)).toBe(500);
    expect(masse.at(10)).toBe(460);
    expect(temperature.at(10)).toBe(90);
  });

  /* L'INVARIANT DU MODULE 1, et la raison d'être de la leçon : c'est parce
     qu'une même entrée redonne toujours la même sortie qu'une dépendance
     mérite d'être écrite. */
  it('une même entrée redonne toujours exactement la même sortie', () => {
    for (const t of [0, 3, 7, 12, 15, 18, 20]) {
      expect(masse.at(t)).toBe(masse.at(t));
      expect(temperature.at(t)).toBe(temperature.at(t));
    }
  });

  /* Ce que la leçon SŒUR écarte et que celle-ci accueille : une dépendance
     n'est pas forcément croissante, ni proportionnelle. */
  it('accueille une dépendance décroissante', () => {
    expect(trend(masse, 0, 12)).toBe('descend');
    expect(trend(temperature, 0, 12)).toBe('monte');
  });

  it('la masse n’est pas proportionnelle à la durée', () => {
    // Doubler la durée ne double pas la masse — et c'est normal ici.
    expect(masse.at(10)).not.toBe(2 * masse.at(5));
  });
});

describe('tableau de valeurs', () => {
  const rows = valueTable(temperature, [0, 5, 10, 15]);

  it('est engendré par la règle, jamais recopié', () => {
    expect(rows).toEqual([
      { x: 0, y: 20 },
      { x: 5, y: 55 },
      { x: 10, y: 90 },
      { x: 15, y: 125 },
    ]);
  });

  it('se lit par son entrée', () => {
    expect(readTable(rows, 10)).toBe(90);
    expect(readTable(rows, 7)).toBe(null);
  });
});

describe('programme de calcul', () => {
  // « Choisis un nombre, multiplie par 3, ajoute 2. »
  const p = program([
    step('Je multiplie par 3', (n) => n * 3),
    step('J’ajoute 2', (n) => n + 2),
  ]);

  it('donne le résultat final', () => {
    expect(p.run(4)).toBe(14);
    expect(p.run(0)).toBe(2);
  });

  it('montre le déroulé, étape par étape', () => {
    expect(p.trace(4)).toEqual([
      { label: 'Je choisis un nombre', value: 4 },
      { label: 'Je multiplie par 3', value: 12 },
      { label: 'J’ajoute 2', value: 14 },
    ]);
  });

  it('engendre un tableau cohérent avec run', () => {
    for (const x of [0, 1, 2, 5, 10]) {
      const trace = p.trace(x);
      expect(trace[trace.length - 1].value).toBe(p.run(x));
    }
  });
});

describe('lecture graphique', () => {
  // Une température qui MONTE puis REDESCEND : le cas qui donne deux réponses.
  const rows = [
    { x: 0, y: 20 },
    { x: 2, y: 60 },
    { x: 4, y: 100 },
    { x: 6, y: 60 },
    { x: 8, y: 20 },
  ];

  it('lit une valeur entre deux points, comme un doigt sur la courbe', () => {
    expect(readCurve(rows, 1)).toBe(40);
    expect(readCurve(rows, 4)).toBe(100);
    expect(readCurve(rows, 5)).toBe(80);
  });

  it('ne sort jamais du cadre des données', () => {
    expect(readCurve(rows, -3)).toBe(20);
    expect(readCurve(rows, 99)).toBe(20);
  });

  /* La dissymétrie que le module 5 fait voir : une sortie peut correspondre à
     PLUSIEURS entrées, alors qu'une entrée n'a qu'une sortie. */
  it('trouve les DEUX instants où la même température est atteinte', () => {
    expect(inputsReaching(rows, 60)).toEqual([2, 6]);
    expect(inputsReaching(rows, 20)).toEqual([0, 8]);
  });

  it('trouve un seul instant pour le sommet', () => {
    expect(inputsReaching(rows, 100)).toEqual([4]);
  });

  it('donne le maximum et l’instant où il est atteint', () => {
    expect(maximumOf(rows)).toEqual({ x: 4, y: 100 });
  });

  it('transforme les couples en points du repère', () => {
    expect(toPoints([{ x: 1, y: 2 }], '#000', 'q')).toEqual([
      { id: 'q1', x: 1, y: 2, color: '#000' },
    ]);
  });
});

describe('formatage', () => {
  it('écrit à la française', () => {
    expect(fr(12.5)).toBe('12,5');
    expect(round2(0.1 + 0.2)).toBe(0.3);
  });
});
