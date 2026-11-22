import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import '../../../i18n';
import { needsMathPad, padKeys } from './mathPad';
import RationalInput from './RationalInput';

const q = (answerFormat, extra = {}) => ({ id: 'q1', answerType: 'rational', answerFormat, ...extra });
const PAD = 'data-math-pad="true"';

describe('needsMathPad — quand la lettre est utile', () => {
  it('une fraction, un nombre rationnel ou relatif → oui', () => {
    expect(needsMathPad(q('Une fraction irréductible'))).toBe(true);
    expect(needsMathPad(q('Un nombre rationnel (un entier ou une fraction)'))).toBe(true);
    expect(needsMathPad(q('Un nombre relatif (l’écriture décimale est acceptée)'))).toBe(true);
    expect(needsMathPad(q('Écris seulement le nombre $a$ (un entier, un décimal avec une virgule ou une écriture a/b)'))).toBe(true);
    expect(needsMathPad(q('Un nombre', { evaluationPolicy: { requiredForm: 'irreducible' } }))).toBe(true);
  });
  it('un entier, un décimal ou un QCM → non', () => {
    expect(needsMathPad(q('Un nombre entier'))).toBe(false);
    expect(needsMathPad(q('Un nombre décimal, la virgule est acceptée'))).toBe(false);
    expect(needsMathPad({ answerType: 'choice', answerFormat: 'Une fraction' })).toBe(false);
  });
  it('la fraction en tête ; √ et la puissance seulement si la consigne les nomme', () => {
    expect(padKeys(q('Une fraction'))[0].id).toBe('frac');
    expect(padKeys(q('Une fraction')).some((k) => k.id === 'sqrt')).toBe(false);
    expect(padKeys(q('Écris le résultat avec une racine carrée')).some((k) => k.id === 'sqrt')).toBe(true);
    expect(padKeys(q('Écris le nombre sous la forme d’une puissance de 2')).some((k) => k.id === 'power')).toBe(true);
  });
});

describe('RationalInput — la lettre fixe à côté du champ', () => {
  const html = (question, disabled = false) => renderToStaticMarkup(
    <RationalInput question={question} value={null} onChange={() => {}} disabled={disabled} />,
  );
  it('montrée pour une fraction, avec la touche « Fraction » et sans aucun $ visible', () => {
    const out = html(q('Écris seulement le nombre $a$ (un entier, un décimal avec une virgule ou une écriture a/b)'));
    expect(out).toContain(PAD);
    expect(out).toContain('data-pad-key="frac"');
    expect(out).not.toContain('$');
  });
  it('absente pour un entier', () => {
    expect(html(q('Un nombre entier'))).not.toContain(PAD);
  });
  it('cachée quand la question est close', () => {
    expect(html(q('Une fraction'), true)).not.toContain(PAD);
  });
});
