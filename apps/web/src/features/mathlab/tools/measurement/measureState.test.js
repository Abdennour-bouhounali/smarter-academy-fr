import { describe, it, expect } from 'vitest';
import * as S from './measureState.js';
import * as R from './ruleEngine.js';
import {
  INVESTIGATIONS, getInvestigation, measureAll, matchesSolution, initialParams,
  ruleVariablesFor, ruleNumbersFor, isDefinitionOf,
} from './investigations.js';

/** Un état neuf, posé sur une enquête donnée. */
function open(id) {
  return S.selectInvestigation(S.createMeasurementData(), id);
}

/** Mesurer l'objet courant après avoir réglé ses dimensions. */
function withParams(data, params) {
  return Object.entries(params).reduce((current, [key, value]) => S.setParam(current, key, value), data);
}

/** Poser une observation pour des dimensions données. */
function observeAt(data, params) {
  return S.recordObservation(withParams(data, params));
}

describe('le document neuf', () => {
  it('ouvre sur l’aire du rectangle', () => {
    expect(S.createMeasurementData().investigation).toBe('rectangle-area');
  });

  it('donne à CHAQUE enquête son objet et son tableau', () => {
    const data = S.createMeasurementData();
    for (const investigation of INVESTIGATIONS) {
      expect(data.objects[investigation.id]).toEqual(initialParams(investigation));
      expect(data.records[investigation.id]).toMatchObject({
        observations: [], rule: null, stage: 'exploring', hintsUsed: 0, tests: [],
      });
    }
  });

  it('accepte l’amorce d’une leçon', () => {
    expect(S.createMeasurementData({ investigation: 'triangle-area' }).investigation).toBe('triangle-area');
  });

  it('ignore une amorce inconnue plutôt que de casser', () => {
    expect(S.createMeasurementData({ investigation: 'les-fractales' }).investigation).toBe('rectangle-area');
  });
});

describe('le réglage de l’objet', () => {
  it('respecte les bornes et le pas de l’enquête', () => {
    let data = open('rectangle-area');
    data = S.setParam(data, 'length', 99);
    expect(S.currentParams(data).length).toBe(12);
    data = S.setParam(data, 'length', -4);
    expect(S.currentParams(data).length).toBe(1);
  });

  it('laisse intact l’objet des AUTRES enquêtes', () => {
    let data = withParams(open('rectangle-area'), { length: 9, width: 7 });
    data = S.selectInvestigation(data, 'triangle-area');
    data = S.setParam(data, 'base', 11);
    data = S.selectInvestigation(data, 'rectangle-area');
    expect(S.currentParams(data)).toMatchObject({ length: 9, width: 7 });
  });
});

describe('le tableau d’observations (§18)', () => {
  it('enregistre la mesure de l’objet courant', () => {
    const data = observeAt(open('rectangle-area'), { length: 4, width: 3 });
    expect(S.currentRecord(data).observations).toHaveLength(1);
    expect(S.currentRecord(data).observations[0].values).toMatchObject({ length: 4, width: 3, area: 12 });
  });

  it('refuse d’enregistrer DEUX FOIS le même objet', () => {
    // Mesurer trois fois le même rectangle n'est pas trois preuves (§25).
    let data = observeAt(open('rectangle-area'), { length: 4, width: 3 });
    data = S.recordObservation(data);
    expect(S.currentRecord(data).observations).toHaveLength(1);
  });

  it('supprime et vide', () => {
    let data = observeAt(open('rectangle-area'), { length: 4, width: 3 });
    data = observeAt(data, { length: 5, width: 3 });
    const [first] = S.currentRecord(data).observations;
    data = S.removeObservation(data, first.id);
    expect(S.currentRecord(data).observations).toHaveLength(1);
    data = S.clearObservations(data);
    expect(S.currentRecord(data).observations).toHaveLength(0);
    expect(S.currentRecord(data).stage).toBe('exploring');
  });

  it('ne garde jamais plus que le plafond', () => {
    let data = open('rectangle-area');
    for (let length = 1; length <= 12; length += 1) {
      for (let width = 1; width <= 9; width += 1) data = observeAt(data, { length, width });
    }
    expect(S.currentRecord(data).observations.length).toBeLessThanOrEqual(S.MAX_OBSERVATIONS);
  });
});

