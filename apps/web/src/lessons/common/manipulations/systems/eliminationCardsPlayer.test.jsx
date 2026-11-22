import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import EliminationCards from './EliminationCards';
import { QUESTIONS } from './EliminationCardsPlayer';
import { InMissionPlayerContext } from '../../mission/missionPlayerContext';
import * as E from '../logic/eliminationCards';
import * as P from '../logic/eliminationCardsPlayer';
import { isCorrect } from '../primitives/labCheckpoint';

/**
 * Le lecteur de `elimination-cards` (rollout 2026-11-12, unité 5 leçon 2 ; verdict L2 + X7 + X11). Chaque question dit la MÊME vérité que la logique,
 * aucune clé brute ni `{{` à l'écran, les réponses changent de place ; la page (eliminationCards.render.test.jsx) reste inchangée — ici : ce que seul
 * le lecteur montre.
 */
const k = (key, o) => i18n.t(`lesson:manipulation.eliminationCards.${key}`, o);
const rawKey = /manipulation\.[a-zA-Z]|\{\{/;
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.slots}{q.tiles?.map((x) => (q.render ? q.render(x) : x))}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}</div>);
const inPlayer = (el) => renderToString(<InMissionPlayerContext.Provider value>{el}</InMissionPlayerContext.Provider>);

const ROUNDS = [['x+y=8|x-y=2', 'r1'], ['2x+y=11|3x-y=4', 'r2'], ['2x+3y=14|x-y=2', 'r3']];
/** Les étapes « one » et « done » de chaque chemin : chaque substitution possible, et des cartes posées (avec le plus petit multiplicateur). */
function roads(src) {
  const out = P.subPaths(src).map((p) => P.playSubstitution(src, p));
  for (const k2 of [1, 3, -1, 2, -2]) { const st = P.playStack(src, { 1: 1, 2: k2 }); if (st) { out.push(st); break; } }
  return out;
}

describe('elimination-cards in the mission player — rendering', () => {
  it('the player screen: live region, cards, drawer, coach anchors; no stepper, no kiosk decor, no raw key', () => {
    const html = inPlayer(<EliminationCards system="x+y=8|x-y=2" levels={false} chains="r1" />);
    expect(html).toContain('data-ec-verdict-live');
    expect(html).toContain('role="status"');
    expect(html).toContain('data-player=""');
    expect(html).toContain('data-coach="tray"');
    expect(html).toContain('data-coach="scale-1"');
    expect(html).not.toContain('data-ec-step');
    expect(html).not.toContain('data-deco');
    expect(html).not.toMatch(rawKey);
    // the page keeps its stepper and its kiosk decor
    const page = renderToString(<EliminationCards system="x+y=8|x-y=2" />);
    expect(page).toContain('data-ec-step');
    expect(page).toContain('data-deco');
    expect(page).not.toContain('data-ec-verdict-live');
  });
  it('the free round offers its systems as choices, the current one pressed', () => {
    const html = inPlayer(<EliminationCards system="x+y=11|x-y=3" levels={false} checkpoints={false} choices={['x+y=11|x-y=3', 'x+3y=10|x+y=4']} />);
    expect((html.match(/data-ec-choice="/g) ?? []).length).toBe(2);
    const pressed = [...html.matchAll(/<button[^>]*data-ec-choice="([^"]+)"[^>]*>/g)].filter((m) => m[0].includes('aria-pressed="true"')).map((m) => m[1]);
    expect(pressed).toEqual(['x+y=11|x-y=3']);
  });
});

describe('elimination-cards in the mission player — the questions', () => {
  ROUNDS.forEach(([src, chains]) => {
    it(`${src}: every question of every path renders without raw key, two hints, one right answer`, () => {
      roads(src).forEach((one) => {
        const done = P.finish(one);
        P.chainsOf(chains).forEach((spec) => {
          const lab = spec.qs.includes('build') ? one : done;
          if (!spec.reached(lab)) return;
          spec.qs.forEach((qid) => {
            const q = QUESTIONS[qid](lab, k);
            expect(text(q), `${src}.${qid}`).not.toMatch(rawKey);
            expect(q.hints, `${src}.${qid}`).toHaveLength(2);
            if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${src}.${qid}`).toHaveLength(1);
            if (q.kind === 'build') {
              expect(isCorrect(q, q.expected)).toBe(true);
              expect(isCorrect(q, [...q.expected].reverse())).toBe(true);
              const wrong = q.tiles.find((t) => !q.expected.includes(t));
              expect(wrong).toBeTruthy();
              expect(isCorrect(q, q.expected.map((x, i) => (x === P.buildSpec(lab).decoy || i === (P.buildSpec(lab).decoySide === 'left' ? 0 : 1) ? wrong : x)))).toBe(false);
            }
          });
        });
      });
    });
  });
  it('the rule and the choice questions, after both methods on the same cards', () => {
    ROUNDS.slice(1).forEach(([src, chains]) => {
      const a = P.finish(P.playSubstitution(src, P.plusPaths(src)[0]));
      const sc = [1, 3].map((k2) => ({ 1: 1, 2: k2 })).find((s) => P.playStack(src, s));
      let b = E.restart(a);
      b = E.stack(E.setScale(b, 2, sc[2]), 1, 2);
      const both = P.finish(b);
      expect(E.discoveryReady(both)).toBe(true);
      const spec = P.chainsOf(chains).find((sp) => sp.id === 'rule' || sp.id === 'choose');
      expect(spec.reached(both)).toBe(true);
      const q = QUESTIONS[spec.qs[0]](both, k);
      expect(text(q)).not.toMatch(rawKey);
      expect(q.options.filter((o) => o.correct)).toHaveLength(1);
    });
    // r3: the right option names the card where a coefficient is 1 (x in card 2)
    const html = text(QUESTIONS.choose(P.finish(P.playSubstitution('2x+3y=14|x-y=2', P.plusPaths('2x+3y=14|x-y=2')[0])), k));
    expect(html).toContain('(2)');
  });
  it('the right build tile does not always sit in the same place', () => {
    const pos = ROUNDS.flatMap(([src]) => roads(src).map((one) => { const q = QUESTIONS.build(one, k); return q.tiles.indexOf(q.expected[0]); }));
    expect(new Set(pos).size).toBeGreaterThan(1);
  });
});
