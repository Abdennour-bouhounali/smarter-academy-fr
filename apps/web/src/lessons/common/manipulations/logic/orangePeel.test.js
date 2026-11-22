import { describe, it, expect } from 'vitest';
import * as Q from '@smarter-academy/core/arithmetic/linear.js';
import * as L from './orangePeel';

/**
 * orange-peel — la logique sur les nombres de levels.js (مبتدئ R = 3 : 36π et 36π ; متقدم R libre puis l'exemple du
 * manuel R = 1,4 : 24,63 cm² au mm², 11,494 cm³ au mm³) et sur TOUT le domaine de R des deux niveaux (balayé, pas
 * échantillonné) : la peau couvre toujours exactement 4 disques, le jus s'arrête toujours aux 2/3 du verre.
 */
const all = (level) => { const rg = L.rangeFor(level); const out = []; for (let rt = rg.min; rt <= rg.max; rt += rg.step) out.push(rt); return out; };

describe('orange-peel — les grandeurs viennent de space.js', () => {
  it('R = 3 (مبتدئ) : 𝒜 = 36π, 𝒱 = 36π, le verre 54π, πR² = 9π', () => {
    expect(L.piTex(L.skin(30).k)).toBe('36\\pi');
    expect(L.piTex(L.juice(30).k)).toBe('36\\pi');
    expect(L.piTex(L.glass(30).volume.k)).toBe('54\\pi');
    expect(L.piTex(L.disc(30).k)).toBe('9\\pi');
  });
  it('R = 1,4 (معارف 2) : 7,84π ≈ 24,63 cm² au mm², 1372/375·π ≈ 11,494 cm³ au mm³', () => {
    expect(L.piTex(L.skin(14).k)).toBe('7{,}84\\pi');
    expect(L.piTex(L.juice(14).k)).toBe('\\frac{1372}{375}\\pi');
    const s = L.openBook({ ...L.init({ R: 5, level: 'advanced' }), areaOk: true, volumeOk: true });
    expect(L.bookValue(s, 'area', 2).rounded).toBe('24,63');
    expect(L.bookValue(s, 'volume', 3).rounded).toBe('11,494');
  });
  it.each(['beginner', 'advanced'])('%s : sur tout le domaine de R, peau = 4 disques et jus = 2/3 du verre (exact)', (level) => {
    for (const rt of all(level)) {
      expect(Q.eq(L.skinDiscs(rt), 4)).toBe(true);
      expect(Q.eq(L.juiceRatio(rt), Q.frac(2, 3))).toBe(true);
    }
  });
  it('le domaine : مبتدئ = 1 … 5 entiers (5 rayons), متقدم = 1,0 … 6,0 au dixième (51 rayons)', () => {
    expect(all('beginner').map(L.rText)).toEqual(['1', '2', '3', '4', '5']);
    expect(all('advanced')).toHaveLength(51);
    expect(L.rText(14)).toBe('1,4');
    expect(L.rTex(14)).toBe('1{,}4');
  });
});

