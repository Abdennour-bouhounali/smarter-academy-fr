// THE FORGES of decomposer-en-facteurs-premiers: the shared checks (authoring kit), then what is this lesson's own —
// the false rules students really hold, each refuted by HIS rows or by a computed case the mirror names; the last steps
// and the claims they make; no bridge word where the case is not a bridge; the numbers the mirror draws.
import { describe, it, expect } from 'vitest';
import {
  agreementErrors,
  allRules,
  describeForges,
  stringsIn,
  typographyErrors,
} from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { alone, readBank } from '../../../../../../common/gameworld/kit/authoring/test/bank.js';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { runOn } from '../../../../../../common/gameworld/kit/forge';
import { factorReducer, factorResult, initFactor } from '../../../../../../common/gameworld/divisorIsles/factorLadder';
import { initSheet, sheetNow, sheetReducer, sheetResult } from '../../../../../../common/gameworld/divisorIsles/sheet';
import { FORGES } from './forges';
import { LADDER_INQUIRY, SHEET_INQUIRY } from './inquiries';
import { KEYS } from './journey';
import { NUMBERS, primeFactors } from './math';
import { K } from './story';
import { RESERVED } from './trainer';

const ID = 'decomposer-en-facteurs-premiers';

/** A round of key 1's experiment played through its reducer: the planks he takes, in order (a fall included). */
function playLadder(picks) {
  let s = initFactor(LADDER_INQUIRY);
  for (const round of picks) {
    for (const d of round)
      s = factorReducer(LADDER_INQUIRY, factorReducer(LADDER_INQUIRY, s, { type: 'take', d }), { type: 'shown' });
    s = factorReducer(LADDER_INQUIRY, s, { type: 'next' });
  }
  return factorResult(s);
}
/** Key 4's sheets read through their reducer: on each sheet he clicks `pick(lines)` (a prime) or says « prime » (null). */
function playSheet(pick) {
  let s = initSheet(SHEET_INQUIRY);
  for (let guard = 0; guard < 400 && !s.done; guard += 1) {
    if (s.stage === 'fill') s = sheetReducer(SHEET_INQUIRY, s, { type: 'tick' });
    else if (s.stage === 'pick') {
      const p = pick(sheetNow(SHEET_INQUIRY, s).lines);
      s = sheetReducer(SHEET_INQUIRY, s, p == null ? { type: 'prime' } : { type: 'line', p });
    } else s = sheetReducer(SHEET_INQUIRY, s, { type: 'next' });
  }
  return sheetResult(s);
}

/** Key 1: a student who lays the smallest plank that holds, and one who lays 9 on 72 and tries 4 on 55. */
const LADDER_AT_ONCE = playLadder([
  [2, 2, 3, 5],
  [2, 2, 2, 3, 3],
  [3, 3, 5, 11],
]);
const LADDER_WALKED = playLadder([
  [2, 2, 2, 3, 5],
  [9, 4, 2],
  [2, 3, 3, 4, 5, 11],
]);
/** Key 3: the three gaps of the strip, found, with what he predicted on the last two. */
const STOP_RESULT = {
  gaps: [
    { a: 91, m: 9, guess: null },
    { a: 97, m: 9, guess: 10 },
    { a: 221, m: 14, guess: 14 },
  ],
};
/** Key 4: he clicks the first 0 of each sheet; a student who clicks a line with a remainder first. */
const SHEET_FIRST_ZERO = playSheet((lines) => lines.find((l) => l.r === 0)?.p ?? null);
const SHEET_WITH_MISS = (() => {
  let missed = false;
  return playSheet((lines) => {
    if (!missed && lines.some((l) => l.r !== 0)) {
      missed = true;
      return lines.find((l) => l.r !== 0).p;
    }
    return lines.find((l) => l.r === 0)?.p ?? null;
  });
})();

