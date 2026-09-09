import { describe, it, expect } from 'vitest';
import { labStateKey, parseLabRecord, makeLabRecord } from './useLabState';

/**
 * Ce que ces tests verrouillent : la continuité d'un objet entre deux modules
 * ne peut JAMAIS casser un module. Une donnée absente, corrompue, d'une
 * version antérieure ou d'une autre leçon vaut « rien de mémorisé » — le
 * module repart alors de sa valeur initiale.
 */
describe('labStateKey — l’isolement des objets mémorisés', () => {
  it('sépare deux leçons qui partagent le même nom d’objet', () => {
    expect(labStateKey('pythagore-4e', 'triangle')).not.toBe(labStateKey('triangles-4e', 'triangle'));
  });

  it('sépare deux objets d’une même leçon', () => {
    expect(labStateKey('fonctions-4e', 'machine')).not.toBe(labStateKey('fonctions-4e', 'serie'));
  });

  it('reste un préfixe reconnaissable, distinct des clés de progression', () => {
    const k = labStateKey('statistiques-4e', 'serie');
    expect(k.startsWith('smarter_lab_')).toBe(true);
    // La progression, elle, vit sous `smarter_lesson_…` : aucune collision.
    expect(k.startsWith('smarter_lesson_')).toBe(false);
  });
});

describe('parseLabRecord — rien de mémorisé est un cas NORMAL', () => {
  it('renvoie null quand rien n’a jamais été écrit', () => {
    expect(parseLabRecord(null)).toBeNull();
    expect(parseLabRecord(undefined)).toBeNull();
  });

  it('renvoie null sur du JSON cassé plutôt que de lever', () => {
    expect(parseLabRecord('{ceci n’est pas du json')).toBeNull();
    expect(parseLabRecord('')).toBeNull();
  });

  it('REFUSE une forme antérieure ou étrangère (pas de champ « v »)', () => {
    expect(parseLabRecord('{"triangle":[1,2,3]}')).toBeNull();
    expect(parseLabRecord('[1,2,3]')).toBeNull();
    expect(parseLabRecord('42')).toBeNull();
    expect(parseLabRecord('"texte"')).toBeNull();
  });

  it('relit ce qui a été écrit, à l’identique', () => {
    const objet = { A: { x: 0, y: 0 }, B: { x: 6, y: 0 }, C: { x: 0, y: 8 } };
    const relu = parseLabRecord(JSON.stringify(makeLabRecord(objet)));
    expect(relu.v).toEqual(objet);
  });

  it('accepte une valeur fausse-mais-légitime (0, false, null) sans la confondre avec « rien »', () => {
    for (const v of [0, false, null, '']) {
      const relu = parseLabRecord(JSON.stringify(makeLabRecord(v)));
      expect(relu).not.toBeNull();
      expect(relu.v).toBe(v);
    }
  });
});

describe('makeLabRecord — l’enregistrement écrit', () => {
  it('porte la valeur et la date, et rien d’autre', () => {
    const rec = makeLabRecord({ n: 3 }, new Date('2026-09-09T10:00:00.000Z'));
    expect(Object.keys(rec).sort()).toEqual(['savedAt', 'v']);
    expect(rec.savedAt).toBe('2026-09-09T10:00:00.000Z');
  });
});
