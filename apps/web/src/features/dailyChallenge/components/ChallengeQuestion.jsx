import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import ExerciseStatement from '../../practice/ExerciseStatement';
import QuestionRenderer from '../../practice/QuestionRenderer';
import RichText from '../../practice/RichText';
import ArenaPanel from './ArenaPanel';
import ChallengeProgress from './ChallengeProgress';
import ChallengeTimer from './ChallengeTimer';
import AnswerFeedback from './AnswerFeedback';
import { canSubmit } from '../challengeModel';
import MathLabel from '../../../lessons/common/components/MathLabel';

/**
 * UNE question du défi, dans un cadre sans distraction : en haut la
 * position, les pastilles et le chronomètre ; au centre la question, en
 * grand, sur une carte claire (les mathématiques se lisent en noir sur
 * blanc) ; en bas UN bouton, à portée de pouce.
 *
 * Les widgets de réponse sont ceux du moteur d'exercices
 * (QuestionRenderer) : pas de second moteur, pas de second clavier.
 */
export default function ChallengeQuestion({
  current, answered, value, onChange, onSubmit, onNext, result, busy, isLast, error,
}) {
  const { t } = useTranslation('challenge');
  const reduce = useReducedMotion();
  const headingRef = useRef(null);
  const question = current.content?.question;
  const statement = current.content?.statement;

  // Nouvelle question : le focus va sur son titre (clavier, lecteur d'écran).
  useEffect(() => { if (!result) headingRef.current?.focus(); }, [current.position, result]);

  const ready = canSubmit(question, value) && !busy;

  return (
    <div className="space-y-3 pb-24 lg:pb-0" data-challenge-session>
      <ArenaPanel className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-space text-sm font-black tracking-wide text-slate-900" data-question-of>
            {t('session.question')} <span dir="ltr">{current.position}{'\u00A0/\u00A0'}{current.total}</span>
          </p>
          <div className="ms-auto"><ChallengeTimer startedAt={current.startedAt} serverNow={current.serverNow} receivedAt={current.receivedAt} frozenMs={result ? result.responseTimeMs : null} /></div>
        </div>
        <div className="mt-3"><ChallengeProgress total={current.total} answered={answered} current={result ? null : current.position} /></div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500"
            initial={false} animate={{ width: `${(answered.length / current.total) * 100}%` }} transition={{ duration: reduce ? 0 : 0.4 }} />
        </div>
      </ArenaPanel>

      <AnimatePresence mode="wait" initial={false}>
        <motion.article
          key={current.position}
          initial={reduce ? false : { opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? undefined : { opacity: 0, x: 24 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[28px] bg-white p-4 shadow-xl shadow-slate-200/60 ring-1 ring-slate-200 sm:p-7"
        >
          {current.learningPoint?.title && (
            <p className="mb-2 font-inter text-xs font-semibold text-nav-accent">{t('session.learningPoint')}: <MathLabel>{current.learningPoint.title}</MathLabel></p>
          )}
          {(statement?.content || statement?.formulas || statement?.table || statement?.figure) && (
            <div className="mb-4 rounded-2xl bg-slate-50 p-3 sm:p-4">
              <ExerciseStatement content={statement.content} visual={statement.visual} formulas={statement.formulas} table={statement.table} figure={statement.figure} />
            </div>
          )}
          {question?.lead && <p className="mb-1 text-lg text-slate-800"><RichText>{question.lead}</RichText></p>}
          <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold leading-relaxed text-slate-900 focus:outline-none sm:text-2xl">
            <RichText>{question?.statement ?? ''}</RichText>
          </h2>

          <form
            className="mt-5"
            onSubmit={(e) => { e.preventDefault(); if (result) onNext(); else if (ready) onSubmit(); }}
          >
            {question && <QuestionRenderer question={question} value={value} onChange={onChange} disabled={Boolean(result) || busy} />}

            {result && <div className="mt-5"><AnswerFeedback result={result} question={question} /></div>}
            {error && <p role="alert" className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm text-rose-800 ring-1 ring-rose-200">{error}</p>}

            {/* Le bouton : collé en bas sur téléphone et tablette, à portée de
                pouce — JUSTE AU-DESSUS de la barre de navigation mobile de
                l'espace élève (h-16, fixe jusqu'à lg). */}
            <div className="fixed inset-x-0 z-30 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:static lg:mt-6 lg:border-0 lg:bg-transparent lg:p-0"
              style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
              <button
                type="submit"
                disabled={result ? busy : !ready}
                className={`mx-auto flex min-h-[56px] w-full max-w-md items-center justify-center rounded-2xl px-6 font-space text-lg font-black transition focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${
                  result ? 'bg-nav-accent text-white hover:bg-[#3350c4] focus-visible:ring-indigo-300' : 'bg-gradient-to-r from-amber-300 to-orange-500 text-slate-950 focus-visible:ring-amber-200'
                }`}
                data-primary-action={result ? (isLast ? 'finish' : 'next') : 'check'}
              >
                {busy ? t('session.checking') : result ? (isLast ? t('session.finish') : t('session.next')) : t('session.check')}
              </button>
            </div>
          </form>
        </motion.article>
      </AnimatePresence>
    </div>
  );
}
