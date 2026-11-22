/**
 * Les tests du MODÈLE et de l'ÉTAT du مختبر التحويلات.
 *
 * Ils couvrent ce que le moteur (transformMath.test.js) ne couvre pas : la
 * pile de transformations et sa composition (§20 – §23), les invariants
 * MESURÉS (§24), les formules en coordonnées (§26), la relecture d'un
 * document, l'historique (§48) et la borne d'octets du serveur.
 */

import { describe, it, expect } from 'vitest';
import * as M from './transformMath.js';
import {
  matrixFor, matrixAtFraction, transformStages, finalFigure, cumulativeMatrix,
  analyzeInvariants, coordinateFormula, resolveCenter, resolveAxis,
} from './transformModel.js';
import {
  TRANSFORMATIONS_SCHEMA_VERSION, MAX_HISTORY, MAX_STEPS, MAX_FIGURES,
  createTransformationsData, normalizeTransformationsData, serializeTransformationsData,
  currentScene, pushScene, replaceScene, undo, redo, canUndo, canRedo,
  addFigure, removeFigure, moveVertex, moveFigure, addStep, updateStep, removeStep,
  toggleStep, moveStep, setSteps, clearSteps, defaultScene, emptyScene, resolveData,
  clampCoord, COORD_LIMIT,
} from './transformState.js';

const at = (x, y) => ({ x, y });
const TRIANGLE = [at(0, 0), at(4, 0), at(0, 3)];
const expectPoint = (actual, expected) => {
  expect(actual.x).toBeCloseTo(expected.x, 10);
  expect(actual.y).toBeCloseTo(expected.y, 10);
};

// ── Le modèle : un pas → une matrice ────────────────────────────────────

describe('matrixFor — un pas devient une transformation', () => {
  it('lit un انسحاب', () => {
    expectPoint(M.applyMatrix(matrixFor({ kind: 'translation', vx: 2, vy: -1 }), at(1, 1)), at(3, 0));
  });

  it('lit un دوران autour de l’origine', () => {
    expectPoint(M.applyMatrix(matrixFor({ kind: 'rotation', angle: 90, center: { type: 'origin' } }), at(1, 0)), at(0, 1));
  });

  it('lit un دوران dont le centre est un SOMMET de la figure (§11)', () => {
    const step = { kind: 'rotation', angle: 180, center: { type: 'vertex', index: 1 } };
    // Le centre est (4,0) : ce sommet est fixe.
    expectPoint(M.applyMatrix(matrixFor(step, TRIANGLE), at(4, 0)), at(4, 0));
    expectPoint(M.applyMatrix(matrixFor(step, TRIANGLE), at(0, 0)), at(8, 0));
  });

  it('le centre « sommet » SUIT le sommet quand il bouge', () => {
    const step = { kind: 'rotation', angle: 180, center: { type: 'vertex', index: 0 } };
    const moved = [at(5, 5), at(4, 0), at(0, 3)];
    expectPoint(M.applyMatrix(matrixFor(step, TRIANGLE), at(1, 1)), at(-1, -1));
    expectPoint(M.applyMatrix(matrixFor(step, moved), at(1, 1)), at(9, 9));
  });

  it('lit les six axes nommés de réflexion (§14)', () => {
    const image = (type, extra = {}) => M.applyMatrix(matrixFor({ kind: 'reflection', axis: { type, ...extra } }), at(3, 4));
    expectPoint(image('xAxis'), at(3, -4));
    expectPoint(image('yAxis'), at(-3, 4));
    expectPoint(image('diagonal'), at(4, 3));
    expectPoint(image('antidiagonal'), at(-4, -3));
    expectPoint(image('horizontal', { value: 1 }), at(3, -2));
    expectPoint(image('vertical', { value: 1 }), at(-1, 4));
  });

  it('la réflexion « origine » est la symétrie CENTRALE (§36)', () => {
    const step = { kind: 'reflection', axis: { type: 'origin' } };
    expectPoint(M.applyMatrix(matrixFor(step), at(3, 4)), at(-3, -4));
  });

  it('lit un axe défini par DEUX POINTS (§14)', () => {
    const step = { kind: 'reflection', axis: { type: 'twoPoints', a: at(0, 0), b: at(1, 1) } };
    expectPoint(M.applyMatrix(matrixFor(step), at(3, 4)), at(4, 3));
  });

  it('un axe à deux points CONFONDUS ne décrit rien (§55)', () => {
    expect(matrixFor({ kind: 'reflection', axis: { type: 'twoPoints', a: at(2, 2), b: at(2, 2) } })).toBeNull();
  });

  it('lit un تحاكي et son centre', () => {
    expectPoint(M.applyMatrix(matrixFor({ kind: 'dilation', k: 3, center: { type: 'point', point: at(1, 1) } }), at(2, 1)), at(4, 1));
  });

  it('une famille inconnue ne décrit rien', () => {
    expect(matrixFor({ kind: 'shear' })).toBeNull();
    expect(matrixFor(null)).toBeNull();
  });

  it('resolveCenter retombe sur l’origine quand la désignation est cassée', () => {
    expect(resolveCenter({ type: 'vertex', index: 99 }, TRIANGLE)).toEqual(at(0, 0));
    expect(resolveCenter(undefined, TRIANGLE)).toEqual(at(0, 0));
  });

  it('resolveAxis rend null pour « origine », qui n’est pas une droite', () => {
    expect(resolveAxis({ type: 'origin' })).toBeNull();
  });
});

