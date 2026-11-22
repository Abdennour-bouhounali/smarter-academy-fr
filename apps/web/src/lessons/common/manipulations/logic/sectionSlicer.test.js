import { describe, it, expect } from 'vitest';
import * as linear from '@smarter-academy/core/arithmetic/linear.js';
import * as trigonometry from '@smarter-academy/core/arithmetic/trigonometry.js';
import * as L from './sectionSlicer';
import { LEVELS } from '../levels';
import { validateSpaceFigure, spaceFigureQuality } from '../../components/spaceFigure';

/**
 * La trancheuse (section-slicer) : les sections du MANUEL recalculées sur les indices du lab (نشاط 2 : x = 0 ; 1,25 ; 2 ;
 * 2,8 ; 3 — نشاط 3 : 20 × 6 = 120 puis 5 × 6 = 30 — نشاط 4 : 3 × 6 et le cercle 1,7 — نشاط 5 : 3 × 3, EG = 3√2), les cartes
 * de prédiction (une seule juste, les autres FAUSSES et refusées par la mesure), la découverte qui exige le contraste, et la
 * figure de repli de CHAQUE position de CHAQUE étage (valide, lisible).
 */
const { frac, eq } = linear;
const { surd, surdEq } = trigonometry;
const B = LEVELS['section-slicer'].beginner.numbers;
const A = LEVELS['section-slicer'].advanced.numbers;
const at = (lab, stage, value) => {
  const st = lab.cfg.stages[stage];
  for (let i = st.min; i <= st.max; i += 1) if (eq(L.valueOf(lab, stage, i), L.toFrac(value))) return i;
  throw new Error(`${stage} : ${value} hors du rail`);
};
const printAt = (lab, stage, value, pick = 'ok') => {
  let s = L.goStage(lab, stage);
  s = L.moveTo(s, at(s, stage, value));
  s = L.print(s);
  const card = s.pending.cards.find((c) => (pick === 'ok' ? c.correct : c.kind === pick));
  if (!card) throw new Error(`carte ${pick} absente`);
  return L.choose(s, card.id);
};

describe('section-slicer — les étages et leurs rails', () => {
  it('مبتدئ : une sphère R = 5, h de 0 à 6 au centimètre, les marques 0, 3, 4, 5', () => {
    const lab = L.init(B);
    expect(lab.cfg.order).toEqual(['sphere']);
    const st = lab.cfg.stages.sphere;
    expect([st.min, st.max]).toEqual([0, 6]);
    expect(st.stops).toEqual([0, 3, 4, 5]);
    expect(st.letter).toBe('h');
    expect(lab.stage).toBe('sphere');
  });
  it('متقدم : les quatre solides du manuel, x = OI au vingtième (les cinq x du نشاط 2 sont des positions exactes)', () => {
    const lab = L.init(A);
    expect(lab.cfg.order).toEqual(['sphere', 'cuboid-face', 'cuboid-edge', 'cylinder-base', 'cylinder-axis', 'pyramid']);
    const st = lab.cfg.stages.sphere;
    expect(st.letter).toBe('x');
    expect(st.foot).toBe('I');
    expect(st.stops.map((i) => L.valueText(lab, 'sphere', i))).toEqual(['0', '1,25', '2', '2,8', '3']);
    // le plan ne s'arrête pas à R : au-delà, il ne coupe plus
    expect(L.toNumberAny(L.valueOf(lab, 'sphere', st.max))).toBe(4);
  });
  it('aucun départ n’est une réponse du manuel (ni une marque)', () => {
    for (const nums of [B, A]) {
      const lab = L.init(nums);
      for (const s of lab.cfg.order) expect(lab.cfg.stages[s].stops, s).not.toContain(lab.cfg.stages[s].start);
    }
  });
});

