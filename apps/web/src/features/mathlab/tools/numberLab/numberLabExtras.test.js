import { describe, it, expect } from 'vitest';
import ar from '../../../../i18n/locales/ar/mathlab.json';
import { MODES, GCD_METHODS, POWER_TABS } from './numberState.js';
import { MODE_SECTIONS, MODE_GROUPS } from './modeCatalog.js';
import { divisibilityReason } from './divisibilityReasons.js';
import { divisibilityTable } from './numberTheory.js';
import { treeLevels, buildFullTree } from './factorTree.js';
import * as Q from './bigRational.js';
import { summarizeNumberLab } from './summarize.js';
import { createNumberLabData, patchMode, setMode } from './numberState.js';

const L = ar.tools.numberLab;
const get = (path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), L);

describe('la barre des modes', () => {
  it('chaque mode est dans la barre EXACTEMENT une fois, dans un groupe connu, avec une icône', () => {
    expect(MODE_SECTIONS.map((s) => s.id).sort()).toEqual([...MODES].sort());
    for (const section of MODE_SECTIONS) {
      expect(MODE_GROUPS).toContain(section.group);
      expect(section.icon).toBeTruthy();
    }
  });

  it('les groupes sont contigus (un séparateur par famille)', () => {
    const order = MODE_SECTIONS.map((s) => s.group).filter((g, i, all) => all[i - 1] !== g);
    expect(order).toEqual(MODE_GROUPS);
  });
});

describe('les chaînes arabes existent', () => {
  it('nom court, nom long et description de chaque mode ; titre de chaque groupe', () => {
    for (const mode of MODES) {
      expect(get(`modes.${mode}`), mode).toBeTruthy();
      expect(get(`modesShort.${mode}`), mode).toBeTruthy();
      expect(get(`modeDescriptions.${mode}`), mode).toBeTruthy();
    }
    for (const group of MODE_GROUPS) expect(get(`modeGroups.${group}`)).toBeTruthy();
    for (const method of GCD_METHODS) expect(get(`gcdLcm.methods.${method}`)).toBeTruthy();
    for (const tab of POWER_TABS) expect(get(`powers.tabs.${tab}`)).toBeTruthy();
  });

  it('les pluriels arabes ont leurs six formes (« 8 خطوات »، « خطوتان »…)', () => {
    for (const key of ['gcdLcm.differences.stepsCount', 'gcdLcm.differences.divisionsCount', 'gcdLcm.squareCount']) {
      for (const form of ['zero', 'one', 'two', 'few', 'many', 'other']) expect(get(`${key}_${form}`), `${key}_${form}`).toBeTruthy();
    }
    expect(get('gcdLcm.differences.stepsCount_few')).toBe('{{count}} خطوات');
    expect(get('gcdLcm.differences.stepsCount_two')).toBe('خطوتان');
  });

  it('chaque code d’erreur des moteurs a sa phrase', () => {
    for (const code of ['empty', 'notNumber', 'notInteger', 'notPositive', 'tooLarge']) expect(get(`gcdLcm.differences.errors.${code}`)).toBeTruthy();
    for (const code of ['empty', 'notNumber', 'notInteger', 'negative', 'zeroDivisor', 'tooLarge']) expect(get(`division.errors.${code}`)).toBeTruthy();
    for (const code of ['empty', 'tooLong', 'unexpectedChar', 'unexpectedEnd', 'unexpectedToken', 'missingClose', 'unexpectedClose',
      'mismatchedBracket', 'emptyGroup', 'numberTooLong', 'zeroDenominator', 'tooManyOperations', 'divisionByZero',
      'nonIntegerExponent', 'exponentTooLarge', 'tooLarge', 'zeroPowerZero']) expect(get(`order.errors.${code}`), code).toBeTruthy();
    for (const rule of ['power', 'multiplyDivide', 'addSubtract', 'removeBrackets']) expect(get(`order.rules.${rule}`)).toBeTruthy();
  });

  it('aucune formule nue « a − b = c » dans une phrase arabe des modes neufs (bidi la retournerait)', () => {
    const texts = JSON.stringify([L.division, L.powers, L.order, L.gcdLcm.differences]);
    // Une formule hors de $…$ : deux nombres de part et d'autre d'un opérateur puis « = ».
    const stripped = texts.replace(/\$[^$]*\$/g, '');
    expect(stripped).not.toMatch(/\d+ [−×÷+-] \d+ = \d+/);
  });
});

