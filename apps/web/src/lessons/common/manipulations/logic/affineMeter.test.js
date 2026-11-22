import { describe, it, expect } from 'vitest';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as M from './affineMeter';

const T = (p) => M.numText(p);

describe('affine-meter — le compteur à partie fixe', () => {
  it('lit les deux règles du niveau et refuse un compteur sans partie fixe', () => {
    const s = M.init({ rule: '40x+100' });
    expect(T(s.f.a)).toBe('40');
    expect(T(s.f.b)).toBe('100');
    expect(s.modes).toEqual(['image']);
    expect(s.range).toEqual({ min: 0, max: 12 });
    expect(() => M.init({ rule: '5x' })).toThrow();
    expect(() => M.init({ rule: '7' })).toThrow();
    expect(() => M.init({ mode: 'image|nope' })).toThrow();
  });

  it('le نشاط 1 : la paie 185x + 35000 — les cinq colonnes du tableau du manuel', () => {
    const s = M.init({ rule: '185x+35000', mode: 'image|antecedent|classify', target: '37775', marks: '5|8|10|12|15' });
    expect(s.range.max).toBe(20);
    expect(s.targetX).toBe(15);
    const want = { 5: '35925', 8: '36480', 10: '36850', 12: '37220', 15: '37775' };
    for (const [x, y] of Object.entries(want)) expect(T(M.meterAt(s, Number(x)))).toBe(y);
  });

  it('image : terminée seulement avec le contraste (0, ou x et 2x) — et toutes les marques', () => {
    let s = M.init({ rule: '40x+100' });
    for (const x of [3, 4, 7]) s = M.commit(s, x);
    expect(M.imageDone(s)).toBe(false); // trois essais, aucun témoin de non-proportionnalité
    s = M.commit(s, 0);
    expect(M.imageDone(s)).toBe(true);
    expect(M.proportionWitness(s)).toMatchObject({ kind: 'zero' });
    expect(T(M.proportionWitness(s).fx)).toBe('100');

    let p = M.init({ rule: '185x+35000', mode: 'image|antecedent', target: '37775', marks: '5|8|10|12|15' });
    for (const x of [5, 8, 10, 12]) p = M.commit(p, x);
    expect(M.imageDone(p)).toBe(false); // la colonne 15 manque
    p = M.commit(p, 15);
    expect(M.imageDone(p)).toBe(true);
    const w = M.proportionWitness(p);
    expect(w.kind).toBe('double');
    expect([w.x, T(w.fx), T(w.f2x)]).toEqual([5, '35925', '36850']); // 36850 ≠ 2 × 35925
  });

  it('les étapes s’ouvrent dans l’ordre, par l’élève, avec retour', () => {
    let s = M.init({ rule: '185x+35000', mode: 'image|antecedent|classify', target: '37775' });
    expect(M.canOpen(s, 'antecedent')).toBe(false);
    expect(M.setStage(s, 'antecedent')).toBe(s);
    for (const x of [0, 2, 4]) s = M.commit(s, x);
    expect(M.canOpen(s, 'antecedent')).toBe(true);
    expect(M.canOpen(s, 'classify')).toBe(false);
    s = M.setStage(s, 'antecedent');
    expect(s.stage).toBe('antecedent');
    expect(M.discoveryReady(s)).toBe(false);
    s = M.commit(s, 14);
    expect(s.last.kind).toBe('below');
    expect(T(s.last.gap)).toBe('185');
    s = M.commit(s, 16);
    expect(s.last.kind).toBe('above');
    s = M.commit(s, 15);
    expect(s.last.kind).toBe('hit');
    expect(M.discoveryReady(s)).toBe(true);
    expect(M.canOpen(s, 'classify')).toBe(true);
    expect(M.setStage(s, 'image').stage).toBe('image');
  });

  it('le programme inverse : اطرح b ثم اقسم على a — jamais m ÷ a − b', () => {
    const s = M.init({ rule: '185x+35000', mode: 'image|antecedent', target: '37775' });
    expect(M.inverseLines(s)).toEqual(['37775 - 35000 = 2775', '2775 \\div 185 = 15']);
    expect(Lin.eq(M.wrongOrder(s), Lin.sub(Lin.div(37775, 185), 35000))).toBe(true);
    expect(Lin.cmp(M.wrongOrder(s), 0)).toBeLessThan(0);
    expect(T(M.divideOnly(s))).toBe('7555/37'); // 37775 ÷ 185 n'est même pas entier
    expect(() => M.init({ rule: '185x+35000', mode: 'antecedent', target: '37000' })).toThrow();
  });

  it('classify : b → 0 donne une fonction خطية, a → 0 une fonction ثابتة', () => {
    let s = M.init({ rule: '185x+35000', mode: 'image|antecedent|classify', target: '37775' });
    expect(M.knobGrid(185)).toEqual({ step: 5, max: 74 });
    expect(M.knobGrid(35000)).toEqual({ step: 5000, max: 14 });
    for (const x of [0, 2, 4]) s = M.commit(s, x);
    s = M.setStage(M.commit(M.setStage(s, 'antecedent'), 15), 'classify');
    expect(M.setKnob(M.init({}), 'a', 0).knobs.a).toBe(4); // hors étape classify : rien ne bouge
    expect(M.ruleTex(s)).toBe('185x + 35000');
    s = M.commitKnobs(M.setKnob(s, 'b', 0));
    expect(M.kinds(s)).toMatchObject({ affine: true, linear: true, constant: false });
    expect(T(M.meterAt(s, 0))).toBe('0');
    expect(s.visited).toEqual({ linear: true, constant: false });
    s = M.commitKnobs(M.setKnob(M.setKnob(s, 'b', 7), 'a', 0));
    expect(M.kinds(s)).toMatchObject({ linear: false, constant: true });
    expect(M.sweep(s).map((x) => T(M.meterAt(s, x)))).toEqual(['35000', '35000', '35000', '35000']);
    expect(M.classifyDone(s)).toBe(true);
    // x ⟼ 0 compte comme ثابتة, pas comme « خطية » (a = 0)
    let z = M.setStage(M.commit(M.setStage(M.commit(M.commit(M.commit(M.init({ rule: '185x+35000', mode: 'image|antecedent|classify', target: '37775' }), 0), 2), 4), 'antecedent'), 15), 'classify');
    z = M.commitKnobs(M.setKnob(M.setKnob(z, 'a', 0), 'b', 0));
    expect(z.visited).toEqual({ linear: false, constant: true });
  });

  it('un bloc de tuiles presque carré (|lignes − colonnes| ≤ 1 pour une scène carrée)', () => {
    for (let n = 1; n <= 40; n += 1) {
      const g = M.tileGrid(n, 1);
      expect(g.cols * g.rows).toBeGreaterThanOrEqual(n);
      expect(Math.abs(g.rows - g.cols)).toBeLessThanOrEqual(1);
    }
    const wide = M.tileGrid(20, 2);
    expect(wide.cols).toBeGreaterThan(wide.rows);
  });
});

