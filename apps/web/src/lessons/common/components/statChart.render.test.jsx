import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import StatementFigure from './StatementFigure';

const text = (html) => html.replace(/<[^>]+>/g, ' ');

describe('StatChart — dessiné en SVG, lu de gauche à droite, texte en DOM', () => {
  it('un diagramme en barres : barres, catégories, titres d’axes, sans valeurs écrites', () => {
    const html = renderToString(<StatementFigure kind="chart" type="bar" ariaLabel="Diagramme en barres" xTitle="Âge (ans)" yTitle="Nombre d’élèves"
      y={{ max: 10, step: 2 }} bars={[{ label: '13', value: 6 }, { label: '14', value: 8 }, { label: '15', missing: true }]} />);
    expect(html).toContain('data-stat-chart="bar"');
    expect((html.match(/data-chart-bar/g) ?? []).length).toBe(2);
    expect(html).toContain('data-chart-missing');
    expect(text(html)).toContain('Âge (ans)');
    expect(text(html)).toContain('Nombre d’élèves');
    expect(html).toContain('aria-label="Diagramme en barres"');
    // Lu de gauche à droite sans île : aucun `dir`, aucune `direction`, le titre des ordonnées EN HAUT À GAUCHE
    // (avant le dessin, aligné au début) et celui des abscisses EN BAS À DROITE (après le dessin, aligné à la fin).
    expect(html).not.toMatch(/dir="rtl"|direction:\s*rtl/);
    expect(html.indexOf('data-chart-ytitle')).toBeLessThan(html.indexOf('<svg'));
    expect(html.indexOf('data-chart-xtitle')).toBeGreaterThan(html.indexOf('</svg>'));
    expect(html).toMatch(/text-start"[^>]*data-chart-ytitle/);
    expect(html).toMatch(/text-end"[^>]*data-chart-xtitle/);
    // Les catégories de gauche à droite : « 13 » avant « 14 » avant « 15 » (x croissant).
    const xs = ['13', '14', '15'].map((l) => Number(html.match(new RegExp(`<text x="([\\d.]+)"[^>]*>${l}</text>`))[1]));
    expect(xs[0]).toBeLessThan(xs[1]);
    expect(xs[1]).toBeLessThan(xs[2]);
    expect(text(html)).toContain('?');
    expect(html).not.toContain('<img');
  });
  it('un diagramme circulaire : un secteur et une entrée de légende par partie', () => {
    const html = renderToString(<StatementFigure kind="chart" type="pie" ariaLabel="Diagramme circulaire" show="percent"
      parts={[{ label: 'Football', value: 3 }, { label: 'Natation', value: 1 }]} />);
    expect((html.match(/data-chart-sector/g) ?? []).length).toBe(2);
    expect(text(html)).toContain('75\u00a0%');
    expect(text(html)).toContain('Football');
  });
  it('sans kind, la figure reste une GeoFigure', () => {
    const html = renderToString(<StatementFigure points={{ A: [0, 0], B: [2, 0] }} segments={[['A', 'B']]} ariaLabel="Segment [AB]" />);
    expect(html).toContain('data-geo-figure');
  });
});
