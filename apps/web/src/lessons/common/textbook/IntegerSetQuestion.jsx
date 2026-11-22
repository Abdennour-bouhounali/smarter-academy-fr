import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as practice from '@smarter-academy/core/practice/index.js';
import { Feedback, ValidateButton } from '../components/LessonUI';
import { useKit } from '../kit/kitContext';
import MathText from '../components/MathText';

/**
 * Une question dont la réponse est un ENSEMBLE d'entiers (« عيّن كل قواسم
 * العدد 84 ») — la forme fidèle de la tâche du manuel, que ni un QCM ni un
 * champ numérique ne rendent. Même politique que les questions du kit :
 * `onAnswered(isCorrect)` inconditionnel, correction toujours montrée,
 * jamais de boucle « réessaie ». Séparateurs et chiffres arabes acceptés.
 */
export default function IntegerSetQuestion({ prompt, expected, explain, requires, solved = false, onAnswered, xp = 10 }) {
  const { t } = useTranslation('lesson');
  const { react } = useKit();
  const [val, setVal] = useState('');
  const [result, setResult] = useState(null);
  void requires; // contrat d'audit, sans effet à l'exécution
  const done = result !== null || solved;

  const check = () => {
    const evaluation = practice.evaluateAnswer({ value: val }, { id: 'set', answerType: 'integerSet', expectedAnswer: expected });
    const ok = evaluation.isCorrect;
    react(ok);
    setResult(evaluation);
    onAnswered?.(ok);
  };
  void xp;
  const expectedText = [...expected].sort((a, b) => a - b).join(' ؛ ');

  return (
    <div className="space-y-3">
      {prompt && <p className="text-sm font-semibold text-slate-700">{prompt}</p>}
      {!done ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text" inputMode="text" dir="ltr" value={val} aria-label={t('textbook.integerSetLabel')}
            placeholder={t('textbook.integerSetPlaceholder')}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && val.trim()) check(); }}
            className="w-64 min-w-0 max-w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-2.5 font-mono text-base focus:border-blue-500 focus:outline-none"
          />
          <ValidateButton onClick={check} disabled={!val.trim()}>{t('question.validate')}</ValidateButton>
          <span className="text-xs text-slate-500">{t('textbook.integerSetHint')}</span>
        </div>
      ) : (
        <Feedback tone={result && !result.isCorrect ? (result.outcome === 'partially_correct' ? 'hint' : 'ko') : 'ok'}>
          {result && !result.isCorrect && (
            <>
              {result.outcome === 'partially_correct' ? t('textbook.integerSetPartial') : result.outcome === 'syntax_error' ? t('textbook.integerSetSyntax') : t('question.yourAnswer')}{' '}
              <span dir="ltr" className="font-mono">{val}</span>. {t('question.correctAnswer')}{' '}
            </>
          )}
          <span dir="ltr" className="font-mono font-bold">{expectedText}</span>
          {explain && <> — <MathText>{explain}</MathText></>}
        </Feedback>
      )}
    </div>
  );
}
