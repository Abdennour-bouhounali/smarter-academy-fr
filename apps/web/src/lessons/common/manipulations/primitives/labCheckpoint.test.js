import { describe, it, expect } from 'vitest';
import * as C from './labCheckpoint';

const num = { id: 'read', kind: 'number', expected: '4/3', hints: ['h1', 'h2'] };
const choice = { id: 'op', kind: 'choice', options: [{ text: 'a', why: 'pourquoi a' }, { text: 'b' }, { text: 'c', correct: true }], hints: ['h1', 'h2'] };

describe('labCheckpoint — questions pendant le labo', () => {
  it('lit les nombres écrits : latins, arabes, fraction, virgule ; refuse l’illisible', () => {
    expect(C.readNumber('8')).toEqual({ n: 8n, d: 1n });
    expect(C.readNumber('٨')).toEqual({ n: 8n, d: 1n });
    expect(C.readNumber(' 4 / 3 ')).toEqual({ n: 4n, d: 3n });
    expect(C.readNumber('٤÷٣')).toEqual({ n: 4n, d: 3n });
    expect(C.readNumber('1,5')).toEqual({ n: 3n, d: 2n });
    expect(C.readNumber('abc')).toBeNull();
    expect(C.readNumber('')).toBeNull();
    expect(C.readNumber('4/0')).toBeNull();
  });

  it('juge exactement : 8/6 = 4/3 ; l’option `correct`', () => {
    expect(C.isCorrect(num, '8/6')).toBe(true);
    expect(C.isCorrect(num, '3/4')).toBe(false);
    expect(C.isCorrect(choice, 2)).toBe(true);
    expect(C.isCorrect(choice, 0)).toBe(false);
  });

  it('jamais la réponse au premier essai : indice 1 (ou le `why` de l’option), indice 2, puis la réponse au 3e', () => {
    let p = C.fresh();
    p = C.submit(p, choice, 0);
    expect(p.status).toBe('wrong');
    expect(C.feedbackOf(p, choice)).toEqual({ kind: 'hint', node: 'pourquoi a' });
    p = C.submit(p, choice, 0);   // la même option fausse : sans effet
    expect(p.tries).toBe(1);
    p = C.submit(p, choice, 1);
    expect(C.feedbackOf(p, choice)).toEqual({ kind: 'hint', node: 'h2' });

    let n = C.fresh();
    n = C.submit(n, num, '3/4');
    expect(C.feedbackOf(n, num)).toEqual({ kind: 'hint', node: 'h1' });
    n = C.submit(n, num, 'xx');   // illisible : ne coûte pas un essai
    expect(n.tries).toBe(1);
    n = C.submit(n, num, '1');
    expect(n.status).toBe('wrong');
    n = C.submit(n, num, '2');
    expect(n.status).toBe('revealed');
    expect(C.feedbackOf(n, num)).toEqual({ kind: 'reveal' });
    expect(n.log).toEqual([{ id: 'read', tries: 3, ok: false }]);
  });

  it('bloque jusqu’à la fin de la suite : « التالي » n’avance qu’après une réponse juste ou montrée', () => {
    let p = C.fresh();
    expect(C.advance(p, 2)).toBe(p);
    p = C.submit(p, num, '4/3');
    expect(p.status).toBe('right');
    expect(C.submit(p, num, '1')).toBe(p);
    p = C.advance(p, 2);
    expect(p).toMatchObject({ qi: 1, tries: 0, wrong: [], status: 'ask', done: false });
    p = C.submit(p, choice, 2);
    p = C.advance(p, 2);
    expect(p.done).toBe(true);
    expect(p.log).toEqual([{ id: 'read', tries: 1, ok: true }, { id: 'op', tries: 1, ok: true }]);
  });
});

