import { useTranslation } from 'react-i18next';
import { TONE_STYLE } from './toneStyle';

/**
 * OÙ SUIS-JE DANS CET EXERCICE ? — l'en-tête de la carte de la question.
 *
 *   السؤال 2 من 3                              التمرين 1 من 2
 *   ▰▰▰▰▰▰▰ ▰▰▰▰▰▰▰ ▱▱▱▱▱▱▱       ← UNE case par question RÉELLE de l'exercice
 *
 * Deuxième passe (2026-09-24) : la bande vit dans l'en-tête de la carte
 * courante — là où l'élève regarde — et nulle part ailleurs. « من N » est le
 * nombre de questions DE CET EXERCICE (`exercise.questions.length`), jamais un
 * nombre supposé commun : un exercice en compte 2, un autre 5. Chaque segment
 * d'une question faite prend la tonalité de son issue (`toneStyle.jsx`).
 *
 * Le titre « السؤال n من N » est le `h2` de la carte (focalisable, cible de
 * QuestionArrival). La phrase « ce qu'il reste » n'est plus affichée — la
 * barre le montre — mais reste lue par le lecteur d'écran (`aria-live`,
 * `sr-only`), en clés plurielles à six formes (« بقي سؤالان », pas « بقي 2
 * سؤال »).
 *
 * Pas de minuteur : la pratique entraîne, elle ne chronomètre pas.
 */
export default function SessionProgress({
  index, total, questionIndex = 0, questionTotal = 1, questionTones = [], currentTone = null,
  headingId, headingRef,
}) {
  const { t } = useTranslation('student');

  // Ce qu'il RESTE, jamais négatif : l'élève est sur la question courante.
  const questionsLeft = Math.max(0, questionTotal - questionIndex - 1);
  const exercisesLeft = Math.max(0, total - index - 1);
  const questionsNote = questionsLeft === 0
    ? t('practice.progress.lastQuestion')
    : t('practice.progress.remainingQuestions', { count: questionsLeft });
  const exercisesNote = exercisesLeft === 0
    ? t('practice.progress.lastExercise')
    : t('practice.progress.remainingExercises', { count: exercisesLeft });

  const segmentClass = (i) => {
    if (i < questionIndex) return TONE_STYLE[questionTones[i] ?? 'correct'].segment;
    if (i === questionIndex) return currentTone ? TONE_STYLE[currentTone].segment : 'bg-nav-accent';

    return 'bg-indigo-100';
  };

  return (
    <div
      data-session-progress
      data-exercise-index={index}
      data-question-index={questionIndex}
      className="space-y-2"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className="rounded-md text-base font-bold text-indigo-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          data-question-position
        >
          {t('practice.progress.questionOfShort', { current: questionIndex + 1, total: questionTotal })}
        </h2>
        <span className="text-sm font-semibold text-slate-600" data-exercise-position>
          {t('practice.progress.exerciseOf', { current: index + 1, total })}
        </span>
      </div>

      {questionTotal > 1 && (
        <div className="flex gap-1" aria-hidden="true" data-question-segments>
          {Array.from({ length: questionTotal }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 motion-reduce:transition-none ${segmentClass(i)}`}
            />
          ))}
        </div>
      )}

      <p className="sr-only" aria-live="polite" data-remaining>
        {questionTotal > 1 ? `${questionsNote} · ` : ''}{exercisesNote}
      </p>
    </div>
  );
}
