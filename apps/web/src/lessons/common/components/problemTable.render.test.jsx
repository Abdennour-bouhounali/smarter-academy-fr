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
  it('une ligne de programme part de la gauche et garde son indentation ; un nombre reste centré', () => {
    const NB = '\u00a0';
    const html = renderToString(
      <ProblemTable
        head={['Ligne', 'Instruction']}
        rows={[
          ['1', 'répéter jusqu’à ce que d > N'],
          ['2', `${NB.repeat(4)}si N modulo d = 0 alors`],
          ['3', `${NB.repeat(8)}ajouter d à la liste`],
        ]}
      />,
    );
    const cells = [...html.matchAll(/<td([^>]*)>([\s\S]*?)<\/td>/g)];
    expect(cells).toHaveLength(3);
    for (const [, attrs] of cells) {
      expect(attrs).toContain('text-left');
      expect(attrs).toContain('whitespace-pre-wrap');
    }
    // the indentation reaches the page: four, then eight no-break spaces before the words
    expect(cells[1][2].replace(/<[^>]+>/g, '')).toMatch(new RegExp(`^(${NB}|&nbsp;|&#160;){4}si N`));
    expect(cells[2][2].replace(/<[^>]+>/g, '')).toMatch(new RegExp(`^(${NB}|&nbsp;|&#160;){8}ajouter`));
    const nums = renderToString(<ProblemTable head={['Note', '8']} rows={[['Effectif', '3']]} />);
    expect(nums).not.toContain('text-left');
    // a listing (rows numbered 1, 2, 3…): its lines are what a machine reads — marked, no thousands space asked
    for (const [, attrs] of cells) expect(attrs).toContain('data-machine-text');
    const names = renderToString(<ProblemTable head={['Élève', 'Ville']} rows={[['Léa', 'Lyon'], ['Hugo', 'Metz']]} />);
    expect(names).not.toContain('data-machine-text');
  });
});
