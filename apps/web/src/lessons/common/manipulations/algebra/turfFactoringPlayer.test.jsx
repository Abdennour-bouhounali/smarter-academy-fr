import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import { expand, samePolynomial } from '@smarter-academy/core/arithmetic/polynomials.js';
import TurfFactoring, { CHAINS_PLAYER, QUESTIONS, chainsOfPlayer } from './TurfFactoring';
import { InMissionPlayerContext } from '../../mission/missionPlayerContext';
import * as L from '../logic/turfFactoring';
import { isCorrect } from '../primitives/labCheckpoint';

/**
 * Le traitement v2 du labo `turf-factoring` dans le lecteur de mission (rollout 2026-11-11, unité 3 leçon 3 ; conseil du 2026-11-11, verdict L3).
 * Chaque question dit la MÊME vérité que la logique (l'algèbre de polynomials.js), aucune clé brute ni `{{` à l'écran, les réponses changent de
 * place ; la page (turfFactoring.render.test.jsx) reste inchangée — ici : ce que seul le lecteur montre.
 */
const k = (key, o) => i18n.t(`lesson:manipulation.turfFactoring.${key}`, o);
const rawKey = /manipulation\.[a-zA-Z]|\{\{/;
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.fields?.map((f, i) => <span key={i}>{f.label}{f.options.map((o) => (f.render ? f.render(o) : o))}</span>)}{q.slots}{q.tiles?.map((x) => (q.render ? q.render(x) : x))}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}</div>);
const inPlayer = (el) => renderToString(<InMissionPlayerContext.Provider value>{el}</InMissionPlayerContext.Provider>);
const rows = (expr, ...rs) => rs.reduce((s, r) => L.setRows(s, r), L.initRows({ expr }));
const square = (b, c, ...rights) => rights.reduce((s0, right) => {
  let s = L.reopen(s0);
  while (s.right > 0) s = L.place(s, 'right', 'stock');
  while (s.bottom > 0) s = L.place(s, 'bottom', 'stock');
  for (let i = 0; i < right; i += 1) s = L.place(s, 'stock', 'right');
  while (L.stock(s) > 0) s = L.place(s, 'stock', 'bottom');
  return L.close(s);
}, L.initSquare({ b, c }));

