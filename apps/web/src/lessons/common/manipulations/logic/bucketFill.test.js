import { describe, it, expect } from 'vitest';
import * as space from '@smarter-academy/core/arithmetic/space.js';
import * as LN from '@smarter-academy/core/arithmetic/linear.js';
import * as B from './bucketFill';
import { LEVELS } from '../levels';

/**
 * bucket-fill — la logique du seau sur les nombres de levels.js : le تحدّ du manuel (H = 35, eau à 28 cm ⇒ ρ = 19, SO = 105,
 * k = 15/19, V = 24388π/3 ≈ 25,54 L) et le gobelet de la plateforme (r = 3, R = 4, H = 6, plein ⇒ SO = 18, k = 3/4, V = 74π).
 */
const ADV = LEVELS['bucket-fill'].advanced.numbers;
const BEG = LEVELS['bucket-fill'].beginner.numbers;
const F = (n, d = 1) => LN.frac(n, d);

describe('bucket-fill — ce que dit space.js', () => {
  it('le تحدّ : ρ = 19, SO = 105, k = 15/19, V = 24388π/3 ≈ 25 539,1 cm³ ≈ 25,54 L', () => {
    const f = B.facts(ADV);
    expect(LN.eq(f.rho, F(19))).toBe(true);
    expect(LN.eq(f.apex, F(105))).toBe(true);
    expect(LN.eq(f.k, F(15, 19))).toBe(true);
    expect(LN.eq(f.volume.k, F(24388, 3))).toBe(true);
    expect(space.roundTo(f.volume.number, 1)).toBe('25539,1');
    expect(space.roundTo(f.litres, 2)).toBe('25,54');
    // V = V₁ − V₂ et V₂ = k³·V₁
    expect(LN.eq(f.big.k, F(48013, 3))).toBe(true);
    expect(LN.eq(f.small.k, F(7875))).toBe(true);
    expect(f.big.number - f.small.number).toBeCloseTo(f.volume.number, 6);
  });
  it('le gobelet (plein) : SO = 18, k = 3/4, V = 74π', () => {
    const f = B.facts(BEG);
    expect(LN.eq(f.rho, F(4))).toBe(true);
    expect(LN.eq(f.apex, F(18))).toBe(true);
    expect(LN.eq(f.k, F(3, 4))).toBe(true);
    expect(LN.eq(f.volume.k, F(74))).toBe(true);
  });
  it('la surface de l’eau suit le bord (Thalès) à tout niveau', () => {
    for (let d = 0; d <= ADV.H; d += 1) {
      const rho = B.surfaceRadiusAt(ADV, d);
      expect(LN.toNumber(rho)).toBeCloseTo(15 + (5 * d) / 35, 12);
    }
    expect(LN.eq(B.surfaceRadiusAt(ADV, 28), F(19))).toBe(true);
  });
});

describe('bucket-fill — phase 1 : le niveau', () => {
  it('part d’un niveau qui n’est pas celui de la وضعية, refuse un mauvais niveau avec l’écart au bord', () => {
    let s = B.init(ADV);
    expect(s.phase).toBe('level');
    expect(s.level).not.toBe(ADV.depth);
    s = B.fixLevel(s);
    expect(s.last.kind).toBe('levelKo');
    expect(s.last.want).toBe(7);
    expect(s.last.gap).toBe(35 - s.level);
    expect(B.canOpenApex(s)).toBe(false);
    expect(B.openPhase(s, 'apex').phase).toBe('level');
  });
  it('7 cm au-dessus du FOND est le piège de lecture : refusé en le nommant', () => {
    const s = B.fixLevel(B.setLevel(B.init(ADV), 7));
    expect(s.last).toMatchObject({ kind: 'levelKo', fromBottom: true, d: 7 });
  });
  it('28 cm de profondeur (7 cm sous le bord) est accepté ; bouger l’eau défait le niveau', () => {
    let s = B.fixLevel(B.setLevel(B.init(ADV), 28));
    expect(s.last.kind).toBe('levelOk');
    expect(s.levelOk).toBe(true);
    expect(B.setLevel(s, 27).levelOk).toBe(false);
    s = B.openPhase(s, 'apex');
    expect(s.phase).toBe('apex');
  });
  it('le niveau reste entre le fond et le bord', () => {
    expect(B.setLevel(B.init(ADV), 99).level).toBe(35);
    expect(B.setLevel(B.init(ADV), -4).level).toBe(0);
    expect(B.setLevel(B.init(BEG), 6.4).level).toBe(6);
  });
});

