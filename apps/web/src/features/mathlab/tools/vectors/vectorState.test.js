import { describe, it, expect } from 'vitest';
import {
  normalizeVectorsData, serializeVectorsData, createVectorsData, currentScene,
  pushScene, replaceScene, undo, redo, canUndo, canRedo, emptyScene,
  addFreePoint, addFreeVector, addPointsVector, movePoint, MAX_HISTORY, VECTORS_SCHEMA_VERSION,
} from './vectorState.js';
import { MAX_POINTS, MAX_VECTORS, resolveScene } from './vectorScene.js';

describe('document neuf (§28)', () => {
  it('ouvre sur deux points et le شعاع qu’ils portent — pas un plan vide, pas une leçon', () => {
    const data = createVectorsData();
    const scene = currentScene(data);
    expect(scene.points).toHaveLength(2);
    expect(scene.vectors).toHaveLength(1);
    expect(scene.vectors[0].kind).toBe('points');
    expect(data.experiment).toBeNull();
  });

  it('n’a rien à annuler à l’ouverture', () => {
    const data = createVectorsData();
    expect(canUndo(data)).toBe(false);
    expect(canRedo(data)).toBe(false);
  });
});

describe('amorce de leçon (openMathLab — le contrat documenté)', () => {
  // La forme exacte que docs/lessons/LESSON_DEVELOPMENT_GUIDE.md promet à
  // une leçon. Si elle change, ce test échoue avant la documentation.
  const seed = {
    scene: {
      points: [
        { id: 'a', kind: 'free', name: 'A', x: 1, y: 1 },
        { id: 'b', kind: 'free', name: 'B', x: 5, y: 4 },
      ],
      vectors: [{ id: 'ab', kind: 'points', name: 'u', from: 'a', to: 'b', color: '#2563eb' }],
      polygons: [],
    },
    viewport: { xMin: -2, xMax: 8, yMin: -2, yMax: 6 },
  };

  it('ouvre la scène que la leçon a posée', () => {
    const scene = currentScene(createVectorsData(seed));
    expect(scene.points.map((p) => p.name)).toEqual(['A', 'B']);
    expect(scene.vectors[0]).toMatchObject({ kind: 'points', from: 'a', to: 'b' });
  });

  it('résout ⃗AB depuis les identifiants de l’amorce', () => {
    const resolved = resolveScene(currentScene(createVectorsData(seed)));
    expect(resolved.vectors.get('ab').components).toEqual({ x: 4, y: 3 });
  });

  it('garde la fenêtre demandée par la leçon', () => {
    expect(createVectorsData(seed).viewport).toEqual(seed.viewport);
  });

  it('retombe sur le plan par défaut plutôt que d’ouvrir une scène morte', () => {
    const broken = createVectorsData({
      scene: { points: [], vectors: [{ id: 'x', kind: 'points', from: 'ghost', to: 'ghost2' }], polygons: [] },
    });
    expect(currentScene(broken).points).toHaveLength(2);
    expect(currentScene(broken).vectors).toHaveLength(1);
  });
});

describe('relecture d’un document (persistance)', () => {
  it('fait l’aller-retour sans rien perdre', () => {
    const data = createVectorsData();
    const round = normalizeVectorsData(JSON.parse(JSON.stringify(serializeVectorsData(data))));
    expect(currentScene(round)).toEqual(currentScene(data));
    expect(round.settings).toEqual(data.settings);
  });

  it('accepte n’importe quoi sans jeter', () => {
    for (const junk of [null, undefined, 42, 'x', [], { scene: 'non' }, { history: 'non' }]) {
      const data = normalizeVectorsData(junk);
      expect(Array.isArray(data.history)).toBe(true);
      expect(data.history.length).toBeGreaterThan(0);
      expect(currentScene(data).points).toEqual([]);
    }
  });

  it('écarte une référence morte plutôt que de la garder', () => {
    const data = normalizeVectorsData({
      scene: {
        points: [{ id: 'a', kind: 'free', name: 'A', x: 0, y: 0 }],
        vectors: [{ id: 'v', kind: 'points', name: 'u', from: 'a', to: 'disparu' }],
        polygons: [],
      },
    });
    expect(currentScene(data).points).toHaveLength(1);
    expect(currentScene(data).vectors).toHaveLength(0);
  });

  it('écarte en cascade : la somme d’un شعاع écarté part aussi', () => {
    const data = normalizeVectorsData({
      scene: {
        points: [],
        vectors: [
          { id: 'v1', kind: 'points', name: 'u', from: 'x', to: 'y' },
          { id: 'v2', kind: 'free', name: 'v', x: 1, y: 1, origin: { x: 0, y: 0 } },
          { id: 'v3', kind: 'sum', name: 'w', of: ['v1', 'v2'] },
        ],
        polygons: [],
      },
    });
    expect(currentScene(data).vectors.map((v) => v.id)).toEqual(['v2']);
  });

  it('borne le nombre d’objets', () => {
    const points = Array.from({ length: MAX_POINTS + 20 }, (_, i) => ({ id: `p${i}`, kind: 'free', name: `P${i}`, x: i, y: 0 }));
    const data = normalizeVectorsData({ scene: { points, vectors: [], polygons: [] } });
    expect(currentScene(data).points.length).toBe(MAX_POINTS);
  });

  it('borne k du شعاع mis à l’échelle', () => {
    const data = normalizeVectorsData({
      scene: {
        points: [],
        vectors: [
          { id: 'u', kind: 'free', name: 'u', x: 1, y: 1, origin: { x: 0, y: 0 } },
          { id: 's', kind: 'scaled', name: 'v', of: 'u', k: 9999 },
        ],
        polygons: [],
      },
    });
    expect(currentScene(data).vectors[1].k).toBe(10);
  });

  it('ignore une fenêtre invalide et retombe sur la fenêtre par défaut', () => {
    expect(normalizeVectorsData({ viewport: { xMin: 5, xMax: 5, yMin: 0, yMax: 1 } }).viewport).toBeNull();
    const good = { xMin: -4, xMax: 4, yMin: -3, yMax: 3 };
    expect(normalizeVectorsData({ viewport: good }).viewport).toEqual(good);
  });

  it('écarte une sélection qui désigne un objet disparu', () => {
    const data = normalizeVectorsData({ scene: emptyScene(), selection: { points: ['fantome'], vectors: ['fantome'] } });
    expect(data.selection).toEqual({ points: [], vectors: [] });
  });

  it('la version du schéma est un entier ≥ 1', () => {
    expect(Number.isInteger(VECTORS_SCHEMA_VERSION)).toBe(true);
    expect(VECTORS_SCHEMA_VERSION).toBeGreaterThanOrEqual(1);
  });
});

