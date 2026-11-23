// The investigation `sheet` (InquirySheet.jsx): mounted by `Inquiry` on its kind, played stage by stage through its
// reducer (sheet.js) and drawn by its pure view. Server render.
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Inquiry from './Inquiry';
import { SheetView } from './InquirySheet';
import { initSheet, sheetReducer } from './sheet';

globalThis.window = globalThis.window ?? {};

const SPEC = {
  kind: 'sheet',
  rounds: [{ n: 2431 }, { n: 4641 }, { n: 3127 }],
  text: {
    lead: (n) => `lead(${n})`,
    goal: (n) => `goal(${n})`,
    primeHead: 'head',
    ask: (f) => `ask[${f.n}:${f.lines}]`,
    prime: 'prime',
    held: (a) => `held[${a.before}:${a.p}:${a.after}]`,
    miss: (a) => `miss[${a.before}:${a.p}:${a.r}]`,
    notPrime: (f) => `notPrime[${f.n}:${f.zeros.join('.')}]`,
    notebook: 'notes',
    end: (f) => `end[${f.n}:${f.factors.join('.')}]`,
    foundLine: (r) => `line[${r.n}]`,
    next: 'next',
    done: 'done',
  },
};
const noop = () => {};
const act = { line: noop, prime: noop, next: noop };
const play = (actions, from = initSheet(SPEC)) => actions.reduce((s, a) => sheetReducer(SPEC, s, a), from);
const fill = (s) => {
  let x = s;
  while (x.stage === 'fill') x = sheetReducer(SPEC, x, { type: 'tick' });
  return x;
};
const view = (state) => renderToString(<SheetView spec={SPEC} state={state} act={act} />).replaceAll('<!-- -->', '');
const clean = (html) => expect(html).not.toMatch(/undefined|NaN|\[object/);
const visible = (html) =>
  html
    .replace(/<annotation[^>]*>.*?<\/annotation>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');

describe('sheet — the screen', () => {
  it('is mounted by Inquiry on its kind and opens with column B still empty: the world fills it', () => {
    const html = renderToString(<Inquiry spec={SPEC} onDone={noop} />).replaceAll('<!-- -->', '');
    clean(html);
    expect(html).toContain('data-iq="sheet"');
    expect(html).toContain('data-iq-stage="fill"');
    expect(html).toContain('data-iq-lines="15"');
    expect(html).toContain('data-iq-line="47"');
    expect(html).not.toContain('data-iq-line="53"');
    expect(html).not.toContain('data-iq-rest=');
    expect(html).toMatch(/data-iq-prime=""[^>]*disabled|disabled[^>]*data-iq-prime/);
  });

  it('a spreadsheet: letters A and B, row numbers, A1 the lesson’s word, B1 the formula « =MOD(2431;A2) », plain numbers under it', () => {
    const html = view(fill(initSheet(SPEC)));
    clean(html);
    expect(html).toContain('data-iq-formula="true">=MOD(2431;A2)<');
    expect(html).toContain('>head<');
    expect(html).toMatch(/<span>A<\/span><span>B<\/span>/);
    // 15 lines: two blocks (8 + 7), rows numbered on from 2 to 16 across them
    expect(html).toContain('data-iq-blocks="2"');
    expect(html).toMatch(/data-iq-line="2"[^>]*data-iq-rest="1"/); // 2431 = 2 × 1215 + 1
    expect(html).toMatch(/data-iq-line="11"[^>]*data-iq-rest="0"/);
    expect(html).toContain('<span class="iq-sheet__n">16</span>');
    expect(html).not.toContain('<span class="iq-sheet__n">17</span>');
    // column B holds numbers only: no formula under its first cell
    expect(html.match(/=MOD\(/g)).toHaveLength(2); // B1 of each block (the second dimmed, an echo)
  });

  it('a wrong line shows its remainder as what happened; a right line divides, writes the notebook and shortens the sheet', () => {
    const miss = view(play([{ type: 'line', p: 7 }], fill(initSheet(SPEC))));
    expect(miss).toMatch(/data-iq-line="7"[^>]*data-iq-said="miss"/);
    expect(miss).toContain('miss[2431:7:2]');
    expect(miss).toContain('data-iq-n="2431"');
    const held = play([{ type: 'line', p: 11 }], fill(initSheet(SPEC)));
    const html = view(held);
    expect(html).toContain('data-iq-n="221"');
    expect(html).toContain('data-iq-lines="6"');
    expect(html).toContain('data-iq-blocks="1"');
    expect(html).toContain('data-iq-note="2431:11:221"');
    expect(html).toContain('2431 \\div 11 = 221');
    expect(html).toContain('held[2431:11:221]');
    expect(html).toContain('data-iq-formula="true">=MOD(221;A2)<');
    expect(html).not.toContain('data-iq-rest='); // the world fills it again
  });

  // BEHAVIOUR CHANGED (main session, 2026-11-23): the refusal used to OUTLINE the lines showing 0 (`data-iq-zero`,
  // `is-zero`) — the world did the reading for him. Now only the sentence stays; the sheet looks as before he said it, and
  // the line he then clicks plays as any line.
  it('« prime » with a 0 on the sheet is refused by the sentence alone, no line outlined; without one it is accepted and the round ends', () => {
    const before = fill(initSheet(SPEC));
    const refusedState = play([{ type: 'prime' }], before);
    const refused = view(refusedState);
    expect(refused).toContain('notPrime[2431:11.13.17]');
    expect(refused).not.toContain('data-iq-zero');
    expect(refused).not.toContain('is-zero');
    expect(refused).toContain('data-iq-stage="pick"');
    // every line is still there to click, drawn exactly as on the sheet before « prime »: same rests, same looks
    const lines = (html) => html.match(/<button[^>]*data-iq-line="\d+"[^>]*>/g);
    expect(lines(refused)).toEqual(lines(view(before)));
    for (const b of lines(refused)) expect(b).not.toContain('disabled');
    // the line he then clicks behaves as before: 11 holds, the sheet goes on with 221
    const after = view(play([{ type: 'line', p: 11 }], refusedState));
    expect(after).toContain('data-iq-note="2431:11:221"');
    expect(after).toContain('data-iq-n="221"');
    let s = fill(initSheet(SPEC));
    for (const p of [11, 13]) s = fill(play([{ type: 'line', p }], s));
    s = play([{ type: 'prime' }], s);
    const end = view(s);
    expect(end).toContain('data-iq-stage="seen"');
    expect(end).toContain('end[2431:11.13.17]');
    expect(end).not.toContain('data-iq-sheet');
    expect(end.match(/data-iq-note=/g)).toHaveLength(2);
    expect(end).toContain('>next<');
    expect(end).toContain('line[2431]');
  });

  it('3 127: 16 lines up to 53 in two blocks of 8 — the largest sheet of the design; 4 641: 19 lines, 10 + 9', () => {
    const at = (ri, n) => fill({ ...initSheet(SPEC), ri, n });
    const a = view(at(2, 3127));
    expect(a).toContain('data-iq-lines="16"');
    expect(a.match(/data-iq-block="\d"/g)).toHaveLength(2);
    expect(a).toMatch(/data-iq-line="53"[^>]*data-iq-rest="0"/);
    expect(a).toContain('--rows:8');
    const b = view(at(1, 4641));
    expect(b).toContain('data-iq-lines="19"');
    expect(b).toContain('--rows:10');
  });

  it('the kit writes no sentence of its own: every word on screen is the lesson’s, but for the formula and A / B', () => {
    for (const st of [fill(initSheet(SPEC)), play([{ type: 'prime' }], fill(initSheet(SPEC)))]) {
      const text = visible(view(st));
      expect(text).not.toMatch(/[àâçéèêëîïôûùüœ’«»]/u);
      for (const w of text.match(/[A-Za-zÀ-ÿ]{3,}/gu) ?? [])
        expect(['lead', 'goal', 'head', 'ask', 'prime', 'miss', 'held', 'notPrime', 'notes', 'MOD', 'div']).toContain(
          w,
        );
    }
  });
});
