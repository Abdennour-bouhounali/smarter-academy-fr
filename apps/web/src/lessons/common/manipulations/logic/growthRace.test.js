import { describe, it, expect } from 'vitest';
import * as linear from '@smarter-academy/core/arithmetic/linear.js';
import * as G from './growthRace';

const F = (p) => linear.fracText(p);

/**
 * growth-race — la logique RÉELLE que GrowthRace.jsx importe, sur les nombres du manuel
 * (طرائق p. 49 : le père de 36 ans et ses trois enfants 4, 6, 8), ceux du niveau
 * débutant (30 et 6, « ضعف عمر الابن ») et ceux que la synthèse passe (la piscine :
 * 75x et 560 + 5x).
 */
describe('growth-race — lire la structure de l’histoire', () => {
  it('chaque personne est un élément ; un « x » nu fait vieillir le nombre qui le précède', () => {
    const m = G.parseModel('36+x', '4+x+6+x+8+x');
    expect(m.op).toBe('add');
    expect(m.elements.map((e) => [e.id, e.kind, F(e.c)])).toEqual([
      ['L0', 'age', '36'], ['R0', 'age', '4'], ['R1', 'age', '6'], ['R2', 'age', '8'],
    ]);
  });

  it('k(…) est un groupe (le « ضعف »), et la piscine fait des tarifs et un abonnement', () => {
    const b = G.parseModel('30+x', '2(6+x)');
    expect(F(b.sides.right.groups[0].k)).toBe('2');
    expect(b.elements.find((e) => e.id === 'R0')).toMatchObject({ kind: 'age', group: 0 });
    const p = G.parseModel('75x', '560+5x');
    expect(p.op).toBe('mul');
    expect(p.elements.map((e) => [e.id, e.kind, F(e.c)])).toEqual([['L0', 'rate', '75'], ['R0', 'fixed', '560'], ['R1', 'rate', '5']]);
    const e12 = G.parseModel('43+x', '2(4+x+7+x)');
    expect(e12.elements.filter((e) => e.side === 'right').map((e) => F(e.c))).toEqual(['4', '7']);
  });

  it('refuse ce qui n’est pas une course : un mélange âges/tarifs, rien qui grandit, une différence', () => {
    expect(() => G.parseModel('30+x', '5x')).toThrow();
    expect(() => G.parseModel('30', '12')).toThrow();
    expect(() => G.parseModel('30-x', '6+x')).toThrow();
    expect(() => G.parseModel('30+x', '2(6+x')).toThrow();
  });

  it('les membres de l’histoire sont ceux du manuel, en { a, b } exacts', () => {
    const m = G.parseModel('36+x', '4+x+6+x+8+x');
    expect(linear.linLatex(G.storyLin(m, 'left'))).toBe('x + 36');
    expect(linear.linLatex(G.storyLin(m, 'right'))).toBe('3x + 18');
    const b = G.parseModel('30+x', '2(6+x)');
    expect(linear.linLatex(G.storyLin(b, 'right'))).toBe('2x + 12');
    const p = G.parseModel('75x', '560+5x');
    expect(linear.linLatex(G.storyLin(p, 'right'))).toBe('5x + 560');
    const e12 = G.parseModel('43+x', '2(4+x+7+x)');
    expect(linear.linLatex(G.storyLin(e12, 'right'))).toBe('4x + 22');
  });

  it('l’équation s’écrit avec SA structure, comme le manuel', () => {
    const m = G.parseModel('36+x', '4+x+6+x+8+x');
    expect(G.modelTex(m, G.storyCarried(m))).toBe('36 + x = (4 + x) + (6 + x) + (8 + x)');
    expect(G.modelTex(m, ['L0', 'R0', 'R2'])).toBe('36 + x = (4 + x) + 6 + (8 + x)');
    expect(G.modelTex(m, [])).toBe('36 = 4 + 6 + 8');
    const b = G.parseModel('30+x', '2(6+x)');
    expect(G.modelTex(b, G.storyCarried(b))).toBe('30 + x = 2(6 + x)');
    expect(G.modelTex(b, ['L0'])).toBe('30 + x = 2 \\times 6');
    const p = G.parseModel('75x', '560+5x');
    expect(G.modelTex(p, G.storyCarried(p))).toBe('75x = 560 + 5x');
    const e12 = G.parseModel('43+x', '2(4+x+7+x)');
    expect(G.modelTex(e12, G.storyCarried(e12))).toBe('43 + x = 2\\left[(4 + x) + (7 + x)\\right]');
  });
});

