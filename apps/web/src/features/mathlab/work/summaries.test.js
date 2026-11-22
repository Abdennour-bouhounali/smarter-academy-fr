import { describe, it, expect } from 'vitest';
import { MATH_LAB_TOOLS } from '../toolRegistry.js';
import { summarizeDocument } from '../toolContract.js';

/**
 * Le RÉSUMÉ est le contrat entre un instrument et « أعمالي » : c'est lui
 * qui permet à une carte de dessiner un aperçu vrai sans charger l'outil.
 * Ces épreuves le tiennent pour TOUS les instruments à la fois — un nouveau
 * qui oublierait `summarize`, ou qui rendrait un résumé trop gros, échoue ici
 * et non chez un élève.
 */

// Ce que le serveur accepte de stocker (MathLabDocumentService::MAX_SUMMARY_BYTES).
const MAX_SUMMARY_BYTES = 2_000;

const KNOWN_KINDS = ['curve', 'solid', 'strokes', 'chart', 'equation', 'vectors', 'triangle', 'sequence', 'shapes'];

describe('chaque instrument sait se résumer', () => {
  it('tous les instruments déclarent `summarize`', () => {
    for (const tool of MATH_LAB_TOOLS) {
      expect(typeof tool.summarize, tool.id).toBe('function');
    }
  });

  it('le résumé d’un document NEUF est valide, nommé et minuscule', () => {
    for (const tool of MATH_LAB_TOOLS) {
      const summary = summarizeDocument(tool, tool.createInitialData());
      // La سبّورة naît VIDE : elle n'a rien à résumer, et c'est correct —
      // sa carte montre alors l'aperçu de repli.
      if (summary == null) {
        expect(tool.id, 'seul un instrument vide à la naissance n’a pas de résumé').toBe('whiteboard');
        continue;
      }
      expect(KNOWN_KINDS, `${tool.id} : forme d’aperçu inconnue`).toContain(summary.kind);
      const bytes = new TextEncoder().encode(JSON.stringify(summary)).length;
      expect(bytes, `${tool.id} : résumé de ${bytes} octets`).toBeLessThanOrEqual(MAX_SUMMARY_BYTES);
    }
  });

  it('le `text` d’un résumé n’est fait que de chaînes courtes — c’est ce que la recherche lit', () => {
    for (const tool of MATH_LAB_TOOLS) {
      const summary = summarizeDocument(tool, tool.createInitialData());
      if (!summary?.text) continue;
      expect(Array.isArray(summary.text), tool.id).toBe(true);
      expect(summary.text.length, tool.id).toBeLessThanOrEqual(6);
      for (const entry of summary.text) {
        expect(typeof entry, tool.id).toBe('string');
        expect(entry.length, `${tool.id} : « ${entry} »`).toBeLessThanOrEqual(80);
      }
    }
  });

  /**
   * Un résumé tourne sur un état qui vient du SERVEUR : il peut rencontrer
   * un document plus vieux que lui, ou une forme qu'il n'attendait pas. Il
   * ne doit jamais faire échouer une sauvegarde — une vignette ne vaut pas
   * un travail perdu (toolContract.summarizeDocument).
   */
  it('ne jette JAMAIS, quel que soit l’état qu’on lui donne', () => {
    const rubbish = [null, undefined, {}, [], 0, 'x', { data: null }, { functions: 'pas un tableau' }, { steps: [{}] }, { history: [null] }, { primary: {} }, { elements: [{}] }];
    for (const tool of MATH_LAB_TOOLS) {
      for (const state of rubbish) {
        expect(() => summarizeDocument(tool, state), `${tool.id} / ${JSON.stringify(state)}`).not.toThrow();
      }
    }
  });

  it('un résumé reste du JSON pur — il voyage dans une requête', () => {
    for (const tool of MATH_LAB_TOOLS) {
      const summary = summarizeDocument(tool, tool.createInitialData());
      if (!summary) continue;
      expect(() => JSON.parse(JSON.stringify(summary)), tool.id).not.toThrow();
      expect(JSON.parse(JSON.stringify(summary)), tool.id).toEqual(summary);
    }
  });
});

