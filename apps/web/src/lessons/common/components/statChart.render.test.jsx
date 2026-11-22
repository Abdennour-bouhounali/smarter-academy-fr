import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import StatementFigure from './StatementFigure';

const text = (html) => html.replace(/<[^>]+>/g, ' ');

describe('StatChart — dessiné en SVG, lu de gauche à droite, arabe en DOM', () => {
  it('un مخطط بالأعمدة : barres, catégories, titres d’axes, sans valeurs écrites', () => {
    const html = renderToString(<StatementFigure kind="chart" type="bar" ariaLabel="مخطط بالأعمدة" xTitle="العمر (سنة)" yTitle="عدد التلاميذ"
      y={{ max: 10, step: 2 }} bars={[{ label: '13', value: 6 }, { label: '14', value: 8 }, { label: '15', missing: true }]} />);
    expect(html).toContain('data-stat-chart="bar"');
    expect((html.match(/data-chart-bar/g) ?? []).length).toBe(2);
    expect(html).toContain('data-chart-missing');
    expect(text(html)).toContain('العمر (سنة)');
    expect(text(html)).toContain('عدد التلاميذ');
    expect(html).toContain('aria-label="مخطط بالأعمدة"');
    expect(html).toMatch(/dir="ltr"/);
    expect(html).not.toContain('<img');
  });
  it('un مخطط دائري : un secteur et une entrée de légende arabe par partie', () => {
    const html = renderToString(<StatementFigure kind="chart" type="pie" ariaLabel="مخطط دائري" show="percent"
      parts={[{ label: 'كرة القدم', value: 3 }, { label: 'السباحة', value: 1 }]} />);
    expect((html.match(/data-chart-sector/g) ?? []).length).toBe(2);
    expect(text(html)).toContain('75%');
    expect(text(html)).toContain('كرة القدم');
  });
  it('sans kind, la figure reste une GeoFigure', () => {
    const html = renderToString(<StatementFigure points={{ A: [0, 0], B: [2, 0] }} segments={[['A', 'B']]} ariaLabel="قطعة" />);
    expect(html).toContain('data-geo-figure');
  });
});
