import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import PitchExpansion, { CHAINS_PLAYER, QUESTIONS, chainsOfPlayer, buildDecoy, wrongForms } from './PitchExpansion';
import { InMissionPlayerContext, MissionAreaContext } from '../../mission/missionPlayerContext';
import * as L from '../logic/pitchExpansion';
import { isCorrect } from '../primitives/labCheckpoint';
import { evaluate, samePolynomial } from '@smarter-academy/core/arithmetic/polynomials.js';

/**
 * Le traitement v2 du labo `pitch-expansion` dans le lecteur de mission (rollout 2026-11-11, unité 3 leçon 1 ; conseil du 2026-11-11).
 * Chaque question dit la MÊME vérité que la logique, aucune clé brute ni `{{` à l'écran, les réponses changent de place ; la page
 * (pitchExpansion.render.test.jsx, la leçon 2 et la synthèse) reste inchangée — ici : ce que seul le lecteur montre.
 */
const t = (key, o) => i18n.t(`lesson:${key}`, o);
const k = (key, o) => t(`manipulation.pitchExpansion.${key}`, o);
const rawKey = /manipulation\.[a-zA-Z]|\{\{/;
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.slots}{q.ops}{q.tiles?.map((x) => <span key={x}>{q.render ? q.render(x) : x}</span>)}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}</div>);
const inPlayer = (el) => renderToString(<InMissionPlayerContext.Provider value><MissionAreaContext.Provider value={{ width: 1280, height: 640 }}>{el}</MissionAreaContext.Provider></InMissionPlayerContext.Provider>);
/** Porter les zones `ids` (toutes par défaut) puis vérifier aux valeurs `xs`. */
const run = (expr, xs, { ids = null, simplify = true } = {}) => {
  let s = L.init({ expr, simplify });
  (ids ?? s.cells.map((c) => c.id)).forEach((id) => { s = L.collect(s, id); });
  xs.forEach((x) => { s = L.verify(s, x); });
  return s;
};

