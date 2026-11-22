import { describe, it, expect } from 'vitest';
import { toolsForLesson } from '@smarter-academy/core/curriculum/dz/net/learningNet.js';
import { FAMILIES } from '../../lessons/common/launchkit/families';
import { T } from '../../lessons/common/gameworld/divisorIsles/strings';
import { SCRIPT } from '../../lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-adad-tabii/board/script';
import {
  reviewCards,
  classLog,
  readyToConclude,
  missingEvidence,
  FORMS,
  fills,
  askRight,
  classExplain,
  classRuleText,
  equalityOf,
  leftCells,
  proofOf,
  blanks,
  railOf,
  groupsOf,
  LOG_MAX,
  cellsOf,
  denseTablet,
  DENSE_WORDS,
} from './lessonScripts';

describe('حصّة القسم — the rules revised before the lesson', () => {
  const tools = toolsForLesson('qasim-adad-tabii');

  it('gives one card per rule the lesson will use, the core الكفاءة first', () => {
    const cards = reviewCards(tools, FAMILIES);
    expect(cards.map((c) => c.id)).toEqual(['division', 'rest', 'two-five', 'three-nine', 'four']);
    expect(cards[0]).toMatchObject({
      item: '1am.m3.r01',
      family: 'القسمة الإقليدية',
      weight: 'core',
      score: null,
      lesson: 'القسمة الإقليدية',
      grade: '1am',
    });
    for (const c of cards) {
      expect(c.text.length).toBeGreaterThan(20);
      expect(c.example.length).toBeGreaterThan(8);
      expect(c.title).toBeTruthy();
    }
  });

  it('puts first the الكفاءة the class missed most in the start test, with its count', () => {
    const cards = reviewCards(tools, FAMILIES, [
      { item: '1am.m3.r01', right: 3, total: 4 },
      { item: '1am.m3.r02', right: 1, total: 4 },
    ]);
    expect(cards[0].item).toBe('1am.m3.r02');
    expect(cards[0].score).toEqual({ right: 1, total: 4 });
    expect(cards.at(-1).item).toBe('1am.m3.r01');
    expect(reviewCards(tools, {}, null)).toEqual([]); // a lesson whose prerequisites have no rule cards: nothing to revise
  });

  it('every example of a rule card is TRUE', () => {
    for (const f of Object.values(FAMILIES))
      for (const r of f.rules) {
        const c = r.check;
        if (c.a) {
          expect(c.b * c.q + c.r, r.id).toBe(c.a);
          expect(c.r).toBeLessThan(c.b);
          expect(r.example).toContain(String(c.a));
        }
        if (c.diff != null) {
          expect(c.x - c.y, r.id).toBe(c.diff);
          expect(r.example).toContain(`${c.x} - ${c.y} = ${c.diff}`);
        }
        if (c.n) {
          for (const k of c.yes) expect(c.n % k, `${c.n} ÷ ${k}`).toBe(0);
          for (const k of c.no) expect(c.n % k).not.toBe(0);
          expect(r.example).toContain(String(c.n));
          if (c.sum)
            expect(
              String(c.n)
                .split('')
                .reduce((s, d) => s + Number(d), 0),
            ).toBe(c.sum);
        }
      }
  });
});