describe('section-slicer — les sections du manuel', () => {
  it('نشاط 2 : IM² = 9 − x² aux cinq x', () => {
    const lab = L.init(A);
    const r2 = (x) => L.sectionAt(lab, 'sphere', at(lab, 'sphere', x));
    expect(r2(0).kind).toBe('great-circle');
    expect(surdEq(r2(0).r, surd(3))).toBe(true);
    expect(eq(r2('1,25').r2, frac(119, 16))).toBe(true);
    expect(L.lengthTex(r2('1,25').r)).toBe('\\dfrac{\\sqrt{119}}{4}');
    expect(surdEq(r2(2).r, surd(1, 5))).toBe(true);
    expect(eq(r2('2,8').r2, frac(29, 25))).toBe(true);
    expect(r2(3).kind).toBe('point');
    expect(r2(4).kind).toBe('none');
    expect(L.approx(r2('1,25').r)).toBe('2,73');
    expect(L.approx(r2('2,8').r)).toBe('1,08');
  });
  it('مبتدئ : R = 5 donne les rayons entiers 5, 4, 3 puis le contact et rien', () => {
    const lab = L.init(B);
    const k = (h) => L.sectionAt(lab, 'sphere', h);
    expect(L.lengthTex(k(0).r)).toBe('5');
    expect(L.lengthTex(k(3).r)).toBe('4');
    expect(L.lengthTex(k(4).r)).toBe('3');
    expect(k(5).kind).toBe('point');
    expect(k(6).kind).toBe('none');
    expect(L.lengthTex(k(1).r)).toBe('2\\sqrt{6}');
  });
  it('نشاط 3 : parallèle à CBFG, le même 20 × 6 = 120 partout ; parallèle à [CG] avec CM = 4, CN = 3 : MN = 5, 5 × 6 = 30', () => {
    const lab = L.init(A);
    const st = lab.cfg.stages['cuboid-face'];
    for (let i = st.min; i <= st.max; i += 1) {
      const s = L.sectionAt(lab, 'cuboid-face', i);
      expect(L.sectionTex(s)).toBe('20 \\times 6');
      expect(eq(s.area, frac(120))).toBe(true);
    }
    const e = L.sectionAt(lab, 'cuboid-edge', at(lab, 'cuboid-edge', 4));
    expect(eq(e.cn, frac(3))).toBe(true);
    expect(surdEq(e.mn, surd(5))).toBe(true);
    expect(L.sectionTex(e)).toBe('5 \\times 6');
  });
  it('نشاط 4 : à 0,8 de l’axe un rectangle 3 × 6 ; tangent à 1,7 (une génératrice) ; au-delà rien ; parallèle à la base un cercle de rayon 1,7', () => {
    const lab = L.init(A);
    const c = (d) => L.sectionAt(lab, 'cylinder-axis', at(lab, 'cylinder-axis', d));
    expect(L.sectionTex(c('0,8'))).toBe('3 \\times 6');
    expect(c('1,7').kind).toBe('segment');
    expect(c(2).kind).toBe('none');
    expect(L.sectionTex(c(0))).toBe('3{,}4 \\times 6');
    const b = L.sectionAt(lab, 'cylinder-base', 5);
    expect(L.sectionTex(b)).toBe('r = 1{,}7');
  });
  it('نشاط 5 : SE = 3/4 SA donne le carré EFGH de côté 3, EG = 3√2, aire 9 = (3/4)² × 16', () => {
    const lab = L.init(A);
    const st = lab.cfg.stages.pyramid;
    const s = L.sectionAt(lab, 'pyramid', st.stops[0]);
    expect(eq(s.k, frac(3, 4))).toBe(true);
    expect(surdEq(surd(s.side), surd(3))).toBe(true);
    expect(surdEq(s.diag, surd(3, 2))).toBe(true);
    expect(eq(s.area, frac(9))).toBe(true);
  });
});