describe('la raison de la divisibilité', () => {
  const reasonsFor = (n) => {
    const table = divisibilityTable(n);
    const ctx = { div2: table.find((r) => r.by === 2).divisible, div3: table.find((r) => r.by === 3).divisible };

    return Object.fromEntries(table.map((row) => [row.by, divisibilityReason(row, n, ctx)]));
  };

  it('360 : 2, 3, 5, 9, 10 avec leur raison et une clé qui existe', () => {
    const r = reasonsFor(360);
    expect(r[2]).toMatchObject({ key: 'tools.numberLab.divisibility.reasons.2.yes', params: { digit: '0' } });
    expect(r[3]).toMatchObject({ params: { sum: 9 }, formula: '3 + 6 + 0 = 9' });
    expect(r[9].key.endsWith('9.yes')).toBe(true);
    expect(r[4].params.lastTwo).toBe('60');
    expect(r[25].key.endsWith('25.no')).toBe(true);
    for (const reason of Object.values(r)) {
      expect(get(reason.key.replace('tools.numberLab.', '')), reason.key).toBeTruthy();
    }
  });

  it('1005 finit par « 05 », et 6 dit laquelle des deux conditions manque', () => {
    const r = reasonsFor(1005);
    expect(r[4].params.lastTwo).toBe('05');
    expect(r[6].key.endsWith('6.no2')).toBe(true);
    expect(reasonsFor(14)[6].key.endsWith('6.no3')).toBe(true);
  });
});

describe('l’arbre lu niveau par niveau', () => {
  it('60 = 2 × 30 = 2 × 2 × 15 = 2 × 2 × 3 × 5', () => {
    expect(treeLevels(buildFullTree(60))).toEqual([[60], [2, 30], [2, 2, 15], [2, 2, 3, 5]]);
    expect(treeLevels({ n: 7 })).toEqual([[7]]);
    expect(treeLevels(null)).toEqual([]);
  });
});

describe('les rationnels BigInt', () => {
  it('réduits, exacts, et sans flottant', () => {
    expect(Q.add(Q.rat(1, 3), Q.rat(1, 6))).toEqual(Q.rat(1, 2));
    expect(Q.div(Q.rat(1), Q.rat(0))).toBeNull();
    expect(Q.toDecimal(Q.rat(-1, 8)).text).toBe('−0,125');
    expect(Q.toDecimal(Q.rat(2, 3), { places: 4 })).toEqual({ text: '0,6666', exact: false });
    expect(Q.fromDecimalText('0,1')).toEqual(Q.rat(1, 10));
    expect(Q.groupDigits('1048576')).toBe('1 048 576');
    expect(Q.pow(Q.rat(2), 1000).error).toBe('tooLarge');
  });
});

describe('le résumé des modes neufs', () => {
  it.each(['division', 'powers', 'order'])('%s', (mode) => {
    const data = setMode(createNumberLabData(), mode);
    const summary = summarizeNumberLab(data);
    expect(summary.kind).toBe('equation');
    expect(summary.detail.mode).toBe(mode);
  });

  it('division 38 ÷ 7, √72 = 6√2, et l’expression avec son résultat', () => {
    expect(summarizeNumberLab(setMode(createNumberLabData(), 'division')).text[0]).toBe('38 = 7 × 5 + 3');
    const roots = patchMode(setMode(createNumberLabData(), 'powers'), 'powers', { tab: 'roots' });
    expect(summarizeNumberLab(roots).text[0]).toBe('√72 = 6√2');
    expect(summarizeNumberLab(setMode(createNumberLabData(), 'order')).text).toEqual(['2 × (3 + 4)^2 − 10', '88']);
  });

  it('ne jette jamais sur un état abîmé', () => {
    for (const bad of [{ mode: 'order', order: { expression: '(((' } }, { mode: 'powers', powers: null }, { mode: 'division', division: { a: 5, b: 0 } }]) {
      expect(() => summarizeNumberLab(bad)).not.toThrow();
    }
  });
});
