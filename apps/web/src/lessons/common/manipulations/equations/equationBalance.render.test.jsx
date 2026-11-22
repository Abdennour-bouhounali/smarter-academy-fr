import { it, expect, describe } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import EquationBalance, { layoutPan, beamGeometry, CHAIN, QUESTIONS, wrongValues } from './EquationBalance';
import * as B from '../logic/equationBalance';

it('la balance se rend pour les équations de la leçon (sacs, ballons, baudruches, sacs volants)', () => {
  for (const eq of ['3x+2=11', '9x+1=-26', '4x-3=2x+6', '9x+1=2x', '4x-3=-2x+5', '2x-3=3x+1']) {
    const html = renderToString(<EquationBalance eq={eq} />);
    expect(html).toContain('data-equation-balance');
    expect(html).toContain('data-balance-reserve');
    expect(html).not.toMatch(/manipulation\.equationBalance\./); // aucune clé i18n brute
  }
  expect(renderToString(<EquationBalance eq="4x-3=2x+6" levels={false} />)).not.toContain('data-manipulation-levels-selector');
});

it('le plateau reste dans sa largeur et chaque objet est dessiné une fois, pour toute charge', () => {
  for (let bags = 0; bags <= 12; bags += 3) {
    for (let units = -40; units <= 40; units += 7) {
      const c = { bags, antis: 0, balls: Math.max(0, units), balloons: Math.max(0, -units), part: null };
      const lay = layoutPan(c);
      expect(lay.ground.length + lay.float.length).toBe(bags + Math.abs(units));
      for (const it of [...lay.ground, ...lay.float]) {
        expect(Math.abs(it.x) + it.size / 2).toBeLessThanOrEqual(100);
        expect(it.y).toBeLessThan(0);
      }
    }
  }
});

it('le fléau penche du côté du plateau qui descend (et chaque extrémité suit sa tige)', () => {
  for (const s of [9, 15, 22]) {
    // s > 0 : le plateau gauche descend de s → l'extrémité GAUCHE du fléau descend (dy > 0 en SVG).
    const left = beamGeometry(s);
    expect(left.angle).toBeLessThan(0);
    expect(left.leftEndDy).toBeCloseTo(s, 0);
    expect(left.rightEndDy).toBeCloseTo(-s, 0);
    const right = beamGeometry(-s);
    expect(right.angle).toBeGreaterThan(0);
    expect(right.rightEndDy).toBeCloseTo(s, 0);
  }
  expect(beamGeometry(0).angle === 0 || Object.is(beamGeometry(0).angle, -0)).toBe(true);
});

const RAW = /manipulation\.[a-zA-Z]/;
const k = (key, o) => i18n.t(`lesson:manipulation.equationBalance.${key}`, o);
const EQS = ['3x+2=11', '9x+1=-26', '4x-3=2x+6', '9x+1=2x', '4x-3=-2x+5', '2x-3=3x+1'];

/** Une balance « finie » : les sacs d'un côté, les unités de l'autre (chaque geste des DEUX plateaux), partage, sac lu, valeur vérifiée. */
function finished(eq) {
  let lab = B.init(eq);
  const both = (g, n) => { for (let i = 0; i < n; i += 1) { lab = B.gesture(lab, 'L', g); lab = B.gesture(lab, 'R', g); } };
  const net = lab.pans.L.a - lab.pans.R.a;
  const bagSide = net > 0 ? 'L' : 'R'; const otherSide = B.other(bagSide);
  const oa = lab.pans[otherSide].a;
  both(oa > 0 ? 'add:anti' : 'add:bag', Math.abs(oa));
  const u = lab.pans[bagSide].u;
  both(u.n > 0 ? 'add:balloon' : 'add:ball', Math.abs(u.n));
  const a = Math.abs(lab.pans[bagSide].a);
  if (a > 1) lab = B.divide(lab, a);
  return B.verify(lab);
}

describe('equation-balance — questions pendant le labo (LabCheckpoint)', () => {
  for (const eq of EQS) {
    it(`${eq} : chaque question a un texte, deux indices, une seule bonne réponse, ni clé brute ni {{`, () => {
      const lab = finished(eq);
      expect(B.discoveryReady(lab), eq).toBe(true);
      for (const qid of CHAIN) {
        const q = QUESTIONS[qid](lab, k);
        const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
        expect(out, `${eq}.${qid}`).not.toMatch(RAW);
        expect(out, `${eq}.${qid}`).not.toContain('{{');
        expect(out, `${eq}.${qid}`).not.toMatch(/\$/);   // aucun « $ » orphelin (un $…$ imbriqué)
        expect(q.hints, `${eq}.${qid}`).toHaveLength(2);
        if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${eq}.${qid}`).toHaveLength(1);
        else expect(q.expected, `${eq}.${qid}`).toBeTruthy();
      }
      expect(wrongValues(lab).length, eq).toBeGreaterThanOrEqual(2);
    });
  }

  it('les nombres viennent de la balance ; chaque mauvaise valeur est une erreur réelle', () => {
    const lab = finished('9x+1=-26');                    // x = −3, partage par 9
    expect(wrongValues(lab).map((w) => w.id)).toEqual(expect.arrayContaining(['sign', 'nodiv']));
    expect(wrongValues(lab).find((w) => w.id === 'nodiv').k).toBe(9);
    expect(CHAIN[CHAIN.length - 1]).toBe('rule');
  });
});

describe('equation-balance — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('avec questions : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const g = renderToString(<EquationBalance eq="3x+2=11" />);
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(g).toContain('data-eb-step');
    const off = renderToString(<EquationBalance eq="3x+2=11" checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
