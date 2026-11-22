import { describe, it, expect } from 'vitest';
import * as S from './numberState.js';
import { numberLabTool } from './index.js';

/** Le document : ce qu'il vaut neuf, ce qu'il devient abîmé, ce qu'il pèse. */

describe('un document neuf', () => {
  it('ouvre sur l’EXPLORATEUR et sur 360', () => {
    const data = S.createNumberLabData();
    expect(data.mode).toBe('explorer');
    expect(data.explorer.value).toBe(360);
  });

  it('a les seize modes, chacun avec ses propres nombres', () => {
    const data = S.createNumberLabData();
    for (const mode of S.MODES) expect(data[mode], mode).toBeTruthy();
    expect(S.MODES).toHaveLength(16);
  });

  it('ouvre le PGCD sur les FUVĀRIQ (défaut des nouveaux documents, 2026-09-30)', () => {
    expect(S.createNumberLabData().gcdLcm.method).toBe('differences');
    expect(S.GCD_METHODS[0]).toBe('differences');
  });

  it('ne garde AUCUN état transitoire (§43)', () => {
    const data = S.createNumberLabData();
    const serialized = JSON.stringify(data);
    for (const forbidden of ['animation', 'playing', 'panelOpen', 'challenge', 'verdict', 'hover', 'dragging']) {
      expect(serialized, forbidden).not.toContain(forbidden);
    }
  });

  it('se relit à l’identique — normaliser est idempotent', () => {
    const data = S.createNumberLabData();
    expect(S.normalizeNumberLabData(data)).toEqual(data);
    expect(S.normalizeNumberLabData(S.normalizeNumberLabData(data))).toEqual(data);
  });
});

describe('relire un document abîmé', () => {
  it.each([
    null, undefined, {}, [], 0, 'x', { mode: 'inconnu' },
    { explorer: null }, { line: { points: 'pas un tableau' } },
    { fractions: { left: { n: 1, d: 0 } } }, { primes: { limit: 1e9 } },
    { proportion: { rows: [{ x: 'a' }] } }, { notes: [1, 2, null] },
    { practice: { level: 99, solved: -5 } }, { gcdLcm: { a: -3, b: 0 } },
  ])('cas %# s’ouvre sur quelque chose de sensé', (raw) => {
    const data = S.normalizeNumberLabData(raw);
    expect(S.MODES).toContain(data.mode);
    expect(data.fractions.left.d).toBeGreaterThan(0);
    expect(data.practice.level).toBeGreaterThanOrEqual(1);
    expect(data.practice.level).toBeLessThanOrEqual(5);
    expect(data.gcdLcm.a).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(data.notes)).toBe(true);
  });

  it('une fraction n’est JAMAIS réduite en silence (§9)', () => {
    expect(S.normalizeNumberLabData({ fractions: { left: { n: 2, d: 4 } } }).fractions.left).toEqual({ n: 2, d: 4 });
  });

  it('un crible plus grand que ce qu’on sait dessiner est ramené à la borne', () => {
    expect(S.normalizeNumberLabData({ primes: { limit: 999999 } }).primes.limit).toBe(10000);
  });

  it('une fenêtre dégénérée est refusée', () => {
    const view = S.normalizeNumberLabData({ line: { view: { center: 0, span: 0 } } }).line.view;
    expect(view.span).toBeGreaterThan(0);
  });
});

describe('l’arbre de factorisation (§24)', () => {
  it('garde un arbre COHÉRENT : le produit des fils fait le père', () => {
    const tree = S.normalizeTree({ n: 12, left: { n: 3 }, right: { n: 4 } });
    expect(tree).toEqual({ n: 12, left: { n: 3 }, right: { n: 4 } });
  });

  it('REFUSE une décomposition fausse — 12 ≠ 3 × 5', () => {
    expect(S.normalizeTree({ n: 12, left: { n: 3 }, right: { n: 5 } })).toEqual({ n: 12 });
  });

  it('refuse un nœud à un seul fils', () => {
    expect(S.normalizeTree({ n: 12, left: { n: 3 } })).toEqual({ n: 12 });
  });

  it('borne la profondeur : un arbre venu du serveur ne fait pas exploser la pile', () => {
    let deep = { n: 2 };
    for (let i = 0; i < 200; i += 1) deep = { n: 2, left: deep, right: deep };
    expect(() => S.normalizeTree(deep)).not.toThrow();
  });
});

