import { describe, it, expect } from 'vitest';
import { plain, said } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { readBank, storiesOf } from '../../../../../../common/gameworld/kit/authoring/test/bank.js';
import { WORLD_TEXT, withStory } from '../../../../../../common/gameworld/rootCourts/strings';
import { dialRod, outcome, rootOf, write } from '../../../../../../common/gameworld/rootCourts/logic';
import { COURTS, CALCULATOR, framing, HALF_TENTH, HUNDREDTH, MISSION, SORTING, STORY, TENTH } from './story';
import { TABLETS } from './tablets';
import { K1, K2, K3, above, cut, middle, rounded } from './math';

/** The words the tablets give names to: nothing a student meets before a forge may say them. */
const NAMES = /ناطق|مدوّ|مدو/;
/** Lesson 1's numbers (its story, its yard, its mission): never a court of this lesson. */
const LESSON_ONE = ['9', '25', '30', '16', '36', '100', '49', '196', '1849', '1900'];

/** The radicands of the bank (« \\sqrt{0{,}49} », « \\sqrt{\\dfrac{16}{9}} »), as the world writes numbers. */
function bankRadicands() {
  const out = new Set();
  for (const { text } of readBank('natiqa-ghayr-natiqa').sheets) {
    for (const [, x] of text.matchAll(/sqrt\{(\d+(?:\{,\}\d+)?)\}/g)) out.add(write(x.replace('{,}', ',')));
    for (const [, p, q] of text.matchAll(/sqrt\{\\\\dfrac\{(\d+)\}\{(\d+)\}\}/g)) out.add(write(`${p}/${q}`));
  }
  return out;
}

/** A game as `rootCourts/Game.js` hands it to the story's hooks — what the hooks read, nothing more. */
function fakeGame({ at = 'ashar', keys = [], flags = {}, ridden = {}, sealed = {}, log = [], hold = null } = {}) {
  const said = [];
  const game = {
    state: { at: STORY.terraces.findIndex((t) => t.id === at), keys },
    ter: STORY.terraces,
    flags,
    ridden,
    sealed,
    log,
    hold,
    T: withStory(WORLD_TEXT, STORY.text),
    said,
    say: (s) => said.push(s),
    audio: { play: () => {} },
    refreshObjective: () => {},
  };
  return game;
}
const courtOf = (id) => STORY.terraces.flatMap((t) => t.courts).find((c) => c.id === id);
/** A row of the world's log: the rod q lowered on the court of area a. */
const row = (a, q) => ({ a, s: { q }, kind: outcome({ q }, a).kind });
/** The marks of a dial of `step` that ride a court (none, or one). */
const ridingMark = (area, step) => {
  const r = rootOf(area);
  if (r == null || r.includes('/')) return null;
  const k = (step.split(',')[1] ?? '').length;
  return cut(area, k) === r && (r.split(',')[1] ?? '').length <= k ? r : null;
};

