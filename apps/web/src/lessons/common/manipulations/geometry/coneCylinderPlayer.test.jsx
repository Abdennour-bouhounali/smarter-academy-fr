import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import strings from '../../../../i18n/locales/ar/lesson.manipulation.json';
import ConeCylinder, { discoveryOptionsOf } from './ConeCylinder';
import { QUESTIONS, chainsOf, fracNode } from './ConeCylinderPlayer';
import { InMissionPlayerContext } from '../../mission/missionPlayerContext';
import * as L from '../logic/coneCylinder';
import { isCorrect } from '../primitives/labCheckpoint';

/**
 * `cone-cylinder` dans le lecteur de mission (la synthèse de l'unité 9, 2026-11-10 ; conseil C). Le lecteur juge à l'APPUI, n'écrit aucun nombre
 * dans un verdict, aucun volume, aucune lettre de point ; chaque question dit la MÊME vérité que la logique ; hors lecteur le labo est inchangé.
 */
const t = (key, o) => i18n.t(`lesson:${key}`, o);
const k = (key, o) => t(`manipulation.coneCylinderPlayer.${key}`, o);
const rawKey = /manipulation\.[a-zA-Z]|\{\{/;
const inPlayer = (el) => renderToString(<InMissionPlayerContext.Provider value>{el}</InMissionPlayerContext.Provider>);
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.fields?.map((f, i) => <span key={i}>{f.label}{f.options.map((o) => f.render(o))}</span>)}{q.slots}{q.tiles}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}</div>);
const at = (lab, h, r) => L.press(L.moveTo(lab, { hIdx: h, rIdx: r }));

describe('cone-cylinder in the mission player — rendering', () => {
  it('the player lab: a press button, both handles, a sr-only description, an always-mounted live region — no volume, no point letter', () => {
    const html = inPlayer(<ConeCylinder H={25} R={15} n={5} levels={false} chains="sec" />);
    expect(html).toContain('data-cone-cylinder-player');
    expect(html).toContain('data-cc-press');
    expect(html).toContain(k('press'));
    expect(html).toContain('data-cc-h-handle="3"');
    expect(html).toContain('data-cc-r-handle="1"');
    expect(html).toContain('data-cc-scene-sr');
    expect(html).toMatch(/role="status"[^>]*data-cc-verdict-live|data-cc-verdict-live[^>]*role="status"/);
    expect(html).not.toContain('data-cc-volume');
    expect(html).not.toMatch(/\\pi|cm\^3|>O</);
    expect(html).not.toMatch(/<button[^>]*data-cc-press[^>]* disabled=""/);
    expect(html).not.toContain('data-lab-stepper');
    expect(html).not.toMatch(rawKey);
  });

  it('a locked h shows a lock, no ± for h, and the handle is aria-disabled (never `disabled`)', () => {
    const html = inPlayer(<ConeCylinder H={25} R={10} n={5} lockH={15} levels={false} />);
    expect(html).toContain('data-cc-lock="h"');
    expect(html).not.toContain('data-cc-h-less');
    expect(html).toMatch(/data-cc-h-handle="3"[^>]*aria-disabled="true"|aria-disabled="true"[^>]*data-cc-h-handle="3"/);
    expect(html).toContain('data-cc-r-less');
  });

  it('the free round offers the three cones', () => {
    const cones = [{ H: 25, R: 15, n: 5 }, { H: 25, R: 10, n: 5 }, { H: 21, R: 14, n: 7 }];
    const html = inPlayer(<ConeCylinder H={25} R={15} n={5} levels={false} choices={{ cones }} />);
    cones.forEach((c) => expect(html).toContain(`data-cc-cone-choice="${c.H}/${c.R}"`));
    expect(html).toMatch(/aria-pressed="true"[^>]*data-cc-cone-choice="25\/15"|data-cc-cone-choice="25\/15"[^>]*aria-pressed="true"/);
  });

  it('outside the player the page lab is unchanged (its volume line, its stepper)', () => {
    const html = renderToString(<ConeCylinder H={18} R={6} />);
    expect(html).toContain('data-cone-cylinder');
    expect(html).not.toContain('data-cone-cylinder-player');
    expect(html).toContain('data-cc-volume');
  });
});

