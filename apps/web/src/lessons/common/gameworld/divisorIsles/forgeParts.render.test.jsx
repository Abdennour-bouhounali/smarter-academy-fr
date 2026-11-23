import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { FORGE_PARTS } from './forgeParts';
import { outcome } from './ruleForge';

// the investigation screens expose their state on `window` (dev only): give the server render one
globalThis.window = globalThis.window ?? {};

const { Mirror, Line, beats } = FORGE_PARTS;
const count = (out, re) => (out.match(re) ?? []).length;
/** A sharing case as a lesson writes it (forgeParts.jsx › `c.deal`). */
const sharing = (nA, nB, k, claim, extra = {}) => {
  const fits = nA % k === 0 && nB % k === 0;
  return {
    ...outcome(fits ? nB : nA, k),
    fits,
    held: fits,
    tag: `tag[${k}]`,
    deal: { a: { n: nA, item: 'rose' }, b: { n: nB, item: 'lily' }, k, lot: 'vase', ...(claim ? { claim } : {}) },
    ...extra,
  };
};

describe('a case of a forge that is a SHARING — drawn as the experiment draws it, never as a bridge', () => {
  it('ask: the two collections on the table, one item each, and the k EMPTY lots — no plank, no cell', () => {
    const out = renderToString(<Mirror c={sharing(36, 60, 12)} stage="ask" fast />);
    expect(out).toContain('data-rf-deal="36:60:12"');
    // read left to right (the French screen, 2026-11-22): the first collection is the pile on the LEFT
    const pileX = (tag) =>
      Number(
        out.match(new RegExp(`data-iq-pile="${tag}"[^>]*>(?:<rect[^>]*>)?<text class="iqd-count" x="([\\d.]+)"`))[1],
      );
    expect(pileX('a')).toBeLessThan(pileX('b'));
    expect(out).toContain('data-rf-stage="ask"');
    expect(out).not.toContain('data-rf-bridge');
    expect(out).not.toMatch(/planche|\bcases?\b/);
    expect(count(out, /data-iq-lot="/g)).toBe(12);
    expect(count(out, /data-iq-holds="0,0"/g)).toBe(12);
    expect(out).toContain('data-iq-pile="a" data-iq-count="36"');
    expect(out).toContain('data-iq-pile="b" data-iq-count="60"');
    expect(count(out, /href="#rfd-rose"/g)).toBe(36);
    expect(count(out, /href="#rfd-lily"/g)).toBe(60);
    // its own symbols (never the ids of the experiment's scene) and the number of lots written between the piles
    expect(out).toContain('id="rfd-rose"');
    expect(out).toMatch(/data-rf-deal-k="true">12</);
  });

  it('build and done: every lot holds the same; what is left stays on the table, set apart — the held / fell look', () => {
    const shared = renderToString(<Mirror c={sharing(36, 60, 12)} stage="done" fast />);
    expect(count(shared, /data-iq-holds="3,5"/g)).toBe(12);
    expect(shared).toContain('data-iq-count="0"');
    expect(shared).toMatch(/class="rf-deal is-done is-held/);
    expect(shared).not.toContain('iqd-apart');

    const left = renderToString(<Mirror c={sharing(40, 56, 6)} stage="done" fast />);
    expect(count(left, /data-iq-holds="6,9"/g)).toBe(6);
    expect(left).toContain('data-iq-pile="a" data-iq-count="4"');
    expect(left).toContain('data-iq-pile="b" data-iq-count="2"');
    expect(count(left, /iqd-apart/g)).toBe(2);
    expect(left).toMatch(/class="rf-deal is-done is-fell/);

    const building = renderToString(<Mirror c={sharing(40, 56, 6)} stage="build" fast={false} />);
    expect(building).toContain('data-rf-stage="build"');
    expect(building).toContain('animation-delay:880ms'); // the 9th lily of a lot: dealt in round 9 (110 ms a round)
    expect(beats(sharing(40, 56, 6))).toBe(9); // one stroke per round of the deal
  });

  it('a claim « each lot holds x and y » is drawn faint in the empty lots — or once over them when it would be too small', () => {
    const fits = renderToString(<Mirror c={sharing(36, 60, 12, [3, 5])} stage="ask" fast />);
    expect(count(fits, /data-iq-holds="3,5"/g)).toBe(12);
    expect(count(fits, /is-ghost/g)).toBe(12 * 8);
    expect(fits).not.toContain('data-rf-claim');

    const big = renderToString(<Mirror c={sharing(36, 60, 12, [24, 48])} stage="ask" fast />);
    expect(count(big, /data-iq-holds="0,0"/g)).toBe(12);
    expect(big).toContain('data-rf-claim="24,48"');
    expect(big).not.toMatch(/[\u0600-\u06ff]|planche|\bcases?\b/); // the claim is numbers and drawings, no word of any lesson

    // once dealt, the lots hold what the world gave — the claim is the panel's question, not the drawing's
    const done = renderToString(<Mirror c={sharing(36, 60, 12, [24, 48])} stage="done" fast />);
    expect(count(done, /data-iq-holds="3,5"/g)).toBe(12);
    expect(done).not.toContain('data-rf-claim');
  });

  it('its line of evidence: the two counts with their items, the tag, and a mini of lots — never « planche »', () => {
    const out = renderToString(<Line c={sharing(40, 56, 5)} />);
    expect(out).toContain('rf-dealhead');
    expect(out).toMatch(/<strong>40<\/strong>/);
    expect(out).toMatch(/<strong>56<\/strong>/);
    expect(out).toContain('tag[5]');
    expect(out).not.toMatch(/planche|\bcases?\b/);
    expect(out).toContain('rf-mini--deal');
    expect(count(out, /<rect/g)).toBe(5 + 1); // five lots and what is left
    const all = renderToString(<Line c={sharing(40, 56, 8)} />);
    expect(count(all, /<rect/g)).toBe(8);
    expect(count(all, /class="is-held"/g)).toBe(8);
  });

  it('a case with no `deal` is still a bridge, drawn as before', () => {
    const c = { ...outcome(56, 5), fits: false };
    const out = renderToString(<Mirror c={c} stage="ask" fast />);
    expect(out).toContain('data-rf-bridge="56:5"');
    expect(out).not.toContain('data-rf-deal');
    expect(out).toContain('planche');
    expect(renderToString(<Line c={c} />)).toContain('planche de 5');
    expect(beats(c)).toBe(c.q);
  });

  it('a bridge that is not about a plank names itself by its `head` in its line — never « planche » (A10)', () => {
    const c = { ...outcome(1003, 34), head: '1003 et 34', tag: '31 contre 2' };
    const line = renderToString(<Line c={c} />);
    expect(line).toContain('1003 et 34');
    expect(line).toContain('31 contre 2');
    expect(line).not.toContain('planche');
  });
});

/** A pair case as a lesson writes it (forgeParts.jsx › `c.pair`): one plank d on the gaps a and b. */
const pairOf = (a, b, d, extra = {}) => {
  const fits = a % d === 0 && b % d === 0;
  return { ...outcome(a % d ? a : b, d), fits, held: fits, pair: { a, b, d }, ...extra };
};

describe('a case that is a PAIR of gaps — two bridges, the same plank laid on each', () => {
  it('ask: the plank and its name once, then the two gaps one above the other, nothing laid', () => {
    const out = renderToString(<Mirror c={pairOf(16, 19, 5)} stage="ask" fast />);
    expect(out).toContain('data-rf-pair="16:19:5"');
    expect(out).not.toContain('data-rf-bridge=');
    expect(out).toContain('data-rf-stage="ask"');
    expect(count(out, /data-rf-pair-row="/g)).toBe(2);
    expect(count(out, /class="rf-cell /g)).toBe(16 + 19);
    expect(count(out, /rf-plank--sample/g)).toBe(1);
    expect(count(out, /class="rf-plank (is-alt)?"/g)).toBe(0);
    expect(count(out, /planche de 5/g)).toBe(1);
    expect(out).toContain('16\u00a0cases');
    expect(out).toContain('19\u00a0cases');
    expect(out).not.toMatch(/\$|\\/); // drawn text: no formula
  });

  it('build and done: 3 planks on each gap at once; each bridge holds or falls by itself, what is left in amber', () => {
    const c = pairOf(16, 19, 5);
    expect(beats(c)).toBe(3); // both rows laid together: max(3, 3)
    const building = renderToString(<Mirror c={c} stage="build" fast={false} />);
    expect(count(building, /class="rf-plank (is-alt)?"/g)).toBe(6);
    expect(building).toContain('animation-delay:220ms');
    expect(building).not.toMatch(/rf-pairrow is-(held|fell)/);
    const done = renderToString(<Mirror c={c} stage="done" fast />);
    // 16 = 5 × 3 + 1, 19 = 5 × 3 + 4: neither is filled, 1 + 4 cells left
    expect(count(done, /rf-pairrow is-fell/g)).toBe(2);
    expect(count(done, /rf-cell is-left/g)).toBe(1 + 4);
    expect(done).toContain('data-rf-fills="0"');

    const half = renderToString(<Mirror c={pairOf(15, 20, 3)} stage="done" fast />);
    // 15 = 3 × 5: held; 20 = 3 × 6 + 2: falls
    expect(half).toMatch(/class="rf-pairrow is-held" data-rf-pair-row="15" data-rf-fills="1"/);
    expect(half).toMatch(/class="rf-pairrow is-fell" data-rf-pair-row="20" data-rf-fills="0"/);
    expect(count(half, /rf-cell is-left/g)).toBe(2);
    expect(count(half, /class="rf-plank (is-alt)?"/g)).toBe(5 + 6);

    const both = renderToString(<Mirror c={pairOf(14, 21, 7)} stage="done" fast />);
    expect(count(both, /rf-pairrow is-held/g)).toBe(2);
    expect(both).not.toContain('is-left');
  });

  it('a plank longer than one gap: nothing is laid on it, the whole gap stays open, the plank stays shown', () => {
    const out = renderToString(<Mirror c={pairOf(15, 45, 20)} stage="done" fast />);
    expect(count(out, /rf-cell is-left/g)).toBe(15 + 5);
    expect(count(out, /rf-plank--sample/g)).toBe(1);
    expect(count(out, /class="rf-plank (is-alt)?"/g)).toBe(2);
  });

  it('a pair of thousands of cells is drawn at scale as BARS — a few rects and one stroke, never one per cell or plank', () => {
    const rects = (out) => count(out, /<rect/g);
    // 52 015 and 31 209 with a plank of 2: 26 007 + 15 604 planks — one strip per row, the cells one bar (+ the rest)
    const two = pairOf(52015, 31209, 2);
    const done = renderToString(<Mirror c={two} stage="done" fast />);
    expect(rects(done)).toBeLessThan(20);
    expect(done).toContain('data-rf-strip="26007"');
    expect(done).toContain('data-rf-strip="15604"');
    expect(done).toMatch(/class="rf-cell is-left" data-rf-cells="1"/); // 52 015 = 2 × 26 007 + 1
    expect(done).toMatch(/class="rf-pairrow is-fell" data-rf-pair-row="52015"/);
    expect(beats(two)).toBe(1);
    expect(rects(renderToString(<Line c={two} />))).toBeLessThan(12);
    // 52 015 and 31 209 with 10 403: 5 and 3 planks, wide enough to be drawn one by one; the cells one bar each
    const g = pairOf(52015, 31209, 10403);
    const built = renderToString(<Mirror c={g} stage="done" fast />);
    expect(count(built, /class="rf-plank (is-alt)?"/g)).toBe(5 + 3);
    expect(built).not.toContain('data-rf-strip');
    expect(count(built, /class="rf-cell "/g)).toBe(2);
    expect(beats(g)).toBe(5);
    // asked, before the build: each gap is one bar, nothing laid
    const ask = renderToString(<Mirror c={pairOf(1736, 980, 28)} stage="ask" fast />);
    expect(count(ask, /class="rf-cell "/g)).toBe(2);
    expect(ask).toContain('data-rf-cells="1736"');
    expect(ask).not.toMatch(/data-rf-strip|class="rf-plank (is-alt)?"/);
  });

  it('tight (beside the tiles): once laid, the band of the plank is left out — same width, less height', () => {
    const tight = renderToString(<Mirror c={pairOf(12, 18, 6)} stage="done" fast tight />);
    expect(tight).toContain('viewBox="0 50 720 100"');
    expect(tight).toContain('is-tight');
    expect(renderToString(<Mirror c={pairOf(12, 18, 6)} stage="done" fast />)).toContain('viewBox="0 0 720 150"');
    // asked: the plank is still shown, even tight
    expect(renderToString(<Mirror c={pairOf(12, 18, 6)} stage="ask" fast tight />)).toContain('viewBox="0 0 720 150"');
  });

  it('its line: both gaps, the plank, the planks the two bridges need (when counted), and a mini of two bars', () => {
    const counted = renderToString(<Line c={pairOf(198, 234, 18, { pair: { a: 198, b: 234, d: 18, need: 24 } })} />);
    expect(counted).toContain('rf-line--pair');
    expect(counted).toMatch(/<strong dir="ltr">198<\/strong> et <strong dir="ltr">234<\/strong>/);
    expect(counted).toContain('planche de 18');
    expect(counted).toContain('24\u00a0planches');
    expect(counted).toContain('rf-mini--pair');
    expect(count(counted, /<rect/g)).toBe(11 + 13); // 198 = 18 × 11, 234 = 18 × 13
    expect(count(counted, /class="is-held"/g)).toBe(24);

    const refused = renderToString(<Line c={pairOf(198, 234, 11)} />);
    expect(refused).toContain('ne les construit pas');
    // 198 = 11 × 18 (green), 234 = 11 × 21 + 3 (blue planks and an amber rest)
    expect(count(refused, /class="is-held"/g)).toBe(18);
    expect(count(refused, /class="is-left"/g)).toBe(1);
    expect(count(refused, /<rect/g)).toBe(18 + 21 + 1);
    // the lesson's own tag wins over the default
    expect(renderToString(<Line c={pairOf(16, 19, 5, { tag: 'tag[p]' })} />)).toContain('tag[p]');
  });

  it('a pair that is a FRACTION (the whole over its lit stretch) names itself by its own head, never « et … planche »', () => {
    const head = '66/78 → 33/39';
    const line = renderToString(<Line c={pairOf(78, 66, 2, { head, tag: 'la même partie' })} />);
    expect(line).toContain('rf-line--pair');
    expect(line).toContain(`<span class="rf-line__head">${head}</span>`);
    expect(line).not.toMatch(/planche|rf-pairhead/);
    expect(line).toContain('la même partie');
    // the mini still draws both bars at one scale: 39 planks of 2 on the whole, 33 on the lit stretch
    expect(count(line, /class="is-held"/g)).toBe(39 + 33);
  });

  it('a case that is not a pair is drawn exactly as before: one bridge, its own box, its own line', () => {
    const c = { ...outcome(16, 5), fits: false };
    for (const stage of ['ask', 'build', 'done']) {
      const out = renderToString(<Mirror c={c} stage={stage} fast />);
      expect(out).toContain('data-rf-bridge="16:5"');
      expect(out).toContain('viewBox="0 0 720 150"');
      expect(out).not.toMatch(/data-rf-pair|rf-pairrow/);
      expect(count(out, /class="rf-cell /g)).toBe(16);
      expect(count(out, /class="rf-plank (is-alt)?"/g)).toBe(stage === 'ask' ? 0 : 3);
    }
    expect(renderToString(<Mirror c={c} stage="done" fast tight />)).toContain('viewBox="0 48 720 102"');
    const line = renderToString(<Line c={c} />);
    expect(line).not.toMatch(/rf-line--pair|rf-mini--pair/);
    expect(line).toContain('s’effondre\u00a0: il reste 1\u00a0case');
    expect(count(line, /<rect/g)).toBe(3 + 1);
  });
});

describe('a case of a forge that is a FACTOR LADDER — its number and its planks, never one bridge', () => {
  /** A factor case as a lesson writes it (forgeParts.jsx › `c.factor`). */
  const factor = (n, planks, extra = {}) => ({
    held: true,
    factor: { n, planks, ...(extra.fell ? { fell: extra.fell } : {}) },
    ...extra.c,
  });

  it('ask: the number alone; build and done: the planks in a row, as planks, then a green 1 — no product, no power, no name', () => {
    const ask = renderToString(<Mirror c={factor(72, [2, 2, 2, 3, 3])} stage="ask" fast />);
    expect(ask).toContain('data-rf-factor="72:2.2.2.3.3"');
    expect(ask).toContain('data-rf-stage="ask"');
    expect(count(ask, /data-rf-factor-plank=/g)).toBe(0);
    expect(ask).not.toContain('data-rf-bridge');
    const done = renderToString(<Mirror c={factor(72, [2, 2, 2, 3, 3])} stage="done" fast />);
    expect(count(done, /data-rf-factor-plank="2"/g)).toBe(3);
    expect(count(done, /data-rf-factor-plank="3"/g)).toBe(2);
    expect(done).toContain('data-rf-factor-left="1"');
    expect(done).toMatch(/rf-factor__end is-one/);
    expect(done).toMatch(/class="rf-bridge rf-factor is-done is-held/);
    // the planks' lengths are live SVG text; nothing between them: no ×, no power, no word
    expect(done).not.toMatch(/×|\\times|<sup|\^|planche|facteur|premier|puissance/);
    expect(done).toContain('aria-label="72 : 2 · 2 · 2 · 3 · 3 → 1"');
  });

  it('a ladder that stopped (« one division per prime »): what is left in amber, the plank that fell on it, its look', () => {
    const c = { ...factor(72, [2, 3], { fell: 5 }), held: false };
    const out = renderToString(<Mirror c={c} stage="done" fast />);
    expect(out).toContain('data-rf-factor="72:2.3:5"');
    expect(out).toContain('data-rf-factor-left="12"');
    expect(out).toMatch(/rf-factor__end is-left/);
    // 4 holds on 12: a plank that holds is not drawn as falling — the case is refused, as a plank that does not divide
    expect(() => renderToString(<Mirror c={factor(72, [2, 3, 5])} stage="done" fast />)).toThrow(/does not hold on 12/);
    const fell = { ...factor(495, [3, 3], { fell: 9 }), held: false };
    const f = renderToString(<Mirror c={fell} stage="done" fast />);
    expect(f).toContain('data-rf-factor-fell="9"'); // 9 on 55
    expect(f).toContain('data-rf-factor-left="55"');
    expect(f).toMatch(/class="rf-bridge rf-factor is-done is-fell/);
    expect(() => renderToString(<Mirror c={factor(72, [2, 3], { fell: 4 })} stage="done" fast />)).toThrow(
      /4 holds on 12/,
    );
    expect(beats(c)).toBe(3);
    expect(beats(factor(72, [2, 2, 2, 3, 3]))).toBe(5);
  });

  it('its line names the number and the planks — never « a planche b » — and where they took it', () => {
    const one = renderToString(<Line c={factor(72, [2, 2, 2, 3, 3])} />).replaceAll('<!-- -->', '');
    expect(one).toContain('rf-line--factor');
    expect(one).toContain('data-rf-factor-head="72:2.2.2.3.3"');
    expect(one).toMatch(
      /<strong>72<\/strong><span class="rf-factorhead__planks"><b>2<\/b><b>2<\/b><b>2<\/b><b>3<\/b><b>3<\/b><\/span>/,
    );
    expect(one).toContain('<em>arrive à 1</em>');
    expect(one).not.toMatch(/planche de|×|\\times|<sup/);
    const stop = renderToString(<Line c={{ ...factor(72, [2, 3], { fell: 5 }), held: false }} />).replaceAll(
      '<!-- -->',
      '',
    );
    expect(stop).toContain('<em>s’arrête sur 12\u00a0: la planche de 5 tombe</em>');
    expect(stop).toContain('class="is-left"'); // the mini: an amber block where the ladder did not reach 1
    const tagged = renderToString(<Line c={{ ...factor(60, [2, 2, 3, 5]), tag: 'tag[60]' }} />);
    expect(tagged).toContain('<em>tag[60]</em>');
    // a number of four digits is written the French way, its thousands apart — the line and the mirror (first French
    // lesson: « 2431 » in the log of its sheets)
    const big = factor(2431, [11, 13, 17]);
    expect(renderToString(<Line c={big} />)).toContain('<strong>2\u202f431</strong>');
    expect(renderToString(<Mirror c={big} stage="done" fast />)).toContain('>2\u202f431</text>');
  });
});
