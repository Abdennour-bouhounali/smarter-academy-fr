import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import VanishingPitch, { QUESTIONS, chainsOfPlayer } from './VanishingPitch';
import { InMissionPlayerContext } from '../../mission/missionPlayerContext';
import * as L from '../logic/vanishingPitch';
import * as P from '../logic/vanishingPitchPlayer';
import { isCorrect } from '../primitives/labCheckpoint';

/**
 * Le labo `vanishing-pitch` dans le lecteur de mission (rollout 2026-11-11, unité 4 leçon 2 ; conseil du 2026-11-11, verdict L2). Chaque question
 * dit la MÊME vérité que la logique, aucune clé brute ni `{{` à l'écran, les réponses changent de place ; la page (vanishingPitch.render.test.jsx)
 * reste inchangée — ici : ce que seul le lecteur montre.
 */
const k = (key, o) => i18n.t(`lesson:manipulation.vanishingPitch.${key}`, o);
const rawKey = /manipulation\.[a-zA-Z]|\{\{/;
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.fields?.map((f, i) => <span key={i}>{f.label}{f.options.map((o) => (f.render ? f.render(o) : o))}</span>)}{q.slots}{q.ops}{q.tiles?.map((x, i) => <b key={i}>{x.text ?? (q.render ? q.render(x) : x)}</b>)}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}</div>);
const inPlayer = (el) => renderToString(<InMissionPlayerContext.Provider value>{el}</InMissionPlayerContext.Provider>);
const finished = (expr, startX) => {
  let s = L.init({ expr, startX });
  s.rootUnits.forEach((u) => { s = L.pin(L.move(s, u)); });
  s = L.move(L.move(s, s.range.min), s.range.max);
  return L.claimNoOther(s);
};

