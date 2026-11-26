/** The quick quiz at the end of a revision page: the answer shows at once, nothing is recorded (REVISION_PAGE.md §3). */
import { useState } from 'react';
import MathText from '../../lessons/common/components/MathText';

const L = {
  score: 'Ton score',
  retry: 'Recommencer le quiz',
  all: 'Excellent ! Tu es prêt pour la leçon suivante.',
  good: 'Bien. Revois dans le résumé les questions que tu as manquées.',
  again: 'Relis le cours et les erreurs fréquentes, puis recommence le quiz.',
};

/** Three quarters right is « good ». */
const quizMessage = (correct, total) => (correct === total ? L.all : correct >= total * 0.75 ? L.good : L.again);

export default function RevisionQuiz({ questions }) {
  const [picked, setPicked] = useState({});
  const answered = Object.keys(picked).length;
  const correct = questions.filter((q, i) => picked[i] === q.correct).length;

  return (
    <div data-revision-quiz>
      {questions.map((q, i) => {
        const done = picked[i] !== undefined;
        return (
          <div key={q.q} className="rv-box">
            <p className="rv-concl">
              <bdi dir="ltr">{i + 1}</bdi>) <MathText>{q.q}</MathText>
            </p>
            <div className="rv-options">
              {q.options.map((option, j) => {
                const mark = !done ? '' : j === q.correct ? 'is-right' : j === picked[i] ? 'is-wrong' : '';
                return (
                  <button
                    key={option}
                    type="button"
                    className={mark}
                    disabled={done}
                    onClick={() => setPicked((p) => ({ ...p, [i]: j }))}
                    data-option={j}
                  >
                    <MathText>{option}</MathText>
                  </button>
                );
              })}
            </div>
            {done && (
              <p className="rv-why">
                <MathText>{q.why}</MathText>
              </p>
            )}
          </div>
        );
      })}
      {answered === questions.length && (
        <>
          <p className="rv-note" data-revision-score>
            {L.score} :{' '}
            <bdi dir="ltr">
              {correct}
              {'\u00a0/\u00a0'}
              {questions.length}
            </bdi>{' '}
            · {quizMessage(correct, questions.length)}
          </p>
          <button type="button" className="rv-btn" onClick={() => setPicked({})}>
            {L.retry}
          </button>
        </>
      )}
    </div>
  );
}
