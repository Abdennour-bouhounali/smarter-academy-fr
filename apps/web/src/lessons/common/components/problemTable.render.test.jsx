import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import ProblemTable from './ProblemTable';

describe('ProblemTable — tableau de données ou grille de tableur', () => {
  it('un tableau ordinaire se lit de gauche à droite : l’en-tête de ligne d’abord, puis les valeurs dans l’ordre', () => {
    const html = renderToString(<ProblemTable head={['Note', '8', '10']} rows={[['Effectif', '3', '7']]} />);
    expect(html).not.toContain('data-sheet');
    expect(html).not.toMatch(/dir="rtl"|direction:\s*rtl/);
    // L'ordre du DOM est l'ordre de lecture (gauche → droite) : « Note » puis 8 puis 10, « Effectif » puis 3 puis 7.
    expect(html.indexOf('Note')).toBeLessThan(html.indexOf('>8<'));
    expect(html.indexOf('>8<')).toBeLessThan(html.indexOf('>10<'));
    expect(html.indexOf('Effectif')).toBeLessThan(html.indexOf('>3<'));
    expect(html.indexOf('>3<')).toBeLessThan(html.indexOf('>7<'));
  });
  it('une grille de tableur se lit comme un tableur : la colonne A à gauche, sans île de direction', () => {
    const html = renderToString(<ProblemTable sheet head={['', 'A', 'B']} rows={[['1', 'Élève', 'Taille'], ['2', 'Léa', '158']]} />);
    expect(html).toContain('data-sheet');
    expect(html).not.toMatch(/dir="/);
    expect(html.indexOf('>A<')).toBeLessThan(html.indexOf('>B<'));
    expect(html.indexOf('Élève')).toBeLessThan(html.indexOf('Taille'));
  });
});
