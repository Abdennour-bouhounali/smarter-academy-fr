import ChoiceInput from './inputs/ChoiceInput';
import RationalInput from './inputs/RationalInput';
import AffineInput from './inputs/AffineInput';
import IntervalInput from './inputs/IntervalInput';
import PointInput from './inputs/PointInput';

/**
 * Une entrée par `answerType` que le contenu peut déclarer.
 *
 * Cette table est le pendant frontal de SUPPORTED_ANSWER_TYPES dans
 * packages/core/practice/answerEvaluator.js, et scripts/validate-exercises.mjs
 * refuse un contenu qui déclare un type absent de l'évaluateur. Ajouter une
 * forme de réponse, c'est donc : écrire le widget, l'inscrire ici, ajouter
 * son évaluateur. Aucune autre partie de l'application ne teste le type.
 *
 * Même patron que components/diagnostic/QuestionRenderer.jsx.
 */
const REGISTRY = {
  choice: ChoiceInput,
  multiChoice: ChoiceInput,
  rational: RationalInput,
  affine: AffineInput,
  interval: IntervalInput,
  point: PointInput,
};

export default function QuestionRenderer({ question, value, onChange, disabled }) {
  const Widget = REGISTRY[question.answerType];

  if (!Widget) {
    return (
      <p className="text-sm text-rose-600">
        Type de réponse non pris en charge ({question.answerType}).
      </p>
    );
  }

  return <Widget question={question} value={value} onChange={onChange} disabled={disabled} />;
}
