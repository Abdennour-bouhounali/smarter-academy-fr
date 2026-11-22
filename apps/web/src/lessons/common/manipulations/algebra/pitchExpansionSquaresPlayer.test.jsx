import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import PitchExpansion, { CHAINS_PLAYER, QUESTIONS, chainsOfPlayer } from './PitchExpansion';
import { InMissionPlayerContext, MissionAreaContext } from '../../mission/missionPlayerContext';
import * as L from '../logic/pitchExpansion';
import { isCorrect } from '../primitives/labCheckpoint';

/**
 * Le lecteur de mission de `pitch-expansion` pour les TERRAINS CARRÉS de la leçon 2 `mutatabiqat-shahira` (rollout 2026-11-11 ; conseil L2.1–L2.7).
 * Ajouté à côté de pitchExpansionPlayer.test.jsx (leçon 1, inchangé) : chaque question dit la vérité de la logique, aucune clé brute ni `{{`,
 * aucune phrase « قُطع مرّتين فيُضاف مرّة » dans le lecteur ; la page reste celle d'aujourd'hui.
 */
const t = (key, o) => i18n.t(`lesson:${key}`, o);
const k = (key, o) => t(`manipulation.pitchExpansion.${key}`, o);
const rawKey = /manipulation\.[a-zA-Z]|\{\{/;
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.wrap}{q.slots}{q.fields?.map((f, i) => <span key={i}>{f.label}{f.options.map((o) => <b key={o}>{f.render ? f.render(o) : o}</b>)}</span>)}{q.tiles?.map((x) => <span key={x}>{q.render ? q.render(x) : x}</span>)}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}</div>);
const inPlayer = (el) => renderToString(<InMissionPlayerContext.Provider value><MissionAreaContext.Provider value={{ width: 1280, height: 640 }}>{el}</MissionAreaContext.Provider></InMissionPlayerContext.Provider>);
const run = (expr, xs, { simplify = true, merge = true } = {}) => {
  let s = L.init({ expr, simplify });
  s.cells.forEach((c) => { s = L.collect(s, c.id); });
  if (merge && simplify) {
    [0, 1, 2].forEach((p) => {
      let like = s.tray.filter((c) => c.term.p === p);
      while (like.length > 1) { s = L.merge(s, like[0].id, like[1].id); like = s.tray.filter((c) => c.term.p === p); }
    });
  }
  xs.forEach((x) => { s = L.verify(s, x); });
  return s;
};
const CORNER_PHRASE = /مرّتين[^.]*(يُضاف|فيُضاف|يُعاد|فيُعاد)\s*مرّة/;

