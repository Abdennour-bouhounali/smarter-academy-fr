import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import EquationDisplay from './EquationDisplay';

// Garde (2026-11-10) : dans la colonne étroite du lecteur, une égalité longue débordait de son cadre (élément flex sans `min-w-0`)
// et l'ancêtre `overflow-hidden` la coupait à gauche. La ligne doit pouvoir se réduire (min-w-0, max-w-full) et passer par FitLine,
// qui baisse la taille de police au lieu de couper ou de passer à la ligne.
describe('EquationDisplay — une formule longue tient dans son cadre', () => {
  const html = renderToString(<EquationDisplay tex={'\\sqrt{32} = \\sqrt{2^2 \\times 8} = 2\\sqrt{8}'} tone="ok" note="ملاحظة" />);

  it('la ligne de la formule peut se réduire dans un conteneur flex', () => {
    const line = html.match(/<div[^>]*data-equation-line[^>]*>/)?.[0] ?? '';
    expect(line).toContain('min-w-0');
    expect(line).toContain('max-w-full');
    expect(line).toContain('dir="ltr"');
  });

  it('la formule passe par FitLine (cadre borné, ligne jamais coupée)', () => {
    expect(html).toMatch(/<span[^>]*class="block min-w-0 max-w-full overflow-hidden[^"]*"/);
    expect(html).toContain('whitespace-nowrap');
  });
});