describe('growth-race — CONSTRUIRE le modèle (porter le jeton)', () => {
  it('un jeton par élément ; un second sur le même est refusé', () => {
    let lab = G.init('36+x', '4+x+6+x+8+x');
    expect(G.canCarry(lab, 'R1')).toBe(true);
    lab = G.carry(lab, 'R1');
    expect(G.canCarry(lab, 'R1')).toBe('already');
    expect(G.carry(lab, 'R1')).toBe(lab);
    lab = G.remove(lab, 'R1');
    expect(lab.carried).toEqual([]);
  });

  it('« تحقّق » refuse un enfant qui n’a pas vieilli — MISC-TARRID-MAJHUL-WAHID rendu physique', () => {
    let lab = G.init('36+x', '4+x+6+x+8+x');
    for (const id of ['L0', 'R0', 'R2']) lab = G.carry(lab, id);
    lab = G.check(lab);
    expect(lab.verdict).toEqual({ ok: false, issues: [{ id: 'R1', reason: 'notGrown' }] });
    expect(G.canRace(lab)).toBe(false);
    expect(G.openRace(lab).stage).toBe('build');
    lab = G.check(G.carry(lab, 'R1'));
    expect(lab.verdict.ok).toBe(true);
    expect(G.openRace(lab).stage).toBe('race');
  });

  it('« startWith: race » pose le modèle de l’histoire, vérifié', () => {
    const lab = G.init('75x', '560+5x', { startWith: 'race' });
    expect(lab.stage).toBe('race');
    expect(lab.carried).toEqual(['L0', 'R1']);
    expect(lab.verdict.ok).toBe(true);
  });

  it('une modification après « تحقّق » efface le verdict : la course se ferme', () => {
    let lab = G.init('30+x', '2(6+x)');
    lab = G.check(G.carry(G.carry(lab, 'L0'), 'R0'));
    expect(G.canRace(lab)).toBe(true);
    lab = G.remove(lab, 'R0');
    expect(lab.verdict).toBeNull();
    expect(G.canRace(lab)).toBe(false);
  });

  it('la piscine : l’abonnement payé à chaque séance et le ticket payé une fois sont refusés', () => {
    let lab = G.init('75x', '560+5x');
    for (const id of ['L0', 'R0']) lab = G.carry(lab, id);
    expect(G.verifyModel(lab)).toEqual({ ok: false, issues: [{ id: 'R0', reason: 'fixedTimes' }, { id: 'R1', reason: 'rateOnce' }] });
    lab = G.carry(G.remove(lab, 'R0'), 'R1');
    expect(G.verifyModel(lab).ok).toBe(true);
  });
});

