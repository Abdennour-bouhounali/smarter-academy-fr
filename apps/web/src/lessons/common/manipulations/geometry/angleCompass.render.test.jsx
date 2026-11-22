import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import AngleCompass, { CHAINS, QUESTIONS } from './AngleCompass';
import * as AL from '../logic/angleCompass';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

/**
 * angle-compass se rend aux deux niveaux de levels.js (sin 3/5 ; sin 2/5 puis tan 7/3), seul sans niveaux
 * (levels={false}, دوري الآن 2 : cos 3/4) et dans le workspace — sans clé i18n brute ni interpolation oubliée.
 */
const RAW = /manipulation\.[a-zA-Z]/;

describe('angle-compass — rendu', () => {
  it('beginner: the target, the set square to place, the glance block, the beach decoration', () => {
    const html = renderToString(<AngleCompass {...LEVELS['angle-compass'].beginner.numbers} theme="kite" />);
    expect(html).toContain('data-angle-compass');
    expect(html).toContain('data-step="square"');
    expect(html).toContain('data-ac-glance');
    expect(html).toContain('data-ac-target="sin:3/5"');
    expect(html).toContain('data-ac-square');
    expect(html).toContain('data-deco="kite"');
    expect(html).toContain('data-deco="gull"');
    expect(html).not.toContain('data-ac-leg=');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('advanced: two targets, the first one is sin 2/5 (1 of 2)', () => {
    const html = renderToString(<AngleCompass {...LEVELS['angle-compass'].advanced.numbers} level="advanced" theme="kite" />);
    expect(html).toContain('data-ac-target="sin:2/5"');
    expect(html).toContain('الزاوية 1 من 2');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('a single level (levels={false}) — دوري الآن 2, cos 3/4: no selector', () => {
    const html = renderToString(<AngleCompass targets={[{ ratio: 'cos', value: '3/4' }]} levels={false} />);
    expect(html).toContain('data-ac-target="cos:3/4"');
    expect(html).not.toContain('data-manipulation-levels-selector');
    expect(html).not.toMatch(RAW);
  });

  it('inside a workspace: both levels mounted, one selector', () => {
    const html = renderToString(
      <ManipulationWorkspace levels={{
        beginner: () => <AngleCompass level="beginner" targets={[{ ratio: 'sin', value: '3/5' }]} theme="kite" />,
        advanced: () => <AngleCompass level="advanced" targets={[{ ratio: 'sin', value: '2/5' }, { ratio: 'tan', value: '7/3' }]} theme="kite" />,
      }} />,
    );
    expect((html.match(/data-angle-compass/g) ?? []).length).toBe(2);
    expect((html.match(/data-manipulation-levels-selector/g) ?? []).length).toBe(1);
    expect(html).not.toMatch(RAW);
  });
});

describe('angle-compass — questions pendant le labo (LabCheckpoint)', () => {
  const k = (key, o) => i18n.t(`lesson:manipulation.angleCompass.${key}`, o);
  const RAWK = /manipulation\.[a-zA-Z]/;
  /** Construit au compas (base `leg`, longueur a, fil r), abaisse la mine, désigne le sommet. */
  const compass = (target, leg, a, r, vertex) => {
    let s = AL.init({ targets: [target] });
    s = AL.placeSquare(s); s = AL.setLeg(s, leg, a); s = AL.setOpening(s, r); s = AL.sweep(s);
    return AL.pick(s, vertex);
  };
  const ruler = (target, h, v, vertex) => {
    let s = AL.init({ targets: [target] });
    s = AL.placeSquare(s); s = AL.setLeg(s, 'h', h); s = AL.setLeg(s, 'v', v); s = AL.join(s);
    return AL.pick(s, vertex);
  };
  const check = (id, ctx, qid) => {
    const q = QUESTIONS[qid](ctx);
    if (q == null) return null;
    const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
    expect(out, `${id}.${qid}`).not.toMatch(RAWK);
    expect(out, `${id}.${qid}`).not.toContain('{{');
    expect(q.hints, `${id}.${qid}`).toHaveLength(2);
    if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${id}.${qid}`).toHaveLength(1);
    else expect(q.expected).toBeTruthy();
    return q;
  };

  it('sin 3/5 au compas (base 3, fil 5) : le côté du mur… den = 5, third = 4, ratio = cos 4/5', () => {
    const lab = compass({ ratio: 'sin', value: '3/5' }, 'v', 3, 5, 'h');
    const tr = AL.okTrialOf(lab);
    expect(tr).toBeTruthy();
    const ctx = { k, lab, mode: 'relation', tr, lastTr: tr };
    expect(QUESTIONS.den(ctx).expected).toBe('5');
    expect(QUESTIONS.third(ctx).expected).toBe('4');
    for (const qid of CHAINS.t) check('t', ctx, qid);
    const ratio = QUESTIONS.ratio(ctx);
    expect(ratio.options.findIndex((o) => o.correct)).toBeGreaterThanOrEqual(0);
  });

  it('tan 7/3 à la règle : den = côté adjacent ; third est sauté (aucun arc)', () => {
    const lab = ruler({ ratio: 'tan', value: '7/3' }, 3, 7, 'h');
    const tr = AL.okTrialOf(lab);
    expect(tr).toBeTruthy();
    const ctx = { k, lab, mode: 'construct', tr, lastTr: tr };
    expect(QUESTIONS.third(ctx)).toBeNull();
    expect(QUESTIONS.den(ctx).expected).toBe('3');
    for (const qid of ['den', 'ratio']) check('tan', ctx, qid);
  });

  it('la suite finale : angle lu à la rapporteur, cos² + sin² = 1, puis la règle (options et formule de l’élève)', () => {
    let lab = compass({ ratio: 'sin', value: '3/5' }, 'v', 3, 5, 'h');
    lab = AL.pick(lab, 'v');   // le contraste : l'autre sommet
    expect(AL.discoveryReady(lab)).toBe(true);
    const tr = AL.okTrialOf(lab);
    const lastTr = lab.trials[lab.trials.length - 1];
    const discoveryOptions = [{ text: 'a', correct: true }, { text: 'b' }, { text: 'c' }];
    const ctx = { k, lab, mode: 'relation', tr, lastTr, discoveryOptions, formal: <p>ok</p> };
    for (const qid of CHAINS.ruleRelation) check('rule', ctx, qid);
    expect(QUESTIONS.squares(ctx).expected).toBe('1');
    expect(QUESTIONS.degree(ctx).expected).toMatch(/^\d+$/);
  });

  it('retryTarget : la même cible reprend au départ, plus « atteinte »', () => {
    const lab = compass({ ratio: 'sin', value: '3/5' }, 'v', 3, 5, 'h');
    expect(lab.solved[0]).toBe(true);
    const again = AL.retryTarget(lab);
    expect(again.solved[0]).toBe(false);
    expect(again.square).toBe(false);
    expect(again.trials).toHaveLength(lab.trials.length);
  });
});

describe('angle-compass — mode guidé', () => {
  it('questions actives : ni la progression ni le bouton d’indice, mais les étapes (cible + règle)', () => {
    const out = renderToString(<AngleCompass {...LEVELS['angle-compass'].beginner.numbers} level="beginner" />);
    expect(out).not.toContain('data-manipulation-progress');
    expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(out).toContain('data-lab-stepper');
    expect(out).toContain('data-ac-step="1"');
    const adv = renderToString(<AngleCompass {...LEVELS['angle-compass'].advanced.numbers} level="advanced" />);
    expect(adv).toContain('data-ac-step="2"');
  });
});
