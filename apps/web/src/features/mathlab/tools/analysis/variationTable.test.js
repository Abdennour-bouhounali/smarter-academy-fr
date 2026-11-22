import { describe, it, expect } from 'vitest';
import { buildVariationTable, buildVariationSteps, tableRowsAt, VARIATION_STAGES } from './variationTable.js';
import { buildScene } from './buildScene.js';
import { createAnalysisData, setSource, setLab } from './analysisState.js';
import { layersForLab } from './layers.js';

/** Le tableau tel que le laboratoire « دراسة الدالة » le construit. */
const tableFor = (source, view) => {
  let data = setSource(createAnalysisData(), 'f', source);
  data = { ...setLab(data, 'study'), layers: layersForLab('study', data.layers) };
  const scene = buildScene(data, view, { withDomain: true });

  return buildVariationTable(scene, view);
};

const arrows = (table) => table.intervals.map((interval) => interval.direction);
const positions = (table) => table.columns.map((column) => (column.middle ? 'middle' : column.high ? 'high' : 'low'));
const signs = (table) => table.intervals.map((interval) => interval.sign);

describe('جدول التغيّرات', () => {
  it('lit une parabole : descend jusqu’au minimum, puis monte', () => {
    const table = tableFor('x^2-4x+3', { xMin: -1, xMax: 5, yMin: -3, yMax: 6 });
    expect(table.ok).toBe(true);
    expect(arrows(table)).toEqual(['decreasing', 'increasing']);
    expect(signs(table)).toEqual([-1, 1]);
    // La valeur du minimum est EN BAS, les bornes en haut : c'est ce que le
    // tableau dit, et c'est la seule information que sa disposition porte.
    expect(positions(table)).toEqual(['high', 'low', 'high']);
    const vertex = table.columns[1];
    expect(vertex.x).toBeCloseTo(2, 5);
    expect(vertex.value).toBeCloseTo(-1, 5);
    expect(vertex.extremum).toBe('min');
    expect(vertex.derivativeZero).toBe(true);
  });

  it('lit une cubique : maximum puis minimum', () => {
    const table = tableFor('x^3-3x', { xMin: -3, xMax: 3, yMin: -4, yMax: 4 });
    expect(arrows(table)).toEqual(['increasing', 'decreasing', 'increasing']);
    expect(signs(table)).toEqual([1, -1, 1]);
    expect(positions(table)).toEqual(['low', 'high', 'low', 'high']);
    expect(table.columns[1].extremum).toBe('max');
    expect(table.columns[2].extremum).toBe('min');
  });

  /**
   * §17, dans le tableau : f′ s'annule en 0 et le signe reste `+` des deux
   * côtés. La valeur se pose donc À MI-HAUTEUR — la mettre en haut la ferait
   * lire comme un maximum, ce qu'elle n'est pas.
   */
  it('montre qu’un point stationnaire n’est PAS un extremum', () => {
    const table = tableFor('x^3', { xMin: -2, xMax: 2, yMin: -4, yMax: 4 });
    expect(arrows(table)).toEqual(['increasing', 'increasing']);
    expect(signs(table)).toEqual([1, 1]);
    expect(positions(table)[1]).toBe('middle');
    expect(table.columns[1].extremum).toBe('stationary');
    expect(table.columns[1].derivativeZero).toBe(true);
  });

  /** Une discontinuité COUPE le tableau : la double barre, et aucune valeur. */
  it('coupe le tableau à un pôle', () => {
    const table = tableFor('\\frac{1}{x}', { xMin: -4, xMax: 4, yMin: -4, yMax: 4 });
    const breaks = table.columns.filter((column) => column.kind === 'break');
    expect(breaks).toHaveLength(1);
    expect(breaks[0].x).toBeCloseTo(0, 6);
    expect(breaks[0].value).toBeNull();
    // 1/x décroît DE PART ET D'AUTRE — jamais « sur ℝ∗ » d'un seul tenant.
    expect(arrows(table)).toEqual(['decreasing', 'decreasing']);
  });

  it('lit une fonction affine : une seule flèche, aucun point critique', () => {
    const table = tableFor('2x+1', { xMin: -3, xMax: 3, yMin: -5, yMax: 7 });
    expect(table.columns).toHaveLength(2);
    expect(arrows(table)).toEqual(['increasing']);
    expect(table.columns.every((column) => column.derivativeZero === false)).toBe(true);
  });

  /**
   * Au BORD de la fenêtre, un grand nombre ne dit rien : c'est la valeur de f
   * là où le CADRE s'arrête, pas un fait sur la fonction. Le tableau montrait
   * « 430,61 » au bout de x³, qu'un élève lit comme un maximum.
   */
  it('écrit +∞ / −∞ au bord quand la fonction file', () => {
    const cubic = tableFor('x^3', { xMin: -3.68, xMax: 7.68, yMin: -4, yMax: 4 });
    expect(cubic.columns[0].infinite).toBe(-1);
    expect(cubic.columns[cubic.columns.length - 1].infinite).toBe(1);

    const square = tableFor('x^2', { xMin: -4, xMax: 4, yMin: -1, yMax: 9 });
    expect(square.columns[0].infinite).toBe(1);
    expect(square.columns[square.columns.length - 1].infinite).toBe(1);

    const exponential = tableFor('e^x', { xMin: -4, xMax: 4, yMin: -1, yMax: 9 });
    expect(exponential.columns[exponential.columns.length - 1].infinite).toBe(1);
    // À gauche, e^x tend vers 0 : c'est une VALEUR, pas un infini.
    expect(exponential.columns[0].infinite).toBeFalsy();
  });

  /**
   * Une fonction BORNÉE garde ses nombres — et une fonction qui diverge
   * porte son infini, même si elle est « petite » au bord du cadre.
   *
   * `sin` ne part nulle part : ses bords sont des valeurs. `1/x` tend vers 0
   * aux deux bouts : des valeurs aussi. Mais `2x+1` DIVERGE en ±∞, et une
   * version antérieure de ce test affirmait le contraire — c'était le test
   * qui avait tort, pas la fonction.
   */
  it('n’invente aucun infini pour une fonction bornée', () => {
    const wave = tableFor('\\sin(x)', { xMin: -7, xMax: 7, yMin: -3.4, yMax: 3.4 });
    expect(wave.columns.every((column) => !column.infinite)).toBe(true);

    const inverse = tableFor('\\frac{1}{x}', { xMin: -5, xMax: 5, yMin: -5, yMax: 5 });
    const edges = [inverse.columns[0], inverse.columns[inverse.columns.length - 1]];
    expect(edges.every((column) => !column.infinite)).toBe(true);

    const root = tableFor('\\sqrt{x}', { xMin: -1.5, xMax: 9, yMin: -2.5, yMax: 8 });
    // √x croît sans borne, mais TRÈS lentement : sur quatre décades elle ne
    // dépasse jamais cent fois le cadre, donc on n'affirme rien.
    expect(root.columns[root.columns.length - 1].infinite).toBeFalsy();
  });

  /** Une fonction qui DIVERGE porte son infini, quel que soit le zoom. */
  it.each([
    ['2x+1', { xMin: -3, xMax: 3, yMin: -5, yMax: 7 }, -1, 1],
    ['2x+1', { xMin: -20, xMax: 20, yMin: -50, yMax: 50 }, -1, 1],
    ['5-2x', { xMin: -3, xMax: 7, yMin: -6, yMax: 8 }, 1, -1],
    ['x^2', { xMin: -4, xMax: 4, yMin: -1, yMax: 9 }, 1, 1],
    ['x^2', { xMin: -10, xMax: 10, yMin: -10, yMax: 100 }, 1, 1],
    ['x^3-3x', { xMin: -3, xMax: 3, yMin: -4, yMax: 4 }, -1, 1],
    ['e^x', { xMin: -4, xMax: 4, yMin: -1, yMax: 9 }, null, 1],
    ['\\left|x\\right|', { xMin: -4, xMax: 4, yMin: -2, yMax: 6 }, 1, 1],
  ])('%s porte ses infinis aux bords', (source, view, left, right) => {
    const table = tableFor(source, view);
    const first = table.columns[0];
    const last = table.columns[table.columns.length - 1];
    if (left === null) expect(first.infinite).toBeFalsy();
    else expect(first.infinite, `${source} à gauche`).toBe(left);
    expect(last.infinite, `${source} à droite`).toBe(right);
  });

  it('refuse poliment ce qu’il ne peut pas construire', () => {
    let data = setSource(createAnalysisData(), 'f', 'x^^2');
    data = { ...setLab(data, 'study'), layers: layersForLab('study', data.layers) };
    const table = buildVariationTable(buildScene(data, { xMin: -5, xMax: 5, yMin: -5, yMax: 5 }), { xMin: -5, xMax: 5 });
    expect(table.ok).toBe(false);
    expect(table.reason).toBe('noFunction');
    expect(table.columns).toEqual([]);
  });

  it('ne rend jamais une colonne hors de la fenêtre', () => {
    const view = { xMin: 0.5, xMax: 4, yMin: -5, yMax: 10 };
    const table = tableFor('x^3-3x', view);
    for (const column of table.columns) {
      expect(column.x).toBeGreaterThanOrEqual(view.xMin - 1e-6);
      expect(column.x).toBeLessThanOrEqual(view.xMax + 1e-6);
    }
  });
});

