import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import LessonBoard from './LessonBoard';
import MemoFigure from './MemoFigures';
import { openingFacts } from './lessonMemos';
import { courtCards, courtShown, courtWords } from './lessonScripts';
import { tiles } from '../../lessons/common/gameworld/rootCourts/strings';
import { Court } from '../../lessons/common/gameworld/rootCourts/courtParts';

// the board's layers (pen, pointer) are portals into `document.body`: no DOM here, they draw nothing
vi.mock('react-dom', async (orig) => ({ ...(await orig()), createPortal: () => null }));
globalThis.document ??= { body: null };

/**
 * The station `court` (a square court of « Le palais des dalles » on the board) and the memo figure `court`: pure logic computed,
 * and what each draws — the world's own court, its cards, its words (never a plank's).
 */
const rods = {
  id: 'r',
  kind: 'court',
  chapter: 'On découvre',
  title: 'Une salle',
  text: 'Une salle de 20 dalles.',
  question: 'Quelle toise fait monter la plateforme\u202f?',
  area: '20',
  rods: ['4', '5', { q: '4,47', label: 'La calculatrice' }, { root: '20', label: 'Côté de la salle' }],
  answer: ['√20'],
  after: '$4{,}47 < \\sqrt{20}$',
  cue: 'Q',
};
const areas = {
  ...rods,
  id: 'a',
  area: undefined,
  rods: undefined,
  rod: { root: '7' },
  areas: ['3,5', '7', '14'],
  answer: ['7'],
};
const noop = () => {};
const board = (step) =>
  renderToString(
    <LessonBoard
      script={{ title: 'Leçon', steps: [step] }}
      rules={{}}
      students={[]}
      seating={{}}
      memo={{ step: 0, log: [], readers: [], sealed: false }}
      setMemo={noop}
      onEndTest={noop}
      onExit={noop}
    />,
  );