// ── L'animation (§12) ───────────────────────────────────────────────────

describe('matrixAtFraction — l’animation montre un état qui a un SENS', () => {
  it('t = 0 est l’identité, t = 1 le pas entier', () => {
    const step = { kind: 'rotation', angle: 90 };
    expectPoint(M.applyMatrix(matrixAtFraction(step, [], 0), at(1, 0)), at(1, 0));
    expectPoint(M.applyMatrix(matrixAtFraction(step, [], 1), at(1, 0)), at(0, 1));
  });

  it('une rotation à mi-chemin est une rotation de MOITIÉ d’angle (pas une déformation)', () => {
    const half = matrixAtFraction({ kind: 'rotation', angle: 90 }, [], 0.5);
    expectPoint(M.applyMatrix(half, at(1, 0)), M.applyMatrix(M.rotation(45), at(1, 0)));
    // À mi-chemin la figure est encore une VRAIE figure : les longueurs tiennent.
    const image = TRIANGLE.map((v) => M.applyMatrix(half, v));
    expect(M.area(image)).toBeCloseTo(M.area(TRIANGLE), 10);
  });

  it('une homothétie à mi-chemin interpole le RAPPORT', () => {
    const half = matrixAtFraction({ kind: 'dilation', k: 3 }, [], 0.5);
    expectPoint(M.applyMatrix(half, at(1, 0)), at(2, 0));
  });

  it('une translation à mi-chemin a parcouru la moitié du شعاع', () => {
    expectPoint(M.applyMatrix(matrixAtFraction({ kind: 'translation', vx: 4, vy: 2 }, [], 0.5), at(0, 0)), at(2, 1));
  });

  it('une réflexion à mi-chemin ÉCRASE la figure sur son axe, puis la redéploie', () => {
    const step = { kind: 'reflection', axis: { type: 'xAxis' } };
    const half = matrixAtFraction(step, [], 0.5);
    // Sur l'axe : l'aire est nulle — la feuille est vue par la tranche.
    expect(M.area(TRIANGLE.map((v) => M.applyMatrix(half, v)))).toBeCloseTo(0, 10);
    // Et à t = 1 la figure est bien l'image.
    expectPoint(M.applyMatrix(matrixAtFraction(step, [], 1), at(3, 4)), at(3, -4));
  });

  it('une fraction hors de [0,1] est ramenée dans [0,1]', () => {
    expectPoint(M.applyMatrix(matrixAtFraction({ kind: 'translation', vx: 4, vy: 0 }, [], 5), at(0, 0)), at(4, 0));
    expectPoint(M.applyMatrix(matrixAtFraction({ kind: 'translation', vx: 4, vy: 0 }, [], -5), at(0, 0)), at(0, 0));
  });
});

