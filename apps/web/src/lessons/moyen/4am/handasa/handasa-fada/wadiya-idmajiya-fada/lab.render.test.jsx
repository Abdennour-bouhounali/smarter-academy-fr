import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import * as SP from '@smarter-academy/core/arithmetic/space.js';
import * as LN from '@smarter-academy/core/arithmetic/linear.js';
import '../../../../../../i18n';
import BucketFill from '../../../../../common/manipulations/space/BucketFill';
import ManipulationWorkspace from '../../../../../common/manipulations/ManipulationWorkspace';
import * as BF from '../../../../../common/manipulations/logic/bucketFill';
import { LEVELS } from '../../../../../common/manipulations/levels';
import { LAB, LAB_EXPECT, SITUATION, TEST } from './content/textbook';

/**
 * Le workspace du module 7 de la synthèse — `bucket-fill`, deux niveaux (le petit seau plein ; le تحدّ) — rendu avec EXACTEMENT
 * les props que le module étale (content/textbook.js › LAB) ; puis la mathématique que les modules 7 et 8 supposent, recalculée
 * avec packages/core (space.js) et posée par la main dans la logique du lab (logic/bucketFill.js).
 */
const F = (n, d = 1) => LN.frac(n, d);
const workspace = () => (
  <ManipulationWorkspace
    defaultLevel="advanced"
    levels={{
      beginner: () => <BucketFill level="beginner" {...LAB.beginner} />,
      advanced: () => <BucketFill level="advanced" {...LAB.advanced} />,
    }}
  />
);

it('les deux niveaux se rendent dans le workspace, sans clé brute ni réponse', () => {
  const html = renderToString(workspace());
  expect((html.match(/data-bucket-fill="true"/g) ?? []).length).toBe(2);
  expect(html).toContain('data-bf-glance');
  expect((html.match(/data-stage3d="true"/g) ?? []).length).toBe(2);
  expect(html).not.toMatch(/manipulation\.[a-zA-Z]+\.[a-zA-Z]/);
  expect(html).not.toContain('{{');
  for (const leak of ['24388', 'SO = 105', '74\\pi', 'data-bf-card']) expect(html).not.toContain(leak);
});

it('les props du LAB sont les nombres de levels.js (une seule source) et la وضعية', () => {
  expect(LAB.beginner.numbers).toEqual(LEVELS['bucket-fill'].beginner.numbers);
  expect(LAB.advanced.numbers).toEqual(LEVELS['bucket-fill'].advanced.numbers);
  expect(LAB.advanced.numbers).toEqual(SITUATION.numbers);
});

it.each([['advanced'], ['beginner']])('%s : la main — un refus, le niveau, le sommet, la bonne carte, la découverte', (lv) => {
  const nums = LAB[lv].numbers;
  const exp = LAB_EXPECT[lv];
  let s = BF.fixLevel(BF.init(nums));
  expect(s.last.kind).toBe('levelKo');
  s = BF.fixLevel(BF.setLevel(s, nums.depth));
  s = BF.openPhase(s, 'apex');
  s = BF.commitApex(BF.setApex(s, exp.apex));
  expect(s.last.kind).toBe('apexOk');
  s = BF.pickCard(BF.openPhase(s, 'volume'), 'k3');
  expect(BF.discoveryReady(s)).toBe(true);
  const f = BF.facts(nums);
  expect(LN.eq(f.k, F(...exp.k))).toBe(true);
  expect(LN.eq(f.volume.k, F(...exp.volumeK))).toBe(true);
  expect(SP.roundTo(f.volume.number, 2)).toBe(exp.approx);
  if (exp.litres) expect(SP.roundTo(f.litres, 2)).toBe(exp.litres);
});

it('le module 7 (le تحدّ) : SO = 105, ρ = 19, k = 15/19, V₁ = 48013π/3, V₂ = 7875π, V = 24388π/3 ≈ 25,54 L ; les distracteurs', () => {
  const w = SP.bucketWater({ R: 20, r: 15, H: 35, depth: 28 });
  expect(LN.eq(w.apexBelowBottom, F(105))).toBe(true);
  expect(LN.eq(w.surfaceRadius, F(19))).toBe(true);
  expect(LN.eq(w.k, F(15, 19))).toBe(true);
  expect(LN.eq(w.bigCone.k, F(48013, 3))).toBe(true);
  expect(LN.eq(SP.cone(15, 105).volume.k, F(7875))).toBe(true);
  expect(LN.eq(w.volume.k, F(24388, 3))).toBe(true);
  expect(SP.roundTo(w.volume.number / 1000, 2)).toBe('25,54');
  // la formule du tronc (hors programme) donne le même nombre ; le seau plein ; « 4/5 du seau »
  expect(LN.eq(SP.frustumVolume({ R: 19, r: 15, h: 28 }).k, F(24388, 3))).toBe(true);
  const full = SP.frustumVolume({ R: 20, r: 15, h: 35 });
  expect(LN.eq(full.k, F(32375, 3))).toBe(true);
  expect(SP.roundTo(full.number / 1000, 2)).toBe('33,90');
  expect(SP.roundTo((full.number * 4) / 5 / 1000, 2)).toBe('27,12');
  // distracteurs : le rayon moyen 17 (8092π), k au lieu de k³, 23625π (sans le tiers)
  expect(LN.eq(SP.cylinder(17, 28).volume.k, F(8092))).toBe(true);
  expect(LN.eq(SP.cylinder(15, 105).volume.k, F(23625))).toBe(true);
  expect(SP.roundTo(w.bigCone.number * (1 - 15 / 19), 0)).toBe('10585');
});

it('« إختبار أولي » (le frappé) : SO = 24, ρ = 5,5, k = 8/11, V = 819π/4 ≈ 643,24 ; distracteurs ; rien du lab', () => {
  const w = SP.bucketWater({ R: 6, r: 4, H: 12, depth: 9 });
  expect(TEST.numbers).toEqual({ r: 4, R: 6, H: 12, depth: 9 });
  expect(LN.eq(w.apexBelowBottom, F(24))).toBe(true);
  expect(LN.eq(w.surfaceRadius, F(11, 2))).toBe(true);
  expect(LN.eq(w.k, F(8, 11))).toBe(true);
  expect(LN.eq(w.volume.k, F(819, 4))).toBe(true);
  expect(SP.roundTo(w.volume.number, 2)).toBe('643,24');
  expect(SP.roundTo(SP.cylinder(5, 9).volume.number, 2)).toBe('706,86');
  expect(SP.roundTo(w.bigCone.number * (1 - 8 / 11), 2)).toBe('285,10');
  expect(SP.roundTo(w.bigCone.number, 2)).toBe('1045,36');
  for (const lv of ['beginner', 'advanced']) {
    const f = BF.facts(LAB[lv].numbers);
    expect(LN.eq(f.k, F(8, 11))).toBe(false);
    expect(LN.eq(f.apex, F(24))).toBe(false);
  }
});
