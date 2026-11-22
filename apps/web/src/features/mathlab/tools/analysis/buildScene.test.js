import { describe, it, expect } from 'vitest';
import { buildScene, compileFunction } from './buildScene.js';
import { createAnalysisData, setSource, setLab, toggleLayer, setBounds, setRiemann } from './analysisState.js';
import { layersForLab } from './layers.js';

const VIEW = { xMin: -3.92, xMax: 7.92, yMin: -2, yMax: 9 };

/** Un document posé dans un laboratoire, avec ses couches. */
const inLab = (lab, source, patch = {}) => {
  let data = setSource(createAnalysisData(), 'f', source);
  data = { ...setLab(data, lab), layers: layersForLab(lab, data.layers), ...patch };

  return data;
};

describe('la scène résolue', () => {
  it('ouvre sur la sécante et sa pente', () => {
    const scene = buildScene(createAnalysisData(), VIEW);
    expect(scene.error).toBeNull();
    expect(scene.rate.ok).toBe(true);
    expect(scene.rate.slope).toBe(2);
    expect(scene.secant).toEqual({ slope: 2, intercept: 1 });
    expect(scene.riseRun).toMatchObject({ xA: 1, xB: 3 });
  });

  it('rend une erreur LISIBLE plutôt que de jeter', () => {
    for (const bad of ['x^^2', '((x', '@@@', '']) {
      const scene = buildScene(setSource(createAnalysisData(), 'f', bad), VIEW);
      expect(scene.error, bad).toBeTruthy();
      expect(typeof scene.error.code, bad).toBe('string');
      expect(scene.functions).toEqual([]);
    }
  });

  /**
   * §16 : les bascules commandent ce qui se DESSINE, pas ce qu'on SAIT.
   *
   * La QA visuelle a vu « لا تقطع المنحنى محور الفواصل » — aucune racine —
   * affiché pour x² − 4x + 3, dont les racines 1 et 3 traversent l'écran,
   * simplement parce que la mise en évidence venait d'être éteinte. Une
   * réponse fausse à une question de mathématiques, causée par un réglage
   * d'affichage.
   */
  it('garde TOUTE l’étude même quand les mises en évidence sont éteintes', () => {
    let data = inLab('study', 'x^2-4x+3');
    for (const key of ['roots', 'extrema', 'signStrip', 'asymptotes', 'discontinuities']) {
      data = toggleLayer(data, key);
    }
    const scene = buildScene(data, VIEW, { withDomain: true });

    expect(scene.roots.map((root) => Math.round(root.x))).toEqual([1, 3]);
    expect(scene.extrema).toHaveLength(1);
    expect(scene.extrema[0]).toMatchObject({ kind: 'min' });
    expect(scene.variation.map((interval) => interval.direction)).toEqual(['decreasing', 'increasing']);
    expect(scene.asymptotes).toBeTruthy();
    expect(Array.isArray(scene.domain)).toBe(true);
  });

  /** Ailleurs, on ne calcule QUE l'allumé : le balayage coûte (§47). */
  it('ne balaye pas la fonction dans le laboratoire de la sécante', () => {
    const scene = buildScene(createAnalysisData(), VIEW);
    expect(scene.roots).toBeUndefined();
    expect(scene.extrema).toBeUndefined();
    expect(scene.asymptotes).toBeUndefined();
  });

  it('résout la tangente, la dérivée et sa forme écrite', () => {
    const scene = buildScene(inLab('derivative', 'x^2-4x+3'), VIEW);
    expect(scene.primary.derivativeSource).toBe('2x - 4');
    expect(scene.primary.derivativeExact).toBe(true);
    expect(scene.tangentInfo.ok).toBe(true);
    expect(scene.tangentInfo.exact).toBe(true);
  });

  it('résout les deux limites et leur désaccord', () => {
    const scene = buildScene(inLab('limit', '\\frac{1}{x}', { limitPoint: 0 }), { ...VIEW, xMin: -5, xMax: 5, yMin: -5, yMax: 5 });
    expect(scene.limit.agree).toBe(false);
    expect(scene.limit.left).toMatchObject({ kind: 'infinite', sign: -1 });
    expect(scene.limit.right).toMatchObject({ kind: 'infinite', sign: 1 });
    expect(scene.approachTables.left).toHaveLength(9);
    expect(scene.asymptotes.vertical[0].x).toBe(0);
  });

  it('résout l’aire, Riemann et son écart', () => {
    const data = setRiemann(setBounds(inLab('integral', 'x^2'), 0, 2), { n: 8, mode: 'left' });
    const scene = buildScene(data, { xMin: -1, xMax: 3, yMin: -1, yMax: 5 });
    expect(scene.area.signed.value).toBeCloseTo(8 / 3, 6);
    expect(scene.riemann.rectangles).toHaveLength(8);
    expect(scene.riemannError).toBeGreaterThan(0);
    expect(scene.areaPath.length).toBeGreaterThan(0);
  });

  /** §21 : l'aire signée se découpe aux zéros, chaque morceau portant son signe. */
  it('découpe l’aire au passage de l’axe', () => {
    const data = setBounds(inLab('integral', '\\sin(x)'), 0, 2 * Math.PI);
    const scene = buildScene(data, { xMin: -1, xMax: 7, yMin: -2, yMax: 2 });
    const signs = new Set(scene.areaPath.map((piece) => piece.sign));
    expect(signs.has(1)).toBe(true);
    expect(signs.has(-1)).toBe(true);
    expect(scene.area.differ).toBe(true);
  });

  it('compile les paramètres sans recompiler à chaque curseur', () => {
    const compiled = compileFunction('ax^2+bx+c', { a: 1, b: 0, c: 0 });
    expect(compiled.ok).toBe(true);
    expect(compiled.fn(2)).toBe(4);
    // Le scope est lu à CHAQUE appel : le même objet compilé suit le curseur.
    const other = compileFunction('ax^2+bx+c', { a: 2, b: 1, c: -3 });
    expect(other.fn(2)).toBe(2 * 4 + 2 - 3);
  });
});