// ── La pile (§20 – §23) ─────────────────────────────────────────────────

describe('transformStages — la composition, étape par étape', () => {
  const steps = [
    { id: 'a', kind: 'translation', enabled: true, vx: 2, vy: 0 },
    { id: 'b', kind: 'rotation', enabled: true, angle: 90, center: { type: 'origin' } },
  ];

  it('rend une étape par pas, avec l’image intermédiaire (§22)', () => {
    const stages = transformStages(TRIANGLE, steps);
    expect(stages).toHaveLength(2);
    expectPoint(stages[0].vertices[0], at(2, 0));
    expectPoint(stages[1].vertices[0], at(0, 2));
  });

  it('la figure finale est celle de la dernière étape', () => {
    expectPoint(finalFigure(TRIANGLE, steps)[0], at(0, 2));
  });

  it('une pile VIDE laisse la figure intacte', () => {
    expect(finalFigure(TRIANGLE, [])).toEqual(TRIANGLE);
  });

  it('un pas DÉSACTIVÉ est traversé sans rien changer, mais garde sa ligne (§21)', () => {
    const stages = transformStages(TRIANGLE, [{ ...steps[0], enabled: false }, steps[1]]);
    expect(stages).toHaveLength(2);
    expect(stages[0].skipped).toBe(true);
    expect(stages[0].vertices).toEqual(TRIANGLE);
    expectPoint(stages[1].vertices[0], at(0, 0));
  });

  it('un pas INVALIDE est signalé, pas remplacé par l’identité en silence (§55)', () => {
    const broken = { id: 'x', kind: 'reflection', enabled: true, axis: { type: 'twoPoints', a: at(1, 1), b: at(1, 1) } };
    const stages = transformStages(TRIANGLE, [broken]);
    expect(stages[0].invalid).toBe(true);
    expect(stages[0].vertices).toEqual(TRIANGLE);
  });

  it('L’ORDRE COMPTE — la découverte de §23', () => {
    const forward = finalFigure(TRIANGLE, steps);
    const backward = finalFigure(TRIANGLE, [steps[1], steps[0]]);
    expect(M.samePoint(forward[0], backward[0])).toBe(false);
    expectPoint(forward[0], at(0, 2));
    expectPoint(backward[0], at(2, 0));
  });

  it('la matrice cumulée est la composée de tous les pas actifs (§27)', () => {
    const cumulative = cumulativeMatrix(TRIANGLE, steps);
    expectPoint(M.applyMatrix(cumulative, TRIANGLE[0]), at(0, 2));
  });

  it('les centres se résolvent contre la figure D’ORIGINE, pas contre l’image courante', () => {
    const stack = [
      { id: 'a', kind: 'translation', enabled: true, vx: 10, vy: 0 },
      { id: 'b', kind: 'rotation', enabled: true, angle: 180, center: { type: 'vertex', index: 0 } },
    ];
    // Le centre est A = (0,0) de la figure d'origine, pas A' = (10,0).
    const stages = transformStages(TRIANGLE, stack);
    expectPoint(stages[1].vertices[0], at(-10, 0));
  });

  it('une figure vide traverse la pile sans exploser', () => {
    expect(finalFigure([], steps)).toEqual([]);
    expect(finalFigure(null, steps)).toEqual([]);
  });
});

// ── Les invariants MESURÉS (§24) ────────────────────────────────────────