describe('la PREUVE exigée avant de conclure (§25)', () => {
  const areaRule = R.operation('*', R.variable('length'), R.variable('width'));

  it('ne conclut pas sur une seule observation, même avec la bonne règle', () => {
    let data = observeAt(open('rectangle-area'), { length: 4, width: 3 });
    data = S.setRule(data, areaRule);
    const evidence = S.evaluateEvidence(data);
    expect(evidence.holds).toBe(true);
    expect(evidence.enough).toBe(false);
    expect(evidence.satisfied).toBe(false);
    expect(S.currentRecord(data).stage).not.toBe('found');
  });

  it('ne conclut pas sur trois mesures du MÊME carré', () => {
    // Sur un carré 2×2, L + l et L × l donnent tous deux 4 : sans variété,
    // l'élève repartirait avec une règle fausse.
    let data = open('rectangle-area');
    data = observeAt(data, { length: 2, width: 2 });
    data = observeAt(data, { length: 3, width: 3 });
    data = observeAt(data, { length: 4, width: 4 });
    data = S.setRule(data, areaRule);
    const evidence = S.evaluateEvidence(data);
    // Trois configurations DIFFÉRENTES : la variété est là…
    expect(evidence.varied).toBe(true);
    // …mais la règle fausse « L + l » ne tient PAS sur ces carrés non plus,
    // car 2+2=4 mais 3+3=6 ≠ 9. C'est bien la mesure qui tranche.
    const wrong = S.setRule(data, R.operation('+', R.variable('length'), R.variable('width')));
    expect(S.evaluateEvidence(wrong).holds).toBe(false);
  });

  it('exige l’épreuve sur un objet NON choisi par l’élève', () => {
    let data = open('rectangle-area');
    data = observeAt(data, { length: 3, width: 2 });
    data = observeAt(data, { length: 4, width: 2 });
    data = observeAt(data, { length: 5, width: 3 });
    data = S.setRule(data, areaRule);

    let evidence = S.evaluateEvidence(data);
    expect(evidence.enough).toBe(true);
    expect(evidence.varied).toBe(true);
    expect(evidence.holds).toBe(true);
    expect(evidence.tested).toBe(false);
    expect(evidence.satisfied).toBe(false);
    expect(S.currentRecord(data).stage).toBe('testing');

    data = S.runUnseenTest(data);
    evidence = S.evaluateEvidence(data);
    expect(evidence.tested).toBe(true);
    expect(evidence.satisfied).toBe(true);
    expect(S.currentRecord(data).stage).toBe('found');
  });

  it('ne conclut JAMAIS sur une règle fausse, même bien éprouvée', () => {
    let data = open('rectangle-area');
    data = observeAt(data, { length: 3, width: 2 });
    data = observeAt(data, { length: 4, width: 2 });
    data = observeAt(data, { length: 5, width: 3 });
    data = S.setRule(data, R.operation('+', R.variable('length'), R.variable('width')));
    data = S.runUnseenTest(data);
    expect(S.currentRecord(data).stage).not.toBe('found');
    expect(S.evaluateEvidence(data).holds).toBe(false);
  });

  it('l’objet d’épreuve n’a jamais été mesuré, et ne doit rien au hasard', () => {
    let data = open('rectangle-area');
    data = observeAt(data, { length: 3, width: 2 });
    data = observeAt(data, { length: 4, width: 2 });
    const record = S.currentRecord(data);
    const investigation = getInvestigation('rectangle-area');

    const first = S.unseenParams(investigation, record, 0);
    const second = S.unseenParams(investigation, record, 0);
    expect(first).toEqual(second);

    const values = measureAll(investigation, first, 0);
    const already = record.observations.some((row) => row.values.length === values.length && row.values.width === values.width);
    expect(already).toBe(false);
  });
});

describe('les étapes de la découverte (§21)', () => {
  it('avance exploring → conjecturing → testing → found → explained', () => {
    let data = open('rectangle-area');
    expect(S.currentRecord(data).stage).toBe('exploring');

    data = observeAt(data, { length: 3, width: 2 });
    data = observeAt(data, { length: 4, width: 2 });
    expect(S.currentRecord(data).stage).toBe('conjecturing');

    data = S.setRule(data, R.operation('*', R.variable('length'), R.variable('width')));
    expect(S.currentRecord(data).stage).toBe('testing');

    data = observeAt(data, { length: 5, width: 3 });
    data = S.runUnseenTest(data);
    expect(S.currentRecord(data).stage).toBe('found');

    data = S.markExplained(data);
    expect(S.currentRecord(data).stage).toBe('explained');
  });

  it('ne marque « expliqué » que ce qui a été trouvé', () => {
    const data = open('rectangle-area');
    expect(S.currentRecord(S.markExplained(data)).stage).toBe('exploring');
  });
});