describe('affine-meter — défaut et balayage (2026-10-09)', () => {
  it('le x de départ n\'est ni une marque, ni la cible, et n\'est pas un essai', () => {
    const s = M.init({ rule: '185x+35000', marks: '5|8|10|12|15' });
    expect(s.marks).not.toContain(M.defaultX(s));
    expect(s.trials).toHaveLength(0);
    const a = M.setStage(M.init({ rule: '40x+100', mode: 'image|antecedent|classify', target: '500' }), 'antecedent');
    expect(a.stage === 'antecedent' ? M.defaultX(a) : 0).not.toBe(a.targetX);
    const b = M.init({ rule: '40x+100', mode: 'antecedent', target: '500' });
    expect(M.defaultX(b)).not.toBe(b.targetX);
  });
  it('le balayage de l\'image valide chaque x et accomplit l\'étape', () => {
    let s = M.init({ rule: '40x+100' });
    for (const x of M.untriedXs(s)) s = M.commit(s, x);
    expect(M.untriedXs(s)).toHaveLength(0);
    expect(M.imageDone(s)).toBe(true);
  });
  it('le balayage de l\'antécédent finit par toucher la cible ; classify : aucun balayage', () => {
    let s = M.init({ rule: '40x+100', mode: 'antecedent', target: '500' });
    for (const x of M.untriedXs(s)) s = M.commit(s, x);
    expect(s.hit).toBe(true);
    expect(M.untriedXs(M.init({ rule: '40x+100', mode: 'image|antecedent|classify', target: '500' }))).not.toHaveLength(0);
    const c = { ...M.init({ rule: '40x+100' }), stage: 'classify' };
    expect(M.untriedXs(c)).toHaveLength(0);
  });
});
