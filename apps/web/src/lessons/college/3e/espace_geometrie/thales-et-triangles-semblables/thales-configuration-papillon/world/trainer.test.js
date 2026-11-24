// « Entraîne-toi » of thales-configuration-papillon: the shared checks (authoring kit), then the lesson's own — every
// exam answer computed HERE by the proportion itself, the false rules its students hold refused with a hint, the figures
// the platform's own and drawn at the trainer's 12 px floor, every sentence of the questions bounded (B26).
import { describe, it, expect } from 'vitest';
import { describeTrainer } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { collisions, readBank, storiesOf } from '../../../../../../common/gameworld/kit/authoring/test/bank.js';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { trainerFigure } from '../../../../../../common/gameworld/kit/trainerFigure';
import { validateGeoFigure } from '../../../../../../common/components/geoFigure';
import { chainHolds, sameRatio } from '../../../../../../common/gameworld/kit/authoring/test/ratios';
import { KNOWLEDGE } from './knowledge';
import { trainerEvidence } from './evidence';
import { PLAN_OF, answerLabel, check, solution, trainer } from './trainer';
import { FIGURES, NUMBERS, minus, over, plus, times, write } from './math';

const ID = 'thales-configuration-papillon';
const CARDS = KNOWLEDGE.graph.nodes.map((n) => n.id);
const EXAM = ['rapport', 'rapportTravers', 'rapports', 'longueur', 'travers', 'emboite'];

describeTrainer({
  trainer,
  check,
  solution,
  answerLabel,
  evidenceOf: trainerEvidence,
  planOf: PLAN_OF,
  cards: CARDS,
  kinds: ['tap', 'tf', ...EXAM],
});

const all = (seeds = 30) =>
  CARDS.flatMap((card) =>
    Array.from({ length: seeds }, (_, s) => trainer.makeSession(rng((s + 1) * 7907 + card.length), card)).flat(),
  );
const num = (x) => write(x);