describe('orange-peel — phase 1 : prédire, éplucher, écrire l’aire', () => {
  it('démarre sur une prédiction FAUSSE (2 disques), jamais sur la réponse', () => {
    const s = L.init({ R: 3 });
    expect(s.k).toBe(2);
    expect(s.phase).toBe('peel');
    expect(s.rt).toBe(30);
  });
  it('la prédiction est verrouillée dès que l’épluchage commence, et la peau ne revient pas seule', () => {
    let s = L.setK(L.init({ R: 3 }), 3);
    s = L.peelTo(s, 0.4);
    expect(L.canPredict(s)).toBe(false);
    expect(L.setK(s, 4).k).toBe(3);
    expect(L.peelTo(s, 0.2).p).toBe(0.4);
  });
  it('k = 3 : refusé, il reste de la peau pour UN disque ; k = 5 : un disque reste vide ; k = 4 : accepté', () => {
    let s = L.peelTo(L.setK(L.init({ R: 3 }), 3), 1);
    expect(s.last).toMatchObject({ kind: 'peelShort', ok: false, k: 3, R: '3' });
    expect(s.peeled.extra).toBe(1);
    expect(s.refusals).toBe(1);
    s = L.peelTo(L.setK(L.resetPeel(s), 5), 1);
    expect(s.last.kind).toBe('peelLong');
    expect(s.peeled.empty).toBe(1);
    s = L.peelTo(L.setK(L.resetPeel(s), 4), 1);
    expect(s.last).toMatchObject({ kind: 'peelOk', ok: true });
    expect(s.okPeelR).toEqual([30]);
  });
  it('les cartes de l’aire : πR² (un disque sur quatre), 2πR (une longueur), 4/3·πR³ (un volume — même NOMBRE 36π à R = 3) refusées ; 4πR² acceptée', () => {
    let s = L.peelTo(L.setK(L.init({ R: 3 }), 4), 1);
    expect(L.judgeAreaCard(30, 'disc')).toMatchObject({ kind: 'cardOneDisc', times: 4 });
    expect(L.judgeAreaCard(30, 'perimeter').kind).toBe('cardLength');
    expect(L.judgeAreaCard(30, 'ball')).toMatchObject({ kind: 'cardVolume', same: true });
    expect(L.judgeAreaCard(20, 'ball')).toMatchObject({ kind: 'cardVolume', same: false });
    s = L.pickAreaCard(s, 'perimeter');
    expect(s.areaOk).toBe(false);
    s = L.pickAreaCard(s, 'skin');
    expect(s.areaOk).toBe(true);
    expect(s.last.kind).toBe('cardAreaOk');
    // une fois écrite, l'aire ne se réécrit pas
    expect(L.pickAreaCard(s, 'disc')).toBe(s);
  });
  it('aucune carte avant une peau posée juste', () => {
    const s = L.peelTo(L.setK(L.init({ R: 3 }), 3), 1);
    expect(L.pickAreaCard(s, 'skin')).toBe(s);
  });
  it('changer R remet la peau et vide le verre, garde la prédiction et les acquis', () => {
    let s = L.peelTo(L.setK(L.init({ R: 3 }), 4), 1);
    s = L.pickAreaCard(s, 'skin');
    s = L.setR(s, 20);
    expect(s).toMatchObject({ rt: 20, p: 0, peeled: null, k: 4, areaOk: true });
    // مبتدئ : R entier (le pas est 1 cm)
    expect(L.setR(s, 27).rt).toBe(30);
    expect(L.setR(s, 99).rt).toBe(50);
  });
});

describe('orange-peel — phase 2 : marquer, presser, écrire le volume', () => {
  const ready = () => L.pickAreaCard(L.peelTo(L.setK(L.init({ R: 3 }), 4), 1), 'skin');
  it('le verre ne s’ouvre qu’après l’aire', () => {
    expect(L.openPour(L.init({ R: 3 })).phase).toBe('peel');
    expect(L.openPour(ready()).phase).toBe('pour');
  });
  it('la marque démarre à la moitié (fausse), au pas de 1/6 au niveau مبتدئ et 1/12 au niveau متقدم', () => {
    const s = L.openPour(ready());
    expect(s.m).toBe(6);
    expect(L.setMark(s, 7).m).toBe(8);
    const a = { ...s, level: 'advanced' };
    expect(L.setMark(a, 7).m).toBe(7);
  });
  it('marque 1/2 : le jus la dépasse (refus) ; 5/6 : il s’arrête dessous ; 2/3 : accepté', () => {
    let s = L.pourTo(L.openPour(ready()), 1);
    expect(s.last).toMatchObject({ kind: 'pourLow', ok: false });
    expect(L.piTex(s.poured.atMark.k)).toBe('27\\pi');
    expect(L.piTex(s.poured.ball.k)).toBe('36\\pi');
    s = L.pourTo(L.setMark(L.resetPour(s), 10), 1);
    expect(s.last.kind).toBe('pourHigh');
    s = L.pourTo(L.setMark(L.resetPour(s), 8), 1);
    expect(s.last).toMatchObject({ kind: 'pourOk', ok: true });
    expect(s.okPourR).toEqual([30]);
  });
  it('la marque est verrouillée pendant qu’on presse', () => {
    const s = L.pourTo(L.setMark(L.openPour(ready()), 8), 0.3);
    expect(L.setMark(s, 4).m).toBe(8);
  });
  it('les cartes du volume : 2πR³ (le verre plein), 4πR² (une aire — même nombre à R = 3), 3/4·πR³ refusées ; 4/3·πR³ acceptée', () => {
    expect(L.judgeVolumeCard(30, 'cylinder').kind).toBe('cardFullGlass');
    expect(L.judgeVolumeCard(30, 'skin')).toMatchObject({ kind: 'cardArea', same: true });
    expect(L.judgeVolumeCard(30, 'inverted').kind).toBe('cardCoef');
    expect(L.judgeVolumeCard(30, 'ball').kind).toBe('cardVolumeOk');
  });
});