describe('section-slicer — prédire, puis la mesure tranche', () => {
  it('une seule carte juste, trois valeurs distinctes, à CHAQUE position de CHAQUE étage (balayage)', () => {
    for (const nums of [B, A]) {
      const lab = L.init(nums);
      for (const stage of lab.cfg.order) {
        const st = lab.cfg.stages[stage];
        for (let i = st.min; i <= st.max; i += 1) {
          const cards = L.cardsFor(lab, stage, i);
          expect(cards, `${stage} ${i}`).toHaveLength(3);
          expect(cards.filter((c) => c.correct), `${stage} ${i}`).toHaveLength(1);
          const keys = cards.map((c) => (c.r2 ? `r${c.r2.n}/${c.r2.d}` : c.sides ? `s${c.sides.map((x) => L.lengthTex(x)).join('x')}` : `n${c.nature}`));
          expect(new Set(keys).size, `${stage} ${i} ${keys}`).toBe(3);
          // sphère : une carte de rayon est juste SI ET SEULEMENT SI son cercle est sur la sphère (OM² = h² + ρ² = R²)
          if (stage === 'sphere') {
            for (const c of cards.filter((x) => x.r2)) {
              const chk = L.ringCheck(st.R, L.valueOf(lab, stage, i), c.r2);
              expect(chk.on, `${i} ${c.kind}`).toBe(!!c.correct);
            }
          }
        }
      }
    }
  });
  it('« R − h » est refusé par la mesure : à h = 3 (R = 5) le cercle de rayon 2 est DANS la boule, OM = √13', () => {
    const lab = printAt(L.init(B), 'sphere', 3, 'tarh');
    expect(lab.last.kind).toBe('refused');
    expect(lab.last.detail.where).toBe('inside');
    expect(L.lengthTex(lab.last.detail.om)).toBe('\\sqrt{13}');
    expect(lab.ghost.card.kind).toBe('tarh');
    // la couche RÉELLE est imprimée quand même
    expect(lab.layers.map((l) => l.i)).toEqual([3]);
    expect(L.isFound(lab, 'sphere')).toBe(false);
  });
  it('« R² + h² » sort de la boule ; la carte juste est trouvée ; le plan reste immobile pendant la prédiction', () => {
    let lab = L.init(A);
    lab = L.moveTo(lab, at(lab, 'sphere', 2));
    lab = L.print(lab);
    expect(L.canMove(lab)).toBe('pending');
    expect(L.moveTo(lab, 10).pos.sphere).toBe(at(lab, 'sphere', 2));
    const jam = lab.pending.cards.find((c) => c.kind === 'jam');
    const refused = L.choose(lab, jam.id);
    expect(refused.last.detail.where).toBe('outside');
    const ok = L.choose(lab, lab.pending.cards.find((c) => c.correct).id);
    expect(ok.last.kind).toBe('ok');
    expect(L.isFound(ok, 'sphere')).toBe(true);
    expect(ok.ghost).toBeNull();
  });
  it('h > R : rien n’est imprimé (aucune couche), la carte « نقطة » est refusée', () => {
    const lab = printAt(L.init(B), 'sphere', 6, 'mumas');
    expect(lab.last.kind).toBe('refused');
    expect(lab.layers).toHaveLength(0);
    expect(lab.trials[0].kind).toBe('none');
  });
  it('les confusions des autres solides sont proposées et refusées : 25 × 6, 7 × 6, 2(r − d), le côté de la base', () => {
    const lab = L.init(A);
    const kinds = (stage, v) => L.cardsFor(lab, stage, at(lab, stage, v)).map((c) => `${c.kind}:${c.sides ? c.sides.map((x) => L.lengthTex(x)).join('×') : c.nature}`);
    expect(kinds('cuboid-face', 10)).toEqual(expect.arrayContaining(['ok:20×6', 'buud:25×6']));
    expect(kinds('cuboid-edge', 4)).toEqual(expect.arrayContaining(['ok:5×6', 'majmu:7×6']));
    expect(kinds('cylinder-axis', '0,8')).toEqual(expect.arrayContaining(['ok:3×6', 'tarh:1{,}8×6']));
    expect(kinds('cylinder-base', '1,5')).toEqual(expect.arrayContaining(['ok:circle', 'baydawi:ellipse']));
    const pyr = L.cardsFor(lab, 'pyramid', lab.cfg.stages.pyramid.stops[0]).map((c) => `${c.kind}:${L.lengthTex(c.sides[0])}`);
    expect(pyr).toEqual(expect.arrayContaining(['ok:3', 'haram:4', 'mutammim:1']));
  });
});