describe('حصّة القسم — the script of the lesson', () => {
  const script = SCRIPT;

  it('follows the method: the class experiments and concludes BEFORE a rule is named — for each of the four rules', () => {
    const kinds = script.steps.map((s) => s.kind);
    expect(kinds[0]).toBe('situation');
    expect(kinds.at(-1)).toBe('trace');
    const names = script.steps.filter((s) => s.kind === 'name');
    expect(names.map((s) => s.tablet)).toEqual(['qasim-baqi', 'qasim-jidaa', 'siyagh-mutakafia', 'wahid-wa-nafsuh']);
    script.steps.forEach((s, i) => {
      if (s.kind === 'name')
        expect(['forge', 'ask', 'statements'], `before « ${s.tablet} » the class does something`).toContain(
          script.steps[i - 1].kind,
        );
    });
    for (const s of names) expect(T.tablets[s.tablet], s.tablet).toBeTruthy(); // one wording for the student's world and for the board
    expect(script.steps.find((s) => s.kind === 'trace').tablets).toEqual(names.map((s) => s.tablet));
    expect(new Set(script.steps.map((s) => s.id)).size).toBe(script.steps.length);
  });

  it('asks only what is true: every choice is proved by a bridge, every sentence by the equality', () => {
    for (const s of script.steps.filter((x) => x.kind === 'ask')) {
      expect(s.options.filter((o) => fills(s, o)).sort((x, y) => x - y)).toEqual([...s.answer].sort((x, y) => x - y));
      expect(askRight(s, [...s.answer].reverse())).toBe(true);
      expect(askRight(s, s.options)).toBe(false);
      expect(askRight(s, s.answer.slice(1))).toBe(false);
    }
    const st = script.steps.find((x) => x.kind === 'statements');
    expect(st.a).toBe(st.b * 20);
    expect(st.items.map((it) => FORMS[it.form](st.a, st.b))).toEqual([true, false, true, false, true]);
    for (const it of st.items) expect(it.text).toMatch(/120|6/);
    const sit = script.steps[0];
    expect(sit.bridge.a % sit.bridge.b).not.toBe(0); // the opening bridge does not hold: the question is real
    const lab = script.steps.find((x) => x.kind === 'bridges');
    expect(lab.suggest.some((c) => c.a % c.b === 0) && lab.suggest.some((c) => c.a % c.b !== 0)).toBe(true);
  });

  it('lets the class conclude only on its own evidence: four bridges, one that held, one that crumbled', () => {
    let log = [];
    for (const c of [
      { a: 15, b: 3 },
      { a: 16, b: 4 },
      { a: 42, b: 6 },
    ])
      log = classLog(log, c);
    expect(readyToConclude(log)).toBe(false);
    expect(missingEvidence(log)).toBe('fell'); // three bridges, all held
    log = classLog(log, { a: 16, b: 3 });
    expect(readyToConclude(log)).toBe(true);
    expect(missingEvidence(log)).toBe(null);
    expect(log.at(-1)).toMatchObject({ a: 16, b: 3, r: 1, held: false });
    expect(classLog(log, { a: 15, b: 3 })).toHaveLength(4); // the same bridge built again is not a new line
    expect(missingEvidence([])).toBe('held');
    expect(classRuleText({ q: 'r', c: 'zero' })).toBe('يثبت الجسر عندما: باقي قسمة طول الهوّة على طول اللوح يساوي 0.');
    expect(missingEvidence(classLog(classLog([], { a: 15, b: 3 }), { a: 16, b: 3 }))).toBe('more');
  });

  it('speaks in the voice of the class and writes only true equalities', () => {
    expect(classExplain({ q: 'r', c: 'zero' }, 18, 4)).toBe(
      'باقي قسمة 18 على 4 هو 2، و 2 لا يساوي 0: قاعدتنا تقول إنّ الجسر ينهار.',
    );
    expect(classExplain({ q: 'b', c: 'even' }, 15, 4)).toContain('قاعدتنا تقول إنّ الجسر يثبت');
    expect(equalityOf({ a: 42, b: 4, q: 10, r: 2 })).toBe('42 = 4 \\times 10 + 2');
    expect(equalityOf({ a: 42, b: 6, q: 7, r: 0 })).toBe('42 = 6 \\times 7');
    expect([1, 2, 8, 10, 11, 143].map(cellsOf)).toEqual([
      'خانة واحدة',
      'خانتان',
      '8 خانات',
      '10 خانات',
      '11 خانة',
      '143 خانة',
    ]);
    expect(proofOf('a_divides_b', 120, 6)).toBe('لوح طوله 120 لا يدخل في هوّة من 6 خانات.');
    expect([1, 2, 3, 11].map(leftCells)).toEqual(['بقيت خانة واحدة', 'بقيت خانتان', 'بقيت 3 خانات', 'بقيت 11 خانة']);
    const st = script.steps.find((x) => x.kind === 'statements');
    for (const it2 of st.items) expect(proofOf(it2.form, st.a, st.b), it2.form).toMatch(/120/);
    expect(proofOf('b_divides_a', 120, 6)).toBe('$120 = 6 \\times 20$: الباقي 0.');
    expect(proofOf('b_multiple_of_a', 120, 6)).toContain('240');
  });

  it('hides the words to recall, never a formula — and every word to recall is really in its rule', () => {
    expect(blanks('$b$ قاسم للعدد $a$ معناه', ['قاسم'])).toEqual([
      { t: 'math', v: '$b$' },
      { t: 'text', v: ' ' },
      { t: 'blank', v: 'قاسم' },
      { t: 'text', v: ' للعدد ' },
      { t: 'math', v: '$a$' },
      { t: 'text', v: ' معناه' },
    ]);
    expect(blanks('لا شيء', [])).toEqual([{ t: 'text', v: 'لا شيء' }]);
    for (const s of script.steps.filter((x) => x.kind === 'name')) {
      const t = T.tablets[s.tablet];
      const lines = [...t.lines, ...(t.list ?? [])];
      for (const w of s.recall)
        expect(
          lines.some((l) => blanks(l, [w]).some((p) => p.t === 'blank')),
          `« ${w} » in ${s.tablet}`,
        ).toBe(true);
    }
    for (const s of script.steps) expect(s.cue, s.id).toBeTruthy(); // every step gives the teacher one oral question
    expect(groupsOf(script).map((g) => g.steps.length)).toEqual([4, 2, 2, 2, 1]);
    expect(groupsOf(script).map((g) => g.kind)).toEqual(['name', 'name', 'name', 'name', 'trace']);
    expect(groupsOf(script).flatMap((g) => g.steps)).toEqual(script.steps.map((_, k) => k)); // every step is on the rail, once
    // the copybook is ONE group, whatever its number of pages
    const pages = { steps: [...script.steps, { id: 'trace-x', kind: 'trace', chapter: 'نكتب' }] };
    expect(groupsOf(pages).map((g) => g.kind)).toEqual(['name', 'name', 'name', 'name', 'trace']);
    expect(groupsOf(pages).at(-1).steps).toHaveLength(2);
    let long = [];
    for (let b = 2; b <= 12; b += 1) long = classLog(long, { a: 60, b });
    expect(long).toHaveLength(LOG_MAX);
    expect(long.at(-1).b).toBe(12);
    expect(
      railOf(script)
        .filter((r) => r.first)
        .map((r) => r.chapter),
    ).toEqual(['نكتشف', 'نستنتج', 'نسمّي', 'نكتشف', 'نسمّي', 'نكتشف', 'نسمّي', 'نكتشف', 'نسمّي', 'نكتب']);
  });
});

describe('حصّة القسم — a long tablet is drawn dense on its naming card', () => {
  const t = (words, list = []) => ({ lines: [words], list, notes: [], math: [] });
  it('five list items, or more words than DENSE_WORDS (a formula counts four)', () => {
    expect(denseTablet(t('قصير'))).toBe(false);
    expect(denseTablet(t('ق', ['1', '2', '3', '4', '5']))).toBe(true);
    expect(denseTablet(t('ك'.repeat(DENSE_WORDS + 1)))).toBe(true);
    expect(denseTablet(t(`${'ك'.repeat(DENSE_WORDS - 10)} $\\sqrt{123456789}$`))).toBe(false);
    // a fraction of two storeys in its words is taller than a line (lesson 2 of « قصر الساحات », its first tablet)
    const tall = `${'ك'.repeat(DENSE_WORDS - 30)} $\\dfrac{144}{25}$ $\\dfrac{12}{5}$`;
    expect(denseTablet(t(tall))).toBe(true);
    expect(denseTablet(t(tall.replace(/\\dfrac\{(\d+)\}\{(\d+)\}/g, '$1')))).toBe(false);
  });
});
