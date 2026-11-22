import { describe, it, expect } from 'vitest';
import * as L from './storyModeller.js';
import * as P from './storyModellerPlayer.js';

/**
 * story-modeller, lecteur — les AJOUTS de la synthèse de l'unité 5 (`wadiya-idmajiya-jumal`, 2026-11-12) : l'information d'argent aux quantités
 * ÉGALES (`equalRow`), la construction « k × (▢ + ▢) = ▢ » (`sumBuild`), les suites `synthTrip` / `synthParty`. Rien de la leçon 3 ne change :
 * ses manches n'ont pas d'information aux quantités égales (`x + y = n` COMPTE) et leurs écrans ne gagnent aucune tuile.
 */
const money = (system, extra = {}) => {
  const nums = system.match(/\d+/g);
  return L.parseModel({
    system,
    unknowns: [{ id: 'x', noun: 'ثمن أ' }, { id: 'y', noun: 'ثمن ب' }],
    facts: [{ quote: 'q1', kind: 'money' }, { quote: 'q2', kind: 'money' }],
    chips: nums.map((v) => ({ value: v, label: '' })),
    ...extra,
  });
};

describe('equalRow / sumBuild', () => {
  it('finds the money fact whose two counts are equal (and > 1)', () => {
    expect(P.equalRow(money('120x+120y=8400|9x+14y=780'))).toBe(1);
    expect(P.equalRow(money('9x+14y=780|120x+120y=8400'))).toBe(2);
    expect(P.equalRow(money('2x+y=230|x+2y=190'))).toBe(0);
  });
  it('a COUNT fact x + y = n is never an equal-count money fact (lesson 3 unchanged)', () => {
    const m = L.parseModel({
      system: 'x+y=12|70x+20y=440', unknowns: [{ id: 'x', noun: 'أ' }, { id: 'y', noun: 'ب' }],
      facts: [{ quote: 'q1', kind: 'count' }, { quote: 'q2', kind: 'money' }], chips: [{ value: '12' }, { value: '70' }, { value: '20' }, { value: '440' }],
    });
    expect(P.equalRow(m)).toBe(0);
    expect(P.sumBuild(m, { x: m.sol.x, y: m.sol.y })).toBeNull();
  });
  it('builds « 120 × (40 + 30) = 8400 » with ONE decoy, 8400 ÷ 120', () => {
    const m = money('120x+120y=8400|9x+14y=780');
    expect(P.sumBuild(m, { x: m.sol.x, y: m.sol.y })).toMatchObject({ row: 1, k: '120', expected: ['40', '30', '8400'], decoy: '70', sum: '70', distinct: true });
  });
  it('the values are read in the order of the STORY\'s unknowns', () => {
    const m = money('10x+10y=550|5x+3y=235');
    expect(P.sumBuild(m, { x: m.sol.x, y: m.sol.y }).expected).toEqual(['35', '20', '550']);
  });
});

describe('the synthesis chains', () => {
  it('synthTrip asks the typed line, the swap, then BUILDS the answer; synthParty asks the build once the answer is chosen', () => {
    expect(P.chainsOf('synthTrip').specs.map((s) => [s.id, s.at])).toEqual([['solveTyped', 'typed'], ['verifySwap', 'replayOk'], ['buildAnswer', 'answerOpen']]);
    expect(P.chainsOf('synthTrip').answerBuild).toBe(true);
    expect(P.chainsOf('synthParty').specs.map((s) => [s.id, s.at])).toEqual([['buildSum', 'answered']]);
    expect(P.typesFirst('synthTrip')).toBe(true);
    expect(P.typesFirst('synthParty')).toBe(false);
  });
  it('shownValues lists the build tiles only for a round that asks the build', () => {
    const props = {
      system: '120x+120y=8400|9x+14y=780', named: true,
      unknowns: [{ id: 'x', noun: 'ثمن أ' }, { id: 'y', noun: 'ثمن ب' }],
      facts: [{ quote: 'q1', kind: 'money' }, { quote: 'q2', kind: 'money' }],
      chips: ['120', '120', '8400', '9', '14', '780'].map((value) => ({ value })), story: '',
    };
    const roles = (p) => P.shownValues(p).filter((x) => ['tile', 'decoy', 'sum'].includes(x.role)).map((x) => `${x.role}:${x.v}`);
    expect(roles({ ...props, chains: 'none' })).toEqual([]);
    expect(roles({ ...props, chains: 'synthParty' })).toEqual(['tile:40', 'tile:30', 'tile:8400', 'tile:70', 'decoy:70', 'sum:70']);
  });
});