describe('turf-factoring in the mission player — rendering', () => {
  it('no stepper, no sweep, no page tried-chips; the live region, the paged field block and no overflow-x-auto', () => {
    const html = inPlayer(<TurfFactoring mode="rows" expr="8x+6" levels={false} chains="build" />);
    expect(html).toContain('data-turf-verdict-live');
    expect(html).toContain('role="status"');
    expect(html).toContain('data-paging-keep');
    expect(html).toContain('data-turf-handle');
    expect(html).not.toContain('data-tf-step');
    expect(html).not.toContain('overflow-x-auto');
    expect(html).not.toContain('data-turf-tried');
    expect(html).not.toMatch(rawKey);
    // ± are frozen by aria-disabled + a guard, never `disabled` (focus stays on the button)
    expect(html).not.toMatch(/data-turf-(less|more)[^>]* disabled=""/);
    // the page is unchanged: its tried chips, its horizontal scroll, no player region
    const page = renderToString(<TurfFactoring mode="rows" expr="8x+6" />);
    expect(page).toContain('overflow-x-auto');
    expect(page).not.toContain('data-turf-verdict-live');
    expect(page).not.toContain('data-turf-handle');
    expect(page).not.toContain('data-paging-keep');
  });
  it('the square in the player: the close button is white on emerald-700 with the indigo focus ring', () => {
    const html = inPlayer(<TurfFactoring mode="square" b={6} c={9} levels={false} chains="full" />);
    expect(html).toMatch(/data-turf-close[^>]*bg-emerald-700|bg-emerald-700[^>]*data-turf-close/);
    expect(html).toContain('ring-indigo-600');
    expect(renderToString(<TurfFactoring mode="square" b={6} c={9} />)).toMatch(/bg-emerald-600/);
  });
  it('the free round offers its fields as choices, the current one pressed; a rows set with a NEGATIVE count draws hatched tiles', () => {
    const choices = [{ mode: 'rows', expr: '6x+3' }, { mode: 'rows', expr: '9x^2-6x' }, { mode: 'square', b: 4, c: 4 }];
    const html = inPlayer(<TurfFactoring mode="rows" expr="6x+3" levels={false} checkpoints={false} choices={choices} />);
    expect((html.match(/data-turf-choice="/g) ?? []).length).toBe(3);
    const pressed = [...html.matchAll(/<button[^>]*data-turf-choice="([^"]+)"[^>]*>/g)].filter((m) => m[0].includes('aria-pressed="true"')).map((m) => m[1]);
    expect(pressed).toEqual(['rows-6x+3']);
    const neg = inPlayer(<TurfFactoring mode="rows" expr="9x^2-6x" levels={false} checkpoints={false} />);
    expect(neg).toContain('border-rose-500');   // the subtracted strips are hatched
    expect(renderToString(<TurfFactoring mode="rows" expr="6x+3" choices={choices} />)).not.toContain('data-turf-choice');
  });
});

describe('turf-factoring in the mission player — chains', () => {
  it('chains by family; the rule ends the full chains; every chain id is reached by the lab\'s discovery', () => {
    expect(chainsOfPlayer('rows', 'build').map((c) => c.qs)).toEqual([['rowFill', 'buildFactor']]);
    expect(chainsOfPlayer('rows', 'full')[0].qs.at(-1)).toBe('ruleP');
    expect(chainsOfPlayer('square', 'full', L.initSquare({ b: 6, c: 9 }))[0].qs).toEqual(['corner', 'buildSquare', 'ruleP']);
    expect(chainsOfPlayer('square', 'full', L.initSquare({ b: 0, c: 25 }))[0].qs).toEqual(['outside', 'why', 'ruleP']);
    expect(CHAINS_PLAYER.rows.none).toEqual([]);
    // 'full' asks the full height g·x: a rows field without x² (m = 0) falls back to 'build'
    expect(chainsOfPlayer('rows', 'full', L.initRows({ expr: '8x+6' }))[0].qs).toEqual(['rowFill', 'buildFactor']);
    expect(chainsOfPlayer('rows', 'full', L.initRows({ expr: '6x^2+2x' }))[0].qs).toContain('heightFill');
  });
  const scenes = [
    ['8x+6 build', rows('8x+6', 3, 2), chainsOfPlayer('rows', 'build')],
    ['6x²+2x full', rows('6x^2+2x', 3, 2), chainsOfPlayer('rows', 'full')],
    ['x²+6x+9 full', square(6, 9, 2, 3), chainsOfPlayer('square', 'full', L.initSquare({ b: 6, c: 9 }))],
    ['x²+25 full', square(0, 25, 0), chainsOfPlayer('square', 'full', L.initSquare({ b: 0, c: 25 }))],
  ];
  for (const [name, lab, chains] of scenes) {
    it(`${name}: reached, every question renders without raw key, two hints, one right answer (or an expected value)`, () => {
      chains.forEach((c) => {
        expect(c.reached(lab), name).toBe(true);
        c.qs.forEach((qid) => {
          const q = QUESTIONS[qid](lab, k);
          expect(text(q), `${name}.${qid}`).not.toMatch(rawKey);
          expect(q.hints, `${name}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${name}.${qid}`).toHaveLength(1);
          if (q.kind === 'fill') expect(isCorrect(q, q.fields.map((f) => f.expected)), `${name}.${qid}`).toBe(true);
          if (q.kind === 'build') expect(isCorrect(q, q.expected), `${name}.${qid}`).toBe(true);
        });
      });
    });
  }
  it('the build tells the same truth as the algebra: the expected tiles expand to the sum, the decoy is refused, the swap accepted', () => {
    const lab = rows('8x+6', 3, 2);
    const q = QUESTIONS.buildFactor(lab, k);
    expect(q.tiles).toHaveLength(4);
    expect(q.tiles).toEqual(expect.arrayContaining(['2', '4x', '3', '6']));
    expect(isCorrect(q, ['2', '4x', '3'])).toBe(true);
    expect(isCorrect(q, ['2', '3', '4x'])).toBe(true);
    expect(isCorrect(q, ['2', '4x', '6'])).toBe(false);
    expect(samePolynomial(expand([{ c: 2, p: 0 }], [{ c: 4, p: 1 }, { c: 3, p: 0 }]), lab.terms)).toBe(true);
    expect(q.wrap).toEqual(['', ')']);
    const sq = QUESTIONS.buildSquare(square(6, 9, 2, 3), k);
    expect(isCorrect(sq, ['x', '3'])).toBe(true);
    expect(isCorrect(sq, ['3', 'x'])).toBe(true);
    expect(isCorrect(sq, ['x', '9'])).toBe(false);
  });
  it('fills: the row content and the full height are read from the lab', () => {
    const f = QUESTIONS.rowFill(rows('8x+6', 3, 2), k);
    expect(f.fields[0].expected).toBe('4');
    expect(f.fields[0].options).toEqual(expect.arrayContaining(['4', '8', '3']));
    const h = QUESTIONS.heightFill(rows('6x^2+2x', 3, 2), k);
    expect(h.fields[0].expected).toBe('2x');
    expect(h.fields[0].options).toEqual(expect.arrayContaining(['2', 'x', '2x']));
  });
  it('the player rule\'s right option gives the tiling reason; the page options are unchanged', () => {
    const r = QUESTIONS.ruleP(rows('6x^2+2x', 3, 2), k);
    const right = renderToString(<div>{r.options.find((o) => o.correct).text}</div>);
    expect(right).toContain('تُرصّ صفوفًا');
    const s = QUESTIONS.ruleP(square(6, 9, 2, 3), k);
    expect(renderToString(<div>{s.options.find((o) => o.correct).text}</div>)).toContain('تُرصّ مربّعًا');
    // the right option does not always sit in the same place
    expect(r.options.findIndex((o) => o.correct)).not.toBe(s.options.findIndex((o) => o.correct));
    const page = QUESTIONS.rule(rows('6x^2+2x', 3, 2), k);
    expect(renderToString(<div>{page.options.find((o) => o.correct).text}</div>)).not.toContain('تُرصّ');
  });
  it('the verdict words: a refusal is « مرفوض », never « خطأ »; every journal word exists', () => {
    ['rowWord.rowsNo', 'rowWord.refused', 'cueRefused'].forEach((key) => expect(k(key)).toMatch(/مرفوض/));
    // the verdict text follows the cue word « مرفوض. » : it never repeats it (a11y review 2026-11-11), and never says « خطأ »
    ['vp.rowsNo', 'vp.refused'].forEach((key) => { expect(k(key, { r: 3 })).not.toMatch(/^مرفوض/); expect(k(key, { r: 3 })).not.toMatch(/خطأ/); });
    ['drag', 'look', 'another', 'stock', 'place', 'close', 'lookCorner', 'move', 'reopen'].forEach((id) => expect(k(`coach.${id}`)).not.toMatch(rawKey));
    ['rowHeight', 'maxRows', 'sideStrips', 'closes'].forEach((id) => {
      const words = k(`predict.${id}`).replace(/\$[^$]*\$/g, '').trim().split(/\s+/).length;
      expect(words, id).toBeLessThanOrEqual(8);
      expect(k(`predict.${id}`)).not.toContain('$');
    });
  });
});