describe('pitch-expansion square fields in the mission player — rendering', () => {
  it('(x + 4)² in areas: twin strip numbers at x = 3 (12 and 12), x = 4 is never a tick', () => {
    const html = inPlayer(<PitchExpansion expr="x+4" span={5} labels="area" start={3} levels={false} chains="square" />);
    expect(html).toContain('data-kind="square-sum"');
    expect((html.match(/data-zone-area="12"/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(html).toContain('data-zone-area="9"');
    expect(html).not.toMatch(/y="55"[^>]*>4<\/text>/);
    expect(html).toMatch(/y="55"[^>]*>5<\/text>/);
    expect(html).not.toMatch(rawKey);
  });

  it('(x − 5)² starts at x = 9 and opens on the claim prediction with the whole field ringed', () => {
    const html = inPlayer(<PitchExpansion expr="x-5" span={5} labels="terms" start={9} levels={false} chains="squareDiff"
      predict={[{ key: 'c', kind: 'claim', claim: 'x^2-25' }, { key: 't', kind: 'twice' }]} />);
    expect(html).toContain('data-x="9"');
    expect(html).toContain('data-pe-predict');
    expect(html).toContain('data-pred-ring="true"');
    expect(html).toContain('x^2 - 25');
    expect(html).not.toMatch(rawKey);
  });

  it('the page keeps its own labels and its own explanation (no zero chip, no ring, no relabel)', () => {
    const page = renderToString(<PitchExpansion expr="x+3|x-3" />);
    expect(page).not.toContain('data-tray-zero');
    expect(page).not.toContain('data-side-name');
    expect(page).not.toContain('data-pe-verdict-live');
  });
});

describe('pitch-expansion square fields — chains and questions', () => {
  it('the chains of lesson 2 and their checkpoint ids; lesson 1 chains untouched', () => {
    expect(chainsOfPlayer('square').map((c) => [c.id, c.qs])).toEqual([['strips', ['stripFill']], ['rule', ['identityBuild', 'rulePlayer']]]);
    expect(chainsOfPlayer('squareDiff').map((c) => c.id)).toEqual(['cornerFill', 'rule']);
    expect(chainsOfPlayer('sumDiff').map((c) => c.id)).toEqual(['cancel', 'rule']);
    expect(chainsOfPlayer('coef').map((c) => c.id)).toEqual(['coef']);
    ['squareEasy', 'squareDiffEasy', 'sumDiffEasy', 'coefEasy'].forEach((m) => expect(CHAINS_PLAYER[m]).toHaveLength(1));
    expect(chainsOfPlayer('dist').map((c) => c.id)).toEqual(['build', 'rule']);
  });

  it('stripFill: fill question, 2 × 4x right, the rest wrong; no raw key', () => {
    const q = QUESTIONS.stripFill(run('x+4', [3], { simplify: false }), k);
    expect(q.kind).toBe('fill');
    expect(isCorrect(q, ['2', '4x'])).toBe(true);
    expect(isCorrect(q, ['2', '8x'])).toBe(false);
    expect(isCorrect(q, ['1', '4x'])).toBe(false);
    expect(text(q)).not.toMatch(rawKey);
  });

  it('cornerFill on the round\'s numbers: 2 and +25; never the « cut twice, add once » sentence', () => {
    const q = QUESTIONS.cornerFill(run('x-5', [9]), k);
    expect(isCorrect(q, ['2', '+25'])).toBe(true);
    expect(isCorrect(q, ['2', '-25'])).toBe(false);
    expect(text(q)).toContain('25');
    expect(text(q)).not.toMatch(rawKey);
    expect(CORNER_PHRASE.test(text(q))).toBe(false);
  });

  it('cancelFill: 0', () => {
    const q = QUESTIONS.cancelFill(run('x+4|x-4', [7]), k);
    expect(isCorrect(q, ['0'])).toBe(true);
    expect(isCorrect(q, ['8x'])).toBe(false);
    expect(text(q)).not.toMatch(rawKey);
  });

  it('identityBuild in LETTERS: one decoy, a² preset, the two orders accepted; the decoy refused', () => {
    const sum = QUESTIONS.identityBuild(run('x+4', [3, 5], { simplify: false }), k);
    expect(sum.kind).toBe('build');
    expect(sum.tiles).toHaveLength(4);
    expect(sum.tiles).toContain('ab');
    expect(sum.preset).toEqual(['a^2', null, null]);
    expect(isCorrect(sum, ['a^2', '2ab', 'b^2'])).toBe(true);
    expect(isCorrect(sum, ['a^2', 'b^2', '2ab'])).toBe(true);
    expect(isCorrect(sum, ['a^2', 'ab', 'b^2'])).toBe(false);
    const diff = QUESTIONS.identityBuild(run('x-5', [9, 7]), k);
    expect(diff.tiles).toContain('-b^2');
    expect(isCorrect(diff, ['a^2', '-2ab', '+b^2'])).toBe(true);
    expect(isCorrect(diff, ['a^2', '-2ab', '-b^2'])).toBe(false);
    const sd = QUESTIONS.identityBuild(run('x+4|x-4', [7, 9]), k);
    expect(isCorrect(sd, ['a^2', '-b^2'])).toBe(true);
    expect(isCorrect(sd, ['a^2', '+b^2'])).toBe(false);
    [sum, diff, sd].forEach((q) => expect(text(q)).not.toMatch(rawKey));
    // the left side is aria-hidden in `wrap`: the prompt states it too (a11y review)
    expect(renderToString(<div>{sum.prompt}</div>)).toContain('(a + b)^2');
    expect(renderToString(<div>{diff.prompt}</div>)).toContain('(a - b)^2');
    // the decoy sits at a place that changes with the field
    expect(sum.tiles.indexOf('ab')).not.toBe(diff.tiles.indexOf('-b^2'));
  });

  it('coefBuild in NUMBERS: 4x², −4x, +1 (signs in the tiles) — the decoy 2x² refused; the prompt states what is expanded', () => {
    const q = QUESTIONS.coefBuild(run('2x-1', [3, 5]), k);
    expect(isCorrect(q, ['4x^2', '-4x', '+1'])).toBe(true);
    expect(isCorrect(q, ['2x^2', '-4x', '+1'])).toBe(false);
    expect(renderToString(<div>{q.prompt}</div>)).toContain('(2x - 1)^2');
    expect(q.tiles).toHaveLength(4);
    expect(text(q)).not.toMatch(rawKey);
  });

  it('the player rule of every identity gives the geometric reason; the square-difference rule never says « cut twice, added once »', () => {
    [['x+4', [3, 5], false], ['x-5', [9, 7], true], ['x+4|x-4', [7, 9], true]].forEach(([expr, xs, simp]) => {
      const q = QUESTIONS.rulePlayer(run(expr, xs, { simplify: simp }), k);
      const right = renderToString(<div>{q.options.find((o) => o.correct).text}</div>);
      expect(right, expr).toContain('المناطق نفسها');
      expect(text(q)).not.toMatch(rawKey);
      expect(CORNER_PHRASE.test(text(q)), expr).toBe(false);
    });
  });
});

describe('pitch-expansion square strings', () => {
  it('every new string resolves; predictions ≤ 8 Arabic words (math excluded)', () => {
    ['player.zeroChip', 'player.explanationIdentity', 'player.rule.sqSumRight', 'player.rule.sqDiffRight', 'player.rule.sumDiffRight', 'player.rule.sqDiffWhy2',
      'pred.claim', 'pred.twice', 'pred.noX', 'cp.strip.prompt', 'cp.cornerFill.prompt', 'cp.cancel.prompt', 'cp.identity.prompt', 'cp.identity.slot', 'cp.coef.prompt']
      .forEach((key) => { const v = k(key, { n: 1, claim: '$x$', prod: '$x$', v: '$1$', plus: '$x$', minus: '$x$', a: '$x$', b: '$1$', lhs: '$x$' }); expect(v, key).not.toMatch(rawKey); });
    ['pred.claim', 'pred.twice', 'pred.noX'].forEach((key) => {
      const words = k(key, { claim: '' }).replace(/\$[^$]*\$/g, '').split(/\s+/).filter((w) => /[؀-ۿ]/.test(w));
      expect(words.length, key).toBeLessThanOrEqual(8);
    });
    // the player's explanation of an identity says nothing of a corner added once
    expect(CORNER_PHRASE.test(k('player.explanationIdentity'))).toBe(false);
  });
});
