import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as practice from '@smarter-academy/core/practice/index.js';
import { Feedback, ValidateButton } from '../components/LessonUI';
import { useKit } from '../kit/kitContext';
import MathText from '../components/MathText';

/**
 * Une réponse FRACTION (« اكتب الكسر على شكل غير قابل للاختزال »), évaluée par
 * le même évaluateur que le moteur de pratique (`rational`) avec la politique
 * `requiredForm: 'irreducible'` : une valeur juste mais non réduite (21/12 pour
 * 7/4) est une réponse PARTIELLE avec son message dédié — la tâche du manuel
 * est précisément la forme. Non bloquante, comme tout le kit.
 */
export default function FractionQuestion({ prompt, expected, explain, requireIrreducible = true, requires, solved = false, onAnswered }) {
  const { t } = useTranslation('lesson');
  const { react } = useKit();
  const [val, setVal] = useState('');
  const [result, setResult] = useState(null);
  void requires;
  const done = result !== null || solved;
  const check = () => {
    const evaluation = practice.evaluateAnswer({ value: val }, {
      id: 'frac', answerType: 'rational', expectedAnswer: expected, evaluationPolicy: requireIrreducible ? { requiredForm: 'irreducible' } : {},
    });
    react(evaluation.isCorrect);
    setResult(evaluation);
    onAnswered?.(evaluation.isCorrect);
  };
  const tone = !result || result.isCorrect ? 'ok' : result.outcome === 'partially_correct' ? 'hint' : 'ko';
  return (
    <div className="space-y-3">
      {prompt && <p className="text-sm font-semibold text-slate-700">{prompt}</p>}
      {!done ? (
        <div className="flex flex-wrap items-center gap-2">
          <input type="text" inputMode="text" dir="ltr" value={val} aria-label={t('textbook.fractionLabel')} placeholder="a/b"
            onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && val.trim()) check(); }}
            className="w-40 rounded-xl border-2 border-slate-300 bg-white px-3 py-2.5 text-center font-mono text-lg focus:border-blue-500 focus:outline-none" />
          <ValidateButton onClick={check} disabled={!val.trim()}>{t('question.validate')}</ValidateButton>
          <span className="text-xs text-slate-500">{t('textbook.fractionHint')}</span>
        </div>
      ) : (
        <Feedback tone={tone}>
          {result && !result.isCorrect && (
            <>{result.feedbackKey === 'notIrreducible' ? t('textbook.notIrreducible') : result.outcome === 'syntax_error' ? t('textbook.integerSetSyntax') : t('question.yourAnswer')} <span dir="ltr" className="font-mono">{val}</span>. {t('question.correctAnswer')} </>
          )}
          <span dir="ltr" className="font-mono font-bold">{expected}</span>
          {explain && <> — <MathText>{explain}</MathText></>}
        </Feedback>
      )}
    </div>
  );
}