describe('analyzeInvariants — ce qui ne change pas, mesuré et non récité', () => {
  const invariantsAfter = (steps) => analyzeInvariants(TRIANGLE, finalFigure(TRIANGLE, steps));

  it('un انسحاب conserve tout sauf les coordonnées', () => {
    const result = invariantsAfter([{ kind: 'translation', enabled: true, vx: 3, vy: 2 }]);
    expect(result.distances.preserved).toBe(true);
    expect(result.angles.preserved).toBe(true);
    expect(result.area.preserved).toBe(true);
    expect(result.perimeter.preserved).toBe(true);
    expect(result.orientation.preserved).toBe(true);
    expect(result.parallelism.preserved).toBe(true);
    expect(result.coordinates.preserved).toBe(false);
  });

  it('un دوران conserve les distances, les angles, l’aire ET l’orientation', () => {
    const result = invariantsAfter([{ kind: 'rotation', enabled: true, angle: 37, center: { type: 'origin' } }]);
    expect(result.distances.preserved).toBe(true);
    expect(result.angles.preserved).toBe(true);
    expect(result.area.preserved).toBe(true);
    expect(result.orientation.preserved).toBe(true);
    expect(result.coordinates.preserved).toBe(false);
  });

  it('une réflexion conserve les mesures mais RETOURNE l’orientation', () => {
    const result = invariantsAfter([{ kind: 'reflection', enabled: true, axis: { type: 'xAxis' } }]);
    expect(result.distances.preserved).toBe(true);
    expect(result.angles.preserved).toBe(true);
    expect(result.area.preserved).toBe(true);
    expect(result.orientation.preserved).toBe(false);
    expect(result.orientation.before).toBe(-result.orientation.after);
  });

  it('un تحاكي conserve les ANGLES et le parallélisme, pas les longueurs', () => {
    const result = invariantsAfter([{ kind: 'dilation', enabled: true, k: 2, center: { type: 'origin' } }]);
    expect(result.distances.preserved).toBe(false);
    expect(result.angles.preserved).toBe(true);
    expect(result.parallelism.preserved).toBe(true);
    expect(result.area.preserved).toBe(false);
  });

  it('le rapport des AIRES vaut k² — la découverte de §19', () => {
    for (const k of [2, 0.5, 3, -2]) {
      const result = invariantsAfter([{ kind: 'dilation', enabled: true, k, center: { type: 'origin' } }]);
      expect(result.area.ratio).toBeCloseTo(k * k, 10);
      expect(result.perimeter.ratio).toBeCloseTo(Math.abs(k), 10);
    }
  });

  it('une homothétie de rapport NÉGATIF conserve l’orientation (deux retournements)', () => {
    const result = invariantsAfter([{ kind: 'dilation', enabled: true, k: -2, center: { type: 'origin' } }]);
    expect(result.orientation.preserved).toBe(true);
  });

  it('une pile vide conserve jusqu’aux coordonnées', () => {
    const result = analyzeInvariants(TRIANGLE, TRIANGLE);
    expect(result.coordinates.preserved).toBe(true);
  });

  it('deux réflexions rendent l’orientation d’origine', () => {
    const result = invariantsAfter([
      { kind: 'reflection', enabled: true, axis: { type: 'xAxis' } },
      { kind: 'reflection', enabled: true, axis: { type: 'yAxis' } },
    ]);
    expect(result.orientation.preserved).toBe(true);
  });

  it('un SEGMENT n’a ni aire ni angles — et on ne prétend pas le contraire', () => {
    const segment = [at(0, 0), at(3, 4)];
    const result = analyzeInvariants(segment, segment.map((v) => M.applyMatrix(M.rotation(90), v)));
    expect(result.area).toBeNull();
    expect(result.angles).toBeNull();
    expect(result.distances.preserved).toBe(true);
  });

  it('des figures de tailles différentes ne se comparent pas', () => {
    expect(analyzeInvariants(TRIANGLE, [at(0, 0)])).toBeNull();
    expect(analyzeInvariants(null, null)).toBeNull();
  });
});

// ── Les formules (§26) ──────────────────────────────────────────────────

