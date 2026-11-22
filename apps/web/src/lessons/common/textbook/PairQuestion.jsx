import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as practice from '@smarter-academy/core/practice/index.js';
import { Feedback, ValidateButton } from '../components/LessonUI';
import { useKit } from '../kit/kitContext';
import MathText from '../components/MathText';

/**
 * Une réponse THANIYYA — la ثنائية (x ; y) d'une jumla (« عيّن حل الجملة »), unité 5 « جمل معادلتين ».
 * Deux champs dans « ( … ; … ) », l'ordre du manuel (x d'abord), la rangée isolée `dir="ltr"` pour
 * qu'elle ne se lise jamais « ) y ; x ( » sous RTL. Évaluée par le MÊME évaluateur que le moteur de
 * pratique (`answerType: 'point'`) : fractions (a/b), décimaux à virgule et chiffres arabes acceptés ;
 * un seul nombre juste est une réponse PARTIELLE (« أحد العددين صحيح »), jamais un échec silencieux.
 *
 *   expected : { x: '13', y: '19' } (chaînes : '-1/2', '2,6'…)
 *   names    : les inconnues affichées (défaut ['x', 'y'] ; le manuel écrit aussi (a ; b) et (d ; t))
 *
 * Non bloquante, comme tout le kit : `onAnswered(isCorrect)` inconditionnel, correction montrée.
 */
export default function PairQuestion({ prompt, expected, explain, names = ['x', 'y'], requires, solved = false, onAnswered }) {
  const { t } = useTranslation('lesson');
  const { react } = useKit();
  const [val, setVal] = useState({ x: '', y: '' });
  const [result, setResult] = useState(null);
  void requires; // contrat d'audit, sans effet à l'exécution
  const done = result !== null || solved;
  const ready = val.x.trim() !== '' && val.y.trim() !== '';

  const check = () => {
    const evaluation = practice.evaluateAnswer({ x: val.x, y: val.y }, { id: 'pair', answerType: 'point', expectedAnswer: expected });
    react(evaluation.isCorrect);
    setResult(evaluation);
    onAnswered?.(evaluation.isCorrect);
  };
  const onKey = (e) => { if (e.key === 'Enter' && ready) check(); };
  const field = (k, i) => (
    <input type="text" inputMode="text" dir="ltr" value={val[k]} aria-label={t('textbook.pairField', { name: names[i] })} placeholder={names[i]}
      onChange={(e) => setVal((v) => ({ ...v, [k]: e.target.value }))} onKeyDown={onKey} data-pair-field={k}
      className="w-24 min-h-[44px] rounded-xl border-2 border-slate-300 bg-white px-2 py-2 text-center font-mono text-lg focus:border-blue-500 focus:outline-none" />
  );
  const tone = !result || result.isCorrect ? 'ok' : result.outcome === 'partially_correct' ? 'hint' : 'ko';
  const shown = (p) => <span dir="ltr" className="font-mono font-bold">({p.x} ; {p.y})</span>;

  return (
    <div className="space-y-3" data-pair-question>
      {prompt && <p className="text-sm font-semibold text-slate-700">{prompt}</p>}
      {!done ? (
        <div className="flex flex-wrap items-center gap-2">
          <div dir="ltr" className="flex items-center gap-1.5">
            <span className="font-mono text-xl text-slate-500">(</span>
            {field('x', 0)}
            <span className="font-mono text-xl text-slate-500">;</span>
            {field('y', 1)}
            <span className="font-mono text-xl text-slate-500">)</span>
          </div>
          <ValidateButton onClick={check} disabled={!ready}>{t('question.validate')}</ValidateButton>
          <span className="text-xs text-slate-500">{t('textbook.pairHint')}</span>
        </div>
      ) : (
        <Feedback tone={tone}>
          {result && !result.isCorrect && (
            <>{result.outcome === 'syntax_error' ? t('textbook.integerSetSyntax') : result.outcome === 'partially_correct' ? t('textbook.pairPartial') : t('question.yourAnswer')} {shown(val)}. {t('question.correctAnswer')} </>
          )}
          {shown(expected)}
          {explain && <> — <MathText>{explain}</MathText></>}
        </Feedback>
      )}
    </div>
  );
}
