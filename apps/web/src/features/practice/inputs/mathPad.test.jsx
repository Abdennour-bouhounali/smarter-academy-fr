import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import '../../../i18n';
import { needsMathPad, padKeys } from './mathPad';
import RationalInput from './RationalInput';

const q = (answerFormat, extra = {}) => ({ id: 'q1', answerType: 'rational', answerFormat, ...extra });
const PAD = 'data-math-pad="true"';

describe('needsMathPad — quand la lettre est utile', () => {
  it('une fraction, un nombre rationnel ou relatif → oui', () => {
    expect(needsMathPad(q('كسر غير قابل للاختزال'))).toBe(true);
    expect(needsMathPad(q('عدد ناطق (عدد صحيح أو كسر)'))).toBe(true);
    expect(needsMathPad(q('عدد نسبي (يُقبل الكسر العشري)'))).toBe(true);
    expect(needsMathPad(q('اكتب العدد $a$ فقط (عدد صحيح، أو عشري بالفاصلة، أو كسر a/b)'))).toBe(true);
    expect(needsMathPad(q('عدد', { evaluationPolicy: { requiredForm: 'irreducible' } }))).toBe(true);
  });
  it('un entier, un décimal ou un QCM → non', () => {
    expect(needsMathPad(q('عدد طبيعي'))).toBe(false);
    expect(needsMathPad(q('عدد عشري، الفاصلة مقبولة'))).toBe(false);
    expect(needsMathPad({ answerType: 'choice', answerFormat: 'كسر' })).toBe(false);
  });
  it('la fraction en tête ; √ et la puissance seulement si la consigne les nomme', () => {
    expect(padKeys(q('كسر'))[0].id).toBe('frac');
    expect(padKeys(q('كسر')).some((k) => k.id === 'sqrt')).toBe(false);
    expect(padKeys(q('اكتب على شكل جذر')).some((k) => k.id === 'sqrt')).toBe(true);
    expect(padKeys(q('اكتب العدد على شكل قوة للعدد 2')).some((k) => k.id === 'power')).toBe(true);
  });
});

describe('RationalInput — la lettre fixe à côté du champ', () => {
  const html = (question, disabled = false) => renderToStaticMarkup(
    <RationalInput question={question} value={null} onChange={() => {}} disabled={disabled} />,
  );
  it('montrée pour une fraction, avec la touche « كسر » et sans aucun $ visible', () => {
    const out = html(q('اكتب العدد $a$ فقط (عدد صحيح، أو عشري بالفاصلة، أو كسر a/b)'));
    expect(out).toContain(PAD);
    expect(out).toContain('data-pad-key="frac"');
    expect(out).not.toContain('$');
  });
  it('absente pour un entier', () => {
    expect(html(q('عدد طبيعي'))).not.toContain(PAD);
  });
  it('cachée quand la question est close', () => {
    expect(html(q('كسر'), true)).not.toContain(PAD);
  });
});
