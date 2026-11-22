import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, X, Zap } from 'lucide-react';
import RichText from '../../practice/RichText';
import { correctAnswerText, formatSeconds } from '../challengeModel';

/**
 * Le verdict d'une réponse, tel que le SERVEUR l'a rendu.
 *
 * Juste : « ✓ صحيح! », la base, le bonus de vitesse qui arrive un temps
 * après (l'effet qui récompense), le total. Faux : « ليس هذه المرّة »,
 * 0 point sans dramatiser, la bonne réponse et UNE phrase d'explication —
 * le défi n'est pas une leçon ; la remédiation vient ensuite, en pratique.
 *
 * Le titre reçoit le focus : le lecteur d'écran lit le verdict, et le
 * clavier repart de là vers « السؤال التالي ».
 */
export default function AnswerFeedback({ result, question }) {
  const { t } = useTranslation('challenge');
  const reduce = useReducedMotion();
  const headingRef = useRef(null);
  useEffect(() => { headingRef.current?.focus(); }, [result?.position]);
  if (!result) return null;

  const correct = result.isCorrect;
  const partial = result.outcome === 'partially_correct';
  const answerText = correctAnswerText(question, result.reveal);
  const pop = reduce ? {} : { initial: { opacity: 0, y: 8, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { type: 'spring', stiffness: 380, damping: 28 } };

  return (
    <motion.div {...pop} role="status" data-feedback={correct ? 'correct' : partial ? 'partial' : 'wrong'}
      className={`rounded-3xl border p-4 sm:p-5 ${correct ? 'border-emerald-300 bg-emerald-50' : partial ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-slate-50'}`}>
      <div className="flex flex-wrap items-center gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${correct ? 'bg-emerald-500 text-white' : partial ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
          {correct || partial ? <Check size={24} aria-hidden="true" /> : <X size={24} aria-hidden="true" />}
        </span>
        <h3 ref={headingRef} tabIndex={-1} className="font-space text-xl font-black text-slate-900 focus:outline-none">
          {correct ? t('feedback.correct') : partial ? t('feedback.partial') : t('feedback.wrong')}
        </h3>
        <span className="ms-auto font-mono-jetbrains text-xs text-slate-500" dir="ltr">{t('feedback.time', { seconds: formatSeconds(result.responseTimeMs) })}</span>
      </div>

      {result.score.total > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2" data-points>
          <span className="rounded-full bg-white px-3 py-1 font-mono-jetbrains text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">{t('feedback.accuracy', { n: result.score.base })}</span>
          {result.score.speed > 0 && (
            <motion.span
              initial={reduce ? false : { opacity: 0, scale: 0.6, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.25, type: 'spring', stiffness: 500, damping: 22 }}
              className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-3 py-1 font-mono-jetbrains text-sm font-black text-slate-950"
              data-speed-bonus
            >
              <Zap size={14} aria-hidden="true" /> {t('feedback.speed', { n: result.score.speed })}
            </motion.span>
          )}
          <span className="ms-auto font-space text-2xl font-black text-slate-900" dir="ltr">{t('feedback.total', { n: result.score.total })}</span>
        </div>
      ) : (
        <p className="mt-2 font-mono-jetbrains text-sm font-bold text-slate-500">{t('feedback.zero')}</p>
      )}

      {!correct && answerText && (
        <div className="mt-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200" data-correct-answer>
          <p className="font-inter text-xs font-semibold text-slate-500">{t('feedback.correctAnswer')}</p>
          <p className="mt-1 text-lg font-bold text-slate-900"><RichText>{answerText}</RichText></p>
        </div>
      )}
      {result.reveal?.explanation && (
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          <span className="font-semibold text-slate-500">{t('feedback.why')} </span>
          <RichText>{result.reveal.explanation}</RichText>
        </p>
      )}
    </motion.div>
  );
}