describe('§46 — envoyer une valeur d’un mode à l’autre est un GESTE', () => {
  it('envoyer 360 au crible pose l’arbre et CHANGE de mode', () => {
    const data = S.sendTo(S.createNumberLabData(), 'primes', 360);
    expect(data.mode).toBe('primes');
    expect(data.primes.factorTree).toEqual({ n: 360 });
  });

  it('envoyer aux facteurs remet le curseur de couples à zéro', () => {
    const start = S.patchMode(S.createNumberLabData(), 'factors', { pairIndex: 3 });
    expect(S.sendTo(start, 'factors', 36).factors).toEqual({ value: 36, pairIndex: 0 });
  });

  it('envoyer à la droite CADRE la valeur — elle n’est jamais hors champ', () => {
    const data = S.sendTo(S.createNumberLabData(), 'line', 0.75);
    expect(data.line.points[0]).toEqual({ n: 3, d: 4 });
    const { center, span } = data.line.view;
    expect(0.75).toBeGreaterThanOrEqual(center - span / 2);
    expect(0.75).toBeLessThanOrEqual(center + span / 2);
  });

  it('un nombre trop grand pour la valeur de position change de mode sans mentir', () => {
    const data = S.sendTo(S.createNumberLabData(), 'place', 9_000_000);
    expect(data.mode).toBe('place');
    expect(Math.abs(data.place.value)).toBeLessThanOrEqual(S.MAX_PLACE_VALUE);
  });

  it('changer de mode ne touche à AUCUN nombre — chaque mode garde les siens', () => {
    let data = S.patchMode(S.createNumberLabData(), 'gcdLcm', { a: 120, b: 45 });
    data = S.setMode(data, 'primes');
    data = S.setMode(data, 'gcdLcm');
    expect(data.gcdLcm).toMatchObject({ a: 120, b: 45 });
  });

  it('envoyer une fraction à la droite règle aussi la subdivision', () => {
    const data = S.sendFracTo(S.createNumberLabData(), 'line', { n: 5, d: 8 });
    expect(data.line.points[0]).toEqual({ n: 5, d: 8 });
    expect(data.line.denominator).toBe(8);
  });
});

describe('l’amorce d’une leçon (openMathLab)', () => {
  it('pose un mode et un nombre dans TOUS les modes qui l’acceptent', () => {
    const data = S.createNumberLabData({ mode: 'divisibility', value: 144 });
    expect(data.mode).toBe('divisibility');
    expect(data.divisibility.value).toBe(144);
    expect(data.explorer.value).toBe(144);
    expect(data.factors.value).toBe(144);
  });

  it('pose deux nombres pour le PGCD', () => {
    expect(S.createNumberLabData({ a: 120, b: 45 }).gcdLcm).toMatchObject({ a: 120, b: 45 });
  });

  it('une amorce absurde ne casse RIEN', () => {
    for (const seed of [null, 'x', 42, { mode: 'inconnu' }, { value: Infinity }, { a: NaN, b: 1 }]) {
      expect(() => S.createNumberLabData(seed)).not.toThrow();
      expect(S.MODES).toContain(S.createNumberLabData(seed).mode);
    }
  });
});

describe('les notes et l’entraînement', () => {
  it('une note se garde une seule fois (§55)', () => {
    let data = S.addNote(S.createNumberLabData(), 'كل عدد يقبل القسمة على 6 يقبل القسمة على 2 وعلى 3.');
    data = S.addNote(data, 'كل عدد يقبل القسمة على 6 يقبل القسمة على 2 وعلى 3.');
    expect(data.notes).toHaveLength(1);
  });

  it('une note vide n’existe pas, et les notes sont bornées', () => {
    expect(S.addNote(S.createNumberLabData(), '   ').notes).toHaveLength(0);
    let data = S.createNumberLabData();
    for (let i = 0; i < 50; i += 1) data = S.addNote(data, `note ${i}`);
    expect(data.notes).toHaveLength(S.MAX_NOTES);
  });

  it('§56 — on compte les résolues et les tentatives, RIEN d’autre', () => {
    const data = S.recordAttempt(S.recordAttempt(S.createNumberLabData(), { solved: true }), { hint: true });
    expect(data.practice).toEqual({ level: 1, solved: 1, attempts: 2, hintsUsed: 1 });
    expect(Object.keys(data.practice)).toHaveLength(4);
  });
});

describe('le document tient dans ce que le serveur accepte', () => {
  it('le PIRE cas reste très en dessous de la borne', () => {
    let data = S.createNumberLabData();
    data = S.patchMode(data, 'proportion', {
      rows: Array.from({ length: S.MAX_ROWS }, (_, i) => ({ x: -123456.789, y: 987654.321 - i })),
    });
    // Un arbre de factorisation complet et profond.
    let tree = { n: 2 };
    for (let i = 0; i < 20; i += 1) tree = { n: 2 ** (i + 2), left: tree, right: { n: 2 } };
    data = { ...data, primes: { ...data.primes, limit: 10000, factorTree: S.normalizeTree(tree) } };
    for (let i = 0; i < S.MAX_NOTES; i += 1) data = S.addNote(data, 'ن'.repeat(200) + i);

    const bytes = new TextEncoder().encode(JSON.stringify(S.serializeNumberLabData(data))).length;
    expect(bytes, `${bytes} octets`).toBeLessThan(20_000);
  });

  it('un document neuf pèse quelques centaines d’octets', () => {
    const bytes = new TextEncoder().encode(JSON.stringify(S.createNumberLabData())).length;
    expect(bytes).toBeLessThan(1_200);
  });
});

describe('l’instrument lui-même', () => {
  it('est défini, et son identité est stable', () => {
    expect(numberLabTool.id).toBe('numberLab');
    expect(numberLabTool.slug).toBe('nombres');
    expect(numberLabTool.schemaVersion).toBe(S.NUMBER_LAB_SCHEMA_VERSION);
    expect(typeof numberLabTool.summarize).toBe('function');
    expect(typeof numberLabTool.load).toBe('function');
  });
});

