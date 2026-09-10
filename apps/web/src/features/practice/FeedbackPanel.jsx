import { Feedback } from '../../lessons/common/components/LessonUI';
import RichText from './RichText';

/**
 * Ce qu'on dit à l'élève après sa réponse.
 *
 * Jamais « Faux ». Quand l'évaluateur a reconnu une erreur de raisonnement
 * précise, c'est SON explication qui s'affiche — pas le message générique.
 * Et une réponse à moitié juste est nommée comme telle : « ton coefficient
 * directeur est bon » n'est ni un succès ni un échec.
 */
const TONE = {
  correct: 'ok',
  equivalent_correct: 'ok',
  partially_correct: 'info',
  incorrect: 'ko',
  syntax_error: 'info',
  abandoned: 'info',
};

const TITLE = {
  correct: 'Juste',
  equivalent_correct: 'Juste — et bien écrit autrement',
  partially_correct: 'À moitié',
  incorrect: 'Pas encore',
  syntax_error: 'Réponse illisible',
  abandoned: 'Question passée',
};

export default function FeedbackPanel({ evaluation, message }) {
  if (!evaluation) return null;

  return (
    <Feedback tone={TONE[evaluation.outcome] ?? 'info'}>
      <span className="font-bold">{TITLE[evaluation.outcome] ?? ''}</span>
      {message ? (
        <>
          {' — '}
          <RichText>{message}</RichText>
        </>
      ) : null}
    </Feedback>
  );
}
