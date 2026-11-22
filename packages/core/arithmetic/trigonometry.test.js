import { describe, it, expect } from 'vitest';
import { frac } from './linear.js';
import {
  surd, sqrt, square, surdMul, surdDiv, surdNumber, surdEq, surdCmp, surdLatex, surdText, isRational,
  sides, ratioExact, pythagoras, isRightTriangle, isPossible, fromRatio, pythagoreanIdentity, SPECIAL,
  ratioLinking, lengthPlan, lengthByAngle, anglePlan,
  sinDeg, cosDeg, tanDeg, asinDeg, acosDeg, atanDeg, angleDeg, roundTo, truncateTo, screen,
  keysForRatio, keysForAngle, keysForLength, heightByElevation, ratioRad, angleRad,
} from './trigonometry.js';

const t = (x) => surdText(x);

describe('trigonometry — surds', () => {
  it('normalise √12 = 2√3, 3/√13 = 3√13/13', () => {
    expect(t(sqrt(12))).toBe('2√3');
    expect(t(surdDiv(3, sqrt(13)))).toBe('3√13/13');
    expect(surdLatex(surdDiv(3, sqrt(13)))).toBe('\\dfrac{3\\sqrt{13}}{13}');
    expect(surdLatex(SPECIAL[60].sin)).toBe('\\dfrac{\\sqrt{3}}{2}');
    expect(surdLatex(surd('0,6'))).toBe('0{,}6');
    expect(t(sqrt('0,84'))).toBe('√21/5');
    expect(isRational(sqrt(frac(16, 25)))).toBe(true);
    expect(square(surdMul(sqrt(2), sqrt(6)))).toEqual(frac(12));
    expect(surdEq(surdDiv(sqrt(3), 3), SPECIAL[30].tan)).toBe(true);
    expect(surdCmp(surd(frac(1, 2), 5), 1)).toBe(1); // √5/2 > 1 (تمرين 18)
    expect(surdNumber(sqrt(2))).toBeCloseTo(1.41421356, 7);
  });
});

describe('trigonometry — côtés et rapports exacts', () => {
  it('أستعدّ 4 : ABC قائم في A — الوتر [BC]، المقابل لـ C هو [AB]، المجاور [AC]', () => {
    expect(sides(['A', 'B', 'C'], 'A', 'C')).toEqual({ hypotenuse: 'BC', opposite: 'AB', adjacent: 'AC' });
    expect(sides(['A', 'B', 'C'], 'A', 'B')).toEqual({ hypotenuse: 'BC', opposite: 'AC', adjacent: 'AB' });
  });
  it('معارف 1 مثال : EFG قائم في G، FG = 3، GE = 2، EF = √13', () => {
    const EF = pythagoras({ a: 3, b: 2 });
    expect(t(EF)).toBe('√13');
    expect(t(ratioExact('sin', { opposite: 3, hypotenuse: EF }))).toBe('3√13/13');
    expect(t(ratioExact('cos', { adjacent: 2, hypotenuse: EF }))).toBe('2√13/13');
    expect(roundTo(surdNumber(ratioExact('sin', { opposite: 3, hypotenuse: EF })), 2)).toBe('0,83');
  });
  it('معارف 2 مثال : tan 30° = √3/3 (FG = 3, EF = 3√3), 0,58 ; tan 60° ≈ 1,73', () => {
    expect(surdEq(ratioExact('tan', { opposite: 3, adjacent: surd(3, 3) }), SPECIAL[30].tan)).toBe(true);
    expect(roundTo(tanDeg(30), 2)).toBe('0,58');
    expect(roundTo(tanDeg(60), 2)).toBe('1,73');
  });
  it('تمارين 1، 2، 4، 5، 12 : réciproque de Pythagore et rapports', () => {
    expect(isRightTriangle('7,8', '10,4', 13).right).toBe(true);
    expect(t(ratioExact('tan', { opposite: '10,4', adjacent: '7,8' }))).toBe('4/3');
    expect(isRightTriangle('10,5', 14, '17,5')).toEqual({ right: true, hypotenuseIndex: 2 });
    expect(isRightTriangle('3,5', '3,7', '1,2')).toEqual({ right: true, hypotenuseIndex: 1 });
    expect(t(ratioExact('cos', { adjacent: '3,5', hypotenuse: '3,7' }))).toBe('35/37');
    const KC = pythagoras({ a: 14, b: 17 });
    expect(t(KC)).toBe('√485');
    expect(t(ratioExact('tan', { opposite: 17, adjacent: 14 }))).toBe('17/14');
    expect(roundTo(surdNumber(ratioExact('sin', { opposite: 17, hypotenuse: KC })), 2)).toBe('0,77');
    expect(roundTo(surdNumber(ratioExact('cos', { adjacent: 14, hypotenuse: KC })), 2)).toBe('0,64');
    expect(isRightTriangle(3, 4, 5).right).toBe(true);
  });
  it('تمرين 13 : ACD قائم في D (3,4² + 2,55² = 4,25²) ; cos A = 0,8 → 37°', () => {
    expect(isRightTriangle('3,4', '2,55', '4,25').right).toBe(true);
    expect(roundTo(acosDeg(surdNumber(ratioExact('cos', { adjacent: '3,4', hypotenuse: '4,25' }))), 0)).toBe('37');
  });
  it('تمرين 8 : DE = 5,6 et FED ≈ 37°', () => {
    expect(t(pythagoras({ a: '4,2', hypotenuse: 7 }))).toBe('28/5');
    expect(roundTo(anglePlan({ opposite: '4,2', hypotenuse: 7 }).angle, 0)).toBe('37');
  });
});

