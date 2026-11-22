import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import * as L from '../logic/scaleBlocks';
import ScaleBlocks from './ScaleBlocks';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

/**
 * scale-blocks se rend à ses DEUX niveaux (le cube d'arête 1, le pavé du نشاط 6), seul et dans un workspace, à plat ou par
 * `numbers`, sans clé i18n brute ni interpolation oubliée, avec TOUTES ses commandes HTML (le rendu serveur n'a pas de WebGL :
 * la scène est remplacée par son repli SpaceFigure) — et SANS la réponse sur le premier écran : ni 8 ni 27 cubes, ni 12,96,
 * ni 33,84, ni 480 ; la lecture écrit « ؟ » pour l'aire et le volume du solide image tant qu'il n'est pas bâti.
 */
const RAW = /manipulation\.[a-zA-Z]/;
const clean = (html) => {
  expect(html).not.toMatch(RAW);
  expect(html).not.toContain('{{');
  expect(html).not.toContain('undefined');
  expect(html).not.toContain('NaN');
  expect(html).not.toContain('[object Object]');
};

describe('scale-blocks — rendu', () => {
  it('beginner (the cube of edge 1): k = 1, the slider and its − / +, no « + 1 cm » for a cube, no 8 nor 27 yet', () => {
    const html = renderToString(<ScaleBlocks {...LEVELS['scale-blocks'].beginner.numbers} />);
    expect(html).toContain('data-scale-blocks');
    expect(html).toContain('data-world="voxel-blocks"');
    expect(html).toContain('data-sb-glance');
    expect(html).toContain('data-stage3d');
    expect(html).toContain('data-stage3d-fallback');
    expect(html).toContain('data-space-figure');
    expect(html).toContain('data-sb-k="1"');
    expect(html).toContain('role="slider"');
    expect(html).toContain('data-sb-less');
    expect(html).toContain('data-sb-more');
    // à k = 1 il n'y a rien à prédire ni à bâtir : « ابنِ » et les trois volumes n'apparaissent qu'avec un autre rapport
    expect(html).not.toContain('data-sb-build');
    expect(html).toContain('data-sb-verdict="start"');
    expect(html).toContain('data-sb-readings');
    // le rendu serveur se mesure à 320 px (« étroit ») : le compteur flottant y cède sa place à la ligne « الحجم »
    expect(html).toContain('data-sb-row="volume"');
    expect(html).toContain('data-deco="voxel-blocks"');
    expect(html).not.toContain('data-sb-plus');
    expect(html).not.toContain('data-sb-option');
    expect(html).not.toContain('data-sb-trials');
    expect(html).not.toMatch(/>8</);
    expect(html).not.toMatch(/>27</);
    clean(html);
  });

  it('advanced (نشاط 6): the 5 × 4 × 3 cuboid, the « + 1 cm » contrast button, and no 12,96 / 33,84 / 480 on the first screen', () => {
    const html = renderToString(<ScaleBlocks numbers={LEVELS['scale-blocks'].advanced.numbers} />);
    expect(html).toContain('data-sb-plus');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain('data-sb-ratio="volume"');
    // les lectures du départ sont là (60, 94), pas celles du solide image
    expect(html).toContain('60');
    expect(html).toContain('94');
    expect(html).not.toContain('12{,}96');
    expect(html).not.toContain('12,96');
    expect(html).not.toContain('33{,}84');
    expect(html).not.toContain('480');
    expect(html).toContain('؟');
    clean(html);
  });

  it('inside a workspace: both levels mounted, the textbook activity by default, two separate 3D windows', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <ScaleBlocks level="beginner" {...LEVELS['scale-blocks'].beginner.numbers} />,
        advanced: () => <ScaleBlocks level="advanced" {...LEVELS['scale-blocks'].advanced.numbers} />,
      }} />,
    );
    expect((html.match(/data-scale-blocks/g) ?? []).length).toBe(2);
    expect((html.match(/data-stage3d="true"/g) ?? []).length).toBe(2);
    clean(html);
  });
});

const k = (key, o) => i18n.t(`lesson:manipulation.scaleBlocks.${key}`, o);
const checkQ = (qid, q) => {
  const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
  expect(out, qid).not.toMatch(/manipulation\.[a-zA-Z]/);
  expect(out, qid).not.toContain('{{');
  expect(q.hints, qid).toHaveLength(2);
  if (q.kind === 'choice') { expect(q.options.filter((o) => o.correct), qid).toHaveLength(1); q.options.filter((o) => !o.correct).forEach((o) => expect(o.why, qid).toBeTruthy()); } else expect(q.expected).toBeTruthy();
};
const buildK = (lab, kk, id) => L.build(L.predict(L.setK(lab, kk), id));