/** The world's log of bridges before each mirror (only key 2 reads it: its plank of 8 over 1 400). */
const [R60, R72, R1400] = NUMBERS.road;
const AT_ONCE = {
  [K.powers]: [
    { a: R60.a, b: 2 },
    { a: R72.a, b: 3 },
    { a: R1400.a, b: 8 },
  ],
};
const WALKED = {
  [K.powers]: [
    { a: R60.a, b: 9 },
    { a: R60.a, b: 4 },
    { a: R72.a, b: 5 },
    { a: R72.a, b: 9 },
    { a: R1400.a, b: 3 },
    { a: R1400.a, b: 6 },
    { a: R1400.a, b: 8 },
  ],
};
// a log that lost its first bridges (the world keeps the last sixteen): the mirror still has his ladders
const EVERY = { [K.powers]: [{ a: R1400.a, b: 6 }] };

const SOLVE = {
  [K.ladder]: (c) => {
    const ps = primeFactors(c.n);
    const vals = {};
    let x = c.n;
    ps.forEach((p, i) => {
      if (i > 0) vals[`n${i + 1}`] = x;
      vals[`d${i + 1}`] = p;
      x /= p;
    });
    return vals;
  },
  [K.powers]: (c) => ({ e2: 3, e5: 2, verdict: c.held }),
  [K.stop]: () => ({ verdict: false, p: 11, q: 13 }),
  [K.tool]: () => ({ d: 3, f1: 3, f2: 7, f3: 13, f4: 17 }),
};
/** The words of each key's name and of what it states: no sentence of its forge says them before the last step. */
const FORBIDDEN = {
  [K.ladder]: /facteurs? premiers?|décompos|nombres? premiers?|puissance/i,
  [K.powers]: /puissance|exposant/i,
  [K.stop]: /s’arrêter|où s’arrête/i,
  [K.tool]: /tableur|outil/i,
};

const { rowsOf, refutedBy, shownCases } = describeForges({
  forges: FORGES,
  keys: KEYS,
  roads: { AT_ONCE, WALKED, EVERY },
  inquiry: { [K.ladder]: LADDER_WALKED, [K.stop]: STOP_RESULT, [K.tool]: SHEET_WITH_MISS },
  solve: SOLVE,
  forbidden: FORBIDDEN,
  bank: ID,
  tiles: { [K.ladder]: 8, [K.powers]: 8, [K.stop]: 18, [K.tool]: 6 },
});

const F1 = FORGES[K.ladder];
const F2 = FORGES[K.powers];
const F3 = FORGES[K.stop];
const F4 = FORGES[K.tool];
/** The first refutation of a rule on what a student did (his rows), or of the forge's new case. */
const refute = (F, rule, rows) => {
  const run = runOn(F, rule, rows);
  return run.bad >= 0 ? { on: 'evidence', c: run.marks[run.bad] } : { on: 'attack', c: F.attacks(rule, rows)[0] };
};

