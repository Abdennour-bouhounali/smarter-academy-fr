import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import '../../../i18n';
import { templateFor, templateValue, splitMath } from './templateFor';
import TemplateInput from './TemplateInput';

const r = (answerFormat, statement = 'Question', extra = {}) => ({ id: 'q', answerType: 'rational', answerFormat, statement, ...extra });

describe('templateFor — la saisie a la forme de la réponse (formats réels de la banque)', () => {
  it('une forme : le coefficient demandé devient une case, la forme est imprimée', () => {
    const t = templateFor(r('$A$ s’écrit sous la forme $ax + b$ : écris seulement le nombre $b$', 'Le nombre $b$ :'));
    expect(t).toMatchObject({ kind: 'form', subject: 'A', pre: 'ax + ', post: '', letter: 'b' });
    const t2 = templateFor(r('$E$ s’écrit sous la forme $ax^2 + bx + c$ : écris seulement le nombre $b$'));
    expect(t2).toMatchObject({ kind: 'form', pre: 'ax^2 + ', post: 'x + c' });
    expect(templateFor(r('Écris-le sous la forme $a + b\\sqrt{2}$ : écris seulement le nombre $b$'))).toMatchObject({ kind: 'form', pre: 'a + ', post: '\\sqrt{2}' });
  });
  it('« … » dans la formule : la case prend sa place', () => {
    const t = templateFor(r('Nombre', 'Complète : $4{,}826 \\times \\ldots = 48{,}26$'));
    expect(t).toMatchObject({ kind: 'gap', before: 'Complète : ', pre: '4{,}826 \\times ', post: ' = 48{,}26' });
  });
  it('l’exposant n : la case est surélevée à la place de n', () => {
    const t = templateFor(r('L’exposant $n$ (un entier relatif)', '$1\\ \\mathrm{km} = 10^{n}\\ \\mathrm{mm}$'));
    expect(t).toMatchObject({ kind: 'gap', raised: true, signed: true });
  });
  it('un trou au milieu d’un groupe {…} ne coupe pas la formule', () => {
    expect(templateFor(r('Nombre', '$\\dfrac{\\ldots}{5} = 2$')).kind).not.toBe('gap');
  });
  it('fraction, pourcentage, unité, valeur de x, chiffre, naturel, relatif, décimal', () => {
    expect(templateFor(r('Une fraction irréductible'))).toMatchObject({ kind: 'fraction', irreducible: true });
    expect(templateFor(r('Le pourcentage (sans le symbole %)')).kind).toBe('percent');
    expect(templateFor(r('Un nombre, en euros'))).toMatchObject({ kind: 'quantity', unit: '€' });
    expect(templateFor(r('Une durée en minutes'))).toMatchObject({ kind: 'quantity', unit: 'min' });
    expect(templateFor(r('Une aire en mètres carrés'))).toMatchObject({ kind: 'quantity', unit: 'm²' });
    expect(templateFor(r('Une longueur en millimètres'))).toMatchObject({ kind: 'quantity', unit: 'mm' });
    expect(templateFor(r('Un nombre, en centimètres'))).toMatchObject({ kind: 'quantity', unit: 'cm' });
    expect(templateFor(r('Une longueur (m)'))).toMatchObject({ kind: 'quantity', unit: 'm' });
    expect(templateFor(r('Un entier : la valeur de $x$ (elle peut être négative)'))).toMatchObject({ kind: 'solution', letter: 'x' });
    expect(templateFor(r('Un seul chiffre')).kind).toBe('digit');
    expect(templateFor(r('Un nombre décimal avec un seul chiffre après la virgule')).kind).toBe('decimal');
    expect(templateFor(r('Un nombre entier')).kind).toBe('natural');
    expect(templateFor(r('Un entier naturel')).kind).toBe('natural');
    expect(templateFor(r('Nombre de boîtes')).kind).toBe('natural');
    expect(templateFor(r('Un nombre relatif')).kind).toBe('signed');
    expect(templateFor(r('Un nombre entier relatif')).kind).toBe('signed');
    expect(templateFor(r('Un nombre décimal (avec une virgule)')).kind).toBe('decimal');
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
      r('$A$ s’écrit sous la forme $ax + b$ : écris seulement le nombre $b$'),
      r('Nombre', 'Complète : $4{,}826 \\times \\ldots = 48{,}26$'),
      r('Une fraction de la forme a/b'), r('Le pourcentage'), r('Un prix en euros'), r('La valeur de $x$'),
      r('Un seul chiffre'), r('Un nombre entier'), r('Un nombre relatif'), r('Un nombre décimal'),
    ];
    for (const q of cases) {
      const out = html(q);
      expect(out).toMatch(/data-template="/);
      expect(out).not.toContain('$');
    }
  });
  it('la fraction a deux cases et le signe ; l’unité est imprimée', () => {
    expect(html(r('Une fraction'))).toContain('data-template-box="den"');
    expect(html(r('Une fraction'))).toContain('data-template-sign');
    expect(html(r('Un prix en euros'))).toContain('€');
    expect(html(r('Un prix en euros'))).not.toMatch(/[\u0600-\u06FF]/);
  });
});

describe('splitMath', () => {
  it('coupe texte et formules', () => {
    expect(splitMath('Complète : $a$ et $b$')).toEqual([
      { math: false, text: 'Complète : ' }, { math: true, text: 'a' }, { math: false, text: ' et ' }, { math: true, text: 'b' },
    ]);
  });
});