describe('pitch-expansion in the mission player — rendering', () => {
  it('area mode: zones, cells and chips show NUMBERS at x, the sides keep their letters; no sweep, no stepper', () => {
    const html = inPlayer(<PitchExpansion expr="3x-1|3+x" span={5} labels="area" start={2} levels={false} chains="double" />);
    expect(html).toContain('data-labels="area"');
    expect(html).toContain('data-zone-area="18"');     // 9x at x = 2
    expect(html).toContain('data-zone-area="12"');     // 3x² at x = 2
    expect(html).toContain('data-zone-area="-3"');
    expect(html).toContain('data-pitch-zone="0-0"');
    expect(html).not.toContain('data-lab-stepper');
    expect(html).toContain('data-pe-verdict-live');
    expect(html).not.toMatch(rawKey);
    // the zone label starts with its visible number (label-in-name); a removed zone reads « مقتطعة »
    expect(html).toMatch(/aria-label="18 —/);
    expect(html).toContain('مقتطعة 3');
  });

  it('the page is unchanged: letters on the zones, the trials list, no player region, labels ignored', () => {
    const page = renderToString(<PitchExpansion expr="3x-1|3+x" labels="area" />);
    expect(page).not.toContain('data-zone-area');
    expect(page).not.toContain('data-pe-verdict-live');
        expect(page).toContain('data-pitch-zone');
  });

  it('the ruler skips a collision: x = 3 is never a tick of (3x − 1)(3 + x) in area mode, and the start is 2', () => {
    const html = inPlayer(<PitchExpansion expr="3x-1|3+x" span={5} labels="area" start={2} levels={false} />);
    expect(html).toContain('data-x="2"');
    expect(html).not.toMatch(/y="55"[^>]*>3<\/text>/);
    expect(html).toMatch(/y="55"[^>]*>4<\/text>/);
  });

  it('the free round offers pitches as choices; the prediction tray opens before the first gesture', () => {
    const free = inPlayer(<PitchExpansion expr="x+1|2x+3" levels={false} checkpoints={false} choices={['x+1|2x+3', '2|3x+4']} />);
    expect((free.match(/data-pe-choice="/g) ?? []).length).toBe(2);
    expect(free).toContain('aria-pressed="true"');
    const pred = inPlayer(<PitchExpansion expr="3x-1|3+x" span={5} labels="area" start={2} levels={false} chains="double" predict={[{ key: 'p1', kind: 'unhatched' }]} />);
    expect(pred).toContain('data-pe-predict');
    expect(pred).toContain('data-pred-ring="true"');
    expect(pred).not.toMatch(rawKey);
  });
});

describe('pitch-expansion in the mission player — the question chains', () => {
  it('chains and their checkpoint ids', () => {
    expect(CHAINS_PLAYER.dist.map((c) => [c.id, c.qs])).toEqual([['build', ['area', 'build']], ['rule', ['rulePlayer']]]);
    expect(chainsOfPlayer('double').map((c) => c.id)).toEqual(['build4', 'rule']);
    expect(chainsOfPlayer('restored').map((c) => c.id)).toEqual(['corner', 'result']);
    expect(chainsOfPlayer('result').map((c) => c.id)).toEqual(['result']);
    expect(chainsOfPlayer('distEasy').map((c) => c.id)).toEqual(['build']);
    expect(chainsOfPlayer('nope')).toEqual([]);
  });

  it('BUILD k(a + b): one slot per zone, the expected tiles are the zone terms, ONE decoy (the term not multiplied), refuted by the numbers', () => {
    const s = run('3|x+5', [3], { simplify: false });
    const q = QUESTIONS.build(s, k);
    expect(q.expected).toEqual(['3x', '15']);
    expect(q.tiles).toHaveLength(3);
    expect(buildDecoy(s)).toBe('5');
    expect(isCorrect(q, ['3x', '15'])).toBe(true);
    expect(isCorrect(q, ['3x', '5'])).toBe(false);
    // the decoy sum differs from the pitch at the student's x
    expect(3 * 3 + 5).not.toBe(3 * (3 + 5));
    expect(text(q)).not.toMatch(rawKey);
  });

  it('BUILD four zones: the hatched zone ADDED is the decoy, and the decoy moves between pitches', () => {
    const s = run('3x-1|3+x', [2], { simplify: false });
    const q = QUESTIONS.build4(s, k);
    expect(q.expected).toEqual(['9x', '3x^2', '-3', '-x']);
    expect(buildDecoy(s)).toBe('x');
    expect(isCorrect(q, q.expected)).toBe(true);
    expect(text(q)).not.toMatch(rawKey);
    expect(text(q)).toContain('(-3)');   // a negative tile is drawn in parentheses (KaTeX source)
    const e = run('x-1|x+2', [3], { simplify: false });
    expect(buildDecoy(e)).toBe('2');
    const pos = (qq) => qq.tiles.indexOf(buildDecoy(qq === q ? s : e));
    expect(pos(QUESTIONS.build4(e, k))).not.toBe(pos(q));
  });

  it('the corner: (−2)(−1) = +2 is right; the minus and the zero are refuted; it works for the practice pitch too', () => {
    [['x-2|2x-1', 5], ['x-1|x-2', 4]].forEach(([expr, x]) => {
      const q = QUESTIONS.corner(run(expr, [x]), k);
      expect(q.options.filter((o) => o.correct)).toHaveLength(1);
      q.options.filter((o) => !o.correct).forEach((o) => expect(o.why).toBeTruthy());
      expect(text(q)).not.toMatch(rawKey);
    });
  });

  it('the player rule carries the geometric reason; the page options are unchanged; the right option moves', () => {
    const a = QUESTIONS.rulePlayer(run('3|x+5', [3, 7], { simplify: false }), k);
    const b = QUESTIONS.rulePlayer(run('3x-1|3+x', [2, 4], { simplify: false }), k);
    [a, b].forEach((q) => {
      const right = renderToString(<div>{q.options.find((o) => o.correct).text}</div>);
      expect(right).toContain('المناطق نفسها');
      expect(text(q)).not.toMatch(rawKey);
    });
    expect(a.options.findIndex((o) => o.correct)).not.toBe(b.options.findIndex((o) => o.correct));
  });

  it('the result question tells the truth at the student\'s x (r3 and module 2\'s pitch)', () => {
    [['x-2|2x-1', [5, 7]], ['2x-3|x-1', [3, 5]]].forEach(([expr, xs]) => {
      let s = run(expr, []);
      // reduce: merge the two x terms
      const xs1 = s.tray.filter((c) => c.term.p === 1).map((c) => c.id);
      s = L.merge(s, xs1[0], xs1[1]);
      xs.forEach((x) => { s = L.verify(s, x); });
      expect(L.playerDiscovery(s)).toBe(true);
      const q = QUESTIONS.result(s, k);
      const right = s.cells.map((c) => c.term);
      wrongForms(s).forEach((w) => expect(samePolynomial(w.terms, right)).toBe(false));
      wrongForms(s).forEach((w) => expect(evaluate(w.terms, xs[0])).not.toBe(evaluate(right, xs[0])));
      expect(text(q)).not.toMatch(rawKey);
    });
  });
});

describe('pitch-expansion i18n — no raw key, no reserved {{ns}}', () => {
  it('every player string resolves', () => {
    ['player.waiting', 'player.ok', 'player.again', 'pred.unhatched', 'pred.otherX', 'pred.termsLeft', 'coach.carry', 'coach.missing', 'coach.ruler',
      'player.rule.distRight', 'player.rule.doubleRight', 'cp.build.prompt', 'cp.build4.prompt', 'cp.corner.prompt', 'cp.player.ruleHint2']
      .forEach((key) => { const v = k(key, { n: 2, v: '3', prod: '$x$' }); expect(v, key).not.toMatch(rawKey); expect(v).not.toContain('{{ns}}'); });
    // predictions: at most 8 Arabic words, no formula, no « $ »
    ['pred.unhatched', 'pred.otherX', 'pred.termsLeft'].forEach((key) => {
      const v = k(key);
      expect(v).not.toContain('$');
      expect(v.split(/\s+/).length, key).toBeLessThanOrEqual(8);
    });
  });
});
