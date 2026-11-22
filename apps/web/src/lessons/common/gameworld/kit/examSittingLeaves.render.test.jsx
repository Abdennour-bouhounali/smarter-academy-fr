// The answer sheet of the exam sitting in LEAVES (ExamSittingLeaves.jsx): every answer stays mounted — the others hidden, so a
// box keeps what he typed when he turns — the pager says « 1 / 2 », and a sheet that fits has no control. Server render.
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Leaves, { LeafList } from './ExamSittingLeaves';

globalThis.window = globalThis.window ?? {};

const items = ['q1', 'q2', 'q3', 'q4'].map((id, i) => ({
  id,
  quiet: i > 0 ? 'fraction' : null,
  node: <input data-answer={id} defaultValue={id === 'q1' ? '87' : ''} />,
}));
const draw = (leaves, on) =>
  renderToString(<LeafList items={items} leaves={leaves} on={on} go={() => {}} head={<h3>Feuille de réponses</h3>} />);
const liOf = (html, id) => html.match(new RegExp(`<li[^>]*>(?:(?!</li>).)*data-answer="${id}"`))[0];

describe('the answer sheet in leaves', () => {
  it('a sheet that fits: ONE leaf, every answer shown, no control', () => {
    const html = renderToString(
      <Leaves items={items} floor={12} className="xs-sheet" head={<h3>Feuille de réponses</h3>} />,
    );
    expect(html).toContain('data-xs-leaves="1"');
    expect(html).not.toContain('data-xs-leaf-nav');
    expect(html).not.toMatch(/<li[^>]*hidden/);
  });

  it('two leaves, the first on screen: its answers shown, the others MOUNTED but hidden, the pager « 1 / 2 »', () => {
    const html = draw(
      [
        [0, 1],
        [2, 3],
      ],
      0,
    );
    expect(html).toContain('data-xs-leaves="2"');
    expect(html).toContain('data-xs-leaf-on="0"');
    expect(liOf(html, 'q1')).not.toContain('hidden');
    expect(liOf(html, 'q3')).toContain('hidden');
    expect(html).toContain('data-answer="q4"'); // still mounted: it keeps what was typed
    expect(html).toMatch(/data-xs-leaf-count[^>]*>1(<!-- -->)?\u00a0\/\u00a0(<!-- -->)?2</);
    expect(html).toMatch(/<button[^>]*disabled[^>]*data-xs-leaf-prev/);
    expect(html).toContain('Suivante');
    expect(html).toContain('La suite des réponses est à la page suivante');
    // left to right: « Précédente » points left and comes first, « Suivante » points right and comes last
    const prev = html.match(/<button[^>]*data-xs-leaf-prev[^>]*>(?:(?!<\/button>).)*<\/button>/)[0];
    const next = html.match(/<button[^>]*data-xs-leaf-next[^>]*>(?:(?!<\/button>).)*<\/button>/)[0];
    expect(prev).toMatch(/lucide-chevron-left[\s\S]*Précédente/);
    expect(next).toMatch(/Suivante[\s\S]*lucide-chevron-right/);
    expect(html.indexOf('data-xs-leaf-prev')).toBeLessThan(html.indexOf('data-xs-leaf-next'));
    expect(html).not.toMatch(/\p{Script=Arabic}/u);
  });

  it('turned to the second leaf: the first leaf hidden, « Suivante » closed, « Précédente » open', () => {
    const html = draw(
      [
        [0, 1],
        [2, 3],
      ],
      1,
    );
    expect(liOf(html, 'q1')).toContain('hidden');
    expect(liOf(html, 'q4')).not.toContain('hidden');
    expect(html).toMatch(/data-xs-leaf-count[^>]*>2(<!-- -->)?\u00a0\/\u00a0(<!-- -->)?2</);
    expect(html).toMatch(/<button[^>]*disabled[^>]*data-xs-leaf-next/);
    expect(html).not.toMatch(/<button[^>]*disabled[^>]*data-xs-leaf-prev/);
    expect(html).not.toContain('La suite des réponses');
  });

  it('the fraction line is said once per leaf', () => {
    const html = draw([[0, 1, 2], [3]], 0);
    expect(liOf(html, 'q2')).not.toContain('data-xs-quiet');
    expect(liOf(html, 'q3')).toContain('data-xs-quiet');
    expect(liOf(html, 'q4')).not.toContain('data-xs-quiet'); // first fraction of its own leaf
  });
});
