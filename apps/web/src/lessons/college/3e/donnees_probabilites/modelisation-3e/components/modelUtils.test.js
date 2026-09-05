import { describe, it, expect } from 'vitest';
import {
  proportional, affine, square, custom, none, evaluate, tableOf, residual, verdicts, agreesWithAll, bestModel,
  fitAffine, formatModel, capped, inDomain, interpretResult, breakEven, cheapest, magnitudeOk, sortData,
  niceStep, planeFor, parseTokens, sameFunction,
} from './modelUtils';
import { TROTTINETTE, SITUATIONS, RESERVOIR, DATASETS, FETE } from './situationsData';

describe('modèles et évaluation', () => {
  it('chaque famille s’évalue, et none renvoie null', () => {
    expect(evaluate(proportional(0.15), 20)).toBe(3);
    expect(evaluate(affine(0.15, 1), 20)).toBe(4);
    expect(evaluate(square(1), 4)).toBe(16);
    expect(evaluate(square(2), 3)).toBe(18);
    expect(evaluate(custom((x) => x * 3 - 1), 2)).toBe(5);
    expect(evaluate(none(), 2)).toBeNull();
    expect(tableOf(affine(-5, 60), [0, 12])).toEqual([{ x: 0, y: 60 }, { x: 12, y: 0 }]);
  });

  it('un modèle doit être d’accord avec TOUS les tickets — un seul accord ne prouve rien', () => {
    const t = TROTTINETTE.tickets;
    const byId = Object.fromEntries(TROTTINETTE.candidates.map((c) => [c.id, c.model]));
    expect(agreesWithAll(byId.aff, t)).toBe(true);
    expect(agreesWithAll(byId.prop, t)).toBe(false);
    expect(verdicts(byId.prop, t).filter((v) => v.ok)).toHaveLength(0);
    // « durée + 1 » ne colle à aucun ticket ; « 1,15 × durée » non plus
    expect(agreesWithAll(byId.plus1, t)).toBe(false);
    expect(agreesWithAll(byId.x115, t)).toBe(false);
    expect(residual(byId.aff, t)).toBe(0);
    expect(residual(none(), t)).toBe(Infinity);
    expect(bestModel(TROTTINETTE.candidates.map((c) => c.model), t).model).toEqual(byId.aff);
  });

  it('bestModel renvoie « aucun modèle simple » pour la température', () => {
    const temp = DATASETS.find((d) => d.id === 'temperature');
    const cands = [proportional(1.5), affine(2, -4), square(0.1)];
    expect(bestModel(cands, temp.points).model.kind).toBe('none');
    for (const d of DATASETS) {
      if (d.truth.kind === 'none') continue;
      expect(agreesWithAll(d.truth, d.points)).toBe(true);
    }
  });

  it('fitAffine retrouve le modèle depuis deux points, proportionnel quand b = 0', () => {
    expect(fitAffine({ x: 5, y: 1.75 }, { x: 20, y: 4 })).toEqual(affine(0.15, 1));
    expect(fitAffine({ x: 10, y: 18 }, { x: 20, y: 36 })).toEqual(proportional(1.8));
    expect(fitAffine({ x: 1, y: 1 }, { x: 1, y: 3 })).toBeNull();
  });

  it('formatModel écrit une expression lisible', () => {
    expect(formatModel(affine(0.15, 1), { variable: 't' })).toContain('t');
    expect(formatModel(proportional(3), { variable: 'n' })).toContain('3');
    expect(formatModel(square(1), { variable: 'c' })).toBe('c^2');
    expect(formatModel(none())).toBe('aucun modèle simple');
  });
});