describe('les indices (§24)', () => {
  it('se consomment un à un, sans dépasser le nombre offert', () => {
    let data = open('rectangle-area');
    const total = getInvestigation('rectangle-area').hintCount;
    for (let i = 0; i < total + 3; i += 1) data = S.useHint(data);
    expect(S.currentRecord(data).hintsUsed).toBe(total);
  });
});

describe('la relecture d’un document (la frontière du JSON)', () => {
  it('ramène une étape que les données ne justifient pas', () => {
    // Un document qui se prétend « trouvé » sans règle ni mesure est relu
    // pour ce qu'il est : une enquête qui commence.
    const forged = S.normalizeMeasurementData({
      investigation: 'rectangle-area',
      records: { 'rectangle-area': { stage: 'found', observations: [], rule: null, tests: [] } },
    });
    expect(forged.records['rectangle-area'].stage).toBe('exploring');
  });

  it('ramène « found » à « conjecturing » si la règle n’est pas la bonne', () => {
    const forged = S.normalizeMeasurementData({
      investigation: 'rectangle-area',
      records: {
        'rectangle-area': {
          stage: 'found',
          observations: [{ id: 'x', values: { length: 3, width: 2, area: 6 } }],
          rule: R.operation('+', R.variable('length'), R.variable('width')),
          tests: [],
        },
      },
    });
    expect(forged.records['rectangle-area'].stage).toBe('conjecturing');
  });

  it('survit à n’importe quel déchet', () => {
    for (const junk of [null, undefined, 42, 'x', [], { records: 'non' }, { objects: [1, 2] }]) {
      const data = S.normalizeMeasurementData(junk);
      expect(data.investigation).toBe('rectangle-area');
      expect(Object.keys(data.records)).toHaveLength(INVESTIGATIONS.length);
    }
  });

  it('est stable : relire deux fois ne change rien', () => {
    let data = observeAt(open('triangle-area'), { base: 6, height: 4 });
    data = S.setRule(data, R.operation('/', R.operation('*', R.variable('base'), R.variable('height')), R.number(2)));
    const once = S.serializeMeasurementData(data);
    expect(S.serializeMeasurementData(once)).toEqual(once);
  });
});

describe('la taille du document (la borne du serveur)', () => {
  it('reste sous les 40 Ko du serveur dans le PIRE cas', () => {
    // Le pire cas : chaque enquête pleine d'observations, une règle posée,
    // et le maximum d'épreuves.
    let data = S.createMeasurementData();
    for (const investigation of INVESTIGATIONS) {
      data = S.selectInvestigation(data, investigation.id);
      const [first, second] = investigation.params;
      for (let i = 0; i < S.MAX_OBSERVATIONS + 5; i += 1) {
        const params = { ...S.currentParams(data) };
        if (first) params[first.key] = first.min + ((i * first.step) % Math.max(first.step, first.max - first.min));
        if (second) params[second.key] = second.min + ((i * second.step) % Math.max(second.step, second.max - second.min));
        data = observeAt(data, params);
      }
      data = S.setRule(data, investigation.solution);
      for (let i = 0; i < S.MAX_TESTS + 3; i += 1) data = S.runUnseenTest(data);
    }

    // Dix enquêtes, chacune avec son tableau plein et ses épreuves : c'est
    // ce qui décide du plafond côté serveur (MathLabTools.php). Le pire cas
    // MESURÉ pèse ~22,5 Ko ; 40 Ko laissent de la marge sans jamais accepter
    // un document que l'instrument ne saurait rouvrir.
    const bytes = new TextEncoder().encode(JSON.stringify(S.serializeMeasurementData(data))).length;
    expect(bytes).toBeLessThan(40_000);
  });
});

describe('la mesure approchée (§27)', () => {
  it('arrondit les longueurs à la graduation, jamais les quotients', () => {
    let data = S.setPrecision(open('circle-circumference'), 0.1);
    data = S.setParam(data, 'radius', 2);
    const { measures } = S.resolveMeasurement(data);
    expect(measures.circumference).toBe(12.6);
    // Le quotient C ÷ d n'est pas une longueur : il garde sa précision.
    expect(measures.ratio).toBeCloseTo(Math.PI, 6);
  });
});