describe('section-slicer — la découverte demande le CONTRASTE', () => {
  it('trois cercles qui rétrécissent ne suffisent pas ; grand cercle + petit cercle + contact (ou rien) : oui', () => {
    let lab = L.init(B);
    lab = printAt(lab, 'sphere', 1);
    lab = printAt(lab, 'sphere', 3);
    lab = printAt(lab, 'sphere', 4);
    expect(L.discoveryReady(lab)).toBe(false);
    lab = printAt(lab, 'sphere', 0, 'qutr');
    expect(L.discoveryReady(lab)).toBe(false);
    lab = printAt(lab, 'sphere', 5);
    expect(L.discoveryReady(lab)).toBe(true);
    expect(L.toNumberAny(L.witness(lab).value)).toBe(4);
  });
  it('متقدم : après la sphère, l’étage suivant est la بلاطة, puis la أسطوانة, puis le هرم', () => {
    let lab = L.init(A);
    expect(L.nextStage(lab)).toBe('cuboid-face');
    lab = L.goSolid(lab, 'cuboid');
    expect(lab.stage).toBe('cuboid-face');
    lab = L.goStage(lab, 'cuboid-edge');
    lab = L.goSolid(lab, 'sphere');
    expect(L.goSolid(lab, 'cuboid').stage).toBe('cuboid-edge');
    expect(L.nextStage(L.goSolid(lab, 'cylinder'))).toBe('pyramid');
    expect(L.nextStage(L.goSolid(lab, 'pyramid'))).toBeNull();
    expect(L.nextStage(L.init(B))).toBeNull();
  });
  it('les preuves du module : la valeur et la section en LaTeX', () => {
    const lab = printAt(L.init(A), 'sphere', '1,25');
    expect(L.evidenceOf(lab.trials[0], lab)).toMatchObject({ stage: 'sphere', ok: true, value: '1{,}25', section: 'r = \\dfrac{\\sqrt{119}}{4}' });
  });
});

describe('section-slicer — la figure de repli (SpaceFigure) de chaque état', () => {
  it('valide et lisible à CHAQUE position de chaque étage, imprimée ou non (balayage ; les noms facultatifs qui chevaucheraient sont tus)', () => {
    for (const nums of [B, A]) {
      const lab0 = L.init(nums);
      for (const stage of lab0.cfg.order) {
        const st = lab0.cfg.stages[stage];
        for (let i = st.min; i <= st.max; i += 1) {
          let lab = L.moveTo(L.goStage(lab0, stage), i);
          for (const printed of [false, true]) {
            if (printed) { lab = L.print(lab); lab = L.choose(lab, lab.pending.cards.find((c) => c.correct).id); }
            const fig = L.sceneFigure(lab, 'مقطع مجسم بمستو');
            expect(validateSpaceFigure(fig), `${stage} ${i} ${printed}`).toEqual([]);
            expect(spaceFigureQuality(fig, { maxAspect: 2.2 }), `${stage} ${i} ${printed}`).toEqual([]);
          }
        }
      }
    }
  });
  it('le départ n’est ni une marque, ni le grand cercle, ni la tangente — et ne laisse aucune trace', () => {
    for (const nums of [B, A, { solids: ['sphere'], R: 3, step: '1/20', stops: [0, 3, 60], start: 0 }, { solids: ['sphere'], R: 5, step: 1, stops: [2], start: 2 }]) {
      const lab = L.init(nums);
      for (const s of lab.cfg.order) {
        const st = lab.cfg.stages[s];
        expect(st.stops, s).not.toContain(st.start);
        expect(st.start).toBeGreaterThanOrEqual(st.min);
        expect(st.start).toBeLessThanOrEqual(st.max);
        if (s === 'sphere') { expect(st.start).not.toBe(0); expect(st.start).not.toBe(Math.round(L.toNumberAny(st.R) / L.toNumberAny(st.step))); }
      }
      expect(lab.trials.length).toBe(0);
      expect(lab.layers.length).toBe(0);
    }
  });
});
