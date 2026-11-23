import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import LessonBoard from './LessonBoard';
import { LadderView, LADDER_WORDS } from './LadderStation';
import { ladderStart, ladderLay, ladderNoZero } from './lessonScripts';

// the board's layers (pen, pointer) are portals into `document.body`: no DOM here, they draw nothing
vi.mock('react-dom', async (orig) => ({ ...(await orig()), createPortal: () => null }));
globalThis.document ??= { body: null };

/**
 * The station `ladder` (a factor ladder of « L’archipel des diviseurs » on the board): what it draws at each moment of a
 * ladder — the rungs as a copybook writes them, the gap now, the planks or the sheet, the fact of the last plank, the row
 * once the gap is 1 case, the proof only then. Neutral numbers (60, 1001), no lesson's.
 */
const step = {
  id: 'l',
  kind: 'ladder',
  chapter: 'On découvre',
  title: 'Un fossé',
  text: 'Un fossé de 60 cases.',
  question: 'Quelle planche, maintenant ?',
  n: 60,
  rack: [2, 3, 4, 5],
  after: 'La preuve $60 = 2 \\times 2 \\times 3 \\times 5$.',
  cue: 'Q',
};
const sheet = { ...step, id: 's', n: 1001, rack: undefined, sheet: {}, after: 'La preuve des restes.' };
const noop = () => {};
const view = (s, st, earlier = []) =>
  renderToString(
    <LadderView step={s} st={st} earlier={earlier} onLay={noop} onNoZero={noop} onUndo={noop} onAnother={noop} />,
  ).replaceAll('<!-- -->', '');
const lay = (n, planks) => planks.reduce((st, d) => ladderLay(st, d), ladderStart(n));

describe('séance en classe — a factor ladder on the board', () => {
  it('is drawn by the lesson board for a step of kind `ladder`', () => {
    const html = renderToString(
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
    expect(html).toContain('data-cs-ladder="l"');
    expect(html).toContain('data-cs-lesson-kind="ladder"');
  });

  it('before any plank: the whole gap, its planks, the question — no rung, no proof, nothing to take back', () => {
    const html = view(step, ladderStart(60));
    expect(html).toContain('data-cs-ladder-gap="60"');
    expect(html).toContain('60 cases');
    expect(html).toContain('data-cs-ladder-rungs="1"');
    for (const d of [2, 3, 4, 5]) expect(html).toContain(`data-cs-ladder-plank="${d}"`);
    expect(html).toContain('Quelle planche, maintenant');
    expect(html).not.toContain('data-cs-ladder-after');
    expect(html).not.toContain('data-cs-ladder-undo');
    expect(html).not.toContain('preuve');
  });

  it('a plank that holds writes its rung; a plank that falls shows what it left, on its card and in the fact', () => {
    const held = view(step, lay(60, [4]));
    expect(held).toContain('data-cs-ladder-last="held"');
    expect(held).toContain('data-cs-ladder-rung="60"');
    expect(held).toContain('data-cs-ladder-gap="15"');
    expect(held).toContain('data-cs-ladder-undo');
    const fell = view(step, lay(60, [4, 2]));
    expect(fell).toContain('data-cs-ladder-last="fell"');
    expect(fell).toMatch(/il reste 1[\u00a0 ]case/);
    expect(fell).toMatch(/class="cs-ladder__plank is-fell[^"]*"[^>]*data-cs-ladder-plank="2"/);
    expect(fell).toContain('reste 1');
    // the rungs read top to bottom as the copybook writes them: 60, then 15
    expect(fell.indexOf('data-cs-ladder-rung="60"')).toBeLessThan(fell.indexOf('data-cs-ladder-rung="15"'));
  });

  it('once the gap is 1 case: the row as one product, the proof, « another ladder », the planks gone', () => {
    const html = view(step, lay(60, [2, 2, 3, 5]), [lay(60, [4, 3, 5])]);
    expect(html).toContain('data-cs-ladder-done="true"');
    expect(html).toContain('data-cs-ladder-product');
    expect(html).toContain('data-cs-ladder-after');
    expect(html).toContain('preuve');
    expect(html).toContain('data-cs-ladder-another');
    expect(html).not.toContain('data-cs-ladder-rack');
    expect(html).toContain('data-cs-ladder-earlier="1"'); // the ladder the class finished before, beside it
    expect(html).toContain('data-cs-ladder-rungs="5"');
  });

  it('a step that counts its row shows each plank with its count, agreed', () => {
    const html = view({ ...step, group: true }, lay(60, [2, 2, 3, 5]));
    expect(html).toContain('data-cs-ladder-group="2:2"');
    expect(html).toContain('2 planches de 2');
    expect(html).toContain('1 planche de 3');
  });

  it('in sheet mode: column A the primes, column B the remainders; « no remainder is 0 » refused shows the zeros', () => {
    const html = view(sheet, ladderStart(1001));
    expect(html).toContain('data-cs-ladder-sheet="11"');
    expect(html).toContain('=MOD(1001;A2)');
    expect(html).toContain('data-cs-ladder-line="7" data-cs-ladder-r="0"');
    expect(html).toContain('data-cs-ladder-line="2" data-cs-ladder-r="1"');
    expect(html).not.toContain('data-cs-ladder-rack');
    expect(html).not.toContain('is-zero'); // the class reads the 0 itself
    const refused = view(sheet, ladderNoZero(sheet, ladderStart(1001)));
    expect(refused).toContain(LADDER_WORDS.zeros);
    expect(refused).toMatch(/class="cs-ladder__line[^"]*is-zero"[^>]*data-cs-ladder-line="7"/);
  });

  it('says nothing but facts, in French, left to right — and is sized by the board’s own rules', () => {
    const src = readFileSync(new URL('./LadderStation.jsx', import.meta.url), 'utf8');
    expect(src).not.toMatch(new RegExp('[\\u0600-\\u06FF]')); // built from code points: no Arabic character here
    expect(src).not.toMatch(/dir="rtl"/);
    expect(src).not.toMatch(/\bfaux\b|\bbravo\b|\berreur\b/i);
    const css = readFileSync(new URL('./classSession.css', import.meta.url), 'utf8');
    const block = css.slice(css.indexOf('.cs-ladderstep {'));
    expect(block).not.toMatch(/text-overflow:\s*ellipsis/); // no sentence cut (defects.md B5)
    // the smallest type of the station is 1rem (16 px) — what the back row reads
    const sizes = [...block.matchAll(/font-size:\s*([\d.]+)rem/g)].map((m) => Number(m[1]));
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(1);
  });
});
