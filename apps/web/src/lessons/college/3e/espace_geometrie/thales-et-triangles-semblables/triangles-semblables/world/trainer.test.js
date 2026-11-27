// « Entraîne-toi » of triangles-semblables: the shared checks (authoring kit), then the lesson's own — every exam answer
// computed HERE by the proportion itself, the false rules its students hold refused with a hint, the figures the platform's
// own and drawn at the trainer's 12 px floor, every sentence of the questions bounded (B26).
import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describeTrainer } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { collisions, readBank, storiesOf } from '../../../../../../common/gameworld/kit/authoring/test/bank.js';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { trainerFigure } from '../../../../../../common/gameworld/kit/trainerFigure';
import { validateGeoFigure } from '../../../../../../common/components/geoFigure';
import { sameRatio } from '../../../../../../common/gameworld/kit/authoring/test/ratios';
import { KNOWLEDGE } from './knowledge';
import { trainerEvidence } from './evidence';
import { PLAN_OF, answerLabel, check, solution, trainer } from './trainer';
import { FIGURES, equal, minus, over, plus, read, times, write } from './math';

const ID = 'triangles-semblables';
const CARDS = KNOWLEDGE.graph.nodes.map((n) => n.id);
const EXAM = ['coef', 'longueur', 'troisieme', 'homologue', 'apparier'];
const here = dirname(fileURLToPath(import.meta.url));
const PRACTICE = join(here, '../../../../../../../../../../content/practice/3e');

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
/** A quotient as the two boxes of a fraction. */
const asAnswer = (x) => ({ n: Number(read(x).n), d: Number(read(x).d) });
const asc = (sides) => Object.values(sides).sort((p, q) => Number(p.replace(',', '.')) - Number(q.replace(',', '.')));

