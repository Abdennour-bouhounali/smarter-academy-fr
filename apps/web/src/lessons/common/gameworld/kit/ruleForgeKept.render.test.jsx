// A forge whose investigation is over KEEPS it (defects.md B15: leaving a screen keeps what he did): the result is saved in
// the world's flags (`flags.inquiries[key]`), and a forge opened again on that save shows his tiles and his evidence, not
// the investigation to play again. First met on the first French lesson (its first forge holds three ladders; its ✕
// brought the student back to the first ladder). A forge with nothing kept, or whose investigation WRITES the rule, opens
// on the investigation as before. Server render.
import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import RuleForge from './RuleForge';

globalThis.window = globalThis.window ?? {};
// the sound switch reads the game's store (useSyncExternalStore), which a server render cannot: it is not under test here
vi.mock('./parts', async (importOriginal) => ({ ...(await importOriginal()), SoundToggle: () => null }));

const forge = (writes = false) => ({
  key: 'toy',
  inquiry: { kind: 'toy', ...(writes ? { writes: true } : {}) },
  slots: [{ id: 'q', label: 'Ce que je fais', options: [{ id: 'a', label: 'je pose' }] }],
  text: { title: 'Le miroir', sub: 'Forge ta règle', log: 'Tes essais', frame: 'Ma règle :', buildLead: '…' },
  caseId: (c) => c.id,
  evidence: () => [],
  predictCases: () => [],
  fromInquiry: (result) => ({ rows: result.rounds.map((n) => ({ id: `row-${n}`, n })) }),
});
const gameWith = (flags) => ({
  flags,
  subscribe: () => () => {},
  getState: () => ({ sound: false }),
  setSound: () => {},
  audio: { play: () => {} },
});
const parts = {
  Mirror: () => null,
  Line: ({ c }) => <span data-row={c.n}>{c.n}</span>,
  Inquiry: () => <section data-toy-inquiry />,
};
const draw = (f, flags) =>
  renderToString(<RuleForge forge={f} parts={parts} game={gameWith(flags)} log={[]} onSeal={() => {}} />);

describe('the forge keeps a finished investigation', () => {
  it('nothing kept: it opens on the investigation', () => {
    const html = draw(forge(), {});
    expect(html).toContain('data-toy-inquiry');
    expect(html).not.toContain('data-rf="build"');
  });

  it('an investigation kept in the save: it opens on the tiles, his evidence read from what he did', () => {
    const html = draw(forge(), { inquiries: { toy: { rounds: [60, 72, 495] } } });
    expect(html).not.toContain('data-toy-inquiry');
    expect(html).toContain('data-rf="build"');
    for (const n of [60, 72, 495]) expect(html).toContain(`data-rf-row="row-${n}"`);
  });

  it('another key’s investigation is not this forge’s', () => {
    const html = draw(forge(), { inquiries: { other: { rounds: [60] } } });
    expect(html).toContain('data-toy-inquiry');
  });

  it('an investigation that writes the rule is played again', () => {
    const html = draw(forge(true), { inquiries: { toy: { rounds: [60] } } });
    expect(html).toContain('data-toy-inquiry');
  });
});
