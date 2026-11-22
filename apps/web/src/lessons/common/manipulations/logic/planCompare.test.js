import { describe, it, expect } from 'vitest';
import * as AF from '@smarter-academy/core/arithmetic/affine.js';
import * as L from './planCompare';

/**
 * plan-compare — la logique PURE du laboratoire « deux tarifs face à face » (unité 7, leçon 5 ; réutilisé
 * par la synthèse). Sur les nombres du manuel (نشاط 4 : 2000 + 200 par match, 7 matchs → 3400 DA,
 * 4800 DA → 14 matchs ; contre le billet seul 400 DA → égalité à 10 matchs) et sur trois formules.
 */
const T = (p) => L.numText(p);
const ACT4 = { plans: '200x+2000|400x', mode: 'model|compare', ask: 'x:7|y:4800' };

const build = (s, once, each) => {
  let st = s;
  if (once) st = L.place(st, once, 'once');
  if (each) st = L.place(st, each, 'each');
  return st;
};
const modelled = (props = ACT4) => L.check(build(L.init(props), 'fixed', 'unit'));

describe('lecture des props', () => {
  it('une à trois formules, distinctes, positives', () => {
    expect(L.parsePlans('200x+2000|400x').map((p) => p.id)).toEqual(['A', 'B']);
    expect(() => L.parsePlans('')).toThrow();
    expect(() => L.parsePlans('x|2x|3x|4x')).toThrow();
    expect(() => L.parsePlans('2x+5|2x+5')).toThrow();
    expect(() => L.parsePlans('-2x+5')).toThrow();
  });
  it('les modes ; une seule formule ne se compare pas', () => {
    expect(L.parseModes('model|compare', 2)).toEqual(['model', 'compare']);
    expect(L.parseModes('compare', 2)).toEqual(['compare']);
    expect(L.parseModes('model|compare', 1)).toEqual(['model']);
    expect(() => L.parseModes('race', 2)).toThrow();
  });
  it('les cibles ; un budget sans nombre entier d\'unités est une erreur de contenu', () => {
    expect(L.parseAsk('x:7|y:4800').map((a) => [a.axis, T(a.v)])).toEqual([['x', '7'], ['y', '4800']]);
    expect(() => L.init({ plans: '200x+2000', mode: 'model', ask: 'y:4900' })).toThrow();
    expect(() => L.parseAsk('x:7,5')).toThrow();
  });
});

describe('نشاط 4 — la fenêtre, l\'enveloppe, la grille', () => {
  const s = L.init(ACT4);
  it('fenêtre : deux fois le croisement (10 → 20), tous les coûts', () => {
    expect(s.win).toEqual({ xMax: 20, yMax: 8000 });
  });
  it('enveloppe : le billet avant 10, l\'abonnement après', () => {
    expect(s.env.segments.map((g) => [T(g.from), T(g.to), g.plan])).toEqual([['0', '10', 1], ['10', '20', 0]]);
    expect(s.env.breaks.map((b) => [T(b.x), T(b.y)])).toEqual([['10', '4000']]);
  });
  it('le croisement est un nœud de la grille de la marque', () => {
    const { dx, dy } = s.grid;
    const b = s.env.breaks[0];
    expect(L.toNumber(b.x) / L.toNumber(dx) % 1).toBe(0);
    expect(L.toNumber(b.y) / L.toNumber(dy) % 1).toBe(0);
  });
});

describe('MODÈLE — porter les montants dans la facture', () => {
  it('le forfait payé x fois est refusé avec son témoin (MISC-TARRID-JUZ-THABIT)', () => {
    const s = L.check(build(L.init(ACT4), 'unit', 'fixed'));
    expect(s.accepted).toBe(false);
    expect(s.verdict.issues.map((i) => i.reason).sort()).toEqual(['fixedTimes', 'rateOnce']);
    expect(s.verdict.issues.find((i) => i.reason === 'fixedTimes').misconception).toBe('MISC-TARRID-JUZ-THABIT');
    // pour 7 matchs : 2000 × 7 + 200 = 14200 au lieu de 3400
    expect(T(s.verdict.mine)).toBe('14200');
    expect(T(s.verdict.story)).toBe('3400');
  });
  it('un montant oublié est refusé', () => {
    const s = L.check(build(L.init(ACT4), null, 'unit'));
    expect(s.verdict.issues).toEqual([{ chip: 'fixed', reason: 'missing' }]);
  });
  it('le bon modèle est accepté et écrit f(x) = 200x + 2000', () => {
    const s = modelled();
    expect(s.accepted).toBe(true);
    expect(s.verdict.tex).toBe('200x + 2000');
    expect(L.fnTex(s, 0)).toBe('f(x) = 200x + 2000');
  });
  it('placer un montant dans une case occupée renvoie l\'autre à la réserve', () => {
    let s = build(L.init(ACT4), 'fixed', null);
    s = L.place(s, 'unit', 'once');
    expect(s.slots).toEqual({ once: 'unit', each: null });
    expect(L.reserve(s)).toEqual(['fixed']);
  });
  it('rien ne se mesure avant le modèle ; les cibles 7 et 4800 se rencontrent', () => {
    expect(L.commitX(L.init(ACT4), 7).trials).toEqual([]);
    let s = modelled();
    expect(L.modelDone(s)).toBe(false);
    s = L.commitX(s, 7);
    expect(T(s.trials[0].costs[0])).toBe('3400');
    expect(L.asksDone(s)).toEqual([true, false]);
    s = L.commitX(s, 14);
    expect(T(s.trials[1].costs[0])).toBe('4800');
    expect(L.modelDone(s)).toBe(true);
    expect(L.canCompare(s)).toBe(true);
  });
  it('les lignes écrites : image et antécédent', () => {
    const s = modelled();
    expect(L.costTex(s, 0, 7)).toBe('f(7) = 200 \\times 7 + 2000 = 3400');
    expect(L.antecedentLines(s, L.parseValue('4800'))).toEqual(['200x + 2000 = 4800', '200x = 2800', 'x = 14']);
  });
});