describe('labCheckpointSettings — la clé du labo pour le réglage de l’enseignant', async () => {
  const { labKeyFromPath } = await import('./labCheckpointSettings');
  it('« <module>:<type> » et la leçon, lus dans l’URL d’un module ; null ailleurs', () => {
    expect(labKeyFromPath('/courses/moyen/3am/ansab_al_aadad_wal_hisab/maqlub-qismat-kasrayn/nashat', 'gear-crank'))
      .toEqual({ lesson: 'maqlub-qismat-kasrayn', lab: 'nashat:gear-crank' });
    expect(labKeyFromPath('/courses/moyen/3am/ansab_al_aadad_wal_hisab/maqlub-qismat-kasrayn/nashat/', 'gear-crank')?.lab).toBe('nashat:gear-crank');
    expect(labKeyFromPath('/methode', 'gear-crank')).toBeNull();
    expect(labKeyFromPath('/courses/moyen/3am/x/y/z/extra', 'gear-crank')).toBeNull();
    expect(labKeyFromPath('/courses/moyen/3am/x/y/z', '')).toBeNull();
  });
});

describe('fill / build — les réponses à cases du lecteur (pilote 2026-11-07)', () => {
  const FILL = { id: 'observe', kind: 'fill', fields: [{ label: 'q', expected: 5, options: [4, 5, 6, 7] }, { label: 'r', expected: 0, options: [0, 1, 2, 3] }], hints: ['h1', 'h2'] };
  const BUILD = { id: 'build', kind: 'build', slots: ['n', 'g', 'q', 'r'], tiles: [0, 5, 15, 3], expected: [15, 3, 5, 0], hints: ['h1', 'h2'] };
  it('fill : juste seulement quand TOUTES les cases le sont', () => {
    expect(C.isCorrect(FILL, [5, 0])).toBe(true);
    expect(C.isCorrect(FILL, [5, 1])).toBe(false);
  });
  it('fill / build : une réponse incomplète n’est pas jugée (aucun essai consommé)', () => {
    const p = C.fresh();
    expect(C.submit(p, FILL, [5, null])).toBe(p);
    expect(C.submit(p, BUILD, [15, 3, 5])).toBe(p);
  });
  it('build : l’égalité bâtie dans l’ordre des emplacements nommés', () => {
    expect(C.isCorrect(BUILD, [15, 3, 5, 0])).toBe(true);
    // 15 = 5 × 3 + 0 est vrai en calcul, mais 5 n'est pas « الفرق » : le sens de chaque nombre compte
    expect(C.isCorrect(BUILD, [15, 5, 3, 0])).toBe(false);
    const p = C.submit(C.fresh(), BUILD, [15, 5, 3, 0]);
    expect(p.status).toBe('wrong');
    expect(C.submit(p, BUILD, [15, 3, 5, 0]).status).toBe('right');
  });
});

describe('build — `accept` : l’égalité écrite dans l’autre sens (unité 9, leçon 2, conseil L2.3)', () => {
  const RATIO = {
    id: 'ratioBuild', kind: 'build', slots: ['a', 'b', 'c', 'd'], tiles: ["AB′", 'AB', "AC′", 'AC', "CC′"],
    expected: ["AB′", 'AB', "AC′", 'AC'], accept: [["AC′", 'AC', "AB′", 'AB']], preset: ["AB′", 'AB', null, null], hints: ['h1', 'h2'],
  };
  it('the written order and the swapped equality are both right; the decoy and an inverted side are not', () => {
    expect(C.isCorrect(RATIO, ["AB′", 'AB', "AC′", 'AC'])).toBe(true);
    expect(C.isCorrect(RATIO, ["AC′", 'AC', "AB′", 'AB'])).toBe(true);
    expect(C.isCorrect(RATIO, ["AB′", 'AB', "AC′", "CC′"])).toBe(false);
    expect(C.isCorrect(RATIO, ["AB′", 'AB', 'AC', "AC′"])).toBe(false);
    expect(C.submit(C.fresh(), RATIO, ["AC′", 'AC', "AB′", 'AB']).status).toBe('right');
  });
  it('without `accept` nothing changes: only the written order', () => {
    const plain = { ...RATIO, accept: undefined };
    expect(C.isCorrect(plain, ["AC′", 'AC', "AB′", 'AB'])).toBe(false);
    expect(C.isCorrect(plain, ["AB′", 'AB', "AC′", 'AC'])).toBe(true);
  });
});
