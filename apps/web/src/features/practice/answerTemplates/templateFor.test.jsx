import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import '../../../i18n';
import { templateFor, templateValue, splitMath } from './templateFor';
import TemplateInput from './TemplateInput';

const r = (answerFormat, statement = 'سؤال', extra = {}) => ({ id: 'q', answerType: 'rational', answerFormat, statement, ...extra });

describe('templateFor — la saisie a la forme de la réponse (formats réels de la banque)', () => {
  it('une forme : le coefficient demandé devient une case, la forme est imprimée', () => {
    const t = templateFor(r('يُكتب $A$ على الشكل $ax + b$ : اكتب العدد $b$ فقط', 'العدد $b$ :'));
    expect(t).toMatchObject({ kind: 'form', subject: 'A', pre: 'ax + ', post: '', letter: 'b' });
    const t2 = templateFor(r('يُكتب $E$ على الشكل $ax^2 + bx + c$ : اكتب العدد $b$ فقط'));
    expect(t2).toMatchObject({ kind: 'form', pre: 'ax^2 + ', post: 'x + c' });
    expect(templateFor(r('اكتب على الشكل $a + b\\sqrt{2}$ : اكتب العدد $b$ فقط'))).toMatchObject({ kind: 'form', pre: 'a + ', post: '\\sqrt{2}' });
  });
  it('« … » dans la formule : la case prend sa place', () => {
    const t = templateFor(r('عدد', 'أتمم: $4{,}826 \\times \\ldots = 48{,}26$'));
    expect(t).toMatchObject({ kind: 'gap', before: 'أتمم: ', pre: '4{,}826 \\times ', post: ' = 48{,}26' });
  });
  it('l’exposant n : la case est surélevée à la place de n', () => {
    const t = templateFor(r('الأسّ $n$ (عدد صحيح نسبي)', '$1\\ \\mathrm{km} = 10^{n}\\ \\mathrm{mm}$'));
    expect(t).toMatchObject({ kind: 'gap', raised: true, signed: true });
  });
  it('un trou au milieu d’un groupe {…} ne coupe pas la formule', () => {
    expect(templateFor(r('عدد', '$\\dfrac{\\ldots}{5} = 2$')).kind).not.toBe('gap');
  });
  it('fraction, pourcentage, unité, valeur de x, chiffre, naturel, relatif, décimal', () => {
    expect(templateFor(r('كسر غير قابل للاختزال'))).toMatchObject({ kind: 'fraction', irreducible: true });
    expect(templateFor(r('النسبة المئوية (بدون الرمز %)')).kind).toBe('percent');
    expect(templateFor(r('عدد بالدينار (دج)'))).toMatchObject({ kind: 'quantity', unit: 'دج' });
    expect(templateFor(r('عدد بالسنتيمتر'))).toMatchObject({ kind: 'quantity', unit: 'cm' });
    expect(templateFor(r('عدد بالمتر (m)'))).toMatchObject({ kind: 'quantity', unit: 'm' });
    expect(templateFor(r('عدد صحيح: قيمة $x$ (قد يكون سالبًا)'))).toMatchObject({ kind: 'solution', letter: 'x' });
    expect(templateFor(r('رقم واحد')).kind).toBe('digit');
    expect(templateFor(r('عدد عشري برقم واحد بعد الفاصلة')).kind).toBe('decimal');
    expect(templateFor(r('عدد طبيعي')).kind).toBe('natural');
    expect(templateFor(r('عدد العلب')).kind).toBe('natural');
    expect(templateFor(r('عدد نسبي')).kind).toBe('signed');
    expect(templateFor(r('عدد عشري (بالفاصلة)')).kind).toBe('decimal');
    expect(templateFor({ answerType: 'choice' })).toBeNull();
  });
});

describe('templateValue — ce que lit l’évaluateur', () => {
  it('fraction signée, entier quand le dénominateur est vide', () => {
    expect(templateValue({ kind: 'fraction' }, { num: '5', den: '6', negative: true })).toBe('-5/6');
    expect(templateValue({ kind: 'fraction' }, { num: '3', den: '', negative: false })).toBe('3');
    expect(templateValue({ kind: 'fraction' }, { num: '', den: '4' })).toBeNull();
  });
  it('espaces des milliers retirés, signe appliqué, « − » typographique lu', () => {
    expect(templateValue({ kind: 'natural' }, { value: '12 500' })).toBe('12500');
    expect(templateValue({ kind: 'signed' }, { value: '4', negative: true })).toBe('-4');
    expect(templateValue({ kind: 'decimal' }, { value: '−2,5' })).toBe('-2,5');
  });
});

describe('TemplateInput — rendu', () => {
  const html = (q) => renderToStaticMarkup(<TemplateInput template={templateFor(q)} question={q} onChange={() => {}} />);
  it('chaque genre montre ses cases et jamais un « $ » brut', () => {
    const cases = [
      r('يُكتب $A$ على الشكل $ax + b$ : اكتب العدد $b$ فقط'),
      r('عدد', 'أتمم: $4{,}826 \\times \\ldots = 48{,}26$'),
      r('كسر على الشكل a/b'), r('النسبة المئوية'), r('عدد بالدينار (دج)'), r('عدد صحيح: قيمة $x$'),
      r('رقم واحد'), r('عدد طبيعي'), r('عدد نسبي'), r('عدد عشري (بالفاصلة)'),
    ];
    for (const q of cases) {
      const out = html(q);
      expect(out).toMatch(/data-template="/);
      expect(out).not.toContain('$');
    }
  });
  it('la fraction a deux cases et le signe ; l’unité est imprimée', () => {
    expect(html(r('كسر'))).toContain('data-template-box="den"');
    expect(html(r('كسر'))).toContain('data-template-sign');
    expect(html(r('عدد بالدينار (دج)'))).toContain('دج');
  });
});

describe('splitMath', () => {
  it('coupe texte et formules', () => {
    expect(splitMath('أتمم: $a$ و $b$')).toEqual([
      { math: false, text: 'أتمم: ' }, { math: true, text: 'a' }, { math: false, text: ' و ' }, { math: true, text: 'b' },
    ]);
  });
});
