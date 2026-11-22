import { describe, it, expect } from 'vitest';
import { isolateMathRuns, isolateOutsideMath } from './bidi';

const L = '⁦';
const P = '⁩';

describe('isolateMathRuns — une égalité en clair reste lisible en RTL', () => {
  it('isole le titre signalé « معارف — 120 = 6 × 20 »', () => {
    expect(isolateMathRuns('معارف — 120 = 6 × 20')).toBe(`معارف — ${L}120 = 6 × 20${P}`);
  });

  it('isole une fraction, une soustraction, une division euclidienne', () => {
    expect(isolateMathRuns('معارف — 28/42')).toBe(`معارف — ${L}28/42${P}`);
    expect(isolateMathRuns('407 − 253 = 154')).toBe(`${L}407 − 253 = 154${P}`);
    expect(isolateMathRuns('65 = 56 × 1 + 9 ثم')).toBe(`${L}65 = 56 × 1 + 9${P} ثم`);
    expect(isolateMathRuns('العدد 7,5 = 15/2')).toBe(`العدد ${L}7,5 = 15/2${P}`);
  });

  it('ne lie pas deux nombres par « : », « — » ou « ، »', () => {
    expect(isolateMathRuns('السؤال 2 : 120')).toBe('السؤال 2 : 120');
    expect(isolateMathRuns('910 ، 1000')).toBe('910 ، 1000');
    expect(isolateMathRuns('تمرين 4 — 910')).toBe('تمرين 4 — 910');
  });

  it('laisse un nombre seul, un texte sans nombre, et est idempotent', () => {
    expect(isolateMathRuns('رف 12')).toBe('رف 12');
    expect(isolateMathRuns('بدون أرقام')).toBe('بدون أرقام');
    const once = isolateMathRuns('15 = 3 × 5');
    expect(isolateMathRuns(once)).toBe(once);
  });

  it('isole un nombre suivi de son unité — « 24 L » ne se lit plus « L 24 »', () => {
    expect(isolateMathRuns('سعة الدنّ الأول 24 L وسعة الثاني 18 L.')).toBe(`سعة الدنّ الأول ${L}24 L${P} وسعة الثاني ${L}18 L${P}.`);
    expect(isolateMathRuns('المساحة 7,5 cm²')).toBe(`المساحة ${L}7,5 cm²${P}`);
    expect(isolateMathRuns('240x')).toBe(`${L}240x${P}`);
    expect(isolateMathRuns('2 cm × 3 cm')).toBe(`${L}2 cm × 3 cm${P}`);
  });

  it('« x » entre deux nombres reste l’opérateur, pas une unité', () => {
    expect(isolateMathRuns('2 x 3 = 6')).toBe(`${L}2 x 3 = 6${P}`);
  });

  it('isole les écritures algébriques : « √a » ne s’affiche plus « a√ » (unité 2)', () => {
    expect(isolateMathRuns('حلين متعاكسين √a و −√a')).toBe(`حلين متعاكسين ${L}√a${P} و ${L}−√a${P}`);
    expect(isolateMathRuns('بكتابتها على الشكل x² = (√a)²')).toBe(`بكتابتها على الشكل ${L}x² = (√a)²${P}`);
    expect(isolateMathRuns('الدليل: √(a + b) ≠ √a + √b.')).toBe(`الدليل: ${L}√(a + b) ≠ √a + √b${P}.`);
    expect(isolateMathRuns('الرمز √')).toBe(`الرمز ${L}√${P}`);
    expect(isolateMathRuns('على الشكل a√b حيث b أصغر')).toBe(`على الشكل ${L}a√b${P} حيث b أصغر`);
    expect(isolateMathRuns('القيمة √5 ≈ 2,24 تقريبًا')).toBe(`القيمة ${L}√5 ≈ 2,24${P} تقريبًا`);
  });

  it('n’isole ni une lettre seule, ni un mot latin, ni un sigle', () => {
    expect(isolateMathRuns('حيث a عدد موجب')).toBe('حيث a عدد موجب');
    expect(isolateMathRuns('برمجية GeoGebra')).toBe('برمجية GeoGebra');
    expect(isolateMathRuns('PGCD')).toBe('PGCD');
  });

  it('isole une égalité littérale « a = b × q »', () => {
    expect(isolateMathRuns('بالمساواة a = b × q')).toBe(`بالمساواة ${L}a = b × q${P}`);
  });

  it('isole un nombre négatif seul : « −9 » ne s’affiche plus « 9− »', () => {
    expect(isolateMathRuns('x² = 25 ، 3 ، −9')).toBe(`${L}x² = 25${P} ، 3 ، ${L}−9${P}`);
  });

  it('isole un point « prime » : « B′ » et « (B′C′) » ne s’affichent plus à l’envers (unité 9)', () => {
    expect(isolateMathRuns('نقطتين B′ من (d) و C′ من (d′)')).toBe(`نقطتين ${L}B′${P} من (d) و ${L}C′${P} من ${L}(d′)${P}`);
    expect(isolateMathRuns('هل (BC) و (B′C′) متوازيان؟')).toBe(`هل (BC) و ${L}(B′C′)${P} متوازيان؟`);
    expect(isolateMathRuns('إذن (CF)//(AB) و (B′C′)//(BC).')).toBe(`إذن ${L}(CF)//(AB)${P} و ${L}(B′C′)//(BC)${P}.`);
    expect(isolateMathRuns('والنسبتان متساويتان: (MN)//(BC)')).toBe(`والنسبتان متساويتان: ${L}(MN)//(BC)${P}`);
  });

  it('reste idempotent sur une écriture algébrique', () => {
    const once = isolateMathRuns('العددان √a و −√a');
    expect(isolateMathRuns(once)).toBe(once);
  });
});

describe('isolateOutsideMath — les îles $…$ restent intactes', () => {
  it('isole le texte brut et laisse KaTeX tranquille', () => {
    expect(isolateOutsideMath('العدد √a و $\\sqrt{b}$')).toBe(`العدد ${L}√a${P} و $\\sqrt{b}$`);
    expect(isolateOutsideMath('$x^2 = a$ حلّان')).toBe('$x^2 = a$ حلّان');
  });
});