describe('the story of « الأعداد الناطقة والأعداد غير الناطقة » in « قصر الساحات »', () => {
  const courts = STORY.terraces.flatMap((t) => t.courts);

  it('the terraces: one line of six; every terrace but the last has ONE way out, to the next terrace', () => {
    expect(STORY.terraces.map((t) => t.id)).toEqual(['ashar', 'farz', 'maraya', 'jidar', 'alamat', 'aala']);
    expect(STORY.end).toBe('aala');
    STORY.terraces.forEach((t, i) => {
      expect(t.at, t.id).toBeUndefined(); // the world places them (no coordinate in a story)
      if (t.id === 'aala') return expect(t.courts).toEqual([]);
      const out = t.courts.filter((c) => c.to);
      expect(out, t.id).toHaveLength(1);
      expect(out[0].to).toBe(STORY.terraces[i + 1].id);
    });
    expect(new Set(courts.map((c) => c.id)).size).toBe(courts.length);
  });

  it('the 3D world shows DECIMAL areas and marks only: no fraction on a court or a dial', () => {
    for (const c of courts) {
      expect(c.a, c.id).not.toContain('/');
      expect(write(c.a)).toBe(c.a);
      for (const s of c.steps) expect(s).toMatch(/^0,0*[15]$/);
    }
  });

  it('every court does what the story says: the riders ride on a mark of their dial, the others are closed by a band and a jam', () => {
    // the first terrace and the hall: they ride on a mark of a tenth
    for (const id of ['big', 'small', 'hall', 'marksOut']) expect(ridingMark(COURTS[id], TENTH), id).not.toBe(null);
    // the sorting terrace: three ride, two no mark (nor any number) rides
    const rides = SORTING.filter((id) => ridingMark(COURTS[id], TENTH) != null);
    expect(rides).toEqual(['sortA', 'sortC', 'sortOut']);
    for (const id of ['sortB', 'sortD']) expect(rootOf(COURTS[id]), id).toBe(null);
    for (const id of SORTING) expect(courtOf(id)).toMatchObject({ ask: 'rides', seal: true });
    // the court of two: no mark of a hundredth; the marks' courts: no mark of their finest dial
    expect(rootOf(COURTS.two)).toBe(null);
    expect([cut(COURTS.two, 2), above(COURTS.two, 2)]).toEqual(['1,41', '1,42']);
    expect(courtOf('two').steps.at(-1)).toBe(HUNDREDTH);
    for (const id of ['marksA', 'marksB']) {
      expect(rootOf(COURTS[id]), id).toBe(null);
      expect(courtOf(id).seal).toBe(true);
    }
    expect(courtOf('marksA').steps.at(-1)).toBe(HALF_TENTH);
  });

  it('the middle marks decide both ways: the court of 19 rounds UP at a tenth, the court of 66 rounds DOWN at a hundredth', () => {
    expect([cut(COURTS.marksA, 1), middle(COURTS.marksA, 1), rounded(COURTS.marksA, 1)]).toEqual([
      '4,3',
      '4,35',
      '4,4',
    ]);
    expect(outcome({ q: middle(COURTS.marksA, 1) }, COURTS.marksA).kind).toBe('band');
    expect([cut(COURTS.marksB, 2), middle(COURTS.marksB, 2), rounded(COURTS.marksB, 2)]).toEqual([
      '8,12',
      '8,125',
      '8,12',
    ]);
    expect(outcome({ q: middle(COURTS.marksB, 2) }, COURTS.marksB).kind).toBe('jam');
    // the finest dial of each is a HALF step: two neighbouring marks of it are one plain mark and one middle mark, so the
    // world closes the court only after he lowered a middle mark
    expect(courtOf('marksA').steps).toEqual([TENTH, HALF_TENTH]);
    expect(courtOf('marksB').steps.slice(0, 2)).toEqual([TENTH, HUNDREDTH]);
    expect(courtOf('marksB').steps.at(-1)).toBe('0,005');
    expect(dialRod(87, HALF_TENTH).q).toBe(middle(COURTS.marksA, 1));
  });

  it('its numbers are the platform’s own: no radicand of the bank, no number of lesson 1, nothing ≥ 100 in another story', () => {
    const bank = bankRadicands();
    expect(bank.has('2,25') && bank.has('16/9')).toBe(true); // the reading works
    const ours = [...Object.values(COURTS), MISSION.exact, `${MISSION.fracN}/${MISSION.fracD}`, MISSION.none];
    const exempt = [COURTS.two]; // the court of two: the bank writes √2 in sums (a√2); kept for the chase (report)
    for (const x of ours.filter((y) => !exempt.includes(y))) expect(bank.has(write(x)), x).toBe(false);
    for (const x of ours) expect(LESSON_ONE, x).not.toContain(write(x));
    expect(rootOf(MISSION.exact)).toBe('3,6');
    expect(rootOf(`${MISSION.fracN}/${MISSION.fracD}`)).toBe('5/6');
    expect(rootOf(MISSION.none)).toBe(null);
    // the display of the mission's second court is a long row of digits — the trap of the mission
    const others = storiesOf({ exceptId: 'natiqa-ghayr-natiqa' });
    for (const s of others)
      expect(s.text, s.file).not.toMatch(/(?<![\d,])(?:10,24|11,56|12,96|5,76|4,41|2,56)(?![\d,])/);
    expect(CALCULATOR).toBe('1,414213562');
  });

  it('ONE number a line of the story file (the bank checks of every lesson read two numbers on a line as a pair)', async () => {
    const { readFileSync } = await import('node:fs');
    const text = readFileSync(new URL('./story.js', import.meta.url), 'utf8');
    for (const line of text.split('\n')) {
      const t = line.trim();
      if (!/^(?:\/\/|\*|\/\*\*)/.test(t)) continue;
      expect(t, t).not.toMatch(/\d/); // no number in a comment
    }
    for (const id of Object.keys(COURTS)) {
      const own = text.split('\n').filter((l) => l.includes(`'${COURTS[id]}'`));
      expect(own, id).toHaveLength(1);
    }
  });

  it('the hooks: what opens when — the order the game holds', () => {
    const g = fakeGame();
    expect(STORY.courtOpen(g, courtOf('small'))).toBe(false);
    g.ridden.big = { q: '1,6' };
    expect(STORY.courtOpen(g, courtOf('small'))).toBe(true);
    expect(STORY.courtOpen(fakeGame(), courtOf('hall'))).toBe(false);
    expect(STORY.courtOpen(fakeGame({ keys: [K1] }), courtOf('hall'))).toBe(true);
    // the court of two: open, then closed while the mirror calls, then open for the clamp
    expect(STORY.courtOpen(fakeGame({ keys: [K1] }), courtOf('two'))).toBe(true);
    expect(STORY.courtOpen(fakeGame({ keys: [K1], flags: { near: true } }), courtOf('two'))).toBe(false);
    expect(STORY.courtOpen(fakeGame({ keys: [K1, K2], flags: { near: true } }), courtOf('two'))).toBe(true);
    expect(STORY.release(fakeGame({ keys: [K1], flags: { near: true } }), courtOf('two'))).toBe(true);
    expect(STORY.release(fakeGame({ keys: [K1, K2], flags: { near: true } }), courtOf('two'))).toBe(false);
    expect(STORY.canClamp(fakeGame({ keys: [K1] }), courtOf('two'))).toBe(false);
    expect(STORY.canClamp(fakeGame({ keys: [K1, K2] }), courtOf('two'))).toBe(true);
    expect(STORY.canClamp(fakeGame({ keys: [K1, K2] }), courtOf('marksA'))).toBe(false);
    // the mirrors
    const feature = (id) => STORY.terraces.find((t) => t.feature?.id === id).feature;
    expect(STORY.featureOpen(fakeGame(), feature('mirror2'))).toBe(false);
    expect(STORY.featureOpen(fakeGame({ flags: { near: true } }), feature('mirror2'))).toBe(true);
    expect(STORY.featureOpen(fakeGame({ sealed: { marksA: true } }), feature('mirror3'))).toBe(false);
    expect(STORY.featureOpen(fakeGame({ sealed: { marksA: true, marksB: true } }), feature('mirror3'))).toBe(true);
    expect([feature('mirror1').forge, feature('mirror2').forge, feature('mirror3').forge]).toEqual([K1, K2, K3]);
    expect(STORY.courtOpen(fakeGame({ sealed: { marksA: true } }), courtOf('marksB'))).toBe(true);
    expect(STORY.courtOpen(fakeGame(), courtOf('marksB'))).toBe(false);
    expect(STORY.courtOpen(fakeGame({ keys: [K1, K2] }), courtOf('marksOut'))).toBe(false);
    // a forge left half-way opens again
    expect(STORY.pendingForge(fakeGame({ flags: { [`forge:${K2}`]: true }, keys: [K1] }))).toBe(K2);
    expect(STORY.pendingForge(fakeGame({ flags: { [`forge:${K1}`]: true }, keys: [K1] }))).toBe(null);
  });

  it('the court of two: a band and a jam on NEIGHBOURING hundredths — and only then — send him to the mirror', () => {
    const two = COURTS.two;
    const g = fakeGame({ at: 'jidar', keys: [K1], log: [row(two, '1,4'), row(two, '1,5')] });
    STORY.onVerdict(g, courtOf('two'), g.log.at(-1));
    expect(g.flags.near).toBeUndefined(); // a tenth apart: not yet
    g.log.push(row(two, '1,41'), row(two, '1,42'));
    STORY.onVerdict(g, courtOf('two'), g.log.at(-1));
    expect(g.flags.near).toBe(true);
    expect(g.said.at(-1)).toBe(g.T.say.near);
    expect(framing(g.log, two)).toEqual({ lo: '1,41', hi: '1,42', gap: '0,01' });
  });

  it('a court of the marks is closed: the world names the two marks — one of them is a middle mark', () => {
    const a = COURTS.marksA;
    const g = fakeGame({ at: 'alamat', keys: [K1, K2], log: [row(a, '4,3'), row(a, '4,4'), row(a, '4,35')] });
    STORY.onSeal(g, courtOf('marksA'));
    expect(g.said.at(-1)).toBe(`ينتهي الجدار بين العلامتين 4,35 و 4,4، ولا علامة تركب الساحة ${a}.`);
    const b = COURTS.marksB;
    const h = fakeGame({ log: [row(b, '8,12'), row(b, '8,125')] });
    STORY.onSeal(h, courtOf('marksB'));
    expect(h.said.at(-1)).toContain('8,12 و 8,125');
  });

  /** Every instruction the story can give, walking the road as the slowest student the world lets through. */
  function everyObjective() {
    const seen = [];
    const at = (id, o) => {
      const s = STORY.objective(fakeGame({ at: id, ...o }));
      if (s) seen.push([id, o.keys ?? [], s]);
      return s;
    };
    at('ashar', {});
    at('ashar', { ridden: { big: { q: '1,6' } } });
    for (let n = 0; n <= SORTING.length; n += 1)
      at('farz', { sealed: Object.fromEntries(SORTING.slice(0, n).map((id) => [id, true])) });
    at('farz', { hold: { court: courtOf('sortB') } });
    at('jidar', { keys: [K1], hold: { court: courtOf('two') } });
    at('maraya', {});
    at('maraya', { keys: [K1] });
    at('jidar', { keys: [K1] });
    at('jidar', { keys: [K1], flags: { near: true } });
    at('jidar', { keys: [K1, K2], flags: { near: true } });
    at('jidar', { keys: [K1, K2], hold: { court: courtOf('two') } });
    at('alamat', { keys: [K1, K2] });
    at('alamat', { keys: [K1, K2], hold: { court: courtOf('marksA') } });
    at('alamat', { keys: [K1, K2], sealed: { marksA: true } });
    at('alamat', { keys: [K1, K2], sealed: { marksA: true, marksB: true } });
    at('alamat', { keys: [K1, K2, K3], sealed: { marksA: true, marksB: true } });
    at('aala', { keys: [K1, K2, K3] });
    return seen;
  }

  it('the WHOLE instruction of every step: plain, short enough for its card, and it names no rule before its key', () => {
    const all = everyObjective();
    expect(all.length).toBeGreaterThan(14);
    for (const [, keys, s] of all) {
      plain(s);
      expect([...s.replace(/[⁦⁩]/g, '')].length, s).toBeLessThanOrEqual(212);
      expect(s).not.toMatch(/خطأ|خاطئ|غلط/);
      expect(s, s).not.toMatch(NAMES); // even after its key: the instruction speaks the world, the tablet names
      for (const k of [K1, K2, K3].filter((x) => !keys.includes(x))) expect(s).not.toContain(TABLETS[k].title);
    }
    // the farz terrace counts what is left in words that agree with the number
    expect(all.find(([id, , s]) => id === 'farz' && s.includes('خمس'))).toBeUndefined();
    expect(STORY.objective(fakeGame({ at: 'farz' }))).toContain('5 ساحات');
    expect(
      STORY.objective(fakeGame({ at: 'farz', sealed: { sortA: true, sortB: true, sortC: true, sortD: true } })),
    ).toContain('ساحة واحدة');
    // when the terrace is finished the story says nothing: the world's own « اركب المنصّة » shows, and travel opens
    expect(STORY.objective(fakeGame({ at: 'farz', sealed: Object.fromEntries(SORTING.map((id) => [id, true])) }))).toBe(
      null,
    );
  });

  it('what the robot says and the subtitle: plain, never « wrong », no rule’s name', () => {
    const lines = [STORY.text.subtitle, ...Object.values(STORY.text.say)];
    for (const s of lines) {
      plain(s);
      expect(s).not.toMatch(/خطأ|خاطئ|غلط/);
      expect(s, s).not.toMatch(NAMES);
    }
    const g = fakeGame();
    for (const id of ['ashar', 'farz', 'maraya', 'jidar', 'alamat', 'aala']) STORY.onArrive(g, id, true);
    for (const k of [K1, K2, K3]) STORY.afterKey[k](g);
    for (const s of g.said) said(s);
  });

  it('the card « من الساحة السابقة »: the facts of the terrace before, the five sorted courts in the hall', () => {
    const big = COURTS.big;
    const g = fakeGame({
      log: [row(big, '1,5'), row(big, '1,6'), row(COURTS.small, '0,8')],
      ridden: { sortA: { q: '1,4' }, sortC: { q: '2,4' }, sortOut: { q: '2,1' } },
      sealed: { sortB: true, sortD: true },
    });
    expect(STORY.recall(g, 'ashar')).toEqual([]);
    expect(STORY.recall(g, 'farz')).toEqual([
      `ساحة ${big}: ركبتها بالمقياس 1,6`,
      `ساحة ${COURTS.small}: ركبتها بالمقياس 0,8`,
    ]);
    const hall = STORY.recall(g, 'maraya');
    expect(hall).toHaveLength(5);
    expect(hall[1]).toBe(`ساحة ${COURTS.sortB}: ${WORLD_TEXT.hud.sealed}`);
    for (const l of hall) {
      plain(l);
      expect([...l].length).toBeLessThanOrEqual(30);
    }
    const top = fakeGame({
      log: [
        row(COURTS.marksA, '4,35'),
        row(COURTS.marksA, '4,4'),
        row(COURTS.marksB, '8,12'),
        row(COURTS.marksB, '8,125'),
      ],
    });
    expect(STORY.recall(top, 'aala')).toEqual([
      `ساحة ${COURTS.marksA}: الجدار بين 4,35 و 4,4`,
      `ساحة ${COURTS.marksB}: الجدار بين 8,12 و 8,125`,
    ]);
  });

  it('the tablets name the three rules, and every number they state is the story’s, computed', () => {
    expect(Object.keys(TABLETS)).toEqual([K1, K2, K3]);
    expect(TABLETS[K1].title).toMatch(/ناطق/);
    expect(TABLETS[K2].title).toMatch(/غير الناطق/);
    expect(TABLETS[K3].title).toMatch(/المدوَّر/);
    for (const t of Object.values(TABLETS)) {
      expect(t.lines.length).toBeLessThanOrEqual(2);
      expect(t.math.length).toBeLessThanOrEqual(2);
      expect((t.notes ?? []).length).toBeLessThanOrEqual(1);
      for (const n of t.notes ?? []) plain(n);
      for (const m of t.math) expect(m).not.toMatch(/[؀-ۿ]|\$/);
      said(JSON.stringify(t));
    }
    expect(TABLETS[K3].math[0]).toBe('4{,}35^2 = 18{,}9225 < 19 \\Rightarrow \\sqrt{19} \\approx 4{,}4');
    expect(TABLETS[K3].math[1]).toBe('8{,}125^2 = 66{,}015625 > 66 \\Rightarrow \\sqrt{66} \\approx 8{,}12');
    expect(TABLETS[K2].math[1]).toBe('1{,}41 < \\sqrt{2} < 1{,}42');
    expect(TABLETS[K1].lines[1]).toContain('\\dfrac{144}{25}');
  });
});
