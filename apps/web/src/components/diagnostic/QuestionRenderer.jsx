import ChoiceQuestion from './questions/ChoiceQuestion';
import NumericQuestion from './questions/NumericQuestion';
import FractionQuestion from './questions/FractionQuestion';
import OrderingQuestion from './questions/OrderingQuestion';
import ClassificationQuestion from './questions/ClassificationQuestion';
import NumberLineQuestion from './questions/NumberLineQuestion';

// One entry per `representation` the backend can send (see
// AnswerChecker::check() for the server-side counterpart of this list).
// Adding a new question type is: add the widget, register it here — no
// branching logic anywhere else has to know the full set of types.
const REGISTRY = {
  choice: ChoiceQuestion,
  numeric: NumericQuestion,
  fraction: FractionQuestion,
  ordering: OrderingQuestion,
  classification: ClassificationQuestion,
  numberline: NumberLineQuestion,
};

export default function QuestionRenderer({ question, onChange, disabled }) {
  const Widget = REGISTRY[question.representation];

  if (!Widget) {
    return (
      <p className="text-sm text-rose-600 text-center">
        Type de question non pris en charge ({question.representation}).
      </p>
    );
  }

  return <Widget question={question} onChange={onChange} disabled={disabled} />;
}