describe('COMPARER — la marque et la peinture', () => {
  const ready = () => {
    let s = modelled();
    s = L.commitX(L.commitX(s, 7), 14);
    return L.openCompare(s);
  };
  it('la comparaison ne s\'ouvre qu\'après le premier laboratoire ; le retour garde tout', () => {
    expect(L.openCompare(modelled()).stage).toBe('model');
    const s = ready();
    expect(s.stage).toBe('compare');
    const back = L.backToModel(s);
    expect(back.stage).toBe('model');
    expect(back.trials.length).toBe(2);
  });
  it('une marque hors du croisement est refusée avec les deux coûts', () => {
    const m = L.judgePin(ready(), 8, 3600);
    expect(m.ok).toBe(false);
    expect(m.kind).toBe('unequal');
    expect(m.costs.map(T)).toEqual(['3600', '3200']);
    expect(L.judgePin(ready(), 10, 3600).kind).toBe('offLine');
  });
  it('la marque au croisement (10 ; 4000) est acceptée — affine.comparePlans', () => {
    let s = L.placeMark(ready(), 10, 4000);
    expect(s.last.kind).toBe('cross');
    expect(L.marksDone(s)).toBe(true);
    const c = AF.comparePlans(s.plans[0].f, s.plans[1].f);
    expect([T(c.x), T(c.y)]).toEqual(['10', '4000']);
    // « لا تتساويان » est refusé : l'ordre s'inverse entre 0 et 20
    s = L.claimNoCross(s);
    expect(s.last.kind).toBe('noCrossKo');
    expect(s.last.witness).toMatchObject({ at0: 1, atMax: 0 });
  });
  it('peindre : refus avec un essai de l\'élève comme témoin, puis acceptation', () => {
    let s = L.placeMark(ready(), 10, 4000);
    s = L.commitX(s, 4);
    s = L.paint(s, 0, 0);
    expect(s.last.kind).toBe('paintKo');
    expect(T(s.last.x)).toBe('4');
    expect(s.last.costs.map(T)).toEqual(['2800', '1600']);
    s = L.paint(s, 0, 1);
    s = L.paint(s, 1, 0);
    expect(L.paintDone(s)).toBe(true);
    // contraste : un essai de comparaison de chaque côté
    expect(L.discoveryReady(s)).toBe(false);
    s = L.commitX(s, 15);
    expect(L.contrastOk(s)).toBe(true);
    expect(L.discoveryReady(s)).toBe(true);
  });
  it('on ne peint pas avant d\'avoir marqué le croisement', () => {
    const s = L.paint(ready(), 0, 1);
    expect(s.painted).toEqual({});
  });
  it('les lignes : l\'équation et l\'inéquation du manuel', () => {
    const s = ready();
    const e = L.equalityLines(s, 0, 1);
    expect(e.lines).toEqual(['f(x) = g(x)', '200x + 2000 = 400x', '200x = 2000', 'x = 10']);
    expect(e.check).toBe('f(10) = g(10) = 4000');
    const q = L.inequalityLines(s, 0, 1);
    expect(q.lines).toEqual(['f(x) < g(x)', '200x + 2000 < 400x', '2000 < 200x', 'x > 10']);
    const r = L.inequalityLines(s, 1, 0);
    expect(r.lines).toEqual(['g(x) < f(x)', '400x < 200x + 2000', '200x < 2000', 'x < 10']);
  });
});