describe('orange-peel — la découverte demande un contraste', () => {
  const both = (s) => {
    let t = L.pickAreaCard(L.peelTo(L.setK(L.resetPeel(s), 4), 1), 'skin');
    t = L.openPour(t);
    t = L.pickVolumeCard(L.pourTo(L.setMark(t, 8), 1), 'ball');
    return t;
  };
  it('tout juste du premier coup, à un seul rayon : pas encore (aucun contraste)', () => {
    const s = both(L.init({ R: 3 }));
    expect(s.areaOk && s.volumeOk).toBe(true);
    expect(L.discoveryReady(s)).toBe(false);
  });
  it('… puis la même peau réussie à un second rayon : la découverte s’ouvre', () => {
    let s = both(L.init({ R: 3 }));
    s = L.backToPeel(s);
    s = L.peelTo(L.setR(s, 20), 1);
    expect(s.last.kind).toBe('peelOk');
    expect(L.triedRadii(s)).toEqual([20, 30]);
    expect(L.discoveryReady(s)).toBe(true);
  });
  it('… ou un refus vu en chemin suffit', () => {
    let s = L.peelTo(L.setK(L.init({ R: 3 }), 3), 1);
    s = both(s);
    expect(L.discoveryReady(s)).toBe(true);
  });
});

describe('orange-peel — phase 3 (متقدم) : arrondir l’exemple du manuel', () => {
  const formal = () => {
    let s = L.init({ R: 5, level: 'advanced', example: '1,4', rounding: [2, 3] });
    s = L.pickAreaCard(L.peelTo(L.setK(s, 4), 1), 'skin');
    s = L.openPour(s);
    return L.pickVolumeCard(L.pourTo(L.setMark(s, 8), 1), 'ball');
  };
  it('n’existe pas au niveau مبتدئ', () => {
    const s = { ...formal(), level: 'beginner' };
    expect(L.openBook(s)).toBe(s);
  });
  it('R = 1,4 ; un chiffre après la virgule (0,1 cm² = 10 mm²) est refusé, deux acceptés ; puis trois pour le volume', () => {
    let s = L.openBook(formal());
    expect(s).toMatchObject({ phase: 'book', rt: 14 });
    expect(L.setR(s, 30).rt).toBe(14);
    s = L.checkRounding(s);
    expect(s.last).toMatchObject({ kind: 'roundCoarse', ok: false, digits: 1, rounded: '24,6', mm: 10 });
    s = L.checkRounding(L.setDigits(s, 3));
    expect(s.last).toMatchObject({ kind: 'roundFine', mm: 0.1 });
    s = L.checkRounding(L.setDigits(s, 2));
    expect(s.last).toMatchObject({ kind: 'roundOk', rounded: '24,63' });
    expect(s.book).toMatchObject({ areaOk: true, which: 'volume', digits: 1 });
    s = L.checkRounding(L.setDigits(s, 2));
    expect(s.last).toMatchObject({ kind: 'roundCoarse', mm: 10 });
    s = L.checkRounding(L.setDigits(s, 3));
    expect(s.last).toMatchObject({ kind: 'roundOk', rounded: '11,494' });
    expect(L.bookDone(s)).toBe(true);
  });
  it('la précision en mm : 10^(dim − d)', () => {
    expect(L.precisionInMm(2, 2)).toBe(1);
    expect(L.precisionInMm(3, 3)).toBe(1);
    expect(L.precisionInMm(2, 0)).toBe(100);
  });
});

describe('orange-peel — le dessin', () => {
  it('chaque disque se remplit à son tour ; la peau entière remplit exactement 4 disques', () => {
    expect([0, 1, 2, 3, 4].map((i) => L.discFill(0.5, i))).toEqual([1, 1, 0, 0, 0]);
    expect([0, 1, 2, 3, 4, 5].map((i) => L.discFill(1, i))).toEqual([1, 1, 1, 1, 0, 0]);
  });
  it('le rayon affiché croît avec R et reste borné ; les disques ne se chevauchent pas', () => {
    for (const level of ['beginner', 'advanced']) {
      const rs = all(level).map((rt) => L.displayRadius(rt, level));
      rs.slice(1).forEach((r, i) => expect(r).toBeGreaterThan(rs[i]));
      expect(Math.min(...rs)).toBeGreaterThan(0.5);
      expect(Math.max(...rs)).toBeLessThan(1.2);
    }
    for (const cols of [2, 3]) {
      const sl = L.discSlots(6, 1, cols);
      for (let i = 0; i < sl.length; i += 1) for (let j = i + 1; j < sl.length; j += 1) {
        expect(Math.hypot(sl[i][0] - sl[j][0], sl[i][1] - sl[j][1])).toBeGreaterThanOrEqual(2);
      }
      // aucun disque sur l'orange (centre 0, rayon 1)
      sl.forEach((p) => expect(Math.hypot(p[0], p[1])).toBeGreaterThan(2));
    }
  });
  it('le jus monte linéairement jusqu’aux 2/3', () => {
    expect(L.juiceLevel(0)).toBe(0);
    expect(L.juiceLevel(1)).toBeCloseTo(2 / 3, 12);
    expect(L.juiceLevel(0.5)).toBeCloseTo(1 / 3, 12);
  });
});