describe(`${ID} — its own trainer`, () => {
  it('every exam answer is computed HERE from the lengths and the angles the question gives, by the proportion itself', () => {
    const seen = new Set();
    for (const q of all()) {
      if (q.format !== 'exam' || q.kind === 'tf') continue;
      seen.add(q.kind);
      const v = solution(q);
      switch (q.kind) {
        case 'coef': {
          // the shortest sides of the two triangles, ranked: their quotient is k
          const [a, b] = [asc(q.one), asc(q.two)];
          expect(sameRatio([v.n, v.d], [b[0], a[0]]), q.prompt).toBe(true);
          expect(sameRatio([b[1], a[1]], [b[2], a[2]])).toBe(true);
          expect(sameRatio([b[0], a[0]], [b[2], a[2]])).toBe(true);
          break;
        }
        case 'homologue': {
          // k pairs the side opposite the equal angle: `theirs` over `mine`
          expect(sameRatio([v.n, v.d], [q.two[q.theirs], q.one[q.mine]]), q.prompt).toBe(true);
          // all three pairs of opposite sides have the same quotient (the triangles ARE similar)
          for (let i = 0; i < 3; i += 1)
            expect(
              sameRatio([q.two[q.opposite(q.n2, q.sigma[i])], q.one[q.opposite(q.n1, i)]], [v.n, v.d]),
              q.prompt,
            ).toBe(true);
          break;
        }
        case 'longueur': {
          const [a, b] = [asc(q.one), asc(q.two)];
          // the unknown makes the three quotients equal
          expect(sameRatio([v.x, a[q.ra]], [q.Q, a[q.rg]]), q.prompt).toBe(true);
          expect(sameRatio([b[q.ra], a[q.ra]], [b[q.rg], a[q.rg]])).toBe(true);
          expect(equal(v.x, b[q.ra])).toBe(true);
          break;
        }
        case 'troisieme': {
          const [, , x2, y2] = q.angles;
          expect(Number(v.x) + Number(x2) + Number(y2)).toBe(180);
          break;
        }
        default:
          // apparier: the side of the second triangle opposite the vertex matched with the one `mine` is opposite to
          expect(q.sigma.map((j) => q.opposite(q.n2, j))).toContain(v.h);
          expect(q.opposite(q.n2, q.sigma[q.n1.findIndex((_, i) => q.opposite(q.n1, i) === q.mine)])).toBe(v.h);
      }
    }
    expect([...seen].sort()).toEqual([...EXAM].sort());
  });

  it('the false rules students hold are refused with a hint: the inverted quotient, the names, the sum, the added difference', () => {
    let refused = 0;
    for (const q of all(10)) {
      const v = solution(q);
      const tries = [];
      if (q.kind === 'coef' || q.kind === 'homologue') tries.push({ n: v.d, d: v.n });
      if (q.kind === 'coef' && !equal(q.byNames, q.k)) tries.push(asAnswer(q.byNames));
      if (q.kind === 'homologue' && !equal(q.wrong, q.k)) tries.push(asAnswer(q.wrong));
      if (q.kind === 'longueur') {
        tries.push({ x: write(plus(q.P, minus(q.Q, q.D))) });
        tries.push({ x: write(over(times(q.P, q.D), q.Q)) });
      }
      if (q.kind === 'troisieme') {
        const [, , x2, y2] = q.angles;
        tries.push({ x: String(Number(x2) + Number(y2)) }, { x: String(180 - Number(x2)) });
      }
      if (q.kind === 'apparier') for (const s of ['DE', 'EF', 'FD', 'ST', 'JK']) tries.push({ h: s === v.h ? '' : s });
      for (const t of tries) {
        if (q.kind === 'longueur' && equal(t.x, solution(q).x)) continue;
        if (q.kind === 'apparier' && !t.h) continue;
        if (q.kind === 'apparier' && t.h === v.h) continue;
        if (q.kind === 'apparier' && !q.n2.concat(q.n2).join('').includes(t.h)) continue;
        const r = check(q, t);
        expect(r.ok, `${q.kind} ${JSON.stringify(t)}`).toBe(false);
        expect(r.hint).toBeTruthy();
        refused += 1;
      }
    }
    expect(refused).toBeGreaterThan(60);
  });

  it('the pairing by the names is NAMED in the hint: « les noms ne rangent pas les côtés »', () => {
    let named = 0;
    for (const q of all(20)) {
      if (q.kind !== 'coef' || equal(q.byNames, q.k) || equal(q.byNames, over('1', q.k))) continue;
      expect(check(q, asAnswer(q.byNames)).hint, q.prompt).toMatch(/noms/);
      named += 1;
    }
    expect(named).toBeGreaterThan(10);
  });

  it('the figures are the platform’s own: no two numbers of one figure on one line of any bank or story', () => {
    const stories = storiesOf({ exceptId: ID });
    const banks = readdirSync(PRACTICE, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => readBank(d.name));
    expect(banks.length).toBeGreaterThan(4);
    const tracked = (x) => Number(x.replace(',', '.')) >= 10 || x.includes(',');
    const sets = [
      ...FIGURES.sides.map((f) => [...f.a, ...f.b]),
      ...FIGURES.unlike.map((f) => [...f.a, ...f.b]),
      ...FIGURES.angles.similar,
      ...FIGURES.angles.other.map(([a, b]) => [...a, ...b]),
    ];
    for (const set of sets) {
      const xs = [...new Set(set)].filter(tracked);
      for (let i = 0; i < xs.length; i += 1)
        for (let j = i + 1; j < xs.length; j += 1)
          for (const bank of banks) {
            const c = collisions(bank, [xs[i], xs[j]], { stories });
            expect([c.named, c.bankLines, c.storyLines], `${xs[i]} ; ${xs[j]} in ${bank.id}`).toEqual([false, [], []]);
          }
    }
    // every similar pair is similar, every pair of angle triples sums to 180
    for (const f of FIGURES.sides) expect(sameRatio([f.b[0], f.a[0]], [f.b[2], f.a[2]]), JSON.stringify(f)).toBe(true);
    for (const t of FIGURES.angles.similar) expect(t.reduce((s, x) => s + Number(x), 0)).toBe(180);
    for (const [a, b] of FIGURES.angles.other) {
      expect(a.reduce((s, x) => s + Number(x), 0)).toBe(180);
      expect(b.reduce((s, x) => s + Number(x), 0)).toBe(180);
      expect(a.filter((x) => b.includes(x))).toHaveLength(1);
    }
    // never the numbers of the story's rounds
    const story = [...FIGURES.sides].map((f) => f.a.join(';'));
    expect(story).not.toContain('2;3;3,8');
  });

  it('every question about two triangles carries its figure, and it FITS the trainer at its 12 px floor', () => {
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
      expect(t.fits, `${q.kind} ${t.width}×${t.height} k=${t.k}`).toBe(true);
      expect(t.label).toBeGreaterThanOrEqual(12);
      // two triangles APART: six points, no point shared
      expect(Object.keys(q.figure.points), q.prompt).toHaveLength(6);
    }
    expect([...seen].sort()).toEqual(DRAWN.sort());
  });

  it('a figure writes the lengths its question gives and « ? » on what it asks, never the answer; no angle is written on it', () => {
    const labels = (q) => q.figure.segments.map((x) => x.label).filter((x) => x != null);
    for (const q of all(10)) {
      if (!q.figure) continue;
      for (const g of q.figure.angles ?? []) expect(g.label, q.prompt).toBeUndefined();
      if (q.kind === 'longueur') {
        expect(labels(q).filter((x) => x === '?')).toHaveLength(1);
        // the asked triangle's own segments never write the answer (the other triangle may carry the same number)
        const own = q.figure.segments.filter((x) =>
          x.from
            .concat(x.to)
            .split('')
            .every((c) => q.n2.includes(c)),
        );
        expect(
          own.map((x) => x.label).filter((x) => x != null && x !== '?'),
          q.prompt,
        ).not.toContain(solution(q).x);
      }
      if (q.kind === 'apparier') expect(labels(q)).toEqual([]);
    }
  });

  it('every sentence a question writes is bounded: a prompt of at most 330 characters, a hint of at most 230 (B26)', () => {
    for (const q of all(10)) {
      expect([...q.prompt].length, q.prompt).toBeLessThanOrEqual(330);
      const r = check(q, {});
      if (r.hint) expect([...r.hint].length, r.hint).toBeLessThanOrEqual(230);
    }
  });
  it('the exam’s « longueur » fits its fix sheet at the 12 px floor: a prompt of at most 128 characters seen, a fix of one line', () => {
    // the walk (1366 × 768) saw « Les triangles … sont semblables. Côtés … » (≈ 165 seen) squeezed to 11,5 px; then, at
    // ≈ 130 seen with a fix of two lines of fractions (≈ 95 seen), the whole fix sheet at 11,6 px (2026-11-27)
    const seen = (s) => [...s.replace(/\\[a-zA-Z]+/g, '').replace(/[$\\{}]/g, '')].length;
    let checked = 0;
    for (const q of all(20).filter((x) => x.kind === 'longueur' && x.format === 'exam')) {
      expect(seen(q.prompt), q.prompt).toBeLessThanOrEqual(128);
      const { fix } = check(q, {});
      expect(seen(fix), fix).toBeLessThanOrEqual(62);
      expect(fix.match(/\\dfrac/g) ?? [], fix).toHaveLength(1);
      checked += 1;
    }
    expect(checked).toBeGreaterThan(10);
  });
});