describe('growth-race — COURIR (étirer x)', () => {
  const race = (l, r) => G.openRace(G.check(G.storyCarried(G.parseModel(l, r)).reduce(G.carry, G.init(l, r))));

  it('le manuel : x = 9, et l’التحقق 45 = 13 + 15 + 17', () => {
    const lab = race('36+x', '4+x+6+x+8+x');
    expect(G.solution(lab.model)).toMatchObject({ kind: 'natural' });
    expect(F(G.solution(lab.model).x)).toBe('9');
    const t = G.trialAt(lab.model, 9);
    expect([F(t.left), F(t.right), t.rel]).toEqual(['45', '45', '=']);
    expect(G.partsAt(lab.model, 'right', 9).map((p) => F(p.value))).toEqual(['13', '15', '17']);
    expect(G.trialAt(lab.model, 3).rel).toBe('>');
    expect(G.trialAt(lab.model, 12).rel).toBe('<');
    expect(G.solvingLines(lab.model).lines).toEqual(['36 + x = 3x + 18', '2x = 18', 'x = 9']);
    expect(G.readoutTex(lab.model, 'left', 9).tex).toBe('36 + 9 = 45');
    expect(G.readoutTex(lab.model, 'right', 9).tex).toBe('13 + 15 + 17 = 45');
    expect(G.readoutTex(G.parseModel('30+x', '2(6+x)'), 'right', 18).tex).toBe('2 \\times 24 = 48');
    expect(G.readoutTex(G.parseModel('75x', '560+5x'), 'right', 8).tex).toBe('560 + 5 \\times 8 = 600');
    expect(G.readoutTex(G.parseModel('75x', '560+5x'), 'left', 8).tex).toBe('75 \\times 8 = 600');
    expect(G.readoutTex(G.parseModel('43+x', '2(4+x+7+x)'), 'right', 7).tex).toBe('2 \\times (11 + 14) = 50');
  });

  it('le niveau débutant : x = 18 (48 = 2 × 24)', () => {
    const lab = race('30+x', '2(6+x)');
    expect(F(G.solution(lab.model).x)).toBe('18');
    const t = G.trialAt(lab.model, 18);
    expect([F(t.left), F(t.right)]).toEqual(['48', '48']);
    expect(G.partsAt(lab.model, 'right', 18)[0]).toMatchObject({ factor: expect.anything() });
    expect(F(G.partsAt(lab.model, 'right', 18)[0].value)).toBe('24');
  });

  it('un essai est un x validé, mémorisé une seule fois ; rien de négatif ni de non entier', () => {
    let lab = race('36+x', '4+x+6+x+8+x');
    lab = G.commitTrial(lab, 4);
    lab = G.commitTrial(lab, 4);
    lab = G.commitTrial(lab, -1);
    lab = G.commitTrial(lab, 2.5);
    expect(lab.trials.map((t) => t.x)).toEqual([4]);
  });

  it('la découverte exige la rencontre ET un essai de chaque côté (contraste)', () => {
    let lab = race('36+x', '4+x+6+x+8+x');
    const range = G.xRange(lab.model);
    expect(range).toEqual({ min: 0, max: 13 });
    lab = G.commitTrial(lab, 9);
    expect(G.discoveryReady(lab, range)).toBe(false);
    lab = G.commitTrial(lab, 5);
    expect(G.discoveryReady(lab, range)).toBe(false);
    lab = G.commitTrial(lab, 11);
    expect(G.discoveryReady(lab, range)).toBe(true);
    expect(G.discoveryKind(lab.model, range)).toBe('meet');
    expect(G.leaders(lab.model)).toEqual({ before: '>', after: '<' });
    // sans la rencontre elle-même, deux côtés ne suffisent pas
    let other = race('36+x', '4+x+6+x+8+x');
    for (const x of [0, 5, 11, 13]) other = G.commitTrial(other, x);
    expect(G.discoveryReady(other, range)).toBe(false);
  });

  it('la piscine (synthèse) : égales à 8 séances (600 دج), la formule 2 moins chère À PARTIR DE 9', () => {
    const lab = race('75x', '560+5x');
    const eight = G.trialAt(lab.model, 8);
    expect([F(eight.left), F(eight.right), eight.rel]).toEqual(['600', '600', '=']);
    expect(G.trialAt(lab.model, 9).rel).toBe('>');
    const a = G.answer(lab.model, 'greater');
    expect(a.first).toBe(9);
    expect(a.ray).toMatchObject({ kind: 'ray', rel: '>' });
    expect(F(a.ray.bound)).toBe('8');
    expect(a.toInfinity).toBe(true);
    expect(G.inequalityLines(lab.model, '>').lines).toEqual(['75x > 560 + 5x', '70x > 560', 'x > 8']);
    expect(G.xRange(lab.model)).toEqual({ min: 0, max: 12 });
  });

  it('domaine naturel : une solution non entière se croise ENTRE deux graduations', () => {
    // le père a 37 ans : 37 + x = 3x + 18 ⇔ x = 19/2 — aucun nombre entier d'années
    let lab = race('37+x', '4+x+6+x+8+x');
    expect(G.solution(lab.model).kind).toBe('fraction');
    const range = G.xRange(lab.model);
    expect(G.discoveryKind(lab.model, range)).toBe('between');
    for (let x = 0; x <= range.max; x += 1) expect(G.trialAt(lab.model, x).rel).not.toBe('=');
    lab = G.commitTrial(lab, 9);
    expect(G.discoveryReady(lab, range)).toBe(false);
    lab = G.commitTrial(lab, 10);
    expect(G.discoveryReady(lab, range)).toBe(true);
    expect(G.valueText(G.solution(lab.model).x)).toBe('9,5');
  });

  it('domaine naturel : une solution négative est dans le PASSÉ — l’ordre ne change jamais sur la règle', () => {
    // le père a 36 ans, son fils 14 : « ثلاثة أضعاف » ⇔ 36 + x = 3(14 + x) ⇔ x = −3
    let lab = race('36+x', '3(14+x)');
    expect(G.solution(lab.model).kind).toBe('negative');
    expect(F(G.solution(lab.model).x)).toBe('-3');
    const range = G.xRange(lab.model);
    for (let x = 0; x <= range.max; x += 1) expect(G.trialAt(lab.model, x).rel).toBe('<');
    for (const x of [2, 5]) lab = G.commitTrial(lab, x);
    expect(G.discoveryReady(lab, range)).toBe(false);
    lab = G.commitTrial(lab, 0);
    expect(G.discoveryReady(lab, range)).toBe(true);
    expect(G.discoveryKind(lab.model, range)).toBe('negative');
  });

  it('mêmes pentes : jamais égales (« none »), et une seule écriture « ≠ »', () => {
    const lab = race('30+x', '6+x');
    expect(G.solution(lab.model).kind).toBe('none');
    expect(G.solvingLines(lab.model).kind).toBe('none');
  });

  it('la règle par défaut montre toujours la rencontre et au moins quatre crans au-delà', () => {
    for (const [l, r] of [['36+x', '4+x+6+x+8+x'], ['30+x', '2(6+x)'], ['75x', '560+5x'], ['43+x', '2(4+x+7+x)'], ['37+x', '4+x+6+x+8+x']]) {
      const m = G.parseModel(l, r);
      const s = linear.toNumber(G.solution(m).x);
      const { max } = G.xRange(m);
      expect(max, `${l} | ${r}`).toBeGreaterThanOrEqual(Math.ceil(s) + 4);
    }
    expect(G.xRange(G.parseModel('36+x', '4+x+6+x+8+x'), 20).max).toBe(20);
    // une règle trop courte est prolongée : la rencontre n'est jamais cachée
    expect(G.xRange(G.parseModel('36+x', '4+x+6+x+8+x'), 5).max).toBe(11);
  });

  it('balayage : sur toute la règle, l’ordre est celui de l’équation résolue (jamais de flottant)', () => {
    for (const [l, r] of [['36+x', '4+x+6+x+8+x'], ['30+x', '2(6+x)'], ['75x', '560+5x'], ['43+x', '2(4+x+7+x)']]) {
      const m = G.parseModel(l, r);
      const s = G.solution(m).x;
      const lead = G.leaders(m);
      for (let x = 0; x <= G.xRange(m).max; x += 1) {
        const c = linear.cmp(linear.frac(x), s);
        expect(G.trialAt(m, x).rel, `${l} | ${r} @ ${x}`).toBe(c < 0 ? lead.before : c > 0 ? lead.after : '=');
      }
    }
  });
});

