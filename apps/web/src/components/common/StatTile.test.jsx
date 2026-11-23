import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Users } from 'lucide-react';
import StatTile from './StatTile';

describe('StatTile', () => {
  it('groups an integer by thousands with a narrow no-break space (« 1 229 », never « 1229 »)', () => {
    const html = renderToStaticMarkup(<StatTile icon={Users} value={1229} label="Réponses" />);
    expect(html).toContain('1 229');
    expect(html).not.toContain('1229');
  });

  it('leaves a value that is not an integer as its caller wrote it', () => {
    expect(renderToStaticMarkup(<StatTile icon={Users} value="0 / 2" label="x" />)).toContain('0 / 2');
    expect(renderToStaticMarkup(<StatTile icon={Users} value={7} label="x" />)).toContain('>7<');
  });
});