describe('trigonometry — bornes et relations', () => {
  it('تمرين 10 : cos A = 1,5 est impossible ; تمرين 18 : sin = 3/2 et √5/2 impossibles', () => {
    expect(isPossible('cos', '1,5')).toEqual({ possible: false, reason: 'gt1' });
    expect(fromRatio('sin', '3/2')).toEqual({ possible: false, reason: 'gt1' });
    expect(fromRatio('sin', surd(frac(1, 2), 5)).possible).toBe(false);
    expect(isPossible('tan', '5,4').possible).toBe(true);
    expect(isPossible('sin', 1).reason).toBe('eq1');
    expect(isPossible('cos', 0).reason).toBe('le0');
  });
  it('طرائق ص 121 : cos x = 0,6 → sin x = 0,8, tan x = 4/3 ≈ 1,33', () => {
    const r = fromRatio('cos', '0,6');
    expect(surdLatex(r.sin)).toBe('0{,}8');
    expect(t(r.tan)).toBe('4/3');
    expect(roundTo(surdNumber(r.tan), 2)).toBe('1,33');
    expect(pythagoreanIdentity(r.cos, r.sin)).toBe(true);
  });
  it('دوري الآن ص 121 : sin x = 0,4 → cos x = √21/5 ≈ 0,92 ; tan x ≈ 0,44', () => {
    const r = fromRatio('sin', '0,4');
    expect(t(r.cos)).toBe('√21/5');
    expect(roundTo(surdNumber(r.cos), 2)).toBe('0,92');
    expect(roundTo(surdNumber(r.tan), 2)).toBe('0,44');
  });
  it('تمارين 16، 17، 18 et la valeur par tan', () => {
    const a = fromRatio('cos', surd(frac(1, 2), 2));
    expect(t(a.sin)).toBe('√2/2'); expect(t(a.tan)).toBe('1');
    const b = fromRatio('sin', surd(frac(1, 2), 3));
    expect(t(b.cos)).toBe('1/2'); expect(roundTo(surdNumber(b.tan), 2)).toBe('1,73');
    const c = fromRatio('cos', '0,4');
    expect(t(c.sin)).toBe('√21/5'); expect(t(c.tan)).toBe('√21/2');
    const d = fromRatio('tan', '4/3');
    expect(t(d.cos)).toBe('3/5'); expect(t(d.sin)).toBe('4/5');
  });
  it('angles remarquables (تمارين 19, 30) vérifient l’identité', () => {
    for (const a of [30, 45, 60]) {
      const { cos, sin, tan } = SPECIAL[a];
      expect(pythagoreanIdentity(cos, sin)).toBe(true);
      expect(surdEq(surdDiv(sin, cos), tan)).toBe(true);
      expect(surdNumber(cos)).toBeCloseTo(cosDeg(a), 12);
    }
  });
});