describe('séance en classe — a court of « Le palais des dalles » on the board', () => {
  it('computes each card with the world’s exact law: a rod over a court, or a court under a rod', () => {
    const cards = courtCards(rods);
    expect(cards.map((c) => c.key)).toEqual(['4', '5', '4,47', '√20']);
    expect(cards.map((c) => c.out.kind)).toEqual(['band', 'jam', 'band', 'ride']);
    expect(cards.map((c) => c.label)).toEqual(['Toise', 'Toise', 'La calculatrice', 'Côté de la salle']);
    expect(cards[3].tex).toBe('\\sqrt{20}');
    expect(cards[2].tex).toBe('4{,}47');
    expect(cards.filter((c) => c.out.kind === 'ride').map((c) => c.key)).toEqual(['√20']);
    const under = courtCards(areas);
    expect(under.map((c) => [c.key, c.out.kind, c.label])).toEqual([
      ['3,5', 'jam', 'Salle'],
      ['7', 'ride', 'Salle'],
      ['14', 'band', 'Salle'],
    ]);
    // the proof waits for the riding card — or for every card when none rides
    expect(courtShown(rods, ['4', '5'])).toBe(false);
    expect(courtShown(rods, ['√20'])).toBe(true);
    const none = { ...rods, rods: ['4', '5'], answer: [] };
    expect(courtShown(none, ['4'])).toBe(false);
    expect(courtShown(none, ['5', '4'])).toBe(true);
    expect(courtWords(rods)).toMatchObject({
      card: 'Toise',
      ride: 'Elle monte',
      band: 'Une bande',
      jam: 'Elle coince',
    });
    expect(courtWords({ words: { card: 'Le bâton' } }).card).toBe('Le bâton');
  });

  it('draws the court itself, a card per rod with its own hook, and the button that lowers the platform', () => {
    const html = board(rods);
    expect(html).toContain('data-cs-court="r"');
    expect(html).toContain('data-court="20"'); // the world's own drawing, the court alone before any card
    for (const k of ['4', '5', '4,47', '√20']) expect(html).toContain(`data-cs-court-card="${k}"`);
    expect(html).toContain('data-cs-court-lower');
    expect(html).toContain('<small>La calculatrice</small>');
    expect(html).toContain('data-cs-court-shown="false"');
    expect(html).not.toMatch(/Planche|Tient|S’effondre/);
    // a given rod: the rod alone, large, until a court is chosen
    const h2 = board(areas);
    expect(h2).toContain('data-cs-court-rod');
    expect(h2).toContain('<small>Salle</small>');
    expect(h2).not.toContain('data-court=');
  });

  it('the memo figure « court »: two rods on one court, each fact computed and said in the world’s words', () => {
    const o = { id: 'x', kind: 'court', a: '38', b: '6', alt: '7', title: 'Caisse' };
    expect(openingFacts(o).first).toMatchObject({ b: '6', kind: 'band', diff: '2', r: '2', exact: false });
    expect(openingFacts(o).second).toMatchObject({ b: '7', kind: 'jam', diff: '11', exact: false });
    const html = renderToString(<MemoFigure opening={o} />);
    expect(html).toContain('data-memo-figure="court"');
    expect(html).toContain('data-memo-court="band"');
    expect(html).toContain('data-memo-court="jam"');
    expect(html).toContain('Une bande de 2\u00a0dalles'); // agreed: never « 2 dalle »
    expect(html).toContain(`Elle coince\u00a0: elle dépasse de ${tiles('11')}`); // the counter's no-break space
    const ride = renderToString(<MemoFigure opening={{ ...o, a: '14,44', b: '3,8', alt: undefined }} />);
    expect(ride).toContain('data-memo-court="ride"');
    // no fraction: the figure keeps its one-line captions (lesson 1's figures unchanged)
    expect(html).not.toContain('data-memo-frac');
  });

  it('a court or a rod that is a FRACTION: drawn with a real bar in the memo figure and on the board’s cards', () => {
    // the memo figure: the area 529/49, the rod 3 (a band of 88/49 tile) and the rod 23/7 (it rides)
    const o = { id: 'f', kind: 'court', a: '529/49', b: '3', alt: '23/7', title: 'Fraction' };
    expect(openingFacts(o).first).toMatchObject({ kind: 'band', diff: '88/49' });
    expect(openingFacts(o).second).toMatchObject({ b: '23/7', kind: 'ride' });
    const html = renderToString(<MemoFigure opening={o} />).replaceAll('<!-- -->', '');
    for (const f of ['529/49', '88/49', '23/7']) expect(html).toContain(`data-memo-frac="${f}"`);
    expect(html).not.toMatch(/>\s*\d+\/\d+/); // never a slash between two numbers in a drawn text
    expect((html.match(/<line /g) ?? []).length).toBeGreaterThanOrEqual(3); // three bars
    // the board: a fraction card keeps its fraction — LaTeX with its bar, never a decimal nor a reduced form
    const step = { ...rods, area: '722/98', rods: ['2', '18/7', '19/7', '3'], answer: ['19/7'] };
    const cards = courtCards(step);
    expect(cards.map((c) => [c.key, c.out.kind])).toEqual([
      ['2', 'band'],
      ['18/7', 'band'],
      ['19/7', 'ride'],
      ['3', 'jam'],
    ]);
    expect(cards[2].tex).toBe('\\dfrac{19}{7}');
    expect(board(step)).toContain('data-cs-court-card="19/7"');
    // a fraction card lays its label beside its two storeys (it over-ran a card of the column before: lesson 2's walk)
    expect(board(step)).toMatch(/data-cs-court-card="19\/7"[^]*?<span class="cs-rodcard__name" data-frac="">/);
    expect(board(step)).toContain('data-court="722/98"'); // the court's gate shows the area as given
  });

  it('the world’s court on the board writes every fraction over a bar: the gate, the rod, the difference', () => {
    const svgOf = (html) => html.match(/<svg[^>]*data-court=[\s\S]*?<\/svg>/)?.[0] ?? '';
    const slashText = (svg) => [...svg.matchAll(/<text[^>]*>(.*?)<\/text>/g)].some(([, t]) => /\d\/\d/.test(t));
    // the court alone, before a card: its gate 722/98 stacked
    const alone = svgOf(board({ ...rods, area: '722/98', rods: ['19/7'], answer: ['19/7'] }));
    expect(alone).toContain('data-court-frac="722/98"');
    expect(slashText(alone)).toBe(false);
    // each card as the station draws it once lowered (`<Court area={card.area} rod={card.rod} />`)
    const step = { ...rods, area: '529/49', rods: ['3', '23/7', '24/7'], answer: ['23/7'] };
    for (const c of courtCards(step)) {
      const svg = renderToString(<Court area={c.area} rod={c.rod} stage="done" />);
      expect(slashText(svg), c.key).toBe(false);
      expect(svg).toContain('data-court-frac="529/49"');
      if (c.key.includes('/')) expect(svg).toContain(`data-court-frac="${c.key}"`);
      if (c.out.kind !== 'ride') expect(svg).toContain(`data-court-fact-frac="${c.out.diff}"`);
    }
    // a whole court and a decimal rod: one line each, no bar (lesson 1's board unchanged)
    const whole = renderToString(<Court area="20" rod={{ q: '4,47' }} stage="done" />);
    expect(whole).not.toContain('crt-frac');
    expect(whole).toContain('viewBox="0 0 640 240"');
  });
});
