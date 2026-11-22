import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import PitchExpansion, { QUESTIONS, chainsOfPlayer } from './PitchExpansion';
import { InMissionPlayerContext, MissionAreaContext } from '../../mission/missionPlayerContext';
import * as L from '../logic/pitchExpansion';
import { isCorrect } from '../primitives/labCheckpoint';

/**
 * Le lecteur de mission de `pitch-expansion` pour le ممرّ AUTOUR D'UNE نافورة — la synthèse de l'unité 3 `wadiya-idmajiya-harfi` (2026-11-12).
 * Ajouté à côté des tests des leçons 1 et 2 (inchangés) : les suites 'ring' / 'ringTerms' (et leurs entraînements) ne valent que pour un terrain
 * « x+a+x » ; chaque construction dit la vérité de la logique ; aucune clé brute ni `{{` ; la page reste celle d'aujourd'hui.
 */
const t = (key, o) => i18n.t(`lesson:${key}`, o);
const k = (key, o) => t(`manipulation.pitchExpansion.${key}`, o);
const rawKey = /manipulation\.[a-zA-Z]|\{\{/;
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.wrap}{q.slots}{q.tiles?.map((x) => <span key={x}>{q.render ? q.render(x) : x}</span>)}</div>);
const inPlayer = (el) => renderToString(<InMissionPlayerContext.Provider value><MissionAreaContext.Provider value={{ width: 1280, height: 640 }}>{el}</MissionAreaContext.Provider></InMissionPlayerContext.Provider>);
const run = (expr, xs, { simplify = true } = {}) => {
  let s = L.init({ expr, simplify });
  s.cells.forEach((c) => { s = L.collect(s, c.id); });
  if (simplify) {
    [0, 1, 2].forEach((p) => {
      let like = s.tray.filter((c) => c.term.p === p);
      while (like.length > 1) { s = L.merge(s, like[0].id, like[1].id); like = s.tray.filter((c) => c.term.p === p); }
    });
  }
  xs.forEach((x) => { s = L.verify(s, x); });
  return s;
};

describe('pitch-expansion — the path around a fountain (unit-3 synthesis)', () => {
  it('ringOf reads « x+a+x » squared only', () => {
    expect(L.ringOf(L.init({ expr: 'x+7+x' }))).toBe(7);
    expect(L.ringOf(L.init({ expr: 'x+10+x' }))).toBe(10);
    ['x+3', '3|x+5', 'x+10+x|x', '2x+7'].forEach((e) => expect(L.ringOf(L.init({ expr: e })), e).toBeNull());
  });

  it('the chains: the measure at discovery (areas), the build at discovery (terms); their practice versions at the first right x', () => {
    expect(chainsOfPlayer('ring').map((c) => [c.id, c.qs])).toEqual([['ring', ['ringBuild']]]);
    expect(chainsOfPlayer('ringTerms').map((c) => [c.id, c.qs])).toEqual([['ringExpr', ['ringExpr']]]);
    const one = run('x+7+x', [2], { simplify: false });
    expect(chainsOfPlayer('ring')[0].reached(one)).toBe(false);
    expect(chainsOfPlayer('ringEasy')[0].reached(one)).toBe(true);
    expect(chainsOfPlayer('ring')[0].reached(run('x+7+x', [2, 3], { simplify: false }))).toBe(true);
  });

  it('ringBuild: « outer − fountain = 4 × strip + 4 × corner » at the student\'s first x, five distinct tiles, the expected answer is correct', () => {
    const s = run('x+7+x', [3, 2], { simplify: false });
    const q = QUESTIONS.ringBuild(s, k);
    expect(q.kind).toBe('build');
    expect(q.expected).toEqual(['121', '49', '14', '4']);
    expect(new Set(q.tiles).size).toBe(5);
    expect(q.tiles).toContain('7');
    expect(isCorrect(q, q.expected)).toBe(true);
    expect(isCorrect(q, ['121', '7', '14', '4'])).toBe(false);
    const html = text(q);
    expect(html).not.toMatch(rawKey);
    expect(html).toContain('72');
    // the x the field SHOWS: the last check (2 then 3 → the question speaks of x = 3, never of the x before)
    const later = QUESTIONS.ringBuild(run('x+7+x', [2, 3], { simplify: false }), k);
    expect(later.expected).toEqual(['169', '49', '21', '9']);
  });

  it('ringExpr: « (2x + 7)² − 7² = 4x² + 28x », decoys +49 and +14x, the expected answer is correct', () => {
    const s = run('x+7+x', [2, 4]);
    const q = QUESTIONS.ringExpr(s, k);
    expect(q.expected).toEqual(['4x^2', '+28x']);
    expect([...q.tiles].sort()).toEqual(['+14x', '+28x', '+49', '4x^2']);
    expect(isCorrect(q, q.expected)).toBe(true);
    expect(isCorrect(q, ['4x^2', '+14x'])).toBe(false);
    expect(text(q)).not.toMatch(rawKey);
  });

  it('shownValues lists the build tiles and the path area for a ring round, nothing more for the other modes', () => {
    const shown = L.shownValues({ expr: 'x+7+x', span: 3, labels: 'area', chains: 'ring' });
    expect(shown.filter((x) => x.role === 'ring').map((x) => x.v)).toEqual(['32', '72', '120', '176']);
    expect(shown.some((x) => x.role === 'tile' && x.v === '7')).toBe(true);
    const terms = L.shownValues({ expr: 'x+7+x', span: 3, labels: 'terms', chains: 'ringTerms' });
    expect(terms.some((x) => x.role === 'expansion' && x.v === '4x^2+28x')).toBe(true);
    const plain = L.shownValues({ expr: 'x+7+x', span: 3, labels: 'terms', chains: 'none' });
    expect(plain.some((x) => x.role === 'ring' || x.role === 'tile')).toBe(false);
  });

  it('renders in the player (areas, x = 2) and the page keeps its own field', () => {
    const html = inPlayer(<PitchExpansion expr="x+7+x" span={3} labels="area" start={2} levels={false} chains="ring" />);
    expect(html).toContain('data-zone-area="49"');
    expect(html).not.toMatch(rawKey);
    const page = renderToString(<PitchExpansion expr="x+7+x" levels={false} />);
    expect(page).not.toContain('data-pe-verdict-live');
  });
});
