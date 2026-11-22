import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import ProblemTable from './ProblemTable';

describe('ProblemTable — tableau de données ou grille de tableur', () => {
  it('un tableau ordinaire suit la page (RTL) : aucun dir="ltr" sur le cadre', () => {
    const html = renderToString(<ProblemTable head={['العلامة', '8', '10']} rows={[['التكرار', '3', '7']]} />);
    expect(html).not.toContain('data-sheet');
  });
  it('une grille de tableur se lit comme Excel : cadre LTR, la colonne A à gauche, texte arabe isolé', () => {
    const html = renderToString(<ProblemTable sheet head={['', 'A', 'B']} rows={[['1', 'التلميذ', 'الطول'], ['2', 'أمين', '158']]} />);
    expect(html).toMatch(/dir="ltr"[^>]*data-sheet/);
    expect(html.indexOf('>A<')).toBeLessThan(html.indexOf('>B<'));
    expect(html).toContain('dir="auto"');
  });
});
