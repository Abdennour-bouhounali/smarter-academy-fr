import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import MidpointDistance from './MidpointDistance';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';
import * as L from '../logic/midpointDistance';

/**
 * midpoint-distance se rend aux deux niveaux de levels.js (le rendez-vous des Sablettes ; le نشاط 3 à Oran), seul et
 * dans le workspace, sans clé i18n brute, sans interpolation oubliée.
 */
const RAW = /manipulation\.[a-zA-Z]/;
const { beginner, advanced } = LEVELS['midpoint-distance'];

describe('midpoint-distance — rendu', () => {
  it('beginner: the map, the axes, the meeting pin, the four moves, the two chat proposals, the live components', () => {
    const html = renderToString(<MidpointDistance {...beginner.numbers} level="beginner" theme="gps-meet" />);
    expect(html).toContain('data-midpoint-distance');
    expect(html).toContain('data-stage="meet"');
    expect(html).toContain('data-city="alger"');
    expect(html).toContain('data-md-glance');
    expect(html).toContain('data-md-handle="M"');
    expect((html.match(/data-md-move=/g) ?? []).length).toBe(4);
    expect(html).toContain('data-md-commit');
    expect(html).toContain('data-md-proposal="sum"');
    expect(html).toContain('data-md-proposal="diff"');
    expect(html).toContain('data-md-axes');
    expect(html).toContain('data-md-shadows');
    expect(html).toContain('data-md-arrow="AM"');
    expect(html).toContain('data-deco="map"'); // la trottinette (bouton décor) n'apparaît qu'au-delà de 380 px
    expect(html).not.toContain('data-md-next');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('advanced (نشاط 3): K, L and J, no live reading before the pin is fixed, Oran', () => {
    const html = renderToString(<MidpointDistance {...advanced.numbers} level="advanced" theme="gps-meet" />);
    expect(html).toContain('data-city="oran"');
    expect(html).toContain('data-md-handle="M"');
    expect(html).not.toContain('data-md-shadows');
    expect(html).toContain('سارة');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('inside a workspace: both levels mounted, one selector', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <MidpointDistance level="beginner" numbers={beginner.numbers} />,
        advanced: () => <MidpointDistance level="advanced" numbers={advanced.numbers} />,
      }} />,
    );
    expect((html.match(/data-midpoint-distance/g) ?? []).length).toBe(2);
    expect(html).not.toMatch(RAW);
  });
});

const k = (key, o) => i18n.t(`lesson:manipulation.midpointDistance.${key}`, o);

describe('midpoint-distance — questions pendant le labo (LabCheckpoint)', () => {
  it('les deux étapes de chaque niveau : texte, deux indices, une seule bonne réponse, ni clé brute ni {{', async () => {
    const { chainOf, QUESTIONS } = await import('./MidpointDistance');
    for (const lv of [beginner, advanced]) {
      let s = L.init(lv.numbers);
      s = L.commitHeld(s, L.xy(s.meet.I));
      s = L.openDistance(s);
      s = L.commitHeld(s, L.xy(s.dist.cornerH));
      s = L.claim(s, 'root');
      expect(s.meet.solved && s.dist.solved).toBe(true);
      for (const step of ['meet', 'dist']) {
        const chain = chainOf(step);
        expect(chain.length).toBeGreaterThanOrEqual(2);
        for (const qid of chain) {
          const q = QUESTIONS[qid](s, step, k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${step}.${qid}`).not.toMatch(RAW);
          expect(out, `${step}.${qid}`).not.toContain('{{');
          expect(q.hints, `${step}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') {
            expect(q.options.filter((o) => o.correct), `${step}.${qid}`).toHaveLength(1);
            expect(q.options.filter((o) => !o.correct).every((o) => o.why), `${step}.${qid} why`).toBe(true);
          } else expect(q.expected, `${step}.${qid}`).toMatch(/^\d+$/);
        }
      }
    }
    // beginner : A(1 ; −1), B(4 ; 3) → jambes 3 et 4, somme des carrés 25
    const s = L.init(beginner.numbers);
    expect(QUESTIONS.legs(s, 'dist', k).expected).toBe('3');
    expect(QUESTIONS.distSq(s, 'dist', k).expected).toBe('25');
  });

  it('mode guidé : ni la progression ni le bouton d’indice, mais les étapes ; la même étape repart', () => {
    const html = renderToString(<MidpointDistance {...beginner.numbers} level="beginner" />);
    expect(html).not.toContain('data-manipulation-progress');
    expect(html).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(html).toContain('data-lab-stepper');
    let s = L.commitHeld(L.init(beginner.numbers), L.xy(L.init(beginner.numbers).meet.I));
    expect(s.meet.solved).toBe(true);
    s = L.retryStage(s, 'meet');
    expect(s.meet.solved).toBe(false);
    expect(L.xy(s.meet.M)).toEqual(L.xy(L.init(beginner.numbers).meet.M));
    expect(s.meet.trials).toHaveLength(1);
  });
});
