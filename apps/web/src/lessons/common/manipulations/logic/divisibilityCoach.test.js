import { describe, it, expect } from 'vitest';
import * as DE from './divisorExplorer';
import * as BS from './bookshelf';
import * as TB from './teamBuilder';
import * as FP from './factorPairs';
import * as DP from './divisorProperties';
import * as CD from './commonDivisors';
import { LEVELS } from '../levels';

/**
 * LabCoach (MANIPULATION_CONTRACT §8quater) — les six labos de la divisibilité : le guide est SUIVI à la lettre, geste après geste,
 * jusqu'à ce que le labo atteigne son but (la découverte méritée) ; il ne désigne jamais un élément hors du contrat DOM.
 */
const MAX = 800;
const SELECTOR = /^(\[data-[a-z-]+(="[^"]+")?\]( \[data-[a-z-]+(="[^"]+")?\]| button)?)$/;

describe('divisor-explorer — coachOf', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : porter les cartes du rail, l'une après l'autre, ouvre la découverte`, () => {
      const lv = LEVELS['divisor-explorer'][level];
      const rail = DE.railOf({ a: lv.numbers.a, candidates: lv.candidates });
      let s = DE.initWithDefault({ a: lv.numbers.a, candidates: lv.candidates });
      const seen = [];
      for (let i = 0; i < MAX; i += 1) {
        const c = DE.coachOf(s, rail);
        if (!c) break;
        seen.push(c.id);
        expect(c.target).toMatch(SELECTOR);
        expect(rail).toContain(c.rank); // la carte montrée est bien dans le rail
        s = DE.place(s, c.rank);
      }
      expect(DE.discoveryReady(s)).toBe(true);
      expect(seen[0]).toBe('size');
      expect(seen.slice(1).every((x) => x === 'again')).toBe(true);
    });
  }
  it("ne montre jamais la taille posée à l'ouverture tant qu'une autre reste, et se tait sans rail", () => {
    const s = DE.initWithDefault({ a: 24, candidates: [3, 4, 5, 6, 8, 12] });
    expect(s.b).toBe(5);
    expect(DE.coachOf(s, [3, 4, 5, 6, 8, 12]).rank).toBe(3);
    expect(DE.coachOf(DE.init({ a: 24 }), [])).toBeNull();
  });
});

describe('divisor-explorer-books — coachOf', () => {
  const cases = [
    ['24 livres (مبتدئ)', { total: 24, range: BS.shelfRange(24, { min: 2, max: 12 }) }],
    ['420 livres (متقدم)', { total: 420, range: BS.shelfRange(420, { min: 10, max: 60 }) }],
    ['143 livres, symétrie (معارف)', { total: 143, range: BS.shelfRange(143, { min: 5, max: 30 }), discovery: 'symmetry' }],
  ];
  for (const [name, cfg] of cases) {
    it(`${name} : la poignée puis les boutons mènent à la découverte`, () => {
      let tried = {};
      let b = BS.defaultShelf(cfg.total, cfg.range);
      const seen = [];
      for (let i = 0; i < MAX; i += 1) {
        const c = BS.coachOf({ tried, b, range: cfg.range, discovery: cfg.discovery, total: cfg.total });
        if (!c) break;
        seen.push(c.id);
        expect(c.target).toMatch(SELECTOR);
        if (c.id === 'handle') tried = BS.commit(tried, cfg.total, b); // un premier essai validé, au geste
        else {
          b = BS.clampCapacity(b + c.rank, cfg.range);
          tried = BS.commit(tried, cfg.total, b);
        }
      }
      const ready = cfg.discovery === 'symmetry' ? BS.symmetryPair(tried, cfg.total) != null : BS.remainderDiscoveryReady(tried);
      expect(ready).toBe(true);
      expect(seen[0]).toBe('handle');
      expect(seen.slice(1).every((x) => x === 'nudge')).toBe(true);
    });
  }
  it('au bout de la réglette le guide montre « − » (le côté qui a de la place)', () => {
    const range = { min: 2, max: 12 };
    expect(BS.coachOf({ tried: { 12: { exact: true } }, b: 12, range, total: 24 })).toMatchObject({ id: 'nudge', rank: -1, target: '[data-shelf-nudge="-1"]' });
    expect(BS.coachOf({ tried: { 2: { exact: true } }, b: 2, range, total: 24 }).rank).toBe(1);
  });
});

describe('team-builder — coachOf', () => {
  /** Suit le guide : porter le 1er du banc là où `canPlace` le permet, retenir le verdict dès que la scène est stable. */
  function follow({ total, groups, teamOptions }) {
    let lab = TB.init({ total, groups });
    const memory = {};
    const seen = [];
    let last = null;
    for (let i = 0; i < MAX; i += 1) {
      if (TB.isSettled(lab)) memory[`${lab.total}:${lab.groups}`] = TB.verdict(lab).exact;
      const c = TB.coachOf(lab, { memory, teamOptions });
      if (!c) break;
      last = c;
      seen.push(c.id);
      expect(c.target).toMatch(SELECTOR);
      if (c.id === 'place' || c.id === 'more') {
        expect(lab.bench).toContain(c.rank); // le joueur montré est bien sur le banc
        const t = Array.from({ length: lab.groups }, (_, x) => x).find((x) => TB.canPlace(lab, c.rank, x) === true);
        lab = TB.place(lab, c.rank, t);
      } else if (c.id === 'teams') lab = TB.init({ total: lab.total, groups: c.rank });
      else break; // 'free' : le laboratoire libre est un geste du shell
    }
    return { lab, memory, seen, last };
  }
  it('مبتدئ (15 en 3, pastilles) : placer, puis un autre nombre d’équipes, ouvre la découverte', () => {
    const { memory, seen } = follow({ total: 15, groups: 3, teamOptions: [2, 3, 4, 5, 6] });
    expect(TB.discoveryReady(memory)).toBe(true);
    expect(seen[0]).toBe('place');
    expect(seen).toContain('more');
    expect(seen).toContain('teams');
  });
  it('متقدم (42 en 5, aucune pastille) : après le partage, le guide mène au laboratoire libre, puis se tait une fois ouvert', () => {
    const { lab, seen, last } = follow({ total: 42, groups: 5, teamOptions: [] });
    expect(last.id).toBe('free');
    expect(last.target).toBe('[data-manipulation-free-lab] button');
    expect(seen.filter((x) => x === 'free')).toHaveLength(1);
    expect(TB.coachOf(lab, { memory: { '42:5': false }, teamOptions: [], freeLab: true })).toBeNull();
  });
  it('ne nomme jamais une équipe et ne montre que des joueurs du banc', () => {
    const lab = TB.init({ total: 15, groups: 3 });
    expect(TB.coachOf(lab, {}).target).toBe('[data-drag-source="player:0"]');
  });
});

describe('factor-pairs — coachOf', () => {
  for (const n of [24, 105, 60]) {
    it(`n = ${n} : la poignée puis ± testent tout jusqu'à √n et un rectangle couché`, () => {
      const range = FP.widthRange(n);
      let s = FP.init({ n });
      let d = FP.defaultWidth(n);
      const seen = [];
      for (let i = 0; i < MAX; i += 1) {
        const c = FP.coachOf(s, { d, range });
        if (!c) break;
        seen.push(c.id);
        expect(c.target).toMatch(SELECTOR);
        if (c.id === 'handle') s = FP.test(s, d);
        else {
          d += c.rank;
          expect(d).toBeGreaterThanOrEqual(range.min);
          expect(d).toBeLessThanOrEqual(range.max);
          s = FP.test(s, d);
        }
      }
      expect(FP.discoveryReady(s)).toBe(true);
      expect(seen[0]).toBe('handle');
      expect(seen.slice(1).every((x) => x === 'nudge')).toBe(true);
    });
  }
});

