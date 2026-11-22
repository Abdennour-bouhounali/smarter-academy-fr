import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { Sort } from './gestures';
import { MISTAKES } from './families';
import kitSrc from './LaunchKit.jsx?raw';
import gesturesSrc from './gestures.jsx?raw';
import familiesSrc from './families.js?raw';

// a CSS file imported with ?raw is emptied by the test config: read from disk
const cssSrc = readFileSync(new URL('./launchKit.css', import.meta.url), 'utf8');
const ARABIC = new RegExp('[\u0600-\u06FF]'); // built from code points: no Arabic character in this file
const noop = () => {};

describe('L’échauffement — French, left to right', () => {
  it('lays the sort out from the LEFT: first box, then the card, then the second box, with nothing reversing it', () => {
    const q = {
      gesture: 'sort',
      bins: [
        { id: 'yes', label: 'Oui' },
        { id: 'no', label: 'Non' },
      ],
      cards: [{ id: 'c1', text: 'Est un multiple de 3', say: true }],
    };
    const html = renderToString(<Sort q={q} value={{}} onChange={noop} locked={false} play={noop} />);
    const yes = html.indexOf('data-lk-bin="yes"');
    const hand = html.indexOf('class="lk-hand"');
    const no = html.indexOf('data-lk-bin="no"');
    expect(yes).toBeGreaterThan(-1);
    expect(yes).toBeLessThan(hand);
    expect(hand).toBeLessThan(no);
    expect(html).not.toContain('dir="rtl"');
    expect(html).toContain('Glisse la carte dans sa boîte');
    // the grid of the sort reads in the document's direction (ltr): no reversal, no reordering
    const rule = cssSrc.match(/\.lk-sort \{[^}]*\}/)[0];
    expect(rule).not.toMatch(/direction|reverse|order:/);
  });

  it('holds no Arabic, no right-to-left switch and no Arabic font', () => {
    for (const src of [kitSrc, gesturesSrc, familiesSrc, cssSrc]) {
      expect(src).not.toMatch(ARABIC);
      expect(src).not.toMatch(/dir="rtl"|direction:\s*rtl|row-reverse/);
      expect(src).not.toMatch(/font-family:[^;]*(Cairo|Tajawal|Amiri|Naskh|Kufi)/);
    }
    // « next » points forward, to the right
    expect(kitSrc).toContain('▸');
    expect(kitSrc).not.toContain('◂');
  });

  it('names every mistake in French, with French typography, never as « faux »', () => {
    for (const text of Object.values(MISTAKES)) {
      expect(text).not.toMatch(ARABIC);
      expect(text.startsWith('Attention : ')).toBe(true);
      expect(text).not.toMatch(/faux/i);
      expect(text).not.toMatch(/ [:;!?]/); // a no-break space, never a plain one, before : ; ! ?
      expect(text).not.toContain("'"); // the typographic apostrophe
    }
  });
});