describe('🪜 plus-petit-premier — the rules students really hold, refuted on HIS ladders', () => {
  const rows = F1.fromInquiry(LADDER_AT_ONCE).rows;
  const walked = F1.fromInquiry(LADDER_WALKED).rows;

  it('his ladders are what he laid: one per round, and the ladder he stood on when a plank of 4 fell', () => {
    expect(rows.map((c) => c.n)).toEqual(NUMBERS.ladder.rounds);
    expect(rows.every((c) => c.held)).toBe(true);
    const fell = walked.find((c) => c.factor.fell);
    expect(fell.factor).toEqual({ n: 495, planks: [3, 3], fell: 4 });
    expect(fell.tag).toBe('4 tombe');
    expect(walked.find((c) => c.n === 72).planks).toEqual([9, 4, 2]);
    expect(walked.find((c) => c.n === 72).held).toBe(false);
  });

  it('« one division by each prime, then the next one »: his own 60 (or 72) stops before 1', () => {
    for (const r of [rows, walked]) {
      const { on, c } = refute(F1, { which: 'small', again: 'once', stop: 'one' }, r);
      expect(on).toBe('evidence');
      expect([60, 72]).toContain(c.n);
      expect(F1.explain({ which: 'small', again: 'once', stop: 'one' }, c)).toMatch(/s’arrête sur/);
    }
    // 72 after one 2 is 36, still even: the rule lays 2, 3, 4 and stops on 3
    expect(F1.explain({ which: 'small', again: 'once', stop: 'one' }, rows[1])).toContain('2, 3 et 4');
  });

  it('« any plank that holds » (the longest first): a ladder with a plank that breaks — 9 on 72', () => {
    const rule = { which: 'big', again: 'again', stop: 'one' };
    // on his 60 it lays 6, 5, 2 — not his planks; on his 72 it lays HIS 9, 4, 2, a ladder that does not go to the end
    expect(refute(F1, rule, walked)).toMatchObject({ on: 'evidence', c: { n: 60 } });
    const m72 = runOn(F1, rule, walked).marks.find((m) => m.n === 72);
    expect(m72).toMatchObject({ says: true, held: false, planks: [9, 4, 2] });
    expect(F1.text.refuted(m72)).toMatch(/la planche de 9 se casse encore.: 3.planches de 3/);
    expect(refute(F1, rule, rows).c.held).toBe(true);
  });

  it('« stop when what is left is small »: 72 stops on 9, which still breaks', () => {
    const rule = { which: 'small', again: 'again', stop: 'ten' };
    const { on, c } = refute(F1, rule, rows);
    expect(on).toBe('evidence');
    expect(c.n).toBe(60);
    expect(F1.explain(rule, c)).toContain('s’arrête sur 5');
    expect(F1.explain(rule, rows[1])).toContain('s’arrête sur 9');
  });

  it('« try 4, 6, 9 too » is not a false rule — they fall once the 2s and 3s are laid: the experiment says it', () => {
    // the ladder by the smallest plank of the WHOLE rack is the ladder by the primes: a 4 never holds after the 2s
    for (const n of [...NUMBERS.ladder.rounds, NUMBERS.ladder.use])
      expect(F1.caseOf(n, primeFactors(n)).held).toBe(true);
    const fall = LADDER_WALKED.rounds[2].attempts.find((a) => a.plank === 4);
    expect(fall.held).toBe(false);
    expect(LADDER_INQUIRY.text.fell(fall)).toMatch(/Une planche de 4, c’est 2.planches de 2 bout à bout\./);
  });

  it('the order of the primes does not change a ladder that goes to the end (60 = 3, 2, 2, 5)', () => {
    const c = F1.caseOf(60, [3, 2, 2, 5]);
    expect(c.held).toBe(true);
    expect(F1.says(allRules(F1).find(F1.isTheRule), c)).toBe(true);
  });
});

describe('🔢 puissances — the readings students really hold, refuted on the ladders of key 1', () => {
  const rows = rowsOf(K.powers, AT_ONCE);

  it('its evidence: his 8 (the plank that crossed 1 400) and his ladders of 60, 72 and 495, written by the mirror', () => {
    expect(rows.map((c) => c.text)).toEqual(['8 = 2³', '60 = 2² × 3 × 5', '72 = 2³ × 3²', '495 = 3² × 5 × 11']);
    expect(rowsOf(K.powers, EVERY)).toHaveLength(4);
  });

  it('« 2³ = 2 × 3 » falls on his 8; « 2 × 3 × 3 × 2 » is 36, not 72', () => {
    const rule = { read: 'both', join: 'times' };
    const { on, c } = refute(F2, rule, rows);
    expect(on).toBe('evidence');
    expect(c.n).toBe(8);
    expect(F2.explain(rule, c)).toContain('$2 \\times 3$');
    const sum = { read: 'base', join: 'plus' };
    expect(F2.explain(sum, rows[2])).toContain('donne 36');
  });

  it('the raised number on the wrong factor (2³ read as 3 × 3) falls on his 8; 72 = 2² × 3³ is shown false', () => {
    expect(refute(F2, { read: 'swap', join: 'times' }, rows).c.n).toBe(8);
    const [yes, no] = F2.attacks(allRules(F2).find(F2.isTheRule), rows);
    expect(yes.held).toBe(true);
    expect(no.text).toBe('72 = 2² × 3³');
    expect(no.held).toBe(false);
    expect(no.tag).toBe('donne 108');
  });

  it('each wrong reading is refuted on his own rows (the attack is never needed)', () => {
    for (const rule of allRules(F2).filter((r) => !F2.isTheRule(r))) expect(refute(F2, rule, rows).on).toBe('evidence');
  });
});