describe('cone-cylinder in the mission player — the questions tell the truth of the logic', () => {
  it('sec: the two ratios of the first cylinder that touches, as numbers; the decoy h/H; positions move with the cylinder', () => {
    const seen = new Set();
    [[1, 4], [2, 3], [3, 2], [4, 1]].forEach(([h, r]) => {
      const lab = at(L.initPlayer({ H: 25, R: 15, n: 5 }), h, r);
      const q = QUESTIONS.sec(lab, k);
      const tr = L.firstInscribed(lab);
      expect(q.fields[0].expected).toBe(`${L.dec(tr.r)}/15`);
      expect(q.fields[1].expected).toBe(`${25 - Number(L.dec(tr.h))}/25`);
      expect(isCorrect(q, q.fields.map((f) => f.expected))).toBe(true);
      expect(isCorrect(q, [q.fields[1].expected, q.fields[0].expected])).toBe(false);
      seen.add(q.fields[0].options.indexOf(q.fields[0].expected));
      expect(text(q)).not.toMatch(rawKey);
    });
    expect(seen.size).toBeGreaterThan(1);
  });

  it('r2: BUILD 2/10 = 5/25 (the decoy 20), then the rule in words, refuted by the student\'s own sums', () => {
    let lab = L.initPlayer({ H: 25, R: 10, n: 5 });
    lab = at(at(at(lab, 1, 4), 2, 3), 4, 1);
    const [chain] = chainsOf('r2', { buildIdx: 4 });
    expect(chain.reached(lab)).toBe(true);
    const b = QUESTIONS.build(lab, k, { buildIdx: 4 });
    expect(b.expected).toEqual(['2', '10', '5', '25']);
    expect(b.tiles).toEqual(expect.arrayContaining(['5', '25', '20']));
    expect(isCorrect(b, ['2', '10', '5', '25'])).toBe(true);
    expect(isCorrect(b, ['2', '10', '20', '25'])).toBe(false);
    const r = QUESTIONS.rule(lab, k, { buildIdx: 4 });
    const html = text(r);
    ['13', '16', '22'].forEach((s) => expect(html).toContain(s));              // (5 ; 8), (10 ; 6), (20 ; 2)
    expect(html).not.toMatch(rawKey);
    expect(r.options.filter((o) => o.correct)).toHaveLength(1);
  });

  it('chains: sec at the first cylinder that touches; r2 only at the build cylinder; none otherwise', () => {
    const lab = at(L.initPlayer({ H: 25, R: 15, n: 5 }), 2, 2);              // a gap
    expect(chainsOf('sec')[0].reached(lab)).toBe(false);
    expect(chainsOf('sec')[0].reached(at(lab, 2, 3))).toBe(true);
    expect(chainsOf('r2', { buildIdx: null })).toEqual([]);
    expect(chainsOf('none')).toEqual([]);
  });

  it('fracNode writes a real fraction bar', () => {
    expect(renderToString(fracNode('9/15'))).toContain('katex');
  });
});

describe('cone-cylinder — strings and the page bug fixed', () => {
  it('no verdict holds a number or a ✓ / ✗; no PredictTray prompt holds `$`; every key resolves', () => {
    Object.values(strings.coneCylinderPlayer.v).forEach((s) => expect(s).not.toMatch(/\d/));
    expect(JSON.stringify(strings.coneCylinderPlayer)).not.toMatch(/[✓✗]/);
    ['part', 'double'].forEach((key) => expect(strings.coneCylinderPlayer.predict[key].prompt).not.toContain('$'));
    ['press', 'waiting', 'journal', 'journalUnit', 'col.n', 'col.verdict', 'coach.h', 'coach.r', 'coach.press', 'word.inscribed', 'word.gap', 'word.pierce',
      'v.inscribed', 'v.gap', 'v.pierce', 'v.repeat', 'hint1', 'hint2', 'explanation', 'part.5', 'part.7', 'lockedSr', 'choicesCones']
      .forEach((key) => expect(k(key), key).not.toMatch(rawKey));
    expect(k('predict.part.prompt', { h: '5', part: k('part.5') })).toContain('خُمس');
    ['part', 'double'].forEach((key) => L.predictOptionsPlayer(key).forEach((says) => expect(k(`predict.${key}.${says}`), says).not.toMatch(rawKey)));
  });

  it('the page discovery no longer says two equal products differ (6 × 4 = 12 × 2 on the 18 / 6 cone)', () => {
    let lab = L.init({ H: 18, R: 6 });                       // 24 notches: h by 0,75, r by 0,25
    lab = L.setR(L.setH(lab, 8), 16);                        // (6 ; 4) touches
    lab = L.setR(L.setH(L.setR(lab, 4), 16), 8);             // (12 ; 2) touches
    expect(L.inscribedTrials(lab).map((x) => [L.dec(x.h), L.dec(x.r)])).toEqual([['6', '4'], ['12', '2']]);
    const kk = (key, o) => t(`manipulation.coneCylinder.${key}`, o);
    const prodWhy = renderToString(<span>{discoveryOptionsOf(lab, kk)[2].why}</span>);
    expect(prodWhy).toContain('صدفة');                      // equal products: never « مختلفان »
    expect(prodWhy).not.toContain('مختلفان');
    lab = L.setR(L.setH(L.setR(lab, 4), 4), 20);            // (3 ; 5): a third cylinder, product 15
    expect(renderToString(<span>{discoveryOptionsOf(lab, kk)[2].why}</span>)).toContain('مختلفان');
  });
});
