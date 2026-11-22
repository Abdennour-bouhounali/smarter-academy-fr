import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import SquareFold from './SquareFold';
import SquareRootSide from './SquareRootSide';
import SquareTiling from './SquareTiling';

// L'ouverture n'est jamais vide : une valeur par défaut est posée (sans être un essai).
it('square-tiling s\'ouvre sur un k par défaut, sans pavage essayé', () => {
  const html = renderToString(<SquareTiling n={28} />);
  expect(html).toContain('data-tiling-k');
  expect(html).not.toContain('>?<');
  expect(html).not.toContain('data-tiled-k=');
  expect(html).not.toContain('data-tried-k=');
});
it('square-fold s\'ouvre sur un x par défaut qui n\'est solution d\'aucune carte', () => {
  const html = renderToString(<SquareFold a={9} />);
  expect(html).toContain('data-fold-x');
  expect(html).not.toContain('>?<');
  expect(html).not.toContain('data-fold-pin=');
});
it('square-root-side s\'ouvre sur le début de la règle, sans essai', () => {
  for (const mode of ['refine', 'graduation']) {
    const html = renderToString(<SquareRootSide mode={mode} num={36} den={1} />);
    expect(html).toContain('data-root-value');
    expect(html).not.toContain('>?<');
  }
});

/* ── L8 : les questions pendant le labo (primitives/LabCheckpoint) et le mode guidé ── */
import i18n from '../../../../i18n';
import * as T from '../logic/squareTiling';
import * as F from '../logic/squareFold';
import * as R from '../logic/squareRootSide';
import { CHAINS as TC, QUESTIONS as TQ, chainOf as tChain } from './SquareTiling';
import { CHAINS as FC, QUESTIONS as FQ, chainOf as fChain } from './SquareFold';
import { CHAINS as RC, QUESTIONS as RQ, chainOf as rChain } from './SquareRootSide';

const RAW = /manipulation\.[a-zA-Z]/;
const kT = (key, o) => i18n.t(`lesson:manipulation.squareTiling.${key}`, o);
const kF = (key, o) => i18n.t(`lesson:manipulation.squareFold.${key}`, o);
const kR = (key, o) => i18n.t(`lesson:manipulation.squareRoot.${key}`, o);

function check(q, label) {
  const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
  expect(out, label).not.toMatch(RAW);
  expect(out, label).not.toContain('{{');
  expect(out, label).not.toContain('undefined');
  expect(q.hints, label).toHaveLength(2);
  if (q.kind === 'choice') {
    expect(q.options.filter((o) => o.correct), label).toHaveLength(1);
    q.options.filter((o) => !o.correct).forEach((o) => expect(o.why, `${label} why`).toBeTruthy());
  } else expect(q.expected, label).toBeTruthy();
}

