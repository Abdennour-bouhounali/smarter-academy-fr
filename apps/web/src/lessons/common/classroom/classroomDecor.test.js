import { describe, it, expect, afterEach } from 'vitest';
import { isDecor, isAtomic, isFigureOnly, isQuestionBlock, pairFigures } from './ClassroomPaged';

// Un faux élément : ses attributs et sa position calculée (pas de DOM dans cet environnement de test).
const el = (attrs = {}, position = 'static') => ({ getAttribute: (n) => attrs[n] ?? null, position });
const realWindow = globalThis.window;

describe('isDecor — un décor n’est jamais un écran à lui seul (lecteur de mission)', () => {
  afterEach(() => { globalThis.window = realWindow; });
  const withStyles = () => { globalThis.window = { getComputedStyle: (e) => ({ position: e.position }) }; };

  it('le fond dégradé aria-hidden de la carte d’ouverture est un décor', () => {
    withStyles();
    expect(isDecor(el({ 'aria-hidden': 'true' }))).toBe(true);
  });

  it('un calque posé en absolu ou en fixe est un décor', () => {
    withStyles();
    expect(isDecor(el({}, 'absolute'))).toBe(true);
    expect(isDecor(el({}, 'fixed'))).toBe(true);
  });

  it('le contenu de la carte (titre, texte, une question) reste un élément', () => {
    withStyles();
    expect(isDecor(el())).toBe(false);
    expect(isDecor(el({ 'aria-hidden': 'false' }, 'relative'))).toBe(false);
  });
});

describe('isAtomic — un dessin ne se découpe jamais en écrans (lecteur de mission, 2026-11-11)', () => {
  const XHTML = 'http://www.w3.org/1999/xhtml';
  const node = (tagName, namespaceURI = XHTML, attrs = {}) => ({ tagName, namespaceURI, hasAttribute: (n) => n in attrs });
  it('une figure, un svg et chacun de ses traits sont insécables', () => {
    expect(isAtomic(node('FIGURE'))).toBe(true);
    expect(isAtomic(node('svg', 'http://www.w3.org/2000/svg'))).toBe(true);
    expect(isAtomic(node('g', 'http://www.w3.org/2000/svg'))).toBe(true);
  });
  it('un écran gardé entier l’est aussi ; une liste de questions ne l’est pas', () => {
    expect(isAtomic(node('DIV', XHTML, { 'data-paging-keep': '' }))).toBe(true);
    expect(isAtomic(node('DIV'))).toBe(false);
    expect(isAtomic(node('UL'))).toBe(false);
  });
});

describe('pairFigures — a figure and the question after it share ONE screen (owner, 2026-11-11)', () => {
  // a fake element: is it a figure itself, does it hold one, does it ask something, does it hold a lab, its text outside the figures
  const node = ({ fig = false, holds = false, asks = false, lab = false, text = '' } = {}) => ({
    nodeType: 1,
    matches: () => fig,
    querySelector: (sel) => {
      if (sel.includes('data-manipulation')) return lab ? {} : null;
      if (sel.includes('button')) return asks ? {} : null;
      return fig || holds ? {} : null;
    },
    cloneNode: () => ({ querySelectorAll: () => [], textContent: text }),
  });
  const figure = node({ fig: true });
  const wrappedFigure = node({ holds: true, text: 'الشكل 1' });
  const statement = node({ holds: true, text: 'في الشكل المقابل، (d) و (d′) مستقيمان متقاطعان في نقطة A. '.repeat(3) });
  const question = node({ asks: true, text: 'أيّ مساواة صحيحة؟' });
  const line = node({ text: 'استعمل الشكل للإجابة.' });
  const card = node({ text: 'خاصية طالس: إذا كان … '.repeat(20) });
  const lab = node({ asks: true, lab: true });

  it('figure-only vs statement-with-figure vs question', () => {
    expect(isFigureOnly(figure)).toBe(true);
    expect(isFigureOnly(wrappedFigure)).toBe(true);
    expect(isFigureOnly(statement)).toBe(false);
    expect(isQuestionBlock(question)).toBe(true);
    expect(isQuestionBlock(node({ holds: true, asks: true }))).toBe(false);   // a question with its own figure is already whole
    expect(isQuestionBlock(lab)).toBe(false);
    expect(isQuestionBlock(card)).toBe(false);
  });

  it('[figure] [question], [statement] [question] and [figure] [short line] [question] each become one group', () => {
    const { groups, paired } = pairFigures([[card], [figure], [question], [statement], [question], [wrappedFigure], [line], [question]]);
    expect(groups).toEqual([[card], [figure, question], [statement, question], [wrappedFigure, line, question]]);
    expect([...paired]).toEqual([1, 2, 3]);
  });

  it('a figure followed by a long card, by a lab, or alone at the end stays alone', () => {
    const { groups, paired } = pairFigures([[figure], [card], [question], [figure], [lab], [figure]]);
    expect(groups).toEqual([[figure], [card], [question], [figure], [lab], [figure]]);
    expect(paired.size).toBe(0);
  });
});
