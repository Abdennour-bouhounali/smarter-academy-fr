import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import AffineLine, { chainOf, QUESTIONS } from './AffineLine';
import * as L from '../logic/affineLine';
import { LEVELS } from '../levels';

/**
 * affine-line se rend pour chaque laboratoire (shift, identify, draw, read) et pour les deux niveaux de
 * levels.js — sans clé i18n brute, avec le bloc « glance » que mesure l'e2e de l'unité 7.
 */
const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<AffineLine {...props} />);

describe('affine-line — chaque laboratoire', () => {
  it('les deux niveaux de levels.js', () => {
    for (const id of ['beginner', 'advanced']) {
      const out = html({ ...LEVELS['affine-line'][id].numbers, level: id });
      expect(out).toContain('data-affine-line');
      expect(out).toContain('data-al-glance');
      expect(out).toContain('data-al-plane');
      expect(out).toContain('data-deco="ramp"');
      expect(out).not.toMatch(RAW);
    }
  });

  it('shift (نشاط 3) : (d) fantôme par O, la droite de l\'élève part de b′ = 0, la piste b et la sonde x', () => {
    const out = html({ a: '3/2', b: '1', mode: 'shift|identify', find: '-1/2:3' });
    expect(out).toContain('data-mode="shift"');
    expect(out).toContain('data-modes="shift|identify"');
    expect(out).toContain('data-al-ghost="3/2"');
    expect(out).toContain('data-b-now="0"');
    expect(out).toContain('data-al-strip="b"');
    expect(out).toContain('data-al-strip="x"');
    expect(out).not.toContain('data-al-strip="a"');
    expect(out).toContain('\\tfrac{3}{2}x + 1');
    // le second laboratoire n'est pas ouvert tant que le premier n'est pas accompli
    expect(out).not.toContain('data-al-next=');
    expect(out).not.toContain('data-al-hidden');
  });

  it('identify seul : la droite cachée, les deux poignées, la formule masquée', () => {
    const out = html({ a: '-1/2', b: '3', mode: 'identify' });
    expect(out).toContain('data-al-hidden');
    expect(out).toContain('data-al-strip="a"');
    expect(out).toContain('data-al-strip="b"');
    expect(out).not.toContain('-\\dfrac{1}{2}x + 3');
  });

  it('draw : l\'épingle, ses flèches, « ضع النقطة », la sonde fermée tant que la droite n\'est pas tracée', () => {
    const out = html({ a: '2', b: '-3', mode: 'draw' });
    expect(out).toContain('data-al-pin');
    for (const d of ['left', 'right', 'up', 'down']) expect(out).toContain(`data-al-move="${d}"`);
    expect(out).toContain('data-al-place');
    expect(out).toContain('data-disabled="true"');
    expect(out).not.toContain('data-al-line=');
  });

  it('read : la droite donnée, deux sondes, deux cibles', () => {
    const out = html({ a: '3/2', b: '1', mode: 'read', reads: 'x:4|y:7', levels: false });
    expect(out).toContain('data-al-line="3/2x + 1"');
    expect(out).toContain('data-al-strip="y"');
    expect(out).toContain('data-al-target="0"');
    expect(out).toContain('data-al-target="1"');
    expect(out).not.toMatch(RAW);
  });

  it('un contrat incomplet est une erreur de contenu', () => {
    expect(() => html({ a: '1', mode: 'shift' })).toThrow();
  });
});

describe('affine-line — défaut à l\'ouverture (2026-10-09)', () => {
  it('shift et read ouvrent avec une sonde posée, et offrent « جرّب كل الإمكانيات »', () => {
    const shift = html({ a: '3/2', b: '1', mode: 'shift' });
    expect(shift).toContain('data-al-probe="x"');
    expect(shift).toContain('data-manipulation-autocomplete="ready"');
    const read = html({ a: '3/2', b: '1', mode: 'read', reads: 'x:4|y:7' });
    expect(read).toContain('data-al-probe="x"');
    expect(read).toContain('data-al-probe="y"');
    expect(read).toContain('data-al-target="0"');
    expect(read).not.toContain('data-done="true"');
  });
});

describe('affine-line — questions pendant le labo (LabCheckpoint)', () => {
  const k = (key, o) => i18n.t(`lesson:manipulation.affineLine.${key}`, o);
  const check = (lab, mode, last) => {
    for (const qid of chainOf(lab, mode, last)) {
      const q = QUESTIONS[qid](lab, k);
      const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
      expect(out, `${mode}.${qid}`).not.toMatch(RAW);
      expect(out, `${mode}.${qid}`).not.toContain('{{');
      expect(q.hints, `${mode}.${qid}`).toHaveLength(2);
      if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${mode}.${qid}`).toHaveLength(1);
      else expect(q.expected, `${mode}.${qid}`).toBeTruthy();
    }
  };
  it('shift : lift · predict · cut ; identify : readB · readA · règle (dernier)', () => {
    let lab = L.init({ a: '3/2', b: '1', mode: 'shift|identify', find: '-1/2:3' });
    lab = L.setB(lab, 1);
    lab = L.probe(L.probe(lab, 1), 2);
    expect(L.stageDone(lab)).toBe(true);
    expect(chainOf(lab, 'shift', false)).toEqual(['lift', 'predict', 'cut']);
    check(lab, 'shift', false);
    expect(QUESTIONS.lift(lab, k).expected).toBe('1');
    lab = L.next(lab);
    lab = L.setB(L.setA(lab, '-1/2'), 3);
    expect(L.stageDone(lab)).toBe(true);
    expect(chainOf(lab, 'identify', true)).toEqual(['readB', 'readA', 'rule']);
    check(lab, 'identify', true);
  });
  it('draw : origin (si refusé) · enough · third ; read : vocab · antec · compute', () => {
    let d = L.init({ a: '2', b: '-3', mode: 'draw' });
    d = L.place(L.place(L.place(d, 0, 0), 1, -1), 2, 1);
    expect(L.stageDone(d)).toBe(true);
    expect(chainOf(d, 'draw', true)).toEqual(['origin', 'enough', 'third', 'rule']);
    check(d, 'draw', true);
    let r = L.init({ a: '3/2', b: '1', mode: 'read', reads: 'x:4|y:7' });
    r = L.readY(L.probe(r, 4), 7);
    expect(L.stageDone(r)).toBe(true);
    expect(chainOf(r, 'read', true)).toEqual(['vocab', 'antec', 'compute', 'rule']);
    check(r, 'read', true);
    expect(QUESTIONS.compute(r, k).expected).toBe('7');
  });
  it('mode guidé : ni la progression ni le bouton d’indice', () => {
    const out = html({ a: '1/2', b: '2', mode: 'shift' });
    expect(out).not.toContain('data-manipulation-progress');
    expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
