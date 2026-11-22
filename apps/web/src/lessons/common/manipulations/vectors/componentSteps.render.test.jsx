import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import ComponentSteps from './ComponentSteps';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';
import * as L from '../logic/componentSteps';

/**
 * component-steps se rend aux deux niveaux de levels.js (le quartier de la plateforme ; le نشاط 1), seul et dans le
 * workspace, sans clé i18n brute, sans interpolation oubliée et sans mot latin hors des noms de points.
 */
const RAW = /manipulation\.[a-zA-Z]/;
const LATIN_WORD = />[^<]*\b(?:Enter|send|rider|order|code|delivery|horn)\b[^<]*</i;

describe('component-steps — rendu', () => {
  it('beginner (le quartier) : la carte, le scooter, la croix, les compteurs en direct, cinq onglets, le décor', () => {
    const html = renderToString(<ComponentSteps {...LEVELS['component-steps'].beginner.numbers} theme="delivery" />);
    expect(html).toContain('data-component-steps');
    expect(html).toContain('data-kind="walk"');
    expect(html).toContain('data-cs-glance');
    expect(html).toContain('data-cs-rider');
    expect((html.match(/data-cs-tab="/g) ?? []).length).toBe(5);
    expect(html).toContain('data-cs-step="left"');
    expect(html).toContain('data-cs-column');
    expect(html).toContain('data-live="true"');
    expect((html.match(/data-cs-count="/g) ?? []).length).toBe(2);
    expect(html).toContain('data-cs-place="A"');
    expect(html).toContain('data-cs-place="B"');
    expect(html).toContain('data-cs-axes');
    expect(html).toContain('data-deco="city"');
    expect(html).toContain('data-deco="horn"');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
    expect(html).not.toMatch(LATIN_WORD);
  });

  it('advanced (نشاط 1) : A → B sans compteurs (« ؟ »), le point C du manuel n’est pas un lieu de commande', () => {
    const html = renderToString(<ComponentSteps {...LEVELS['component-steps'].advanced.numbers} theme="delivery" />);
    expect(html).toContain('data-kind="walkCode"');
    expect(html).toContain('data-live="false"');
    expect(html).toContain('؟');
    expect(html).toContain('data-cs-tab="AB"');
    expect(html).toContain('data-cs-tab="u"');
    expect(html).not.toContain('data-cs-place="D"'); // D hors figure tant que BD n'est pas livré
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('inside a workspace: both levels mounted, one selector', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <ComponentSteps level="beginner" {...LEVELS['component-steps'].beginner.numbers} />,
        advanced: () => <ComponentSteps level="advanced" {...LEVELS['component-steps'].advanced.numbers} />,
      }} />,
    );
    expect((html.match(/data-component-steps/g) ?? []).length).toBe(2);
    expect(html).not.toMatch(RAW);
  });
});

const k = (key, o) => i18n.t(`lesson:manipulation.componentSteps.${key}`, o);
const DRAW = {
  grid: [-4, 4, -2, 5], points: { R: [-3, -2], U: [-1, 2], S: [4, 1], V: [1, 3], W: [2, 4] }, live: true, story: 'draw',
  orders: [{ id: 'u', kind: 'pin', from: 'R', u: [2, 4], to: 'U' }, { id: 'v', kind: 'pin', from: 'S', u: [-3, 2], to: 'V' }, { id: 'uO', kind: 'pin', from: 'O', u: [2, 4], to: 'W' }],
};
/** Livre toutes les commandes (le bon geste de chaque sorte). */
const deliverAll = (lab) => {
  let s = lab;
  s.orders.forEach((o, i) => {
    s = L.goTo(s, i);
    if (o.kind === 'walk' || o.kind === 'walkCode') { s = L.walkTo(s, L.at(s, o.to)); if (o.kind === 'walkCode') { const u = L.expectedOf(s, o); s = L.setCode(L.setCode(s, 0, u[0]), 1, u[1]); s = L.sendCode(s); } }
    else if (o.kind === 'code') { const u = L.expectedOf(s, o); s = L.sendCode(L.setCode(L.setCode(s, 0, u[0]), 1, u[1])); }
    else s = L.dropPin(s, L.at(s, o.to));
  });
  return s;
};

describe('component-steps — questions pendant le labo (LabCheckpoint)', () => {
  it('chaque commande de chaque niveau (et du dessin) : texte, deux indices, une seule bonne réponse, ni clé brute ni {{', async () => {
    const { chainOf, QUESTIONS } = await import('./ComponentSteps');
    for (const nums of [LEVELS['component-steps'].beginner.numbers, LEVELS['component-steps'].advanced.numbers, DRAW]) {
      const lab = deliverAll(L.init(nums));
      expect(L.allDone(lab)).toBe(true);
      lab.orders.forEach((o, i) => {
        const chain = chainOf(lab, i);
        expect(chain.length, `${o.id}`).toBeGreaterThanOrEqual(2);
        if (i === lab.orders.length - 1) expect(chain.at(-1)).toBe('rule');
        for (const qid of chain) {
          const q = QUESTIONS[qid](lab, i, k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((x, j) => <span key={j}>{x.text}{x.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${o.id}.${qid}`).not.toMatch(RAW);
          expect(out, `${o.id}.${qid}`).not.toContain('{{');
          expect(q.hints, `${o.id}.${qid}`).toHaveLength(2);
          expect(q.options.filter((x) => x.correct), `${o.id}.${qid}`).toHaveLength(1);
          expect(q.options.filter((x) => !x.correct).every((x) => x.why), `${o.id}.${qid} why`).toBe(true);
        }
      });
    }
  });

  it('mode guidé : ni la progression ni le bouton d’indice, mais les étapes ; « أعِد التجربة » remet la commande au départ', () => {
    const html = renderToString(<ComponentSteps {...LEVELS['component-steps'].beginner.numbers} theme="delivery" />);
    expect(html).not.toContain('data-manipulation-progress');
    expect(html).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(html).toContain('data-lab-stepper');
    let lab = L.walkTo(L.init(LEVELS['component-steps'].beginner.numbers), L.at(L.init(LEVELS['component-steps'].beginner.numbers), 'B'));
    expect(L.orderDone(lab, 0)).toBe(true);
    lab = L.retryOrder(lab, 0);
    expect(L.orderDone(lab, 0)).toBe(false);
    expect(lab.trials.length).toBe(1);
  });
});