describe('🛑 arret — where to stop, refuted on the planks he tried on 91, 97 and 221', () => {
  const rows = F3.fromInquiry(STOP_RESULT).rows;

  it('his rows: every plank he tried from 2 to two past the crossing, on each gap', () => {
    expect(rows.filter((c) => c.a === 91).map((c) => c.b)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(rows.filter((c) => c.a === 221).at(-1).b).toBe(16);
    expect(rows.find((c) => c.a === 91 && c.b === 7)).toMatchObject({ fits: true, held: true });
  });

  it('« try up to n » and « up to n ÷ 2 »: the plank of 11 on 91 teaches nothing — its partner is shorter', () => {
    for (const rule of [
      { kind: 'primes', what: 'self', cond: 'n' },
      { kind: 'primes', what: 'self', cond: 'half' },
      { kind: 'primes', what: 'dbl', cond: 'n' },
    ]) {
      const { on, c } = refute(F3, rule, rows);
      expect(on).toBe('evidence');
      expect([c.a, c.b]).toEqual([91, 11]);
      expect(F3.text.refuted({ ...c, says: true })).toContain('son partenaire serait plus petit que 11');
    }
  });

  it('« every number from 2 »: the plank of 4 on 91 is made of planks of 2, already fallen', () => {
    const { c } = refute(F3, { kind: 'all', what: 'sq', cond: 'n' }, rows);
    expect([c.a, c.b]).toEqual([91, 4]);
    expect(F3.text.refuted({ ...c, says: true })).toContain('4 = 2 × 2');
  });

  it('« only the odd numbers »: 2 had to be tried on 91; « the square up to half »: 7 had to be tried on 91', () => {
    expect(refute(F3, { kind: 'odd', what: 'sq', cond: 'n' }, rows).c).toMatchObject({ a: 91, b: 2 });
    expect(refute(F3, { kind: 'primes', what: 'sq', cond: 'half' }, rows).c).toMatchObject({ a: 91, b: 7 });
  });

  it('« 91 is prime » is answered on the strip: 91 = 7 × 13', () => {
    expect(FORGES[K.stop].inquiry.text.held(91, { d: 7, q: 13 })).toContain('91 = 7 \\times 13');
  });
});

describe('📊 tableur — the readings students really hold, refuted on his sheets', () => {
  const rows = F4.fromInquiry(SHEET_FIRST_ZERO).rows;

  it('his rows: each number and the primes the sheet gave him', () => {
    expect(rows.map((c) => [c.n, c.planks])).toEqual([
      [2431, [11, 13, 17]],
      [4641, [3, 7, 13, 17]],
      [3127, [53, 59]],
    ]);
    expect(F4.fromInquiry(SHEET_WITH_MISS).rows.map((c) => c.planks)).toEqual(rows.map((c) => c.planks));
  });

  it('« a big number that ends in 1, 3, 7 or 9 is prime » and « 2, 3, 5 do not divide it »: 2 431 = 11 × 13 × 17', () => {
    for (const read of ['units', 'easy']) {
      const { on, c } = refute(F4, { read, then: 'again' }, rows);
      expect(on).toBe('evidence');
      expect(c.n).toBe(2431);
    }
  });

  it('« one division and it is done »: 2 431 = 11 × 221, and the sheet of 221 shows the remainder 0 on 13', () => {
    const rule = { read: 'zero', then: 'stop' };
    const { c } = refute(F4, rule, rows);
    expect(c.n).toBe(2431);
    expect(F4.explain(rule, c)).toContain('11 et 221');
    const [, no] = F4.attacks(allRules(F4).find(F4.isTheRule), rows);
    expect(F4.text.refuted({ ...no, says: true })).toMatch(/la ligne \d+ montre le reste 0/);
  });

  it('« the sheet must go up to the number »: the sheet of 3 127 stops at 53, and 53 shows the remainder 0', () => {
    const spec = { ...SHEET_INQUIRY, rounds: [{ n: 3127 }] };
    const { lines } = sheetNow(spec, initSheet(spec));
    expect(lines).toHaveLength(16);
    expect(lines.at(-1)).toEqual({ p: 53, r: 0 });
  });
});

describe('the last steps — the rule decides, and what each answer claims', () => {
  it('🪜 the ladder of 126: the right ladder, a smaller plank skipped, a wrong number on the left', () => {
    const c = F1.use.make();
    const right = Object.fromEntries(Object.entries(SOLVE[K.ladder](c)).map(([k, v]) => [k, String(v)]));
    expect(F1.use.check(c, right)).toBe('ok');
    expect(verifyClaim(F1.use.claim(c, right))).toBe(true);
    expect(F1.use.check(c, { ...right, d1: '3', n2: '42' })).toBe('small');
    expect(F1.use.check(c, { ...right, d1: '6', n2: '21' })).toBe('small');
    expect(F1.use.check(c, { ...right, n2: '62' })).toBe('left');
    expect(F1.use.check(c, { ...right, d4: '1' })).toBe('fall');
    expect(F1.use.lines(c)).toHaveLength(4);
  });

  it('🔢 1 400 = 2³ × 5² × 7, then a reading: « the same primes are there, so it divides » is refused (80)', () => {
    const at = (d) => ({
      n: 1400,
      w: [
        { p: 2, e: 3 },
        { p: 5, e: 2 },
        { p: 7, e: 1 },
      ],
      d,
      held: 1400 % d === 0,
    });
    const right = { e2: '3', e5: '2' };
    expect(F2.use.check(at(80), right, false)).toBe('ok');
    expect(F2.use.check(at(80), right, true)).toBe('reading');
    expect(F2.use.check(at(56), right, true)).toBe('ok');
    expect(F2.use.check(at(56), { e2: '2', e5: '3' }, true)).toBe('e2');
    for (const claim of F2.use.claim(at(80), right, false)) expect(verifyClaim(claim)).toBe(true);
    expect(verifyClaim(F2.use.claim(at(80), right, true)[1])).toBe(false);
    // the readings of the last step are never the mission's numbers
    for (let seed = 1; seed <= 40; seed += 1) expect([36, 48, 504]).not.toContain(F2.use.make(rng(seed)).d);
  });

  it('🛑 « 143 est premier »: no — 143 = 11 × 13 (either order); 1 × 143 is refused', () => {
    const c = F3.use.make();
    expect(F3.use.check(c, { p: '11', q: '13' }, false)).toBe('ok');
    expect(F3.use.check(c, { p: '13', q: '11' }, false)).toBe('ok');
    expect(F3.use.check(c, { p: '11', q: '13' }, true)).toBe('prime');
    expect(F3.use.check(c, { p: '1', q: '143' }, false)).toBe('one');
    expect(F3.use.check(c, { p: '7', q: '21' }, false)).toBe('product');
    for (const claim of F3.use.claim(c, { p: '11', q: '13' }, false)) expect(verifyClaim(claim)).toBe(true);
    expect(verifyClaim(F3.use.claim(c, { p: '11', q: '13' }, true)[0])).toBe(false);
  });

  it('📊 the program keeps d after a division (3, not 4), then 4 641 = 3 × 7 × 13 × 17 in any order', () => {
    const c = F4.use.make();
    const right = { d: '3', f1: '17', f2: '3', f3: '13', f4: '7' };
    expect(F4.use.check(c, right)).toBe('ok');
    expect(verifyClaim(F4.use.claim(c, right))).toBe(true);
    expect(F4.use.check(c, { ...right, d: '4' })).toBe('trace');
    expect(F4.use.check(c, { ...right, f1: '21', f4: '17', f3: '13', f2: '1' })).toBe('prime');
    expect(F4.use.check(c, { ...right, f1: '19' })).toBe('product');
    expect(verifyClaim(F4.use.claim(c, { ...right, f1: '19' }))).toBe(false);
  });
});

describe('the words and the numbers of the mirrors', () => {
  /** Every sentence a forge can show: its words, its tiles, every rule, and every case it shows told every way. */
  const sentencesOf = (F) => {
    const rules = allRules(F);
    const cases = shownCases(F);
    const c = F.use.make(rng(7));
    return [
      ...stringsIn(F.text),
      ...F.slots.flatMap((s) => [s.label, ...s.options.map((o) => o.label)]),
      ...rules.map(F.ruleText),
      ...cases.flatMap((x) => [
        F.text.attack(x),
        F.text.refuted({ ...x, says: true }),
        F.text.refuted({ ...x, says: false }),
        F.text.ask(x),
        F.text.fact(x),
        F.text.eq(x),
        x.tag,
        ...rules.map((r) => F.explain(r, x)),
      ]),
      ...[true, false].flatMap((y) => [F.text.says(y), F.text.broken(y)]),
      F.text.tryKey(c),
      F.text.experiment,
      F.text.compare(cases.slice(0, 2)),
    ];
  };

  it('French typography and agreement in every sentence of every forge', () => {
    for (const key of KEYS)
      for (const s of sentencesOf(FORGES[key])) {
        expect(typographyErrors(s), `${key}: ${s}`).toEqual([]);
        expect(agreementErrors(s), `${key}: ${s}`).toEqual([]);
      }
  });

  it('a writing and a sheet are not bridges: keys 2 and 4 say no « planche », « fossé », « pont »', () => {
    for (const key of [K.powers, K.tool])
      for (const s of sentencesOf(FORGES[key])) expect(s, `${key}: ${s}`).not.toMatch(/planche|fossé|pont\b/i);
  });

  it('the numbers the mirror builds are its own: no number of the lesson, none alone in its bank', () => {
    const bank = readBank(ID).sheets.map((s) => s.text.replace(/(\d)[\s  ](\d{3})/g, '$1$2'));
    const roads = { AT_ONCE, WALKED, EVERY };
    for (const key of KEYS) {
      const F = FORGES[key];
      // his own numbers come back in the mirror (72 = 2² × 3³ is a writing of HIS 72): only the others are checked
      const his = new Set(
        Object.values(roads)
          .flatMap((road) => rowsOf(key, road))
          .map((x) => x.n ?? x.a),
      );
      for (const c of shownCases(F).filter((x) => !his.has(x.n ?? x.a))) {
        const n = c.n ?? c.a;
        expect(RESERVED.has(n), `${key} ${F.caseId(c)}`).toBe(false);
        for (const t of bank) expect(alone(n).test(t), `${key} ${n} in the bank`).toBe(false);
      }
    }
  });

  it('every refutation of every rule names a case the world really does (his row or the mirror’s)', () => {
    for (const key of KEYS) {
      const F = FORGES[key];
      for (const rule of allRules(F).filter((r) => !F.isTheRule(r))) {
        const { c } = refutedBy(key, rule, AT_ONCE);
        expect(F.says(rule, c), `${key} ${JSON.stringify(rule)}`).not.toBe(c.held);
      }
    }
  });
});