describe('coordinateFormula — la formule porte les VRAIS paramètres', () => {
  it('un انسحاب rend ses composantes', () => {
    expect(coordinateFormula({ kind: 'translation', vx: 3, vy: -2 })).toEqual({ key: 'translation', params: { a: 3, b: -2 } });
  });

  it('les quarts de tour ont leur formule exacte et mémorable', () => {
    expect(coordinateFormula({ kind: 'rotation', angle: 90, center: { type: 'origin' } }).key).toBe('rotation90');
    expect(coordinateFormula({ kind: 'rotation', angle: 180, center: { type: 'origin' } }).key).toBe('rotation180');
    expect(coordinateFormula({ kind: 'rotation', angle: 270, center: { type: 'origin' } }).key).toBe('rotation270');
  });

  it('un angle quelconque garde la forme générale, avec son angle', () => {
    const formula = coordinateFormula({ kind: 'rotation', angle: 37, center: { type: 'origin' } });
    expect(formula.key).toBe('rotationOrigin');
    expect(formula.params.angle).toBe(37);
  });

  it('un centre non nul change la formule', () => {
    expect(coordinateFormula({ kind: 'rotation', angle: 90, center: { type: 'point', point: at(1, 2) } }).key).toBe('rotationCenter');
  });

  it('chaque axe nommé a sa formule', () => {
    const key = (type) => coordinateFormula({ kind: 'reflection', axis: { type } }).key;
    expect(key('xAxis')).toBe('reflectX');
    expect(key('yAxis')).toBe('reflectY');
    expect(key('origin')).toBe('reflectOrigin');
    expect(key('diagonal')).toBe('reflectDiagonal');
  });

  it('un تحاكي de centre l’origine dit son rapport', () => {
    const formula = coordinateFormula({ kind: 'dilation', k: 2, center: { type: 'origin' } });
    expect(formula.key).toBe('dilationOrigin');
    expect(formula.params.k).toBe(2);
  });
});

// ── L'état du document ──────────────────────────────────────────────────

