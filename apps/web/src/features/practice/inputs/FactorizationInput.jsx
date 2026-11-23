import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import MathPad from './MathPad';
import { factorizationPadKeys } from './mathPad';
import { LazyExamMathField } from '../exam/math/lazy';
import MathLabel from '../../../lessons/common/components/MathLabel';
import { mathToPlain } from '../../../utils/mathPlain';

/**
 * Une DÉCOMPOSITION en produit de facteurs premiers (`answerType: 'factorization'`, 3e) — tapée dans sa forme : le
 * champ MathLive écrit les exposants EN HAUT pendant la frappe (`^` au clavier, la touche « aⁿ » de la lettre), « * »
 * et « x » deviennent « × ». La lettre fixe (« Clavier mathématique », EXERCISE_CONTRACT.md) est toujours là : × et la
 * puissance en tête, les chiffres, ⌫, ← → (→ sort de l'exposant).
 *
 * La valeur envoyée est le LaTeX du champ (`2^{3}\times3^{2}\times5`) : l'évaluateur (`factorization.js` et son
 * jumeau PHP) le lit tel quel, si bien que ce que l'élève voit est exactement ce qui est noté — un exposant qui
 * avale un « × » (`2^{3\times3}`) est illisible, jamais relu autrement.
 */
export default function FactorizationInput({ question, value, onChange, disabled }) {
  const { t } = useTranslation('student');
  const fieldRef = useRef(null);
  const formatPlain = question.answerFormat ? mathToPlain(question.answerFormat) : '';
  const label = formatPlain || t('practice.factorizationAria');

  return (
    <div
      className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-start"
      data-answer-box
      data-math-pad-answer
      data-factorization-answer
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div
          className="flex cursor-text items-center rounded-xl bg-white ring-1 ring-slate-300 focus-within:ring-2 focus-within:ring-nav-accent"
          onMouseUp={(e) => {
            const f = e.currentTarget.querySelector('math-field');
            if (f && document.activeElement !== f) f.focus();
          }}
        >
          <LazyExamMathField
            key={question.id}
            value={value?.latex ?? value?.value ?? ''}
            onChange={(latex) => onChange(latex.trim() ? { value: latex, latex } : null)}
            disabled={disabled}
            ariaLabel={label}
            placeholder={formatPlain ? `\\text{${formatPlain.replace(/[\\{}$]/g, '')}}` : ''}
            className="w-full sa-pad-mathfield"
            pad
            onReady={(field) => {
              fieldRef.current = field;
              // Une décomposition n'a pas d'inconnue : la lettre x y est le signe ×, comme « * ».
              try {
                field.inlineShortcuts = { ...field.inlineShortcuts, x: '\\times' };
              } catch {
                /* option absente */
              }
            }}
          />
        </div>
        {question.answerFormat && (
          <span className="text-sm text-slate-600" data-answer-format>
            <MathLabel>{question.answerFormat}</MathLabel>
          </span>
        )}
      </div>
      {!disabled && <MathPad keys={factorizationPadKeys()} getField={() => fieldRef.current} />}
    </div>
  );
}