describe('trois formules, parallèles, croisement non entier', () => {
  it('trois formules : deux changements, trois intervalles, une égalité « au-dessus »', () => {
    // vélo 300/h ; carte 500 + 150/h ; forfait 2400 la journée : 300x = 500 + 150x → x = 10/3 ;
    // 500 + 150x = 2400 → x = 38/3 ; 300x = 2400 → x = 8 (au-dessus de la carte)
    const s = L.init({ plans: '300x|150x+500|2400', mode: 'compare', xMax: '16' });
    expect(s.env.segments.map((g) => g.plan)).toEqual([0, 1, 2]);
    expect(s.env.breaks.map((b) => T(b.x))).toEqual(['10/3', '38/3']);
    expect(L.judgePin(s, 8, 2400).kind).toBe('crossAbove');
    // la grille de la marque atteint 10/3 exactement
    expect(L.toNumber(s.env.breaks[0].x) / L.toNumber(s.grid.dx) % 1).toBeCloseTo(0, 9);
    let st = L.placeMark(L.placeMark(s, s.env.breaks[0].x, s.env.breaks[0].y), s.env.breaks[1].x, s.env.breaks[1].y);
    expect(L.marksDone(st)).toBe(true);
    st = [0, 1, 2].reduce((acc, i) => L.paint(acc, i, i), st);
    expect(L.paintDone(st)).toBe(true);
  });
  it('deux formules parallèles : aucune égalité, « لا تتساويان » accepté', () => {
    const s = L.init({ plans: '100x+300|100x+800', mode: 'compare' });
    expect(s.env.breaks).toEqual([]);
    expect(L.marksDone(s)).toBe(false);
    const c = L.claimNoCross(s);
    expect(c.last.kind).toBe('noCrossOk');
    expect(L.marksDone(c)).toBe(true);
  });
  it('mode compare seul : rien à modéliser, x se mesure tout de suite', () => {
    const s = L.commitX(L.init({ plans: '200x+2000|400x', mode: 'compare' }), 3);
    expect(s.stage).toBe('compare');
    expect(s.trials.length).toBe(1);
  });
  it('une seule formule : le modèle seul ; la découverte = modèle + deux essais', () => {
    let s = L.init({ plans: '150x+500', mode: 'model|compare' });
    expect(s.modes).toEqual(['model']);
    s = L.check(build(s, 'fixed', 'unit'));
    s = L.commitX(L.commitX(s, 2), 6);
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.discoveryKind(s)).toBe('model');
  });
  it('un tarif sans partie fixe n\'a qu\'un montant à porter', () => {
    const s = L.init({ plans: '400x', mode: 'model' });
    expect(s.chips).toEqual(['unit']);
    expect(L.check(L.place(s, 'unit', 'each')).accepted).toBe(true);
  });
});

describe('le dessin : la géométrie reste dans le cadre', () => {
  it('chaque segment de droite est dans la fenêtre, pour chaque formule et chaque largeur', () => {
    for (const plans of ['200x+2000|400x', '300x|150x+500|2400', '150x+500']) {
      const s = L.init({ plans, mode: 'compare' });
      for (const width of [200, 320, 640, 900]) {
        const g = L.planeGeometry({ win: s.win, width, height: 300 });
        for (const p of s.plans) {
          const seg = L.lineSegment(p.f, s.win);
          if (!seg) continue;
          for (const [x, y] of seg) {
            expect(g.px(x)).toBeGreaterThanOrEqual(0);
            expect(g.px(x)).toBeLessThanOrEqual(g.W + 1e-6);
            expect(g.py(y)).toBeGreaterThanOrEqual(-1e-6);
            expect(g.py(y)).toBeLessThanOrEqual(g.H + 1e-6);
          }
        }
      }
    }
  });
});

describe('plan-compare — défaut et balayage (2026-10-09)', () => {
  it('le x de départ n\'est ni un croisement ni une cible, et n\'est pas un essai', () => {
    const s = L.init(ACT4);
    const x = L.defaultX(s);
    expect(x).not.toBe(7);
    expect(x).not.toBe(14);
    expect(x).not.toBe(10);
    expect(s.trials).toHaveLength(0);
    const eqB = L.init({ plans: '100x+500|300x+500', mode: 'compare' });
    expect(L.defaultX(eqB)).not.toBe(0);
  });
  it('le balayage de x attend le modèle accepté puis valide chaque entier', () => {
    const m = L.init(ACT4);
    expect(L.untriedXs(m)).toHaveLength(0);
    let s = L.init({ plans: '200x+2000|400x', mode: 'compare' });
    const todo = L.untriedXs(s);
    expect(todo).toHaveLength(s.win.xMax + 1);
    for (const x of todo) s = L.commitX(s, x);
    expect(L.untriedXs(s)).toHaveLength(0);
    expect(L.contrastOk(s)).toBe(true);
  });
});