describe('trigonometry — choisir le rapport', () => {
  it('lengthPlan : les six cas', () => {
    expect(ratioLinking('opposite', 'hypotenuse')).toBe('sin');
    expect(ratioLinking('opposite', 'opposite')).toBe(null);
    expect(lengthPlan({ known: 'opposite', wanted: 'hypotenuse' })).toEqual({ ratio: 'sin', op: 'div' });
    expect(lengthPlan({ known: 'hypotenuse', wanted: 'adjacent' })).toEqual({ ratio: 'cos', op: 'mul' });
    expect(lengthPlan({ known: 'adjacent', wanted: 'opposite' })).toEqual({ ratio: 'tan', op: 'mul' });
    expect(lengthPlan({ known: 'opposite', wanted: 'adjacent' })).toEqual({ ratio: 'tan', op: 'div' });
  });
  it('طرائق ص 119 : BC ≈ 5,92 ; RS ≈ 2,8 ; FG ≈ 5,97', () => {
    expect(roundTo(lengthByAngle({ known: 'opposite', wanted: 'hypotenuse', length: '2,5', angle: 25 }), 2)).toBe('5,92');
    expect(screen(2.5 / sinDeg(25))).toBe('5,915503958');
    expect(roundTo(lengthByAngle({ known: 'hypotenuse', wanted: 'adjacent', length: '3,5', angle: 37 }), 1)).toBe('2,8');
    expect(roundTo(lengthByAngle({ known: 'adjacent', wanted: 'opposite', length: '4,5', angle: 53 }), 2)).toBe('5,97');
  });
  it('دوري الآن ص 119 : LM = 3√2 ≈ 4,2 ; PQ ≈ 0,9', () => {
    expect(t(surdMul(6, SPECIAL[45].cos))).toBe('3√2');
    expect(roundTo(lengthByAngle({ known: 'hypotenuse', wanted: 'adjacent', length: 6, angle: 45 }), 1)).toBe('4,2');
    expect(roundTo(lengthByAngle({ known: 'opposite', wanted: 'adjacent', length: '2,8', angle: 72 }), 1)).toBe('0,9');
  });
  it('تمارين 6, 9, 26, 27, 29 et تحدّ', () => {
    expect(roundTo(lengthByAngle({ known: 'hypotenuse', wanted: 'adjacent', length: 10, angle: 55 }), 2)).toBe('5,74');
    expect(roundTo(lengthByAngle({ known: 'hypotenuse', wanted: 'opposite', length: '5,2', angle: 23 }), 1)).toBe('2,0');
    expect(roundTo(lengthByAngle({ known: 'hypotenuse', wanted: 'opposite', length: 6, angle: 18 }), 1)).toBe('1,9');
    expect(roundTo(lengthByAngle({ known: 'hypotenuse', wanted: 'adjacent', length: 6, angle: 18 }), 1)).toBe('5,7');
    expect(roundTo(lengthByAngle({ known: 'opposite', wanted: 'adjacent', length: 9, angle: 32 }), 2)).toBe('14,40');
    expect(roundTo(lengthByAngle({ known: 'opposite', wanted: 'hypotenuse', length: 9, angle: 32 }), 1)).toBe('17,0');
    expect(roundTo(heightByElevation({ distance: 10, angle: 36 }), 1)).toBe('7,3');
    expect(roundTo(lengthByAngle({ known: 'opposite', wanted: 'hypotenuse', length: '1,6', angle: 59 }), 1)).toBe('1,9');
  });
  it('anglePlan : تمارين 7, 11, 15, 23, 24, 28', () => {
    expect(roundTo(anglePlan({ adjacent: 4, hypotenuse: '4,4' }).angle, 0)).toBe('25');
    expect(roundTo(anglePlan({ opposite: 2, adjacent: 5 }).angle, 1)).toBe('21,8');
    expect(anglePlan({ opposite: '8,4', hypotenuse: '10,5' }).ratio).toBe('sin');
    expect(roundTo(anglePlan({ opposite: '8,4', hypotenuse: '10,5' }).angle, 0)).toBe('53');
    expect(roundTo(anglePlan({ adjacent: 5, hypotenuse: 9 }).angle, 0)).toBe('56');
    expect(roundTo(anglePlan({ opposite: 3, hypotenuse: 5 }).angle, 0)).toBe('37');
    expect(roundTo(anglePlan({ opposite: '2,3', hypotenuse: '2,7' }).angle, 0)).toBe('58');
  });
});