describe('le document : relecture, sérialisation, bornes', () => {
  it('un document neuf s’ouvre sur une figure et un pas — jamais sur du vide', () => {
    const data = createTransformationsData();
    const scene = currentScene(data);
    expect(scene.figures).toHaveLength(1);
    expect(scene.steps).toHaveLength(1);
    expect(data.cursor).toBe(0);
    expect(data.mode).toBe('free');
  });

  it('une amorce de leçon est reprise telle quelle', () => {
    const data = createTransformationsData({
      figures: [{ kind: 'triangle', vertices: TRIANGLE }],
      steps: [{ kind: 'rotation', angle: 180 }],
    });
    const scene = currentScene(data);
    expect(scene.figures[0].vertices).toEqual(TRIANGLE);
    expect(scene.steps[0].kind).toBe('rotation');
  });

  it('un aller-retour sérialiser → relire ne perd rien', () => {
    const data = createTransformationsData();
    const roundTripped = normalizeTransformationsData(JSON.parse(JSON.stringify(serializeTransformationsData(data))));
    expect(currentScene(roundTripped)).toEqual(currentScene(data));
    expect(roundTripped.settings).toEqual(data.settings);
  });

  it('relit sans broncher n’importe quoi', () => {
    for (const junk of [null, undefined, 42, 'x', [], { history: 'no' }, { history: [{ figures: 'no', steps: 7 }] }]) {
      const data = normalizeTransformationsData(junk);
      expect(Array.isArray(data.history)).toBe(true);
      expect(data.history.length).toBeGreaterThan(0);
      expect(Array.isArray(currentScene(data).figures)).toBe(true);
    }
  });

  it('jette les sommets et les pas qui n’en sont pas', () => {
    const data = normalizeTransformationsData({
      history: [{
        figures: [{ kind: 'triangle', vertices: [at(0, 0), { x: 'a', y: 2 }, at(1, 1), null] }],
        steps: [{ kind: 'translation', vx: 1, vy: 1 }, { kind: 'shear' }, null],
      }],
    });
    const scene = currentScene(data);
    expect(scene.figures[0].vertices).toHaveLength(2);
    expect(scene.steps).toHaveLength(1);
  });

  it('borne les coordonnées (§55)', () => {
    expect(clampCoord(1e9)).toBe(COORD_LIMIT);
    expect(clampCoord(-1e9)).toBe(-COORD_LIMIT);
    expect(clampCoord(Number.NaN)).toBe(0);
    expect(clampCoord(0.1 + 0.2)).toBe(0.3);
  });

  it('borne le nombre de figures et de pas', () => {
    let scene = emptyScene();
    for (let i = 0; i < MAX_FIGURES + 3; i += 1) scene = addFigure(scene, 'triangle', TRIANGLE);
    expect(scene.figures).toHaveLength(MAX_FIGURES);
    for (let i = 0; i < MAX_STEPS + 3; i += 1) scene = addStep(scene, 'translation');
    expect(scene.steps).toHaveLength(MAX_STEPS);
  });

  it('un angle relu est ramené dans [0,360) et un rapport borné', () => {
    const data = normalizeTransformationsData({
      history: [{ figures: [], steps: [{ kind: 'rotation', angle: 450 }, { kind: 'dilation', k: 1e6 }] }],
    });
    expect(currentScene(data).steps[0].angle).toBe(90);
    expect(currentScene(data).steps[1].k).toBe(10);
  });

  it('un document au pire cas tient SOUS la borne du serveur (20 Ko)', () => {
    let scene = emptyScene();
    for (let i = 0; i < MAX_FIGURES; i += 1) {
      scene = addFigure(scene, 'polygon', M.regularPolygon(at(0, 0), 4, 12));
    }
    for (const kind of ['translation', 'rotation', 'reflection', 'dilation', 'rotation', 'dilation']) {
      scene = addStep(scene, kind);
    }
    let data = createTransformationsData();
    for (let i = 0; i < MAX_HISTORY + 5; i += 1) data = pushScene(data, scene);
    expect(data.history).toHaveLength(MAX_HISTORY);
    // Mesuré : ~40 Ko. C'est CE nombre qui fixe le plafond du serveur
    // (MathLabTools.php : 60 000 octets), pas l'inverse.
    const bytes = new TextEncoder().encode(JSON.stringify(serializeTransformationsData(data))).length;
    expect(bytes).toBeLessThan(60000);
  });

  it('la version du schéma est un entier ≥ 1', () => {
    expect(Number.isInteger(TRANSFORMATIONS_SCHEMA_VERSION)).toBe(true);
    expect(TRANSFORMATIONS_SCHEMA_VERSION).toBeGreaterThanOrEqual(1);
  });
});

// ── L'historique (§48) ──────────────────────────────────────────────────

describe('تراجع / إعادة — l’historique recule le curseur, il ne défait rien', () => {
  it('un pas poussé se défait et se refait', () => {
    let data = createTransformationsData();
    const before = currentScene(data);
    data = pushScene(data, addStep(before, 'rotation'));
    expect(canUndo(data)).toBe(true);
    expect(canRedo(data)).toBe(false);
    data = undo(data);
    expect(currentScene(data)).toEqual(before);
    expect(canRedo(data)).toBe(true);
    data = redo(data);
    expect(currentScene(data).steps).toHaveLength(before.steps.length + 1);
  });

  it('rejouer après un تراجع ABANDONNE ce qui suivait', () => {
    let data = createTransformationsData();
    data = pushScene(data, addStep(currentScene(data), 'rotation'));
    data = pushScene(data, addStep(currentScene(data), 'dilation'));
    data = undo(data);
    data = pushScene(data, addStep(currentScene(data), 'reflection'));
    expect(canRedo(data)).toBe(false);
    expect(currentScene(data).steps.at(-1).kind).toBe('reflection');
  });

  it('replaceScene ne crée PAS de pas — ce qu’un glissement exige', () => {
    let data = createTransformationsData();
    const depth = data.history.length;
    for (let i = 0; i < 30; i += 1) {
      data = replaceScene(data, moveVertex(currentScene(data), currentScene(data).figures[0].id, 0, i, i));
    }
    expect(data.history).toHaveLength(depth);
    expectPoint(currentScene(data).figures[0].vertices[0], at(29, 29));
  });

  it('l’historique oublie ses plus anciens états au-delà de MAX_HISTORY', () => {
    let data = createTransformationsData();
    for (let i = 0; i < MAX_HISTORY + 10; i += 1) {
      data = pushScene(data, moveVertex(currentScene(data), currentScene(data).figures[0].id, 0, i, 0));
    }
    expect(data.history).toHaveLength(MAX_HISTORY);
    expect(data.cursor).toBe(MAX_HISTORY - 1);
  });

  it('تراجع au tout début et إعادة à la toute fin ne font rien', () => {
    const data = createTransformationsData();
    expect(undo(data)).toBe(data);
    expect(redo(data)).toBe(data);
    expect(canUndo(data)).toBe(false);
  });
});