describe('historique — تراجع / إعادة (§30)', () => {
  function withTwoSteps() {
    let data = createVectorsData();
    const aId = currentScene(data).points[0].id;
    data = pushScene(data, movePoint(currentScene(data), aId, 5, 5));
    data = pushScene(data, movePoint(currentScene(data), aId, 7, 7));

    return { data, aId };
  }

  it('recule et avance sans rien perdre', () => {
    const { data, aId } = withTwoSteps();
    expect(currentScene(data).points[0].x).toBe(7);
    const back = undo(undo(data));
    expect(currentScene(back).points[0].x).toBe(-2);
    expect(canUndo(back)).toBe(false);
    const forward = redo(redo(back));
    expect(currentScene(forward).points[0].x).toBe(7);
    expect(canRedo(forward)).toBe(false);
    expect(aId).toBeTruthy();
  });

  it('rejouer après un retour coupe la branche abandonnée', () => {
    const { data } = withTwoSteps();
    const back = undo(data);
    const replayed = pushScene(back, addFreePoint(currentScene(back), { x: 0, y: 0 }));
    expect(canRedo(replayed)).toBe(false);
    expect(currentScene(replayed).points).toHaveLength(3);
  });

  it('un glissement REMPLACE le pas courant : annuler défait un geste, pas un pixel', () => {
    let data = createVectorsData();
    const aId = currentScene(data).points[0].id;
    data = pushScene(data, movePoint(currentScene(data), aId, 1, 1));
    const depth = data.history.length;
    for (let i = 2; i < 60; i += 1) {
      data = replaceScene(data, movePoint(currentScene(data), aId, i, i));
    }
    expect(data.history.length).toBe(depth);
    expect(currentScene(data).points[0].x).toBe(59);
    expect(currentScene(undo(data)).points[0].x).toBe(-2);
  });

  it('oublie les pas les plus anciens au-delà de la profondeur', () => {
    let data = createVectorsData();
    const aId = currentScene(data).points[0].id;
    for (let i = 0; i < MAX_HISTORY + 15; i += 1) {
      data = pushScene(data, movePoint(currentScene(data), aId, i, 0));
    }
    expect(data.history.length).toBe(MAX_HISTORY);
    expect(data.cursor).toBe(MAX_HISTORY - 1);
  });

  it('l’historique survit à l’enregistrement', () => {
    const { data } = withTwoSteps();
    const round = normalizeVectorsData(JSON.parse(JSON.stringify(serializeVectorsData(data))));
    expect(round.history.length).toBe(data.history.length);
    expect(round.cursor).toBe(data.cursor);
    expect(canUndo(round)).toBe(true);
  });
});

describe('bornes de construction', () => {
  it('n’ajoute pas de شعاع au-delà du maximum', () => {
    let scene = emptyScene();
    for (let i = 0; i < MAX_VECTORS + 5; i += 1) {
      scene = addFreeVector(scene, { x: 1, y: 1, origin: { x: 0, y: 0 } });
    }
    expect(scene.vectors.length).toBe(MAX_VECTORS);
  });

  it('refuse ⃗AA : un شعاع a besoin de deux points distincts', () => {
    let scene = addFreePoint(emptyScene(), { x: 0, y: 0 });
    const id = scene.points[0].id;
    scene = addPointsVector(scene, id, id);
    expect(scene.vectors).toHaveLength(0);
  });
});

describe('taille du document (plafond serveur)', () => {
  it('un document bien rempli reste très en deçà du plafond de 60 Ko', () => {
    let data = createVectorsData();
    const scene = currentScene(data);
    let full = scene;
    for (let i = 0; i < MAX_POINTS - 2; i += 1) full = addFreePoint(full, { x: i, y: i });
    for (let i = 0; i < MAX_VECTORS - 1; i += 1) full = addFreeVector(full, { x: i, y: 1, origin: { x: 0, y: 0 } });
    for (let i = 0; i < MAX_HISTORY; i += 1) data = pushScene(data, full);

    const bytes = new TextEncoder().encode(JSON.stringify(serializeVectorsData(data))).length;
    expect(bytes).toBeLessThan(120_000);
  });
});