describe('limites et interprétation', () => {
  it('le plafond de la trottinette s’applique au-delà de 46,67 min', () => {
    const c = capped(TROTTINETTE.model, TROTTINETTE.cap);
    expect(evaluate(c, 35)).toBe(6.25);
    expect(evaluate(TROTTINETTE.model, 35)).toBe(TROTTINETTE.realPaid);
    expect(evaluate(c, 50)).toBe(8);
    expect(evaluate(TROTTINETTE.model, 50)).toBe(8.5);
    expect(inDomain(35, { min: 0, max: 60 })).toBe(true);
    expect(inDomain(70, { min: 0, max: 60 })).toBe(false);
  });

  it('interpretResult : entier attendu, valeur négative, hors domaine', () => {
    expect(interpretResult(6.25, { integer: true, min: 0 })).toEqual({ kind: 'ceil', value: 7, raw: 6.25 });
    expect(interpretResult(6.25, { integer: true, min: 0, roundUp: false })).toEqual({ kind: 'floor', value: 6, raw: 6.25 });
    expect(interpretResult(-2, { min: 0 }).kind).toBe('reject');
    expect(interpretResult(70, { max: 60 }).kind).toBe('reject');
    expect(interpretResult(12, {})).toEqual({ kind: 'exact', value: 12 });
  });

  it('la fête : seuil à 30 personnes, le traiteur gagne en dessous, la salle au-dessus, égalité à 30', () => {
    expect(breakEven(FETE.salle.model, FETE.traiteur.model)).toBe(30);
    expect(cheapest([FETE.salle.model, FETE.traiteur.model], 20)).toEqual([FETE.traiteur.model]);
    expect(cheapest([FETE.salle.model, FETE.traiteur.model], 45)).toEqual([FETE.salle.model]);
    expect(cheapest([FETE.salle.model, FETE.traiteur.model], 30)).toHaveLength(2);
    expect(breakEven(square(1), affine(1, 0))).toBeNull();
  });

  it('cohérence, tri et repère adapté', () => {
    expect(magnitudeOk(6.25, 6.25)).toBe(true);
    expect(magnitudeOk(62.5, 6.25)).toBe(false);
    const s = sortData(TROTTINETTE.infos);
    expect(s.useful.map((i) => i.id)).toEqual(['debloc', 'minute', 'duree']);
    expect(s.useless).toHaveLength(4);
    expect(niceStep(60, 8)).toBe(10);
    const p = planeFor([{ x: 35, y: 6.25 }, { x: 20, y: 4 }]);
    expect(p.range.xMax).toBeGreaterThan(35);
    expect(p.range.yMax).toBeGreaterThan(6.25);
    expect(p.range.yMax / p.range.xMax).toBeLessThan(1);
    expect(p.unitY * p.range.yMax).toBeCloseTo(220, 6);
  });

  it('les situations des modules 2 et 3 obéissent à leur modèle', () => {
    expect(evaluate(SITUATIONS[0].model, 2500)).toBe(30000);
    expect(evaluate(SITUATIONS[1].model, 4)).toBe(18);
    expect(evaluate(SITUATIONS[2].model, 5)).toBe(25);
    expect(tableOf(RESERVOIR.model, RESERVOIR.xs).every((r) => r.y >= 0)).toBe(true);
    expect(evaluate(RESERVOIR.model, 12)).toBe(0);
  });
});

describe('expressions assemblées par cartes', () => {
  it('parseTokens respecte la priorité de × et accepte deux ordres équivalents', () => {
    const target = (t) => 0.15 * t + 1;
    expect(sameFunction(parseTokens(['1', '+', '0,15', '×', 't'], 't'), target)).toBe(true);
    expect(sameFunction(parseTokens(['0,15', '×', 't', '+', '1'], 't'), target)).toBe(true);
    expect(sameFunction(parseTokens(['1', '+', '0,15', '+', 't'], 't'), target)).toBe(false);
    expect(parseTokens(['1', '+'], 't')).toBeNull();
    expect(parseTokens(['+', '1'], 't')).toBeNull();
    expect(parseTokens(['1', '1'], 't')).toBeNull();
    expect(parseTokens([], 't')).toBeNull();
    expect(parseTokens(['60', '−', '5', '×', 't'], 't')(12)).toBe(0);
  });
});
