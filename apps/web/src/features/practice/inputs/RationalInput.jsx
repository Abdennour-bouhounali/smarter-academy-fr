import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import AnswerField from './AnswerField';
import MathPad from './MathPad';
import { needsMathPad, padKeys } from './mathPad';
import { LazyExamMathField } from '../exam/math/lazy';
import MathLabel from '../../../lessons/common/components/MathLabel';
import { mathToPlain } from '../../../utils/mathPlain';

/**
 * MathLive rend l'ASCII-math (« 7/9 », « (7)/(9) », « 12{,}5 ») : on le ramène à
 * l'écriture que lit Rational.parse — sans parenthèses autour d'un nombre, la
 * virgule décimale, sans espaces.
 */
function asciiToAnswer(ascii) {
  return String(ascii ?? '')
    .replace(/\{,\}/g, ',')
    .replace(/\s+/g, '')
    .replace(/\((-?\d+(?:[.,]\d+)?)\)/g, '$1');
}

/**
 * Un nombre : entier, décimal à la virgule, ou fraction. `Rational.parse`
 * (packages/core/practice) accepte les trois, plus le vrai moins
 * typographique et l'espace fine des milliers.
 */
export default function RationalInput({ question, value, onChange, disabled, exam = false }) {
  const { t } = useTranslation('student');
  // La consigne de format peut porter une formule (« Écris seulement la valeur de $K$ ») : jamais
  // de dollars à l'écran — MathLabel pour le texte, mathToPlain pour les attributs.
  const formatPlain = question.answerFormat ? mathToPlain(question.answerFormat) : '';
  const fieldRef = useRef(null);
  // « Clavier mathématique » (conseil, 2026-11-09) : une réponse qui peut être une FRACTION s'écrit dans un
  // champ MathLive avec la lettre fixe À CÔTÉ — sur toutes les surfaces (Ma boussole, défi, Espace jeux, pratique,
  // copie d'examen), pas seulement la copie. À gauche du champ dès `lg` (RTL : bout de la ligne),
  // dessous en tablette portrait. Cachée quand la question est close (étape déjà répondue).
  if (needsMathPad(question)) {
    return (
      <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-start" data-answer-box data-math-pad-answer>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div
            className="flex cursor-text items-center rounded-xl bg-white ring-1 ring-slate-300 focus-within:ring-2 focus-within:ring-nav-accent"
            onMouseUp={(e) => { const f = e.currentTarget.querySelector('math-field'); if (f && document.activeElement !== f) f.focus(); }}
          >
            <LazyExamMathField
              key={question.id}
              value={value?.latex ?? value?.value ?? ''}
              onChange={(latex, ascii) => onChange(latex.trim() ? { value: asciiToAnswer(ascii), latex } : null)}
              disabled={disabled}
              ariaLabel={formatPlain || t('practice.field.answer')}
              placeholder={formatPlain ? `\\text{${formatPlain.replace(/[\\{}$]/g, '')}}` : ''}
              className="w-full sa-pad-mathfield"
              pad
              onReady={(field) => { fieldRef.current = field; }}
            />
          </div>
          {question.answerFormat && (
            <span className="text-sm text-slate-600" data-answer-format><MathLabel>{question.answerFormat}</MathLabel></span>
          )}
        </div>
        {!disabled && <MathPad keys={padKeys(question)} getField={() => fieldRef.current} />}
      </div>
    );
  }
  // Feuille d'examen : un champ MathLive (formule LTR, vraie fraction, clavier
  // virtuel). La valeur envoyée reste l'écriture lue par l'évaluateur.
  if (exam) {
    return (
      <div
        className="flex cursor-text items-center gap-3"
        data-answer-box
        onMouseUp={(e) => { const f = e.currentTarget.querySelector('math-field'); if (f && document.activeElement !== f) f.focus(); }}
      >
        <LazyExamMathField
          key={question.id}
          value={value?.latex ?? value?.value ?? ''}
          onChange={(latex, ascii) => onChange(latex.trim() ? { value: asciiToAnswer(ascii), latex } : null)}
          disabled={disabled}
          ariaLabel={formatPlain || t('practice.field.answer')}
          placeholder={formatPlain ? `\\text{${formatPlain.replace(/[\\{}$]/g, '')}}` : ''}
          className="w-full"
        />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 flex-wrap" data-answer-box>
      <AnswerField
        value={value?.value ?? ''}
        onChange={(v) => onChange({ value: v })}
        ariaLabel={formatPlain || t('practice.field.answer')}
        placeholder={formatPlain}
        width="min-w-[10rem]"
        disabled={disabled}
      />
      {question.answerFormat && (
        <span className="text-sm text-slate-500 font-mono" data-answer-format><MathLabel>{question.answerFormat}</MathLabel></span>
      )}
    </div>
  );
}