describe('resolveMeasurement', () => {
  it('rend tout ce que l’écran doit lire, sans qu’il calcule rien', () => {
    const data = observeAt(open('cuboid-volume'), { length: 4, width: 3, height: 2 });
    const resolved = S.resolveMeasurement(data);
    expect(resolved.investigation.id).toBe('cuboid-volume');
    expect(resolved.measures.volume).toBe(24);
    expect(resolved.measures.perLayer).toBe(12);
    expect(resolved.evidence.satisfied).toBe(false);
    expect(resolved.solved).toBe(false);
  });

  it('reconnaît la règle trouvée pour CHAQUE enquête', () => {
    // La solution de chaque enquête doit être reconnue par son propre moteur.
    for (const investigation of INVESTIGATIONS) {
      expect(matchesSolution(investigation, investigation.solution)).toBe(true);
      for (const alternate of investigation.alternateSolutions ?? []) {
        expect(matchesSolution(investigation, alternate)).toBe(true);
      }
    }
  });
});

/**
 * Les défauts d'audit de l'étape 7 : chaque correction, rejouée de bout en
 * bout (observer → règle → épreuve), avec des attendus calculés à part.
 */
describe('les règles du manuel atteignent « trouvé », les tautologies non', () => {
  /** Trois triangles rectangles variés, une règle, puis l'épreuve non choisie. */
  function pythagorasWith(rule) {
    let data = open('pythagoras');
    data = observeAt(data, { side1: 3, side2: 4 });
    data = observeAt(data, { side1: 5, side2: 2 });
    data = observeAt(data, { side1: 6, side2: 8 });
    data = S.setRule(data, rule);

    return S.runUnseenTest(data);
  }
  const v = R.variable;

  it('Pythagore écrit avec les CÔTÉS — a² + b², a × a + b × b — est trouvé', () => {
    const rules = [
      R.operation('+', R.power(v('side1'), 2), R.power(v('side2'), 2)),
      R.operation('+', R.operation('*', v('side1'), v('side1')), R.operation('*', v('side2'), v('side2'))),
      // …et la formulation par les aires des carrés marche toujours.
      R.operation('+', v('square1'), v('square2')),
      R.operation('+', v('square2'), R.power(v('side1'), 2)),
    ];
    for (const rule of rules) {
      const data = pythagorasWith(rule);
      expect(S.evaluateEvidence(data).satisfied, R.formatRule(rule)).toBe(true);
      expect(S.currentRecord(data).stage, R.formatRule(rule)).toBe('found');
    }
  });

  it('c² n’est pas Pythagore : c n’est pas une variable de règle, et c² n’est jamais « trouvé »', () => {
    const investigation = getInvestigation('pythagoras');
    const keys = ruleKeys(investigation);
    expect(keys).not.toContain('hypotenuse');
    expect(keys).toEqual(expect.arrayContaining(['side1', 'side2', 'square1', 'square2']));
    const data = pythagorasWith(R.power(v('hypotenuse'), 2));
    expect(S.currentRecord(data).stage).not.toBe('found');
    expect(matchesSolution(investigation, R.power(v('hypotenuse'), 2))).toBe(false);
  });

  it('(C ÷ d) × d et (A ÷ r²) × r² ne sont pas des découvertes', () => {
    const circumference = getInvestigation('circle-circumference');
    const area = getInvestigation('circle-area');
    expect(ruleKeys(circumference)).not.toContain('ratio');
    expect(ruleKeys(area)).not.toContain('ratio');
    expect(matchesSolution(circumference, R.operation('*', v('ratio'), v('diameter')))).toBe(false);
    expect(matchesSolution(area, R.operation('*', v('ratio'), R.power(v('radius'), 2)))).toBe(false);
    // Les vraies règles restent reconnues.
    expect(matchesSolution(circumference, R.operation('*', v('diameter'), R.constant('pi')))).toBe(true);
    expect(matchesSolution(area, R.operation('*', R.operation('*', R.constant('pi'), v('radius')), v('radius')))).toBe(true);
  });

  it('une règle fausse reste refusée par la comparaison sur objets réels', () => {
    const pythagoras = getInvestigation('pythagoras');
    expect(matchesSolution(pythagoras, R.operation('+', v('side1'), v('side2')))).toBe(false);
    expect(matchesSolution(pythagoras, R.power(R.operation('+', v('side1'), v('side2')), 2))).toBe(false);
    const cube = getInvestigation('cube-volume');
    expect(matchesSolution(cube, R.power(v('edge'), 2))).toBe(false);
  });

  /**
   * §16 : la découverte est S = 180°. Â + B̂ + Ĉ est la définition de S — elle
   * tient toujours, et ne compte pas. 180 s'écrit (puces 90, 180, 360).
   */
  it('la somme des angles : 180 est trouvé, Â + B̂ + Ĉ est reconnu comme définition', () => {
    const investigation = getInvestigation('triangle-angle-sum');
    expect(ruleNumbersFor(investigation)).toEqual(expect.arrayContaining([90, 180, 360]));

    const flow = (rule) => {
      let data = open('triangle-angle-sum');
      data = observeAt(data, { base: 7, height: 4, apex: 3 });
      data = observeAt(data, { base: 4, height: 8, apex: -5 });
      data = observeAt(data, { base: 12, height: 1, apex: 11 });
      data = observeAt(data, { base: 5, height: 5, apex: 0 });
      data = S.setRule(data, rule);

      return S.runUnseenTest(data);
    };
    // Attendu indépendant : la somme des angles d'un triangle, mesurée ici
    // avec atan2 sur les sommets (0,0), (b,0), (apex,h).
    const angle = (p, q, r) => {
      const a = Math.atan2(p.y - q.y, p.x - q.x);
      const b = Math.atan2(r.y - q.y, r.x - q.x);
      const d = Math.abs(a - b) * 180 / Math.PI;

      return d > 180 ? 360 - d : d;
    };
    const P = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: -5, y: 8 }];
    expect(angle(P[2], P[0], P[1]) + angle(P[0], P[1], P[2]) + angle(P[1], P[2], P[0])).toBeCloseTo(180, 9);

    const found = flow(R.number(180));
    expect(S.currentRecord(found).stage).toBe('found');

    const definitionRule = R.operation('+', R.operation('+', v('angleA'), v('angleB')), v('angleC'));
    const definition = flow(definitionRule);
    expect(S.evaluateEvidence(definition).holds).toBe(true);
    expect(S.currentRecord(definition).stage).not.toBe('found');
    expect(isDefinitionOf(investigation, definitionRule)).toBe(true);
    expect(isDefinitionOf(investigation, R.number(180))).toBe(false);

    for (const wrong of [R.number(90), R.number(360), R.operation('*', R.number(3), v('angleA'))]) {
      expect(S.currentRecord(flow(wrong)).stage, R.formatRule(wrong)).not.toBe('found');
    }
  });
});

