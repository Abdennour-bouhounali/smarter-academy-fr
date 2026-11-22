import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import * as L from '../logic/orangePeel';
import OrangePeel from './OrangePeel';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

/**
 * orange-peel se rend aux deux niveaux de levels.js (مبتدئ R = 3 ; متقدم R = 5 puis l'exemple 1,4), seul et dans un workspace,
 * sans WebGL (rendu serveur : le repli SpaceFigure occupe la fenêtre 3D) — chaque commande HTML est là, aucune clé i18n
 * brute, aucune interpolation oubliée, aucun mot latin hors des îlots mathématiques, et la réponse nulle part avant le geste.
 */
const RAW = /manipulation\.[a-zA-Z]/;
const visibleText = (html) => html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');

describe('orange-peel — rendu', () => {
  it('advanced : la cuisine, l’orange au repli, la phase « peel », R = 5 — ni 4πR² ni « 4 أقراص » avant le geste', () => {
    const html = renderToString(<OrangePeel {...LEVELS['orange-peel'].advanced.numbers} level="advanced" />);
    expect(html).toContain('data-orange-peel');
    expect(html).toContain('data-world="boufarik-orange"');
    expect(html).toContain('data-phase="peel"');
    expect(html).toContain('data-op-glance');
    expect(html).toContain('data-stage3d');
    expect(html).toContain('data-stage3d-fallback');
    expect(html).toContain('data-space-figure');
    expect(html).toContain('data-deco="boufarik-orange"');
    for (const sel of ['data-op-r=', 'data-op-k-minus', 'data-op-k-plus', 'data-op-peel=', 'data-op-peel-all', 'data-op-verdict']) expect(html).toContain(sel);
    expect(html).toContain('data-op-rt="50"');
    expect(html).not.toContain('data-op-card');
    expect(html).not.toContain('data-op-to-pour');
    for (const leak of ['4\\pi R^2', '100\\pi', '\\frac{4}{3}', '2/3', 'data-op-formal']) expect(html).not.toContain(leak);
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('beginner : R = 3, deux disques prédits (faux), la marque et le verre pas encore là', () => {
    const html = renderToString(<OrangePeel level="beginner" {...LEVELS['orange-peel'].beginner.numbers} />);
    expect(html).toContain('data-op-rt="30"');
    expect(html).toContain('قرصان');
    expect(html).not.toContain('data-op-mark');
    expect(html).not.toContain('36\\pi');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
    // aucun mot latin hors des îlots (les noms R, cm et les formules sont dans des îlots ou en LTR isolé)
    const text = visibleText(html).replace(/R = \d+ cm/g, '');
    expect(text).not.toMatch(/\b(?:peel|pour|orange|undefined|NaN|true|false)\b/i);
  });

  it('numbers groupés (contrat de la leçon) et workspace : deux niveaux montés, deux scènes, des ids SVG distincts', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <OrangePeel level="beginner" theme="boufarik-orange" numbers={LEVELS['orange-peel'].beginner.numbers} />,
        advanced: () => <OrangePeel level="advanced" theme="boufarik-orange" numbers={LEVELS['orange-peel'].advanced.numbers} />,
      }} />,
    );
    expect((html.match(/data-orange-peel="true"/g) ?? []).length).toBe(2);
    expect((html.match(/data-stage3d="true"/g) ?? []).length).toBe(2);
    const ids = [...html.matchAll(/ id="(op[A-Za-z]+[^"]*)"/g)].map((m) => m[1]);
    expect(ids.length).toBe(6);
    expect(new Set(ids).size).toBe(6);
    expect(html).not.toMatch(RAW);
  });
});

const k = (key, o) => i18n.t(`lesson:manipulation.orangePeel.${key}`, o);
const checkQ = (qid, q) => {
  const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
  expect(out, qid).not.toMatch(RAW);
  expect(out, qid).not.toContain('{{');
  expect(q.hints, qid).toHaveLength(2);
  if (q.kind === 'choice') { expect(q.options.filter((o) => o.correct), qid).toHaveLength(1); q.options.filter((o) => !o.correct).forEach((o) => expect(o.why, qid).toBeTruthy()); } else expect(q.expected).toBeTruthy();
};

describe('orange-peel — questions pendant le labo (LabCheckpoint)', () => {
  it('la peau, le jus, le contraste puis la règle, l’exemple arrondi : des questions sur SON rayon', async () => {
    const { chainOf, QUESTIONS } = await import('./OrangePeel');
    let s = L.init({ ...LEVELS['orange-peel'].beginner.numbers, level: 'beginner' });   // R = 3
    expect(L.stepsOf(s).map((x) => x.id)).toEqual(['peel', 'pour', 'rule']);
    s = L.peelTo(L.setK(s, 2), 1);          // un refus : le contraste
    s = L.resetPeel(s);
    s = L.peelTo(L.setK(s, 4), 1);
    s = L.pickAreaCard(s, 'skin');
    expect(L.stepsOf(s).map((x) => x.reached)).toEqual([true, false, false]);
    for (const qid of chainOf('peel')) checkQ(qid, QUESTIONS[qid]({ lab: s }, k));
    expect(QUESTIONS.pDisc({ lab: s }, k).expected).toBe('9');
    expect(QUESTIONS.pSkin({ lab: s }, k).expected).toBe('36');
    s = L.openPour(s);
    s = L.pourTo(L.setMark(s, 4), 1);       // 4 douzièmes : trop bas, refusé
    s = L.resetPour(s);
    s = L.pourTo(L.setMark(s, 8), 1);
    s = L.pickVolumeCard(s, 'ball');
    expect(L.stepsOf(s).map((x) => x.reached)).toEqual([true, true, true]);
    expect(QUESTIONS.jCyl({ lab: s }, k).expected).toBe('54');
    for (const id of ['pour', 'rule']) for (const qid of chainOf(id).filter((q) => q !== 'rule')) checkQ(qid, QUESTIONS[qid]({ lab: s }, k));
    checkQ('rule', QUESTIONS.rule({ options: [{ text: 'a', correct: true }], formal: null }, k));
    const r = L.retryStep(s, 'pour');
    expect(L.stepsOf(r)[1].reached).toBe(false);
    expect(L.stepsOf(L.retryStep(s, 'rule'))[2].reached).toBe(false);
    for (const qid of chainOf('book')) checkQ(qid, QUESTIONS[qid]({ lab: s }, k));
  });
});

describe('orange-peel — mode guidé', () => {
  it('questions actives : ni la progression ni le bouton d’indice, un stepper ; coupées : ils reviennent', () => {
    const a = renderToString(<OrangePeel {...LEVELS['orange-peel'].beginner.numbers} level="beginner" />);
    expect(a).not.toContain('data-manipulation-progress');
    expect(a).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(a).toContain('data-op-step="0"');
    const b = renderToString(<OrangePeel {...LEVELS['orange-peel'].beginner.numbers} level="beginner" checkpoints={false} />);
    expect(b).toContain('data-manipulation-progress');
  });
});