describe('vanishing-pitch in the mission player — rendering', () => {
  it('no stepper, no sweep, no « جرّب » ; the live region, the paged field block, the handle and no raw key', () => {
    const html = inPlayer(<VanishingPitch expr="2|x-3" startX={5} levels={false} chains="build" />);
    expect(html).toContain('data-vanishing-verdict-live');
    expect(html).toContain('role="status"');
    expect(html).toContain('data-paging-keep');
    expect(html).toContain('data-vanishing-handle');
    expect(html).not.toContain('data-vp-step');
    expect(html).not.toMatch(rawKey);
    expect(html).not.toMatch(/data-vanishing-(less|more)[^>]* disabled=""/);
    const page = renderToString(<VanishingPitch expr="2|x-3" />);
    expect(page).not.toContain('data-vanishing-verdict-live');
    expect(page).not.toContain('data-vanishing-handle');
    expect(page).not.toContain('data-paging-keep');
    expect(page).not.toContain('data-vanishing-tarp');
  });
  it('the covered round shows a tarp and « ? » for every value; the uncovered one shows the values', () => {
    const html = inPlayer(<VanishingPitch expr="2x-3|x+1" startX={2} range={[-3, 4]} covered levels={false} chains="build" />);
    expect(html).toContain('data-vanishing-tarp');
    expect(html).toContain('data-vanishing-tarp-label');
    expect(html).not.toContain('data-vanishing-line');
    expect(html).not.toContain('data-decor-ball');
    expect(html).toContain('data-vanishing-area="?"');
    const open = inPlayer(<VanishingPitch expr="2x-1|x+1" startX={2} levels={false} chains="none" />);
    expect(open).not.toContain('data-vanishing-tarp');
    expect(open).toContain('data-decor-ball');
  });
  it('the free round offers its pitches as choices, the current one pressed', () => {
    const choices = [{ expr: '4|x+1', startX: 2 }, { expr: 'x-1', startX: 3 }];
    const html = inPlayer(<VanishingPitch expr="4|x+1" startX={2} levels={false} checkpoints={false} choices={choices} />);
    expect((html.match(/data-vanishing-choice="/g) ?? []).length).toBe(2);
    const pressed = [...html.matchAll(/<button[^>]*data-vanishing-choice="([^"]+)"[^>]*>/g)].filter((m) => m[0].includes('aria-pressed="true"')).map((m) => m[1]);
    expect(pressed).toEqual(['pitch-4|x+1']);
    expect(renderToString(<VanishingPitch expr="4|x+1" choices={choices} />)).not.toContain('data-vanishing-choice');
  });
});

describe('vanishing-pitch in the mission player — chains', () => {
  it('chains by family; every chain is reached by the player discovery', () => {
    expect(chainsOfPlayer('build', L.init({ expr: '2|x-3' }))[0].qs).toEqual(['which', 'rest', 'buildConst']);
    expect(chainsOfPlayer('build', L.init({ expr: '2x|x+2' }))[0].qs).toEqual(['buildSol']);
    expect(chainsOfPlayer('build', L.init({ expr: '2x-3|x+1' }), true)[0].qs).toEqual(['which', 'buildSol']);
    expect(chainsOfPlayer('rule', L.init({ expr: 'x-1|x+4' }))[0].qs).toEqual(['which', 'buildOr', 'ruleP']);
    expect(chainsOfPlayer('count', L.init({ expr: 'x+1' }))[0].qs).toEqual(['which', 'countP']);
    expect(chainsOfPlayer('none', L.init({ expr: 'x+1' }))).toEqual([]);
  });
  const scenes = [
    ['2(x-3) build', finished('2|x-3', 5), chainsOfPlayer('build', L.init({ expr: '2|x-3' }))],
    ['(x-1)(x+4) rule', finished('x-1|x+4', 3), chainsOfPlayer('rule', L.init({ expr: 'x-1|x+4' }))],
    ['2x(x+2) build', finished('2x|x+2', 1), chainsOfPlayer('build', L.init({ expr: '2x|x+2' }))],
    ['(2x-3)(x+1) covered', finished('2x-3|x+1', 2), chainsOfPlayer('build', L.init({ expr: '2x-3|x+1' }), true)],
    ['(x+1)^2 count', finished('x+1', 2), chainsOfPlayer('count', L.init({ expr: 'x+1' }))],
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
  it('the builds: the order of the connector tiles is accepted both ways, the decoys are refused, the « أو » tile is plain text', () => {
    const r2 = QUESTIONS.buildOr(finished('x-1|x+4', 3), k);
    expect(r2.tiles.filter((t) => t?.text).map((t) => t.text).sort()).toEqual(['أو', 'معًا'].sort());
    expect(isCorrect(r2, ['x - 1', 'أو', 'x + 4'])).toBe(true);
    expect(isCorrect(r2, ['x + 4', 'أو', 'x - 1'])).toBe(true);
    expect(isCorrect(r2, ['x - 1', 'معًا', 'x + 4'])).toBe(false);
    const r1 = QUESTIONS.buildConst(finished('2|x-3', 5), k);
    expect(isCorrect(r1, ['x - 3', '3'])).toBe(true);
    expect(isCorrect(r1, ['2', '3'])).toBe(false);
    const sol = QUESTIONS.buildSol(finished('2x|x+2', 1), k);
    expect(isCorrect(sol, ['0', '-2'])).toBe(true);
    expect(isCorrect(sol, ['-2', '0'])).toBe(true);
    expect(isCorrect(sol, ['2', '0'])).toBe(false);
  });
  it('the rest chips and the count chips are read from the lab', () => {
    const f = QUESTIONS.rest(finished('2|x-3', 5), k);
    expect(f.fields[0].expected).toBe('2');
    expect(f.fields[0].options).toEqual(expect.arrayContaining(['2', '0', '3']));
    expect(QUESTIONS.countP(finished('x+1', 2), k).fields[0].expected).toBe('1');
  });
  it('the verdict words and the coach texts exist; a refusal never starts with « مرفوض » and never says « خطأ »', () => {
    expect(k('player.cueRefused')).toMatch(/مرفوض/);
    expect(k('vNot', { x: '1', area: '2' })).not.toMatch(/^مرفوض|خطأ/);
    ['drag', 'pin', 'claim'].forEach((id) => expect(k(`coach.${id}`)).not.toMatch(rawKey));
    ['count', 'atZero', 'zeroB', 'yes', 'no', 'wrong'].forEach((id) => expect(k(`predict.${id}`)).not.toMatch(rawKey));
    expect(P.PREDICT_KEYS).toEqual(['count', 'atZero', 'zeroB']);
  });
});