describe(`${ID} — its own trainer`, () => {
  it('every exam answer is computed HERE from the lengths the question gives, by the proportion itself', () => {
    const seen = new Set();
    for (const q of all()) {
      if (q.format !== 'exam' || q.kind === 'tf') continue;
      seen.add(q.kind);
      const v = solution(q);
      const f = q.f;
      switch (q.kind) {
        case 'rapport':
          expect(sameRatio([v.n, v.d], [f.VM, f.VB])).toBe(true);
          break;
        case 'rapportTravers':
          // the line is given by OA and the length ACROSS O: the ratio is OA over what is left of it
          expect(sameRatio([v.n, v.d], [f.VM, minus(f.VMB, f.VM)])).toBe(true);
          break;
        case 'longueur':
        case 'travers':
        case 'emboite': {
          const fig = { ...f, [q.sol.U]: v.x };
          expect(chainHolds([fig.VM, fig.VB], [fig.VN, fig.VC], [fig.MN, fig.BC]), q.prompt).toBe(true);
          if (q.kind === 'travers') expect(num(v.w)).toBe(num(minus(f.VMB, f.VM)));
          if (q.kind === 'emboite') expect(num(v.w)).toBe(num(plus(f[q.part], f[q.piece])));
          break;
        }
        default: {
          // the three ratios: each a segment from the vertex over its partner on the same line, the parallel sides last
          const n = q.names;
          expect([v.r1n, v.r1d, v.r2n, v.r2d, v.r3n, v.r3d].join(' ')).toBe(
            [n.V + n.M, n.V + n.B, n.V + n.N, n.V + n.C, n.M + n.N, n.B + n.C].join(' '),
          );
        }
      }
    }
    expect([...seen].sort()).toEqual([...EXAM].sort());
  });

  it('the false rules students hold are refused with a hint: the partner across, the inverted ratio, the length across', () => {
    let refused = 0;
    for (const q of all(10)) {
      const v = solution(q);
      const f = q.f;
      const tries = [];
      if (q.kind === 'rapport' || q.kind === 'rapportTravers') tries.push({ n: v.d, d: v.n });
      if (q.kind === 'rapportTravers') {
        const across = over(f.VM, f.VMB);
        tries.push({ n: Number(across.n), d: Number(across.d) });
      }
      if (q.kind === 'longueur') tries.push({ x: write(over(times(f[q.sol.P], f[q.sol.D]), f[q.sol.Q])) });
      if (q.kind === 'travers')
        tries.push({ ...v, w: f.VMB }, { ...v, x: write(over(times(f.VMB, f[q.sol.P]), f.VM)) });
      if (q.kind === 'emboite') tries.push({ ...v, w: f[q.piece] });
      if (q.kind === 'rapports') tries.push({ ...v, r1d: v.r1d.replace(q.names.V, q.names.M) });
      for (const t of tries) {
        const r = check(q, t);
        expect(r.ok, `${q.kind} ${JSON.stringify(t)}`).toBe(false);
        expect(r.hint).toBeTruthy();
        refused += 1;
      }
    }
    expect(refused).toBeGreaterThan(40);
  });

  it('the across error of the butterfly is NAMED: its hint says the length passes through the vertex', () => {
    let named = 0;
    for (const q of all(10)) {
      if (q.kind !== 'travers' && q.kind !== 'rapportTravers') continue;
      const v = solution(q);
      const t =
        q.kind === 'travers'
          ? { ...v, w: q.f.VMB }
          : (() => {
              const a = over(q.f.VM, q.f.VMB);
              return { n: Number(a.n), d: Number(a.d) };
            })();
      expect(check(q, t).hint, q.prompt).toMatch(/traverse/);
      named += 1;
    }
    expect(named).toBeGreaterThan(20);
  });

  it('the figures are the platform’s own: Thalès figures, no two of their lengths on one line of the bank or a story', () => {
    const bank = readBank(ID);
    const stories = storiesOf({ exceptId: ID });
    for (const f of [...FIGURES.butterfly, ...FIGURES.nested])
      expect(chainHolds([f.VM, f.VB], [f.VN, f.VC], [f.MN, f.BC]), JSON.stringify(f)).toBe(true);
    const tracked = (x) => Number(x.replace(',', '.')) >= 10 || x.includes(',');
    for (const [kind, figs] of Object.entries(FIGURES))
      for (const fig of figs) {
        const extra =
          kind === 'butterfly'
            ? [write(plus(fig.VM, fig.VB)), write(plus(fig.VN, fig.VC))]
            : [write(minus(fig.VB, fig.VM)), write(minus(fig.VC, fig.VN))];
        const xs = [...new Set([...Object.values(fig), ...extra])].filter(tracked);
        for (let i = 0; i < xs.length; i += 1)
          for (let j = i + 1; j < xs.length; j += 1) {
            const c = collisions(bank, [xs[i], xs[j]], { stories });
            expect([c.named, c.bankLines, c.storyLines], `${xs[i]} ; ${xs[j]}`).toEqual([false, [], []]);
          }
      }
    // never the ratio of a figure of the story (the forges' rounds, attacks and last steps)
    const story = [
      ...NUMBERS.papillon.rounds,
      ...NUMBERS.papillon.attacks,
      NUMBERS.papillon.use,
      ...NUMBERS.calcul.rounds,
      ...NUMBERS.calcul.attacks,
      NUMBERS.calcul.use,
    ].map((x) => `${num(x.len.VM)};${num(x.len.VB)}`);
    for (const fig of [...FIGURES.butterfly, ...FIGURES.nested])
      expect(story, JSON.stringify(fig)).not.toContain(`${num(fig.VM)};${num(fig.VB)}`);
  });

  it('every question about a configuration carries its figure, and it FITS the trainer at its 12 px floor', () => {
    const DRAWN = ['tf', ...EXAM];
    const seen = new Set();
    for (const q of all(40)) {
      if (!DRAWN.includes(q.kind)) {
        expect(q.figure, q.kind).toBeUndefined();
        continue;
      }
      seen.add(q.kind);
      expect(q.figure, `${q.kind} ${q.prompt}`).toBeTruthy();
      expect(validateGeoFigure(q.figure), q.prompt).toEqual([]);
      const t = trainerFigure(q.figure);
      expect(t.kind).toBe('plane');
      const above = q.kind === 'rapports';
      expect(above ? t.fitsAbove : t.fits, `${q.kind} ${t.width}×${t.height} k=${t.k}`).toBe(true);
      expect(t.label).toBeGreaterThanOrEqual(12);
    }
    expect([...seen].sort()).toEqual(DRAWN.sort());
  });

  it('a figure writes the lengths its question gives and « ? » on what it asks, never the answer', () => {
    const labels = (q) => q.figure.segments.map((x) => x.label).filter((x) => x != null);
    for (const q of all(10)) {
      if (!q.figure) continue;
      if (q.kind === 'longueur' || q.kind === 'travers' || q.kind === 'emboite') {
        expect(labels(q).join(' '), q.prompt).toContain('?');
        const ans = solution(q).x;
        expect(
          labels(q).some((x) => x === ans || x.endsWith(`= ${ans}`)),
          q.prompt,
        ).toBe(false);
      }
      if (q.kind === 'rapports') expect(labels(q)).toEqual([]);
    }
  });

  it('every sentence a question writes is bounded: a prompt of at most 330 characters, a hint of at most 230 (B26)', () => {
    for (const q of all(10)) {
      expect([...q.prompt].length, q.prompt).toBeLessThanOrEqual(330);
      const r = check(q, {});
      if (r.hint) expect([...r.hint].length, r.hint).toBeLessThanOrEqual(230);
    }
  });
});
