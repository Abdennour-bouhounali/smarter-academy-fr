import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, DoorOpen, Fuel, Home, Loader2, Rocket, Target, Timer, X } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import ExerciseStatement from '../../practice/ExerciseStatement';
import QuestionRenderer from '../../practice/QuestionRenderer';
import RichText from '../../practice/RichText';
import { canSubmit, correctAnswerText } from '../../dailyChallenge/challengeModel';
import { answerRefuel, fetchRefuel, markRefuelLeft } from '../../../services/madarService';
import { useLeaveDetector } from '../useLeaveDetector';
import RefuelTimer from './RefuelTimer';
import HeartsRow from './HeartsRow';
import MathLabel from '../../../lessons/common/components/MathLabel';

/**
 * « محطة التزوّد » — là où le jeu rejoint l'apprentissage.
 *
 * Une question à la fois, choisie par le serveur dans les كفاءات de l'élève
 * (celles à reprendre d'abord), servie SANS clé de réponse. Juste : un cœur,
 * qui bat dans la jauge. Faux : aucun cœur, la bonne réponse et une phrase
 * d'explication — puis une autre question. La question est sur une carte
 * BLANCHE (les mathématiques se lisent en noir sur blanc), au milieu de
 * l'espace sombre du jeu ; les widgets de réponse sont ceux du moteur
 * d'exercices (QuestionRenderer), pas un second clavier.
 *
 * `context="revive"` : on vient d'un crash sans cœur ; après une réponse
 * juste, « واصل الرحلة » reprend la partie là où elle s'était arrêtée.
 *
 * Intégrité (MADAR_GAME.md §5bis) — rendre l'aide extérieure coûteuse, sans
 * prétendre la prouver : un chronomètre (l'horloge du serveur ; à zéro, la
 * réponse part telle quelle), quitter la page pendant la question fait perdre
 * le cœur (signalé au serveur), coller dans le champ est bloqué. La règle est
 * dite AVANT de répondre, jamais découverte après.
 */