describe('x par défaut de la course (ni rencontre, ni réponse, jamais un essai)', () => {
  it('ne tombe pas sur l\'égalité et la question posée n\'y est pas déjà vraie', () => {
    const cases = [['36+x', '4+x+6+x+8+x', 'equal'], ['75x', '560+5x', 'greater'], ['75x', '560+5x', 'less'], ['2x', '2x+3', 'equal']];
    for (const [l, r, goal] of cases) {
      const lab = G.init(l, r, { startWith: 'race' });
      const range = G.xRange(lab.model);
      const x = G.defaultX(lab.model, range, goal);
      expect(x).toBeGreaterThanOrEqual(range.min);
      expect(x).toBeLessThanOrEqual(range.max);
      const rel = G.trialAt(lab.model, x).rel;
      if (l !== '2x') expect(rel).not.toBe('=');
      if (goal === 'greater' && l === '75x') expect(rel).not.toBe('>');
      expect(lab.trials).toEqual([]);
    }
  });
  it('balayer la règle = les essais de la main (commitTrial), la découverte s\'ouvre', () => {
    let lab = G.init('36+x', '4+x+6+x+8+x', { startWith: 'race' });
    const range = G.xRange(lab.model);
    for (let x = range.min; x <= range.max; x += 1) lab = G.commitTrial(lab, x);
    expect(lab.trials).toHaveLength(range.max - range.min + 1);
    expect(G.discoveryReady(lab, range)).toBe(true);
  });
});
