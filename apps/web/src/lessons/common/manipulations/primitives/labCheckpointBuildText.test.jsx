import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { BuildAnswer } from './LabCheckpoint';
import * as C from './labCheckpoint';

/**
 * Tuile de TEXTE brut dans `build` (opt-in, 2026-11-11, jidaa-maadum — verdict L2.3) : `{ text: 'أو' }`. Les tuiles nombre / chaîne gardent
 * leur chemin ; la valeur comparée d'une tuile de texte est sa chaîne, dans `expected`, `accept`, `preset`.
 */
const k = (s) => s;
const OR = {
  id: 'or', kind: 'build', slots: ['a', 'sep', 'b'], ops: ['', ''],
  tiles: ['x − 1', 'x + 4', { text: 'أو' }, { text: 'معًا' }], expected: ['x − 1', 'أو', 'x + 4'],
  accept: [['x + 4', 'أو', 'x − 1']], hints: ['h1', 'h2'],
};
const html = (q, o = {}) => renderToString(<BuildAnswer q={q} settled={false} revealed={false} onAnswer={() => {}} k={k} {...o} />);

describe('build — plain-text tile', () => {
  it('renders a text tile as Arabic text (rtl, data-lab-checkpoint-text) next to the unchanged formula tiles', () => {
    const h = html(OR);
    expect(h.match(/data-lab-checkpoint-text/g)).toHaveLength(2);
    expect(h).toContain('أو');
    expect(h).toContain('معًا');
    expect(h).toContain('data-lab-checkpoint-tile="3"');
    expect(h).toContain('x − 1');
    // a build with NO text tile has no text marker at all (today's path)
    expect(html({ ...OR, tiles: ['x − 1', 'x + 4', 'o'], expected: ['x − 1', 'o', 'x + 4'], accept: undefined })).not.toContain('data-lab-checkpoint-text');
  });
  it('judges the text by its string: the connector tile is right, the decoy tile is not; the swapped order is accepted', () => {
    expect(C.isCorrect(OR, ['x − 1', 'أو', 'x + 4'])).toBe(true);
    expect(C.isCorrect(OR, ['x + 4', 'أو', 'x − 1'])).toBe(true);
    expect(C.isCorrect(OR, ['x − 1', 'معًا', 'x + 4'])).toBe(false);
    expect(C.submit(C.fresh(), OR, ['x − 1', 'معًا', 'x + 4']).status).toBe('wrong');
    expect(C.submit(C.fresh(), OR, ['x − 1', 'أو', 'x + 4']).status).toBe('right');
  });
  it('a preset text value is found among the object tiles; the revealed answer shows the text', () => {
    const h = html({ ...OR, preset: [null, 'أو', null] });
    // the preset tile is placed: the second slot shows it, so the connector tile button is disabled
    expect(h).toMatch(/<button[^>]*data-lab-checkpoint-tile="2"/);
    expect(h.match(/<button[^>]*disabled=""[^>]*data-lab-checkpoint-tile="2"/)).not.toBeNull();
    const r = html(OR, { settled: true, revealed: true });
    expect(r).toContain('data-lab-checkpoint-text');
  });
  it('number tiles keep their path (value = the tile, 0 is a value)', () => {
    const q = { id: 'n', kind: 'build', slots: ['n', 'g', 'q', 'r'], tiles: [0, 5, 15, 3], expected: [15, 3, 5, 0], hints: ['h1', 'h2'] };
    expect(C.isCorrect(q, [15, 3, 5, 0])).toBe(true);
    expect(html(q)).not.toContain('data-lab-checkpoint-text');
  });
});