describe('les modes du 2026-09-30 et les documents V1', () => {
  // Un document V1 tel qu'enregistré AVANT les nouveaux modes : treize sous-états.
  const v1 = () => {
    const doc = JSON.parse(JSON.stringify(S.createNumberLabData()));
    delete doc.division; delete doc.powers; delete doc.order;
    doc.gcdLcm = { a: 120, b: 45, method: 'euclid' };
    doc.mode = 'gcdLcm';

    return doc;
  };

  it('un document V1 en « euclid » rouvre en « euclid », avec ses nombres et son mode', () => {
    const data = S.normalizeNumberLabData(v1());
    expect(data.gcdLcm).toEqual({ a: 120, b: 45, method: 'euclid' });
    expect(data.mode).toBe('gcdLcm');
  });

  it('les méthodes « factors » et « lists » sont gardées aussi', () => {
    for (const method of ['factors', 'lists']) {
      expect(S.normalizeNumberLabData({ gcdLcm: { a: 4, b: 6, method } }).gcdLcm.method).toBe(method);
    }
  });

  it('un document V1 reçoit les sous-états neufs par défaut, sans rien perdre', () => {
    const data = S.normalizeNumberLabData(v1());
    expect(data.division).toEqual({ a: 38, b: 7 });
    expect(data.powers.tab).toBe('power');
    expect(data.order.expression).toBe('2 × (3 + 4)^2 − 10');
  });

  it('la division refuse b = 0 et un a négatif au relu', () => {
    const data = S.normalizeNumberLabData({ division: { a: -5, b: 0 } });
    expect(data.division.a).toBeGreaterThanOrEqual(0);
    expect(data.division.b).toBeGreaterThanOrEqual(1);
  });

  it('les puissances sont bornées, et un ruleBase nul revient à 2', () => {
    const data = S.normalizeNumberLabData({
      powers: { tab: 'x', base: 1e9, exponent: -999, rule: '??', ruleBase: 0, m: 99, n: -99, scientific: 42, root: -3 },
    });
    expect(data.powers).toMatchObject({ tab: 'power', base: 1000, exponent: -30, rule: 'product', ruleBase: 2, m: 12, n: -12, scientific: '0,00045', root: 0 });
  });

  it('une expression est gardée TELLE QUELLE (même fausse), mais bornée', () => {
    expect(S.normalizeNumberLabData({ order: { expression: '3 + (' } }).order.expression).toBe('3 + (');
    expect(S.normalizeNumberLabData({ order: { expression: 'x'.repeat(500) } }).order.expression).toHaveLength(120);
    expect(S.normalizeNumberLabData({ order: { expression: 7 } }).order.expression).toBe('2 × (3 + 4)^2 − 10');
  });

  it.each([null, 'x', { division: 'x' }, { powers: [] }, { order: null }, { powers: { scientific: '' } }])(
    'un sous-état neuf abîmé (%#) ne casse rien',
    (raw) => {
      expect(() => S.normalizeNumberLabData(raw)).not.toThrow();
      expect(S.normalizeNumberLabData(S.normalizeNumberLabData(raw))).toEqual(S.normalizeNumberLabData(raw));
    },
  );

  it('envoyer à la division pose le dividende', () => {
    const data = S.sendTo(S.createNumberLabData(), 'division', 360);
    expect(data.mode).toBe('division');
    expect(data.division).toEqual({ a: 360, b: 7 });
  });

  it('une amorce de leçon peut poser une expression', () => {
    expect(S.createNumberLabData({ mode: 'order', expression: '3 + 4 × 5' })).toMatchObject({ mode: 'order', order: { expression: '3 + 4 × 5' } });
  });

  it('le PIRE cas avec les modes neufs tient toujours sous 20 KB', () => {
    let data = S.createNumberLabData();
    let tree = { n: 2 };
    for (let i = 0; i < 20; i += 1) tree = { n: 2 ** (i + 2), left: tree, right: { n: 2 } };
    data = { ...data, primes: { ...data.primes, limit: 10000, factorTree: S.normalizeTree(tree) } };
    data = S.patchMode(data, 'order', { expression: '[(1234567 + 7654321) × 999] ÷ 3/4 − '.repeat(5) });
    data = S.patchMode(data, 'powers', { scientific: '0,'.padEnd(40, '9'), base: -999, exponent: -30 });
    data = S.patchMode(data, 'division', { a: 10_000_000, b: 9_999_999 });
    data = S.patchMode(data, 'proportion', {
      rows: Array.from({ length: S.MAX_ROWS }, (_, i) => ({ x: -123456.789, y: 987654.321 - i })),
    });
    for (let i = 0; i < S.MAX_NOTES; i += 1) data = S.addNote(data, 'ن'.repeat(200) + i);
    const bytes = new TextEncoder().encode(JSON.stringify(S.serializeNumberLabData(data))).length;
    expect(bytes, `${bytes} octets`).toBeLessThan(20_000);
  });
});