describe('les conversions : quatre crans, quatre objets', () => {
  it('les facteurs de longueur sont tous différents et suivent le moteur de conversion', () => {
    const investigation = getInvestigation('unit-conversion');
    const factors = [1, 2, 3, 4].map((scale) => measureAll(investigation, { scale }, 0).lengthFactor);
    expect(new Set(factors).size).toBe(4);
    // Attendus indépendants : 1 dm = 10 cm, 1 m = 100 cm, 1 m = 1 000 mm, 1 km = 10 000 dm.
    expect(factors).toEqual([10, 100, 1000, 10000]);
    for (const scale of [1, 2, 3, 4]) {
      const values = measureAll(investigation, { scale }, 0);
      expect(values.factor).toBe(values.lengthFactor ** 2);
    }
  });

  it('l’objet d’épreuve n’est jamais un cran déjà mesuré', () => {
    const investigation = getInvestigation('unit-conversion');
    let data = open('unit-conversion');
    for (const scale of [1, 2, 3]) data = observeAt(data, { scale });
    data = S.setRule(data, R.power(R.variable('lengthFactor'), 2));
    data = S.runUnseenTest(data);
    const record = S.currentRecord(data);
    expect(record.tests).toHaveLength(1);
    expect(record.tests[0].values.lengthFactor).toBe(10000);
    expect(record.observations.some((row) => row.values.lengthFactor === 10000)).toBe(false);
    expect(record.stage).toBe('found');
    // Plus rien de neuf : pas d'objet d'épreuve inventé.
    expect(S.unseenParams(investigation, record, 0)).toBeNull();
  });

  it('toute la grille mesurée : l’épreuve est exhaustive, et la règle est trouvée', () => {
    let data = open('unit-conversion');
    for (const scale of [1, 2, 3, 4]) data = observeAt(data, { scale });
    data = S.setRule(data, R.operation('*', R.variable('lengthFactor'), R.variable('lengthFactor')));
    expect(S.unseenParams(getInvestigation('unit-conversion'), S.currentRecord(data), 0)).toBeNull();
    const evidence = S.evaluateEvidence(data);
    expect(evidence.exhaustive).toBe(true);
    expect(evidence.tested).toBe(true);
    data = S.runUnseenTest(data);
    expect(S.currentRecord(data).tests).toHaveLength(0);
    expect(S.currentRecord(data).stage).toBe('found');
  });
});

function ruleKeys(investigation) {
  return ruleVariablesFor(investigation).map((entry) => entry.key);
}