describe('square-tiling — questions pendant le labo', () => {
  it('product (28, 288) et simplest (32, 288) : chaque question a un texte, 2 indices, une seule bonne réponse', () => {
    for (const mode of ['product', 'simplest']) {
      for (const n of [28, 288, 32]) {
        let lab = T.init({ n, mode });
        for (const kv of T.validKs(lab)) lab = T.tile(lab, kv);
        lab = T.tile(lab, T.range(lab).max + 0 === T.range(lab).max && n % (T.range(lab).max ** 2) !== 0 ? T.range(lab).max : 3);
        const keys = [['tile', 0]].concat(mode === 'simplest' ? [['ruleS', 1]] : [['ruleP', 1]]);
        for (const [key] of keys) for (const q of tChain(key, lab)) {
          if (q === 'why' && !lab.tried.some((x) => !x.valid)) continue;
          check(TQ[q](lab, kT), `${mode}${n}.${key}.${q}`);
        }
      }
    }
    let lab = T.tile(T.tile(T.init({ n: 28, mode: 'product' }), 2), 3);
    expect(TQ.area(lab, kT).expected).toBe('7');
    expect(TQ.side(lab, kT).options.find((o) => o.correct)).toBeTruthy();
    expect(TQ.why(lab, kT).options.filter((o) => o.correct)).toHaveLength(1);
    expect(Object.keys(TC)).toEqual(['tile', 'ruleP', 'ruleS']);
  });
  it('mode guidé : ni la progression ni « إظهار التلميح »', () => {
    const html = renderToString(<SquareTiling n={28} />);
    expect(html).not.toContain('data-manipulation-progress');
    expect(html).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(html).toContain('data-lab-stepper');
    const off = renderToString(<SquareTiling n={28} checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
  });
});

describe('square-fold — questions pendant le labo', () => {
  it('+ · 0 · − : chaque question est complète, la dernière carte ajoute la règle', () => {
    let lab = F.init({ targets: [9, 0, -9], scale: 2 });
    const solve = (s, i) => {
      let t = F.setCard(s, i);
      const r = t.targets[i].r;
      if (r.num > 0) { const v = Math.round(Math.sqrt(r.num / r.den) * t.scale); t = F.pin(F.move(t, v)); t = F.pin(F.move(t, -v)); } else if (r.num === 0) t = F.pin(F.move(t, 0)); else t = F.declareNone(t);
      return t;
    };
    for (let i = 0; i < 3; i += 1) {
      lab = solve(lab, i);
      const chain = fChain({ ...lab, card: i });
      for (const q of chain) check(FQ[q]({ ...lab, card: i }, kF), `card${i}.${q}`);
    }
    expect(fChain({ ...lab, card: 2 })).toContain('rule');
    expect(fChain({ ...lab, card: 0 })).toContain('rule');
    expect(FQ.posSq(F.setCard(lab, 0), kF).expected).toBe('9');
    expect(Object.keys(FC)).toEqual(['pos', 'zero', 'neg']);
    // 25 · 3 · 0,04 · 0 · −9 : racine irrationnelle et décimale
    const lab2 = F.init({ targets: [25, 3, 0.04, 0, -9], scale: 10 });
    for (let i = 0; i < 5; i += 1) for (const q of FC[['pos', 'pos', 'pos', 'zero', 'neg'][i]]) check(FQ[q](F.setCard(lab2, i), kF), `l2.${i}.${q}`);
  });
  it('mode guidé : ni la progression ni « إظهار التلميح »', () => {
    const html = renderToString(<SquareFold a={9} />);
    expect(html).not.toContain('data-manipulation-progress');
    expect(html).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(html).toContain('data-lab-stepper');
  });
});

describe('square-root-side — questions pendant le labo', () => {
  it('refine (36 exact, 5 jamais) et graduation : chaque question est complète', () => {
    let ex = R.init({ mode: 'refine', areas: [{ num: 36, den: 1 }], maxScale: 10 });
    ex = R.test(ex, 6);
    
    for (const step of [0, 1]) for (const q of rChain(step, ex)) check(RQ[q](ex, kR, {}), `exact.${step}.${q}`);
    let nv = R.init({ mode: 'refine', areas: [{ num: 5, den: 1 }], maxScale: 1000 });
    nv = R.test(R.test(nv, 2), 3);
    for (const q of rChain(0, nv)) check(RQ[q](nv, kR, {}), `never.0.${q}`);
    for (const sc of [10, 100, 1000]) {
      nv = R.refine(nv);
      const lo = Math.floor(Math.sqrt(5) * sc);
      nv = R.test(R.test(nv, lo), lo + 1);
    }
    expect(R.discoveryReady(nv)).toBe(true);
    for (const q of rChain(1, nv)) check(RQ[q](nv, kR, { calculator: '2,236' }), `never.1.${q}`);
    let g = R.init({ mode: 'graduation', areas: [{ num: 16, den: 9 }, { num: 6, den: 1 }], maxScale: 12 });
    g = R.test(R.setScale(g, 3), 4);
    for (const q of rChain(0, g)) check(RQ[q](g, kR, {}), `grad.0.${q}`);
    g = R.setCard(g, 1);
    for (const sc of [1, 2, 3]) { g = R.setScale(g, sc); const lo = Math.floor(Math.sqrt(6) * sc); g = R.test(R.test(g, lo), lo + 1); }
    expect(R.discoveryReady(g)).toBe(true);
    for (const q of rChain(1, g)) check(RQ[q](g, kR, {}), `grad.1.${q}`);
    expect(Object.keys(RC)).toEqual(['exact', 'never', 'grad']);
  });
  it('mode guidé : ni la progression ni « إظهار التلميح »', () => {
    const html = renderToString(<SquareRootSide mode="refine" num={36} den={1} />);
    expect(html).not.toContain('data-manipulation-progress');
    expect(html).not.toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