describe('trigonometry — la calculatrice en mode RADIANS (le piège de معارف 3, lab trig-calculator)', () => {
  it('sin 30 en radians ≈ −0,988 ; cos 45 ≈ 0,525 ; tan 60 ≈ 0,320 — rien à voir avec 0,5 / 0,71 / 1,73', () => {
    expect(screen(ratioRad('sin', 30))).toBe('-0,9880316241');
    expect(roundTo(ratioRad('cos', 45), 3)).toBe('0,525');
    expect(roundTo(ratioRad('tan', 60), 3)).toBe('0,320');
  });
  it('sin⁻¹ 0,52 en radians ≈ 0,5469 (et non 31,33°) ; aller-retour exact', () => {
    expect(roundTo(angleRad('sin', 0.52), 4)).toBe('0,5469');
    expect(ratioRad('sin', angleRad('sin', 0.52))).toBeCloseTo(0.52, 12);
    expect(angleRad('tan', 1) * 4).toBeCloseTo(Math.PI, 12);
  });
});

describe('trigonometry — calculatrice et arrondis', () => {
  it('معارف 3 : sin 54° ≈ 0,81, cos 54° ≈ 0,59, tan 54° ≈ 1,38 ; écrans', () => {
    expect(roundTo(sinDeg(54), 2)).toBe('0,81');
    expect(roundTo(cosDeg(54), 2)).toBe('0,59');
    expect(roundTo(tanDeg(54), 2)).toBe('1,38');
    expect(screen(sinDeg(54))).toBe('0,8090169944');
    expect(keysForRatio('sin', 54)).toEqual(['ON', 'sin', '54', '=']);
  });
  it('معارف 3 مثال 2 : A ≈ 24°, B ≈ 17°', () => {
    expect(roundTo(asinDeg(0.4), 0)).toBe('24');
    expect(roundTo(atanDeg(0.3), 0)).toBe('17');
    expect(keysForAngle('tan', '0,3')).toEqual(['ON', '2nd', 'tan⁻¹', '0,3', '=']);
    expect(keysForLength({ length: '2,5', op: 'div', ratio: 'sin', angle: 25 })).toEqual(['ON', '2,5', '÷', 'sin', '25']);
  });
  it('نشاط 4 (2) : sin x = 0,52, cos x = 0,25, tan x = 1,33 aux trois précisions', () => {
    const s = angleDeg('sin', '0,52'); const c = angleDeg('cos', '0,25'); const tt = angleDeg('tan', '1,33');
    expect([roundTo(s, 0), roundTo(s, 1), roundTo(s, 2)]).toEqual(['31', '31,3', '31,33']);
    expect([roundTo(c, 0), roundTo(c, 1), roundTo(c, 2)]).toEqual(['76', '75,5', '75,52']);
    expect([roundTo(tt, 0), roundTo(tt, 1), roundTo(tt, 2)]).toEqual(['53', '53,1', '53,06']);
  });
  it('أستعدّ 2-3 : 1,267103 → 1 (وحدة) ; 1,3 (≠ 1,2) ; troncature 1,2', () => {
    expect(roundTo(1.267103, 0)).toBe('1');
    expect(roundTo(1.267103, 1)).toBe('1,3');
    expect(truncateTo(1.267103, 1)).toBe('1,2');
    expect(roundTo(2.795224285, 1)).toBe('2,8');
  });
  it('طرائق ص 121 إنشاء : sin x = 2/5 → 23,6° ; tan x = 7/3 → 66,8° ; تمارين 20-22', () => {
    expect(roundTo(angleDeg('sin', '2/5'), 1)).toBe('23,6');
    expect(roundTo(angleDeg('tan', '7/3'), 1)).toBe('66,8');
    expect(roundTo(angleDeg('cos', '0,18'), 0)).toBe('80');
    expect(roundTo(angleDeg('tan', '5,4'), 0)).toBe('80');
    expect(roundTo(angleDeg('sin', '3/5'), 1)).toBe('36,9');
    expect(roundTo(angleDeg('cos', '3/4'), 0)).toBe('41');
  });
});
