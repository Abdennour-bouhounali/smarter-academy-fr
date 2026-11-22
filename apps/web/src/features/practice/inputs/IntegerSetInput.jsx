import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import MathLabel from '../../../lessons/common/components/MathLabel';
import { mathToPlain } from '../../../utils/mathPlain';

/**
 * Un ENSEMBLE d'entiers naturels (« عيّن كل قواسم العدد 84 ») : l'élève tape
 * la liste, séparateurs libres (virgule, فاصلة عربية، فاصلة منقوطة، espace),
 * chiffres arabes acceptés. L'évaluateur (`integerSet`,
 * packages/core/practice/answerEvaluator.js) ignore l'ordre et les doublons,
 * et lit un sous-ensemble strict comme une réponse partielle.
 *
 * UN CHAMP QUI REVIENT À LA LIGNE, et non une ligne unique : la réponse
 * attendue peut être longue (« 1 ؛ 2 ؛ 3 ؛ 4 ؛ 5 ؛ 6 ؛ 10 ؛ 12 ؛ 15 ؛ 20 ؛
 * 30 ؛ 60 » — les douze diviseurs de 60). Sur un téléphone, une ligne unique
 * faisait défiler le texte hors du cadre : l'élève relisait sa réponse à
 * l'aveugle, et ne pouvait pas vérifier qu'il n'avait rien oublié. Le
 * `textarea` GRANDIT donc tout seul avec le contenu (la hauteur suit
 * `scrollHeight` à chaque frappe) au lieu de fuir en largeur : la réponse
 * entière reste lisible, quelle que soit sa longueur, sans que l'élève ait
 * à faire défiler quoi que ce soit. La validation reste le bouton
 * « تحقّق من إجابتي » : la page ne passe pas de `onEnter` aux champs, donc
 * on n'invente pas un raccourci qui n'existe nulle part ailleurs.
 */
export default function IntegerSetInput({ question, value, onChange, disabled }) {
  const { t } = useTranslation('student');
  const ref = useRef(null);
  const text = value?.value ?? '';

  // La hauteur SUIT le contenu. On remet `auto` d'abord pour que le champ
  // puisse aussi RÉTRÉCIR quand l'élève efface.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    // `scrollHeight` mesure la boîte de contenu ; le champ est en
    // `border-box`, donc sans les deux bordures il manque quelques pixels et
    // la dernière ligne reste coupée.
    const borders = el.offsetHeight - el.clientHeight;
    el.style.height = `${el.scrollHeight + borders}px`;
  }, [text]);

  return (
    <div className="w-full space-y-1.5">
      <textarea
        ref={ref}
        rows={2}
        dir="auto"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        value={text}
        aria-label={(question.answerFormat && mathToPlain(question.answerFormat)) || t('practice.integerSetAria')}
        placeholder={(question.answerFormat && mathToPlain(question.answerFormat)) || '1 ؛ 2 ؛ 3 ؛ …'}
        disabled={disabled}
        onChange={(e) => onChange({ value: e.target.value })}
        className={`w-full min-h-[76px] resize-y overflow-hidden rounded-xl border-2 px-3 py-2.5 text-start font-mono text-lg sm:text-xl leading-relaxed tabular-nums transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 ${
          disabled ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-slate-300 bg-white text-slate-800 focus:border-nav-accent'
        }`}
      />
      {question.answerFormat && <span className="block font-mono text-xs text-slate-500"><MathLabel>{question.answerFormat}</MathLabel></span>}
    </div>
  );
}