describe('bucket-fill — phase 2 : le sommet S', () => {
  const atApex = (nums) => B.openPhase(B.fixLevel(B.setLevel(B.init(nums), nums.depth)), 'apex');
  it.each([[ADV, 105], [BEG, 18]])('la génératrice ne passe par le bord que pour SO exact (balayage de toute la plage)', (nums, exact) => {
    const { lo, hi, start } = B.apexRange(nums);
    expect(lo < exact && exact < hi).toBe(true);
    expect(start).not.toBe(exact);
    for (let a = lo; a <= hi; a += 1) {
      const v = B.apexVerdict(nums, a);
      expect(v.kind).toBe(a === exact ? 'ok' : a < exact ? 'wide' : 'narrow');
    }
  });
  it('S trop haut est refusé : la droite arrive trop loin du bord (r·(a + H)/a > R)', () => {
    let s = atApex(ADV);
    s = B.commitApex(B.setApex(s, 70));
    expect(s.last).toMatchObject({ kind: 'apexKo', dir: 'wide', a: 70 });
    expect(s.last.reach).toBeCloseTo((15 * 105) / 70, 9);
    expect(B.canOpenVolume(s)).toBe(false);
    s = B.commitApex(B.setApex(s, 140));
    expect(s.last.dir).toBe('narrow');
    s = B.commitApex(B.setApex(s, 105));
    expect(s.last.kind).toBe('apexOk');
    expect(B.canOpenVolume(s)).toBe(true);
    expect(B.setApex(s, 104).apexOk).toBe(false);
  });
});

describe('bucket-fill — phase 3 : les cartes', () => {
  const atVolume = (nums) => {
    let s = B.openPhase(B.fixLevel(B.setLevel(B.init(nums), nums.depth)), 'apex');
    s = B.commitApex(B.setApex(s, LN.toNumber(B.facts(nums).apex)));
    return B.openPhase(s, 'volume');
  };
  it('une seule carte donne le volume, les autres sont de vraies formules FAUSSES (le تحدّ)', () => {
    const c = Object.fromEntries(B.cards(ADV).map((x) => [x.id, x]));
    expect(B.CARD_IDS[0]).not.toBe('k3');
    expect(c.k3.ok).toBe(true);
    expect(['k', 'avg', 'cyl'].every((id) => !c[id].ok)).toBe(true);
    expect(LN.eq(c.k.value.k, F(192052, 57))).toBe(true);           // V₁(1 − 15/19)
    expect(LN.eq(c.avg.value.k, F(8092))).toBe(true);                // π·28·17²
    expect(LN.eq(c.cyl.value.k, F(10108))).toBe(true);               // π·19²·28
    expect(space.roundTo(c.avg.value.number, 1)).toBe('25421,8');    // proche, mais pas le volume
  });
  it('le gobelet : 74π contre 32π, 73,5π, 96π', () => {
    const c = Object.fromEntries(B.cards(BEG).map((x) => [x.id, x]));
    expect(LN.eq(c.k3.value.k, F(74))).toBe(true);
    expect(LN.eq(c.k.value.k, F(32))).toBe(true);
    expect(LN.eq(c.avg.value.k, F(147, 2))).toBe(true);
    expect(LN.eq(c.cyl.value.k, F(96))).toBe(true);
  });
  it('une carte fausse est refusée avec sa valeur ; la découverte demande le sommet, la bonne carte ET un contraste', () => {
    let s = atVolume(ADV);
    s = B.pickCard(s, 'k');
    expect(s.last).toMatchObject({ kind: 'cardKo', id: 'k' });
    expect(s.last.right).toBeCloseTo((24388 * Math.PI) / 3, 6);
    expect(B.discoveryReady(s)).toBe(false);
    s = B.pickCard(s, 'k3');
    expect(s.last.kind).toBe('cardOk');
    expect(B.discoveryReady(s)).toBe(true);
    // une fois trouvé, plus de choix
    expect(B.pickCard(s, 'avg')).toBe(s);
  });
  it('sans aucun refus, pas de découverte (le contraste manque)', () => {
    let s = B.init(BEG);
    s = B.fixLevel(B.setLevel(s, 6));
    s = B.commitApex(B.setApex(B.openPhase(s, 'apex'), 18));
    s = B.pickCard(B.openPhase(s, 'volume'), 'k3');
    expect(s.refusals).toBe(0);
    expect(B.discoveryReady(s)).toBe(false);
  });
  it('la preuve pour la leçon est un objet de nombres ; on peut revenir en arrière sans rien perdre', () => {
    let s = atVolume(BEG);
    s = B.pickCard(s, 'avg');
    expect(B.evidenceOf(s)).toMatchObject({ kind: 'cardKo', id: 'avg' });
    const back = B.openPhase(s, 'level');
    expect(back.phase).toBe('level');
    expect(back.apexOk && back.levelOk).toBe(true);
  });
  it('la figure de repli est une SpaceFigure sans cote calculée', () => {
    const fig = B.fallbackFigure(ADV, 14, 'دلو');
    expect(fig.kind).toBe('space');
    expect(JSON.stringify(fig)).not.toMatch(/19|105|24388/);
  });
});