describe('divisor-properties — coachOf', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : (prédire puis) porter le mur de b trois fois bâtit les trois murs`, () => {
      const { n, a, b } = LEVELS['divisor-properties'][level].numbers;
      const advanced = level === 'advanced';
      let s = DP.init({ n, a, b });
      const seen = [];
      for (let i = 0; i < 40; i += 1) {
        const c = DP.coachOf(s, { advanced });
        if (!c) break;
        seen.push(c.id);
        const target = DP.TARGETS.find((x) => !s.built.includes(x));
        expect(c.rank).toBe(DP.TARGETS.indexOf(target) + 1);
        if (c.id === 'predict') {
          expect(c.target).toMatch(/^\[data-site-zone="(join|remove|measure)"\] \[data-prediction\]$/);
          s = DP.predict(s, target, 'whole');
        } else {
          expect(c.target).toBe('[data-drag-source="wall:b"]');
          expect(DP.canBuild(s, target, { requirePrediction: advanced })).toBe(true); // le geste montré est permis
          s = DP.build(s, target);
        }
      }
      expect(DP.discoveryReady(s)).toBe(true);
      expect(seen).toEqual(advanced
        ? ['predict', 'carry', 'predict', 'carry-next', 'predict', 'carry-next']
        : ['carry', 'carry-next', 'carry-next']);
    });
  }
});

describe('common-divisors — coachOf', () => {
  const g = (a, b) => ({ bouquets: CD.initBouquets({ a, b }), lists: CD.initLists({ a, b }) });
  it('مبتدئ (12 et 18, groupes seuls) : tirer un emballage, puis « + », jusqu’au plus grand nombre de groupes', () => {
    let { bouquets, lists } = g(12, 18);
    const seen = [];
    for (let i = 0; i < MAX; i += 1) {
      const c = CD.coachOf({ stage: 'bouquets', bouquets, lists, groupsOnly: true });
      if (!c) break;
      seen.push(c.id);
      expect(c.target).toMatch(SELECTOR);
      bouquets = CD.addGroup(bouquets);
    }
    expect(CD.greatestGroupFound(bouquets)).toBe(true);
    expect(seen[0]).toBe('add');
    expect(seen.slice(1).every((x) => x === 'more')).toBe(true);
  });
  it('متقدم (65 et 78) : groupes, bouton vers les listes, zone du milieu, case PGCD', () => {
    let { bouquets, lists } = g(65, 78);
    let stage = 'bouquets';
    const seen = [];
    for (let i = 0; i < MAX; i += 1) {
      const c = CD.coachOf({ stage, bouquets, lists, groupsOnly: false });
      if (!c) break;
      seen.push(c.id);
      expect(c.target).toMatch(SELECTOR);
      if (c.id === 'add' || c.id === 'more') bouquets = CD.addGroup(bouquets);
      else if (c.id === 'to-lists') { expect(c.target).toBe('[data-common-next] button'); stage = 'lists'; }
      else if (c.id === 'middle') {
        // le guide montre la ZONE, pas un jeton : c'est l'élève qui sait lesquels divisent les deux nombres (ici, un oracle)
        expect(c.target).toBe('[data-drop-zone="middle"]');
        for (const d of lists.common) lists = CD.placeCommon(lists, d);
      } else if (c.id === 'pgcd') { expect(c.target).toBe('[data-drop-zone="pgcd"]'); lists = CD.placePgcd(lists, lists.g); }
    }
    expect(CD.listsDiscoveryReady(lists)).toBe(true);
    expect(seen).toEqual(expect.arrayContaining(['add', 'more', 'to-lists', 'middle', 'pgcd']));
    expect(seen.indexOf('to-lists')).toBeLessThan(seen.indexOf('middle'));
  });
  it('listes seules (28 et 42) : la zone du milieu d’abord, jamais un jeton', () => {
    const { bouquets, lists } = g(28, 42);
    const c = CD.coachOf({ stage: 'lists', bouquets, lists, groupsOnly: false });
    expect(c).toMatchObject({ id: 'middle', target: '[data-drop-zone="middle"]' });
  });
});