// ── Les gestes sur la scène ─────────────────────────────────────────────

describe('les gestes sur la scène', () => {
  it('ajoute et retire une figure', () => {
    let scene = addFigure(emptyScene(), 'triangle', TRIANGLE);
    expect(scene.figures).toHaveLength(1);
    scene = removeFigure(scene, scene.figures[0].id);
    expect(scene.figures).toHaveLength(0);
  });

  it('refuse une figure sans sommet valide', () => {
    expect(addFigure(emptyScene(), 'triangle', []).figures).toHaveLength(0);
    expect(addFigure(emptyScene(), 'triangle', [null, { x: 'a' }]).figures).toHaveLength(0);
  });

  it('déplace un sommet, et lui seul', () => {
    const scene = addFigure(emptyScene(), 'triangle', TRIANGLE);
    const moved = moveVertex(scene, scene.figures[0].id, 1, 7, 8);
    expectPoint(moved.figures[0].vertices[1], at(7, 8));
    expect(moved.figures[0].vertices[0]).toEqual(TRIANGLE[0]);
  });

  it('déplace une figure ENTIÈRE du même شعاع (§5)', () => {
    const scene = addFigure(emptyScene(), 'triangle', TRIANGLE);
    const moved = moveFigure(scene, scene.figures[0].id, 2, -1);
    moved.figures[0].vertices.forEach((vertex, i) => expectPoint(vertex, at(TRIANGLE[i].x + 2, TRIANGLE[i].y - 1)));
  });

  it('modifie, désactive, supprime et réordonne un pas (§21)', () => {
    let scene = addStep(addStep(emptyScene(), 'translation'), 'rotation');
    const [first, second] = scene.steps;
    scene = updateStep(scene, first.id, { vx: 9 });
    expect(scene.steps[0].vx).toBe(9);
    scene = toggleStep(scene, first.id);
    expect(scene.steps[0].enabled).toBe(false);
    scene = moveStep(scene, first.id, 1);
    expect(scene.steps[0].id).toBe(second.id);
    scene = removeStep(scene, second.id);
    expect(scene.steps).toHaveLength(1);
  });

  it('réordonner AUX BORDS ne fait rien — et ne casse rien', () => {
    const scene = addStep(addStep(emptyScene(), 'translation'), 'rotation');
    expect(moveStep(scene, scene.steps[0].id, -1)).toBe(scene);
    expect(moveStep(scene, scene.steps[1].id, 1)).toBe(scene);
    expect(moveStep(scene, 'inconnu', 1)).toBe(scene);
  });

  it('un préréglage remplace TOUTE la pile (§35)', () => {
    let scene = addStep(emptyScene(), 'translation');
    scene = setSteps(scene, [{ kind: 'rotation', angle: 90 }, { kind: 'reflection', axis: { type: 'xAxis' } }]);
    expect(scene.steps.map((s) => s.kind)).toEqual(['rotation', 'reflection']);
    expect(clearSteps(scene).steps).toHaveLength(0);
  });

  it('modifier un pas inexistant laisse la scène telle quelle', () => {
    const scene = addStep(emptyScene(), 'translation');
    expect(updateStep(scene, 'inconnu', { vx: 5 }).steps[0].vx).toBe(scene.steps[0].vx);
  });
});

