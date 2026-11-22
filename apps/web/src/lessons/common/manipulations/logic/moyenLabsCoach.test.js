import { describe, it, expect } from 'vitest';
import * as SB from './storyBars';
import * as DC from './digitCards';
import * as FK from './fractionKnife';
import * as DJ from './divisionJumps';
import * as ET from './eggTrays';

/**
 * LabCoach (MANIPULATION_CONTRACT §8quater) — les labos des leçons 1AM–2AM : le guide est SUIVI à la lettre jusqu'au but du labo
 * (c'est l'élève qui choisit la taille, la carte, l'opération : le test joue l'élève, le guide ne fait que montrer l'élément).
 */
const MAX = 400;
const SELECTOR = /^\[data-[a-z-]+(="[^"]+")?\]$/;

describe('story-bars — coachOf', () => {
  for (const story of SB.STORY_IDS) {
    it(`${story} : suivre le guide, l'élève agissant juste, finit toutes les histoires`, () => {
      let s = SB.init(story);
      const seen = [];
      for (let i = 0; i < MAX; i += 1) {
        const c = SB.coachOf(s);
        if (!c) break;
        seen.push(c.id);
        expect(c.target).toMatch(SELECTOR);
        if (c.id === 'handle') s = SB.commitHeight(s, Number(SB.answerOf(story, s.cur).n / SB.answerOf(story, s.cur).d));
        else if (c.id === 'calc') s = SB.chooseCalc(s, SB.rightCalc(story, s.cur));
        else if (c.id === 'next') s = SB.next(s);
        else if (c.id === 'card') {
          const t = SB.firstUndone(s);
          const ci = SB.rightCalcOf(story, t).card;
          s = SB.placeCard(s, ci, t);
        } else throw new Error(`étape inconnue ${c.id}`);
      }
      if (s.mode === 'stretch') expect(SB.allDone(s)).toBe(true);
      expect(seen.length).toBeGreaterThan(0);
    });
  }
  it('cards : le guide ne montre que la première carte, puis se tait ; rien ne nomme la bonne carte', () => {
    const s = SB.init('act1');
    expect(SB.coachOf(s)).toEqual({ id: 'card', target: '[data-sb-card="0"]', gesture: 'drag' });
    const s2 = SB.placeCard(s, 0, 0);
    expect(SB.coachOf(s2)).toBeNull();
  });
});

describe('division-jumps — coachOf', () => {
  const worlds = [
    ['flowers', { a: 47, b: 6, world: 'flowers', then: 48 }],
    ['line', { a: 279, b: 14, world: 'line' }],
    ['line 253/17', { a: 253, b: 17, world: 'line' }],
  ];
  for (const [name, init] of worlds) {
    it(`${name} : suivre le guide jusqu'au contraste, l'élève choisissant ses q`, () => {
      let s = DJ.init(init);
      const seen = [];
      for (let i = 0; i < MAX; i += 1) {
        const c = DJ.coachOf(s);
        if (!c) break;
        seen.push(c.id);
        expect(c.target).toMatch(SELECTOR);
        if (c.id === 'handle') s = DJ.commitQ(s, 0);
        else if (c.id === 'step') s = DJ.commitQ(s, s.q + (c.target === '[data-dj-more]' ? 1 : -1));
        else if (c.id === 'next') s = DJ.addFlower(s);
        else throw new Error(`étape inconnue ${c.id}`);
      }
      expect(DJ.discoveryReady(s)).toBe(true);
      expect(seen[0]).toBe('handle');
      if (init.then) expect(seen.at(-1)).toBe('next');
      else expect(seen).not.toContain('next');
      expect(DJ.coachOf(s)).toBeNull();
    });
  }
  it('ne montre la carte 48 que si elle existe, et le − seulement au bout de la piste', () => {
    const s = DJ.commitQ(DJ.init({ a: 47, b: 6, world: 'flowers', then: 48 }), 0);
    expect(DJ.coachOf(s)).toEqual({ id: 'step', target: '[data-dj-more]', gesture: 'tap' });
    const end = DJ.commitQ(s, s.qMax);
    expect(DJ.coachOf(end).target).toBe('[data-dj-less]');
  });
});

describe('egg-trays — coachOf', () => {
  const cases = [
    ['مبتدئ carton 50/12 puis 60', { a: 50, b: 12, world: 'carton', then: 60 }],
    ['متقدم tray 2145/30 puis 2160 + camarade', { a: 2145, b: 30, world: 'tray', then: 2160, claim: { q: 70, r: 45 } }],
    ['sans contraste', { a: 50, b: 12, world: 'carton' }],
  ];
  for (const [name, o] of cases) {
    it(`${name} : suivre le guide, l'élève agissant juste, atteint la découverte`, () => {
      let s = ET.init(o);
      const seen = [];
      for (let i = 0; i < 60; i += 1) {
        const c = ET.coachOf(s);
        if (!c) break;
        seen.push(c.id);
        expect(c.target).toMatch(SELECTOR);
        const { q, r } = { q: Math.floor(s.a / s.b), r: s.a % s.b };
        if (c.id === 'frame') s = ET.commitFrame(s, Math.max(0, q - 1)); // un pari quelconque, pas forcément juste
        else if (c.id === 'handle') s = ET.commitCount(ET.setCount(s, s.a), s.a);
        else if (c.id === 'exact') s = r === 0 ? ET.claimExact(s) : ET.commitFrame(s, q);
        else if (c.id === 'next') s = ET.addEggs(s);
        else if (c.id === 'claim') s = ET.answerClaim(s, false);
        else throw new Error(`étape inconnue ${c.id}`);
      }
      expect(ET.discoveryReady(s)).toBe(true);
      expect(ET.coachOf(s)).toBeNull();
      expect(seen[0]).toBe('frame');
    });
  }
  it('le guide ne montre que des commandes (aucun nombre de la réponse dans la cible)', () => {
    const s = ET.init({ a: 50, b: 12, world: 'carton' });
    expect(ET.coachOf(s)).toEqual({ id: 'frame', target: '[data-et-frame-handle]', gesture: 'drag' });
    const placed = ET.commitFrame(s, 4);
    expect(ET.coachOf(placed)).toEqual({ id: 'handle', target: '[data-et-handle]', gesture: 'drag' });
  });
});

describe('fraction-knife — coachOf', () => {
  const play = (cfg, cuts) => {
    let s = FK.init(cfg);
    const seen = [];
    for (let i = 0; i < 60; i += 1) {
      const c = FK.coachOf(s);
      if (!c) break;
      seen.push(c.id);
      expect(c.target).toMatch(/^\[data-[a-z-]+(="[^"]+")?\]$/);
      if (c.id === 'knife') { for (const d of cuts[s.stage]) s = FK.commitD(s, d); }
      else if (c.id === 'claim') s = FK.openClaim(s);
      else if (c.id === 'claim-knife') s = FK.commitD(s, s.claim.b);
      else if (c.id === 'judge') s = FK.answerClaim(s, FK.claimVerdict(s).ok ? 'true' : 'false');
      else if (c.id === 'next') s = FK.openNext(s);
      else if (c.id === 'cursor') s = FK.setCursor(s, 9);
      else if (c.id === 'plant') s = FK.togglePin(s, s.cursor);
      else if (c.id === 'start') s = FK.startKnife(s);
      else throw new Error(`étape inconnue ${c.id}`);
    }
    return { s, seen };
  };
  it('مبتدئ (plateau) : suivre le guide mène à la découverte', () => {
    const { s, seen } = play({ world: 'tray', share: [3, 5], start: 5, max: 20, claim: [4, 6] }, [[10, 15]]);
    expect(seen).toEqual(['knife', 'claim', 'claim-knife', 'judge']);
    expect(FK.discoveryReady(s)).toBe(true);
  });
  it('متقدم (papier) : cibles, cadeau, épingles puis couteau mènent à la découverte', () => {
    const { s, seen } = play({
      world: 'paper', share: [3, 5], start: 5, max: 20, targets: [[6, 10], [12, 20]], then: { share: [27, 45], start: 45, max: 45, predict: true },
    }, [[10, 20], [5]]);
    expect(seen).toEqual(['knife', 'next', 'cursor', 'plant', 'start', 'knife']);
    expect(FK.discoveryReady(s)).toBe(true);
  });
  it('ne nomme jamais la réponse : la carte, pas vrai/faux ; le couteau, pas un d', () => {
    let s = FK.openClaim(FK.commitD(FK.commitD(FK.init({ world: 'tray', share: [3, 5], start: 5, max: 20, claim: [4, 6] }), 10), 6));
    expect(FK.coachOf(s)).toEqual({ id: 'judge', target: '[data-fk-claim]', gesture: 'tap' });
    s = FK.answerClaim(s, FK.claimVerdict(s).ok ? 'true' : 'false');
    expect(FK.coachOf(s)).toBeNull();
  });
});

describe('digit-cards — coachOf', () => {
  it('grid : suivre le guide, l\'élève touchant juste, finit les trois coloriages', () => {
    let s = DC.init({ mode: 'grid', from: 0, to: 48, columns: 7, divisors: [2, 5, 3] });
    const seen = new Set();
    for (let i = 0; i < 200; i += 1) {
      const c = DC.coachOf(s);
      if (!c) break;
      seen.add(c.id);
      expect(c.target).toMatch(SELECTOR);
      if (c.id === 'colouring' || c.id === 'nextColouring') {
        const d = Number(/"(\d+)"/.exec(c.target)[1]);
        expect(s.divisors).toContain(d);
        s = DC.openColouring(s, s.divisors.indexOf(d));
      } else if (c.id === 'reveal') s = DC.reveal(s);
      else if (c.id === 'cell') s = DC.tapCell(s, DC.missingOf(s, DC.activeDivisor(s))[0]);
      else throw new Error(`étape inconnue ${c.id}`);
    }
    expect(DC.discoveryReady(s)).toBe(true);
    expect([...seen]).toEqual(expect.arrayContaining(['colouring', 'cell', 'reveal', 'nextColouring']));
  });
  it('grid : jamais une case précise', () => {
    const s = DC.openColouring(DC.init({ mode: 'grid' }), 0);
    expect(DC.coachOf(s)).toEqual({ id: 'cell', target: '[data-dc-table]', gesture: 'tap' });
  });
  it('cards : suivre le guide, l\'élève jugeant juste, atteint les cibles et l\'échange', () => {
    let s = DC.init({ mode: 'cards', digits: [4, 5, 9, 3], divisors: [2, 3, 5, 4, 9] });
    const seen = new Set();
    for (let i = 0; i < 100; i += 1) {
      const c = DC.coachOf(s);
      if (!c) break;
      seen.add(c.id);
      expect(c.target).toMatch(SELECTOR);
      if (c.id === 'card') {
        const ci = DC.trayOf(s)[0];
        expect(c.target).toBe(`[data-dc-card="${s.digits[ci]}"]`);
        s = DC.placeCard(s, ci, s.slots.indexOf(null));
      } else if (c.id === 'lamp') {
        const d = Number(/"(\d+)"/.exec(c.target)[1]);
        expect(s.lamps[d]).toBeFalsy();
        s = DC.claim(s, d, DC.division(DC.numberOf(s), d).divides);
      } else if (c.id === 'submit') {
        const d = DC.taskDivisor(s);
        if (DC.targetPossible(s, d)) {
          const best = DC.validArrangements(s.digits, d).pop();
          const slots = String(best).split('').map((x) => s.digits.indexOf(Number(x)));
          s = DC.submitLargest({ ...s, slots }, d);
        } else s = DC.sayNone(s, d);
      } else if (c.id === 'task') {
        const d = Number(/"(\d+)"/.exec(c.target)[1]);
        expect(DC.taskDone(s, d)).toBe(false);
        s = DC.selectTask(s, s.divisors.indexOf(d));
      } else if (c.id === 'swap') {
        let done = null;
        for (let a = 0; a < 4 && !done; a += 1) for (let b = 0; b < 4 && !done; b += 1) {
          if (a === b) continue;
          const t = DC.moveSlot(s, a, b);
          if (t.swap) done = t;
        }
        expect(done).not.toBeNull();
        s = done;
      } else throw new Error(`étape inconnue ${c.id}`);
    }
    expect(DC.discoveryReady(s)).toBe(true);
    expect([...seen]).toEqual(expect.arrayContaining(['card', 'lamp', 'submit', 'task', 'swap']));
  });
  it('cards : « لا يوجد » n\'est jamais montré, l\'état vide montre une carte du plateau', () => {
    const s = DC.init({ mode: 'cards' });
    expect(DC.coachOf(s).id).toBe('card');
  });
});