describe('la construction pas à pas du جدول التغيّرات', () => {
  const VIEW = { xMin: -1, xMax: 5, yMin: -3, yMax: 6 };
  const sceneFor = (source, view = VIEW) => {
    let data = setSource(createAnalysisData(), 'f', source);
    data = { ...setLab(data, 'study'), layers: layersForLab('study', data.layers) };

    return buildScene(data, view, { withDomain: true });
  };

  it('six pas dans l’ordre du manuel ; le tableau complet est le DERNIER', () => {
    const scene = sceneFor('x^2-4x+3');
    const table = buildVariationTable(scene, VIEW);
    const result = buildVariationSteps(scene, table);
    expect(result.ok).toBe(true);
    expect(result.steps.map((step) => step.kind)).toEqual([...VARIATION_STAGES]);
    expect(result.steps.map((step) => step.tableRows)).toEqual([0, 0, 1, 2, 3, 4]);
    expect(result.steps[0].tableRows).not.toBe(4);
    expect(result.steps.at(-1)).toMatchObject({ kind: 'values', tone: 'result', tableRows: 4 });
    expect(result.steps.filter((step) => step.tone === 'result')).toHaveLength(1);
  });

  it('chaque pas porte ce que le tableau dit à cette ligne', () => {
    const scene = sceneFor('x^2-4x+3');
    const table = buildVariationTable(scene, VIEW);
    const [domain, derivative, zeros, sign, arrows, values] = buildVariationSteps(scene, table).steps;
    expect(domain.domain.length).toBeGreaterThan(0);
    expect(derivative.derivativeSource).toBe('2x - 4');
    expect(zeros.zeros).toHaveLength(1);
    expect(zeros.zeros[0]).toBeCloseTo(2, 5);
    expect(sign.signs).toEqual([-1, 1]);
    expect(arrows.directions).toEqual(['decreasing', 'increasing']);
    expect(values.values[1]).toBeCloseTo(-1, 5);
  });

  it('1/x : le pôle est une colonne de la ligne x, pas un zéro de f′', () => {
    const view = { xMin: -4, xMax: 4, yMin: -5, yMax: 5 };
    const scene = sceneFor('\\frac{1}{x}', view);
    const zeros = buildVariationSteps(scene, buildVariationTable(scene, view)).steps[2];
    expect(zeros.zeros).toEqual([]);
    expect(zeros.breaks).toHaveLength(1);
  });

  it('pas de tableau, pas de construction ; les lignes suivent le curseur', () => {
    expect(buildVariationSteps(null, null).ok).toBe(false);
    expect(buildVariationSteps(sceneFor('x^2'), { ok: false }).ok).toBe(false);
    expect([0, 1, 2, 3, 4, 5, 6, 9].map(tableRowsAt)).toEqual([0, 0, 0, 1, 2, 3, 4, 4]);
  });
});
