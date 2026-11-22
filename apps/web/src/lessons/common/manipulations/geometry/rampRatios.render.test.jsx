import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import MANIPULATION_AR from '../../../../i18n/locales/ar/lesson.manipulation.json';
import SRC from './RampRatios.jsx?raw';
import RampRatios, { QUESTIONS, CHAINS } from './RampRatios';
import * as L from '../logic/rampRatios';
import i18n from '../../../../i18n';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

/**
 * ramp-ratios se rend aux deux niveaux de levels.js (la rampe à nommer ; les rampes du نشاط 2), seul et dans le
 * workspace, sans clé i18n brute ni interpolation oubliée, et toutes les clés que le composant lit existent.
 */
const RAW = /manipulation\.[a-zA-Z]/;

describe('ramp-ratios — rendu', () => {
  it('beginner (name): the scene, the three vertices, the rise handle, the reading, the decor', () => {
    const html = renderToString(<RampRatios {...LEVELS['ramp-ratios'].beginner.numbers} />);
    expect(html).toContain('data-ramp-ratios');
    expect(html).toContain('data-mode="name"');
    expect(html).toContain('data-stage="pick"');
    expect(html).toContain('data-rr-glance');
    for (const v of ['A', 'B', 'C']) expect(html).toContain(`data-rr-vertex="${v}"`);
    expect(html).toContain('data-rr-handle="rise"');
    expect(html).toContain('role="slider"');
    expect(html).toContain('data-rr-reading');
    expect(html).toContain('data-deco="skatepark"');
    expect(html).toContain('data-rr-ghost');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('advanced (نشاط 2): 40°, the board and angle handles, record, the marks 4, 6, 8', () => {
    const html = renderToString(<RampRatios {...LEVELS['ramp-ratios'].advanced.numbers} />);
    expect(html).toContain('data-mode="scale"');
    expect(html).toContain('data-b="40"');
    expect(html).toContain('data-rr-handle="len"');
    expect(html).toContain('data-rr-handle="angle"');
    expect(html).toContain('data-rr-record');
    for (const mk of ['4', '6', '8']) expect(html).toContain(`>${mk}</text>`);
    expect(html).toContain('data-rr-need');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('inside a workspace: both levels mounted, one selector', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <RampRatios level="beginner" {...LEVELS['ramp-ratios'].beginner.numbers} />,
        advanced: () => <RampRatios level="advanced" {...LEVELS['ramp-ratios'].advanced.numbers} />,
      }} />,
    );
    expect((html.match(/data-ramp-ratios="/g) ?? []).length).toBe(2);
    expect(html).not.toMatch(RAW);
  });

  it('every key the component reads exists in Arabic, no Latin word outside point names and maths', () => {
    const src = SRC;
    const keys = new Set();
    for (const mm of src.matchAll(/\bk\(\s*'([A-Za-z0-9_]+)'/g)) keys.add(mm[1]);
    for (const mm of src.matchAll(/k\(`([a-zA-Z]+)_\$\{/g)) keys.add(`${mm[1]}_`);
    const ns = MANIPULATION_AR.rampRatios;
    for (const key of keys) {
      if (key.endsWith('_')) expect(Object.keys(ns).some((x) => x.startsWith(key)), key).toBe(true);
      else expect(ns[key], key).toBeTruthy();
    }
    const flat = (o, pre = '') => Object.entries(o).flatMap(([kx, vx]) => (typeof vx === 'object' ? flat(vx, `${pre}${kx}.`) : [[`${pre}${kx}`, vx]]));
    for (const [key, v] of flat(ns)) {
      const plain = v.replace(/\$[^$]*\$/g, '').replace(/\{\{[a-z0-9]+\}\}/gi, '').replace(/\[[A-C]{2}\]/g, '');
      expect(/[a-z]{2,}/i.test(plain.replace(/\b[A-C]{1,3}\b/g, '')), `${key}: ${v}`).toBe(false);
    }
  });
});

/* ── questions pendant le labo (LabCheckpoint) ── */
const kk = (key, o) => i18n.t(`lesson:manipulation.rampRatios.${key}`, o);
const RAWK = /manipulation\.[a-zA-Z]/;

function nameLab(at = 'B') {
  let s = L.pick(L.init({ angle: 30, hyp: 4, mode: 'name' }), at);
  for (const side of L.SIDES) s = L.name(s, L.roleOfSide(at)[side], side);
  for (const kind of L.KINDS) for (const sl of L.SLOTS) s = L.fill(s, kind, sl, L.wantedSide(at, kind, sl));
  return s;
}
function exploredLab(at = 'B') {
  let s = nameLab(at);
  for (const b of [10, 30, 55]) s = L.commitB(s, b);
  return s;
}
function scaleLab() {
  let s = L.init({ angle: 40, hyps: [4, 6, 8], mode: 'scale' });
  for (const i of [8, 12, 16]) { s = L.record(L.setLen(s, i)); if (s.pending) s = L.claim(s, 'same'); }
  s = L.record(L.setAngle(s, 55)); if (s.pending) s = L.claim(s, 'changed');
  return s;
}

describe('ramp-ratios — questions pendant le labo', () => {
  const check = (lab, ids, where) => {
    for (const qid of ids) {
      const q = QUESTIONS[qid](lab, kk);
      const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
      expect(out, `${where}.${qid}`).not.toMatch(RAWK);
      expect(out, `${where}.${qid}`).not.toContain('{{');
      expect(q.hints, `${where}.${qid}`).toHaveLength(2);
      if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${where}.${qid}`).toHaveLength(1);
      else expect(q.expected, `${where}.${qid}`).toBeTruthy();
    }
  };
  for (const at of ['B', 'C']) {
    it(`name, angle ${at} : names · compose · rule`, () => {
      expect(L.namesDone(nameLab(at))).toBe(true);
      check(nameLab(at), CHAINS.names, `names.${at}`);
      check(nameLab(at), CHAINS.compose, `compose.${at}`);
      expect(L.discoveryReady(exploredLab(at))).toBe(true);
      check(exploredLab(at), CHAINS.rule, `rule.${at}`);
    });
  }
  it('scale : sizes · turn', () => {
    const lab = scaleLab();
    expect(L.discoveryReady(lab)).toBe(true);
    check(lab, CHAINS.sizes, 'sizes');
    check(lab, CHAINS.turn, 'turn');
  });
  it('les nombres viennent de la scène du labo ; refaire une étape efface son drapeau', () => {
    const lab = nameLab('B');
    expect(QUESTIONS.hyp(lab, kk).options.find((o) => o.correct).text.props.children.join('')).toContain('BC');
    expect(Number(QUESTIONS.read(lab, kk).expected)).toBeCloseTo(Number(String(L.fmt(L.value(lab, 'sin'))).replace(',', '.')), 5);
    expect(L.namesDone(L.retryNames(lab))).toBe(false);
    expect(L.composeDone(L.retryCompose(lab))).toBe(false);
    expect(L.namesDone(L.retryCompose(lab))).toBe(true);
    const sc = scaleLab();
    expect(L.progress(L.retrySizes(sc)).sizes).toBe(0);
    expect(L.progress(L.retryTurn(sc)).turned).toBe(false);
  });
});

describe('ramp-ratios — mode guidé', () => {
  it('avec questions : ni la progression ni le bouton d’indice, les étapes se voient ; checkpoints={false} : les deux reviennent', () => {
    const g = renderToString(<RampRatios {...LEVELS['ramp-ratios'].beginner.numbers} level="beginner" />);
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(g).toContain('data-rr-step');
    const off = renderToString(<RampRatios {...LEVELS['ramp-ratios'].beginner.numbers} level="beginner" checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