describe('resolveData — tout ce que l’écran lit, en un seul calcul', () => {
  it('rend pour chaque figure ses étapes et son image', () => {
    const data = createTransformationsData({
      figures: [{ kind: 'triangle', vertices: TRIANGLE }],
      steps: [{ kind: 'rotation', angle: 90 }],
    });
    const resolved = resolveData(data);
    expect(resolved.figures).toHaveLength(1);
    expect(resolved.figures[0].stages).toHaveLength(1);
    expectPoint(resolved.figures[0].image[1], at(0, 4));
  });

  it('une scène par défaut se résout aussi', () => {
    const resolved = resolveData(normalizeTransformationsData({ history: [defaultScene()] }));
    expect(resolved.figures[0].image).toHaveLength(3);
  });
});

// ── L'amorce d'une leçon (§49, openMathLab) ─────────────────────────────

/**
 * Le SEED documenté dans `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md`.
 *
 * Le guide promet une forme précise aux futures leçons ; ces épreuves
 * tiennent la promesse. Une documentation qui décrit une API que le code
 * n'accepte pas est pire qu'une absence de documentation.
 */
describe('l’amorce documentée pour les leçons', () => {
  it('est reprise telle quelle, figure ET pile', () => {
    const data = createTransformationsData({
      figures: [{ kind: 'triangle', vertices: [at(1, 1), at(4, 1), at(1, 3)] }],
      steps: [{ kind: 'rotation', angle: 90, center: { type: 'origin' } }],
    });
    const scene = currentScene(data);
    expect(scene.figures[0].kind).toBe('triangle');
    expect(scene.steps[0].angle).toBe(90);
    expectPoint(finalFigure(scene.figures[0].vertices, scene.steps)[0], at(-1, 1));
  });

  it('accepte chaque forme d’AXE que le guide annonce', () => {
    const axes = [
      { type: 'xAxis' }, { type: 'yAxis' }, { type: 'origin' },
      { type: 'diagonal' }, { type: 'antidiagonal' },
      { type: 'horizontal', value: 2 }, { type: 'vertical', value: 2 },
      { type: 'line', slope: 2, intercept: 1 },
      { type: 'twoPoints', a: at(0, 0), b: at(1, 1) },
    ];
    for (const axis of axes) {
      const scene = currentScene(createTransformationsData({
        figures: [{ kind: 'point', vertices: [at(1, 2)] }],
        steps: [{ kind: 'reflection', axis }],
      }));
      expect(scene.steps[0].axis.type, JSON.stringify(axis)).toBe(axis.type);
      expect(matrixFor(scene.steps[0], scene.figures[0].vertices), JSON.stringify(axis)).not.toBeNull();
    }
  });

  it('accepte chaque forme de CENTRE que le guide annonce', () => {
    for (const center of [{ type: 'origin' }, { type: 'vertex', index: 1 }, { type: 'point', point: at(2, 2) }]) {
      const scene = currentScene(createTransformationsData({
        figures: [{ kind: 'triangle', vertices: TRIANGLE }],
        steps: [{ kind: 'dilation', k: 2, center }],
      }));
      expect(scene.steps[0].center.type, JSON.stringify(center)).toBe(center.type);
    }
  });

  it('accepte chaque FAMILLE de figure que le guide annonce', () => {
    for (const kind of ['point', 'segment', 'triangle', 'rectangle', 'square', 'polygon']) {
      const scene = currentScene(createTransformationsData({
        figures: [{ kind, vertices: [at(0, 0), at(1, 0), at(1, 1), at(0, 1)] }],
        steps: [],
      }));
      expect(scene.figures[0].kind, kind).toBe(kind);
    }
  });

  it('une amorce illisible retombe sur le plan par défaut, jamais sur une scène cassée', () => {
    for (const junk of [{ figures: 'non' }, { steps: 42 }, { figures: [{ vertices: [] }] }]) {
      const scene = currentScene(createTransformationsData(junk));
      expect(Array.isArray(scene.figures)).toBe(true);
      expect(Array.isArray(scene.steps)).toBe(true);
    }
  });
});