export default function RefuelStation({ context = 'base', hearts, maxHearts, audio, onHearts, onClose, onContinue, onPlay, canPlay }) {
  const { t } = useTranslation('madar');
  const { token } = useContext(AuthContext);
  const reduce = useReducedMotion();
  const [refuel, setRefuel] = useState(null);
  const [value, setValue] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState(null);
  const [error, setError] = useState(null);
  const [pulse, setPulse] = useState(null);
  const [left, setLeft] = useState(false);
  const [pasteBlocked, setPasteBlocked] = useState(false);
  const headingRef = useRef(null);
  const submitting = useRef(false);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    setValue(null);
    try {
      const data = await fetchRefuel(token);
      setRefuel({ ...data.refuel, receivedAt: Date.now() });
      setLeft(Boolean(data.refuel.left));
      setPasteBlocked(false);
      setBlocked(null);
      onHearts?.({ hearts: data.hearts });
    } catch (err) {
      if (err.reason) setBlocked(err.reason);
      else setError(err.message);
    } finally {
      setBusy(false);
    }
  }, [token, onHearts]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (refuel && !result) headingRef.current?.focus(); }, [refuel, result]);

  const question = refuel?.content?.question;
  const statement = refuel?.content?.statement;
  const ready = canSubmit(question, value) && !busy;

  // Quitter la page pendant la question : le serveur le sait tout de suite.
  useLeaveDetector(Boolean(refuel) && !result && !blocked, (awayMs) => {
    setLeft(true);
    if (refuel) markRefuelLeft(token, refuel.id, awayMs).catch(() => {});
  });

  // `force` : le temps est écoulé — la réponse part telle quelle (même vide).
  const submit = async (force = false) => {
    if ((!ready && !force) || submitting.current || result) return;
    submitting.current = true;
    setBusy(true);
    setError(null);
    try {
      const answer = canSubmit(question, value) ? value : null;
      const data = await answerRefuel(token, refuel.id, answer, left);
      setResult(data.result);
      onHearts?.({ hearts: data.hearts, refuel: data.refuel, unlocked: data.unlocked });
      if (data.result.heartsAwarded > 0) {
        setPulse(data.hearts - 1);
        audio?.heart();
      } else {
        audio?.wrong();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };

  const blockPaste = (e) => {
    e.preventDefault();
    setPasteBlocked(true);
  };

  const full = hearts >= maxHearts;
  const answerText = result ? correctAnswerText(question, result.reveal) : null;
  const correct = result?.isCorrect;
  const partial = result?.outcome === 'partially_correct';

  // Les gestes après le verdict, du plus utile au moins utile.
  const actions = [];
  if (result) {
    if (context === 'revive' && hearts > 0) actions.push({ key: 'continue', label: t('refuel.continueFlight'), icon: Rocket, onClick: onContinue, primary: true });
    if (!full) actions.push({ key: 'next', label: t('refuel.next'), icon: Fuel, onClick: load, primary: actions.length === 0 });
    if (context === 'base' && canPlay) actions.push({ key: 'play', label: t('refuel.play'), icon: Rocket, onClick: onPlay, primary: actions.length === 0 });
  }

  return (
    <div className="absolute inset-0 z-30 overflow-y-auto overscroll-contain bg-slate-950/70 backdrop-blur-md" data-madar-refuel={context}>
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-amber-300 to-orange-500 text-slate-950" aria-hidden="true"><Fuel size={22} /></span>
          <div className="min-w-0 flex-1">
            <h1 className="font-space text-lg font-black text-white sm:text-xl">{t('refuel.title')}</h1>
            <p className="truncate font-inter text-xs text-white/65">{context === 'revive' ? t('refuel.forRevive') : t('refuel.subtitle')}</p>
          </div>
          <HeartsRow hearts={hearts} max={maxHearts} size={20} pulseIndex={pulse} />
          <button type="button" onClick={onClose} aria-label={context === 'revive' ? t('crash.end') : t('refuel.backToBase')} className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/50">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-36 pt-5 sm:px-8 lg:pb-10">
        {blocked && (
          <div className="rounded-[28px] bg-white/[0.06] p-6 text-center text-white ring-1 ring-white/10" role="status">
            <p className="text-4xl" aria-hidden="true">{blocked === 'hearts_full' ? '🚀' : '🛰️'}</p>
            <p className="mt-2 font-space text-xl font-black">{t(`reasons.${blocked}`, { defaultValue: t('reasons.disabled') })}</p>
            <div className="mx-auto mt-5 grid max-w-sm gap-2">
              {blocked === 'hearts_full' && context === 'revive' && (
                <button type="button" onClick={onContinue} className="min-h-[56px] rounded-2xl bg-gradient-to-r from-amber-300 to-orange-500 font-space text-lg font-black text-slate-950">{t('refuel.continueFlight')}</button>
              )}
              {blocked === 'hearts_full' && context === 'base' && canPlay && (
                <button type="button" onClick={onPlay} className="min-h-[56px] rounded-2xl bg-gradient-to-r from-amber-300 to-orange-500 font-space text-lg font-black text-slate-950">{t('refuel.play')}</button>
              )}
              <button type="button" onClick={onClose} className="min-h-[52px] rounded-2xl bg-white/10 font-inter text-sm font-bold text-white ring-1 ring-white/15">{context === 'revive' ? t('crash.end') : t('refuel.backToBase')}</button>
            </div>
          </div>
        )}

        {!blocked && !refuel && (
          <p className="flex items-center justify-center gap-2 py-20 font-inter text-white/70" role="status"><Loader2 className="animate-spin" size={18} aria-hidden="true" /> {t('loading')}</p>
        )}

        {!blocked && refuel && (
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={refuel.id}
              initial={reduce ? false : { opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[28px] bg-white p-4 text-slate-900 shadow-[0_30px_80px_-20px_rgba(251,191,36,0.35)] ring-1 ring-white/50 sm:p-7"
            >
              <div className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-2.5 ring-1 ring-slate-200">
                <RefuelTimer servedAt={refuel.servedAt} serverNow={refuel.serverNow} receivedAt={refuel.receivedAt} timeLimitS={refuel.timeLimitS}
                  frozen={Boolean(result)} onExpire={() => submit(true)} />
                <p className="min-w-0 flex-1 font-inter text-xs leading-relaxed text-slate-600" data-refuel-rules>{t('refuel.rules')}</p>
              </div>
              {left && !result && (
                <p role="alert" className="mb-3 flex items-start gap-2 rounded-2xl bg-amber-50 p-3 font-inter text-sm text-amber-900 ring-1 ring-amber-200" data-refuel-left>
                  <DoorOpen size={18} className="mt-0.5 shrink-0" aria-hidden="true" /> {t('refuel.leftWarning')}
                </p>
              )}
              {refuel.learningPoint?.title && (
                <p className="mb-2 font-inter text-xs font-semibold text-indigo-600">{t('refuel.skill')}: <MathLabel>{refuel.learningPoint.title}</MathLabel></p>
              )}
              {statement?.content && (
                <div className="mb-4 rounded-2xl bg-slate-50 p-3 sm:p-4">
                  <ExerciseStatement content={statement.content} visual={statement.visual} formulas={statement.formulas} table={statement.table} figure={statement.figure} />
                </div>
              )}
              <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold leading-relaxed focus:outline-none sm:text-2xl">
                <RichText>{question?.statement ?? ''}</RichText>
              </h2>

              <form className="mt-5" onSubmit={(e) => { e.preventDefault(); if (!result) submit(); }}
                onPasteCapture={blockPaste} onDropCapture={blockPaste}>
                {question && <QuestionRenderer question={question} value={value} onChange={setValue} disabled={Boolean(result) || busy} />}
                {pasteBlocked && !result && <p className="mt-2 font-inter text-xs text-slate-500" role="status">{t('refuel.noPaste')}</p>}

                {result && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="status"
                    className={`mt-5 rounded-3xl border p-4 ${correct ? 'border-emerald-300 bg-emerald-50' : partial ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-slate-50'}`}
                    data-feedback={correct ? 'correct' : partial ? 'partial' : 'wrong'}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`grid h-11 w-11 place-items-center rounded-2xl ${correct ? 'bg-emerald-500 text-white' : partial ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {correct || partial ? <Check size={24} aria-hidden="true" /> : <X size={24} aria-hidden="true" />}
                      </span>
                      <p className="font-space text-xl font-black">
                        {correct ? (result.heartsAwarded > 0 ? t('refuel.correct', { n: result.heartsAwarded }) : t('refuel.correctNoHeart')) : partial ? t('refuel.partial') : result.outcome === 'abandoned' ? t('refuel.noAnswer') : t('refuel.wrong')}
                      </p>
                    </div>
                    {result.flag === 'timeout' && (
                      <p className="mt-2 flex items-center gap-1.5 font-inter text-sm font-semibold text-rose-700" data-flag="timeout"><Timer size={16} aria-hidden="true" /> {t('refuel.timedOut')}</p>
                    )}
                    {result.flag === 'left' && (
                      <p className="mt-2 flex items-center gap-1.5 font-inter text-sm font-semibold text-amber-800" data-flag="left"><DoorOpen size={16} aria-hidden="true" /> {t('refuel.leftResult')}</p>
                    )}
                    {!correct && !result.flag && <p className="mt-2 font-inter text-sm text-slate-600">{t('refuel.noHeart')}</p>}
                    {!correct && answerText && (
                      <div className="mt-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200" data-correct-answer>
                        <p className="font-inter text-xs font-semibold text-slate-500">{t('refuel.correctAnswer')}</p>
                        <p className="mt-1 text-lg font-bold"><RichText>{answerText}</RichText></p>
                      </div>
                    )}
                    {result.reveal?.explanation && (
                      <p className="mt-2 text-sm leading-relaxed text-slate-700">
                        <span className="font-semibold text-slate-500">{t('refuel.why')} </span>
                        <RichText>{result.reveal.explanation}</RichText>
                      </p>
                    )}
                  </motion.div>
                )}
                {error && <p role="alert" className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm text-rose-800 ring-1 ring-rose-200">{error}</p>}

                {/* Pourquoi CETTE question : la raison du sélecteur, dite vraie (jamais « à renforcer » pour une révision). */}
                {refuel.reason && (
                  <p className="mt-5 flex items-start gap-2 rounded-2xl bg-indigo-50 p-3 font-inter text-sm leading-relaxed text-indigo-900 ring-1 ring-indigo-100" data-refuel-reason={refuel.reason}>
                    <Target size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                    {t(`refuel.reason.${refuel.reason}`, { defaultValue: t('refuel.reason.review') })}
                  </p>
                )}

                {/* Les boutons : collés en bas sur téléphone, à portée de pouce ; dans la carte sur ordinateur. */}
                <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-slate-950/90 p-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur lg:static lg:mt-6 lg:border-0 lg:bg-transparent lg:p-0">
                  <div className="mx-auto flex max-w-3xl flex-col gap-2 lg:flex-row-reverse lg:justify-start">
                    {!result ? (
                      <button type="submit" disabled={!ready} data-action="check"
                        className="flex min-h-[58px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 to-orange-500 px-6 font-space text-lg font-black text-slate-950 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto lg:min-w-[220px]">
                        {busy ? <Loader2 size={20} className="animate-spin" aria-hidden="true" /> : null}
                        {busy ? t('refuel.checking') : t('refuel.check')}
                      </button>
                    ) : (
                      <>
                        {actions.map(({ key, label, icon: Icon, onClick, primary }) => (
                          <button key={key} type="button" onClick={onClick} disabled={busy} data-action={key}
                            className={primary
                              ? 'flex min-h-[58px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 to-orange-500 px-6 font-space text-lg font-black text-slate-950 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 lg:w-auto lg:min-w-[220px]'
                              : 'flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 font-inter text-sm font-bold text-white ring-1 ring-white/20 lg:w-auto lg:bg-slate-900 lg:text-white'}>
                            <Icon size={18} aria-hidden="true" className={Icon === Rocket ? '-scale-x-100' : ''} /> {label}
                          </button>
                        ))}
                        <button type="button" onClick={onClose} data-action="close" className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl px-5 font-inter text-sm font-bold text-white/80 ring-1 ring-white/15 lg:w-auto lg:text-slate-600 lg:ring-slate-200">
                          <Home size={16} aria-hidden="true" /> {context === 'revive' ? t('crash.end') : t('refuel.backToBase')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </form>
            </motion.article>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