describe('ce que chaque résumé dit, en particulier', () => {
  const summarize = (id, data) => summarizeDocument(MATH_LAB_TOOLS.find((t) => t.id === id), data);

  it('le grapheur garde les expressions VISIBLES et leur couleur', () => {
    const summary = summarize('functionGrapher', {
      functions: [
        { id: 'a', name: 'f', expression: 'x^2', color: '#2563eb', visible: true },
        { id: 'b', name: 'g', expression: 'x+1', color: '#be123c', visible: false },
      ],
      viewport: { xMin: -8, xMax: 8, yMin: -6, yMax: 6 },
      points: [],
    });
    expect(summary.kind).toBe('curve');
    expect(summary.detail.curves).toHaveLength(1);
    expect(summary.detail.curves[0]).toMatchObject({ e: 'x^2', c: '#2563eb' });
    expect(summary.text[0]).toContain('x^2');
  });

  it('le grapheur sans aucune fonction lisible n’a pas de résumé', () => {
    expect(summarize('functionGrapher', { functions: [] })).toBeNull();
  });

  it('la géométrie 3D garde le solide et ses dimensions', () => {
    const summary = summarize('geometry3d', { shape: 'cylinder', dimensions: { radius: 1.5, height: 3 } });
    expect(summary.kind).toBe('solid');
    expect(summary.detail.shape).toBe('cylinder');
    expect(summary.detail.dimensions).toMatchObject({ radius: 1.5, height: 3 });
    expect(summary.text.join(' ')).toContain('r = 1.5');
  });

  it('un solide inconnu n’obtient PAS un faux cube', () => {
    expect(summarize('geometry3d', { shape: 'dodecahedron' })).toBeNull();
  });

  it('la سبّورة garde la silhouette et le TEXTE écrit — jamais les 2 Mo du dessin', () => {
    const summary = summarize('whiteboard', {
      elements: [
        { type: 'rectangle', x: 0, y: 0, width: 100, height: 50, strokeColor: '#1e1e1e' },
        { type: 'text', x: 10, y: 10, width: 60, height: 20, text: 'المثلث ABC' },
        { type: 'freedraw', x: 5, y: 5, width: 20, height: 20, isDeleted: true },
        // Les lettres et les mesures du bureau de géométrie ne sont pas du texte écrit.
        { type: 'text', x: 0, y: 0, width: 10, height: 20, text: 'A', customData: { geo: { kind: 'label', of: 'p1' } } },
        { type: 'text', x: 0, y: 30, width: 60, height: 20, text: 'AB = 5', customData: { geo: { kind: 'measure', of: 's1' } } },
      ],
    });
    expect(summary.kind).toBe('strokes');
    expect(summary.text).toEqual(['المثلث ABC']);
    // L'élément supprimé ne compte pas ; les lettres restent dans la silhouette.
    expect(summary.detail.total).toBe(4);
    expect(summary.detail.box).toMatchObject({ w: 100, h: 50 });
  });

  it('la سبّورة plafonne sa silhouette : un dessin énorme tient quand même dans le résumé', () => {
    const elements = Array.from({ length: 500 }, (_, i) => ({ type: 'freedraw', x: i, y: i, width: 3, height: 3, strokeColor: '#1e1e1e' }));
    const summary = summarize('whiteboard', { elements });
    expect(summary.detail.shapes.length).toBeLessThanOrEqual(40);
    expect(summary.detail.total).toBe(500);
    expect(new TextEncoder().encode(JSON.stringify(summary)).length).toBeLessThanOrEqual(MAX_SUMMARY_BYTES);
  });

  it('l’algèbre garde l’équation de départ ET celle où l’on en est', () => {
    const tool = MATH_LAB_TOOLS.find((t) => t.id === 'algebra');
    const summary = summarizeDocument(tool, tool.createInitialData());
    expect(summary.kind).toBe('equation');
    expect(typeof summary.detail.first).toBe('string');
    expect(summary.detail.steps).toBeGreaterThanOrEqual(1);
  });

  it('les متتاليات RECALCULENT leurs termes : ils ne sont jamais stockés', () => {
    const summary = summarize('sequences', {
      primary: { kind: 'arithmetic', startIndex: 0, first: 2, difference: 3, second: 1, ratio: 2, a: 2, b: 1, explicitSource: '2n + 1', ruleSource: '2u - 1' },
      count: 20,
    });
    expect(summary.kind).toBe('sequence');
    expect(summary.detail.terms.slice(0, 4)).toEqual([2, 5, 8, 11]);
    expect(summary.detail.terms.length).toBeLessThanOrEqual(12);
  });

  it('la trigonométrie garde le mode et l’angle', () => {
    const summary = summarize('trigonometry', { mode: 'triangle', angle: 30, unit: 'deg', triangle: { opposite: 5, adjacent: 8, hypotenuse: 10 } });
    expect(summary.kind).toBe('triangle');
    expect(summary.detail).toMatchObject({ mode: 'triangle', angle: 30 });
    expect(summary.detail.sides).toMatchObject({ opposite: 5, adjacent: 8 });
  });

  it('les probabilités résument les EFFECTIFS, pas les tirages', () => {
    const summary = summarize('probabilityStats', {
      mode: 'experiment', experiment: 'die',
      simulation: { counts: [10, 12, 9, 11, 8, 10], total: 60 },
    });
    expect(summary.kind).toBe('chart');
    expect(summary.detail.bars).toEqual([10, 12, 9, 11, 8, 10]);
    expect(summary.detail.draws).toBe(60);
  });

  it('les أشعة résolvent la scène du pas COURANT, pas tout l’historique', () => {
    const tool = MATH_LAB_TOOLS.find((t) => t.id === 'vectors');
    const summary = summarizeDocument(tool, tool.createInitialData());
    expect(summary.kind).toBe('vectors');
    expect(summary.detail.points.length).toBeGreaterThan(0);
    expect(summary.detail.vectors.length).toBeGreaterThan(0);
    // Chaque شعاع est résolu en coordonnées, prêt à être dessiné.
    for (const v of summary.detail.vectors) {
      expect([v.x1, v.y1, v.x2, v.y2].every(Number.isFinite)).toBe(true);
    }
  });
});