describe('scale-blocks — questions pendant le labo (LabCheckpoint)', () => {
  it('cube : chaque rapport bâti ouvre sa suite (arête · aire, puis volume · règle) avec SES nombres', async () => {
    const { chainOf, QUESTIONS } = await import('./ScaleBlocks');
    let s = L.init(LEVELS['scale-blocks'].beginner.numbers);   // k = 2 puis 3, arête 1
    expect(L.stepsOf(s).map((x) => x.id)).toEqual(['k0', 'k1']);
    s = buildK(s, 2, 'k3');
    let st = L.stepsOf(s);
    expect(st.map((x) => x.reached)).toEqual([true, false]);
    expect(chainOf('k0', 0, 2, 'k1')).toEqual(['edge', 'area']);
    for (const qid of ['edge', 'area']) checkQ(qid, QUESTIONS[qid]({ lab: s, step: st[0] }, k));
    expect(QUESTIONS.edge({ lab: s, step: st[0] }, k).expected).toBe('2');
    expect(QUESTIONS.area({ lab: s, step: st[0] }, k).expected).toBe('24');
    s = buildK(s, 3, 'k');   // une prédiction fausse compte aussi comme un bâti prédit
    st = L.stepsOf(s);
    expect(st.map((x) => x.reached)).toEqual([true, true]);
    expect(chainOf('k1', 1, 2, 'k1')).toEqual(['vol', 'rule']);
    expect(QUESTIONS.vol({ lab: s, step: st[1] }, k).expected).toBe('27');
    checkQ('vol', QUESTIONS.vol({ lab: s, step: st[1] }, k));
    checkQ('rule', QUESTIONS.rule({ options: [{ text: 'a', correct: true }], formal: null }, k));
    const r = L.retryStep(s, 'k1');
    expect(L.stepsOf(r).map((x) => x.reached)).toEqual([true, false]);
  });

  it('pavé 5 × 4 × 3 : 3/5 puis 2, puis le cadre « + 1 cm » (la règle)', async () => {
    const { chainOf, QUESTIONS } = await import('./ScaleBlocks');
    let s = L.init(LEVELS['scale-blocks'].advanced.numbers);
    s = buildK(s, '3/5', 'k3');
    s = buildK(s, 2, 'k3');
    expect(L.stepsOf(s).map((x) => x.reached)).toEqual([true, true, false]);
    s = L.plusOne(s);
    const st = L.stepsOf(s);
    expect(st.map((x) => x.id)).toEqual(['k0', 'k1', 'plus']);
    expect(st.map((x) => x.reached)).toEqual([true, true, true]);
    expect(QUESTIONS.area({ lab: s, step: st[0] }, k).expected).toBe('846/25');   // 33,84
    expect(QUESTIONS.vol({ lab: s, step: st[1] }, k).expected).toBe('480');
    expect(chainOf('plus', 2, 3, 'plus')).toEqual(['plusRatio', 'rule']);
    checkQ('edge', QUESTIONS.edge({ lab: s, step: st[0] }, k));
    checkQ('area', QUESTIONS.area({ lab: s, step: st[0] }, k));
    checkQ('vol2', QUESTIONS.vol({ lab: s, step: st[1] }, k));
    checkQ('plusRatio', QUESTIONS.plusRatio({ lab: s, step: st[2] }, k));
    expect(L.stepsOf(L.retryStep(s, 'plus'))[2].reached).toBe(false);
  });
});

describe('scale-blocks — mode guidé', () => {
  it('questions actives : ni la progression ni le bouton d’indice, un stepper ; coupées : ils reviennent', () => {
    const a = renderToString(<ScaleBlocks {...LEVELS['scale-blocks'].beginner.numbers} level="beginner" />);
    expect(a).not.toContain('data-manipulation-progress');
    expect(a).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(a).toContain('data-sb-step="0"');
    const b = renderToString(<ScaleBlocks {...LEVELS['scale-blocks'].beginner.numbers} level="beginner" checkpoints={false} />);
    expect(b).toContain('data-manipulation-progress');
  });
});
